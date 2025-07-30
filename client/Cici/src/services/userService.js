/**
 * 用户管理API服务
 * 处理用户认证、资料管理、家庭群组等API调用
 */

import { API_ENDPOINTS } from '../config/apiEndpoints.js'
import requestInstance from '../utils/request.js'
import { storage } from '../utils/storage.js'

// 创建request函数包装器
const request = (config) => requestInstance.request(config)

class UserService {
  constructor() {
    this.baseURL = 'http://localhost:3000' // 测试服务器地址
  }

  // ==================== 认证相关 ====================
  
  /**
   * 用户登录
   */
  async login(credentials) {
    try {
      console.log('🔐 开始登录请求:', credentials)
      
      const response = await request({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        data: credentials
      })
      
      console.log('🔐 登录请求响应:', response)
      
      // request工具返回的是完整的响应对象，需要从response.data中获取实际数据
      const actualData = response.data
      
      if (actualData && actualData.success && actualData.data) {
        // 后端成功响应的格式: {success: true, data: {user, tokens}, message}
        const userData = actualData.data
        
        if (userData.tokens) {
          // 保存令牌到本地存储 - 注意后端返回的字段名
          await storage.setToken(userData.tokens.accessToken, userData.tokens.refreshToken)
        }
        
        if (userData.user) {
          // 保存用户信息
          await storage.setUserInfo(userData.user)
        }
        
        // 返回成功响应，格式与login.vue期望的一致
        return {
          success: true,
          data: {
            user: userData.user,
            accessToken: userData.tokens.accessToken,
            refreshToken: userData.tokens.refreshToken
          },
          message: actualData.message || '登录成功'
        }
      } else {
        // 如果没有success字段或success为false，说明是失败响应
        // 但这种情况下request工具应该已经抛出异常了
        return {
          success: false,
          message: actualData?.error || actualData?.message || '登录失败'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      
      // 确保错误信息能够正确传递
      if (error.code && error.message) {
        // 如果错误对象已经有code和message，直接传递
        throw error
      } else {
        // 否则包装错误信息
        const wrappedError = new Error(error.message || '网络请求失败')
        wrappedError.code = error.code || 'UNKNOWN_ERROR'
        wrappedError.data = error.data
        throw wrappedError
      }
    }
  }

  /**
   * 用户注册
   */
  async register(userData) {
    try {
      const response = await request({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'POST',
        data: userData
      })
      
      if (response.success && response.data.tokens) {
        // 自动登录
        await storage.setToken(response.data.tokens.accessToken, response.data.tokens.refreshToken)
        await storage.setUserInfo(response.data.user)
      }
      
      return response
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  /**
   * OAuth登录
   */
  async oauthLogin(provider, oauthData) {
    try {
      const response = await request({
        url: API_ENDPOINTS.AUTH[`OAUTH_${provider.toUpperCase()}`],
        method: 'POST',
        data: oauthData
      })
      
      if (response.success && response.data.tokens) {
        await storage.setToken(response.data.tokens.accessToken, response.data.tokens.refreshToken)
        await storage.setUserInfo(response.data.user)
      }
      
      return response
    } catch (error) {
      console.error('OAuth login error:', error)
      throw error
    }
  }

  /**
   * 用户登出
   */
  async logout() {
    try {
      await request({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: 'POST'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 无论如何都清除本地数据
      await storage.clearUserData()
    }
  }

  /**
   * 刷新令牌
   */
  async refreshToken() {
    try {
      const refreshToken = await storage.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await request({
        url: API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        method: 'POST',
        data: { refreshToken }
      })

      if (response.success && response.data.tokens) {
        await storage.setToken(response.data.tokens.accessToken, response.data.tokens.refreshToken)
      }

      return response
    } catch (error) {
      console.error('Refresh token error:', error)
      // 刷新失败，清除用户数据
      await storage.clearUserData()
      throw error
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    try {
      const response = await request({
        url: API_ENDPOINTS.AUTH.ME,
        method: 'GET'
      })
      
      if (response.success && response.data.user) {
        await storage.setUserInfo(response.data.user)
      }
      
      return response
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
  }

  // ==================== 用户资料管理 ====================

  /**
   * 获取用户资料
   */
  async getUserProfile() {
    try {
      const response = await request({
        url: API_ENDPOINTS.USER.PROFILE,
        method: 'GET'
      })
      
      return response
    } catch (error) {
      console.error('Get user profile error:', error)
      throw error
    }
  }

  /**
   * 更新用户资料
   */
  async updateUserProfile(profileData) {
    try {
      const response = await request({
        url: API_ENDPOINTS.USER.UPDATE_PROFILE,
        method: 'PUT',
        data: profileData
      })
      
      if (response.success && response.data.user) {
        await storage.setUserInfo(response.data.user)
      }
      
      return response
    } catch (error) {
      console.error('Update user profile error:', error)
      throw error
    }
  }

  /**
   * 上传头像
   */
  async uploadAvatar(filePath) {
    try {
      // uni-app文件上传
      return new Promise((resolve, reject) => {
        const token = storage.getAccessToken()
        
        uni.uploadFile({
          url: `${this.baseURL}${API_ENDPOINTS.USER.UPLOAD_AVATAR}`,
          filePath: filePath,
          name: 'avatar',
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            try {
              const response = JSON.parse(res.data)
              resolve(response)
            } catch (error) {
              reject(error)
            }
          },
          fail: (error) => {
            reject(error)
          }
        })
      })
    } catch (error) {
      console.error('Upload avatar error:', error)
      throw error
    }
  }

  // ==================== 家庭群组管理 ====================

  /**
   * 创建家庭群组
   */
  async createFamilyGroup(groupData) {
    try {
      const response = await request({
        url: API_ENDPOINTS.USER.FAMILY_GROUP,
        method: 'POST',
        data: groupData
      })
      
      return response
    } catch (error) {
      console.error('Create family group error:', error)
      throw error
    }
  }

  /**
   * 获取家庭群组信息
   */
  async getFamilyGroup(groupId) {
    try {
      const response = await request({
        url: API_ENDPOINTS.USER.FAMILY_GROUP_DETAIL.replace('{groupId}', groupId),
        method: 'GET'
      })
      
      return response
    } catch (error) {
      console.error('Get family group error:', error)
      throw error
    }
  }

  /**
   * 邀请家庭成员
   */
  async inviteFamilyMember(groupId, memberData) {
    try {
      const response = await request({
        url: API_ENDPOINTS.USER.FAMILY_INVITE.replace('{groupId}', groupId),
        method: 'POST',
        data: memberData
      })
      
      return response
    } catch (error) {
      console.error('Invite family member error:', error)
      throw error
    }
  }

  /**
   * 移除家庭成员
   */
  async removeFamilyMember(groupId, memberId) {
    try {
      const response = await request({
        url: API_ENDPOINTS.USER.FAMILY_REMOVE.replace('{groupId}', groupId),
        method: 'DELETE',
        data: { memberId }
      })
      
      return response
    } catch (error) {
      console.error('Remove family member error:', error)
      throw error
    }
  }

  /**
   * 更新家庭成员权限
   */
  async updateFamilyPermissions(groupId, memberId, permissions) {
    try {
      const response = await request({
        url: API_ENDPOINTS.USER.FAMILY_PERMISSIONS.replace('{groupId}', groupId),
        method: 'PUT',
        data: { memberId, permissions }
      })
      
      return response
    } catch (error) {
      console.error('Update family permissions error:', error)
      throw error
    }
  }

  // ==================== 设备管理 ====================

  /**
   * 获取用户设备列表
   */
  async getUserDevices() {
    try {
      const response = await request({
        url: API_ENDPOINTS.USER.DEVICES,
        method: 'GET'
      })
      
      return response
    } catch (error) {
      console.error('Get user devices error:', error)
      throw error
    }
  }

  /**
   * 移除设备
   */
  async removeDevice(deviceId) {
    try {
      const response = await request({
        url: API_ENDPOINTS.USER.DEVICE_REMOVE.replace('{deviceId}', deviceId),
        method: 'DELETE'
      })
      
      return response
    } catch (error) {
      console.error('Remove device error:', error)
      throw error
    }
  }

  // ==================== 验证相关 ====================

  /**
   * 验证手机号
   */
  async verifyPhone(phoneData) {
    try {
      const response = await request({
        url: API_ENDPOINTS.USER.PHONE_VERIFY,
        method: 'POST',
        data: phoneData
      })
      
      return response
    } catch (error) {
      console.error('Verify phone error:', error)
      throw error
    }
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(emailData) {
    try {
      const response = await request({
        url: API_ENDPOINTS.USER.EMAIL_VERIFY,
        method: 'POST',
        data: emailData
      })
      
      return response
    } catch (error) {
      console.error('Verify email error:', error)
      throw error
    }
  }
}

export const userService = new UserService()
export default userService
