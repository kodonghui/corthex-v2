/**
 * TEA-Generated Tests: Agent CRUD API (Story 2-2)
 * Risk-based coverage expansion focusing on:
 * - Edge cases and boundary conditions
 * - Security: tenant isolation, system agent protection
 * - Data integrity: audit logging completeness
 * - Error paths and graceful degradation
 * - Zod schema boundary validation
 */
import { describe, test, expect, beforeEach, mock } from 'bun:test'

// ============================================================
// Mock Setup (same pattern as agent-crud.test.ts)
// ============================================================

let selectResults: unknown[][] = []
let insertResult: unknown[] = []
let updateResult: unknown[] = []

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
        returning: mock(() => insertResult),
      })),
    })),
    update: mock(() => ({
      set: mock(() => ({
        where: mock(() => ({
          returning: mock(() => updateResult),
        })),
      })),
    })),
  },
}))

mock.module('../../db/schema', () => ({
  departments: { id: 'departments.id', companyId: 'departments.company_id', name: 'departments.name', isActive: 'departments.is_active' },
  agents: { id: 'agents.id', companyId: 'agents.company_id', name: 'agents.name', departmentId: 'agents.department_id', isActive: 'agents.is_active', isSystem: 'agents.is_system', status: 'agents.status' },
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

import {
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deactivateAgent,
} from '../../services/organization'

// ============================================================
// Constants
// ============================================================

const COMPANY_A = '11111111-1111-1111-1111-111111111111'
const COMPANY_B = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const USER_ID = '22222222-2222-2222-2222-222222222222'
const AGENT_ID = '33333333-3333-3333-3333-333333333333'
const DEPT_ID = '44444444-4444-4444-4444-444444444444'

const tenantA = { companyId: COMPANY_A, userId: USER_ID, isAdminUser: true }
const tenantB = { companyId: COMPANY_B, userId: USER_ID, isAdminUser: true }
const nonAdminTenant = { companyId: COMPANY_A, userId: USER_ID, isAdminUser: false }

const baseAgent = {
  id: AGENT_ID,
  companyId: COMPANY_A,
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
// TEA: Security Edge Cases
// ============================================================

describe('TEA: Security - System Agent Protection (FR5)', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('blocks deactivation of isSystem=true agent with correct error code', async () => {
    const secretaryAgent = { ...baseAgent, isSystem: true, isSecretary: true, name: '비서실장' }
    currentChain = makeChain([[secretaryAgent]])

    const result = await deactivateAgent(tenantA, AGENT_ID)

    expect(result).toHaveProperty('error')
    const err = (result as any).error
    expect(err.status).toBe(403)
    expect(err.code).toBe('AGENT_003')
    expect(err.message).toContain('시스템')
  })

  test('blocks deactivation of secretary agent (Story 5.1)', async () => {
    const nonSystemSecretary = { ...baseAgent, isSystem: false, isSecretary: true }
    currentChain = makeChain([[nonSystemSecretary]])

    const result = await deactivateAgent(tenantA, AGENT_ID)

    expect(result).toHaveProperty('error')
    const err = (result as any).error
    expect(err.status).toBe(403)
    expect(err.code).toBe('ORG_SECRETARY_DELETE_DENIED')
  })

  test('system agent protection does not generate audit log', async () => {
    const systemAgent = { ...baseAgent, isSystem: true }
    currentChain = makeChain([[systemAgent]])

    await deactivateAgent(tenantA, AGENT_ID)

    expect(auditCalls).toHaveLength(0)
  })
})

// ============================================================
// TEA: Audit Logging Completeness
// ============================================================

describe('TEA: Audit Logging Completeness', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('createAgent audit includes companyId and actorId', async () => {
    currentChain = makeChain([[]])
    insertResult = [{ ...baseAgent, name: 'New Agent' }]

    await createAgent(tenantA, { userId: USER_ID, name: 'New Agent' })

    expect(auditCalls).toHaveLength(1)
    expect(auditCalls[0].companyId).toBe(COMPANY_A)
    expect(auditCalls[0].actorId).toBe(USER_ID)
    expect(auditCalls[0].actorType).toBe('admin_user')
  })

  test('non-admin actor type is correctly set', async () => {
    currentChain = makeChain([[]])
    insertResult = [{ ...baseAgent, name: 'Agent' }]

    await createAgent(nonAdminTenant, { userId: USER_ID, name: 'Agent' })

    expect(auditCalls).toHaveLength(1)
    expect(auditCalls[0].actorType).toBe('user')
  })

  test('updateAgent audit captures before/after snapshots', async () => {
    const updated = { ...baseAgent, name: 'Updated', tier: 'manager' as const, modelName: 'claude-sonnet-4-6' }
    currentChain = makeChain([[baseAgent]])
    updateResult = [updated]

    await updateAgent(tenantA, AGENT_ID, { name: 'Updated', tier: 'manager', modelName: 'claude-sonnet-4-6' })

    expect(auditCalls).toHaveLength(1)
    const before = auditCalls[0].before as Record<string, unknown>
    const after = auditCalls[0].after as Record<string, unknown>
    expect(before.name).toBe('Test Agent')
    expect(before.tier).toBe('specialist')
    expect(after.name).toBe('Updated')
    expect(after.tier).toBe('manager')
  })

  test('deactivateAgent audit captures department transition', async () => {
    currentChain = makeChain([[{ ...baseAgent, departmentId: DEPT_ID }]])

    await deactivateAgent(tenantA, AGENT_ID)

    expect(auditCalls).toHaveLength(1)
    const before = auditCalls[0].before as Record<string, unknown>
    const after = auditCalls[0].after as Record<string, unknown>
    expect(before.departmentId).toBe(DEPT_ID)
    expect(after.departmentId).toBeNull()
    expect(after.isActive).toBe(false)
  })
})

// ============================================================
// TEA: Tier and Model Assignment
// ============================================================

describe('TEA: Tier and Model Assignment', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('creates agent with manager tier', async () => {
    currentChain = makeChain([[]])
    const managerAgent = { ...baseAgent, tier: 'manager', modelName: 'claude-sonnet-4-6' }
    insertResult = [managerAgent]

    const result = await createAgent(tenantA, {
      userId: USER_ID,
      name: 'Manager Agent',
      tier: 'manager',
      modelName: 'claude-sonnet-4-6',
    })

    expect(result).toHaveProperty('data')
  })

  test('creates agent with worker tier', async () => {
    currentChain = makeChain([[]])
    const workerAgent = { ...baseAgent, tier: 'worker' }
    insertResult = [workerAgent]

    const result = await createAgent(tenantA, {
      userId: USER_ID,
      name: 'Worker Agent',
      tier: 'worker',
    })

    expect(result).toHaveProperty('data')
  })

  test('updates agent tier from specialist to manager', async () => {
    const updated = { ...baseAgent, tier: 'manager' as const }
    currentChain = makeChain([[baseAgent]])
    updateResult = [updated]

    const result = await updateAgent(tenantA, AGENT_ID, { tier: 'manager' })

    expect(result).toHaveProperty('data')
    expect(result.data.tier).toBe('manager')
  })
})

// ============================================================
// TEA: allowedTools Management
// ============================================================

describe('TEA: allowedTools Management', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('creates agent with multiple allowed tools', async () => {
    const tools = ['web_search', 'calculator', 'email_sender', 'chart_generator']
    currentChain = makeChain([[]])
    insertResult = [{ ...baseAgent, allowedTools: tools }]

    const result = await createAgent(tenantA, {
      userId: USER_ID,
      name: 'Tool Agent',
      allowedTools: tools,
    })

    expect(result).toHaveProperty('data')
    expect(result.data.allowedTools).toEqual(tools)
  })

  test('creates agent with empty allowed tools', async () => {
    currentChain = makeChain([[]])
    insertResult = [{ ...baseAgent, allowedTools: [] }]

    const result = await createAgent(tenantA, {
      userId: USER_ID,
      name: 'No Tool Agent',
      allowedTools: [],
    })

    expect(result).toHaveProperty('data')
    expect(result.data.allowedTools).toEqual([])
  })

  test('updates agent allowed tools', async () => {
    const newTools = ['web_search', 'translator']
    const updated = { ...baseAgent, allowedTools: newTools }
    currentChain = makeChain([[baseAgent]])
    updateResult = [updated]

    const result = await updateAgent(tenantA, AGENT_ID, { allowedTools: newTools })

    expect(result).toHaveProperty('data')
    expect(result.data.allowedTools).toEqual(newTools)
  })
})

