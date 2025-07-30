/**
 * 数据结构验证和迁移工具
 * 用于确保项目中的数据结构一致性
 */

import { validatePostData, formatPostData } from './postDataStructure'
import { validateVideoPostData, formatVideoPostData } from './videoPostDataStructure'

/**
 * 验证项目中的所有帖子数据
 * @param {Array} posts - 帖子数据数组
 * @returns {Object} 验证结果
 */
export function validateAllPosts(posts) {
  const results = {
    valid: [],
    invalid: [],
    errors: []
  }
  
  posts.forEach((post, index) => {
    const validation = validatePostData(post)
    if (validation.isValid) {
      results.valid.push(post)
    } else {
      results.invalid.push({
        index,
        post,
        errors: validation.errors
      })
      results.errors.push(...validation.errors)
    }
  })
  
  return results
}

/**
 * 验证项目中的所有视频帖子数据
 * @param {Array} videoPosts - 视频帖子数据数组
 * @returns {Object} 验证结果
 */
export function validateAllVideoPosts(videoPosts) {
  const results = {
    valid: [],
    invalid: [],
    errors: []
  }
  
  videoPosts.forEach((videoPost, index) => {
    const validation = validateVideoPostData(videoPost)
    if (validation.isValid) {
      results.valid.push(videoPost)
    } else {
      results.invalid.push({
        index,
        videoPost,
        errors: validation.errors
      })
      results.errors.push(...validation.errors)
    }
  })
  
  return results
}

/**
 * 迁移旧格式的帖子数据到新格式
 * @param {Object} oldPost - 旧格式的帖子数据
 * @returns {Object} 新格式的帖子数据
 */
export function migratePostData(oldPost) {
  const migratedPost = {
    id: oldPost.id || oldPost.postId || '',
    title: oldPost.title || '',
    description: oldPost.description || oldPost.content || '',
    images: oldPost.images || oldPost.mediaFiles || [],
    tags: oldPost.tags || [],
    location: oldPost.location || '',
    createTime: oldPost.createTime || oldPost.createdAt || new Date().toISOString(),
    
    viewCount: oldPost.viewCount || oldPost.viewsCount || 0,
    likeCount: oldPost.likeCount || oldPost.likesCount || 0,
    commentCount: oldPost.commentCount || oldPost.commentsCount || 0,
    collectCount: oldPost.collectCount || 0,
    
    isLiked: oldPost.isLiked || false,
    isCollected: oldPost.isCollected || false,
    isJoined: oldPost.isJoined || false,
    
    author: {
      id: oldPost.author?.id || oldPost.authorId || '',
      name: oldPost.author?.name || '',
      avatar: oldPost.author?.avatar || '',
      isFollowed: oldPost.author?.isFollowed || false
    },
    
    event: oldPost.event || null,
    ticket: oldPost.ticket || null
  }
  
  return formatPostData(migratedPost)
}

/**
 * 批量迁移帖子数据
 * @param {Array} oldPosts - 旧格式的帖子数据数组
 * @returns {Array} 新格式的帖子数据数组
 */
export function batchMigratePostData(oldPosts) {
  return oldPosts.map(post => migratePostData(post))
}

/**
 * 检查数据结构兼容性
 * @param {Object} data - 要检查的数据
 * @param {string} structureType - 数据结构类型 (post, comment, user等)
 * @returns {Object} 兼容性检查结果
 */
export function checkDataCompatibility(data, structureType) {
  const compatibility = {
    isCompatible: true,
    missingFields: [],
    deprecatedFields: [],
    suggestions: []
  }
  
  if (structureType === 'post') {
    // 检查必需字段
    const requiredFields = ['id', 'title', 'description', 'images', 'author']
    requiredFields.forEach(field => {
      if (!data[field]) {
        compatibility.missingFields.push(field)
        compatibility.isCompatible = false
      }
    })
    
    // 检查已弃用字段
    const deprecatedFields = ['content', 'postId', 'likesCount', 'commentsCount', 'viewsCount']
    deprecatedFields.forEach(field => {
      if (data[field]) {
        compatibility.deprecatedFields.push(field)
        compatibility.suggestions.push(`建议将 ${field} 字段迁移到标准格式`)
      }
    })
    
    // 检查作者信息
    if (data.author && !data.author.id) {
      compatibility.missingFields.push('author.id')
      compatibility.isCompatible = false
    }
  }
  
  return compatibility
}

/**
 * 生成数据结构迁移报告
 * @param {Array} data - 要检查的数据数组
 * @param {string} structureType - 数据结构类型
 * @returns {Object} 迁移报告
 */
export function generateMigrationReport(data, structureType) {
  const report = {
    totalCount: data.length,
    compatibleCount: 0,
    incompatibleCount: 0,
    issues: [],
    recommendations: []
  }
  
  data.forEach((item, index) => {
    const compatibility = checkDataCompatibility(item, structureType)
    
    if (compatibility.isCompatible) {
      report.compatibleCount++
    } else {
      report.incompatibleCount++
      report.issues.push({
        index,
        item: item.id || item.title || `Item ${index}`,
        missingFields: compatibility.missingFields,
        deprecatedFields: compatibility.deprecatedFields
      })
    }
    
    compatibility.suggestions.forEach(suggestion => {
      if (!report.recommendations.includes(suggestion)) {
        report.recommendations.push(suggestion)
      }
    })
  })
  
  return report
}

/**
 * 清理无用的数据字段
 * @param {Object} data - 要清理的数据
 * @param {Array} fieldsToRemove - 要删除的字段名数组
 * @returns {Object} 清理后的数据
 */
