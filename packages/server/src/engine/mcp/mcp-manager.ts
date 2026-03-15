/**
 * engine/mcp/mcp-manager.ts — MCP 8-Stage Lifecycle Orchestrator (E12, D26)
 *
 * All 8 stages:
 *   Stage 1: RESOLVE  — {{credential:key}} template resolution from DB
 *   Stage 2: SPAWN    — lazy stdio process spawn via SpawnFn
 *   Stage 3: INIT     — JSON-RPC initialize 3-way handshake
 *   Stage 4: DISCOVER — tools/list discovery, cached per session
 *   Stage 5: MERGE    — namespace MCP tools + merge into builtin tools (getMergedTools)
 *   Stage 6: EXECUTE  — route tool_use call to correct MCP server (execute)
 *   Stage 7: RETURN   — convert MCP result to Anthropic tool_result ContentBlock
 *   Stage 8: TEARDOWN — SIGTERM → 5s → SIGKILL per session (teardownAll)
 *
 * D26: lazy spawn — process only starts when agent first uses an MCP tool.
 * warm start SLA: existing McpSession is returned from cache (no re-spawn/re-init).
 * cold start timeout: 120s (includes npm download on first run, ARM64 compile).
 *
 * Lifecycle events are logged to mcp_lifecycle_events via insertMcpLifecycleEvent().
 * SpawnFn is injectable (bun:test mock support).
 * E17: EXECUTE stage records tool_call_events (INSERT before call, UPDATE on complete).
 */
import type { ChildProcess } from 'child_process'
import { spawn } from 'child_process'
import { getDB } from '../../db/scoped-query'
import { decrypt } from '../../lib/credential-crypto'
import { ToolError } from '../../lib/tool-error'
import { createMcpTransport, type McpTransport, type SpawnFn } from './mcp-transport'

// ─── Constants ───────────────────────────────────────────────────────────────

export const COLD_START_TIMEOUT_MS = 120_000   // D26: 120s cold start (npm CDN + ARM64)
export const SIGTERM_TIMEOUT_MS = 5_000         // E12: SIGTERM → 5s → SIGKILL

// ─── Types ───────────────────────────────────────────────────────────────────

export interface McpToolDefinition {
  name: string
  description?: string
  inputSchema: Record<string, unknown>
}

export interface McpSession {
  readonly sessionId: string       // transport.sessionId
  readonly mcpServerId: string
  readonly agentSessionId: string  // agent's SessionContext.sessionId (for teardown)
  transport: McpTransport
  tools: McpToolDefinition[]       // DISCOVER result (cached for warm start)
  spawnedAt: number                // Date.now() at spawn
  lastUsedAt: number               // Date.now() at last getOrSpawnSession() call
}

// ─── McpManager ──────────────────────────────────────────────────────────────

export class McpManager {
  /** Cache key: `${agentSessionId}:${mcpServerId}` */
  private readonly sessions = new Map<string, McpSession>()

  constructor(
    private readonly spawnFn: SpawnFn = defaultSpawnFn,
  ) {}

