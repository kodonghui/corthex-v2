import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, sum, sql } from 'drizzle-orm'
import { db } from '../db'
import { commands, orchestrationTasks, agents, qualityReviews, costRecords } from '../db/schema'
import { microToUsd } from '../lib/cost-tracker'
import { authMiddleware } from '../middleware/auth'
import { departmentScopeMiddleware } from '../middleware/department-scope'
import { promptGuardMiddleware } from '../middleware/prompt-guard'
import { HTTPError } from '../middleware/error'
import { classify, createCommand } from '../services/command-router'
import { collectAgentResponse, renderSoul } from '../engine'
import { enrich } from '../services/soul-enricher'
import type { SessionContext } from '../engine'
import { getDB } from '../db/scoped-query'
import { getMaxHandoffDepth } from '../services/handoff-depth-settings'
import { resolveCliToken } from '../lib/cli-token-resolver'
import { processDebateCommand } from '../services/debate-command-handler'
import { processSketchCommand } from '../services/sketch-command-handler'
import { processToolCheck } from '../services/tool-check-handler'
import { processBatchRun, processBatchStatus } from '../services/batch-command-handler'
import { processCommandsList } from '../services/commands-list-handler'
import type { AppEnv } from '../types'

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

  // Resolve target agent
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

  const enriched = await enrich(agentRow.id, companyId)
  const extraVars = { ...enriched.personalityVars, ...enriched.memoryVars }
  const soul = agentRow.soul ? await renderSoul(agentRow.soul, agentRow.id, companyId, extraVars) : ''
  const ctx: SessionContext = {
    cliToken: await resolveCliToken(userId, companyId),
    userId,
    companyId,
    depth: 0,
    sessionId: commandId,
    startedAt: Date.now(),
    maxDepth: await getMaxHandoffDepth(companyId),
    visitedAgents: [agentRow.id],
    runId: crypto.randomUUID(),  // E17: runId groups all tool calls in this session
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

export const commandsRoute = new Hono<AppEnv>()

commandsRoute.use('*', authMiddleware)
commandsRoute.use('*', departmentScopeMiddleware)

const submitCommandSchema = z.object({
  text: z.string().min(1).max(10_000),
  targetAgentId: z.string().uuid().nullish(),
  presetId: z.string().uuid().nullish(),
  useBatch: z.boolean().optional().default(false),
})

// POST /api/workspace/commands — 명령 제출 + 자동 분류
// promptGuardMiddleware: 프롬프트 인젝션 방어 (FR55)
commandsRoute.post('/', zValidator('json', submitCommandSchema), promptGuardMiddleware, async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  // Employee: validate targetAgentId belongs to assigned department
  if (tenant.departmentIds && body.targetAgentId) {
    const [targetAgent] = await db
      .select({ departmentId: agents.departmentId })
      .from(agents)
      .where(and(eq(agents.id, body.targetAgentId), eq(agents.companyId, tenant.companyId)))
      .limit(1)

    if (!targetAgent || !targetAgent.departmentId || !tenant.departmentIds.includes(targetAgent.departmentId)) {
      throw new HTTPError(403, '해당 부서의 에이전트에게만 명령할 수 있습니다', 'SCOPE_002')
    }
  }

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

  // For direct/mention/all/sequential commands, run via new engine (fire-and-forget)
  if (result.type === 'direct' || result.type === 'mention' || result.type === 'all' || result.type === 'sequential') {
    const commandText = result.parsedMeta.slashArgs || body.text
    runAgentForCommand({
      commandId: command.id,
      commandText,
      companyId: tenant.companyId,
      userId: tenant.userId,
      targetAgentId: result.targetAgentId,
    }).catch((err) => {
      console.error(`[Engine] runAgentForCommand failed for command ${command.id}:`, err)
    })
  }

  // For /토론 or /심층토론 commands, trigger DebateCommandHandler
  if (result.parsedMeta.slashType === 'debate' || result.parsedMeta.slashType === 'deep_debate') {
    const debateTopic = result.parsedMeta.slashArgs || ''
    processDebateCommand({
      commandId: command.id,
      topic: debateTopic,
      debateType: result.parsedMeta.slashType === 'deep_debate' ? 'deep-debate' : 'debate',
      companyId: tenant.companyId,
      userId: tenant.userId,
    }).catch((err) => {
      console.error(`[DebateCommand] process failed for command ${command.id}:`, err)
    })
  }

  // For /스케치 commands, trigger SketchCommandHandler
  if (result.parsedMeta.slashType === 'sketch') {
    const sketchPrompt = result.parsedMeta.slashArgs || ''
    processSketchCommand({
      commandId: command.id,
      prompt: sketchPrompt,
      companyId: tenant.companyId,
      userId: tenant.userId,
    }).catch((err) => {
      console.error(`[SketchCommand] process failed for command ${command.id}:`, err)
    })
  }

  // For /도구점검 commands, trigger ToolCheckHandler
  if (result.parsedMeta.slashType === 'tool_check') {
    processToolCheck({
      commandId: command.id,
      companyId: tenant.companyId,
      userId: tenant.userId,
    }).catch((err) => {
      console.error(`[ToolCheck] process failed for command ${command.id}:`, err)
    })
  }

  // For /배치실행 commands, trigger BatchRunHandler
  if (result.parsedMeta.slashType === 'batch_run') {
    processBatchRun({
      commandId: command.id,
      companyId: tenant.companyId,
      userId: tenant.userId,
    }).catch((err) => {
      console.error(`[BatchRun] process failed for command ${command.id}:`, err)
    })
  }

  // For /배치상태 commands, trigger BatchStatusHandler
  if (result.parsedMeta.slashType === 'batch_status') {
    processBatchStatus({
      commandId: command.id,
      companyId: tenant.companyId,
      userId: tenant.userId,
    }).catch((err) => {
      console.error(`[BatchStatus] process failed for command ${command.id}:`, err)
    })
  }

  // For /명령어 commands, trigger CommandsListHandler
  if (result.parsedMeta.slashType === 'commands_list') {
    processCommandsList({
      commandId: command.id,
      companyId: tenant.companyId,
      userId: tenant.userId,
    }).catch((err) => {
      console.error(`[CommandsList] process failed for command ${command.id}:`, err)
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
