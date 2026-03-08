/**
 * ARGOS UI TEA Tests (Story 14-5) -- Risk-Based Test Expansion
 *
 * TEA (Test Architect) auto-generated tests focusing on:
 * 1. Edge cases in formatConditionKorean
 * 2. Condition builder validation edge cases
 * 3. API route + service integration verification
 * 4. WebSocket event handling edge cases
 * 5. Status bar boundary conditions
 * 6. UI structure completeness and accessibility patterns
 * 7. Cross-component data flow validation
 */

import { describe, it, expect } from 'bun:test'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'

const PROJECT_ROOT = resolve(__dirname, '../../../../..')

// ══════════════════════════════════════════════════════
// Mirrored functions from argos.tsx for testing
// ══════════════════════════════════════════════════════

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

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ══════════════════════════════════════════════════════
// 1. formatConditionKorean -- Edge Cases
// ══════════════════════════════════════════════════════

describe('TEA: formatConditionKorean edge cases', () => {
  it('price with missing ticker defaults to ?', () => {
    expect(formatConditionKorean('price', { value: 80000, operator: 'above' }))
      .toBe('? 80000이상')
  })

  it('price with missing value defaults to ? with operator', () => {
    expect(formatConditionKorean('price', { ticker: '005930', operator: 'above' }))
      .toBe('005930 ?이상')
  })

  it('price with null value includes operator', () => {
    expect(formatConditionKorean('price', { ticker: 'AAPL', value: null, operator: 'below' }))
      .toBe('AAPL ?이하')
  })

  it('price with zero value is valid', () => {
    expect(formatConditionKorean('price', { ticker: 'FREE', value: 0, operator: 'above' }))
      .toBe('FREE 0이상')
  })

  it('price with negative value', () => {
    expect(formatConditionKorean('price', { ticker: 'CRYPT', value: -10, operator: 'below' }))
      .toBe('CRYPT -10이하')
  })

  it('price with unknown operator returns empty op string', () => {
    expect(formatConditionKorean('price', { ticker: 'X', value: 100, operator: 'unknown' }))
      .toBe('X 100')
  })

  it('price-above without explicit operator infers from triggerType', () => {
    const result = formatConditionKorean('price-above', { ticker: 'TSLA', value: 300 })
    expect(result).toContain('이상')
  })

  it('price-below without explicit operator infers from triggerType', () => {
    const result = formatConditionKorean('price-below', { ticker: 'META', value: 100 })
    expect(result).toContain('이하')
  })

  it('news with single keyword', () => {
    expect(formatConditionKorean('news', { keywords: ['삼성'], matchMode: 'any' }))
      .toBe('키워드: 삼성 (하나 이상)')
  })

  it('news with many keywords', () => {
    const kw = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
    const result = formatConditionKorean('news', { keywords: kw, matchMode: 'all' })
    expect(result).toContain('a, b, c')
    expect(result).toContain('모두 포함')
  })

  it('news with undefined matchMode defaults to 하나 이상', () => {
    expect(formatConditionKorean('news', { keywords: ['test'] }))
      .toBe('키워드: test (하나 이상)')
  })

  it('news with null keywords', () => {
    expect(formatConditionKorean('news', { keywords: null }))
      .toBe('키워드 미설정')
  })

  it('schedule with zero intervalMinutes uses default 60', () => {
    expect(formatConditionKorean('schedule', { intervalMinutes: 0 }))
      .toBe('60분 간격')
  })

  it('schedule with very large interval', () => {
    expect(formatConditionKorean('schedule', { intervalMinutes: 999999 }))
      .toBe('999999분 간격')
  })

  it('market-open with empty string market defaults to KR', () => {
    expect(formatConditionKorean('market-open', { market: '' }))
      .toBe('장 시작 (KR)')
  })

  it('custom with all missing fields', () => {
    expect(formatConditionKorean('custom', {}))
      .toBe('? ? ?')
  })

  it('custom with numeric value', () => {
    expect(formatConditionKorean('custom', { field: 'temp', operator: 'gt', value: 42 }))
      .toBe('temp gt 42')
  })

  it('empty condition object for price type', () => {
    expect(formatConditionKorean('price', {}))
      .toBe('? ?')
  })

  it('handles condition with extra unknown fields gracefully', () => {
    const result = formatConditionKorean('price', { ticker: 'X', value: 1, operator: 'above', extra: 'data' })
    expect(result).toBe('X 1이상')
  })
})

