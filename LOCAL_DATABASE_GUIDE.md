# CICI 本地数据库使用指南

## 概述

CICI 本地数据库是一个基于 UniApp 本地存储的轻量级数据库系统，提供了完整的 CRUD 操作和高级查询功能。

## 特性

- ✅ 完整的 CRUD 操作（创建、读取、更新、删除）
- ✅ 高级查询条件支持（$eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $regex）
- ✅ 排序和分页功能
- ✅ 数据模型验证
- ✅ 关联查询支持
- ✅ 数据导入导出
- ✅ 统计信息
- ✅ 事务性操作
- ✅ 自动生成 ID 和时间戳

## 快速开始

### 1. 初始化数据库

```javascript
import { initializeDatabase } from '@/src/utils/dbInit.js'

// 在应用启动时初始化
await initializeDatabase()
```

### 2. 使用数据模型

```javascript
import { UserModel, CircleModel, PostModel } from '@/src/utils/models.js'

// 创建用户
const user = UserModel.create({
  phone: '13800138000',
  name: '张小明',
  avatar: '/static/avatar.png'
})

// 查询用户
const user = UserModel.findByPhone('13800138000')
const users = UserModel.getAll()

// 更新用户
UserModel.update(user.id, { name: '新名字' })
```

### 3. 使用服务层

```javascript
import { UserService, CircleService, PostService } from '@/src/utils/dataService.js'

// 用户注册
const result = await UserService.register({
  phone: '13800138000',
  name: '张小明',
  password: '123456'
})

// 创建圈子
const circleResult = await CircleService.createCircle({
  name: '摄影爱好者',
  description: '分享摄影技巧',
  ownerId: user.id
})

// 发布帖子
const postResult = await PostService.createPost({
  title: '今日拍摄技巧',
  content: '分享一个小技巧...',
  authorId: user.id,
  circleId: circle.id
})
```

## 数据模型

### UserModel（用户模型）

```javascript
{
  id: 'string',           // 自动生成
  phone: 'string',        // 手机号（必填，唯一）
  name: 'string',         // 用户名（必填）
  avatar: 'string',       // 头像
  email: 'string',        // 邮箱
  birthday: 'string',     // 生日
  gender: 'string',       // 性别：male/female/other
  bio: 'string',          // 个人简介
  location: 'string',     // 地址
  isOnline: 'boolean',    // 是否在线
  lastActiveAt: 'number', // 最后活跃时间
  settings: 'object',     // 用户设置
  createdAt: 'number',    // 创建时间（自动）
  updatedAt: 'number'     // 更新时间（自动）
}
```

### CircleModel（圈子模型）

```javascript
{
  id: 'string',           // 自动生成
  name: 'string',         // 圈子名称（必填）
  description: 'string',  // 圈子描述
  avatar: 'string',       // 圈子头像
  coverImage: 'string',   // 封面图片
  ownerId: 'string',      // 圈主ID（必填）
  memberIds: 'array',     // 成员ID列表
  isPrivate: 'boolean',   // 是否私密
  category: 'string',     // 分类
  tags: 'array',          // 标签
  memberCount: 'number',  // 成员数量
  postCount: 'number',    // 帖子数量
  lastActiveAt: 'number', // 最后活跃时间
  rules: 'string',        // 圈子规则
  settings: 'object',     // 圈子设置
  createdAt: 'number',    // 创建时间（自动）
  updatedAt: 'number'     // 更新时间（自动）
}
```

### PostModel（帖子模型）

```javascript
{
  id: 'string',           // 自动生成
  title: 'string',        // 帖子标题
  content: 'string',      // 帖子内容（必填）
  authorId: 'string',     // 作者ID（必填）
  circleId: 'string',     // 圈子ID（必填）
  images: 'array',        // 图片列表
  videos: 'array',        // 视频列表
  location: 'object',     // 位置信息
  tags: 'array',          // 标签
  likeCount: 'number',    // 点赞数
  commentCount: 'number', // 评论数
  shareCount: 'number',   // 分享数
  viewCount: 'number',    // 浏览数
  likedBy: 'array',       // 点赞用户ID列表
  isTop: 'boolean',       // 是否置顶
  status: 'string',       // 状态：published/draft/deleted
  createdAt: 'number',    // 创建时间（自动）
  updatedAt: 'number'     // 更新时间（自动）
}
```

