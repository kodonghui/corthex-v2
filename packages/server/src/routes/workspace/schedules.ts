import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, count, sql } from 'drizzle-orm'
import { db } from '../../db'
import { nightJobSchedules, agents, cronRuns } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { getNextCronDate, validateCronExpression, describeCronExpression } from '../../lib/cron-utils'
import type { AppEnv } from '../../types'

export const schedulesRoute = new Hono<AppEnv>()

schedulesRoute.use('*', authMiddleware)

// frequency+time+days → cron 표현식 변환 (backward compat)
function buildCronExpression(frequency: string, time: string, days?: number[]): string {
  const [hour, minute] = time.split(':').map(Number)
  switch (frequency) {
    case 'daily':
      return `${minute} ${hour} * * *`
    case 'weekdays':
      return `${minute} ${hour} * * 1-5`
    case 'custom':
      if (!days || days.length === 0) throw new Error('custom 주기에는 요일이 필요합니다')
      return `${minute} ${hour} * * ${days.sort((a, b) => a - b).join(',')}`
    default:
      throw new Error(`지원하지 않는 주기: ${frequency}`)
  }
}

const createScheduleSchema = z.object({
  name: z.string().min(1).max(200),
  agentId: z.string().uuid(),
  instruction: z.string().min(1).max(2000),
  // Direct cron expression (new, preferred)
  cronExpression: z.string().min(9).max(100).optional(),
  // Legacy frequency-based input (backward compat)
  frequency: z.enum(['daily', 'weekdays', 'custom']).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  days: z.array(z.number().min(0).max(6)).optional(),
}).refine(
  (data) => data.cronExpression || (data.frequency && data.time),
  { message: 'cronExpression 또는 (frequency + time) 중 하나는 필수입니다' }
)

const updateScheduleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  instruction: z.string().min(1).max(2000).optional(),
  agentId: z.string().uuid().optional(),
  cronExpression: z.string().min(9).max(100).optional(),
  frequency: z.enum(['daily', 'weekdays', 'custom']).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  days: z.array(z.number().min(0).max(6)).optional(),
})

// GET /schedules — 내 스케줄 목록
schedulesRoute.get('/', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select({
      id: nightJobSchedules.id,
      name: nightJobSchedules.name,
      agentId: nightJobSchedules.agentId,
      agentName: agents.name,
      instruction: nightJobSchedules.instruction,
      cronExpression: nightJobSchedules.cronExpression,
      nextRunAt: nightJobSchedules.nextRunAt,
      lastRunAt: nightJobSchedules.lastRunAt,
      isActive: nightJobSchedules.isActive,
      createdAt: nightJobSchedules.createdAt,
      updatedAt: nightJobSchedules.updatedAt,
    })
    .from(nightJobSchedules)
    .innerJoin(agents, eq(nightJobSchedules.agentId, agents.id))
    .where(and(eq(nightJobSchedules.companyId, tenant.companyId)))
    .orderBy(desc(nightJobSchedules.createdAt))

  const data = result.map(s => ({
    ...s,
    description: describeCronExpression(s.cronExpression),
  }))

  return c.json({ data })
})

// GET /schedules/:id — 단일 스케줄 조회
schedulesRoute.get('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [schedule] = await db
    .select({
      id: nightJobSchedules.id,
      name: nightJobSchedules.name,
      agentId: nightJobSchedules.agentId,
      agentName: agents.name,
      userId: nightJobSchedules.userId,
      instruction: nightJobSchedules.instruction,
      cronExpression: nightJobSchedules.cronExpression,
      nextRunAt: nightJobSchedules.nextRunAt,
      lastRunAt: nightJobSchedules.lastRunAt,
      isActive: nightJobSchedules.isActive,
      createdAt: nightJobSchedules.createdAt,
      updatedAt: nightJobSchedules.updatedAt,
    })
    .from(nightJobSchedules)
    .innerJoin(agents, eq(nightJobSchedules.agentId, agents.id))
    .where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId)))
    .limit(1)

  if (!schedule) throw new HTTPError(404, '스케줄을 찾을 수 없습니다', 'SCHEDULE_002')

  return c.json({
    data: {
      ...schedule,
      description: describeCronExpression(schedule.cronExpression),
    },
  })
})

// POST /schedules — 스케줄 생성
schedulesRoute.post('/', zValidator('json', createScheduleSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  // 에이전트 확인
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, body.agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'SCHEDULE_001')

  // Resolve cron expression: direct or from frequency/time
  let cronExpression: string
  if (body.cronExpression) {
    const validation = validateCronExpression(body.cronExpression)
    if (!validation.valid) {
      throw new HTTPError(400, `잘못된 cron 표현식: ${validation.error}`, 'SCHEDULE_003')
    }
    cronExpression = body.cronExpression
  } else {
    cronExpression = buildCronExpression(body.frequency!, body.time!, body.days)
  }

  const nextRunAt = getNextCronDate(cronExpression)

  const [schedule] = await db
    .insert(nightJobSchedules)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      agentId: body.agentId,
      name: body.name,
      instruction: body.instruction,
      cronExpression,
      nextRunAt,
    })
    .returning()

  return c.json({
    data: {
      ...schedule,
      description: describeCronExpression(cronExpression),
    },
  }, 201)
})

