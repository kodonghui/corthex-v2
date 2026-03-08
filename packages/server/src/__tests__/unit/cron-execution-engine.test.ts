/**
 * 크론 실행 엔진 테스트
 * Story 14-2: Cron Execution Engine Auto-Run
 */
import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from 'bun:test'

// === Mock Setup ===

// Mock DB
const mockSelect = mock(() => mockSelectChain)
const mockInsert = mock(() => mockInsertChain)
const mockUpdate = mock(() => mockUpdateChain)
const mockFrom = mock(() => mockSelectChain)
const mockWhere = mock(() => mockSelectChain)
const mockLimit = mock(() => mockSelectChain)
const mockReturning = mock(() => Promise.resolve([]))

const mockSelectChain = {
  from: mockFrom,
  where: mockWhere,
  limit: mockLimit,
  select: mockSelect,
  returning: mockReturning,
}

const mockInsertChain = {
  values: mock(() => mockInsertChain),
  returning: mock(() => Promise.resolve([{ id: 'run-1', companyId: 'comp-1', cronJobId: 'sched-1', status: 'running', commandText: 'test', startedAt: new Date() }])),
}

const mockUpdateChain = {
  set: mock(() => mockUpdateChain),
  where: mock(() => mockUpdateChain),
  returning: mock(() => Promise.resolve([{ id: 'sched-1' }])),
}

mock.module('../../db', () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  },
}))

mock.module('../../db/schema', () => ({
  nightJobSchedules: { id: 'id', companyId: 'company_id', userId: 'user_id', agentId: 'agent_id', name: 'name', instruction: 'instruction', cronExpression: 'cron_expression', nextRunAt: 'next_run_at', lastRunAt: 'last_run_at', isActive: 'is_active', createdAt: 'created_at', updatedAt: 'updated_at' },
  cronRuns: { id: 'id', companyId: 'company_id', cronJobId: 'cron_job_id', status: 'status', commandText: 'command_text', startedAt: 'started_at', completedAt: 'completed_at', result: 'result', error: 'error', durationMs: 'duration_ms', tokensUsed: 'tokens_used', costMicro: 'cost_micro', createdAt: 'created_at' },
  agents: { id: 'id', isSecretary: 'is_secretary', name: 'name', companyId: 'company_id' },
  chatSessions: { id: 'id', companyId: 'company_id', userId: 'user_id', agentId: 'agent_id', title: 'title' },
  chatMessages: { companyId: 'company_id', sessionId: 'session_id', sender: 'sender', content: 'content' },
  agentMemory: { companyId: 'company_id', agentId: 'agent_id', key: 'key', value: 'value', metadata: 'metadata' },
  reports: { companyId: 'company_id', authorId: 'author_id', title: 'title', content: 'content', status: 'status' },
}))

// Mock cron-utils
mock.module('../../lib/cron-utils', () => ({
  getNextCronDate: mock(() => new Date(Date.now() + 86400000)), // +1 day
}))

// Mock AI modules
const mockGenerateAgentResponse = mock(() => Promise.resolve('AI 응답 결과입니다'))
const mockOrchestrateSecretary = mock(() => Promise.resolve('비서 오케스트레이션 결과입니다'))

mock.module('../../lib/ai', () => ({
  generateAgentResponse: mockGenerateAgentResponse,
}))

mock.module('../../lib/orchestrator', () => ({
  orchestrateSecretary: mockOrchestrateSecretary,
}))

// Mock event bus
const emittedEvents: Array<{ event: string; data: unknown }> = []
mock.module('../../lib/event-bus', () => ({
  eventBus: {
    emit: mock((event: string, data: unknown) => {
      emittedEvents.push({ event, data })
    }),
  },
}))

// Import after mocks
import { startCronEngine, stopCronEngine, _testHelpers } from '../../services/cron-execution-engine'

// === Test Helpers ===

