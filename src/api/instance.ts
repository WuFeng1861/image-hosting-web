import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { axiosConfig } from './config'
import { getToken, redirectToLogin } from './token'

export interface ApiError {
  status?: number
  message: string
  raw?: unknown
}

export const instance = axios.create(axiosConfig)

// 管理接口统一带上 token（静态图片不走这个实例，不受影响）
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

instance.interceptors.response.use(
  response => response.data,
  (error: AxiosError) => {
    const status = error.response?.status
    // 后端统一包了 { success:false, statusCode, message, error }
    const body = error.response?.data as { message?: unknown } | undefined
    const raw = body?.message
    let message = Array.isArray(raw) ? String(raw[0] ?? '') : typeof raw === 'string' ? raw : ''

    if (status === 401) {
      redirectToLogin()
      message = message || '登录已过期，请重新登录'
    } else if (status === 403) {
      // IP 黑白名单拦截：换账号也没用
      message = message || '来源 IP 已被限制访问'
    } else if (status === 413) {
      message = '文件超过大小限制'
    } else if (status === 429) {
      message = message || '操作过于频繁，请稍后再试'
    } else if (status === 400) {
      message = message || '请求参数有误（可能是文件格式或大小不符合要求）'
    } else if (!error.response) {
      message = error.code === 'ECONNABORTED' ? '请求超时' : '无法连接到服务器'
    }

    return Promise.reject({ status, message, raw: error } as ApiError)
  }
)
