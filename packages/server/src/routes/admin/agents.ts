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
import { getCacheRecommendation } from '../../lib/tool-cache-config'
import { PERSONALITY_PRESETS } from '@corthex/shared'

export const agentsRoute = new Hono<AppEnv>()

agentsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

// Story 24.1: Big Five personality traits (OCEAN model, 0-100 each)
// D33 suggests z.record() but z.object().strict() is superior — enforces exact key names, not just value types
const personalityTraitsSchema = z.object({
  openness: z.number().int().min(0).max(100),
  conscientiousness: z.number().int().min(0).max(100),
  extraversion: z.number().int().min(0).max(100),
  agreeableness: z.number().int().min(0).max(100),
  neuroticism: z.number().int().min(0).max(100),
}).strict()

const createAgentSchema = z.object({
  userId: z.string().uuid().nullable().optional(),
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
  personalityTraits: personalityTraitsSchema.nullable().optional(),
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
  enableSemanticCache: z.boolean().optional(),
  personalityTraits: personalityTraitsSchema.nullable().optional(),  // full replacement only, no partial merge
})

const soulPreviewSchema = z.object({
  soul: z.string().optional(),
  personalityTraits: personalityTraitsSchema.optional(),  // Story 24.6: A/B preview override (UXR136)
})

// GET /api/admin/agents/personality-presets -- Story 24.4: preset personality templates (AR30, FR-PERS6)
agentsRoute.get('/agents/personality-presets', async (c) => {
  return c.json({ success: true, data: PERSONALITY_PRESETS })
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
  // AR31: NULL personality_traits → empty object
  const data = result.map((a: Record<string, unknown>) => ({
    ...a,
    personalityTraits: a.personalityTraits ?? {},
  }))
  return c.json({ success: true, data })
})

// GET /api/admin/agents/:id -- single agent by ID
agentsRoute.get('/agents/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const agent = await getAgentById(tenant.companyId, id)
  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')

  // Story 15.3: compute semanticCacheRecommendation based on tool TTLs
  const allowedTools: string[] = Array.isArray(agent.allowedTools) ? (agent.allowedTools as string[]) : []
  let semanticCacheRecommendation: 'safe' | 'warning' | 'none' = 'safe'
  for (const toolName of allowedTools) {
    const rec = getCacheRecommendation(toolName)
    if (rec === 'none') {
      semanticCacheRecommendation = 'none'
      break
    }
    if (rec === 'warning') {
      semanticCacheRecommendation = 'warning'
    }
  }

  // AR31: NULL personality_traits → empty object
  return c.json({ success: true, data: { ...agent, personalityTraits: agent.personalityTraits ?? {}, semanticCacheRecommendation } })
})

// POST /api/admin/agents
agentsRoute.post('/agents', zValidator('json', createAgentSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')
  const result = await createAgent(tenant, body)
  if ('error' in result) throw new HTTPError(result.error!.status, result.error!.message, result.error!.code)
  // AR31: NULL personality_traits → empty object
  const data = { ...result.data, personalityTraits: (result.data as Record<string, unknown>).personalityTraits ?? {} }
  return c.json({ success: true, data }, 201)
})

// PATCH /api/admin/agents/:id
agentsRoute.patch('/agents/:id', zValidator('json', updateAgentSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const result = await updateAgent(tenant, id, body)
  if ('error' in result) throw new HTTPError(result.error!.status, result.error!.message, result.error!.code)
  // AR31: NULL personality_traits → empty object
  const data = { ...result.data, personalityTraits: (result.data as Record<string, unknown>).personalityTraits ?? {} }
  return c.json({ success: true, data })
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

  const result = await previewSoul(tenant.companyId, id, soulText, body.personalityTraits)
  return c.json({ success: true, data: result })
})
