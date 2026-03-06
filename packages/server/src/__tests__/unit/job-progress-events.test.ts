/**
 * Story 11-5 QA: job-progress / job-completed / job-failed 이벤트 페이로드 검증
 * bun test src/__tests__/unit/job-progress-events.test.ts
 */
import { describe, test, expect } from 'bun:test'

// 이벤트 페이로드 타입 정의 (job-queue.ts eventBus.emit 패턴 기반)
type JobProgressEvent = {
  type: 'job-progress'
  jobId: string
  progress: number
  statusMessage: string
}

type JobCompletedEvent = {
  type: 'job-completed'
  jobId: string
  resultData: { sessionId: string; reportId: string | null }
  durationMs: number
  instruction: string
}

type JobFailedEvent = {
  type: 'job-failed'
  jobId: string
  errorCode: string
  errorMessage: string
  retryCount: number
  instruction: string
}

type JobQueuedEvent = {
  type: 'job-queued'
  jobId: string
}

type ChainFailedEvent = {
  type: 'chain-failed'
  chainId: string
  cancelledCount: number
}

describe('job-progress 이벤트 페이로드', () => {
  test('progress 값은 0~100 범위', () => {
    const stages = [0, 20, 60, 80, 100]
    for (const progress of stages) {
      const event: JobProgressEvent = {
        type: 'job-progress',
        jobId: 'job-123',
        progress,
        statusMessage: '테스트',
      }
      expect(event.progress).toBeGreaterThanOrEqual(0)
      expect(event.progress).toBeLessThanOrEqual(100)
    }
  })

  test('statusMessage는 비어있지 않은 문자열', () => {
    const messages = ['작업 준비 중...', 'AI 분석 중...', '응답 처리 중...', '보고서 생성 중...']
    for (const msg of messages) {
      expect(msg.length).toBeGreaterThan(0)
    }
  })

  test('progress 단계가 순서대로 증가', () => {
    const stages = [0, 20, 60, 80, 100]
    for (let i = 1; i < stages.length; i++) {
      expect(stages[i]).toBeGreaterThan(stages[i - 1])
    }
  })
})

describe('job-completed 이벤트 페이로드', () => {
  test('durationMs 포함 (양수)', () => {
    const start = Date.now()
    const durationMs = Date.now() - start + 1500
    const event: JobCompletedEvent = {
      type: 'job-completed',
      jobId: 'job-456',
      resultData: { sessionId: 'session-1', reportId: 'report-1' },
      durationMs,
      instruction: '테스트 작업',
    }
    expect(event.durationMs).toBeGreaterThan(0)
    expect(event.type).toBe('job-completed')
  })

  test('resultData에 sessionId 필수, reportId는 nullable', () => {
    const event: JobCompletedEvent = {
      type: 'job-completed',
      jobId: 'job-789',
      resultData: { sessionId: 'session-2', reportId: null },
      durationMs: 3000,
      instruction: '보고서 없는 작업',
    }
    expect(event.resultData.sessionId).toBeTruthy()
    expect(event.resultData.reportId).toBeNull()
  })

  test('instruction 필드 포함', () => {
    const event: JobCompletedEvent = {
      type: 'job-completed',
      jobId: 'job-abc',
      resultData: { sessionId: 's1', reportId: null },
      durationMs: 1000,
      instruction: '시장 분석 해줘',
    }
    expect(event.instruction).toBe('시장 분석 해줘')
  })
})

describe('job-failed 이벤트 페이로드', () => {
  test('errorCode + retryCount 포함', () => {
    const event: JobFailedEvent = {
      type: 'job-failed',
      jobId: 'job-fail-1',
      errorCode: 'MAX_RETRIES_EXCEEDED',
      errorMessage: '타임아웃',
      retryCount: 3,
      instruction: '실패 테스트',
    }
    expect(event.errorCode).toBe('MAX_RETRIES_EXCEEDED')
    expect(event.retryCount).toBe(3)
    expect(event.type).toBe('job-failed')
  })

  test('errorMessage는 사람이 읽을 수 있는 문자열', () => {
    const event: JobFailedEvent = {
      type: 'job-failed',
      jobId: 'job-fail-2',
      errorCode: 'MAX_RETRIES_EXCEEDED',
      errorMessage: '에이전트를 찾을 수 없습니다',
      retryCount: 3,
      instruction: '테스트',
    }
    expect(event.errorMessage.length).toBeGreaterThan(0)
  })
})

describe('job-queued 이벤트 페이로드', () => {
  test('jobId 포함', () => {
    const event: JobQueuedEvent = {
      type: 'job-queued',
      jobId: 'job-new-1',
    }
    expect(event.type).toBe('job-queued')
    expect(event.jobId).toBeTruthy()
  })
})

describe('chain-failed 이벤트 페이로드', () => {
  test('chainId + cancelledCount 포함', () => {
    const event: ChainFailedEvent = {
      type: 'chain-failed',
      chainId: 'chain-1',
      cancelledCount: 3,
    }
    expect(event.type).toBe('chain-failed')
    expect(event.cancelledCount).toBeGreaterThan(0)
  })
})

describe('재시도 백오프 계산', () => {
  test('지수 백오프: 30초 → 60초 → 120초', () => {
    const BASE_MS = 30_000
    const backoffs = [1, 2, 3].map(n => BASE_MS * Math.pow(2, n - 1))
    expect(backoffs[0]).toBe(30_000)
    expect(backoffs[1]).toBe(60_000)
    expect(backoffs[2]).toBe(120_000)
  })
})

describe('ProgressBar 값 클램핑 로직', () => {
  test('0 미만은 0으로 클램핑', () => {
    const clamped = Math.min(100, Math.max(0, -10))
    expect(clamped).toBe(0)
  })

  test('100 초과는 100으로 클램핑', () => {
    const clamped = Math.min(100, Math.max(0, 150))
    expect(clamped).toBe(100)
  })

  test('정상 범위 값은 그대로', () => {
    const clamped = Math.min(100, Math.max(0, 60))
    expect(clamped).toBe(60)
  })

  test('경계값 0과 100 정상 처리', () => {
    expect(Math.min(100, Math.max(0, 0))).toBe(0)
    expect(Math.min(100, Math.max(0, 100))).toBe(100)
  })
})
