/**
 * Story 14-5 TEA: SNS A/B 테스트 최적화 로직 검증
 * bun test src/__tests__/unit/sns-ab-test.test.ts
 */
import { describe, test, expect } from 'bun:test'

// ============================================================
// 1. Engagement Score 계산
// ============================================================
describe('Engagement Score 계산', () => {
  function calcEngagement(m: { views: number; likes: number; shares: number; clicks: number }): number {
    return m.views + m.likes * 2 + m.shares * 3 + m.clicks * 2
  }

  test('기본 점수 계산', () => {
    expect(calcEngagement({ views: 100, likes: 50, shares: 30, clicks: 20 })).toBe(100 + 100 + 90 + 40)
  })

  test('0인 메트릭', () => {
    expect(calcEngagement({ views: 0, likes: 0, shares: 0, clicks: 0 })).toBe(0)
  })

  test('조회수만 있는 경우', () => {
    expect(calcEngagement({ views: 500, likes: 0, shares: 0, clicks: 0 })).toBe(500)
  })

  test('공유 가중치가 가장 높음 (3x)', () => {
    const sharesOnly = calcEngagement({ views: 0, likes: 0, shares: 10, clicks: 0 })
    const likesOnly = calcEngagement({ views: 0, likes: 10, shares: 0, clicks: 0 })
    expect(sharesOnly).toBe(30)
    expect(likesOnly).toBe(20)
    expect(sharesOnly).toBeGreaterThan(likesOnly)
  })

  test('좋아요와 클릭 가중치 동일 (2x)', () => {
    const likesOnly = calcEngagement({ views: 0, likes: 10, shares: 0, clicks: 0 })
    const clicksOnly = calcEngagement({ views: 0, likes: 0, shares: 0, clicks: 10 })
    expect(likesOnly).toBe(clicksOnly)
  })

  test('큰 숫자 처리', () => {
    expect(calcEngagement({ views: 1000000, likes: 500000, shares: 100000, clicks: 200000 })).toBe(
      1000000 + 1000000 + 300000 + 400000
    )
  })
})

// ============================================================
// 2. Winner 판정 로직
// ============================================================
describe('A/B 테스트 Winner 판정', () => {
  type Score = { id: string; metrics: { views: number; likes: number; shares: number; clicks: number } | null; score: number }

  function calcEngagement(m: { views: number; likes: number; shares: number; clicks: number }): number {
    return m.views + m.likes * 2 + m.shares * 3 + m.clicks * 2
  }

  function determineWinner(scores: Score[]): { id: string; score: number } | null {
    const scored = scores.filter((s) => s.metrics !== null)
    if (scored.length === 0) return null
    return scored.reduce((best, curr) => (curr.score > best.score ? curr : best))
  }

  test('메트릭이 있는 콘텐츠 중 최고 점수가 winner', () => {
    const scores: Score[] = [
      { id: 'a', metrics: { views: 100, likes: 50, shares: 10, clicks: 20 }, score: calcEngagement({ views: 100, likes: 50, shares: 10, clicks: 20 }) },
      { id: 'b', metrics: { views: 200, likes: 30, shares: 5, clicks: 10 }, score: calcEngagement({ views: 200, likes: 30, shares: 5, clicks: 10 }) },
      { id: 'c', metrics: { views: 50, likes: 100, shares: 50, clicks: 80 }, score: calcEngagement({ views: 50, likes: 100, shares: 50, clicks: 80 }) },
    ]
    const winner = determineWinner(scores)
    expect(winner).not.toBeNull()
    expect(winner!.id).toBe('c') // 50 + 200 + 150 + 160 = 560
  })

  test('메트릭이 모두 null이면 winner 없음', () => {
    const scores: Score[] = [
      { id: 'a', metrics: null, score: 0 },
      { id: 'b', metrics: null, score: 0 },
    ]
    expect(determineWinner(scores)).toBeNull()
  })

  test('콘텐츠 1개만 있어도 winner 반환', () => {
    const scores: Score[] = [
      { id: 'a', metrics: { views: 100, likes: 0, shares: 0, clicks: 0 }, score: 100 },
    ]
    const winner = determineWinner(scores)
    expect(winner).not.toBeNull()
    expect(winner!.id).toBe('a')
  })

  test('일부만 메트릭이 있는 경우 있는 것만 비교', () => {
    const scores: Score[] = [
      { id: 'a', metrics: null, score: 0 },
      { id: 'b', metrics: { views: 50, likes: 10, shares: 5, clicks: 5 }, score: calcEngagement({ views: 50, likes: 10, shares: 5, clicks: 5 }) },
      { id: 'c', metrics: null, score: 0 },
    ]
    const winner = determineWinner(scores)
    expect(winner!.id).toBe('b')
  })

  test('동점일 때 먼저 나온 항목이 winner', () => {
    const scores: Score[] = [
      { id: 'first', metrics: { views: 100, likes: 0, shares: 0, clicks: 0 }, score: 100 },
      { id: 'second', metrics: { views: 100, likes: 0, shares: 0, clicks: 0 }, score: 100 },
    ]
    const winner = determineWinner(scores)
    expect(winner!.id).toBe('first')
  })
})

