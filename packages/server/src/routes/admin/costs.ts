import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import * as costAggregation from '../../services/cost-aggregation'
import type { AppEnv } from '../../types'

export const costsRoute = new Hono<AppEnv>()

costsRoute.use('*', authMiddleware, adminOnly)

// Shared date range query schema
const dateRangeSchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
})

function parseDateRange(query: { startDate?: string; endDate?: string }) {
  const endDate = query.endDate ? new Date(query.endDate + 'T23:59:59.999Z') : new Date()
  const startDate = query.startDate
    ? new Date(query.startDate + 'T00:00:00.000Z')
    : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
  return { startDate, endDate }
}

// GET /api/admin/costs/by-agent
costsRoute.get('/costs/by-agent', zValidator('query', dateRangeSchema), async (c) => {
  const companyId = c.req.query('companyId') || c.get('tenant').companyId
  const range = parseDateRange(c.req.valid('query'))
  const items = await costAggregation.getByAgent(companyId, range)
  return c.json({
    success: true,
    data: {
      items,
      meta: { startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() },
    },
  })
})

// GET /api/admin/costs/by-model
costsRoute.get('/costs/by-model', zValidator('query', dateRangeSchema), async (c) => {
  const companyId = c.req.query('companyId') || c.get('tenant').companyId
  const range = parseDateRange(c.req.valid('query'))
  const items = await costAggregation.getByModel(companyId, range)
  return c.json({
    success: true,
    data: {
      items,
      meta: { startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() },
    },
  })
})

// GET /api/admin/costs/by-department
costsRoute.get('/costs/by-department', zValidator('query', dateRangeSchema), async (c) => {
  const companyId = c.req.query('companyId') || c.get('tenant').companyId
  const range = parseDateRange(c.req.valid('query'))
  const items = await costAggregation.getByDepartment(companyId, range)
  return c.json({
    success: true,
    data: {
      items,
      meta: { startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() },
    },
  })
})

// GET /api/admin/costs/summary
costsRoute.get('/costs/summary', zValidator('query', dateRangeSchema), async (c) => {
  const companyId = c.req.query('companyId') || c.get('tenant').companyId
  const range = parseDateRange(c.req.valid('query'))
  const summary = await costAggregation.getSummary(companyId, range)
  return c.json({
    success: true,
    data: {
      ...summary,
      meta: { startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() },
    },
  })
})

// GET /api/admin/costs/daily
costsRoute.get('/costs/daily', zValidator('query', dateRangeSchema), async (c) => {
  const companyId = c.req.query('companyId') || c.get('tenant').companyId
  const range = parseDateRange(c.req.valid('query'))
  const items = await costAggregation.getDaily(companyId, range)
  return c.json({
    success: true,
    data: {
      items,
      meta: { startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() },
    },
  })
})
