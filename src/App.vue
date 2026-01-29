<script setup lang="ts">
import { ref, nextTick } from 'vue'
import HistorySidebar from './components/HistorySidebar.vue'
import CatalogPanel from './components/CatalogPanel.vue'
import MessageBubble from './components/MessageBubble.vue'
import Chathead from './components/Chathead.vue'
import ChatInput from './components/ChatInput.vue'
import { getMockData } from './api/mock.ts' 

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
/**
 * 处理发送文本（核心业务逻辑）
 */
const handleSendText = async (data: { content: string; mode: string }) => {
  if (!data.content.trim()) return

  // 1. 先把用户说的话显示在界面右侧
  messages.value.push({
    role: 'user',
    content: data.content
  })
  scrollToBottom()

  try {
    // 2. 调用你小组成员给的 mock 接口
    // 传参给后端：根据接口定义，可能需要 query 等
    const res = await getMockData({
      query: data.content,
      mode: data.mode
    })

    // 3. 拿到结果并显示在左侧 AI 气泡
    // 注意：这里需要根据你后端返回的实际结构来取值
    // 假设后端返回结构是 { data: { sql: '...', tableData: [...] } }
    const serverData = res.data
    
    messages.value.push({
      role: 'assistant',
      content: serverData.explanation || '查询已完成，结果如下：',
      sql: serverData.sql || '', 
      tableData: serverData.tableData || serverData.results || [], // 兼容不同字段名
      explanation: serverData.explanation || ''
    })

  } catch (error) {
    // 4. 【关键防御】如果后端没启动（localhost:8084报错），手动模拟一套数据，不让界面卡死
    console.error('接口请求失败，进入备用模拟模式:', error)
    
    messages.value.push({
      role: 'assistant',
      content: `（模拟回复）关于“${data.content}”的查询结果如下：`,
      sql: "SELECT category, SUM(sales) FROM mock_table GROUP BY category;",
      tableData: [
        { category: '电子产品', sales_qty: 1200, gmv: 500000 },
        { category: '日用百货', sales_qty: 800, gmv: 20000 }
      ],
      explanation: "由于后端服务（localhost:8084）未启动，当前显示的是前端预设的模拟数据。"
    })
  } finally {
    scrollToBottom()
  }
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
          @send-text="handleSendText"
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
  display: flex;
  flex-direction: column; 
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