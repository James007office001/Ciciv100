<template>
  <view class="schedule-container">
    <!-- 固定的日历标题栏 -->
    <view class="calendar-header-fixed">
      <!-- 左边：年月日显示 -->
      <view class="date-selector">
        <text class="date-text">{{ currentYearMonth }}</text>
      </view>
      
      <!-- 中间：事件分类 -->
      <view class="category-dropdown">
        <text class="category-icon">📅</text>
        <text class="category-text">全部事件</text>
      </view>
      
      <!-- 右边：调试信息和按钮 -->
      <view class="header-actions">
        <!-- 事件总数 -->
        <view class="debug-info">
          <text class="debug-text">{{ allEvents.length }}个事件</text>
        </view>
        
        <!-- 调试按钮 -->
        <view class="debug-btn" @click="debugCheck">
          <text class="debug-text">🔍</text>
        </view>
        
        <!-- 强制刷新按钮 -->
        <view class="debug-btn" @click="forceRefresh">
          <text class="debug-text">🔄</text>
        </view>
        
        <!-- 返回按钮 -->
        <view class="debug-btn" @click="goBack">
          <text class="debug-text">←</text>
        </view>
      </view>
    </view>

    <!-- 日历视图 -->
    <view class="calendar-view">
      <!-- 星期标题 -->
      <view class="week-header">
        <text v-for="day in weekDays" :key="day" class="week-day">{{ day }}</text>
      </view>
      
      <!-- 日历日期 -->
      <view class="calendar-grid">
        <view 
          v-for="date in calendarDates" 
          :key="date.dateStr"
          class="calendar-date"
          :class="{
            'is-today': date.isToday,
            'is-selected': date.isSelected,
            'has-events': date.events.length > 0,
            'other-month': date.isOtherMonth
          }"
          @click="selectDate(date)"
        >
          <text class="date-number">{{ date.number }}</text>
          <view v-if="date.events.length > 0" class="event-dots">
            <text class="event-dot" v-for="n in Math.min(date.events.length, 3)" :key="n"></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 今日事件列表 -->
    <view class="today-events">
      <view class="section-header">
        <text class="section-title">{{ formatSelectedDate() }} 的事件</text>
        <view class="add-btn" @click="goToCreateEvent">
          <text class="add-icon">+</text>
        </view>
      </view>
      
      <view v-if="selectedDateEvents.length === 0" class="empty-state">
        <text class="empty-text">暂无事件</text>
        <text class="empty-hint">点击右上角 + 号添加事件</text>
      </view>
      
      <view v-else class="events-list">
        <view 
          v-for="event in selectedDateEvents" 
          :key="event.id"
          class="event-item"
          @click="viewEvent(event)"
        >
          <view class="event-time">
            <text class="time-text">{{ formatEventTime(event) }}</text>
          </view>
          <view class="event-content">
            <text class="event-title">{{ event.title }}</text>
            <text v-if="event.location" class="event-location">📍 {{ event.location }}</text>
          </view>
          <view class="event-category">
            <text class="category-icon">{{ event.categoryIcon || '📅' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 调试面板 -->
    <view v-if="showDebugPanel" class="debug-panel">
      <view class="debug-header" @click="toggleDebugPanel">
        <text class="debug-title">📊 调试信息</text>
        <text class="debug-close">✕</text>
      </view>
      <view class="debug-content">
        <view class="debug-item">
          <text class="debug-label">本地存储:</text>
          <text class="debug-value">{{ debugInfo.localStorage }}个事件</text>
        </view>
        <view class="debug-item">
          <text class="debug-label">内存数据:</text>
          <text class="debug-value">{{ debugInfo.memoryData }}个事件</text>
        </view>
        <view class="debug-item">
          <text class="debug-label">选中日期:</text>
          <text class="debug-value">{{ selectedDate }}</text>
        </view>
        <view class="debug-item">
          <text class="debug-label">选中日期事件:</text>
          <text class="debug-value">{{ selectedDateEvents.length }}个事件</text>
        </view>
        <view class="debug-actions">
          <view class="debug-action-btn" @click="refreshDebugInfo">🔄 刷新</view>
          <view class="debug-action-btn" @click="clearAllData">🗑️ 清空</view>
          <view class="debug-action-btn" @click="loadTestData">🧪 测试数据</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// 页面状态
const showDebugPanel = ref(false)
const selectedDate = ref(new Date())
const allEvents = ref([])

// 调试信息
const debugInfo = reactive({
  localStorage: 0,
  memoryData: 0
})

// 星期标题
const weekDays = ['一', '二', '三', '四', '五', '六', '日']

// 当前年月显示
const currentYearMonth = computed(() => {
  const year = selectedDate.value.getFullYear()
  const month = selectedDate.value.getMonth() + 1
  return `${year}年${month}月`
})

// 日历日期数据
const calendarDates = computed(() => {
  const year = selectedDate.value.getFullYear()
  const month = selectedDate.value.getMonth()
  
  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 获取第一天是星期几（1=周一）
  let firstDayWeek = firstDay.getDay()
  firstDayWeek = firstDayWeek === 0 ? 7 : firstDayWeek
  
  const dates = []
  const today = new Date()
  const todayStr = formatDate(today)
  const selectedStr = formatDate(selectedDate.value)
  
  // 添加上个月的日期（填充前面的空白）
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayWeek - 1; i > 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i + 1)
    const dateStr = formatDate(date)
    dates.push({
      number: prevMonthLastDay - i + 1,
      date: date,
      dateStr: dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedStr,
      isOtherMonth: true,
      events: getEventsForDate(dateStr)
    })
  }
  
  // 添加当月的日期
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    const dateStr = formatDate(date)
    dates.push({
      number: day,
      date: date,
      dateStr: dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedStr,
      isOtherMonth: false,
      events: getEventsForDate(dateStr)
    })
  }
  
  // 添加下个月的日期（填充后面的空白）
  const totalCells = Math.ceil(dates.length / 7) * 7
  let nextMonthDay = 1
  while (dates.length < totalCells) {
    const date = new Date(year, month + 1, nextMonthDay)
    const dateStr = formatDate(date)
    dates.push({
      number: nextMonthDay,
      date: date,
      dateStr: dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedStr,
      isOtherMonth: true,
      events: getEventsForDate(dateStr)
    })
    nextMonthDay++
  }
  
  return dates
})

