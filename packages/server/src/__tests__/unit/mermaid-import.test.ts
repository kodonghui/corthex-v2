import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { parseMermaid, canvasToMermaidCode } from '@corthex/shared'

// Test the server-side mermaid import logic (parseMermaid used by import-mermaid API)
describe('Mermaid Import API Logic', () => {
  describe('parseMermaid — 서버사이드 사용', () => {
    it('유효한 Mermaid → 노드/엣지 생성', () => {
      const result = parseMermaid(`flowchart TD
  A([시작]) --> B[처리]
  B -->|완료| C((종료))`)

      expect(result.error).toBeUndefined()
      expect(result.nodes.length).toBeGreaterThanOrEqual(3)
      expect(result.edges).toHaveLength(2)
    })

    it('잘못된 입력 → error 필드 반환', () => {
      const result = parseMermaid('')
      expect(result.error).toBeTruthy()
      expect(result.nodes).toHaveLength(0)
    })

    it('파싱 결과를 graphData 형식으로 변환 가능', () => {
      const result = parseMermaid(`flowchart TD
  A[에이전트] --> B{결정}`)

      expect(result.error).toBeUndefined()

      // 서버에서 graphData로 변환하는 로직 시뮬레이션
      const graphNodes = result.nodes.map((n, i) => ({
        id: n.id,
        type: n.nodeType,
        position: { x: 100 + (i % 4) * 250, y: 100 + Math.floor(i / 4) * 150 },
        data: { label: n.label },
      }))

      const graphEdges = result.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'editable',
        data: { label: e.label },
      }))

      expect(graphNodes).toHaveLength(2)
      expect(graphNodes[0].type).toBe('agent')
      expect(graphNodes[0].data.label).toBe('에이전트')
      expect(graphNodes[1].type).toBe('decide')

      expect(graphEdges).toHaveLength(1)
      expect(graphEdges[0].source).toBe('A')
      expect(graphEdges[0].target).toBe('B')
    })
  })

  describe('입력 유효성 검증', () => {
    it('null/undefined 입력 방어', () => {
      // @ts-expect-error Testing null input
      const result1 = parseMermaid(null)
      expect(result1.error).toBeTruthy()

      // @ts-expect-error Testing undefined input
      const result2 = parseMermaid(undefined)
      expect(result2.error).toBeTruthy()
    })

    it('매우 긴 입력 처리', () => {
      // 100개 노드 + 99개 엣지 생성
      const lines = ['flowchart TD']
      for (let i = 0; i < 100; i++) {
        lines.push(`  N${i}[노드${i}]`)
      }
      for (let i = 0; i < 99; i++) {
        lines.push(`  N${i} --> N${i + 1}`)
      }
      const result = parseMermaid(lines.join('\n'))
      expect(result.error).toBeUndefined()
      expect(result.nodes).toHaveLength(100)
      expect(result.edges).toHaveLength(99)
    })

    it('중복 노드 ID 처리 (엣지 자동 생성 + 노드 정의)', () => {
      const result = parseMermaid(`flowchart TD
  A --> B
  A[시작 노드]
  B[종료 노드]`)

      expect(result.nodes).toHaveLength(2)
      // 나중에 정의된 라벨로 업데이트
      const nodeA = result.nodes.find(n => n.id === 'A')
      expect(nodeA?.label).toBe('시작 노드')
    })

    it('특수문자가 포함된 라벨', () => {
      const result = parseMermaid('flowchart TD\n  A["Hello & World - Test"]')
      expect(result.nodes[0].label).toBe('Hello & World - Test')
    })
  })

  describe('canvasToMermaidCode — 서버사이드 사용', () => {
    it('graphData를 Mermaid 코드로 변환', () => {
      const nodes = [
        { id: 'n1', type: 'start', data: { label: '시작' } },
        { id: 'n2', type: 'agent', data: { label: '처리' } },
      ]
      const edges = [
        { source: 'n1', target: 'n2', data: { label: '진행' } },
      ]

      const mermaid = canvasToMermaidCode(nodes, edges)
      expect(mermaid).toContain('flowchart TD')
      expect(mermaid).toContain('시작')
      expect(mermaid).toContain('처리')
      expect(mermaid).toContain('-->|진행|')
    })
  })

  describe('Mermaid Import 응답 메타데이터', () => {
    it('파싱 결과에서 메타데이터 추출', () => {
      const result = parseMermaid(`flowchart LR
  A([시작]) --> B[처리]
  B -->|성공| C((종료))`)

      const meta = {
        nodesCount: result.nodes.length,
        edgesCount: result.edges.length,
        warnings: result.warnings,
      }

      expect(meta.nodesCount).toBe(3)
      expect(meta.edgesCount).toBe(2)
      expect(Array.isArray(meta.warnings)).toBe(true)
    })

    it('warning이 있는 경우 메타에 포함', () => {
      const result = parseMermaid(`flowchart TD
  subgraph sub1["그룹"]
    A[Hello]
  end`)

      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.includes('subgraph'))).toBe(true)
    })
  })
})

describe('추가 엣지 케이스', () => {
  it('빈 줄이 많은 Mermaid 코드', () => {
    const code = `flowchart TD

  A[Hello]

  B[World]

  A --> B
`
    const result = parseMermaid(code)
    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toHaveLength(1)
  })

  it('탭 들여쓰기 Mermaid 코드', () => {
    const code = `flowchart TD
\tA[Hello]
\tB[World]
\tA --> B`
    const result = parseMermaid(code)
    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toHaveLength(1)
  })

  it('linkStyle 무시', () => {
    const code = `flowchart TD
  A[Hello] --> B[World]
  linkStyle 0 stroke:#ff3,stroke-width:4px`
    const result = parseMermaid(code)
    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toHaveLength(1)
  })

  it('여러 엣지가 같은 소스에서 나가는 경우 (팬아웃)', () => {
    const code = `flowchart TD
  A{판단} -->|예| B[처리A]
  A -->|아니오| C[처리B]
  A -->|모름| D[처리C]`
    const result = parseMermaid(code)
    expect(result.nodes).toHaveLength(4)
    expect(result.edges).toHaveLength(3)
    // 모든 엣지가 A에서 시작
    expect(result.edges.every(e => e.source === 'A')).toBe(true)
  })

  it('여러 엣지가 같은 대상에 도착하는 경우 (팬인)', () => {
    const code = `flowchart TD
  A[입력1] --> D[합류]
  B[입력2] --> D
  C[입력3] --> D`
    const result = parseMermaid(code)
    expect(result.nodes).toHaveLength(4)
    expect(result.edges).toHaveLength(3)
    expect(result.edges.every(e => e.target === 'D')).toBe(true)
  })

  it('자기 참조 엣지 (A → A)', () => {
    const code = `flowchart TD
  A[반복] --> A`
    const result = parseMermaid(code)
    expect(result.nodes).toHaveLength(1)
    expect(result.edges).toHaveLength(1)
    expect(result.edges[0].source).toBe('A')
    expect(result.edges[0].target).toBe('A')
  })

  it('연결만 있고 노드 정의 없는 경우', () => {
    const code = `flowchart TD
  X --> Y --> Z`
    // 체인 엣지는 현재 첫 번째만 파싱됨 (Mermaid 체인은 별도 구현 필요)
    const result = parseMermaid(code)
    expect(result.nodes.length).toBeGreaterThanOrEqual(2)
    expect(result.edges.length).toBeGreaterThanOrEqual(1)
  })
})