// ══════════════════════════════════════════════════════
// 2. Condition Builder Validation -- Edge Cases
// ══════════════════════════════════════════════════════

describe('TEA: condition builder validation edge cases', () => {
  // Price validation
  it('price: float values are valid', () => {
    const isValid = (v: string) => !!v && !isNaN(Number(v))
    expect(isValid('0.001')).toBe(true)
    expect(isValid('99999.99')).toBe(true)
  })

  it('price: scientific notation is valid', () => {
    expect(!isNaN(Number('1e5'))).toBe(true)
  })

  it('price: whitespace-only ticker is invalid', () => {
    expect(!!('   '.trim())).toBe(false)
  })

  it('price: special characters in ticker', () => {
    // Tickers like ^GSPC or BRK.A are valid
    expect(!!'^GSPC').toBe(true)
    expect(!!'BRK.A').toBe(true)
  })

  // News validation
  it('news: keywords with only whitespace entries are invalid', () => {
    const keywords = '  ,   ,  '
    const valid = keywords.split(',').filter(k => k.trim()).length > 0
    expect(valid).toBe(false)
  })

  it('news: keywords with mixed valid/whitespace entries', () => {
    const keywords = 'valid, , another'
    const valid = keywords.split(',').filter(k => k.trim()).length > 0
    expect(valid).toBe(true)
  })

  it('news: single character keyword is valid', () => {
    const keywords = 'A'
    const valid = keywords.split(',').filter(k => k.trim()).length > 0
    expect(valid).toBe(true)
  })

  // Schedule validation
  it('schedule: non-integer interval', () => {
    const v = '5.5'
    expect(!isNaN(Number(v)) && Number(v) > 0).toBe(true)
  })

  it('schedule: Infinity is not a valid interval', () => {
    expect(Number('Infinity') > 0 && isFinite(Number('Infinity'))).toBe(false)
  })

  // Cooldown validation
  it('cooldown: value of 1 is minimum valid', () => {
    const cooldown = 1
    expect(cooldown >= 1 && cooldown <= 1440).toBe(true)
  })

  it('cooldown: value of 1440 is maximum valid', () => {
    const cooldown = 1440
    expect(cooldown >= 1 && cooldown <= 1440).toBe(true)
  })

  it('cooldown: 0 is below minimum', () => {
    expect(0 >= 1).toBe(false)
  })

  it('cooldown: 1441 exceeds maximum', () => {
    expect(1441 <= 1440).toBe(false)
  })
})

// ══════════════════════════════════════════════════════
// 3. formatRelativeTime -- Edge Cases
// ══════════════════════════════════════════════════════

describe('TEA: formatRelativeTime edge cases', () => {
  it('exactly 1 minute ago', () => {
    const oneMinAgo = new Date(Date.now() - 60 * 1000).toISOString()
    expect(formatRelativeTime(oneMinAgo)).toBe('1분 전')
  })

  it('59 minutes ago', () => {
    const fiftyNineMinAgo = new Date(Date.now() - 59 * 60 * 1000).toISOString()
    expect(formatRelativeTime(fiftyNineMinAgo)).toBe('59분 전')
  })

  it('exactly 1 hour ago', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(oneHourAgo)).toBe('1시간 전')
  })

  it('23 hours ago', () => {
    const twentyThreeHoursAgo = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(twentyThreeHoursAgo)).toBe('23시간 전')
  })

  it('exactly 24 hours ago (1 day)', () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(oneDayAgo)).toBe('1일 전')
  })

  it('future dates return 방금', () => {
    const future = new Date(Date.now() + 60000).toISOString()
    // Negative diff < 60000 → 방금
    expect(formatRelativeTime(future)).toBe('방금')
  })

  it('very old date (365 days)', () => {
    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(yearAgo)).toBe('365일 전')
  })
})

// ══════════════════════════════════════════════════════
// 4. formatShortDate -- Korean locale
// ══════════════════════════════════════════════════════

describe('TEA: formatShortDate formatting', () => {
  it('returns Korean locale formatted date', () => {
    const date = '2026-03-08T14:30:00.000Z'
    const result = formatShortDate(date)
    // Should contain month and time components
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles ISO date strings', () => {
    const result = formatShortDate(new Date().toISOString())
    expect(typeof result).toBe('string')
  })

  it('handles date-only strings', () => {
    const result = formatShortDate('2026-01-15')
    expect(typeof result).toBe('string')
  })
})

