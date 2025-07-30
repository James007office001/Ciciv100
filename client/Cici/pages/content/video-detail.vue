<!--
  视频帖子详情页面
  CICI 社交活动平台 - 仿小红书视频帖子显示页面
-->
<template>
  <view class="video-detail-page">
    <!-- 背景视频 -->
    <video 
      id="video-player"
      class="background-video"
      :src="videoData.videos[0]?.url"
      :poster="VideoPostUtils.getCoverImage(videoData)"
      :autoplay="videoData.playbackSettings.autoPlay"
      :loop="videoData.playbackSettings.loop"
      :muted="videoData.playbackSettings.muted || isMuted"
      :controls="videoData.playbackSettings.showControls"
      :show-center-play-btn="false"
      :show-play-btn="false"
      :show-fullscreen-btn="false"
      :show-progress="false"
      :show-loading="false"
      object-fit="cover"
      @play="onVideoPlay"
      @pause="onVideoPause"
      @ended="onVideoEnd"
      @click="togglePlayPause"
    />
    
    <!-- 顶部导航栏 -->
    <view class="video-header">
      <view class="header-left">
        <view class="back-btn" @click="goBack">
          <text class="back-icon"><</text>
        </view>
      </view>
      <view class="header-right">
        <view class="share-btn" @click="shareVideo">
          <text class="share-icon">⤴</text>
        </view>
      </view>
    </view>
    
    <!-- 右侧操作栏 -->
    <view class="right-actions">
      <!-- 作者头像 -->
      <view class="author-avatar-container" @click="viewAuthorProfile">
        <image class="author-avatar" :src="videoData.author.avatar" mode="aspectFill" />
        <view class="follow-plus" v-if="!videoData.author.isFollowed" @click.stop="toggleFollow">
          <text class="plus-icon">+</text>
        </view>
      </view>
      
      <!-- 点赞 -->
      <view class="action-item like-action" @click="toggleLike">
        <view class="action-icon-bg" :class="{ 'liked': videoData.isLiked }">
          <text class="action-icon">♥</text>
        </view>
        <text class="action-count">{{ formatNumber(videoData.likeCount) }}</text>
      </view>
      
      <!-- 评论 -->
      <view class="action-item comment-action" @click="showComments">
        <view class="action-icon-bg">
          <text class="action-icon">💬</text>
        </view>
        <text class="action-count">{{ formatNumber(videoData.commentCount) }}</text>
      </view>
      
      <!-- 收藏 -->
      <view class="action-item collect-action" @click="toggleCollect">
        <view class="action-icon-bg" :class="{ 'collected': videoData.isCollected }">
          <text class="action-icon">⭐</text>
        </view>
        <text class="action-count">{{ formatNumber(videoData.collectCount) }}</text>
      </view>
      
      <!-- 参加 -->
      <view class="action-item join-action" @click="toggleJoin">
        <view class="action-icon-bg" :class="{ 'joined': videoData.isJoined }">
          <text class="action-icon">⛺</text>
        </view>
        <text class="action-count">参加</text>
      </view>
      
      <!-- 静音切换 -->
      <view class="action-item mute-action" @click="toggleMute">
        <view class="action-icon-bg">
          <text class="action-icon">{{ isMuted ? '🔇' : '🔊' }}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部内容信息 -->
    <view class="bottom-content">
      <!-- 作者信息 -->
      <view class="author-info" @click="viewAuthorProfile">
        <text class="author-name">@{{ videoData.author.name }}</text>
        <view class="follow-btn" v-if="!videoData.author.isFollowed" @click.stop="toggleFollow">
          <text class="follow-text">关注</text>
        </view>
      </view>
      
      <!-- 视频标题和描述 -->
      <view class="video-content">
        <text class="video-title">{{ videoData.title }}</text>
        <text 
          class="video-description" 
          :class="{ 'expanded': isDescExpanded }"
          @click="toggleDescription"
        >
          {{ videoData.description }}
        </text>
      </view>
      
      <!-- 标签 -->
      <view class="video-tags" v-if="videoData.tags && videoData.tags.length > 0">
        <view 
          v-for="tag in videoData.tags" 
          :key="tag"
          class="tag-item"
          @click="searchByTag(tag)"
        >
          <text class="tag-text">#{{ tag }}</text>
        </view>
      </view>
      
      <!-- 位置信息 -->
      <view class="location-info" v-if="videoData.location" @click="viewLocation">
        <text class="location-icon">📍</text>
        <text class="location-name">{{ videoData.location }}</text>
      </view>
      
      <!-- 音乐信息 -->
      <view class="music-info" v-if="videoData.event?.music" @click="viewMusic">
        <text class="music-icon">🎵</text>
        <text class="music-name">{{ videoData.event.music.name }} - {{ videoData.event.music.artist }}</text>
      </view>
    </view>
    
    <!-- 播放暂停指示器 -->
    <view class="play-indicator" v-if="showPlayIndicator">
      <text class="play-icon">{{ isPlaying ? '⏸' : '▶' }}</text>
    </view>
    
    <!-- 评论弹窗 -->
    <view class="comments-modal" v-if="showCommentsModal" @click="hideComments">
      <view class="comments-container" @click.stop>
        <view class="comments-header">
          <text class="comments-title">{{ videoData.commentCount }}条评论</text>
          <view class="close-btn" @click="hideComments">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <scroll-view class="comments-list" scroll-y="true">
          <view 
            v-for="comment in comments" 
            :key="comment.id"
            class="comment-item"
          >
            <image class="comment-avatar" :src="comment.user.avatar" mode="aspectFill" />
            <view class="comment-content">
              <view class="comment-info">
                <text class="comment-author">{{ comment.user.name }}</text>
                <text class="comment-time">{{ formatTime(comment.createTime) }}</text>
              </view>
              <text class="comment-text">{{ comment.content }}</text>
              <view class="comment-actions">
                <view class="comment-like" @click="likeComment(comment.id)">
                  <text class="like-icon" :class="{ 'liked': comment.isLiked }">♥</text>
                  <text class="like-count">{{ comment.likeCount || '' }}</text>
                </view>
                <view class="comment-reply" @click="replyComment(comment.id)">
                  <text class="reply-text">回复</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
        
        <view class="comment-input-area">
          <input 
            class="comment-input"
            v-model="commentText"
            placeholder="说点什么..."
            @confirm="submitComment"
          />
          <view class="send-btn" :class="{ 'active': commentText.trim() }" @click="submitComment">
            <text class="send-text">发送</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 更多选项弹窗 -->
    <view class="more-modal" v-if="showMoreModal" @click="hideMoreOptions">
      <view class="more-container" @click.stop>
        <view class="more-option" @click="reportVideo">
          <text class="option-text">举报</text>
        </view>
        <view class="more-option" @click="blockUser">
          <text class="option-text">屏蔽用户</text>
        </view>
        <view class="more-option" @click="copyLink">
          <text class="option-text">复制链接</text>
        </view>
        <view class="more-option cancel" @click="hideMoreOptions">
          <text class="option-text">取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { createMockVideoPostData, formatVideoPostData, validateVideoPostData, VideoPostUtils } from '@/src/utils/videoPostDataStructure'

