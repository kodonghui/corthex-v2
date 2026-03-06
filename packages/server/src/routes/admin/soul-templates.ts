import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, or, isNull, asc, desc } from 'drizzle-orm'
import { db } from '../../db'
import { soulTemplates } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const soulTemplatesRoute = new Hono<AppEnv>()

soulTemplatesRoute.use('*', authMiddleware, adminOnly)

const createSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  content: z.string().min(1),
  category: z.string().max(50).nullable().optional(),
})

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  content: z.string().min(1).optional(),
  category: z.string().max(50).nullable().optional(),
})

// GET /api/admin/soul-templates?companyId=xxx
soulTemplatesRoute.get('/soul-templates', async (c) => {
  const companyId = c.req.query('companyId')
  if (!companyId) throw new HTTPError(400, 'companyId is required', 'ST_001')

  const result = await db
    .select()
    .from(soulTemplates)
    .where(
      and(
        or(isNull(soulTemplates.companyId), eq(soulTemplates.companyId, companyId)),
        eq(soulTemplates.isActive, true),
      ),
    )
    .orderBy(desc(soulTemplates.isBuiltin), asc(soulTemplates.name))

  return c.json({ data: result })
})

// POST /api/admin/soul-templates
soulTemplatesRoute.post('/soul-templates', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const [template] = await db
    .insert(soulTemplates)
    .values({
      companyId: body.companyId,
      name: body.name,
      description: body.description || null,
      content: body.content,
      category: body.category || null,
      isBuiltin: false,
    })
    .returning()

  return c.json({ data: template }, 201)
})

// PATCH /api/admin/soul-templates/:id
soulTemplatesRoute.patch('/soul-templates/:id', zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')

  const [existing] = await db.select().from(soulTemplates).where(eq(soulTemplates.id, id)).limit(1)
  if (!existing) throw new HTTPError(404, 'Soul template not found', 'ST_002')
  if (existing.isBuiltin) throw new HTTPError(403, 'Built-in templates cannot be modified', 'ST_003')

  const { name, description, content, category } = body
  const [updated] = await db
    .update(soulTemplates)
    .set({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(content !== undefined && { content }),
      ...(category !== undefined && { category }),
      updatedAt: new Date(),
    })
    .where(eq(soulTemplates.id, id))
    .returning()

  return c.json({ data: updated })
})

// DELETE /api/admin/soul-templates/:id (soft delete)
soulTemplatesRoute.delete('/soul-templates/:id', async (c) => {
  const id = c.req.param('id')

  const [existing] = await db.select().from(soulTemplates).where(eq(soulTemplates.id, id)).limit(1)
  if (!existing) throw new HTTPError(404, 'Soul template not found', 'ST_002')
  if (existing.isBuiltin) throw new HTTPError(403, 'Built-in templates cannot be deleted', 'ST_004')

  const [deleted] = await db
    .update(soulTemplates)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(soulTemplates.id, id))
    .returning()

  return c.json({ data: deleted })
})
