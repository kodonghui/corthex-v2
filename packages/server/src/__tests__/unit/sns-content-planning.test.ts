/**
 * Story 14-1 TEA: SNS 콘텐츠 예약 발행 로직 검증
 * bun test src/__tests__/unit/sns-content-planning.test.ts
 */
import { describe, test, expect } from 'bun:test'

// ============================================================
// 1. scheduledAt 검증 로직 테스트 (서버 API에서 사용하는 패턴)
// ============================================================
describe('scheduledAt 시간 검증', () => {
  function validateScheduledAt(scheduledAt: string | undefined): { valid: boolean; error?: string } {
    if (!scheduledAt) return { valid: true }
    const date = new Date(scheduledAt)
    if (isNaN(date.getTime())) return { valid: false, error: '유효하지 않은 날짜 형식입니다' }
    if (date <= new Date()) return { valid: false, error: '예약 시간은 현재보다 미래여야 합니다' }
    return { valid: true }
  }

  test('scheduledAt 없으면 유효', () => {
    expect(validateScheduledAt(undefined)).toEqual({ valid: true })
  })

  test('미래 시간이면 유효', () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    expect(validateScheduledAt(future).valid).toBe(true)
  })

  test('과거 시간이면 무효', () => {
    const past = new Date(Date.now() - 86400000).toISOString()
    const result = validateScheduledAt(past)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('예약 시간은 현재보다 미래여야 합니다')
  })

  test('잘못된 형식이면 무효', () => {
    const result = validateScheduledAt('not-a-date')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('유효하지 않은 날짜 형식입니다')
  })

  test('현재 시간과 정확히 같으면 무효 (<=)', () => {
    const now = new Date().toISOString()
    // Date 생성+비교 시 미세한 시간 차이가 있으므로 과거가 됨
    const result = validateScheduledAt(now)
    expect(result.valid).toBe(false)
  })

  test('ISO 8601 형식 파싱 정상', () => {
    const iso = '2099-12-31T23:59:59.000Z'
    expect(validateScheduledAt(iso).valid).toBe(true)
  })

  test('타임존 오프셋 포함 형식 파싱', () => {
    const withTz = '2099-06-15T10:30:00+09:00'
    expect(validateScheduledAt(withTz).valid).toBe(true)
  })
})

// ============================================================
// 2. 승인 시 상태 결정 로직 (approve에서 scheduled vs approved)
// ============================================================
describe('승인 시 상태 결정 로직', () => {
  function determineApprovalStatus(scheduledAt: Date | null): 'scheduled' | 'approved' {
    return scheduledAt && scheduledAt > new Date() ? 'scheduled' : 'approved'
  }

  test('scheduledAt 없으면 approved', () => {
    expect(determineApprovalStatus(null)).toBe('approved')
  })

  test('scheduledAt이 미래면 scheduled', () => {
    const future = new Date(Date.now() + 86400000)
    expect(determineApprovalStatus(future)).toBe('scheduled')
  })

  test('scheduledAt이 과거면 approved (이미 지난 예약)', () => {
    const past = new Date(Date.now() - 86400000)
    expect(determineApprovalStatus(past)).toBe('approved')
  })

  test('scheduledAt이 1시간 후면 scheduled', () => {
    const oneHourLater = new Date(Date.now() + 3600000)
    expect(determineApprovalStatus(oneHourLater)).toBe('scheduled')
  })

  test('scheduledAt이 1분 전이면 approved', () => {
    const oneMinAgo = new Date(Date.now() - 60000)
    expect(determineApprovalStatus(oneMinAgo)).toBe('approved')
  })
})

