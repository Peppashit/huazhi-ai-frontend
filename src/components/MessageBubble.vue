<template>
  <!-- 外层容器：通过 role 动态切换 class -->
  <div :class="['message-wrapper', data.role === 'user' ? 'role-user' : 'role-assistant']">
    
    <!-- 头像区 -->
    <div class="avatar-area">
      <div v-if="data.role === 'user'" class="avatar user-avatar">👤</div>
      <div v-else class="avatar ai-avatar">🤖</div>
    </div>

    <!-- 消息内容区 -->
    <div class="content-area">
      
      <!-- 情况 A: 如果是用户消息 -->
      <div v-if="data.role === 'user'" class="user-card">
        <div class="user-content">
          <p class="user-query">{{ data.content || '请输入您的查询需求' }}</p>
        </div>
      </div>

      <!-- 情况 B: 如果是 AI 消息 (保留了队友所有的功能模块) -->
      <div v-else class="ai-card">
        <!-- 1. 匹配信息模块 -->
        <div v-if="matchedTables.length > 0" class="info-card">
          <div class="info-header">
            <span class="mode-tag primary">自动模块匹配</span>
            <span class="info-title">已自动匹配模块（表集合）</span>
          </div>
          <div class="info-content">
            <p class="match-desc">匹配模块：<span class="highlight">销售分析模块</span></p>
            <div class="table-tags">
              <span class="table-tag" v-for="table in matchedTables" :key="table.name">
                {{ table.name }} • {{ table.desc }}
              </span>
            </div>
          </div>
        </div>

        <!-- 2. SQL 代码块模块 -->
        <div v-if="data.sql || generatedSQL" class="sql-card">
          <div class="sql-header">
            <span class="sql-title">⚡ 生成的SQL</span>
            <button class="save-btn" @click="handleSaveAsFunction">保存为功能</button>
          </div>
          <div class="sql-code-scroll">
            <div class="sql-code">
              <pre>{{ data.sql || generatedSQL }}</pre>
            </div>
          </div>
        </div>

        <!-- 3. 查询结果表格模块 (分页保留) -->
        <div v-if="displayResultData.length > 0" class="result-card">
          <div class="result-header">
            <span class="result-title">📊 查询结果 • 共 {{ resultData.length }} 条</span>
            <button class="export-btn" @click="handleExport">导出</button>
          </div>
          <div class="result-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Rank</th><th>品类</th><th>销量</th><th>GMV</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in displayResultData" :key="index">
                  <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                  <td>{{ item.category }}</td>
                  <td>{{ item.sales_qty.toLocaleString() }}</td>
                  <td>{{ item.gmv.toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- 分页器 -->
          <div class="pagination">
            <div class="page-buttons">
              <button class="page-btn" :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">上一页</button>
              <button class="page-btn" :disabled="currentPage === totalPages" @click="handlePageChange(currentPage + 1)">下一页</button>
            </div>
          </div>
        </div>

        <!-- 4. 纯文本说明 -->
        <div v-if="data.explanation" class="pure-text">
          {{ data.explanation }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

// 接收来自 App.vue 的数据
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

// --- 保留小组成员的逻辑数据 ---
const matchedTables = reactive([
  { name: 'orders', desc: '订单主表' },
  { name: 'order_items', desc: '订单明细' }
]);

const generatedSQL = ref(`SELECT * FROM sales LIMIT 10;`);

const resultData = reactive([
  { category: '手机数码', sales_qty: 18240, gmv: 14329800 },
  { category: '家用电器', sales_qty: 15870, gmv: 13100420 },
  { category: '美妆个护', sales_qty: 14920, gmv: 6321800 },
  // ... 其他数据保持不变
]);

// 分页逻辑保持不变
const pageSize = ref(5);
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(resultData.length / pageSize.value));
const displayResultData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return resultData.slice(start, start + pageSize.value);
});

const handlePageChange = (page: number) => {
  currentPage.value = page;
};
const handleSaveAsFunction = () => { console.log('保存SQL'); };
const handleExport = () => { console.log('导出数据'); };
</script>

<style scoped lang="scss">
/* --- 核心：左右布局逻辑 --- */
.message-wrapper {
  display: flex;
  margin-bottom: 24px;
  width: 100%;
  gap: 12px;
  padding: 0 16px;
  box-sizing: border-box;

  /* AI 消息：默认左对齐 */
  &.role-assistant {
    flex-direction: row; 
    .content-area { align-items: flex-start; }
    .ai-card { border-top-left-radius: 2px; }
  }

  /* 用户消息：右对齐 */
  &.role-user {
    flex-direction: row-reverse; /* 关键：头像和内容反向 */
    .content-area { align-items: flex-end; }
    .user-card { 
      background: #4e6ef2; /* 蓝色气泡 */
      color: #fff;
      border-top-right-radius: 2px;
    }
  }
}

/* --- 头像样式 --- */
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.ai-avatar { background: #8b5cf6; color: white; }
.user-avatar { background: #e0e7ff; }

/* --- 内容区容器 --- */
.content-area {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  gap: 8px;
}

/* --- 用户气泡样式 --- */
.user-card {
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  .user-query { margin: 0; font-size: 14px; line-height: 1.5; }
}

/* --- AI 综合卡片样式 (整合队友的功能) --- */
.ai-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #eef0f5;
  width: 100%;
}

/* 以下保留并美化队友的 SQL/表格样式 */
.info-card { background: #f9fafb; padding: 10px; border-radius: 8px; }
.table-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.table-tag { font-size: 11px; background: #fff; padding: 2px 6px; border: 1px solid #eee; border-radius: 4px; }

.sql-card {
  background: #1e293b;
  color: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  .sql-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
  .save-btn { background: #334155; color: #fff; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; }
  pre { margin: 0; font-family: monospace; font-size: 12px; overflow-x: auto; color: #cbd5e1; }
}

.result-card {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  .result-header { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #f1f5f9; }
  .result-title { font-size: 12px; font-weight: bold; }
  .export-btn { font-size: 11px; cursor: pointer; }
  
  table {
    width: 100%; border-collapse: collapse; font-size: 12px;
    th { background: #f8fafc; padding: 8px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
  }
}

.pagination {
  padding: 8px; display: flex; justify-content: flex-end;
  .page-btn { font-size: 11px; margin-left: 4px; cursor: pointer; }
}

.pure-text { font-size: 14px; color: #334155; line-height: 1.6; }
</style>