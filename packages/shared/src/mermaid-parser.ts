/**
 * Mermaid ↔ Canvas 양방향 변환 파서 (서버/클라이언트 공용)
 * v1 mermaidToCytoscape 로직을 TypeScript로 포팅 + v2 형태 지원
 */

export type SvNodeType = 'start' | 'end' | 'agent' | 'system' | 'api' | 'decide' | 'db' | 'note'

export interface ParsedNode {
  id: string
  label: string
  nodeType: SvNodeType
}

export interface ParsedEdge {
  id: string
  source: string
  target: string
  label: string
}

export type FlowDirection = 'LR' | 'TD' | 'RL' | 'BT'

export interface MermaidParseResult {
  nodes: ParsedNode[]
  edges: ParsedEdge[]
  direction: FlowDirection
  error?: string
  warnings: string[]
}

// Mermaid 형태 → SvNodeType 매핑 (패턴 순서 중요: 긴 패턴부터)
const NODE_PATTERNS: { re: RegExp; type: SvNodeType }[] = [
  { re: /^\s*(\w[\w-]*)\[\((.+?)\)\]/, type: 'db' },       // id[(label)]
  { re: /^\s*(\w[\w-]*)\(\((.+?)\)\)/, type: 'end' },      // id((label))
  { re: /^\s*(\w[\w-]*)\(\[(.+?)\]\)/, type: 'start' },    // id([label])
  { re: /^\s*(\w[\w-]*)\{\{(.+?)\}\}/, type: 'api' },      // id{{label}} (v2)
  { re: /^\s*(\w[\w-]*)\{(.+?)\}/, type: 'decide' },       // id{label}
  { re: /^\s*(\w[\w-]*)>(.+?)\]/, type: 'note' },          // id>label]
  { re: /^\s*(\w[\w-]*)\[\[(.+?)\]\]/, type: 'system' },   // id[[label]]
  { re: /^\s*(\w[\w-]*)\[\/(.+?)\\\]/, type: 'api' },      // id[/label\] (v1)
  { re: /^\s*(\w[\w-]*)\[([^\]]+?)\]/, type: 'agent' },    // id[label] (fallback)
]

// 엣지 패턴: source -->|label| target 또는 source --label--> target 또는 source --> target
// 인라인 노드 정의도 허용
const EDGE_PATTERNS = [
  // source -->|label| target
  /(\w[\w-]*)(?:\[{1,2}[^\]]*\]{1,2}|\([^)]*\)|\{[^}]*\}|>[^\]]*\]|[/][^\]]*[\\]|\{\{[^}]*\}\})*\s*-->\|([^|]*)\|\s*(\w[\w-]*)/,
  // source --label--> target
  /(\w[\w-]*)(?:\[{1,2}[^\]]*\]{1,2}|\([^)]*\)|\{[^}]*\}|>[^\]]*\]|[/][^\]]*[\\]|\{\{[^}]*\}\})*\s*--([^-][^>]*?)-->\s*(\w[\w-]*)/,
  // source --> target (no label)
  /(\w[\w-]*)(?:\[{1,2}[^\]]*\]{1,2}|\([^)]*\)|\{[^}]*\}|>[^\]]*\]|[/][^\]]*[\\]|\{\{[^}]*\}\})*\s*-->\s*(\w[\w-]*)/,
]

function cleanLabel(raw: string): string {
  // Remove surrounding quotes
  let label = raw.trim()
  if ((label.startsWith('"') && label.endsWith('"')) || (label.startsWith("'") && label.endsWith("'"))) {
    label = label.slice(1, -1)
  }
  // Remove trailing type annotation like " (agent)" from v2 canvasToMermaid output
  label = label.replace(/\s*\((start|end|agent|system|api|decide|db|note)\)\s*$/, '')
  return label.trim()
}

