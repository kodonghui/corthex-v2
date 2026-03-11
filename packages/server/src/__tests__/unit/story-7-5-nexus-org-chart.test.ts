import { describe, test, expect } from 'bun:test'

// Since elk-layout.ts is in the admin package (frontend), we test the core
// transformation logic independently here. This tests the node/edge generation
// algorithm without requiring React Flow or ELK.js runtime dependencies.

// ── Types matching the org-chart API response ──
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

type OrgChartData = {
  company: { id: string; name: string; slug: string }
  departments: OrgDept[]
  unassignedAgents: OrgAgent[]
}

type FlowNode = {
  id: string
  type: string
  data: Record<string, unknown>
}

type FlowEdge = {
  id: string
  source: string
  target: string
}

// ── Pure transformation logic (mirrors elk-layout.ts without ELK/React Flow deps) ──
function buildOrgFlowGraph(orgData: OrgChartData): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []

  const companyNodeId = `company-${orgData.company.id}`
  const totalAgents = orgData.departments.reduce((s, d) => s + d.agents.length, 0) + orgData.unassignedAgents.length

  nodes.push({
    id: companyNodeId,
    type: 'company',
    data: { name: orgData.company.name, deptCount: orgData.departments.length, agentCount: totalAgents },
  })

  for (const dept of orgData.departments) {
    const deptNodeId = `dept-${dept.id}`
    nodes.push({
      id: deptNodeId,
      type: 'department',
      data: { name: dept.name, description: dept.description, agentCount: dept.agents.length },
    })
    edges.push({ id: `edge-${companyNodeId}-${deptNodeId}`, source: companyNodeId, target: deptNodeId })

    for (const agent of dept.agents) {
      const agentNodeId = `agent-${agent.id}`
      nodes.push({
        id: agentNodeId,
        type: 'agent',
        data: { name: agent.name, tier: agent.tier, status: agent.status, isSecretary: agent.isSecretary, isSystem: agent.isSystem },
      })
      edges.push({ id: `edge-${deptNodeId}-${agentNodeId}`, source: deptNodeId, target: agentNodeId })
    }
  }

  if (orgData.unassignedAgents.length > 0) {
    const unassignedGroupId = 'unassigned-group'
    nodes.push({
      id: unassignedGroupId,
      type: 'unassigned-group',
      data: { name: '미배속', agentCount: orgData.unassignedAgents.length },
    })
    edges.push({ id: `edge-${companyNodeId}-${unassignedGroupId}`, source: companyNodeId, target: unassignedGroupId })

    for (const agent of orgData.unassignedAgents) {
      const agentNodeId = `agent-${agent.id}`
      nodes.push({
        id: agentNodeId,
        type: 'agent',
        data: { name: agent.name, tier: agent.tier, status: agent.status, isSecretary: agent.isSecretary, isSystem: agent.isSystem },
      })
      edges.push({ id: `edge-${unassignedGroupId}-${agentNodeId}`, source: unassignedGroupId, target: agentNodeId })
    }
  }

  return { nodes, edges }
}

// ── Test fixtures ──
function makeAgent(overrides: Partial<OrgAgent> = {}): OrgAgent {
  return {
    id: crypto.randomUUID(),
    name: 'Test Agent',
    role: null,
    tier: 'worker',
    modelName: 'claude-sonnet-4-20250514',
    departmentId: null,
    status: 'online',
    isSecretary: false,
    isSystem: false,
    soul: null,
    allowedTools: null,
    ...overrides,
  }
}

function makeOrgData(overrides: Partial<OrgChartData> = {}): OrgChartData {
  return {
    company: { id: 'comp-1', name: 'TestCorp', slug: 'testcorp' },
    departments: [],
    unassignedAgents: [],
    ...overrides,
  }
}

// ── Tests ──

