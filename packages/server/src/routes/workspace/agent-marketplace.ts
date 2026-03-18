import { Hono } from 'hono'
import { eq, and, or, isNull, ne, ilike, sql } from 'drizzle-orm'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../../db'
import { soulTemplates } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import type { AppEnv } from '../../types'

export const workspaceAgentMarketplaceRoute = new Hono<AppEnv>()

workspaceAgentMarketplaceRoute.use('*', authMiddleware)

// GET /api/workspace/agent-marketplace — browse published soul templates (exclude own company)
workspaceAgentMarketplaceRoute.get('/agent-marketplace', async (c) => {
  const tenant = c.get('tenant')
  const companyId = c.req.query('companyId') || tenant.companyId
  const q = c.req.query('q')?.trim()
  const category = c.req.query('category')?.trim()
  const tier = c.req.query('tier')?.trim()

  // If companyId is not a valid UUID (e.g. "system"), skip the exclude filter
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId)
  const conditions = [
    eq(soulTemplates.isPublished, true),
    eq(soulTemplates.isActive, true),
    ...(isValidUuid ? [or(
      isNull(soulTemplates.companyId),  // builtin always visible
      ne(soulTemplates.companyId, companyId),  // other companies
    )] : []),
  ]

  if (q) {
    conditions.push(ilike(soulTemplates.name, `%${q}%`))
  }

  if (category) {
    conditions.push(eq(soulTemplates.category, category))
  }

  if (tier) {
    conditions.push(eq(soulTemplates.tier, tier))
  }

  const result = await db
    .select({
      id: soulTemplates.id,
      name: soulTemplates.name,
      description: soulTemplates.description,
      content: soulTemplates.content,
      category: soulTemplates.category,
      tier: soulTemplates.tier,
      allowedTools: soulTemplates.allowedTools,
      isBuiltin: soulTemplates.isBuiltin,
      downloadCount: soulTemplates.downloadCount,
      publishedAt: soulTemplates.publishedAt,
    })
    .from(soulTemplates)
    .where(and(...conditions))
    .orderBy(sql`${soulTemplates.downloadCount} DESC`)

  return c.json({ data: result })
})

// GET /api/workspace/agent-marketplace/:id — single published soul template detail
workspaceAgentMarketplaceRoute.get('/agent-marketplace/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const companyId = c.req.query('companyId') || tenant.companyId
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId)

  const [tmpl] = await db
    .select()
    .from(soulTemplates)
    .where(
      and(
        eq(soulTemplates.id, id),
        eq(soulTemplates.isPublished, true),
        eq(soulTemplates.isActive, true),
        ...(isValidUuid ? [or(
          isNull(soulTemplates.companyId),
          ne(soulTemplates.companyId, companyId),
        )] : []),
      ),
    )
    .limit(1)

  if (!tmpl) {
    return c.json({ success: false, error: { code: 'AMK_001', message: '에이전트 템플릿을 찾을 수 없습니다' } }, 404)
  }

  return c.json({ data: tmpl })
})

// POST /api/workspace/agent-marketplace/:id/import — import soul template to own company
const importSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

workspaceAgentMarketplaceRoute.post('/agent-marketplace/:id/import', zValidator('json', importSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  // Load source template (must be published)
  const [source] = await db
    .select()
    .from(soulTemplates)
    .where(
      and(
        eq(soulTemplates.id, id),
        eq(soulTemplates.isPublished, true),
        eq(soulTemplates.isActive, true),
      ),
    )
    .limit(1)

  if (!source) {
    return c.json({ success: false, error: { code: 'AMK_002', message: '가져올 템플릿을 찾을 수 없습니다' } }, 404)
  }

  // Create imported template for this company
  const [imported] = await db
    .insert(soulTemplates)
    .values({
      companyId: tenant.companyId,
      name: body.name || `${source.name} (가져옴)`,
      description: source.description,
      content: source.content,
      category: source.category,
      tier: source.tier,
      allowedTools: source.allowedTools,
      isBuiltin: false,
      isActive: true,
      isPublished: false,
      createdBy: tenant.userId,
    })
    .returning()

  // Increment download count on source
  await db
    .update(soulTemplates)
    .set({ downloadCount: sql`${soulTemplates.downloadCount} + 1` })
    .where(eq(soulTemplates.id, id))

  return c.json({ data: imported }, 201)
})
