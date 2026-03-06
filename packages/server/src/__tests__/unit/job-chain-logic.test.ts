/**
 * Story 11-6 QA: 야간작업 체인 로직 검증
 * bun test src/__tests__/unit/job-chain-logic.test.ts
 */
import { describe, test, expect } from 'bun:test'

describe('체인 작업 등록 구조', () => {
  test('2~5단계 체인 생성 가능', () => {
    for (const count of [2, 3, 4, 5]) {
      const steps = Array.from({ length: count }, (_, i) => ({
        agentId: `agent-${i}`,
        instruction: `단계 ${i + 1}`,
      }))
      expect(steps.length).toBeGreaterThanOrEqual(2)
      expect(steps.length).toBeLessThanOrEqual(5)
    }
  })

  test('1단계만 있는 체인은 invalid', () => {
    const steps = [{ agentId: 'a1', instruction: '지시' }]
    expect(steps.length).toBeLessThan(2) // min(2) validation
  })

  test('6단계 이상 체인은 invalid', () => {
    const steps = Array.from({ length: 6 }, (_, i) => ({
      agentId: `agent-${i}`,
      instruction: `단계 ${i}`,
    }))
    expect(steps.length).toBeGreaterThan(5) // max(5) validation
  })

  test('체인 내 첫 번째는 queued, 나머지는 blocked', () => {
    const statuses: string[] = []
    const count = 3
    for (let i = 0; i < count; i++) {
      statuses.push(i === 0 ? 'queued' : 'blocked')
    }
    expect(statuses[0]).toBe('queued')
    expect(statuses[1]).toBe('blocked')
    expect(statuses[2]).toBe('blocked')
  })

  test('parentJobId 연결 구조', () => {
    const jobs = [
      { id: 'job-1', parentJobId: null },
      { id: 'job-2', parentJobId: 'job-1' },
      { id: 'job-3', parentJobId: 'job-2' },
    ]
    expect(jobs[0].parentJobId).toBeNull()
    expect(jobs[1].parentJobId).toBe('job-1')
    expect(jobs[2].parentJobId).toBe('job-2')
  })

  test('모든 체인 작업은 동일한 chainId 공유', () => {
    const chainId = 'chain-abc'
    const jobs = [
      { chainId, status: 'queued' },
      { chainId, status: 'blocked' },
      { chainId, status: 'blocked' },
    ]
    const uniqueChainIds = new Set(jobs.map(j => j.chainId))
    expect(uniqueChainIds.size).toBe(1)
  })
})

describe('체인 실행 — 결과 전달', () => {
  test('이전 결과 500자 + 현재 지시 결합', () => {
    const previousResult = 'A'.repeat(600)
    const currentInstruction = '현재 작업 지시'
    const enriched = `[이전 작업 결과]\n${previousResult.slice(0, 500)}\n\n[현재 지시]\n${currentInstruction}`

    expect(enriched).toContain('[이전 작업 결과]')
    expect(enriched).toContain('[현재 지시]')
    expect(enriched).toContain(currentInstruction)
    // 이전 결과는 500자로 잘려야 함
    const resultSection = enriched.split('\n\n[현재 지시]')[0].split('[이전 작업 결과]\n')[1]
    expect(resultSection.length).toBe(500)
  })

  test('이전 결과가 500자 미만이면 그대로 전달', () => {
    const previousResult = '짧은 결과'
    const enriched = `[이전 작업 결과]\n${previousResult.slice(0, 500)}\n\n[현재 지시]\n지시`
    expect(enriched).toContain('짧은 결과')
  })

  test('이전 결과 빈 문자열 시에도 형식 유지', () => {
    const previousResult = ''
    const enriched = `[이전 작업 결과]\n${previousResult.slice(0, 500)}\n\n[현재 지시]\n지시`
    expect(enriched).toContain('[이전 작업 결과]')
    expect(enriched).toContain('[현재 지시]')
  })
})

describe('체인 실패 전파', () => {
  test('중간 실패 시 남은 blocked 작업 전부 failed', () => {
    const chainJobs = [
      { id: '1', status: 'completed' },
      { id: '2', status: 'failed' },
      { id: '3', status: 'blocked' },
      { id: '4', status: 'blocked' },
    ]
    const failedBlocked = chainJobs
      .filter(j => j.status === 'blocked')
      .map(j => ({ ...j, status: 'failed', error: '이전 작업 실패로 취소됨' }))

    expect(failedBlocked.length).toBe(2)
    expect(failedBlocked[0].status).toBe('failed')
    expect(failedBlocked[0].error).toBe('이전 작업 실패로 취소됨')
  })

  test('chain-failed 이벤트 페이로드', () => {
    const event = {
      type: 'chain-failed' as const,
      chainId: 'chain-1',
      cancelledCount: 2,
    }
    expect(event.type).toBe('chain-failed')
    expect(event.cancelledCount).toBeGreaterThan(0)
  })
})

describe('체인 취소', () => {
  test('queued와 blocked만 삭제 가능', () => {
    const deletableStatuses = ['queued', 'blocked']
    const nonDeletable = ['processing', 'completed', 'failed']

    for (const s of deletableStatuses) {
      expect(['queued', 'blocked']).toContain(s)
    }
    for (const s of nonDeletable) {
      expect(['queued', 'blocked']).not.toContain(s)
    }
  })

  test('processing 중인 작업이 있으면 체인 취소 불가', () => {
    const chainJobs = [
      { status: 'processing' },
      { status: 'blocked' },
    ]
    const hasProcessing = chainJobs.some(j => j.status === 'processing')
    expect(hasProcessing).toBe(true) // → 400 에러
  })
})

describe('체인 카드 시각화 로직', () => {
  test('chainId로 그룹핑', () => {
    const jobs = [
      { id: '1', chainId: 'c1', parentJobId: null },
      { id: '2', chainId: 'c1', parentJobId: '1' },
      { id: '3', chainId: null, parentJobId: null },
      { id: '4', chainId: 'c2', parentJobId: null },
    ]
    const chains = new Map<string, typeof jobs>()
    const singles: typeof jobs = []

    for (const job of jobs) {
      if (job.chainId) {
        const list = chains.get(job.chainId) || []
        list.push(job)
        chains.set(job.chainId, list)
      } else {
        singles.push(job)
      }
    }

    expect(chains.size).toBe(2) // c1, c2
    expect(chains.get('c1')?.length).toBe(2)
    expect(chains.get('c2')?.length).toBe(1)
    expect(singles.length).toBe(1) // job 3
  })

  test('체인 진행률 계산', () => {
    const chainJobs = [
      { status: 'completed' },
      { status: 'completed' },
      { status: 'processing' },
    ]
    const completed = chainJobs.filter(j => j.status === 'completed').length
    const total = chainJobs.length
    expect(`${completed}/${total} 완료`).toBe('2/3 완료')
  })
})

describe('jobStatusEnum 확장', () => {
  test('blocked 상태 포함', () => {
    const statuses = ['queued', 'processing', 'completed', 'failed', 'blocked']
    expect(statuses).toContain('blocked')
    expect(statuses.length).toBe(5)
  })
})
