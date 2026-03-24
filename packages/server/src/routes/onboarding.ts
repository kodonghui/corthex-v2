import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import { tenantMiddleware } from '../middleware/tenant'
import { HTTPError } from '../middleware/error'
import type { AppEnv } from '../types'
import { getOrgTemplates } from '../services/organization'
import {
  getOnboardingStatus,
  selectOnboardingTemplate,
  completeOnboarding,
} from '../services/onboarding'
import { listPresets } from '../services/n8n-preset-workflows'

export const onboardingRoute = new Hono<AppEnv>()

// authMiddleware + tenantMiddleware only (no adminOnly — CEO users use onboarding)
// Scope middleware to /onboarding/* only (not '*') to prevent leaking to sibling routes
onboardingRoute.use('/onboarding/*', authMiddleware, tenantMiddleware)

// GET /api/onboarding/status — onboarding status for current company
onboardingRoute.get('/onboarding/status', async (c) => {
  const tenant = c.get('tenant')
  const status = await getOnboardingStatus(tenant.companyId)
  return c.json({ success: true, data: status })
})

// GET /api/onboarding/templates — builtin templates for onboarding selection
onboardingRoute.get('/onboarding/templates', async (c) => {
  const tenant = c.get('tenant')
  const templates = await getOrgTemplates(tenant.companyId)
  return c.json({ success: true, data: templates })
})

// POST /api/onboarding/select-template — apply selected template
const selectTemplateSchema = z.object({
  templateId: z.string().uuid(),
})

onboardingRoute.post(
  '/onboarding/select-template',
  zValidator('json', selectTemplateSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { templateId } = c.req.valid('json')

    const result = await selectOnboardingTemplate(tenant, templateId)
    if ('error' in result) {
      throw new HTTPError(result.error.status, result.error.message, result.error.code)
    }

    return c.json({ success: true, data: result.data }, 201)
  },
)

// GET /api/onboarding/marketing-presets — FR-MKT5: marketing template suggestion during onboarding
onboardingRoute.get('/onboarding/marketing-presets', (c) => {
  const presets = listPresets()
  return c.json({ success: true, data: presets })
})

// POST /api/onboarding/complete — mark onboarding as done
onboardingRoute.post('/onboarding/complete', async (c) => {
  const tenant = c.get('tenant')
  await completeOnboarding(tenant.companyId)
  return c.json({ success: true, data: { message: '온보딩이 완료되었습니다' } })
})
