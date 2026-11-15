/**
 * 管理员 token 的读写与跳转。
 * 单独放一个文件，避免 instance.ts 和页面互相 import 造成循环依赖。
 */
const TOKEN_KEY = 'img_admin_token'
const USER_KEY = 'img_admin_user'

/** 前端挂在 /imgweb/ 下 */
const APP_BASE = '/imgweb/'

export const getToken = (): string => localStorage.getItem(TOKEN_KEY) || ''

export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token)

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getStoredUser = (): string => localStorage.getItem(USER_KEY) || ''

export const setStoredUser = (name: string): void => localStorage.setItem(USER_KEY, name)

export function redirectToLogin(): void {
  clearToken()
  if (!window.location.pathname.startsWith(`${APP_BASE}login`)) {
    window.location.replace(`${APP_BASE}login`)
  }
}
