import type { Node, Edge } from '@xyflow/react'

type SvNodeType = 'start' | 'end' | 'agent' | 'system' | 'api' | 'decide' | 'db' | 'note'

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

const TYPE_LABELS: Record<SvNodeType, string> = {
  start: 'start',
  end: 'end',
  agent: 'agent',
  system: 'system',
  api: 'api',
  decide: 'decide',
  db: 'db',
  note: 'note',
}

// 노드 ID를 Mermaid-safe한 짧은 ID로 변환
function shortId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)
}

export function canvasToMermaid(nodes: Node[], edges: Edge[]): string {
  if (nodes.length === 0) return '(빈 캔버스)'

  const lines: string[] = ['flowchart TD']

  // 노드 정의
  for (const node of nodes) {
    const type = (node.type || 'system') as SvNodeType
    const label = (node.data as { label?: string })?.label || 'untitled'
    const [open, close] = MERMAID_SHAPES[type] || ['[', ']']
    const sid = shortId(node.id)
    lines.push(`  ${sid}${open}"${label}"${close}`)
  }

  // 엣지 정의 (라벨 포함)
  for (const edge of edges) {
    const src = shortId(edge.source)
    const tgt = shortId(edge.target)
    const label = (edge.data as { label?: string } | undefined)?.label || ''
    if (label) {
      lines.push(`  ${src} -->|${label}| ${tgt}`)
    } else {
      lines.push(`  ${src} --> ${tgt}`)
    }
  }

  return lines.join('\n')
}

// 캔버스를 사람이 읽기 쉬운 텍스트 요약으로 변환
export function canvasToText(nodes: Node[], edges: Edge[]): string {
  if (nodes.length === 0) return ''

  const lines: string[] = ['[현재 캔버스 상태]']

  // 노드 목록
  const nodeMap = new Map<string, string>()
  for (const node of nodes) {
    const type = (node.type || 'system') as SvNodeType
    const label = (node.data as { label?: string })?.label || 'untitled'
    nodeMap.set(node.id, label)
    lines.push(`- ${TYPE_LABELS[type]}: "${label}"`)
  }

  // 연결
  if (edges.length > 0) {
    lines.push('')
    lines.push('연결:')
    for (const edge of edges) {
      const src = nodeMap.get(edge.source) || edge.source
      const tgt = nodeMap.get(edge.target) || edge.target
      lines.push(`  "${src}" -> "${tgt}"`)
    }
  }

  return lines.join('\n')
}
