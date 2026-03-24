/**
 * Story 28.10 — Admin Capability Evaluation Routes
 *
 * GET /api/admin/capability/company-overview — all agents' latest capability scores
 * POST /api/admin/capability/:agentId/evaluate — trigger manual evaluation
 */

import { Hono } from 'hono'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { getDB } from '../../db/scoped-query'
import { evaluateAgentCapability } from '../../services/capability-evaluator'
import type { AppEnv } from '../../types'

export const adminCapabilityRoute = new Hono<AppEnv>()

adminCapabilityRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

// GET /api/admin/capability/company-overview — all agents' latest scores
adminCapabilityRoute.get('/capability/company-overview', async (c) => {
  const tenant = c.get('tenant')
  const db = getDB(tenant.companyId)
  const overview = await db.getCompanyCapabilityOverview()
  return c.json({ success: true, data: { agents: overview } })
})

// POST /api/admin/capability/:agentId/evaluate — trigger manual evaluation
adminCapabilityRoute.post('/capability/:agentId/evaluate', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')
  const score = await evaluateAgentCapability(tenant.companyId, agentId)
  return c.json({ success: true, data: score })
})
