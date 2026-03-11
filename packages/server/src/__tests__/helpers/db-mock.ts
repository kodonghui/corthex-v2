/**
 * DB 모킹 헬퍼 — getDB(companyId) 반환값 모킹 (Architecture D1, E3)
 *
 * getDB() 레벨에서 모킹 — Drizzle ORM 내부는 모킹하지 않음.
 * 각 메서드가 Promise<Row[]> 반환하도록 구성.
 *
 * 사용법:
 *   import { mockGetDB } from './helpers/db-mock'
 *   mockGetDB({ agents: [{ id: '1', name: 'Test Agent', ... }] })
 */
import { mock } from 'bun:test'

// ─── Types ───────────────────────────────────────────────────

/** Partial data for each getDB() query method */
export interface MockDBData {
  agents?: Record<string, unknown>[]
  departments?: Record<string, unknown>[]
  knowledgeDocs?: Record<string, unknown>[]
  users?: Record<string, unknown>[]
  costRecords?: Record<string, unknown>[]
  presets?: Record<string, unknown>[]
  toolDefs?: Record<string, unknown>[]
}

export interface MockGetDBOptions {
  /** Data to return from read queries */
  data?: MockDBData
  /** CompanyId to enforce tenant isolation (queries with different id return empty) */
  allowedCompanyId?: string
  /** Simulate a DB error on specific methods */
  errorOn?: string[]
}

// ─── getDB() Mock ────────────────────────────────────────────

/**
 * Mock the scoped-query module's getDB function.
 * Returns a function that produces mock query methods matching getDB()'s interface.
 *
 * Must be called BEFORE importing modules that use getDB.
 */
export function mockGetDB(options: MockGetDBOptions = {}) {
  const { data = {}, allowedCompanyId, errorOn = [] } = options

  function throwIfError(method: string) {
    if (errorOn.includes(method)) {
      throw new Error(`DB error on ${method}`)
    }
  }

  function tenantCheck(companyId: string): boolean {
    if (allowedCompanyId && companyId !== allowedCompanyId) return false
    return true
  }

  const getDBMock = mock((companyId: string) => {
    if (!companyId) throw new Error('companyId required')

    const empty = !tenantCheck(companyId)

    return {
      // READ
      agents: mock(() => {
        throwIfError('agents')
        return Promise.resolve(empty ? [] : (data.agents || []))
      }),
      departments: mock(() => {
        throwIfError('departments')
        return Promise.resolve(empty ? [] : (data.departments || []))
      }),
      knowledgeDocs: mock(() => {
        throwIfError('knowledgeDocs')
        return Promise.resolve(empty ? [] : (data.knowledgeDocs || []))
      }),

      // READ — single-record lookups
      agentById: mock((_id: string) => {
        throwIfError('agentById')
        if (empty) return Promise.resolve([])
        const found = (data.agents || []).filter((a: any) => a.id === _id)
        return Promise.resolve(found)
      }),
      agentsByReportTo: mock((_agentId: string) => {
        throwIfError('agentsByReportTo')
        if (empty) return Promise.resolve([])
        const found = (data.agents || []).filter((a: any) => a.reportTo === _agentId)
        return Promise.resolve(found)
      }),
      agentToolsWithDefs: mock((_agentId: string) => {
        throwIfError('agentToolsWithDefs')
        return Promise.resolve(empty ? [] : (data.toolDefs || []))
      }),
      departmentById: mock((_id: string) => {
        throwIfError('departmentById')
        if (empty) return Promise.resolve([])
        const found = (data.departments || []).filter((d: any) => d.id === _id)
        return Promise.resolve(found)
      }),
      userById: mock((_id: string) => {
        throwIfError('userById')
        if (empty) return Promise.resolve([])
        const found = (data.users || []).filter((u: any) => u.id === _id)
        return Promise.resolve(found)
      }),

      // WRITE
      insertAgent: mock((input: any) => {
        throwIfError('insertAgent')
        return Promise.resolve([{ ...input, companyId, id: `mock-${Date.now()}` }])
      }),
      updateAgent: mock((_id: string, input: any) => {
        throwIfError('updateAgent')
        const existing = (data.agents || []).find((a: any) => a.id === _id) || {}
        return Promise.resolve([{ ...existing, ...input }])
      }),
      deleteAgent: mock((_id: string) => {
        throwIfError('deleteAgent')
        const found = (data.agents || []).filter((a: any) => a.id === _id)
        return Promise.resolve(found)
      }),

      // WRITE — cost
      insertCostRecord: mock((input: any) => {
        throwIfError('insertCostRecord')
        return Promise.resolve([{ ...input, companyId, id: `cost-${Date.now()}` }])
      }),

      // READ — presets
      presetsByUser: mock((_userId: string) => {
        throwIfError('presetsByUser')
        return Promise.resolve(empty ? [] : (data.presets || []))
      }),
      presetById: mock((_id: string) => {
        throwIfError('presetById')
        if (empty) return Promise.resolve([])
        const found = (data.presets || []).filter((p: any) => p.id === _id)
        return Promise.resolve(found)
      }),
      presetByName: mock((_name: string, _userId: string) => {
        throwIfError('presetByName')
        return Promise.resolve(empty ? [] : (data.presets || []).filter((p: any) => p.name === _name))
      }),

      // WRITE — presets
      insertPreset: mock((input: any) => {
        throwIfError('insertPreset')
        return Promise.resolve([{ ...input, companyId, id: `preset-${Date.now()}` }])
      }),
      updatePreset: mock((_id: string, input: any) => {
        throwIfError('updatePreset')
        return Promise.resolve([{ ...input }])
      }),
      deletePreset: mock((_id: string) => {
        throwIfError('deletePreset')
        return Promise.resolve([])
      }),
      incrementPresetSortOrder: mock((_id: string) => {
        throwIfError('incrementPresetSortOrder')
        return Promise.resolve(undefined)
      }),
    }
  })

  mock.module('../../db/scoped-query', () => ({
    getDB: getDBMock,
  }))

  return { getDBMock }
}
