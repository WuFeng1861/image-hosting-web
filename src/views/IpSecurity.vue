<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  createIpRule,
  deleteIpRule,
  getIpFilterSettings,
  listIpRules,
  listRequests,
  promoteIpRule,
  requestStats,
  updateIpFilterSettings,
  type IpFilterSettings,
  type IpRule,
  type IpRuleMode,
  type RequestLog,
  type RequestStat
} from '../api/ipSecurity'
import type { ApiError } from '../api/instance'

/* ---------- 开关 ---------- */
const settings = reactive<IpFilterSettings>({ blacklistEnabled: true, whitelistEnabled: false })
const settingsLoading = ref(false)

/* ---------- 名单 ---------- */
const rules = ref<IpRule[]>([])
const rulesLoading = ref(false)
const ruleTotal = ref(0)
const rulePage = ref(1)
const rulePrefix = ref('')

const newRule = reactive({ pattern: '', mode: 'black' as IpRuleMode, note: '' })
const creating = ref(false)

/* ---------- 批量导入 ---------- */
const batchText = ref('')
const batchMode = ref<IpRuleMode>('black')
const batchRunning = ref(false)
const batchResult = ref<{ ok: number; failed: string[] } | null>(null)
const showBatch = ref(false)

/* ---------- 访问记录 ---------- */
const stats = ref<RequestStat[]>([])
const statsLoading = ref(false)
const statsDays = ref(7)

const logs = ref<RequestLog[]>([])
const logsLoading = ref(false)
const logsTotal = ref(0)
const logsPage = ref(1)
const onlyBlocked = ref(true)

const message = ref('')
const errorMessage = ref('')

const notify = (text: string) => {
  message.value = text
  window.setTimeout(() => (message.value = ''), 3000)
}
const fail = (e: unknown) => {
  errorMessage.value = (e as ApiError)?.message || '操作失败'
  window.setTimeout(() => (errorMessage.value = ''), 5000)
}

async function loadSettings() {
  settingsLoading.value = true
  try {
    Object.assign(settings, await getIpFilterSettings())
  } catch (e) {
    fail(e)
  } finally {
    settingsLoading.value = false
  }
}

async function loadRules() {
  rulesLoading.value = true
  try {
    const res = await listIpRules({ page: rulePage.value, limit: 20 })
    rules.value = res.items
    ruleTotal.value = res.meta.totalItems
  } catch (e) {
    fail(e)
  } finally {
    rulesLoading.value = false
  }
}

async function loadStats() {
  statsLoading.value = true
  try {
    stats.value = (await requestStats({ days: statsDays.value, limit: 30 })).items
  } catch (e) {
    fail(e)
  } finally {
    statsLoading.value = false
  }
}

async function loadLogs() {
  logsLoading.value = true
  try {
    const res = await listRequests({
      page: logsPage.value,
      limit: 20,
      onlyBlocked: onlyBlocked.value ? '1' : undefined
    })
    logs.value = res.items
    logsTotal.value = res.meta.totalItems
  } catch (e) {
    fail(e)
  } finally {
    logsLoading.value = false
  }
}

onMounted(() => {
  void loadSettings()
  void loadRules()
  void loadStats()
  void loadLogs()
})

async function toggle(key: 'blacklistEnabled' | 'whitelistEnabled') {
  try {
    Object.assign(settings, await updateIpFilterSettings({ [key]: !settings[key] }))
    notify('开关已保存')
  } catch (e) {
    fail(e)
  }
}

async function addRule() {
  const pattern = newRule.pattern.trim()
  if (!pattern) {
    fail({ message: '请填写 IP 或网段' })
    return
  }
  creating.value = true
  try {
    await createIpRule({ pattern, mode: newRule.mode, note: newRule.note.trim() || undefined })
    newRule.pattern = ''
    newRule.note = ''
    notify('已添加')
    await loadRules()
  } catch (e) {
    fail(e)
  } finally {
    creating.value = false
  }
}

async function promote(row: IpRule) {
  try {
    await promoteIpRule(row.id)
    notify(`${row.pattern} 已转为白名单`)
    await loadRules()
  } catch (e) {
    fail(e)
  }
}

async function remove(row: IpRule) {
  if (!window.confirm(`删除规则 ${row.pattern}？`)) return
  try {
    await deleteIpRule(row.id)
    notify('已删除')
    await loadRules()
  } catch (e) {
    fail(e)
  }
}

function prevRulePage() {
  if (rulePage.value <= 1) return
  rulePage.value -= 1
  void loadRules()
}

function nextRulePage() {
  if (rulePage.value * 20 >= ruleTotal.value) return
  rulePage.value += 1
  void loadRules()
}

function prevLogsPage() {
  if (logsPage.value <= 1) return
  logsPage.value -= 1
  void loadLogs()
}

function nextLogsPage() {
  if (logsPage.value * 20 >= logsTotal.value) return
  logsPage.value += 1
  void loadLogs()
}

