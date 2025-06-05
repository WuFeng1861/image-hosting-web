/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise 复制是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy text: ', error)
    // 备用方案: 创建临时元素并执行复制
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-999999px'
      textarea.style.top = '-999999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch (fallbackError) {
      console.error('Fallback copy failed: ', fallbackError)
      return false
    }
  }
}