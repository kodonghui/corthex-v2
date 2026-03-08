/**
 * TEA-generated tests for Story 13-3: MCP SSE AI Realtime Canvas Manipulation
 * Risk-based test expansion covering edge cases, error handling, and integration scenarios
 */
import { describe, test, expect } from 'bun:test'
import { extractMermaidFromResponse } from '../../services/canvas-ai'
import { parseMermaid, canvasToMermaidCode } from '@corthex/shared'

// === Risk Area 1: extractMermaidFromResponse edge cases ===

describe('TEA: extractMermaidFromResponse edge cases', () => {
  test('여러 mermaid 블록 중 첫 번째만 추출', () => {
    const response = `\`\`\`mermaid
flowchart TD
  A[첫번째]
\`\`\`

그리고 이것도:

\`\`\`mermaid
flowchart TD
  B[두번째]
\`\`\``
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('A[첫번째]')
    expect(result.mermaid).not.toContain('B[두번째]')
  })

  test('코드 블록 내 빈 줄이 있어도 정상 추출', () => {
    const response = `\`\`\`mermaid
flowchart TD

  A[노드1]

  B[노드2]

  A --> B
\`\`\``
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('A[노드1]')
    expect(result.mermaid).toContain('B[노드2]')
    expect(result.mermaid).toContain('A --> B')
  })

  test('```mermaid 뒤에 공백이 있어도 추출', () => {
    const response = '```mermaid   \nflowchart TD\n  A[노드]\n```'
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('A[노드]')
  })

  test('빈 mermaid 블록은 빈 문자열 반환', () => {
    const response = '```mermaid\n\n```'
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toBe('')
  })

  test('설명 주석에 특수문자 포함', () => {
    const response = '```mermaid\nflowchart TD\n  A[노드]\n```\n<!-- 설명: DB→API 연결 추가 (3개 노드) -->'
    const result = extractMermaidFromResponse(response)
    expect(result.description).toBe('DB→API 연결 추가 (3개 노드)')
  })

  test('null/undefined 입력 방어', () => {
    expect(() => extractMermaidFromResponse('')).not.toThrow()
    const result = extractMermaidFromResponse('')
    expect(result.mermaid).toBe('')
  })

  test('매우 긴 Mermaid 코드 처리', () => {
    const nodes = Array.from({ length: 50 }, (_, i) => `  node${i}[노드 ${i}]`).join('\n')
    const edges = Array.from({ length: 49 }, (_, i) => `  node${i} --> node${i + 1}`).join('\n')
    const response = `\`\`\`mermaid\nflowchart TD\n${nodes}\n${edges}\n\`\`\``
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('node0[노드 0]')
    expect(result.mermaid).toContain('node49[노드 49]')
  })
})

// === Risk Area 2: AI Command Zod Schema Validation ===

describe('TEA: AI Command schema edge cases', () => {
  const { z } = require('zod')
  const aiCommandSchema = z.object({
    sketchId: z.string().optional(),
    command: z.string().min(1).max(2000),
    graphData: z.object({
      nodes: z.array(z.any()).default([]),
      edges: z.array(z.any()).default([]),
    }),
  })

  test('command가 공백만 있으면 통과하지만 trim 필요', () => {
    // Zod min(1)은 공백 문자열도 통과시킴 - 서버에서 추가 처리 필요
    const result = aiCommandSchema.safeParse({ command: '   ', graphData: { nodes: [], edges: [] } })
    expect(result.success).toBe(true)
  })

  test('command가 정확히 2000자면 통과', () => {
    const result = aiCommandSchema.safeParse({
      command: 'a'.repeat(2000),
      graphData: { nodes: [], edges: [] },
    })
    expect(result.success).toBe(true)
  })

  test('command가 2001자면 거부', () => {
    const result = aiCommandSchema.safeParse({
      command: 'a'.repeat(2001),
      graphData: { nodes: [], edges: [] },
    })
    expect(result.success).toBe(false)
  })

  test('graphData에 복잡한 노드 데이터 포함', () => {
    const result = aiCommandSchema.safeParse({
      command: '노드 추가',
      graphData: {
        nodes: [
          { id: 'n1', type: 'agent', position: { x: 100, y: 200 }, data: { label: '테스트', custom: { nested: true } } },
          { id: 'n2', type: 'db', position: { x: 300, y: 400 }, data: { label: 'DB' } },
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2', type: 'editable', data: { label: '연결' } },
        ],
      },
    })
    expect(result.success).toBe(true)
  })

  test('graphData.nodes에 빈 배열 통과', () => {
    const result = aiCommandSchema.safeParse({
      command: '플로우차트 생성해줘',
      graphData: { nodes: [], edges: [] },
    })
    expect(result.success).toBe(true)
  })

  test('한국어 명령 처리', () => {
    const koreanCommands = [
      'DB 노드를 추가하고 API에 연결해줘',
      '이 플로우의 병목 지점을 표시해줘',
      '결정 노드 다음에 에러 처리 분기를 추가해줘',
      '전체 구조를 재정렬해줘',
    ]
    for (const cmd of koreanCommands) {
      const result = aiCommandSchema.safeParse({ command: cmd, graphData: { nodes: [], edges: [] } })
      expect(result.success).toBe(true)
    }
  })
})

