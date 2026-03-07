import { Hono } from 'hono'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'
import {
  getOrgTemplates,
  getOrgTemplateById,
  applyTemplate,
} from '../../services/organization'

export const orgTemplatesRoute = new Hono<AppEnv>()

orgTemplatesRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

// GET /api/admin/org-templates -- list all available templates
orgTemplatesRoute.get('/org-templates', async (c) => {
  const tenant = c.get('tenant')
  const result = await getOrgTemplates(tenant.companyId)
  return c.json({ data: result })
})

// GET /api/admin/org-templates/:id -- single template detail (must be before :id/apply)
orgTemplatesRoute.get('/org-templates/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const tmpl = await getOrgTemplateById(tenant.companyId, id)
  if (!tmpl) throw new HTTPError(404, '조직 템플릿을 찾을 수 없습니다', 'TMPL_001')
  return c.json({ data: tmpl })
})

// POST /api/admin/org-templates/:id/apply -- apply template to company
orgTemplatesRoute.post('/org-templates/:id/apply', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const result = await applyTemplate(tenant, id)
  if ('error' in result) {
    throw new HTTPError(result.error.status, result.error.message, result.error.code)
  }
  return c.json({ data: result.data }, 201)
})
