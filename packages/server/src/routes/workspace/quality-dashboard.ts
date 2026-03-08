import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { getQualityDashboard } from '../../services/quality-dashboard'
import type { AppEnv } from '../../types'

export const qualityDashboardRoute = new Hono<AppEnv>()

qualityDashboardRoute.use('*', authMiddleware)

// GET /quality-dashboard — 품질 대시보드 전체 데이터
qualityDashboardRoute.get('/', async (c) => {
  const tenant = c.get('tenant')
  const period = (c.req.query('period') || '30d') as '7d' | '30d' | 'all'
  const departmentId = c.req.query('departmentId') || undefined

  // Validate period
  if (!['7d', '30d', 'all'].includes(period)) {
    return c.json({ error: { code: 'INVALID_PERIOD', message: 'period must be 7d, 30d, or all' } }, 400)
  }

  const data = await getQualityDashboard({
    companyId: tenant.companyId,
    period,
    departmentId,
  })

  return c.json({ data })
})
