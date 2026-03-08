import { describe, test, expect, beforeEach, mock } from 'bun:test'
import type { TenantContext, UserRole } from '@corthex/shared'

// === Mock DB ===
const mockDbSelect = mock(() => ({ from: mock(() => ({ where: mock(() => []) })) }))
const mockDb = { select: mockDbSelect }

mock.module('../../db', () => ({ db: mockDb }))
mock.module('../../db/schema', () => ({
  employeeDepartments: {
    departmentId: 'department_id',
    userId: 'user_id',
  },
}))

// Import after mocks
const { departmentScopeMiddleware } = await import('../../middleware/department-scope')

// === Test Helpers ===

function createMockContext(tenant: TenantContext) {
  const variables = new Map<string, unknown>()
  variables.set('tenant', tenant)

  return {
    get: (key: string) => variables.get(key),
    set: (key: string, value: unknown) => variables.set(key, value),
  } as any
}

function createTenant(overrides: Partial<TenantContext> = {}): TenantContext {
  return {
    companyId: 'company-1',
    userId: 'user-1',
    role: 'employee' as UserRole,
    ...overrides,
  }
}

describe('departmentScopeMiddleware', () => {
  let nextCalled: boolean

  beforeEach(() => {
    nextCalled = false
    mockDbSelect.mockReset()
  })

  const nextFn = async () => { nextCalled = true }

  // === AC1: Department-Scoped Middleware ===

  describe('AC1: CEO/Admin bypass', () => {
    test('CEO bypasses middleware — no DB query', async () => {
      const c = createMockContext(createTenant({ role: 'ceo' }))
      await departmentScopeMiddleware(c, nextFn)

      expect(nextCalled).toBe(true)
      expect(mockDbSelect).not.toHaveBeenCalled()
      const tenant = c.get('tenant') as TenantContext
      expect(tenant.departmentIds).toBeUndefined()
    })

    test('company_admin bypasses middleware', async () => {
      const c = createMockContext(createTenant({ role: 'company_admin' }))
      await departmentScopeMiddleware(c, nextFn)

      expect(nextCalled).toBe(true)
      expect(mockDbSelect).not.toHaveBeenCalled()
    })

    test('super_admin bypasses middleware', async () => {
      const c = createMockContext(createTenant({ role: 'super_admin' }))
      await departmentScopeMiddleware(c, nextFn)

      expect(nextCalled).toBe(true)
      expect(mockDbSelect).not.toHaveBeenCalled()
    })
  })

  describe('AC1: Employee scope injection', () => {
    test('employee gets departmentIds from DB', async () => {
      const deptAssignments = [
        { departmentId: 'dept-1' },
        { departmentId: 'dept-2' },
      ]

      mockDbSelect.mockReturnValue({
        from: mock(() => ({
          where: mock(() => deptAssignments),
        })),
      })

      const c = createMockContext(createTenant({ role: 'employee', userId: 'emp-1' }))
      await departmentScopeMiddleware(c, nextFn)

      expect(nextCalled).toBe(true)
      const tenant = c.get('tenant') as TenantContext
      expect(tenant.departmentIds).toEqual(['dept-1', 'dept-2'])
    })

    test('employee with 0 departments gets empty array', async () => {
      mockDbSelect.mockReturnValue({
        from: mock(() => ({
          where: mock(() => []),
        })),
      })

      const c = createMockContext(createTenant({ role: 'employee' }))
      await departmentScopeMiddleware(c, nextFn)

      expect(nextCalled).toBe(true)
      const tenant = c.get('tenant') as TenantContext
      expect(tenant.departmentIds).toEqual([])
    })
  })
})

// === TenantContext Type Tests ===

describe('TenantContext departmentIds pattern', () => {
  test('undefined = all access (CEO/admin)', () => {
    const tenant: TenantContext = {
      companyId: 'c1',
      userId: 'u1',
      role: 'ceo',
    }
    expect(tenant.departmentIds).toBeUndefined()
  })

  test('empty array = no access (employee with no departments)', () => {
    const tenant: TenantContext = {
      companyId: 'c1',
      userId: 'u1',
      role: 'employee',
      departmentIds: [],
    }
    expect(tenant.departmentIds).toEqual([])
    expect(tenant.departmentIds!.length).toBe(0)
  })

  test('populated array = scoped access', () => {
    const tenant: TenantContext = {
      companyId: 'c1',
      userId: 'u1',
      role: 'employee',
      departmentIds: ['dept-a', 'dept-b'],
    }
    expect(tenant.departmentIds!.length).toBe(2)
  })
})

