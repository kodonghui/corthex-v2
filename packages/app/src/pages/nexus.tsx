// API Endpoints:
// GET  /workspace/org-chart
// GET  /api/workspace/nexus/layout
// PUT  /api/workspace/nexus/layout

import { useCallback, useState, useMemo } from 'react'
import { useAuthStore } from '../stores/auth-store'
import {
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
import { NexusCanvas } from '../components/nexus/nexus-canvas'
import { NexusInfoPanel } from '../components/nexus/NexusInfoPanel'
import { Network, ZoomIn, ZoomOut } from 'lucide-react'
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

// ── Layout helpers ──

const DEPT_SPACING_X = 280
const AGENT_SPACING_Y = 70
const AGENT_OFFSET_X = 40

function buildOrgGraph(org: OrgChartData['data']): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const companyId = `company-${org.company.id}`
  nodes.push({
    id: companyId,
    type: 'company',
    position: { x: 400, y: 0 },
    data: { label: org.company.name, slug: org.company.slug },
  })

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
      data: { label: dept.name, description: dept.description, agentCount: dept.agents.length },
    })

    edges.push({
      id: `e-${companyId}-${deptId}`,
      source: companyId,
      target: deptId,
      type: 'smoothstep',
    })

    dept.agents.forEach((agent, ai) => {
      const agentId = `agent-${agent.id}`
      nodes.push({
        id: agentId,
        type: 'agent',
        position: { x: deptX + AGENT_OFFSET_X * (ai % 2 === 0 ? -1 : 1), y: deptY + 120 + ai * AGENT_SPACING_Y },
        data: { label: agent.name, role: agent.role || '', status: agent.status, isSecretary: agent.isSecretary, agentId: agent.id, soul: agent.soul, tier: agent.tier },
      })

      edges.push({
        id: `e-${deptId}-${agentId}`,
        source: deptId,
        target: agentId,
        type: 'smoothstep',
      })
    })
  })

  if (org.unassignedAgents.length > 0) {
    const unassignedX = startX + totalDepts * DEPT_SPACING_X + 100
    org.unassignedAgents.forEach((agent, ai) => {
      const agentId = `agent-${agent.id}`
      nodes.push({
        id: agentId,
        type: 'agent',
        position: { x: unassignedX, y: 140 + ai * AGENT_SPACING_Y },
        data: { label: agent.name, role: agent.role || '', status: agent.status, isSecretary: agent.isSecretary, agentId: agent.id, soul: agent.soul, tier: agent.tier },
      })

      edges.push({
        id: `e-${companyId}-${agentId}`,
        source: companyId,
        target: agentId,
        type: 'smoothstep',
        style: { strokeDasharray: '5 5', stroke: '#a3b18a' },
      })
    })
  }

  return { nodes, edges }
}

// ── Toolbar ──

const oliveColor = 'var(--color-corthex-accent)'

function NexusToolbar({ editMode, onToggleEditMode, isAdmin }: { editMode: boolean; onToggleEditMode: () => void; isAdmin: boolean }) {
  const { zoomIn, zoomOut, getZoom } = useReactFlow()
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = () => { zoomIn(); setZoom(Math.round(getZoom() * 100)) }
  const handleZoomOut = () => { zoomOut(); setZoom(Math.round(getZoom() * 100)) }

  return (
    <header className="h-14 bg-corthex-surface border-b border-corthex-border px-6 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-corthex-accent" />
          <h1 className="text-lg font-bold text-corthex-accent-deep">NEXUS</h1>
          <span className="text-sm text-corthex-text-secondary">/ Org Chart</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Zoom controls */}
        <div className="flex items-center bg-corthex-elevated rounded-lg p-0.5">
          <button onClick={handleZoomOut} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-corthex-border text-corthex-text-secondary transition-colors" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-medium w-10 text-center text-corthex-text-secondary">{zoom}%</span>
          <button onClick={handleZoomIn} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-corthex-border text-corthex-text-secondary transition-colors" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Edit Mode — Admin only */}
        {isAdmin && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-corthex-text-secondary">편집 모드</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" checked={editMode} onChange={onToggleEditMode} />
                <div className="w-9 h-5 bg-corthex-border peer-focus:outline-none rounded-full peer peer-checked:bg-corthex-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-corthex-surface after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>

            <button className="px-4 py-1.5 text-sm bg-corthex-surface border border-corthex-border rounded-lg hover:bg-corthex-elevated transition-colors shadow-sm text-corthex-accent-deep font-medium">
              Save Draft
            </button>
            <button className="px-4 py-1.5 text-sm text-corthex-bg bg-corthex-accent rounded-lg hover:bg-corthex-accent-deep transition-colors shadow-sm font-medium">
              Publish Changes
            </button>
          </>
        )}
      </div>
    </header>
  )
}

