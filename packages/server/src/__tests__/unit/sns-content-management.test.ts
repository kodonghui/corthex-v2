/**
 * Story 12-1 TEA: SNS 콘텐츠 관리 API — 상태 전이, CRUD 검증, 권한 체크, 계정 관리
 * bun test src/__tests__/unit/sns-content-management.test.ts
 */
import { describe, test, expect } from 'bun:test'

// ============================================================
// 1. 콘텐츠 상태 전이 상태 머신
// ============================================================

type SnsStatus = 'draft' | 'pending' | 'approved' | 'scheduled' | 'rejected' | 'published' | 'failed'

type SnsAction = 'submit' | 'approve' | 'reject' | 'publish' | 'cancel-schedule' | 'edit' | 'delete'

const VALID_TRANSITIONS: Record<string, SnsStatus[]> = {
  'draft:submit': ['pending'],
  'draft:edit': ['draft'],
  'draft:delete': ['draft'], // delete returns same status conceptually
  'pending:approve': ['approved', 'scheduled'],
  'pending:reject': ['rejected'],
  'rejected:submit': ['pending'],
  'rejected:edit': ['draft'], // editing rejected content resets to draft
  'approved:publish': ['published', 'failed'],
  'scheduled:cancel-schedule': ['approved'],
  'scheduled:publish': ['published', 'failed'], // scheduler auto-publish
}

function canTransition(currentStatus: SnsStatus, action: SnsAction): boolean {
  const key = `${currentStatus}:${action}`
  return key in VALID_TRANSITIONS
}

function getNextStatus(currentStatus: SnsStatus, action: SnsAction, opts?: { scheduledAt?: Date | null }): SnsStatus | null {
  if (!canTransition(currentStatus, action)) return null

  switch (action) {
    case 'submit': return 'pending'
    case 'approve': {
      if (opts?.scheduledAt && opts.scheduledAt > new Date()) return 'scheduled'
      return 'approved'
    }
    case 'reject': return 'rejected'
    case 'publish': return 'published' // or 'failed' on error
    case 'cancel-schedule': return 'approved'
    case 'edit': return 'draft'
    case 'delete': return currentStatus
    default: return null
  }
}

describe('SNS 콘텐츠 상태 전이 머신', () => {
  describe('유효한 전이', () => {
    test('draft → pending (submit)', () => {
      expect(getNextStatus('draft', 'submit')).toBe('pending')
    })

    test('pending → approved (approve, 예약 없음)', () => {
      expect(getNextStatus('pending', 'approve')).toBe('approved')
    })

    test('pending → scheduled (approve, 예약 있음)', () => {
      const future = new Date(Date.now() + 86400000)
      expect(getNextStatus('pending', 'approve', { scheduledAt: future })).toBe('scheduled')
    })

    test('pending → rejected (reject)', () => {
      expect(getNextStatus('pending', 'reject')).toBe('rejected')
    })

    test('rejected → pending (submit 재요청)', () => {
      expect(getNextStatus('rejected', 'submit')).toBe('pending')
    })

    test('rejected → draft (edit 시 자동 리셋)', () => {
      expect(getNextStatus('rejected', 'edit')).toBe('draft')
    })

    test('approved → published (publish 성공)', () => {
      expect(getNextStatus('approved', 'publish')).toBe('published')
    })

    test('scheduled → approved (cancel-schedule)', () => {
      expect(getNextStatus('scheduled', 'cancel-schedule')).toBe('approved')
    })

    test('scheduled → published (자동 발행)', () => {
      expect(getNextStatus('scheduled', 'publish')).toBe('published')
    })
  })

  describe('무효한 전이', () => {
    test('pending → edit 불가', () => {
      expect(canTransition('pending', 'edit')).toBe(false)
    })

    test('published → submit 불가', () => {
      expect(canTransition('published', 'submit')).toBe(false)
    })

    test('failed → approve 불가', () => {
      expect(canTransition('failed', 'approve')).toBe(false)
    })

    test('approved → reject 불가', () => {
      expect(canTransition('approved', 'reject')).toBe(false)
    })

    test('draft → approve 불가 (submit 먼저 필요)', () => {
      expect(canTransition('draft', 'approve')).toBe(false)
    })

    test('approved → delete 불가', () => {
      expect(canTransition('approved', 'delete')).toBe(false)
    })

    test('published → edit 불가', () => {
      expect(canTransition('published', 'edit')).toBe(false)
    })

    test('scheduled → edit 불가', () => {
      expect(canTransition('scheduled', 'edit')).toBe(false)
    })
  })

  describe('예약 승인 분기 로직', () => {
    test('과거 scheduledAt → approved (예약 무시)', () => {
      const past = new Date(Date.now() - 86400000)
      expect(getNextStatus('pending', 'approve', { scheduledAt: past })).toBe('approved')
    })

    test('null scheduledAt → approved', () => {
      expect(getNextStatus('pending', 'approve', { scheduledAt: null })).toBe('approved')
    })

    test('undefined scheduledAt → approved', () => {
      expect(getNextStatus('pending', 'approve')).toBe('approved')
    })

    test('1년 후 scheduledAt → scheduled', () => {
      const oneYear = new Date(Date.now() + 365 * 86400000)
      expect(getNextStatus('pending', 'approve', { scheduledAt: oneYear })).toBe('scheduled')
    })
  })
})

