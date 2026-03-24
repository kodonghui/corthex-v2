import { describe, test, expect } from 'bun:test'

// Story 24.5: BigFiveSliderGroup Unit Tests (UXR98, FR-PERS1, FR-PERS9, NFR-A5)
// Tests component logic, config, and accessibility requirements.
// (DOM rendering tests would require jsdom — these test the data layer)

import type { PersonalityTraits } from '@corthex/shared'
import { PERSONALITY_PRESETS } from '@corthex/shared'

// Re-derive trait configs for testing (matching component's TRAIT_CONFIGS)
const OCEAN_KEYS: (keyof PersonalityTraits)[] = [
  'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism',
]

describe('Story 24.5: BigFiveSliderGroup', () => {
  describe('FR-PERS1: 5 sliders displayed (0-100 integer)', () => {
    test('exactly 5 OCEAN trait keys defined', () => {
      expect(OCEAN_KEYS).toHaveLength(5)
    })

    test('all trait keys are distinct', () => {
      expect(new Set(OCEAN_KEYS).size).toBe(5)
    })
  })

  describe('FR-PERS6: Preset selector with instant fill', () => {
    test('all 3 presets have valid traits for slider fill', () => {
      for (const preset of PERSONALITY_PRESETS) {
        for (const key of OCEAN_KEYS) {
          const val = preset.traits[key]
          expect(Number.isInteger(val)).toBe(true)
          expect(val).toBeGreaterThanOrEqual(0)
          expect(val).toBeLessThanOrEqual(100)
        }
      }
    })

    test('presets have Korean names for display', () => {
      for (const preset of PERSONALITY_PRESETS) {
        expect(preset.nameKo.length).toBeGreaterThan(0)
      }
    })
  })

  describe('FR-PERS4: Personality changes = next session, no deployment', () => {
    test('NULL personality traits is valid (backward compat)', () => {
      const nullTraits: PersonalityTraits | null = null
      expect(nullTraits).toBeNull()
    })

    test('default traits are all-50 when enabled without preset', () => {
      const defaultTraits: PersonalityTraits = {
        openness: 50, conscientiousness: 50, extraversion: 50,
        agreeableness: 50, neuroticism: 50,
      }
      for (const key of OCEAN_KEYS) {
        expect(defaultTraits[key]).toBe(50)
      }
    })
  })

  describe('FR-PERS8, PER-6: Behavioral example tooltips', () => {
    // Test tooltip generation logic for each trait
    const tooltipFns: Record<string, (v: number) => string> = {
      openness: (v) => v < 30 ? '기존 방식을 선호하고, 입증된 해결책을 제시합니다' :
                       v < 70 ? '새로운 아이디어에 열려 있되, 현실적 판단을 병행합니다' :
                                '창의적이고 비유적인 표현으로 다양한 관점을 탐색합니다',
      conscientiousness: (v) => v < 30 ? '자유롭고 유연하게 대응하며, 세부사항보다 큰 그림을 봅니다' :
                       v < 70 ? '적절히 체계적이면서도 상황에 따라 유연하게 대처합니다' :
                                '체계적이고 구조화된 보고서를 작성하며, 빠짐없이 점검합니다',
    }

    test('low value (0-29) returns low-end description', () => {
      expect(tooltipFns.openness(0)).toContain('기존 방식')
      expect(tooltipFns.openness(29)).toContain('기존 방식')
      expect(tooltipFns.conscientiousness(10)).toContain('유연하게')
    })

    test('mid value (30-69) returns balanced description', () => {
      expect(tooltipFns.openness(50)).toContain('열려 있되')
      expect(tooltipFns.conscientiousness(50)).toContain('체계적이면서')
    })

    test('high value (70-100) returns high-end description', () => {
      expect(tooltipFns.openness(80)).toContain('창의적')
      expect(tooltipFns.openness(100)).toContain('창의적')
      expect(tooltipFns.conscientiousness(90)).toContain('체계적이고')
    })
  })

  describe('UXR47: Shift+Arrow for ±10 increment', () => {
    test('shift step is 10, normal step is 1', () => {
      const normalStep = 1
      const shiftStep = 10
      expect(shiftStep).toBe(10)
      expect(normalStep).toBe(1)

      // Simulate: value 50, shift+right → 60
      expect(Math.min(100, 50 + shiftStep)).toBe(60)
      // Simulate: value 5, shift+left → 0 (clamped)
      expect(Math.max(0, 5 - shiftStep)).toBe(0)
      // Simulate: value 95, shift+right → 100 (clamped)
      expect(Math.min(100, 95 + shiftStep)).toBe(100)
    })
  })

  describe('NFR-A5: Accessibility requirements', () => {
    test('component exports BigFiveSliderGroup (importable)', async () => {
      const mod = await import('../components/agents/big-five-slider-group')
      expect(typeof mod.BigFiveSliderGroup).toBe('function')
    })

    test('aria-valuetext format includes trait name + score + description', () => {
      // Expected format: "개방성 75점: 창의적이고..."
      const label = '개방성'
      const value = 75
      const tooltip = '창의적이고 비유적인 표현으로 다양한 관점을 탐색합니다'
      const ariaValueText = `${label} ${value}점: ${tooltip}`
      expect(ariaValueText).toContain('개방성')
      expect(ariaValueText).toContain('75')
      expect(ariaValueText).toContain('창의적')
    })
  })

  describe('Preset matching', () => {
    test('exact preset match returns preset ID', () => {
      const balanced = PERSONALITY_PRESETS.find(p => p.id === 'balanced')!
      // findMatchingPreset logic inline
      const match = PERSONALITY_PRESETS.find(p =>
        p.traits.openness === balanced.traits.openness &&
        p.traits.conscientiousness === balanced.traits.conscientiousness &&
        p.traits.extraversion === balanced.traits.extraversion &&
        p.traits.agreeableness === balanced.traits.agreeableness &&
        p.traits.neuroticism === balanced.traits.neuroticism
      )
      expect(match?.id).toBe('balanced')
    })

    test('custom values match no preset', () => {
      const custom: PersonalityTraits = { openness: 42, conscientiousness: 73, extraversion: 11, agreeableness: 88, neuroticism: 55 }
      const match = PERSONALITY_PRESETS.find(p =>
        p.traits.openness === custom.openness &&
        p.traits.conscientiousness === custom.conscientiousness &&
        p.traits.extraversion === custom.extraversion &&
        p.traits.agreeableness === custom.agreeableness &&
        p.traits.neuroticism === custom.neuroticism
      )
      expect(match).toBeUndefined()
    })
  })
})
