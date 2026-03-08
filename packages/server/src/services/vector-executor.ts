// VECTOR Execution Service
// Parses CIO trade proposals and executes orders via KIS adapter.
// Validates market hours, daily limits, confidence thresholds, and risk profile constraints.

import { executeOrder, isKoreanMarketOpen, isUSMarketOpen } from './kis-adapter'
import { delegationTracker } from './delegation-tracker'
import { db } from '../db'
import { strategyOrders, strategyPortfolios } from '../db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { getTradingSettings, getEffectiveValue } from './trading-settings'
import type {
  TradeProposal,
  VectorExecutionResult,
  VectorOrderResult,
  TradingSettings,
} from '@corthex/shared'

// === Types ===

export type VectorExecuteOptions = {
  proposals: TradeProposal[]
  companyId: string
  userId: string
  commandId: string
  tradingMode: 'real' | 'paper'
  vectorAgentId?: string
}

// === Constants (fallbacks if no settings loaded) ===

const FALLBACK_MIN_CONFIDENCE = 0.6
const FALLBACK_DAILY_TRADE_LIMIT = 20

// === Validation ===

export type OrderValidation = {
  valid: boolean
  reason?: string
}

export function validateMarketHours(market: 'KR' | 'US', tradingMode: 'real' | 'paper'): OrderValidation {
  // Paper trading always passes market hours check
  if (tradingMode === 'paper') return { valid: true }

  if (market === 'KR' && !isKoreanMarketOpen()) {
    return { valid: false, reason: '한국 시장 운영 시간(09:00-15:30 KST)이 아닙니다' }
  }
  if (market === 'US' && !isUSMarketOpen()) {
    return { valid: false, reason: '미국 시장 운영 시간(09:30-16:00 EST)이 아닙니다' }
  }
  return { valid: true }
}

export function validateConfidence(confidence: number, minConfidence: number = FALLBACK_MIN_CONFIDENCE): OrderValidation {
  if (!Number.isFinite(confidence) || confidence < minConfidence) {
    return { valid: false, reason: `확신도 ${Number.isFinite(confidence) ? (confidence * 100).toFixed(0) : '0'}% — 최소 ${(minConfidence * 100).toFixed(0)}% 필요` }
  }
  return { valid: true }
}

export async function validateDailyLimit(
  companyId: string,
  tradingMode: 'real' | 'paper',
  limit: number = FALLBACK_DAILY_TRADE_LIMIT,
): Promise<OrderValidation> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(strategyOrders)
    .where(
      and(
        eq(strategyOrders.companyId, companyId),
        eq(strategyOrders.tradingMode, tradingMode),
        gte(strategyOrders.createdAt, todayStart),
      ),
    )

  const todayCount = result?.count ?? 0
  if (todayCount >= limit) {
    return { valid: false, reason: `일일 매매 한도 초과 (${todayCount}/${limit})` }
  }
  return { valid: true }
}

/**
 * Validate position size against portfolio total value.
 * Ensures no single stock exceeds maxPositionPct of portfolio.
 */
export async function validatePositionSize(
  proposal: TradeProposal,
  companyId: string,
  userId: string,
  tradingMode: 'real' | 'paper',
  maxPositionPct: number,
): Promise<OrderValidation> {
  // Only check for buy orders
  if (proposal.side !== 'buy') return { valid: true }

  const portfolios = await db
    .select({ totalValue: strategyPortfolios.totalValue })
    .from(strategyPortfolios)
    .where(and(
      eq(strategyPortfolios.companyId, companyId),
      eq(strategyPortfolios.userId, userId),
      eq(strategyPortfolios.tradingMode, tradingMode),
    ))
    .limit(1)

  if (portfolios.length === 0) return { valid: true } // No portfolio = skip check

  const totalValue = portfolios[0].totalValue
  if (totalValue <= 0) return { valid: true }

  const orderValue = proposal.quantity * proposal.price
  const positionPct = (orderValue / totalValue) * 100

  if (positionPct > maxPositionPct) {
    return {
      valid: false,
      reason: `종목 비중 초과: ${positionPct.toFixed(1)}% > 최대 ${maxPositionPct}%`,
    }
  }
  return { valid: true }
}