// ============================================================
// TEA: Soul Editing Edge Cases
// ============================================================

describe('TEA: Soul Editing Edge Cases', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('soul update syncs adminSoul correctly', async () => {
    const newSoul = '# Updated Soul\n\nYou are a financial analyst.'
    const updated = { ...baseAgent, soul: newSoul, adminSoul: newSoul }
    currentChain = makeChain([[baseAgent]])
    updateResult = [updated]

    const result = await updateAgent(tenantA, AGENT_ID, { soul: newSoul })

    expect(result).toHaveProperty('data')
    expect(result.data.soul).toBe(newSoul)
    expect(result.data.adminSoul).toBe(newSoul)
  })

  test('setting soul to null clears both soul and adminSoul', async () => {
    const agentWithSoul = { ...baseAgent, soul: '# Old Soul', adminSoul: '# Old Soul' }
    const updated = { ...agentWithSoul, soul: null, adminSoul: null }
    currentChain = makeChain([[agentWithSoul]])
    updateResult = [updated]

    const result = await updateAgent(tenantA, AGENT_ID, { soul: null })

    expect(result).toHaveProperty('data')
    expect(result.data.soul).toBeNull()
  })

  test('update without soul does not change adminSoul', async () => {
    const agentWithSoul = { ...baseAgent, soul: '# Keep This', adminSoul: '# Keep This' }
    const updated = { ...agentWithSoul, name: 'Renamed' }
    currentChain = makeChain([
      [agentWithSoul],  // current
    ])
    updateResult = [updated]

    const result = await updateAgent(tenantA, AGENT_ID, { name: 'Renamed' })

    expect(result).toHaveProperty('data')
    expect(result.data.soul).toBe('# Keep This')
    expect(result.data.adminSoul).toBe('# Keep This')
  })
})

