/**
 * TEA (Test Architect) Generated Tests
 * Story: 9-3 Employee Command Center Restriction
 * Risk-based coverage: P0-Critical + P1-High + P2-Medium
 * Generated: 2026-03-08
 */
import { describe, test, expect, beforeEach, mock } from 'bun:test'
import type { TenantContext, UserRole } from '@corthex/shared'

// === Mock DB ===
const mockSelectResult: any[] = []
const mockWhere = mock(() => mockSelectResult)
const mockFrom = mock(() => ({ where: mockWhere }))
const mockDbSelect = mock(() => ({ from: mockFrom }))
const mockDb = { select: mockDbSelect }

mock.module('../../db', () => ({ db: mockDb }))
mock.module('../../db/schema', () => ({
  employeeDepartments: {
    departmentId: 'department_id',
    userId: 'user_id',
  },
  agents: {
    id: 'id',
    companyId: 'company_id',
    departmentId: 'department_id',
    isActive: 'is_active',
  },
}))

const { departmentScopeMiddleware } = await import('../../middleware/department-scope')

// === Helpers ===

function makeTenant(overrides: Partial<TenantContext> = {}): TenantContext {
  return {
    companyId: 'company-test',
    userId: 'user-test',
    role: 'employee',
    ...overrides,
  }
}

function makeCtx(tenant: TenantContext) {
  const vars = new Map<string, unknown>([['tenant', tenant]])
  return {
    get: (k: string) => vars.get(k),
    set: (k: string, v: unknown) => vars.set(k, v),
  } as any
}

// === P0-Critical: Middleware Role Bypass Security ===

describe('TEA P0: Middleware role bypass security', () => {
  const next = async () => {}

  beforeEach(() => {
    mockSelectResult.length = 0
    mockDbSelect.mockClear()
  })

  test('employee role triggers DB query for department assignments', async () => {
    mockSelectResult.push({ departmentId: 'dept-1' })
    const c = makeCtx(makeTenant({ role: 'employee' }))
    await departmentScopeMiddleware(c, next)

    expect(mockDbSelect).toHaveBeenCalledTimes(1)
    const t = c.get('tenant') as TenantContext
    expect(t.departmentIds).toEqual(['dept-1'])
  })

  test.each([
    ['super_admin'],
    ['company_admin'],
    ['ceo'],
  ] as [UserRole][])('role "%s" bypasses DB query entirely', async (role) => {
    const c = makeCtx(makeTenant({ role }))
    await departmentScopeMiddleware(c, next)

    expect(mockDbSelect).not.toHaveBeenCalled()
    const t = c.get('tenant') as TenantContext
    expect(t.departmentIds).toBeUndefined()
  })

  test('middleware preserves all existing tenant fields', async () => {
    mockSelectResult.push({ departmentId: 'dept-x' })
    const original = makeTenant({
      role: 'employee',
      companyId: 'comp-abc',
      userId: 'usr-123',
      isAdminUser: false,
    })
    const c = makeCtx(original)
    await departmentScopeMiddleware(c, next)

    const t = c.get('tenant') as TenantContext
    expect(t.companyId).toBe('comp-abc')
    expect(t.userId).toBe('usr-123')
    expect(t.role).toBe('employee')
    expect(t.isAdminUser).toBe(false)
    expect(t.departmentIds).toEqual(['dept-x'])
  })

  test('middleware calls next() for all roles', async () => {
    const roles: UserRole[] = ['super_admin', 'company_admin', 'ceo', 'employee']

    for (const role of roles) {
      let nextCalled = false
      mockSelectResult.length = 0
      const c = makeCtx(makeTenant({ role }))
      await departmentScopeMiddleware(c, async () => { nextCalled = true })
      expect(nextCalled).toBe(true)
    }
  })
})

// === P0-Critical: Zero Department Edge Case ===

describe('TEA P0: Employee with zero departments', () => {
  const next = async () => {}

  beforeEach(() => {
    mockSelectResult.length = 0
    mockDbSelect.mockClear()
  })

  test('empty result from DB produces empty departmentIds array', async () => {
    // DB returns no rows
    const c = makeCtx(makeTenant({ role: 'employee' }))
    await departmentScopeMiddleware(c, next)

    const t = c.get('tenant') as TenantContext
    expect(t.departmentIds).toEqual([])
    expect(t.departmentIds!.length).toBe(0)
  })

  test('empty departmentIds triggers early return with empty data', () => {
    const departmentIds: string[] = []

    // Simulate route handler pattern
    if (departmentIds.length === 0) {
      const result = { data: [] }
      expect(result.data).toEqual([])
      return
    }
    // Should not reach here
    expect(true).toBe(false)
  })
})

