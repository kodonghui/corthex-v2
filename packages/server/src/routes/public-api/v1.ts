import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { agents, commands } from '../../db/schema'
import { apiKeyAuth } from '../../middleware/api-key-auth'
import { HTTPError } from '../../middleware/error'
import { classify, createCommand } from '../../services/command-router'
import { collectAgentResponse, renderSoul } from '../../engine'
import type { SessionContext } from '../../engine'
import { getDB } from '../../db/scoped-query'
import { getMaxHandoffDepth } from '../../services/handoff-depth-settings'
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

export const publicApiV1Route = new Hono<AppEnv>()

// 모든 공개 API에 API 키 인증 적용
publicApiV1Route.use('*', apiKeyAuth)

// 스코프 검증 헬퍼
function requireScope(c: { req: { header: (name: string) => string | undefined } }, required: string) {
  const scopes = c.req.header('X-API-Key-Scopes')?.split(',') || []
  if (!scopes.includes(required)) {
    throw new HTTPError(403, `이 작업에는 '${required}' 스코프가 필요합니다`, 'API_005')
  }
}

// GET /api/v1/agents — 에이전트 목록
publicApiV1Route.get('/agents', async (c) => {
  const tenant = c.get('tenant')
  requireScope(c, 'read')

  const result = await db
    .select({
      id: agents.id,
      name: agents.name,
      nameEn: agents.nameEn,
      role: agents.role,
      tier: agents.tier,
      status: agents.status,
      departmentId: agents.departmentId,
    })
    .from(agents)
    .where(and(eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)))

  return c.json({ success: true, data: result })
})

// GET /api/v1/agents/:id — 에이전트 상세
publicApiV1Route.get('/agents/:id', async (c) => {
  const tenant = c.get('tenant')
  requireScope(c, 'read')
  const id = c.req.param('id')

  const [agent] = await db
    .select({
      id: agents.id,
      name: agents.name,
      nameEn: agents.nameEn,
      role: agents.role,
      tier: agents.tier,
      modelName: agents.modelName,
      status: agents.status,
      departmentId: agents.departmentId,
      reportTo: agents.reportTo,
    })
    .from(agents)
    .where(and(eq(agents.id, id), eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'API_006')

  return c.json({ success: true, data: agent })
})

const commandSchema = z.object({
  text: z.string().min(1).max(10_000),
  targetAgentId: z.string().uuid().nullish(),
})

// POST /api/v1/commands — 명령 실행
publicApiV1Route.post('/commands', zValidator('json', commandSchema), async (c) => {
  const tenant = c.get('tenant')
  requireScope(c, 'execute')
  const body = c.req.valid('json')

  const result = await classify(body.text, {
    companyId: tenant.companyId,
    userId: tenant.userId,
    targetAgentId: body.targetAgentId ?? null,
    presetId: null,
    useBatch: false,
  })

  const command = await createCommand({
    companyId: tenant.companyId,
    userId: tenant.userId,
    text: body.text,
    type: result.type,
    targetAgentId: result.targetAgentId,
    metadata: result.parsedMeta,
  })

  // direct/mention commands → new engine (fire-and-forget)
  if (result.type === 'direct' || result.type === 'mention') {
    runAgentForCommand({
      commandId: command.id,
      commandText: body.text,
      companyId: tenant.companyId,
      userId: tenant.userId,
      targetAgentId: result.targetAgentId,
    }).catch((err) => {
      console.error(`[PublicAPI] runAgentForCommand failed for command ${command.id}:`, err)
    })
  }

  return c.json({
    success: true,
    data: {
      commandId: command.id,
      type: result.type,
      status: 'submitted',
    },
  }, 201)
})
