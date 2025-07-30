/**
 * 事件分类数据结构工具函数
 * 
 * 提供事件分类相关的常用操作函数
 * 
 * @version 1.0.0
 * @author 开发团队
 */

// 引入类型定义
import {
  EventCategory,
  Member,
  MemberRole,
  MemberStatus,
  ValidationResult,
  PermissionCheckResult,
  EventCategoryStats,
  UserId,
  EventCategoryId
} from './event-category-types'

/**
 * 验证事件分类数据结构
 * @param category 事件分类数据
 * @returns 验证结果
 */
export function validateEventCategory(category: EventCategory): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 基本字段验证
  if (!category.id || typeof category.id !== 'string') {
    errors.push('事件分类ID不能为空且必须是字符串')
  }

  if (!category.name || typeof category.name !== 'string') {
    errors.push('事件分类名称不能为空且必须是字符串')
  }

  if (!category.icon || typeof category.icon !== 'string') {
    errors.push('事件分类图标不能为空且必须是字符串')
  }

  if (!category.color || typeof category.color !== 'string') {
    errors.push('事件分类颜色不能为空且必须是字符串')
  }

  // 时间验证
  if (!category.startTime || !category.endTime) {
    errors.push('开始时间和结束时间不能为空')
  } else {
    const startTime = new Date(category.startTime)
    const endTime = new Date(category.endTime)
    
    if (startTime >= endTime) {
      errors.push('开始时间必须早于结束时间')
    }
  }

  // 地域验证
  if (!category.region || !category.region.country || !category.region.city) {
    errors.push('地域信息必须包含国家和城市')
  }

  // 群组验证
  if (!category.group || !category.group.id || !category.group.name) {
    errors.push('群组信息必须包含ID和名称')
  }

  // 成员验证
  if (!category.members || !Array.isArray(category.members)) {
    errors.push('成员列表必须是数组')
  } else {
    const ownerCount = category.members.filter(m => m.role === 'owner').length
    if (ownerCount !== 1) {
      errors.push('每个事件分类必须有且仅有一个所有者')
    }

    if (category.settings.maxMembers > 0 && category.members.length > category.settings.maxMembers) {
      warnings.push(`成员数量(${category.members.length})超过最大限制(${category.settings.maxMembers})`)
    }
  }

  // 设置验证
  if (!category.settings) {
    errors.push('设置信息不能为空')
  } else {
    if (category.settings.defaultEventDuration <= 0) {
      warnings.push('默认事件持续时间应该大于0')
    }

    if (category.settings.reminderSettings.advanceTime < 0) {
      warnings.push('提醒提前时间不能为负数')
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * 检查用户对事件分类的权限
 * @param userId 用户ID
 * @param category 事件分类
 * @param action 操作类型
 * @returns 权限检查结果
 */
export function checkMemberPermission(
  userId: UserId,
  category: EventCategory,
  action: string
): PermissionCheckResult {
  const member = category.members.find(m => m.id === userId)

  if (!member) {
    return {
      hasPermission: false,
      reason: '用户不是该事件分类的成员'
    }
  }

  if (member.status !== 'active') {
    return {
      hasPermission: false,
      reason: '用户状态不是活跃状态'
    }
  }

  // 根据操作类型检查权限
  switch (action) {
    case 'view':
      return { hasPermission: true }
    
    case 'createEvent':
      return {
        hasPermission: member.permissions.canCreateEvent,
        reason: member.permissions.canCreateEvent ? undefined : '用户没有创建事件的权限'
      }
    
    case 'editEvent':
      return {
        hasPermission: member.permissions.canEditEvent,
        reason: member.permissions.canEditEvent ? undefined : '用户没有编辑事件的权限'
      }
    
    case 'deleteEvent':
      return {
        hasPermission: member.permissions.canDeleteEvent,
        reason: member.permissions.canDeleteEvent ? undefined : '用户没有删除事件的权限'
      }
    
    case 'inviteMembers':
      return {
        hasPermission: member.permissions.canInviteMembers,
        reason: member.permissions.canInviteMembers ? undefined : '用户没有邀请成员的权限'
      }
    
    case 'editCategory':
      return {
        hasPermission: member.role === 'owner' || member.role === 'admin',
        reason: member.role === 'owner' || member.role === 'admin' ? undefined : '只有所有者和管理员可以编辑分类',
        requiredRole: 'admin'
      }
    
    case 'deleteCategory':
      return {
        hasPermission: member.role === 'owner',
        reason: member.role === 'owner' ? undefined : '只有所有者可以删除分类',
        requiredRole: 'owner'
      }
    
    default:
      return {
        hasPermission: false,
        reason: '未知的操作类型'
      }
  }
}

/**
 * 格式化事件分类显示
 * @param category 事件分类
 * @returns 格式化后的显示字符串
 */
export function formatEventCategoryForDisplay(category: EventCategory): string {
  const startTime = new Date(category.startTime).toLocaleString()
  const endTime = new Date(category.endTime).toLocaleString()
  const memberCount = category.members.length
  const region = `${category.region.city}, ${category.region.country}`
  
  return `${category.icon} ${category.name} (${memberCount}人) - ${region} | ${startTime} - ${endTime}`
}

/**
 * 根据角色获取成员列表
 * @param category 事件分类
 * @param role 成员角色
 * @returns 指定角色的成员列表
 */
export function getMembersByRole(category: EventCategory, role: MemberRole): Member[] {
  return category.members.filter(member => member.role === role)
}

/**
 * 检查用户是否是事件分类的成员
 * @param userId 用户ID
 * @param category 事件分类
 * @returns 是否是成员
 */
export function isUserMemberOfCategory(userId: UserId, category: EventCategory): boolean {
  return category.members.some(member => member.id === userId)
}

/**
 * 检查用户是否可以访问事件分类
 * @param userId 用户ID
 * @param category 事件分类
 * @returns 是否可以访问
 */
export function canUserAccessCategory(userId: UserId, category: EventCategory): boolean {
  // 如果是公开分类，所有人都可以访问
  if (category.settings.isPublic) {
    return true
  }

  // 如果是私有分类，只有成员可以访问
  return isUserMemberOfCategory(userId, category)
}

/**
 * 获取事件分类统计信息
 * @param categories 事件分类列表
 * @returns 统计信息
 */
export function getEventCategoryStats(categories: EventCategory[]): EventCategoryStats {
  const stats: EventCategoryStats = {
    totalCategories: categories.length,
    activeCategories: 0,
    publicCategories: 0,
    totalMembers: 0,
    categoriesByRegion: {},
    categoriesByGroup: {}
  }

  categories.forEach(category => {
    // 活跃分类统计
    if (category.settings.isActive) {
      stats.activeCategories++
    }

    // 公开分类统计
    if (category.settings.isPublic) {
      stats.publicCategories++
    }

    // 成员总数统计
    stats.totalMembers += category.members.length

    // 地域分类统计
    const region = category.region.city
    stats.categoriesByRegion[region] = (stats.categoriesByRegion[region] || 0) + 1

    // 群组分类统计
    const groupType = category.group.type
    stats.categoriesByGroup[groupType] = (stats.categoriesByGroup[groupType] || 0) + 1
  })

  return stats
}

/**
 * 过滤活跃成员
 * @param members 成员列表
 * @returns 活跃成员列表
 */
export function getActiveMembers(members: Member[]): Member[] {
  return members.filter(member => member.status === 'active')
}

/**
 * 获取事件分类所有者
 * @param category 事件分类
 * @returns 所有者信息，如果没有则返回null
 */
export function getCategoryOwner(category: EventCategory): Member | null {
  return category.members.find(member => member.role === 'owner') || null
}

/**
 * 检查事件分类是否可以加入新成员
 * @param category 事件分类
 * @returns 是否可以加入
 */
export function canJoinCategory(category: EventCategory): boolean {
  // 检查是否允许加入
  if (!category.settings.allowJoin) {
    return false
  }

  // 检查是否达到最大成员数限制
  if (category.settings.maxMembers > 0 && category.members.length >= category.settings.maxMembers) {
    return false
  }

  // 检查分类是否活跃
  if (!category.settings.isActive) {
    return false
  }

  return true
}

/**
 * 生成事件分类的唯一ID
 * @param prefix 前缀
 * @returns 唯一ID
 */
export function generateCategoryId(prefix: string = 'category'): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substr(2, 9)
  return `${prefix}_${timestamp}_${randomStr}`
}

/**
 * 验证颜色值格式
 * @param color 颜色值
 * @returns 是否是有效的颜色值
 */
export function isValidColor(color: string): boolean {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexColorRegex.test(color)
}

/**
 * 获取默认的事件分类设置
 * @returns 默认设置
 */
export function getDefaultCategorySettings() {
  return {
    isActive: true,
    isPublic: false,
    allowJoin: true,
    requireApproval: true,
    maxMembers: 50,
    defaultEventDuration: 60,
    reminderSettings: {
      enabled: true,
      advanceTime: 15,
      reminderType: 'notification' as const
    }
  }
}

/**
 * 深拷贝事件分类对象
 * @param category 事件分类
 * @returns 深拷贝后的对象
 */
export function deepCloneCategory(category: EventCategory): EventCategory {
  return JSON.parse(JSON.stringify(category))
}

/**
 * 合并事件分类设置
 * @param defaultSettings 默认设置
 * @param customSettings 自定义设置
 * @returns 合并后的设置
 */
export function mergeCategorySettings(defaultSettings: any, customSettings: any): any {
  return {
    ...defaultSettings,
    ...customSettings,
    reminderSettings: {
      ...defaultSettings.reminderSettings,
      ...customSettings.reminderSettings
    }
  }
}
