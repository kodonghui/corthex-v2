import { eventBus } from '../../lib/event-bus'
import type { SessionContext } from '../types'

/**
 * PostToolUse Hook (3rd) — emits handoff events for call_agent tool.
 * Runs AFTER credential-scrubber and output-redactor (D4 order).
 * Only scrubbed/redacted data reaches this point.
 *
 * Emits to EventBus in { companyId, payload } format (Story 6.5)
 * so index.ts bridge can broadcastToCompany(companyId, 'delegation', payload).
 * Payload follows DelegationEvent shape from services/delegation-tracker.ts
 * for frontend compatibility (use-command-center.ts delegation listener).
 */
export function delegationTracker(
  ctx: SessionContext,
  toolName: string,
  toolOutput: string,
  toolInput?: unknown,
): string {
  if (toolName !== 'call_agent') return toolOutput

  const from = ctx.visitedAgents[ctx.visitedAgents.length - 1] || 'unknown'
  const input = toolInput as { targetAgentId?: string; message?: string } | undefined
  const to = input?.targetAgentId || 'unknown'

  eventBus.emit('delegation', {
    companyId: ctx.companyId,
    payload: {
      commandId: ctx.sessionId,
      event: 'HANDOFF',
      agentId: ctx.visitedAgents[ctx.visitedAgents.length - 1],
      agentName: from,
      phase: 'handoff',
      elapsed: Date.now() - ctx.startedAt,
      timestamp: new Date().toISOString(),
      companyId: ctx.companyId,
      data: { from, to, depth: ctx.depth },
    },
  })

  return toolOutput
}