// ============================================================
// 3. 변형 생성 스키마 검증
// ============================================================
describe('변형 생성 스키마 검증', () => {
  const VALID_STRATEGIES = ['tone', 'length', 'hashtag', 'headline', 'mixed'] as const

  function validateGenerateVariants(data: {
    count?: number
    strategy?: string
    agentId?: string
  }): { valid: boolean; error?: string } {
    if (typeof data.count !== 'number' || !Number.isInteger(data.count)) {
      return { valid: false, error: 'count는 정수여야 합니다' }
    }
    if (data.count < 2 || data.count > 5) {
      return { valid: false, error: 'count는 2~5 사이여야 합니다' }
    }
    if (!data.strategy || !VALID_STRATEGIES.includes(data.strategy as any)) {
      return { valid: false, error: '유효한 전략을 선택하세요' }
    }
    if (!data.agentId) {
      return { valid: false, error: 'agentId가 필요합니다' }
    }
    return { valid: true }
  }

  test('유효한 요청', () => {
    expect(validateGenerateVariants({ count: 3, strategy: 'mixed', agentId: 'uuid-123' })).toEqual({ valid: true })
  })

  test('count 최소값 2', () => {
    expect(validateGenerateVariants({ count: 1, strategy: 'tone', agentId: 'uuid' }).valid).toBe(false)
  })

  test('count 최대값 5', () => {
    expect(validateGenerateVariants({ count: 6, strategy: 'tone', agentId: 'uuid' }).valid).toBe(false)
  })

  test('count 2는 유효', () => {
    expect(validateGenerateVariants({ count: 2, strategy: 'tone', agentId: 'uuid' }).valid).toBe(true)
  })

  test('count 5는 유효', () => {
    expect(validateGenerateVariants({ count: 5, strategy: 'tone', agentId: 'uuid' }).valid).toBe(true)
  })

  test('소수점 count 거부', () => {
    expect(validateGenerateVariants({ count: 2.5, strategy: 'tone', agentId: 'uuid' }).valid).toBe(false)
  })

  test('유효하지 않은 전략', () => {
    expect(validateGenerateVariants({ count: 3, strategy: 'invalid', agentId: 'uuid' }).valid).toBe(false)
  })

  test('모든 전략이 유효', () => {
    for (const s of VALID_STRATEGIES) {
      expect(validateGenerateVariants({ count: 3, strategy: s, agentId: 'uuid' }).valid).toBe(true)
    }
  })

  test('agentId 없으면 거부', () => {
    expect(validateGenerateVariants({ count: 3, strategy: 'tone' }).valid).toBe(false)
  })
})

