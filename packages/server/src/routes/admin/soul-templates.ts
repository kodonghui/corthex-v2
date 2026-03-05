import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { soulTemplates } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const soulTemplatesRoute = new Hono<AppEnv>()
soulTemplatesRoute.use('*', authMiddleware, adminOnly)

const createSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  content: z.string().min(1),
})

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  content: z.string().min(1).optional(),
})

// GET /api/admin/soul-templates?companyId=xxx
soulTemplatesRoute.get('/soul-templates', async (c) => {
  const companyId = c.req.query('companyId')
  if (!companyId) return c.json({ data: [] })
  const result = await db.select().from(soulTemplates)
    .where(and(eq(soulTemplates.companyId, companyId), eq(soulTemplates.isActive, true)))
  return c.json({ data: result })
})

// POST /api/admin/soul-templates
soulTemplatesRoute.post('/soul-templates', zValidator('json', createSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')
  const [template] = await db.insert(soulTemplates).values({
    companyId: tenant.companyId,
    ...body,
  }).returning()
  return c.json({ data: template }, 201)
})

// PATCH /api/admin/soul-templates/:id
soulTemplatesRoute.patch('/soul-templates/:id', zValidator('json', updateSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const [updated] = await db.update(soulTemplates)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(soulTemplates.id, id), eq(soulTemplates.companyId, tenant.companyId)))
    .returning()
  if (!updated) throw new HTTPError(404, '템플릿을 찾을 수 없습니다', 'TMPL_001')
  return c.json({ data: updated })
})

// DELETE /api/admin/soul-templates/:id
soulTemplatesRoute.delete('/soul-templates/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  await db.update(soulTemplates).set({ isActive: false })
    .where(and(eq(soulTemplates.id, id), eq(soulTemplates.companyId, tenant.companyId)))
  return c.json({ data: { message: '삭제되었습니다' } })
})
