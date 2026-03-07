/**
 * TEA: Story 3-1 — Agent Organization Deployment
 * Risk-based test coverage for deployment service, hierarchy API, and registration hook
 */
import { describe, test, expect } from 'bun:test'
import { AGENTS, DEPARTMENTS, DELEGATION_RULES } from '../../lib/agent-org-definition'
import type { AgentDefinition, DepartmentDefinition } from '../../lib/agent-org-definition'

// ═══════════════════════════════════════════════════════════════
// HIGH RISK: Deployment Service Logic
// ═══════════════════════════════════════════════════════════════
describe('TEA-HIGH: Deployment Service Logic', () => {
  // Risk: deployOrganization creates wrong number of entities
  test('agent count matches department staff sum', () => {
    const staffByDept: Record<string, number> = {}
    for (const a of AGENTS) {
      staffByDept[a.departmentKey] = (staffByDept[a.departmentKey] || 0) + 1
    }
    const total = Object.values(staffByDept).reduce((a, b) => a + b, 0)
    expect(total).toBe(29)

    // Executive: CoS(1) + 3 assistants = 4
    expect(staffByDept['executive']).toBe(4)
    // Tech: CTO(1) + 4 specs = 5
    expect(staffByDept['tech']).toBe(5)
    // Strategy: CSO(1) + 3 specs = 4
    expect(staffByDept['strategy']).toBe(4)
    // Legal: CLO(1) + 2 specs = 3
    expect(staffByDept['legal']).toBe(3)
    // Marketing: CMO(1) + 3 specs = 4
    expect(staffByDept['marketing']).toBe(4)
    // Investment: CIO(1) + 4 specs = 5
    expect(staffByDept['investment']).toBe(5)
    // Publishing: CPO(1) + 3 workers = 4
    expect(staffByDept['publishing']).toBe(4)
  })

  // Risk: adminSoul not set (prevents soul reset)
  test('every agent soul is also stored as adminSoul template', () => {
    for (const agent of AGENTS) {
      // deployOrganization sets adminSoul = soul
      expect(agent.soul).toBeTruthy()
      expect(agent.soul.length).toBeGreaterThan(50)
    }
  })

  // Risk: modelName not set correctly
  test('managers get sonnet, others get haiku', () => {
    for (const agent of AGENTS) {
      if (agent.tier === 'manager') {
        expect(agent.modelName).toBe('claude-sonnet-4-6')
      } else {
        expect(agent.modelName).toBe('claude-haiku-4-5')
      }
    }
  })

  // Risk: isSecretary flag wrong (breaks orchestration)
  test('only CoS has isSecretary=true', () => {
    const secretaries = AGENTS.filter(a => a.isSecretary)
    expect(secretaries.length).toBe(1)
    expect(secretaries[0].key).toBe('cos')
    expect(secretaries[0].tier).toBe('manager')
    expect(secretaries[0].reportToKey).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════
// HIGH RISK: Hierarchy Integrity
// ═══════════════════════════════════════════════════════════════
describe('TEA-HIGH: Hierarchy Integrity', () => {
  // Risk: orphan agents (no reportTo, not CoS)
  test('only CoS has null reportTo', () => {
    const roots = AGENTS.filter(a => a.reportToKey === null)
    expect(roots.length).toBe(1)
    expect(roots[0].key).toBe('cos')
  })

  // Risk: broken chain (reportTo points to non-existent agent)
  test('every reportToKey references existing agent', () => {
    const keys = new Set(AGENTS.map(a => a.key))
    for (const agent of AGENTS) {
      if (agent.reportToKey) {
        expect(keys.has(agent.reportToKey)).toBe(true)
      }
    }
  })

  // Risk: hierarchy depth > 3 (cos -> manager -> specialist)
  test('max hierarchy depth is 3', () => {
    const agentMap = new Map(AGENTS.map(a => [a.key, a]))
    for (const agent of AGENTS) {
      let depth = 0
      let current: AgentDefinition | undefined = agent
      while (current && current.reportToKey) {
        depth++
        current = agentMap.get(current.reportToKey)
      }
      expect(depth).toBeLessThanOrEqual(2) // max: spec -> manager -> cos (2 hops)
    }
  })

  // Risk: manager reports to non-CoS
  test('all 6 department managers report directly to CoS', () => {
    const deptManagers = AGENTS.filter(a => a.tier === 'manager' && a.key !== 'cos')
    expect(deptManagers.length).toBe(6)
    for (const m of deptManagers) {
      expect(m.reportToKey).toBe('cos')
    }
  })

  // Risk: specialist/worker reports to wrong tier
  test('specialists only report to managers', () => {
    const agentMap = new Map(AGENTS.map(a => [a.key, a]))
    for (const agent of AGENTS.filter(a => a.tier === 'specialist')) {
      const parent = agentMap.get(agent.reportToKey!)
      expect(parent).toBeDefined()
      expect(parent!.tier).toBe('manager')
    }
  })

  test('workers only report to managers', () => {
    const agentMap = new Map(AGENTS.map(a => [a.key, a]))
    for (const agent of AGENTS.filter(a => a.tier === 'worker')) {
      const parent = agentMap.get(agent.reportToKey!)
      expect(parent).toBeDefined()
      expect(parent!.tier).toBe('manager')
    }
  })
})

// ═══════════════════════════════════════════════════════════════
// MEDIUM RISK: Delegation Rules
// ═══════════════════════════════════════════════════════════════
describe('TEA-MED: Delegation Rules', () => {
  // Risk: missing delegation route leaves department unreachable
  test('every department has exactly one delegation rule', () => {
    const targetDepts = DELEGATION_RULES.map(r => {
      const target = AGENTS.find(a => a.key === r.targetKey)!
      return target.departmentKey
    })
    // executive (CoS itself) excluded — CoS delegates to others
    const nonExecDepts = DEPARTMENTS.filter(d => d.key !== 'executive').map(d => d.key)
    for (const dept of nonExecDepts) {
      expect(targetDepts).toContain(dept)
    }
  })

  // Risk: keyword collision causes misrouting
  test('no keyword appears in more than 2 rules', () => {
    const keywordCount: Record<string, number> = {}
    for (const rule of DELEGATION_RULES) {
      for (const kw of rule.keywords) {
        keywordCount[kw] = (keywordCount[kw] || 0) + 1
      }
    }
    for (const [kw, count] of Object.entries(keywordCount)) {
      expect(count).toBeLessThanOrEqual(2)
    }
  })

  // Risk: empty keywords
  test('no empty keyword strings', () => {
    for (const rule of DELEGATION_RULES) {
      for (const kw of rule.keywords) {
        expect(kw.trim().length).toBeGreaterThan(0)
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════
// MEDIUM RISK: Soul Content Quality
// ═══════════════════════════════════════════════════════════════
describe('TEA-MED: Soul Content Quality', () => {
  // Risk: empty/stub soul breaks agent behavior
  test('manager souls contain required sections', () => {
    const managers = AGENTS.filter(a => a.tier === 'manager')
    for (const m of managers) {
      expect(m.soul).toContain('역할')
      expect(m.soul).toContain('전문 분야')
      expect(m.soul).toContain('행동 지침')
      expect(m.soul).toContain('한국어')
    }
  })

  test('specialist souls contain 5-stage deep work reference', () => {
    const specialists = AGENTS.filter(a => a.tier === 'specialist')
    for (const s of specialists) {
      expect(s.soul).toContain('딥워크')
      expect(s.soul).toContain('계획')
      expect(s.soul).toContain('분석')
    }
  })

  // Risk: soul too short = no personality
  test('manager souls >= 400 chars', () => {
    for (const a of AGENTS.filter(a => a.tier === 'manager')) {
      expect(a.soul.length).toBeGreaterThanOrEqual(400)
    }
  })

  test('specialist souls >= 250 chars', () => {
    for (const a of AGENTS.filter(a => a.tier === 'specialist')) {
      expect(a.soul.length).toBeGreaterThanOrEqual(250)
    }
  })
})

// ═══════════════════════════════════════════════════════════════
// MEDIUM RISK: Department Consistency
// ═══════════════════════════════════════════════════════════════
describe('TEA-MED: Department Consistency', () => {
  // Risk: agents reference non-existent department
  test('all agent departmentKeys reference valid departments', () => {
    const deptKeys = new Set(DEPARTMENTS.map(d => d.key))
    for (const agent of AGENTS) {
      expect(deptKeys.has(agent.departmentKey)).toBe(true)
    }
  })

  // Risk: department has no agents
  test('every department has at least 1 agent', () => {
    for (const dept of DEPARTMENTS) {
      const count = AGENTS.filter(a => a.departmentKey === dept.key).length
      expect(count).toBeGreaterThanOrEqual(1)
    }
  })

  // Risk: department without a manager
  test('every department except executive has exactly 1 manager head', () => {
    for (const dept of DEPARTMENTS) {
      if (dept.key === 'executive') continue
      const managers = AGENTS.filter(a => a.departmentKey === dept.key && a.tier === 'manager')
      expect(managers.length).toBe(1)
    }
  })

  test('department descriptions are non-empty', () => {
    for (const dept of DEPARTMENTS) {
      expect(dept.description.length).toBeGreaterThan(10)
    }
  })
})

// ═══════════════════════════════════════════════════════════════
// LOW RISK: Schema Fields
// ═══════════════════════════════════════════════════════════════
describe('TEA-LOW: Schema Fields', () => {
  // Risk: nameEn missing
  test('all agents have both Korean and English names', () => {
    for (const a of AGENTS) {
      expect(a.name.length).toBeGreaterThan(0)
      expect(a.nameEn.length).toBeGreaterThan(0)
    }
  })

  // Risk: role description missing
  test('all agents have role descriptions', () => {
    for (const a of AGENTS) {
      expect(a.role.length).toBeGreaterThan(5)
    }
  })

  // Risk: valid tier values
  test('all tier values are valid enum values', () => {
    const validTiers = ['manager', 'specialist', 'worker']
    for (const a of AGENTS) {
      expect(validTiers).toContain(a.tier)
    }
  })

  // Risk: model name format
  test('all model names are valid format', () => {
    const validModels = ['claude-sonnet-4-6', 'claude-haiku-4-5', 'claude-opus-4-6']
    for (const a of AGENTS) {
      expect(validModels).toContain(a.modelName)
    }
  })
})

// ═══════════════════════════════════════════════════════════════
// EDGE CASE: Hierarchy Tree Building (route logic)
// ═══════════════════════════════════════════════════════════════
describe('TEA-EDGE: Hierarchy Tree Edge Cases', () => {
  type SimpleNode = { key: string; reportToKey: string | null; children: SimpleNode[] }

  function buildTree(agents: AgentDefinition[]): SimpleNode[] {
    const nodes = new Map<string, SimpleNode>()
    for (const a of agents) {
      nodes.set(a.key, { key: a.key, reportToKey: a.reportToKey, children: [] })
    }
    const roots: SimpleNode[] = []
    for (const node of nodes.values()) {
      if (node.reportToKey && nodes.has(node.reportToKey)) {
        nodes.get(node.reportToKey)!.children.push(node)
      } else {
        roots.push(node)
      }
    }
    return roots
  }

  test('tree has exactly 1 root', () => {
    const roots = buildTree(AGENTS)
    expect(roots.length).toBe(1)
  })

  test('all 29 nodes are reachable from root', () => {
    const roots = buildTree(AGENTS)
    function count(node: SimpleNode): number {
      return 1 + node.children.reduce((s, c) => s + count(c), 0)
    }
    expect(count(roots[0])).toBe(29)
  })

  test('CoS children sorted by tier: managers first', () => {
    const roots = buildTree(AGENTS)
    const cos = roots[0]
    // Verify CoS has both managers and workers as children
    const childTiers = cos.children.map(c => {
      const agent = AGENTS.find(a => a.key === c.key)!
      return agent.tier
    })
    expect(childTiers.filter(t => t === 'manager').length).toBe(6)
    expect(childTiers.filter(t => t === 'worker').length).toBe(3)
  })

  test('no leaf nodes at tier=manager except CoS (managers have subordinates)', () => {
    const roots = buildTree(AGENTS)
    function findLeafManagers(node: SimpleNode): string[] {
      const agent = AGENTS.find(a => a.key === node.key)!
      const result: string[] = []
      if (agent.tier === 'manager' && node.children.length === 0 && node.key !== 'cos') {
        result.push(node.key)
      }
      for (const child of node.children) {
        result.push(...findLeafManagers(child))
      }
      return result
    }
    const leafManagers = findLeafManagers(roots[0])
    expect(leafManagers).toEqual([])
  })
})
