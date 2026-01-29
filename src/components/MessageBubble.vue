
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
  { name: 'orders', desc: '订单主表：订单时间、用户、状态、总金额等' },
  { name: 'order_items', desc: '订单明细：SKU、数量、单价、折扣等' },
  { name: 'products', desc: '商品维表：商品名、品类ID、品牌等' },
  { name: 'categories', desc: '品类维表：品类层级与名称' }
]);

// 生成的SQL
const generatedSQL = ref(`SELECT
  c.category_name AS category,
  SUM(oi.quantity) AS sales_qty,
  SUM(oi.quantity * oi.unit_price) AS gmv
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN categories c ON c.id = p.category_id
WHERE o.order_date >= DATE_TRUNC('month', CURRENT_DATE)
  AND o.order_date < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')
  AND o.status = 'paid'
GROUP BY c.category_name
ORDER BY sales_qty DESC
LIMIT 10;
`);

// 查询结果数据
const resultData = reactive([
  { category: '手机数码', sales_qty: 18240, gmv: 14329800 },
  { category: '家用电器', sales_qty: 15870, gmv: 13100420 },
  { category: '美妆个护', sales_qty: 14920, gmv: 6321800 },
  { category: '食品饮料', sales_qty: 13610, gmv: 2984000 },
  { category: '母婴玩具', sales_qty: 12990, gmv: 5129000 },
  { category: '服饰鞋包', sales_qty: 11860, gmv: 4387000 },
  { category: '家居家装', sales_qty: 10710, gmv: 3892000 },
  { category: '运动户外', sales_qty: 9650, gmv: 3625000 },
  { category: '图书文娱', sales_qty: 8880, gmv: 1244000 },
  { category: '宠物生活', sales_qty: 8210, gmv: 1103000 },
  { category: '汽车用品', sales_qty: 7890, gmv: 2890000 },
  { category: '生鲜蔬果', sales_qty: 7560, gmv: 987000 },
  { category: '酒水饮料', sales_qty: 7230, gmv: 1890000 },
  { category: '钟表首饰', sales_qty: 6900, gmv: 5678000 },
  { category: '箱包配饰', sales_qty: 6570, gmv: 1234000 }
]);

// 修复分页逻辑：新增分页参数 + 动态计算
const pageSize = ref(10); // 每页显示10条
const currentPage = ref(1);
// 动态计算总页数
const totalPages = computed(() => Math.ceil(resultData.length / pageSize.value));
// 分页后展示的数据
const displayResultData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return resultData.slice(start, end);
});

// 保存为功能
const handleSaveAsFunction = () => {
  if (typeof window.onSaveAsFunction === 'function') {
    window.onSaveAsFunction({
      sql: generatedSQL.value,
      mode: 'auto',
      tables: matchedTables
    });
  }
};

// 导出结果
const handleExport = () => {
  if (typeof window.onExportResult === 'function') {
    window.onExportResult({
      data: resultData,
      type: 'excel'
    });
  }
};

// 分页切换（增加边界校验）
const handlePageChange = (page) => {
  const targetPage = Math.max(1, Math.min(page, totalPages.value));
  currentPage.value = targetPage;
  if (typeof window.onPageChange === 'function') {
    window.onPageChange(targetPage);
  }
};
</script>

<style scoped>
/* 整体聊天容器：区分用户/AI 卡片间距 */
.chat-container {
  display: flex;
  margin-bottom: 24px;
  width: 100%;
  padding: 8px;
}

/* 1. 用户卡片：视觉区分（浅蓝底色 + 左对齐） */
.user-card {
  background: #ced7f8;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.user-header {
  margin-bottom: 8px;
}

.user-tag {
  font-size: 12px;
  font-weight: 500;
  color: #0ea5e9;
}

.user-content {
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
}

.user-query {
  margin: 0;
  word-break: break-all;
}

/* 2. AI 卡片：视觉区分（白色底色 + 左对齐，与用户卡片形成对比） */
.ai-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ai-header {
  margin-bottom: 8px;
}

.ai-tag {
  font-size: 12px;
  font-weight: 500;
  color: #8b5cf6;
}

/* 原模块匹配信息卡片样式（复用+微调） */
.info-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.mode-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.message-content { max-width: 85%; }

.info-title {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.info-content {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.match-desc .highlight {
  color: #1f2937;
  font-weight: 500;
}

/* --- AI 一体化大对话框核心样式 --- */
.assistant-unified-card {
  background: #ffffff;
  border: 1px solid #eef0f5;
  border-radius: 0 16px 16px 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  overflow: hidden; /* 确保内部部分不会超出圆角 */
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 8px 0;
}

.table-tag {
  padding: 6px 10px;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 11px;
}

.flow-desc {
  margin-top: 8px;
  font-size: 11px;
  color: #9ca3af;
}

/* 原SQL代码块样式（复用） */
.sql-card {
  background: #1f2937;
  border-radius: 12px;
  padding: 12px;
  color: #f9fafb;
}

.sql-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sql-title {
  font-size: 13px;
  font-weight: 500;
}

.save-btn {
  padding: 4px 10px;
  background: #374151;
  border: none;
  border-radius: 6px;
  color: #f9fafb;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #4b5563;
}

.sql-code-scroll {
  max-height: 200px;
  overflow-y: auto;
  border-radius: 8px;
}

.sql-code-scroll::-webkit-scrollbar {
  width: 6px;
}
.sql-code-scroll::-webkit-scrollbar-track {
  background: #27272a;
  border-radius: 3px;
}
.sql-code-scroll::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}
.sql-code-scroll::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.sql-code pre {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px;
  line-height: 1.6;
  color: #d1d5db;
  padding: 8px;
  margin: 0;
}

/* 空值提示样式 */
.empty-tip {
  color: #9ca3af;
  text-align: center;
}

/* 原查询结果表格样式（复用+新增空单元格样式） */
.result-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-title {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.export-btn {
  padding: 4px 10px;
  background: #e5e7eb;
  border: none;
  border-radius: 6px;
  color: #1f2937;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;
}

.export-btn:hover {
  background: #d1d5db;
}

.result-table-scroll {
  max-height: 250px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
}

.result-table-scroll::-webkit-scrollbar {
  width: 6px;
}
.result-table-scroll::-webkit-scrollbar-track {
  background: #f9fafb;
  border-radius: 3px;
}
.result-table-scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
.result-table-scroll::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.result-table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.result-table th,
.result-table td {
  padding: 8px 10px;
  text-align: left;
  font-size: 12px;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap;
}

/* 空单元格样式 */
.empty-cell {
  text-align: center;
  color: #9ca3af;
  padding: 20px 0;
}

.result-table th {
  background: #f9fafb;
  font-weight: 500;
  color: #6b7280;
  position: sticky;
  top: 0;
  z-index: 10;
}
.explanation-text { font-size: 14px; color: #4b5563; line-height: 1.6; }
.table-tags {
  display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;
  .table-tag { font-size: 11px; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; color: #6b7280; }
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 11px;
  color: #6b7280;
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
</style>