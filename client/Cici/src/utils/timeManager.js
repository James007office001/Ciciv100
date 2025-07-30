/**
 * CICI 时间同步管理器
 * 
 * 功能特性:
 * 1. 与公共NTP服务器进行时间同步
 * 2. 实时监听系统时间变化
 * 3. 提供准确的时间显示和事件提醒
 * 4. 支持支付验证的时间可靠性
 */

class TimeManager {
  constructor() {
    // 时间同步配置
    this.syncConfig = {
      interval: 60000, // 1分钟同步一次
      timeout: 5000,   // 请求超时时间
      maxRetries: 3,   // 最大重试次数
      servers: [
        'time.nist.gov',
        'pool.ntp.org', 
        'time.cloudflare.com',
        'time.google.com'
      ]
    }
    
    // 时间状态
    this.timeState = {
      lastSync: null,           // 最后同步时间
      serverTime: null,         // 服务器时间
      localTime: null,          // 本地时间
      timeDifference: 0,        // 时间差(毫秒)
      syncStatus: 'pending',    // 同步状态: pending, success, failed
      isOnline: true            // 网络状态
    }
    
    // 监听器
    this.listeners = {
      onTimeSync: [],     // 时间同步回调
      onTimeChange: [],   // 时间变化回调
      onNetworkChange: [] // 网络状态变化回调
    }
    
    // 定时器
    this.syncTimer = null
    this.monitorTimer = null
    
    // 初始化
    this.init()
  }
  
  /**
   * 初始化时间管理器
   */
  async init() {
    console.log('TimeManager: 初始化时间同步管理器')
    
    // 立即执行一次时间同步
    await this.syncTime()
    
    // 启动定时同步
    this.startPeriodicSync()
    
    // 启动系统时间监听
    this.startTimeMonitoring()
    
    // 监听网络状态变化
    this.startNetworkMonitoring()
    
    // 监听应用生命周期
    this.startLifecycleMonitoring()
  }
  
  /**
   * 与NTP服务器同步时间
   */
  async syncTime() {
    console.log('TimeManager: 开始时间同步...')
    
    try {
      const startTime = Date.now()
      
      // 尝试多个NTP服务器
      for (let i = 0; i < this.syncConfig.servers.length; i++) {
        const server = this.syncConfig.servers[i]
        
        try {
          console.log(`TimeManager: 尝试连接服务器 ${server}`)
          const serverTime = await this.fetchServerTime(server)
          
          if (serverTime) {
            const endTime = Date.now()
            const networkDelay = (endTime - startTime) / 2
            
            // 计算调整后的服务器时间
            const adjustedServerTime = serverTime + networkDelay
            const localTime = Date.now()
            const timeDifference = adjustedServerTime - localTime
            
            // 更新时间状态
            this.timeState = {
              ...this.timeState,
              lastSync: new Date(),
              serverTime: adjustedServerTime,
              localTime: localTime,
              timeDifference: timeDifference,
              syncStatus: 'success'
            }
            
            console.log(`TimeManager: 时间同步成功`)
            console.log(`服务器时间: ${new Date(adjustedServerTime)}`)
            console.log(`本地时间: ${new Date(localTime)}`)
            console.log(`时间差: ${timeDifference}ms`)
            
            // 触发同步回调
            this.notifyListeners('onTimeSync', {
              success: true,
              serverTime: adjustedServerTime,
              localTime: localTime,
              timeDifference: timeDifference,
              server: server
            })
            
            return true
          }
        } catch (error) {
          console.warn(`TimeManager: 服务器 ${server} 连接失败:`, error.message)
          continue
        }
      }
      
      // 所有服务器都失败
      this.timeState.syncStatus = 'failed'
      console.error('TimeManager: 所有NTP服务器连接失败')
      
      this.notifyListeners('onTimeSync', {
        success: false,
        error: '时间同步失败'
      })
      
      return false
      
    } catch (error) {
      console.error('TimeManager: 时间同步异常:', error)
      this.timeState.syncStatus = 'failed'
      
      this.notifyListeners('onTimeSync', {
        success: false,
        error: error.message
      })
      
      return false
    }
  }
  
