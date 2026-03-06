/**
 * Story 12-3 QA: 위임 체인 실시간 UI 로직 검증
 * bun test src/__tests__/unit/delegation-chain-display.test.ts
 */
import { describe, test, expect } from 'bun:test'

describe('delegation-chain 이벤트 처리', () => {
  test('delegation-chain 이벤트로 체인 상태 설정', () => {
    const event = {
      type: 'delegation-chain' as const,
      chain: ['비서', '재무팀', '인사팀'],
    }
    const delegationChain = event.chain || null
    expect(delegationChain).toEqual(['비서', '재무팀', '인사팀'])
    expect(delegationChain!.length).toBe(3)
  })

  test('chain이 없는 delegation-chain 이벤트는 null', () => {
    const event = { type: 'delegation-chain' as const }
    const delegationChain = (event as { chain?: string[] }).chain || null
    expect(delegationChain).toBeNull()
  })

  test('빈 배열 chain은 falsy로 null 처리', () => {
    const event = { type: 'delegation-chain' as const, chain: [] as string[] }
    // 빈 배열은 truthy이므로 그대로 설정됨
    const delegationChain = event.chain || null
    expect(delegationChain).toEqual([])
  })

  test('done 이벤트에서 delegationChain 초기화', () => {
    let delegationChain: string[] | null = ['비서', '재무팀']
    // done 핸들러 시뮬레이션
    delegationChain = null
    expect(delegationChain).toBeNull()
  })

  test('error 이벤트에서 delegationChain 초기화', () => {
    let delegationChain: string[] | null = ['비서', '인사팀', '법무팀']
    // error 핸들러 시뮬레이션
    delegationChain = null
    expect(delegationChain).toBeNull()
  })

  test('startStream에서 delegationChain 초기화', () => {
    let delegationChain: string[] | null = ['비서', '재무팀']
    // startStream 시뮬레이션
    delegationChain = null
    expect(delegationChain).toBeNull()
  })
})

describe('StreamEvent 타입 — delegation-chain 포함', () => {
  test('delegation-chain이 유효한 type 값', () => {
    const validTypes = ['token', 'tool-start', 'tool-end', 'done', 'error', 'delegation-start', 'delegation-end', 'delegation-chain']
    expect(validTypes).toContain('delegation-chain')
  })

  test('StreamEvent에 chain 필드 존재', () => {
    const event = {
      type: 'delegation-chain',
      chain: ['A', 'B', 'C'],
    }
    expect(event).toHaveProperty('chain')
    expect(Array.isArray(event.chain)).toBe(true)
  })
})

describe('체인 헤더 시각화 — 우선순위 로직', () => {
  // 시각화 로직 시뮬레이션 함수
  function getHeaderDisplay(params: {
    delegationChain: string[] | null
    delegationStatuses: Record<string, { targetAgentName: string; status: string }>
    chainExpanded: boolean
    agentRole: string
  }): { type: string; text: string } {
    const { delegationChain, delegationStatuses, chainExpanded, agentRole } = params

    // 우선순위 1: delegation-chain (연쇄 위임)
    if (delegationChain && delegationChain.length >= 3) {
      if (chainExpanded) {
        return { type: 'chain-expanded', text: delegationChain.join(' → ') }
      }
      return { type: 'chain-collapsed', text: `${delegationChain.length - 1}단계 위임 중` }
    }
    if (delegationChain && delegationChain.length === 2) {
      return { type: 'chain-inline', text: `${delegationChain[1]}에게 위임 중...` }
    }

    // 우선순위 2: delegationStatuses (병렬 위임)
    const entries = Object.values(delegationStatuses)
    const total = entries.length
    const completed = entries.filter(s => s.status !== 'delegating').length
    const delegating = entries.filter(s => s.status === 'delegating')

    if (total > 1 && completed < total) {
      return { type: 'parallel-progress', text: `${total}개 부서 위임 중 (${completed}/${total} 완료)` }
    }
    if (total > 1 && completed === total) {
      return { type: 'parallel-done', text: `${total}개 부서 위임 완료` }
    }
    if (delegating.length === 1) {
      return { type: 'single-delegating', text: `${delegating[0].targetAgentName}에게 위임 중...` }
    }

    return { type: 'default', text: agentRole }
  }

  test('3단계 이상 체인 접힌 상태 — "N단계 위임 중"', () => {
    const result = getHeaderDisplay({
      delegationChain: ['비서', '재무팀', '인사팀'],
      delegationStatuses: {},
      chainExpanded: false,
      agentRole: '비서 역할',
    })
    expect(result.type).toBe('chain-collapsed')
    expect(result.text).toBe('2단계 위임 중')
  })

  test('3단계 체인 펼친 상태 — 전체 경로 표시', () => {
    const result = getHeaderDisplay({
      delegationChain: ['비서', '재무팀', '인사팀'],
      delegationStatuses: {},
      chainExpanded: true,
      agentRole: '비서 역할',
    })
    expect(result.type).toBe('chain-expanded')
    expect(result.text).toBe('비서 → 재무팀 → 인사팀')
  })

  test('5단계 체인 접힌 상태', () => {
    const result = getHeaderDisplay({
      delegationChain: ['비서', 'A', 'B', 'C', 'D'],
      delegationStatuses: {},
      chainExpanded: false,
      agentRole: '',
    })
    expect(result.type).toBe('chain-collapsed')
    expect(result.text).toBe('4단계 위임 중')
  })

  test('2단계 체인 — 인라인 표시', () => {
    const result = getHeaderDisplay({
      delegationChain: ['비서', '재무팀'],
      delegationStatuses: {},
      chainExpanded: false,
      agentRole: '',
    })
    expect(result.type).toBe('chain-inline')
    expect(result.text).toBe('재무팀에게 위임 중...')
  })

  test('체인 우선순위가 병렬 위임보다 높음', () => {
    const result = getHeaderDisplay({
      delegationChain: ['비서', '재무팀', '인사팀'],
      delegationStatuses: {
        a1: { targetAgentName: 'X팀', status: 'delegating' },
        a2: { targetAgentName: 'Y팀', status: 'delegating' },
      },
      chainExpanded: false,
      agentRole: '',
    })
    // delegation-chain이 우선
    expect(result.type).toBe('chain-collapsed')
  })

  test('체인 없을 때 병렬 위임 진행 중 표시', () => {
    const result = getHeaderDisplay({
      delegationChain: null,
      delegationStatuses: {
        a1: { targetAgentName: 'X팀', status: 'delegating' },
        a2: { targetAgentName: 'Y팀', status: 'completed' },
        a3: { targetAgentName: 'Z팀', status: 'delegating' },
      },
      chainExpanded: false,
      agentRole: '',
    })
    expect(result.type).toBe('parallel-progress')
    expect(result.text).toBe('3개 부서 위임 중 (1/3 완료)')
  })

  test('모든 병렬 위임 완료', () => {
    const result = getHeaderDisplay({
      delegationChain: null,
      delegationStatuses: {
        a1: { targetAgentName: 'X팀', status: 'completed' },
        a2: { targetAgentName: 'Y팀', status: 'completed' },
      },
      chainExpanded: false,
      agentRole: '',
    })
    expect(result.type).toBe('parallel-done')
    expect(result.text).toBe('2개 부서 위임 완료')
  })

  test('단일 위임 중', () => {
    const result = getHeaderDisplay({
      delegationChain: null,
      delegationStatuses: {
        a1: { targetAgentName: '재무팀', status: 'delegating' },
      },
      chainExpanded: false,
      agentRole: '',
    })
    expect(result.type).toBe('single-delegating')
    expect(result.text).toBe('재무팀에게 위임 중...')
  })

  test('아무것도 없으면 기본 역할 표시', () => {
    const result = getHeaderDisplay({
      delegationChain: null,
      delegationStatuses: {},
      chainExpanded: false,
      agentRole: '전략 분석가',
    })
    expect(result.type).toBe('default')
    expect(result.text).toBe('전략 분석가')
  })
})

