// ARGOS Service — Trigger CRUD + Event Management
// Story 14-3: ARGOS Trigger Condition Auto-Collect

import { db } from '../db'
import { nightJobTriggers, argosEvents, agents, cronRuns, costRecords } from '../db/schema'
import { eq, and, desc, sql, count } from 'drizzle-orm'
import { z } from 'zod'

type TriggerRow = typeof nightJobTriggers.$inferSelect
type EventRow = typeof argosEvents.$inferSelect

// === Condition Validation Schemas ===

const priceConditionSchema = z.object({
  ticker: z.string().min(1).max(20),
  market: z.enum(['KR', 'US']).optional().default('KR'),
  operator: z.enum(['above', 'below', 'change_pct_above', 'change_pct_below']),
  value: z.number(),
  dataSource: z.enum(['cached', 'realtime']).optional().default('cached'),
})

// Legacy price trigger conditions (backward compat with trigger-worker)
const legacyPriceConditionSchema = z.object({
  stockCode: z.string().min(1).max(20),
  targetPrice: z.number().positive(),
})

const newsConditionSchema = z.object({
  keywords: z.array(z.string().min(1)).min(1).max(20),
  matchMode: z.enum(['any', 'all']).optional().default('any'),
  sources: z.array(z.string()).optional(),
  excludeKeywords: z.array(z.string()).optional(),
})

const scheduleConditionSchema = z.object({
  intervalMinutes: z.number().int().min(1).max(1440),
  activeHours: z.object({
    start: z.number().int().min(0).max(23),
    end: z.number().int().min(0).max(23),
  }).optional(),
  activeDays: z.array(z.number().int().min(0).max(6)).optional(),
})

const customConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.string().min(1),
  value: z.union([z.number(), z.string()]),
  dataSource: z.string().optional(),
})

export function validateCondition(triggerType: string, condition: unknown): { valid: boolean; error?: string } {
  switch (triggerType) {
    case 'price': {
      const result = priceConditionSchema.safeParse(condition)
      return result.success ? { valid: true } : { valid: false, error: result.error.message }
    }
    case 'price-above':
    case 'price-below': {
      const result = legacyPriceConditionSchema.safeParse(condition)
      return result.success ? { valid: true } : { valid: false, error: result.error.message }
    }
    case 'news': {
      const result = newsConditionSchema.safeParse(condition)
      return result.success ? { valid: true } : { valid: false, error: result.error.message }
    }
    case 'schedule': {
      const result = scheduleConditionSchema.safeParse(condition)
      return result.success ? { valid: true } : { valid: false, error: result.error.message }
    }
    case 'custom': {
      const result = customConditionSchema.safeParse(condition)
      return result.success ? { valid: true } : { valid: false, error: result.error.message }
    }
    case 'market-open':
    case 'market-close':
      return { valid: true } // No condition needed
    default:
      return { valid: false, error: `지원하지 않는 트리거 타입: ${triggerType}` }
  }
}

// === Trigger CRUD ===

export async function createTrigger(params: {
  companyId: string
  userId: string
  agentId: string
  name?: string
  instruction: string
  triggerType: string
  condition: Record<string, unknown>
  cooldownMinutes?: number
}): Promise<TriggerRow> {
  // Validate agent belongs to company
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, params.agentId), eq(agents.companyId, params.companyId)))
    .limit(1)

  if (!agent) throw new Error('에이전트를 찾을 수 없습니다')

  // Validate condition
  const validation = validateCondition(params.triggerType, params.condition)
  if (!validation.valid) throw new Error(`조건 검증 실패: ${validation.error}`)

  const [trigger] = await db
    .insert(nightJobTriggers)
    .values({
      companyId: params.companyId,
      userId: params.userId,
      agentId: params.agentId,
      name: params.name || null,
      instruction: params.instruction,
      triggerType: params.triggerType,
      condition: params.condition,
      cooldownMinutes: params.cooldownMinutes ?? 30,
    })
    .returning()

  return trigger
}

