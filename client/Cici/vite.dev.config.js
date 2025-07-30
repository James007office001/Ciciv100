import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// 开发环境专用配置，简化配置以避免兼容性问题
export default defineConfig({
  plugins: [
    uni({
      // 简化插件配置
      vueOptions: {
        template: {
          transformAssetUrls: {
            base: null,
            includeAbsolute: false,
          },
        },
      },
    })
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true,
    cors: true,
    fs: {
      strict: false,
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    'process.env.NODE_ENV': JSON.stringify('development')
  },
  optimizeDeps: {
    exclude: ['vue-demi']
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'static',
    rollupOptions: {
      external: []
    }
  }
})
