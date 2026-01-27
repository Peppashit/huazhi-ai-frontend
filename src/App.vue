<script setup lang="ts">
import { ref, nextTick } from 'vue'
import HistorySidebar from './components/HistorySidebar.vue'
import CatalogPanel from './components/CatalogPanel.vue'
import MessageBubble from './components/MessageBubble.vue'
import Chathead from './components/Chathead.vue'
import ChatInput from './components/ChatInput.vue'

// --- 1. 数据定义 ---
const messages = ref([
  {
    role: 'user',
    content: '帮我查询本月品类销量 Top3'
  },
  {
    role: 'assistant',
    sql: 'SELECT category, SUM(sales) FROM orders GROUP BY category LIMIT 3',
    tableData: [
      { category: '手机数码', sales: 14500 },
      { category: '家用电器', sales: 12000 },
      { category: '美妆个护', sales: 9800 }
    ],
    explanation: '已为您查询到本月销量排名前三的品类。'
  }
])

const selectedKey = ref('ai')
const chatScrollRef = ref<HTMLElement | null>(null) // 绑定滚动容器的引用

// --- 2. 核心逻辑处理 ---

/**
 * 滚动到底部函数
 */
const scrollToBottom = async () => {
  // nextTick 确保在 Vue 更新完 DOM（即新消息渲染出来）后再执行滚动
  await nextTick()
  if (chatScrollRef.value) {
    chatScrollRef.value.scrollTo({
      top: chatScrollRef.value.scrollHeight,
      behavior: 'smooth' // 平滑滚动
    })
  }
}

/**
 * 处理发送文本（由 ChatInput 组件触发）
 * @param {object} data - { content: 输入内容, mode: 当前模式 }
 */
const handleSendText = (data: { content: string; mode: string }) => {
  if (!data.content.trim()) return

  // 1. 将用户输入的消息推送到列表
  messages.value.push({
    role: 'user',
    content: data.content
  })

  // 2. 触发滚动
  scrollToBottom()

  // 3. 模拟后端/AI 回复（演示用）
  setTimeout(() => {
    messages.value.push({
      role: 'assistant',
      content: '正在处理您的请求...',
      explanation: `当前执行模式：${data.mode === 'auto' ? '自动匹配' : '手动匹配'}`
    })
    scrollToBottom()
  }, 800)
}

/**
 * 处理模式切换
 */
const handleModeChange = (mode: string) => {
  console.log('当前选择的匹配模式：', mode)
}

/**
 * 切换 AI 模型
 */
const handleSegChange = (aiModel: string) => {
  console.log('外部监听选中项：', aiModel)
}
</script>

<template>
  <div class="app">
    <!-- 左侧：历史记录 -->
    <aside class="sidebar">
      <HistorySidebar />
    </aside>
    
    <!-- 中间：主聊天区 -->
    <main class="main">
      <header class="chat-header">
        <Chathead
          v-model="selectedKey"
          :options="[
            { key: 'ai', label: '华智Ai', icon: '✨' },
            { key: 'ultra', label: '华智Ultra', icon: '⚡' }
          ]"
          @change="handleSegChange"
        />
      </header>

      <!-- 聊天内容滚动区 -->
      <div class="chat-scroll" ref="chatScrollRef">
        <!-- 遍历渲染消息 -->
        <MessageBubble
          v-for="(item, index) in messages"
          :key="index"
          :data="item"
        />
        <!-- 底部占位符：防止最后一条消息被输入框遮挡 -->
        <div class="scroll-bottom-pad"></div>
      </div>
      
      <div class="chat-input">
        <ChatInput
          @mode-change="handleModeChange"
          @send-text="handleSendText"
          @scroll-to-bottom="scrollToBottom"
        />
      </div>
    </main>

    <!-- 右侧：目录/详情面板 -->
    <aside class="right">
      <CatalogPanel />
    </aside>
  </div>
</template>

<style lang="scss">
// 全局变量建议在其他 CSS 文件定义，这里保留布局逻辑
.app {
  height: 100vh;
  display: grid;
  grid-template-columns: 288px 1fr 360px;
  gap: 26px;
  padding: 22px 22px 18px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f7f9ff 0%, #f3f6ff 100%);
  overflow-y: auto;
}

.sidebar, .right {
  background: #ffffff; // 建议改回具体颜色或变量
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  overflow: hidden;
}

.main {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; // 关键：防止主容器溢出
  
  .chat-header {
    text-align: center;
    padding: 10px;
    flex-shrink: 0;
  }
 .chat-scroll {
    flex: 1; 
    padding: 16px;
    background: #f9fafb;
    overflow-y: auto;
    padding-bottom: 96px;
  }

  // 固定底部输入框
  .chat-input {
      position: absolute; /* 脱离文档流，悬浮在其他内容上 */
      bottom: 0; /* 距离父容器底部 0px */
      left: 0;   /* 距离父容器左侧 0px */
      right: 0;  /* 距离父容器右侧 0px */
      padding: 16px;
      flex-shrink: 0;
      z-index: 20;
      background: linear-gradient(180deg, rgba(247,249,255,0) 0%, rgba(247,249,255,1) 50%); // 增加渐变遮罩感
  }
}
</style>