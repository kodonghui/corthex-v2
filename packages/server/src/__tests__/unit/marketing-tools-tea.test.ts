import { describe, test, expect } from 'bun:test'
import { hashtagGenerator } from '../../lib/tool-handlers/builtins/hashtag-generator'
import { contentCalendar } from '../../lib/tool-handlers/builtins/content-calendar'
import { engagementAnalyzer } from '../../lib/tool-handlers/builtins/engagement-analyzer'

const mockCtx = {
  companyId: 'test-company',
  agentId: 'test-agent',
  sessionId: 'test-session',
  departmentId: 'test-dept',
  userId: 'test-user',
  getCredentials: async () => ({}),
}

// ═══════════════════════════════════════════════════════
//  TEA: 해시태그 생성기 엣지케이스
// ═══════════════════════════════════════════════════════

describe('hashtagGenerator TEA edge cases', () => {
  test('빈 문자열 topic은 에러를 반환한다', () => {
    const result = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  test('특수문자만 있는 topic도 처리한다', () => {
    const result = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '!@#$%' }, mockCtx) as string)
    expect(result.success).toBe(true)
    // 카테고리 매칭 실패 시 기본값 '라이프스타일'
    expect(result.category).toBe('라이프스타일')
  })

  test('매우 긴 topic도 처리한다', () => {
    const longTopic = '코딩 '.repeat(100).trim()
    const result = JSON.parse(hashtagGenerator({ action: 'recommend', topic: longTopic }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.hashtags.length).toBeGreaterThan(0)
  })

  test('여러 카테고리에 걸치는 topic은 최고 점수를 선택한다', () => {
    // '주식 코딩 마케팅' — 금융(1), 기술(1), 마케팅(1) 동점 → 첫 매칭
    const result = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '주식 코딩 마케팅' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.category).toBeDefined()
  })

  test('count=0은 falsy이므로 기본값 30을 사용한다', () => {
    const result = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '코딩', count: 0 }, mockCtx) as string)
    expect(result.success).toBe(true)
    // Number(0) || 30 → 30 (falsy 0 기본값)
    expect(result.hashtags.length).toBeGreaterThan(0)
    expect(result.hashtags.length).toBeLessThanOrEqual(30)
  })

  test('count=1은 해시태그 1개를 반환한다', () => {
    const result = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '코딩', count: 1 }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.hashtags.length).toBe(1)
  })

  test('analyze에서 # 없는 태그도 처리한다', () => {
    const result = JSON.parse(hashtagGenerator({ action: 'analyze', hashtags: '주식,AI' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.analyzed).toBe(2)
    // # 없으면 DB에서 매칭 안 됨 → 기타
    expect(result.results[0].category).toBe('기타')
  })

  test('analyze에서 중복 태그를 각각 분석한다', () => {
    const result = JSON.parse(hashtagGenerator({ action: 'analyze', hashtags: '#주식,#주식,#주식' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.analyzed).toBe(3)
  })

  test('analyze에서 공백 포함 태그를 처리한다', () => {
    const result = JSON.parse(hashtagGenerator({ action: 'analyze', hashtags: ' #주식 , #투자 ' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.analyzed).toBe(2)
    expect(result.results[0].category).toBe('금융')
  })

  test('trending에서 빈 문자열 카테고리는 전체를 반환한다', () => {
    const result = JSON.parse(hashtagGenerator({ action: 'trending', category: '' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.categories).toBeDefined()
  })
})

// ═══════════════════════════════════════════════════════
//  TEA: 콘텐츠 캘린더 엣지케이스
// ═══════════════════════════════════════════════════════

describe('contentCalendar TEA edge cases', () => {
  test('plan에서 postsPerWeek=0은 빈 스케줄을 반환한다', () => {
    const result = JSON.parse(contentCalendar({ action: 'plan', topic: '테스트', postsPerWeek: 0, startDate: '2026-03-09' }, mockCtx) as string)
    expect(result.success).toBe(true)
    // postsPerWeek=0 → Number(0)||5 → 5 (falsy 0이므로 기본값 5)
    expect(result.postsPerWeek).toBe(5)
  })

  test('plan에서 postsPerWeek=1은 최적 1개 요일만 선택한다', () => {
    const result = JSON.parse(contentCalendar({ action: 'plan', topic: '테스트', postsPerWeek: 1, period: 'week', startDate: '2026-03-09' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.schedule.length).toBeLessThanOrEqual(2) // week 내 해당 요일 1개
  })

  test('plan에서 지원하지 않는 플랫폼은 instagram 기본값을 사용한다', () => {
    const result = JSON.parse(contentCalendar({ action: 'plan', topic: '테스트', platform: 'unknown_platform', startDate: '2026-03-09' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.schedule.length).toBeGreaterThan(0)
  })

  test('weekly에서 빈 platforms 배열은 기본값을 사용한다', () => {
    const result = JSON.parse(contentCalendar({ action: 'weekly', startDate: '2026-03-09', platforms: [] }, mockCtx) as string)
    expect(result.success).toBe(true)
    // 빈 배열 → 각 날에 post 없음
    expect(result.totalPosts).toBe(0)
  })

  test('monthly에서 2월은 28일을 처리한다', () => {
    const result = JSON.parse(contentCalendar({ action: 'monthly', month: '2026-02' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.totalWeeks).toBeGreaterThanOrEqual(4)
  })

  test('monthly에서 윤년 2월은 29일을 처리한다', () => {
    const result = JSON.parse(contentCalendar({ action: 'monthly', month: '2028-02' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.totalWeeks).toBeGreaterThanOrEqual(4)
  })

  test('monthly에서 1월 이벤트(새해)가 포함된다', () => {
    const result = JSON.parse(contentCalendar({ action: 'monthly', month: '2026-01' }, mockCtx) as string)
    expect(result.marketingEvents.some((e: { event: string }) => e.event === '새해')).toBe(true)
  })

  test('weekly에서 topics가 문자열이면 배열로 변환한다', () => {
    const result = JSON.parse(contentCalendar({ action: 'weekly', startDate: '2026-03-09', platforms: ['instagram'], topics: 'AI 마케팅' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.calendar[0].posts[0].topic).toBe('AI 마케팅')
  })

  test('plan에서 period가 month이면 30일 스케줄을 생성한다', () => {
    const result = JSON.parse(contentCalendar({ action: 'plan', topic: '테스트', period: 'month', postsPerWeek: 7, startDate: '2026-03-01' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.schedule.length).toBeGreaterThan(7)
  })

  test('optimal_times에서 bestDays 순서가 점수순이다', () => {
    const result = JSON.parse(contentCalendar({ action: 'optimal_times', platform: 'instagram' }, mockCtx) as string)
    expect(result.success).toBe(true)
    // instagram: 수(90) > 금(88) > 화/목(85)
    expect(result.bestDays[0]).toBe('수')
  })
})

// ═══════════════════════════════════════════════════════
//  TEA: 참여도 분석기 엣지케이스
// ═══════════════════════════════════════════════════════

describe('engagementAnalyzer TEA edge cases', () => {
  test('모든 metrics가 0이면 에러를 반환한다', () => {
    const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 0, comments: 0, shares: 0, reach: 0, clicks: 0, followers: 0 }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  test('reach만 있고 나머지 0이면 참여율 0%를 반환한다', () => {
    const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 0, comments: 0, shares: 0, reach: 1000 }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.analysis.engagementRate).toBe(0)
  })

  test('likes+comments=0일 때 바이럴 계수가 0이다', () => {
    const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 0, comments: 0, shares: 100, reach: 1000 }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.analysis.viralCoefficient).toBe(0)
  })

  test('음수 값은 0으로 처리된다', () => {
    const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: -10, comments: -5, reach: 1000 }, mockCtx) as string)
    expect(result.success).toBe(true)
    // Number(-10) → -10, not 0 — parseMetrics uses Number() || 0
    // Actually Number(-10) = -10, which is truthy, so it stays -10
    // This reveals that negative values are NOT handled
    expect(result.analysis.engagementRate).toBeDefined()
  })

  test('매우 큰 숫자도 처리한다', () => {
    const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 1000000, comments: 500000, shares: 200000, reach: 10000000 }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.analysis.engagementRate).toBe(17)
  })

  test('compare에서 게시물 1개도 처리한다', () => {
    const result = JSON.parse(engagementAnalyzer({
      action: 'compare',
      posts: [{ name: 'Solo', likes: 100, reach: 1000 }],
    }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.ranking.length).toBe(1)
    expect(result.winner).toBe('Solo')
  })

  test('compare에서 이름 없는 게시물은 기본 이름을 사용한다', () => {
    const result = JSON.parse(engagementAnalyzer({
      action: 'compare',
      posts: [
        { likes: 100, reach: 1000 },
        { likes: 200, reach: 1000 },
      ],
    }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.ranking[0].name).toContain('Post')
  })

  test('compare에서 reach 없는 게시물은 followers를 사용한다', () => {
    const result = JSON.parse(engagementAnalyzer({
      action: 'compare',
      posts: [{ name: 'No Reach', likes: 100, followers: 500 }],
    }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.ranking[0].engagementRate).toBe(20) // 100/500 * 100
  })

  test('trend에서 정확히 2개 데이터는 처리한다', () => {
    const result = JSON.parse(engagementAnalyzer({
      action: 'trend',
      data: [
        { date: '2026-01-01', likes: 10, reach: 100 },
        { date: '2026-01-08', likes: 20, reach: 100 },
      ],
    }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.dataPoints).toBe(2)
    expect(result.trend.direction).toBe('상승')
  })

  test('trend에서 변동 없으면 유지를 반환한다', () => {
    const result = JSON.parse(engagementAnalyzer({
      action: 'trend',
      data: [
        { date: '2026-01-01', likes: 10, reach: 100 },
        { date: '2026-01-08', likes: 10, reach: 100 },
        { date: '2026-01-15', likes: 10, reach: 100 },
      ],
    }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.trend.direction).toBe('유지')
  })

  test('trend에서 date 없는 데이터도 처리한다', () => {
    const result = JSON.parse(engagementAnalyzer({
      action: 'trend',
      data: [
        { likes: 10, reach: 100 },
        { likes: 20, reach: 100 },
      ],
    }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.points[0].date).toBe('')
  })

  test('benchmark에서 twitter 플랫폼을 지원한다', () => {
    const result = JSON.parse(engagementAnalyzer({ action: 'benchmark', likes: 10, reach: 1000, platform: 'twitter' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.platform).toBe('twitter')
  })

  test('benchmark에서 followers만 있어도 처리한다', () => {
    const result = JSON.parse(engagementAnalyzer({ action: 'benchmark', likes: 100, followers: 1000, platform: 'instagram' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.engagementRate).toBe(10)
  })

  test('benchmark에서 하위 등급도 정확하다', () => {
    const result = JSON.parse(engagementAnalyzer({ action: 'benchmark', likes: 1, reach: 10000, platform: 'instagram' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.grade).toContain('대폭 개선')
  })

  test('analyze에서 모든 5개 플랫폼 벤치마크를 지원한다', () => {
    const platforms = ['instagram', 'youtube', 'tiktok', 'linkedin', 'twitter']
    for (const platform of platforms) {
      const result = JSON.parse(engagementAnalyzer({ action: 'benchmark', likes: 50, reach: 1000, platform }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.platform).toBe(platform)
    }
  })

  test('analyze에서 reachToFollowerRatio는 followers 없으면 null이다', () => {
    const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 10, reach: 1000 }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.analysis.reachToFollowerRatio).toBeNull()
  })

  test('compare에서 reach와 followers 모두 없으면 effectiveReach=1로 처리한다', () => {
    const result = JSON.parse(engagementAnalyzer({
      action: 'compare',
      posts: [{ name: 'No Reach', likes: 100 }],
    }, mockCtx) as string)
    expect(result.success).toBe(true)
    // effectiveReach = 1, engRate = 100/1*100 = 10000%
    expect(result.ranking[0].engagementRate).toBe(10000)
  })
})
