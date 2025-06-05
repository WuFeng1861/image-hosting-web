<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ImageUploader from '../components/ImageUploader.vue'

// 使用 i18n
const { t } = useI18n()
</script>

<template>
  <div class="max-w-5xl mx-auto w-full">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('upload.title') }}</h1>
      <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">{{ t('app.slogan') }}</p>
    </div>
    
    <ImageUploader />
  </div>
</template>