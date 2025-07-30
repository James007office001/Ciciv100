<!--
  CICI 实时时间显示组件
  
  功能特性:
  1. 显示经过NTP同步的准确时间
  2. 实时更新时间显示
  3. 自动处理时间格式化
  4. 支持多种显示格式
  5. 网络异常时提供时间可靠性指示
-->
<template>
  <view class="time-display" :class="{ 'unreliable': !isTimeReliable }">
    <!-- 主要时间显示 -->
    <view class="time-main" v-if="showTime">
      <text class="time-text">{{ formattedTime }}</text>
      <view v-if="showReliabilityIndicator" class="reliability-indicator">
        <view 
          class="indicator-dot"
          :class="{ 
            'success': isTimeReliable && isSynced, 
            'warning': !isTimeReliable, 
            'error': !isSynced 
          }"
        ></view>
        <text class="indicator-text">{{ reliabilityText }}</text>
      </view>
    </view>
    
    <!-- 日期显示 -->
    <view class="date-display" v-if="showDate">
      <text class="date-text">{{ formattedDate }}</text>
    </view>
    
    <!-- 最后同步时间 -->
    <view class="sync-info" v-if="showSyncInfo && lastSyncTime">
      <text class="sync-text">上次同步: {{ formatLastSync }}</text>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import timeManager from '@/src/utils/timeManager.js'

export default {
  name: 'TimeDisplay',
  
  props: {
    // 时间格式 
    format: {
      type: String,
      default: 'HH:mm:ss'
    },
    
    // 日期格式
    dateFormat: {
      type: String,
      default: 'YYYY年MM月DD日'
    },
    
    // 是否显示时间
    showTime: {
      type: Boolean,
      default: true
    },
    
    // 是否显示日期
    showDate: {
      type: Boolean,
      default: false
    },
    
    // 是否显示可靠性指示器
    showReliabilityIndicator: {
      type: Boolean,
      default: true
    },
    
    // 是否显示同步信息
    showSyncInfo: {
      type: Boolean,
      default: false
    },
    
    // 更新间隔（毫秒）
    updateInterval: {
      type: Number,
      default: 1000
    },
    
    // 主题样式
    theme: {
      type: String,
      default: 'default', // default, dark, light
      validator: (value) => ['default', 'dark', 'light'].includes(value)
    }
  },
  
  emits: ['timeUpdate', 'syncStatusChange'],
  
  setup(props, { emit }) {
    // 响应式数据
    const currentTime = ref(Date.now())
    const isTimeReliable = ref(true)
    const isSynced = ref(false)
    const lastSyncTime = ref(null)
    const timeState = ref({})
    
    // 定时器
    let updateTimer = null
    
    // 格式化时间
    const formattedTime = computed(() => {
      const accurateTime = timeManager ? timeManager.getAccurateTime() : currentTime.value
      const date = new Date(accurateTime)
      
      return formatTime(date, props.format)
    })
    
    // 格式化日期
    const formattedDate = computed(() => {
      const accurateTime = timeManager ? timeManager.getAccurateTime() : currentTime.value
      const date = new Date(accurateTime)
      
      return formatTime(date, props.dateFormat)
    })
    
    // 可靠性指示文本
    const reliabilityText = computed(() => {
      if (isSynced.value && isTimeReliable.value) {
        return '已同步'
      } else if (!isTimeReliable.value) {
        return '需要同步'
      } else if (!isSynced.value) {
        return '同步中...'
      }
      return '未知'
    })
    
    // 最后同步时间格式化
    const formatLastSync = computed(() => {
      if (!lastSyncTime.value) return '未同步'
      
      const now = Date.now()
      const diff = now - lastSyncTime.value.getTime()
      
      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return formatTime(lastSyncTime.value, 'MM-DD HH:mm')
      }
    })
    
    /**
     * 格式化时间
     */
    const formatTime = (date, format) => {
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
     * 更新时间显示
     */
    const updateTime = () => {
      const now = timeManager ? timeManager.getAccurateTime() : Date.now()
      currentTime.value = now
      
      // 检查时间可靠性
      if (timeManager) {
        isTimeReliable.value = timeManager.isTimeReliable()
        const state = timeManager.getTimeState()
        timeState.value = state
        isSynced.value = state.syncStatus === 'success'
        lastSyncTime.value = state.lastSync
      }
      
      // 触发时间更新事件
      emit('timeUpdate', {
        time: now,
        formattedTime: formattedTime.value,
        formattedDate: formattedDate.value,
        isReliable: isTimeReliable.value,
        isSynced: isSynced.value
      })
    }
    
    /**
     * 启动时间更新
     */
    const startTimeUpdate = () => {
      if (updateTimer) {
        clearInterval(updateTimer)
      }
      
      // 立即更新一次
      updateTime()
      
      // 设置定时更新
      updateTimer = setInterval(updateTime, props.updateInterval)
    }
    
    /**
     * 停止时间更新
     */
    const stopTimeUpdate = () => {
      if (updateTimer) {
        clearInterval(updateTimer)
        updateTimer = null
      }
    }
    
    /**
     * 处理时间同步事件
     */
    const handleTimeSync = (data) => {
      console.log('TimeDisplay: 收到时间同步事件', data)
      isSynced.value = data.success
      updateTime()
      
      emit('syncStatusChange', {
        success: data.success,
        serverTime: data.serverTime,
        timeDifference: data.timeDifference
      })
    }
    
    /**
     * 处理系统时间变化事件
     */
    const handleSystemTimeChange = (data) => {
      console.log('TimeDisplay: 收到系统时间变化事件', data)
      updateTime()
    }
    
    /**
     * 手动同步时间
     */
    const manualSync = async () => {
      if (timeManager) {
        const result = await timeManager.forceSyncTime()
        updateTime()
        return result
      }
      return false
    }
    
    // 生命周期
    onMounted(() => {
      console.log('TimeDisplay: 组件挂载，开始时间更新')
      
      // 启动时间更新
      startTimeUpdate()
      
      // 监听时间同步事件
      if (timeManager) {
        timeManager.addListener('onTimeSync', handleTimeSync)
        timeManager.addListener('onTimeChange', handleSystemTimeChange)
        
        // 获取初始状态
        const state = timeManager.getTimeState()
        timeState.value = state
        isSynced.value = state.syncStatus === 'success'
        isTimeReliable.value = timeManager.isTimeReliable()
        lastSyncTime.value = state.lastSync
      }
      
      // 监听全局时间事件
      uni.$on('timeSync', handleTimeSync)
      uni.$on('systemTimeChange', handleSystemTimeChange)
    })
    
    onUnmounted(() => {
      console.log('TimeDisplay: 组件卸载，停止时间更新')
      
      // 停止时间更新
      stopTimeUpdate()
      
      // 移除监听器
      if (timeManager) {
        timeManager.removeListener('onTimeSync', handleTimeSync)
        timeManager.removeListener('onTimeChange', handleSystemTimeChange)
      }
      
      // 移除全局事件监听
      uni.$off('timeSync', handleTimeSync)
      uni.$off('systemTimeChange', handleSystemTimeChange)
    })
    
    return {
      currentTime,
      formattedTime,
      formattedDate,
      isTimeReliable,
      isSynced,
      lastSyncTime,
      reliabilityText,
      formatLastSync,
      manualSync
    }
  }
}
</script>

