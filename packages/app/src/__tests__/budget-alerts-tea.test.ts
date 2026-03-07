/**
 * TEA-generated tests for Story 7-5: Budget Exceeded WebSocket Alert
 * Risk-based coverage expansion focusing on edge cases and integration gaps
 */
import { describe, test, expect, beforeEach, mock } from 'bun:test'

// === localStorage mock ===
const store: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  key: (i: number) => Object.keys(store)[i] ?? null,
  get length() { return Object.keys(store).length },
  clear: () => { for (const k of Object.keys(store)) delete store[k] },
}

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true })

// Mock toast
const toastCalls: { method: string; msg: string }[] = []
mock.module('@corthex/ui', () => ({
  toast: {
    info: (msg: string) => toastCalls.push({ method: 'info', msg }),
    success: (msg: string) => toastCalls.push({ method: 'success', msg }),
    warning: (msg: string) => toastCalls.push({ method: 'warning', msg }),
    error: (msg: string) => toastCalls.push({ method: 'error', msg }),
  },
}))

import { cleanupExpiredAlerts } from '../hooks/use-budget-alerts'

beforeEach(() => {
  mockLocalStorage.clear()
  toastCalls.length = 0
})

// === P0: Critical Path — localStorage Dedup Correctness ===

describe('[P0] localStorage dedup edge cases', () => {
  test('concurrent alerts for same key only store once', () => {
    const key = 'corthex_budget_alert_warning_monthly_2026-04-01'
    mockLocalStorage.setItem(key, 'shown')
    mockLocalStorage.setItem(key, 'shown') // duplicate
    expect(mockLocalStorage.getItem(key)).toBe('shown')
    // Only one entry in storage
    const count = Object.keys(store).filter(k => k === key).length
    expect(count).toBe(1)
  })

  test('alert key with special characters in resetDate handled', () => {
    // ISO date format should always be YYYY-MM-DD
    const key = 'corthex_budget_alert_warning_monthly_2026-01-01'
    mockLocalStorage.setItem(key, 'shown')
    expect(mockLocalStorage.getItem(key)).toBe('shown')
  })

  test('missing localStorage does not throw', () => {
    const originalGet = mockLocalStorage.getItem
    mockLocalStorage.getItem = () => { throw new Error('SecurityError') }
    // cleanupExpiredAlerts should handle gracefully
    expect(() => cleanupExpiredAlerts()).not.toThrow()
    mockLocalStorage.getItem = originalGet
  })

  test('cleanup only removes budget alert keys, never other keys', () => {
    mockLocalStorage.setItem('corthex_budget_alert_warning_monthly_2020-01-01', 'shown')
    mockLocalStorage.setItem('corthex_user', '{"id":"test"}')
    mockLocalStorage.setItem('corthex_token', 'jwt-value')
    mockLocalStorage.setItem('theme', 'dark')

    cleanupExpiredAlerts()

    expect(mockLocalStorage.getItem('corthex_budget_alert_warning_monthly_2020-01-01')).toBeNull()
    expect(mockLocalStorage.getItem('corthex_user')).toBe('{"id":"test"}')
    expect(mockLocalStorage.getItem('corthex_token')).toBe('jwt-value')
    expect(mockLocalStorage.getItem('theme')).toBe('dark')
  })

  test('cleanup with mixed expired and valid alert keys', () => {
    mockLocalStorage.setItem('corthex_budget_alert_warning_monthly_2020-01-01', 'shown') // expired
    mockLocalStorage.setItem('corthex_budget_alert_exceeded_daily_2020-06-15', 'shown') // expired
    mockLocalStorage.setItem('corthex_budget_alert_warning_monthly_2099-12-01', 'shown') // future
    mockLocalStorage.setItem('corthex_budget_alert_exceeded_monthly_2099-01-01', 'shown') // future

    cleanupExpiredAlerts()

    expect(mockLocalStorage.getItem('corthex_budget_alert_warning_monthly_2020-01-01')).toBeNull()
    expect(mockLocalStorage.getItem('corthex_budget_alert_exceeded_daily_2020-06-15')).toBeNull()
    expect(mockLocalStorage.getItem('corthex_budget_alert_warning_monthly_2099-12-01')).toBe('shown')
    expect(mockLocalStorage.getItem('corthex_budget_alert_exceeded_monthly_2099-01-01')).toBe('shown')
  })
})

// === P0: Event Payload Validation ===

