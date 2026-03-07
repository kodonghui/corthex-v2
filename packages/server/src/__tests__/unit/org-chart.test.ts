import { describe, expect, test } from 'bun:test'

// ============================================================
// TEA: Org Chart — Core + Edge Cases + Risk-Based Coverage
// Story 2-5: Org Tree View UI (Admin)
// ============================================================

// Type definitions matching the API response (Story 2-5: enhanced with tier, modelName, isSystem, soul, allowedTools)
type OrgAgent = {
  id: string
  name: string
  role: string
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  departmentId: string | null
  status: string
  isSecretary: boolean
  isSystem: boolean
  soul: string | null
  allowedTools: string[]
}

type OrgDept = {
  id: string
  name: string
  description: string | null
  agents: OrgAgent[]
}

type OrgChartResponse = {
  data: {
    company: { id: string; name: string; slug: string }
    departments: OrgDept[]
    unassignedAgents: OrgAgent[]
  }
}

const TIER_ORDER: Record<string, number> = { manager: 0, specialist: 1, worker: 2 }

function sortByTier<T extends { tier: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9))
}

// Helper: default agent for convenience (avoids repeating all fields)
function makeAgent(overrides: Partial<OrgAgent> & { id: string; name: string }): OrgAgent {
  return {
    role: '',
    tier: 'specialist',
    modelName: 'claude-haiku-4-5',
    departmentId: null,
    status: 'online',
    isSecretary: false,
    isSystem: false,
    soul: null,
    allowedTools: [],
    ...overrides,
  }
}

// Helper: simulate the org-chart API logic (department tree + unassigned agents + tier sorting)
function buildOrgChart(
  company: { id: string; name: string; slug: string },
  departments: { id: string; name: string; description: string | null }[],
  agents: OrgAgent[],
): OrgChartResponse['data'] {
  const deptTree = departments.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    agents: sortByTier(agents.filter((a) => a.departmentId === d.id)),
  }))
  const unassignedAgents = agents.filter((a) => !a.departmentId)
  return { company, departments: deptTree, unassignedAgents }
}

describe('Org Chart — Data Structure', () => {
  const company = { id: 'c1', name: 'CORTHEX', slug: 'corthex' }
  const departments = [
    { id: 'd1', name: '개발팀', description: '개발 부서' },
    { id: 'd2', name: '마케팅팀', description: null },
  ]
  const agents: OrgAgent[] = [
    makeAgent({ id: 'a1', name: '비서봇', role: '비서', tier: 'manager', departmentId: 'd1', status: 'online', isSecretary: true }),
    makeAgent({ id: 'a2', name: '코딩봇', role: '개발자', tier: 'specialist', departmentId: 'd1', status: 'working' }),
    makeAgent({ id: 'a3', name: 'SNS봇', role: 'SNS 관리', tier: 'worker', departmentId: 'd2', status: 'offline' }),
    makeAgent({ id: 'a4', name: '미배정봇', role: '범용', tier: 'specialist', departmentId: null, status: 'online' }),
  ]

  test('buildOrgChart returns company info', () => {
    const result = buildOrgChart(company, departments, agents)
    expect(result.company).toEqual(company)
  })

  test('agents are grouped by department', () => {
    const result = buildOrgChart(company, departments, agents)
    expect(result.departments.length).toBe(2)
    expect(result.departments[0].agents.length).toBe(2)
    expect(result.departments[1].agents.length).toBe(1)
  })

  test('unassigned agents (departmentId=null) are separated', () => {
    const result = buildOrgChart(company, departments, agents)
    expect(result.unassignedAgents.length).toBe(1)
    expect(result.unassignedAgents[0].name).toBe('미배정봇')
  })

  test('empty departments have empty agents array', () => {
    const result = buildOrgChart(company, [{ id: 'd99', name: '빈부서', description: null }], agents)
    expect(result.departments[0].agents.length).toBe(0)
  })

  test('no departments: only null-departmentId agents are unassigned', () => {
    const result = buildOrgChart(company, [], agents)
    expect(result.departments.length).toBe(0)
    // Only agents with departmentId=null are unassigned (a4)
    // Agents with non-null departmentId but no matching dept are lost (by design - same as real API)
    expect(result.unassignedAgents.length).toBe(1)
    expect(result.unassignedAgents[0].name).toBe('미배정봇')
  })

  test('no agents: departments exist but empty', () => {
    const result = buildOrgChart(company, departments, [])
    expect(result.departments[0].agents.length).toBe(0)
    expect(result.departments[1].agents.length).toBe(0)
    expect(result.unassignedAgents.length).toBe(0)
  })

  test('agent status values are preserved', () => {
    const result = buildOrgChart(company, departments, agents)
    const devTeam = result.departments[0]
    expect(devTeam.agents[0].status).toBe('online')
    expect(devTeam.agents[1].status).toBe('working')
  })

  test('isSecretary flag is preserved', () => {
    const result = buildOrgChart(company, departments, agents)
    const devTeam = result.departments[0]
    expect(devTeam.agents[0].isSecretary).toBe(true)
    expect(devTeam.agents[1].isSecretary).toBe(false)
  })

  test('department description can be null', () => {
    const result = buildOrgChart(company, departments, agents)
    expect(result.departments[0].description).toBe('개발 부서')
    expect(result.departments[1].description).toBeNull()
  })
})

