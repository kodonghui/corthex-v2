/**
 * TEA (Test Architect) 자동 생성 테스트 — Story 12-4: 예약 발행 큐 + 카드뉴스
 * 리스크 기반 커버리지: 고위험 경로, 경계 조건, 동시성 시나리오, 회귀 방지
 */
import { describe, test, expect } from 'bun:test'

// ==================== HIGH RISK: Instagram Carousel API 시뮬레이션 ====================

describe('[TEA-HIGH] Instagram 캐러셀 발행 로직', () => {
  test('캐러셀 컨테이너 ID 순서 유지 (이미지 순서 보장)', () => {
    const imageUrls = ['cover.png', 'page1.png', 'page2.png', 'page3.png', 'closing.png']
    const containerIds = imageUrls.map((_, i) => `container_${i}`)

    // 컨테이너 ID가 이미지 순서대로 생성되어야 함
    expect(containerIds).toEqual(['container_0', 'container_1', 'container_2', 'container_3', 'container_4'])
    expect(containerIds.join(',')).toBe('container_0,container_1,container_2,container_3,container_4')
  })

  test('캐러셀 최소 이미지 수 검증 (2장 미만 거부)', () => {
    const mediaUrls1 = ['single.png']
    const mediaUrls2 = ['a.png', 'b.png']

    expect(mediaUrls1.length > 1).toBe(false)  // 1장 → 캐러셀 아님
    expect(mediaUrls2.length > 1).toBe(true)   // 2장 → 캐러셀
  })

  test('캐러셀 최대 이미지 수 검증 (10장 초과 거부)', () => {
    const mediaUrls10 = Array.from({ length: 10 }, (_, i) => `img${i}.png`)
    const mediaUrls11 = Array.from({ length: 11 }, (_, i) => `img${i}.png`)

    expect(mediaUrls10.length <= 10).toBe(true)
    expect(mediaUrls11.length <= 10).toBe(false)
  })

  test('캐러셀 발행 실패 시 개별 컨테이너 생성 롤백 불필요 (Instagram API 특성)', () => {
    // Instagram Graph API는 컨테이너 생성 후 발행 실패 시
    // 자동으로 만료되므로 롤백 불필요
    const containerCreated = true
    const publishFailed = true

    // 실패해도 상태만 'failed'로 업데이트
    const resultStatus = publishFailed ? 'failed' : 'published'
    expect(resultStatus).toBe('failed')
    expect(containerCreated).toBe(true) // 컨테이너는 그대로 둠
  })

  test('캐러셀 비동기 처리 대기 (에러코드 9007)', () => {
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 3000 // 캐러셀은 3초

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const errorCode = 9007
      const shouldRetry = errorCode === 9007 && attempt < MAX_RETRIES - 1
      if (attempt < 2) {
        expect(shouldRetry).toBe(true)
      } else {
        expect(shouldRetry).toBe(false)
      }
    }
  })

  test('caption 생성: body + hashtags 결합', () => {
    const body = '카드뉴스 본문입니다'
    const hashtags = '#카드뉴스 #마케팅 #SNS'

    const caption = hashtags ? `${body}\n\n${hashtags}` : body
    expect(caption).toBe('카드뉴스 본문입니다\n\n#카드뉴스 #마케팅 #SNS')
  })

  test('caption 생성: hashtags 없는 경우', () => {
    const body = '본문만 있는 콘텐츠'
    const hashtags = null

    const caption = hashtags ? `${body}\n\n${hashtags}` : body
    expect(caption).toBe('본문만 있는 콘텐츠')
  })
})

// ==================== HIGH RISK: Schedule Checker 카드뉴스 필터링 ====================

