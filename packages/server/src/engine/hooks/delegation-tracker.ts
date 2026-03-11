import { eventBus } from '../../lib/event-bus'
import type { SessionContext } from '../types'

/**
 * PostToolUse Hook (3rd) — emits handoff events for call_agent tool.
 * Runs AFTER credential-scrubber and output-redactor (D4 order).
 * Only scrubbed/redacted data reaches this point.
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
    type: 'handoff',
    from,
    to,
    depth: ctx.depth,
    timestamp: new Date().toISOString(),
    sessionId: ctx.sessionId,
    companyId: ctx.companyId,
  })

  return toolOutput
}
