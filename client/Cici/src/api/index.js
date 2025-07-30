/**
 * API接口管理
 * 统一管理所有API接口调用
 * 基于新的用户数据结构
 */

import request from '../utils/request.js'
import { API_ENDPOINTS } from '../../../../shared/config/apiEndpoints.js'

/**
 * 认证相关API
 */
export const authApi = {
  /**
   * 用户登录
   * @param {Object} data - 登录数据
   * @param {string} data.phone - 手机号
   * @param {string} data.password - 密码
   * @returns {Promise} 登录结果
   */
  login(data) {
    return request.post(API_ENDPOINTS.AUTH.LOGIN, data)
  },

  /**
   * 用户注册
   * @param {Object} data - 注册数据
   * @param {string} data.phone - 手机号
   * @param {string} data.password - 密码
   * @param {string} data.code - 验证码
   * @returns {Promise} 注册结果
   */
  register(data) {
    return request.post(API_ENDPOINTS.AUTH.REGISTER, data)
  },

  /**
   * 退出登录
   * @returns {Promise} 退出结果
   */
  logout() {
    return request.post(API_ENDPOINTS.AUTH.LOGOUT)
  },

  /**
   * 刷新token
   * @returns {Promise} 刷新结果
   */
  refreshToken() {
    return request.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN)
  },

  /**
   * 第三方登录
   * @param {Object} data - 第三方登录数据
   * @param {string} data.provider - 登录提供商
   * @param {string} data.code - 授权码
   * @returns {Promise} 登录结果
   */
  socialLogin(data) {
    return request.post(API_ENDPOINTS.AUTH.SOCIAL_LOGIN, data)
  },

  /**
   * 忘记密码
   * @param {Object} data - 重置密码数据
   * @param {string} data.phone - 手机号
   * @returns {Promise} 重置结果
   */
  forgotPassword(data) {
    return request.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data)
  },

  /**
   * 重置密码
   * @param {Object} data - 重置密码数据
   * @param {string} data.phone - 手机号
   * @param {string} data.code - 验证码
   * @param {string} data.password - 新密码
   * @returns {Promise} 重置结果
   */
  resetPassword(data) {
    return request.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data)
  }
}

/**
 * 用户相关API
 */
export const userApi = {
  /**
   * 获取用户信息
   * @returns {Promise} 用户信息
   */
  getProfile() {
    const endpoint = API_ENDPOINTS.USER.PROFILE.replace('{userId}', 'me')
    return request.get(endpoint)
  },

  /**
   * 更新用户信息
   * @param {Object} data - 用户信息
   * @returns {Promise} 更新结果
   */
  updateProfile(data) {
    const endpoint = API_ENDPOINTS.USER.UPDATE_PROFILE.replace('{userId}', 'me')
    return request.put(endpoint, data)
  },

  /**
   * 上传头像
   * @param {string} filePath - 文件路径
   * @returns {Promise} 上传结果
   */
  uploadAvatar(filePath) {
    const endpoint = API_ENDPOINTS.USER.UPLOAD_AVATAR.replace('{userId}', 'me')
    return request.upload(endpoint, filePath)
  },

  /**
   * 获取用户设置
   * @returns {Promise} 用户设置
   */
  getSettings() {
    const endpoint = API_ENDPOINTS.USER.SETTINGS.replace('{userId}', 'me')
    return request.get(endpoint)
  },

  /**
   * 更新用户设置
   * @param {Object} settings - 设置数据
   * @returns {Promise} 更新结果
   */
  updateSettings(settings) {
    const endpoint = API_ENDPOINTS.USER.UPDATE_SETTINGS.replace('{userId}', 'me')
    return request.put(endpoint, settings)
  },

  /**
   * 关注用户
   * @param {string} userId - 用户ID
   * @returns {Promise} 关注结果
   */
  followUser(userId) {
    return request.post(API_ENDPOINTS.USER.FOLLOW, { userId })
  },

  /**
   * 取消关注
   * @param {string} userId - 用户ID
   * @returns {Promise} 取消关注结果
   */
  unfollowUser(userId) {
    return request.post(API_ENDPOINTS.USER.UNFOLLOW, { userId })
  },

  /**
   * 获取关注列表
   * @param {Object} params - 查询参数
   * @returns {Promise} 关注列表
   */
  getFollowing(params = {}) {
    return request.get(API_ENDPOINTS.USER.FOLLOWING, params)
  },

  /**
   * 获取粉丝列表
   * @param {Object} params - 查询参数
   * @returns {Promise} 粉丝列表
   */
  getFollowers(params = {}) {
    return request.get(API_ENDPOINTS.USER.FOLLOWERS, params)
  },

  /**
   * 搜索用户
   * @param {Object} params - 搜索参数
   * @param {string} params.keyword - 搜索关键词
   * @returns {Promise} 搜索结果
   */
  searchUsers(params) {
    return request.get(API_ENDPOINTS.USER.SEARCH, params)
  }
}

