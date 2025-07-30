<template>
  <view class="startup-container">
    <view class="startup-content">
      <!-- LOGO和标题 -->
      <view class="logo-section">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
        <text class="app-name">CICI</text>
        <text class="app-slogan">智能社交活动平台</text>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-section">
        <view class="loading-spinner" :class="{ 'spinning': isLoading }"></view>
        <text class="loading-text">{{ loadingText }}</text>
      </view>
      
      <!-- 错误提示 -->
      <view v-if="errorMessage" class="error-section">
        <text class="error-text">{{ errorMessage }}</text>
        <button class="retry-btn" @click="retryStartup">重试</button>
      </view>
      
      <!-- 调试按钮（开发环境显示） -->
      <view v-if="showDebugButtons" class="debug-section">
        <button class="debug-btn" @click="goToLogin">测试登录页面</button>
        <button class="debug-btn" @click="goToSchedule">测试日程页面</button>
      </view>
    </view>
  </view>
</template>

<script>
import AppLauncher from '@/utils/appLauncher.js'

export default {
  name: 'StartupPage',
  data() {
    return {
      isLoading: true,
      loadingText: '正在检查登录状态...',
      errorMessage: '',
      startupDecision: null,
      showDebugButtons: process.env.NODE_ENV === 'development'
    }
  },
  
  async onLoad() {
    await this.initializeApp()
  },
  
  methods: {
    /**
     * 初始化应用
     */
    async initializeApp() {
      try {
        this.isLoading = true
        this.errorMessage = ''
        this.loadingText = '正在检查登录状态...'
        
        // 等待一段时间显示LOGO
        await this.delay(1000)
        
        // 决定启动页面
        const decision = await AppLauncher.decideStartupPage()
        this.startupDecision = decision
        
        console.log('启动决策结果:', decision)
        
        if (decision.isLoggedIn && decision.autoLoginResult && decision.autoLoginResult.success) {
          this.loadingText = '自动登录成功，正在跳转...'
          await this.delay(800)
          
          // 跳转到日程页面
          uni.reLaunch({
            url: '/pages/schedule/index',
            success: () => {
              console.log('成功跳转到日程页面')
            },
            fail: (error) => {
              console.error('跳转到日程页面失败:', error)
              this.showErrorAndRedirect('跳转失败，请重试')
            }
          })
        } else {
          this.loadingText = '正在跳转到登录页面...'
          await this.delay(800)
          
          // 跳转到登录页面
          uni.reLaunch({
            url: '/pages/auth/login',
            success: () => {
              console.log('成功跳转到登录页面')
            },
            fail: (error) => {
              console.error('跳转到登录页面失败:', error)
              this.showErrorAndRedirect('跳转失败，请重试')
            }
          })
        }
        
      } catch (error) {
        console.error('应用初始化失败:', error)
        this.showErrorAndRedirect(`初始化失败: ${error.message}`)
      }
    },
    
    /**
     * 显示错误并提供重试选项
     */
    showErrorAndRedirect(message) {
      this.isLoading = false
      this.errorMessage = message
      this.loadingText = ''
    },
    
    /**
     * 重试启动
     */
    async retryStartup() {
      await this.initializeApp()
    },
    
    /**
     * 延迟函数
     */
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    
    /**
     * 跳转到登录页面（调试用）
     */
    goToLogin() {
      uni.reLaunch({
        url: '/pages/auth/login'
      })
    },
    
    /**
     * 跳转到日程页面（调试用）
     */
    goToSchedule() {
      uni.reLaunch({
        url: '/pages/schedule/index'
      })
    }
  }
}
</script>

<style scoped>
.startup-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.startup-content {
  text-align: center;
  padding: 40rpx;
}

.logo-section {
  margin-bottom: 80rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}

.app-name {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  color: white;
}

.app-slogan {
  display: block;
  font-size: 28rpx;
  opacity: 0.8;
  color: white;
}

.loading-section {
  margin-bottom: 40rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top: 4rpx solid white;
  border-radius: 50%;
  margin: 0 auto 20rpx;
  transition: transform 0.1s ease;
}

.loading-spinner.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  display: block;
  font-size: 28rpx;
  opacity: 0.9;
  color: white;
}

.error-section {
  padding: 20rpx;
}

.error-text {
  display: block;
  font-size: 28rpx;
  color: #ffcccb;
  margin-bottom: 20rpx;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2rpx solid white;
  border-radius: 40rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.debug-section {
  margin-top: 40rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

.debug-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  margin: 8rpx;
  width: 200rpx;
}

.debug-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
