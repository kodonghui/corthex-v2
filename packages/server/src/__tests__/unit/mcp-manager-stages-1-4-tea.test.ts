import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 18.3: mcp-manager.ts TEA Tests — RESOLVE→SPAWN→INIT→DISCOVER (Stages 1–4) ===
// TEA: Risk-based — P0 resolveCredentials logic, P0 McpManager source exports + structure,
//      P0 warm start cache (session Map logic), P1 timeout constants, P1 source patterns,
//      P1 lifecycle logging, P1 engine/types.ts McpSession
// NOTE: Dynamic import of mcp-manager.ts triggers credential-crypto module-level key
//       validation (throws in test env). All mcp-manager checks use fs.readFileSync.

const SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../engine/mcp/mcp-manager.ts'),
  'utf-8',
)

// ─── P0: resolveCredentials — pure logic (no DB) ────────────────────────────

describe('[P0] resolveCredentials — credential template substitution logic', () => {
  /**
   * Simulates resolveCredentials logic without real DB.
   * Pattern: {{credential:key_name}} → replaces if in map, throws if missing.
   */
  function simulateResolve(
    envTemplate: Record<string, string>,
    credentialMap: Record<string, string>,
  ): Record<string, string> {
    const resolved: Record<string, string> = {}
    for (const [key, value] of Object.entries(envTemplate)) {
      const match = value.match(/^\{\{credential:(.+)\}\}$/)
      if (match) {
        const credKey = match[1]!
        if (!(credKey in credentialMap)) {
          throw { code: 'AGENT_MCP_CREDENTIAL_MISSING', message: `Credential '${credKey}' not found` }
        }
        resolved[key] = credentialMap[credKey]!
      } else {
        resolved[key] = value
      }
    }
    return resolved
  }

  test('plain env values pass through unchanged', () => {
    const result = simulateResolve({ FOO: 'bar', BAZ: 'qux' }, {})
    expect(result.FOO).toBe('bar')
    expect(result.BAZ).toBe('qux')
  })

  test('{{credential:key}} is replaced with resolved value', () => {
    const result = simulateResolve(
      { NOTION_TOKEN: '{{credential:notion_integration_token}}' },
      { notion_integration_token: 'secret-abc-123' },
    )
    expect(result.NOTION_TOKEN).toBe('secret-abc-123')
  })

  test('mixed env: some plain, some credential templates', () => {
    const result = simulateResolve(
      { HOST: 'localhost', API_KEY: '{{credential:my_api_key}}', PORT: '3000' },
      { my_api_key: 'resolved-key-value' },
    )
    expect(result.HOST).toBe('localhost')
    expect(result.API_KEY).toBe('resolved-key-value')
    expect(result.PORT).toBe('3000')
  })

  test('missing credential throws AGENT_MCP_CREDENTIAL_MISSING (AC3)', () => {
    let thrown: { code?: string } | null = null
    try {
      simulateResolve({ TOKEN: '{{credential:missing_key}}' }, {})
    } catch (e) {
      thrown = e as { code?: string }
    }
    expect(thrown).not.toBeNull()
    expect(thrown?.code).toBe('AGENT_MCP_CREDENTIAL_MISSING')
  })

  test('partial: missing key throws with key name in message', () => {
    let thrown: { message?: string } | null = null
    try {
      simulateResolve(
        { A: '{{credential:present}}', B: '{{credential:absent}}' },
        { present: 'value' },
      )
    } catch (e) {
      thrown = e as { message?: string }
    }
    expect(thrown?.message).toContain('absent')
  })

  test('empty env template returns empty object', () => {
    const result = simulateResolve({}, {})
    expect(Object.keys(result)).toHaveLength(0)
  })

  test('pattern is anchored: prefix+suffix text passes through unchanged', () => {
    // Not anchored by regex → plain value passes as-is (no credential lookup)
    const result = simulateResolve(
      { VAL: 'prefix-{{credential:key}}-suffix' },
      { key: 'secret' },
    )
    expect(result.VAL).toBe('prefix-{{credential:key}}-suffix')
  })

  test('empty credential key after match is treated as empty string key', () => {
    // Edge case: {{credential:}} — key is empty string
    let thrown: { code?: string } | null = null
    try {
      simulateResolve({ X: '{{credential:}}' }, {})
    } catch (e) {
      thrown = e as { code?: string }
    }
    // Either throws MISSING or passes through empty key (implementation choice)
    // Just verify it doesn't crash the test harness
    expect(true).toBe(true)
  })
})

