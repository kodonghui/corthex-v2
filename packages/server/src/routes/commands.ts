import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, sum, sql } from 'drizzle-orm'
import { db } from '../db'
import { commands, orchestrationTasks, agents, qualityReviews, costRecords } from '../db/schema'
import { microToUsd } from '../lib/cost-tracker'
import { authMiddleware } from '../middleware/auth'
import { HTTPError } from '../middleware/error'
import { classify, createCommand } from '../services/command-router'
import { process as chiefOfStaffProcess } from '../services/chief-of-staff'
import { processAll } from '../services/all-command-processor'
import { processSequential } from '../services/sequential-command-processor'
import type { AppEnv } from '../types'

export const commandsRoute = new Hono<AppEnv>()

commandsRoute.use('*', authMiddleware)

const submitCommandSchema = z.object({
  text: z.string().min(1).max(10_000),
  targetAgentId: z.string().uuid().nullish(),
  presetId: z.string().uuid().nullish(),
  useBatch: z.boolean().optional().default(false),
})

// POST /api/workspace/commands — 명령 제출 + 자동 분류
commandsRoute.post('/', zValidator('json', submitCommandSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  const result = await classify(body.text, {
    companyId: tenant.companyId,
    userId: tenant.userId,
    targetAgentId: body.targetAgentId ?? null,
    presetId: body.presetId ?? null,
    useBatch: body.useBatch,
  })

  const command = await createCommand({
    companyId: tenant.companyId,
    userId: tenant.userId,
    text: body.text,
    type: result.type,
    targetAgentId: result.targetAgentId,
    metadata: result.parsedMeta,
  })

  // For direct commands (natural text, no slash/mention), trigger ChiefOfStaff processing asynchronously
  if (result.type === 'direct') {
    // Fire-and-forget: process in background, results via WebSocket
    chiefOfStaffProcess({
      commandId: command.id,
      commandText: body.text,
      companyId: tenant.companyId,
      userId: tenant.userId,
    }).catch((err) => {
      console.error(`[ChiefOfStaff] process failed for command ${command.id}:`, err)
    })
  }

  // For mention commands with targetAgentId, also trigger ChiefOfStaff (skip classification)
  if (result.type === 'mention' && result.targetAgentId) {
    chiefOfStaffProcess({
      commandId: command.id,
      commandText: body.text,
      companyId: tenant.companyId,
      userId: tenant.userId,
      targetAgentId: result.targetAgentId,
    }).catch((err) => {
      console.error(`[ChiefOfStaff] process failed for mention command ${command.id}:`, err)
    })
  }

  // For /전체 commands, trigger AllCommandProcessor
  if (result.type === 'all') {
    const allText = result.parsedMeta.slashArgs || body.text
    processAll({
      commandId: command.id,
      commandText: allText,
      companyId: tenant.companyId,
      userId: tenant.userId,
    }).catch((err) => {
      console.error(`[AllCommand] process failed for command ${command.id}:`, err)
    })
  }

  // For /순차 commands, trigger SequentialCommandProcessor
  if (result.type === 'sequential') {
    const seqText = result.parsedMeta.slashArgs || body.text
    processSequential({
      commandId: command.id,
      commandText: seqText,
      companyId: tenant.companyId,
      userId: tenant.userId,
    }).catch((err) => {
      console.error(`[SequentialCommand] process failed for command ${command.id}:`, err)
    })
  }

  return c.json({
    success: true,
    data: {
      id: command.id,
      type: command.type,
      status: command.status,
      targetAgentId: command.targetAgentId,
      parsedMeta: result.parsedMeta,
      createdAt: command.createdAt,
    },
  }, 201)
})