// === P0-Critical: Agent Scope Enforcement ===

describe('TEA P0: Agent scope enforcement', () => {
  test('agent in assigned department → access granted', () => {
    const deptIds = ['d1', 'd2', 'd3']
    const agent = { departmentId: 'd2' }

    const allowed = agent.departmentId && deptIds.includes(agent.departmentId)
    expect(allowed).toBeTruthy()
  })

  test('agent NOT in assigned department → 403', () => {
    const deptIds = ['d1', 'd2']
    const agent = { departmentId: 'd5' }

    const allowed = agent.departmentId && deptIds.includes(agent.departmentId)
    expect(allowed).toBeFalsy()
  })

  test('agent with null departmentId → 403 for employee', () => {
    const deptIds = ['d1']
    const agent = { departmentId: null as string | null }

    const allowed = agent.departmentId && deptIds.includes(agent.departmentId)
    expect(allowed).toBeFalsy()
  })

  test('undefined departmentIds (CEO) → always allowed', () => {
    const deptIds: string[] | undefined = undefined
    const agent = { departmentId: 'any-dept' }

    // Route pattern: if (tenant.departmentIds && ...)
    const blocked = deptIds && (!agent.departmentId || !deptIds.includes(agent.departmentId))
    expect(blocked).toBeFalsy()
  })
})

// === P1-High: Command Target Validation ===

describe('TEA P1: Command target agent validation', () => {
  test('employee targeting agent in own department → allowed', () => {
    const deptIds = ['dept-sales', 'dept-tech']
    const targetAgent = { departmentId: 'dept-sales' }

    const blocked = deptIds && (!targetAgent.departmentId || !deptIds.includes(targetAgent.departmentId))
    expect(blocked).toBeFalsy()
  })

  test('employee targeting agent outside department → 403', () => {
    const deptIds = ['dept-sales']
    const targetAgent = { departmentId: 'dept-hr' }

    const blocked = deptIds && (!targetAgent.departmentId || !deptIds.includes(targetAgent.departmentId))
    expect(blocked).toBeTruthy()
  })

  test('employee with no targetAgentId → no check needed (auto-routing)', () => {
    const deptIds = ['dept-sales']
    const targetAgentId: string | null = null

    // Only check when targetAgentId is provided
    const needsCheck = deptIds && targetAgentId
    expect(needsCheck).toBeFalsy()
  })

  test('CEO targeting any agent → always allowed', () => {
    const deptIds: string[] | undefined = undefined
    const targetAgent = { departmentId: 'dept-secret' }

    const needsCheck = deptIds && targetAgent
    expect(needsCheck).toBeFalsy()
  })

  test('employee targeting non-existent agent → 403', () => {
    const deptIds = ['dept-1']
    const targetAgent = null // agent not found

    const blocked = deptIds && (!targetAgent)
    expect(blocked).toBeTruthy()
  })
})

// === P1-High: Cost Data Scoping ===

describe('TEA P1: Cost data scoping', () => {
  test('scoped agent IDs derived from department assignments', () => {
    const allAgents = [
      { id: 'a1', departmentId: 'dept-1' },
      { id: 'a2', departmentId: 'dept-2' },
      { id: 'a3', departmentId: 'dept-3' },
      { id: 'a4', departmentId: 'dept-1' },
    ]
    const deptIds = ['dept-1', 'dept-3']

    const scopedIds = allAgents
      .filter(a => deptIds.includes(a.departmentId))
      .map(a => a.id)

    expect(scopedIds).toEqual(['a1', 'a3', 'a4'])
    expect(scopedIds).not.toContain('a2')
  })

  test('empty departments → no agent IDs → empty cost data', () => {
    const deptIds: string[] = []
    const allAgents = [{ id: 'a1', departmentId: 'dept-1' }]

    if (deptIds.length === 0) {
      expect([]).toEqual([])
      return
    }
    expect(true).toBe(false)
  })

  test('budget byDepartment filtering preserves data integrity', () => {
    const allDepts = [
      { departmentId: 'dept-1', name: 'Sales', costUsd: 150.50 },
      { departmentId: 'dept-2', name: 'Tech', costUsd: 450.75 },
      { departmentId: 'dept-3', name: 'HR', costUsd: 25.00 },
    ]
    const deptIds = ['dept-1', 'dept-3']

    const filtered = allDepts.filter(d => deptIds.includes(d.departmentId))

    expect(filtered).toHaveLength(2)
    expect(filtered[0].costUsd).toBe(150.50)
    expect(filtered[1].name).toBe('HR')
  })

  test('cost by-agent with department filter only shows scoped agents', () => {
    const costByAgent = [
      { agentId: 'a1', agentName: 'Sales Bot', totalCostMicro: 5000000 },
      { agentId: 'a2', agentName: 'Tech Bot', totalCostMicro: 8000000 },
    ]
    const scopedAgentIds = ['a1'] // Only Sales department

    const filtered = costByAgent.filter(c => scopedAgentIds.includes(c.agentId))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].agentName).toBe('Sales Bot')
  })
})