// 选中日期的事件
const selectedDateEvents = computed(() => {
  const dateStr = formatDate(selectedDate.value)
  return getEventsForDate(dateStr)
})

// 页面生命周期
onMounted(() => {
  console.log('完整日程页面加载成功')
  loadEvents()
  refreshDebugInfo()
})

// 工具函数
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatSelectedDate = () => {
  const month = selectedDate.value.getMonth() + 1
  const day = selectedDate.value.getDate()
  return `${month}月${day}日`
}

const formatEventTime = (event) => {
  if (event.allDay) {
    return '全天'
  }
  if (event.startTime) {
    return event.startTime.substring(11, 16) // 提取 HH:MM
  }
  return '00:00'
}

const getEventsForDate = (dateStr) => {
  return allEvents.value.filter(event => event.date === dateStr)
}

// 数据操作
const loadEvents = () => {
  try {
    const localData = uni.getStorageSync('cici_events')
    if (localData) {
      allEvents.value = JSON.parse(localData)
      console.log(`从本地存储加载了 ${allEvents.value.length} 个事件`)
    } else {
      allEvents.value = []
      console.log('本地存储为空，初始化空事件列表')
    }
  } catch (error) {
    console.error('加载事件失败:', error)
    allEvents.value = []
  }
}

// 事件处理
const selectDate = (date) => {
  selectedDate.value = date.date
  console.log('选中日期:', formatDate(date.date))
}

const goToCreateEvent = () => {
  console.log('导航到创建事件页面')
  uni.navigateTo({
    url: '/pages/schedule/create-event'
  })
}

const viewEvent = (event) => {
  console.log('查看事件:', event.title)
  uni.showModal({
    title: event.title,
    content: `时间: ${formatEventTime(event)}\n地点: ${event.location || '无'}\n描述: ${event.description || '无'}`,
    showCancel: false
  })
}

const goBack = () => {
  uni.navigateBack()
}

// 调试功能
const debugCheck = () => {
  console.log('=== 完整日程页面调试检查 ===')
  console.log('本地存储数据:', uni.getStorageSync('cici_events'))
  console.log('内存事件数据:', allEvents.value)
  console.log('选中日期:', formatDate(selectedDate.value))
  console.log('选中日期事件:', selectedDateEvents.value)
  
  uni.showModal({
    title: '调试信息',
    content: `本地存储: ${debugInfo.localStorage}个事件\n内存数据: ${debugInfo.memoryData}个事件\n选中日期事件: ${selectedDateEvents.value.length}个`,
    showCancel: false
  })
}

const forceRefresh = () => {
  console.log('强制刷新数据')
  loadEvents()
  refreshDebugInfo()
  uni.showToast({
    title: '刷新完成',
    icon: 'success'
  })
}

