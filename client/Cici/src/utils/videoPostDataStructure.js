/**
 * 视频帖子数据结构标准化工具
 * 基于 share/datastructure/video-post-structure.json
 */

/**
 * 标准视频帖子数据结构
 */
export const VideoPostDataStructure = {
  // 基础字段
  id: '',
  title: '',
  description: '',
  videos: [],
  coverImage: '',
  tags: [],
  location: '',
  createTime: '',
  
  // 统计数据
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  collectCount: 0,
  shareCount: 0,
  
  // 用户状态
  isLiked: false,
  isCollected: false,
  isJoined: false,
  
  // 视频属性
  videoType: 'short',
  playbackSettings: {
    autoPlay: true,
    loop: false,
    muted: false,
    showControls: true
  },
  
  // 博主信息
  author: {
    id: '',
    name: '',
    avatar: '',
    isFollowed: false,
    verified: false,
    level: 1,
    fansCount: 0,
    followsCount: 0,
    videosCount: 0,
    bio: '',
    badges: []
  },
  
  // 事件信息（可选）
  event: null,
  
  // 门票信息（可选）
  ticket: null,
  
  // 互动数据
  interactionData: {
    playProgress: 0,
    lastPlayTime: '',
    playCount: 0,
    completionRate: 0,
    engagementScore: 0,
    hotComments: []
  },
  
  // 技术信息
  technicalInfo: {
    encoding: 'H.264',
    bitrate: 5000,
    frameRate: 30,
    aspectRatio: '16:9',
    audioInfo: {
      codec: 'AAC',
      sampleRate: 44100,
      channels: 2
    },
    subtitles: []
  },
  
  // 审核信息
  moderationInfo: {
    status: 'pending',
    reviewedAt: '',
    reviewedBy: '',
    contentRating: 'G',
    flags: []
  },
  
  // 分析数据
  analytics: {
    impressions: 0,
    clickThroughRate: 0,
    averageWatchTime: 0,
    retentionRate: 0,
    bounceRate: 0,
    demographics: {
      ageGroups: {
        '18-24': 0,
        '25-34': 0,
        '35-44': 0,
        '45+': 0
      },
      genderRatio: {
        male: 0,
        female: 0
      }
    }
  }
}

/**
 * 格式化视频帖子数据
 * @param {Object} rawData - 原始数据
 * @returns {Object} 格式化后的数据
 */
export function formatVideoPostData(rawData) {
  if (!rawData) return { ...VideoPostDataStructure }
  
  return {
    id: rawData.id || '',
    title: rawData.title || '',
    description: rawData.description || rawData.content || '',
    videos: rawData.videos || [],
    coverImage: rawData.coverImage || rawData.thumbnail || '',
    tags: rawData.tags || [],
    location: rawData.location || '',
    createTime: rawData.createTime || rawData.createdAt || '',
    
    viewCount: rawData.viewCount || 0,
    likeCount: rawData.likeCount || 0,
    commentCount: rawData.commentCount || 0,
    collectCount: rawData.collectCount || 0,
    shareCount: rawData.shareCount || 0,
    
    isLiked: rawData.isLiked || false,
    isCollected: rawData.isCollected || false,
    isJoined: rawData.isJoined || false,
    
    videoType: rawData.videoType || 'short',
    playbackSettings: {
      autoPlay: rawData.playbackSettings?.autoPlay ?? true,
      loop: rawData.playbackSettings?.loop ?? false,
      muted: rawData.playbackSettings?.muted ?? false,
      showControls: rawData.playbackSettings?.showControls ?? true
    },
    
    author: {
      id: rawData.author?.id || rawData.authorId || '',
      name: rawData.author?.name || '',
      avatar: rawData.author?.avatar || '',
      isFollowed: rawData.author?.isFollowed || false,
      verified: rawData.author?.verified || false,
      level: rawData.author?.level || 1,
      fansCount: rawData.author?.fansCount || 0,
      followsCount: rawData.author?.followsCount || 0,
      videosCount: rawData.author?.videosCount || 0,
      bio: rawData.author?.bio || '',
      badges: rawData.author?.badges || []
    },
    
    event: rawData.event || null,
    ticket: rawData.ticket || null,
    
    interactionData: {
      playProgress: rawData.interactionData?.playProgress || 0,
      lastPlayTime: rawData.interactionData?.lastPlayTime || '',
      playCount: rawData.interactionData?.playCount || 0,
      completionRate: rawData.interactionData?.completionRate || 0,
      engagementScore: rawData.interactionData?.engagementScore || 0,
      hotComments: rawData.interactionData?.hotComments || []
    },
    
    technicalInfo: {
      encoding: rawData.technicalInfo?.encoding || 'H.264',
      bitrate: rawData.technicalInfo?.bitrate || 5000,
      frameRate: rawData.technicalInfo?.frameRate || 30,
      aspectRatio: rawData.technicalInfo?.aspectRatio || '16:9',
      audioInfo: {
        codec: rawData.technicalInfo?.audioInfo?.codec || 'AAC',
        sampleRate: rawData.technicalInfo?.audioInfo?.sampleRate || 44100,
        channels: rawData.technicalInfo?.audioInfo?.channels || 2
      },
      subtitles: rawData.technicalInfo?.subtitles || []
    },
    
    moderationInfo: {
      status: rawData.moderationInfo?.status || 'pending',
      reviewedAt: rawData.moderationInfo?.reviewedAt || '',
      reviewedBy: rawData.moderationInfo?.reviewedBy || '',
      contentRating: rawData.moderationInfo?.contentRating || 'G',
      flags: rawData.moderationInfo?.flags || []
    },
    
    analytics: {
      impressions: rawData.analytics?.impressions || 0,
      clickThroughRate: rawData.analytics?.clickThroughRate || 0,
      averageWatchTime: rawData.analytics?.averageWatchTime || 0,
      retentionRate: rawData.analytics?.retentionRate || 0,
      bounceRate: rawData.analytics?.bounceRate || 0,
      demographics: {
        ageGroups: {
          '18-24': rawData.analytics?.demographics?.ageGroups?.['18-24'] || 0,
          '25-34': rawData.analytics?.demographics?.ageGroups?.['25-34'] || 0,
          '35-44': rawData.analytics?.demographics?.ageGroups?.['35-44'] || 0,
          '45+': rawData.analytics?.demographics?.ageGroups?.['45+'] || 0
        },
        genderRatio: {
          male: rawData.analytics?.demographics?.genderRatio?.male || 0,
          female: rawData.analytics?.demographics?.genderRatio?.female || 0
        }
      }
    }
  }
}

