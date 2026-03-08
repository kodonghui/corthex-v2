import { describe, it, expect } from 'bun:test'
import { parseMermaid, canvasToMermaidCode, type SvNodeType } from '../mermaid-parser'

describe('parseMermaid', () => {
  describe('기본 파싱', () => {
    it('빈 입력 시 에러 반환', () => {
      const result = parseMermaid('')
      expect(result.error).toBeTruthy()
      expect(result.nodes).toHaveLength(0)
    })

    it('공백만 있는 입력 시 에러 반환', () => {
      const result = parseMermaid('   \n  \n  ')
      expect(result.error).toBeTruthy()
    })

    it('노드/엣지 없는 코드 시 에러 반환', () => {
      const result = parseMermaid('flowchart TD\n%% only comments')
      expect(result.error).toBeTruthy()
    })

    it('flowchart 헤더 없이도 파싱 가능 (warning 발생)', () => {
      const result = parseMermaid('A[Hello] --> B[World]')
      expect(result.error).toBeUndefined()
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.nodes.length).toBeGreaterThanOrEqual(2)
    })

    it('방향 파싱 (LR)', () => {
      const result = parseMermaid('flowchart LR\n  A[Hello]')
      expect(result.direction).toBe('LR')
    })

    it('방향 파싱 (TD)', () => {
      const result = parseMermaid('flowchart TD\n  A[Hello]')
      expect(result.direction).toBe('TD')
    })

    it('TB를 TD로 정규화', () => {
      const result = parseMermaid('flowchart TB\n  A[Hello]')
      expect(result.direction).toBe('TD')
    })

    it('graph 키워드도 지원', () => {
      const result = parseMermaid('graph LR\n  A[Hello]')
      expect(result.direction).toBe('LR')
      expect(result.nodes).toHaveLength(1)
    })
  })

  describe('8종 노드 타입 파싱', () => {
    it('start 노드: ([label])', () => {
      const result = parseMermaid('flowchart TD\n  A([시작])')
      expect(result.nodes[0].nodeType).toBe('start')
      expect(result.nodes[0].label).toBe('시작')
    })

    it('end 노드: ((label))', () => {
      const result = parseMermaid('flowchart TD\n  A((종료))')
      expect(result.nodes[0].nodeType).toBe('end')
      expect(result.nodes[0].label).toBe('종료')
    })

    it('agent 노드: [label]', () => {
      const result = parseMermaid('flowchart TD\n  A[에이전트]')
      expect(result.nodes[0].nodeType).toBe('agent')
      expect(result.nodes[0].label).toBe('에이전트')
    })

    it('system 노드: [[label]]', () => {
      const result = parseMermaid('flowchart TD\n  A[[시스템]]')
      expect(result.nodes[0].nodeType).toBe('system')
      expect(result.nodes[0].label).toBe('시스템')
    })

    it('api 노드 v2: {{label}}', () => {
      const result = parseMermaid('flowchart TD\n  A{{외부API}}')
      expect(result.nodes[0].nodeType).toBe('api')
      expect(result.nodes[0].label).toBe('외부API')
    })

    it('api 노드 v1: [/label\\]', () => {
      const result = parseMermaid('flowchart TD\n  A[/외부API\\]')
      expect(result.nodes[0].nodeType).toBe('api')
      expect(result.nodes[0].label).toBe('외부API')
    })

    it('decide 노드: {label}', () => {
      const result = parseMermaid('flowchart TD\n  A{결정}')
      expect(result.nodes[0].nodeType).toBe('decide')
      expect(result.nodes[0].label).toBe('결정')
    })

    it('db 노드: [(label)]', () => {
      const result = parseMermaid('flowchart TD\n  A[(데이터베이스)]')
      expect(result.nodes[0].nodeType).toBe('db')
      expect(result.nodes[0].label).toBe('데이터베이스')
    })

    it('note 노드: >label]', () => {
      const result = parseMermaid('flowchart TD\n  A>메모]')
      expect(result.nodes[0].nodeType).toBe('note')
      expect(result.nodes[0].label).toBe('메모')
    })

    it('8종 노드 전부 한번에 파싱', () => {
      const code = `flowchart TD
  S([시작])
  E((종료))
  AG[에이전트]
  SY[[시스템]]
  AP{{API}}
  DE{결정}
  DB[(DB)]
  NO>메모]`
      const result = parseMermaid(code)
      expect(result.nodes).toHaveLength(8)
      const types = result.nodes.map((n) => n.nodeType)
      expect(types).toContain('start')
      expect(types).toContain('end')
      expect(types).toContain('agent')
      expect(types).toContain('system')
      expect(types).toContain('api')
      expect(types).toContain('decide')
      expect(types).toContain('db')
      expect(types).toContain('note')
    })
  })

  describe('엣지 파싱', () => {
    it('라벨 없는 엣지: A --> B', () => {
      const result = parseMermaid('flowchart TD\n  A[Start] --> B[End]')
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].source).toBe('A')
      expect(result.edges[0].target).toBe('B')
      expect(result.edges[0].label).toBe('')
    })

    it('라벨 있는 엣지 v1 형식: A -->|라벨| B', () => {
      const result = parseMermaid('flowchart TD\n  A[Start] -->|처리| B[End]')
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].label).toBe('처리')
    })

    it('라벨 있는 엣지 대체 형식: A --라벨--> B', () => {
      const result = parseMermaid('flowchart TD\n  A[Start] --처리--> B[End]')
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].label).toBe('처리')
    })

    it('여러 엣지 파싱', () => {
      const code = `flowchart TD
  A([시작]) --> B[처리]
  B -->|성공| C((종료))
  B --실패--> D{재시도}`
      const result = parseMermaid(code)
      expect(result.edges).toHaveLength(3)
      expect(result.edges[0].label).toBe('')
      expect(result.edges[1].label).toBe('성공')
      expect(result.edges[2].label).toBe('실패')
    })

    it('인라인 노드 정의가 포함된 엣지', () => {
      const code = `flowchart TD
  A[시작] --> B{결정}`
      const result = parseMermaid(code)
      expect(result.nodes.length).toBeGreaterThanOrEqual(2)
      expect(result.edges).toHaveLength(1)
      // 노드 타입이 올바르게 매핑되어야 함
      const nodeA = result.nodes.find((n) => n.id === 'A')
      const nodeB = result.nodes.find((n) => n.id === 'B')
      expect(nodeA?.nodeType).toBe('agent')
      expect(nodeB?.nodeType).toBe('decide')
    })
  })

  describe('주석 및 무시 항목', () => {
    it('주석(%%) 무시', () => {
      const code = `flowchart TD
  %% 이것은 주석입니다
  A[Hello] --> B[World]`
      const result = parseMermaid(code)
      expect(result.nodes).toHaveLength(2)
    })

    it('subgraph은 무시하고 warning', () => {
      const code = `flowchart TD
  subgraph sub1["서브그래프"]
    A[Hello]
  end
  B[World]`
      const result = parseMermaid(code)
      expect(result.warnings.some((w) => w.includes('subgraph'))).toBe(true)
    })

    it('style 지시어 무시', () => {
      const code = `flowchart TD
  A[Hello]
  style A fill:#f9f`
      const result = parseMermaid(code)
      expect(result.nodes).toHaveLength(1)
    })

    it('classDef 무시', () => {
      const code = `flowchart TD
  A[Hello]
  classDef red fill:#ff0000`
      const result = parseMermaid(code)
      expect(result.nodes).toHaveLength(1)
    })
  })

  describe('라벨 처리', () => {
    it('따옴표 제거', () => {
      const result = parseMermaid('flowchart TD\n  A["Hello World"]')
      expect(result.nodes[0].label).toBe('Hello World')
    })

    it('한국어 라벨', () => {
      const result = parseMermaid('flowchart TD\n  A[안녕하세요]')
      expect(result.nodes[0].label).toBe('안녕하세요')
    })

    it('v2 canvasToMermaid 타입 주석 제거', () => {
      const result = parseMermaid('flowchart TD\n  A(["시작 (start)"])')
      expect(result.nodes[0].label).toBe('시작')
    })
  })

  describe('엣지 자동 노드 생성', () => {
    it('노드 정의 없이 엣지만 있으면 자동 노드 생성', () => {
      const code = `flowchart TD
  A --> B
  B --> C`
      const result = parseMermaid(code)
      expect(result.nodes).toHaveLength(3)
      expect(result.edges).toHaveLength(2)
    })

    it('자동 생성된 노드는 agent 타입', () => {
      const result = parseMermaid('flowchart TD\n  A --> B')
      expect(result.nodes[0].nodeType).toBe('agent')
      expect(result.nodes[1].nodeType).toBe('agent')
    })
  })

  describe('복잡한 다이어그램', () => {
    it('순환 참조 허용 (A→B→C→A)', () => {
      const code = `flowchart TD
  A[시작] --> B[처리]
  B --> C[검증]
  C --> A`
      const result = parseMermaid(code)
      expect(result.nodes).toHaveLength(3)
      expect(result.edges).toHaveLength(3)
      expect(result.error).toBeUndefined()
    })

    it('분기 다이어그램', () => {
      const code = `flowchart TD
  A([시작]) --> B{결정}
  B -->|예| C[처리A]
  B -->|아니오| D[처리B]
  C --> E((종료))
  D --> E`
      const result = parseMermaid(code)
      expect(result.nodes).toHaveLength(5)
      expect(result.edges).toHaveLength(5)
    })

    it('노드 ID에 하이픈 허용', () => {
      const code = `flowchart TD
  sv-start-1([시작]) --> sv-agent-2[에이전트]`
      const result = parseMermaid(code)
      expect(result.nodes.length).toBeGreaterThanOrEqual(2)
      const startNode = result.nodes.find((n) => n.id === 'sv-start-1')
      expect(startNode?.nodeType).toBe('start')
    })
  })
})

