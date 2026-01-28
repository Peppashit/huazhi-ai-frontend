<template>
  <div :class="['message-wrapper', data.role === 'user' ? 'user-style' : 'assistant-style']">
    <!-- 头像 -->
    <div class="avatar">
      {{ data.role === 'user' ? '👤' : '🤖' }}
    </div>

    <!-- 消息内容 -->
    <div class="message-content">
      
      <!-- 用户消息：保持简洁气泡 -->
      <div v-if="data.role === 'user'" class="user-bubble">
        {{ data.content }}
      </div>

      <!-- AI 消息：一体化大对话框 -->
      <div v-else class="assistant-unified-card">
        
        <!-- 1. 顶部：模块匹配/文字解释 -->
        <div class="card-section info-section" v-if="data.explanation">
          <div class="info-header">
            <span class="mode-tag primary">自动匹配</span>
            <span class="section-title">逻辑分析</span>
          </div>
          <div class="explanation-text">{{ data.explanation }}</div>
          
          <!-- 表名的小标签 -->
          <div class="table-tags" v-if="matchedTables.length">
            <span class="table-tag" v-for="table in matchedTables" :key="table.name">
              {{ table.name }}
            </span>
          </div>
        </div>

        <!-- 2. 中间：SQL 代码块 (嵌入式) -->
        <div class="card-section sql-section" v-if="data.sql">
          <div class="section-header">
            <span class="section-label">⚡ 生成的查询语句</span>
            <button class="icon-btn" @click="handleSaveAsFunction" title="保存">💾</button>
          </div>
          <div class="sql-code-wrapper">
            <pre><code>{{ data.sql }}</code></pre>
          </div>
        </div>

        <!-- 3. 底部：数据表格 -->
        <div class="card-section table-section" v-if="data.tableData && data.tableData.length">
          <div class="section-header">
            <span class="section-label">📊 数据预览</span>
            <button class="icon-btn" @click="handleExport">导出</button>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th v-for="(val, key) in data.tableData[0]" :key="key">{{ key }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in data.tableData" :key="index">
                  <td v-for="(val, key) in row" :key="key">
                    {{ val.toLocaleString?.() || val }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- 分页 -->
          <div class="pagination-mini">
            <span>第 {{ currentPage }}/{{ totalPages }} 页</span>
            <div class="btns">
              <button @click="currentPage--" :disabled="currentPage===1">＜</button>
              <button @click="currentPage++" :disabled="currentPage===totalPages">＞</button>
            </div>
          </div>
        </div>

        <!-- 如果只是普通纯文本回复 -->
        <div v-if="data.content && !data.sql" class="pure-text">
          {{ data.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const props = defineProps({
  data: { type: Object, required: true }
});

const matchedTables = reactive(props.data.matchedTables || []);
const currentPage = ref(1);
const totalPages = ref(1);

const handleSaveAsFunction = () => console.log('Save SQL');
const handleExport = () => console.log('Export Data');
</script>

<style scoped lang="scss">
.message-wrapper {
  display: flex;
  margin-bottom: 24px;
  width: 100%;
  gap: 12px;
}

.assistant-style { flex-direction: row; }
.user-style { flex-direction: row-reverse; }

.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.message-content { max-width: 85%; }

/* 用户气泡 */
.user-bubble {
  background: #3b82f6;
  color: #fff;
  padding: 10px 16px;
  border-radius: 16px 0 16px 16px;
  font-size: 14px;
}

/* --- AI 一体化大对话框核心样式 --- */
.assistant-unified-card {
  background: #ffffff;
  border: 1px solid #eef0f5;
  border-radius: 0 16px 16px 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  overflow: hidden; // 确保内部部分不会超出圆角
  display: flex;
  flex-direction: column;
}

.card-section {
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
  
  &:last-child {
    border-bottom: none;
  }
}

/* 顶部信息区 */
.info-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
  .mode-tag {
    font-size: 11px; padding: 2px 8px; border-radius: 4px;
    background: #e0f2fe; color: #0ea5e9;
  }
  .section-title { font-size: 13px; font-weight: 600; color: #374151; }
}
.explanation-text { font-size: 14px; color: #4b5563; line-height: 1.6; }
.table-tags {
  display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;
  .table-tag { font-size: 11px; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; color: #6b7280; }
}

/* SQL 区 (深色嵌入) */
.sql-section {
  background: #f8fafc; // 给SQL区一个很浅的底色作为区分
  .section-header {
    display: flex; justify-content: space-between; margin-bottom: 8px;
    .section-label { font-size: 12px; color: #94a3b8; font-weight: 500; }
  }
  .sql-code-wrapper {
    background: #1e293b;
    border-radius: 8px;
    padding: 12px;
    pre { margin: 0; overflow-x: auto; }
    code { font-family: monospace; color: #38bdf8; font-size: 12px; line-height: 1.5; }
  }
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

.pagination-mini {
  display: flex; justify-content: flex-end; align-items: center; gap: 10px;
  margin-top: 10px; font-size: 11px; color: #9ca3af;
  button { border: 1px solid #eee; background: #fff; border-radius: 4px; cursor: pointer; }
}

.icon-btn {
  background: transparent; border: none; cursor: pointer; font-size: 12px; color: #64748b;
  &:hover { color: #3b82f6; }
}

.pure-text { padding: 16px; font-size: 14px; line-height: 1.6; color: #374151; }
</style>