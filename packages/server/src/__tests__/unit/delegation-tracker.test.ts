import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test'
import type { SessionContext } from '../../engine/types'
import { eventBus } from '../../lib/event-bus'
import { delegationTracker } from '../../engine/hooks/delegation-tracker'

// --- Helpers ---

function makeCtx(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    cliToken: 'test-token',
    userId: 'user-1',
    companyId: 'company-1',
    depth: 1,
    sessionId: 'session-1',
    startedAt: Date.now() - 500,
    maxDepth: 3,
    visitedAgents: ['secretary'],
    ...overrides,
  }
}

// --- Tests ---

describe('delegationTracker', () => {
  const emitted: unknown[] = []

  beforeEach(() => {
    emitted.length = 0
    eventBus.on('delegation', (event: unknown) => emitted.push(event))
  })

  afterEach(() => {
    eventBus.removeAllListeners('delegation')
  })

  test('emits handoff event for call_agent tool in { companyId, payload } format', () => {
    const ctx = makeCtx({ visitedAgents: ['secretary'], depth: 1 })
    delegationTracker(ctx, 'call_agent', 'response text', { targetAgentId: 'cmo-agent', message: 'hello' })

    expect(emitted).toHaveLength(1)
    const wrapper = emitted[0] as { companyId: string; payload: Record<string, unknown> }
    expect(wrapper.companyId).toBe('company-1')

    const payload = wrapper.payload
    expect(payload.commandId).toBe('session-1')
    expect(payload.event).toBe('HANDOFF')
    expect(payload.agentId).toBe('secretary')
    expect(payload.agentName).toBe('secretary')
    expect(payload.phase).toBe('handoff')
    expect(payload.companyId).toBe('company-1')
    expect(typeof payload.elapsed).toBe('number')
    expect(typeof payload.timestamp).toBe('string')

    const data = payload.data as { from: string; to: string; depth: number }
    expect(data.from).toBe('secretary')
    expect(data.to).toBe('cmo-agent')
    expect(data.depth).toBe(1)
  })

  test('does not emit for non-call_agent tools', () => {
    delegationTracker(makeCtx(), 'web_search', 'results', {})
    expect(emitted).toHaveLength(0)
  })

  test('returns toolOutput unchanged', () => {
    const output = 'This is the agent response with sensitive data already scrubbed'
    const result = delegationTracker(makeCtx(), 'call_agent', output, { targetAgentId: 'agent-x' })
    expect(result).toBe(output)
  })

  test('returns toolOutput unchanged for non-call_agent', () => {
    const output = 'search results'
    const result = delegationTracker(makeCtx(), 'web_search', output)
    expect(result).toBe(output)
  })

  test('handles missing toolInput gracefully', () => {
    delegationTracker(makeCtx(), 'call_agent', 'response')
    expect(emitted).toHaveLength(1)
    const wrapper = emitted[0] as { companyId: string; payload: Record<string, unknown> }
    const data = wrapper.payload.data as { from: string; to: string }
    expect(data.to).toBe('unknown')
  })

  test('uses last visitedAgent as from', () => {
    const ctx = makeCtx({ visitedAgents: ['secretary', 'cmo', 'content-specialist'] })
    delegationTracker(ctx, 'call_agent', 'response', { targetAgentId: 'writer' })
    const wrapper = emitted[0] as { companyId: string; payload: Record<string, unknown> }
    expect(wrapper.payload.agentName).toBe('content-specialist')
    const data = wrapper.payload.data as { from: string; to: string }
    expect(data.from).toBe('content-specialist')
    expect(data.to).toBe('writer')
  })

  test('elapsed is calculated from ctx.startedAt', () => {
    const ctx = makeCtx({ startedAt: Date.now() - 1000 })
    delegationTracker(ctx, 'call_agent', 'response', { targetAgentId: 'agent-x' })
    const wrapper = emitted[0] as { companyId: string; payload: Record<string, unknown> }
    const elapsed = wrapper.payload.elapsed as number
    expect(elapsed).toBeGreaterThanOrEqual(900)
    expect(elapsed).toBeLessThan(2000)
  })

  test('payload companyId matches wrapper companyId (tenant isolation)', () => {
    const ctx = makeCtx({ companyId: 'tenant-abc' })
    delegationTracker(ctx, 'call_agent', 'response', { targetAgentId: 'agent-x' })
    const wrapper = emitted[0] as { companyId: string; payload: Record<string, unknown> }
    expect(wrapper.companyId).toBe('tenant-abc')
    expect(wrapper.payload.companyId).toBe('tenant-abc')
  })

  test('sessionId maps to commandId in payload', () => {
    const ctx = makeCtx({ sessionId: 'my-session-uuid' })
    delegationTracker(ctx, 'call_agent', 'response', { targetAgentId: 'agent-x' })
    const wrapper = emitted[0] as { companyId: string; payload: Record<string, unknown> }
    expect(wrapper.payload.commandId).toBe('my-session-uuid')
  })
})

// --- TEA P0: Source Code Introspection ---

describe('TEA P0: delegation-tracker source introspection', () => {
  const fs = require('fs')
  const src = fs.readFileSync(
    require('path').resolve(__dirname, '../../engine/hooks/delegation-tracker.ts'),
    'utf-8',
  )

  test('imports eventBus from lib/event-bus', () => {
    expect(src).toContain("from '../../lib/event-bus'")
    expect(src).toContain('eventBus')
  })

  test('is synchronous function (no async/await)', () => {
    expect(src).not.toContain('async function')
  })

  test('emits delegation event type', () => {
    expect(src).toContain("eventBus.emit('delegation'")
  })

  test('does not import getDB (no direct DB access)', () => {
    expect(src).not.toContain("from '../../db/scoped-query'")
  })

  test('emits { companyId, payload } wrapper format (Story 6.5)', () => {
    // Verify the emit uses the wrapper structure
    expect(src).toContain('companyId: ctx.companyId')
    expect(src).toContain('payload:')
    expect(src).toContain('commandId: ctx.sessionId')
  })
})
