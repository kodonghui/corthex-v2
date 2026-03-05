import type { ToolHandler } from '../types'

type SerperVideoItem = {
  title: string
  link: string
  channel: string
  duration: string
}

type SerperVideosResponse = {
  videos?: SerperVideoItem[]
}

export const searchYoutube: ToolHandler = async (input, ctx) => {
  const query = String(input.query || '')
  if (!query) return '검색어가 비어있습니다.'

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('serper')
  } catch {
    return JSON.stringify({
      query,
      results: [],
      message: '웹 검색 API 키가 등록되지 않았습니다. 설정에서 Serper API 키를 등록하세요.',
    })
  }

  try {
    const res = await fetch('https://google.serper.dev/videos', {
      method: 'POST',
      headers: {
        'X-API-KEY': creds.api_key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, num: 5 }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      return JSON.stringify({ query, results: [], message: `검색 API 오류: ${res.status}` })
    }

    const data = (await res.json()) as SerperVideosResponse
    const results = (data.videos || []).slice(0, 5).map((r) => ({
      title: r.title,
      url: r.link,
      channel: r.channel,
      duration: r.duration,
    }))

    return JSON.stringify({ query, results, count: results.length })
  } catch (err) {
    return JSON.stringify({
      query,
      results: [],
      message: `검색 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
