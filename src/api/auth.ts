import { instance } from './instance'

export interface AdminStatus {
  initialized: boolean
}

export interface LoginResult {
  token: string
  expiresAt: string
  username: string
}

export const getAdminStatus = () =>
  instance.get('/admin/status') as unknown as Promise<AdminStatus>

export const setupAdmin = (username: string, password: string) =>
  instance.post('/admin/setup', { username, password }) as unknown as Promise<LoginResult>

export const login = (username: string, password: string) =>
  instance.post('/admin/login', { username, password }) as unknown as Promise<LoginResult>

export const logout = () => instance.post('/admin/logout') as unknown as Promise<void>

export const getMe = () =>
  instance.get('/admin/me') as unknown as Promise<{ id: number; username: string }>

export interface ChangeCredentialsPayload {
  currentPassword: string
  newUsername?: string
  newPassword?: string
}

export const changeCredentials = (payload: ChangeCredentialsPayload) =>
  instance.post('/admin/change-credentials', payload) as unknown as Promise<LoginResult>
