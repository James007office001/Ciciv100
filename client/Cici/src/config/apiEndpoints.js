/**
 * API 端点配置
 * 定义所有API接口的端点地址
 */

const API_VERSION = '/api'

export const API_ENDPOINTS = {
  // 认证相关 - 更新为与后端一致
  AUTH: {
    LOGIN: `${API_VERSION}/auth/login`,
    REGISTER: `${API_VERSION}/auth/register`,
    LOGOUT: `${API_VERSION}/auth/logout`,
    REFRESH_TOKEN: `${API_VERSION}/auth/refresh-token`,
    VALIDATE_OFFLINE: `${API_VERSION}/auth/validate-offline`,
    ME: `${API_VERSION}/auth/me`,
    FORGOT_PASSWORD: `${API_VERSION}/auth/forgot-password`,
    RESET_PASSWORD: `${API_VERSION}/auth/reset-password`,
    VERIFY_EMAIL: `${API_VERSION}/auth/verify-email`,
    OAUTH_GOOGLE: `${API_VERSION}/auth/oauth/google`,
    OAUTH_APPLE: `${API_VERSION}/auth/oauth/apple`
  },

  // 用户相关 - 更新为与后端一致
  USER: {
    PROFILE: `${API_VERSION}/users/profile`,
    UPDATE_PROFILE: `${API_VERSION}/users/profile`, 
    FAMILY_GROUP: `${API_VERSION}/users/family-group`,
    FAMILY_GROUP_DETAIL: `${API_VERSION}/users/family-group/{groupId}`,
    FAMILY_INVITE: `${API_VERSION}/users/family-group/{groupId}/invite`,
    FAMILY_REMOVE: `${API_VERSION}/users/family-group/{groupId}/remove`,
    FAMILY_PERMISSIONS: `${API_VERSION}/users/family-group/{groupId}/permissions`,
    DEVICES: `${API_VERSION}/users/devices`,
    DEVICE_REMOVE: `${API_VERSION}/users/devices/{deviceId}`,
    UPLOAD_AVATAR: `${API_VERSION}/users/avatar`,
    SETTINGS: `${API_VERSION}/users/settings`,
    UPDATE_SETTINGS: `${API_VERSION}/users/settings`,
    CHANGE_PASSWORD: `${API_VERSION}/users/password`,
    PHONE_VERIFY: `${API_VERSION}/users/phone/verify`,
    EMAIL_VERIFY: `${API_VERSION}/users/email/verify`
  },

  // 圈子相关 - 基于圈子数据结构
  CIRCLE: {
    LIST: `${API_VERSION}/circles`,
    DETAIL: `${API_VERSION}/circles/{circleId}`,
    CREATE: `${API_VERSION}/circles`,
    UPDATE: `${API_VERSION}/circles/{circleId}`,
    DELETE: `${API_VERSION}/circles/{circleId}`,
    SEARCH: `${API_VERSION}/circles/search`,
    RECOMMENDED: `${API_VERSION}/circles/recommended`,
    BY_CATEGORY: `${API_VERSION}/circles/category/{category}`,
    JOIN: `${API_VERSION}/circles/{circleId}/join`,
    LEAVE: `${API_VERSION}/circles/{circleId}/leave`,
    MEMBERS: `${API_VERSION}/circles/{circleId}/members`,
    UPDATE_MEMBER: `${API_VERSION}/circles/{circleId}/members/{userId}`,
    REMOVE_MEMBER: `${API_VERSION}/circles/{circleId}/members/{userId}`,
    JOIN_REQUESTS: `${API_VERSION}/circles/{circleId}/requests`,
    HANDLE_REQUEST: `${API_VERSION}/circles/{circleId}/requests/{requestId}`,
    SETTINGS: `${API_VERSION}/circles/{circleId}/settings`,
    STATISTICS: `${API_VERSION}/circles/{circleId}/statistics`,
    ANNOUNCEMENTS: `${API_VERSION}/circles/{circleId}/announcements`,
    CREATE_ANNOUNCEMENT: `${API_VERSION}/circles/{circleId}/announcements`
  },

  // 圈子帖子相关
  CIRCLE_POST: {
    LIST: `${API_VERSION}/circles/{circleId}/posts`,
    CREATE: `${API_VERSION}/circles/{circleId}/posts`,
    UPDATE: `${API_VERSION}/circles/{circleId}/posts/{postId}`,
    DELETE: `${API_VERSION}/circles/{circleId}/posts/{postId}`,
    LIKE: `${API_VERSION}/circles/{circleId}/posts/{postId}/like`,
    SHARE: `${API_VERSION}/circles/{circleId}/posts/{postId}/share`
  },

  // 内容相关
  POST: {
    LIST: `${API_VERSION}/posts`,
    CREATE: `${API_VERSION}/posts`,
    DETAIL: `${API_VERSION}/posts/:id`,
    UPDATE: `${API_VERSION}/posts/:id`,
    DELETE: `${API_VERSION}/posts/:id`,
    LIKE: `${API_VERSION}/posts/:id/like`,
    UNLIKE: `${API_VERSION}/posts/:id/unlike`,
    COMMENT: `${API_VERSION}/posts/:id/comments`,
    SHARE: `${API_VERSION}/posts/:id/share`,
    REPORT: `${API_VERSION}/posts/:id/report`
  },

  // 活动相关
  ACTIVITY: {
    LIST: `${API_VERSION}/activities`,
    CREATE: `${API_VERSION}/activities`,
    DETAIL: `${API_VERSION}/activities/:id`,
    UPDATE: `${API_VERSION}/activities/:id`,
    DELETE: `${API_VERSION}/activities/:id`,
    JOIN: `${API_VERSION}/activities/:id/join`,
    LEAVE: `${API_VERSION}/activities/:id/leave`,
    PARTICIPANTS: `${API_VERSION}/activities/:id/participants`,
    NEARBY: `${API_VERSION}/activities/nearby`,
    FEATURED: `${API_VERSION}/activities/featured`
  },

  // 门票相关
  TICKET: {
    LIST: `${API_VERSION}/tickets`,
    PURCHASE: `${API_VERSION}/tickets/purchase`,
    DETAIL: `${API_VERSION}/tickets/:id`,
    CANCEL: `${API_VERSION}/tickets/:id/cancel`,
    REFUND: `${API_VERSION}/tickets/:id/refund`,
    VERIFY: `${API_VERSION}/tickets/:id/verify`
  },

  // 日历相关
  CALENDAR: {
    EVENTS: `${API_VERSION}/calendar/events`,
    CREATE_EVENT: `${API_VERSION}/calendar/events`,
    UPDATE_EVENT: `${API_VERSION}/calendar/events/:id`,
    DELETE_EVENT: `${API_VERSION}/calendar/events/:id`,
    SYNC: `${API_VERSION}/calendar/sync`
  },

  // TODO相关
  TODO: {
    LIST: `${API_VERSION}/todos`,
    CREATE: `${API_VERSION}/todos`,
    UPDATE: `${API_VERSION}/todos/:id`,
    DELETE: `${API_VERSION}/todos/:id`,
    COMPLETE: `${API_VERSION}/todos/:id/complete`,
    BATCH_UPDATE: `${API_VERSION}/todos/batch`
  },

  // 聊天相关
  CHAT: {
    CONVERSATIONS: `${API_VERSION}/chat/conversations`,
    MESSAGES: `${API_VERSION}/chat/conversations/:id/messages`,
    SEND_MESSAGE: `${API_VERSION}/chat/conversations/:id/messages`,
    CREATE_GROUP: `${API_VERSION}/chat/groups`,
    JOIN_GROUP: `${API_VERSION}/chat/groups/:id/join`,
    LEAVE_GROUP: `${API_VERSION}/chat/groups/:id/leave`,
    UPLOAD_FILE: `${API_VERSION}/chat/upload`
  },

  // 支付相关
  PAYMENT: {
    CREATE_ORDER: `${API_VERSION}/payment/orders`,
    CONFIRM_PAYMENT: `${API_VERSION}/payment/confirm`,
    REFUND: `${API_VERSION}/payment/refund`,
    WEBHOOK: `${API_VERSION}/payment/webhook`,
    METHODS: `${API_VERSION}/payment/methods`
  },

  // 文件上传
  UPLOAD: {
    IMAGE: `${API_VERSION}/upload/image`,
    VIDEO: `${API_VERSION}/upload/video`,
    AUDIO: `${API_VERSION}/upload/audio`,
    DOCUMENT: `${API_VERSION}/upload/document`
  },

  // 推荐系统
  RECOMMENDATION: {
    POSTS: `${API_VERSION}/recommendations/posts`,
    USERS: `${API_VERSION}/recommendations/users`,
    ACTIVITIES: `${API_VERSION}/recommendations/activities`,
    UPDATE_PREFERENCES: `${API_VERSION}/recommendations/preferences`
  },

  // 通知相关
  NOTIFICATION: {
    LIST: `${API_VERSION}/notifications`,
    MARK_READ: `${API_VERSION}/notifications/:id/read`,
    MARK_ALL_READ: `${API_VERSION}/notifications/read-all`,
    SETTINGS: `${API_VERSION}/notifications/settings`,
    SUBSCRIBE: `${API_VERSION}/notifications/subscribe`,
    UNSUBSCRIBE: `${API_VERSION}/notifications/unsubscribe`
  },

  // 搜索相关
  SEARCH: {
    GLOBAL: `${API_VERSION}/search`,
    POSTS: `${API_VERSION}/search/posts`,
    ACTIVITIES: `${API_VERSION}/search/activities`,
    USERS: `${API_VERSION}/search/users`,
    SUGGESTIONS: `${API_VERSION}/search/suggestions`,
    TRENDING: `${API_VERSION}/search/trending`
  },

  // 管理后台
  ADMIN: {
    DASHBOARD: `${API_VERSION}/admin/dashboard`,
    USERS: `${API_VERSION}/admin/users`,
    POSTS: `${API_VERSION}/admin/posts`,
    ACTIVITIES: `${API_VERSION}/admin/activities`,
    ORDERS: `${API_VERSION}/admin/orders`,
    REPORTS: `${API_VERSION}/admin/reports`,
    ANALYTICS: `${API_VERSION}/admin/analytics`,
    MODERATE_CONTENT: `${API_VERSION}/admin/moderate`,
    SYSTEM_SETTINGS: `${API_VERSION}/admin/settings`
  }
}

export default API_ENDPOINTS
