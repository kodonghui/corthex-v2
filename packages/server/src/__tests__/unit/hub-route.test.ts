import { describe, test, expect, mock, beforeEach, spyOn } from 'bun:test'

// Mock dependencies before importing
const mockAgentById = mock(() => Promise.resolve([{
  id: '00000000-0000-0000-0000-000000000001',
  name: '투자분석팀장',
  nameEn: 'Investment-Lead',
  soul: 'You are an investment analyst.',
  tier: 'manager',
  isSecretary: false,
}]))

const mockAgents = mock(() => Promise.resolve([
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'H-비서',
    nameEn: 'Secretary',
    soul: 'You are a secretary.',
    tier: 'manager',
    isSecretary: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: '투자분석팀장',
    nameEn: 'Investment-Lead',
    soul: 'You are an investment analyst.',
    tier: 'manager',
    isSecretary: false,
  },
]))

mock.module('../../db/scoped-query', () => ({
  getDB: () => ({
    agentById: mockAgentById,
    agents: mockAgents,
  }),
}))

mock.module('../../engine/soul-renderer', () => ({
  renderSoul: mock(() => Promise.resolve('Rendered soul content')),
}))

// Mock runAgent as an AsyncGenerator
const mockRunAgent = mock(async function* () {
  yield { type: 'accepted', sessionId: 'test-session' }
  yield { type: 'processing', agentName: 'H-비서' }
  yield { type: 'message', content: '테스트 응답입니다.' }
  yield { type: 'done', costUsd: 0.001, tokensUsed: 100 }
})

mock.module('../../engine/agent-loop', () => ({
  runAgent: mockRunAgent,
}))

mock.module('../../engine/sse-adapter', () => ({
  sseStream: async function* (events: AsyncGenerator<any>) {
    for await (const event of events) {
      const { type, ...data } = event
      yield `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`
    }
  },
}))

mock.module('../../middleware/auth', () => ({
  authMiddleware: mock(async (c: any, next: any) => {
    c.set('tenant', {
      companyId: 'company-1',
      userId: 'user-1',
      role: 'admin',
    })
    await next()
  }),
}))

// Import after mocks
const { hubRoute } = await import('../../routes/workspace/hub')
import { Hono } from 'hono'
import type { AppEnv } from '../../types'

const app = new Hono<AppEnv>()
app.route('/api/workspace/hub', hubRoute)

beforeEach(() => {
  mockAgentById.mockClear()
  mockAgents.mockClear()
  mockRunAgent.mockClear()
})

describe('hub.ts — SSE streaming entry point (Story 4.1)', () => {

  test('POST /stream with @mention targets correct agent', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '@투자분석팀장 시장 분석해줘' }),
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/event-stream')

    const body = await res.text()
    expect(body).toContain('event: accepted')
    expect(body).toContain('event: done')
  })

  test('POST /stream without @mention routes to secretary', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '오늘 시장 상황 알려줘' }),
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/event-stream')

    const body = await res.text()
    expect(body).toContain('event: accepted')
  })

  test('POST /stream with explicit agentId uses that agent', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '분석해줘', agentId: '00000000-0000-0000-0000-000000000001' }),
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/event-stream')
    expect(mockAgentById).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001')
  })

  test('POST /stream with unknown @mention returns SSE error', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '@없는에이전트 뭐해' }),
    })
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('event: error')
    expect(body).toContain('AGENT_SPAWN_FAILED')
  })

  test('POST /stream without secretary returns SSE error', async () => {
    mockAgents.mockImplementationOnce(() => Promise.resolve([
      { id: '00000000-0000-0000-0000-000000000001', name: '팀장', nameEn: 'Lead', soul: '', tier: 'manager', isSecretary: false },
    ]))

    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '안녕하세요' }),
    })
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('event: error')
    expect(body).toContain('AGENT_SPAWN_FAILED')
  })

  test('POST /stream returns SSE headers', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '테스트', agentId: '00000000-0000-0000-0000-000000000001' }),
    })
    expect(res.headers.get('Content-Type')).toBe('text/event-stream')
    expect(res.headers.get('Cache-Control')).toBe('no-cache')
  })

  test('POST /stream validates empty message', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' }),
    })
    expect(res.status).toBe(400)
  })

  test('SSE event format is correct', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '테스트', agentId: '00000000-0000-0000-0000-000000000001' }),
    })
    const body = await res.text()
    // Check SSE format: "event: type\ndata: JSON\n\n"
    const events = body.split('\n\n').filter(Boolean)
    expect(events.length).toBeGreaterThanOrEqual(2) // at least accepted + done
    for (const event of events) {
      expect(event).toMatch(/^event: \w+\ndata: .+/)
    }
  })
})

describe('parseMention', () => {
  // Test via integration since parseMention is not exported
  test('@mention with Korean name is parsed', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '@투자분석팀장 보고서' }),
    })
    expect(res.status).toBe(200)
    // agents() is called for @mention lookup
    expect(mockAgents).toHaveBeenCalled()
  })

  test('@mention with English name is parsed', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '@Investment-Lead report' }),
    })
    expect(res.status).toBe(200)
    expect(mockAgents).toHaveBeenCalled()
  })

  test('mid-string @ does NOT trigger @mention (anchored to start)', async () => {
    // "이메일은 test@example.com" should NOT be parsed as @mention
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '이메일은 test@example.com 입니다' }),
    })
    expect(res.status).toBe(200)
    // Should route to secretary (no @mention detected at start)
    const body = await res.text()
    expect(body).toContain('event: accepted')
    // mockAgents called for secretary lookup, NOT for @mention
    expect(mockAgentById).not.toHaveBeenCalled()
  })
})