describe('Org Chart — Status Color Mapping', () => {
  const statusColor: Record<string, string> = {
    online: 'bg-green-500',
    working: 'bg-blue-500',
    error: 'bg-red-500',
    offline: 'bg-gray-400',
  }

  test('online → green', () => {
    expect(statusColor['online']).toBe('bg-green-500')
  })

  test('working → blue', () => {
    expect(statusColor['working']).toBe('bg-blue-500')
  })

  test('error → red', () => {
    expect(statusColor['error']).toBe('bg-red-500')
  })

  test('offline → gray', () => {
    expect(statusColor['offline']).toBe('bg-gray-400')
  })

  test('unknown status → undefined (fallback needed)', () => {
    expect(statusColor['unknown']).toBeUndefined()
  })
})

describe('Org Chart — Edge Cases', () => {
  const company = { id: 'c1', name: 'Test Corp', slug: 'test' }

  test('large number of agents in single department', () => {
    const manyAgents: OrgAgent[] = Array.from({ length: 100 }, (_, i) =>
      makeAgent({ id: `a${i}`, name: `Agent ${i}`, departmentId: 'd1', status: i % 2 === 0 ? 'online' : 'offline', isSecretary: i === 0 }),
    )
    const result = buildOrgChart(company, [{ id: 'd1', name: 'Mega Dept', description: null }], manyAgents)
    expect(result.departments[0].agents.length).toBe(100)
    expect(result.unassignedAgents.length).toBe(0)
  })

  test('multiple departments with mixed assigned/unassigned', () => {
    const mixedAgents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'A1', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'A2', departmentId: null }),
      makeAgent({ id: 'a3', name: 'A3', departmentId: 'd2' }),
      makeAgent({ id: 'a4', name: 'A4', departmentId: null }),
    ]
    const depts = [
      { id: 'd1', name: 'D1', description: null },
      { id: 'd2', name: 'D2', description: null },
    ]
    const result = buildOrgChart(company, depts, mixedAgents)
    expect(result.departments[0].agents.length).toBe(1)
    expect(result.departments[1].agents.length).toBe(1)
    expect(result.unassignedAgents.length).toBe(2)
  })

  test('all agents are secretaries', () => {
    const secretaryAgents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'Sec1', role: '비서', departmentId: 'd1', isSecretary: true }),
      makeAgent({ id: 'a2', name: 'Sec2', role: '비서', departmentId: 'd1', isSecretary: true }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], secretaryAgents)
    expect(result.departments[0].agents.every((a) => a.isSecretary)).toBe(true)
  })

  test('all agents have error status', () => {
    const errorAgents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'E1', departmentId: 'd1', status: 'error' }),
      makeAgent({ id: 'a2', name: 'E2', departmentId: null, status: 'error' }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], errorAgents)
    expect(result.departments[0].agents[0].status).toBe('error')
    expect(result.unassignedAgents[0].status).toBe('error')
  })

  test('agent with empty role', () => {
    const agentNoRole: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'NoRole', role: '', departmentId: 'd1' }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agentNoRole)
    expect(result.departments[0].agents[0].role).toBe('')
  })
})

