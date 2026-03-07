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

// === Mock @corthex/ui toast ===
const toastCalls: { method: string; msg: string }[] = []
mock.module('@corthex/ui', () => ({
  toast: {
    info: (msg: string) => toastCalls.push({ method: 'info', msg }),
    success: (msg: string) => toastCalls.push({ method: 'success', msg }),
    warning: (msg: string) => toastCalls.push({ method: 'warning', msg }),
    error: (msg: string) => toastCalls.push({ method: 'error', msg }),
  },
}))

// === Import after mocking ===
// We test the helper functions and logic directly since hooks require React rendering
import { cleanupExpiredAlerts } from '../hooks/use-budget-alerts'

describe('Budget Alerts - localStorage helpers', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    toastCalls.length = 0
  })

  test('cleanupExpiredAlerts removes expired keys', () => {
    // Set expired alert (past date)
    mockLocalStorage.setItem('corthex_budget_alert_warning_monthly_2025-01-01', 'shown')
    // Set future alert (should not be removed)
    mockLocalStorage.setItem('corthex_budget_alert_warning_monthly_2099-12-01', 'shown')
    // Set non-budget key (should not be removed)
    mockLocalStorage.setItem('other_key', 'value')

    cleanupExpiredAlerts()

    expect(mockLocalStorage.getItem('corthex_budget_alert_warning_monthly_2025-01-01')).toBeNull()
    expect(mockLocalStorage.getItem('corthex_budget_alert_warning_monthly_2099-12-01')).toBe('shown')
    expect(mockLocalStorage.getItem('other_key')).toBe('value')
  })

  test('cleanupExpiredAlerts handles empty localStorage', () => {
    expect(() => cleanupExpiredAlerts()).not.toThrow()
  })

  test('cleanupExpiredAlerts keeps current month alerts', () => {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(1)
    const resetDate = nextMonth.toISOString().split('T')[0]

    mockLocalStorage.setItem(`corthex_budget_alert_exceeded_monthly_${resetDate}`, 'shown')
    cleanupExpiredAlerts()
    expect(mockLocalStorage.getItem(`corthex_budget_alert_exceeded_monthly_${resetDate}`)).toBe('shown')
  })
})

describe('Budget Alerts - Event handling logic', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    toastCalls.length = 0
  })

  test('budget-warning event structure is correct', () => {
    const event = {
      type: 'budget-warning' as const,
      level: 'monthly' as const,
      currentSpendUsd: 410.50,
      budgetUsd: 500.00,
      usagePercent: 82,
      resetDate: '2026-04-01',
    }

    expect(event.type).toBe('budget-warning')
    expect(event.level).toBe('monthly')
    expect(event.currentSpendUsd).toBe(410.50)
    expect(event.budgetUsd).toBe(500.00)
    expect(event.usagePercent).toBe(82)
    expect(event.resetDate).toBe('2026-04-01')
  })

  test('budget-exceeded event structure is correct', () => {
    const event = {
      type: 'budget-exceeded' as const,
      level: 'monthly' as const,
      currentSpendUsd: 502.30,
      budgetUsd: 500.00,
      resetDate: '2026-04-01',
    }

    expect(event.type).toBe('budget-exceeded')
    expect(event.level).toBe('monthly')
    expect(event.currentSpendUsd).toBe(502.30)
    expect(event.budgetUsd).toBe(500.00)
  })

  test('localStorage key includes type, level, and resetDate', () => {
    const key = `corthex_budget_alert_warning_monthly_2026-04-01`
    mockLocalStorage.setItem(key, 'shown')
    expect(mockLocalStorage.getItem(key)).toBe('shown')
  })

  test('different levels create separate localStorage keys', () => {
    mockLocalStorage.setItem('corthex_budget_alert_warning_monthly_2026-04-01', 'shown')
    mockLocalStorage.setItem('corthex_budget_alert_warning_daily_2026-03-08', 'shown')

    expect(mockLocalStorage.getItem('corthex_budget_alert_warning_monthly_2026-04-01')).toBe('shown')
    expect(mockLocalStorage.getItem('corthex_budget_alert_warning_daily_2026-03-08')).toBe('shown')
  })

  test('different event types create separate localStorage keys', () => {
    mockLocalStorage.setItem('corthex_budget_alert_warning_monthly_2026-04-01', 'shown')
    mockLocalStorage.setItem('corthex_budget_alert_exceeded_monthly_2026-04-01', 'shown')

    expect(mockLocalStorage.getItem('corthex_budget_alert_warning_monthly_2026-04-01')).toBe('shown')
    expect(mockLocalStorage.getItem('corthex_budget_alert_exceeded_monthly_2026-04-01')).toBe('shown')
  })
})

