// KIS Securities API Adapter
// Handles order execution, balance inquiry, order status, overseas prices
// Supports real + paper trading mode separation

import { db } from '../db'
import { strategyOrders, strategyPortfolios } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import {
  getKisToken,
  invalidateKisToken,
  kisHeaders,
  getKisBaseUrl,
  KIS_TR_IDS,
  EXCHANGE_CODES,
} from '../lib/tool-handlers/builtins/kis-auth'
import { getCredentials } from './credential-vault'

// === Types ===

export type OrderParams = {
  companyId: string
  userId: string
  portfolioId?: string
  agentId?: string
  ticker: string
  tickerName: string
  side: 'buy' | 'sell'
  quantity: number
  price: number // 0 = market order
  orderType: 'market' | 'limit'
  tradingMode: 'real' | 'paper'
  market: 'KR' | 'US'
  exchange?: string // NASDAQ/NYSE/AMEX (US only)
  reason?: string
}

export type OrderResult = {
  success: boolean
  orderId?: string // DB order ID
  kisOrderNo?: string
  message: string
  side: string
  ticker: string
  quantity: number
  price: number
  status: string
}

export type BalanceResult = {
  success: boolean
  cash: number
  holdings: Array<{
    ticker: string
    name: string
    quantity: number
    avgPrice: number
    currentPrice: number
    evalProfit: number
  }>
  totalEval: number
  mode: string
  error?: string
}

type KisOrderResponse = {
  output?: {
    ODNO?: string
    ODRN_SHRN_ISCD?: string
    ORD_TMD?: string
  }
  rt_cd?: string
  msg_cd?: string
  msg1?: string
}

type KisBalanceResponse = {
  output1?: Array<Record<string, string>>
  output2?: Array<Record<string, string>>
  rt_cd?: string
  msg_cd?: string
  msg1?: string
}

type KisOverseasPriceResponse = {
  output?: Record<string, string>
  rt_cd?: string
  msg1?: string
}

// === Market Hours ===

const KST_OFFSET = 9 * 60 // UTC+9 in minutes
const EST_OFFSET = -5 * 60 // UTC-5 in minutes (EST, not EDT)

function getNowInTimezone(offsetMinutes: number): { hours: number; minutes: number; dayOfWeek: number } {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000
  const local = new Date(utc + offsetMinutes * 60_000)
  return {
    hours: local.getHours(),
    minutes: local.getMinutes(),
    dayOfWeek: local.getDay(), // 0=Sun, 6=Sat
  }
}

export function isKoreanMarketOpen(): boolean {
  const { hours, minutes, dayOfWeek } = getNowInTimezone(KST_OFFSET)
  if (dayOfWeek === 0 || dayOfWeek === 6) return false // weekend
  const time = hours * 60 + minutes
  return time >= 540 && time <= 930 // 09:00-15:30
}

export function isUSMarketOpen(): boolean {
  const { hours, minutes, dayOfWeek } = getNowInTimezone(EST_OFFSET)
  if (dayOfWeek === 0 || dayOfWeek === 6) return false
  const time = hours * 60 + minutes
  return time >= 570 && time <= 960 // 09:30-16:00
}

// === Order Execution ===

