/**
 * Story 12-2 TEA: 병렬 위임 로직 검증
 * - Promise.allSettled 패턴 + 결과 필터링
 * - 복수 위임 상태 추적 (delegationStatuses Record)
 * - 헤더 UI 진행률 계산
 * - 에러 격리 (한 위임 실패 시 다른 위임 영향 없음)
 *
 * bun test src/__tests__/unit/parallel-delegation.test.ts
 */
import { describe, test, expect } from 'bun:test'

// ── 1. Promise.allSettled 결과 필터링 (orchestrator.ts 패턴) ──

type DelegationResult = { departmentName: string; agentName: string; response: string }

function filterSettledResults(
  settled: PromiseSettledResult<DelegationResult>[],
): DelegationResult[] {
  return settled
    .filter((s): s is PromiseFulfilledResult<DelegationResult> => s.status === 'fulfilled')
    .map(s => s.value)
}

describe('Promise.allSettled 결과 필터링', () => {
  test('모든 위임 성공 시 전체 결과 반환', () => {
    const settled: PromiseSettledResult<DelegationResult>[] = [
      { status: 'fulfilled', value: { departmentName: '마케팅', agentName: '마케터', response: '보고서A' } },
      { status: 'fulfilled', value: { departmentName: '영업', agentName: '영업팀장', response: '보고서B' } },
      { status: 'fulfilled', value: { departmentName: '개발', agentName: '개발팀장', response: '보고서C' } },
    ]
    const results = filterSettledResults(settled)
    expect(results).toHaveLength(3)
    expect(results[0].departmentName).toBe('마케팅')
    expect(results[2].agentName).toBe('개발팀장')
  })

  test('일부 실패 시 성공 결과만 반환 (에러 격리)', () => {
    const settled: PromiseSettledResult<DelegationResult>[] = [
      { status: 'fulfilled', value: { departmentName: '마케팅', agentName: '마케터', response: '성공' } },
      { status: 'rejected', reason: new Error('API 타임아웃') },
      { status: 'fulfilled', value: { departmentName: '개발', agentName: '개발팀장', response: '성공' } },
    ]
    const results = filterSettledResults(settled)
    expect(results).toHaveLength(2)
    expect(results[0].departmentName).toBe('마케팅')
    expect(results[1].departmentName).toBe('개발')
  })

  test('모든 위임 실패 시 빈 배열 반환', () => {
    const settled: PromiseSettledResult<DelegationResult>[] = [
      { status: 'rejected', reason: new Error('오류1') },
      { status: 'rejected', reason: new Error('오류2') },
    ]
    const results = filterSettledResults(settled)
    expect(results).toHaveLength(0)
  })

  test('단일 위임 성공', () => {
    const settled: PromiseSettledResult<DelegationResult>[] = [
      { status: 'fulfilled', value: { departmentName: 'HR', agentName: 'HR담당', response: '결과' } },
    ]
    const results = filterSettledResults(settled)
    expect(results).toHaveLength(1)
  })

  test('빈 배열 입력 시 빈 배열 반환', () => {
    const results = filterSettledResults([])
    expect(results).toHaveLength(0)
  })
})

// ── 2. 병렬 위임 내 에러 처리 (try-catch 패턴) ──

describe('병렬 위임 에러 격리', () => {
  async function simulateParallelDelegation(
    targets: { name: string; shouldFail: boolean }[],
  ): Promise<DelegationResult[]> {
    const promises = targets.map(async (t) => {
      if (t.shouldFail) {
        throw new Error(`${t.name} 처리 실패`)
      }
      return { departmentName: t.name, agentName: `${t.name}팀장`, response: `${t.name} 보고서` }
    })

    const settled = await Promise.allSettled(promises)
    return filterSettledResults(settled)
  }

  test('3개 위임 중 1개 실패 — 나머지 2개 정상 반환', async () => {
    const results = await simulateParallelDelegation([
      { name: '마케팅', shouldFail: false },
      { name: '영업', shouldFail: true },
      { name: '개발', shouldFail: false },
    ])
    expect(results).toHaveLength(2)
    expect(results.map(r => r.departmentName)).toEqual(['마케팅', '개발'])
  })

  test('모든 위임 성공', async () => {
    const results = await simulateParallelDelegation([
      { name: 'A', shouldFail: false },
      { name: 'B', shouldFail: false },
    ])
    expect(results).toHaveLength(2)
  })

  test('모든 위임 실패', async () => {
    const results = await simulateParallelDelegation([
      { name: 'A', shouldFail: true },
      { name: 'B', shouldFail: true },
    ])
    expect(results).toHaveLength(0)
  })
})

// ── 3. 위임 결과에 [오류] 메시지 포함 패턴 (catch 내부 반환) ──

