import { useState, useRef, useCallback, useMemo, useEffect } from 'react'

// === Types ===

export type WorkflowStep = {
  id: string
  name: string
  type: 'tool' | 'llm' | 'condition'
  action: string
  params?: Record<string, unknown>
  agentId?: string
  dependsOn?: string[]
  trueBranch?: string
  falseBranch?: string
  systemPrompt?: string
  timeout?: number
  retryCount?: number
  metadata?: {
    position?: { x: number; y: number }
  }
}

type Edge = {
  from: string
  to: string
  type: 'dependsOn' | 'trueBranch' | 'falseBranch'
}

type DragState =
  | { kind: 'none' }
  | { kind: 'node'; nodeId: string; offsetX: number; offsetY: number }
  | { kind: 'pan'; startX: number; startY: number; startViewX: number; startViewY: number }
  | { kind: 'edge'; fromId: string; handleType: 'dependsOn' | 'trueBranch' | 'falseBranch'; mouseX: number; mouseY: number }

// === Constants ===

const NODE_W = 140
const NODE_H = 60
const HANDLE_R = 6
const LAYER_GAP = 120
const NODE_GAP = 180

const NODE_STYLES: Record<string, { fill: string; stroke: string; textFill: string; icon: string }> = {
  tool: { fill: '#dbeafe', stroke: '#3b82f6', textFill: '#1e3a5f', icon: '\u{1F527}' },
  llm: { fill: '#f3e8ff', stroke: '#a855f7', textFill: '#581c87', icon: '\u{1F9E0}' },
  condition: { fill: '#fef3c7', stroke: '#f59e0b', textFill: '#78350f', icon: '\u2753' },
}

const EDGE_COLORS: Record<string, string> = {
  dependsOn: '#a1a1aa',
  trueBranch: '#22c55e',
  falseBranch: '#ef4444',
}

const MARKER_MAP: Record<string, string> = {
  dependsOn: 'url(#arrow-gray)',
  trueBranch: 'url(#arrow-green)',
  falseBranch: 'url(#arrow-red)',
}

// === Helpers ===

function uuid() {
  return crypto.randomUUID()
}

/** Topological sort into layers using Kahn's algorithm. Returns null if cycle detected. */
export function buildDagLayers(steps: WorkflowStep[]): WorkflowStep[][] | null {
  if (steps.length === 0) return []

  const inDegree = new Map(steps.map((s) => [s.id, 0]))

  for (const s of steps) {
    for (const dep of s.dependsOn || []) {
      if (inDegree.has(dep)) {
        inDegree.set(s.id, (inDegree.get(s.id) || 0) + 1)
      }
    }
  }

  const result: WorkflowStep[][] = []
  let queue = steps.filter((s) => (inDegree.get(s.id) || 0) === 0)

  while (queue.length > 0) {
    result.push(queue)
    const nextQueue: WorkflowStep[] = []
    for (const s of queue) {
      for (const other of steps) {
        if (other.dependsOn?.includes(s.id)) {
          const newDeg = (inDegree.get(other.id) || 0) - 1
          inDegree.set(other.id, newDeg)
          if (newDeg === 0) nextQueue.push(other)
        }
      }
    }
    queue = nextQueue
  }

  const totalSorted = result.reduce((acc, l) => acc + l.length, 0)
  if (totalSorted < steps.length) return null // cycle detected

  return result
}

function autoLayout(steps: WorkflowStep[], canvasWidth = 800): WorkflowStep[] {
  const layers = buildDagLayers(steps)
  if (!layers) return steps

  return steps.map((step) => {
    const layerIdx = layers.findIndex((layer) => layer.some((s) => s.id === step.id))
    if (layerIdx === -1) return step
    const inLayerIdx = layers[layerIdx].findIndex((s) => s.id === step.id)
    const layerWidth = layers[layerIdx].length * NODE_GAP
    const startX = (canvasWidth - layerWidth) / 2

    return {
      ...step,
      metadata: {
        ...step.metadata,
        position: { x: startX + inLayerIdx * NODE_GAP, y: 60 + layerIdx * LAYER_GAP },
      },
    }
  })
}

