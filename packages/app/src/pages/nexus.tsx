import { useCallback, useState, useEffect, useRef, useMemo } from 'react'
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
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { ChatArea } from '../components/chat/chat-area'
import { canvasToText } from '../lib/canvas-to-mermaid'
import { sketchVibeNodeTypes, NODE_PALETTE, type SvNodeType } from '../components/nexus/sketchvibe-nodes'
import { sketchVibeEdgeTypes } from '../components/nexus/editable-edge'
import { ContextMenu } from '../components/nexus/context-menu'
import { CanvasSidebar } from '../components/nexus/canvas-sidebar'
import type { Agent, Session } from '../components/chat/types'

let nodeCounter = 0

const DEFAULT_LABELS: Record<SvNodeType, string> = {
  start: '시작',
  end: '종료',
  agent: '에이전트',
  system: '시스템',
  api: '외부 API',
  decide: '결정',
  db: '데이터베이스',
  note: '메모',
}

interface SketchDetail {
  id: string
  name: string
  graphData: { nodes: Node[]; edges: Edge[] }
  createdAt: string
  updatedAt: string
}

function NexusPageInner() {
  const queryClient = useQueryClient()
  const reactFlowInstance = useReactFlow()

  // Canvas state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Sketch persistence state
  const [currentSketchId, setCurrentSketchId] = useState<string | null>(null)
  const [currentSketchName, setCurrentSketchName] = useState('')
  const [dirty, setDirty] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveNameInput, setSaveNameInput] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)

  // Chat state
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(true)
  const [showToolbar, setShowToolbar] = useState(false)

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    target: 'node' | 'pane'
    nodeId?: string
  } | null>(null)

  // Mobile: canvas or chat view
  const [mobileView, setMobileView] = useState<'canvas' | 'chat'>('canvas')

  // Agents & sessions
  const { data: agentsRes } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: sessionsRes } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get<{ data: Session[] }>('/workspace/chat/sessions'),
  })

  const agents = agentsRes?.data || []
  const sessions = sessionsRes?.data || []

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId) || null,
    [agents, selectedAgentId],
  )

  // Create session mutation
  const createSession = useMutation({
    mutationFn: (agentId: string) =>
      api.post<{ data: Session }>('/workspace/chat/sessions', { agentId }),
    onSuccess: (res) => {
      setSelectedSessionId(res.data.id)
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  // Sketch save/update mutations
  const saveSketch = useMutation({
    mutationFn: (data: { name: string; graphData: { nodes: Node[]; edges: Edge[] } }) =>
      api.post<{ data: SketchDetail }>('/workspace/sketches', data),
    onSuccess: (res) => {
      setCurrentSketchId(res.data.id)
      setCurrentSketchName(res.data.name)
      setDirty(false)
      setShowSaveDialog(false)
      queryClient.invalidateQueries({ queryKey: ['sketches'] })
    },
  })

  const updateSketch = useMutation({
    mutationFn: (data: { id: string; graphData: { nodes: Node[]; edges: Edge[] }; name?: string }) =>
      api.put<{ data: SketchDetail }>(`/workspace/sketches/${data.id}`, {
        graphData: data.graphData,
        ...(data.name ? { name: data.name } : {}),
      }),
    onSuccess: () => {
      setDirty(false)
      queryClient.invalidateQueries({ queryKey: ['sketches'] })
    },
  })

  // Agent selection -> find or create session
  const handleAgentSelect = useCallback(
    (agentId: string) => {
      setSelectedAgentId(agentId)
      const existing = sessions.find((s) => s.agentId === agentId)
      if (existing) {
        setSelectedSessionId(existing.id)
      } else {
        createSession.mutate(agentId)
      }
    },
    [sessions, createSession],
  )

  // Auto-select first agent if none selected
  useEffect(() => {
    if (!selectedAgentId && agents.length > 0) {
      handleAgentSelect(agents[0].id)
    }
  }, [agents, selectedAgentId, handleAgentSelect])

  // Canvas context for AI (serialized as text)
  const canvasContext = useMemo(() => canvasToText(nodes, edges), [nodes, edges])

  // Node label change handler (for double-click editing)
  const handleLabelChange = useCallback(
    (nodeId: string, label: string) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, label } } : n)),
      )
      setDirty(true)
    },
    [setNodes],
  )

  // Edge label change handler
  const handleEdgeLabelChange = useCallback(
    (edgeId: string, label: string) => {
      setEdges((eds) =>
        eds.map((e) => (e.id === edgeId ? { ...e, data: { ...e.data, label } } : e)),
      )
      setDirty(true)
    },
    [setEdges],
  )

  // Connect nodes with editable edge type
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `e-${Date.now()}`,
            type: 'editable',
            data: { label: '', onEdgeLabelChange: handleEdgeLabelChange },
          },
          eds,
        ),
      )
      setDirty(true)
    },
    [setEdges, handleEdgeLabelChange],
  )

  // Add node (from palette or context menu)
  const handleAddNode = useCallback(
    (type: SvNodeType, position?: { x: number; y: number }) => {
      nodeCounter++
      const id = `sv-${type}-${Date.now()}-${nodeCounter}`

      // If position is screen coords from context menu, convert to flow coords
      let flowPosition = position
      if (position && reactFlowInstance) {
        flowPosition = reactFlowInstance.screenToFlowPosition({ x: position.x, y: position.y })
      }

      const newNode: Node = {
        id,
        type,
        position: flowPosition || {
          x: 100 + Math.random() * 300,
          y: 100 + Math.random() * 300,
        },
        data: { label: DEFAULT_LABELS[type], onLabelChange: handleLabelChange },
      }
      setNodes((nds) => [...nds, newNode])
      setShowToolbar(false)
      setDirty(true)
    },
    [setNodes, handleLabelChange, reactFlowInstance],
  )

  // Inject onLabelChange into all nodes and onEdgeLabelChange into all edges
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if ((n.data as { onLabelChange?: unknown }).onLabelChange !== handleLabelChange) {
          return { ...n, data: { ...n.data, onLabelChange: handleLabelChange } }
        }
        return n
      }),
    )
  }, [handleLabelChange, setNodes])

  useEffect(() => {
    setEdges((eds) =>
      eds.map((e) => {
        if ((e.data as { onEdgeLabelChange?: unknown } | undefined)?.onEdgeLabelChange !== handleEdgeLabelChange) {
          return { ...e, data: { ...e.data, onEdgeLabelChange: handleEdgeLabelChange } }
        }
        return e
      }),
    )
  }, [handleEdgeLabelChange, setEdges])

  // Track dirty state on node/edge changes
  const nodesChangeRef = useRef(onNodesChange)
  nodesChangeRef.current = onNodesChange
  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      nodesChangeRef.current(changes)
      if (changes.some((c) => c.type === 'position' || c.type === 'remove')) {
        setDirty(true)
      }
    },
    [],
  )

  const edgesChangeRef = useRef(onEdgesChange)
  edgesChangeRef.current = onEdgesChange
  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      edgesChangeRef.current(changes)
      if (changes.some((c) => c.type === 'remove')) {
        setDirty(true)
      }
    },
    [],
  )

  // Clear canvas
  const handleClear = useCallback(() => {
    if (nodes.length === 0) return
    if (!confirm('캔버스를 초기화하시겠어요?')) return
    setNodes([])
    setEdges([])
    setCurrentSketchId(null)
    setCurrentSketchName('')
    setDirty(false)
  }, [nodes.length, setNodes, setEdges])

  // Auto-layout
  const handleAutoLayout = useCallback(async () => {
    const { getAutoLayout } = await import('../lib/dagre-layout')
    setNodes((nds) => {
      const laid = getAutoLayout(nds as Node[], edges)
      return laid
    })
    setDirty(true)
    setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 100)
  }, [edges, setNodes, reactFlowInstance])

  // Strip callback functions from graph data for serialization
  const getCleanGraphData = useCallback(() => {
    const cleanNodes = nodes.map(({ data, ...rest }) => {
      const { onLabelChange: _, ...cleanData } = data as Record<string, unknown>
      return { ...rest, data: cleanData }
    })
    const cleanEdges = edges.map(({ data, ...rest }) => {
      if (!data) return rest
      const { onEdgeLabelChange: _, ...cleanData } = data as Record<string, unknown>
      return { ...rest, data: cleanData }
    })
    return { nodes: cleanNodes as Node[], edges: cleanEdges as Edge[] }
  }, [nodes, edges])

  // Save handler
  const handleSave = useCallback(() => {
    if (currentSketchId) {
      updateSketch.mutate({ id: currentSketchId, graphData: getCleanGraphData() })
    } else {
      setSaveNameInput('')
      setShowSaveDialog(true)
    }
  }, [currentSketchId, updateSketch, getCleanGraphData])

  // Save as new
  const handleSaveNew = useCallback(() => {
    if (!saveNameInput.trim()) return
    saveSketch.mutate({
      name: saveNameInput.trim(),
      graphData: getCleanGraphData(),
    })
  }, [saveNameInput, saveSketch, getCleanGraphData])

  // Load sketch
  const handleLoadSketch = useCallback(
    async (id: string) => {
      try {
        const res = await api.get<{ data: SketchDetail }>(`/workspace/sketches/${id}`)
        const sketch = res.data
        const graphData = sketch.graphData || { nodes: [], edges: [] }

        // Restore nodes with label change handler
        const restoredNodes = (graphData.nodes || []).map((n: Node) => ({
          ...n,
          data: { ...n.data, onLabelChange: handleLabelChange },
        }))

        // Restore edges with editable type and label change handler
        const restoredEdges = (graphData.edges || []).map((e: Edge) => ({
          ...e,
          type: e.type || 'editable',
          data: { ...e.data, onEdgeLabelChange: handleEdgeLabelChange },
        }))

        setNodes(restoredNodes)
        setEdges(restoredEdges)
        setCurrentSketchId(sketch.id)
        setCurrentSketchName(sketch.name)
        setDirty(false)
        setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 100)
      } catch {
        // Error handled by API client
      }
    },
    [setNodes, setEdges, handleLabelChange, handleEdgeLabelChange, reactFlowInstance],
  )

  // New canvas
  const handleNewCanvas = useCallback(() => {
    if (dirty && !confirm('저장하지 않은 변경 사항이 있어요. 새 캔버스를 시작할까요?')) return
    setNodes([])
    setEdges([])
    setCurrentSketchId(null)
    setCurrentSketchName('')
    setDirty(false)
  }, [dirty, setNodes, setEdges])

  // Context menu handler
  const handleContextMenu = useCallback(
    (event: React.MouseEvent, nodeId?: string) => {
      event.preventDefault()
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        target: nodeId ? 'node' : 'pane',
        nodeId,
      })
    },
    [],
  )

  // Context menu action handler
  const handleContextAction = useCallback(
    (action: { type: string; nodeId?: string; nodeType?: SvNodeType; position?: { x: number; y: number } }) => {
      setContextMenu(null)
      switch (action.type) {
        case 'edit-label': {
          // Trigger edit by simulating double-click behavior
          // Find the node and programmatically start editing
          if (action.nodeId) {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === action.nodeId ? { ...n, selected: true } : { ...n, selected: false },
              ),
            )
          }
          break
        }
        case 'duplicate': {
          if (action.nodeId) {
            const sourceNode = nodes.find((n) => n.id === action.nodeId)
            if (sourceNode) {
              nodeCounter++
              const id = `sv-${sourceNode.type}-${Date.now()}-${nodeCounter}`
              const newNode: Node = {
                id,
                type: sourceNode.type,
                position: {
                  x: sourceNode.position.x + 30,
                  y: sourceNode.position.y + 30,
                },
                data: {
                  ...(sourceNode.data as Record<string, unknown>),
                  label: `${(sourceNode.data as { label?: string })?.label || ''} (복사)`,
                  onLabelChange: handleLabelChange,
                },
              }
              setNodes((nds) => [...nds, newNode])
              setDirty(true)
            }
          }
          break
        }
        case 'delete': {
          if (action.nodeId) {
            setNodes((nds) => nds.filter((n) => n.id !== action.nodeId))
            setEdges((eds) =>
              eds.filter((e) => e.source !== action.nodeId && e.target !== action.nodeId),
            )
            setDirty(true)
          }
          break
        }
        case 'add-node': {
          if (action.nodeType && action.position) {
            handleAddNode(action.nodeType, action.position)
          }
          break
        }
      }
    },
    [nodes, setNodes, setEdges, handleLabelChange, handleAddNode],
  )

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
        <h2 className="text-base font-semibold shrink-0">SketchVibe</h2>

        {currentSketchName && (
          <span className="text-xs text-zinc-400 truncate max-w-[120px]">
            — {currentSketchName}{dirty ? ' *' : ''}
          </span>
        )}

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={nodes.length === 0}
          className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded transition-colors"
        >
          저장
        </button>

        {/* 캔버스 목록 토글 */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            showSidebar ? 'bg-indigo-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
          }`}
        >
          목록
        </button>

        {/* 에이전트 선택 */}
        <select
          value={selectedAgentId || ''}
          onChange={(e) => handleAgentSelect(e.target.value)}
          className="text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 max-w-[140px]"
        >
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        {/* 모바일 뷰 토글 */}
        <div className="flex md:hidden gap-1">
          <button
            onClick={() => setMobileView('canvas')}
            className={`px-2 py-1 text-xs rounded ${
              mobileView === 'canvas' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
            }`}
          >
            캔버스
          </button>
          <button
            onClick={() => setMobileView('chat')}
            className={`px-2 py-1 text-xs rounded ${
              mobileView === 'chat' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
            }`}
          >
            채팅
          </button>
        </div>

        {/* 데스크톱 채팅 토글 */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="hidden md:block px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
        >
          {chatOpen ? '채팅 닫기' : '채팅 열기'}
        </button>
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 캔버스 목록 사이드바 */}
        {showSidebar && (
          <div className="w-52 border-r border-zinc-800 shrink-0 hidden md:block">
            <CanvasSidebar
              currentSketchId={currentSketchId}
              onLoad={handleLoadSketch}
              onNew={handleNewCanvas}
            />
          </div>
        )}

        {/* 캔버스 */}
        <div
          className={`flex-1 flex flex-col relative ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* 캔버스 도구 모음 */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {/* 노드 추가 버튼 */}
            <div className="relative">
              <button
                onClick={() => setShowToolbar(!showToolbar)}
                className="px-3 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transition-colors"
              >
                + 노드
              </button>

              {/* 팔레트 드롭다운 */}
              {showToolbar && (
                <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-2 w-44 z-50">
                  {NODE_PALETTE.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleAddNode(item.type)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-zinc-800 rounded transition-colors"
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center text-white text-[10px] ${item.color}`}
                      >
                        {item.icon}
                      </span>
                      <span className="text-zinc-200">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 자동 정렬 */}
            <button
              onClick={handleAutoLayout}
              className="px-3 py-2 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg shadow transition-colors"
              title="자동 정렬"
            >
              ⟳ 정렬
            </button>

            {/* 초기화 */}
            <button
              onClick={handleClear}
              className="px-3 py-2 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg shadow transition-colors"
              title="초기화"
            >
              ✕ 초기화
            </button>
          </div>

          {/* 캔버스 안내 (비어있을 때) */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center text-zinc-500">
                <p className="text-lg mb-2">여기에 그림을 그려보세요</p>
                <p className="text-sm">왼쪽 위 "+ 노드" 버튼으로 노드를 추가하고,</p>
                <p className="text-sm">드래그해서 연결하세요.</p>
                <p className="text-sm mt-2">오른쪽 채팅에서 AI와 함께 토론할 수 있어요.</p>
              </div>
            </div>
          )}

          {/* ReactFlow 캔버스 */}
          <div className="flex-1">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={onConnect}
              nodeTypes={sketchVibeNodeTypes}
              edgeTypes={sketchVibeEdgeTypes}
              defaultEdgeOptions={{ type: 'editable' }}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={0.1}
              maxZoom={3}
              nodesDraggable
              nodesConnectable
              deleteKeyCode={['Backspace', 'Delete']}
              panOnScroll
              zoomOnPinch
              proOptions={{ hideAttribution: true }}
              onPaneClick={() => {
                setShowToolbar(false)
                setContextMenu(null)
              }}
              onNodeContextMenu={(event, node) => handleContextMenu(event, node.id)}
              onPaneContextMenu={(event) => handleContextMenu(event as unknown as React.MouseEvent)}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#3f3f46" />
              <Controls />
              <MiniMap
                nodeStrokeWidth={3}
                style={{ width: 120, height: 80 }}
                className="!bg-zinc-100 dark:!bg-zinc-800 hidden md:block"
              />
            </ReactFlow>
          </div>

          {/* 하단 상태바 */}
          <div className="px-3 py-1 border-t border-zinc-800 bg-zinc-900/80 flex items-center gap-3 text-[10px] text-zinc-500">
            <span>노드 {nodes.length}개</span>
            <span>연결 {edges.length}개</span>
            {dirty && <span className="text-amber-500">미저장</span>}
            <span className="hidden sm:inline">| 더블클릭: 이름 편집 | Delete: 삭제 | 핸들 드래그: 연결 | 우클릭: 메뉴</span>
          </div>
        </div>

        {/* 채팅 패널 */}
        {(chatOpen || mobileView === 'chat') && (
          <div
            className={`border-l border-zinc-200 dark:border-zinc-800 flex flex-col ${
              mobileView === 'canvas' ? 'hidden md:flex' : 'flex'
            } w-full md:w-[380px] lg:w-[420px] shrink-0`}
          >
            <ChatArea
              agent={selectedAgent}
              sessionId={selectedSessionId}
              canvasContext={canvasContext}
            />
          </div>
        )}
      </div>

      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          target={contextMenu.target}
          nodeId={contextMenu.nodeId}
          onAction={handleContextAction as (action: unknown) => void}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* 저장 다이얼로그 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">캔버스 저장</h3>
            <input
              autoFocus
              value={saveNameInput}
              onChange={(e) => setSaveNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNew()
                if (e.key === 'Escape') setShowSaveDialog(false)
              }}
              placeholder="캔버스 이름을 입력하세요"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleSaveNew}
                disabled={!saveNameInput.trim()}
                className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function NexusPage() {
  return (
    <ReactFlowProvider>
      <NexusPageInner />
    </ReactFlowProvider>
  )
}
