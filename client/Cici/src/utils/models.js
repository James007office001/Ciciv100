/**
 * CICI 数据模型定义
 * 定义各种数据表的结构和验证规则
 */

import localDB from './localDB.js'

/**
 * 用户数据模型
 */
export const UserModel = {
  tableName: 'users',
  
  // 初始化表结构
  init() {
    localDB.createTable(this.tableName, {
      phone: { type: 'string', required: true, unique: true },
      name: { type: 'string', required: true },
      avatar: { type: 'string', default: '/static/c5.png' },
      email: { type: 'string' },
      birthday: { type: 'string' },
      gender: { type: 'string', enum: ['male', 'female', 'other'] },
      bio: { type: 'string', maxLength: 200 },
      location: { type: 'string' },
      isOnline: { type: 'boolean', default: false },
      lastActiveAt: { type: 'number', default: () => Date.now() },
      settings: { type: 'object', default: () => ({}) },
      loginType: { type: 'string', enum: ['password', 'code'] },
      token: { type: 'string' }
    })
    return this
  },

  // 创建用户
  create(userData) {
    return localDB.insert(this.tableName, userData)
  },

  // 根据手机号查找用户
  findByPhone(phone) {
    return localDB.findOne(this.tableName, { phone })
  },

  // 根据ID查找用户
  findById(id) {
    return localDB.findById(this.tableName, id)
  },

  // 更新用户信息
  update(id, updates) {
    return localDB.updateById(this.tableName, id, updates)
  },

  // 更新在线状态
  updateOnlineStatus(id, isOnline) {
    return this.update(id, { 
      isOnline, 
      lastActiveAt: Date.now() 
    })
  },

  // 获取所有用户
  getAll() {
    return localDB.find(this.tableName)
  },

  // 搜索用户
  search(keyword) {
    return localDB.find(this.tableName, {
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword } }
      ]
    })
  }
}

/**
 * 圈子数据模型
 */
export const CircleModel = {
  tableName: 'circles',
  
  init() {
    localDB.createTable(this.tableName, {
      name: { type: 'string', required: true },
      description: { type: 'string' },
      avatar: { type: 'string', default: '/static/c1.png' },
      coverImage: { type: 'string' },
      ownerId: { type: 'string', required: true },
      memberIds: { type: 'array', default: () => [] },
      isPrivate: { type: 'boolean', default: false },
      category: { type: 'string' },
      tags: { type: 'array', default: () => [] },
      memberCount: { type: 'number', default: 0 },
      postCount: { type: 'number', default: 0 },
      lastActiveAt: { type: 'number', default: () => Date.now() },
      rules: { type: 'string' },
      settings: { type: 'object', default: () => ({}) }
    })
    return this
  },

  create(circleData) {
    const circle = localDB.insert(this.tableName, {
      ...circleData,
      memberIds: [circleData.ownerId],
      memberCount: 1
    })
    return circle
  },

  findById(id) {
    return localDB.findById(this.tableName, id)
  },

  findByOwnerId(ownerId) {
    return localDB.find(this.tableName, { ownerId })
  },

  // 获取用户加入的圈子
  findByMemberId(memberId) {
    return localDB.find(this.tableName, {
      memberIds: { $in: [memberId] }
    })
  },

  // 加入圈子
  joinCircle(circleId, userId) {
    const circle = this.findById(circleId)
    if (circle && !circle.memberIds.includes(userId)) {
      circle.memberIds.push(userId)
      circle.memberCount = circle.memberIds.length
      return localDB.updateById(this.tableName, circleId, {
        memberIds: circle.memberIds,
        memberCount: circle.memberCount
      })
    }
    return 0
  },

  // 离开圈子
  leaveCircle(circleId, userId) {
    const circle = this.findById(circleId)
    if (circle) {
      circle.memberIds = circle.memberIds.filter(id => id !== userId)
      circle.memberCount = circle.memberIds.length
      return localDB.updateById(this.tableName, circleId, {
        memberIds: circle.memberIds,
        memberCount: circle.memberCount
      })
    }
    return 0
  },

  update(id, updates) {
    return localDB.updateById(this.tableName, id, updates)
  },

  getAll() {
    return localDB.find(this.tableName, {}, { 
      orderBy: { lastActiveAt: 'desc' } 
    })
  },

  // 搜索圈子
  search(keyword) {
    return localDB.find(this.tableName, {
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [keyword] } }
      ]
    })
  }
}

/**
 * 帖子数据模型
 * 使用标准帖子数据结构
 */
