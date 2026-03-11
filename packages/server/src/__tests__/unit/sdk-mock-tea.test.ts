/**
 * TEA-generated tests for Story 12.1 — SDK 모킹 헬퍼 리스크 기반 커버리지
 *
 * Risk-based coverage expansion:
 * - P0: Edge cases in mockSDK (empty responses, null scenarios)
 * - P0: mockGetDB write operation verification
 * - P1: mockToolPermissionMap selective allow/deny
 * - P1: mockSDKSequential with mixed success/error
 *
 * bun test src/__tests__/unit/sdk-mock-tea.test.ts
 */
import { describe, test, expect } from 'bun:test'
import {
  mockSDK,
  mockSDKSequential,
  createMockSessionContext,
  mockGetDB,
  mockToolPermissionMap,
  createMockToolResult,
  createMockTool,
} from '../helpers'

// ═══════════════════════════════════════════════════════════════
// P0: SDK Mock Edge Cases
// ═══════════════════════════════════════════════════════════════

describe('TEA-P0: mockSDK edge cases', () => {
  test('빈 응답 배열 → result만 발생', async () => {
    const { queryFn } = mockSDK({ responses: [] })
    const events: any[] = []
    for await (const msg of queryFn()) events.push(msg)

    // No assistant messages, only result
    expect(events.length).toBe(1)
    expect(events[0].type).toBe('result')
    expect(events[0].subtype).toBe('success')
  })

  test('기본값 (옵션 없이 호출)', async () => {
    const { queryFn } = mockSDK()
    const events: any[] = []
    for await (const msg of queryFn()) events.push(msg)

    expect(events.length).toBe(2)
    expect(events[0].message.content[0].text).toBe('mocked response')
  })

  test('costUsd=0, tokensUsed=0 기본값 확인', async () => {
    const { queryFn } = mockSDK({ responses: ['test'] })
    const events: any[] = []
    for await (const msg of queryFn()) events.push(msg)

    const result = events.find((e: any) => e.type === 'result')
    expect(result.total_cost_usd).toBe(0)
    expect(result.usage.input_tokens).toBe(0)
    expect(result.usage.output_tokens).toBe(0)
  })

  test('빈 도구 호출 input 처리', async () => {
    const { queryFn } = mockSDK({
      toolCalls: [{ name: 'empty_tool', input: {} }],
      responses: ['done'],
    })
    const events: any[] = []
    for await (const msg of queryFn()) events.push(msg)

    expect(events[0].message.content[0].name).toBe('empty_tool')
    expect(events[0].message.content[0].input).toEqual({})
  })

  test('에러 + 비용이 동시에 보고됨', async () => {
    const { queryFn } = mockSDK({
      error: 'Token limit exceeded',
      costUsd: 0.10,
      tokensUsed: 5000,
    })
    const events: any[] = []
    for await (const msg of queryFn()) events.push(msg)

    const result = events.find((e: any) => e.type === 'result')
    expect(result.subtype).toBe('error')
    expect(result.total_cost_usd).toBe(0.10)
    expect(result.usage.input_tokens + result.usage.output_tokens).toBe(5000)
  })

  test('queryFn이 bun:test mock이므로 호출 횟수 추적 가능', () => {
    const { queryFn } = mockSDK({ responses: ['test'] })
    queryFn()
    queryFn()
    expect(queryFn).toHaveBeenCalledTimes(2)
  })
})

// ═══════════════════════════════════════════════════════════════
// P0: DB Mock Write Operation Verification
// ═══════════════════════════════════════════════════════════════

