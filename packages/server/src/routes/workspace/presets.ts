import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, or, desc, sql } from 'drizzle-orm'
import { db } from '../../db'
import { presets } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { classify, createCommand } from '../../services/command-router'
import { process as chiefOfStaffProcess } from '../../services/chief-of-staff'
import { processAll } from '../../services/all-command-processor'
import { processSequential } from '../../services/sequential-command-processor'
import type { AppEnv } from '../../types'

export const presetsRoute = new Hono<AppEnv>()

presetsRoute.use('*', authMiddleware)

// === Zod Schemas ===

const createPresetSchema = z.object({
  name: z.string().min(1).max(100),
  command: z.string().min(1).max(10_000),
  description: z.string().max(500).nullish(),
  category: z.string().max(50).nullish(),
})

const updatePresetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  command: z.string().min(1).max(10_000).optional(),
  description: z.string().max(500).nullish(),
  category: z.string().max(50).nullish(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

// POST /api/workspace/presets — 프리셋 생성
presetsRoute.post('/', zValidator('json', createPresetSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  // Name duplicate check within same company + user
  const [existing] = await db
    .select({ id: presets.id })
    .from(presets)
    .where(and(
      eq(presets.companyId, tenant.companyId),
      eq(presets.userId, tenant.userId),
      eq(presets.name, body.name),
    ))
    .limit(1)

  if (existing) {
    throw new HTTPError(409, '같은 이름의 프리셋이 이미 존재합니다', 'PRESET_DUPLICATE')
  }

  const [preset] = await db
    .insert(presets)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      name: body.name,
      command: body.command,
      description: body.description ?? null,
      category: body.category ?? null,
    })
    .returning()

  return c.json({ success: true, data: preset }, 201)
})

// GET /api/workspace/presets — 프리셋 목록 (본인 + isGlobal)
presetsRoute.get('/', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select()
    .from(presets)
    .where(and(
      eq(presets.companyId, tenant.companyId),
      eq(presets.isActive, true),
      or(
        eq(presets.userId, tenant.userId),
        eq(presets.isGlobal, true),
      ),
    ))
    .orderBy(desc(presets.sortOrder), desc(presets.createdAt))

  return c.json({ success: true, data: result })
})

// PATCH /api/workspace/presets/:id — 프리셋 수정
presetsRoute.patch('/:id', zValidator('json', updatePresetSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  // Verify ownership
  const [existing] = await db
    .select({ id: presets.id, userId: presets.userId })
    .from(presets)
    .where(and(
      eq(presets.id, id),
      eq(presets.companyId, tenant.companyId),
    ))
    .limit(1)

  if (!existing) {
    throw new HTTPError(404, '프리셋을 찾을 수 없습니다', 'PRESET_NOT_FOUND')
  }

  if (existing.userId !== tenant.userId) {
    throw new HTTPError(403, '본인의 프리셋만 수정할 수 있습니다', 'PRESET_FORBIDDEN')
  }

  // Name duplicate check if name is changing
  if (body.name) {
    const [dup] = await db
      .select({ id: presets.id })
      .from(presets)
      .where(and(
        eq(presets.companyId, tenant.companyId),
        eq(presets.userId, tenant.userId),
        eq(presets.name, body.name),
        sql`${presets.id} != ${id}`,
      ))
      .limit(1)

    if (dup) {
      throw new HTTPError(409, '같은 이름의 프리셋이 이미 존재합니다', 'PRESET_DUPLICATE')
    }
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (body.name !== undefined) updateData.name = body.name
  if (body.command !== undefined) updateData.command = body.command
  if (body.description !== undefined) updateData.description = body.description
  if (body.category !== undefined) updateData.category = body.category
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder
  if (body.isActive !== undefined) updateData.isActive = body.isActive

  const [updated] = await db
    .update(presets)
    .set(updateData)
    .where(and(eq(presets.id, id), eq(presets.companyId, tenant.companyId)))
    .returning()

  return c.json({ success: true, data: updated })
})

// DELETE /api/workspace/presets/:id — 프리셋 삭제
presetsRoute.delete('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  // Verify ownership
  const [existing] = await db
    .select({ id: presets.id, userId: presets.userId })
    .from(presets)
    .where(and(
      eq(presets.id, id),
      eq(presets.companyId, tenant.companyId),
    ))
    .limit(1)

  if (!existing) {
    throw new HTTPError(404, '프리셋을 찾을 수 없습니다', 'PRESET_NOT_FOUND')
  }

  if (existing.userId !== tenant.userId) {
    throw new HTTPError(403, '본인의 프리셋만 삭제할 수 있습니다', 'PRESET_FORBIDDEN')
  }

  await db
    .delete(presets)
    .where(and(eq(presets.id, id), eq(presets.companyId, tenant.companyId)))

  return c.json({ success: true, data: { deleted: true } })
})

// POST /api/workspace/presets/:id/execute — 프리셋 실행
presetsRoute.post('/:id/execute', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  // Load preset
  const [preset] = await db
    .select()
    .from(presets)
    .where(and(
      eq(presets.id, id),
      eq(presets.companyId, tenant.companyId),
      eq(presets.isActive, true),
      or(
        eq(presets.userId, tenant.userId),
        eq(presets.isGlobal, true),
      ),
    ))
    .limit(1)

  if (!preset) {
    throw new HTTPError(404, '프리셋을 찾을 수 없습니다', 'PRESET_NOT_FOUND')
  }

  // Classify the preset command text WITHOUT presetId so slash commands in text are detected
  const classResult = await classify(preset.command, {
    companyId: tenant.companyId,
    userId: tenant.userId,
    targetAgentId: null,
    presetId: null,
    useBatch: false,
  })

  // Create command with type='preset' and metadata linking back to the preset
  const command = await createCommand({
    companyId: tenant.companyId,
    userId: tenant.userId,
    text: preset.command,
    type: 'preset',
    targetAgentId: classResult.targetAgentId,
    metadata: { ...classResult.parsedMeta, presetId: id } as typeof classResult.parsedMeta,
  })

  // Increment sortOrder (usage frequency tracking)
  await db
    .update(presets)
    .set({ sortOrder: sql`${presets.sortOrder} + 1`, updatedAt: new Date() })
    .where(eq(presets.id, id))

  // Trigger processing based on what the preset command text actually is
  const effectiveType = classResult.type
  if (effectiveType === 'direct' || effectiveType === 'mention') {
    chiefOfStaffProcess({
      commandId: command.id,
      commandText: preset.command,
      companyId: tenant.companyId,
      userId: tenant.userId,
      targetAgentId: classResult.targetAgentId ?? undefined,
    }).catch((err) => {
      console.error(`[Preset] ChiefOfStaff process failed for command ${command.id}:`, err)
    })
  } else if (effectiveType === 'all') {
    processAll({
      commandId: command.id,
      commandText: classResult.parsedMeta.slashArgs || preset.command,
      companyId: tenant.companyId,
      userId: tenant.userId,
    }).catch((err) => {
      console.error(`[Preset] AllCommand process failed for command ${command.id}:`, err)
    })
  } else if (effectiveType === 'sequential') {
    processSequential({
      commandId: command.id,
      commandText: classResult.parsedMeta.slashArgs || preset.command,
      companyId: tenant.companyId,
      userId: tenant.userId,
    }).catch((err) => {
      console.error(`[Preset] SequentialCommand process failed for command ${command.id}:`, err)
    })
  }

  return c.json({
    success: true,
    data: {
      id: command.id,
      type: command.type,
      status: command.status,
      presetId: id,
      presetName: preset.name,
      createdAt: command.createdAt,
    },
  }, 201)
})
