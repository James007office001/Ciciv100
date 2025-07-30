<!--
  简化版底部导航栏组件
-->
<template>
  <view class="simple-tabbar">
    <!-- 标签栏内容 -->
    <view class="tabbar-content">
      <!-- 活动标签 -->
      <view 
        class="tab-item"
        :class="{ 'active': currentTab === 'schedule' }"
        @click="switchTab('schedule', '/pages/schedule/index')"
      >
        <view class="tab-icon">
          <text class="icon">📅</text>
        </view>
        <text class="tab-label">活动</text>
        <view v-if="scheduleCount > 0" class="tab-badge">
          <text class="badge-text">{{ scheduleCount }}</text>
        </view>
      </view>
      
      <!-- 发现标签 -->
      <view 
        class="tab-item"
        :class="{ 'active': currentTab === 'discover' }"
        @click="switchTab('discover', '/pages/discover/index')"
      >
        <view class="tab-icon">
          <text class="icon">🔍</text>
        </view>
        <text class="tab-label">发现</text>
      </view>
      
      <!-- 水晶球按钮 -->
      <view class="tab-item crystal-ball" @click="handleCrystalClick">
        <view class="crystal-container">
          <view class="crystal-sphere">
            <text class="crystal-icon">💎</text>
          </view>
        </view>
      </view>
      
      <!-- 消息标签 -->
      <view 
        class="tab-item"
        :class="{ 'active': currentTab === 'message' }"
        @click="switchTab('message', '/pages/message/index')"
      >
        <view class="tab-icon">
          <text class="icon">💬</text>
        </view>
        <text class="tab-label">消息</text>
        <view v-if="messageCount > 0" class="tab-badge">
          <text class="badge-text">{{ messageCount }}</text>
        </view>
      </view>
      
      <!-- 我的标签 -->
      <view 
        class="tab-item"
        :class="{ 'active': currentTab === 'profile' }"
        @click="switchTab('profile', '/pages/profile/index')"
      >
        <view class="tab-icon">
          <text class="icon">👤</text>
        </view>
        <text class="tab-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'SimpleTabbar',
  
  setup() {
    const currentTab = ref('schedule')
    const scheduleCount = ref(2)
    const messageCount = ref(5)
    
    // 切换标签
    const switchTab = (tabId, path) => {
      currentTab.value = tabId
      
      try {
        uni.switchTab({ 
          url: path,
          fail: () => {
            uni.navigateTo({ url: path })
          }
        })
      } catch (error) {
        console.error('导航失败:', error)
        uni.navigateTo({ url: path })
      }
      
      // 触觉反馈
      uni.vibrateShort({ type: 'light' })
    }
    
    // 水晶球点击
    const handleCrystalClick = () => {
      uni.showActionSheet({
        itemList: ['发布动态', '创建活动', '快速打卡', '扫一扫'],
        success: (res) => {
          const actions = ['publish', 'create', 'checkin', 'scan']
          const action = actions[res.tapIndex]
          
          switch (action) {
            case 'publish':
              uni.navigateTo({ url: '/pages/publish/index' })
              break
            case 'create':
              uni.navigateTo({ url: '/pages/event/create' })
              break
            case 'checkin':
              uni.showToast({ title: '打卡成功！', icon: 'success' })
              break
            case 'scan':
              uni.scanCode({
                success: (res) => {
                  console.log('扫码结果:', res.result)
                }
              })
              break
          }
        }
      })
      
      // 强触觉反馈
      uni.vibrateShort({ type: 'heavy' })
    }
    
    return {
      currentTab,
      scheduleCount,
      messageCount,
      switchTab,
      handleCrystalClick
    }
  }
}
</script>

<style lang="scss" scoped>
.simple-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.tabbar-content {
  display: flex;
  height: 50px;
  align-items: center;
  padding: 0 10px;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 4px 0;
  transition: all 0.3s ease;
  
  &.active {
    .icon {
      transform: scale(1.1);
    }
    
    .tab-label {
      color: #667eea;
      font-weight: 600;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.tab-icon {
  position: relative;
  margin-bottom: 2px;
}

.icon {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.tab-label {
  font-size: 10px;
  color: #666;
  transition: all 0.3s ease;
}

.tab-badge {
  position: absolute;
  top: -2px;
  right: 6px;
  background: #ff4757;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.badge-text {
  color: white;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}

/* 水晶球特殊样式 */
.crystal-ball {
  .crystal-container {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .crystal-sphere {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 4px 12px rgba(102, 126, 234, 0.3),
      0 2px 6px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.9);
      box-shadow: 
        0 2px 8px rgba(102, 126, 234, 0.4),
        0 1px 3px rgba(0, 0, 0, 0.2);
    }
  }
  
  .crystal-icon {
    font-size: 16px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }
}

/* 安全区域适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .simple-tabbar {
    padding-bottom: calc(env(safe-area-inset-bottom) + 0px);
  }
}
</style>