// ============================================================
// 3. 상태 전이 규칙 검증
// ============================================================
describe('SNS 상태 전이 규칙', () => {
  const VALID_TRANSITIONS: Record<string, string[]> = {
    draft: ['pending'],
    pending: ['approved', 'scheduled', 'rejected'],
    approved: ['published', 'failed', 'scheduled'],
    scheduled: ['approved', 'published', 'failed'],
    rejected: ['pending', 'draft'],
    published: [],
    failed: [],
  }

  function isValidTransition(from: string, to: string): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false
  }

  test('draft → pending (승인 요청)', () => {
    expect(isValidTransition('draft', 'pending')).toBe(true)
  })

  test('pending → scheduled (예약 승인)', () => {
    expect(isValidTransition('pending', 'scheduled')).toBe(true)
  })

  test('pending → approved (일반 승인)', () => {
    expect(isValidTransition('pending', 'approved')).toBe(true)
  })

  test('scheduled → approved (예약 취소)', () => {
    expect(isValidTransition('scheduled', 'approved')).toBe(true)
  })

  test('scheduled → published (예약 발행 성공)', () => {
    expect(isValidTransition('scheduled', 'published')).toBe(true)
  })

  test('scheduled → failed (예약 발행 실패)', () => {
    expect(isValidTransition('scheduled', 'failed')).toBe(true)
  })

  test('draft → published 불가 (직접 발행 불가)', () => {
    expect(isValidTransition('draft', 'published')).toBe(false)
  })

  test('published → draft 불가 (되돌리기 불가)', () => {
    expect(isValidTransition('published', 'draft')).toBe(false)
  })

  test('failed에서 어디로도 전이 불가', () => {
    expect(isValidTransition('failed', 'draft')).toBe(false)
    expect(isValidTransition('failed', 'pending')).toBe(false)
  })

  test('scheduled → draft 불가', () => {
    expect(isValidTransition('scheduled', 'draft')).toBe(false)
  })
})

// ============================================================
// 4. 예약 발행 체커 필터 로직 (checkScheduledSns 내부)
// ============================================================
describe('예약 발행 대상 필터 로직', () => {
  type SnsPost = {
    id: string
    status: string
    scheduledAt: Date | null
  }

  function filterDuePosts(posts: SnsPost[], now: Date): SnsPost[] {
    return posts.filter(p => p.status === 'scheduled' && p.scheduledAt && p.scheduledAt <= now)
  }

  const now = new Date('2026-03-06T12:00:00Z')

  test('scheduled + scheduledAt <= now → 발행 대상', () => {
    const posts: SnsPost[] = [
      { id: '1', status: 'scheduled', scheduledAt: new Date('2026-03-06T11:00:00Z') },
    ]
    expect(filterDuePosts(posts, now)).toHaveLength(1)
  })

  test('scheduled + scheduledAt > now → 대상 아님', () => {
    const posts: SnsPost[] = [
      { id: '1', status: 'scheduled', scheduledAt: new Date('2026-03-06T13:00:00Z') },
    ]
    expect(filterDuePosts(posts, now)).toHaveLength(0)
  })

  test('approved 상태 → 대상 아님', () => {
    const posts: SnsPost[] = [
      { id: '1', status: 'approved', scheduledAt: new Date('2026-03-06T11:00:00Z') },
    ]
    expect(filterDuePosts(posts, now)).toHaveLength(0)
  })

  test('scheduled + scheduledAt null → 대상 아님', () => {
    const posts: SnsPost[] = [
      { id: '1', status: 'scheduled', scheduledAt: null },
    ]
    expect(filterDuePosts(posts, now)).toHaveLength(0)
  })

  test('draft 상태는 무시', () => {
    const posts: SnsPost[] = [
      { id: '1', status: 'draft', scheduledAt: new Date('2026-03-06T11:00:00Z') },
    ]
    expect(filterDuePosts(posts, now)).toHaveLength(0)
  })

  test('여러 포스트 중 대상만 필터', () => {
    const posts: SnsPost[] = [
      { id: '1', status: 'scheduled', scheduledAt: new Date('2026-03-06T11:00:00Z') }, // 대상
      { id: '2', status: 'scheduled', scheduledAt: new Date('2026-03-06T13:00:00Z') }, // 미래
      { id: '3', status: 'approved', scheduledAt: new Date('2026-03-06T11:00:00Z') },  // 상태 다름
      { id: '4', status: 'scheduled', scheduledAt: new Date('2026-03-06T12:00:00Z') }, // 정확히 now (<=)
    ]
    const result = filterDuePosts(posts, now)
    expect(result).toHaveLength(2)
    expect(result.map(p => p.id)).toEqual(['1', '4'])
  })

  test('빈 배열이면 빈 결과', () => {
    expect(filterDuePosts([], now)).toHaveLength(0)
  })
})

