/**
 * Pinia状态管理入口文件
 * 配置Pinia并导出所有store模块
 */

import { createPinia } from 'pinia'

// 导入所有store模块
import { useUserStore } from './modules/user.js'
import { useAppStore } from './modules/app.js'
import { useEventStore } from './modules/event.js'

// 创建pinia实例
const pinia = createPinia()

// 持久化插件（简单实现）
pinia.use(({ store, options }) => {
  // 需要持久化的store列表
  const persistStores = ['user', 'app']
  
  if (persistStores.includes(store.$id)) {
    // 从本地存储恢复数据
    const saved = uni.getStorageSync(`store_${store.$id}`)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        store.$patch(data)
      } catch (error) {
        console.error(`Failed to restore store ${store.$id}:`, error)
      }
    }
    
    // 监听状态变化并保存到本地存储
    store.$subscribe((mutation, state) => {
      try {
        // 过滤掉不需要持久化的字段
        const persistData = { ...state }
        
        // 用户store的token和userInfo已经单独存储，这里不重复存储
        if (store.$id === 'user') {
          delete persistData.token
          delete persistData.userInfo
        }
        
        uni.setStorageSync(`store_${store.$id}`, JSON.stringify(persistData))
      } catch (error) {
        console.error(`Failed to persist store ${store.$id}:`, error)
      }
    })
  }
})

// 导出pinia实例和store
export default pinia

export {
  useUserStore,
  useAppStore,
  useEventStore
}

/**
 * 初始化所有store
 * 在应用启动时调用
 */
export async function initStores() {
  const userStore = useUserStore()
  const appStore = useAppStore()
  
  try {
    // 初始化应用数据
    await appStore.initAppData()
    
    // 初始化用户数据
    await userStore.initUserData()
    
    console.log('Stores initialized successfully')
  } catch (error) {
    console.error('Failed to initialize stores:', error)
  }
}

/**
 * 重置所有store
 * 在退出登录或重置应用时调用
 */
export function resetStores() {
  const userStore = useUserStore()
  const appStore = useAppStore()
  
  // 重置用户store
  userStore.$reset()
  
  // 重置应用store中的用户相关数据
  appStore.quickInputPanel.visible = false
  appStore.crystalBallActive = false
  
  // 清除持久化数据
  uni.removeStorageSync('store_user')
  
  console.log('Stores reset successfully')
}
