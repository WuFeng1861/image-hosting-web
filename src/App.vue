<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Header from './components/Header.vue'

// 使用 i18n
const { locale } = useI18n()

// 初始化时从本地存储读取语言设置
onMounted(() => {
  const savedLanguage = localStorage.getItem('lang') || 'zh-CN'
  if (savedLanguage) {
    locale.value = savedLanguage
  }
})

// 监听语言变化，更新 HTML 的 lang 属性
watch(locale, (newLocale) => {
  document.documentElement.lang = newLocale
})
</script>

<template>
  <div class="min-h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
    <Header />

    <main class="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="w-full mt-auto py-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
      <p>© 2025 {{ $t('app.title') }}. {{ $t('app.slogan') }}</p>
    </footer>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
