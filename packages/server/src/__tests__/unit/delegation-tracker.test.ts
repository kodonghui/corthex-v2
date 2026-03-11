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
    startedAt: Date.now(),
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

  test('emits handoff event for call_agent tool', () => {
    const ctx = makeCtx({ visitedAgents: ['secretary'], depth: 1 })
    delegationTracker(ctx, 'call_agent', 'response text', { targetAgentId: 'cmo-agent', message: 'hello' })

    expect(emitted).toHaveLength(1)
    const event = emitted[0] as Record<string, unknown>
    expect(event.type).toBe('handoff')
    expect(event.from).toBe('secretary')
    expect(event.to).toBe('cmo-agent')
    expect(event.depth).toBe(1)
    expect(event.sessionId).toBe('session-1')
    expect(event.companyId).toBe('company-1')
    expect(typeof event.timestamp).toBe('string')
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
    const event = emitted[0] as Record<string, unknown>
    expect(event.to).toBe('unknown')
  })

  test('uses last visitedAgent as from', () => {
    const ctx = makeCtx({ visitedAgents: ['secretary', 'cmo', 'content-specialist'] })
    delegationTracker(ctx, 'call_agent', 'response', { targetAgentId: 'writer' })
    const event = emitted[0] as Record<string, unknown>
    expect(event.from).toBe('content-specialist')
    expect(event.to).toBe('writer')
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
})
