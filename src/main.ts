import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import router from './router'
import App from './App.vue'
import './style.css'
import './assets/tailwind.css'
import { messages } from './locales'

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN', // 默认语言为中文
  fallbackLocale: 'en',
  messages,
})

// 创建 Pinia 状态管理
const pinia = createPinia()

// 创建应用并挂载
// pinia 必须先装：路由守卫里会用到 useAuthStore()
createApp(App)
  .use(pinia)
  .use(i18n)
  .use(router)
  .mount('#app')