## 高级查询

### 基本查询

```javascript
// 等值查询
const users = UserModel.find({ name: '张小明' })

// 多条件查询
const posts = PostModel.find({ 
  circleId: 'circle_123',
  status: 'published'
})
```

### 高级条件

```javascript
// 大于/小于
const recentPosts = PostModel.find({
  createdAt: { $gt: Date.now() - 7 * 24 * 60 * 60 * 1000 } // 7天内
})

// 包含查询
const popularPosts = PostModel.find({
  likeCount: { $gte: 10 }
})

// 数组包含
const techPosts = PostModel.find({
  tags: { $in: ['科技', '技术'] }
})

// 正则表达式
const searchPosts = PostModel.find({
  title: { $regex: '摄影', $options: 'i' }
})
```

### 排序和分页

```javascript
// 排序
const posts = PostModel.find({}, {
  orderBy: { 
    isTop: 'desc',      // 置顶帖子优先
    createdAt: 'desc'   // 按创建时间倒序
  }
})

// 分页
const posts = PostModel.find({}, {
  offset: 20,  // 跳过前20条
  limit: 10    // 取10条
})
```

## 服务层 API

### UserService

```javascript
// 用户注册
const result = await UserService.register({
  phone: '13800138000',
  name: '张小明',
  password: '123456'
})

// 用户登录
const result = await UserService.login('13800138000', '123456')

// 更新资料
const result = await UserService.updateProfile(userId, {
  name: '新名字',
  bio: '新的个人简介'
})

// 搜索用户
const result = await UserService.searchUsers('张小明')
```

### CircleService

```javascript
// 创建圈子
const result = await CircleService.createCircle({
  name: '摄影爱好者',
  description: '分享摄影技巧',
  ownerId: userId
})

// 加入圈子
const result = await CircleService.joinCircle(circleId, userId)

// 获取用户圈子
const result = await CircleService.getUserCircles(userId)

// 获取圈子详情
const result = await CircleService.getCircleDetail(circleId)
```

### PostService

```javascript
// 发布帖子
const result = await PostService.createPost({
  title: '今日分享',
  content: '内容...',
  authorId: userId,
  circleId: circleId,
  images: ['/static/image.jpg'],
  tags: ['摄影', '技巧']
})

// 获取圈子帖子
const result = await PostService.getCirclePosts(circleId, 1, 10)

// 获取帖子详情
const result = await PostService.getPostDetail(postId)

// 点赞/取消点赞
const result = await PostService.toggleLike(postId, userId)
```

## 数据备份

### 导出数据

```javascript
import { BackupService } from '@/src/utils/dataService.js'

// 导出所有数据
const result = await BackupService.exportData()
if (result.success) {
  console.log('导出的数据:', result.data)
  
  // 保存到文件或发送到服务器
  uni.setStorageSync('backup_data', result.data)
}
```

### 导入数据

```javascript
// 从备份恢复数据
const backupData = uni.getStorageSync('backup_data')
const result = await BackupService.importData(backupData)
```

### 获取统计信息

```javascript
const result = await BackupService.getDataStats()
if (result.success) {
  console.log('数据库统计:', result.stats)
  /*
  {
    tables: {
      users: { recordCount: 10, schema: {...}, createdAt: 1234567890 },
      circles: { recordCount: 5, schema: {...}, createdAt: 1234567890 },
      posts: { recordCount: 20, schema: {...}, createdAt: 1234567890 }
    },
    totalRecords: 35
  }
  */
}
```

## 在 Vue 组件中使用

