# 视频帖子数据结构说明

## 概述

本文档定义了CICI社交平台视频帖子的完整数据结构，包括视频本身的内容、博主信息、关联事件信息和门票信息等。该结构支持多种视频类型（短视频、长视频、直播、故事）和丰富的互动功能。

## 文件说明

- `video-post-structure.json`: 完整的JSON Schema定义
- `video-post-examples.json`: 示例数据，展示不同类型视频帖子的数据结构
- `video-post-README.md`: 本说明文档

## 核心字段说明

### 基本信息

- **id**: 视频帖子唯一标识符
- **title**: 视频标题
- **description**: 视频描述内容
- **videos**: 视频文件列表（支持多个视频文件）
- **coverImage**: 封面图片URL
- **tags**: 标签列表
- **location**: 地理位置
- **createTime**: 发布时间（ISO 8601格式）

### 视频文件信息

每个视频文件包含：
- **url**: 视频文件URL
- **thumbnail**: 缩略图URL
- **duration**: 视频时长（秒）
- **width/height**: 视频尺寸
- **size**: 文件大小（字节）
- **format**: 视频格式（mp4、mov、m3u8等）
- **quality**: 视频质量（720p、1080p、4K）

### 统计数据

- **viewCount**: 播放量
- **likeCount**: 点赞数
- **commentCount**: 评论数
- **collectCount**: 收藏数
- **shareCount**: 分享数
- **isLiked/isCollected/isJoined**: 当前用户状态

### 视频类型

- **short**: 短视频（通常<3分钟）
- **long**: 长视频（>3分钟）
- **live**: 直播视频
- **story**: 故事视频（24小时后消失）

### 播放设置

- **autoPlay**: 是否自动播放
- **loop**: 是否循环播放
- **muted**: 是否默认静音
- **showControls**: 是否显示播放控件

### 博主信息

包含完整的博主资料：
- 基本信息（ID、昵称、头像）
- 认证状态和等级
- 粉丝数、关注数、视频数
- 个人简介
- 徽章列表

### 事件信息

当视频关联活动时包含：
- 事件基本信息（标题、描述、时间、地点）
- 事件状态（即将开始、进行中、已结束、已取消）
- 容量和参与人数
- 主办方信息
- 参与要求和活动亮点

### 门票信息

当视频关联门票时包含：
- 门票类型（电子票、实体票、虚拟票）
- 价格信息（包括原价和折扣）
- 有效期限
- 二维码和序列号
- 座位信息（如适用）
- 门票权益和退款政策

### 互动数据

- **playProgress**: 播放进度（0-1）
- **lastPlayTime**: 最后播放时间
- **playCount**: 播放次数
- **completionRate**: 完播率
- **engagementScore**: 互动评分
- **hotComments**: 热门评论列表

### 技术信息

- **encoding**: 编码格式
- **bitrate**: 码率（kbps）
- **frameRate**: 帧率（fps）
- **aspectRatio**: 宽高比
- **audioInfo**: 音频信息
- **subtitles**: 字幕信息

### 审核信息

- **status**: 审核状态（待审核、已通过、已拒绝、已标记）
- **reviewedAt**: 审核时间
- **reviewedBy**: 审核员ID
- **contentRating**: 内容分级
- **flags**: 标记内容

### 分析数据

- **impressions**: 曝光次数
- **clickThroughRate**: 点击率
- **averageWatchTime**: 平均观看时长
- **retentionRate**: 留存率
- **bounceRate**: 跳出率
- **demographics**: 用户画像（年龄、性别分布）

## 使用示例

### 前端使用

```javascript
// 导入视频帖子数据结构
import videoPostStructure from '@/share/datastructure/video-post-structure.json'
import videoPostExamples from '@/share/datastructure/video-post-examples.json'

// 创建新的视频帖子
const createVideoPost = (videoData) => {
  // 验证数据结构
  if (validateVideoPost(videoData)) {
    return {
      success: true,
      data: videoData
    }
  }
  return {
    success: false,
    error: 'Invalid video post data'
  }
}

// 获取视频帖子列表
const getVideoPosts = () => {
  return videoPostExamples.videoPostExamples
}

// 播放视频
const playVideo = (videoId) => {
  const videoPost = getVideoPost(videoId)
  if (videoPost && videoPost.videos.length > 0) {
    const video = videoPost.videos[0]
    return {
      url: video.url,
      thumbnail: video.thumbnail,
      settings: videoPost.playbackSettings
    }
  }
}
```

