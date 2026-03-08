import type { ToolHandler } from '../types'

const DART_BASE = 'https://opendart.fss.or.kr/api'

type DartResponse = {
  status?: string
  message?: string
  list?: Array<Record<string, string>>
  // company.json returns flat fields
  corp_code?: string
  corp_name?: string
  corp_name_eng?: string
  stock_code?: string
  ceo_nm?: string
  corp_cls?: string
  induty_code?: string
  est_dt?: string
  adres?: string
  hm_url?: string
  ir_url?: string
  phn_no?: string
  fax_no?: string
}

export const dartApi: ToolHandler = async (input, ctx) => {
  const action = String(input.action || 'disclosure')

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('dart')
  } catch {
    return JSON.stringify({ success: false, message: 'DART API 키가 등록되지 않았습니다. 설정에서 등록하세요.' })
  }

  try {
    if (action === 'financial') {
      const corpCode = String(input.corpCode || '')
      if (!corpCode) return JSON.stringify({ success: false, message: '기업코드(corpCode)가 필요합니다. (예: 00126380)' })

      const year = String(input.year || new Date().getFullYear() - 1)
      // 11011=사업보고서, 11014=3분기, 11012=반기, 11013=1분기
      const reportCode = String(input.reportCode || '11011')

      const params = new URLSearchParams({
        crtfc_key: creds.api_key,
        corp_code: corpCode,
        bsns_year: year,
        reprt_code: reportCode,
      })

      const res = await fetch(`${DART_BASE}/fnlttSinglAcnt.json?${params}`, {
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) return JSON.stringify({ success: false, message: `DART API 오류: ${res.status}` })

      const data = (await res.json()) as DartResponse
      if (data.status !== '000') {
        return JSON.stringify({ success: false, message: `DART 오류: ${data.message || '재무제표를 찾을 수 없습니다.'}` })
      }

      // Parse financial items
      const items = (data.list || []).map((item) => ({
        accountName: item.account_nm || '',
        currentAmount: Number(item.thstrm_amount?.replace(/,/g, '') || 0),
        previousAmount: Number(item.frmtrm_amount?.replace(/,/g, '') || 0),
        beforePreviousAmount: Number(item.bfefrmtrm_amount?.replace(/,/g, '') || 0),
        statementType: item.sj_nm || '', // 재무상태표/손익계산서
      }))

      return JSON.stringify({
        success: true,
        action: 'financial',
        corpCode,
        year,
        reportCode,
        financials: items,
      })
    }

    if (action === 'company') {
      const corpCode = String(input.corpCode || '')
      if (!corpCode) return JSON.stringify({ success: false, message: '기업코드(corpCode)가 필요합니다.' })

      const params = new URLSearchParams({
        crtfc_key: creds.api_key,
        corp_code: corpCode,
      })

      const res = await fetch(`${DART_BASE}/company.json?${params}`, {
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) return JSON.stringify({ success: false, message: `DART API 오류: ${res.status}` })

      const data = (await res.json()) as DartResponse
      if (data.status !== '000') {
        return JSON.stringify({ success: false, message: `DART 오류: ${data.message || '기업 정보를 찾을 수 없습니다.'}` })
      }

      return JSON.stringify({
        success: true,
        action: 'company',
        corpCode: data.corp_code,
        corpName: data.corp_name,
        corpNameEng: data.corp_name_eng,
        stockCode: data.stock_code,
        ceo: data.ceo_nm,
        corpClass: data.corp_cls,
        industryCode: data.induty_code,
        establishedDate: data.est_dt,
        address: data.adres,
        homepage: data.hm_url,
        irUrl: data.ir_url,
        phone: data.phn_no,
        fax: data.fax_no,
      })
    }

    if (action === 'disclosure') {
      const corpCode = String(input.corpCode || '')
      if (!corpCode) return JSON.stringify({ success: false, message: '기업코드(corpCode)가 필요합니다.' })

      const count = String(input.count || 10)
      const startDate = String(input.startDate || '')
      const endDate = String(input.endDate || '')

      const paramObj: Record<string, string> = {
        crtfc_key: creds.api_key,
        corp_code: corpCode,
        page_count: count,
      }
      if (startDate) paramObj.bgn_de = startDate.replace(/-/g, '')
      if (endDate) paramObj.end_de = endDate.replace(/-/g, '')

      const params = new URLSearchParams(paramObj)

      const res = await fetch(`${DART_BASE}/list.json?${params}`, {
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) return JSON.stringify({ success: false, message: `DART API 오류: ${res.status}` })

      const data = (await res.json()) as DartResponse
      if (data.status !== '000') {
        return JSON.stringify({ success: false, message: `DART 오류: ${data.message || '공시를 찾을 수 없습니다.'}` })
      }

      const disclosures = (data.list || []).map((item) => ({
        corpName: item.corp_name || '',
        reportName: item.report_nm || '',
        receivedDate: item.rcept_dt || '',
        submitter: item.flr_nm || '',
        receiptNo: item.rcept_no || '',
        remark: item.rm || '',
      }))

      return JSON.stringify({
        success: true,
        action: 'disclosure',
        corpCode,
        count: disclosures.length,
        disclosures,
      })
    }

    return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. financial, company, disclosure를 사용하세요.` })
  } catch (err) {
    return JSON.stringify({ success: false, message: `DART API 조회 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
  }
}
