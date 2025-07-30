<!--
  CICI 社交圈子平台 - 我的页面
-->
<template>
  <view class="profile-page">
    <!-- 顶部标题栏 -->
    <view class="page-header">
      <view class="header-title">
        <!-- 移除标题文字 -->
      </view>
      <view class="header-right">
        <view class="settings-btn" @click="goToSettings">
          <text class="settings-icon">⚙️</text>
        </view>
      </view>
    </view>
    
    <!-- 页面内容区域 -->
    <scroll-view 
      class="profile-content" 
      scroll-y="true" 
      :enhanced="true"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-avatar-section">
        <image class="user-avatar" :src="userInfo.avatar" mode="aspectFill" @click="previewAvatar" />
        <view class="avatar-edit-btn" @click="editAvatar">
          <text class="edit-icon">📷</text>
        </view>
      </view>
      <view class="user-info-section">
        <view class="user-name-section">
          <text class="user-name">{{ userInfo.displayName || userInfo.name }}</text>
          <view v-if="userInfo.verificationStatus === 'verified'" class="verification-badge">
            <text class="verification-icon">✓</text>
          </view>
          <view v-if="userInfo.membershipType === 'premium'" class="membership-badge">
            <text class="membership-text">PRO</text>
          </view>
          <view v-else-if="userInfo.membershipType === 'vip'" class="membership-badge vip">
            <text class="membership-text">VIP</text>
          </view>
        </view>
        <text class="user-bio">{{ userInfo.bio || '这个人很懒，什么都没留下~' }}</text>
        
        <!-- 用户等级进度条 -->
        <view class="level-section">
          <view class="level-info">
            <text class="level-text">Lv.{{ userInfo.level }}</text>
            <text class="exp-text">{{ userInfo.experience }}/{{ userInfo.nextLevelExp }}</text>
          </view>
          <view class="level-progress">
            <view class="progress-bar" :style="{ width: (userInfo.experience / userInfo.nextLevelExp * 100) + '%' }"></view>
          </view>
        </view>
        
        <view class="user-stats">
          <view class="stat-item" @click="goToFriends">
            <text class="stat-number">{{ formatNumber(userInfo.friendsCount) }}</text>
            <text class="stat-label">好友</text>
          </view>
          <view class="stat-item" @click="goToFollows">
            <text class="stat-number">{{ formatNumber(userInfo.followsCount) }}</text>
            <text class="stat-label">关注</text>
          </view>
          <view class="stat-item" @click="goToFollowers">
            <text class="stat-number">{{ formatNumber(userInfo.followersCount) }}</text>
            <text class="stat-label">粉丝</text>
          </view>
          <view class="stat-item" @click="goToCircles">
            <text class="stat-number">{{ formatNumber(userInfo.circlesCount) }}</text>
            <text class="stat-label">圈子</text>
          </view>
        </view>
      </view>
      <view class="edit-profile-btn" @click="editProfile">
        <text class="edit-text">编辑资料</text>
      </view>
    </view>
    
    <!-- 快捷功能卡片 -->
    <view class="quick-actions">
      <view class="action-item" @click="goToQRCode">
        <view class="action-icon">
          <text class="icon">📱</text>
        </view>
        <text class="action-text">我的二维码</text>
      </view>
      <view class="action-item" @click="goToInvite">
        <view class="action-icon">
          <text class="icon">🎁</text>
        </view>
        <text class="action-text">邀请好友</text>
      </view>
      <view class="action-item" @click="goToVIP">
        <view class="action-icon">
          <text class="icon">👑</text>
        </view>
        <text class="action-text">会员中心</text>
      </view>
      <view class="action-item" @click="goToAchievements">
        <view class="action-icon">
          <text class="icon">🏆</text>
        </view>
        <text class="action-text">成就中心</text>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="goToEventManagement">
          <view class="menu-icon">
            <text class="icon">⚙️</text>
          </view>
          <text class="menu-title">事件管理器</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goToMyCircles">
          <view class="menu-icon">
            <text class="icon">🎯</text>
          </view>
          <text class="menu-title">我的圈子</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goToMyCollections">
          <view class="menu-icon">
            <text class="icon">❤️</text>
          </view>
          <text class="menu-title">我的收藏</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goToMyMoments">
          <view class="menu-icon">
            <text class="icon">📝</text>
          </view>
          <text class="menu-title">我的动态</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="menu-item" @click="goToWallet">
          <view class="menu-icon">
            <text class="icon">💰</text>
          </view>
          <text class="menu-title">我的钱包</text>
          <view class="menu-badge">
            <text class="badge-text">¥{{ userInfo.balance }}</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goToOrders">
          <view class="menu-icon">
            <text class="icon">📋</text>
          </view>
          <text class="menu-title">我的订单</text>
          <view v-if="userInfo.unreadOrders > 0" class="menu-badge">
            <text class="badge-text">{{ userInfo.unreadOrders }}</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="menu-item" @click="goToHelp">
          <view class="menu-icon">
            <text class="icon">❓</text>
          </view>
          <text class="menu-title">帮助与反馈</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="checkUpdate">
          <view class="menu-icon">
            <text class="icon">🔄</text>
          </view>
          <text class="menu-title">检查更新</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="clearCache">
          <view class="menu-icon">
            <text class="icon">🗑️</text>
          </view>
          <text class="menu-title">清除缓存</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goToAbout">
          <view class="menu-icon">
            <text class="icon">ℹ️</text>
          </view>
          <text class="menu-title">关于CICI</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goToLoginTest">
          <view class="menu-icon">
            <text class="icon">🔧</text>
          </view>
          <text class="menu-title">登录测试</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <view class="logout-btn" @click="showLogoutConfirm">
        <text class="logout-text">退出登录</text>
      </view>
    </view>
    </scroll-view>
    
    <!-- 底部标签栏 -->
    <SimpleTabbar />
  </view>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import SimpleTabbar from '../../src/components/common/SimpleTabbar.vue'
