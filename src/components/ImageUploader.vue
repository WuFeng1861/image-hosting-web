<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useImageStore } from '../stores/imageStore'

// 使用 i18n
const { t } = useI18n()

// 使用图片存储
const imageStore = useImageStore()

// 状态
const files = ref<File[]>([])
const dragActive = ref(false)
const uploading = ref(false)
const adminPassword = ref('')
const uploadSuccess = ref(false)
const uploadedUrls = ref<string[]>([])
const showUploadResult = ref(false)

// 文件尺寸限制（2MB）
const SIZE_LIMIT = 2 * 1024 * 1024 // 2MB

// 计算属性
const hasLargeFile = computed(() => {
  return files.value.some(file => file.size > SIZE_LIMIT)
})

const previewImages = computed(() => {
  return files.value.map(file => ({
    file,
    name: file.name,
    size: file.size,
    preview: URL.createObjectURL(file),
    isLarge: file.size > SIZE_LIMIT
  }))
})

// 拖放事件处理
function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = false
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  dragActive.value = false
  
  if (e.dataTransfer) {
    handleFiles(e.dataTransfer.files)
  }
}

// 文件选择
function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    handleFiles(input.files)
  }
}

// 处理选择的文件
function handleFiles(fileList: FileList) {
  // 将 FileList 转换为数组并添加到当前文件列表
  const newFiles = Array.from(fileList).filter(file => file.type.startsWith('image/'))
  files.value = [...files.value, ...newFiles]
}

// 移除文件
function removeFile(index: number) {
  files.value = files.value.filter((_, i) => i !== index)
}

// 清空文件列表
function clearFiles() {
  files.value = []
}

// 上传文件
async function uploadFiles() {
  if (files.value.length === 0) return
  
  uploading.value = true
  uploadSuccess.value = false
  
  try {
    // 调用存储的上传方法
    const result = await imageStore.uploadImages(
      files.value, 
      hasLargeFile.value ? adminPassword.value : undefined
    )
    
    if (result.success) {
      uploadSuccess.value = true
      uploadedUrls.value = result.urls
      showUploadResult.value = true
      // 上传成功后清空文件列表和密码
      files.value = []
      adminPassword.value = ''
    }
  } catch (error) {
    console.error('Upload error:', error)
  } finally {
    uploading.value = false
  }
}

// 复制所有 URL 到剪贴板
function copyAllUrls() {
  if (uploadedUrls.value.length === 0) return
  
  const text = uploadedUrls.value.join('\n')
  navigator.clipboard.writeText(text)
    .then(() => {
      // 可以添加提示
    })
    .catch(err => {
      console.error('Failed to copy URLs: ', err)
    })
}

// 关闭上传结果
function closeUploadResult() {
  showUploadResult.value = false
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- 拖放区域 -->
    <div
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover="handleDragOver"
      @drop="handleDrop"
      class="relative border-[3px] border-dashed rounded-xl p-12 text-center transition-all duration-300 shadow-inner bg-gray-50/50 dark:bg-gray-800/20"
      :class="[
        dragActive 
          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 scale-102 shadow-lg' 
          : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 hover:shadow-md',
        files.length > 0 ? 'cursor-default' : 'cursor-pointer'
      ]"
    >
      <!-- 未选择文件时显示上传区域 -->
      <div v-if="files.length === 0">
        <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          {{ t('upload.drag') }}
        </h3>
        <div class="mt-4">
          <label class="btn-primary inline-block cursor-pointer">
            {{ t('upload.select') }}
            <input 
              type="file" 
              @change="handleFileSelect" 
              multiple 
              accept="image/*" 
              class="hidden" 
            />
          </label>
        </div>
        
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {{ t('upload.multipleAllowed') }}
        </p>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('upload.maxSize') }}
        </p>
      </div>
      
      <!-- 已选择文件时显示文件预览 -->
      <div v-else class="space-y-6">
        <!-- 文件预览区域 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div 
            v-for="(preview, index) in previewImages" 
            :key="index"
            class="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 animate-fade-in"
          >
            <img 
              :src="preview.preview" 
              :alt="preview.name" 
              class="w-full h-32 object-cover"
            />
            
            <button 
              @click="removeFile(index)"
              class="absolute top-2 right-2 p-1 rounded-full bg-gray-800/70 text-white hover:bg-gray-900/70"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <div class="p-2 text-left">
              <p class="text-sm font-medium truncate" :title="preview.name">{{ preview.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ (preview.size / 1024).toFixed(1) }} KB
                <span v-if="preview.isLarge" class="text-warning-500 ml-1">(> 2MB)</span>
              </p>
            </div>
          </div>
        </div>
        
        <!-- 管理员密码输入框（如果有大文件） -->
        <div v-if="hasLargeFile" class="mt-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('upload.adminPassword') }}
          </label>
          <input
            v-model="adminPassword"
            type="password"
            class="input"
          />
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex justify-between mt-6">
          <button @click="clearFiles" class="btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button 
            @click="uploadFiles" 
            class="btn-primary" 
            :disabled="uploading || (hasLargeFile && !adminPassword)"
            :class="{ 'opacity-70 cursor-not-allowed': uploading || (hasLargeFile && !adminPassword) }"
          >
            <svg v-if="uploading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ uploading ? t('upload.uploading') : t('common.submit') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 上传结果弹窗 -->
    <div v-if="showUploadResult" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 animate-slide-up">
        <div class="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ uploadSuccess ? t('upload.success') : t('upload.failed') }}
          </h3>
          <button @click="closeUploadResult" class="text-gray-400 hover:text-gray-500">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="p-5">
          <!-- 上传成功显示 URL 列表 -->
          <div v-if="uploadSuccess && uploadedUrls.length > 0" class="space-y-3">
            <div v-for="(url, index) in uploadedUrls" :key="index" class="flex">
              <input 
                type="text" 
                :value="url" 
                readonly 
                class="input flex-1 text-sm"
              />
              <button 
                @click="navigator.clipboard.writeText(url)"
                class="ml-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                title="复制链接"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>
            
            <!-- 复制所有 URL 按钮 -->
            <button 
              @click="copyAllUrls"
              class="w-full btn-primary mt-3"
            >
              {{ t('gallery.copyUrl') }}
            </button>
          </div>
          
          <!-- 上传失败显示错误信息 -->
          <div v-else-if="!uploadSuccess" class="text-error-500">
            {{ imageStore.error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>