export async function updateTrigger(
  id: string,
  companyId: string,
  updates: {
    name?: string
    instruction?: string
    triggerType?: string
    condition?: Record<string, unknown>
    cooldownMinutes?: number
    agentId?: string
  },
): Promise<TriggerRow> {
  const [existing] = await db
    .select()
    .from(nightJobTriggers)
    .where(and(eq(nightJobTriggers.id, id), eq(nightJobTriggers.companyId, companyId)))
    .limit(1)

  if (!existing) throw new Error('트리거를 찾을 수 없습니다')

  // If changing triggerType or condition, validate
  const newType = updates.triggerType || existing.triggerType
  const newCondition = updates.condition || existing.condition
  if (updates.triggerType || updates.condition) {
    const validation = validateCondition(newType, newCondition)
    if (!validation.valid) throw new Error(`조건 검증 실패: ${validation.error}`)
  }

  // If changing agentId, validate
  if (updates.agentId) {
    const [agent] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(and(eq(agents.id, updates.agentId), eq(agents.companyId, companyId)))
      .limit(1)
    if (!agent) throw new Error('에이전트를 찾을 수 없습니다')
  }

  const setValues: Record<string, unknown> = {}
  if (updates.name !== undefined) setValues.name = updates.name
  if (updates.instruction !== undefined) setValues.instruction = updates.instruction
  if (updates.triggerType !== undefined) setValues.triggerType = updates.triggerType
  if (updates.condition !== undefined) setValues.condition = updates.condition
  if (updates.cooldownMinutes !== undefined) setValues.cooldownMinutes = updates.cooldownMinutes
  if (updates.agentId !== undefined) setValues.agentId = updates.agentId

  const [updated] = await db
    .update(nightJobTriggers)
    .set(setValues)
    .where(eq(nightJobTriggers.id, id))
    .returning()

  return updated
}

export async function toggleTrigger(id: string, companyId: string): Promise<TriggerRow> {
  const [existing] = await db
    .select({ id: nightJobTriggers.id, isActive: nightJobTriggers.isActive })
    .from(nightJobTriggers)
    .where(and(eq(nightJobTriggers.id, id), eq(nightJobTriggers.companyId, companyId)))
    .limit(1)

  if (!existing) throw new Error('트리거를 찾을 수 없습니다')

  const [updated] = await db
    .update(nightJobTriggers)
    .set({ isActive: !existing.isActive })
    .where(eq(nightJobTriggers.id, id))
    .returning()

  return updated
}

export async function deleteTrigger(id: string, companyId: string): Promise<void> {
  const [existing] = await db
    .select({ id: nightJobTriggers.id })
    .from(nightJobTriggers)
    .where(and(eq(nightJobTriggers.id, id), eq(nightJobTriggers.companyId, companyId)))
    .limit(1)

  if (!existing) throw new Error('트리거를 찾을 수 없습니다')

  await db.delete(nightJobTriggers).where(eq(nightJobTriggers.id, id))
}

export async function listTriggers(companyId: string) {
  const triggers = await db
    .select({
      id: nightJobTriggers.id,
      companyId: nightJobTriggers.companyId,
      userId: nightJobTriggers.userId,
      agentId: nightJobTriggers.agentId,
      agentName: agents.name,
      name: nightJobTriggers.name,
      instruction: nightJobTriggers.instruction,
      triggerType: nightJobTriggers.triggerType,
      condition: nightJobTriggers.condition,
      cooldownMinutes: nightJobTriggers.cooldownMinutes,
      isActive: nightJobTriggers.isActive,
      lastTriggeredAt: nightJobTriggers.lastTriggeredAt,
      createdAt: nightJobTriggers.createdAt,
      eventCount: sql<number>`(SELECT COUNT(*) FROM argos_events WHERE trigger_id = ${nightJobTriggers.id})::int`,
    })
    .from(nightJobTriggers)
    .innerJoin(agents, eq(nightJobTriggers.agentId, agents.id))
    .where(eq(nightJobTriggers.companyId, companyId))
    .orderBy(desc(nightJobTriggers.createdAt))

  return triggers
}

