<script setup lang="ts">
import { ref, nextTick } from 'vue'
import HistorySidebar from './components/HistorySidebar.vue'
import CatalogPanel from './components/CatalogPanel.vue'
import MessageBubble from './components/MessageBubble.vue'
import Chathead from './components/Chathead.vue'
import ChatInput from './components/ChatInput.vue'
import { useChat } from './hooks/useChat'

// --- 1. 数据定义 ---
const { messages, loading, sendMessage } = useChat();
const selectedKey = ref('ai')
const chatScrollRef = ref<HTMLElement | null>(null)

// 【连接点 A】：存储从右侧面板传过来的“排除名单”
const excludedTables = ref<string[]>([])

// --- 2. 核心逻辑处理 ---

/**
 * 滚动到底部
 */
const scrollToBottom = async () => {
  await nextTick()
  if (chatScrollRef.value) {
    chatScrollRef.value.scrollTo({
      top: chatScrollRef.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}


/**
 * 处理发送文本（核心业务逻辑）
 */
const handleSendText = async (data: { content: string; mode: string }) => {
  if (!data.content.trim()) return

  // 1. 将用户输入的消息推送到列表
  messages.value.push({
    role: 'user',
    content: data.content
  })

  // 【核心逻辑】：在这里，你可以同时拿到“消息内容”和“排除名单”
  console.log('--- 准备提交后端 ---')
  console.log('用户问题:', data.content)
  console.log('匹配模式:', data.mode)
  console.log('排除名单 (Exclude):', excludedTables.value) 
  // 以后对接 API 就是：axios.post('/api/chat', { query: data.content, excludes: excludedTables.value })

  scrollToBottom()
  // 用户消息立即上屏

  // 调用 Hook 触发后端请求
  // 这里不再处理 excludedTables，只传内容和模式
  await sendMessage(data.content, data.mode);

}

/**
 * 【连接点 B】：处理来自 CatalogPanel 的排除名单更新
 */
const handleUpdateExclude = (list: string[]) => {
  excludedTables.value = list
  console.log('App.vue 已同步最新的排除名单:', list)
}

/**
 * 【连接点 C】：处理来自 CatalogPanel 的“执行”操作
 */
const handleExecuteFeature = (featureName: string) => {
  // 当点击右侧“执行”时，直接调用 handleSendText 模拟发送
  handleSendText({
    content: `帮我执行：${featureName}`,
    mode: 'auto' // 默认使用自动模式
  })
}

// 模型切换逻辑
const handleSegChange = (aiModel: string) => {
  console.log('切换模型：', aiModel)
}

const handleModeChange = (mode: string) => {
  console.log('切换模式：', mode)
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
      <div class="chat-scroll" ref="chatScrollRef" >
        <!-- 遍历渲染消息 -->
        <MessageBubble
        v-for="(item, index) in messages"
        :key="index"
        :data="item"
      />
        <div class="scroll-bottom-pad"></div>
      </div>
      
      <div class="chat-input">
        <ChatInput
          @mode-change="handleModeChange"
          @send ="handleSendText":disabled="loading"
          @scroll-to-bottom="scrollToBottom"
        />
      </div>
    </main>

    <!-- 右侧：目录/详情面板 -->
    <aside class="right">
      <!-- 关键点：监听子组件传出来的两个事件 -->
      <CatalogPanel 
        @update-exclude="handleUpdateExclude"
        @execute-feature="handleExecuteFeature"
      />
    </aside>
  </div>
</template>

<style lang="scss">
/* 保持你原来的样式不变 */
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
  background: #ffffff;
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
  
  .chat-input {
      position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; z-index: 20;
      background: linear-gradient(180deg, rgba(247,249,255,0) 0%, rgba(247,249,255,1) 50%);
  }
}
</style>