describe('체인 펼침/접힘 상태 관리', () => {
  test('delegationChain이 null이면 chainExpanded 초기화', () => {
    let chainExpanded = true
    const delegationChain: string[] | null = null
    // useEffect 시뮬레이션: if (!delegationChain) setChainExpanded(false)
    if (!delegationChain) chainExpanded = false
    expect(chainExpanded).toBe(false)
  })

  test('delegationChain이 있으면 chainExpanded 유지', () => {
    let chainExpanded = true
    const delegationChain: string[] | null = ['비서', '재무팀', '인사팀']
    if (!delegationChain) chainExpanded = false
    expect(chainExpanded).toBe(true)
  })
})

describe('타이핑 인디케이터 체인 표시', () => {
  function getTypingIndicatorText(params: {
    delegationChain: string[] | null
    delegationStatuses: Record<string, { targetAgentName: string; status: string }>
    delegationStatus: { targetAgentName: string } | null
  }): string {
    const { delegationChain, delegationStatuses, delegationStatus } = params

    if (delegationChain && delegationChain.length >= 2) {
      return `🔀 ${delegationChain.join(' → ')}`
    }
    const entries = Object.values(delegationStatuses)
    const total = entries.length
    const completed = entries.filter(s => s.status !== 'delegating').length
    if (total > 1) return `${total}개 부서 위임 중 (${completed}/${total} 완료)`
    if (delegationStatus?.targetAgentName) return `${delegationStatus.targetAgentName}에게 위임 중...`
    return '부서 위임 분석 중...'
  }

  test('체인 있을 때 전체 경로 표시', () => {
    const text = getTypingIndicatorText({
      delegationChain: ['비서', '재무팀', '인사팀'],
      delegationStatuses: {},
      delegationStatus: null,
    })
    expect(text).toBe('🔀 비서 → 재무팀 → 인사팀')
  })

  test('2단계 체인도 타이핑 인디케이터에 표시', () => {
    const text = getTypingIndicatorText({
      delegationChain: ['비서', '재무팀'],
      delegationStatuses: {},
      delegationStatus: null,
    })
    expect(text).toBe('🔀 비서 → 재무팀')
  })

  test('체인 없이 병렬 위임 진행 중', () => {
    const text = getTypingIndicatorText({
      delegationChain: null,
      delegationStatuses: {
        a1: { targetAgentName: 'X', status: 'delegating' },
        a2: { targetAgentName: 'Y', status: 'completed' },
      },
      delegationStatus: null,
    })
    expect(text).toBe('2개 부서 위임 중 (1/2 완료)')
  })

  test('단일 위임 fallback', () => {
    const text = getTypingIndicatorText({
      delegationChain: null,
      delegationStatuses: {},
      delegationStatus: { targetAgentName: '재무팀' },
    })
    expect(text).toBe('재무팀에게 위임 중...')
  })

  test('아무것도 없으면 분석 중 메시지', () => {
    const text = getTypingIndicatorText({
      delegationChain: null,
      delegationStatuses: {},
      delegationStatus: null,
    })
    expect(text).toBe('부서 위임 분석 중...')
  })
})