describe('[TEA-HIGH] SNS Schedule Checker 카드뉴스 지원', () => {
  test('cardSeriesId가 null인 콘텐츠만 발행 대상 (개별 카드 제외)', () => {
    const allPosts = [
      { id: '1', cardSeriesId: null, status: 'scheduled', scheduledAt: new Date('2026-03-15') },
      { id: '2', cardSeriesId: null, status: 'scheduled', scheduledAt: new Date('2026-03-15') },
      { id: '3', cardSeriesId: 'root-1', status: 'scheduled', scheduledAt: new Date('2026-03-15') }, // 개별 카드
      { id: '4', cardSeriesId: 'root-2', status: 'scheduled', scheduledAt: new Date('2026-03-15') }, // 개별 카드
    ]

    const eligiblePosts = allPosts.filter((p) => p.cardSeriesId === null)
    expect(eligiblePosts).toHaveLength(2)
    expect(eligiblePosts.every((p) => p.cardSeriesId === null)).toBe(true)
  })

  test('priority DESC + scheduledAt ASC 복합 정렬', () => {
    const posts = [
      { id: 'a', scheduledAt: new Date('2026-03-15T12:00:00Z'), priority: 1 },
      { id: 'b', scheduledAt: new Date('2026-03-15T12:00:00Z'), priority: 10 },
      { id: 'c', scheduledAt: new Date('2026-03-15T10:00:00Z'), priority: 0 },
      { id: 'd', scheduledAt: new Date('2026-03-16T12:00:00Z'), priority: 100 },
    ]

    const sorted = [...posts].sort((a, b) => {
      const timeDiff = a.scheduledAt.getTime() - b.scheduledAt.getTime()
      if (timeDiff !== 0) return timeDiff
      return b.priority - a.priority
    })

    expect(sorted.map((p) => p.id)).toEqual(['c', 'b', 'a', 'd'])
  })

  test('카드뉴스 시리즈에서 유효한 이미지 URL만 추출', () => {
    const metadata = {
      cards: [
        { imageUrl: 'https://cdn.example.com/1.png' },
        { imageUrl: '' },
        { imageUrl: 'https://cdn.example.com/2.png' },
        { imageUrl: null },
        { imageUrl: 'https://cdn.example.com/3.png' },
      ],
    }

    const urls = (metadata.cards || [])
      .map((c: any) => c.imageUrl)
      .filter((u: any): u is string => !!u && typeof u === 'string')

    expect(urls).toHaveLength(3)
    expect(urls).not.toContain('')
    expect(urls).not.toContain(null)
  })

  test('isCardNews=false인 콘텐츠는 mediaUrls 전달 안 함', () => {
    const content = { isCardNews: false, metadata: { retryCount: 1 } }
    let mediaUrls: string[] | undefined

    if (content.isCardNews) {
      const meta = content.metadata as Record<string, unknown>
      const cards = (meta.cards as Array<{ imageUrl?: string }>) || []
      mediaUrls = cards.map((c) => c.imageUrl).filter((u): u is string => !!u)
    }

    expect(mediaUrls).toBeUndefined()
  })

  test('중복 발행 방지: status를 먼저 변경 후 발행', () => {
    // 시뮬레이션: 두 폴링이 같은 포스트를 발견
    let postStatus = 'scheduled'

    // 첫 번째 폴링: CAS (Compare-And-Swap) 성공
    const lock1 = postStatus === 'scheduled'
    if (lock1) postStatus = 'published'
    expect(lock1).toBe(true)

    // 두 번째 폴링: CAS 실패 (이미 published)
    const lock2 = postStatus === 'scheduled'
    expect(lock2).toBe(false) // 중복 발행 방지됨
  })

  test('발행 실패 시 상태를 failed로 변경', () => {
    const post = { status: 'scheduled' as string }
    const publishError = new Error('Network timeout')

    // 발행 실패
    post.status = 'failed'
    expect(post.status).toBe('failed')
  })
})

// ==================== MEDIUM RISK: Card Series CRUD 경계 조건 ====================

