import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import type { SessionContext } from '../../engine/types'
import { eventBus } from '../../lib/event-bus'
import { delegationTracker } from '../../engine/hooks/delegation-tracker'

/**
 * TEA: Risk-based test expansion for Story 6.5 — WebSocket handoff channel
 *
 * Risk Analysis:
 * P0: EventBus bridge format compatibility (engine Hook → index.ts → WebSocket)
 * P0: Tenant isolation (companyId in wrapper matches payload)
 * P1: Concurrent multi-session handoff events
 * P1: Payload data integrity (all fields, correct types)
 * P2: Edge cases (empty arrays, missing fields, deep handoff chains)
 */

function makeCtx(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    cliToken: 'test-token',
    userId: 'user-1',
    companyId: 'company-1',
    depth: 1,
    sessionId: 'session-1',
    startedAt: Date.now() - 500,
    maxDepth: 5,
    visitedAgents: ['secretary'],
    ...overrides,
  }
}

// === P0: EventBus Bridge Format Compatibility ===

describe('[TEA P0] EventBus bridge format — engine Hook → index.ts → WS', () => {
  const emitted: unknown[] = []

  beforeEach(() => {
    emitted.length = 0
    eventBus.on('delegation', (event: unknown) => emitted.push(event))
  })

  afterEach(() => {
    eventBus.removeAllListeners('delegation')
  })

  test('emitted data has exactly companyId and payload at top level', () => {
    delegationTracker(makeCtx(), 'call_agent', 'out', { targetAgentId: 'x' })

    const wrapper = emitted[0] as Record<string, unknown>
    const keys = Object.keys(wrapper).sort()
    expect(keys).toEqual(['companyId', 'payload'])
  })

  test('wrapper.companyId is a non-empty string', () => {
    delegationTracker(makeCtx({ companyId: 'co-123' }), 'call_agent', 'out', { targetAgentId: 'x' })

    const wrapper = emitted[0] as { companyId: string }
    expect(typeof wrapper.companyId).toBe('string')
    expect(wrapper.companyId.length).toBeGreaterThan(0)
  })

  test('wrapper.payload is a non-null object', () => {
    delegationTracker(makeCtx(), 'call_agent', 'out', { targetAgentId: 'x' })

    const wrapper = emitted[0] as { payload: unknown }
    expect(wrapper.payload).not.toBeNull()
    expect(typeof wrapper.payload).toBe('object')
  })

  test('payload has all fields expected by frontend handleDelegation', () => {
    delegationTracker(makeCtx(), 'call_agent', 'out', { targetAgentId: 'x' })

    const { payload } = emitted[0] as { payload: Record<string, unknown> }
    // Frontend handleDelegation expects: commandId, event, phase, elapsed, timestamp
    expect(payload).toHaveProperty('commandId')
    expect(payload).toHaveProperty('event')
    expect(payload).toHaveProperty('phase')
    expect(payload).toHaveProperty('elapsed')
    expect(payload).toHaveProperty('timestamp')
  })

  test('payload.event is HANDOFF (matches DelegationEventType pattern)', () => {
    delegationTracker(makeCtx(), 'call_agent', 'out', { targetAgentId: 'x' })

    const { payload } = emitted[0] as { payload: Record<string, unknown> }
    expect(payload.event).toBe('HANDOFF')
  })

  test('payload.timestamp is valid ISO 8601', () => {
    delegationTracker(makeCtx(), 'call_agent', 'out', { targetAgentId: 'x' })

    const { payload } = emitted[0] as { payload: Record<string, unknown> }
    const ts = payload.timestamp as string
    const parsed = new Date(ts)
    expect(Number.isNaN(parsed.getTime())).toBe(false)
    expect(parsed.toISOString()).toBe(ts)
  })
})

// === P0: Tenant Isolation ===

