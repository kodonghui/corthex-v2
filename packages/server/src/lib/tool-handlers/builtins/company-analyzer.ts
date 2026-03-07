import type { ToolHandler } from '../types'

const DART_API = 'https://opendart.fss.or.kr/api'

type DartCompany = {
  corp_code?: string
  corp_name?: string
  stock_code?: string
  corp_cls?: string
  adres?: string
  ceo_nm?: string
  est_dt?: string
  hm_url?: string
}

type DartResponse = {
  status?: string
  message?: string
  list?: DartCompany[]
}

export const companyAnalyzer: ToolHandler = async (input, ctx) => {
  const action = String(input.action || 'info')

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('dart')
  } catch {
    return JSON.stringify({ success: false, message: 'DART API 키가 등록되지 않았습니다. 설정에서 등록하세요.' })
  }

  if (action === 'info') {
    const corpName = String(input.company || '')
    if (!corpName) return JSON.stringify({ success: false, message: '회사명(company)을 입력하세요.' })

    try {
      const params = new URLSearchParams({ crtfc_key: creds.api_key, corp_name: corpName })
      const res = await fetch(`${DART_API}/corpCode.xml?${params}`, { signal: AbortSignal.timeout(10_000) })

      if (!res.ok) {
        // Fallback: use company search API
        const searchParams = new URLSearchParams({ crtfc_key: creds.api_key, corp_name: corpName, page_count: '5' })
        const searchRes = await fetch(`${DART_API}/company.json?${searchParams}`, { signal: AbortSignal.timeout(10_000) })

        if (!searchRes.ok) {
          return JSON.stringify({ success: false, message: `DART API 오류: ${searchRes.status}` })
        }

        const data = (await searchRes.json()) as DartResponse
        if (data.status !== '000') {
          return JSON.stringify({ success: false, message: `DART 오류: ${data.message || '회사 정보를 찾을 수 없습니다.'}` })
        }

        return JSON.stringify({ success: true, query: corpName, results: data.list || [] })
      }

      return JSON.stringify({ success: true, query: corpName, message: '회사 코드 파일을 확인하세요.' })
    } catch (err) {
      return JSON.stringify({ success: false, message: `회사 정보 조회 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
    }
  }

  if (action === 'disclosures') {
    const corpCode = String(input.corp_code || '')
    if (!corpCode) return JSON.stringify({ success: false, message: '회사코드(corp_code)를 입력하세요.' })

    try {
      const params = new URLSearchParams({
        crtfc_key: creds.api_key,
        corp_code: corpCode,
        page_count: String(input.count || 10),
      })
      const res = await fetch(`${DART_API}/list.json?${params}`, { signal: AbortSignal.timeout(10_000) })

      if (!res.ok) return JSON.stringify({ success: false, message: `DART API 오류: ${res.status}` })

      const data = (await res.json()) as DartResponse
      if (data.status !== '000') {
        return JSON.stringify({ success: false, message: `DART 오류: ${data.message || '공시 정보를 찾을 수 없습니다.'}` })
      }

      return JSON.stringify({ success: true, corpCode, disclosures: data.list || [] })
    } catch (err) {
      return JSON.stringify({ success: false, message: `공시 조회 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
    }
  }

  return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. info 또는 disclosures를 사용하세요.` })
}
