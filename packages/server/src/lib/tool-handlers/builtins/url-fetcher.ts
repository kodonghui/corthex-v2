import type { ToolHandler } from '../types'

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match ? match[1].trim() : ''
}

function extractMeta(html: string, name: string): string {
  const re = new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i')
  const match = html.match(re)
  if (match) return match[1]
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, 'i')
  const match2 = html.match(re2)
  return match2 ? match2[1] : ''
}

export const urlFetcher: ToolHandler = async (input) => {
  const action = String(input.action || 'get')
  const url = String(input.url || '')

  if (!url) return 'URL을 입력하세요.'
  if (!/^https?:\/\//i.test(url)) return 'URL은 http:// 또는 https://로 시작해야 합니다.'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    switch (action) {
      case 'get': {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'CorthexBot/2.0' },
        })
        const contentType = res.headers.get('content-type') || ''
        const text = await res.text()
        const maxLen = 4000
        const truncated = text.length > maxLen ? text.slice(0, maxLen) + '\n...(truncated)' : text

        return JSON.stringify({
          url,
          status: res.status,
          contentType,
          length: text.length,
          content: truncated,
        })
      }

      case 'head': {
        const res = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: { 'User-Agent': 'CorthexBot/2.0' },
        })
        const headers: Record<string, string> = {}
        res.headers.forEach((v, k) => { headers[k] = v })
        return JSON.stringify({ url, status: res.status, headers })
      }

      case 'extract_text': {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'CorthexBot/2.0' },
        })
        const html = await res.text()
        const title = extractTitle(html)
        const description = extractMeta(html, 'description') || extractMeta(html, 'og:description')
        const text = stripHtml(html)
        const maxLen = 4000
        const truncated = text.length > maxLen ? text.slice(0, maxLen) + '...' : text

        return JSON.stringify({
          url,
          title,
          description,
          text: truncated,
          textLength: text.length,
        })
      }

      default:
        return '지원하지 않는 action입니다. (get, head, extract_text)'
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return JSON.stringify({ url, error: '요청 시간이 초과되었습니다. (10초)' })
    }
    return JSON.stringify({
      url,
      error: `요청 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  } finally {
    clearTimeout(timeout)
  }
}