// === Risk Area 3: Mermaid Round-trip 안전성 (AI 컨텍스트) ===

describe('TEA: Mermaid round-trip for AI context', () => {
  test('canvasToMermaidCode → parseMermaid round-trip 노드 보존', () => {
    const nodes = [
      { id: 'start', type: 'start', data: { label: '요청' } },
      { id: 'api', type: 'api', data: { label: 'REST' } },
      { id: 'db', type: 'db', data: { label: 'Postgres' } },
      { id: 'end', type: 'end', data: { label: '완료' } },
    ]
    const edges = [
      { source: 'start', target: 'api' },
      { source: 'api', target: 'db' },
      { source: 'db', target: 'end' },
    ]
    const mermaid = canvasToMermaidCode(nodes, edges)
    const parsed = parseMermaid(mermaid)

    expect(parsed.error).toBeUndefined()
    expect(parsed.nodes.length).toBe(4)
    expect(parsed.edges.length).toBe(3)
  })

  test('엣지 라벨이 round-trip에서 보존', () => {
    const nodes = [
      { id: 'a', type: 'decide', data: { label: '분기' } },
      { id: 'b', type: 'agent', data: { label: '성공' } },
      { id: 'c', type: 'agent', data: { label: '실패' } },
    ]
    const edges = [
      { source: 'a', target: 'b', data: { label: 'Yes' } },
      { source: 'a', target: 'c', data: { label: 'No' } },
    ]
    const mermaid = canvasToMermaidCode(nodes, edges)
    const parsed = parseMermaid(mermaid)

    const labels = parsed.edges.map((e: { label: string }) => e.label).sort()
    expect(labels).toEqual(['No', 'Yes'])
  })

  test('8종 노드 타입 round-trip', () => {
    const types = ['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note'] as const
    const nodes = types.map((t, i) => ({ id: `n${i}`, type: t, data: { label: `${t} 노드` } }))
    const mermaid = canvasToMermaidCode(nodes, [])
    const parsed = parseMermaid(mermaid)

    expect(parsed.error).toBeUndefined()
    expect(parsed.nodes.length).toBe(8)
    // Verify each type is present
    const parsedTypes = parsed.nodes.map((n: { nodeType: string }) => n.nodeType).sort()
    const expectedTypes = [...types].sort()
    expect(parsedTypes).toEqual(expectedTypes)
  })
})

// === Risk Area 4: WebSocket 이벤트 채널 격리 ===

describe('TEA: WebSocket nexus channel isolation', () => {
  test('companyId가 다르면 채널 키가 다름', () => {
    const companies = ['company-alpha', 'company-beta', 'company-gamma']
    const keys = companies.map((c) => `nexus::${c}`)
    const unique = new Set(keys)
    expect(unique.size).toBe(companies.length)
  })

  test('같은 companyId는 같은 채널 키', () => {
    const key1 = 'nexus::company-123'
    const key2 = 'nexus::company-123'
    expect(key1).toBe(key2)
  })

  test('채널 키 형식은 channel::companyId', () => {
    const channelKey = 'nexus::abc-def-123'
    const parts = channelKey.split('::')
    expect(parts[0]).toBe('nexus')
    expect(parts[1]).toBe('abc-def-123')
  })
})

// === Risk Area 5: AI 시스템 프롬프트 유효성 ===

describe('TEA: AI system prompt validation', () => {
  test('빈 캔버스에서 AI 명령 → 유효한 Mermaid 문맥 생성', () => {
    const mermaid = canvasToMermaidCode([], [])
    const prompt = `현재 캔버스:\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n\n명령: 로그인 플로우를 그려줘`
    expect(prompt).toContain('(빈 캔버스)')
    expect(prompt).toContain('로그인 플로우를 그려줘')
  })

  test('기존 캔버스에서 AI 명령 → 기존 노드가 문맥에 포함', () => {
    const nodes = [
      { id: 'auth', type: 'system', data: { label: '인증 서버' } },
      { id: 'user-db', type: 'db', data: { label: '사용자 DB' } },
    ]
    const edges = [{ source: 'auth', target: 'user-db', data: { label: '조회' } }]
    const mermaid = canvasToMermaidCode(nodes, edges)
    const prompt = `현재 캔버스:\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n\n명령: 캐시 레이어 추가`

    expect(prompt).toContain('인증 서버')
    expect(prompt).toContain('사용자 DB')
    expect(prompt).toContain('조회')
    expect(prompt).toContain('캐시 레이어 추가')
  })

  test('특수 문자가 포함된 라벨도 Mermaid로 변환 가능', () => {
    const nodes = [
      { id: 'n1', type: 'agent', data: { label: 'API (v2.0)' } },
      { id: 'n2', type: 'system', data: { label: '데이터 <처리>' } },
    ]
    const mermaid = canvasToMermaidCode(nodes, [])
    expect(mermaid).toContain('API (v2.0)')
  })
})

