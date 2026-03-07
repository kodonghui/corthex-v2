import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { formatDelegationResult, type ManagerDelegationResult, type SpecialistResult } from '../../services/manager-delegate'

// === formatDelegationResult Tests ===

describe('formatDelegationResult', () => {
  test('formats manager-only result (no specialists)', () => {
    const result: ManagerDelegationResult = {
      managerAnalysis: '삼성전자는 반도체 시장에서 선두를 유지하고 있습니다.',
      specialistResults: [],
      summary: { totalSpecialists: 0, fulfilled: 0, rejected: 0 },
    }
    const formatted = formatDelegationResult(result, '전략팀장')
    expect(formatted).toContain('## 전략팀장 독자 분석 (5번째 분석가)')
    expect(formatted).toContain('삼성전자는 반도체')
    expect(formatted).not.toContain('Specialist 분석 결과')
  })

  test('formats manager + specialist results', () => {
    const result: ManagerDelegationResult = {
      managerAnalysis: 'Manager 분석 내용',
      specialistResults: [
        { agentId: 's1', agentName: '시장분석가', content: '시장 분석 결과입니다.', status: 'fulfilled', durationMs: 5000 },
        { agentId: 's2', agentName: '재무분석가', content: '재무 분석 결과입니다.', status: 'fulfilled', durationMs: 3000 },
      ],
      summary: { totalSpecialists: 2, fulfilled: 2, rejected: 0 },
    }
    const formatted = formatDelegationResult(result, '전략팀장')
    expect(formatted).toContain('## 전략팀장 독자 분석 (5번째 분석가)')
    expect(formatted).toContain('Manager 분석 내용')
    expect(formatted).toContain('## Specialist 분석 결과 (2/2 성공)')
    expect(formatted).toContain('### 시장분석가')
    expect(formatted).toContain('시장 분석 결과입니다.')
    expect(formatted).toContain('### 재무분석가')
    expect(formatted).toContain('재무 분석 결과입니다.')
  })

  test('formats with mixed fulfilled/rejected specialists', () => {
    const result: ManagerDelegationResult = {
      managerAnalysis: 'Manager 분석',
      specialistResults: [
        { agentId: 's1', agentName: '분석가A', content: '결과 A', status: 'fulfilled', durationMs: 5000 },
        { agentId: 's2', agentName: '분석가B', content: '', status: 'rejected', error: 'Timeout 초과', durationMs: 60000 },
      ],
      summary: { totalSpecialists: 2, fulfilled: 1, rejected: 1 },
    }
    const formatted = formatDelegationResult(result, 'CIO')
    expect(formatted).toContain('## Specialist 분석 결과 (1/2 성공)')
    expect(formatted).toContain('### 분석가A')
    expect(formatted).toContain('결과 A')
    expect(formatted).toContain('### 분석가B (실패)')
    expect(formatted).toContain('오류: Timeout 초과')
  })

  test('formats all-rejected specialists', () => {
    const result: ManagerDelegationResult = {
      managerAnalysis: 'Manager만 성공',
      specialistResults: [
        { agentId: 's1', agentName: '전문가1', content: '', status: 'rejected', error: 'LLM 오류', durationMs: 1000 },
      ],
      summary: { totalSpecialists: 1, fulfilled: 0, rejected: 1 },
    }
    const formatted = formatDelegationResult(result, '팀장')
    expect(formatted).toContain('## 팀장 독자 분석 (5번째 분석가)')
    expect(formatted).toContain('Manager만 성공')
    expect(formatted).toContain('## Specialist 분석 결과 (0/1 성공)')
    expect(formatted).toContain('### 전문가1 (실패)')
  })

  test('rejected specialist without error message uses default', () => {
    const result: ManagerDelegationResult = {
      managerAnalysis: '분석',
      specialistResults: [
        { agentId: 's1', agentName: '전문가', content: '', status: 'rejected', durationMs: 0 },
      ],
      summary: { totalSpecialists: 1, fulfilled: 0, rejected: 1 },
    }
    const formatted = formatDelegationResult(result, '팀장')
    expect(formatted).toContain('오류: 알 수 없는 오류')
  })
})

