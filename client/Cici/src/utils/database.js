/**
 * 本地数据库管理工具
 * 基于 uni-app 的本地存储，提供事件数据的增删改查功能
 */

const DATABASE_KEYS = {
  EVENTS: 'cici_events',
  SYNC_STATUS: 'cici_sync_status',
  LAST_SYNC_TIME: 'cici_last_sync_time'
}

class EventDatabase {
  constructor() {
    this.listeners = new Map()
  }

  /**
   * 获取所有本地事件
   */
  async getAllEvents() {
    try {
      const eventsStr = uni.getStorageSync(DATABASE_KEYS.EVENTS)
      return eventsStr ? JSON.parse(eventsStr) : []
    } catch (error) {
      console.error('获取本地事件失败:', error)
      return []
    }
  }

  /**
   * 获取指定时间范围内的事件
   * @param {Date} startDate 开始日期
   * @param {Date} endDate 结束日期
   */
  async getEventsByDateRange(startDate, endDate) {
    try {
      const allEvents = await this.getAllEvents()
      const startStr = this.formatDate(startDate)
      const endStr = this.formatDate(endDate)
      
      return allEvents.filter(event => {
        return event.date >= startStr && event.date <= endStr
      })
    } catch (error) {
      console.error('按日期范围获取事件失败:', error)
      return []
    }
  }

  /**
   * 获取过去一周和未来三周的事件
   */
  async getRecentEvents() {
    const today = new Date()
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const threeWeeksLater = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000)
    
