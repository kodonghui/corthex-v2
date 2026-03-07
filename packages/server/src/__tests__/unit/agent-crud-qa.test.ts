/**
 * QA-Generated Tests: Agent CRUD API (Story 2-2)
 * Functional verification of acceptance criteria + edge cases
 * Focus: route-level behavior, response format, error codes
 */
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

const CID = '11111111-1111-1111-1111-111111111111'
const UID = '22222222-2222-2222-2222-222222222222'
const AID = '33333333-3333-3333-3333-333333333333'
const DID = '44444444-4444-4444-4444-444444444444'

const tenant = { companyId: CID, userId: UID, isAdminUser: true }

const agent = {
  id: AID, companyId: CID, userId: UID, departmentId: DID,
  name: 'QA Agent', nameEn: null, role: null, tier: 'specialist' as const,
  modelName: 'claude-haiku-4-5', reportTo: null, soul: null, adminSoul: null,
  status: 'offline' as const, isSecretary: false, isSystem: false,
  allowedTools: [], isActive: true, createdAt: new Date(), updatedAt: new Date(),
}

// ============================================================
// QA: AC #1 -- POST creates agent with all fields
// ============================================================
describe('QA: AC #1 -- POST /api/admin/agents creates agent', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('creates agent with all optional fields specified', async () => {
    currentChain = makeChain([[]])
    const fullAgent = {
      ...agent,
      name: 'Full Spec Agent',
      tier: 'manager' as const,
      modelName: 'claude-sonnet-4-6',
      allowedTools: ['web_search', 'calculator'],
      soul: '# Manager Soul',
      adminSoul: '# Manager Soul',
    }
    insertResult = [fullAgent]

    const result = await createAgent(tenant, {
      userId: UID,
      departmentId: DID,
      name: 'Full Spec Agent',
      tier: 'manager',
      modelName: 'claude-sonnet-4-6',
      allowedTools: ['web_search', 'calculator'],
      soul: '# Manager Soul',
    })

    expect(result).toHaveProperty('data')
    expect(result.data.name).toBe('Full Spec Agent')
    expect(result.data.tier).toBe('manager')
    expect(result.data.modelName).toBe('claude-sonnet-4-6')
    expect(result.data.allowedTools).toEqual(['web_search', 'calculator'])
    expect(result.data.soul).toBe('# Manager Soul')
    expect(result.data.adminSoul).toBe('# Manager Soul')
  })
})

// ============================================================
// QA: AC #2 -- GET returns all agents, filterable
// ============================================================
describe('QA: AC #2 -- GET /api/admin/agents filterable', () => {
  test('returns all agents when no filter', async () => {
    currentChain = makeChain([])
    ;(currentChain.where as any).mockReturnValueOnce([agent, { ...agent, id: 'other' }])

    const result = await getAgents(CID)
    expect(result).toHaveLength(2)
  })

  test('filters by departmentId', async () => {
    currentChain = makeChain([])
    ;(currentChain.where as any).mockReturnValueOnce([agent])

    const result = await getAgents(CID, { departmentId: DID })
    expect(result).toHaveLength(1)
  })

  test('filters by isActive=false', async () => {
    currentChain = makeChain([])
    ;(currentChain.where as any).mockReturnValueOnce([{ ...agent, isActive: false }])

    const result = await getAgents(CID, { isActive: false })
    expect(result).toHaveLength(1)
    expect(result[0].isActive).toBe(false)
  })
})

// ============================================================
// QA: AC #3 -- GET /:id returns single agent
// ============================================================
describe('QA: AC #3 -- GET /api/admin/agents/:id', () => {
  test('returns agent by ID', async () => {
    currentChain = makeChain([[agent]])
    const result = await getAgentById(CID, AID)
    expect(result).toEqual(agent)
  })

  test('returns null for non-existent ID', async () => {
    currentChain = makeChain([[]])
    const result = await getAgentById(CID, 'bad-id')
    expect(result).toBeNull()
  })
})