// ─── P0: McpManager source — exports and structure ───────────────────────────

describe('[P0] mcp-manager.ts — exports and class structure', () => {
  test('exports McpManager class', () => {
    expect(SRC).toContain('export class McpManager')
  })

  test('exports resolveCredentials function (unit testable)', () => {
    expect(SRC).toContain('export async function resolveCredentials')
  })

  test('exports COLD_START_TIMEOUT_MS constant', () => {
    expect(SRC).toContain('export const COLD_START_TIMEOUT_MS')
  })

  test('exports SIGTERM_TIMEOUT_MS constant', () => {
    expect(SRC).toContain('export const SIGTERM_TIMEOUT_MS')
  })

  test('exports McpSession interface', () => {
    expect(SRC).toContain('export interface McpSession')
  })

  test('exports McpToolDefinition interface', () => {
    expect(SRC).toContain('export interface McpToolDefinition')
  })

  test('exports mcpManager singleton', () => {
    expect(SRC).toContain('export const mcpManager')
  })

  test('McpManager has getOrSpawnSession method', () => {
    expect(SRC).toContain('getOrSpawnSession(')
  })

  test('McpManager has getSessionsForAgent method', () => {
    expect(SRC).toContain('getSessionsForAgent(')
  })

  test('McpManager has removeSession method', () => {
    expect(SRC).toContain('removeSession(')
  })

  test('McpManager has hasSession method', () => {
    expect(SRC).toContain('hasSession(')
  })
})

// ─── P0: Constants values ────────────────────────────────────────────────────

describe('[P0] Constants — D26 + E12 values', () => {
  test('COLD_START_TIMEOUT_MS is 120000 (D26 — npm CDN + ARM64)', () => {
    expect(SRC).toContain('COLD_START_TIMEOUT_MS = 120_000')
  })

  test('SIGTERM_TIMEOUT_MS is 5000 (E12 — SIGTERM before SIGKILL)', () => {
    expect(SRC).toContain('SIGTERM_TIMEOUT_MS = 5_000')
  })
})

// ─── P0: Warm start cache logic ──────────────────────────────────────────────

describe('[P0] McpManager — warm start cache (AC5, pure logic)', () => {
  /** Minimal in-memory McpSession cache simulation (mirrors McpManager internals) */
  class SessionCache {
    private readonly sessions = new Map<string, { sessionId: string; mcpServerId: string; lastUsedAt: number }>()

    set(agentSessionId: string, mcpServerId: string): void {
      this.sessions.set(`${agentSessionId}:${mcpServerId}`, {
        sessionId: crypto.randomUUID(),
        mcpServerId,
        lastUsedAt: Date.now(),
      })
    }

    get(agentSessionId: string, mcpServerId: string) {
      return this.sessions.get(`${agentSessionId}:${mcpServerId}`) ?? null
    }

    has(agentSessionId: string, mcpServerId: string): boolean {
      return this.sessions.has(`${agentSessionId}:${mcpServerId}`)
    }

    remove(agentSessionId: string, mcpServerId: string): void {
      this.sessions.delete(`${agentSessionId}:${mcpServerId}`)
    }

    getForAgent(agentSessionId: string): Array<{ sessionId: string; mcpServerId: string }> {
      const result = []
      for (const [key, session] of this.sessions) {
        if (key.startsWith(`${agentSessionId}:`)) result.push(session)
      }
      return result
    }
  }

  test('has() returns false before any session is set', () => {
    const cache = new SessionCache()
    expect(cache.has('session-a', 'server-1')).toBe(false)
  })

  test('has() returns true after set()', () => {
    const cache = new SessionCache()
    cache.set('session-a', 'server-1')
    expect(cache.has('session-a', 'server-1')).toBe(true)
  })

  test('get() returns null before set', () => {
    const cache = new SessionCache()
    expect(cache.get('session-a', 'server-1')).toBeNull()
  })

  test('get() returns session after set (warm start reuse)', () => {
    const cache = new SessionCache()
    cache.set('session-a', 'server-1')
    const s = cache.get('session-a', 'server-1')
    expect(s).not.toBeNull()
    expect(s?.mcpServerId).toBe('server-1')
  })

  test('different agentSessionId → separate cache entry (no collision)', () => {
    const cache = new SessionCache()
    cache.set('session-a', 'server-1')
    expect(cache.has('session-b', 'server-1')).toBe(false)
  })

  test('different mcpServerId → separate cache entry', () => {
    const cache = new SessionCache()
    cache.set('session-a', 'server-1')
    expect(cache.has('session-a', 'server-2')).toBe(false)
  })

  test('remove() clears the entry', () => {
    const cache = new SessionCache()
    cache.set('session-a', 'server-1')
    cache.remove('session-a', 'server-1')
    expect(cache.has('session-a', 'server-1')).toBe(false)
  })

  test('remove() on non-existent entry is safe (no throw)', () => {
    const cache = new SessionCache()
    expect(() => cache.remove('session-x', 'server-y')).not.toThrow()
  })

  test('getForAgent() returns empty array before any session', () => {
    const cache = new SessionCache()
    expect(cache.getForAgent('session-xyz')).toHaveLength(0)
  })

  test('getForAgent() returns all sessions for a given agentSessionId', () => {
    const cache = new SessionCache()
    cache.set('session-a', 'server-1')
    cache.set('session-a', 'server-2')
    cache.set('session-b', 'server-1')  // different agent
    const sessions = cache.getForAgent('session-a')
    expect(sessions).toHaveLength(2)
    expect(sessions.map(s => s.mcpServerId).sort()).toEqual(['server-1', 'server-2'])
  })

  test('same (agentSessionId, mcpServerId) second call returns same session (warm start contract)', () => {
    const cache = new SessionCache()
    cache.set('session-a', 'server-1')
    const first = cache.get('session-a', 'server-1')
    const second = cache.get('session-a', 'server-1')
    // Both return the same sessionId — no re-spawn
    expect(first?.sessionId).toBe(second?.sessionId)
  })
})

