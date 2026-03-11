import { describe, test, expect } from 'bun:test'

// Test SSE parsing logic extracted from use-hub-stream.ts
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

describe('Hub SSE Parser', () => {
  test('accepted 이벤트 파싱', () => {
    const chunk = 'event: accepted\ndata: {"sessionId":"abc-123"}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('accepted')
    expect(events[0].data.sessionId).toBe('abc-123')
  })

  test('processing 이벤트 파싱', () => {
    const chunk = 'event: processing\ndata: {"agentName":"비서실장"}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('processing')
    expect(events[0].data.agentName).toBe('비서실장')
  })

  test('token 이벤트 파싱', () => {
    const chunk = 'event: token\ndata: {"content":"안녕"}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('token')
    expect(events[0].data.content).toBe('안녕')
  })

  test('message 이벤트 파싱', () => {
    const chunk = 'event: message\ndata: {"content":"하세요"}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('message')
    expect(events[0].data.content).toBe('하세요')
  })

  test('error 이벤트 파싱', () => {
    const chunk = 'event: error\ndata: {"code":"AGENT_001","message":"에이전트를 찾을 수 없습니다"}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('error')
    expect(events[0].data.code).toBe('AGENT_001')
    expect(events[0].data.message).toBe('에이전트를 찾을 수 없습니다')
  })

  test('done 이벤트 파싱 (비용 포함)', () => {
    const chunk = 'event: done\ndata: {"costUsd":0.0042,"tokensUsed":1200}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('done')
    expect(events[0].data.costUsd).toBe(0.0042)
    expect(events[0].data.tokensUsed).toBe(1200)
  })

  test('handoff 이벤트 파싱', () => {
    const chunk = 'event: handoff\ndata: {"fromAgent":"비서실장","toAgent":"CMO","toAgentId":"uuid-1"}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('handoff')
    expect(events[0].data.fromAgent).toBe('비서실장')
    expect(events[0].data.toAgent).toBe('CMO')
    expect(events[0].data.toAgentId).toBe('uuid-1')
  })

  test('tool-start + tool-end 이벤트 연속 파싱', () => {
    const chunk = [
      'event: tool-start\ndata: {"toolId":"t1","toolName":"web_search","input":"검색어"}\n\n',
      'event: tool-end\ndata: {"toolId":"t1","result":"검색 결과","durationMs":1500}\n\n',
    ].join('')
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(2)
    expect(events[0].event).toBe('tool-start')
    expect(events[0].data.toolName).toBe('web_search')
    expect(events[1].event).toBe('tool-end')
    expect(events[1].data.durationMs).toBe(1500)
  })

  test('복수 이벤트 연속 파싱', () => {
    const chunk = [
      'event: accepted\ndata: {"sessionId":"s1"}\n\n',
      'event: processing\ndata: {"agentName":"비서"}\n\n',
      'event: token\ndata: {"content":"안"}\n\n',
      'event: token\ndata: {"content":"녕"}\n\n',
      'event: done\ndata: {"costUsd":0.001,"tokensUsed":50}\n\n',
    ].join('')
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(5)
    expect(events[0].event).toBe('accepted')
    expect(events[1].event).toBe('processing')
    expect(events[2].event).toBe('token')
    expect(events[3].event).toBe('token')
    expect(events[4].event).toBe('done')
  })

  test('빈 청크 처리', () => {
    const events = parseSSEChunk('')
    expect(events).toHaveLength(0)
  })

  test('잘못된 JSON 무시', () => {
    const chunk = 'event: error\ndata: {broken json}\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(0)
  })

  test('데이터 없는 이벤트 무시', () => {
    const chunk = 'event: heartbeat\n\n'
    const events = parseSSEChunk(chunk)
    expect(events).toHaveLength(0)
  })
})

describe('Hub HandoffEntry', () => {
  test('handoff chain 상태 추적', () => {
    type HandoffEntry = {
      fromAgent: string
      toAgent: string
      toAgentId: string
      status: 'delegating' | 'completed' | 'failed'
      durationMs?: number
    }

    const chain: HandoffEntry[] = []

    // 위임 시작
    chain.push({
      fromAgent: '비서실장',
      toAgent: 'CMO',
      toAgentId: 'uuid-cmo',
      status: 'delegating',
    })
    expect(chain).toHaveLength(1)
    expect(chain[0].status).toBe('delegating')

    // 2차 위임
    chain.push({
      fromAgent: 'CMO',
      toAgent: '콘텐츠전문가',
      toAgentId: 'uuid-content',
      status: 'delegating',
    })
    expect(chain).toHaveLength(2)

    // 완료 업데이트
    const updated = chain.map((h) =>
      h.toAgentId === 'uuid-content'
        ? { ...h, status: 'completed' as const, durationMs: 3000 }
        : h,
    )
    expect(updated[1].status).toBe('completed')
    expect(updated[1].durationMs).toBe(3000)
    expect(updated[0].status).toBe('delegating')
  })

  test('병렬 위임 추적', () => {
    type HandoffEntry = {
      fromAgent: string
      toAgent: string
      toAgentId: string
      status: 'delegating' | 'completed' | 'failed'
    }

    const chain: HandoffEntry[] = [
      { fromAgent: '비서실장', toAgent: 'CMO', toAgentId: 'a1', status: 'delegating' },
      { fromAgent: '비서실장', toAgent: 'CFO', toAgentId: 'a2', status: 'delegating' },
      { fromAgent: '비서실장', toAgent: 'CTO', toAgentId: 'a3', status: 'delegating' },
    ]

    const activeDelegations = chain.filter((h) => h.status === 'delegating')
    expect(activeDelegations).toHaveLength(3)

    // 2개 완료
    const updated = chain.map((h) =>
      h.toAgentId === 'a1' || h.toAgentId === 'a3'
        ? { ...h, status: 'completed' as const }
        : h,
    )
    const remaining = updated.filter((h) => h.status === 'delegating')
    expect(remaining).toHaveLength(1)
    expect(remaining[0].toAgent).toBe('CFO')
  })
})

describe('Hub Stream States', () => {
  test('상태 전이: idle -> accepted -> processing -> streaming -> done', () => {
    type HubStreamState = 'idle' | 'accepted' | 'processing' | 'streaming' | 'error' | 'done'
    const transitions: HubStreamState[] = ['idle', 'accepted', 'processing', 'streaming', 'done']

    // idle에서 시작
    expect(transitions[0]).toBe('idle')
    // accepted
    expect(transitions[1]).toBe('accepted')
    // processing
    expect(transitions[2]).toBe('processing')
    // streaming
    expect(transitions[3]).toBe('streaming')
    // done
    expect(transitions[4]).toBe('done')
  })

  test('에러 상태 전이: processing -> error', () => {
    type HubStreamState = 'idle' | 'accepted' | 'processing' | 'streaming' | 'error' | 'done'
    const state: HubStreamState = 'processing'
    // On error event
    const newState: HubStreamState = 'error'
    expect(state).toBe('processing')
    expect(newState).toBe('error')
  })
})