  /**
   * getOrSpawnSession — Stages 1–4 (RESOLVE→SPAWN→INIT→DISCOVER).
   *
   * First call: spawns process, performs handshake, discovers tools.
   * Subsequent calls within same agentSessionId: returns cached McpSession (warm start).
   *
   * @param agentSessionId - SessionContext.sessionId (caller's session, for cache scoping)
   * @param mcpServerId    - UUID of mcp_server_configs row
   * @param companyId      - Tenant ID for getDB() isolation
   */
  async getOrSpawnSession(
    agentSessionId: string,
    mcpServerId: string,
    companyId: string,
  ): Promise<McpSession> {
    const cacheKey = `${agentSessionId}:${mcpServerId}`

    // Warm start — return cached session
    const existing = this.sessions.get(cacheKey)
    if (existing) {
      existing.lastUsedAt = Date.now()
      return existing
    }

    // Cold start — Stages 1–4
    const db = getDB(companyId)

    // Load MCP server config from DB
    const rows = await db.getMcpServerById(mcpServerId)
    if (!rows.length) {
      throw new ToolError('AGENT_MCP_SERVER_NOT_FOUND', `MCP server '${mcpServerId}' not found`)
    }
    const config = rows[0]!

    // ─── Stage 1: RESOLVE ──────────────────────────────────────────────────
    const spawnStart = Date.now()
    let resolvedEnv: Record<string, string>
    try {
      resolvedEnv = await resolveCredentials(config.env ?? {}, companyId)
    } catch (err) {
      const errorCode = err instanceof ToolError ? err.code : 'AGENT_MCP_CREDENTIAL_MISSING'
      await db.insertMcpLifecycleEvent({
        mcpServerId,
        sessionId: agentSessionId,
        event: 'error',
        errorCode,
        latencyMs: Date.now() - spawnStart,
      })
      throw err
    }

    // ─── Stage 2: SPAWN ────────────────────────────────────────────────────
    let transport: McpTransport
    try {
      transport = await withTimeout(
        COLD_START_TIMEOUT_MS,
        () => Promise.resolve(createMcpTransport(
          {
            transport: config.transport,
            command: config.command,
            args: config.args ?? [],
            env: resolvedEnv,
            displayName: config.displayName,
          },
          this.spawnFn,
        )),
      )
    } catch (err) {
      const errorCode = err instanceof ToolError ? err.code : 'AGENT_MCP_SPAWN_TIMEOUT'
      await db.insertMcpLifecycleEvent({
        mcpServerId,
        sessionId: agentSessionId,
        event: 'error',
        errorCode,
        latencyMs: Date.now() - spawnStart,
      })
      throw err instanceof ToolError ? err : new ToolError('AGENT_MCP_SPAWN_TIMEOUT', `MCP cold start exceeded ${COLD_START_TIMEOUT_MS}ms`)
    }

    await db.insertMcpLifecycleEvent({
      mcpServerId,
      sessionId: agentSessionId,
      event: 'spawn',
      latencyMs: Date.now() - spawnStart,
    })

    // ─── Stage 3: INIT (3-way handshake) ──────────────────────────────────
    const initStart = Date.now()
    try {
      const initResponse = await withTimeout(
        COLD_START_TIMEOUT_MS,
        () => transport.send({
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'corthex-engine', version: '1.0.0' },
          },
        }),
      )
      if (initResponse.error) {
        throw new ToolError(
          'AGENT_MCP_SPAWN_TIMEOUT',
          `MCP initialize failed: ${initResponse.error.message}`,
        )
      }
    } catch (err) {
      const errorCode = err instanceof ToolError ? err.code : 'AGENT_MCP_SPAWN_TIMEOUT'
      await db.insertMcpLifecycleEvent({
        mcpServerId,
        sessionId: agentSessionId,
        event: 'error',
        errorCode,
        latencyMs: Date.now() - initStart,
      })
      await transport.close().catch(() => {})
      throw err instanceof ToolError ? err : new ToolError('AGENT_MCP_SPAWN_TIMEOUT', `MCP INIT failed`)
    }

    await db.insertMcpLifecycleEvent({
      mcpServerId,
      sessionId: agentSessionId,
      event: 'init',
      latencyMs: Date.now() - initStart,
    })

    // ─── Stage 4: DISCOVER (tools/list) ───────────────────────────────────
    const discoverStart = Date.now()
    let tools: McpToolDefinition[] = []
    try {
      const discoverResponse = await withTimeout(
        COLD_START_TIMEOUT_MS,
        () => transport.send({
          jsonrpc: '2.0',
          method: 'tools/list',
          params: {},
        }),
      )
      if (!discoverResponse.error) {
        const result = discoverResponse.result as { tools?: unknown[] } | undefined
        tools = (result?.tools ?? []).map((t: unknown) => {
          const tool = t as { name: string; description?: string; inputSchema?: Record<string, unknown> }
          return {
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema ?? {},
          }
        })
      }
    } catch {
      // DISCOVER failure is non-fatal — session still usable, tools = []
    }

    await db.insertMcpLifecycleEvent({
      mcpServerId,
      sessionId: agentSessionId,
      event: 'discover',
      latencyMs: Date.now() - discoverStart,
    })

    // Cache and return session
    const session: McpSession = {
      sessionId: transport.sessionId,
      mcpServerId,
      agentSessionId,
      transport,
      tools,
      spawnedAt: spawnStart,
      lastUsedAt: Date.now(),
    }
    this.sessions.set(cacheKey, session)
    return session
  }

  /**
   * getSessionsForAgent — returns all cached sessions for a given agentSessionId.
   * Used by TEARDOWN stage (Story 18.4) and zombie detection.
   */
  getSessionsForAgent(agentSessionId: string): McpSession[] {
    const result: McpSession[] = []
    for (const [key, session] of this.sessions) {
      if (key.startsWith(`${agentSessionId}:`)) {
        result.push(session)
      }
    }
    return result
  }

  /**
   * removeSession — removes a session from cache (called after teardown).
   */
  removeSession(agentSessionId: string, mcpServerId: string): void {
    this.sessions.delete(`${agentSessionId}:${mcpServerId}`)
  }

  /**
   * hasSession — returns true if a warm session exists.
   */
  hasSession(agentSessionId: string, mcpServerId: string): boolean {
    return this.sessions.has(`${agentSessionId}:${mcpServerId}`)
  }

  // ─── Stage 5: MERGE ─────────────────────────────────────────────────────────

  /**
   * getMergedTools — Stage 5: MERGE.
   *
   * Namespaces MCP tools as `{displayName}__{toolName}` (double-underscore, FR-MCP4)
   * and merges them with the builtin tools array.
   *
   * @param builtinTools - built-in tool definitions (pass through unchanged)
   * @param mcpSessions  - active McpSession array with tools + displayName info
   * @returns merged tools array safe for messages.create()
   */
  getMergedTools(
    builtinTools: Array<{ name: string; description?: string; inputSchema: Record<string, unknown> }>,
    mcpSessions: Array<{ displayName: string; session: McpSession }>,
  ): Array<{ name: string; description?: string; inputSchema: Record<string, unknown> }> {
    const namespacedMcpTools = mcpSessions.flatMap(({ displayName, session }) => {
      const namespace = makeNamespace(displayName)
      return session.tools.map((tool) => ({
        name: `${namespace}__${tool.name}`,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }))
    })
    return [...builtinTools, ...namespacedMcpTools]
  }

  // ─── Stage 6: EXECUTE + Stage 7: RETURN ────────────────────────────────────

  /**
   * execute — Stage 6: EXECUTE + Stage 7: RETURN.
   *
   * Routes a namespaced MCP tool_use call to the correct MCP server.
   * Strips the namespace prefix, sends JSON-RPC tools/call, converts result to
   * Anthropic tool_result format (RETURN stage).
   *
   * E17: INSERT telemetry before call, UPDATE on success/failure.
   *
   * @param toolUseName     - namespaced tool name from LLM (e.g., "notion__create_page")
   * @param toolInput       - tool arguments from LLM
   * @param agentSessionId  - current agent session for session lookup
   * @param companyId       - tenant ID for DB access
   * @param agentId         - agent UUID for E17 telemetry
   * @param runId           - session runId for E17 telemetry (Pipeline Gate)
   */
  async execute(
    toolUseName: string,
    toolInput: Record<string, unknown>,
    agentSessionId: string,
    companyId: string,
    agentId: string,
    runId: string,
  ): Promise<string> {
    const db = getDB(companyId)
    const startTime = Date.now()

    // E17: INSERT telemetry row before execution
    const [{ id: eventId }] = await db.insertToolCallEvent({
      agentId,
      runId,
      toolName: toolUseName,
      startedAt: new Date(),
    })

    try {
      // Find the matching MCP session by namespace prefix
      const session = this._findSessionForTool(toolUseName, agentSessionId)
      if (!session) {
        throw new ToolError(
          'TOOL_MCP_SESSION_NOT_FOUND',
          `No active MCP session found for tool '${toolUseName}'`,
        )
      }

      // Strip namespace prefix to get original tool name
      const underscoreIdx = toolUseName.indexOf('__')
      const originalToolName = underscoreIdx >= 0 ? toolUseName.slice(underscoreIdx + 2) : toolUseName

      // Send JSON-RPC tools/call to MCP server
      const executeStart = Date.now()
      const response = await session.transport.send({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: originalToolName,
          arguments: toolInput,
        },
      })

      // Log lifecycle execute event
      await db.insertMcpLifecycleEvent({
        mcpServerId: session.mcpServerId,
        sessionId: agentSessionId,
        event: 'execute',
        latencyMs: Date.now() - executeStart,
      })

      // E17: UPDATE success
      await db.updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: true,
        durationMs: Date.now() - startTime,
      })

      // Stage 7: RETURN — convert to Anthropic tool_result format
      if (response.error) {
        return JSON.stringify({
          type: 'tool_result',
          is_error: true,
          content: `MCP tool error: ${response.error.message}`,
        })
      }

      const content = response.result as { content?: unknown[] } | unknown
      const resultContent =
        content && typeof content === 'object' && 'content' in content
          ? (content as { content: unknown[] }).content
          : [{ type: 'text', text: JSON.stringify(response.result) }]

      return JSON.stringify({
        type: 'tool_result',
        content: resultContent,
      })
    } catch (err) {
      // E17: UPDATE failure
      const errorCode = err instanceof ToolError ? err.code : 'TOOL_EXTERNAL_SERVICE_ERROR'
      await db.updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: false,
        errorCode,
        durationMs: Date.now() - startTime,
      })
      throw err
    }
  }

  // ─── Stage 8: TEARDOWN ──────────────────────────────────────────────────────

  /**
   * teardownAll — Stage 8: TEARDOWN.
   *
   * Sends SIGTERM to all MCP processes for the given agentSessionId.
   * After SIGTERM_TIMEOUT_MS (5s), sends SIGKILL to any still-running processes.
   * Logs mcp_lifecycle_events with event='teardown' for each server.
   * Cleans up session cache entries.
   *
   * @param agentSessionId - SessionContext.sessionId whose sessions to tear down
   * @param companyId      - tenant ID for DB lifecycle logging
   */
  async teardownAll(agentSessionId: string, companyId: string): Promise<void> {
    const sessions = this.getSessionsForAgent(agentSessionId)
    if (!sessions.length) return

    const db = getDB(companyId)

    await Promise.allSettled(
      sessions.map(async (session) => {
        const teardownStart = Date.now()
        try {
          // SIGTERM first
          await session.transport.close()

          // Wait SIGTERM_TIMEOUT_MS then SIGKILL if still running
          await new Promise<void>((resolve) => {
            const killTimer = setTimeout(async () => {
              // transport.close() already sent SIGTERM; force kill via underlying process
              try {
                const proc = (session.transport as unknown as { proc?: { kill?: (sig: string) => void } }).proc
                proc?.kill?.('SIGKILL')
              } catch {
                // Process already dead — ignore
              }
              resolve()
            }, SIGTERM_TIMEOUT_MS)

            // If process exits before timeout, clear the kill timer
            const proc = (session.transport as unknown as { proc?: { once?: (event: string, cb: () => void) => void } }).proc
            proc?.once?.('exit', () => {
              clearTimeout(killTimer)
              resolve()
            })
          })
        } catch {
          // SIGTERM failed — try SIGKILL immediately
          try {
            const proc = (session.transport as unknown as { proc?: { kill?: (sig: string) => void } }).proc
            proc?.kill?.('SIGKILL')
          } catch {
            // Process already dead
          }
        }

        // Log lifecycle teardown event
        await db.insertMcpLifecycleEvent({
          mcpServerId: session.mcpServerId,
          sessionId: agentSessionId,
          event: 'teardown',
          latencyMs: Date.now() - teardownStart,
        }).catch(() => {})  // non-fatal if DB unavailable at teardown

        // Remove from cache
        this.removeSession(agentSessionId, session.mcpServerId)
      }),
    )
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  /**
   * _findSessionForTool — finds the McpSession that owns a namespaced tool name.
   * e.g., "notion__create_page" → finds session with namespace "notion".
   */
  private _findSessionForTool(toolUseName: string, agentSessionId: string): McpSession | null {
    const underscoreIdx = toolUseName.indexOf('__')
    if (underscoreIdx < 0) return null
    const namespace = toolUseName.slice(0, underscoreIdx)

    for (const [key, session] of this.sessions) {
      if (!key.startsWith(`${agentSessionId}:`)) continue
      // Match by checking if any tool in this session would produce this namespace
      const hasMatchingTool = session.tools.some((tool) => {
        // We store original tool names; the namespace comes from displayName
        // We can't recover displayName from session alone — match by tool name presence
        return toolUseName.endsWith(`__${tool.name}`)
      })
      if (hasMatchingTool) return session
    }
    return null
  }
}

