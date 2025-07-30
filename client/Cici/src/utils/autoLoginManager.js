/**
 * CICI 自动登录管理服务
 * 处理用户自动登录、登录状态保持、登出等功能
 */

import { UserService } from './dataService.js'
import { UserModel } from './models.js'

/**
 * 自动登录管理器
 */
export class AutoLoginManager {
  constructor() {
    this.AUTO_LOGIN_KEY = 'auto_login'
    this.LAST_LOGIN_PHONE_KEY = 'last_login_phone'
    this.USER_TOKEN_KEY = 'user_token'
    this.USER_INFO_KEY = 'user_info'
    this.LOGIN_TIME_KEY = 'login_time'
    this.LOGIN_METHOD_KEY = 'login_method'
    
    // 登录有效期：7天
    this.LOGIN_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000
  }

  /**
   * 保存登录状态
   * @param {Object} userInfo 用户信息
   * @param {string} loginMethod 登录方式
   */
  saveLoginState(userInfo, loginMethod = 'password') {
    try {
      const currentTime = Date.now()
      
      // 保存到本地存储
      uni.setStorageSync(this.USER_TOKEN_KEY, userInfo.token)
      uni.setStorageSync(this.USER_INFO_KEY, userInfo)
      uni.setStorageSync(this.LOGIN_TIME_KEY, currentTime)
      uni.setStorageSync(this.AUTO_LOGIN_KEY, true)
      uni.setStorageSync(this.LAST_LOGIN_PHONE_KEY, userInfo.phone)
      uni.setStorageSync(this.LOGIN_METHOD_KEY, loginMethod)
      
      console.log('登录状态已保存:', {
        phone: userInfo.phone,
        loginTime: new Date(currentTime).toISOString(),
        method: loginMethod
      })
      
      return true
    } catch (error) {
      console.error('保存登录状态失败:', error)
      return false
    }
  }

  /**
   * 检查并执行自动登录
   * @returns {Promise<Object>} 自动登录结果
   */
  async checkAutoLogin() {
    try {
      // 获取存储的登录信息
      const autoLogin = uni.getStorageSync(this.AUTO_LOGIN_KEY)
      const lastLoginPhone = uni.getStorageSync(this.LAST_LOGIN_PHONE_KEY)
      const userToken = uni.getStorageSync(this.USER_TOKEN_KEY)
      const userInfo = uni.getStorageSync(this.USER_INFO_KEY)
      const loginTime = uni.getStorageSync(this.LOGIN_TIME_KEY)
      const loginMethod = uni.getStorageSync(this.LOGIN_METHOD_KEY)
      
      console.log('检查自动登录状态:', {
        autoLogin,
        lastLoginPhone,
        hasToken: !!userToken,
        hasUserInfo: !!userInfo,
        loginTime: loginTime ? new Date(loginTime).toISOString() : null,
        loginMethod
      })
      
      // 基础条件检查
      if (!autoLogin || !lastLoginPhone || !userToken || !userInfo || !loginTime) {
        return {
          success: false,
          reason: '缺少必要的登录信息',
          needClear: true
        }
      }
      
      // 检查登录是否过期
      const currentTime = Date.now()
      if (currentTime - loginTime > this.LOGIN_EXPIRE_TIME) {
        return {
          success: false,
          reason: '登录已过期',
          needClear: true
        }
      }
      
      // 检查用户是否还存在于数据库中
      const dbUser = UserModel.findByPhone(lastLoginPhone)
      if (!dbUser) {
        return {
          success: false,
          reason: '用户不存在于数据库中',
          needClear: true
        }
      }
      
      // 检查 token 是否匹配
      if (dbUser.token !== userToken) {
        return {
          success: false,
          reason: 'Token 不匹配',
          needClear: true
        }
      }
      
      // 更新用户在线状态和最后活跃时间
      UserModel.update(dbUser.id, {
        isOnline: true,
        lastActiveAt: currentTime
      })
      
      // 更新本地存储中的登录时间
      uni.setStorageSync(this.LOGIN_TIME_KEY, currentTime)
      
      console.log('自动登录成功:', {
        userId: dbUser.id,
        phone: dbUser.phone,
        name: dbUser.name
      })
      
      return {
        success: true,
        user: dbUser,
        reason: '自动登录成功'
      }
      
    } catch (error) {
      console.error('自动登录检查失败:', error)
      return {
        success: false,
        reason: `自动登录检查失败: ${error.message}`,
        needClear: true
      }
    }
  }

