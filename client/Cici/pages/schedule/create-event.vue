<template>
  <view class="container">
    <view class="navbar">
      <view class="nav-btn" @click="goBack">
        <text class="nav-icon">&lt;</text>
      </view>
      <text>{{ isEditMode ? '编辑事件' : '新建事件' }}</text>
      <view class="nav-actions">
        <view class="nav-btn" @click="showTicketModal">
          <text class="nav-icon">🎫</text>
        </view>
        <view class="nav-btn" @click="saveEvent">
          <text class="nav-icon">✓</text>
        </view>
      </view>
    </view>
    
    <view class="form">
      <!-- 主题 -->
      <view class="form-item inline-item">
        <text class="item-label">主题：</text>
        <input class="item-input" v-model="eventForm.title" placeholder="请输入主题" />
      </view>
      
      <!-- 时间区间 -->
      <view class="form-item time-group">
        <!-- 开始时间 -->
        <view class="inline-item">
          <text class="item-label">开始：</text>
          <picker 
            class="item-picker start-time-picker"
            mode="multiSelector" 
            :range="[yearRange, monthRange, dayRange, hourRange, minuteRange]"
            :value="[startYearIndex, startMonthIndex, startDayIndex, startHourIndex, startMinuteIndex]"
            @change="onStartDateTimeChange"
            @columnchange="onStartColumnChange"
          >
            <view class="picker-display">
              <text>{{ formatStartDateTime() }}</text>
            </view>
          </picker>
          <view class="all-day-checkbox" @click="toggleAllDay">
            <view class="checkbox" :class="{ 'checked': eventForm.allDay }">
              <text v-if="eventForm.allDay">✓</text>
            </view>
            <text class="checkbox-label">全天</text>
          </view>
        </view>
        
        <!-- 结束时间 -->
        <view class="inline-item">
          <text class="item-label">结束：</text>
          <picker 
            class="item-picker end-time-picker"
            mode="multiSelector" 
            :range="[yearRange, monthRange, dayRange, hourRange, minuteRange]"
            :value="[endYearIndex, endMonthIndex, endDayIndex, endHourIndex, endMinuteIndex]"
            @change="onEndDateTimeChange"
            @columnchange="onEndColumnChange"
          >
            <view class="picker-display">
              <text>{{ formatEndDateTime() }}</text>
            </view>
          </picker>
          <picker 
            class="repeat-picker"
            :range="repeatOptions" 
            range-key="label"
            :value="eventForm.repeatIndex"
            @change="onRepeatChange"
          >
            <view class="repeat-display">
              <text class="repeat-label">{{ repeatOptions[eventForm.repeatIndex].label }}</text>
              <text class="repeat-icon">🔄</text>
            </view>
          </picker>
        </view>
      </view>
      
      <!-- 地点 -->
      <view class="form-item inline-item">
        <text class="item-label">地点：</text>
        <input class="item-input" v-model="eventForm.location" placeholder="请输入地点（可选）" />
      </view>
      
      <!-- 同伴 -->
      <view class="form-item inline-item">
        <text class="item-label">同伴：</text>
        <input class="item-input" v-model="eventForm.participants" placeholder="请输入同伴（可选）" />
      </view>
      
      <!-- 分类 -->
      <view class="form-item inline-item">
        <text class="item-label">分类：</text>
        <picker 
          class="item-picker"
          :range="eventCategories" 
          range-key="name"
          :value="validCategoryIndex"
          @change="onCategoryChange"
        >
          <view class="picker-display">
            <view class="category-display">
              <text class="category-icon">{{ eventCategories[validCategoryIndex]?.icon || '📋' }}</text>
              <text>{{ eventCategories[validCategoryIndex]?.name || '加载中...' }}</text>
            </view>
            <text>📋</text>
          </view>
        </picker>
      </view>
      
      <!-- 优先级 -->
      <view class="form-item">
        <text>优先级：</text>
        <view class="priority-grid">
          <view 
            v-for="priority in priorityMatrix"
            :key="priority.value"
            class="priority-item"
            :class="{ 'priority-selected': eventForm.priority === priority.value }"
            @click="selectPriority(priority.value)"
          >
            <text class="priority-icon">{{ priority.icon }}</text>
            <text class="priority-label">{{ priority.label }}</text>
            <text class="priority-desc">{{ priority.description }}</text>
          </view>
        </view>
      </view>
      
      <!-- 备注 -->
      <view class="form-item">
        <text>备注：</text>
        <textarea 
          v-model="eventForm.description"
          placeholder="请输入备注信息（可选）"
          maxlength="500"
          class="textarea-input"
        />
      </view>
      
      <!-- 时间提醒 -->
      <view class="form-item">
        <text>时间提醒：</text>
        <view class="reminder-grid">
          <view 
            v-for="option in timeReminderOptions"
            :key="option.value"
            class="reminder-item"
            :class="{ 'reminder-selected': eventForm.timeReminder === option.value }"
            @click="selectTimeReminder(option.value)"
          >
            <text>{{ option.label }}</text>
          </view>
        </view>
      </view>
      
      <!-- 地点提醒 -->
      <view class="form-item">
        <view class="location-reminder" @click="toggleLocationReminder">
          <view class="checkbox" :class="{ 'checked': eventForm.locationReminder }">
            <text v-if="eventForm.locationReminder">✓</text>
          </view>
          <view class="location-text">
            <text class="main-text">到达地点时提醒</text>
            <text class="sub-text">基于GPS定位，到达事件地点附近时推送提醒</text>
          </view>
        </view>
      </view>
      
      <!-- 删除按钮（编辑模式） -->
      <view v-if="isEditMode" class="form-item">
        <view class="delete-btn" @click="showDeleteConfirm">
          <text>删除事件</text>
        </view>
      </view>
    </view>
  </view>
  
  <!-- 购票弹窗 -->
  <view v-if="showTicketPage" class="ticket-modal-overlay" @click="hideTicketModal">
    <view class="ticket-modal" @click.stop>
      <view class="ticket-header">
        <text class="ticket-title">购票信息</text>
        <view class="close-btn" @click="hideTicketModal">
          <text>×</text>
        </view>
      </view>
      <view class="ticket-content">
        <view class="ticket-item">
          <text class="ticket-label">活动名称：</text>
          <text class="ticket-value">{{ eventForm.title || '请先填写主题' }}</text>
        </view>
        <view class="ticket-item">
          <text class="ticket-label">活动时间：</text>
          <text class="ticket-value">{{ formatStartDateTime() }}</text>
        </view>
        <view class="ticket-item">
          <text class="ticket-label">活动地点：</text>
          <text class="ticket-value">{{ eventForm.location || '请先填写地点' }}</text>
        </view>
        <view class="ticket-item">
          <text class="ticket-label">票价：</text>
          <input class="ticket-input" v-model="ticketPrice" placeholder="请输入票价" type="number" />
        </view>
        <view class="ticket-item">
          <text class="ticket-label">购买数量：</text>
          <view class="quantity-control">
            <view class="quantity-btn" @click="decreaseQuantity">-</view>
            <text class="quantity-text">{{ ticketQuantity }}</text>
            <view class="quantity-btn" @click="increaseQuantity">+</view>
          </view>
        </view>
        <view class="ticket-item">
          <text class="ticket-label">总计：</text>
          <text class="ticket-total">¥{{ totalAmount }}</text>
        </view>
      </view>
      <view class="ticket-actions">
        <view class="ticket-btn cancel-ticket-btn" @click="hideTicketModal">
          <text>取消</text>
        </view>
        <view class="ticket-btn confirm-ticket-btn" @click="purchaseTicket">
          <text>确认购买</text>
        </view>
      </view>
    </view>
  </view>
  
  <!-- 删除确认弹窗 -->
  <view v-if="showDeleteModal" class="delete-modal-overlay" @click="hideDeleteConfirm">
    <view class="delete-modal" @click.stop>
      <view class="modal-header">
        <text class="modal-title">确认删除</text>
      </view>
      <view class="modal-content">
        <text class="modal-text">确定要删除这个事件吗？此操作无法撤销。</text>
      </view>
      <view class="modal-actions">
        <view class="modal-btn cancel-btn" @click="hideDeleteConfirm">
          <text>取消</text>
        </view>
        <view class="modal-btn confirm-btn" @click="deleteEvent">
          <text>删除</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useEventStore } from '@/src/store/modules/event'