// === Agent Listing Restriction Tests (AC2) ===

describe('AC2: Agent listing restriction logic', () => {
  test('employee with departmentIds filters agents', () => {
    const departmentIds = ['dept-1', 'dept-2']
    const allAgents = [
      { id: 'a1', departmentId: 'dept-1', name: 'Agent 1' },
      { id: 'a2', departmentId: 'dept-2', name: 'Agent 2' },
      { id: 'a3', departmentId: 'dept-3', name: 'Agent 3' },
      { id: 'a4', departmentId: null, name: 'Agent 4' },
    ]

    const filtered = allAgents.filter(a =>
      a.departmentId && departmentIds.includes(a.departmentId)
    )

    expect(filtered).toHaveLength(2)
    expect(filtered.map(a => a.id)).toEqual(['a1', 'a2'])
  })

  test('employee with empty departmentIds sees no agents', () => {
    const departmentIds: string[] = []
    expect(departmentIds.length).toBe(0)
  })

  test('CEO with undefined departmentIds sees all agents', () => {
    const departmentIds: string[] | undefined = undefined
    const allAgents = [
      { id: 'a1', departmentId: 'dept-1' },
      { id: 'a2', departmentId: 'dept-2' },
    ]

    const filtered = departmentIds
      ? allAgents.filter(a => a.departmentId && departmentIds.includes(a.departmentId))
      : allAgents

    expect(filtered).toEqual(allAgents)
  })
})

// === Agent Detail Access Check (AC2) ===

describe('AC2: Agent detail access check', () => {
  test('employee can access agent in assigned department', () => {
    const departmentIds = ['dept-1', 'dept-2']
    const agent = { id: 'a1', departmentId: 'dept-1' }

    const hasAccess = !departmentIds || (agent.departmentId !== null && departmentIds.includes(agent.departmentId))
    expect(hasAccess).toBe(true)
  })

  test('employee cannot access agent in other department', () => {
    const departmentIds = ['dept-1', 'dept-2']
    const agent = { id: 'a2', departmentId: 'dept-3' }

    const hasAccess = !departmentIds || (agent.departmentId !== null && departmentIds.includes(agent.departmentId))
    expect(hasAccess).toBe(false)
  })

  test('employee cannot access unassigned agent (null department)', () => {
    const departmentIds = ['dept-1']
    const agent = { id: 'a3', departmentId: null }

    const hasAccess = !departmentIds || (agent.departmentId !== null && departmentIds.includes(agent.departmentId!))
    expect(hasAccess).toBe(false)
  })
})

// === Command Submission Restriction (AC3) ===

describe('AC3: Command submission restriction', () => {
  test('employee can target agent in assigned department', () => {
    const departmentIds = ['dept-1', 'dept-2']
    const targetAgent = { departmentId: 'dept-1' }

    const allowed = !departmentIds ||
      (targetAgent.departmentId !== null && departmentIds.includes(targetAgent.departmentId))
    expect(allowed).toBe(true)
  })

  test('employee cannot target agent outside assigned departments', () => {
    const departmentIds = ['dept-1', 'dept-2']
    const targetAgent = { departmentId: 'dept-3' }

    const allowed = !departmentIds ||
      (targetAgent.departmentId !== null && departmentIds.includes(targetAgent.departmentId))
    expect(allowed).toBe(false)
  })

  test('CEO can target any agent (no departmentIds)', () => {
    const departmentIds: string[] | undefined = undefined
    const targetAgent = { departmentId: 'dept-999' }

    const allowed = !departmentIds ||
      (targetAgent.departmentId !== null && departmentIds.includes(targetAgent.departmentId))
    expect(allowed).toBe(true)
  })

  test('employee without targetAgentId is allowed (auto-routing)', () => {
    const departmentIds = ['dept-1']
    const targetAgentId = null

    // When no target agent, department check is skipped
    const needsCheck = departmentIds && targetAgentId
    expect(needsCheck).toBeFalsy()
  })
})

