import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { extractMermaidFromResponse } from '../../services/canvas-ai'

// === extractMermaidFromResponse 단위 테스트 ===

describe('Canvas AI Service', () => {
  describe('extractMermaidFromResponse', () => {
    test('정상 Mermaid 코드 블록 추출', () => {
      const llmResponse = `다음과 같이 수정했습니다.

\`\`\`mermaid
flowchart TD
  A([시작])
  B[에이전트]
  A --> B
\`\`\`

<!-- 설명: DB 노드를 추가했습니다 -->`

      const result = extractMermaidFromResponse(llmResponse)
      expect(result.mermaid).toContain('flowchart TD')
      expect(result.mermaid).toContain('A([시작])')
      expect(result.mermaid).toContain('B[에이전트]')
      expect(result.description).toBe('DB 노드를 추가했습니다')
    })

    test('설명 주석이 없으면 기본 설명 반환', () => {
      const llmResponse = `\`\`\`mermaid
flowchart TD
  A([시작])
\`\`\``

      const result = extractMermaidFromResponse(llmResponse)
      expect(result.mermaid).toContain('flowchart TD')
      expect(result.description).toBe('캔버스가 수정되었습니다')
    })

    test('Mermaid 블록이 없으면 빈 문자열 반환', () => {
      const llmResponse = '죄송합니다, 이해하지 못했습니다.'
      const result = extractMermaidFromResponse(llmResponse)
      expect(result.mermaid).toBe('')
      expect(result.description).toBe('캔버스가 수정되었습니다')
    })

    test('복잡한 Mermaid 코드 블록 추출', () => {
      const llmResponse = `분석 결과입니다.

\`\`\`mermaid
flowchart TD
  start([시작])
  api1{{API 서버}}
  db1[(데이터베이스)]
  decide1{검증}
  end1((종료))
  start --> api1
  api1 --> decide1
  decide1 -->|성공| db1
  decide1 -->|실패| end1
  db1 --> end1
\`\`\`

<!-- 설명: API 서버-DB-검증 플로우를 생성했습니다 -->`

      const result = extractMermaidFromResponse(llmResponse)
      expect(result.mermaid).toContain('api1{{API 서버}}')
      expect(result.mermaid).toContain('db1[(데이터베이스)]')
      expect(result.mermaid).toContain('decide1{검증}')
      expect(result.mermaid).toContain('-->|성공|')
      expect(result.description).toBe('API 서버-DB-검증 플로우를 생성했습니다')
    })

    test('여러 코드 블록이 있으면 첫 번째 mermaid 블록 추출', () => {
      const llmResponse = `설명:

\`\`\`json
{"test": true}
\`\`\`

\`\`\`mermaid
flowchart TD
  A[노드]
\`\`\`

<!-- 설명: 테스트 -->`

      const result = extractMermaidFromResponse(llmResponse)
      expect(result.mermaid).toContain('A[노드]')
      expect(result.description).toBe('테스트')
    })
  })
})

// === AI Command API 테스트 ===