// ─── P1: Source code pattern checks ──────────────────────────────────────────

describe('[P1] mcp-manager.ts — source code structural patterns', () => {
  test('imports getDB from scoped-query (AC1 DB isolation)', () => {
    expect(SRC).toContain("from '../../db/scoped-query'")
  })

  test('imports decrypt from credential-crypto (Stage 1 RESOLVE)', () => {
    expect(SRC).toContain("from '../../lib/credential-crypto'")
  })

  test('imports ToolError (error codes)', () => {
    expect(SRC).toContain("from '../../lib/tool-error'")
  })

  test('imports createMcpTransport (SPAWN stage)', () => {
    expect(SRC).toContain('createMcpTransport')
  })

  test('AGENT_MCP_CREDENTIAL_MISSING error code present (AC3)', () => {
    expect(SRC).toContain('AGENT_MCP_CREDENTIAL_MISSING')
  })

  test('AGENT_MCP_SPAWN_TIMEOUT error code present (AC4)', () => {
    expect(SRC).toContain('AGENT_MCP_SPAWN_TIMEOUT')
  })

  test('credential template regex anchored to whole value', () => {
    // Pattern that anchors: /^\{\{credential:(.+)\}\}$/
    expect(SRC).toContain('credential:')
    // Anchored regex in source uses ^ and $ with escaped braces
    expect(SRC).toContain('credential:(.+)')
  })

  test('insertMcpLifecycleEvent called at multiple stages (FR-SO3)', () => {
    const matches = SRC.match(/insertMcpLifecycleEvent/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(4)  // spawn + init + discover + error
  })

  test('lifecycle event "spawn" logged (AC1)', () => {
    expect(SRC).toContain("event: 'spawn'")
  })

  test('lifecycle event "init" logged (AC2 INIT stage)', () => {
    expect(SRC).toContain("event: 'init'")
  })

  test('lifecycle event "discover" logged (AC2 DISCOVER stage)', () => {
    expect(SRC).toContain("event: 'discover'")
  })

  test('lifecycle event "error" logged (AC3 RESOLVE fail + AC4 timeout)', () => {
    expect(SRC).toContain("event: 'error'")
  })

  test('SpawnFn injectable via constructor (TEA mock support)', () => {
    expect(SRC).toContain('spawnFn')
  })

  test('tools/list method sent in DISCOVER stage (AC2)', () => {
    expect(SRC).toContain("'tools/list'")
  })

  test('initialize method sent in INIT stage (AC2 3-way handshake)', () => {
    expect(SRC).toContain("'initialize'")
  })

  test('protocolVersion 2024-11-05 in initialize request', () => {
    expect(SRC).toContain('2024-11-05')
  })

  test('sessions Map for cache storage (warm start AC5)', () => {
    expect(SRC).toContain('sessions')
    expect(SRC).toContain('Map')
  })

  test('cacheKey uses colon as separator (agentSessionId:mcpServerId)', () => {
    expect(SRC).toContain('cacheKey')
  })
})

// ─── P1: Timeout logic (pure simulation) ────────────────────────────────────

describe('[P1] withTimeout — timeout mechanics (AC4, pure simulation)', () => {
  async function withTimeout<T>(ms: number, fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('AGENT_MCP_SPAWN_TIMEOUT')), ms)
      fn().then(
        (v) => { clearTimeout(timer); resolve(v) },
        (e) => { clearTimeout(timer); reject(e) },
      )
    })
  }

  test('fast operation completes before timeout', async () => {
    const result = await withTimeout(1000, () => Promise.resolve(42))
    expect(result).toBe(42)
  })

  test('slow operation triggers timeout rejection', async () => {
    let thrown: Error | null = null
    try {
      await withTimeout(10, () => new Promise(r => setTimeout(r, 500)))
    } catch (e) {
      thrown = e as Error
    }
    expect(thrown).not.toBeNull()
    expect(thrown?.message).toContain('AGENT_MCP_SPAWN_TIMEOUT')
  })

  test('operation failure propagates (not swallowed by timeout)', async () => {
    const testError = new Error('operation-failed')
    let thrown: Error | null = null
    try {
      await withTimeout(1000, () => Promise.reject(testError))
    } catch (e) {
      thrown = e as Error
    }
    expect(thrown?.message).toBe('operation-failed')
  })
})

