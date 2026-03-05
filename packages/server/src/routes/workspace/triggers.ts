import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { nightJobTriggers, nightJobs, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const triggersRoute = new Hono<AppEnv>()

triggersRoute.use('*', authMiddleware)

const triggerTypeEnum = z.enum(['price-above', 'price-below', 'market-open', 'market-close'])

const conditionSchema = z.object({
  symbol: z.string().min(1).optional(),
  targetPrice: z.number().positive().optional(),
})

const createTriggerSchema = z.object({
  agentId: z.string().uuid(),
  instruction: z.string().min(1),
  triggerType: triggerTypeEnum,
  condition: conditionSchema,
  isActive: z.boolean().optional().default(true),
}).refine((data) => {
  // price 트리거는 symbol + targetPrice 필수
  if (data.triggerType === 'price-above' || data.triggerType === 'price-below') {
    return !!data.condition.symbol && !!data.condition.targetPrice
  }
  return true
}, { message: 'price 트리거는 종목코드와 목표가가 필요합니다' })

const updateTriggerSchema = z.object({
  instruction: z.string().min(1).optional(),
  triggerType: triggerTypeEnum.optional(),
  condition: conditionSchema.optional(),
  isActive: z.boolean().optional(),
})

// POST /api/workspace/triggers — 트리거 생성
triggersRoute.post('/', zValidator('json', createTriggerSchema), async (c) => {
  const tenant = c.get('tenant')
  const { agentId, instruction, triggerType, condition, isActive } = c.req.valid('json')

  // 에이전트 소속 확인
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'TRIGGER_003')

  const [trigger] = await db
    .insert(nightJobTriggers)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      agentId,
      instruction,
      triggerType,
      condition,
      isActive,
    })
    .returning()

  return c.json({ data: trigger }, 201)
})

// GET /api/workspace/triggers — 내 트리거 목록
triggersRoute.get('/', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select({
      id: nightJobTriggers.id,
      agentId: nightJobTriggers.agentId,
      agentName: agents.name,
      instruction: nightJobTriggers.instruction,
      triggerType: nightJobTriggers.triggerType,
      condition: nightJobTriggers.condition,
      isActive: nightJobTriggers.isActive,
      lastTriggeredAt: nightJobTriggers.lastTriggeredAt,
      createdAt: nightJobTriggers.createdAt,
    })
    .from(nightJobTriggers)
    .innerJoin(agents, eq(nightJobTriggers.agentId, agents.id))
    .where(and(
      eq(nightJobTriggers.userId, tenant.userId),
      eq(nightJobTriggers.companyId, tenant.companyId),
    ))
    .orderBy(desc(nightJobTriggers.createdAt))

  return c.json({ data: result })
})

// PATCH /api/workspace/triggers/:id — 트리거 수정
triggersRoute.patch(
  '/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  zValidator('json', updateTriggerSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    const [existing] = await db
      .select({ id: nightJobTriggers.id, userId: nightJobTriggers.userId })
      .from(nightJobTriggers)
      .where(and(eq(nightJobTriggers.id, id), eq(nightJobTriggers.companyId, tenant.companyId)))
      .limit(1)

    if (!existing) throw new HTTPError(404, '트리거를 찾을 수 없습니다', 'TRIGGER_002')
    if (existing.userId !== tenant.userId) throw new HTTPError(403, '트리거 소유자만 수정할 수 있습니다', 'TRIGGER_003')

    const updateData: Record<string, unknown> = {}
    if (body.instruction !== undefined) updateData.instruction = body.instruction
    if (body.triggerType !== undefined) updateData.triggerType = body.triggerType
    if (body.condition !== undefined) updateData.condition = body.condition
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const [updated] = await db
      .update(nightJobTriggers)
      .set(updateData)
      .where(eq(nightJobTriggers.id, id))
      .returning()

    return c.json({ data: updated })
  },
)

// DELETE /api/workspace/triggers/:id — 트리거 삭제
triggersRoute.delete(
  '/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')

    const [existing] = await db
      .select({ id: nightJobTriggers.id, userId: nightJobTriggers.userId })
      .from(nightJobTriggers)
      .where(and(eq(nightJobTriggers.id, id), eq(nightJobTriggers.companyId, tenant.companyId)))
      .limit(1)

    if (!existing) throw new HTTPError(404, '트리거를 찾을 수 없습니다', 'TRIGGER_002')
    if (existing.userId !== tenant.userId) throw new HTTPError(403, '트리거 소유자만 삭제할 수 있습니다', 'TRIGGER_003')

    // 연결된 queued 작업도 삭제
    await db
      .delete(nightJobs)
      .where(and(eq(nightJobs.triggerId, id), eq(nightJobs.status, 'queued')))

    await db.delete(nightJobTriggers).where(eq(nightJobTriggers.id, id))

    return c.json({ data: { deleted: true } })
  },
)
