<!--
  CICI 社交圈子平台 - 联系人页面
-->
<template>
  <view class="contacts-page">
    <!-- 顶部标题栏 -->
    <view class="page-header">
      <view class="header-left">
        <view class="back-btn" @click="goBack">
          <text class="back-icon"><</text>
        </view>
      </view>
      
      <view class="header-tabs">
        <view 
          v-for="(tab, index) in tabs" 
          :key="tab.key"
          class="tab-item"
          :class="{ active: currentTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <text class="tab-text">{{ tab.name }}</text>
        </view>
      </view>
      
      <view class="header-right">
        <view class="add-btn" @click="showAddMenu">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>
    
    <!-- 页面内容区域 -->
    <scroll-view 
      class="contacts-content" 
      scroll-y="true" 
      :enhanced="true"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 搜索栏 -->
      <view class="search-section" v-if="currentTab !== 'mutual'">
        <view class="search-bar">
          <text class="search-icon">🔍</text>
          <input 
            class="search-input" 
            type="text" 
            :placeholder="getSearchPlaceholder()"
            v-model="searchKeyword"
            @input="onSearch"
          />
        </view>
      </view>
      
      <!-- 联系人列表 -->
      <view class="contacts-list">
        <view 
          v-for="(contact, index) in filteredContacts" 
          :key="contact.id"
          class="contact-item"
          @click="goToProfile(contact.id)"
        >
          <image class="contact-avatar" :src="contact.avatar" mode="aspectFill" />
          <view class="contact-info">
            <view class="contact-name-section">
              <text class="contact-name">{{ contact.name }}</text>
              <view v-if="contact.verificationStatus === 'verified'" class="verification-badge">
                <text class="verification-icon">✓</text>
              </view>
              <view v-if="contact.membershipType === 'premium'" class="membership-badge">
                <text class="membership-text">PRO</text>
              </view>
              <view v-else-if="contact.membershipType === 'vip'" class="membership-badge vip">
                <text class="membership-text">VIP</text>
              </view>
            </view>
            <text class="contact-bio">{{ contact.bio || '这个人很懒，什么都没留下~' }}</text>
            <view class="contact-stats" v-if="currentTab === 'circles'">
              <text class="stat-text">{{ contact.membersCount }}人 · {{ contact.postsCount }}动态</text>
            </view>
          </view>
          <view class="contact-action">
            <view 
              class="action-btn"
              :class="getActionBtnClass(contact)"
              @click.stop="handleAction(contact)"
            >
              <text class="action-text">{{ getActionText(contact) }}</text>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="filteredContacts.length === 0 && !isLoading" class="empty-state">
          <view class="empty-icon">
            <text class="icon">{{ getEmptyIcon() }}</text>
          </view>
          <text class="empty-text">{{ getEmptyText() }}</text>
        </view>
        
        <!-- 加载状态 -->
        <view v-if="isLoading" class="loading-state">
          <text class="loading-text">加载中...</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useCircleStore } from '../../src/store/modules/circle.js'
import circleUtils from '../../src/utils/circleUtils.js'

