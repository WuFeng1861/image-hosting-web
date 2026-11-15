import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '../api/auth'
import { clearToken, getStoredUser, getToken, setStoredUser, setToken } from '../api/token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getToken())
  const username = ref(getStoredUser())
  /** null = 未查询；true/false = 后端是否已设置管理员 */
  const initialized = ref<boolean | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  function remember(result: authApi.LoginResult) {
    token.value = result.token
    username.value = result.username
    setToken(result.token)
    setStoredUser(result.username)
  }

  async function fetchStatus(): Promise<boolean> {
    // 后端 GET /admin/status 返回 { success:true, data:{ initialized } }
    const res = (await authApi.getAdminStatus()) as unknown as { data?: { initialized: boolean } }
    const initializedValue = res?.data?.initialized ?? (res as unknown as { initialized: boolean }).initialized
    initialized.value = !!initializedValue
    return initialized.value
  }

  async function setup(user: string, pass: string) {
    const res = (await authApi.setupAdmin(user, pass)) as unknown as {
      data?: authApi.LoginResult
    } & authApi.LoginResult
    remember((res.data ?? res) as authApi.LoginResult)
    initialized.value = true
  }

  async function login(user: string, pass: string) {
    const res = (await authApi.login(user, pass)) as unknown as {
      data?: authApi.LoginResult
    } & authApi.LoginResult
    remember((res.data ?? res) as authApi.LoginResult)
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // 后端已失效也不影响本地清理
    }
    token.value = ''
    username.value = ''
    clearToken()
  }

  async function changeCredentials(payload: authApi.ChangeCredentialsPayload) {
    const res = (await authApi.changeCredentials(payload)) as unknown as {
      data?: authApi.LoginResult
    } & authApi.LoginResult
    remember((res.data ?? res) as authApi.LoginResult)
  }

  return { token, username, initialized, isLoggedIn, fetchStatus, setup, login, logout, changeCredentials }
})
