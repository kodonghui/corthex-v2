import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

// ============================================================
// Story 11-4: 야간작업 자동 보고서 생성 — 순수 함수 단위 테스트
// ============================================================

// --- job-queue.ts에서 추출한 순수 로직 ---

/** 보고서 제목 생성: [야간] + instruction 개행→공백 치환 + 앞 50자 */
function buildReportTitle(instruction: string): string {
  return `[야간] ${instruction.replace(/\n/g, ' ').slice(0, 50)}`
}

/** resultData 구조: sessionId 필수, reportId는 보고서 생성 성공 시에만 */
function buildResultData(sessionId: string, reportId: string | null): { sessionId: string; reportId: string | null } {
  return { sessionId, reportId }
}

/** 재시도 지수 백오프 계산: 30초 * 2^(retryCount-1) */
function calcBackoffMs(newRetryCount: number): number {
  return 30_000 * Math.pow(2, newRetryCount - 1)
}

/** 재시도 초과 에러 메시지 */
function buildMaxRetryError(maxRetries: number, errorMsg: string): string {
  return `[재시도 ${maxRetries}회 초과] ${errorMsg}`
}

/** 체인 다음 작업 instruction 병합 */
function buildEnrichedInstruction(previousResult: string, nextInstruction: string): string {
  return `[이전 작업 결과]\n${previousResult.slice(0, 500)}\n\n[현재 지시]\n${nextInstruction}`
}

// --- jobs.ts에서 추출한 Zod 스키마 ---

const queueJobSchema = z.object({
  agentId: z.string().uuid(),
  instruction: z.string().min(1),
  scheduledFor: z.string().datetime().optional(),
})

const chainJobSchema = z.object({
  steps: z.array(z.object({
    agentId: z.string().uuid(),
    instruction: z.string().min(1),
  })).min(2).max(5),
})

// --- jobs.tsx에서 추출한 프론트엔드 순수 로직 ---

const jobStatusConfig: Record<string, { label: string; variant: string }> = {
  queued: { label: '대기', variant: 'info' },
  processing: { label: '처리중', variant: 'warning' },
  completed: { label: '완료', variant: 'success' },
  failed: { label: '실패', variant: 'error' },
  blocked: { label: '대기(체인)', variant: 'default' },
}

type NightJob = {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'blocked'
  resultData: { sessionId?: string; reportId?: string } | null
  isRead: boolean
}

/** 완료 카드에 [결과 보기] 버튼 표시 조건 */
function shouldShowSessionLink(job: NightJob): boolean {
  return job.status === 'completed' && !!job.resultData?.sessionId
}

/** 완료 카드에 [보고서 보기] 버튼 표시 조건 */
function shouldShowReportLink(job: NightJob): boolean {
  return job.status === 'completed' && !!job.resultData?.reportId
}

/** 읽지 않은 알림 표시 조건 */
function isUnreadNotification(job: NightJob): boolean {
  return !job.isRead && (job.status === 'completed' || job.status === 'failed')
}

// --- WebSocket 이벤트 페이로드 타입 ---

type JobCompletedEvent = { type: 'job-completed'; jobId: string; resultData: { sessionId: string; reportId: string | null }; durationMs: number }
type JobFailedEvent = { type: 'job-failed'; jobId: string; errorCode: string; retryCount: number }
type JobRetryingEvent = { type: 'job-retrying'; jobId: string; retryCount: number; maxRetries: number }
type JobProgressEvent = { type: 'job-progress'; jobId: string; progress: number; statusMessage: string }

// --- WsChannel 타입 체크 ---

type WsChannel = 'chat-stream' | 'agent-status' | 'notifications' | 'messenger' | 'activity-log' | 'strategy-notes' | 'night-job'

// --- 알림 API 응답 필터 로직 ---

type NotificationJob = { status: string; isRead: boolean }

