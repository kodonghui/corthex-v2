/**
 * TEA-Generated Tests: Story 5.1 — Secretary Agent DB Fields
 * Risk-based coverage for:
 * - Schema: ownerUserId field exists + nullable
 * - Delete protection: secretary vs system vs normal agent priority
 * - Error code: ORG_SECRETARY_DELETE_DENIED registered
 * - Migration: SQL syntax validation
 * - Edge cases: combined flags (isSecretary + isSystem)
 */
import { describe, test, expect, beforeEach, mock } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

// ============================================================
// Mock Setup (same pattern as agent-crud-tea.test.ts)
// ============================================================

let selectResults: unknown[][] = []

function makeChain(results: unknown[][]) {
  let callIndex = 0
  const chain: Record<string, unknown> = {}
  chain.from = mock(() => chain)
  chain.where = mock(() => chain)
  chain.limit = mock(() => {
    const res = results[callIndex] ?? []
    callIndex++
    return res
  })
  return chain
}

let currentChain: ReturnType<typeof makeChain>

mock.module('../../db', () => ({
  db: {
    select: mock(() => currentChain),
    insert: mock(() => ({
      values: mock(() => ({
        returning: mock(() => []),
      })),
    })),
    update: mock(() => ({
      set: mock(() => ({
        where: mock(() => ({
          returning: mock(() => []),
        })),
      })),
    })),
  },
}))

mock.module('../../db/schema', () => ({
  departments: { id: 'departments.id', companyId: 'departments.company_id', name: 'departments.name', isActive: 'departments.is_active' },
  agents: { id: 'agents.id', companyId: 'agents.company_id', name: 'agents.name', departmentId: 'agents.department_id', isActive: 'agents.is_active', isSystem: 'agents.is_system', isSecretary: 'agents.is_secretary', status: 'agents.status' },
  auditLogs: { id: 'audit_logs.id' },
  companies: { id: 'companies.id' },
  users: { id: 'users.id' },
}))

mock.module('drizzle-orm', () => ({
  eq: (a: unknown, b: unknown) => ({ type: 'eq', left: a, right: b }),
  and: (...args: unknown[]) => ({ type: 'and', conditions: args }),
  ne: (a: unknown, b: unknown) => ({ type: 'ne', left: a, right: b }),
  count: () => 'count',
  isNull: (a: unknown) => ({ type: 'isNull', column: a }),
  relations: () => ({}),
  sql: {},
  desc: () => ({}),
  gte: () => ({}),
  lte: () => ({}),
}))

mock.module('../../db/tenant-helpers', () => ({
  withTenant: (col: unknown, id: unknown) => ({ type: 'eq', left: col, right: id }),
  scopedWhere: (col: unknown, id: unknown, ...conds: unknown[]) => ({ type: 'and', conditions: [{ type: 'eq', left: col, right: id }, ...conds] }),
  scopedInsert: (companyId: string, data: Record<string, unknown>) => ({ ...data, companyId }),
}))

const auditCalls: Record<string, unknown>[] = []
mock.module('../../services/audit-log', () => ({
  createAuditLog: mock((input: Record<string, unknown>) => {
    auditCalls.push(input)
    return Promise.resolve()
  }),
  AUDIT_ACTIONS: {
    ORG_DEPARTMENT_CREATE: 'org.department.create',
    ORG_DEPARTMENT_UPDATE: 'org.department.update',
    ORG_DEPARTMENT_DELETE: 'org.department.delete',
    ORG_AGENT_CREATE: 'org.agent.create',
    ORG_AGENT_UPDATE: 'org.agent.update',
    ORG_AGENT_DELETE: 'org.agent.delete',
    ORG_AGENT_DEACTIVATE: 'org.agent.deactivate',
    ORG_TEMPLATE_APPLY: 'org.template.apply',
    CREDENTIAL_STORE: 'credential.store',
    CREDENTIAL_ACCESS: 'credential.access',
    CREDENTIAL_DELETE: 'credential.delete',
    AUTH_ROLE_CHANGE: 'auth.role.change',
    AUTH_LOGIN_FAIL: 'auth.login.fail',
    TRADE_ORDER_CREATE: 'trade.order.create',
    TRADE_ORDER_EXECUTE: 'trade.order.execute',
    TRADE_ORDER_CANCEL: 'trade.order.cancel',
    SYSTEM_CONFIG_CHANGE: 'system.config.change',
  },
}))

import { deactivateAgent } from '../../services/organization'

// ============================================================
// Constants
// ============================================================

const COMPANY_ID = '11111111-1111-1111-1111-111111111111'
const USER_ID = '22222222-2222-2222-2222-222222222222'
const OWNER_USER_ID = '55555555-5555-5555-5555-555555555555'
const AGENT_ID = '33333333-3333-3333-3333-333333333333'
const DEPT_ID = '44444444-4444-4444-4444-444444444444'

const tenant = { companyId: COMPANY_ID, userId: USER_ID, isAdminUser: true }

