/**
 * engine/mcp/mcp-transport.ts — MCP Transport Abstraction (D25, E12)
 *
 * Defines the McpTransport interface and factory function.
 * Phase 1: only 'stdio' transport is active.
 * Phase 2+: 'sse'/'http' → add transports/sse.ts + transports/http.ts.
 */
import type { ChildProcess } from 'child_process'
import { ToolError } from '../../lib/tool-error'
import { StdioTransport } from './transports/stdio'

// --- JSON-RPC 2.0 types ---

export interface JsonRpcRequest {
  readonly jsonrpc: '2.0'
  readonly id?: number | string
  readonly method: string
  readonly params?: Record<string, unknown>
}

export interface JsonRpcResponse {
  readonly jsonrpc: '2.0'
  readonly id?: number | string
  readonly result?: unknown
  readonly error?: { code: number; message: string; data?: unknown }
}

// --- Transport interface ---

export interface McpTransport {
  /** Send a JSON-RPC request and wait for the matching response. */
  send(message: JsonRpcRequest): Promise<JsonRpcResponse>
  /** Terminate the underlying process/connection. */
  close(): Promise<void>
  /** Unique session identifier (crypto.randomUUID at spawn time). */
  readonly sessionId: string
}

// --- MCP Server config subset needed for transport creation ---

export interface McpServerConfigForTransport {
  readonly transport: string
  readonly command?: string | null
  readonly args?: string[] | null
  readonly env?: Record<string, string> | null
  readonly displayName: string
}

// --- SpawnFn — injectable for TEA testability (M4 fix) ---

export type SpawnFn = (
  cmd: string,
  args: string[],
  env: Record<string, string>,
) => ChildProcess

// --- Factory ---

/**
 * createMcpTransport — returns the correct transport for config.transport.
 * D25: Phase 1 = stdio only. sse/http → TOOL_MCP_TRANSPORT_UNSUPPORTED.
 * spawnFn is injectable so bun:test can pass a mock ChildProcess.
 */
export function createMcpTransport(
  config: McpServerConfigForTransport,
  spawnFn: SpawnFn,
): McpTransport {
  switch (config.transport) {
    case 'stdio':
      return new StdioTransport(config, spawnFn)

    case 'sse':
    case 'http':
      throw new ToolError(
        'TOOL_MCP_TRANSPORT_UNSUPPORTED',
        `MCP transport '${config.transport}' is not supported in Phase 1. Use 'stdio'.`,
      )

    default:
      throw new ToolError(
        'TOOL_MCP_TRANSPORT_UNSUPPORTED',
        `Unknown transport: ${config.transport}`,
      )
  }
}