// 获取页面参数
const props = defineProps({
  id: String,
  type: String
})

// 页面状态
const isPlaying = ref(true)
const isMuted = ref(false)
const isDescExpanded = ref(false)
const showPlayIndicator = ref(false)
const showCommentsModal = ref(false)
const showMoreModal = ref(false)
const commentText = ref('')

// 视频数据 - 使用标准视频数据结构
const videoData = reactive(createMockVideoPostData({
  id: 'video_001',
  title: '海边日落时光',
  description: '在三亚海边拍摄的绝美日落，海浪轻抚沙滩，夕阳西下的那一刻，整个世界都安静了下来。这种自然的美景总是让人心旷神怡，希望通过这个视频和大家分享这份宁静与美好。',
  videos: [
    {
      url: 'https://vjs.zencdn.net/v/oceans.mp4',
      thumbnail: '/static/c1.png',
      duration: 90,
      width: 1920,
      height: 1080,
      size: 52428800,
      format: 'mp4',
      quality: '1080p'
    }
  ],
  coverImage: '/static/c1.png',
  tags: ['日落', '海边', '治愈', '自然'],
  location: '三亚海棠湾',
  author: {
    id: 'author_video_001',
    name: '旅行摄影师',
    avatar: '/static/c5.png',
    isFollowed: false,
    verified: true,
    level: 5
  },
  viewCount: 12450,
  likeCount: 892,
  commentCount: 156,
  collectCount: 234,
  shareCount: 89,
  isLiked: false,
  isCollected: false,
  isJoined: false,
  createTime: '2024-07-15T18:30:00Z'
}))

