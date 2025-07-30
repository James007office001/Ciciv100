<template>
  <view class="enhanced-profile-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-left">
        <text class="navbar-title">个人中心</text>
      </view>
      <view class="navbar-right">
        <view class="nav-btn" @click="goToSettings">
          <uni-icons type="gear" size="20" color="#333"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 用户信息头部 -->
    <view class="user-header">
      <view class="user-avatar-section">
        <image 
          class="user-avatar" 
          :src="userInfo.avatar || defaultAvatar" 
          mode="aspectFill" 
          @click="previewAvatar"
        />
        <view class="avatar-edit-btn" @click="changeAvatar">
          <uni-icons type="camera" size="14" color="#fff"></uni-icons>
        </view>
      </view>
      
      <view class="user-info">
        <view class="user-name-row">
          <text class="user-name">{{ userInfo.nickname || userInfo.username || '未设置' }}</text>
          <view class="user-badges">
            <view class="badge verified" v-if="userInfo.verified">
              <uni-icons type="checkmarkempty" size="12" color="#52c41a"></uni-icons>
            </view>
            <view class="badge vip" v-if="userInfo.membershipType === 'vip'">VIP</view>
          </view>
        </view>
        <text class="user-phone">{{ maskPhone(userInfo.phone) }}</text>
        <text class="user-bio">{{ userInfo.bio || '这个人很懒，什么都没留下~' }}</text>
        
        <view class="user-stats">
          <view class="stat-item">
            <text class="stat-number">{{ userStats.postsCount || 0 }}</text>
            <text class="stat-label">动态</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ userStats.followersCount || 0 }}</text>
            <text class="stat-label">关注者</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ userStats.followingCount || 0 }}</text>
            <text class="stat-label">关注</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 家庭群组快捷入口 -->
    <view class="family-group-section" v-if="currentFamilyGroup">
      <view class="section-header">
        <text class="section-title">我的家庭</text>
        <view class="section-action" @click="goToFamilyGroups">
          <text class="action-text">管理</text>
          <uni-icons type="arrowright" size="14" color="#999"></uni-icons>
        </view>
      </view>
      
      <view class="family-group-card" @click="goToFamilyGroupDetail">
        <image 
          class="group-avatar" 
          :src="currentFamilyGroup.avatar || defaultGroupAvatar" 
          mode="aspectFill"
        />
        <view class="group-info">
          <text class="group-name">{{ currentFamilyGroup.name }}</text>
          <text class="group-members">{{ currentFamilyGroup.memberCount }} 位成员</text>
        </view>
        <view class="group-arrow">
          <uni-icons type="arrowright" size="16" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="editProfile">
          <view class="menu-icon">
            <uni-icons type="person" size="20" color="#007aff"></uni-icons>
          </view>
          <text class="menu-text">编辑资料</text>
          <view class="menu-arrow">
            <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
        
        <view class="menu-item" @click="goToFamilyGroups">
          <view class="menu-icon">
            <uni-icons type="home" size="20" color="#52c41a"></uni-icons>
          </view>
          <text class="menu-text">家庭群组</text>
          <view class="menu-badge" v-if="unreadFamilyMessages > 0">
            <text class="badge-text">{{ unreadFamilyMessages > 99 ? '99+' : unreadFamilyMessages }}</text>
          </view>
          <view class="menu-arrow">
            <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
        
        <view class="menu-item" @click="goToMyPosts">
          <view class="menu-icon">
            <uni-icons type="chatbubble" size="20" color="#ff9500"></uni-icons>
          </view>
          <text class="menu-text">我的动态</text>
          <view class="menu-arrow">
            <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
        
        <view class="menu-item" @click="goToFavorites">
          <view class="menu-icon">
            <uni-icons type="heart" size="20" color="#ff3b30"></uni-icons>
          </view>
          <text class="menu-text">我的收藏</text>
          <view class="menu-arrow">
            <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="menu-item" @click="goToFriends">
          <view class="menu-icon">
            <uni-icons type="contact" size="20" color="#007aff"></uni-icons>
          </view>
          <text class="menu-text">我的好友</text>
          <view class="menu-arrow">
            <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
        
        <view class="menu-item" @click="goToPrivacy">
          <view class="menu-icon">
            <uni-icons type="locked" size="20" color="#8e8e93"></uni-icons>
          </view>
          <text class="menu-text">隐私设置</text>
          <view class="menu-arrow">
            <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
        
        <view class="menu-item" @click="goToHelp">
          <view class="menu-icon">
            <uni-icons type="help" size="20" color="#34c759"></uni-icons>
          </view>
          <text class="menu-text">帮助中心</text>
          <view class="menu-arrow">
            <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
        
        <view class="menu-item" @click="goToAbout">
          <view class="menu-icon">
            <uni-icons type="info" size="20" color="#007aff"></uni-icons>
          </view>
          <text class="menu-text">关于CICI</text>
          <view class="menu-arrow">
            <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="confirmLogout">退出登录</button>
    </view>

    <!-- 编辑资料弹窗 -->
    <uni-popup ref="editProfilePopup" type="center">
      <view class="edit-profile-modal">
        <view class="modal-header">
          <text class="modal-title">编辑资料</text>
          <view class="modal-close" @click="closeEditProfile">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <view class="modal-content">
          <view class="form-item">
            <text class="form-label">昵称</text>
            <input 
              class="form-input" 
              v-model="editForm.nickname" 
              placeholder="请输入昵称"
              maxlength="20"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">个人简介</text>
            <textarea 
              class="form-textarea" 
              v-model="editForm.bio" 
              placeholder="请输入个人简介"
              maxlength="100"
            ></textarea>
          </view>
          
          <view class="form-item">
            <text class="form-label">性别</text>
            <view class="gender-options">
              <view 
                class="gender-option" 
                :class="{ active: editForm.gender === 'male' }"
                @click="editForm.gender = 'male'"
              >
                <text class="gender-text">男</text>
              </view>
              <view 
                class="gender-option" 
                :class="{ active: editForm.gender === 'female' }"
                @click="editForm.gender = 'female'"
              >
                <text class="gender-text">女</text>
              </view>
              <view 
                class="gender-option" 
                :class="{ active: editForm.gender === 'other' }"
                @click="editForm.gender = 'other'"
              >
                <text class="gender-text">其他</text>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">生日</text>
            <picker 
              mode="date" 
              :value="editForm.birthday"
              @change="onBirthdayChange"
            >
              <view class="form-picker">
                <text class="picker-text">{{ editForm.birthday || '请选择生日' }}</text>
                <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
              </view>
            </picker>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeEditProfile">取消</button>
          <button class="modal-btn confirm-btn" @click="saveProfile">保存</button>
        </view>
      </view>
    </uni-popup>

    <!-- 加载状态 -->
    <view class="loading-overlay" v-if="loading">
      <uni-load-more status="loading" :content-text="loadingText"></uni-load-more>
    </view>
  </view>
