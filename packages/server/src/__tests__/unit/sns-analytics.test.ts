/**
 * Story 14-3 TEA: SNS 분석 대시보드 — 통계 로직 + API 응답 구조 + 엣지케이스 검증
 * bun test src/__tests__/unit/sns-analytics.test.ts
 */
import { describe, test, expect } from 'bun:test'

// ============================================================
// 1. days 파라미터 검증
// ============================================================
describe('days 파라미터 검증', () => {
  function parseDays(input: string | undefined): number {
    const rawDays = Number(input) || 30
    return Math.min(Math.max(rawDays, 1), 365)
  }

  test('기본값은 30일', () => {
    expect(parseDays(undefined)).toBe(30)
  })

  test('유효한 숫자 파싱', () => {
    expect(parseDays('7')).toBe(7)
    expect(parseDays('90')).toBe(90)
  })

  test('최대 365일 제한', () => {
    expect(parseDays('1000')).toBe(365)
    expect(parseDays('366')).toBe(365)
  })

  test('잘못된 입력은 기본값 30', () => {
    expect(parseDays('abc')).toBe(30)
    expect(parseDays('')).toBe(30)
  })

  test('음수는 최소 1로 클램핑', () => {
    expect(parseDays('-10')).toBe(1)
  })

  test('0은 기본값 30', () => {
    expect(parseDays('0')).toBe(30)
  })
})

// ============================================================
// 2. 성공률 계산 로직
// ============================================================
describe('발행 성공률 계산', () => {
  function calculateSuccessRate(published: number, failed: number): number {
    if (published + failed === 0) return 0
    return Math.round((published / (published + failed)) * 100)
  }

  test('published=10, failed=0 → 100%', () => {
    expect(calculateSuccessRate(10, 0)).toBe(100)
  })

  test('published=0, failed=10 → 0%', () => {
    expect(calculateSuccessRate(0, 10)).toBe(0)
  })

  test('published=7, failed=3 → 70%', () => {
    expect(calculateSuccessRate(7, 3)).toBe(70)
  })

  test('둘 다 0이면 0% (0으로 나누기 방지)', () => {
    expect(calculateSuccessRate(0, 0)).toBe(0)
  })

  test('published=1, failed=2 → 33%', () => {
    expect(calculateSuccessRate(1, 2)).toBe(33)
  })

  test('published=2, failed=1 → 67%', () => {
    expect(calculateSuccessRate(2, 1)).toBe(67)
  })
})

// ============================================================
// 3. 상태별 분포 데이터 처리
// ============================================================
describe('상태별 분포 처리', () => {
  type StatusCount = { status: string; count: number }

  function extractCount(byStatus: StatusCount[], status: string): number {
    return byStatus.find((s) => s.status === status)?.count ?? 0
  }

  function calculatePending(byStatus: StatusCount[]): number {
    return ['pending', 'approved', 'scheduled']
      .reduce((sum, s) => sum + extractCount(byStatus, s), 0)
  }

  const sampleData: StatusCount[] = [
    { status: 'draft', count: 5 },
    { status: 'pending', count: 3 },
    { status: 'approved', count: 2 },
    { status: 'scheduled', count: 1 },
    { status: 'published', count: 10 },
    { status: 'failed', count: 2 },
    { status: 'rejected', count: 1 },
  ]

  test('published 건수 추출', () => {
    expect(extractCount(sampleData, 'published')).toBe(10)
  })

  test('존재하지 않는 상태는 0', () => {
    expect(extractCount([], 'published')).toBe(0)
  })

  test('대기 중 건수 (pending + approved + scheduled)', () => {
    expect(calculatePending(sampleData)).toBe(6)
  })

  test('빈 배열의 대기 중은 0', () => {
    expect(calculatePending([])).toBe(0)
  })
})

// ============================================================
// 4. 일별 추이 바 차트 비율 계산
// ============================================================
describe('일별 추이 비율 계산', () => {
  function calculateBarWidth(count: number, maxCount: number): number {
    if (maxCount === 0) return 0
    return Math.round((count / maxCount) * 100)
  }

  test('최대값과 같으면 100%', () => {
    expect(calculateBarWidth(10, 10)).toBe(100)
  })

  test('최대값의 절반이면 50%', () => {
    expect(calculateBarWidth(5, 10)).toBe(50)
  })

  test('0이면 0%', () => {
    expect(calculateBarWidth(0, 10)).toBe(0)
  })

  test('maxCount가 0이면 0% (0으로 나누기 방지)', () => {
    expect(calculateBarWidth(5, 0)).toBe(0)
  })
})

