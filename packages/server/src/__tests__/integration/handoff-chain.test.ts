import { describe, test, expect, mock, beforeEach } from 'bun:test'
import type { SessionContext, SSEEvent } from '../../engine/types'
import { ERROR_CODES } from '../../lib/error-codes'

// --- Mock Data ---

const AGENTS = {
  secretary: {
    id: 'secretary-id',
    name: '비서실장',
    nameEn: 'Secretary',
    soul: 'You are the chief of staff.',
    tier: 'manager',
    isSecretary: true,
    allowedTools: ['call_agent'],
  },
  manager: {
    id: 'manager-id',
    name: '투자분석팀장',
    nameEn: 'Investment-Lead',
    soul: 'You are an investment team manager.',
    tier: 'manager',
    isSecretary: false,
    allowedTools: ['call_agent'],
  },
  specialist: {
    id: 'specialist-id',
    name: '시장분석전문가',
    nameEn: 'Market-Analyst',
    soul: 'You are a market analysis specialist.',
    tier: 'worker',
    isSecretary: false,
    allowedTools: ['web_search'],
  },
}

// --- Mocks ---

const mockInsertCostRecord = mock(() => Promise.resolve([]))
const mockAgentById = mock((id: string) => {
  const agent = Object.values(AGENTS).find(a => a.id === id)
  return Promise.resolve(agent ? [agent] : [])
})

mock.module('../../db/scoped-query', () => ({
  getDB: () => ({
    agentById: mockAgentById,
    agents: mock(() => Promise.resolve(Object.values(AGENTS))),
    insertCostRecord: mockInsertCostRecord,
  }),
}))

mock.module('../../engine/soul-renderer', () => ({
  renderSoul: mock((soul: string) => Promise.resolve(`Rendered: ${soul}`)),
}))

mock.module('../../db/logger', () => ({
  createSessionLogger: () => ({
    info: mock(() => {}),
    error: mock(() => {}),
    warn: mock(() => {}),
  }),
}))

// Mock SDK query — returns text response (no tool calls)
mock.module('@anthropic-ai/claude-agent-sdk', () => ({
  query: mock(({ prompt, options }: { prompt: string; options: Record<string, unknown> }) => ({
    async *[Symbol.asyncIterator]() {
      yield {
        type: 'assistant',
        message: { content: [{ type: 'text', text: `Response from agent` }] },
      }
      yield {
        type: 'result',
        subtype: 'success',
        total_cost_usd: 0.01,
        usage: { input_tokens: 100, output_tokens: 50 },
      }
    },
  })),
}))

// Import AFTER mocks
const { callAgent } = await import('../../tool-handlers/builtins/call-agent')
const { runAgent } = await import('../../engine/agent-loop')

// --- Helpers ---

