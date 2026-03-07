import { db } from '../db'
import { commands, costRecords, agents, departments } from '../db/schema'
import { and, eq, gte, lte, sql, count, sum } from 'drizzle-orm'
import { getCostSummary, getDepartmentCostBreakdown, microToUsd } from '../lib/cost-tracker'
import type { DashboardSummary, DashboardUsage, DashboardUsageDay, DashboardBudget, LLMProviderName } from '@corthex/shared'

// === Simple TTL Cache ===

const cache = new Map<string, { data: unknown; expiresAt: number }>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache(key: string, data: unknown, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

// === Helpers ===

function todayStart(): Date {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function monthStart(): Date {
  const d = new Date()
  d.setUTCDate(1)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function daysInMonth(date: Date): number {
  return new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0).getUTCDate()
}

// Default monthly budget ($500) until Epic 7 implements budget settings
const DEFAULT_MONTHLY_BUDGET_MICRO = 500_000_000 // $500

// === DashboardService ===

/**
 * Get summary data for 4 dashboard cards
 * Cached for 30 seconds
 */
export async function getSummary(companyId: string): Promise<DashboardSummary> {
  const cacheKey = `${companyId}:summary`
  const cached = getCached<DashboardSummary>(cacheKey)
  if (cached) return cached

  const now = new Date()
  const today = todayStart()

  // 1. Task card — commands table, today only
  const taskRows = await db
    .select({
      status: commands.status,
      cnt: count(),
    })
    .from(commands)
    .where(and(
      eq(commands.companyId, companyId),
      gte(commands.createdAt, today),
    ))
    .groupBy(commands.status)

  const taskMap: Record<string, number> = {}
  for (const r of taskRows) {
    taskMap[r.status] = r.cnt
  }

  const tasks = {
    total: Object.values(taskMap).reduce((a, b) => a + b, 0),
    completed: taskMap['completed'] ?? 0,
    failed: taskMap['failed'] ?? 0,
    inProgress: (taskMap['pending'] ?? 0) + (taskMap['processing'] ?? 0),
  }

  // 2. Cost card — reuse cost-tracker
  const costSummary = await getCostSummary(companyId, { from: today, to: now })

  // Provider breakdown for today
  const providerRows = await db
    .select({
      provider: costRecords.provider,
      costMicro: sum(costRecords.costUsdMicro).mapWith(Number),
    })
    .from(costRecords)
    .where(and(
      eq(costRecords.companyId, companyId),
      gte(costRecords.createdAt, today),
      lte(costRecords.createdAt, now),
    ))
    .groupBy(costRecords.provider)

  const byProvider = providerRows.map(r => ({
    provider: r.provider as LLMProviderName,
    costUsd: microToUsd(r.costMicro ?? 0),
  }))

  // Budget usage: month-to-date / monthly budget
  const mStart = monthStart()
  const monthCost = await getCostSummary(companyId, { from: mStart, to: now })
  const budgetUsagePercent = DEFAULT_MONTHLY_BUDGET_MICRO > 0
    ? Math.round((monthCost.totalCostMicro / DEFAULT_MONTHLY_BUDGET_MICRO) * 100)
    : 0

  const cost = {
    todayUsd: microToUsd(costSummary.totalCostMicro),
    byProvider,
    budgetUsagePercent,
  }

  // 3. Agent card
  const agentRows = await db
    .select({
      status: agents.status,
      cnt: count(),
    })
    .from(agents)
    .where(and(eq(agents.companyId, companyId), eq(agents.isActive, true)))
    .groupBy(agents.status)

  const agentMap: Record<string, number> = {}
  for (const r of agentRows) {
    agentMap[r.status] = r.cnt
  }

  const agentData = {
    total: Object.values(agentMap).reduce((a, b) => a + b, 0),
    active: (agentMap['online'] ?? 0) + (agentMap['working'] ?? 0),
    idle: agentMap['offline'] ?? 0,
    error: agentMap['error'] ?? 0,
  }

  // 4. Integration card — check if providers had activity in last 30 min
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000)
  const recentProviders = await db
    .select({ provider: costRecords.provider })
    .from(costRecords)
    .where(and(
      eq(costRecords.companyId, companyId),
      gte(costRecords.createdAt, thirtyMinAgo),
    ))
    .groupBy(costRecords.provider)

  const activeProviders = new Set(recentProviders.map(r => r.provider))
  const allProviders: LLMProviderName[] = ['anthropic', 'openai', 'google']
  const providers = allProviders.map(name => ({
    name,
    status: activeProviders.has(name) ? 'up' as const : 'down' as const,
  }))

  const integrations = {
    providers,
    toolSystemOk: true, // ToolPool is loaded at server start; assume ok
  }

  const result: DashboardSummary = { tasks, cost, agents: agentData, integrations }

  setCache(cacheKey, result, 30_000) // 30s TTL
  return result
}

/**
 * Get AI usage chart data by provider per day
 * Cached for 5 minutes
 */
export async function getUsage(companyId: string, days: number): Promise<DashboardUsage> {
  const cacheKey = `${companyId}:usage:${days}`
  const cached = getCached<DashboardUsage>(cacheKey)
  if (cached) return cached

  const since = new Date()
  since.setDate(since.getDate() - days)
  since.setUTCHours(0, 0, 0, 0)

  const rows = await db
    .select({
      date: sql<string>`DATE(${costRecords.createdAt})`.as('date'),
      provider: costRecords.provider,
      inputTokens: sum(costRecords.inputTokens).mapWith(Number),
      outputTokens: sum(costRecords.outputTokens).mapWith(Number),
      costMicro: sum(costRecords.costUsdMicro).mapWith(Number),
    })
    .from(costRecords)
    .where(and(
      eq(costRecords.companyId, companyId),
      gte(costRecords.createdAt, since),
    ))
    .groupBy(sql`DATE(${costRecords.createdAt})`, costRecords.provider)
    .orderBy(sql`DATE(${costRecords.createdAt})`)

  const usage: DashboardUsageDay[] = rows.map(r => ({
    date: String(r.date),
    provider: r.provider as LLMProviderName,
    inputTokens: r.inputTokens ?? 0,
    outputTokens: r.outputTokens ?? 0,
    costUsd: microToUsd(r.costMicro ?? 0),
  }))

  const result: DashboardUsage = { days, usage }

  setCache(cacheKey, result, 300_000) // 5min TTL
  return result
}

/**
 * Get budget progress for current month
 * Cached for 5 minutes
 */
export async function getBudget(companyId: string): Promise<DashboardBudget> {
  const cacheKey = `${companyId}:budget`
  const cached = getCached<DashboardBudget>(cacheKey)
  if (cached) return cached

  const now = new Date()
  const mStart = monthStart()
  const totalDaysInMonth = daysInMonth(now)
  const daysElapsed = now.getUTCDate()

  // Total month spend
  const monthCost = await getCostSummary(companyId, { from: mStart, to: now })
  const currentMonthSpendMicro = monthCost.totalCostMicro

  // Department breakdown
  const deptBreakdown = await getDepartmentCostBreakdown(companyId, { from: mStart, to: now })

  // Linear extrapolation
  const projectedMicro = daysElapsed > 0
    ? Math.round((currentMonthSpendMicro / daysElapsed) * totalDaysInMonth)
    : 0

  const usagePercent = DEFAULT_MONTHLY_BUDGET_MICRO > 0
    ? Math.round((currentMonthSpendMicro / DEFAULT_MONTHLY_BUDGET_MICRO) * 100)
    : 0

  const result: DashboardBudget = {
    currentMonthSpendUsd: microToUsd(currentMonthSpendMicro),
    monthlyBudgetUsd: microToUsd(DEFAULT_MONTHLY_BUDGET_MICRO),
    usagePercent,
    projectedMonthEndUsd: microToUsd(projectedMicro),
    isDefaultBudget: true,
    byDepartment: deptBreakdown.items.map(item => ({
      departmentId: item.key,
      name: item.label,
      costUsd: microToUsd(item.costMicro),
    })),
  }

  setCache(cacheKey, result, 300_000) // 5min TTL
  return result
}
