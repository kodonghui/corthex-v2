import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { nightJobSchedules, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { getNextCronDate } from '../../lib/cron-utils'
import type { AppEnv } from '../../types'

export const schedulesRoute = new Hono<AppEnv>()

schedulesRoute.use('*', authMiddleware)

// frequency+time+days → cron 표현식 변환
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

// cron 표현식 → 사람이 읽을 수 있는 주기 텍스트
function describeCron(cron: string): string {
  const parts = cron.split(' ')
  const minute = parts[0]
  const hour = parts[1]
  const dow = parts[4]
  const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  if (dow === '*') return `매일 ${time}`
  if (dow === '1-5') return `평일 ${time}`
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const dayList = dow.split(',').map(d => dayNames[parseInt(d, 10)] || d).join('·')
  return `${dayList} ${time}`
}

const createScheduleSchema = z.object({
  agentId: z.string().uuid(),
  instruction: z.string().min(1).max(2000),
  frequency: z.enum(['daily', 'weekdays', 'custom']),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  days: z.array(z.number().min(0).max(6)).optional(),
})

const updateScheduleSchema = z.object({
  instruction: z.string().min(1).max(2000).optional(),
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
      agentId: nightJobSchedules.agentId,
      agentName: agents.name,
      instruction: nightJobSchedules.instruction,
      cronExpression: nightJobSchedules.cronExpression,
      nextRunAt: nightJobSchedules.nextRunAt,
      isActive: nightJobSchedules.isActive,
      createdAt: nightJobSchedules.createdAt,
      updatedAt: nightJobSchedules.updatedAt,
    })
    .from(nightJobSchedules)
    .innerJoin(agents, eq(nightJobSchedules.agentId, agents.id))
    .where(and(eq(nightJobSchedules.userId, tenant.userId), eq(nightJobSchedules.companyId, tenant.companyId)))
    .orderBy(desc(nightJobSchedules.createdAt))

  const data = result.map(s => ({
    ...s,
    description: describeCron(s.cronExpression),
  }))

  return c.json({ data })
})

// POST /schedules — 스케줄 생성
schedulesRoute.post('/', zValidator('json', createScheduleSchema), async (c) => {
  const tenant = c.get('tenant')
  const { agentId, instruction, frequency, time, days } = c.req.valid('json')

  // 에이전트 확인
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'SCHEDULE_001')

  const cronExpression = buildCronExpression(frequency, time, days)
  const nextRunAt = getNextCronDate(cronExpression)

  const [schedule] = await db
    .insert(nightJobSchedules)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      agentId,
      instruction,
      cronExpression,
      nextRunAt,
    })
    .returning()

  return c.json({ data: { ...schedule, description: describeCron(cronExpression) } }, 201)
})

// PATCH /schedules/:id — 스케줄 수정
schedulesRoute.patch('/:id', zValidator('json', updateScheduleSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  const [existing] = await db
    .select()
    .from(nightJobSchedules)
    .where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId), eq(nightJobSchedules.userId, tenant.userId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '스케줄을 찾을 수 없습니다', 'SCHEDULE_002')

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.instruction) updates.instruction = body.instruction

  if (body.frequency || body.time || body.days) {
    // 기존 cron에서 frequency 추론
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
    .where(eq(nightJobSchedules.id, id))
    .returning()

  return c.json({ data: { ...updated, description: describeCron(updated.cronExpression) } })
})

// PATCH /schedules/:id/toggle — isActive 토글
schedulesRoute.patch('/:id/toggle', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: nightJobSchedules.id, isActive: nightJobSchedules.isActive, cronExpression: nightJobSchedules.cronExpression })
    .from(nightJobSchedules)
    .where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId), eq(nightJobSchedules.userId, tenant.userId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '스케줄을 찾을 수 없습니다', 'SCHEDULE_002')

  const newActive = !existing.isActive
  const updates: Record<string, unknown> = { isActive: newActive, updatedAt: new Date() }
  // 재활성화 시 nextRunAt 갱신
  if (newActive) {
    updates.nextRunAt = getNextCronDate(existing.cronExpression)
  }

  const [updated] = await db
    .update(nightJobSchedules)
    .set(updates)
    .where(eq(nightJobSchedules.id, id))
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
    .where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId), eq(nightJobSchedules.userId, tenant.userId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '스케줄을 찾을 수 없습니다', 'SCHEDULE_002')

  await db.delete(nightJobSchedules).where(eq(nightJobSchedules.id, id))
  return c.json({ data: { deleted: true } })
})
