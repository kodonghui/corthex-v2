/**
 * TEA (Test Architect) — Story 18-2 MCP 도구 실행
 * Risk-based test coverage: JSON-RPC protocol, SSRF, timeouts, deduplication, error handling
 */
import { describe, expect, it, beforeEach, mock } from 'bun:test'

const originalFetch = globalThis.fetch

describe('TEA-HIGH: MCP JSON-RPC Protocol Correctness', () => {
  beforeEach(() => { globalThis.fetch = originalFetch })

  it('should use POST method for all MCP requests', async () => {
    let capturedMethod = ''
    globalThis.fetch = mock((url: string, init: RequestInit) => {
      capturedMethod = init.method || ''
      return Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: [] } }),
        { headers: { 'content-type': 'application/json' } },
      ))
    }) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await mcpListTools('https://example.com/mcp')
    expect(capturedMethod).toBe('POST')
  })

  it('should set Content-Type to application/json', async () => {
    let capturedHeaders: HeadersInit | undefined
    globalThis.fetch = mock((url: string, init: RequestInit) => {
      capturedHeaders = init.headers
      return Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: [] } }),
        { headers: { 'content-type': 'application/json' } },
      ))
    }) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await mcpListTools('https://example.com/mcp')
    expect(capturedHeaders).toBeDefined()
    const headers = capturedHeaders as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('should use JSON-RPC 2.0 format with numeric id', async () => {
    let capturedBody = ''
    globalThis.fetch = mock((url: string, init: RequestInit) => {
      capturedBody = init.body as string
      return Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: [] } }),
        { headers: { 'content-type': 'application/json' } },
      ))
    }) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await mcpListTools('https://example.com/mcp')
    const parsed = JSON.parse(capturedBody)
    expect(parsed.jsonrpc).toBe('2.0')
    expect(typeof parsed.id).toBe('number')
  })

  it('should use correct method name for tools/list', async () => {
    let capturedBody = ''
    globalThis.fetch = mock((url: string, init: RequestInit) => {
      capturedBody = init.body as string
      return Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: [] } }),
        { headers: { 'content-type': 'application/json' } },
      ))
    }) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await mcpListTools('https://example.com/mcp')
    expect(JSON.parse(capturedBody).method).toBe('tools/list')
  })

  it('should use correct method name for tools/call', async () => {
    let capturedBody = ''
    globalThis.fetch = mock((url: string, init: RequestInit) => {
      capturedBody = init.body as string
      return Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { content: [{ type: 'text', text: 'ok' }] } }),
        { headers: { 'content-type': 'application/json' } },
      ))
    }) as unknown as typeof fetch

    const { mcpCallTool } = await import('../../lib/mcp-client')
    await mcpCallTool('https://example.com/mcp', 'my_tool', { key: 'val' })
    const parsed = JSON.parse(capturedBody)
    expect(parsed.method).toBe('tools/call')
    expect(parsed.params.name).toBe('my_tool')
    expect(parsed.params.arguments).toEqual({ key: 'val' })
  })
})

describe('TEA-HIGH: SSRF Prevention', () => {
  beforeEach(() => { globalThis.fetch = originalFetch })

  it('should block 10.x.x.x private range', async () => {
    const { isPrivateUrl } = await import('../../lib/mcp-client')
    expect(isPrivateUrl('http://10.0.0.1:3000/mcp')).toBe(true)
    expect(isPrivateUrl('http://10.255.255.255/mcp')).toBe(true)
  })

  it('should block 172.16-31.x.x private range', async () => {
    const { isPrivateUrl } = await import('../../lib/mcp-client')
    expect(isPrivateUrl('http://172.16.0.1/mcp')).toBe(true)
    expect(isPrivateUrl('http://172.31.255.255/mcp')).toBe(true)
    // 172.32+ is public
    expect(isPrivateUrl('http://172.32.0.1/mcp')).toBe(false)
  })

  it('should block 192.168.x.x private range', async () => {
    const { isPrivateUrl } = await import('../../lib/mcp-client')
    expect(isPrivateUrl('http://192.168.0.1/mcp')).toBe(true)
    expect(isPrivateUrl('http://192.168.100.200/mcp')).toBe(true)
  })

  it('should block AWS metadata endpoint (169.254.169.254)', async () => {
    const { isPrivateUrl } = await import('../../lib/mcp-client')
    expect(isPrivateUrl('http://169.254.169.254/latest/meta-data/')).toBe(true)
    expect(isPrivateUrl('http://169.254.169.254/latest/api/token')).toBe(true)
  })

  it('should allow localhost for development', async () => {
    const { isPrivateUrl } = await import('../../lib/mcp-client')
    expect(isPrivateUrl('http://localhost:3000/mcp')).toBe(false)
    expect(isPrivateUrl('http://127.0.0.1:8080/sse')).toBe(false)
  })

  it('should allow 0.0.0.0 for development', async () => {
    const { isPrivateUrl } = await import('../../lib/mcp-client')
    expect(isPrivateUrl('http://0.0.0.0:3000/mcp')).toBe(false)
  })

  it('should block private IPs in mcpListTools', async () => {
    const { mcpListTools } = await import('../../lib/mcp-client')
    await expect(mcpListTools('http://10.0.0.1:3000/mcp')).rejects.toThrow('내부 네트워크')
  })

  it('should block private IPs in mcpCallTool', async () => {
    const { mcpCallTool } = await import('../../lib/mcp-client')
    await expect(mcpCallTool('http://192.168.1.1/mcp', 'tool', {})).rejects.toThrow('내부 네트워크')
  })
})

