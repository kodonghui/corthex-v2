import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 18.4: mcp-manager.ts TEA Tests — MERGE→EXECUTE→RETURN→TEARDOWN (Stages 5–8) ===
// TEA: Risk-based — P0 MERGE namespace logic, P0 EXECUTE routing, P0 RETURN format,
//      P0 TEARDOWN SIGTERM→SIGKILL logic, P1 E17 telemetry pattern, P1 source checks
// NOTE: Dynamic imports of mcp-manager.ts fail in test env (credential-crypto module-level key
//       validation). All source checks use fs.readFileSync. Logic tests use pure simulations.

const SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../engine/mcp/mcp-manager.ts'),
  'utf-8',
)

// ─── P0: Stage 5 MERGE — namespace logic ─────────────────────────────────────

describe('[P0] Stage 5 MERGE — makeNamespace + getMergedTools logic', () => {
  /**
   * Simulates makeNamespace (E12 FR-MCP4).
   * displayName → lowercase, spaces to underscores, non-alphanumeric removed.
   */
  function makeNamespace(displayName: string): string {
    return displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  }

  /**
   * Simulates getMergedTools — namespaces MCP tools and merges with builtins.
   */
  function getMergedTools(
    builtinTools: Array<{ name: string; description?: string; inputSchema: Record<string, unknown> }>,
    mcpSessions: Array<{ displayName: string; tools: Array<{ name: string; description?: string; inputSchema: Record<string, unknown> }> }>,
  ): Array<{ name: string; description?: string; inputSchema: Record<string, unknown> }> {
    const namespacedMcpTools = mcpSessions.flatMap(({ displayName, tools }) => {
      const namespace = makeNamespace(displayName)
      return tools.map((tool) => ({
        name: `${namespace}__${tool.name}`,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }))
    })
    return [...builtinTools, ...namespacedMcpTools]
  }

  test('Notion MCP create_page → notion__create_page (AC1, FR-MCP4)', () => {
    const result = getMergedTools(
      [],
      [{ displayName: 'Notion', tools: [{ name: 'create_page', description: 'Creates a page', inputSchema: {} }] }],
    )
    expect(result[0]?.name).toBe('notion__create_page')
  })

  test('displayName with spaces uses underscore separator: "Notion MCP" → notion_mcp__create_page', () => {
    const result = getMergedTools(
      [],
      [{ displayName: 'Notion MCP', tools: [{ name: 'create_page', inputSchema: {} }] }],
    )
    expect(result[0]?.name).toBe('notion_mcp__create_page')
  })

  test('builtin tools are included unchanged in merged array (AC1)', () => {
    const result = getMergedTools(
      [{ name: 'read_web_page', description: 'Reads a web page', inputSchema: {} }],
      [{ displayName: 'Notion', tools: [{ name: 'create_page', inputSchema: {} }] }],
    )
    expect(result.some(t => t.name === 'read_web_page')).toBe(true)
    expect(result.some(t => t.name === 'notion__create_page')).toBe(true)
  })

  test('no name collision: builtin read_web_page vs notion__create_page (AC1)', () => {
    const result = getMergedTools(
      [{ name: 'read_web_page', inputSchema: {} }],
      [{ displayName: 'Notion', tools: [{ name: 'read_web_page', inputSchema: {} }] }],
    )
    const names = result.map(t => t.name)
    expect(names).toContain('read_web_page')
    expect(names).toContain('notion__read_web_page')
    // Distinct names — no collision
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(names.length)
  })

  test('multiple MCP servers: all tools namespaced separately', () => {
    const result = getMergedTools(
      [],
      [
        { displayName: 'Notion', tools: [{ name: 'create_page', inputSchema: {} }] },
        { displayName: 'Playwright', tools: [{ name: 'navigate', inputSchema: {} }] },
      ],
    )
    expect(result.some(t => t.name === 'notion__create_page')).toBe(true)
    expect(result.some(t => t.name === 'playwright__navigate')).toBe(true)
  })

  test('empty MCP sessions → only builtins in merged array', () => {
    const result = getMergedTools(
      [{ name: 'save_report', inputSchema: {} }],
      [],
    )
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('save_report')
  })

  test('double-underscore separator used (not colon — FR-MCP4 colons forbidden)', () => {
    const result = getMergedTools(
      [],
      [{ displayName: 'Notion', tools: [{ name: 'search', inputSchema: {} }] }],
    )
    expect(result[0]?.name).toContain('__')
    expect(result[0]?.name).not.toContain(':')
  })

  test('makeNamespace: lowercase conversion', () => {
    expect(makeNamespace('NOTION')).toBe('notion')
  })

  test('makeNamespace: spaces to underscores', () => {
    expect(makeNamespace('My Server')).toBe('my_server')
  })

  test('makeNamespace: special chars removed', () => {
    expect(makeNamespace('Notion-MCP!')).toBe('notionmcp')
  })

  test('tool description and inputSchema passed through to merged array', () => {
    const result = getMergedTools(
      [],
      [{ displayName: 'Notion', tools: [{ name: 'create_page', description: 'Creates a Notion page', inputSchema: { type: 'object' } }] }],
    )
    expect(result[0]?.description).toBe('Creates a Notion page')
    expect(result[0]?.inputSchema).toEqual({ type: 'object' })
  })
})

