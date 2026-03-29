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
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Share2,
  Circle,
  Settings,
  HelpCircle,
} from 'lucide-react'
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
        style: { strokeDasharray: '5 5', stroke: 'var(--color-corthex-accent)' },
      })
    })
  }

  return { nodes, edges }
}

// ── Floating Toolbar ──

function NexusFloatingToolbar({
  editMode,
  onToggleEditMode,
  isAdmin,
  zoom,
}: {
  editMode: boolean
  onToggleEditMode: () => void
  isAdmin: boolean
  zoom: number
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  return (
    <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 z-40 bg-corthex-surface/90 backdrop-blur-lg border border-corthex-border rounded-xl shadow-2xl p-1.5 md:p-2 flex items-center gap-1 max-w-[calc(100vw-2rem)] overflow-x-auto">
      {/* Zoom */}
      <div className="flex items-center border-r border-corthex-border px-1.5 md:px-2 gap-1 shrink-0">
        <button
          onClick={() => zoomIn()}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-corthex-elevated text-corthex-text-secondary hover:text-corthex-text-primary rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-mono w-10 text-center text-corthex-text-secondary hidden md:block">{zoom}%</span>
        <button
          onClick={() => zoomOut()}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-corthex-elevated text-corthex-text-secondary hover:text-corthex-text-primary rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => fitView({ padding: 0.1 })}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-corthex-elevated text-corthex-text-secondary hover:text-corthex-text-primary rounded-lg transition-colors"
          title="Fit to View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Layout */}
      <div className="hidden md:flex items-center border-r border-corthex-border px-2 gap-1 shrink-0">
        <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-corthex-text-secondary hover:text-corthex-text-primary hover:bg-corthex-elevated rounded-lg transition-colors">
          <Share2 className="w-3.5 h-3.5" /> Tree
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-corthex-accent bg-corthex-accent/10 rounded-lg transition-colors">
          <Circle className="w-3.5 h-3.5" /> Radial
        </button>
      </div>

      {/* Export */}
      <div className="hidden md:flex items-center px-2 gap-1 shrink-0">
        <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-corthex-text-secondary hover:text-corthex-text-primary hover:bg-corthex-elevated rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="flex items-center border-l border-corthex-border pl-2 gap-1">
          <label className="flex items-center gap-1.5 px-2 py-1 cursor-pointer">
            <span className="text-[10px] font-medium text-corthex-text-secondary">편집</span>
            <div className="relative inline-flex items-center">
              <input
                className="sr-only peer"
                type="checkbox"
                checked={editMode}
                onChange={onToggleEditMode}
              />
              <div className="w-8 h-4 bg-corthex-border peer-focus:outline-none rounded-full peer peer-checked:bg-corthex-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-corthex-surface after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
            </div>
          </label>
          {editMode && (
            <>
              <button className="px-3 py-1.5 text-xs text-corthex-text-secondary border border-corthex-border rounded-lg hover:bg-corthex-elevated transition-colors">
                Save Draft
              </button>
              <button className="px-3 py-1.5 text-xs text-corthex-text-on-accent bg-corthex-accent rounded-lg hover:bg-corthex-accent-hover transition-colors font-medium">
                Publish
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Inner component ──

function NexusPageInner() {
  const [selectedNode, setSelectedNode] = useState<NexusGraphNode | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [zoom] = useState(100)
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

  const agentNodes = currentNodes.filter((n) => n.type === 'agent')
  const activeAgentCount = agentNodes.filter((n) => {
    const d = n.data as Record<string, unknown>
    return d.status === 'active' || d.status === 'online'
  }).length
  const totalAgentCount = agentNodes.length

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

  // Canvas grid background style
  const canvasGridStyle = {
    backgroundImage: 'radial-gradient(#44403C 1px, transparent 1px)',
    backgroundSize: '32px 32px',
  }

  // Loading
  if (isLoading) {
    return (
      <div data-testid="nexus-page" className="h-screen relative overflow-hidden bg-corthex-bg" style={canvasGridStyle}>
        {/* Title overlay */}
        <div className="absolute top-6 left-6 z-30 pointer-events-none">
          <h1 className="text-xl font-bold text-corthex-text-primary tracking-tight">
            CORTHEX <span className="text-corthex-accent">NEXUS</span>
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-corthex-text-secondary">
            Agent Topology Canvas v2.4.0
          </p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 bg-corthex-surface/80 backdrop-blur-sm border border-corthex-border rounded-xl p-8">
            <div className="w-8 h-8 border-2 border-corthex-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-corthex-text-secondary font-mono">조직도를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error
  if (isError) {
    return (
      <div data-testid="nexus-page" className="h-screen relative overflow-hidden bg-corthex-bg" style={canvasGridStyle}>
        <div className="absolute top-6 left-6 z-30 pointer-events-none">
          <h1 className="text-xl font-bold text-corthex-text-primary tracking-tight">
            CORTHEX <span className="text-corthex-accent">NEXUS</span>
          </h1>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-corthex-surface border border-corthex-error/30 rounded-xl p-6 text-center">
            <p className="text-sm text-corthex-error mb-2">조직도를 불러올 수 없습니다</p>
            <button
              onClick={() => refetch()}
              className="text-xs text-corthex-accent hover:text-corthex-accent-hover underline"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  const org = data?.data
  const isEmpty = !org || (org.departments.length === 0 && org.unassignedAgents.length === 0)

  if (isEmpty) {
    return (
      <div data-testid="nexus-page" className="h-screen relative overflow-hidden bg-corthex-bg" style={canvasGridStyle}>
        <div className="absolute top-6 left-6 z-30 pointer-events-none">
          <h1 className="text-xl font-bold text-corthex-text-primary tracking-tight">
            CORTHEX <span className="text-corthex-accent">NEXUS</span>
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-corthex-text-secondary">
            Agent Topology Canvas v2.4.0
          </p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 rounded-xl border border-dashed border-corthex-border bg-corthex-surface/80 backdrop-blur-sm max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-corthex-accent/10 flex items-center justify-center">
              <Network className="w-8 h-8 text-corthex-accent" />
            </div>
            <h2 className="text-lg font-bold text-corthex-accent">조직이 구성되지 않았습니다</h2>
            <p className="text-sm text-corthex-text-secondary">관리자 패널에서 부서와 에이전트를 추가해주세요</p>
            <button onClick={() => window.open('/admin/departments', '_blank')} className="mt-2 h-10 px-6 bg-corthex-accent text-corthex-text-on-accent rounded-lg text-sm font-bold hover:bg-corthex-accent-hover transition-colors">
              Initialize Workspace
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="nexus-page" className="h-screen relative overflow-hidden bg-corthex-bg" style={canvasGridStyle}>
      {/* Canvas fills entire space */}
      <NexusCanvas
        nodes={currentNodes}
        edges={currentEdges}
        onNodesChange={onNodesChange as never}
        onEdgesChange={onEdgesChange as never}
        onNodeClick={handleNodeClick}
        editMode={editMode}
      />

      {/* ── Overlays ── */}

      {/* Top-left: Title */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-30 pointer-events-none">
        <h1 className="text-base md:text-xl font-bold text-corthex-text-primary tracking-tight">
          CORTHEX <span className="text-corthex-accent">NEXUS</span>
        </h1>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-corthex-text-secondary">
          Agent Topology Canvas v2.4.0
        </p>
      </div>

      {/* Top-right: Network Health + Settings */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex flex-col gap-2">
        <div className="hidden md:block bg-corthex-surface border border-corthex-border p-4 rounded-lg w-64 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-corthex-text-secondary">
              Network Health
            </span>
            <span className="text-xs font-mono text-corthex-success">99.8%</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-corthex-text-secondary">Active Agents</span>
              <span className="text-xs font-mono text-corthex-text-primary">
                {activeAgentCount} / {totalAgentCount}
              </span>
            </div>
            <div className="w-full bg-corthex-border h-1 rounded-full overflow-hidden">
              <div
                className="bg-corthex-accent h-full"
                style={{ width: totalAgentCount > 0 ? `${(activeAgentCount / totalAgentCount) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-corthex-text-secondary">Departments</span>
              <span className="text-xs font-mono text-corthex-text-primary">
                {org?.departments.length ?? 0}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button className="w-10 h-10 bg-corthex-surface border border-corthex-border flex items-center justify-center rounded-lg hover:bg-corthex-elevated transition-colors text-corthex-text-secondary">
            <Settings className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 bg-corthex-surface border border-corthex-border flex items-center justify-center rounded-lg hover:bg-corthex-elevated transition-colors text-corthex-text-secondary">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom-center: Floating Toolbar */}
      <NexusFloatingToolbar
        editMode={editMode}
        onToggleEditMode={() => setEditMode(!editMode)}
        isAdmin={isAdmin}
        zoom={zoom}
      />

      {/* Bottom-left: Legend */}
      <div className="hidden md:block absolute bottom-10 left-10 z-30">
        <div className="bg-corthex-bg/80 backdrop-blur-md p-3 rounded border border-corthex-border/50">
          <div className="text-[9px] uppercase tracking-widest font-bold text-corthex-text-disabled mb-2">Legend</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-corthex-accent" />
              <span className="text-[10px] text-corthex-text-secondary">Master Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded bg-corthex-border border border-corthex-accent/30" />
              <span className="text-[10px] text-corthex-text-secondary">Standard Agent Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-[1px] bg-corthex-accent" style={{ borderStyle: 'dashed' }} />
              <span className="text-[10px] text-corthex-text-secondary">Command Sync Line</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
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