function onBlockedFilterChange() {
  logsPage.value = 1
  void loadLogs()
}

function parseBatchInput(text: string): string[] {
  const parts = text
    .split(/[\s,;，；]+/)
    .map((t) => t.trim())
    .filter(Boolean)
  return Array.from(new Set(parts))
}

async function runBatch() {
  const list = parseBatchInput(batchText.value)
  if (!list.length) {
    batchResult.value = { ok: 0, failed: ['没有解析到有效的 IP'] }
    return
  }
  if (list.length > 200) {
    batchResult.value = { ok: 0, failed: [`一次最多 200 条，当前 ${list.length} 条`] }
    return
  }

  batchRunning.value = true
  batchResult.value = null
  let ok = 0
  const failed: string[] = []

  for (const pattern of list) {
    try {
      await createIpRule({ pattern, mode: batchMode.value })
      ok += 1
    } catch (err) {
      failed.push(`${pattern}：${(err as ApiError)?.message || '失败'}`)
    }
  }

  batchResult.value = { ok, failed }
  batchRunning.value = false
  await loadRules()
}

function blockIp(ip: string) {
  newRule.pattern = ip
  newRule.mode = 'black'
  newRule.note = '从访问记录加入'
  notify('已填入黑名单输入框，确认后点「添加」')
}

