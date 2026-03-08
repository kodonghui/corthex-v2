// VECTOR Execution Service
// Parses CIO trade proposals and executes orders via KIS adapter.
// Validates market hours, daily limits, and confidence thresholds.

import { executeOrder, isKoreanMarketOpen, isUSMarketOpen } from './kis-adapter'
import { delegationTracker } from './delegation-tracker'
import { db } from '../db'
import { strategyOrders } from '../db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import type {
  TradeProposal,
  VectorExecutionResult,
  VectorOrderResult,
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

// === Constants ===

const MIN_CONFIDENCE = 0.6
const DEFAULT_DAILY_TRADE_LIMIT = 20

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

export function validateConfidence(confidence: number): OrderValidation {
  if (!Number.isFinite(confidence) || confidence < MIN_CONFIDENCE) {
    return { valid: false, reason: `확신도 ${Number.isFinite(confidence) ? (confidence * 100).toFixed(0) : '0'}% — 최소 ${MIN_CONFIDENCE * 100}% 필요` }
  }
  return { valid: true }
}

export async function validateDailyLimit(
  companyId: string,
  tradingMode: 'real' | 'paper',
  limit: number = DEFAULT_DAILY_TRADE_LIMIT,
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

export async function validateOrder(
  proposal: TradeProposal,
  companyId: string,
  tradingMode: 'real' | 'paper',
): Promise<OrderValidation> {
  // 1. Confidence check
  const confCheck = validateConfidence(proposal.confidence)
  if (!confCheck.valid) return confCheck

  // 2. Market hours check
  const marketCheck = validateMarketHours(proposal.market, tradingMode)
  if (!marketCheck.valid) return marketCheck

  // 3. Daily limit check
  const limitCheck = await validateDailyLimit(companyId, tradingMode)
  if (!limitCheck.valid) return limitCheck

  // 4. Basic quantity check
  if (proposal.quantity <= 0) {
    return { valid: false, reason: '수량이 0 이하입니다' }
  }

  return { valid: true }
}

// === Execution ===

/**
 * Execute validated trade proposals via KIS adapter.
 * Each proposal is validated individually; failures don't block other orders.
 */
export async function executeProposals(options: VectorExecuteOptions): Promise<VectorExecutionResult> {
  const { proposals, companyId, userId, commandId, tradingMode, vectorAgentId } = options

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
    // Validate
    const validation = await validateOrder(proposal, companyId, tradingMode)
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
): string {
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