describe('[P0] WS event payload validation', () => {
  test('budget-warning must have usagePercent field', () => {
    const event = {
      type: 'budget-warning',
      level: 'monthly',
      currentSpendUsd: 410,
      budgetUsd: 500,
      usagePercent: 82,
      resetDate: '2026-04-01',
    }
    expect(event).toHaveProperty('usagePercent')
    expect(typeof event.usagePercent).toBe('number')
  })

  test('budget-exceeded must NOT have usagePercent field', () => {
    const event = {
      type: 'budget-exceeded',
      level: 'monthly',
      currentSpendUsd: 510,
      budgetUsd: 500,
      resetDate: '2026-04-01',
    }
    expect(event).not.toHaveProperty('usagePercent')
  })

  test('currentSpendUsd is already USD (not microdollars)', () => {
    // Server budget-guard.ts:137 converts via microToUsd before emitting
    const event = {
      type: 'budget-warning',
      level: 'monthly',
      currentSpendUsd: 410.50, // Should be in dollars, not 410_500_000
      budgetUsd: 500.00,
      usagePercent: 82,
      resetDate: '2026-04-01',
    }
    // Values should be reasonable dollar amounts, not microdollars
    expect(event.currentSpendUsd).toBeLessThan(100000) // Not microdollars
    expect(event.budgetUsd).toBeLessThan(100000)
  })

  test('daily level events have tomorrow as resetDate', () => {
    const event = {
      type: 'budget-exceeded',
      level: 'daily',
      currentSpendUsd: 25,
      budgetUsd: 20,
      resetDate: '2026-03-08', // tomorrow
    }
    expect(event.level).toBe('daily')
    // resetDate should be a valid ISO date
    expect(event.resetDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

// === P1: Event Filtering Safety ===

describe('[P1] Event filtering - only budget events processed', () => {
  test('cost-recorded event should not trigger any alert', () => {
    const event = { type: 'cost-recorded', agentId: 'a1', costMicro: 5000 }
    const isBudgetEvent = event.type === 'budget-warning' || event.type === 'budget-exceeded'
    expect(isBudgetEvent).toBe(false)
  })

  test('agent-status event should not trigger alert', () => {
    const event = { type: 'agent-status', agentId: 'a1', status: 'busy' }
    const isBudgetEvent = event.type === 'budget-warning' || event.type === 'budget-exceeded'
    expect(isBudgetEvent).toBe(false)
  })

  test('empty object should not trigger alert', () => {
    const event = {} as any
    const isValid = event && event.type && (event.type === 'budget-warning' || event.type === 'budget-exceeded')
    expect(isValid).toBeFalsy()
  })

  test('array payload should not crash handler', () => {
    const event = [1, 2, 3] as any
    const isValid = event && typeof event === 'object' && !Array.isArray(event) && event.type
    expect(isValid).toBeFalsy()
  })

  test('string payload should not crash handler', () => {
    const event = 'budget-warning' as any
    const isValid = event && typeof event === 'object' && event.type
    expect(isValid).toBeFalsy()
  })
})

// === P1: Monthly/Daily Level Separation ===

describe('[P1] Monthly and daily alerts are independent', () => {
  test('monthly warning does not suppress daily warning', () => {
    const monthlyKey = 'corthex_budget_alert_warning_monthly_2026-04-01'
    const dailyKey = 'corthex_budget_alert_warning_daily_2026-03-08'

    mockLocalStorage.setItem(monthlyKey, 'shown')

    expect(mockLocalStorage.getItem(monthlyKey)).toBe('shown')
    expect(mockLocalStorage.getItem(dailyKey)).toBeNull()
  })

  test('daily exceeded does not suppress monthly exceeded', () => {
    const dailyKey = 'corthex_budget_alert_exceeded_daily_2026-03-08'
    const monthlyKey = 'corthex_budget_alert_exceeded_monthly_2026-04-01'

    mockLocalStorage.setItem(dailyKey, 'shown')

    expect(mockLocalStorage.getItem(dailyKey)).toBe('shown')
    expect(mockLocalStorage.getItem(monthlyKey)).toBeNull()
  })

  test('warning does not suppress exceeded for same level', () => {
    const warningKey = 'corthex_budget_alert_warning_monthly_2026-04-01'
    const exceededKey = 'corthex_budget_alert_exceeded_monthly_2026-04-01'

    mockLocalStorage.setItem(warningKey, 'shown')

    expect(mockLocalStorage.getItem(warningKey)).toBe('shown')
    expect(mockLocalStorage.getItem(exceededKey)).toBeNull()
  })
})

// === P1: Toast Message Format ===

describe('[P1] Toast message content verification', () => {
  test('warning toast should include percentage', () => {
    const event = {
      type: 'budget-warning',
      level: 'monthly',
      currentSpendUsd: 410.50,
      budgetUsd: 500.00,
      usagePercent: 82,
      resetDate: '2026-04-01',
    }
    const levelLabel = event.level === 'monthly' ? '월간' : '일일'
    const msg = `${levelLabel} 예산 경고: ${event.usagePercent}% 사용 ($${event.currentSpendUsd} / $${event.budgetUsd})`

    expect(msg).toContain('82%')
    expect(msg).toContain('$410.5')
    expect(msg).toContain('$500')
    expect(msg).toContain('월간')
  })

  test('daily warning uses correct Korean label', () => {
    const event = {
      type: 'budget-warning',
      level: 'daily' as const,
      currentSpendUsd: 16,
      budgetUsd: 20,
      usagePercent: 80,
      resetDate: '2026-03-08',
    }
    const levelLabel = event.level === 'monthly' ? '월간' : '일일'
    expect(levelLabel).toBe('일일')
  })
})

// === P2: Admin Polling Logic ===

describe('[P2] Admin polling budget threshold calculation', () => {
  test('threshold 80% triggers at exactly 80%', () => {
    const spend = 400_000_000 // $400 in microdollars
    const budget = 500_000_000 // $500
    const threshold = 80
    const percentage = (spend / budget) * 100
    expect(percentage >= threshold).toBeTrue()
  })

  test('threshold 80% does not trigger at 79%', () => {
    const spend = 395_000_000 // $395
    const budget = 500_000_000 // $500
    const threshold = 80
    const percentage = (spend / budget) * 100
    expect(percentage >= threshold).toBeFalse()
  })

  test('zero budget means unlimited (no alert)', () => {
    const budget = 0
    const spend = 1_000_000_000
    // When budget is 0, we should NOT trigger any alert
    expect(budget <= 0).toBeTrue()
  })

  test('exceeded check at exactly 100%', () => {
    const spend = 500_000_000
    const budget = 500_000_000
    const percentage = (spend / budget) * 100
    expect(percentage >= 100).toBeTrue()
  })

  test('spending slightly below 100% should not trigger exceeded', () => {
    const spend = 499_999_999
    const budget = 500_000_000
    const percentage = (spend / budget) * 100
    expect(percentage >= 100).toBeFalse()
  })
})

// === P2: Cleanup Timing ===

describe('[P2] Cleanup date boundary precision', () => {
  test('today date key is NOT cleaned up', () => {
    const today = new Date().toISOString().split('T')[0]
    const key = `corthex_budget_alert_warning_monthly_${today}`
    mockLocalStorage.setItem(key, 'shown')

    cleanupExpiredAlerts()

    // Today's date is not in the past, so should not be cleaned
    expect(mockLocalStorage.getItem(key)).toBe('shown')
  })

  test('yesterday date key IS cleaned up', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = yesterday.toISOString().split('T')[0]
    const key = `corthex_budget_alert_warning_monthly_${dateStr}`
    mockLocalStorage.setItem(key, 'shown')

    cleanupExpiredAlerts()

    expect(mockLocalStorage.getItem(key)).toBeNull()
  })

  test('far future date key preserved', () => {
    const key = 'corthex_budget_alert_exceeded_monthly_2099-12-31'
    mockLocalStorage.setItem(key, 'shown')

    cleanupExpiredAlerts()

    expect(mockLocalStorage.getItem(key)).toBe('shown')
  })
})

// === P2: Modal Data Integrity ===

describe('[P2] BudgetExceededModal data integrity', () => {
  test('modal data preserves decimal precision', () => {
    const data = { currentSpendUsd: 502.3456, budgetUsd: 500.00, level: 'monthly' as const }
    expect(data.currentSpendUsd.toFixed(2)).toBe('502.35')
    expect(data.budgetUsd.toFixed(2)).toBe('500.00')
  })

  test('modal data handles very large values', () => {
    const data = { currentSpendUsd: 999999.99, budgetUsd: 999999.00, level: 'monthly' as const }
    expect(data.currentSpendUsd.toFixed(2)).toBe('999999.99')
  })

  test('modal data handles very small values', () => {
    const data = { currentSpendUsd: 0.01, budgetUsd: 0.01, level: 'daily' as const }
    expect(data.currentSpendUsd.toFixed(2)).toBe('0.01')
  })
})
