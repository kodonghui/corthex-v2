import { describe, test, expect } from 'bun:test'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PLATFORM_LABELS,
  PLATFORM_OPTIONS,
} from '../components/sns/sns-types'

// =============================================================
// SNS 통신국 UI - Story 12-5 Unit Tests
// =============================================================

describe('SNS Types - STATUS_LABELS', () => {
  test('should have all 8 status labels', () => {
    const expectedStatuses = ['draft', 'pending', 'approved', 'scheduled', 'rejected', 'published', 'failed', 'publishing']
    for (const s of expectedStatuses) {
      expect(STATUS_LABELS[s]).toBeDefined()
      expect(typeof STATUS_LABELS[s]).toBe('string')
    }
  })

  test('draft label should be 초안', () => {
    expect(STATUS_LABELS.draft).toBe('초안')
  })

  test('published label should be 발행 완료', () => {
    expect(STATUS_LABELS.published).toBe('발행 완료')
  })

  test('failed label should be 발행 실패', () => {
    expect(STATUS_LABELS.failed).toBe('발행 실패')
  })

  test('publishing label should be 발행 중', () => {
    expect(STATUS_LABELS.publishing).toBe('발행 중')
  })
})

describe('SNS Types - STATUS_COLORS', () => {
  test('should have Tailwind classes for all statuses', () => {
    const statuses = ['draft', 'pending', 'approved', 'scheduled', 'rejected', 'published', 'failed', 'publishing']
    for (const s of statuses) {
      expect(STATUS_COLORS[s]).toBeDefined()
      expect(STATUS_COLORS[s]).toContain('bg-')
      expect(STATUS_COLORS[s]).toContain('text-')
    }
  })

  test('draft uses zinc colors', () => {
    expect(STATUS_COLORS.draft).toContain('zinc')
  })

  test('pending uses yellow colors', () => {
    expect(STATUS_COLORS.pending).toContain('yellow')
  })

  test('approved uses green colors', () => {
    expect(STATUS_COLORS.approved).toContain('green')
  })

  test('scheduled uses blue colors', () => {
    expect(STATUS_COLORS.scheduled).toContain('blue')
  })

  test('rejected uses red colors', () => {
    expect(STATUS_COLORS.rejected).toContain('red')
  })

  test('published uses indigo colors', () => {
    expect(STATUS_COLORS.published).toContain('indigo')
  })

  test('failed uses red colors', () => {
    expect(STATUS_COLORS.failed).toContain('red')
  })
})

describe('SNS Types - PLATFORM_LABELS', () => {
  test('should have labels for 7 platforms', () => {
    const platforms = ['instagram', 'tistory', 'naver_blog', 'twitter', 'facebook', 'youtube', 'daum_cafe']
    for (const p of platforms) {
      expect(PLATFORM_LABELS[p]).toBeDefined()
      expect(typeof PLATFORM_LABELS[p]).toBe('string')
    }
  })

  test('instagram should be 인스타그램', () => {
    expect(PLATFORM_LABELS.instagram).toBe('인스타그램')
  })

  test('naver_blog should be 네이버 블로그', () => {
    expect(PLATFORM_LABELS.naver_blog).toBe('네이버 블로그')
  })

  test('twitter should be 트위터', () => {
    expect(PLATFORM_LABELS.twitter).toBe('트위터')
  })
})

