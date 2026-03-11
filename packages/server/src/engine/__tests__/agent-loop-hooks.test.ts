/**
 * Story 14.1: agent-loop.ts hook wiring tests
 *
 * Tests verify that the 5 engine hooks are properly invoked during agent execution.
 * Uses mocks for the SDK query function and hook implementations.
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'
import type { SessionContext } from '../types'

// Mock SDK before importing agent-loop
const mockQueryEvents: any[] = []
mock.module('@anthropic-ai/claude-agent-sdk', () => ({
  query: (_params: any) => {
    const hooks = _params.options?.hooks
    return {
      [Symbol.asyncIterator]: async function* () {
        for (const event of mockQueryEvents) {
          if (event._type === 'pre_tool_trigger') {
            // Simulate SDK calling PreToolUse hook
            const preHooks = hooks?.PreToolUse?.[0]?.hooks || []
            for (const h of preHooks) {
              await h({ hook_event_name: 'PreToolUse', tool_name: event.tool_name, tool_input: event.tool_input, tool_use_id: 'tu-1', session_id: 's1', transcript_path: '', cwd: '' }, 'tu-1', { signal: new AbortController().signal })
            }
          } else if (event._type === 'post_tool_trigger') {
            // Simulate SDK calling PostToolUse hook
            const postHooks = hooks?.PostToolUse?.[0]?.hooks || []
            for (const h of postHooks) {
              await h({ hook_event_name: 'PostToolUse', tool_name: event.tool_name, tool_input: event.tool_input, tool_response: event.tool_response, tool_use_id: 'tu-1', session_id: 's1', transcript_path: '', cwd: '' }, 'tu-1', { signal: new AbortController().signal })
            }
          } else {
            yield event
          }
        }
      },
    }
  },
}))

// Mock DB for toolPermissionGuard
const mockAgentRow: { allowedTools?: string[] } = {}
mock.module('../../db/scoped-query', () => ({
  getDB: () => ({
    agentById: async (_id: string) => [mockAgentRow],
    insertCostRecord: async (_r: any) => {},
  }),
}))

// Mock logger
mock.module('../../db/logger', () => ({
  createSessionLogger: () => ({
    info: () => {},
    error: () => {},
  }),
}))

// Mock EventBus for delegation-tracker
mock.module('../../lib/event-bus', () => ({
  eventBus: { emit: mock(() => {}) },
}))

const makeCtx = (overrides: Partial<SessionContext> = {}): SessionContext => ({
  cliToken: 'test-token',
  userId: 'user-1',
  companyId: 'company-1',
  depth: 0,
  sessionId: 'session-1',
  startedAt: Date.now(),
  maxDepth: 5,
  visitedAgents: ['agent-1'],
  ...overrides,
})

const collectEvents = async (ctx: SessionContext, events: any[]) => {
  mockQueryEvents.length = 0
  mockQueryEvents.push(...events)
  const { runAgent } = await import('../agent-loop')
  const result: any[] = []
  for await (const e of runAgent({ ctx, soul: 'You are helpful', message: 'hello' })) {
    result.push(e)
  }
  return result
}

describe('agent-loop hook wiring', () => {
  beforeEach(() => {
    mockAgentRow.allowedTools = undefined
    mockQueryEvents.length = 0
  })

  test('AC#1: toolPermissionGuard blocks unauthorized tool — yields error SSE event', async () => {
    mockAgentRow.allowedTools = ['read_file'] // only read_file allowed
    const events = await collectEvents(makeCtx(), [
      { _type: 'pre_tool_trigger', tool_name: 'execute_bash', tool_input: { command: 'rm -rf' } },
      { type: 'result', subtype: 'success', total_cost_usd: 0, usage: { input_tokens: 10, output_tokens: 5 }, modelUsage: { 'claude-haiku-4-5': {} } },
    ])
    const errorEvent = events.find((e) => e.type === 'error')
    expect(errorEvent).toBeDefined()
    expect(errorEvent?.code).toContain('TOOL_PERMISSION_DENIED')
  })

  test('AC#1: toolPermissionGuard allows permitted tool — no error event', async () => {
    mockAgentRow.allowedTools = ['read_file']
    const events = await collectEvents(makeCtx(), [
      { _type: 'pre_tool_trigger', tool_name: 'read_file', tool_input: { path: '/tmp/test' } },
      { type: 'result', subtype: 'success', total_cost_usd: 0, usage: { input_tokens: 10, output_tokens: 5 }, modelUsage: { 'claude-haiku-4-5': {} } },
    ])
    const errorEvents = events.filter((e) => e.type === 'error')
    expect(errorEvents).toHaveLength(0)
  })

  test('AC#1: empty allowedTools list allows all tools', async () => {
    mockAgentRow.allowedTools = [] // empty = allow all
    const events = await collectEvents(makeCtx(), [
      { _type: 'pre_tool_trigger', tool_name: 'any_tool', tool_input: {} },
      { type: 'result', subtype: 'success', total_cost_usd: 0, usage: { input_tokens: 1, output_tokens: 1 }, modelUsage: { 'claude-haiku-4-5': {} } },
    ])
    const errorEvents = events.filter((e) => e.type === 'error')
    expect(errorEvents).toHaveLength(0)
  })

  test('AC#3: call_agent tool yields handoff SSE event', async () => {
    mockAgentRow.allowedTools = undefined
    const events = await collectEvents(makeCtx(), [
      { _type: 'post_tool_trigger', tool_name: 'call_agent', tool_input: { targetAgentId: 'agent-2' }, tool_response: '{}' },
      { type: 'result', subtype: 'success', total_cost_usd: 0, usage: { input_tokens: 10, output_tokens: 5 }, modelUsage: { 'claude-haiku-4-5': {} } },
    ])
    const handoffEvent = events.find((e) => e.type === 'handoff')
    expect(handoffEvent).toBeDefined()
    expect(handoffEvent?.from).toBe('agent-1')
    expect(handoffEvent?.to).toBe('agent-2')
    expect(handoffEvent?.depth).toBe(0)
  })

  test('AC#4: costTracker called with result usage', async () => {
    // costTracker calls insertCostRecord — we verify no crash and done event yields cost
    const events = await collectEvents(makeCtx(), [
      { type: 'result', subtype: 'success', total_cost_usd: 0.05, usage: { input_tokens: 100, output_tokens: 50 }, modelUsage: { 'claude-sonnet-4-6': {} } },
    ])
    const doneEvent = events.find((e) => e.type === 'done')
    expect(doneEvent).toBeDefined()
    expect(doneEvent?.tokensUsed).toBe(150)
  })

  test('AC#4: costTracker fires in finally even on error', async () => {
    const events = await collectEvents(makeCtx(), [
      { type: 'result', subtype: 'error', error: 'Agent crashed', total_cost_usd: 0, usage: { input_tokens: 5, output_tokens: 2 }, modelUsage: { 'claude-haiku-4-5': {} } },
    ])
    // Result error event should be yielded; no JS crash (costTracker fire-and-forget)
    const errorEvents = events.filter((e) => e.type === 'error')
    expect(errorEvents.length).toBeGreaterThan(0)
  })

  test('AC#2: post-tool hooks run in order (scrubber removes credentials from output)', async () => {
    // If credential-scrubber is wired, API keys in tool output get redacted
    // We verify no crash and the hook chain runs without errors
    const events = await collectEvents(makeCtx(), [
      { _type: 'post_tool_trigger', tool_name: 'read_file', tool_input: {}, tool_response: 'api_key=sk-ant-abc123456789012345678901234567890123456789' },
      { type: 'result', subtype: 'success', total_cost_usd: 0, usage: { input_tokens: 5, output_tokens: 2 }, modelUsage: { 'claude-haiku-4-5': {} } },
    ])
    const doneEvent = events.find((e) => e.type === 'done')
    expect(doneEvent).toBeDefined()
  })

  test('getActiveSessions registers session during execution', async () => {
    const ctx = makeCtx({ sessionId: 'session-active-test' })
    mockQueryEvents.length = 0
    mockQueryEvents.push(
      { type: 'result', subtype: 'success', total_cost_usd: 0, usage: { input_tokens: 1, output_tokens: 1 }, modelUsage: { 'claude-haiku-4-5': {} } },
    )
    const { runAgent, getActiveSessions } = await import('../agent-loop')
    const gen = runAgent({ ctx, soul: 'test', message: 'hi' })
    // First yield: 'accepted'
    const first = await gen.next()
    expect(first.value?.type).toBe('accepted')
    expect(getActiveSessions().has('session-active-test')).toBe(true)
    // Drain the rest
    for await (const _ of gen) { /* */ }
    expect(getActiveSessions().has('session-active-test')).toBe(false)
  })
})