export const PostModel = {
  tableName: 'posts',
  
  init() {
    localDB.createTable(this.tableName, {
      // 基础字段
      id: { type: 'string', required: true },
      title: { type: 'string', required: true },
      description: { type: 'string', required: true },
      images: { type: 'array', default: () => [] },
      tags: { type: 'array', default: () => [] },
      location: { type: 'string', default: '' },
      createTime: { type: 'string', required: true },
      
      // 统计数据
      viewCount: { type: 'number', default: 0 },
      likeCount: { type: 'number', default: 0 },
      commentCount: { type: 'number', default: 0 },
      collectCount: { type: 'number', default: 0 },
      
      // 用户状态
      isLiked: { type: 'boolean', default: false },
      isCollected: { type: 'boolean', default: false },
      isJoined: { type: 'boolean', default: false },
      
      // 关联信息
      authorId: { type: 'string', required: true },
      circleId: { type: 'string', required: true },
      
      // 扩展字段
      event: { type: 'object', default: null },
      ticket: { type: 'object', default: null },
      
      // 系统字段
      likedBy: { type: 'array', default: () => [] },
      collectedBy: { type: 'array', default: () => [] },
      joinedBy: { type: 'array', default: () => [] },
      isTop: { type: 'boolean', default: false },
      status: { type: 'string', enum: ['published', 'draft', 'deleted'], default: 'published' }
    })
    return this
  },

  create(postData) {
    const post = localDB.insert(this.tableName, postData)
    // 更新圈子帖子数量
    CircleModel.update(postData.circleId, {
      postCount: { $inc: 1 },
      lastActiveAt: Date.now()
    })
    return post
  },

  findById(id) {
    return localDB.findById(this.tableName, id)
  },

  findByCircleId(circleId) {
    return localDB.find(this.tableName, 
      { circleId, status: 'published' }, 
      { orderBy: { isTop: 'desc', createdAt: 'desc' } }
    )
  },

  findByAuthorId(authorId) {
    return localDB.find(this.tableName, 
      { authorId, status: 'published' }, 
      { orderBy: { createdAt: 'desc' } }
    )
  },

  // 点赞
  like(postId, userId) {
    const post = this.findById(postId)
    if (post && !post.likedBy.includes(userId)) {
      post.likedBy.push(userId)
      return localDB.updateById(this.tableName, postId, {
        likedBy: post.likedBy,
        likeCount: post.likedBy.length
      })
    }
    return 0
  },

  // 取消点赞
  unlike(postId, userId) {
    const post = this.findById(postId)
    if (post) {
      post.likedBy = post.likedBy.filter(id => id !== userId)
      return localDB.updateById(this.tableName, postId, {
        likedBy: post.likedBy,
        likeCount: post.likedBy.length
      })
    }
    return 0
  },

  update(id, updates) {
    return localDB.updateById(this.tableName, id, updates)
  },

  delete(id) {
    return localDB.updateById(this.tableName, id, { status: 'deleted' })
  }
}

/**
 * 评论数据模型
 */
export const CommentModel = {
  tableName: 'comments',
  
  init() {
    localDB.createTable(this.tableName, {
      content: { type: 'string', required: true },
      authorId: { type: 'string', required: true },
      postId: { type: 'string', required: true },
      parentId: { type: 'string' }, // 父评论ID，用于回复
      replyToUserId: { type: 'string' }, // 回复的用户ID
      likeCount: { type: 'number', default: 0 },
      likedBy: { type: 'array', default: () => [] },
      status: { type: 'string', enum: ['published', 'deleted'], default: 'published' }
    })
    return this
  },

  create(commentData) {
    const comment = localDB.insert(this.tableName, commentData)
    // 更新帖子评论数量
    PostModel.update(commentData.postId, {
      commentCount: { $inc: 1 }
    })
    return comment
  },

  findByPostId(postId) {
    return localDB.find(this.tableName, 
      { postId, status: 'published' }, 
      { orderBy: { createdAt: 'asc' } }
    )
  },

  findById(id) {
    return localDB.findById(this.tableName, id)
  },

  update(id, updates) {
    return localDB.updateById(this.tableName, id, updates)
  },

  delete(id) {
    return localDB.updateById(this.tableName, id, { status: 'deleted' })
  }
}

/**
 * 消息数据模型
 */
export const MessageModel = {
  tableName: 'messages',
  
  init() {
    localDB.createTable(this.tableName, {
      type: { type: 'string', enum: ['text', 'image', 'voice', 'video', 'file'], default: 'text' },
      content: { type: 'string', required: true },
      senderId: { type: 'string', required: true },
      receiverId: { type: 'string', required: true },
      conversationId: { type: 'string', required: true },
      isRead: { type: 'boolean', default: false },
      readAt: { type: 'number' },
      status: { type: 'string', enum: ['sending', 'sent', 'delivered', 'failed'], default: 'sent' },
      extra: { type: 'object', default: () => ({}) } // 额外信息，如文件大小、时长等
    })
    return this
  },

  create(messageData) {
    return localDB.insert(this.tableName, messageData)
  },

  findByConversationId(conversationId) {
    return localDB.find(this.tableName, 
      { conversationId }, 
      { orderBy: { createdAt: 'asc' } }
    )
  },

  markAsRead(messageId) {
    return localDB.updateById(this.tableName, messageId, {
      isRead: true,
      readAt: Date.now()
    })
  },

  markConversationAsRead(conversationId, userId) {
    return localDB.update(this.tableName, 
      { conversationId, receiverId: userId, isRead: false },
      { isRead: true, readAt: Date.now() }
    )
  },

  getUnreadCount(userId) {
    const unreadMessages = localDB.find(this.tableName, {
      receiverId: userId,
      isRead: false
    })
    return unreadMessages.length
  }
}

/**
 * 初始化所有数据模型
 */
export function initializeModels() {
  UserModel.init()
  CircleModel.init()
  PostModel.init()
  CommentModel.init()
  MessageModel.init()
  
  console.log('所有数据模型初始化完成')
}

export default {
  UserModel,
  CircleModel,
  PostModel,
  CommentModel,
  MessageModel,
  initializeModels
}
