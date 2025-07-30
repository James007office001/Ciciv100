<template>
  <view class="schedule-container">
    <!-- 固定的页面标题栏 - 与发现页面保持一致 -->
    <view class="page-header">
      <!-- 标签栏 -->
      <view class="header-tabs">
        <view 
          v-for="(tab, index) in headerTabs"
          :key="tab.id"
          class="header-tab-item"
          :class="{ 'tab-active': currentPageIndex === index }"
          @click="switchToPage(index)"
        >
          <text class="header-tab-text">{{ tab.name }}</text>
        </view>
        
        <!-- 年月日显示标签 -->
        <view class="date-display-label" @click="showDatePicker">
          <text class="date-display-text">{{ formatDateLabel(selectedDate) }}</text>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="header-actions">
        <!-- 添加按钮 -->
        <view class="add-event-btn" @click="handleCreateEvent">
          <text class="icon-add">+</text>
        </view>
      </view>
    </view>
    
    <!-- 横向滑动页面 -->
    <swiper 
      class="page-swiper"
      :current="currentPageIndex"
      @change="onSwiperChange"
      :disable-programmatic-animation="false"
      :circular="true"
    >
      <!-- 项目页 -->
      <swiper-item class="swiper-page">
        <scroll-view class="page-scroll" scroll-y="true" :enhanced="true">
          <view class="page-content projects-page">
            <view class="page-header">
              <text class="page-title">项目页</text>
              <text class="page-subtitle">管理你的项目进度</text>
            </view>
            
            <!-- 项目统计 -->
            <view class="stats-row">
              <view class="stat-card">
                <view class="stat-content">
                  <text class="stat-number">{{ projects.length }}</text>
                  <text class="stat-label">总项目</text>
                </view>
              </view>
              
              <view class="stat-card">
                <view class="stat-content">
                  <text class="stat-number">{{ completedProjectsCount }}</text>
                  <text class="stat-label">已完成</text>
                </view>
              </view>
              
              <view class="stat-card">
                <view class="stat-content">
                  <text class="stat-number">{{ totalProjectsProgress }}%</text>
                  <text class="stat-label">平均进度</text>
                </view>
              </view>
            </view>
            
            <!-- 项目列表 -->
            <view class="projects-list-card">
              <view class="card-header">
                <text class="card-title">项目列表</text>
                <view class="card-actions">
                  <view class="action-btn" @click="handleAddProject">
                    <text class="action-text">添加项目</text>
                  </view>
                </view>
              </view>
              
              <view class="projects-list">
                <view 
                  v-for="project in projects"
                  :key="project.id"
                  class="project-item"
                  @click="handleProjectDetail(project)"
                >
                  <view class="project-header">
                    <text class="project-name">{{ project.name }}</text>
                    <view class="project-priority" :style="{ backgroundColor: getPriorityColor(project.priority) }">
                      <text class="priority-text">{{ project.priority }}</text>
                    </view>
                  </view>
                  
                  <view class="project-progress">
                    <view class="progress-info">
                      <text class="progress-text">{{ project.progress }}%</text>
                      <text class="due-date">截止：{{ project.dueDate }}</text>
                    </view>
                    <view class="progress-bar">
                      <view 
                        class="progress-fill" 
                        :style="{ 
                          width: `${project.progress}%`,
                          backgroundColor: getProgressColor(project.progress)
                        }"
                      ></view>
                    </view>
                  </view>
                  
                  <view class="project-meta">
                    <text class="project-status">{{ getStatusText(project.status) }}</text>
                    <view class="project-team">
                      <text 
                        v-for="member in project.team"
                        :key="member"
                        class="team-member"
                      >{{ member }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
      
      <!-- 日历页 -->
      <swiper-item class="swiper-page">
        <scroll-view class="page-scroll calendar-scroll" scroll-y="true" :enhanced="true">
          <view class="page-content calendar-page">
            <!-- 完整月历 -->
            <view class="calendar-glass-container">
              <!-- 星期标题 -->
              <view class="calendar-weekdays">
                <text 
                  v-for="weekday in weekdayLabels"
                  :key="weekday"
                  class="weekday-label"
                >{{ weekday }}</text>
              </view>
              
              <!-- 日历网格 -->
              <view class="calendar-grid">
                <view 
                  v-for="(date, index) in calendarDates"
                  :key="index"
                  class="calendar-date"
                  :class="{
                    'date-today': date.isToday,
                    'date-selected': date.isSelected,
                    'date-other-month': date.isOtherMonth,
                    'date-has-events': date.hasEvents
                  }"
                  @click="selectCalendarDate(date)"
                >
                  <text class="date-number">{{ date.number }}</text>
                  <view v-if="date.hasEvents" class="event-dots">
                    <view 
                      v-for="(event, eventIndex) in date.events.slice(0, 3)"
                      :key="eventIndex"
                      class="event-dot"
                      :style="{ backgroundColor: getCategoryColor(event.categoryId) }"
                    ></view>
                    <text v-if="date.events.length > 3" class="more-events">+{{ date.events.length - 3 }}</text>
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 事件显示列表 - 动态显示3-7天的事件 -->
            <view 
              v-for="(dayData, index) in displayEventDays"
              :key="dayData.dateStr"
              class="event-day-container"
            >
              <view class="event-day-header">
                <text class="day-title">{{ dayData.title }}</text>
                <text class="events-count">{{ dayData.events.length }}项</text>
              </view>
              <view class="events-list">
                <view 
                  v-for="event in dayData.events"
                  :key="event.id"
                  class="event-item"
                  @click="viewEventDetail(event)"
                >
                  <!-- 优先级图标 -->
                  <view class="event-priority">
                    <text class="event-priority-icon">{{ getPriorityIcon(event.priority) }}</text>
                  </view>
                  
                  <!-- 开始时间和持续时间 -->
                  <view class="event-time">
                    <text class="event-time-text">{{ formatEventStartTime(event.startTime) }}</text>
                    <text class="event-duration-text">{{ getEventDuration(event) }}</text>
                  </view>
                  
                  <!-- 事件信息（分类图标与名称、地点的复合布局） -->
                  <view class="event-info">
                    <!-- 第一行：分类图标与事件名称横向并排 -->
                    <view class="event-title-row">
                      <text class="event-category-icon">{{ getCategoryIcon(event.categoryId || event.category) }}</text>
                      <text class="event-title">{{ event.title }}</text>
                    </view>
                    
                    <!-- 第二行：地点图标与事件地点 -->
                    <view class="event-location-row" v-if="event.location">
                      <text class="event-location-icon">📍</text>
                      <text class="event-location">{{ event.location }}</text>
                    </view>
                  </view>
                </view>
                <view v-if="dayData.events.length === 0" class="no-events">
                  <text class="no-events-text">暂无日程</text>
                </view>
              </view>
            </view>
            
            <!-- 展开/收缩按钮容器 -->
            <view class="events-toggle-container">
              <view class="toggle-button-wrapper" @click="toggleEventsExpansion">
                <view class="toggle-button">
                  <text class="toggle-text">{{ isEventsExpanded ? '更少' : '更多' }}</text>
                  <text class="toggle-icon">{{ isEventsExpanded ? '↑' : '↓' }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
      
      <!-- 购物清单页 -->
      <swiper-item class="swiper-page">
        <scroll-view class="page-scroll" scroll-y="true" :enhanced="true">
          <view class="page-content shopping-page">
            <view class="page-header">
              <text class="page-title">购物清单页</text>
              <text class="page-subtitle">管理你的购物需求</text>
            </view>
            
            <!-- 购物统计 -->
            <view class="shopping-stats">
              <view class="stats-row">
                <view class="stat-item">
                  <text class="stat-number">{{ shoppingItems.length }}</text>
                  <text class="stat-label">总数量</text>
                </view>
                <view class="stat-item">
                  <text class="stat-number">{{ completedItemsCount }}</text>
                  <text class="stat-label">已购买</text>
                </view>
                <view class="stat-item">
                  <text class="stat-number">¥{{ totalAmount }}</text>
                  <text class="stat-label">预算</text>
                </view>
              </view>
            </view>
            
            <!-- 购物清单 -->
            <view class="shopping-list-card">
              <view class="section-header">
                <text class="section-title">购物清单</text>
                <view class="add-btn" @click="handleAddShoppingItem">
                  <text class="add-text">添加</text>
                </view>
              </view>
              
              <view v-if="shoppingItems.length > 0" class="shopping-list">
                <view 
                  v-for="item in shoppingItems"
                  :key="item.id"
                  class="shopping-item"
                  @click="toggleShoppingItem(item)"
                >
                  <view class="item-checkbox" :class="{ 'checkbox-checked': item.completed }">
                    <text v-if="item.completed" class="custom-icon icon-checkmark"></text>
                  </view>
                  <view class="item-info">
                    <text class="item-name" :class="{ 'item-completed': item.completed }">
                      {{ item.name }}
                    </text>
                    <text class="item-details">
                      {{ item.quantity }} {{ item.unit }} · ¥{{ item.price }}
                    </text>
                  </view>
                  <view class="item-category">
                    <text class="category-tag" :style="{ backgroundColor: item.categoryColor }">
                      {{ item.category }}
                    </text>
                  </view>
                </view>
              </view>
              
              <view v-else class="empty-shopping">
                <text class="empty-text">购物清单为空</text>
                <view class="add-btn" @click="handleAddShoppingItem">
                  <text class="add-text">添加商品</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
    
    <!-- 底部标签栏 -->
    <SimpleTabbar />
    
    <!-- iPhone风格日期选择弹窗 -->
    <view v-if="showDatePickerModal" class="date-picker-overlay" @click="closeDatePicker">
      <view class="date-picker-sheet" @click.stop>
        <!-- 弹窗头部 -->
        <view class="picker-header">
          <view class="header-btn cancel-btn" @click="closeDatePicker">
            <text class="btn-text">取消</text>
          </view>
          <view class="header-title">
            <text class="title-text">选择日期</text>
          </view>
          <view class="header-btn confirm-btn" @click="confirmDateSelection">
            <text class="btn-text">确定</text>
          </view>
        </view>
        
        <!-- 滚轮选择器主体 -->
        <view class="picker-body">
          <!-- 选择指示器背景 -->
          <view class="picker-indicator"></view>
          
          <!-- 三列滚轮容器 -->
          <view class="wheels-container">
            <!-- 年份滚轮 -->
            <view class="wheel-column">
              <picker-view 
                class="wheel-picker"
                :value="[selectedYearIndex]"
                @change="onYearWheelChange"
                :indicator-style="'height: 88rpx; background: transparent; border: none;'"
              >
                <picker-view-column>
                  <view 
                    v-for="(year, index) in yearRange"
                    :key="index"
                    class="wheel-item"
                  >
                    <text class="item-text">{{ year }}</text>
                    <text class="item-unit">年</text>
                  </view>
                </picker-view-column>
              </picker-view>
            </view>
            
            <!-- 月份滚轮 -->
            <view class="wheel-column">
              <picker-view 
                class="wheel-picker"
                :value="[selectedMonthIndex]"
                @change="onMonthWheelChange"
                :indicator-style="'height: 88rpx; background: transparent; border: none;'"
              >
                <picker-view-column>
                  <view 
                    v-for="(month, index) in monthRange"
                    :key="index"
                    class="wheel-item"
                  >
                    <text class="item-text">{{ month }}</text>
                    <text class="item-unit">月</text>
                  </view>
                </picker-view-column>
              </picker-view>
            </view>
            
            <!-- 日期滚轮 -->
            <view class="wheel-column">
              <picker-view 
                class="wheel-picker"
                :value="[selectedDayIndex]"
                @change="onDayWheelChange"
                :indicator-style="'height: 88rpx; background: transparent; border: none;'"
              >
                <picker-view-column>
                  <view 
                    v-for="(day, index) in dayRange"
                    :key="index"
                    class="wheel-item"
                  >
                    <text class="item-text">{{ day }}</text>
                    <text class="item-unit">日</text>
                  </view>
                </picker-view-column>
              </picker-view>
            </view>
          </view>
          
          <!-- 上下遮罩渐变 -->
          <view class="picker-mask-top"></view>
          <view class="picker-mask-bottom"></view>
        </view>
      </view>
    </view>
    
    <!-- 底部标签栏 -->
    <SimpleTabbar />
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import SimpleTabbar from '../../src/components/common/SimpleTabbar.vue'
import { useAppStore } from '../../src/store/modules/app.js'
import { 
  initializeEventCategories, 
  loadEventCategories, 
  getEventCategoryById,
  priorityMatrix
} from '../../src/utils/eventCategoryDatabase.js'

// 使用app store
const appStore = useAppStore()

// 简化的store，移除复杂依赖
const eventStore = reactive({
  events: [],
  loading: false,
  pendingSyncCount: computed(() => 0)
})

// 页面状态
const currentPageIndex = ref(1) // 默认显示日历页

// 头部标签配置
const headerTabs = ref([
  {
    id: 'projects',
    name: '项目'
  },
  {
    id: 'calendar',
    name: '日历'
  },
  {
    id: 'shopping',
    name: '购物'
  }
])

// 项目相关数据
const projects = reactive([
  {
    id: 1,
    name: '移动应用设计',
    progress: 75,
    dueDate: '2024-01-15',
    status: 'active',
    priority: 'high',
    team: ['Alice', 'Bob']
  },
  {
    id: 2,
    name: '网站重构',
    progress: 45,
    dueDate: '2024-01-20',
    status: 'active',
    priority: 'medium',
    team: ['Charlie', 'David']
  },
  {
    id: 3,
    name: '数据分析报告',
    progress: 90,
    dueDate: '2024-01-10',
    status: 'review',
    priority: 'high',
    team: ['Eve']
  }
])

// 事件分类数据
const eventCategories = ref([])

// 时间更新定时器 - 暂时禁用以避免死循环
// let timeUpdateInterval = null

// 日历相关数据
// 获取当前准确时间的函数
const getCurrentAccurateTime = () => {
  // 简化实现，直接使用本地时间
  return new Date()
}

// 获取当前准确日期
const getCurrentDate = () => {
  const date = getCurrentAccurateTime()
  
  // 确保返回的是当天的开始时间（00:00:00），避免时间部分的影响
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return normalizedDate
}

// 初始化当前日期（使用准确时间）
const currentDate = getCurrentDate()
const currentYearMonth = ref(`${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`)
const selectedDate = ref(new Date(2025, 6, 18)) // 2025年7月18日 (月份从0开始)
const isEventsExpanded = ref(false) // 事件列表展开状态

// 加载事件数据
const loadEvents = () => {
  try {
    console.log('开始加载事件数据...')
    
    // 从本地存储加载事件数据
    const localData = uni.getStorageSync('cici_events')
    console.log('本地存储数据:', localData)
    
    if (localData && localData.length > 0) {
      eventStore.events = localData
      console.log(`从本地存储加载了 ${eventStore.events.length} 个事件`)
    } else {
      // 如果没有本地数据，初始化为空数组
      eventStore.events = []
      console.log('本地无数据，初始化为空事件列表')
    }
    
    console.log('事件数据加载完成，当前事件总数:', eventStore.events.length)
  } catch (error) {
    console.error('加载事件失败:', error)
    eventStore.events = []
  }
}

// 加载事件分类数据
const loadEventCategoriesData = () => {
  try {
    console.log('开始加载事件分类数据...')
    
    // 如果uni对象不存在，使用默认数据
    if (typeof uni === 'undefined') {
      console.warn('uni对象不存在，使用默认分类数据')
      eventCategories.value = [
        {
          id: 'category_meeting',
          name: '会议',
          icon: '📋',
          color: '#FF9500',
          isActive: true
        },
        {
          id: 'category_work',
          name: '工作',
          icon: '💼',
          color: '#007AFF',
          isActive: true
        },
        {
          id: 'category_other',
          name: '其他',
          icon: '📝',
          color: '#95A5A6',
          isActive: true
        }
      ]
      console.log('使用默认分类数据:', eventCategories.value.length, '个分类')
      return
    }
    
    // 初始化事件分类数据（如果本地没有的话）
    const initializedCategories = initializeEventCategories()
    console.log('分类数据初始化完成:', initializedCategories.length, '个分类')
    
    // 从本地数据库加载事件分类
    const categories = loadEventCategories()
    eventCategories.value = categories
    console.log(`从本地数据库加载了 ${categories.length} 个事件分类`)
    console.log('分类数据详情:', categories)
  } catch (error) {
    console.error('加载事件分类失败:', error)
    eventCategories.value = []
  }
}

// 根据分类ID获取分类信息
const getCategoryInfo = (categoryId) => {
  const category = eventCategories.value.find(cat => cat.id === categoryId)
  return category || {
    id: 'category_other',
    name: '其他',
    icon: '📝',
    color: '#95A5A6'
  }
}

// 获取分类图标
const getCategoryIcon = (categoryId) => {
  const categoryInfo = getCategoryInfo(categoryId)
  return categoryInfo.icon
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const categoryInfo = getCategoryInfo(categoryId)
  return categoryInfo.name
}

// 获取分类颜色
const getCategoryColor = (categoryId) => {
  const categoryInfo = getCategoryInfo(categoryId)
  return categoryInfo.color
}

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']

// 日期选择弹窗相关数据
const showDatePickerModal = ref(false)
const currentAccurateDate = getCurrentDate()
const selectedYear = ref(currentAccurateDate.getFullYear())
const selectedMonth = ref(currentAccurateDate.getMonth() + 1)
const selectedDay = ref(currentAccurateDate.getDate())
const selectedYearIndex = ref(0)
const selectedMonthIndex = ref(0)
const selectedDayIndex = ref(0)

// 生成年份范围 (当前年份前后10年)
const currentYear = currentAccurateDate.getFullYear()
const yearRange = reactive(Array.from({length: 21}, (_, i) => currentYear - 10 + i))

// 月份范围
const monthRange = reactive(Array.from({length: 12}, (_, i) => i + 1))

// 日期范围 (根据选中的年月动态计算)
const dayRange = computed(() => {
  const daysInMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  return Array.from({length: daysInMonth}, (_, i) => i + 1)
})

// 日历网格数据
const calendarDates = reactive([])

// 强制初始化一些日历数据以确保显示
const initializeCalendarData = () => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  // 生成当月的一些日期
  const dates = []
  for (let day = 1; day <= 31; day++) {
    const date = new Date(currentYear, currentMonth, day)
    dates.push({
      number: day,
      date: date,
      isOtherMonth: false,
      isToday: day === today.getDate(),
      isSelected: false,
      hasEvents: false,
      events: []
    })
  }
  
  calendarDates.splice(0, calendarDates.length, ...dates)
  console.log('强制初始化日历数据:', dates.length, '个日期')
}