/**
 * 验证视频帖子数据
 * @param {Object} videoData - 视频帖子数据
 * @returns {Object} 验证结果
 */
export function validateVideoPostData(videoData) {
  const errors = []
  
  if (!videoData.id) {
    errors.push('视频帖子ID不能为空')
  }
  
  if (!videoData.title) {
    errors.push('视频标题不能为空')
  }
  
  if (!videoData.description) {
    errors.push('视频描述不能为空')
  }
  
  if (!videoData.videos || videoData.videos.length === 0) {
    errors.push('至少需要一个视频文件')
  } else {
    videoData.videos.forEach((video, index) => {
      if (!video.url) {
        errors.push(`第${index + 1}个视频缺少URL`)
      }
      if (!video.thumbnail) {
        errors.push(`第${index + 1}个视频缺少缩略图`)
      }
      if (!video.duration && videoData.videoType !== 'live') {
        errors.push(`第${index + 1}个视频缺少时长信息`)
      }
    })
  }
  
  if (!videoData.author?.id) {
    errors.push('作者信息不能为空')
  }
  
  if (!videoData.author?.name) {
    errors.push('作者名称不能为空')
  }
  
  if (!videoData.author?.avatar) {
    errors.push('作者头像不能为空')
  }
  
  // 验证视频类型
  const validVideoTypes = ['short', 'long', 'live', 'story']
  if (!validVideoTypes.includes(videoData.videoType)) {
    errors.push('无效的视频类型')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 创建空的视频帖子数据
 * @returns {Object} 空视频帖子数据
 */
export function createEmptyVideoPostData() {
  return { ...VideoPostDataStructure }
}

/**
 * 创建模拟视频帖子数据
 * @param {Object} options - 选项
 * @returns {Object} 模拟数据
 */
export function createMockVideoPostData(options = {}) {
  const mockData = {
    id: options.id || 'video_001',
    title: options.title || '城市夜景延时摄影',
    description: options.description || '用延时摄影记录城市的夜晚，车流如河，灯火璀璨。霓虹灯下的都市生活，每一帧都是一个故事。',
    videos: options.videos || [
      {
        url: 'https://example.com/videos/city_night_timelapse.mp4',
        thumbnail: 'https://example.com/thumbnails/city_night_thumb.jpg',
        duration: 90,
        width: 1920,
        height: 1080,
        size: 52428800,
        format: 'mp4',
        quality: '1080p'
      }
    ],
    coverImage: options.coverImage || 'https://example.com/covers/city_night_cover.jpg',
    tags: options.tags || ['延时摄影', '城市夜景', '上海外滩'],
    location: options.location || '上海外滩',
    createTime: options.createTime || '2024-07-15T20:30:00Z',
    
    viewCount: options.viewCount || 15420,
    likeCount: options.likeCount || 1256,
    commentCount: options.commentCount || 89,
    collectCount: options.collectCount || 234,
    shareCount: options.shareCount || 156,
    
    isLiked: options.isLiked || false,
    isCollected: options.isCollected || false,
    isJoined: options.isJoined || false,
    
    videoType: options.videoType || 'short',
    playbackSettings: {
      autoPlay: options.playbackSettings?.autoPlay ?? true,
      loop: options.playbackSettings?.loop ?? true,
      muted: options.playbackSettings?.muted ?? false,
      showControls: options.playbackSettings?.showControls ?? true
    },
    
    author: {
      id: options.author?.id || 'author_video_001',
      name: options.author?.name || '城市摄影师',
      avatar: options.author?.avatar || 'https://example.com/avatars/photographer.jpg',
      isFollowed: options.author?.isFollowed || false,
      verified: options.author?.verified || true,
      level: options.author?.level || 5,
      fansCount: options.author?.fansCount || 52340,
      followsCount: options.author?.followsCount || 1234,
      videosCount: options.author?.videosCount || 89,
      bio: options.author?.bio || '专业摄影师，专注城市风光和延时摄影',
      badges: options.author?.badges || [
        {
          type: 'verification',
          name: '认证摄影师',
          icon: 'https://example.com/badges/verified.png'
        }
      ]
    },
    
    event: options.event || null,
    ticket: options.ticket || null,
    
    interactionData: {
      playProgress: 0.75,
      lastPlayTime: '2024-07-16T10:30:00Z',
      playCount: 3,
      completionRate: 0.85,
      engagementScore: 8.5,
      hotComments: [
        {
          id: 'comment_001',
          content: '太美了！这个视角真的震撼',
          author: '摄影爱好者',
          likeCount: 45,
          timestamp: 30
        }
      ]
    },
    
    technicalInfo: {
      encoding: 'H.264',
      bitrate: 5000,
      frameRate: 30,
      aspectRatio: '16:9',
      audioInfo: {
        codec: 'AAC',
        sampleRate: 44100,
        channels: 2
      },
      subtitles: []
    },
    
    moderationInfo: {
      status: 'approved',
      reviewedAt: '2024-07-15T21:00:00Z',
      reviewedBy: 'moderator_001',
      contentRating: 'G',
      flags: []
    },
    
    analytics: {
      impressions: 45320,
      clickThroughRate: 0.34,
      averageWatchTime: 76.5,
      retentionRate: 0.85,
      bounceRate: 0.15,
      demographics: {
        ageGroups: {
          '18-24': 0.25,
          '25-34': 0.45,
          '35-44': 0.20,
          '45+': 0.10
        },
        genderRatio: {
          male: 0.65,
          female: 0.35
        }
      }
    }
  }
  
  return mockData
}

/**
 * 视频帖子数据类型定义
 */
export const VideoPostDataTypes = {
  VIDEO_TYPE: {
    SHORT: 'short',
    LONG: 'long',
    LIVE: 'live',
    STORY: 'story'
  },
  
  VIDEO_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    FLAGGED: 'flagged'
  },
  
  VIDEO_QUALITY: {
    HD: '720p',
    FHD: '1080p',
    UHD: '4K'
  },
  
  VIDEO_FORMAT: {
    MP4: 'mp4',
    MOV: 'mov',
    M3U8: 'm3u8',
    WEBM: 'webm'
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
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
  },
  
  CONTENT_RATING: {
    G: 'G',           // 全年龄
    PG: 'PG',         // 建议家长指导
    PG_13: 'PG-13',   // 13岁以上
    R: 'R'            // 限制级
  }
}

/**
 * 视频帖子工具函数
 */
export const VideoPostUtils = {
  /**
   * 格式化视频时长显示
   * @param {number} duration - 时长（秒）
   * @returns {string} 格式化后的时长
   */
  formatDuration(duration) {
    if (!duration) return '00:00'
    
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = Math.floor(duration % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  },
  
  /**
   * 格式化文件大小
   * @param {number} size - 文件大小（字节）
   * @returns {string} 格式化后的大小
   */
  formatFileSize(size) {
    if (!size) return '0 B'
    
    const units = ['B', 'KB', 'MB', 'GB']
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  },
  
  /**
   * 获取视频质量标签
   * @param {string} quality - 视频质量
   * @returns {string} 质量标签
   */
  getQualityLabel(quality) {
    const labels = {
      '720p': 'HD',
      '1080p': 'FHD',
      '4K': 'UHD'
    }
    return labels[quality] || quality
  },
  
  /**
   * 判断是否为直播视频
   * @param {Object} videoPost - 视频帖子数据
   * @returns {boolean} 是否为直播
   */
  isLiveVideo(videoPost) {
    return videoPost.videoType === 'live'
  },
  
  /**
   * 判断是否为短视频
   * @param {Object} videoPost - 视频帖子数据
   * @returns {boolean} 是否为短视频
   */
  isShortVideo(videoPost) {
    return videoPost.videoType === 'short'
  },
  
  /**
   * 获取视频封面
   * @param {Object} videoPost - 视频帖子数据
   * @returns {string} 封面URL
   */
  getCoverImage(videoPost) {
    if (videoPost.coverImage) {
      return videoPost.coverImage
    }
    
    if (videoPost.videos && videoPost.videos.length > 0) {
      return videoPost.videos[0].thumbnail
    }
    
    return ''
  }
}
