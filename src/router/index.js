// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Chat from '../views/Chat.vue'

const routes = [
  {
    path: '/',
    redirect: '/chat' // 默认跳转到聊天页
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat // 核心聊天页面
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router