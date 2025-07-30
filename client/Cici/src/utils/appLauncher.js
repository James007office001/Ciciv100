/**
 * 应用启动逻辑管理
 * 检查本地登录状态，决定启动页面
 */

import { Storage } from './storage.js'

class AppLauncher {
  constructor() {
    this.storage = new Storage()
  }

  /**
   * 检查用户登录状态
   * @returns {Promise<Object>} 登录状态信息
   */
  async checkLoginStatus() {
    try {
      // 检查访问令牌
      const accessToken = await this.storage.getAccessToken()
      const refreshToken = await this.storage.getRefreshToken()
      const userInfo = await this.storage.getUserInfo()
      
      // 如果没有令牌或用户信息，返回未登录状态
      if (!accessToken || !userInfo) {
        return {
          isLoggedIn: false,
          needLogin: true,
          targetPage: '/pages/auth/login'
        }
      }

      // 检查令牌是否过期（如果有过期时间信息）
      const tokenExpiry = await this.storage.getItem('token_expiry')
      if (tokenExpiry && new Date().getTime() > tokenExpiry) {
        // 尝试使用刷新令牌
        if (refreshToken) {
          const refreshResult = await this.refreshAccessToken(refreshToken)
          if (refreshResult.success) {
            return {
              isLoggedIn: true,
              needLogin: false,
              userInfo: userInfo,
              targetPage: '/pages/schedule/index'
            }
          }
        }
        
        // 刷新失败，清除过期数据
        await this.clearUserData()
        return {
          isLoggedIn: false,
          needLogin: true,
          targetPage: '/pages/auth/login'
        }
      }

      // 验证用户信息完整性
      if (!userInfo.id || !userInfo.username) {
        console.warn('用户信息不完整，需要重新登录')
        return {
          isLoggedIn: false,
          needLogin: true,
          targetPage: '/pages/auth/login'
        }
      }

      // 用户已登录且信息有效
      return {
        isLoggedIn: true,
        needLogin: false,
        userInfo: userInfo,
        targetPage: '/pages/schedule/index'
      }

    } catch (error) {
      console.error('检查登录状态失败:', error)
      return {
        isLoggedIn: false,
        needLogin: true,
        targetPage: '/pages/auth/login',
        error: error.message
      }
    }
  }

  /**
   * 尝试刷新访问令牌
   * @param {string} refreshToken 刷新令牌
   * @returns {Promise<Object>} 刷新结果
   */
  async refreshAccessToken(refreshToken) {
    try {
      // 这里应该调用后端API刷新令牌
      // 暂时返回失败，因为需要后端支持
      return {
        success: false,
        message: '令牌刷新暂未实现'
      }
    } catch (error) {
      console.error('刷新令牌失败:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 清除用户数据
   */
  async clearUserData() {
    try {
      await this.storage.clearTokens()
      await this.storage.clearUserInfo()
      await this.storage.clearUserSettings()
      console.log('用户数据已清除')
    } catch (error) {
      console.error('清除用户数据失败:', error)
    }
  }

  /**
   * 自动登录
   * @param {Object} userInfo 用户信息
   * @returns {Promise<Object>} 自动登录结果
   */
  async autoLogin(userInfo) {
    try {
      // 设置用户登录状态到store
      const { useUserStore } = await import('../store/modules/user.js')
      const userStore = useUserStore()
      
      // 更新用户状态
      await userStore.setUserInfo(userInfo)
      userStore.setAuthenticated(true)
      
      console.log('自动登录成功:', userInfo.username)
      
      return {
        success: true,
        message: '自动登录成功',
        userInfo: userInfo
      }
      
    } catch (error) {
      console.error('自动登录失败:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 决定启动页面并执行相应逻辑
   * @returns {Promise<Object>} 启动决策结果
   */
  async decideStartupPage() {
    const loginStatus = await this.checkLoginStatus()
    
    if (loginStatus.isLoggedIn) {
      // 执行自动登录
      const autoLoginResult = await this.autoLogin(loginStatus.userInfo)
      
      return {
        ...loginStatus,
        autoLoginResult: autoLoginResult,
        message: autoLoginResult.success ? '自动登录成功，跳转到日程页面' : '自动登录失败，跳转到登录页面',
        targetPage: autoLoginResult.success ? '/pages/schedule/index' : '/pages/auth/login'
      }
    } else {
      return {
        ...loginStatus,
        message: '未找到登录记录，跳转到登录页面'
      }
    }
  }
}

export default new AppLauncher()
