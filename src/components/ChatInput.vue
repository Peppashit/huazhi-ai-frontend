<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';

// 原有变量不变
const inputValue = ref('');
const emit = defineEmits(['send']);
const chatListRef = ref<HTMLDivElement | null>(null);
const showPopover = ref(false);
const modes = reactive([
  { value: 'auto', label: '自动模块匹配', icon: 'A', desc: '系统自动判定最合适的模块（表集合）。' },
  { value: 'manual', label: '手动模块选择', icon: 'M', desc: '显式选择一个或多个模块，直接跳过自动匹配。' }
]);
const currentMode = ref(modes[0]);

// Web Speech API 相关变量
const isListening = ref(false);
const recognition = ref<SpeechRecognition | null>(null);
const listeningTip = ref('语音输入');
const isLoading = ref(false);
const isSupported = ref(true);
// 新增：是否自动调用大模型（可配置）
const autoCallLLM = ref(true);

// 原有方法不变（togglePopover/handleModeSelect/handleScrollToBottom）
const togglePopover = () => {
  showPopover.value = !showPopover.value;
};
const handleModeSelect = (value) => {
  const mode = modes.find(m => m.value === value);
  if (mode) {
    currentMode.value = mode;
    window.onModeChange?.(value);
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

// 初始化 Web Speech API（核心修改：识别结果填充输入框）
const initSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    isSupported.value = false;
    listeningTip.value = '浏览器不支持 🚫';
    alert('当前浏览器不支持语音识别，请使用Chrome/Edge浏览器');
    return;
  }

  recognition.value = new SpeechRecognition();
  recognition.value.lang = 'zh-CN';
  recognition.value.continuous = false;
  recognition.value.interimResults = false;
  recognition.value.maxAlternatives = 1;

  // 核心修改：识别结果回调 → 填充输入框
  recognition.value.onresult = (event: SpeechRecognitionEvent) => {
    const recognizedText = event.results[0][0].transcript;
    // 1. 填充到输入框（核心需求）
    inputValue.value = recognizedText;
    // 2. 输入框聚焦（优化体验）
    nextTick(() => {
      const textarea = document.querySelector('.input-textarea') as HTMLTextAreaElement;
      textarea?.focus();
    });
    // 3. 可选：自动调用大模型（也可注释掉，改为手动发送）
    if (autoCallLLM.value) {
      callLLMAPI(recognizedText);
    }
  };

  recognition.value.onstart = () => {
    isListening.value = true;
    listeningTip.value = '正在识别 🎧';
  };

  recognition.value.onend = () => {
    isListening.value = false;
    listeningTip.value = '语音输入 🎤';
  };

  recognition.value.onerror = (event: SpeechRecognitionErrorEvent) => {
    isListening.value = false;
    listeningTip.value = '语音输入 🎤';
    console.error('语音识别错误：', event.error);
    let errorMsg = '语音识别失败，请重试';
    if (event.error === 'not-allowed') {
      errorMsg = '麦克风权限被拒绝，请允许权限后重试';
    } else if (event.error === 'no-speech') {
      errorMsg = '未检测到语音，请重新说话';
    }
    alert(errorMsg);
  };
};

// 触发/停止语音识别（无修改）
const toggleSpeechRecognition = () => {
  if (!recognition.value) return;

  if (isListening.value) {
    recognition.value.stop();
  } else {
    try {
      recognition.value.start();
    } catch (err) {
      console.error('启动语音识别失败：', err);
      alert('启动识别失败，请检查麦克风权限');
    }
  }
};

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

// 生命周期（无修改）
onMounted(() => {
  initSpeechRecognition();
  document.addEventListener('click', (e) => {
    const plusBtn = document.querySelector('.plus-btn');
    const popover = document.querySelector('.popover');
    if (plusBtn && popover && !plusBtn.contains(e.target) && !popover.contains(e.target)) {
      showPopover.value = false;
    }
  });
});

onUnmounted(() => {
  if (recognition.value && isListening.value) {
    recognition.value.stop();
  }
  recognition.value = null;
});
</script>

<template>
  <div class="input-dialog-container">
    <button class="plus-btn" @click="togglePopover" title="切换模块匹配模式" :disabled="isLoading">
      +
    </button>

    <div class="input-container">
      <div v-if="showPopover" class="popover" @click.outside="showPopover = false">
        <div v-for="mode in modes" :key="mode.value" class="pop-item" @click="handleModeSelect(mode.value)">
          <div class="ic">{{ mode.icon }}</div>
          <div>
            <div class="h">{{ mode.label }}</div>
            <div class="d">{{ mode.desc }}</div>
          </div>
        </div>
      </div>

      <!-- 输入框：识别后填充文字并聚焦 -->
      <textarea
        v-model="inputValue"
        class="input-textarea"
        placeholder="输入自然语言需求（或点击右侧语音输入）"
        rows="1"
        :disabled="isLoading || isListening"
      />

      <div class="mode-tag">
        <span class="tag-pill primary">{{ currentMode.label }}</span>
      </div>
    </div>

    <!-- 发送按钮：识别后可手动发送 -->
    <button class="send-text-btn" @click="handleSendText" :disabled="isLoading || isListening || !inputValue.trim()">
      发送 👉
    </button>

    <button 
      class="send-voice-btn" 
      @click="toggleSpeechRecognition" 
      :disabled="isLoading || !isSupported"
      :class="{ listening: isListening }"
    >
      {{ listeningTip }}
    </button>

    <button class="scroll-bottom-btn" @click="handleScrollToBottom" title="回到底部" :disabled="isLoading">
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