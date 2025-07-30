/**
 * 共享格式化工具函数
 * 前后端通用的数据格式化逻辑
 */

/**
 * 格式化日期
 * @param {Date|string} date - 日期
 * @param {string} format - 格式类型
 * @returns {string} 格式化后的日期
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  const formats = {
    'YYYY-MM-DD': `${year}-${month}-${day}`,
    'YYYY/MM/DD': `${year}/${month}/${day}`,
    'MM-DD': `${month}-${day}`,
    'MM/DD': `${month}/${day}`,
    'HH:mm': `${hours}:${minutes}`,
    'HH:mm:ss': `${hours}:${minutes}:${seconds}`,
    'YYYY-MM-DD HH:mm': `${year}-${month}-${day} ${hours}:${minutes}`,
    'YYYY-MM-DD HH:mm:ss': `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  return formats[format] || formats['YYYY-MM-DD']
}

/**
 * 格式化相对时间
 * @param {Date|string} date - 日期
 * @returns {string} 相对时间描述
 */
export function formatRelativeTime(date) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  if (months < 12) return `${months}个月前`
  return `${years}年前`
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 格式化价格
 * @param {number} price - 价格
 * @param {string} currency - 货币符号
 * @returns {string} 格式化后的价格
 */
export function formatPrice(price, currency = '¥') {
  if (price === 0) return '免费'
  if (!price || isNaN(price)) return ''
  
  return `${currency}${parseFloat(price).toFixed(2)}`
}

/**
 * 格式化数字（添加千分位分隔符）
 * @param {number} num - 数字
 * @returns {string} 格式化后的数字
 */
export function formatNumber(num) {
  if (!num || isNaN(num)) return '0'
  
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化大数字（如点赞数、关注数）
 * @param {number} num - 数字
 * @returns {string} 格式化后的数字
 */
export function formatLargeNumber(num) {
  if (!num || isNaN(num)) return '0'
  
  if (num < 1000) return num.toString()
  if (num < 10000) return `${(num / 1000).toFixed(1)}k`
  if (num < 100000) return `${Math.floor(num / 1000)}k`
  if (num < 10000000) return `${(num / 10000).toFixed(1)}万`
  return `${Math.floor(num / 10000)}万`
}

/**
 * 格式化手机号（隐藏中间4位）
 * @param {string} phone - 手机号
 * @returns {string} 格式化后的手机号
 */
export function formatPhone(phone) {
  if (!phone || phone.length !== 11) return phone
  
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化邮箱（隐藏部分字符）
 * @param {string} email - 邮箱
 * @returns {string} 格式化后的邮箱
 */
export function formatEmail(email) {
  if (!email || !email.includes('@')) return email
  
  const [username, domain] = email.split('@')
  if (username.length <= 3) return email
  
  const visibleStart = username.substring(0, 2)
  const visibleEnd = username.substring(username.length - 1)
  const hiddenLength = username.length - 3
  
  return `${visibleStart}${'*'.repeat(hiddenLength)}${visibleEnd}@${domain}`
}

/**
 * 格式化用户名（超长截断）
 * @param {string} name - 用户名
 * @param {number} maxLength - 最大长度
 * @returns {string} 格式化后的用户名
 */
export function formatUsername(name, maxLength = 10) {
  if (!name) return ''
  
  if (name.length <= maxLength) return name
  
  return name.substring(0, maxLength - 1) + '…'
}

/**
 * 格式化内容摘要
 * @param {string} content - 内容
 * @param {number} maxLength - 最大长度
 * @returns {string} 格式化后的摘要
 */
export function formatContentSummary(content, maxLength = 50) {
  if (!content) return ''
  
  const cleanContent = content.replace(/\s+/g, ' ').trim()
  
  if (cleanContent.length <= maxLength) return cleanContent
  
  return cleanContent.substring(0, maxLength - 1) + '…'
}

/**
 * 格式化地址
 * @param {object} address - 地址对象
 * @returns {string} 格式化后的地址
 */
export function formatAddress(address) {
  if (!address) return ''
  
  const parts = []
  if (address.province) parts.push(address.province)
  if (address.city && address.city !== address.province) parts.push(address.city)
  if (address.district) parts.push(address.district)
  if (address.street) parts.push(address.street)
  
  return parts.join('·')
}

/**
 * 格式化时间段
 * @param {Date|string} startTime - 开始时间
 * @param {Date|string} endTime - 结束时间
 * @returns {string} 格式化后的时间段
 */
export function formatTimeRange(startTime, endTime) {
  if (!startTime) return ''
  
  const start = formatDate(startTime, 'MM-DD HH:mm')
  
  if (!endTime) return start
  
  const startDate = formatDate(startTime, 'MM-DD')
  const endDate = formatDate(endTime, 'MM-DD')
  
  if (startDate === endDate) {
    // 同一天
    const endTimeOnly = formatDate(endTime, 'HH:mm')
    return `${start} - ${endTimeOnly}`
  } else {
    // 不同天
    const end = formatDate(endTime, 'MM-DD HH:mm')
    return `${start} - ${end}`
  }
}

/**
 * 格式化活动状态
 * @param {Date|string} startTime - 开始时间
 * @param {Date|string} endTime - 结束时间
 * @returns {object} 活动状态信息
 */
export function formatActivityStatus(startTime, endTime) {
  const now = new Date()
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : null

  if (now < start) {
    return {
      status: 'upcoming',
      text: '即将开始',
      color: '#007AFF'
    }
  }
  
  if (end && now > end) {
    return {
      status: 'ended',
      text: '已结束',
      color: '#8E8E93'
    }
  }
  
  return {
    status: 'ongoing',
    text: '进行中',
    color: '#34C759'
  }
}

/**
 * 格式化URL参数
 * @param {object} params - 参数对象
 * @returns {string} URL参数字符串
 */
export function formatURLParams(params) {
  if (!params || typeof params !== 'object') return ''
  
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value.toString())
    }
  })
  
  return searchParams.toString()
}

export default {
  formatDate,
  formatRelativeTime,
  formatFileSize,
  formatPrice,
  formatNumber,
  formatLargeNumber,
  formatPhone,
  formatEmail,
  formatUsername,
  formatContentSummary,
  formatAddress,
  formatTimeRange,
  formatActivityStatus,
  formatURLParams
}
