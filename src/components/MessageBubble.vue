<template>
  <div :class="['message-wrapper', data.role === 'user' ? 'role-user' : 'role-assistant']">
    
    <div class="avatar-area">
      <div v-if="data.role === 'user'" class="avatar user-avatar">👤</div>
      <div v-else class="avatar ai-avatar">🤖</div>
    </div>

    <div class="content-area">
      
      <div v-if="data.role === 'user'" class="user-card">
        <div class="user-content">
          <p class="user-query">{{ data.content }}</p>
        </div>
      </div>

      <div v-else class="ai-card">
        
        <div class="pure-text" v-if="data.content">
          {{ data.content }}
        </div>

        <div class="info-card">
          <div class="info-header">
            <span class="mode-tag primary">自动模块匹配</span>
            <span class="info-title">已自动匹配模块</span>
          </div>
          <div class="info-content">
            <p class="match-desc">
              匹配模块：<span class="highlight">{{ data.module_name || '自动推断模块' }}</span>
            </p>
            <div class="table-tags">
              <span class="table-tag" v-for="table in defaultTables" :key="table.name">
                {{ table.name }} • {{ table.desc }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="data.sql" class="sql-card">
          <div class="sql-header">
            <span class="sql-title">⚡ 生成的SQL</span>
            <button class="save-btn" @click="handleSaveAsFunction">保存为功能</button>
          </div>
          <div class="sql-code-scroll">
            <div class="sql-code">
              <pre>{{ data.sql }}</pre>
            </div>
          </div>
        </div>

        <div v-if="data.tableData && data.tableData.length > 0" class="result-card">
          <div class="result-header">
            <span class="result-title">📊 查询结果 • 共 {{ data.tableData.length }} 条</span>
            <button class="export-btn" @click="handleExport">导出</button>
          </div>
          
          <div class="result-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th v-for="key in Object.keys(data.tableData[0])" :key="key">{{ key }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in displayResultData" :key="index">
                  <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                  <td v-for="(val, vIndex) in Object.values(item)" :key="vIndex">{{ val }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="pagination">
            <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
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

// --- 静态展示数据 (保留旧版模块展示功能) ---
// 如果未来后端返回了匹配的表信息，可以替换这里的 defaultTables
const defaultTables = reactive([
  { name: 'orders', desc: '订单主表' },
  { name: 'order_items', desc: '订单明细' }
]);

// --- 分页逻辑 (针对 data.tableData) ---
const pageSize = ref(5); // 每页显示 5 条
const currentPage = ref(1);

const totalPages = computed(() => {
  const list = props.data.tableData || [];
  return Math.ceil(list.length / pageSize.value) || 1;
});

const displayResultData = computed(() => {
  const list = props.data.tableData || [];
  const start = (currentPage.value - 1) * pageSize.value;
  return list.slice(start, start + pageSize.value);
});

// --- 交互处理函数 ---
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleSaveAsFunction = () => {
  if (typeof (window as any).onSaveAsFunction === 'function') {
    (window as any).onSaveAsFunction({
      sql: props.data.sql,
      module: props.data.module_name || 'auto'
    });
  }
};

const handleExport = () => {
  if (typeof (window as any).onExportResult === 'function') {
    (window as any).onExportResult({
      data: props.data.tableData,
      type: 'excel'
    });
  }
};
</script>

<style scoped lang="scss">
/* --- 布局核心：左右对齐 --- */
.message-wrapper {
  display: flex;
  margin-bottom: 24px;
  width: 100%;
  gap: 12px;
  padding: 0 16px;
  box-sizing: border-box;

  /* AI 消息：左对齐 */
  &.role-assistant {
    flex-direction: row; 
    .content-area { align-items: flex-start; }
    .ai-card { border-top-left-radius: 2px; }
  }

  /* 用户消息：右对齐 */
  &.role-user {
    flex-direction: row-reverse; 
    .content-area { align-items: flex-end; }
    .user-card { 
      background: #4e6ef2; /* 蓝色气泡 */
      color: #fff;
      border-top-right-radius: 2px;
    }
  }
}

/* --- 头像 --- */
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.ai-avatar { background: #8b5cf6; color: white; border: 1px solid #7c3aed; }
.user-avatar { background: #e0e7ff; border: 1px solid #c7d2fe; }

/* --- 内容容器 --- */
.content-area {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  gap: 8px;
}

/* --- 用户气泡 --- */
.user-card {
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  .user-query { margin: 0; font-size: 14px; line-height: 1.5; }
}

/* --- AI 复合卡片 --- */
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
  min-width: 300px;
}

/* 纯文本解释区域 */
.pure-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
  padding-bottom: 8px;
  border-bottom: 1px dashed #f1f5f9;
}

/* 模块匹配信息 */
.info-card {
  background: #f9fafb;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  
  .info-header { display: flex; gap: 8px; margin-bottom: 6px; align-items: center; }
  .mode-tag { background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
  .info-title { font-size: 12px; font-weight: bold; color: #475569; }
  
  .match-desc { font-size: 12px; color: #64748b; margin-bottom: 4px; }
  .highlight { color: #0f172a; font-weight: 600; }
  
  .table-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .table-tag { font-size: 11px; background: #fff; padding: 2px 6px; border: 1px solid #e2e8f0; border-radius: 4px; color: #64748b; }
}

/* SQL 卡片 */
.sql-card {
  background: #1e293b;
  color: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  
  .sql-header { display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; }
  .sql-title { font-size: 12px; font-weight: bold; color: #94a3b8; }
  .save-btn { 
    background: #334155; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;
    &:hover { background: #475569; }
  }
  
  .sql-code-scroll {
    overflow-x: auto;
    background: #0f172a;
    border-radius: 4px;
    padding: 8px;
    
    pre { margin: 0; font-family: 'Menlo', 'Monaco', monospace; font-size: 12px; color: #e2e8f0; }
  }
}

/* 结果表格卡片 */
.result-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  
  .result-header { 
    display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #f1f5f9; align-items: center;
    .result-title { font-size: 12px; font-weight: bold; color: #334155; }
    .export-btn { 
      background: #f1f5f9; border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; 
      &:hover { background: #e2e8f0; }
    }
  }
  
  .result-table-scroll {
    overflow-x: auto;
    max-height: 300px;
    
    table {
      width: 100%; border-collapse: collapse; font-size: 12px;
      th { background: #f8fafc; padding: 8px 12px; text-align: left; color: #64748b; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
      td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; white-space: nowrap; }
    }
  }

  .pagination {
    padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9;
    .page-info { font-size: 11px; color: #94a3b8; }
    .page-btn { 
      font-size: 11px; margin-left: 6px; cursor: pointer; background: #fff; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
      &:not(:disabled):hover { border-color: #cbd5e1; color: #4e6ef2; }
    }
  }
}
</style>


<!-- 
<template>
  <div v-if="data.role === 'ai'" class="ai-card">
    <div class="sql-card" v-if="data.sql">
      <div class="sql-header">
        <span class="sql-title">⚡ 生成的SQL</span>
        <button class="save-btn" @click="handleSaveAsFunction">保存为功能</button>
      </div>
      <div class="sql-code">
        <pre>{{ data.sql }}</pre>
      </div>
    </div>

    <div class="result-card" v-if="data.tableData && data.tableData.length > 0">
      <div class="result-header">
        <span class="result-title">📊 查询结果 • 共 {{ data.tableData.length }} 条</span>
        <button class="export-btn" @click="handleExport">导出</button>
      </div>
      
      <div class="result-table">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th v-for="key in Object.keys(data.tableData[0])" :key="key">{{ key }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in displayResultData" :key="index">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td v-for="(val, vIndex) in Object.values(item)" :key="vIndex">{{ val }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <div class="page-buttons">
          <button @click="handlePageChange(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
          <button @click="handlePageChange(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup lang="ts">
import { ref, reactive, computed } from 'vue';


// 新增：用户提问内容（可从外部传入/绑定输入框）
// const userQuery = ref('查询本月各品类的销量和GMV（按销量降序排列）');
// 接收父组件循环传下来的消息对象
defineProps({
  data: {
    type: Object,
    required: true
  }
})
// 模块匹配信息
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

/* 表格区 */
.table-section {
  .section-header {
    display: flex; justify-content: space-between; margin-bottom: 8px;
    .section-label { font-size: 12px; color: #94a3b8; font-weight: 500; }
  }
  .table-container {
    overflow-x: auto;
    border: 1px solid #f0f2f5;
    border-radius: 6px;
    table {
      width: 100%; border-collapse: collapse; font-size: 13px;
      th { background: #f9fafb; padding: 10px; text-align: left; color: #6b7280; border-bottom: 1px solid #f0f2f5; }
      td { padding: 10px; border-bottom: 1px solid #f9fafb; color: #1f2937; }
    }
  }
}

.page-btn {
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 11px;
}

.icon-btn {
  background: transparent; border: none; cursor: pointer; font-size: 12px; color: #64748b;
  &:hover { color: #3b82f6; }
}

.pure-text { padding: 16px; font-size: 14px; line-height: 1.6; color: #374151; }
</style> -->
