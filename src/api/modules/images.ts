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
 * 上传图片
 * @param files 图片文件列表
 * @param serverPassword 管理员密码（可选）
 */
export async function uploadImages(files: File[], serverPassword?: string) {
  const formData = new FormData()
  
  // 添加文件
  files.forEach(file => {
    formData.append('files', file)
  })
  
  // 如果有管理员密码，添加到表单
  if (serverPassword) {
    formData.append('adminPassword', serverPassword)
  }
  
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
  return response.data.data
}