import { 
  loadEventCategories, 
  getEventCategoryById,
  priorityMatrix
} from '../../src/utils/eventCategoryDatabase.js'

// 获取事件存储
const eventStore = useEventStore()

const eventForm = reactive({
  title: '',
  date: '',
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  participants: '',
  categoryIndex: 0, // 默认第一个分类
  priority: 'important-not-urgent', // 艾森豪威尔矩阵优先级
  description: '',
  timeReminder: 15, // 默认提前15分钟提醒
  locationReminder: false, // 地点提醒
  allDay: false, // 全天事件
  repeatIndex: 0 // 重复选项，默认不重复
})

const yearRange = ref([])
const monthRange = ref([])
const dayRange = ref([])
const hourRange = ref([])
const minuteRange = ref([])

const startYearIndex = ref(0)
const startMonthIndex = ref(0)
const startDayIndex = ref(0)
const startHourIndex = ref(9)
const startMinuteIndex = ref(0)

const endYearIndex = ref(0)
const endMonthIndex = ref(0)
const endDayIndex = ref(0)
const endHourIndex = ref(10)
const endMinuteIndex = ref(0)

// 基础数据
const eventCategories = ref([])

// 确保分类索引有效的计算属性
const validCategoryIndex = computed(() => {
  if (eventCategories.value.length === 0) return 0
  if (eventForm.categoryIndex >= eventCategories.value.length) return 0
  return eventForm.categoryIndex
})

// 监听分类数据变化
watch(eventCategories, (newCategories) => {
  console.log('监听到分类数据变化:', newCategories.length, '个分类')
  if (newCategories.length > 0) {
    const lastCategory = newCategories[newCategories.length - 1]
    if (lastCategory.isAddNew) {
      console.log('确认新增分类选项存在:', lastCategory.name)
    }
  }
}, { immediate: true })

// 加载事件分类数据
const loadEventCategoriesData = () => {
  try {
    console.log('创建事件页面 - 开始加载事件分类数据...')
    
    // 如果uni对象不存在，使用默认数据
    if (typeof uni === 'undefined') {
      console.warn('uni对象不存在，使用默认分类数据')
      eventCategories.value = [
        { id: 'category_meeting', name: '会议', icon: '📋', color: '#FF9500', isActive: true },
        { id: 'category_work', name: '工作', icon: '💼', color: '#007AFF', isActive: true },
        { id: 'category_personal', name: '个人', icon: '👤', color: '#34C759', isActive: true },
        { id: 'category_study', name: '学习', icon: '📚', color: '#AF52DE', isActive: true },
        { id: 'category_sport', name: '运动', icon: '⚽', color: '#FF3B30', isActive: true },
        { id: 'category_entertainment', name: '娱乐', icon: '🎮', color: '#FF2D92', isActive: true }
      ]
    } else {
      // 从数据库加载事件分类
      const categories = loadEventCategories()
      // 只显示激活的分类
      eventCategories.value = categories.filter(cat => cat.isActive)
      console.log(`从数据库加载了 ${eventCategories.value.length} 个激活的事件分类`)
      console.log('分类数据:', eventCategories.value)
    }
    
    // 在最后添加"新增分类"选项
    const newCategoryOption = {
      id: 'add_new_category',
      name: '+ 新增分类',
      icon: '➕',
      color: '#8E8E93',
      isActive: true,
      isAddNew: true // 标记为新增选项
    }
    
    eventCategories.value.push(newCategoryOption)
    
    console.log('分类数据加载完成，包含新增分类选项:', eventCategories.value.length, '个分类')
    console.log('最后一个分类项:', eventCategories.value[eventCategories.value.length - 1])
    
    // 强制触发响应式更新
    eventCategories.value = [...eventCategories.value]
    
  } catch (error) {
    console.error('加载事件分类失败:', error)
    // 发生错误时使用默认数据
    eventCategories.value = [
      { id: 'category_work', name: '工作', icon: '💼', color: '#007AFF', isActive: true },
      { id: 'category_personal', name: '个人', icon: '👤', color: '#34C759', isActive: true },
      { id: 'add_new_category', name: '+ 新增分类', icon: '➕', color: '#8E8E93', isActive: true, isAddNew: true }
    ]
    console.log('使用默认分类数据（包含新增分类选项）:', eventCategories.value.length, '个分类')
  }
}