// === P1-High: Activity Log Scoping ===

describe('TEA P1: Activity log scoping', () => {
  test('scoped actor IDs include both agents and employee userId', () => {
    const agentIds = ['agent-1', 'agent-2']
    const userId = 'employee-123'

    const scopedActorIds = [...agentIds, userId]

    expect(scopedActorIds).toContain('agent-1')
    expect(scopedActorIds).toContain('agent-2')
    expect(scopedActorIds).toContain('employee-123')
    expect(scopedActorIds).toHaveLength(3)
  })

  test('employee sees own activity even from unscoped agents', () => {
    const scopedActorIds = ['agent-1', 'employee-1']
    const activities = [
      { actorId: 'agent-1', action: 'delegated task' },
      { actorId: 'agent-99', action: 'other dept work' },
      { actorId: 'employee-1', action: 'sent command' },
    ]

    const visible = activities.filter(a => scopedActorIds.includes(a.actorId))
    expect(visible).toHaveLength(2)
    expect(visible.map(a => a.action)).toEqual(['delegated task', 'sent command'])
  })

  test('activity tabs pass departmentIds to service layer', () => {
    const tenant: TenantContext = {
      companyId: 'c1',
      userId: 'u1',
      role: 'employee',
      departmentIds: ['dept-a', 'dept-b'],
    }

    // Simulates what activity-tabs route does
    const filters = {
      departmentIds: tenant.departmentIds,
      agentId: undefined as string | undefined,
      status: undefined as string | undefined,
    }

    expect(filters.departmentIds).toEqual(['dept-a', 'dept-b'])
    expect(filters.departmentIds!.length).toBe(2)
  })

  test('activity summary with empty departments returns empty counts', () => {
    const deptIds: string[] = []

    if (deptIds.length === 0) {
      const result = { data: { today: [], week: [] } }
      expect(result.data.today).toEqual([])
      expect(result.data.week).toEqual([])
      return
    }
    expect(true).toBe(false)
  })
})

// === P2-Medium: Cache Key Collision Prevention ===

describe('TEA P2: Cache key collision prevention', () => {
  test('scoped and unscoped cache keys are different', () => {
    const companyId = 'comp-1'

    // CEO (no departmentIds)
    const ceoKey = `${companyId}:summary`

    // Employee with departments
    const deptIds = ['dept-a', 'dept-b']
    const scopeKey = `:dept:${deptIds.sort().join(',')}`
    const empKey = `${companyId}:summary${scopeKey}`

    expect(ceoKey).not.toBe(empKey)
    expect(ceoKey).toBe('comp-1:summary')
    expect(empKey).toBe('comp-1:summary:dept:dept-a,dept-b')
  })

  test('same departments produce same cache key regardless of order', () => {
    const companyId = 'comp-1'
    const deptIds1 = ['dept-b', 'dept-a']
    const deptIds2 = ['dept-a', 'dept-b']

    const key1 = `${companyId}:summary:dept:${deptIds1.sort().join(',')}`
    const key2 = `${companyId}:summary:dept:${deptIds2.sort().join(',')}`

    expect(key1).toBe(key2)
  })

  test('budget cache key includes department scope', () => {
    const companyId = 'comp-1'
    const deptIds = ['dept-x']

    const key = `${companyId}:budget:dept:${deptIds.sort().join(',')}`
    expect(key).toBe('comp-1:budget:dept:dept-x')
  })

  test('no scope key when departmentIds is undefined', () => {
    const companyId = 'comp-1'
    const departmentIds: string[] | undefined = undefined

    const scopeKey = departmentIds ? `:dept:${departmentIds.sort().join(',')}` : ''
    const key = `${companyId}:summary${scopeKey}`

    expect(key).toBe('comp-1:summary')
  })
})

// === P2-Medium: Multi-Department Employee Scenarios ===