    return await this.getEventsByDateRange(oneWeekAgo, threeWeeksLater)
  }

  /**
   * 添加新事件
   * @param {Object} event 事件对象
   */
  async addEvent(event) {
    try {
      console.log('Database: 准备添加事件:', event)
      
      const allEvents = await this.getAllEvents()
      console.log('Database: 当前数据库事件数量:', allEvents.length)
      
      // 生成唯一字符串ID
      const newEvent = {
        ...event,
        id: this.generateEventId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending' // 待同步
      }
      
      console.log('Database: 生成的新事件:', newEvent)
      
      allEvents.push(newEvent)
      
      // 保存到本地存储
      uni.setStorageSync(DATABASE_KEYS.EVENTS, JSON.stringify(allEvents))
      
      console.log('Database: 保存后数据库事件数量:', allEvents.length)
      
      // 触发监听器
      this.notifyListeners('add', newEvent)
      
      // 异步同步到服务器
      this.syncToServer([newEvent], 'add')
      
      console.log('Database: 事件添加成功:', newEvent.title)
      return newEvent
    } catch (error) {
      console.error('Database: 添加事件失败:', error)
      throw error
    }
  }

  /**
   * 更新事件
   * @param {string} eventId 事件ID
   * @param {Object} updates 要更新的字段
   */
  async updateEvent(eventId, updates) {
    try {
      const allEvents = await this.getAllEvents()
      const index = allEvents.findIndex(e => e.id === eventId)
      
      if (index === -1) {
        throw new Error('事件不存在')
      }
      
      // 更新事件
      allEvents[index] = {
        ...allEvents[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending'
      }
      
      // 保存到本地存储
      uni.setStorageSync(DATABASE_KEYS.EVENTS, JSON.stringify(allEvents))
      
      // 触发监听器
      this.notifyListeners('update', allEvents[index])
      
      // 异步同步到服务器
      this.syncToServer([allEvents[index]], 'update')
      
      console.log('事件更新成功:', allEvents[index].title)
      return allEvents[index]
    } catch (error) {
      console.error('更新事件失败:', error)
      throw error
    }
  }

  /**
   * 删除事件
   * @param {number} eventId 事件ID
   */
  async deleteEvent(eventId) {
    try {
      const allEvents = await this.getAllEvents()
      const index = allEvents.findIndex(e => e.id === eventId)
      
      if (index === -1) {
        throw new Error('事件不存在')
      }
      
      const deletedEvent = allEvents[index]
      
      // 从数组中删除
      allEvents.splice(index, 1)
      
      // 保存到本地存储
      uni.setStorageSync(DATABASE_KEYS.EVENTS, JSON.stringify(allEvents))
      
      // 触发监听器
      this.notifyListeners('delete', deletedEvent)
      
      // 异步同步到服务器
      this.syncToServer([deletedEvent], 'delete')
      
      console.log('事件删除成功:', deletedEvent.title)
      return deletedEvent
    } catch (error) {
      console.error('删除事件失败:', error)
      throw error
    }
  }

  /**
   * 批量保存事件（用于从服务器同步）
   * @param {Array} events 事件数组
   */
  async batchSaveEvents(events) {
    try {
      const validEvents = events.map(event => ({
        ...event,
        syncStatus: 'synced',
        updatedAt: new Date().toISOString()
      }))
      
      uni.setStorageSync(DATABASE_KEYS.EVENTS, JSON.stringify(validEvents))
      
      // 触发监听器
      this.notifyListeners('batch_update', validEvents)
      
      console.log('批量保存事件成功，共', validEvents.length, '个事件')
      return validEvents
    } catch (error) {
      console.error('批量保存事件失败:', error)
      throw error
    }
  }

  /**
   * 同步到服务器
   * @param {Array} events 待同步的事件
   * @param {string} operation 操作类型：add, update, delete
   */
  async syncToServer(events, operation) {
    try {
      // 这里应该调用真实的API
      // 目前使用模拟的API调用
      
      console.log(`开始同步到服务器: ${operation}`, events.length, '个事件')
      
      // 模拟API调用
      const response = await this.mockApiCall(events, operation)
      
      if (response.success) {
        // 更新同步状态
        await this.updateSyncStatus(events, 'synced')
        console.log('同步到服务器成功')
      } else {
        console.error('同步到服务器失败:', response.error)
        await this.updateSyncStatus(events, 'failed')
      }
    } catch (error) {
      console.error('同步到服务器异常:', error)
      await this.updateSyncStatus(events, 'failed')
    }
  }

  /**
   * 更新事件的同步状态
   * @param {Array} events 事件数组
   * @param {string} status 同步状态：synced, failed, pending
   */
  async updateSyncStatus(events, status) {
    try {
      const allEvents = await this.getAllEvents()
      
      events.forEach(event => {
        const index = allEvents.findIndex(e => e.id === event.id)
        if (index !== -1) {
          allEvents[index].syncStatus = status
        }
      })
      
      uni.setStorageSync(DATABASE_KEYS.EVENTS, JSON.stringify(allEvents))
    } catch (error) {
      console.error('更新同步状态失败:', error)
    }
  }

  /**
   * 从服务器获取事件
   */
  async fetchEventsFromServer() {
    try {
      console.log('开始从服务器获取事件...')
      
      // 模拟API调用
      const response = await this.mockServerFetch()
      
      if (response.success) {
        console.log('从服务器获取事件成功，共', response.data.length, '个事件')
        return response.data
      } else {
        console.error('从服务器获取事件失败:', response.error)
        return []
      }
    } catch (error) {
      console.error('从服务器获取事件异常:', error)
      return []
    }
  }

  /**
   * 对比本地和服务器数据，返回差异
   * @param {Array} serverEvents 服务器事件
   * @param {Array} localEvents 本地事件
   */
  compareEvents(serverEvents, localEvents) {
    const conflicts = []
    const serverOnly = []
    const localOnly = []
    
    // 创建映射表便于查找
    const serverMap = new Map(serverEvents.map(e => [e.id, e]))
    const localMap = new Map(localEvents.map(e => [e.id, e]))
    
    // 检查服务器独有的事件
    serverEvents.forEach(serverEvent => {
      if (!localMap.has(serverEvent.id)) {
        serverOnly.push(serverEvent)
      } else {
        const localEvent = localMap.get(serverEvent.id)
        // 检查是否有冲突（更新时间不同）
        if (new Date(serverEvent.updatedAt) !== new Date(localEvent.updatedAt)) {
          conflicts.push({
            server: serverEvent,
            local: localEvent
          })
        }
      }
    })
    
    // 检查本地独有的事件
    localEvents.forEach(localEvent => {
      if (!serverMap.has(localEvent.id)) {
        localOnly.push(localEvent)
      }
    })
    
    return {
      conflicts,
      serverOnly,
      localOnly,
      hasConflicts: conflicts.length > 0 || serverOnly.length > 0 || localOnly.length > 0
    }
  }

  /**
   * 添加数据变化监听器
   * @param {string} type 监听类型
   * @param {Function} callback 回调函数
   */
  addListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type).push(callback)
  }

  /**
   * 移除监听器
   * @param {string} type 监听类型
   * @param {Function} callback 回调函数
   */
  removeListener(type, callback) {
    if (this.listeners.has(type)) {
      const callbacks = this.listeners.get(type)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 通知监听器
   * @param {string} type 事件类型
   * @param {Object} data 数据
   */
  notifyListeners(type, data) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('监听器回调执行失败:', error)
        }
      })
    }
  }

  /**
   * 格式化日期为字符串
   * @param {Date} date 日期对象
   */
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * 模拟API调用（实际使用时替换为真实API）
   */
  async mockApiCall(events, operation) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: events,
          operation
        })
      }, 500) // 模拟网络延迟
    })
  }

  /**
   * 生成唯一的事件ID
   */
  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 模拟服务器数据获取（实际使用时替换为真实API）
   */
  async mockServerFetch() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [] // 实际应该返回服务器的事件数据
        })
      }, 1000)
    })
  }

  /**
   * 清空本地数据库（用于测试）
   */
  async clearDatabase() {
    try {
      uni.removeStorageSync(DATABASE_KEYS.EVENTS)
      uni.removeStorageSync(DATABASE_KEYS.SYNC_STATUS)
      uni.removeStorageSync(DATABASE_KEYS.LAST_SYNC_TIME)
      console.log('本地数据库已清空')
    } catch (error) {
      console.error('清空数据库失败:', error)
    }
  }
}

// 创建单例实例
const eventDatabase = new EventDatabase()

export default eventDatabase