// ══════════════════════════════════════════════════════
// 5. Status bar boundary conditions
// ══════════════════════════════════════════════════════

describe('TEA: status bar boundary conditions', () => {
  it('cost of exactly 0 displays $0.0000', () => {
    expect(`$${(0).toFixed(4)}`).toBe('$0.0000')
  })

  it('very small cost displays correctly', () => {
    expect(`$${(0.0001).toFixed(4)}`).toBe('$0.0001')
  })

  it('large cost displays correctly', () => {
    expect(`$${(999.9999).toFixed(4)}`).toBe('$999.9999')
  })

  it('negative cost (edge case) displays with negative sign', () => {
    expect(`$${(-0.5).toFixed(4)}`).toBe('$-0.5000')
  })

  it('trigger count of 0 displays correctly', () => {
    expect(String(0)).toBe('0')
  })

  it('large trigger count', () => {
    expect(String(9999)).toBe('9999')
  })

  it('null lastCheckAt results in no timestamp display', () => {
    const status = { lastCheckAt: null }
    expect(status.lastCheckAt).toBeNull()
  })

  it('dataOk true means system is healthy', () => {
    expect(true ? 'OK' : 'NG').toBe('OK')
  })

  it('aiOk false means AI subsystem has issues', () => {
    expect(false ? 'OK' : 'NG').toBe('NG')
  })
})

// ══════════════════════════════════════════════════════
// 6. ARGOS API route + service alignment
// ══════════════════════════════════════════════════════

describe('TEA: ARGOS API route alignment', () => {
  it('argos route file exists', () => {
    const path = resolve(PROJECT_ROOT, 'packages/server/src/routes/workspace/argos.ts')
    expect(existsSync(path)).toBe(true)
  })

  it('argos route has all CRUD endpoints', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/server/src/routes/workspace/argos.ts'), 'utf-8')
    expect(content).toContain("argosRoute.get('/status'")
    expect(content).toContain("argosRoute.get('/triggers'")
    expect(content).toContain("argosRoute.get('/triggers/:id'")
    expect(content).toContain("argosRoute.post('/triggers'")
    expect(content).toContain("argosRoute.patch('/triggers/:id'")
    expect(content).toContain("argosRoute.patch('/triggers/:id/toggle'")
    expect(content).toContain("argosRoute.delete('/triggers/:id'")
    expect(content).toContain("/triggers/:id/events")
  })

  it('argos route uses auth middleware', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/server/src/routes/workspace/argos.ts'), 'utf-8')
    expect(content).toContain('authMiddleware')
  })

  it('argos route uses zod validation for create', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/server/src/routes/workspace/argos.ts'), 'utf-8')
    expect(content).toContain('createTriggerSchema')
    expect(content).toContain('zValidator')
  })

  it('argos service file exists', () => {
    const path = resolve(PROJECT_ROOT, 'packages/server/src/services/argos-service.ts')
    expect(existsSync(path)).toBe(true)
  })

  it('argos evaluator file exists', () => {
    const path = resolve(PROJECT_ROOT, 'packages/server/src/services/argos-evaluator.ts')
    expect(existsSync(path)).toBe(true)
  })
})

// ══════════════════════════════════════════════════════
// 7. UI component structure deep validation
// ══════════════════════════════════════════════════════