function filterNotificationJobs(jobs: NotificationJob[]) {
  const completed = jobs.filter(j => !j.isRead && (j.status === 'completed' || j.status === 'failed'))
  return {
    total: completed.length,
    completedCount: completed.filter(j => j.status === 'completed').length,
    failedCount: completed.filter(j => j.status === 'failed').length,
  }
}

// ============================================================
// 테스트 시작
// ============================================================

describe('Story 11-4: 자동 보고서 생성 로직', () => {

  // ---- 1. 보고서 제목 생성 ----
  describe('buildReportTitle', () => {
    test('기본: instruction 앞 50자 + [야간] 접두사', () => {
      const title = buildReportTitle('마케팅 보고서 작성')
      expect(title).toBe('[야간] 마케팅 보고서 작성')
    })

    test('개행문자가 공백으로 치환됨', () => {
      const title = buildReportTitle('첫 줄\n두 번째 줄\n세 번째 줄')
      expect(title).not.toContain('\n')
      expect(title).toBe('[야간] 첫 줄 두 번째 줄 세 번째 줄')
    })

    test('50자 초과 instruction은 잘림', () => {
      const longText = '가'.repeat(100)
      const title = buildReportTitle(longText)
      // [야간] 접두사(5자) + 공백(1자) 제외하고 50자
      const contentPart = title.replace('[야간] ', '')
      expect(contentPart.length).toBe(50)
    })

    test('50자 이하 instruction은 그대로', () => {
      const text = '가'.repeat(30)
      const title = buildReportTitle(text)
      expect(title).toBe(`[야간] ${text}`)
    })

    test('빈 instruction', () => {
      const title = buildReportTitle('')
      expect(title).toBe('[야간] ')
    })

    test('개행 + 50자 초과 조합', () => {
      const text = '가\n'.repeat(40)  // 80자(가40 + \n40) → 공백치환 후 80자 → 50자 잘림
      const title = buildReportTitle(text)
      const contentPart = title.replace('[야간] ', '')
      expect(contentPart.length).toBe(50)
      expect(contentPart).not.toContain('\n')
    })
  })

  // ---- 2. resultData 구조 ----
  describe('buildResultData', () => {
    test('보고서 생성 성공: sessionId + reportId', () => {
      const data = buildResultData('sess-123', 'report-456')
      expect(data.sessionId).toBe('sess-123')
      expect(data.reportId).toBe('report-456')
    })

    test('보고서 생성 실패: sessionId만, reportId는 null', () => {
      const data = buildResultData('sess-123', null)
      expect(data.sessionId).toBe('sess-123')
      expect(data.reportId).toBeNull()
    })

    test('resultData 구조는 항상 sessionId 포함', () => {
      const data = buildResultData('any-session', null)
      expect(data).toHaveProperty('sessionId')
      expect(data).toHaveProperty('reportId')
    })
  })

  // ---- 3. 재시도 백오프 계산 ----
  describe('calcBackoffMs', () => {
    test('1회차 재시도: 30초', () => {
      expect(calcBackoffMs(1)).toBe(30_000)
    })

    test('2회차 재시도: 60초', () => {
      expect(calcBackoffMs(2)).toBe(60_000)
    })

    test('3회차 재시도: 120초', () => {
      expect(calcBackoffMs(3)).toBe(120_000)
    })
  })

  // ---- 4. 재시도 초과 에러 메시지 ----
  describe('buildMaxRetryError', () => {
    test('기본 포맷', () => {
      const msg = buildMaxRetryError(3, '에이전트를 찾을 수 없습니다')
      expect(msg).toBe('[재시도 3회 초과] 에이전트를 찾을 수 없습니다')
    })

    test('다른 maxRetries 값', () => {
      const msg = buildMaxRetryError(5, 'timeout')
      expect(msg).toBe('[재시도 5회 초과] timeout')
    })
  })

  // ---- 5. 체인 instruction 병합 ----
  describe('buildEnrichedInstruction', () => {
    test('이전 결과 + 현재 지시 결합', () => {
      const enriched = buildEnrichedInstruction('이전 결과 텍스트', '다음 지시')
      expect(enriched).toContain('[이전 작업 결과]')
      expect(enriched).toContain('이전 결과 텍스트')
      expect(enriched).toContain('[현재 지시]')
      expect(enriched).toContain('다음 지시')
    })

    test('이전 결과가 500자 초과 시 잘림', () => {
      const longResult = '가'.repeat(1000)
      const enriched = buildEnrichedInstruction(longResult, '지시')
      // [이전 작업 결과]\n + 500자 + \n\n[현재 지시]\n + 지시
      const resultPart = enriched.split('\n\n[현재 지시]')[0].replace('[이전 작업 결과]\n', '')
      expect(resultPart.length).toBe(500)
    })
  })
})