// PATCH /schedules/:id — 스케줄 수정
schedulesRoute.patch('/:id', zValidator('json', updateScheduleSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  const [existing] = await db
    .select()
    .from(nightJobSchedules)
    .where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '스케줄을 찾을 수 없습니다', 'SCHEDULE_002')

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.name !== undefined) updates.name = body.name
  if (body.instruction !== undefined) updates.instruction = body.instruction

  // Agent change
  if (body.agentId !== undefined) {
    const [agent] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(and(eq(agents.id, body.agentId), eq(agents.companyId, tenant.companyId)))
      .limit(1)
    if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'SCHEDULE_001')
    updates.agentId = body.agentId
  }

  // Cron expression change: direct or frequency-based
  if (body.cronExpression) {
    const validation = validateCronExpression(body.cronExpression)
    if (!validation.valid) {
      throw new HTTPError(400, `잘못된 cron 표현식: ${validation.error}`, 'SCHEDULE_003')
    }
    updates.cronExpression = body.cronExpression
    updates.nextRunAt = getNextCronDate(body.cronExpression)
  } else if (body.frequency || body.time || body.days) {
    // Legacy frequency-based update
    const existingParts = existing.cronExpression.split(' ')
    const existingDow = existingParts[4]
    let inferredFrequency: string
    let inferredDays: number[] | undefined
    if (existingDow === '*') {
      inferredFrequency = 'daily'
    } else if (existingDow === '1-5') {
      inferredFrequency = 'weekdays'
    } else {
      inferredFrequency = 'custom'
      inferredDays = existingDow.split(',').map(Number)
    }

    const frequency = body.frequency || inferredFrequency
    const time = body.time || `${existingParts[1].padStart(2, '0')}:${existingParts[0].padStart(2, '0')}`
    const days = body.days || (frequency === 'custom' ? inferredDays : undefined)
    const cronExpression = buildCronExpression(frequency, time, days)
    updates.cronExpression = cronExpression
    updates.nextRunAt = getNextCronDate(cronExpression)
  }

  const [updated] = await db
    .update(nightJobSchedules)
    .set(updates)
    .where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId)))
    .returning()

  return c.json({
    data: {
      ...updated,
      description: describeCronExpression(updated.cronExpression),
    },
  })
})

// PATCH /schedules/:id/toggle — isActive 토글
schedulesRoute.patch('/:id/toggle', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: nightJobSchedules.id, isActive: nightJobSchedules.isActive, cronExpression: nightJobSchedules.cronExpression })
    .from(nightJobSchedules)
    .where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '스케줄을 찾을 수 없습니다', 'SCHEDULE_002')

  const newActive = !existing.isActive
  const updates: Record<string, unknown> = { isActive: newActive, updatedAt: new Date() }
  if (newActive) {
    updates.nextRunAt = getNextCronDate(existing.cronExpression)
  } else {
    updates.nextRunAt = null
  }

  const [updated] = await db
    .update(nightJobSchedules)
    .set(updates)
    .where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId)))
    .returning()

  return c.json({ data: updated })
})

// DELETE /schedules/:id — 스케줄 삭제
schedulesRoute.delete('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: nightJobSchedules.id })
    .from(nightJobSchedules)
    .where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '스케줄을 찾을 수 없습니다', 'SCHEDULE_002')

  await db.delete(nightJobSchedules).where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId)))
  return c.json({ data: { deleted: true } })
})

// GET /schedules/:id/runs — 실행 기록 (페이지네이션)
schedulesRoute.get('/:id/runs', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20', 10)))
  const statusFilter = c.req.query('status')

  // Verify schedule belongs to tenant
  const [schedule] = await db
    .select({ id: nightJobSchedules.id })
    .from(nightJobSchedules)
    .where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId)))
    .limit(1)

  if (!schedule) throw new HTTPError(404, '스케줄을 찾을 수 없습니다', 'SCHEDULE_002')

  // Build conditions
  const conditions = [eq(cronRuns.cronJobId, id), eq(cronRuns.companyId, tenant.companyId)]
  if (statusFilter && ['running', 'success', 'failed'].includes(statusFilter)) {
    conditions.push(sql`${cronRuns.status} = ${statusFilter}`)
  }

  // Count total
  const [{ total: totalCount }] = await db
    .select({ total: count() })
    .from(cronRuns)
    .where(and(...conditions))

  const total = Number(totalCount)
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit

  // Fetch page
  const runs = await db
    .select()
    .from(cronRuns)
    .where(and(...conditions))
    .orderBy(desc(cronRuns.startedAt))
    .limit(limit)
    .offset(offset)

  return c.json({
    data: runs,
    pagination: { page, limit, total, totalPages },
  })
})

// GET /schedules/:id/runs/:runId — 단일 실행 기록
schedulesRoute.get('/:id/runs/:runId', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const runId = c.req.param('runId')

  const [run] = await db
    .select()
    .from(cronRuns)
    .where(and(eq(cronRuns.id, runId), eq(cronRuns.cronJobId, id), eq(cronRuns.companyId, tenant.companyId)))
    .limit(1)

  if (!run) throw new HTTPError(404, '실행 기록을 찾을 수 없습니다', 'SCHEDULE_004')

  return c.json({ data: run })
})
