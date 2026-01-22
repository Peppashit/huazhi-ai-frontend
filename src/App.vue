<script setup lang="ts">
import HistorySidebar from './components/HistorySidebar.vue'
import ChatInput from './components/ChatInput.vue'
import CatalogPanel from './components/CatalogPanel.vue'
import MessageBubble from './components/MessageBubble.vue'
import { ref } from 'vue'

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
        <h2>HUAZHI AI FREE</h2>
      </header>

      <div class="chat-scroll">
        <div class="chat-list">
          <MessageBubble 
            v-for="(msg, index) in messages" 
            :key="index"
            v-bind="msg"
          />
        </div>
      </div>
      
      <ChatInput />
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
    h2 { margin: 0; color: var(--text); font-size: 22px; }
  }

  .chat-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    padding-bottom: 140px;
    
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb { background: #e0e5f2; border-radius: 10px; }

    .chat-list {
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
    }
  }
}
</style>