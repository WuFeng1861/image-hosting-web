<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatFileSize, formatDate, shortenFilename } from '../utils/formatters'
import { copyToClipboard } from '../utils/clipboard'
import type { ImageInfo } from '../stores/imageStore'

// Props
const props = defineProps<{
  image: ImageInfo
}>()

// 使用 i18n
const { t, locale } = useI18n()

// 状态
const copied = ref(false)
const showDetailsModal = ref(false)

// 复制链接
async function copyUrl() {
  const success = await copyToClipboard(props.image.url)
  if (success) {
    copied.value = true
    // 2秒后重置状态
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

// 打开详情
function toggleDetails() {
  showDetailsModal.value = !showDetailsModal.value
}

// 在新窗口打开图片
function viewImage() {
  window.open(props.image.url, '_blank')
}
</script>

<template>
  <div class="card group">
    <!-- 图片 -->
    <div class="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-t-lg">
      <img
          :src="image.url"
          :alt="image.originalName"
          class="w-full h-full object-contain transition-all duration-300 group-hover:scale-102"
          loading="lazy"
      />

      <!-- 悬停时显示的操作按钮 -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
        <button
            @click="copyUrl"
            class="p-2.5 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 hover:scale-110"
            :title="t('imageCard.copy')"
        >
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
        </button>

        <button
            @click="viewImage"
            class="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition"
            :title="t('imageCard.view')"
        >
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
        </button>

        <button
            @click="toggleDetails"
            class="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition"
            :title="t('gallery.details')"
        >
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </button>
      </div>

      <!-- 复制成功提示 -->
      <div
          v-if="copied"
          class="absolute inset-0 flex items-center justify-center bg-primary-500 bg-opacity-80 animate-fade-in"
      >
        <div class="text-white flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {{ t('gallery.copied') }}
        </div>
      </div>
    </div>

    <!-- 图片信息 -->
    <div class="p-4 text-left border-t dark:border-gray-700">
      <p class="font-medium text-gray-800 dark:text-gray-200 truncate" :title="image.originalName">
        {{ shortenFilename(decodeURIComponent(image.originalName)) }}
      </p>
      <div class="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
        <span>{{ formatFileSize(image.size) }}</span>
        <span>{{ formatDate(image.createdAt, 'MM-dd HH:mm', locale) }}</span>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div
        v-if="showDetailsModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="toggleDetails"
    >
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg mx-4 animate-fade-in">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ t('gallery.details') }}</h3>
          <button @click="toggleDetails" class="text-gray-400 hover:text-gray-500">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="p-4">
          <!-- 图片预览 -->
          <div class="mb-4 rounded overflow-hidden">
            <img :src="image.url" :alt="image.originalName" class="w-full h-auto max-h-64 object-contain" />
          </div>

          <!-- 图片信息表格 -->
          <table class="w-full text-left">
            <tbody>
            <tr class="border-b border-gray-200 dark:border-gray-800">
              <td class="py-2 font-medium text-gray-500 dark:text-gray-400">{{ t('gallery.name') }}</td>
              <td class="py-2 break-all">{{ decodeURIComponent(image.originalName) }}</td>
            </tr>
            <tr class="border-b border-gray-200 dark:border-gray-800">
              <td class="py-2 font-medium text-gray-500 dark:text-gray-400">{{ t('gallery.size') }}</td>
              <td class="py-2">{{ formatFileSize(image.size) }}</td>
            </tr>
            <tr class="border-b border-gray-200 dark:border-gray-800">
              <td class="py-2 font-medium text-gray-500 dark:text-gray-400">{{ t('gallery.uploadTime') }}</td>
              <td class="py-2">{{ formatDate(image.createdAt, 'yyyy-MM-dd HH:mm:ss', locale) }}</td>
            </tr>
            <tr>
              <td class="py-2 font-medium text-gray-500 dark:text-gray-400">URL</td>
              <td class="py-2 flex items-center">
                <input
                    type="text"
                    :value="image.url"
                    readonly
                    class="input text-sm flex-1 mr-2"
                />
                <button
                    @click="copyUrl"
                    class="p-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    :title="t('gallery.copyUrl')"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button @click="toggleDetails" class="btn-secondary">
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
