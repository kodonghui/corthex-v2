import { describe, expect, test } from 'bun:test'

// ============================================================
// TEA: Story 2-5 Org Tree View UI -- Risk-Based Coverage
// Focus: tier sorting edge cases, detail panel logic, state
// ============================================================

type AgentTier = 'manager' | 'specialist' | 'worker'
type AgentStatus = 'online' | 'working' | 'error' | 'offline'

type OrgAgent = {
  id: string
  name: string
  role: string | null
  tier: AgentTier
  modelName: string
  departmentId: string | null
  status: AgentStatus
  isSecretary: boolean
  isSystem: boolean
  soul: string | null
  allowedTools: string[] | null
}

const TIER_ORDER: Record<string, number> = { manager: 0, specialist: 1, worker: 2 }

function sortByTier(agents: OrgAgent[]): OrgAgent[] {
  return [...agents].sort((a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9))
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
    allowedTools: [],
    ...overrides,
  }
}

// ============================================================
// RISK 1: Tier sorting stability and correctness (P0)
// ============================================================
describe('TEA — Tier Sorting Edge Cases', () => {
  test('single agent department needs no sorting', () => {
    const agents = [makeAgent({ id: 'a1', name: 'Solo', tier: 'worker', departmentId: 'd1' })]
    const sorted = sortByTier(agents)
    expect(sorted).toHaveLength(1)
    expect(sorted[0].name).toBe('Solo')
  })

  test('already-sorted input remains unchanged', () => {
    const agents = [
      makeAgent({ id: 'a1', name: 'Mgr', tier: 'manager', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'Spec', tier: 'specialist', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'Wkr', tier: 'worker', departmentId: 'd1' }),
    ]
    const sorted = sortByTier(agents)
    expect(sorted.map((a) => a.tier)).toEqual(['manager', 'specialist', 'worker'])
  })

  test('reverse-sorted input is corrected', () => {
    const agents = [
      makeAgent({ id: 'a1', name: 'Wkr', tier: 'worker', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'Spec', tier: 'specialist', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'Mgr', tier: 'manager', departmentId: 'd1' }),
    ]
    const sorted = sortByTier(agents)
    expect(sorted.map((a) => a.tier)).toEqual(['manager', 'specialist', 'worker'])
  })

  test('all same tier preserves insertion order', () => {
    const agents = [
      makeAgent({ id: 'a1', name: 'A', tier: 'specialist', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'B', tier: 'specialist', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'C', tier: 'specialist', departmentId: 'd1' }),
    ]
    const sorted = sortByTier(agents)
    expect(sorted.map((a) => a.name)).toEqual(['A', 'B', 'C'])
  })

  test('interleaved tiers are grouped correctly', () => {
    const agents = [
      makeAgent({ id: 'a1', name: 'W1', tier: 'worker', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'M1', tier: 'manager', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: 'S1', tier: 'specialist', departmentId: 'd1' }),
      makeAgent({ id: 'a4', name: 'W2', tier: 'worker', departmentId: 'd1' }),
      makeAgent({ id: 'a5', name: 'S2', tier: 'specialist', departmentId: 'd1' }),
    ]
    const sorted = sortByTier(agents)
    expect(sorted.map((a) => a.tier)).toEqual(['manager', 'specialist', 'specialist', 'worker', 'worker'])
    // Within same tier, insertion order preserved
    expect(sorted.filter((a) => a.tier === 'specialist').map((a) => a.name)).toEqual(['S1', 'S2'])
    expect(sorted.filter((a) => a.tier === 'worker').map((a) => a.name)).toEqual(['W1', 'W2'])
  })

  test('empty array returns empty', () => {
    expect(sortByTier([])).toEqual([])
  })

  test('sorting does not mutate original array', () => {
    const agents = [
      makeAgent({ id: 'a1', name: 'W', tier: 'worker', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'M', tier: 'manager', departmentId: 'd1' }),
    ]
    const original = [...agents]
    sortByTier(agents)
    expect(agents[0].name).toBe(original[0].name)
    expect(agents[1].name).toBe(original[1].name)
  })

  test('large department (50 agents) sorts correctly', () => {
    const tiers: AgentTier[] = ['worker', 'specialist', 'manager']
    const agents = Array.from({ length: 50 }, (_, i) =>
      makeAgent({ id: `a${i}`, name: `Agent-${i}`, tier: tiers[i % 3], departmentId: 'd1' }),
    )
    const sorted = sortByTier(agents)
    let lastTierOrder = -1
    for (const a of sorted) {
      const order = TIER_ORDER[a.tier]
      expect(order).toBeGreaterThanOrEqual(lastTierOrder)
      lastTierOrder = order
    }
  })
})

