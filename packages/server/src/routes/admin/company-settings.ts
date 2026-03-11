import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { getMaxHandoffDepth, saveMaxHandoffDepth } from '../../services/handoff-depth-settings'
import type { AppEnv } from '../../types'

export const companySettingsRoute = new Hono<AppEnv>()

companySettingsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

const handoffDepthSchema = z.object({
  maxHandoffDepth: z.number().int().min(1).max(10),
})

// GET /api/admin/company-settings/handoff-depth
companySettingsRoute.get('/company-settings/handoff-depth', async (c) => {
  const tenant = c.get('tenant')
  const maxHandoffDepth = await getMaxHandoffDepth(tenant.companyId)
  return c.json({ success: true, data: { maxHandoffDepth } })
})

// PUT /api/admin/company-settings/handoff-depth
companySettingsRoute.put(
  '/company-settings/handoff-depth',
  zValidator('json', handoffDepthSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { maxHandoffDepth } = c.req.valid('json')
    const saved = await saveMaxHandoffDepth(tenant.companyId, maxHandoffDepth)
    return c.json({ success: true, data: { maxHandoffDepth: saved } })
  },
)
