/**
 * NEXUS Admin Page — Natural Organic Theme
 * (Original Stitch HTML used orange #ec5b13, converted to olive-green #5a7247)
 *
 * API Endpoints:
 *   GET   /api/admin/org-chart?companyId=...
 *   GET   /api/admin/nexus/layout
 *   PUT   /api/admin/nexus/layout
 *   PATCH /api/admin/nexus/agent/:id/department
 *   PATCH /api/admin/nexus/agents/department  (batch)
 *   PATCH /api/admin/agents/nx_core_01
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Network, Search, Bell, Settings, LayoutDashboard, GitBranch, Users, Shield, ZoomIn, ZoomOut, Crosshair, X, RefreshCw } from 'lucide-react'
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
import { findDropTarget } from '../lib/nexus-hit-test'
import { useNexusUndo } from '../hooks/use-nexus-undo'
import { CompanyNode } from '../components/nexus/company-node'
import { DepartmentNode } from '../components/nexus/department-node'
import { AgentNode } from '../components/nexus/agent-node'
import { HumanNode } from '../components/nexus/human-node'
import { UnassignedGroupNode } from '../components/nexus/unassigned-group-node'
import { NexusToolbar } from '../components/nexus/nexus-toolbar'
import { exportToPng, exportToSvg, exportToJson, printCanvas } from '../lib/nexus-export'
import { PropertyPanel } from '../components/nexus/property-panel'
import { Skeleton } from '@corthex/ui'

// -- Command Theme color tokens --
const ORGANIC = {
  primary: 'var(--color-corthex-accent)',
  secondary: 'var(--color-corthex-error)',
  accent: 'var(--color-corthex-accent)',
  bg: 'var(--color-corthex-bg)',
  bgDark: 'var(--color-corthex-bg)',
  surface: 'var(--color-corthex-surface)',
  text: 'var(--color-corthex-text-secondary)',
}

const nodeTypes: NodeTypes = {
  company: CompanyNode,
  department: DepartmentNode,
  agent: AgentNode,
  human: HumanNode,
  'unassigned-group': UnassignedGroupNode,
} as unknown as NodeTypes

type SavedLayoutData = {
  nodePositions: Record<string, { x: number; y: number }>
  viewport?: { x: number; y: number; zoom: number }
} | null

function miniMapNodeColor(node: { type?: string }) {
  switch (node.type) {
    case 'company': return '#44403C'
    case 'department': return '#CA8A04'
    case 'agent': return '#10b981'
    case 'human': return '#a855f7'
    case 'unassigned-group': return '#EAB308'
    default: return '#57534E'
  }
}

function NexusSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40 bg-corthex-elevated" />
      <Skeleton className="h-[600px] w-full rounded-xl bg-corthex-surface" />
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

  const [draggingAgentId, setDraggingAgentId] = useState<string | null>(null)
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set())
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const appliedSavedLayout = useRef(false)
  const reactFlowRef = useRef<HTMLDivElement>(null)

  const refetchOrgChart = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['org-chart', selectedCompanyId] })
  }, [queryClient, selectedCompanyId])

  const { pushAction, undo, redo, canUndo, canRedo, undoLabel, redoLabel } = useNexusUndo(refetchOrgChart)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['org-chart', selectedCompanyId],
    queryFn: () => api.get<{ data: OrgChartData }>(`/admin/org-chart?companyId=${encodeURIComponent(selectedCompanyId!)}`),
    enabled: !!selectedCompanyId,
    refetchInterval: 30_000,
  })

  const { data: savedLayout } = useQuery({
    queryKey: ['nexus-layout', selectedCompanyId],
    queryFn: () => api.get<{ data: SavedLayoutData }>('/admin/nexus/layout'),
    enabled: !!selectedCompanyId,
  })

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

  useEffect(() => {
    if (!data?.data) return
    let stale = false
    setLayoutReady(false)

    computeElkLayout(data.data)
      .then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        if (stale) return
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

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes)
      if (!isEditMode) return
      const hasPositionChange = changes.some(
        (c) => c.type === 'position' && 'dragging' in c && !c.dragging,
      )
      if (hasPositionChange) setIsDirty(true)
    },
    [onNodesChange, isEditMode],
  )

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
    if (isEditMode && node.type === 'agent') {
      const agentData = node.data as { isSecretary?: boolean }
      if (agentData.isSecretary) return
      if (_.ctrlKey || _.metaKey) {
        setSelectedAgentIds((prev) => {
          const next = new Set(prev)
          if (next.has(node.id)) next.delete(node.id)
          else next.add(node.id)
          return next
        })
      } else {
        setSelectedAgentIds(new Set())
      }
    }
  }, [isEditMode])

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null)
    setSelectedAgentIds(new Set())
  }, [])

  const handleNodeDragStart: (event: React.MouseEvent, node: Node, nodes: Node[]) => void = useCallback((_event, node) => {
    if (!isEditMode || node.type !== 'agent') { setDraggingAgentId(null); return }
    const agentData = node.data as { isSecretary?: boolean }
    if (agentData.isSecretary) {
      addToast({ type: 'info', message: '비서 에이전트는 이동할 수 없습니다. CEO 직속으로 고정됩니다.' })
      setDraggingAgentId(null)
      return
    }
    setDraggingAgentId(node.id)
    dragStartPosRef.current = { x: node.position.x, y: node.position.y }
  }, [isEditMode, addToast])

  const handleNodeDrag: (event: React.MouseEvent, node: Node, nodes: Node[]) => void = useCallback((_event, node, dragNodes) => {
    if (!draggingAgentId || node.id !== draggingAgentId) return
    const agentData = node.data as { departmentId?: string | null }
    const target = findDropTarget(node.id, node.position, dragNodes, agentData.departmentId ?? null)
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.type === 'department' || n.type === 'unassigned-group') {
          const shouldHighlight = target?.targetNodeId === n.id
          const currentHighlight = (n.data as { isDropTarget?: boolean }).isDropTarget
          if (shouldHighlight !== currentHighlight) {
            return { ...n, data: { ...n.data, isDropTarget: shouldHighlight } }
          }
        }
        return n
      }),
    )
  }, [draggingAgentId, setNodes])

  const handleNodeDragStop: (event: React.MouseEvent, node: Node, nodes: Node[]) => void = useCallback(async (_event, node) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if ((n.type === 'department' || n.type === 'unassigned-group') && (n.data as { isDropTarget?: boolean }).isDropTarget) {
          return { ...n, data: { ...n.data, isDropTarget: false } }
        }
        return n
      }),
    )
    if (!draggingAgentId || node.id !== draggingAgentId) { setDraggingAgentId(null); return }
    const agentData = node.data as { agentId?: string; departmentId?: string | null; name?: string }
    const target = findDropTarget(node.id, node.position, nodes, agentData.departmentId ?? null)
    setDraggingAgentId(null)
    if (!target) {
      if (dragStartPosRef.current) {
        setNodes((prevNodes) => prevNodes.map((n) => n.id === node.id ? { ...n, position: dragStartPosRef.current! } : n))
      }
      dragStartPosRef.current = null
      return
    }
    dragStartPosRef.current = null
    const isMultiSelect = selectedAgentIds.has(node.id) && selectedAgentIds.size > 1
    const agentIdsToMove = isMultiSelect ? [...selectedAgentIds] : [node.id]
    try {
      if (isMultiSelect) {
        const agentsForUndo = agentIdsToMove.map((nid) => {
          const agentNode = nodes.find((n) => n.id === nid)
          const ad = agentNode?.data as { agentId?: string; departmentId?: string | null; name?: string } | undefined
          return { agentId: ad?.agentId ?? nid.replace('agent-', ''), agentName: ad?.name ?? '', fromDeptId: ad?.departmentId ?? null }
        })
        await api.patch('/admin/nexus/agents/department', { agentIds: agentsForUndo.map((a) => a.agentId), departmentId: target.departmentId })
        pushAction({ type: 'batch-move', agents: agentsForUndo, toDeptId: target.departmentId, toDeptName: target.deptName })
        addToast({ type: 'success', message: `${agentsForUndo.length}개 에이전트가 ${target.deptName}(으)로 이동되었습니다` })
        setSelectedAgentIds(new Set())
      } else {
        const realAgentId = agentData.agentId ?? node.id.replace('agent-', '')
        await api.patch(`/admin/nexus/agent/${realAgentId}/department`, { departmentId: target.departmentId })
        const fromDeptNode = agentData.departmentId ? nodes.find((n) => n.id === `dept-${agentData.departmentId}`) : null
        const fromDeptName = fromDeptNode ? (fromDeptNode.data as { name?: string }).name ?? '부서' : '미배속'
        pushAction({ type: 'move-agent', agentId: realAgentId, agentName: agentData.name ?? '', fromDeptId: agentData.departmentId ?? null, toDeptId: target.departmentId, fromDeptName, toDeptName: target.deptName })
        addToast({ type: 'success', message: `${agentData.name}이(가) ${target.deptName}(으)로 이동되었습니다` })
      }
      refetchOrgChart()
    } catch {
      addToast({ type: 'error', message: '에이전트 이동에 실패했습니다' })
      if (dragStartPosRef.current) {
        setNodes((prevNodes) => prevNodes.map((n) => n.id === node.id ? { ...n, position: dragStartPosRef.current! } : n))
        dragStartPosRef.current = null
      }
    }
  }, [draggingAgentId, nodes, selectedAgentIds, setNodes, pushAction, addToast, refetchOrgChart])

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => {
      const next = !prev
      if (next) addToast({ type: 'info', message: '편집 모드입니다. 에이전트를 부서로 드래그하여 이동하세요.' })
      else setSelectedAgentIds(new Set())
      return next
    })
  }, [addToast])

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

  const handleSaveLayout = useCallback(() => {
    const positions: Record<string, { x: number; y: number }> = {}
    for (const node of nodes) positions[node.id] = { x: node.position.x, y: node.position.y }
    saveMutation.mutate({ nodePositions: positions })
  }, [nodes, saveMutation])

  const handleFitView = useCallback(() => { fitView({ padding: 0.2 }) }, [fitView])

  const handleUndo = useCallback(async () => {
    const action = await undo()
    if (action) {
      const label = action.type === 'move-agent' ? `${action.agentName} 이동이 취소되었습니다` : '일괄 이동이 취소되었습니다'
      addToast({ type: 'info', message: label })
    }
  }, [undo, addToast])

  const handleRedo = useCallback(async () => {
    const action = await redo()
    if (action) {
      const label = action.type === 'move-agent' ? `${action.agentName} 이동이 다시 실행되었습니다` : '일괄 이동이 다시 실행되었습니다'
      addToast({ type: 'info', message: label })
    }
  }, [redo, addToast])

  const handleExportPng = useCallback(async () => {
    const el = reactFlowRef.current
    if (!el || !data?.data) return
    setIsExporting(true)
    try { await exportToPng(el, data.data.company.name); addToast({ type: 'success', message: 'PNG 이미지가 다운로드되었습니다' }) }
    catch { addToast({ type: 'error', message: 'PNG 내보내기에 실패했습니다' }) }
    finally { setIsExporting(false) }
  }, [data, addToast])

  const handleExportSvg = useCallback(async () => {
    const el = reactFlowRef.current
    if (!el || !data?.data) return
    setIsExporting(true)
    try { await exportToSvg(el, data.data.company.name); addToast({ type: 'success', message: 'SVG 파일이 다운로드되었습니다' }) }
    catch { addToast({ type: 'error', message: 'SVG 내보내기에 실패했습니다' }) }
    finally { setIsExporting(false) }
  }, [data, addToast])

  const handleExportJson = useCallback(() => {
    if (!data?.data) return
    try { exportToJson(data.data, data.data.company.name); addToast({ type: 'success', message: 'JSON 데이터가 다운로드되었습니다' }) }
    catch { addToast({ type: 'error', message: 'JSON 내보내기에 실패했습니다' }) }
  }, [data, addToast])

  const handlePrint = useCallback(() => {
    fitView({ padding: 0.1 })
    setTimeout(() => printCanvas(), 200)
  }, [fitView])

  useEffect(() => {
    if (layoutReady) {
      const t = setTimeout(() => fitView({ padding: 0.2 }), 100)
      return () => clearTimeout(t)
    }
  }, [selectedNodeId, layoutReady, fitView])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (isDirty) handleSaveLayout() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); if (isEditMode) handleUndo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); if (isEditMode) handleRedo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); if (isEditMode) handleRedo() }
      if (e.key === 'Escape') { setSelectedAgentIds(new Set()); setSelectedNodeId(null) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isDirty, handleSaveLayout, isEditMode, handleUndo, handleRedo])

  if (!selectedCompanyId) {
    return (
      <div className="space-y-6" data-testid="nexus-page">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: ORGANIC.text, fontFamily: "'Noto Serif KR', serif" }}>NEXUS 조직도</h1>
        <div className="bg-corthex-surface border border-corthex-border rounded-xl">
          <p className="text-sm text-corthex-text-secondary text-center py-8">사이드바에서 회사를 선택해주세요.</p>
        </div>
      </div>
    )
  }

  if (isLoading || !data) return <NexusSkeleton />

  if (isError) {
    return (
      <div className="space-y-6" data-testid="nexus-page">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: ORGANIC.text, fontFamily: "'Noto Serif KR', serif" }}>NEXUS 조직도</h1>
        <div className="bg-corthex-surface border border-corthex-border rounded-xl">
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-red-500">조직도를 불러올 수 없습니다.</p>
            <button onClick={() => refetch()} className="px-4 py-2 text-sm rounded-lg text-white transition-colors" style={{ backgroundColor: ORGANIC.primary }}>
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
    <div className="flex h-screen w-full flex-col" style={{ fontFamily: "'Public Sans', sans-serif", color: ORGANIC.text }}>
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-corthex-border px-6 py-3 z-50" style={{ backgroundColor: ORGANIC.bg }}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg text-white" style={{ backgroundColor: ORGANIC.primary }}>
              <Network className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              CORTHEX <span style={{ color: ORGANIC.primary }}>v2</span>
            </h2>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-sm font-medium hover:opacity-80 transition-colors" href="#">Nexus</a>
            <a className="text-sm font-medium border-b-2 pb-1" href="#" style={{ color: ORGANIC.primary, borderColor: ORGANIC.primary }}>Agents</a>
            <a className="text-sm font-medium hover:opacity-80 transition-colors" href="#">Nodes</a>
            <a className="text-sm font-medium hover:opacity-80 transition-colors" href="#">Logs</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" />
            <input
              className="border-none rounded-xl pl-10 pr-4 py-2 text-sm w-64 bg-corthex-elevated"
              placeholder="Search infrastructure..."
              type="text"
            />
          </div>
          <button className="p-2 rounded-xl transition-colors bg-corthex-elevated hover:bg-corthex-border">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-xl transition-colors bg-corthex-elevated hover:bg-corthex-border">
            <Settings className="w-5 h-5" />
          </button>
          <div className="h-8 w-8 rounded-full border-2 overflow-hidden bg-corthex-accent-muted border-corthex-accent"></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Navigation */}
        <aside className="w-20 lg:w-64 border-r border-corthex-border flex flex-col p-4 gap-2" style={{ backgroundColor: ORGANIC.bg }}>
          <div className="mb-4 px-2 hidden lg:block">
            <h3 className="text-xs font-bold uppercase tracking-widest text-corthex-text-disabled">Management</h3>
          </div>
          <button className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-corthex-elevated">
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden lg:block text-sm font-medium">Dashboard</span>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl text-corthex-text-on-accent shadow-lg bg-corthex-accent">
            <GitBranch className="w-5 h-5" />
            <span className="hidden lg:block text-sm font-medium">Nexus Canvas</span>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl transition-colors">
            <Users className="w-5 h-5" />
            <span className="hidden lg:block text-sm font-medium">Directory</span>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl transition-colors">
            <Shield className="w-5 h-5" />
            <span className="hidden lg:block text-sm font-medium">Permissions</span>
          </button>
        </aside>

        {/* Main Content: Canvas Area */}
        <main
          className="flex-1 relative overflow-hidden bg-corthex-bg"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(202,138,4,0.15) 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        >
          {isEmpty ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="text-sm text-corthex-text-secondary">아직 조직이 구성되지 않았습니다.</p>
                <p className="text-xs text-corthex-text-disabled">부서와 에이전트를 먼저 추가해주세요.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 pointer-events-none z-10"></div>

              <div ref={reactFlowRef} className="absolute inset-0 z-20">
                <NexusToolbar
                  isEditMode={isEditMode}
                  isDirty={isDirty}
                  isSaving={saveMutation.isPending}
                  isExporting={isExporting}
                  selectedCount={selectedAgentIds.size}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  undoLabel={undoLabel}
                  redoLabel={redoLabel}
                  onToggleEditMode={handleToggleEditMode}
                  onAutoLayout={handleAutoLayout}
                  onSaveLayout={handleSaveLayout}
                  onFitView={handleFitView}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
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
                    onNodeDragStart={handleNodeDragStart}
                    onNodeDrag={handleNodeDrag}
                    onNodeDragStop={handleNodeDragStop}
                    nodeTypes={nodeTypes}
                    nodesDraggable={true}
                    nodesConnectable={isEditMode}
                    elementsSelectable={true}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.1}
                    maxZoom={2}
                  >
                    <Controls />
                    <MiniMap nodeColor={miniMapNodeColor} maskColor="rgba(250,248,245,0.7)" />
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={ORGANIC.primary + '33'} />
                  </ReactFlow>
                )}
              </div>

              {/* Floating Canvas Controls */}
              <div className="absolute bottom-6 left-6 z-30 flex gap-2">
                <button className="bg-corthex-surface p-2 rounded-lg shadow-md border border-corthex-border">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button className="bg-corthex-surface p-2 rounded-lg shadow-md border border-corthex-border">
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button className="bg-corthex-surface p-2 rounded-lg shadow-md border border-corthex-border">
                  <Crosshair className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </main>

        {/* Property Panel (Right Side) */}
        {selectedNodeId && data?.data && (
          <aside
            className="fixed inset-0 z-40 sm:static sm:inset-auto sm:z-30 w-full sm:w-[420px] border-l border-corthex-border shadow-2xl flex flex-col h-full"
            style={{ backgroundColor: ORGANIC.bg }}
          >
            <div className="p-6 border-b border-corthex-border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>Agent Property Panel</h2>
                <button className="text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors" onClick={() => setSelectedNodeId(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-corthex-text-secondary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: ORGANIC.primary }}></span>
                Editing: <span className="font-mono font-bold" style={{ color: ORGANIC.primary }}>
                  {selectedNodeId}
                </span>
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PropertyPanel
                selectedNodeId={selectedNodeId}
                orgData={data.data}
                onClose={() => setSelectedNodeId(null)}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
              />
            </div>
            {/* Footer Action */}
            <div className="p-6 border-t border-corthex-border bg-corthex-elevated">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-corthex-text-secondary">Last sync: 2 mins ago</span>
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30"></span>
                </div>
              </div>
              <button
                onClick={handleSaveLayout}
                disabled={!isDirty || saveMutation.isPending}
                className="w-full bg-corthex-accent text-corthex-text-on-accent font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50 hover:bg-corthex-accent-hover"
              >
                <RefreshCw className="w-5 h-5" />
                {saveMutation.isPending ? 'Syncing...' : 'Sync to Live Environment'}
              </button>
              <p className="text-center mt-3 text-[10px] text-corthex-text-disabled font-mono">PATCH /api/admin/agents/{selectedNodeId}</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

export function NexusPage() {
  return (
    <ReactFlowProvider>
      <NexusCanvas />
    </ReactFlowProvider>
  )
}