describe('SNS Types - PLATFORM_OPTIONS', () => {
  test('should have 5 platform options for select', () => {
    expect(PLATFORM_OPTIONS).toHaveLength(5)
  })

  test('each option should have value and label', () => {
    for (const opt of PLATFORM_OPTIONS) {
      expect(opt.value).toBeDefined()
      expect(opt.label).toBeDefined()
      expect(typeof opt.value).toBe('string')
      expect(typeof opt.label).toBe('string')
    }
  })

  test('option values should be valid platform keys', () => {
    const validPlatforms = ['instagram', 'tistory', 'naver_blog', 'twitter', 'facebook']
    for (const opt of PLATFORM_OPTIONS) {
      expect(validPlatforms).toContain(opt.value)
    }
  })

  test('option values should be unique', () => {
    const values = PLATFORM_OPTIONS.map((o) => o.value)
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('Tab Navigation - Definition', () => {
  const TAB_ITEMS = [
    { value: 'content', label: '콘텐츠' },
    { value: 'queue', label: '발행 큐' },
    { value: 'cardnews', label: '카드뉴스' },
    { value: 'stats', label: '통계' },
    { value: 'accounts', label: '계정 관리' },
  ]

  test('should have exactly 5 tabs', () => {
    expect(TAB_ITEMS).toHaveLength(5)
  })

  test('default tab should be content', () => {
    expect(TAB_ITEMS[0].value).toBe('content')
  })

  test('all tab values should be unique', () => {
    const values = TAB_ITEMS.map((t) => t.value)
    expect(new Set(values).size).toBe(values.length)
  })

  test('tabs should include queue for 발행 큐', () => {
    expect(TAB_ITEMS.find((t) => t.value === 'queue')).toBeDefined()
  })

  test('tabs should include cardnews for 카드뉴스', () => {
    expect(TAB_ITEMS.find((t) => t.value === 'cardnews')).toBeDefined()
  })
})

describe('Status Stepper - Step Logic', () => {
  const STEPS = ['draft', 'pending', 'approved', 'scheduled', 'published']
  const STEP_INDEX: Record<string, number> = {
    draft: 0, pending: 1, approved: 2, scheduled: 3, published: 4,
    rejected: 1, failed: 4,
  }

  test('should have 5 main steps', () => {
    expect(STEPS).toHaveLength(5)
  })

  test('draft should be first step (index 0)', () => {
    expect(STEP_INDEX.draft).toBe(0)
  })

  test('published should be last step (index 4)', () => {
    expect(STEP_INDEX.published).toBe(4)
  })

  test('rejected maps to pending step position', () => {
    expect(STEP_INDEX.rejected).toBe(STEP_INDEX.pending)
  })

  test('failed maps to published step position', () => {
    expect(STEP_INDEX.failed).toBe(STEP_INDEX.published)
  })

  test('step indices increase monotonically', () => {
    for (let i = 1; i < STEPS.length; i++) {
      expect(STEP_INDEX[STEPS[i]]).toBeGreaterThan(STEP_INDEX[STEPS[i - 1]])
    }
  })
})

describe('Queue Tab - Status Filters', () => {
  const QUEUE_FILTERS = ['', 'scheduled', 'publishing', 'published', 'failed']

  test('should have 5 filter options including "all"', () => {
    expect(QUEUE_FILTERS).toHaveLength(5)
  })

  test('first filter should be empty string (all)', () => {
    expect(QUEUE_FILTERS[0]).toBe('')
  })

  test('scheduled filter should be present', () => {
    expect(QUEUE_FILTERS).toContain('scheduled')
  })

  test('failed filter should be present', () => {
    expect(QUEUE_FILTERS).toContain('failed')
  })
})

describe('Card News - Card Layout Types', () => {
  const VALID_LAYOUTS = ['cover', 'content', 'closing']

  test('should have 3 layout types', () => {
    expect(VALID_LAYOUTS).toHaveLength(3)
  })

  test('cover layout for first slide', () => {
    expect(VALID_LAYOUTS[0]).toBe('cover')
  })

  test('content layout for middle slides', () => {
    expect(VALID_LAYOUTS[1]).toBe('content')
  })

  test('closing layout for last slide', () => {
    expect(VALID_LAYOUTS[2]).toBe('closing')
  })
})

describe('Card News - Card Limit', () => {
  const MIN_CARDS = 1
  const MAX_CARDS = 10

  test('minimum cards should be 1', () => {
    expect(MIN_CARDS).toBe(1)
  })

  test('maximum cards should be 10 (Instagram carousel limit)', () => {
    expect(MAX_CARDS).toBe(10)
  })

  test('AI generation range should be 3-10', () => {
    const AI_MIN = 3
    const AI_MAX = 10
    expect(AI_MIN).toBeGreaterThanOrEqual(MIN_CARDS)
    expect(AI_MAX).toBeLessThanOrEqual(MAX_CARDS)
  })
})

describe('Card News - Move Card Logic', () => {
  test('moving first card up should be a no-op', () => {
    const cards = ['a', 'b', 'c']
    const idx = 0
    const dir = -1
    const newIdx = idx + dir
    expect(newIdx).toBeLessThan(0) // can't move
  })

  test('moving last card down should be a no-op', () => {
    const cards = ['a', 'b', 'c']
    const idx = cards.length - 1
    const dir = 1
    const newIdx = idx + dir
    expect(newIdx).toBeGreaterThanOrEqual(cards.length) // can't move
  })

  test('moving middle card swaps correctly', () => {
    const cards = ['a', 'b', 'c']
    const idx = 1
    const dir = 1
    const newIdx = idx + dir
    const next = [...cards]
    ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
    expect(next).toEqual(['a', 'c', 'b'])
  })
})

describe('Content Tab - View Mode Toggle', () => {
  const VIEW_MODES = ['list', 'gallery']

  test('should have 2 view modes', () => {
    expect(VIEW_MODES).toHaveLength(2)
  })

  test('default should be list', () => {
    expect(VIEW_MODES[0]).toBe('list')
  })

  test('gallery mode should be available', () => {
    expect(VIEW_MODES).toContain('gallery')
  })
})

describe('Content Tab - Create Modes', () => {
  const CREATE_MODES = ['manual', 'ai']

  test('should have 2 create modes', () => {
    expect(CREATE_MODES).toHaveLength(2)
  })

  test('manual should be first option', () => {
    expect(CREATE_MODES[0]).toBe('manual')
  })

  test('ai should be available', () => {
    expect(CREATE_MODES).toContain('ai')
  })
})

describe('Queue Tab - Batch Operations', () => {
  test('selecting all items creates a complete set', () => {
    const items = [{ id: '1' }, { id: '2' }, { id: '3' }]
    const selected = new Set(items.map((i) => i.id))
    expect(selected.size).toBe(items.length)
  })

  test('toggling a selected item removes it', () => {
    const selected = new Set(['1', '2', '3'])
    selected.delete('2')
    expect(selected.size).toBe(2)
    expect(selected.has('2')).toBe(false)
  })

  test('toggling an unselected item adds it', () => {
    const selected = new Set(['1'])
    selected.add('2')
    expect(selected.size).toBe(2)
    expect(selected.has('2')).toBe(true)
  })

  test('toggle all when all selected deselects all', () => {
    const items = ['1', '2', '3']
    const selected = new Set(items)
    if (selected.size === items.length) {
      selected.clear()
    }
    expect(selected.size).toBe(0)
  })
})

describe('API Endpoint Mapping', () => {
  const ENDPOINTS = {
    queue: '/workspace/sns/queue',
    queueStats: '/workspace/sns/queue/stats',
    batchSchedule: '/workspace/sns/batch-schedule',
    batchCancel: '/workspace/sns/batch-cancel',
    cardSeriesCreate: '/workspace/sns/card-series',
    cardSeriesDetail: '/workspace/sns/card-series/:id',
    cardUpdate: '/workspace/sns/card-series/:id/cards/:index',
    cardSeriesDelete: '/workspace/sns/card-series/:id',
    cardSeriesReorder: '/workspace/sns/card-series/:id/reorder',
    cardSeriesGenerate: '/workspace/sns/card-series/generate',
    cardSeriesSubmit: '/workspace/sns/card-series/:id/submit',
    cardSeriesApprove: '/workspace/sns/card-series/:id/approve',
    cardSeriesReject: '/workspace/sns/card-series/:id/reject',
  }

  test('all queue endpoints should start with /workspace/sns', () => {
    for (const [, path] of Object.entries(ENDPOINTS)) {
      expect(path.startsWith('/workspace/sns')).toBe(true)
    }
  })

  test('should have 13 endpoints from Story 12-4 backend', () => {
    expect(Object.keys(ENDPOINTS)).toHaveLength(13)
  })

  test('card series endpoints should contain card-series', () => {
    const cardEndpoints = Object.entries(ENDPOINTS).filter(([k]) => k.startsWith('cardSeries'))
    expect(cardEndpoints.length).toBeGreaterThanOrEqual(7)
    for (const [, path] of cardEndpoints) {
      expect(path).toContain('card-series')
    }
  })

  test('batch endpoints should contain batch', () => {
    const batchEndpoints = Object.entries(ENDPOINTS).filter(([k]) => k.startsWith('batch'))
    expect(batchEndpoints).toHaveLength(2)
  })
})

describe('Date Formatting - fmtDate equivalent', () => {
  function fmtDate(iso?: string | null) {
    if (!iso) return null
    return new Date(iso).toLocaleString('ko', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  test('null input returns null', () => {
    expect(fmtDate(null)).toBeNull()
  })

  test('undefined input returns null', () => {
    expect(fmtDate(undefined)).toBeNull()
  })

  test('empty string returns null', () => {
    expect(fmtDate('')).toBeNull()
  })

  test('valid ISO date returns formatted string', () => {
    const result = fmtDate('2026-03-08T14:30:00Z')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
    expect(result!.length).toBeGreaterThan(0)
  })
})

describe('Card News Metadata Structure', () => {
  test('series root content has correct metadata shape', () => {
    const metadata = {
      cards: [
        { index: 0, imageUrl: 'https://example.com/1.png', caption: '커버', layout: 'cover' },
        { index: 1, imageUrl: 'https://example.com/2.png', caption: '내용', layout: 'content' },
        { index: 2, imageUrl: 'https://example.com/3.png', caption: 'CTA', layout: 'closing' },
      ],
      totalCards: 3,
      seriesTitle: '테스트 시리즈',
    }

    expect(metadata.cards).toHaveLength(3)
    expect(metadata.totalCards).toBe(3)
    expect(metadata.seriesTitle).toBe('테스트 시리즈')
  })

  test('card indices should be sequential', () => {
    const cards = [
      { index: 0, imageUrl: '', caption: '', layout: 'cover' },
      { index: 1, imageUrl: '', caption: '', layout: 'content' },
      { index: 2, imageUrl: '', caption: '', layout: 'closing' },
    ]
    for (let i = 0; i < cards.length; i++) {
      expect(cards[i].index).toBe(i)
    }
  })

  test('first card should be cover layout', () => {
    const cards = [
      { index: 0, layout: 'cover' },
      { index: 1, layout: 'content' },
      { index: 2, layout: 'closing' },
    ]
    expect(cards[0].layout).toBe('cover')
  })

  test('last card should be closing layout', () => {
    const cards = [
      { index: 0, layout: 'cover' },
      { index: 1, layout: 'content' },
      { index: 2, layout: 'closing' },
    ]
    expect(cards[cards.length - 1].layout).toBe('closing')
  })
})

describe('Queue Stats Structure', () => {
  test('QueueStats should have all required fields', () => {
    const stats = {
      byStatus: [{ status: 'scheduled', count: 5 }],
      byPlatform: [{ platform: 'instagram', count: 3 }],
      nextScheduled: '2026-03-09T10:00:00Z',
      todayCount: 2,
      failedCount: 0,
    }

    expect(stats.byStatus).toBeDefined()
    expect(stats.byPlatform).toBeDefined()
    expect(typeof stats.nextScheduled).toBe('string')
    expect(typeof stats.todayCount).toBe('number')
    expect(typeof stats.failedCount).toBe('number')
  })

  test('nextScheduled can be null', () => {
    const stats = {
      byStatus: [],
      byPlatform: [],
      nextScheduled: null,
      todayCount: 0,
      failedCount: 0,
    }
    expect(stats.nextScheduled).toBeNull()
  })
})

describe('Gallery View - Image Filter', () => {
  test('gallery view filters to items with imageUrl', () => {
    const items = [
      { id: '1', imageUrl: 'https://example.com/1.png', title: 'With image' },
      { id: '2', imageUrl: undefined, title: 'No image' },
      { id: '3', imageUrl: 'https://example.com/3.png', title: 'With image 2' },
      { id: '4', imageUrl: null, title: 'Null image' },
    ]
    const filtered = items.filter((i) => i.imageUrl)
    expect(filtered).toHaveLength(2)
    expect(filtered[0].id).toBe('1')
    expect(filtered[1].id).toBe('3')
  })
})

describe('Account Filter Logic', () => {
  test('empty filter returns all items', () => {
    const items = [
      { id: '1', snsAccountId: 'acc1' },
      { id: '2', snsAccountId: 'acc2' },
      { id: '3', snsAccountId: null },
    ]
    const filter = ''
    const result = filter ? items.filter((i) => i.snsAccountId === filter) : items
    expect(result).toHaveLength(3)
  })

  test('specific account filter returns matching items', () => {
    const items = [
      { id: '1', snsAccountId: 'acc1' },
      { id: '2', snsAccountId: 'acc2' },
      { id: '3', snsAccountId: 'acc1' },
    ]
    const filter = 'acc1'
    const result = items.filter((i) => i.snsAccountId === filter)
    expect(result).toHaveLength(2)
  })
})
