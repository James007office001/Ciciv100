/**
 * 事件管理 Store 模块
 * 管理事件数据的状态和操作
 */

import { defineStore } from 'pinia'
import eventDatabase from '@/src/utils/database.js'
import syncManager from '@/src/utils/syncManager.js'

export const useEventStore = defineStore('event', {
  state: () => ({
    // 所有事件列表
    events: [],
    
    // 加载状态
    loading: false,
    
    // 同步状态
    syncStatus: {
      isSync: false,
      lastSyncTime: null,
      pendingCount: 0
    },
    
    // 过滤条件
    filters: {
      category: 'all',
      dateRange: null
    }
  }),

  getters: {
    // 获取指定ID的事件
    getEventById: (state) => (id) => {
      return state.events.find(event => event.id === id)
    },

    // 获取指定日期的事件
    getEventsByDate: (state) => (date) => {
      const dateStr = formatDate(date)
      return state.events.filter(event => event.date === dateStr)
    },

    // 获取指定日期范围的事件
    getEventsByDateRange: (state) => (startDate, endDate) => {
      const startStr = formatDate(startDate)
      const endStr = formatDate(endDate)
      return state.events.filter(event => {
        return event.date >= startStr && event.date <= endStr
      })
    },

    // 获取过滤后的事件
    filteredEvents: (state) => {
      let filtered = [...state.events]
      
      // 按分类过滤
      if (state.filters.category && state.filters.category !== 'all') {
        filtered = filtered.filter(event => event.category === state.filters.category)
      }
      
      // 按日期范围过滤
      if (state.filters.dateRange) {
        const { start, end } = state.filters.dateRange
        filtered = filtered.filter(event => {
          return event.date >= start && event.date <= end
        })
      }
      
      return filtered
    },

    // 获取未同步的事件
    pendingEvents: (state) => {
      return state.events.filter(event => 
        event.syncStatus === 'pending' || event.syncStatus === 'failed'
      )
    },

    // 获取待同步事件数量
    pendingSyncCount: (state) => {
      return state.events.filter(event => 
        event.syncStatus === 'pending' || event.syncStatus === 'failed'
      ).length
    },

    // 获取今天的事件
    todayEvents: (state) => {
      const today = formatDate(new Date())
      return state.events.filter(event => event.date === today)
    },

    // 获取即将到来的事件（未来7天）
    upcomingEvents: (state) => {
      const today = new Date()
      const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const todayStr = formatDate(today)
      const sevenDaysStr = formatDate(sevenDaysLater)
      
      return state.events.filter(event => {
        return event.date >= todayStr && event.date <= sevenDaysStr
      }).sort((a, b) => {
        // 按日期和时间排序
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date)
        }
        return a.startTime.localeCompare(b.startTime)
      })
    }
  },

  actions: {
    /**
     * 初始化事件数据
     */
    async initializeEvents() {
      try {
        this.loading = true
        
        // 检查是否需要迁移旧数据
        await this.migrateOldEvents()
        
        // 从本地数据库加载事件
        const events = await eventDatabase.getAllEvents()
        this.events = events
        
        // 更新同步状态
        await this.updateSyncStatus()
        
        console.log('事件数据初始化完成，共', events.length, '个事件')
      } catch (error) {
        console.error('初始化事件数据失败:', error)
        uni.showToast({
          title: '加载事件失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 迁移旧格式的事件数据
     */
    async migrateOldEvents() {
      try {
        // 检查是否有旧格式的事件数据
        const oldEvents = uni.getStorageSync('events')
        if (!oldEvents || !Array.isArray(oldEvents) || oldEvents.length === 0) {
          return
        }

        console.log('发现旧格式事件数据，开始迁移...', oldEvents.length, '个事件')

        // 转换数据格式
        for (const oldEvent of oldEvents) {
          const newEventData = {
            title: oldEvent.title || '未命名事件',
            description: oldEvent.description || '',
            startTime: oldEvent.date && oldEvent.startTime ? 
              `${oldEvent.date} ${oldEvent.startTime}` : 
              new Date().toISOString(),
            endTime: oldEvent.date && oldEvent.endTime ? 
              `${oldEvent.date} ${oldEvent.endTime}` : 
              new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            location: oldEvent.location || '',
            category: oldEvent.category || '其他',
            priority: oldEvent.priority || 'normal',
            color: oldEvent.color || '#667eea',
            allDay: oldEvent.allDay || false,
            reminder: oldEvent.timeReminder > 0,
            reminderMinutes: oldEvent.timeReminder || 15,
            repeat: oldEvent.repeat || 'none',
            // 保持兼容性的字段
            date: oldEvent.date,
            categoryIcon: oldEvent.categoryIcon || '📅',
            priorityLabel: oldEvent.priorityLabel || '普通'
          }

          // 添加到新数据库
          await eventDatabase.addEvent(newEventData)
        }

        // 清除旧数据
        uni.removeStorageSync('events')
        console.log('数据迁移完成')

      } catch (error) {
        console.error('迁移旧事件数据失败:', error)
      }
    },

    /**
     * 添加新事件
     */
    async addEvent(eventData) {
      try {
        this.loading = true
        
        console.log('EventStore: 准备添加事件:', eventData)
        
        // 添加到本地数据库
        const newEvent = await eventDatabase.addEvent(eventData)
        
        console.log('EventStore: 数据库添加成功:', newEvent)
        
        // 更新状态 - 使用push方法确保响应性
        this.events.push(newEvent)
        
        // 强制触发响应性更新
        this.events = [...this.events]
        
        console.log('EventStore: 当前事件总数:', this.events.length)
        console.log('EventStore: 待同步事件数:', this.pendingSyncCount)
        console.log('EventStore: 所有事件:', this.events.map(e => ({ title: e.title, date: e.date })))
        
        uni.showToast({
          title: '事件已添加',
          icon: 'success'
        })
        
        console.log('EventStore: 新事件已添加:', newEvent.title)
        return newEvent
      } catch (error) {
        console.error('EventStore: 添加事件失败:', error)
        uni.showToast({
          title: '添加事件失败',
          icon: 'error'
        })
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新事件
     */
    async updateEvent(eventId, updates) {
      try {
        this.loading = true
        
        // 更新本地数据库
        const updatedEvent = await eventDatabase.updateEvent(eventId, updates)
        
        // 更新状态
        const index = this.events.findIndex(e => e.id === eventId)
        if (index !== -1) {
          this.events[index] = updatedEvent
        }
        
        // 更新同步状态
        await this.updateSyncStatus()
        
        console.log('事件已更新:', updatedEvent.title)
        return updatedEvent
      } catch (error) {
        console.error('更新事件失败:', error)
        uni.showToast({
          title: '更新事件失败',
          icon: 'error'
        })
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除事件
     */
    async deleteEvent(eventId) {
      try {
        this.loading = true
        
        // 从本地数据库删除
        const deletedEvent = await eventDatabase.deleteEvent(eventId)
        
        // 更新状态
        const index = this.events.findIndex(e => e.id === eventId)
        if (index !== -1) {
          this.events.splice(index, 1)
        }
        
        // 更新同步状态
        await this.updateSyncStatus()
        
        console.log('事件已删除:', deletedEvent.title)
        return deletedEvent
      } catch (error) {
        console.error('删除事件失败:', error)
        uni.showToast({
          title: '删除事件失败',
          icon: 'error'
        })
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 执行数据同步
     */
    async performSync() {
      try {
        this.syncStatus.isSync = true
        
        // 执行同步
        await syncManager.performStartupSync()
        
        // 重新加载事件数据
        await this.initializeEvents()
        
        console.log('数据同步完成')
      } catch (error) {
        console.error('数据同步失败:', error)
      } finally {
        this.syncStatus.isSync = false
      }
    },

    /**
     * 更新同步状态
     */
    async updateSyncStatus() {
      try {
        const pendingCount = await syncManager.getPendingSyncCount()
        const syncStatus = syncManager.getSyncStatus()
        
        this.syncStatus = {
          ...syncStatus,
          pendingCount
        }
      } catch (error) {
        console.error('更新同步状态失败:', error)
      }
    },

    /**
     * 设置过滤条件
     */
    setFilter(filterType, value) {
      if (filterType === 'category') {
        this.filters.category = value
      } else if (filterType === 'dateRange') {
        this.filters.dateRange = value
      }
    },

    /**
     * 清除过滤条件
     */
    clearFilters() {
      this.filters.category = 'all'
      this.filters.dateRange = null
    },

    /**
     * 重新加载事件数据
     */
    async reloadEvents() {
      await this.initializeEvents()
    },

    /**
     * 批量删除事件
     */
    async batchDeleteEvents(eventIds) {
      try {
        this.loading = true
        
        for (const eventId of eventIds) {
          await eventDatabase.deleteEvent(eventId)
          const index = this.events.findIndex(e => e.id === eventId)
          if (index !== -1) {
            this.events.splice(index, 1)
          }
        }
        
        await this.updateSyncStatus()
        
        uni.showToast({
          title: `已删除${eventIds.length}个事件`,
          icon: 'success'
        })
        
        console.log('批量删除事件完成，共', eventIds.length, '个')
      } catch (error) {
        console.error('批量删除事件失败:', error)
        uni.showToast({
          title: '批量删除失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    }
  }
})

/**
 * 格式化日期为字符串
 * @param {Date} date 日期对象
 */
function formatDate(date) {
  if (typeof date === 'string') return date
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
