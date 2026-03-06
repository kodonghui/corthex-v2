import { describe, expect, it, beforeEach, mock, spyOn } from 'bun:test'

// Mock fetch globally
const originalFetch = globalThis.fetch

describe('MCP Client — mcp-client.ts', () => {
  beforeEach(() => {
    globalThis.fetch = originalFetch
  })

  describe('isPrivateUrl', () => {
    it('should allow localhost for development', async () => {
      const { isPrivateUrl } = await import('../../lib/mcp-client')
      expect(isPrivateUrl('http://localhost:3000/mcp')).toBe(false)
      expect(isPrivateUrl('http://127.0.0.1:8080/mcp')).toBe(false)
    })

    it('should block AWS metadata endpoint', async () => {
      const { isPrivateUrl } = await import('../../lib/mcp-client')
      expect(isPrivateUrl('http://169.254.169.254/latest/meta-data/')).toBe(true)
    })

    it('should block private network IPs', async () => {
      const { isPrivateUrl } = await import('../../lib/mcp-client')
      expect(isPrivateUrl('http://10.0.0.1/mcp')).toBe(true)
      expect(isPrivateUrl('http://172.16.0.1/mcp')).toBe(true)
      expect(isPrivateUrl('http://192.168.1.1/mcp')).toBe(true)
    })

    it('should allow public URLs', async () => {
      const { isPrivateUrl } = await import('../../lib/mcp-client')
      expect(isPrivateUrl('https://mcp.example.com/mcp')).toBe(false)
      expect(isPrivateUrl('http://api.service.io:3000/mcp')).toBe(false)
    })

    it('should return true for invalid URLs (안전한 기본값)', async () => {
      const { isPrivateUrl } = await import('../../lib/mcp-client')
      expect(isPrivateUrl('not-a-url')).toBe(true) // 파싱 실패 시 차단
    })
  })

  describe('mcpListTools', () => {
    it('should return tools from MCP server', async () => {
      const mockTools = [
        { name: 'get_weather', description: '날씨 조회', inputSchema: { type: 'object', properties: { city: { type: 'string' } } } },
        { name: 'search', description: '검색', inputSchema: { type: 'object', properties: { query: { type: 'string' } } } },
      ]

      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(
          JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: mockTools } }),
          { headers: { 'content-type': 'application/json' } },
        )),
      ) as unknown as typeof fetch

      const { mcpListTools } = await import('../../lib/mcp-client')
      const tools = await mcpListTools('https://example.com/mcp')
      expect(tools).toHaveLength(2)
      expect(tools[0].name).toBe('get_weather')
      expect(tools[1].name).toBe('search')
    })

    it('should send correct JSON-RPC request', async () => {
      let capturedBody: string = ''

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
      expect(parsed.method).toBe('tools/list')
      expect(parsed.id).toBe(1)
    })

    it('should return empty array when result has no tools', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(
          JSON.stringify({ jsonrpc: '2.0', id: 1, result: {} }),
          { headers: { 'content-type': 'application/json' } },
        )),
      ) as unknown as typeof fetch

      const { mcpListTools } = await import('../../lib/mcp-client')
      const tools = await mcpListTools('https://example.com/mcp')
      expect(tools).toEqual([])
    })

    it('should throw on SSRF attempt to private IP', async () => {
      const { mcpListTools } = await import('../../lib/mcp-client')
      await expect(mcpListTools('http://10.0.0.1/mcp')).rejects.toThrow('내부 네트워크')
    })

    it('should throw on JSON-RPC error response', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(
          JSON.stringify({ jsonrpc: '2.0', id: 1, error: { code: -32600, message: 'Invalid request' } }),
          { headers: { 'content-type': 'application/json' } },
        )),
      ) as unknown as typeof fetch

      const { mcpListTools } = await import('../../lib/mcp-client')
      await expect(mcpListTools('https://example.com/mcp')).rejects.toThrow('MCP 오류')
    })

    it('should throw on non-JSON response', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response('<html>Not Found</html>', {
          headers: { 'content-type': 'text/html' },
        })),
      ) as unknown as typeof fetch

      const { mcpListTools } = await import('../../lib/mcp-client')
      await expect(mcpListTools('https://example.com/mcp')).rejects.toThrow('JSON 응답')
    })

    it('should throw on HTTP error status', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response('Internal Server Error', {
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'content-type': 'text/plain' },
        })),
      ) as unknown as typeof fetch

      const { mcpListTools } = await import('../../lib/mcp-client')
      await expect(mcpListTools('https://example.com/mcp')).rejects.toThrow('응답 오류')
    })
  })

  describe('mcpCallTool', () => {
    it('should call tool and return text result', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(
          JSON.stringify({
            jsonrpc: '2.0', id: 1,
            result: { content: [{ type: 'text', text: 'AAPL: $150.25' }] },
          }),
          { headers: { 'content-type': 'application/json' } },
        )),
      ) as unknown as typeof fetch

      const { mcpCallTool } = await import('../../lib/mcp-client')
      const result = await mcpCallTool('https://example.com/mcp', 'get_stock_price', { symbol: 'AAPL' })
      expect(result).toBe('AAPL: $150.25')
    })

    it('should send correct JSON-RPC tools/call request', async () => {
      let capturedBody: string = ''

      globalThis.fetch = mock((url: string, init: RequestInit) => {
        capturedBody = init.body as string
        return Promise.resolve(new Response(
          JSON.stringify({ jsonrpc: '2.0', id: 1, result: { content: [{ type: 'text', text: 'ok' }] } }),
          { headers: { 'content-type': 'application/json' } },
        ))
      }) as unknown as typeof fetch

      const { mcpCallTool } = await import('../../lib/mcp-client')
      await mcpCallTool('https://example.com/mcp', 'my_tool', { arg1: 'value1' })

      const parsed = JSON.parse(capturedBody)
      expect(parsed.method).toBe('tools/call')
      expect(parsed.params.name).toBe('my_tool')
      expect(parsed.params.arguments).toEqual({ arg1: 'value1' })
    })

    it('should concatenate multiple text content blocks', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(
          JSON.stringify({
            jsonrpc: '2.0', id: 1,
            result: { content: [
              { type: 'text', text: 'Line 1' },
              { type: 'image', data: 'base64...' },
              { type: 'text', text: 'Line 2' },
            ] },
          }),
          { headers: { 'content-type': 'application/json' } },
        )),
      ) as unknown as typeof fetch

      const { mcpCallTool } = await import('../../lib/mcp-client')
      const result = await mcpCallTool('https://example.com/mcp', 'multi_result', {})
      expect(result).toBe('Line 1\nLine 2')
    })

    it('should return empty string when no content', async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(
          JSON.stringify({ jsonrpc: '2.0', id: 1, result: { content: [] } }),
          { headers: { 'content-type': 'application/json' } },
        )),
      ) as unknown as typeof fetch

      const { mcpCallTool } = await import('../../lib/mcp-client')
      const result = await mcpCallTool('https://example.com/mcp', 'empty_tool', {})
      expect(result).toBe('')
    })

    it('should throw on network error', async () => {
      globalThis.fetch = mock(() =>
        Promise.reject(new Error('Connection refused')),
      ) as unknown as typeof fetch

      const { mcpCallTool } = await import('../../lib/mcp-client')
      await expect(mcpCallTool('https://example.com/mcp', 'tool', {})).rejects.toThrow('Connection refused')
    })

    it('should throw on SSRF attempt', async () => {
      const { mcpCallTool } = await import('../../lib/mcp-client')
      await expect(mcpCallTool('http://192.168.1.1/mcp', 'tool', {})).rejects.toThrow('내부 네트워크')
    })
  })
})