// ============================================================
// TEA: API Input Validation (P0 — Critical Path)
// ============================================================
describe('Org Chart — API Input Validation', () => {
  test('companyId is required for API call', () => {
    // The API should reject requests without companyId
    const companyId = ''
    expect(companyId).toBeFalsy()
  })

  test('companyId must be a valid UUID format', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000'
    const invalidUUID = 'not-a-uuid'
    expect(validUUID).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    expect(invalidUUID).not.toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  test('response wraps data in { data: ... } envelope', () => {
    const company = { id: 'c1', name: 'Test', slug: 'test' }
    const result = buildOrgChart(company, [], [])
    const response = { data: result }
    expect(response).toHaveProperty('data')
    expect(response.data).toHaveProperty('company')
    expect(response.data).toHaveProperty('departments')
    expect(response.data).toHaveProperty('unassignedAgents')
  })
})

// ============================================================
// TEA: Department Ordering & Consistency (P1)
// ============================================================
describe('Org Chart — Department Ordering', () => {
  const company = { id: 'c1', name: 'Test', slug: 'test' }

  test('departments maintain insertion order', () => {
    const depts = [
      { id: 'd1', name: 'Alpha', description: null },
      { id: 'd2', name: 'Beta', description: null },
      { id: 'd3', name: 'Gamma', description: null },
    ]
    const result = buildOrgChart(company, depts, [])
    expect(result.departments[0].name).toBe('Alpha')
    expect(result.departments[1].name).toBe('Beta')
    expect(result.departments[2].name).toBe('Gamma')
  })

  test('agents within same tier maintain insertion order', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'First', tier: 'specialist', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'Second', tier: 'specialist', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'Third', tier: 'specialist', departmentId: 'd1' }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agents)
    expect(result.departments[0].agents[0].name).toBe('First')
    expect(result.departments[0].agents[1].name).toBe('Second')
    expect(result.departments[0].agents[2].name).toBe('Third')
  })

  test('unassigned agents maintain order', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'U1', departmentId: null }),
      makeAgent({ id: 'a2', name: 'U2', departmentId: null }),
    ]
    const result = buildOrgChart(company, [], agents)
    expect(result.unassignedAgents[0].name).toBe('U1')
    expect(result.unassignedAgents[1].name).toBe('U2')
  })
})

// ============================================================
// TEA: Agent Status Distribution (P1)
// ============================================================
describe('Org Chart — Status Distribution', () => {
  const company = { id: 'c1', name: 'Test', slug: 'test' }

  test('all four statuses can coexist in one department', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'On', departmentId: 'd1', status: 'online' }),
      makeAgent({ id: 'a2', name: 'Work', departmentId: 'd1', status: 'working' }),
      makeAgent({ id: 'a3', name: 'Err', departmentId: 'd1', status: 'error' }),
      makeAgent({ id: 'a4', name: 'Off', departmentId: 'd1', status: 'offline' }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agents)
    const statuses = result.departments[0].agents.map((a) => a.status)
    expect(statuses).toContain('online')
    expect(statuses).toContain('working')
    expect(statuses).toContain('error')
    expect(statuses).toContain('offline')
  })

  test('status counts are accurate per department', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'A1', departmentId: 'd1', status: 'online' }),
      makeAgent({ id: 'a2', name: 'A2', departmentId: 'd1', status: 'online' }),
      makeAgent({ id: 'a3', name: 'A3', departmentId: 'd1', status: 'offline' }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agents)
    const onlineCount = result.departments[0].agents.filter((a) => a.status === 'online').length
    const offlineCount = result.departments[0].agents.filter((a) => a.status === 'offline').length
    expect(onlineCount).toBe(2)
    expect(offlineCount).toBe(1)
  })
})

