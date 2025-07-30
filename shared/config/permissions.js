/**
 * 权限配置管理
 * 定义各种用户角色的权限矩阵
 */

import { USER_ROLES, PERMISSIONS } from './constants.js'

// 角色权限映射
export const ROLE_PERMISSIONS = {
  [USER_ROLES.USER]: [
    // 基础用户权限
    PERMISSIONS.USER.MANAGE_PROFILE,
    PERMISSIONS.CONTENT.CREATE_POST,
    PERMISSIONS.ORDER.CREATE_ORDER
  ],

  [USER_ROLES.BLOGGER]: [
    // 继承普通用户权限
    ...ROLE_PERMISSIONS[USER_ROLES.USER],
    // 博主专有权限
    PERMISSIONS.CONTENT.CREATE_ACTIVITY
  ],

  [USER_ROLES.ADMIN]: [
    // 管理员拥有所有权限
    ...Object.values(PERMISSIONS.CONTENT),
    ...Object.values(PERMISSIONS.USER),
    ...Object.values(PERMISSIONS.ORDER)
  ]
}

/**
 * 检查用户是否拥有特定权限
 * @param {string} userRole - 用户角色
 * @param {string} permission - 要检查的权限
 * @returns {boolean} 是否拥有权限
 */
export function hasPermission(userRole, permission) {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(permission)
}

/**
 * 获取用户角色的所有权限
 * @param {string} userRole - 用户角色
 * @returns {string[]} 权限列表
 */
export function getRolePermissions(userRole) {
  return ROLE_PERMISSIONS[userRole] || []
}

/**
 * 检查用户是否可以访问特定功能
 * @param {string} userRole - 用户角色
 * @param {string[]} requiredPermissions - 需要的权限列表
 * @returns {boolean} 是否可以访问
 */
export function canAccess(userRole, requiredPermissions) {
  const userPermissions = getRolePermissions(userRole)
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  )
}

export default {
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions,
  canAccess
}
