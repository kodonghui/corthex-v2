import { getDB } from '../../db/scoped-query'
import { ERROR_CODES } from '../../lib/error-codes'
import type { SessionContext, PreToolHookResult } from '../types'

export async function toolPermissionGuard(
  ctx: SessionContext,
  toolName: string,
  _toolInput: unknown,
): Promise<PreToolHookResult> {
  if (toolName === 'call_agent') return { allow: true }

  const currentAgentId = ctx.visitedAgents[ctx.visitedAgents.length - 1]
  const [agent] = await getDB(ctx.companyId).agentById(currentAgentId)

  const tools = (agent?.allowedTools as string[]) || []
  if (tools.length === 0) return { allow: true }

  if (tools.includes(toolName)) return { allow: true }
  return { allow: false, reason: ERROR_CODES.TOOL_PERMISSION_DENIED }
}
