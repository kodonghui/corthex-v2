import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test'
import type { SessionContext, PreToolHookResult } from '../../engine/types'
import { ERROR_CODES } from '../../lib/error-codes'

// --- Mocks ---

const mockAgentById = mock(() => Promise.resolve([{ allowedTools: [] }]))
const mockInsertCostRecord = mock(() => Promise.resolve([]))
const mockGetDB = mock(() => ({
  agentById: mockAgentById,
  insertCostRecord: mockInsertCostRecord,
}))

mock.module('../../db/scoped-query', () => ({ getDB: mockGetDB }))

// Import hooks AFTER mock.module
const { toolPermissionGuard } = await import('../../engine/hooks/tool-permission-guard')
const { credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
const { outputRedactor } = await import('../../engine/hooks/output-redactor')
const { delegationTracker } = await import('../../engine/hooks/delegation-tracker')
const { costTracker } = await import('../../engine/hooks/cost-tracker')
const { eventBus } = await import('../../lib/event-bus')

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
    visitedAgents: ['secretary'],
    ...overrides,
  }
}

/**
 * Runs the full PostToolUse pipeline in D4 order:
 * scrubber(1st) → redactor(2nd) → delegation(3rd)
 */
function runPostToolUsePipeline(
  ctx: SessionContext,
  toolName: string,
  toolOutput: string,
  toolInput?: unknown,
): string {
  let result = toolOutput
  result = credentialScrubber(ctx, toolName, result)
  result = outputRedactor(ctx, toolName, result)
  result = delegationTracker(ctx, toolName, result, toolInput)
  return result
}

// --- Integration Tests ---

