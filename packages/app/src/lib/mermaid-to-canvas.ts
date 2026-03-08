/**
 * Mermaid → ReactFlow Canvas 변환 래퍼
 * shared 파서 + dagre 레이아웃으로 노드 위치 계산
 */
import type { Node, Edge } from '@xyflow/react'
import { parseMermaid, type MermaidParseResult, type FlowDirection } from '@corthex/shared'
import { getAutoLayout } from './dagre-layout'

export interface ConversionResult {
  nodes: Node[]
  edges: Edge[]
  direction: FlowDirection
  error?: string
  warnings: string[]
}

export function mermaidToCanvas(mermaidCode: string): ConversionResult {
  const parsed: MermaidParseResult = parseMermaid(mermaidCode)

  if (parsed.error) {
    return { nodes: [], edges: [], direction: parsed.direction, error: parsed.error, warnings: parsed.warnings }
  }

  // Convert ParsedNode → ReactFlow Node
  const rfNodes: Node[] = parsed.nodes.map((n, i) => ({
    id: n.id,
    type: n.nodeType,
    position: { x: 100 + (i % 4) * 250, y: 100 + Math.floor(i / 4) * 150 },
    data: { label: n.label },
  }))

  // Convert ParsedEdge → ReactFlow Edge
  const rfEdges: Edge[] = parsed.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'editable',
    data: { label: e.label },
  }))

  // Apply dagre auto-layout for proper positioning
  const layoutedNodes = rfNodes.length > 0 ? getAutoLayout(rfNodes, rfEdges) : rfNodes

  return {
    nodes: layoutedNodes,
    edges: rfEdges,
    direction: parsed.direction,
    warnings: parsed.warnings,
  }
}