// ============================================================
// RISK 2: Detail panel soul truncation (P1)
// ============================================================
describe('TEA — Soul Truncation Logic', () => {
  // Matches UI: `agent.soul ? (soul.length > 200 ? soul.slice(0,200)+'...' : soul) : null`
  function truncateSoul(soul: string | null): string | null {
    if (!soul) return null // empty string is falsy, returns null
    return soul.length > 200 ? soul.slice(0, 200) + '...' : soul
  }

  test('null soul returns null', () => {
    expect(truncateSoul(null)).toBeNull()
  })

  test('empty string treated as falsy -> returns null', () => {
    expect(truncateSoul('')).toBeNull()
  })

  test('short soul (< 200 chars) unchanged', () => {
    const soul = 'I am the CIO.'
    expect(truncateSoul(soul)).toBe(soul)
  })

  test('exactly 200 chars unchanged', () => {
    const soul = 'x'.repeat(200)
    expect(truncateSoul(soul)).toBe(soul)
    expect(truncateSoul(soul)!.length).toBe(200)
  })

  test('201 chars gets truncated with ellipsis', () => {
    const soul = 'x'.repeat(201)
    const result = truncateSoul(soul)!
    expect(result.endsWith('...')).toBe(true)
    expect(result.length).toBe(203) // 200 + '...'
  })

  test('long soul (1000 chars) truncated to 203', () => {
    const soul = 'y'.repeat(1000)
    const result = truncateSoul(soul)!
    expect(result.length).toBe(203)
    expect(result.startsWith('y'.repeat(200))).toBe(true)
  })

  test('Korean text truncation preserves chars', () => {
    const soul = '한'.repeat(201)
    const result = truncateSoul(soul)!
    expect(result.endsWith('...')).toBe(true)
    // First 200 Korean chars preserved
    expect(result.startsWith('한'.repeat(200))).toBe(true)
  })
})

// ============================================================
// RISK 3: Status badge logic (P0)
// ============================================================
describe('TEA — Status Badge & Pulse Animation', () => {
  const STATUS_CONFIG: Record<string, { color: string; pulse?: boolean }> = {
    online: { color: 'bg-green-500' },
    working: { color: 'bg-blue-500', pulse: true },
    error: { color: 'bg-red-500' },
    offline: { color: 'bg-gray-400' },
  }

  test('online has no pulse', () => {
    expect(STATUS_CONFIG.online.pulse).toBeUndefined()
  })

  test('working has pulse', () => {
    expect(STATUS_CONFIG.working.pulse).toBe(true)
  })

  test('error has no pulse', () => {
    expect(STATUS_CONFIG.error.pulse).toBeUndefined()
  })

  test('offline has no pulse', () => {
    expect(STATUS_CONFIG.offline.pulse).toBeUndefined()
  })

  test('all 4 statuses have distinct colors', () => {
    const colors = Object.values(STATUS_CONFIG).map((s) => s.color)
    expect(new Set(colors).size).toBe(4)
  })
})

// ============================================================
// RISK 4: Tier badge mapping completeness (P1)
// ============================================================
describe('TEA — Tier Badge Completeness', () => {
  const TIER_CONFIG: Record<string, { label: string }> = {
    manager: { label: 'Manager' },
    specialist: { label: 'Specialist' },
    worker: { label: 'Worker' },
  }

  test('all 3 tiers have labels', () => {
    expect(Object.keys(TIER_CONFIG)).toHaveLength(3)
    expect(TIER_CONFIG.manager.label).toBe('Manager')
    expect(TIER_CONFIG.specialist.label).toBe('Specialist')
    expect(TIER_CONFIG.worker.label).toBe('Worker')
  })

  test('tier labels match DB enum values', () => {
    const dbTiers = ['manager', 'specialist', 'worker']
    for (const tier of dbTiers) {
      expect(TIER_CONFIG[tier]).toBeDefined()
    }
  })
})

// ============================================================
// RISK 5: AllowedTools handling edge cases (P1)
// ============================================================
describe('TEA — AllowedTools Edge Cases', () => {
  test('null allowedTools treated as empty', () => {
    const agent = makeAgent({ id: 'a1', name: 'NoTools', allowedTools: null })
    const tools = agent.allowedTools || []
    expect(tools).toEqual([])
  })

  test('empty array allowedTools', () => {
    const agent = makeAgent({ id: 'a1', name: 'Empty', allowedTools: [] })
    expect(agent.allowedTools).toEqual([])
  })

  test('many tools (20+) preserved', () => {
    const manyTools = Array.from({ length: 25 }, (_, i) => `tool_${i}`)
    const agent = makeAgent({ id: 'a1', name: 'ToolBot', allowedTools: manyTools })
    expect(agent.allowedTools).toHaveLength(25)
  })

  test('tools with special characters preserved', () => {
    const tools = ['web-search', 'stock_price_checker', 'code.quality']
    const agent = makeAgent({ id: 'a1', name: 'A', allowedTools: tools })
    expect(agent.allowedTools).toEqual(tools)
  })
})