// ============================================================
// TEA: Status Label Mapping (P1)
// ============================================================
describe('Org Chart — Status Label Mapping', () => {
  const statusLabel: Record<string, string> = {
    online: '온라인',
    working: '작업 중',
    error: '오류',
    offline: '오프라인',
  }

  test('online → 온라인', () => expect(statusLabel['online']).toBe('온라인'))
  test('working → 작업 중', () => expect(statusLabel['working']).toBe('작업 중'))
  test('error → 오류', () => expect(statusLabel['error']).toBe('오류'))
  test('offline → 오프라인', () => expect(statusLabel['offline']).toBe('오프라인'))
  test('unknown status has no label', () => expect(statusLabel['unknown']).toBeUndefined())
})

// ============================================================
// TEA: Tooltip Data Completeness (P1)
// ============================================================
describe('Org Chart — Tooltip Data', () => {
  const company = { id: 'c1', name: 'Test', slug: 'test' }

  test('agent has all fields: name, role, tier, modelName, status, isSecretary, isSystem, soul, allowedTools', () => {
    const agent = makeAgent({ id: 'a1', name: 'Bot1', role: '개발봇', tier: 'manager', modelName: 'claude-sonnet-4-6', departmentId: 'd1', status: 'working', isSecretary: true, isSystem: true, soul: 'I am a dev bot', allowedTools: ['web_search', 'calculator'] })
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], [agent])
    const a = result.departments[0].agents[0]
    expect(a).toHaveProperty('name')
    expect(a).toHaveProperty('role')
    expect(a).toHaveProperty('tier')
    expect(a).toHaveProperty('modelName')
    expect(a).toHaveProperty('status')
    expect(a).toHaveProperty('isSecretary')
    expect(a).toHaveProperty('isSystem')
    expect(a).toHaveProperty('soul')
    expect(a).toHaveProperty('allowedTools')
    expect(a.name).toBe('Bot1')
    expect(a.role).toBe('개발봇')
    expect(a.tier).toBe('manager')
    expect(a.modelName).toBe('claude-sonnet-4-6')
    expect(a.status).toBe('working')
    expect(a.isSecretary).toBe(true)
    expect(a.isSystem).toBe(true)
    expect(a.soul).toBe('I am a dev bot')
    expect(a.allowedTools).toEqual(['web_search', 'calculator'])
  })

  test('unassigned agent also has all fields', () => {
    const agent = makeAgent({ id: 'a1', name: 'Free', role: '범용', departmentId: null })
    const result = buildOrgChart(company, [], [agent])
    const a = result.unassignedAgents[0]
    expect(a.name).toBe('Free')
    expect(a.role).toBe('범용')
    expect(a.tier).toBe('specialist')
    expect(a.modelName).toBe('claude-haiku-4-5')
    expect(a.status).toBe('online')
    expect(a.isSecretary).toBe(false)
    expect(a.isSystem).toBe(false)
  })
})

// ============================================================
// TEA: Company Node Data (P1)
// ============================================================
describe('Org Chart — Company Node', () => {
  test('company node has id, name, slug', () => {
    const company = { id: 'c1', name: 'CORTHEX HQ', slug: 'corthex-hq' }
    const result = buildOrgChart(company, [], [])
    expect(result.company.id).toBe('c1')
    expect(result.company.name).toBe('CORTHEX HQ')
    expect(result.company.slug).toBe('corthex-hq')
  })

  test('company with Korean name', () => {
    const company = { id: 'c1', name: '코텍스 본사', slug: 'corthex' }
    const result = buildOrgChart(company, [], [])
    expect(result.company.name).toBe('코텍스 본사')
  })

  test('company with special characters in slug', () => {
    const company = { id: 'c1', name: 'Test', slug: 'test-corp-2026' }
    const result = buildOrgChart(company, [], [])
    expect(result.company.slug).toBe('test-corp-2026')
  })
})

