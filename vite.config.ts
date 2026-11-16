import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/imgweb/',
  plugins: [vue()],
  server: {
    port: 5175,
    // 本地开发连远程后端：浏览器只请求同源 /api，由这里转发，避开后端 CORS 白名单限制
    proxy: {
      '/api': {
        target: 'https://wufeng98.cn/imgServerApi',
        changeOrigin: true,
      },
    },
  },
})