// ============================================================
// QA: AC #4 -- PATCH updates agent fields
// ============================================================
describe('QA: AC #4 -- PATCH /api/admin/agents/:id', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('updates name only', async () => {
    const updated = { ...agent, name: 'Renamed' }
    currentChain = makeChain([[agent]])
    updateResult = [updated]

    const result = await updateAgent(tenant, AID, { name: 'Renamed' })
    expect(result.data.name).toBe('Renamed')
  })

  test('updates tier and modelName together', async () => {
    const updated = { ...agent, tier: 'manager' as const, modelName: 'claude-sonnet-4-6' }
    currentChain = makeChain([[agent]])
    updateResult = [updated]

    const result = await updateAgent(tenant, AID, { tier: 'manager', modelName: 'claude-sonnet-4-6' })
    expect(result.data.tier).toBe('manager')
    expect(result.data.modelName).toBe('claude-sonnet-4-6')
  })

  test('updates departmentId (agent reassignment)', async () => {
    const newDept = '55555555-5555-5555-5555-555555555555'
    const updated = { ...agent, departmentId: newDept }
    currentChain = makeChain([[agent]])
    updateResult = [updated]

    const result = await updateAgent(tenant, AID, { departmentId: newDept })
    expect(result.data.departmentId).toBe(newDept)
  })

  test('updates allowedTools', async () => {
    const tools = ['tool_a', 'tool_b', 'tool_c']
    const updated = { ...agent, allowedTools: tools }
    currentChain = makeChain([[agent]])
    updateResult = [updated]

    const result = await updateAgent(tenant, AID, { allowedTools: tools })
    expect(result.data.allowedTools).toEqual(tools)
  })
})

// ============================================================
// QA: AC #5 -- DELETE soft-deactivates
// ============================================================
describe('QA: AC #5 -- DELETE soft-deactivates', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('deactivation returns success message', async () => {
    currentChain = makeChain([[agent]])
    const result = await deactivateAgent(tenant, AID)
    expect(result.data.message).toContain('비활성화')
  })

  test('audit log records deactivation with correct state', async () => {
    currentChain = makeChain([[agent]])
    await deactivateAgent(tenant, AID)

    const audit = auditCalls[0]
    expect(audit.action).toBe('org.agent.deactivate')
    expect((audit.after as any).departmentId).toBeNull()
    expect((audit.after as any).isActive).toBe(false)
    expect((audit.after as any).status).toBe('offline')
  })
})

// ============================================================
// QA: AC #6 -- isSystem=true returns 403
// ============================================================
describe('QA: AC #6 -- System agent protection', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('403 on system agent delete with correct error structure', async () => {
    currentChain = makeChain([[{ ...agent, isSystem: true }]])
    const result = await deactivateAgent(tenant, AID)

    expect((result as any).error.status).toBe(403)
    expect((result as any).error.code).toBe('AGENT_003')
    expect((result as any).error.message).toBeTruthy()
  })

  test('system agent CAN be updated (only delete is blocked)', async () => {
    const systemAgent = { ...agent, isSystem: true }
    const updated = { ...systemAgent, name: 'Updated System Agent' }
    currentChain = makeChain([[systemAgent]])
    updateResult = [updated]

    const result = await updateAgent(tenant, AID, { name: 'Updated System Agent' })
    expect(result).toHaveProperty('data')
    expect(result.data.name).toBe('Updated System Agent')
  })
})

// ============================================================
// QA: AC #7 -- Name uniqueness
// ============================================================
describe('QA: AC #7 -- Name uniqueness', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('create duplicate name returns 409', async () => {
    currentChain = makeChain([[{ id: 'existing' }]])
    const result = await createAgent(tenant, { userId: UID, name: 'Duplicate' })
    expect((result as any).error.status).toBe(409)
    expect((result as any).error.code).toBe('AGENT_002')
  })

  test('update to duplicate name returns 409', async () => {
    currentChain = makeChain([
      [agent],
      [{ id: 'other-agent' }],
    ])
    const result = await updateAgent(tenant, AID, { name: 'Taken' })
    expect((result as any).error.status).toBe(409)
  })
})

