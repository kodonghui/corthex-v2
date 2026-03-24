import { describe, test, expect } from 'bun:test'

// Story 24.7: AR74 cost-aware model routing tests

import { selectModelWithCostPreference, REFLECTION_MODEL } from '../../engine/model-selector'
import type { CostPreference } from '../../engine/model-selector'

describe('Story 24.7: AR74 Cost-Aware Model Routing', () => {
  describe('REFLECTION_MODEL constant', () => {
    test('hardcoded to Haiku (cheapest model)', () => {
      expect(REFLECTION_MODEL).toBe('claude-haiku-4-5-20251001')
    })

    test('is a non-empty string', () => {
      expect(typeof REFLECTION_MODEL).toBe('string')
      expect(REFLECTION_MODEL.length).toBeGreaterThan(0)
    })
  })

  describe('selectModelWithCostPreference', () => {
    test('quality preference: manager (tier 1) → Sonnet', () => {
      expect(selectModelWithCostPreference(1, 'quality')).toBe('claude-sonnet-4-6')
    })

    test('quality preference: specialist (tier 2) → Sonnet', () => {
      expect(selectModelWithCostPreference(2, 'quality')).toBe('claude-sonnet-4-6')
    })

    test('quality preference: worker (tier 3) → Haiku', () => {
      expect(selectModelWithCostPreference(3, 'quality')).toBe('claude-haiku-4-5')
    })

    test('cost preference: manager (tier 1) → Sonnet (still needs reasoning)', () => {
      expect(selectModelWithCostPreference(1, 'cost')).toBe('claude-sonnet-4-6')
    })

    test('cost preference: specialist (tier 2) → Haiku (downgraded for savings)', () => {
      expect(selectModelWithCostPreference(2, 'cost')).toBe('claude-haiku-4-5')
    })

    test('cost preference: worker (tier 3) → Haiku', () => {
      expect(selectModelWithCostPreference(3, 'cost')).toBe('claude-haiku-4-5')
    })

    test('balanced preference: same as quality', () => {
      expect(selectModelWithCostPreference(1, 'balanced')).toBe('claude-sonnet-4-6')
      expect(selectModelWithCostPreference(2, 'balanced')).toBe('claude-sonnet-4-6')
      expect(selectModelWithCostPreference(3, 'balanced')).toBe('claude-haiku-4-5')
    })

    test('unknown tier level → default Haiku', () => {
      expect(selectModelWithCostPreference(99, 'quality')).toBe('claude-haiku-4-5')
      expect(selectModelWithCostPreference(99, 'cost')).toBe('claude-haiku-4-5')
    })

    test('all returned models are valid Claude model IDs', () => {
      const validModels = ['claude-sonnet-4-6', 'claude-haiku-4-5']
      const preferences: CostPreference[] = ['quality', 'balanced', 'cost']
      for (const pref of preferences) {
        for (const tier of [1, 2, 3]) {
          expect(validModels).toContain(selectModelWithCostPreference(tier, pref))
        }
      }
    })
  })
})
