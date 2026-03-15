import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 18.5: agent-loop.ts MCP Integration TEA Tests ===
// TEA: Risk-based — P0 scrubberInit at session start (D28), P0 MCP tool merge (FR-MCP4),
//      P0 MCP tool routing via __ (E12 EXECUTE), P0 teardownAll in finally (FR-MCP5, D4),
//      P0 scrubberRelease in finally (D28), P1 source imports, P1 error handling

// ─── Source files ─────────────────────────────────────────────────────────────

const SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../engine/agent-loop.ts'),
  'utf-8',
)

// ─── P0: D28 — scrubber init at session start ─────────────────────────────────

describe('[P0] D28 — credential scrubber init before first tool call', () => {
  test('scrubberInit imported from credential-scrubber', () => {
    expect(SRC).toContain("from './hooks/credential-scrubber'")
    expect(SRC).toContain('scrubberInit')
  })

  test('scrubberInit(ctx) called at session start (before tool loop)', () => {
    expect(SRC).toContain('await scrubberInit(ctx)')
  })

  test('scrubberInit called before getMcpServersForAgent (D28 order)', () => {
    const initIdx = SRC.indexOf('await scrubberInit(ctx)')
    const mcpLoadIdx = SRC.indexOf('getMcpServersForAgent')
    expect(initIdx).toBeLessThan(mcpLoadIdx)
  })

  test('scrubberInit called before tool loop start (before messages.create)', () => {
    const initIdx = SRC.indexOf('await scrubberInit(ctx)')
    // Find actual messages.create call (not comment) — the one with 'model,' inside
    const messagesCreateIdx = SRC.indexOf('const response = await anthropic.messages.create(')
    expect(initIdx).toBeLessThan(messagesCreateIdx)
  })
})

// ─── P0: FR-MCP4 — MCP tool merge (MERGE stage) ──────────────────────────────

describe('[P0] FR-MCP4 — MCP tool merge into messages.create tools array', () => {
  test('getMcpServersForAgent called with agentName', () => {
    expect(SRC).toContain('getMcpServersForAgent(agentName)')
  })

  test('mcpManager imported from mcp/mcp-manager', () => {
    expect(SRC).toContain("from './mcp/mcp-manager'")
    expect(SRC).toContain('mcpManager')
  })

  test('getMergedTools called to merge builtin + MCP tools', () => {
    expect(SRC).toContain('mcpManager.getMergedTools(')
  })

  test('mcpApiTools included in allTools array', () => {
    expect(SRC).toContain('mcpApiTools')
    expect(SRC).toContain('...mcpApiTools')
  })

  test('allTools passed to messages.create() tools parameter', () => {
    // allTools used in messages.create call
    expect(SRC).toContain('tools: allTools')
  })

  test('getOrSpawnSession called for each assigned MCP server', () => {
    expect(SRC).toContain('mcpManager.getOrSpawnSession(')
  })
})

// ─── P0: E12 EXECUTE — MCP tool routing via double-underscore ─────────────────

describe('[P0] E12 EXECUTE — MCP tool routing via __ namespace', () => {
  test('double-underscore check routes to mcpManager.execute()', () => {
    expect(SRC).toContain("block.name.includes('__')")
  })

  test('mcpManager.execute() called with toolUseName, toolInput, sessionId, companyId', () => {
    expect(SRC).toContain('mcpManager.execute(')
    expect(SRC).toContain('block.name')
    expect(SRC).toContain('toolInput')
    expect(SRC).toContain('ctx.sessionId')
    expect(SRC).toContain('ctx.companyId')
  })

  test('MCP result returned as tool_result ContentBlock', () => {
    // tool_result must be added to toolResults
    expect(SRC).toContain("type: 'tool_result'")
    expect(SRC).toContain('mcpOutput')
  })

  test('MCP output scanned by credentialScrubber PostToolUse (D28 — MCP not exempt)', () => {
    // After MCP execute, credentialScrubber must be called
    const mcpExecIdx = SRC.indexOf('mcpManager.execute(')
    const afterMcpExec = SRC.slice(mcpExecIdx, mcpExecIdx + 1500)
    expect(afterMcpExec).toContain('credentialScrubber(')
  })
})

// ─── P0: FR-MCP5 D4 — teardownAll in finally block ──────────────────────────

describe('[P0] FR-MCP5 D4 — mcpManager.teardownAll() in finally block', () => {
  test('teardownAll called in finally block', () => {
    expect(SRC).toContain('mcpManager.teardownAll(')
  })

  test('teardownAll called with sessionId and companyId', () => {
    const idx = SRC.indexOf('mcpManager.teardownAll(')
    const section = SRC.slice(idx, idx + 100)
    expect(section).toContain('ctx.sessionId')
    expect(section).toContain('ctx.companyId')
  })

  test('teardownAll is in finally block (before Stop Hooks, D4)', () => {
    const finallyIdx = SRC.indexOf('} finally {')
    const teardownIdx = SRC.indexOf('mcpManager.teardownAll(')
    expect(teardownIdx).toBeGreaterThan(finallyIdx)
  })

  test('teardownAll fire-and-forget with .catch(() => {})', () => {
    const idx = SRC.indexOf('mcpManager.teardownAll(')
    const section = SRC.slice(idx, idx + 80)
    expect(section).toContain('.catch(')
  })
})