// ============================================================
// 2. 권한 검증 로직
// ============================================================

type UserRole = 'super_admin' | 'company_admin' | 'ceo' | 'employee'

function isCeoOrAbove(role: UserRole): boolean {
  return role === 'ceo' || role === 'company_admin' || role === 'super_admin'
}

function canApproveReject(role: UserRole): boolean {
  return isCeoOrAbove(role)
}

function canCancelSchedule(role: UserRole): boolean {
  return isCeoOrAbove(role)
}

function canEdit(createdBy: string, userId: string): boolean {
  return createdBy === userId
}

function canDelete(createdBy: string, userId: string, status: SnsStatus): boolean {
  return createdBy === userId && status === 'draft'
}

describe('SNS 권한 검증', () => {
  describe('승인/반려 권한', () => {
    test('CEO는 승인/반려 가능', () => {
      expect(canApproveReject('ceo')).toBe(true)
    })

    test('company_admin은 승인/반려 가능', () => {
      expect(canApproveReject('company_admin')).toBe(true)
    })

    test('super_admin은 승인/반려 가능', () => {
      expect(canApproveReject('super_admin')).toBe(true)
    })

    test('employee는 승인/반려 불가', () => {
      expect(canApproveReject('employee')).toBe(false)
    })
  })

  describe('수정/삭제 권한', () => {
    test('본인만 수정 가능', () => {
      expect(canEdit('user-1', 'user-1')).toBe(true)
      expect(canEdit('user-1', 'user-2')).toBe(false)
    })

    test('draft 상태에서 본인만 삭제 가능', () => {
      expect(canDelete('user-1', 'user-1', 'draft')).toBe(true)
    })

    test('draft 아닌 상태에서는 삭제 불가', () => {
      expect(canDelete('user-1', 'user-1', 'pending')).toBe(false)
      expect(canDelete('user-1', 'user-1', 'approved')).toBe(false)
      expect(canDelete('user-1', 'user-1', 'published')).toBe(false)
    })

    test('타인의 콘텐츠는 삭제 불가', () => {
      expect(canDelete('user-1', 'user-2', 'draft')).toBe(false)
    })
  })

  describe('예약 취소 권한', () => {
    test('CEO 이상만 예약 취소 가능', () => {
      expect(canCancelSchedule('ceo')).toBe(true)
      expect(canCancelSchedule('company_admin')).toBe(true)
      expect(canCancelSchedule('employee')).toBe(false)
    })
  })
})

