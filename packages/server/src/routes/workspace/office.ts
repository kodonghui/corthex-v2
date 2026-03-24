/**
 * Story 29.3 + 29.8: Office REST Endpoints
 *
 * GET  /api/workspace/office/state — returns current office state
 * PUT  /api/workspace/office/agent/:agentId/sprite — update agent sprite settings
 */

import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { resolveAgentStatuses } from '../../services/office-poller'
import { updateAgentSprite, getAgentState } from '../../services/office-state'
import type { AppEnv } from '../../types'
import type { AgentSpriteSettings } from '@corthex/shared'

export const officeRoute = new Hono<AppEnv>()

officeRoute.use('*', authMiddleware)

// GET /api/workspace/office/state — current office state (REST fallback for non-WS clients)
officeRoute.get('/state', async (c) => {
  const tenant = c.get('tenant')
  const agents = await resolveAgentStatuses(tenant.companyId)
  return c.json({ success: true, data: { agents } })
})

// PUT /api/workspace/office/agent/:agentId/sprite — update sprite customization
officeRoute.put('/agent/:agentId/sprite', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')

  let body: AgentSpriteSettings
  try {
    body = await c.req.json()
  } catch {
    return c.json(
      { success: false, error: { code: 'INVALID_BODY', message: 'Invalid JSON body' } },
      400,
    )
  }

  // Validate color format if provided
  if (body.color && !/^#[0-9a-fA-F]{6}$/.test(body.color)) {
    return c.json(
      { success: false, error: { code: 'INVALID_COLOR', message: 'Color must be #RRGGBB hex' } },
      400,
    )
  }

  // Validate icon length if provided
  if (body.icon && body.icon.length > 10) {
    return c.json(
      { success: false, error: { code: 'INVALID_ICON', message: 'Icon too long (max 10 chars)' } },
      400,
    )
  }

  const sprite: AgentSpriteSettings = {}
  if (body.color) sprite.color = body.color
  if (body.icon) sprite.icon = body.icon

  updateAgentSprite(tenant.companyId, agentId, sprite)

  const updated = getAgentState(tenant.companyId, agentId)
  if (!updated) {
    return c.json(
      { success: false, error: { code: 'AGENT_NOT_FOUND', message: 'Agent not in office state' } },
      404,
    )
  }

  return c.json({ success: true, data: { agent: updated } })
})