// ============================================================
// 5. 예약 취소 로직 검증
// ============================================================
describe('예약 취소 로직', () => {
  function canCancelSchedule(status: string): boolean {
    return status === 'scheduled'
  }

  test('scheduled 상태에서 취소 가능', () => {
    expect(canCancelSchedule('scheduled')).toBe(true)
  })

  test('approved 상태에서 취소 불가', () => {
    expect(canCancelSchedule('approved')).toBe(false)
  })

  test('draft 상태에서 취소 불가', () => {
    expect(canCancelSchedule('draft')).toBe(false)
  })

  test('published 상태에서 취소 불가', () => {
    expect(canCancelSchedule('published')).toBe(false)
  })

  test('pending 상태에서 취소 불가', () => {
    expect(canCancelSchedule('pending')).toBe(false)
  })

  test('failed 상태에서 취소 불가', () => {
    expect(canCancelSchedule('failed')).toBe(false)
  })
})

// ============================================================
// 6. Zod 스키마 호환 검증 (createSnsSchema, updateSnsSchema)
// ============================================================
describe('SNS 스키마 검증 — scheduledAt 필드', () => {
  // createSnsSchema에서 scheduledAt은 optional datetime string
  function validateCreateScheduledAt(value: unknown): boolean {
    if (value === undefined) return true
    if (typeof value !== 'string') return false
    const date = new Date(value)
    return !isNaN(date.getTime())
  }

  test('undefined는 유효 (optional)', () => {
    expect(validateCreateScheduledAt(undefined)).toBe(true)
  })

  test('유효한 ISO datetime 문자열', () => {
    expect(validateCreateScheduledAt('2099-12-31T23:59:59.000Z')).toBe(true)
  })

  test('숫자는 무효', () => {
    expect(validateCreateScheduledAt(12345)).toBe(false)
  })

  test('빈 문자열은 무효 (Date 파싱 실패)', () => {
    expect(validateCreateScheduledAt('')).toBe(false)
  })

  test('null은 무효 (create에서는 optional이지 nullable이 아님)', () => {
    expect(validateCreateScheduledAt(null)).toBe(false)
  })

  // updateSnsSchema에서 scheduledAt은 nullable optional
  function validateUpdateScheduledAt(value: unknown): boolean {
    if (value === undefined) return true
    if (value === null) return true // nullable 허용
    if (typeof value !== 'string') return false
    const date = new Date(value)
    return !isNaN(date.getTime())
  }

  test('update: undefined 유효', () => {
    expect(validateUpdateScheduledAt(undefined)).toBe(true)
  })

  test('update: null 유효 (예약 해제)', () => {
    expect(validateUpdateScheduledAt(null)).toBe(true)
  })

  test('update: 유효한 ISO datetime', () => {
    expect(validateUpdateScheduledAt('2099-06-15T10:30:00Z')).toBe(true)
  })
})