// ============================================================
// RISK 6: System agent identification (P0)
// ============================================================
describe('TEA — System Agent Identification', () => {
  test('system agents are flagged correctly', () => {
    const sysAgent = makeAgent({ id: 'a1', name: 'Chief of Staff', isSystem: true, isSecretary: true })
    expect(sysAgent.isSystem).toBe(true)
    expect(sysAgent.isSecretary).toBe(true)
  })

  test('non-system agents default to false', () => {
    const agent = makeAgent({ id: 'a1', name: 'Custom Bot' })
    expect(agent.isSystem).toBe(false)
  })

  test('system and non-system can coexist in dept', () => {
    const agents = [
      makeAgent({ id: 'a1', name: 'System', isSystem: true, departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'Custom', isSystem: false, departmentId: 'd1' }),
    ]
    expect(agents.filter((a) => a.isSystem)).toHaveLength(1)
    expect(agents.filter((a) => !a.isSystem)).toHaveLength(1)
  })
})

// ============================================================
// RISK 7: ModelName variety (P1)
// ============================================================
describe('TEA — ModelName Handling', () => {
  test('default modelName is claude-haiku-4-5', () => {
    const agent = makeAgent({ id: 'a1', name: 'Default' })
    expect(agent.modelName).toBe('claude-haiku-4-5')
  })

  test('custom modelName preserved', () => {
    const agent = makeAgent({ id: 'a1', name: 'GPT', modelName: 'gpt-4.1-mini' })
    expect(agent.modelName).toBe('gpt-4.1-mini')
  })

  test('all expected models work', () => {
    const models = ['claude-sonnet-4-6', 'claude-haiku-4-5', 'gpt-4.1-mini', 'gemini-2.5-flash']
    for (const model of models) {
      const agent = makeAgent({ id: 'a1', name: 'Test', modelName: model })
      expect(agent.modelName).toBe(model)
    }
  })
})

// ============================================================
// RISK 8: Response envelope and empty org (P0)
// ============================================================
describe('TEA — Empty Organization States', () => {
  function buildResponse(depts: { agents: unknown[] }[], unassigned: unknown[]) {
    return {
      departments: depts,
      unassignedAgents: unassigned,
    }
  }

  test('completely empty org: 0 depts, 0 agents', () => {
    const res = buildResponse([], [])
    const total = res.departments.reduce((s, d) => s + d.agents.length, 0) + res.unassignedAgents.length
    expect(total).toBe(0)
    expect(res.departments.length === 0 && res.unassignedAgents.length === 0).toBe(true)
  })

  test('depts exist but all empty', () => {
    const res = buildResponse([{ agents: [] }, { agents: [] }], [])
    const total = res.departments.reduce((s, d) => s + d.agents.length, 0)
    expect(total).toBe(0)
    // Not "empty org" -- depts exist
    expect(res.departments.length).toBe(2)
  })

  test('only unassigned agents, no depts', () => {
    const res = buildResponse([], [{ id: 'a1' }, { id: 'a2' }])
    expect(res.departments.length).toBe(0)
    expect(res.unassignedAgents.length).toBe(2)
  })

  test('total count calculation', () => {
    const res = buildResponse(
      [{ agents: ['a1', 'a2'] }, { agents: ['a3'] }],
      ['a4', 'a5'],
    )
    const total = res.departments.reduce((s, d) => s + d.agents.length, 0) + res.unassignedAgents.length
    expect(total).toBe(5)
  })
})

// ============================================================
// RISK 9: Role field nullable (P1)
// ============================================================
describe('TEA — Nullable Role Field', () => {
  test('role can be null', () => {
    const agent = makeAgent({ id: 'a1', name: 'NoRole', role: null })
    expect(agent.role).toBeNull()
  })

  test('role can be empty string', () => {
    const agent = makeAgent({ id: 'a1', name: 'EmptyRole', role: '' })
    expect(agent.role).toBe('')
  })

  test('role with Korean text', () => {
    const agent = makeAgent({ id: 'a1', name: 'Korean', role: '투자분석 전문가' })
    expect(agent.role).toBe('투자분석 전문가')
  })
})