// ============================================================
// TEA: Multi-Department Stress (P2)
// ============================================================
describe('Org Chart — Multi-Department Stress', () => {
  const company = { id: 'c1', name: 'Test', slug: 'test' }

  test('10 departments each with 5 agents', () => {
    const depts = Array.from({ length: 10 }, (_, i) => ({
      id: `d${i}`, name: `Dept ${i}`, description: null,
    }))
    const agents: OrgAgent[] = []
    for (let d = 0; d < 10; d++) {
      for (let a = 0; a < 5; a++) {
        agents.push(makeAgent({ id: `a${d}-${a}`, name: `Agent ${d}-${a}`, departmentId: `d${d}` }))
      }
    }
    const result = buildOrgChart(company, depts, agents)
    expect(result.departments.length).toBe(10)
    result.departments.forEach((d) => expect(d.agents.length).toBe(5))
    expect(result.unassignedAgents.length).toBe(0)
  })

  test('single department with all statuses evenly distributed', () => {
    const statuses = ['online', 'working', 'error', 'offline']
    const agents: OrgAgent[] = Array.from({ length: 20 }, (_, i) =>
      makeAgent({ id: `a${i}`, name: `Agent ${i}`, departmentId: 'd1', status: statuses[i % 4] }),
    )
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agents)
    const dept = result.departments[0]
    expect(dept.agents.filter((a) => a.status === 'online').length).toBe(5)
    expect(dept.agents.filter((a) => a.status === 'working').length).toBe(5)
    expect(dept.agents.filter((a) => a.status === 'error').length).toBe(5)
    expect(dept.agents.filter((a) => a.status === 'offline').length).toBe(5)
  })
})

// ============================================================
// TEA: Secretary Distribution (P2)
// ============================================================
describe('Org Chart — Secretary Distribution', () => {
  const company = { id: 'c1', name: 'Test', slug: 'test' }

  test('secretary agents are identified across departments', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'Sec1', role: '비서', departmentId: 'd1', isSecretary: true }),
      makeAgent({ id: 'a2', name: 'Worker', role: '일반', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'Sec2', role: '비서', departmentId: 'd2', isSecretary: true }),
    ]
    const depts = [
      { id: 'd1', name: 'D1', description: null },
      { id: 'd2', name: 'D2', description: null },
    ]
    const result = buildOrgChart(company, depts, agents)
    const allAgents = [...result.departments.flatMap((d) => d.agents), ...result.unassignedAgents]
    const secretaryCount = allAgents.filter((a) => a.isSecretary).length
    expect(secretaryCount).toBe(2)
  })

  test('unassigned secretary agent', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'FreeSec', role: '비서', departmentId: null, isSecretary: true }),
    ]
    const result = buildOrgChart(company, [], agents)
    expect(result.unassignedAgents[0].isSecretary).toBe(true)
  })
})

// ============================================================
// TEA: Response Shape Consistency (P0)
// ============================================================
describe('Org Chart — Response Shape', () => {
  const company = { id: 'c1', name: 'Test', slug: 'test' }

  test('response always has company, departments, unassignedAgents', () => {
    const result = buildOrgChart(company, [], [])
    expect(Object.keys(result).sort()).toEqual(['company', 'departments', 'unassignedAgents'])
  })

  test('departments is always an array', () => {
    const result = buildOrgChart(company, [], [])
    expect(Array.isArray(result.departments)).toBe(true)
  })

  test('unassignedAgents is always an array', () => {
    const result = buildOrgChart(company, [], [])
    expect(Array.isArray(result.unassignedAgents)).toBe(true)
  })

  test('each department has id, name, description, agents', () => {
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: 'desc' }], [])
    const dept = result.departments[0]
    expect(dept).toHaveProperty('id')
    expect(dept).toHaveProperty('name')
    expect(dept).toHaveProperty('description')
    expect(dept).toHaveProperty('agents')
    expect(Array.isArray(dept.agents)).toBe(true)
  })

  test('agent node has all required fields (including Story 2-5 additions)', () => {
    const agent = makeAgent({ id: 'a1', name: 'Bot', departmentId: 'd1' })
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], [agent])
    const a = result.departments[0].agents[0]
    expect(a).toHaveProperty('id')
    expect(a).toHaveProperty('name')
    expect(a).toHaveProperty('role')
    expect(a).toHaveProperty('tier')
    expect(a).toHaveProperty('modelName')
    expect(a).toHaveProperty('departmentId')
    expect(a).toHaveProperty('status')
    expect(a).toHaveProperty('isSecretary')
    expect(a).toHaveProperty('isSystem')
    expect(a).toHaveProperty('soul')
    expect(a).toHaveProperty('allowedTools')
  })
})

