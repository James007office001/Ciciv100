<template>
  <view class="invite-members-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-left" @click="goBack">
        <uni-icons type="back" size="20" color="#333"></uni-icons>
      </view>
      <view class="navbar-title">邀请成员</view>
      <view class="navbar-right"></view>
    </view>

    <!-- 邀请码分享 -->
    <view class="invite-code-section">
      <view class="section-title">分享邀请码</view>
      <view class="invite-code-card">
        <view class="invite-code-header">
          <view class="invite-code-info">
            <text class="invite-code-label">邀请码</text>
            <text class="invite-code-value">{{ inviteCode }}</text>
          </view>
          <view class="invite-code-actions">
            <view class="action-btn" @click="copyInviteCode">
              <uni-icons type="copy" size="18" color="#007aff"></uni-icons>
              <text class="action-text">复制</text>
            </view>
          </view>
        </view>
        <view class="invite-code-tip">
          <text class="tip-text">将邀请码发送给家人，让他们输入邀请码加入群组</text>
        </view>
      </view>
    </view>

    <!-- 分享方式 -->
    <view class="share-methods-section">
      <view class="section-title">分享方式</view>
      <view class="share-methods-grid">
        <view class="share-method-item" @click="shareToWeChat">
          <view class="share-icon wechat">
            <uni-icons type="weixin" size="24" color="#07c160"></uni-icons>
          </view>
          <text class="share-text">微信好友</text>
        </view>
        
        <view class="share-method-item" @click="shareToMoments">
          <view class="share-icon moments">
            <uni-icons type="pyq" size="24" color="#07c160"></uni-icons>
          </view>
          <text class="share-text">朋友圈</text>
        </view>
        
        <view class="share-method-item" @click="shareToQQ">
          <view class="share-icon qq">
            <uni-icons type="qq" size="24" color="#12b7f5"></uni-icons>
          </view>
          <text class="share-text">QQ好友</text>
        </view>
        
        <view class="share-method-item" @click="shareToSMS">
          <view class="share-icon sms">
            <uni-icons type="chatbubble" size="24" color="#ff9500"></uni-icons>
          </view>
          <text class="share-text">短信</text>
        </view>
        
        <view class="share-method-item" @click="generateQRCode">
          <view class="share-icon qrcode">
            <uni-icons type="scan" size="24" color="#333"></uni-icons>
          </view>
          <text class="share-text">二维码</text>
        </view>
        
        <view class="share-method-item" @click="moreShareOptions">
          <view class="share-icon more">
            <uni-icons type="more-dot-fill" size="24" color="#8e8e93"></uni-icons>
          </view>
          <text class="share-text">更多</text>
        </view>
      </view>
    </view>

    <!-- 联系人邀请 -->
    <view class="contacts-section" v-if="contacts.length > 0">
      <view class="section-title">从联系人邀请</view>
      <view class="contacts-list">
        <view 
          class="contact-item" 
          v-for="contact in contacts" 
          :key="contact.id"
          @click="inviteContact(contact)"
        >
          <image class="contact-avatar" :src="contact.avatar || defaultAvatar" mode="aspectFill"></image>
          <view class="contact-info">
            <text class="contact-name">{{ contact.name }}</text>
            <text class="contact-phone">{{ contact.phone }}</text>
          </view>
          <view class="contact-action">
            <button class="invite-btn" :disabled="contact.invited">
              {{ contact.invited ? '已邀请' : '邀请' }}
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 邀请历史 -->
    <view class="invite-history-section" v-if="inviteHistory.length > 0">
      <view class="section-title">邀请记录</view>
      <view class="history-list">
        <view 
          class="history-item" 
          v-for="history in inviteHistory" 
          :key="history.id"
        >
          <view class="history-icon">
            <uni-icons 
              :type="history.status === 'accepted' ? 'checkmarkempty' : 'clock'" 
              size="16" 
              :color="history.status === 'accepted' ? '#52c41a' : '#faad14'"
            ></uni-icons>
          </view>
          <view class="history-info">
            <text class="history-text">{{ history.description }}</text>
            <text class="history-time">{{ formatTime(history.createdAt) }}</text>
          </view>
          <view class="history-status">
            <text 
              class="status-text" 
              :class="history.status"
            >
              {{ getStatusText(history.status) }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 二维码弹窗 -->
    <uni-popup ref="qrcodePopup" type="center">
      <view class="qrcode-modal">
        <view class="modal-header">
          <text class="modal-title">扫码加入群组</text>
          <view class="modal-close" @click="closeQRCode">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        <view class="modal-content">
          <view class="qrcode-container">
            <canvas 
              canvas-id="qrcode" 
              class="qrcode-canvas"
              :style="{ width: qrcodeSize + 'px', height: qrcodeSize + 'px' }"
            ></canvas>
          </view>
          <view class="qrcode-info">
            <text class="qrcode-title">{{ groupInfo.name }}</text>
            <text class="qrcode-desc">邀请码：{{ inviteCode }}</text>
          </view>
        </view>
        <view class="modal-footer">
          <button class="save-btn" @click="saveQRCode">保存到相册</button>
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

export default {
  name: 'InviteMembers',
  data() {
    return {
      groupId: '',
      groupInfo: null,
      inviteCode: '',
      
      contacts: [],
      inviteHistory: [],
      
      loading: false,
      loadingText: { loading: '加载中...', more: '加载更多', noMore: '没有更多了' },
      
      // 二维码相关
      qrcodeSize: 200,
      
      // 默认头像
      defaultAvatar: '/static/images/default-avatar.png'
    }
  },
  
  onLoad(options) {
    this.groupId = options.groupId
    if (this.groupId) {
      this.loadGroupInfo()
      this.loadContacts()
      this.loadInviteHistory()
    }
  },
  
  methods: {
    // ==================== 数据加载 ====================
    
    async loadGroupInfo() {
      try {
        this.loading = true
        const response = await userService.getFamilyGroupDetail(this.groupId)
        if (response.success) {
          this.groupInfo = response.data
          this.inviteCode = response.data.inviteCode
        }
      } catch (error) {
        console.error('Load group info error:', error)
        uni.showToast({
          title: '加载群组信息失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async loadContacts() {
      try {
        // 这里应该从手机通讯录加载联系人
        // 暂时使用模拟数据
        this.contacts = [
          {
            id: '1',
            name: '张三',
            phone: '13800138001',
            avatar: '',
            invited: false
          },
          {
            id: '2',
            name: '李四',
            phone: '13800138002',
            avatar: '',
            invited: true
          }
        ]
      } catch (error) {
        console.error('Load contacts error:', error)
      }
    },
    
    async loadInviteHistory() {
      try {
        const response = await userService.getFamilyGroupInviteHistory(this.groupId)
        if (response.success) {
          this.inviteHistory = response.data || []
        }
      } catch (error) {
        console.error('Load invite history error:', error)
      }
    },
    
    // ==================== 邀请操作 ====================
    
    async inviteContact(contact) {
      try {
        this.loading = true
        
        // 发送邀请短信
        const message = `邀请您加入家庭群组"${this.groupInfo.name}"，邀请码：${this.inviteCode}，请在CICI应用中输入邀请码加入。`
        
        // 调用短信发送API
        const response = await userService.sendInviteSMS({
          groupId: this.groupId,
          phone: contact.phone,
          message: message
        })
        
        if (response.success) {
          // 更新联系人状态
          contact.invited = true
          
          uni.showToast({
            title: '邀请已发送',
            icon: 'success'
          })
          
          // 刷新邀请历史
          this.loadInviteHistory()
        } else {
          throw new Error(response.message || '发送失败')
        }
      } catch (error) {
        console.error('Invite contact error:', error)
        uni.showToast({
          title: error.message || '邀请失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // ==================== 分享操作 ====================
    
    copyInviteCode() {
      uni.setClipboardData({
        data: this.inviteCode,
        success: () => {
          uni.showToast({
            title: '邀请码已复制',
            icon: 'success'
          })
        }
      })
    },
    
    shareToWeChat() {
      const shareData = {
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        title: `邀请您加入家庭群组：${this.groupInfo.name}`,
        summary: `邀请码：${this.inviteCode}`,
        href: `https://app.cici.com/join?code=${this.inviteCode}`
      }
      
      uni.share(shareData)
        .then(() => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        })
        .catch((error) => {
          console.error('Share to WeChat error:', error)
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          })
        })
    },
    
    shareToMoments() {
      const shareData = {
        provider: 'weixin',
        scene: 'WXSceneTimeline',
        type: 0,
        title: `邀请您加入家庭群组：${this.groupInfo.name}`,
        summary: `邀请码：${this.inviteCode}`,
        href: `https://app.cici.com/join?code=${this.inviteCode}`
      }
      
      uni.share(shareData)
        .then(() => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        })
        .catch((error) => {
          console.error('Share to moments error:', error)
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          })
        })
    },
    
    shareToQQ() {
      const shareData = {
        provider: 'qq',
        type: 0,
        title: `邀请您加入家庭群组：${this.groupInfo.name}`,
        summary: `邀请码：${this.inviteCode}`,
        href: `https://app.cici.com/join?code=${this.inviteCode}`
      }
      
      uni.share(shareData)
        .then(() => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        })
        .catch((error) => {
          console.error('Share to QQ error:', error)
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          })
        })
    },
    
    shareToSMS() {
      const message = `邀请您加入家庭群组"${this.groupInfo.name}"，邀请码：${this.inviteCode}，请在CICI应用中输入邀请码加入。`
      
      // 打开短信应用
      uni.navigateTo({
        url: `/pages/common/sms-compose?message=${encodeURIComponent(message)}`
      })
    },
    
    moreShareOptions() {
      uni.showActionSheet({
        itemList: ['复制链接', '保存图片', '其他方式'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.copyShareLink()
              break
            case 1:
              this.saveShareImage()
              break
            case 2:
              this.showMoreShare()
              break
          }
        }
      })
    },
    
    copyShareLink() {
      const link = `https://app.cici.com/join?code=${this.inviteCode}`
      uni.setClipboardData({
        data: link,
        success: () => {
          uni.showToast({
            title: '链接已复制',
            icon: 'success'
          })
        }
      })
    },
    
    // ==================== 二维码操作 ====================
    
    generateQRCode() {
      this.$refs.qrcodePopup.open()
      
      this.$nextTick(() => {
        this.drawQRCode()
      })
    },
    
    drawQRCode() {
      const ctx = uni.createCanvasContext('qrcode', this)
      const qrData = `https://app.cici.com/join?code=${this.inviteCode}`
      
      // 这里应该使用二维码生成库来绘制二维码
      // 暂时用简单的方块代替
      ctx.setFillStyle('#000000')
      ctx.fillRect(0, 0, this.qrcodeSize, this.qrcodeSize)
      
      ctx.setFillStyle('#ffffff')
      ctx.fillRect(10, 10, this.qrcodeSize - 20, this.qrcodeSize - 20)
      
      // 绘制一些模拟的二维码图案
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (Math.random() > 0.5) {
            ctx.setFillStyle('#000000')
            ctx.fillRect(20 + i * 16, 20 + j * 16, 16, 16)
          }
        }
      }
      
      ctx.draw()
    },
    
    closeQRCode() {
      this.$refs.qrcodePopup.close()
    },
    
    saveQRCode() {
      uni.canvasToTempFilePath({
        canvasId: 'qrcode',
        success: (res) => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              uni.showToast({
                title: '保存成功',
                icon: 'success'
              })
            },
            fail: () => {
              uni.showToast({
                title: '保存失败',
                icon: 'none'
              })
            }
          })
        }
      }, this)
    },
    
    // ==================== 工具方法 ====================
    
    formatTime(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      
      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${month}月${day}日`
      }
    },
    
    getStatusText(status) {
      switch (status) {
        case 'pending':
          return '待接受'
        case 'accepted':
          return '已加入'
        case 'declined':
          return '已拒绝'
        case 'expired':
          return '已过期'
        default:
          return '未知'
      }
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.invite-members-page {
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

// ==================== 公共样式 ====================
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

// ==================== 邀请码分享 ====================
.invite-code-section {
  padding: 15px;
  background-color: #fff;
  margin-bottom: 10px;
}

.invite-code-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  
  .invite-code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    
    .invite-code-info {
      .invite-code-label {
        display: block;
        font-size: 14px;
        color: #666;
        margin-bottom: 4px;
      }
      
      .invite-code-value {
        display: block;
        font-size: 32px;
        font-weight: 700;
        color: #007aff;
        letter-spacing: 4px;
      }
    }
    
    .invite-code-actions {
      .action-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        background-color: #007aff;
        border-radius: 6px;
        
        .action-text {
          font-size: 14px;
          color: #fff;
        }
      }
    }
  }
  
  .invite-code-tip {
    .tip-text {
      font-size: 13px;
      color: #999;
      line-height: 1.4;
    }
  }
}

// ==================== 分享方式 ====================
.share-methods-section {
  padding: 15px;
  background-color: #fff;
  margin-bottom: 10px;
}

.share-methods-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  
  .share-method-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 10px;
    background-color: #f8f9fa;
    border-radius: 12px;
    
    .share-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fff;
      border-radius: 24px;
      margin-bottom: 8px;
      
      &.wechat {
        background-color: #e7f9e7;
      }
      
      &.moments {
        background-color: #e7f9e7;
      }
      
      &.qq {
        background-color: #e7f4ff;
      }
      
      &.sms {
        background-color: #fff2e6;
      }
      
      &.qrcode {
        background-color: #f0f0f0;
      }
      
      &.more {
        background-color: #f5f5f5;
      }
    }
    
    .share-text {
      font-size: 12px;
      color: #333;
      text-align: center;
    }
  }
}

// ==================== 联系人邀请 ====================
.contacts-section {
  padding: 15px;
  background-color: #fff;
  margin-bottom: 10px;
}

.contacts-list {
  .contact-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .contact-avatar {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      margin-right: 12px;
    }
    
    .contact-info {
      flex: 1;
      
      .contact-name {
        display: block;
        font-size: 16px;
        color: #333;
        margin-bottom: 2px;
      }
      
      .contact-phone {
        font-size: 13px;
        color: #999;
      }
    }
    
    .contact-action {
      .invite-btn {
        padding: 6px 16px;
        background-color: #007aff;
        color: #fff;
        border: none;
        border-radius: 16px;
        font-size: 14px;
        
        &:disabled {
          background-color: #ccc;
          color: #999;
        }
      }
    }
  }
}

// ==================== 邀请历史 ====================
.invite-history-section {
  padding: 15px;
  background-color: #fff;
  margin-bottom: 10px;
}

.history-list {
  .history-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .history-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }
    
    .history-info {
      flex: 1;
      
      .history-text {
        display: block;
        font-size: 14px;
        color: #333;
        margin-bottom: 2px;
      }
      
      .history-time {
        font-size: 12px;
        color: #999;
      }
    }
    
    .history-status {
      .status-text {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 4px;
        
        &.pending {
          background-color: #fff7e6;
          color: #d48806;
        }
        
        &.accepted {
          background-color: #f6ffed;
          color: #52c41a;
        }
        
        &.declined {
          background-color: #fff2f0;
          color: #ff4d4f;
        }
        
        &.expired {
          background-color: #f5f5f5;
          color: #8c8c8c;
        }
      }
    }
  }
}

// ==================== 二维码弹窗 ====================
.qrcode-modal {
  width: 300px;
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
    text-align: center;
    
    .qrcode-container {
      display: flex;
      justify-content: center;
      margin-bottom: 15px;
      
      .qrcode-canvas {
        border: 1px solid #e5e5e5;
        border-radius: 8px;
      }
    }
    
    .qrcode-info {
      .qrcode-title {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }
      
      .qrcode-desc {
        font-size: 14px;
        color: #666;
      }
    }
  }
  
  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #e5e5e5;
    
    .save-btn {
      width: 100%;
      height: 44px;
      background-color: #007aff;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 16px;
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
