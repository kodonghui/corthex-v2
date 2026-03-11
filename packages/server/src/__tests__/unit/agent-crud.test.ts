import { describe, test, expect, beforeEach, mock } from 'bun:test'

// ============================================================
// Mock Setup
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
    select: mock(() => {
      return currentChain
    }),
    insert: mock(() => ({
      values: mock((data: unknown) => ({
        returning: mock(() => insertResult),
      })),
    })),
    update: mock(() => ({
      set: mock((data: unknown) => ({
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

const COMPANY_ID = '11111111-1111-1111-1111-111111111111'
const USER_ID = '22222222-2222-2222-2222-222222222222'
const AGENT_ID = '33333333-3333-3333-3333-333333333333'
const DEPT_ID = '44444444-4444-4444-4444-444444444444'

const tenant = { companyId: COMPANY_ID, userId: USER_ID, isAdminUser: true }

const sampleAgent = {
  id: AGENT_ID,
  companyId: COMPANY_ID,
  userId: USER_ID,
  departmentId: DEPT_ID,
  name: 'Test Agent',
  nameEn: 'Test Agent EN',
  role: 'Analyst',
  tier: 'specialist' as const,
  modelName: 'claude-haiku-4-5',
  reportTo: null,
  soul: '# Test Soul',
  adminSoul: '# Test Soul',
  status: 'offline' as const,
  ownerUserId: null,
  isSecretary: false,
  isSystem: false,
  allowedTools: ['web_search'],
  autoLearn: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ============================================================
// Service Function Tests
// ============================================================

describe('Agent CRUD Service Functions', () => {
  beforeEach(() => {
    auditCalls.length = 0
    selectResults = []
    insertResult = []
    updateResult = []
  })

  describe('getAgents', () => {
    test('returns agents for company', async () => {
      currentChain = makeChain([])
      // getAgents doesn't use .limit() - it uses .where() which returns the chain
      // We need to make where() return the results
      ;(currentChain.where as any).mockReturnValueOnce([sampleAgent])
      const result = await getAgents(COMPANY_ID)
      expect(result).toEqual([sampleAgent])
    })

    test('accepts departmentId filter', async () => {
      currentChain = makeChain([])
      ;(currentChain.where as any).mockReturnValueOnce([sampleAgent])
      const result = await getAgents(COMPANY_ID, { departmentId: DEPT_ID })
      expect(result).toEqual([sampleAgent])
    })

    test('accepts isActive filter', async () => {
      currentChain = makeChain([])
      ;(currentChain.where as any).mockReturnValueOnce([])
      const result = await getAgents(COMPANY_ID, { isActive: false })
      expect(result).toEqual([])
    })

    test('accepts unassigned filter', async () => {
      currentChain = makeChain([])
      ;(currentChain.where as any).mockReturnValueOnce([])
      const result = await getAgents(COMPANY_ID, { departmentId: 'unassigned' })
      expect(result).toEqual([])
    })
  })

  describe('getAgentById', () => {
    test('returns agent when found', async () => {
      currentChain = makeChain([[sampleAgent]])
      const result = await getAgentById(COMPANY_ID, AGENT_ID)
      expect(result).toEqual(sampleAgent)
    })

    test('returns null when not found', async () => {
      currentChain = makeChain([[]])
      const result = await getAgentById(COMPANY_ID, 'nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('createAgent', () => {
    test('creates agent and produces audit log', async () => {
      currentChain = makeChain([[]])  // no duplicate
      insertResult = [sampleAgent]

      const result = await createAgent(tenant, {
        userId: USER_ID,
        departmentId: DEPT_ID,
        name: 'Test Agent',
        tier: 'specialist',
        modelName: 'claude-haiku-4-5',
        allowedTools: ['web_search'],
        soul: '# Test Soul',
      })

      expect(result).toHaveProperty('data')
      expect(result.data).toEqual(sampleAgent)
      expect(auditCalls).toHaveLength(1)
      expect(auditCalls[0].action).toBe('org.agent.create')
      expect(auditCalls[0].targetType).toBe('agent')
      expect(auditCalls[0].targetId).toBe(AGENT_ID)
    })

    test('rejects duplicate name within same company', async () => {
      currentChain = makeChain([[{ id: 'existing-id' }]])  // duplicate found

      const result = await createAgent(tenant, {
        userId: USER_ID,
        name: 'Duplicate Agent',
      })

      expect(result).toHaveProperty('error')
      const err = (result as any).error
      expect(err.status).toBe(409)
      expect(err.code).toBe('AGENT_002')
      expect(auditCalls).toHaveLength(0)
    })

    test('sets defaults for tier and modelName', async () => {
      currentChain = makeChain([[]])
      const agentWithDefaults = { ...sampleAgent, tier: 'specialist', modelName: 'claude-haiku-4-5' }
      insertResult = [agentWithDefaults]

      const result = await createAgent(tenant, {
        userId: USER_ID,
        name: 'Minimal Agent',
      })

      expect(result).toHaveProperty('data')
    })
  })

  describe('updateAgent', () => {
    test('updates agent and produces audit log with before/after', async () => {
      const updated = { ...sampleAgent, name: 'Updated Agent' }
      currentChain = makeChain([
        [sampleAgent],  // current agent found
        [],             // no duplicate name
      ])
      updateResult = [updated]

      const result = await updateAgent(tenant, AGENT_ID, { name: 'Updated Agent' })

      expect(result).toHaveProperty('data')
      expect(result.data).toEqual(updated)
      expect(auditCalls).toHaveLength(1)
      expect(auditCalls[0].action).toBe('org.agent.update')
      expect(auditCalls[0].before).toBeDefined()
      expect(auditCalls[0].after).toBeDefined()
    })

    test('returns 404 when agent not found', async () => {
      currentChain = makeChain([[]])  // not found

      const result = await updateAgent(tenant, 'nonexistent', { name: 'X' })

      expect(result).toHaveProperty('error')
      expect((result as any).error.status).toBe(404)
      expect((result as any).error.code).toBe('AGENT_001')
    })

    test('rejects duplicate name on update', async () => {
      currentChain = makeChain([
        [sampleAgent],        // current found
        [{ id: 'other-id' }], // duplicate found
      ])

      const result = await updateAgent(tenant, AGENT_ID, { name: 'Taken Name' })

      expect(result).toHaveProperty('error')
      expect((result as any).error.status).toBe(409)
    })

    test('syncs adminSoul when soul is updated', async () => {
      const updated = { ...sampleAgent, soul: '# New Soul', adminSoul: '# New Soul' }
      currentChain = makeChain([[sampleAgent]])
      updateResult = [updated]

      const result = await updateAgent(tenant, AGENT_ID, { soul: '# New Soul' })

      expect(result).toHaveProperty('data')
      expect(result.data.adminSoul).toBe('# New Soul')
    })

    test('skips name check when name not in update', async () => {
      const updated = { ...sampleAgent, role: 'New Role' }
      currentChain = makeChain([[sampleAgent]])  // only 1 select (no duplicate check)
      updateResult = [updated]

      const result = await updateAgent(tenant, AGENT_ID, { role: 'New Role' })

      expect(result).toHaveProperty('data')
      expect(result.data.role).toBe('New Role')
    })
  })

  describe('deactivateAgent', () => {
    test('deactivates normal agent (soft delete)', async () => {
      currentChain = makeChain([[sampleAgent]])

      const result = await deactivateAgent(tenant, AGENT_ID)

      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('message')
      expect(auditCalls).toHaveLength(1)
      expect(auditCalls[0].action).toBe('org.agent.deactivate')
      expect((auditCalls[0].after as any).departmentId).toBeNull()
      expect((auditCalls[0].after as any).isActive).toBe(false)
      expect((auditCalls[0].after as any).status).toBe('offline')
    })

    test('blocks system agent deletion with 403 (FR5)', async () => {
      const systemAgent = { ...sampleAgent, isSystem: true }
      currentChain = makeChain([[systemAgent]])

      const result = await deactivateAgent(tenant, AGENT_ID)

      expect(result).toHaveProperty('error')
      const err = (result as any).error
      expect(err.status).toBe(403)
      expect(err.code).toBe('AGENT_003')
      expect(err.message).toContain('시스템 에이전트')
      expect(auditCalls).toHaveLength(0)
    })

    test('blocks secretary agent deletion with 403 (Story 5.1)', async () => {
      const secretaryAgent = { ...sampleAgent, isSecretary: true }
      currentChain = makeChain([[secretaryAgent]])

      const result = await deactivateAgent(tenant, AGENT_ID)

      expect(result).toHaveProperty('error')
      const err = (result as any).error
      expect(err.status).toBe(403)
      expect(err.code).toBe('ORG_SECRETARY_DELETE_DENIED')
      expect(err.message).toContain('비서 에이전트')
      expect(auditCalls).toHaveLength(0)
    })

    test('returns 404 when agent not found', async () => {
      currentChain = makeChain([[]])

      const result = await deactivateAgent(tenant, 'nonexistent')

      expect(result).toHaveProperty('error')
      expect((result as any).error.status).toBe(404)
    })
  })
})

// ============================================================
// Zod Schema Validation Tests
// ============================================================

describe('Agent Route Zod Validation', () => {
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

  const updateAgentSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    nameEn: z.string().max(100).nullable().optional(),
    role: z.string().max(200).nullable().optional(),
    tier: z.enum(['manager', 'specialist', 'worker']).optional(),
    modelName: z.string().max(100).optional(),
    departmentId: z.string().uuid().nullable().optional(),
    allowedTools: z.array(z.string()).optional(),
    soul: z.string().nullable().optional(),
    status: z.enum(['online', 'working', 'error', 'offline']).optional(),
    isActive: z.boolean().optional(),
  })

  test('createAgentSchema: valid minimal input', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_ID, name: 'Agent' })
    expect(r.success).toBe(true)
  })

  test('createAgentSchema: rejects missing name', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_ID })
    expect(r.success).toBe(false)
  })

  test('createAgentSchema: rejects missing userId', () => {
    const r = createAgentSchema.safeParse({ name: 'Agent' })
    expect(r.success).toBe(false)
  })

  test('createAgentSchema: validates tier enum', () => {
    expect(createAgentSchema.safeParse({ userId: COMPANY_ID, name: 'A', tier: 'manager' }).success).toBe(true)
    expect(createAgentSchema.safeParse({ userId: COMPANY_ID, name: 'A', tier: 'boss' }).success).toBe(false)
  })

  test('createAgentSchema: validates allowedTools as string[]', () => {
    expect(createAgentSchema.safeParse({ userId: COMPANY_ID, name: 'A', allowedTools: ['a', 'b'] }).success).toBe(true)
    expect(createAgentSchema.safeParse({ userId: COMPANY_ID, name: 'A', allowedTools: [1, 2] }).success).toBe(false)
  })

  test('createAgentSchema: accepts all optional fields', () => {
    const r = createAgentSchema.safeParse({
      userId: COMPANY_ID,
      departmentId: DEPT_ID,
      name: 'Full Agent',
      nameEn: 'Full EN',
      role: 'Senior Analyst',
      tier: 'manager',
      modelName: 'claude-sonnet-4-6',
      allowedTools: ['web_search', 'calculator'],
      soul: '# Soul\nYou are helpful.',
    })
    expect(r.success).toBe(true)
  })

  test('updateAgentSchema: allows partial updates', () => {
    expect(updateAgentSchema.safeParse({ name: 'New Name' }).success).toBe(true)
  })

  test('updateAgentSchema: validates status enum', () => {
    expect(updateAgentSchema.safeParse({ status: 'working' }).success).toBe(true)
    expect(updateAgentSchema.safeParse({ status: 'sleeping' }).success).toBe(false)
  })

  test('updateAgentSchema: allows empty object', () => {
    expect(updateAgentSchema.safeParse({}).success).toBe(true)
  })

  test('updateAgentSchema: validates allowedTools', () => {
    expect(updateAgentSchema.safeParse({ allowedTools: ['tool_a'] }).success).toBe(true)
  })

  test('updateAgentSchema: allows tier change', () => {
    expect(updateAgentSchema.safeParse({ tier: 'worker', modelName: 'claude-haiku-4-5' }).success).toBe(true)
  })

  test('updateAgentSchema: allows departmentId null (unassign)', () => {
    expect(updateAgentSchema.safeParse({ departmentId: null }).success).toBe(true)
  })

  test('createAgentSchema: rejects empty name', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_ID, name: '' })
    expect(r.success).toBe(false)
  })

  test('createAgentSchema: rejects name > 100 chars', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_ID, name: 'A'.repeat(101) })
    expect(r.success).toBe(false)
  })

  test('createAgentSchema: rejects invalid UUID for departmentId', () => {
    const r = createAgentSchema.safeParse({ userId: COMPANY_ID, name: 'A', departmentId: 'not-uuid' })
    expect(r.success).toBe(false)
  })

  test('updateAgentSchema: rejects invalid tier', () => {
    expect(updateAgentSchema.safeParse({ tier: 'ceo' }).success).toBe(false)
  })
})
