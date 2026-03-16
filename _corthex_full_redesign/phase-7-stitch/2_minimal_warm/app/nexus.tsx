// API Endpoints:
// GET  /workspace/org-chart
// GET  /api/workspace/nexus/layout
// PUT  /api/workspace/nexus/layout

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
        data: { label: agent.name, role: agent.role || '', status: agent.status, isSecretary: agent.isSecretary, agentId: agent.id, soul: agent.soul },
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
        data: { label: agent.name, role: agent.role || '', status: agent.status, isSecretary: agent.isSecretary, agentId: agent.id, soul: agent.soul },
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

const oliveColor = '#e57373'

function NexusToolbar({ editMode, onToggleEditMode }: { editMode: boolean; onToggleEditMode: () => void }) {
  const { zoomIn, zoomOut, getZoom } = useReactFlow()
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = () => { zoomIn(); setZoom(Math.round(getZoom() * 100)) }
  const handleZoomOut = () => { zoomOut(); setZoom(Math.round(getZoom() * 100)) }

  return (
    <header className="h-14 bg-white border-b px-6 flex items-center justify-between z-10 shrink-0" style={{ borderColor: '#f5f3ec' }}>
      <div className="flex items-center gap-4">
        <div className="font-bold text-xl tracking-tighter" style={{ color: oliveColor }}>
          CORTHEX <span className="text-xs font-normal border px-1 rounded" style={{ borderColor: oliveColor }}>v2</span>
        </div>
        <div className="h-4 w-px bg-gray-200"></div>
        <h1 className="text-lg font-medium text-gray-700">NEXUS <span className="text-sm font-light text-gray-400">/ Org Chart</span></h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Zoom controls */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button onClick={handleZoomOut} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 text-gray-500 transition-colors" title="Zoom Out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          </button>
          <span className="text-xs font-medium w-10 text-center text-gray-500">{zoom}%</span>
          <button onClick={handleZoomIn} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 text-gray-500 transition-colors" title="Zoom In">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>

        {/* Edit Mode */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">편집 모드</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input className="sr-only peer" type="checkbox" checked={editMode} onChange={onToggleEditMode} />
            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ ['--tw-peer-checked-bg' as string]: oliveColor }} />
          </label>
        </div>

        <button className="px-4 py-1.5 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
          Save Draft
        </button>
        <button className="px-4 py-1.5 text-sm text-white rounded-md hover:opacity-90 transition-colors shadow-sm" style={{ backgroundColor: oliveColor }}>
          Publish Changes
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
      <div data-testid="nexus-page" className="flex flex-col h-full" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
        <NexusToolbar editMode={false} onToggleEditMode={() => {}} />
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#fcfbf9', backgroundSize: '24px 24px', backgroundImage: 'radial-gradient(#d1cfcc 0.5px, transparent 0.5px)' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: oliveColor, borderTopColor: 'transparent' }} />
            <p className="text-sm text-gray-400">조직도를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error
  if (isError) {
    return (
      <div data-testid="nexus-page" className="flex flex-col h-full" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
        <NexusToolbar editMode={false} onToggleEditMode={() => {}} />
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#fcfbf9', backgroundSize: '24px 24px', backgroundImage: 'radial-gradient(#d1cfcc 0.5px, transparent 0.5px)' }}>
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
      <div data-testid="nexus-page" className="flex flex-col h-full" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
        <NexusToolbar editMode={false} onToggleEditMode={() => {}} />
        <div className="flex-1 relative flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#fcfbf9', backgroundSize: '24px 24px', backgroundImage: 'radial-gradient(#d1cfcc 0.5px, transparent 0.5px)' }}>
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-dashed border-gray-300 bg-white/80 backdrop-blur-sm max-w-md text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${oliveColor}1a` }}>
              <svg className="w-8 h-8" style={{ color: oliveColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">조직이 구성되지 않았습니다</h2>
            <p className="text-sm text-gray-500">관리자 패널에서 부서와 에이전트를 추가해주세요</p>
            <button className="mt-4 h-10 px-6 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity" style={{ backgroundColor: oliveColor }}>
              Initialize Workspace
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="nexus-page" className="h-screen flex flex-col" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      <NexusToolbar editMode={editMode} onToggleEditMode={() => setEditMode(!editMode)} />
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Tools) */}
        <aside className="w-16 bg-white border-r flex flex-col items-center py-6 gap-6 z-10" style={{ borderColor: '#f5f3ec' }}>
          <div className="flex flex-col gap-4">
            <button className="p-3 rounded-xl hover:opacity-80 transition-all group relative" style={{ backgroundColor: '#f5f3ec', color: oliveColor }} title="Add Department">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </button>
            <button className="p-3 rounded-xl hover:opacity-80 transition-all group relative" style={{ backgroundColor: '#f5f3ec', color: oliveColor }} title="Add Agent">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </button>
          </div>
          <div className="w-8 h-px bg-gray-100"></div>
          <button className="p-3 text-gray-400 hover:opacity-80 transition-colors" title="ELK.js Auto-layout">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          </button>
        </aside>

        {/* Nexus Canvas Area */}
        <div className="flex-1 relative" style={{ backgroundColor: '#fcfbf9' }}>
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
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#d1cfcc" />
            <Controls
              showInteractive={false}
              className="!bg-white !border-gray-200 !shadow-lg !rounded-xl [&_button]:!bg-gray-50 [&_button]:!border-gray-200 [&_button]:!text-gray-500 [&_button:hover]:!bg-gray-100 [&_button]:!rounded-lg"
            />
            <MiniMap
              nodeStrokeWidth={3}
              style={{ width: 192, height: 128 }}
              className="!bg-white !border-gray-200 !rounded-xl !shadow-lg hidden md:block"
              nodeColor={(n) => {
                if (n.type === 'company') return oliveColor
                if (n.type === 'department') return '#94a3b8'
                return '#cbd5e1'
              }}
            />
          </ReactFlow>
        </div>

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
