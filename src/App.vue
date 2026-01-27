<script setup lang="ts">
import HistorySidebar from './components/HistorySidebar.vue'
import CatalogPanel from './components/CatalogPanel.vue'
import MessageBubble from './components/MessageBubble.vue'
import { ref } from 'vue'
import Chathead from './components/Chathead.vue'
import ChatInput from './components/ChatInput.vue'

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

// 1.绑定选中值
const selectedKey = ref('ai');

// 监听选中变化（预留接口）
const handleSegChange = (aiModel) => {
  console.log('外部监听选中项：', aiModel);
};
// 2. 对接组件预留的接口（核心：处理业务逻辑/调用后端接口）
/**
 * 处理模式切换（自动/手动模块匹配）
 * @param {string} mode - auto（自动） / manual（手动）
 */
const handleModeChange = (mode) => {
  console.log('当前选择的匹配模式：', mode);
  // 这里对接后端接口示例（预留）
  // axios.post('/api/set-match-mode', { mode }).then(res => {
  //   console.log('模式设置成功：', res.data);
  // });
};
/**
 * 处理发送文本
 * @param {object} data - { content: 输入的文本, mode: 当前选择的模式 }
 */
const handleSendText = (data) => {
  console.log('发送的内容：', data.content);
  console.log('发送时的匹配模式：', data.mode);
  // 这里对接发送消息的后端接口（预留）
  // axios.post('/api/send-message', {
  //   content: data.content,
  //   matchMode: data.mode
  // }).then(res => {
  //   console.log('消息发送成功，返回结果：', res.data);
  // });
};
/**
 * 处理回到底部的操作
 */
const handleScrollToBottom = () => {
  console.log('触发回到底部操作');
  if (chatScrollRef.value) {
    chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight;
  }
};
  
  // 2. 对接后端接口（如果需要）（预留）
  // axios.get('/api/get-bottom-data').then(res => {
  //   console.log('获取底部数据成功：', res.data);
  // });


</script>

<template>
  <div class="app">
    <!-- 左侧 -->
    <aside class="sidebar">
      <HistorySidebar />
    </aside>
    
    <!-- 中间 -->
    <main class="main">
      <header class="chat-header">
        <!-- 使用封装的分段选择器组件 -->
      <Chathead
      v-model="selectedKey"
      :options="[
        { key: 'ai', label: '华智Ai', icon: '✨' },
        { key: 'ultra', label: '华智Ultra', icon: '⚡' }
      ]"
      @change="handleSegChange"
      />
      </header>

      <div class="chat-scroll">
      <!-- 遍历渲染所有消息卡片 -->
      <MessageBubble
      />
      </div>
      
      <div class="chat-input">
        <ChatInput
        @mode-change="handleModeChange"
        @send-text="handleSendText"
        @scroll-to-bottom="handleScrollToBottom"
       />
      </div>
    </main>

    <!-- 右侧 -->
    <aside class="right">
      <CatalogPanel />
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
  background: var(--panel);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.main {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .chat-header {
    text-align: center;
    padding: 10px;
    flex-shrink: 0;
    h2 { margin: 0; color: var(--text); font-size: 22px; }
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
  }
}
</style>