import { instance } from './instance'

/** 后端所有响应都包了一层 { success, data }，这里统一拆开 */
const unwrap = <T>(res: unknown): T => {
  const body = res as { data?: T } & T
  return (body && typeof body === 'object' && 'data' in body ? (body.data as T) : (body as T))
}

export type IpRuleMode = 'black' | 'white'

export interface IpRule {
  id: number
  pattern: string
  mode: IpRuleMode
  note?: string | null
  hitCount?: number
  lastHitAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Paged<T> {
  items: T[]
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}

export interface IpFilterSettings {
  blacklistEnabled: boolean
  whitelistEnabled: boolean
}

export interface RequestLog {
  id: number
  ip: string
  method: string
  path: string
  status: number
  blocked: number
  userAgent?: string
  createdAt: string
}

export interface RequestStat {
  ip: string
  total: number
  blocked: number
  lastSeen: string
  lastPath: string
}

/* ---------------- 名单 ---------------- */

export const listIpRules = async (
  params: { page?: number; limit?: number; mode?: IpRuleMode; q?: string } = {}
): Promise<Paged<IpRule>> => unwrap<Paged<IpRule>>(await instance.get('/admin/ip-rules', { params }))

export const createIpRule = async (payload: { pattern: string; mode: IpRuleMode; note?: string }) =>
  unwrap<IpRule>(await instance.post('/admin/ip-rules', payload))

/** 传 mode='white' 就是「黑名单转白名单」 */
export const updateIpRule = async (id: number, payload: { mode?: IpRuleMode; note?: string }) =>
  unwrap<IpRule>(await instance.patch(`/admin/ip-rules/${id}`, payload))

export const promoteIpRule = async (id: number) =>
  unwrap<IpRule>(await instance.post(`/admin/ip-rules/${id}/promote`))

export const deleteIpRule = async (id: number): Promise<void> => {
  await instance.delete(`/admin/ip-rules/${id}`)
}

/* ---------------- 开关 ---------------- */

export const getIpFilterSettings = async (): Promise<IpFilterSettings> =>
  unwrap<IpFilterSettings>(await instance.get('/admin/ip-filter/settings'))

export const updateIpFilterSettings = async (payload: Partial<IpFilterSettings>) =>
  unwrap<IpFilterSettings>(await instance.patch('/admin/ip-filter/settings', payload))

/* ---------------- 访问记录 ---------------- */

export const listRequests = async (
  params: { page?: number; limit?: number; ip?: string; onlyBlocked?: string } = {}
): Promise<Paged<RequestLog>> => unwrap<Paged<RequestLog>>(await instance.get('/admin/requests', { params }))

export const requestStats = async (
  params: { days?: number; limit?: number } = {}
): Promise<{ days: number; total: number; items: RequestStat[] }> =>
  unwrap(await instance.get('/admin/requests/stats', { params }))
