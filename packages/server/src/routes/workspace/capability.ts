/**
 * Story 28.10 — Workspace Capability Evaluation Routes
 *
 * GET /api/workspace/capability/:agentId — evaluate and return current capability score
 * GET /api/workspace/capability/:agentId/history — capability score history (for trend chart)
 */

import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { getDB } from '../../db/scoped-query'
import { evaluateAgentCapability } from '../../services/capability-evaluator'
import type { AppEnv } from '../../types'

export const capabilityRoute = new Hono<AppEnv>()

capabilityRoute.use('*', authMiddleware)

// GET /api/workspace/capability/:agentId — evaluate current capability
capabilityRoute.get('/capability/:agentId', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')

  const score = await evaluateAgentCapability(tenant.companyId, agentId)
  return c.json({ success: true, data: score })
})

// GET /api/workspace/capability/:agentId/history — capability score history
capabilityRoute.get('/capability/:agentId/history', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')
  const limit = Math.min(Number(c.req.query('limit')) || 20, 100)

  const db = getDB(tenant.companyId)
  const history = await db.getCapabilityHistory(agentId, limit)
  return c.json({ success: true, data: history })
})
