import type { ToolHandler } from '../types'
import { getKisToken, kisHeaders, KIS_BASE_URL } from './kis-auth'

type PriceResponse = {
  output?: {
    stck_prpr?: string    // 현재가
    prdy_ctrt?: string    // 전일 대비율
    acml_vol?: string     // 누적 거래량
    stck_shrn_iscd?: string // 종목코드
    hts_kor_isnm?: string  // 종목명
    stck_oprc?: string    // 시가
    stck_hgpr?: string    // 고가
    stck_lwpr?: string    // 저가
  }
  rt_cd?: string
  msg1?: string
}

export const getStockPrice: ToolHandler = async (input, ctx) => {
  const stockCode = String(input.stockCode || '')
  if (!stockCode) return JSON.stringify({ success: false, message: '종목코드(stockCode)가 필요합니다. (예: 005930)' })

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('kis')
  } catch {
    return JSON.stringify({ success: false, message: 'KIS 증권 API 키가 등록되지 않았습니다. 설정에서 등록하세요.' })
  }

  try {
    const token = await getKisToken(creds.app_key, creds.app_secret)
    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_INPUT_ISCD: stockCode,
    })

    const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?${params}`, {
      headers: kisHeaders(token, creds.app_key, creds.app_secret, 'FHKST01010100'),
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      return JSON.stringify({ success: false, message: `KIS API 오류: ${res.status}` })
    }

    const data = (await res.json()) as PriceResponse
    if (data.rt_cd !== '0') {
      return JSON.stringify({ success: false, message: `KIS 오류: ${data.msg1}` })
    }

    const o = data.output
    return JSON.stringify({
      success: true,
      stockCode,
      name: o?.hts_kor_isnm || stockCode,
      currentPrice: Number(o?.stck_prpr || 0),
      changeRate: `${o?.prdy_ctrt || '0'}%`,
      volume: Number(o?.acml_vol || 0),
      open: Number(o?.stck_oprc || 0),
      high: Number(o?.stck_hgpr || 0),
      low: Number(o?.stck_lwpr || 0),
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `주식 시세 조회 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
