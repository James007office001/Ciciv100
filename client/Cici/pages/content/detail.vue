<!--
  图文帖子详情页面
  CICI 社交活动平台 - 仿小红书图文帖子显示页面
-->
<template>
  <view class="content-detail-page">
    <!-- 顶部导航栏 -->
    <view class="detail-header">
      <view class="header-left">
        <view class="back-btn" @click="goBack">
          <text class="back-icon"><</text>
        </view>
        <view class="author-header-info">
          <image class="author-header-avatar" :src="postData.author.avatar" mode="aspectFill" />
          <text class="author-header-name">{{ postData.author.name }}</text>
        </view>
      </view>
      <view class="header-center">
      </view>
      <view class="header-right">
        <view class="follow-header-btn" :class="{ 'followed': postData.author.isFollowed }" @click="toggleFollow">
          <text class="follow-header-text">{{ postData.author.isFollowed ? '已关注' : '关注' }}</text>
        </view>
        <view class="share-header-btn" @click="sharePost">
          <text class="share-header-icon">⤴</text>
        </view>
      </view>
    </view>
    
    <!-- 主内容区域 -->
    <scroll-view class="detail-content" scroll-y="true" :enhanced="true">
      <!-- 图片轮播 -->
      <view class="image-swiper-container">
        <swiper 
          class="image-swiper" 
          :indicator-dots="postData.images.length > 1"
          indicator-color="rgba(255, 255, 255, 0.5)"
          indicator-active-color="rgba(255, 255, 255, 0.9)"
          :circular="true"
          :autoplay="false"
          @change="onSwiperChange"
        >
          <swiper-item v-for="(image, index) in postData.images" :key="index">
            <image 
              class="post-image" 
              :src="image" 
              mode="aspectFill"
              @click="previewImage(image, index)"
            />
          </swiper-item>
        </swiper>
        <view v-if="postData.images.length > 1" class="image-counter">
          <text class="counter-text">{{ currentImageIndex + 1 }}/{{ postData.images.length }}</text>
        </view>
      </view>
      
      <!-- 帖子内容 -->
      <view class="post-content">
        <text class="post-title">{{ postData.title }}</text>
        <text class="post-description">{{ postData.description }}</text>
        
        <!-- 标签 -->
        <view class="post-tags" v-if="postData.tags && postData.tags.length > 0">
          <view 
            v-for="tag in postData.tags" 
            :key="tag"
            class="tag-item"
            @click="searchByTag(tag)"
          >
            <text class="tag-text">#{{ tag }}</text>
          </view>
        </view>
        
        <!-- 位置信息 -->
        <view class="location-info" v-if="postData.location" @click="viewLocation">
          <text class="location-icon">📍</text>
          <text class="location-name">{{ postData.location }}</text>
        </view>
      </view>
      
      <!-- 互动数据 -->
      <view class="engagement-stats">
        <view class="stat-item">
          <text class="stat-icon">👁</text>
          <text class="stat-text">{{ formatNumber(postData.viewCount) }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-icon">❤️</text>
          <text class="stat-text">{{ formatNumber(postData.likeCount) }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-icon">💬</text>
          <text class="stat-text">{{ formatNumber(postData.commentCount) }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-icon">⭐</text>
          <text class="stat-text">{{ formatNumber(postData.collectCount) }}</text>
        </view>
      </view>
      
      <!-- 评论区 -->
      <view class="comments-section">
        <view class="comments-header">
          <text class="comments-title">评论 {{ postData.commentCount }}</text>
        </view>
        
        <view class="comments-list">
          <view 
            v-for="comment in comments" 
            :key="comment.id"
            class="comment-item"
          >
            <image class="comment-avatar" :src="comment.user.avatar" mode="aspectFill" />
            <view class="comment-content">
              <view class="comment-header">
                <text class="comment-author">{{ comment.user.name }}</text>
                <text class="comment-time">{{ formatTime(comment.createTime) }}</text>
              </view>
              <text class="comment-text">{{ comment.content }}</text>
              <view class="comment-actions">
                <view class="comment-like" @click="likeComment(comment.id)">
                  <text class="like-icon" :class="{ 'liked': comment.isLiked }">❤️</text>
                  <text class="like-count">{{ comment.likeCount || '' }}</text>
                </view>
                <view class="comment-reply" @click="replyComment(comment.id)">
                  <text class="reply-text">回复</text>
                </view>
              </view>
              
              <!-- 回复列表 -->
              <view class="replies-list" v-if="comment.replies && comment.replies.length > 0">
                <view 
                  v-for="reply in comment.replies" 
                  :key="reply.id"
                  class="reply-item"
                >
                  <text class="reply-author">{{ reply.user.name }}</text>
                  <text class="reply-text">{{ reply.content }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加载更多评论 -->
        <view class="load-more-comments" @click="loadMoreComments" v-if="hasMoreComments">
          <text class="load-more-text">查看更多评论</text>
        </view>
      </view>
      
      <!-- 相关推荐 -->
      <view class="related-posts">
        <view class="related-header">
          <text class="related-title">相关推荐</text>
        </view>
        <view class="related-list">
          <view 
            v-for="item in relatedPosts" 
            :key="item.id"
            class="related-item"
            @click="viewRelatedPost(item)"
          >
            <image class="related-image" :src="item.coverImage" mode="aspectFill" />
            <text class="related-title-text">{{ item.title }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-left">
        <view class="comment-input" @click="showCommentInput">
          <text class="input-placeholder">说点什么...</text>
        </view>
      </view>
      <view class="action-right">
        <view class="action-btn like-btn" :class="{ 'liked': postData.isLiked }" @click="toggleLike">
          <text class="action-icon">❤️</text>
          <text class="action-text">{{ postData.likeCount || '' }}</text>
        </view>
        <view class="action-btn collect-btn" :class="{ 'collected': postData.isCollected }" @click="toggleCollect">
          <text class="action-icon">⭐</text>
          <text class="action-text">{{ postData.collectCount || '' }}</text>
        </view>
        <view class="action-btn join-btn" :class="{ 'joined': postData.isJoined }" @click="toggleJoin">
          <text class="action-icon">⛺</text>
          <text class="action-text">参加</text>
        </view>
      </view>
    </view>
    
    <!-- 评论输入弹窗 -->
    <view class="comment-modal" v-if="showCommentModal" @click="hideCommentInput">
      <view class="comment-input-container" @click.stop>
        <textarea 
          class="comment-textarea"
          v-model="commentText"
          placeholder="写评论..."
          :auto-focus="true"
          :maxlength="500"
        />
        <view class="comment-submit">
          <view class="submit-btn" :class="{ 'active': commentText.trim() }" @click="submitComment">
            <text class="submit-text">发布</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { createMockPostData, formatPostData, validatePostData } from '@/src/utils/postDataStructure'

// 获取页面参数
const props = defineProps({
  id: String,
  type: String
})

// 页面状态
const currentImageIndex = ref(0)
const showCommentModal = ref(false)
const commentText = ref('')
const hasMoreComments = ref(true)

// 帖子数据 - 使用标准数据结构
const postData = reactive(createMockPostData({
  id: '1',
  title: '美丽的日落风景',
  description: '今天在海边看到了超级美的日落，橘红色的天空倒映在海面上，就像一幅油画一样。这种时候总是让人感到内心的平静和美好。分享给大家，希望你们也能感受到这份美好！',
  images: [
    '/static/c1.png',
    '/static/c2.png',
    '/static/c3.png'
  ],
  tags: ['日落', '海边', '风景摄影', '治愈系'],
  location: '三亚海棠湾',
  author: {
    id: 'author_001',
    name: '摄影师小王',
    avatar: '/static/c5.png',
    isFollowed: false
  },
  viewCount: 1245,
  likeCount: 89,
  commentCount: 23,
  collectCount: 156,
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
      name: '旅行达人小李',
      avatar: '/static/c6.png'
    },
    content: '太美了！这个角度拍得真好，能告诉我具体位置吗？',
    likeCount: 12,
    isLiked: false,
    createTime: '2024-07-15 19:00:00',
    replies: [
      {
        id: 101,
        user: { name: '摄影师小王' },
        content: '在海棠湾的观景台那里，下午6点左右去最好'
      }
    ]
  },
  {
    id: 2,
    user: {
      name: '风景控',
      avatar: '/static/c7.png'
    },
    content: '好想去三亚啊，看着就很治愈',
    likeCount: 8,
    isLiked: true,
    createTime: '2024-07-15 19:15:00',
    replies: []
  }
])

// 相关推荐
const relatedPosts = ref([
  {
    id: 2,
    title: '三亚美食探店',
    coverImage: '/static/c4.png'
  },
  {
    id: 3,
    title: '海边写真攻略',
    coverImage: '/static/c8.png'
  },
  {
    id: 4,
    title: '日落摄影技巧',
    coverImage: '/static/c9.png'
  }
])

// 事件处理
const goBack = () => {
  uni.navigateBack()
}

const toggleFollow = () => {
  postData.author.isFollowed = !postData.author.isFollowed
}

const onSwiperChange = (e) => {
  currentImageIndex.value = e.detail.current
}

const previewImage = (image, index) => {
  uni.previewImage({
    urls: postData.images,
    current: index
  })
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

const toggleLike = () => {
  postData.isLiked = !postData.isLiked
  postData.likeCount += postData.isLiked ? 1 : -1
}

const toggleCollect = () => {
  postData.isCollected = !postData.isCollected
  postData.collectCount += postData.isCollected ? 1 : -1
}

const toggleJoin = () => {
  postData.isJoined = !postData.isJoined
  uni.showToast({
    title: postData.isJoined ? '已参加活动' : '已取消参加',
    icon: 'success'
  })
}

const sharePost = () => {
  uni.share({
    provider: 'weixin',
    type: 0,
    title: postData.title,
    summary: postData.description,
    imageUrl: postData.images[0]
  })
}

const showCommentInput = () => {
  showCommentModal.value = true
}

const hideCommentInput = () => {
  showCommentModal.value = false
  commentText.value = ''
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  
  // 添加新评论
  const newComment = {
    id: Date.now(),
    user: {
      name: '当前用户',
      avatar: '/static/logo.png'
    },
    content: commentText.value.trim(),
    likeCount: 0,
    isLiked: false,
    createTime: new Date().toISOString(),
    replies: []
  }
  
  comments.value.unshift(newComment)
  postData.commentCount++
  hideCommentInput()
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
  showCommentInput()
}

const loadMoreComments = () => {
  // 加载更多评论
  hasMoreComments.value = false
}

const viewRelatedPost = (item) => {
  uni.navigateTo({
    url: `/pages/content/detail?id=${item.id}&type=image`
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

onMounted(() => {
  // 根据传入的id获取帖子数据
  if (props.id && props.id !== '1') {
    // 根据ID更新帖子数据
    loadPostData(props.id)
  }
})

// 模拟加载帖子数据的函数
const loadPostData = (postId) => {
  // 根据postId创建不同的模拟数据
  const mockDataMap = {
    '2': {
      id: '2',
      title: '城市夜景延时摄影',
      description: '用延时摄影记录城市的夜晚，车流如河，灯火璀璨。霓虹灯下的都市生活，每一帧都是一个故事。',
      images: ['/static/c2.png', '/static/c6.png'],
      tags: ['延时摄影', '城市夜景', '视频'],
      location: '上海外滩',
      author: {
        id: 'author_002',
        name: '视频创作者',
        avatar: '/static/c6.png',
        isFollowed: false
      },
      viewCount: 2341,
      likeCount: 156,
      commentCount: 45,
      collectCount: 87
    },
    '3': {
      id: '3',
      title: '咖啡拉花艺术',
      description: '手冲咖啡配上精美的拉花，每一杯都是艺术品。从选豆到冲泡，每个步骤都需要细心对待。',
      images: ['/static/c3.png', '/static/c7.png'],
      tags: ['咖啡', '拉花', '手工艺'],
      location: '文艺咖啡厅',
      author: {
        id: 'author_003',
        name: '咖啡师',
        avatar: '/static/c7.png',
        isFollowed: false
      },
      viewCount: 876,
      likeCount: 67,
      commentCount: 12,
      collectCount: 34
    }
  }
  
  if (mockDataMap[postId]) {
    const newData = formatPostData(mockDataMap[postId])
    Object.assign(postData, newData)
  }
}
</script>

<style lang="scss" scoped>
.content-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  padding-top: 0; /* 确保没有额外的padding */
  
  /* 强制覆盖状态栏区域 */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--status-bar-height, 44px);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: 99;
    pointer-events: none;
  }
}

.detail-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7rpx 20rpx;
  padding-top: calc(var(--status-bar-height, 44px) + 7rpx); /* 设置默认状态栏高度 */
  background: rgba(255, 255, 255, 0.03); /* 恢复毛玻璃背景 */
  backdrop-filter: blur(40px); /* 恢复标准模糊强度 */
  -webkit-backdrop-filter: blur(40px); /* 恢复标准模糊强度 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.08); /* 恢复边框 */
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.05); /* 恢复阴影 */
  
  /* 确保覆盖整个顶部区域 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--status-bar-height, 44px);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: -1;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
    flex: 1;
    max-width: 60%;
    
    .author-header-info {
      display: flex;
      align-items: center;
      gap: 16rpx;
      
      .author-header-avatar {
        width: 56rpx;
        height: 56rpx;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.2);
      }
      
      .author-header-name {
        color: rgba(255, 255, 255, 0.95);
        font-size: 26rpx;
        font-weight: 600;
        max-width: 200rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  
  .header-center {
    flex: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex-shrink: 0;
  }
  
  .back-btn {
    width: 60rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* 使用与发现页相同的缓动函数 */
    
    &:active {
      background: rgba(255, 255, 255, 0.15);
      transform: scale(0.96);
    }
  }
  
  .follow-header-btn {
    padding: 8rpx 20rpx; /* 调整padding适配新的标题栏高度 */
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20rpx;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &.followed {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
    }
    
    &:active {
      transform: scale(0.96);
    }
    
    .follow-header-text {
      color: rgba(255, 255, 255, 0.9);
      font-size: 22rpx;
      font-weight: 500;
    }
  }
  
  .share-header-btn {
    width: 60rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:active {
      background: rgba(255, 255, 255, 0.15);
      transform: scale(0.96);
    }
  }
  
  .back-icon, .share-header-icon {
    color: rgba(255, 255, 255, 0.9);
    font-size: 28rpx;
    font-weight: bold;
  }
  
  .share-header-icon {
    font-size: 32rpx;
    font-weight: 500;
    line-height: 1;
  }
}

.detail-content {
  margin-top: calc(var(--status-bar-height, 44px) + 80rpx); /* 设置默认状态栏高度 */
  padding: 0 0 200rpx 0;
  height: calc(100vh - var(--status-bar-height, 44px) - 80rpx);
}

.image-swiper-container {
  position: relative;
  margin: 0 24rpx 32rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  
  .image-swiper {
    width: 100%;
    height: 600rpx;
    
    .post-image {
      width: 100%;
      height: 100%;
    }
  }
  
  .image-counter {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    padding: 8rpx 16rpx;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 16rpx;
    
    .counter-text {
      color: white;
      font-size: 20rpx;
    }
  }
}

.post-content {
  padding: 0 32rpx 32rpx;
  
  .post-title {
    display: block;
    color: rgba(255, 255, 255, 0.95);
    font-size: 36rpx;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 16rpx;
  }
  
  .post-description {
    display: block;
    color: rgba(255, 255, 255, 0.85);
    font-size: 28rpx;
    line-height: 1.6;
    margin-bottom: 24rpx;
  }
  
  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 24rpx;
    
    .tag-item {
      padding: 8rpx 16rpx;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16rpx;
      transition: all 0.3s ease;
      
      &:active {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(0.96);
      }
      
      .tag-text {
        color: rgba(255, 255, 255, 0.9);
        font-size: 22rpx;
      }
    }
  }
  
  .location-info {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 0;
    
    .location-icon {
      font-size: 24rpx;
    }
    
    .location-name {
      color: rgba(255, 255, 255, 0.8);
      font-size: 24rpx;
    }
  }
}

.engagement-stats {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 32rpx;
  margin: 0 24rpx 32rpx;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.12);
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    .stat-icon {
      font-size: 28rpx;
    }
    
    .stat-text {
      color: rgba(255, 255, 255, 0.9);
      font-size: 24rpx;
      font-weight: 500;
    }
  }
}

