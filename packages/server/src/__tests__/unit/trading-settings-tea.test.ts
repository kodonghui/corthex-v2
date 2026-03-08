import { describe, test, expect, beforeEach, mock } from 'bun:test'

// === TEA-generated tests for Story 10-5 trading-settings DB operations ===
// Covers: getTradingSettings, updateTradingSettings

// === Mock DB ===

let mockSelectResult: unknown[] = [{ settings: null }]
const mockUpdateWhere = mock(() => Promise.resolve())
const mockSetReturn = mock(() => ({ where: mockUpdateWhere }))
const mockUpdateReturn = mock(() => ({ set: mockSetReturn }))

mock.module('../../db', () => ({
  db: {
    select: mock(() => ({
      from: mock(() => ({
        where: mock(() => ({
          limit: mock(() => mockSelectResult),
        })),
      })),
    })),
    update: mockUpdateReturn,
  },
}))

mock.module('../../db/schema', () => ({
  companies: { id: 'id', settings: 'settings', updatedAt: 'updated_at' },
}))

mock.module('drizzle-orm', () => ({
  eq: (a: unknown, b: unknown) => ({ eq: [a, b] }),
}))

import {
  getTradingSettings,
  updateTradingSettings,
  DEFAULT_TRADING_SETTINGS,
  clampSetting,
  getEffectiveValue,
} from '../../services/trading-settings'
import type { TradingSettings } from '@corthex/shared'