/**
 * 内容相关API
 */
export const postApi = {
  /**
   * 获取帖子列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @param {string} params.type - 帖子类型
   * @returns {Promise} 帖子列表
   */
  getPostList(params = {}) {
    return request.get(API_ENDPOINTS.POST.LIST, params)
  },

  /**
   * 获取帖子详情
   * @param {string} postId - 帖子ID
   * @returns {Promise} 帖子详情
   */
  getPostDetail(postId) {
    return request.get(API_ENDPOINTS.POST.DETAIL.replace(':id', postId))
  },

  /**
   * 创建帖子
   * @param {Object} data - 帖子数据
   * @param {string} data.title - 帖子标题
   * @param {string} data.description - 帖子内容
   * @param {Array} data.images - 图片列表
   * @param {Array} data.tags - 标签列表
   * @param {string} data.location - 位置信息
   * @param {Object} data.author - 作者信息
   * @param {Object} data.event - 事件信息（可选）
   * @param {Object} data.ticket - 门票信息（可选）
   * @returns {Promise} 创建结果
   */
  createPost(data) {
    // 确保数据结构符合标准格式
    const postData = {
      title: data.title,
      description: data.description,
      images: data.images || [],
      tags: data.tags || [],
      location: data.location || '',
      author: data.author,
      event: data.event || null,
      ticket: data.ticket || null,
      createTime: new Date().toISOString()
    }
    return request.post(API_ENDPOINTS.POST.CREATE, postData)
  },

  /**
   * 更新帖子
   * @param {string} postId - 帖子ID
   * @param {Object} data - 更新数据
   * @param {string} data.title - 帖子标题
   * @param {string} data.description - 帖子内容
   * @param {Array} data.images - 图片列表
   * @param {Array} data.tags - 标签列表
   * @param {string} data.location - 位置信息
   * @returns {Promise} 更新结果
   */
  updatePost(postId, data) {
    const updateData = {
      title: data.title,
      description: data.description,
      images: data.images,
      tags: data.tags,
      location: data.location
    }
    return request.put(API_ENDPOINTS.POST.UPDATE.replace(':id', postId), updateData)
  },

  /**
   * 删除帖子
   * @param {string} postId - 帖子ID
   * @returns {Promise} 删除结果
   */
  deletePost(postId) {
    return request.delete(API_ENDPOINTS.POST.DELETE.replace(':id', postId))
  },

  /**
   * 点赞帖子
   * @param {string} postId - 帖子ID
   * @returns {Promise} 点赞结果
   */
  likePost(postId) {
    return request.post(API_ENDPOINTS.POST.LIKE.replace(':id', postId))
  },

  /**
   * 取消点赞
   * @param {string} postId - 帖子ID
   * @returns {Promise} 取消点赞结果
   */
  unlikePost(postId) {
    return request.post(API_ENDPOINTS.POST.UNLIKE.replace(':id', postId))
  },

  /**
   * 获取帖子评论
   * @param {string} postId - 帖子ID
   * @param {Object} params - 查询参数
   * @returns {Promise} 评论列表
   */
  getComments(postId, params = {}) {
    return request.get(API_ENDPOINTS.POST.COMMENT.replace(':id', postId), params)
  },

  /**
   * 添加评论
   * @param {string} postId - 帖子ID
   * @param {Object} data - 评论数据
   * @param {string} data.content - 评论内容
   * @param {string} data.parentId - 父评论ID
   * @returns {Promise} 评论结果
   */
  addComment(postId, data) {
    return request.post(API_ENDPOINTS.POST.COMMENT.replace(':id', postId), data)
  },

  /**
   * 分享帖子
   * @param {string} postId - 帖子ID
   * @param {Object} data - 分享数据
   * @returns {Promise} 分享结果
   */
  sharePost(postId, data = {}) {
    return request.post(API_ENDPOINTS.POST.SHARE.replace(':id', postId), data)
  },

  /**
   * 举报帖子
   * @param {string} postId - 帖子ID
   * @param {Object} data - 举报数据
   * @param {string} data.reason - 举报原因
   * @returns {Promise} 举报结果
   */
  reportPost(postId, data) {
    return request.post(API_ENDPOINTS.POST.REPORT.replace(':id', postId), data)
  }
}

/**
 * 活动相关API
 */
