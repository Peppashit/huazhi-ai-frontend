<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';

// 1. 定义要传给父组件的方法
const emit = defineEmits(['send-text', 'scroll-to-bottom', 'mode-change']);

// 2. 基础变量定义
const inputValue = ref('');
const showPopover = ref(false);
const isLoading = ref(false); // 现在由 App.vue 控制，这里设为 false
const isSupported = ref(true);
const isListening = ref(false);
const listeningTip = ref('语音输入 🎤');
const autoCallLLM = ref(false);
const props = defineProps({
  disabled: Boolean
});
const modes = reactive([
  { value: 'auto', label: '自动模块匹配', icon: 'A', desc: '系统自动判定最合适的模块。' },
  { value: 'manual', label: '手动模块选择', icon: 'M', desc: '手动选择特定模块。' }
]);
const currentMode = ref(modes[0]);

// 3. 核心发送逻辑 (唯一且干净的 handleSendText)
const handleSendText = () => {
  const text = inputValue.value.trim();
  if (!text) return;

  // 将数据传给父组件 App.vue 处理
  emit('send-text', {
    content: text,
    mode: currentMode.value.value
  });

  // 发送后清空输入框
  inputValue.value = '';
  
  // 触发滚动
  nextTick(() => {
    emit('scroll-to-bottom');
  });
};

// 4. 模式切换逻辑
const togglePopover = () => {
  showPopover.value = !showPopover.value;
};

const handleModeSelect = (value: string) => {
  const mode = modes.find(m => m.value === value);
  if (mode) {
    currentMode.value = mode;
    emit('mode-change', value);
  }
  showPopover.value = false;
};

// 5. 语音识别逻辑
const initSpeechRecognition = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    isSupported.value = false;
    listeningTip.value = '浏览器不支持 🚫';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const recognizedText = event.results[0][0].transcript;
    inputValue.value = recognizedText;
    
    // 识别完成后，如果开启了自动调用，直接触发发送
    if (autoCallLLM.value) {
      handleSendText();
    }
  };

  recognition.onstart = () => { isListening.value = true; listeningTip.value = '正在识别 🎧'; };
  recognition.onend = () => { isListening.value = false; listeningTip.value = '语音输入 🎤'; };
  
  return recognition;
};

let recognitionInstance: any = null;

const toggleSpeechRecognition = () => {
  if (!recognitionInstance) recognitionInstance = initSpeechRecognition();
  if (!recognitionInstance) return;

  if (isListening.value) {
    recognitionInstance.stop();
  } else {
    recognitionInstance.start();
  }
};

// 6. 回到底部
const handleScrollToBottom = () => {
  emit('scroll-to-bottom');
};

// 7. 生命周期钩子
onMounted(() => {
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.plus-btn') && !target.closest('.popover')) {
      showPopover.value = false;
    }
  });
});
</script>

<template>
  <div class="input-dialog-container">
    <!-- 模式切换按钮 -->
    <button class="plus-btn" @click="togglePopover" title="切换模式">
      +
    </button>

    <div class="input-container">
      <!-- 弹出菜单 -->
      <div v-if="showPopover" class="popover">
        <div v-for="mode in modes" :key="mode.value" class="pop-item" @click="handleModeSelect(mode.value)">
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
        placeholder="输入自然语言需求..."
        rows="1"

        @keyup.enter.exact.prevent="handleSendText"
      />

      <div class="mode-tag">
        <span class="tag-pill primary">{{ currentMode.label }}</span>
      </div>
    </div>

    <!-- 发送按钮 -->
    <button 
      class="send-text-btn" 
      @click="handleSendText" 
      :disabled="!inputValue.trim()|| props.disabled"
    >
      发送 👉
    </button>

    <!-- 语音按钮 -->
    <button 
      class="send-voice-btn" 
      @click="toggleSpeechRecognition" 
      :class="{ listening: isListening }"
      :disabled="!isSupported"
    >
      {{ listeningTip }}
    </button>

    <button class="scroll-bottom-btn" @click="handleScrollToBottom">
      ↓
    </button>
  </div>
</template>

<style scoped>
/* 样式无修改，保留原有样式 */
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
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
}
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
.send-text-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
.send-voice-btn.listening {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.send-voice-btn:hover:not(:disabled) {
  opacity: 0.9;
}
.send-voice-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #e5e7eb;
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
.scroll-bottom-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>