  /**
   * 清除自动登录数据
   */
  clearAutoLoginData() {
    try {
      uni.removeStorageSync(this.AUTO_LOGIN_KEY)
      uni.removeStorageSync(this.LAST_LOGIN_PHONE_KEY)
      uni.removeStorageSync(this.USER_TOKEN_KEY)
      uni.removeStorageSync(this.USER_INFO_KEY)
      uni.removeStorageSync(this.LOGIN_TIME_KEY)
      uni.removeStorageSync(this.LOGIN_METHOD_KEY)
      
      console.log('自动登录数据已清除')
      return true
    } catch (error) {
      console.error('清除自动登录数据失败:', error)
      return false
    }
  }

  /**
   * 用户登出
   * @param {string} userId 用户ID
   */
  async logout(userId) {
    try {
      // 更新数据库中的用户状态
      if (userId) {
        UserModel.update(userId, {
          isOnline: false,
          token: null
        })
      }
      
      // 清除本地登录数据
      this.clearAutoLoginData()
      
      console.log('用户登出成功')
      return { success: true }
    } catch (error) {
      console.error('用户登出失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 获取当前登录用户信息
   * @returns {Object|null} 用户信息
   */
  getCurrentUser() {
    try {
      const userInfo = uni.getStorageSync(this.USER_INFO_KEY)
      const userToken = uni.getStorageSync(this.USER_TOKEN_KEY)
      const loginTime = uni.getStorageSync(this.LOGIN_TIME_KEY)
      
      if (!userInfo || !userToken || !loginTime) {
        return null
      }
      
      // 检查是否过期
      const currentTime = Date.now()
      if (currentTime - loginTime > this.LOGIN_EXPIRE_TIME) {
        this.clearAutoLoginData()
        return null
      }
      
      return userInfo
    } catch (error) {
      console.error('获取当前用户信息失败:', error)
      return null
    }
  }

  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return this.getCurrentUser() !== null
  }

  /**
   * 延长登录有效期
   */
  extendLoginSession() {
    try {
      const currentTime = Date.now()
      uni.setStorageSync(this.LOGIN_TIME_KEY, currentTime)
      
      console.log('登录会话已延长')
      return true
    } catch (error) {
      console.error('延长登录会话失败:', error)
      return false
    }
  }

  /**
   * 获取登录状态信息
   * @returns {Object} 登录状态详情
   */
  getLoginStatus() {
    try {
      const autoLogin = uni.getStorageSync(this.AUTO_LOGIN_KEY)
      const lastLoginPhone = uni.getStorageSync(this.LAST_LOGIN_PHONE_KEY)
      const loginTime = uni.getStorageSync(this.LOGIN_TIME_KEY)
      const loginMethod = uni.getStorageSync(this.LOGIN_METHOD_KEY)
      const userInfo = this.getCurrentUser()
      
      const currentTime = Date.now()
      const remainingTime = loginTime ? 
        Math.max(0, this.LOGIN_EXPIRE_TIME - (currentTime - loginTime)) : 0
      
      return {
        isLoggedIn: this.isLoggedIn(),
        autoLoginEnabled: !!autoLogin,
        lastLoginPhone,
        loginTime: loginTime ? new Date(loginTime).toISOString() : null,
        loginMethod,
        remainingTime,
        remainingDays: Math.floor(remainingTime / (24 * 60 * 60 * 1000)),
        userInfo
      }
    } catch (error) {
      console.error('获取登录状态失败:', error)
      return {
        isLoggedIn: false,
        autoLoginEnabled: false,
        error: error.message
      }
    }
  }

  /**
   * 设置自动登录开关
   * @param {boolean} enabled 是否启用自动登录
   */
  setAutoLogin(enabled) {
    try {
      if (enabled) {
        uni.setStorageSync(this.AUTO_LOGIN_KEY, true)
      } else {
        uni.removeStorageSync(this.AUTO_LOGIN_KEY)
      }
      
      console.log(`自动登录已${enabled ? '启用' : '禁用'}`)
      return true
    } catch (error) {
      console.error('设置自动登录失败:', error)
      return false
    }
  }
}

// 创建全局实例
export const autoLoginManager = new AutoLoginManager()

// 默认导出
export default autoLoginManager
