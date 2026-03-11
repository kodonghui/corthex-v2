import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import type { SessionContext } from '../../engine/types'
import { eventBus } from '../../lib/event-bus'
import { delegationTracker } from '../../engine/hooks/delegation-tracker'

/**
 * Story 6.5: WebSocket handoff channel integration tests
 * Verifies that engine Hook delegation-tracker emits events
 * in the correct format for the EventBus→WebSocket bridge.
 */

function makeCtx(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    cliToken: 'test-token',
    userId: 'user-1',
    companyId: 'company-1',
    depth: 1,
    sessionId: 'session-cmd-123',
    startedAt: Date.now() - 500,
    maxDepth: 5,
    visitedAgents: ['secretary-agent'],
    ...overrides,
  }
}

describe('Story 6.5: WebSocket handoff channel — engine Hook emit format', () => {
  const emitted: unknown[] = []

  beforeEach(() => {
    emitted.length = 0
    eventBus.on('delegation', (event: unknown) => emitted.push(event))
  })

  afterEach(() => {
    eventBus.removeAllListeners('delegation')
  })

  test('emit uses { companyId, payload } wrapper (index.ts bridge compatibility)', () => {
    const ctx = makeCtx()
    delegationTracker(ctx, 'call_agent', 'output', { targetAgentId: 'cmo' })

    expect(emitted).toHaveLength(1)
    const wrapper = emitted[0] as Record<string, unknown>

    // index.ts EventBus bridge expects: { companyId: string, payload: unknown }
    expect(wrapper).toHaveProperty('companyId')
    expect(wrapper).toHaveProperty('payload')
    expect(typeof wrapper.companyId).toBe('string')
  })

  test('payload matches DelegationEvent shape for frontend use-command-center.ts', () => {
    const ctx = makeCtx({ sessionId: 'cmd-abc', companyId: 'tenant-x' })
    delegationTracker(ctx, 'call_agent', 'output', { targetAgentId: 'cfo-agent' })

    const wrapper = emitted[0] as { companyId: string; payload: Record<string, unknown> }
    const payload = wrapper.payload

    // Frontend handleDelegation expects these fields:
    expect(payload).toHaveProperty('commandId')
    expect(payload).toHaveProperty('event')
    expect(payload).toHaveProperty('phase')
    expect(payload).toHaveProperty('elapsed')
    expect(payload).toHaveProperty('timestamp')

    // Verify values
    expect(payload.commandId).toBe('cmd-abc')
    expect(payload.event).toBe('HANDOFF')
    expect(payload.phase).toBe('handoff')
    expect(typeof payload.elapsed).toBe('number')
    expect(typeof payload.timestamp).toBe('string')
    // timestamp should be valid ISO 8601
    expect(new Date(payload.timestamp as string).toISOString()).toBe(payload.timestamp)
  })

  test('payload.data contains handoff details (from, to, depth)', () => {
    const ctx = makeCtx({ visitedAgents: ['secretary', 'cmo'], depth: 2 })
    delegationTracker(ctx, 'call_agent', 'output', { targetAgentId: 'analyst' })

    const wrapper = emitted[0] as { companyId: string; payload: Record<string, unknown> }
    const data = wrapper.payload.data as { from: string; to: string; depth: number }

    expect(data.from).toBe('cmo')
    expect(data.to).toBe('analyst')
    expect(data.depth).toBe(2)
  })

  test('broadcastToCompany would route to correct delegation::{companyId} channel', () => {
    const ctx = makeCtx({ companyId: 'acme-corp' })
    delegationTracker(ctx, 'call_agent', 'output', { targetAgentId: 'sales' })

    const wrapper = emitted[0] as { companyId: string; payload: Record<string, unknown> }

    // index.ts does: broadcastToCompany(data.companyId, 'delegation', data.payload)
    // which calls: broadcastToChannel(`delegation::${companyId}`, data)
    expect(wrapper.companyId).toBe('acme-corp')
    // The payload also carries companyId for frontend reference
    expect(wrapper.payload.companyId).toBe('acme-corp')
  })

  test('multiple handoffs in same session produce separate events', () => {
    const ctx = makeCtx({ visitedAgents: ['secretary', 'cmo'], depth: 1 })
    delegationTracker(ctx, 'call_agent', 'out1', { targetAgentId: 'analyst-1' })

    // Simulate deeper handoff
    const ctx2 = makeCtx({
      visitedAgents: ['secretary', 'cmo', 'analyst-1'],
      depth: 2,
    })
    delegationTracker(ctx2, 'call_agent', 'out2', { targetAgentId: 'writer' })

    expect(emitted).toHaveLength(2)

    const first = (emitted[0] as { payload: Record<string, unknown> }).payload
    const second = (emitted[1] as { payload: Record<string, unknown> }).payload

    expect((first.data as Record<string, unknown>).from).toBe('cmo')
    expect((first.data as Record<string, unknown>).to).toBe('analyst-1')
    expect((first.data as Record<string, unknown>).depth).toBe(1)

    expect((second.data as Record<string, unknown>).from).toBe('analyst-1')
    expect((second.data as Record<string, unknown>).to).toBe('writer')
    expect((second.data as Record<string, unknown>).depth).toBe(2)
  })

  test('non-call_agent tools do not emit any delegation events', () => {
    const ctx = makeCtx()
    delegationTracker(ctx, 'web_search', 'results', { query: 'test' })
    delegationTracker(ctx, 'read_file', 'content', { path: '/tmp' })
    delegationTracker(ctx, 'execute_code', 'output', { code: 'print(1)' })

    expect(emitted).toHaveLength(0)
  })
})
