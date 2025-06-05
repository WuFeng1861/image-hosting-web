import { format } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化日期
 * @param date 日期字符串或时间戳
 * @param pattern 格式
 * @param locale 语言
 * @returns 格式化后的日期
 */
export function formatDate(date: Date | string | number, pattern = 'yyyy-MM-dd HH:mm', locale = 'zh-CN'): string {
  // 处理无效日期
  if (!date) {
    return '-'
  }
  
  const dateObj = new Date(date)
  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    return '-'
  }
  
  return format(dateObj, pattern, { locale: locale === 'zh-CN' ? zhCN : enUS })
}

/**
 * 缩短文件名
 * @param filename 文件名
 * @param maxLength 最大长度
 * @returns 处理后的文件名
 */
export function shortenFilename(filename: string, maxLength = 20): string {
  // 处理空文件名
  if (!filename) {
    return '-'
  }
  
  // 解码文件名中的 URI 编码字符
  try {
    filename = decodeURIComponent(filename)
  } catch (e) {
    console.warn('Failed to decode filename:', e)
  }
  
  if (filename.length <= maxLength) return filename
  
  const ext = filename.split('.').pop() || ''
  const name = filename.substring(0, filename.length - ext.length - 1)
  
  if (name.length <= maxLength - 3 - ext.length) return filename
  
  return name.substring(0, maxLength - 3 - ext.length) + '...' + (ext ? '.' + ext : '')
}