const baseAgent = {
  id: AGENT_ID,
  companyId: COMPANY_ID,
  userId: USER_ID,
  departmentId: DEPT_ID,
  name: 'Test Agent',
  nameEn: null,
  role: null,
  tier: 'specialist' as const,
  modelName: 'claude-haiku-4-5',
  reportTo: null,
  soul: null,
  adminSoul: null,
  status: 'offline' as const,
  ownerUserId: null,
  isSecretary: false,
  isSystem: false,
  allowedTools: [],
  autoLearn: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ============================================================
// TEA: Schema Validation (Static Analysis)
// ============================================================

describe('TEA: Schema — ownerUserId field (Story 5.1)', () => {
  test('agents table has ownerUserId in schema definition', () => {
    // Read schema source and verify ownerUserId exists
    const schemaPath = join(__dirname, '../../db/schema.ts')
    const schema = readFileSync(schemaPath, 'utf-8')
    expect(schema).toContain("ownerUserId: uuid('owner_user_id')")
    expect(schema).toContain('.references(() => users.id)')
  })

  test('ownerUserId is nullable (no .notNull())', () => {
    const schemaPath = join(__dirname, '../../db/schema.ts')
    const schema = readFileSync(schemaPath, 'utf-8')
    // Find the ownerUserId line and verify it doesn't have .notNull()
    const lines = schema.split('\n')
    const ownerLine = lines.find(l => l.includes('owner_user_id'))
    expect(ownerLine).toBeDefined()
    expect(ownerLine).not.toContain('.notNull()')
  })

  test('is_secretary field exists with default false', () => {
    const schemaPath = join(__dirname, '../../db/schema.ts')
    const schema = readFileSync(schemaPath, 'utf-8')
    expect(schema).toContain("isSecretary: boolean('is_secretary').notNull().default(false)")
  })

  test('ownerUser relation defined in agentsRelations', () => {
    const schemaPath = join(__dirname, '../../db/schema.ts')
    const schema = readFileSync(schemaPath, 'utf-8')
    expect(schema).toContain('ownerUser: one(users')
    expect(schema).toContain('agents.ownerUserId')
  })
})

// ============================================================
// TEA: Migration SQL Validation
// ============================================================

describe('TEA: Migration SQL (Story 5.1)', () => {
  const migrationPath = join(__dirname, '../../db/migrations/0047_secretary-owner-fields.sql')
  let sql: string

  test('migration file exists', () => {
    sql = readFileSync(migrationPath, 'utf-8')
    expect(sql.length).toBeGreaterThan(0)
  })

  test('adds owner_user_id column to agents', () => {
    sql = readFileSync(migrationPath, 'utf-8')
    expect(sql).toContain('ALTER TABLE "agents" ADD COLUMN "owner_user_id"')
    expect(sql).toContain('REFERENCES "users"("id")')
  })

  test('creates unique partial index for secretary', () => {
    sql = readFileSync(migrationPath, 'utf-8')
    expect(sql).toContain('CREATE UNIQUE INDEX "agents_secretary_unique"')
    expect(sql).toContain('ON "agents" ("company_id")')
    expect(sql).toContain('WHERE "is_secretary" = true')
  })

  test('does not drop or alter existing columns', () => {
    sql = readFileSync(migrationPath, 'utf-8')
    expect(sql).not.toContain('DROP COLUMN')
    expect(sql).not.toContain('ALTER COLUMN')
  })
})

// ============================================================
// TEA: Error Code Registration
// ============================================================

describe('TEA: Error Code — ORG_SECRETARY_DELETE_DENIED', () => {
  test('error code is registered in ERROR_CODES', () => {
    const { ERROR_CODES } = require('../../lib/error-codes')
    expect(ERROR_CODES.ORG_SECRETARY_DELETE_DENIED).toBe('ORG_SECRETARY_DELETE_DENIED')
  })

  test('ErrorCode type includes new code', () => {
    const errorCodesPath = join(__dirname, '../../lib/error-codes.ts')
    const source = readFileSync(errorCodesPath, 'utf-8')
    expect(source).toContain('ORG_SECRETARY_DELETE_DENIED')
  })
})

// ============================================================
// TEA: Secretary Delete Protection Edge Cases
// ============================================================

describe('TEA: Secretary Delete Protection Edge Cases', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('secretary agent blocked before audit log (no side effects)', async () => {
    const secretary = { ...baseAgent, isSecretary: true }
    currentChain = makeChain([[secretary]])

    await deactivateAgent(tenant, AGENT_ID)

    // No audit log should be created for blocked deletions
    expect(auditCalls).toHaveLength(0)
  })

  test('isSystem check runs before isSecretary (system agent gets AGENT_003)', async () => {
    // Agent that is BOTH system AND secretary — isSystem should win
    const bothFlags = { ...baseAgent, isSystem: true, isSecretary: true }
    currentChain = makeChain([[bothFlags]])

    const result = await deactivateAgent(tenant, AGENT_ID)

    expect(result).toHaveProperty('error')
    const err = (result as any).error
    // System check should fire first → AGENT_003, not ORG_SECRETARY_DELETE_DENIED
    expect(err.code).toBe('AGENT_003')
  })

  test('normal active agent can still be deactivated', async () => {
    const normalAgent = { ...baseAgent, isSecretary: false, isSystem: false }
    currentChain = makeChain([[normalAgent]])

    const result = await deactivateAgent(tenant, AGENT_ID)

    expect(result).toHaveProperty('data')
    expect(auditCalls).toHaveLength(1)
  })

  test('secretary error returns 403 status', async () => {
    const secretary = { ...baseAgent, isSecretary: true }
    currentChain = makeChain([[secretary]])

    const result = await deactivateAgent(tenant, AGENT_ID)

    const err = (result as any).error
    expect(err.status).toBe(403)
  })

  test('secretary error message is in Korean', async () => {
    const secretary = { ...baseAgent, isSecretary: true }
    currentChain = makeChain([[secretary]])

    const result = await deactivateAgent(tenant, AGENT_ID)

    const err = (result as any).error
    expect(err.message).toContain('비서')
    expect(err.message).toContain('삭제')
  })

  test('ownerUserId field present on agent object does not affect deactivation logic', async () => {
    const agentWithOwner = { ...baseAgent, ownerUserId: OWNER_USER_ID }
    currentChain = makeChain([[agentWithOwner]])

    const result = await deactivateAgent(tenant, AGENT_ID)

    expect(result).toHaveProperty('data')
  })
})
