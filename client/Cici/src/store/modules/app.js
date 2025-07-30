/**
 * Pinia状态管理 - 应用模块
 * 管理全局应用状态，如主题、语言、网络状态等
 */

import { defineStore } from 'pinia'
import { MODULES } from '../../../../../shared/config/constants.js'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 当前激活的Tab
    activeTab: 'schedule',
    // 水晶球状态
    crystalBallActive: false,
    // 网络状态
    networkStatus: {
      isConnected: true,
      networkType: 'wifi'
    },
    // 设备信息
    deviceInfo: {},
    // 系统信息
    systemInfo: {},
    // 全局加载状态
    globalLoading: false,
    // 主题设置
    theme: 'auto', // light, dark, auto
    // 语言设置
    language: 'zh-CN',
    // 页面历史记录
    pageHistory: [],
    // 全局搜索关键词
    searchKeyword: '',
    // 位置信息
    location: {
      latitude: null,
      longitude: null,
      address: '',
      city: ''
    },
    // 通知权限状态
    notificationPermission: 'default', // granted, denied, default
    // 应用版本信息
    appVersion: {
      current: '1.0.0',
      latest: '1.0.0',
      hasUpdate: false
    },
    // 快速输入面板状态
    quickInputPanel: {
      visible: false,
      mode: null // text, voice, photo, video, activity, location
    }
  }),

  getters: {
    /**
     * 获取当前Tab配置
     */
    currentTab: (state) => {
      return MODULES.TABS.find(tab => tab.id === state.activeTab)
    },

    /**
     * 检查是否为深色模式
     */
    isDarkMode: (state) => {
      if (state.theme === 'auto') {
        // 根据系统设置判断
        return state.systemInfo.theme === 'dark'
      }
      return state.theme === 'dark'
    },

    /**
     * 检查是否有网络连接
     */
    isOnline: (state) => {
      return state.networkStatus.isConnected
    },

    /**
     * 获取设备类型
     */
    deviceType: (state) => {
      const { platform } = state.systemInfo
      if (platform === 'ios') return 'ios'
      if (platform === 'android') return 'android'
      return 'unknown'
    },

    /**
     * 检查是否为iPhone X系列（有刘海屏）
     */
    isIphoneX: (state) => {
      const { model, safeAreaInsets } = state.systemInfo
      return model && model.includes('iPhone') && safeAreaInsets && safeAreaInsets.top > 20
    },

    /**
     * 获取状态栏高度
     */
    statusBarHeight: (state) => {
      return state.systemInfo.statusBarHeight || 20
    },

    /**
     * 获取安全区域底部高度
     */
    safeAreaBottom: (state) => {
      return state.systemInfo.safeAreaInsets?.bottom || 0
    }
  },

  actions: {
    /**
     * 切换Tab
     * @param {string} tabId - Tab ID
     */
    switchTab(tabId) {
      if (MODULES.TABS.find(tab => tab.id === tabId)) {
        this.activeTab = tabId
        
        // 记录页面历史
        this.addPageHistory(`/pages/${tabId}/index`)
      }
    },

    /**
     * 切换水晶球状态
     * @param {boolean} active - 是否激活
     */
    toggleCrystalBall(active) {
      this.crystalBallActive = active
    },

    /**
     * 显示快速输入面板
     * @param {string} mode - 输入模式
     */
    showQuickInputPanel(mode = null) {
      this.quickInputPanel.visible = true
      this.quickInputPanel.mode = mode
      this.crystalBallActive = true
    },

    /**
     * 隐藏快速输入面板
     */
    hideQuickInputPanel() {
      this.quickInputPanel.visible = false
      this.quickInputPanel.mode = null
      this.crystalBallActive = false
    },

    /**
     * 设置全局加载状态
     * @param {boolean} loading - 加载状态
     */
    setGlobalLoading(loading) {
      this.globalLoading = loading
    },

    /**
     * 更新网络状态
     * @param {Object} status - 网络状态
     */
    updateNetworkStatus(status) {
      this.networkStatus = {
        ...this.networkStatus,
        ...status
      }
    },

    /**
     * 初始化设备信息
     */
    async initDeviceInfo() {
      try {
        // 获取系统信息
        const systemInfo = await this.getSystemInfo()
        this.systemInfo = systemInfo
        
        // 获取设备信息
        const deviceInfo = await this.getDeviceInfo()
        this.deviceInfo = deviceInfo
        
        // 监听网络状态变化
        this.watchNetworkStatus()
        
        // 获取初始网络状态
        const networkInfo = await this.getNetworkInfo()
        this.networkStatus = networkInfo
        
      } catch (error) {
        console.error('Init device info error:', error)
      }
    },

    /**
     * 获取系统信息
     * @returns {Promise} 系统信息
     */
    getSystemInfo() {
      return new Promise((resolve) => {
        uni.getSystemInfo({
          success: resolve,
          fail: () => resolve({})
        })
      })
    },

    /**
     * 获取设备信息
     * @returns {Promise} 设备信息
     */
    getDeviceInfo() {
      return new Promise((resolve) => {
        // #ifdef APP-PLUS
        plus.device.getInfo({
          success: resolve,
          fail: () => resolve({})
        })
        // #endif
        
        // #ifndef APP-PLUS
        resolve({})
        // #endif
      })
    },

    /**
     * 获取网络信息
     * @returns {Promise} 网络信息
     */
    getNetworkInfo() {
      return new Promise((resolve) => {
        uni.getNetworkType({
          success: (res) => {
            resolve({
              isConnected: res.networkType !== 'none',
              networkType: res.networkType
            })
          },
          fail: () => resolve({
            isConnected: false,
            networkType: 'none'
          })
        })
      })
    },

    /**
     * 监听网络状态变化
     */
    watchNetworkStatus() {
      uni.onNetworkStatusChange((res) => {
        this.updateNetworkStatus({
          isConnected: res.isConnected,
          networkType: res.networkType
        })
        
        // 网络恢复时的处理
        if (res.isConnected) {
          uni.showToast({
            title: '网络已连接',
            icon: 'success',
            duration: 1500
          })
        } else {
          uni.showToast({
            title: '网络连接中断',
            icon: 'none',
            duration: 2000
          })
        }
      })
    },

    /**
     * 设置主题
     * @param {string} theme - 主题类型
     */
    setTheme(theme) {
      this.theme = theme
      uni.setStorageSync('theme', theme)
      
      // 更新页面主题
      this.applyTheme()
    },

    /**
     * 应用主题
     */
    applyTheme() {
      let actualTheme = this.theme
      
      if (actualTheme === 'auto') {
        // 根据系统设置自动判断
        actualTheme = this.systemInfo.theme || 'light'
      }
      
      // 设置页面主题
      if (actualTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    },

    /**
     * 设置语言
     * @param {string} language - 语言代码
     */
    setLanguage(language) {
      this.language = language
      uni.setStorageSync('language', language)
    },

    /**
     * 添加页面历史记录
     * @param {string} path - 页面路径
     */
    addPageHistory(path) {
      // 避免重复记录相同页面
      if (this.pageHistory[this.pageHistory.length - 1] !== path) {
        this.pageHistory.push(path)
        
        // 限制历史记录数量
        if (this.pageHistory.length > 20) {
          this.pageHistory.shift()
        }
      }
    },

    /**
     * 获取位置信息
     * @param {boolean} forceUpdate - 是否强制更新
     */
    async getLocation(forceUpdate = false) {
      if (!forceUpdate && this.location.latitude) {
        return this.location
      }
      
      try {
        const location = await this.getCurrentLocation()
        this.location = {
          ...this.location,
          ...location
        }
        
        // 获取地址信息
        const address = await this.getAddressByLocation(location.latitude, location.longitude)
        this.location.address = address.address
        this.location.city = address.city
        
        return this.location
      } catch (error) {
        console.error('Get location error:', error)
        throw error
      }
    },

    /**
     * 获取当前位置
     * @returns {Promise} 位置信息
     */
    getCurrentLocation() {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          success: (res) => {
            resolve({
              latitude: res.latitude,
              longitude: res.longitude
            })
          },
          fail: reject
        })
      })
    },

    /**
     * 根据坐标获取地址信息
     * @param {number} latitude - 纬度
     * @param {number} longitude - 经度
     * @returns {Promise} 地址信息
     */
    async getAddressByLocation(latitude, longitude) {
      // 这里应该调用地图服务API，如腾讯地图、百度地图等
      // 暂时返回模拟数据
      return {
        address: '北京市朝阳区xxx街道',
        city: '北京市'
      }
    },

    /**
     * 设置搜索关键词
     * @param {string} keyword - 搜索关键词
     */
    setSearchKeyword(keyword) {
      this.searchKeyword = keyword
    },

    /**
     * 检查应用更新 - 已禁用
     */
    /*
    async checkAppUpdate() {
      try {
        // 这里应该调用版本检查API
        // 暂时模拟检查逻辑
        const latestVersion = '1.0.1'
        
        if (latestVersion !== this.appVersion.current) {
          this.appVersion.latest = latestVersion
          this.appVersion.hasUpdate = true
          
          // 显示更新提示
          uni.showModal({
            title: '发现新版本',
            content: `发现新版本 ${latestVersion}，是否立即更新？`,
            confirmText: '更新',
            success: (res) => {
              if (res.confirm) {
                this.downloadAppUpdate()
              }
            }
          })
        }
      } catch (error) {
        console.error('Check app update error:', error)
      }
    },
    */

    /**
     * 下载应用更新 - 已禁用
     */
    /*
    async downloadAppUpdate() {
      try {
        uni.showLoading({ title: '下载中...' })
        
        // #ifdef APP-PLUS
        // 这里实现应用更新下载逻辑
        // #endif
        
        uni.hideLoading()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '更新失败',
          icon: 'none'
        })
        console.error('Download app update error:', error)
      }
    },
    */

    /**
     * 初始化应用数据
     */
    async initAppData() {
      try {
        // 初始化设备信息
        await this.initDeviceInfo()
        
        // 加载保存的设置
        const savedTheme = uni.getStorageSync('theme')
        if (savedTheme) {
          this.theme = savedTheme
        }
        
        const savedLanguage = uni.getStorageSync('language')
        if (savedLanguage) {
          this.language = savedLanguage
        }
        
        // 应用主题
        this.applyTheme()
        
        // 检查应用更新 - 已禁用
        // this.checkAppUpdate()
        
      } catch (error) {
        console.error('Init app data error:', error)
      }
    }
  }
})
