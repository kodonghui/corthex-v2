import { describe, test, expect } from 'bun:test'

// Story 24.4: Personality Presets & Default Values (AR30, FR-PERS6, FR24)

import { PERSONALITY_PRESETS } from '@corthex/shared'
import type { PersonalityPreset, PersonalityTraits } from '@corthex/shared'
import { MANAGER_SOUL_TEMPLATE, SECRETARY_SOUL_TEMPLATE } from '../../lib/soul-templates'

const OCEAN_KEYS: (keyof PersonalityTraits)[] = [
  'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism',
]

describe('Story 24.4: Personality Presets & Default Values', () => {
  describe('AC-1: 3 default presets (AR30)', () => {
    test('exactly 3 presets defined', () => {
      expect(PERSONALITY_PRESETS).toHaveLength(3)
    })

    test('preset IDs: balanced, creative, analytical', () => {
      const ids = PERSONALITY_PRESETS.map(p => p.id)
      expect(ids).toContain('balanced')
      expect(ids).toContain('creative')
      expect(ids).toContain('analytical')
    })

    test('balanced preset: all values 50', () => {
      const balanced = PERSONALITY_PRESETS.find(p => p.id === 'balanced')!
      expect(balanced.traits).toEqual({
        openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50,
      })
    })

    test('creative preset: 80/30/70/60/40', () => {
      const creative = PERSONALITY_PRESETS.find(p => p.id === 'creative')!
      expect(creative.traits).toEqual({
        openness: 80, conscientiousness: 30, extraversion: 70, agreeableness: 60, neuroticism: 40,
      })
    })

    test('analytical preset: 40/90/20/40/30', () => {
      const analytical = PERSONALITY_PRESETS.find(p => p.id === 'analytical')!
      expect(analytical.traits).toEqual({
        openness: 40, conscientiousness: 90, extraversion: 20, agreeableness: 40, neuroticism: 30,
      })
    })

    test('all preset values are integers 0-100', () => {
      for (const preset of PERSONALITY_PRESETS) {
        for (const key of OCEAN_KEYS) {
          const val = preset.traits[key]
          expect(typeof val).toBe('number')
          expect(Number.isInteger(val)).toBe(true)
          expect(val).toBeGreaterThanOrEqual(0)
          expect(val).toBeLessThanOrEqual(100)
        }
      }
    })

    test('each preset has exactly 5 OCEAN trait keys', () => {
      for (const preset of PERSONALITY_PRESETS) {
        expect(Object.keys(preset.traits)).toHaveLength(5)
        for (const key of OCEAN_KEYS) {
          expect(preset.traits).toHaveProperty(key)
        }
      }
    })
  })

  describe('AC-1: Preset metadata', () => {
    test('each preset has id, name, nameKo, description', () => {
      for (const preset of PERSONALITY_PRESETS) {
        expect(typeof preset.id).toBe('string')
        expect(preset.id.length).toBeGreaterThan(0)
        expect(typeof preset.name).toBe('string')
        expect(preset.name.length).toBeGreaterThan(0)
        expect(typeof preset.nameKo).toBe('string')
        expect(preset.nameKo.length).toBeGreaterThan(0)
        expect(typeof preset.description).toBe('string')
        expect(preset.description.length).toBeGreaterThan(0)
      }
    })

    test('preset IDs are unique', () => {
      const ids = PERSONALITY_PRESETS.map(p => p.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('AC-4: Soul templates include personality variable placeholders (FR24)', () => {
    const PERSONALITY_VARS = [
      '{{personality_openness}}',
      '{{personality_conscientiousness}}',
      '{{personality_extraversion}}',
      '{{personality_agreeableness}}',
      '{{personality_neuroticism}}',
    ]

    test('MANAGER_SOUL_TEMPLATE contains all 5 personality vars', () => {
      for (const varName of PERSONALITY_VARS) {
        expect(MANAGER_SOUL_TEMPLATE).toContain(varName)
      }
    })

    test('SECRETARY_SOUL_TEMPLATE contains all 5 personality vars', () => {
      for (const varName of PERSONALITY_VARS) {
        expect(SECRETARY_SOUL_TEMPLATE).toContain(varName)
      }
    })

    test('templates contain personality communication style guidance', () => {
      // Both templates should explain how to use personality values
      expect(MANAGER_SOUL_TEMPLATE).toContain('커뮤니케이션 스타일')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('커뮤니케이션 스타일')
    })

    test('templates contain Big Five section header', () => {
      expect(MANAGER_SOUL_TEMPLATE).toContain('성격 특성 (Big Five)')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('성격 특성 (Big Five)')
    })
  })

  describe('AC-3: Backward compatibility', () => {
    test('presets do not include a "none" or "default" preset — NULL is the default', () => {
      const ids = PERSONALITY_PRESETS.map(p => p.id)
      expect(ids).not.toContain('none')
      expect(ids).not.toContain('default')
      expect(ids).not.toContain('null')
    })
  })

  describe('Type safety', () => {
    test('PersonalityPreset type has correct shape', () => {
      const preset: PersonalityPreset = {
        id: 'test',
        name: 'Test',
        nameKo: '테스트',
        description: 'Test preset',
        traits: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 },
      }
      expect(preset.id).toBe('test')
      expect(Object.keys(preset.traits)).toHaveLength(5)
    })
  })
})
