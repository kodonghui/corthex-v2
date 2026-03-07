import { db } from '../db'
import { costRecords, agents, departments } from '../db/schema'
import { getModelConfig } from '../config/models'
import { sql, and, eq, gte, lte, sum, count } from 'drizzle-orm'
import type { LLMProviderName } from '@corthex/shared'
import { eventBus } from './event-bus'

// Fallback pricing for unknown models (Claude Sonnet level)
const DEFAULT_PRICING = { input: 3, output: 15 }

/**
 * Get pricing from models.yaml, fallback to hardcoded defaults
 */
function getModelPricing(model: string): { input: number; output: number } {
  const config = getModelConfig(model)
  if (config) {
    return { input: config.inputPricePer1M, output: config.outputPricePer1M }
  }
  return DEFAULT_PRICING
}

/**
 * Calculate cost in microdollars (1 microdollar = $0.000001)
 * Batch API calls get 50% discount per standard provider pricing
 */
export function calculateCostMicro(model: string, inputTokens: number, outputTokens: number, isBatch = false): number {
  if (inputTokens < 0 || outputTokens < 0) return 0
  const pricing = getModelPricing(model)
  const discount = isBatch ? 0.5 : 1.0
  const inputCost = (inputTokens / 1_000_000) * pricing.input * 1_000_000 * discount
  const outputCost = (outputTokens / 1_000_000) * pricing.output * 1_000_000 * discount
  return Math.round(inputCost + outputCost)
}

export type RecordParams = {
  companyId: string
  agentId?: string
  sessionId?: string
  provider?: LLMProviderName
  model: string
  inputTokens: number
  outputTokens: number
  source: 'chat' | 'delegation' | 'job' | 'sns' | 'batch'
  isBatch?: boolean
}

/**
 * Record AI cost (fire-and-forget)
 */
export async function recordCost(params: RecordParams): Promise<void> {
  try {
    const costMicro = calculateCostMicro(params.model, params.inputTokens, params.outputTokens, params.isBatch)

    // Resolve provider from model config if not provided
    const provider = params.provider ?? getModelConfig(params.model)?.provider ?? 'anthropic'

    await db.insert(costRecords).values({
      companyId: params.companyId,
      agentId: params.agentId,
      sessionId: params.sessionId,
      provider,
      model: params.model,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      costUsdMicro: costMicro,
      source: params.source,
      isBatch: params.isBatch ?? false,
    })

    // Broadcast cost event for real-time dashboard updates
    eventBus.emit('cost', {
      companyId: params.companyId,
      payload: {
        type: 'cost-recorded',
        provider,
        model: params.model,
        costUsdMicro: costMicro,
        source: params.source,
      },
    })
  } catch (err) {
    console.error('[CostTracker] 비용 기록 실패:', err)
  }
}

/**
 * microdollars to USD (display)
 */
export function microToUsd(micro: number): number {
  return micro / 1_000_000
}

// === Cost Query Types ===

export type DateRange = { from: Date; to: Date }

export type CostSummary = {
  totalInputTokens: number
  totalOutputTokens: number
  totalCostMicro: number
  recordCount: number
  byDate: Array<{ date: string; costMicro: number; recordCount: number }>
}

export type CostBreakdownItem = {
  key: string
  label: string
  inputTokens: number
  outputTokens: number
  costMicro: number
  recordCount: number
}

export type CostBreakdown = {
  items: CostBreakdownItem[]
  total: { inputTokens: number; outputTokens: number; costMicro: number }
}

// === Cost Query Helpers (for Epic 7) ===

/**
 * Get cost summary for a company within a date range
 */
export async function getCostSummary(companyId: string, range: DateRange): Promise<CostSummary> {
  const conditions = [
    eq(costRecords.companyId, companyId),
    gte(costRecords.createdAt, range.from),
    lte(costRecords.createdAt, range.to),
  ]

  // Totals
  const [totals] = await db
    .select({
      totalInputTokens: sum(costRecords.inputTokens).mapWith(Number),
      totalOutputTokens: sum(costRecords.outputTokens).mapWith(Number),
      totalCostMicro: sum(costRecords.costUsdMicro).mapWith(Number),
      recordCount: count(),
    })
    .from(costRecords)
    .where(and(...conditions))

  // By date
  const byDate = await db
    .select({
      date: sql<string>`DATE(${costRecords.createdAt})`.as('date'),
      costMicro: sum(costRecords.costUsdMicro).mapWith(Number),
      recordCount: count(),
    })
    .from(costRecords)
    .where(and(...conditions))
    .groupBy(sql`DATE(${costRecords.createdAt})`)
    .orderBy(sql`DATE(${costRecords.createdAt})`)

  return {
    totalInputTokens: totals?.totalInputTokens ?? 0,
    totalOutputTokens: totals?.totalOutputTokens ?? 0,
    totalCostMicro: totals?.totalCostMicro ?? 0,
    recordCount: totals?.recordCount ?? 0,
    byDate: byDate.map(d => ({
      date: String(d.date),
      costMicro: d.costMicro ?? 0,
      recordCount: d.recordCount ?? 0,
    })),
  }
}

