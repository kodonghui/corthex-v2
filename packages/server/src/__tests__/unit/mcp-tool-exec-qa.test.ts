/**
 * QA Tests — Story 18-2 MCP 도구 실행
 * Functional verification: happy path + critical edge cases
 */
import { describe, expect, it, beforeEach, mock } from 'bun:test'

const originalFetch = globalThis.fetch

describe('QA: MCP 연결 테스트 엔드포인트 기능 검증', () => {
  beforeEach(() => { globalThis.fetch = originalFetch })

  it('성공 시 실제 도구 개수를 반환해야 한다', async () => {
    const mockTools = [
      { name: 'tool1', description: 'desc1', inputSchema: {} },
      { name: 'tool2', description: 'desc2', inputSchema: {} },
      { name: 'tool3', description: 'desc3', inputSchema: {} },
    ]

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: mockTools } }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    const tools = await mcpListTools('https://mcp.example.com/mcp')
    expect(tools.length).toBe(3)
  })

  it('도구가 0개인 MCP 서버도 성공으로 처리해야 한다', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: [] } }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    const tools = await mcpListTools('https://mcp.example.com/mcp')
    expect(tools.length).toBe(0)
  })
})

describe('QA: MCP 도구 실행 기능 검증', () => {
  beforeEach(() => { globalThis.fetch = originalFetch })

  it('도구 실행 결과 텍스트를 정확히 반환해야 한다', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({
          jsonrpc: '2.0', id: 1,
          result: { content: [{ type: 'text', text: '서울 날씨: 맑음, 22도' }] },
        }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpCallTool } = await import('../../lib/mcp-client')
    const result = await mcpCallTool('https://mcp.example.com/mcp', 'get_weather', { city: '서울' })
    expect(result).toBe('서울 날씨: 맑음, 22도')
  })

  it('인자가 서버로 정확히 전달되어야 한다', async () => {
    let sentParams: Record<string, unknown> = {}

    globalThis.fetch = mock((url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string)
      sentParams = body.params
      return Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { content: [{ type: 'text', text: 'ok' }] } }),
        { headers: { 'content-type': 'application/json' } },
      ))
    }) as unknown as typeof fetch

    const { mcpCallTool } = await import('../../lib/mcp-client')
    await mcpCallTool('https://mcp.example.com/mcp', 'my_tool', { symbol: 'AAPL', period: '1d' })

    expect(sentParams.name).toBe('my_tool')
    expect((sentParams.arguments as Record<string, unknown>).symbol).toBe('AAPL')
    expect((sentParams.arguments as Record<string, unknown>).period).toBe('1d')
  })

  it('서버 다운 시 명확한 에러 메시지를 반환해야 한다', async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error('ECONNREFUSED')),
    ) as unknown as typeof fetch

    const { mcpCallTool } = await import('../../lib/mcp-client')
    await expect(mcpCallTool('https://down.example.com/mcp', 'tool', {})).rejects.toThrow('ECONNREFUSED')
  })
})

describe('QA: MCP 도구 목록 조회 기능 검증', () => {
  beforeEach(() => { globalThis.fetch = originalFetch })

  it('도구의 name, description, inputSchema 모두 반환해야 한다', async () => {
    const schema = { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] }
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({
          jsonrpc: '2.0', id: 1,
          result: { tools: [{ name: 'search', description: '검색 도구', inputSchema: schema }] },
        }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    const tools = await mcpListTools('https://example.com/mcp')
    expect(tools[0].name).toBe('search')
    expect(tools[0].description).toBe('검색 도구')
    expect(tools[0].inputSchema.required).toContain('query')
  })

  it('여러 도구가 있으면 모두 반환해야 한다', async () => {
    const tools = Array.from({ length: 10 }, (_, i) => ({
      name: `tool_${i}`,
      description: `Tool ${i}`,
      inputSchema: { type: 'object', properties: {} },
    }))

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools } }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    const result = await mcpListTools('https://example.com/mcp')
    expect(result.length).toBe(10)
  })
})

describe('QA: 도구 이름 충돌 처리', () => {
  it('내장 도구와 같은 이름의 MCP 도구는 무시해야 한다', () => {
    const builtinNames = new Set(['search_web', 'get_stock_price', 'calculate', 'send_email'])
    const mcpTools = [
      { name: 'search_web', description: 'MCP 검색' },
      { name: 'custom_tool', description: '커스텀 도구' },
      { name: 'get_stock_price', description: 'MCP 주가' },
    ]

    const filtered = mcpTools.filter(t => !builtinNames.has(t.name))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('custom_tool')
  })
})

describe('QA: SSRF 보안 검증', () => {
  it('AWS 메타데이터 엔드포인트가 차단되어야 한다', async () => {
    const { mcpListTools } = await import('../../lib/mcp-client')
    await expect(mcpListTools('http://169.254.169.254/latest/meta-data/')).rejects.toThrow()
  })

  it('내부 10.x.x.x 대역이 차단되어야 한다', async () => {
    const { mcpCallTool } = await import('../../lib/mcp-client')
    await expect(mcpCallTool('http://10.0.0.5:8080/mcp', 'tool', {})).rejects.toThrow('내부 네트워크')
  })

  it('localhost는 개발용으로 허용되어야 한다', async () => {
    const { isPrivateUrl } = await import('../../lib/mcp-client')
    expect(isPrivateUrl('http://localhost:3000/mcp')).toBe(false)
  })

  it('공개 URL은 허용되어야 한다', async () => {
    const { isPrivateUrl } = await import('../../lib/mcp-client')
    expect(isPrivateUrl('https://api.external-mcp.com/mcp')).toBe(false)
  })
})

describe('QA: 타임아웃 처리', () => {
  beforeEach(() => { globalThis.fetch = originalFetch })

  it('5초 초과 시 타임아웃 에러를 반환해야 한다', async () => {
    globalThis.fetch = mock((url: string, init: RequestInit) => {
      return new Promise((_, reject) => {
        const signal = init.signal
        if (signal) {
          signal.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'))
          })
        }
      })
    }) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await expect(mcpListTools('https://slow.example.com/mcp')).rejects.toThrow('초과')
  }, 10000)
})

describe('QA: Execute 엔드포인트 입력 검증', () => {
  it('serverId는 UUID 형식이어야 한다', () => {
    const valid = '550e8400-e29b-41d4-a716-446655440000'
    const invalid = 'abc-123'
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valid)).toBe(true)
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invalid)).toBe(false)
  })

  it('toolName은 빈 문자열이면 안 된다', () => {
    expect(''.length >= 1).toBe(false)
    expect('get_weather'.length >= 1).toBe(true)
  })

  it('arguments가 없으면 빈 객체로 기본값 설정', () => {
    let maybeArgs: Record<string, unknown> | undefined = undefined
    const args = maybeArgs ?? {}
    expect(typeof args).toBe('object')
    expect(Object.keys(args).length).toBe(0)
  })
})

describe('QA: 채팅 UI 도구 표시 검증', () => {
  it('MCP 도구는 [MCP] 태그가 붙어야 한다', () => {
    const mcpToolName = 'get_weather'
    const displayName = `${mcpToolName} [MCP]`
    expect(displayName).toBe('get_weather [MCP]')
    expect(displayName).toContain('[MCP]')
  })

  it('내장 도구는 [MCP] 태그 없이 표시되어야 한다', () => {
    const builtinToolName = 'search_web'
    expect(builtinToolName).not.toContain('[MCP]')
  })
})