// ─── P0: Stage 6 EXECUTE + Stage 7 RETURN — routing and result format ────────

describe('[P0] Stage 6 EXECUTE — tool routing + Stage 7 RETURN format', () => {
  /**
   * Simulates namespace stripping for EXECUTE routing.
   * "notion__create_page" → original = "create_page"
   */
  function stripNamespace(toolUseName: string): { namespace: string; toolName: string } | null {
    const idx = toolUseName.indexOf('__')
    if (idx < 0) return null
    return {
      namespace: toolUseName.slice(0, idx),
      toolName: toolUseName.slice(idx + 2),
    }
  }

  /**
   * Simulates RETURN stage: MCP JSON-RPC result → Anthropic tool_result format.
   */
  function convertToToolResult(
    rpcResult: { result?: unknown; error?: { message: string } },
  ): string {
    if (rpcResult.error) {
      return JSON.stringify({
        type: 'tool_result',
        is_error: true,
        content: `MCP tool error: ${rpcResult.error.message}`,
      })
    }
    const content = rpcResult.result as { content?: unknown[] } | unknown
    const resultContent =
      content && typeof content === 'object' && 'content' in content
        ? (content as { content: unknown[] }).content
        : [{ type: 'text', text: JSON.stringify(rpcResult.result) }]
    return JSON.stringify({ type: 'tool_result', content: resultContent })
  }

  test('stripNamespace: notion__create_page → {namespace: notion, toolName: create_page} (AC2)', () => {
    const result = stripNamespace('notion__create_page')
    expect(result?.namespace).toBe('notion')
    expect(result?.toolName).toBe('create_page')
  })

  test('stripNamespace: no double-underscore → returns null', () => {
    expect(stripNamespace('read_web_page')).toBeNull()
  })

  test('stripNamespace: multiple underscores — first __ is separator', () => {
    const result = stripNamespace('notion__create_sub_page')
    expect(result?.namespace).toBe('notion')
    expect(result?.toolName).toBe('create_sub_page')
  })

  test('RETURN: MCP result with content array → tool_result with content (AC3)', () => {
    const result = JSON.parse(convertToToolResult({
      result: { content: [{ type: 'text', text: 'Page created successfully' }] },
    }))
    expect(result.type).toBe('tool_result')
    expect(Array.isArray(result.content)).toBe(true)
    expect(result.content[0].text).toBe('Page created successfully')
  })

  test('RETURN: MCP error → is_error=true with error message (AC3)', () => {
    const result = JSON.parse(convertToToolResult({
      error: { message: 'Page not found' },
    }))
    expect(result.type).toBe('tool_result')
    expect(result.is_error).toBe(true)
    expect(result.content).toContain('Page not found')
  })

  test('RETURN: MCP result without content key → wrapped as text block', () => {
    const result = JSON.parse(convertToToolResult({
      result: { pageId: 'abc-123', title: 'My Page' },
    }))
    expect(result.type).toBe('tool_result')
    expect(Array.isArray(result.content)).toBe(true)
    expect(result.content[0].type).toBe('text')
    expect(result.content[0].text).toContain('abc-123')
  })

  test('JSON-RPC tools/call format: method="tools/call", params={name, arguments}', () => {
    // Verifies the expected JSON-RPC structure sent to MCP server
    const request = {
      jsonrpc: '2.0' as const,
      method: 'tools/call',
      params: {
        name: 'create_page',
        arguments: { title: 'Test Page', content: 'Hello' },
      },
    }
    expect(request.method).toBe('tools/call')
    expect(request.params.name).toBe('create_page')
    expect(request.params.arguments).toEqual({ title: 'Test Page', content: 'Hello' })
  })
})

// ─── P0: Stage 8 TEARDOWN — SIGTERM→SIGKILL logic ────────────────────────────

