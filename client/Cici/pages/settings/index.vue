<!--
  CICI 社交圈子平台 - 设置页面
-->
<template>
  <view class="settings-page">
    <!-- 顶部导航栏 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">&lt;</text>
      </view>
      <view class="header-title">
        <text class="title-text">设置</text>
      </view>
      <view class="header-right">
        <!-- 占位符 -->
      </view>
    </view>
    
    <!-- 页面内容区域 -->
    <scroll-view 
      class="settings-content" 
      scroll-y="true"
      :enhanced="true"
    >
      <!-- 账户与安全 -->
      <view class="settings-section">
        <view class="section-title">
          <text class="title">账户与安全</text>
        </view>
        
        <view class="settings-group">
          <view class="setting-item" @click="goToAccountSecurity">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">🔐</text>
              </view>
              <text class="item-title">账户与安全</text>
            </view>
            <view class="item-right">
              <text class="item-arrow">›</text>
            </view>
          </view>
          
          <view class="setting-item" @click="goToPrivacy">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">🔒</text>
              </view>
              <text class="item-title">隐私设置</text>
            </view>
            <view class="item-right">
              <text class="item-arrow">›</text>
            </view>
          </view>
          
          <view class="setting-item" @click="goToBlacklist">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">🚫</text>
              </view>
              <text class="item-title">黑名单管理</text>
            </view>
            <view class="item-right">
              <text class="item-arrow">›</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 通知与消息 -->
      <view class="settings-section">
        <view class="section-title">
          <text class="title">通知与消息</text>
        </view>
        
        <view class="settings-group">
          <view class="setting-item" @click="goToNotifications">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">🔔</text>
              </view>
              <text class="item-title">消息通知</text>
            </view>
            <view class="item-right">
              <text class="item-arrow">›</text>
            </view>
          </view>
          
          <view class="setting-item">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">📳</text>
              </view>
              <text class="item-title">震动提醒</text>
            </view>
            <view class="item-right">
              <switch 
                :checked="settings.vibrationEnabled" 
                @change="toggleVibration"
                color="#667eea"
              />
            </view>
          </view>
          
          <view class="setting-item">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">🔊</text>
              </view>
              <text class="item-title">声音提醒</text>
            </view>
            <view class="item-right">
              <switch 
                :checked="settings.soundEnabled" 
                @change="toggleSound"
                color="#667eea"
              />
            </view>
          </view>
        </view>
      </view>
      
      <!-- 显示与界面 -->
      <view class="settings-section">
        <view class="section-title">
          <text class="title">显示与界面</text>
        </view>
        
        <view class="settings-group">
          <view class="setting-item" @click="goToTheme">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">🎨</text>
              </view>
              <text class="item-title">主题设置</text>
            </view>
            <view class="item-right">
              <text class="item-value">{{ getThemeName() }}</text>
              <text class="item-arrow">›</text>
            </view>
          </view>
          
          <view class="setting-item" @click="goToFontSize">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">📝</text>
              </view>
              <text class="item-title">字体大小</text>
            </view>
            <view class="item-right">
              <text class="item-value">{{ getFontSizeName() }}</text>
              <text class="item-arrow">›</text>
            </view>
          </view>
          
          <view class="setting-item">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">🌙</text>
              </view>
              <text class="item-title">深色模式</text>
            </view>
            <view class="item-right">
              <switch 
                :checked="settings.darkMode" 
                @change="toggleDarkMode"
                color="#667eea"
              />
            </view>
          </view>
        </view>
      </view>
      
      <!-- 功能设置 -->
      <view class="settings-section">
        <view class="section-title">
          <text class="title">功能设置</text>
        </view>
        
        <view class="settings-group">
          <view class="setting-item" @click="goToLanguage">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">🌐</text>
              </view>
              <text class="item-title">语言设置</text>
            </view>
            <view class="item-right">
              <text class="item-value">中文简体</text>
              <text class="item-arrow">›</text>
            </view>
          </view>
          
          <view class="setting-item">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">📱</text>
              </view>
              <text class="item-title">自动更新</text>
            </view>
            <view class="item-right">
              <switch 
                :checked="settings.autoUpdate" 
                @change="toggleAutoUpdate"
                color="#667eea"
              />
            </view>
          </view>
          
          <view class="setting-item" @click="goToStorage">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">💾</text>
              </view>
              <text class="item-title">存储管理</text>
            </view>
            <view class="item-right">
              <text class="item-value">{{ storageUsed }}</text>
              <text class="item-arrow">›</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 关于与帮助 -->
      <view class="settings-section">
        <view class="section-title">
          <text class="title">关于与帮助</text>
        </view>
        
        <view class="settings-group">
          <view class="setting-item" @click="goToHelp">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">❓</text>
              </view>
              <text class="item-title">帮助与反馈</text>
            </view>
            <view class="item-right">
              <text class="item-arrow">›</text>
            </view>
          </view>
          
          <view class="setting-item" @click="goToAbout">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">ℹ️</text>
              </view>
              <text class="item-title">关于CICI</text>
            </view>
            <view class="item-right">
              <text class="item-value">v2.1.0</text>
              <text class="item-arrow">›</text>
            </view>
          </view>
          
          <view class="setting-item" @click="checkUpdate">
            <view class="item-left">
              <view class="item-icon">
                <text class="icon">🔄</text>
              </view>
              <text class="item-title">检查更新</text>
            </view>
            <view class="item-right">
              <text class="item-arrow">›</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 退出登录按钮 -->
      <view class="logout-section">
        <view class="logout-btn" @click="showLogoutConfirm">
          <text class="logout-text">退出登录</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../src/store/modules/user.js'