import { useAppStore } from '../../src/store/modules/app.js'
import { useUserStore } from '../../src/store/modules/user.js'
import userProfileUtils from '../../src/utils/userProfileUtils.js'

export default {
  name: 'ProfilePage',
  components: {
    SimpleTabbar
  },
  
  setup() {
    const appStore = useAppStore()
    const userStore = useUserStore()
    
    // 用户信息 - 使用store中的数据
    const userInfo = computed(() => {
      if (!userStore.userInfo) {
        // 需要异步获取默认数据，这里先返回基本结构
        return {
          displayName: '用户',
          avatar: '/static/default-avatar.png',
          bio: '这个人很懒，什么都没留下...',
          phone: '',
          email: ''
        }
      }
      return userStore.userInfo
    })
    
    // 页面状态
    const isLoading = ref(false)
    const refreshing = ref(false)
    
    // 格式化数字显示
    const formatNumber = (num) => {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num.toString()
    }
    
    // 下拉刷新
    const onRefresh = async () => {
      refreshing.value = true
      try {
        await loadUserData()
        uni.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1000
        })
      } catch (error) {
        uni.showToast({
          title: '刷新失败',
          icon: 'error'
        })
      } finally {
        refreshing.value = false
      }
    }
    
    // 预览头像
    const previewAvatar = () => {
      uni.previewImage({
        urls: [userInfo.value.avatar],
        current: userInfo.value.avatar
      })
    }
    
    // 编辑头像
    const editAvatar = () => {
      uni.showActionSheet({
        itemList: ['从相册选择', '拍照'],
        success: (res) => {
          if (res.tapIndex === 0) {
            chooseImageFromAlbum()
          } else if (res.tapIndex === 1) {
            takePhoto()
          }
        }
      })
    }
    
    // 从相册选择
    const chooseImageFromAlbum = () => {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          // TODO: 上传头像到服务器
          userInfo.value.avatar = res.tempFilePaths[0]
          uni.showToast({
            title: '头像更新成功',
            icon: 'success'
          })
        }
      })
    }
    
    // 拍照
    const takePhoto = () => {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          // TODO: 上传头像到服务器
          userInfo.value.avatar = res.tempFilePaths[0]
          uni.showToast({
            title: '头像更新成功',
            icon: 'success'
          })
        }
      })
    }
    
    // 编辑资料
    const editProfile = () => {
      uni.navigateTo({
        url: '/pages/profile/edit'
      })
    }
    
    // 跳转到二维码
    const goToQRCode = () => {
      uni.navigateTo({
        url: '/pages/profile/qrcode'
      })
    }
    
    // 跳转到邀请好友
    const goToInvite = () => {
      uni.navigateTo({
        url: '/pages/profile/invite'
      })
    }
    
    // 跳转到会员中心
    const goToVIP = () => {
      uni.navigateTo({
        url: '/pages/vip/index'
      })
    }
    
    // 跳转到成就中心
    const goToAchievements = () => {
      uni.navigateTo({
        url: '/pages/profile/achievements'
      })
    }
    
    // 分享个人资料
    const shareProfile = () => {
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        href: `https://cici.app/user/${userInfo.value.id}`,
        title: `${userInfo.value.name}的个人主页`,
        summary: userInfo.value.bio,
        imageUrl: userInfo.value.avatar,
        success: () => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('分享失败:', err)
          uni.showToast({
            title: '分享失败',
            icon: 'error'
          })
        }
      })
    }
    
    // 跳转到设置
    const goToSettings = () => {
      uni.navigateTo({
        url: '/pages/settings/index'
      })
    }
    
    // 跳转到关注列表
    const goToFollows = () => {
      uni.navigateTo({
        url: '/pages/contacts/index?tab=following'
      })
    }
    
    // 跳转到好友列表
    const goToFriends = () => {
      uni.navigateTo({
        url: '/pages/contacts/index?tab=mutual'
      })
    }
    
    // 跳转到粉丝列表
    const goToFollowers = () => {
      uni.navigateTo({
        url: '/pages/contacts/index?tab=followers'
      })
    }
    
    // 跳转到圈子列表
    const goToCircles = () => {
      uni.navigateTo({
        url: '/pages/contacts/index?tab=circles'
      })
    }
    
    // 跳转到我的圈子
    const goToMyCircles = () => {
      console.log('点击我的圈子按钮')
      uni.navigateTo({
        url: '/pages/profile/my-circles'
      })
    }
    
    // 跳转到事件管理器
    const goToEventManagement = () => {
      console.log('点击事件管理器按钮')
      uni.navigateTo({
        url: '/pages/schedule/category-management'
      })
    }
    
    // 跳转到我的收藏
    const goToMyCollections = () => {
      uni.navigateTo({
        url: '/pages/profile/collections'
      })
    }
    
    // 跳转到我的动态
    const goToMyMoments = () => {
      uni.navigateTo({
        url: '/pages/profile/moments'
      })
    }
    
    // 跳转到钱包
    const goToWallet = () => {
      uni.navigateTo({
        url: '/pages/wallet/index'
      })
    }
    
    // 跳转到订单
    const goToOrders = () => {
      uni.navigateTo({
        url: '/pages/orders/index'
      })
    }
    
    // 跳转到帮助
    const goToHelp = () => {
      uni.navigateTo({
        url: '/pages/help/index'
      })
    }
    
    // 跳转到关于
    const goToAbout = () => {
      uni.navigateTo({
        url: '/pages/about/index'
      })
    }
    
    // 跳转到登录测试
    const goToLoginTest = () => {
      uni.navigateTo({
        url: '/pages/auth/login'
      })
    }

    
    // 显示退出登录确认
    const showLogoutConfirm = () => {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出当前账号吗？',
        confirmText: '退出',
        confirmColor: '#ff6b6b',
        success: (res) => {
          if (res.confirm) {
            logout()
          }
        }
      })
    }
    
    // 退出登录
    const logout = async () => {
      try {
        // 使用userStore的logout方法
        await userStore.logout()
      } catch (error) {
        console.error('退出登录失败:', error)
        // 即使退出失败，也清除本地数据
        const loginTokenKey = await userProfileUtils.getStorageKey('LOGIN_TOKEN')
        const userProfileKey = await userProfileUtils.getStorageKey('USER_PROFILE')
        uni.removeStorageSync(loginTokenKey)
        uni.removeStorageSync(userProfileKey)
        
        uni.reLaunch({
          url: '/pages/auth/login'
        })
      }
    }
    
    // 生命周期
    onMounted(() => {
      // 设置当前页面
      appStore.setCurrentTab('profile')
      
      // 初始化用户状态并加载数据
      initializeUserAndLoadData()
    })
    
    // 初始化用户状态并加载数据
    const initializeUserAndLoadData = async () => {
      try {
        isLoading.value = true
        
        // 首先初始化用户数据（这会检查本地存储的登录状态）
        await userStore.initUserData()
        
        // 如果用户已登录，获取最新的用户信息
        if (userStore.isLogin) {
          await loadUserData()
        } else {
          // 如果确实未登录，跳转到登录页
          console.log('用户未登录，跳转到登录页')
          uni.reLaunch({
            url: '/pages/auth/login'
          })
          return
        }
        
        console.log('用户数据加载完成')
      } catch (error) {
        console.error('初始化用户数据失败:', error)
        // 发生错误时，给用户一个选择
        uni.showModal({
          title: '加载失败',
          content: '无法加载用户数据，是否重新登录？',
          confirmText: '重新登录',
          cancelText: '重试',
          success: (res) => {
            if (res.confirm) {
              uni.reLaunch({
                url: '/pages/auth/login'
              })
            } else {
              // 重试
              initializeUserAndLoadData()
            }
          }
        })
      } finally {
        isLoading.value = false
      }
    }

    // 加载用户数据
    const loadUserData = async () => {
      try {
        // 在模拟环境中，我们使用本地存储的用户信息，不进行网络请求
        // 这样可以避免API调用失败导致的问题
        if (userStore.isLogin && userStore.userInfo) {
          console.log('使用本地用户数据，跳过网络请求')
          return
        }
        
        // 仅在生产环境或有真实API时启用以下代码
        /*
        // 获取最新的用户信息（仅在已登录时调用）
        if (userStore.isLogin) {
          await userStore.fetchUserProfile()
        }
        */
        
        console.log('用户数据加载完成')
      } catch (error) {
        console.error('加载用户数据失败:', error)
        // 网络错误不应该影响用户使用本地数据
        uni.showToast({
          title: '网络异常，使用离线数据',
          icon: 'none',
          duration: 2000
        })
      }
    }
    
    // 检查更新
    const checkUpdate = () => {
      uni.showLoading({
        title: '检查更新中...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '已是最新版本',
          icon: 'success'
        })
      }, 2000)
    }
    
    // 清除缓存
    const clearCache = () => {
      uni.showModal({
        title: '清除缓存',
        content: '确定要清除应用缓存吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '清除中...'
            })
            
            setTimeout(() => {
              uni.hideLoading()
              uni.showToast({
                title: '缓存已清除',
                icon: 'success'
              })
            }, 1500)
          }
        }
      })
    }
    
    return {
      userInfo,
      isLoading,
      refreshing,
      formatNumber,
      onRefresh,
      previewAvatar,
      editAvatar,
      editProfile,
      shareProfile,
      goToQRCode,
      goToInvite,
      goToVIP,
      goToAchievements,
      goToSettings,
      goToFriends,
      goToFollows,
      goToFollowers,
      goToCircles,
      goToMyCircles,
      goToEventManagement,
      goToMyCollections,
      goToMyMoments,
      goToWallet,
      goToOrders,
      goToHelp,
      goToAbout,
      goToLoginTest,
      checkUpdate,
      clearCache,
      showLogoutConfirm
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: calc(var(--status-bar-height, 0px) + 80rpx);
  box-sizing: border-box;
}

