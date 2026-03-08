import { Hono } from 'hono'
import { eq, and, or, isNull, ne, ilike, sql } from 'drizzle-orm'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../../db'
import { orgTemplates } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import type { AppEnv } from '../../types'

export const workspaceTemplateMarketRoute = new Hono<AppEnv>()

workspaceTemplateMarketRoute.use('*', authMiddleware)

// GET /api/workspace/template-market — browse published templates (exclude own company)
workspaceTemplateMarketRoute.get('/template-market', async (c) => {
  const tenant = c.get('tenant')
  const q = c.req.query('q')?.trim()
  const tag = c.req.query('tag')?.trim()

  const conditions = [
    eq(orgTemplates.isPublished, true),
    eq(orgTemplates.isActive, true),
    or(
      isNull(orgTemplates.companyId),  // builtin always visible
      ne(orgTemplates.companyId, tenant.companyId),  // other companies
    ),
  ]

  if (q) {
    conditions.push(ilike(orgTemplates.name, `%${q}%`))
  }

  if (tag) {
    // tags is jsonb string array — check if it contains the tag
    conditions.push(sql`${orgTemplates.tags}::jsonb @> ${JSON.stringify([tag])}::jsonb`)
  }

  const result = await db
    .select({
      id: orgTemplates.id,
      name: orgTemplates.name,
      description: orgTemplates.description,
      templateData: orgTemplates.templateData,
      isBuiltin: orgTemplates.isBuiltin,
      downloadCount: orgTemplates.downloadCount,
      tags: orgTemplates.tags,
      publishedAt: orgTemplates.publishedAt,
    })
    .from(orgTemplates)
    .where(and(...conditions))
    .orderBy(sql`${orgTemplates.downloadCount} DESC`)

  return c.json({ data: result })
})

// GET /api/workspace/template-market/:id — single published template detail
workspaceTemplateMarketRoute.get('/template-market/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [tmpl] = await db
    .select()
    .from(orgTemplates)
    .where(
      and(
        eq(orgTemplates.id, id),
        eq(orgTemplates.isPublished, true),
        eq(orgTemplates.isActive, true),
        or(
          isNull(orgTemplates.companyId),
          ne(orgTemplates.companyId, tenant.companyId),
        ),
      ),
    )
    .limit(1)

  if (!tmpl) {
    return c.json({ success: false, error: { code: 'MKT_001', message: '템플릿을 찾을 수 없습니다' } }, 404)
  }

  return c.json({ data: tmpl })
})

// POST /api/workspace/template-market/:id/clone — clone template to own company
const cloneSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

workspaceTemplateMarketRoute.post('/template-market/:id/clone', zValidator('json', cloneSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  // Load source template (must be published)
  const [source] = await db
    .select()
    .from(orgTemplates)
    .where(
      and(
        eq(orgTemplates.id, id),
        eq(orgTemplates.isPublished, true),
        eq(orgTemplates.isActive, true),
      ),
    )
    .limit(1)

  if (!source) {
    return c.json({ success: false, error: { code: 'MKT_002', message: '복제할 템플릿을 찾을 수 없습니다' } }, 404)
  }

  // Create cloned template for this company
  const [cloned] = await db
    .insert(orgTemplates)
    .values({
      companyId: tenant.companyId,
      name: body.name || `${source.name} (복제)`,
      description: source.description,
      templateData: source.templateData,
      isBuiltin: false,
      isActive: true,
      isPublished: false,
      tags: source.tags,
      createdBy: tenant.userId,
    })
    .returning()

  // Increment download count on source
  await db
    .update(orgTemplates)
    .set({ downloadCount: sql`${orgTemplates.downloadCount} + 1` })
    .where(eq(orgTemplates.id, id))

  return c.json({ data: cloned }, 201)
})
