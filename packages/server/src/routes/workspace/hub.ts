import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../../middleware/auth'
import { getDB } from '../../db/scoped-query'
import { runAgent, sseStream, renderSoul } from '../../engine'
import { enrich } from '../../services/soul-enricher'
import { ERROR_CODES } from '../../lib/error-codes'
import { resolveCliToken } from '../../lib/cli-token-resolver'
import { getMaxHandoffDepth } from '../../services/handoff-depth-settings'
import { collectKnowledgeContext } from '../../services/knowledge-injector'
import type { AppEnv } from '../../types'
import type { SessionContext } from '../../engine'

export const hubRoute = new Hono<AppEnv>()

hubRoute.use('*', authMiddleware)

const streamSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
})

/** Parse @mention from start of message — returns { name, cleanText } or null */
function parseMention(message: string): { name: string; cleanText: string } | null {
  const match = message.match(/^@(\S+)\s*(.*)/s)
  return match ? { name: match[1], cleanText: match[2] || '' } : null
}

// POST /api/workspace/hub/stream — SSE streaming entry point (D6, S3, S7)
hubRoute.post('/stream', zValidator('json', streamSchema), async (c) => {
  const tenant = c.get('tenant')
  const { message, sessionId: inputSessionId, agentId: requestedAgentId } = c.req.valid('json')
  const { companyId, userId } = tenant

  // CLI 토큰 resolve — DB 우선, env 폴백
  let cliToken: string
  try {
    cliToken = await resolveCliToken(userId, companyId)
  } catch {
    return sseErrorResponse(ERROR_CODES.AGENT_SPAWN_FAILED, 'CLI 토큰이 등록되지 않았습니다')
  }

  const scopedDb = getDB(companyId)

  // Preset shortcut detection: if message exactly matches a preset name, expand it (Story 5.6)
  let agentMessage = message
  const userPresets = await scopedDb.presetsByUser(userId)
  const matchedPreset = userPresets.find((p) => p.name === message.trim())
  if (matchedPreset) {
    agentMessage = matchedPreset.command
    // Increment sortOrder for usage frequency tracking (non-blocking)
    scopedDb.incrementPresetSortOrder(matchedPreset.id).catch(() => {})
  }

  // Resolve target agent: explicit agentId > @mention > secretary
  let targetAgent: { id: string; name: string; soul: string | null; tier: string; departmentId: string | null } | null = null

  if (requestedAgentId) {
    const [agent] = await scopedDb.agentById(requestedAgentId)
    if (agent && agent.isActive !== false) {
      targetAgent = { id: agent.id, name: agent.name, soul: agent.soul, tier: agent.tier, departmentId: agent.departmentId }
    }
  }

  if (!targetAgent) {
    // Single agents() call shared between @mention and secretary resolution
    const allAgents = await scopedDb.agents()
    const mention = parseMention(agentMessage)

    if (mention) {
      const found = allAgents.find(
        (a) => (a.name === mention.name || a.nameEn === mention.name) && a.isActive !== false
      )
      if (found) {
        targetAgent = { id: found.id, name: found.name, soul: found.soul, tier: found.tier, departmentId: found.departmentId }
        agentMessage = mention.cleanText
      } else {
        return sseErrorResponse(ERROR_CODES.AGENT_SPAWN_FAILED, `에이전트 '${mention.name}'을(를) 찾을 수 없습니다`)
      }
    }

    if (!targetAgent) {
      // Secretary fallback — reuse allAgents from above
      const secretary = allAgents.find((a) => a.isSecretary && a.isActive !== false)
      if (secretary) {
        targetAgent = { id: secretary.id, name: secretary.name, soul: secretary.soul, tier: secretary.tier, departmentId: secretary.departmentId }
      } else {
        return sseErrorResponse(ERROR_CODES.AGENT_SPAWN_FAILED, '비서실장 에이전트가 설정되지 않았습니다')
      }
    }
  }

  // Render soul template with variable substitution (E4) + personality (Story 24.2) + knowledge_context (Story 10.4)
  const enriched = await enrich(targetAgent.id, companyId)
  const extraVars: Record<string, string> = { ...enriched.personalityVars, ...enriched.memoryVars }
  if (targetAgent.soul?.includes('{{knowledge_context}}') && targetAgent.departmentId) {
    const knowledgeCtx = await collectKnowledgeContext(companyId, targetAgent.id, targetAgent.departmentId, agentMessage)
    if (knowledgeCtx) {
      extraVars.knowledge_context = knowledgeCtx
    }
  }
  const soul = (targetAgent.soul
    ? await renderSoul(targetAgent.soul, targetAgent.id, companyId, extraVars)
    : '') + enriched.memoryContext

  // Build SessionContext (E1)
  const sessionId = inputSessionId ?? crypto.randomUUID()
  const ctx: SessionContext = {
    cliToken,
    userId,
    companyId,
    depth: 0,
    sessionId,
    startedAt: Date.now(),
    maxDepth: await getMaxHandoffDepth(companyId),
    visitedAgents: [targetAgent.id],
    runId: crypto.randomUUID(),  // E17: runId groups all tool calls in this session
  }

  // SSE streaming response
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  }

  const events = runAgent({ ctx, soul, message: agentMessage })
  const sseGenerator = sseStream(events)

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of sseGenerator) {
          controller.enqueue(encoder.encode(chunk))
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown stream error'
        const errorEvent = `event: error\ndata: ${JSON.stringify({ code: ERROR_CODES.AGENT_SPAWN_FAILED, message: errMsg })}\n\n`
        controller.enqueue(encoder.encode(errorEvent))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, { headers })
})

/** Helper: return SSE error as a single-event stream */
function sseErrorResponse(code: string, message: string): Response {
  const body = `event: error\ndata: ${JSON.stringify({ code, message })}\n\nevent: done\ndata: ${JSON.stringify({ costUsd: 0, tokensUsed: 0 })}\n\n`
  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