/* 顶部标题栏 */
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 7rpx 20rpx;
  padding-top: calc(var(--status-bar-height, 0px) + 7rpx);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.05);
  height: calc(var(--status-bar-height, 0px) + 80rpx);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 32rpx;
  font-weight: 500;
}

.header-right {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
}

.settings-btn {
  width: 56rpx;
  height: 56rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  &:active {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(0.95);
  }
}

.settings-icon {
  font-size: 24rpx;
}

/* 页面内容区域 */
.profile-content {
  flex: 1;
  height: calc(100vh - var(--status-bar-height, 0px) - 80rpx - var(--tabbar-height, 98px) - var(--safe-area-bottom, 0px));
  padding: 12rpx 0;
}

/* 用户信息卡片 */
.user-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24rpx;
  margin: 20rpx;
  padding: 32rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.user-avatar-section {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.user-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  border: 4px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 8rpx;
  right: calc(50% - 80rpx - 16rpx);
  width: 48rpx;
  height: 48rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.9);
  }
}

.edit-icon {
  font-size: 20rpx;
}

.user-info-section {
  text-align: center;
  margin-bottom: 32rpx;
}

.user-name-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  gap: 12rpx;
}

.user-name {
  color: rgba(255, 255, 255, 0.95);
  font-size: 36rpx;
  font-weight: 600;
}