</template>

<script>
import { userService } from '@/src/services/userService.js'
import { storage } from '@/src/utils/storage.js'

export default {
  name: 'EnhancedProfile',
  data() {
    return {
      userInfo: {},
      userStats: {},
      currentFamilyGroup: null,
      unreadFamilyMessages: 0,
      
      loading: false,
      loadingText: { loading: '加载中...', more: '加载更多', noMore: '没有更多了' },
      
      // 编辑表单
      editForm: {
        nickname: '',
        bio: '',
        gender: '',
        birthday: ''
      },
      
      // 默认头像
      defaultAvatar: '/static/images/default-avatar.png',
      defaultGroupAvatar: '/static/images/default-group-avatar.png'
    }
  },
  
  onLoad() {
    this.loadUserData()
    this.loadCurrentFamilyGroup()
  },
  
  onShow() {
    // 页面显示时刷新数据
    this.loadUserData()
    this.loadCurrentFamilyGroup()
  },
  
  methods: {
    // ==================== 数据加载 ====================
    
    async loadUserData() {
      try {
        this.loading = true
        
        // 从存储获取用户信息
        this.userInfo = await storage.getUserInfo() || {}
        
        // 获取最新用户信息
        const response = await userService.getCurrentUser()
        if (response.success) {
          this.userInfo = response.data
          await storage.setUserInfo(this.userInfo)
        }
        
        // 获取用户统计
        this.loadUserStats()
        
      } catch (error) {
        console.error('Load user data error:', error)
      } finally {
        this.loading = false
      }
    },
    
    async loadUserStats() {
      try {
        const response = await userService.getUserStats()
        if (response.success) {
          this.userStats = response.data
        }
      } catch (error) {
        console.error('Load user stats error:', error)
      }
    },
    
    async loadCurrentFamilyGroup() {
      try {
        // 获取当前家庭群组
        const currentGroupId = await storage.getItem('current_family_group_id')
        if (currentGroupId) {
          const response = await userService.getFamilyGroupDetail(currentGroupId)
          if (response.success) {
            this.currentFamilyGroup = response.data
            
            // 获取未读消息数
            this.loadUnreadMessages()
          }
        }
      } catch (error) {
        console.error('Load current family group error:', error)
      }
    },
    
    async loadUnreadMessages() {
      try {
        const response = await userService.getUnreadMessagesCount('family')
        if (response.success) {
          this.unreadFamilyMessages = response.data.count || 0
        }
      } catch (error) {
        console.error('Load unread messages error:', error)
      }
    },
    
    // ==================== 用户操作 ====================
    
    previewAvatar() {
      if (this.userInfo.avatar) {
        uni.previewImage({
          urls: [this.userInfo.avatar]
        })
      }
    },
    
    changeAvatar() {
      uni.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: (res) => {
          const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
          
          uni.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: sourceType,
            success: (res) => {
              this.uploadAvatar(res.tempFilePaths[0])
            }
          })
        }
      })
    },
    
    async uploadAvatar(filePath) {
      try {
        uni.showLoading({ title: '上传中...' })
        
        const response = await userService.uploadAvatar(filePath)
        
        if (response.success) {
          this.userInfo.avatar = response.data.avatar
          await storage.setUserInfo(this.userInfo)
          
          uni.hideLoading()
          uni.showToast({
            title: '头像更新成功',
            icon: 'success'
          })
        } else {
          throw new Error(response.message || '上传失败')
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Upload avatar error:', error)
        uni.showToast({
          title: error.message || '上传失败',
          icon: 'none'
        })
      }
    },
    
    editProfile() {
      // 填充编辑表单
      this.editForm = {
        nickname: this.userInfo.nickname || '',
        bio: this.userInfo.bio || '',
        gender: this.userInfo.gender || '',
        birthday: this.userInfo.birthday || ''
      }
      
      this.$refs.editProfilePopup.open()
    },
    
    closeEditProfile() {
      this.$refs.editProfilePopup.close()
    },
    
    onBirthdayChange(e) {
      this.editForm.birthday = e.detail.value
    },
    
    async saveProfile() {
      try {
        uni.showLoading({ title: '保存中...' })
        
        const response = await userService.updateUserProfile(this.editForm)
        
        if (response.success) {
          // 更新本地用户信息
          Object.assign(this.userInfo, this.editForm)
          await storage.setUserInfo(this.userInfo)
          
          uni.hideLoading()
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          this.closeEditProfile()
        } else {
          throw new Error(response.message || '保存失败')
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Save profile error:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'none'
        })
      }
    },
    
    // ==================== 导航操作 ====================
    
    goToFamilyGroups() {
      uni.navigateTo({
        url: '/pages/family/group-list'
      })
    },
    
    goToFamilyGroupDetail() {
      if (this.currentFamilyGroup) {
        uni.navigateTo({
          url: `/pages/family/group-detail?groupId=${this.currentFamilyGroup._id}`
        })
      }
    },
    
    goToMyPosts() {
      uni.navigateTo({
        url: '/pages/profile/my-posts'
      })
    },
    
    goToFavorites() {
      uni.navigateTo({
        url: '/pages/profile/favorites'
      })
    },
    
    goToFriends() {
      uni.navigateTo({
        url: '/pages/contacts/friends'
      })
    },
    
    goToPrivacy() {
      uni.navigateTo({
        url: '/pages/settings/privacy'
      })
    },
    
    goToHelp() {
      uni.navigateTo({
        url: '/pages/settings/help'
      })
    },
    
    goToAbout() {
      uni.navigateTo({
        url: '/pages/settings/about'
      })
    },
    
    goToSettings() {
      uni.navigateTo({
        url: '/pages/settings/index'
      })
    },
    
    // ==================== 其他操作 ====================
    
    confirmLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            this.logout()
          }
        }
      })
    },
    
    async logout() {
      try {
        uni.showLoading({ title: '退出中...' })
        
        // 调用退出登录API
        await userService.logout()
        
        // 清除本地数据
        await storage.clearUserData()
        
        uni.hideLoading()
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
        
        // 跳转到登录页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/auth/login'
          })
        }, 1500)
        
      } catch (error) {
        uni.hideLoading()
        console.error('Logout error:', error)
        
        // 即使API调用失败，也清除本地数据
        await storage.clearUserData()
        
        uni.reLaunch({
          url: '/pages/auth/login'
        })
      }
    },
    
    // ==================== 工具方法 ====================
    
    maskPhone(phone) {
      if (!phone) return ''
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
  }
}
</script>

