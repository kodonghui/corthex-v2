import type { ToolHandler } from '../types'

const KIPRIS_BASE = 'http://plus.kipris.or.kr/kipo-api/kipi'

function parseXmlTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)
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

export const patentSearch: ToolHandler = async (input, ctx) => {
  const action = String(input.action || 'search')

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('kipris')
  } catch {
    return JSON.stringify({ success: false, message: 'KIPRIS API 키가 등록되지 않았습니다. 특허정보원에서 발급 후 설정하세요.' })
  }

  if (action === 'search') {
    const query = String(input.query || '')
    if (!query) return JSON.stringify({ success: false, message: '검색어(query)를 입력하세요.' })

    try {
      const params = new URLSearchParams({
        ServiceKey: creds.api_key,
        word: query,
        numOfRows: String(input.count || 10),
        pageNo: '1',
      })

      const res = await fetch(`${KIPRIS_BASE}/patUtiModInfoSearchSevice/getAdvancedSearch?${params}`, {
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) return JSON.stringify({ success: false, message: `KIPRIS API 오류: ${res.status}` })

      const xml = await res.text()
      const items = parseXmlItems(xml, 'item', [
        'inventionTitle', 'applicationNumber', 'applicationDate',
        'applicantName', 'ipcNumber', 'registerStatus',
      ])

      if (items.length === 0) {
        return JSON.stringify({ success: true, query, results: [], message: `'${query}' 관련 특허를 찾을 수 없습니다.` })
      }

      const results = items.map((item) => ({
        title: item.inventionTitle,
        applicationNumber: item.applicationNumber,
        applicationDate: item.applicationDate,
        applicant: item.applicantName,
        ipc: item.ipcNumber,
        status: item.registerStatus,
      }))

      return JSON.stringify({ success: true, query, results, count: results.length })
    } catch (err) {
      return JSON.stringify({ success: false, message: `특허 검색 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
    }
  }

  if (action === 'trademark') {
    const query = String(input.query || '')
    if (!query) return JSON.stringify({ success: false, message: '상표 검색어(query)를 입력하세요.' })

    try {
      const params = new URLSearchParams({
        ServiceKey: creds.api_key,
        searchString: query,
        numOfRows: String(input.count || 10),
        pageNo: '1',
      })

      const res = await fetch(`${KIPRIS_BASE}/trademarkInfoSearchService/getAdvancedSearch?${params}`, {
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) return JSON.stringify({ success: false, message: `KIPRIS API 오류: ${res.status}` })

      const xml = await res.text()
      const items = parseXmlItems(xml, 'item', [
        'title', 'applicationNumber', 'applicationDate',
        'applicantName', 'registrationNumber', 'registrationDate',
      ])

      if (items.length === 0) {
        return JSON.stringify({ success: true, query, results: [], message: `'${query}' 관련 상표를 찾을 수 없습니다.` })
      }

      const results = items.map((item) => ({
        title: item.title,
        applicationNumber: item.applicationNumber,
        applicationDate: item.applicationDate,
        applicant: item.applicantName,
        registrationNumber: item.registrationNumber,
        registrationDate: item.registrationDate,
      }))

      return JSON.stringify({ success: true, query, results, count: results.length })
    } catch (err) {
      return JSON.stringify({ success: false, message: `상표 검색 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
    }
  }

  return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. search 또는 trademark를 사용하세요.` })
}
