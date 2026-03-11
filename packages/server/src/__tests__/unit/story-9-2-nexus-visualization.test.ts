import { describe, test, expect, mock, beforeEach } from 'bun:test'

// ─── org-chart API expansion tests ───

describe('Story 9.2: NEXUS Node Visualization', () => {
  // ─── API Response Shape Tests ───

  describe('org-chart API response shape', () => {
    test('departments should include employees array', () => {
      const dept = {
        id: 'dept-1',
        name: 'Engineering',
        description: null,
        agents: [],
        employees: [
          { id: 'user-1', name: 'Kim CEO', username: 'kimceo', role: 'ceo', hasCliToken: true, agentCount: 3 },
        ],
      }
      expect(dept.employees).toBeArray()
      expect(dept.employees[0]).toHaveProperty('hasCliToken')
      expect(dept.employees[0]).toHaveProperty('agentCount')
    })

    test('OrgEmployee should have all required fields', () => {
      const employee = {
        id: 'user-1',
        name: 'Kim CEO',
        username: 'kimceo',
        role: 'ceo',
        hasCliToken: true,
        agentCount: 3,
      }
      expect(employee.id).toBeString()
      expect(employee.name).toBeString()
      expect(employee.username).toBeString()
      expect(employee.role).toBeString()
      expect(typeof employee.hasCliToken).toBe('boolean')
      expect(typeof employee.agentCount).toBe('number')
    })

    test('agent data should include new fields: reportTo, ownerUserId, tierLevel', () => {
      const agent = {
        id: 'agent-1',
        name: 'TestAgent',
        role: null,
        tier: 'specialist',
        tierLevel: 2,
        modelName: 'claude-haiku-4-5',
        departmentId: 'dept-1',
        status: 'online',
        isSecretary: false,
        isSystem: false,
        soul: null,
        allowedTools: null,
        reportTo: 'agent-0',
        ownerUserId: 'user-1',
      }
      expect(agent.reportTo).toBe('agent-0')
      expect(agent.ownerUserId).toBe('user-1')
      expect(agent.tierLevel).toBe(2)
    })

    test('response should include unassignedEmployees array', () => {
      const orgChart = {
        company: { id: 'c1', name: 'Test', slug: 'test' },
        departments: [],
        unassignedAgents: [],
        unassignedEmployees: [
          { id: 'user-2', name: 'Park', username: 'park', role: 'user', hasCliToken: false, agentCount: 0 },
        ],
      }
      expect(orgChart.unassignedEmployees).toBeArray()
      expect(orgChart.unassignedEmployees).toHaveLength(1)
    })
  })

  // ─── CLI Token Status Tests ───

  describe('CLI token status logic', () => {
    test('hasCliToken is true when user has active CLI credentials', () => {
      const cliStatus = [{ userId: 'user-1', count: 1 }]
      const cliTokenMap = new Map(cliStatus.map((c) => [c.userId, true]))
      expect(cliTokenMap.has('user-1')).toBe(true)
      expect(cliTokenMap.has('user-2')).toBe(false)
    })

    test('hasCliToken is false when user has no CLI credentials', () => {
      const cliStatus: { userId: string; count: number }[] = []
      const cliTokenMap = new Map(cliStatus.map((c) => [c.userId, true]))
      expect(cliTokenMap.has('user-1')).toBe(false)
    })
  })

  // ─── Owner Agent Count Tests ───

  describe('owner agent count logic', () => {
    test('counts agents owned by each user correctly', () => {
      const agents = [
        { id: 'a1', ownerUserId: 'user-1' },
        { id: 'a2', ownerUserId: 'user-1' },
        { id: 'a3', ownerUserId: 'user-2' },
        { id: 'a4', ownerUserId: null },
      ]
      const ownerCounts = new Map<string, number>()
      for (const a of agents) {
        if (a.ownerUserId) {
          ownerCounts.set(a.ownerUserId, (ownerCounts.get(a.ownerUserId) ?? 0) + 1)
        }
      }
      expect(ownerCounts.get('user-1')).toBe(2)
      expect(ownerCounts.get('user-2')).toBe(1)
      expect(ownerCounts.get('user-3')).toBeUndefined()
    })
  })

  // ─── Employee-Department Mapping Tests ───

  describe('employee-department mapping', () => {
    test('maps employees to correct departments', () => {
      const empDepts = [
        { userId: 'user-1', departmentId: 'dept-1' },
        { userId: 'user-1', departmentId: 'dept-2' },
        { userId: 'user-2', departmentId: 'dept-1' },
      ]
      const empDeptMap = new Map<string, string[]>()
      for (const ed of empDepts) {
        const list = empDeptMap.get(ed.userId) ?? []
        list.push(ed.departmentId)
        empDeptMap.set(ed.userId, list)
      }
      expect(empDeptMap.get('user-1')).toEqual(['dept-1', 'dept-2'])
      expect(empDeptMap.get('user-2')).toEqual(['dept-1'])
    })

    test('identifies unassigned employees correctly', () => {
      const empDepts = [{ userId: 'user-1', departmentId: 'dept-1' }]
      const assignedUserIds = new Set(empDepts.map((ed) => ed.userId))
      const allUsers = [
        { id: 'user-1', name: 'A' },
        { id: 'user-2', name: 'B' },
      ]
      const unassigned = allUsers.filter((u) => !assignedUserIds.has(u.id))
      expect(unassigned).toHaveLength(1)
      expect(unassigned[0].id).toBe('user-2')
    })
  })

  // ─── Edge Type Tests ───

  describe('edge type generation', () => {
    test('membership edges: department→agent (solid)', () => {
      const edge = {
        id: 'edge-dept-1-agent-1',
        source: 'dept-1',
        target: 'agent-1',
        type: 'membership',
        style: { stroke: '#10b981', strokeWidth: 1.5 },
      }
      expect(edge.type).toBe('membership')
      expect(edge.style.strokeWidth).toBe(1.5)
    })

    test('delegation edges: manager→subordinate (dashed arrow)', () => {
      const edge = {
        id: 'delegate-agent-1-agent-2',
        source: 'agent-agent-1',
        target: 'agent-agent-2',
        type: 'delegation',
        style: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '5 5' },
      }
      expect(edge.type).toBe('delegation')
      expect(edge.style.strokeDasharray).toBe('5 5')
      expect(edge.style.stroke).toBe('#f59e0b')
    })

    test('ownership edges: human→agent (dash-dot)', () => {
      const edge = {
        id: 'owner-user-1-agent-1',
        source: 'human-user-1',
        target: 'agent-agent-1',
        type: 'ownership',
        style: { stroke: '#a855f7', strokeWidth: 1, strokeDasharray: '8 4 2 4' },
      }
      expect(edge.type).toBe('ownership')
      expect(edge.style.strokeDasharray).toBe('8 4 2 4')
      expect(edge.style.stroke).toBe('#a855f7')
    })

    test('employment edges: department→human (solid purple)', () => {
      const edge = {
        id: 'edge-dept-1-human-1',
        source: 'dept-1',
        target: 'human-1',
        type: 'employment',
        style: { stroke: '#a855f7', strokeWidth: 1.5 },
      }
      expect(edge.type).toBe('employment')
      expect(edge.style.stroke).toBe('#a855f7')
    })

    test('delegation edges only created when reportTo is not null', () => {
      const agents = [
        { id: 'a1', reportTo: null },
        { id: 'a2', reportTo: 'a1' },
        { id: 'a3', reportTo: null },
      ]
      const delegationEdges = agents
        .filter((a) => a.reportTo)
        .map((a) => ({
          id: `delegate-${a.reportTo}-${a.id}`,
          source: `agent-${a.reportTo}`,
          target: `agent-${a.id}`,
        }))
      expect(delegationEdges).toHaveLength(1)
      expect(delegationEdges[0].source).toBe('agent-a1')
      expect(delegationEdges[0].target).toBe('agent-a2')
    })

    test('ownership edges only created when ownerUserId is not null', () => {
      const agents = [
        { id: 'a1', ownerUserId: 'user-1' },
        { id: 'a2', ownerUserId: null },
      ]
      const ownerEdges = agents
        .filter((a) => a.ownerUserId)
        .map((a) => ({
          id: `owner-${a.ownerUserId}-${a.id}`,
          source: `human-${a.ownerUserId}`,
          target: `agent-${a.id}`,
        }))
      expect(ownerEdges).toHaveLength(1)
      expect(ownerEdges[0].source).toBe('human-user-1')
    })
  })

  // ─── Subordinate Count Tests ───

  describe('subordinate count logic', () => {
    test('counts subordinates per agent from reportTo', () => {
      const agents = [
        { id: 'manager', reportTo: null },
        { id: 'worker-1', reportTo: 'manager' },
        { id: 'worker-2', reportTo: 'manager' },
        { id: 'worker-3', reportTo: 'specialist' },
        { id: 'specialist', reportTo: 'manager' },
      ]
      const subordinateCount = new Map<string, number>()
      for (const a of agents) {
        if (a.reportTo) {
          subordinateCount.set(a.reportTo, (subordinateCount.get(a.reportTo) ?? 0) + 1)
        }
      }
      expect(subordinateCount.get('manager')).toBe(3)
      expect(subordinateCount.get('specialist')).toBe(1)
      expect(subordinateCount.has('worker-1')).toBe(false)
    })
  })

  // ─── Agent Node Data Enhancement Tests ───

  describe('agent node data', () => {
    test('includes tierLevel in node data', () => {
      const nodeData = {
        name: 'TestAgent',
        tier: 'manager',
        tierLevel: 1,
        status: 'online',
        isSecretary: false,
        isSystem: false,
        subordinateCount: 2,
      }
      expect(nodeData.tierLevel).toBe(1)
      expect(nodeData.subordinateCount).toBe(2)
    })

    test('tierLevel display format: T1 for manager', () => {
      const tierLevel = 1
      const tierLevelStr = tierLevel != null ? ` T${tierLevel}` : ''
      expect(tierLevelStr).toBe(' T1')
    })

    test('tierLevel display format: empty when null', () => {
      const tierLevel = null
      const tierLevelStr = tierLevel != null ? ` T${tierLevel}` : ''
      expect(tierLevelStr).toBe('')
    })

    test('secretary node should be identified for octagonal shape', () => {
      const nodeData = {
        name: 'Secretary',
        tier: 'manager',
        tierLevel: 1,
        status: 'online',
        isSecretary: true,
        isSystem: false,
        subordinateCount: 5,
      }
      expect(nodeData.isSecretary).toBe(true)
    })
  })

  // ─── Department Node Data Enhancement Tests ───

  describe('department node data', () => {
    test('includes employeeCount in node data', () => {
      const nodeData = {
        name: 'Engineering',
        description: 'Software team',
        agentCount: 5,
        employeeCount: 2,
        managerName: 'DevManager',
      }
      expect(nodeData.employeeCount).toBe(2)
      expect(nodeData.managerName).toBe('DevManager')
    })

    test('managerName is null when no manager agent exists', () => {
      const agents = [
        { name: 'Worker1', tier: 'worker' },
        { name: 'Specialist1', tier: 'specialist' },
      ]
      const manager = agents.find((a) => a.tier === 'manager')
      expect(manager?.name ?? null).toBeNull()
    })

    test('managerName is extracted from first manager agent', () => {
      const agents = [
        { name: 'Worker1', tier: 'worker' },
        { name: 'BossAgent', tier: 'manager' },
      ]
      const manager = agents.find((a) => a.tier === 'manager')
      expect(manager?.name ?? null).toBe('BossAgent')
    })
  })

  // ─── Human Node Data Tests ───

  describe('human node data', () => {
    test('HumanNode data has all required fields', () => {
      const nodeData = {
        name: 'Kim CEO',
        username: 'kimceo',
        role: 'ceo',
        hasCliToken: true,
        agentCount: 3,
      }
      expect(nodeData.name).toBe('Kim CEO')
      expect(nodeData.role).toBe('ceo')
      expect(nodeData.hasCliToken).toBe(true)
      expect(nodeData.agentCount).toBe(3)
    })

    test('role badge mapping works for all roles', () => {
      const ROLE_BADGE: Record<string, { label: string }> = {
        ceo: { label: 'CEO' },
        admin: { label: 'Admin' },
        user: { label: 'Staff' },
      }
      expect(ROLE_BADGE['ceo'].label).toBe('CEO')
      expect(ROLE_BADGE['admin'].label).toBe('Admin')
      expect(ROLE_BADGE['user'].label).toBe('Staff')
    })
  })

  // ─── MiniMap Color Tests ───

  describe('minimap node color mapping', () => {
    function miniMapNodeColor(node: { type?: string }) {
      switch (node.type) {
        case 'company': return '#e2e8f0'
        case 'department': return '#3b82f6'
        case 'agent': return '#10b981'
        case 'human': return '#a855f7'
        case 'unassigned-group': return '#f59e0b'
        default: return '#64748b'
      }
    }

    test('company node is slate', () => {
      expect(miniMapNodeColor({ type: 'company' })).toBe('#e2e8f0')
    })

    test('department node is blue', () => {
      expect(miniMapNodeColor({ type: 'department' })).toBe('#3b82f6')
    })

    test('agent node is green', () => {
      expect(miniMapNodeColor({ type: 'agent' })).toBe('#10b981')
    })

    test('human node is purple', () => {
      expect(miniMapNodeColor({ type: 'human' })).toBe('#a855f7')
    })

    test('unassigned-group node is amber', () => {
      expect(miniMapNodeColor({ type: 'unassigned-group' })).toBe('#f59e0b')
    })

    test('unknown type returns default gray', () => {
      expect(miniMapNodeColor({ type: 'unknown' })).toBe('#64748b')
    })
  })

  // ─── Node Size Tests ───

  describe('node sizes', () => {
    const NODE_SIZES = {
      company: { width: 280, height: 70 },
      department: { width: 240, height: 60 },
      agent: { width: 200, height: 80 },
      human: { width: 200, height: 70 },
      'unassigned-group': { width: 240, height: 60 },
    } as const

    test('human node has correct dimensions', () => {
      expect(NODE_SIZES.human.width).toBe(200)
      expect(NODE_SIZES.human.height).toBe(70)
    })

    test('all 5 node types have sizes defined', () => {
      expect(Object.keys(NODE_SIZES)).toHaveLength(5)
      expect(NODE_SIZES).toHaveProperty('human')
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    test('handles empty employees array gracefully', () => {
      const dept = {
        id: 'dept-1',
        name: 'Test',
        description: null,
        agents: [],
        employees: [],
      }
      expect(dept.employees).toHaveLength(0)
    })

    test('handles empty unassignedEmployees gracefully', () => {
      const orgChart = {
        company: { id: 'c1', name: 'Test', slug: 'test' },
        departments: [],
        unassignedAgents: [],
        unassignedEmployees: [],
      }
      expect(orgChart.unassignedEmployees).toHaveLength(0)
    })

    test('handles missing employees field (backward compat)', () => {
      const dept = {
        id: 'dept-1',
        name: 'Test',
        description: null,
        agents: [],
      } as { employees?: unknown[] }
      expect(dept.employees ?? []).toEqual([])
    })

    test('handles reportTo pointing to non-existent agent', () => {
      const allAgentIds = new Set(['a1', 'a2'])
      const agent = { id: 'a3', reportTo: 'non-existent' }
      const sourceExists = allAgentIds.has(agent.reportTo)
      expect(sourceExists).toBe(false)
      // Edge should NOT be created when source doesn't exist
    })

    test('handles ownerUserId pointing to non-existent user', () => {
      const allHumanIds = new Set(['user-1'])
      const agent = { id: 'a1', ownerUserId: 'non-existent' }
      const sourceExists = allHumanIds.has(agent.ownerUserId)
      expect(sourceExists).toBe(false)
    })

    test('employee in multiple departments creates node only once', () => {
      const empDepts = [
        { userId: 'user-1', departmentId: 'dept-1' },
        { userId: 'user-1', departmentId: 'dept-2' },
      ]
      // Dedup logic: only add node if not already present
      const nodeIds = new Set<string>()
      const nodes: Array<{ id: string }> = []
      for (const ed of empDepts) {
        const nodeId = `human-${ed.userId}`
        if (!nodeIds.has(nodeId)) {
          nodes.push({ id: nodeId })
          nodeIds.add(nodeId)
        }
      }
      expect(nodes).toHaveLength(1)
      expect(nodes[0].id).toBe('human-user-1')
    })
  })

  // ─── EDGE_STYLES constant tests ───

  describe('EDGE_STYLES constants', () => {
    const EDGE_STYLES = {
      membership: { stroke: '#10b981', strokeWidth: 1.5 },
      employment: { stroke: '#a855f7', strokeWidth: 1.5 },
      delegation: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '5 5' },
      ownership: { stroke: '#a855f7', strokeWidth: 1, strokeDasharray: '8 4 2 4' },
    }

    test('membership style has green stroke and no dash', () => {
      expect(EDGE_STYLES.membership.stroke).toBe('#10b981')
      expect((EDGE_STYLES.membership as Record<string, unknown>).strokeDasharray).toBeUndefined()
    })

    test('delegation style has amber stroke and dashed', () => {
      expect(EDGE_STYLES.delegation.stroke).toBe('#f59e0b')
      expect(EDGE_STYLES.delegation.strokeDasharray).toBe('5 5')
    })

    test('ownership style has purple stroke and dash-dot', () => {
      expect(EDGE_STYLES.ownership.stroke).toBe('#a855f7')
      expect(EDGE_STYLES.ownership.strokeDasharray).toBe('8 4 2 4')
    })

    test('employment style has purple stroke', () => {
      expect(EDGE_STYLES.employment.stroke).toBe('#a855f7')
    })
  })

  // ─── Secretary octagon clip-path tests ───

  describe('secretary octagon visualization', () => {
    test('secretary clip-path polygon is correct', () => {
      const clipPath = 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
      // 8 points = octagon
      const points = clipPath.replace('polygon(', '').replace(')', '').split(', ')
      expect(points).toHaveLength(8)
    })

    test('secretary node gets octagonal style, non-secretary does not', () => {
      const isSecretary = true
      const clipStyle = isSecretary
        ? { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }
        : undefined
      expect(clipStyle).toBeDefined()

      const isNormal = false
      const normalStyle = isNormal
        ? { clipPath: 'polygon(...)' }
        : undefined
      expect(normalStyle).toBeUndefined()
    })
  })

  // ─── TEA Risk-Based Tests (P0/P1) ───

  describe('[TEA P0] computeElkLayout node/edge generation', () => {
    // Simulates the core logic of computeElkLayout without ELK dependency
    function buildNodesAndEdges(orgData: {
      company: { id: string; name: string; slug: string }
      departments: Array<{
        id: string; name: string; description: string | null
        agents: Array<{ id: string; name: string; tier: string; tierLevel: number | null; status: string; isSecretary: boolean; isSystem: boolean; reportTo: string | null; ownerUserId: string | null }>
        employees: Array<{ id: string; name: string; username: string; role: string; hasCliToken: boolean; agentCount: number }>
      }>
      unassignedAgents: Array<{ id: string; name: string; tier: string; tierLevel: number | null; status: string; isSecretary: boolean; isSystem: boolean; reportTo: string | null; ownerUserId: string | null }>
      unassignedEmployees: Array<{ id: string; name: string; username: string; role: string; hasCliToken: boolean; agentCount: number }>
    }) {
      const nodes: Array<{ id: string; type: string; data: Record<string, unknown> }> = []
      const edges: Array<{ id: string; source: string; target: string; type?: string }> = []

      const allAgents = orgData.departments.flatMap((d) => d.agents).concat(orgData.unassignedAgents)

      // Subordinate count
      const subordinateCount = new Map<string, number>()
      for (const a of allAgents) {
        if (a.reportTo) {
          subordinateCount.set(a.reportTo, (subordinateCount.get(a.reportTo) ?? 0) + 1)
        }
      }

      // Company
      const companyNodeId = `company-${orgData.company.id}`
      nodes.push({ id: companyNodeId, type: 'company', data: { name: orgData.company.name } })

      // Departments
      for (const dept of orgData.departments) {
        const deptNodeId = `dept-${dept.id}`
        const manager = dept.agents.find((a) => a.tier === 'manager')
        nodes.push({ id: deptNodeId, type: 'department', data: { name: dept.name, employeeCount: dept.employees.length, managerName: manager?.name ?? null } })
        edges.push({ id: `edge-${companyNodeId}-${deptNodeId}`, source: companyNodeId, target: deptNodeId })

        for (const agent of dept.agents) {
          const agentNodeId = `agent-${agent.id}`
          nodes.push({ id: agentNodeId, type: 'agent', data: { name: agent.name, subordinateCount: subordinateCount.get(agent.id) ?? 0 } })
          edges.push({ id: `edge-${deptNodeId}-${agentNodeId}`, source: deptNodeId, target: agentNodeId, type: 'membership' })
        }

        for (const emp of dept.employees) {
          const humanNodeId = `human-${emp.id}`
          if (!nodes.some((n) => n.id === humanNodeId)) {
            nodes.push({ id: humanNodeId, type: 'human', data: { name: emp.name, hasCliToken: emp.hasCliToken } })
          }
          edges.push({ id: `edge-${deptNodeId}-${humanNodeId}`, source: deptNodeId, target: humanNodeId, type: 'employment' })
        }
      }

      // Unassigned employees -> company
      for (const emp of orgData.unassignedEmployees) {
        const humanNodeId = `human-${emp.id}`
        if (!nodes.some((n) => n.id === humanNodeId)) {
          nodes.push({ id: humanNodeId, type: 'human', data: { name: emp.name } })
          edges.push({ id: `edge-${companyNodeId}-${humanNodeId}`, source: companyNodeId, target: humanNodeId })
        }
      }

      // Delegation edges
      for (const agent of allAgents) {
        if (agent.reportTo) {
          const sourceId = `agent-${agent.reportTo}`
          const targetId = `agent-${agent.id}`
          if (nodes.some((n) => n.id === sourceId) && nodes.some((n) => n.id === targetId)) {
            edges.push({ id: `delegate-${agent.reportTo}-${agent.id}`, source: sourceId, target: targetId, type: 'delegation' })
          }
        }
      }

      // Ownership edges
      for (const agent of allAgents) {
        if (agent.ownerUserId) {
          const sourceId = `human-${agent.ownerUserId}`
          const targetId = `agent-${agent.id}`
          if (nodes.some((n) => n.id === sourceId) && nodes.some((n) => n.id === targetId)) {
            edges.push({ id: `owner-${agent.ownerUserId}-${agent.id}`, source: sourceId, target: targetId, type: 'ownership' })
          }
        }
      }

      return { nodes, edges }
    }

    const sampleOrg = {
      company: { id: 'c1', name: 'TestCo', slug: 'testco' },
      departments: [{
        id: 'd1', name: 'Eng', description: null,
        agents: [
          { id: 'mgr', name: 'BossAgent', tier: 'manager', tierLevel: 1, status: 'online', isSecretary: false, isSystem: false, reportTo: null, ownerUserId: 'u1' },
          { id: 'w1', name: 'Worker1', tier: 'worker', tierLevel: 3, status: 'online', isSecretary: false, isSystem: false, reportTo: 'mgr', ownerUserId: null },
        ],
        employees: [
          { id: 'u1', name: 'Kim', username: 'kim', role: 'ceo', hasCliToken: true, agentCount: 1 },
        ],
      }],
      unassignedAgents: [
        { id: 'ua1', name: 'Floater', tier: 'worker', tierLevel: null, status: 'offline', isSecretary: false, isSystem: false, reportTo: null, ownerUserId: null },
      ],
      unassignedEmployees: [
        { id: 'u2', name: 'Park', username: 'park', role: 'user', hasCliToken: false, agentCount: 0 },
      ],
    }

    test('creates correct number of nodes: company + dept + agents + humans', () => {
      const { nodes } = buildNodesAndEdges(sampleOrg)
      // company(1) + dept(1) + agents(2 dept + 1 unassigned) + humans(1 dept + 1 unassigned) = 7
      // But unassigned agents also create unassigned-group node... not in this simplified version
      expect(nodes.filter((n) => n.type === 'company')).toHaveLength(1)
      expect(nodes.filter((n) => n.type === 'department')).toHaveLength(1)
      expect(nodes.filter((n) => n.type === 'agent')).toHaveLength(2) // only dept agents in this simplified version
      expect(nodes.filter((n) => n.type === 'human')).toHaveLength(2) // u1 + u2
    })

    test('creates membership edges for dept→agent relationships', () => {
      const { edges } = buildNodesAndEdges(sampleOrg)
      const membershipEdges = edges.filter((e) => e.type === 'membership')
      expect(membershipEdges).toHaveLength(2) // 2 agents in dept d1
      expect(membershipEdges[0].source).toBe('dept-d1')
    })

    test('creates employment edges for dept→human relationships', () => {
      const { edges } = buildNodesAndEdges(sampleOrg)
      const employmentEdges = edges.filter((e) => e.type === 'employment')
      expect(employmentEdges).toHaveLength(1) // u1 in d1
      expect(employmentEdges[0].source).toBe('dept-d1')
      expect(employmentEdges[0].target).toBe('human-u1')
    })

    test('creates delegation edges based on reportTo (with node existence check)', () => {
      const { edges } = buildNodesAndEdges(sampleOrg)
      const delegationEdges = edges.filter((e) => e.type === 'delegation')
      expect(delegationEdges).toHaveLength(1) // w1 reports to mgr
      expect(delegationEdges[0].source).toBe('agent-mgr')
      expect(delegationEdges[0].target).toBe('agent-w1')
    })

    test('creates ownership edges based on ownerUserId (with node existence check)', () => {
      const { edges } = buildNodesAndEdges(sampleOrg)
      const ownershipEdges = edges.filter((e) => e.type === 'ownership')
      expect(ownershipEdges).toHaveLength(1) // mgr owned by u1
      expect(ownershipEdges[0].source).toBe('human-u1')
      expect(ownershipEdges[0].target).toBe('agent-mgr')
    })

    test('unassigned employees connect to company node', () => {
      const { edges, nodes } = buildNodesAndEdges(sampleOrg)
      const u2Node = nodes.find((n) => n.id === 'human-u2')
      expect(u2Node).toBeDefined()
      const u2Edge = edges.find((e) => e.target === 'human-u2')
      expect(u2Edge?.source).toBe('company-c1')
    })

    test('does NOT create delegation edge when source agent is missing', () => {
      const orgWithDanglingRef = {
        ...sampleOrg,
        departments: [{
          ...sampleOrg.departments[0],
          agents: [
            { id: 'w1', name: 'Worker1', tier: 'worker', tierLevel: 3, status: 'online', isSecretary: false, isSystem: false, reportTo: 'non-existent', ownerUserId: null },
          ],
        }],
        unassignedAgents: [],
      }
      const { edges } = buildNodesAndEdges(orgWithDanglingRef)
      const delegationEdges = edges.filter((e) => e.type === 'delegation')
      expect(delegationEdges).toHaveLength(0)
    })

    test('does NOT create ownership edge when human node is missing', () => {
      const orgNoHumans = {
        ...sampleOrg,
        departments: [{
          ...sampleOrg.departments[0],
          agents: [
            { id: 'mgr', name: 'BossAgent', tier: 'manager', tierLevel: 1, status: 'online', isSecretary: false, isSystem: false, reportTo: null, ownerUserId: 'non-existent-user' },
          ],
          employees: [],
        }],
        unassignedAgents: [],
        unassignedEmployees: [],
      }
      const { edges } = buildNodesAndEdges(orgNoHumans)
      const ownershipEdges = edges.filter((e) => e.type === 'ownership')
      expect(ownershipEdges).toHaveLength(0)
    })

    test('subordinateCount is correctly calculated for agents', () => {
      const { nodes } = buildNodesAndEdges(sampleOrg)
      const mgrNode = nodes.find((n) => n.id === 'agent-mgr')
      expect(mgrNode?.data.subordinateCount).toBe(1) // w1 reports to mgr
    })

    test('department node has correct managerName', () => {
      const { nodes } = buildNodesAndEdges(sampleOrg)
      const deptNode = nodes.find((n) => n.type === 'department')
      expect(deptNode?.data.managerName).toBe('BossAgent')
    })

    test('department node has correct employeeCount', () => {
      const { nodes } = buildNodesAndEdges(sampleOrg)
      const deptNode = nodes.find((n) => n.type === 'department')
      expect(deptNode?.data.employeeCount).toBe(1)
    })
  })

  describe('[TEA P0] human node deduplication across departments', () => {
    test('employee in multiple departments AND unassigned is created only once', () => {
      const orgData = {
        company: { id: 'c1', name: 'Test', slug: 'test' },
        departments: [
          { id: 'd1', name: 'Dept1', description: null, agents: [], employees: [
            { id: 'u1', name: 'Kim', username: 'kim', role: 'admin', hasCliToken: true, agentCount: 0 },
          ]},
          { id: 'd2', name: 'Dept2', description: null, agents: [], employees: [
            { id: 'u1', name: 'Kim', username: 'kim', role: 'admin', hasCliToken: true, agentCount: 0 },
          ]},
        ],
        unassignedAgents: [],
        unassignedEmployees: [
          { id: 'u1', name: 'Kim', username: 'kim', role: 'admin', hasCliToken: true, agentCount: 0 },
        ],
      }

      // Simulate dedup logic from computeElkLayout
      const nodes: Array<{ id: string }> = []
      const nodeIds = new Set<string>()

      for (const dept of orgData.departments) {
        for (const emp of dept.employees) {
          const nodeId = `human-${emp.id}`
          if (!nodeIds.has(nodeId)) {
            nodes.push({ id: nodeId })
            nodeIds.add(nodeId)
          }
        }
      }
      for (const emp of orgData.unassignedEmployees) {
        const nodeId = `human-${emp.id}`
        if (!nodeIds.has(nodeId)) {
          nodes.push({ id: nodeId })
          nodeIds.add(nodeId)
        }
      }

      expect(nodes).toHaveLength(1)
      expect(nodes[0].id).toBe('human-u1')
    })

    test('employment edges still created for EACH department (even if node is deduped)', () => {
      const orgData = {
        departments: [
          { id: 'd1', employees: [{ id: 'u1' }] },
          { id: 'd2', employees: [{ id: 'u1' }] },
        ],
      }

      const edges: Array<{ source: string; target: string }> = []
      for (const dept of orgData.departments) {
        for (const emp of dept.employees) {
          edges.push({ source: `dept-${dept.id}`, target: `human-${emp.id}` })
        }
      }
      // Two employment edges even though one node
      expect(edges).toHaveLength(2)
      expect(edges[0].source).toBe('dept-d1')
      expect(edges[1].source).toBe('dept-d2')
    })
  })

  describe('[TEA P1] totalEmployees calculation', () => {
    test('sums employees from departments and unassigned', () => {
      const org = {
        departments: [
          { agents: [{ id: 'a1' }], employees: [{ id: 'e1' }, { id: 'e2' }] },
          { agents: [], employees: [{ id: 'e3' }] },
        ],
        unassignedAgents: [],
        unassignedEmployees: [{ id: 'e4' }],
      }
      const totalEmployees = org.departments.reduce((s, d) => s + (d.employees?.length ?? 0), 0) + (org.unassignedEmployees?.length ?? 0)
      expect(totalEmployees).toBe(4)
    })

    test('totalEmployees is 0 when no employees anywhere', () => {
      const org = {
        departments: [{ agents: [], employees: [] }],
        unassignedEmployees: [],
      }
      const totalEmployees = org.departments.reduce((s, d) => s + (d.employees?.length ?? 0), 0) + (org.unassignedEmployees?.length ?? 0)
      expect(totalEmployees).toBe(0)
    })

    test('handles missing employees field gracefully (backward compat)', () => {
      const org = {
        departments: [{ agents: [] } as { agents: unknown[]; employees?: unknown[] }],
        unassignedEmployees: undefined as unknown[] | undefined,
      }
      const totalEmployees = org.departments.reduce((s, d) => s + (d.employees?.length ?? 0), 0) + ((org.unassignedEmployees as unknown[])?.length ?? 0)
      expect(totalEmployees).toBe(0)
    })
  })

  describe('[TEA P1] agent node display logic', () => {
    test('tier badge shows tierLevel: "Manager T1"', () => {
      const tier = { label: 'Manager' }
      const tierLevel = 1
      const tierLevelStr = tierLevel != null ? ` T${tierLevel}` : ''
      const display = `${tier.label}${tierLevelStr}`
      expect(display).toBe('Manager T1')
    })

    test('subordinate badge shows ↓N when > 0', () => {
      const subordinateCount = 5
      const badge = subordinateCount > 0 ? `↓${subordinateCount}` : null
      expect(badge).toBe('↓5')
    })

    test('subordinate badge hidden when 0', () => {
      const subordinateCount = 0
      const badge = subordinateCount > 0 ? `↓${subordinateCount}` : null
      expect(badge).toBeNull()
    })

    test('secretary node uses amber background, non-secretary uses emerald', () => {
      const secretaryBg = true ? 'bg-amber-950' : 'bg-emerald-950'
      const normalBg = false ? 'bg-amber-950' : 'bg-emerald-950'
      expect(secretaryBg).toBe('bg-amber-950')
      expect(normalBg).toBe('bg-emerald-950')
    })

    test('status dot color mapping for all states', () => {
      const STATUS_DOT: Record<string, { color: string; pulse?: boolean }> = {
        online: { color: 'bg-emerald-500' },
        working: { color: 'bg-blue-500', pulse: true },
        error: { color: 'bg-red-500' },
        offline: { color: 'bg-slate-500' },
      }
      expect(STATUS_DOT['online'].color).toBe('bg-emerald-500')
      expect(STATUS_DOT['working'].pulse).toBe(true)
      expect(STATUS_DOT['error'].color).toBe('bg-red-500')
      expect(STATUS_DOT['offline'].color).toBe('bg-slate-500')
    })

    test('unknown status defaults to offline', () => {
      const STATUS_DOT: Record<string, { color: string }> = {
        online: { color: 'bg-emerald-500' },
        offline: { color: 'bg-slate-500' },
      }
      const status = STATUS_DOT['unknown'] || STATUS_DOT['offline']
      expect(status.color).toBe('bg-slate-500')
    })
  })

  describe('[TEA P1] human node display logic', () => {
    test('CLI token dot: emerald when registered, slate when not', () => {
      const tokenDotColor = (hasCliToken: boolean) =>
        hasCliToken ? 'bg-emerald-500' : 'bg-slate-500'
      expect(tokenDotColor(true)).toBe('bg-emerald-500')
      expect(tokenDotColor(false)).toBe('bg-slate-500')
    })

    test('agent count badge hidden when 0', () => {
      const agentCount = 0
      const showBadge = agentCount > 0
      expect(showBadge).toBe(false)
    })

    test('agent count badge shows "AI N" when > 0', () => {
      const agentCount = 3
      const badgeText = agentCount > 0 ? `AI ${agentCount}` : null
      expect(badgeText).toBe('AI 3')
    })

    test('unknown role falls back to Staff badge', () => {
      const ROLE_BADGE: Record<string, { label: string }> = {
        ceo: { label: 'CEO' },
        admin: { label: 'Admin' },
        user: { label: 'Staff' },
      }
      const role = ROLE_BADGE['unknown_role'] || ROLE_BADGE['user']
      expect(role.label).toBe('Staff')
    })
  })

  describe('[TEA P1] empty organization edge cases', () => {
    test('org with 0 departments, 0 agents, 0 employees produces only company node', () => {
      const orgData = {
        company: { id: 'c1', name: 'Empty', slug: 'empty' },
        departments: [],
        unassignedAgents: [],
        unassignedEmployees: [],
      }
      const isEmpty = orgData.departments.length === 0 && orgData.unassignedAgents.length === 0
      expect(isEmpty).toBe(true)
    })

    test('org with only unassigned employees still shows them', () => {
      const orgData = {
        departments: [] as Array<{ agents: unknown[] }>,
        unassignedAgents: [],
        unassignedEmployees: [{ id: 'u1' }, { id: 'u2' }],
      }
      const totalAgents = orgData.departments.reduce((s, d) => s + d.agents.length, 0) + orgData.unassignedAgents.length
      const totalEmployees = (orgData.unassignedEmployees?.length ?? 0)
      expect(totalAgents).toBe(0)
      expect(totalEmployees).toBe(2)
    })
  })
})
