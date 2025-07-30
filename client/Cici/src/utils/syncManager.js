/**
 * 数据同步管理器
 * 处理本地数据库与服务器数据的同步逻辑
 */

import eventDatabase from './database.js'

class SyncManager {
  constructor() {
    this.isSync = false
    this.syncListeners = []
  }

  /**
   * 应用启动时的数据同步
   */
  async performStartupSync() {
    try {
      this.isSync = true
      this.notifySyncListeners('start', { message: '开始同步数据...' })

      console.log('=== 开始启动同步 ===')
      
      // 1. 获取本地的过去一周和未来三周事件
      const localEvents = await eventDatabase.getRecentEvents()
      console.log('本地事件数量:', localEvents.length)
      
      // 2. 从服务器获取相同时间范围的事件
      const serverEvents = await eventDatabase.fetchEventsFromServer()
      console.log('服务器事件数量:', serverEvents.length)
      
      // 3. 对比数据差异
      const comparison = eventDatabase.compareEvents(serverEvents, localEvents)
      console.log('数据对比结果:', comparison)
      
      // 4. 如果有差异，提示用户选择
      if (comparison.hasConflicts) {
        const resolution = await this.showConflictResolution(comparison)
        await this.resolveConflicts(resolution, comparison)
      } else {
        console.log('本地数据与服务器数据一致，无需同步')
        this.notifySyncListeners('complete', { message: '数据已是最新版本' })
      }
      
      // 5. 记录同步时间
      uni.setStorageSync('cici_last_sync_time', new Date().toISOString())
      
      console.log('=== 启动同步完成 ===')
      
    } catch (error) {
      console.error('启动同步失败:', error)
      this.notifySyncListeners('error', { error: error.message })
    } finally {
      this.isSync = false
    }
  }

  /**
   * 显示冲突解决对话框
   * @param {Object} comparison 数据对比结果
   */
  async showConflictResolution(comparison) {
    return new Promise((resolve) => {
      const conflictDetails = this.buildConflictDetails(comparison)
      
      // 显示模态对话框让用户选择
      uni.showModal({
        title: '数据同步冲突',
        content: `发现数据不一致:\n${conflictDetails}\n\n请选择保留哪个版本的数据`,
        confirmText: '保留服务器版本',
        cancelText: '保留本地版本',
        success: (res) => {
          resolve({
            useServer: res.confirm,
            useLocal: res.cancel
          })
        }
      })
    })
  }

  /**
   * 构建冲突详情描述
   * @param {Object} comparison 数据对比结果
   */
  buildConflictDetails(comparison) {
    const details = []
    
    if (comparison.conflicts.length > 0) {
      details.push(`${comparison.conflicts.length}个事件存在冲突`)
    }
    
    if (comparison.serverOnly.length > 0) {
      details.push(`服务器有${comparison.serverOnly.length}个新事件`)
    }
    
    if (comparison.localOnly.length > 0) {
      details.push(`本地有${comparison.localOnly.length}个未同步事件`)
    }
    
    return details.join('，')
  }

  /**
   * 解决数据冲突
   * @param {Object} resolution 用户选择的解决方案
   * @param {Object} comparison 数据对比结果
   */
  async resolveConflicts(resolution, comparison) {
    try {
      this.notifySyncListeners('resolving', { message: '正在解决数据冲突...' })

      if (resolution.useServer) {
        // 使用服务器版本
        await this.applyServerVersion(comparison)
        this.notifySyncListeners('complete', { message: '已同步服务器数据' })
      } else if (resolution.useLocal) {
        // 使用本地版本，将本地数据推送到服务器
        await this.pushLocalToServer(comparison)
        this.notifySyncListeners('complete', { message: '已将本地数据同步到服务器' })
      }
    } catch (error) {
      console.error('解决冲突失败:', error)
      this.notifySyncListeners('error', { error: error.message })
    }
  }

