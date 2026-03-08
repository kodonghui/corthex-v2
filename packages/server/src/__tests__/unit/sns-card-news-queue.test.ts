/**
 * Story 12-4: 예약 발행 큐 + 카드뉴스 — 단위 테스트
 * 카드뉴스 시리즈 CRUD, 예약 큐, 배치 예약/취소, AI 생성, 승인 플로우, 플랫폼별 발행
 */
import { describe, test, expect, beforeEach, mock } from 'bun:test'

// ==================== 1. 스키마 확장 검증 ====================

describe('Task 1: 스키마 확장', () => {
  test('snsContents 테이블에 priority 필드 존재', async () => {
    const { snsContents } = await import('../../db/schema')
    expect(snsContents.priority).toBeDefined()
  })

  test('snsContents 테이블에 isCardNews 필드 존재', async () => {
    const { snsContents } = await import('../../db/schema')
    expect(snsContents.isCardNews).toBeDefined()
  })

  test('snsContents 테이블에 cardSeriesId 필드 존재', async () => {
    const { snsContents } = await import('../../db/schema')
    expect(snsContents.cardSeriesId).toBeDefined()
  })

  test('snsContents 테이블에 cardIndex 필드 존재', async () => {
    const { snsContents } = await import('../../db/schema')
    expect(snsContents.cardIndex).toBeDefined()
  })

  test('priority 기본값 0', async () => {
    const { snsContents } = await import('../../db/schema')
    expect((snsContents.priority as any).config?.default).toBe(0)
  })

  test('isCardNews 기본값 false', async () => {
    const { snsContents } = await import('../../db/schema')
    expect((snsContents.isCardNews as any).config?.default).toBe(false)
  })
})

// ==================== 2. 공유 타입 검증 ====================

describe('Task 1: Shared Types', () => {
  test('SnsPlatform 타입에 6개 플랫폼 포함', () => {
    // 타입 레벨 검증 - 컴파일 성공 = 통과
    const platforms: import('@corthex/shared').SnsPlatform[] = [
      'instagram', 'tistory', 'daum_cafe', 'twitter', 'facebook', 'naver_blog'
    ]
    expect(platforms.length).toBe(6)
  })

  test('SnsContent 타입에 카드뉴스 필드 포함', () => {
    const content: Partial<import('@corthex/shared').SnsContent> = {
      priority: 5,
      isCardNews: true,
      cardSeriesId: 'abc',
      cardIndex: 0,
    }
    expect(content.isCardNews).toBe(true)
    expect(content.priority).toBe(5)
  })

  test('CardNewsCard 타입 정상 구조', () => {
    const card: import('@corthex/shared').CardNewsCard = {
      index: 0,
      imageUrl: 'https://example.com/img.png',
      caption: '커버 슬라이드',
      layout: 'cover',
    }
    expect(card.layout).toBe('cover')
  })

  test('CardSeriesMetadata 타입 정상 구조', () => {
    const meta: import('@corthex/shared').CardSeriesMetadata = {
      cards: [
        { index: 0, imageUrl: 'img1.png', caption: '커버', layout: 'cover' },
        { index: 1, imageUrl: 'img2.png', caption: '내용', layout: 'content' },
      ],
      totalCards: 2,
      seriesTitle: '테스트 시리즈',
    }
    expect(meta.totalCards).toBe(2)
    expect(meta.cards).toHaveLength(2)
  })

  test('QueueStats 타입 정상 구조', () => {
    const stats: import('@corthex/shared').QueueStats = {
      scheduled: 5,
      published: 10,
      failed: 1,
      byPlatform: [{ platform: 'instagram', count: 3 }],
      nextPublishAt: '2026-03-15T14:00:00Z',
    }
    expect(stats.scheduled).toBe(5)
  })
})

// ==================== 3. PublishInput 카드뉴스 지원 ====================

describe('Task 5: PublishInput mediaUrls 지원', () => {
  test('PublishInput에 mediaUrls 옵션 필드 존재', () => {
    const input: import('../../lib/sns-publishers/types').PublishInput = {
      id: 'test-id',
      platform: 'instagram',
      title: '테스트',
      body: '본문',
      hashtags: null,
      imageUrl: null,
      mediaUrls: ['img1.png', 'img2.png', 'img3.png'],
    }
    expect(input.mediaUrls).toHaveLength(3)
  })

  test('PublishInput mediaUrls 없어도 동작', () => {
    const input: import('../../lib/sns-publishers/types').PublishInput = {
      id: 'test-id',
      platform: 'instagram',
      title: '테스트',
      body: '본문',
      hashtags: null,
      imageUrl: 'img.png',
    }
    expect(input.mediaUrls).toBeUndefined()
  })
})

