import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { nightJobTriggers, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const triggersRoute = new Hono<AppEnv>()

triggersRoute.use('*', authMiddleware)

const triggerTypeEnum = z.enum(['price-above', 'price-below', 'market-open', 'market-close'])

const priceConditionSchema = z.object({
  stockCode: z.string().min(1).max(20),
  targetPrice: z.number().positive(),
})

const createTriggerSchema = z.object({
  agentId: z.string().uuid(),
  instruction: z.string().min(1).max(2000),
  triggerType: triggerTypeEnum,
  condition: z.record(z.unknown()),
}).refine((data) => {
  if (data.triggerType === 'price-above' || data.triggerType === 'price-below') {
    return priceConditionSchema.safeParse(data.condition).success
  }
  return true
}, { message: '가격 트리거에는 stockCode와 targetPrice가 필요합니다' })

const updateTriggerSchema = z.object({
  instruction: z.string().min(1).max(2000).optional(),
  triggerType: triggerTypeEnum.optional(),
  condition: z.record(z.unknown()).optional(),
})

// GET /triggers — 내 트리거 목록
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
    .where(and(eq(nightJobTriggers.userId, tenant.userId), eq(nightJobTriggers.companyId, tenant.companyId)))
    .orderBy(desc(nightJobTriggers.createdAt))

  return c.json({ data: result })
})

// POST /triggers — 트리거 생성
triggersRoute.post('/', zValidator('json', createTriggerSchema), async (c) => {
  const tenant = c.get('tenant')
  const { agentId, instruction, triggerType, condition } = c.req.valid('json')

  // 에이전트 확인
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'TRIGGER_001')

  const [trigger] = await db
    .insert(nightJobTriggers)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      agentId,
      instruction,
      triggerType,
      condition,
    })
    .returning()

  return c.json({ data: trigger }, 201)
})

// PATCH /triggers/:id — 트리거 수정
triggersRoute.patch('/:id', zValidator('json', updateTriggerSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  const [existing] = await db
    .select({ id: nightJobTriggers.id })
    .from(nightJobTriggers)
    .where(and(eq(nightJobTriggers.id, id), eq(nightJobTriggers.companyId, tenant.companyId), eq(nightJobTriggers.userId, tenant.userId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '트리거를 찾을 수 없습니다', 'TRIGGER_002')

  const updates: Record<string, unknown> = {}
  if (body.instruction) updates.instruction = body.instruction
  if (body.triggerType) updates.triggerType = body.triggerType
  if (body.condition) updates.condition = body.condition

  const [updated] = await db
    .update(nightJobTriggers)
    .set(updates)
    .where(eq(nightJobTriggers.id, id))
    .returning()

  return c.json({ data: updated })
})

// PATCH /triggers/:id/toggle — isActive 토글
triggersRoute.patch('/:id/toggle', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: nightJobTriggers.id, isActive: nightJobTriggers.isActive })
    .from(nightJobTriggers)
    .where(and(eq(nightJobTriggers.id, id), eq(nightJobTriggers.companyId, tenant.companyId), eq(nightJobTriggers.userId, tenant.userId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '트리거를 찾을 수 없습니다', 'TRIGGER_002')

  const [updated] = await db
    .update(nightJobTriggers)
    .set({ isActive: !existing.isActive })
    .where(eq(nightJobTriggers.id, id))
    .returning()

  return c.json({ data: updated })
})

// DELETE /triggers/:id — 트리거 삭제
triggersRoute.delete('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: nightJobTriggers.id })
    .from(nightJobTriggers)
    .where(and(eq(nightJobTriggers.id, id), eq(nightJobTriggers.companyId, tenant.companyId), eq(nightJobTriggers.userId, tenant.userId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '트리거를 찾을 수 없습니다', 'TRIGGER_002')

  await db.delete(nightJobTriggers).where(eq(nightJobTriggers.id, id))
  return c.json({ data: { deleted: true } })
})
