import { describe, test, expect, mock, beforeEach } from 'bun:test'
import type { SessionContext, SSEEvent } from '../../engine/types'

// --- Mocks ---

const mockAgentById = mock(() => Promise.resolve([]))
const mockGetDB = mock(() => ({ agentById: mockAgentById }))
const mockRenderSoul = mock(() => Promise.resolve('rendered soul'))

// Mock: runAgent yields configurable events
let mockRunAgentEvents: SSEEvent[] = []
async function* mockRunAgent() {
  for (const event of mockRunAgentEvents) {
    yield event
  }
}

mock.module('../../db/scoped-query', () => ({ getDB: mockGetDB }))
mock.module('../../engine/soul-renderer', () => ({ renderSoul: mockRenderSoul }))
mock.module('../../engine/agent-loop', () => ({ runAgent: mockRunAgent }))

// Import AFTER mocking
const { callAgent } = await import('../../tool-handlers/builtins/call-agent')

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
    runId: 'test-run-1',
    ...overrides,
  }
}

async function collectEvents(gen: AsyncGenerator<SSEEvent>): Promise<SSEEvent[]> {
  const events: SSEEvent[] = []
  for await (const event of gen) {
    events.push(event)
  }
  return events
}

// --- Tests ---

describe('callAgent', () => {
  beforeEach(() => {
    mockAgentById.mockReset()
    mockGetDB.mockReset()
    mockRenderSoul.mockReset()
    mockRunAgentEvents = []

    // Default: getDB returns object with agentById
    mockGetDB.mockReturnValue({ agentById: mockAgentById })
  })

  test('successful handoff yields handoff event + forwards child events', async () => {
    // Target agent found
    mockAgentById.mockResolvedValue([{ id: 'agent-2', name: 'Researcher', soul: 'You are a researcher', role: 'specialist' }])
    mockRenderSoul.mockResolvedValue('rendered researcher soul')
    mockRunAgentEvents = [
      { type: 'accepted', sessionId: 'session-1' },
      { type: 'message', content: 'Research complete' },
      { type: 'done', costUsd: 0.05, tokensUsed: 500 },
    ]

    const ctx = makeCtx({ depth: 0, maxDepth: 3, visitedAgents: ['secretary'] })
    const events = await collectEvents(callAgent(ctx, { targetAgentId: 'agent-2', message: 'Research AI trends' }))

    // First event: handoff
    expect(events[0]).toEqual({
      type: 'handoff',
      from: 'secretary',
      to: 'Researcher',
      depth: 1,
    })

    // Remaining events: forwarded from child runAgent
    expect(events[1]).toEqual({ type: 'accepted', sessionId: 'session-1' })
    expect(events[2]).toEqual({ type: 'message', content: 'Research complete' })
    expect(events[3]).toEqual({ type: 'done', costUsd: 0.05, tokensUsed: 500 })
    expect(events).toHaveLength(4)

    // Verify renderSoul called with correct args
    expect(mockRenderSoul).toHaveBeenCalledWith('You are a researcher', 'agent-2', 'company-1')
    // Verify getDB called with companyId
    expect(mockGetDB).toHaveBeenCalledWith('company-1')
  })

  test('depth exceeded yields error event', async () => {
    const ctx = makeCtx({ depth: 3, maxDepth: 3 })
    const events = await collectEvents(callAgent(ctx, { targetAgentId: 'agent-2', message: 'test' }))

    expect(events).toHaveLength(1)
    expect(events[0]).toEqual({
      type: 'error',
      code: 'HANDOFF_DEPTH_EXCEEDED',
      message: 'Handoff depth 3 exceeds max 3',
    })

    // Should NOT call getDB or renderSoul
    expect(mockGetDB).not.toHaveBeenCalled()
    expect(mockRenderSoul).not.toHaveBeenCalled()
  })

  test('circular detection yields error event', async () => {
    const ctx = makeCtx({ visitedAgents: ['secretary', 'agent-2'] })
    const events = await collectEvents(callAgent(ctx, { targetAgentId: 'agent-2', message: 'test' }))

    expect(events).toHaveLength(1)
    expect(events[0]).toEqual({
      type: 'error',
      code: 'HANDOFF_CIRCULAR',
      message: 'Circular handoff detected: agent-2 already visited',
    })

    expect(mockGetDB).not.toHaveBeenCalled()
  })

  test('target not found yields error event', async () => {
    mockAgentById.mockResolvedValue([]) // No agent found

    const ctx = makeCtx()
    const events = await collectEvents(callAgent(ctx, { targetAgentId: 'nonexistent', message: 'test' }))

    expect(events).toHaveLength(1)
    expect(events[0]).toEqual({
      type: 'error',
      code: 'HANDOFF_TARGET_NOT_FOUND',
      message: 'Target agent not found: nonexistent',
    })

    expect(mockGetDB).toHaveBeenCalledWith('company-1')
    expect(mockRenderSoul).not.toHaveBeenCalled()
  })

  test('child context has incremented depth and extended visitedAgents', async () => {
    mockAgentById.mockResolvedValue([{ id: 'agent-3', name: 'Writer', soul: 'soul', role: 'worker' }])
    mockRenderSoul.mockResolvedValue('rendered soul')
    mockRunAgentEvents = [{ type: 'done', costUsd: 0, tokensUsed: 0 }]

    const ctx = makeCtx({ depth: 1, maxDepth: 5, visitedAgents: ['secretary', 'manager'] })
    const events = await collectEvents(callAgent(ctx, { targetAgentId: 'agent-3', message: 'write report' }))

    // Verify handoff event has depth = 2 (parent depth 1 + 1)
    expect(events[0]).toEqual({
      type: 'handoff',
      from: 'manager',
      to: 'Writer',
      depth: 2,
    })
    // Verify original context not mutated
    expect(ctx.depth).toBe(1)
    expect(ctx.visitedAgents).toEqual(['secretary', 'manager'])
  })

  test('handles agent with empty soul gracefully', async () => {
    mockAgentById.mockResolvedValue([{ id: 'agent-4', name: 'Empty', soul: '', role: 'worker' }])
    mockRenderSoul.mockResolvedValue('')
    mockRunAgentEvents = [{ type: 'done', costUsd: 0, tokensUsed: 0 }]

    const ctx = makeCtx()
    const events = await collectEvents(callAgent(ctx, { targetAgentId: 'agent-4', message: 'test' }))

    // Should still work — handoff + done
    expect(events[0].type).toBe('handoff')
    expect(events[1]).toEqual({ type: 'done', costUsd: 0, tokensUsed: 0 })
    expect(mockRenderSoul).toHaveBeenCalledWith('', 'agent-4', 'company-1')
  })

  test('handles agent with null soul gracefully', async () => {
    mockAgentById.mockResolvedValue([{ id: 'agent-5', name: 'NullSoul', soul: null, role: 'worker' }])
    mockRenderSoul.mockResolvedValue('')
    mockRunAgentEvents = [{ type: 'done', costUsd: 0, tokensUsed: 0 }]

    const ctx = makeCtx()
    const events = await collectEvents(callAgent(ctx, { targetAgentId: 'agent-5', message: 'test' }))

    expect(events[0].type).toBe('handoff')
    expect(mockRenderSoul).toHaveBeenCalledWith('', 'agent-5', 'company-1')
  })

  test('from is "unknown" when visitedAgents is empty', async () => {
    mockAgentById.mockResolvedValue([{ id: 'agent-6', name: 'Target', soul: 'soul', role: 'worker' }])
    mockRenderSoul.mockResolvedValue('soul')
    mockRunAgentEvents = [{ type: 'done', costUsd: 0, tokensUsed: 0 }]

    const ctx = makeCtx({ visitedAgents: [] })
    const events = await collectEvents(callAgent(ctx, { targetAgentId: 'agent-6', message: 'test' }))

    expect(events[0]).toEqual({
      type: 'handoff',
      from: 'unknown',
      to: 'Target',
      depth: 1,
    })
  })
})