```vue
<template>
  <view class="page">
    <view v-for="post in posts" :key="post.id" class="post-item">
      <text>{{ post.title }}</text>
      <text>{{ post.content }}</text>
      <button @click="toggleLike(post.id)">
        {{ post.likedBy.includes(currentUserId) ? '取消点赞' : '点赞' }}
        ({{ post.likeCount }})
      </button>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'
import { PostService } from '@/src/utils/dataService.js'
import { useUserStore } from '@/src/store/user.js'

export default {
  setup() {
    const posts = ref([])
    const userStore = useUserStore()
    const currentUserId = userStore.userInfo?.id
    
    const loadPosts = async () => {
      const result = await PostService.getCirclePosts('circle_123')
      if (result.success) {
        posts.value = result.posts
      }
    }
    
    const toggleLike = async (postId) => {
      const result = await PostService.toggleLike(postId, currentUserId)
      if (result.success) {
        // 更新本地数据
        const post = posts.value.find(p => p.id === postId)
        if (post) {
          post.likeCount = result.likeCount
          if (result.isLiked) {
            post.likedBy.push(currentUserId)
          } else {
            post.likedBy = post.likedBy.filter(id => id !== currentUserId)
          }
        }
      }
    }
    
    onMounted(() => {
      loadPosts()
    })
    
    return {
      posts,
      currentUserId,
      toggleLike
    }
  }
}
</script>
```

## 最佳实践

### 1. 数据验证

```javascript
// 在创建数据前进行验证
const validateUserData = (userData) => {
  if (!userData.phone || !/^1[3-9]\d{9}$/.test(userData.phone)) {
    throw new Error('手机号格式不正确')
  }
  if (!userData.name || userData.name.length < 2) {
    throw new Error('用户名至少2个字符')
  }
}

// 使用
try {
  validateUserData(newUser)
  const user = UserModel.create(newUser)
} catch (error) {
  uni.showToast({ title: error.message, icon: 'none' })
}
```

### 2. 错误处理

```javascript
// 统一错误处理
const handleServiceResult = (result, successCallback) => {
  if (result.success) {
    successCallback(result)
  } else {
    uni.showToast({
      title: result.error || '操作失败',
      icon: 'none'
    })
  }
}

// 使用
const result = await UserService.register(userData)
handleServiceResult(result, (res) => {
  console.log('注册成功:', res.user)
  // 跳转到主页等
})
```

### 3. 数据同步

```javascript
// 定期备份数据
const autoBackup = () => {
  setInterval(async () => {
    const result = await BackupService.exportData()
    if (result.success) {
      uni.setStorageSync('auto_backup', {
        data: result.data,
        timestamp: Date.now()
      })
    }
  }, 24 * 60 * 60 * 1000) // 每24小时备份一次
}
```

### 4. 性能优化

```javascript
// 分页加载大量数据
const loadPostsWithPagination = async (page = 1, pageSize = 10) => {
  const result = await PostService.getCirclePosts(circleId, page, pageSize)
  if (result.success) {
    if (page === 1) {
      posts.value = result.posts
    } else {
      posts.value.push(...result.posts)
    }
  }
}

// 缓存查询结果
const cache = new Map()
const getCachedPosts = (circleId) => {
  const cacheKey = `posts_${circleId}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }
  
  const posts = PostModel.findByCircleId(circleId)
  cache.set(cacheKey, posts)
  return posts
}
```

## 注意事项

1. **存储限制**：本地存储有大小限制，建议定期清理过期数据
2. **数据同步**：这是离线数据库，需要额外实现与服务器的同步逻辑
3. **并发安全**：JavaScript 是单线程的，但仍需注意数据一致性
4. **备份重要**：定期备份数据，避免数据丢失
5. **索引优化**：对于大量数据，考虑添加索引字段提高查询性能

## 扩展功能

如需更多功能，可以扩展 localDB.js：

- 添加索引支持
- 实现数据压缩
- 添加数据加密
- 实现数据同步
- 添加查询缓存
- 支持数据迁移

这个本地数据库系统为 CICI 应用提供了完整的数据管理能力，支持复杂的业务逻辑，同时保持轻量和高效。
