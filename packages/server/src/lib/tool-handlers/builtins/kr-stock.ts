import type { ToolHandler } from '../types'
import { getKisToken, kisHeaders, KIS_BASE_URL, KIS_TR_IDS } from './kis-auth'

type KisResponse = {
  output?: Record<string, string>
  output1?: Array<Record<string, string>>
  output2?: Array<Record<string, string>>
  rt_cd?: string
  msg1?: string
}

export const krStock: ToolHandler = async (input, ctx) => {
  const action = String(input.action || 'price')

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('kis')
  } catch {
    return JSON.stringify({ success: false, message: 'KIS 증권 API 키가 등록되지 않았습니다. 설정에서 등록하세요.' })
  }

  try {
    const token = await getKisToken(creds.app_key, creds.app_secret)

    if (action === 'price') {
      const stockCode = String(input.stockCode || '')
      if (!stockCode) return JSON.stringify({ success: false, message: '종목코드(stockCode)가 필요합니다. (예: 005930)' })

      const params = new URLSearchParams({
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_INPUT_ISCD: stockCode,
      })

      const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?${params}`, {
        headers: kisHeaders(token, creds.app_key, creds.app_secret, KIS_TR_IDS.price.domestic),
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) return JSON.stringify({ success: false, message: `KIS API 오류: ${res.status}` })

      const data = (await res.json()) as KisResponse
      if (data.rt_cd !== '0') return JSON.stringify({ success: false, message: `KIS 오류: ${data.msg1}` })

      const o = data.output || {}
      return JSON.stringify({
        success: true,
        action: 'price',
        stockCode,
        name: o.hts_kor_isnm || stockCode,
        currentPrice: Number(o.stck_prpr || 0),
        change: Number(o.prdy_vrss || 0),
        changeRate: `${o.prdy_ctrt || '0'}%`,
        volume: Number(o.acml_vol || 0),
        open: Number(o.stck_oprc || 0),
        high: Number(o.stck_hgpr || 0),
        low: Number(o.stck_lwpr || 0),
        prevClose: Number(o.stck_sdpr || 0),
        marketCap: Number(o.hts_avls || 0),
      })
    }

    if (action === 'chart') {
      const stockCode = String(input.stockCode || '')
      if (!stockCode) return JSON.stringify({ success: false, message: '종목코드(stockCode)가 필요합니다.' })

      const days = Number(input.days || 100)
      const endDate = String(input.endDate || formatDate(new Date()))
      const startDate = String(input.startDate || formatDate(daysAgo(days)))

      const params = new URLSearchParams({
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_INPUT_ISCD: stockCode,
        FID_INPUT_DATE_1: startDate.replace(/-/g, ''),
        FID_INPUT_DATE_2: endDate.replace(/-/g, ''),
        FID_PERIOD_DIV_CODE: 'D',
        FID_ORG_ADJ_PRC: '0',
      })

      const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice?${params}`, {
        headers: kisHeaders(token, creds.app_key, creds.app_secret, KIS_TR_IDS.price.domesticDaily),
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) return JSON.stringify({ success: false, message: `KIS API 오류: ${res.status}` })

      const data = (await res.json()) as KisResponse
      if (data.rt_cd !== '0') return JSON.stringify({ success: false, message: `KIS 오류: ${data.msg1}` })

      const ohlcv = (data.output2 || []).map((item) => ({
        date: item.stck_bsop_date || '',
        open: Number(item.stck_oprc || 0),
        high: Number(item.stck_hgpr || 0),
        low: Number(item.stck_lwpr || 0),
        close: Number(item.stck_clpr || 0),
        volume: Number(item.acml_vol || 0),
      })).filter((item) => item.date).reverse() // 최신→과거 → 과거→최신

      return JSON.stringify({
        success: true,
        action: 'chart',
        stockCode,
        period: `${startDate} ~ ${endDate}`,
        count: ohlcv.length,
        data: ohlcv,
      })
    }

    if (action === 'indices') {
      const indexCode = String(input.indexCode || 'all')

      const codes: Array<{ code: string; name: string }> = []
      if (indexCode === 'all' || indexCode === 'kospi') codes.push({ code: '0001', name: 'KOSPI' })
      if (indexCode === 'all' || indexCode === 'kosdaq') codes.push({ code: '1001', name: 'KOSDAQ' })

      if (codes.length === 0) {
        return JSON.stringify({ success: false, message: 'indexCode는 "kospi", "kosdaq", 또는 "all"이어야 합니다.' })
      }

      const results = await Promise.all(codes.map(async ({ code, name }) => {
        const params = new URLSearchParams({
          FID_COND_MRKT_DIV_CODE: 'U',
          FID_INPUT_ISCD: code,
        })

        const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-index-price?${params}`, {
          headers: kisHeaders(token, creds.app_key, creds.app_secret, 'FHPUP02100000'),
          signal: AbortSignal.timeout(15_000),
        })

        if (!res.ok) return { name, error: `HTTP ${res.status}` }

        const data = (await res.json()) as KisResponse
        if (data.rt_cd !== '0') return { name, error: data.msg1 || '조회 실패' }

        const o = data.output || {}
        return {
          name,
          value: Number(o.bstp_nmix_prpr || 0),
          change: Number(o.bstp_nmix_prdy_vrss || 0),
          changeRate: `${o.bstp_nmix_prdy_ctrt || '0'}%`,
          volume: Number(o.acml_vol || 0),
          tradingValue: Number(o.acml_tr_pbmn || 0),
        }
      }))

      return JSON.stringify({ success: true, action: 'indices', indices: results })
    }

    return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. price, chart, indices를 사용하세요.` })
  } catch (err) {
    return JSON.stringify({ success: false, message: `한국 주식 조회 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
  }
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