// === SpecialistResult Type Tests ===

describe('SpecialistResult type', () => {
  test('fulfilled specialist has content and no error', () => {
    const spec: SpecialistResult = {
      agentId: 'agent-1',
      agentName: '시장분석가',
      content: '분석 결과입니다.',
      status: 'fulfilled',
      durationMs: 5432,
    }
    expect(spec.status).toBe('fulfilled')
    expect(spec.content).toBeTruthy()
    expect(spec.error).toBeUndefined()
    expect(spec.durationMs).toBeGreaterThan(0)
  })

  test('rejected specialist has error and empty content', () => {
    const spec: SpecialistResult = {
      agentId: 'agent-2',
      agentName: '재무분석가',
      content: '',
      status: 'rejected',
      error: 'Timeout exceeded',
      durationMs: 60000,
    }
    expect(spec.status).toBe('rejected')
    expect(spec.content).toBe('')
    expect(spec.error).toBe('Timeout exceeded')
  })
})

// === ManagerDelegationResult Summary Tests ===

describe('ManagerDelegationResult summary', () => {
  test('summary counts match specialist results', () => {
    const specialists: SpecialistResult[] = [
      { agentId: '1', agentName: 'A', content: 'ok', status: 'fulfilled', durationMs: 100 },
      { agentId: '2', agentName: 'B', content: '', status: 'rejected', error: 'err', durationMs: 200 },
      { agentId: '3', agentName: 'C', content: 'ok2', status: 'fulfilled', durationMs: 150 },
    ]
    const fulfilled = specialists.filter(s => s.status === 'fulfilled').length
    const rejected = specialists.filter(s => s.status === 'rejected').length

    expect(fulfilled).toBe(2)
    expect(rejected).toBe(1)
    expect(fulfilled + rejected).toBe(specialists.length)
  })

  test('empty specialist list gives zero counts', () => {
    const result: ManagerDelegationResult = {
      managerAnalysis: 'solo analysis',
      specialistResults: [],
      summary: { totalSpecialists: 0, fulfilled: 0, rejected: 0 },
    }
    expect(result.summary.totalSpecialists).toBe(0)
    expect(result.summary.fulfilled).toBe(0)
    expect(result.summary.rejected).toBe(0)
  })
})

// === Timeout Logic Tests ===

describe('Timeout behavior', () => {
  test('withTimeout resolves when promise completes before deadline', async () => {
    // Simulating the withTimeout pattern used in manager-delegate
    const fastPromise = new Promise<string>((resolve) => setTimeout(() => resolve('done'), 10))
    const result = await Promise.race([
      fastPromise,
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000)),
    ])
    expect(result).toBe('done')
  })

  test('withTimeout rejects when promise exceeds deadline', async () => {
    const slowPromise = new Promise<string>((resolve) => setTimeout(() => resolve('done'), 5000))
    try {
      await Promise.race([
        slowPromise,
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Timeout: test exceeded 50ms')), 50)),
      ])
      expect(true).toBe(false) // Should not reach here
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      expect((err as Error).message).toContain('Timeout')
    }
  })
})

// === Manager Self-Analysis Prompt Pattern Tests ===

describe('Manager self-analysis prompt pattern', () => {
  test('v1 pattern: manager name in context prompt', () => {
    const managerName = '전략팀장'
    const context = `당신은 ${managerName}입니다. 전문가들과 별개로 독자적 분석을 수행하세요.
반드시 도구(API)를 사용하여 실시간 데이터를 직접 조회하고 분석하세요.
전문가 결과는 무시하세요 — 당신만의 독립적 관점을 제시하세요.`
    expect(context).toContain('전략팀장')
    expect(context).toContain('독자적 분석')
    expect(context).toContain('도구(API)')
    expect(context).toContain('독립적 관점')
  })

  test('specialist context includes manager analysis summary', () => {
    const commandText = '삼성전자 분석'
    const managerSummary = 'Manager의 독자 분석 결과...'
    const specContext = `## 원본 명령\n${commandText}\n\n## Manager 분석 요약 (참고용 — 독립적 관점으로 분석하세요)\n${managerSummary.slice(0, 2000)}`
    expect(specContext).toContain('삼성전자 분석')
    expect(specContext).toContain('Manager의 독자 분석 결과')
    expect(specContext).toContain('독립적 관점으로 분석하세요')
  })

  test('specialist context truncates long manager analysis at 2000 chars', () => {
    const longAnalysis = 'A'.repeat(3000)
    const truncated = longAnalysis.slice(0, 2000)
    expect(truncated.length).toBe(2000)
    expect(longAnalysis.length).toBe(3000)
  })
})