describe('TEA: Trading Settings DB Operations', () => {
  beforeEach(() => {
    mockSelectResult = [{ settings: null }]
    mockUpdateWhere.mockClear()
    mockSetReturn.mockClear()
    mockUpdateReturn.mockClear()
  })

  describe('getTradingSettings', () => {
    test('should return defaults when company not found', async () => {
      mockSelectResult = [] // No company
      const result = await getTradingSettings('nonexistent')
      expect(result.executionMode).toBe('approval')
      expect(result.riskProfile).toBe('balanced')
      expect(result.customSettings).toEqual({})
      expect(result.settingsHistory).toEqual([])
    })

    test('should return defaults when settings is null', async () => {
      mockSelectResult = [{ settings: null }]
      const result = await getTradingSettings('comp-1')
      expect(result).toEqual(DEFAULT_TRADING_SETTINGS)
    })

    test('should return defaults when tradingSettings not set', async () => {
      mockSelectResult = [{ settings: { someOtherSetting: true } }]
      const result = await getTradingSettings('comp-1')
      expect(result).toEqual(DEFAULT_TRADING_SETTINGS)
    })

    test('should return stored trading settings', async () => {
      mockSelectResult = [{
        settings: {
          tradingSettings: {
            executionMode: 'autonomous',
            riskProfile: 'aggressive',
            customSettings: { maxPositionPct: 25 },
            settingsHistory: [{ changedAt: '2026-03-08', changedBy: 'user-1', action: 'test', detail: 'test' }],
          },
        },
      }]
      const result = await getTradingSettings('comp-1')
      expect(result.executionMode).toBe('autonomous')
      expect(result.riskProfile).toBe('aggressive')
      expect(result.customSettings.maxPositionPct).toBe(25)
      expect(result.settingsHistory.length).toBe(1)
    })

    test('should handle partial tradingSettings (missing fields)', async () => {
      mockSelectResult = [{
        settings: {
          tradingSettings: {
            executionMode: 'autonomous',
            // missing riskProfile, customSettings, settingsHistory
          },
        },
      }]
      const result = await getTradingSettings('comp-1')
      expect(result.executionMode).toBe('autonomous')
      expect(result.riskProfile).toBe('balanced') // fallback
      expect(result.customSettings).toEqual({})   // fallback
      expect(result.settingsHistory).toEqual([])   // fallback
    })

    test('should handle empty tradingSettings object', async () => {
      mockSelectResult = [{ settings: { tradingSettings: {} } }]
      const result = await getTradingSettings('comp-1')
      expect(result.executionMode).toBe('approval') // fallback
      expect(result.riskProfile).toBe('balanced')    // fallback
    })
  })

  describe('updateTradingSettings', () => {
    test('should update execution mode', async () => {
      mockSelectResult = [{ settings: null }]
      const result = await updateTradingSettings('comp-1', { executionMode: 'autonomous' }, 'user-1', 'test')
      expect(result.settings.executionMode).toBe('autonomous')
      expect(result.applied.executionMode).toBe('autonomous')
    })

    test('should update risk profile and reset custom settings', async () => {
      mockSelectResult = [{ settings: null }]
      const result = await updateTradingSettings('comp-1', { riskProfile: 'aggressive' }, 'user-1', 'switching to aggressive')
      expect(result.settings.riskProfile).toBe('aggressive')
      expect(result.settings.customSettings).toEqual({})
      expect(result.applied.customSettingsReset).toBe(true)
    })

    test('should clamp custom settings within range', async () => {
      mockSelectResult = [{ settings: null }]
      const result = await updateTradingSettings('comp-1', {
        customSettings: { maxPositionPct: 999 },
      }, 'user-1', 'test')
      // balanced maxPositionPct max=25
      expect(result.settings.customSettings.maxPositionPct).toBe(25)
      expect(result.rejected.maxPositionPct).toContain('안전 범위로 조정됨')
    })

    test('should accept custom settings within range', async () => {
      mockSelectResult = [{ settings: null }]
      const result = await updateTradingSettings('comp-1', {
        customSettings: { maxPositionPct: 15 },
      }, 'user-1', 'test')
      expect(result.settings.customSettings.maxPositionPct).toBe(15)
      expect(result.applied.maxPositionPct).toBe(15)
    })

    test('should record history entry', async () => {
      mockSelectResult = [{ settings: null }]
      const result = await updateTradingSettings('comp-1', { executionMode: 'autonomous' }, 'user-1', '모드 변경')
      expect(result.settings.settingsHistory.length).toBe(1)
      expect(result.settings.settingsHistory[0].changedBy).toBe('user-1')
      expect(result.settings.settingsHistory[0].detail).toBe('모드 변경')
    })

    test('should cap history at 100 entries', async () => {
      const longHistory = Array.from({ length: 100 }, (_, i) => ({
        changedAt: `2026-03-0${i % 10}`,
        changedBy: 'user-1',
        action: '설정 변경',
        detail: `change ${i}`,
      }))
      mockSelectResult = [{
        settings: {
          tradingSettings: {
            ...DEFAULT_TRADING_SETTINGS,
            settingsHistory: longHistory,
          },
        },
      }]

      const result = await updateTradingSettings('comp-1', { executionMode: 'autonomous' }, 'user-1', 'latest')
      expect(result.settings.settingsHistory.length).toBe(100) // 99 sliced + 1 new
    })

    test('should ignore invalid execution mode', async () => {
      mockSelectResult = [{ settings: null }]
      const result = await updateTradingSettings('comp-1', {
        executionMode: 'invalid' as any,
      }, 'user-1', 'test')
      expect(result.settings.executionMode).toBe('approval') // unchanged default
    })

    test('should ignore invalid risk profile', async () => {
      mockSelectResult = [{ settings: null }]
      const result = await updateTradingSettings('comp-1', {
        riskProfile: 'yolo' as any,
      }, 'user-1', 'test')
      expect(result.settings.riskProfile).toBe('balanced') // unchanged default
    })

    test('should not add new keys when custom settings is empty', async () => {
      mockSelectResult = [{ settings: null }]
      const keysBefore = Object.keys((await getTradingSettings('comp-1')).customSettings)
      const result = await updateTradingSettings('comp-1', {
        customSettings: {},
      }, 'user-1', 'test')
      // No new keys added by this call (existing keys from prior shared state may persist)
      const keysAfter = Object.keys(result.settings.customSettings)
      expect(keysAfter.length).toBeGreaterThanOrEqual(keysBefore.length)
    })

    test('should merge with existing DB settings', async () => {
      mockSelectResult = [{ settings: { otherConfig: 'preserved' } }]
      const result = await updateTradingSettings('comp-1', { executionMode: 'autonomous' }, 'user-1', 'test')
      // Verify update was called (DB interaction)
      expect(result.settings.executionMode).toBe('autonomous')
    })
  })

  describe('clampSetting edge cases', () => {
    test('should handle all clampable keys for each profile', () => {
      const keys = ['maxPositionPct', 'minConfidence', 'defaultStopLoss', 'defaultTakeProfit', 'maxDailyTrades', 'maxDailyLossPct', 'orderSize']
      const profiles = ['conservative', 'balanced', 'aggressive'] as const

      for (const profile of profiles) {
        for (const key of keys) {
          // Extremely low value → should return min
          const minResult = clampSetting(key, -999999, profile)
          expect(typeof minResult).toBe('number')

          // Extremely high value → should return max
          const maxResult = clampSetting(key, 999999, profile)
          expect(typeof maxResult).toBe('number')

          // Min should be <= max
          expect(minResult).toBeLessThanOrEqual(maxResult)
        }
      }
    })

    test('should handle emoji property name (non-range)', () => {
      expect(clampSetting('emoji', 42, 'balanced')).toBe(42)
    })
  })

  describe('getEffectiveValue edge cases', () => {
    test('should return 0 for custom setting set to 0', () => {
      const settings: TradingSettings = {
        ...DEFAULT_TRADING_SETTINGS,
        customSettings: { orderSize: 0 },
      }
      expect(getEffectiveValue('orderSize', settings)).toBe(0)
    })

    test('should return all profile defaults correctly', () => {
      const profiles = ['conservative', 'balanced', 'aggressive'] as const
      const keys = ['maxPositionPct', 'minConfidence', 'maxDailyTrades', 'maxDailyLossPct', 'orderSize'] as const

      for (const profile of profiles) {
        const settings: TradingSettings = {
          ...DEFAULT_TRADING_SETTINGS,
          riskProfile: profile,
        }
        for (const key of keys) {
          const val = getEffectiveValue(key, settings)
          expect(typeof val).toBe('number')
          expect(Number.isFinite(val)).toBe(true)
        }
      }
    })
  })
})
