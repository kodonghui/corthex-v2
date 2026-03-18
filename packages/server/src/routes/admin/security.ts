/**
 * Security Admin Routes -- 프롬프트 가드 설정 관리
 * GET /api/admin/security/prompt-guard — 설정 조회
 * PUT /api/admin/security/prompt-guard — 설정 변경
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { getPromptGuardSettings, savePromptGuardSettings } from '../../services/prompt-guard-settings'
import { createAuditLog, AUDIT_ACTIONS } from '../../services/audit-log'
import type { AppEnv } from '../../types'

export const securityRoute = new Hono<AppEnv>()

securityRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

// GET /api/admin/security/prompt-guard
securityRoute.get('/security/prompt-guard', async (c) => {
  const tenant = c.get('tenant')
  const settings = await getPromptGuardSettings(tenant.companyId)
  return c.json({ success: true, data: settings })
})

// PUT /api/admin/security/prompt-guard
const updateSchema = z.object({
  enabled: z.boolean().optional(),
  sensitivityLevel: z.enum(['strict', 'moderate', 'permissive']).optional(),
  customWhitelist: z.array(z.string().max(200)).max(50).optional(),
})

securityRoute.put('/security/prompt-guard', zValidator('json', updateSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  const before = await getPromptGuardSettings(tenant.companyId)
  const after = await savePromptGuardSettings(tenant.companyId, body)

  // Audit log
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: 'admin_user',
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.SYSTEM_CONFIG_CHANGE,
    targetType: 'prompt_guard',
    before,
    after,
  })

  return c.json({ success: true, data: after })
})