const toggleDebugPanel = () => {
  showDebugPanel.value = !showDebugPanel.value
  if (showDebugPanel.value) {
    refreshDebugInfo()
  }
}

const refreshDebugInfo = () => {
  try {
    const localData = uni.getStorageSync('cici_events')
    debugInfo.localStorage = localData ? JSON.parse(localData).length : 0
    debugInfo.memoryData = allEvents.value.length
  } catch (error) {
    console.error('刷新调试信息失败:', error)
  }
}

const clearAllData = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有事件数据吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('cici_events')
        allEvents.value = []
        refreshDebugInfo()
        uni.showToast({
          title: '数据已清空',
          icon: 'success'
        })
      }
    }
  })
}

const loadTestData = () => {
  const testEvents = [
    {
      id: 'test1',
      title: '测试事件1',
      date: formatDate(new Date()),
      startTime: '09:00',
      location: '测试地点',
      description: '这是一个测试事件',
      categoryIcon: '💼'
    },
    {
      id: 'test2', 
      title: '测试事件2',
      date: formatDate(new Date()),
      startTime: '14:00',
      location: '另一个地点',
      description: '另一个测试事件',
      categoryIcon: '📅'
    }
  ]
  
  allEvents.value = testEvents
  try {
    uni.setStorageSync('cici_events', JSON.stringify(testEvents))
    refreshDebugInfo()
    uni.showToast({
      title: '测试数据已加载',
      icon: 'success'
    })
  } catch (error) {
    console.error('保存测试数据失败:', error)
  }
}
</script>

<style scoped>
.schedule-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.calendar-header-fixed {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.date-selector {
  flex: 1;
}

.date-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
}

.category-dropdown {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.category-icon {
  font-size: 28rpx;
}

.category-text {
  font-size: 28rpx;
  color: #34495e;
}

.header-actions {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
}

.debug-info {
  background: rgba(52, 152, 219, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

.debug-text {
  font-size: 20rpx;
  color: #3498db;
}

.debug-btn {
  width: 60rpx;
  height: 60rpx;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-view {
  padding: 32rpx;
}

.week-header {
  display: flex;
  margin-bottom: 24rpx;
}

.week-day {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #7f8c8d;
  font-weight: 500;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.calendar-date {
  width: 14.28%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  position: relative;
}

.calendar-date.is-today {
  background: #3498db;
}

.calendar-date.is-today .date-number {
  color: white;
  font-weight: 600;
}

.calendar-date.is-selected {
  background: #e74c3c;
}

.calendar-date.is-selected .date-number {
  color: white;
}

.calendar-date.has-events {
  background: rgba(46, 204, 113, 0.1);
}

.calendar-date.other-month .date-number {
  color: #bdc3c7;
}

.date-number {
  font-size: 28rpx;
  color: #2c3e50;
}

.event-dots {
  display: flex;
  gap: 4rpx;
  margin-top: 4rpx;
}

.event-dot {
  width: 8rpx;
  height: 8rpx;
  background: #2ecc71;
  border-radius: 50%;
  display: block;
}

.today-events {
  padding: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
}

.add-btn {
  width: 60rpx;
  height: 60rpx;
  background: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  color: white;
  font-size: 32rpx;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 80rpx 40rpx;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: #7f8c8d;
  margin-bottom: 16rpx;
}

.empty-hint {
  display: block;
  font-size: 24rpx;
  color: #bdc3c7;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.event-item {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.event-time {
  min-width: 100rpx;
}

.time-text {
  font-size: 24rpx;
  color: #3498db;
  font-weight: 600;
}

.event-content {
  flex: 1;
}

.event-title {
  display: block;
  font-size: 28rpx;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.event-location {
  display: block;
  font-size: 24rpx;
  color: #7f8c8d;
}

.event-category {
  min-width: 60rpx;
  text-align: center;
}

.category-icon {
  font-size: 32rpx;
}

/* 调试面板样式 */
.debug-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 32rpx 32rpx 0 0;
  z-index: 1000;
  max-height: 50vh;
  overflow: hidden;
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.debug-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 48rpx 24rpx;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.debug-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.debug-close {
  font-size: 28rpx;
  color: #666;
  padding: 8rpx;
}

.debug-content {
  padding: 24rpx 48rpx 48rpx;
  max-height: 40vh;
  overflow-y: auto;
}

.debug-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.debug-label {
  font-size: 28rpx;
  color: #666;
}

.debug-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.debug-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.debug-action-btn {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  color: white;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
}
</style>
