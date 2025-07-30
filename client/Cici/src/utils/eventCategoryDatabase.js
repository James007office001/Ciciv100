/**
 * 本地数据库初始化 - 事件分类数据
 * 用于开发测试的预设事件分类数据
 */

// 事件分类初始化数据
export const initialEventCategories = [
  {
    id: 'category_work',
    name: '工作',
    icon: '💼',
    color: '#007AFF',
    description: '工作相关的事件和任务',
    isActive: true,
    isDefault: true,
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'category_meeting',
    name: '会议',
    icon: '📋',
    color: '#FF9500',
    description: '各类会议和讨论',
    isActive: true,
    isDefault: true,
    priority: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'category_personal',
    name: '个人',
    icon: '🏠',
    color: '#34C759',
    description: '个人生活相关事件',
    isActive: true,
    isDefault: true,
    priority: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'category_health',
    name: '健康',
    icon: '🏃‍♂️',
    color: '#FF3B30',
    description: '健康健身相关活动',
    isActive: true,
    isDefault: true,
    priority: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'category_study',
    name: '学习',
    icon: '📚',
    color: '#8E44AD',
    description: '学习教育相关事件',
    isActive: true,
    isDefault: true,
    priority: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'category_entertainment',
    name: '娱乐',
    icon: '🎯',
    color: '#E74C3C',
    description: '娱乐休闲活动',
    isActive: true,
    isDefault: true,
    priority: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'category_travel',
    name: '旅行',
    icon: '✈️',
    color: '#3498DB',
    description: '旅行出差相关事件',
    isActive: true,
    isDefault: true,
    priority: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'category_shopping',
    name: '购物',
    icon: '🛒',
    color: '#F39C12',
    description: '购物相关活动',
    isActive: true,
    isDefault: true,
    priority: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'category_family',
    name: '家庭',
    icon: '👨‍👩‍👧‍👦',
    color: '#E67E22',
    description: '家庭聚会和活动',
    isActive: true,
    isDefault: true,
    priority: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'category_other',
    name: '其他',
    icon: '📝',
    color: '#95A5A6',
    description: '其他类型的事件',
    isActive: true,
    isDefault: true,
    priority: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// 优先级矩阵定义（艾森豪威尔矩阵）
export const priorityMatrix = [
  { 
    value: 'important-urgent', 
    label: '重要且紧急', 
    description: '立即处理',
    color: '#FF3B30',
    icon: '🔥'
  },
  { 
    value: 'important-not-urgent', 
    label: '重要但不紧急', 
    description: '安排时间处理',
    color: '#FF9500',
    icon: '📋'
  },
  { 
    value: 'not-important-urgent', 
    label: '不重要但紧急', 
    description: '委托他人处理',
    color: '#007AFF',
    icon: '⚡'
  },
  { 
    value: 'not-important-not-urgent', 
    label: '不重要且不紧急', 
    description: '有时间再处理',
    color: '#34C759',
    icon: '⏰'
  }
]

/**
 * 初始化本地数据库中的事件分类数据
 */
export const initializeEventCategories = () => {
  try {
    // 检查uni对象是否存在
    if (typeof uni === 'undefined') {
      console.warn('uni对象不存在，返回默认分类数据')
      return initialEventCategories
    }
    
    // 检查本地存储中是否已有事件分类数据
    const existingCategories = uni.getStorageSync('cici_event_categories')
    
    if (!existingCategories || existingCategories.length === 0) {
      // 如果没有数据，则写入初始数据
      uni.setStorageSync('cici_event_categories', initialEventCategories)
      console.log('已初始化事件分类数据到本地存储')
      return initialEventCategories
    } else {
      console.log('本地存储中已存在事件分类数据')
      return existingCategories
    }
  } catch (error) {
    console.error('初始化事件分类数据失败:', error)
    return initialEventCategories
  }
}

/**
 * 从本地数据库加载事件分类
 */
export const loadEventCategories = () => {
  try {
    // 检查uni对象是否存在
    if (typeof uni === 'undefined') {
      console.warn('uni对象不存在，返回默认分类数据')
      return initialEventCategories.filter(cat => cat.isActive)
    }
    
    const categories = uni.getStorageSync('cici_event_categories')
    if (categories && categories.length > 0) {
      return categories.filter(cat => cat.isActive) // 只返回活跃的分类
    }
    return []
  } catch (error) {
    console.error('加载事件分类失败:', error)
    return []
  }
}

/**
 * 保存事件分类到本地数据库
 */
export const saveEventCategories = (categories) => {
  try {
    uni.setStorageSync('cici_event_categories', categories)
    console.log('事件分类已保存到本地存储')
    return true
  } catch (error) {
    console.error('保存事件分类失败:', error)
    return false
  }
}

/**
 * 根据ID获取事件分类
 */
export const getEventCategoryById = (categoryId) => {
  try {
    const categories = loadEventCategories()
    return categories.find(cat => cat.id === categoryId)
  } catch (error) {
    console.error('获取事件分类失败:', error)
    return null
  }
}

/**
 * 添加新的事件分类
 */
export const addEventCategory = (categoryData) => {
  try {
    const categories = loadEventCategories()
    const newCategory = {
      ...categoryData,
      id: categoryData.id || `category_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      isDefault: false
    }
    
    categories.push(newCategory)
    saveEventCategories(categories)
    return newCategory
  } catch (error) {
    console.error('添加事件分类失败:', error)
    return null
  }
}

/**
 * 更新事件分类
 */
export const updateEventCategory = (categoryId, updateData) => {
  try {
    const categories = loadEventCategories()
    const index = categories.findIndex(cat => cat.id === categoryId)
    
    if (index !== -1) {
      categories[index] = {
        ...categories[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      }
      saveEventCategories(categories)
      return categories[index]
    }
    return null
  } catch (error) {
    console.error('更新事件分类失败:', error)
    return null
  }
}

/**
 * 删除事件分类（软删除）
 */
export const deleteEventCategory = (categoryId) => {
  try {
    const categories = loadEventCategories()
    const index = categories.findIndex(cat => cat.id === categoryId)
    
    if (index !== -1) {
      // 软删除：设置为不活跃
      categories[index].isActive = false
      categories[index].updatedAt = new Date().toISOString()
      saveEventCategories(categories)
      return true
    }
    return false
  } catch (error) {
    console.error('删除事件分类失败:', error)
    return false
  }
}