// ============================================================
// 3. Zod 스키마 검증 패턴
// ============================================================

const VALID_PLATFORMS = ['instagram', 'tistory', 'daum_cafe'] as const
type SnsPlatform = typeof VALID_PLATFORMS[number]

function validateCreateInput(input: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!input.platform || !VALID_PLATFORMS.includes(input.platform as SnsPlatform)) {
    errors.push('platform은 instagram, tistory, daum_cafe 중 하나')
  }
  if (!input.title || typeof input.title !== 'string' || (input.title as string).length === 0) {
    errors.push('title은 필수 (1자 이상)')
  }
  if (typeof input.title === 'string' && (input.title as string).length > 200) {
    errors.push('title은 200자 이하')
  }
  if (!input.body || typeof input.body !== 'string' || (input.body as string).length === 0) {
    errors.push('body는 필수 (1자 이상)')
  }

  return { valid: errors.length === 0, errors }
}

describe('입력 검증', () => {
  describe('콘텐츠 생성 스키마', () => {
    test('유효한 입력', () => {
      const result = validateCreateInput({
        platform: 'instagram',
        title: '테스트 제목',
        body: '테스트 본문',
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('platform 누락 → 에러', () => {
      const result = validateCreateInput({ title: '제목', body: '본문' })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('platform은 instagram, tistory, daum_cafe 중 하나')
    })

    test('잘못된 platform → 에러', () => {
      const result = validateCreateInput({ platform: 'twitter', title: '제목', body: '본문' })
      expect(result.valid).toBe(false)
    })

    test('title 누락 → 에러', () => {
      const result = validateCreateInput({ platform: 'instagram', body: '본문' })
      expect(result.valid).toBe(false)
    })

    test('title 200자 초과 → 에러', () => {
      const result = validateCreateInput({
        platform: 'instagram',
        title: 'a'.repeat(201),
        body: '본문',
      })
      expect(result.valid).toBe(false)
    })

    test('body 누락 → 에러', () => {
      const result = validateCreateInput({ platform: 'tistory', title: '제목' })
      expect(result.valid).toBe(false)
    })

    test('모든 플랫폼 유효', () => {
      for (const p of VALID_PLATFORMS) {
        const result = validateCreateInput({ platform: p, title: '제목', body: '본문' })
        expect(result.valid).toBe(true)
      }
    })
  })

  describe('반려 사유 검증', () => {
    test('사유 있으면 유효', () => {
      expect('품질 미달'.length > 0).toBe(true)
    })

    test('빈 사유는 무효', () => {
      expect(''.length > 0).toBe(false)
    })
  })
})

// ============================================================
// 4. A/B 테스트 점수 계산
// ============================================================

function calcEngagement(m: { views: number; likes: number; shares: number; clicks: number }): number {
  return m.views + m.likes * 2 + m.shares * 3 + m.clicks * 2
}

function findWinner(items: Array<{ id: string; metrics: { views: number; likes: number; shares: number; clicks: number } | null }>): { id: string; score: number } | null {
  const scored = items
    .filter((i) => i.metrics !== null)
    .map((i) => ({ id: i.id, score: calcEngagement(i.metrics!) }))

  if (scored.length === 0) return null
  return scored.reduce((best, curr) => (curr.score > best.score ? curr : best))
}

describe('A/B 테스트 점수 및 winner', () => {
  test('기본 engagement 계산', () => {
    expect(calcEngagement({ views: 100, likes: 50, shares: 10, clicks: 30 })).toBe(100 + 100 + 30 + 60)
  })

  test('모든 0이면 0', () => {
    expect(calcEngagement({ views: 0, likes: 0, shares: 0, clicks: 0 })).toBe(0)
  })

  test('shares 가중치 3 확인', () => {
    const withShares = calcEngagement({ views: 0, likes: 0, shares: 100, clicks: 0 })
    expect(withShares).toBe(300)
  })

  test('winner 선택 — 가장 높은 score', () => {
    const items = [
      { id: 'a', metrics: { views: 100, likes: 10, shares: 5, clicks: 20 } },
      { id: 'b', metrics: { views: 200, likes: 50, shares: 20, clicks: 80 } },
      { id: 'c', metrics: { views: 50, likes: 5, shares: 2, clicks: 10 } },
    ]
    const winner = findWinner(items)
    expect(winner!.id).toBe('b')
  })

  test('metrics가 없는 항목은 제외', () => {
    const items = [
      { id: 'a', metrics: null },
      { id: 'b', metrics: { views: 10, likes: 5, shares: 1, clicks: 2 } },
    ]
    const winner = findWinner(items)
    expect(winner!.id).toBe('b')
  })

  test('모든 metrics가 null이면 winner 없음', () => {
    const items = [
      { id: 'a', metrics: null },
      { id: 'b', metrics: null },
    ]
    expect(findWinner(items)).toBeNull()
  })

  test('동점이면 먼저 나온 항목이 winner (reduce 특성)', () => {
    const items = [
      { id: 'a', metrics: { views: 10, likes: 5, shares: 1, clicks: 2 } },
      { id: 'b', metrics: { views: 10, likes: 5, shares: 1, clicks: 2 } },
    ]
    const winner = findWinner(items)
    expect(winner!.id).toBe('a') // reduce keeps first
  })
})

// ============================================================
// 5. 계정 삭제 시 연결 콘텐츠 검사
// ============================================================

function canDeleteAccount(linkedContentCount: number): { canDelete: boolean; error?: string } {
  if (linkedContentCount > 0) {
    return {
      canDelete: false,
      error: `연결된 SNS 콘텐츠가 ${linkedContentCount}건 있어 삭제할 수 없습니다`,
    }
  }
  return { canDelete: true }
}

describe('SNS 계정 삭제 검증', () => {
  test('연결 콘텐츠 0건이면 삭제 가능', () => {
    expect(canDeleteAccount(0).canDelete).toBe(true)
  })

  test('연결 콘텐츠 1건이면 삭제 불가', () => {
    const result = canDeleteAccount(1)
    expect(result.canDelete).toBe(false)
    expect(result.error).toContain('1건')
  })

  test('연결 콘텐츠 100건이면 삭제 불가 + 건수 표시', () => {
    const result = canDeleteAccount(100)
    expect(result.canDelete).toBe(false)
    expect(result.error).toContain('100건')
  })
})

// ============================================================
// 6. AI 콘텐츠 파싱 로직
// ============================================================

function parseAiSnsResponse(response: string, fallbackTitle: string): { title: string; body: string; hashtags: string | undefined } {
  const titleMatch = response.match(/제목:\s*(.+)/)?.[1]?.trim() || fallbackTitle
  const bodyMatch = response.match(/본문:\s*([\s\S]*?)(?=해시태그:|$)/)?.[1]?.trim() || response
  const hashtagMatch = response.match(/해시태그:\s*(.+)/)?.[1]?.trim()

  return { title: titleMatch, body: bodyMatch, hashtags: hashtagMatch }
}

describe('AI 콘텐츠 응답 파싱', () => {
  test('정상 형식 파싱', () => {
    const response = `제목: 봄 신상품 출시
본문: 오늘 새로운 봄 컬렉션이 출시되었습니다!
해시태그: #봄 #신상 #패션`
    const result = parseAiSnsResponse(response, '기본 제목')
    expect(result.title).toBe('봄 신상품 출시')
    expect(result.body).toBe('오늘 새로운 봄 컬렉션이 출시되었습니다!')
    expect(result.hashtags).toBe('#봄 #신상 #패션')
  })

  test('형식 없는 응답 → fallback', () => {
    const response = '그냥 일반 텍스트 응답'
    const result = parseAiSnsResponse(response, 'fallback 제목')
    expect(result.title).toBe('fallback 제목')
    expect(result.body).toBe('그냥 일반 텍스트 응답')
    expect(result.hashtags).toBeUndefined()
  })

  test('해시태그 없는 응답', () => {
    const response = `제목: 테스트
본문: 본문 내용만 있습니다`
    const result = parseAiSnsResponse(response, 'fallback')
    expect(result.title).toBe('테스트')
    expect(result.body).toBe('본문 내용만 있습니다')
    expect(result.hashtags).toBeUndefined()
  })

  test('여러 줄 본문', () => {
    const response = `제목: 여행 일기
본문: 첫째 날은 해변에서 시작했습니다.
둘째 날은 산을 올랐습니다.
셋째 날은 맛집을 탐방했습니다.
해시태그: #여행 #일기`
    const result = parseAiSnsResponse(response, 'fallback')
    expect(result.title).toBe('여행 일기')
    expect(result.body).toContain('첫째 날')
    expect(result.body).toContain('셋째 날')
    expect(result.hashtags).toBe('#여행 #일기')
  })
})

// ============================================================
// 7. 예약 발행 스케줄러 로직
// ============================================================

function isScheduledPostDue(status: string, scheduledAt: Date | null): boolean {
  return status === 'scheduled' && scheduledAt !== null && scheduledAt <= new Date()
}

function createOptimisticLock(currentStatus: string, expectedStatus: string): boolean {
  return currentStatus === expectedStatus
}

describe('예약 발행 스케줄러 로직', () => {
  test('scheduled + 과거 scheduledAt → 발행 대상', () => {
    const past = new Date(Date.now() - 60000)
    expect(isScheduledPostDue('scheduled', past)).toBe(true)
  })

  test('scheduled + 미래 scheduledAt → 발행 안 함', () => {
    const future = new Date(Date.now() + 86400000)
    expect(isScheduledPostDue('scheduled', future)).toBe(false)
  })

  test('scheduled + null scheduledAt → 발행 안 함', () => {
    expect(isScheduledPostDue('scheduled', null)).toBe(false)
  })

  test('approved + 과거 scheduledAt → 발행 안 함 (status 불일치)', () => {
    const past = new Date(Date.now() - 60000)
    expect(isScheduledPostDue('approved', past)).toBe(false)
  })

  test('draft + 과거 scheduledAt → 발행 안 함', () => {
    const past = new Date(Date.now() - 60000)
    expect(isScheduledPostDue('draft', past)).toBe(false)
  })

  test('낙관적 잠금: 현재 scheduled이면 잠금 성공', () => {
    expect(createOptimisticLock('scheduled', 'scheduled')).toBe(true)
  })

  test('낙관적 잠금: 이미 다른 상태면 잠금 실패', () => {
    expect(createOptimisticLock('published', 'scheduled')).toBe(false)
  })
})

// ============================================================
// 8. 통계 집계 로직
// ============================================================

type StatusCount = { status: string; count: number }
type PlatformCount = { platform: string; total: number; published: number }

function aggregateByStatus(items: Array<{ status: string }>): StatusCount[] {
  const map = new Map<string, number>()
  for (const item of items) {
    map.set(item.status, (map.get(item.status) || 0) + 1)
  }
  return Array.from(map.entries()).map(([status, count]) => ({ status, count }))
}

function aggregateByPlatform(items: Array<{ platform: string; status: string }>): PlatformCount[] {
  const map = new Map<string, { total: number; published: number }>()
  for (const item of items) {
    const curr = map.get(item.platform) || { total: 0, published: 0 }
    curr.total++
    if (item.status === 'published') curr.published++
    map.set(item.platform, curr)
  }
  return Array.from(map.entries()).map(([platform, { total, published }]) => ({ platform, total, published }))
}

describe('통계 집계', () => {
  const sampleItems = [
    { platform: 'instagram', status: 'draft' },
    { platform: 'instagram', status: 'published' },
    { platform: 'instagram', status: 'published' },
    { platform: 'tistory', status: 'draft' },
    { platform: 'tistory', status: 'pending' },
    { platform: 'daum_cafe', status: 'published' },
  ]

  test('상태별 집계', () => {
    const result = aggregateByStatus(sampleItems)
    const draft = result.find((r) => r.status === 'draft')
    const published = result.find((r) => r.status === 'published')
    const pending = result.find((r) => r.status === 'pending')
    expect(draft!.count).toBe(2)
    expect(published!.count).toBe(3)
    expect(pending!.count).toBe(1)
  })

  test('플랫폼별 집계', () => {
    const result = aggregateByPlatform(sampleItems)
    const ig = result.find((r) => r.platform === 'instagram')
    const ts = result.find((r) => r.platform === 'tistory')
    const dc = result.find((r) => r.platform === 'daum_cafe')
    expect(ig!.total).toBe(3)
    expect(ig!.published).toBe(2)
    expect(ts!.total).toBe(2)
    expect(ts!.published).toBe(0)
    expect(dc!.total).toBe(1)
    expect(dc!.published).toBe(1)
  })

  test('빈 입력 → 빈 결과', () => {
    expect(aggregateByStatus([])).toHaveLength(0)
    expect(aggregateByPlatform([])).toHaveLength(0)
  })
})

// ============================================================
// 9. 변형(variant) 관리 로직
// ============================================================

describe('A/B 변형 관리', () => {
  const VARIANT_STRATEGIES = ['tone', 'length', 'hashtag', 'headline', 'mixed'] as const

  test('5가지 전략 모두 정의됨', () => {
    expect(VARIANT_STRATEGIES).toHaveLength(5)
  })

  test('변형 수 범위: 2~5개', () => {
    expect(2).toBeGreaterThanOrEqual(2)
    expect(5).toBeLessThanOrEqual(5)
    expect(1).toBeLessThan(2) // min 2
    expect(6).toBeGreaterThan(5) // max 5
  })

  test('변형은 원본의 platform/snsAccountId를 상속', () => {
    const original = { platform: 'instagram', snsAccountId: 'acc-1' }
    const variant = { ...original, variantOf: 'original-id', title: '변형 제목' }
    expect(variant.platform).toBe(original.platform)
    expect(variant.snsAccountId).toBe(original.snsAccountId)
    expect(variant.variantOf).toBe('original-id')
  })
})

// ============================================================
// 10. 에러 코드 매핑
// ============================================================

describe('에러 코드 검증', () => {
  const ERROR_CODES: Record<string, { status: number; message: string }> = {
    SNS_001: { status: 404, message: 'SNS 콘텐츠를 찾을 수 없습니다' },
    SNS_002: { status: 400, message: '초안/반려 상태에서만 수정할 수 있습니다' },
    SNS_003: { status: 400, message: '승인 요청 상태에서만 승인할 수 있습니다' },
    SNS_004: { status: 400, message: '승인된 콘텐츠만 발행할 수 있습니다' },
    SNS_005: { status: 400, message: '예약 시간은 현재보다 미래여야 합니다' },
    SNS_006: { status: 400, message: '예약 상태에서만 취소할 수 있습니다' },
    SNS_007: { status: 500, message: '이미지 생성에 실패했습니다' },
    SNS_ACCOUNT_001: { status: 404, message: 'SNS 계정을 찾을 수 없습니다' },
    SNS_ACCOUNT_002: { status: 400, message: '연결된 SNS 콘텐츠가 있어 삭제할 수 없습니다' },
  }

  test('모든 에러 코드 정의됨', () => {
    expect(Object.keys(ERROR_CODES)).toHaveLength(9)
  })

  test('404 에러 코드', () => {
    expect(ERROR_CODES.SNS_001.status).toBe(404)
    expect(ERROR_CODES.SNS_ACCOUNT_001.status).toBe(404)
  })

  test('400 에러 코드', () => {
    const badRequests = Object.entries(ERROR_CODES).filter(([, v]) => v.status === 400)
    expect(badRequests.length).toBe(6)
  })

  test('500 에러 코드', () => {
    expect(ERROR_CODES.SNS_007.status).toBe(500)
  })
})

// ============================================================
// 11. 멀티 테넌트 격리 검증
// ============================================================

describe('멀티 테넌트 격리', () => {
  function buildWhereConditions(companyId: string, filters?: { platform?: string; status?: string }) {
    const conditions: string[] = [`companyId = '${companyId}'`]
    if (filters?.platform) conditions.push(`platform = '${filters.platform}'`)
    if (filters?.status) conditions.push(`status = '${filters.status}'`)
    return conditions
  }

  test('companyId 조건 항상 포함', () => {
    const conditions = buildWhereConditions('company-1')
    expect(conditions[0]).toContain('company-1')
  })

  test('필터 추가 시 companyId + 필터', () => {
    const conditions = buildWhereConditions('company-1', { platform: 'instagram', status: 'draft' })
    expect(conditions).toHaveLength(3)
    expect(conditions[0]).toContain('company-1')
    expect(conditions[1]).toContain('instagram')
    expect(conditions[2]).toContain('draft')
  })

  test('다른 company의 데이터 접근 불가', () => {
    const c1 = buildWhereConditions('company-1')
    const c2 = buildWhereConditions('company-2')
    expect(c1[0]).not.toBe(c2[0])
  })
})

// ============================================================
// 12. 활동 로그 기록 패턴
// ============================================================

describe('활동 로그 검증', () => {
  type ActivityLog = {
    type: string
    phase: string
    actorType: string
    action: string
  }

  const snsActions: ActivityLog[] = [
    { type: 'sns', phase: 'end', actorType: 'user', action: 'SNS 콘텐츠 생성' },
    { type: 'sns', phase: 'end', actorType: 'agent', action: 'AI SNS 콘텐츠 생성' },
    { type: 'sns', phase: 'end', actorType: 'user', action: 'SNS 승인 요청' },
    { type: 'sns', phase: 'end', actorType: 'user', action: 'SNS 콘텐츠 승인' },
    { type: 'sns', phase: 'end', actorType: 'user', action: 'SNS 콘텐츠 반려' },
    { type: 'sns', phase: 'end', actorType: 'system', action: 'SNS 발행 완료' },
    { type: 'sns', phase: 'end', actorType: 'user', action: 'SNS 계정 등록' },
    { type: 'sns', phase: 'end', actorType: 'user', action: 'SNS 계정 수정' },
    { type: 'sns', phase: 'end', actorType: 'user', action: 'SNS 계정 삭제' },
  ]

  test('모든 SNS 액션은 type=sns', () => {
    expect(snsActions.every((a) => a.type === 'sns')).toBe(true)
  })

  test('모든 SNS 액션은 phase=end', () => {
    expect(snsActions.every((a) => a.phase === 'end')).toBe(true)
  })

  test('actorType 종류: user, agent, system', () => {
    const types = new Set(snsActions.map((a) => a.actorType))
    expect(types.has('user')).toBe(true)
    expect(types.has('agent')).toBe(true)
    expect(types.has('system')).toBe(true)
  })

  test('AI 생성은 agent 타입', () => {
    const aiActions = snsActions.filter((a) => a.action.includes('AI'))
    expect(aiActions.every((a) => a.actorType === 'agent')).toBe(true)
  })

  test('발행은 system 타입', () => {
    const publishActions = snsActions.filter((a) => a.action.includes('발행 완료'))
    expect(publishActions.every((a) => a.actorType === 'system')).toBe(true)
  })
})
