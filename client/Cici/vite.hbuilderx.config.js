import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  plugins: [uni()],
  server: {
    port: 5173,
    host: 'localhost'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  base: './'
})