// ============================================================
// 4. 메트릭 스키마 검증
// ============================================================
describe('메트릭 스키마 검증', () => {
  function validateMetrics(data: {
    views?: number
    likes?: number
    shares?: number
    clicks?: number
  }): { valid: boolean; error?: string } {
    for (const key of ['views', 'likes', 'shares', 'clicks'] as const) {
      const val = data[key]
      if (typeof val !== 'number') return { valid: false, error: `${key}는 숫자여야 합니다` }
      if (val < 0) return { valid: false, error: `${key}는 0 이상이어야 합니다` }
      if (!Number.isInteger(val)) return { valid: false, error: `${key}는 정수여야 합니다` }
    }
    return { valid: true }
  }

  test('유효한 메트릭', () => {
    expect(validateMetrics({ views: 100, likes: 50, shares: 30, clicks: 20 })).toEqual({ valid: true })
  })

  test('모두 0이면 유효', () => {
    expect(validateMetrics({ views: 0, likes: 0, shares: 0, clicks: 0 })).toEqual({ valid: true })
  })

  test('음수 거부', () => {
    expect(validateMetrics({ views: -1, likes: 0, shares: 0, clicks: 0 }).valid).toBe(false)
  })

  test('소수점 거부', () => {
    expect(validateMetrics({ views: 1.5, likes: 0, shares: 0, clicks: 0 }).valid).toBe(false)
  })

  test('누락된 필드 거부', () => {
    expect(validateMetrics({ views: 100 } as any).valid).toBe(false)
  })
})

// ============================================================
// 5. Metadata 병합 로직
// ============================================================
describe('Metadata 병합 로직', () => {
  function mergeMetadata(
    existing: Record<string, unknown> | null,
    metrics: { views: number; likes: number; shares: number; clicks: number }
  ): Record<string, unknown> {
    return {
      ...(existing || {}),
      metrics: { ...metrics, updatedAt: new Date().toISOString() },
    }
  }

  test('빈 metadata에 metrics 추가', () => {
    const result = mergeMetadata(null, { views: 100, likes: 50, shares: 30, clicks: 20 })
    expect(result.metrics).toBeDefined()
    const m = result.metrics as Record<string, unknown>
    expect(m.views).toBe(100)
    expect(m.likes).toBe(50)
    expect(m.updatedAt).toBeDefined()
  })

  test('기존 metadata 보존하면서 metrics 추가', () => {
    const existing = { customField: 'value', otherData: 123 }
    const result = mergeMetadata(existing, { views: 10, likes: 5, shares: 3, clicks: 2 })
    expect(result.customField).toBe('value')
    expect(result.otherData).toBe(123)
    expect(result.metrics).toBeDefined()
  })

  test('기존 metrics 덮어쓰기', () => {
    const existing = { metrics: { views: 50, likes: 10, shares: 5, clicks: 2, updatedAt: '2025-01-01' } }
    const result = mergeMetadata(existing, { views: 200, likes: 100, shares: 50, clicks: 30 })
    const m = result.metrics as Record<string, unknown>
    expect(m.views).toBe(200)
    expect(m.likes).toBe(100)
  })
})

// ============================================================
// 6. variantOf 필터 로직
// ============================================================
describe('variantOf 필터 로직', () => {
  type Content = { id: string; title: string; variantOf: string | null }

  function filterByVariantOf(items: Content[], param: string | undefined): Content[] {
    if (!param) return items
    if (param === 'root') return items.filter((i) => i.variantOf === null)
    return items.filter((i) => i.variantOf === param)
  }

  const items: Content[] = [
    { id: 'a', title: '원본 1', variantOf: null },
    { id: 'b', title: '원본 2', variantOf: null },
    { id: 'c', title: '변형 1-1', variantOf: 'a' },
    { id: 'd', title: '변형 1-2', variantOf: 'a' },
    { id: 'e', title: '변형 2-1', variantOf: 'b' },
  ]

  test('파라미터 없으면 전체 반환', () => {
    expect(filterByVariantOf(items, undefined)).toHaveLength(5)
  })

  test('root면 원본만 반환', () => {
    const result = filterByVariantOf(items, 'root')
    expect(result).toHaveLength(2)
    expect(result.every((i) => i.variantOf === null)).toBe(true)
  })

  test('특정 ID면 해당 원본의 변형만 반환', () => {
    const result = filterByVariantOf(items, 'a')
    expect(result).toHaveLength(2)
    expect(result.every((i) => i.variantOf === 'a')).toBe(true)
  })

  test('존재하지 않는 ID면 빈 배열', () => {
    expect(filterByVariantOf(items, 'nonexistent')).toHaveLength(0)
  })
})

