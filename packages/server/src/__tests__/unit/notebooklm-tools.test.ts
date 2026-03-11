/**
 * NotebookLM MCP 도구 TEA 리스크 기반 테스트 — Story 11.1
 *
 * Risk Matrix:
 * R1 (Critical): Bridge 프로세스 실패/타임아웃 → 서버 행 방지
 * R2 (Critical): 자격증명 누락 → 명확한 에러 메시지 반환
 * R3 (High): 잘못된 입력 → graceful 에러 처리
 * R4 (High): JSON 파싱 실패 → 의미 있는 에러
 * R5 (Medium): 정상 동작 → 올바른 JSON 응답 형식
 * R6 (Medium): 레지스트리 등록 → 6개 도구 모두 접근 가능
 *
 * bun test src/__tests__/unit/notebooklm-tools.test.ts
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'
import type { ToolExecContext } from '../../lib/tool-handlers/types'

// ═══════════════════════════════════════════════════════════════
// Test Context Factory
// ═══════════════════════════════════════════════════════════════

function createMockCtx(overrides: Partial<ToolExecContext> = {}): ToolExecContext {
  return {
    companyId: 'test-company',
    agentId: 'test-agent',
    sessionId: 'test-session',
    departmentId: 'test-dept',
    userId: 'test-user',
    getCredentials: mock(() =>
      Promise.resolve({ oauth_token: 'mock-google-token', api_key: 'mock-key' }),
    ),
    ...overrides,
  }
}

function createFailingCredCtx(): ToolExecContext {
  return createMockCtx({
    getCredentials: mock(() => Promise.reject(new Error('No credentials'))),
  })
}

// ═══════════════════════════════════════════════════════════════
// Mock: Python Bridge (child_process.spawn)
// ═══════════════════════════════════════════════════════════════

let mockBridgeResponse: Record<string, unknown> = { success: true, notebookId: 'nb-123' }
let mockBridgeError: Error | null = null

mock.module('../../lib/notebooklm/bridge', () => ({
  callNotebookLM: mock(async () => {
    if (mockBridgeError) throw mockBridgeError
    return mockBridgeResponse
  }),
}))

// ═══════════════════════════════════════════════════════════════
// Import handlers (after mock setup)
// ═══════════════════════════════════════════════════════════════

const { notebooklmCreateNotebook } = await import(
  '../../lib/tool-handlers/builtins/notebooklm-create-notebook'
)
const { notebooklmAddSource } = await import(
  '../../lib/tool-handlers/builtins/notebooklm-add-source'
)
const { notebooklmGenerateAudio } = await import(
  '../../lib/tool-handlers/builtins/notebooklm-generate-audio'
)
const { notebooklmGetMindmap } = await import(
  '../../lib/tool-handlers/builtins/notebooklm-get-mindmap'
)
const { notebooklmCreateSlides } = await import(
  '../../lib/tool-handlers/builtins/notebooklm-create-slides'
)
const { notebooklmSummarize } = await import(
  '../../lib/tool-handlers/builtins/notebooklm-summarize'
)

// ═══════════════════════════════════════════════════════════════
// R2: 자격증명 누락 테스트 (Critical)
// ═══════════════════════════════════════════════════════════════

describe('R2: 자격증명 누락 — 모든 도구', () => {
  const failCtx = createFailingCredCtx()

  test('notebooklm_create_notebook — 자격증명 없으면 명확한 에러', async () => {
    const result = JSON.parse(
      await notebooklmCreateNotebook(
        { sources: [{ type: 'text', content: 'test' }] },
        failCtx,
      ),
    )
    expect(result.success).toBe(false)
    expect(result.message).toContain('자격증명')
  })

  test('notebooklm_add_source — 자격증명 없으면 에러', async () => {
    const result = JSON.parse(
      await notebooklmAddSource(
        { notebookId: 'nb-1', sources: [{ type: 'text', content: 'test' }] },
        failCtx,
      ),
    )
    expect(result.success).toBe(false)
    expect(result.message).toContain('자격증명')
  })

  test('notebooklm_generate_audio — 자격증명 없으면 에러', async () => {
    const result = JSON.parse(
      await notebooklmGenerateAudio({ text: 'test' }, failCtx),
    )
    expect(result.success).toBe(false)
    expect(result.message).toContain('자격증명')
  })

  test('notebooklm_get_mindmap — 자격증명 없으면 에러', async () => {
    const result = JSON.parse(
      await notebooklmGetMindmap({ text: 'test' }, failCtx),
    )
    expect(result.success).toBe(false)
    expect(result.message).toContain('자격증명')
  })

  test('notebooklm_create_slides — 자격증명 없으면 에러', async () => {
    const result = JSON.parse(
      await notebooklmCreateSlides({ text: 'test' }, failCtx),
    )
    expect(result.success).toBe(false)
    expect(result.message).toContain('자격증명')
  })

  test('notebooklm_summarize — 자격증명 없으면 에러', async () => {
    const result = JSON.parse(
      await notebooklmSummarize({ text: 'test' }, failCtx),
    )
    expect(result.success).toBe(false)
    expect(result.message).toContain('자격증명')
  })
})

// ═══════════════════════════════════════════════════════════════
// R3: 잘못된 입력 테스트 (High)
// ═══════════════════════════════════════════════════════════════

describe('R3: 잘못된 입력 — graceful 에러 처리', () => {
  const ctx = createMockCtx()

  test('create_notebook — sources 누락', async () => {
    const result = JSON.parse(await notebooklmCreateNotebook({}, ctx))
    expect(result.success).toBe(false)
    expect(result.message).toContain('소스')
  })

  test('create_notebook — sources 빈 배열', async () => {
    const result = JSON.parse(await notebooklmCreateNotebook({ sources: [] }, ctx))
    expect(result.success).toBe(false)
    expect(result.message).toContain('소스')
  })

  test('create_notebook — sources가 배열이 아님', async () => {
    const result = JSON.parse(await notebooklmCreateNotebook({ sources: 'not-array' }, ctx))
    expect(result.success).toBe(false)
    expect(result.message).toContain('소스')
  })

  test('create_notebook — 50개 소스 제한 초과', async () => {
    const sources = Array.from({ length: 51 }, (_, i) => ({
      type: 'text',
      content: `source ${i}`,
    }))
    const result = JSON.parse(await notebooklmCreateNotebook({ sources }, ctx))
    expect(result.success).toBe(false)
    expect(result.message).toContain('50')
  })

  test('add_source — notebookId 누락', async () => {
    const result = JSON.parse(
      await notebooklmAddSource({ sources: [{ type: 'text', content: 'x' }] }, ctx),
    )
    expect(result.success).toBe(false)
    expect(result.message).toContain('notebookId')
  })

  test('add_source — sources 누락', async () => {
    const result = JSON.parse(await notebooklmAddSource({ notebookId: 'nb-1' }, ctx))
    expect(result.success).toBe(false)
    expect(result.message).toContain('소스')
  })

  test('generate_audio — notebookId와 text 둘 다 없음', async () => {
    const result = JSON.parse(await notebooklmGenerateAudio({}, ctx))
    expect(result.success).toBe(false)
    expect(result.message).toContain('notebookId')
  })

  test('get_mindmap — notebookId와 text 둘 다 없음', async () => {
    const result = JSON.parse(await notebooklmGetMindmap({}, ctx))
    expect(result.success).toBe(false)
    expect(result.message).toContain('notebookId')
  })

  test('create_slides — notebookId와 text 둘 다 없음', async () => {
    const result = JSON.parse(await notebooklmCreateSlides({}, ctx))
    expect(result.success).toBe(false)
    expect(result.message).toContain('notebookId')
  })

  test('summarize — notebookId와 text 둘 다 없음', async () => {
    const result = JSON.parse(await notebooklmSummarize({}, ctx))
    expect(result.success).toBe(false)
    expect(result.message).toContain('notebookId')
  })
})

// ═══════════════════════════════════════════════════════════════
// R5: 정상 동작 테스트 (Medium)
// ═══════════════════════════════════════════════════════════════

describe('R5: 정상 동작 — 올바른 JSON 응답 형식', () => {
  const ctx = createMockCtx()

  beforeEach(() => {
    mockBridgeError = null
  })

  test('create_notebook — 정상 생성', async () => {
    mockBridgeResponse = { success: true, notebookId: 'nb-abc' }
    const result = JSON.parse(
      await notebooklmCreateNotebook(
        { title: '테스트 노트북', sources: [{ type: 'text', content: '내용' }] },
        ctx,
      ),
    )
    expect(result.success).toBe(true)
    expect(result.notebookId).toBe('nb-abc')
    expect(result.message).toContain('테스트 노트북')
  })

  test('add_source — 정상 추가', async () => {
    mockBridgeResponse = { success: true, notebookId: 'nb-abc', outputData: { addedCount: 2 } }
    const result = JSON.parse(
      await notebooklmAddSource(
        { notebookId: 'nb-abc', sources: [{ type: 'url', content: 'https://example.com' }] },
        ctx,
      ),
    )
    expect(result.success).toBe(true)
    expect(result.message).toContain('추가')
  })

  test('generate_audio — 정상 생성', async () => {
    mockBridgeResponse = {
      success: true,
      notebookId: 'nb-abc',
      outputUrl: 'https://audio.url/briefing.mp3',
      outputData: { durationSeconds: 300, style: 'briefing' },
    }
    const result = JSON.parse(
      await notebooklmGenerateAudio(
        { notebookId: 'nb-abc', style: 'briefing', topic: '시황' },
        ctx,
      ),
    )
    expect(result.success).toBe(true)
    expect(result.audioUrl).toBe('https://audio.url/briefing.mp3')
    expect(result.style).toBe('briefing')
  })

  test('generate_audio — text로 직접 생성', async () => {
    mockBridgeResponse = {
      success: true,
      outputUrl: 'https://audio.url/text.mp3',
      outputData: { durationSeconds: 120 },
    }
    const result = JSON.parse(
      await notebooklmGenerateAudio(
        { text: '오늘 시장은 상승세입니다.', style: 'deep_dive' },
        ctx,
      ),
    )
    expect(result.success).toBe(true)
    expect(result.audioUrl).toContain('audio')
    expect(result.style).toBe('deep_dive')
  })

  test('generate_audio — 잘못된 style은 briefing 기본값', async () => {
    mockBridgeResponse = { success: true, outputUrl: 'url', outputData: {} }
    const result = JSON.parse(
      await notebooklmGenerateAudio({ text: 'test', style: 'invalid' }, ctx),
    )
    expect(result.success).toBe(true)
    expect(result.style).toBe('briefing')
  })

  test('get_mindmap — mermaid 형식', async () => {
    mockBridgeResponse = {
      success: true,
      notebookId: 'nb-abc',
      outputData: 'graph TD\n  A[Start] --> B[End]',
    }
    const result = JSON.parse(
      await notebooklmGetMindmap({ notebookId: 'nb-abc', format: 'mermaid' }, ctx),
    )
    expect(result.success).toBe(true)
    expect(result.format).toBe('mermaid')
    expect(result.mindmapData).toContain('graph')
  })

  test('get_mindmap — json 형식', async () => {
    mockBridgeResponse = {
      success: true,
      outputData: { nodes: [{ id: '1', label: 'Root' }] },
    }
    const result = JSON.parse(
      await notebooklmGetMindmap({ text: '구조 분석', format: 'json' }, ctx),
    )
    expect(result.success).toBe(true)
    expect(result.format).toBe('json')
  })

  test('get_mindmap — 잘못된 format은 mermaid 기본값', async () => {
    mockBridgeResponse = { success: true, outputData: 'graph' }
    const result = JSON.parse(
      await notebooklmGetMindmap({ text: 'test', format: 'svg' }, ctx),
    )
    expect(result.format).toBe('mermaid')
  })

  test('create_slides — 정상 생성', async () => {
    mockBridgeResponse = {
      success: true,
      outputUrl: 'https://slides.url/deck.pptx',
      outputData: { slideCount: 10, style: 'professional' },
    }
    const result = JSON.parse(
      await notebooklmCreateSlides(
        { text: '보고서', slideCount: 10, style: 'professional' },
        ctx,
      ),
    )
    expect(result.success).toBe(true)
    expect(result.slidesUrl).toContain('slides')
    expect(result.slideCount).toBe(10)
    expect(result.style).toBe('professional')
  })

  test('create_slides — slideCount 경계값 (1~50)', async () => {
    mockBridgeResponse = { success: true, outputUrl: 'url', outputData: {} }

    // 0 → falsy이므로 기본값 10 적용 → 클램프 범위 내
    let result = JSON.parse(
      await notebooklmCreateSlides({ text: 'x', slideCount: 0 }, ctx),
    )
    expect(result.slideCount).toBe(10)

    // 100 → 클램프 to 50
    result = JSON.parse(
      await notebooklmCreateSlides({ text: 'x', slideCount: 100 }, ctx),
    )
    expect(result.slideCount).toBe(50)
  })

  test('create_slides — 잘못된 style은 professional 기본값', async () => {
    mockBridgeResponse = { success: true, outputUrl: 'url', outputData: {} }
    const result = JSON.parse(
      await notebooklmCreateSlides({ text: 'x', style: 'fancy' }, ctx),
    )
    expect(result.style).toBe('professional')
  })

  test('summarize — 정상 요약', async () => {
    mockBridgeResponse = {
      success: true,
      notebookId: 'nb-abc',
      outputData: { summary: '핵심 요약: 시장이 상승했습니다.', maxLength: 500 },
    }
    const result = JSON.parse(
      await notebooklmSummarize({ notebookId: 'nb-abc', maxLength: 500 }, ctx),
    )
    expect(result.success).toBe(true)
    expect(result.summary).toContain('핵심 요약')
    expect(result.maxLength).toBe(500)
  })

  test('summarize — maxLength 경계값 (50~5000)', async () => {
    mockBridgeResponse = { success: true, outputData: { summary: 'x' } }

    // 10 → 클램프 to 50
    let result = JSON.parse(
      await notebooklmSummarize({ text: 'x', maxLength: 10 }, ctx),
    )
    expect(result.maxLength).toBe(50)

    // 10000 → 클램프 to 5000
    result = JSON.parse(
      await notebooklmSummarize({ text: 'x', maxLength: 10000 }, ctx),
    )
    expect(result.maxLength).toBe(5000)
  })
})

// ═══════════════════════════════════════════════════════════════
// R1: Bridge 프로세스 실패/에러 (Critical)
// ═══════════════════════════════════════════════════════════════

describe('R1: Bridge 프로세스 실패 — 서버 안정성', () => {
  const ctx = createMockCtx()

  test('bridge 에러 → 도구가 에러 문자열 반환 (throw 안 함)', async () => {
    mockBridgeError = new Error('Python process crashed')

    const result = JSON.parse(
      await notebooklmCreateNotebook(
        { sources: [{ type: 'text', content: 'test' }] },
        ctx,
      ),
    )
    expect(result.success).toBe(false)
    expect(result.message).toContain('오류')

    mockBridgeError = null
  })

  test('bridge가 success: false 반환 → 에러 전파', async () => {
    mockBridgeError = null
    mockBridgeResponse = { success: false, error: 'notebooklm-py 패키지 미설치' }

    const result = JSON.parse(
      await notebooklmGenerateAudio({ text: 'test' }, ctx),
    )
    expect(result.success).toBe(false)
    expect(result.message).toContain('패키지')
  })
})

// ═══════════════════════════════════════════════════════════════
// R6: 레지스트리 등록 테스트 (Medium)
// ═══════════════════════════════════════════════════════════════

describe('R6: 레지스트리 등록 — 6개 도구 접근 가능', () => {
  test('6개 NotebookLM 도구가 레지스트리에 등록됨', async () => {
    const { registry } = await import('../../lib/tool-handlers')
    const tools = registry.list()

    const expectedTools = [
      'notebooklm_create_notebook',
      'notebooklm_add_source',
      'notebooklm_generate_audio',
      'notebooklm_get_mindmap',
      'notebooklm_create_slides',
      'notebooklm_summarize',
    ]

    for (const tool of expectedTools) {
      expect(tools).toContain(tool)
      expect(registry.get(tool)).toBeDefined()
    }
  })

  test('NotebookLM 도구 핸들러가 함수임', async () => {
    const { registry } = await import('../../lib/tool-handlers')

    const handler = registry.get('notebooklm_create_notebook')
    expect(typeof handler).toBe('function')
  })
})

// ═══════════════════════════════════════════════════════════════
// R4: 응답 형식 일관성 (High)
// ═══════════════════════════════════════════════════════════════

describe('R4: 응답 형식 — JSON 문자열 일관성', () => {
  const ctx = createMockCtx()

  beforeEach(() => {
    mockBridgeError = null
    mockBridgeResponse = { success: true, notebookId: 'nb-1', outputUrl: 'url', outputData: {} }
  })

  test('모든 도구가 JSON 문자열 반환', async () => {
    const handlers = [
      { fn: notebooklmCreateNotebook, input: { sources: [{ type: 'text', content: 'x' }] } },
      { fn: notebooklmAddSource, input: { notebookId: 'nb-1', sources: [{ type: 'text', content: 'x' }] } },
      { fn: notebooklmGenerateAudio, input: { text: 'x' } },
      { fn: notebooklmGetMindmap, input: { text: 'x' } },
      { fn: notebooklmCreateSlides, input: { text: 'x' } },
      { fn: notebooklmSummarize, input: { text: 'x' } },
    ]

    for (const { fn, input } of handlers) {
      const raw = await fn(input, ctx)
      expect(typeof raw).toBe('string')
      const parsed = JSON.parse(raw)
      expect(parsed).toHaveProperty('success')
      expect(typeof parsed.message).toBe('string')
    }
  })
})
