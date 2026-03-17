import { useCallback, useState, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { toast, ConfirmDialog } from '@corthex/ui'
import { ExecutionHistoryPanel } from './ExecutionHistoryPanel'
import type { NexusWorkflow } from '@corthex/shared'

type Props = {
  workflowId: string
  onBack: () => void
}

let nodeIdCounter = 0

export function WorkflowEditor({ workflowId, onBack }: Props) {
  const queryClient = useQueryClient()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const initialLoadRef = useRef(false)
  const loadedRef = useRef(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  const { data: workflowsRes } = useQuery({
    queryKey: ['nexus-workflows'],
    queryFn: () => api.get<{ data: NexusWorkflow[] }>('/workspace/nexus/workflows'),
  })

  const workflow = workflowsRes?.data?.find((w) => w.id === workflowId)

  // Load workflow nodes/edges
  useEffect(() => {
    if (!workflow || initialLoadRef.current) return
    initialLoadRef.current = true

    const wfNodes = workflow.nodes as Array<{ id: string; type?: string; position?: { x: number; y: number }; data?: Record<string, unknown> }>
    const wfEdges = workflow.edges as Array<{ id: string; source: string; target: string; type?: string }>

    if (wfNodes.length > 0) {
      setNodes(wfNodes.map((n) => ({
        id: n.id,
        type: n.type || 'default',
        position: n.position || { x: 0, y: 0 },
        data: n.data || { label: n.id },
      })))
    }
    if (wfEdges.length > 0) {
      setEdges(wfEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type || 'default',
      })))
    }

    // Mark loaded after next render so dirty tracking skips the initial set
    requestAnimationFrame(() => { loadedRef.current = true })
  }, [workflow, setNodes, setEdges])

  // Track dirty state (skip initial load)
  useEffect(() => {
    if (!loadedRef.current) return
    setIsDirty(true)
  }, [nodes, edges])

  // Close more menu on outside click or Escape
  useEffect(() => {
    if (!showMoreMenu) return
    const handleClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as HTMLElement)) {
        setShowMoreMenu(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMoreMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showMoreMenu])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, id: `e-${Date.now()}` }, eds))
    },
    [setEdges],
  )

  const handleAddNode = useCallback(() => {
    const label = prompt('노드 이름을 입력하세요')
    if (!label) return
    nodeIdCounter++
    const id = `node-${Date.now()}-${nodeIdCounter}`
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'default',
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: { label },
      },
    ])
    setShowMoreMenu(false)
  }, [setNodes])

  const saveMutation = useMutation({
    mutationFn: () => {
      const serializedNodes = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      }))
      const serializedEdges = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
      }))
      return api.put(`/workspace/nexus/workflows/${workflowId}`, {
        nodes: serializedNodes,
        edges: serializedEdges,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nexus-workflows'] })
      toast.success('워크플로우가 저장되었습니다')
      setIsDirty(false)
    },
    onError: () => toast.error('저장에 실패했습니다'),
  })

  const executeMutation = useMutation({
    mutationFn: () => api.post(`/workspace/nexus/workflows/${workflowId}/execute`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nexus-executions', workflowId] })
      toast.success('워크플로우 실행 완료')
    },
    onError: () => toast.error('실행에 실패했습니다'),
  })

  const templateMutation = useMutation({
    mutationFn: (isTemplate: boolean) =>
      api.put(`/workspace/nexus/workflows/${workflowId}`, { isTemplate }),
    onSuccess: (_res, isTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['nexus-workflows'] })
      toast.success(isTemplate ? '템플릿으로 공유되었습니다' : '템플릿 공유가 해제되었습니다')
    },
    onError: () => toast.error('변경에 실패했습니다'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/workspace/nexus/workflows/${workflowId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nexus-workflows'] })
      toast.success('워크플로우가 삭제되었습니다')
      onBack()
    },
    onError: () => toast.error('삭제에 실패했습니다'),
  })

  const handleBack = () => {
    if (isDirty) {
      setShowBackConfirm(true)
    } else {
      onBack()
    }
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 툴바 */}
      <div className="px-3 sm:px-4 py-2 border-b border-zinc-700 flex items-center gap-1.5 sm:gap-2">
        <button onClick={handleBack} className="text-sm text-zinc-400 hover:text-zinc-200 shrink-0">
          ← 목록
        </button>
        <span className="text-zinc-600 hidden sm:inline">|</span>
        <span className="text-sm font-semibold truncate max-w-[120px] sm:max-w-none">{workflow.name}</span>
        {isDirty && (
          <span className="text-xs text-amber-400 hidden sm:inline">● 저장되지 않은 변경</span>
        )}
        <div className="flex-1" />

        {/* 핵심 버튼 — 항상 표시 */}
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50 transition-colors"
        >
          {saveMutation.isPending ? '저장 중...' : '저장'}
        </button>
        <button
          onClick={() => executeMutation.mutate()}
          disabled={executeMutation.isPending}
          className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded disabled:opacity-50 transition-colors"
        >
          {executeMutation.isPending ? '실행 중...' : '실행'}
        </button>

        {/* 보조 버튼 — 데스크톱: 인라인, 모바일: 더보기 드롭다운 */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={handleAddNode}
            className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
          >
            + 노드
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-2 py-1 text-xs rounded transition-colors ${showHistory ? 'bg-zinc-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600'}`}
          >
            실행 기록
          </button>
          <button
            onClick={() => templateMutation.mutate(!workflow.isTemplate)}
            disabled={templateMutation.isPending}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              workflow.isTemplate
                ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            {workflow.isTemplate ? '공유 해제' : '템플릿으로 공유'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
          >
            삭제
          </button>
        </div>

        {/* 모바일 더보기 메뉴 */}
        <div className="relative md:hidden" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
          >
            ···
          </button>
          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 py-1">
              <button
                onClick={handleAddNode}
                className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-700 transition-colors"
              >
                + 노드 추가
              </button>
              <button
                onClick={() => { setShowHistory(!showHistory); setShowMoreMenu(false) }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-700 transition-colors"
              >
                {showHistory ? '실행 기록 닫기' : '실행 기록'}
              </button>
              <button
                onClick={() => { templateMutation.mutate(!workflow.isTemplate); setShowMoreMenu(false) }}
                disabled={templateMutation.isPending}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-zinc-700 transition-colors ${
                  workflow.isTemplate ? 'text-purple-400' : ''
                }`}
              >
                {workflow.isTemplate ? '공유 해제' : '템플릿으로 공유'}
              </button>
              <hr className="border-zinc-700 my-1" />
              <button
                onClick={() => { setShowDeleteConfirm(true); setShowMoreMenu(false) }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-zinc-700 transition-colors"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 캔버스 */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2}
          nodesDraggable
          nodesConnectable
          deleteKeyCode={['Backspace', 'Delete']}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#3f3f46" />
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            style={{ width: 150, height: 100 }}
            className="!bg-zinc-100 hidden md:block"
          />
        </ReactFlow>
      </div>

      {/* 실행 기록 패널 */}
      {showHistory && <ExecutionHistoryPanel workflowId={workflowId} />}

      {/* 삭제 확인 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        title="워크플로우 삭제"
        description={`"${workflow.name}" 워크플로우와 모든 실행 기록이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        onConfirm={() => deleteMutation.mutate()}
        variant="danger"
      />

      {/* 뒤로가기 확인 */}
      <ConfirmDialog
        isOpen={showBackConfirm}
        onCancel={() => setShowBackConfirm(false)}
        title="저장되지 않은 변경"
        description="저장하지 않은 변경사항이 있습니다. 목록으로 돌아가시겠습니까?"
        confirmText="돌아가기"
        onConfirm={onBack}
      />
    </div>
  )
}
