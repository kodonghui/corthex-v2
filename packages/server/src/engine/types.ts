// Engine types — server internal only, do NOT re-export from shared/ (P1, S1)

/** E1: SessionContext — readonly immutable context for agent execution */
export interface SessionContext {
  readonly cliToken: string
  readonly userId: string
  readonly companyId: string
  readonly depth: number
  readonly sessionId: string
  readonly startedAt: number
  readonly maxDepth: number
  readonly visitedAgents: readonly string[]
}

/** E5: SSE event types — 6 variants only */
export type SSEEvent =
  | { type: 'accepted'; sessionId: string }
  | { type: 'processing'; agentName: string }
  | { type: 'handoff'; from: string; to: string; depth: number }
  | { type: 'message'; content: string }
  | { type: 'error'; code: string; message: string; agentName?: string }
  | { type: 'done'; costUsd: number; tokensUsed: number }

/** E2: Pre-tool hook result */
export interface PreToolHookResult {
  allow: boolean
  reason?: string
}

/** Tool definition for agent execution */
export interface Tool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

/** D6: Single entry point options */
export interface RunAgentOptions {
  ctx: SessionContext
  soul: string
  message: string
  tools?: Tool[]
}