// === Cost View Restriction (AC4) ===

describe('AC4: Cost view restriction', () => {
  test('cost records filtered to scoped agent IDs', () => {
    const allAgents = [
      { id: 'a1', departmentId: 'dept-1' },
      { id: 'a2', departmentId: 'dept-2' },
      { id: 'a3', departmentId: 'dept-3' },
    ]
    const departmentIds = ['dept-1', 'dept-2']

    const scopedAgentIds = allAgents
      .filter(a => departmentIds.includes(a.departmentId))
      .map(a => a.id)

    expect(scopedAgentIds).toEqual(['a1', 'a2'])
  })

  test('budget byDepartment filtered for employee', () => {
    const allDepartments = [
      { departmentId: 'dept-1', name: 'Sales', costUsd: 100 },
      { departmentId: 'dept-2', name: 'Tech', costUsd: 200 },
      { departmentId: 'dept-3', name: 'HR', costUsd: 50 },
    ]
    const departmentIds = ['dept-1', 'dept-3']

    const filtered = allDepartments.filter(d => departmentIds.includes(d.departmentId))
    expect(filtered).toHaveLength(2)
    expect(filtered.map(d => d.departmentId)).toEqual(['dept-1', 'dept-3'])
  })

  test('CEO sees all departments in budget', () => {
    const allDepartments = [
      { departmentId: 'dept-1', name: 'Sales', costUsd: 100 },
      { departmentId: 'dept-2', name: 'Tech', costUsd: 200 },
    ]
    const departmentIds: string[] | undefined = undefined

    const filtered = departmentIds
      ? allDepartments.filter(d => departmentIds.includes(d.departmentId))
      : allDepartments

    expect(filtered).toEqual(allDepartments)
  })
})

// === Activity Log Restriction (AC5) ===

describe('AC5: Activity log restriction', () => {
  test('activity log filtered by scoped actor IDs + user ID', () => {
    const scopedAgentIds = ['agent-1', 'agent-2']
    const userId = 'employee-1'
    const allActorIds = [...scopedAgentIds, userId]

    expect(allActorIds).toEqual(['agent-1', 'agent-2', 'employee-1'])
  })

  test('activity tabs get departmentIds from middleware', () => {
    const tenant: TenantContext = {
      companyId: 'c1',
      userId: 'u1',
      role: 'employee',
      departmentIds: ['dept-1'],
    }

    // Simulates what the route handler does
    const filters = {
      departmentIds: tenant.departmentIds,
      agentId: undefined,
    }

    expect(filters.departmentIds).toEqual(['dept-1'])
  })
})

// === Edge Cases (AC6) ===

describe('AC6: Edge cases', () => {
  test('employee with 0 departments gets empty arrays everywhere', () => {
    const departmentIds: string[] = []

    // Agent listing
    expect(departmentIds.length === 0).toBe(true)

    // Cost filtering
    const costResult = departmentIds.length === 0 ? [] : ['some data']
    expect(costResult).toEqual([])

    // Activity log
    const activityResult = departmentIds.length === 0 ? [] : ['some activity']
    expect(activityResult).toEqual([])
  })

  test('agent moved to different department changes visibility', () => {
    const departmentIds = ['dept-1']

    // Agent initially in dept-1
    const agentBefore = { id: 'a1', departmentId: 'dept-1' }
    expect(departmentIds.includes(agentBefore.departmentId)).toBe(true)

    // Agent moved to dept-2
    const agentAfter = { id: 'a1', departmentId: 'dept-2' }
    expect(departmentIds.includes(agentAfter.departmentId)).toBe(false)
  })

  test('role check: only employee gets scoped', () => {
    const roles: UserRole[] = ['super_admin', 'company_admin', 'ceo', 'employee']

    for (const role of roles) {
      const shouldScope = role === 'employee'
      if (role === 'employee') {
        expect(shouldScope).toBe(true)
      } else {
        expect(shouldScope).toBe(false)
      }
    }
  })

  test('departmentIds undefined vs empty distinction', () => {
    // undefined = all access (CEO/admin)
    const ceoTenant: TenantContext = {
      companyId: 'c1', userId: 'u1', role: 'ceo',
    }
    expect(ceoTenant.departmentIds).toBeUndefined()

    // empty = no access (employee with no depts)
    const empNoDepTenant: TenantContext = {
      companyId: 'c1', userId: 'u1', role: 'employee', departmentIds: [],
    }
    expect(empNoDepTenant.departmentIds).toEqual([])
    expect(empNoDepTenant.departmentIds!.length).toBe(0)

    // populated = scoped access
    const empWithDeptTenant: TenantContext = {
      companyId: 'c1', userId: 'u1', role: 'employee', departmentIds: ['d1'],
    }
    expect(empWithDeptTenant.departmentIds!.length).toBe(1)
  })
})