describe('TEA P0: simplify fixes verification', () => {
  test('visitedAgents uses agent ID not name (simplify fix #1)', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '@투자분석팀장 분석해' }),
    })
    expect(res.status).toBe(200)
    // Verify runAgent was called with ctx.visitedAgents containing UUID, not name
    expect(mockRunAgent).toHaveBeenCalled()
    const callArgs = mockRunAgent.mock.calls[0][0]
    expect(callArgs.ctx.visitedAgents[0]).toBe('00000000-0000-0000-0000-000000000001')
    // Should NOT be a name string
    expect(callArgs.ctx.visitedAgents[0]).not.toBe('투자분석팀장')
  })

  test('client-provided sessionId is used (simplify fix #2)', async () => {
    const clientSessionId = '11111111-1111-1111-1111-111111111111'
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '테스트', agentId: '00000000-0000-0000-0000-000000000001', sessionId: clientSessionId }),
    })
    expect(res.status).toBe(200)
    expect(mockRunAgent).toHaveBeenCalled()
    const callArgs = mockRunAgent.mock.calls[0][0]
    expect(callArgs.ctx.sessionId).toBe(clientSessionId)
  })

  test('auto-generated sessionId when none provided', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '테스트', agentId: '00000000-0000-0000-0000-000000000001' }),
    })
    expect(res.status).toBe(200)
    expect(mockRunAgent).toHaveBeenCalled()
    const callArgs = mockRunAgent.mock.calls[0][0]
    // Should be a valid UUID (auto-generated)
    expect(callArgs.ctx.sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  test('isActive filter excludes inactive agents from @mention (simplify fix #4)', async () => {
    mockAgents.mockImplementationOnce(() => Promise.resolve([
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'H-비서',
        nameEn: 'Secretary',
        soul: 'You are a secretary.',
        tier: 'manager',
        isSecretary: true,
        isActive: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: '투자분석팀장',
        nameEn: 'Investment-Lead',
        soul: 'You are inactive.',
        tier: 'manager',
        isSecretary: false,
        isActive: false,  // INACTIVE
      },
    ]))

    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '@투자분석팀장 보고서' }),
    })
    expect(res.status).toBe(200)
    const body = await res.text()
    // Should return error because agent is inactive
    expect(body).toContain('event: error')
    expect(body).toContain('AGENT_SPAWN_FAILED')
  })
})

describe('TEA P0: SessionContext construction', () => {
  test('SessionContext has correct structure', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '테스트', agentId: '00000000-0000-0000-0000-000000000001' }),
    })
    expect(res.status).toBe(200)
    expect(mockRunAgent).toHaveBeenCalled()
    const { ctx } = mockRunAgent.mock.calls[0][0]
    expect(ctx.userId).toBe('user-1')
    expect(ctx.companyId).toBe('company-1')
    expect(ctx.depth).toBe(0)
    expect(ctx.maxDepth).toBe(3)
    expect(ctx.startedAt).toBeGreaterThan(0)
    expect(Array.isArray(ctx.visitedAgents)).toBe(true)
  })

  test('renderSoul called with correct args', async () => {
    const { renderSoul } = await import('../../engine/soul-renderer')
    const mockRenderSoul = renderSoul as any

    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '@투자분석팀장 분석해줘' }),
    })
    expect(res.status).toBe(200)
    expect(mockRenderSoul).toHaveBeenCalledWith(
      'You are an investment analyst.',
      '00000000-0000-0000-0000-000000000001',
      'company-1'
    )
  })

  test('agent with null soul passes empty string', async () => {
    mockAgentById.mockImplementationOnce(() => Promise.resolve([{
      id: '00000000-0000-0000-0000-000000000001',
      name: '투자분석팀장',
      nameEn: 'Investment-Lead',
      soul: null,
      tier: 'manager',
      isSecretary: false,
    }]))

    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '테스트', agentId: '00000000-0000-0000-0000-000000000001' }),
    })
    expect(res.status).toBe(200)
    expect(mockRunAgent).toHaveBeenCalled()
    const { soul } = mockRunAgent.mock.calls[0][0]
    expect(soul).toBe('')
  })

  test('@mention strips mention from message (cleanText)', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '@투자분석팀장 시장 분석해줘' }),
    })
    expect(res.status).toBe(200)
    expect(mockRunAgent).toHaveBeenCalled()
    const { message } = mockRunAgent.mock.calls[0][0]
    expect(message).toBe('시장 분석해줘')
    // Should NOT contain the @mention prefix
    expect(message).not.toContain('@투자분석팀장')
  })
})

describe('TEA P0: agent resolution priority', () => {
  test('explicit agentId takes priority over @mention', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '@투자분석팀장 뭐해',
        agentId: '00000000-0000-0000-0000-000000000001',
      }),
    })
    expect(res.status).toBe(200)
    // agentById should be called (explicit path), not agents() for @mention
    expect(mockAgentById).toHaveBeenCalled()
  })

  test('sseErrorResponse includes done event', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '@없는에이전트 뭐해' }),
    })
    const body = await res.text()
    // Error response should include both error and done events
    expect(body).toContain('event: error')
    expect(body).toContain('event: done')
    expect(body).toContain('"costUsd":0')
    expect(body).toContain('"tokensUsed":0')
  })

  test('invalid JSON body returns 400', async () => {
    const res = await app.request('/api/workspace/hub/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    expect(res.status).toBe(400)
  })
})