// ============================================================
// 7. 변형 복제 로직
// ============================================================
describe('변형 복제 로직', () => {
  type Original = { platform: string; title: string; body: string; hashtags: string | null; imageUrl: string | null; snsAccountId: string | null }
  type Override = { title?: string; body?: string; hashtags?: string; imageUrl?: string }

  function createVariantData(original: Original, override: Override, variantOfId: string) {
    return {
      platform: original.platform,
      title: override.title || original.title,
      body: override.body || original.body,
      hashtags: override.hashtags ?? original.hashtags,
      imageUrl: override.imageUrl ?? original.imageUrl,
      snsAccountId: original.snsAccountId,
      variantOf: variantOfId,
      status: 'draft' as const,
    }
  }

  const original: Original = {
    platform: 'instagram',
    title: '원본 제목',
    body: '원본 본문',
    hashtags: '#해시태그',
    imageUrl: 'https://img.example.com/1.jpg',
    snsAccountId: 'acct-1',
  }

  test('override 없으면 원본 복사', () => {
    const result = createVariantData(original, {}, 'orig-id')
    expect(result.title).toBe('원본 제목')
    expect(result.body).toBe('원본 본문')
    expect(result.hashtags).toBe('#해시태그')
    expect(result.variantOf).toBe('orig-id')
    expect(result.status).toBe('draft')
    expect(result.snsAccountId).toBe('acct-1')
  })

  test('title override 적용', () => {
    const result = createVariantData(original, { title: '변형 제목' }, 'orig-id')
    expect(result.title).toBe('변형 제목')
    expect(result.body).toBe('원본 본문')
  })

  test('body override 적용', () => {
    const result = createVariantData(original, { body: '변형 본문' }, 'orig-id')
    expect(result.body).toBe('변형 본문')
  })

  test('hashtags를 빈 문자열로 override 가능', () => {
    const result = createVariantData(original, { hashtags: '' }, 'orig-id')
    expect(result.hashtags).toBe('')
  })

  test('imageUrl를 빈 문자열로 override 가능', () => {
    const result = createVariantData(original, { imageUrl: '' }, 'orig-id')
    expect(result.imageUrl).toBe('')
  })

  test('platform은 항상 원본 그대로', () => {
    const result = createVariantData(original, { title: '변형' }, 'orig-id')
    expect(result.platform).toBe('instagram')
  })
})