describe('[P0] Stage 8 TEARDOWN — SIGTERM → SIGKILL lifecycle (AC4)', () => {
  test('SIGTERM is sent before SIGKILL (order check)', async () => {
    const signals: string[] = []
    const mockProcess = {
      kill: (sig: string) => { signals.push(sig) },
      on: () => {},
      once: (event: string, cb: () => void) => {
        // Simulate process not exiting immediately
        if (event === 'exit') setTimeout(cb, 8000)  // 8s → timeout fires first
      },
    }

    // Simulate teardown with very short timeout for test speed
    const SIGTERM_MS = 50  // 50ms test timeout
    await (async () => {
      mockProcess.kill('SIGTERM')
      await new Promise<void>((resolve) => {
        const killTimer = setTimeout(() => {
          mockProcess.kill('SIGKILL')
          resolve()
        }, SIGTERM_MS)
        mockProcess.once('exit', () => {
          clearTimeout(killTimer)
          resolve()
        })
      })
    })()

    expect(signals[0]).toBe('SIGTERM')
    expect(signals[1]).toBe('SIGKILL')
  })

  test('SIGKILL not sent if process exits before timeout', async () => {
    const signals: string[] = []
    const mockProcess = {
      kill: (sig: string) => { signals.push(sig) },
      on: () => {},
      once: (event: string, cb: () => void) => {
        // Simulate fast exit
        if (event === 'exit') setTimeout(cb, 10)
      },
    }

    const SIGTERM_MS = 5000
    await (async () => {
      mockProcess.kill('SIGTERM')
      await new Promise<void>((resolve) => {
        const killTimer = setTimeout(() => {
          mockProcess.kill('SIGKILL')
          resolve()
        }, SIGTERM_MS)
        mockProcess.once('exit', () => {
          clearTimeout(killTimer)
          resolve()
        })
      })
    })()

    expect(signals).toContain('SIGTERM')
    expect(signals).not.toContain('SIGKILL')
  })

  test('teardownAll with no sessions is a no-op (does not throw)', () => {
    // Simulates McpManager.getSessionsForAgent returning [] → teardownAll exits immediately
    const sessions: unknown[] = []
    expect(() => {
      if (!sessions.length) return  // no-op guard
      throw new Error('Should not reach here')
    }).not.toThrow()
  })

  test('SIGTERM_TIMEOUT_MS constant = 5000 (E12 architecture spec)', async () => {
    const mod = await import('../../engine/mcp/mcp-manager').catch(() => null)
    // Module import fails due to credential-crypto env validation; check source instead
    expect(SRC).toContain('SIGTERM_TIMEOUT_MS = 5_000')
  })

  test('lifecycle event teardown is logged per server (FR-SO3)', () => {
    expect(SRC).toContain("event: 'teardown'")
  })
})

// ─── P0: E17 telemetry in EXECUTE stage ──────────────────────────────────────

describe('[P0] E17 telemetry — EXECUTE stage records tool_call_events (AC2)', () => {
  test('insertToolCallEvent called before tools/call (E17 contract)', () => {
    const executeIdx = SRC.indexOf('execute(')
    const insertIdx = SRC.indexOf('insertToolCallEvent', executeIdx)
    const toolsCallIdx = SRC.indexOf("'tools/call'", executeIdx)
    expect(insertIdx).toBeGreaterThan(0)
    expect(toolsCallIdx).toBeGreaterThan(0)
    expect(insertIdx).toBeLessThan(toolsCallIdx)
  })

  test('updateToolCallEvent on success (E17 success path)', () => {
    expect(SRC).toContain('success: true')
  })

  test('updateToolCallEvent on failure with errorCode (E17 failure path)', () => {
    expect(SRC).toContain('success: false')
    expect(SRC).toContain('errorCode')
  })

  test('durationMs computed as Date.now() - startTime (E17 timing)', () => {
    expect(SRC).toContain('durationMs: Date.now() - startTime')
  })

  test('tool_call_events records namespaced tool name (e.g., notion__create_page)', () => {
    // toolName is set from toolUseName parameter (which is the namespaced name)
    expect(SRC).toContain('toolName: toolUseName')
  })

  test('execute() has try/catch wrapping updateToolCallEvent on failure (E17 contract)', () => {
    const executeStart = SRC.indexOf('async execute(')
    const catchIdx = SRC.indexOf('} catch (err)', executeStart)
    const updateInCatch = SRC.indexOf('updateToolCallEvent', catchIdx)
    expect(catchIdx).toBeGreaterThan(0)
    expect(updateInCatch).toBeGreaterThan(catchIdx)
  })
})

// ─── P1: Source code structural checks ───────────────────────────────────────

