/**
 * SDK 모킹 헬퍼 데모 테스트 — Story 12.1
 *
 * mockSDK() 사용법 검증 + 다양한 시나리오
 * bun test src/__tests__/unit/sdk-mock-demo.test.ts
 */
import { describe, test, expect, beforeEach } from 'bun:test'
import {
  mockSDK,
  mockSDKSequential,
  createMockSessionContext,
  mockGetDB,
  mockToolPermission,
  createMockToolResult,
  createMockTool,
} from '../helpers'

// ═══════════════════════════════════════════════════════════════
// SDK 모킹 기본 테스트
// ═══════════════════════════════════════════════════════════════

describe('mockSDK — 기본 응답 모킹', () => {
  test('기본 텍스트 응답 생성', async () => {
    const { queryFn } = mockSDK({ responses: ['Hello from mock!'] })

    const result = queryFn()
    const events: any[] = []
    for await (const msg of result) {
      events.push(msg)
    }

    // assistant 메시지 + result 메시지
    expect(events.length).toBe(2)
    expect(events[0].type).toBe('assistant')
    expect(events[0].message.content[0].text).toBe('Hello from mock!')
    expect(events[1].type).toBe('result')
    expect(events[1].subtype).toBe('success')
  })

  test('다중 텍스트 응답', async () => {
    const { queryFn } = mockSDK({ responses: ['First', 'Second', 'Third'] })

    const events: any[] = []
    for await (const msg of queryFn()) {
      events.push(msg)
    }

    // 3 assistant + 1 result
    expect(events.length).toBe(4)
    expect(events[0].message.content[0].text).toBe('First')
    expect(events[1].message.content[0].text).toBe('Second')
    expect(events[2].message.content[0].text).toBe('Third')
    expect(events[3].type).toBe('result')
  })

  test('비용 + 토큰 보고', async () => {
    mockSDK({ responses: ['test'], costUsd: 0.05, tokensUsed: 1000 })

    const { query } = await import('@anthropic-ai/claude-agent-sdk')
    const events: any[] = []
    for await (const msg of query({ prompt: 'test', options: {} as any })) {
      events.push(msg)
    }

    const result = events.find((e: any) => e.type === 'result')
    expect(result.total_cost_usd).toBe(0.05)
    expect(result.usage.input_tokens).toBe(700)
    expect(result.usage.output_tokens).toBe(300)
  })
})

describe('mockSDK — 에러 시나리오', () => {
  test('SDK 에러 결과 (result.subtype=error)', async () => {
    const { queryFn } = mockSDK({ error: 'Rate limit exceeded' })

    const events: any[] = []
    for await (const msg of queryFn()) {
      events.push(msg)
    }

    const result = events.find((e: any) => e.type === 'result')
    expect(result.subtype).toBe('error')
    expect(result.error).toBe('Rate limit exceeded')
  })

  test('SDK 네트워크 에러 (thrown exception)', async () => {
    const { queryFn } = mockSDK({ throwError: new Error('Connection refused') })

    const events: any[] = []
    try {
      for await (const msg of queryFn()) {
        events.push(msg)
      }
      expect(true).toBe(false) // should not reach here
    } catch (err: any) {
      expect(err.message).toBe('Connection refused')
    }
  })
})

describe('mockSDK — 도구 호출 시뮬레이션', () => {
  test('call_agent 도구 호출', async () => {
    const { queryFn } = mockSDK({
      toolCalls: [
        { name: 'call_agent', input: { agentId: 'manager-1', message: 'Delegate this' } },
      ],
      responses: ['Task delegated successfully'],
    })

    const events: any[] = []
    for await (const msg of queryFn()) {
      events.push(msg)
    }

    // tool_use + text + result
    expect(events.length).toBe(3)
    expect(events[0].message.content[0].type).toBe('tool_use')
    expect(events[0].message.content[0].name).toBe('call_agent')
    expect(events[0].message.content[0].input.agentId).toBe('manager-1')
    expect(events[1].message.content[0].text).toBe('Task delegated successfully')
  })

  test('다중 도구 호출 + 응답', async () => {
    const { queryFn } = mockSDK({
      toolCalls: [
        { name: 'search_knowledge', input: { query: 'sales data' } },
        { name: 'call_agent', input: { agentId: 'analyst', message: 'Analyze' } },
      ],
      responses: ['Analysis complete'],
    })

    const events: any[] = []
    for await (const msg of queryFn()) {
      events.push(msg)
    }

    // 2 tool_use + 1 text + 1 result = 4
    expect(events.length).toBe(4)
    expect(events[0].message.content[0].name).toBe('search_knowledge')
    expect(events[1].message.content[0].name).toBe('call_agent')
  })
})

// ═══════════════════════════════════════════════════════════════
// Sequential SDK 모킹 (핸드오프 체인 테스트용)
// ═══════════════════════════════════════════════════════════════

