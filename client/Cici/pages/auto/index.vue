<template>
  <view class="auto-page">
    <view class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">{{ loadingText }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AutoRedirectPage',
  data() {
    return {
      loadingText: '正在检查登录状态...'
    }
  },
  onLoad() {
    this.checkAndRedirect()
  },
  methods: {
    checkAndRedirect() {
      try {
        // 检查登录状态
        const userInfo = uni.getStorageSync('user_info')
        const accessToken = uni.getStorageSync('access_token')
        const tokenExpiry = uni.getStorageSync('token_expiry')
        
        // 检查是否有有效的登录信息
        if (userInfo && accessToken && tokenExpiry) {
          const now = Date.now()
          if (now < tokenExpiry) {
            // 已登录且令牌未过期，跳转到日程页面
            this.loadingText = '已登录，进入日程页面...'
            setTimeout(() => {
              uni.switchTab({
                url: '/pages/schedule/index',
                fail: (err) => {
                  console.error('跳转日程页面失败:', err)
                  // 如果switchTab失败，尝试navigateTo
                  uni.navigateTo({
                    url: '/pages/schedule/index'
                  })
                }
              })
            }, 500)
            return
          } else {
            // 令牌已过期，清除过期数据
            this.clearExpiredData()
          }
        }
        
        // 未登录或令牌过期，跳转到登录页面
        this.loadingText = '跳转到登录页面...'
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/auth/login'
          })
        }, 500)
        
      } catch (error) {
        console.error('检查登录状态失败:', error)
        this.loadingText = '跳转到登录页面...'
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/auth/login'
          })
        }, 500)
      }
    },
    
    clearExpiredData() {
      try {
        uni.removeStorageSync('user_info')
        uni.removeStorageSync('access_token')
        uni.removeStorageSync('token_expiry')
        console.log('已清除过期的登录数据')
      } catch (error) {
        console.error('清除过期数据失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.auto-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #ffffff;
  font-size: 16px;
  text-align: center;
}
</style>
