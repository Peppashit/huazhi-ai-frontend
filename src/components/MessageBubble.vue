<script setup lang="ts">
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()

const props = defineProps<{
  role: 'user' | 'assistant';
  text?: string;   // 中间件返回的 text (含解释和表格)
  sql?: string;
  chartData?: any;
}>()

// 渲染 Markdown
const renderMarkdown = (content: string) => {
  return md.render(content)
}
</script>

<template>
  <div :class="['message-row', role]">
    <div class="message-content">
      <!-- 用户消息 -->
      <div v-if="role === 'user'" class="text-bubble">{{ text }}</div>

      <!-- AI 消息 -->
      <template v-else>
        <!-- SQL 代码块 -->
        <div v-if="sql" class="sql-card">
          <div class="card-header">🧩 执行的 SQL</div>
          <pre><code>{{ sql }}</code></pre>
        </div>

        <!-- Markdown 渲染内容 (包含 AI 解释和 HTML 表格) -->
        <div v-if="text" class="markdown-body" v-html="renderMarkdown(text)"></div>

        <!-- 如果有图表数据，这里预留图表组件 -->
        <div v-if="chartData && chartData.series?.length > 0" class="chart-placeholder">
          📈 这里将渲染折线图 (已获得数据)
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
/* 需要为生成的表格添加样式 */
.markdown-body {
  background: #fff;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid var(--line);
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    th, td {
      border: 1px solid var(--line);
      padding: 8px;
      font-size: 13px;
    }
    th { background: var(--panel-2); }
  }
}
</style>