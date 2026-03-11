import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled.js'
import type { Node, Edge } from '@xyflow/react'

// Types matching the org-chart API response
export type OrgAgent = {
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

export type OrgEmployee = {
  id: string
  name: string
  username: string
  role: string
  hasCliToken: boolean
  agentCount: number
}

export type OrgDept = {
  id: string
  name: string
  description: string | null
  agents: OrgAgent[]
  employees: OrgEmployee[]
}

export type OrgChartData = {
  company: { id: string; name: string; slug: string }
  departments: OrgDept[]
  unassignedAgents: OrgAgent[]
  unassignedEmployees: OrgEmployee[]
}

// Node dimensions
const NODE_SIZES = {
  company: { width: 280, height: 70 },
  department: { width: 240, height: 60 },
  agent: { width: 200, height: 80 },
  human: { width: 200, height: 70 },
  'unassigned-group': { width: 240, height: 60 },
} as const

// Edge styles by type
export const EDGE_STYLES = {
  membership: { stroke: '#10b981', strokeWidth: 1.5 },
  employment: { stroke: '#a855f7', strokeWidth: 1.5 },
  delegation: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '5 5' },
  ownership: { stroke: '#a855f7', strokeWidth: 1, strokeDasharray: '8 4 2 4' },
} as const

const elk = new ELK()

export async function computeElkLayout(orgData: OrgChartData): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Collect all agents for cross-references (reportTo, ownerUserId)
  const allAgents = orgData.departments.flatMap((d) => d.agents).concat(orgData.unassignedAgents)

  // Count subordinates per agent (reportTo)
  const subordinateCount = new Map<string, number>()
  for (const a of allAgents) {
    if (a.reportTo) {
      subordinateCount.set(a.reportTo, (subordinateCount.get(a.reportTo) ?? 0) + 1)
    }
  }

  // Company root node
  const companyNodeId = `company-${orgData.company.id}`
  const totalAgents = allAgents.length
  const allEmployees = orgData.departments.flatMap((d) => d.employees ?? []).concat(orgData.unassignedEmployees ?? [])
  nodes.push({
    id: companyNodeId,
    type: 'company',
    position: { x: 0, y: 0 },
    data: { name: orgData.company.name, deptCount: orgData.departments.length, agentCount: totalAgents },
  })

  // Department nodes + agent nodes + employee nodes
  for (const dept of orgData.departments) {
    const deptNodeId = `dept-${dept.id}`

    // Find manager name for this department
    const manager = dept.agents.find((a) => a.tier === 'manager')
    const employeeCount = (dept.employees ?? []).length

    nodes.push({
      id: deptNodeId,
      type: 'department',
      position: { x: 0, y: 0 },
      data: {
        name: dept.name,
        description: dept.description,
        agentCount: dept.agents.length,
        employeeCount,
        managerName: manager?.name ?? null,
      },
    })
    edges.push({
      id: `edge-${companyNodeId}-${deptNodeId}`,
      source: companyNodeId,
      target: deptNodeId,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    })

    // Agent nodes within department
    for (const agent of dept.agents) {
      const agentNodeId = `agent-${agent.id}`
      nodes.push({
        id: agentNodeId,
        type: 'agent',
        position: { x: 0, y: 0 },
        data: {
          name: agent.name,
          tier: agent.tier,
          tierLevel: agent.tierLevel,
          status: agent.status,
          isSecretary: agent.isSecretary,
          isSystem: agent.isSystem,
          subordinateCount: subordinateCount.get(agent.id) ?? 0,
        },
      })
      edges.push({
        id: `edge-${deptNodeId}-${agentNodeId}`,
        source: deptNodeId,
        target: agentNodeId,
        type: 'membership',
        style: { ...EDGE_STYLES.membership },
      })
    }

    // Employee nodes within department
    for (const emp of dept.employees ?? []) {
      const humanNodeId = `human-${emp.id}`
      // Only add if not already added (employee may be in multiple departments)
      if (!nodes.some((n) => n.id === humanNodeId)) {
        nodes.push({
          id: humanNodeId,
          type: 'human',
          position: { x: 0, y: 0 },
          data: {
            name: emp.name,
            username: emp.username,
            role: emp.role,
            hasCliToken: emp.hasCliToken,
            agentCount: emp.agentCount,
          },
        })
      }
      edges.push({
        id: `edge-${deptNodeId}-${humanNodeId}`,
        source: deptNodeId,
        target: humanNodeId,
        type: 'employment',
        style: { ...EDGE_STYLES.employment },
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
        data: {
          name: agent.name,
          tier: agent.tier,
          tierLevel: agent.tierLevel,
          status: agent.status,
          isSecretary: agent.isSecretary,
          isSystem: agent.isSystem,
          subordinateCount: subordinateCount.get(agent.id) ?? 0,
        },
      })
      edges.push({
        id: `edge-${unassignedGroupId}-${agentNodeId}`,
        source: unassignedGroupId,
        target: agentNodeId,
        style: { ...EDGE_STYLES.membership },
      })
    }
  }

  // Unassigned employees
  for (const emp of orgData.unassignedEmployees ?? []) {
    const humanNodeId = `human-${emp.id}`
    if (!nodes.some((n) => n.id === humanNodeId)) {
      nodes.push({
        id: humanNodeId,
        type: 'human',
        position: { x: 0, y: 0 },
        data: {
          name: emp.name,
          username: emp.username,
          role: emp.role,
          hasCliToken: emp.hasCliToken,
          agentCount: emp.agentCount,
        },
      })
      // Connect unassigned employees directly to company
      edges.push({
        id: `edge-${companyNodeId}-${humanNodeId}`,
        source: companyNodeId,
        target: humanNodeId,
        style: { ...EDGE_STYLES.employment },
      })
    }
  }

  // Delegation edges (manager→subordinate via reportTo)
  for (const agent of allAgents) {
    if (agent.reportTo) {
      const sourceId = `agent-${agent.reportTo}`
      const targetId = `agent-${agent.id}`
      // Only add if both nodes exist
      if (nodes.some((n) => n.id === sourceId) && nodes.some((n) => n.id === targetId)) {
        edges.push({
          id: `delegate-${agent.reportTo}-${agent.id}`,
          source: sourceId,
          target: targetId,
          type: 'delegation',
          style: { ...EDGE_STYLES.delegation },
          markerEnd: { type: 'arrowclosed' as const, color: '#f59e0b' },
        })
      }
    }
  }

  // Ownership edges (human→agent via ownerUserId)
  for (const agent of allAgents) {
    if (agent.ownerUserId) {
      const sourceId = `human-${agent.ownerUserId}`
      const targetId = `agent-${agent.id}`
      if (nodes.some((n) => n.id === sourceId) && nodes.some((n) => n.id === targetId)) {
        edges.push({
          id: `owner-${agent.ownerUserId}-${agent.id}`,
          source: sourceId,
          target: targetId,
          type: 'ownership',
          style: { ...EDGE_STYLES.ownership },
        })
      }
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