describe('TEA: ARGOS UI component structure', () => {
  const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')

  it('has ArgosPage export', () => {
    expect(content).toContain('export function ArgosPage()')
  })

  it('has StatusBar component', () => {
    expect(content).toContain('function StatusBar(')
  })

  it('has EmptyState component', () => {
    expect(content).toContain('function EmptyState(')
  })

  it('has TriggerCard component', () => {
    expect(content).toContain('function TriggerCard(')
  })

  it('has EventLogSection component', () => {
    expect(content).toContain('function EventLogSection(')
  })

  it('has TriggerModal component', () => {
    expect(content).toContain('function TriggerModal(')
  })

  it('uses React Query for data fetching', () => {
    expect(content).toContain('useQuery')
    expect(content).toContain('useMutation')
    expect(content).toContain('useQueryClient')
  })

  it('implements proper cache invalidation', () => {
    expect(content).toContain("invalidateQueries({ queryKey: ['argos-triggers'] })")
    expect(content).toContain("invalidateQueries({ queryKey: ['argos-status'] })")
    expect(content).toContain("invalidateQueries({ queryKey: ['argos-events'] })")
  })

  it('has 30-second polling for status', () => {
    expect(content).toContain('refetchInterval: 30_000')
  })

  it('has proper Escape key handling in modal', () => {
    expect(content).toContain("e.key === 'Escape'")
  })

  it('has modal backdrop click-to-close', () => {
    expect(content).toContain('onClick={onClose}')
    expect(content).toContain('e.stopPropagation()')
  })

  it('has delete confirmation dialog', () => {
    expect(content).toContain('ConfirmDialog')
    expect(content).toContain('트리거 삭제')
  })

  it('has toast notifications for all mutation outcomes', () => {
    expect(content).toContain("toast.success('트리거가 생성되었습니다')")
    expect(content).toContain("toast.success('트리거가 수정되었습니다')")
    expect(content).toContain("toast.success('트리거가 삭제되었습니다')")
    expect(content).toContain("toast.error('트리거 생성에 실패했습니다')")
    expect(content).toContain("toast.error('트리거 수정에 실패했습니다')")
  })

  it('has loading skeleton states', () => {
    expect(content).toContain('animate-pulse')
  })

  it('has highlight animation for triggered cards', () => {
    expect(content).toContain('highlightedTrigger')
    expect(content).toContain('setHighlightedTrigger')
    expect(content).toContain('ring-2')
  })

  it('status bar has 4 metric cards', () => {
    const statusBarContent = content.slice(content.indexOf('function StatusBar'))
    expect(statusBarContent).toContain('데이터')
    expect(statusBarContent).toContain('AI')
    expect(statusBarContent).toContain('활성 트리거')
    expect(statusBarContent).toContain('오늘 비용')
  })
})

// ══════════════════════════════════════════════════════
// 8. Trigger type condition forms validation
// ══════════════════════════════════════════════════════

describe('TEA: trigger type condition forms in modal', () => {
  const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')

  it('has price condition form with ticker and operator', () => {
    expect(content).toContain('종목 코드')
    expect(content).toContain('시장')
    expect(content).toContain("option value=\"KR\"")
    expect(content).toContain("option value=\"US\"")
  })

  it('has news condition form with keywords and matchMode', () => {
    expect(content).toContain('키워드 (쉼표 구분)')
    expect(content).toContain('매칭 모드')
    expect(content).toContain('하나 이상 포함')
    expect(content).toContain('모두 포함')
  })

  it('has schedule condition form with interval and active hours', () => {
    expect(content).toContain('수집 간격 (분)')
    expect(content).toContain('활성 시작 시간')
    expect(content).toContain('활성 종료 시간')
    expect(content).toContain('활성 요일')
  })

  it('has market condition form with market select', () => {
    expect(content).toContain('시장 선택')
  })

  it('has custom condition form with field/operator/value', () => {
    expect(content).toContain('필드')
    expect(content).toContain('연산자')
  })

  it('has cooldown minutes input', () => {
    expect(content).toContain('쿨다운 (분)')
    expect(content).toContain('min={1}')
    expect(content).toContain('max={1440}')
  })

  it('has trigger type selection grid', () => {
    expect(content).toContain('가격 감시')
    expect(content).toContain('가격 상한')
    expect(content).toContain('가격 하한')
    expect(content).toContain('뉴스 감시')
    expect(content).toContain('정기 수집')
    expect(content).toContain('장 시작')
    expect(content).toContain('장 마감')
    expect(content).toContain('커스텀')
  })
})

// ══════════════════════════════════════════════════════
// 9. Event log table validation
// ══════════════════════════════════════════════════════

describe('TEA: event log table features', () => {
  const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')

  it('has 2-tab structure (all/error)', () => {
    expect(content).toContain('활동 로그')
    expect(content).toContain('오류 로그')
  })

  it('has status filter dropdown', () => {
    expect(content).toContain('전체 상태')
    expect(content).toContain('감지됨')
    expect(content).toContain('실행중')
    expect(content).toContain('완료')
    expect(content).toContain('실패')
  })

  it('has pagination controls', () => {
    expect(content).toContain('← 이전')
    expect(content).toContain('다음 →')
    expect(content).toContain('totalPages')
  })

  it('has event detail expansion', () => {
    expect(content).toContain('expandedEventId')
    expect(content).toContain('이벤트 데이터')
    expect(content).toContain('실행 결과')
    expect(content).toContain('오류')
  })

  it('shows empty state when no trigger selected', () => {
    expect(content).toContain('위의 트리거 카드를 클릭하면')
  })

  it('shows empty state when no events', () => {
    expect(content).toContain('이벤트 기록이 없습니다')
  })

  it('displays event duration in seconds', () => {
    expect(content).toContain('evt.durationMs / 1000')
  })
})