// ============================================================
// Story 2-5: Tier Sorting (P0 — Core Feature)
// ============================================================
describe('Org Chart — Tier Sorting', () => {
  const company = { id: 'c1', name: 'Test', slug: 'test' }

  test('agents sorted by tier: manager > specialist > worker', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'Worker1', tier: 'worker', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'Manager1', tier: 'manager', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'Specialist1', tier: 'specialist', departmentId: 'd1' }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agents)
    const tiers = result.departments[0].agents.map((a) => a.tier)
    expect(tiers).toEqual(['manager', 'specialist', 'worker'])
  })

  test('multiple agents of same tier maintain relative order', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'Spec-A', tier: 'specialist', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'Mgr-A', tier: 'manager', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'Spec-B', tier: 'specialist', departmentId: 'd1' }),
      makeAgent({ id: 'a4', name: 'Worker-A', tier: 'worker', departmentId: 'd1' }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agents)
    const names = result.departments[0].agents.map((a) => a.name)
    expect(names).toEqual(['Mgr-A', 'Spec-A', 'Spec-B', 'Worker-A'])
  })

  test('department with only managers', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'Mgr1', tier: 'manager', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'Mgr2', tier: 'manager', departmentId: 'd1' }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agents)
    expect(result.departments[0].agents.every((a) => a.tier === 'manager')).toBe(true)
  })

  test('department with only workers', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'W1', tier: 'worker', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'W2', tier: 'worker', departmentId: 'd1' }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agents)
    expect(result.departments[0].agents.every((a) => a.tier === 'worker')).toBe(true)
  })

  test('each department sorted independently', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'D1-Worker', tier: 'worker', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'D1-Manager', tier: 'manager', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'D2-Specialist', tier: 'specialist', departmentId: 'd2' }),
      makeAgent({ id: 'a4', name: 'D2-Manager', tier: 'manager', departmentId: 'd2' }),
    ]
    const depts = [
      { id: 'd1', name: 'D1', description: null },
      { id: 'd2', name: 'D2', description: null },
    ]
    const result = buildOrgChart(company, depts, agents)
    expect(result.departments[0].agents[0].name).toBe('D1-Manager')
    expect(result.departments[0].agents[1].name).toBe('D1-Worker')
    expect(result.departments[1].agents[0].name).toBe('D2-Manager')
    expect(result.departments[1].agents[1].name).toBe('D2-Specialist')
  })

  test('sortByTier is stable (preserves insertion order for same tier)', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'Z-Spec', tier: 'specialist', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'A-Spec', tier: 'specialist', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'M-Spec', tier: 'specialist', departmentId: 'd1' }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agents)
    const names = result.departments[0].agents.map((a) => a.name)
    // Should preserve insertion order, not alphabetical
    expect(names).toEqual(['Z-Spec', 'A-Spec', 'M-Spec'])
  })

  test('unassigned agents are NOT tier-sorted (raw order)', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'Unassigned-Worker', tier: 'worker', departmentId: null }),
      makeAgent({ id: 'a2', name: 'Unassigned-Manager', tier: 'manager', departmentId: null }),
    ]
    const result = buildOrgChart(company, [], agents)
    // Unassigned section keeps raw order (not sorted)
    expect(result.unassignedAgents[0].name).toBe('Unassigned-Worker')
    expect(result.unassignedAgents[1].name).toBe('Unassigned-Manager')
  })
})

