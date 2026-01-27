<template>
  <div class="response-card">
    <!-- 1. 模块匹配信息卡片（无需滚动） -->
    <div class="info-card">
      <div class="info-header">
        <span class="mode-tag primary">自动模块匹配</span>
        <span class="info-title">已自动匹配模块（表集合）</span>
      </div>
      <div class="info-content">
        <p class="match-desc">匹配模块：<span class="highlight">销售分析模块</span></p>
        <p class="table-desc">本次使用的表（示例）：</p>
        <div class="table-tags">
          <span class="table-tag" v-for="table in matchedTables" :key="table.name">
            {{ table.name }} • {{ table.desc }}
          </span>
        </div>
        <p class="flow-desc">
          生成NL2SQL流程：先匹配模块 → 将该模块内表信息作为提示词上下文 → 在此上下文基础上生成SQL与结果展示
        </p>
      </div>
    </div>

    <!-- 2. 生成的SQL代码块（添加滚动） -->
    <div class="sql-card">
      <div class="sql-header">
        <span class="sql-title">⚡ 生成的SQL</span>
        <button class="save-btn" @click="handleSaveAsFunction">保存为功能</button>
      </div>
      <!-- 核心修改：添加滚动容器 -->
      <div class="sql-code-scroll">
        <div class="sql-code">
          <pre>{{ generatedSQL }}</pre>
        </div>
      </div>
    </div>

    <!-- 3. 查询结果表格（添加滚动） -->
    <div class="result-card">
      <div class="result-header">
        <span class="result-title">📊 查询结果 (Mock) • 共 {{ resultData.length }} 条（演示）</span>
        <button class="export-btn" @click="handleExport">导出</button>
      </div>
      <!-- 核心修改：添加表格滚动容器 -->
      <div class="result-table-scroll">
        <div class="result-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>品类</th>
                <th>销量</th>
                <th>GMV</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in resultData" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.category }}</td>
                <td>{{ item.sales_qty.toLocaleString() }}</td>
                <td>{{ item.gmv.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="pagination">
        <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <div class="page-buttons">
          <button class="page-btn" :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">上一页</button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="handlePageChange(currentPage + 1)">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

// 1. 模块匹配信息（可从后端接口获取）
const matchedTables = reactive([
  { name: 'orders', desc: '订单主表：订单时间、用户、状态、总金额等' },
  { name: 'order_items', desc: '订单明细：SKU、数量、单价、折扣等' },
  { name: 'products', desc: '商品维表：商品名、品类ID、品牌等' },
  { name: 'categories', desc: '品类维表：品类层级与名称' }
]);

// 2. 生成的SQL（模拟长文本，测试滚动）
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

// 3. 查询结果数据（模拟更多数据，测试滚动）
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

// 4. 分页信息
const currentPage = ref(1);
const totalPages = ref(2); // 模拟多页

// 🚪 预留接口：保存为功能
const handleSaveAsFunction = () => {
  if (window.onSaveAsFunction) {
    window.onSaveAsFunction({
      sql: generatedSQL.value,
      mode: 'auto',
      tables: matchedTables
    });
  }
};

// 🚪 预留接口：导出结果
const handleExport = () => {
  if (window.onExportResult) {
    window.onExportResult({
      data: resultData,
      type: 'excel' // 可支持 excel/csv 等格式
    });
  }
};

// 🚪 预留接口：分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
  if (window.onPageChange) {
    window.onPageChange(page);
  }
};
</script>

<style scoped>
.response-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: auto;
}

/* 1. 模块匹配信息卡片 */
.info-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mode-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.mode-tag.primary {
  background: #e0f2fe;
  color: #0ea5e9;
}

.info-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.info-content {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.match-desc .highlight {
  color: #1f2937;
  font-weight: 500;
}

.table-tags {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 8px 0;
}

.table-tag {
  padding: 6px 10px;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 12px;
}

.flow-desc {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}

/* 2. 生成的SQL代码块（核心：滚动样式） */
.sql-card {
  background: #1f2937;
  border-radius: 16px;
  padding: 16px;
  color: #f9fafb;
}

.sql-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sql-title {
  font-size: 14px;
  font-weight: 500;
}

.save-btn {
  padding: 4px 12px;
  background: #374151;
  border: none;
  border-radius: 6px;
  color: #f9fafb;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #4b5563;
}

/* SQL滚动容器：限制最大高度，超出滚动 */
.sql-code-scroll {
  max-height: 200px; /* 可根据需求调整 */
  overflow-y: auto;
  border-radius: 8px;
}

/* 美化滚动条 */
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
  font-size: 12px;
  line-height: 1.6;
  color: #d1d5db;
  padding: 8px;
  margin: 0;
}

/* 3. 查询结果表格（核心：滚动样式） */
.result-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.export-btn {
  padding: 4px 12px;
  background: #e5e7eb;
  border: none;
  border-radius: 6px;
  color: #1f2937;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.export-btn:hover {
  background: #d1d5db;
}

/* 表格滚动容器：限制最大高度，超出滚动 */
.result-table-scroll {
  max-height: 250px; /* 可根据需求调整 */
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
}

/* 美化表格滚动条 */
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
  padding: 10px 12px;
  text-align: left;
  font-size: 13px;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap; /* 防止表格单元格内容换行 */
}

.result-table th {
  background: #f9fafb;
  font-weight: 500;
  color: #6b7280;
  position: sticky; /* 表头固定，滚动时不消失 */
  top: 0;
  z-index: 10;
}

.result-table td {
  color: #1f2937;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
}

.page-buttons {
  display: flex;
  gap: 8px;
}

.page-btn {
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;

}
</style>