// 评论数据
const comments = ref([
  {
    id: 1,
    user: {
      name: '海洋爱好者',
      avatar: '/static/c6.png'
    },
    content: '太美了！这个角度拍得真好，海浪声音也很治愈',
    likeCount: 23,
    isLiked: false,
    createTime: '2024-07-15 19:00:00'
  },
  {
    id: 2,
    user: {
      name: '摄影新手',
      avatar: '/static/c7.png'
    },
    content: '请问用的什么设备拍的？效果太棒了',
    likeCount: 15,
    isLiked: true,
    createTime: '2024-07-15 19:15:00'
  },
  {
    id: 3,
    user: {
      name: '旅行达人',
      avatar: '/static/c8.png'
    },
    content: '三亚真的是拍日落的好地方，下次我也要去',
    likeCount: 8,
    isLiked: false,
    createTime: '2024-07-15 19:30:00'
  }
])

// 事件处理
const goBack = () => {
  uni.navigateBack()
}

const togglePlayPause = () => {
  const videoContext = uni.createVideoContext('video-player')
  if (isPlaying.value) {
    videoContext.pause()
  } else {
    videoContext.play()
  }
  
  showPlayIndicator.value = true
  setTimeout(() => {
    showPlayIndicator.value = false
  }, 1000)
}

const onVideoPlay = () => {
  isPlaying.value = true
}

const onVideoPause = () => {
  isPlaying.value = false
}

const onVideoEnd = () => {
  isPlaying.value = false
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
}

const toggleFollow = () => {
  videoData.author.isFollowed = !videoData.author.isFollowed
  uni.showToast({
    title: videoData.author.isFollowed ? '已关注' : '已取消关注',
    icon: 'success'
  })
}

const viewAuthorProfile = () => {
  uni.navigateTo({
    url: `/pages/profile/index?userId=${videoData.author.id}`
  })
}

const toggleLike = () => {
  videoData.isLiked = !videoData.isLiked
  videoData.likeCount += videoData.isLiked ? 1 : -1
  
  // 点赞动画效果
  if (videoData.isLiked) {
    uni.showToast({
      title: '❤️',
      icon: 'none',
      duration: 500
    })
  }
}

const toggleCollect = () => {
  videoData.isCollected = !videoData.isCollected
  videoData.collectCount += videoData.isCollected ? 1 : -1
  
  uni.showToast({
    title: videoData.isCollected ? '已收藏' : '已取消收藏',
    icon: 'success'
  })
}

const toggleJoin = () => {
  videoData.isJoined = !videoData.isJoined
  uni.showToast({
    title: videoData.isJoined ? '已参加活动' : '已取消参加',
    icon: 'success'
  })
}

const shareVideo = () => {
  uni.share({
    provider: 'weixin',
    type: 2,
    title: videoData.title,
    summary: videoData.description,
    videoUrl: videoData.videos[0]?.url || '',
    thumbs: [VideoPostUtils.getCoverImage(videoData)]
  })
}

