<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/store/chat'

// 1. 定义状态：对应甲方的“自动/手动”模式
const mode = ref<'auto' | 'manual'>('auto')
const userInput = ref('')

// 2. 发送逻辑：预留给后端的接口对接点
const handleSend = () => {
  if (!userInput.value.trim()) return
  console.log('准备发送给后端:', {
    query: userInput.value,
    mode: mode.value
  })
  // 后续这里会调用 executeQuery API
  userInput.value = '' 
}

// 切换模式
const toggleMode = (newMode: 'auto' | 'manual') => {
  mode.value = newMode
}
</script>

<template>
  <div class="composer-wrap">
    <div class="composer">
      <div class="input-row">
        <!-- 模式切换按钮 (＋) -->
        <div class="plus-wrap">
          <button class="plus" @click="toggleMode(mode === 'auto' ? 'manual' : 'auto')">
            {{ mode === 'auto' ? 'A' : 'M' }}
          </button>
          <span class="mode-tip">{{ mode === 'auto' ? '自动匹配' : '手动选择' }}</span>
        </div>

        <div class="inputbox">
          <textarea 
            v-model="userInput" 
            placeholder="输入自然语言需求..."
            @keydown.enter.ctrl="handleSend"
          ></textarea>
        </div>

        <button class="send-text" @click="handleSend">发送 ➤</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 这里直接复用你提供的 HTML 里的 CSS 逻辑
.composer-wrap {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding: 0 20px 20px;
}
.composer {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(10px);
}
.input-row {
  display: flex;
  gap: 12px;
  padding: 12px;
  align-items: flex-end;
}
.inputbox {
  flex: 1;
  background: linear-gradient(180deg, #f7f9ff, #ffffff);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 8px;
  textarea {
    width: 100%;
    border: none;
    background: transparent;
    outline: none;
    resize: none;
    min-height: 44px;
    font-size: 14px;
  }
}
.plus {
  width: 44px; height: 44px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  cursor: pointer;
  color: var(--brand);
  font-weight: bold;
}
.send-text {
  height: 44px;
  padding: 0 20px;
  background: var(--brand);
  color: white;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: bold;
  &:hover { opacity: 0.9; }
}
.mode-tip {
  font-size: 10px;
  color: var(--muted);
  display: block;
  text-align: center;
}
</style>