// 优先级矩阵已从数据库工具文件导入，这里不再重复定义

const timeReminderOptions = [
  { label: '不提醒', value: 0 },
  { label: '准时提醒', value: 0 },
  { label: '提前5分钟', value: 5 },
  { label: '提前15分钟', value: 15 },
  { label: '提前30分钟', value: 30 },
  { label: '提前1小时', value: 60 },
  { label: '提前1天', value: 1440 }
]

const repeatOptions = [
  { label: '不重复', value: 'none' },
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '每年', value: 'yearly' },
  { label: '自定义', value: 'custom' }
]

// UI状态
const isEditMode = ref(false)
const eventId = ref(null)
const showDeleteModal = ref(false)
const showTicketPage = ref(false)
const ticketPrice = ref('')
const ticketQuantity = ref(1)

const initDateTimeRanges = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 3; i++) {
    years.push(`${currentYear + i}年`)
  }
  yearRange.value = years
  
  const months = []
  for (let i = 1; i <= 12; i++) {
    months.push(`${i}月`)
  }
  monthRange.value = months
  
  const hours = []
  for (let i = 0; i < 24; i++) {
    hours.push(`${String(i).padStart(2, '0')}时`)
  }
  hourRange.value = hours
  
  const minutes = []
  for (let i = 0; i < 60; i += 5) {
    minutes.push(`${String(i).padStart(2, '0')}分`)
  }
  minuteRange.value = minutes
  
  updateDayRange(currentYear, new Date().getMonth() + 1)
}

const updateDayRange = (year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const days = []
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(`${i}日`)
  }
  dayRange.value = days
}

const formatStartDateTime = () => {
  if (startYearIndex.value === -1) return '请选择开始时间'
  
  const year = yearRange.value[startYearIndex.value].replace('年', '')
  const month = monthRange.value[startMonthIndex.value].replace('月', '')
  const day = dayRange.value[startDayIndex.value].replace('日', '')
  const hour = hourRange.value[startHourIndex.value].replace('时', '')
  const minute = minuteRange.value[startMinuteIndex.value].replace('分', '')
  
  return `${year}/${month}/${day} ${hour}:${minute}`
}

const formatEndDateTime = () => {
  if (endYearIndex.value === -1) return '请选择结束时间'
  
  const year = yearRange.value[endYearIndex.value].replace('年', '')
  const month = monthRange.value[endMonthIndex.value].replace('月', '')
  const day = dayRange.value[endDayIndex.value].replace('日', '')
  const hour = hourRange.value[endHourIndex.value].replace('时', '')
  const minute = minuteRange.value[endMinuteIndex.value].replace('分', '')
  
  return `${year}/${month}/${day} ${hour}:${minute}`
}

const onStartColumnChange = (e) => {
  const { column, value } = e.detail
  
  if (column === 0 || column === 1) {
    const yearIndex = column === 0 ? value : startYearIndex.value
    const monthIndex = column === 1 ? value : startMonthIndex.value
    
    const currentYear = new Date().getFullYear()
    const year = currentYear + yearIndex
    const month = monthIndex + 1
    
    updateDayRange(year, month)
    
    if (startDayIndex.value >= dayRange.value.length) {
      startDayIndex.value = dayRange.value.length - 1
    }
  }
}

const onEndColumnChange = (e) => {
  const { column, value } = e.detail
  
  if (column === 0 || column === 1) {
    const yearIndex = column === 0 ? value : endYearIndex.value
    const monthIndex = column === 1 ? value : endMonthIndex.value
    
    const currentYear = new Date().getFullYear()
    const year = currentYear + yearIndex
    const month = monthIndex + 1
    
    updateDayRange(year, month)
    
    if (endDayIndex.value >= dayRange.value.length) {
      endDayIndex.value = dayRange.value.length - 1
    }
  }
}

