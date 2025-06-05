// API 配置
// export const API_BASE_URL = 'http://127.0.0.1:5888/api'
export const API_BASE_URL = 'https://wufeng98.cn/imgServerApi/api'

// axios 实例配置
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json'
  }
}
