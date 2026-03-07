import type { ToolHandler } from '../types'

export const uptimeMonitor: ToolHandler = async (input) => {
  const action = String(input.action || 'check')

  if (action === 'check') {
    const url = String(input.url || '')
    if (!url) return JSON.stringify({ success: false, message: 'URL을 입력하세요.' })

    try {
      const parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return JSON.stringify({ success: false, message: 'http:// 또는 https:// URL만 지원합니다.' })
      }
    } catch {
      return JSON.stringify({ success: false, message: '올바른 URL 형식이 아닙니다.' })
    }

    try {
      const start = performance.now()
      const res = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10_000),
        redirect: 'follow',
      })
      const elapsed = Math.round(performance.now() - start)

      const isUp = res.status >= 200 && res.status < 400
      const slow = elapsed > 2000

      return JSON.stringify({
        success: true,
        url,
        status: isUp ? 'UP' : 'DOWN',
        statusCode: res.status,
        responseTimeMs: elapsed,
        slow,
        headers: {
          server: res.headers.get('server') || '',
          contentType: res.headers.get('content-type') || '',
        },
        message: isUp
          ? `${url} 정상 (${elapsed}ms)${slow ? ' - 응답 느림 경고' : ''}`
          : `${url} 다운 (HTTP ${res.status})`,
      })
    } catch (err) {
      return JSON.stringify({
        success: true,
        url,
        status: 'DOWN',
        statusCode: 0,
        responseTimeMs: -1,
        slow: false,
        message: `${url} 접속 불가: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
      })
    }
  }

  if (action === 'batch') {
    const urls = input.urls
    if (!Array.isArray(urls) || urls.length === 0) {
      return JSON.stringify({ success: false, message: 'URL 배열(urls)을 입력하세요.' })
    }

    const results = await Promise.allSettled(
      urls.slice(0, 20).map(async (rawUrl: unknown) => {
        const url = String(rawUrl || '')
        try {
          new URL(url)
        } catch {
          return { url, status: 'ERROR', statusCode: 0, responseTimeMs: -1, message: '잘못된 URL' }
        }

        try {
          const start = performance.now()
          const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10_000), redirect: 'follow' })
          const elapsed = Math.round(performance.now() - start)
          const isUp = res.status >= 200 && res.status < 400
          return { url, status: isUp ? 'UP' : 'DOWN', statusCode: res.status, responseTimeMs: elapsed }
        } catch (err) {
          return { url, status: 'DOWN', statusCode: 0, responseTimeMs: -1, message: err instanceof Error ? err.message : '오류' }
        }
      }),
    )

    const items = results.map((r) => (r.status === 'fulfilled' ? r.value : { url: '?', status: 'ERROR', statusCode: 0, responseTimeMs: -1 }))
    const upCount = items.filter((i) => i.status === 'UP').length

    return JSON.stringify({
      success: true,
      results: items,
      summary: { total: items.length, up: upCount, down: items.length - upCount },
    })
  }

  return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. check 또는 batch를 사용하세요.` })
}
