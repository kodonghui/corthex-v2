/**
 * Tool Sanitizer Admin Routes — prompt injection pattern management
 * GET  /api/admin/tool-sanitizer-patterns — returns current patterns
 * PUT  /api/admin/tool-sanitizer-patterns — updates patterns + reloads
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { getPatterns, savePatterns } from '../../engine'
import { createAuditLog, AUDIT_ACTIONS } from '../../services/audit-log'
import type { AppEnv } from '../../types'

export const toolSanitizerRoute = new Hono<AppEnv>()

toolSanitizerRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

// GET /api/admin/tool-sanitizer-patterns
toolSanitizerRoute.get('/tool-sanitizer-patterns', async (c) => {
  const data = getPatterns()
  return c.json({ success: true, data })
})

// PUT /api/admin/tool-sanitizer-patterns
const patternSchema = z.object({
  id: z.string().min(1).max(100),
  regex: z.string().min(1).max(500),
  flags: z.string().max(10),
  description: z.string().max(300),
})

const updateSchema = z.object({
  version: z.number().int().min(1),
  patterns: z.array(patternSchema).min(1).max(100),
})

toolSanitizerRoute.put('/tool-sanitizer-patterns', zValidator('json', updateSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  // Validate all regex patterns compile without error
  for (const p of body.patterns) {
    try {
      new RegExp(p.regex, p.flags)
    } catch {
      return c.json({ success: false, error: { code: 'INVALID_REGEX', message: `Invalid regex for pattern "${p.id}": ${p.regex}` } }, 400)
    }
  }

  const before = getPatterns()

  // Save to config file + reload compiled patterns (consolidated in engine)
  const result = savePatterns(body)

  // Audit log
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: 'admin_user',
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.SYSTEM_CONFIG_CHANGE,
    targetType: 'tool_sanitizer_patterns',
    before,
    after: body,
  })

  return c.json({ success: true, data: { ...body, loadedCount: result.count } })
})