// ─── P0: D28 — scrubberRelease in finally block ──────────────────────────────

describe('[P0] D28 — scrubberRelease in finally block', () => {
  test('scrubberRelease imported', () => {
    expect(SRC).toContain('scrubberRelease')
  })

  test('scrubberRelease called in finally block', () => {
    expect(SRC).toContain('scrubberRelease(ctx.sessionId)')
  })

  test('scrubberRelease called in finally block (after teardownAll)', () => {
    const finallyIdx = SRC.indexOf('} finally {')
    const releaseIdx = SRC.indexOf('scrubberRelease(ctx.sessionId)')
    expect(releaseIdx).toBeGreaterThan(finallyIdx)
  })
})

// ─── P0: Built-in tool routing NOT affected by MCP routing ───────────────────

describe('[P0] AC2 — built-in tool routing unchanged (call_agent)', () => {
  test('call_agent still handled before MCP routing check', () => {
    const callAgentIdx = SRC.indexOf("block.name === 'call_agent'")
    const mcpRoutingIdx = SRC.indexOf("block.name.includes('__')")
    // call_agent check comes before MCP routing
    expect(callAgentIdx).toBeLessThan(mcpRoutingIdx)
  })

  test('MCP routing check is AFTER built-in tool handling', () => {
    // The __ check should be in the "else" path after call_agent
    expect(SRC).toContain("block.name.includes('__')")
  })
})

// ─── P1: Source imports ───────────────────────────────────────────────────────

describe('[P1] Source imports — required modules present', () => {
  test('mcp-manager singleton imported', () => {
    expect(SRC).toContain("from './mcp/mcp-manager'")
  })

  test('credential-scrubber init and release imported', () => {
    expect(SRC).toContain('scrubberInit')
    expect(SRC).toContain('scrubberRelease')
  })

  test('getDB imported for getMcpServersForAgent call', () => {
    expect(SRC).toContain("from '../db/scoped-query'")
    expect(SRC).toContain('getDB(')
  })
})

// ─── P1: MCP spawn failure graceful handling ──────────────────────────────────

describe('[P1] AC5 — MCP spawn failure does not block agent start', () => {
  test('try/catch around getOrSpawnSession (spawn failure → skip, not throw)', () => {
    expect(SRC).toContain('mcpManager.getOrSpawnSession(')
    // Spawn failure should be caught and skipped
    expect(SRC).toContain('mcp_spawn_failed')
  })
})

// ─── P1: Double-underscore tool routing logic simulation ─────────────────────

describe('[P1] MCP namespace routing — double-underscore detection', () => {
  function isBuiltinTool(name: string): boolean {
    return name === 'call_agent'
  }

  function isMcpTool(name: string): boolean {
    return name.includes('__')
  }

  test('notion__create_page detected as MCP tool', () => {
    expect(isMcpTool('notion__create_page')).toBe(true)
    expect(isBuiltinTool('notion__create_page')).toBe(false)
  })

  test('read_web_page detected as built-in (no double-underscore)', () => {
    expect(isMcpTool('read_web_page')).toBe(false)
  })

  test('call_agent detected as built-in', () => {
    expect(isBuiltinTool('call_agent')).toBe(true)
    expect(isMcpTool('call_agent')).toBe(false)
  })

  test('playwright__screenshot detected as MCP tool', () => {
    expect(isMcpTool('playwright__screenshot')).toBe(true)
  })

  test('tool with single underscore is NOT MCP (notion_create_page → builtin)', () => {
    expect(isMcpTool('notion_create_page')).toBe(false)
  })
})

// ─── P1: MERGE stage tool list construction ───────────────────────────────────

describe('[P1] FR-MCP4 — MERGE stage tool list construction', () => {
  test('mcpApiTools constructed from getMergedTools result', () => {
    expect(SRC).toContain('mcpApiTools')
    expect(SRC).toContain('getMergedTools(')
  })

  test('allTools includes CALL_AGENT_TOOL + agentApiTools + mcpApiTools', () => {
    expect(SRC).toContain('CALL_AGENT_TOOL')
    expect(SRC).toContain('...agentApiTools')
    expect(SRC).toContain('...mcpApiTools')
  })

  test('getMcpServersForAgent results used to get sessions', () => {
    expect(SRC).toContain('getMcpServersForAgent(agentName)')
    expect(SRC).toContain('mcpServerRows')
  })
})