describe('[TEA P0] Tenant isolation in handoff events', () => {
  const emitted: unknown[] = []

  beforeEach(() => {
    emitted.length = 0
    eventBus.on('delegation', (event: unknown) => emitted.push(event))
  })

  afterEach(() => {
    eventBus.removeAllListeners('delegation')
  })

  test('wrapper companyId matches payload companyId', () => {
    delegationTracker(makeCtx({ companyId: 'acme' }), 'call_agent', 'out', { targetAgentId: 'x' })

    const wrapper = emitted[0] as { companyId: string; payload: Record<string, unknown> }
    expect(wrapper.companyId).toBe('acme')
    expect(wrapper.payload.companyId).toBe('acme')
  })

  test('events from different tenants are isolated', () => {
    const ctx1 = makeCtx({ companyId: 'tenant-A', sessionId: 'sess-A' })
    const ctx2 = makeCtx({ companyId: 'tenant-B', sessionId: 'sess-B' })

    delegationTracker(ctx1, 'call_agent', 'out1', { targetAgentId: 'a1' })
    delegationTracker(ctx2, 'call_agent', 'out2', { targetAgentId: 'b1' })

    expect(emitted).toHaveLength(2)

    const e1 = emitted[0] as { companyId: string; payload: Record<string, unknown> }
    const e2 = emitted[1] as { companyId: string; payload: Record<string, unknown> }

    expect(e1.companyId).toBe('tenant-A')
    expect(e1.payload.commandId).toBe('sess-A')

    expect(e2.companyId).toBe('tenant-B')
    expect(e2.payload.commandId).toBe('sess-B')
  })
})

// === P1: Concurrent Multi-Session Handoff Events ===

describe('[TEA P1] Concurrent multi-session handoff events', () => {
  const emitted: unknown[] = []

  beforeEach(() => {
    emitted.length = 0
    eventBus.on('delegation', (event: unknown) => emitted.push(event))
  })

  afterEach(() => {
    eventBus.removeAllListeners('delegation')
  })

  test('10 concurrent sessions emit 10 independent events', () => {
    for (let i = 0; i < 10; i++) {
      const ctx = makeCtx({
        sessionId: `sess-${i}`,
        companyId: `co-${i}`,
        visitedAgents: [`agent-${i}`],
      })
      delegationTracker(ctx, 'call_agent', `out-${i}`, { targetAgentId: `target-${i}` })
    }

    expect(emitted).toHaveLength(10)

    for (let i = 0; i < 10; i++) {
      const wrapper = emitted[i] as { companyId: string; payload: Record<string, unknown> }
      expect(wrapper.companyId).toBe(`co-${i}`)
      expect(wrapper.payload.commandId).toBe(`sess-${i}`)
    }
  })

  test('same company different sessions produce unique commandIds', () => {
    const ctx1 = makeCtx({ sessionId: 'sess-aaa', companyId: 'shared-co' })
    const ctx2 = makeCtx({ sessionId: 'sess-bbb', companyId: 'shared-co' })

    delegationTracker(ctx1, 'call_agent', 'out1', { targetAgentId: 'a' })
    delegationTracker(ctx2, 'call_agent', 'out2', { targetAgentId: 'b' })

    const p1 = (emitted[0] as { payload: Record<string, unknown> }).payload
    const p2 = (emitted[1] as { payload: Record<string, unknown> }).payload

    expect(p1.commandId).toBe('sess-aaa')
    expect(p2.commandId).toBe('sess-bbb')
    expect(p1.commandId).not.toBe(p2.commandId)
  })
})

// === P1: Payload Data Integrity ===

describe('[TEA P1] Payload data integrity', () => {
  const emitted: unknown[] = []

  beforeEach(() => {
    emitted.length = 0
    eventBus.on('delegation', (event: unknown) => emitted.push(event))
  })

  afterEach(() => {
    eventBus.removeAllListeners('delegation')
  })

  test('payload.elapsed is a positive number', () => {
    const ctx = makeCtx({ startedAt: Date.now() - 2000 })
    delegationTracker(ctx, 'call_agent', 'out', { targetAgentId: 'x' })

    const { payload } = emitted[0] as { payload: Record<string, unknown> }
    const elapsed = payload.elapsed as number
    expect(typeof elapsed).toBe('number')
    expect(elapsed).toBeGreaterThanOrEqual(1900)
  })

  test('payload.data has from, to, depth fields', () => {
    delegationTracker(makeCtx({ depth: 3 }), 'call_agent', 'out', { targetAgentId: 'target-z' })

    const { payload } = emitted[0] as { payload: Record<string, unknown> }
    const data = payload.data as Record<string, unknown>

    expect(data).toHaveProperty('from')
    expect(data).toHaveProperty('to')
    expect(data).toHaveProperty('depth')
    expect(typeof data.from).toBe('string')
    expect(typeof data.to).toBe('string')
    expect(typeof data.depth).toBe('number')
    expect(data.depth).toBe(3)
  })

  test('payload.agentName equals from agent (last visited)', () => {
    const ctx = makeCtx({ visitedAgents: ['sec', 'mgr', 'specialist'] })
    delegationTracker(ctx, 'call_agent', 'out', { targetAgentId: 'y' })

    const { payload } = emitted[0] as { payload: Record<string, unknown> }
    expect(payload.agentName).toBe('specialist')

    const data = payload.data as Record<string, unknown>
    expect(data.from).toBe('specialist')
  })
})