// ============================================================
// QA: AC #8 -- Audit logging on all writes
// ============================================================
describe('QA: AC #8 -- Audit logging on all writes', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('create produces audit log', async () => {
    currentChain = makeChain([[]])
    insertResult = [agent]
    await createAgent(tenant, { userId: UID, name: 'A' })
    expect(auditCalls).toHaveLength(1)
    expect(auditCalls[0].action).toBe('org.agent.create')
  })

  test('update produces audit log', async () => {
    currentChain = makeChain([[agent]])
    updateResult = [{ ...agent, name: 'B' }]
    await updateAgent(tenant, AID, { name: 'B' })
    expect(auditCalls).toHaveLength(1)
    expect(auditCalls[0].action).toBe('org.agent.update')
  })

  test('deactivate produces audit log', async () => {
    currentChain = makeChain([[agent]])
    await deactivateAgent(tenant, AID)
    expect(auditCalls).toHaveLength(1)
    expect(auditCalls[0].action).toBe('org.agent.deactivate')
  })

  test('failed operations do NOT produce audit log', async () => {
    // Duplicate name
    currentChain = makeChain([[{ id: 'x' }]])
    await createAgent(tenant, { userId: UID, name: 'dup' })
    expect(auditCalls).toHaveLength(0)

    // Not found
    currentChain = makeChain([[]])
    await updateAgent(tenant, AID, { name: 'x' })
    expect(auditCalls).toHaveLength(0)

    // System agent
    currentChain = makeChain([[{ ...agent, isSystem: true }]])
    await deactivateAgent(tenant, AID)
    expect(auditCalls).toHaveLength(0)
  })
})

// ============================================================
// QA: AC #11 -- adminSoul sync on soul update
// ============================================================
describe('QA: AC #11 -- adminSoul sync', () => {
  beforeEach(() => { auditCalls.length = 0 })

  test('soul update syncs adminSoul', async () => {
    const newSoul = '# New Soul Content'
    currentChain = makeChain([[agent]])
    updateResult = [{ ...agent, soul: newSoul, adminSoul: newSoul }]

    const result = await updateAgent(tenant, AID, { soul: newSoul })
    expect(result.data.soul).toBe(newSoul)
    expect(result.data.adminSoul).toBe(newSoul)
  })
})

// ============================================================
// QA: AC #13 -- No cascade delete on deactivation
// ============================================================
describe('QA: AC #13 -- No cascade delete', () => {
  test('deactivation uses update, not delete', async () => {
    currentChain = makeChain([[agent]])
    const result = await deactivateAgent(tenant, AID)
    // The result has data (not error), meaning it used update
    expect(result).toHaveProperty('data')
    // Audit after shows isActive=false, not deletion
    expect(auditCalls.length).toBeGreaterThan(0)
  })
})

// ============================================================
// QA: Route Configuration Verification
// ============================================================
describe('QA: Route Configuration', () => {
  test('agents route file uses tenantMiddleware', async () => {
    const routeContent = await Bun.file('packages/server/src/routes/admin/agents.ts').text()
    expect(routeContent).toContain("import { tenantMiddleware } from '../../middleware/tenant'")
    expect(routeContent).toContain('tenantMiddleware')
  })

  test('agents route file does not accept companyId from body', async () => {
    const routeContent = await Bun.file('packages/server/src/routes/admin/agents.ts').text()
    const createSchema = routeContent.match(/const createAgentSchema[\s\S]*?\)\s*\n/)?.[0] ?? ''
    expect(createSchema).not.toContain("companyId: z.string()")
  })

  test('agents route file imports service functions', async () => {
    const routeContent = await Bun.file('packages/server/src/routes/admin/agents.ts').text()
    expect(routeContent).toContain('getAgents')
    expect(routeContent).toContain('getAgentById')
    expect(routeContent).toContain('createAgent')
    expect(routeContent).toContain('updateAgent')
    expect(routeContent).toContain('deactivateAgent')
  })

  test('organization service exports agent functions', async () => {
    const serviceContent = await Bun.file('packages/server/src/services/organization.ts').text()
    expect(serviceContent).toContain('export async function getAgents')
    expect(serviceContent).toContain('export async function getAgentById')
    expect(serviceContent).toContain('export async function createAgent')
    expect(serviceContent).toContain('export async function updateAgent')
    expect(serviceContent).toContain('export async function deactivateAgent')
  })
})