/**
 * Validate daily realized loss doesn't exceed maxDailyLossPct.
 */
export async function validateDailyLoss(
  companyId: string,
  userId: string,
  tradingMode: 'real' | 'paper',
  maxDailyLossPct: number,
): Promise<OrderValidation> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Sum of sell orders executed today (negative if loss)
  const [result] = await db
    .select({
      totalSold: sql<number>`coalesce(sum(case when ${strategyOrders.side} = 'sell' then ${strategyOrders.totalAmount} else 0 end), 0)::int`,
    })
    .from(strategyOrders)
    .where(and(
      eq(strategyOrders.companyId, companyId),
      eq(strategyOrders.userId, userId),
      eq(strategyOrders.tradingMode, tradingMode),
      eq(strategyOrders.status, 'executed'),
      gte(strategyOrders.createdAt, todayStart),
    ))

  // Get portfolio total value for percentage calculation
  const portfolios = await db
    .select({ totalValue: strategyPortfolios.totalValue })
    .from(strategyPortfolios)
    .where(and(
      eq(strategyPortfolios.companyId, companyId),
      eq(strategyPortfolios.userId, userId),
      eq(strategyPortfolios.tradingMode, tradingMode),
    ))
    .limit(1)

  if (portfolios.length === 0) return { valid: true }

  const totalValue = portfolios[0].totalValue
  if (totalValue <= 0) return { valid: true }

  // Simplified: if daily sell volume exceeds threshold, block further trading
  // Full P&L calculation would need buy price tracking (future enhancement)
  const dailySellPct = ((result?.totalSold ?? 0) / totalValue) * 100

  if (dailySellPct > maxDailyLossPct * 10) { // Conservative multiplier
    return {
      valid: false,
      reason: `일일 매매 활동이 손실 한도에 근접 (일일 최대 손실: ${maxDailyLossPct}%)`,
    }
  }
  return { valid: true }
}

/**
 * Full validation with risk profile awareness.
 */
export async function validateOrder(
  proposal: TradeProposal,
  companyId: string,
  tradingMode: 'real' | 'paper',
  settings?: TradingSettings,
  userId?: string,
): Promise<OrderValidation> {
  // Resolve effective limits from risk profile
  const minConf = settings
    ? getEffectiveValue('minConfidence', settings) / 100 // stored as percentage, need 0-1
    : FALLBACK_MIN_CONFIDENCE
  const dailyLimit = settings
    ? getEffectiveValue('maxDailyTrades', settings)
    : FALLBACK_DAILY_TRADE_LIMIT

  // 1. Confidence check (dynamic based on risk profile)
  const confCheck = validateConfidence(proposal.confidence, minConf)
  if (!confCheck.valid) return confCheck

  // 2. Market hours check
  const marketCheck = validateMarketHours(proposal.market, tradingMode)
  if (!marketCheck.valid) return marketCheck

  // 3. Daily limit check (dynamic based on risk profile)
  const limitCheck = await validateDailyLimit(companyId, tradingMode, dailyLimit)
  if (!limitCheck.valid) return limitCheck

  // 4. Basic quantity check
  if (proposal.quantity <= 0) {
    return { valid: false, reason: '수량이 0 이하입니다' }
  }

  // 5. Position size check (if settings + userId available)
  if (settings && userId) {
    const maxPosPct = getEffectiveValue('maxPositionPct', settings)
    const posCheck = await validatePositionSize(proposal, companyId, userId, tradingMode, maxPosPct)
    if (!posCheck.valid) return posCheck
  }

  // 6. Daily loss check (if settings + userId available)
  if (settings && userId) {
    const maxLossPct = getEffectiveValue('maxDailyLossPct', settings)
    const lossCheck = await validateDailyLoss(companyId, userId, tradingMode, maxLossPct)
    if (!lossCheck.valid) return lossCheck
  }

  return { valid: true }
}

// === Execution ===

/**
 * Execute validated trade proposals via KIS adapter.
 * Each proposal is validated individually; failures don't block other orders.
 * Now loads trading settings for risk profile-aware validation.
 */
