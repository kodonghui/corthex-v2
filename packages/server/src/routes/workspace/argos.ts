// ARGOS REST API — Trigger CRUD + Events + Status
// Story 14-3: ARGOS Trigger Condition Auto-Collect

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import {
  createTrigger,
  updateTrigger,
  toggleTrigger,
  deleteTrigger,
  listTriggers,
  getTrigger,
  listEvents,
  getArgosStatus,
} from '../../services/argos-service'
import type { AppEnv } from '../../types'

export const argosRoute = new Hono<AppEnv>()

argosRoute.use('*', authMiddleware)

// === Validation Schemas ===

const createTriggerSchema = z.object({
  name: z.string().max(200).optional(),
  agentId: z.string().uuid(),
  instruction: z.string().min(1).max(2000),
  triggerType: z.enum(['price', 'price-above', 'price-below', 'market-open', 'market-close', 'news', 'schedule', 'custom']),
  condition: z.record(z.unknown()),
  cooldownMinutes: z.number().int().min(1).max(1440).optional(),
})

const updateTriggerSchema = z.object({
  name: z.string().max(200).optional(),
  agentId: z.string().uuid().optional(),
  instruction: z.string().min(1).max(2000).optional(),
  triggerType: z.enum(['price', 'price-above', 'price-below', 'market-open', 'market-close', 'news', 'schedule', 'custom']).optional(),
  condition: z.record(z.unknown()).optional(),
  cooldownMinutes: z.number().int().min(1).max(1440).optional(),
})

// === GET /status — ARGOS system status (4 metrics) ===
argosRoute.get('/status', async (c) => {
  const tenant = c.get('tenant')
  const status = await getArgosStatus(tenant.companyId)
  return c.json({ data: status })
})

// === GET /triggers — List all triggers ===
argosRoute.get('/triggers', async (c) => {
  const tenant = c.get('tenant')
  const triggers = await listTriggers(tenant.companyId)
  return c.json({ data: triggers })
})

// === GET /triggers/:id — Get single trigger with recent events ===
argosRoute.get('/triggers/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const trigger = await getTrigger(id, tenant.companyId)
  if (!trigger) throw new HTTPError(404, '트리거를 찾을 수 없습니다', 'ARGOS_001')

  return c.json({ data: trigger })
})

// === POST /triggers — Create trigger ===
argosRoute.post('/triggers', zValidator('json', createTriggerSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  try {
    const trigger = await createTrigger({
      companyId: tenant.companyId,
      userId: tenant.userId,
      agentId: body.agentId,
      name: body.name,
      instruction: body.instruction,
      triggerType: body.triggerType,
      condition: body.condition as Record<string, unknown>,
      cooldownMinutes: body.cooldownMinutes,
    })

    return c.json({ data: trigger }, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : '트리거 생성 실패'
    throw new HTTPError(400, message, 'ARGOS_002')
  }
})

// === PATCH /triggers/:id — Update trigger ===
argosRoute.patch('/triggers/:id', zValidator('json', updateTriggerSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  try {
    const updated = await updateTrigger(id, tenant.companyId, {
      name: body.name,
      agentId: body.agentId,
      instruction: body.instruction,
      triggerType: body.triggerType,
      condition: body.condition as Record<string, unknown> | undefined,
      cooldownMinutes: body.cooldownMinutes,
    })

    return c.json({ data: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : '트리거 수정 실패'
    if (message.includes('찾을 수 없습니다')) throw new HTTPError(404, message, 'ARGOS_001')
    throw new HTTPError(400, message, 'ARGOS_003')
  }
})

// === PATCH /triggers/:id/toggle — Toggle isActive ===
argosRoute.patch('/triggers/:id/toggle', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  try {
    const updated = await toggleTrigger(id, tenant.companyId)
    return c.json({ data: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : '트리거 토글 실패'
    throw new HTTPError(404, message, 'ARGOS_001')
  }
})

// === DELETE /triggers/:id — Delete trigger ===
argosRoute.delete('/triggers/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  try {
    await deleteTrigger(id, tenant.companyId)
    return c.json({ data: { deleted: true } })
  } catch (err) {
    const message = err instanceof Error ? err.message : '트리거 삭제 실패'
    throw new HTTPError(404, message, 'ARGOS_001')
  }
})

// === GET /triggers/:id/events — Paginated event history ===
argosRoute.get('/triggers/:id/events', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const page = Number(c.req.query('page') || '1')
  const limit = Number(c.req.query('limit') || '20')
  const status = c.req.query('status')

  // Verify trigger belongs to company
  const trigger = await getTrigger(id, tenant.companyId)
  if (!trigger) throw new HTTPError(404, '트리거를 찾을 수 없습니다', 'ARGOS_001')

  const result = await listEvents(id, tenant.companyId, { page, limit, status })
  return c.json(result)
})