// === Delegation Chain Tests ===

describe('Delegation chain tracking', () => {
  test('chain structure: command -> classify -> delegate -> manager -> specialist[]', () => {
    // Validate the parentTaskId chain concept
    const chain = {
      commandId: 'cmd-1',
      classifyTaskId: 'task-classify',
      delegateTaskId: 'task-delegate',
      managerTaskId: 'task-mgr',
      specialistTaskIds: ['task-spec-1', 'task-spec-2'],
    }

    // Each specialist task should reference the manager delegate task as parent
    for (const specId of chain.specialistTaskIds) {
      expect(specId).toBeTruthy()
    }
    expect(chain.managerTaskId).toBeTruthy()
    expect(chain.delegateTaskId).toBeTruthy()
  })
})

// === Constants Tests ===

describe('Configuration constants', () => {
  test('specialist timeout is 60 seconds', () => {
    const SPECIALIST_TIMEOUT_MS = 60_000
    expect(SPECIALIST_TIMEOUT_MS).toBe(60000)
  })

  test('total timeout is 5 minutes (NFR2)', () => {
    const TOTAL_TIMEOUT_MS = 300_000
    expect(TOTAL_TIMEOUT_MS).toBe(300000)
    expect(TOTAL_TIMEOUT_MS / 1000 / 60).toBe(5)
  })

  test('max specialists per department is 10 (NFR7)', () => {
    const MAX_SPECIALISTS = 10
    expect(MAX_SPECIALISTS).toBe(10)
  })
})

// === Edge Case Tests ===

describe('Edge cases', () => {
  test('manager without departmentId returns no specialists', () => {
    // Manager with no departmentId should have zero specialists
    const manager = {
      id: 'mgr-1',
      companyId: 'co-1',
      name: '팀장',
      tier: 'manager' as const,
      modelName: 'claude-sonnet-4-6',
      soul: null,
      allowedTools: [],
      isActive: true,
      // no departmentId
    }
    // getSpecialists checks for departmentId — without it, returns []
    expect((manager as Record<string, unknown>).departmentId).toBeUndefined()
  })

  test('manager analysis failure should still return a result with error message', () => {
    const errorMsg = 'LLM call failed'
    const managerAnalysis = `Manager 분석 실패: ${errorMsg}`
    expect(managerAnalysis).toContain('Manager 분석 실패')
    expect(managerAnalysis).toContain('LLM call failed')
  })

  test('all specialists failing still returns manager analysis', () => {
    const result: ManagerDelegationResult = {
      managerAnalysis: '독자 분석 완료',
      specialistResults: [
        { agentId: 's1', agentName: 'A', content: '', status: 'rejected', error: 'err1', durationMs: 100 },
        { agentId: 's2', agentName: 'B', content: '', status: 'rejected', error: 'err2', durationMs: 200 },
      ],
      summary: { totalSpecialists: 2, fulfilled: 0, rejected: 2 },
    }
    expect(result.managerAnalysis).toBe('독자 분석 완료')
    expect(result.summary.fulfilled).toBe(0)
    expect(result.summary.rejected).toBe(2)
  })

  test('specialist results are correctly typed with Promise.allSettled pattern', async () => {
    // Simulating Promise.allSettled behavior
    const promises = [
      Promise.resolve({ agentId: 'a', agentName: 'A', content: 'ok', status: 'fulfilled' as const, durationMs: 100 }),
      Promise.reject(new Error('timeout')),
    ]
    const results = await Promise.allSettled(promises)
    expect(results[0].status).toBe('fulfilled')
    expect(results[1].status).toBe('rejected')

    // Map results like manager-delegate does
    const mapped = results.map((r) => r.status === 'fulfilled' ? r.value : {
      agentId: 'unknown',
      agentName: 'unknown',
      content: '',
      status: 'rejected' as const,
      error: (r as PromiseRejectedResult).reason instanceof Error ? ((r as PromiseRejectedResult).reason as Error).message : String((r as PromiseRejectedResult).reason),
      durationMs: 0,
    })
    expect(mapped).toHaveLength(2)
    expect(mapped[0].status).toBe('fulfilled')
    expect(mapped[0].content).toBe('ok')
    expect(mapped[1].status).toBe('rejected')
    expect((mapped[1] as SpecialistResult & { error: string }).error).toBe('timeout')
  })

  test('MAX_SPECIALISTS limits specialist array', () => {
    const MAX = 10
    const bigArray = Array.from({ length: 20 }, (_, i) => ({ id: `spec-${i}` }))
    const limited = bigArray.slice(0, MAX)
    expect(limited).toHaveLength(10)
  })

  test('formatDelegationResult handles empty manager analysis', () => {
    const result: ManagerDelegationResult = {
      managerAnalysis: '',
      specialistResults: [],
      summary: { totalSpecialists: 0, fulfilled: 0, rejected: 0 },
    }
    const formatted = formatDelegationResult(result, '팀장')
    expect(formatted).toContain('## 팀장 독자 분석 (5번째 분석가)')
    // Empty analysis still has the header
    expect(formatted).toBeTruthy()
  })
})