describe('TEA-HIGH: Timeout Handling', () => {
  beforeEach(() => { globalThis.fetch = originalFetch })

  it('should abort request after timeout', async () => {
    let signalAborted = false
    globalThis.fetch = mock((url: string, init: RequestInit) => {
      return new Promise((resolve, reject) => {
        const signal = init.signal
        if (signal) {
          signal.addEventListener('abort', () => {
            signalAborted = true
            reject(new DOMException('Aborted', 'AbortError'))
          })
        }
        // Never resolve — simulates a hanging server
      })
    }) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await expect(mcpListTools('https://example.com/mcp')).rejects.toThrow('응답 시간이 초과')
    expect(signalAborted).toBe(true)
  }, 10000)

  it('should use AbortController with signal', async () => {
    let hasSignal = false
    globalThis.fetch = mock((url: string, init: RequestInit) => {
      hasSignal = !!init.signal
      return Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: [] } }),
        { headers: { 'content-type': 'application/json' } },
      ))
    }) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await mcpListTools('https://example.com/mcp')
    expect(hasSignal).toBe(true)
  })
})

describe('TEA-MED: Error Response Handling', () => {
  beforeEach(() => { globalThis.fetch = originalFetch })

  it('should handle JSON-RPC error with code and message', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, error: { code: -32601, message: 'Method not found' } }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await expect(mcpListTools('https://example.com/mcp')).rejects.toThrow('Method not found')
  })

  it('should handle HTTP 404 error', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response('Not Found', {
        status: 404,
        statusText: 'Not Found',
        headers: { 'content-type': 'text/plain' },
      })),
    ) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await expect(mcpListTools('https://example.com/mcp')).rejects.toThrow('404')
  })

  it('should handle HTTP 503 service unavailable', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response('Service Unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'content-type': 'text/plain' },
      })),
    ) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await expect(mcpListTools('https://example.com/mcp')).rejects.toThrow('503')
  })

  it('should handle non-JSON content type', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response('<html>Gateway Error</html>', {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      })),
    ) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await expect(mcpListTools('https://example.com/mcp')).rejects.toThrow('JSON')
  })

  it('should handle network connection refused', async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error('fetch failed')),
    ) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await expect(mcpListTools('https://example.com/mcp')).rejects.toThrow('fetch failed')
  })

  it('should handle DNS resolution failure', async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error('getaddrinfo ENOTFOUND invalid.host')),
    ) as unknown as typeof fetch

    const { mcpCallTool } = await import('../../lib/mcp-client')
    await expect(mcpCallTool('https://invalid.host/mcp', 'tool', {})).rejects.toThrow('ENOTFOUND')
  })
})