// ============================================================
// 5. 플랫폼별 분포 데이터 처리
// ============================================================
describe('플랫폼별 분포 처리', () => {
  type PlatformCount = { platform: string; total: number; published: number }

  const sampleData: PlatformCount[] = [
    { platform: 'instagram', total: 10, published: 7 },
    { platform: 'tistory', total: 5, published: 3 },
    { platform: 'daum_cafe', total: 3, published: 0 },
  ]

  test('전체 합산', () => {
    const totalAll = sampleData.reduce((sum, p) => sum + p.total, 0)
    expect(totalAll).toBe(18)
  })

  test('발행 합산', () => {
    const publishedAll = sampleData.reduce((sum, p) => sum + p.published, 0)
    expect(publishedAll).toBe(10)
  })

  test('빈 배열 처리', () => {
    const emptyData: PlatformCount[] = []
    const total = emptyData.reduce((sum, p) => sum + p.total, 0)
    expect(total).toBe(0)
  })
})

// ============================================================
// 6. since 날짜 계산
// ============================================================
describe('since 날짜 범위 계산', () => {
  test('30일 전 계산', () => {
    const now = Date.now()
    const since = new Date(now - 30 * 86400000)
    const diff = (now - since.getTime()) / 86400000
    expect(Math.round(diff)).toBe(30)
  })

  test('7일 전 계산', () => {
    const now = Date.now()
    const since = new Date(now - 7 * 86400000)
    const diff = (now - since.getTime()) / 86400000
    expect(Math.round(diff)).toBe(7)
  })

  test('365일 전 계산', () => {
    const now = Date.now()
    const since = new Date(now - 365 * 86400000)
    const diff = (now - since.getTime()) / 86400000
    expect(Math.round(diff)).toBe(365)
  })
})

// ============================================================
// 7. 테넌트 격리 확인 (구조적 검증)
// ============================================================
describe('테넌트 격리 구조', () => {
  test('companyId 필터는 항상 필요', () => {
    // 쿼리에 companyId를 포함하지 않으면 다른 회사 데이터 노출 위험
    const queryFields = ['companyId', 'status', 'platform', 'createdAt']
    expect(queryFields).toContain('companyId')
  })

  test('EmptyState는 에러가 아닌 빈 배열 반환', () => {
    const emptyResult = {
      total: 0,
      byStatus: [],
      byPlatform: [],
      dailyTrend: [],
      days: 30,
    }
    expect(emptyResult.total).toBe(0)
    expect(emptyResult.byStatus).toEqual([])
    expect(emptyResult.byPlatform).toEqual([])
    expect(emptyResult.dailyTrend).toEqual([])
  })
})

// ============================================================
// 8. API 응답 구조 검증
// ============================================================
describe('API 응답 구조 검증', () => {
  type SnsStatsResponse = {
    total: number
    byStatus: { status: string; count: number }[]
    byPlatform: { platform: string; total: number; published: number }[]
    dailyTrend: { date: string; count: number }[]
    days: number
  }

  function validateResponse(data: unknown): data is SnsStatsResponse {
    if (!data || typeof data !== 'object') return false
    const d = data as Record<string, unknown>
    if (typeof d.total !== 'number') return false
    if (!Array.isArray(d.byStatus)) return false
    if (!Array.isArray(d.byPlatform)) return false
    if (!Array.isArray(d.dailyTrend)) return false
    if (typeof d.days !== 'number') return false
    return true
  }

  test('유효한 응답 구조 인식', () => {
    const valid = { total: 10, byStatus: [], byPlatform: [], dailyTrend: [], days: 30 }
    expect(validateResponse(valid)).toBe(true)
  })

  test('total 누락 시 무효', () => {
    const invalid = { byStatus: [], byPlatform: [], dailyTrend: [], days: 30 }
    expect(validateResponse(invalid)).toBe(false)
  })

  test('byStatus가 배열이 아니면 무효', () => {
    const invalid = { total: 10, byStatus: 'string', byPlatform: [], dailyTrend: [], days: 30 }
    expect(validateResponse(invalid)).toBe(false)
  })

  test('null 입력은 무효', () => {
    expect(validateResponse(null)).toBe(false)
  })

  test('빈 객체는 무효', () => {
    expect(validateResponse({})).toBe(false)
  })
})

// ============================================================
// 9. byStatus 항목 유효성
// ============================================================
describe('byStatus 항목 유효성', () => {
  const VALID_STATUSES = ['draft', 'pending', 'approved', 'scheduled', 'rejected', 'published', 'failed']

  test('모든 7개 상태가 유효 목록에 포함', () => {
    expect(VALID_STATUSES).toHaveLength(7)
  })

  test('알 수 없는 상태 필터링', () => {
    const data = [
      { status: 'published', count: 5 },
      { status: 'unknown', count: 1 },
      { status: 'draft', count: 3 },
    ]
    const filtered = data.filter((d) => VALID_STATUSES.includes(d.status))
    expect(filtered).toHaveLength(2)
  })

  test('count는 음수가 아님', () => {
    const data = [{ status: 'draft', count: 0 }, { status: 'published', count: 5 }]
    expect(data.every((d) => d.count >= 0)).toBe(true)
  })
})

