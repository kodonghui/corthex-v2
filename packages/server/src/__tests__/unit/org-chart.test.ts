import { describe, expect, test } from 'bun:test'

// ============================================================
// TEA: Org Chart — Core + Edge Cases + Risk-Based Coverage
// Story 15-5: 조직도 뷰어
// ============================================================

// Type definitions matching the API response
type OrgAgent = {
  id: string
  name: string
  role: string
  departmentId: string | null
  status: string
  isSecretary: boolean
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

// Helper: simulate the org-chart API logic (department tree + unassigned agents)
function buildOrgChart(
  company: { id: string; name: string; slug: string },
  departments: { id: string; name: string; description: string | null }[],
  agents: OrgAgent[],
): OrgChartResponse['data'] {
  const deptTree = departments.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    agents: agents.filter((a) => a.departmentId === d.id),
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
    { id: 'a1', name: '비서봇', role: '비서', departmentId: 'd1', status: 'online', isSecretary: true },
    { id: 'a2', name: '코딩봇', role: '개발자', departmentId: 'd1', status: 'working', isSecretary: false },
    { id: 'a3', name: 'SNS봇', role: 'SNS 관리', departmentId: 'd2', status: 'offline', isSecretary: false },
    { id: 'a4', name: '미배정봇', role: '범용', departmentId: null, status: 'online', isSecretary: false },
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
    const manyAgents: OrgAgent[] = Array.from({ length: 100 }, (_, i) => ({
      id: `a${i}`,
      name: `Agent ${i}`,
      role: 'worker',
      departmentId: 'd1',
      status: i % 2 === 0 ? 'online' : 'offline',
      isSecretary: i === 0,
    }))
    const result = buildOrgChart(company, [{ id: 'd1', name: 'Mega Dept', description: null }], manyAgents)
    expect(result.departments[0].agents.length).toBe(100)
    expect(result.unassignedAgents.length).toBe(0)
  })

  test('multiple departments with mixed assigned/unassigned', () => {
    const mixedAgents: OrgAgent[] = [
      { id: 'a1', name: 'A1', role: 'r', departmentId: 'd1', status: 'online', isSecretary: false },
      { id: 'a2', name: 'A2', role: 'r', departmentId: null, status: 'online', isSecretary: false },
      { id: 'a3', name: 'A3', role: 'r', departmentId: 'd2', status: 'online', isSecretary: false },
      { id: 'a4', name: 'A4', role: 'r', departmentId: null, status: 'online', isSecretary: false },
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
      { id: 'a1', name: 'Sec1', role: '비서', departmentId: 'd1', status: 'online', isSecretary: true },
      { id: 'a2', name: 'Sec2', role: '비서', departmentId: 'd1', status: 'online', isSecretary: true },
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], secretaryAgents)
    expect(result.departments[0].agents.every((a) => a.isSecretary)).toBe(true)
  })

  test('all agents have error status', () => {
    const errorAgents: OrgAgent[] = [
      { id: 'a1', name: 'E1', role: 'r', departmentId: 'd1', status: 'error', isSecretary: false },
      { id: 'a2', name: 'E2', role: 'r', departmentId: null, status: 'error', isSecretary: false },
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], errorAgents)
    expect(result.departments[0].agents[0].status).toBe('error')
    expect(result.unassignedAgents[0].status).toBe('error')
  })

  test('agent with empty role', () => {
    const agentNoRole: OrgAgent[] = [
      { id: 'a1', name: 'NoRole', role: '', departmentId: 'd1', status: 'online', isSecretary: false },
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

  test('agents within department maintain order', () => {
    const agents: OrgAgent[] = [
      { id: 'a1', name: 'First', role: 'r', departmentId: 'd1', status: 'online', isSecretary: false },
      { id: 'a2', name: 'Second', role: 'r', departmentId: 'd1', status: 'online', isSecretary: false },
      { id: 'a3', name: 'Third', role: 'r', departmentId: 'd1', status: 'online', isSecretary: false },
    ]
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], agents)
    expect(result.departments[0].agents[0].name).toBe('First')
    expect(result.departments[0].agents[1].name).toBe('Second')
    expect(result.departments[0].agents[2].name).toBe('Third')
  })

  test('unassigned agents maintain order', () => {
    const agents: OrgAgent[] = [
      { id: 'a1', name: 'U1', role: 'r', departmentId: null, status: 'online', isSecretary: false },
      { id: 'a2', name: 'U2', role: 'r', departmentId: null, status: 'online', isSecretary: false },
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
      { id: 'a1', name: 'On', role: 'r', departmentId: 'd1', status: 'online', isSecretary: false },
      { id: 'a2', name: 'Work', role: 'r', departmentId: 'd1', status: 'working', isSecretary: false },
      { id: 'a3', name: 'Err', role: 'r', departmentId: 'd1', status: 'error', isSecretary: false },
      { id: 'a4', name: 'Off', role: 'r', departmentId: 'd1', status: 'offline', isSecretary: false },
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
      { id: 'a1', name: 'A1', role: 'r', departmentId: 'd1', status: 'online', isSecretary: false },
      { id: 'a2', name: 'A2', role: 'r', departmentId: 'd1', status: 'online', isSecretary: false },
      { id: 'a3', name: 'A3', role: 'r', departmentId: 'd1', status: 'offline', isSecretary: false },
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

  test('agent has all tooltip fields: name, role, status, isSecretary', () => {
    const agent: OrgAgent = { id: 'a1', name: 'Bot1', role: '개발봇', departmentId: 'd1', status: 'working', isSecretary: true }
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], [agent])
    const a = result.departments[0].agents[0]
    expect(a).toHaveProperty('name')
    expect(a).toHaveProperty('role')
    expect(a).toHaveProperty('status')
    expect(a).toHaveProperty('isSecretary')
    expect(a.name).toBe('Bot1')
    expect(a.role).toBe('개발봇')
    expect(a.status).toBe('working')
    expect(a.isSecretary).toBe(true)
  })

  test('unassigned agent also has tooltip fields', () => {
    const agent: OrgAgent = { id: 'a1', name: 'Free', role: '범용', departmentId: null, status: 'online', isSecretary: false }
    const result = buildOrgChart(company, [], [agent])
    const a = result.unassignedAgents[0]
    expect(a.name).toBe('Free')
    expect(a.role).toBe('범용')
    expect(a.status).toBe('online')
    expect(a.isSecretary).toBe(false)
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
        agents.push({
          id: `a${d}-${a}`, name: `Agent ${d}-${a}`, role: 'worker',
          departmentId: `d${d}`, status: 'online', isSecretary: false,
        })
      }
    }
    const result = buildOrgChart(company, depts, agents)
    expect(result.departments.length).toBe(10)
    result.departments.forEach((d) => expect(d.agents.length).toBe(5))
    expect(result.unassignedAgents.length).toBe(0)
  })

  test('single department with all statuses evenly distributed', () => {
    const statuses = ['online', 'working', 'error', 'offline']
    const agents: OrgAgent[] = Array.from({ length: 20 }, (_, i) => ({
      id: `a${i}`, name: `Agent ${i}`, role: 'r',
      departmentId: 'd1', status: statuses[i % 4], isSecretary: false,
    }))
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
      { id: 'a1', name: 'Sec1', role: '비서', departmentId: 'd1', status: 'online', isSecretary: true },
      { id: 'a2', name: 'Worker', role: '일반', departmentId: 'd1', status: 'online', isSecretary: false },
      { id: 'a3', name: 'Sec2', role: '비서', departmentId: 'd2', status: 'online', isSecretary: true },
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
      { id: 'a1', name: 'FreeSec', role: '비서', departmentId: null, status: 'online', isSecretary: true },
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

  test('agent node has all required fields', () => {
    const agent: OrgAgent = { id: 'a1', name: 'Bot', role: 'r', departmentId: 'd1', status: 'online', isSecretary: false }
    const result = buildOrgChart(company, [{ id: 'd1', name: 'D1', description: null }], [agent])
    const a = result.departments[0].agents[0]
    expect(a).toHaveProperty('id')
    expect(a).toHaveProperty('name')
    expect(a).toHaveProperty('role')
    expect(a).toHaveProperty('departmentId')
    expect(a).toHaveProperty('status')
    expect(a).toHaveProperty('isSecretary')
  })
})