// ============================================================
// 8. AI 변형 생성 전략 프롬프트
// ============================================================
describe('AI 변형 생성 전략 프롬프트', () => {
  const STRATEGY_PROMPTS: Record<string, string> = {
    tone: '같은 내용을 다른 어조(공식적/친근한/유머러스 등)로 변형해주세요.',
    length: '같은 메시지를 더 짧게 또는 길게 변형해주세요.',
    hashtag: '같은 내용에 다른 해시태그 전략을 적용해주세요.',
    headline: '같은 본문에 다른 제목/헤드라인을 적용해주세요.',
    mixed: '어조, 길이, 해시태그, 제목을 모두 다르게 변형해주세요.',
  }

  test('5가지 전략 모두 정의됨', () => {
    expect(Object.keys(STRATEGY_PROMPTS)).toHaveLength(5)
  })

  test('각 전략에 한국어 프롬프트 존재', () => {
    for (const [key, prompt] of Object.entries(STRATEGY_PROMPTS)) {
      expect(prompt.length).toBeGreaterThan(10)
      expect(typeof prompt).toBe('string')
    }
  })

  test('tone 전략은 어조 관련 키워드 포함', () => {
    expect(STRATEGY_PROMPTS.tone).toContain('어조')
  })

  test('length 전략은 길이 관련 키워드 포함', () => {
    expect(STRATEGY_PROMPTS.length).toContain('짧게')
  })

  test('hashtag 전략은 해시태그 관련 키워드 포함', () => {
    expect(STRATEGY_PROMPTS.hashtag).toContain('해시태그')
  })

  test('headline 전략은 제목 관련 키워드 포함', () => {
    expect(STRATEGY_PROMPTS.headline).toContain('제목')
  })

  test('mixed 전략은 전체 변경 의미 포함', () => {
    expect(STRATEGY_PROMPTS.mixed).toContain('모두')
  })
})

// ============================================================
// 9. 삭제 시 variantOf SET NULL 동작 시뮬레이션
// ============================================================
describe('원본 삭제 시 변형 orphan 처리', () => {
  type Content = { id: string; variantOf: string | null }

  function simulateDeleteWithSetNull(items: Content[], deleteId: string): Content[] {
    return items
      .filter((i) => i.id !== deleteId)
      .map((i) => i.variantOf === deleteId ? { ...i, variantOf: null } : i)
  }

  test('원본 삭제 시 변형의 variantOf가 null로', () => {
    const items: Content[] = [
      { id: 'a', variantOf: null },
      { id: 'b', variantOf: 'a' },
      { id: 'c', variantOf: 'a' },
    ]
    const result = simulateDeleteWithSetNull(items, 'a')
    expect(result).toHaveLength(2)
    expect(result[0].variantOf).toBeNull()
    expect(result[1].variantOf).toBeNull()
  })

  test('변형 삭제 시 다른 콘텐츠 영향 없음', () => {
    const items: Content[] = [
      { id: 'a', variantOf: null },
      { id: 'b', variantOf: 'a' },
      { id: 'c', variantOf: 'a' },
    ]
    const result = simulateDeleteWithSetNull(items, 'b')
    expect(result).toHaveLength(2)
    expect(result[0].variantOf).toBeNull()
    expect(result[1].variantOf).toBe('a')
  })
})

// ============================================================
// 10. SnsContent 타입 variantOf 필드
// ============================================================
describe('SnsContent variantOf 타입 검증', () => {
  type SnsContent = {
    id: string
    variantOf?: string | null
    metadata?: Record<string, unknown> | null
  }

  test('variantOf는 nullable optional', () => {
    const original: SnsContent = { id: '1' }
    const withNull: SnsContent = { id: '2', variantOf: null }
    const withId: SnsContent = { id: '3', variantOf: 'parent-id' }
    expect(original.variantOf).toBeUndefined()
    expect(withNull.variantOf).toBeNull()
    expect(withId.variantOf).toBe('parent-id')
  })

  test('metadata undefined인 경우', () => {
    const content: SnsContent = { id: '1' }
    expect(content.metadata).toBeUndefined()
  })

  test('metadata null인 경우', () => {
    const content: SnsContent = { id: '1', metadata: null }
    expect(content.metadata).toBeNull()
  })

  test('metadata.metrics 구조', () => {
    const content: SnsContent = {
      id: '1',
      metadata: {
        metrics: { views: 100, likes: 50, shares: 30, clicks: 20, updatedAt: '2026-03-06T00:00:00Z' },
      },
    }
    const metrics = (content.metadata?.metrics as Record<string, unknown>)
    expect(metrics.views).toBe(100)
    expect(metrics.updatedAt).toBeDefined()
  })
})

