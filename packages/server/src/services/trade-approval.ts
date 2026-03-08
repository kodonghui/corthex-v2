// Trade Approval Service
// Handles pending_approval orders: save, approve, reject, bulk operations.
// Used when executionMode === 'approval'.

import { db } from '../db'
import { strategyOrders } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { executeOrder } from './kis-adapter'
import { eventBus } from '../lib/event-bus'
import { validateOrder } from './vector-executor'
import { getTradingSettings } from './trading-settings'
import type { TradeProposal, TradeApprovalResult } from '@corthex/shared'

export type SavePendingOptions = {
  proposals: TradeProposal[]
  companyId: string
  userId: string
  commandId: string
  tradingMode: 'real' | 'paper'
  agentId?: string
}

/**
 * Save CIO trade proposals as pending_approval orders.
 * Returns the created order IDs.
 */
export async function savePendingOrders(options: SavePendingOptions): Promise<string[]> {
  const { proposals, companyId, userId, commandId, tradingMode, agentId } = options
  const orderIds: string[] = []

  // Use dynamic confidence threshold from risk profile
  const settings = await getTradingSettings(companyId)
  const { getEffectiveValue } = await import('./trading-settings')
  const minConfPct = getEffectiveValue('minConfidence', settings)
  const minConfidence = minConfPct / 100 // stored as %, need 0-1

  for (const p of proposals) {
    if (p.confidence < minConfidence) continue // Skip below risk profile threshold

    const [order] = await db
      .insert(strategyOrders)
      .values({
        companyId,
        userId,
        agentId: agentId || null,
        ticker: p.ticker,
        tickerName: p.tickerName,
        side: p.side,
        quantity: p.quantity,
        price: p.price,
        totalAmount: p.quantity * p.price,
        orderType: p.price > 0 ? 'limit' : 'market',
        tradingMode,
        status: 'pending_approval',
        reason: `CIO 분석: ${p.reason} (확신도: ${(p.confidence * 100).toFixed(0)}%, 커맨드: ${commandId})`,
      })
      .returning({ id: strategyOrders.id })

    if (order) orderIds.push(order.id)
  }

  // Emit WebSocket notification
  if (orderIds.length > 0) {
    eventBus.emit('strategy', {
      companyId,
      payload: {
        type: 'trade:pending_approval',
        commandId,
        pendingCount: orderIds.length,
        proposals: proposals.filter(p => p.confidence >= minConfidence).map(p => ({
          ticker: p.ticker,
          tickerName: p.tickerName,
          side: p.side,
          quantity: p.quantity,
          price: p.price,
          confidence: p.confidence,
        })),
      },
    })
  }

  return orderIds
}

/**
 * Approve a single pending order and execute via KIS adapter.
 */
export async function approveOrder(
  orderId: string,
  companyId: string,
  userId: string,
): Promise<TradeApprovalResult> {
  const [order] = await db
    .select()
    .from(strategyOrders)
    .where(and(
      eq(strategyOrders.id, orderId),
      eq(strategyOrders.companyId, companyId),
      eq(strategyOrders.status, 'pending_approval'),
    ))
    .limit(1)

  if (!order) {
    return { orderId, action: 'approve', success: false, message: '승인 대기 주문을 찾을 수 없습니다' }
  }

  // Risk validation even for CEO-approved orders (position size, daily limit, daily loss)
  const settings = await getTradingSettings(companyId)
  const proposal: TradeProposal = {
    ticker: order.ticker,
    tickerName: order.tickerName,
    side: order.side,
    quantity: order.quantity,
    price: order.price,
    reason: order.reason || '',
    confidence: 1.0, // CEO-approved = max confidence (skip confidence check)
    market: order.ticker.length <= 6 ? 'KR' : 'US',
  }
  const validation = await validateOrder(proposal, companyId, order.tradingMode, settings, userId)
  if (!validation.valid) {
    await db
      .update(strategyOrders)
      .set({ status: 'failed', reason: `${order.reason} | 리스크 제어: ${validation.reason}` })
      .where(eq(strategyOrders.id, orderId))

    return { orderId, action: 'approve', success: false, message: `리스크 제어 거부: ${validation.reason}` }
  }

  try {
    const result = await executeOrder({
      companyId,
      userId,
      ticker: order.ticker,
      tickerName: order.tickerName,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      orderType: order.orderType,
      tradingMode: order.tradingMode,
      market: order.ticker.length <= 6 ? 'KR' : 'US',
      reason: `CEO 승인: ${order.reason || ''}`,
      agentId: order.agentId || undefined,
    })

    if (result.success) {
      await db
        .update(strategyOrders)
        .set({
          status: 'executed',
          kisOrderNo: result.kisOrderNo || null,
          executedAt: new Date(),
        })
        .where(eq(strategyOrders.id, orderId))

      return { orderId, action: 'approve', success: true, kisOrderNo: result.kisOrderNo }
    } else {
      await db
        .update(strategyOrders)
        .set({ status: 'failed', reason: `${order.reason} | 실행 실패: ${result.message}` })
        .where(eq(strategyOrders.id, orderId))

      return { orderId, action: 'approve', success: false, message: result.message }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await db
      .update(strategyOrders)
      .set({ status: 'failed', reason: `${order.reason} | 오류: ${msg}` })
      .where(eq(strategyOrders.id, orderId))

    return { orderId, action: 'approve', success: false, message: msg }
  }
}

/**
 * Reject a single pending order.
 */
export async function rejectOrder(
  orderId: string,
  companyId: string,
  reason?: string,
): Promise<TradeApprovalResult> {
  const [updated] = await db
    .update(strategyOrders)
    .set({
      status: 'rejected',
      reason: reason ? `거부: ${reason}` : '거부됨',
    })
    .where(and(
      eq(strategyOrders.id, orderId),
      eq(strategyOrders.companyId, companyId),
      eq(strategyOrders.status, 'pending_approval'),
    ))
    .returning({ id: strategyOrders.id })

  if (!updated) {
    return { orderId, action: 'reject', success: false, message: '승인 대기 주문을 찾을 수 없습니다' }
  }

  return { orderId, action: 'reject', success: true }
}

/**
 * Bulk approve multiple pending orders.
 */
export async function bulkApprove(
  orderIds: string[],
  companyId: string,
  userId: string,
): Promise<TradeApprovalResult[]> {
  const results: TradeApprovalResult[] = []
  for (const id of orderIds) {
    results.push(await approveOrder(id, companyId, userId))
  }
  return results
}

/**
 * Bulk reject multiple pending orders.
 */
export async function bulkReject(
  orderIds: string[],
  companyId: string,
  reason?: string,
): Promise<TradeApprovalResult[]> {
  const results: TradeApprovalResult[] = []
  for (const id of orderIds) {
    results.push(await rejectOrder(id, companyId, reason))
  }
  return results
}

/**
 * Get all pending_approval orders for a company.
 */
export async function getPendingOrders(companyId: string, userId: string) {
  return db
    .select()
    .from(strategyOrders)
    .where(and(
      eq(strategyOrders.companyId, companyId),
      eq(strategyOrders.userId, userId),
      eq(strategyOrders.status, 'pending_approval'),
    ))
}
