<template>
  <!-- 新增：外层椭圆容器（带阴影） -->
  <div class="seg-outer-container" :style="outerContainerStyle">
    <!-- 原有的分段选择器容器 -->
    <div class="segmented-container" :style="containerStyle">
      <button
        v-for="(item, index) in options"
        :key="item.key"
        class="seg-btn"
        :class="{ active: activeKey === item.key }"
        @click="handleBtnClick(item.key)"
        :style="btnStyle"
      >
        <span v-if="item.icon" class="seg-icon">{{ item.icon }}</span>
        <span class="seg-text">{{ item.label }}</span>
      </button>
      <div
        class="seg-bg"
        :style="{
          left: bgLeft,
          width: bgWidth,
          transition: `left ${duration}ms ease`
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
const outerContainerStyle = {}; 

// 定义组件 Props，提供灵活的配置能力
const props = defineProps({
  // 选项列表，必传，格式：[{ key: 'xxx', label: 'xxx', icon: 'xxx' }]
  options: {
    type: Array,
    required: true,
    validator: (val) => {
      // 校验选项格式，确保每个选项都有 key 和 label
      return val.every(item => item.key && item.label);
    }
  },
  // 默认选中的 key
  modelValue: {
    type: String,
    default: ''
  },
  // 椭圆背景颜色
  bgColor: {
    type: String,
    default: '#5a7bff'
  },
  // 未选中文字颜色
  textColor: {
    type: String,
    default: '#666'
  },
  // 选中文字颜色
  activeTextColor: {
    type: String,
    default: '#fff'
  },
  // 容器背景色
  containerBg: {
    type: String,
    default: '#f5f5f5'
  },
  // 动画时长（毫秒）
  duration: {
    type: Number,
    default: 300
  },
  // 按钮内边距，控制组件大小
  padding: {
    type: String,
    default: '8px 20px'
  }
});

// 定义事件，实现 v-model 双向绑定（预留接口核心）
const emit = defineEmits(['update:modelValue', 'change']);

// 当前激活的 key
const activeKey = computed({
  get() {
    // 如果默认值不在选项中，取第一个选项的 key
    return props.options.some(item => item.key === props.modelValue) 
      ? props.modelValue 
      : props.options[0]?.key || '';
  },
  set(val) {
    emit('update:modelValue', val);
    emit('change', val); // 触发自定义 change 事件，供外部监听
  }
});

// 计算椭圆背景的宽度（平分容器宽度）
const bgWidth = computed(() => {
  return `calc(${100 / props.options.length}% - 8px)`;
});

// 计算椭圆背景的左侧偏移量
const bgLeft = computed(() => {
  const activeIndex = props.options.findIndex(item => item.key === activeKey.value);
  return `calc(${activeIndex * (100 / props.options.length)}% + 4px)`;
});

// 容器样式（整合自定义样式）
const containerStyle = computed(() => ({
  backgroundColor: props.containerBg,
}));

// 按钮样式（整合自定义样式）
const btnStyle = computed(() => ({
  color: props.textColor,
  padding: props.padding,
}));

// 按钮点击事件处理
const handleBtnClick = (key) => {
  activeKey.value = key;
};

// 监听激活状态变化（可选，用于内部逻辑）
watch(activeKey, (newVal) => {
  console.log('分段选择器选中项变更：', newVal);
});
</script>

<style scoped>
/* 新增：外层椭圆容器样式 */
.seg-outer-container {
  display: inline-block;
  border-radius: 999px; /* 外层椭圆圆角 */
  padding: 1px; /* 预留阴影空间 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* 柔和阴影效果 */
  background: #fff; /* 外层背景色，与页面背景融合 */
}

/* 容器样式：椭圆外层容器 */
.segmented-container {
  position: relative;
  display: inline-flex;
  border-radius: 999px; /* 椭圆圆角，数值足够大就是椭圆 */
  padding: 4px; /* 容器内边距，给背景椭圆留空间 */
  overflow: hidden; /* 隐藏超出容器的内容 */
  box-sizing: border-box;
}

/* 按钮样式：基础未选中状态 */
.seg-btn {
  position: relative; /* 用于层级控制 */
  z-index: 1; /* 保证按钮在背景椭圆上方 */
  display: inline-flex;
  align-items: center;
  gap: 6px; /* 图标和文字的间距 */
  border: none; /* 去掉默认边框 */
  background: transparent; /* 透明背景 */
  font-size: 14px;
  cursor: pointer; /* 鼠标悬浮手型 */
  transition: color 0.3s ease; /* 文字颜色过渡动画 */
  white-space: nowrap; /* 防止文字换行 */
  box-sizing: border-box;
}

/* 按钮激活状态：文字颜色变化 */
.seg-btn.active {
  color: v-bind(activeTextColor) !important; /* 绑定选中文字颜色 */
  font-weight: 500; /* 选中时文字加粗（可选） */
}

/* 图标样式（可选） */
.seg-icon {
  font-size: 12px;
}

/* 文字样式（可选） */
.seg-text {
  line-height: 1;
}

/* 椭圆背景样式：动态位移的核心元素 */
.seg-bg {
  position: absolute;
  top: 4px; /* 和容器内边距对应 */
  height: calc(100% - 8px); /* 减去上下内边距，保证背景椭圆不超出容器 */
  background: v-bind(bgColor); /* 绑定背景颜色 */
  border-radius: 999px; /* 椭圆圆角 */
  box-sizing: border-box;
}
</style>