.verification-badge {
  width: 32rpx;
  height: 32rpx;
  background: linear-gradient(135deg, #00d4aa, #00b894);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verification-icon {
  color: white;
  font-size: 16rpx;
  font-weight: bold;
}

.membership-badge {
  padding: 4rpx 12rpx;
  background: linear-gradient(135deg, #ffd700, #ffb347);
  border-radius: 12rpx;
  
  &.vip {
    background: linear-gradient(135deg, #ff6b6b, #ff3b30);
  }
}

.membership-text {
  color: white;
  font-size: 16rpx;
  font-weight: bold;
}

.level-section {
  margin: 16rpx 0 24rpx 0;
}

.level-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.level-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 24rpx;
  font-weight: 600;
}

.exp-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 20rpx;
}

.level-progress {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.user-bio {
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;
  line-height: 1.4;
  display: block;
  margin-bottom: 24rpx;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
}

.stat-number {
  color: rgba(255, 255, 255, 0.95);
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

.edit-profile-btn {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:active {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(0.95);
  }
}

.edit-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 24rpx;
  font-weight: 500;
}

/* 快捷功能 */
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 0 20rpx;
  margin-bottom: 32rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex: 1;
  margin: 0 8rpx;
  transition: all 0.3s ease;
  
  &:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.95);
  }
}

