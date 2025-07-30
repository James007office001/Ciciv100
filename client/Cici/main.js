
// #ifndef VUE3
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import pinia, { initStores } from './src/store/index.js'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  
  // 在应用启动时初始化Google冲突修复（仅在生产环境）
  if (process.env.NODE_ENV === 'production') {
    try {
      import('./src/utils/googleConflictFix.js').then(module => {
        module.initGoogleConflictFix()
      })
    } catch (error) {
      console.warn('Google冲突修复初始化失败:', error)
    }
  }
  
  // 使用完整的 Pinia 实例
  app.use(pinia)
  
  // 初始化所有 stores
  initStores().catch(error => {
    console.error('初始化 stores 失败:', error)
  })
  
  return {
    app
  }
}
// #endif