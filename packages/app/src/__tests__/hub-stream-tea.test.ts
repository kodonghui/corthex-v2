/**
 * TEA-generated tests for Story 6.1: Hub SSE Streaming & Secretary Layout
 * Risk-based coverage: P0 critical paths + P1 edge cases
 * Framework: bun:test
 */
import { describe, test, expect } from 'bun:test'

// ============================================================
// SSE Parser (extracted from use-hub-stream.ts for unit testing)
// ============================================================
type SSEEvent = {
  event: string
  data: Record<string, unknown>
}

function parseSSEChunk(chunk: string): SSEEvent[] {
  const events: SSEEvent[] = []
  const blocks = chunk.split('\n\n').filter(Boolean)

  for (const block of blocks) {
    const lines = block.split('\n')
    let eventType = 'message'
    let dataStr = ''

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim()
      } else if (line.startsWith('data: ')) {
        dataStr += line.slice(6)
      }
    }

    if (dataStr) {
      try {
        events.push({ event: eventType, data: JSON.parse(dataStr) })
      } catch {
        // skip malformed JSON
      }
    }
  }
  return events
}

// ============================================================
// P0: SSE Parsing — Critical Path Tests
// ============================================================
describe('TEA P0: SSE Event Parsing Edge Cases', () => {
  test('multi-line data field concatenation', () => {
    // SSE spec allows multi-line data
    const chunk = 'event: message\ndata: {"content":"\ndata: hello"}\n\n'
    // This should concat the data lines: '{"content":"' + 'hello"}'
    const events = parseSSEChunk(chunk)
    // The concatenated data is: {"content":"hello"}
    expect(events).toHaveLength(1)
    expect(events[0].data.content).toBe('hello')
  })

  test('unicode content in SSE events', () => {
    const chunk = 'event: token\ndata: {"content":"한국어 텍스트 🚀"}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(1)
    expect(events[0].data.content).toBe('한국어 텍스트 🚀')
  })

  test('very long content field', () => {
    const longText = 'a'.repeat(10000)
    const chunk = `event: message\ndata: {"content":"${longText}"}\n\n`
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(1)
    expect((events[0].data.content as string).length).toBe(10000)
  })

  test('empty data object', () => {
    const chunk = 'event: accepted\ndata: {}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('accepted')
    expect(Object.keys(events[0].data)).toHaveLength(0)
  })

  test('numeric values preserved correctly', () => {
    const chunk = 'event: done\ndata: {"costUsd":0.00001,"tokensUsed":0}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events[0].data.costUsd).toBe(0.00001)
    expect(events[0].data.tokensUsed).toBe(0)
  })

  test('null values in data', () => {
    const chunk = 'event: processing\ndata: {"agentName":null}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events[0].data.agentName).toBeNull()
  })

  test('nested JSON in data', () => {
    const chunk = 'event: error\ndata: {"code":"ERR_001","details":{"field":"message","reason":"too long"}}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events[0].data.code).toBe('ERR_001')
    const details = events[0].data.details as Record<string, string>
    expect(details.field).toBe('message')
    expect(details.reason).toBe('too long')
  })

  test('special characters in content: newlines, tabs, quotes', () => {
    const chunk = 'event: token\ndata: {"content":"line1\\nline2\\ttab\\"quote"}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(1)
    expect(events[0].data.content).toBe('line1\nline2\ttab"quote')
  })

  test('rapid succession: 20 token events', () => {
    const chunks = Array.from({ length: 20 }, (_, i) =>
      `event: token\ndata: {"content":"word${i} "}\n\n`
    ).join('')
    const events = parseSSEChunk(chunks)
    expect(events).toHaveLength(20)
    events.forEach((e, i) => {
      expect(e.event).toBe('token')
      expect(e.data.content).toBe(`word${i} `)
    })
  })

  test('extra whitespace around event type', () => {
    const chunk = 'event:  token  \ndata: {"content":"x"}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('token')
  })
})