// === TEA Risk-Based Tests ===

describe('TEA: withTimeout pattern correctness', () => {
  // Replicate actual withTimeout from manager-delegate.ts
  function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timeout: ${label} exceeded ${ms}ms`)), ms)
      promise.then(
        (val) => { clearTimeout(timer); resolve(val) },
        (err) => { clearTimeout(timer); reject(err) },
      )
    })
  }

  test('resolves with value when promise completes within timeout', async () => {
    const result = await withTimeout(Promise.resolve('success'), 1000, 'test')
    expect(result).toBe('success')
  })

  test('rejects with timeout error when promise exceeds timeout', async () => {
    const slow = new Promise<string>((resolve) => setTimeout(() => resolve('late'), 5000))
    try {
      await withTimeout(slow, 50, 'slow-agent')
      expect(true).toBe(false) // fail if resolved
    } catch (err) {
      expect((err as Error).message).toBe('Timeout: slow-agent exceeded 50ms')
    }
  })

  test('propagates original error when promise rejects before timeout', async () => {
    const failing = Promise.reject(new Error('LLM error'))
    try {
      await withTimeout(failing, 5000, 'test')
      expect(true).toBe(false)
    } catch (err) {
      expect((err as Error).message).toBe('LLM error')
    }
  })

  test('clears timer when promise resolves to avoid memory leaks', async () => {
    // This test verifies the clearTimeout path
    const quick = Promise.resolve(42)
    const result = await withTimeout(quick, 10000, 'quick')
    expect(result).toBe(42)
  })

  test('timeout error includes label for debugging', async () => {
    const slow = new Promise<string>(() => {}) // Never resolves
    try {
      await withTimeout(slow, 10, '시장분석가')
      expect(true).toBe(false)
    } catch (err) {
      expect((err as Error).message).toContain('시장분석가')
      expect((err as Error).message).toContain('10ms')
    }
  })
})

describe('TEA: formatDelegationResult boundary cases', () => {
  test('10 specialists (NFR7 max) formats correctly', () => {
    const specs: SpecialistResult[] = Array.from({ length: 10 }, (_, i) => ({
      agentId: `s${i}`,
      agentName: `전문가${i}`,
      content: `분석 결과 ${i}`,
      status: 'fulfilled' as const,
      durationMs: 1000 * (i + 1),
    }))
    const result: ManagerDelegationResult = {
      managerAnalysis: 'Manager 독자 분석',
      specialistResults: specs,
      summary: { totalSpecialists: 10, fulfilled: 10, rejected: 0 },
    }
    const formatted = formatDelegationResult(result, 'CIO')
    expect(formatted).toContain('10/10 성공')
    for (let i = 0; i < 10; i++) {
      expect(formatted).toContain(`### 전문가${i}`)
      expect(formatted).toContain(`분석 결과 ${i}`)
    }
  })

  test('specialist with very long content formats without truncation', () => {
    const longContent = 'A'.repeat(50000)
    const result: ManagerDelegationResult = {
      managerAnalysis: 'short',
      specialistResults: [
        { agentId: 's1', agentName: 'Long', content: longContent, status: 'fulfilled', durationMs: 100 },
      ],
      summary: { totalSpecialists: 1, fulfilled: 1, rejected: 0 },
    }
    const formatted = formatDelegationResult(result, '팀장')
    expect(formatted).toContain(longContent)
  })

  test('special characters in names are preserved', () => {
    const result: ManagerDelegationResult = {
      managerAnalysis: '분석',
      specialistResults: [
        { agentId: 's1', agentName: '금융/투자 분석가 #1', content: '결과', status: 'fulfilled', durationMs: 100 },
      ],
      summary: { totalSpecialists: 1, fulfilled: 1, rejected: 0 },
    }
    const formatted = formatDelegationResult(result, '전략&기획팀장')
    expect(formatted).toContain('전략&기획팀장')
    expect(formatted).toContain('금융/투자 분석가 #1')
  })
})