.comments-section {
  margin: 0 24rpx 32rpx;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
  
  .comments-header {
    padding: 24rpx 32rpx 16rpx;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .comments-title {
      color: rgba(255, 255, 255, 0.95);
      font-size: 28rpx;
      font-weight: 600;
    }
  }
  
  .comments-list {
    padding: 16rpx 0;
    
    .comment-item {
      display: flex;
      gap: 20rpx;
      padding: 16rpx 32rpx;
      
      .comment-avatar {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
      }
      
      .comment-content {
        flex: 1;
        
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8rpx;
          
          .comment-author {
            color: rgba(255, 255, 255, 0.9);
            font-size: 24rpx;
            font-weight: 500;
          }
          
          .comment-time {
            color: rgba(255, 255, 255, 0.6);
            font-size: 20rpx;
          }
        }
        
        .comment-text {
          display: block;
          color: rgba(255, 255, 255, 0.85);
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
              opacity: 0.6;
              
              &.liked {
                opacity: 1;
              }
            }
            
            .like-count, .reply-text {
              color: rgba(255, 255, 255, 0.6);
              font-size: 20rpx;
            }
          }
        }
        
        .replies-list {
          margin-top: 16rpx;
          padding: 16rpx;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12rpx;
          
          .reply-item {
            margin-bottom: 8rpx;
            
            .reply-author {
              color: rgba(255, 255, 255, 0.8);
              font-size: 22rpx;
              font-weight: 500;
            }
            
            .reply-text {
              color: rgba(255, 255, 255, 0.7);
              font-size: 22rpx;
              margin-left: 8rpx;
            }
          }
        }
      }
    }
  }
  
  .load-more-comments {
    padding: 24rpx;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    
    .load-more-text {
      color: rgba(255, 255, 255, 0.7);
      font-size: 24rpx;
    }
  }
}