describe('canvasToMermaidCode', () => {
  it('빈 캔버스 처리', () => {
    expect(canvasToMermaidCode([], [])).toBe('(빈 캔버스)')
  })

  it('기본 노드 변환', () => {
    const nodes = [
      { id: 'n1', type: 'agent', data: { label: 'Hello' } },
      { id: 'n2', type: 'system', data: { label: 'World' } },
    ]
    const result = canvasToMermaidCode(nodes, [])
    expect(result).toContain('flowchart TD')
    expect(result).toContain('n1["Hello"]')
    expect(result).toContain('n2[["World"]]')
  })

  it('엣지 라벨 포함', () => {
    const nodes = [
      { id: 'A', type: 'agent', data: { label: 'A' } },
      { id: 'B', type: 'agent', data: { label: 'B' } },
    ]
    const edges = [{ source: 'A', target: 'B', data: { label: '처리' } }]
    const result = canvasToMermaidCode(nodes, edges)
    expect(result).toContain('-->|처리|')
  })

  it('엣지 라벨 없는 경우', () => {
    const nodes = [
      { id: 'A', type: 'agent', data: { label: 'A' } },
      { id: 'B', type: 'agent', data: { label: 'B' } },
    ]
    const edges = [{ source: 'A', target: 'B' }]
    const result = canvasToMermaidCode(nodes, edges)
    expect(result).toContain('A --> B')
    expect(result).not.toContain('|')
  })

  it('8종 노드 형태 출력', () => {
    const types: SvNodeType[] = ['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note']
    const nodes = types.map((t, i) => ({ id: `n${i}`, type: t, data: { label: t } }))
    const result = canvasToMermaidCode(nodes, [])
    expect(result).toContain('(["start"])')   // start
    expect(result).toContain('(("end"))')     // end
    expect(result).toContain('["agent"]')     // agent
    expect(result).toContain('[["system"]]')  // system
    expect(result).toContain('{{"api"}}')     // api
    expect(result).toContain('{"decide"}')    // decide
    expect(result).toContain('[("db")]')      // db
    expect(result).toContain('>"note"]')      // note
  })

  it('방향 지정 가능', () => {
    const nodes = [{ id: 'A', type: 'agent', data: { label: 'A' } }]
    const result = canvasToMermaidCode(nodes, [], 'LR')
    expect(result).toContain('flowchart LR')
  })

  it('특수문자 ID 정리', () => {
    const nodes = [{ id: 'sv-start-123!@#', type: 'start', data: { label: '시작' } }]
    const result = canvasToMermaidCode(nodes, [])
    // Should not contain raw special chars
    expect(result).not.toContain('!')
    expect(result).not.toContain('@')
    expect(result).not.toContain('#')
  })
})