describe('TEA-P0: mockGetDB write operations', () => {
  test('insertAgent는 companyId 자동 주입', async () => {
    const { getDBMock } = mockGetDB()
    const db = getDBMock('company-X')

    const inserted = await db.insertAgent({ name: 'New Agent', role: 'specialist' } as any)
    expect(inserted[0].companyId).toBe('company-X')
    expect(inserted[0].name).toBe('New Agent')
  })

  test('updateAgent는 기존 데이터와 머지', async () => {
    const { getDBMock } = mockGetDB({
      data: { agents: [{ id: 'a1', name: 'Old Name', role: 'manager' }] },
    })
    const db = getDBMock('test')

    const updated = await db.updateAgent('a1', { name: 'New Name' } as any)
    expect(updated[0].name).toBe('New Name')
    expect(updated[0].role).toBe('manager')
  })

  test('deleteAgent는 삭제된 레코드 반환', async () => {
    const { getDBMock } = mockGetDB({
      data: { agents: [{ id: 'a1', name: 'To Delete' }] },
    })
    const db = getDBMock('test')

    const deleted = await db.deleteAgent('a1')
    expect(deleted).toHaveLength(1)
    expect(deleted[0].name).toBe('To Delete')
  })

  test('insertCostRecord 비용 기록', async () => {
    const { getDBMock } = mockGetDB()
    const db = getDBMock('company-Y')

    const cost = await db.insertCostRecord({ agentId: 'a1', costUsd: 0.05 } as any)
    expect(cost[0].companyId).toBe('company-Y')
    expect(cost[0].agentId).toBe('a1')
  })

  test('preset CRUD 전체 사이클', async () => {
    const { getDBMock } = mockGetDB({
      data: { presets: [{ id: 'p1', name: 'Quick Reply', userId: 'u1' }] },
    })
    const db = getDBMock('test')

    // Read
    const presets = await db.presetsByUser('u1')
    expect(presets).toHaveLength(1)

    // Insert
    const inserted = await db.insertPreset({ name: 'New Preset', userId: 'u1' } as any)
    expect(inserted[0].name).toBe('New Preset')

    // Update
    const updated = await db.updatePreset('p1', { name: 'Updated' } as any)
    expect(updated[0].name).toBe('Updated')

    // Delete
    await db.deletePreset('p1')
    // No error = success
  })

  test('write mock 함수는 호출 추적 가능', async () => {
    const { getDBMock } = mockGetDB()
    const db = getDBMock('test')

    await db.insertAgent({ name: 'A' } as any)
    await db.insertAgent({ name: 'B' } as any)

    expect(db.insertAgent).toHaveBeenCalledTimes(2)
  })
})

// ═══════════════════════════════════════════════════════════════
// P1: Tool Permission Map Selective Tests
// ═══════════════════════════════════════════════════════════════

describe('TEA-P1: mockToolPermissionMap', () => {
  test('허용된 도구만 통과', async () => {
    const { guardFn } = mockToolPermissionMap(['search_knowledge', 'call_agent'])

    const r1 = await guardFn('search_knowledge')
    const r2 = await guardFn('call_agent')
    const r3 = await guardFn('delete_data')

    expect(r1.allow).toBe(true)
    expect(r2.allow).toBe(true)
    expect(r3.allow).toBe(false)
    expect(r3.reason).toContain('delete_data')
  })

  test('빈 허용 목록 → 모든 도구 거부', async () => {
    const { guardFn } = mockToolPermissionMap([])

    const r = await guardFn('any_tool')
    expect(r.allow).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════
// P1: Sequential SDK Mock Mixed Scenarios
// ═══════════════════════════════════════════════════════════════

describe('TEA-P1: mockSDKSequential mixed success/error', () => {
  test('성공 → 에러 → 성공 순차', async () => {
    const { queryFn } = mockSDKSequential([
      { responses: ['First success'] },
      { error: 'Rate limited' },
      { responses: ['Recovered'] },
    ])

    // Call 1: success
    const e1: any[] = []
    for await (const msg of queryFn()) e1.push(msg)
    expect(e1.find((e: any) => e.type === 'result').subtype).toBe('success')

    // Call 2: error
    const e2: any[] = []
    for await (const msg of queryFn()) e2.push(msg)
    expect(e2.find((e: any) => e.type === 'result').subtype).toBe('error')

    // Call 3: success again
    const e3: any[] = []
    for await (const msg of queryFn()) e3.push(msg)
    expect(e3[0].message.content[0].text).toBe('Recovered')
  })

  test('도구호출 → 텍스트 순차', async () => {
    const { queryFn } = mockSDKSequential([
      { toolCalls: [{ name: 'search', input: { q: 'test' } }], responses: ['Found it'] },
      { responses: ['Plain text only'] },
    ])

    const e1: any[] = []
    for await (const msg of queryFn()) e1.push(msg)
    expect(e1[0].message.content[0].type).toBe('tool_use')

    const e2: any[] = []
    for await (const msg of queryFn()) e2.push(msg)
    expect(e2[0].message.content[0].type).toBe('text')
  })
})

// ═══════════════════════════════════════════════════════════════
// P1: createMockTool Edge Cases
// ═══════════════════════════════════════════════════════════════

describe('TEA-P1: createMockTool & createMockToolResult edge cases', () => {
  test('기본값 Tool 생성', () => {
    const tool = createMockTool()
    expect(tool.name).toBe('test-tool')
    expect(tool.description).toBe('A test tool')
    expect(tool.inputSchema.type).toBe('object')
  })

  test('결과 없이 성공 → 기본 result 문자열', () => {
    const result = createMockToolResult({ name: 'my_tool' })
    expect(result.success).toBe(true)
    expect(result.result).toBe('Result for my_tool')
  })

  test('SessionContext readonly 속성 보존', () => {
    const ctx = createMockSessionContext({ depth: 2 })
    // TypeScript readonly enforces this at compile time
    // Runtime check: values are what we set
    expect(ctx.depth).toBe(2)
    expect(ctx.maxDepth).toBe(3)
    expect(typeof ctx.sessionId).toBe('string')
    expect(typeof ctx.startedAt).toBe('number')
  })
})