// 事件数据 - 从Store获取
const allEvents = computed(() => eventStore.events)

// 计算属性
const selectedDateEvents = computed(() => {
  const dateStr = formatDate(selectedDate.value)
  return allEvents.value.filter(event => event.date === dateStr)
})

// 计算显示的天数
const displayDaysCount = computed(() => {
  return isEventsExpanded.value ? 7 : 3
})

// 计算要显示的事件天数数组
const displayEventDays = computed(() => {
  const days = []
  const startDate = selectedDate.value
  const today = getCurrentDate() // 系统真实今天
  
  for (let i = 0; i < displayDaysCount.value; i++) {
    // 确保生成的日期也是标准化的（只有日期部分，没有时间）
    const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
    const dateStr = formatDate(date)
    const dayEvents = allEvents.value.filter(event => event.date === dateStr)
    
    // 基于系统真实日期生成相对标题
    const title = getRelativeDateTitle(date, today)
    
    days.push({
      date: date,
      dateStr: dateStr,
      title: title,
      events: dayEvents,
      dayOffset: i
    })
  }
  
  return days
})

const selectedDateTitle = computed(() => {
  const today = getCurrentDate() // 使用当前准确时间
  const selected = selectedDate.value
  
  return getRelativeDateTitle(selected, today)
})