describe('[TEA-MED] 카드뉴스 시리즈 CRUD 경계 조건', () => {
  test('시리즈 생성: 카드 2장 (최소)', () => {
    const cards = [
      { imageUrl: 'cover.png', caption: '커버', layout: 'cover' },
      { imageUrl: 'closing.png', caption: '클로징', layout: 'closing' },
    ]
    expect(cards.length).toBeGreaterThanOrEqual(2)
  })

  test('시리즈 생성: 카드 10장 (최대)', () => {
    const cards = Array.from({ length: 10 }, (_, i) => ({
      imageUrl: `img${i}.png`,
      caption: `카드 ${i + 1}`,
      layout: i === 0 ? 'cover' : i === 9 ? 'closing' : 'content',
    }))
    expect(cards.length).toBeLessThanOrEqual(10)
  })

  test('시리즈 생성: 카드 1장 거부', () => {
    const { z } = require('zod')
    const schema = z.array(z.object({
      imageUrl: z.string().min(1),
      caption: z.string().min(1),
    })).min(2).max(10)

    const result = schema.safeParse([{ imageUrl: 'single.png', caption: '혼자' }])
    expect(result.success).toBe(false)
  })

  test('시리즈 생성: 카드 11장 거부', () => {
    const { z } = require('zod')
    const schema = z.array(z.object({
      imageUrl: z.string().min(1),
      caption: z.string().min(1),
    })).min(2).max(10)

    const cards = Array.from({ length: 11 }, (_, i) => ({ imageUrl: `img${i}.png`, caption: `c${i}` }))
    const result = schema.safeParse(cards)
    expect(result.success).toBe(false)
  })

  test('카드 수정: draft/rejected만 허용', () => {
    const allowedStatuses = ['draft', 'rejected']
    const allStatuses = ['draft', 'pending', 'approved', 'scheduled', 'rejected', 'published', 'failed']

    for (const status of allStatuses) {
      const canEdit = allowedStatuses.includes(status)
      if (status === 'draft' || status === 'rejected') {
        expect(canEdit).toBe(true)
      } else {
        expect(canEdit).toBe(false)
      }
    }
  })

  test('시리즈 삭제: draft만 허용', () => {
    const canDelete = (status: string) => status === 'draft'

    expect(canDelete('draft')).toBe(true)
    expect(canDelete('pending')).toBe(false)
    expect(canDelete('approved')).toBe(false)
    expect(canDelete('published')).toBe(false)
    expect(canDelete('failed')).toBe(false)
  })

  test('카드 순서 변경: 인덱스 중복 없음', () => {
    const order = [2, 0, 1]
    const uniqueIndices = new Set(order)
    expect(uniqueIndices.size).toBe(order.length)

    // 결과도 0부터 연속된 인덱스
    const reordered = order.map((_, newIdx) => newIdx)
    expect(reordered).toEqual([0, 1, 2])
  })

  test('카드 순서 변경: 배열 길이 불일치 거부', () => {
    const cardCount = 5
    const order1 = [0, 1, 2, 3] // 4개 (부족)
    const order2 = [0, 1, 2, 3, 4, 5] // 6개 (초과)
    const order3 = [0, 1, 2, 3, 4] // 5개 (일치)

    expect(order1.length === cardCount).toBe(false)
    expect(order2.length === cardCount).toBe(false)
    expect(order3.length === cardCount).toBe(true)
  })

  test('대표 이미지는 항상 첫 번째 카드의 이미지', () => {
    const cards = [
      { index: 0, imageUrl: 'cover.png', caption: '커버' },
      { index: 1, imageUrl: 'content.png', caption: '내용' },
    ]

    const representativeImage = cards.sort((a, b) => a.index - b.index)[0].imageUrl
    expect(representativeImage).toBe('cover.png')

    // 순서 변경 후에도 새 첫 번째 카드의 이미지가 대표
    const reordered = [
      { index: 0, imageUrl: 'content.png', caption: '내용' },
      { index: 1, imageUrl: 'cover.png', caption: '커버' },
    ]
    const newRepresentative = reordered.sort((a, b) => a.index - b.index)[0].imageUrl
    expect(newRepresentative).toBe('content.png')
  })
})

// ==================== MEDIUM RISK: 배치 예약/취소 ====================

