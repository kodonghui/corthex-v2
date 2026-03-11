import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type NodeTypes,
  type Node,
  type Edge,
  type NodeChange,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { computeElkLayout, type OrgChartData } from '../lib/elk-layout'
import { CompanyNode } from '../components/nexus/company-node'
import { DepartmentNode } from '../components/nexus/department-node'
import { AgentNode } from '../components/nexus/agent-node'
import { HumanNode } from '../components/nexus/human-node'
import { UnassignedGroupNode } from '../components/nexus/unassigned-group-node'
import { NexusToolbar } from '../components/nexus/nexus-toolbar'
import { exportToPng, exportToSvg, exportToJson, printCanvas } from '../lib/nexus-export'
import { Skeleton } from '@corthex/ui'

// Register custom node types
const nodeTypes: NodeTypes = {
  company: CompanyNode,
  department: DepartmentNode,
  agent: AgentNode,
  human: HumanNode,
  'unassigned-group': UnassignedGroupNode,
} as unknown as NodeTypes

// Saved layout data shape
type SavedLayoutData = {
  nodePositions: Record<string, { x: number; y: number }>
  viewport?: { x: number; y: number; zoom: number }
} | null

// MiniMap color mapping
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

function NexusSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40 bg-slate-800" />
      <Skeleton className="h-[600px] w-full bg-slate-800/50 rounded-xl" />
    </div>
  )
}

