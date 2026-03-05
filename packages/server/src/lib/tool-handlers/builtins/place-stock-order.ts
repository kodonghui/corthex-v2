import type { ToolHandler } from '../types'
import { getKisToken, kisHeaders, KIS_BASE_URL } from './kis-auth'

type OrderResponse = {
  output?: {
    ODNO?: string       // 주문번호
    ODRN_SHRN_ISCD?: string // 주문종목코드
    ORD_TMD?: string    // 주문시각
  }
  rt_cd?: string
  msg1?: string
}

export const placeStockOrder: ToolHandler = async (input, ctx) => {
  const stockCode = String(input.stockCode || '')
  const side = String(input.side || '')
  const quantity = Number(input.quantity || 0)
  const price = Number(input.price || 0)

  if (!stockCode || !side || !quantity) {
    return JSON.stringify({
      success: false,
      message: '종목코드(stockCode), 매수/매도(side: buy/sell), 수량(quantity)은 필수입니다.',
    })
  }

  if (side !== 'buy' && side !== 'sell') {
    return JSON.stringify({ success: false, message: 'side는 "buy" 또는 "sell"이어야 합니다.' })
  }

  if (price < 0) {
    return JSON.stringify({ success: false, message: '가격(price)은 0 이상이어야 합니다.' })
  }

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('kis')
  } catch {
    return JSON.stringify({ success: false, message: 'KIS 증권 API 키가 등록되지 않았습니다. 설정에서 등록하세요.' })
  }

  try {
    const token = await getKisToken(creds.app_key, creds.app_secret)
    const accountNo = creds.account_no
    const acntPrefix = accountNo.substring(0, 8)
    const acntSuffix = accountNo.substring(8, 10) || '01'
    const trId = side === 'buy' ? 'TTTC0802U' : 'TTTC0801U'
    const ordType = price > 0 ? '00' : '01' // 00: 지정가, 01: 시장가

    const body = {
      CANO: acntPrefix,
      ACNT_PRDT_CD: acntSuffix,
      PDNO: stockCode,
      ORD_DVSN: ordType,
      ORD_QTY: String(quantity),
      ORD_UNPR: String(price || 0),
    }

    const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/trading/order-cash`, {
      method: 'POST',
      headers: kisHeaders(token, creds.app_key, creds.app_secret, trId),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      return JSON.stringify({ success: false, message: `KIS API 오류: ${res.status}` })
    }

    const data = (await res.json()) as OrderResponse
    if (data.rt_cd !== '0') {
      return JSON.stringify({ success: false, message: `KIS 주문 오류: ${data.msg1}` })
    }

    return JSON.stringify({
      success: true,
      message: `${side === 'buy' ? '매수' : '매도'} 주문이 접수되었습니다.`,
      orderNo: data.output?.ODNO,
      stockCode: data.output?.ODRN_SHRN_ISCD || stockCode,
      orderTime: data.output?.ORD_TMD,
      side: side === 'buy' ? '매수' : '매도',
      quantity,
      price: price || '시장가',
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `주문 실행 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
