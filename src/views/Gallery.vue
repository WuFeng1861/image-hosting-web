<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useImageStore } from '../stores/imageStore'
import ImageCard from '../components/ImageCard.vue'

// 使用 i18n
const { t } = useI18n()

// 使用图片存储
const imageStore = useImageStore()

// 状态
const isLoading = ref(true)

// 获取图片列表
onMounted(async () => {
  try {
    await imageStore.fetchImages()
  } catch (error) {
    console.error('Failed to fetch images:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="w-full max-w-[1920px] mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('gallery.title') }}</h1>
    </div>

    <!-- 加载中 -->
    <div v-if="isLoading" class="text-center py-12">
      <svg class="animate-spin w-10 h-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="mt-3 text-gray-600 dark:text-gray-400">{{ t('gallery.loading') }}</p>
    </div>

    <!-- 错误信息 -->
    <div v-else-if="imageStore.error" class="text-center py-12">
      <svg class="w-12 h-12 mx-auto text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="mt-3 text-error-500">{{ imageStore.error }}</p>
      <button
        @click="imageStore.fetchImages"
        class="mt-4 btn-primary"
      >
        {{ t('common.retry') }}
      </button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="imageStore.images.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">{{ t('gallery.empty') }}</p>
      <router-link to="/" class="mt-4 btn-primary inline-block">
        {{ t('nav.upload') }}
      </router-link>
    </div>

    <!-- 图片网格 -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
      <ImageCard
        v-for="image in imageStore.images"
        :key="image.id"
        :image="image"
      />
    </div>
  </div>
</template>
