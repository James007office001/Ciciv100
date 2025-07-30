<template>
  <view class="app-container">
    <!-- 头部导航 -->
    <view class="header">
      <text class="app-title">CICI</text>
      <text class="app-subtitle">综合社交活动平台</text>
    </view>
    
    <!-- 主要内容区 -->
    <view class="main-content">
      <view class="welcome-section">
        <text class="welcome-title">欢迎使用CICI平台</text>
        <text class="welcome-desc">发现精彩活动，连接美好生活</text>
      </view>
      
      <!-- 功能导航 -->
      <view class="nav-grid">
        <view class="nav-item" @click="navigateTo('/pages/schedule/index')">
          <view class="nav-icon schedule-icon">📅</view>
          <text class="nav-text">日程管理</text>
        </view>
        
        <view class="nav-item" @click="navigateTo('/pages/discover/index')">
          <view class="nav-icon discover-icon">🔍</view>
          <text class="nav-text">发现活动</text>
        </view>
        
        <view class="nav-item" @click="navigateTo('/pages/message/index')">
          <view class="nav-icon message-icon">💬</view>
          <text class="nav-text">消息中心</text>
        </view>
        
        <view class="nav-item" @click="navigateTo('/pages/auth/login')">
          <view class="nav-icon login-icon">👤</view>
          <text class="nav-text">登录账户</text>
        </view>
      </view>
      
      <!-- 状态信息 -->
      <view class="status-section">
        <text class="status-text">应用状态: {{ appStatus }}</text>
        <text class="status-text">当前时间: {{ currentTime }}</text>
      </view>
    </view>
    
    <!-- 底部导航 -->
    <view class="footer-nav">
      <view class="footer-item" @click="switchTab('/pages/schedule/index')">
        <text class="footer-text">日程</text>
      </view>
      <view class="footer-item" @click="switchTab('/pages/discover/index')">
        <text class="footer-text">发现</text>
      </view>
      <view class="footer-item" @click="switchTab('/pages/message/index')">
        <text class="footer-text">消息</text>
      </view>
      <view class="footer-item" @click="navigateTo('/pages/auth/login')">
        <text class="footer-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'IndexPage',
  
  setup() {
    const appStatus = ref('正常运行')
    const currentTime = ref('')
    let timeInterval = null
    
    // 更新时间
    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('zh-CN')
    }
    
    // 页面导航
    const navigateTo = (url) => {
      try {
        uni.navigateTo({ url })
      } catch (error) {
        console.warn('导航失败:', error)
        uni.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    }
    
    // Tab导航
    const switchTab = (url) => {
      try {
        uni.switchTab({ url })
      } catch (error) {
        console.warn('Tab切换失败:', error)
        // 如果switchTab失败，尝试普通导航
        navigateTo(url)
      }
    }
    
    onMounted(() => {
      console.log('CICI首页加载完成')
      updateTime()
      // 每秒更新时间
      timeInterval = setInterval(updateTime, 1000)
      
      // 检查应用状态
      try {
        const systemInfo = uni.getSystemInfoSync()
        console.log('系统信息:', systemInfo)
        appStatus.value = '正常运行'
      } catch (error) {
        console.error('获取系统信息失败:', error)
        appStatus.value = '状态异常'
      }
    })
    
    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })
    
    return {
      appStatus,
      currentTime,
      navigateTo,
      switchTab
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.header {
  padding: 60px 20px 20px;
  text-align: center;
  color: white;
}

.app-title {
  font-size: 32px;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.app-subtitle {
  font-size: 14px;
  opacity: 0.9;
  display: block;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.welcome-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
}

.welcome-title {
  color: white;
  font-size: 20px;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.welcome-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  display: block;
}

.nav-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
}

.nav-item {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.nav-item:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.2);
}

.nav-icon {
  font-size: 32px;
  margin-bottom: 8px;
  display: block;
}

.nav-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
  display: block;
}

.status-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.status-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  display: block;
  margin-bottom: 5px;
}

.footer-nav {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 15px 0;
}

.footer-item {
  flex: 1;
  text-align: center;
  padding: 10px;
}

.footer-text {
  color: white;
  font-size: 12px;
  opacity: 0.8;
}

.footer-item:active {
  background: rgba(255, 255, 255, 0.1);
}
</style>
