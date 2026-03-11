import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import { db } from '../../db'
import { agents, tierConfigs } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import { getDB } from '../../db/scoped-query'
import { scopedWhere } from '../../db/tenant-helpers'
import type { AppEnv } from '../../types'

export const tierConfigsRoute = new Hono<AppEnv>()

tierConfigsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

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

const reorderSchema = z.object({
  order: z.array(z.string().uuid()).min(1),
})

// GET /api/admin/tier-configs — tenant-scoped list ordered by tierLevel ASC
tierConfigsRoute.get('/tier-configs', async (c) => {
  const tenant = c.get('tenant')
  const tiers = await getDB(tenant.companyId).tierConfigs()
  return c.json({ success: true, data: tiers })
})

// POST /api/admin/tier-configs — create with auto tier_level
tierConfigsRoute.post('/tier-configs', zValidator('json', createTierConfigSchema), async (c) => {
  const tenant = c.get('tenant')
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

// PATCH /api/admin/tier-configs/:id — update fields
tierConfigsRoute.patch('/tier-configs/:id', zValidator('json', updateTierConfigSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
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

// DELETE /api/admin/tier-configs/:id — with agent reference check
tierConfigsRoute.delete('/tier-configs/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

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

// PUT /api/admin/tier-configs/reorder — reorder tiers by id array
tierConfigsRoute.put('/tier-configs/reorder', zValidator('json', reorderSchema), async (c) => {
  const tenant = c.get('tenant')
  const { order } = c.req.valid('json')

  // Verify all IDs belong to this company and all tiers are included
  const existing = await getDB(tenant.companyId).tierConfigs()
  const existingIds = new Set(existing.map(t => t.id))

  if (order.length !== existing.length) {
    throw new HTTPError(400, `모든 계층 ID를 포함해야 합니다 (${existing.length}개 필요, ${order.length}개 전달됨)`, 'TIER_002')
  }

  for (const id of order) {
    if (!existingIds.has(id)) {
      throw new HTTPError(400, `유효하지 않은 계층 ID: ${id}`, 'TIER_002')
    }
  }

  // Build old tierLevel -> new tierLevel mapping for agents update
  const oldLevelById = new Map(existing.map(t => [t.id, t.tierLevel]))

  // Use temp offset to avoid unique constraint collision during reorder
  // Step 1: Shift all to negative temp values
  // Step 2: Set final values
  const tempOffset = 1000

  for (let i = 0; i < order.length; i++) {
    await db.update(tierConfigs)
      .set({ tierLevel: tempOffset + i + 1, updatedAt: new Date() })
      .where(scopedWhere(tierConfigs.companyId, tenant.companyId, eq(tierConfigs.id, order[i])))
  }

  for (let i = 0; i < order.length; i++) {
    const newLevel = i + 1
    await db.update(tierConfigs)
      .set({ tierLevel: newLevel, updatedAt: new Date() })
      .where(scopedWhere(tierConfigs.companyId, tenant.companyId, eq(tierConfigs.id, order[i])))

    // Update agents that had the old tierLevel for this tier config
    const oldLevel = oldLevelById.get(order[i])!
    if (oldLevel !== newLevel) {
      await db.update(agents)
        .set({ tierLevel: newLevel, updatedAt: new Date() })
        .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.tierLevel, oldLevel)))
    }
  }

  // Return updated list
  const updated = await getDB(tenant.companyId).tierConfigs()
  return c.json({ success: true, data: updated })
})