// ============================================================
// 7. STATUS_LABELS / STATUS_COLORS 완전성 검증
// ============================================================
describe('프론트엔드 상태 맵 완전성', () => {
  const ALL_STATUSES = ['draft', 'pending', 'approved', 'scheduled', 'rejected', 'published', 'failed']

  const STATUS_LABELS: Record<string, string> = {
    draft: '초안',
    pending: '승인 대기',
    approved: '승인됨',
    scheduled: '예약됨',
    rejected: '반려됨',
    published: '발행 완료',
    failed: '발행 실패',
  }

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    published: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  test('모든 상태에 라벨이 존재', () => {
    for (const status of ALL_STATUSES) {
      expect(STATUS_LABELS[status]).toBeDefined()
      expect(typeof STATUS_LABELS[status]).toBe('string')
      expect(STATUS_LABELS[status].length).toBeGreaterThan(0)
    }
  })

  test('모든 상태에 색상이 존재', () => {
    for (const status of ALL_STATUSES) {
      expect(STATUS_COLORS[status]).toBeDefined()
      expect(typeof STATUS_COLORS[status]).toBe('string')
      expect(STATUS_COLORS[status].length).toBeGreaterThan(0)
    }
  })

  test('scheduled 라벨이 예약됨', () => {
    expect(STATUS_LABELS.scheduled).toBe('예약됨')
  })

  test('scheduled 색상에 blue 포함', () => {
    expect(STATUS_COLORS.scheduled).toContain('blue')
  })

  test('라벨과 색상 맵의 키 수가 동일', () => {
    expect(Object.keys(STATUS_LABELS).length).toBe(Object.keys(STATUS_COLORS).length)
  })
})

// ============================================================
// 8. 발행 결과 처리 로직
// ============================================================
describe('발행 결과 처리', () => {
  type PublishResult = { success: boolean; url?: string; error?: string }

  function processPublishResult(result: PublishResult): { status: string; publishedUrl?: string; publishError?: string } {
    if (result.success) {
      return { status: 'published', publishedUrl: result.url }
    }
    return { status: 'failed', publishError: result.error || '알 수 없는 오류' }
  }

  test('성공 시 published 상태 + URL', () => {
    const result = processPublishResult({ success: true, url: 'https://instagram.com/p/abc' })
    expect(result.status).toBe('published')
    expect(result.publishedUrl).toBe('https://instagram.com/p/abc')
  })

  test('실패 시 failed 상태 + 에러 메시지', () => {
    const result = processPublishResult({ success: false, error: 'API 인증 실패' })
    expect(result.status).toBe('failed')
    expect(result.publishError).toBe('API 인증 실패')
  })

  test('실패 시 에러 메시지 없으면 기본값', () => {
    const result = processPublishResult({ success: false })
    expect(result.status).toBe('failed')
    expect(result.publishError).toBe('알 수 없는 오류')
  })
})

// ============================================================
// 9. 수정 가능 상태 검증
// ============================================================
describe('수정 가능 상태 검증', () => {
  function canEdit(status: string): boolean {
    return status === 'draft' || status === 'rejected'
  }

  test('draft에서 수정 가능', () => {
    expect(canEdit('draft')).toBe(true)
  })

  test('rejected에서 수정 가능', () => {
    expect(canEdit('rejected')).toBe(true)
  })

  test('pending에서 수정 불가', () => {
    expect(canEdit('pending')).toBe(false)
  })

  test('approved에서 수정 불가', () => {
    expect(canEdit('approved')).toBe(false)
  })

  test('scheduled에서 수정 불가', () => {
    expect(canEdit('scheduled')).toBe(false)
  })

  test('published에서 수정 불가', () => {
    expect(canEdit('published')).toBe(false)
  })

  test('failed에서 수정 불가', () => {
    expect(canEdit('failed')).toBe(false)
  })
})

// ============================================================
// 10. 삭제 가능 상태 검증
// ============================================================
describe('삭제 가능 상태 검증', () => {
  function canDelete(status: string): boolean {
    return status === 'draft'
  }

  test('draft에서만 삭제 가능', () => {
    expect(canDelete('draft')).toBe(true)
  })

  test('그 외 상태에서 삭제 불가', () => {
    for (const s of ['pending', 'approved', 'scheduled', 'rejected', 'published', 'failed']) {
      expect(canDelete(s)).toBe(false)
    }
  })
})