// ─── Module-level helpers ────────────────────────────────────────────────────

/**
 * makeNamespace — converts displayName to double-underscore namespace prefix.
 * "Notion MCP" → "notion_mcp", "My Server" → "my_server"
 * (lowercase, spaces→underscores; E12 FR-MCP4)
 */
export function makeNamespace(displayName: string): string {
  return displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

/**
 * resolveCredentials — Stage 1: RESOLVE.
 * Replaces {{credential:key_name}} patterns with decrypted values from DB.
 * Throws ToolError('AGENT_MCP_CREDENTIAL_MISSING') if key not found.
 */
export async function resolveCredentials(
  envTemplate: Record<string, string>,
  companyId: string,
): Promise<Record<string, string>> {
  const resolved: Record<string, string> = {}
  for (const [key, value] of Object.entries(envTemplate)) {
    const match = value.match(/^\{\{credential:(.+)\}\}$/)
    if (match) {
      const credKey = match[1]!
      const rows = await getDB(companyId).getCredential(credKey)
      if (!rows.length) {
        throw new ToolError('AGENT_MCP_CREDENTIAL_MISSING', `Credential '${credKey}' not found`)
      }
      resolved[key] = await decrypt(rows[0]!.encryptedValue)
    } else {
      resolved[key] = value
    }
  }
  return resolved
}

/**
 * withTimeout — races a promise against a timeout.
 * Rejects with ToolError('AGENT_MCP_SPAWN_TIMEOUT') if timeout fires first.
 */
async function withTimeout<T>(ms: number, fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new ToolError('AGENT_MCP_SPAWN_TIMEOUT', `MCP operation timed out after ${ms}ms`))
    }, ms)
    fn().then(
      (v) => { clearTimeout(timer); resolve(v) },
      (e) => { clearTimeout(timer); reject(e) },
    )
  })
}

/**
 * defaultSpawnFn — production SpawnFn using child_process.spawn.
 * bun:test injects a mock SpawnFn instead.
 */
function defaultSpawnFn(cmd: string, args: string[], env: Record<string, string>): ChildProcess {
  return spawn(cmd, args, {
    env: { ...process.env, ...env },
    stdio: ['pipe', 'pipe', 'pipe'],
  })
}

// ─── Singleton export ────────────────────────────────────────────────────────

/**
 * mcpManager — process-level singleton.
 * Agent-loop creates per-session McpManager instances (Story 18.5).
 * This export is for admin connection-test routes (Story 18.6) which need
 * a stateless test path (they discard the session after test).
 */
export const mcpManager = new McpManager()
