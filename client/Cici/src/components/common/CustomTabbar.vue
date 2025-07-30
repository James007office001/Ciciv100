<!--
  底部标签栏组件
  iOS 26 无色毛玻璃风格的底部导航
-->
<template>
  <view class="custom-tabbar" :class="{ 'tabbar-dark': isDark }">
    <!-- 毛玻璃背景 -->
    <view class="tabbar-background"></view>
    
    <!-- 标签栏内容 -->
    <view class="tabbar-content">
      <!-- 标签栏项 -->
      <view 
        v-for="(tab, index) in tabs" 
        :key="tab.id"
        class="tab-item"
        :class="{ 
          'tab-active': currentTab === tab.id,
          'tab-crystal': tab.id === 'crystal'
        }"
        @click="handleTabClick(tab, index)"
      >
        <!-- 水晶球特殊按钮 -->
        <view v-if="tab.id === 'crystal'" class="crystal-ball" :class="{ 'crystal-active': crystalActive, 'crystal-flipped': crystalFlipped }" @click="handleCrystalClick">
          <!-- 水晶球容器 -->
          <view class="crystal-sphere">
            <!-- 正面 - 麦克风 -->
            <view class="crystal-face crystal-front">
              <view class="crystal-core">
                <view class="microphone-icon">
                  <svg viewBox="0 0 32 32">
                    <rect x="12" y="8" width="8" height="12" rx="4" />
                    <line x1="16" y1="20" x2="16" y2="26" />
                    <path d="M10 26h12" />
                  </svg>
                </view>
              </view>
              <view class="crystal-highlight"></view>
              <view class="crystal-refraction"></view>
            </view>
            
            <!-- 背面 - 镜头 -->
            <view class="crystal-face crystal-back">
              <view class="crystal-core">
                <view class="camera-lens">
                  <svg viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="8" />
                    <circle cx="16" cy="16" r="3" />
                    <rect x="10" y="8" width="12" height="4" rx="2" />
                  </svg>
                </view>
              </view>
              <view class="crystal-highlight"></view>
              <view class="crystal-refraction"></view>
            </view>
          </view>
          
          <!-- 水晶球光晕 -->
          <view class="crystal-aura"></view>
          <view class="crystal-shadow"></view>
        </view>
        
        <!-- 普通标签 -->
        <template v-else>
          <view class="tab-icon">
            <text class="custom-icon" :class="getTabIcon(tab)"></text>
            <view v-if="shouldShowBadge(tab)" class="tab-badge" :class="{ 'badge-wide': getTabBadge(tab) > 9 }">
              <text class="badge-text">{{ formatBadge(getTabBadge(tab)) }}</text>
            </view>
          </view>
          <text class="tab-label">{{ tab.label }}</text>
        </template>
      </view>
    </view>
    
    <!-- 安全区域占位 -->
    <view class="safe-area-bottom" :style="{ height: safeAreaBottom + 'px' }"></view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CustomTabbar',
  
  setup() {
    // 直接定义状态，不依赖store
    const currentTab = ref('schedule')
    const crystalActive = ref(false)
    const crystalFlipped = ref(false)
    const isDark = ref(false)
    const safeAreaBottom = ref(0)
    
    // 模拟数据
    const todayIncompleteEventsCount = ref(2)
    const unreadMessagesCount = ref(5)
    
    // 标签配置
    const tabs = ref([
      {
        id: 'schedule',
        label: '活动',
        icon: 'calendar',
        iconActive: 'calendar-filled',
        path: '/pages/schedule/index',
        showBadge: true,
        badgeType: 'count'
      },
      {
        id: 'discover',
        label: '发现',
        icon: 'compass',
        iconActive: 'compass-filled',
        path: '/pages/discover/index',
        showBadge: false
      },
      {
        id: 'crystal',
        label: '',
        path: ''
      },
      {
        id: 'message',
        label: '消息',
        icon: 'message',
        iconActive: 'message-filled',
        path: '/pages/message/index',
        showBadge: true,
        badgeType: 'count'
      },
      {
        id: 'profile',
        label: '我的',
        icon: 'person',
        iconActive: 'person-filled',
        path: '/pages/profile/index',
        showBadge: false
      }
    ])
    
    // 计算活动tab的徽章数量
    const scheduleTabBadge = computed(() => todayIncompleteEventsCount.value)
    
    // 计算消息tab的徽章数量
    const messageTabBadge = computed(() => unreadMessagesCount.value)
    
    // 获取tab的徽章数量
    const getTabBadge = (tab) => {
      if (!tab.showBadge) return 0
      
      switch (tab.id) {
        case 'schedule':
          return scheduleTabBadge.value
        case 'message':
          return messageTabBadge.value
        default:
          return 0
      }
    }
    
    // 判断是否显示徽章
    const shouldShowBadge = (tab) => {
      if (!tab.showBadge) return false
      const badgeCount = getTabBadge(tab)
      return badgeCount > 0
    }
    
    // 获取标签图标
    const getTabIcon = (tab) => {
      if (currentTab.value === tab.id && tab.iconActive) {
        return `icon-${tab.iconActive}`
      }
      return `icon-${tab.icon}`
    }
    
    // 格式化徽章
    const formatBadge = (count) => {
      if (count > 99) {
        return '99+'
      }
      return count.toString()
    }
    
    // 标签点击事件
    const handleTabClick = (tab, index) => {
      if (tab.id === 'crystal') {
        // 水晶球点击事件
        handleCrystalClick()
        return
      }
      
      // 切换标签 (这会自动更新导航栏指示器)
      appStore.setCurrentTab(tab.id)
      
      // 路由跳转
      if (tab.path && tab.path !== getCurrentPages().slice(-1)[0].route) {
        uni.switchTab({
          url: tab.path,
          fail: () => {
            uni.navigateTo({
              url: tab.path
            })
          }
        })
      }
      
      // 添加触觉反馈
      uni.vibrateShort({
        type: 'light'
      })
    }
    
    // 水晶球点击事件
    const handleCrystalClick = () => {
      // 翻转水晶球显示前后面
      crystalFlipped.value = !crystalFlipped.value
      crystalActive.value = !crystalActive.value
      
      // 强触觉反馈
      uni.vibrateShort({
        type: 'heavy'
      })
      
      // 根据翻转状态执行不同功能
      if (crystalFlipped.value) {
        // 背面：相机功能
        handleCameraAction()
      } else {
        // 正面：语音功能
        handleVoiceAction()
      }
    }
    
    // 显示水晶球菜单
    const showCrystalMenu = () => {
      const actions = [
        { name: '发布动态', icon: 'edit', action: 'publish' },
        { name: '创建活动', icon: 'add-circle', action: 'create-activity' },
        { name: '快速打卡', icon: 'checkmark-circle', action: 'quick-checkin' },
        { name: '扫一扫', icon: 'scan', action: 'scan' }
      ]
      
      uni.showActionSheet({
        itemList: actions.map(item => item.name),
        success: (res) => {
          const action = actions[res.tapIndex]
          handleCrystalAction(action.action)
        }
      })
    }
    
    // 处理水晶球功能
    const handleCrystalAction = (action) => {
      switch (action) {
        case 'publish':
          uni.navigateTo({
            url: '/pages/publish/index'
          })
          break
        case 'create-activity':
          uni.navigateTo({
            url: '/pages/activity/create'
          })
          break
        case 'quick-checkin':
          // 快速打卡逻辑
          break
        case 'scan':
          // 扫码功能
          uni.scanCode({
            success: (res) => {
              console.log('扫码结果：', res)
            }
          })
          break
      }
    }
    
    // 相机功能
    const handleCameraAction = () => {
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['camera'],
        success: (res) => {
          console.log('拍照成功：', res)
          // 处理拍照结果
        }
      })
    }
    
    // 语音功能
    const handleVoiceAction = () => {
      uni.showModal({
        title: '语音助手',
        content: '长按开始录音，释放结束录音',
        showCancel: false,
        confirmText: '知道了'
      })
    }
    
    return {
      tabs,
      currentTab,
      crystalActive,
      crystalFlipped,
      isDark,
      safeAreaBottom,
      getTabIcon,
      formatBadge,
      handleTabClick,
      handleCrystalClick,
      handleCameraAction,
      handleVoiceAction,
      handleCrystalAction,
      showCrystalMenu,
      getTabBadge,
      shouldShowBadge
    }
  }
}
</script>