import { resetStores } from '../../src/store/index.js'

export default {
  name: 'SettingsPage',
  
  setup() {
    // 获取用户store
    const userStore = useUserStore()
    
    // 设置数据
    const settings = ref({
      vibrationEnabled: true,
      soundEnabled: true,
      darkMode: false,
      autoUpdate: true,
      theme: 'default', // default, purple, blue, green
      fontSize: 'medium' // small, medium, large
    })
    
    const storageUsed = ref('128.5 MB')
    
    // 返回上一页
    const goBack = () => {
      uni.navigateBack()
    }
    
    // 获取主题名称
    const getThemeName = () => {
      const themeNames = {
        default: '默认',
        purple: '紫色',
        blue: '蓝色',
        green: '绿色'
      }
      return themeNames[settings.value.theme] || '默认'
    }
    
    // 获取字体大小名称
    const getFontSizeName = () => {
      const fontSizeNames = {
        small: '小',
        medium: '中',
        large: '大'
      }
      return fontSizeNames[settings.value.fontSize] || '中'
    }
    
    // 切换震动
    const toggleVibration = (e) => {
      settings.value.vibrationEnabled = e.detail.value
      saveSettings()
    }
    
    // 切换声音
    const toggleSound = (e) => {
      settings.value.soundEnabled = e.detail.value
      saveSettings()
    }
    
    // 切换深色模式
    const toggleDarkMode = (e) => {
      settings.value.darkMode = e.detail.value
      saveSettings()
      // TODO: 应用深色模式
    }
    
    // 切换自动更新
    const toggleAutoUpdate = (e) => {
      settings.value.autoUpdate = e.detail.value
      saveSettings()
    }
    
    // 保存设置
    const saveSettings = () => {
      try {
        uni.setStorageSync('app_settings', settings.value)
        console.log('设置已保存')
      } catch (error) {
        console.error('保存设置失败:', error)
      }
    }
    
    // 加载设置
    const loadSettings = () => {
      try {
        const savedSettings = uni.getStorageSync('app_settings')
        if (savedSettings) {
          settings.value = { ...settings.value, ...savedSettings }
        }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    }
    
    // 跳转到账户安全
    const goToAccountSecurity = () => {
      uni.navigateTo({
        url: '/pages/settings/account-security'
      })
    }
    
    // 跳转到隐私设置
    const goToPrivacy = () => {
      uni.navigateTo({
        url: '/pages/settings/privacy'
      })
    }
    
    // 跳转到黑名单
    const goToBlacklist = () => {
      uni.navigateTo({
        url: '/pages/settings/blacklist'
      })
    }
    
    // 跳转到通知设置
    const goToNotifications = () => {
      uni.navigateTo({
        url: '/pages/settings/notifications'
      })
    }
    
    // 跳转到主题设置
    const goToTheme = () => {
      uni.navigateTo({
        url: '/pages/settings/theme'
      })
    }
    
    // 跳转到字体设置
    const goToFontSize = () => {
      uni.navigateTo({
        url: '/pages/settings/font-size'
      })
    }
    
    // 跳转到语言设置
    const goToLanguage = () => {
      uni.navigateTo({
        url: '/pages/settings/language'
      })
    }
    
    // 跳转到存储管理
    const goToStorage = () => {
      uni.navigateTo({
        url: '/pages/settings/storage'
      })
    }
    
    // 跳转到帮助
    const goToHelp = () => {
      uni.navigateTo({
        url: '/pages/help/index'
      })
    }
    
    // 跳转到关于
    const goToAbout = () => {
      uni.navigateTo({
        url: '/pages/about/index'
      })
    }
    
    // 检查更新
    const checkUpdate = () => {
      uni.showLoading({
        title: '检查更新中...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '已是最新版本',
          icon: 'success'
        })
      }, 2000)
    }
    
    // 显示退出登录确认
    const showLogoutConfirm = () => {
      console.log('显示退出登录确认对话框')
      uni.showModal({
        title: '退出登录',
        content: '确定要退出当前账号吗？',
        confirmText: '退出',
        confirmColor: '#ff6b6b',
        success: (res) => {
          console.log('用户选择:', res)
          if (res.confirm) {
            console.log('用户确认退出，开始执行登出流程')
            logout()
          } else {
            console.log('用户取消退出')
          }
        },
        fail: (err) => {
          console.error('显示确认对话框失败:', err)
        }
      })
    }
    
    // 退出登录
    const logout = async () => {
      console.log('开始退出登录流程')
      
      try {
        // 使用用户store的登出方法
        await userStore.logout()
        
        // 重置所有stores
        resetStores()
        
        console.log('用户数据清除成功')
      } catch (error) {
        console.error('退出登录失败:', error)
      }
      
      uni.showToast({
        title: '已退出登录',
        icon: 'success',
        duration: 1500
      })
      
      console.log('显示退出提示，1.5秒后跳转到登录页面')
      setTimeout(() => {
        console.log('开始跳转到登录页面')
        uni.reLaunch({
          url: '/pages/auth/login',
          success: () => {
            console.log('成功跳转到登录页面')
          },
          fail: (err) => {
            console.error('跳转到登录页面失败:', err)
            // 如果跳转失败，尝试使用 switchTab
            uni.switchTab({
              url: '/pages/auth/login',
              fail: (err2) => {
                console.error('switchTab 也失败:', err2)
              }
            })
          }
        })
      }, 1500)
    }
    
    // 生命周期
    onMounted(() => {
      loadSettings()
    })
    
    return {
      settings,
      storageUsed,
      goBack,
      getThemeName,
      getFontSizeName,
      toggleVibration,
      toggleSound,
      toggleDarkMode,
      toggleAutoUpdate,
      goToAccountSecurity,
      goToPrivacy,
      goToBlacklist,
      goToNotifications,
      goToTheme,
      goToFontSize,
      goToLanguage,
      goToStorage,
      goToHelp,
      goToAbout,
      checkUpdate,
      showLogoutConfirm
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  padding-top: calc(var(--status-bar-height, 0px) + 80rpx);
  box-sizing: border-box;
}

/* 顶部导航栏 */
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 7rpx 20rpx;
  padding-top: calc(var(--status-bar-height, 0px) + 7rpx);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.05);
  height: calc(var(--status-bar-height, 0px) + 80rpx);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 28rpx;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:active {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(0.95);
  }
}

