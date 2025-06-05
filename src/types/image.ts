// 接口响应类型
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

// 分页元数据
export interface PaginationMeta {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

// 分页响应数据
export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

// 图片信息接口
export interface ImageInfo {
  id: string
  filename: string
  originalName: string
  mimeType: string
  url: string
  size: number
  createdAt: string
}