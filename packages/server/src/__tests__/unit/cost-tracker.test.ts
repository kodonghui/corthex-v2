import { describe, test, expect, mock, beforeEach } from 'bun:test'
import type { SessionContext } from '../../engine/types'

// --- Mocks ---

const mockInsertCostRecord = mock(() => Promise.resolve([]))
const mockGetDB = mock(() => ({ insertCostRecord: mockInsertCostRecord }))

mock.module('../../db/scoped-query', () => ({ getDB: mockGetDB }))

const { costTracker } = await import('../../engine/hooks/cost-tracker')

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
    runId: 'test-run-1',
    ...overrides,
  }
}

// --- Tests ---

describe('costTracker', () => {
  beforeEach(() => {
    mockInsertCostRecord.mockReset()
    mockGetDB.mockReset()
    mockGetDB.mockReturnValue({ insertCostRecord: mockInsertCostRecord })
    mockInsertCostRecord.mockResolvedValue([])
  })

  test('calculates cost correctly for claude-sonnet-4-6', async () => {
    await costTracker(makeCtx(), {
      inputTokens: 1000,
      outputTokens: 500,
      model: 'claude-sonnet-4-6',
    })

    expect(mockInsertCostRecord).toHaveBeenCalledTimes(1)
    const call = mockInsertCostRecord.mock.calls[0][0] as Record<string, unknown>
    // input: 1000 * 3 / 1M * 1M = 3000 micro
    // output: 500 * 15 / 1M * 1M = 7500 micro
    // total: 10500 micro
    expect(call.costUsdMicro).toBe(10500)
  })

  test('calculates cost correctly for claude-haiku-4-5', async () => {
    await costTracker(makeCtx(), {
      inputTokens: 10000,
      outputTokens: 2000,
      model: 'claude-haiku-4-5',
    })

    const call = mockInsertCostRecord.mock.calls[0][0] as Record<string, unknown>
    // input: 10000 * 0.8 = 8000 micro
    // output: 2000 * 4 = 8000 micro
    // total: 16000 micro
    expect(call.costUsdMicro).toBe(16000)
  })

  test('passes correct fields to insertCostRecord', async () => {
    const ctx = makeCtx({ visitedAgents: ['secretary', 'cmo'] })
    await costTracker(ctx, {
      inputTokens: 500,
      outputTokens: 200,
      model: 'claude-sonnet-4-6',
    })

    const call = mockInsertCostRecord.mock.calls[0][0] as Record<string, unknown>
    expect(call.agentId).toBe('cmo')
    expect(call.sessionId).toBe('session-1')
    expect(call.model).toBe('claude-sonnet-4-6')
    expect(call.inputTokens).toBe(500)
    expect(call.outputTokens).toBe(200)
    expect(call.source).toBe('delegation')
    expect(mockGetDB).toHaveBeenCalledWith('company-1')
  })

  test('uses default price for unknown model', async () => {
    await costTracker(makeCtx(), {
      inputTokens: 1000,
      outputTokens: 1000,
      model: 'unknown-model-xyz',
    })

    const call = mockInsertCostRecord.mock.calls[0][0] as Record<string, unknown>
    // default: input=3, output=15
    // input: 1000 * 3 = 3000, output: 1000 * 15 = 15000, total: 18000
    expect(call.costUsdMicro).toBe(18000)
  })

  test('handles zero tokens', async () => {
    await costTracker(makeCtx(), {
      inputTokens: 0,
      outputTokens: 0,
      model: 'claude-sonnet-4-6',
    })

    const call = mockInsertCostRecord.mock.calls[0][0] as Record<string, unknown>
    expect(call.costUsdMicro).toBe(0)
  })
})

// --- TEA P0: Source Code Introspection ---

describe('TEA P0: cost-tracker source introspection', () => {
  const fs = require('fs')
  const src = fs.readFileSync(
    require('path').resolve(__dirname, '../../engine/hooks/cost-tracker.ts'),
    'utf-8',
  )

  test('imports getDB from scoped-query', () => {
    expect(src).toContain("from '../../db/scoped-query'")
  })

  test('is async function', () => {
    expect(src).toContain('async function costTracker')
  })

  test('uses costUsdMicro (integer, not float)', () => {
    expect(src).toContain('costUsdMicro')
    expect(src).toContain('Math.round')
  })

  test('does not access cliToken', () => {
    expect(src).not.toContain('ctx.cliToken')
  })
})