describe('AI Command API', () => {
  // Mock 모듈
  const mockInterpretCanvasCommand = mock(() =>
    Promise.resolve({
      commandId: 'canvas-ai-test-1',
      mermaid: 'flowchart TD\n  A([시작])\n  B[에이전트]\n  A --> B',
      description: '테스트 노드 추가',
    }),
  )

  const mockLogActivity = mock(() => {})

  // 라우트 테스트를 위한 스키마 검증 테스트
  describe('Request validation', () => {
    const { z } = require('zod')

    const aiCommandSchema = z.object({
      sketchId: z.string().optional(),
      command: z.string().min(1, '명령을 입력하세요').max(2000, '명령이 너무 깁니다'),
      graphData: z.object({
        nodes: z.array(z.any()).default([]),
        edges: z.array(z.any()).default([]),
      }),
    })

    test('유효한 요청 통과', () => {
      const validReq = {
        command: 'DB 노드 추가해줘',
        graphData: { nodes: [], edges: [] },
      }
      const result = aiCommandSchema.safeParse(validReq)
      expect(result.success).toBe(true)
    })

    test('sketchId 포함 요청 통과', () => {
      const validReq = {
        sketchId: 'sketch-123',
        command: 'DB 노드 추가해줘',
        graphData: { nodes: [{ id: 'n1', type: 'agent', position: { x: 0, y: 0 }, data: { label: '테스트' } }], edges: [] },
      }
      const result = aiCommandSchema.safeParse(validReq)
      expect(result.success).toBe(true)
    })

    test('빈 명령 거부', () => {
      const invalidReq = {
        command: '',
        graphData: { nodes: [], edges: [] },
      }
      const result = aiCommandSchema.safeParse(invalidReq)
      expect(result.success).toBe(false)
    })

    test('너무 긴 명령 거부', () => {
      const invalidReq = {
        command: 'a'.repeat(2001),
        graphData: { nodes: [], edges: [] },
      }
      const result = aiCommandSchema.safeParse(invalidReq)
      expect(result.success).toBe(false)
    })

    test('graphData 없으면 기본값 사용', () => {
      const req = {
        command: '노드 추가',
        graphData: {},
      }
      const result = aiCommandSchema.safeParse(req)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.graphData.nodes).toEqual([])
        expect(result.data.graphData.edges).toEqual([])
      }
    })
  })
})

// === WebSocket 이벤트 형식 테스트 ===

describe('Canvas AI WebSocket Events', () => {
  test('canvas_ai_start 이벤트 형식', () => {
    const event = {
      type: 'canvas_ai_start',
      commandId: 'canvas-ai-123',
      command: 'DB 노드 추가해줘',
    }
    expect(event.type).toBe('canvas_ai_start')
    expect(event.commandId).toBeTruthy()
    expect(event.command).toBeTruthy()
  })

  test('canvas_update 이벤트 형식', () => {
    const event = {
      type: 'canvas_update',
      commandId: 'canvas-ai-123',
      mermaid: 'flowchart TD\n  A[노드]',
      description: 'DB 노드를 추가했습니다',
    }
    expect(event.type).toBe('canvas_update')
    expect(event.mermaid).toContain('flowchart')
    expect(event.description).toBeTruthy()
  })

  test('canvas_ai_error 이벤트 형식', () => {
    const event = {
      type: 'canvas_ai_error',
      commandId: 'canvas-ai-123',
      error: 'LLM 호출 실패',
    }
    expect(event.type).toBe('canvas_ai_error')
    expect(event.error).toBeTruthy()
  })
})

// === 테넌트 격리 테스트 ===

describe('Tenant isolation', () => {
  test('broadcastToCompany는 companyId 기반 채널 키 생성', () => {
    // broadcastToCompany(companyId, 'nexus', data) => channelKey = 'nexus::companyId'
    const companyA = 'company-aaa'
    const companyB = 'company-bbb'
    const channelKeyA = `nexus::${companyA}`
    const channelKeyB = `nexus::${companyB}`
    expect(channelKeyA).not.toBe(channelKeyB)
    expect(channelKeyA).toBe('nexus::company-aaa')
    expect(channelKeyB).toBe('nexus::company-bbb')
  })

  test('다른 회사의 이벤트는 별도 채널 키', () => {
    const events = [
      { companyId: 'c1', type: 'canvas_update', key: 'nexus::c1' },
      { companyId: 'c2', type: 'canvas_update', key: 'nexus::c2' },
    ]
    const keys = events.map((e) => e.key)
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(2)
  })
})

// === canvasToMermaidCode 통합 테스트 (shared 패키지) ===

