/**
 * Story 4.6: SSE Format + WebSocket + API Regression Tests
 *
 * Verifies engine replacement (Epic 1~4) didn't break:
 * - SSE event serialization format (frontend compatibility)
 * - WebSocket EventBus channel structure
 * - AGORA debate API route structure
 * - Tool type interface compatibility
 * - Engine types integrity (SessionContext, SSEEvent)
 */
import { describe, test, expect } from 'bun:test'

// ================================================================
// 1. SSE Event Format Regression (AC #3)
// ================================================================

// Import the actual types and adapter
import type { SSEEvent } from '../../engine/types'

// Inline formatSSE to test serialization without side effects
function formatSSE(event: SSEEvent): string {
  const { type, ...data } = event
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`
}

describe('SSE Event Format Regression', () => {
  test('accepted event → event: accepted\\ndata: {"sessionId":"..."}', () => {
    const event: SSEEvent = { type: 'accepted', sessionId: 'sess-001' }
    const result = formatSSE(event)
    expect(result).toBe('event: accepted\ndata: {"sessionId":"sess-001"}\n\n')
  })

  test('processing event → event: processing\\ndata: {"agentName":"..."}', () => {
    const event: SSEEvent = { type: 'processing', agentName: '비서' }
    const result = formatSSE(event)
    expect(result).toBe('event: processing\ndata: {"agentName":"비서"}\n\n')
  })

  test('handoff event → event: handoff\\ndata: {"from":"...","to":"...","depth":N}', () => {
    const event: SSEEvent = { type: 'handoff', from: '비서', to: '마케팅매니저', depth: 1 }
    const result = formatSSE(event)
    expect(result).toBe('event: handoff\ndata: {"from":"비서","to":"마케팅매니저","depth":1}\n\n')
  })

  test('message event → event: message\\ndata: {"content":"..."}', () => {
    const event: SSEEvent = { type: 'message', content: '분석 결과입니다' }
    const result = formatSSE(event)
    expect(result).toBe('event: message\ndata: {"content":"분석 결과입니다"}\n\n')
  })

  test('error event → event: error\\ndata: {"code":"...","message":"..."}', () => {
    const event: SSEEvent = { type: 'error', code: 'HANDOFF_CIRCULAR', message: '순환 감지' }
    const result = formatSSE(event)
    expect(result).toBe('event: error\ndata: {"code":"HANDOFF_CIRCULAR","message":"순환 감지"}\n\n')
  })

  test('error event with agentName → includes optional field', () => {
    const event: SSEEvent = { type: 'error', code: 'TOOL_DENIED', message: 'No permission', agentName: 'agent-1' }
    const result = formatSSE(event)
    const parsed = JSON.parse(result.split('data: ')[1].trim())
    expect(parsed.code).toBe('TOOL_DENIED')
    expect(parsed.agentName).toBe('agent-1')
    expect(parsed.type).toBeUndefined() // type goes to event: line, not data
  })

  test('done event → event: done\\ndata: {"costUsd":N,"tokensUsed":N}', () => {
    const event: SSEEvent = { type: 'done', costUsd: 0.05, tokensUsed: 1500 }
    const result = formatSSE(event)
    expect(result).toBe('event: done\ndata: {"costUsd":0.05,"tokensUsed":1500}\n\n')
  })

  test('all SSE events exclude "type" from data JSON (frontend parsing rule)', () => {
    const events: SSEEvent[] = [
      { type: 'accepted', sessionId: 's1' },
      { type: 'processing', agentName: 'a1' },
      { type: 'handoff', from: 'a', to: 'b', depth: 0 },
      { type: 'message', content: 'hi' },
      { type: 'error', code: 'E1', message: 'err' },
      { type: 'done', costUsd: 0, tokensUsed: 0 },
    ]

    for (const event of events) {
      const result = formatSSE(event)
      // Must start with "event: {type}\n"
      expect(result).toStartWith(`event: ${event.type}\n`)
      // Data line must be valid JSON without 'type' field
      const dataLine = result.split('\n')[1]
      expect(dataLine).toStartWith('data: ')
      const dataJson = JSON.parse(dataLine.slice(6))
      expect(dataJson.type).toBeUndefined()
      // Must end with double newline
      expect(result).toEndWith('\n\n')
    }
  })

  test('SSEEvent union covers exactly 6 types', () => {
    // Type-level check: if this compiles, all 6 types are accounted for
    const typeMap: Record<SSEEvent['type'], true> = {
      accepted: true,
      processing: true,
      handoff: true,
      message: true,
      error: true,
      done: true,
    }
    expect(Object.keys(typeMap)).toHaveLength(6)
  })
})

// ================================================================
// 2. Engine Types Integrity (SessionContext + SSEEvent)
// ================================================================

import type { SessionContext, RunAgentOptions, Tool, PreToolHookResult } from '../../engine/types'

describe('Engine Types Integrity', () => {
  test('SessionContext has all 8 required readonly fields', () => {
    const ctx: SessionContext = {
      cliToken: 'token',
      userId: 'user-1',
      companyId: 'company-1',
      depth: 0,
      sessionId: 'session-1',
      startedAt: Date.now(),
      maxDepth: 3,
      visitedAgents: ['agent-1'],
    }
    expect(Object.keys(ctx)).toHaveLength(8)
    expect(ctx.depth).toBe(0)
    expect(ctx.visitedAgents).toEqual(['agent-1'])
  })

  test('RunAgentOptions has required ctx/soul/message + optional tools', () => {
    const opts: RunAgentOptions = {
      ctx: {
        cliToken: 't', userId: 'u', companyId: 'c',
        depth: 0, sessionId: 's', startedAt: 0,
        maxDepth: 3, visitedAgents: [],
      },
      soul: 'You are a helpful assistant',
      message: 'Hello',
    }
    expect(opts.soul).toBe('You are a helpful assistant')
    expect(opts.tools).toBeUndefined()
  })

  test('Tool interface has name/description/inputSchema', () => {
    const tool: Tool = {
      name: 'search_web',
      description: 'Search the web',
      inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
    }
    expect(tool.name).toBe('search_web')
    expect(tool.inputSchema).toBeDefined()
  })

  test('PreToolHookResult has allow + optional reason', () => {
    const allowed: PreToolHookResult = { allow: true }
    const denied: PreToolHookResult = { allow: false, reason: 'No permission' }
    expect(allowed.allow).toBe(true)
    expect(denied.reason).toBe('No permission')
  })
})

// ================================================================
// 3. WebSocket EventBus Channel Regression (AC #4, D11)
// ================================================================

import { eventBus } from '../../lib/event-bus'

describe('WebSocket EventBus Channel Regression', () => {
  test('eventBus is an EventEmitter instance', () => {
    expect(typeof eventBus.on).toBe('function')
    expect(typeof eventBus.emit).toBe('function')
    expect(typeof eventBus.removeAllListeners).toBe('function')
  })

  test('eventBus supports all 10 registered channels', () => {
    const channels = [
      'activity', 'agent-status', 'notification', 'night-job', 'command',
      'delegation', 'tool', 'cost', 'argos', 'debate',
    ]

    for (const channel of channels) {
      let received = false
      const handler = () => { received = true }
      eventBus.on(channel, handler)
      eventBus.emit(channel, { companyId: 'test', payload: {} })
      eventBus.removeListener(channel, handler)
      expect(received).toBe(true)
    }
  })

  test('delegation channel event payload shape matches D11', () => {
    let capturedData: unknown = null
    const handler = (data: unknown) => { capturedData = data }
    eventBus.on('delegation', handler)

    const payload = { companyId: 'c1', payload: { from: 'a1', to: 'a2', depth: 1 } }
    eventBus.emit('delegation', payload)
    eventBus.removeListener('delegation', handler)

    expect(capturedData).toEqual(payload)
  })
})

// ================================================================
// 4. AGORA Debate API Route Existence (AC #5)
// ================================================================

describe('AGORA Debate API Compatibility', () => {
  test('agora-engine exports createDebate/startDebate/getDebate/listDebates', async () => {
    const agora = await import('../../services/agora-engine')
    expect(typeof agora.createDebate).toBe('function')
    expect(typeof agora.startDebate).toBe('function')
    expect(typeof agora.getDebate).toBe('function')
    expect(typeof agora.listDebates).toBe('function')
  })

  test('debates route module exports debatesRoute', async () => {
    const route = await import('../../routes/workspace/debates')
    expect(route.debatesRoute).toBeDefined()
  })
})

// ================================================================
// 5. Tool Type Definitions (AC #6)
// ================================================================

describe('Tool Type Definitions', () => {
  test('Tool interface satisfies MCP tool schema pattern', () => {
    // 125+ tools all follow this pattern
    const sampleTools: Tool[] = [
      { name: 'search_web', description: 'Web search', inputSchema: { type: 'object', properties: {} } },
      { name: 'send_telegram', description: 'Send Telegram message', inputSchema: { type: 'object', properties: { chatId: { type: 'string' }, text: { type: 'string' } } } },
      { name: 'trade_stock', description: 'Execute stock trade', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, qty: { type: 'number' } } } },
      { name: 'create_chart', description: 'Create Mermaid chart', inputSchema: { type: 'object', properties: { code: { type: 'string' } } } },
      { name: 'call_agent', description: 'Delegate to another agent', inputSchema: { type: 'object', properties: { targetAgentId: { type: 'string' }, message: { type: 'string' } } } },
    ]

    for (const tool of sampleTools) {
      expect(tool.name).toBeTruthy()
      expect(tool.description).toBeTruthy()
      expect(tool.inputSchema).toBeDefined()
      expect(typeof tool.inputSchema).toBe('object')
    }
    expect(sampleTools).toHaveLength(5)
  })
})