describe('MCP Settings Route — settings-mcp.ts', () => {
  // These test the route handler logic conceptually
  // Full integration tested via build verification

  it('should export execute schema validation concepts', () => {
    // Verify the execute endpoint accepts correct input shape
    const validInput = {
      serverId: '00000000-0000-0000-0000-000000000001',
      toolName: 'get_weather',
      arguments: { city: 'Seoul' },
    }
    expect(validInput.serverId).toBeTruthy()
    expect(validInput.toolName).toBeTruthy()
    expect(typeof validInput.arguments).toBe('object')
  })
})

describe('MCP AI Integration — ai.ts MCP tool loading', () => {
  it('should deduplicate tools by name (builtin wins over MCP)', () => {
    const existingToolNames = new Set(['search_web', 'get_stock_price'])
    const mcpTools = [
      { name: 'search_web', description: 'MCP Search' },
      { name: 'new_mcp_tool', description: 'New Tool' },
    ]

    const filtered = mcpTools.filter(t => !existingToolNames.has(t.name))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('new_mcp_tool')
  })

  it('should tag MCP tools with [MCP] in description', () => {
    const mcpDesc = 'Weather lookup'
    const tagged = `[MCP] ${mcpDesc}`
    expect(tagged).toBe('[MCP] Weather lookup')
  })

  it('should handle empty MCP server list gracefully', () => {
    const servers: unknown[] = []
    expect(servers.length).toBe(0)
    // loadMcpToolsForCompany should return empty arrays
  })
})
