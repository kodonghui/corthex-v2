import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { getMaxHandoffDepth, saveMaxHandoffDepth } from '../../services/handoff-depth-settings'
import {
  getMarketingConfig,
  updateEngineSelection,
  storeApiKey,
  deleteApiKey,
  updateWatermark,
  ENGINE_CATEGORIES,
  MARKETING_ENGINE_PROVIDERS,
} from '../../services/marketing-settings'
import { cleanupExpiredObservations, decayStaleMemories } from '../../services/observation-cleanup'
import { getDB } from '../../db/scoped-query'
import type { EngineCategory } from '../../services/marketing-settings'
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

// === Story 26.1: Marketing Settings & AI Engine Configuration ===
// References: FR-MKT1, FR-MKT4, FR-MKT6, AR39, AR41, MKT-1, MKT-3

// GET /api/admin/company-settings/marketing — Get marketing config
companySettingsRoute.get('/company-settings/marketing', async (c) => {
  const tenant = c.get('tenant')
  const config = await getMarketingConfig(tenant.companyId)
  return c.json({ success: true, data: config })
})

// GET /api/admin/company-settings/marketing/providers — List available providers
companySettingsRoute.get('/company-settings/marketing/providers', (c) => {
  return c.json({ success: true, data: MARKETING_ENGINE_PROVIDERS })
})

// PUT /api/admin/company-settings/marketing/engine — Update engine selection (FR-MKT1, FR-MKT4)
const engineSchema = z.object({
  category: z.enum(['image', 'video', 'narration', 'subtitles']),
  provider: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
})

companySettingsRoute.put(
  '/company-settings/marketing/engine',
  zValidator('json', engineSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { category, provider, model } = c.req.valid('json')
    await updateEngineSelection(tenant.companyId, category as EngineCategory, provider, model)
    const config = await getMarketingConfig(tenant.companyId)
    return c.json({ success: true, data: config })
  },
)

// PUT /api/admin/company-settings/marketing/api-key — Store API key (AR39, MKT-1)
const apiKeySchema = z.object({
  provider: z.string().min(1).max(50),
  apiKey: z.string().min(1).max(500),
})

companySettingsRoute.put(
  '/company-settings/marketing/api-key',
  zValidator('json', apiKeySchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { provider, apiKey } = c.req.valid('json')
    await storeApiKey(tenant.companyId, provider, apiKey)
    const config = await getMarketingConfig(tenant.companyId)
    return c.json({ success: true, data: config })
  },
)

// DELETE /api/admin/company-settings/marketing/api-key/:provider — Delete API key
companySettingsRoute.delete('/company-settings/marketing/api-key/:provider', async (c) => {
  const tenant = c.get('tenant')
  const provider = c.req.param('provider')
  await deleteApiKey(tenant.companyId, provider)
  const config = await getMarketingConfig(tenant.companyId)
  return c.json({ success: true, data: config })
})

// PUT /api/admin/company-settings/marketing/watermark — Toggle watermark (FR-MKT6)
const watermarkSchema = z.object({
  enabled: z.boolean(),
})

companySettingsRoute.put(
  '/company-settings/marketing/watermark',
  zValidator('json', watermarkSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { enabled } = c.req.valid('json')
    await updateWatermark(tenant.companyId, enabled)
    return c.json({ success: true, data: { watermark: enabled } })
  },
)

// === Story 28.7: Memory Cleanup Admin Endpoints ===

// GET /api/admin/company-settings/memory-stats — observation/memory counts per agent
companySettingsRoute.get('/company-settings/memory-stats', async (c) => {
  const tenant = c.get('tenant')
  const db = getDB(tenant.companyId)
  const stats = await db.getMemoryStats()
  return c.json({ success: true, data: { agents: stats } })
})

// POST /api/admin/company-settings/memory-cleanup — manual trigger for cleanup
companySettingsRoute.post('/company-settings/memory-cleanup', async (c) => {
  const tenant = c.get('tenant')
  const cleanup = await cleanupExpiredObservations(tenant.companyId)
  const decay = await decayStaleMemories(tenant.companyId)
  return c.json({
    success: true,
    data: {
      observations: cleanup,
      memories: decay,
    },
  })
})