export function cleanupDataFields(data, fieldsToRemove = []) {
  const defaultFieldsToRemove = [
    'postId', // 旧的帖子ID字段
    'content', // 旧的内容字段，现在用 description
    'likesCount', // 旧的点赞数字段，现在用 likeCount
    'commentsCount', // 旧的评论数字段，现在用 commentCount
    'viewsCount', // 旧的浏览数字段，现在用 viewCount
    'mediaFiles', // 旧的媒体文件字段，现在用 images
    'createdAt', // 旧的创建时间字段，现在用 createTime
    'sharesCount', // 旧的分享数字段，现在用 shareCount
    'authorId' // 如果 author 对象已包含 id，则可以删除单独的 authorId
  ]
  
  const allFieldsToRemove = [...defaultFieldsToRemove, ...fieldsToRemove]
  const cleanedData = { ...data }
  
  allFieldsToRemove.forEach(field => {
    if (cleanedData.hasOwnProperty(field)) {
      delete cleanedData[field]
    }
  })
  
  return cleanedData
}

/**
 * 数据结构标准化
 * @param {Object} data - 要标准化的数据
 * @param {string} structureType - 数据结构类型
 * @returns {Object} 标准化后的数据
 */
export function standardizeData(data, structureType) {
  if (structureType === 'post') {
    // 先迁移数据
    const migratedData = migratePostData(data)
    
    // 清理无用字段
    const cleanedData = cleanupDataFields(migratedData)
    
    // 验证数据
    const validation = validatePostData(cleanedData)
    
    if (!validation.isValid) {
      console.warn('数据标准化后仍有问题：', validation.errors)
    }
    
    return cleanedData
  } else if (structureType === 'video') {
    return standardizeVideoData(data)
  }
  
  return data
}

/**
 * 批量标准化数据
 * @param {Array} dataArray - 要标准化的数据数组
 * @param {string} structureType - 数据结构类型
 * @returns {Array} 标准化后的数据数组
 */
export function batchStandardizeData(dataArray, structureType) {
  return dataArray.map(data => standardizeData(data, structureType))
}

/**
 * 迁移旧格式的视频帖子数据到新格式
 * @param {Object} oldVideoPost - 旧格式的视频帖子数据
 * @returns {Object} 新格式的视频帖子数据
 */
export function migrateVideoPostData(oldVideoPost) {
  const migratedVideoPost = {
    id: oldVideoPost.id || oldVideoPost.videoId || '',
    title: oldVideoPost.title || '',
    description: oldVideoPost.description || oldVideoPost.content || '',
    videos: oldVideoPost.videos || [
      {
        url: oldVideoPost.videoUrl || '',
        thumbnail: oldVideoPost.coverImage || oldVideoPost.thumbnail || '',
        duration: oldVideoPost.duration || 0,
        quality: oldVideoPost.quality || '720p',
        format: oldVideoPost.format || 'mp4'
      }
    ],
    coverImage: oldVideoPost.coverImage || '',
    tags: oldVideoPost.tags || [],
    location: oldVideoPost.location || '',
    createTime: oldVideoPost.createTime || oldVideoPost.createdAt || new Date().toISOString(),
    
    viewCount: oldVideoPost.viewCount || oldVideoPost.viewsCount || 0,
    likeCount: oldVideoPost.likeCount || oldVideoPost.likesCount || 0,
    commentCount: oldVideoPost.commentCount || oldVideoPost.commentsCount || 0,
    collectCount: oldVideoPost.collectCount || 0,
    shareCount: oldVideoPost.shareCount || 0,
    
    isLiked: oldVideoPost.isLiked || false,
    isCollected: oldVideoPost.isCollected || false,
    isJoined: oldVideoPost.isJoined || false,
    
    videoType: oldVideoPost.videoType || 'short',
    playbackSettings: {
      autoPlay: oldVideoPost.autoPlay ?? true,
      loop: oldVideoPost.loop ?? false,
      muted: oldVideoPost.muted ?? false,
      showControls: oldVideoPost.showControls ?? true
    },
    
    author: {
      id: oldVideoPost.author?.id || oldVideoPost.authorId || '',
      name: oldVideoPost.author?.name || '',
      avatar: oldVideoPost.author?.avatar || '',
      isFollowed: oldVideoPost.author?.isFollowed || false,
      verified: oldVideoPost.author?.verified || false,
      level: oldVideoPost.author?.level || 1
    },
    
    event: oldVideoPost.event || null,
    ticket: oldVideoPost.ticket || null
  }
  
  return formatVideoPostData(migratedVideoPost)
}

/**
 * 批量迁移视频帖子数据
 * @param {Array} oldVideoPosts - 旧格式的视频帖子数据数组
 * @returns {Array} 新格式的视频帖子数据数组
 */
export function migrateAllVideoPosts(oldVideoPosts) {
  return oldVideoPosts.map(oldVideoPost => migrateVideoPostData(oldVideoPost))
}

/**
 * 标准化视频数据
 * @param {Object} data - 要标准化的视频数据
 * @returns {Object} 标准化后的视频数据
 */
export function standardizeVideoData(data) {
  // 先迁移数据
  const migratedData = migrateVideoPostData(data)
  
  // 清理无用字段
  const cleanedData = cleanupDataFields(migratedData)
  
  // 验证数据
  const validation = validateVideoPostData(cleanedData)
  
  if (!validation.isValid) {
    console.warn('视频数据标准化后仍有问题：', validation.errors)
  }
  
  return cleanedData
}

/**
 * 批量标准化视频数据
 * @param {Array} videoDataArray - 要标准化的视频数据数组
 * @returns {Array} 标准化后的视频数据数组
 */
export function batchStandardizeVideoData(videoDataArray) {
  return videoDataArray.map(data => standardizeVideoData(data))
}