<style lang="scss" scoped>
.enhanced-profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// ==================== 导航栏 ====================
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 15px;
  background-color: #fff;
  border-bottom: 1px solid #e5e5e5;
  
  .navbar-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  
  .nav-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 16px;
  }
}

// ==================== 用户信息头部 ====================
.user-header {
  display: flex;
  padding: 20px;
  background-color: #fff;
  margin-bottom: 10px;
  
  .user-avatar-section {
    position: relative;
    margin-right: 15px;
    
    .user-avatar {
      width: 80px;
      height: 80px;
      border-radius: 40px;
    }
    
    .avatar-edit-btn {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 24px;
      height: 24px;
      background-color: #007aff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
    }
  }
  
  .user-info {
    flex: 1;
    
    .user-name-row {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      
      .user-name {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin-right: 8px;
      }
      
      .user-badges {
        display: flex;
        gap: 4px;
        
        .badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          
          &.verified {
            background-color: #f6ffed;
            color: #52c41a;
          }
          
          &.vip {
            background-color: #fff7e6;
            color: #d48806;
            font-weight: 600;
          }
        }
      }
    }
    
    .user-phone {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .user-bio {
      display: block;
      font-size: 14px;
      color: #999;
      margin-bottom: 10px;
      line-height: 1.4;
    }
    
    .user-stats {
      display: flex;
      gap: 20px;
      
      .stat-item {
        text-align: center;
        
        .stat-number {
          display: block;
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 2px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
}

// ==================== 家庭群组部分 ====================
.family-group-section {
  background-color: #fff;
  margin-bottom: 10px;
  padding: 15px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  
  .section-action {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .action-text {
      font-size: 14px;
      color: #007aff;
    }
  }
}

.family-group-card {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 12px;
  
  .group-avatar {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    margin-right: 12px;
  }
  
  .group-info {
    flex: 1;
    
    .group-name {
      display: block;
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 2px;
    }
    
    .group-members {
      font-size: 13px;
      color: #999;
    }
  }
  
  .group-arrow {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// ==================== 功能菜单 ====================
.menu-section {
  .menu-group {
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: 10px;
    overflow: hidden;
    
    .menu-item {
      display: flex;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .menu-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        border-radius: 16px;
        margin-right: 12px;
      }
      
      .menu-text {
        flex: 1;
        font-size: 16px;
        color: #333;
      }
      
      .menu-badge {
        background-color: #ff3b30;
        border-radius: 10px;
        padding: 2px 6px;
        margin-right: 8px;
        
        .badge-text {
          font-size: 10px;
          color: #fff;
        }
      }
      
      .menu-arrow {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

// ==================== 退出登录 ====================
.logout-section {
  padding: 15px;
  
  .logout-btn {
    width: 100%;
    height: 44px;
    background-color: #ff3b30;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
  }
}

// ==================== 编辑资料弹窗 ====================
.edit-profile-modal {
  width: 320px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid #e5e5e5;
    
    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    
    .modal-close {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .modal-content {
    padding: 20px;
    max-height: 400px;
    overflow-y: auto;
    
    .form-item {
      margin-bottom: 20px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .form-label {
        display: block;
        font-size: 14px;
        color: #333;
        margin-bottom: 8px;
      }
      
      .form-input,
      .form-textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #e5e5e5;
        border-radius: 8px;
        font-size: 16px;
        box-sizing: border-box;
      }
      
      .form-textarea {
        height: 80px;
        resize: none;
      }
      
      .form-picker {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border: 1px solid #e5e5e5;
        border-radius: 8px;
        
        .picker-text {
          font-size: 16px;
          color: #333;
        }
      }
      
      .gender-options {
        display: flex;
        gap: 10px;
        
        .gender-option {
          flex: 1;
          padding: 10px;
          text-align: center;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          
          &.active {
            background-color: #007aff;
            border-color: #007aff;
            
            .gender-text {
              color: #fff;
            }
          }
          
          .gender-text {
            font-size: 16px;
            color: #333;
          }
        }
      }
    }
  }
  
  .modal-footer {
    display: flex;
    border-top: 1px solid #e5e5e5;
    
    .modal-btn {
      flex: 1;
      height: 50px;
      border: none;
      font-size: 16px;
      
      &.cancel-btn {
        background-color: #f5f5f5;
        color: #666;
      }
      
      &.confirm-btn {
        background-color: #007aff;
        color: #fff;
      }
    }
  }
}

// ==================== 加载状态 ====================
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>
