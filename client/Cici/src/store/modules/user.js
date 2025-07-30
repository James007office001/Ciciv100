/**
 * Pinia状态管理 - 用户模块
 * 管理用户信息、登录状态、权限等
 */

import { defineStore } from 'pinia'
import { authApi, userApi } from '../../api/index.js'
import { USER_ROLES } from '../../../../../shared/config/constants.js'
import userProfileUtils from '../../utils/userProfileUtils.js'
import autoLoginManager from '../../utils/autoLoginManager.js'
import { UserService } from '../../utils/dataService.js'
import { UserModel } from '../../utils/models.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户基本信息 - 使用新的数据结构
    userInfo: null,
    // 登录token
    token: uni.getStorageSync('user_token') || '',
    // 登录状态
    isLogin: false,
    // 用户权限
    permissions: [],
    // 用户设置 - 使用新的数据结构
    settings: null,
    // 关注相关数据
    followData: {
      following: [],
      followers: [],
      followingCount: 0,
      followersCount: 0
    },
    // 用户统计数据 - 将使用userInfo中的数据
    statistics: {
      postsCount: 0,
      activitiesCount: 0,
      likesCount: 0,
      ticketsCount: 0
    }
  }),

  getters: {
    /**
     * 获取用户角色
     */
    userRole: (state) => {
      return state.userInfo?.role || USER_ROLES.USER
    },

    /**
     * 获取用户昵称
     */
    nickname: (state) => {
      return state.userInfo?.displayName || state.userInfo?.username || '用户'
    },

    /**
     * 获取用户头像
     */
    avatar: (state) => {
      const defaultAvatar = '/static/default-avatar.png'
      return state.userInfo?.avatar || defaultAvatar
    },

    /**
     * 检查是否为博主
     */
    isBlogger: (state) => {
      return state.userInfo?.role === USER_ROLES.BLOGGER
    },

    /**
     * 检查是否为管理员
     */
    isAdmin: (state) => {
      return state.userInfo?.role === USER_ROLES.ADMIN
    },

    /**
     * 获取用户级别
     */
    userLevel: (state) => {
      if (!state.userInfo) return 1
      return state.userInfo.level || 1
    },

    /**
     * 获取用户经验值
     */
    userExperience: (state) => {
      if (!state.userInfo) return 0
      return state.userInfo.experience || 0
    },

    /**
     * 获取升级所需经验值
     */
    nextLevelExp: (state) => {
      if (!state.userInfo) return 1000
      return state.userInfo.nextLevelExp || 1000
    },

    /**
     * 检查是否已完善个人信息
     */
    isProfileComplete: (state) => {
      if (!state.userInfo) return false
      const requiredFields = ['displayName', 'avatar', 'gender', 'birthday']
      return requiredFields.every(field => state.userInfo[field])
    },

    /**
     * 检查是否为认证用户
     */
    isVerified: (state) => {
      return state.userInfo?.verificationStatus === 'verified'
    },

    /**
     * 获取会员类型
     */
    membershipType: (state) => {
      return state.userInfo?.membershipType || 'basic'
    },

    /**
     * 检查是否为高级会员
     */
    isPremium: (state) => {
      return ['premium', 'vip'].includes(state.userInfo?.membershipType)
    }
  },

  actions: {
    /**
     * 用户登录
     * @param {Object} loginData - 登录数据
     * @param {string} loginData.phone - 手机号
     * @param {string} loginData.password - 密码
     * @returns {Promise} 登录结果
     */
    async login(loginData) {
      try {
        uni.showLoading({ title: '登录中...' })
        
        const response = await authApi.login(loginData)
        const { token, userInfo } = response.data
        
        // 保存token和用户信息
        this.token = token
        this.userInfo = userInfo
        this.isLogin = true
        
        // 持久化存储
        uni.setStorageSync('user_token', token)
        uni.setStorageSync('user_info', userInfo)
        
        // 获取用户详细信息
        await this.fetchUserProfile()
        
        uni.hideLoading()
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        return response
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
        throw error
      }
    },

    /**
     * 用户注册
     * @param {Object} registerData - 注册数据
     * @returns {Promise} 注册结果
     */
    async register(registerData) {
      try {
        uni.showLoading({ title: '注册中...' })
        
        const response = await authApi.register(registerData)
        
        uni.hideLoading()
        uni.showToast({
          title: '注册成功',
          icon: 'success'
        })
        
        return response
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '注册失败',
          icon: 'none'
        })
        throw error
      }
    },

    /**
     * 第三方登录
     * @param {string} provider - 登录提供商
     * @returns {Promise} 登录结果
     */
    async socialLogin(provider) {
      try {
        uni.showLoading({ title: '登录中...' })
        
        // 获取第三方授权
        const authResult = await this.getThirdPartyAuth(provider)
        
        // 调用后端接口
        const response = await authApi.socialLogin({
          provider,
          code: authResult.code
        })
        
        const { token, userInfo } = response.data
        
        // 保存登录信息
        this.token = token
        this.userInfo = userInfo
        this.isLogin = true
        
        uni.setStorageSync('user_token', token)
        uni.setStorageSync('user_info', userInfo)
        
        await this.fetchUserProfile()
        
        uni.hideLoading()
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        return response
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
        throw error
      }
    },

    /**
     * 获取第三方授权
     * @param {string} provider - 提供商
     * @returns {Promise} 授权结果
     */
    async getThirdPartyAuth(provider) {
      return new Promise((resolve, reject) => {
        switch (provider) {
          case 'wechat':
            uni.login({
              provider: 'weixin',
              success: resolve,
              fail: reject
            })
            break
          case 'apple':
            // Apple登录逻辑
            // TODO: 实现Apple登录
            reject(new Error('Apple登录暂未实现'))
            break
          default:
            reject(new Error('不支持的登录方式'))
        }
      })
    },

    /**
     * 退出登录
     */
    async logout() {
      try {
        // 调用后端退出接口
        await authApi.logout()
      } catch (error) {
        console.error('Logout API error:', error)
      } finally {
        // 使用自动登录管理器清除登录状态
        const currentUser = autoLoginManager.getCurrentUser()
        if (currentUser) {
          await autoLoginManager.logout(currentUser.id)
        }
        
        // 清除本地数据
        this.token = ''
        this.userInfo = null
        this.isLogin = false
        this.permissions = []
        this.followData = {
          following: [],
          followers: [],
          followingCount: 0,
          followersCount: 0
        }
        
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
        
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/auth/login'
        })
      }
    },

    /**
     * 检查并执行自动登录
     * @returns {Promise<boolean>} 是否自动登录成功
     */
    async checkAutoLogin() {
      try {
        console.log('UserStore: 开始检查自动登录...')
        
        const result = await autoLoginManager.checkAutoLogin()
        
        if (result.success) {
          // 自动登录成功，设置用户状态
          const user = result.user
          
          this.userInfo = user
          this.token = user.token
          this.isLogin = true
          
          console.log('UserStore: 自动登录成功，用户状态已设置')
          return true
        } else {
          console.log('UserStore: 自动登录失败:', result.reason)
          
          if (result.needClear) {
            // 清除过期或无效的登录数据
            this.clearLocalLoginData()
          }
          
          return false
        }
        
      } catch (error) {
        console.error('UserStore: 自动登录检查异常:', error)
        this.clearLocalLoginData()
        return false
      }
    },

    /**
     * 检查登录状态
     * @returns {boolean} 是否已登录
     */
    checkLoginStatus() {
      try {
        // 使用自动登录管理器检查状态
        const isLoggedIn = autoLoginManager.isLoggedIn()
        const currentUser = autoLoginManager.getCurrentUser()
        
        if (isLoggedIn && currentUser) {
          // 同步用户状态到 store
          this.userInfo = currentUser
          this.token = currentUser.token
          this.isLogin = true
          
          // 延长登录会话
          autoLoginManager.extendLoginSession()
          
          return true
        } else {
          // 清除本地状态
          this.clearLocalLoginData()
          return false
        }
        
      } catch (error) {
        console.error('检查登录状态失败:', error)
        this.clearLocalLoginData()
        return false
      }
    },

    /**
     * 清除本地登录数据
     */
    clearLocalLoginData() {
      this.token = ''
      this.userInfo = null
      this.isLogin = false
      this.permissions = []
      
      // 清除自动登录数据
      autoLoginManager.clearAutoLoginData()
    },

    /**
     * 获取登录状态详情
     * @returns {Object} 登录状态详情
     */
    getLoginStatusDetail() {
      return autoLoginManager.getLoginStatus()
    },

    /**
     * 设置自动登录开关
     * @param {boolean} enabled 是否启用自动登录
     */
    setAutoLogin(enabled) {
      return autoLoginManager.setAutoLogin(enabled)
    },

    /**
     * 获取用户详细信息
     */
    async fetchUserProfile() {
      try {
        const response = await userApi.getProfile()
        
        // 使用userProfileUtils格式化用户数据
        const formattedUserData = await userProfileUtils.formatUserData(response.data)
        
        this.userInfo = {
          ...this.userInfo,
          ...formattedUserData
        }
        
        // 更新存储
        uni.setStorageSync('user_info', this.userInfo)
        
        return response
      } catch (error) {
        console.error('Fetch user profile error:', error)
        throw error
      }
    },

    /**
     * 更新用户信息
     * @param {Object} data - 更新数据
     */
    async updateProfile(data) {
      try {
        uni.showLoading({ title: '保存中...' })
        
        // 验证数据
        const validationErrors = []
        for (const field of Object.keys(data)) {
          const validation = await userProfileUtils.validateField(field, data[field])
          if (!validation.valid) {
            validationErrors.push(validation.message)
          }
        }
        
        if (validationErrors.length > 0) {
          uni.hideLoading()
          uni.showToast({
            title: validationErrors[0],
            icon: 'error'
          })
          return { success: false, errors: validationErrors }
        }
        
        const response = await userApi.updateProfile(data)
        
        // 更新本地数据
        const formattedUserData = await userProfileUtils.formatUserData(response.data)
        this.userInfo = {
          ...this.userInfo,
          ...formattedUserData
        }
        
        // 更新存储
        uni.setStorageSync('user_info', this.userInfo)
        
        uni.hideLoading()
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        return { success: true, data: response.data }
      } catch (error) {
        uni.hideLoading()
        console.error('Update profile error:', error)
        
        // 使用新的错误处理
        const errorInfo = await userProfileUtils.getErrorInfo('SETTINGS_UPDATE_FAILED')
        uni.showToast({
          title: errorInfo?.message || '保存失败',
          icon: 'error'
        })
        
        throw error
      }
    },

    /**
     * 上传头像
     * @param {string} filePath - 文件路径
     */
    async uploadAvatar(filePath) {
      try {
        uni.showLoading({ title: '上传中...' })
        
        const response = await userApi.uploadAvatar(filePath)
        
        // 更新头像
        this.userInfo.avatar = response.data.url
        uni.setStorageSync('user_info', this.userInfo)
        
        uni.hideLoading()
        uni.showToast({
          title: '头像更新成功',
          icon: 'success'
        })
        
        return response
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '上传失败',
          icon: 'none'
        })
        throw error
      }
    },

    /**
     * 关注用户
     * @param {string} userId - 用户ID
     */
    async followUser(userId) {
      try {
        const response = await userApi.followUser(userId)
        
        // 更新关注数据
        this.followData.followingCount += 1
        this.followData.following.push(userId)
        
        uni.showToast({
          title: '关注成功',
          icon: 'success'
        })
        
        return response
      } catch (error) {
        uni.showToast({
          title: error.message || '关注失败',
          icon: 'none'
        })
        throw error
      }
    },

    /**
     * 取消关注
     * @param {string} userId - 用户ID
     */
    async unfollowUser(userId) {
      try {
        const response = await userApi.unfollowUser(userId)
        
        // 更新关注数据
        this.followData.followingCount -= 1
        this.followData.following = this.followData.following.filter(id => id !== userId)
        
        uni.showToast({
          title: '已取消关注',
          icon: 'success'
        })
        
        return response
      } catch (error) {
        uni.showToast({
          title: error.message || '操作失败',
          icon: 'none'
        })
        throw error
      }
    },

    /**
     * 获取关注列表
     */
    async fetchFollowing() {
      try {
        const response = await userApi.getFollowing()
        
        this.followData.following = response.data.list
        this.followData.followingCount = response.data.total
        
        return response
      } catch (error) {
        console.error('Fetch following error:', error)
        throw error
      }
    },

    /**
     * 获取粉丝列表
     */
    async fetchFollowers() {
      try {
        const response = await userApi.getFollowers()
        
        this.followData.followers = response.data.list
        this.followData.followersCount = response.data.total
        
        return response
      } catch (error) {
        console.error('Fetch followers error:', error)
        throw error
      }
    },

    /**
     * 更新用户设置
     * @param {Object} settings - 设置数据
     */
    updateSettings(settings) {
      this.settings = {
        ...this.settings,
        ...settings
      }
      
      // 持久化存储
      uni.setStorageSync('userSettings', this.settings)
    },

    /**
     * 检查登录状态
     */
    checkLoginStatus() {
      // 检查新的存储键名
      const token = uni.getStorageSync('user_token')
      const userInfo = uni.getStorageSync('user_info')
      
      if (token && userInfo) {
        this.token = token
        this.userInfo = userInfo
        this.isLogin = true
        
        // 在模拟环境中，我们不需要验证token，直接使用本地存储的用户信息
        // 如果需要验证token，可以在生产环境中启用以下代码
        /*
        // 获取最新用户信息（仅在生产环境或有真实API时）
        this.fetchUserProfile().catch((error) => {
          console.warn('Failed to fetch user profile:', error)
          // 只有在token明确无效时才logout，网络错误不应该logout
          if (error.code === 'TOKEN_EXPIRED' || error.code === 'UNAUTHORIZED') {
            this.logout()
          }
        })
        */
      }
    },

    /**
     * 初始化用户数据
     */
    async initUserData() {
      // 检查登录状态
      this.checkLoginStatus()
      
      // 加载用户设置
      const settings = uni.getStorageSync('userSettings')
      if (settings) {
        this.settings = { ...this.settings, ...settings }
      }
      
      // 如果已登录，获取关注数据
      if (this.isLogin) {
        try {
          await Promise.all([
            this.fetchFollowing(),
            this.fetchFollowers()
          ])
        } catch (error) {
          console.error('Init user data error:', error)
        }
      }
    }
  }
})
