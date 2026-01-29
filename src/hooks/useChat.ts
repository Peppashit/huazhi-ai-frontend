// src/hooks/useChat.ts
import { ref } from 'vue';
import request from '../api/request';

// 定义符合后端返回结构的接
export function useChat() {
  const messages = ref<any[]>([]);
  const loading = ref(false);

  const sendMessage = async (content: string, mode: string) => {
    loading.value = true;
    try {
      // 对接后端核心执行接口
      const res: any = await request.post('/app/execute', { 
        query: content,
        mode: mode 
      });

      // 处理普通对话分支
      if (res.dialogue_response === 999) {
        messages.value.push({
          role: 'ai',
          content: '您好！我是您的数据助手。您可以问我关于手术包回收记录等业务问题。'
        });
      } else {
        // 处理 SQL 执行结果分支
        messages.value.push({
          role: 'ai',
          content: res.explanation, // 自然语言解释
          sql: res.sql,             // 生成的 SQL
          tableData: res.data,      // 结果数据列表
          isCorrected: res.is_corrected // 自动修正标记
        });
      }
    } catch (error) {
      messages.value.push({ role: 'ai', content: '服务响应异常，请重试。' });
    } finally {
      loading.value = false;
    }
  };

  return { messages, loading, sendMessage };
}