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
//  해시태그 생성기
// ═══════════════════════════════════════════════════════

describe('hashtagGenerator', () => {
  describe('action=recommend', () => {
    test('주제로 해시태그를 추천한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'recommend', topic: 'AI 개발 프로그래밍' }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.category).toBe('기술')
      expect(result.hashtags.length).toBeGreaterThan(0)
      expect(result.breakdown).toBeDefined()
    })

    test('플랫폼별 max_tags를 존중한다', () => {
      const instagram = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '마케팅', platform: 'instagram' }, mockCtx) as string)
      expect(instagram.hashtags.length).toBeLessThanOrEqual(30)

      const linkedin = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '마케팅', platform: 'linkedin' }, mockCtx) as string)
      expect(linkedin.hashtags.length).toBeLessThanOrEqual(5)

      const tiktok = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '마케팅', platform: 'tiktok' }, mockCtx) as string)
      expect(tiktok.hashtags.length).toBeLessThanOrEqual(10)
    })

    test('카테고리를 올바르게 매칭한다', () => {
      const finResult = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '주식 투자 재테크' }, mockCtx) as string)
      expect(finResult.category).toBe('금융')

      const eduResult = JSON.parse(hashtagGenerator({ action: 'recommend', topic: 'LEET 로스쿨 공부' }, mockCtx) as string)
      expect(eduResult.category).toBe('교육')

      const healthResult = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '요가 필라테스 웰니스' }, mockCtx) as string)
      expect(healthResult.category).toBe('건강')
    })

    test('대형/중형/소형 분류가 포함된다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '코딩' }, mockCtx) as string)
      expect(result.breakdown.large).toBeDefined()
      expect(result.breakdown.medium).toBeDefined()
      expect(result.breakdown.small).toBeDefined()
    })

    test('주제 기반 커스텀 해시태그를 생성한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '리액트 개발' }, mockCtx) as string)
      expect(result.hashtags.some((h: string) => h.includes('리액트'))).toBe(true)
    })

    test('topic 없으면 에러를 반환한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'recommend' }, mockCtx) as string)
      expect(result.success).toBe(false)
      expect(result.message).toContain('topic')
    })

    test('count 파라미터로 개수를 제한한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '마케팅', count: 5 }, mockCtx) as string)
      expect(result.hashtags.length).toBeLessThanOrEqual(5)
    })

    test('platformTip이 포함된다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '코딩', platform: 'youtube' }, mockCtx) as string)
      expect(result.platformTip).toContain('유튜브')
    })

    test('알 수 없는 플랫폼은 instagram 기본값을 사용한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'recommend', topic: '코딩', platform: 'unknown' }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.hashtags.length).toBeLessThanOrEqual(30)
    })
  })

  describe('action=analyze', () => {
    test('해시태그를 분석한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'analyze', hashtags: '#주식,#투자,#AI에이전트' }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.analyzed).toBe(3)
      expect(result.results.length).toBe(3)
    })

    test('카테고리와 규모를 분류한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'analyze', hashtags: '#주식' }, mockCtx) as string)
      expect(result.results[0].category).toBe('금융')
      expect(result.results[0].size).toBe('대형')
    })

    test('DB에 없는 해시태그는 기타로 분류한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'analyze', hashtags: '#없는태그123' }, mockCtx) as string)
      expect(result.results[0].category).toBe('기타')
      expect(result.results[0].size).toBe('분류불가')
    })

    test('sizeDistribution을 반환한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'analyze', hashtags: '#주식,#AI에이전트' }, mockCtx) as string)
      expect(result.sizeDistribution).toBeDefined()
    })

    test('hashtags 없으면 에러를 반환한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'analyze' }, mockCtx) as string)
      expect(result.success).toBe(false)
    })

    test('recommendation을 포함한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'analyze', hashtags: '#주식' }, mockCtx) as string)
      expect(result.recommendation).toBeDefined()
    })
  })

  describe('action=trending', () => {
    test('모든 카테고리를 반환한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'trending' }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.categories).toContain('기술')
      expect(result.categories).toContain('금융')
    })

    test('특정 카테고리만 반환할 수 있다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'trending', category: '기술' }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.category).toBe('기술')
      expect(result.tags).toBeDefined()
    })

    test('존재하지 않는 카테고리는 전체를 반환한다', () => {
      const result = JSON.parse(hashtagGenerator({ action: 'trending', category: '없는카테고리' }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.categories).toBeDefined()
    })
  })

  test('알 수 없는 action은 에러를 반환한다', () => {
    const result = JSON.parse(hashtagGenerator({ action: 'unknown' }, mockCtx) as string)
    expect(result.success).toBe(false)
    expect(result.message).toContain('알 수 없는 action')
  })

  test('action 미지정 시 recommend 기본값을 사용한다', () => {
    const result = JSON.parse(hashtagGenerator({ topic: 'AI 개발' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.hashtags).toBeDefined()
  })
})