export async function executeOrder(params: OrderParams): Promise<OrderResult> {
  const {
    companyId, userId, portfolioId, agentId,
    ticker, tickerName, side, quantity, price,
    orderType, tradingMode, market, exchange, reason,
  } = params

  // Market hours validation (real trading only)
  if (tradingMode === 'real') {
    if (market === 'KR' && !isKoreanMarketOpen()) {
      return {
        success: false, message: '한국 시장 운영 시간(09:00-15:30 KST)이 아닙니다. 모의거래를 이용하세요.',
        side, ticker, quantity, price, status: 'rejected',
      }
    }
    if (market === 'US' && !isUSMarketOpen()) {
      return {
        success: false, message: '미국 시장 운영 시간(09:30-16:00 EST)이 아닙니다. 모의거래를 이용하세요.',
        side, ticker, quantity, price, status: 'rejected',
      }
    }
  }

  // Try to get KIS credentials
  let creds: Record<string, string> | null = null
  try {
    creds = await getCredentials(companyId, 'kis', userId)
  } catch {
    // No credentials — paper trading falls back to simulated execution
  }

  // Paper trading without credentials → simulated execution
  if (tradingMode === 'paper' && !creds) {
    return executePaperOrder(params)
  }

  // Real trading without credentials → error
  if (!creds) {
    return {
      success: false, message: 'KIS 증권 API 키가 등록되지 않았습니다. 설정에서 등록하세요.',
      side, ticker, quantity, price, status: 'failed',
    }
  }

  // Execute via KIS API
  try {
    const token = await getKisToken(creds.app_key, creds.app_secret, tradingMode)
    const baseUrl = getKisBaseUrl(tradingMode)

    let result: KisOrderResponse

    if (market === 'US') {
      result = await executeOverseasOrder(baseUrl, token, creds, params)
    } else {
      result = await executeDomesticOrder(baseUrl, token, creds, params)
    }

    if (result.rt_cd !== '0') {
      // Token expired? Retry once
      if (result.msg_cd === 'EGW00123' || (result.msg1 && result.msg1.includes('만료'))) {
        invalidateKisToken(creds.app_key, creds.app_secret, tradingMode)
        const newToken = await getKisToken(creds.app_key, creds.app_secret, tradingMode)
        if (market === 'US') {
          result = await executeOverseasOrder(baseUrl, newToken, creds, params)
        } else {
          result = await executeDomesticOrder(baseUrl, newToken, creds, params)
        }
      }

      if (result.rt_cd !== '0') {
        // Record failed order
        const [order] = await db.insert(strategyOrders).values({
          companyId, userId,
          portfolioId: portfolioId || null,
          agentId: agentId || null,
          ticker, tickerName, side, quantity, price,
          totalAmount: quantity * price,
          orderType, tradingMode,
          status: 'failed',
          reason: result.msg1 || 'KIS API 오류',
        }).returning()

        return {
          success: false,
          orderId: order.id,
          message: `KIS 주문 오류: ${result.msg1}`,
          side, ticker, quantity, price, status: 'failed',
        }
      }
    }

    // Success — record order
    const kisOrderNo = result.output?.ODNO || ''
    const orderTime = result.output?.ORD_TMD || ''

    const [order] = await db.insert(strategyOrders).values({
      companyId, userId,
      portfolioId: portfolioId || null,
      agentId: agentId || null,
      ticker, tickerName, side, quantity, price,
      totalAmount: quantity * price,
      orderType, tradingMode,
      status: 'submitted',
      reason: reason || null,
      kisOrderNo,
    }).returning()

    return {
      success: true,
      orderId: order.id,
      kisOrderNo,
      message: `${side === 'buy' ? '매수' : '매도'} 주문이 접수되었습니다.${orderTime ? ` (${orderTime})` : ''}`,
      side: side === 'buy' ? '매수' : '매도',
      ticker, quantity,
      price: price || 0,
      status: 'submitted',
    }
  } catch (err) {
    // Record failed order
    const [order] = await db.insert(strategyOrders).values({
      companyId, userId,
      portfolioId: portfolioId || null,
      agentId: agentId || null,
      ticker, tickerName, side, quantity, price,
      totalAmount: quantity * price,
      orderType, tradingMode,
      status: 'failed',
      reason: err instanceof Error ? err.message : '알 수 없는 오류',
    }).returning()

    return {
      success: false,
      orderId: order.id,
      message: `주문 실행 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
      side, ticker, quantity, price, status: 'failed',
    }
  }
}

async function executeDomesticOrder(
  baseUrl: string,
  token: string,
  creds: Record<string, string>,
  params: OrderParams,
): Promise<KisOrderResponse> {
  const mode = params.tradingMode === 'paper' ? 'paper' : 'real'
  const trIds = KIS_TR_IDS.domestic[mode]
  const trId = params.side === 'buy' ? trIds.buy : trIds.sell
  const ordType = params.price > 0 ? '00' : '01' // 00=지정가, 01=시장가

  const accountNo = creds.account_no
  const acntPrefix = accountNo.substring(0, 8)
  const acntSuffix = accountNo.substring(8, 10) || '01'

  const body = {
    CANO: acntPrefix,
    ACNT_PRDT_CD: acntSuffix,
    PDNO: params.ticker,
    ORD_DVSN: ordType,
    ORD_QTY: String(params.quantity),
    ORD_UNPR: String(params.price || 0),
    SLL_TYPE: params.side === 'sell' ? '01' : '',
    EXCG_ID_DVSN_CD: 'KRX',
    CNDT_PRIC: '',
  }

  const res = await fetch(`${baseUrl}/uapi/domestic-stock/v1/trading/order-cash`, {
    method: 'POST',
    headers: kisHeaders(token, creds.app_key, creds.app_secret, trId),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  })

  if (!res.ok) {
    return { rt_cd: '1', msg1: `KIS API HTTP 오류: ${res.status}` }
  }

  return (await res.json()) as KisOrderResponse
}

async function executeOverseasOrder(
  baseUrl: string,
  token: string,
  creds: Record<string, string>,
  params: OrderParams,
): Promise<KisOrderResponse> {
  const mode = params.tradingMode === 'paper' ? 'paper' : 'real'
  const trIds = KIS_TR_IDS.overseas[mode]
  const trId = params.side === 'buy' ? trIds.buy : trIds.sell

  // Exchange code mapping
  const exchCode = params.exchange
    ? (EXCHANGE_CODES.order[params.exchange.toUpperCase()] || 'NASD')
    : 'NASD'

  const accountNo = creds.account_no
  const acntPrefix = accountNo.substring(0, 8)
  const acntSuffix = accountNo.substring(8, 10) || '01'

  if (params.price <= 0) {
    return { rt_cd: '1', msg1: '해외주식은 시장가 주문 미지원. 지정가(price > 0) 필수' }
  }

  const body = {
    CANO: acntPrefix,
    ACNT_PRDT_CD: acntSuffix,
    OVRS_EXCG_CD: exchCode,
    PDNO: params.ticker.toUpperCase(),
    ORD_DVSN: '00', // 해외=지정가만
    ORD_QTY: String(params.quantity),
    OVRS_ORD_UNPR: params.price.toFixed(2),
    SLL_TYPE: params.side === 'sell' ? '00' : '',
    ORD_SVR_DVSN_CD: '0',
  }

  const res = await fetch(`${baseUrl}/uapi/overseas-stock/v1/trading/order`, {
    method: 'POST',
    headers: kisHeaders(token, creds.app_key, creds.app_secret, trId),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  })

  if (!res.ok) {
    return { rt_cd: '1', msg1: `KIS 해외 API HTTP 오류: ${res.status}` }
  }

  return (await res.json()) as KisOrderResponse
}

// === Paper Trading (Simulated) ===

async function executePaperOrder(params: OrderParams): Promise<OrderResult> {
  const {
    companyId, userId, portfolioId, agentId,
    ticker, tickerName, side, quantity, price,
    orderType, tradingMode, reason,
  } = params

  // For paper trading, simulate immediate execution at given price
  // Market orders (price=0) are rejected in paper mode — no real market data to simulate
  if (!price || price <= 0) {
    const [order] = await db.insert(strategyOrders).values({
      companyId, userId,
      portfolioId: portfolioId || null, agentId: agentId || null,
      ticker, tickerName, side, quantity, price: 0,
      totalAmount: 0, orderType, tradingMode,
      status: 'rejected',
      reason: '모의거래에서 시장가 주문은 지원하지 않습니다. 지정가(price > 0)를 입력하세요.',
    }).returning()

    return {
      success: false,
      orderId: order.id,
      message: '모의거래에서 시장가 주문은 지원하지 않습니다. 지정가(price > 0)를 입력하세요.',
      side, ticker, quantity, price: 0, status: 'rejected',
    }
  }
  const execPrice = price

  // If portfolioId provided, update portfolio
  if (portfolioId) {
    const [portfolio] = await db.select().from(strategyPortfolios)
      .where(and(
        eq(strategyPortfolios.id, portfolioId),
        eq(strategyPortfolios.companyId, companyId),
        eq(strategyPortfolios.userId, userId),
      ))
      .limit(1)

    if (portfolio) {
      // Validate portfolio tradingMode matches order tradingMode
      if (portfolio.tradingMode !== tradingMode) {
        const [order] = await db.insert(strategyOrders).values({
          companyId, userId,
          portfolioId, agentId: agentId || null,
          ticker, tickerName, side, quantity, price: execPrice,
          totalAmount: quantity * execPrice, orderType, tradingMode,
          status: 'rejected',
          reason: `포트폴리오 거래 모드(${portfolio.tradingMode})와 주문 모드(${tradingMode})가 일치하지 않습니다`,
        }).returning()

        return {
          success: false,
          orderId: order.id,
          message: `포트폴리오 거래 모드(${portfolio.tradingMode})와 주문 모드(${tradingMode})가 일치하지 않습니다`,
          side, ticker, quantity, price: execPrice, status: 'rejected',
        }
      }

      const holdings = (portfolio.holdings as Array<{
        ticker: string; name: string; market: string
        quantity: number; avgPrice: number; currentPrice?: number
      }>) || []
      const totalCost = quantity * execPrice

      if (side === 'buy') {
        // Check balance
        if (portfolio.cashBalance < totalCost) {
          const [order] = await db.insert(strategyOrders).values({
            companyId, userId,
            portfolioId, agentId: agentId || null,
            ticker, tickerName, side, quantity, price: execPrice,
            totalAmount: totalCost, orderType, tradingMode,
            status: 'rejected',
            reason: `잔고 부족: 필요 ${totalCost.toLocaleString()}원, 보유 ${portfolio.cashBalance.toLocaleString()}원`,
          }).returning()

          return {
            success: false,
            orderId: order.id,
            message: `잔고 부족: 필요 ${totalCost.toLocaleString()}원`,
            side, ticker, quantity, price: execPrice, status: 'rejected',
          }
        }

        // Update holdings
        const existing = holdings.find((h) => h.ticker === ticker)
        if (existing) {
          const newQty = existing.quantity + quantity
          existing.avgPrice = Math.round(
            (existing.avgPrice * existing.quantity + execPrice * quantity) / newQty,
          )
          existing.quantity = newQty
          existing.currentPrice = execPrice
        } else {
          holdings.push({
            ticker, name: tickerName, market: params.market || 'KR',
            quantity, avgPrice: execPrice, currentPrice: execPrice,
          })
        }

        await db.update(strategyPortfolios)
          .set({
            cashBalance: portfolio.cashBalance - totalCost,
            holdings,
            totalValue: (portfolio.cashBalance - totalCost) +
              holdings.reduce((sum, h) => sum + h.quantity * (h.currentPrice || h.avgPrice), 0),
            updatedAt: new Date(),
          })
          .where(eq(strategyPortfolios.id, portfolioId))
      } else {
        // Sell
        const existing = holdings.find((h) => h.ticker === ticker)
        if (!existing || existing.quantity < quantity) {
          const [order] = await db.insert(strategyOrders).values({
            companyId, userId,
            portfolioId, agentId: agentId || null,
            ticker, tickerName, side, quantity, price: execPrice,
            totalAmount: totalCost, orderType, tradingMode,
            status: 'rejected',
            reason: `보유 수량 부족: 보유 ${existing?.quantity || 0}주, 매도 ${quantity}주`,
          }).returning()

          return {
            success: false,
            orderId: order.id,
            message: `보유 수량 부족`,
            side, ticker, quantity, price: execPrice, status: 'rejected',
          }
        }

        existing.quantity -= quantity
        existing.currentPrice = execPrice
        const updatedHoldings = holdings.filter((h) => h.quantity > 0)

        await db.update(strategyPortfolios)
          .set({
            cashBalance: portfolio.cashBalance + totalCost,
            holdings: updatedHoldings,
            totalValue: (portfolio.cashBalance + totalCost) +
              updatedHoldings.reduce((sum, h) => sum + h.quantity * (h.currentPrice || h.avgPrice), 0),
            updatedAt: new Date(),
          })
          .where(eq(strategyPortfolios.id, portfolioId))
      }
    }
  }

  // Record as executed
  const [order] = await db.insert(strategyOrders).values({
    companyId, userId,
    portfolioId: portfolioId || null,
    agentId: agentId || null,
    ticker, tickerName, side, quantity, price: execPrice,
    totalAmount: quantity * execPrice,
    orderType, tradingMode,
    status: 'executed',
    reason: reason || '모의거래 가상 체결',
    executedAt: new Date(),
  }).returning()

  return {
    success: true,
    orderId: order.id,
    message: `모의거래 ${side === 'buy' ? '매수' : '매도'} 체결 완료 (가상)`,
    side: side === 'buy' ? '매수' : '매도',
    ticker, quantity, price: execPrice,
    status: 'executed',
  }
}

// === Balance Inquiry ===

export async function getBalance(
  companyId: string,
  userId: string,
  tradingMode: 'real' | 'paper' = 'paper',
): Promise<BalanceResult> {
  let creds: Record<string, string>
  try {
    creds = await getCredentials(companyId, 'kis', userId)
  } catch {
    return { success: false, cash: 0, holdings: [], totalEval: 0, mode: tradingMode, error: 'KIS API 키가 등록되지 않았습니다' }
  }

  try {
    const token = await getKisToken(creds.app_key, creds.app_secret, tradingMode)
    const baseUrl = getKisBaseUrl(tradingMode)
    const mode = tradingMode === 'paper' ? 'paper' : 'real'
    const trId = KIS_TR_IDS.domestic[mode].balance

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

    const res = await fetch(`${baseUrl}/uapi/domestic-stock/v1/trading/inquire-balance?${params}`, {
      headers: kisHeaders(token, creds.app_key, creds.app_secret, trId),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      return { success: false, cash: 0, holdings: [], totalEval: 0, mode: tradingMode, error: `KIS API HTTP 오류: ${res.status}` }
    }

    const data = (await res.json()) as KisBalanceResponse

    if (data.rt_cd !== '0') {
      // Token expired? Retry once
      if (data.msg_cd === 'EGW00123' || (data.msg1 && data.msg1.includes('만료'))) {
        invalidateKisToken(creds.app_key, creds.app_secret, tradingMode)
        const newToken = await getKisToken(creds.app_key, creds.app_secret, tradingMode)
        const retryRes = await fetch(`${baseUrl}/uapi/domestic-stock/v1/trading/inquire-balance?${params}`, {
          headers: kisHeaders(newToken, creds.app_key, creds.app_secret, trId),
          signal: AbortSignal.timeout(15_000),
        })
        if (!retryRes.ok) {
          return { success: false, cash: 0, holdings: [], totalEval: 0, mode: tradingMode, error: `재시도 실패: ${retryRes.status}` }
        }
        const retryData = (await retryRes.json()) as KisBalanceResponse
        if (retryData.rt_cd !== '0') {
          return { success: false, cash: 0, holdings: [], totalEval: 0, mode: tradingMode, error: `KIS API: ${retryData.msg1}` }
        }
        return parseBalanceResponse(retryData, tradingMode)
      }
      return { success: false, cash: 0, holdings: [], totalEval: 0, mode: tradingMode, error: `KIS API: ${data.msg1}` }
    }

    return parseBalanceResponse(data, tradingMode)
  } catch (err) {
    return {
      success: false, cash: 0, holdings: [], totalEval: 0, mode: tradingMode,
      error: err instanceof Error ? err.message : '알 수 없는 오류',
    }
  }
}

function parseBalanceResponse(data: KisBalanceResponse, tradingMode: string): BalanceResult {
  const output1 = data.output1 || []
  const output2 = data.output2 || [{}]
  const out2 = output2[0] || {}

  // nxdy_excc_amt: 익일정산금 = 실제 주문 가능한 현금
  // ⚠️ dnca_tot_amt는 미결제 금액 포함 — 사용 금지
  const cash = parseInt(out2.nxdy_excc_amt || '0', 10) || 0
  let totalEval = parseInt(out2.tot_evlu_amt || '0', 10) || 0

  const holdings = output1
    .filter((item) => parseInt(item.hldg_qty || '0', 10) > 0)
    .map((item) => ({
      ticker: item.pdno || '',
      name: item.prdt_name || '',
      quantity: parseInt(item.hldg_qty || '0', 10),
      avgPrice: parseInt(item.pchs_avg_pric || '0', 10),
      currentPrice: parseInt(item.prpr || '0', 10),
      evalProfit: parseInt(item.evlu_pfls_amt || '0', 10),
    }))

  // Correct total if it doesn't include cash
  const holdingsEval = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0)
  const computed = cash + holdingsEval
  if (totalEval < computed) totalEval = computed

  return { success: true, cash, holdings, totalEval, mode: tradingMode }
}

// === Order Status Check ===

export async function syncOrderStatus(
  companyId: string,
  userId: string,
  orderId: string,
): Promise<{ success: boolean; status: string; message: string }> {
  // Get order from DB
  const [order] = await db.select().from(strategyOrders)
    .where(and(
      eq(strategyOrders.id, orderId),
      eq(strategyOrders.companyId, companyId),
      eq(strategyOrders.userId, userId),
    ))
    .limit(1)

  if (!order) {
    return { success: false, status: '', message: '주문을 찾을 수 없습니다' }
  }

  // Only check for orders that are pending/submitted
  if (order.status !== 'pending' && order.status !== 'submitted') {
    return { success: true, status: order.status, message: `이미 최종 상태: ${order.status}` }
  }

  // Paper trading simulated orders are already executed
  if (order.tradingMode === 'paper' && !order.kisOrderNo) {
    return { success: true, status: order.status, message: '모의거래 주문' }
  }

  if (!order.kisOrderNo) {
    return { success: true, status: order.status, message: 'KIS 주문번호 없음' }
  }

  // Check with KIS API
  let creds: Record<string, string>
  try {
    creds = await getCredentials(companyId, 'kis', userId)
  } catch {
    return { success: false, status: order.status, message: 'KIS API 키가 등록되지 않았습니다' }
  }

  try {
    const tradingMode = order.tradingMode as 'real' | 'paper'
    const token = await getKisToken(creds.app_key, creds.app_secret, tradingMode)
    const baseUrl = getKisBaseUrl(tradingMode)

    const accountNo = creds.account_no
    const acntPrefix = accountNo.substring(0, 8)
    const acntSuffix = accountNo.substring(8, 10) || '01'

    // 미체결 조회
    const trId = tradingMode === 'paper' ? 'VTTC8001R' : 'TTTC8001R'
    const params = new URLSearchParams({
      CANO: acntPrefix,
      ACNT_PRDT_CD: acntSuffix,
      CTX_AREA_FK200: '',
      CTX_AREA_NK200: '',
      INQR_DVSN_1: '0',
      INQR_DVSN_2: '0',
    })

    const res = await fetch(`${baseUrl}/uapi/domestic-stock/v1/trading/inquire-psbl-rvsecncl?${params}`, {
      headers: kisHeaders(token, creds.app_key, creds.app_secret, trId),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      return { success: false, status: order.status, message: `KIS API 오류: ${res.status}` }
    }

    const data = (await res.json()) as { output?: Array<Record<string, string>>; rt_cd?: string }

    if (data.rt_cd !== '0') {
      return { success: false, status: order.status, message: `KIS API: ${(data as Record<string, string>).msg1 || '조회 실패'}` }
    }

    // Find our order in unfilled list
    const unfilled = (data.output || []).find((o) => o.odno === order.kisOrderNo)

    if (!unfilled) {
      // Not in unfilled list — likely executed or cancelled
      const newStatus = 'executed'
      await db.update(strategyOrders)
        .set({ status: newStatus, executedAt: new Date() })
        .where(eq(strategyOrders.id, orderId))

      return { success: true, status: newStatus, message: '체결 완료 (미체결 목록에 없음)' }
    }

    // Still unfilled
    const remainQty = parseInt(unfilled.psbl_qty || '0', 10)
    const originalQty = parseInt(unfilled.ord_qty || String(order.quantity), 10)

    if (remainQty === 0) {
      // Fully executed
      await db.update(strategyOrders)
        .set({ status: 'executed', executedAt: new Date() })
        .where(eq(strategyOrders.id, orderId))
      return { success: true, status: 'executed', message: '전량 체결' }
    }

    if (remainQty < originalQty) {
      return { success: true, status: 'submitted', message: `일부 체결 (${originalQty - remainQty}/${originalQty})` }
    }

    return { success: true, status: 'submitted', message: '미체결 대기 중' }
  } catch (err) {
    return { success: false, status: order.status, message: err instanceof Error ? err.message : '알 수 없는 오류' }
  }
}

// === Overseas Price ===

export async function getOverseasPrice(
  companyId: string,
  userId: string,
  symbol: string,
  exchange: string = 'NASD',
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  let creds: Record<string, string>
  try {
    creds = await getCredentials(companyId, 'kis', userId)
  } catch {
    return { success: false, error: 'KIS API 키가 등록되지 않았습니다' }
  }

  try {
    const token = await getKisToken(creds.app_key, creds.app_secret)
    const baseUrl = getKisBaseUrl('real') // 시세는 항상 실거래 서버
    const trId = KIS_TR_IDS.price.overseas
    const excd = EXCHANGE_CODES.price[exchange.toUpperCase()] || 'NAS'

    const params = new URLSearchParams({
      AUTH: '',
      EXCD: excd,
      SYMB: symbol.toUpperCase(),
    })

    const res = await fetch(`${baseUrl}/uapi/overseas-price/v1/quotations/price?${params}`, {
      headers: kisHeaders(token, creds.app_key, creds.app_secret, trId),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      return { success: false, error: `KIS API 오류: ${res.status}` }
    }

    const json = (await res.json()) as KisOverseasPriceResponse
    if (json.rt_cd !== '0') {
      return { success: false, error: `KIS API: ${json.msg1}` }
    }

    const o = json.output || {}
    return {
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        exchange,
        name: o.rsym || symbol,
        price: parseFloat(o.last || '0'),
        change: parseFloat(o.diff || '0'),
        changeRate: parseFloat(o.rate || '0'),
        open: parseFloat(o.open || '0'),
        high: parseFloat(o.high || '0'),
        low: parseFloat(o.low || '0'),
        volume: parseInt(o.tvol || '0', 10),
      },
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' }
  }
}