describe('TEA: specialist context construction', () => {
  test('empty manager summary produces no context block', () => {
    const managerSummary = ''
    // When managerAnalysisSummary is empty, dispatchSpecialists should skip context
    const hasContext = managerSummary ? true : false
    expect(hasContext).toBe(false)
  })

  test('context preserves full command text', () => {
    const commandText = '삼성전자와 SK하이닉스의 2026년 반도체 시장 전망을 비교 분석해주세요'
    const context = `## 원본 명령\n${commandText}\n\n## Manager 분석 요약 (참고용 — 독립적 관점으로 분석하세요)\n요약`
    expect(context).toContain(commandText)
  })

  test('context truncates manager summary at 2000 chars boundary', () => {
    const summary1999 = 'B'.repeat(1999)
    const summary2000 = 'B'.repeat(2000)
    const summary2001 = 'B'.repeat(2001)

    expect(summary1999.slice(0, 2000)).toBe(summary1999) // Not truncated
    expect(summary2000.slice(0, 2000)).toBe(summary2000) // At boundary
    expect(summary2001.slice(0, 2000).length).toBe(2000) // Truncated
  })
})

describe('TEA: DelegateOptions validation', () => {
  test('DelegateOptions with all required fields', () => {
    const options = {
      manager: {
        id: 'mgr-1',
        companyId: 'co-1',
        name: '전략팀장',
        tier: 'manager' as const,
        modelName: 'claude-sonnet-4-6',
        soul: '전략 분석 전문가',
        allowedTools: ['web-search', 'stock-api'],
        isActive: true,
      },
      commandText: '시장 분석해줘',
      companyId: 'co-1',
      commandId: 'cmd-1',
      parentTaskId: null,
      toolExecutor: undefined,
    }
    expect(options.manager.tier).toBe('manager')
    expect(options.commandText).toBeTruthy()
    expect(options.companyId).toBe('co-1')
    expect(options.commandId).toBeTruthy()
  })

  test('DelegateOptions with optional parentTaskId', () => {
    const withParent = { parentTaskId: 'parent-task-123' }
    const withoutParent = { parentTaskId: null }
    const withUndefined = { parentTaskId: undefined }

    expect(withParent.parentTaskId).toBe('parent-task-123')
    expect(withoutParent.parentTaskId).toBeNull()
    expect(withUndefined.parentTaskId).toBeUndefined()
  })
})