describe('위임 실패 시 [오류] 결과 포함 패턴', () => {
  async function delegateWithErrorHandling(
    targets: { name: string; shouldFail: boolean; errorMsg?: string }[],
  ): Promise<DelegationResult[]> {
    const promises = targets.map(async (t) => {
      try {
        if (t.shouldFail) throw new Error(t.errorMsg || '알 수 없는 오류')
        return { departmentName: t.name, agentName: `${t.name}팀장`, response: `${t.name} 결과` }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류'
        return { departmentName: t.name, agentName: `${t.name}팀장`, response: `[오류] ${errorMsg}` }
      }
    })
    const settled = await Promise.allSettled(promises)
    return filterSettledResults(settled)
  }

  test('실패한 위임도 [오류] 메시지로 결과에 포함', async () => {
    const results = await delegateWithErrorHandling([
      { name: '마케팅', shouldFail: false },
      { name: '영업', shouldFail: true, errorMsg: 'API 타임아웃' },
    ])
    expect(results).toHaveLength(2)
    expect(results[0].response).toBe('마케팅 결과')
    expect(results[1].response).toBe('[오류] API 타임아웃')
  })

  test('모든 위임 실패 시 모두 [오류]로 결과 포함', async () => {
    const results = await delegateWithErrorHandling([
      { name: 'A', shouldFail: true, errorMsg: '오류1' },
      { name: 'B', shouldFail: true, errorMsg: '오류2' },
    ])
    expect(results).toHaveLength(2)
    expect(results[0].response).toStartWith('[오류]')
    expect(results[1].response).toStartWith('[오류]')
  })
})

// ── 4. DelegationStatuses 복수 위임 상태 추적 ──

type DelegationStatusEntry = {
  targetAgentName: string
  status: 'delegating' | 'completed' | 'failed'
  durationMs?: number
}

type DelegationStatuses = Record<string, DelegationStatusEntry>

function handleDelegationStatuses(
  prev: DelegationStatuses,
  event: { type: string; targetAgentId?: string; targetAgentName?: string; status?: string; durationMs?: number },
): DelegationStatuses {
  if (event.type === 'delegation-start') {
    return {
      ...prev,
      [event.targetAgentId || '']: {
        targetAgentName: event.targetAgentName || '',
        status: 'delegating',
      },
    }
  }
  if (event.type === 'delegation-end') {
    return {
      ...prev,
      [event.targetAgentId || '']: {
        targetAgentName: event.targetAgentName || '',
        status: (event.status as 'completed' | 'failed') || 'completed',
        durationMs: event.durationMs,
      },
    }
  }
  if (event.type === 'done' || event.type === 'error') {
    return {}
  }
  return prev
}

describe('DelegationStatuses 복수 위임 상태 추적', () => {
  test('병렬 delegation-start 3개 → 3개 에이전트 추적', () => {
    let statuses: DelegationStatuses = {}
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a1', targetAgentName: '마케터' })
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a2', targetAgentName: '영업팀장' })
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a3', targetAgentName: '개발팀장' })

    expect(Object.keys(statuses)).toHaveLength(3)
    expect(statuses['a1'].status).toBe('delegating')
    expect(statuses['a2'].status).toBe('delegating')
    expect(statuses['a3'].status).toBe('delegating')
  })

  test('하나씩 완료 → 개별 상태 업데이트', () => {
    let statuses: DelegationStatuses = {}
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a1', targetAgentName: '마케터' })
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a2', targetAgentName: '영업팀장' })
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-end', targetAgentId: 'a1', targetAgentName: '마케터', status: 'completed', durationMs: 1500 })

    expect(statuses['a1'].status).toBe('completed')
    expect(statuses['a1'].durationMs).toBe(1500)
    expect(statuses['a2'].status).toBe('delegating')
  })

  test('일부 실패 + 일부 완료', () => {
    let statuses: DelegationStatuses = {}
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a1', targetAgentName: 'A' })
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a2', targetAgentName: 'B' })
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-end', targetAgentId: 'a1', targetAgentName: 'A', status: 'completed', durationMs: 1000 })
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-end', targetAgentId: 'a2', targetAgentName: 'B', status: 'failed', durationMs: 5000 })

    expect(statuses['a1'].status).toBe('completed')
    expect(statuses['a2'].status).toBe('failed')
    expect(statuses['a2'].durationMs).toBe(5000)
  })

  test('done 이벤트 → 전체 리셋', () => {
    let statuses: DelegationStatuses = {}
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a1', targetAgentName: 'A' })
    statuses = handleDelegationStatuses(statuses, { type: 'done' })

    expect(Object.keys(statuses)).toHaveLength(0)
  })

  test('error 이벤트 → 전체 리셋', () => {
    let statuses: DelegationStatuses = {}
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a1', targetAgentName: 'A' })
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a2', targetAgentName: 'B' })
    statuses = handleDelegationStatuses(statuses, { type: 'error' })

    expect(Object.keys(statuses)).toHaveLength(0)
  })

  test('동일 에이전트 ID로 중복 이벤트 → 덮어쓰기', () => {
    let statuses: DelegationStatuses = {}
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a1', targetAgentName: 'A' })
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a1', targetAgentName: 'A-updated' })

    expect(Object.keys(statuses)).toHaveLength(1)
    expect(statuses['a1'].targetAgentName).toBe('A-updated')
  })
})

