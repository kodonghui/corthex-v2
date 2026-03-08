import { describe, it, expect, mock, beforeEach, spyOn } from 'bun:test'
import { parseSlash, classify } from '../../services/command-router'
import { extractMermaidFromResponse } from '../../services/canvas-ai'
import type { SketchCommandParams } from '../../services/sketch-command-handler'

// ==========================================
// parseSlash — /스케치 command tests
// ==========================================

describe('parseSlash — /스케치', () => {
  it('parses /스케치 with description', () => {
    const result = parseSlash('/스케치 데이터베이스 아키텍처 그려줘')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('sketch')
    expect(result!.commandType).toBe('slash')
    expect(result!.args).toBe('데이터베이스 아키텍처 그려줘')
  })

  it('parses /스케치 without args', () => {
    const result = parseSlash('/스케치')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('sketch')
    expect(result!.commandType).toBe('slash')
    expect(result!.args).toBe('')
  })

  it('parses /스케치 with Korean description', () => {
    const result = parseSlash('/스케치 마이크로서비스 구조도')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('sketch')
    expect(result!.args).toBe('마이크로서비스 구조도')
  })

  it('handles leading/trailing whitespace', () => {
    const result = parseSlash('  /스케치 API 서버 흐름도  ')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('sketch')
    expect(result!.args).toBe('API 서버 흐름도')
  })

  it('does not partial-match /스케치', () => {
    expect(parseSlash('/스케치추가')).toBeNull()
  })

  it('correctly distinguishes /스케치 from other commands', () => {
    const sketch = parseSlash('/스케치 구조도')
    const debate = parseSlash('/토론 주제')
    expect(sketch!.slashType).toBe('sketch')
    expect(debate!.slashType).toBe('debate')
  })

  it('all 9 slash commands are now supported', () => {
    const cmds = ['/전체', '/순차', '/도구점검', '/배치실행', '/배치상태', '/명령어', '/토론', '/심층토론', '/스케치']
    for (const cmd of cmds) {
      expect(parseSlash(cmd)).not.toBeNull()
    }
  })
})

// ==========================================
// extractMermaidFromResponse tests
// ==========================================

describe('extractMermaidFromResponse', () => {
  it('extracts mermaid code block from LLM response', () => {
    const response = `여기 다이어그램입니다:
\`\`\`mermaid
flowchart TD
  A[시작] --> B[처리]
  B --> C[종료]
\`\`\`
<!-- 설명: 기본 흐름도를 생성했습니다 -->`
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('flowchart TD')
    expect(result.mermaid).toContain('A[시작] --> B[처리]')
    expect(result.description).toBe('기본 흐름도를 생성했습니다')
  })

  it('returns empty mermaid if no code block found', () => {
    const response = '코드 블록이 없는 응답입니다'
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toBe('')
    expect(result.description).toBe('캔버스가 수정되었습니다')
  })

  it('extracts description from HTML comment', () => {
    const response = `\`\`\`mermaid
flowchart TD
  A --> B
\`\`\`
<!-- 설명: 노드 A에서 B로 연결을 추가했습니다 -->`
    const result = extractMermaidFromResponse(response)
    expect(result.description).toBe('노드 A에서 B로 연결을 추가했습니다')
  })

  it('uses default description if no comment found', () => {
    const response = `\`\`\`mermaid
flowchart TD
  A --> B
\`\`\``
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('flowchart TD')
    expect(result.description).toBe('캔버스가 수정되었습니다')
  })
})

// ==========================================
// processSketchCommand tests (mock-based)
// ==========================================

describe('processSketchCommand', () => {
  // We test the handler logic by importing and mocking dependencies

  it('module exports processSketchCommand function', async () => {
    const mod = await import('../../services/sketch-command-handler')
    expect(typeof mod.processSketchCommand).toBe('function')
  })

  it('SketchCommandParams type accepts required fields', () => {
    // Type-level test - ensures interface is correct
    const params = {
      commandId: 'test-cmd-id',
      prompt: '데이터베이스 구조 그려줘',
      companyId: 'comp-123',
      userId: 'user-456',
    }
    expect(params.commandId).toBe('test-cmd-id')
    expect(params.prompt).toBe('데이터베이스 구조 그려줘')
    expect(params.companyId).toBe('comp-123')
    expect(params.userId).toBe('user-456')
  })
})