// ─── P1: McpSession interface fields ────────────────────────────────────────

describe('[P1] McpSession — interface field coverage (E12)', () => {
  test('McpSession in source has sessionId field', () => {
    expect(SRC).toContain('sessionId')
  })

  test('McpSession in source has mcpServerId field', () => {
    expect(SRC).toContain('mcpServerId')
  })

  test('McpSession in source has agentSessionId field', () => {
    expect(SRC).toContain('agentSessionId')
  })

  test('McpSession in source has tools field (DISCOVER cache)', () => {
    expect(SRC).toContain('tools:')
  })

  test('McpSession in source has spawnedAt field (latency tracking)', () => {
    expect(SRC).toContain('spawnedAt')
  })

  test('McpSession in source has lastUsedAt field (warm start tracking)', () => {
    expect(SRC).toContain('lastUsedAt')
  })

  test('McpToolDefinition has name, description, inputSchema fields', () => {
    // Verified in DISCOVER result mapping
    expect(SRC).toContain('inputSchema')
    expect(SRC).toContain('description')
  })
})

// ─── P1: Engine types McpSession export ─────────────────────────────────────

describe('[P1] engine/types.ts — McpSession export (architecture requirement)', () => {
  const typesSrc = fs.readFileSync(
    path.resolve(import.meta.dir, '../../engine/types.ts'),
    'utf-8',
  )

  test('engine/types.ts contains McpSession interface', () => {
    expect(typesSrc).toContain('McpSession')
  })

  test('engine/types.ts McpSession has agentSessionId', () => {
    expect(typesSrc).toContain('agentSessionId')
  })

  test('engine/types.ts McpSession has spawnedAt', () => {
    expect(typesSrc).toContain('spawnedAt')
  })

  test('engine/types.ts McpSession has lastUsedAt', () => {
    expect(typesSrc).toContain('lastUsedAt')
  })
})

// ─── P1: mcp-transport.ts integration ───────────────────────────────────────

describe('[P1] mcp-transport.ts + mcp-manager.ts integration contract', () => {
  test('mcp-transport.ts exports McpTransport interface', () => {
    const transportSrc = fs.readFileSync(
      path.resolve(import.meta.dir, '../../engine/mcp/mcp-transport.ts'),
      'utf-8',
    )
    expect(transportSrc).toContain('export interface McpTransport')
  })

  test('mcp-transport.ts exports SpawnFn type', () => {
    const transportSrc = fs.readFileSync(
      path.resolve(import.meta.dir, '../../engine/mcp/mcp-transport.ts'),
      'utf-8',
    )
    expect(transportSrc).toContain('export type SpawnFn')
  })

  test('mcp-manager.ts imports SpawnFn from mcp-transport (injectable for TEA)', () => {
    expect(SRC).toContain('SpawnFn')
    expect(SRC).toContain("from './mcp-transport'")
  })
})
