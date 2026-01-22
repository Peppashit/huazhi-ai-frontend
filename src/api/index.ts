import axios from 'axios';

// 1. 创建 Axios 实例
const service = axios.create({
  // 这里的 /api 会被 vite.config.ts 里的 proxy 转发到 http://localhost:3002
  baseURL: '/api', 
  timeout: 60000,
});

// 2. 按照中间件的 Request 结构定义类型
export interface ChatProcessRequest {
  prompt: string;
  options: {
    conversationId?: string;
  };
  systemMessage?: string;
}

// 3. 按照中间件返回的 Result 结构定义类型
export interface ChatProcessResponse {
  id: string;
  text: string;      // 关键字段：中间件已将 AI 解释 + Markdown 表格拼到了这里
  chartData: any;    // 预留的图表数据
  sql: string;       // 生成的 SQL 语句
  conversationId: string;
  done: boolean;
  error?: boolean;
}

/**
 * 对接中间件的统一请求函数
 * @param prompt 用户输入的消息
 * @param conversationId 会话ID
 */
export const chatProcess = (prompt: string, conversationId: string) => {
  return service.post<ChatProcessResponse>('/chat-process', {
    prompt,
    options: { conversationId },
    systemMessage: "You are a helpful data analysis assistant." // 默认系统消息
  });
};