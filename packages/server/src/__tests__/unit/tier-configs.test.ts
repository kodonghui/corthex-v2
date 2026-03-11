import { describe, test, expect } from 'bun:test'
import { selectModel } from '../../engine/model-selector'

describe('tier-configs — Story 8.1', () => {
  describe('selectModel with integer tierLevel', () => {
    test('tierLevel 1 (Manager) → claude-sonnet-4-6', () => {
      expect(selectModel(1)).toBe('claude-sonnet-4-6')
    })

    test('tierLevel 2 (Specialist) → claude-sonnet-4-6', () => {
      expect(selectModel(2)).toBe('claude-sonnet-4-6')
    })

    test('tierLevel 3 (Worker) → claude-haiku-4-5', () => {
      expect(selectModel(3)).toBe('claude-haiku-4-5')
    })

    test('unknown tierLevel (99) → default model', () => {
      expect(selectModel(99)).toBe('claude-haiku-4-5')
    })

    test('tierLevel 0 → default model', () => {
      expect(selectModel(0)).toBe('claude-haiku-4-5')
    })

    test('negative tierLevel → default model', () => {
      expect(selectModel(-1)).toBe('claude-haiku-4-5')
    })
  })

  describe('selectModel backward compatibility with string tier', () => {
    test('string "manager" still works', () => {
      expect(selectModel('manager')).toBe('claude-sonnet-4-6')
    })

    test('string "specialist" still works', () => {
      expect(selectModel('specialist')).toBe('claude-sonnet-4-6')
    })

    test('string "worker" still works', () => {
      expect(selectModel('worker')).toBe('claude-haiku-4-5')
    })

    test('unknown string → default', () => {
      expect(selectModel('executive')).toBe('claude-haiku-4-5')
    })
  })

  describe('tier mapping consistency', () => {
    test('Manager string and level 1 produce same model', () => {
      expect(selectModel('manager')).toBe(selectModel(1))
    })

    test('Specialist string and level 2 produce same model', () => {
      expect(selectModel('specialist')).toBe(selectModel(2))
    })

    test('Worker string and level 3 produce same model', () => {
      expect(selectModel('worker')).toBe(selectModel(3))
    })
  })

  describe('tier_configs schema validation', () => {
    test('tierConfigs table is exported from schema', async () => {
      const schema = await import('../../db/schema')
      expect(schema.tierConfigs).toBeDefined()
    })

    test('tierConfigs has required columns', async () => {
      const schema = await import('../../db/schema')
      const tc = schema.tierConfigs
      expect(tc.id).toBeDefined()
      expect(tc.companyId).toBeDefined()
      expect(tc.tierLevel).toBeDefined()
      expect(tc.name).toBeDefined()
      expect(tc.modelPreference).toBeDefined()
      expect(tc.maxTools).toBeDefined()
      expect(tc.description).toBeDefined()
      expect(tc.createdAt).toBeDefined()
      expect(tc.updatedAt).toBeDefined()
    })

    test('agents table has tierLevel column', async () => {
      const schema = await import('../../db/schema')
      expect(schema.agents.tierLevel).toBeDefined()
    })

    test('agents table still has tier enum column (backward compat)', async () => {
      const schema = await import('../../db/schema')
      expect(schema.agents.tier).toBeDefined()
    })
  })

  describe('migration mapping correctness', () => {
    const TIER_MAPPING: Record<string, number> = {
      manager: 1,
      specialist: 2,
      worker: 3,
    }

    test('manager → 1', () => {
      expect(TIER_MAPPING.manager).toBe(1)
    })

    test('specialist → 2', () => {
      expect(TIER_MAPPING.specialist).toBe(2)
    })

    test('worker → 3', () => {
      expect(TIER_MAPPING.worker).toBe(3)
    })

    test('all enum values have mapping', () => {
      const enumValues = ['manager', 'specialist', 'worker']
      for (const val of enumValues) {
        expect(TIER_MAPPING[val]).toBeDefined()
        expect(typeof TIER_MAPPING[val]).toBe('number')
        expect(TIER_MAPPING[val]).toBeGreaterThan(0)
      }
    })

    test('mapping is contiguous starting from 1', () => {
      const levels = Object.values(TIER_MAPPING).sort()
      expect(levels).toEqual([1, 2, 3])
    })
  })
})
