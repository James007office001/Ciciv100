/**
 * 事件分类数据结构 TypeScript 类型定义
 * 
 * 该文件定义了事件分类系统的完整类型结构，用于前后端TypeScript项目
 * 
 * @version 1.0.0
 * @author 开发团队
 */

// 基础类型定义
export type EventCategoryId = string
export type UserId = string
export type GroupId = string
export type ISODateString = string

// 地理坐标
export interface Coordinates {
  latitude: number
  longitude: number
}

// 地域信息
export interface Region {
  country: string
  province?: string
  city: string
  district?: string
  address?: string
  coordinates?: Coordinates
}

// 群组类型
export type GroupType = 'department' | 'project' | 'team' | 'organization' | 'personal' | 'public'

// 群组权限
export interface GroupPermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canInvite: boolean
}

// 群组信息
export interface Group {
  id: GroupId
  name: string
  type: GroupType
  permissions: GroupPermissions
}

// 成员角色
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer'

// 成员状态
export type MemberStatus = 'active' | 'inactive' | 'pending' | 'blocked'

// 成员权限
export interface MemberPermissions {
  canCreateEvent: boolean
  canEditEvent: boolean
  canDeleteEvent: boolean
  canInviteMembers: boolean
}

// 成员信息
export interface Member {
  id: UserId
  name: string
  email?: string
  phone?: string
  avatar?: string
  role: MemberRole
  status: MemberStatus
  joinDate: ISODateString
  permissions: MemberPermissions
}

// 提醒类型
export type ReminderType = 'notification' | 'email' | 'sms' | 'all'

// 提醒设置
export interface ReminderSettings {
  enabled: boolean
  advanceTime: number // 提前提醒时间（分钟）
  reminderType: ReminderType
}

// 事件分类设置
export interface EventCategorySettings {
  isActive: boolean
  isPublic: boolean
  allowJoin: boolean
  requireApproval: boolean
  maxMembers: number // -1表示无限制
  defaultEventDuration: number // 默认事件持续时间（分钟）
  reminderSettings: ReminderSettings
}

// 元数据
export interface Metadata {
  createdAt: ISODateString
  updatedAt: ISODateString
  createdBy: UserId
  updatedBy: UserId
  version: string
  tags?: string[]
  description?: string
}

// 事件分类主要数据结构
export interface EventCategory {
  id: EventCategoryId
  name: string
  icon: string
  color: string
  startTime: ISODateString
  endTime: ISODateString
  region: Region
  group: Group
  members: Member[]
  settings: EventCategorySettings
  metadata: Metadata
}

// 事件分类列表
export interface EventCategoryList {
  eventCategories: EventCategory[]
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 创建事件分类的请求参数
export interface CreateEventCategoryRequest {
  name: string
  icon: string
  color: string
  startTime: ISODateString
  endTime: ISODateString
  region: Region
  group: Group
  settings: EventCategorySettings
  tags?: string[]
  description?: string
}

// 更新事件分类的请求参数
export interface UpdateEventCategoryRequest {
  id: EventCategoryId
  name?: string
  icon?: string
  color?: string
  startTime?: ISODateString
  endTime?: ISODateString
  region?: Region
  group?: Group
  settings?: EventCategorySettings
  tags?: string[]
  description?: string
}

// 查询事件分类的参数
export interface QueryEventCategoryParams {
  groupId?: GroupId
  region?: string
  isActive?: boolean
  isPublic?: boolean
  createdBy?: UserId
  tags?: string[]
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 事件分类统计信息
export interface EventCategoryStats {
  totalCategories: number
  activeCategories: number
  publicCategories: number
  totalMembers: number
  categoriesByRegion: Record<string, number>
  categoriesByGroup: Record<string, number>
}

// 成员操作类型
export type MemberAction = 'add' | 'remove' | 'update' | 'invite'

// 成员操作请求
export interface MemberActionRequest {
  categoryId: EventCategoryId
  action: MemberAction
  memberId: UserId
  memberData?: Partial<Member>
}

// 权限检查结果
export interface PermissionCheckResult {
  hasPermission: boolean
  reason?: string
  requiredRole?: MemberRole
  requiredPermissions?: string[]
}

// 验证结果
export interface ValidationResult {
  isValid: boolean
  errors?: string[]
  warnings?: string[]
}

// 工具函数类型
export type EventCategoryValidator = (category: EventCategory) => ValidationResult
export type PermissionChecker = (userId: UserId, categoryId: EventCategoryId, action: string) => PermissionCheckResult

// 常量定义
export const DEFAULT_EVENT_DURATION = 60 // 默认事件持续时间（分钟）
export const DEFAULT_REMINDER_ADVANCE_TIME = 15 // 默认提前提醒时间（分钟）
export const MAX_MEMBERS_UNLIMITED = -1 // 无限制成员数量的标识
export const SUPPORTED_REMINDER_TYPES: ReminderType[] = ['notification', 'email', 'sms', 'all']
export const SUPPORTED_GROUP_TYPES: GroupType[] = ['department', 'project', 'team', 'organization', 'personal', 'public']
export const SUPPORTED_MEMBER_ROLES: MemberRole[] = ['owner', 'admin', 'member', 'viewer']
export const SUPPORTED_MEMBER_STATUS: MemberStatus[] = ['active', 'inactive', 'pending', 'blocked']

// 工具函数声明
export declare function validateEventCategory(category: EventCategory): ValidationResult
export declare function checkMemberPermission(userId: UserId, categoryId: EventCategoryId, action: string): PermissionCheckResult
export declare function formatEventCategoryForDisplay(category: EventCategory): string
export declare function getMembersByRole(category: EventCategory, role: MemberRole): Member[]
export declare function isUserMemberOfCategory(userId: UserId, category: EventCategory): boolean
export declare function canUserAccessCategory(userId: UserId, category: EventCategory): boolean
