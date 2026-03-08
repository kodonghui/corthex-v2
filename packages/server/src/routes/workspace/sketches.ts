import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { sketches } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { logActivity } from '../../lib/activity-logger'
import type { AppEnv } from '../../types'

export const sketchesRoute = new Hono<AppEnv>()

sketchesRoute.use('*', authMiddleware)

// GET /api/workspace/sketches — 캔버스 목록
sketchesRoute.get('/', async (c) => {
  const tenant = c.get('tenant')

  const list = await db
    .select({
      id: sketches.id,
      name: sketches.name,
      createdBy: sketches.createdBy,
      createdAt: sketches.createdAt,
      updatedAt: sketches.updatedAt,
    })
    .from(sketches)
    .where(eq(sketches.companyId, tenant.companyId))
    .orderBy(desc(sketches.updatedAt))

  return c.json({ data: list })
})

// GET /api/workspace/sketches/:id — 캔버스 상세
sketchesRoute.get('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [sketch] = await db
    .select()
    .from(sketches)
    .where(and(eq(sketches.id, id), eq(sketches.companyId, tenant.companyId)))
    .limit(1)

  if (!sketch) throw new HTTPError(404, '캔버스를 찾을 수 없습니다', 'SKETCH_001')

  return c.json({ data: sketch })
})

// POST /api/workspace/sketches — 캔버스 생성
const createSketchSchema = z.object({
  name: z.string().min(1, '캔버스 이름을 입력하세요').max(200),
  graphData: z.object({
    nodes: z.array(z.any()).default([]),
    edges: z.array(z.any()).default([]),
  }).default({ nodes: [], edges: [] }),
})

sketchesRoute.post(
  '/',
  zValidator('json', createSketchSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const body = c.req.valid('json')

    const [created] = await db
      .insert(sketches)
      .values({
        companyId: tenant.companyId,
        name: body.name,
        graphData: body.graphData,
        createdBy: tenant.userId,
      })
      .returning()

    logActivity({
      companyId: tenant.companyId,
      type: 'system',
      phase: 'end',
      actorType: 'user',
      actorId: tenant.userId,
      action: `SketchVibe: 캔버스 생성 — ${body.name}`,
    })

    return c.json({ data: created }, 201)
  },
)

// PUT /api/workspace/sketches/:id — 캔버스 수정
const updateSketchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  graphData: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }).optional(),
})

sketchesRoute.put(
  '/:id',
  zValidator('json', updateSketchSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const id = c.req.param('id')
    const body = c.req.valid('json')

    const [existing] = await db
      .select({ id: sketches.id })
      .from(sketches)
      .where(and(eq(sketches.id, id), eq(sketches.companyId, tenant.companyId)))
      .limit(1)

    if (!existing) throw new HTTPError(404, '캔버스를 찾을 수 없습니다', 'SKETCH_001')

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name !== undefined) updateData.name = body.name
    if (body.graphData !== undefined) updateData.graphData = body.graphData

    const [updated] = await db
      .update(sketches)
      .set(updateData)
      .where(eq(sketches.id, id))
      .returning()

    return c.json({ data: updated })
  },
)

// DELETE /api/workspace/sketches/:id — 캔버스 삭제
sketchesRoute.delete('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: sketches.id, name: sketches.name })
    .from(sketches)
    .where(and(eq(sketches.id, id), eq(sketches.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '캔버스를 찾을 수 없습니다', 'SKETCH_001')

  await db.delete(sketches).where(eq(sketches.id, id))

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `SketchVibe: 캔버스 삭제 — ${existing.name}`,
  })

  return c.json({ data: { deleted: true } })
})
