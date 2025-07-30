/**
 * 共享验证工具函数
 * 前后端通用的数据验证逻辑
 */

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式（中国大陆）
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
export function validatePhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {object} 验证结果
 */
export function validatePassword(password) {
  const result = {
    isValid: false,
    score: 0,
    requirements: {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  }

  // 计算密码强度分数
  Object.values(result.requirements).forEach(met => {
    if (met) result.score += 1
  })

  // 至少满足3个条件且长度够长才认为有效
  result.isValid = result.score >= 3 && result.requirements.length

  return result
}

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {boolean} 是否有效
 */
export function validateUsername(username) {
  // 用户名：3-20字符，只能包含字母、数字、下划线
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * 验证昵称格式
 * @param {string} nickname - 昵称
 * @returns {boolean} 是否有效
 */
export function validateNickname(nickname) {
  // 昵称：1-30字符，不能只有空格
  return nickname && nickname.trim().length >= 1 && nickname.length <= 30
}

/**
 * 验证内容长度
 * @param {string} content - 内容
 * @param {number} maxLength - 最大长度
 * @returns {boolean} 是否有效
 */
export function validateContentLength(content, maxLength = 500) {
  return content && content.trim().length > 0 && content.length <= maxLength
}

/**
 * 验证活动标题
 * @param {string} title - 活动标题
 * @returns {boolean} 是否有效
 */
export function validateActivityTitle(title) {
  return validateContentLength(title, 100)
}

/**
 * 验证价格格式
 * @param {number|string} price - 价格
 * @returns {boolean} 是否有效
 */
export function validatePrice(price) {
  const numPrice = parseFloat(price)
  return !isNaN(numPrice) && numPrice >= 0 && numPrice <= 99999.99
}

/**
 * 验证日期格式
 * @param {string|Date} date - 日期
 * @returns {boolean} 是否有效
 */
export function validateDate(date) {
  const parsedDate = new Date(date)
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime())
}

/**
 * 验证未来日期
 * @param {string|Date} date - 日期
 * @returns {boolean} 是否是未来日期
 */
export function validateFutureDate(date) {
  if (!validateDate(date)) return false
  const parsedDate = new Date(date)
  return parsedDate > new Date()
}

/**
 * 验证文件大小
 * @param {number} size - 文件大小（字节）
 * @param {number} maxSize - 最大大小（字节）
 * @returns {boolean} 是否有效
 */
export function validateFileSize(size, maxSize = 10 * 1024 * 1024) { // 默认10MB
  return size > 0 && size <= maxSize
}

/**
 * 验证文件类型
 * @param {string} fileName - 文件名
 * @param {string[]} allowedTypes - 允许的文件类型
 * @returns {boolean} 是否有效
 */
export function validateFileType(fileName, allowedTypes = []) {
  if (!fileName || allowedTypes.length === 0) return false
  
  const extension = fileName.toLowerCase().split('.').pop()
  return allowedTypes.includes(extension)
}

/**
 * 验证图片文件
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否是有效图片
 */
export function validateImageFile(fileName) {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  return validateFileType(fileName, imageTypes)
}

/**
 * 验证视频文件
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否是有效视频
 */
export function validateVideoFile(fileName) {
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
  return validateFileType(fileName, videoTypes)
}

/**
 * 验证音频文件
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否是有效音频
 */
export function validateAudioFile(fileName) {
  const audioTypes = ['mp3', 'wav', 'aac', 'ogg', 'flac']
  return validateFileType(fileName, audioTypes)
}

/**
 * 验证URL格式
 * @param {string} url - URL
 * @returns {boolean} 是否有效
 */
export function validateURL(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证经纬度
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @returns {boolean} 是否有效
 */
export function validateCoordinates(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  )
}

/**
 * 清理和验证输入文本
 * @param {string} text - 输入文本
 * @param {number} maxLength - 最大长度
 * @returns {string} 清理后的文本
 */
export function sanitizeText(text, maxLength = 1000) {
  if (!text || typeof text !== 'string') return ''
  
  // 移除多余空格和换行
  const cleaned = text
    .replace(/\s+/g, ' ') // 多个空格替换为单个
    .replace(/\n{3,}/g, '\n\n') // 多个换行替换为双换行
    .trim()
  
  // 截断长度
  return cleaned.length > maxLength 
    ? cleaned.substring(0, maxLength).trim() 
    : cleaned
}

/**
 * 批量验证对象属性
 * @param {object} data - 要验证的数据
 * @param {object} rules - 验证规则
 * @returns {object} 验证结果
 */
export function validateObject(data, rules) {
  const errors = {}
  let isValid = true

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} 是必填项`
      isValid = false
      continue
    }

    if (value !== undefined && value !== null && value !== '') {
      if (rule.validator && !rule.validator(value)) {
        errors[field] = rule.message || `${field} 格式不正确`
        isValid = false
      }
    }
  }

  return { isValid, errors }
}

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateUsername,
  validateNickname,
  validateContentLength,
  validateActivityTitle,
  validatePrice,
  validateDate,
  validateFutureDate,
  validateFileSize,
  validateFileType,
  validateImageFile,
  validateVideoFile,
  validateAudioFile,
  validateURL,
  validateCoordinates,
  sanitizeText,
  validateObject
}