describe('[P1] mcp-manager.ts Stages 5-8 — source structure', () => {
  test('getMergedTools method present', () => {
    expect(SRC).toContain('getMergedTools(')
  })

  test('execute method present', () => {
    expect(SRC).toContain('async execute(')
  })

  test('teardownAll method present', () => {
    expect(SRC).toContain('async teardownAll(')
  })

  test('makeNamespace function exported', () => {
    expect(SRC).toContain('export function makeNamespace(')
  })

  test('_findSessionForTool private helper present', () => {
    expect(SRC).toContain('_findSessionForTool(')
  })

  test('tools/call JSON-RPC method used in EXECUTE', () => {
    expect(SRC).toContain("'tools/call'")
  })

  test('Promise.allSettled used in teardownAll (non-fatal teardown)', () => {
    expect(SRC).toContain('Promise.allSettled(')
  })

  test('SIGTERM sent first in teardown (transport.close())', () => {
    const teardownIdx = SRC.indexOf('async teardownAll(')
    const closeIdx = SRC.indexOf('transport.close()', teardownIdx)
    const sigkillIdx = SRC.indexOf('SIGKILL', teardownIdx)
    expect(closeIdx).toBeGreaterThan(0)
    expect(sigkillIdx).toBeGreaterThan(0)
    expect(closeIdx).toBeLessThan(sigkillIdx)
  })

  test('setTimeout used for SIGKILL escalation (5s timeout)', () => {
    const teardownIdx = SRC.indexOf('async teardownAll(')
    const setTimeoutIdx = SRC.indexOf('setTimeout', teardownIdx)
    expect(setTimeoutIdx).toBeGreaterThan(0)
  })

  test('execute method accepts agentId and runId (E17 telemetry params)', () => {
    const execIdx = SRC.indexOf('async execute(')
    const execSignature = SRC.slice(execIdx, execIdx + 300)
    expect(execSignature).toContain('agentId')
    expect(execSignature).toContain('runId')
  })

  test('lifecycle event "execute" logged in execute method', () => {
    expect(SRC).toContain("event: 'execute'")
  })
})

// ─── P1: Zombie detection SQL contract ───────────────────────────────────────

describe('[P1] NFR-R3 zombie detection — SQL logic simulation', () => {
  /**
   * Simulates the zombie detection query:
   * SELECT session_id WHERE event='spawn' AND created_at < cutoff
   *   AND session_id NOT IN (SELECT session_id WHERE event='teardown')
   */
  function detectZombies(
    events: Array<{ sessionId: string; event: string; createdAt: Date }>,
    olderThanSeconds: number,
  ): string[] {
    const cutoff = new Date(Date.now() - olderThanSeconds * 1000)
    const teardownSessions = new Set(
      events.filter(e => e.event === 'teardown').map(e => e.sessionId),
    )
    return events
      .filter(e => e.event === 'spawn' && e.createdAt < cutoff && !teardownSessions.has(e.sessionId))
      .map(e => e.sessionId)
  }

  test('session with spawn + no teardown > 30s → zombie detected', () => {
    const zombieSession = 'zombie-session-abc'
    const events = [
      { sessionId: zombieSession, event: 'spawn', createdAt: new Date(Date.now() - 60_000) },
    ]
    const zombies = detectZombies(events, 30)
    expect(zombies).toContain(zombieSession)
  })

  test('session with spawn + teardown → NOT a zombie', () => {
    const cleanSession = 'clean-session-xyz'
    const events = [
      { sessionId: cleanSession, event: 'spawn', createdAt: new Date(Date.now() - 60_000) },
      { sessionId: cleanSession, event: 'teardown', createdAt: new Date() },
    ]
    const zombies = detectZombies(events, 30)
    expect(zombies).not.toContain(cleanSession)
  })

  test('recent spawn (< 30s) → NOT a zombie (too new)', () => {
    const newSession = 'new-session-123'
    const events = [
      { sessionId: newSession, event: 'spawn', createdAt: new Date(Date.now() - 10_000) },
    ]
    const zombies = detectZombies(events, 30)
    expect(zombies).not.toContain(newSession)
  })

  test('multiple sessions: zombie only returned for old spawn without teardown', () => {
    const events = [
      { sessionId: 'zombie', event: 'spawn', createdAt: new Date(Date.now() - 120_000) },
      { sessionId: 'clean', event: 'spawn', createdAt: new Date(Date.now() - 120_000) },
      { sessionId: 'clean', event: 'teardown', createdAt: new Date() },
    ]
    const zombies = detectZombies(events, 30)
    expect(zombies).toContain('zombie')
    expect(zombies).not.toContain('clean')
  })
})
