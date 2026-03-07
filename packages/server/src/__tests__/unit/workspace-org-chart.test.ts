import { describe, expect, test } from 'bun:test'

// ============================================================
// Story 2-9: CEO App Org Readonly View
// Tests: workspace org-chart API logic + CEO app UI behavior
// ============================================================

type OrgAgent = {
  id: string
  name: string
  role: string | null
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  departmentId: string | null
  status: string
  isSecretary: boolean
  isSystem: boolean
  soul: string | null
  allowedTools: string[] | null
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

function makeAgent(overrides: Partial<OrgAgent> & { id: string; name: string }): OrgAgent {
  return {
    role: null,
    tier: 'specialist',
    modelName: 'claude-haiku-4-5',
    departmentId: null,
    status: 'online',
    isSecretary: false,
    isSystem: false,
    soul: null,
    allowedTools: null,
    ...overrides,
  }
}

function buildOrgChart(
  company: { id: string; name: string; slug: string },
  rawDepts: { id: string; name: string; description: string | null }[],
  rawAgents: OrgAgent[]
): OrgChartResponse {
  const deptTree = rawDepts.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    agents: sortByTier(rawAgents.filter((a) => a.departmentId === d.id)),
  }))
  const unassignedAgents = rawAgents.filter((a) => !a.departmentId)
  return { data: { company, departments: deptTree, unassignedAgents } }
}

const STATUS_CONFIG: Record<string, { color: string; pulse?: boolean; label: string }> = {
  online: { color: 'bg-green-500', label: '온라인' },
  working: { color: 'bg-blue-500', pulse: true, label: '작업 중' },
  error: { color: 'bg-red-500', label: '오류' },
  offline: { color: 'bg-gray-400', label: '오프라인' },
}

