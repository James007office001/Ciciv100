/**
 * 共享加密工具函数
 * 前后端通用的加密解密逻辑
 */

/**
 * 简单的字符串哈希函数
 * @param {string} str - 输入字符串
 * @returns {number} 哈希值
 */
export function simpleHash(str) {
  let hash = 0
  if (str.length === 0) return hash
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  
  return Math.abs(hash)
}

/**
 * 生成随机字符串
 * @param {number} length - 长度
 * @param {string} charset - 字符集
 * @returns {string} 随机字符串
 */
export function generateRandomString(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

/**
 * 生成UUID（简化版）
 * @returns {string} UUID字符串
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Base64编码
 * @param {string} str - 输入字符串
 * @returns {string} Base64编码字符串
 */
export function base64Encode(str) {
  if (typeof btoa !== 'undefined') {
    // 浏览器环境
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16))
    }))
  } else {
    // Node.js环境
    return Buffer.from(str, 'utf8').toString('base64')
  }
}

/**
 * Base64解码
 * @param {string} str - Base64字符串
 * @returns {string} 解码后的字符串
 */
export function base64Decode(str) {
  if (typeof atob !== 'undefined') {
    // 浏览器环境
    return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
  } else {
    // Node.js环境
    return Buffer.from(str, 'base64').toString('utf8')
  }
}

/**
 * 简单的XOR加密
 * @param {string} text - 要加密的文本
 * @param {string} key - 密钥
 * @returns {string} 加密后的文本
 */
export function xorEncrypt(text, key) {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    )
  }
  return base64Encode(result)
}

/**
 * 简单的XOR解密
 * @param {string} encryptedText - 加密的文本
 * @param {string} key - 密钥
 * @returns {string} 解密后的文本
 */
export function xorDecrypt(encryptedText, key) {
  const decodedText = base64Decode(encryptedText)
  let result = ''
  for (let i = 0; i < decodedText.length; i++) {
    result += String.fromCharCode(
      decodedText.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    )
  }
  return result
}

/**
 * 生成密码哈希（客户端用）
 * 注意：这只是一个简单的哈希，生产环境应使用更安全的方法
 * @param {string} password - 密码
 * @param {string} salt - 盐值
 * @returns {string} 哈希值
 */
export function hashPassword(password, salt = '') {
  const combined = password + salt
  let hash = 0
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return Math.abs(hash).toString(16)
}

/**
 * 生成随机盐值
 * @param {number} length - 盐值长度
 * @returns {string} 盐值
 */
export function generateSalt(length = 16) {
  return generateRandomString(length)
}

/**
 * 敏感信息掩码处理
 * @param {string} text - 原始文本
 * @param {number} visibleStart - 开始可见字符数
 * @param {number} visibleEnd - 结束可见字符数
 * @param {string} maskChar - 掩码字符
 * @returns {string} 掩码处理后的文本
 */
export function maskSensitiveInfo(text, visibleStart = 2, visibleEnd = 2, maskChar = '*') {
  if (!text || text.length <= visibleStart + visibleEnd) {
    return text
  }
  
  const start = text.substring(0, visibleStart)
  const end = text.substring(text.length - visibleEnd)
  const maskLength = text.length - visibleStart - visibleEnd
  
  return start + maskChar.repeat(maskLength) + end
}

/**
 * 验证哈希值
 * @param {string} text - 原始文本
 * @param {string} hash - 哈希值
 * @param {string} salt - 盐值
 * @returns {boolean} 是否匹配
 */
export function verifyHash(text, hash, salt = '') {
  return hashPassword(text, salt) === hash
}

/**
 * 安全的随机数生成
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
export function secureRandom(min = 0, max = 1) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // 使用Crypto API（更安全）
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return min + (array[0] / (0xffffffff + 1)) * (max - min)
  } else {
    // 降级到Math.random
    return min + Math.random() * (max - min)
  }
}

/**
 * 生成安全的随机整数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机整数
 */
export function secureRandomInt(min, max) {
  return Math.floor(secureRandom(min, max + 1))
}

/**
 * 简单的数据混淆
 * @param {string} data - 要混淆的数据
 * @returns {string} 混淆后的数据
 */
export function obfuscateData(data) {
  const timestamp = Date.now().toString()
  const randomStr = generateRandomString(8)
  const combined = randomStr + data + timestamp
  
  return base64Encode(combined)
}

/**
 * 简单的数据反混淆
 * @param {string} obfuscatedData - 混淆的数据
 * @returns {string} 原始数据
 */
export function deobfuscateData(obfuscatedData) {
  try {
    const decoded = base64Decode(obfuscatedData)
    // 移除前8位随机字符和后13位时间戳
    return decoded.substring(8, decoded.length - 13)
  } catch (error) {
    return ''
  }
}

export default {
  simpleHash,
  generateRandomString,
  generateUUID,
  base64Encode,
  base64Decode,
  xorEncrypt,
  xorDecrypt,
  hashPassword,
  generateSalt,
  maskSensitiveInfo,
  verifyHash,
  secureRandom,
  secureRandomInt,
  obfuscateData,
  deobfuscateData
}
