/**
 * 本地存储工具
 * 处理用户令牌、用户信息等数据的本地存储
 */

export class Storage {
  constructor() {
    this.keys = {
      ACCESS_TOKEN: 'access_token',
      REFRESH_TOKEN: 'refresh_token',
      USER_INFO: 'user_info',
      USER_SETTINGS: 'user_settings',
      DEVICE_ID: 'device_id'
    }
  }

  // ==================== 令牌管理 ====================

  /**
   * 保存访问令牌和刷新令牌
   */
  async setToken(accessToken, refreshToken) {
    try {
      await this.setItem(this.keys.ACCESS_TOKEN, accessToken)
      if (refreshToken) {
        await this.setItem(this.keys.REFRESH_TOKEN, refreshToken)
      }
    } catch (error) {
      console.error('Error saving tokens:', error)
      throw error
    }
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken() {
    try {
      return await this.getItem(this.keys.ACCESS_TOKEN)
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  }

  /**
   * 获取刷新令牌
   */
  async getRefreshToken() {
    try {
      return await this.getItem(this.keys.REFRESH_TOKEN)
    } catch (error) {
      console.error('Error getting refresh token:', error)
      return null
    }
  }

  /**
   * 清除所有令牌
   */
  async clearTokens() {
    try {
      await this.removeItem(this.keys.ACCESS_TOKEN)
      await this.removeItem(this.keys.REFRESH_TOKEN)
    } catch (error) {
      console.error('Error clearing tokens:', error)
    }
  }

  // ==================== 用户信息管理 ====================

  /**
   * 保存用户信息
   */
  async setUserInfo(userInfo) {
    try {
      await this.setItem(this.keys.USER_INFO, userInfo)
    } catch (error) {
      console.error('Error saving user info:', error)
      throw error
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo() {
    try {
      return await this.getItem(this.keys.USER_INFO)
    } catch (error) {
      console.error('Error getting user info:', error)
      return null
    }
  }

  /**
   * 清除用户信息
   */
  async clearUserInfo() {
    try {
      await this.removeItem(this.keys.USER_INFO)
    } catch (error) {
      console.error('Error clearing user info:', error)
    }
  }

  // ==================== 用户设置管理 ====================

  /**
   * 保存用户设置
   */
  async setUserSettings(settings) {
    try {
      await this.setItem(this.keys.USER_SETTINGS, settings)
    } catch (error) {
      console.error('Error saving user settings:', error)
      throw error
    }
  }

  /**
   * 获取用户设置
   */
  async getUserSettings() {
    try {
      return await this.getItem(this.keys.USER_SETTINGS)
    } catch (error) {
      console.error('Error getting user settings:', error)
      return null
    }
  }

  /**
   * 清除用户设置
   */
  async clearUserSettings() {
    try {
      await this.removeItem(this.keys.USER_SETTINGS)
    } catch (error) {
      console.error('Error clearing user settings:', error)
    }
  }

  // ==================== 设备ID管理 ====================

  /**
   * 保存设备ID
   */
  async setDeviceId(deviceId) {
    try {
      await this.setItem(this.keys.DEVICE_ID, deviceId)
    } catch (error) {
      console.error('Error saving device ID:', error)
      throw error
    }
  }

  /**
   * 获取设备ID
   */
  async getDeviceId() {
    try {
      let deviceId = await this.getItem(this.keys.DEVICE_ID)
      if (!deviceId) {
        // 生成新的设备ID
        deviceId = this.generateDeviceId()
        await this.setDeviceId(deviceId)
      }
      return deviceId
    } catch (error) {
      console.error('Error getting device ID:', error)
      return this.generateDeviceId()
    }
  }

  /**
   * 生成设备ID
   */
  generateDeviceId() {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // ==================== 通用存储方法 ====================

  /**
   * 保存数据到本地存储
   */
  async setItem(key, value) {
    return new Promise((resolve, reject) => {
      try {
        const data = typeof value === 'object' ? JSON.stringify(value) : value
        uni.setStorage({
          key: key,
          data: data,
          success: () => resolve(),
          fail: (error) => reject(error)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 从本地存储获取数据
   */
  async getItem(key) {
    return new Promise((resolve, reject) => {
      uni.getStorage({
        key: key,
        success: (res) => {
          try {
            // 尝试解析为JSON，如果失败则返回原值
            const value = typeof res.data === 'string' ? 
              (res.data.startsWith('{') || res.data.startsWith('[') ? 
                JSON.parse(res.data) : res.data) : 
              res.data
            resolve(value)
          } catch (error) {
            resolve(res.data)
          }
        },
        fail: (error) => {
          if (error.errMsg.includes('data not found')) {
            resolve(null)
          } else {
            reject(error)
          }
        }
      })
    })
  }

  /**
   * 从本地存储删除数据
   */
  async removeItem(key) {
    return new Promise((resolve, reject) => {
      uni.removeStorage({
        key: key,
        success: () => resolve(),
        fail: (error) => reject(error)
      })
    })
  }

  /**
   * 清除所有存储数据
   */
  async clear() {
    return new Promise((resolve, reject) => {
      uni.clearStorage({
        success: () => resolve(),
        fail: (error) => reject(error)
      })
    })
  }

  /**
   * 清除所有用户相关数据
   */
  async clearUserData() {
    try {
      await this.clearTokens()
      await this.clearUserInfo()
      await this.clearUserSettings()
      // 保留设备ID
    } catch (error) {
      console.error('Error clearing user data:', error)
    }
  }

  // ==================== 认证状态检查 ====================

  /**
   * 检查用户是否已登录
   */
  async isLoggedIn() {
    try {
      const accessToken = await this.getAccessToken()
      const userInfo = await this.getUserInfo()
      return !!(accessToken && userInfo)
    } catch (error) {
      console.error('Error checking login status:', error)
      return false
    }
  }

  /**
   * 检查令牌是否即将过期
   */
  async isTokenExpiring() {
    try {
      const accessToken = await this.getAccessToken()
      if (!accessToken) return true

      // 简单检查：如果令牌存在就认为未过期
      // 实际的过期检查应该在后端API调用时处理
      return false
    } catch (error) {
      console.error('Error checking token expiration:', error)
      return true
    }
  }
}

export const storage = new Storage()
export default storage
