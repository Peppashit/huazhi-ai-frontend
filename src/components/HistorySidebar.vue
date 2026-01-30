<script setup lang="ts">
// 修复 3: 添加 onMounted 导入
import { ref, watch, onMounted } from 'vue'

// --- 1. 类型与常量定义 ---
const STORAGE_KEY = 'huazhi_ai_history_v1'

interface ChatHistoryItem {
  id: string;
  title: string;
  time: string;
  active: boolean;
  messages: Array<{ 
    role: 'user' | 'assistant'; 
    content: string; 
    sql?: string; 
    tableData?: any; 
    explanation?: string 
  }>;
}

const emit = defineEmits<{
  'chat-change': [chat: ChatHistoryItem];
}>();

// --- 2. 工具函数 ---
const generateId = () => `chat_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

// --- 3. 初始化数据逻辑 ---
const getInitialData = (): ChatHistoryItem[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("解析本地存储失败:", e);
    }
  }

  return [
    {
      id: generateId(),
      title: '本月品类销量 Top10',
      time: '今天',
      active: true,
      messages: [
        { role: 'user', content: '帮我查询本月品类销量 Top10' },
        { role: 'assistant', content: '已为您查询到本月销量排名前十的品类。', sql: 'SELECT category, SUM(sales) FROM orders GROUP BY category LIMIT 10', tableData: [], explanation: '查询结果基于订单表统计' }
      ]
    },
    {
      id: generateId(),
      title: '指定区间 GMV 查询',
      time: '今天',
      active: false,
      messages: [
        { role: 'user', content: '查询2024年Q1的GMV' },
        { role: 'assistant', content: '2024年Q1 GMV为1200万', sql: 'SELECT SUM(gmv) FROM orders WHERE create_time BETWEEN "2024-01-01" AND "2024-03-31"', tableData: [], explanation: 'GMV统计包含所有有效订单' }
      ]
    },
    {
      id: generateId(),
      title: '库存预警概览',
      time: '今天',
      active: false,
      messages: [
        { role: 'user', content: '查询库存' },
        { role: 'assistant', content: '2024年Q1 GMV为1200万', sql: 'SELECT SUM(gmv) FROM orders WHERE create_time BETWEEN "2024-01-01" AND "2024-03-31"', tableData: [], explanation: 'GMV统计包含所有有效订单' }
      ]
    }
  ];
};

const handleLogout = () => {
  if (confirm('确定要退出登录并清除本地缓存吗？')) {
    localStorage.clear();
    window.location.reload();
  }
};

const historyItems = ref<ChatHistoryItem[]>(getInitialData());

// --- 4. 持久化监听 ---
watch(historyItems, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });

// --- 5. 核心方法实现 ---

const createNewChat = () => {
  const newChat: ChatHistoryItem = {
    id: generateId(),
    title: '新对话',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    active: true,
    messages: []
  };
  historyItems.value.forEach(item => item.active = false);
  historyItems.value.unshift(newChat);
  emit('chat-change', newChat);
};

const switchChat = (item: ChatHistoryItem) => {
  historyItems.value.forEach(i => i.active = false);
  item.active = true;
  emit('chat-change', item);
};

// 修复 1 & 2: 增加对 undefined 的安全检查
const deleteChat = (id: string, e: MouseEvent) => {
  e.stopPropagation();
  const index = historyItems.value.findIndex(item => item.id === id);
  if (index !== -1) {
    const wasActive = historyItems.value[index].active;
    historyItems.value.splice(index, 1);
    
    if (wasActive) {
      if (historyItems.value.length > 0) {
        // 确保 historyItems.value[0] 存在才调用
        switchChat(historyItems.value[0]);
      } else {
        createNewChat();
      }
    }
  }
};

const renameDialogId = ref('');
const renameInputValue = ref('');
const openRenameInput = (item: ChatHistoryItem, e: MouseEvent) => {
  e.stopPropagation();
  renameDialogId.value = item.id;
  renameInputValue.value = item.title;
};
const confirmRename = (item: ChatHistoryItem) => {
  if (renameInputValue.value.trim()) {
    item.title = renameInputValue.value.trim();
  }
  renameDialogId.value = '';
};

const addChatToHistory = (newChat: ChatHistoryItem) => {
  historyItems.value.forEach(chat => chat.active = false);
  const exists = historyItems.value.find(c => c.id === newChat.id);
  if (!exists) {
    historyItems.value.unshift(newChat);
  }
};

const searchQuery = ref('');
const filteredHistoryItems = ref<ChatHistoryItem[]>(historyItems.value);
watch([searchQuery, historyItems], () => {
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    filteredHistoryItems.value = historyItems.value.filter(item => 
      item.title.toLowerCase().includes(q)
    );
  } else {
    filteredHistoryItems.value = [...historyItems.value];
  }
}, { immediate: true, deep: true });

// 修复 1 & 2: 确保 activeChat 不为 undefined 再 emit
onMounted(() => {
  const activeChat = historyItems.value.find(i => i.active) || historyItems.value[0];
  if (activeChat) {
    emit('chat-change', activeChat);
  }
});

defineExpose({
  addChatToHistory,
  createNewChat
});
</script>

<template>
  <div class="sidebar-container">
    <!-- Logo + 新建对话按钮 -->
    <div class="brand">
      <div class="logo">
      <img src="../assets/image copy.png" alt="logo" />
      </div>
      <div class="brand-text">
        <h1>HUAZHI <span>AI</span></h1>
        <div class="tag">FREE</div>
      </div>
      <!-- 新建对话按钮 -->
      <button class="new-chat-btn" @click="createNewChat" title="新建对话">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="side-search">
      <input v-model="searchQuery" type="text" placeholder="搜索历史对话...">
    </div>

    <div class="side-divider"></div>

    <!-- 历史列表 -->
    <div class="menu">
      <div 
        v-for="item in filteredHistoryItems" 
        :key="item.id" 
        :class="['item', { active: item.active }]"
        @click="switchChat(item)"
      >
        <div class="left">
          <div class="dot">✦</div>
          <!-- 重命名输入框/标题切换 -->
          <div v-if="renameDialogId === item.id" class="rename-input-wrap">
            <input 
              :id="`rename-input-${item.id}`"
              v-model="renameInputValue"
              class="rename-input"
              @blur="confirmRename(item)"
              @keyup.enter="confirmRename(item)"
            >
          </div>
          <div v-else class="title" @dblclick="openRenameInput(item, $event)">
            {{ item.title }}
          </div>
        </div>
        <div class="right-actions">
          <span class="right-time">{{ item.time }}</span>
          <!-- 操作按钮（hover显示） -->
          <div class="item-actions">
            <button class="rename-btn" @click.stop="openRenameInput(item, $event)" title="重命名">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
              </svg>
            </button>
            <button class="delete-btn" @click.stop="deleteChat(item.id, $event)" title="删除">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部用户信息 -->
    <div class="side-footer">
      <div class="user">
        <img src="@/assets/user.png" alt="用户头像" class="user-avatar" />
        <div class="name">李丽</div>
      </div>
      <button class="logout" @click="handleLogout" title="退出登录">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
// 新增：新建对话按钮
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 12px;
  justify-content: space-between; // 新增：让按钮靠右
  .new-chat-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--line);
    background: #fff;
    cursor: pointer;
    color: #93a0c0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    &:hover {
      background: #f6f7ff;
      color: var(--brand);
      border-color: #dde4ff;
    }
  }
}

// 历史项操作按钮
.item {
  position: relative; // 新增：用于操作按钮定位
  .right-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .item-actions {
    display: none; // 默认隐藏
    gap: 4px;
  }
  &:hover .item-actions {
    display: flex; // hover显示
  }
  .rename-btn, .delete-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #93a0c0;
    &:hover {
      color: var(--brand);
    }
    .delete-btn:hover {
      color: #ef4444;
    }
  }
  // 重命名输入框样式
  .rename-input-wrap {
    width: 100%;
  }
  .rename-input {
    width: 100%;
    height: 24px;
    border: 1px solid var(--brand);
    border-radius: 4px;
    padding: 0 4px;
    font-size: 13px;
    outline: none;
    &:focus {
      border-color: var(--brand);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
  }
}

// 保留原有样式...
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 18px 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px;

  .logo {
    width: 32px;      // 这是圆圈的大小
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #a594ff 0%, #3ca7ff 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    
    /* 关键改动：通过 padding 来控制图片缩放 */
    /* 增加这个值，图片就会变小；减小这个值，图片就会变大 */
    padding: 7px;     
    box-sizing: border-box; // 必须加上这句，确保 padding 不会撑大圆圈

    img {
      /* 这里强制设置，防止它失控 */
      width: 100% !important; 
      height: 100% !important;
      object-fit: contain;
      display: block;
    }
  }

  .brand-text {
    display: flex;
    align-items: center; // 确保文字和标签在一行居中
    gap: 6px;

    h1 {
      font-size: 17px;
      margin: 0;
      font-weight: 800;
      color: #1a2138;
      white-space: nowrap;
      line-height: 1;

      span {
        color: #3ca7ff;
      }
    }

    .tag {
      font-size: 17px;
      color: #3ca7ff;
      font-weight: 800;
      border: 1px solid #3ca7ff;
      padding: 1px 3px;
      border-radius: 4px;
      line-height: 1;
      flex-shrink: 0;
      /* 使用 scale 稍微缩小一下，看起来更精致 */
      transform: scale(0.8);
      transform-origin: left center;
    }
  }
}

.side-search {
  padding: 0 6px 12px;
  input {
    width: 100%; height: 38px;
    border-radius: 12px; border: 1px solid var(--line);
    padding: 0 12px; font-size: 13px; outline: none;
    background: var(--bg);
    &:focus { border-color: var(--brand); background: #fff; }
  }
}

.side-divider { height: 1px; background: var(--line); margin: 0 6px 12px; }

.menu {
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column; gap: 4px;
  .item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px; border-radius: 14px; cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
    
    .left {
      display: flex; align-items: center; gap: 10px; min-width: 0;
      .dot {
        width: 22px; height: 22px; border-radius: 8px;
        background: #fff; border: 1px solid var(--line);
        display: grid; place-items: center; color: #93a0c0; font-size: 12px;
      }
      .title {
        font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
    }
    .right-time { font-size: 11px; color: var(--muted); }

    &:hover { background: var(--panel-2); }
    &.active {
      background: linear-gradient(180deg, #eef2ff, #f6f7ff);
      border-color: #dde4ff;
      .left .dot { background: var(--brand); color: #fff; border: none; }
      .left .title { font-weight: 600; color: var(--brand); }
    }
  }
}
    .user-avatar {
    width: 36px;     
    height: 36px;
    border-radius: 12px; 
    object-fit: cover;  
    
    border: 1px solid var(--line);
  }
    .name { font-size: var(--fs-h3); font-weight: 600; }
  
.side-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 6px 0; border-top: 1px solid var(--line);
  .user {
    display: flex; align-items: center; gap: 10px;
    .avatar {
      width: 36px; height: 36px; border-radius: 12px;
      background: var(--brand); color: #fff;
      display: grid; place-items: center; font-weight: 800;
    }
    .name { font-size: 14px; font-weight: 600; }
  }
    .logout {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: #fff; 
  cursor: pointer;
  color: #93a0c0;   
  
  
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover {
    background:#fff; // 鼠标悬停变浅红
    color: black;      // 图标变红
    border-color:#dde4ff;
  }
  svg {
    display: block;
  }
}
}

</style>