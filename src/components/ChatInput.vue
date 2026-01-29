<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';

// 1. 定义要传给父组件的方法
const emit = defineEmits(['send-text', 'scroll-to-bottom', 'mode-change']);

// 2. 基础变量定义
const inputValue = ref('');
const emit = defineEmits(['send']);
const chatListRef = ref<HTMLDivElement | null>(null);
const showPopover = ref(false);
const isLoading = ref(false); // 现在由 App.vue 控制，这里设为 false
const isSupported = ref(true);
const isListening = ref(false);
const listeningTip = ref('语音输入 🎤');
const autoCallLLM = ref(true);
// Web Speech API 相关变量
const isListening = ref(false);
const recognition = ref<SpeechRecognition | null>(null);
const listeningTip = ref('语音输入');
const isLoading = ref(false);
const isSupported = ref(true);

const modes = reactive([
  { value: 'auto', label: '自动模块匹配', icon: 'A', desc: '系统自动判定最合适的模块。' },
  { value: 'manual', label: '手动模块选择', icon: 'M', desc: '手动选择特定模块。' }
]);
const currentMode = ref(modes[0]);

// 3. 核心发送逻辑 (唯一且干净的 handleSendText)
const handleSendText = () => {
  const text = inputValue.value.trim();
  if (!text) return;

// 新增：是否自动调用大模型（可配置）
const autoCallLLM = ref(true);

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
const handleSendText = () => {
  if (!inputValue.value.trim()) return;
  // 手动发送时调用大模型
  // callLLMAPI(inputValue.value);
  emit('send', {
    content: inputValue.value,
    mode: 'auto' // 或者其他你需要的参数
  });
  inputValue.value = '';


};//ToDO：调用大模型

const handleScrollToBottom = () => {
  if (chatListRef.value) {
    chatListRef.value.scrollTop = chatListRef.value.scrollHeight;
  } else {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
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
// 调用大模型API（修改：移除自动清空输入框）
const callLLMAPI = async (prompt: string) => {
  if (!prompt.trim()) return;
  isLoading.value = true;

  try {
    window.onSendText?.({
      content: prompt,
      mode: currentMode.value.value
    });

    // 替换为你的真实大模型API地址
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${import.meta.env.VITE_LLM_API_KEY}`，
        "Authorization": "Bearer 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",
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-r1-0528:free",
        "messages": [
      {
        "role": "user",
        "content": prompt
      }
    ]
        // mode: currentMode.value.value,
        //视使用的模型进行更改
      })
    });

    if (!response.ok) {
      throw new Error(`大模型接口请求失败：${response.status}`);
    }

    const result = await response.json();
    const llmReply = result.answer || result.content || '大模型未返回有效结果';
    
    window.onReceiveReply?.(llmReply);
    handleScrollToBottom();

  } catch (err) {
    console.error('大模型调用失败：', err);
    alert(`大模型调用失败：${(err as Error).message}`);
  } finally {
    isLoading.value = false;
    // 注释掉：不再自动清空输入框，保留识别的文字
    // inputValue.value = '';
  }
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
      :disabled="!inputValue.trim()"
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
/* 保持你原来的样式代码，不需要改动样式 */
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
  border: 1px solid #e5e7eb;
  background: #fff;
  resize: none;
  font-size: 14px;
  border-radius: 8px;
  padding: 10px;
  outline: none;
}
.popover {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 100;
  min-width: 240px;
  margin-bottom: 10px;
}
.pop-item { display: flex; align-items: flex-start; gap: 8px; padding: 12px; cursor: pointer; }
.pop-item:hover { background: #f9fafb; }
.tag-pill.primary { background: #e0f2fe; color: #0ea5e9; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
.send-text-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid #e5e7eb; cursor: pointer; }
.send-voice-btn { padding: 8px 16px; border-radius: 20px; border: none; background: linear-gradient(90deg, #6366f1, #a855f7); color: white; cursor: pointer; }
.send-voice-btn.listening { background: #ef4444; }
.scroll-bottom-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; }
.ic { width: 24px; height: 24px; background: #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; }
.h { font-size: 14px; font-weight: bold; }
.d { font-size: 12px; color: #666; }
</style>