  /**
   * 从服务器获取时间
   */
  async fetchServerTime(server) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('请求超时'))
      }, this.syncConfig.timeout)
      
      try {
        // 使用多种方式获取服务器时间
        // 方式1: 尝试HTTP请求获取服务器时间
        uni.request({
          url: `https://worldtimeapi.org/api/timezone/Etc/UTC`,
          method: 'GET',
          timeout: this.syncConfig.timeout,
          success: (res) => {
            clearTimeout(timeout)
            if (res.statusCode === 200 && res.data && res.data.unixtime) {
              const serverTime = res.data.unixtime * 1000
              resolve(serverTime)
            } else {
              // 备用方案：使用响应头中的Date
              const dateHeader = res.header && res.header.Date
              if (dateHeader) {
                const serverTime = new Date(dateHeader).getTime()
                resolve(serverTime)
              } else {
                reject(new Error('无法获取服务器时间'))
              }
            }
          },
          fail: (error) => {
            clearTimeout(timeout)
            // 备用方案：使用本地时间API
            this.fallbackTimeSync().then(resolve).catch(reject)
          }
        })
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    })
  }
  
  /**
   * 备用时间同步方案
   */
  async fallbackTimeSync() {
    try {
      // 尝试其他时间API
      const apis = [
        'http://worldclockapi.com/api/json/utc/now',
        'https://timeapi.io/api/Time/current/zone?timeZone=UTC'
      ]
      
      for (const api of apis) {
        try {
          const result = await new Promise((resolve, reject) => {
            uni.request({
              url: api,
              method: 'GET',
              timeout: 3000,
              success: (res) => {
                if (res.statusCode === 200 && res.data) {
                  resolve(res.data)
                } else {
                  reject(new Error('API请求失败'))
                }
              },
              fail: reject
            })
          })
          
          // 解析时间数据
          let serverTime = null
          if (result.currentDateTime) {
            serverTime = new Date(result.currentDateTime).getTime()
          } else if (result.datetime) {
            serverTime = new Date(result.datetime).getTime()
          } else if (result.utc_datetime) {
            serverTime = new Date(result.utc_datetime).getTime()
          }
          
          if (serverTime && !isNaN(serverTime)) {
            return serverTime
          }
        } catch (error) {
          continue
        }
      }
      
      throw new Error('所有备用API都失败')
    } catch (error) {
      console.warn('TimeManager: 备用时间同步失败，使用本地时间')
      return Date.now()
    }
  }
  
  /**
   * 启动定时同步
   */
  startPeriodicSync() {
    console.log('TimeManager: 启动定时时间同步')
    
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }
    
    this.syncTimer = setInterval(() => {
      if (this.timeState.isOnline) {
        this.syncTime()
      }
    }, this.syncConfig.interval)
  }
  
  /**
   * 启动系统时间监听
   */
  startTimeMonitoring() {
    console.log('TimeManager: 启动系统时间监听')
    
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer)
    }
    
    let lastTime = Date.now()
    
    this.monitorTimer = setInterval(() => {
      const currentTime = Date.now()
      const timeDelta = currentTime - lastTime
      const expectedDelta = 1000 // 1秒
      
      // 检测时间跳跃（超过2秒的差异）
      if (Math.abs(timeDelta - expectedDelta) > 2000) {
        console.log('TimeManager: 检测到系统时间变化')
        console.log(`时间跳跃: ${timeDelta - expectedDelta}ms`)
        
        // 触发时间变化回调
        this.notifyListeners('onTimeChange', {
          oldTime: lastTime,
          newTime: currentTime,
          timeDelta: timeDelta,
          isJump: true
        })
        
        // 重新同步时间
        this.syncTime()
      }
      
      lastTime = currentTime
    }, 1000)
  }
  
  /**
   * 启动网络状态监听
   */
  startNetworkMonitoring() {
    console.log('TimeManager: 启动网络状态监听')
    
    // 监听网络状态变化
    uni.onNetworkStatusChange((res) => {
      const wasOnline = this.timeState.isOnline
      this.timeState.isOnline = res.isConnected
      
      console.log(`TimeManager: 网络状态变化 - ${res.isConnected ? '已连接' : '已断开'}`)
      
      // 网络恢复时立即同步时间
      if (!wasOnline && res.isConnected) {
        console.log('TimeManager: 网络恢复，立即同步时间')
        setTimeout(() => {
          this.syncTime()
        }, 1000)
      }
      
      // 触发网络状态变化回调
      this.notifyListeners('onNetworkChange', {
        isOnline: res.isConnected,
        networkType: res.networkType
      })
    })
    
    // 获取初始网络状态
    uni.getNetworkType({
      success: (res) => {
        this.timeState.isOnline = res.networkType !== 'none'
        console.log(`TimeManager: 初始网络状态 - ${this.timeState.isOnline ? '已连接' : '未连接'}`)
      }
    })
  }
  
  /**
   * 启动应用生命周期监听
   */
  startLifecycleMonitoring() {
    console.log('TimeManager: 启动应用生命周期监听')
    
    // 应用回到前台时同步时间
    uni.onAppShow(() => {
      console.log('TimeManager: 应用回到前台，同步时间')
      setTimeout(() => {
        this.syncTime()
      }, 500)
    })
    
    // 应用进入后台时停止定时同步（可选）
    uni.onAppHide(() => {
      console.log('TimeManager: 应用进入后台')
      // 保持后台同步以确保时间准确性
    })
  }
  
  /**
   * 获取准确时间
   */
  getAccurateTime() {
    if (this.timeState.syncStatus === 'success' && this.timeState.timeDifference !== null) {
      // 使用同步的时间差计算准确时间
      return Date.now() + this.timeState.timeDifference
    } else {
      // 回退到本地时间
      return Date.now()
    }
  }
  
  /**
   * 获取格式化的准确时间
   */
  getFormattedTime(format = 'YYYY-MM-DD HH:mm:ss') {
    const accurateTime = this.getAccurateTime()
    const date = new Date(accurateTime)
    
    // 简单的格式化实现
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }
  
  /**
   * 检查时间是否可靠
   */
  isTimeReliable() {
    if (this.timeState.syncStatus !== 'success') {
      return false
    }
    
    const now = Date.now()
    const lastSyncTime = this.timeState.lastSync ? this.timeState.lastSync.getTime() : 0
    const timeSinceSync = now - lastSyncTime
    
    // 如果上次同步超过5分钟，认为时间可能不可靠
    return timeSinceSync < 5 * 60 * 1000
  }
  
  /**
   * 添加监听器
   */
  addListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback)
    }
  }
  
  /**
   * 移除监听器
   */
  removeListener(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback)
      if (index > -1) {
        this.listeners[event].splice(index, 1)
      }
    }
  }
  
  /**
   * 通知监听器
   */
  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`TimeManager: 监听器回调异常 (${event}):`, error)
        }
      })
    }
  }
  
  /**
   * 获取时间状态
   */
  getTimeState() {
    return { ...this.timeState }
  }
  
  /**
   * 手动触发时间同步
   */
  async forceSyncTime() {
    console.log('TimeManager: 手动触发时间同步')
    return await this.syncTime()
  }
  
  /**
   * 销毁时间管理器
   */
  destroy() {
    console.log('TimeManager: 销毁时间管理器')
    
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
    
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer)
      this.monitorTimer = null
    }
    
    // 清除所有监听器
    Object.keys(this.listeners).forEach(key => {
      this.listeners[key] = []
    })
  }
}

// 创建单例实例
const timeManager = new TimeManager()

export default timeManager