const showComments = () => {
  showCommentsModal.value = true
}

const hideComments = () => {
  showCommentsModal.value = false
  commentText.value = ''
}

const showMoreOptions = () => {
  showMoreModal.value = true
}

const hideMoreOptions = () => {
  showMoreModal.value = false
}

const toggleDescription = () => {
  isDescExpanded.value = !isDescExpanded.value
}

const searchByTag = (tag) => {
  uni.navigateTo({
    url: `/pages/search/index?keyword=${tag}`
  })
}

const viewLocation = () => {
  uni.showToast({
    title: '查看位置功能开发中',
    icon: 'none'
  })
}

const viewMusic = () => {
  uni.showToast({
    title: '查看音乐功能开发中',
    icon: 'none'
  })
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  
  const newComment = {
    id: Date.now(),
    user: {
      name: '当前用户',
      avatar: '/static/logo.png'
    },
    content: commentText.value.trim(),
    likeCount: 0,
    isLiked: false,
    createTime: new Date().toISOString()
  }
  
  comments.value.unshift(newComment)
  videoData.commentCount++
  commentText.value = ''
  
  uni.showToast({
    title: '评论成功',
    icon: 'success'
  })
}

const likeComment = (commentId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    comment.isLiked = !comment.isLiked
    comment.likeCount += comment.isLiked ? 1 : -1
  }
}

const replyComment = (commentId) => {
  // 回复评论功能
  uni.showToast({
    title: '回复功能开发中',
    icon: 'none'
  })
}

const reportVideo = () => {
  hideMoreOptions()
  uni.showToast({
    title: '举报功能开发中',
    icon: 'none'
  })
}

const blockUser = () => {
  hideMoreOptions()
  uni.showToast({
    title: '屏蔽功能开发中',
    icon: 'none'
  })
}

const copyLink = () => {
  hideMoreOptions()
  uni.setClipboardData({
    data: `https://example.com/video/${videoData.id}`,
    success: () => {
      uni.showToast({
        title: '链接已复制',
        icon: 'success'
      })
    }
  })
}

// 工具函数
const formatTime = (timeStr) => {
  const time = new Date(timeStr)
  const now = new Date()
  const diff = now - time
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return Math.floor(diff / 86400000) + '天前'
}

const formatNumber = (num) => {
  if (num < 1000) return num.toString()
  if (num < 10000) return (num / 1000).toFixed(1) + 'k'
  return (num / 10000).toFixed(1) + 'w'
}

// 生命周期
onMounted(() => {
  // 根据传入的id获取视频数据
  if (props.id && props.id !== '1') {
    loadVideoData(props.id)
  }
  
  // 设置屏幕常亮
  uni.setKeepScreenOn({
    keepScreenOn: true
  })
})

onUnmounted(() => {
  // 取消屏幕常亮
  uni.setKeepScreenOn({
    keepScreenOn: false
  })
})

// 模拟加载视频数据
const loadVideoData = (videoId) => {
  const mockDataMap = {
    '2': {
      id: 'video_002',
      title: '城市夜景延时摄影',
      description: '用延时摄影记录城市的夜晚，车流如河，灯火璀璨。霓虹灯下的都市生活，每一帧都是一个故事。',
      videos: [
        {
          url: 'https://vjs.zencdn.net/v/oceans.mp4',
          thumbnail: '/static/c2.png',
          duration: 120,
          quality: '1080p',
          format: 'mp4'
        }
      ],
      coverImage: '/static/c2.png',
      tags: ['延时摄影', '城市夜景', '都市'],
      location: '上海外滩',
      author: {
        id: 'author_video_002',
        name: '城市记录者',
        avatar: '/static/c6.png',
        isFollowed: false,
        verified: true
      },
      viewCount: 23410,
      likeCount: 1560,
      commentCount: 89,
      collectCount: 345
    },
    '3': {
      id: 'video_003',
      title: '咖啡制作艺术',
      description: '手冲咖啡的制作过程，从选豆到冲泡，每个步骤都需要细心对待。享受这个慢节奏的过程。',
      videos: [
        {
          url: 'https://vjs.zencdn.net/v/oceans.mp4',
          thumbnail: '/static/c3.png',
          duration: 180,
          quality: '1080p',
          format: 'mp4'
        }
      ],
      coverImage: '/static/c3.png',
      tags: ['咖啡', '手工艺', '生活'],
      location: '文艺咖啡厅',
      author: {
        id: 'author_video_003',
        name: '咖啡艺术家',
        avatar: '/static/c7.png',
        isFollowed: false,
        verified: false
      },
      viewCount: 8760,
      likeCount: 567,
      commentCount: 34,
      collectCount: 123
    }
  }
  
  if (mockDataMap[videoId]) {
    const newData = formatVideoPostData(mockDataMap[videoId])
    Object.assign(videoData, newData)
  }
}
</script>

