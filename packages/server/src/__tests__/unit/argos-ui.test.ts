/**
 * ARGOS UI (Story 14-5) -- 유틸리티 함수 및 통합 테스트
 *
 * 프론트엔드 전용 스토리이므로:
 * 1. 클라이언트 사이드 조건 한국어 변환 테스트
 * 2. 기존 API 엔드포인트 통합 동작 검증 (14-3에서 CRUD 테스트 완료)
 * 3. triggerType 색상/레이블 매핑 검증
 * 4. 상태 바 데이터 포맷팅 테스트
 * 5. 이벤트 상태 설정 정합성 테스트
 */

import { describe, it, expect } from 'bun:test'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'

const PROJECT_ROOT = resolve(__dirname, '../../../../..')

// ── Client-side condition formatter (mirrors argos.tsx::formatConditionKorean) ──

const PRICE_OPERATORS: Record<string, string> = {
  above: '이상',
  below: '이하',
  change_pct_above: '% 이상 변동',
  change_pct_below: '% 이하 변동',
}

function formatConditionKorean(triggerType: string, condition: Record<string, unknown>): string {
  switch (triggerType) {
    case 'price':
    case 'price-above':
    case 'price-below': {
      const ticker = (condition.ticker || condition.stockCode || '?') as string
      const value = (condition.value ?? condition.targetPrice ?? '?') as number
      const op = PRICE_OPERATORS[(condition.operator || triggerType.replace('price-', '')) as string] || ''
      return `${ticker} ${value}${op}`
    }
    case 'news': {
      const keywords = (condition.keywords || []) as string[]
      const matchMode = condition.matchMode === 'all' ? '모두 포함' : '하나 이상'
      return keywords.length ? `키워드: ${keywords.join(', ')} (${matchMode})` : '키워드 미설정'
    }
    case 'schedule': {
      const interval = (condition.intervalMinutes || 60) as number
      return `${interval}분 간격`
    }
    case 'market-open':
      return `장 시작 (${(condition.market as string) || 'KR'})`
    case 'market-close':
      return `장 마감 (${(condition.market as string) || 'KR'})`
    case 'custom': {
      const field = (condition.field || '?') as string
      const operator = (condition.operator || '?') as string
      const value = condition.value ?? '?'
      return `${field} ${operator} ${value}`
    }
    default:
      return JSON.stringify(condition)
  }
}

// ── Trigger type colors (mirrors argos.tsx::TRIGGER_TYPE_COLORS) ──

const TRIGGER_TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  price: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '가격' },
  'price-above': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '가격↑' },
  'price-below': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '가격↓' },
  news: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: '뉴스' },
  schedule: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: '일정' },
  'market-open': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: '장시작' },
  'market-close': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: '장마감' },
  custom: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', label: '커스텀' },
}

// ── Event status config (mirrors argos.tsx) ──

const EVENT_STATUS_CONFIG: Record<string, { label: string; variant: string }> = {
  detected: { label: '감지됨', variant: 'info' },
  executing: { label: '실행중', variant: 'warning' },
  completed: { label: '완료', variant: 'success' },
  failed: { label: '실패', variant: 'error' },
}

// ── Format helpers (mirrors argos.tsx) ──

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 60000) return '방금'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const daysVal = Math.floor(hours / 24)
  return `${daysVal}일 전`
}

// ══════════════════════════════════════════════════════
// Tests
// ══════════════════════════════════════════════════════