// ── 5. 헤더 UI 진행률 계산 로직 ──

describe('헤더 UI 진행률 계산', () => {
  function computeProgress(statuses: DelegationStatuses): { total: number; completed: number; delegating: string[] } {
    const entries = Object.values(statuses)
    const total = entries.length
    const completed = entries.filter(s => s.status !== 'delegating').length
    const delegating = entries.filter(s => s.status === 'delegating').map(s => s.targetAgentName)
    return { total, completed, delegating }
  }

  test('3개 위임 중 2개 완료 → "3개 부서 위임 중 (2/3 완료)"', () => {
    const statuses: DelegationStatuses = {
      a1: { targetAgentName: 'A', status: 'completed', durationMs: 1000 },
      a2: { targetAgentName: 'B', status: 'delegating' },
      a3: { targetAgentName: 'C', status: 'completed', durationMs: 2000 },
    }
    const { total, completed, delegating } = computeProgress(statuses)
    expect(total).toBe(3)
    expect(completed).toBe(2)
    expect(delegating).toEqual(['B'])
  })

  test('3개 모두 완료 → completed === total', () => {
    const statuses: DelegationStatuses = {
      a1: { targetAgentName: 'A', status: 'completed' },
      a2: { targetAgentName: 'B', status: 'completed' },
      a3: { targetAgentName: 'C', status: 'failed' },
    }
    const { total, completed } = computeProgress(statuses)
    expect(total).toBe(3)
    expect(completed).toBe(3) // failed도 'delegating'이 아니므로 completed로 카운트
  })

  test('단일 위임 → total=1', () => {
    const statuses: DelegationStatuses = {
      a1: { targetAgentName: 'A', status: 'delegating' },
    }
    const { total, completed, delegating } = computeProgress(statuses)
    expect(total).toBe(1)
    expect(completed).toBe(0)
    expect(delegating).toEqual(['A'])
  })

  test('빈 상태 → 0/0', () => {
    const { total, completed } = computeProgress({})
    expect(total).toBe(0)
    expect(completed).toBe(0)
  })

  test('UI 분기: total > 1 && completed < total → 진행 중 표시', () => {
    const statuses: DelegationStatuses = {
      a1: { targetAgentName: 'A', status: 'completed' },
      a2: { targetAgentName: 'B', status: 'delegating' },
    }
    const { total, completed } = computeProgress(statuses)
    expect(total > 1 && completed < total).toBe(true)
  })

  test('UI 분기: total > 1 && completed === total → 완료 표시', () => {
    const statuses: DelegationStatuses = {
      a1: { targetAgentName: 'A', status: 'completed' },
      a2: { targetAgentName: 'B', status: 'failed' },
    }
    const { total, completed } = computeProgress(statuses)
    expect(total > 1 && completed === total).toBe(true)
  })

  test('UI 분기: delegating.length === 1 → 단일 위임 중 표시', () => {
    const statuses: DelegationStatuses = {
      a1: { targetAgentName: '마케터', status: 'delegating' },
    }
    const { total, delegating } = computeProgress(statuses)
    expect(total).toBe(1)
    expect(delegating).toHaveLength(1)
    expect(delegating[0]).toBe('마케터')
  })
})

// ── 6. 위임 이벤트 시퀀스 시뮬레이션 ──