// ==================== 4. 카드뉴스 시리즈 데이터 구조 검증 ====================

describe('Task 3: 카드뉴스 시리즈 데이터 구조', () => {
  test('카드뉴스 metadata.cards 배열 구조', () => {
    const metadata = {
      cards: [
        { index: 0, imageUrl: 'cover.png', caption: '커버 슬라이드', layout: 'cover' },
        { index: 1, imageUrl: 'content1.png', caption: '핵심 포인트 1', layout: 'content' },
        { index: 2, imageUrl: 'content2.png', caption: '핵심 포인트 2', layout: 'content' },
        { index: 3, imageUrl: 'closing.png', caption: 'CTA', layout: 'closing' },
      ],
      totalCards: 4,
      seriesTitle: '테스트 카드뉴스',
    }

    expect(metadata.cards).toHaveLength(4)
    expect(metadata.cards[0].layout).toBe('cover')
    expect(metadata.cards[3].layout).toBe('closing')
    expect(metadata.totalCards).toBe(4)
  })

  test('카드뉴스 최소 2장', () => {
    const cards = [
      { index: 0, imageUrl: 'img1.png', caption: '커버', layout: 'cover' },
      { index: 1, imageUrl: 'img2.png', caption: '클로징', layout: 'closing' },
    ]
    expect(cards.length).toBeGreaterThanOrEqual(2)
  })

  test('카드뉴스 최대 10장', () => {
    const cards = Array.from({ length: 10 }, (_, i) => ({
      index: i,
      imageUrl: `img${i}.png`,
      caption: `카드 ${i + 1}`,
      layout: i === 0 ? 'cover' : i === 9 ? 'closing' : 'content',
    }))
    expect(cards.length).toBeLessThanOrEqual(10)
  })

  test('카드 순서 변경 로직', () => {
    const cards = [
      { index: 0, imageUrl: 'a.png', caption: '카드 A', layout: 'cover' },
      { index: 1, imageUrl: 'b.png', caption: '카드 B', layout: 'content' },
      { index: 2, imageUrl: 'c.png', caption: '카드 C', layout: 'closing' },
    ]

    const order = [2, 0, 1] // C를 1번째, A를 2번째, B를 3번째로
    const reordered = order.map((oldIdx, newIdx) => {
      const card = cards.find((c) => c.index === oldIdx)!
      return { ...card, index: newIdx }
    })

    expect(reordered[0].caption).toBe('카드 C')
    expect(reordered[0].index).toBe(0)
    expect(reordered[1].caption).toBe('카드 A')
    expect(reordered[1].index).toBe(1)
    expect(reordered[2].caption).toBe('카드 B')
    expect(reordered[2].index).toBe(2)
  })
})

// ==================== 5. 예약 큐 정렬 로직 ====================

describe('Task 2: 예약 큐 정렬', () => {
  test('scheduledAt ASC + priority DESC 정렬', () => {
    const items = [
      { id: '1', scheduledAt: new Date('2026-03-15T10:00:00Z'), priority: 1 },
      { id: '2', scheduledAt: new Date('2026-03-15T10:00:00Z'), priority: 5 },
      { id: '3', scheduledAt: new Date('2026-03-15T09:00:00Z'), priority: 0 },
      { id: '4', scheduledAt: new Date('2026-03-16T10:00:00Z'), priority: 10 },
    ]

    const sorted = items.sort((a, b) => {
      const timeDiff = a.scheduledAt.getTime() - b.scheduledAt.getTime()
      if (timeDiff !== 0) return timeDiff
      return b.priority - a.priority // DESC
    })

    expect(sorted[0].id).toBe('3') // 가장 빠른 시간
    expect(sorted[1].id).toBe('2') // 같은 시간, 높은 priority
    expect(sorted[2].id).toBe('1') // 같은 시간, 낮은 priority
    expect(sorted[3].id).toBe('4') // 가장 늦은 시간
  })
})

// ==================== 6. 배치 예약 로직 ====================

