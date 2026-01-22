import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 设置 @ 符号指向 src 目录
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // --- 新增代理配置 ---
  server: {
    proxy: {
      // 当你调用 /api/chat-process 时，Vite 会自动转发到 http://localhost:3002/api/chat-process
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        // 如果中间件监听的是根路径而不是 /api，可以取消下面这一行的注释：
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  // ------------------
  css: {
    preprocessorOptions: {
      scss: {
        // 自动引入全局变量
        additionalData: `@use "@/styles/_variables.scss" as *;`
      }
    }
  }
})