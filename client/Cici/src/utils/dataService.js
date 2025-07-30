/**
 * CICI 数据服务层
 * 提供高级数据操作和业务逻辑
 */

import localDB from './localDB.js'
import { UserModel, CircleModel, PostModel, CommentModel, MessageModel } from './models.js'

/**
 * 用户服务
 */
export const UserService = {
  /**
   * 用户注册
   */
  async register(userData) {
    try {
      // 检查手机号是否已存在
      const existingUser = UserModel.findByPhone(userData.phone)
      if (existingUser) {
        throw new Error('手机号已被注册')
      }

      // 创建用户
      const user = UserModel.create({
        ...userData,
        isOnline: true,
        lastActiveAt: Date.now()
      })

      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 用户登录
   */
  async login(phone, password) {
    try {
      const user = UserModel.findByPhone(phone)
      if (!user) {
        throw new Error('用户不存在')
      }

      // 更新登录状态
      UserModel.update(user.id, {
        isOnline: true,
        lastActiveAt: Date.now(),
        token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })

      const updatedUser = UserModel.findById(user.id)
      return { success: true, user: updatedUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 用户登出
   */
  async logout(userId) {
    try {
      UserModel.update(userId, {
        isOnline: false,
        token: null
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 更新用户资料
   */
  async updateProfile(userId, updates) {
    try {
      const result = UserModel.update(userId, updates)
      if (result > 0) {
        const user = UserModel.findById(userId)
        return { success: true, user }
      }
      throw new Error('更新失败')
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 搜索用户
   */
  async searchUsers(keyword) {
    try {
      const users = UserModel.search(keyword)
      return { success: true, users }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

/**
 * 圈子服务
 */
export const CircleService = {
  /**
   * 创建圈子
   */
  async createCircle(circleData) {
    try {
      const circle = CircleModel.create(circleData)
      return { success: true, circle }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 加入圈子
   */
  async joinCircle(circleId, userId) {
    try {
      const circle = CircleModel.findById(circleId)
      if (!circle) {
        throw new Error('圈子不存在')
      }

      if (circle.memberIds.includes(userId)) {
        throw new Error('已经是圈子成员')
      }

      CircleModel.joinCircle(circleId, userId)
      const updatedCircle = CircleModel.findById(circleId)
      
      return { success: true, circle: updatedCircle }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 离开圈子
   */
  async leaveCircle(circleId, userId) {
    try {
      const circle = CircleModel.findById(circleId)
      if (!circle) {
        throw new Error('圈子不存在')
      }

      if (circle.ownerId === userId) {
        throw new Error('圈主不能离开圈子')
      }

      CircleModel.leaveCircle(circleId, userId)
      const updatedCircle = CircleModel.findById(circleId)
      
      return { success: true, circle: updatedCircle }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 获取用户的圈子
   */
  async getUserCircles(userId) {
    try {
      const circles = CircleModel.findByMemberId(userId)
      return { success: true, circles }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 搜索圈子
   */
  async searchCircles(keyword) {
    try {
      const circles = CircleModel.search(keyword)
      return { success: true, circles }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 获取圈子详情（包含成员信息）
   */
  async getCircleDetail(circleId) {
    try {
      const circle = CircleModel.findById(circleId)
      if (!circle) {
        throw new Error('圈子不存在')
      }

      // 获取成员信息
      const members = circle.memberIds.map(memberId => {
        const user = UserModel.findById(memberId)
        return user ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          isOnline: user.isOnline
        } : null
      }).filter(Boolean)

      // 获取最新帖子
      const recentPosts = PostModel.findByCircleId(circleId).slice(0, 5)

      return {
        success: true,
        circle: {
          ...circle,
          members,
          recentPosts
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

/**
 * 帖子服务
 */
export const PostService = {
  /**
   * 发布帖子
   * 使用标准帖子数据结构
   */
  async createPost(postData) {
    try {
      // 验证数据结构
      const requiredFields = ['title', 'description', 'images', 'authorId', 'circleId']
      for (const field of requiredFields) {
        if (!postData[field]) {
          throw new Error(`缺少必需字段: ${field}`)
        }
      }
      
      // 格式化数据
      const formattedData = {
        id: Date.now().toString(),
        title: postData.title,
        description: postData.description,
        images: postData.images || [],
        tags: postData.tags || [],
        location: postData.location || '',
        createTime: new Date().toISOString(),
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        collectCount: 0,
        isLiked: false,
        isCollected: false,
        isJoined: false,
        authorId: postData.authorId,
        circleId: postData.circleId,
        event: postData.event || null,
        ticket: postData.ticket || null,
        status: 'published'
      }
      
      const post = PostModel.create(formattedData)
      return { success: true, post }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 获取圈子帖子列表
   */
  async getCirclePosts(circleId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit
      const posts = localDB.find(PostModel.tableName, 
        { circleId, status: 'published' },
        { 
          orderBy: { isTop: 'desc', createdAt: 'desc' },
          offset,
          limit
        }
      )

      // 补充作者信息
      const postsWithAuthor = posts.map(post => {
        const author = UserModel.findById(post.authorId)
        return {
          ...post,
          author: author ? {
            id: author.id,
            name: author.name,
            avatar: author.avatar
          } : null
        }
      })

      return { success: true, posts: postsWithAuthor }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 获取帖子详情
   * 返回标准格式的帖子数据
   */
  async getPostDetail(postId) {
    try {
      const post = PostModel.findById(postId)
      if (!post) {
        throw new Error('帖子不存在')
      }

      // 获取作者信息
      const author = UserModel.findById(post.authorId)
      
      // 获取评论
      const comments = CommentModel.findByPostId(postId)
      const commentsWithAuthor = comments.map(comment => {
        const commentAuthor = UserModel.findById(comment.authorId)
        return {
          ...comment,
          author: commentAuthor ? {
            id: commentAuthor.id,
            name: commentAuthor.name,
            avatar: commentAuthor.avatar
          } : null
        }
      })

      // 更新浏览量
      PostModel.update(postId, { viewCount: post.viewCount + 1 })

      // 格式化返回数据，确保符合标准结构
      const formattedPost = {
        id: post.id,
        title: post.title,
        description: post.description,
        images: post.images || [],
        tags: post.tags || [],
        location: post.location || '',
        createTime: post.createTime,
        
        viewCount: post.viewCount + 1,
        likeCount: post.likeCount || 0,
        commentCount: post.commentCount || 0,
        collectCount: post.collectCount || 0,
        
        isLiked: post.isLiked || false,
        isCollected: post.isCollected || false,
        isJoined: post.isJoined || false,
        
        author: author ? {
          id: author.id,
          name: author.name,
          avatar: author.avatar,
          isFollowed: author.isFollowed || false
        } : null,
        
        event: post.event || null,
        ticket: post.ticket || null,
        
        comments: commentsWithAuthor
      }

      return {
        success: true,
        post: formattedPost
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 点赞/取消点赞
   */
  async toggleLike(postId, userId) {
    try {
      const post = PostModel.findById(postId)
      if (!post) {
        throw new Error('帖子不存在')
      }

      const isLiked = post.likedBy.includes(userId)
      
      if (isLiked) {
        PostModel.unlike(postId, userId)
      } else {
        PostModel.like(postId, userId)
      }

      const updatedPost = PostModel.findById(postId)
      return { 
        success: true, 
        isLiked: !isLiked,
        likeCount: updatedPost.likeCount
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

/**
 * 评论服务
 */
export const CommentService = {
  /**
   * 发表评论
   */
  async createComment(commentData) {
    try {
      const comment = CommentModel.create(commentData)
      
      // 获取作者信息
      const author = UserModel.findById(comment.authorId)
      
      return {
        success: true,
        comment: {
          ...comment,
          author: author ? {
            id: author.id,
            name: author.name,
            avatar: author.avatar
          } : null
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 获取帖子评论
   */
  async getPostComments(postId) {
    try {
      const comments = CommentModel.findByPostId(postId)
      
      const commentsWithAuthor = comments.map(comment => {
        const author = UserModel.findById(comment.authorId)
        const replyToUser = comment.replyToUserId ? UserModel.findById(comment.replyToUserId) : null
        
        return {
          ...comment,
          author: author ? {
            id: author.id,
            name: author.name,
            avatar: author.avatar
          } : null,
          replyToUser: replyToUser ? {
            id: replyToUser.id,
            name: replyToUser.name
          } : null
        }
      })

      return { success: true, comments: commentsWithAuthor }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

/**
 * 消息服务
 */
export const MessageService = {
  /**
   * 发送消息
   */
  async sendMessage(messageData) {
    try {
      // 生成对话ID
      const conversationId = this.generateConversationId(messageData.senderId, messageData.receiverId)
      
      const message = MessageModel.create({
        ...messageData,
        conversationId
      })

      return { success: true, message }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 获取对话消息
   */
  async getConversationMessages(userId1, userId2) {
    try {
      const conversationId = this.generateConversationId(userId1, userId2)
      const messages = MessageModel.findByConversationId(conversationId)
      
      return { success: true, messages }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 标记消息为已读
   */
  async markAsRead(conversationId, userId) {
    try {
      MessageModel.markConversationAsRead(conversationId, userId)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(userId) {
    try {
      const count = MessageModel.getUnreadCount(userId)
      return { success: true, count }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 生成对话ID
   */
  generateConversationId(userId1, userId2) {
    return [userId1, userId2].sort().join('_')
  }
}

/**
 * 数据备份服务
 */
export const BackupService = {
  /**
   * 导出所有数据
   */
  async exportData() {
    try {
      const data = localDB.export()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 导入数据
   */
  async importData(data) {
    try {
      localDB.import(data)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 清空所有数据
   */
  async clearAllData() {
    try {
      localDB.clear()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * 获取数据统计
   */
  async getDataStats() {
    try {
      const stats = localDB.getStats()
      return { success: true, stats }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

export default {
  UserService,
  CircleService,
  PostService,
  CommentService,
  MessageService,
  BackupService
}
