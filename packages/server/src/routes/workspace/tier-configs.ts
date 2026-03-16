import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import { db } from '../../db'
import { agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { getDB } from '../../db/scoped-query'
import { scopedWhere } from '../../db/tenant-helpers'
import { isCeoOrAbove } from '@corthex/shared'
import type { AppEnv } from '../../types'

export const workspaceTierConfigsRoute = new Hono<AppEnv>()

workspaceTierConfigsRoute.use('*', authMiddleware)

const createTierConfigSchema = z.object({
  name: z.string().min(1).max(100),
  modelPreference: z.string().max(100).default('claude-haiku-4-5'),
  maxTools: z.number().int().min(0).default(10),
  description: z.string().nullable().optional(),
})

const updateTierConfigSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  modelPreference: z.string().max(100).optional(),
  maxTools: z.number().int().min(0).optional(),
  description: z.string().nullable().optional(),
})

// GET /api/workspace/tier-configs — tenant-scoped list ordered by tierLevel ASC
workspaceTierConfigsRoute.get('/tier-configs', async (c) => {
  const tenant = c.get('tenant')
  const tiers = await getDB(tenant.companyId).tierConfigs()
  return c.json({ success: true, data: tiers })
})

// POST /api/workspace/tier-configs — create with auto tier_level (admin/ceo only)
workspaceTierConfigsRoute.post('/tier-configs', zValidator('json', createTierConfigSchema), async (c) => {
  const tenant = c.get('tenant')

  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '계층 생성은 관리자만 가능합니다', 'AUTH_003')
  }

  const body = c.req.valid('json')

  // Auto-assign tierLevel: max existing + 1
  const existing = await getDB(tenant.companyId).tierConfigs()
  const maxLevel = existing.length > 0
    ? Math.max(...existing.map(t => t.tierLevel))
    : 0
  const newLevel = maxLevel + 1

  const [created] = await getDB(tenant.companyId).insertTierConfig({
    tierLevel: newLevel,
    name: body.name,
    modelPreference: body.modelPreference,
    maxTools: body.maxTools,
    description: body.description ?? null,
  })

  return c.json({ success: true, data: created }, 201)
})

// PATCH /api/workspace/tier-configs/:id — update fields (admin/ceo only)
workspaceTierConfigsRoute.patch('/tier-configs/:id', zValidator('json', updateTierConfigSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '계층 수정은 관리자만 가능합니다', 'AUTH_003')
  }

  const body = c.req.valid('json')

  const updated = await getDB(tenant.companyId).updateTierConfig(id, {
    ...body,
    updatedAt: new Date(),
  })

  if (updated.length === 0) {
    throw new HTTPError(404, '계층 설정을 찾을 수 없습니다', 'TIER_001')
  }

  return c.json({ success: true, data: updated[0] })
})

// DELETE /api/workspace/tier-configs/:id — with agent reference check (admin/ceo only)
workspaceTierConfigsRoute.delete('/tier-configs/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '계층 삭제는 관리자만 가능합니다', 'AUTH_003')
  }

  // Find the tier config first to get its tierLevel
  const existing = await getDB(tenant.companyId).tierConfigs()
  const target = existing.find(t => t.id === id)
  if (!target) {
    throw new HTTPError(404, '계층 설정을 찾을 수 없습니다', 'TIER_001')
  }

  // Check if any agents use this tier level
  const agentsUsingTier = await db.select({ count: sql<number>`count(*)::int` })
    .from(agents)
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.tierLevel, target.tierLevel), eq(agents.isActive, true)))

  const agentCount = agentsUsingTier[0]?.count ?? 0
  if (agentCount > 0) {
    throw new HTTPError(400, `이 계층을 사용 중인 에이전트가 ${agentCount}명 있습니다. 먼저 에이전트의 계층을 변경하세요.`, 'TIER_IN_USE')
  }

  const deleted = await getDB(tenant.companyId).deleteTierConfig(id)
  if (deleted.length === 0) {
    throw new HTTPError(404, '계층 설정을 찾을 수 없습니다', 'TIER_001')
  }

  return c.json({ success: true, data: deleted[0] })
})