export default {
  name: 'ContactsPage',
  
  // UniApp页面生命周期
  onLoad(options) {
    console.log('onLoad接收到的参数:', options)
    
    // 直接处理参数
    if (options.tab) {
      const validTabs = ['mutual', 'following', 'followers', 'circles']
      if (validTabs.includes(options.tab)) {
        // 需要在Vue组件加载后设置
        this.initialTab = options.tab
        console.log('设置初始标签页:', options.tab)
      }
    }
  },
  
  setup() {
    // 获取当前实例
    const instance = getCurrentInstance()
    
    // 使用圈子store
    const circleStore = useCircleStore()
    
    // 标签页配置
    const tabs = ref([
      { key: 'mutual', name: '好友' },
      { key: 'following', name: '关注' },
      { key: 'followers', name: '粉丝' },
      { key: 'circles', name: '圈子' }
    ])
    
    // 当前标签页
    const currentTab = ref('mutual')
    
    // 页面状态
    const isLoading = ref(false)
    const refreshing = ref(false)
    const searchKeyword = ref('')
    
    // 联系人数据
    const contacts = ref({
      mutual: [], // 好友
      following: [], // 关注的人
      followers: [], // 粉丝
      circles: [] // 圈子
    })
    
    // 模拟数据
    const mockData = {
      following: [
        {
          id: 1,
          name: '李小美',
          avatar: '/static/c1.png',
          bio: '摄影爱好者，记录生活的美好',
          verificationStatus: 'verified',
          membershipType: 'premium',
          relationStatus: 'following' // following, mutual, none
        },
        {
          id: 2,
          name: '王大伟',
          avatar: '/static/c2.png',
          bio: '热爱运动，享受健康生活',
          verificationStatus: 'unverified',
          membershipType: 'basic',
          relationStatus: 'mutual'
        },
        {
          id: 3,
          name: '张三丰',
          avatar: '/static/c3.png',
          bio: '武术爱好者',
          verificationStatus: 'verified',
          membershipType: 'vip',
          relationStatus: 'following'
        }
      ],
      followers: [
        {
          id: 4,
          name: '小红',
          avatar: '/static/c4.png',
          bio: '美食博主，分享美味时光',
          verificationStatus: 'verified',
          membershipType: 'basic',
          relationStatus: 'none'
        },
        {
          id: 5,
          name: '小明',
          avatar: '/static/c6.png',
          bio: '科技达人，探索未来',
          verificationStatus: 'unverified',
          membershipType: 'premium',
          relationStatus: 'mutual'
        }
      ],
      circles: [] // 使用store中的圈子数据
    }
    
    // 获取当前显示的联系人列表
    const filteredContacts = computed(() => {
      let list = []
      
      // 如果是圈子标签页，从store获取数据
      if (currentTab.value === 'circles') {
        list = circleStore.myCircles.map(circle => ({
          id: circle.id,
          name: circle.name,
          avatar: circle.avatar,
          bio: circle.description,
          membersCount: circle.membersCount,
          postsCount: circle.postsCount,
          joinStatus: 'joined',
          category: circle.category,
          tags: circle.tags
        }))
      } else {
        list = contacts.value[currentTab.value] || []
      }
      
      if (searchKeyword.value.trim()) {
        list = list.filter(contact => 
          contact.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          (contact.bio && contact.bio.toLowerCase().includes(searchKeyword.value.toLowerCase()))
        )
      }
      
      return list
    })
    
    // 获取搜索框占位符
    const getSearchPlaceholder = () => {
      const placeholders = {
        following: '搜索关注的人',
        followers: '搜索粉丝',
        circles: '搜索圈子'
      }
      return placeholders[currentTab.value] || '搜索'
    }
    
    // 获取空状态图标
    const getEmptyIcon = () => {
      const icons = {
        mutual: '👥',
        following: '👤',
        followers: '👥',
        circles: '🎯'
      }
      return icons[currentTab.value] || '📭'
    }
    
    // 获取空状态文本
    const getEmptyText = () => {
      const texts = {
        mutual: '暂无好友',
        following: '暂无关注的人',
        followers: '暂无粉丝',
        circles: '暂无加入的圈子'
      }
      return texts[currentTab.value] || '暂无数据'
    }
    
    // 获取操作按钮样式类
    const getActionBtnClass = (contact) => {
      if (currentTab.value === 'circles') {
        return contact.joinStatus === 'joined' ? 'joined' : 
               contact.joinStatus === 'pending' ? 'pending' : 'join'
      } else {
        return contact.relationStatus === 'mutual' ? 'mutual' : 
               contact.relationStatus === 'following' ? 'following' : 'follow'
      }
    }
    
    // 获取操作按钮文本
    const getActionText = (contact) => {
      if (currentTab.value === 'circles') {
        return contact.joinStatus === 'joined' ? '已加入' : 
               contact.joinStatus === 'pending' ? '审核中' : '加入'
      } else {
        return contact.relationStatus === 'mutual' ? '互关' : 
               contact.relationStatus === 'following' ? '已关注' : '关注'
      }
    }
    
    // 切换标签页
    const switchTab = (tabKey) => {
      currentTab.value = tabKey
      searchKeyword.value = ''
      loadData()
    }
    
    // 返回上一页
    const goBack = () => {
      uni.navigateBack()
    }
    
    // 显示添加菜单
    const showAddMenu = () => {
      uni.showActionSheet({
        itemList: ['添加好友', '创建圈子', '扫一扫'],
        success: (res) => {
          if (res.tapIndex === 0) {
            addFriend()
          } else if (res.tapIndex === 1) {
            createCircle()
          } else if (res.tapIndex === 2) {
            scanQRCode()
          }
        }
      })
    }
    
    // 添加好友
    const addFriend = () => {
      uni.navigateTo({
        url: '/pages/contacts/add-friend'
      })
    }
    
    // 创建圈子
    const createCircle = () => {
      uni.navigateTo({
        url: '/pages/circles/create'
      })
    }
    
    // 扫一扫
    const scanQRCode = () => {
      uni.scanCode({
        success: (res) => {
          console.log('扫码结果:', res)
          uni.showToast({
            title: '扫码成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('扫码失败:', err)
          uni.showToast({
            title: '扫码失败',
            icon: 'error'
          })
        }
      })
    }
    
    // 搜索
    const onSearch = () => {
      // 实时搜索，filteredContacts 会自动更新
    }
    
    // 下拉刷新
    const onRefresh = async () => {
      refreshing.value = true
      try {
        await loadData()
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
    
    // 跳转到个人资料
    const goToProfile = (userId) => {
      uni.navigateTo({
        url: `/pages/profile/detail?id=${userId}`
      })
    }
    
    // 处理操作按钮点击
    const handleAction = (contact) => {
      if (currentTab.value === 'circles') {
        handleCircleAction(contact)
      } else {
        handleFollowAction(contact)
      }
    }
    
    // 处理圈子操作
    const handleCircleAction = async (circle) => {
      if (circle.joinStatus === 'joined') {
        uni.showModal({
          title: '退出圈子',
          content: `确定要退出"${circle.name}"吗？`,
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await circleStore.leaveCircle(circle.id)
                if (result.success) {
                  uni.showToast({
                    title: '已退出圈子',
                    icon: 'success'
                  })
                  // 刷新圈子列表
                  await loadCircleData()
                } else {
                  uni.showToast({
                    title: result.error || '退出失败',
                    icon: 'error'
                  })
                }
              } catch (error) {
                console.error('退出圈子失败:', error)
                uni.showToast({
                  title: '退出失败',
                  icon: 'error'
                })
              }
            }
          }
        })
      } else if (circle.joinStatus === 'none') {
        try {
          const result = await circleStore.joinCircle(circle.id)
          if (result.success) {
            uni.showToast({
              title: '已加入圈子',
              icon: 'success'
            })
            // 刷新圈子列表
            await loadCircleData()
          } else {
            uni.showToast({
              title: result.message || result.error || '加入失败',
              icon: 'error'
            })
          }
        } catch (error) {
          console.error('加入圈子失败:', error)
          uni.showToast({
            title: '加入失败',
            icon: 'error'
          })
        }
      }
    }
    
    // 处理关注操作
    const handleFollowAction = (contact) => {
      if (contact.relationStatus === 'following') {
        uni.showModal({
          title: '取消关注',
          content: `确定要取消关注"${contact.name}"吗？`,
          success: (res) => {
            if (res.confirm) {
              contact.relationStatus = 'none'
              uni.showToast({
                title: '已取消关注',
                icon: 'success'
              })
            }
          }
        })
      } else if (contact.relationStatus === 'none') {
        contact.relationStatus = 'following'
        uni.showToast({
          title: '已关注',
          icon: 'success'
        })
      }
    }
    
    // 加载圈子数据
    const loadCircleData = async () => {
      try {
        await circleStore.fetchMyCircles()
        await circleStore.fetchCategories()
      } catch (error) {
        console.error('加载圈子数据失败:', error)
        uni.showToast({
          title: '加载圈子数据失败',
          icon: 'error'
        })
      }
    }
    
    // 加载数据
    const loadData = async () => {
      try {
        isLoading.value = true
        
        // 模拟网络请求
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 根据当前标签页加载对应数据
        if (currentTab.value === 'mutual') {
          // 好友是关注和粉丝的交集
          const followingIds = new Set(mockData.following.filter(f => f.relationStatus === 'mutual').map(f => f.id))
          const followersIds = new Set(mockData.followers.filter(f => f.relationStatus === 'mutual').map(f => f.id))
          const mutualIds = [...followingIds].filter(id => followersIds.has(id))
          contacts.value.mutual = [...mockData.following, ...mockData.followers]
            .filter(contact => mutualIds.includes(contact.id))
            .filter((contact, index, array) => array.findIndex(c => c.id === contact.id) === index)
        } else if (currentTab.value === 'circles') {
          // 加载圈子数据
          await loadCircleData()
        } else {
          contacts.value[currentTab.value] = mockData[currentTab.value] || []
        }
        
        console.log(`${currentTab.value} 数据加载完成`)
      } catch (error) {
        console.error('加载数据失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
      } finally {
        isLoading.value = false
      }
    }
    
    // 生命周期
    onMounted(async () => {
      // 检查是否有初始标签页设置
      if (instance && instance.proxy && instance.proxy.initialTab) {
        currentTab.value = instance.proxy.initialTab
        console.log('应用初始标签页:', instance.proxy.initialTab)
      }
      
      // 初始化圈子分类数据
      await circleStore.fetchCategories()
      
      // 加载数据
      await loadData()
    })
    
    return {
      tabs,
      currentTab,
      isLoading,
      refreshing,
      searchKeyword,
      filteredContacts,
      getSearchPlaceholder,
      getEmptyIcon,
      getEmptyText,
      getActionBtnClass,
      getActionText,
      switchTab,
      goBack,
      showAddMenu,
      onSearch,
      onRefresh,
      goToProfile,
      handleAction,
      loadCircleData,
      circleStore
    }
  }
}
</script>

<style lang="scss" scoped>
.contacts-page {
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

.header-left {
  width: 60rpx;
  display: flex;
  align-items: center;
}

.back-btn {
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

.back-icon {
  color: rgba(255, 255, 255, 0.9);
  font-size: 24rpx;
  font-weight: bold;
}

.header-tabs {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32rpx;
  margin: 0 20rpx;
}

.tab-item {
  position: relative;
  padding: 8rpx 0;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
}

.tab-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  font-weight: 400;
  transition: all 0.3s ease;
  
  .tab-item.active & {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 500;
  }
}

/* 下划线高亮 */
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24rpx;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2rpx;
}

.header-right {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.add-btn {
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

.add-icon {
  color: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
  font-weight: bold;
}

/* 页面内容区域 */
.contacts-content {
  flex: 1;
  height: calc(100vh - var(--status-bar-height, 0px) - 80rpx - var(--safe-area-bottom, 0px));
  padding: 12rpx 0;
}

/* 搜索栏 */
.search-section {
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

.search-bar {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  height: 80rpx;
}

.search-icon {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  background: transparent;
  border: none;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
}

/* 联系人列表 */
.contacts-list {
  padding: 0 20rpx;
}

.contact-item {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  &:active {
    background: rgba(255, 255, 255, 0.12);
    transform: scale(0.98);
  }
}

.contact-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  border: 2px solid rgba(255, 255, 255, 0.2);
  margin-right: 20rpx;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name-section {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  gap: 8rpx;
}

.contact-name {
  color: rgba(255, 255, 255, 0.95);
  font-size: 28rpx;
  font-weight: 600;
}

.verification-badge {
  width: 24rpx;
  height: 24rpx;
  background: linear-gradient(135deg, #00d4aa, #00b894);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verification-icon {
  color: white;
  font-size: 12rpx;
  font-weight: bold;
}

.membership-badge {
  padding: 2rpx 8rpx;
  background: linear-gradient(135deg, #ffd700, #ffb347);
  border-radius: 8rpx;
  
  &.vip {
    background: linear-gradient(135deg, #ff6b6b, #ff3b30);
  }
}

.membership-text {
  color: white;
  font-size: 12rpx;
  font-weight: bold;
}

.contact-bio {
  color: rgba(255, 255, 255, 0.7);
  font-size: 22rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  overflow: hidden;
  margin-bottom: 4rpx;
}

.contact-stats {
  margin-top: 4rpx;
}

.stat-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 20rpx;
}

.contact-action {
  margin-left: 16rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  backdrop-filter: blur(10px);
  border: 1px solid transparent;
  transition: all 0.3s ease;
  
  &.follow {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &.following {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &.mutual {
    background: linear-gradient(135deg, #00d4aa, #00b894);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &.join {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &.joined {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &.pending {
    background: rgba(255, 193, 7, 0.2);
    border-color: rgba(255, 193, 7, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.action-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 22rpx;
  font-weight: 500;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  margin-bottom: 24rpx;
}

.empty-icon .icon {
  font-size: 80rpx;
  opacity: 0.3;
}

.empty-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 26rpx;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 40rpx;
}

.loading-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

/* 响应式适配 */
@media (max-width: 375px) {
  .header-tabs {
    margin: 0 10rpx;
    gap: 4rpx;
  }
  
  .tab-item {
    padding: 8rpx 12rpx;
  }
  
  .tab-text {
    font-size: 20rpx;
  }
  
  .contact-item {
    padding: 20rpx;
  }
  
  .contact-avatar {
    width: 70rpx;
    height: 70rpx;
    border-radius: 35rpx;
  }
  
  .contact-name {
    font-size: 26rpx;
  }
  
  .contact-bio {
    font-size: 20rpx;
  }
}
</style>