export const activityApi = {
  /**
   * 获取活动列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @param {string} params.category - 活动分类
   * @param {string} params.location - 位置
   * @returns {Promise} 活动列表
   */
  getActivityList(params = {}) {
    return request.get(API_ENDPOINTS.ACTIVITY.LIST, params)
  },

  /**
   * 获取活动详情
   * @param {string} activityId - 活动ID
   * @returns {Promise} 活动详情
   */
  getActivityDetail(activityId) {
    return request.get(API_ENDPOINTS.ACTIVITY.DETAIL.replace(':id', activityId))
  },

  /**
   * 创建活动
   * @param {Object} data - 活动数据
   * @param {string} data.title - 活动标题
   * @param {string} data.description - 活动描述
   * @param {string} data.startTime - 开始时间
   * @param {string} data.endTime - 结束时间
   * @param {string} data.location - 活动地点
   * @returns {Promise} 创建结果
   */
  createActivity(data) {
    return request.post(API_ENDPOINTS.ACTIVITY.CREATE, data)
  },

  /**
   * 更新活动
   * @param {string} activityId - 活动ID
   * @param {Object} data - 更新数据
   * @returns {Promise} 更新结果
   */
  updateActivity(activityId, data) {
    return request.put(API_ENDPOINTS.ACTIVITY.UPDATE.replace(':id', activityId), data)
  },

  /**
   * 删除活动
   * @param {string} activityId - 活动ID
   * @returns {Promise} 删除结果
   */
  deleteActivity(activityId) {
    return request.delete(API_ENDPOINTS.ACTIVITY.DELETE.replace(':id', activityId))
  },

  /**
   * 参加活动
   * @param {string} activityId - 活动ID
   * @returns {Promise} 参加结果
   */
  joinActivity(activityId) {
    return request.post(API_ENDPOINTS.ACTIVITY.JOIN.replace(':id', activityId))
  },

  /**
   * 退出活动
   * @param {string} activityId - 活动ID
   * @returns {Promise} 退出结果
   */
  leaveActivity(activityId) {
    return request.post(API_ENDPOINTS.ACTIVITY.LEAVE.replace(':id', activityId))
  },

  /**
   * 获取活动参与者
   * @param {string} activityId - 活动ID
   * @param {Object} params - 查询参数
   * @returns {Promise} 参与者列表
   */
  getParticipants(activityId, params = {}) {
    return request.get(API_ENDPOINTS.ACTIVITY.PARTICIPANTS.replace(':id', activityId), params)
  },

  /**
   * 获取附近活动
   * @param {Object} params - 查询参数
   * @param {number} params.latitude - 纬度
   * @param {number} params.longitude - 经度
   * @param {number} params.radius - 搜索半径(km)
   * @returns {Promise} 附近活动列表
   */
  getNearbyActivities(params) {
    return request.get(API_ENDPOINTS.ACTIVITY.NEARBY, params)
  },

  /**
   * 获取推荐活动
   * @param {Object} params - 查询参数
   * @returns {Promise} 推荐活动列表
   */
  getFeaturedActivities(params = {}) {
    return request.get(API_ENDPOINTS.ACTIVITY.FEATURED, params)
  }
}

/**
 * 门票相关API
 */
export const ticketApi = {
  /**
   * 获取门票列表
   * @param {Object} params - 查询参数
   * @returns {Promise} 门票列表
   */
  getTicketList(params = {}) {
    return request.get(API_ENDPOINTS.TICKET.LIST, params)
  },

  /**
   * 购买门票
   * @param {Object} data - 购买数据
   * @param {string} data.activityId - 活动ID
   * @param {string} data.ticketType - 门票类型
   * @param {number} data.quantity - 购买数量
   * @returns {Promise} 购买结果
   */
  purchaseTicket(data) {
    return request.post(API_ENDPOINTS.TICKET.PURCHASE, data)
  },

  /**
   * 获取门票详情
   * @param {string} ticketId - 门票ID
   * @returns {Promise} 门票详情
   */
  getTicketDetail(ticketId) {
    return request.get(API_ENDPOINTS.TICKET.DETAIL.replace(':id', ticketId))
  },

  /**
   * 取消门票
   * @param {string} ticketId - 门票ID
   * @returns {Promise} 取消结果
   */
  cancelTicket(ticketId) {
    return request.post(API_ENDPOINTS.TICKET.CANCEL.replace(':id', ticketId))
  },

  /**
   * 申请退款
   * @param {string} ticketId - 门票ID
   * @param {Object} data - 退款数据
   * @returns {Promise} 退款结果
   */
  refundTicket(ticketId, data = {}) {
    return request.post(API_ENDPOINTS.TICKET.REFUND.replace(':id', ticketId), data)
  },

  /**
   * 验证门票
   * @param {string} ticketId - 门票ID
   * @returns {Promise} 验证结果
   */
  verifyTicket(ticketId) {
    return request.post(API_ENDPOINTS.TICKET.VERIFY.replace(':id', ticketId))
  }
}