// ============================================================
// 11. createVariant 스키마 검증
// ============================================================
describe('createVariant 스키마 검증', () => {
  function validateCreateVariant(data: {
    title?: string
    body?: string
    hashtags?: string
    imageUrl?: string
  }): { valid: boolean; error?: string } {
    if (data.title !== undefined) {
      if (data.title.length === 0) return { valid: false, error: '제목은 비어있을 수 없습니다' }
      if (data.title.length > 200) return { valid: false, error: '제목은 200자 이내여야 합니다' }
    }
    if (data.body !== undefined && data.body.length === 0) {
      return { valid: false, error: '본문은 비어있을 수 없습니다' }
    }
    return { valid: true }
  }

  test('빈 객체 (모든 필드 미제공) 유효', () => {
    expect(validateCreateVariant({})).toEqual({ valid: true })
  })

  test('title만 제공 유효', () => {
    expect(validateCreateVariant({ title: '변형 제목' })).toEqual({ valid: true })
  })

  test('body만 제공 유효', () => {
    expect(validateCreateVariant({ body: '변형 본문' })).toEqual({ valid: true })
  })

  test('빈 title 거부', () => {
    expect(validateCreateVariant({ title: '' }).valid).toBe(false)
  })

  test('200자 초과 title 거부', () => {
    expect(validateCreateVariant({ title: 'a'.repeat(201) }).valid).toBe(false)
  })

  test('200자 title 허용', () => {
    expect(validateCreateVariant({ title: 'a'.repeat(200) }).valid).toBe(true)
  })

  test('빈 body 거부', () => {
    expect(validateCreateVariant({ body: '' }).valid).toBe(false)
  })

  test('hashtags는 빈 문자열 허용', () => {
    expect(validateCreateVariant({ hashtags: '' }).valid).toBe(true)
  })
})

// ============================================================
// 12. A/B 테스트 그룹 구조 검증
// ============================================================
describe('A/B 테스트 그룹 구조', () => {
  type AbGroup = {
    original: { id: string; title: string }
    variants: { id: string; title: string; variantOf: string }[]
  }

  function buildAbGroup(items: { id: string; title: string; variantOf: string | null }[], rootId: string): AbGroup | null {
    const original = items.find((i) => i.id === rootId && i.variantOf === null)
    if (!original) return null
    const variants = items
      .filter((i) => i.variantOf === rootId)
      .map((i) => ({ id: i.id, title: i.title, variantOf: i.variantOf! }))
    return { original, variants }
  }

  test('원본 + 변형 그룹 구성', () => {
    const items = [
      { id: 'a', title: '원본', variantOf: null },
      { id: 'b', title: '변형1', variantOf: 'a' },
      { id: 'c', title: '변형2', variantOf: 'a' },
    ]
    const group = buildAbGroup(items, 'a')
    expect(group).not.toBeNull()
    expect(group!.original.id).toBe('a')
    expect(group!.variants).toHaveLength(2)
  })

  test('원본 없으면 null', () => {
    const items = [
      { id: 'b', title: '변형1', variantOf: 'a' },
    ]
    expect(buildAbGroup(items, 'a')).toBeNull()
  })

  test('변형 없으면 빈 배열', () => {
    const items = [
      { id: 'a', title: '원본', variantOf: null },
    ]
    const group = buildAbGroup(items, 'a')
    expect(group!.variants).toHaveLength(0)
  })

  test('다른 그룹의 변형은 포함되지 않음', () => {
    const items = [
      { id: 'a', title: '원본A', variantOf: null },
      { id: 'b', title: '원본B', variantOf: null },
      { id: 'c', title: 'A의 변형', variantOf: 'a' },
      { id: 'd', title: 'B의 변형', variantOf: 'b' },
    ]
    const groupA = buildAbGroup(items, 'a')
    expect(groupA!.variants).toHaveLength(1)
    expect(groupA!.variants[0].id).toBe('c')
  })
})