export async function getTrigger(id: string, companyId: string) {
  const [trigger] = await db
    .select({
      id: nightJobTriggers.id,
      companyId: nightJobTriggers.companyId,
      userId: nightJobTriggers.userId,
      agentId: nightJobTriggers.agentId,
      agentName: agents.name,
      name: nightJobTriggers.name,
      instruction: nightJobTriggers.instruction,
      triggerType: nightJobTriggers.triggerType,
      condition: nightJobTriggers.condition,
      cooldownMinutes: nightJobTriggers.cooldownMinutes,
      isActive: nightJobTriggers.isActive,
      lastTriggeredAt: nightJobTriggers.lastTriggeredAt,
      createdAt: nightJobTriggers.createdAt,
    })
    .from(nightJobTriggers)
    .innerJoin(agents, eq(nightJobTriggers.agentId, agents.id))
    .where(and(eq(nightJobTriggers.id, id), eq(nightJobTriggers.companyId, companyId)))
    .limit(1)

  if (!trigger) return null

  // Get recent events (last 20)
  const events = await db
    .select()
    .from(argosEvents)
    .where(eq(argosEvents.triggerId, id))
    .orderBy(desc(argosEvents.createdAt))
    .limit(20)

  return { ...trigger, recentEvents: events }
}

// === Event Management ===

export async function createEvent(params: {
  companyId: string
  triggerId: string
  eventType: string
  eventData?: Record<string, unknown> | null
}): Promise<EventRow> {
  const [event] = await db
    .insert(argosEvents)
    .values({
      companyId: params.companyId,
      triggerId: params.triggerId,
      eventType: params.eventType,
      eventData: params.eventData || null,
      status: 'detected',
    })
    .returning()

  return event
}

export async function updateEventStatus(
  eventId: string,
  status: 'executing' | 'completed' | 'failed',
  extra?: { result?: string; error?: string; durationMs?: number; commandId?: string },
): Promise<void> {
  const setValues: Record<string, unknown> = { status }
  if (status === 'completed' || status === 'failed') {
    setValues.processedAt = new Date()
  }
  if (extra?.result !== undefined) setValues.result = extra.result
  if (extra?.error !== undefined) setValues.error = extra.error
  if (extra?.durationMs !== undefined) setValues.durationMs = extra.durationMs
  if (extra?.commandId !== undefined) setValues.commandId = extra.commandId

  await db.update(argosEvents).set(setValues).where(eq(argosEvents.id, eventId))
}

