<!--
  CICI 社交活动平台 - 消息模块主页
-->
<template>
  <view class="message-page">
    <!-- 顶部标题栏 -->
    <view class="page-header">
      <view class="header-left">
        <view class="search-container">
          <input 
            class="search-input" 
            type="text" 
            placeholder="搜索消息" 
            v-model="searchText"
            @input="handleSearch"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
          />
          <view class="search-icon">
            <text class="icon-search">🔍</text>
          </view>
        </view>
      </view>
      <view class="header-right">
        <view class="explore-btn" @click="goToExplore">
          <text class="explore-text">探圈</text>
        </view>
      </view>
    </view>
    
    <!-- 消息内容区域 -->
    <scroll-view class="message-content" scroll-y="true" :enhanced="true">
      <!-- 消息列表 -->
      <view class="message-list">
        <view 
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="{ 'message-unread': !message.read }"
          @click="handleMessageClick(message)"
        >
          <view class="avatar-container">
            <image class="message-avatar" :src="message.avatar" mode="aspectFill" />
            <view v-if="message.type === 'group'" class="group-indicator">
              <text class="group-icon">👥</text>
            </view>
          </view>
          <view class="message-content-area">
            <view class="message-info-header">
              <text class="message-name">{{ message.name }}</text>
              <text class="message-time">{{ message.time }}</text>
            </view>
            <view class="message-last">
              <text class="message-text" :class="{ 'message-draft': message.draft }">
                <text v-if="message.draft" class="draft-prefix">[草稿]</text>
                {{ message.lastMessage }}
              </text>
              <view v-if="message.unreadCount > 0" class="message-badge">
                <text class="badge-text">{{ formatUnreadCount(message.unreadCount) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="messages.length === 0" class="empty-state">
        <text class="empty-icon">💬</text>
        <text class="empty-text">暂无消息</text>
      </view>
    </scroll-view>
    
    <!-- 底部标签栏 -->
    <SimpleTabbar />
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import SimpleTabbar from '../../src/components/common/SimpleTabbar.vue'
import { useAppStore } from '../../src/store/modules/app.js'

export default {
  name: 'MessagePage',
  components: {
    SimpleTabbar
  },
  
  setup() {
    const appStore = useAppStore()
    
    // 搜索相关
    const searchText = ref('')
    const isSearchFocused = ref(false)
    
    // 消息列表
    const messages = ref([
      {
        id: 1,
        name: '摄影爱好者群',
        avatar: '/static/c1.png',
        lastMessage: '大家明天的拍摄活动记得带上三脚架',
        time: '10:30',
        read: false,
        unreadCount: 3,
        type: 'group',
        draft: false
      },
      {
        id: 2,
        name: '小红',
        avatar: '/static/c6.png',
        lastMessage: '我们一起参加摄影展吧，听说这次有很多大师作品',
        time: '09:15',
        read: false,
        unreadCount: 1,
        type: 'private',
        draft: false
      },
      {
        id: 3,
        name: '户外活动群',
        avatar: '/static/c2.png',
        lastMessage: '下周末的登山活动确认参加人员',
        time: '昨天',
        read: false,
        unreadCount: 5,
        type: 'group',
        draft: false
      },
      {
        id: 4,
        name: '小明',
        avatar: '/static/c5.png',
        lastMessage: '今天的日落真的太美了',
        time: '昨天',
        read: true,
        unreadCount: 0,
        type: 'private',
        draft: true
      },
      {
        id: 5,
        name: '美食分享群',
        avatar: '/static/c3.png',
        lastMessage: '刚发现一家超棒的咖啡店',
        time: '前天',
        read: true,
        unreadCount: 0,
        type: 'group',
        draft: false
      },
      {
        id: 6,
        name: '小李',
        avatar: '/static/c8.png',
        lastMessage: '感谢分享那些摄影技巧',
        time: '前天',
        read: false,
        unreadCount: 1,
        type: 'private',
        draft: false
      },
      {
        id: 7,
        name: '系统通知',
        avatar: '/static/c9.png',
        lastMessage: '您有一个新的好友请求',
        time: '3天前',
        read: false,
        unreadCount: 2,
        type: 'system',
        draft: false
      }
    ])
    
    // 计算总未读数
    const totalUnreadCount = computed(() => {
      return messages.value.reduce((total, message) => {
        return total + (message.read ? 0 : message.unreadCount)
      }, 0)
    })
    
    // 格式化未读数
    const formatUnreadCount = (count) => {
      if (count > 99) {
        return '99+'
      }
      return count.toString()
    }
    
    // 跳转到探圈页面
    const goToExplore = () => {
      uni.navigateTo({
        url: '/pages/discover/index'
      })
    }
    
    // 搜索处理
    const handleSearch = (e) => {
      searchText.value = e.detail.value
      // TODO: 实现搜索逻辑
      console.log('搜索内容:', searchText.value)
    }
    
    // 搜索框获得焦点
    const handleSearchFocus = () => {
      isSearchFocused.value = true
    }
    
    // 搜索框失去焦点
    const handleSearchBlur = () => {
      isSearchFocused.value = false
    }
    
    // 显示搜索
    const showSearch = () => {
      uni.navigateTo({
        url: '/pages/search/message'
      })
    }
    
    // 显示更多选项
    const showMore = () => {
      uni.showActionSheet({
        itemList: ['发起群聊', '添加朋友', '扫一扫', '收付款'],
        success: (res) => {
          console.log('选择了第' + (res.tapIndex + 1) + '个选项')
        }
      })
    }
    
    // 处理消息点击
    const handleMessageClick = (message) => {
      // 标记为已读
      message.read = true
      message.unreadCount = 0
      
      // 更新store中的未读计数
      updateUnreadCount()
      
      // 跳转到聊天详情页面
      uni.navigateTo({
        url: `/pages/chat/detail?id=${message.id}&name=${encodeURIComponent(message.name)}&type=${message.type}`
      })
    }
    
    // 更新未读计数
    const updateUnreadCount = () => {
      appStore.setUnreadMessagesCount(totalUnreadCount.value)
    }
    
    // 生命周期
    onMounted(() => {
      // 设置当前页面
      appStore.setCurrentTab('message')
      
      // 更新未读消息计数
      updateUnreadCount()
    })
    
    return {
      messages,
      totalUnreadCount,
      formatUnreadCount,
      searchText,
      isSearchFocused,
      goToExplore,
      handleSearch,
      handleSearchFocus,
      handleSearchBlur,
      showSearch,
      showMore,
      handleMessageClick,
      updateUnreadCount
    }
  }
}
</script>

<style lang="scss" scoped>
.message-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: calc(var(--status-bar-height, 0px) + 80rpx);
  box-sizing: border-box;
}

/* 顶部标题栏 */
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
}