<style lang="scss" scoped>
.video-detail-page {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: #000;
  overflow: hidden;
}

.background-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: calc(env(safe-area-inset-top) + 20rpx) 32rpx 20rpx;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
  
  .header-left, .header-right {
    display: flex;
    align-items: center;
  }
  
  .back-btn, .share-btn {
    width: 64rpx;
    height: 64rpx;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    
    &:active {
      background: rgba(0, 0, 0, 0.6);
      transform: scale(0.96);
    }
  }
  
  .back-icon, .share-icon {
    color: white;
    font-size: 28rpx;
    font-weight: bold;
  }
  
  .share-icon {
    font-size: 32rpx;
    font-weight: 500;
  }
}

.right-actions {
  position: fixed;
  right: 32rpx;
  bottom: 200rpx;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  
  .author-avatar-container {
    position: relative;
    
    .author-avatar {
      width: 96rpx;
      height: 96rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.8);
      background: rgba(255, 255, 255, 0.1);
    }
    
    .follow-plus {
      position: absolute;
      bottom: -8rpx;
      right: -8rpx;
      width: 40rpx;
      height: 40rpx;
      background: #ff4757;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3rpx solid white;
      
      .plus-icon {
        color: white;
        font-size: 24rpx;
        font-weight: bold;
      }
    }
  }
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    
    .action-icon-bg {
      width: 80rpx;
      height: 80rpx;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      
      &:active {
        background: rgba(0, 0, 0, 0.6);
        transform: scale(0.96);
      }
      
      &.liked {
        background: rgba(255, 71, 87, 0.8);
      }
      
      &.collected {
        background: rgba(255, 193, 7, 0.8);
      }
      
      &.joined {
        background: rgba(76, 175, 80, 0.8);
      }
    }
    
    .action-icon {
      color: white;
      font-size: 36rpx;
      font-weight: bold;
    }
    
    .action-count {
      color: white;
      font-size: 20rpx;
      text-align: center;
      text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.5);
      min-width: 60rpx;
    }
  }
}

.bottom-content {
  position: fixed;
  left: 0;
  right: 140rpx;
  bottom: 0;
  z-index: 100;
  padding: 32rpx 32rpx calc(env(safe-area-inset-bottom) + 32rpx);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  
  .author-info {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 16rpx;
    
    .author-name {
      color: white;
      font-size: 28rpx;
      font-weight: 600;
      text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.5);
    }
    
    .follow-btn {
      padding: 8rpx 20rpx;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20rpx;
      
      .follow-text {
        color: white;
        font-size: 22rpx;
        font-weight: 500;
      }
    }
  }
  
  .video-content {
    margin-bottom: 16rpx;
    
    .video-title {
      display: block;
      color: white;
      font-size: 32rpx;
      font-weight: 600;
      line-height: 1.4;
      margin-bottom: 8rpx;
      text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.5);
    }
    
    .video-description {
      display: block;
      color: rgba(255, 255, 255, 0.9);
      font-size: 26rpx;
      line-height: 1.5;
      text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.5);
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      
      &.expanded {
        -webkit-line-clamp: unset;
        line-clamp: unset;
        display: block;
      }
    }
  }
  
  .video-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 16rpx;
    
    .tag-item {
      padding: 6rpx 16rpx;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 16rpx;
      
      .tag-text {
        color: white;
        font-size: 22rpx;
        text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.5);
      }
    }
  }
  
  .location-info, .music-info {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 8rpx;
    
    .location-icon, .music-icon {
      font-size: 24rpx;
    }
    
    .location-name, .music-name {
      color: rgba(255, 255, 255, 0.8);
      font-size: 24rpx;
      text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.5);
    }
  }
}