// GET /api/workspace/commands — 명령 이력 조회
commandsRoute.get('/', async (c) => {
  const tenant = c.get('tenant')
  const limit = Math.min(Number(c.req.query('limit') || '20'), 100)
  const offset = Math.max(Number(c.req.query('offset') || '0'), 0)

  const result = await db
    .select({
      id: commands.id,
      type: commands.type,
      text: commands.text,
      targetAgentId: commands.targetAgentId,
      status: commands.status,
      result: commands.result,
      metadata: commands.metadata,
      createdAt: commands.createdAt,
      completedAt: commands.completedAt,
    })
    .from(commands)
    .where(and(
      eq(commands.companyId, tenant.companyId),
      eq(commands.userId, tenant.userId),
    ))
    .orderBy(desc(commands.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({ success: true, data: result })
})

// GET /api/workspace/commands/:id — 단일 명령 조회
commandsRoute.get('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [command] = await db
    .select()
    .from(commands)
    .where(and(
      eq(commands.id, id),
      eq(commands.companyId, tenant.companyId),
    ))
    .limit(1)

  if (!command) {
    throw new HTTPError(404, '명령을 찾을 수 없습니다', 'CMD_001')
  }

  return c.json({ success: true, data: command })
})

// === Task 1: PATCH /api/workspace/commands/:id/feedback — 피드백 제출 ===
const feedbackSchema = z.object({
  rating: z.enum(['up', 'down']),
  comment: z.string().max(1000).optional(),
})

commandsRoute.patch('/:id/feedback', zValidator('json', feedbackSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  // Verify command exists and belongs to this user
  const [command] = await db
    .select({ id: commands.id, metadata: commands.metadata })
    .from(commands)
    .where(and(
      eq(commands.id, id),
      eq(commands.companyId, tenant.companyId),
      eq(commands.userId, tenant.userId),
    ))
    .limit(1)

  if (!command) {
    throw new HTTPError(404, '명령을 찾을 수 없습니다', 'CMD_001')
  }

  // Merge feedback into existing metadata (jsonb)
  const existingMeta = (command.metadata ?? {}) as Record<string, unknown>
  const updatedMeta = {
    ...existingMeta,
    feedback: {
      rating: body.rating,
      comment: body.comment ?? null,
      updatedAt: new Date().toISOString(),
    },
  }

  await db.update(commands)
    .set({ metadata: updatedMeta })
    .where(and(eq(commands.id, id), eq(commands.companyId, tenant.companyId)))

  return c.json({ success: true, data: { feedback: updatedMeta.feedback } })
})

// === Task 2: GET /api/workspace/commands/:id/cost — 명령 비용 집계 ===
commandsRoute.get('/:id/cost', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  // Verify command exists
  const [command] = await db
    .select({ id: commands.id, createdAt: commands.createdAt, completedAt: commands.completedAt })
    .from(commands)
    .where(and(
      eq(commands.id, id),
      eq(commands.companyId, tenant.companyId),
    ))
    .limit(1)

  if (!command) {
    throw new HTTPError(404, '명령을 찾을 수 없습니다', 'CMD_001')
  }

  // Get agent IDs from orchestration_tasks for this command
  const tasks = await db
    .select({ agentId: orchestrationTasks.agentId })
    .from(orchestrationTasks)
    .where(and(
      eq(orchestrationTasks.commandId, id),
      eq(orchestrationTasks.companyId, tenant.companyId),
    ))

  if (tasks.length === 0) {
    return c.json({
      success: true,
      data: { inputTokens: 0, outputTokens: 0, totalCostUsd: 0 },
    })
  }

  // Find time range for this command's execution
  const agentIds = [...new Set(tasks.map(t => t.agentId))]
  const startTime = command.createdAt
  const endTime = command.completedAt ?? new Date()

  // Aggregate cost_records for these agents in the command's time window
  const [costAgg] = await db
    .select({
      inputTokens: sum(costRecords.inputTokens).mapWith(Number),
      outputTokens: sum(costRecords.outputTokens).mapWith(Number),
      totalCostMicro: sum(costRecords.costUsdMicro).mapWith(Number),
    })
    .from(costRecords)
    .where(and(
      eq(costRecords.companyId, tenant.companyId),
      sql`${costRecords.agentId} = ANY(${agentIds})`,
      sql`${costRecords.createdAt} >= ${startTime}`,
      sql`${costRecords.createdAt} <= ${endTime}`,
    ))

  return c.json({
    success: true,
    data: {
      inputTokens: costAgg?.inputTokens ?? 0,
      outputTokens: costAgg?.outputTokens ?? 0,
      totalCostUsd: microToUsd(costAgg?.totalCostMicro ?? 0),
    },
  })
})

// === Task 3: GET /api/workspace/commands/:id/delegation — 위임 체인 조회 ===
commandsRoute.get('/:id/delegation', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  // Verify command exists
  const [command] = await db
    .select({ id: commands.id })
    .from(commands)
    .where(and(
      eq(commands.id, id),
      eq(commands.companyId, tenant.companyId),
    ))
    .limit(1)

  if (!command) {
    throw new HTTPError(404, '명령을 찾을 수 없습니다', 'CMD_001')
  }

  // Get orchestration tasks with agent info
  const delegationChain = await db
    .select({
      taskId: orchestrationTasks.id,
      agentId: orchestrationTasks.agentId,
      agentName: agents.name,
      agentTier: agents.tier,
      taskType: orchestrationTasks.type,
      status: orchestrationTasks.status,
      parentTaskId: orchestrationTasks.parentTaskId,
      startedAt: orchestrationTasks.startedAt,
      completedAt: orchestrationTasks.completedAt,
      durationMs: orchestrationTasks.durationMs,
    })
    .from(orchestrationTasks)
    .innerJoin(agents, eq(orchestrationTasks.agentId, agents.id))
    .where(and(
      eq(orchestrationTasks.commandId, id),
      eq(orchestrationTasks.companyId, tenant.companyId),
    ))
    .orderBy(orchestrationTasks.createdAt)

  // Get quality reviews for this command
  const reviews = await db
    .select({
      id: qualityReviews.id,
      conclusion: qualityReviews.conclusion,
      scores: qualityReviews.scores,
      feedback: qualityReviews.feedback,
      attemptNumber: qualityReviews.attemptNumber,
      createdAt: qualityReviews.createdAt,
    })
    .from(qualityReviews)
    .where(and(
      eq(qualityReviews.commandId, id),
      eq(qualityReviews.companyId, tenant.companyId),
    ))
    .orderBy(qualityReviews.createdAt)

  return c.json({
    success: true,
    data: {
      chain: delegationChain,
      qualityReviews: reviews,
    },
  })
})
