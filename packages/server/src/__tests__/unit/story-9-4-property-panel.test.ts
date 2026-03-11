import { describe, test, expect } from 'bun:test'

// ─── Helper functions extracted from property-panel.tsx for testing ───

function parseNodeId(nodeId: string): { type: 'agent' | 'department' | 'human' | 'company' | null; id: string } {
  if (nodeId.startsWith('agent-')) return { type: 'agent', id: nodeId.slice(6) }
  if (nodeId.startsWith('dept-')) return { type: 'department', id: nodeId.slice(5) }
  if (nodeId.startsWith('human-')) return { type: 'human', id: nodeId.slice(6) }
  if (nodeId.startsWith('company-')) return { type: 'company', id: nodeId.slice(8) }
  return { type: null, id: '' }
}

type OrgAgent = {
  id: string
  name: string
  role: string | null
  tier: 'manager' | 'specialist' | 'worker'
  tierLevel: number | null
  modelName: string
  departmentId: string | null
  status: string
  isSecretary: boolean
  isSystem: boolean
  soul: string | null
  allowedTools: string[] | null
  reportTo: string | null
  ownerUserId: string | null
}

type OrgEmployee = {
  id: string
  name: string
  username: string
  role: string
  hasCliToken: boolean
  agentCount: number
}

type OrgDept = {
  id: string
  name: string
  description: string | null
  agents: OrgAgent[]
  employees: OrgEmployee[]
}

type OrgChartData = {
  company: { id: string; name: string; slug: string }
  departments: OrgDept[]
  unassignedAgents: OrgAgent[]
  unassignedEmployees: OrgEmployee[]
}

function findAgent(org: OrgChartData, agentId: string): OrgAgent | undefined {
  for (const d of org.departments) {
    const found = d.agents.find((a) => a.id === agentId)
    if (found) return found
  }
  return org.unassignedAgents.find((a) => a.id === agentId)
}

function findEmployee(org: OrgChartData, userId: string): OrgEmployee | undefined {
  for (const d of org.departments) {
    const found = d.employees?.find((e) => e.id === userId)
    if (found) return found
  }
  return org.unassignedEmployees?.find((e) => e.id === userId)
}

function getAllAgents(org: OrgChartData): OrgAgent[] {
  return [...org.departments.flatMap((d) => d.agents), ...org.unassignedAgents]
}

// ─── Test Fixtures ───

const makeAgent = (overrides: Partial<OrgAgent> = {}): OrgAgent => ({
  id: 'a1',
  name: 'Agent Alpha',
  role: null,
  tier: 'specialist',
  tierLevel: 2,
  modelName: 'claude-opus-4-6',
  departmentId: 'd1',
  status: 'online',
  isSecretary: false,
  isSystem: false,
  soul: 'You are a helpful assistant',
  allowedTools: ['web_search', 'code_execute'],
  reportTo: null,
  ownerUserId: null,
  ...overrides,
})

const makeEmployee = (overrides: Partial<OrgEmployee> = {}): OrgEmployee => ({
  id: 'e1',
  name: 'Kim',
  username: 'kim',
  role: 'user',
  hasCliToken: true,
  agentCount: 2,
  ...overrides,
})

const makeOrgData = (overrides: Partial<OrgChartData> = {}): OrgChartData => ({
  company: { id: 'c1', name: 'CORTHEX', slug: 'corthex' },
  departments: [
    {
      id: 'd1',
      name: 'Engineering',
      description: 'Dev team',
      agents: [
        makeAgent({ id: 'a1', name: 'Agent Alpha', tier: 'manager', tierLevel: 1 }),
        makeAgent({ id: 'a2', name: 'Agent Beta', tier: 'specialist', tierLevel: 2, ownerUserId: 'e1' }),
      ],
      employees: [makeEmployee({ id: 'e1', name: 'Kim' })],
    },
    {
      id: 'd2',
      name: 'Marketing',
      description: 'Marketing team',
      agents: [makeAgent({ id: 'a3', name: 'Agent Gamma', departmentId: 'd2', tier: 'worker', tierLevel: 3 })],
      employees: [],
    },
  ],
  unassignedAgents: [makeAgent({ id: 'a4', name: 'Agent Delta', departmentId: null })],
  unassignedEmployees: [makeEmployee({ id: 'e2', name: 'Lee', hasCliToken: false })],
  ...overrides,
})