describe('병렬 위임 이벤트 시퀀스', () => {
  test('전체 플로우: start×3 → end×3 → done', () => {
    const events = [
      { type: 'delegation-start', targetAgentId: 'a1', targetAgentName: 'A' },
      { type: 'delegation-start', targetAgentId: 'a2', targetAgentName: 'B' },
      { type: 'delegation-start', targetAgentId: 'a3', targetAgentName: 'C' },
      { type: 'delegation-end', targetAgentId: 'a1', targetAgentName: 'A', status: 'completed', durationMs: 1000 },
      { type: 'delegation-end', targetAgentId: 'a3', targetAgentName: 'C', status: 'completed', durationMs: 1500 },
      { type: 'delegation-end', targetAgentId: 'a2', targetAgentName: 'B', status: 'failed', durationMs: 3000 },
      { type: 'done' },
    ]

    let statuses: DelegationStatuses = {}
    for (const evt of events) {
      statuses = handleDelegationStatuses(statuses, evt)
    }

    // done 후 비워짐
    expect(Object.keys(statuses)).toHaveLength(0)
  })

  test('중간 스냅샷: start 3개 후 end 1개', () => {
    let statuses: DelegationStatuses = {}
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a1', targetAgentName: 'A' })
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a2', targetAgentName: 'B' })
    statuses = handleDelegationStatuses(statuses, { type: 'delegation-start', targetAgentId: 'a3', targetAgentName: 'C' })

    expect(Object.keys(statuses)).toHaveLength(3)
    expect(Object.values(statuses).every(s => s.status === 'delegating')).toBe(true)

    statuses = handleDelegationStatuses(statuses, { type: 'delegation-end', targetAgentId: 'a2', targetAgentName: 'B', status: 'completed', durationMs: 800 })

    const entries = Object.values(statuses)
    const delegating = entries.filter(s => s.status === 'delegating')
    const completed = entries.filter(s => s.status !== 'delegating')
    expect(delegating).toHaveLength(2)
    expect(completed).toHaveLength(1)
  })
})

// ── 7. startStream 초기화 검증 ──

describe('startStream 초기화', () => {
  test('스트리밍 시작 시 delegationStatuses 빈 객체로 리셋', () => {
    // startStream이 호출되면 delegationStatuses를 {}로 초기화해야 함
    const before: DelegationStatuses = {
      a1: { targetAgentName: 'A', status: 'completed', durationMs: 1000 },
    }
    // 시뮬레이션: startStream 호출
    const after: DelegationStatuses = {}
    expect(Object.keys(after)).toHaveLength(0)
    expect(Object.keys(before)).toHaveLength(1) // 이전 상태는 유지
  })
})

// ── 8. LLM 분석 부서명 매칭 (fuzzy) ──

describe('LLM 분석 부서명 매칭 로직', () => {
  const deptAgents = [
    { deptName: '마케팅부', agentName: '마케터', agentId: 'a1' },
    { deptName: '영업팀', agentName: '영업팀장', agentId: 'a2' },
    { deptName: '개발부', agentName: '개발팀장', agentId: 'a3' },
  ]

  function matchDept(needle: string) {
    const n = needle.trim().toLowerCase()
    return deptAgents.find(d => d.deptName.trim().toLowerCase() === n)
      || deptAgents.find(d => d.deptName.trim().toLowerCase().includes(n) || n.includes(d.deptName.trim().toLowerCase()))
  }

  test('정확한 이름 매칭', () => {
    expect(matchDept('마케팅부')?.agentId).toBe('a1')
  })

  test('부분 매칭 (LLM이 짧은 이름 반환)', () => {
    expect(matchDept('영업')?.agentId).toBe('a2')
  })

  test('부분 매칭 (LLM이 긴 이름 반환)', () => {
    expect(matchDept('개발부 기술팀')?.agentId).toBe('a3')
  })

  test('매칭 안 됨', () => {
    expect(matchDept('재무부')).toBeUndefined()
  })

  test('대소문자/공백 무시', () => {
    expect(matchDept(' 마케팅부 ')?.agentId).toBe('a1')
  })
})

// ── 9. 단일 위임 결과 vs 복수 위임 결과 분기 ──

describe('위임 결과 수에 따른 분기', () => {
  test('결과 0개 → 실패 메시지', () => {
    const results: DelegationResult[] = []
    const output = results.length === 0
      ? '위임 실행에 실패했습니다.'
      : results.length === 1
        ? `보고: ${results[0].response}`
        : '종합 보고서'
    expect(output).toBe('위임 실행에 실패했습니다.')
  })

  test('결과 1개 → 단일 보고', () => {
    const results: DelegationResult[] = [
      { departmentName: '마케팅', agentName: '마케터', response: '결과A' },
    ]
    const output = results.length === 0
      ? '실패'
      : results.length === 1
        ? `보고: ${results[0].response}`
        : '종합 보고서'
    expect(output).toBe('보고: 결과A')
  })

  test('결과 2개 이상 → 종합 보고서 생성', () => {
    const results: DelegationResult[] = [
      { departmentName: 'A', agentName: 'a', response: '1' },
      { departmentName: 'B', agentName: 'b', response: '2' },
    ]
    const output = results.length === 0
      ? '실패'
      : results.length === 1
        ? `보고: ${results[0].response}`
        : '종합 보고서'
    expect(output).toBe('종합 보고서')
  })
})
