import type { ToolHandler } from '../types'

const LAW_API_BASE = 'https://www.law.go.kr/DRF/lawSearch.do'

function parseXmlTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g')
  const match = regex.exec(xml)
  return match?.[1]?.trim() || ''
}

function parseXmlItems(xml: string, itemTag: string, fields: string[]): Record<string, string>[] {
  const items: Record<string, string>[] = []
  const itemRegex = new RegExp(`<${itemTag}>([\\s\\S]*?)</${itemTag}>`, 'g')
  let match: RegExpExecArray | null
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1]
    const item: Record<string, string> = {}
    for (const field of fields) {
      item[field] = parseXmlTag(content, field)
    }
    items.push(item)
  }
  return items
}

export const lawSearch: ToolHandler = async (input, ctx) => {
  const action = String(input.action || 'law')

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('law')
  } catch {
    return JSON.stringify({ success: false, message: '법제처 API 키(LAW_API_KEY)가 등록되지 않았습니다. https://open.law.go.kr/ 에서 발급 후 설정하세요.' })
  }

  if (action === 'law') {
    const query = String(input.query || '')
    if (!query) return JSON.stringify({ success: false, message: "검색어(query)를 입력하세요. 예: '저작권법', '개인정보 보호'" })

    try {
      const params = new URLSearchParams({
        OC: creds.api_key,
        target: 'law',
        type: 'XML',
        query,
        display: String(input.count || 10),
      })

      const res = await fetch(`${LAW_API_BASE}?${params}`, { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) return JSON.stringify({ success: false, message: `법령정보 API 오류: ${res.status}` })

      const xml = await res.text()
      const items = parseXmlItems(xml, 'law', ['법령명한글', '법령일련번호', '공포일자', '시행일자', '법령구분명'])

      if (items.length === 0) {
        return JSON.stringify({ success: true, query, results: [], message: `'${query}' 관련 법령을 찾을 수 없습니다.` })
      }

      const results = items.map((item) => ({
        name: item['법령명한글'],
        id: item['법령일련번호'],
        promulgationDate: item['공포일자'],
        enforcementDate: item['시행일자'],
        type: item['법령구분명'],
      }))

      return JSON.stringify({ success: true, query, results, count: results.length })
    } catch (err) {
      return JSON.stringify({ success: false, message: `법령 검색 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
    }
  }

  if (action === 'precedent') {
    const query = String(input.query || '')
    if (!query) return JSON.stringify({ success: false, message: '판례 검색어(query)를 입력하세요.' })

    try {
      const params = new URLSearchParams({
        OC: creds.api_key,
        target: 'prec',
        type: 'XML',
        query,
        display: String(input.count || 10),
      })

      const res = await fetch(`${LAW_API_BASE}?${params}`, { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) return JSON.stringify({ success: false, message: `판례 API 오류: ${res.status}` })

      const xml = await res.text()
      const items = parseXmlItems(xml, 'prec', ['사건명', '사건번호', '선고일자', '법원명', '판례일련번호'])

      if (items.length === 0) {
        return JSON.stringify({ success: true, query, results: [], message: `'${query}' 관련 판례를 찾을 수 없습니다.` })
      }

      const results = items.map((item) => ({
        caseName: item['사건명'],
        caseNumber: item['사건번호'],
        decisionDate: item['선고일자'],
        court: item['법원명'],
        id: item['판례일련번호'],
      }))

      return JSON.stringify({ success: true, query, results, count: results.length })
    } catch (err) {
      return JSON.stringify({ success: false, message: `판례 검색 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
    }
  }

  return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. law 또는 precedent를 사용하세요.` })
}