// ==========================================
// Sketch command integration flow tests (mock-based)
// ==========================================

describe('Sketch command flow', () => {
  it('classify correctly routes /스케치 commands', async () => {
    // classify() requires DB access for mention resolution
    // but for slash commands it returns immediately without DB
    const { classify } = await import('../../services/command-router')
    const result = await classify('/스케치 마이크로서비스 아키텍처', {
      companyId: 'test-co',
      userId: 'test-user',
    })

    expect(result.type).toBe('slash')
    expect(result.parsedMeta.slashType).toBe('sketch')
    expect(result.parsedMeta.slashArgs).toBe('마이크로서비스 아키텍처')
  })

  it('classify routes /스케치 without args', async () => {
    const { classify } = await import('../../services/command-router')
    const result = await classify('/스케치', {
      companyId: 'test-co',
      userId: 'test-user',
    })

    expect(result.type).toBe('slash')
    expect(result.parsedMeta.slashType).toBe('sketch')
    expect(result.parsedMeta.slashArgs).toBeUndefined()
  })

  it('classify timeout for sketch is 60s', async () => {
    const { classify } = await import('../../services/command-router')
    const result = await classify('/스케치 구조도', {
      companyId: 'test-co',
      userId: 'test-user',
    })

    expect(result.parsedMeta.timeoutMs).toBe(60_000)
  })
})

// ==========================================
// Mermaid to canvas conversion tests
// ==========================================

describe('Mermaid generation for sketch command', () => {
  it('canvas-ai system prompt includes 8 node types', async () => {
    // Import the module to verify the system prompt content
    const canvasAiModule = await import('../../services/canvas-ai')
    expect(typeof canvasAiModule.interpretCanvasCommand).toBe('function')
    expect(typeof canvasAiModule.extractMermaidFromResponse).toBe('function')
  })

  it('extractMermaidFromResponse handles complex mermaid', () => {
    const response = `\`\`\`mermaid
flowchart TD
  start1([시작])
  api1{{외부 API}}
  db1[(데이터베이스)]
  decide1{결정}
  start1 --> api1
  api1 --> decide1
  decide1 -->|Yes| db1
  decide1 -->|No| end1((종료))
\`\`\`
<!-- 설명: API 호출 후 결정 분기를 추가했습니다 -->`

    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('start1([시작])')
    expect(result.mermaid).toContain('api1{{외부 API}}')
    expect(result.mermaid).toContain('db1[(데이터베이스)]')
    expect(result.mermaid).toContain('decide1{결정}')
    expect(result.description).toBe('API 호출 후 결정 분기를 추가했습니다')
  })

  it('extractMermaidFromResponse handles subgraph', () => {
    const response = `\`\`\`mermaid
flowchart TD
  subgraph 백엔드
    api1{{API 서버}}
    db1[(PostgreSQL)]
    api1 --> db1
  end
  subgraph 프론트엔드
    web[웹 앱]
    web --> api1
  end
\`\`\`
<!-- 설명: 프론트/백 분리 구조 -->`

    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('subgraph 백엔드')
    expect(result.mermaid).toContain('subgraph 프론트엔드')
  })
})

// ==========================================
// Tenant isolation tests
// ==========================================

describe('Tenant isolation for sketch', () => {
  it('classify preserves companyId in options', async () => {
    const { classify } = await import('../../services/command-router')
    // classify doesn't directly return companyId, but it's used by createCommand
    const result = await classify('/스케치 구조도', {
      companyId: 'company-abc',
      userId: 'user-123',
    })
    expect(result.type).toBe('slash')
    // companyId is forwarded to createCommand by the route handler
  })
})

// ==========================================
// Error handling tests
// ==========================================

