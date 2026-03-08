import { Hono } from 'hono'
import { eq, and, sql } from 'drizzle-orm'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'
import { db } from '../../db'
import { orgTemplates, departments, agents } from '../../db/schema'
import {
  getOrgTemplates,
  getOrgTemplateById,
  applyTemplate,
} from '../../services/organization'
import { withTenant } from '../../db/tenant-helpers'

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

// POST /api/admin/org-templates -- create template from current org structure
const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
})

orgTemplatesRoute.post('/org-templates', zValidator('json', createTemplateSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  // Build templateData from current org structure (batch query, no N+1)
  const deptList = await db
    .select()
    .from(departments)
    .where(and(withTenant(departments.companyId, tenant.companyId), eq(departments.isActive, true)))

  const allAgents = await db
    .select()
    .from(agents)
    .where(and(withTenant(agents.companyId, tenant.companyId), eq(agents.isActive, true)))

  // Group agents by departmentId
  const agentsByDept = new Map<string, typeof allAgents>()
  for (const a of allAgents) {
    if (!a.departmentId) continue
    const list = agentsByDept.get(a.departmentId) || []
    list.push(a)
    agentsByDept.set(a.departmentId, list)
  }

  const templateDepartments = deptList.map((dept) => ({
    name: dept.name,
    description: dept.description || undefined,
    agents: (agentsByDept.get(dept.id) || []).map((a) => ({
      name: a.name,
      nameEn: a.nameEn || undefined,
      role: a.role || '분석가',
      tier: a.tier || 'specialist',
      modelName: a.modelName || 'claude-sonnet-4-20250514',
      soul: a.soul || '',
      allowedTools: a.allowedTools || [],
    })),
  }))

  const [created] = await db
    .insert(orgTemplates)
    .values({
      companyId: tenant.companyId,
      name: body.name,
      description: body.description || null,
      templateData: { departments: templateDepartments },
      isBuiltin: false,
      isActive: true,
      isPublished: false,
      tags: body.tags || null,
      createdBy: tenant.userId,
    })
    .returning()

  return c.json({ data: created }, 201)
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

// POST /api/admin/org-templates/:id/publish -- publish to market
orgTemplatesRoute.post('/org-templates/:id/publish', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [tmpl] = await db
    .select()
    .from(orgTemplates)
    .where(and(eq(orgTemplates.id, id), eq(orgTemplates.companyId, tenant.companyId)))
    .limit(1)

  if (!tmpl) throw new HTTPError(404, '템플릿을 찾을 수 없습니다', 'TMPL_001')
  if (tmpl.isPublished) throw new HTTPError(409, '이미 공개된 템플릿입니다', 'TMPL_003')

  const [updated] = await db
    .update(orgTemplates)
    .set({ isPublished: true, publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(orgTemplates.id, id))
    .returning()

  return c.json({ data: updated })
})

// POST /api/admin/org-templates/:id/unpublish -- remove from market
orgTemplatesRoute.post('/org-templates/:id/unpublish', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [tmpl] = await db
    .select()
    .from(orgTemplates)
    .where(and(eq(orgTemplates.id, id), eq(orgTemplates.companyId, tenant.companyId)))
    .limit(1)

  if (!tmpl) throw new HTTPError(404, '템플릿을 찾을 수 없습니다', 'TMPL_001')
  if (!tmpl.isPublished) throw new HTTPError(409, '이미 비공개 상태입니다', 'TMPL_004')

  const [updated] = await db
    .update(orgTemplates)
    .set({ isPublished: false, updatedAt: new Date() })
    .where(eq(orgTemplates.id, id))
    .returning()

  return c.json({ data: updated })
})