/* 消息内容区域 */
.message-content {
  flex: 1;
  height: calc(100vh - var(--status-bar-height, 0px) - 80rpx - var(--tabbar-height, 98px) - var(--safe-area-bottom, 0px));
  padding: 12rpx 0;
}

/* 搜索栏样式已移除 */

.header-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: calc(100% - 90px);
  padding-left: 15px;
  padding-right: 15px;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 180px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.search-container:focus-within {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.search-input {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  padding: 0 12px 0 36px;
  border-radius: 12px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.icon-search {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 90px;
  padding-right: 15px;
}

.explore-btn {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-width: 56px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.explore-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.95);
  border-color: rgba(255, 255, 255, 0.3);
}

.message-list {
  background: transparent;
  border-radius: 0;
  margin: 0;
  border: none;
  overflow: hidden;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20rpx;
  margin: 0 20rpx 12rpx 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.98);
  }
  
  &.message-unread {
    background: rgba(255, 255, 255, 0.12);
    
    .message-name {
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);
    }
  }
}

.avatar-container {
  position: relative;
  margin-right: 24rpx;
  
  .message-avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  }
  
  .group-indicator {
    position: absolute;
    bottom: -4rpx;
    right: -4rpx;
    width: 32rpx;
    height: 32rpx;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
    
    .group-icon {
      font-size: 16rpx;
      color: rgba(0, 0, 0, 0.6);
    }
  }
}

.message-content-area {
  flex: 1;
  overflow: hidden;
}

.message-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
  
  .message-name {
    color: rgba(255, 255, 255, 0.9);
    font-size: 32rpx;
    font-weight: 400;
    max-width: 400rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .message-time {
    color: rgba(255, 255, 255, 0.6);
    font-size: 24rpx;
    flex-shrink: 0;
  }
}

.message-last {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  
  .message-text {
    flex: 1;
    color: rgba(255, 255, 255, 0.7);
    font-size: 26rpx;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    &.message-draft {
      color: #ff6b6b;
      
      .draft-prefix {
        color: #ff6b6b;
        font-weight: 500;
      }
    }
  }
  
  .message-badge {
    min-width: 32rpx;
    height: 32rpx;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff3b30 100%);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8rpx;
    flex-shrink: 0;
    box-shadow: 0 4rpx 12rpx rgba(255, 59, 48, 0.3);
    
    .badge-text {
      color: white;
      font-size: 20rpx;
      font-weight: 500;
    }
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 120rpx 64rpx;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20rpx;
  margin: 12rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  
  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
    opacity: 0.3;
  }
  
  .empty-text {
    color: rgba(255, 255, 255, 0.6);
    font-size: 28rpx;
  }
}

/* 响应式适配 */
@media (max-width: 375px) {
  .page-header {
    padding-left: 16rpx;
    padding-right: 16rpx;
  }
  
  .message-item {
    padding: 20rpx 24rpx;
  }
  
  .avatar-container {
    margin-right: 20rpx;
    
    .message-avatar {
      width: 88rpx;
      height: 88rpx;
    }
  }
  
  .message-name {
    font-size: 30rpx;
    max-width: 300rpx;
  }
  
  .message-text {
    font-size: 24rpx;
  }
}
</style>
