<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { ApiError } from '../api/instance'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({ username: '', password: '', confirm: '' })

const isSetup = computed(() => auth.initialized === false)
const title = computed(() => (isSetup.value ? '设置管理员账号' : '管理员登录'))
const hint = computed(() =>
  isSetup.value
    ? '第一次使用，请先创建管理员账号。创建后这个页面会变成登录页。'
    : '上传图片、查看列表都需要管理员登录'
)

onMounted(async () => {
  try {
    await auth.fetchStatus()
  } catch (e) {
    errorMessage.value = (e as ApiError).message || '无法连接后端服务'
  } finally {
    loading.value = false
  }
})

async function submit() {
  errorMessage.value = ''
  if (!form.username.trim() || !form.password) {
    errorMessage.value = '请填写用户名和密码'
    return
  }
  if (isSetup.value) {
    if (form.password.length < 8) {
      errorMessage.value = '密码至少 8 位'
      return
    }
    if (form.password !== form.confirm) {
      errorMessage.value = '两次输入的密码不一致'
      return
    }
  }

  submitting.value = true
  try {
    if (isSetup.value) await auth.setup(form.username.trim(), form.password)
    else await auth.login(form.username.trim(), form.password)
    router.replace('/')
  } catch (e) {
    errorMessage.value = (e as ApiError).message || '操作失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-100 text-center">图床管理后台</h1>
      <p class="mt-2 mb-6 text-sm text-center text-gray-500 dark:text-gray-400">{{ hint }}</p>

      <div v-if="loading" class="py-8 text-center text-gray-500">加载中…</div>

      <form v-else class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">用户名</label>
          <input
            v-model="form.username"
            class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="例如 admin"
            autocomplete="username"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="至少 8 位，不能是纯数字"
            autocomplete="current-password"
          />
        </div>

        <div v-if="isSetup">
          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">确认密码</label>
          <input
            v-model="form.confirm"
            type="password"
            class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="再输入一次"
          />
        </div>

        <div
          v-if="errorMessage"
          class="rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300"
        >
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          class="w-full py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-60"
          :disabled="submitting"
        >
          {{ submitting ? '处理中…' : isSetup ? '创建并登录' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>
