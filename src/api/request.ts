// src/utils/request.ts (或 src/api/request.ts)
import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8084',
  timeout: 60000,
});

/**
 * 获取或生成会话 ID
 * 使用 sessionStorage 确保在浏览器标签页关闭前，对话上下文能一直保持
 */
const getConversationId = (): string => {
  let cid = sessionStorage.getItem('X_CONV_ID');
  if (!cid) {
    // 生成一个简易的唯一标识符
    cid = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('X_CONV_ID', cid);
  }
  return cid;
};

// 请求拦截器
request.interceptors.request.use((config) => {
  // 核心：在 Header 中注入会话 ID
  config.headers['X-Conversation-Id'] = getConversationId();
  return config;
});

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Request Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default request;