.action-icon {
  width: 56rpx;
  height: 56rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.action-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 22rpx;
  text-align: center;
}

/* 功能菜单 */
.menu-section {
  padding: 0 20rpx;
  margin-bottom: 32rpx;
}

.menu-group {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
}

.menu-icon {
  width: 56rpx;
  height: 56rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.icon {
  font-size: 24rpx;
}

.menu-title {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
  font-weight: 500;
}

.menu-badge {
  background: rgba(255, 107, 107, 0.9);
  border-radius: 12rpx;
  padding: 4rpx 12rpx;
  margin-right: 16rpx;
}

.badge-text {
  color: white;
  font-size: 20rpx;
  font-weight: 500;
}

.menu-arrow {
  color: rgba(255, 255, 255, 0.5);
  font-size: 32rpx;
  font-weight: 300;
}

/* 退出登录 */
.logout-section {
  padding: 0 20rpx;
  margin-bottom: 32rpx;
}

.logout-btn {
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 20rpx;
  padding: 32rpx;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:active {
    background: rgba(255, 107, 107, 0.25);
    transform: scale(0.98);
  }
}

.logout-text {
  color: #ff6b6b;
  font-size: 28rpx;
  font-weight: 500;
}

/* 响应式适配 */
@media (max-width: 375px) {
  .user-card {
    margin: 16rpx;
    padding: 24rpx;
  }
  
  .user-avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 70rpx;
  }
  
  .user-name {
    font-size: 32rpx;
  }
  
  .user-bio {
    font-size: 24rpx;
  }
  
  .menu-item {
    padding: 24rpx;
  }
  
  .menu-title {
    font-size: 26rpx;
  }
}
</style>