<style lang="scss" scoped>
/* 现代简约风格的Tab图标 */
.custom-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: "";
    display: block;
    width: 24px;
    height: 24px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
}

.crystal-front, .crystal-back {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 0%, transparent 60%),
    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%),
    linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 80%);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  box-shadow:
    0 25px 50px rgba(0,0,0,0.02),
    0 10px 20px rgba(0,0,0,0.03),
    0 4px 8px rgba(0,0,0,0.04),
    inset 0 1px 0 rgba(255,255,255,0.15),
    inset 0 -1px 0 rgba(255,255,255,0.08);
}
.crystal-back {
  transform: rotateY(180deg);
}

/* Tab图标 - 非高亮状态 */
.icon-calendar::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E");
}

.icon-compass::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolygon points='16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76'/%3E%3C/svg%3E");
}

.icon-message::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'/%3E%3C/svg%3E");
}

.icon-person::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E");
}

/* Tab图标 - 高亮状态 */
.icon-calendar-filled::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23006400' stroke='%23006400' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2' fill='%23006400'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E");
}

.icon-compass-filled::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23006400' stroke='%23006400' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23006400'/%3E%3Cpolygon points='16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76'/%3E%3C/svg%3E");
}

.icon-message-filled::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23006400' stroke='%23006400' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' fill='%23006400'/%3E%3C/svg%3E");
}