/**
 * Get per-model cost breakdown for a specific agent
 */
export async function getAgentCostBreakdown(companyId: string, agentId: string, range: DateRange): Promise<CostBreakdown> {
  const rows = await db
    .select({
      model: costRecords.model,
      inputTokens: sum(costRecords.inputTokens).mapWith(Number),
      outputTokens: sum(costRecords.outputTokens).mapWith(Number),
      costMicro: sum(costRecords.costUsdMicro).mapWith(Number),
      recordCount: count(),
    })
    .from(costRecords)
    .where(and(
      eq(costRecords.companyId, companyId),
      eq(costRecords.agentId, agentId),
      gte(costRecords.createdAt, range.from),
      lte(costRecords.createdAt, range.to),
    ))
    .groupBy(costRecords.model)

  const items: CostBreakdownItem[] = rows.map(r => ({
    key: r.model,
    label: getModelConfig(r.model)?.displayName ?? r.model,
    inputTokens: r.inputTokens ?? 0,
    outputTokens: r.outputTokens ?? 0,
    costMicro: r.costMicro ?? 0,
    recordCount: r.recordCount ?? 0,
  }))

  const total = items.reduce(
    (acc, i) => ({
      inputTokens: acc.inputTokens + i.inputTokens,
      outputTokens: acc.outputTokens + i.outputTokens,
      costMicro: acc.costMicro + i.costMicro,
    }),
    { inputTokens: 0, outputTokens: 0, costMicro: 0 },
  )

  return { items, total }
}

/**
 * Get per-department cost breakdown (joins agents -> departments)
 * Note: Excludes cost records with null agentId (system calls) and agents without departments.
 * Use getCostSummary for total costs including unassigned.
 */
export async function getDepartmentCostBreakdown(companyId: string, range: DateRange): Promise<CostBreakdown> {
  const rows = await db
    .select({
      departmentId: agents.departmentId,
      departmentName: departments.name,
      inputTokens: sum(costRecords.inputTokens).mapWith(Number),
      outputTokens: sum(costRecords.outputTokens).mapWith(Number),
      costMicro: sum(costRecords.costUsdMicro).mapWith(Number),
      recordCount: count(),
    })
    .from(costRecords)
    .innerJoin(agents, eq(costRecords.agentId, agents.id))
    .innerJoin(departments, eq(agents.departmentId, departments.id))
    .where(and(
      eq(costRecords.companyId, companyId),
      gte(costRecords.createdAt, range.from),
      lte(costRecords.createdAt, range.to),
    ))
    .groupBy(agents.departmentId, departments.name)

  const items: CostBreakdownItem[] = rows.map(r => ({
    key: r.departmentId ?? 'unknown',
    label: r.departmentName ?? 'Unknown',
    inputTokens: r.inputTokens ?? 0,
    outputTokens: r.outputTokens ?? 0,
    costMicro: r.costMicro ?? 0,
    recordCount: r.recordCount ?? 0,
  }))

  const total = items.reduce(
    (acc, i) => ({
      inputTokens: acc.inputTokens + i.inputTokens,
      outputTokens: acc.outputTokens + i.outputTokens,
      costMicro: acc.costMicro + i.costMicro,
    }),
    { inputTokens: 0, outputTokens: 0, costMicro: 0 },
  )

  return { items, total }
}

/**
 * Get per-model cost breakdown for entire company
 */
export async function getModelCostBreakdown(companyId: string, range: DateRange): Promise<CostBreakdown> {
  const rows = await db
    .select({
      model: costRecords.model,
      inputTokens: sum(costRecords.inputTokens).mapWith(Number),
      outputTokens: sum(costRecords.outputTokens).mapWith(Number),
      costMicro: sum(costRecords.costUsdMicro).mapWith(Number),
      recordCount: count(),
    })
    .from(costRecords)
    .where(and(
      eq(costRecords.companyId, companyId),
      gte(costRecords.createdAt, range.from),
      lte(costRecords.createdAt, range.to),
    ))
    .groupBy(costRecords.model)

  const items: CostBreakdownItem[] = rows.map(r => ({
    key: r.model,
    label: getModelConfig(r.model)?.displayName ?? r.model,
    inputTokens: r.inputTokens ?? 0,
    outputTokens: r.outputTokens ?? 0,
    costMicro: r.costMicro ?? 0,
    recordCount: r.recordCount ?? 0,
  }))

  const total = items.reduce(
    (acc, i) => ({
      inputTokens: acc.inputTokens + i.inputTokens,
      outputTokens: acc.outputTokens + i.outputTokens,
      costMicro: acc.costMicro + i.costMicro,
    }),
    { inputTokens: 0, outputTokens: 0, costMicro: 0 },
  )

  return { items, total }
}
