<script setup lang="ts">
import { ref, nextTick } from 'vue'
import HistorySidebar from './components/HistorySidebar.vue'
import CatalogPanel from './components/CatalogPanel.vue'
import MessageBubble from './components/MessageBubble.vue'
import Chathead from './components/Chathead.vue'
import ChatInput from './components/ChatInput.vue'
import { getMockData } from './api/mock.ts' 

// --- 1. 类型定义 ---

// 提取单个消息的类型，方便复用
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  tableData?: any;
  explanation?: string;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  time: string;
  active: boolean;
  messages: ChatMessage[];
}

// --- 2. 响应式变量定义 ---

// 修复错误：定义 historySidebarRef 以匹配模板中的 ref="historySidebarRef"
const historySidebarRef = ref<InstanceType<typeof HistorySidebar> | null>(null);

// 修复错误：定义 loading 变量
const loading = ref(false);

const currentChat = ref<ChatHistoryItem>({
  id: 'init-id', // 给个初始ID
  title: '新对话',
  time: '今天',
  active: true,
  messages: []
});

const messages = ref(currentChat.value.messages);
const selectedKey = ref('ai')
const chatScrollRef = ref<HTMLElement | null>(null)
const excludedTables = ref<string[]>([])

// --- 3. 工具函数 ---

// 修复错误：定义 generateId 函数
const generateId = () => Math.random().toString(36).substring(2, 11);

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

// --- 4. 逻辑处理函数 ---

const handleChatChange = (chat: ChatHistoryItem) => {
  currentChat.value = chat;
  messages.value = chat.messages;
  nextTick(() => scrollToBottom());
};

// 修复提示：createNewChat 现在可以通过某种方式被调用（例如由子组件触发）
const createNewChat = () => {
  const newChat: ChatHistoryItem = {
    id: generateId(),
    title: '新对话',
    time: '今天',
    active: true,
    messages: [] 
  };
  currentChat.value = newChat;
  messages.value = newChat.messages;
  // 调用 sidebar 的方法同步
  historySidebarRef.value?.addChatToHistory(newChat);
  nextTick(() => scrollToBottom());
};

const handleSendText = async (data: { content: string; mode: string }) => {
  // 1. 基础拦截
  if (!data.content.trim() || loading.value) return;

  // 2. 自动更新标题（如果是新对话）
  if (currentChat.value.title === '新对话') {
    currentChat.value.title = data.content.slice(0, 15);
  }

  // 3. 构建并添加用户消息到界面
  const userMessage: ChatMessage = { 
    role: 'user', 
    content: data.content 
  };
  currentChat.value.messages.push(userMessage);
  messages.value = [...currentChat.value.messages]; // 触发响应式更新
  
  await scrollToBottom();
  
  // 4. 开始请求
  loading.value = true; 

  try {
    const res = await getMockData({ query: data.content, mode: data.mode });
    console.log("接口原始响应 res:", res); 

    // --- 你刚才问的代码块开始 ---
    const serverData = res.data || res; 

    const aiMessage: ChatMessage = {
      role: 'assistant',
      content: serverData.explanation || '查询结果如下：',
      sql: serverData.sql || '', 
      // 这里同时兼容后端返回的 tableData, results, 和 data 字段
      tableData: serverData.tableData || serverData.results || serverData.data || [], 
      explanation: serverData.explanation || ''
    };
    // --- 你刚才问的代码块结束 ---
    
    // 5. 将 AI 回复存入消息记录并更新界面
    currentChat.value.messages.push(aiMessage);
    messages.value = [...currentChat.value.messages]; 
    console.log("最终存入界面的表格数据:", aiMessage.tableData);

  } catch (error) {
    console.error('接口请求失败，进入备用模拟模式:', error);
    // 备用逻辑
    const mockAiMessage: ChatMessage = {
      role: 'assistant',
      content: `（模拟）服务请求失败，正在显示本地演示数据。`,
      sql: "SELECT * FROM mock_table;",
      tableData: [
        { id: 'MOCK-01', info: '演示数据A' },
        { id: 'MOCK-02', info: '演示数据B' }
      ],
      explanation: "后端服务连不上，请检查 8084 端口是否开启了 mock.py。"
    };
    currentChat.value.messages.push(mockAiMessage);
    messages.value = [...currentChat.value.messages];
  } finally {
    loading.value = false; // 无论成功失败都关闭加载状态
    await scrollToBottom();
  }
};

const handleUpdateExclude = (list: string[]) => {
  excludedTables.value = list
  console.log('App.vue 已同步最新的排除名单:', list)
}

const handleExecuteFeature = (featureName: string) => {
  handleSendText({
    content: `帮我执行：${featureName}`,
    mode: 'auto'
  })
}

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
      <HistorySidebar 
      ref="historySidebarRef"
      @chat-change="handleChatChange" />
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
          :disabled="loading"
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
  overflow-y: hidden;
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