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

.sidebar {
  /* 定位与层级 */
  position: fixed;         /* 固定在屏幕左侧 */
  left: 12px;
  top: 18px;
  z-index: 100;            /* 确保在最上层 */

  /* 尺寸控制 */
  flex: 0 0 260px; 
    min-width: 260px; /* 锁定宽度，不再随百分比变化 */
  
  height: calc(100vh - 30px); /* 100% 视口高度减去上下边距 (30px * 2) */


  /* 视觉样式 */
  background: rgba(255, 255, 255, 1);
  border-radius: 20px;
  opacity: 1;
  
  /* 精确的阴影效果 */
  box-shadow: 0px 17px 40px 4px rgba(112, 144, 176, 0.11);

  /* 内部布局补丁 */
  display: flex;
  flex-direction: column;
  overflow: hidden;        /* 确保内部圆角不被子元素遮挡 */
  box-sizing: border-box;  /* 极其重要 */
}



// .right {
//   background: var(--panel);
//   border-radius: var(--radius-xl);
//   box-shadow: var(--shadow);
//   overflow: hidden;
// }
.right {
  /* 1. 定位：在 PC 端固定在右侧 */
  position: fixed;
  right: 12px;          /* 关键：相对于右边定位，而非左边 */
  top: 18px;
  z-index: 90;
  flex: 0 0 330px; 
    min-width: 330px; /* 锁定宽度，不再随百分比变化 */
  height: calc(100vh - 30px); 
  
  /* 3. 视觉样式：完全匹配你的目标 */
  background: rgba(255, 255, 255, 1);
  border-radius: 20px;
  opacity: 1;
  box-shadow: 0px 17px 40px 4px rgba(112, 144, 176, 0.11);
  
}

// .main {
//   position: relative;
//   display: flex;
//   flex-direction: column;
//   height: 100%;
  
//   .chat-header {
//     text-align: center;
//     padding: 10px;
//     h2 { margin: 0; color: var(--text); font-size: 22px; }
//   }

//   .chat-scroll {
//     flex: 1;
//     overflow-y: auto;
//     padding: 20px;
//     padding-bottom: 140px;
    
//     &::-webkit-scrollbar { width: 6px; }
//     &::-webkit-scrollbar-thumb { background: #e0e5f2; border-radius: 10px; }

//     .chat-list {
//       max-width: 900px;
//       margin: 0 auto;
//       width: 100%;
//     }
//   }
// }

.main {
  /* 保持之前的逻辑 */
  margin-left: 350px;
  margin-right: 452px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  
  /* 【关键修改点 1】设置最小宽度，防止内容被挤扁 */
  min-width: 500px; 
  

  .chat-header h2 {
  /* 【关键修改点 3】强制文字不换行 */
  white-space: nowrap; 
  display: flex;
  justify-content: center;
  gap: 10px;
}
  /* 【关键修改点 2】如果屏幕实在太窄，允许整体出现横向滚动条 */
  /* 或者通过媒体查询在小屏幕时减少 margin */
  .chat-input-container {
  /* 如果你的输入框是悬浮的 */
  position: absolute;
  bottom: 30px;
  left: 20px;
  right: 20px;
  
  /* 确保内部元素横向排列 */
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  padding: 10px 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  gap: 12px;

  input {
    flex: 1; /* 让输入框占据剩余所有空间 */
    border: none;
    outline: none;
  }
  
  .send-btn {
    flex-shrink: 0; /* 防止发送按钮被挤压 */
  }
}
}


</style>