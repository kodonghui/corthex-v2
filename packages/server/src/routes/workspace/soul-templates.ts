import { Hono } from 'hono'
import { eq, and, or, isNull, asc, desc } from 'drizzle-orm'
import { db } from '../../db'
import { soulTemplates } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import type { AppEnv } from '../../types'

export const workspaceSoulTemplatesRoute = new Hono<AppEnv>()

workspaceSoulTemplatesRoute.use('*', authMiddleware)

// GET /api/workspace/soul-templates — read-only for workspace users
workspaceSoulTemplatesRoute.get('/soul-templates', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select()
    .from(soulTemplates)
    .where(
      and(
        or(isNull(soulTemplates.companyId), eq(soulTemplates.companyId, tenant.companyId)),
        eq(soulTemplates.isActive, true),
      ),
    )
    .orderBy(desc(soulTemplates.isBuiltin), asc(soulTemplates.name))

  return c.json({ data: result })
})
