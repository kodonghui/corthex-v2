import type { ToolHandler } from '../types'
import { getKisToken, kisHeaders, KIS_BASE_URL } from './kis-auth'

type BalanceItem = {
  pdno?: string           // 종목코드
  prdt_name?: string      // 종목명
  hldg_qty?: string       // 보유수량
  pchs_avg_pric?: string  // 매입평균가
  prpr?: string           // 현재가
  evlu_pfls_rt?: string   // 평가손익률
  evlu_amt?: string       // 평가금액
}

type BalanceResponse = {
  output1?: BalanceItem[]
  output2?: Array<{
    tot_evlu_amt?: string    // 총 평가금액
    pchs_amt_smtl_amt?: string // 총 매입금액
    evlu_pfls_smtl_amt?: string // 총 평가손익
  }>
  rt_cd?: string
  msg1?: string
}

export const getAccountBalance: ToolHandler = async (input, ctx) => {
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

    const params = new URLSearchParams({
      CANO: acntPrefix,
      ACNT_PRDT_CD: acntSuffix,
      AFHR_FLPR_YN: 'N',
      OFL_YN: '',
      INQR_DVSN: '02',
      UNPR_DVSN: '01',
      FUND_STTL_ICLD_YN: 'N',
      FNCG_AMT_AUTO_RDPT_YN: 'N',
      PRCS_DVSN: '01',
      CTX_AREA_FK100: '',
      CTX_AREA_NK100: '',
    })

    const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/trading/inquire-balance?${params}`, {
      headers: kisHeaders(token, creds.app_key, creds.app_secret, 'TTTC8434R'),
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      return JSON.stringify({ success: false, message: `KIS API 오류: ${res.status}` })
    }

    const data = (await res.json()) as BalanceResponse
    if (data.rt_cd !== '0') {
      return JSON.stringify({ success: false, message: `KIS 오류: ${data.msg1}` })
    }

    const holdings = (data.output1 || [])
      .filter((h) => Number(h.hldg_qty || 0) > 0)
      .map((h) => ({
        code: h.pdno,
        name: h.prdt_name,
        quantity: Number(h.hldg_qty || 0),
        avgPrice: Number(h.pchs_avg_pric || 0),
        currentPrice: Number(h.prpr || 0),
        profitRate: `${h.evlu_pfls_rt || '0'}%`,
        evalAmount: Number(h.evlu_amt || 0),
      }))

    const summary = data.output2?.[0]

    return JSON.stringify({
      success: true,
      holdings,
      holdingCount: holdings.length,
      totalEvalAmount: Number(summary?.tot_evlu_amt || 0),
      totalPurchaseAmount: Number(summary?.pchs_amt_smtl_amt || 0),
      totalProfit: Number(summary?.evlu_pfls_smtl_amt || 0),
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `잔고 조회 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