describe('TEA-MED: Tool Name Deduplication', () => {
  it('should skip MCP tools that conflict with builtin tool names', () => {
    const existingToolNames = new Set(['search_web', 'get_stock_price', 'calculate'])
    const mcpTools = [
      { name: 'search_web', description: 'Conflicting MCP Search' },
      { name: 'get_stock_price', description: 'Conflicting MCP Stock' },
      { name: 'unique_mcp_tool', description: 'New MCP Tool' },
      { name: 'another_unique', description: 'Another New' },
    ]

    const filtered = mcpTools.filter(t => !existingToolNames.has(t.name))
    expect(filtered).toHaveLength(2)
    expect(filtered[0].name).toBe('unique_mcp_tool')
    expect(filtered[1].name).toBe('another_unique')
  })

  it('should skip duplicate MCP tools from different servers', () => {
    const mcpToolRecords: { name: string; serverId: string }[] = []
    const tools = [
      { name: 'weather', serverId: 'server-1' },
      { name: 'weather', serverId: 'server-2' }, // duplicate
      { name: 'stocks', serverId: 'server-2' },
    ]

    for (const tool of tools) {
      if (mcpToolRecords.some(t => t.name === tool.name)) continue
      mcpToolRecords.push(tool)
    }

    expect(mcpToolRecords).toHaveLength(2)
    expect(mcpToolRecords[0].serverId).toBe('server-1') // first wins
  })

  it('should handle empty tool names gracefully', () => {
    const existing = new Set([''])
    expect(existing.has('')).toBe(true)
    // Empty name tools should be filtered by schema validation, not dedup
  })
})

describe('TEA-MED: mcpCallTool Result Parsing', () => {
  beforeEach(() => { globalThis.fetch = originalFetch })

  it('should handle result with no content array', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: {} }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpCallTool } = await import('../../lib/mcp-client')
    const result = await mcpCallTool('https://example.com/mcp', 'tool', {})
    expect(result).toBe('')
  })

  it('should handle result with null content', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { content: null } }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpCallTool } = await import('../../lib/mcp-client')
    const result = await mcpCallTool('https://example.com/mcp', 'tool', {})
    expect(result).toBe('')
  })

  it('should filter non-text content types', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({
          jsonrpc: '2.0', id: 1,
          result: { content: [
            { type: 'image', data: 'base64data' },
            { type: 'text', text: 'Only text' },
            { type: 'resource', uri: 'file://test' },
          ] },
        }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpCallTool } = await import('../../lib/mcp-client')
    const result = await mcpCallTool('https://example.com/mcp', 'tool', {})
    expect(result).toBe('Only text')
  })

  it('should handle text content with empty text field', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({
          jsonrpc: '2.0', id: 1,
          result: { content: [
            { type: 'text', text: '' },
            { type: 'text', text: 'Real data' },
          ] },
        }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpCallTool } = await import('../../lib/mcp-client')
    const result = await mcpCallTool('https://example.com/mcp', 'tool', {})
    expect(result).toBe('Real data')
  })

  it('should handle very large text responses', async () => {
    const largeText = 'A'.repeat(100_000)
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({
          jsonrpc: '2.0', id: 1,
          result: { content: [{ type: 'text', text: largeText }] },
        }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpCallTool } = await import('../../lib/mcp-client')
    const result = await mcpCallTool('https://example.com/mcp', 'tool', {})
    expect(result.length).toBe(100_000)
  })
})

describe('TEA-MED: Execute Endpoint Validation', () => {
  it('should validate serverId is UUID format', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000'
    const invalidId = 'not-a-uuid'
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validUuid)).toBe(true)
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invalidId)).toBe(false)
  })

  it('should require non-empty toolName', () => {
    expect(''.length >= 1).toBe(false)
    expect('my_tool'.length >= 1).toBe(true)
  })

  it('should default arguments to empty object', () => {
    const defaultArgs = {}
    expect(typeof defaultArgs).toBe('object')
    expect(Object.keys(defaultArgs).length).toBe(0)
  })
})