export async function listEvents(
  triggerId: string,
  companyId: string,
  options: { page?: number; limit?: number; status?: string } = {},
) {
  const page = options.page || 1
  const limit = Math.min(options.limit || 20, 100)
  const offset = (page - 1) * limit

  const conditions = [eq(argosEvents.triggerId, triggerId), eq(argosEvents.companyId, companyId)]
  if (options.status) {
    conditions.push(sql`${argosEvents.status} = ${options.status}`)
  }

  const [events, totalResult] = await Promise.all([
    db
      .select()
      .from(argosEvents)
      .where(and(...conditions))
      .orderBy(desc(argosEvents.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(argosEvents)
      .where(and(...conditions)),
  ])

  const total = totalResult[0]?.total || 0

  return {
    data: events,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// === Status ===

export async function getArgosStatus(companyId: string): Promise<{
  dataOk: boolean
  aiOk: boolean
  activeTriggersCount: number
  todayCost: number
  lastCheckAt: string | null
  dataOkReason: string
  aiOkReason: string
  costBreakdown: { cronCost: number; llmCost: number }
}> {
  // Active triggers count
  const [triggerCount] = await db
    .select({ count: count() })
    .from(nightJobTriggers)
    .where(and(eq(nightJobTriggers.companyId, companyId), eq(nightJobTriggers.isActive, true)))

  const activeTriggersCount = triggerCount?.count || 0

  // Today's cost from cron runs
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [cronCostResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(cost_micro), 0)::int` })
    .from(cronRuns)
    .where(and(
      eq(cronRuns.companyId, companyId),
      sql`${cronRuns.createdAt} >= ${todayStart}`,
    ))

  // Today's LLM cost from cost_records (source = 'job')
  const [llmCostResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(cost_usd_micro), 0)::int` })
    .from(costRecords)
    .where(and(
      eq(costRecords.companyId, companyId),
      eq(costRecords.source, 'job'),
      sql`${costRecords.createdAt} >= ${todayStart}`,
    ))

  const cronCostMicro = cronCostResult?.total || 0
  const llmCostMicro = llmCostResult?.total || 0
  const cronCost = cronCostMicro / 1_000_000
  const llmCost = llmCostMicro / 1_000_000

  // Last event check
  const [lastEvent] = await db
    .select({ createdAt: argosEvents.createdAt })
    .from(argosEvents)
    .where(eq(argosEvents.companyId, companyId))
    .orderBy(desc(argosEvents.createdAt))
    .limit(1)

  // Recent events stats (last 1 hour) for data OK/NG and AI OK/NG
  const [recentTotal] = await db
    .select({ count: count() })
    .from(argosEvents)
    .where(and(
      eq(argosEvents.companyId, companyId),
      sql`${argosEvents.createdAt} >= NOW() - INTERVAL '1 hour'`,
    ))

  const [recentFailed] = await db
    .select({ count: count() })
    .from(argosEvents)
    .where(and(
      eq(argosEvents.companyId, companyId),
      eq(argosEvents.status, 'failed'),
      sql`${argosEvents.createdAt} >= NOW() - INTERVAL '1 hour'`,
    ))

  const totalCount = recentTotal?.count || 0
  const failedCount = recentFailed?.count || 0

  // === Data OK/NG ===
  let dataOk: boolean
  let dataOkReason: string

  if (activeTriggersCount === 0) {
    dataOk = true
    dataOkReason = '활성 트리거 없음'
  } else if (totalCount === 0) {
    dataOk = false
    dataOkReason = '활성 트리거 있으나 최근 1시간 이벤트 없음'
  } else if (totalCount > 0 && failedCount / totalCount >= 0.5) {
    dataOk = false
    dataOkReason = `최근 1시간 실패율 ${Math.round(failedCount / totalCount * 100)}% (${failedCount}/${totalCount}건)`
  } else {
    dataOk = true
    dataOkReason = `최근 1시간 이벤트 ${totalCount}건, 실패 ${failedCount}건`
  }

  // === AI OK/NG ===
  let aiOk: boolean
  let aiOkReason: string

  if (failedCount >= 3) {
    aiOk = false
    aiOkReason = `최근 1시간 실패 ${failedCount}건 (임계값: 3건)`
  } else if (totalCount > 0 && failedCount / totalCount >= 0.5) {
    aiOk = false
    aiOkReason = `최근 1시간 실패율 ${Math.round(failedCount / totalCount * 100)}% (${failedCount}/${totalCount}건)`
  } else {
    aiOk = true
    aiOkReason = totalCount > 0
      ? `최근 1시간 실패 ${failedCount}/${totalCount}건`
      : '최근 1시간 이벤트 없음'
  }

  // === Last Check At (evaluator vs event, whichever is newer) ===
  let evaluatorLastCheck: Date | null = null
  try {
    const { getLastCheckAt } = await import('./argos-evaluator')
    evaluatorLastCheck = getLastCheckAt()
  } catch { /* evaluator may not be started */ }
  const eventLastCheck = lastEvent?.createdAt || null

  let lastCheckAt: string | null = null
  if (evaluatorLastCheck && eventLastCheck) {
    lastCheckAt = evaluatorLastCheck > eventLastCheck
      ? evaluatorLastCheck.toISOString()
      : eventLastCheck.toISOString()
  } else if (evaluatorLastCheck) {
    lastCheckAt = evaluatorLastCheck.toISOString()
  } else if (eventLastCheck) {
    lastCheckAt = eventLastCheck.toISOString()
  }

  return {
    dataOk,
    aiOk,
    activeTriggersCount,
    todayCost: cronCost + llmCost,
    lastCheckAt,
    dataOkReason,
    aiOkReason,
    costBreakdown: { cronCost, llmCost },
  }
}