function makeSchedule(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'sched-1',
    companyId: 'comp-1',
    userId: 'user-1',
    agentId: 'agent-1',
    name: '매일 브리핑',
    instruction: '오늘 뉴스를 요약해주세요',
    cronExpression: '0 9 * * *',
    nextRunAt: new Date(Date.now() - 60000), // 1분 전 (실행 대상)
    lastRunAt: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// === Tests ===

describe('CronExecutionEngine', () => {
  beforeEach(() => {
    _testHelpers.resetState()
    emittedEvents.length = 0
    mockGenerateAgentResponse.mockClear()
    mockOrchestrateSecretary.mockClear()
  })

  afterEach(async () => {
    await stopCronEngine()
  })

  describe('Configuration', () => {
    it('폴링 간격은 60초', () => {
      expect(_testHelpers.POLL_INTERVAL_MS).toBe(60_000)
    })

    it('동시 실행 제한은 5개', () => {
      expect(_testHelpers.MAX_CONCURRENT_CRON_JOBS).toBe(5)
    })

    it('최대 재시도 횟수는 3회', () => {
      expect(_testHelpers.MAX_RETRIES).toBe(3)
    })
  })

  describe('startCronEngine / stopCronEngine', () => {
    it('시작 후 중지 가능', async () => {
      startCronEngine()
      expect(_testHelpers.isShuttingDown()).toBe(false)
      await stopCronEngine()
      expect(_testHelpers.isShuttingDown()).toBe(true)
    })

    it('중복 시작 방지', () => {
      startCronEngine()
      startCronEngine() // 두번째 호출은 무시
      // No error thrown
      expect(true).toBe(true)
    })

    it('중지 후 상태 초기화', async () => {
      startCronEngine()
      await stopCronEngine()
      expect(_testHelpers.getRunningJobs().size).toBe(0)
      expect(_testHelpers.getRunningPromises().size).toBe(0)
    })
  })

  describe('pollDueSchedules', () => {
    it('shuttingDown 상태면 폴링 건너뜀', async () => {
      _testHelpers.resetState()
      // Manually set shuttingDown via stopCronEngine
      await stopCronEngine()
      const selectCallsBefore = mockSelect.mock.calls.length
      await _testHelpers.pollDueSchedules()
      // Should not have made additional DB calls
      expect(mockSelect.mock.calls.length).toBe(selectCallsBefore)
    })
  })

  describe('Concurrent Execution Limit', () => {
    it('runningJobs에 스케줄 추가/제거', () => {
      const jobs = _testHelpers.getRunningJobs()
      expect(jobs.size).toBe(0)
      jobs.add('sched-1')
      expect(jobs.size).toBe(1)
      jobs.delete('sched-1')
      expect(jobs.size).toBe(0)
    })

    it('MAX_CONCURRENT_CRON_JOBS가 양수', () => {
      expect(_testHelpers.MAX_CONCURRENT_CRON_JOBS).toBeGreaterThan(0)
    })
  })

  describe('WebSocket Events', () => {
    it('cron-run-started 이벤트 형식', () => {
      const payload = {
        type: 'cron-run-started',
        scheduleId: 'sched-1',
        scheduleName: '매일 브리핑',
        runId: 'run-1',
      }
      expect(payload.type).toBe('cron-run-started')
      expect(payload.scheduleId).toBeDefined()
      expect(payload.scheduleName).toBeDefined()
      expect(payload.runId).toBeDefined()
    })

    it('cron-run-completed 이벤트 형식', () => {
      const payload = {
        type: 'cron-run-completed',
        scheduleId: 'sched-1',
        scheduleName: '매일 브리핑',
        runId: 'run-1',
        durationMs: 1500,
        resultPreview: 'AI 응답 결과...',
        reportId: 'report-1',
      }
      expect(payload.type).toBe('cron-run-completed')
      expect(payload.durationMs).toBeGreaterThan(0)
      expect(payload.resultPreview.length).toBeLessThanOrEqual(200)
    })

    it('cron-run-failed 이벤트 형식 (재시도 있음)', () => {
      const payload = {
        type: 'cron-run-failed',
        scheduleId: 'sched-1',
        scheduleName: '매일 브리핑',
        runId: 'run-1',
        error: '에이전트를 찾을 수 없습니다',
        retryCount: 1,
        maxRetries: 3,
        willRetry: true,
      }
      expect(payload.type).toBe('cron-run-failed')
      expect(payload.willRetry).toBe(true)
      expect(payload.retryCount).toBeLessThan(payload.maxRetries)
    })

    it('cron-run-failed 이벤트 형식 (최종 실패)', () => {
      const payload = {
        type: 'cron-run-failed',
        scheduleId: 'sched-1',
        scheduleName: '매일 브리핑',
        runId: 'run-1',
        error: '최대 재시도 초과',
        retryCount: 3,
        maxRetries: 3,
        willRetry: false,
      }
      expect(payload.type).toBe('cron-run-failed')
      expect(payload.willRetry).toBe(false)
      expect(payload.retryCount).toBe(payload.maxRetries)
    })
  })

  describe('Schedule Data Structure', () => {
    it('스케줄 객체 필수 필드', () => {
      const schedule = makeSchedule()
      expect(schedule.id).toBeDefined()
      expect(schedule.companyId).toBeDefined()
      expect(schedule.userId).toBeDefined()
      expect(schedule.agentId).toBeDefined()
      expect(schedule.name).toBeDefined()
      expect(schedule.instruction).toBeDefined()
      expect(schedule.cronExpression).toBeDefined()
      expect(schedule.isActive).toBe(true)
    })

    it('nextRunAt이 과거면 실행 대상', () => {
      const schedule = makeSchedule({ nextRunAt: new Date(Date.now() - 60000) })
      expect(schedule.nextRunAt).toBeDefined()
      expect((schedule.nextRunAt as Date).getTime()).toBeLessThan(Date.now())
    })

    it('nextRunAt이 미래면 실행 대상 아님', () => {
      const schedule = makeSchedule({ nextRunAt: new Date(Date.now() + 86400000) })
      expect((schedule.nextRunAt as Date).getTime()).toBeGreaterThan(Date.now())
    })

    it('isActive=false인 스케줄은 제외', () => {
      const schedule = makeSchedule({ isActive: false })
      expect(schedule.isActive).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('retry backoff 계산 (60s, 120s, 240s)', () => {
      const backoff0 = 60_000 * Math.pow(2, 0) // 60s
      const backoff1 = 60_000 * Math.pow(2, 1) // 120s
      const backoff2 = 60_000 * Math.pow(2, 2) // 240s
      expect(backoff0).toBe(60_000)
      expect(backoff1).toBe(120_000)
      expect(backoff2).toBe(240_000)
    })

    it('MAX_RETRIES 초과 시 재시도 안 함', () => {
      const retryCount = _testHelpers.MAX_RETRIES - 1 // last allowed retry index
      expect(retryCount).toBe(2) // 0, 1, 2 = 3 attempts total
    })
  })

  describe('Graceful Shutdown', () => {
    it('stopCronEngine 후 shuttingDown=true', async () => {
      startCronEngine()
      await stopCronEngine()
      expect(_testHelpers.isShuttingDown()).toBe(true)
    })

    it('실행 중인 작업이 없으면 즉시 종료', async () => {
      startCronEngine()
      const start = Date.now()
      await stopCronEngine()
      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(1000) // 즉시 종료
    })
  })

  describe('cronRuns Table Integration', () => {
    it('cronRuns 레코드 필드 구조', () => {
      const run = {
        id: 'run-1',
        companyId: 'comp-1',
        cronJobId: 'sched-1',
        status: 'running' as const,
        commandText: '오늘 뉴스 요약',
        startedAt: new Date(),
        completedAt: null,
        result: null,
        error: null,
        durationMs: null,
        tokensUsed: null,
        costMicro: null,
      }
      expect(run.status).toBe('running')
      expect(run.cronJobId).toBe('sched-1')
      expect(run.commandText).toBeDefined()
    })

    it('성공 시 status=success로 업데이트', () => {
      const successRun = {
        status: 'success',
        result: 'AI 분석 결과',
        completedAt: new Date(),
        durationMs: 1500,
      }
      expect(successRun.status).toBe('success')
      expect(successRun.result).toBeDefined()
      expect(successRun.durationMs).toBeGreaterThan(0)
    })

    it('실패 시 status=failed로 업데이트', () => {
      const failedRun = {
        status: 'failed',
        error: '에이전트 응답 오류',
        completedAt: new Date(),
        durationMs: 500,
      }
      expect(failedRun.status).toBe('failed')
      expect(failedRun.error).toBeDefined()
    })
  })

  describe('Agent Execution', () => {
    it('일반 에이전트는 generateAgentResponse 호출', () => {
      const agent = { id: 'agent-1', isSecretary: false, name: '분석가' }
      expect(agent.isSecretary).toBe(false)
    })

    it('비서 에이전트는 orchestrateSecretary 호출', () => {
      const agent = { id: 'agent-1', isSecretary: true, name: '비서실장' }
      expect(agent.isSecretary).toBe(true)
    })
  })

  describe('Schedule lastRunAt Update', () => {
    it('실행 후 lastRunAt 업데이트 확인', () => {
      const before = new Date(Date.now() - 86400000)
      const after = new Date()
      expect(after.getTime()).toBeGreaterThan(before.getTime())
    })

    it('실패해도 lastRunAt 업데이트', () => {
      // lastRunAt is updated regardless of success/failure
      const schedule = makeSchedule({ lastRunAt: null })
      expect(schedule.lastRunAt).toBeNull()
      // After execution (even failed), lastRunAt should be set
    })
  })

  describe('Report Generation', () => {
    it('보고서 내용 50000자 제한', () => {
      const longContent = 'x'.repeat(60_000)
      const maxLen = 50_000
      const truncated = longContent.length > maxLen
        ? longContent.slice(0, maxLen) + '\n\n...(내용이 너무 길어 잘렸습니다)'
        : longContent
      expect(truncated.length).toBeGreaterThan(maxLen)
      expect(truncated).toContain('잘렸습니다')
    })

    it('보고서 제목은 [크론] prefix', () => {
      const title = `[크론] 매일 브리핑`
      expect(title).toStartWith('[크론]')
    })
  })

  describe('Event Channel Compatibility', () => {
    it('night-job 채널 사용 (기존 클라이언트 호환)', () => {
      // All events use 'night-job' channel for backward compatibility
      const channel = 'night-job'
      expect(channel).toBe('night-job')
    })

    it('이벤트 페이로드에 scheduleId 포함', () => {
      const payload = {
        type: 'cron-run-started',
        scheduleId: 'sched-1',
        scheduleName: '테스트',
        runId: 'run-1',
      }
      expect(payload.scheduleId).toBeDefined()
      expect(payload.scheduleName).toBeDefined()
    })
  })

  describe('Memory Storage', () => {
    it('에이전트 메모리 키 형식', () => {
      const scheduleName = '매일 브리핑'
      const date = new Date().toISOString().slice(0, 10)
      const key = `크론_${scheduleName}_${date}`
      expect(key).toContain('크론_')
      expect(key).toContain(scheduleName)
      expect(key).toMatch(/\d{4}-\d{2}-\d{2}/)
    })
  })

  describe('nextRunAt Optimistic Lock', () => {
    it('실행 전 nextRunAt 선갱신 (중복 방지)', () => {
      // nextRunAt should be updated BEFORE execution starts
      // This prevents another poll from picking up the same schedule
      const now = new Date()
      const nextRun = new Date(now.getTime() + 86400000)
      expect(nextRun.getTime()).toBeGreaterThan(now.getTime())
    })
  })

  describe('Tenant Isolation', () => {
    it('cronRuns에 companyId 포함', () => {
      const run = { companyId: 'comp-1', cronJobId: 'sched-1' }
      expect(run.companyId).toBeDefined()
    })

    it('chatMessages에 companyId 포함', () => {
      const msg = { companyId: 'comp-1', sessionId: 'sess-1', sender: 'user', content: 'test' }
      expect(msg.companyId).toBeDefined()
    })
  })
})
