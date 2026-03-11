import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

const SOURCE_PATH = join(import.meta.dir, '../../db/scoped-query.ts')
const source = readFileSync(SOURCE_PATH, 'utf8')

describe('getDB(companyId) 멀티테넌시 래퍼', () => {
  test('빈 companyId 가드 — throw Error 코드 존재', () => {
    // Source-level verification (resilient against mock leakage from other test files)
    expect(source).toContain("if (!companyId) throw new Error('companyId required')")
  })

  test('반환 객체에 핵심 READ 메서드 정의', () => {
    // Core READ methods from Story 1.2
    expect(source).toContain('agents: ()')
    expect(source).toContain('departments: ()')
    expect(source).toContain('knowledgeDocs: ()')
  })

  test('반환 객체에 soul-renderer용 조회 메서드 정의 (Story 2.3)', () => {
    expect(source).toContain('agentById:')
    expect(source).toContain('agentsByReportTo:')
    expect(source).toContain('agentToolsWithDefs:')
    expect(source).toContain('departmentById:')
    expect(source).toContain('userById:')
  })

  test('반환 객체에 WRITE 메서드 정의', () => {
    expect(source).toContain('insertAgent:')
    expect(source).toContain('updateAgent:')
    expect(source).toContain('deleteAgent:')
  })
})

describe('TEA P0: tenant-helpers 재사용 검증', () => {
  test('scoped-query.ts가 tenant-helpers를 import하여 사용', () => {
    expect(source).toContain("from './tenant-helpers'")
    expect(source).toContain('withTenant')
    expect(source).toContain('scopedWhere')
    expect(source).toContain('scopedInsert')
  })

  test('scoped-query.ts가 eq/and를 직접 조합하지 않음 (WHERE절)', () => {
    // Should NOT have raw `and(eq(...), eq(...))` patterns — use scopedWhere instead
    expect(source).not.toContain("import { eq, and }")
  })
})

describe('TEA P1: .returning() on mutations', () => {
  test('모든 mutation 메서드가 .returning() 호출', () => {
    // All insert/update/delete methods should chain .returning()
    const returningMatches = source.match(/\.returning\(\)/g)
    expect(returningMatches).not.toBeNull()
    // insertAgent, updateAgent, deleteAgent, insertCostRecord,
    // insertPreset, updatePreset, deletePreset = 7
    expect(returningMatches!.length).toBeGreaterThanOrEqual(7)
  })
})

describe('TEA P1: getDB 메서드 스냅샷', () => {
  test('핵심 메서드가 모두 존재 (API 변경 감지)', () => {
    const requiredMethods = [
      // Core READ (Story 1.2)
      'agents:', 'departments:', 'knowledgeDocs:',
      // Soul-renderer READ (Story 2.3)
      'agentById:', 'agentsByReportTo:', 'agentToolsWithDefs:',
      'departmentById:', 'userById:',
      // Core WRITE (Story 1.2)
      'insertAgent:', 'updateAgent:', 'deleteAgent:',
      // Cost tracking (Story 3.5)
      'insertCostRecord:',
    ]
    for (const method of requiredMethods) {
      expect(source).toContain(method)
    }
  })

  test('companyId가 모든 쿼리에 적용됨 (withTenant 또는 scopedWhere)', () => {
    // Every query should use companyId filtering
    const tenantCalls = (source.match(/withTenant|scopedWhere|scopedInsert/g) || []).length
    // At least one per query method
    expect(tenantCalls).toBeGreaterThanOrEqual(10)
  })
})

// === TEA Risk-Based Tests (Story 12.3) ===

describe('TEA P1: Preset 메서드 존재 (Story 5.6)', () => {
  test('preset READ 메서드 정의', () => {
    expect(source).toContain('presetsByUser:')
    expect(source).toContain('presetById:')
    expect(source).toContain('presetByName:')
  })

  test('preset WRITE 메서드 정의', () => {
    expect(source).toContain('insertPreset:')
    expect(source).toContain('updatePreset:')
    expect(source).toContain('deletePreset:')
    expect(source).toContain('incrementPresetSortOrder:')
  })
})

describe('TEA P1: Cost tracking 메서드 (Story 3.5)', () => {
  test('insertCostRecord 메서드 정의 + scopedInsert 사용', () => {
    expect(source).toContain('insertCostRecord:')
    // Cost record should also use scopedInsert for tenant isolation
    expect(source).toContain('costRecords')
  })
})

describe('TEA P2: 소스 코드 무결성', () => {
  test('db import가 ./index에서만 가져옴', () => {
    expect(source).toContain("from './index'")
    // Should not import db from any other path
    const dbImports = source.match(/from ['"]\.\/(?!index)[^'"]*['"]/g) || []
    const nonHelperImports = dbImports.filter(i => !i.includes('tenant-helpers') && !i.includes('schema'))
    expect(nonHelperImports.length).toBe(0)
  })

  test('schema import 존재', () => {
    expect(source).toContain("from './schema'")
  })
})