// ============================================================
// 13. Engagement Score 순위 정렬
// ============================================================
describe('Engagement Score 순위 정렬', () => {
  function calcEngagement(m: { views: number; likes: number; shares: number; clicks: number }): number {
    return m.views + m.likes * 2 + m.shares * 3 + m.clicks * 2
  }

  type Entry = { id: string; metrics: { views: number; likes: number; shares: number; clicks: number } }

  function rankByEngagement(entries: Entry[]): { id: string; score: number; rank: number }[] {
    const scored = entries.map((e) => ({ id: e.id, score: calcEngagement(e.metrics) }))
    scored.sort((a, b) => b.score - a.score)
    return scored.map((s, i) => ({ ...s, rank: i + 1 }))
  }

  test('점수순 정렬', () => {
    const entries: Entry[] = [
      { id: 'low', metrics: { views: 10, likes: 5, shares: 1, clicks: 2 } },
      { id: 'high', metrics: { views: 1000, likes: 500, shares: 100, clicks: 200 } },
      { id: 'mid', metrics: { views: 100, likes: 50, shares: 10, clicks: 20 } },
    ]
    const ranked = rankByEngagement(entries)
    expect(ranked[0].id).toBe('high')
    expect(ranked[0].rank).toBe(1)
    expect(ranked[1].id).toBe('mid')
    expect(ranked[1].rank).toBe(2)
    expect(ranked[2].id).toBe('low')
    expect(ranked[2].rank).toBe(3)
  })

  test('빈 배열', () => {
    expect(rankByEngagement([])).toHaveLength(0)
  })

  test('1개 항목은 rank 1', () => {
    const ranked = rankByEngagement([{ id: 'a', metrics: { views: 100, likes: 0, shares: 0, clicks: 0 } }])
    expect(ranked[0].rank).toBe(1)
    expect(ranked[0].score).toBe(100)
  })
})

// ============================================================
// 14. AI 변형 응답 파싱
// ============================================================
describe('AI 변형 응답 파싱', () => {
  function parseAiResponse(response: string, fallbackTitle: string) {
    const titleMatch = response.match(/제목:\s*(.+)/)?.[1]?.trim() || fallbackTitle
    const bodyMatch = response.match(/본문:\s*([\s\S]*?)(?=해시태그:|$)/)?.[1]?.trim() || response
    const hashtagMatch = response.match(/해시태그:\s*(.+)/)?.[1]?.trim() || null
    return { title: titleMatch, body: bodyMatch, hashtags: hashtagMatch }
  }

  test('완전한 응답 파싱', () => {
    const response = '제목: 테스트 제목\n본문: 테스트 본문 내용\n해시태그: #태그1 #태그2'
    const result = parseAiResponse(response, '폴백')
    expect(result.title).toBe('테스트 제목')
    expect(result.body).toBe('테스트 본문 내용')
    expect(result.hashtags).toBe('#태그1 #태그2')
  })

  test('제목 누락 시 fallback 사용', () => {
    const response = '본문: 본문만 있는 경우'
    const result = parseAiResponse(response, '폴백 제목')
    expect(result.title).toBe('폴백 제목')
  })

  test('해시태그 누락 시 null', () => {
    const response = '제목: 제목\n본문: 본문'
    const result = parseAiResponse(response, '폴백')
    expect(result.hashtags).toBeNull()
  })

  test('형식 없는 응답은 전체가 body', () => {
    const response = '이것은 형식이 없는 AI 응답입니다.'
    const result = parseAiResponse(response, '폴백')
    expect(result.title).toBe('폴백')
    expect(result.body).toBe('이것은 형식이 없는 AI 응답입니다.')
  })

  test('여러 줄 본문 파싱', () => {
    const response = '제목: 제목\n본문: 첫째 줄\n둘째 줄\n셋째 줄\n해시태그: #태그'
    const result = parseAiResponse(response, '폴백')
    expect(result.body).toContain('첫째 줄')
    expect(result.body).toContain('둘째 줄')
    expect(result.body).toContain('셋째 줄')
  })
})
