/**
 * engine/mcp/mcp-manager.ts — MCP 8-Stage Lifecycle Orchestrator (E12, D26)
 *
 * Stages 1–4 (this file + Story 18.4 for 5–8):
 *   Stage 1: RESOLVE  — {{credential:key}} template resolution from DB
 *   Stage 2: SPAWN    — lazy stdio process spawn via SpawnFn
 *   Stage 3: INIT     — JSON-RPC initialize 3-way handshake
 *   Stage 4: DISCOVER — tools/list discovery, cached per session
 *
 * D26: lazy spawn — process only starts when agent first uses an MCP tool.
 * warm start SLA: existing McpSession is returned from cache (no re-spawn/re-init).
 * cold start timeout: 120s (includes npm download on first run, ARM64 compile).
 *
 * Lifecycle events are logged to mcp_lifecycle_events via insertMcpLifecycleEvent().
 * SpawnFn is injectable (bun:test mock support).
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
}

// ─── Private helpers ─────────────────────────────────────────────────────────

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