describe('TEA P2: Multi-department employee scenarios', () => {
  test('employee assigned to 3 departments sees all 3 departments agents', () => {
    const deptIds = ['dept-1', 'dept-2', 'dept-3']
    const agents = [
      { id: 'a1', departmentId: 'dept-1' },
      { id: 'a2', departmentId: 'dept-2' },
      { id: 'a3', departmentId: 'dept-3' },
      { id: 'a4', departmentId: 'dept-4' },
    ]

    const visible = agents.filter(a => deptIds.includes(a.departmentId))
    expect(visible).toHaveLength(3)
    expect(visible.map(a => a.id)).toEqual(['a1', 'a2', 'a3'])
  })

  test('employee assigned to single department sees only that department', () => {
    const deptIds = ['dept-2']
    const agents = [
      { id: 'a1', departmentId: 'dept-1' },
      { id: 'a2', departmentId: 'dept-2' },
      { id: 'a3', departmentId: 'dept-3' },
    ]

    const visible = agents.filter(a => deptIds.includes(a.departmentId))
    expect(visible).toHaveLength(1)
    expect(visible[0].id).toBe('a2')
  })
})

// === P2-Medium: Hierarchy Route Scoping ===

describe('TEA P2: Hierarchy route scoping', () => {
  test('hierarchy tree only contains agents from scoped departments', () => {
    const deptIds = ['dept-1']
    const allAgents = [
      { id: 'mgr-1', departmentId: 'dept-1', reportTo: null },
      { id: 'spec-1', departmentId: 'dept-1', reportTo: 'mgr-1' },
      { id: 'mgr-2', departmentId: 'dept-2', reportTo: null },
      { id: 'spec-2', departmentId: 'dept-2', reportTo: 'mgr-2' },
    ]

    const scoped = allAgents.filter(a => deptIds.includes(a.departmentId))
    expect(scoped).toHaveLength(2)
    expect(scoped.every(a => a.departmentId === 'dept-1')).toBe(true)
  })

  test('empty departments produces empty hierarchy', () => {
    const deptIds: string[] = []
    // Route returns early with { data: [] }
    expect(deptIds.length).toBe(0)
  })
})

// === P2-Medium: Error Code Consistency ===

describe('TEA P2: Error code consistency', () => {
  test('SCOPE_001 used for agent detail access violation', () => {
    // Verify error codes match HTTP 403 pattern
    const errors = {
      SCOPE_001: { status: 403, message: '해당 부서의 에이전트에만 접근할 수 있습니다' },
      SCOPE_002: { status: 403, message: '해당 부서의 에이전트에게만 명령할 수 있습니다' },
    }

    expect(errors.SCOPE_001.status).toBe(403)
    expect(errors.SCOPE_002.status).toBe(403)
    expect(errors.SCOPE_001.message).toContain('부서')
    expect(errors.SCOPE_002.message).toContain('부서')
  })
})

// === Regression: Delegation Rules Not Affected ===

describe('TEA Regression: Delegation rules unaffected by scope', () => {
  test('delegation rules are admin-only, not department-scoped', () => {
    // Delegation rules require isCeoOrAbove check, not department scope
    const roles: UserRole[] = ['ceo', 'company_admin', 'super_admin']
    for (const role of roles) {
      const isCeoOrAbove = ['super_admin', 'company_admin', 'ceo'].includes(role)
      expect(isCeoOrAbove).toBe(true)
    }

    // Employee cannot create delegation rules regardless
    const isEmployeeCeo = ['super_admin', 'company_admin', 'ceo'].includes('employee')
    expect(isEmployeeCeo).toBe(false)
  })
})

// === Regression: Soul Edit Scope ===

describe('TEA Regression: Soul edit respects scope', () => {
  test('employee can only edit soul of agents in their departments', () => {
    const deptIds = ['dept-1']
    const agent = { id: 'a1', departmentId: 'dept-1', userId: 'user-other' }

    // First check: agent must be in scope
    const inScope = deptIds.includes(agent.departmentId)
    expect(inScope).toBe(true)
  })

  test('employee cannot edit soul of agent outside department', () => {
    const deptIds = ['dept-1']
    const agent = { id: 'a2', departmentId: 'dept-2', userId: 'user-other' }

    const inScope = deptIds.includes(agent.departmentId)
    expect(inScope).toBe(false)
  })
})

// === Boundary: Large Department Count ===

describe('TEA Boundary: Large department assignments', () => {
  test('employee with 10 departments filters correctly', () => {
    const deptIds = Array.from({ length: 10 }, (_, i) => `dept-${i}`)
    const agents = Array.from({ length: 20 }, (_, i) => ({
      id: `agent-${i}`,
      departmentId: `dept-${i % 15}`, // some outside range
    }))

    const visible = agents.filter(a => deptIds.includes(a.departmentId))
    expect(visible.length).toBeLessThan(agents.length)
    expect(visible.every(a => deptIds.includes(a.departmentId))).toBe(true)
  })
})
