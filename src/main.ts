import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/main.scss' // 引入全局样式
import App from './App.vue'

createApp(App).mount('#app')
const app = createApp(App)
app.use(createPinia()) 
app.mount('#app')