describe('Story 7.5: NEXUS Org Chart — Node/Edge Transformation', () => {
  test('creates company root node for empty organization', () => {
    const orgData = makeOrgData()
    const { nodes, edges } = buildOrgFlowGraph(orgData)

    expect(nodes).toHaveLength(1)
    expect(nodes[0].id).toBe('company-comp-1')
    expect(nodes[0].type).toBe('company')
    expect(nodes[0].data.name).toBe('TestCorp')
    expect(nodes[0].data.deptCount).toBe(0)
    expect(nodes[0].data.agentCount).toBe(0)
    expect(edges).toHaveLength(0)
  })

  test('creates department nodes with edges to company', () => {
    const orgData = makeOrgData({
      departments: [
        { id: 'dept-1', name: '전략부', description: '전략 기획', agents: [] },
        { id: 'dept-2', name: '마케팅부', description: null, agents: [] },
      ],
    })
    const { nodes, edges } = buildOrgFlowGraph(orgData)

    // 1 company + 2 departments
    expect(nodes).toHaveLength(3)
    const deptNodes = nodes.filter((n) => n.type === 'department')
    expect(deptNodes).toHaveLength(2)
    expect(deptNodes[0].data.name).toBe('전략부')
    expect(deptNodes[0].data.description).toBe('전략 기획')
    expect(deptNodes[1].data.name).toBe('마케팅부')

    // 2 edges: company → dept1, company → dept2
    expect(edges).toHaveLength(2)
    expect(edges[0].source).toBe('company-comp-1')
    expect(edges[0].target).toBe('dept-dept-1')
    expect(edges[1].target).toBe('dept-dept-2')
  })

  test('creates agent nodes with correct type and data', () => {
    const agent1 = makeAgent({ id: 'a1', name: 'CIO', tier: 'manager', status: 'working', isSecretary: false })
    const agent2 = makeAgent({ id: 'a2', name: '비서실장', tier: 'manager', status: 'online', isSecretary: true })
    const orgData = makeOrgData({
      departments: [
        { id: 'dept-1', name: '전략부', description: null, agents: [agent1, agent2] },
      ],
    })
    const { nodes, edges } = buildOrgFlowGraph(orgData)

    // 1 company + 1 dept + 2 agents
    expect(nodes).toHaveLength(4)
    const agentNodes = nodes.filter((n) => n.type === 'agent')
    expect(agentNodes).toHaveLength(2)

    // Agent data checks
    expect(agentNodes[0].data.name).toBe('CIO')
    expect(agentNodes[0].data.tier).toBe('manager')
    expect(agentNodes[0].data.status).toBe('working')
    expect(agentNodes[0].data.isSecretary).toBe(false)

    expect(agentNodes[1].data.name).toBe('비서실장')
    expect(agentNodes[1].data.isSecretary).toBe(true)

    // Edges: company→dept, dept→agent1, dept→agent2
    expect(edges).toHaveLength(3)
    expect(edges[1].source).toBe('dept-dept-1')
    expect(edges[1].target).toBe('agent-a1')
    expect(edges[2].target).toBe('agent-a2')
  })

  test('creates unassigned group with agents when unassigned agents exist', () => {
    const unassigned1 = makeAgent({ id: 'u1', name: 'Freelancer', departmentId: null })
    const unassigned2 = makeAgent({ id: 'u2', name: 'Intern', departmentId: null, tier: 'worker' })
    const orgData = makeOrgData({
      unassignedAgents: [unassigned1, unassigned2],
    })
    const { nodes, edges } = buildOrgFlowGraph(orgData)

    // 1 company + 1 unassigned-group + 2 agents
    expect(nodes).toHaveLength(4)
    const groupNode = nodes.find((n) => n.type === 'unassigned-group')
    expect(groupNode).toBeDefined()
    expect(groupNode!.data.name).toBe('미배속')
    expect(groupNode!.data.agentCount).toBe(2)

    // Edges: company→unassigned-group, group→agent1, group→agent2
    expect(edges).toHaveLength(3)
    expect(edges[0].source).toBe('company-comp-1')
    expect(edges[0].target).toBe('unassigned-group')
    expect(edges[1].source).toBe('unassigned-group')
  })

  test('does NOT create unassigned group when no unassigned agents', () => {
    const agent = makeAgent({ id: 'a1', name: 'Worker', departmentId: 'dept-1' })
    const orgData = makeOrgData({
      departments: [{ id: 'dept-1', name: '부서1', description: null, agents: [agent] }],
      unassignedAgents: [],
    })
    const { nodes } = buildOrgFlowGraph(orgData)
    const groupNode = nodes.find((n) => n.type === 'unassigned-group')
    expect(groupNode).toBeUndefined()
  })

  test('mixed organization: departments + unassigned agents', () => {
    const deptAgent1 = makeAgent({ id: 'da1', name: 'Strategy Lead', tier: 'manager', departmentId: 'dept-1' })
    const deptAgent2 = makeAgent({ id: 'da2', name: 'Analyst', tier: 'specialist', departmentId: 'dept-1' })
    const deptAgent3 = makeAgent({ id: 'da3', name: 'Marketer', tier: 'worker', departmentId: 'dept-2' })
    const unassigned = makeAgent({ id: 'ua1', name: 'Temp', departmentId: null })

    const orgData = makeOrgData({
      departments: [
        { id: 'dept-1', name: '전략부', description: '전략 수립', agents: [deptAgent1, deptAgent2] },
        { id: 'dept-2', name: '마케팅', description: null, agents: [deptAgent3] },
      ],
      unassignedAgents: [unassigned],
    })
    const { nodes, edges } = buildOrgFlowGraph(orgData)

    // 1 company + 2 depts + 3 dept agents + 1 unassigned-group + 1 unassigned agent = 8
    expect(nodes).toHaveLength(8)

    // company→dept1, company→dept2, dept1→da1, dept1→da2, dept2→da3, company→unassigned-group, group→ua1 = 7
    expect(edges).toHaveLength(7)

    // Total agent count in company node
    expect(nodes[0].data.agentCount).toBe(4)
    expect(nodes[0].data.deptCount).toBe(2)
  })

  test('node IDs are unique and follow naming convention', () => {
    const agent = makeAgent({ id: 'agent-uuid-1' })
    const orgData = makeOrgData({
      departments: [{ id: 'dept-uuid-1', name: 'Dept', description: null, agents: [agent] }],
    })
    const { nodes } = buildOrgFlowGraph(orgData)

    const ids = nodes.map((n) => n.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length) // All unique

    expect(ids[0]).toMatch(/^company-/)
    expect(ids[1]).toMatch(/^dept-/)
    expect(ids[2]).toMatch(/^agent-/)
  })

  test('edge IDs reference correct source and target', () => {
    const agent = makeAgent({ id: 'a1' })
    const orgData = makeOrgData({
      departments: [{ id: 'd1', name: 'Dept', description: null, agents: [agent] }],
    })
    const { edges } = buildOrgFlowGraph(orgData)

    // company → dept edge
    expect(edges[0].id).toBe('edge-company-comp-1-dept-d1')
    expect(edges[0].source).toBe('company-comp-1')
    expect(edges[0].target).toBe('dept-d1')

    // dept → agent edge
    expect(edges[1].id).toBe('edge-dept-d1-agent-a1')
    expect(edges[1].source).toBe('dept-d1')
    expect(edges[1].target).toBe('agent-a1')
  })

  test('agent tier and status values are preserved in node data', () => {
    const tiers: Array<'manager' | 'specialist' | 'worker'> = ['manager', 'specialist', 'worker']
    const statuses = ['online', 'working', 'error', 'offline']

    for (const tier of tiers) {
      for (const status of statuses) {
        const agent = makeAgent({ id: `${tier}-${status}`, tier, status })
        const orgData = makeOrgData({
          departments: [{ id: 'd1', name: 'D', description: null, agents: [agent] }],
        })
        const { nodes } = buildOrgFlowGraph(orgData)
        const agentNode = nodes.find((n) => n.type === 'agent')
        expect(agentNode!.data.tier).toBe(tier)
        expect(agentNode!.data.status).toBe(status)
      }
    }
  })

  test('secretary agents have isSecretary=true in node data', () => {
    const secretary = makeAgent({ id: 's1', name: '비서실장', isSecretary: true })
    const regular = makeAgent({ id: 'r1', name: 'Worker', isSecretary: false })
    const orgData = makeOrgData({
      departments: [{ id: 'd1', name: 'D', description: null, agents: [secretary, regular] }],
    })
    const { nodes } = buildOrgFlowGraph(orgData)
    const agentNodes = nodes.filter((n) => n.type === 'agent')
    expect(agentNodes[0].data.isSecretary).toBe(true)
    expect(agentNodes[1].data.isSecretary).toBe(false)
  })

  test('large organization with many departments and agents', () => {
    const departments: OrgDept[] = Array.from({ length: 10 }, (_, i) => ({
      id: `dept-${i}`,
      name: `Department ${i}`,
      description: `Description ${i}`,
      agents: Array.from({ length: 5 }, (_, j) =>
        makeAgent({ id: `agent-${i}-${j}`, name: `Agent ${i}-${j}`, departmentId: `dept-${i}` })
      ),
    }))

    const orgData = makeOrgData({ departments })
    const { nodes, edges } = buildOrgFlowGraph(orgData)

    // 1 company + 10 depts + 50 agents = 61 nodes
    expect(nodes).toHaveLength(61)
    // 10 (company→dept) + 50 (dept→agent) = 60 edges
    expect(edges).toHaveLength(60)
    // Verify agent count
    expect(nodes[0].data.agentCount).toBe(50)
  })

  test('[P1] isSystem flag is preserved in agent node data', () => {
    const systemAgent = makeAgent({ id: 's1', name: 'System Bot', isSystem: true })
    const regularAgent = makeAgent({ id: 'r1', name: 'Regular', isSystem: false })
    const orgData = makeOrgData({
      departments: [{ id: 'd1', name: 'Dept', description: null, agents: [systemAgent, regularAgent] }],
    })
    const { nodes } = buildOrgFlowGraph(orgData)
    const agentNodes = nodes.filter((n) => n.type === 'agent')
    expect(agentNodes[0].data.isSystem).toBe(true)
    expect(agentNodes[1].data.isSystem).toBe(false)
  })

  test('[P1] company deptCount excludes unassigned-group', () => {
    const agent = makeAgent({ id: 'a1' })
    const unassigned = makeAgent({ id: 'u1', departmentId: null })
    const orgData = makeOrgData({
      departments: [{ id: 'd1', name: 'Dept', description: null, agents: [agent] }],
      unassignedAgents: [unassigned],
    })
    const { nodes } = buildOrgFlowGraph(orgData)
    const companyNode = nodes.find((n) => n.type === 'company')
    // deptCount should be 1 (only real departments, not unassigned-group)
    expect(companyNode!.data.deptCount).toBe(1)
    // agentCount should include ALL agents (dept + unassigned)
    expect(companyNode!.data.agentCount).toBe(2)
  })

  test('[P2] department with zero agents still creates department node', () => {
    const orgData = makeOrgData({
      departments: [{ id: 'd1', name: 'Empty Dept', description: 'No agents', agents: [] }],
    })
    const { nodes, edges } = buildOrgFlowGraph(orgData)
    expect(nodes).toHaveLength(2) // company + empty dept
    const deptNode = nodes.find((n) => n.type === 'department')
    expect(deptNode).toBeDefined()
    expect(deptNode!.data.agentCount).toBe(0)
    expect(edges).toHaveLength(1) // company → dept only
  })

  test('[P2] all unassigned agents have individual edges from group', () => {
    const agents = Array.from({ length: 4 }, (_, i) =>
      makeAgent({ id: `u${i}`, name: `Unassigned ${i}`, departmentId: null })
    )
    const orgData = makeOrgData({ unassignedAgents: agents })
    const { nodes, edges } = buildOrgFlowGraph(orgData)

    // 1 company + 1 group + 4 agents = 6 nodes
    expect(nodes).toHaveLength(6)
    // 1 (company→group) + 4 (group→agent) = 5 edges
    expect(edges).toHaveLength(5)

    // Verify each agent has an edge from unassigned-group
    const agentEdges = edges.filter((e) => e.source === 'unassigned-group')
    expect(agentEdges).toHaveLength(4)
    for (let i = 0; i < 4; i++) {
      expect(agentEdges[i].target).toBe(`agent-u${i}`)
    }
  })

  test('[P2] agent with combined flags: isSecretary + isSystem', () => {
    const agent = makeAgent({ id: 'combo', name: 'System Secretary', isSecretary: true, isSystem: true, tier: 'manager' })
    const orgData = makeOrgData({
      departments: [{ id: 'd1', name: 'Dept', description: null, agents: [agent] }],
    })
    const { nodes } = buildOrgFlowGraph(orgData)
    const agentNode = nodes.find((n) => n.type === 'agent')
    expect(agentNode!.data.isSecretary).toBe(true)
    expect(agentNode!.data.isSystem).toBe(true)
    expect(agentNode!.data.tier).toBe('manager')
  })

  test('[P2] company node counts agents across all departments correctly', () => {
    const orgData = makeOrgData({
      departments: [
        { id: 'd1', name: 'D1', description: null, agents: [makeAgent({ id: 'a1' }), makeAgent({ id: 'a2' })] },
        { id: 'd2', name: 'D2', description: null, agents: [makeAgent({ id: 'a3' })] },
        { id: 'd3', name: 'D3', description: null, agents: [] },
      ],
      unassignedAgents: [makeAgent({ id: 'u1' }), makeAgent({ id: 'u2' }), makeAgent({ id: 'u3' })],
    })
    const { nodes } = buildOrgFlowGraph(orgData)
    const companyNode = nodes.find((n) => n.type === 'company')
    // 2 + 1 + 0 + 3 unassigned = 6
    expect(companyNode!.data.agentCount).toBe(6)
    expect(companyNode!.data.deptCount).toBe(3)
  })
})
