import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { queryToolInvocations, getToolInvocationStats } from '../../services/tool-invocation-log'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import type { AppEnv } from '../../types'

export const toolInvocationsRoute = new Hono<AppEnv>()

toolInvocationsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

const querySchema = z.object({
  agentId: z.string().uuid().optional(),
  toolName: z.string().optional(),
  status: z.enum(['success', 'error', 'timeout']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

// GET /api/admin/tool-invocations?companyId=xxx&agentId=xxx&toolName=xxx&page=1
toolInvocationsRoute.get('/tool-invocations', zValidator('query', querySchema), async (c) => {
  const query = c.req.valid('query')
  const companyId = c.get('tenant').companyId

  const result = await queryToolInvocations({
    companyId,
    agentId: query.agentId,
    toolName: query.toolName,
    status: query.status,
    startDate: query.startDate ? new Date(query.startDate) : undefined,
    endDate: query.endDate ? new Date(query.endDate) : undefined,
    page: query.page,
    limit: query.limit,
  })

  return c.json({ success: true, data: result.data, meta: result.meta })
})

const statsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// GET /api/admin/tool-invocations/stats?companyId=xxx
toolInvocationsRoute.get('/tool-invocations/stats', zValidator('query', statsQuerySchema), async (c) => {
  const query = c.req.valid('query')
  const companyId = c.get('tenant').companyId

  const stats = await getToolInvocationStats(
    companyId,
    query.startDate ? new Date(query.startDate) : undefined,
    query.endDate ? new Date(query.endDate) : undefined,
  )

  return c.json({ success: true, data: stats })
})
