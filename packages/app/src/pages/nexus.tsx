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
import { canvasToText, canvasToMermaid } from '../lib/canvas-to-mermaid'
import { mermaidToCanvas } from '../lib/mermaid-to-canvas'
import { sketchVibeNodeTypes, NODE_PALETTE, type SvNodeType } from '../components/nexus/sketchvibe-nodes'
import { sketchVibeEdgeTypes } from '../components/nexus/editable-edge'
import { ContextMenu } from '../components/nexus/context-menu'
import { CanvasSidebar } from '../components/nexus/canvas-sidebar'
import { ExportKnowledgeDialog } from '../components/nexus/export-knowledge-dialog'
import { useAutoSave } from '../hooks/use-auto-save'
import { useWsStore } from '../stores/ws-store'
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

type CanvasSnapshot = { nodes: Node[]; edges: Edge[] }

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

  // Mermaid import/export state
  const [showMermaidModal, setShowMermaidModal] = useState(false)
  const [mermaidInput, setMermaidInput] = useState('')
  const [mermaidError, setMermaidError] = useState('')
  const [exportCopied, setExportCopied] = useState(false)

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

  // Export knowledge dialog
  const [showExportKnowledge, setShowExportKnowledge] = useState(false)

  // Auto-save toast
  const [autoSaveToast, setAutoSaveToast] = useState(false)

  // Mobile: canvas or chat view
  const [mobileView, setMobileView] = useState<'canvas' | 'chat'>('canvas')

  // === AI Canvas Command State ===
  const [aiCommand, setAiCommand] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiPreview, setAiPreview] = useState<{ nodes: Node[]; edges: Edge[]; description: string } | null>(null)
  const [undoStack, setUndoStack] = useState<CanvasSnapshot[]>([])
  const [redoStack, setRedoStack] = useState<CanvasSnapshot[]>([])

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

  // Auto-save hook
  useAutoSave({
    sketchId: currentSketchId,
    dirty,
    getGraphData: useCallback(() => {
      const cleanNodes = nodes.map(({ data, ...rest }) => {
        if (!data) return rest
        const { onLabelChange: _, ...cleanData } = data as Record<string, unknown>
        return { ...rest, data: cleanData }
      })
      const cleanEdges = edges.map(({ data, ...rest }) => {
        if (!data) return rest
        const { onEdgeLabelChange: _, ...cleanData } = data as Record<string, unknown>
        return { ...rest, data: cleanData }
      })
      return { nodes: cleanNodes, edges: cleanEdges }
    }, [nodes, edges]),
    onSaved: useCallback(() => {
      setDirty(false)
      setAutoSaveToast(true)
      setTimeout(() => setAutoSaveToast(false), 2000)
    }, []),
  })

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

  // Load Mermaid from knowledge base
  const handleLoadFromKnowledge = useCallback(
    (mermaidCode: string, title: string) => {
      if (dirty && !confirm(`현재 캔버스에 저장하지 않은 변경사항이 있어요. "${title}"을(를) 불러올까요?`)) return
      const result = mermaidToCanvas(mermaidCode)
      if (result.nodes.length > 0) {
        const restoredNodes = result.nodes.map((n: Node) => ({
          ...n,
          data: { ...n.data, onLabelChange: handleLabelChange },
        }))
        const restoredEdges = result.edges.map((e: Edge) => ({
          ...e,
          type: e.type || 'editable',
          data: { ...e.data, onEdgeLabelChange: handleEdgeLabelChange },
        }))
        setNodes(restoredNodes)
        setEdges(restoredEdges)
        setCurrentSketchId(null)
        setCurrentSketchName(`${title} (지식 베이스)`)
        setDirty(false)
        setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 100)
      }
    },
    [dirty, setNodes, setEdges, handleLabelChange, handleEdgeLabelChange, reactFlowInstance],
  )

  // === Load pending graph data from command center ===
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingGraphData')
    if (pending) {
      try {
        const data = JSON.parse(pending) as { nodes: Node[]; edges: Edge[] }
        if (data.nodes && data.edges) {
          const nodesWithHandlers = data.nodes.map((n: Node) => ({
            ...n,
            data: { ...n.data, onLabelChange: handleLabelChange },
          }))
          const edgesWithHandlers = data.edges.map((e: Edge) => ({
            ...e,
            data: { ...e.data, onEdgeLabelChange: handleEdgeLabelChange },
          }))
          setNodes(nodesWithHandlers)
          setEdges(edgesWithHandlers)
          setCurrentSketchId(null)
          setCurrentSketchName('')
          setDirty(true)
          setTimeout(() => reactFlowInstance?.fitView(), 100)
        }
      } catch { /* ignore parse errors */ }
      sessionStorage.removeItem('pendingGraphData')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Mermaid import handler
  const handleMermaidImport = useCallback(() => {
    if (!mermaidInput.trim()) return
    const result = mermaidToCanvas(mermaidInput)
    if (result.error) {
      setMermaidError(result.error)
      return
    }
    // Inject callbacks into nodes and edges
    const importedNodes = result.nodes.map((n) => ({
      ...n,
      data: { ...n.data, onLabelChange: handleLabelChange },
    }))
    const importedEdges = result.edges.map((e) => ({
      ...e,
      data: { ...e.data, onEdgeLabelChange: handleEdgeLabelChange },
    }))
    setNodes(importedNodes)
    setEdges(importedEdges)
    setDirty(true)
    setShowMermaidModal(false)
    setMermaidInput('')
    setMermaidError('')
    setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 100)
  }, [mermaidInput, handleLabelChange, handleEdgeLabelChange, setNodes, setEdges, reactFlowInstance])

  // Mermaid export handler
  const handleMermaidExport = useCallback(async () => {
    const code = canvasToMermaid(nodes, edges)
    try {
      await navigator.clipboard.writeText(code)
      setExportCopied(true)
      setTimeout(() => setExportCopied(false), 2000)
    } catch {
      // Fallback: show in modal
      setMermaidInput(code)
      setShowMermaidModal(true)
    }
  }, [nodes, edges])

  // === AI Canvas Command ===

  const aiCommandMutation = useMutation({
    mutationFn: (params: { command: string; graphData: { nodes: Node[]; edges: Edge[] } }) =>
      api.post<{ data: { commandId: string; mermaid: string; description: string } }>(
        '/workspace/sketches/ai-command',
        params,
      ),
  })

  const handleAiCommand = useCallback(async () => {
    if (!aiCommand.trim() || aiLoading) return
    setAiLoading(true)
    setAiError('')
    setAiPreview(null)

    try {
      const result = await aiCommandMutation.mutateAsync({
        command: aiCommand.trim(),
        graphData: getCleanGraphData(),
      })

      // Parse Mermaid response into preview nodes/edges
      const parsed = mermaidToCanvas(result.data.mermaid)
      if (parsed.error) {
        setAiError(`Mermaid 파싱 오류: ${parsed.error}`)
        return
      }

      // Inject callbacks into preview nodes/edges
      const previewNodes = parsed.nodes.map((n) => ({
        ...n,
        data: { ...n.data, onLabelChange: handleLabelChange },
      }))
      const previewEdges = parsed.edges.map((e) => ({
        ...e,
        data: { ...e.data, onEdgeLabelChange: handleEdgeLabelChange },
      }))

      setAiPreview({
        nodes: previewNodes,
        edges: previewEdges,
        description: result.data.description,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI 명령 처리에 실패했습니다'
      setAiError(message)
    } finally {
      setAiLoading(false)
    }
  }, [aiCommand, aiLoading, aiCommandMutation, getCleanGraphData, handleLabelChange, handleEdgeLabelChange])

  // Apply AI preview
  const handleApplyAiPreview = useCallback(() => {
    if (!aiPreview) return
    // Save current state to undo stack
    setUndoStack((prev) => [...prev.slice(-19), { nodes: [...nodes], edges: [...edges] }])
    setRedoStack([])
    // Apply preview
    setNodes(aiPreview.nodes)
    setEdges(aiPreview.edges)
    setDirty(true)
    setAiPreview(null)
    setAiCommand('')
    setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 100)
  }, [aiPreview, nodes, edges, setNodes, setEdges, reactFlowInstance])

  // Cancel AI preview
  const handleCancelAiPreview = useCallback(() => {
    setAiPreview(null)
  }, [])

  // Undo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    setRedoStack((r) => [...r, { nodes: [...nodes], edges: [...edges] }])
    setUndoStack((u) => u.slice(0, -1))
    // Restore with callbacks
    setNodes(prev.nodes.map((n) => ({ ...n, data: { ...n.data, onLabelChange: handleLabelChange } })))
    setEdges(prev.edges.map((e) => ({ ...e, data: { ...e.data, onEdgeLabelChange: handleEdgeLabelChange } })))
    setDirty(true)
  }, [undoStack, nodes, edges, setNodes, setEdges, handleLabelChange, handleEdgeLabelChange])

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    setUndoStack((u) => [...u, { nodes: [...nodes], edges: [...edges] }])
    setRedoStack((r) => r.slice(0, -1))
    setNodes(next.nodes.map((n) => ({ ...n, data: { ...n.data, onLabelChange: handleLabelChange } })))
    setEdges(next.edges.map((e) => ({ ...e, data: { ...e.data, onEdgeLabelChange: handleEdgeLabelChange } })))
    setDirty(true)
  }, [redoStack, nodes, edges, setNodes, setEdges, handleLabelChange, handleEdgeLabelChange])

  // === WebSocket nexus channel listener ===
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()

  useEffect(() => {
    if (!isConnected) return
    subscribe('nexus')
  }, [isConnected, subscribe])

  useEffect(() => {
    const handleNexusMessage = (data: unknown) => {
      const msg = data as { type?: string; mermaid?: string; description?: string; error?: string; command?: string }
      if (!msg?.type) return

      switch (msg.type) {
        case 'canvas_ai_start':
          setAiLoading(true)
          setAiError('')
          break
        case 'canvas_update': {
          if (!msg.mermaid) break
          const parsed = mermaidToCanvas(msg.mermaid)
          if (parsed.error) break
          const pNodes = parsed.nodes.map((n) => ({
            ...n,
            data: { ...n.data, onLabelChange: handleLabelChange },
          }))
          const pEdges = parsed.edges.map((e) => ({
            ...e,
            data: { ...e.data, onEdgeLabelChange: handleEdgeLabelChange },
          }))
          setAiPreview({ nodes: pNodes, edges: pEdges, description: msg.description || '' })
          setAiLoading(false)
          break
        }
        case 'canvas_ai_error':
          setAiError(msg.error || 'AI 오류')
          setAiLoading(false)
          break
      }
    }

    addListener('nexus', handleNexusMessage)
    return () => removeListener('nexus', handleNexusMessage)
  }, [addListener, removeListener, handleLabelChange, handleEdgeLabelChange])

  // Context menu action handler
  const handleContextAction = useCallback(
    (action: { type: string; nodeId?: string; nodeType?: SvNodeType; position?: { x: number; y: number } }) => {
      setContextMenu(null)
      switch (action.type) {
        case 'edit-label': {
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
    <div data-testid="nexus-page" className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-3 py-2 border-b border-slate-700 flex items-center gap-2">
        <h2 className="text-base font-semibold shrink-0 text-slate-50">SketchVibe</h2>

        {currentSketchName && (
          <span className="text-xs text-slate-400 truncate max-w-[120px]">
            — {currentSketchName}{dirty ? ' *' : ''}
          </span>
        )}

        {/* 저장 버튼 */}
        <button
          data-testid="nexus-save-btn"
          onClick={handleSave}
          disabled={nodes.length === 0}
          className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors"
        >
          저장
        </button>

        {/* 캔버스 목록 토글 */}
        <button
          data-testid="nexus-sidebar-toggle"
          onClick={() => setShowSidebar(!showSidebar)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            showSidebar ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
        >
          목록
        </button>

        {/* Mermaid Import */}
        <button
          data-testid="nexus-mermaid-import-btn"
          onClick={() => { setMermaidInput(''); setMermaidError(''); setShowMermaidModal(true) }}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
          title="Mermaid 코드 가져오기"
        >
          Mermaid
        </button>

        {/* Mermaid Export */}
        <button
          data-testid="nexus-mermaid-export-btn"
          onClick={handleMermaidExport}
          disabled={nodes.length === 0}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-300 rounded transition-colors"
          title="Mermaid 코드 내보내기"
        >
          {exportCopied ? '복사됨!' : '내보내기'}
        </button>

        {/* 지식 베이스에 저장 */}
        <button
          data-testid="nexus-kb-save-btn"
          onClick={() => setShowExportKnowledge(true)}
          disabled={nodes.length === 0 || !currentSketchId}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-300 rounded transition-colors"
          title="지식 베이스에 다이어그램 저장"
        >
          지식 저장
        </button>

        {/* Undo / Redo */}
        <button
          data-testid="nexus-undo-btn"
          onClick={handleUndo}
          disabled={undoStack.length === 0}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-300 rounded transition-colors"
          title="실행 취소"
        >
          ↩
        </button>
        <button
          data-testid="nexus-redo-btn"
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-300 rounded transition-colors"
          title="다시 실행"
        >
          ↪
        </button>

        {/* 에이전트 선택 */}
        <select
          data-testid="nexus-agent-select"
          value={selectedAgentId || ''}
          onChange={(e) => handleAgentSelect(e.target.value)}
          className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 max-w-[140px] text-slate-200"
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
            data-testid="nexus-mobile-canvas-tab"
            onClick={() => setMobileView('canvas')}
            className={`px-2 py-1 text-xs rounded ${
              mobileView === 'canvas' ? 'bg-slate-700 text-white' : 'text-slate-400'
            }`}
          >
            캔버스
          </button>
          <button
            data-testid="nexus-mobile-chat-tab"
            onClick={() => setMobileView('chat')}
            className={`px-2 py-1 text-xs rounded ${
              mobileView === 'chat' ? 'bg-slate-700 text-white' : 'text-slate-400'
            }`}
          >
            채팅
          </button>
        </div>

        {/* 데스크톱 채팅 토글 */}
        <button
          data-testid="nexus-chat-toggle"
          onClick={() => setChatOpen(!chatOpen)}
          className="hidden md:block px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
        >
          {chatOpen ? '채팅 닫기' : '채팅 열기'}
        </button>
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 캔버스 목록 사이드바 */}
        {showSidebar && (
          <div data-testid="nexus-sidebar" className="w-52 border-r border-slate-800 shrink-0 hidden md:block">
            <CanvasSidebar
              currentSketchId={currentSketchId}
              onLoad={handleLoadSketch}
              onNew={handleNewCanvas}
              onLoadFromKnowledge={handleLoadFromKnowledge}
            />
          </div>
        )}

        {/* 캔버스 */}
        <div
          data-testid="nexus-canvas"
          className={`flex-1 flex flex-col relative ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* 캔버스 도구 모음 */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {/* 노드 추가 버튼 */}
            <div className="relative">
              <button
                data-testid="nexus-node-palette-btn"
                onClick={() => setShowToolbar(!showToolbar)}
                className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
              >
                + 노드
              </button>

              {/* 팔레트 드롭다운 */}
              {showToolbar && (
                <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 w-44 z-50">
                  {NODE_PALETTE.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleAddNode(item.type)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-800 rounded transition-colors"
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center text-white text-[10px] ${item.color}`}
                      >
                        {item.icon}
                      </span>
                      <span className="text-slate-200">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 자동 정렬 */}
            <button
              data-testid="nexus-auto-layout-btn"
              onClick={handleAutoLayout}
              className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg shadow transition-colors"
              title="자동 정렬"
            >
              ⟳ 정렬
            </button>

            {/* 초기화 */}
            <button
              data-testid="nexus-clear-btn"
              onClick={handleClear}
              className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg shadow transition-colors"
              title="초기화"
            >
              ✕ 초기화
            </button>
          </div>

          {/* AI 프리뷰 오버레이 */}
          {aiPreview && (
            <div data-testid="nexus-ai-preview" className="absolute top-2 right-2 z-20 bg-slate-900/95 border border-blue-500 rounded-lg shadow-xl p-3 w-72">
              <p className="text-xs text-blue-400 font-semibold mb-1">AI 제안</p>
              <p className="text-xs text-slate-300 mb-3">{aiPreview.description}</p>
              <div className="flex gap-2">
                <button
                  data-testid="nexus-ai-apply-btn"
                  onClick={handleApplyAiPreview}
                  className="flex-1 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  적용
                </button>
                <button
                  data-testid="nexus-ai-cancel-btn"
                  onClick={handleCancelAiPreview}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 캔버스 안내 (비어있을 때) */}
          {nodes.length === 0 && !aiPreview && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center text-slate-500">
                <p className="text-lg mb-2">여기에 그림을 그려보세요</p>
                <p className="text-sm">왼쪽 위 &quot;+ 노드&quot; 버튼으로 노드를 추가하고,</p>
                <p className="text-sm">드래그해서 연결하세요.</p>
                <p className="text-sm mt-2">하단 AI 명령으로 자동 생성할 수도 있어요.</p>
              </div>
            </div>
          )}

          {/* ReactFlow 캔버스 */}
          <div className="flex-1">
            <ReactFlow
              nodes={aiPreview ? aiPreview.nodes : nodes}
              edges={aiPreview ? aiPreview.edges : edges}
              onNodesChange={aiPreview ? undefined : handleNodesChange}
              onEdgesChange={aiPreview ? undefined : handleEdgesChange}
              onConnect={aiPreview ? undefined : onConnect}
              nodeTypes={sketchVibeNodeTypes}
              edgeTypes={sketchVibeEdgeTypes}
              defaultEdgeOptions={{ type: 'editable' }}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={0.1}
              maxZoom={3}
              nodesDraggable={!aiPreview}
              nodesConnectable={!aiPreview}
              deleteKeyCode={aiPreview ? [] : ['Backspace', 'Delete']}
              panOnScroll
              zoomOnPinch
              proOptions={{ hideAttribution: true }}
              onPaneClick={() => {
                setShowToolbar(false)
                setContextMenu(null)
              }}
              onNodeContextMenu={aiPreview ? undefined : (event, node) => handleContextMenu(event, node.id)}
              onPaneContextMenu={aiPreview ? undefined : (event) => handleContextMenu(event as unknown as React.MouseEvent)}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#3f3f46" />
              <Controls />
              <MiniMap
                nodeStrokeWidth={3}
                style={{ width: 120, height: 80 }}
                className="!bg-slate-800 hidden md:block"
              />
            </ReactFlow>
          </div>

          {/* AI 명령 입력란 */}
          <div className="px-3 py-2 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
            <span className="text-[10px] text-blue-400 font-semibold shrink-0">AI</span>
            <input
              data-testid="nexus-ai-input"
              value={aiCommand}
              onChange={(e) => setAiCommand(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiCommand() } }}
              placeholder="예: DB 노드를 추가하고 API 서버에 연결해줘"
              disabled={aiLoading}
              className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              data-testid="nexus-ai-send-btn"
              onClick={handleAiCommand}
              disabled={!aiCommand.trim() || aiLoading}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors shrink-0"
            >
              {aiLoading ? '처리중...' : '전송'}
            </button>
          </div>

          {/* AI 오류 표시 */}
          {aiError && (
            <div className="px-3 py-1 bg-red-900/30 border-t border-red-800">
              <p className="text-[10px] text-red-400">{aiError}</p>
            </div>
          )}

          {/* 하단 상태바 */}
          <div data-testid="nexus-status-bar" className="px-3 py-1 border-t border-slate-800 bg-slate-900/80 flex items-center gap-3 text-[10px] text-slate-500">
            <span>노드 {nodes.length}개</span>
            <span>연결 {edges.length}개</span>
            {dirty && <span className="text-amber-500">미저장</span>}
            {autoSaveToast && <span className="text-emerald-400">자동 저장됨</span>}
            {undoStack.length > 0 && <span className="text-slate-600">Undo {undoStack.length}</span>}
            <span className="hidden sm:inline text-slate-500">더블클릭: 이름 편집 | Delete: 삭제 | 핸들 드래그: 연결 | 우클릭: 메뉴</span>
          </div>
        </div>

        {/* 채팅 패널 */}
        {(chatOpen || mobileView === 'chat') && (
          <div
            data-testid="nexus-chat-panel"
            className={`border-l border-slate-800 flex flex-col ${
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
        <div data-testid="nexus-save-dialog" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">캔버스 저장</h3>
            <input
              autoFocus
              value={saveNameInput}
              onChange={(e) => setSaveNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNew()
                if (e.key === 'Escape') setShowSaveDialog(false)
              }}
              placeholder="캔버스 이름을 입력하세요"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleSaveNew}
                disabled={!saveNameInput.trim()}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mermaid Import 모달 */}
      {showMermaidModal && (
        <div data-testid="nexus-mermaid-modal" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-[480px] max-w-[90vw] shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Mermaid 코드 가져오기</h3>
            <textarea
              autoFocus
              value={mermaidInput}
              onChange={(e) => { setMermaidInput(e.target.value); setMermaidError('') }}
              placeholder={`flowchart TD\n  A([시작])\n  B[에이전트]\n  A --> B`}
              rows={10}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono outline-none focus:border-blue-500 resize-y"
            />
            {mermaidError && (
              <p className="mt-2 text-xs text-red-400">{mermaidError}</p>
            )}
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setShowMermaidModal(false)}
                className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleMermaidImport}
                disabled={!mermaidInput.trim()}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 지식 베이스 내보내기 다이얼로그 */}
      {showExportKnowledge && currentSketchId && (
        <ExportKnowledgeDialog
          sketchId={currentSketchId}
          sketchName={currentSketchName || '새 다이어그램'}
          onClose={() => setShowExportKnowledge(false)}
        />
      )}

      {/* 자동 저장 토스트 */}
      {autoSaveToast && (
        <div data-testid="nexus-autosave-toast" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-800/90 text-emerald-200 text-xs rounded-lg shadow-lg animate-pulse">
          자동 저장됨
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
