<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { ApiError } from '../api/instance'

const auth = useAuthStore()

const form = reactive({
  currentPassword: '',
  newUsername: auth.username,
  newPassword: '',
  confirmPassword: ''
})

const saving = ref(false)
const okMessage = ref('')
const errorMessage = ref('')

async function submit() {
  okMessage.value = ''
  errorMessage.value = ''

  if (!form.currentPassword) {
    errorMessage.value = '请输入当前密码'
    return
  }
  if (form.newPassword && form.newPassword.length < 8) {
    errorMessage.value = '新密码至少 8 位'
    return
  }
  if (form.newPassword && form.newPassword !== form.confirmPassword) {
    errorMessage.value = '两次输入的新密码不一致'
    return
  }

  const usernameChanged = form.newUsername.trim() && form.newUsername.trim() !== auth.username
  if (!usernameChanged && !form.newPassword) {
    errorMessage.value = '用户名和密码都没有修改'
    return
  }

  saving.value = true
  try {
    await auth.changeCredentials({
      currentPassword: form.currentPassword,
      newUsername: usernameChanged ? form.newUsername.trim() : undefined,
      newPassword: form.newPassword || undefined
    })
    okMessage.value = '已保存。其它设备的登录会立即失效，需要重新登录。'
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (e) {
    errorMessage.value = (e as ApiError)?.message || '保存失败'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">账号设置</h1>

    <div v-if="okMessage" class="rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-3 py-2 text-sm text-green-700 dark:text-green-300">
      {{ okMessage }}
    </div>
    <div v-if="errorMessage" class="rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <section class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
      <h2 class="font-semibold mb-4 text-gray-800 dark:text-gray-100">修改用户名 / 密码</h2>
      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">当前密码</label>
          <input
            v-model="form.currentPassword"
            type="password"
            class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            placeholder="修改前需要验证当前密码"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">用户名</label>
          <input
            v-model="form.newUsername"
            class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">新密码</label>
          <input
            v-model="form.newPassword"
            type="password"
            class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            placeholder="留空表示不修改，至少 8 位"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">确认新密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
          />
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            class="px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60"
            :disabled="saving"
          >
            {{ saving ? '保存中…' : '保存' }}
          </button>
        </div>
      </form>
    </section>

    <section class="bg-white dark:bg-gray-800 rounded-lg shadow p-5 text-sm text-gray-600 dark:text-gray-400">
      <h2 class="font-semibold mb-2 text-gray-800 dark:text-gray-100">说明</h2>
      <ul class="list-disc pl-5 space-y-1">
        <li>密码用 scrypt 加盐哈希存储，后端不保存明文。</li>
        <li>保存后所有旧会话失效，当前页面会自动换上新凭证。</li>
        <li>账号存在本地 SQLite（<code>admin_users</code>），忘记密码需直接改库。</li>
      </ul>
    </section>
  </div>
</template>
