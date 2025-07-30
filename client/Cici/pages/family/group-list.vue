<template>
  <view class="family-group-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-left" @click="goBack">
        <uni-icons type="back" size="20" color="#333"></uni-icons>
      </view>
      <view class="navbar-title">家庭群组</view>
      <view class="navbar-right" @click="showCreateModal = true">
        <uni-icons type="plus" size="20" color="#333"></uni-icons>
      </view>
    </view>

    <!-- 当前群组信息 -->
    <view class="current-group-section" v-if="currentGroup">
      <view class="group-card">
        <view class="group-header">
          <image class="group-avatar" :src="currentGroup.avatar || defaultGroupAvatar" mode="aspectFill"></image>
          <view class="group-info">
            <text class="group-name">{{ currentGroup.name }}</text>
            <text class="group-member-count">{{ currentGroup.memberCount }} 位成员</text>
          </view>
          <view class="group-actions">
            <view class="action-btn" @click="manageGroup">
              <uni-icons type="gear" size="16" color="#666"></uni-icons>
            </view>
          </view>
        </view>
        
        <!-- 成员列表预览 -->
        <view class="members-preview">
          <view class="members-title">成员</view>
          <scroll-view class="members-scroll" scroll-x="true">
            <view class="member-item" v-for="member in currentGroup.members" :key="member.userId">
              <image class="member-avatar" :src="member.avatar || defaultAvatar" mode="aspectFill"></image>
              <text class="member-name">{{ member.nickname || member.username }}</text>
              <view class="member-role" v-if="member.role === 'admin'">
                <uni-icons type="crown" size="12" color="#ffd700"></uni-icons>
              </view>
            </view>
            <view class="member-item add-member" @click="inviteMembers">
              <view class="add-member-btn">
                <uni-icons type="plus" size="20" color="#999"></uni-icons>
              </view>
              <text class="member-name">邀请</text>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <!-- 群组列表 -->
    <view class="groups-section">
      <view class="section-title">我的群组</view>
      <view class="groups-list">
        <view 
          class="group-item" 
          v-for="group in familyGroups" 
          :key="group._id"
          @click="switchGroup(group)"
          :class="{ active: currentGroup && group._id === currentGroup._id }"
        >
          <image class="group-item-avatar" :src="group.avatar || defaultGroupAvatar" mode="aspectFill"></image>
          <view class="group-item-info">
            <text class="group-item-name">{{ group.name }}</text>
            <text class="group-item-desc">{{ group.memberCount }} 位成员</text>
          </view>
          <view class="group-item-arrow">
            <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 邀请码部分 -->
    <view class="invite-section">
      <view class="section-title">加入群组</view>
      <view class="invite-input-card">
        <view class="input-group">
          <input 
            class="invite-input" 
            v-model="inviteCode" 
            placeholder="输入邀请码加入群组"
            maxlength="8"
          />
          <button class="join-btn" @click="joinGroupByCode" :disabled="!inviteCode">加入</button>
        </view>
      </view>
    </view>

    <!-- 创建群组弹窗 -->
    <uni-popup ref="createPopup" type="center" :mask-click="false">
      <view class="create-modal">
        <view class="modal-header">
          <text class="modal-title">创建家庭群组</text>
          <view class="modal-close" @click="closeCreateModal">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        <view class="modal-content">
          <view class="input-item">
            <text class="input-label">群组名称</text>
            <input 
              class="modal-input" 
              v-model="newGroup.name" 
              placeholder="请输入群组名称"
              maxlength="20"
            />
          </view>
          <view class="input-item">
            <text class="input-label">群组描述</text>
            <textarea 
              class="modal-textarea" 
              v-model="newGroup.description" 
              placeholder="请输入群组描述（可选）"
              maxlength="100"
            ></textarea>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeCreateModal">取消</button>
          <button class="modal-btn confirm-btn" @click="createGroup" :disabled="!newGroup.name">创建</button>
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
  name: 'FamilyGroupList',
  data() {
    return {
      familyGroups: [],
      currentGroup: null,
      loading: false,
      loadingText: { loading: '加载中...', more: '加载更多', noMore: '没有更多了' },
      
      // 邀请码
      inviteCode: '',
      
      // 创建群组
      showCreateModal: false,
      newGroup: {
        name: '',
        description: ''
      },
      
      // 默认头像
      defaultAvatar: '/static/images/default-avatar.png',
      defaultGroupAvatar: '/static/images/default-group-avatar.png'
    }
  },
  
  onLoad() {
    this.loadFamilyGroups()
    this.loadCurrentGroup()
  },
  
  onShow() {
    // 页面显示时刷新数据
    this.loadFamilyGroups()
  },
  
  methods: {
    // ==================== 数据加载 ====================
    
    async loadFamilyGroups() {
      try {
        this.loading = true
        const response = await userService.getFamilyGroups()
        if (response.success) {
          this.familyGroups = response.data || []
          
          // 如果当前没有选中的群组，选择第一个
          if (!this.currentGroup && this.familyGroups.length > 0) {
            this.currentGroup = this.familyGroups[0]
            await this.saveCurrentGroup(this.currentGroup._id)
          }
        }
      } catch (error) {
        console.error('Load family groups error:', error)
        uni.showToast({
          title: '加载群组失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async loadCurrentGroup() {
      try {
        // 从存储中获取当前群组ID
        const currentGroupId = await storage.getItem('current_family_group_id')
        if (currentGroupId) {
          const response = await userService.getFamilyGroupDetail(currentGroupId)
          if (response.success) {
            this.currentGroup = response.data
          }
        }
      } catch (error) {
        console.error('Load current group error:', error)
      }
    },
    
    async saveCurrentGroup(groupId) {
      try {
        await storage.setItem('current_family_group_id', groupId)
      } catch (error) {
        console.error('Save current group error:', error)
      }
    },
    
    // ==================== 群组操作 ====================
    
    async switchGroup(group) {
      try {
        this.loading = true
        const response = await userService.getFamilyGroupDetail(group._id)
        if (response.success) {
          this.currentGroup = response.data
          await this.saveCurrentGroup(group._id)
          
          uni.showToast({
            title: '切换成功',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('Switch group error:', error)
        uni.showToast({
          title: '切换失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async createGroup() {
      if (!this.newGroup.name.trim()) {
        uni.showToast({
          title: '请输入群组名称',
          icon: 'none'
        })
        return
      }
      
      try {
        this.loading = true
        const response = await userService.createFamilyGroup({
          name: this.newGroup.name.trim(),
          description: this.newGroup.description.trim()
        })
        
        if (response.success) {
          uni.showToast({
            title: '创建成功',
            icon: 'success'
          })
          
          this.closeCreateModal()
          await this.loadFamilyGroups()
          
          // 切换到新创建的群组
          this.currentGroup = response.data
          await this.saveCurrentGroup(response.data._id)
        } else {
          throw new Error(response.message || '创建失败')
        }
      } catch (error) {
        console.error('Create group error:', error)
        uni.showToast({
          title: error.message || '创建失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async joinGroupByCode() {
      if (!this.inviteCode.trim()) {
        uni.showToast({
          title: '请输入邀请码',
          icon: 'none'
        })
        return
      }
      
      try {
        this.loading = true
        const response = await userService.joinFamilyGroup(this.inviteCode.trim())
        
        if (response.success) {
          uni.showToast({
            title: '加入成功',
            icon: 'success'
          })
          
          this.inviteCode = ''
          await this.loadFamilyGroups()
          
          // 切换到新加入的群组
          this.currentGroup = response.data
          await this.saveCurrentGroup(response.data._id)
        } else {
          throw new Error(response.message || '加入失败')
        }
      } catch (error) {
        console.error('Join group error:', error)
        uni.showToast({
          title: error.message || '加入失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // ==================== 导航操作 ====================
    
    manageGroup() {
      if (!this.currentGroup) return
      
      uni.navigateTo({
        url: `/pages/family/group-detail?groupId=${this.currentGroup._id}`
      })
    },
    
    inviteMembers() {
      if (!this.currentGroup) return
      
      uni.navigateTo({
        url: `/pages/family/invite-members?groupId=${this.currentGroup._id}`
      })
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    // ==================== 弹窗操作 ====================
    
    openCreateModal() {
      this.showCreateModal = true
      this.$refs.createPopup.open()
    },
    
    closeCreateModal() {
      this.showCreateModal = false
      this.newGroup = {
        name: '',
        description: ''
      }
      this.$refs.createPopup.close()
    }
  },
  
  watch: {
    showCreateModal(newVal) {
      if (newVal) {
        this.$refs.createPopup.open()
      } else {
        this.$refs.createPopup.close()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.family-group-page {
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
  
  .navbar-left,
  .navbar-right {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .navbar-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}

// ==================== 当前群组信息 ====================
.current-group-section {
  padding: 15px;
}

.group-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.group-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  .group-avatar {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    margin-right: 12px;
  }
  
  .group-info {
    flex: 1;
    
    .group-name {
      display: block;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }
    
    .group-member-count {
      font-size: 14px;
      color: #666;
    }
  }
  
  .group-actions {
    .action-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border-radius: 16px;
    }
  }
}

// ==================== 成员列表预览 ====================
.members-preview {
  .members-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }
  
  .members-scroll {
    white-space: nowrap;
  }
  
  .member-item {
    display: inline-block;
    text-align: center;
    margin-right: 15px;
    position: relative;
    
    .member-avatar {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      margin-bottom: 4px;
    }
    
    .member-name {
      display: block;
      font-size: 12px;
      color: #666;
      max-width: 50px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .member-role {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 16px;
      height: 16px;
      background-color: #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    &.add-member {
      .add-member-btn {
        width: 40px;
        height: 40px;
        border-radius: 20px;
        border: 2px dashed #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;
      }
    }
  }
}

// ==================== 群组列表 ====================
.groups-section {
  padding: 0 15px 15px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.groups-list {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.active {
    background-color: #f8f9fa;
    
    .group-item-name {
      color: #007aff;
    }
  }
  
  .group-item-avatar {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    margin-right: 12px;
  }
  
  .group-item-info {
    flex: 1;
    
    .group-item-name {
      display: block;
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 2px;
    }
    
    .group-item-desc {
      font-size: 13px;
      color: #999;
    }
  }
  
  .group-item-arrow {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// ==================== 邀请码部分 ====================
.invite-section {
  padding: 0 15px 30px;
}

.invite-input-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
  
  .invite-input {
    flex: 1;
    height: 40px;
    padding: 0 12px;
    background-color: #f5f5f5;
    border-radius: 8px;
    border: none;
    font-size: 16px;
  }
  
  .join-btn {
    height: 40px;
    padding: 0 20px;
    background-color: #007aff;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    
    &:disabled {
      background-color: #ccc;
    }
  }
}

// ==================== 创建群组弹窗 ====================
.create-modal {
  width: 300px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
}

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
}

.input-item {
  margin-bottom: 15px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .input-label {
    display: block;
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }
  
  .modal-input,
  .modal-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-size: 16px;
    box-sizing: border-box;
  }
  
  .modal-textarea {
    height: 80px;
    resize: none;
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
      
      &:disabled {
        background-color: #ccc;
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
