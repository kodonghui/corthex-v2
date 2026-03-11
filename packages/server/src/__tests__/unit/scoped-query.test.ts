import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('getDB(companyId) 멀티테넌시 래퍼', () => {
  test('빈 문자열 companyId → Error throw', async () => {
    const { getDB } = await import('../../db/scoped-query')
    expect(() => getDB('')).toThrow('companyId required')
  })

  test('반환 객체에 모든 READ/WRITE 메서드 존재', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const scopedDb = getDB('test-company-id')

    // READ methods
    expect(typeof scopedDb.agents).toBe('function')
    expect(typeof scopedDb.departments).toBe('function')
    expect(typeof scopedDb.knowledgeDocs).toBe('function')

    // WRITE methods
    expect(typeof scopedDb.insertAgent).toBe('function')
    expect(typeof scopedDb.updateAgent).toBe('function')
    expect(typeof scopedDb.deleteAgent).toBe('function')
  })

  test('다른 companyId → 별개의 스코프 객체', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db1 = getDB('company-a')
    const db2 = getDB('company-b')

    // 서로 다른 인스턴스여야 함
    expect(db1).not.toBe(db2)
    expect(db1.agents).not.toBe(db2.agents)
  })
})

describe('TEA P0: tenant-helpers 재사용 검증', () => {
  test('scoped-query.ts가 tenant-helpers를 import하여 사용', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../db/scoped-query.ts'), 'utf8'
    )
    // Must reuse existing tenant-helpers (withTenant, scopedWhere, scopedInsert)
    expect(source).toContain("from './tenant-helpers'")
    expect(source).toContain('withTenant')
    expect(source).toContain('scopedWhere')
    expect(source).toContain('scopedInsert')
  })

  test('scoped-query.ts가 eq/and를 직접 조합하지 않음 (WHERE절)', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../db/scoped-query.ts'), 'utf8'
    )
    // Should NOT have raw `and(eq(...), eq(...))` patterns — use scopedWhere instead
    // Only `eq` from drizzle-orm is allowed for non-companyId conditions (e.g., eq(agents.id, id))
    expect(source).not.toContain("import { eq, and }")
  })
})

describe('TEA P1: .returning() on mutations', () => {
  test('insertAgent, updateAgent, deleteAgent 모두 .returning() 호출', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../db/scoped-query.ts'), 'utf8'
    )
    // Count .returning() occurrences — should be 3 (one per mutation)
    const returningMatches = source.match(/\.returning\(\)/g)
    expect(returningMatches).not.toBeNull()
    expect(returningMatches!.length).toBe(3)
  })
})

describe('TEA P1: getDB 메서드 카운트', () => {
  test('READ 8개 + WRITE 3개 = 11개 메서드', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const scopedDb = getDB('test-company-id')
    const keys = Object.keys(scopedDb)
    expect(keys.length).toBe(11)
    // Original READ (3)
    expect(keys).toContain('agents')
    expect(keys).toContain('departments')
    expect(keys).toContain('knowledgeDocs')
    // soul-renderer READ (5, Story 2.3)
    expect(keys).toContain('agentById')
    expect(keys).toContain('agentsByReportTo')
    expect(keys).toContain('agentToolsWithDefs')
    expect(keys).toContain('departmentById')
    expect(keys).toContain('userById')
    // WRITE (3)
    expect(keys).toContain('insertAgent')
    expect(keys).toContain('updateAgent')
    expect(keys).toContain('deleteAgent')
  })
})