// ============================================================
// P0: Stream State Machine
// ============================================================
describe('TEA P0: Stream State Machine Transitions', () => {
  type HubStreamState = 'idle' | 'accepted' | 'processing' | 'streaming' | 'error' | 'done'

  function nextState(current: HubStreamState, event: string): HubStreamState {
    switch (event) {
      case 'accepted': return 'accepted'
      case 'processing': return 'processing'
      case 'message':
      case 'token': return 'streaming'
      case 'error': return 'error'
      case 'done': return 'done'
      default: return current
    }
  }

  test('full happy path transition', () => {
    let state: HubStreamState = 'idle'
    state = nextState(state, 'accepted')
    expect(state).toBe('accepted')
    state = nextState(state, 'processing')
    expect(state).toBe('processing')
    state = nextState(state, 'token')
    expect(state).toBe('streaming')
    state = nextState(state, 'done')
    expect(state).toBe('done')
  })

  test('error from any state', () => {
    const states: HubStreamState[] = ['idle', 'accepted', 'processing', 'streaming']
    for (const s of states) {
      expect(nextState(s, 'error')).toBe('error')
    }
  })

  test('direct token without processing', () => {
    // Server might skip processing event
    let state: HubStreamState = 'accepted'
    state = nextState(state, 'token')
    expect(state).toBe('streaming')
  })

  test('unknown event preserves current state', () => {
    expect(nextState('processing', 'heartbeat')).toBe('processing')
    expect(nextState('streaming', 'unknown-event')).toBe('streaming')
  })

  test('done after error resets to done', () => {
    // Error followed by done (server cleanup)
    let state: HubStreamState = 'error'
    state = nextState(state, 'done')
    expect(state).toBe('done')
  })
})

// ============================================================
// P0: Secretary Detection Logic
// ============================================================
describe('TEA P0: Secretary Detection', () => {
  type Agent = {
    id: string
    name: string
    isSecretary: boolean
    isActive: boolean
    status: string
  }

  function findSecretary(agents: Agent[]): Agent | undefined {
    return agents.find((a) => a.isSecretary && a.isActive)
  }

  test('secretary found when isSecretary=true and isActive=true', () => {
    const agents: Agent[] = [
      { id: '1', name: 'CMO', isSecretary: false, isActive: true, status: 'online' },
      { id: '2', name: '비서실장', isSecretary: true, isActive: true, status: 'online' },
    ]
    const sec = findSecretary(agents)
    expect(sec).toBeDefined()
    expect(sec!.name).toBe('비서실장')
  })

  test('no secretary when isActive=false', () => {
    const agents: Agent[] = [
      { id: '1', name: '비서실장', isSecretary: true, isActive: false, status: 'offline' },
    ]
    expect(findSecretary(agents)).toBeUndefined()
  })

  test('no secretary when none exists', () => {
    const agents: Agent[] = [
      { id: '1', name: 'CMO', isSecretary: false, isActive: true, status: 'online' },
      { id: '2', name: 'CTO', isSecretary: false, isActive: true, status: 'online' },
    ]
    expect(findSecretary(agents)).toBeUndefined()
  })

  test('empty agents list', () => {
    expect(findSecretary([])).toBeUndefined()
  })

  test('first secretary returned when multiple exist (should not happen but defensive)', () => {
    const agents: Agent[] = [
      { id: '1', name: '비서1', isSecretary: true, isActive: true, status: 'online' },
      { id: '2', name: '비서2', isSecretary: true, isActive: true, status: 'online' },
    ]
    const sec = findSecretary(agents)
    expect(sec!.name).toBe('비서1')
  })
})

// ============================================================
// P1: Handoff Chain Edge Cases
// ============================================================
describe('TEA P1: Handoff Chain Advanced Scenarios', () => {
  type HandoffEntry = {
    fromAgent: string
    toAgent: string
    toAgentId: string
    status: 'delegating' | 'completed' | 'failed'
    durationMs?: number
  }

  test('3-level deep delegation chain', () => {
    const chain: HandoffEntry[] = [
      { fromAgent: '비서실장', toAgent: 'CMO', toAgentId: 'a1', status: 'completed', durationMs: 2000 },
      { fromAgent: 'CMO', toAgent: '마케팅전문가', toAgentId: 'a2', status: 'completed', durationMs: 3000 },
      { fromAgent: '마케팅전문가', toAgent: '콘텐츠작가', toAgentId: 'a3', status: 'delegating' },
    ]
    expect(chain).toHaveLength(3)
    expect(chain.filter(h => h.status === 'completed')).toHaveLength(2)
    expect(chain.filter(h => h.status === 'delegating')).toHaveLength(1)
    // Total completed duration
    const totalMs = chain.filter(h => h.durationMs).reduce((sum, h) => sum + (h.durationMs || 0), 0)
    expect(totalMs).toBe(5000)
  })

  test('failed delegation in chain', () => {
    const chain: HandoffEntry[] = [
      { fromAgent: '비서실장', toAgent: 'CTO', toAgentId: 'a1', status: 'failed' },
    ]
    expect(chain[0].status).toBe('failed')
    // UI should show red indicator
    const hasFailure = chain.some(h => h.status === 'failed')
    expect(hasFailure).toBe(true)
  })

  test('empty chain (no delegations)', () => {
    const chain: HandoffEntry[] = []
    expect(chain).toHaveLength(0)
    const hasActive = chain.some(h => h.status === 'delegating')
    expect(hasActive).toBe(false)
  })

  test('duplicate agent IDs in chain (re-delegation)', () => {
    const chain: HandoffEntry[] = [
      { fromAgent: '비서실장', toAgent: 'CMO', toAgentId: 'a1', status: 'completed' },
      { fromAgent: '비서실장', toAgent: 'CMO', toAgentId: 'a1', status: 'delegating' },
    ]
    // Second delegation to same agent (rework scenario)
    expect(chain.filter(h => h.toAgentId === 'a1')).toHaveLength(2)
  })
})