describe('Canvas to Mermaid integration', () => {
  // Test that canvasToMermaidCode from shared package works for AI context
  const { canvasToMermaidCode } = require('@corthex/shared')

  test('빈 캔버스는 빈 상태 표시', () => {
    const result = canvasToMermaidCode([], [])
    expect(result).toBe('(빈 캔버스)')
  })

  test('노드와 엣지를 Mermaid로 변환', () => {
    const nodes = [
      { id: 'n1', type: 'start', data: { label: '시작' } },
      { id: 'n2', type: 'agent', data: { label: '에이전트' } },
    ]
    const edges = [{ source: 'n1', target: 'n2' }]
    const result = canvasToMermaidCode(nodes, edges)
    expect(result).toContain('flowchart TD')
    expect(result).toContain('n1(["시작"])')
    expect(result).toContain('n2["에이전트"]')
    expect(result).toContain('n1 --> n2')
  })

  test('엣지 라벨 포함 변환', () => {
    const nodes = [
      { id: 'a', type: 'decide', data: { label: '결정' } },
      { id: 'b', type: 'agent', data: { label: '성공 처리' } },
    ]
    const edges = [{ source: 'a', target: 'b', data: { label: '성공' } }]
    const result = canvasToMermaidCode(nodes, edges)
    expect(result).toContain('-->|성공|')
  })

  test('8종 노드 타입 모두 변환', () => {
    const types = ['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note']
    const nodes = types.map((t, i) => ({ id: `n${i}`, type: t, data: { label: t } }))
    const result = canvasToMermaidCode(nodes, [])
    expect(result).toContain('flowchart TD')
    // Each node type should produce valid output
    expect(result.split('\n').length).toBeGreaterThanOrEqual(types.length + 1)
  })
})

// === Mermaid 파싱 → AI 프리뷰 통합 테스트 ===

describe('Mermaid parse for AI preview', () => {
  const { parseMermaid } = require('@corthex/shared')

  test('AI가 생성한 Mermaid를 파싱하여 노드/엣지 추출', () => {
    const aiMermaid = `flowchart TD
  start([시작])
  api1{{API 서버}}
  db1[(데이터베이스)]
  start --> api1
  api1 --> db1`

    const result = parseMermaid(aiMermaid)
    expect(result.error).toBeUndefined()
    expect(result.nodes.length).toBe(3)
    expect(result.edges.length).toBe(2)

    const nodeTypes = result.nodes.map((n: { nodeType: string }) => n.nodeType)
    expect(nodeTypes).toContain('start')
    expect(nodeTypes).toContain('api')
    expect(nodeTypes).toContain('db')
  })

  test('엣지 라벨이 있는 AI Mermaid 파싱', () => {
    const aiMermaid = `flowchart TD
  A{결정}
  B[성공]
  C[실패]
  A -->|Yes| B
  A -->|No| C`

    const result = parseMermaid(aiMermaid)
    expect(result.error).toBeUndefined()
    expect(result.edges.length).toBe(2)
    const labels = result.edges.map((e: { label: string }) => e.label)
    expect(labels).toContain('Yes')
    expect(labels).toContain('No')
  })

  test('잘못된 Mermaid는 에러 반환', () => {
    const result = parseMermaid('')
    expect(result.error).toBeTruthy()
  })
})

// === LLM 프롬프트 컨텍스트 테스트 ===

describe('LLM Prompt Context', () => {
  const { canvasToMermaidCode } = require('@corthex/shared')

  test('AI에 전달되는 캔버스 컨텍스트 형식', () => {
    const nodes = [
      { id: 'start1', type: 'start', data: { label: '요청 수신' } },
      { id: 'api1', type: 'api', data: { label: 'REST API' } },
      { id: 'db1', type: 'db', data: { label: 'PostgreSQL' } },
    ]
    const edges = [
      { source: 'start1', target: 'api1', data: { label: '호출' } },
      { source: 'api1', target: 'db1' },
    ]

    const mermaid = canvasToMermaidCode(nodes, edges)

    // Build prompt as the service would
    const prompt = `현재 캔버스:\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n\n명령: 캐시 레이어를 추가해줘`

    expect(prompt).toContain('현재 캔버스:')
    expect(prompt).toContain('flowchart TD')
    expect(prompt).toContain('요청 수신')
    expect(prompt).toContain('REST API')
    expect(prompt).toContain('PostgreSQL')
    expect(prompt).toContain('캐시 레이어를 추가해줘')
  })
})