// ── Inner component ──

function NexusPageInner() {
  const [selectedNode, setSelectedNode] = useState<NexusGraphNode | null>(null)
  const [editMode, setEditMode] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'

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
        <NexusToolbar editMode={false} onToggleEditMode={() => {}} isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center bg-corthex-bg" style={{ backgroundSize: '24px 24px', backgroundImage: 'radial-gradient(#d1cfcc 0.5px, transparent 0.5px)' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-corthex-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-corthex-text-secondary">조직도를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error
  if (isError) {
    return (
      <div data-testid="nexus-page" className="flex flex-col h-full">
        <NexusToolbar editMode={false} onToggleEditMode={() => {}} isAdmin={isAdmin} />
        <div className="flex-1 flex items-center justify-center bg-corthex-bg" style={{ backgroundSize: '24px 24px', backgroundImage: 'radial-gradient(#d1cfcc 0.5px, transparent 0.5px)' }}>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-sm text-red-600">조직도를 불러올 수 없습니다</p>
            <button onClick={() => refetch()} className="text-xs text-red-500 hover:text-red-400 underline mt-2">다시 시도</button>
          </div>
        </div>
      </div>
    )
  }

  const org = data?.data
  const isEmpty = !org || (org.departments.length === 0 && org.unassignedAgents.length === 0)

  if (isEmpty) {
    return (
      <div data-testid="nexus-page" className="flex flex-col h-full">
        <NexusToolbar editMode={false} onToggleEditMode={() => {}} isAdmin={isAdmin} />
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-corthex-bg" style={{ backgroundSize: '24px 24px', backgroundImage: 'radial-gradient(#d1cfcc 0.5px, transparent 0.5px)' }}>
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-dashed border-corthex-border bg-corthex-surface/80 backdrop-blur-sm max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-corthex-accent/10 flex items-center justify-center mb-2">
              <Network className="w-8 h-8 text-corthex-accent" />
            </div>
            <h2 className="text-lg font-bold text-corthex-accent-deep">조직이 구성되지 않았습니다</h2>
            <p className="text-sm text-corthex-text-secondary">관리자 패널에서 부서와 에이전트를 추가해주세요</p>
            <button className="mt-4 h-10 px-6 bg-corthex-accent text-corthex-bg rounded-xl text-sm font-bold hover:bg-corthex-accent-deep transition-colors">
              Initialize Workspace
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="nexus-page" className="h-screen flex flex-col">
      <NexusToolbar editMode={editMode} onToggleEditMode={() => setEditMode(!editMode)} isAdmin={isAdmin} />
      <main className="flex-1 flex overflow-hidden relative">
        <NexusCanvas
          nodes={currentNodes}
          edges={currentEdges}
          onNodesChange={onNodesChange as never}
          onEdgesChange={onEdgesChange as never}
          onNodeClick={handleNodeClick}
          editMode={editMode}
        />

        {selectedNode && (
          <NexusInfoPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </main>
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