.related-posts {
  margin: 0 24rpx 32rpx;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
  
  .related-header {
    padding: 24rpx 32rpx 16rpx;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .related-title {
      color: rgba(255, 255, 255, 0.95);
      font-size: 28rpx;
      font-weight: 600;
    }
  }
  
  .related-list {
    display: flex;
    gap: 16rpx;
    padding: 24rpx 32rpx;
    overflow-x: auto;
    
    .related-item {
      flex-shrink: 0;
      width: 200rpx;
      
      .related-image {
        width: 100%;
        height: 200rpx;
        border-radius: 12rpx;
        background: rgba(255, 255, 255, 0.1);
        margin-bottom: 8rpx;
      }
      
      .related-title-text {
        display: block;
        color: rgba(255, 255, 255, 0.8);
        font-size: 22rpx;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 20rpx 32rpx calc(env(safe-area-inset-bottom) + 20rpx);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  
  .action-left {
    flex: 1;
    
    .comment-input {
      padding: 16rpx 24rpx;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24rpx;
      
      .input-placeholder {
        color: rgba(255, 255, 255, 0.6);
        font-size: 26rpx;
      }
    }
  }
  
  .action-right {
    display: flex;
    gap: 16rpx;
  }
  
  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
    padding: 12rpx 16rpx;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16rpx;
    transition: all 0.3s ease;
    
    &:active {
      background: rgba(255, 255, 255, 0.15);
      transform: scale(0.96);
    }
    
    &.liked, &.collected, &.joined {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    .action-icon {
      font-size: 28rpx;
    }
    
    .action-text {
      color: rgba(255, 255, 255, 0.8);
      font-size: 18rpx;
    }
  }
}

.comment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  
  .comment-input-container {
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 24rpx 24rpx 0 0;
    padding: 32rpx 32rpx calc(env(safe-area-inset-bottom) + 32rpx);
    
    .comment-textarea {
      width: 100%;
      min-height: 120rpx;
      padding: 20rpx;
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 16rpx;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 24rpx;
    }
    
    .comment-submit {
      display: flex;
      justify-content: flex-end;
      
      .submit-btn {
        padding: 16rpx 32rpx;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 24rpx;
        transition: all 0.3s ease;
        
        &.active {
          background: #007AFF;
        }
        
        .submit-text {
          color: #666;
          font-size: 28rpx;
          font-weight: 500;
        }
        
        &.active .submit-text {
          color: white;
        }
      }
    }
  }
}
</style>