### 后端使用

```javascript
// Node.js 示例
const fs = require('fs')
const path = require('path')

// 加载数据结构
const structurePath = path.join(__dirname, '../share/datastructure/video-post-structure.json')
const examplesPath = path.join(__dirname, '../share/datastructure/video-post-examples.json')

const videoPostStructure = JSON.parse(fs.readFileSync(structurePath, 'utf8'))
const videoPostExamples = JSON.parse(fs.readFileSync(examplesPath, 'utf8'))

// API接口示例
app.get('/api/video-posts', (req, res) => {
  const { type, page = 1, limit = 10 } = req.query
  const posts = getVideoPostsByType(type, page, limit)
  res.json({
    success: true,
    data: posts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: getTotalVideoPostsCount(type)
    }
  })
})

app.post('/api/video-posts', (req, res) => {
  const videoData = req.body
  // 验证数据结构
  if (validateVideoPost(videoData)) {
    const savedPost = saveVideoPost(videoData)
    res.json({ success: true, data: savedPost })
  } else {
    res.status(400).json({ success: false, error: 'Invalid video post data' })
  }
})
```

## 数据验证

### 必填字段验证

```javascript
const validateVideoPost = (videoData) => {
  const requiredFields = ['id', 'title', 'description', 'videos', 'author']
  
  for (const field of requiredFields) {
    if (!videoData[field]) {
      return { valid: false, error: `Missing required field: ${field}` }
    }
  }
  
  // 验证视频数组
  if (!Array.isArray(videoData.videos) || videoData.videos.length === 0) {
    return { valid: false, error: 'At least one video is required' }
  }
  
  // 验证视频文件
  for (const video of videoData.videos) {
    if (!video.url || !video.thumbnail || !video.duration) {
      return { valid: false, error: 'Video file missing required fields' }
    }
  }
  
  // 验证作者信息
  if (!videoData.author.id || !videoData.author.name || !videoData.author.avatar) {
    return { valid: false, error: 'Author information incomplete' }
  }
  
  return { valid: true }
}
```

### 类型验证

```javascript
const validateVideoType = (videoType) => {
  const validTypes = ['short', 'long', 'live', 'story']
  return validTypes.includes(videoType)
}

const validateVideoQuality = (quality) => {
  const validQualities = ['720p', '1080p', '4K']
  return validQualities.includes(quality)
}
```

## 扩展性

### 支持的视频格式

- **MP4**: 最常用的视频格式
- **MOV**: Apple设备优化格式
- **M3U8**: 直播流格式
- **WebM**: Web优化格式

### 支持的字幕格式

- **SRT**: 最常用的字幕格式
- **VTT**: Web字幕格式
- **ASS**: 高级字幕格式

### 扩展字段

数据结构设计时考虑了扩展性，可以根据业务需求添加新字段：

```javascript
// 示例：添加AI分析字段
const videoPostExtended = {
  ...videoPost,
  aiAnalysis: {
    contentTags: ['nature', 'music', 'tutorial'],
    sentiment: 'positive',
    faces: 2,
    objects: ['guitar', 'microphone'],
    transcription: 'video content transcription...'
  }
}
```

## 版本控制

- 当前版本: 1.0.0
- 版本规则: 遵循语义化版本控制
- 兼容性: 向后兼容，新版本不会破坏现有功能

## 注意事项

1. **必填字段**: 所有`required`数组中的字段都必须提供
2. **数据格式**: 严格按照JSON Schema定义的格式
3. **时间格式**: 统一使用ISO 8601格式
4. **文件大小**: 考虑移动端播放，建议控制视频文件大小
5. **权限控制**: 严格按照权限设置进行操作验证
6. **性能考虑**: 大视频文件应使用流式传输
7. **数据同步**: 前后端使用相同的数据结构确保一致性

## 最佳实践

1. **视频优化**: 使用适当的压缩率和质量设置
2. **缩略图**: 选择有代表性的帧作为缩略图
3. **元数据**: 尽可能完善视频元数据信息
4. **用户体验**: 根据网络状况自动调整视频质量
5. **数据分析**: 充分利用分析数据优化内容策略

---

**文档版本**: 1.0.0
**最后更新**: 2024-07-18
**维护者**: CICI开发团队
