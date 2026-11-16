import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchImages as apiFetchImages, uploadImages as apiUploadImages } from '../api'
import type { ImageInfo, PaginatedResponse } from '../types/image'

export const useImageStore = defineStore('image', () => {
  // 状态
  const images = ref<ImageInfo[]>([])
  const pagination = ref<PaginatedResponse<ImageInfo>['meta'] | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 获取所有图片
  async function fetchImages(page = 1, limit = 20) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiFetchImages(page, limit)
      images.value = response.items
      console.log(response.items);
      pagination.value = response.meta
    } catch (err) {
      console.error('Failed to fetch images:', err)
      error.value = err.message || '获取图片列表失败'
    } finally {
      loading.value = false
    }
  }
  
  // 上传图片
  async function uploadImages(files: File[]) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiUploadImages(files)

      // 上传成功后回到第一页刷新（新图按 createdAt 倒序，必然在最前）
      await fetchImages(1)

      // 接口返回 { success, message, data: ImageInfo[] }，真正的数组在 data 里
      const list = response?.data ?? []
      return {
        success: true,
        urls: list.map(img => img.url)
      }
    } catch (err: any) {
      console.error('Failed to upload images:', err)
      error.value = err.message || '上传失败'
      return {
        success: false,
        error: err.message
      }
    } finally {
      loading.value = false
    }
  }
  
  return {
    images,
    pagination,
    loading,
    error,
    fetchImages,
    uploadImages
  }
})
