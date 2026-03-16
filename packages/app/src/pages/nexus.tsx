import { useCallback, useState, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { CompanyNode } from '../components/nexus/CompanyNode'
import { DepartmentNode } from '../components/nexus/DepartmentNode'
import { AgentNode } from '../components/nexus/AgentNode'
import { NexusInfoPanel } from '../components/nexus/NexusInfoPanel'
import type { NexusGraphNode } from '@corthex/shared'

// ── Types ──

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
  data: {
    company: { id: string; name: string; slug: string }
    departments: OrgDept[]
    unassignedAgents: OrgAgent[]
  }
}

// ── Node types for React Flow ──

const nexusNodeTypes = {
  company: CompanyNode,
  department: DepartmentNode,
  agent: AgentNode,
}

// ── Layout helpers ──

const DEPT_SPACING_X = 280
const AGENT_SPACING_Y = 70
const AGENT_OFFSET_X = 40

function buildOrgGraph(org: OrgChartData['data']): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Company root node
  const companyId = `company-${org.company.id}`
  nodes.push({
    id: companyId,
    type: 'company',
    position: { x: 400, y: 0 },
    data: { label: org.company.name, slug: org.company.slug },
  })

  // Departments
  const totalDepts = org.departments.length
  const startX = 400 - ((totalDepts - 1) * DEPT_SPACING_X) / 2

  org.departments.forEach((dept, di) => {
    const deptId = `dept-${dept.id}`
    const deptX = startX + di * DEPT_SPACING_X
    const deptY = 140

    nodes.push({
      id: deptId,
      type: 'department',
      position: { x: deptX, y: deptY },
      data: {
        label: dept.name,
        description: dept.description,
        agentCount: dept.agents.length,
      },
    })

    edges.push({
      id: `e-${companyId}-${deptId}`,
      source: companyId,
      target: deptId,
      type: 'smoothstep',
    })

    // Agents under department
    dept.agents.forEach((agent, ai) => {
      const agentId = `agent-${agent.id}`
      nodes.push({
        id: agentId,
        type: 'agent',
        position: {
          x: deptX + AGENT_OFFSET_X * (ai % 2 === 0 ? -1 : 1),
          y: deptY + 120 + ai * AGENT_SPACING_Y,
        },
        data: {
          label: agent.name,
          role: agent.role || '',
          status: agent.status,
          isSecretary: agent.isSecretary,
          agentId: agent.id,
          soul: agent.soul,
        },
      })

      edges.push({
        id: `e-${deptId}-${agentId}`,
        source: deptId,
        target: agentId,
        type: 'smoothstep',
      })
    })
  })

  // Unassigned agents
  if (org.unassignedAgents.length > 0) {
    const unassignedX = startX + totalDepts * DEPT_SPACING_X + 100
    org.unassignedAgents.forEach((agent, ai) => {
      const agentId = `agent-${agent.id}`
      nodes.push({
        id: agentId,
        type: 'agent',
        position: { x: unassignedX, y: 140 + ai * AGENT_SPACING_Y },
        data: {
          label: agent.name,
          role: agent.role || '',
          status: agent.status,
          isSecretary: agent.isSecretary,
          agentId: agent.id,
          soul: agent.soul,
        },
      })

      edges.push({
        id: `e-${companyId}-${agentId}`,
        source: companyId,
        target: agentId,
        type: 'smoothstep',
        style: { strokeDasharray: '5 5', stroke: '#f59e0b' },
      })
    })
  }

  return { nodes, edges }
}

// ── Inner component ──

function NexusPageInner() {
  const [selectedNode, setSelectedNode] = useState<NexusGraphNode | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['workspace-org-chart'],
    queryFn: () => api.get<OrgChartData>('/workspace/org-chart'),
  })

  const graph = useMemo(() => {
    if (!data?.data) return { nodes: [], edges: [] }
    return buildOrgGraph(data.data)
  }, [data])

  const [nodes, , onNodesChange] = useNodesState(graph.nodes)
  const [edges, , onEdgesChange] = useEdgesState(graph.edges)

  // Sync nodes/edges when data changes
  const currentNodes = graph.nodes.length > 0 && nodes.length === 0 ? graph.nodes : nodes
  const currentEdges = graph.edges.length > 0 && edges.length === 0 ? graph.edges : edges

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'agent') {
        const d = node.data as Record<string, unknown>
        setSelectedNode({
          id: node.id,
          type: 'agent',
          label: d.label as string,
          x: 0,
          y: 0,
          role: (d.role as string) || undefined,
          status: (d.status as string) || 'offline',
          isSecretary: (d.isSecretary as boolean) || false,
          agentId: (d.agentId as string) || undefined,
          soul: (d.soul as string) || undefined,
        })
      }
    },
    [],
  )

  // Loading
  if (isLoading) {
    return (
      <div data-testid="nexus-page" className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">조직도를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // Error
  if (isError) {
    return (
      <div data-testid="nexus-page" className="flex items-center justify-center h-full">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-sm text-red-400">조직도를 불러올 수 없습니다</p>
          <button
            onClick={() => refetch()}
            className="text-xs text-red-400 hover:text-red-300 underline mt-2"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const org = data?.data
  const isEmpty =
    !org || (org.departments.length === 0 && org.unassignedAgents.length === 0)

  if (isEmpty) {
    return (
      <div data-testid="nexus-page" className="flex items-center justify-center h-full">
        <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-sm font-medium text-slate-300">
            조직이 구성되지 않았습니다
          </p>
          <p className="text-xs text-slate-500 mt-1">
            관리자 패널에서 부서와 에이전트를 추가해주세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="nexus-page" className="flex h-full">
      <div className="flex-1">
        <ReactFlow
          nodes={currentNodes}
          edges={currentEdges}
          nodeTypes={nexusNodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          deleteKeyCode={[]}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
          <Controls className="!bg-slate-800 !border-slate-700 !shadow-lg [&_button]:!bg-slate-700 [&_button]:!border-slate-600 [&_button]:!text-slate-300 [&_button:hover]:!bg-slate-600" />
          <MiniMap
            nodeStrokeWidth={3}
            style={{ width: 150, height: 100 }}
            className="!bg-slate-800 !border-slate-700 hidden md:block"
          />
        </ReactFlow>
      </div>

      {selectedNode && (
        <NexusInfoPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  )
}

// ── Export ──

export function NexusPage() {
  return (
    <ReactFlowProvider>
      <NexusPageInner />
    </ReactFlowProvider>
  )
}
