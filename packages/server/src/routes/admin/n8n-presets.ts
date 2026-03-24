/**
 * Story 26.2: Marketing Preset Workflows — Admin Routes
 * References: AR40, FR-MKT2, FR-MKT5
 *
 * Routes:
 *   GET  /n8n/presets          — List available presets
 *   GET  /n8n/presets/:id      — Get preset detail
 *   POST /n8n/presets/install  — Install preset to n8n
 *   GET  /n8n/presets/:id/status — Check if preset installed
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import {
  listPresets,
  getPreset,
  installPreset,
  getPresetInstallStatus,
} from '../../services/n8n-preset-workflows'
import type { AppEnv } from '../../types'

export const n8nPresetsRoute = new Hono<AppEnv>()

n8nPresetsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

// GET /api/admin/n8n/presets — List available presets
n8nPresetsRoute.get('/n8n/presets', (c) => {
  const presets = listPresets()
  return c.json({ success: true, data: presets })
})

// GET /api/admin/n8n/presets/:id — Get preset detail (includes DAG stages)
n8nPresetsRoute.get('/n8n/presets/:id', (c) => {
  const presetId = c.req.param('id')
  const preset = getPreset(presetId)
  if (!preset) {
    return c.json(
      { success: false, error: { code: 'PRESET_NOT_FOUND', message: '프리셋을 찾을 수 없습니다.' } },
      404,
    )
  }
  return c.json({ success: true, data: preset })
})

// POST /api/admin/n8n/presets/install — Install preset to n8n (AR40)
const installSchema = z.object({
  presetId: z.string().min(1).max(100),
})

n8nPresetsRoute.post(
  '/n8n/presets/install',
  zValidator('json', installSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { presetId } = c.req.valid('json')

    // Duplicate install prevention (Quinn LOW fix)
    const existing = await getPresetInstallStatus(presetId, tenant.companyId)
    if (existing.installed) {
      return c.json(
        { success: false, error: { code: 'PRESET_ALREADY_INSTALLED', message: '이미 설치된 프리셋입니다.' } },
        409,
      )
    }

    const result = await installPreset(presetId, tenant.companyId)
    if (!result.installed) {
      return c.json(
        { success: false, error: { code: 'PRESET_INSTALL_FAILED', message: result.error ?? '설치 실패' } },
        400,
      )
    }
    return c.json({ success: true, data: result })
  },
)

// GET /api/admin/n8n/presets/:id/status — Check installation status (returns n8nWorkflowId)
n8nPresetsRoute.get('/n8n/presets/:id/status', async (c) => {
  const tenant = c.get('tenant')
  const presetId = c.req.param('id')
  const status = await getPresetInstallStatus(presetId, tenant.companyId)
  return c.json({ success: true, data: { presetId, ...status } })
})