function NexusCanvas() {
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()
  const { fitView } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[])
  const [layoutReady, setLayoutReady] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Ref to track if we applied saved layout (to avoid ELK overriding it)
  const appliedSavedLayout = useRef(false)
  const reactFlowRef = useRef<HTMLDivElement>(null)

  // Fetch org data
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['org-chart', selectedCompanyId],
    queryFn: () => api.get<{ data: OrgChartData }>(`/admin/org-chart?companyId=${encodeURIComponent(selectedCompanyId!)}`),
    enabled: !!selectedCompanyId,
    refetchInterval: 30_000, // Poll every 30s for real-time updates (admin has no WS)
  })

  // Fetch saved layout
  const { data: savedLayout } = useQuery({
    queryKey: ['nexus-layout', selectedCompanyId],
    queryFn: () => api.get<{ data: SavedLayoutData }>('/admin/nexus/layout'),
    enabled: !!selectedCompanyId,
  })

  // Save layout mutation
  const saveMutation = useMutation({
    mutationFn: (layoutData: { nodePositions: Record<string, { x: number; y: number }>; viewport?: { x: number; y: number; zoom: number } }) =>
      api.put('/admin/nexus/layout', layoutData),
    onSuccess: () => {
      setIsDirty(false)
      queryClient.invalidateQueries({ queryKey: ['nexus-layout', selectedCompanyId] })
      addToast({ type: 'success', message: '레이아웃이 저장되었습니다' })
    },
    onError: () => {
      addToast({ type: 'error', message: '레이아웃 저장에 실패했습니다' })
    },
  })

  // Compute ELK layout when data changes, applying saved positions if available
  useEffect(() => {
    if (!data?.data) return
    let stale = false
    setLayoutReady(false)

    computeElkLayout(data.data)
      .then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        if (stale) return

        // Apply saved positions if available
        const saved = savedLayout?.data
        if (saved?.nodePositions) {
          const positioned = layoutedNodes.map((n) => {
            const pos = saved.nodePositions[n.id]
            return pos ? { ...n, position: pos } : n
          })
          setNodes(positioned)
          appliedSavedLayout.current = true
        } else {
          setNodes(layoutedNodes)
          appliedSavedLayout.current = false
        }

        setEdges(layoutedEdges)
        setLayoutReady(true)
        setIsDirty(false)
      })
      .catch((err) => {
        if (!stale) console.error('ELK layout failed:', err)
      })
    return () => { stale = true }
  }, [data, savedLayout, setNodes, setEdges])

  // Handle nodes change — track position changes for dirty flag (edit mode only)
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes)
      // Only track dirty in edit mode — view mode drags are exploratory
      if (!isEditMode) return
      const hasPositionChange = changes.some(
        (c) => c.type === 'position' && 'dragging' in c && !c.dragging,
      )
      if (hasPositionChange) {
        setIsDirty(true)
      }
    },
    [onNodesChange, isEditMode],
  )

  // Node click — select node
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
  }, [])

  // Pane click — deselect
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  // Toggle edit mode
  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => {
      const next = !prev
      if (next) {
        addToast({ type: 'info', message: '편집 모드입니다. 노드를 드래그하여 위치를 변경하세요.' })
      }
      return next
    })
  }, [addToast])

  // Auto layout (re-run ELK)
  const handleAutoLayout = useCallback(() => {
    if (!data?.data) return
    computeElkLayout(data.data)
      .then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
        setIsDirty(true)
        addToast({ type: 'info', message: '자동 정렬이 완료되었습니다' })
      })
      .catch((err) => {
        console.error('Auto layout failed:', err)
        addToast({ type: 'error', message: '자동 정렬에 실패했습니다' })
      })
  }, [data, setNodes, setEdges, addToast])

  // Save layout
  const handleSaveLayout = useCallback(() => {
    const positions: Record<string, { x: number; y: number }> = {}
    for (const node of nodes) {
      positions[node.id] = { x: node.position.x, y: node.position.y }
    }
    saveMutation.mutate({ nodePositions: positions })
  }, [nodes, saveMutation])

  // Fit view handler
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2 })
  }, [fitView])

  // Export handlers
  const handleExportPng = useCallback(async () => {
    const el = reactFlowRef.current
    if (!el || !data?.data) return
    setIsExporting(true)
    try {
      await exportToPng(el, data.data.company.name)
      addToast({ type: 'success', message: 'PNG 이미지가 다운로드되었습니다' })
    } catch {
      addToast({ type: 'error', message: 'PNG 내보내기에 실패했습니다' })
    } finally {
      setIsExporting(false)
    }
  }, [data, addToast])

  const handleExportSvg = useCallback(async () => {
    const el = reactFlowRef.current
    if (!el || !data?.data) return
    setIsExporting(true)
    try {
      await exportToSvg(el, data.data.company.name)
      addToast({ type: 'success', message: 'SVG 파일이 다운로드되었습니다' })
    } catch {
      addToast({ type: 'error', message: 'SVG 내보내기에 실패했습니다' })
    } finally {
      setIsExporting(false)
    }
  }, [data, addToast])

  const handleExportJson = useCallback(() => {
    if (!data?.data) return
    try {
      exportToJson(data.data, data.data.company.name)
      addToast({ type: 'success', message: 'JSON 데이터가 다운로드되었습니다' })
    } catch {
      addToast({ type: 'error', message: 'JSON 내보내기에 실패했습니다' })
    }
  }, [data, addToast])

  const handlePrint = useCallback(() => {
    fitView({ padding: 0.1 })
    setTimeout(() => printCanvas(), 200)
  }, [fitView])

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (isDirty) handleSaveLayout()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isDirty, handleSaveLayout])

  if (!selectedCompanyId) {
    return (
      <div className="space-y-6" data-testid="nexus-page">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">NEXUS 조직도</h1>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-sm text-slate-500 text-center py-8">사이드바에서 회사를 선택해주세요.</p>
        </div>
      </div>
    )
  }

  if (isLoading || !data) return <NexusSkeleton />

  if (isError) {
    return (
      <div className="space-y-6" data-testid="nexus-page">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">NEXUS 조직도</h1>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-red-500">조직도를 불러올 수 없습니다.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  const org = data.data
  const totalAgents = org.departments.reduce((s, d) => s + d.agents.length, 0) + org.unassignedAgents.length
  const totalEmployees = org.departments.reduce((s, d) => s + (d.employees?.length ?? 0), 0) + (org.unassignedEmployees?.length ?? 0)
  const isEmpty = org.departments.length === 0 && org.unassignedAgents.length === 0

  return (
    <div className="space-y-4" data-testid="nexus-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">NEXUS 조직도</h1>
        <span className="text-xs text-slate-500">
          {org.departments.length}개 부서 · {totalAgents}명 에이전트{totalEmployees > 0 && ` · ${totalEmployees}명 직원`}
          {isDirty && <span className="ml-2 text-amber-400">· 변경사항 있음</span>}
        </span>
      </div>

      {isEmpty ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-slate-500">아직 조직이 구성되지 않았습니다.</p>
            <p className="text-xs text-slate-600">부서와 에이전트를 먼저 추가해주세요.</p>
          </div>
        </div>
      ) : (
        <div ref={reactFlowRef} className="relative bg-slate-900 border border-slate-700 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
          <NexusToolbar
            isEditMode={isEditMode}
            isDirty={isDirty}
            isSaving={saveMutation.isPending}
            isExporting={isExporting}
            onToggleEditMode={handleToggleEditMode}
            onAutoLayout={handleAutoLayout}
            onSaveLayout={handleSaveLayout}
            onFitView={handleFitView}
            onExportPng={handleExportPng}
            onExportSvg={handleExportSvg}
            onExportJson={handleExportJson}
            onPrint={handlePrint}
          />
          {layoutReady && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              nodeTypes={nodeTypes}
              nodesDraggable={true}
              nodesConnectable={isEditMode}
              elementsSelectable={true}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.1}
              maxZoom={2}
            >
              <Controls
                className="!bg-slate-800 !border-slate-700 !rounded-lg [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-700"
              />
              <MiniMap
                nodeColor={miniMapNodeColor}
                maskColor="rgba(15, 23, 42, 0.7)"
                className="!bg-slate-800 !border-slate-700 !rounded-lg"
              />
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
            </ReactFlow>
          )}
        </div>
      )}
    </div>
  )
}

// Wrap with ReactFlowProvider for useReactFlow access
export function NexusPage() {
  return (
    <ReactFlowProvider>
      <NexusCanvas />
    </ReactFlowProvider>
  )
}