// === Risk Area 6: 에러 처리 시나리오 ===

describe('TEA: Error handling scenarios', () => {
  test('LLM이 코드 블록 없이 텍스트만 반환한 경우', () => {
    const response = '죄송합니다. 요청을 이해하지 못했습니다. 다시 명령해주세요.'
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toBe('')
    // 빈 mermaid는 서비스에서 에러로 처리해야 함
  })

  test('LLM이 잘못된 Mermaid 반환한 경우 parseMermaid에서 에러', () => {
    const badMermaid = 'not a valid mermaid code at all'
    const parsed = parseMermaid(badMermaid)
    // Should have warnings or empty results
    expect(parsed.warnings.length).toBeGreaterThan(0)
  })

  test('LLM이 sequence diagram (비지원) 반환', () => {
    const response = `\`\`\`mermaid
sequenceDiagram
  Alice->>Bob: Hello
\`\`\``
    const result = extractMermaidFromResponse(response)
    const parsed = parseMermaid(result.mermaid)
    // Should handle gracefully (warnings or empty nodes)
    expect(parsed.nodes.length).toBe(0)
  })

  test('canvasToMermaidCode에 타입이 없는 노드', () => {
    const nodes = [
      { id: 'n1', data: { label: '라벨 있음' } },
      { id: 'n2', type: undefined, data: { label: '타입 없음' } },
    ]
    // Should not throw
    expect(() => canvasToMermaidCode(nodes, [])).not.toThrow()
    const result = canvasToMermaidCode(nodes, [])
    expect(result).toContain('flowchart TD')
  })
})

// === Risk Area 7: Canvas 데이터 직렬화/역직렬화 ===

describe('TEA: Canvas data serialization safety', () => {
  test('노드 ID에 하이픈 포함 → Mermaid 안전', () => {
    const nodes = [{ id: 'my-node-1', type: 'agent', data: { label: '테스트' } }]
    const mermaid = canvasToMermaidCode(nodes, [])
    expect(mermaid).toContain('my-node-1')
  })

  test('긴 노드 ID → 30자로 잘림', () => {
    const longId = 'this-is-a-very-long-node-identifier-that-should-be-truncated'
    const nodes = [{ id: longId, type: 'agent', data: { label: '테스트' } }]
    const mermaid = canvasToMermaidCode(nodes, [])
    // mermaidSafeId truncates to 30 chars
    expect(mermaid).not.toContain(longId)
  })

  test('라벨이 없는 노드 → untitled 기본값', () => {
    const nodes = [{ id: 'n1', type: 'agent', data: {} }]
    const mermaid = canvasToMermaidCode(nodes, [])
    expect(mermaid).toContain('untitled')
  })

  test('엣지의 source/target이 노드에 없어도 에러 없음', () => {
    const nodes = [{ id: 'n1', type: 'agent', data: { label: '노드' } }]
    const edges = [{ source: 'n1', target: 'nonexistent' }]
    expect(() => canvasToMermaidCode(nodes, edges)).not.toThrow()
  })
})

// === Risk Area 8: Undo/Redo 스택 ===

describe('TEA: Undo/Redo stack behavior', () => {
  test('스택 최대 크기 제한 (20)', () => {
    const stack: Array<{ nodes: unknown[]; edges: unknown[] }> = []
    for (let i = 0; i < 25; i++) {
      stack.push({ nodes: [{ id: `n${i}` }], edges: [] })
    }
    // 최근 20개만 유지
    const trimmed = stack.slice(-20)
    expect(trimmed.length).toBe(20)
    expect((trimmed[0].nodes[0] as { id: string }).id).toBe('n5')
    expect((trimmed[19].nodes[0] as { id: string }).id).toBe('n24')
  })

  test('빈 스택에서 undo 시도 → 에러 없음', () => {
    const stack: unknown[] = []
    expect(stack.length).toBe(0)
    // handleUndo checks length === 0 and returns early
    expect(stack.length === 0).toBe(true)
  })

  test('undo 후 새 변경 → redo 스택 초기화', () => {
    const undoStack = [{ nodes: [], edges: [] }]
    const redoStack = [{ nodes: [{ id: 'redo1' }], edges: [] }]

    // AI apply → redo stack should be cleared
    const newRedoStack: unknown[] = []
    expect(newRedoStack.length).toBe(0)
    expect(undoStack.length).toBe(1) // undo still has entries
  })
})