const onStartDateTimeChange = (e) => {
  const [yearIdx, monthIdx, dayIdx, hourIdx, minuteIdx] = e.detail.value
  
  startYearIndex.value = yearIdx
  startMonthIndex.value = monthIdx
  startDayIndex.value = dayIdx
  startHourIndex.value = hourIdx
  startMinuteIndex.value = minuteIdx
  
  const currentYear = new Date().getFullYear()
  const year = currentYear + yearIdx
  const month = monthIdx + 1
  const day = dayIdx + 1
  const hour = hourIdx
  const minute = minuteIdx * 5
  
  eventForm.date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  eventForm.startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  
  let newEndHour = hourIdx + 1
  if (newEndHour >= 24) newEndHour = 0
  
  endHourIndex.value = newEndHour
  endMinuteIndex.value = minuteIdx
  
  const endMinute = minuteIdx * 5
  eventForm.endTime = `${String(newEndHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
}

const onEndDateTimeChange = (e) => {
  const [yearIdx, monthIdx, dayIdx, hourIdx, minuteIdx] = e.detail.value
  
  endYearIndex.value = yearIdx
  endMonthIndex.value = monthIdx
  endDayIndex.value = dayIdx
  endHourIndex.value = hourIdx
  endMinuteIndex.value = minuteIdx
  
  const hour = hourIdx
  const minute = minuteIdx * 5
  
  eventForm.endTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const onCategoryChange = (e) => {
  const selectedIndex = e.detail.value
  const selectedCategory = eventCategories.value[selectedIndex]
  
  // 如果选择的是"新增分类"选项
  if (selectedCategory && selectedCategory.isAddNew) {
    console.log('用户选择了新增分类选项')
    
    // 保存当前表单状态到本地存储
    const formState = {
      ...eventForm,
      currentPage: 'create-event',
      returnTo: 'create-event'
    }
    
    try {
      if (typeof uni !== 'undefined') {
        uni.setStorageSync('temp_event_form', formState)
      }
    } catch (error) {
      console.error('保存表单状态失败:', error)
    }
    
    // 跳转到分类管理页面
    uni.navigateTo({
      url: '/pages/schedule/category-management?from=create-event'
    })
    
    return
  }
  
  // 正常的分类选择
  eventForm.categoryIndex = selectedIndex
}

const onRepeatChange = (e) => {
  eventForm.repeatIndex = e.detail.value
}

const selectPriority = (priority) => {
  eventForm.priority = priority
}

const selectTimeReminder = (value) => {
  eventForm.timeReminder = value
}

const toggleLocationReminder = () => {
  eventForm.locationReminder = !eventForm.locationReminder
}

const toggleAllDay = () => {
  eventForm.allDay = !eventForm.allDay
}

const showDeleteConfirm = () => {
  showDeleteModal.value = true
}

const hideDeleteConfirm = () => {
  showDeleteModal.value = false
}

const showTicketModal = () => {
  showTicketPage.value = true
}

const hideTicketModal = () => {
  showTicketPage.value = false
}

const increaseQuantity = () => {
  ticketQuantity.value++
}

const decreaseQuantity = () => {
  if (ticketQuantity.value > 1) {
    ticketQuantity.value--
  }
}

const totalAmount = computed(() => {
  const price = parseFloat(ticketPrice.value) || 0
  return (price * ticketQuantity.value).toFixed(2)
})

const purchaseTicket = () => {
  if (!ticketPrice.value) {
    uni.showToast({
      title: '请输入票价',
      icon: 'none'
    })
    return
  }
  
  uni.showToast({
    title: `购买成功！总计：¥${totalAmount.value}`,
    icon: 'success'
  })
  
  hideTicketModal()
}

const validateForm = () => {
  if (!eventForm.title.trim()) {
    uni.showToast({
      title: '请输入主题',
      icon: 'none'
    })
    return false
  }
  
  if (startYearIndex.value === -1 || startMonthIndex.value === -1 || 
      startDayIndex.value === -1 || startHourIndex.value === -1 || startMinuteIndex.value === -1) {
    uni.showToast({
      title: '请选择开始时间',
      icon: 'none'
    })
    return false
  }
  
  if (endYearIndex.value === -1 || endMonthIndex.value === -1 || 
      endDayIndex.value === -1 || endHourIndex.value === -1 || endMinuteIndex.value === -1) {
    uni.showToast({
      title: '请选择结束时间',
      icon: 'none'
    })
    return false
  }
  
  // 验证结束时间必须晚于开始时间
  const currentYear = new Date().getFullYear()
  
  const startYear = currentYear + startYearIndex.value
  const startMonth = startMonthIndex.value + 1
  const startDay = startDayIndex.value + 1
  const startHour = startHourIndex.value
  const startMinute = startMinuteIndex.value * 5
  
  const endYear = currentYear + endYearIndex.value
  const endMonth = endMonthIndex.value + 1
  const endDay = endDayIndex.value + 1
  const endHour = endHourIndex.value
  const endMinute = endMinuteIndex.value * 5
  
  const startDateTime = new Date(startYear, startMonth - 1, startDay, startHour, startMinute)
  const endDateTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute)
  
  if (endDateTime <= startDateTime) {
    uni.showToast({
      title: '结束时间必须晚于开始时间',
      icon: 'none'
    })
    return false
  }
  
  return true
}

const goBack = () => {
  uni.navigateBack()
}

const saveEvent = async () => {
  if (!validateForm()) {
    return
  }
  
  try {
    // 从索引获取日期和时间
    const currentYear = new Date().getFullYear()
    
    const startYear = currentYear + startYearIndex.value
    const startMonth = startMonthIndex.value + 1
    const startDay = startDayIndex.value + 1
    const startHour = startHourIndex.value
    const startMinute = startMinuteIndex.value * 5
    
    const endYear = currentYear + endYearIndex.value
    const endMonth = endMonthIndex.value + 1
    const endDay = endDayIndex.value + 1
    const endHour = endHourIndex.value
    const endMinute = endMinuteIndex.value * 5
    
    const selectedDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`
    const selectedStartTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`
    const selectedEndTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
    
    // 构造事件数据
    const selectedPriority = priorityMatrix.find(p => p.value === eventForm.priority)
    const selectedCategory = eventCategories.value[eventForm.categoryIndex]
    const eventData = {
      title: eventForm.title.trim(),
      description: eventForm.description.trim(),
      startTime: `${selectedDate} ${selectedStartTime}:00`,
      endTime: `${selectedDate} ${selectedEndTime}:00`,
      location: eventForm.location.trim(),
      participants: eventForm.participants.trim(),
      categoryId: selectedCategory.id,
      category: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      priority: eventForm.priority,
      priorityLabel: selectedPriority.label,
      color: selectedPriority.color,
      allDay: eventForm.allDay,
      reminder: eventForm.timeReminder > 0,
      reminderMinutes: eventForm.timeReminder,
      repeat: repeatOptions[eventForm.repeatIndex].value,
      // 为了兼容显示，保留date字段
      date: selectedDate
    }
    
    console.log('保存事件到数据库:', eventData)
    
    if (isEditMode.value) {
      // 更新现有事件
      await eventStore.updateEvent(eventId.value, eventData)
      uni.showToast({
        title: '事件已更新',
        icon: 'success'
      })
    } else {
      // 添加新事件
      await eventStore.addEvent(eventData)
      uni.showToast({
        title: '事件已保存',
        icon: 'success'
      })
    }
    
    // 延迟返回，让用户看到提示
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    
  } catch (error) {
    console.error('保存事件失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
  }
}

const deleteEvent = async () => {
  if (!isEditMode.value) return
  
  try {
    await eventStore.deleteEvent(eventId.value)
    
    uni.showToast({
      title: '事件已删除',
      icon: 'success'
    })
    
    hideDeleteConfirm()
    
    // 延迟返回
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    
  } catch (error) {
    console.error('删除事件失败:', error)
    uni.showToast({
      title: '删除失败',
      icon: 'error'
    })
  }
}

const loadEventData = async (id) => {
  try {
    // 从事件存储中获取事件数据
    const event = await eventStore.getEventById(id)
    
    if (!event) {
      console.error('事件不存在:', id)
      return
    }
  
    eventForm.title = event.title
    eventForm.location = event.location || ''
    eventForm.participants = event.participants || ''
    eventForm.description = event.description || ''
    
    // 使用categoryId进行查找，如果没有则使用category名称作为备用
    let categoryIndex = 0
    if (event.categoryId) {
      categoryIndex = eventCategories.value.findIndex(cat => cat.id === event.categoryId)
    } else if (event.category) {
      categoryIndex = eventCategories.value.findIndex(cat => cat.name === event.category)
    }
    eventForm.categoryIndex = categoryIndex >= 0 ? categoryIndex : 0
    
    eventForm.priority = event.priority || 'important-not-urgent'
    eventForm.timeReminder = event.reminderMinutes || 15
    eventForm.locationReminder = event.locationReminder || false
    eventForm.allDay = event.allDay || false
    
    // 解析日期和时间
    if (event.startTime) {
      const startDateTime = new Date(event.startTime)
      const currentYear = new Date().getFullYear()
      
      // 年份索引
      startYearIndex.value = startDateTime.getFullYear() - currentYear
      endYearIndex.value = startYearIndex.value
      
      // 月份索引（从0开始）
      startMonthIndex.value = startDateTime.getMonth()
      endMonthIndex.value = startMonthIndex.value
      
      // 日期索引（从0开始）
      startDayIndex.value = startDateTime.getDate() - 1
      endDayIndex.value = startDayIndex.value
      
      // 时间索引
      startHourIndex.value = startDateTime.getHours()
      startMinuteIndex.value = Math.floor(startDateTime.getMinutes() / 5)
      
      // 更新天数范围
      updateDayRange(startDateTime.getFullYear(), startDateTime.getMonth() + 1)
    }
    
    // 解析结束时间
    if (event.endTime) {
      const endDateTime = new Date(event.endTime)
      endHourIndex.value = endDateTime.getHours()
      endMinuteIndex.value = Math.floor(endDateTime.getMinutes() / 5)
    } else {
      // 默认结束时间比开始时间晚1小时
      endHourIndex.value = Math.min(startHourIndex.value + 1, 23)
      endMinuteIndex.value = startMinuteIndex.value
    }
    
  } catch (error) {
    console.error('加载事件数据失败:', error)
    uni.showToast({
      title: '加载事件失败',
      icon: 'error'
    })
  }
}

onMounted(async () => {
  console.log('创建事件页面 onMounted 开始')
  
  // 首先加载事件分类数据
  loadEventCategoriesData()
  
  // 等待分类数据加载完成后再继续
  await new Promise(resolve => setTimeout(resolve, 100))
  
  console.log('分类数据加载完成后的状态:', eventCategories.value.length, '个分类')
  
  // 初始化日期时间选择器
  initDateTimeRanges()
  
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  
  // 检查是否是编辑模式
  if (options.id) {
    isEditMode.value = true
    eventId.value = parseInt(options.id)
    loadEventData(options.id)
  } else if (options.date) {
    // 新建模式，设置默认日期
    eventForm.date = options.date
    // 根据传入的日期设置索引
    const targetDate = new Date(options.date)
    const currentYear = new Date().getFullYear()
    
    startYearIndex.value = targetDate.getFullYear() - currentYear
    endYearIndex.value = startYearIndex.value
    startMonthIndex.value = targetDate.getMonth()
    endMonthIndex.value = startMonthIndex.value
    startDayIndex.value = targetDate.getDate() - 1
    endDayIndex.value = startDayIndex.value
    
    // 更新天数范围
    updateDayRange(targetDate.getFullYear(), targetDate.getMonth() + 1)
  } else {
    // 设置默认日期为今天
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    eventForm.date = `${year}-${month}-${day}`
    
    // 设置默认索引为今天
    startYearIndex.value = 0  // 当前年
    endYearIndex.value = 0
    startMonthIndex.value = today.getMonth()  // 当前月
    endMonthIndex.value = today.getMonth()
    startDayIndex.value = today.getDate() - 1  // 当前日
    endDayIndex.value = today.getDate() - 1
  }
})

// 页面显示时检查是否从分类管理页面返回
onShow(() => {
  console.log('创建事件页面显示')
  
  // 检查是否从分类管理页面返回
  try {
    if (typeof uni !== 'undefined') {
      const tempFormState = uni.getStorageSync('temp_event_form')
      if (tempFormState && tempFormState.returnTo === 'create-event') {
        console.log('从分类管理页面返回，恢复表单状态')
        
        // 重新加载分类数据（可能有新增的分类）
        loadEventCategoriesData()
        
        console.log('重新加载分类数据完成，当前分类数量:', eventCategories.value.length)
        
        // 等待分类数据加载完成后恢复表单状态
        setTimeout(() => {
          // 如果有新增的分类，尝试选择最新的分类
          const lastAddedCategory = uni.getStorageSync('last_added_category')
          if (lastAddedCategory) {
            const newCategoryIndex = eventCategories.value.findIndex(cat => cat.id === lastAddedCategory.id)
            if (newCategoryIndex >= 0) {
              eventForm.categoryIndex = newCategoryIndex
              console.log('自动选择新增的分类:', lastAddedCategory.name)
            }
            // 清理临时数据
            uni.removeStorageSync('last_added_category')
          } else {
            // 恢复原来的分类选择（如果没有新增分类的话）
            const originalCategoryIndex = tempFormState.categoryIndex
            // 确保索引有效（排除新增分类选项）
            if (originalCategoryIndex >= 0 && originalCategoryIndex < eventCategories.value.length - 1) {
              eventForm.categoryIndex = originalCategoryIndex
            }
          }
        }, 200)
        
        // 清理临时表单状态
        uni.removeStorageSync('temp_event_form')
      }
    }
  } catch (error) {
    console.error('处理页面返回状态失败:', error)
  }
})
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  text {
    color: white;
    font-size: 32rpx;
    font-weight: 500;
  }
  
  .nav-actions {
    display: flex;
    gap: 16rpx;
  }
  
  .nav-btn {
    width: 72rpx;
    height: 72rpx;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    
    &:active {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(0.95);
    }
    
    .nav-icon {
      color: white;
      font-size: 36rpx;
      font-weight: bold;
      line-height: 1;
    }
  }
}

.form {
  margin-top: 120rpx; // 为固定导航栏留出空间
  
  .form-item {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16rpx;
    padding: 30rpx;
    
    &.inline-item {
      display: flex;
      align-items: center;
      justify-content: flex-start; // 改为左对齐
      
      .item-label {
        color: white;
        font-size: 28rpx;
        font-weight: 500;
        flex-shrink: 0;
        margin-right: 12rpx; // 减少右边距
        min-width: 100rpx; // 减少标签最小宽度
        width: 100rpx; // 固定标签宽度
      }
      
      .item-input {
        flex: 1;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12rpx;
        padding: 20rpx 24rpx;
        color: white;
        font-size: 28rpx;
        box-sizing: border-box;
        height: 88rpx; // 设置固定高度与选择器一致
        line-height: 48rpx; // 设置行高使文字居中
        min-width: 0; // 允许缩小
        
        // 响应式宽度控制
        @media (max-width: 480rpx) {
          padding: 16rpx 20rpx;
          font-size: 26rpx;
          height: 80rpx;
          line-height: 48rpx;
        }
        
        @media (min-width: 768rpx) {
          height: 92rpx;
          line-height: 52rpx;
        }
        
        &::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
      }
      
      .item-picker {
        flex: 1;
        min-width: 0; // 允许缩小
        
        // 响应式宽度控制
        @media (min-width: 768rpx) {
          // 移除最大宽度限制，让选择器占据更多空间
        }
      }
    }
    
    &.time-group {
      // 时间组特殊样式
      .inline-item {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 20rpx; // 时间项之间的间距
        
        &:last-child {
          margin-bottom: 0; // 最后一项不需要下边距
        }
        
        .item-label {
          color: white;
          font-size: 28rpx;
          font-weight: 500;
          flex-shrink: 0;
          margin-right: 12rpx;
          min-width: 100rpx;
          width: 100rpx;
        }
        
        .item-picker {
          flex: 1;
          min-width: 0;
          
          &.start-time-picker {
            flex: 0 0 60%; // 缩短开始时间选择器宽度
            margin-right: 16rpx;
          }
          
          &.end-time-picker {
            flex: 0 0 60%; // 缩短结束时间选择器宽度
            margin-right: 16rpx;
          }
        }
        
        .repeat-picker {
          flex-shrink: 0;
          min-width: 120rpx;
          
          .repeat-display {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12rpx;
            padding: 20rpx 16rpx;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-sizing: border-box;
            height: 88rpx;
            
            @media (max-width: 480rpx) {
              padding: 16rpx 12rpx;
              height: 80rpx;
            }
            
            @media (min-width: 768rpx) {
              height: 92rpx;
              padding: 20rpx 18rpx;
            }
            
            .repeat-label {
              color: white;
              font-size: 26rpx;
              font-weight: 500;
              
              @media (max-width: 480rpx) {
                font-size: 24rpx;
              }
              
              @media (min-width: 768rpx) {
                font-size: 28rpx;
              }
            }
            
            .repeat-icon {
              font-size: 20rpx;
              margin-left: 8rpx;
              
              @media (max-width: 480rpx) {
                font-size: 18rpx;
                margin-left: 6rpx;
              }
              
              @media (min-width: 768rpx) {
                font-size: 22rpx;
                margin-left: 10rpx;
              }
            }
          }
        }
        
        // 重复选择器下拉选项样式
        .repeat-picker ::v-deep .uni-picker-item {
          color: white !important;
          background: #333 !important;
        }
        
        .all-day-checkbox {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          
          .checkbox {
            width: 32rpx;
            height: 32rpx;
            border: 2px solid rgba(255, 255, 255, 0.6);
            border-radius: 6rpx;
            margin-right: 12rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            
            &.checked {
              background: rgba(76, 175, 80, 0.8);
              border-color: rgba(76, 175, 80, 1);
            }
            
            text {
              color: white;
              font-size: 20rpx;
              font-weight: bold;
            }
          }
          
          .checkbox-label {
            color: white;
            font-size: 26rpx;
            font-weight: 500;
          }
        }
      }
    }
    margin-bottom: 30rpx;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    // 保持原有的垂直布局样式用于非inline的项目
    &:not(.inline-item) {
      text {
        color: white;
        font-size: 32rpx;
        margin-bottom: 20rpx;
        display: block;
      }
      
      input {
        width: 100%;
        max-width: calc(100vw - 100rpx); // 响应式最大宽度
        padding: 20rpx;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12rpx;
        color: white;
        font-size: 30rpx;
        box-sizing: border-box;
        
        // 响应式宽度控制
        @media (max-width: 480rpx) {
          max-width: calc(100vw - 60rpx);
          padding: 16rpx;
          font-size: 28rpx;
        }
        
        @media (min-width: 480rpx) and (max-width: 768rpx) {
          max-width: calc(100vw - 80rpx);
        }
        
        @media (min-width: 768rpx) {
          max-width: min(calc(100vw - 120rpx), 75vw);
        }
      }
    }
    
    .textarea-input {
      width: 100%;
      max-width: calc(100vw - 100rpx); // 视窗宽度减去左右边距
      padding: 20rpx;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12rpx;
      color: white;
      font-size: 30rpx;
      min-height: 120rpx;
      box-sizing: border-box;
      
      // 响应式宽度控制
      @media (max-width: 480rpx) {
        // 小屏幕：使用较小的最大宽度
        max-width: calc(100vw - 60rpx);
      }
      
      @media (min-width: 480rpx) and (max-width: 768rpx) {
        // 中等屏幕：适中的最大宽度
        max-width: calc(100vw - 80rpx);
      }
      
      @media (min-width: 768rpx) {
        // 大屏幕：限制最大宽度避免过宽
        max-width: min(calc(100vw - 120rpx), 80vw);
      }
    }
    
    .category-display {
      display: flex;
      align-items: center;
      
      .category-icon {
        margin-right: 16rpx;
        font-size: 36rpx;
      }
    }
    
    .priority-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20rpx;
      margin-top: 20rpx;
      max-width: calc(100vw - 100rpx);
      
      // 响应式网格布局
      @media (max-width: 480rpx) {
        gap: 16rpx;
        max-width: calc(100vw - 60rpx);
      }
      
      @media (min-width: 768rpx) {
        grid-template-columns: repeat(auto-fit, minmax(200rpx, 1fr));
        max-width: min(calc(100vw - 120rpx), 80vw);
        gap: 24rpx;
      }
    }
    
    .priority-item {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12rpx;
      padding: 20rpx;
      text-align: center;
      transition: all 0.3s ease;
      box-sizing: border-box;
      
      // 响应式内边距和字体
      @media (max-width: 480rpx) {
        padding: 16rpx;
      }
      
      @media (min-width: 768rpx) {
        padding: 24rpx;
      }
      
      &.priority-selected {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.4);
        transform: scale(1.02);
      }
      
      .priority-icon {
        font-size: 32rpx;
        display: block;
        margin-bottom: 8rpx;
        
        @media (max-width: 480rpx) {
          font-size: 28rpx;
          margin-bottom: 6rpx;
        }
        
        @media (min-width: 768rpx) {
          font-size: 36rpx;
          margin-bottom: 10rpx;
        }
      }
      
      .priority-label {
        color: white;
        font-size: 26rpx;
        font-weight: 600;
        display: block;
        margin-bottom: 4rpx;
        
        @media (max-width: 480rpx) {
          font-size: 24rpx;
        }
        
        @media (min-width: 768rpx) {
          font-size: 28rpx;
          margin-bottom: 6rpx;
        }
      }
      
      .priority-desc {
        color: rgba(255, 255, 255, 0.8);
        font-size: 22rpx;
        display: block;
        
        @media (max-width: 480rpx) {
          font-size: 20rpx;
        }
        
        @media (min-width: 768rpx) {
          font-size: 24rpx;
        }
      }
    }
    
    .reminder-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16rpx;
      margin-top: 20rpx;
      max-width: calc(100vw - 100rpx);
      
      // 响应式网格布局
      @media (max-width: 480rpx) {
        gap: 12rpx;
        max-width: calc(100vw - 60rpx);
      }
      
      @media (min-width: 768rpx) {
        grid-template-columns: repeat(auto-fit, minmax(160rpx, 1fr));
        max-width: min(calc(100vw - 120rpx), 80vw);
        gap: 20rpx;
      }
    }
    
    .reminder-item {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12rpx;
      padding: 16rpx 20rpx;
      text-align: center;
      transition: all 0.3s ease;
      box-sizing: border-box;
      
      // 响应式内边距
      @media (max-width: 480rpx) {
        padding: 12rpx 16rpx;
      }
      
      @media (min-width: 768rpx) {
        padding: 20rpx 24rpx;
      }
      
      &.reminder-selected {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.4);
      }
      
      text {
        color: white;
        font-size: 26rpx;
        
        @media (max-width: 480rpx) {
          font-size: 24rpx;
        }
        
        @media (min-width: 768rpx) {
          font-size: 28rpx;
        }
      }
    }
    
    .location-reminder {
      display: flex;
      align-items: flex-start;
      margin-top: 20rpx;
      max-width: calc(100vw - 100rpx);
      
      // 响应式布局
      @media (max-width: 480rpx) {
        max-width: calc(100vw - 60rpx);
      }
      
      @media (min-width: 768rpx) {
        max-width: min(calc(100vw - 120rpx), 80vw);
      }
      
      .checkbox {
        width: 36rpx;
        height: 36rpx;
        border: 2px solid rgba(255, 255, 255, 0.6);
        border-radius: 8rpx;
        margin-right: 20rpx;
        margin-top: 4rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        // 响应式复选框大小
        @media (max-width: 480rpx) {
          width: 32rpx;
          height: 32rpx;
          margin-right: 16rpx;
        }
        
        @media (min-width: 768rpx) {
          width: 40rpx;
          height: 40rpx;
          margin-right: 24rpx;
        }
        
        &.checked {
          background: rgba(76, 175, 80, 0.8);
          border-color: rgba(76, 175, 80, 1);
        }
        
        text {
          color: white;
          font-size: 24rpx;
          font-weight: bold;
          
          @media (max-width: 480rpx) {
            font-size: 22rpx;
          }
          
          @media (min-width: 768rpx) {
            font-size: 26rpx;
          }
        }
      }
      
      .location-text {
        flex: 1;
        
        .main-text {
          color: white;
          font-size: 30rpx;
          font-weight: 500;
          display: block;
          margin-bottom: 8rpx;
          
          @media (max-width: 480rpx) {
            font-size: 28rpx;
            margin-bottom: 6rpx;
          }
          
          @media (min-width: 768rpx) {
            font-size: 32rpx;
            margin-bottom: 10rpx;
          }
        }
        
        .sub-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 24rpx;
          line-height: 1.4;
          display: block;
          
          @media (max-width: 480rpx) {
            font-size: 22rpx;
            line-height: 1.3;
          }
          
          @media (min-width: 768rpx) {
            font-size: 26rpx;
            line-height: 1.5;
          }
        }
      }
    }
    
    .delete-btn {
      background: rgba(255, 107, 107, 0.2);
      border: 2px solid rgba(255, 107, 107, 0.4);
      border-radius: 12rpx;
      padding: 24rpx;
      text-align: center;
      margin-top: 20rpx;
      max-width: calc(100vw - 100rpx);
      box-sizing: border-box;
      
      // 响应式宽度和内边距
      @media (max-width: 480rpx) {
        padding: 20rpx;
        max-width: calc(100vw - 60rpx);
      }
      
      @media (min-width: 768rpx) {
        max-width: min(calc(100vw - 120rpx), 400rpx);
        padding: 28rpx;
        margin: 20rpx auto 0; // 居中显示
      }
      
      text {
        color: #ff6b6b;
        font-size: 30rpx;
        font-weight: 600;
        
        @media (max-width: 480rpx) {
          font-size: 28rpx;
        }
        
        @media (min-width: 768rpx) {
          font-size: 32rpx;
        }
      }
    }
    
    .picker-display {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12rpx;
      padding: 20rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      height: 88rpx; // 设置固定高度与输入框一致
      
      // 响应式宽度控制
      @media (max-width: 480rpx) {
        padding: 16rpx;
        height: 80rpx;
      }
      
      @media (min-width: 768rpx) {
        max-width: min(calc(100vw - 120rpx), 75vw);
        height: 92rpx;
      }
      
      text {
        color: white;
        font-size: 30rpx;
        margin: 0;
        
        @media (max-width: 480rpx) {
          font-size: 28rpx;
        }
      }
    }
  }
}

// 购票弹窗样式
.ticket-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64rpx;
}

.ticket-modal {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  width: 100%;
  max-width: 640rpx;
  overflow: hidden;
  
  .ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 48rpx 48rpx 24rpx;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    
    .ticket-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }
    
    .close-btn {
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.1);
      
      text {
        font-size: 32rpx;
        color: #666;
        font-weight: bold;
      }
    }
  }
  
  .ticket-content {
    padding: 24rpx 48rpx;
    
    .ticket-item {
      display: flex;
      align-items: center;
      margin-bottom: 32rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .ticket-label {
        font-size: 28rpx;
        color: #666;
        min-width: 160rpx;
        flex-shrink: 0;
      }
      
      .ticket-value {
        font-size: 28rpx;
        color: #333;
        flex: 1;
      }
      
      .ticket-input {
        flex: 1;
        padding: 16rpx 20rpx;
        border: 2px solid #e0e0e0;
        border-radius: 12rpx;
        font-size: 28rpx;
        color: #333;
        
        &:focus {
          border-color: #667eea;
        }
      }
      
      .quantity-control {
        display: flex;
        align-items: center;
        gap: 20rpx;
        
        .quantity-btn {
          width: 60rpx;
          height: 60rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #667eea;
          border-radius: 12rpx;
          color: white;
          font-size: 32rpx;
          font-weight: bold;
          transition: all 0.3s ease;
          
          &:active {
            background: #5a6fd8;
            transform: scale(0.95);
          }
        }
        
        .quantity-text {
          font-size: 32rpx;
          color: #333;
          font-weight: 600;
          min-width: 60rpx;
          text-align: center;
        }
      }
      
      .ticket-total {
        font-size: 32rpx;
        color: #667eea;
        font-weight: 600;
      }
    }
  }
  
  .ticket-actions {
    display: flex;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    
    .ticket-btn {
      flex: 1;
      padding: 32rpx;
      text-align: center;
      transition: background-color 0.3s ease;
      
      &.cancel-ticket-btn {
        border-right: 1px solid rgba(0, 0, 0, 0.1);
        
        &:active {
          background: rgba(0, 0, 0, 0.05);
        }
        
        text {
          color: #666;
          font-size: 32rpx;
          font-weight: 500;
        }
      }
      
      &.confirm-ticket-btn {
        &:active {
          background: rgba(102, 126, 234, 0.1);
        }
        
        text {
          color: #667eea;
          font-size: 32rpx;
          font-weight: 600;
        }
      }
    }
  }
}

// 删除确认弹窗
.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64rpx;
}

.delete-modal {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  width: 100%;
  max-width: 640rpx;
  overflow: hidden;
  
  .modal-header {
    padding: 48rpx 48rpx 24rpx;
    text-align: center;
    
    .modal-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }
  }
  
  .modal-content {
    padding: 0 48rpx 48rpx;
    text-align: center;
    
    .modal-text {
      font-size: 32rpx;
      color: #666;
      line-height: 1.5;
    }
  }
  
  .modal-actions {
    display: flex;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    
    .modal-btn {
      flex: 1;
      padding: 32rpx;
      text-align: center;
      transition: background-color 0.3s ease;
      
      &.cancel-btn {
        border-right: 1px solid rgba(0, 0, 0, 0.1);
        
        &:active {
          background: rgba(0, 0, 0, 0.05);
        }
        
        text {
          color: #666;
          font-size: 32rpx;
          font-weight: 500;
        }
      }
      
      &.confirm-btn {
        &:active {
          background: rgba(255, 107, 107, 0.1);
        }
        
        text {
          color: #ff6b6b;
          font-size: 32rpx;
          font-weight: 600;
        }
      }
    }
  }
}
</style>