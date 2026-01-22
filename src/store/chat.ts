import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { chatProcess } from '@/api'; // 1. 确保这里导入的是 chatProcess

export const useChatStore = defineStore('chat', () => {
  const conversationId = ref(uuidv4()); // 初始化会话 ID
  const messages = ref<any[]>([]);
  const isGenerating = ref(false);

  // 发送消息的方法
  async function sendMessage(query: string) {
    if (!query.trim() || isGenerating.value) return;

    // 1. 添加用户消息（根据中间件字段，我们统一用 text）
    messages.value.push({
      role: 'user',
      text: query
    });

    isGenerating.value = true;

    try {
      // 2. 调用中间件接口
      // 注意：这里传的是 query（对应函数参数）
      const res = await chatProcess(query, conversationId.value);
      
      // 3. 解构中间件返回的数据
      const { text, sql, chartData, error } = res.data; 

      // 4. 将结果推入消息列表
      // 注意：中间件已经把“解释”和“表格”都转成 Markdown 放在 text 字段里了
      messages.value.push({
        role: 'assistant',
        text: text,      // 包含 AI 解释和 Markdown 表格
        sql: sql,        // SQL 语句
        chartData: chartData, // 图表数据
        isError: error   // 是否报错
      });

    } catch (error: any) {
      console.error('请求失败:', error);
      messages.value.push({
        role: 'assistant',
        text: '抱歉,系统请求出错,请检查中间件(3002)和后端服务(8082)是否开启。'
      });
    } finally {
      isGenerating.value = false;
    }
  }

  return { messages, isGenerating, sendMessage, conversationId };
});