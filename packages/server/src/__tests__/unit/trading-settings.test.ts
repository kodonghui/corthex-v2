import { describe, test, expect, beforeEach, mock } from 'bun:test'

// Mock DB
const mockSelect = mock(() => ({ from: mock(() => ({ where: mock(() => ({ limit: mock(() => [{ settings: null }]) })) })) }))
const mockUpdate = mock(() => ({ set: mock(() => ({ where: mock(() => Promise.resolve()) })) }))

mock.module('../../db', () => ({
  db: {
    select: mockSelect,
    update: mockUpdate,
  },
}))

mock.module('../../db/schema', () => ({
  companies: { id: 'id', settings: 'settings', updatedAt: 'updated_at' },
}))

mock.module('drizzle-orm', () => ({
  eq: (a: unknown, b: unknown) => ({ eq: [a, b] }),
}))

import {
  RISK_PROFILES,
  DEFAULT_TRADING_SETTINGS,
  clampSetting,
  getEffectiveValue,
} from '../../services/trading-settings'
import type { TradingSettings } from '@corthex/shared'

describe('Trading Settings Service', () => {
  describe('RISK_PROFILES', () => {
    test('should have 3 profiles: conservative, balanced, aggressive', () => {
      expect(Object.keys(RISK_PROFILES)).toEqual(['aggressive', 'balanced', 'conservative'])
    })

    test('conservative profile should have strictest limits', () => {
      const c = RISK_PROFILES.conservative
      expect(c.label).toBe('보수적')
      expect(c.emoji).toBe('🐢')
      expect(c.maxPositionPct.default).toBe(10)
      expect(c.minConfidence.default).toBe(75)
      expect(c.maxDailyTrades.default).toBe(5)
      expect(c.maxDailyLossPct.default).toBe(1)
    })

    test('balanced profile should have moderate limits', () => {
      const b = RISK_PROFILES.balanced
      expect(b.label).toBe('균형')
      expect(b.emoji).toBe('⚖️')
      expect(b.maxPositionPct.default).toBe(20)
      expect(b.minConfidence.default).toBe(65)
      expect(b.maxDailyTrades.default).toBe(10)
      expect(b.maxDailyLossPct.default).toBe(3)
    })

    test('aggressive profile should have loosest limits', () => {
      const a = RISK_PROFILES.aggressive
      expect(a.label).toBe('공격적')
      expect(a.emoji).toBe('🔥')
      expect(a.maxPositionPct.default).toBe(30)
      expect(a.minConfidence.default).toBe(55)
      expect(a.maxDailyTrades.default).toBe(15)
      expect(a.maxDailyLossPct.default).toBe(5)
    })

    test('each profile should have all required fields', () => {
      const requiredFields = [
        'label', 'emoji', 'cashReserve', 'maxPositionPct', 'minConfidence',
        'defaultStopLoss', 'defaultTakeProfit', 'maxDailyTrades', 'maxDailyLossPct', 'orderSize',
      ]
      for (const [name, profile] of Object.entries(RISK_PROFILES)) {
        for (const field of requiredFields) {
          expect(profile).toHaveProperty(field)
        }
      }
    })

    test('each range should have min <= default <= max', () => {
      for (const [name, profile] of Object.entries(RISK_PROFILES)) {
        for (const [key, value] of Object.entries(profile)) {
          if (typeof value === 'object' && 'min' in value) {
            // stopLoss has negative values, so min > max in absolute terms
            if (key === 'defaultStopLoss') {
              expect(value.min).toBeLessThanOrEqual(value.default)
              expect(value.default).toBeLessThanOrEqual(value.max)
            } else {
              expect(value.min).toBeLessThanOrEqual(value.default)
              expect(value.default).toBeLessThanOrEqual(value.max)
            }
          }
        }
      }
    })
  })

  describe('DEFAULT_TRADING_SETTINGS', () => {
    test('should default to approval mode', () => {
      expect(DEFAULT_TRADING_SETTINGS.executionMode).toBe('approval')
    })

    test('should default to balanced profile', () => {
      expect(DEFAULT_TRADING_SETTINGS.riskProfile).toBe('balanced')
    })

    test('should have empty custom settings', () => {
      expect(DEFAULT_TRADING_SETTINGS.customSettings).toEqual({})
    })

    test('should have empty settings history', () => {
      expect(DEFAULT_TRADING_SETTINGS.settingsHistory).toEqual([])
    })
  })

  describe('clampSetting', () => {
    test('should clamp value within conservative range', () => {
      expect(clampSetting('maxPositionPct', 50, 'conservative')).toBe(15) // max=15
      expect(clampSetting('maxPositionPct', 3, 'conservative')).toBe(5)  // min=5
      expect(clampSetting('maxPositionPct', 10, 'conservative')).toBe(10) // within range
    })

    test('should clamp value within balanced range', () => {
      expect(clampSetting('maxDailyTrades', 100, 'balanced')).toBe(15) // max=15
      expect(clampSetting('maxDailyTrades', 1, 'balanced')).toBe(3)    // min=3
      expect(clampSetting('maxDailyTrades', 10, 'balanced')).toBe(10)  // within range
    })

    test('should clamp value within aggressive range', () => {
      expect(clampSetting('minConfidence', 100, 'aggressive')).toBe(75) // max=75
      expect(clampSetting('minConfidence', 10, 'aggressive')).toBe(50)  // min=50
      expect(clampSetting('minConfidence', 60, 'aggressive')).toBe(60)  // within range
    })

    test('should handle stop loss (negative values)', () => {
      expect(clampSetting('defaultStopLoss', -20, 'balanced')).toBe(-8) // min=-8
      expect(clampSetting('defaultStopLoss', 0, 'balanced')).toBe(-2)   // max=-2
      expect(clampSetting('defaultStopLoss', -5, 'balanced')).toBe(-5)  // within range
    })

    test('should handle orderSize limits', () => {
      expect(clampSetting('orderSize', 20_000_000, 'conservative')).toBe(2_000_000)
      expect(clampSetting('orderSize', 500_000, 'conservative')).toBe(500_000)
      expect(clampSetting('orderSize', -100, 'conservative')).toBe(0)
    })

    test('should return value unchanged for unknown key', () => {
      expect(clampSetting('unknownKey', 999, 'balanced')).toBe(999)
    })

    test('should return value for string type property', () => {
      expect(clampSetting('label', 42, 'balanced')).toBe(42)
    })
  })

  describe('getEffectiveValue', () => {
    test('should return custom value if set', () => {
      const settings: TradingSettings = {
        ...DEFAULT_TRADING_SETTINGS,
        customSettings: { maxPositionPct: 15 },
      }
      expect(getEffectiveValue('maxPositionPct', settings)).toBe(15)
    })

    test('should return profile default if no custom value', () => {
      const settings: TradingSettings = {
        ...DEFAULT_TRADING_SETTINGS,
        riskProfile: 'conservative',
      }
      expect(getEffectiveValue('maxPositionPct', settings)).toBe(10) // conservative default
    })

    test('should return aggressive defaults', () => {
      const settings: TradingSettings = {
        ...DEFAULT_TRADING_SETTINGS,
        riskProfile: 'aggressive',
      }
      expect(getEffectiveValue('minConfidence', settings)).toBe(55)
      expect(getEffectiveValue('maxDailyTrades', settings)).toBe(15)
    })

    test('should prioritize custom over profile default', () => {
      const settings: TradingSettings = {
        ...DEFAULT_TRADING_SETTINGS,
        riskProfile: 'conservative',
        customSettings: { maxDailyTrades: 3 },
      }
      expect(getEffectiveValue('maxDailyTrades', settings)).toBe(3) // custom, not default 5
    })
  })
})
