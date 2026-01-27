<script setup lang="ts">
import { ref } from 'vue'

// 模拟历史对话数据
const historyItems = ref([
  { id: 'c1', title: '本月品类销量 Top10', time: '今天', active: true },
  { id: 'c2', title: '指定区间 GMV 查询', time: '今天', active: false },
  { id: 'c3', title: '库存预警概览', time: '昨天', active: false },
  { id: 'c4', title: '新客留存分层分析', time: '更早', active: false },
])

const searchQuery = ref('')
</script>

<template>
  <div class="sidebar-container">
    <!-- Logo 区域 -->
    <div class="brand">
      <div class="logo">H</div>
      <div class="brand-text">
        <h1>HUAZHI <span>AI</span></h1>
        <div class="tag">FREE</div>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="side-search">
      <input v-model="searchQuery" type="text" placeholder="搜索历史对话...">
    </div>

    <div class="side-divider"></div>

    <!-- 历史列表 -->
    <div class="menu">
      <div 
        v-for="item in historyItems" 
        :key="item.id" 
        :class="['item', { active: item.active }]"
      >
        <div class="left">
          <div class="dot">✦</div>
          <div class="title">{{ item.title }}</div>
        </div>
        <div class="right-time">{{ item.time }}</div>
      </div>
    </div>

    <!-- 底部用户信息 -->
    <div class="side-footer">
      <div class="user">
          <img src="@/assets/user.png" alt="用户头像" class="user-avatar" />
        <div class="name">李丽</div>
      </div>
        <button class="logout" title="退出登录">
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
  padding: 6px 8px 12px;
   .brand-logo {
    
    height: 20px;      
    width: auto;      
    
  
    border-radius: 6px; 
    object-fit: contain;
    
    vertical-align: middle; 
  }
  h1 {
    font-size: 18px; margin: 0; letter-spacing: 0.3px;
    span { color: var(--brand); }
  }
  .tag { font-size: 10px; color: var(--muted); font-weight: 800; }
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