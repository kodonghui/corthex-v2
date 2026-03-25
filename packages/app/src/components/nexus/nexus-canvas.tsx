import { useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react'
import { Download, ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { CompanyNode } from './CompanyNode'
import { DepartmentNode } from './DepartmentNode'
import { AgentNode } from './AgentNode'

const nodeTypes = {
  company: CompanyNode,
  department: DepartmentNode,
  agent: AgentNode,
}

const defaultEdgeOptions = {
  type: 'smoothstep' as const,
  style: { stroke: '#a3b18a', strokeWidth: 2 },
  animated: false,
}

export interface NexusCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange?: (changes: unknown[]) => void
  onEdgesChange?: (changes: unknown[]) => void
  onNodeClick?: (event: React.MouseEvent, node: Node) => void
  editMode?: boolean
}

export function NexusCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  editMode = false,
}: NexusCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={canvasRef} className="flex-1 relative bg-corthex-bg" data-testid="nexus-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange as never}
        onEdgesChange={onEdgesChange as never}
        onNodeClick={onNodeClick}
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
          className="!bg-corthex-surface !border-corthex-border !shadow-[0_4px_20px_rgba(40,54,24,0.08)] !rounded-xl [&_button]:!bg-corthex-bg [&_button]:!border-corthex-border [&_button]:!text-corthex-text-secondary [&_button:hover]:!bg-corthex-elevated [&_button]:!rounded-lg"
        />
        <MiniMap
          nodeStrokeWidth={3}
          style={{ width: 192, height: 128 }}
          className="!bg-corthex-surface !border-corthex-border !rounded-xl !shadow-[0_4px_20px_rgba(40,54,24,0.08)] hidden md:block"
          nodeColor={(n) => {
            if (n.type === 'company') return 'var(--color-corthex-accent-deep)'
            if (n.type === 'department') return 'var(--color-corthex-accent)'
            return '#a3b18a'
          }}
        />
      </ReactFlow>

      {/* Export Button */}
      <NexusExportButton canvasRef={canvasRef} />
    </div>
  )
}

function NexusExportButton({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement | null> }) {
  const { getNodes } = useReactFlow()

  const handleExport = useCallback(async (format: 'png' | 'svg') => {
    const el = canvasRef.current
    if (!el) return

    const viewport = el.querySelector('.react-flow__viewport') as SVGElement | null
    if (!viewport) return

    if (format === 'svg') {
      const svgClone = viewport.cloneNode(true) as SVGElement
      const svgDoc = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svgDoc.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      svgDoc.setAttribute('width', '1920')
      svgDoc.setAttribute('height', '1080')
      svgDoc.appendChild(svgClone)
      const blob = new Blob([svgDoc.outerHTML], { type: 'image/svg+xml' })
      downloadBlob(blob, 'nexus-orgchart.svg')
      return
    }

    // PNG export via canvas
    try {
      const canvas = document.createElement('canvas')
      const rect = el.getBoundingClientRect()
      canvas.width = rect.width * 2
      canvas.height = rect.height * 2
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.scale(2, 2)
      ctx.fillStyle = 'var(--color-corthex-bg)'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Simple canvas-based PNG export
      const svgEl = el.querySelector('.react-flow__viewport')
      if (svgEl) {
        const svgData = new XMLSerializer().serializeToString(svgEl)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const img = new Image()
        const svgUrl = URL.createObjectURL(svgBlob)
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height)
          canvas.toBlob((blob: Blob | null) => blob && downloadBlob(blob, 'nexus-orgchart.png'), 'image/png')
          URL.revokeObjectURL(svgUrl)
        }
        img.src = svgUrl
      }
    } catch {
      // silently fail
    }
  }, [canvasRef, getNodes])

  return (
    <div className="absolute bottom-4 right-4 z-10 flex gap-2">
      <button
        onClick={() => handleExport('png')}
        className="flex items-center gap-1.5 px-3 py-2 bg-corthex-surface border border-corthex-border rounded-lg text-xs font-medium text-corthex-text-secondary hover:bg-corthex-elevated transition-colors shadow-sm"
        title="Export as PNG"
      >
        <Download className="w-3.5 h-3.5" />
        PNG
      </button>
      <button
        onClick={() => handleExport('svg')}
        className="flex items-center gap-1.5 px-3 py-2 bg-corthex-surface border border-corthex-border rounded-lg text-xs font-medium text-corthex-text-secondary hover:bg-corthex-elevated transition-colors shadow-sm"
        title="Export as SVG"
      >
        <Download className="w-3.5 h-3.5" />
        SVG
      </button>
    </div>
  )
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