.play-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 90;
  
  .play-icon {
    color: white;
    font-size: 100rpx;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
    opacity: 0.8;
  }
}

.comments-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  
  .comments-container {
    width: 100%;
    max-height: 80vh;
    background: white;
    border-radius: 24rpx 24rpx 0 0;
    display: flex;
    flex-direction: column;
    
    .comments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32rpx 32rpx 16rpx;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      
      .comments-title {
        color: #333;
        font-size: 32rpx;
        font-weight: 600;
      }
      
      .close-btn {
        width: 56rpx;
        height: 56rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .close-icon {
          color: #666;
          font-size: 36rpx;
        }
      }
    }
    
    .comments-list {
      flex: 1;
      padding: 16rpx 0;
      
      .comment-item {
        display: flex;
        gap: 20rpx;
        padding: 16rpx 32rpx;
        
        .comment-avatar {
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          background: #f5f5f5;
          flex-shrink: 0;
        }
        
        .comment-content {
          flex: 1;
          
          .comment-info {
            display: flex;
            gap: 16rpx;
            margin-bottom: 8rpx;
            
            .comment-author {
              color: #333;
              font-size: 24rpx;
              font-weight: 500;
            }
            
            .comment-time {
              color: #999;
              font-size: 20rpx;
            }
          }
          
          .comment-text {
            display: block;
            color: #333;
            font-size: 26rpx;
            line-height: 1.5;
            margin-bottom: 12rpx;
          }
          
          .comment-actions {
            display: flex;
            gap: 32rpx;
            
            .comment-like, .comment-reply {
              display: flex;
              align-items: center;
              gap: 6rpx;
              
              .like-icon {
                font-size: 20rpx;
                color: #999;
                
                &.liked {
                  color: #ff4757;
                }
              }
              
              .like-count, .reply-text {
                color: #999;
                font-size: 20rpx;
              }
            }
          }
        }
      }
    }
    
    .comment-input-area {
      display: flex;
      align-items: center;
      gap: 16rpx;
      padding: 24rpx 32rpx calc(env(safe-area-inset-bottom) + 24rpx);
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      background: white;
      
      .comment-input {
        flex: 1;
        padding: 16rpx 20rpx;
        background: #f5f5f5;
        border-radius: 24rpx;
        font-size: 26rpx;
        color: #333;
      }
      
      .send-btn {
        padding: 16rpx 24rpx;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 24rpx;
        transition: all 0.3s ease;
        
        &.active {
          background: #007AFF;
        }
        
        .send-text {
          color: #666;
          font-size: 26rpx;
          font-weight: 500;
        }
        
        &.active .send-text {
          color: white;
        }
      }
    }
  }
}

.more-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  
  .more-container {
    width: 100%;
    background: white;
    border-radius: 24rpx 24rpx 0 0;
    padding: 24rpx 0 calc(env(safe-area-inset-bottom) + 24rpx);
    
    .more-option {
      padding: 24rpx 32rpx;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      
      &:last-child {
        border-bottom: none;
      }
      
      &.cancel {
        margin-top: 16rpx;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        
        .option-text {
          color: #007AFF;
        }
      }
      
      .option-text {
        color: #333;
        font-size: 28rpx;
        text-align: center;
      }
    }
  }
}
</style>
