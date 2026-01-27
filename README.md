
# HUAZHI AI FREE - 前端智能数据分析平台

本项目是一个基于 **Vue 3 + TypeScript** 构建的高保真前端原型，专为 **NL2SQL（自然语言转 SQL）** 任务设计。项目已完成甲方的视觉还原，并预留了与中间件（Node.js）及后端（Python FastAPI）耦合的完整逻辑。

## 🚀 技术栈
- **核心框架**: Vue 3 (Composition API)
- **开发语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia (处理对话流与会话状态)
- **网络请求**: Axios (预设中间件拦截与转发)
- **样式处理**: Sass (完全还原甲方设计变量与响应式布局)
- **内容渲染**: Markdown-it (解析中间件生成的 Markdown 表格与 AI 解释)

## 📂 项目目录结构
```text
src/
├── api/            # 接口定义：对接中间件 3002 端口的 /chat-process 接口
├── assets/         # 静态资源
├── components/     # 组件库
│   ├── HistorySidebar.vue # 左侧：历史对话记录、搜索、用户信息
│   ├── ChatInput.vue      # 底部：自然语言输入框、模式切换（自动/手动）
│   ├── CatalogPanel.vue   # 右侧：参考目录、模块库（表结构与 SQL 模板）
│   └── MessageBubble.vue  # 中间：消息气泡（支持 SQL 代码高亮与 Markdown 表格）
├── store/          # 全局状态：对话数组、Loading 状态、会话 ID 管理
├── styles/         # 全局样式：甲方 UI 变量（颜色、圆角、阴影）
├── App.vue         # 页面主体：响应式三栏布局 (Grid 布局)
└── main.ts         # 入口文件：集成 Pinia 与全局样式
```

## ✨ 已完成功能 (里程碑 1)

### 1. 高保真 UI 还原
*   **三栏式布局**：左侧历史记录（288px）、中间执行区（自适应）、右侧参考目录（360px）。
*   **设计规范**：严格执行甲方提供的 CSS 变量，包含渐变背景、`radius-xl (22px)` 圆角以及 `shadow-soft` 柔和阴影。
*   **响应式适配**：针对不同分辨率（1400px / 1100px / 768px）进行了媒体查询优化，确保在笔记本、平板和手机端均无布局错位或内容遮挡。

### 2. 消息交互系统
*   **混合渲染能力**：前端已具备解析 **Markdown 表格**、**SQL 代码块** 及 **文本解释** 的混合展示能力。
*   **多状态预留**：预设了“生成中 (Generating)”的 Loading 动画，提升用户在等待后端执行 SQL 时的体验。

### 3. 业务逻辑预留
*   **模式切换**：输入框支持“自动模块匹配”与“手动选择”模式切换。
*   **引用机制**：右侧模块库预留了“引用”接口，支持一键将预设 SQL 模板填入输入框。

## 🔌 后端与中间件耦合说明

项目已按照“前端制作攻略”要求，做好了与后端耦合的基础：

### 1. 接口对接路径
*   **中间件地址**: `http://localhost:3002/api/chat-process`
*   **后端 API 地址**: `http://localhost:8082/app/execute`
*   **代理配置**: 已在 `vite.config.ts` 中配置代理，前端通过 `/api` 路径无缝访问中间件，解决跨域问题。

### 2. 数据交换协议
前端已封装好符合中间件要求的请求体：
```typescript
{
  "prompt": "用户输入的自然语言",
  "options": {
    "conversationId": "UUID 会话唯一标识"
  },
  "systemMessage": "系统提示词"
}
```

### 3. 返回解析逻辑
前端 `MessageBubble` 组件会自动处理中间件返回的 `text` 字段。该字段经过 Node.js 中间件处理，已将 Python 原始 JSON 数据转为 Markdown Table，前端通过 `markdown-it` 实现即时渲染。

## 🛠️ 如何运行

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **浏览器访问**
   打开 [http://localhost:5173](http://localhost:5173) 查看效果。

---

**备注**：本阶段交付物为纯前端工程代码。联调时请确保后端 (Python) 与中间件 (Node.js) 服务已分别在 8082 和 3002 端口启动。