.icon-person-filled::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23006400' stroke='%23006400' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' fill='%23006400'/%3E%3Ccircle cx='12' cy='7' r='4' fill='%23006400'/%3E%3C/svg%3E");
}

/* 水晶球/星光图标 */
.icon-sparkles::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FFD700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z'/%3E%3Cpath d='M20 3v4'/%3E%3Cpath d='M22 5h-4'/%3E%3Cpath d='M4 17v2'/%3E%3Cpath d='M5 18H3'/%3E%3C/svg%3E");
}

/* 暗色模式适配 */
.tabbar-dark {
  .icon-calendar::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23CCCCCC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E");
  }
  
  .icon-compass::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23CCCCCC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolygon points='16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76'/%3E%3C/svg%3E");
  }
  
  .icon-message::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23CCCCCC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'/%3E%3C/svg%3E");
  }
  
  .icon-person::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23CCCCCC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E");
  }
}

.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  @extend .glass-nav;
  
  &.tabbar-dark {
    --glass-nav-bg: rgba(0, 0, 0, 0.12);
    --color-text-primary: rgba(255, 255, 255, 0.9);
    --color-text-secondary: rgba(255, 255, 255, 0.6);
  }
}

.tabbar-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  pointer-events: none;
  
  .tabbar-dark & {
    background: linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
  }
}

.tabbar-content {
  height: var(--tabbar-height);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-md);
  position: relative;
}

.tab-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-default);
  
  &:active:not(.tab-crystal) {
    transform: scale(0.95);
  }
  
  &.tab-crystal {
    position: relative;
    margin-top: -20px;
  }
}

.tab-icon {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  
  .custom-icon {
    font-size: 24px;
    color: var(--color-text-secondary);
    transition: all var(--duration-fast) var(--easing-default);
  }
  
  .tab-active & .custom-icon {
    color: #006400; /* 深绿色 */
    transform: scale(1.1);
  }
}

.tab-label {
  font-size: var(--font-size-caption2);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  transition: color var(--duration-fast) var(--easing-default);
  
  .tab-active & {
    color: #006400; /* 深绿色 */
    font-weight: var(--font-weight-semibold);
  }
}

.tab-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  min-width: 18px;
  width: 18px;
  height: 18px;
  background: var(--color-error);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  
  /* 当数字超过两位时，自动扩展为椭圆形 */
  &.badge-wide {
    width: auto;
    min-width: 20px;
    padding: 0 4px;
    border-radius: 10px;
  }
  
  &.badge-dot {
    width: 8px;
    height: 8px;
    min-width: auto;
    top: -2px;
    right: -2px;
  }
}

.badge-text {
  font-size: 10px;
  color: white;
  font-weight: 600;
  line-height: 1;
  text-align: center;
}

/* 水晶球样式 */
.crystal-ball {
  position: relative;
  width: 64px;
  height: 64px;
  cursor: pointer;
  
  &:active {
    transform: scale(0.9);
  }
  
  &.crystal-active {
    animation: crystalPulse 2s infinite;
    
    .crystal-glow {
      opacity: 1;
      transform: scale(1.2);
    }
  }
}


/* 3D无色水晶球容器 */
.crystal-sphere {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  perspective: 1000px;
}

.crystal-sphere.flipped {
  transform: rotateY(180deg);
}

/* 水晶球前面 - 麦克风 */
.crystal-front {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 65%),
    radial-gradient(circle at 70% 70%, rgba(255,255,255,0.08) 0%, transparent 45%),
    linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 75%);
  backdrop-filter: blur(16px);
  border: 0.5px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  box-shadow:
    0 30px 60px rgba(0,0,0,0.01),
    0 12px 24px rgba(0,0,0,0.02),
    0 6px 12px rgba(0,0,0,0.03),
    inset 0 1px 0 rgba(255,255,255,0.12),
    inset 0 -1px 0 rgba(255,255,255,0.06);
}