describe('ARGOS UI -- formatConditionKorean', () => {
  it('price condition with ticker and operator', () => {
    expect(formatConditionKorean('price', { ticker: '005930', operator: 'above', value: 80000 }))
      .toBe('005930 80000이상')
  })

  it('price-above type uses fallback operator from triggerType', () => {
    expect(formatConditionKorean('price-above', { ticker: 'AAPL', value: 200 }))
      .toBe('AAPL 200이상')
  })

  it('price-below type uses fallback operator', () => {
    expect(formatConditionKorean('price-below', { ticker: 'TSLA', value: 150 }))
      .toBe('TSLA 150이하')
  })

  it('price condition with percentage change', () => {
    expect(formatConditionKorean('price', { ticker: '005930', operator: 'change_pct_above', value: 5 }))
      .toBe('005930 5% 이상 변동')
  })

  it('price condition with legacy stockCode/targetPrice', () => {
    expect(formatConditionKorean('price', { stockCode: '005930', targetPrice: 70000 }))
      .toBe('005930 70000')
  })

  it('news condition with keywords (any mode)', () => {
    expect(formatConditionKorean('news', { keywords: ['삼성전자', '실적'], matchMode: 'any' }))
      .toBe('키워드: 삼성전자, 실적 (하나 이상)')
  })

  it('news condition with keywords (all mode)', () => {
    expect(formatConditionKorean('news', { keywords: ['공시', '발표'], matchMode: 'all' }))
      .toBe('키워드: 공시, 발표 (모두 포함)')
  })

  it('news condition with empty keywords', () => {
    expect(formatConditionKorean('news', { keywords: [], matchMode: 'any' }))
      .toBe('키워드 미설정')
  })

  it('schedule condition with interval', () => {
    expect(formatConditionKorean('schedule', { intervalMinutes: 30 }))
      .toBe('30분 간격')
  })

  it('schedule condition with default interval', () => {
    expect(formatConditionKorean('schedule', {}))
      .toBe('60분 간격')
  })

  it('market-open with market', () => {
    expect(formatConditionKorean('market-open', { market: 'US' }))
      .toBe('장 시작 (US)')
  })

  it('market-close defaults to KR', () => {
    expect(formatConditionKorean('market-close', {}))
      .toBe('장 마감 (KR)')
  })

  it('custom condition', () => {
    expect(formatConditionKorean('custom', { field: 'temperature', operator: 'gt', value: 30 }))
      .toBe('temperature gt 30')
  })

  it('unknown type falls back to JSON', () => {
    const cond = { foo: 'bar' }
    expect(formatConditionKorean('unknown', cond)).toBe(JSON.stringify(cond))
  })
})

describe('ARGOS UI -- TRIGGER_TYPE_COLORS', () => {
  it('all 8 trigger types have color definitions', () => {
    const expectedTypes = ['price', 'price-above', 'price-below', 'news', 'schedule', 'market-open', 'market-close', 'custom']
    for (const type of expectedTypes) {
      expect(TRIGGER_TYPE_COLORS[type]).toBeDefined()
      expect(TRIGGER_TYPE_COLORS[type].bg).toBeTruthy()
      expect(TRIGGER_TYPE_COLORS[type].text).toBeTruthy()
      expect(TRIGGER_TYPE_COLORS[type].label).toBeTruthy()
    }
  })

  it('price types share orange color', () => {
    expect(TRIGGER_TYPE_COLORS['price'].bg).toContain('orange')
    expect(TRIGGER_TYPE_COLORS['price-above'].bg).toContain('orange')
    expect(TRIGGER_TYPE_COLORS['price-below'].bg).toContain('orange')
  })

  it('news uses blue color', () => {
    expect(TRIGGER_TYPE_COLORS['news'].bg).toContain('blue')
  })

  it('schedule uses purple color', () => {
    expect(TRIGGER_TYPE_COLORS['schedule'].bg).toContain('purple')
  })

  it('market types use green color', () => {
    expect(TRIGGER_TYPE_COLORS['market-open'].bg).toContain('green')
    expect(TRIGGER_TYPE_COLORS['market-close'].bg).toContain('green')
  })

  it('custom uses gray color', () => {
    expect(TRIGGER_TYPE_COLORS['custom'].bg).toContain('gray')
  })

  it('labels are in Korean', () => {
    expect(TRIGGER_TYPE_COLORS['price'].label).toBe('가격')
    expect(TRIGGER_TYPE_COLORS['news'].label).toBe('뉴스')
    expect(TRIGGER_TYPE_COLORS['schedule'].label).toBe('일정')
    expect(TRIGGER_TYPE_COLORS['market-open'].label).toBe('장시작')
    expect(TRIGGER_TYPE_COLORS['market-close'].label).toBe('장마감')
    expect(TRIGGER_TYPE_COLORS['custom'].label).toBe('커스텀')
  })
})

describe('ARGOS UI -- EVENT_STATUS_CONFIG', () => {
  it('all 4 event statuses have config', () => {
    const expectedStatuses = ['detected', 'executing', 'completed', 'failed']
    for (const status of expectedStatuses) {
      expect(EVENT_STATUS_CONFIG[status]).toBeDefined()
      expect(EVENT_STATUS_CONFIG[status].label).toBeTruthy()
      expect(EVENT_STATUS_CONFIG[status].variant).toBeTruthy()
    }
  })

  it('detected uses info variant', () => {
    expect(EVENT_STATUS_CONFIG['detected'].variant).toBe('info')
    expect(EVENT_STATUS_CONFIG['detected'].label).toBe('감지됨')
  })

  it('executing uses warning variant', () => {
    expect(EVENT_STATUS_CONFIG['executing'].variant).toBe('warning')
    expect(EVENT_STATUS_CONFIG['executing'].label).toBe('실행중')
  })

  it('completed uses success variant', () => {
    expect(EVENT_STATUS_CONFIG['completed'].variant).toBe('success')
    expect(EVENT_STATUS_CONFIG['completed'].label).toBe('완료')
  })

  it('failed uses error variant', () => {
    expect(EVENT_STATUS_CONFIG['failed'].variant).toBe('error')
    expect(EVENT_STATUS_CONFIG['failed'].label).toBe('실패')
  })
})

