/**
 * Story 29.3: Office REST Endpoint
 *
 * GET /api/workspace/office/state — returns current office state for polling/mobile clients.
 */

import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { resolveAgentStatuses } from '../../services/office-poller'
import type { AppEnv } from '../../types'

export const officeRoute = new Hono<AppEnv>()

officeRoute.use('*', authMiddleware)

// GET /api/workspace/office/state — current office state (REST fallback for non-WS clients)
officeRoute.get('/state', async (c) => {
  const tenant = c.get('tenant')
  const agents = await resolveAgentStatuses(tenant.companyId)
  return c.json({ success: true, data: { agents } })
})