function getPos(step: WorkflowStep): { x: number; y: number } {
  return step.metadata?.position || { x: 100, y: 100 }
}

function buildEdges(steps: WorkflowStep[]): Edge[] {
  const edges: Edge[] = []
  const ids = new Set(steps.map((s) => s.id))
  for (const s of steps) {
    for (const dep of s.dependsOn || []) {
      if (ids.has(dep)) {
        edges.push({ from: dep, to: s.id, type: 'dependsOn' })
      }
    }
    if (s.trueBranch && ids.has(s.trueBranch)) {
      edges.push({ from: s.id, to: s.trueBranch, type: 'trueBranch' })
    }
    if (s.falseBranch && ids.has(s.falseBranch)) {
      edges.push({ from: s.id, to: s.falseBranch, type: 'falseBranch' })
    }
  }
  return edges
}

function wouldCreateCycle(steps: WorkflowStep[], fromId: string, toId: string): boolean {
  const testSteps = steps.map((s) => {
    if (s.id === toId) {
      return { ...s, dependsOn: [...(s.dependsOn || []), fromId] }
    }
    return s
  })
  return buildDagLayers(testSteps) === null
}

// === Main Canvas Component ===

export function WorkflowCanvas({
  steps,
  onChange,
  onSave,
}: {
  steps: WorkflowStep[]
  onChange: (steps: WorkflowStep[]) => void
  onSave: () => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragState, setDragState] = useState<DragState>({ kind: 'none' })
  const [viewBox, setViewBox] = useState({ x: -50, y: -20, w: 900, h: 600 })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState<{ x: number; y: number } | null>(null)
  const [showJsonEditor, setShowJsonEditor] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [cycleWarning, setCycleWarning] = useState<string | null>(null)

  const edges = useMemo(() => buildEdges(steps), [steps])
  const stepMap = useMemo(() => new Map(steps.map((s) => [s.id, s])), [steps])
  const selectedNode = selectedNodeId ? stepMap.get(selectedNodeId) || null : null

  // Sync JSON editor text
  useEffect(() => {
    if (showJsonEditor) {
      setJsonText(JSON.stringify(steps, null, 2))
    }
  }, [showJsonEditor, steps])

  // SVG coordinate conversion
  const svgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: clientX, y: clientY }
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: clientX, y: clientY }
    const svgP = pt.matrixTransform(ctm.inverse())
    return { x: svgP.x, y: svgP.y }
  }, [])

  // === Event Handlers ===

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return
    const target = e.target as SVGElement

    // Check if clicking on a handle
    const handleEl = target.closest('[data-handle]') as SVGElement | null
    if (handleEl) {
      const nodeId = handleEl.getAttribute('data-node-id')!
      const handleType = handleEl.getAttribute('data-handle') as 'dependsOn' | 'trueBranch' | 'falseBranch'
      const pt = svgPoint(e.clientX, e.clientY)
      setDragState({ kind: 'edge', fromId: nodeId, handleType, mouseX: pt.x, mouseY: pt.y })
      e.preventDefault()
      return
    }

    // Check if clicking on a node
    const nodeEl = target.closest('[data-node-id]') as SVGElement | null
    if (nodeEl && !handleEl) {
      const nodeId = nodeEl.getAttribute('data-node-id')!
      const pt = svgPoint(e.clientX, e.clientY)
      const node = steps.find((s) => s.id === nodeId)
      if (node) {
        const pos = getPos(node)
        setDragState({ kind: 'node', nodeId, offsetX: pt.x - pos.x, offsetY: pt.y - pos.y })
        setSelectedNodeId(nodeId)
      }
      e.preventDefault()
      return
    }

    // Pan
    setDragState({ kind: 'pan', startX: e.clientX, startY: e.clientY, startViewX: viewBox.x, startViewY: viewBox.y })
  }, [steps, svgPoint, viewBox])

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (dragState.kind === 'node') {
      const pt = svgPoint(e.clientX, e.clientY)
      const newX = pt.x - dragState.offsetX
      const newY = pt.y - dragState.offsetY
      onChange(steps.map((s) =>
        s.id === dragState.nodeId
          ? { ...s, metadata: { ...s.metadata, position: { x: newX, y: newY } } }
          : s
      ))
    } else if (dragState.kind === 'pan') {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const scaleX = viewBox.w / rect.width
      const scaleY = viewBox.h / rect.height
      const dx = (e.clientX - dragState.startX) * scaleX
      const dy = (e.clientY - dragState.startY) * scaleY
      setViewBox((v) => ({ ...v, x: dragState.startViewX - dx, y: dragState.startViewY - dy }))
    } else if (dragState.kind === 'edge') {
      const pt = svgPoint(e.clientX, e.clientY)
      setDragState((prev) => prev.kind === 'edge' ? { ...prev, mouseX: pt.x, mouseY: pt.y } : prev)
    }
  }, [dragState, svgPoint, steps, onChange, viewBox])

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (dragState.kind === 'edge') {
      // Check if dropped on an input handle
      const target = e.target as SVGElement
      const inputHandle = target.closest('[data-input-handle]') as SVGElement | null
      if (inputHandle) {
        const toId = inputHandle.getAttribute('data-node-id')!
        const fromId = dragState.fromId

        if (fromId !== toId) {
          // Check for cycles
          if (wouldCreateCycle(steps, fromId, toId)) {
            setCycleWarning('순환 참조가 감지되어 연결할 수 없습니다')
            setTimeout(() => setCycleWarning(null), 3000)
          } else {
            // Create edge based on handle type
            if (dragState.handleType === 'trueBranch') {
              onChange(steps.map((s) => s.id === fromId ? { ...s, trueBranch: toId } : s))
            } else if (dragState.handleType === 'falseBranch') {
              onChange(steps.map((s) => s.id === fromId ? { ...s, falseBranch: toId } : s))
            } else {
              // dependsOn: add fromId to toId's dependsOn
              onChange(steps.map((s) =>
                s.id === toId
                  ? { ...s, dependsOn: [...new Set([...(s.dependsOn || []), fromId])] }
                  : s
              ))
            }
          }
        }
      }
    }
    setDragState({ kind: 'none' })
  }, [dragState, steps, onChange])

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 1.1 : 0.9
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * viewBox.w + viewBox.x
    const my = ((e.clientY - rect.top) / rect.height) * viewBox.h + viewBox.y
    const newW = viewBox.w * factor
    const newH = viewBox.h * factor
    setViewBox({
      x: mx - (mx - viewBox.x) * factor,
      y: my - (my - viewBox.y) * factor,
      w: Math.min(Math.max(newW, 200), 5000),
      h: Math.min(Math.max(newH, 150), 4000),
    })
  }, [viewBox])

  const handleDoubleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement
    if (target.closest('[data-node-id]')) return // Don't add node when double-clicking on existing node
    const pt = svgPoint(e.clientX, e.clientY)
    setShowAddModal({ x: pt.x, y: pt.y })
  }, [svgPoint])

  // === Node Operations ===

  const addNode = useCallback((type: WorkflowStep['type'], x: number, y: number) => {
    const newStep: WorkflowStep = {
      id: uuid(),
      name: '',
      type,
      action: '',
      metadata: { position: { x, y } },
    }
    onChange([...steps, newStep])
    setSelectedNodeId(newStep.id)
    setShowAddModal(null)
  }, [steps, onChange])

  const updateSelectedNode = useCallback((partial: Partial<WorkflowStep>) => {
    if (!selectedNodeId) return
    onChange(steps.map((s) => s.id === selectedNodeId ? { ...s, ...partial } : s))
  }, [selectedNodeId, steps, onChange])

  const deleteNode = useCallback((nodeId: string) => {
    onChange(
      steps
        .filter((s) => s.id !== nodeId)
        .map((s) => ({
          ...s,
          dependsOn: s.dependsOn?.filter((d) => d !== nodeId),
          trueBranch: s.trueBranch === nodeId ? undefined : s.trueBranch,
          falseBranch: s.falseBranch === nodeId ? undefined : s.falseBranch,
        }))
    )
    if (selectedNodeId === nodeId) setSelectedNodeId(null)
  }, [steps, onChange, selectedNodeId])

  const deleteEdge = useCallback((edge: Edge) => {
    if (edge.type === 'trueBranch') {
      onChange(steps.map((s) => s.id === edge.from ? { ...s, trueBranch: undefined } : s))
    } else if (edge.type === 'falseBranch') {
      onChange(steps.map((s) => s.id === edge.from ? { ...s, falseBranch: undefined } : s))
    } else {
      onChange(steps.map((s) =>
        s.id === edge.to
          ? { ...s, dependsOn: s.dependsOn?.filter((d) => d !== edge.from) }
          : s
      ))
    }
  }, [steps, onChange])

  const handleAutoLayout = useCallback(() => {
    onChange(autoLayout(steps))
  }, [steps, onChange])

  const handleJsonApply = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText)
      if (!Array.isArray(parsed)) throw new Error('배열이어야 합니다')
      onChange(parsed)
      setCycleWarning(null)
    } catch (e) {
      setCycleWarning('JSON 파싱 실패: ' + (e instanceof Error ? e.message : String(e)))
      setTimeout(() => setCycleWarning(null), 5000)
    }
  }, [jsonText, onChange])

  // === Render ===

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-2">
        <button
          onClick={() => setShowAddModal({ x: viewBox.x + viewBox.w / 2 - NODE_W / 2, y: viewBox.y + viewBox.h / 2 - NODE_H / 2 })}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          + 노드 추가
        </button>
        <button
          onClick={handleAutoLayout}
          className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          자동 정렬
        </button>
        <button
          onClick={() => setShowJsonEditor(!showJsonEditor)}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            showJsonEditor
              ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
              : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          JSON 편집
        </button>
        <button
          onClick={onSave}
          className="ml-auto px-4 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          저장
        </button>
      </div>

      {/* Cycle warning */}
      {cycleWarning && (
        <div className="mx-2 px-3 py-2 text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg">
          {cycleWarning}
        </div>
      )}

      <div className="flex gap-2">
        {/* SVG Canvas */}
        <div className="flex-1 relative">
          <svg
            ref={svgRef}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 cursor-grab active:cursor-grabbing"
            style={{ height: 500 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
          >
            {/* Arrow markers */}
            <defs>
              <marker id="arrow-gray" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#a1a1aa" />
              </marker>
              <marker id="arrow-green" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
              </marker>
              <marker id="arrow-red" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map((edge, i) => {
              const fromStep = stepMap.get(edge.from)
              const toStep = stepMap.get(edge.to)
              if (!fromStep || !toStep) return null
              const fromPos = getPos(fromStep)
              const toPos = getPos(toStep)

              // Output from bottom of source
              let fromX = fromPos.x + NODE_W / 2
              const fromY = fromPos.y + NODE_H
              // Offset for condition branches
              if (edge.type === 'trueBranch') fromX = fromPos.x + NODE_W / 3
              if (edge.type === 'falseBranch') fromX = fromPos.x + (NODE_W * 2) / 3

              // Input at top center of target
              const toX = toPos.x + NODE_W / 2
              const toY = toPos.y

              // Bezier curve
              const midY = (fromY + toY) / 2
              const d = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`

              return (
                <g key={`edge-${i}`}>
                  {/* Invisible wider path for click target */}
                  <path
                    d={d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={12}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteEdge(edge)
                    }}
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke={EDGE_COLORS[edge.type]}
                    strokeWidth={2}
                    markerEnd={MARKER_MAP[edge.type]}
                    style={{ pointerEvents: 'none' }}
                  />
                  {/* Edge label for condition branches */}
                  {edge.type !== 'dependsOn' && (
                    <text
                      x={(fromX + toX) / 2}
                      y={(fromY + toY) / 2 - 6}
                      textAnchor="middle"
                      fill={EDGE_COLORS[edge.type]}
                      fontSize={10}
                      fontWeight="bold"
                      style={{ pointerEvents: 'none' }}
                    >
                      {edge.type === 'trueBranch' ? 'T' : 'F'}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Dragging edge preview */}
            {dragState.kind === 'edge' && (() => {
              const fromStep = stepMap.get(dragState.fromId)
              if (!fromStep) return null
              const fromPos = getPos(fromStep)
              let fromX = fromPos.x + NODE_W / 2
              const fromY = fromPos.y + NODE_H
              if (dragState.handleType === 'trueBranch') fromX = fromPos.x + NODE_W / 3
              if (dragState.handleType === 'falseBranch') fromX = fromPos.x + (NODE_W * 2) / 3

              return (
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={dragState.mouseX}
                  y2={dragState.mouseY}
                  stroke={EDGE_COLORS[dragState.handleType]}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                  style={{ pointerEvents: 'none' }}
                />
              )
            })()}

            {/* Nodes */}
            {steps.map((step) => {
              const pos = getPos(step)
              const style = NODE_STYLES[step.type] || NODE_STYLES.tool
              const isSelected = step.id === selectedNodeId

              return (
                <g key={step.id} data-node-id={step.id}>
                  {/* Node body */}
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={NODE_W}
                    height={NODE_H}
                    rx={8}
                    fill={style.fill}
                    stroke={isSelected ? '#6366f1' : style.stroke}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    style={{ cursor: 'move' }}
                  />
                  {/* Type badge */}
                  <text
                    x={pos.x + 8}
                    y={pos.y + 18}
                    fontSize={12}
                    style={{ pointerEvents: 'none' }}
                  >
                    {style.icon}
                  </text>
                  <text
                    x={pos.x + 24}
                    y={pos.y + 18}
                    fontSize={10}
                    fontWeight="600"
                    fill={style.textFill}
                    style={{ pointerEvents: 'none' }}
                  >
                    {step.type.toUpperCase()}
                  </text>
                  {/* Name */}
                  <text
                    x={pos.x + NODE_W / 2}
                    y={pos.y + 40}
                    fontSize={11}
                    textAnchor="middle"
                    fill={style.textFill}
                    style={{ pointerEvents: 'none' }}
                  >
                    {(step.name || step.action || '(unnamed)').slice(0, 16)}
                  </text>

                  {/* Input handle (top center) */}
                  <circle
                    cx={pos.x + NODE_W / 2}
                    cy={pos.y}
                    r={HANDLE_R}
                    fill="#fff"
                    stroke="#a1a1aa"
                    strokeWidth={1.5}
                    data-input-handle="true"
                    data-node-id={step.id}
                    style={{ cursor: 'crosshair' }}
                  />

                  {/* Output handle(s) (bottom) */}
                  {step.type === 'condition' ? (
                    <>
                      {/* True handle (left-ish) */}
                      <circle
                        cx={pos.x + NODE_W / 3}
                        cy={pos.y + NODE_H}
                        r={HANDLE_R}
                        fill="#dcfce7"
                        stroke="#22c55e"
                        strokeWidth={1.5}
                        data-handle="trueBranch"
                        data-node-id={step.id}
                        style={{ cursor: 'crosshair' }}
                      />
                      <text
                        x={pos.x + NODE_W / 3}
                        y={pos.y + NODE_H + 15}
                        fontSize={8}
                        textAnchor="middle"
                        fill="#22c55e"
                        style={{ pointerEvents: 'none' }}
                      >
                        T
                      </text>
                      {/* False handle (right-ish) */}
                      <circle
                        cx={pos.x + (NODE_W * 2) / 3}
                        cy={pos.y + NODE_H}
                        r={HANDLE_R}
                        fill="#fee2e2"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        data-handle="falseBranch"
                        data-node-id={step.id}
                        style={{ cursor: 'crosshair' }}
                      />
                      <text
                        x={pos.x + (NODE_W * 2) / 3}
                        y={pos.y + NODE_H + 15}
                        fontSize={8}
                        textAnchor="middle"
                        fill="#ef4444"
                        style={{ pointerEvents: 'none' }}
                      >
                        F
                      </text>
                    </>
                  ) : (
                    <circle
                      cx={pos.x + NODE_W / 2}
                      cy={pos.y + NODE_H}
                      r={HANDLE_R}
                      fill="#fff"
                      stroke="#a1a1aa"
                      strokeWidth={1.5}
                      data-handle="dependsOn"
                      data-node-id={step.id}
                      style={{ cursor: 'crosshair' }}
                    />
                  )}
                </g>
              )
            })}
          </svg>

          {/* Add Node Modal */}
          {showAddModal && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-lg p-4 z-10">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">노드 타입 선택</p>
              <div className="flex gap-2">
                <button
                  onClick={() => addNode('tool', showAddModal.x, showAddModal.y)}
                  className="px-3 py-2 text-xs rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 hover:bg-blue-200"
                >
                  {'\u{1F527}'} Tool
                </button>
                <button
                  onClick={() => addNode('llm', showAddModal.x, showAddModal.y)}
                  className="px-3 py-2 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 hover:bg-purple-200"
                >
                  {'\u{1F9E0}'} LLM
                </button>
                <button
                  onClick={() => addNode('condition', showAddModal.x, showAddModal.y)}
                  className="px-3 py-2 text-xs rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-200"
                >
                  {'\u2753'} Condition
                </button>
              </div>
              <button
                onClick={() => setShowAddModal(null)}
                className="mt-2 w-full text-xs text-zinc-400 hover:text-zinc-600"
              >
                취소
              </button>
            </div>
          )}
        </div>

        {/* Side Panel — Node Editor */}
        {selectedNode && (
          <div className="w-72 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 540 }}>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                selectedNode.type === 'tool' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : selectedNode.type === 'llm' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              }`}>
                {selectedNode.type.toUpperCase()}
              </span>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-xs text-zinc-400 hover:text-zinc-600"
              >
                닫기
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">이름</label>
              <input
                value={selectedNode.name}
                onChange={(e) => updateSelectedNode({ name: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
                placeholder="노드 이름"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">타입</label>
              <select
                value={selectedNode.type}
                onChange={(e) => updateSelectedNode({ type: e.target.value as WorkflowStep['type'] })}
                className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
              >
                <option value="tool">Tool</option>
                <option value="llm">LLM</option>
                <option value="condition">Condition</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">액션</label>
              <input
                value={selectedNode.action}
                onChange={(e) => updateSelectedNode({ action: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
                placeholder="액션명"
              />
            </div>

            {selectedNode.type === 'llm' && (
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">시스템 프롬프트</label>
                <textarea
                  value={selectedNode.systemPrompt || ''}
                  onChange={(e) => updateSelectedNode({ systemPrompt: e.target.value || undefined })}
                  rows={3}
                  className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">타임아웃 (ms)</label>
                <input
                  type="number"
                  value={selectedNode.timeout || ''}
                  onChange={(e) => updateSelectedNode({ timeout: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
                  placeholder="30000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">재시도</label>
                <input
                  type="number"
                  value={selectedNode.retryCount ?? ''}
                  onChange={(e) => updateSelectedNode({ retryCount: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
                  placeholder="0"
                  min={0}
                  max={3}
                />
              </div>
            </div>

            <button
              onClick={() => deleteNode(selectedNode.id)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
            >
              노드 삭제
            </button>
          </div>
        )}
      </div>

      {/* JSON Editor */}
      {showJsonEditor && (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Steps JSON</span>
            <button
              onClick={handleJsonApply}
              className="px-3 py-1 text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              적용
            </button>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 text-xs font-mono border border-zinc-300 dark:border-zinc-600 rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-y focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  )
}
