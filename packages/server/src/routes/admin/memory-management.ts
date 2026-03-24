/**
 * Story 28.9 — Admin Memory Management Routes
 *
 * Admin-level endpoints for full memory system control:
 * flagged observation review, agent memory reset, memory settings CRUD.
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { getDB } from '../../db/scoped-query'
import { getMemorySettings, saveMemorySettings } from '../../services/memory-settings'
import type { AppEnv } from '../../types'

export const memoryManagementRoute = new Hono<AppEnv>()

memoryManagementRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

// GET /api/admin/memory-management/agents — list agents with memory stats for selected company
memoryManagementRoute.get('/memory-management/agents', async (c) => {
  const tenant = c.get('tenant')
  const db = getDB(tenant.companyId)
  const stats = await db.getMemoryStats()
  return c.json({ success: true, data: { agents: stats } })
})

// GET /api/admin/memory-management/flagged — list all flagged observations
memoryManagementRoute.get('/memory-management/flagged', async (c) => {
  const tenant = c.get('tenant')
  const limit = Math.min(Number(c.req.query('limit')) || 50, 200)
  const offset = Number(c.req.query('offset')) || 0
  const db = getDB(tenant.companyId)
  const flagged = await db.listFlaggedObservations(limit, offset)
  return c.json({ success: true, data: { observations: flagged } })
})

// POST /api/admin/memory-management/flagged/:observationId/dismiss — unflag observation
memoryManagementRoute.post('/memory-management/flagged/:observationId/dismiss', async (c) => {
  const tenant = c.get('tenant')
  const observationId = c.req.param('observationId')
  const db = getDB(tenant.companyId)
  const ok = await db.unflagObservation(observationId)
  if (!ok) {
    return c.json({ success: false, error: { code: 'MEM_001', message: 'Observation not found' } }, 404)
  }
  return c.json({ success: true, data: { dismissed: true } })
})

// POST /api/admin/memory-management/flagged/:observationId/delete — delete flagged observation
memoryManagementRoute.post('/memory-management/flagged/:observationId/delete', async (c) => {
  const tenant = c.get('tenant')
  const observationId = c.req.param('observationId')
  const db = getDB(tenant.companyId)
  const ok = await db.deleteObservation(observationId)
  if (!ok) {
    return c.json({ success: false, error: { code: 'MEM_001', message: 'Observation not found' } }, 404)
  }
  return c.json({ success: true, data: { deleted: true } })
})

// DELETE /api/admin/memory-management/agent/:agentId/reset — reset all memories for agent
memoryManagementRoute.delete('/memory-management/agent/:agentId/reset', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')
  const db = getDB(tenant.companyId)
  const result = await db.resetAgentMemories(agentId)
  return c.json({ success: true, data: result })
})

// GET /api/admin/memory-management/settings — get memory settings
memoryManagementRoute.get('/memory-management/settings', async (c) => {
  const tenant = c.get('tenant')
  const settings = await getMemorySettings(tenant.companyId)
  return c.json({ success: true, data: settings })
})

// PUT /api/admin/memory-management/settings — update memory settings
const memorySettingsSchema = z.object({
  reflectedTtlDays: z.number().int().min(1).max(365).optional(),
  unreflectedTtlDays: z.number().int().min(1).max(365).optional(),
  minObservationsForReflection: z.number().int().min(1).max(1000).optional(),
  minAvgConfidence: z.number().min(0).max(1).optional(),
  maxDailyCostUsd: z.number().min(0).max(100).optional(),
  memoryDecayDays: z.number().int().min(1).max(365).optional(),
  enabled: z.boolean().optional(),
})

memoryManagementRoute.put(
  '/memory-management/settings',
  zValidator('json', memorySettingsSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const body = c.req.valid('json')
    const settings = await saveMemorySettings(tenant.companyId, body)
    return c.json({ success: true, data: settings })
  },
)