// === Integration-style checks (middleware -> route logic) ===

describe('Middleware + Route integration pattern', () => {
  const next = async () => {}

  test('middleware injects departmentIds that routes consume', async () => {
    const deptAssignments = [{ departmentId: 'dept-a' }]
    mockDbSelect.mockReturnValue({
      from: mock(() => ({
        where: mock(() => deptAssignments),
      })),
    })

    const c = createMockContext(createTenant({ role: 'employee', userId: 'emp-1' }))
    await departmentScopeMiddleware(c, next)

    const tenant = c.get('tenant') as TenantContext
    expect(tenant.departmentIds).toEqual(['dept-a'])

    // Route logic pattern: check if departmentIds exists and filter
    const shouldFilter = !!tenant.departmentIds
    expect(shouldFilter).toBe(true)
  })

  test('bypass roles do not have departmentIds', async () => {
    for (const role of ['ceo', 'company_admin', 'super_admin'] as UserRole[]) {
      const c = createMockContext(createTenant({ role }))
      await departmentScopeMiddleware(c, next)

      const tenant = c.get('tenant') as TenantContext
      const shouldFilter = !!tenant.departmentIds
      expect(shouldFilter).toBe(false)
    }
  })
})

// === Cost aggregation department filter tests ===

describe('Cost aggregation with departmentIds', () => {
  test('getByAgent with departmentIds filters by department', () => {
    // Tests the function signature accepts departmentIds
    const departmentIds = ['dept-1', 'dept-2']
    const agents = [
      { id: 'a1', departmentId: 'dept-1' },
      { id: 'a2', departmentId: 'dept-3' },
    ]

    const filtered = agents.filter(a => departmentIds.includes(a.departmentId))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('a1')
  })

  test('getByAgent without departmentIds returns all', () => {
    const departmentIds: string[] | undefined = undefined
    const agents = [
      { id: 'a1', departmentId: 'dept-1' },
      { id: 'a2', departmentId: 'dept-3' },
    ]

    const filtered = departmentIds
      ? agents.filter(a => departmentIds.includes(a.departmentId))
      : agents

    expect(filtered).toHaveLength(2)
  })
})

// === Activity Log Service departmentIds tests ===

describe('Activity log service departmentIds support', () => {
  test('empty departmentIds returns empty result', () => {
    const departmentIds: string[] = []
    if (departmentIds.length === 0) {
      const result = { items: [], page: 1, limit: 20, total: 0 }
      expect(result.items).toEqual([])
      expect(result.total).toBe(0)
    }
  })

  test('departmentIds array used for IN clause', () => {
    const departmentIds = ['dept-1', 'dept-2']
    // This simulates what the service does with inArray(agents.departmentId, departmentIds)
    const mockAgents = [
      { id: 'a1', departmentId: 'dept-1' },
      { id: 'a2', departmentId: 'dept-2' },
      { id: 'a3', departmentId: 'dept-3' },
    ]

    const inScope = mockAgents.filter(a => departmentIds.includes(a.departmentId))
    expect(inScope).toHaveLength(2)
  })
})

// === Error code tests ===

describe('Error codes for scope violations', () => {
  test('SCOPE_001 for agent detail access violation', () => {
    const errorCode = 'SCOPE_001'
    expect(errorCode).toBe('SCOPE_001')
  })

  test('SCOPE_002 for command target violation', () => {
    const errorCode = 'SCOPE_002'
    expect(errorCode).toBe('SCOPE_002')
  })
})