// === P2: Edge Cases ===

describe('[TEA P2] Edge cases', () => {
  const emitted: unknown[] = []

  beforeEach(() => {
    emitted.length = 0
    eventBus.on('delegation', (event: unknown) => emitted.push(event))
  })

  afterEach(() => {
    eventBus.removeAllListeners('delegation')
  })

  test('empty visitedAgents array uses "unknown" as from', () => {
    const ctx = makeCtx({ visitedAgents: [] })
    delegationTracker(ctx, 'call_agent', 'out', { targetAgentId: 'target' })

    const { payload } = emitted[0] as { payload: Record<string, unknown> }
    expect(payload.agentName).toBe('unknown')
    expect((payload.data as Record<string, unknown>).from).toBe('unknown')
  })

  test('missing targetAgentId in toolInput uses "unknown" as to', () => {
    delegationTracker(makeCtx(), 'call_agent', 'out', {})

    const { payload } = emitted[0] as { payload: Record<string, unknown> }
    expect((payload.data as Record<string, unknown>).to).toBe('unknown')
  })

  test('depth 0 (root level) is preserved in data', () => {
    const ctx = makeCtx({ depth: 0 })
    delegationTracker(ctx, 'call_agent', 'out', { targetAgentId: 'x' })

    const { payload } = emitted[0] as { payload: Record<string, unknown> }
    expect((payload.data as Record<string, unknown>).depth).toBe(0)
  })

  test('deep chain (depth 5) is preserved correctly', () => {
    const ctx = makeCtx({
      depth: 5,
      visitedAgents: ['a', 'b', 'c', 'd', 'e', 'f'],
    })
    delegationTracker(ctx, 'call_agent', 'out', { targetAgentId: 'g' })

    const { payload } = emitted[0] as { payload: Record<string, unknown> }
    const data = payload.data as Record<string, unknown>
    expect(data.depth).toBe(5)
    expect(data.from).toBe('f')
    expect(data.to).toBe('g')
  })

  test('unicode agent names are preserved', () => {
    const ctx = makeCtx({ visitedAgents: ['비서실장'] })
    delegationTracker(ctx, 'call_agent', 'out', { targetAgentId: '마케팅실장' })

    const { payload } = emitted[0] as { payload: Record<string, unknown> }
    expect(payload.agentName).toBe('비서실장')
    const data = payload.data as Record<string, unknown>
    expect(data.from).toBe('비서실장')
    expect(data.to).toBe('마케팅실장')
  })
})

// === P0: Source Introspection ===

describe('[TEA P0] Source introspection — Story 6.5 compliance', () => {
  const fs = require('fs')
  const src = fs.readFileSync(
    require('path').resolve(__dirname, '../../engine/hooks/delegation-tracker.ts'),
    'utf-8',
  )

  test('does NOT import broadcastToChannel or broadcastToCompany (E2 compliance)', () => {
    // Check import statements only, not comments
    expect(src).not.toContain("import { broadcastToChannel")
    expect(src).not.toContain("import { broadcastToCompany")
    // Verify no function call to broadcast (not in comments)
    const codeLines = src.split('\n').filter((l: string) => !l.trim().startsWith('*') && !l.trim().startsWith('//'))
    const codeOnly = codeLines.join('\n')
    expect(codeOnly).not.toMatch(/broadcastToChannel\(/)
    expect(codeOnly).not.toMatch(/broadcastToCompany\(/)
  })

  test('does NOT import from ws/ directory', () => {
    expect(src).not.toContain("from '../../ws/")
    expect(src).not.toContain('from "../../ws/')
  })

  test('uses eventBus.emit only (no other emit methods)', () => {
    const emitCalls = src.match(/eventBus\.\w+/g) || []
    expect(emitCalls.every((c: string) => c === 'eventBus.emit')).toBe(true)
  })

  test('includes elapsed calculation from ctx.startedAt', () => {
    expect(src).toContain('Date.now() - ctx.startedAt')
  })

  test('maps sessionId to commandId in payload', () => {
    expect(src).toContain('commandId: ctx.sessionId')
  })
})
