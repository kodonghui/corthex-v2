import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { queryAuditLogs } from '../../services/audit-log'
import { authMiddleware, adminOnly } from '../../middleware/auth'

export const auditLogsRoute = new Hono()

auditLogsRoute.use('*', authMiddleware, adminOnly)

const querySchema = z.object({
  companyId: z.string().uuid(),
  action: z.string().optional(),
  targetType: z.string().optional(),
  targetId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

// GET /api/admin/audit-logs?companyId=xxx&action=org.department.create&page=1&limit=50
auditLogsRoute.get('/audit-logs', zValidator('query', querySchema), async (c) => {
  const query = c.req.valid('query')

  const result = await queryAuditLogs({
    companyId: query.companyId,
    action: query.action,
    targetType: query.targetType,
    targetId: query.targetId,
    startDate: query.startDate ? new Date(query.startDate) : undefined,
    endDate: query.endDate ? new Date(query.endDate) : undefined,
    page: query.page,
    limit: query.limit,
  })

  return c.json(result)
})

// No DELETE, PUT, PATCH endpoints — audit logs are immutable
