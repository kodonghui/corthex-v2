import { describe, test, expect, mock } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

// E9: SDK mocking — mock before importing agent-loop
mock.module('@anthropic-ai/claude-agent-sdk', () => ({
  query: mock((_params: any) => {
    async function* generate() {
      yield {
        type: 'assistant',
        message: { content: [{ type: 'text', text: 'Hello from mock' }] },
      }
      yield {
        type: 'result',
        subtype: 'success',
        total_cost_usd: 0.01,
        usage: { input_tokens: 100, output_tokens: 50 },
      }
    }
    return generate()
  }),
}))

import { runAgent, getActiveSessions } from '../../engine/agent-loop'
import type { SessionContext } from '../../engine/types'

function makeCtx(overrides?: Partial<SessionContext>): SessionContext {
  return {
    cliToken: 'test-token',
    userId: 'user-1',
    companyId: 'comp-1',
    depth: 0,
    sessionId: `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    startedAt: Date.now(),
    maxDepth: 5,
    visitedAgents: ['agent-1'],
    ...overrides,
  }
}

describe('agent-loop.ts (D6 단일 진입점)', () => {
  test('runAgent가 AsyncGenerator 반환', () => {
    const ctx = makeCtx()
    const gen = runAgent({ ctx, soul: 'Test soul', message: 'Hello' })
    expect(gen[Symbol.asyncIterator]).toBeDefined()
  })

  test('첫 번째 이벤트는 accepted, 두 번째는 processing', async () => {
    const ctx = makeCtx()
    const gen = runAgent({ ctx, soul: 'Test soul', message: 'Hello' })
    const first = await gen.next()
    expect(first.value).toEqual({ type: 'accepted', sessionId: ctx.sessionId })
    const second = await gen.next()
    expect(second.value).toEqual({ type: 'processing', agentName: 'agent-1' })
  })

  test('SDK 메시지가 SSEEvent로 변환', async () => {
    const ctx = makeCtx()
    const events: any[] = []
    for await (const event of runAgent({ ctx, soul: 'Test soul', message: 'Hello' })) {
      events.push(event)
    }
    expect(events[0].type).toBe('accepted')
    expect(events.some(e => e.type === 'message' && e.content === 'Hello from mock')).toBe(true)
    expect(events[events.length - 1].type).toBe('done')
    expect(events[events.length - 1].costUsd).toBe(0.01)
    expect(events[events.length - 1].tokensUsed).toBe(150)
  })

  test('세션 레지스트리 등록/해제', async () => {
    const ctx = makeCtx()
    const gen = runAgent({ ctx, soul: 'Test soul', message: 'Hello' })

    // After first yield, session should be registered
    await gen.next()
    expect(getActiveSessions().has(ctx.sessionId)).toBe(true)

    // Consume remaining events
    while (!(await gen.next()).done) {}

    // After completion, session should be removed
    expect(getActiveSessions().has(ctx.sessionId)).toBe(false)
  })

  test('getActiveSessions는 ReadonlyMap 반환', () => {
    const sessions = getActiveSessions()
    expect(sessions).toBeDefined()
    expect(typeof sessions.get).toBe('function')
    expect(typeof sessions.has).toBe('function')
  })
})

describe('TEA P0: cliToken null 처리 (NFR-S2)', () => {
  test('소스에 token = null 패턴 존재', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../engine/agent-loop.ts'), 'utf8'
    )
    expect(source).toContain('token = null')
  })
})

describe('TEA P0: 에러 시 AGENT_SPAWN_FAILED 코드 사용', () => {
  test('소스에 ERROR_CODES.AGENT_SPAWN_FAILED import + 사용', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../engine/agent-loop.ts'), 'utf8'
    )
    expect(source).toContain("import { ERROR_CODES } from '../lib/error-codes'")
    expect(source).toContain('ERROR_CODES.AGENT_SPAWN_FAILED')
  })
})

describe('TEA P1: variable shadowing 수정 확인', () => {
  test('catch 블록에서 errMessage 사용 (message 변수 shadowing 없음)', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../engine/agent-loop.ts'), 'utf8'
    )
    expect(source).toContain('const errMessage')
    // catch 블록 내에서 'const message'가 없어야 함
    const catchBlock = source.split('catch')[1]
    expect(catchBlock).not.toContain('const message')
  })
})