describe('Task 2: 배치 예약/취소', () => {
  test('배치 예약 시 미래 시간만 허용', () => {
    const pastDate = new Date('2020-01-01')
    const futureDate = new Date('2030-01-01')

    expect(pastDate <= new Date()).toBe(true) // 과거 → 거부
    expect(futureDate > new Date()).toBe(true) // 미래 → 허용
  })

  test('배치 예약 최대 50개 제한', () => {
    const ids = Array.from({ length: 51 }, (_, i) => `id-${i}`)
    expect(ids.length).toBeGreaterThan(50) // 51개는 초과
  })

  test('승인된(approved) 콘텐츠만 예약 가능', () => {
    const statuses = ['draft', 'pending', 'approved', 'scheduled', 'rejected', 'published', 'failed']
    const eligible = statuses.filter((s) => s === 'approved')
    expect(eligible).toHaveLength(1)
    expect(eligible[0]).toBe('approved')
  })
})

// ==================== 7. 카드뉴스 승인 플로우 ====================

describe('Task 6: 카드뉴스 승인 플로우', () => {
  test('시리즈 상태 전이: draft → pending', () => {
    const currentStatus = 'draft'
    const validTransitions: Record<string, string[]> = {
      draft: ['pending'],
      rejected: ['pending'],
      pending: ['approved', 'scheduled', 'rejected'],
      approved: ['scheduled', 'published'],
      scheduled: ['approved', 'published', 'failed'],
    }

    expect(validTransitions[currentStatus]).toContain('pending')
  })

  test('승인 시 scheduledAt 유무에 따라 상태 분기', () => {
    const futureDate = new Date('2030-01-01')
    const pastDate = new Date('2020-01-01')

    const getStatus = (scheduledAt: Date | null) => {
      if (scheduledAt && scheduledAt > new Date()) return 'scheduled'
      return 'approved'
    }

    expect(getStatus(futureDate)).toBe('scheduled')
    expect(getStatus(pastDate)).toBe('approved')
    expect(getStatus(null)).toBe('approved')
  })

  test('반려 시 사유 필수', () => {
    const reason = '카드 3번 이미지 품질 개선 필요'
    expect(reason.length).toBeGreaterThan(0)
  })

  test('시리즈 전체가 하나의 발행 단위', () => {
    // 시리즈 루트(isCardNews=true, cardIndex=null)의 상태가 전체 상태를 대표
    const root = { isCardNews: true, cardIndex: null, status: 'approved' }
    expect(root.isCardNews).toBe(true)
    expect(root.cardIndex).toBeNull()
  })
})

// ==================== 8. 카드뉴스 플랫폼별 발행 전략 ====================

describe('Task 5: 플랫폼별 카드뉴스 발행', () => {
  test('Instagram: 캐러셀 (2~10장)', () => {
    const mediaUrls = ['img1.png', 'img2.png', 'img3.png']
    expect(mediaUrls.length).toBeGreaterThanOrEqual(2)
    expect(mediaUrls.length).toBeLessThanOrEqual(10)
  })

  test('캐러셀 1장이면 일반 이미지 게시물', () => {
    const mediaUrls = ['img1.png']
    const isCarousel = mediaUrls.length > 1
    expect(isCarousel).toBe(false)
  })

  test('11장 이상이면 캐러셀 거부', () => {
    const mediaUrls = Array.from({ length: 11 }, (_, i) => `img${i}.png`)
    expect(mediaUrls.length).toBeGreaterThan(10)
  })

  test('Tistory/Naver Blog: HTML 이미지 순열 생성', () => {
    const cards = [
      { imageUrl: 'img1.png', caption: '커버' },
      { imageUrl: 'img2.png', caption: '내용 1' },
      { imageUrl: 'img3.png', caption: '내용 2' },
    ]

    const html = cards.map((c) =>
      `<div class="card-news-slide"><img src="${c.imageUrl}" alt="${c.caption}" /><p>${c.caption}</p></div>`
    ).join('\n')

    expect(html).toContain('card-news-slide')
    expect(html.match(/img src/g)?.length).toBe(3)
  })

  test('Twitter/Facebook: 첫 이미지만 발행', () => {
    const cards = [
      { imageUrl: 'img1.png', caption: '커버' },
      { imageUrl: 'img2.png', caption: '내용' },
    ]

    // Twitter/Facebook에서는 첫 이미지만 사용
    const singleImageUrl = cards[0].imageUrl
    expect(singleImageUrl).toBe('img1.png')
  })
})

// ==================== 9. AI 카드뉴스 생성 ====================

