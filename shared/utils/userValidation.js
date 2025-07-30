/**
 * 用户数据验证工具
 * 基于用户数据结构的验证规则
 */

// 引入用户配置结构
import userProfileStructure from '../datastructure/user-profile-structure.json'

/**
 * 获取验证规则
 */
const getValidationRules = () => userProfileStructure.validationRules

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {Object} 验证结果
 */
export function validateEmail(email) {
  const rules = getValidationRules()
  const regex = new RegExp(rules.email.pattern)
  
  return {
    isValid: regex.test(email),
    message: rules.email.message
  }
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {Object} 验证结果
 */
export function validatePhone(phone) {
  const rules = getValidationRules()
  const regex = new RegExp(rules.phone.pattern)
  
  return {
    isValid: regex.test(phone),
    message: rules.phone.message
  }
}

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {Object} 验证结果
 */
export function validateUsername(username) {
  const rules = getValidationRules()
  const regex = new RegExp(rules.username.pattern)
  
  return {
    isValid: regex.test(username),
    message: rules.username.message
  }
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} 验证结果
 */
export function validatePassword(password) {
  const rules = getValidationRules()
  const regex = new RegExp(rules.password.pattern)
  
  return {
    isValid: regex.test(password),
    message: rules.password.message
  }
}

/**
 * 验证显示名称
 * @param {string} displayName - 显示名称
 * @returns {Object} 验证结果
 */
export function validateDisplayName(displayName) {
  const rules = getValidationRules()
  const maxLength = rules.maxLengths.displayName
  
  if (!displayName || displayName.trim().length === 0) {
    return {
      isValid: false,
      message: '显示名称不能为空'
    }
  }
  
  if (displayName.length > maxLength) {
    return {
      isValid: false,
      message: `显示名称不能超过${maxLength}个字符`
    }
  }
  
  return {
    isValid: true,
    message: ''
  }
}

/**
 * 验证个人简介
 * @param {string} bio - 个人简介
 * @returns {Object} 验证结果
 */
export function validateBio(bio) {
  const rules = getValidationRules()
  const maxLength = rules.maxLengths.bio
  
  if (bio && bio.length > maxLength) {
    return {
      isValid: false,
      message: `个人简介不能超过${maxLength}个字符`
    }
  }
  
  return {
    isValid: true,
    message: ''
  }
}

/**
 * 验证位置信息
 * @param {string} location - 位置信息
 * @returns {Object} 验证结果
 */
export function validateLocation(location) {
  const rules = getValidationRules()
  const maxLength = rules.maxLengths.location
  
  if (location && location.length > maxLength) {
    return {
      isValid: false,
      message: `位置信息不能超过${maxLength}个字符`
    }
  }
  
  return {
    isValid: true,
    message: ''
  }
}

/**
 * 验证用户完整数据
 * @param {Object} userData - 用户数据
 * @returns {Object} 验证结果
 */
export function validateUserData(userData) {
  const errors = []
  
  // 验证必填字段
  if (!userData.username) {
    errors.push('用户名不能为空')
  } else {
    const usernameResult = validateUsername(userData.username)
    if (!usernameResult.isValid) {
      errors.push(usernameResult.message)
    }
  }
  
  if (!userData.displayName) {
    errors.push('显示名称不能为空')
  } else {
    const displayNameResult = validateDisplayName(userData.displayName)
    if (!displayNameResult.isValid) {
      errors.push(displayNameResult.message)
    }
  }
  
  if (!userData.phone) {
    errors.push('手机号不能为空')
  } else {
    const phoneResult = validatePhone(userData.phone)
    if (!phoneResult.isValid) {
      errors.push(phoneResult.message)
    }
  }
  
  // 验证可选字段
  if (userData.email) {
    const emailResult = validateEmail(userData.email)
    if (!emailResult.isValid) {
      errors.push(emailResult.message)
    }
  }
  
  if (userData.bio) {
    const bioResult = validateBio(userData.bio)
    if (!bioResult.isValid) {
      errors.push(bioResult.message)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 验证用户设置数据
 * @param {Object} settings - 设置数据
 * @returns {Object} 验证结果
 */
export function validateUserSettings(settings) {
  const errors = []
  
  // 这里可以添加设置验证逻辑
  // 目前大多数设置是布尔值或枚举，不需要复杂验证
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 导出所有验证函数
export default {
  validateEmail,
  validatePhone,
  validateUsername,
  validatePassword,
  validateDisplayName,
  validateBio,
  validateLocation,
  validateUserData,
  validateUserSettings
}
