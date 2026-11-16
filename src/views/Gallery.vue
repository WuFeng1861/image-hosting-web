<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useImageStore } from '../stores/imageStore'
import { cleanupImages } from '../api'
import ImageCard from '../components/ImageCard.vue'

const { t } = useI18n()
const imageStore = useImageStore()

const isLoading = ref(true)
const page = ref(1)
const pageSize = 20

const total = computed(() => imageStore.pagination?.totalItems ?? 0)
const totalPages = computed(() => Math.max(imageStore.pagination?.totalPages ?? 1, 1))
const rangeStart = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize + 1))
const rangeEnd = computed(() => Math.min(page.value * pageSize, total.value))

async function load(target = page.value) {
  page.value = target
  isLoading.value = true
  try {
    await imageStore.fetchImages(target, pageSize)
  } catch (error) {
    console.error('Failed to fetch images:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => load(1))

const prevPage = () => {
  if (page.value > 1) void load(page.value - 1)
}
const nextPage = () => {
  if (page.value < totalPages.value) void load(page.value + 1)
}

/** 清理 uploadImage 里非图片文件 + 指向缺失文件的记录（先预览再执行） */
const cleaning = ref(false)
async function runCleanup() {
  if (cleaning.value) return
  cleaning.value = true
  try {
    const preview = await cleanupImages(true, true)
    const s = preview.summary

    // 按原因归类，确认框里能看出删的是哪几类垃圾
    const bucket = { ext: 0, broken: 0, tiny: 0 }
    for (const d of preview.invalidDetails ?? []) {
      if (d.reason.includes('不在白名单')) bucket.ext += 1
      else if (d.reason.includes('占位图')) bucket.tiny += 1
      else bucket.broken += 1
    }

    const lines = [
      `上传目录：${preview.uploadDir}`,
      `磁盘文件 ${s.totalFiles} 个，数据库 ${s.totalRecords} 条`,
      '',
      `· 无效文件合计：${s.invalidFiles} 个（将删除文件 + 对应记录）`,
    ]
    if (bucket.ext) lines.push(`    - 扩展名不在白名单：${bucket.ext} 个`)
    if (bucket.broken) lines.push(`    - 文件损坏 / 伪装图片：${bucket.broken} 个`)
    if (bucket.tiny) lines.push(`    - 1×1 透明占位图：${bucket.tiny} 个`)
    lines.push(
      `· 无对应文件的记录：${s.missingRecords} 条（将删除记录）`,
      `· 无对应记录的文件：${s.orphanFiles} 个（仅报告，不删除）`,
      '',
      '确认执行？删除后不可恢复。',
    )

    const ok = window.confirm(lines.join('\n'))
    if (!ok) return

    const result = await cleanupImages(false, true)
    window.alert(
      `清理完成：删除文件 ${result.deleted.files} 个，删除记录 ${result.deleted.records} 条`,
    )
    await load(1)
  } catch (e) {
    const msg = (e as { message?: string })?.message ?? String(e)
    window.alert(`清理失败：${msg}`)
  } finally {
    cleaning.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-[1920px] mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('gallery.title') }}</h1>
      <button
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="cleaning"
        @click="runCleanup"
      >
        {{ cleaning ? '清理中…' : '清理无效文件' }}
      </button>
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
      <button @click="load(page)" class="mt-4 btn-primary">
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
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
        <ImageCard
          v-for="image in imageStore.images"
          :key="image.id"
          :image="image"
        />
      </div>

      <!-- 分页 -->
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
        <span>
          共 {{ total }} 张，当前第 {{ rangeStart }}–{{ rangeEnd }} 张
          <span class="mx-1">·</span>
          第 {{ page }} / {{ totalPages }} 页
        </span>
        <div class="flex items-center gap-2">
          <button
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="page <= 1 || isLoading"
            @click="prevPage"
          >
            上一页
          </button>
          <button
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="page >= totalPages || isLoading"
            @click="nextPage"
          >
            下一页
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
