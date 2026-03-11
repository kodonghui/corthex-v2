import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getDB } from '../../db/scoped-query'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { classify, createCommand } from '../../services/command-router'
import { collectAgentResponse, renderSoul } from '../../engine'
import type { SessionContext } from '../../engine'
import { getMaxHandoffDepth } from '../../services/handoff-depth-settings'
import { db } from '../../db'
import { commands } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import type { AppEnv } from '../../types'

// === Agent execution helper (new engine) ===

async function runAgentForCommand(opts: {
  commandId: string
  commandText: string
  companyId: string
  userId: string
  targetAgentId?: string | null
}): Promise<void> {
  const { commandId, commandText, companyId, userId, targetAgentId } = opts
  const scopedDb = getDB(companyId)

  let agentRow: { id: string; soul: string | null } | null = null
  if (targetAgentId) {
    const [row] = await scopedDb.agentById(targetAgentId)
    if (row && row.isActive !== false) agentRow = { id: row.id, soul: row.soul }
  }
  if (!agentRow) {
    const allAgents = await scopedDb.agents()
    const secretary = allAgents.find((a) => a.isSecretary && a.isActive !== false)
    if (secretary) agentRow = { id: secretary.id, soul: secretary.soul }
  }
  if (!agentRow) {
    await db.update(commands)
      .set({ status: 'failed', result: '에이전트를 찾을 수 없습니다', completedAt: new Date() })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
    return
  }

  const soul = agentRow.soul ? await renderSoul(agentRow.soul, agentRow.id, companyId) : ''
  const ctx: SessionContext = {
    cliToken: process.env.ANTHROPIC_API_KEY || '',
    userId,
    companyId,
    depth: 0,
    sessionId: commandId,
    startedAt: Date.now(),
    maxDepth: await getMaxHandoffDepth(companyId),
    visitedAgents: [agentRow.id],
  }

  await db.update(commands)
    .set({ status: 'processing' })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  try {
    const result = await collectAgentResponse({ ctx, soul, message: commandText })
    await db.update(commands)
      .set({ status: 'completed', result, completedAt: new Date() })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    await db.update(commands)
      .set({ status: 'failed', result: errMsg, completedAt: new Date() })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
  }
}

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
  const scopedDb = getDB(tenant.companyId)

  // Name duplicate check within same company + user
  const [existing] = await scopedDb.presetByName(body.name, tenant.userId)

  if (existing) {
    throw new HTTPError(409, '같은 이름의 프리셋이 이미 존재합니다', 'PRESET_DUPLICATE')
  }

  const [preset] = await scopedDb.insertPreset({
    userId: tenant.userId,
    name: body.name,
    command: body.command,
    description: body.description ?? null,
    category: body.category ?? null,
  })

  return c.json({ success: true, data: preset }, 201)
})

// GET /api/workspace/presets — 프리셋 목록 (본인 + isGlobal)
presetsRoute.get('/', async (c) => {
  const tenant = c.get('tenant')
  const scopedDb = getDB(tenant.companyId)

  const result = await scopedDb.presetsByUser(tenant.userId)

  return c.json({ success: true, data: result })
})

// PATCH /api/workspace/presets/:id — 프리셋 수정
presetsRoute.patch('/:id', zValidator('json', updatePresetSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const scopedDb = getDB(tenant.companyId)

  // Verify ownership
  const [existing] = await scopedDb.presetById(id)

  if (!existing) {
    throw new HTTPError(404, '프리셋을 찾을 수 없습니다', 'PRESET_NOT_FOUND')
  }

  if (existing.userId !== tenant.userId) {
    throw new HTTPError(403, '본인의 프리셋만 수정할 수 있습니다', 'PRESET_FORBIDDEN')
  }

  // Name duplicate check if name is changing
  if (body.name) {
    const [dup] = await scopedDb.presetByName(body.name, tenant.userId)
    if (dup && dup.id !== id) {
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

  const [updated] = await scopedDb.updatePreset(id, updateData as any)

  return c.json({ success: true, data: updated })
})

// DELETE /api/workspace/presets/:id — 프리셋 삭제
presetsRoute.delete('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const scopedDb = getDB(tenant.companyId)

  // Verify ownership
  const [existing] = await scopedDb.presetById(id)

  if (!existing) {
    throw new HTTPError(404, '프리셋을 찾을 수 없습니다', 'PRESET_NOT_FOUND')
  }

  if (existing.userId !== tenant.userId) {
    throw new HTTPError(403, '본인의 프리셋만 삭제할 수 있습니다', 'PRESET_FORBIDDEN')
  }

  await scopedDb.deletePreset(id)

  return c.json({ success: true, data: { deleted: true } })
})

// POST /api/workspace/presets/:id/execute — 프리셋 실행
presetsRoute.post('/:id/execute', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const scopedDb = getDB(tenant.companyId)

  // Load preset — must be active + owned or global
  const allPresets = await scopedDb.presetsByUser(tenant.userId)
  const preset = allPresets.find((p) => p.id === id)

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
  await scopedDb.incrementPresetSortOrder(id)

  // Trigger processing via new engine for executable command types
  const effectiveType = classResult.type
  if (effectiveType === 'direct' || effectiveType === 'mention' || effectiveType === 'all' || effectiveType === 'sequential') {
    const commandText = classResult.parsedMeta.slashArgs || preset.command
    runAgentForCommand({
      commandId: command.id,
      commandText,
      companyId: tenant.companyId,
      userId: tenant.userId,
      targetAgentId: classResult.targetAgentId,
    }).catch((err) => {
      console.error(`[Preset] runAgentForCommand failed for command ${command.id}:`, err)
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