/* 水晶球背面 - 相机镜头 */
.crystal-back {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 70% 30%, rgba(255,255,255,0.25) 0%, transparent 65%),
    radial-gradient(circle at 30% 70%, rgba(255,255,255,0.08) 0%, transparent 45%),
    linear-gradient(45deg, rgba(255,255,255,0.04) 0%, transparent 75%);
  backdrop-filter: blur(16px);
  border: 0.5px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  box-shadow:
    0 30px 60px rgba(0,0,0,0.01),
    0 12px 24px rgba(0,0,0,0.02),
    0 6px 12px rgba(0,0,0,0.03),
    inset 0 1px 0 rgba(255,255,255,0.12),
    inset 0 -1px 0 rgba(255,255,255,0.06);
}

/* 极简麦克风SVG图标 */
.microphone-icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 100%;
    height: 100%;
    stroke: rgba(70,70,70,0.7);
    stroke-width: 1.6;
    fill: none;
    filter: drop-shadow(0 0.5px 1px rgba(0,0,0,0.08));
  }
}

/* 极简相机SVG图标 */
.camera-lens {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 100%;
    height: 100%;
    stroke: rgba(70,70,70,0.7);
    stroke-width: 1.6;
    fill: none;
    filter: drop-shadow(0 0.5px 1px rgba(0,0,0,0.08));
  }
}

/* 水晶高光效果 */
.crystal-highlight {
  position: absolute;
  top: 14px;
  left: 20px;
  width: 12px;
  height: 18px;
  border-radius: 50%;
  background:
    linear-gradient(125deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 60%, transparent 100%);
  filter: blur(0.8px);
  animation: highlightShimmer 4s ease-in-out infinite alternate;
}

/* 折射效果 */
.crystal-refraction {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background:
    conic-gradient(from 45deg,
      transparent 0deg,
      rgba(255,255,255,0.02) 50deg,
      transparent 100deg,
      rgba(250,250,250,0.015) 150deg,
      transparent 200deg,
      rgba(255,255,255,0.02) 250deg,
      transparent 300deg,
      rgba(250,250,250,0.015) 350deg,
      transparent 360deg
    );
  animation: refractionRotate 15s linear infinite;
}

/* 外发光 */
.crystal-aura {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
  animation: auraGlow 5s ease-in-out infinite alternate;
  z-index: -1;
}

/* 投影 */
.crystal-shadow {
  position: absolute;
  bottom: -4px;
  left: 20%;
  right: 20%;
  height: 4px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0,0,0,0.04) 0%, transparent 80%);
  filter: blur(2px);
  transform: scaleY(0.3);
  animation: shadowPulse 5s ease-in-out infinite;
  z-index: -2;
}

/* 动画定义 */
@keyframes highlightShimmer {
  0% { opacity: 0.2; transform: translateX(0) translateY(0) scale(1); }
  100% { opacity: 0.5; transform: translateX(0.5px) translateY(-0.5px) scale(1.02); }
}

@keyframes refractionRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes auraGlow {
  0% { opacity: 0.03; transform: scale(1); }
  100% { opacity: 0.08; transform: scale(1.03); }
}

@keyframes shadowPulse {
  0%, 100% { opacity: 0.04; transform: scaleY(0.3) scaleX(1); }
  50% { opacity: 0.08; transform: scaleY(0.4) scaleX(1.02); }
}

/* 点击反馈效果 */
.crystal-ball:active .crystal-sphere {
  transform: scale(0.97) rotateY(var(--rotation, 0deg));
  transition: transform 0.1s ease-out;
}

.crystal-ball:active .crystal-aura {
  opacity: 0.1;
  transform: scale(1.05);
}

.safe-area-bottom {
  width: 100%;
}

/* 响应式适配 */
@media (max-width: 375px) {
  .tabbar-content {
    padding: 0 var(--spacing-sm);
  }
  
  .tab-label {
    font-size: 10px;
  }
  
  .crystal-ball {
    width: 56px;
    height: 56px;
    
    .custom-icon {
      font-size: 24px;
    }
  }
}

/* 动画定义 */
@keyframes crystalPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 水波纹效果 */
.tab-item:not(.tab-crystal):active::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: var(--radius-full);
  background: rgba(var(--color-primary), 0.2);
  transform: translate(-50%, -50%);
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    width: 60px;
    height: 60px;
    opacity: 0;
  }
}
</style>
