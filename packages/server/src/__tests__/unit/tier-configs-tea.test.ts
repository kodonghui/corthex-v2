import { describe, test, expect } from 'bun:test'
import { selectModel } from '../../engine/model-selector'
import * as schema from '../../db/schema'
import { getDB } from '../../db/scoped-query'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * TEA Risk-Based Tests — Story 8.1
 * Priority: P1 (critical path) + P2 (data integrity) + P3 (edge cases)
 */
describe('TEA: Story 8.1 — tier_configs + enum→integer', () => {

  // === P1: selectModelFromDB fallback behavior ===
  describe('TEA P1: selectModelFromDB import & signature', () => {
    test('selectModelFromDB is exported as async function', async () => {
      const mod = await import('../../engine/model-selector')
      expect(mod.selectModelFromDB).toBeDefined()
      expect(typeof mod.selectModelFromDB).toBe('function')
    })

    test('selectModelFromDB returns a promise', async () => {
      const mod = await import('../../engine/model-selector')
      // Call with invalid companyId — should fallback gracefully
      const result = mod.selectModelFromDB(1, 'non-existent-company-id')
      expect(result).toBeInstanceOf(Promise)
    })

    test('selectModelFromDB fallback returns valid model string for known tier', async () => {
      const mod = await import('../../engine/model-selector')
      // DB will fail with non-existent companyId, should fallback to hardcoded
      const model = await mod.selectModelFromDB(1, 'fallback-test-id')
      expect(typeof model).toBe('string')
      expect(model.length).toBeGreaterThan(0)
      expect(model).toBe('claude-sonnet-4-6')
    })

    test('selectModelFromDB fallback returns default for unknown tier', async () => {
      const mod = await import('../../engine/model-selector')
      const model = await mod.selectModelFromDB(999, 'fallback-test-id')
      expect(model).toBe('claude-haiku-4-5')
    })
  })

  // === P1: getDB scoped query structure ===
  describe('TEA P1: getDB tierConfigs scoped queries', () => {
    test('getDB returns object with tierConfigs method', () => {
      const db = getDB('test-company-id')
      expect(db.tierConfigs).toBeDefined()
      expect(typeof db.tierConfigs).toBe('function')
    })

    test('getDB returns object with tierConfigByLevel method', () => {
      const db = getDB('test-company-id')
      expect(db.tierConfigByLevel).toBeDefined()
      expect(typeof db.tierConfigByLevel).toBe('function')
    })

    test('getDB returns object with insertTierConfig method', () => {
      const db = getDB('test-company-id')
      expect(db.insertTierConfig).toBeDefined()
      expect(typeof db.insertTierConfig).toBe('function')
    })

    test('getDB returns object with updateTierConfig method', () => {
      const db = getDB('test-company-id')
      expect(db.updateTierConfig).toBeDefined()
      expect(typeof db.updateTierConfig).toBe('function')
    })

    test('getDB returns object with deleteTierConfig method', () => {
      const db = getDB('test-company-id')
      expect(db.deleteTierConfig).toBeDefined()
      expect(typeof db.deleteTierConfig).toBe('function')
    })

    test('getDB throws on empty companyId', () => {
      expect(() => getDB('')).toThrow('companyId required')
    })
  })

  // === P2: SQL Migration syntax validation ===
  describe('TEA P2: migration file integrity', () => {
    const migrationPath = join(__dirname, '../../db/migrations/0048_tier-configs-table.sql')
    let sql: string

    try {
      sql = readFileSync(migrationPath, 'utf8')
    } catch {
      sql = ''
    }

    test('migration file exists', () => {
      expect(sql.length).toBeGreaterThan(0)
    })

    test('migration creates tier_configs table', () => {
      expect(sql).toContain('CREATE TABLE')
      expect(sql).toContain('tier_configs')
    })

    test('migration adds tier_level column to agents', () => {
      expect(sql).toContain('ALTER TABLE "agents" ADD COLUMN "tier_level"')
    })

    test('migration maps manager→1, specialist→2, worker→3', () => {
      expect(sql).toContain("WHEN 'manager' THEN 1")
      expect(sql).toContain("WHEN 'specialist' THEN 2")
      expect(sql).toContain("WHEN 'worker' THEN 3")
    })

    test('migration sets tier_level NOT NULL', () => {
      expect(sql).toContain('SET NOT NULL')
    })

    test('migration sets default value 2 for tier_level', () => {
      expect(sql).toContain('SET DEFAULT 2')
    })

    test('migration seeds default tier configs for existing companies', () => {
      expect(sql).toContain('INSERT INTO "tier_configs"')
      expect(sql).toContain("'Manager'")
      expect(sql).toContain("'Specialist'")
      expect(sql).toContain("'Worker'")
    })

    test('migration creates unique constraint on (company_id, tier_level)', () => {
      expect(sql).toContain('tier_configs_company_level_unique')
    })

    test('migration does NOT drop tier enum column', () => {
      expect(sql).not.toContain('DROP COLUMN "tier"')
      expect(sql).not.toContain('DROP TYPE')
    })

    test('migration uses statement-breakpoint separators', () => {
      expect(sql).toContain('--> statement-breakpoint')
    })
  })

  // === P2: Schema structural integrity ===
  describe('TEA P2: schema structural integrity', () => {
    test('tierConfigs table name is "tier_configs"', () => {
      // Access the internal table symbol
      const tableName = (schema.tierConfigs as any)[Symbol.for('drizzle:Name')]
      expect(tableName).toBe('tier_configs')
    })

    test('tierConfigsRelations is exported', () => {
      expect(schema.tierConfigsRelations).toBeDefined()
    })

    test('agentTierEnum still exists (backward compat)', () => {
      expect(schema.agentTierEnum).toBeDefined()
    })

    test('agents.tier column still exists (not removed)', () => {
      expect(schema.agents.tier).toBeDefined()
    })

    test('agents.tierLevel column exists', () => {
      expect(schema.agents.tierLevel).toBeDefined()
    })
  })

  // === P2: shared/types.ts TierConfig type ===
  describe('TEA P2: shared types export', () => {
    test('TierConfig type is importable from shared', async () => {
      const types = await import('@corthex/shared')
      // Type exists at compile time; runtime check is that module loads
      expect(types).toBeDefined()
    })
  })

  // === P3: Edge cases and boundaries ===
  describe('TEA P3: edge cases', () => {
    test('selectModel with MAX_SAFE_INTEGER returns default', () => {
      expect(selectModel(Number.MAX_SAFE_INTEGER)).toBe('claude-haiku-4-5')
    })

    test('selectModel with NaN returns default (string path)', () => {
      // NaN is typeof number but won't match any key
      expect(selectModel(NaN)).toBe('claude-haiku-4-5')
    })

    test('selectModel with float rounds down in map lookup (no match)', () => {
      // 1.5 won't match integer key 1 or 2 in Record<number, string>
      expect(selectModel(1.5)).toBe('claude-haiku-4-5')
    })

    test('all returned models are valid Claude model identifiers', () => {
      const validModels = ['claude-sonnet-4-6', 'claude-haiku-4-5', 'claude-opus-4-6']
      const testInputs: (string | number)[] = ['manager', 'specialist', 'worker', '', 'unknown', 1, 2, 3, 0, -1, 99]
      for (const input of testInputs) {
        const model = selectModel(input)
        expect(validModels).toContain(model)
      }
    })

    test('selectModel is deterministic — same input always gives same output', () => {
      for (let i = 0; i < 10; i++) {
        expect(selectModel(1)).toBe('claude-sonnet-4-6')
        expect(selectModel('worker')).toBe('claude-haiku-4-5')
      }
    })
  })
})
