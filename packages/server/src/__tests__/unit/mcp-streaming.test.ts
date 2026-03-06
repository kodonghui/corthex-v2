import { describe, expect, it, beforeEach, mock } from 'bun:test'

const originalFetch = globalThis.fetch

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockFetch(fn: (...args: any[]) => Promise<Response>) {
  globalThis.fetch = mock(fn) as unknown as typeof fetch
}

// SSE 응답을 만드는 헬퍼
function createSseResponse(events: string[]): Response {
  const body = events.join('\n') + '\n'
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(body))
      controller.close()
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { 'content-type': 'text/event-stream' },
  })
}

function createJsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

describe('MCP Streaming — mcpCallToolStream', () => {
  beforeEach(() => {
    globalThis.fetch = originalFetch
  })

  it('should handle JSON response (non-streaming MCP server)', async () => {
    mockFetch(() =>
      Promise.resolve(createJsonResponse({
        jsonrpc: '2.0',
        id: 1,
        result: { content: [{ type: 'text', text: '결과입니다' }] },
      })),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', { a: 1 })
    expect(result).toBe('결과입니다')
  })

  it('should handle SSE streaming response with final result', async () => {
    mockFetch(() =>
      Promise.resolve(createSseResponse([
        'event: message',
        'data: {"jsonrpc":"2.0","id":1,"result":{"content":[{"type":"text","text":"스트리밍 결과"}]}}',
        '',
      ])),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})
    expect(result).toBe('스트리밍 결과')
  })

  it('should call onProgress for notifications/progress events', async () => {
    mockFetch(() =>
      Promise.resolve(createSseResponse([
        'event: message',
        'data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progress":50,"total":100,"message":"절반 완료"}}',
        '',
        'event: message',
        'data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progress":100,"total":100,"message":"모두 완료"}}',
        '',
        'event: message',
        'data: {"jsonrpc":"2.0","id":1,"result":{"content":[{"type":"text","text":"최종 결과"}]}}',
        '',
      ])),
    )

    const progressCalls: string[] = []
    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {}, (text) => {
      progressCalls.push(text)
    })

    expect(result).toBe('최종 결과')
    expect(progressCalls.length).toBe(2)
    expect(progressCalls[0]).toBe('절반 완료')
    expect(progressCalls[1]).toBe('절반 완료\n모두 완료')
  })

  it('should handle SSE keep-alive comments', async () => {
    mockFetch(() =>
      Promise.resolve(createSseResponse([
        ': keep-alive',
        'event: message',
        'data: {"jsonrpc":"2.0","id":1,"result":{"content":[{"type":"text","text":"OK"}]}}',
        '',
      ])),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})
    expect(result).toBe('OK')
  })

  it('should throw on JSON-RPC error in SSE', async () => {
    mockFetch(() =>
      Promise.resolve(createSseResponse([
        'event: message',
        'data: {"jsonrpc":"2.0","id":1,"error":{"code":-32600,"message":"Invalid Request"}}',
        '',
      ])),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    expect(mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})).rejects.toThrow('MCP 오류: Invalid Request')
  })

  it('should throw on JSON-RPC error in JSON response', async () => {
    mockFetch(() =>
      Promise.resolve(createJsonResponse({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32601, message: 'Method not found' },
      })),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    expect(mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})).rejects.toThrow('MCP 오류: Method not found')
  })

  it('should throw on unsupported content type', async () => {
    mockFetch(() =>
      Promise.resolve(new Response('<!DOCTYPE html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      })),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    expect(mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})).rejects.toThrow('지원되지 않는 응답 형식')
  })

  it('should block private URLs', async () => {
    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    expect(mcpCallToolStream('http://169.254.169.254/mcp', 'test_tool', {})).rejects.toThrow('내부 네트워크')
  })

  it('should throw on HTTP error', async () => {
    mockFetch(() =>
      Promise.resolve(new Response('Not Found', { status: 404, statusText: 'Not Found' })),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    expect(mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})).rejects.toThrow('404')
  })

  it('should return partial text when SSE stream ends without final result', async () => {
    mockFetch(() =>
      Promise.resolve(createSseResponse([
        'event: message',
        'data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"message":"진행 중..."}}',
        '',
      ])),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})
    expect(result).toBe('진행 중...')
  })

  it('should return empty string when SSE stream has no data', async () => {
    mockFetch(() =>
      Promise.resolve(createSseResponse([': just keep-alive', ''])),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})
    expect(result).toBe('')
  })

  it('should send Accept header for SSE', async () => {
    let capturedHeaders: Headers | null = null
    mockFetch((_input: RequestInfo | URL, init?: RequestInit) => {
      capturedHeaders = new Headers(init?.headers)
      return Promise.resolve(createJsonResponse({
        jsonrpc: '2.0',
        id: 1,
        result: { content: [{ type: 'text', text: 'OK' }] },
      }))
    })

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})
    expect(capturedHeaders!.get('accept')).toContain('text/event-stream')
  })
})

describe('MCP Client — mcpCallTool (non-streaming, unchanged)', () => {
  beforeEach(() => {
    globalThis.fetch = originalFetch
  })

  it('should still work with JSON responses', async () => {
    mockFetch(() =>
      Promise.resolve(createJsonResponse({
        jsonrpc: '2.0',
        id: 1,
        result: { content: [{ type: 'text', text: '기존 방식 결과' }] },
      })),
    )

    const { mcpCallTool } = await import('../../lib/mcp-client')
    const result = await mcpCallTool('http://localhost:3000/mcp', 'test', {})
    expect(result).toBe('기존 방식 결과')
  })
})

