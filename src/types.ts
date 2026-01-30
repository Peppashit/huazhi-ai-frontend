// src/types.ts
export interface TableItem {
  name: string;
  desc: string;
}

export interface ResultItem {
  category: string;
  sales_qty: number;
  gmv: number;
}

export interface MessageData {
  role: 'user' | 'assistant'; // 角色：用户/AI
  content?: string; // 用户输入内容
  sql?: string; // AI生成的SQL
  explanation?: string; // AI文本说明
  matchedTables?: TableItem[]; // 匹配的表
  resultData?: ResultItem[]; // 查询结果
}

// 历史对话列表的项（可包含对话ID、时间等扩展字段）
export interface HistoryItem {
  id: string | number; // 唯一标识
  title: string; // 对话标题（可截取用户输入的前N个字符）
  createTime: string; // 创建时间
  messages: MessageData[]; // 该条历史的所有对话（上下文）
}