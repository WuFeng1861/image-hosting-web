import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 定义状态
  const theme = ref(localStorage.getItem('theme') || 'light')
  
  // 监听主题变化并更新 HTML 类
  watch(theme, (newTheme) => {
    // 保存到本地存储
    localStorage.setItem('theme', newTheme)
    
    // 更新 HTML 根元素类
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })
  
  // 切换主题
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  
  // 设置特定主题
  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
  }
  
  return {
    theme,
    toggleTheme,
    setTheme
  }
})