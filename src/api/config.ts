/**
 * API 基地址：优先 VITE_API_BASE_URL，没配就用生产路径。
 * 本地开发可在 .env.local 写 VITE_API_BASE_URL=http://127.0.0.1:5888/api
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  'https://wufeng98.cn/imgServerApi/api'

export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 上传图片需要更宽松的超时
  headers: {
    'Content-Type': 'application/json'
  }
}