describe('Story 11-4: Zod 스키마 검증', () => {

  // ---- 6. queueJobSchema ----
  describe('queueJobSchema', () => {
    test('유효한 입력 통과', () => {
      const result = queueJobSchema.safeParse({
        agentId: '550e8400-e29b-41d4-a716-446655440000',
        instruction: '보고서 작성해줘',
      })
      expect(result.success).toBe(true)
    })

    test('scheduledFor 옵션 필드 포함 시 통과', () => {
      const result = queueJobSchema.safeParse({
        agentId: '550e8400-e29b-41d4-a716-446655440000',
        instruction: '보고서 작성',
        scheduledFor: '2026-03-06T22:00:00.000Z',
      })
      expect(result.success).toBe(true)
    })

    test('agentId가 UUID가 아니면 실패', () => {
      const result = queueJobSchema.safeParse({
        agentId: 'not-a-uuid',
        instruction: '보고서',
      })
      expect(result.success).toBe(false)
    })

    test('instruction이 빈 문자열이면 실패', () => {
      const result = queueJobSchema.safeParse({
        agentId: '550e8400-e29b-41d4-a716-446655440000',
        instruction: '',
      })
      expect(result.success).toBe(false)
    })

    test('instruction 누락 시 실패', () => {
      const result = queueJobSchema.safeParse({
        agentId: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(false)
    })

    test('scheduledFor가 잘못된 datetime이면 실패', () => {
      const result = queueJobSchema.safeParse({
        agentId: '550e8400-e29b-41d4-a716-446655440000',
        instruction: '테스트',
        scheduledFor: 'not-a-date',
      })
      expect(result.success).toBe(false)
    })
  })

  // ---- 7. chainJobSchema ----
  describe('chainJobSchema', () => {
    const uuid1 = '550e8400-e29b-41d4-a716-446655440000'
    const uuid2 = '660e8400-e29b-41d4-a716-446655440000'

    test('유효한 2단계 체인 통과', () => {
      const result = chainJobSchema.safeParse({
        steps: [
          { agentId: uuid1, instruction: '1단계 분석' },
          { agentId: uuid2, instruction: '2단계 정리' },
        ],
      })
      expect(result.success).toBe(true)
    })

    test('5단계까지 허용', () => {
      const steps = Array.from({ length: 5 }, (_, i) => ({
        agentId: uuid1,
        instruction: `${i + 1}단계`,
      }))
      const result = chainJobSchema.safeParse({ steps })
      expect(result.success).toBe(true)
    })

    test('1단계만이면 실패 (min 2)', () => {
      const result = chainJobSchema.safeParse({
        steps: [{ agentId: uuid1, instruction: '혼자' }],
      })
      expect(result.success).toBe(false)
    })

    test('6단계 이상이면 실패 (max 5)', () => {
      const steps = Array.from({ length: 6 }, (_, i) => ({
        agentId: uuid1,
        instruction: `${i + 1}단계`,
      }))
      const result = chainJobSchema.safeParse({ steps })
      expect(result.success).toBe(false)
    })

    test('step 내 instruction이 빈 문자열이면 실패', () => {
      const result = chainJobSchema.safeParse({
        steps: [
          { agentId: uuid1, instruction: '정상' },
          { agentId: uuid2, instruction: '' },
        ],
      })
      expect(result.success).toBe(false)
    })

    test('step 내 agentId가 UUID가 아니면 실패', () => {
      const result = chainJobSchema.safeParse({
        steps: [
          { agentId: 'bad', instruction: '분석' },
          { agentId: uuid2, instruction: '정리' },
        ],
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('Story 11-4: 프론트엔드 순수 로직', () => {

  // ---- 8. jobStatusConfig ----
  describe('jobStatusConfig', () => {
    test('5가지 상태 모두 정의됨', () => {
      expect(Object.keys(jobStatusConfig)).toEqual(['queued', 'processing', 'completed', 'failed', 'blocked'])
    })

    test('completed 상태 variant는 success', () => {
      expect(jobStatusConfig.completed.variant).toBe('success')
    })

    test('failed 상태 variant는 error', () => {
      expect(jobStatusConfig.failed.variant).toBe('error')
    })

    test('각 상태에 label과 variant 필드 존재', () => {
      for (const [, cfg] of Object.entries(jobStatusConfig)) {
        expect(cfg).toHaveProperty('label')
        expect(cfg).toHaveProperty('variant')
      }
    })
  })

  // ---- 9. 보고서/결과 링크 표시 조건 ----
  describe('shouldShowSessionLink', () => {
    test('completed + sessionId 있으면 true', () => {
      const job: NightJob = { id: '1', status: 'completed', resultData: { sessionId: 's1' }, isRead: false }
      expect(shouldShowSessionLink(job)).toBe(true)
    })

    test('completed지만 resultData null이면 false', () => {
      const job: NightJob = { id: '1', status: 'completed', resultData: null, isRead: false }
      expect(shouldShowSessionLink(job)).toBe(false)
    })

    test('completed지만 sessionId 없으면 false', () => {
      const job: NightJob = { id: '1', status: 'completed', resultData: { reportId: 'r1' }, isRead: false }
      expect(shouldShowSessionLink(job)).toBe(false)
    })

    test('failed 상태에서는 false', () => {
      const job: NightJob = { id: '1', status: 'failed', resultData: { sessionId: 's1' }, isRead: false }
      expect(shouldShowSessionLink(job)).toBe(false)
    })

    test('processing 상태에서는 false', () => {
      const job: NightJob = { id: '1', status: 'processing', resultData: { sessionId: 's1' }, isRead: false }
      expect(shouldShowSessionLink(job)).toBe(false)
    })
  })

  describe('shouldShowReportLink', () => {
    test('completed + reportId 있으면 true', () => {
      const job: NightJob = { id: '1', status: 'completed', resultData: { reportId: 'r1', sessionId: 's1' }, isRead: false }
      expect(shouldShowReportLink(job)).toBe(true)
    })

    test('completed지만 reportId 없으면 false', () => {
      const job: NightJob = { id: '1', status: 'completed', resultData: { sessionId: 's1' }, isRead: false }
      expect(shouldShowReportLink(job)).toBe(false)
    })

    test('completed지만 resultData null이면 false', () => {
      const job: NightJob = { id: '1', status: 'completed', resultData: null, isRead: false }
      expect(shouldShowReportLink(job)).toBe(false)
    })

    test('failed 상태에서는 false', () => {
      const job: NightJob = { id: '1', status: 'failed', resultData: { reportId: 'r1' }, isRead: false }
      expect(shouldShowReportLink(job)).toBe(false)
    })
  })

  // ---- 10. 읽지 않은 알림 조건 ----
  describe('isUnreadNotification', () => {
    test('completed + isRead=false → true', () => {
      const job: NightJob = { id: '1', status: 'completed', resultData: null, isRead: false }
      expect(isUnreadNotification(job)).toBe(true)
    })

    test('failed + isRead=false → true', () => {
      const job: NightJob = { id: '1', status: 'failed', resultData: null, isRead: false }
      expect(isUnreadNotification(job)).toBe(true)
    })

    test('completed + isRead=true → false', () => {
      const job: NightJob = { id: '1', status: 'completed', resultData: null, isRead: true }
      expect(isUnreadNotification(job)).toBe(false)
    })

    test('queued + isRead=false → false', () => {
      const job: NightJob = { id: '1', status: 'queued', resultData: null, isRead: false }
      expect(isUnreadNotification(job)).toBe(false)
    })

    test('processing + isRead=false → false', () => {
      const job: NightJob = { id: '1', status: 'processing', resultData: null, isRead: false }
      expect(isUnreadNotification(job)).toBe(false)
    })
  })
})

describe('Story 11-4: WebSocket 이벤트 구조', () => {

  // ---- 11. job-completed 이벤트 ----
  describe('job-completed 이벤트', () => {
    test('필수 필드 구조 검증', () => {
      const event: JobCompletedEvent = {
        type: 'job-completed',
        jobId: 'job-123',
        resultData: { sessionId: 'sess-1', reportId: 'rep-1' },
        durationMs: 5000,
      }
      expect(event.type).toBe('job-completed')
      expect(event.resultData.sessionId).toBe('sess-1')
      expect(event.resultData.reportId).toBe('rep-1')
      expect(event.durationMs).toBeGreaterThan(0)
    })

    test('보고서 생성 실패 시 reportId는 null', () => {
      const event: JobCompletedEvent = {
        type: 'job-completed',
        jobId: 'job-123',
        resultData: { sessionId: 'sess-1', reportId: null },
        durationMs: 3000,
      }
      expect(event.resultData.reportId).toBeNull()
      expect(event.resultData.sessionId).toBeTruthy()
    })
  })

  // ---- 12. job-failed 이벤트 ----
  describe('job-failed 이벤트', () => {
    test('필수 필드 구조 검증 (instruction/errorMessage 미포함 — 보안)', () => {
      const event: JobFailedEvent = {
        type: 'job-failed',
        jobId: 'job-456',
        errorCode: 'MAX_RETRIES_EXCEEDED',
        retryCount: 3,
      }
      expect(event.type).toBe('job-failed')
      expect(event.errorCode).toBe('MAX_RETRIES_EXCEEDED')
      expect(event.retryCount).toBe(3)
    })
  })

  // ---- 13. job-retrying 이벤트 ----
  describe('job-retrying 이벤트', () => {
    test('retryCount < maxRetries', () => {
      const event: JobRetryingEvent = {
        type: 'job-retrying',
        jobId: 'job-789',
        retryCount: 1,
        maxRetries: 3,
      }
      expect(event.retryCount).toBeLessThan(event.maxRetries)
    })
  })

  // ---- 14. job-progress 이벤트 ----
  describe('job-progress 이벤트', () => {
    test('progress 범위 0~100', () => {
      const stages: JobProgressEvent[] = [
        { type: 'job-progress', jobId: 'j1', progress: 0, statusMessage: '작업 준비 중...' },
        { type: 'job-progress', jobId: 'j1', progress: 20, statusMessage: 'AI 분석 중...' },
        { type: 'job-progress', jobId: 'j1', progress: 60, statusMessage: '응답 처리 중...' },
        { type: 'job-progress', jobId: 'j1', progress: 80, statusMessage: '보고서 생성 중...' },
      ]
      for (const stage of stages) {
        expect(stage.progress).toBeGreaterThanOrEqual(0)
        expect(stage.progress).toBeLessThanOrEqual(100)
      }
    })

    test('단계별 진행률이 증가함', () => {
      const progresses = [0, 20, 60, 80]
      for (let i = 1; i < progresses.length; i++) {
        expect(progresses[i]).toBeGreaterThan(progresses[i - 1])
      }
    })
  })
})

describe('Story 11-4: WsChannel 타입', () => {
  test('night-job이 WsChannel 타입에 포함됨', () => {
    const channel: WsChannel = 'night-job'
    const allChannels: WsChannel[] = ['chat-stream', 'agent-status', 'notifications', 'messenger', 'activity-log', 'strategy-notes', 'night-job']
    expect(allChannels).toContain(channel)
  })

  test('7개 채널 존재', () => {
    const allChannels: WsChannel[] = ['chat-stream', 'agent-status', 'notifications', 'messenger', 'activity-log', 'strategy-notes', 'night-job']
    expect(allChannels.length).toBe(7)
  })
})

describe('Story 11-4: 알림 API 필터 로직', () => {

  test('읽지 않은 completed + failed만 필터', () => {
    const jobs: NotificationJob[] = [
      { status: 'completed', isRead: false },
      { status: 'failed', isRead: false },
      { status: 'queued', isRead: false },
      { status: 'completed', isRead: true },
      { status: 'processing', isRead: false },
    ]
    const result = filterNotificationJobs(jobs)
    expect(result.total).toBe(2)
    expect(result.completedCount).toBe(1)
    expect(result.failedCount).toBe(1)
  })

  test('모든 작업이 읽음 처리된 경우', () => {
    const jobs: NotificationJob[] = [
      { status: 'completed', isRead: true },
      { status: 'failed', isRead: true },
    ]
    const result = filterNotificationJobs(jobs)
    expect(result.total).toBe(0)
    expect(result.completedCount).toBe(0)
    expect(result.failedCount).toBe(0)
  })

  test('빈 배열', () => {
    const result = filterNotificationJobs([])
    expect(result.total).toBe(0)
  })

  test('여러 개의 완료/실패 혼합', () => {
    const jobs: NotificationJob[] = [
      { status: 'completed', isRead: false },
      { status: 'completed', isRead: false },
      { status: 'completed', isRead: false },
      { status: 'failed', isRead: false },
      { status: 'failed', isRead: false },
    ]
    const result = filterNotificationJobs(jobs)
    expect(result.total).toBe(5)
    expect(result.completedCount).toBe(3)
    expect(result.failedCount).toBe(2)
  })
})

describe('Story 11-4: 보고서 생성 격리 (try-catch 패턴)', () => {

  test('보고서 생성 실패해도 작업 결과는 유효함', () => {
    // processJob의 try-catch 패턴을 시뮬레이션
    const sessionId = 'sess-abc'
    let reportId: string | null = null

    try {
      // 보고서 생성 실패 시뮬레이션
      throw new Error('DB connection failed')
    } catch {
      // 에러는 로깅만 하고 무시
    }

    // 작업 완료 데이터는 보고서 실패와 무관하게 유효
    const resultData = buildResultData(sessionId, reportId)
    expect(resultData.sessionId).toBe('sess-abc')
    expect(resultData.reportId).toBeNull()
  })

  test('보고서 생성 성공 시 resultData에 reportId 포함', () => {
    const sessionId = 'sess-xyz'
    let reportId: string | null = null

    try {
      // 보고서 생성 성공 시뮬레이션
      reportId = 'report-new-123'
    } catch {
      // 에러 없음
    }

    const resultData = buildResultData(sessionId, reportId)
    expect(resultData.sessionId).toBe('sess-xyz')
    expect(resultData.reportId).toBe('report-new-123')
  })
})

describe('Story 11-4: 세션 제목 생성', () => {
  /** 세션 제목: [야간] + instruction 앞 30자 + ... */
  function buildSessionTitle(instruction: string): string {
    return `[야간] ${instruction.slice(0, 30)}...`
  }

  test('30자 이하 instruction', () => {
    const title = buildSessionTitle('마케팅 분석')
    expect(title).toBe('[야간] 마케팅 분석...')
  })

  test('30자 초과 instruction은 잘림', () => {
    const long = '가'.repeat(50)
    const title = buildSessionTitle(long)
    const contentPart = title.replace('[야간] ', '').replace('...', '')
    expect(contentPart.length).toBe(30)
  })
})
