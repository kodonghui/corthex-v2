import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'
import {
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deactivateAgent,
  previewSoul,
} from '../../services/organization'

export const agentsRoute = new Hono<AppEnv>()

agentsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

const createAgentSchema = z.object({
  userId: z.string().uuid(),
  departmentId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  nameEn: z.string().max(100).nullable().optional(),
  role: z.string().max(200).nullable().optional(),
  tier: z.enum(['manager', 'specialist', 'worker']).optional(),
  tierLevel: z.number().int().min(1).optional(),
  modelName: z.string().max(100).optional(),
  allowedTools: z.array(z.string()).optional(),
  soul: z.string().nullable().optional(),
  isSecretary: z.boolean().optional(),
  ownerUserId: z.string().uuid().nullable().optional(),
})

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameEn: z.string().max(100).nullable().optional(),
  role: z.string().max(200).nullable().optional(),
  tier: z.enum(['manager', 'specialist', 'worker']).optional(),
  tierLevel: z.number().int().min(1).optional(),
  modelName: z.string().max(100).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  allowedTools: z.array(z.string()).optional(),
  soul: z.string().nullable().optional(),
  status: z.enum(['online', 'working', 'error', 'offline']).optional(),
  isActive: z.boolean().optional(),
  isSecretary: z.boolean().optional(),
  ownerUserId: z.string().uuid().nullable().optional(),
})

const soulPreviewSchema = z.object({
  soul: z.string().optional(),
})

// GET /api/admin/agents -- tenant-scoped list with optional filters
agentsRoute.get('/agents', async (c) => {
  const tenant = c.get('tenant')
  const departmentId = c.req.query('departmentId')
  const isActiveParam = c.req.query('isActive')

  const filters: { departmentId?: string; isActive?: boolean } = {}
  if (departmentId) filters.departmentId = departmentId
  if (isActiveParam !== undefined) filters.isActive = isActiveParam === 'true'

  const result = await getAgents(tenant.companyId, Object.keys(filters).length > 0 ? filters : undefined)
  return c.json({ success: true, data: result })
})

// GET /api/admin/agents/:id -- single agent by ID
agentsRoute.get('/agents/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const agent = await getAgentById(tenant.companyId, id)
  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')
  return c.json({ success: true, data: agent })
})

// POST /api/admin/agents
agentsRoute.post('/agents', zValidator('json', createAgentSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')
  const result = await createAgent(tenant, body)
  if ('error' in result) throw new HTTPError(result.error!.status, result.error!.message, result.error!.code)
  return c.json({ success: true, data: result.data }, 201)
})

// PATCH /api/admin/agents/:id
agentsRoute.patch('/agents/:id', zValidator('json', updateAgentSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const result = await updateAgent(tenant, id, body)
  if ('error' in result) throw new HTTPError(result.error!.status, result.error!.message, result.error!.code)
  return c.json({ success: true, data: result.data })
})

// DELETE /api/admin/agents/:id?force=true -- soft deactivation (not hard delete)
agentsRoute.delete('/agents/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const force = c.req.query('force') === 'true'
  const result = await deactivateAgent(tenant, id, force)
  if ('error' in result) {
    const err = result.error!
    // Include activeTaskCount in error response for frontend modal
    if (err.code === 'AGENT_ACTIVE_SESSIONS') {
      const data = 'data' in err ? (err as { data: Record<string, unknown> }).data : undefined
      return c.json({
        success: false,
        error: { code: err.code, message: err.message },
        data,
      }, 409)
    }
    throw new HTTPError(err.status, err.message, err.code)
  }
  return c.json({ success: true, data: result.data })
})

// POST /api/admin/agents/:id/soul-preview -- render soul with {{variable}} substitution
agentsRoute.post('/agents/:id/soul-preview', zValidator('json', soulPreviewSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  // Verify agent exists and belongs to tenant
  const agent = await getAgentById(tenant.companyId, id)
  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')

  const soulText = body.soul ?? agent.soul ?? ''
  if (!soulText) {
    return c.json({ success: true, data: { rendered: '', variables: {} } })
  }

  const result = await previewSoul(tenant.companyId, id, soulText)
  return c.json({ success: true, data: result })
})