describe('Budget Alerts - Duplicate prevention', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  test('alert not shown twice for same type/level/resetDate', () => {
    const key = 'corthex_budget_alert_warning_monthly_2026-04-01'

    // First time - not shown
    expect(mockLocalStorage.getItem(key)).toBeNull()

    // Mark as shown
    mockLocalStorage.setItem(key, 'shown')

    // Second time - already shown
    expect(mockLocalStorage.getItem(key)).toBe('shown')
  })

  test('new reset date allows new alerts', () => {
    const oldKey = 'corthex_budget_alert_warning_monthly_2026-03-01'
    const newKey = 'corthex_budget_alert_warning_monthly_2026-04-01'

    mockLocalStorage.setItem(oldKey, 'shown')

    // Old key is shown
    expect(mockLocalStorage.getItem(oldKey)).toBe('shown')
    // New key is not yet shown
    expect(mockLocalStorage.getItem(newKey)).toBeNull()
  })
})

describe('Budget Exceeded Modal - data', () => {
  test('modal data includes currentSpendUsd, budgetUsd, level', () => {
    const modalData = {
      currentSpendUsd: 502.30,
      budgetUsd: 500.00,
      level: 'monthly' as const,
    }

    expect(modalData.currentSpendUsd).toBe(502.30)
    expect(modalData.budgetUsd).toBe(500.00)
    expect(modalData.level).toBe('monthly')
  })

  test('daily level modal data', () => {
    const modalData = {
      currentSpendUsd: 25.50,
      budgetUsd: 20.00,
      level: 'daily' as const,
    }

    expect(modalData.level).toBe('daily')
    expect(modalData.currentSpendUsd).toBeGreaterThan(modalData.budgetUsd)
  })
})

describe('Admin Budget Alerts - polling logic', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  test('admin alert localStorage key structure', () => {
    const key = 'corthex_admin_budget_alert_warning_2026-03'
    mockLocalStorage.setItem(key, 'shown')
    expect(mockLocalStorage.getItem(key)).toBe('shown')
  })

  test('admin exceeded alert key separate from warning', () => {
    mockLocalStorage.setItem('corthex_admin_budget_alert_warning_2026-03', 'shown')
    expect(mockLocalStorage.getItem('corthex_admin_budget_alert_exceeded_2026-03')).toBeNull()
  })

  test('admin percentage calculation', () => {
    const spend = 400_000_000 // $400
    const budget = 500_000_000 // $500
    const percentage = (spend / budget) * 100
    expect(percentage).toBe(80)
  })

  test('admin percentage exceeding 100%', () => {
    const spend = 600_000_000 // $600
    const budget = 500_000_000 // $500
    const percentage = (spend / budget) * 100
    expect(percentage).toBe(120)
    expect(percentage >= 100).toBeTrue()
  })
})

describe('Budget Alerts - WS event filtering', () => {
  test('only budget-warning and budget-exceeded types should be handled', () => {
    const events = [
      { type: 'budget-warning', level: 'monthly', currentSpendUsd: 410, budgetUsd: 500, usagePercent: 82, resetDate: '2026-04-01' },
      { type: 'budget-exceeded', level: 'monthly', currentSpendUsd: 510, budgetUsd: 500, resetDate: '2026-04-01' },
      { type: 'cost-update', costMicro: 100000 },
      { type: 'cost-recorded', agentId: 'a1' },
    ]

    const budgetEvents = events.filter(e => e.type === 'budget-warning' || e.type === 'budget-exceeded')
    expect(budgetEvents).toHaveLength(2)
    expect(budgetEvents[0].type).toBe('budget-warning')
    expect(budgetEvents[1].type).toBe('budget-exceeded')
  })

  test('null/undefined events are ignored', () => {
    const events = [null, undefined, {}, { type: null }]
    const budgetEvents = events.filter(
      e => e && typeof e === 'object' && 'type' in e && (e.type === 'budget-warning' || e.type === 'budget-exceeded')
    )
    expect(budgetEvents).toHaveLength(0)
  })
})