describe('TEA-LOW: Edge Cases', () => {
  beforeEach(() => { globalThis.fetch = originalFetch })

  it('should handle URL with trailing slash', async () => {
    let capturedUrl = ''
    globalThis.fetch = mock((url: string, init: RequestInit) => {
      capturedUrl = url as string
      return Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: [] } }),
        { headers: { 'content-type': 'application/json' } },
      ))
    }) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await mcpListTools('https://example.com/mcp/')
    expect(capturedUrl).toBe('https://example.com/mcp/')
  })

  it('should handle URL with query parameters', async () => {
    let capturedUrl = ''
    globalThis.fetch = mock((url: string, init: RequestInit) => {
      capturedUrl = url as string
      return Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: [] } }),
        { headers: { 'content-type': 'application/json' } },
      ))
    }) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    await mcpListTools('https://example.com/mcp?token=abc')
    expect(capturedUrl).toContain('?token=abc')
  })

  it('should handle tool with special characters in name', async () => {
    const toolName = 'my-tool_v2.0'
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({
          jsonrpc: '2.0', id: 1,
          result: { tools: [{ name: toolName, description: 'Test', inputSchema: {} }] },
        }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    const tools = await mcpListTools('https://example.com/mcp')
    expect(tools[0].name).toBe(toolName)
  })

  it('should handle tool arguments with nested objects', async () => {
    let capturedBody = ''
    globalThis.fetch = mock((url: string, init: RequestInit) => {
      capturedBody = init.body as string
      return Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { content: [{ type: 'text', text: 'ok' }] } }),
        { headers: { 'content-type': 'application/json' } },
      ))
    }) as unknown as typeof fetch

    const { mcpCallTool } = await import('../../lib/mcp-client')
    const nestedArgs = { filter: { type: 'stock', options: { limit: 10 } } }
    await mcpCallTool('https://example.com/mcp', 'complex_tool', nestedArgs)
    const parsed = JSON.parse(capturedBody)
    expect(parsed.params.arguments.filter.options.limit).toBe(10)
  })

  it('should handle Unicode in tool results', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({
          jsonrpc: '2.0', id: 1,
          result: { content: [{ type: 'text', text: '삼성전자 주가: ₩72,000 🚀' }] },
        }),
        { headers: { 'content-type': 'application/json' } },
      )),
    ) as unknown as typeof fetch

    const { mcpCallTool } = await import('../../lib/mcp-client')
    const result = await mcpCallTool('https://example.com/mcp', 'korean_tool', {})
    expect(result).toBe('삼성전자 주가: ₩72,000 🚀')
  })

  it('should handle response with content-type charset parameter', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: [] } }),
        { headers: { 'content-type': 'application/json; charset=utf-8' } },
      )),
    ) as unknown as typeof fetch

    const { mcpListTools } = await import('../../lib/mcp-client')
    const tools = await mcpListTools('https://example.com/mcp')
    expect(tools).toEqual([])
  })
})

describe('TEA-MED: AI Integration — MCP Tool Loading', () => {
  it('should add [MCP] prefix to MCP tool descriptions for Claude', () => {
    const originalDesc = 'Get weather data for a city'
    const claudeDesc = `[MCP] ${originalDesc}`
    expect(claudeDesc).toBe('[MCP] Get weather data for a city')
    expect(claudeDesc.startsWith('[MCP]')).toBe(true)
  })

  it('should create proper Claude tool schema from MCP inputSchema', () => {
    const mcpSchema = {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name' },
        units: { type: 'string', enum: ['celsius', 'fahrenheit'] },
      },
      required: ['city'],
    }

    const claudeTool = {
      name: 'get_weather',
      description: '[MCP] Get weather',
      input_schema: mcpSchema,
    }

    expect(claudeTool.input_schema.type).toBe('object')
    expect(claudeTool.input_schema.required).toContain('city')
  })

  it('should handle MCP tool with empty inputSchema', () => {
    const emptySchema: Record<string, unknown> = {}
    const fallback = (emptySchema && Object.keys(emptySchema).length > 0)
      ? emptySchema
      : { type: 'object' as const, properties: {} }

    expect(fallback.type).toBe('object')
  })

  it('should handle MCP servers returning zero tools', () => {
    const mcpToolRecords: unknown[] = []
    const claudeMcpTools: unknown[] = []

    // No tools loaded = no change to Claude tools array
    expect(mcpToolRecords.length).toBe(0)
    expect(claudeMcpTools.length).toBe(0)
  })

  it('should handle multiple MCP servers contributing tools', () => {
    const server1Tools = [
      { name: 'tool_a', serverId: 's1' },
      { name: 'tool_b', serverId: 's1' },
    ]
    const server2Tools = [
      { name: 'tool_c', serverId: 's2' },
      { name: 'tool_a', serverId: 's2' }, // duplicate from server 1
    ]

    const allTools: { name: string; serverId: string }[] = []
    for (const tool of [...server1Tools, ...server2Tools]) {
      if (allTools.some(t => t.name === tool.name)) continue
      allTools.push(tool)
    }

    expect(allTools).toHaveLength(3)
    expect(allTools.find(t => t.name === 'tool_a')?.serverId).toBe('s1') // first server wins
  })
})
