import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { plugin as markdown } from 'vite-plugin-markdown';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    markdown({
      mode: ['react'], // 让 .md 直接变成 React 组件
    }),
  ],
  server: {
    host: true,  // 必须，监听局域网所有地址
    port: 5173,  // 可自定义端口
    proxy: {
      '/translate': 'http://localhost:8000',
      '/db': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/db/, '')  // 去掉 /translate 前缀
      }
    }
  }
})
