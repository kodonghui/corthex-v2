import { runAgent, renderSoul } from '../../engine'
import { getDB } from '../../db/scoped-query'
import { ERROR_CODES } from '../../lib/error-codes'
import { collectKnowledgeContext } from '../../services/knowledge-injector'
import type { SessionContext, SSEEvent } from '../../engine'

/**
 * call_agent — N단계 핸드오프 도구 (E7: Phase 1 순차 전용)
 *
 * 비서/매니저가 하위 에이전트에게 작업을 위임.
 * 깊이 제한 + 순환 감지 + 대상 조회 → 재귀 runAgent 호출.
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

  // 5. Render target's soul template (with knowledge_context if present — Story 10.4)
  const soulText = agent.soul || ''
  let soulExtraVars: Record<string, string> | undefined
  if (soulText.includes('{{knowledge_context}}') && agent.departmentId) {
    const knowledgeCtx = await collectKnowledgeContext(ctx.companyId, targetAgentId, agent.departmentId, message)
    if (knowledgeCtx) {
      soulExtraVars = { knowledge_context: knowledgeCtx }
    }
  }
  const renderedSoul = soulExtraVars
    ? await renderSoul(soulText, targetAgentId, ctx.companyId, soulExtraVars)
    : await renderSoul(soulText, targetAgentId, ctx.companyId)

  // 6. Yield handoff event
  const currentAgentName = ctx.visitedAgents[ctx.visitedAgents.length - 1] || 'unknown'
  yield {
    type: 'handoff',
    from: currentAgentName,
    to: agent.name,
    depth: childCtx.depth,
  }

  // 7. Recursive runAgent — forward all child events (E7: sequential only)
  for await (const event of runAgent({ ctx: childCtx, soul: renderedSoul, message })) {
    yield event
  }
}
