


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
      <h2 class="h">参考目录 / 模块库</h2>
      <div class="hint-pill">模式：自动匹配</div>
    </div>

    <div class="scroll-area">
      <div 
        v-for="mod in modules" 
        :key="mod.id" 
        :class="['module', { collapsed: collapsedModules.has(mod.id) }]"
      >
        <div class="module-head" @click="toggleModule(mod.id)">
          <div class="left">
            <div class="caret">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" viewBox="0 0 30 30" fill="none"><circle  cx="45" cy="15" transform="rotate(90 30 0)" r="15"    fill="#FFFFFF" ></circle><path fill-rule="evenodd"  fill="rgba(166, 166, 166, 1)" style="mix-blend-mode:normal" d="M0 15C0 23.2843 6.71573 30 15 30C23.2843 30 30 23.2843 30 15C30 6.71573 23.2843 4.1122e-16 15 9.18485e-16C6.71573 1.42575e-15 0 6.71573 0 15ZM29 15C29 22.732 22.732 29 15 29C7.26801 29 1 22.732 1 15C1 7.26801 7.26801 1 15 1C22.732 1 29 7.26801 29 15Z"></path><path d="M15 20L10.6699 12.5L19.3301 12.5L15 20Z"   fill="#603CFF" ></path></svg>
            </div>
            <h3 class="module-title">{{ mod.name }}</h3>
          </div>
        </div>

        <div class="module-body" v-show="!collapsedModules.has(mod.id)">
          <div class="sec-title">包含的表</div>
          <div class="table-item" v-for="table in mod.tables" :key="table.name">
            <div class="n">{{ table.name }}</div>
            <div class="d">{{ table.desc }}</div>
          </div>

          <div class="sec-title">功能项列表</div>
          <div class="feature" v-for="f in mod.features" :key="f.id">
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
</template>

<style scoped lang="scss"> 
/* 引入全局变量，确保变量可用 */
@use "@/styles/variables" as *;

.catalog-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--panel);
  padding: 24px 10px;
  border-radius: var(--radius-lg);
}

.right-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px; /* 拉大标题与内容的距离 */

  .h {
    margin: 0;
    font-size: var(--fs-h2);  /* 20px */
    font-weight: var(--fw-black);
    color: var(--text-main);
    padding-left: 10px;
  }

  .hint-pill {
    background: var(--panel-2);
    color: var(--muted);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: var(--fs-small);
  }
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px; /* 模块之间的间距 */
  padding-right: 15px;
  

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--line); border-radius: 10px; }
}

.module {
    margin-right: -10px;
  background: var(--bg); /* #F4F7FE */
  border-radius: var(--radius-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .module-head {
    display: flex;
    align-items: center;
    padding: 12px 10px; /* 压缩 Item 宽度 */
    cursor: pointer;

    .left {
      display: flex;
      align-items: center;
      gap: 10px;

 

      .module-title {
        margin: 0;
        font-size: var(--fs-base); /* 16px */
        font-weight: var(--fw-bold); /* 700 */
        color: var(--text-main);
      }
    }
  }

  /* 展开状态：图标旋转 */
  &:not(.collapsed) .module-head .caret {
    transform: rotate(180deg);
  }

  .module-body {
    padding: 0 16px 16px;
    
    .sec-title {
      font-size: var(--fs-tiny); /* 11px */
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--muted-2);
      margin: 14px 0 8px;
    }

    .table-item {
      background: var(--panel); /* 纯白内容块 */
      border: 1px solid rgba(232, 236, 255, 0.5);
      margin-bottom: 8px;
      padding: 10px 14px; /* 减少 padding */
      border-radius: var(--radius-md);

      .n { font-size: var(--fs-base); font-weight: var(--fw-semibold); color: var(--text); }
      .d { font-size: var(--fs-small); color: var(--muted); margin-top: 2px; }
    }

    .feature {
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(8px);
      border: 1px solid var(--panel);
      padding: 12px 14px;
      border-radius: var(--radius-md);
      margin-bottom: 8px;

      .feature-name { font-size: var(--fs-base); font-weight: var(--fw-bold); color: var(--text); }
      .feature-desc { font-size: var(--fs-small); color: var(--muted); margin-bottom: 10px; }

      .fbtns {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
        
        .btn {
          padding: 5px 12px;
          border-radius: 8px;
          border: none;
          font-size: var(--fs-tiny);
          font-weight: var(--fw-bold);
          cursor: pointer;
          transition: all 0.2s;

          &.small { background: var(--panel-2); color: var(--text); }
          &.outline { 
            background: transparent; 
            border: 1.2px solid var(--brand); 
            color: var(--brand); 
          }
          
          &:hover { transform: translateY(-1px); filter: brightness(0.95); }
        }
      }
    }
  }
}
</style>