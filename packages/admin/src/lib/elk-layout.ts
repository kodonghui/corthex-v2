import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled.js'
import type { Node, Edge } from '@xyflow/react'

// Types matching the org-chart API response
export type OrgAgent = {
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

export type OrgDept = {
  id: string
  name: string
  description: string | null
  agents: OrgAgent[]
}

export type OrgChartData = {
  company: { id: string; name: string; slug: string }
  departments: OrgDept[]
  unassignedAgents: OrgAgent[]
}

// Node dimensions
const NODE_SIZES = {
  company: { width: 280, height: 70 },
  department: { width: 240, height: 60 },
  agent: { width: 200, height: 80 },
  'unassigned-group': { width: 240, height: 60 },
} as const

const elk = new ELK()

export async function computeElkLayout(orgData: OrgChartData): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Company root node
  const companyNodeId = `company-${orgData.company.id}`
  const totalAgents = orgData.departments.reduce((s, d) => s + d.agents.length, 0) + orgData.unassignedAgents.length
  nodes.push({
    id: companyNodeId,
    type: 'company',
    position: { x: 0, y: 0 },
    data: { name: orgData.company.name, deptCount: orgData.departments.length, agentCount: totalAgents },
  })

  // Department nodes + agent nodes
  for (const dept of orgData.departments) {
    const deptNodeId = `dept-${dept.id}`
    nodes.push({
      id: deptNodeId,
      type: 'department',
      position: { x: 0, y: 0 },
      data: { name: dept.name, description: dept.description, agentCount: dept.agents.length },
    })
    edges.push({
      id: `edge-${companyNodeId}-${deptNodeId}`,
      source: companyNodeId,
      target: deptNodeId,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    })

    for (const agent of dept.agents) {
      const agentNodeId = `agent-${agent.id}`
      nodes.push({
        id: agentNodeId,
        type: 'agent',
        position: { x: 0, y: 0 },
        data: { name: agent.name, tier: agent.tier, status: agent.status, isSecretary: agent.isSecretary, isSystem: agent.isSystem },
      })
      edges.push({
        id: `edge-${deptNodeId}-${agentNodeId}`,
        source: deptNodeId,
        target: agentNodeId,
        style: { stroke: '#10b981', strokeWidth: 1.5 },
      })
    }
  }

  // Unassigned agents
  if (orgData.unassignedAgents.length > 0) {
    const unassignedGroupId = 'unassigned-group'
    nodes.push({
      id: unassignedGroupId,
      type: 'unassigned-group',
      position: { x: 0, y: 0 },
      data: { name: '미배속', agentCount: orgData.unassignedAgents.length },
    })
    edges.push({
      id: `edge-${companyNodeId}-${unassignedGroupId}`,
      source: companyNodeId,
      target: unassignedGroupId,
      style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5 5' },
    })

    for (const agent of orgData.unassignedAgents) {
      const agentNodeId = `agent-${agent.id}`
      nodes.push({
        id: agentNodeId,
        type: 'agent',
        position: { x: 0, y: 0 },
        data: { name: agent.name, tier: agent.tier, status: agent.status, isSecretary: agent.isSecretary, isSystem: agent.isSystem },
      })
      edges.push({
        id: `edge-${unassignedGroupId}-${agentNodeId}`,
        source: unassignedGroupId,
        target: agentNodeId,
        style: { stroke: '#f59e0b', strokeWidth: 1.5 },
      })
    }
  }

  // Build ELK graph
  const elkGraph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '60',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80',
      'elk.layered.spacing.edgeNodeBetweenLayers': '40',
    },
    children: nodes.map((n) => {
      const key = (n.type && n.type in NODE_SIZES ? n.type : 'agent') as keyof typeof NODE_SIZES
      const size = NODE_SIZES[key]
      return { id: n.id, width: size.width, height: size.height }
    }),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  }

  const layoutedGraph = await elk.layout(elkGraph)

  // Apply ELK positions to nodes (Map for O(N) lookup)
  const elkMap = new Map(layoutedGraph.children?.map((c) => [c.id, c]) ?? [])
  const layoutedNodes = nodes.map((n) => {
    const elkNode = elkMap.get(n.id)
    return {
      ...n,
      position: { x: elkNode?.x ?? 0, y: elkNode?.y ?? 0 },
    }
  })

  return { nodes: layoutedNodes, edges }
}
