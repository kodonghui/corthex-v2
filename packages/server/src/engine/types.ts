// Engine types — server internal only, do NOT re-export from shared/ (P1, S1)
import type { z } from 'zod'

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
  readonly runId: string  // UUID v4 generated at session start by agent-loop.ts (E17)
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

/**
 * E13: ToolCallContext — context passed to built-in tool handlers
 *
 * Derived from SessionContext by agent-loop.ts per session.
 * Handlers use ctx.companyId for getDB() and ctx.runId for E17 telemetry.
 */
export interface ToolCallContext {
  readonly companyId: string
  readonly agentId: string
  readonly runId: string    // shared across all tool calls in one session (E17, Pipeline Gate)
  readonly sessionId: string
}

/**
 * E12: McpSession — cached MCP server session (warm start reuse)
 *
 * Created at Stage 2 (SPAWN), populated with tools at Stage 4 (DISCOVER).
 * Reused for all subsequent tool calls in the same agent session (D26 warm start).
 */
export interface McpSession {
  readonly sessionId: string       // transport.sessionId (crypto.randomUUID)
  readonly mcpServerId: string     // UUID of mcp_server_configs row
  readonly agentSessionId: string  // SessionContext.sessionId (for teardown scoping)
  tools: Array<{ name: string; description?: string; inputSchema: Record<string, unknown> }>
  spawnedAt: number                // Date.now() at spawn
  lastUsedAt: number               // Date.now() at last access (warm start update)
}

/**
 * E13: BuiltinToolHandler — interface for all built-in tool implementations
 *
 * Every handler in tool-handlers/builtins/ MUST implement this interface.
 * execute() returns a string result on success, or throws ToolError on failure.
 * Never throw generic Error — always throw ToolError with TOOL_/AGENT_ prefix code.
 */
export interface BuiltinToolHandler {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodObject<any>
  execute: (input: Record<string, unknown>, ctx: ToolCallContext) => Promise<string>
}

/**
 * AR73: Standardized call_agent response format
 *
 * Returned as JSON tool_result to the calling model so it gets structured
 * data about the child agent's execution outcome.
 */
export interface CallAgentResponse {
  status: 'success' | 'failure' | 'partial'
  summary: string
  delegatedTo: string
  next_actions?: string[]
  artifacts?: object[]
}
