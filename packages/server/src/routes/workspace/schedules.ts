import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { nightJobSchedules, nightJobs, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { parseCron, getNextRunAt } from '../../lib/cron-utils'
import type { AppEnv } from '../../types'

export const schedulesRoute = new Hono<AppEnv>()

schedulesRoute.use('*', authMiddleware)

const createScheduleSchema = z.object({
  agentId: z.string().uuid(),
  instruction: z.string().min(1),
  cronExpression: z.string().min(1),
  isActive: z.boolean().optional().default(true),
})

const updateScheduleSchema = z.object({
  instruction: z.string().min(1).optional(),
  cronExpression: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

// POST /api/workspace/schedules — 스케줄 생성
schedulesRoute.post('/', zValidator('json', createScheduleSchema), async (c) => {
  const tenant = c.get('tenant')
  const { agentId, instruction, cronExpression, isActive } = c.req.valid('json')

  if (!parseCron(cronExpression)) {
    throw new HTTPError(400, '유효하지 않은 cron 식입니다', 'SCHEDULE_001')
  }

  // 에이전트 소속 확인
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'SCHEDULE_003')

  const nextRunAt = getNextRunAt(cronExpression)

  const [schedule] = await db
    .insert(nightJobSchedules)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      agentId,
      instruction,
      cronExpression,
      isActive,
      nextRunAt,
    })
    .returning()

  return c.json({ data: schedule }, 201)
})

// GET /api/workspace/schedules — 내 스케줄 목록
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
    .where(and(
      eq(nightJobSchedules.userId, tenant.userId),
      eq(nightJobSchedules.companyId, tenant.companyId),
    ))
    .orderBy(desc(nightJobSchedules.updatedAt))

  return c.json({ data: result })
})

// PATCH /api/workspace/schedules/:id — 스케줄 수정
schedulesRoute.patch(
  '/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  zValidator('json', updateScheduleSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    // 소유자 확인
    const [existing] = await db
      .select({ id: nightJobSchedules.id, userId: nightJobSchedules.userId })
      .from(nightJobSchedules)
      .where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId)))
      .limit(1)

    if (!existing) throw new HTTPError(404, '스케줄을 찾을 수 없습니다', 'SCHEDULE_002')
    if (existing.userId !== tenant.userId) throw new HTTPError(403, '스케줄 소유자만 수정할 수 있습니다', 'SCHEDULE_003')

    // cron 식 유효성 검증
    if (body.cronExpression && !parseCron(body.cronExpression)) {
      throw new HTTPError(400, '유효하지 않은 cron 식입니다', 'SCHEDULE_001')
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (body.instruction !== undefined) updateData.instruction = body.instruction
    if (body.cronExpression !== undefined) {
      updateData.cronExpression = body.cronExpression
      updateData.nextRunAt = getNextRunAt(body.cronExpression)
    }
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const [updated] = await db
      .update(nightJobSchedules)
      .set(updateData)
      .where(eq(nightJobSchedules.id, id))
      .returning()

    return c.json({ data: updated })
  },
)

// DELETE /api/workspace/schedules/:id — 스케줄 삭제
schedulesRoute.delete(
  '/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')

    const [existing] = await db
      .select({ id: nightJobSchedules.id, userId: nightJobSchedules.userId })
      .from(nightJobSchedules)
      .where(and(eq(nightJobSchedules.id, id), eq(nightJobSchedules.companyId, tenant.companyId)))
      .limit(1)

    if (!existing) throw new HTTPError(404, '스케줄을 찾을 수 없습니다', 'SCHEDULE_002')
    if (existing.userId !== tenant.userId) throw new HTTPError(403, '스케줄 소유자만 삭제할 수 있습니다', 'SCHEDULE_003')

    // 연결된 queued 작업도 삭제
    await db
      .delete(nightJobs)
      .where(and(eq(nightJobs.scheduleId, id), eq(nightJobs.status, 'queued')))

    await db.delete(nightJobSchedules).where(eq(nightJobSchedules.id, id))

    return c.json({ data: { deleted: true } })
  },
)