describe('양방향 Round-trip', () => {
  it('canvasToMermaid → parseMermaid 구조 보존', () => {
    const nodes = [
      { id: 'A', type: 'start', data: { label: '시작' } },
      { id: 'B', type: 'agent', data: { label: '처리' } },
      { id: 'C', type: 'decide', data: { label: '분기' } },
      { id: 'D', type: 'end', data: { label: '종료' } },
    ]
    const edges = [
      { source: 'A', target: 'B', data: { label: '' } },
      { source: 'B', target: 'C', data: { label: '다음' } },
      { source: 'C', target: 'D', data: { label: '완료' } },
    ]

    const mermaid = canvasToMermaidCode(nodes, edges)
    const result = parseMermaid(mermaid)

    expect(result.error).toBeUndefined()
    expect(result.nodes).toHaveLength(4)
    expect(result.edges).toHaveLength(3)

    // 노드 타입 보존
    const typeMap = new Map(result.nodes.map((n) => [n.id, n.nodeType]))
    expect(typeMap.get('A')).toBe('start')
    expect(typeMap.get('B')).toBe('agent')
    expect(typeMap.get('C')).toBe('decide')
    expect(typeMap.get('D')).toBe('end')

    // 라벨 보존
    const labelMap = new Map(result.nodes.map((n) => [n.id, n.label]))
    expect(labelMap.get('A')).toBe('시작')
    expect(labelMap.get('B')).toBe('처리')
    expect(labelMap.get('C')).toBe('분기')
    expect(labelMap.get('D')).toBe('종료')

    // 엣지 라벨 보존
    const edgeLabels = result.edges.map((e) => e.label)
    expect(edgeLabels).toContain('다음')
    expect(edgeLabels).toContain('완료')
  })

  it('전체 8종 노드 Round-trip', () => {
    const types: SvNodeType[] = ['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note']
    const nodes = types.map((t) => ({ id: t, type: t, data: { label: `${t}라벨` } }))
    const mermaid = canvasToMermaidCode(nodes, [])
    const result = parseMermaid(mermaid)

    expect(result.nodes).toHaveLength(8)
    for (const t of types) {
      const found = result.nodes.find((n) => n.id === t)
      expect(found).toBeTruthy()
      expect(found!.nodeType).toBe(t)
      expect(found!.label).toBe(`${t}라벨`)
    }
  })

  it('v1 Mermaid 코드 호환성', () => {
    // v1 cytoscapeToMermaid 출력 형식
    const v1Code = `flowchart LR
  start1([시작])
  agent1[분석 에이전트]
  api1[/외부 API\\]
  decide1{판단}
  end1((종료))
  start1 --> agent1
  agent1 -->|분석완료| decide1
  decide1 -->|성공| end1
  decide1 -->|실패| api1
  api1 --> agent1`
    const result = parseMermaid(v1Code)
    expect(result.error).toBeUndefined()
    expect(result.direction).toBe('LR')
    expect(result.nodes.length).toBeGreaterThanOrEqual(5)
    expect(result.edges.length).toBeGreaterThanOrEqual(5)

    // 타입 검증
    const typeMap = new Map(result.nodes.map((n) => [n.id, n.nodeType]))
    expect(typeMap.get('start1')).toBe('start')
    expect(typeMap.get('agent1')).toBe('agent')
    expect(typeMap.get('api1')).toBe('api')
    expect(typeMap.get('decide1')).toBe('decide')
    expect(typeMap.get('end1')).toBe('end')
  })
})