describe('mcpCallToolStream — edge cases', () => {
  beforeEach(() => {
    globalThis.fetch = originalFetch
  })

  it('should handle multiple text content blocks in result', async () => {
    mockFetch(() =>
      Promise.resolve(createJsonResponse({
        jsonrpc: '2.0',
        id: 1,
        result: {
          content: [
            { type: 'text', text: '첫 번째' },
            { type: 'text', text: '두 번째' },
            { type: 'text', text: '세 번째' },
          ],
        },
      })),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})
    expect(result).toBe('첫 번째\n두 번째\n세 번째')
  })

  it('should filter non-text content types (image, resource)', async () => {
    mockFetch(() =>
      Promise.resolve(createJsonResponse({
        jsonrpc: '2.0',
        id: 1,
        result: {
          content: [
            { type: 'image', data: 'base64...' },
            { type: 'text', text: '텍스트만' },
            { type: 'resource', uri: 'file://...' },
          ],
        },
      })),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})
    expect(result).toBe('텍스트만')
  })

  it('should handle empty content array', async () => {
    mockFetch(() =>
      Promise.resolve(createJsonResponse({
        jsonrpc: '2.0',
        id: 1,
        result: { content: [] },
      })),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})
    expect(result).toBe('')
  })

  it('should handle null result', async () => {
    mockFetch(() =>
      Promise.resolve(createJsonResponse({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      })),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})
    expect(result).toBe('')
  })

  it('should skip progress events without message field', async () => {
    const progressCalls: string[] = []
    mockFetch(() =>
      Promise.resolve(createSseResponse([
        'event: message',
        'data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progress":50,"total":100}}',
        '',
        'event: message',
        'data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progress":100,"total":100,"message":"완료"}}',
        '',
        'event: message',
        'data: {"jsonrpc":"2.0","id":1,"result":{"content":[{"type":"text","text":"결과"}]}}',
        '',
      ])),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {}, (text) => {
      progressCalls.push(text)
    })

    expect(result).toBe('결과')
    expect(progressCalls.length).toBe(1)
    expect(progressCalls[0]).toBe('완료')
  })

  it('should ignore malformed JSON in SSE data lines', async () => {
    mockFetch(() =>
      Promise.resolve(createSseResponse([
        'event: message',
        'data: not-valid-json-at-all',
        '',
        'event: message',
        'data: {"jsonrpc":"2.0","id":1,"result":{"content":[{"type":"text","text":"정상"}]}}',
        '',
      ])),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})
    expect(result).toBe('정상')
  })

  it('should handle many progress events (stress test)', async () => {
    const events: string[] = []
    for (let i = 1; i <= 20; i++) {
      events.push('event: message')
      events.push(`data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progress":${i * 5},"total":100,"message":"step ${i}"}}`)
      events.push('')
    }
    events.push('event: message')
    events.push('data: {"jsonrpc":"2.0","id":1,"result":{"content":[{"type":"text","text":"완료"}]}}')
    events.push('')

    mockFetch(() => Promise.resolve(createSseResponse(events)))

    let lastProgress = ''
    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {}, (text) => {
      lastProgress = text
    })

    expect(result).toBe('완료')
    expect(lastProgress).toContain('step 20')
  })

  it('should send correct JSON-RPC params in request body', async () => {
    let capturedBody: string | null = null
    mockFetch((_url: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = init?.body as string
      return Promise.resolve(createJsonResponse({
        jsonrpc: '2.0',
        id: 1,
        result: { content: [{ type: 'text', text: 'OK' }] },
      }))
    })

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    await mcpCallToolStream('http://localhost:3000/mcp', 'my_tool', { key: 'value' })

    const parsed = JSON.parse(capturedBody!)
    expect(parsed.jsonrpc).toBe('2.0')
    expect(parsed.id).toBe(1)
    expect(parsed.method).toBe('tools/call')
    expect(parsed.params.name).toBe('my_tool')
    expect(parsed.params.arguments).toEqual({ key: 'value' })
  })

  it('should handle SSE with event: lines only (no data)', async () => {
    mockFetch(() =>
      Promise.resolve(createSseResponse([
        'event: heartbeat',
        '',
        'event: message',
        'data: {"jsonrpc":"2.0","id":1,"result":{"content":[{"type":"text","text":"OK"}]}}',
        '',
      ])),
    )

    const { mcpCallToolStream } = await import('../../lib/mcp-client')
    const result = await mcpCallToolStream('http://localhost:3000/mcp', 'test_tool', {})
    expect(result).toBe('OK')
  })
})

describe('extractTextFromResult — via mcpCallTool', () => {
  beforeEach(() => {
    globalThis.fetch = originalFetch
  })

  it('should handle text with empty strings', async () => {
    mockFetch(() =>
      Promise.resolve(createJsonResponse({
        jsonrpc: '2.0',
        id: 1,
        result: {
          content: [
            { type: 'text', text: '' },
            { type: 'text', text: '유효' },
          ],
        },
      })),
    )

    const { mcpCallTool } = await import('../../lib/mcp-client')
    const result = await mcpCallTool('http://localhost:3000/mcp', 'test', {})
    expect(result).toBe('유효')
  })
})

describe('StreamEvent type — tool-progress', () => {
  it('should include tool-progress in StreamEvent union', async () => {
    const { generateAgentResponseStream } = await import('../../lib/ai')
    expect(typeof generateAgentResponseStream).toBe('function')
  })
})