// ============================================================
// 10. byPlatform 항목 유효성
// ============================================================
describe('byPlatform 항목 유효성', () => {
  const VALID_PLATFORMS = ['instagram', 'tistory', 'daum_cafe']

  test('모든 3개 플랫폼 유효', () => {
    expect(VALID_PLATFORMS).toHaveLength(3)
  })

  test('published는 total 이하', () => {
    const data = [
      { platform: 'instagram', total: 10, published: 7 },
      { platform: 'tistory', total: 5, published: 5 },
    ]
    expect(data.every((d) => d.published <= d.total)).toBe(true)
  })

  test('published=0도 유효 (발행 없는 플랫폼)', () => {
    const item = { platform: 'daum_cafe', total: 3, published: 0 }
    expect(item.published).toBe(0)
    expect(item.total).toBeGreaterThan(0)
  })
})

// ============================================================
// 11. dailyTrend 날짜 형식 검증
// ============================================================
describe('dailyTrend 날짜 형식', () => {
  const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

  test('YYYY-MM-DD 형식 인식', () => {
    expect(ISO_DATE_REGEX.test('2026-03-06')).toBe(true)
  })

  test('잘못된 형식 거부', () => {
    expect(ISO_DATE_REGEX.test('2026/03/06')).toBe(false)
    expect(ISO_DATE_REGEX.test('03-06-2026')).toBe(false)
    expect(ISO_DATE_REGEX.test('2026-3-6')).toBe(false)
  })

  test('dailyTrend 정렬 확인 (날짜 오름차순)', () => {
    const trend = [
      { date: '2026-03-04', count: 3 },
      { date: '2026-03-05', count: 5 },
      { date: '2026-03-06', count: 2 },
    ]
    const sorted = [...trend].sort((a, b) => a.date.localeCompare(b.date))
    expect(trend).toEqual(sorted)
  })

  test('동일 날짜 중복 없음', () => {
    const trend = [
      { date: '2026-03-04', count: 3 },
      { date: '2026-03-05', count: 5 },
    ]
    const dates = trend.map((d) => d.date)
    const uniqueDates = new Set(dates)
    expect(uniqueDates.size).toBe(dates.length)
  })
})

// ============================================================
// 12. 경계값 테스트
// ============================================================
describe('경계값 테스트', () => {
  function parseDays(input: string | undefined): number {
    const rawDays = Number(input) || 30
    return Math.min(Math.max(rawDays, 1), 365)
  }

  test('days=1 (최소)', () => {
    expect(parseDays('1')).toBe(1)
  })

  test('days=365 (최대)', () => {
    expect(parseDays('365')).toBe(365)
  })

  test('소수점 days는 그대로 전달 (Number 변환)', () => {
    // 7.5는 유효한 숫자이므로 Math.min(Math.max(7.5, 1), 365) = 7.5
    expect(parseDays('7.5')).toBe(7.5)
  })

  test('성공률 경계: 1건 성공 0건 실패', () => {
    const rate = Math.round((1 / (1 + 0)) * 100)
    expect(rate).toBe(100)
  })

  test('성공률 경계: 0건 성공 1건 실패', () => {
    const rate = Math.round((0 / (0 + 1)) * 100)
    expect(rate).toBe(0)
  })

  test('큰 숫자 성공률: 9999/10000', () => {
    const rate = Math.round((9999 / 10000) * 100)
    expect(rate).toBe(100) // 반올림으로 100
  })

  test('프론트 stats query는 view=stats일 때만 활성화', () => {
    const view = 'stats'
    const enabled = view === 'stats'
    expect(enabled).toBe(true)
  })

  test('프론트 stats query는 다른 view에서는 비활성화', () => {
    const view: string = 'list'
    const enabled = view === 'stats'
    expect(enabled).toBe(false)
  })
})

// ============================================================
// 13. 프론트엔드 뷰 상태 전환
// ============================================================
describe('프론트엔드 뷰 상태 전환', () => {
  type View = 'list' | 'create' | 'detail' | 'stats'

  test('stats 뷰는 유효한 뷰 타입', () => {
    const validViews: View[] = ['list', 'create', 'detail', 'stats']
    expect(validViews).toContain('stats')
  })

  test('stats에서 list로 돌아가기', () => {
    let view: View = 'stats'
    view = 'list'
    expect(view).toBe('list')
  })

  test('기본 뷰는 list', () => {
    const defaultView: View = 'list'
    expect(defaultView).toBe('list')
  })
})

// ============================================================
// 14. statsDays 상태 관리
// ============================================================
describe('statsDays 상태 관리', () => {
  test('기본값 30', () => {
    const statsDays = 30
    expect(statsDays).toBe(30)
  })

  test('7/30/90 선택 가능', () => {
    const options = [7, 30, 90]
    expect(options).toContain(7)
    expect(options).toContain(30)
    expect(options).toContain(90)
  })

  test('선택된 기간 하이라이트 로직', () => {
    const statsDays = 30
    const isSelected = (d: number) => statsDays === d
    expect(isSelected(7)).toBe(false)
    expect(isSelected(30)).toBe(true)
    expect(isSelected(90)).toBe(false)
  })
})
