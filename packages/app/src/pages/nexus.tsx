import { useCallback, useState, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
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
import { Network, Minus, Plus, Download } from 'lucide-react'
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

// ── Toolbar ──

function NexusToolbar({ editMode, onToggleEditMode }: { editMode: boolean; onToggleEditMode: () => void }) {
  const { zoomIn, zoomOut, getZoom } = useReactFlow()
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = () => {
    zoomIn()
    setZoom(Math.round(getZoom() * 100))
  }
  const handleZoomOut = () => {
    zoomOut()
    setZoom(Math.round(getZoom() * 100))
  }

  return (
    <header className="h-12 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 z-10 shrink-0">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <h1 className="text-sm font-bold tracking-wide text-white">NEXUS</h1>
        </div>
        <div className="w-px h-4 bg-slate-700 mx-2" />
        <span className="text-xs text-slate-400 font-medium">Global Operations Network</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Zoom */}
        <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-700 text-slate-300 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium w-10 text-center text-slate-300">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-700 text-slate-300 transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Edit Mode */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">편집 모드</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              className="sr-only peer"
              type="checkbox"
              checked={editMode}
              onChange={onToggleEditMode}
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-400" />
          </label>
        </div>

        {/* Export */}
        <button className="h-8 px-4 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5">
          <Download className="w-4 h-4" />
          내보내기
        </button>
      </div>
    </header>
  )
}

// ── Inner component ──

function NexusPageInner() {
  const [selectedNode, setSelectedNode] = useState<NexusGraphNode | null>(null)
  const [editMode, setEditMode] = useState(false)

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
      <div data-testid="nexus-page" className="flex flex-col h-full">
        <NexusToolbar editMode={false} onToggleEditMode={() => {}} />
        <div className="flex-1 flex items-center justify-center" style={{ backgroundSize: '24px 24px', backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px)' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">조직도를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error
  if (isError) {
    return (
      <div data-testid="nexus-page" className="flex flex-col h-full">
        <NexusToolbar editMode={false} onToggleEditMode={() => {}} />
        <div className="flex-1 flex items-center justify-center" style={{ backgroundSize: '24px 24px', backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px)' }}>
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
      </div>
    )
  }

  const org = data?.data
  const isEmpty =
    !org || (org.departments.length === 0 && org.unassignedAgents.length === 0)

  if (isEmpty) {
    return (
      <div data-testid="nexus-page" className="flex flex-col h-full">
        <NexusToolbar editMode={false} onToggleEditMode={() => {}} />
        <div className="flex-1 relative flex items-center justify-center overflow-hidden" style={{ backgroundSize: '24px 24px', backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px)' }}>
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 backdrop-blur-sm max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-cyan-400/10 flex items-center justify-center mb-2">
              <Network className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-lg font-bold text-white">
              조직이 구성되지 않았습니다
            </h2>
            <p className="text-sm text-slate-400">
              관리자 패널에서 부서와 에이전트를 추가해주세요
            </p>
            <button className="mt-4 h-10 px-6 bg-slate-100 text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
              Initialize Workspace
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="nexus-page" className="flex flex-col h-full">
      <NexusToolbar editMode={editMode} onToggleEditMode={() => setEditMode(!editMode)} />
      <div className="flex-1 flex relative">
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
            nodesDraggable={editMode}
            nodesConnectable={false}
            elementsSelectable={true}
            deleteKeyCode={[]}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(148, 163, 184, 0.2)" />
            <Controls
              showInteractive={false}
              className="!bg-slate-900/80 !backdrop-blur-md !border-slate-800 !shadow-lg !rounded-xl [&_button]:!bg-slate-800 [&_button]:!border-slate-700 [&_button]:!text-slate-300 [&_button:hover]:!bg-slate-700 [&_button]:!rounded-lg"
            />
            <MiniMap
              nodeStrokeWidth={3}
              style={{ width: 192, height: 128 }}
              className="!bg-slate-900/80 !backdrop-blur-md !border-slate-800 !rounded-xl !shadow-lg hidden md:block"
              nodeColor={(n) => {
                if (n.type === 'company') return '#22d3ee'
                if (n.type === 'department') return '#475569'
                return '#64748b'
              }}
            />
          </ReactFlow>
        </div>

        {selectedNode && (
          <NexusInfoPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </div>
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