.back-icon {
  color: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
  font-weight: bold;
}

.header-title {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 32rpx;
  font-weight: 500;
}

.header-right {
  width: 56rpx;
}

/* 页面内容区域 */
.settings-content {
  flex: 1;
  height: calc(100vh - var(--status-bar-height, 0px) - 80rpx);
  padding: 20rpx 0;
}

/* 设置分组 */
.settings-section {
  margin-bottom: 32rpx;
  padding: 0 20rpx;
}

.section-title {
  margin-bottom: 16rpx;
  padding: 0 12rpx;
}

.title {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  font-weight: 500;
}

.settings-group {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon {
  width: 56rpx;
  height: 56rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.icon {
  font-size: 24rpx;
}

.item-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
  font-weight: 500;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.item-value {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

.item-arrow {
  color: rgba(255, 255, 255, 0.5);
  font-size: 32rpx;
  font-weight: 300;
}

/* 退出登录 */
.logout-section {
  padding: 0 20rpx;
  margin-bottom: 32rpx;
}

.logout-btn {
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 20rpx;
  padding: 32rpx;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:active {
    background: rgba(255, 107, 107, 0.25);
    transform: scale(0.98);
  }
}

.logout-text {
  color: #ff6b6b;
  font-size: 28rpx;
  font-weight: 500;
}

/* Switch组件样式覆盖 */
::v-deep .uni-switch-input {
  transform: scale(0.8);
}

/* 响应式适配 */
@media (max-width: 375px) {
  .setting-item {
    padding: 24rpx;
  }
  
  .item-title {
    font-size: 26rpx;
  }
  
  .item-value {
    font-size: 22rpx;
  }
}
</style>
