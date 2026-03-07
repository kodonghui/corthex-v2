import { db } from '../db'
import { commands, costRecords, agents, departments, companies } from '../db/schema'
import { and, eq, gte, lte, sql, count, sum } from 'drizzle-orm'
import { getCostSummary, getDepartmentCostBreakdown, microToUsd } from '../lib/cost-tracker'
import type { DashboardSummary, DashboardUsage, DashboardUsageDay, DashboardBudget, DashboardSatisfaction, QuickAction, LLMProviderName } from '@corthex/shared'

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

// === Quick Actions ===

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: 'daily-briefing', label: '일일 브리핑', icon: '📋', command: '/일일브리핑', presetId: null, sortOrder: 0 },
  { id: 'system-check', label: '시스템 점검', icon: '🔍', command: '/시스템점검', presetId: null, sortOrder: 1 },
  { id: 'cost-report', label: '비용 리포트', icon: '📊', command: '/비용리포트', presetId: null, sortOrder: 2 },
  { id: 'routine', label: '루틴 실행', icon: '▶️', command: '/루틴', presetId: null, sortOrder: 3 },
]

export async function getQuickActions(companyId: string): Promise<QuickAction[]> {
  const cacheKey = `${companyId}:quick-actions`
  const cached = getCached<QuickAction[]>(cacheKey)
  if (cached) return cached

  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  const settings = company?.settings as Record<string, unknown> | null
  const actions = (settings?.dashboardQuickActions as QuickAction[] | undefined) ?? DEFAULT_QUICK_ACTIONS

  setCache(cacheKey, actions, 60_000) // 1min TTL
  return actions
}

export async function updateQuickActions(companyId: string, actions: QuickAction[]): Promise<QuickAction[]> {
  const rows = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (rows.length === 0) return actions // company not found — return input as-is

  const existingSettings = (rows[0]?.settings ?? {}) as Record<string, unknown>
  const updatedSettings = { ...existingSettings, dashboardQuickActions: actions }

  await db
    .update(companies)
    .set({ settings: updatedSettings, updatedAt: new Date() })
    .where(eq(companies.id, companyId))

  // Invalidate cache
  cache.delete(`${companyId}:quick-actions`)

  return actions
}

// === Satisfaction ===

export async function getSatisfaction(companyId: string, period: '7d' | '30d' | 'all'): Promise<DashboardSatisfaction> {
  const cacheKey = `${companyId}:satisfaction:${period}`
  const cached = getCached<DashboardSatisfaction>(cacheKey)
  if (cached) return cached

  const conditions = [
    eq(commands.companyId, companyId),
    eq(commands.status, 'completed'),
  ]

  if (period !== 'all') {
    const days = period === '7d' ? 7 : 30
    const since = new Date()
    since.setDate(since.getDate() - days)
    since.setUTCHours(0, 0, 0, 0)
    conditions.push(gte(commands.createdAt, since))
  }

  // Total completed commands
  const [totalRow] = await db
    .select({ cnt: count() })
    .from(commands)
    .where(and(...conditions))

  // Positive (thumbs up)
  const [positiveRow] = await db
    .select({ cnt: count() })
    .from(commands)
    .where(and(
      ...conditions,
      sql`${commands.metadata}->'feedback'->>'rating' = 'up'`,
    ))

  // Negative (thumbs down)
  const [negativeRow] = await db
    .select({ cnt: count() })
    .from(commands)
    .where(and(
      ...conditions,
      sql`${commands.metadata}->'feedback'->>'rating' = 'down'`,
    ))

  const total = totalRow?.cnt ?? 0
  const positive = positiveRow?.cnt ?? 0
  const negative = negativeRow?.cnt ?? 0
  const neutral = total - positive - negative
  const feedbackTotal = positive + negative
  const rate = feedbackTotal > 0 ? Math.round((positive / feedbackTotal) * 100) : 0

  const result: DashboardSatisfaction = { total, positive, negative, neutral, rate, period }

  setCache(cacheKey, result, 30_000) // 30s TTL
  return result
}
