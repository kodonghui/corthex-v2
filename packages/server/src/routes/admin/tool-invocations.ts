import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { queryToolInvocations, getToolInvocationStats } from '../../services/tool-invocation-log'
import { authMiddleware, adminOnly } from '../../middleware/auth'

export const toolInvocationsRoute = new Hono()

toolInvocationsRoute.use('*', authMiddleware, adminOnly)

const querySchema = z.object({
  companyId: z.string().uuid(),
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

  const result = await queryToolInvocations({
    companyId: query.companyId,
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
  companyId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// GET /api/admin/tool-invocations/stats?companyId=xxx
toolInvocationsRoute.get('/tool-invocations/stats', zValidator('query', statsQuerySchema), async (c) => {
  const query = c.req.valid('query')

  const stats = await getToolInvocationStats(
    query.companyId,
    query.startDate ? new Date(query.startDate) : undefined,
    query.endDate ? new Date(query.endDate) : undefined,
  )

  return c.json({ success: true, data: stats })
})
