// API Endpoints:
// GET  /workspace/agents
// GET  /workspace/chat/sessions
// POST /workspace/chat/sessions { agentId }
// POST /workspace/sketches { name, graphData }
// PUT  /workspace/sketches/:id { graphData, name? }
// GET  /workspace/sketches/:id
// POST /workspace/sketches/import-knowledge/:docId
// POST /workspace/ai/canvas-command { command, canvasContext }

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
import { sketchVibeNodeTypes, NODE_PALETTE, type SvNodeType } from '../components/sketchvibe/sketchvibe-nodes'
import { sketchVibeEdgeTypes } from '../components/sketchvibe/editable-edge'
import { ContextMenu } from '../components/sketchvibe/context-menu'
import { CanvasSidebar } from '../components/sketchvibe/canvas-sidebar'
import { ExportKnowledgeDialog } from '../components/sketchvibe/export-knowledge-dialog'
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
  group: '그룹',
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

  // === Connection Mode (Space bar toggle) ===
  const [connectionMode, setConnectionMode] = useState(false)
  const [pendingSource, setPendingSource] = useState<string | null>(null)

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

  // Selected node count
  const selectedCount = useMemo(() => nodes.filter((n) => n.selected).length, [nodes])

  // Node label change handler
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

  // Import from knowledge by docId
  const handleImportFromKnowledge = useCallback(
    async (docId: string) => {
      try {
        const res = await api.post<{ data: { id: string; name: string; graphData: { nodes: Node[]; edges: Edge[] } }; meta: { nodesCount: number } }>(
          `/workspace/sketches/import-knowledge/${docId}`,
          {},
        )
        const sketch = res.data
        if (sketch) {
          const restoredNodes = (sketch.graphData?.nodes || []).map((n: Node) => ({
            ...n,
            data: { ...n.data, onLabelChange: handleLabelChange },
          }))
          const restoredEdges = (sketch.graphData?.edges || []).map((e: Edge) => ({
            ...e,
            type: e.type || 'editable',
            data: { ...e.data, onEdgeLabelChange: handleEdgeLabelChange },
          }))
          setNodes(restoredNodes)
          setEdges(restoredEdges)
          setCurrentSketchId(sketch.id)
          setCurrentSketchName(sketch.name)
          setDirty(false)
          queryClient.invalidateQueries({ queryKey: ['sketches'] })
          setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 100)
        }
      } catch (err) {
        console.error('Failed to import from knowledge:', err)
      }
    },
    [setNodes, setEdges, handleLabelChange, handleEdgeLabelChange, reactFlowInstance, queryClient],
  )

  // Load pending graph data from command center
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

  // Add node
  const handleAddNode = useCallback(
    (type: SvNodeType, position?: { x: number; y: number }) => {
      nodeCounter++
      const id = `sv-${type}-${Date.now()}-${nodeCounter}`
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

  // Inject handlers
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

  // Refs
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes
  const edgesRef = useRef(edges)
  edgesRef.current = edges

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

  // Space bar connection mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isEditing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLElement && e.target.isContentEditable)
      if (e.code === 'Space' && !e.repeat && !isEditing) {
        e.preventDefault()
        setConnectionMode(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setConnectionMode(false)
        setPendingSource(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handleNodeClickForConnection = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (!connectionMode) return
      if (!pendingSource) {
        setPendingSource(node.id)
      } else if (pendingSource !== node.id) {
        const newEdge: Edge = {
          id: `e-${Date.now()}`,
          source: pendingSource,
          target: node.id,
          type: 'editable',
          data: { label: '', onEdgeLabelChange: handleEdgeLabelChange },
        }
        setEdges((eds) => [...eds, newEdge])
        setPendingSource(null)
        setDirty(true)
      }
    },
    [connectionMode, pendingSource, handleEdgeLabelChange, setEdges],
  )

  // Group/Ungroup
  const handleGroupSelected = useCallback(() => {
    const selected = nodes.filter((n) => n.selected && n.type !== 'group')
    if (selected.length < 2) return
    setUndoStack((prev) => [...prev.slice(-19), { nodes: [...nodes], edges: [...edges] }])
    setRedoStack([])
    const bounds = selected.map((n) => {
      const w = (n.measured?.width as number | undefined) ?? 160
      const h = (n.measured?.height as number | undefined) ?? 80
      return { left: n.position.x, top: n.position.y, right: n.position.x + w, bottom: n.position.y + h }
    })
    const minX = Math.min(...bounds.map((b) => b.left)) - 20
    const minY = Math.min(...bounds.map((b) => b.top)) - 40
    const maxX = Math.max(...bounds.map((b) => b.right)) + 20
    const maxY = Math.max(...bounds.map((b) => b.bottom)) + 20
    const groupId = `group-${Date.now()}`
    const groupNode: Node = {
      id: groupId,
      type: 'group',
      position: { x: minX, y: minY },
      data: { label: '서브그래프', onLabelChange: handleLabelChange },
      style: { width: maxX - minX, height: maxY - minY },
    }
    const selectedIds = new Set(selected.map((n) => n.id))
    setNodes((nds) => [
      groupNode,
      ...nds.map((n) =>
        selectedIds.has(n.id)
          ? { ...n, parentId: groupId, position: { x: n.position.x - minX, y: n.position.y - minY }, selected: false }
          : n,
      ),
    ])
    setDirty(true)
  }, [nodes, edges, setNodes, handleLabelChange])

  const handleUngroupNode = useCallback(
    (groupId: string) => {
      const groupNode = nodes.find((n) => n.id === groupId)
      if (!groupNode || groupNode.type !== 'group') return
      setUndoStack((prev) => [...prev.slice(-19), { nodes: [...nodes], edges: [...edges] }])
      setRedoStack([])
      const groupPos = groupNode.position
      setNodes((nds) =>
        nds
          .filter((n) => n.id !== groupId)
          .map((n) =>
            n.parentId === groupId
              ? { ...n, parentId: undefined, position: { x: n.position.x + groupPos.x, y: n.position.y + groupPos.y } }
              : n,
          ),
      )
      setEdges((eds) => eds.filter((e) => e.source !== groupId && e.target !== groupId))
      setDirty(true)
    },
    [nodes, edges, setNodes, setEdges],
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

  // Clean graph data for serialization
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
        const restoredNodes = (graphData.nodes || []).map((n: Node) => ({
          ...n,
          data: { ...n.data, onLabelChange: handleLabelChange },
        }))
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

  // Mermaid export
  const handleMermaidExport = useCallback(() => {
    const mermaid = canvasToMermaid(nodes, edges)
    navigator.clipboard.writeText(mermaid)
    setExportCopied(true)
    setTimeout(() => setExportCopied(false), 2000)
  }, [nodes, edges])

  // Delete selected nodes
  const handleDeleteSelected = useCallback(() => {
    const selectedIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id))
    if (selectedIds.size === 0) return
    setUndoStack((prev) => [...prev.slice(-19), { nodes: [...nodes], edges: [...edges] }])
    setRedoStack([])
    setNodes((nds) => nds.filter((n) => !selectedIds.has(n.id)))
    setEdges((eds) => eds.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)))
    setDirty(true)
  }, [nodes, edges, setNodes, setEdges])

  // === RENDER ===
  return (
    <div className="flex h-screen w-full" style={{ fontFamily: "'Pretendard', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-64 text-white flex flex-col h-full flex-shrink-0 z-20 shadow-lg" style={{ backgroundColor: '#5a7247' }}>
        <div className="p-6 flex items-center gap-3 border-b" style={{ borderColor: '#4a5d23' }}>
          <span className="material-symbols-outlined text-2xl">hub</span>
          <h2 className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Noto Serif KR', serif" }}>SketchVibe</h2>
        </div>
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 aspect-square rounded-full" style={{ width: '40px', height: '40px' }}></div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>CORTHEX v2</h1>
              <p className="text-xs" style={{ color: '#c5d8a4' }}>AI Canvas Workspace</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-4">
            <button
              onClick={handleNewCanvas}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6a8454')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span className="material-symbols-outlined text-xl">home</span>
              <span className="text-sm font-medium">Home</span>
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-inner"
              style={{ backgroundColor: '#4a5d23' }}
            >
              <span className="material-symbols-outlined text-xl">folder</span>
              <span className="text-sm font-medium">Workspaces</span>
            </button>
            <button
              onClick={() => setShowMermaidModal(true)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6a8454')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span className="material-symbols-outlined text-xl">dashboard</span>
              <span className="text-sm font-medium">Templates</span>
            </button>
          </div>
        </div>
        <div className="mt-auto p-6 flex flex-col gap-1 border-t" style={{ borderColor: '#4a5d23' }}>
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6a8454')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6a8454')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="material-symbols-outlined text-xl">help</span>
            <span className="text-sm font-medium">Help</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: '#faf8f5' }}>
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-8 absolute top-0 w-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), transparent)' }}>
          <div className="flex items-center gap-4 pointer-events-auto backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
            <span className="text-sm font-medium" style={{ color: '#6a5d43' }}>
              {currentSketchName || 'Untitled Canvas'}
            </span>
            {dirty && <span className="text-xs" style={{ color: '#c4622d' }}>(unsaved)</span>}
          </div>
          <div className="flex items-center gap-4 pointer-events-auto">
            {autoSaveToast && (
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(90,114,71,0.1)', color: '#5a7247' }}>
                Auto-saved
              </span>
            )}
            <button
              onClick={handleSave}
              className="text-white px-4 py-2 rounded-2xl text-sm font-medium shadow-md transition-colors"
              style={{ backgroundColor: '#c4622d' }}
            >
              Save
            </button>
            <button
              onClick={() => setShowExportKnowledge(true)}
              className="text-white px-4 py-2 rounded-2xl text-sm font-medium shadow-md transition-colors"
              style={{ backgroundColor: '#5a7247' }}
            >
              Share
            </button>
          </div>
        </header>

        {/* Canvas Content */}
        <div className="flex-1 w-full h-full relative cursor-move" style={{ backgroundImage: 'radial-gradient(#e5e1d3 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClickForConnection}
            onPaneContextMenu={(e) => handleContextMenu(e as unknown as React.MouseEvent)}
            onNodeContextMenu={(e, node) => handleContextMenu(e as unknown as React.MouseEvent, node.id)}
            nodeTypes={sketchVibeNodeTypes}
            edgeTypes={sketchVibeEdgeTypes}
            fitView
            className="w-full h-full"
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#d1c9b2" />
            <Controls
              className="!rounded-2xl !border !shadow-md"
              style={{ borderColor: '#e5e1d3', backgroundColor: '#ffffff' }}
            />
            <MiniMap
              nodeStrokeWidth={3}
              pannable
              zoomable
              style={{ backgroundColor: '#fbfaf8', border: '1px solid #e5e1d3', borderRadius: '12px' }}
            />
          </ReactFlow>

          {/* Context Menu */}
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              target={contextMenu.target}
              nodeId={contextMenu.nodeId}
              onClose={() => setContextMenu(null)}
              onAddNode={handleAddNode}
              onDeleteNode={(id) => {
                setNodes((nds) => nds.filter((n) => n.id !== id))
                setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
                setDirty(true)
                setContextMenu(null)
              }}
              onGroupSelected={handleGroupSelected}
              onUngroupNode={handleUngroupNode}
              selectedCount={selectedCount}
              nodeType={contextMenu.nodeId ? nodes.find((n) => n.id === contextMenu.nodeId)?.type as SvNodeType | undefined : undefined}
            />
          )}
        </div>

        {/* Canvas Controls (Zoom/Pan) */}
        <div className="absolute bottom-24 right-8 flex flex-col gap-2 z-20">
          <button
            onClick={handleAutoLayout}
            className="w-10 h-10 rounded-full shadow-md flex items-center justify-center border transition-colors"
            style={{ backgroundColor: '#ffffff', borderColor: '#e5e1d3', color: '#6a5d43' }}
          >
            <span className="material-symbols-outlined text-xl">fit_screen</span>
          </button>
        </div>

        {/* Floating Toolbar */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="rounded-full shadow-xl px-6 py-3 flex items-center gap-6 border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e1d3' }}>
            {Object.entries(NODE_PALETTE).slice(0, 4).map(([type, config]) => (
              <button
                key={type}
                onClick={() => handleAddNode(type as SvNodeType)}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#f2f0e9', color: '#6a5d43' }}
                >
                  <span className="material-symbols-outlined">{config.icon || 'smart_toy'}</span>
                </div>
                <span className="text-[10px] font-medium" style={{ color: '#9c8d66' }}>{config.label || type}</span>
              </button>
            ))}
            <div className="w-px h-8" style={{ backgroundColor: '#e5e1d3' }}></div>
            <button
              onClick={handleMermaidExport}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#f2f0e9', color: '#6a5d43' }}
              >
                <span className="material-symbols-outlined">ios_share</span>
              </div>
              <span className="text-[10px] font-medium" style={{ color: '#9c8d66' }}>
                {exportCopied ? 'Copied!' : 'Export'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && selectedAgent && selectedSessionId && (
        <div className="w-96 border-l flex flex-col h-full" style={{ borderColor: '#e5e1d3', backgroundColor: '#fbfaf8' }}>
          <ChatArea
            agent={selectedAgent}
            sessionId={selectedSessionId}
            canvasContext={canvasContext}
          />
        </div>
      )}

      {/* Sidebar Panel */}
      {showSidebar && (
        <CanvasSidebar
          onClose={() => setShowSidebar(false)}
          onLoad={handleLoadSketch}
          onNew={handleNewCanvas}
          currentSketchId={currentSketchId}
          onLoadFromKnowledge={handleLoadFromKnowledge}
          onImportFromKnowledge={handleImportFromKnowledge}
        />
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <div className="rounded-2xl shadow-2xl p-6 w-96 mx-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e1d3' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#463e30' }}>Save Canvas</h3>
            <input
              type="text"
              value={saveNameInput}
              onChange={(e) => setSaveNameInput(e.target.value)}
              placeholder="Canvas name"
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-1"
              style={{ borderColor: '#e5e1d3', color: '#463e30', backgroundColor: '#fbfaf8' }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="border rounded-lg px-4 py-2 text-sm transition-colors"
                style={{ borderColor: '#e5e1d3', color: '#6a5d43' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNew}
                className="text-white rounded-lg px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: '#5a7247' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mermaid Import Modal */}
      {showMermaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <div className="rounded-2xl shadow-2xl p-6 w-[500px] mx-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e1d3' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#463e30' }}>Import Mermaid</h3>
            <textarea
              value={mermaidInput}
              onChange={(e) => { setMermaidInput(e.target.value); setMermaidError('') }}
              placeholder="Paste Mermaid code here..."
              rows={8}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-2 font-mono focus:outline-none focus:ring-1"
              style={{ borderColor: '#e5e1d3', color: '#463e30', backgroundColor: '#fbfaf8' }}
            />
            {mermaidError && (
              <p className="text-xs mb-2" style={{ color: '#ef4444' }}>{mermaidError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowMermaidModal(false); setMermaidInput(''); setMermaidError('') }}
                className="border rounded-lg px-4 py-2 text-sm"
                style={{ borderColor: '#e5e1d3', color: '#6a5d43' }}
              >
                Cancel
              </button>
              <button
                onClick={handleMermaidImport}
                className="text-white rounded-lg px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: '#5a7247' }}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Knowledge Dialog */}
      {showExportKnowledge && (
        <ExportKnowledgeDialog
          graphData={getCleanGraphData()}
          sketchName={currentSketchName}
          onClose={() => setShowExportKnowledge(false)}
        />
      )}
    </div>
  )
}

export function SketchVibePage() {
  return (
    <ReactFlowProvider>
      <NexusPageInner />
    </ReactFlowProvider>
  )
}