<style lang="scss" scoped>
.time-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &.unreliable {
    .time-text {
      color: #ff9500;
    }
  }
}

.time-main {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.time-text {
  color: rgba(255, 255, 255, 0.95);
  font-size: 32rpx;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease;
}

.date-display {
  margin-top: 8rpx;
}

.date-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
  font-weight: 500;
}

.reliability-indicator {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.indicator-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  
  &.success {
    background-color: #34c759;
    box-shadow: 0 0 8rpx rgba(52, 199, 89, 0.5);
  }
  
  &.warning {
    background-color: #ff9500;
    box-shadow: 0 0 8rpx rgba(255, 149, 0, 0.5);
  }
  
  &.error {
    background-color: #ff3b30;
    box-shadow: 0 0 8rpx rgba(255, 59, 48, 0.5);
  }
}

.indicator-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 18rpx;
}

.sync-info {
  margin-top: 8rpx;
}

.sync-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 20rpx;
}

/* 主题样式 */
.time-display[data-theme="dark"] {
  .time-text {
    color: rgba(255, 255, 255, 0.95);
  }
  
  .date-text {
    color: rgba(255, 255, 255, 0.8);
  }
}

.time-display[data-theme="light"] {
  .time-text {
    color: rgba(0, 0, 0, 0.9);
    text-shadow: 0 1rpx 3rpx rgba(255, 255, 255, 0.8);
  }
  
  .date-text {
    color: rgba(0, 0, 0, 0.7);
  }
  
  .indicator-text,
  .sync-text {
    color: rgba(0, 0, 0, 0.6);
  }
}

/* 响应式适配 */
@media (max-width: 375px) {
  .time-text {
    font-size: 28rpx;
  }
  
  .date-text {
    font-size: 22rpx;
  }
}
</style>