// ============================================================
// P1: Streaming Text Accumulation
// ============================================================
describe('TEA P1: Streaming Text Accumulation', () => {
  test('token-by-token accumulation', () => {
    let text = ''
    const tokens = ['안', '녕', '하', '세', '요']
    for (const token of tokens) {
      text += token
    }
    expect(text).toBe('안녕하세요')
  })

  test('empty tokens ignored', () => {
    let text = ''
    const tokens = ['안녕', '', '', '하세요', '']
    for (const token of tokens) {
      if (token) text += token
    }
    expect(text).toBe('안녕하세요')
  })

  test('markdown code block streaming', () => {
    let text = ''
    const tokens = ['```', 'python\n', 'print("hello")', '\n```']
    for (const token of tokens) {
      text += token
    }
    expect(text).toContain('```python')
    expect(text).toContain('print("hello")')
  })
})

// ============================================================
// P1: Error Handling Scenarios
// ============================================================
describe('TEA P1: Error Handling', () => {
  test('error event with code and Korean message', () => {
    const chunk = 'event: error\ndata: {"code":"AGENT_SPAWN_FAILED","message":"비서실장 에이전트가 설정되지 않았습니다"}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events[0].data.code).toBe('AGENT_SPAWN_FAILED')
    expect(events[0].data.message).toContain('비서실장')
  })

  test('error followed by done event', () => {
    const chunk = [
      'event: error\ndata: {"code":"RATE_001","message":"요청 제한"}\n\n',
      'event: done\ndata: {"costUsd":0,"tokensUsed":0}\n\n',
    ].join('')
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(2)
    expect(events[0].event).toBe('error')
    expect(events[1].event).toBe('done')
    expect(events[1].data.costUsd).toBe(0)
  })

  test('error without message field', () => {
    const chunk = 'event: error\ndata: {"code":"UNKNOWN"}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events[0].data.message).toBeUndefined()
    // UI should use fallback message
  })
})

// ============================================================
// P1: Tool Call Tracking
// ============================================================
describe('TEA P1: Tool Call Lifecycle', () => {
  type HubToolCall = {
    toolId: string
    toolName: string
    status: 'running' | 'done'
    error?: boolean
  }

  test('tool start -> progress -> end lifecycle', () => {
    const tools: HubToolCall[] = []

    // Start
    tools.push({ toolId: 't1', toolName: 'web_search', status: 'running' })
    expect(tools[0].status).toBe('running')

    // End
    tools[0] = { ...tools[0], status: 'done' }
    expect(tools[0].status).toBe('done')
  })

  test('multiple concurrent tools', () => {
    const tools: HubToolCall[] = [
      { toolId: 't1', toolName: 'web_search', status: 'running' },
      { toolId: 't2', toolName: 'read_file', status: 'running' },
    ]
    expect(tools.filter(t => t.status === 'running')).toHaveLength(2)

    // Complete one
    tools[0] = { ...tools[0], status: 'done' }
    expect(tools.filter(t => t.status === 'running')).toHaveLength(1)
  })

  test('tool with error flag', () => {
    const tool: HubToolCall = { toolId: 't1', toolName: 'api_call', status: 'done', error: true }
    expect(tool.error).toBe(true)
    // UI should show red indicator
  })
})