  /**
   * 应用服务器版本的数据
   * @param {Object} comparison 数据对比结果
   */
  async applyServerVersion(comparison) {
    try {
      // 1. 获取所有服务器事件
      const serverEvents = await eventDatabase.fetchEventsFromServer()
      
      // 2. 批量保存到本地（这会覆盖所有本地数据）
      await eventDatabase.batchSaveEvents(serverEvents)
      
      console.log('已应用服务器版本数据')
    } catch (error) {
      console.error('应用服务器版本失败:', error)
      throw error
    }
  }

  /**
   * 将本地数据推送到服务器
   * @param {Object} comparison 数据对比结果
   */
  async pushLocalToServer(comparison) {
    try {
      // 1. 推送本地独有的事件
      for (const event of comparison.localOnly) {
        await eventDatabase.syncToServer([event], 'add')
      }
      
      // 2. 推送冲突的本地版本
      for (const conflict of comparison.conflicts) {
        await eventDatabase.syncToServer([conflict.local], 'update')
      }
      
      console.log('已将本地数据推送到服务器')
    } catch (error) {
      console.error('推送本地数据失败:', error)
      throw error
    }
  }

  /**
   * 手动触发同步
   */
  async manualSync() {
    if (this.isSync) {
      uni.showToast({
        title: '正在同步中...',
        icon: 'loading'
      })
      return
    }

    try {
      await this.performStartupSync()
      uni.showToast({
        title: '同步完成',
        icon: 'success'
      })
    } catch (error) {
      uni.showToast({
        title: '同步失败',
        icon: 'error'
      })
    }
  }

  /**
   * 检查是否需要同步
   */
  shouldSync() {
    try {
      const lastSyncTime = uni.getStorageSync('cici_last_sync_time')
      if (!lastSyncTime) {
        return true // 从未同步过
      }
      
      const lastSync = new Date(lastSyncTime)
      const now = new Date()
      const diffHours = (now - lastSync) / (1000 * 60 * 60)
      
      // 如果超过6小时没有同步，则需要同步
      return diffHours > 6
    } catch (error) {
      console.error('检查同步状态失败:', error)
      return true
    }
  }

  /**
   * 获取未同步的事件数量
   */
  async getPendingSyncCount() {
    try {
      const allEvents = await eventDatabase.getAllEvents()
      return allEvents.filter(event => event.syncStatus === 'pending' || event.syncStatus === 'failed').length
    } catch (error) {
      console.error('获取未同步事件数量失败:', error)
      return 0
    }
  }

  /**
   * 重试失败的同步
   */
  async retryFailedSync() {
    try {
      const allEvents = await eventDatabase.getAllEvents()
      const failedEvents = allEvents.filter(event => event.syncStatus === 'failed')
      
      for (const event of failedEvents) {
        await eventDatabase.syncToServer([event], 'update')
      }
      
      console.log('重试失败同步完成，共', failedEvents.length, '个事件')
    } catch (error) {
      console.error('重试失败同步异常:', error)
    }
  }

  /**
   * 添加同步状态监听器
   * @param {Function} callback 回调函数
   */
  addSyncListener(callback) {
    this.syncListeners.push(callback)
  }

  /**
   * 移除同步状态监听器
   * @param {Function} callback 回调函数
   */
  removeSyncListener(callback) {
    const index = this.syncListeners.indexOf(callback)
    if (index > -1) {
      this.syncListeners.splice(index, 1)
    }
  }

  /**
   * 通知同步状态监听器
   * @param {string} status 同步状态
   * @param {Object} data 相关数据
   */
  notifySyncListeners(status, data) {
    this.syncListeners.forEach(callback => {
      try {
        callback({ status, ...data })
      } catch (error) {
        console.error('同步监听器回调失败:', error)
      }
    })
  }

  /**
   * 获取同步状态
   */
  getSyncStatus() {
    return {
      isSync: this.isSync,
      lastSyncTime: uni.getStorageSync('cici_last_sync_time'),
      shouldSync: this.shouldSync()
    }
  }
}

// 创建单例实例
const syncManager = new SyncManager()

export default syncManager
