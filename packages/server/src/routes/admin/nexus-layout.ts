import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { canvasLayouts } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import type { AppEnv } from '../../types'

export const nexusLayoutRoute = new Hono<AppEnv>()

nexusLayoutRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

const layoutDataSchema = z.object({
  nodePositions: z.record(z.string(), z.object({ x: z.number(), y: z.number() })),
  viewport: z.object({ x: z.number(), y: z.number(), zoom: z.number() }).optional(),
})

// GET /api/admin/nexus/layout — load saved NEXUS layout for tenant
nexusLayoutRoute.get('/nexus/layout', async (c) => {
  const tenant = c.get('tenant')

  const [layout] = await db
    .select()
    .from(canvasLayouts)
    .where(
      and(
        eq(canvasLayouts.companyId, tenant.companyId),
        eq(canvasLayouts.name, 'nexus'),
      ),
    )
    .limit(1)

  if (!layout) {
    return c.json({ success: true, data: null })
  }

  return c.json({ success: true, data: layout.layoutData })
})

// PUT /api/admin/nexus/layout — save/upsert NEXUS layout
nexusLayoutRoute.put(
  '/nexus/layout',
  zValidator('json', layoutDataSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const body = c.req.valid('json')

    // Check if layout exists
    const [existing] = await db
      .select({ id: canvasLayouts.id })
      .from(canvasLayouts)
      .where(
        and(
          eq(canvasLayouts.companyId, tenant.companyId),
          eq(canvasLayouts.name, 'nexus'),
        ),
      )
      .limit(1)

    if (existing) {
      await db
        .update(canvasLayouts)
        .set({
          layoutData: body,
          updatedAt: new Date(),
        })
        .where(eq(canvasLayouts.id, existing.id))
    } else {
      await db.insert(canvasLayouts).values({
        companyId: tenant.companyId,
        name: 'nexus',
        layoutData: body,
        isDefault: true,
      })
    }

    return c.json({ success: true, data: { saved: true } })
  },
)
