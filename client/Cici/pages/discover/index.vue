<!--
  发现页面
  CICI 社交活动平台 - 发现模块主页
-->
<template>
  <view class="discover-page">
    <!-- 顶部标题栏 -->
    <view class="page-header">
      <!-- 标签栏 -->
      <view class="header-tabs">
        <view 
          v-for="tab in tabs"
          :key="tab.id"
          class="header-tab-item"
          :class="{ 'tab-active': activeTab === tab.id }"
          @click="switchTab(tab.id)"
        >
          <text class="header-tab-text">{{ tab.name }}</text>
        </view>
      </view>
      
      <!-- 搜索按钮和发帖按钮 -->
      <view class="header-actions">
        <view class="add-btn" @click="showPostMenu">
          <text class="add-icon">+</text>
        </view>
        <view class="search-btn" @click="handleSearch">
          <text class="search-icon">🔍</text>
        </view>
      </view>
    </view>
    
    <!-- 主显示区域 -->
    <scroll-view class="main-content" scroll-y="true" :enhanced="true">
      <!-- 瀑布流布局 -->
      <view class="waterfall-container">
        <!-- 左列 -->
        <view class="waterfall-column">
          <view 
            v-for="(item, index) in leftColumnItems"
            :key="item.id"
            class="content-card"
            @click="viewItemDetail(item)"
          >
            <view class="card-image-container">
              <image class="card-image" :src="item.image" mode="aspectFill" />
              <view v-if="item.type === 'video'" class="video-indicator">
                <text class="play-icon">▶</text>
              </view>
            </view>
            <view class="card-content">
              <text class="card-title">{{ item.title }}</text>
              <view class="card-meta">
                <image class="author-avatar" :src="item.author.avatar" mode="aspectFill" />
                <text class="author-name">{{ item.author.name }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 右列 -->
        <view class="waterfall-column">
          <view 
            v-for="(item, index) in rightColumnItems"
            :key="item.id"
            class="content-card"
            @click="viewItemDetail(item)"
          >
            <view class="card-image-container">
              <image class="card-image" :src="item.image" mode="aspectFill" />
              <view v-if="item.type === 'video'" class="video-indicator">
                <text class="play-icon">▶</text>
              </view>
            </view>
            <view class="card-content">
              <text class="card-title">{{ item.title }}</text>
              <view class="card-meta">
                <image class="author-avatar" :src="item.author.avatar" mode="aspectFill" />
                <text class="author-name">{{ item.author.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部标签栏 -->
    <SimpleTabbar />
    
    <!-- 发帖菜单弹出层 -->
    <view v-if="showPostMenuVisible" class="post-menu-overlay" @click="hidePostMenu">
      <view class="post-menu" @click.stop>
        <view class="post-menu-header">
          <text class="post-menu-title">选择发帖类型</text>
          <view class="post-menu-close" @click="hidePostMenu">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="post-menu-options">
          <view class="post-option" @click="createVideoPost">
            <view class="post-option-icon video-icon">
              <text class="option-icon">📹</text>
            </view>
            <view class="post-option-content">
              <text class="option-title">短视频帖子</text>
              <text class="option-desc">拍摄或上传短视频内容</text>
            </view>
          </view>
          <view class="post-option" @click="createImagePost">
            <view class="post-option-icon image-icon">
              <text class="option-icon">📷</text>
            </view>
            <view class="post-option-content">
              <text class="option-title">图文帖子</text>
              <text class="option-desc">分享图片和文字内容</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SimpleTabbar from '../../src/components/common/SimpleTabbar.vue'
import { useAppStore } from '../../src/store/modules/app.js'

// Store
const appStore = useAppStore()

// 页面状态
const activeTab = ref('recommend')
const showPostMenuVisible = ref(false)

// 标签栏配置
const tabs = ref([
  { id: 'collect', name: '收藏' },
  { id: 'subscribe', name: '订阅' },
  { id: 'recommend', name: '推荐' },
  { id: 'location', name: '地点' }
])

// 模拟内容数据
const contentItems = ref([
  {
    id: 1,
    title: '美丽的日落风景',
    image: '/static/c1.png',
    type: 'image',
    height: 220,
    author: {
      id: 1,
      name: '摄影师小王',
      avatar: '/static/c5.png'
    },
    description: '今天在海边看到了超级美的日落，橘红色的天空倒映在海面上，就像一幅油画一样。',
    tags: ['日落', '海边', '风景摄影'],
    location: '三亚海棠湾',
    stats: {
      views: 1245,
      likes: 89,
      comments: 23
    }
  },
  {
    id: 2,
    title: '城市夜景延时摄影',
    image: '/static/c2.png',
    type: 'video',
    height: 180,
    author: {
      id: 2,
      name: '视频创作者',
      avatar: '/static/c6.png'
    },
    description: '用延时摄影记录城市的夜晚，车流如河，灯火璀璨。',
    tags: ['延时摄影', '城市夜景', '视频'],
    location: '上海外滩',
    stats: {
      views: 2341,
      likes: 156,
      comments: 45
    }
  },
  {
    id: 3,
    title: '咖啡拉花艺术',
    image: '/static/c3.png',
    type: 'image',
    height: 260,
    author: {
      id: 3,
      name: '咖啡师',
      avatar: '/static/c7.png'
    },
    description: '手冲咖啡配上精美的拉花，每一杯都是艺术品。',
    tags: ['咖啡', '拉花', '手工艺'],
    location: '文艺咖啡厅',
    stats: {
      views: 876,
      likes: 67,
      comments: 12
    }
  },
  {
    id: 4,
    title: '街头音乐表演',
    image: '/static/c4.png',
    type: 'video',
    height: 200,
    author: {
      id: 4,
      name: '音乐人',
      avatar: '/static/c8.png'
    },
    description: '街头艺人的精彩表演，音乐让这个城市更有温度。',
    tags: ['街头音乐', '表演', '艺术'],
    location: '南京路步行街',
    stats: {
      views: 1567,
      likes: 234,
      comments: 78
    }
  },
  {
    id: 5,
    title: '手工制作过程',
    image: '/static/c5.png',
    type: 'image',
    height: 240,
    author: {
      id: 5,
      name: '手工达人',
      avatar: '/static/c9.png'
    },
    description: '用心制作每一件手工作品，传统工艺的魅力。',
    tags: ['手工', '传统工艺', 'DIY'],
    location: '工艺工作室',
    stats: {
      views: 654,
      likes: 45,
      comments: 8
    }
  },
  {
    id: 6,
    title: '美食制作教程',
    image: '/static/c6.png',
    type: 'video',
    height: 190,
    author: {
      id: 6,
      name: '美食博主',
      avatar: '/static/c1.png'
    },
    description: '家常菜也能做出餐厅的味道，秘诀都在这里！',
    tags: ['美食', '教程', '家常菜'],
    location: '家庭厨房',
    stats: {
      views: 3456,
      likes: 289,
      comments: 156
    }
  },
  {
    id: 7,
    title: '旅行风景分享',
    image: '/static/c7.png',
    type: 'image',
    height: 230,
    author: {
      id: 7,
      name: '旅行达人',
      avatar: '/static/c2.png'
    },
    description: '走过千山万水，每一处风景都值得记录和分享。',
    tags: ['旅行', '风景', '摄影'],
    location: '云南大理',
    stats: {
      views: 2134,
      likes: 178,
      comments: 67
    }
  },
  {
    id: 8,
    title: '健身教学视频',
    image: '/static/c8.png',
    type: 'video',
    height: 210,
    author: {
      id: 8,
      name: '健身教练',
      avatar: '/static/c3.png'
    },
    description: '科学健身，正确的动作比强度更重要。',
    tags: ['健身', '教学', '运动'],
    location: '健身房',
    stats: {
      views: 1789,
      likes: 134,
      comments: 89
    }
  }
])

// 瀑布流分列计算
const leftColumnItems = computed(() => {
  return contentItems.value.filter((_, index) => index % 2 === 0)
})

const rightColumnItems = computed(() => {
  return contentItems.value.filter((_, index) => index % 2 === 1)
})

// 事件处理
const handleSearch = () => {
  uni.navigateTo({
    url: '/pages/search/index'
  })
}

const showPostMenu = () => {
  showPostMenuVisible.value = true
}

const hidePostMenu = () => {
  showPostMenuVisible.value = false
}

const createVideoPost = () => {
  hidePostMenu()
  uni.navigateTo({
    url: '/pages/post/video'
  })
}

const createImagePost = () => {
  hidePostMenu()
  uni.navigateTo({
    url: '/pages/post/image'
  })
}

const switchTab = (tabId) => {
  activeTab.value = tabId
  // 根据标签切换内容
}

const viewItemDetail = (item) => {
  if (item.type === 'image') {
    // 图文帖子跳转到图文详情页
    uni.navigateTo({
      url: `/pages/content/detail?id=${item.id}&type=${item.type}`
    })
  } else if (item.type === 'video') {
    // 视频帖子跳转到视频详情页面
    uni.navigateTo({
      url: `/pages/content/video-detail?id=${item.id}&type=${item.type}`
    })
  }
}

onMounted(() => {
  // 设置当前标签为发现
  appStore.setCurrentTab('discover')
  
  // 页面初始化
})
</script>

<style lang="scss" scoped>
.discover-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100; /* 与日程页保持一致 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7rpx 20rpx; /* 缩小到与日程页相同高度 */
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.05);
  
  .header-tabs {
    display: flex;
    gap: 32rpx;
    flex: 1;
  }
  
  .header-tab-item {
    position: relative;
    padding: 8rpx 0; /* 缩小padding适配新的标题栏高度 */
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    
    &:active {
      transform: scale(0.96);
    }
    
    &.tab-active {
      .header-tab-text {
        color: rgba(255, 255, 255, 0.95);
        font-weight: 600;
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 24rpx;
        height: 3rpx;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 2rpx;
        box-shadow: 0 2rpx 6rpx rgba(255, 255, 255, 0.3);
      }
    }
    
    .header-tab-text {
      color: rgba(255, 255, 255, 0.75);
      font-size: 26rpx;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 16rpx;
    margin-left: 24rpx;
  }
  
  .add-btn {
    width: 60rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    
    &:active {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(0.96);
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    .add-icon {
      font-size: 32rpx;
      color: rgba(255, 255, 255, 0.95);
      font-weight: 300;
      line-height: 1;
    }
  }
  
  .search-btn {
    width: 60rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    
    &:active {
      background: rgba(255, 255, 255, 0.15);
      transform: scale(0.96);
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.18);
    }
    
    .search-icon {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.95);
    }
  }
}

.main-content {
  margin-top: 0;
  padding: 80rpx 12rpx calc(env(safe-area-inset-bottom) + 140rpx) 12rpx; /* 增加顶部间距避免被标题栏覆盖 */
  height: 100vh;
}

.waterfall-container {
  display: flex;
  gap: 12rpx;
  padding-top: 0;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  max-width: calc(50vw - 18rpx);
}

.content-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20rpx;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  
  &:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.15);
  }
}

