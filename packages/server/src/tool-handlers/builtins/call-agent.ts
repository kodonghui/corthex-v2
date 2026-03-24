import { runAgent, renderSoul } from '../../engine'
import { getDB } from '../../db/scoped-query'
import { ERROR_CODES } from '../../lib/error-codes'
import { collectKnowledgeContext } from '../../services/knowledge-injector'
import { enrich } from '../../services/soul-enricher'
import type { SessionContext, SSEEvent, CallAgentResponse } from '../../engine'

/**
 * call_agent — N단계 핸드오프 도구 (E7: Phase 1 순차 전용)
 *
 * 비서/매니저가 하위 에이전트에게 작업을 위임.
 * 깊이 제한 + 순환 감지 + 대상 조회 → 재귀 runAgent 호출.
 *
 * AR73: Child agent responses parsed into CallAgentResponse structured format.
 * All raw events still forwarded for SSE streaming.
 */
export async function* callAgent(
  ctx: SessionContext,
  input: { targetAgentId: string; message: string; priority?: string },
): AsyncGenerator<SSEEvent> {
  const { targetAgentId, message } = input

  // 1. Depth limit check
  if (ctx.depth >= ctx.maxDepth) {
    yield {
      type: 'error',
      code: ERROR_CODES.HANDOFF_DEPTH_EXCEEDED,
      message: `Handoff depth ${ctx.depth} exceeds max ${ctx.maxDepth}`,
    }
    return
  }

  // 2. Circular detection
  if (ctx.visitedAgents.includes(targetAgentId)) {
    yield {
      type: 'error',
      code: ERROR_CODES.HANDOFF_CIRCULAR,
      message: `Circular handoff detected: ${targetAgentId} already visited`,
    }
    return
  }

  // 3. Look up target agent
  const [agent] = await getDB(ctx.companyId).agentById(targetAgentId)
  if (!agent) {
    yield {
      type: 'error',
      code: ERROR_CODES.HANDOFF_TARGET_NOT_FOUND,
      message: `Target agent not found: ${targetAgentId}`,
    }
    return
  }

  // 4. Create child context (E1: spread copy, readonly immutable)
  const childCtx: SessionContext = {
    ...ctx,
    depth: ctx.depth + 1,
    visitedAgents: [...ctx.visitedAgents, targetAgentId] as readonly string[],
  }

  // 5. Render target's soul template with personality (Story 24.2) + knowledge_context (Story 10.4)
  const soulText = agent.soul || ''
  const enriched = await enrich(targetAgentId, ctx.companyId)
  const soulExtraVars: Record<string, string> = { ...enriched.personalityVars, ...enriched.memoryVars }
  if (soulText.includes('{{knowledge_context}}') && agent.departmentId) {
    const knowledgeCtx = await collectKnowledgeContext(ctx.companyId, targetAgentId, agent.departmentId, message)
    if (knowledgeCtx) {
      soulExtraVars.knowledge_context = knowledgeCtx
    }
  }
  const renderedSoul = await renderSoul(soulText, targetAgentId, ctx.companyId, soulExtraVars)

  // 6. Yield handoff event
  const currentAgentName = ctx.visitedAgents[ctx.visitedAgents.length - 1] || 'unknown'
  yield {
    type: 'handoff',
    from: currentAgentName,
    to: agent.name,
    depth: childCtx.depth,
  }

  // 7. AR73: Collect child events + forward for SSE + build structured response
  const messageParts: string[] = []
  let hasError = false
  let errorMessage = ''

  for await (const event of runAgent({ ctx: childCtx, soul: renderedSoul, message })) {
    yield event
    if (event.type === 'message') messageParts.push(event.content)
    if (event.type === 'error') {
      hasError = true
      errorMessage = event.message
    }
  }

  // 8. AR73: Yield structured response summary as final message
  const response: CallAgentResponse = parseChildResponse(agent.name, messageParts.join(''), hasError, errorMessage)
  yield { type: 'message', content: `\n[call_agent_result: ${JSON.stringify(response)}]` }
}

/**
 * AR73: Parse child agent output into structured CallAgentResponse
 */
export function parseChildResponse(
  agentName: string,
  content: string,
  hasError: boolean,
  errorMessage: string,
): CallAgentResponse {
  if (hasError && !content) {
    return {
      status: 'failure',
      summary: errorMessage || `${agentName} 작업 실패`,
      delegatedTo: agentName,
    }
  }

  if (hasError && content) {
    return {
      status: 'partial',
      summary: content.slice(0, 500),
      delegatedTo: agentName,
      next_actions: ['부분 결과 확인 필요'],
    }
  }

  return {
    status: 'success',
    summary: content.slice(0, 500),
    delegatedTo: agentName,
  }
}