// 购物清单数据
const shoppingItems = reactive([
  {
    id: 1,
    name: '苹果',
    quantity: 2,
    unit: 'kg',
    price: 12.5,
    category: '水果',
    categoryColor: '#FF6B6B',
    completed: false
  },
  {
    id: 2,
    name: '牛奶',
    quantity: 1,
    unit: '盒',
    price: 8.9,
    category: '乳制品',
    categoryColor: '#4ECDC4',
    completed: true
  },
  {
    id: 3,
    name: '面包',
    quantity: 1,
    unit: '袋',
    price: 6.5,
    category: '主食',
    categoryColor: '#45B7D1',
    completed: false
  }
])

// 计算属性
const completedProjectsCount = computed(() => 
  projects.filter(p => p.status === 'completed').length
)

const totalProjectsProgress = computed(() => {
  const total = projects.reduce((sum, p) => sum + p.progress, 0)
  return Math.round(total / projects.length)
})

const completedItemsCount = computed(() => 
  shoppingItems.filter(item => item.completed).length
)

const totalAmount = computed(() => 
  shoppingItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)
)

// 页面切换
const onSwiperChange = (e) => {
  currentPageIndex.value = e.detail.current
}

const switchToPage = (index) => {
  currentPageIndex.value = index
}

// 格式化日期显示标签（年/月/日格式）
const formatDateLabel = (date) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}/${month}/${day}`
}

// 事件展开切换方法
const toggleEventsExpansion = () => {
  isEventsExpanded.value = !isEventsExpanded.value
  console.log('切换事件列表展开状态:', isEventsExpanded.value ? '展开(7天)' : '收缩(3天)')
}

// 项目相关方法
const getProgressColor = (progress) => {
  if (progress >= 80) return '#34C759'
  if (progress >= 60) return '#FF9500'
  if (progress >= 30) return '#007AFF'
  return '#FF3B30'
}

const getPriorityColor = (priority) => {
  return {
    'high': '#FF3B30',
    'medium': '#FF9500',
    'low': '#34C759'
  }[priority] || '#8E8E93'
}

// 获取优先级图标
const getPriorityIcon = (priority) => {
  const priorityItem = priorityMatrix.find(p => p.value === priority)
  return priorityItem ? priorityItem.icon : '📋'
}

const getStatusText = (status) => {
  return {
    'active': '进行中',
    'review': '审核中',
    'completed': '已完成',
    'pending': '待开始'
  }[status] || '未知'
}

const handleProjectDetail = (project) => {
  console.log('查看项目详情:', project.name)
  // 这里可以导航到项目详情页
}

const handleAddProject = () => {
  console.log('添加新项目')
  // 这里可以显示添加项目的弹窗或导航到添加页面
}

// 日历相关方法
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isSameDate = (date1, date2) => {
  return formatDate(date1) === formatDate(date2)
}

const generateCalendarDates = () => {
  console.log('开始生成日历数据...')
  
  // 如果uni对象不存在，使用默认日期
  if (typeof uni === 'undefined') {
    console.warn('uni对象不存在，使用默认日期')
    const today = new Date()
    const dates = [
      {
        number: 15,
        date: new Date(2024, 0, 15),
        isOtherMonth: false,
        isToday: true,
        isSelected: false,
        hasEvents: true,
        events: []
      },
      {
        number: 16,
        date: new Date(2024, 0, 16),
        isOtherMonth: false,
        isToday: false,
        isSelected: false,
        hasEvents: false,
        events: []
      },
      {
        number: 17,
        date: new Date(2024, 0, 17),
        isOtherMonth: false,
        isToday: false,
        isSelected: false,
        hasEvents: false,
        events: []
      }
    ]
    calendarDates.splice(0, calendarDates.length, ...dates)
    console.log('使用默认日期数据:', dates.length, '个日期')
    return
  }
  
  const year = selectedDate.value.getFullYear()
  const month = selectedDate.value.getMonth()
  
  console.log('生成日历 - 年月:', year, month + 1)
  
  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 获取第一天是星期几（0=周日，需要转换为1=周一）
  let firstDayWeek = firstDay.getDay()
  firstDayWeek = firstDayWeek === 0 ? 7 : firstDayWeek
  
  const dates = []
  const today = getCurrentDate() // 使用准确的当前时间
  
  console.log('当前事件总数:', allEvents.value.length)
  
  // 添加上个月的日期（填充前面的空白）
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayWeek - 1; i > 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i + 1)
    const dateStr = formatDate(date)
    const dayEvents = allEvents.value.filter(event => event.date === dateStr)
    
    dates.push({
      number: prevMonthLastDay - i + 1,
      date: date,
      isOtherMonth: true,
      isToday: isSameDate(date, today),
      isSelected: isSameDate(date, selectedDate.value),
      hasEvents: dayEvents.length > 0,
      events: dayEvents
    })
  }
  
  // 添加当月的日期
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    const dateStr = formatDate(date)
    const dayEvents = allEvents.value.filter(event => event.date === dateStr)
    
    dates.push({
      number: day,
      date: date,
      isOtherMonth: false,
      isToday: isSameDate(date, today),
      isSelected: isSameDate(date, selectedDate.value),
      hasEvents: dayEvents.length > 0,
      events: dayEvents
    })
  }
  
  // 添加下个月的日期（填充后面的空白，确保6行）
  const totalCells = 42 // 6行 × 7列
  const remainingCells = totalCells - dates.length
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month + 1, day)
    const dateStr = formatDate(date)
    const dayEvents = allEvents.value.filter(event => event.date === dateStr)
    
    dates.push({
      number: day,
      date: date,
      isOtherMonth: true,
      isToday: isSameDate(date, today),
      isSelected: isSameDate(date, selectedDate.value),
      hasEvents: dayEvents.length > 0,
      events: dayEvents
    })
  }
  
  calendarDates.splice(0, calendarDates.length, ...dates)
  console.log('日历数据生成完成，总共', dates.length, '个日期')
  console.log('日历数据:', calendarDates.length, '个日期项')
}

const selectCalendarDate = (dateItem) => {
  selectedDate.value = new Date(dateItem.date)
  generateCalendarDates() // 重新生成以更新选中状态
  console.log('选中日期:', formatDate(selectedDate.value))
}

const showDatePicker = () => {
  // 初始化弹窗数据为当前选中的日期
  const current = selectedDate.value
  selectedYear.value = current.getFullYear()
  selectedMonth.value = current.getMonth() + 1
  selectedDay.value = current.getDate()
  
  // 设置picker的索引
  selectedYearIndex.value = yearRange.findIndex(year => year === selectedYear.value)
  selectedMonthIndex.value = selectedMonth.value - 1
  selectedDayIndex.value = selectedDay.value - 1
  
  showDatePickerModal.value = true
  console.log('显示日期选择器')
}

const closeDatePicker = () => {
  showDatePickerModal.value = false
}

const onYearWheelChange = (e) => {
  selectedYearIndex.value = e.detail.value[0]
  selectedYear.value = yearRange[e.detail.value[0]]
  
  // 年份改变时，检查日期是否还有效
  const maxDay = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  if (selectedDay.value > maxDay) {
    selectedDay.value = maxDay
    selectedDayIndex.value = maxDay - 1
  }
}

const onMonthWheelChange = (e) => {
  selectedMonthIndex.value = e.detail.value[0]
  selectedMonth.value = monthRange[e.detail.value[0]]
  
  // 月份改变时，检查日期是否还有效
  const maxDay = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  if (selectedDay.value > maxDay) {
    selectedDay.value = maxDay
    selectedDayIndex.value = maxDay - 1
  }
}

const onDayWheelChange = (e) => {
  selectedDayIndex.value = e.detail.value[0]
  selectedDay.value = dayRange.value[e.detail.value[0]]
}

const confirmDateSelection = () => {
  // 创建新的日期对象
  const newDate = new Date(selectedYear.value, selectedMonth.value - 1, selectedDay.value)
  
  // 更新选中的日期
  selectedDate.value = newDate
  
  // 更新日历显示的年月日
  currentYearMonth.value = `${selectedYear.value}年${selectedMonth.value}月${selectedDay.value}日`
  
  // 重新生成日历网格
  generateCalendarDates()
  
  // 关闭弹窗
  closeDatePicker()
  
  console.log('确认选择日期:', formatDate(newDate))
}

const handleCreateEvent = () => {
  console.log('创建新事件')
  // 导航到创建事件页面，传递当前选中的日期
  const selectedDateStr = formatDate(selectedDate.value)
  uni.navigateTo({
    url: `/pages/schedule/create-event?date=${selectedDateStr}`,
    events: {
      // 监听页面返回事件
      success: () => {
        console.log('跳转到创建事件页面成功')
      }
    }
  })
}

const viewEventDetail = (event) => {
  console.log('查看事件详情:', event.title)
  // 跳转到编辑事件页面
  uni.navigateTo({
    url: `/pages/schedule/create-event?id=${event.id}`
  })
}

// 获取事件持续时间显示
const getEventDuration = (event) => {
  // 如果选择了全天复选框，则显示"全天"
  if (event.allDay === true) {
    return '全天'
  }
  
  // 如果有开始时间和结束时间，计算持续时间
  if (event.startTime && event.endTime) {
    // 解析时间字符串 (格式: "HH:mm")
    const startParts = event.startTime.split(':')
    const endParts = event.endTime.split(':')
    
    if (startParts.length === 2 && endParts.length === 2) {
      const startHour = parseInt(startParts[0])
      const startMinute = parseInt(startParts[1])
      const endHour = parseInt(endParts[0])
      const endMinute = parseInt(endParts[1])
      
      // 计算持续时间（分钟）
      const startTotalMinutes = startHour * 60 + startMinute
      const endTotalMinutes = endHour * 60 + endMinute
      let durationMinutes = endTotalMinutes - startTotalMinutes
      
      // 处理跨天的情况（如果结束时间小于开始时间）
      if (durationMinutes < 0) {
        durationMinutes += 24 * 60 // 加上24小时
      }
      
      // 转换为小时和分钟
      const durationHours = Math.floor(durationMinutes / 60)
      const remainingMinutes = durationMinutes % 60
      
      // 格式化显示持续时间（时:分格式）
      if (durationHours > 0 && remainingMinutes > 0) {
        return `${durationHours}:${remainingMinutes.toString().padStart(2, '0')}`
      } else if (durationHours > 0) {
        return `${durationHours}:00`
      } else if (remainingMinutes > 0) {
        return `0:${remainingMinutes.toString().padStart(2, '0')}`
      } else {
        return '0:00'
      }
    }
  }
  
  // 如果只有开始时间或时间格式错误，显示默认持续时间
  return '1:00'
}

// 格式化事件开始时间显示（只显示时:分）
const formatEventStartTime = (startTime) => {
  if (!startTime) {
    return '00:00'
  }
  
  // 如果是完整的日期时间字符串，提取时间部分
  if (startTime.includes('T')) {
    // ISO 8601 格式：2025-07-18T09:30:00
    const timePart = startTime.split('T')[1]
    if (timePart) {
      const timeOnly = timePart.split('.')[0] // 去掉毫秒部分
      return formatEventStartTime(timeOnly)
    }
  }
  
  // 如果包含日期，提取时间部分
  if (startTime.includes(' ')) {
    // 格式：2025-07-18 09:30:00
    const parts = startTime.split(' ')
    if (parts.length >= 2) {
      return formatEventStartTime(parts[1])
    }
  }
  
  // 如果时间格式是 "HH:mm" 或 "HH:mm:ss"
  const timeParts = startTime.split(':')
  if (timeParts.length >= 2) {
    const hour = parseInt(timeParts[0])
    const minute = parseInt(timeParts[1])
    
    // 验证时间范围
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      // 格式化为 H:mm 或 HH:mm（小时不补零，分钟补零）
      return `${hour}:${minute.toString().padStart(2, '0')}`
    }
  }
  
  // 如果格式不正确，返回默认时间
  return '00:00'
}

// 购物清单方法
const toggleShoppingItem = (item) => {
  item.completed = !item.completed
  console.log('切换购物项状态:', item.name, item.completed)
}

const handleAddShoppingItem = () => {
  console.log('添加购物项')
}

// 获取星期几的中文名称
const getWeekdayName = (date) => {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return weekdays[date.getDay()]
}

// 获取相对日期的描述（今天、明天、后天等）
const getRelativeDateTitle = (targetDate, today) => {
  // 确保比较的是日期部分，而不是具体时间
  const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  const diffTime = targetDateOnly.getTime() - todayDateOnly.getTime()
  const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000))
  
  const weekdayName = getWeekdayName(targetDate)
  
  if (diffDays === 0) {
    return `今日 / 周${weekdayName}`
  } else if (diffDays === 1) {
    return `明天 / 周${weekdayName}`
  } else if (diffDays === 2) {
    return `后天 / 周${weekdayName}`
  } else if (diffDays === -1) {
    return `昨天 / 周${weekdayName}`
  } else {
    const month = targetDate.getMonth() + 1
    const day = targetDate.getDate()
    return `${month}月${day}日 / 周${weekdayName}`
  }
}

// 生命周期
onMounted(async () => {
  console.log('日程页面已挂载')
  
  // 强制初始化日历数据
  initializeCalendarData()
  
  // 设置当前标签为活动页
  appStore.setCurrentTab('schedule')
  
  // 加载事件分类数据
  loadEventCategoriesData()
  
  // 加载事件数据
  loadEvents()
  
  // 初始化日历
  generateCalendarDates()
  
  // 获取当前准确时间用于显示和选择器
  const currentAccurateTime = getCurrentDate()
  
  // 更新年月日显示
  currentYearMonth.value = `${currentAccurateTime.getFullYear()}年${currentAccurateTime.getMonth() + 1}月${currentAccurateTime.getDate()}日`
  
  // 初始化日期选择器的索引
  selectedYearIndex.value = yearRange.findIndex(year => year === currentAccurateTime.getFullYear())
  selectedMonthIndex.value = currentAccurateTime.getMonth()
  selectedDayIndex.value = currentAccurateTime.getDate() - 1
  
  // 设置定时器定期刷新时间 - 暂时禁用以避免死循环
  // const timeUpdateInterval = setInterval(() => {
  //   // 简单的时间刷新逻辑，重新生成日历
  //   generateCalendarDates()
  // }, 60000) // 每分钟更新一次时间
  
  console.log('日程页面初始化完成')
  console.log('当前日历数据数量:', calendarDates.length)
  console.log('当前事件数量:', allEvents.value.length)
  console.log('当前选中日期:', formatDate(selectedDate.value))
  console.log('当前选中日期的事件:', selectedDateEvents.value.length)
  console.log('displayEventDays长度:', displayEventDays.value.length)
  console.log('displayEventDays数据:', displayEventDays.value.map(d => ({ title: d.title, events: d.events.length })))
})

// 页面显示时刷新数据
onShow(async () => {
  console.log('=== 日程页面重新显示 ===')
  try {
    // 设置当前标签为活动页
    appStore.setCurrentTab('schedule')
    
    // 重新加载事件分类数据
    loadEventCategoriesData()
    
    // 重新加载事件数据
    loadEvents()
    
    console.log('页面显示时事件数据:', {
      总数: eventStore.events.length,
      待同步: eventStore.pendingSyncCount,
      事件列表: eventStore.events.map(e => ({ title: e.title, date: e.date, syncStatus: e.syncStatus }))
    })
    
    // 重新生成日历以显示最新的事件点
    generateCalendarDates()
    
    console.log('=== 日程页面刷新完成 ===')
  } catch (error) {
    console.error('刷新事件数据失败:', error)
  }
})

// 清理资源
onUnmounted(() => {
  // if (timeUpdateInterval) {
  //   clearInterval(timeUpdateInterval)
  //   console.log('Schedule: 已清理时间更新定时器')
  // }
})

// 用户登录状态检查
const checkUserLoginStatus = async () => {
  try {
    console.log('检查用户登录状态...')
    
    // 首先检查本地登录状态
    const isLoggedIn = userStore.checkLoginStatus()
    
    if (!isLoggedIn) {
      // 如果本地检查失败，尝试自动登录
      console.log('本地登录状态无效，尝试自动登录...')
      const autoLoginSuccess = await userStore.checkAutoLogin()
      
      if (!autoLoginSuccess) {
        // 自动登录也失败，跳转到登录页
        console.log('自动登录失败，跳转到登录页')
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        })
        
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/auth/login'
          })
        }, 2000)
        
        return false
      } else {
        console.log('自动登录成功')
        return true
      }
    } else {
      console.log('用户已登录，状态有效')
      return true
    }
    
  } catch (error) {
    console.error('检查用户登录状态失败:', error)
    
    // 出错时跳转到登录页
    uni.reLaunch({
      url: '/pages/auth/login'
    })
    
    return false
  }
}

// 检查日程提醒 (保留基础功能)
const checkScheduleReminders = (currentTime) => {
  try {
    // 获取当前时间的事件
    const currentDate = new Date(currentTime)
    const todayEvents = allEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === currentDate.toDateString()
    })
    
    // 检查是否有即将到来的事件需要提醒
    todayEvents.forEach(event => {
      const eventTime = new Date(event.date)
      const timeDiff = eventTime.getTime() - currentTime
      
      // 提前15分钟提醒
      if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000) {
        const reminderKey = `reminder_${event.id}_${eventTime.getTime()}`
        
        // 检查是否已经提醒过
        const hasReminded = uni.getStorageSync(reminderKey)
        if (!hasReminded) {
          // 显示提醒
          uni.showToast({
            title: `${event.title} 即将开始`,
            icon: 'none',
            duration: 3000
          })
          
          // 标记已提醒
          uni.setStorageSync(reminderKey, true)
          
          // 设置1小时后清除提醒标记
          setTimeout(() => {
            uni.removeStorageSync(reminderKey)
          }, 60 * 60 * 1000)
        }
      }
    })
    
  } catch (error) {
    console.error('检查日程提醒失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.schedule-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

// 页面滑动容器
.page-swiper {
  flex: 1;
  padding-top: 10rpx; /* 为固定头部留出空间 - 优化空白区域 */
}

.swiper-page {
  height: 100%;
}

.page-scroll {
  height: 100%;
}

.page-content {
  padding: 10rpx 20rpx 120rpx; // 正常上边距，为底部导航栏留空间
}

// 页面固定标题栏
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7rpx 20rpx;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.05);
  
  .header-tabs {
    display: flex;
    gap: 32rpx;
    flex: 1;
  }
  
  .header-tab-item {
    position: relative;
    padding: 8rpx 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    
    &:active {
      transform: scale(0.96);
    }
    
    &.tab-active {
      .header-tab-text {
        color: rgba(255, 255, 255, 0.95);
        font-weight: 600;
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 24rpx;
        height: 3rpx;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 2rpx;
        box-shadow: 0 2rpx 6rpx rgba(255, 255, 255, 0.3);
      }
    }
    
    .header-tab-text {
      color: rgba(255, 255, 255, 0.75);
      font-size: 26rpx;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
    }
  }
  
  .date-display-label {
    position: relative;
    padding: 8rpx 16rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16rpx;
    margin-left: 16rpx;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    
    &:active {
      transform: scale(0.96);
      background: rgba(255, 255, 255, 0.2);
    }
    
    .date-display-text {
      color: rgba(255, 255, 255, 0.9);
      font-size: 24rpx;
      font-weight: 500;
      white-space: nowrap;
      line-height: 1.4;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 16rpx;
    margin-left: 24rpx;
  }
  
  .debug-info {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 8rpx 16rpx;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  }
  
  .debug-text {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.8);
  }
  
  .debug-btn {
    width: 60rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    
    &:active {
      transform: scale(0.96);
    }
    
    .sync-count {
      padding: 2rpx 8rpx;
      border-radius: 6rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 20rpx;
      font-weight: 600;
      min-width: 24rpx;
      text-align: center;
    }
    
    .sync-icon {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.6);
    }
  }
  
  .add-event-btn {
    width: 60rpx;
    height: 60rpx;
    border-radius: 16rpx;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.12);
    position: relative;
    z-index: 102;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    
    &:active {
      transform: scale(0.96);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    }
    
    .icon-add {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.9);
      font-weight: normal;
      position: relative;
      z-index: 1;
      line-height: 1;
    }
  }
}

// 日历页滚动区域
.calendar-scroll {
  margin-top: 80rpx; // 调整为页面头部高度
  padding-top: 0;
  
  .page-content {
    padding-top: 0;
  }
}

// 统计卡片行
.stats-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
  
  .stat-card {
    flex: 1;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16rpx;
    padding: 32rpx 24rpx;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    
    &:active {
      transform: scale(0.98);
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .stat-number {
        font-size: 48rpx;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
        margin-bottom: 8rpx;
      }
      
      .stat-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

// 卡片样式
.projects-list-card,
.shopping-list-card,
.shopping-stats {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  
  .card-header,
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .card-title,
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);
    }
    
    .card-actions,
    .add-btn {
      .action-btn,
      .add-btn {
        padding: 8rpx 16rpx;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 12rpx;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        &:active {
          transform: scale(0.96);
        }
        
        .action-text,
        .add-text {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }
}

// 购物统计特殊样式
.shopping-stats {
  .stats-row {
    margin-bottom: 0;
    
    .stat-item {
      flex: 1;
      text-align: center;
      
      .stat-number {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
        margin-bottom: 8rpx;
      }
      
      .stat-label {
        display: block;
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

// 购物清单项样式
.shopping-list {
  .shopping-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
    
    .item-checkbox {
      width: 40rpx;
      height: 40rpx;
      border-radius: 8rpx;
      border: 2px solid rgba(255, 255, 255, 0.3);
      margin-right: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      
      &.checkbox-checked {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.6);
      }
      
      .icon-checkmark {
        color: rgba(255, 255, 255, 0.9);
        font-size: 24rpx;
      }
    }
    
    .item-info {
      flex: 1;
      
      .item-name {
        display: block;
        font-size: 28rpx;
        color: rgba(255, 255, 255, 0.95);
        margin-bottom: 4rpx;
        
        &.item-completed {
          text-decoration: line-through;
          color: rgba(255, 255, 255, 0.6);
        }
      }
      
      .item-details {
        display: block;
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.7);
      }
    }
    
    .item-category {
      .category-tag {
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
        font-size: 20rpx;
        color: white;
      }
    }
  }
}

.empty-shopping {
  text-align: center;
  padding: 40rpx;
  
  .empty-text {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 20rpx;
  }
}

// 项目列表
.projects-list {
  .project-item {
    padding: 30rpx;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.3);
    margin-bottom: 20rpx;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
      background: rgba(255, 255, 255, 0.5);
    }
    
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .project-name {
        font-size: 32rpx;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
        flex: 1;
      }
      
      .project-priority {
        padding: 8rpx 16rpx;
        border-radius: 12rpx;
        
        .priority-text {
          font-size: 20rpx;
          color: white;
          text-transform: uppercase;
        }
      }
    }
    
    .project-progress {
      margin-bottom: 20rpx;
      
      .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12rpx;
        
        .progress-text {
          font-size: 24rpx;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .due-date {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.7);
        }
      }
      
      .progress-bar {
        height: 8rpx;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4rpx;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          border-radius: 4rpx;
          transition: width 0.3s ease;
        }
      }
    }
    
    .project-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .project-status {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.7);
      }
      
      .project-team {
        display: flex;
        gap: 12rpx;
        
        .team-member {
          font-size: 20rpx;
          color: #007AFF;
          background: rgba(0, 122, 255, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
        }
      }
    }
  }
}

// 日历页面样式
.calendar-page {
  // 日历毛玻璃容器
  .calendar-glass-container {
    margin-bottom: 20rpx;
    padding: 0;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border-radius: 24rpx;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
    
    // 星期标题行
    .calendar-weekdays {
      display: flex;
      padding: 0 20rpx 16rpx;
      position: relative;
      z-index: 2;
      
      .weekday-label {
        flex: 1;
        text-align: center;
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 600;
        padding: 0 4rpx;
      }
    }
    
    // 日历网格
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2rpx;
      padding: 0 20rpx 24rpx;
      position: relative;
      z-index: 2;
      
      .calendar-date {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 6rpx 2rpx;
        position: relative;
        transition: all 0.3s ease;
        border-radius: 12rpx;
        min-height: 80rpx;
        box-sizing: border-box;
      }
      
      // 今天日期特殊样式 - 无色毛玻璃效果
      .calendar-date.date-today {
        background: rgba(255, 255, 255, 0.15) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 16rpx !important;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08) !important;
        
        .date-number {
          color: rgba(255, 255, 255, 0.95) !important;
          font-weight: 700 !important;
          position: relative;
          z-index: 2;
        }
        
        .event-dots {
          position: relative;
          z-index: 2;
          
          .event-dot {
            box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.15);
          }
        }
      }
      
      // 选中日期样式
      .calendar-date.date-selected {
        background: linear-gradient(145deg, 
          #007AFF 0%, 
          #0056D6 100%);
        box-shadow: 
          0 6rpx 16rpx rgba(0, 122, 255, 0.4),
          0 2rpx 8rpx rgba(0, 122, 255, 0.3),
          inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
        
        .date-number {
          color: white;
          font-weight: 700;
          text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
        }
        
        .event-dots .event-dot {
          border: 1rpx solid rgba(255, 255, 255, 0.8);
        }
      }
      
      // 其他月份日期样式
      .calendar-date.date-other-month {
        opacity: 0.25;
        
        .date-number {
          color: rgba(255, 255, 255, 0.5);
        }
      }
      
      // 有事件的日期样式
      .calendar-date.date-has-events {
        .date-number {
          font-weight: 600;
        }
      }
      
      // 激活状态
      .calendar-date:active {
        transform: scale(0.95);
        background: rgba(255, 255, 255, 0.1);
      }
      
      // 日期数字样式
      .calendar-date .date-number {
        font-size: 30rpx;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 6rpx;
        line-height: 1;
      }
      
      // 事件点样式
      .calendar-date .event-dots {
        display: flex;
        gap: 3rpx;
        align-items: center;
        flex-wrap: wrap;
        justify-content: center;
        min-height: 16rpx;
        max-width: 100%;
        
        .event-dot {
          width: 6rpx;
          height: 6rpx;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
        }
        
        .more-events {
          font-size: 14rpx;
          color: rgba(255, 255, 255, 0.7);
          margin-left: 2rpx;
        }
      }
    }
  }
}

// 事件显示列表样式 - 三个毛玻璃区块
.event-day-container {
  margin-bottom: 20rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  
  .event-day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    position: relative;
    z-index: 2;
    
    .day-title {
      font-size: 32rpx;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);
    }
    
    .events-count {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.7);
    }
  }
  
  .events-list {
    position: relative;
    z-index: 2;
    
    .event-item {
      display: flex;
      align-items: center;
      gap: 20rpx;
      padding: 20rpx 0;
      border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:active {
        transform: scale(0.98);
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12rpx;
        margin: 0 -12rpx;
        padding: 20rpx 12rpx;
      }
      
      .event-priority {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 40rpx;
        
        .event-priority-icon {
          font-size: 28rpx;
          line-height: 1;
          opacity: 0.9;
          flex-shrink: 0;
        }
      }
      
      .event-time {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 80rpx;
        gap: 2rpx;
        
        .event-time-text {
          font-size: 26rpx;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          text-align: center;
          line-height: 1.2;
        }
        
        .event-duration-text {
          font-size: 22rpx;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 400;
          text-align: center;
          line-height: 1.2;
        }
      }
      
      .event-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4rpx;
        
        .event-title-row {
          display: flex;
          align-items: center;
          gap: 8rpx;
          
          .event-category-icon {
            font-size: 28rpx;
            line-height: 1;
            opacity: 0.9;
            flex-shrink: 0;
          }
          
          .event-title {
            font-size: 30rpx;
            color: rgba(255, 255, 255, 0.95);
            font-weight: 500;
            line-height: 1.3;
            flex: 1;
          }
        }
        
        .event-location-row {
          display: flex;
          align-items: center;
          gap: 8rpx;
          
          .event-location-icon {
            font-size: 24rpx;
            line-height: 1;
            opacity: 0.8;
            flex-shrink: 0;
          }
          
          .event-location {
            font-size: 24rpx;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.2;
            flex: 1;
          }
        }
      }
    }
    
    .no-events {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40rpx 0;
      
      .no-events-text {
        font-size: 28rpx;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}

// 展开/收缩按钮容器样式
.events-toggle-container {
  margin-bottom: 20rpx; // 与事件容器相同的底部边距
  
  .toggle-button-wrapper {
    transition: all 0.3s ease;
    width: 100%; // 按钮包装器占满宽度
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .toggle-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 24rpx; // 与事件容器相同的内边距
    width: 100%; // 按钮占满容器宽度
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border-radius: 24rpx;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box; // 确保border和padding包含在宽度内
    
    &:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2rpx);
      box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.08);
    }
    
    .toggle-text {
      font-size: 28rpx;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .toggle-icon {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.7);
      transition: transform 0.3s ease;
    }
  }
}

// iPhone风格日期选择器样式
.date-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
}

.date-picker-sheet {
  width: 100%;
  background: #F8F8F8;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
}

// 弹窗头部
.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #F8F8F8;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);
  position: relative;
  
  .header-btn {
    min-width: 120rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16rpx;
    transition: all 0.2s ease;
    
    .btn-text {
      font-size: 32rpx;
      font-weight: 500;
    }
    
    &.cancel-btn {
      justify-content: flex-start;
      
      .btn-text {
        color: #007AFF;
      }
      
      &:active {
        background: rgba(0, 122, 255, 0.1);
      }
    }
    
    &.confirm-btn {
      justify-content: flex-end;
      
      .btn-text {
        color: #007AFF;
        font-weight: 600;
      }
      
      &:active {
        background: rgba(0, 122, 255, 0.1);
      }
    }
  }
  
  .header-title {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .title-text {
      font-size: 36rpx;
      font-weight: 600;
      color: #1a1a1a;
    }
  }
}

// 选择器主体
.picker-body {
  position: relative;
  height: 560rpx;
  background: #F8F8F8;
  overflow: hidden;
}

// 选择指示器
.picker-indicator {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 88rpx;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border-top: 1rpx solid rgba(0, 0, 0, 0.08);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);
  z-index: 2;
  pointer-events: none;
  box-shadow: 
    0 2rpx 8rpx rgba(0, 0, 0, 0.04),
    0 1rpx 4rpx rgba(0, 0, 0, 0.02);
}

// 滚轮容器
.wheels-container {
  display: flex;
  height: 100%;
  position: relative;
  z-index: 1;
}

.wheel-column {
  flex: 1;
  height: 100%;
  position: relative;
}

.wheel-picker {
  height: 100%;
  
  picker-view-column {
    height: 100%;
  }
}

.wheel-item {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  position: relative;
  
  .item-text {
    font-size: 40rpx;
    font-weight: 400;
    color: #1a1a1a;
    line-height: 1;
  }
  
  .item-unit {
    font-size: 32rpx;
    font-weight: 300;
    color: #999;
    line-height: 1;
    margin-top: 2rpx;
  }
}

// 上下遮罩渐变
.picker-mask-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 236rpx;
  background: linear-gradient(180deg, 
    rgba(248, 248, 248, 0.95) 0%,
    rgba(248, 248, 248, 0.8) 30%,
    rgba(248, 248, 248, 0.4) 60%,
    rgba(248, 248, 248, 0) 100%);
  z-index: 3;
  pointer-events: none;
}

.picker-mask-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 236rpx;
  background: linear-gradient(0deg, 
    rgba(248, 248, 248, 0.95) 0%,
    rgba(248, 248, 248, 0.8) 30%,
    rgba(248, 248, 248, 0.4) 60%,
    rgba(248, 248, 248, 0) 100%);
  z-index: 3;
  pointer-events: none;
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