/**
 * 日历相关API
 */
export const calendarApi = {
  /**
   * 获取日历事件
   * @param {Object} params - 查询参数
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 事件列表
   */
  getEvents(params) {
    return request.get(API_ENDPOINTS.CALENDAR.EVENTS, params)
  },

  /**
   * 创建日历事件
   * @param {Object} data - 事件数据
   * @param {string} data.title - 事件标题
   * @param {string} data.startTime - 开始时间
   * @param {string} data.endTime - 结束时间
   * @returns {Promise} 创建结果
   */
  createEvent(data) {
    return request.post(API_ENDPOINTS.CALENDAR.CREATE_EVENT, data)
  },

  /**
   * 更新日历事件
   * @param {string} eventId - 事件ID
   * @param {Object} data - 更新数据
   * @returns {Promise} 更新结果
   */
  updateEvent(eventId, data) {
    return request.put(API_ENDPOINTS.CALENDAR.UPDATE_EVENT.replace(':id', eventId), data)
  },

  /**
   * 删除日历事件
   * @param {string} eventId - 事件ID
   * @returns {Promise} 删除结果
   */
  deleteEvent(eventId) {
    return request.delete(API_ENDPOINTS.CALENDAR.DELETE_EVENT.replace(':id', eventId))
  },

  /**
   * 同步日历
   * @returns {Promise} 同步结果
   */
  syncCalendar() {
    return request.post(API_ENDPOINTS.CALENDAR.SYNC)
  }
}

/**
 * Todo相关API
 */
export const todoApi = {
  /**
   * 获取Todo列表
   * @param {Object} params - 查询参数
   * @returns {Promise} Todo列表
   */
  getTodoList(params = {}) {
    return request.get(API_ENDPOINTS.TODO.LIST, params)
  },

  /**
   * 创建Todo
   * @param {Object} data - Todo数据
   * @param {string} data.title - 标题
   * @param {string} data.description - 描述
   * @param {string} data.dueDate - 截止日期
   * @returns {Promise} 创建结果
   */
  createTodo(data) {
    return request.post(API_ENDPOINTS.TODO.CREATE, data)
  },

  /**
   * 更新Todo
   * @param {string} todoId - Todo ID
   * @param {Object} data - 更新数据
   * @returns {Promise} 更新结果
   */
  updateTodo(todoId, data) {
    return request.put(API_ENDPOINTS.TODO.UPDATE.replace(':id', todoId), data)
  },

  /**
   * 删除Todo
   * @param {string} todoId - Todo ID
   * @returns {Promise} 删除结果
   */
  deleteTodo(todoId) {
    return request.delete(API_ENDPOINTS.TODO.DELETE.replace(':id', todoId))
  },

  /**
   * 完成Todo
   * @param {string} todoId - Todo ID
   * @returns {Promise} 完成结果
   */
  completeTodo(todoId) {
    return request.post(API_ENDPOINTS.TODO.COMPLETE.replace(':id', todoId))
  },

  /**
   * 批量更新Todo
   * @param {Array} todos - Todo列表
   * @returns {Promise} 更新结果
   */
  batchUpdateTodos(todos) {
    return request.post(API_ENDPOINTS.TODO.BATCH_UPDATE, { todos })
  }
}

/**
 * 文件上传API
 */
export const uploadApi = {
  /**
   * 上传图片
   * @param {string} filePath - 文件路径
   * @param {Object} config - 配置
   * @returns {Promise} 上传结果
   */
  uploadImage(filePath, config = {}) {
    return request.upload(API_ENDPOINTS.UPLOAD.IMAGE, filePath, {}, config)
  },

  /**
   * 上传视频
   * @param {string} filePath - 文件路径
   * @param {Object} config - 配置
   * @returns {Promise} 上传结果
   */
  uploadVideo(filePath, config = {}) {
    return request.upload(API_ENDPOINTS.UPLOAD.VIDEO, filePath, {}, config)
  },

  /**
   * 上传音频
   * @param {string} filePath - 文件路径
   * @param {Object} config - 配置
   * @returns {Promise} 上传结果
   */
  uploadAudio(filePath, config = {}) {
    return request.upload(API_ENDPOINTS.UPLOAD.AUDIO, filePath, {}, config)
  }
}

// 导出所有API
export default {
  authApi,
  userApi,
  postApi,
  activityApi,
  ticketApi,
  calendarApi,
  todoApi,
  uploadApi
}