.card-image-container {
  position: relative;
  width: 100%;
  
  .card-image {
    width: 100%;
    height: auto;
    min-height: 200rpx;
    max-height: 400rpx;
    background: rgba(255, 255, 255, 0.1);
  }
  
  .video-indicator {
    position: absolute;
    top: 16rpx;
    right: 16rpx;
    width: 48rpx;
    height: 48rpx;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .play-icon {
      color: white;
      font-size: 24rpx;
      margin-left: 4rpx;
    }
  }
}

.card-content {
  padding: 24rpx;
  
  .card-title {
    color: white;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 1.4;
    margin-bottom: 16rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }
  
  .card-meta {
    display: flex;
    align-items: center;
    gap: 12rpx;
    
    .author-avatar {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .author-name {
      color: rgba(255, 255, 255, 0.8);
      font-size: 24rpx;
    }
  }
}

/* 响应式适配 */
@media (max-width: 768rpx) {
  .page-header {
    padding: 7rpx 20rpx; /* 保持与大屏幕一致的紧凑高度 */
    
    .header-tabs {
      gap: 24rpx;
    }
    
    .header-tab-item {
      padding: 6rpx 0; /* 进一步缩小适配小屏 */
      
      .header-tab-text {
        font-size: 24rpx;
      }
      
      &.tab-active::after {
        width: 20rpx;
        height: 2rpx;
      }
    }
    
    .header-actions {
      margin-left: 16rpx;
    }
    
    .add-btn {
      width: 56rpx;
      height: 56rpx;
      border-radius: 16rpx;
      
      .add-icon {
        font-size: 30rpx;
      }
    }
    
    .search-btn {
      width: 56rpx;
      height: 56rpx;
      border-radius: 16rpx;
      
      .search-icon {
        font-size: 28rpx;
      }
    }
  }
  
  .main-content {
    padding: 70rpx 12rpx calc(env(safe-area-inset-bottom) + 140rpx) 12rpx; /* 小屏下也增加顶部间距 */
    height: 100vh;
  }
  
  .waterfall-container {
    gap: 12rpx;
  }
  
  .waterfall-column {
    gap: 16rpx;
    max-width: calc(50vw - 18rpx);
  }
  
  .content-card {
    border-radius: 16rpx;
  }
  
  .card-content {
    padding: 20rpx;
    
    .card-title {
      font-size: 26rpx;
      margin-bottom: 12rpx;
    }
    
    .card-meta {
      gap: 10rpx;
      
      .author-avatar {
        width: 36rpx;
        height: 36rpx;
      }
      
      .author-name {
        font-size: 22rpx;
      }
    }
  }
}

/* 发帖菜单样式 */
.post-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.post-menu {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 24rpx;
  width: 100%;
  max-width: 600rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20rpx 80rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.post-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 32rpx 24rpx;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  
  .post-menu-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  
  .post-menu-close {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:active {
      background: rgba(0, 0, 0, 0.1);
      transform: scale(0.95);
    }
    
    .close-icon {
      font-size: 36rpx;
      color: #666;
      line-height: 1;
    }
  }
}

.post-menu-options {
  padding: 24rpx 32rpx 32rpx;
}

.post-option {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:active {
    background: rgba(0, 0, 0, 0.05);
    transform: scale(0.98);
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
}

.post-option-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  
  &.video-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  &.image-icon {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  
  .option-icon {
    font-size: 40rpx;
    filter: grayscale(100%) brightness(0) invert(1);
  }
}

.post-option-content {
  flex: 1;
  
  .option-title {
    display: block;
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rpx;
  }
  
  .option-desc {
    display: block;
    font-size: 24rpx;
    color: #666;
    line-height: 1.4;
  }
}
</style>