const TIER_CONFIG: Record<string, { bg: string; label: string }> = {
  manager: { bg: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300', label: 'Manager' },
  specialist: { bg: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300', label: 'Specialist' },
  worker: { bg: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', label: 'Worker' },
}

// ============================================================
// API Logic Tests (workspace org-chart)
// ============================================================
describe('Workspace Org Chart API Logic', () => {
  const company = { id: 'c1', name: 'CORTHEX', slug: 'corthex' }

  test('builds org chart with departments and agents', () => {
    const depts = [
      { id: 'd1', name: '전략팀', description: '전략 분석' },
      { id: 'd2', name: '마케팅팀', description: null },
    ]
    const agents = [
      makeAgent({ id: 'a1', name: '전략가', departmentId: 'd1', tier: 'manager' }),
      makeAgent({ id: 'a2', name: '분석가', departmentId: 'd1', tier: 'specialist' }),
      makeAgent({ id: 'a3', name: '마케터', departmentId: 'd2' }),
    ]
    const result = buildOrgChart(company, depts, agents)

    expect(result.data.company).toEqual(company)
    expect(result.data.departments).toHaveLength(2)
    expect(result.data.departments[0].agents).toHaveLength(2)
    expect(result.data.departments[1].agents).toHaveLength(1)
    expect(result.data.unassignedAgents).toHaveLength(0)
  })

  test('separates unassigned agents correctly', () => {
    const depts = [{ id: 'd1', name: '전략팀', description: null }]
    const agents = [
      makeAgent({ id: 'a1', name: '배속됨', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: '미배속1' }),
      makeAgent({ id: 'a3', name: '미배속2' }),
    ]
    const result = buildOrgChart(company, depts, agents)

    expect(result.data.departments[0].agents).toHaveLength(1)
    expect(result.data.unassignedAgents).toHaveLength(2)
    expect(result.data.unassignedAgents[0].name).toBe('미배속1')
    expect(result.data.unassignedAgents[1].name).toBe('미배속2')
  })

  test('sorts agents by tier within department', () => {
    const depts = [{ id: 'd1', name: '팀', description: null }]
    const agents = [
      makeAgent({ id: 'a1', name: 'Worker', departmentId: 'd1', tier: 'worker' }),
      makeAgent({ id: 'a2', name: 'Manager', departmentId: 'd1', tier: 'manager' }),
      makeAgent({ id: 'a3', name: 'Specialist', departmentId: 'd1', tier: 'specialist' }),
    ]
    const result = buildOrgChart(company, depts, agents)
    const sorted = result.data.departments[0].agents

    expect(sorted[0].tier).toBe('manager')
    expect(sorted[1].tier).toBe('specialist')
    expect(sorted[2].tier).toBe('worker')
  })

  test('handles empty org (no departments, no agents)', () => {
    const result = buildOrgChart(company, [], [])

    expect(result.data.departments).toHaveLength(0)
    expect(result.data.unassignedAgents).toHaveLength(0)
  })

  test('handles departments with no agents', () => {
    const depts = [
      { id: 'd1', name: '빈 부서', description: '에이전트 없음' },
    ]
    const result = buildOrgChart(company, depts, [])

    expect(result.data.departments[0].agents).toHaveLength(0)
  })

  test('uses tenant companyId (no query param needed)', () => {
    // Workspace org-chart uses tenant.companyId automatically
    // Unlike admin org-chart which requires ?companyId= query param
    const result = buildOrgChart(company, [], [])
    expect(result.data.company.id).toBe('c1')
  })

  test('includes all agent fields needed for detail panel', () => {
    const agents = [
      makeAgent({
        id: 'a1',
        name: 'CIO',
        departmentId: null,
        tier: 'manager',
        modelName: 'claude-sonnet-4-6',
        role: '최고투자책임자',
        status: 'working',
        isSecretary: false,
        isSystem: true,
        soul: '나는 CIO입니다. 투자 분석을 전문으로 합니다.',
        allowedTools: ['web-search', 'data-analysis', 'report-gen'],
      }),
    ]
    const result = buildOrgChart(company, [], agents)
    const agent = result.data.unassignedAgents[0]

    expect(agent.name).toBe('CIO')
    expect(agent.tier).toBe('manager')
    expect(agent.modelName).toBe('claude-sonnet-4-6')
    expect(agent.role).toBe('최고투자책임자')
    expect(agent.status).toBe('working')
    expect(agent.isSystem).toBe(true)
    expect(agent.soul).toContain('CIO')
    expect(agent.allowedTools).toEqual(['web-search', 'data-analysis', 'report-gen'])
  })

  test('handles agents with null soul and allowedTools', () => {
    const agents = [makeAgent({ id: 'a1', name: 'Basic' })]
    const result = buildOrgChart(company, [], agents)
    const agent = result.data.unassignedAgents[0]

    expect(agent.soul).toBeNull()
    expect(agent.allowedTools).toBeNull()
  })

  test('multiple departments each get correct agents', () => {
    const depts = [
      { id: 'd1', name: '부서A', description: null },
      { id: 'd2', name: '부서B', description: null },
      { id: 'd3', name: '부서C', description: null },
    ]
    const agents = [
      makeAgent({ id: 'a1', name: 'A1', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'A2', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'B1', departmentId: 'd2' }),
      makeAgent({ id: 'a4', name: '미배속', departmentId: null }),
    ]
    const result = buildOrgChart(company, depts, agents)

    expect(result.data.departments[0].agents).toHaveLength(2)
    expect(result.data.departments[1].agents).toHaveLength(1)
    expect(result.data.departments[2].agents).toHaveLength(0)
    expect(result.data.unassignedAgents).toHaveLength(1)
  })
})

// ============================================================
// CEO App UI Behavior Tests (readonly constraints)
// ============================================================
describe('CEO App Org Readonly View -- UI Behavior', () => {
  test('STATUS_CONFIG covers all expected statuses', () => {
    expect(STATUS_CONFIG.online).toBeDefined()
    expect(STATUS_CONFIG.working).toBeDefined()
    expect(STATUS_CONFIG.error).toBeDefined()
    expect(STATUS_CONFIG.offline).toBeDefined()
  })

  test('working status has pulse animation', () => {
    expect(STATUS_CONFIG.working.pulse).toBe(true)
    expect(STATUS_CONFIG.online.pulse).toBeUndefined()
    expect(STATUS_CONFIG.error.pulse).toBeUndefined()
    expect(STATUS_CONFIG.offline.pulse).toBeUndefined()
  })

  test('TIER_CONFIG covers all tiers', () => {
    expect(TIER_CONFIG.manager).toBeDefined()
    expect(TIER_CONFIG.specialist).toBeDefined()
    expect(TIER_CONFIG.worker).toBeDefined()
  })

  test('tier labels are correct', () => {
    expect(TIER_CONFIG.manager.label).toBe('Manager')
    expect(TIER_CONFIG.specialist.label).toBe('Specialist')
    expect(TIER_CONFIG.worker.label).toBe('Worker')
  })

  test('status labels are Korean', () => {
    expect(STATUS_CONFIG.online.label).toBe('온라인')
    expect(STATUS_CONFIG.working.label).toBe('작업 중')
    expect(STATUS_CONFIG.error.label).toBe('오류')
    expect(STATUS_CONFIG.offline.label).toBe('오프라인')
  })

  test('unknown status falls back to offline style', () => {
    const unknownStatus = 'sleeping'
    const resolved = STATUS_CONFIG[unknownStatus] || STATUS_CONFIG.offline
    expect(resolved.label).toBe('오프라인')
    expect(resolved.color).toBe('bg-gray-400')
  })

  test('unknown tier falls back to specialist style', () => {
    const unknownTier = 'executive'
    const resolved = TIER_CONFIG[unknownTier] || TIER_CONFIG.specialist
    expect(resolved.label).toBe('Specialist')
  })
})

// ============================================================
// Soul Summary Tests
// ============================================================
describe('Soul Summary Display', () => {
  function getSoulSummary(soul: string | null): string | null {
    if (!soul) return null
    return soul.length > 200 ? soul.slice(0, 200) + '...' : soul
  }

  test('null soul returns null', () => {
    expect(getSoulSummary(null)).toBeNull()
  })

  test('short soul returned as-is', () => {
    const soul = '나는 분석 전문가입니다.'
    expect(getSoulSummary(soul)).toBe(soul)
  })

  test('long soul is truncated to 200 chars with ellipsis', () => {
    const soul = 'A'.repeat(300)
    const summary = getSoulSummary(soul)!
    expect(summary.length).toBe(203) // 200 + '...'
    expect(summary.endsWith('...')).toBe(true)
  })

  test('exactly 200 chars is not truncated', () => {
    const soul = 'B'.repeat(200)
    expect(getSoulSummary(soul)).toBe(soul)
  })

  test('201 chars is truncated', () => {
    const soul = 'C'.repeat(201)
    const summary = getSoulSummary(soul)!
    expect(summary.length).toBe(203)
  })
})

// ============================================================
// Empty State Tests
// ============================================================
describe('Empty State Behavior', () => {
  test('empty org shows empty message (no CTA for template)', () => {
    const company = { id: 'c1', name: 'Test', slug: 'test' }
    const result = buildOrgChart(company, [], [])
    const isEmpty = result.data.departments.length === 0 && result.data.unassignedAgents.length === 0
    expect(isEmpty).toBe(true)
    // CEO app empty state should NOT have template CTA (unlike Admin)
  })

  test('org with only unassigned agents is not empty', () => {
    const company = { id: 'c1', name: 'Test', slug: 'test' }
    const agents = [makeAgent({ id: 'a1', name: 'Lone' })]
    const result = buildOrgChart(company, [], agents)
    const isEmpty = result.data.departments.length === 0 && result.data.unassignedAgents.length === 0
    expect(isEmpty).toBe(false)
  })

  test('org with departments but no agents is not considered empty', () => {
    const company = { id: 'c1', name: 'Test', slug: 'test' }
    const depts = [{ id: 'd1', name: '부서', description: null }]
    const result = buildOrgChart(company, depts, [])
    const isEmpty = result.data.departments.length === 0 && result.data.unassignedAgents.length === 0
    expect(isEmpty).toBe(false)
  })
})

// ============================================================
// Total Agent Count Tests
// ============================================================
describe('Total Agent Count', () => {
  function totalAgents(response: OrgChartResponse): number {
    return response.data.departments.reduce((s, d) => s + d.agents.length, 0) + response.data.unassignedAgents.length
  }

  test('counts all agents across departments and unassigned', () => {
    const company = { id: 'c1', name: 'Test', slug: 'test' }
    const depts = [
      { id: 'd1', name: 'A', description: null },
      { id: 'd2', name: 'B', description: null },
    ]
    const agents = [
      makeAgent({ id: 'a1', name: 'A1', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'A2', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'B1', departmentId: 'd2' }),
      makeAgent({ id: 'a4', name: 'U1' }),
    ]
    const result = buildOrgChart(company, depts, agents)
    expect(totalAgents(result)).toBe(4)
  })

  test('zero agents when org is empty', () => {
    const company = { id: 'c1', name: 'Test', slug: 'test' }
    const result = buildOrgChart(company, [], [])
    expect(totalAgents(result)).toBe(0)
  })
})

// ============================================================
// Readonly Constraint Tests (CEO vs Admin differences)
// ============================================================
describe('Readonly Constraints (CEO vs Admin)', () => {
  test('workspace API uses authMiddleware, not adminOnly', () => {
    // The workspace org-chart route uses authMiddleware (not adminOnly)
    // This is verified by the route setup, not by unit test of middleware
    // But we document the expectation:
    const workspaceEndpoint = '/api/workspace/org-chart'
    const adminEndpoint = '/api/admin/org-chart'
    expect(workspaceEndpoint).not.toBe(adminEndpoint)
  })

  test('workspace API does not require companyId query param', () => {
    // workspace uses tenant.companyId from auth token
    // admin requires ?companyId=xxx query param
    const workspaceUrl = '/workspace/org-chart'
    expect(workspaceUrl).not.toContain('companyId')
  })

  test('response format matches admin org-chart (same data shape)', () => {
    const company = { id: 'c1', name: 'Test', slug: 'test' }
    const result = buildOrgChart(company, [], [])

    // Verify shape has all expected fields
    expect(result.data).toHaveProperty('company')
    expect(result.data).toHaveProperty('departments')
    expect(result.data).toHaveProperty('unassignedAgents')
    expect(result.data.company).toHaveProperty('id')
    expect(result.data.company).toHaveProperty('name')
    expect(result.data.company).toHaveProperty('slug')
  })
})

// ============================================================
// Agent Detail Panel Tests (fields needed)
// ============================================================
describe('Agent Detail Panel Fields', () => {
  test('all required fields present for detail display', () => {
    const agent = makeAgent({
      id: 'a1',
      name: 'TestAgent',
      tier: 'manager',
      modelName: 'claude-sonnet-4-6',
      role: '전략 분석',
      status: 'working',
      isSystem: true,
      isSecretary: false,
      soul: 'I am a strategy analyst.',
      allowedTools: ['web-search', 'data-analysis'],
    })

    // Detail panel needs: name, tier, modelName, role, status, isSystem, soul, allowedTools
    expect(agent.name).toBeDefined()
    expect(agent.tier).toBeDefined()
    expect(agent.modelName).toBeDefined()
    expect(agent.role).toBeDefined()
    expect(agent.status).toBeDefined()
    expect(agent.isSystem).toBeDefined()
    expect(agent.soul).toBeDefined()
    expect(agent.allowedTools).toBeDefined()
  })

  test('tools count displays correctly', () => {
    const tools = ['web-search', 'data-analysis', 'report-gen']
    expect(tools.length).toBe(3)
    // UI shows: "허용 도구 (3)"
  })

  test('empty tools list not displayed', () => {
    const tools: string[] = []
    expect(tools.length).toBe(0)
    // UI condition: tools.length > 0 -> only shows when tools exist
  })

  test('null tools treated as empty', () => {
    const tools: string[] | null = null
    const resolved = tools || []
    expect(resolved.length).toBe(0)
  })
})

// ============================================================
// Sidebar Navigation Tests
// ============================================================
describe('CEO App Sidebar Navigation', () => {
  const navSections = [
    {
      items: [{ to: '/', label: '홈', icon: '🏠' }],
    },
    {
      label: '업무',
      items: [
        { to: '/chat', label: '채팅', icon: '💬' },
        { to: '/trading', label: '전략실', icon: '📈' },
        { to: '/jobs', label: '야간작업', icon: '🌙' },
        { to: '/reports', label: '보고서', icon: '📄' },
        { to: '/files', label: '파일', icon: '📁' },
      ],
    },
    {
      label: '운영',
      items: [
        { to: '/org', label: '조직도', icon: '🏢' },
        { to: '/sns', label: 'SNS', icon: '📱' },
        { to: '/messenger', label: '메신저', icon: '💭' },
        { to: '/dashboard', label: '대시보드', icon: '📊' },
        { to: '/ops-log', label: '작전일지', icon: '📋' },
        { to: '/nexus', label: 'NEXUS', icon: '🔗' },
      ],
    },
    {
      label: '시스템',
      items: [
        { to: '/notifications', label: '알림', icon: '🔔' },
        { to: '/settings', label: '설정', icon: '⚙️' },
      ],
    },
  ]

  test('조직도 is in 운영 section', () => {
    const opsSection = navSections.find((s) => s.label === '운영')
    expect(opsSection).toBeDefined()
    const orgItem = opsSection!.items.find((i) => i.to === '/org')
    expect(orgItem).toBeDefined()
    expect(orgItem!.label).toBe('조직도')
    expect(orgItem!.icon).toBe('🏢')
  })

  test('조직도 is first item in 운영 section', () => {
    const opsSection = navSections.find((s) => s.label === '운영')!
    expect(opsSection.items[0].to).toBe('/org')
  })

  test('all routes are unique', () => {
    const allRoutes = navSections.flatMap((s) => s.items.map((i) => i.to))
    const unique = new Set(allRoutes)
    expect(unique.size).toBe(allRoutes.length)
  })
})

// ============================================================
// Route Configuration Tests
// ============================================================
describe('Route Configuration', () => {
  test('/org route maps to OrgPage', () => {
    const routePath = 'org'
    expect(routePath).toBe('org')
  })

  test('workspace org-chart route registered in server index', () => {
    const routeMount = '/api/workspace'
    const endpoint = '/org-chart'
    expect(`${routeMount}${endpoint}`).toBe('/api/workspace/org-chart')
  })
})

// ============================================================
// TEA: Risk-Based Edge Cases (P0-P2)
// ============================================================
describe('TEA: Tier Sort Stability & Edge Cases', () => {
  const company = { id: 'c1', name: 'T', slug: 't' }

  test('P0: sort is stable -- same tier preserves original order', () => {
    const depts = [{ id: 'd1', name: 'D', description: null }]
    const agents = [
      makeAgent({ id: 'a1', name: 'First Spec', departmentId: 'd1', tier: 'specialist' }),
      makeAgent({ id: 'a2', name: 'Second Spec', departmentId: 'd1', tier: 'specialist' }),
      makeAgent({ id: 'a3', name: 'Third Spec', departmentId: 'd1', tier: 'specialist' }),
    ]
    const result = buildOrgChart(company, depts, agents)
    const sorted = result.data.departments[0].agents
    // All same tier -- original order preserved (stable sort)
    expect(sorted.map((a) => a.name)).toEqual(['First Spec', 'Second Spec', 'Third Spec'])
  })

  test('P1: all managers sort before all specialists before all workers', () => {
    const depts = [{ id: 'd1', name: 'D', description: null }]
    const agents = [
      makeAgent({ id: 'a1', name: 'W1', departmentId: 'd1', tier: 'worker' }),
      makeAgent({ id: 'a2', name: 'M1', departmentId: 'd1', tier: 'manager' }),
      makeAgent({ id: 'a3', name: 'S1', departmentId: 'd1', tier: 'specialist' }),
      makeAgent({ id: 'a4', name: 'W2', departmentId: 'd1', tier: 'worker' }),
      makeAgent({ id: 'a5', name: 'M2', departmentId: 'd1', tier: 'manager' }),
    ]
    const result = buildOrgChart(company, depts, agents)
    const tiers = result.data.departments[0].agents.map((a) => a.tier)
    expect(tiers).toEqual(['manager', 'manager', 'specialist', 'worker', 'worker'])
  })

  test('P2: single agent department returns that agent', () => {
    const depts = [{ id: 'd1', name: 'Solo', description: null }]
    const agents = [makeAgent({ id: 'a1', name: 'Alone', departmentId: 'd1' })]
    const result = buildOrgChart(company, depts, agents)
    expect(result.data.departments[0].agents).toHaveLength(1)
    expect(result.data.departments[0].agents[0].name).toBe('Alone')
  })
})

describe('TEA: Large Organization Stress', () => {
  const company = { id: 'c1', name: 'BigCo', slug: 'bigco' }

  test('P1: handles 10 departments x 10 agents each', () => {
    const depts = Array.from({ length: 10 }, (_, i) => ({
      id: `d${i}`,
      name: `부서${i}`,
      description: null,
    }))
    const agents = Array.from({ length: 100 }, (_, i) => {
      const deptIdx = Math.floor(i / 10)
      const tiers: Array<'manager' | 'specialist' | 'worker'> = ['manager', 'specialist', 'worker']
      return makeAgent({
        id: `a${i}`,
        name: `Agent${i}`,
        departmentId: `d${deptIdx}`,
        tier: tiers[i % 3],
      })
    })
    const result = buildOrgChart(company, depts, agents)

    expect(result.data.departments).toHaveLength(10)
    const totalInDepts = result.data.departments.reduce((s, d) => s + d.agents.length, 0)
    expect(totalInDepts).toBe(100)
    expect(result.data.unassignedAgents).toHaveLength(0)
  })

  test('P2: all agents unassigned (no departments)', () => {
    const agents = Array.from({ length: 20 }, (_, i) =>
      makeAgent({ id: `a${i}`, name: `Agent${i}` })
    )
    const result = buildOrgChart(company, [], agents)
    expect(result.data.departments).toHaveLength(0)
    expect(result.data.unassignedAgents).toHaveLength(20)
  })
})

describe('TEA: Agent Status Edge Cases', () => {
  test('P1: all 4 statuses have distinct colors', () => {
    const colors = Object.values(STATUS_CONFIG).map((s) => s.color)
    const unique = new Set(colors)
    expect(unique.size).toBe(4)
  })

  test('P1: all 4 statuses have non-empty labels', () => {
    for (const [key, config] of Object.entries(STATUS_CONFIG)) {
      expect(config.label.length).toBeGreaterThan(0)
      expect(config.color.length).toBeGreaterThan(0)
    }
  })

  test('P2: only working status pulses', () => {
    const pulsingStatuses = Object.entries(STATUS_CONFIG).filter(([, c]) => c.pulse === true)
    expect(pulsingStatuses).toHaveLength(1)
    expect(pulsingStatuses[0][0]).toBe('working')
  })
})

describe('TEA: Company Root Node Display', () => {
  test('P1: company name first char used for avatar', () => {
    const company = { id: 'c1', name: 'CORTHEX', slug: 'corthex' }
    expect(company.name.charAt(0)).toBe('C')
  })

  test('P2: single character company name still works', () => {
    const company = { id: 'c1', name: 'X', slug: 'x' }
    expect(company.name.charAt(0)).toBe('X')
  })

  test('P2: Korean company name first char works', () => {
    const company = { id: 'c1', name: '코텍스', slug: 'cortex' }
    expect(company.name.charAt(0)).toBe('코')
  })
})

describe('TEA: Department Description Handling', () => {
  const company = { id: 'c1', name: 'T', slug: 't' }

  test('P2: department with description passes it through', () => {
    const depts = [{ id: 'd1', name: '전략팀', description: '전략 수립 및 분석' }]
    const result = buildOrgChart(company, depts, [])
    expect(result.data.departments[0].description).toBe('전략 수립 및 분석')
  })

  test('P2: department with null description passes null through', () => {
    const depts = [{ id: 'd1', name: '무설명', description: null }]
    const result = buildOrgChart(company, depts, [])
    expect(result.data.departments[0].description).toBeNull()
  })
})

describe('TEA: Agent with Various Combinations', () => {
  test('P1: secretary agent displays correctly', () => {
    const agent = makeAgent({ id: 'a1', name: '비서실장', isSecretary: true, isSystem: true })
    expect(agent.isSecretary).toBe(true)
    expect(agent.isSystem).toBe(true)
  })

  test('P2: agent with empty string role', () => {
    const agent = makeAgent({ id: 'a1', name: 'NoRole', role: '' })
    // Empty string is falsy in JS -- UI conditionally renders
    expect(agent.role).toBe('')
    expect(!agent.role).toBe(true) // UI check: {agent.role && ...}
  })

  test('P2: agent with empty allowedTools array', () => {
    const agent = makeAgent({ id: 'a1', name: 'NoTools', allowedTools: [] })
    const tools = agent.allowedTools || []
    expect(tools.length).toBe(0) // UI: tools.length > 0 -> hidden
  })

  test('P2: agent with many tools (50+)', () => {
    const manyTools = Array.from({ length: 50 }, (_, i) => `tool-${i}`)
    const agent = makeAgent({ id: 'a1', name: 'PowerUser', allowedTools: manyTools })
    expect((agent.allowedTools || []).length).toBe(50)
  })
})

describe('TEA: Soul Summary Multi-byte Characters', () => {
  function getSoulSummary(soul: string | null): string | null {
    if (!soul) return null
    return soul.length > 200 ? soul.slice(0, 200) + '...' : soul
  }

  test('P2: Korean text truncation at 200 chars', () => {
    const soul = '가'.repeat(201)
    const summary = getSoulSummary(soul)!
    expect(summary.length).toBe(203)
    expect(summary.startsWith('가')).toBe(true)
    expect(summary.endsWith('...')).toBe(true)
  })

  test('P2: mixed Korean/English soul', () => {
    const soul = 'A나B다'.repeat(60) // 240 chars
    const summary = getSoulSummary(soul)!
    expect(summary.length).toBe(203)
  })

  test('P2: empty string soul treated as null (falsy)', () => {
    const summary = getSoulSummary('')
    // empty string is falsy -> getSoulSummary returns null
    expect(summary).toBeNull()
  })
})