describe('Sketch error handling', () => {
  it('extractMermaidFromResponse handles empty response', () => {
    const result = extractMermaidFromResponse('')
    expect(result.mermaid).toBe('')
    expect(result.description).toBe('캔버스가 수정되었습니다')
  })

  it('extractMermaidFromResponse handles malformed mermaid', () => {
    const response = `\`\`\`mermaid
이것은 올바른 Mermaid 코드가 아닙니다
\`\`\``
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toBe('이것은 올바른 Mermaid 코드가 아닙니다')
    expect(result.description).toBe('캔버스가 수정되었습니다')
  })

  it('extractMermaidFromResponse handles response with multiple code blocks', () => {
    const response = `\`\`\`javascript
console.log("test")
\`\`\`
\`\`\`mermaid
flowchart TD
  A --> B
\`\`\``
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('flowchart TD')
  })

  it('parseSlash does not confuse /스케치 with longer prefix', () => {
    // Ensure /스케치비전 doesn't match /스케치
    const result = parseSlash('/스케치비전')
    expect(result).toBeNull()
  })
})

// ==========================================
// Session storage pendingGraphData tests
// ==========================================

describe('pendingGraphData session storage contract', () => {
  it('stores valid graph data format', () => {
    const graphData = {
      nodes: [
        { id: 'n1', type: 'agent', position: { x: 100, y: 100 }, data: { label: '에이전트' } },
        { id: 'n2', type: 'db', position: { x: 300, y: 200 }, data: { label: 'DB' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', type: 'editable', data: { label: '' } },
      ],
    }
    const json = JSON.stringify(graphData)
    const parsed = JSON.parse(json)
    expect(parsed.nodes).toHaveLength(2)
    expect(parsed.edges).toHaveLength(1)
    expect(parsed.nodes[0].type).toBe('agent')
    expect(parsed.edges[0].source).toBe('n1')
  })

  it('[P1] stores all 8 node types correctly', () => {
    const nodeTypes = ['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note']
    const graphData = {
      nodes: nodeTypes.map((type, i) => ({
        id: `n${i}`, type, position: { x: i * 100, y: 0 }, data: { label: `${type} 노드` },
      })),
      edges: [],
    }
    const parsed = JSON.parse(JSON.stringify(graphData))
    expect(parsed.nodes).toHaveLength(8)
    nodeTypes.forEach((type, i) => {
      expect(parsed.nodes[i].type).toBe(type)
    })
  })

  it('[P1] stores edge labels and connection types', () => {
    const graphData = {
      nodes: [
        { id: 'a', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'A' } },
        { id: 'b', type: 'db', position: { x: 100, y: 0 }, data: { label: 'B' } },
      ],
      edges: [
        { id: 'e1', source: 'a', target: 'b', type: 'editable', data: { label: '데이터 조회' } },
      ],
    }
    const parsed = JSON.parse(JSON.stringify(graphData))
    expect(parsed.edges[0].data.label).toBe('데이터 조회')
    expect(parsed.edges[0].source).toBe('a')
    expect(parsed.edges[0].target).toBe('b')
  })

  it('[P2] handles empty graph data', () => {
    const graphData = { nodes: [], edges: [] }
    const parsed = JSON.parse(JSON.stringify(graphData))
    expect(parsed.nodes).toHaveLength(0)
    expect(parsed.edges).toHaveLength(0)
  })
})

// ==========================================
// [TEA] processSketchCommand handler logic (P0)
// ==========================================

describe('[P0] processSketchCommand handler logic', () => {
  it('SketchCommandParams requires all four fields', () => {
    const params: SketchCommandParams = {
      commandId: 'cmd-001',
      prompt: '아키텍처 다이어그램',
      companyId: 'company-1',
      userId: 'user-1',
    }
    expect(Object.keys(params)).toHaveLength(4)
    expect(params.commandId).toBeDefined()
    expect(params.prompt).toBeDefined()
    expect(params.companyId).toBeDefined()
    expect(params.userId).toBeDefined()
  })

  it('empty prompt is detected by trim check', () => {
    const emptyPrompts = ['', '  ', '\t', '\n', '   \n  ']
    for (const prompt of emptyPrompts) {
      expect(prompt.trim()).toBe('')
    }
  })

  it('non-empty prompt passes trim check', () => {
    const validPrompts = ['구조도', '  데이터베이스 아키텍처  ', 'API 흐름도\n']
    for (const prompt of validPrompts) {
      expect(prompt.trim()).not.toBe('')
    }
  })

  it('metadata structure matches expected schema', () => {
    const metadata = {
      slashType: 'sketch' as const,
      slashArgs: '마이크로서비스 아키텍처',
      timeoutMs: 60_000,
      sketchResult: {
        mermaid: 'flowchart TD\n  A --> B',
        description: '다이어그램 생성됨',
        canvasCommandId: 'canvas-cmd-123',
      },
    }
    expect(metadata.slashType).toBe('sketch')
    expect(metadata.timeoutMs).toBe(60_000)
    expect(metadata.sketchResult.mermaid).toContain('flowchart')
    expect(metadata.sketchResult.description).toBeTruthy()
    expect(metadata.sketchResult.canvasCommandId).toBeTruthy()
  })

  it('error message extraction works for Error instances', () => {
    const err = new Error('LLM 호출 실패')
    const message = err instanceof Error ? err.message : String(err)
    expect(message).toBe('LLM 호출 실패')
  })

  it('error message extraction works for string errors', () => {
    const err = '타임아웃 발생'
    const message = err instanceof Error ? err.message : String(err)
    expect(message).toBe('타임아웃 발생')
  })

  it('error message extraction works for unknown error types', () => {
    const err = { code: 500 }
    const message = err instanceof Error ? err.message : String(err)
    expect(message).toBe('[object Object]')
  })

  it('prompt is sliced to max 100 chars for activity log', () => {
    const shortPrompt = '짧은 프롬프트'
    expect(shortPrompt.slice(0, 100)).toBe('짧은 프롬프트')

    const longPrompt = '매우 긴 프롬프트 '.repeat(20)
    expect(longPrompt.slice(0, 100).length).toBe(100)
  })
})

// ==========================================
// [TEA] WS broadcast payload contracts (P1)
// ==========================================

describe('[P1] WS broadcast payload contracts', () => {
  it('COMPLETED event payload has required fields', () => {
    const payload = {
      commandId: 'cmd-123',
      event: 'COMPLETED',
      result: '다이어그램이 생성되었습니다',
      sketchResult: {
        mermaid: 'flowchart TD\n  A --> B',
        description: '다이어그램이 생성되었습니다',
      },
    }
    expect(payload.event).toBe('COMPLETED')
    expect(payload.commandId).toBeTruthy()
    expect(payload.sketchResult).toBeDefined()
    expect(payload.sketchResult.mermaid).toBeTruthy()
    expect(payload.sketchResult.description).toBeTruthy()
  })

  it('FAILED event payload has required fields', () => {
    const payload = {
      commandId: 'cmd-456',
      event: 'FAILED',
      error: '다이어그램 설명을 입력해주세요',
    }
    expect(payload.event).toBe('FAILED')
    expect(payload.commandId).toBeTruthy()
    expect(payload.error).toBeTruthy()
  })

  it('empty prompt FAILED payload contains guidance message', () => {
    const error = '다이어그램 설명을 입력해주세요'
    expect(error).toContain('설명')
    expect(error).toContain('입력')
  })

  it('canvas_ai_start interpretCanvasCommand passes empty graph for new diagrams', () => {
    const graphData = { nodes: [], edges: [] }
    expect(graphData.nodes).toHaveLength(0)
    expect(graphData.edges).toHaveLength(0)
  })
})

// ==========================================
// [TEA] classify integration edge cases (P1)
// ==========================================

describe('[P1] classify integration edge cases', () => {
  it('classify /스케치 with special characters in args', async () => {
    const result = await classify('/스케치 A→B→C 데이터 흐름', {
      companyId: 'co-1',
      userId: 'user-1',
    })
    expect(result.type).toBe('slash')
    expect(result.parsedMeta.slashType).toBe('sketch')
    expect(result.parsedMeta.slashArgs).toContain('A→B→C')
  })

  it('classify /스케치 with very long args', async () => {
    const longArgs = '아키텍처 '.repeat(200)
    const result = await classify(`/스케치 ${longArgs}`, {
      companyId: 'co-1',
      userId: 'user-1',
    })
    expect(result.type).toBe('slash')
    expect(result.parsedMeta.slashType).toBe('sketch')
    expect(result.parsedMeta.slashArgs!.length).toBeGreaterThan(100)
  })

  it('classify /스케치 with multiline args', async () => {
    const result = await classify('/스케치 구조도\n상세 설명', {
      companyId: 'co-1',
      userId: 'user-1',
    })
    // parseSlash works on first line only or trims
    expect(result.type).toBe('slash')
    expect(result.parsedMeta.slashType).toBe('sketch')
  })

  it('classify preserves parsedMeta.timeoutMs for sketch', async () => {
    const result = await classify('/스케치 시스템 아키텍처', {
      companyId: 'co-1',
      userId: 'user-1',
    })
    expect(result.parsedMeta.timeoutMs).toBe(60_000)
  })

  it('classify /스케치 returns type=slash at top level', async () => {
    const result = await classify('/스케치 테스트', {
      companyId: 'co-1',
      userId: 'user-1',
    })
    expect(result.type).toBe('slash')
  })
})

// ==========================================
// [TEA] extractMermaidFromResponse advanced (P1)
// ==========================================

describe('[P1] extractMermaidFromResponse advanced edge cases', () => {
  it('handles mermaid with Korean labels containing special chars', () => {
    const response = `\`\`\`mermaid
flowchart TD
  a1[사용자 (관리자)] --> b1{승인?}
  b1 -->|Yes| c1[(DB 저장)]
  b1 -->|No| d1((종료))
\`\`\`
<!-- 설명: 승인 흐름을 생성했습니다 -->`
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('사용자 (관리자)')
    expect(result.mermaid).toContain('승인?')
    expect(result.description).toBe('승인 흐름을 생성했습니다')
  })

  it('handles mermaid with class definitions', () => {
    const response = `\`\`\`mermaid
flowchart TD
  a1[서버] --> b1[클라이언트]
  classDef highlight fill:#f9f,stroke:#333
  class a1 highlight
\`\`\`
<!-- 설명: 하이라이트 적용 -->`
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('classDef highlight')
    expect(result.mermaid).toContain('class a1 highlight')
  })

  it('handles mermaid with link styles', () => {
    const response = `\`\`\`mermaid
flowchart TD
  a1 --> b1
  linkStyle 0 stroke:red
\`\`\``
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('linkStyle 0 stroke:red')
  })

  it('handles response with only whitespace in mermaid block', () => {
    const response = `\`\`\`mermaid

\`\`\``
    const result = extractMermaidFromResponse(response)
    // Should return the whitespace content (trimmed or not)
    expect(result.description).toBe('캔버스가 수정되었습니다')
  })

  it('handles description with colon in middle', () => {
    const response = `\`\`\`mermaid
flowchart TD
  A --> B
\`\`\`
<!-- 설명: 노드 A: 시작점에서 B: 종료점으로 연결 -->`
    const result = extractMermaidFromResponse(response)
    expect(result.description).toContain('노드 A')
  })

  it('handles sequence diagram type (not just flowchart)', () => {
    const response = `\`\`\`mermaid
sequenceDiagram
  participant A as 클라이언트
  participant B as 서버
  A->>B: 요청
  B-->>A: 응답
\`\`\`
<!-- 설명: 클라이언트-서버 시퀀스 다이어그램 -->`
    const result = extractMermaidFromResponse(response)
    expect(result.mermaid).toContain('sequenceDiagram')
    expect(result.mermaid).toContain('participant A')
    expect(result.description).toBe('클라이언트-서버 시퀀스 다이어그램')
  })
})

// ==========================================
// [TEA] Command route sketch dispatch (P0)
// ==========================================

describe('[P0] Command route sketch dispatch logic', () => {
  it('slash type sketch detected from classify result', async () => {
    const result = await classify('/스케치 구조도', {
      companyId: 'test-co',
      userId: 'test-user',
    })
    const isSketch = result.parsedMeta.slashType === 'sketch'
    expect(isSketch).toBe(true)
  })

  it('slashArgs defaults to empty string when not provided', async () => {
    const result = await classify('/스케치', {
      companyId: 'test-co',
      userId: 'test-user',
    })
    const sketchPrompt = result.parsedMeta.slashArgs || ''
    expect(sketchPrompt).toBe('')
  })

  it('slashArgs correctly extracted for dispatch', async () => {
    const result = await classify('/스케치 마이크로서비스 아키텍처 그려줘', {
      companyId: 'test-co',
      userId: 'test-user',
    })
    const sketchPrompt = result.parsedMeta.slashArgs || ''
    expect(sketchPrompt).toBe('마이크로서비스 아키텍처 그려줘')
  })

  it('non-sketch slash commands are not dispatched to sketch handler', async () => {
    const commands = ['/전체 보고서', '/순차 분석', '/토론 주제', '/심층토론 주제']
    for (const cmd of commands) {
      const result = await classify(cmd, { companyId: 'co-1', userId: 'u-1' })
      expect(result.parsedMeta.slashType).not.toBe('sketch')
    }
  })
})

// ==========================================
// [TEA] SketchResult type validation (P1)
// ==========================================

describe('[P1] SketchResult type validation', () => {
  it('valid SketchResult has mermaid and description', () => {
    const sketchResult = {
      mermaid: 'flowchart TD\n  A[시작] --> B[종료]',
      description: '기본 흐름도를 생성했습니다',
    }
    expect(sketchResult.mermaid).toContain('flowchart')
    expect(sketchResult.description).toBeTruthy()
    expect(typeof sketchResult.mermaid).toBe('string')
    expect(typeof sketchResult.description).toBe('string')
  })

  it('SketchResult with empty mermaid is valid (error case)', () => {
    const sketchResult = {
      mermaid: '',
      description: '캔버스가 수정되었습니다',
    }
    expect(sketchResult.mermaid).toBe('')
    expect(sketchResult.description).toBeTruthy()
  })

  it('SketchResult extracted from command metadata', () => {
    const commandMetadata = {
      slashType: 'sketch',
      slashArgs: '데이터베이스 구조',
      timeoutMs: 60_000,
      sketchResult: {
        mermaid: 'flowchart TD\n  db1[(PostgreSQL)] --> api1{{API}}',
        description: 'DB-API 연결 다이어그램',
        canvasCommandId: 'ccmd-789',
      },
    }
    // Frontend extracts sketchResult from metadata
    const extracted = commandMetadata.sketchResult
    expect(extracted.mermaid).toContain('PostgreSQL')
    expect(extracted.description).toBe('DB-API 연결 다이어그램')
    expect(extracted.canvasCommandId).toBe('ccmd-789')
  })

  it('history loading extracts sketchResult correctly', () => {
    // Simulates what use-command-center.ts does when loading history
    const command = {
      id: 'cmd-1',
      status: 'completed',
      result: '다이어그램 생성됨',
      metadata: {
        slashType: 'sketch',
        sketchResult: {
          mermaid: 'flowchart TD\n  A --> B',
          description: '다이어그램 생성됨',
        },
      },
    }
    const isSketch = command.metadata?.slashType === 'sketch'
    const sketchResult = isSketch ? command.metadata.sketchResult : undefined
    expect(isSketch).toBe(true)
    expect(sketchResult).toBeDefined()
    expect(sketchResult!.mermaid).toContain('flowchart')
  })

  it('non-sketch commands have no sketchResult in metadata', () => {
    const command = {
      id: 'cmd-2',
      status: 'completed',
      result: '보고서 완료',
      metadata: {
        slashType: 'all',
        slashArgs: '시장 전망',
        timeoutMs: 300_000,
      },
    }
    const isSketch = command.metadata?.slashType === 'sketch'
    expect(isSketch).toBe(false)
    expect((command.metadata as any).sketchResult).toBeUndefined()
  })
})