describe('mockSDKSequential — 순차 응답', () => {
  test('각 query() 호출마다 다른 응답', async () => {
    const { queryFn } = mockSDKSequential([
      { responses: ['First call response'] },
      { responses: ['Second call response'] },
    ])

    // First call
    const events1: any[] = []
    for await (const msg of queryFn()) {
      events1.push(msg)
    }
    expect(events1[0].message.content[0].text).toBe('First call response')

    // Second call
    const events2: any[] = []
    for await (const msg of queryFn()) {
      events2.push(msg)
    }
    expect(events2[0].message.content[0].text).toBe('Second call response')
  })

  test('초과 호출 시 마지막 응답 반복', async () => {
    const { queryFn } = mockSDKSequential([
      { responses: ['Only response'] },
    ])

    // First call
    const events1: any[] = []
    for await (const msg of queryFn()) events1.push(msg)

    // Second call (should use last options)
    const events2: any[] = []
    for await (const msg of queryFn()) events2.push(msg)

    expect(events2[0].message.content[0].text).toBe('Only response')
  })
})

// ═══════════════════════════════════════════════════════════════
// SessionContext 팩토리 테스트
// ═══════════════════════════════════════════════════════════════

describe('createMockSessionContext', () => {
  test('기본값으로 유효한 SessionContext 생성', () => {
    const ctx = createMockSessionContext()

    expect(ctx.cliToken).toBe('mock-cli-token')
    expect(ctx.userId).toBe('test-user-id')
    expect(ctx.companyId).toBe('test-company-id')
    expect(ctx.depth).toBe(0)
    expect(ctx.maxDepth).toBe(3)
    expect(ctx.visitedAgents).toEqual(['test-agent'])
    expect(ctx.sessionId).toContain('test-session-')
    expect(ctx.startedAt).toBeGreaterThan(0)
  })

  test('오버라이드 적용', () => {
    const ctx = createMockSessionContext({
      companyId: 'custom-company',
      depth: 2,
      visitedAgents: ['secretary', 'manager'],
      runId: 'test-run-1',
    })

    expect(ctx.companyId).toBe('custom-company')
    expect(ctx.depth).toBe(2)
    expect(ctx.visitedAgents).toEqual(['secretary', 'manager'])
    // 오버라이드하지 않은 필드는 기본값
    expect(ctx.userId).toBe('test-user-id')
  })
})

// ═══════════════════════════════════════════════════════════════
// DB 모킹 테스트
// ═══════════════════════════════════════════════════════════════

describe('mockGetDB — DB 쿼리 모킹', () => {
  test('에이전트 목록 반환', async () => {
    const testAgents = [
      { id: 'agent-1', name: 'Secretary', role: 'secretary', companyId: 'c1' },
      { id: 'agent-2', name: 'Manager', role: 'manager', companyId: 'c1' },
    ]

    const { getDBMock } = mockGetDB({ data: { agents: testAgents } })

    const db = getDBMock('test-company')
    const agents = await db.agents()
    expect(agents).toEqual(testAgents)
  })

  test('agentById 단건 조회', async () => {
    const testAgents = [
      { id: 'agent-1', name: 'Secretary' },
      { id: 'agent-2', name: 'Manager' },
    ]

    const { getDBMock } = mockGetDB({ data: { agents: testAgents } })

    const db = getDBMock('test-company')
    const found = await db.agentById('agent-2')
    expect(found).toEqual([{ id: 'agent-2', name: 'Manager' }])
  })

  test('테넌트 격리 — 다른 companyId는 빈 결과', async () => {
    const { getDBMock } = mockGetDB({
      data: { agents: [{ id: '1', name: 'Test' }] },
      allowedCompanyId: 'company-A',
    })

    const dbA = getDBMock('company-A')
    const dbB = getDBMock('company-B')

    expect(await dbA.agents()).toHaveLength(1)
    expect(await dbB.agents()).toHaveLength(0)
  })

  test('companyId 없으면 에러', () => {
    const { getDBMock } = mockGetDB()
    expect(() => getDBMock('')).toThrow('companyId required')
  })

  test('DB 에러 시뮬레이션', async () => {
    const { getDBMock } = mockGetDB({ errorOn: ['agents'] })

    const db = getDBMock('test-company')
    try {
      await db.agents()
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err.message).toBe('DB error on agents')
    }
  })
})

// ═══════════════════════════════════════════════════════════════
// 도구 모킹 테스트
// ═══════════════════════════════════════════════════════════════

describe('도구 모킹 헬퍼', () => {
  test('도구 권한 허용', async () => {
    const { guardFn } = mockToolPermission({ allow: true })
    const result = await guardFn()
    expect(result.allow).toBe(true)
  })

  test('도구 권한 거부', async () => {
    const { guardFn } = mockToolPermission({ allow: false, reason: 'Not allowed' })
    const result = await guardFn()
    expect(result.allow).toBe(false)
    expect(result.reason).toBe('Not allowed')
  })

  test('도구 실행 결과 생성 (성공)', () => {
    const result = createMockToolResult({ name: 'search_knowledge', result: { data: 'found' } })
    expect(result.success).toBe(true)
    expect(result.name).toBe('search_knowledge')
    expect(result.result).toEqual({ data: 'found' })
  })

  test('도구 실행 결과 생성 (실패)', () => {
    const result = createMockToolResult({ name: 'bad_tool', error: 'Permission denied' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Permission denied')
  })

  test('mock Tool 정의 생성', () => {
    const tool = createMockTool({ name: 'custom_tool', description: 'Does things' })
    expect(tool.name).toBe('custom_tool')
    expect(tool.description).toBe('Does things')
    expect(tool.inputSchema).toBeDefined()
  })
})
