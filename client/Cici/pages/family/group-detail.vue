<template>
  <view class="group-detail-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-left" @click="goBack">
        <uni-icons type="back" size="20" color="#333"></uni-icons>
      </view>
      <view class="navbar-title">群组管理</view>
      <view class="navbar-right" @click="showMoreActions = true">
        <uni-icons type="more-dot-fill" size="20" color="#333"></uni-icons>
      </view>
    </view>

    <!-- 群组信息 -->
    <view class="group-info-section" v-if="groupDetail">
      <view class="group-header">
        <image class="group-avatar" :src="groupDetail.avatar || defaultGroupAvatar" mode="aspectFill" @click="changeAvatar"></image>
        <view class="group-basic-info">
          <view class="group-name-row">
            <text class="group-name">{{ groupDetail.name }}</text>
            <view class="edit-name-btn" @click="editGroupName" v-if="isAdmin">
              <uni-icons type="compose" size="14" color="#007aff"></uni-icons>
            </view>
          </view>
          <text class="group-desc">{{ groupDetail.description || '暂无描述' }}</text>
          <text class="group-created">创建于 {{ formatDate(groupDetail.createdAt) }}</text>
        </view>
      </view>
      
      <!-- 邀请码 -->
      <view class="invite-code-card">
        <view class="invite-code-header">
          <text class="invite-code-title">邀请码</text>
          <view class="invite-code-actions">
            <view class="action-btn" @click="copyInviteCode">
              <uni-icons type="copy" size="16" color="#007aff"></uni-icons>
              <text class="action-text">复制</text>
            </view>
            <view class="action-btn" @click="shareInviteCode">
              <uni-icons type="forward" size="16" color="#007aff"></uni-icons>
              <text class="action-text">分享</text>
            </view>
          </view>
        </view>
        <view class="invite-code-content">
          <text class="invite-code">{{ groupDetail.inviteCode }}</text>
          <text class="invite-code-tip">邀请家人加入群组</text>
        </view>
      </view>
    </view>

    <!-- 成员管理 -->
    <view class="members-section">
      <view class="section-header">
        <text class="section-title">成员管理 ({{ members.length }})</text>
        <view class="section-actions" v-if="isAdmin">
          <view class="action-btn" @click="inviteMembers">
            <uni-icons type="plus" size="16" color="#007aff"></uni-icons>
            <text class="action-text">邀请</text>
          </view>
        </view>
      </view>
      
      <view class="members-list">
        <view 
          class="member-item" 
          v-for="member in members" 
          :key="member.userId"
          @click="showMemberActions(member)"
        >
          <image class="member-avatar" :src="member.avatar || defaultAvatar" mode="aspectFill"></image>
          <view class="member-info">
            <view class="member-name-row">
              <text class="member-name">{{ member.nickname || member.username }}</text>
              <view class="member-badges">
                <view class="role-badge admin" v-if="member.role === 'admin'">
                  <uni-icons type="crown" size="12" color="#ffd700"></uni-icons>
                  <text class="role-text">管理员</text>
                </view>
                <view class="role-badge creator" v-if="member.role === 'creator'">
                  <uni-icons type="star" size="12" color="#ff6b6b"></uni-icons>
                  <text class="role-text">创建者</text>
                </view>
              </view>
            </view>
            <text class="member-status">{{ member.lastActiveAt ? '最近活跃' : '未知' }}</text>
          </view>
          <view class="member-actions" v-if="isAdmin && member.role !== 'creator'">
            <uni-icons type="more-filled" size="16" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 群组设置 -->
    <view class="settings-section" v-if="isAdmin">
      <view class="section-title">群组设置</view>
      <view class="settings-list">
        <view class="setting-item" @click="editGroupDescription">
          <view class="setting-icon">
            <uni-icons type="compose" size="20" color="#007aff"></uni-icons>
          </view>
          <text class="setting-text">编辑群组描述</text>
          <view class="setting-arrow">
            <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
        
        <view class="setting-item" @click="managePermissions">
          <view class="setting-icon">
            <uni-icons type="gear" size="20" color="#007aff"></uni-icons>
          </view>
          <text class="setting-text">权限管理</text>
          <view class="setting-arrow">
            <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
        
        <view class="setting-item danger" @click="confirmDisbandGroup" v-if="isCreator">
          <view class="setting-icon">
            <uni-icons type="trash" size="20" color="#ff3b30"></uni-icons>
          </view>
          <text class="setting-text">解散群组</text>
          <view class="setting-arrow">
            <uni-icons type="arrowright" size="14" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 退出群组 -->
    <view class="leave-section" v-if="!isCreator">
      <button class="leave-btn" @click="confirmLeaveGroup">退出群组</button>
    </view>

    <!-- 成员操作弹窗 -->
    <uni-popup ref="memberActionPopup" type="bottom">
      <view class="member-action-modal">
        <view class="modal-header">
          <text class="modal-title">成员操作</text>
          <view class="modal-close" @click="closeMemberActions">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        <view class="action-list" v-if="selectedMember">
          <view class="action-item" @click="setAsAdmin" v-if="isCreator && selectedMember.role === 'member'">
            <uni-icons type="crown" size="20" color="#ffd700"></uni-icons>
            <text class="action-text">设为管理员</text>
          </view>
          <view class="action-item" @click="removeAdmin" v-if="isCreator && selectedMember.role === 'admin'">
            <uni-icons type="minus-filled" size="20" color="#007aff"></uni-icons>
            <text class="action-text">取消管理员</text>
          </view>
          <view class="action-item danger" @click="removeMember" v-if="isAdmin && selectedMember.role !== 'creator'">
            <uni-icons type="trash" size="20" color="#ff3b30"></uni-icons>
            <text class="action-text">移除成员</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 编辑群组名称弹窗 -->
    <uni-popup ref="editNamePopup" type="center">
      <view class="edit-modal">
        <view class="modal-header">
          <text class="modal-title">编辑群组名称</text>
        </view>
        <view class="modal-content">
          <input 
            class="edit-input" 
            v-model="editGroupData.name" 
            placeholder="请输入群组名称"
            maxlength="20"
          />
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="cancelEditName">取消</button>
          <button class="modal-btn confirm-btn" @click="confirmEditName" :disabled="!editGroupData.name">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 编辑群组描述弹窗 -->
    <uni-popup ref="editDescPopup" type="center">
      <view class="edit-modal">
        <view class="modal-header">
          <text class="modal-title">编辑群组描述</text>
        </view>
        <view class="modal-content">
          <textarea 
            class="edit-textarea" 
            v-model="editGroupData.description" 
            placeholder="请输入群组描述"
            maxlength="100"
          ></textarea>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="cancelEditDesc">取消</button>
          <button class="modal-btn confirm-btn" @click="confirmEditDesc">确定</button>
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
  name: 'GroupDetail',
  data() {
    return {
      groupId: '',
      groupDetail: null,
      members: [],
      currentUser: null,
      
      loading: false,
      loadingText: { loading: '加载中...', more: '加载更多', noMore: '没有更多了' },
      
      // 弹窗状态
      showMoreActions: false,
      selectedMember: null,
      
      // 编辑数据
      editGroupData: {
        name: '',
        description: ''
      },
      
      // 默认头像
      defaultAvatar: '/static/images/default-avatar.png',
      defaultGroupAvatar: '/static/images/default-group-avatar.png'
    }
  },
  
  computed: {
    isCreator() {
      return this.currentUser && this.groupDetail && 
        this.groupDetail.createdBy === this.currentUser._id
    },
    
    isAdmin() {
      if (!this.currentUser || !this.members.length) return false
      const currentMember = this.members.find(m => m.userId === this.currentUser._id)
      return currentMember && (currentMember.role === 'admin' || currentMember.role === 'creator')
    }
  },
  
  onLoad(options) {
    this.groupId = options.groupId
    if (this.groupId) {
      this.loadGroupDetail()
      this.loadCurrentUser()
    }
  },
  
  methods: {
    // ==================== 数据加载 ====================
    
    async loadCurrentUser() {
      try {
        this.currentUser = await storage.getUserInfo()
      } catch (error) {
        console.error('Load current user error:', error)
      }
    },
    
    async loadGroupDetail() {
      try {
        this.loading = true
        const response = await userService.getFamilyGroupDetail(this.groupId)
        if (response.success) {
          this.groupDetail = response.data
          this.members = response.data.members || []
        } else {
          throw new Error(response.message || '加载失败')
        }
      } catch (error) {
        console.error('Load group detail error:', error)
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // ==================== 群组操作 ====================
    
    async updateGroupInfo(updateData) {
      try {
        this.loading = true
        const response = await userService.updateFamilyGroup(this.groupId, updateData)
        if (response.success) {
          this.groupDetail = { ...this.groupDetail, ...updateData }
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          })
        } else {
          throw new Error(response.message || '更新失败')
        }
      } catch (error) {
        console.error('Update group error:', error)
        uni.showToast({
          title: error.message || '更新失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async disbandGroup() {
      try {
        this.loading = true
        const response = await userService.disbandFamilyGroup(this.groupId)
        if (response.success) {
          uni.showToast({
            title: '解散成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack({ delta: 2 })
          }, 1500)
        } else {
          throw new Error(response.message || '解散失败')
        }
      } catch (error) {
        console.error('Disband group error:', error)
        uni.showToast({
          title: error.message || '解散失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async leaveGroup() {
      try {
        this.loading = true
        const response = await userService.leaveFamilyGroup(this.groupId)
        if (response.success) {
          uni.showToast({
            title: '退出成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack({ delta: 2 })
          }, 1500)
        } else {
          throw new Error(response.message || '退出失败')
        }
      } catch (error) {
        console.error('Leave group error:', error)
        uni.showToast({
          title: error.message || '退出失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // ==================== 成员操作 ====================
    
    async updateMemberRole(memberId, role) {
      try {
        this.loading = true
        const response = await userService.updateFamilyGroupMember(this.groupId, memberId, { role })
        if (response.success) {
          // 更新本地成员数据
          const memberIndex = this.members.findIndex(m => m.userId === memberId)
          if (memberIndex !== -1) {
            this.members[memberIndex].role = role
          }
          
          uni.showToast({
            title: '操作成功',
            icon: 'success'
          })
        } else {
          throw new Error(response.message || '操作失败')
        }
      } catch (error) {
        console.error('Update member role error:', error)
        uni.showToast({
          title: error.message || '操作失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async removeMemberFromGroup(memberId) {
      try {
        this.loading = true
        const response = await userService.removeFamilyGroupMember(this.groupId, memberId)
        if (response.success) {
          // 移除本地成员数据
          this.members = this.members.filter(m => m.userId !== memberId)
          
          uni.showToast({
            title: '移除成功',
            icon: 'success'
          })
        } else {
          throw new Error(response.message || '移除失败')
        }
      } catch (error) {
        console.error('Remove member error:', error)
        uni.showToast({
          title: error.message || '移除失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // ==================== UI 操作 ====================
    
    showMemberActions(member) {
      if (!this.isAdmin || member.role === 'creator') return
      
      this.selectedMember = member
      this.$refs.memberActionPopup.open()
    },
    
    closeMemberActions() {
      this.selectedMember = null
      this.$refs.memberActionPopup.close()
    },
    
    editGroupName() {
      this.editGroupData.name = this.groupDetail.name
      this.$refs.editNamePopup.open()
    },
    
    cancelEditName() {
      this.editGroupData.name = ''
      this.$refs.editNamePopup.close()
    },
    
    async confirmEditName() {
      if (!this.editGroupData.name.trim()) {
        uni.showToast({
          title: '请输入群组名称',
          icon: 'none'
        })
        return
      }
      
      await this.updateGroupInfo({ name: this.editGroupData.name.trim() })
      this.cancelEditName()
    },
    
    editGroupDescription() {
      this.editGroupData.description = this.groupDetail.description || ''
      this.$refs.editDescPopup.open()
    },
    
    cancelEditDesc() {
      this.editGroupData.description = ''
      this.$refs.editDescPopup.close()
    },
    
    async confirmEditDesc() {
      await this.updateGroupInfo({ description: this.editGroupData.description.trim() })
      this.cancelEditDesc()
    },
    
    // ==================== 成员管理操作 ====================
    
    async setAsAdmin() {
      if (!this.selectedMember) return
      
      await this.updateMemberRole(this.selectedMember.userId, 'admin')
      this.closeMemberActions()
    },
    
    async removeAdmin() {
      if (!this.selectedMember) return
      
      await this.updateMemberRole(this.selectedMember.userId, 'member')
      this.closeMemberActions()
    },
    
    removeMember() {
      if (!this.selectedMember) return
      
      uni.showModal({
        title: '确认移除',
        content: `确定要移除成员"${this.selectedMember.nickname || this.selectedMember.username}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            await this.removeMemberFromGroup(this.selectedMember.userId)
            this.closeMemberActions()
          }
        }
      })
    },
    
    // ==================== 其他操作 ====================
    
    changeAvatar() {
      if (!this.isAdmin) return
      
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // TODO: 上传头像
          console.log('选择头像:', res.tempFilePaths[0])
        }
      })
    },
    
    copyInviteCode() {
      uni.setClipboardData({
        data: this.groupDetail.inviteCode,
        success: () => {
          uni.showToast({
            title: '邀请码已复制',
            icon: 'success'
          })
        }
      })
    },
    
    shareInviteCode() {
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        href: '',
        title: `邀请您加入家庭群组：${this.groupDetail.name}`,
        summary: `邀请码：${this.groupDetail.inviteCode}`,
        success: () => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        }
      })
    },
    
    inviteMembers() {
      uni.navigateTo({
        url: `/pages/family/invite-members?groupId=${this.groupId}`
      })
    },
    
    managePermissions() {
      uni.navigateTo({
        url: `/pages/family/permissions?groupId=${this.groupId}`
      })
    },
    
    confirmDisbandGroup() {
      uni.showModal({
        title: '确认解散',
        content: '解散后群组将无法恢复，确定要解散群组吗？',
        confirmColor: '#ff3b30',
        success: (res) => {
          if (res.confirm) {
            this.disbandGroup()
          }
        }
      })
    },
    
    confirmLeaveGroup() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出该群组吗？',
        confirmColor: '#ff3b30',
        success: (res) => {
          if (res.confirm) {
            this.leaveGroup()
          }
        }
      })
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    // ==================== 工具方法 ====================
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style lang="scss" scoped>
.group-detail-page {
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

// ==================== 群组信息 ====================
.group-info-section {
  padding: 15px;
  background-color: #fff;
  margin-bottom: 10px;
}

.group-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  
  .group-avatar {
    width: 80px;
    height: 80px;
    border-radius: 40px;
    margin-right: 15px;
  }
  
  .group-basic-info {
    flex: 1;
    
    .group-name-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      .group-name {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin-right: 8px;
      }
      
      .edit-name-btn {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .group-desc {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
      line-height: 1.4;
    }
    
    .group-created {
      font-size: 12px;
      color: #999;
    }
  }
}

// ==================== 邀请码 ====================
.invite-code-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  
  .invite-code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    
    .invite-code-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .invite-code-actions {
      display: flex;
      gap: 15px;
      
      .action-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .action-text {
          font-size: 14px;
          color: #007aff;
        }
      }
    }
  }
  
  .invite-code-content {
    .invite-code {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #007aff;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }
    
    .invite-code-tip {
      font-size: 12px;
      color: #999;
    }
  }
}

// ==================== 成员管理 ====================
.members-section {
  padding: 15px;
  background-color: #fff;
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  
  .section-actions {
    .action-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      
      .action-text {
        font-size: 14px;
        color: #007aff;
      }
    }
  }
}

.members-list {
  .member-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .member-avatar {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      margin-right: 12px;
    }
    
    .member-info {
      flex: 1;
      
      .member-name-row {
        display: flex;
        align-items: center;
        margin-bottom: 2px;
        
        .member-name {
          font-size: 16px;
          color: #333;
          margin-right: 8px;
        }
        
        .member-badges {
          display: flex;
          gap: 4px;
          
          .role-badge {
            display: flex;
            align-items: center;
            gap: 2px;
            padding: 2px 6px;
            background-color: #f0f0f0;
            border-radius: 4px;
            
            .role-text {
              font-size: 10px;
              color: #666;
            }
            
            &.admin {
              background-color: #fff7e6;
              
              .role-text {
                color: #d48806;
              }
            }
            
            &.creator {
              background-color: #fff0f0;
              
              .role-text {
                color: #cf1322;
              }
            }
          }
        }
      }
      
      .member-status {
        font-size: 12px;
        color: #999;
      }
    }
    
    .member-actions {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// ==================== 设置部分 ====================
.settings-section {
  padding: 15px;
  background-color: #fff;
  margin-bottom: 10px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
  }
}

.settings-list {
  .setting-item {
    display: flex;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.danger {
      .setting-text {
        color: #ff3b30;
      }
    }
    
    .setting-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }
    
    .setting-text {
      flex: 1;
      font-size: 16px;
      color: #333;
    }
    
    .setting-arrow {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// ==================== 退出群组 ====================
.leave-section {
  padding: 15px;
  
  .leave-btn {
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

// ==================== 成员操作弹窗 ====================
.member-action-modal {
  background-color: #fff;
  border-radius: 12px 12px 0 0;
  
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
  
  .action-list {
    padding: 10px 0;
    
    .action-item {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      
      &.danger {
        .action-text {
          color: #ff3b30;
        }
      }
      
      .action-text {
        font-size: 16px;
        color: #333;
        margin-left: 12px;
      }
    }
  }
}

// ==================== 编辑弹窗 ====================
.edit-modal {
  width: 300px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  
  .modal-header {
    padding: 15px 20px;
    border-bottom: 1px solid #e5e5e5;
    
    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      text-align: center;
    }
  }
  
  .modal-content {
    padding: 20px;
    
    .edit-input,
    .edit-textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      font-size: 16px;
      box-sizing: border-box;
    }
    
    .edit-textarea {
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
