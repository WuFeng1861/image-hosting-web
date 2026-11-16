import { instance } from '../instance'
import type { ImageInfo, ApiResponse, PaginatedResponse } from '../../types/image'

/**
 * 获取所有图片列表
 * @param page 页码
 * @param limit 每页数量
 */
export async function fetchImages(page = 1, limit = 20): Promise<PaginatedResponse<ImageInfo>> {
  const response = await instance.get<ApiResponse<PaginatedResponse<ImageInfo>>>('/images', {
    params: { page, limit }
  })
  return response.data
}

/**
 * 上传图片（改为管理员登录鉴权，不再需要表单里的 adminPassword）
 * @param files 图片文件列表
 */
export async function uploadImages(files: File[]) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  
  const response = await instance.post<ApiResponse<ImageInfo[]>>('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

/**
 * 获取单个图片信息
 * @param id 图片ID
 */
export async function getImageById(id: string): Promise<ImageInfo> {
  const response = await instance.get<ApiResponse<ImageInfo>>(`/images/${id}`)
  // 拦截器已剥掉一层 axios data，这里拿到的就是 { success, data }
  return response.data
}

export interface CleanupReport {
  uploadDir: string
  dryRun: boolean
  summary: {
    totalFiles: number
    totalRecords: number
    invalidFiles: number
    orphanFiles: number
    missingRecords: number
    recordsToDelete: number
  }
  invalidFiles: string[]
  /** 每个被判废的文件及原因（扩展名非法 / 文件损坏 / 1×1 占位图） */
  invalidDetails?: { filename: string; reason: string }[]
  orphanFiles: string[]
  missingRecords: { id: string; filename: string; originalName: string }[]
  deleted: { files: number; records: number }
}

/**
 * 清理 uploadImage 目录与数据库的不一致。
 * dryRun=true 只出报告不动手（预览），false 才真正删除。
 */
export async function cleanupImages(
  dryRun = true,
  removeOrphanRecords = true,
): Promise<CleanupReport> {
  // 后端全局 TransformInterceptor 会把返回值包成 { success, data }，
  // 拦截器已剥掉 axios 那层，这里再取 .data 才是真正的报告
  const res = await instance.post<ApiResponse<CleanupReport>>('/images/cleanup', {
    dryRun,
    removeOrphanRecords,
  })
  return res.data
}