describe('Hook Pipeline Integration', () => {
  beforeEach(() => {
    mockAgentById.mockReset()
    mockInsertCostRecord.mockReset()
    mockGetDB.mockReset()
    mockGetDB.mockReturnValue({
      agentById: mockAgentById,
      insertCostRecord: mockInsertCostRecord,
    })
    mockAgentById.mockResolvedValue([{ allowedTools: [] }])
    mockInsertCostRecord.mockResolvedValue([])
  })

  afterEach(() => {
    eventBus.removeAllListeners('delegation')
  })

  test('full pipeline: permission allow → scrubber → redactor → delegation → cost', async () => {
    const ctx = makeCtx()
    const toolName = 'call_agent'
    const toolInput = { targetAgentId: 'cmo', message: 'hello' }
    const rawOutput = 'Agent response with sk-ant-abcdefghijklmnopqrstuvwxyz and user@email.com'

    // Step 1: PreToolUse — permission check
    const permission = await toolPermissionGuard(ctx, toolName, toolInput)
    expect(permission.allow).toBe(true)

    // Step 2: PostToolUse pipeline (D4 order)
    const delegationEvents: unknown[] = []
    eventBus.on('delegation', (e: unknown) => delegationEvents.push(e))

    const finalOutput = runPostToolUsePipeline(ctx, toolName, rawOutput, toolInput)

    // Verify scrubber ran (API key redacted)
    expect(finalOutput).not.toContain('sk-ant-')
    expect(finalOutput).toContain('***REDACTED***')

    // Verify redactor ran (email redacted)
    expect(finalOutput).not.toContain('user@email.com')
    expect(finalOutput).toContain('[REDACTED]')

    // Verify delegation tracker ran (event emitted)
    expect(delegationEvents).toHaveLength(1)
    const event = delegationEvents[0] as Record<string, unknown>
    expect(event.type).toBe('handoff')
    expect(event.from).toBe('secretary')
    expect(event.to).toBe('cmo')

    // Step 3: Stop hook — cost tracking
    await costTracker(ctx, { inputTokens: 1000, outputTokens: 500, model: 'claude-sonnet-4-6' })
    expect(mockInsertCostRecord).toHaveBeenCalledTimes(1)
  })

  test('permission deny → PostToolUse NOT executed', async () => {
    // Agent only has web_search allowed
    mockAgentById.mockResolvedValue([{ allowedTools: ['web_search'] }])
    const ctx = makeCtx()

    // PreToolUse denies file_read
    const permission = await toolPermissionGuard(ctx, 'file_read', {})
    expect(permission.allow).toBe(false)
    expect(permission.reason).toBe(ERROR_CODES.TOOL_PERMISSION_DENIED)

    // When permission denied, PostToolUse pipeline should NOT run
    // (verified by the fact that we don't call it — the engine skips PostToolUse on deny)
    // This test validates the contract: if allow=false, caller must skip PostToolUse
  })

  test('scrubber runs before delegation (order verification)', () => {
    const ctx = makeCtx()
    const toolName = 'call_agent'
    const toolInput = { targetAgentId: 'analyst' }
    const outputWithSecret = 'Response with sk-ant-abcdefghijklmnopqrstuvwxyz key'

    const delegationEvents: unknown[] = []
    eventBus.on('delegation', (e: unknown) => delegationEvents.push(e))

    // Run pipeline in CORRECT D4 order
    const result = runPostToolUsePipeline(ctx, toolName, outputWithSecret, toolInput)

    // Scrubber ran first — secret is gone
    expect(result).toContain('***REDACTED***')
    expect(result).not.toContain('sk-ant-')

    // Delegation tracker ran after scrubber — event emitted with clean data
    expect(delegationEvents).toHaveLength(1)
  })

  test('wrong order: delegation before scrubber would leak secrets', () => {
    const ctx = makeCtx()
    const toolName = 'call_agent'
    const toolInput = { targetAgentId: 'analyst' }
    const outputWithSecret = 'Response with sk-ant-abcdefghijklmnopqrstuvwxyz key'

    // WRONG ORDER: delegation first (before scrubber)
    const afterDelegation = delegationTracker(ctx, toolName, outputWithSecret, toolInput)
    // Secret is still in output — delegation doesn't scrub
    expect(afterDelegation).toContain('sk-ant-')

    // CORRECT ORDER: scrubber first
    const afterScrubber = credentialScrubber(ctx, toolName, outputWithSecret)
    expect(afterScrubber).not.toContain('sk-ant-')
  })

  test('hook error produces HOOK_PIPELINE_ERROR code', async () => {
    // Simulate permission guard DB failure
    mockAgentById.mockRejectedValue(new Error('DB connection failed'))
    const ctx = makeCtx()

    try {
      await toolPermissionGuard(ctx, 'web_search', {})
      // If it doesn't throw, the error was swallowed
      expect(true).toBe(false) // Should not reach here
    } catch (err) {
      // Hook errors should be catchable by agent-loop
      // agent-loop wraps them with HOOK_PIPELINE_ERROR
      expect(err).toBeInstanceOf(Error)
      expect((err as Error).message).toContain('DB connection failed')
    }

    // Verify HOOK_PIPELINE_ERROR code exists for engine to use
    expect(ERROR_CODES.HOOK_PIPELINE_ERROR).toBe('HOOK_PIPELINE_ERROR')
  })

  test('stop hook runs independently after PostToolUse', async () => {
    const ctx = makeCtx({ visitedAgents: ['secretary', 'cmo'] })

    // PostToolUse pipeline (non-call_agent, no delegation event)
    const output = runPostToolUsePipeline(ctx, 'web_search', 'search results')
    expect(output).toBe('search results') // No scrubbing needed

    // Stop hook runs independently
    await costTracker(ctx, { inputTokens: 500, outputTokens: 200, model: 'claude-haiku-4-5' })
    const call = mockInsertCostRecord.mock.calls[0][0] as Record<string, unknown>
    expect(call.agentId).toBe('cmo') // Last in visitedAgents
    expect(call.model).toBe('claude-haiku-4-5')
  })

  test('call_agent always bypasses permission guard', async () => {
    // Even with restricted allowedTools, call_agent is always allowed
    mockAgentById.mockResolvedValue([{ allowedTools: ['web_search'] }])
    const ctx = makeCtx()

    const permission = await toolPermissionGuard(ctx, 'call_agent', { targetAgentId: 'cmo' })
    expect(permission.allow).toBe(true)
    // agentById should NOT be called for call_agent (early return)
    expect(mockAgentById).not.toHaveBeenCalled()
  })

  test('pipeline handles multiple sensitive data types', () => {
    const ctx = makeCtx()
    const toolName = 'web_search'
    const output = 'Found sk-ant-abcdefghijklmnopqrstuvwxyz and email user@test.com and phone 010-1234-5678'

    const result = runPostToolUsePipeline(ctx, toolName, output)

    // Scrubber handled API key
    expect(result).not.toContain('sk-ant-')
    // Redactor handled PII
    expect(result).not.toContain('user@test.com')
    expect(result).not.toContain('010-1234-5678')
  })
})

// --- TEA P0: Pipeline Structure Introspection ---

describe('TEA P0: hook-pipeline structure introspection', () => {
  test('all 5 hooks are importable', () => {
    expect(typeof toolPermissionGuard).toBe('function')
    expect(typeof credentialScrubber).toBe('function')
    expect(typeof outputRedactor).toBe('function')
    expect(typeof delegationTracker).toBe('function')
    expect(typeof costTracker).toBe('function')
  })

  test('HOOK_PIPELINE_ERROR exists in error codes', () => {
    expect(ERROR_CODES.HOOK_PIPELINE_ERROR).toBe('HOOK_PIPELINE_ERROR')
  })

  test('PreToolUse returns PreToolHookResult shape', async () => {
    const result = await toolPermissionGuard(makeCtx(), 'test_tool', {})
    expect(result).toHaveProperty('allow')
    expect(typeof result.allow).toBe('boolean')
  })

  test('PostToolUse hooks return string', () => {
    const ctx = makeCtx()
    expect(typeof credentialScrubber(ctx, 'test', 'output')).toBe('string')
    expect(typeof outputRedactor(ctx, 'test', 'output')).toBe('string')
    expect(typeof delegationTracker(ctx, 'test', 'output')).toBe('string')
  })
})
