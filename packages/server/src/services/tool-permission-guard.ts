// Tool Permission Guard — Server-side allowed_tools enforcement (NFR14)
// Dual permission layer: defensive check at execution time
// (preventive layer: LLM schema filtering in agent-runner.ts getToolDefinitions)

export type PermissionCheckResult = {
  allowed: boolean
  reason?: string
}

const WILDCARD = '*'
const TOOL_NOT_PERMITTED = 'TOOL_NOT_PERMITTED'

/**
 * Check if an agent is permitted to use a specific tool.
 * - Wildcard "*" in allowedTools means all tools permitted
 * - Empty/undefined allowedTools means no tools permitted
 */
export function checkToolPermission(
  allowedTools: string[] | undefined | null,
  toolName: string,
): PermissionCheckResult {
  if (!allowedTools || allowedTools.length === 0) {
    return {
      allowed: false,
      reason: `${TOOL_NOT_PERMITTED}: ${toolName} is not in your allowed tools (no tools permitted)`,
    }
  }

  if (allowedTools.includes(WILDCARD)) {
    return { allowed: true }
  }

  if (allowedTools.includes(toolName)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: `${TOOL_NOT_PERMITTED}: ${toolName} is not in your allowed tools`,
  }
}

/**
 * Check if allowedTools contains wildcard.
 */
export function hasWildcard(allowedTools: string[] | undefined | null): boolean {
  return !!allowedTools && allowedTools.includes(WILDCARD)
}