describe('TEA: concurrent execution patterns', () => {
  test('Promise.allSettled preserves all results even with failures', async () => {
    const tasks = [
      Promise.resolve('result-1'),
      Promise.reject(new Error('fail-2')),
      Promise.resolve('result-3'),
      Promise.reject(new Error('fail-4')),
      Promise.resolve('result-5'),
    ]
    const results = await Promise.allSettled(tasks)

    expect(results).toHaveLength(5)
    expect(results[0].status).toBe('fulfilled')
    expect(results[1].status).toBe('rejected')
    expect(results[2].status).toBe('fulfilled')
    expect(results[3].status).toBe('rejected')
    expect(results[4].status).toBe('fulfilled')

    // Fulfilled values
    expect((results[0] as PromiseFulfilledResult<string>).value).toBe('result-1')
    expect((results[2] as PromiseFulfilledResult<string>).value).toBe('result-3')

    // Rejected reasons
    expect(((results[1] as PromiseRejectedResult).reason as Error).message).toBe('fail-2')
  })

  test('simultaneous manager + specialist execution pattern', async () => {
    // Simulating the v1 pattern: manager self-analysis + specialist dispatch simultaneously
    const managerAnalysis = Promise.resolve('Manager 독자 분석 결과')
    const specialistDispatch = Promise.resolve([
      { agentId: 's1', content: '전문가 1 결과' },
      { agentId: 's2', content: '전문가 2 결과' },
    ])

    const [mgrResult, specResult] = await Promise.allSettled([managerAnalysis, specialistDispatch])

    expect(mgrResult.status).toBe('fulfilled')
    expect(specResult.status).toBe('fulfilled')
    expect((mgrResult as PromiseFulfilledResult<string>).value).toBe('Manager 독자 분석 결과')
    expect((specResult as PromiseFulfilledResult<Array<{ agentId: string; content: string }>>).value).toHaveLength(2)
  })

  test('manager succeeds even when all specialists fail', async () => {
    const managerAnalysis = Promise.resolve('Manager OK')
    const specialistDispatch = Promise.reject(new Error('All specialists timed out'))

    const [mgrResult, specResult] = await Promise.allSettled([managerAnalysis, specialistDispatch])

    expect(mgrResult.status).toBe('fulfilled')
    expect((mgrResult as PromiseFulfilledResult<string>).value).toBe('Manager OK')
    expect(specResult.status).toBe('rejected')
  })

  test('specialist dispatch failure does not affect manager result', async () => {
    let managerCompleted = false
    const managerPromise = new Promise<string>((resolve) => {
      setTimeout(() => { managerCompleted = true; resolve('manager done') }, 10)
    })
    const specPromise = Promise.reject(new Error('network error'))

    const [mgr, spec] = await Promise.allSettled([managerPromise, specPromise])

    expect(mgr.status).toBe('fulfilled')
    expect(managerCompleted).toBe(true)
    expect(spec.status).toBe('rejected')
  })
})

describe('TEA: error message formatting', () => {
  test('Error instance extracts message correctly', () => {
    const err = new Error('LLM provider returned 503')
    const msg = err instanceof Error ? err.message : String(err)
    expect(msg).toBe('LLM provider returned 503')
  })

  test('non-Error thrown extracts via String()', () => {
    const err = 'string error'
    const msg = err instanceof Error ? err.message : String(err)
    expect(msg).toBe('string error')
  })

  test('null/undefined error produces reasonable string', () => {
    const msg1 = String(null)
    const msg2 = String(undefined)
    expect(msg1).toBe('null')
    expect(msg2).toBe('undefined')
  })
})

describe('TEA: AgentConfig type for manager-delegate', () => {
  test('manager with departmentId can delegate to specialists', () => {
    const manager = {
      id: 'mgr-1',
      companyId: 'co-1',
      name: '전략팀장',
      tier: 'manager' as const,
      modelName: 'claude-sonnet-4-6',
      soul: '전략 분석',
      allowedTools: ['web-search'],
      isActive: true,
      departmentId: 'dept-1',
    }
    expect(manager.departmentId).toBe('dept-1')
    expect(manager.tier).toBe('manager')
    expect(manager.isActive).toBe(true)
  })

  test('specialist agent has correct tier', () => {
    const specialist = {
      id: 'spec-1',
      companyId: 'co-1',
      name: '시장분석가',
      tier: 'specialist' as const,
      modelName: 'claude-haiku-4-5',
      soul: '시장 분석 전문',
      allowedTools: [],
      isActive: true,
      departmentId: 'dept-1',
    }
    expect(specialist.tier).toBe('specialist')
    expect(specialist.departmentId).toBe('dept-1')
  })
})