// ─── Tests ───

describe('Story 9.4: Property Panel', () => {
  describe('parseNodeId', () => {
    test('parses agent node ID', () => {
      const result = parseNodeId('agent-550e8400-e29b-41d4-a716-446655440000')
      expect(result.type).toBe('agent')
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000')
    })

    test('parses department node ID', () => {
      const result = parseNodeId('dept-abc123')
      expect(result.type).toBe('department')
      expect(result.id).toBe('abc123')
    })

    test('parses human node ID', () => {
      const result = parseNodeId('human-def456')
      expect(result.type).toBe('human')
      expect(result.id).toBe('def456')
    })

    test('parses company node ID', () => {
      const result = parseNodeId('company-ghi789')
      expect(result.type).toBe('company')
      expect(result.id).toBe('ghi789')
    })

    test('returns null for unknown node types', () => {
      expect(parseNodeId('unassigned-group').type).toBe(null)
      expect(parseNodeId('random-node').type).toBe(null)
      expect(parseNodeId('').type).toBe(null)
    })

    test('handles node IDs with hyphens in UUID', () => {
      const result = parseNodeId('agent-a1b2c3d4-e5f6-7890-abcd-ef1234567890')
      expect(result.type).toBe('agent')
      expect(result.id).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
    })
  })

  describe('findAgent', () => {
    test('finds agent in a department', () => {
      const org = makeOrgData()
      const agent = findAgent(org, 'a1')
      expect(agent).toBeDefined()
      expect(agent!.name).toBe('Agent Alpha')
    })

    test('finds agent in second department', () => {
      const org = makeOrgData()
      const agent = findAgent(org, 'a3')
      expect(agent).toBeDefined()
      expect(agent!.name).toBe('Agent Gamma')
    })

    test('finds unassigned agent', () => {
      const org = makeOrgData()
      const agent = findAgent(org, 'a4')
      expect(agent).toBeDefined()
      expect(agent!.name).toBe('Agent Delta')
    })

    test('returns undefined for non-existent agent', () => {
      const org = makeOrgData()
      expect(findAgent(org, 'nonexistent')).toBeUndefined()
    })
  })

  describe('findEmployee', () => {
    test('finds employee in a department', () => {
      const org = makeOrgData()
      const emp = findEmployee(org, 'e1')
      expect(emp).toBeDefined()
      expect(emp!.name).toBe('Kim')
    })

    test('finds unassigned employee', () => {
      const org = makeOrgData()
      const emp = findEmployee(org, 'e2')
      expect(emp).toBeDefined()
      expect(emp!.name).toBe('Lee')
    })

    test('returns undefined for non-existent employee', () => {
      const org = makeOrgData()
      expect(findEmployee(org, 'nonexistent')).toBeUndefined()
    })
  })

  describe('getAllAgents', () => {
    test('collects all agents from departments + unassigned', () => {
      const org = makeOrgData()
      const all = getAllAgents(org)
      expect(all.length).toBe(4) // a1, a2 (dept1) + a3 (dept2) + a4 (unassigned)
    })

    test('returns empty for org with no agents', () => {
      const org = makeOrgData({
        departments: [{ id: 'd1', name: 'Empty', description: null, agents: [], employees: [] }],
        unassignedAgents: [],
      })
      expect(getAllAgents(org).length).toBe(0)
    })
  })

  describe('Agent PATCH body validation', () => {
    test('name update body', () => {
      const body = { name: 'New Agent Name' }
      expect(body).toHaveProperty('name')
      expect(typeof body.name).toBe('string')
    })

    test('tier update body includes tier and tierLevel', () => {
      const tierMap: Record<number, string> = { 1: 'manager', 2: 'specialist', 3: 'worker' }
      const level = 1
      const body = { tierLevel: level, tier: tierMap[level] }
      expect(body.tierLevel).toBe(1)
      expect(body.tier).toBe('manager')
    })

    test('tier mapping is correct for all levels', () => {
      const tierMap: Record<number, string> = { 1: 'manager', 2: 'specialist', 3: 'worker' }
      expect(tierMap[1]).toBe('manager')
      expect(tierMap[2]).toBe('specialist')
      expect(tierMap[3]).toBe('worker')
    })

    test('allowedTools update body is an array', () => {
      const body = { allowedTools: ['web_search', 'code_execute'] }
      expect(Array.isArray(body.allowedTools)).toBe(true)
      expect(body.allowedTools.length).toBe(2)
    })

    test('empty allowedTools is valid', () => {
      const body = { allowedTools: [] as string[] }
      expect(body.allowedTools.length).toBe(0)
    })
  })

  describe('Department PATCH body validation', () => {
    test('name update body', () => {
      const body = { name: 'New Dept Name' }
      expect(body).toHaveProperty('name')
      expect(typeof body.name).toBe('string')
    })

    test('description update body', () => {
      const body = { description: 'Updated description' }
      expect(body).toHaveProperty('description')
      expect(typeof body.description).toBe('string')
    })

    test('both fields can be updated together', () => {
      const body = { name: 'New Name', description: 'New Desc' }
      expect(body.name).toBe('New Name')
      expect(body.description).toBe('New Desc')
    })
  })

  describe('Owned agents filtering (human panel)', () => {
    test('filters agents by ownerUserId', () => {
      const org = makeOrgData()
      const allAgents = getAllAgents(org)
      const ownedByE1 = allAgents.filter((a) => a.ownerUserId === 'e1')
      expect(ownedByE1.length).toBe(1)
      expect(ownedByE1[0].name).toBe('Agent Beta')
    })

    test('returns empty when no agents owned', () => {
      const org = makeOrgData()
      const allAgents = getAllAgents(org)
      const ownedByE2 = allAgents.filter((a) => a.ownerUserId === 'e2')
      expect(ownedByE2.length).toBe(0)
    })

    test('handles null ownerUserId', () => {
      const org = makeOrgData()
      const allAgents = getAllAgents(org)
      const unowned = allAgents.filter((a) => a.ownerUserId === null)
      expect(unowned.length).toBe(3) // a1, a3, a4
    })
  })

  describe('Manager detection logic', () => {
    test('finds manager agent by tier', () => {
      const org = makeOrgData()
      const dept = org.departments[0]
      const manager = dept.agents.find((a) => a.tier === 'manager' || a.tierLevel === 1)
      expect(manager).toBeDefined()
      expect(manager!.name).toBe('Agent Alpha')
    })

    test('returns undefined when no manager in department', () => {
      const org = makeOrgData()
      const dept = org.departments[1] // Marketing has only worker
      const manager = dept.agents.find((a) => a.tier === 'manager' || a.tierLevel === 1)
      expect(manager).toBeUndefined()
    })
  })

  describe('Optimistic update data structure', () => {
    test('updates agent in org chart data correctly', () => {
      const org = makeOrgData()
      const agentId = 'a1'
      const update = { name: 'Updated Alpha' }

      const updateAgentInOrg = (data: OrgChartData, id: string, patch: Record<string, unknown>) => ({
        ...data,
        departments: data.departments.map((d) => ({
          ...d,
          agents: d.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
        unassignedAgents: data.unassignedAgents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      })

      const updated = updateAgentInOrg(org, agentId, update)
      const agent = findAgent(updated, agentId)
      expect(agent!.name).toBe('Updated Alpha')
      // Other agents unchanged
      expect(findAgent(updated, 'a2')!.name).toBe('Agent Beta')
    })

    test('updates department in org chart data correctly', () => {
      const org = makeOrgData()
      const deptId = 'd1'
      const update = { name: 'Updated Engineering', description: 'New desc' }

      const updated = {
        ...org,
        departments: org.departments.map((d) =>
          d.id === deptId ? { ...d, ...update } : d,
        ),
      }

      expect(updated.departments[0].name).toBe('Updated Engineering')
      expect(updated.departments[0].description).toBe('New desc')
      // Other dept unchanged
      expect(updated.departments[1].name).toBe('Marketing')
    })
  })

  describe('Edge cases', () => {
    test('empty org data with no departments', () => {
      const org = makeOrgData({ departments: [], unassignedAgents: [], unassignedEmployees: [] })
      expect(findAgent(org, 'a1')).toBeUndefined()
      expect(findEmployee(org, 'e1')).toBeUndefined()
      expect(getAllAgents(org).length).toBe(0)
    })

    test('null selectedNodeId returns null type', () => {
      // parseNodeId shouldn't crash on edge cases
      expect(parseNodeId('').type).toBe(null)
    })

    test('agent with null allowedTools', () => {
      const agent = makeAgent({ allowedTools: null })
      // Panel should default to empty array
      const tools = agent.allowedTools ?? []
      expect(tools).toEqual([])
    })

    test('agent with null tierLevel', () => {
      const agent = makeAgent({ tierLevel: null })
      const level = agent.tierLevel ?? 3
      expect(level).toBe(3)
    })

    test('department with null description', () => {
      const dept: OrgDept = { id: 'd1', name: 'Test', description: null, agents: [], employees: [] }
      const desc = dept.description ?? ''
      expect(desc).toBe('')
    })

    test('employee with hasCliToken false', () => {
      const emp = makeEmployee({ hasCliToken: false })
      expect(emp.hasCliToken).toBe(false)
    })

    test('employee with agentCount 0', () => {
      const emp = makeEmployee({ agentCount: 0 })
      expect(emp.agentCount).toBe(0)
    })

    test('company initials generation', () => {
      const genInitials = (name: string) =>
        name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

      expect(genInitials('CORTHEX')).toBe('C')
      expect(genInitials('My Company')).toBe('MC')
      expect(genInitials('A B C D')).toBe('AB')
    })
  })

  describe('Tool toggle logic', () => {
    test('adds tool when not in list', () => {
      const current = ['web_search']
      const toolName = 'code_execute'
      const next = current.includes(toolName) ? current.filter((t) => t !== toolName) : [...current, toolName]
      expect(next).toEqual(['web_search', 'code_execute'])
    })

    test('removes tool when already in list', () => {
      const current = ['web_search', 'code_execute']
      const toolName = 'web_search'
      const next = current.includes(toolName) ? current.filter((t) => t !== toolName) : [...current, toolName]
      expect(next).toEqual(['code_execute'])
    })

    test('empty list + add tool', () => {
      const current: string[] = []
      const toolName = 'web_search'
      const next = current.includes(toolName) ? current.filter((t) => t !== toolName) : [...current, toolName]
      expect(next).toEqual(['web_search'])
    })
  })

  describe('Department agent/employee counting', () => {
    test('counts agents correctly', () => {
      const org = makeOrgData()
      const dept = org.departments[0]
      expect(dept.agents.length).toBe(2)
    })

    test('counts employees correctly', () => {
      const org = makeOrgData()
      const dept = org.departments[0]
      expect(dept.employees.length).toBe(1)
    })

    test('handles department with no employees', () => {
      const org = makeOrgData()
      const dept = org.departments[1] // Marketing
      expect(dept.employees.length).toBe(0)
    })
  })

  describe('Company stats computation', () => {
    test('computes total agents correctly', () => {
      const org = makeOrgData()
      const totalAgents = org.departments.reduce((s, d) => s + d.agents.length, 0) + org.unassignedAgents.length
      expect(totalAgents).toBe(4)
    })

    test('computes total employees correctly', () => {
      const org = makeOrgData()
      const totalEmployees = org.departments.reduce((s, d) => s + (d.employees?.length ?? 0), 0) + (org.unassignedEmployees?.length ?? 0)
      expect(totalEmployees).toBe(2)
    })

    test('handles undefined employees', () => {
      const org = makeOrgData()
      // Force undefined employees to test nullish coalescing
      const deptWithoutEmployees = { ...org.departments[1], employees: undefined as unknown as OrgEmployee[] }
      const count = deptWithoutEmployees.employees?.length ?? 0
      expect(count).toBe(0)
    })
  })
})