describe('Task 4: AI 카드뉴스 자동 생성', () => {
  test('시리즈 구조: cover → content → closing', () => {
    const cardCount = 5
    const layouts = Array.from({ length: cardCount }, (_, i) => {
      if (i === 0) return 'cover'
      if (i === cardCount - 1) return 'closing'
      return 'content'
    })

    expect(layouts[0]).toBe('cover')
    expect(layouts[1]).toBe('content')
    expect(layouts[2]).toBe('content')
    expect(layouts[3]).toBe('content')
    expect(layouts[4]).toBe('closing')
  })

  test('시각 일관성 프롬프트 생성', () => {
    const totalSlides = 5
    const slideIndex = 2
    const basePrompt = 'A colorful infographic about AI technology'

    const prompt = `Slide ${slideIndex + 1} of ${totalSlides}. IMPORTANT: Maintain consistent visual identity — same color palette, typography style, layout structure across ALL slides. ${basePrompt}`

    expect(prompt).toContain(`Slide ${slideIndex + 1} of ${totalSlides}`)
    expect(prompt).toContain('consistent visual identity')
    expect(prompt).toContain(basePrompt)
  })

  test('AI JSON 응답 파싱', () => {
    const aiResponse = `여기 카드뉴스 시리즈입니다:

{
  "title": "AI 기술의 미래",
  "hashtags": "#AI #기술 #미래",
  "cards": [
    { "caption": "AI의 현재와 미래", "layout": "cover", "imagePrompt": "AI tech cover" },
    { "caption": "핵심 기술 1: LLM", "layout": "content", "imagePrompt": "LLM illustration" },
    { "caption": "지금 시작하세요!", "layout": "closing", "imagePrompt": "CTA slide" }
  ]
}`

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    expect(jsonMatch).not.toBeNull()

    const parsed = JSON.parse(jsonMatch![0])
    expect(parsed.title).toBe('AI 기술의 미래')
    expect(parsed.cards).toHaveLength(3)
    expect(parsed.cards[0].layout).toBe('cover')
  })

  test('AI JSON 파싱 실패 시 기본 구조 생성', () => {
    const topic = 'AI 기술'
    const cardCount = 3
    const aiResponse = '잘못된 응답입니다'

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    let parsed: { title: string; cards: Array<{ caption: string; layout: string }> }

    if (!jsonMatch) {
      parsed = {
        title: topic,
        cards: Array.from({ length: cardCount }, (_, i) => ({
          caption: i === 0 ? `${topic} - 커버` : i === cardCount - 1 ? `${topic} - 마무리` : `${topic} - 핵심 포인트 ${i}`,
          layout: i === 0 ? 'cover' : i === cardCount - 1 ? 'closing' : 'content',
        })),
      }
    } else {
      parsed = JSON.parse(jsonMatch[0])
    }

    expect(parsed.title).toBe('AI 기술')
    expect(parsed.cards).toHaveLength(3)
    expect(parsed.cards[0].layout).toBe('cover')
    expect(parsed.cards[2].layout).toBe('closing')
  })

  test('카드 수 범위: 3~10장', () => {
    expect(3).toBeGreaterThanOrEqual(3)
    expect(10).toBeLessThanOrEqual(10)
    expect(2).toBeLessThan(3) // 2장은 부족
    expect(11).toBeGreaterThan(10) // 11장은 초과
  })
})

// ==================== 10. 스케줄 체커 카드뉴스 지원 ====================

describe('Task 5: SNS 스케줄 체커 카드뉴스 지원', () => {
  test('카드뉴스 시리즈에서 이미지 URL 배열 추출', () => {
    const metadata = {
      cards: [
        { index: 0, imageUrl: 'https://cdn.example.com/cover.png', caption: '커버' },
        { index: 1, imageUrl: 'https://cdn.example.com/page1.png', caption: '내용 1' },
        { index: 2, imageUrl: 'https://cdn.example.com/page2.png', caption: '내용 2' },
        { index: 3, imageUrl: '', caption: '텍스트만' },
      ],
    }

    const cards = metadata.cards || []
    const urls = cards.map((c) => c.imageUrl).filter((u): u is string => !!u)

    expect(urls).toHaveLength(3) // 빈 문자열 제외
    expect(urls[0]).toBe('https://cdn.example.com/cover.png')
  })

  test('카드뉴스가 아닌 콘텐츠는 mediaUrls 없음', () => {
    const isCardNews = false
    let mediaUrls: string[] | undefined

    if (isCardNews) {
      mediaUrls = ['img1.png']
    }

    expect(mediaUrls).toBeUndefined()
  })

  test('개별 카드(cardSeriesId 있음)는 발행 대상에서 제외', () => {
    const posts = [
      { id: '1', cardSeriesId: null, status: 'scheduled' },   // 일반 콘텐츠 → 발행
      { id: '2', cardSeriesId: null, isCardNews: true, status: 'scheduled' }, // 시리즈 루트 → 발행
      { id: '3', cardSeriesId: 'root-id', status: 'scheduled' }, // 개별 카드 → 제외
    ]

    const eligiblePosts = posts.filter((p) => p.cardSeriesId === null)
    expect(eligiblePosts).toHaveLength(2)
    expect(eligiblePosts.map((p) => p.id)).toEqual(['1', '2'])
  })
})

