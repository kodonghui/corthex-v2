import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { queryAuditLogs } from '../../services/audit-log'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import type { AppEnv } from '../../types'

export const auditLogsRoute = new Hono<AppEnv>()

auditLogsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

const querySchema = z.object({
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
  const companyId = c.get('tenant').companyId

  const result = await queryAuditLogs({
    companyId,
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
