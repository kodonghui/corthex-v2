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
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { ChatArea } from '../components/chat/chat-area'
import { canvasToText } from '../lib/canvas-to-mermaid'
import { sketchVibeNodeTypes, NODE_PALETTE, type SvNodeType } from '../components/nexus/sketchvibe-nodes'
import type { Agent, Session } from '../components/chat/types'

let nodeCounter = 0

export function NexusPage() {
  const queryClient = useQueryClient()

  // Canvas state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const reactFlowRef = useRef<{ fitView: (opts?: { padding?: number }) => void } | null>(null)

  // Chat state
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(true)
  const [showToolbar, setShowToolbar] = useState(false)

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
    },
    [setNodes],
  )

  // Connect nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, id: `e-${Date.now()}`, type: 'smoothstep' }, eds))
    },
    [setEdges],
  )

  // Add node from palette
  const handleAddNode = useCallback(
    (type: SvNodeType) => {
      nodeCounter++
      const defaultLabels: Record<SvNodeType, string> = {
        start: '시작',
        end: '종료',
        agent: '에이전트',
        system: '시스템',
        api: '외부 API',
        decide: '결정',
        db: '데이터베이스',
        note: '메모',
      }
      const id = `sv-${type}-${Date.now()}-${nodeCounter}`
      const newNode: Node = {
        id,
        type,
        position: {
          x: 100 + Math.random() * 300,
          y: 100 + Math.random() * 300,
        },
        data: { label: defaultLabels[type], onLabelChange: handleLabelChange },
      }
      setNodes((nds) => [...nds, newNode])
      setShowToolbar(false)
    },
    [setNodes, handleLabelChange],
  )

  // Inject onLabelChange into all nodes (needed for label editing)
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

  // Clear canvas
  const handleClear = useCallback(() => {
    if (nodes.length === 0) return
    if (!confirm('캔버스를 초기화하시겠어요?')) return
    setNodes([])
    setEdges([])
  }, [nodes.length, setNodes, setEdges])

  // Auto-layout
  const handleAutoLayout = useCallback(async () => {
    const { getAutoLayout } = await import('../lib/dagre-layout')
    setNodes((nds) => {
      const laid = getAutoLayout(nds as Node[], edges)
      return laid
    })
    setTimeout(() => reactFlowRef.current?.fitView({ padding: 0.2 }), 100)
  }, [edges, setNodes])

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
        <h2 className="text-base font-semibold shrink-0">SketchVibe</h2>

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
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={sketchVibeNodeTypes}
              onInit={(instance) => {
                reactFlowRef.current = instance
                if (nodes.length > 0) instance.fitView({ padding: 0.2 })
              }}
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
              onPaneClick={() => setShowToolbar(false)}
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
            <span className="hidden sm:inline">| 더블클릭: 이름 편집 | Delete: 삭제 | 핸들 드래그: 연결</span>
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
    </div>
  )
}