export async function executeProposals(options: VectorExecuteOptions): Promise<VectorExecutionResult> {
  const { proposals, companyId, userId, commandId, tradingMode, vectorAgentId } = options

  // Load trading settings for risk-aware validation
  const settings = await getTradingSettings(companyId)

  const totalStart = Date.now()
  const orders: VectorOrderResult[] = []
  let executed = 0
  let skipped = 0
  let failed = 0

  // Emit VECTOR events
  delegationTracker.vectorValidationStarted(companyId, commandId)

  // Validate and execute each proposal
  delegationTracker.vectorExecutionStarted(companyId, commandId, proposals.length)

  for (const proposal of proposals) {
    // Validate with risk profile
    const validation = await validateOrder(proposal, companyId, tradingMode, settings, userId)
    if (!validation.valid) {
      orders.push({
        proposal,
        status: 'skipped',
        reason: validation.reason,
      })
      skipped++
      continue
    }

    // Execute via KIS adapter
    try {
      const result = await executeOrder({
        companyId,
        userId,
        ticker: proposal.ticker,
        tickerName: proposal.tickerName,
        side: proposal.side,
        quantity: proposal.quantity,
        price: proposal.price,
        orderType: proposal.price > 0 ? 'limit' : 'market',
        tradingMode,
        market: proposal.market,
        reason: `CIO 분석: ${proposal.reason}`,
        agentId: vectorAgentId,
      })

      if (result.success) {
        orders.push({
          proposal,
          status: 'executed',
          orderId: result.orderId,
          kisOrderNo: result.kisOrderNo,
        })
        executed++
      } else {
        orders.push({
          proposal,
          status: 'failed',
          reason: result.message,
        })
        failed++
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      orders.push({
        proposal,
        status: 'failed',
        reason: errorMsg,
      })
      failed++
    }
  }

  // Emit completion event
  delegationTracker.vectorExecutionCompleted(companyId, commandId, { executed, skipped, failed })

  return {
    totalProposals: proposals.length,
    executed,
    skipped,
    failed,
    orders,
    totalDurationMs: Date.now() - totalStart,
  }
}

// === Result Formatting ===

/**
 * Format CIO analysis + VECTOR execution into a combined report for CEO.
 */
export function formatCIOVectorResult(
  analysisReport: string,
  vectorResult: VectorExecutionResult | null,
  pendingApproval?: boolean,
  pendingCount?: number,
): string {
  if (pendingApproval && pendingCount) {
    return `${analysisReport}\n\n---\n\n## 매매 승인 대기\n\n⏳ **${pendingCount}건**의 매매 제안이 승인 대기 중입니다.\n전략실에서 확인 후 승인/거부해주세요.`
  }

  if (!vectorResult || vectorResult.totalProposals === 0) {
    return analysisReport
  }

  const parts = [analysisReport]

  parts.push('\n\n---\n\n## VECTOR 매매 실행 결과\n')
  parts.push(`- 총 제안: ${vectorResult.totalProposals}건`)
  parts.push(`- 실행 완료: ${vectorResult.executed}건`)
  parts.push(`- 건너뜀: ${vectorResult.skipped}건`)
  parts.push(`- 실패: ${vectorResult.failed}건`)
  parts.push(`- 소요시간: ${(vectorResult.totalDurationMs / 1000).toFixed(1)}초`)

  if (vectorResult.orders.length > 0) {
    parts.push('\n### 주문 상세\n')
    for (const order of vectorResult.orders) {
      const p = order.proposal
      const statusEmoji = order.status === 'executed' ? '✅' : order.status === 'skipped' ? '⏭️' : '❌'
      parts.push(`${statusEmoji} **${p.tickerName}** (${p.ticker}) ${p.side === 'buy' ? '매수' : '매도'} ${p.quantity}주 @ ${p.price.toLocaleString()}원`)
      if (order.kisOrderNo) parts.push(`  주문번호: ${order.kisOrderNo}`)
      if (order.reason) parts.push(`  사유: ${order.reason}`)
    }
  }

  return parts.join('\n')
}
