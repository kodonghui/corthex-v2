/**
 * engine/mcp/transports/stdio.ts — stdio MCP Transport (D25, E12 SPAWN+INIT)
 *
 * Implements McpTransport over child_process stdin/stdout.
 * JSON-RPC messages are NDJSON (one JSON object per line).
 * Request ID correlation: pendingRequests Map<id, {resolve, reject}>.
 * 3-way handshake: when send('initialize') is called, automatically sends
 *   'notifications/initialized' after receiving the initialize response.
 */
import { createInterface } from 'readline'
import type { JsonRpcRequest, JsonRpcResponse, McpTransport, McpServerConfigForTransport, SpawnFn } from '../mcp-transport'
import { ToolError } from '../../../lib/tool-error'

export class StdioTransport implements McpTransport {
  readonly sessionId: string

  private readonly proc: ReturnType<SpawnFn>
  private readonly pendingRequests = new Map<
    number | string,
    { resolve: (r: JsonRpcResponse) => void; reject: (e: unknown) => void }
  >()
  private nextId = 1

  constructor(config: McpServerConfigForTransport, spawnFn: SpawnFn) {
    this.sessionId = crypto.randomUUID()

    const env: Record<string, string> = {
      ...(process.env as Record<string, string>),
      ...(config.env ?? {}),
    }

    this.proc = spawnFn(
      config.command ?? 'npx',
      (config.args as string[]) ?? [],
      env,
    )

    // Read stdout line by line — NDJSON protocol (one JSON per line)
    const rl = createInterface({ input: (this.proc as any).stdout! })
    rl.on('line', (line: string) => {
      const trimmed = line.trim()
      if (!trimmed) return

      let msg: Record<string, unknown>
      try {
        msg = JSON.parse(trimmed) as Record<string, unknown>
      } catch {
        // Non-JSON output (e.g., npm debug logs) — silently ignore (NFR-I1)
        return
      }

      // Only route messages with IDs — notifications (no id) are fire-and-forget
      const id = msg.id as number | string | undefined
      if (id !== undefined && id !== null) {
        const pending = this.pendingRequests.get(id)
        if (pending) {
          this.pendingRequests.delete(id)
          pending.resolve(msg as unknown as JsonRpcResponse)
        }
        // Unknown IDs are silently dropped (NFR-I1: flexible parsing)
      }
    })

    // Process exit: reject all pending requests
    ;(this.proc as any).on('exit', (code: number | null) => {
      for (const [, { reject }] of this.pendingRequests) {
        reject(
          new ToolError(
            'TOOL_MCP_TRANSPORT_ERROR',
            `MCP process exited with code ${code ?? 'null'}`,
          ),
        )
      }
      this.pendingRequests.clear()
    })
  }

  /**
   * Send a JSON-RPC request and wait for the matching response.
   * Special case: 'initialize' method auto-completes the 3-way handshake by
   * sending 'notifications/initialized' after receiving the initialize response.
   */
  async send(message: JsonRpcRequest): Promise<JsonRpcResponse> {
    // Assign an ID if the caller didn't provide one
    const id = message.id ?? this.nextId++
    const requestWithId: JsonRpcRequest = { ...message, id }

    const response = await this._writeAndWait(requestWithId)

    // 3-way handshake completion (MCP Protocol § 2.1):
    // After receiving initialize response, send notifications/initialized notification
    if (message.method === 'initialize' && !response.error) {
      this._writeNotification({
        jsonrpc: '2.0',
        method: 'notifications/initialized',
      })
    }

    return response
  }

  /**
   * Terminate the transport (SIGTERM). mcp-manager handles SIGKILL escalation.
   */
  async close(): Promise<void> {
    try {
      ;(this.proc as any).stdin?.end?.()
      ;(this.proc as any).kill?.('SIGTERM')
    } catch {
      // Process may already be dead — ignore
    }
  }

  // --- Private helpers ---

  private _writeAndWait(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(request.id!, { resolve, reject })
      this._writeToStdin(request)
    })
  }

  /** Write a notification (no id, no response expected). */
  private _writeNotification(notification: { jsonrpc: '2.0'; method: string; params?: Record<string, unknown> }): void {
    this._writeToStdin(notification as JsonRpcRequest)
  }

  private _writeToStdin(message: object): void {
    try {
      const line = JSON.stringify(message) + '\n'
      ;(this.proc as any).stdin?.write?.(line)
    } catch {
      // stdin closed — process likely exited
    }
  }
}