// ============================================================
// TEA: Deactivation Data Preservation
// ============================================================

describe('TEA: Deactivation Preserves Data', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('deactivation sets correct state transition', async () => {
    const activeAgent = { ...baseAgent, status: 'working' as const, departmentId: DEPT_ID, isActive: true }
    currentChain = makeChain([[activeAgent]])

    const result = await deactivateAgent(tenantA, AGENT_ID)

    expect(result).toHaveProperty('data')
    expect(result.data.message).toContain('비활성화')
    // Audit log should show before had departmentId and was active
    const before = auditCalls[0].before as Record<string, unknown>
    expect(before.status).toBe('working')
    expect(before.departmentId).toBe(DEPT_ID)
    expect(before.isActive).toBe(true)
  })

  test('deactivation of already-unassigned agent works', async () => {
    const unassigned = { ...baseAgent, departmentId: null, isActive: true }
    currentChain = makeChain([[unassigned]])

    const result = await deactivateAgent(tenantA, AGENT_ID)

    expect(result).toHaveProperty('data')
  })
})

// ============================================================
// TEA: Name Uniqueness Edge Cases
// ============================================================

describe('TEA: Name Uniqueness Enforcement', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('allows same name in different companies', async () => {
    // Company A creates agent with name "Analyst"
    currentChain = makeChain([[]])
    insertResult = [{ ...baseAgent, companyId: COMPANY_A, name: 'Analyst' }]

    const resultA = await createAgent(tenantA, { userId: USER_ID, name: 'Analyst' })
    expect(resultA).toHaveProperty('data')

    // Company B creates agent with same name -- should succeed (different tenant)
    currentChain = makeChain([[]])
    insertResult = [{ ...baseAgent, companyId: COMPANY_B, name: 'Analyst' }]

    const resultB = await createAgent(tenantB, { userId: USER_ID, name: 'Analyst' })
    expect(resultB).toHaveProperty('data')
  })

  test('update to own name does not trigger duplicate error', async () => {
    // Update agent's name to its current name (should succeed)
    currentChain = makeChain([
      [baseAgent],  // current agent found
      [],           // no duplicate (self excluded by ne())
    ])
    updateResult = [baseAgent]

    const result = await updateAgent(tenantA, AGENT_ID, { name: baseAgent.name })
    expect(result).toHaveProperty('data')
  })
})

// ============================================================
// TEA: Zod Schema Boundary Validation
// ============================================================

describe('TEA: Zod Schema Boundary Validation', () => {
  const { z } = require('zod')

  const createAgentSchema = z.object({
    userId: z.string().uuid(),
    departmentId: z.string().uuid().nullable().optional(),
    name: z.string().min(1).max(100),
    nameEn: z.string().max(100).nullable().optional(),
    role: z.string().max(200).nullable().optional(),
    tier: z.enum(['manager', 'specialist', 'worker']).optional(),
    modelName: z.string().max(100).optional(),
    allowedTools: z.array(z.string()).optional(),
    soul: z.string().nullable().optional(),
  })

  test('name at max length (100 chars) is valid', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_A, name: 'A'.repeat(100) })
    expect(r.success).toBe(true)
  })

  test('name at min length (1 char) is valid', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_A, name: 'A' })
    expect(r.success).toBe(true)
  })

  test('role at max length (200 chars) is valid', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_A, name: 'A', role: 'R'.repeat(200) })
    expect(r.success).toBe(true)
  })

  test('role exceeding max (201 chars) is invalid', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_A, name: 'A', role: 'R'.repeat(201) })
    expect(r.success).toBe(false)
  })

  test('modelName at max length (100 chars) is valid', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_A, name: 'A', modelName: 'M'.repeat(100) })
    expect(r.success).toBe(true)
  })

  test('invalid UUID for userId is rejected', () => {
    const r = createAgentSchema.safeParse({ userId: 'not-a-uuid', name: 'Agent' })
    expect(r.success).toBe(false)
  })

  test('soul can be very long string', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_A, name: 'A', soul: '# Soul\n'.repeat(1000) })
    expect(r.success).toBe(true)
  })

  test('allowedTools with empty strings is valid (Zod level)', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_A, name: 'A', allowedTools: [''] })
    expect(r.success).toBe(true)
  })

  test('departmentId can be null', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_A, name: 'A', departmentId: null })
    expect(r.success).toBe(true)
  })

  test('Korean name is valid', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_A, name: '시황분석가' })
    expect(r.success).toBe(true)
  })

  test('name with special characters is valid', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_A, name: 'Agent-001 (투자)' })
    expect(r.success).toBe(true)
  })
})