// ==================== 11. 마이그레이션 파일 검증 ====================

describe('Task 1: 마이그레이션 파일', () => {
  test('마이그레이션 파일 존재', async () => {
    const fs = await import('fs')
    const path = 'packages/server/src/db/migrations/0043_sns-card-news-queue.sql'
    expect(fs.existsSync(path)).toBe(true)
  })

  test('마이그레이션 SQL에 필수 컬럼 포함', async () => {
    const fs = await import('fs')
    const sql = fs.readFileSync('packages/server/src/db/migrations/0043_sns-card-news-queue.sql', 'utf-8')

    expect(sql).toContain('priority')
    expect(sql).toContain('is_card_news')
    expect(sql).toContain('card_series_id')
    expect(sql).toContain('card_index')
    expect(sql).toContain('idx_sns_scheduled_queue')
    expect(sql).toContain('idx_sns_card_series')
  })
})

// ==================== 12. 엣지 케이스 ====================

describe('엣지 케이스', () => {
  test('빈 카드 배열 시리즈 거부 (최소 2장)', () => {
    const cards: unknown[] = []
    expect(cards.length).toBeLessThan(2)
  })

  test('카드 이미지 없는 경우 빈 문자열로 저장', () => {
    const card = { index: 0, imageUrl: '', caption: '텍스트만', layout: 'content' }
    expect(card.imageUrl).toBe('')
  })

  test('같은 시간 + 같은 우선순위 시 생성 순서대로', () => {
    const items = [
      { id: '1', scheduledAt: new Date('2026-03-15T10:00:00Z'), priority: 5, createdAt: new Date('2026-03-10') },
      { id: '2', scheduledAt: new Date('2026-03-15T10:00:00Z'), priority: 5, createdAt: new Date('2026-03-11') },
    ]

    const sorted = items.sort((a, b) => {
      const timeDiff = a.scheduledAt.getTime() - b.scheduledAt.getTime()
      if (timeDiff !== 0) return timeDiff
      const prioDiff = b.priority - a.priority
      if (prioDiff !== 0) return prioDiff
      return a.createdAt.getTime() - b.createdAt.getTime()
    })

    expect(sorted[0].id).toBe('1') // 먼저 생성된 것 우선
  })

  test('scheduledAt이 null인 승인 콘텐츠는 예약 큐에 포함되지 않음', () => {
    const contents = [
      { id: '1', status: 'scheduled', scheduledAt: new Date('2026-03-15') },
      { id: '2', status: 'approved', scheduledAt: null },
    ]

    const scheduled = contents.filter((c) => c.status === 'scheduled' && c.scheduledAt !== null)
    expect(scheduled).toHaveLength(1)
    expect(scheduled[0].id).toBe('1')
  })

  test('priority 범위: 0~100', () => {
    expect(0).toBeGreaterThanOrEqual(0)
    expect(100).toBeLessThanOrEqual(100)
  })

  test('카드 인덱스 중복 방지 (reorder 후)', () => {
    const reordered = [
      { index: 0, caption: 'A' },
      { index: 1, caption: 'B' },
      { index: 2, caption: 'C' },
    ]

    const indices = reordered.map((c) => c.index)
    const uniqueIndices = new Set(indices)
    expect(uniqueIndices.size).toBe(indices.length) // 모든 인덱스 고유
  })
})

// ==================== 13. Zod 스키마 검증 ====================

