import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getDB } from '../../db/scoped-query'
import { authMiddleware } from '../../middleware/auth'
import type { AppEnv } from '../../types'

export const observationsRoute = new Hono<AppEnv>()

observationsRoute.use('*', authMiddleware)

const createObservationSchema = z.object({
  agentId: z.string().uuid(),
  content: z.string().min(1).max(10240),
  domain: z.enum(['conversation', 'tool_use', 'error']).optional(),
  outcome: z.enum(['success', 'failure', 'unknown']).optional(),
  toolUsed: z.string().max(100).optional(),
  importance: z.number().int().min(1).max(10).optional(),
  confidence: z.number().min(0).max(1).optional(),
  flagged: z.boolean().optional(),
})

// GET /api/workspace/observations — list observations with pagination
observationsRoute.get('/observations', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.query('agentId')
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100)
  const offset = Number(c.req.query('offset')) || 0

  const data = await getDB(tenant.companyId).listObservations({ agentId, limit, offset })
  return c.json({ success: true, data })
})

// POST /api/workspace/observations — manual observation creation
observationsRoute.post('/observations', zValidator('json', createObservationSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  const [result] = await getDB(tenant.companyId).insertObservation(body)
  return c.json({ success: true, data: result }, 201)
})
