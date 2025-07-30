/**
 * 帖子数据结构标准化工具
 * 基于 share/datastructure/post-structure.json
 */

/**
 * 标准帖子数据结构
 */
export const PostDataStructure = {
  // 基础字段
  id: '',
  title: '',
  description: '',
  images: [],
  tags: [],
  location: '',
  createTime: '',
  
  // 统计数据
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  collectCount: 0,
  
  // 用户状态
  isLiked: false,
  isCollected: false,
  isJoined: false,
  
  // 博主信息
  author: {
    id: '',
    name: '',
    avatar: '',
    isFollowed: false
  },
  
  // 事件信息（可选）
  event: null,
  
  // 门票信息（可选）
  ticket: null
}

/**
 * 格式化帖子数据
 * @param {Object} rawData - 原始数据
 * @returns {Object} 格式化后的数据
 */
export function formatPostData(rawData) {
  if (!rawData) return { ...PostDataStructure }
  
  return {
    id: rawData.id || '',
    title: rawData.title || '',
    description: rawData.description || rawData.content || '',
    images: rawData.images || [],
    tags: rawData.tags || [],
    location: rawData.location || '',
    createTime: rawData.createTime || rawData.createdAt || '',
    
    viewCount: rawData.viewCount || 0,
    likeCount: rawData.likeCount || 0,
    commentCount: rawData.commentCount || 0,
    collectCount: rawData.collectCount || 0,
    
    isLiked: rawData.isLiked || false,
    isCollected: rawData.isCollected || false,
    isJoined: rawData.isJoined || false,
    
    author: {
      id: rawData.author?.id || rawData.authorId || '',
      name: rawData.author?.name || '',
      avatar: rawData.author?.avatar || '',
      isFollowed: rawData.author?.isFollowed || false
    },
    
    event: rawData.event || null,
    ticket: rawData.ticket || null
  }
}

/**
 * 验证帖子数据
 * @param {Object} postData - 帖子数据
 * @returns {Object} 验证结果
 */
export function validatePostData(postData) {
  const errors = []
  
  if (!postData.id) {
    errors.push('帖子ID不能为空')
  }
  
  if (!postData.title) {
    errors.push('帖子标题不能为空')
  }
  
  if (!postData.description) {
    errors.push('帖子内容不能为空')
  }
  
  if (!postData.images || postData.images.length === 0) {
    errors.push('帖子图片不能为空')
  }
  
  if (!postData.author?.id) {
    errors.push('作者信息不能为空')
  }
  
  if (!postData.author?.name) {
    errors.push('作者名称不能为空')
  }
  
  if (!postData.author?.avatar) {
    errors.push('作者头像不能为空')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 创建空的帖子数据
 * @returns {Object} 空帖子数据
 */
export function createEmptyPostData() {
  return { ...PostDataStructure }
}

/**
 * 创建模拟帖子数据
 * @param {Object} options - 选项
 * @returns {Object} 模拟数据
 */
export function createMockPostData(options = {}) {
  const mockData = {
    id: options.id || '1',
    title: options.title || '美丽的日落风景',
    description: options.description || '今天在海边看到了超级美的日落，橘红色的天空倒映在海面上，就像一幅油画一样。这种时候总是让人感到内心的平静和美好。分享给大家，希望你们也能感受到这份美好！',
    images: options.images || [
      '/static/c1.png',
      '/static/c2.png',
      '/static/c3.png'
    ],
    tags: options.tags || ['日落', '海边', '风景摄影', '治愈系'],
    location: options.location || '三亚海棠湾',
    createTime: options.createTime || '2024-07-15T18:30:00Z',
    
    viewCount: options.viewCount || 1245,
    likeCount: options.likeCount || 89,
    commentCount: options.commentCount || 23,
    collectCount: options.collectCount || 156,
    
    isLiked: options.isLiked || false,
    isCollected: options.isCollected || false,
    isJoined: options.isJoined || false,
    
    author: {
      id: options.author?.id || 'author_001',
      name: options.author?.name || '摄影师小王',
      avatar: options.author?.avatar || '/static/c5.png',
      isFollowed: options.author?.isFollowed || false
    },
    
    event: options.event || null,
    ticket: options.ticket || null
  }
  
  return mockData
}

/**
 * 帖子数据类型定义（供TypeScript使用）
 */
export const PostDataTypes = {
  POST_TYPE: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    MIXED: 'mixed'
  },
  
  POST_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    HIDDEN: 'hidden',
    DELETED: 'deleted'
  },
  
  EVENT_STATUS: {
    UPCOMING: 'upcoming',
    ONGOING: 'ongoing',
    ENDED: 'ended',
    CANCELLED: 'cancelled'
  },
  
  TICKET_STATUS: {
    AVAILABLE: 'available',
    SOLD_OUT: 'sold_out',
    EXPIRED: 'expired'
  }
}
