// src/api/mock.ts
// 导入axios
import axios from 'axios'

// 1. 创建axios实例
const service = axios.create({
  // 你的模拟接口根地址（对应你FastAPI的运行地址和端口，不要写错）
  baseURL: 'http://localhost:8084',
  // 请求超时时间
  timeout: 5000,
  // 默认请求头（POST请求传递JSON格式数据，和后端接口匹配）
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 2. 封装核心接口：获取回收追溯数据（对接你的/app/execute接口）
/**
 * 获取回收追溯模块数据
 * @param {Object} params - 传递给后端的参数（比如conversation_id）
 * @returns {Promise} - 返回接口请求Promise对象，供页面层调用
 */
export function getMockData(params: Record<string, any>) {
  return service({
    // 接口路径（拼接baseURL后，完整地址为 http://localhost:8084/app/execute）
    url: '/app/execute',
    // 请求方式（和后端保持一致，必须是POST）
    method: 'post',
    // POST请求用data传递参数（GET请求用params传递，注意区分）
    data: params || {} // 兼容无参数的情况，默认传空对象
  })
}

