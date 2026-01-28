<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue';

// 输入框内容
const inputValue = ref('');
// 聊天列表容器引用
const chatListRef = ref<HTMLDivElement | null>(null);
// 下拉菜单显示状态
const showPopover = ref(false);

// 模式选项配置
const modes = reactive([
  {
    value: 'auto',
    label: '自动模块匹配',
    icon: 'A',
    desc: '系统自动判定最合适的模块（表集合）。'
  },
  {
    value: 'manual',
    label: '手动模块选择',
    icon: 'M',
    desc: '显式选择一个或多个模块，直接跳过自动匹配。'
  }
]);

// 当前选中的模式
const currentMode = ref(modes[0]);

// 切换下拉菜单显示/隐藏
const togglePopover = () => {
  showPopover.value = !showPopover.value;
};

// 选择模式
const handleModeSelect = (value) => {
  const mode = modes.find(m => m.value === value);
  if (mode) {
    currentMode.value = mode;
    // 预留接口：模式切换回调
    if (window.onModeChange) {
      window.onModeChange(value);
    }
  }
  showPopover.value = false;
};

// 发送文本
const handleSendText = () => {
  if (!inputValue.value.trim()) return;
  // 预留接口：发送文本回调
  if (window.onSendText) {
    window.onSendText({
      content: inputValue.value,
      mode: currentMode.value.value
    });
  }
  inputValue.value = '';
};

// 滚动到底部
const handleScrollToBottom = () => {
  if (chatListRef.value) {
    // 瞬间滚动到底部（推荐）
    chatListRef.value.scrollTop = chatListRef.value.scrollHeight;
    // 可选：平滑滚动（取消注释启用）
    // chatListRef.value.scrollTo({
    //   top: chatListRef.value.scrollHeight,
    //   behavior: 'smooth'
    // });
  } else {
    // 兼容body滚动场景
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }
};

// 监听点击外部关闭下拉菜单
onMounted(() => {
  document.addEventListener('click', (e) => {
    const plusBtn = document.querySelector('.plus-btn');
    const popover = document.querySelector('.popover');
    if (plusBtn && popover && !plusBtn.contains(e.target) && !popover.contains(e.target)) {
      showPopover.value = false;
    }
  });
});
</script>

<template>
  <div class="input-dialog-container">
    <!-- 左侧加号按钮 -->
    <button 
      class="plus-btn" 
      @click="togglePopover"
      title="切换模块匹配模式"
    >
      +
    </button>

    <!-- 输入框容器（包含输入框和模式标签） -->
    <div class="input-container">
      <!-- 下拉菜单（模式选择） -->
      <div 
        v-if="showPopover" 
        class="popover"
        @click.outside="showPopover = false"
      >
        <div 
          v-for="mode in modes" 
          :key="mode.value"
          class="pop-item"
          @click="handleModeSelect(mode.value)"
        >
          <div class="ic">{{ mode.icon }}</div>
          <div>
            <div class="h">{{ mode.label }}</div>
            <div class="d">{{ mode.desc }}</div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
        <textarea 
          v-model="inputValue"
          class="input-textarea"
          placeholder="输入自然语言需求"
          rows="1"
        />

      <!-- 模式标签（嵌入在输入容器内） -->
      <div class="mode-tag">
        <span class="tag-pill primary">
          {{ currentMode.label }}
        </span>
      </div>
    </div>

    <!-- 发送按钮 -->
    <button class="send-text-btn" @click="handleSendText">
      发送 👉
    </button>

    <!-- 按住对话按钮 -->
    <button class="send-voice-btn">
      录音 🎤
    </button>

    <!-- 右上角底部跳转箭头 -->
    <button 
      class="scroll-bottom-btn"
      @click="handleScrollToBottom"
      title="回到底部"
    >
      ↓
    </button>
  </div>
</template>

<style scoped>
.input-dialog-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: relative;
}

/* 输入框容器：带圆角和浅背景色 */
.input-container {
  flex: 1;
  position: relative;
  background: #f9fafb;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 输入框：去掉边框，背景透明 */
.input-textarea {
  width: 100%;
  border: none;
  background: transparent;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  min-height: 46px;
  outline: none;
  box-sizing: border-box; 
}

/* 模式标签：居左对齐 */
.mode-tag {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.plus-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
}

.plus-btn:hover {
  background: #f9fafb;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.popover {
  position: absolute;
  top: -140px;
  left: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 100;
  min-width: 240px;
}

.pop-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.pop-item:hover {
  background: #f9fafb;
}

.ic {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
}

.h {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.d {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.input-textarea {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  min-height: 46px;
  margin-bottom: 8px;
}

.tags-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-pill {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tag-pill.primary {
  background: #e0f2fe;
  color: #0ea5e9;
}

.send-text-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.3s;
}

.send-text-btn:hover {
  background: #f9fafb;
}

.send-voice-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.send-voice-btn:hover {
  opacity: 0.9;
}

.scroll-bottom-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  background: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.scroll-bottom-btn:hover {
  background: #f9fafb;

}
</style>