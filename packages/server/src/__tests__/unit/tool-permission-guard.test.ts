import { describe, test, expect, mock, beforeEach } from 'bun:test'
import type { SessionContext } from '../../engine/types'

// --- Mocks ---

const mockAgentById = mock(() => Promise.resolve([]))
const mockGetDB = mock(() => ({ agentById: mockAgentById }))

mock.module('../../db/scoped-query', () => ({ getDB: mockGetDB }))

// Import AFTER mocking
const { toolPermissionGuard } = await import('../../engine/hooks/tool-permission-guard')

// --- Helpers ---

function makeCtx(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    cliToken: 'test-token',
    userId: 'user-1',
    companyId: 'company-1',
    depth: 0,
    sessionId: 'session-1',
    startedAt: Date.now(),
    maxDepth: 3,
    visitedAgents: ['agent-1'],
    ...overrides,
  }
}

// --- Tests ---

describe('toolPermissionGuard', () => {
  beforeEach(() => {
    mockAgentById.mockReset()
    mockGetDB.mockReset()
    mockGetDB.mockReturnValue({ agentById: mockAgentById })
  })

  test('call_agent is always allowed without DB lookup', async () => {
    const result = await toolPermissionGuard(makeCtx(), 'call_agent', {})
    expect(result).toEqual({ allow: true })
    expect(mockGetDB).not.toHaveBeenCalled()
  })

  test('empty allowedTools allows all tools', async () => {
    mockAgentById.mockResolvedValue([{ allowedTools: [] }])
    const result = await toolPermissionGuard(makeCtx(), 'sns_manager', {})
    expect(result).toEqual({ allow: true })
  })

  test('null/undefined allowedTools allows all tools', async () => {
    mockAgentById.mockResolvedValue([{ allowedTools: null }])
    const result = await toolPermissionGuard(makeCtx(), 'kr_stock', {})
    expect(result).toEqual({ allow: true })
  })

  test('tool in allowedTools is allowed', async () => {
    mockAgentById.mockResolvedValue([{ allowedTools: ['sns_manager', 'web_search'] }])
    const result = await toolPermissionGuard(makeCtx(), 'sns_manager', {})
    expect(result).toEqual({ allow: true })
  })

  test('tool NOT in allowedTools is denied with TOOL_PERMISSION_DENIED', async () => {
    mockAgentById.mockResolvedValue([{ allowedTools: ['sns_manager', 'web_search'] }])
    const result = await toolPermissionGuard(makeCtx(), 'kr_stock', {})
    expect(result).toEqual({ allow: false, reason: 'TOOL_PERMISSION_DENIED' })
  })

  test('uses last visitedAgent as currentAgentId for DB lookup', async () => {
    mockAgentById.mockResolvedValue([{ allowedTools: [] }])
    const ctx = makeCtx({ visitedAgents: ['secretary', 'cmo', 'content-specialist'] })
    await toolPermissionGuard(ctx, 'web_search', {})
    expect(mockGetDB).toHaveBeenCalledWith('company-1')
    expect(mockAgentById).toHaveBeenCalledWith('content-specialist')
  })

  test('agent not found in DB allows all tools (defensive)', async () => {
    mockAgentById.mockResolvedValue([])
    const result = await toolPermissionGuard(makeCtx(), 'any_tool', {})
    expect(result).toEqual({ allow: true })
  })
})

// --- TEA P0: Source Code Introspection ---

describe('TEA P0: tool-permission-guard source introspection', () => {
  const fs = require('fs')
  const src = fs.readFileSync(
    require('path').resolve(__dirname, '../../engine/hooks/tool-permission-guard.ts'),
    'utf-8',
  )

  test('uses ERROR_CODES constant, no hardcoded error strings', () => {
    expect(src).toContain('ERROR_CODES.TOOL_PERMISSION_DENIED')
    expect(src).not.toMatch(/reason:\s*['"]TOOL_PERMISSION_DENIED['"]/)
  })

  test('imports getDB from scoped-query, not direct db', () => {
    expect(src).toContain("from '../../db/scoped-query'")
    expect(src).not.toContain("from '../../db/index'")
    expect(src).not.toMatch(/import\s.*\bdb\b.*from/)
  })

  test('returns Promise<PreToolHookResult> (async function)', () => {
    expect(src).toContain('async function toolPermissionGuard')
    expect(src).toContain('Promise<PreToolHookResult>')
  })

  test('cliToken is never accessed (no token leakage)', () => {
    expect(src).not.toContain('ctx.cliToken')
  })
})