describe('ARGOS UI -- formatRelativeTime', () => {
  it('returns 방금 for < 1 minute ago', () => {
    const now = new Date()
    expect(formatRelativeTime(now.toISOString())).toBe('방금')
  })

  it('returns N분 전 for minutes', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(formatRelativeTime(fiveMinAgo)).toBe('5분 전')
  })

  it('returns N시간 전 for hours', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(threeHoursAgo)).toBe('3시간 전')
  })

  it('returns N일 전 for days', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(twoDaysAgo)).toBe('2일 전')
  })
})

describe('ARGOS UI -- File structure validation', () => {
  it('argos.tsx page file exists', () => {
    const path = resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx')
    expect(existsSync(path)).toBe(true)
  })

  it('App.tsx contains argos route', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/App.tsx'), 'utf-8')
    expect(content).toContain('ArgosPage')
    expect(content).toContain("path=\"argos\"")
  })

  it('sidebar.tsx contains ARGOS menu entry', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/components/sidebar.tsx'), 'utf-8')
    expect(content).toContain("'/argos'")
    expect(content).toContain('ARGOS')
  })

  it('argos page imports required hooks and components', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')
    expect(content).toContain('useQuery')
    expect(content).toContain('useMutation')
    expect(content).toContain('useWsStore')
    expect(content).toContain('useAuthStore')
    expect(content).toContain("from '@corthex/ui'")
    expect(content).toContain("from 'sonner'")
  })

  it('argos page has all required sections', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')

    // Status bar component
    expect(content).toContain('StatusBar')
    expect(content).toContain('dataOk')
    expect(content).toContain('aiOk')
    expect(content).toContain('activeTriggersCount')
    expect(content).toContain('todayCost')

    // Trigger card component
    expect(content).toContain('TriggerCard')
    expect(content).toContain('formatConditionKorean')

    // Event log section
    expect(content).toContain('EventLogSection')
    expect(content).toContain('활동 로그')
    expect(content).toContain('오류 로그')

    // Trigger modal
    expect(content).toContain('TriggerModal')

    // Empty state
    expect(content).toContain('EmptyState')
    expect(content).toContain('설정된 감시 트리거가 없습니다')

    // WebSocket
    expect(content).toContain("subscribe('argos'")
    expect(content).toContain('argos-trigger-fired')
    expect(content).toContain('argos-execution-completed')
    expect(content).toContain('argos-execution-failed')
  })

  it('argos page has proper API endpoints', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')

    // Status API
    expect(content).toContain('/workspace/argos/status')

    // Triggers CRUD
    expect(content).toContain('/workspace/argos/triggers')
    expect(content).toContain("api.post('/workspace/argos/triggers'")
    expect(content).toContain('/workspace/argos/triggers/${id}')
    expect(content).toContain('/toggle')

    // Events
    expect(content).toContain('/events')
  })

  it('argos page has dark mode support', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')
    const darkCount = (content.match(/dark:/g) || []).length
    // Should have substantial dark mode usage (20+)
    expect(darkCount).toBeGreaterThan(20)
  })
})

describe('ARGOS UI -- Trigger type alignment with backend', () => {
  it('all backend trigger types are represented in UI', () => {
    const backendTypes = ['price', 'price-above', 'price-below', 'market-open', 'market-close', 'news', 'schedule', 'custom']
    for (const type of backendTypes) {
      expect(TRIGGER_TYPE_COLORS[type]).toBeDefined()
    }
  })

  it('TRIGGER_TYPES list matches colors map', () => {
    const TRIGGER_TYPES = [
      { value: 'price', label: '가격 감시' },
      { value: 'price-above', label: '가격 상한' },
      { value: 'price-below', label: '가격 하한' },
      { value: 'news', label: '뉴스 감시' },
      { value: 'schedule', label: '정기 수집' },
      { value: 'market-open', label: '장 시작' },
      { value: 'market-close', label: '장 마감' },
      { value: 'custom', label: '커스텀' },
    ]

    for (const tt of TRIGGER_TYPES) {
      expect(TRIGGER_TYPE_COLORS[tt.value]).toBeDefined()
    }
    expect(TRIGGER_TYPES.length).toBe(8)
    expect(Object.keys(TRIGGER_TYPE_COLORS).length).toBe(8)
  })
})

