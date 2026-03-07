import type { ToolHandler } from '../types'

type SerperSearchResult = {
  title?: string
  snippet?: string
  link?: string
}

type SerperResponse = {
  organic?: SerperSearchResult[]
  answerBox?: { answer?: string; snippet?: string; title?: string }
  knowledgeGraph?: { description?: string; attributes?: Record<string, string> }
}

export const marketOverview: ToolHandler = async (input, ctx) => {
  const action = String(input.action || 'domestic')

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('serper')
  } catch {
    return JSON.stringify({ success: false, message: '웹 검색 API 키가 등록되지 않았습니다. Serper API 키를 설정하세요.' })
  }

  const searchMarket = async (query: string): Promise<SerperResponse> => {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': creds.api_key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, gl: 'kr', hl: 'ko', num: 5 }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new Error(`검색 API 오류: ${res.status}`)
    return (await res.json()) as SerperResponse
  }

  try {
    if (action === 'domestic') {
      const [kospiData, kosdaqData] = await Promise.all([
        searchMarket('코스피 지수 현재'),
        searchMarket('코스닥 지수 현재'),
      ])

      return JSON.stringify({
        success: true,
        market: 'domestic',
        kospi: {
          snippet: kospiData.answerBox?.snippet || kospiData.organic?.[0]?.snippet || '정보 없음',
          source: kospiData.organic?.[0]?.title || '',
        },
        kosdaq: {
          snippet: kosdaqData.answerBox?.snippet || kosdaqData.organic?.[0]?.snippet || '정보 없음',
          source: kosdaqData.organic?.[0]?.title || '',
        },
      })
    }

    if (action === 'global') {
      const query = String(input.query || 'S&P 500 NASDAQ Dow Jones 실시간')
      const data = await searchMarket(query)

      const results = (data.organic || []).slice(0, 5).map((r) => ({
        title: r.title || '',
        snippet: r.snippet || '',
        url: r.link || '',
      }))

      return JSON.stringify({
        success: true,
        market: 'global',
        answerBox: data.answerBox?.snippet || null,
        results,
      })
    }

    if (action === 'search') {
      const query = String(input.query || '')
      if (!query) return JSON.stringify({ success: false, message: '검색어(query)를 입력하세요.' })

      const data = await searchMarket(query)
      const results = (data.organic || []).slice(0, 5).map((r) => ({
        title: r.title || '',
        snippet: r.snippet || '',
        url: r.link || '',
      }))

      return JSON.stringify({ success: true, query, answerBox: data.answerBox?.snippet || null, results })
    }

    return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. domestic, global, search를 사용하세요.` })
  } catch (err) {
    return JSON.stringify({ success: false, message: `시장 정보 조회 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
  }
}
