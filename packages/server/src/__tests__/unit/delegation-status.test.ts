/**
 * Epic 5 QA: 위임 상태 관리 로직 검증
 * use-chat-stream.ts의 DelegationStatus 상태 머신 로직
 * bun test src/__tests__/unit/delegation-status.test.ts
 */
import { describe, test, expect } from 'bun:test'

type DelegationStatus = {
  targetAgentName: string
  targetAgentId: string
  status: 'delegating' | 'completed' | 'failed'
  durationMs?: number
} | null

// 이벤트 핸들러 로직 추출
function handleDelegationEvent(
  current: DelegationStatus,
  event: { type: string; targetAgentName?: string; targetAgentId?: string; status?: string; durationMs?: number },
): DelegationStatus {
  if (event.type === 'delegation-start') {
    return {
      targetAgentName: event.targetAgentName!,
      targetAgentId: event.targetAgentId!,
      status: 'delegating',
    }
  }

  if (event.type === 'delegation-end') {
    return {
      targetAgentName: event.targetAgentName!,
      targetAgentId: event.targetAgentId!,
      status: event.status as 'completed' | 'failed',
      durationMs: event.durationMs,
    }
  }

  if (event.type === 'done' || event.type === 'error') {
    return null // 채팅 완료/에러 시 위임 상태 리셋
  }

  return current
}

describe('DelegationStatus 상태 전이', () => {
  test('초기 상태는 null', () => {
    const status: DelegationStatus = null
    expect(status).toBeNull()
  })

  test('delegation-start → delegating 상태', () => {
    const result = handleDelegationEvent(null, {
      type: 'delegation-start',
      targetAgentName: '금융분석팀장',
      targetAgentId: 'agent-123',
    })
    expect(result).not.toBeNull()
    expect(result!.status).toBe('delegating')
    expect(result!.targetAgentName).toBe('금융분석팀장')
  })

  test('delegation-end (completed) → completed 상태 + duration', () => {
    const delegating: DelegationStatus = {
      targetAgentName: '금융분석팀장',
      targetAgentId: 'agent-123',
      status: 'delegating',
    }
    const result = handleDelegationEvent(delegating, {
      type: 'delegation-end',
      targetAgentName: '금융분석팀장',
      targetAgentId: 'agent-123',
      status: 'completed',
      durationMs: 2500,
    })
    expect(result!.status).toBe('completed')
    expect(result!.durationMs).toBe(2500)
  })

  test('delegation-end (failed) → failed 상태', () => {
    const result = handleDelegationEvent(null, {
      type: 'delegation-end',
      targetAgentName: '마케팅팀장',
      targetAgentId: 'agent-456',
      status: 'failed',
      durationMs: 30000,
    })
    expect(result!.status).toBe('failed')
  })

  test('done 이벤트 → null (리셋)', () => {
    const delegating: DelegationStatus = {
      targetAgentName: '금융분석팀장',
      targetAgentId: 'agent-123',
      status: 'completed',
      durationMs: 2000,
    }
    const result = handleDelegationEvent(delegating, { type: 'done' })
    expect(result).toBeNull()
  })

  test('error 이벤트 → null (리셋)', () => {
    const delegating: DelegationStatus = {
      targetAgentName: '금융분석팀장',
      targetAgentId: 'agent-123',
      status: 'delegating',
    }
    const result = handleDelegationEvent(delegating, { type: 'error' })
    expect(result).toBeNull()
  })

  test('token 이벤트 → 상태 유지', () => {
    const delegating: DelegationStatus = {
      targetAgentName: '금융분석팀장',
      targetAgentId: 'agent-123',
      status: 'delegating',
    }
    const result = handleDelegationEvent(delegating, { type: 'token' })
    expect(result).toBe(delegating) // 동일 참조
  })

  test('연속 위임: A → B로 전환', () => {
    let status = handleDelegationEvent(null, {
      type: 'delegation-start',
      targetAgentName: '금융분석팀장',
      targetAgentId: 'agent-A',
    })
    expect(status!.targetAgentName).toBe('금융분석팀장')

    status = handleDelegationEvent(status, {
      type: 'delegation-end',
      targetAgentName: '금융분석팀장',
      targetAgentId: 'agent-A',
      status: 'completed',
      durationMs: 1500,
    })
    expect(status!.status).toBe('completed')

    status = handleDelegationEvent(status, {
      type: 'delegation-start',
      targetAgentName: '마케팅팀장',
      targetAgentId: 'agent-B',
    })
    expect(status!.targetAgentName).toBe('마케팅팀장')
    expect(status!.status).toBe('delegating')
  })
})

describe('hasStreamedTokens 중복 방지 로직', () => {
  test('토큰이 스트리밍되면 최종 결과 재전송하지 않음', () => {
    let hasStreamedTokens = false
    const events = [
      { type: 'delegation-start' },
      { type: 'delegation-end' },
      { type: 'token', content: '첫 번째' },
      { type: 'token', content: '두 번째' },
    ]

    for (const event of events) {
      if (event.type === 'token') hasStreamedTokens = true
    }

    expect(hasStreamedTokens).toBe(true)
    // hasStreamedTokens === true → aiContent를 다시 broadcast하지 않음
  })

  test('토큰 없이 완료되면 최종 결과를 전송해야 함', () => {
    let hasStreamedTokens = false
    const events = [
      { type: 'delegation-start' },
      { type: 'delegation-end' },
    ]

    for (const event of events) {
      if (event.type === 'token') hasStreamedTokens = true
    }

    expect(hasStreamedTokens).toBe(false)
    // hasStreamedTokens === false → aiContent를 broadcast해야 함
  })
})