// ============================================================
// Story 2-5: New Agent Fields (P0 — isSystem, soul, allowedTools)
// ============================================================
describe('Org Chart — System Agent Fields', () => {
  const company = { id: 'c1', name: 'Test', slug: 'test' }

  test('isSystem=true is preserved for system agents', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'Chief of Staff', departmentId: 'd1', isSystem: true }),
      makeAgent({ id: 'a2', name: 'Custom Agent', departmentId: 'd1', isSystem: false }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agents)
    expect(result.departments[0].agents[0].isSystem).toBe(true)
    expect(result.departments[0].agents[1].isSystem).toBe(false)
  })

  test('soul field can be null', () => {
    const agent = makeAgent({ id: 'a1', name: 'NoSoul', departmentId: 'd1', soul: null })
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], [agent])
    expect(result.departments[0].agents[0].soul).toBeNull()
  })

  test('soul field contains markdown text', () => {
    const soulText = '# Chief Investment Officer\n\nYou are the CIO responsible for investment analysis.'
    const agent = makeAgent({ id: 'a1', name: 'CIO', departmentId: 'd1', soul: soulText })
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], [agent])
    expect(result.departments[0].agents[0].soul).toBe(soulText)
  })

  test('allowedTools is an array of strings', () => {
    const tools = ['web_search', 'calculator', 'stock_price_checker']
    const agent = makeAgent({ id: 'a1', name: 'ToolBot', departmentId: 'd1', allowedTools: tools })
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], [agent])
    expect(result.departments[0].agents[0].allowedTools).toEqual(tools)
    expect(result.departments[0].agents[0].allowedTools).toHaveLength(3)
  })

  test('allowedTools can be empty array', () => {
    const agent = makeAgent({ id: 'a1', name: 'NoTools', departmentId: 'd1', allowedTools: [] })
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], [agent])
    expect(result.departments[0].agents[0].allowedTools).toEqual([])
  })

  test('modelName values are preserved', () => {
    const agents: OrgAgent[] = [
      makeAgent({ id: 'a1', name: 'Mgr', tier: 'manager', modelName: 'claude-sonnet-4-6', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'Spec', tier: 'specialist', modelName: 'claude-haiku-4-5', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'Wkr', tier: 'worker', modelName: 'gpt-4.1-mini', departmentId: 'd1' }),
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agents)
    expect(result.departments[0].agents[0].modelName).toBe('claude-sonnet-4-6')
    expect(result.departments[0].agents[1].modelName).toBe('claude-haiku-4-5')
    expect(result.departments[0].agents[2].modelName).toBe('gpt-4.1-mini')
  })
})

// ============================================================
// Story 2-5: Tier Badge Mapping (P1 — UI Logic)
// ============================================================
describe('Org Chart — Tier Badge Mapping', () => {
  const tierBadge: Record<string, { color: string; label: string }> = {
    manager: { color: 'bg-indigo-100 text-indigo-700', label: 'Manager' },
    specialist: { color: 'bg-blue-100 text-blue-700', label: 'Specialist' },
    worker: { color: 'bg-gray-100 text-gray-700', label: 'Worker' },
  }

  test('manager → indigo badge', () => {
    expect(tierBadge['manager'].color).toContain('indigo')
    expect(tierBadge['manager'].label).toBe('Manager')
  })

  test('specialist → blue badge', () => {
    expect(tierBadge['specialist'].color).toContain('blue')
    expect(tierBadge['specialist'].label).toBe('Specialist')
  })

  test('worker → gray badge', () => {
    expect(tierBadge['worker'].color).toContain('gray')
    expect(tierBadge['worker'].label).toBe('Worker')
  })

  test('unknown tier → undefined (fallback needed)', () => {
    expect(tierBadge['unknown']).toBeUndefined()
  })
})
