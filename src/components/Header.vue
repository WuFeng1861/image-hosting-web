<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '../stores/themeStore'
import { useI18n } from 'vue-i18n'
import { languageOptions } from '../locales'
import { useRouter } from 'vue-router'

// 使用主题存储
const themeStore = useThemeStore()

// 使用 i18n
const { t, locale } = useI18n()

// 使用路由
const router = useRouter()

// 是否显示移动端菜单
const isMobileMenuOpen = ref(false)

// 语言切换
function switchLanguage(lang: string) {
  locale.value = lang
  localStorage.setItem('lang', lang)
}

// 切换菜单显示
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 导航到路由
function navigateTo(path: string) {
  router.push(path)
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10 transition-colors">
    <div class="container mx-auto px-4 py-3">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <img src="/src/assets/img-icon.svg" alt="Logo" class="w-8 h-8 text-primary-500" />
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ t('app.title') }}</h1>
        </div>

        <!-- 桌面导航 -->
        <nav class="hidden md:flex items-center space-x-8">
          <router-link
            to="/"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition"
            active-class="text-primary-500 dark:text-primary-400 font-medium"
          >
            {{ t('nav.upload') }}
          </router-link>
          <router-link
            to="/gallery"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition"
            active-class="text-primary-500 dark:text-primary-400 font-medium"
          >
            {{ t('nav.gallery') }}
          </router-link>
        </nav>

        <!-- 桌面操作栏 -->
        <div class="hidden md:flex items-center space-x-4">
          <!-- 语言切换 -->
          <div class="relative inline-block text-left">
            <button
              type="button"
              class="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
            >
              <select
                v-model="locale"
                @change="switchLanguage(locale)"
                class="appearance-none bg-transparent pr-8 pl-2 py-1 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-800"
              >
                <option v-for="lang in languageOptions" :key="lang.value" :value="lang.value">
                  {{ lang.label }}
                </option>
              </select>
              <svg class="w-5 h-5 -ml-6 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>

          <!-- 主题切换 -->
          <button
            @click="themeStore.toggleTheme"
            class="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            :title="themeStore.theme === 'light' ? t('theme.dark') : t('theme.light')"
          >
            <svg v-if="themeStore.theme === 'light'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </button>
        </div>

        <!-- 移动端菜单按钮 -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <div
      v-show="isMobileMenuOpen"
      class="md:hidden bg-white dark:bg-gray-900 shadow-md animate-fade-in"
    >
      <div class="container mx-auto px-4 py-3 space-y-4">
        <!-- 导航链接 -->
        <div class="space-y-2">
          <button
            @click="navigateTo('/')"
            class="block w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {{ t('nav.upload') }}
          </button>
          <button
            @click="navigateTo('/gallery')"
            class="block w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {{ t('nav.gallery') }}
          </button>
        </div>

        <!-- 设置选项 -->
        <div class="flex justify-between items-center px-3 py-2">
          <!-- 语言切换 -->
          <div class="flex items-center">
            <span class="text-gray-600 dark:text-gray-400 mr-2">语言/Language:</span>
            <select
              v-model="locale"
              @change="switchLanguage(locale)"
              class="appearance-none bg-transparent pr-8 pl-2 py-1 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-800"
            >
              <option v-for="lang in languageOptions" :key="lang.value" :value="lang.value">
                {{ lang.label }}
              </option>
            </select>
          </div>

          <!-- 主题切换 -->
          <button
            @click="themeStore.toggleTheme"
            class="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          >
            <svg v-if="themeStore.theme === 'light'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