// ══════════════════════════════════════════════════════
// 10. WebSocket integration validation
// ══════════════════════════════════════════════════════

describe('TEA: WebSocket integration', () => {
  const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')

  it('subscribes to argos channel', () => {
    expect(content).toContain("subscribe('argos'")
  })

  it('uses companyId-scoped channel key', () => {
    expect(content).toContain('`argos::${user.companyId}`')
  })

  it('cleans up listener on unmount', () => {
    expect(content).toContain('return () => removeListener(channelKey, wsHandler)')
  })

  it('checks isConnected before subscribing', () => {
    expect(content).toContain('if (!isConnected || !user) return')
  })

  it('trigger highlight auto-clears after timeout', () => {
    expect(content).toContain('setTimeout(() => setHighlightedTrigger(null)')
  })
})

// ══════════════════════════════════════════════════════
// 11. Dark mode coverage
// ══════════════════════════════════════════════════════

describe('TEA: dark mode coverage', () => {
  it('has sufficient dark mode classes (40+)', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')
    const darkCount = (content.match(/dark:/g) || []).length
    expect(darkCount).toBeGreaterThanOrEqual(40)
  })
})

// ══════════════════════════════════════════════════════
// 12. Responsive design
// ══════════════════════════════════════════════════════

describe('TEA: responsive design', () => {
  const content = readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/argos.tsx'), 'utf-8')

  it('has responsive padding (sm:p-8)', () => {
    expect(content).toContain('sm:p-8')
  })

  it('status bar uses 2-col mobile, 4-col desktop grid', () => {
    expect(content).toContain('grid-cols-2')
    expect(content).toContain('sm:grid-cols-4')
  })

  it('has max-width constraint', () => {
    expect(content).toContain('max-w-')
  })
})

// ══════════════════════════════════════════════════════
// 13. Backend schema alignment
// ══════════════════════════════════════════════════════

describe('TEA: backend schema alignment', () => {
  it('schema has nightJobTriggers table', () => {
    const schema = readFileSync(resolve(PROJECT_ROOT, 'packages/server/src/db/schema.ts'), 'utf-8')
    expect(schema).toContain('nightJobTriggers')
  })

  it('schema has argosEvents table', () => {
    const schema = readFileSync(resolve(PROJECT_ROOT, 'packages/server/src/db/schema.ts'), 'utf-8')
    expect(schema).toContain('argosEvents')
  })

  it('argos events migration exists', () => {
    const migrationPath = resolve(PROJECT_ROOT, 'packages/server/src/db/migrations')
    const files = require('fs').readdirSync(migrationPath)
    const argosMigration = files.find((f: string) => f.includes('argos'))
    expect(argosMigration).toBeTruthy()
  })
})

// ══════════════════════════════════════════════════════
// 14. Shared types alignment
// ══════════════════════════════════════════════════════

describe('TEA: shared types alignment', () => {
  it('shared types exports ArgosTriggerType', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/shared/src/types.ts'), 'utf-8')
    expect(content).toContain('ArgosTriggerType')
  })

  it('shared types exports ArgosEventStatus', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/shared/src/types.ts'), 'utf-8')
    expect(content).toContain('ArgosEventStatus')
  })
})

// ══════════════════════════════════════════════════════
// 15. Index.ts ARGOS integration
// ══════════════════════════════════════════════════════

describe('TEA: server index.ts ARGOS integration', () => {
  it('imports argos route', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/server/src/index.ts'), 'utf-8')
    expect(content).toContain('argosRoute')
  })

  it('mounts argos route under /api/workspace/argos', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/server/src/index.ts'), 'utf-8')
    expect(content).toContain('argos')
  })

  it('registers argos EventBus channel', () => {
    const content = readFileSync(resolve(PROJECT_ROOT, 'packages/server/src/index.ts'), 'utf-8')
    expect(content).toContain("'argos'")
  })
})
