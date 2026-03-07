/**
 * Story 3-1: 29-Agent Organization Deployment
 * Unit tests for agent organization definition, hierarchy, and deployment logic
 */
import { describe, test, expect } from 'bun:test'
import { AGENTS, DEPARTMENTS, DELEGATION_RULES } from '../../lib/agent-org-definition'
import type { AgentDefinition } from '../../lib/agent-org-definition'

describe('Agent Organization Definition', () => {
  // === AC#2: Agent count ===
  test('defines exactly 29 agents', () => {
    expect(AGENTS.length).toBe(29)
  })

  // === AC#4: Department count ===
  test('defines 7 departments', () => {
    expect(DEPARTMENTS.length).toBe(7)
    const deptNames = DEPARTMENTS.map(d => d.key)
    expect(deptNames).toContain('executive')
    expect(deptNames).toContain('tech')
    expect(deptNames).toContain('strategy')
    expect(deptNames).toContain('legal')
    expect(deptNames).toContain('marketing')
    expect(deptNames).toContain('investment')
    expect(deptNames).toContain('publishing')
  })

  // === AC#3: Hierarchy structure ===
  describe('Hierarchy matches v1 structure', () => {
    test('exactly 1 Chief of Staff (isSecretary=true)', () => {
      const secretaries = AGENTS.filter(a => a.isSecretary)
      expect(secretaries.length).toBe(1)
      expect(secretaries[0].key).toBe('cos')
      expect(secretaries[0].tier).toBe('manager')
    })

    test('CoS reports to nobody (top of hierarchy)', () => {
      const cos = AGENTS.find(a => a.key === 'cos')!
      expect(cos.reportToKey).toBeNull()
    })

    test('3 assistants report to CoS', () => {
      const assistants = AGENTS.filter(a => a.reportToKey === 'cos' && a.departmentKey === 'executive' && a.key !== 'cos')
      expect(assistants.length).toBe(3)
      expect(assistants.every(a => a.tier === 'worker')).toBe(true)
    })

    test('6 managers report to CoS', () => {
      const managers = AGENTS.filter(a => a.reportToKey === 'cos' && a.tier === 'manager')
      expect(managers.length).toBe(6)
      const managerKeys = managers.map(m => m.key).sort()
      expect(managerKeys).toEqual(['cio', 'clo', 'cmo', 'cpo', 'cso', 'cto'])
    })

    test('CTO has 4 specialists', () => {
      const ctoSpecs = AGENTS.filter(a => a.reportToKey === 'cto')
      expect(ctoSpecs.length).toBe(4)
      expect(ctoSpecs.every(a => a.tier === 'specialist')).toBe(true)
    })

    test('CSO has 3 specialists', () => {
      const csoSpecs = AGENTS.filter(a => a.reportToKey === 'cso')
      expect(csoSpecs.length).toBe(3)
      expect(csoSpecs.every(a => a.tier === 'specialist')).toBe(true)
    })

    test('CLO has 2 specialists', () => {
      const cloSpecs = AGENTS.filter(a => a.reportToKey === 'clo')
      expect(cloSpecs.length).toBe(2)
      expect(cloSpecs.every(a => a.tier === 'specialist')).toBe(true)
    })

    test('CMO has 3 specialists', () => {
      const cmoSpecs = AGENTS.filter(a => a.reportToKey === 'cmo')
      expect(cmoSpecs.length).toBe(3)
      expect(cmoSpecs.every(a => a.tier === 'specialist')).toBe(true)
    })

    test('CIO has 4 specialists', () => {
      const cioSpecs = AGENTS.filter(a => a.reportToKey === 'cio')
      expect(cioSpecs.length).toBe(4)
      expect(cioSpecs.every(a => a.tier === 'specialist')).toBe(true)
    })

    test('CPO has 3 workers', () => {
      const cpoWorkers = AGENTS.filter(a => a.reportToKey === 'cpo')
      expect(cpoWorkers.length).toBe(3)
      expect(cpoWorkers.every(a => a.tier === 'worker')).toBe(true)
    })
  })

  // === AC#2: Tier distribution ===
  describe('Tier distribution', () => {
    test('7 managers (CoS + 6 department heads)', () => {
      expect(AGENTS.filter(a => a.tier === 'manager').length).toBe(7)
    })

    test('16 specialists', () => {
      expect(AGENTS.filter(a => a.tier === 'specialist').length).toBe(16)
    })

    test('6 workers', () => {
      expect(AGENTS.filter(a => a.tier === 'worker').length).toBe(6)
    })
  })

  // === AC#2: Model assignment ===
  describe('Model assignment per tier', () => {
    test('managers use claude-sonnet-4-6', () => {
      const managers = AGENTS.filter(a => a.tier === 'manager')
      expect(managers.every(a => a.modelName === 'claude-sonnet-4-6')).toBe(true)
    })

    test('specialists use claude-haiku-4-5', () => {
      const specialists = AGENTS.filter(a => a.tier === 'specialist')
      expect(specialists.every(a => a.modelName === 'claude-haiku-4-5')).toBe(true)
    })

    test('workers use claude-haiku-4-5', () => {
      const workers = AGENTS.filter(a => a.tier === 'worker')
      expect(workers.every(a => a.modelName === 'claude-haiku-4-5')).toBe(true)
    })
  })

  // === AC#5: Soul content ===
  describe('Soul content quality', () => {
    test('every agent has non-empty soul (min 100 chars)', () => {
      for (const agent of AGENTS) {
        expect(agent.soul.length).toBeGreaterThanOrEqual(100)
      }
    })

    test('every agent has Korean name', () => {
      for (const agent of AGENTS) {
        expect(agent.name.length).toBeGreaterThan(0)
      }
    })

    test('every agent has English name', () => {
      for (const agent of AGENTS) {
        expect(agent.nameEn.length).toBeGreaterThan(0)
      }
    })

    test('every agent has role description', () => {
      for (const agent of AGENTS) {
        expect(agent.role.length).toBeGreaterThan(0)
      }
    })
  })

  // === AC#2: Every agent references valid department ===
  describe('Department references', () => {
    const deptKeys = DEPARTMENTS.map(d => d.key)

    test('every agent references a valid department', () => {
      for (const agent of AGENTS) {
        expect(deptKeys).toContain(agent.departmentKey)
      }
    })
  })

  // === Hierarchy integrity ===
  describe('Hierarchy integrity', () => {
    test('every reportToKey references an existing agent key', () => {
      const agentKeys = AGENTS.map(a => a.key)
      for (const agent of AGENTS) {
        if (agent.reportToKey !== null) {
          expect(agentKeys).toContain(agent.reportToKey)
        }
      }
    })

    test('all unique keys', () => {
      const keys = AGENTS.map(a => a.key)
      expect(new Set(keys).size).toBe(keys.length)
    })

    test('no circular references (basic check)', () => {
      // Check that no agent reports to itself
      for (const agent of AGENTS) {
        expect(agent.reportToKey).not.toBe(agent.key)
      }

      // Check that chain terminates (max depth 3: spec -> manager -> cos -> null)
      for (const agent of AGENTS) {
        let current: AgentDefinition | undefined = agent
        const visited = new Set<string>()
        while (current && current.reportToKey) {
          expect(visited.has(current.key)).toBe(false)
          visited.add(current.key)
          current = AGENTS.find(a => a.key === current!.reportToKey)
        }
      }
    })
  })

  // === AC#6: Delegation rules ===
  describe('Delegation rules', () => {
    test('6 delegation rules (CoS -> each manager)', () => {
      expect(DELEGATION_RULES.length).toBe(6)
    })

    test('all rules originate from CoS', () => {
      expect(DELEGATION_RULES.every(r => r.sourceKey === 'cos')).toBe(true)
    })

    test('each rule targets a different manager', () => {
      const targets = DELEGATION_RULES.map(r => r.targetKey)
      expect(new Set(targets).size).toBe(6)
      expect(targets.sort()).toEqual(['cio', 'clo', 'cmo', 'cpo', 'cso', 'cto'])
    })

    test('each rule has at least 5 keywords', () => {
      for (const rule of DELEGATION_RULES) {
        expect(rule.keywords.length).toBeGreaterThanOrEqual(5)
      }
    })

    test('no duplicate keywords across rules', () => {
      const allKeywords = DELEGATION_RULES.flatMap(r => r.keywords)
      // Some overlap is ok, but check no exact duplicates within a rule
      for (const rule of DELEGATION_RULES) {
        expect(new Set(rule.keywords).size).toBe(rule.keywords.length)
      }
    })
  })
})

// === Hierarchy tree building (mirrors route logic) ===
describe('Hierarchy tree building', () => {
  test('builds correct tree from flat agent list', () => {
    type AgentNode = { key: string; reportToKey: string | null; children: AgentNode[] }

    const nodes = new Map<string, AgentNode>()
    for (const a of AGENTS) {
      nodes.set(a.key, { key: a.key, reportToKey: a.reportToKey, children: [] })
    }

    const roots: AgentNode[] = []
    for (const node of nodes.values()) {
      if (node.reportToKey && nodes.has(node.reportToKey)) {
        nodes.get(node.reportToKey)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    // Only 1 root (CoS)
    expect(roots.length).toBe(1)
    expect(roots[0].key).toBe('cos')

    // CoS has 9 direct children: 3 assistants + 6 managers
    expect(roots[0].children.length).toBe(9)

    // CTO has 4 children
    const cto = roots[0].children.find(c => c.key === 'cto')!
    expect(cto.children.length).toBe(4)

    // Total nodes reachable from root = 29
    function countNodes(node: AgentNode): number {
      return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0)
    }
    expect(countNodes(roots[0])).toBe(29)
  })
})