function makeCtx(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    cliToken: 'test-token-abc123',
    userId: 'user-1',
    companyId: 'company-1',
    depth: 0,
    sessionId: 'session-handoff-test',
    startedAt: Date.now(),
    maxDepth: 3,
    visitedAgents: ['secretary-id'],
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

describe('Handoff Chain Integration — 3-depth handoff', () => {
  beforeEach(() => {
    mockAgentById.mockReset()
    mockInsertCostRecord.mockReset()
    mockAgentById.mockImplementation((id: string) => {
      const agent = Object.values(AGENTS).find(a => a.id === id)
      return Promise.resolve(agent ? [agent] : [])
    })
    mockInsertCostRecord.mockResolvedValue([])
  })

  test('callAgent yields handoff event with correct from/to/depth', async () => {
    const ctx = makeCtx({ depth: 0, visitedAgents: ['secretary-id'] })
    const events = await collectEvents(
      callAgent(ctx, { targetAgentId: 'manager-id', message: 'Analyze market' }),
    )

    // Should have: handoff, accepted, processing, message, done
    const handoff = events.find(e => e.type === 'handoff')
    expect(handoff).toBeDefined()
    expect(handoff!.type).toBe('handoff')
    if (handoff!.type === 'handoff') {
      expect(handoff!.from).toBe('secretary-id')
      expect(handoff!.to).toBe('투자분석팀장')
      expect(handoff!.depth).toBe(1)
    }
  })

  test('depth tracking: depth increments from 0→1 in child context', async () => {
    const ctx = makeCtx({ depth: 0, visitedAgents: ['secretary-id'] })
    const events = await collectEvents(
      callAgent(ctx, { targetAgentId: 'manager-id', message: 'test' }),
    )

    // The handoff event reports childCtx.depth = 1
    const handoff = events.find(e => e.type === 'handoff')
    expect(handoff).toBeDefined()
    if (handoff?.type === 'handoff') {
      expect(handoff.depth).toBe(1) // 0 → 1
    }
  })

  test('visitedAgents accumulates target agent ID', async () => {
    // This is verified indirectly: callAgent creates childCtx with visitedAgents
    // including targetAgentId, then passes it to runAgent
    const ctx = makeCtx({ depth: 0, visitedAgents: ['secretary-id'] })
    const events = await collectEvents(
      callAgent(ctx, { targetAgentId: 'manager-id', message: 'test' }),
    )

    // The accepted event shows the session started (runAgent was called with child ctx)
    const accepted = events.find(e => e.type === 'accepted')
    expect(accepted).toBeDefined()

    // Processing event shows the agent name from visitedAgents last element
    const processing = events.find(e => e.type === 'processing')
    expect(processing).toBeDefined()
    if (processing?.type === 'processing') {
      expect(processing.agentName).toBe('manager-id')
    }
  })

  test('SSE event order: handoff → accepted → processing → message → done', async () => {
    const ctx = makeCtx({ depth: 0, visitedAgents: ['secretary-id'] })
    const events = await collectEvents(
      callAgent(ctx, { targetAgentId: 'manager-id', message: 'test' }),
    )

    const types = events.map(e => e.type)
    // callAgent yields: handoff, then forwards runAgent events: accepted, processing, message, done
    expect(types[0]).toBe('handoff')
    expect(types[1]).toBe('accepted')
    expect(types[2]).toBe('processing')
    expect(types).toContain('message')
    expect(types[types.length - 1]).toBe('done')
  })

  test('done event includes cost data', async () => {
    const ctx = makeCtx({ depth: 0, visitedAgents: ['secretary-id'] })
    const events = await collectEvents(
      callAgent(ctx, { targetAgentId: 'manager-id', message: 'test' }),
    )

    const done = events.find(e => e.type === 'done')
    expect(done).toBeDefined()
    if (done?.type === 'done') {
      expect(done.costUsd).toBe(0.01)
      expect(done.tokensUsed).toBe(150) // 100 input + 50 output
    }
  })
})

describe('Handoff Chain Integration — circular detection', () => {
  beforeEach(() => {
    mockAgentById.mockReset()
    mockAgentById.mockImplementation((id: string) => {
      const agent = Object.values(AGENTS).find(a => a.id === id)
      return Promise.resolve(agent ? [agent] : [])
    })
  })

  test('circular handoff yields HANDOFF_CIRCULAR error', async () => {
    // secretary already visited, try to call secretary again
    const ctx = makeCtx({
      depth: 1,
      visitedAgents: ['secretary-id', 'manager-id'],
    })

    const events = await collectEvents(
      callAgent(ctx, { targetAgentId: 'secretary-id', message: 'test' }),
    )

    expect(events).toHaveLength(1)
    const error = events[0]
    expect(error.type).toBe('error')
    if (error.type === 'error') {
      expect(error.code).toBe(ERROR_CODES.HANDOFF_CIRCULAR)
      expect(error.message).toContain('secretary-id')
      expect(error.message).toContain('already visited')
    }
  })

  test('non-circular handoff to unvisited agent succeeds', async () => {
    const ctx = makeCtx({
      depth: 1,
      visitedAgents: ['secretary-id', 'manager-id'],
    })

    const events = await collectEvents(
      callAgent(ctx, { targetAgentId: 'specialist-id', message: 'test' }),
    )

    // Should NOT get a circular error
    const errors = events.filter(e => e.type === 'error')
    const circularErrors = errors.filter(
      e => e.type === 'error' && e.code === ERROR_CODES.HANDOFF_CIRCULAR,
    )
    expect(circularErrors).toHaveLength(0)

    // Should get normal handoff flow
    expect(events.find(e => e.type === 'handoff')).toBeDefined()
  })
})

describe('Handoff Chain Integration — depth exceeded', () => {
  beforeEach(() => {
    mockAgentById.mockReset()
    mockAgentById.mockImplementation((id: string) => {
      const agent = Object.values(AGENTS).find(a => a.id === id)
      return Promise.resolve(agent ? [agent] : [])
    })
  })

  test('depth at maxDepth yields HANDOFF_DEPTH_EXCEEDED error', async () => {
    const ctx = makeCtx({
      depth: 2,
      maxDepth: 2,
      visitedAgents: ['secretary-id', 'manager-id'],
    })

    const events = await collectEvents(
      callAgent(ctx, { targetAgentId: 'specialist-id', message: 'test' }),
    )

    expect(events).toHaveLength(1)
    const error = events[0]
    expect(error.type).toBe('error')
    if (error.type === 'error') {
      expect(error.code).toBe(ERROR_CODES.HANDOFF_DEPTH_EXCEEDED)
      expect(error.message).toContain('depth 2')
      expect(error.message).toContain('max 2')
    }
  })

  test('depth below maxDepth allows handoff', async () => {
    const ctx = makeCtx({
      depth: 1,
      maxDepth: 3,
      visitedAgents: ['secretary-id'],
    })

    const events = await collectEvents(
      callAgent(ctx, { targetAgentId: 'manager-id', message: 'test' }),
    )

    const errors = events.filter(
      e => e.type === 'error' && e.code === ERROR_CODES.HANDOFF_DEPTH_EXCEEDED,
    )
    expect(errors).toHaveLength(0)
    expect(events.find(e => e.type === 'handoff')).toBeDefined()
  })
})

describe('Handoff Chain Integration — target not found', () => {
  beforeEach(() => {
    mockAgentById.mockReset()
    mockAgentById.mockImplementation((id: string) => {
      const agent = Object.values(AGENTS).find(a => a.id === id)
      return Promise.resolve(agent ? [agent] : [])
    })
  })

  test('nonexistent target yields HANDOFF_TARGET_NOT_FOUND error', async () => {
    const ctx = makeCtx({ depth: 0, visitedAgents: ['secretary-id'] })

    const events = await collectEvents(
      callAgent(ctx, { targetAgentId: 'nonexistent-agent', message: 'test' }),
    )

    expect(events).toHaveLength(1)
    const error = events[0]
    expect(error.type).toBe('error')
    if (error.type === 'error') {
      expect(error.code).toBe(ERROR_CODES.HANDOFF_TARGET_NOT_FOUND)
      expect(error.message).toContain('nonexistent-agent')
    }
  })
})

describe('Handoff Chain Integration — runAgent session tracking', () => {
  test('runAgent yields accepted + processing + message + done in order', async () => {
    const ctx = makeCtx()
    const events = await collectEvents(
      runAgent({ ctx, soul: 'test soul', message: 'hello' }),
    )

    const types = events.map(e => e.type)
    expect(types[0]).toBe('accepted')
    expect(types[1]).toBe('processing')
    expect(types).toContain('message')
    expect(types[types.length - 1]).toBe('done')
  })

  test('runAgent done event includes cost and token data', async () => {
    const ctx = makeCtx()
    const events = await collectEvents(
      runAgent({ ctx, soul: 'test soul', message: 'hello' }),
    )

    const done = events.find(e => e.type === 'done')
    expect(done).toBeDefined()
    if (done?.type === 'done') {
      expect(typeof done.costUsd).toBe('number')
      expect(typeof done.tokensUsed).toBe('number')
      expect(done.costUsd).toBeGreaterThanOrEqual(0)
    }
  })
})
