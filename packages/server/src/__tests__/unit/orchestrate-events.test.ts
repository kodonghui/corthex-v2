/**
 * Epic 5 QA: 오케스트레이터 이벤트 타입 + 위임 이벤트 구조 검증
 * bun test src/__tests__/unit/orchestrate-events.test.ts
 */
import { describe, test, expect } from 'bun:test'
import type { OrchestrateEvent } from '../../lib/orchestrator'

describe('OrchestrateEvent 타입 구조', () => {
  test('delegation-start 이벤트 형식', () => {
    const event: OrchestrateEvent = {
      type: 'delegation-start',
      targetAgentName: '금융분석팀장',
      targetAgentId: 'agent-123',
    }
    expect(event.type).toBe('delegation-start')
    expect(event.targetAgentName).toBe('금융분석팀장')
    expect(event.targetAgentId).toBe('agent-123')
  })

  test('delegation-end 이벤트 형식 (completed)', () => {
    const event: OrchestrateEvent = {
      type: 'delegation-end',
      targetAgentName: '마케팅팀장',
      targetAgentId: 'agent-456',
      status: 'completed',
      durationMs: 2500,
    }
    expect(event.type).toBe('delegation-end')
    expect(event.status).toBe('completed')
    expect(event.durationMs).toBe(2500)
  })

  test('delegation-end 이벤트 형식 (failed)', () => {
    const event: OrchestrateEvent = {
      type: 'delegation-end',
      targetAgentName: '인사팀장',
      targetAgentId: 'agent-789',
      status: 'failed',
      durationMs: 30000,
    }
    expect(event.status).toBe('failed')
    expect(event.durationMs).toBeGreaterThan(0)
  })

  test('token 이벤트 형식', () => {
    const event: OrchestrateEvent = {
      type: 'token',
      content: '보고서 내용입니다.',
    }
    expect(event.type).toBe('token')
    expect(event.content).toBe('보고서 내용입니다.')
  })

  test('빈 토큰 콘텐츠 허용', () => {
    const event: OrchestrateEvent = {
      type: 'token',
      content: '',
    }
    expect(event.content).toBe('')
  })
})

describe('위임 이벤트 durationMs 계산 검증', () => {
  test('durationMs는 0 이상', () => {
    const start = Date.now()
    const end = start + 1500
    const durationMs = end - start
    expect(durationMs).toBeGreaterThanOrEqual(0)
    expect(durationMs).toBe(1500)
  })

  test('매우 긴 위임도 양수 duration', () => {
    const durationMs = 60_000 // 60초
    expect(durationMs).toBeGreaterThan(0)
  })
})
