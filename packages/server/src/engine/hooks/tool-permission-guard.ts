import { getDB } from '../../db/scoped-query'
import type { SessionContext, PreToolHookResult } from '../types'

/**
 * FR-TA3, NFR-S5: Engine-level allowed_tools enforcement
 *
 * call_agent is always permitted (core handoff mechanism).
 * All built-in tools require explicit inclusion in agents.allowed_tools JSONB.
 * null or empty allowed_tools = TOOL_NOT_ALLOWED for all built-in tools.
 */
export async function toolPermissionGuard(
  ctx: SessionContext,
  toolName: string,
  _toolInput: unknown,
): Promise<PreToolHookResult> {
  // call_agent is always allowed — core handoff mechanism (D4)
  if (toolName === 'call_agent') return { allow: true }

  const currentAgentId = ctx.visitedAgents[ctx.visitedAgents.length - 1]
  const [agent] = await getDB(ctx.companyId).agentById(currentAgentId)

  const allowedTools = (agent?.allowedTools as string[] | null) ?? []

  // FR-TA3: null or empty allowed_tools = no tools permitted
  if (allowedTools.length === 0 || !allowedTools.includes(toolName)) {
    return { allow: false, reason: `TOOL_NOT_ALLOWED: ${toolName}` }
  }

  return { allow: true }
}