const fmt = (v?: string | null) => (v ? new Date(v).toLocaleString() : '-')
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">IP 名单</h1>

    <div v-if="message" class="rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-3 py-2 text-sm text-green-700 dark:text-green-300">
      {{ message }}
    </div>
    <div v-if="errorMessage" class="rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <!-- 开关 -->
    <section class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
      <h2 class="font-semibold mb-3 text-gray-800 dark:text-gray-100">过滤开关</h2>
      <div v-if="settingsLoading" class="text-sm text-gray-500">加载中…</div>
      <div v-else class="space-y-3">
        <label class="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" class="mt-1 h-4 w-4" :checked="settings.blacklistEnabled" @change="toggle('blacklistEnabled')" />
          <span>
            <span class="font-medium text-gray-800 dark:text-gray-100">黑名单生效</span>
            <span class="block text-sm text-gray-500 dark:text-gray-400">命中黑名单的 IP 直接 403；管理接口不受影响，避免把自己锁在门外</span>
          </span>
        </label>
        <label class="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" class="mt-1 h-4 w-4" :checked="settings.whitelistEnabled" @change="toggle('whitelistEnabled')" />
          <span>
            <span class="font-medium text-gray-800 dark:text-gray-100">白名单生效</span>
            <span class="block text-sm text-gray-500 dark:text-gray-400">开启后只放行白名单；白名单为空时不生效</span>
          </span>
        </label>
      </div>
    </section>

    <!-- 新增 -->
    <section class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
      <h2 class="font-semibold mb-3 text-gray-800 dark:text-gray-100">添加规则</h2>
      <div class="flex flex-col sm:flex-row gap-3">
        <input
          v-model="newRule.pattern"
          class="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
          placeholder="IP 或网段，例如 203.0.113.9 / 198.51.100.0/24"
        />
        <select
          v-model="newRule.mode"
          class="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
        >
          <option value="black">黑名单</option>
          <option value="white">白名单</option>
        </select>
        <input
          v-model="newRule.note"
          class="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
          placeholder="备注（可选）"
        />
        <button
          class="px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60"
          :disabled="creating"
          @click="addRule"
        >
          {{ creating ? '提交中…' : '添加' }}
        </button>
      </div>
    </section>

    <!-- 批量导入 -->
    <section class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold text-gray-800 dark:text-gray-100">批量导入</h2>
        <button class="text-sm text-primary-600 hover:underline" @click="showBatch = !showBatch">
          {{ showBatch ? '收起' : '展开' }}
        </button>
      </div>

      <div v-if="showBatch" class="space-y-3">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          每行一个 IP 或网段（也可用逗号分隔），自动去重，一次最多 200 条。
        </p>
        <textarea
          v-model="batchText"
          rows="6"
          class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-mono"
          placeholder="203.0.113.9&#10;198.51.100.0/24&#10;192.0.2.15"
        ></textarea>

        <div class="flex flex-wrap items-center gap-3">
          <select
            v-model="batchMode"
            class="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
          >
            <option value="black">加入黑名单</option>
            <option value="white">加入白名单</option>
          </select>
          <button
            class="px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60"
            :disabled="batchRunning"
            @click="runBatch"
          >
            {{ batchRunning ? '导入中…' : '开始导入' }}
          </button>
        </div>

        <div v-if="batchResult" class="text-sm">
          <div class="text-green-600 dark:text-green-400">成功 {{ batchResult.ok }} 条</div>
          <div v-if="batchResult.failed.length" class="mt-2 text-red-600 dark:text-red-400">
            <div>失败 {{ batchResult.failed.length }} 条：</div>
            <ul class="mt-1 max-h-32 overflow-y-auto list-disc pl-5 space-y-1">
              <li v-for="(msg, i) in batchResult.failed" :key="i">{{ msg }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 名单 -->
    <section class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold text-gray-800 dark:text-gray-100">
          规则列表（{{ ruleTotal }}）
        </h2>
        <button class="text-sm text-primary-600 hover:underline" @click="loadRules">刷新</button>
      </div>

      <div v-if="rulesLoading" class="text-sm text-gray-500 py-4">加载中…</div>
      <div v-else-if="!rules.length" class="text-sm text-gray-500 py-4">还没有规则</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="py-2 pr-4">IP / 网段</th>
              <th class="py-2 pr-4">类型</th>
              <th class="py-2 pr-4">备注</th>
              <th class="py-2 pr-4">命中</th>
              <th class="py-2 pr-4">最近命中</th>
              <th class="py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rules" :key="row.id" class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4 font-mono">{{ row.pattern }}</td>
              <td class="py-2 pr-4">{{ row.mode === 'black' ? '黑名单' : '白名单' }}</td>
              <td class="py-2 pr-4">{{ row.note || '-' }}</td>
              <td class="py-2 pr-4">{{ row.hitCount ?? 0 }}</td>
              <td class="py-2 pr-4">{{ fmt(row.lastHitAt) }}</td>
              <td class="py-2 text-right space-x-3">
                <button v-if="row.mode === 'black'" class="text-primary-600 hover:underline" @click="promote(row)">
                  转白名单
                </button>
                <button class="text-red-600 hover:underline" @click="remove(row)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-3 flex items-center justify-end gap-2 text-sm text-gray-500">
        <button class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40" :disabled="rulePage <= 1" @click="prevRulePage">
          上一页
        </button>
        <span>{{ rulePage }}</span>
        <button class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40" :disabled="rulePage * 20 >= ruleTotal" @click="nextRulePage">
          下一页
        </button>
      </div>
    </section>

    <!-- 可疑 IP -->
    <section class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold text-gray-800 dark:text-gray-100">可疑 IP（按请求数）</h2>
        <select
          v-model.number="statsDays"
          class="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          @change="loadStats"
        >
          <option :value="1">最近 1 天</option>
          <option :value="7">最近 7 天</option>
          <option :value="30">最近 30 天</option>
        </select>
      </div>

      <div v-if="statsLoading" class="text-sm text-gray-500 py-4">加载中…</div>
      <div v-else-if="!stats.length" class="text-sm text-gray-500 py-4">暂无访问记录</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="py-2 pr-4">IP</th>
              <th class="py-2 pr-4">请求数</th>
              <th class="py-2 pr-4">被拦</th>
              <th class="py-2 pr-4">最后访问</th>
              <th class="py-2 pr-4">时间</th>
              <th class="py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in stats" :key="row.ip" class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4 font-mono">{{ row.ip }}</td>
              <td class="py-2 pr-4">{{ row.total }}</td>
              <td class="py-2 pr-4">{{ row.blocked }}</td>
              <td class="py-2 pr-4 text-gray-500">{{ row.lastPath }}</td>
              <td class="py-2 pr-4">{{ row.lastSeen }}</td>
              <td class="py-2 text-right">
                <button class="text-red-600 hover:underline" @click="blockIp(row.ip)">拉黑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 访问明细 -->
    <section class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold text-gray-800 dark:text-gray-100">访问明细（{{ logsTotal }}）</h2>
        <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input v-model="onlyBlocked" type="checkbox" class="h-4 w-4" @change="onBlockedFilterChange" />
          只看被拦截
        </label>
      </div>

      <div v-if="logsLoading" class="text-sm text-gray-500 py-4">加载中…</div>
      <div v-else-if="!logs.length" class="text-sm text-gray-500 py-4">暂无记录</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="py-2 pr-4">IP</th>
              <th class="py-2 pr-4">方法</th>
              <th class="py-2 pr-4">路径</th>
              <th class="py-2 pr-4">状态码</th>
              <th class="py-2 pr-4">拦截</th>
              <th class="py-2 pr-4">时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in logs" :key="row.id" class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4 font-mono">{{ row.ip }}</td>
              <td class="py-2 pr-4">{{ row.method }}</td>
              <td class="py-2 pr-4 text-gray-500">{{ row.path }}</td>
              <td class="py-2 pr-4">{{ row.status }}</td>
              <td class="py-2 pr-4">{{ row.blocked ? '是' : '否' }}</td>
              <td class="py-2 pr-4">{{ fmt(row.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-3 flex items-center justify-end gap-2 text-sm text-gray-500">
        <button class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40" :disabled="logsPage <= 1" @click="prevLogsPage">
          上一页
        </button>
        <span>{{ logsPage }}</span>
        <button class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40" :disabled="logsPage * 20 >= logsTotal" @click="nextLogsPage">
          下一页
        </button>
      </div>
    </section>
  </div>
</template>
