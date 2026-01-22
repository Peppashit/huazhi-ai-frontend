<script setup lang="ts">
import { ref } from 'vue'

// 模拟甲方 HTML 中的数据结构，后续这些会从后端 API 获取
interface TableInfo { name: string; desc: string }
interface Feature { id: string; name: string; desc: string; sql: string }
interface Module { id: string; name: string; tables: TableInfo[]; features: Feature[] }

const modules = ref<Module[]>([
  {
    id: 'm_sales',
    name: '销售分析模块',
    tables: [
      { name: 'orders', desc: '订单主表' },
      { name: 'products', desc: '商品维表' }
    ],
    features: [
      { id: 'f1', name: '品类销量排行', desc: '统计本月销量Top10', sql: 'SELECT...' },
      { id: 'f2', name: 'GMV区间汇总', desc: '统计指定时间GMV', sql: 'SELECT...' }
    ]
  },
  {
    id: 'm_supply',
    name: '库存与供应链模块',
    tables: [{ name: 'inventory', desc: '库存事实表' }],
    features: [{ id: 'f3', name: '库存预警', desc: '低于安全库存的SKU', sql: 'SELECT...' }]
  }
])

// 控制模块展开/折叠
const collapsedModules = ref<Set<string>>(new Set())
const toggleModule = (id: string) => {
  if (collapsedModules.value.has(id)) collapsedModules.value.delete(id)
  else collapsedModules.value.add(id)
}

// 模拟操作逻辑
const handleAction = (action: string, name: string) => {
  alert(`触发了【${action}】操作：${name}`)
}
</script>

<template>
  <div class="catalog-container">
    <div class="right-head">
      <div class="h">参考目录 / 模块库</div>
      <div class="hint-pill">模式：自动匹配</div>
    </div>

    <div class="scroll-area">
      <!-- 模块循环 -->
      <div 
        v-for="mod in modules" 
        :key="mod.id" 
        :class="['module', { collapsed: collapsedModules.has(mod.id) }]"
      >
        <div class="module-head" @click="toggleModule(mod.id)">
          <div class="left">
            <div class="caret">▾</div>
            <div class="module-title">{{ mod.name }}</div>
          </div>
        </div>

        <div class="module-body" v-show="!collapsedModules.has(mod.id)">
          <div class="sec-title">包含的表</div>
          <div class="table-item" v-for="table in mod.tables" :key="table.name">
            <div class="n">{{ table.name }}</div>
            <div class="d">{{ table.desc }}</div>
          </div>

          <div class="sec-title">功能项列表</div>
          <!-- 功能点循环 -->
          <div class="feature" v-for="f in mod.features" :key="f.id">
            <div class="feature-top">
              <div class="feature-info">
                <div class="feature-name">{{ f.name }}</div>
                <div class="feature-desc">{{ f.desc }}</div>
              </div>
              <div class="fbtns">
                <button class="btn small" @click="handleAction('编辑', f.name)">编辑</button>
                <button class="btn small outline" @click="handleAction('引用', f.name)">引用</button>
                <button class="btn small" @click="handleAction('执行', f.name)">执行</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.catalog-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.right-head {
  padding: 16px;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  .h { font-weight: 900; color: var(--text); }
  .hint-pill {
    font-size: 12px; padding: 4px 10px;
    background: var(--panel-2); border-radius: 999px; color: var(--muted);
  }
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

.module {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);

  .module-head {
    padding: 12px;
    background: linear-gradient(180deg, #fff, #fbfcff);
    cursor: pointer;
    display: flex;
    align-items: center;
    .caret { transition: transform 0.2s; margin-right: 8px; }
  }

  &.collapsed .caret { transform: rotate(-90deg); }

  .module-body {
    padding: 12px;
    .sec-title { font-size: 12px; color: var(--muted); font-weight: 900; margin: 10px 0 6px; }
  }
}

.table-item {
  background: var(--panel-2);
  padding: 8px;
  border-radius: 12px;
  margin-bottom: 6px;
  .n { font-size: 12px; font-weight: 900; }
  .d { font-size: 11px; color: var(--muted); }
}

.feature {
  border: 1px solid var(--line);
  padding: 10px;
  border-radius: 14px;
  margin-bottom: 8px;
  .feature-name { font-size: 13px; font-weight: 900; }
  .feature-desc { font-size: 12px; color: var(--muted); }
  .fbtns {
    display: flex; gap: 4px; margin-top: 8px;
    justify-content: flex-end;
  }
}

.btn.small {
  padding: 4px 8px; font-size: 11px;
  border: 1px solid var(--line); background: #fff; border-radius: 8px;
  cursor: pointer;
  &.outline { color: var(--brand); border-color: var(--brand); }
  &:hover { background: var(--panel-2); }
}
</style>