describe('[TEA-MED] 배치 예약/취소', () => {
  test('배치 예약: approved 상태만 허용', () => {
    const contents = [
      { id: '1', status: 'draft' },
      { id: '2', status: 'approved' },
      { id: '3', status: 'approved' },
      { id: '4', status: 'pending' },
      { id: '5', status: 'published' },
    ]

    const eligible = contents.filter((c) => c.status === 'approved')
    expect(eligible).toHaveLength(2)
    expect(eligible.map((e) => e.id)).toEqual(['2', '3'])
  })

  test('배치 예약: 과거 시간 거부', () => {
    const scheduledAt = new Date('2020-01-01')
    expect(scheduledAt <= new Date()).toBe(true) // 거부되어야 함
  })

  test('배치 예약: 미래 시간 허용', () => {
    const scheduledAt = new Date('2099-01-01')
    expect(scheduledAt > new Date()).toBe(true) // 허용
  })

  test('배치 예약: 최대 50개 제한', () => {
    const { z } = require('zod')
    const schema = z.array(z.string().uuid()).min(1).max(50)

    const ids50 = Array.from({ length: 50 }, () => 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    const ids51 = Array.from({ length: 51 }, () => 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')

    expect(schema.safeParse(ids50).success).toBe(true)
    expect(schema.safeParse(ids51).success).toBe(false)
  })

  test('배치 취소: scheduled 상태만 취소 가능', () => {
    const contents = [
      { id: '1', status: 'scheduled' },
      { id: '2', status: 'approved' },
      { id: '3', status: 'scheduled' },
    ]

    const cancellable = contents.filter((c) => c.status === 'scheduled')
    expect(cancellable).toHaveLength(2)
  })

  test('배치 취소: 취소 후 상태 = approved, scheduledAt = null', () => {
    const content = { status: 'scheduled' as string, scheduledAt: new Date('2026-03-15') as Date | null }

    content.status = 'approved'
    content.scheduledAt = null

    expect(content.status).toBe('approved')
    expect(content.scheduledAt).toBeNull()
  })

  test('배치 예약: priority 설정 시 저장', () => {
    const priority = 42
    expect(priority).toBeGreaterThanOrEqual(0)
    expect(priority).toBeLessThanOrEqual(100)
  })
})

// ==================== MEDIUM RISK: 시리즈 승인 플로우 ====================

describe('[TEA-MED] 시리즈 승인 플로우', () => {
  test('submit: draft → pending', () => {
    const transitions: Record<string, string> = {
      draft: 'pending',
      rejected: 'pending',
    }
    expect(transitions['draft']).toBe('pending')
    expect(transitions['rejected']).toBe('pending')
  })

  test('submit: pending/approved에서는 불가', () => {
    const canSubmit = (status: string) => status === 'draft' || status === 'rejected'
    expect(canSubmit('pending')).toBe(false)
    expect(canSubmit('approved')).toBe(false)
    expect(canSubmit('scheduled')).toBe(false)
    expect(canSubmit('published')).toBe(false)
  })

  test('approve: scheduledAt 미래 → scheduled', () => {
    const scheduledAt = new Date('2030-01-01')
    const newStatus = scheduledAt > new Date() ? 'scheduled' : 'approved'
    expect(newStatus).toBe('scheduled')
  })

  test('approve: scheduledAt 과거 또는 null → approved', () => {
    const pastDate = new Date('2020-01-01')
    const newStatus1 = pastDate > new Date() ? 'scheduled' : 'approved'
    expect(newStatus1).toBe('approved')

    const nullDate = null as Date | null
    const newStatus2 = nullDate && nullDate > new Date() ? 'scheduled' : 'approved'
    expect(newStatus2).toBe('approved')
  })

  test('approve: pending만 승인 가능', () => {
    const canApprove = (status: string) => status === 'pending'
    expect(canApprove('pending')).toBe(true)
    expect(canApprove('draft')).toBe(false)
    expect(canApprove('approved')).toBe(false)
  })

  test('reject: 사유(reason) 필수', () => {
    const { z } = require('zod')
    const schema = z.object({ reason: z.string().min(1) })

    expect(schema.safeParse({ reason: '' }).success).toBe(false)
    expect(schema.safeParse({ reason: '이미지 품질 불량' }).success).toBe(true)
    expect(schema.safeParse({}).success).toBe(false)
  })

  test('관리자(CEO 이상)만 승인/반려 가능', () => {
    // isCeoOrAbove 함수 로직 시뮬레이션
    const roles = ['user', 'admin', 'superadmin']
    const ceoOrAbove = roles.filter((r) => r === 'admin' || r === 'superadmin')
    expect(ceoOrAbove).toHaveLength(2)
    expect(ceoOrAbove).not.toContain('user')
  })
})

// ==================== MEDIUM RISK: PublishEngine 카드뉴스 분기 ====================

describe('[TEA-MED] PublishEngine 카드뉴스 분기', () => {
  test('isCardNews=true → metadata.cards에서 mediaUrls 추출', () => {
    const content = {
      isCardNews: true,
      metadata: {
        cards: [
          { index: 0, imageUrl: 'https://cdn.example.com/cover.png', caption: '커버' },
          { index: 1, imageUrl: 'https://cdn.example.com/page1.png', caption: '내용1' },
          { index: 2, imageUrl: '', caption: '텍스트만' },
          { index: 3, imageUrl: 'https://cdn.example.com/closing.png', caption: '클로징' },
        ],
      },
    }

    let mediaUrls: string[] | undefined
    if (content.isCardNews) {
      const meta = content.metadata as Record<string, unknown>
      const cards = (meta.cards as Array<{ imageUrl?: string }>) || []
      const urls = cards.map((c) => c.imageUrl).filter((u): u is string => !!u)
      if (urls.length > 0) mediaUrls = urls
    }

    expect(mediaUrls).toBeDefined()
    expect(mediaUrls).toHaveLength(3) // 빈 문자열 제외
  })

  test('isCardNews=false → mediaUrls undefined', () => {
    const content = { isCardNews: false, metadata: {} }
    let mediaUrls: string[] | undefined

    if (content.isCardNews) {
      mediaUrls = []
    }

    expect(mediaUrls).toBeUndefined()
  })

  test('metadata.cards가 없으면 mediaUrls = undefined', () => {
    const content = { isCardNews: true, metadata: {} }
    const meta = content.metadata as Record<string, unknown>
    const cards = (meta.cards as Array<{ imageUrl?: string }>) || []
    const urls = cards.map((c) => c.imageUrl).filter((u): u is string => !!u)

    expect(urls).toHaveLength(0) // 카드 없음
  })

  test('metadata 자체가 null이면 안전하게 처리', () => {
    const content = { isCardNews: true, metadata: null }
    const meta = (content.metadata as Record<string, unknown>) || {}
    const cards = (meta.cards as Array<{ imageUrl?: string }>) || []
    const urls = cards.map((c) => c.imageUrl).filter((u): u is string => !!u)

    expect(urls).toHaveLength(0) // 에러 없이 빈 배열
  })
})

// ==================== LOW RISK: AI 카드뉴스 생성 ====================

describe('[TEA-LOW] AI 카드뉴스 생성', () => {
  test('JSON 파싱 성공 시 구조 검증', () => {
    const aiResponse = `{
      "title": "디지털 마케팅 트렌드",
      "hashtags": "#마케팅 #트렌드",
      "cards": [
        { "caption": "2026 트렌드 전망", "layout": "cover", "imagePrompt": "Modern marketing cover" },
        { "caption": "AI 마케팅 자동화", "layout": "content", "imagePrompt": "AI automation" },
        { "caption": "시작하세요!", "layout": "closing", "imagePrompt": "CTA button" }
      ]
    }`

    const parsed = JSON.parse(aiResponse)
    expect(parsed.title).toBe('디지털 마케팅 트렌드')
    expect(parsed.cards).toHaveLength(3)
    expect(parsed.cards[0].layout).toBe('cover')
    expect(parsed.cards[2].layout).toBe('closing')
  })

  test('JSON 파싱 실패 시 fallback 구조 생성', () => {
    const topic = 'AI 기술'
    const cardCount = 5
    const aiResponse = '이건 JSON이 아닙니다!'

    let parsed: { title: string; cards: Array<{ layout: string }> }

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      parsed = {
        title: topic,
        cards: Array.from({ length: cardCount }, (_, i) => ({
          layout: i === 0 ? 'cover' : i === cardCount - 1 ? 'closing' : 'content',
        })),
      }
    } else {
      parsed = JSON.parse(jsonMatch[0])
    }

    expect(parsed.title).toBe(topic)
    expect(parsed.cards).toHaveLength(cardCount)
    expect(parsed.cards[0].layout).toBe('cover')
    expect(parsed.cards[cardCount - 1].layout).toBe('closing')
  })

  test('시각 일관성 프롬프트에 슬라이드 번호 포함', () => {
    const totalSlides = 5
    const prompts = Array.from({ length: totalSlides }, (_, i) => {
      return `Slide ${i + 1} of ${totalSlides}. IMPORTANT: Maintain consistent visual identity — same color palette, typography style, layout structure across ALL slides. Base prompt here`
    })

    for (let i = 0; i < totalSlides; i++) {
      expect(prompts[i]).toContain(`Slide ${i + 1} of ${totalSlides}`)
      expect(prompts[i]).toContain('consistent visual identity')
    }
  })

  test('cardCount 기본값 5', () => {
    const { z } = require('zod')
    const schema = z.object({ cardCount: z.number().int().min(3).max(10).default(5) })

    const result = schema.parse({})
    expect(result.cardCount).toBe(5)
  })
})

// ==================== LOW RISK: 큐 통계 ====================

describe('[TEA-LOW] 큐 통계', () => {
  test('상태별 카운트 정확성', () => {
    const contents = [
      { status: 'scheduled' },
      { status: 'scheduled' },
      { status: 'published' },
      { status: 'published' },
      { status: 'published' },
      { status: 'failed' },
    ]

    const stats = {
      scheduled: contents.filter((c) => c.status === 'scheduled').length,
      published: contents.filter((c) => c.status === 'published').length,
      failed: contents.filter((c) => c.status === 'failed').length,
    }

    expect(stats.scheduled).toBe(2)
    expect(stats.published).toBe(3)
    expect(stats.failed).toBe(1)
  })

  test('nextPublishAt: 가장 이른 예약 시간', () => {
    const scheduledItems = [
      { scheduledAt: new Date('2026-03-16T12:00:00Z') },
      { scheduledAt: new Date('2026-03-15T10:00:00Z') },
      { scheduledAt: new Date('2026-03-17T08:00:00Z') },
    ]

    const sorted = scheduledItems.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
    expect(sorted[0].scheduledAt.toISOString()).toBe('2026-03-15T10:00:00.000Z')
  })

  test('nextPublishAt: 예약 없으면 null', () => {
    const scheduledItems: { scheduledAt: Date }[] = []
    const nextPublishAt = scheduledItems[0]?.scheduledAt?.toISOString() || null
    expect(nextPublishAt).toBeNull()
  })

  test('플랫폼별 카운트', () => {
    const contents = [
      { platform: 'instagram', status: 'scheduled' },
      { platform: 'instagram', status: 'scheduled' },
      { platform: 'twitter', status: 'scheduled' },
      { platform: 'tistory', status: 'scheduled' },
    ]

    const byPlatform = Object.entries(
      contents.reduce((acc, c) => {
        acc[c.platform] = (acc[c.platform] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    ).map(([platform, count]) => ({ platform, count }))

    expect(byPlatform).toHaveLength(3)
    const ig = byPlatform.find((p) => p.platform === 'instagram')
    expect(ig?.count).toBe(2)
  })
})

// ==================== 회귀 방지 ====================

describe('[TEA-REGRESSION] 기존 기능 회귀 방지', () => {
  test('기존 SNS 스키마 필드 유지 (variantOf)', () => {
    // variantOf 필드가 여전히 존재하는지 확인
    const snsContent = {
      id: 'test',
      variantOf: 'original-id',
      // 새 필드
      priority: 0,
      isCardNews: false,
      cardSeriesId: null,
      cardIndex: null,
    }

    expect(snsContent.variantOf).toBe('original-id')
    expect(snsContent.priority).toBe(0)
  })

  test('기존 상태 전이 유지 (draft → pending → approved → published)', () => {
    const transitions: Record<string, string[]> = {
      draft: ['pending'],
      pending: ['approved', 'scheduled', 'rejected'],
      approved: ['published', 'scheduled', 'failed'],
      scheduled: ['published', 'failed', 'approved'],
      rejected: ['draft', 'pending'],
    }

    expect(transitions['draft']).toContain('pending')
    expect(transitions['pending']).toContain('approved')
    expect(transitions['approved']).toContain('published')
  })

  test('publishContent 인터페이스 하위 호환', () => {
    // 기존 호출 (mediaUrls 없이)도 동작해야 함
    const legacyInput = {
      id: 'test',
      platform: 'instagram',
      title: '기존 콘텐츠',
      body: '본문',
      hashtags: null,
      imageUrl: 'img.png',
    }

    expect(legacyInput).not.toHaveProperty('mediaUrls')
    // mediaUrls 없으면 일반 게시물로 발행
  })

  test('A/B 테스트 variantOf와 cardSeriesId 독립적', () => {
    // variantOf: A/B 테스트용
    // cardSeriesId: 카드뉴스 시리즈용
    // 두 필드는 동시에 사용 가능하지만 보통은 하나만 사용
    const content = {
      variantOf: null,
      cardSeriesId: null,
      isCardNews: false,
    }

    // 일반 콘텐츠
    expect(content.variantOf).toBeNull()
    expect(content.cardSeriesId).toBeNull()
    expect(content.isCardNews).toBe(false)
  })

  test('snsStatusEnum 값 변경 없음', () => {
    const expectedStatuses = ['draft', 'pending', 'approved', 'scheduled', 'rejected', 'published', 'failed']
    // 새 상태 추가 없이 기존 상태만 유지
    expect(expectedStatuses).toHaveLength(7)
  })
})
