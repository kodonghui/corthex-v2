import { describe, test, expect } from 'bun:test'
import { resolve, dirname } from 'path'
import { readFileSync, existsSync } from 'fs'

const repoRoot = resolve(dirname(import.meta.path), '../../../../..')

function readFile(relativePath: string): string {
  return readFileSync(resolve(repoRoot, relativePath), 'utf-8')
}

describe('Story 8.3: 모델 자동 배정 + 비용 최적화', () => {

  // ============================================================
  // Task 1: createAgent 모델 자동 배정
  // ============================================================
  describe('Task 1: createAgent 모델 자동 배정', () => {
    test('AgentInput interface includes tierLevel field', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      expect(src).toContain('tierLevel?: number')
    })

    test('createAgent imports selectModelFromDB', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      expect(src).toContain("import { selectModelFromDB } from '../engine/model-selector'")
    })

    test('createAgent uses selectModelFromDB for auto-assign', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      expect(src).toContain('selectModelFromDB(tierLevel, tenant.companyId)')
    })

    test('createAgent has TIER_STRING_TO_LEVEL mapping', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      expect(src).toContain('TIER_STRING_TO_LEVEL')
      expect(src).toContain('manager: 1')
      expect(src).toContain('specialist: 2')
      expect(src).toContain('worker: 3')
    })

    test('createAgent prioritizes explicit modelName over auto-assign', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      // The pattern should check input.modelName first, then fallback to selectModelFromDB
      expect(src).toContain('input.modelName\n    ? input.modelName\n    : await selectModelFromDB')
    })

    test('createAgent sets tierLevel in INSERT values', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      // After the tierLevel calculation, it should be used in the insert
      const insertSection = src.slice(src.indexOf('.insert(agents)'))
      expect(insertSection).toContain('tierLevel,')
    })
  })

  // ============================================================
  // Task 2: updateAgent 모델 자동 배정 + 오버라이드
  // ============================================================
  describe('Task 2: updateAgent 모델 자동 배정 + 오버라이드', () => {
    test('AgentUpdateInput interface includes tierLevel field', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      const updateInterface = src.slice(
        src.indexOf('export interface AgentUpdateInput'),
        src.indexOf('}', src.indexOf('export interface AgentUpdateInput')) + 1
      )
      expect(updateInterface).toContain('tierLevel?: number')
    })

    test('updateAgent auto-assigns model when tierLevel changes and modelName not provided', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      // Should check tierLevel change + no modelName → call selectModelFromDB
      expect(src).toContain('input.tierLevel !== undefined && !input.modelName')
      expect(src).toContain('selectModelFromDB(input.tierLevel, tenant.companyId)')
    })

    test('updateAgent does NOT auto-assign when modelName is explicitly provided', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      // The condition requires !input.modelName — so explicit modelName skips auto-assign
      expect(src).toContain('!input.modelName')
    })
  })

  // ============================================================
  // Task 3: Admin agents route 스키마 업데이트
  // ============================================================
  describe('Task 3: Admin agents route 스키마 업데이트', () => {
    test('createAgentSchema includes tierLevel field', () => {
      const src = readFile('packages/server/src/routes/admin/agents.ts')
      expect(src).toContain('tierLevel: z.number().int().min(1).optional()')
    })

    test('updateAgentSchema includes tierLevel field', () => {
      const src = readFile('packages/server/src/routes/admin/agents.ts')
      // Both schemas should have tierLevel
      const createIdx = src.indexOf('const createAgentSchema')
      const updateIdx = src.indexOf('const updateAgentSchema')
      const createSchema = src.slice(createIdx, updateIdx)
      const updateSchema = src.slice(updateIdx, src.indexOf('const soulPreviewSchema'))
      expect(createSchema).toContain('tierLevel: z.number().int().min(1).optional()')
      expect(updateSchema).toContain('tierLevel: z.number().int().min(1).optional()')
    })
  })

  // ============================================================
  // Task 4: tier별 비용 집계
  // ============================================================
  describe('Task 4: tier별 비용 집계 API', () => {
    test('AdminCostByTier type exists in shared types', () => {
      const src = readFile('packages/shared/src/types.ts')
      expect(src).toContain('export type AdminCostByTier')
      expect(src).toContain('tierLevel: number')
      expect(src).toContain('tierName: string | null')
      expect(src).toContain('totalCostMicro: number')
      expect(src).toContain('callCount: number')
      expect(src).toContain('agentCount: number')
    })

    test('cost-aggregation exports getByTier function', () => {
      const src = readFile('packages/server/src/services/cost-aggregation.ts')
      expect(src).toContain('export async function getByTier')
    })

    test('getByTier imports tierConfigs and AdminCostByTier', () => {
      const src = readFile('packages/server/src/services/cost-aggregation.ts')
      expect(src).toContain('tierConfigs')
      expect(src).toContain('AdminCostByTier')
    })

    test('getByTier JOINs agents and tier_configs correctly', () => {
      const src = readFile('packages/server/src/services/cost-aggregation.ts')
      const fn = src.slice(src.indexOf('async function getByTier'))
      expect(fn).toContain('innerJoin(agents')
      expect(fn).toContain('leftJoin(tierConfigs')
      expect(fn).toContain('agents.tierLevel')
    })

    test('getByTier groups by tierLevel and orders ascending', () => {
      const src = readFile('packages/server/src/services/cost-aggregation.ts')
      const fn = src.slice(src.indexOf('async function getByTier'))
      expect(fn).toContain('groupBy(agents.tierLevel')
      expect(fn).toContain('orderBy(asc(agents.tierLevel))')
    })

    test('dashboard route has /costs/by-tier endpoint', () => {
      const src = readFile('packages/server/src/routes/workspace/dashboard.ts')
      expect(src).toContain("'/dashboard/costs/by-tier'")
      expect(src).toContain('costAggregation.getByTier')
    })

    test('dashboard costs/by-tier uses costDateRangeSchema', () => {
      const src = readFile('packages/server/src/routes/workspace/dashboard.ts')
      const byTierSection = src.slice(
        src.indexOf("'/dashboard/costs/by-tier'"),
        src.indexOf("'/dashboard/costs/by-tier'") + 300
      )
      expect(byTierSection).toContain('costDateRangeSchema')
    })
  })

  // ============================================================
  // selectModelFromDB 검증 (기존 모듈 regression)
  // ============================================================
  describe('selectModelFromDB regression', () => {
    test('selectModelFromDB is exported as async function', async () => {
      const mod = await import('../../engine/model-selector')
      expect(typeof mod.selectModelFromDB).toBe('function')
    })

    test('selectModelFromDB fallback returns valid model string', async () => {
      const { selectModelFromDB } = await import('../../engine/model-selector')
      // With a non-existent company, it should fallback to hardcoded
      const model = await selectModelFromDB(1, 'non-existent-company-id')
      expect(model).toBe('claude-sonnet-4-6')
    })

    test('selectModelFromDB returns default for unknown tier', async () => {
      const { selectModelFromDB } = await import('../../engine/model-selector')
      const model = await selectModelFromDB(999, 'non-existent-company-id')
      expect(model).toBe('claude-haiku-4-5')
    })
  })

  // ============================================================
  // TEA: Edge cases & risk-based coverage gaps
  // ============================================================
  describe('TEA: createAgent tierLevel resolution edge cases', () => {
    test('tierLevel resolution: explicit tierLevel takes precedence over tier string', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      // Pattern: input.tierLevel ?? TIER_STRING_TO_LEVEL[input.tier ?? ''] ?? 2
      // This means: 1) explicit tierLevel, 2) tier string mapped, 3) default 2
      expect(src).toContain('input.tierLevel ?? TIER_STRING_TO_LEVEL[input.tier ??')
    })

    test('TIER_STRING_TO_LEVEL returns undefined for unknown tier strings (falls to default 2)', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      // Only manager/specialist/worker are mapped — anything else → undefined → falls to ?? 2
      const mapping = src.slice(
        src.indexOf('const TIER_STRING_TO_LEVEL'),
        src.indexOf('}', src.indexOf('const TIER_STRING_TO_LEVEL')) + 1
      )
      expect(mapping).not.toContain('executive')
      expect(mapping).not.toContain('intern')
      // Confirms only 3 entries exist
      expect(mapping).toContain('manager: 1')
      expect(mapping).toContain('specialist: 2')
      expect(mapping).toContain('worker: 3')
    })

    test('createAgent auto-assign uses ternary (truthy check), empty string triggers auto-assign', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      // input.modelName ? input.modelName : await selectModelFromDB(...)
      // JS truthy: empty string "" is falsy → triggers auto-assign ✓
      const assignBlock = src.slice(
        src.indexOf('const modelName = input.modelName'),
        src.indexOf(': await selectModelFromDB') + 40
      )
      expect(assignBlock).toContain('input.modelName\n    ? input.modelName\n    : await selectModelFromDB')
    })
  })

  describe('TEA: updateAgent resolvedModelName logic', () => {
    test('updateAgent uses resolvedModelName variable (not input.modelName mutation)', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      // After simplify fix: uses local resolvedModelName instead of mutating input.modelName
      expect(src).toContain('const resolvedModelName =')
      expect(src).toContain('resolvedModelName !== undefined && { modelName: resolvedModelName }')
    })

    test('updateAgent: when both tierLevel and modelName provided, modelName wins (no auto-assign)', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      // Condition: input.tierLevel !== undefined && !input.modelName
      // If modelName IS provided, !input.modelName = false → auto-assign skipped
      // resolvedModelName = input.modelName (the else branch of ternary)
      const ternary = src.slice(
        src.indexOf('const resolvedModelName ='),
        src.indexOf(': input.modelName', src.indexOf('const resolvedModelName =')) + 20
      )
      expect(ternary).toContain('input.tierLevel !== undefined && !input.modelName')
      expect(ternary).toContain(': input.modelName')
    })

    test('updateAgent: when only tierLevel provided (no modelName), auto-assign triggers', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      // !input.modelName is true (undefined) + input.tierLevel is defined → selectModelFromDB
      expect(src).toContain('await selectModelFromDB(input.tierLevel, tenant.companyId)')
    })

    test('updateAgent: resolvedModelName spread into updateData only when defined', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      // Conditional spread: when neither tierLevel nor modelName provided, resolvedModelName = undefined
      // → spread is skipped → existing modelName preserved
      expect(src).toContain('...(resolvedModelName !== undefined && { modelName: resolvedModelName })')
    })
  })

  describe('TEA: getByTier tenant scoping & null-safety', () => {
    test('getByTier filters tier_configs by companyId in LEFT JOIN', () => {
      const src = readFile('packages/server/src/services/cost-aggregation.ts')
      const fn = src.slice(src.indexOf('async function getByTier'))
      // Must scope tier_configs to the same company to avoid cross-tenant leakage
      expect(fn).toContain("eq(tierConfigs.companyId, companyId)")
    })

    test('getByTier maps null tierName safely', () => {
      const src = readFile('packages/server/src/services/cost-aggregation.ts')
      const fn = src.slice(src.indexOf('async function getByTier'))
      // tierName comes from LEFT JOIN → could be null
      expect(fn).toContain('r.tierName ?? null')
    })

    test('getByTier maps null numeric fields to 0', () => {
      const src = readFile('packages/server/src/services/cost-aggregation.ts')
      const fn = src.slice(src.indexOf('async function getByTier'))
      expect(fn).toContain('r.totalCostMicro ?? 0')
      expect(fn).toContain('r.callCount ?? 0')
      expect(fn).toContain('r.agentCount ?? 0')
    })

    test('getByTier uses dateConditions for time range filtering', () => {
      const src = readFile('packages/server/src/services/cost-aggregation.ts')
      const fn = src.slice(src.indexOf('async function getByTier'))
      expect(fn).toContain('dateConditions(companyId, range)')
    })

    test('getByTier supports departmentIds parameter for employee scope (CR fix)', () => {
      const src = readFile('packages/server/src/services/cost-aggregation.ts')
      const fn = src.slice(src.indexOf('async function getByTier'))
      // Must accept departmentIds like getByAgent does
      expect(fn).toContain('departmentIds?: string[]')
      expect(fn).toContain('inArray(agents.departmentId, departmentIds)')
      // Early return for empty departmentIds
      expect(fn).toContain('departmentIds.length === 0')
    })
  })

  describe('TEA: dashboard /costs/by-tier endpoint', () => {
    test('costs/by-tier endpoint returns { success: true, data: { items } } format', () => {
      const src = readFile('packages/server/src/routes/workspace/dashboard.ts')
      // Find the by-tier handler block (extends until next route or end)
      const startIdx = src.indexOf("'/dashboard/costs/by-tier'")
      const afterStart = src.slice(startIdx)
      // Get the full handler — up to 800 chars to capture return statement
      const byTierBlock = afterStart.slice(0, 800)
      expect(byTierBlock).toContain('success: true, data: { items }')
    })

    test('costs/by-tier endpoint applies same date range logic as other cost endpoints', () => {
      const src = readFile('packages/server/src/routes/workspace/dashboard.ts')
      const byTierBlock = src.slice(
        src.indexOf("'/dashboard/costs/by-tier'"),
        src.indexOf("'/dashboard/costs/by-tier'") + 500
      )
      // Same pattern: endDate defaults to now, startDate defaults to 30 days ago
      expect(byTierBlock).toContain('T23:59:59.999Z')
      expect(byTierBlock).toContain('T00:00:00.000Z')
      expect(byTierBlock).toContain('30 * 24 * 60 * 60 * 1000')
    })

    test('costs/by-tier endpoint uses tenant.companyId and departmentIds from middleware', () => {
      const src = readFile('packages/server/src/routes/workspace/dashboard.ts')
      const startIdx = src.indexOf("'/dashboard/costs/by-tier'")
      const byTierBlock = src.slice(startIdx, startIdx + 800)
      expect(byTierBlock).toContain("c.get('tenant')")
      expect(byTierBlock).toContain('tenant.companyId')
      expect(byTierBlock).toContain('tenant.departmentIds')
    })
  })

  // ============================================================
  // Cross-cutting: no regressions on existing patterns
  // ============================================================
  describe('Cross-cutting regressions', () => {
    test('organization.ts still exports createAgent function', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      expect(src).toContain('export async function createAgent')
    })

    test('organization.ts still exports updateAgent function', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      expect(src).toContain('export async function updateAgent')
    })

    test('organization.ts still uses scopedInsert for tenant isolation', () => {
      const src = readFile('packages/server/src/services/organization.ts')
      expect(src).toContain('scopedInsert(tenant.companyId')
    })

    test('admin agents route still uses authMiddleware + adminOnly + tenantMiddleware', () => {
      const src = readFile('packages/server/src/routes/admin/agents.ts')
      expect(src).toContain('authMiddleware, adminOnly, tenantMiddleware')
    })

    test('dashboard route still uses authMiddleware + departmentScopeMiddleware', () => {
      const src = readFile('packages/server/src/routes/workspace/dashboard.ts')
      expect(src).toContain('authMiddleware')
      expect(src).toContain('departmentScopeMiddleware')
    })

    test('existing cost-aggregation functions unchanged', () => {
      const src = readFile('packages/server/src/services/cost-aggregation.ts')
      expect(src).toContain('export async function getByAgent')
      expect(src).toContain('export async function getByModel')
      expect(src).toContain('export async function getByDepartment')
      expect(src).toContain('export async function getSummary')
      expect(src).toContain('export async function getDaily')
    })
  })
})