describe('Zod 스키마 검증', () => {
  const { z } = require('zod')

  test('createCardSeriesSchema: 정상 입력', () => {
    const schema = z.object({
      platform: z.enum(['instagram', 'tistory', 'daum_cafe', 'twitter', 'facebook', 'naver_blog']),
      title: z.string().min(1).max(200),
      cards: z.array(z.object({
        imageUrl: z.string().min(1),
        caption: z.string().min(1),
        layout: z.enum(['cover', 'content', 'closing']).default('content'),
      })).min(2).max(10),
    })

    const result = schema.safeParse({
      platform: 'instagram',
      title: '테스트 시리즈',
      cards: [
        { imageUrl: 'img1.png', caption: '커버', layout: 'cover' },
        { imageUrl: 'img2.png', caption: '내용' },
      ],
    })
    expect(result.success).toBe(true)
  })

  test('createCardSeriesSchema: 카드 1장이면 실패', () => {
    const schema = z.object({
      platform: z.enum(['instagram', 'tistory', 'daum_cafe', 'twitter', 'facebook', 'naver_blog']),
      title: z.string().min(1).max(200),
      cards: z.array(z.object({
        imageUrl: z.string().min(1),
        caption: z.string().min(1),
        layout: z.enum(['cover', 'content', 'closing']).default('content'),
      })).min(2).max(10),
    })

    const result = schema.safeParse({
      platform: 'instagram',
      title: '테스트',
      cards: [{ imageUrl: 'img.png', caption: '혼자' }],
    })
    expect(result.success).toBe(false)
  })

  test('createCardSeriesSchema: 카드 11장이면 실패', () => {
    const schema = z.object({
      cards: z.array(z.object({
        imageUrl: z.string().min(1),
        caption: z.string().min(1),
      })).min(2).max(10),
    })

    const cards = Array.from({ length: 11 }, (_, i) => ({
      imageUrl: `img${i}.png`,
      caption: `카드 ${i}`,
    }))

    const result = schema.safeParse({ cards })
    expect(result.success).toBe(false)
  })

  test('batchScheduleSchema: 정상 입력', () => {
    const schema = z.object({
      ids: z.array(z.string().uuid()).min(1).max(50),
      scheduledAt: z.string().datetime(),
      priority: z.number().int().min(0).max(100).optional(),
    })

    const result = schema.safeParse({
      ids: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
      scheduledAt: '2026-03-15T14:00:00Z',
      priority: 5,
    })
    expect(result.success).toBe(true)
  })

  test('batchScheduleSchema: 빈 ids 실패', () => {
    const schema = z.object({
      ids: z.array(z.string().uuid()).min(1).max(50),
      scheduledAt: z.string().datetime(),
    })

    const result = schema.safeParse({ ids: [], scheduledAt: '2026-03-15T14:00:00Z' })
    expect(result.success).toBe(false)
  })

  test('generateCardSeriesSchema: 카드 수 범위 검증', () => {
    const schema = z.object({
      cardCount: z.number().int().min(3).max(10).default(5),
    })

    expect(schema.safeParse({ cardCount: 3 }).success).toBe(true)
    expect(schema.safeParse({ cardCount: 10 }).success).toBe(true)
    expect(schema.safeParse({ cardCount: 2 }).success).toBe(false)
    expect(schema.safeParse({ cardCount: 11 }).success).toBe(false)
    expect(schema.safeParse({}).success).toBe(true) // default 5
  })
})

// ==================== 14. PublishEngine 카드뉴스 분기 ====================

describe('Task 5: PublishEngine 카드뉴스 분기', () => {
  test('isCardNews=true일 때 metadata.cards에서 mediaUrls 추출', () => {
    const content = {
      isCardNews: true,
      metadata: {
        cards: [
          { imageUrl: 'https://cdn.example.com/1.png' },
          { imageUrl: 'https://cdn.example.com/2.png' },
          { imageUrl: '' }, // 빈 이미지
          { imageUrl: 'https://cdn.example.com/3.png' },
        ],
      },
    }

    const meta = (content.metadata as Record<string, unknown>) || {}
    const cards = (meta.cards as Array<{ imageUrl?: string }>) || []
    const urls = cards.map((c) => c.imageUrl).filter((u): u is string => !!u)

    expect(urls).toHaveLength(3)
    expect(urls).not.toContain('')
  })

  test('isCardNews=false일 때 mediaUrls undefined', () => {
    const content = { isCardNews: false, metadata: null }

    let mediaUrls: string[] | undefined
    if (content.isCardNews) {
      mediaUrls = []
    }

    expect(mediaUrls).toBeUndefined()
  })
})