// ═══════════════════════════════════════════════════════
//  콘텐츠 캘린더 플래너
// ═══════════════════════════════════════════════════════

describe('contentCalendar', () => {
  describe('action=plan', () => {
    test('주간 게시 일정을 생성한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'plan', topic: 'AI 마케팅', platform: 'instagram', period: 'week', startDate: '2026-03-09' }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.schedule.length).toBeGreaterThan(0)
      expect(result.schedule[0].date).toBeDefined()
      expect(result.schedule[0].time).toBeDefined()
    })

    test('월간 게시 일정을 생성한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'plan', topic: '콘텐츠 마케팅', period: 'month', startDate: '2026-03-01' }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.schedule.length).toBeGreaterThan(7)
    })

    test('postsPerWeek로 빈도를 조절한다', () => {
      const result3 = JSON.parse(contentCalendar({ action: 'plan', topic: '테스트', postsPerWeek: 3, period: 'week', startDate: '2026-03-09' }, mockCtx) as string)
      const result7 = JSON.parse(contentCalendar({ action: 'plan', topic: '테스트', postsPerWeek: 7, period: 'week', startDate: '2026-03-09' }, mockCtx) as string)
      expect(result3.schedule.length).toBeLessThanOrEqual(result7.schedule.length)
    })

    test('topic 없으면 에러를 반환한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'plan' }, mockCtx) as string)
      expect(result.success).toBe(false)
      expect(result.message).toContain('topic')
    })

    test('contentTypeGuide를 포함한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'plan', topic: '마케팅' }, mockCtx) as string)
      expect(result.contentTypeGuide).toBeDefined()
    })
  })

  describe('action=optimal_times', () => {
    test('플랫폼별 최적 시간대를 반환한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'optimal_times', platform: 'instagram' }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.schedule).toBeDefined()
      expect(result.bestDays.length).toBe(3)
    })

    test('youtube 최적 시간대를 반환한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'optimal_times', platform: 'youtube' }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.platform).toBe('youtube')
    })

    test('지원하지 않는 플랫폼은 에러를 반환한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'optimal_times', platform: 'unknown' }, mockCtx) as string)
      expect(result.success).toBe(false)
    })

    test('recommendation을 포함한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'optimal_times', platform: 'tiktok' }, mockCtx) as string)
      expect(result.recommendation).toContain('tiktok')
    })
  })

  describe('action=weekly', () => {
    test('주간 캘린더를 생성한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'weekly', startDate: '2026-03-09', platforms: ['instagram'], topics: ['AI'] }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.calendar.length).toBe(7)
      expect(result.totalPosts).toBeGreaterThan(0)
    })

    test('다수 플랫폼을 지원한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'weekly', startDate: '2026-03-09', platforms: ['instagram', 'youtube'] }, mockCtx) as string)
      expect(result.platforms.length).toBe(2)
    })

    test('단일 플랫폼 문자열을 배열로 변환한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'weekly', startDate: '2026-03-09', platforms: 'instagram' }, mockCtx) as string)
      expect(result.success).toBe(true)
    })
  })

  describe('action=monthly', () => {
    test('월간 캘린더를 생성한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'monthly', month: '2026-03' }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.totalWeeks).toBeGreaterThanOrEqual(4)
      expect(result.totalPosts).toBeGreaterThan(0)
    })

    test('마케팅 이벤트를 포함한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'monthly', month: '2026-12' }, mockCtx) as string)
      expect(result.marketingEvents.some((e: { event: string }) => e.event === '크리스마스')).toBe(true)
    })

    test('주별 이벤트를 포함한다', () => {
      const result = JSON.parse(contentCalendar({ action: 'monthly', month: '2026-12' }, mockCtx) as string)
      const hasEvents = result.weeks.some((w: { events: string[] }) => w.events.length > 0)
      expect(hasEvents).toBe(true)
    })
  })

  test('알 수 없는 action은 에러를 반환한다', () => {
    const result = JSON.parse(contentCalendar({ action: 'unknown' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  test('action 미지정 시 plan 기본값을 사용한다', () => {
    const result = JSON.parse(contentCalendar({ topic: '테스트' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.schedule).toBeDefined()
  })
})

// ═══════════════════════════════════════════════════════
//  참여도 분석기
// ═══════════════════════════════════════════════════════

describe('engagementAnalyzer', () => {
  describe('action=analyze', () => {
    test('참여율을 계산한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 100, comments: 20, shares: 10, reach: 1000 }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.analysis.engagementRate).toBe(13)
      expect(result.analysis.engagementRateLabel).toBe('13%')
    })

    test('바이럴 계수를 계산한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 50, comments: 50, shares: 200, reach: 1000 }, mockCtx) as string)
      expect(result.analysis.viralCoefficient).toBe(2)
      expect(result.analysis.isViral).toBe(true)
    })

    test('바이럴이 아닌 경우를 감지한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 100, comments: 50, shares: 10, reach: 1000 }, mockCtx) as string)
      expect(result.analysis.isViral).toBe(false)
    })

    test('클릭률을 계산한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 10, clicks: 50, reach: 1000 }, mockCtx) as string)
      expect(result.analysis.clickRate).toBe(5)
    })

    test('reach 없으면 followers를 사용한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 100, comments: 10, followers: 1000 }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.analysis.engagementRate).toBe(11)
    })

    test('reach와 followers 모두 없으면 에러를 반환한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 100 }, mockCtx) as string)
      expect(result.success).toBe(false)
    })

    test('grade를 반환한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 100, comments: 50, shares: 50, reach: 1000, platform: 'instagram' }, mockCtx) as string)
      expect(result.grade).toContain('상위 10%')
    })

    test('recommendations를 반환한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 1, reach: 1000 }, mockCtx) as string)
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    test('reachToFollowerRatio를 계산한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'analyze', likes: 10, reach: 500, followers: 1000 }, mockCtx) as string)
      expect(result.analysis.reachToFollowerRatio).toBe(50)
    })
  })

  describe('action=compare', () => {
    test('다수 게시물을 비교한다', () => {
      const result = JSON.parse(engagementAnalyzer({
        action: 'compare',
        posts: [
          { name: 'Post A', likes: 100, comments: 20, shares: 5, reach: 1000 },
          { name: 'Post B', likes: 200, comments: 50, shares: 30, reach: 1000 },
        ],
      }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.ranking.length).toBe(2)
      expect(result.ranking[0].rank).toBe(1)
      expect(result.winner).toBe('Post B')
    })

    test('평균 참여율을 계산한다', () => {
      const result = JSON.parse(engagementAnalyzer({
        action: 'compare',
        posts: [
          { name: 'A', likes: 100, reach: 1000 },
          { name: 'B', likes: 200, reach: 1000 },
        ],
      }, mockCtx) as string)
      expect(result.averages.engagementRate).toBe(15)
    })

    test('posts 없으면 에러를 반환한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'compare' }, mockCtx) as string)
      expect(result.success).toBe(false)
    })

    test('빈 posts 배열은 에러를 반환한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'compare', posts: [] }, mockCtx) as string)
      expect(result.success).toBe(false)
    })

    test('insight을 포함한다', () => {
      const result = JSON.parse(engagementAnalyzer({
        action: 'compare',
        posts: [{ name: 'A', likes: 100, reach: 1000 }],
      }, mockCtx) as string)
      expect(result.insight).toContain('A')
    })
  })

  describe('action=trend', () => {
    test('시계열 추세를 분석한다', () => {
      const result = JSON.parse(engagementAnalyzer({
        action: 'trend',
        data: [
          { date: '2026-01-01', likes: 50, comments: 5, reach: 500 },
          { date: '2026-01-08', likes: 80, comments: 10, reach: 600 },
          { date: '2026-01-15', likes: 120, comments: 20, reach: 700 },
        ],
      }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.trend.direction).toBe('상승')
      expect(result.dataPoints).toBe(3)
    })

    test('하락 추세를 감지한다', () => {
      const result = JSON.parse(engagementAnalyzer({
        action: 'trend',
        data: [
          { date: '2026-01-01', likes: 120, comments: 20, reach: 700 },
          { date: '2026-01-08', likes: 80, comments: 10, reach: 700 },
          { date: '2026-01-15', likes: 50, comments: 5, reach: 700 },
        ],
      }, mockCtx) as string)
      expect(result.trend.direction).toBe('하락')
    })

    test('이상치를 감지한다', () => {
      const result = JSON.parse(engagementAnalyzer({
        action: 'trend',
        data: [
          { date: '2026-01-01', likes: 10, reach: 1000 },
          { date: '2026-01-08', likes: 11, reach: 1000 },
          { date: '2026-01-15', likes: 12, reach: 1000 },
          { date: '2026-01-22', likes: 10, reach: 1000 },
          { date: '2026-01-29', likes: 11, reach: 1000 },
          { date: '2026-02-05', likes: 10, reach: 1000 },
          { date: '2026-02-12', likes: 12, reach: 1000 },
          { date: '2026-02-19', likes: 800, reach: 1000 },
        ],
      }, mockCtx) as string)
      expect(result.outliers.length).toBeGreaterThan(0)
    })

    test('data 2개 미만이면 에러를 반환한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'trend', data: [{ likes: 10 }] }, mockCtx) as string)
      expect(result.success).toBe(false)
    })

    test('data 없으면 에러를 반환한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'trend' }, mockCtx) as string)
      expect(result.success).toBe(false)
    })
  })

  describe('action=benchmark', () => {
    test('업계 평균 대비 등급을 반환한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'benchmark', likes: 80, comments: 10, shares: 10, reach: 1000, platform: 'instagram' }, mockCtx) as string)
      expect(result.success).toBe(true)
      expect(result.grade).toContain('상위 10%')
      expect(result.benchmark.top10).toBe('6%')
    })

    test('평균 이하를 감지한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'benchmark', likes: 3, reach: 1000, platform: 'instagram' }, mockCtx) as string)
      expect(result.grade).toContain('개선 필요')
    })

    test('gap을 계산한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'benchmark', likes: 20, reach: 1000, platform: 'instagram' }, mockCtx) as string)
      expect(result.gap.toTop10).toBeDefined()
      expect(result.gap.toTop25).toBeDefined()
    })

    test('지원하지 않는 플랫폼은 에러를 반환한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'benchmark', likes: 10, reach: 100, platform: 'unknown' }, mockCtx) as string)
      expect(result.success).toBe(false)
    })

    test('reach/followers 없으면 에러를 반환한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'benchmark', likes: 10, platform: 'instagram' }, mockCtx) as string)
      expect(result.success).toBe(false)
    })

    test('insight을 포함한다', () => {
      const result = JSON.parse(engagementAnalyzer({ action: 'benchmark', likes: 10, reach: 100, platform: 'youtube' }, mockCtx) as string)
      expect(result.insight).toContain('youtube')
    })
  })

  test('알 수 없는 action은 에러를 반환한다', () => {
    const result = JSON.parse(engagementAnalyzer({ action: 'unknown' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  test('action 미지정 시 analyze 기본값을 사용한다', () => {
    const result = JSON.parse(engagementAnalyzer({ likes: 100, reach: 1000 }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.analysis).toBeDefined()
  })
})

// ═══════════════════════════════════════════════════════
//  레지스트리 통합 테스트
// ═══════════════════════════════════════════════════════

describe('ToolPool 레지스트리 등록', () => {
  test('3개 마케팅 도구가 레지스트리에 등록된다', async () => {
    const { registry } = await import('../../lib/tool-handlers/index')
    expect(registry.get('hashtag_generator')).toBeDefined()
    expect(registry.get('content_calendar')).toBeDefined()
    expect(registry.get('engagement_analyzer')).toBeDefined()
  })

  test('레지스트리의 도구가 실제로 실행된다', async () => {
    const { registry } = await import('../../lib/tool-handlers/index')
    const handler = registry.get('hashtag_generator')!
    const result = JSON.parse(handler({ action: 'recommend', topic: '테스트' }, mockCtx) as string)
    expect(result.success).toBe(true)
  })
})