export function parseMermaid(mermaidCode: string): MermaidParseResult {
  const warnings: string[] = []

  if (!mermaidCode || !mermaidCode.trim()) {
    return { nodes: [], edges: [], direction: 'TD', error: 'Mermaid 코드가 비어있습니다', warnings }
  }

  const lines = mermaidCode.split('\n')
  const nodes: ParsedNode[] = []
  const edges: ParsedEdge[] = []
  const seen = new Set<string>()
  let edgeIdx = 0

  // Parse direction from first line
  const dirMatch = lines[0]?.match(/(?:flowchart|graph)\s+(LR|TD|RL|BT|TB)/i)
  const direction: FlowDirection = dirMatch
    ? (dirMatch[1].toUpperCase().replace('TB', 'TD') as FlowDirection)
    : 'TD'

  // Check if it looks like valid Mermaid
  const hasFlowchartHeader = /^\s*(flowchart|graph)\s/i.test(lines[0]?.trim() || '')
  if (!hasFlowchartHeader) {
    // Try to parse anyway but warn
    warnings.push('flowchart/graph 헤더가 없습니다. flowchart TD로 간주합니다.')
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip header, empty lines, comments
    if (!trimmed || /^\s*(flowchart|graph)\s/i.test(trimmed)) continue
    if (trimmed.startsWith('%%')) continue

    // Skip subgraph/end/direction/style/classDef/class directives
    if (/^\s*subgraph\s/.test(trimmed)) { warnings.push(`subgraph은 무시됩니다: ${trimmed.slice(0, 40)}`); continue }
    if (/^\s*end\s*$/.test(trimmed)) continue
    if (/^\s*direction\s+(LR|RL|TB|TD|BT)\s*$/i.test(trimmed)) continue
    if (/^\s*style\s+/.test(trimmed)) continue
    if (/^\s*classDef\s+/.test(trimmed)) continue
    if (/^\s*class\s+/.test(trimmed)) continue
    if (/^\s*linkStyle\s+/.test(trimmed)) continue

    // Try edge patterns first (edges may contain inline node definitions)
    let edgeMatched = false
    for (const ep of EDGE_PATTERNS) {
      const em = ep.exec(trimmed)
      if (em) {
        edgeMatched = true
        if (em.length === 4) {
          // Has label: groups are (source, label, target)
          const [, source, label, target] = em
          edgeIdx++
          edges.push({ id: `e${edgeIdx}`, source, target, label: label.trim() })
          // Ensure source/target exist as nodes
          if (!seen.has(source)) { seen.add(source); nodes.push({ id: source, label: source, nodeType: 'agent' }) }
          if (!seen.has(target)) { seen.add(target); nodes.push({ id: target, label: target, nodeType: 'agent' }) }
        } else if (em.length === 3) {
          // No label: groups are (source, target)
          const [, source, target] = em
          edgeIdx++
          edges.push({ id: `e${edgeIdx}`, source, target, label: '' })
          if (!seen.has(source)) { seen.add(source); nodes.push({ id: source, label: source, nodeType: 'agent' }) }
          if (!seen.has(target)) { seen.add(target); nodes.push({ id: target, label: target, nodeType: 'agent' }) }
        }
        break
      }
    }

    // Try node patterns — find all node definitions in the line
    // Track which IDs we've already matched in this line to avoid lower-priority overwrites
    const lineMatched = new Set<string>()
    for (const p of NODE_PATTERNS) {
      const globalRe = new RegExp(p.re.source.replace(/^\^\\s\*/, ''), 'g')
      let nm: RegExpExecArray | null
      while ((nm = globalRe.exec(trimmed)) !== null) {
        const id = nm[1]
        if (lineMatched.has(id)) continue // Higher-priority pattern already matched this ID
        lineMatched.add(id)
        const label = cleanLabel(nm[2])
        if (seen.has(id)) {
          const existing = nodes.find((n) => n.id === id)
          if (existing && existing.label === id) {
            existing.label = label
            existing.nodeType = p.type
          }
        } else {
          seen.add(id)
          nodes.push({ id, label, nodeType: p.type })
        }
      }
    }
  }

  if (nodes.length === 0 && edges.length === 0) {
    return { nodes, edges, direction, error: '파싱할 수 있는 노드나 엣지가 없습니다', warnings }
  }

  return { nodes, edges, direction, warnings }
}

// === Canvas → Mermaid 변환 (공용 유틸) ===

const MERMAID_SHAPES: Record<SvNodeType, [string, string]> = {
  start: ['([', '])'],
  end: ['((', '))'],
  agent: ['[', ']'],
  system: ['[[', ']]'],
  api: ['{{', '}}'],
  decide: ['{', '}'],
  db: ['[(', ')]'],
  note: ['>', ']'],
}

export interface CanvasNode {
  id: string
  type?: string
  data?: { label?: string }
}

export interface CanvasEdge {
  source: string
  target: string
  data?: { label?: string }
}

function mermaidSafeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
}

export function canvasToMermaidCode(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  direction: FlowDirection = 'TD',
): string {
  if (nodes.length === 0) return '(빈 캔버스)'

  const lines: string[] = [`flowchart ${direction}`]

  // Node definitions
  for (const node of nodes) {
    const type = (node.type || 'system') as SvNodeType
    const label = node.data?.label || 'untitled'
    const [open, close] = MERMAID_SHAPES[type] || ['[', ']']
    const sid = mermaidSafeId(node.id)
    lines.push(`  ${sid}${open}"${label}"${close}`)
  }

  // Edge definitions with labels
  for (const edge of edges) {
    const src = mermaidSafeId(edge.source)
    const tgt = mermaidSafeId(edge.target)
    const label = edge.data?.label || ''
    if (label) {
      lines.push(`  ${src} -->|${label}| ${tgt}`)
    } else {
      lines.push(`  ${src} --> ${tgt}`)
    }
  }

  return lines.join('\n')
}
