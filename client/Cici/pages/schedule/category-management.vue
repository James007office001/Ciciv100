<template>
  <view class="category-management-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left">
        <view class="back-btn" @click="goBack">
          <text class="icon-back">←</text>
        </view>
      </view>
      <view class="header-title">
        <text class="title-text">事件分类管理</text>
      </view>
      <view class="header-right">
        <view class="add-btn" @click="showAddCategoryModal">
          <text class="icon-add">+</text>
        </view>
      </view>
    </view>

    <!-- 分类列表 -->
    <scroll-view class="category-list" scroll-y="true">
      <view 
        v-for="category in categories"
        :key="category.id"
        class="category-item"
        @click="editCategory(category)"
      >
        <view class="category-icon">
          <text class="icon-text">{{ category.icon }}</text>
        </view>
        <view class="category-info">
          <text class="category-name">{{ category.name }}</text>
          <text class="category-desc">{{ category.description }}</text>
        </view>
        <view class="category-status">
          <view 
            class="status-badge"
            :class="{ 'status-active': category.isActive }"
          >
            <text class="status-text">{{ category.isActive ? '启用' : '禁用' }}</text>
          </view>
        </view>
        <view class="category-actions">
          <view class="action-btn" @click.stop="toggleCategoryStatus(category)">
            <text class="action-text">{{ category.isActive ? '禁用' : '启用' }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 添加/编辑分类弹窗 -->
    <view v-if="showModal" class="modal-overlay" @click="closeModal">
      <view class="modal-container" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEdit ? '编辑分类' : '添加分类' }}</text>
          <view class="close-btn" @click="closeModal">
            <text class="close-text">×</text>
          </view>
        </view>
        
        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">分类名称</text>
            <input 
              v-model="formData.name"
              class="form-input"
              placeholder="请输入分类名称"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">分类图标</text>
            <input 
              v-model="formData.icon"
              class="form-input"
              placeholder="请输入图标(emoji)"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">分类颜色</text>
            <input 
              v-model="formData.color"
              class="form-input"
              placeholder="请输入颜色值(如：#007AFF)"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">分类描述</text>
            <textarea 
              v-model="formData.description"
              class="form-textarea"
              placeholder="请输入分类描述"
            ></textarea>
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="btn btn-cancel" @click="closeModal">
            <text class="btn-text">取消</text>
          </view>
          <view class="btn btn-confirm" @click="saveCategory">
            <text class="btn-text">{{ isEdit ? '更新' : '添加' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  loadEventCategories, 
  saveEventCategories, 
  addEventCategory,
  updateEventCategory,
  deleteEventCategory
} from '../../src/utils/eventCategoryDatabase.js'

// 页面状态
const categories = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const currentCategory = ref(null)

// 表单数据
const formData = reactive({
  name: '',
  icon: '',
  color: '',
  description: ''
})

// 加载分类数据
const loadCategories = () => {
  try {
    const allCategories = uni.getStorageSync('cici_event_categories') || []
    categories.value = allCategories
    console.log('加载了', allCategories.length, '个事件分类')
  } catch (error) {
    console.error('加载分类失败:', error)
    categories.value = []
  }
}

// 返回上一页
const goBack = () => {
  console.log('返回上一页，来源:', fromPage.value)
  
  // 如果是从创建事件页面来的，直接返回
  if (fromPage.value === 'create-event') {
    uni.navigateBack()
  } else {
    // 否则正常返回
    uni.navigateBack()
  }
}

// 显示添加分类弹窗
const showAddCategoryModal = () => {
  isEdit.value = false
  currentCategory.value = null
  resetForm()
  showModal.value = true
}

// 编辑分类
const editCategory = (category) => {
  isEdit.value = true
  currentCategory.value = category
  formData.name = category.name
  formData.icon = category.icon
  formData.color = category.color
  formData.description = category.description
  showModal.value = true
}

// 重置表单
const resetForm = () => {
  formData.name = ''
  formData.icon = ''
  formData.color = ''
  formData.description = ''
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  resetForm()
}

// 保存分类
const saveCategory = () => {
  if (!formData.name || !formData.icon) {
    uni.showToast({
      title: '请填写分类名称和图标',
      icon: 'none'
    })
    return
  }

  try {
    if (isEdit.value && currentCategory.value) {
      // 更新分类
      const updatedCategory = updateEventCategory(currentCategory.value.id, {
        name: formData.name,
        icon: formData.icon,
        color: formData.color || '#007AFF',
        description: formData.description
      })
      
      if (updatedCategory) {
        uni.showToast({
          title: '分类更新成功',
          icon: 'success'
        })
      }
    } else {
      // 添加新分类
      const newCategory = addEventCategory({
        name: formData.name,
        icon: formData.icon,
        color: formData.color || '#007AFF',
        description: formData.description
      })
      
      if (newCategory) {
        uni.showToast({
          title: '分类添加成功',
          icon: 'success'
        })
        
        // 如果是从创建事件页面来的，保存新增分类信息
        if (fromPage.value === 'create-event') {
          try {
            uni.setStorageSync('last_added_category', newCategory)
            console.log('保存新增分类信息:', newCategory)
          } catch (error) {
            console.error('保存新增分类信息失败:', error)
          }
        }
      }
    }
    
    // 重新加载分类列表
    loadCategories()
    closeModal()
  } catch (error) {
    console.error('保存分类失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}

// 切换分类状态
const toggleCategoryStatus = (category) => {
  try {
    const updatedCategory = updateEventCategory(category.id, {
      isActive: !category.isActive
    })
    
    if (updatedCategory) {
      uni.showToast({
        title: category.isActive ? '已禁用' : '已启用',
        icon: 'success'
      })
      loadCategories()
    }
  } catch (error) {
    console.error('切换状态失败:', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

// 页面加载时初始化
// 页面来源参数
const fromPage = ref('')

onMounted(() => {
  loadCategories()
  
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  
  // 保存来源页面参数
  if (options.from) {
    fromPage.value = options.from
    console.log('分类管理页面来源:', fromPage.value)
  }
})
</script>

<style lang="scss" scoped>
.category-management-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 32rpx;
    padding-top: calc(var(--status-bar-height) + 20rpx);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .header-left, .header-right {
      width: 80rpx;
      display: flex;
      justify-content: center;
    }
    
    .back-btn, .add-btn {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.95);
        background: rgba(255, 255, 255, 0.3);
      }
      
      .icon-back, .icon-add {
        color: rgba(255, 255, 255, 0.9);
        font-size: 32rpx;
        font-weight: bold;
      }
    }
    
    .header-title {
      flex: 1;
      text-align: center;
      
      .title-text {
        color: rgba(255, 255, 255, 0.95);
        font-size: 32rpx;
        font-weight: 600;
      }
    }
  }
  
  .category-list {
    flex: 1;
    padding: 24rpx;
    
    .category-item {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.98);
        background: rgba(255, 255, 255, 0.15);
      }
      
      .category-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        
        .icon-text {
          font-size: 40rpx;
        }
      }
      
      .category-info {
        flex: 1;
        
        .category-name {
          color: rgba(255, 255, 255, 0.95);
          font-size: 28rpx;
          font-weight: 600;
          display: block;
          margin-bottom: 8rpx;
        }
        
        .category-desc {
          color: rgba(255, 255, 255, 0.7);
          font-size: 24rpx;
          line-height: 1.4;
        }
      }
      
      .category-status {
        margin-right: 16rpx;
        
        .status-badge {
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
          background: rgba(255, 255, 255, 0.2);
          
          &.status-active {
            background: rgba(52, 199, 89, 0.3);
          }
          
          .status-text {
            color: rgba(255, 255, 255, 0.9);
            font-size: 22rpx;
          }
        }
      }
      
      .category-actions {
        .action-btn {
          padding: 12rpx 20rpx;
          border-radius: 20rpx;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          
          &:active {
            transform: scale(0.95);
          }
          
          .action-text {
            color: rgba(255, 255, 255, 0.9);
            font-size: 24rpx;
          }
        }
      }
    }
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    
    .modal-container {
      width: 600rpx;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24rpx;
      overflow: hidden;
      
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 32rpx;
        background: rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        
        .modal-title {
          color: rgba(0, 0, 0, 0.9);
          font-size: 32rpx;
          font-weight: 600;
        }
        
        .close-btn {
          width: 48rpx;
          height: 48rpx;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          
          .close-text {
            color: rgba(0, 0, 0, 0.6);
            font-size: 32rpx;
          }
        }
      }
      
      .modal-body {
        padding: 32rpx;
        
        .form-group {
          margin-bottom: 24rpx;
          
          .form-label {
            color: rgba(0, 0, 0, 0.8);
            font-size: 28rpx;
            font-weight: 500;
            display: block;
            margin-bottom: 12rpx;
          }
          
          .form-input, .form-textarea {
            width: 100%;
            padding: 16rpx;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 12rpx;
            background: rgba(255, 255, 255, 0.8);
            color: rgba(0, 0, 0, 0.9);
            font-size: 26rpx;
            box-sizing: border-box;
          }
          
          .form-textarea {
            height: 120rpx;
            resize: none;
          }
        }
      }
      
      .modal-footer {
        display: flex;
        gap: 16rpx;
        padding: 32rpx;
        background: rgba(255, 255, 255, 0.1);
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        
        .btn {
          flex: 1;
          height: 80rpx;
          border-radius: 12rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          
          &:active {
            transform: scale(0.98);
          }
          
          .btn-text {
            font-size: 28rpx;
            font-weight: 500;
          }
          
          &.btn-cancel {
            background: rgba(0, 0, 0, 0.1);
            
            .btn-text {
              color: rgba(0, 0, 0, 0.6);
            }
          }
          
          &.btn-confirm {
            background: #007AFF;
            
            .btn-text {
              color: white;
            }
          }
        }
      }
    }
  }
}
</style>
