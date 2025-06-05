import axios from 'axios'
import { axiosConfig } from './config'

// 创建 axios 实例
export const instance = axios.create(axiosConfig)

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在这里可以添加认证信息等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 统一错误处理
    let errorMessage = '请求失败'
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = '请选择图片文件'
          break
        case 403:
          errorMessage = '上传大图片需要管理员密码或密码错误'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器错误'
          break
        default:
          errorMessage = `请求失败: ${error.response.status}`
      }
    } else if (error.request) {
      errorMessage = '无法连接到服务器'
    }
    return Promise.reject({
      message: errorMessage,
      error
    })
  }
)