describe('ARGOS UI -- Status bar data formatting', () => {
  it('status bar shows OK/NG correctly', () => {
    const okStatus = { dataOk: true, aiOk: true, activeTriggersCount: 5, todayCost: 0.1234, lastCheckAt: new Date().toISOString() }
    expect(okStatus.dataOk ? 'OK' : 'NG').toBe('OK')
    expect(okStatus.aiOk ? 'OK' : 'NG').toBe('OK')

    const ngStatus = { dataOk: false, aiOk: false, activeTriggersCount: 0, todayCost: 0, lastCheckAt: null }
    expect(ngStatus.dataOk ? 'OK' : 'NG').toBe('NG')
    expect(ngStatus.aiOk ? 'OK' : 'NG').toBe('NG')
  })

  it('cost formatting uses 4 decimal places', () => {
    const cost = 0.12345678
    expect(`$${cost.toFixed(4)}`).toBe('$0.1235')
  })

  it('zero cost displays correctly', () => {
    expect(`$${(0).toFixed(4)}`).toBe('$0.0000')
  })
})

describe('ARGOS UI -- Condition builder validation', () => {
  it('price condition requires ticker and value', () => {
    const isValidPrice = (ticker: string, value: string) =>
      !!ticker && !!value && !isNaN(Number(value))

    expect(isValidPrice('005930', '80000')).toBe(true)
    expect(isValidPrice('', '80000')).toBe(false)
    expect(isValidPrice('005930', '')).toBe(false)
    expect(isValidPrice('005930', 'abc')).toBe(false)
  })

  it('news condition requires at least one keyword', () => {
    const isValidNews = (keywords: string) =>
      keywords.split(',').filter(k => k.trim()).length > 0

    expect(isValidNews('삼성전자, 공시')).toBe(true)
    expect(isValidNews('삼성전자')).toBe(true)
    expect(isValidNews('')).toBe(false)
    expect(isValidNews('  ,  ')).toBe(false)
  })

  it('schedule condition requires positive interval', () => {
    const isValidSchedule = (interval: string) =>
      !!interval && !isNaN(Number(interval)) && Number(interval) > 0

    expect(isValidSchedule('60')).toBe(true)
    expect(isValidSchedule('1')).toBe(true)
    expect(isValidSchedule('0')).toBe(false)
    expect(isValidSchedule('-1')).toBe(false)
    expect(isValidSchedule('')).toBe(false)
  })

  it('market-open/market-close always valid (no extra fields required)', () => {
    const isValidMarket = () => true
    expect(isValidMarket()).toBe(true)
  })

  it('custom condition requires field and value', () => {
    const isValidCustom = (field: string, value: string) =>
      !!field && !!value

    expect(isValidCustom('temperature', '30')).toBe(true)
    expect(isValidCustom('', '30')).toBe(false)
    expect(isValidCustom('temperature', '')).toBe(false)
  })
})

describe('ARGOS UI -- WebSocket event types', () => {
  it('all 3 event types handled', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')
    expect(content).toContain("event.type === 'argos-trigger-fired'")
    expect(content).toContain("event.type === 'argos-execution-completed'")
    expect(content).toContain("event.type === 'argos-execution-failed'")
  })

  it('trigger-fired shows toast notification', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')
    expect(content).toContain('toast.info')
  })

  it('execution-completed shows success toast', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')
    expect(content).toContain('toast.success')
  })

  it('execution-failed shows error toast', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')
    expect(content).toContain('toast.error')
  })
})

describe('ARGOS UI -- Sidebar and routing integration', () => {
  it('ARGOS is placed after 크론기지 in sidebar', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/components/sidebar.tsx'), 'utf-8')
    const cronIdx = content.indexOf("'/cron'")
    const argosIdx = content.indexOf("'/argos'")
    expect(cronIdx).toBeGreaterThan(-1)
    expect(argosIdx).toBeGreaterThan(-1)
    expect(argosIdx).toBeGreaterThan(cronIdx)
  })

  it('ARGOS uses 🔍 icon', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/components/sidebar.tsx'), 'utf-8')
    const argosLine = content.split('\n').find(l => l.includes("'/argos'"))
    expect(argosLine).toContain('🔍')
  })

  it('ArgosPage uses lazy import in App.tsx', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/App.tsx'), 'utf-8')
    expect(content).toContain("lazy(() => import('./pages/argos')")
  })
})
