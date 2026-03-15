import { describe, test, expect, mock } from 'bun:test'
import { EventEmitter } from 'events'
import { Readable, Writable } from 'stream'
import type { ChildProcess } from 'child_process'
import type { McpServerConfigForTransport, SpawnFn } from '../../engine/mcp/mcp-transport'

// --- Mock ChildProcess factory ---
//
// Creates a fake ChildProcess with controllable stdout/stdin for testing.
// stdout is a Readable we can push data to; stdin is a Writable we capture writes from.

function createMockProcess() {
  const stdinWrites: string[] = []
  const emitter = new EventEmitter()

  const stdout = new Readable({ read() {} })
  const stdin = new Writable({
    write(chunk, _enc, cb) {
      stdinWrites.push(chunk.toString())
      cb()
    },
  })

  // Simulate process — attach emitter methods
  const proc = Object.assign(emitter, {
    stdout,
    stdin,
    kill: mock(() => {}),
  }) as unknown as ChildProcess & { stdinWrites: string[] }

  // Push a JSON-RPC response to stdout (simulates MCP server response)
  function respond(message: object) {
    stdout.push(JSON.stringify(message) + '\n')
  }

  return { proc, stdinWrites, respond }
}

function makeConfig(transport: string = 'stdio'): McpServerConfigForTransport {
  return {
    transport,
    displayName: 'Test MCP',
    command: 'npx',
    args: ['-y', '@test/mcp-server'],
    env: {},
  }
}

// --- Interface Tests ---

describe('createMcpTransport: factory function (D25)', () => {
  test('stdio transport returns StdioTransport instance', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc } = createMockProcess()
    const spawnFn: SpawnFn = () => proc

    const transport = createMcpTransport(makeConfig('stdio'), spawnFn)
    expect(transport).toBeDefined()
    expect(typeof transport.send).toBe('function')
    expect(typeof transport.close).toBe('function')
    expect(typeof transport.sessionId).toBe('string')
  })

  test('sse transport throws TOOL_MCP_TRANSPORT_UNSUPPORTED (D25)', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc } = createMockProcess()
    const spawnFn: SpawnFn = () => proc

    const { ToolError } = await import('../../lib/tool-error')
    expect(() => createMcpTransport(makeConfig('sse'), spawnFn)).toThrow(ToolError)

    try {
      createMcpTransport(makeConfig('sse'), spawnFn)
    } catch (err) {
      expect((err as any).code).toBe('TOOL_MCP_TRANSPORT_UNSUPPORTED')
      expect((err as any).message).toContain("'sse'")
      expect((err as any).message).toContain('Phase 1')
    }
  })

  test('http transport throws TOOL_MCP_TRANSPORT_UNSUPPORTED (D25)', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc } = createMockProcess()
    const spawnFn: SpawnFn = () => proc

    try {
      createMcpTransport(makeConfig('http'), spawnFn)
    } catch (err) {
      expect((err as any).code).toBe('TOOL_MCP_TRANSPORT_UNSUPPORTED')
    }
  })

  test('unknown transport throws TOOL_MCP_TRANSPORT_UNSUPPORTED', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc } = createMockProcess()
    const spawnFn: SpawnFn = () => proc

    try {
      createMcpTransport(makeConfig('grpc'), spawnFn)
    } catch (err) {
      expect((err as any).code).toBe('TOOL_MCP_TRANSPORT_UNSUPPORTED')
    }
  })

  test('SpawnFn is called with correct cmd, args, env (injectable — TEA testability)', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc } = createMockProcess()

    let capturedCmd = ''
    let capturedArgs: string[] = []
    let capturedEnv: Record<string, string> = {}

    const spawnFn: SpawnFn = (cmd, args, env) => {
      capturedCmd = cmd
      capturedArgs = args
      capturedEnv = env
      return proc
    }

    const config: McpServerConfigForTransport = {
      transport: 'stdio',
      displayName: 'Notion MCP',
      command: 'npx',
      args: ['-y', '@notionhq/notion-mcp-server'],
      env: { NOTION_TOKEN: 'test-token-123' },
    }

    createMcpTransport(config, spawnFn)

    expect(capturedCmd).toBe('npx')
    expect(capturedArgs).toEqual(['-y', '@notionhq/notion-mcp-server'])
    expect(capturedEnv.NOTION_TOKEN).toBe('test-token-123')
  })
})

describe('StdioTransport: sessionId', () => {
  test('sessionId is a UUID string', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc } = createMockProcess()
    const transport = createMcpTransport(makeConfig('stdio'), () => proc)

    expect(typeof transport.sessionId).toBe('string')
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    expect(transport.sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  test('each StdioTransport instance has a unique sessionId', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc: proc1 } = createMockProcess()
    const { proc: proc2 } = createMockProcess()

    const t1 = createMcpTransport(makeConfig('stdio'), () => proc1)
    const t2 = createMcpTransport(makeConfig('stdio'), () => proc2)

    expect(t1.sessionId).not.toBe(t2.sessionId)
  })
})

describe('StdioTransport: send() — JSON-RPC via stdin/stdout', () => {
  test('send() writes JSON-RPC message to stdin', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc, stdinWrites, respond } = createMockProcess()
    const transport = createMcpTransport(makeConfig('stdio'), () => proc)

    // Respond asynchronously after send() writes to stdin
    setTimeout(() => {
      respond({ jsonrpc: '2.0', id: 1, result: { tools: [] } })
    }, 10)

    await transport.send({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} })

    expect(stdinWrites).toHaveLength(1)
    const written = JSON.parse(stdinWrites[0].trim())
    expect(written.jsonrpc).toBe('2.0')
    expect(written.method).toBe('tools/list')
  })

  test('send() returns response with matching id', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc, respond } = createMockProcess()
    const transport = createMcpTransport(makeConfig('stdio'), () => proc)

    setTimeout(() => {
      respond({ jsonrpc: '2.0', id: 42, result: { data: 'hello' } })
    }, 10)

    const response = await transport.send({ jsonrpc: '2.0', id: 42, method: 'ping' })

    expect(response.id).toBe(42)
    expect((response.result as any).data).toBe('hello')
  })

  test('send() auto-assigns id if not provided', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc, stdinWrites, respond } = createMockProcess()
    const transport = createMcpTransport(makeConfig('stdio'), () => proc)

    setTimeout(() => {
      // Respond to whatever id was assigned (id: 1 is first auto-assigned)
      const written = JSON.parse(stdinWrites[0]?.trim() ?? '{"id":1}')
      respond({ jsonrpc: '2.0', id: written.id, result: {} })
    }, 15)

    const response = await transport.send({ jsonrpc: '2.0', method: 'test/method' })

    expect(response.id).toBeDefined()
    expect(response.result).toBeDefined()
  })
})

describe('StdioTransport: 3-way handshake (initialize)', () => {
  test('initialize sends initialize req, receives response, then sends notifications/initialized', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc, stdinWrites, respond } = createMockProcess()
    const transport = createMcpTransport(makeConfig('stdio'), () => proc)

    // Simulate MCP server responding to initialize
    setTimeout(() => {
      respond({
        jsonrpc: '2.0',
        id: 1,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          serverInfo: { name: 'test-mcp', version: '1.0.0' },
        },
      })
    }, 10)

    const response = await transport.send({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'corthex', version: '2.0.0' },
      },
    })

    // Response received
    expect(response.id).toBe(1)
    expect((response.result as any).protocolVersion).toBe('2024-11-05')

    // Wait briefly for the notifications/initialized to be written
    await new Promise((r) => setTimeout(r, 20))

    // 3-way handshake: 2 stdin writes (initialize + notifications/initialized)
    expect(stdinWrites).toHaveLength(2)

    const firstMsg = JSON.parse(stdinWrites[0].trim())
    expect(firstMsg.method).toBe('initialize')

    const secondMsg = JSON.parse(stdinWrites[1].trim())
    expect(secondMsg.method).toBe('notifications/initialized')
    expect(secondMsg.id).toBeUndefined()  // Notifications have no id
  })

  test('initialize does NOT send notifications/initialized on error response', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc, stdinWrites, respond } = createMockProcess()
    const transport = createMcpTransport(makeConfig('stdio'), () => proc)

    setTimeout(() => {
      respond({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32600, message: 'Invalid request' },
      })
    }, 10)

    const response = await transport.send({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1' } },
    })

    await new Promise((r) => setTimeout(r, 20))

    expect(response.error).toBeDefined()
    // Only 1 write (initialize) — no notifications/initialized on error
    expect(stdinWrites).toHaveLength(1)
  })
})

describe('StdioTransport: flexible parsing (NFR-I1)', () => {
  test('unknown extra fields in response are ignored (NFR-I1)', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc, respond } = createMockProcess()
    const transport = createMcpTransport(makeConfig('stdio'), () => proc)

    setTimeout(() => {
      // Response with extra unknown fields
      respond({
        jsonrpc: '2.0',
        id: 5,
        result: { tools: [] },
        unknownField: 'extra data',
        anotherField: 42,
      })
    }, 10)

    const response = await transport.send({ jsonrpc: '2.0', id: 5, method: 'tools/list' })

    // Does not throw — extra fields are harmlessly present
    expect(response.id).toBe(5)
    expect((response.result as any).tools).toEqual([])
  })

  test('malformed non-JSON stdout lines are silently ignored (NFR-I1)', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc, respond } = createMockProcess()
    const transport = createMcpTransport(makeConfig('stdio'), () => proc)

    setTimeout(() => {
      // Push non-JSON debug lines first (npm output, etc.)
      proc.stdout!.push('npm warn ERESOLVE overriding peer dependency\n')
      proc.stdout!.push('DEBUG: server starting...\n')
      // Then the actual JSON response
      respond({ jsonrpc: '2.0', id: 1, result: { ok: true } })
    }, 10)

    const response = await transport.send({ jsonrpc: '2.0', id: 1, method: 'test' })

    expect(response.id).toBe(1)
    expect((response.result as any).ok).toBe(true)
  })

  test('notifications (no id) from server are silently ignored', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc, respond } = createMockProcess()
    const transport = createMcpTransport(makeConfig('stdio'), () => proc)

    setTimeout(() => {
      // Server sends a notification first (no id)
      respond({ jsonrpc: '2.0', method: 'server/notification', params: { data: 'something' } })
      // Then the response we're waiting for
      respond({ jsonrpc: '2.0', id: 1, result: { done: true } })
    }, 10)

    const response = await transport.send({ jsonrpc: '2.0', id: 1, method: 'test/method' })

    expect(response.id).toBe(1)
    expect((response.result as any).done).toBe(true)
  })
})

describe('StdioTransport: close()', () => {
  test('close() calls kill(SIGTERM) on the process', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc } = createMockProcess()
    const killMock = mock(() => {})
    ;(proc as any).kill = killMock

    const transport = createMcpTransport(makeConfig('stdio'), () => proc)
    await transport.close()

    expect(killMock).toHaveBeenCalledWith('SIGTERM')
  })

  test('close() does not throw if process already dead', async () => {
    const { createMcpTransport } = await import('../../engine/mcp/mcp-transport')
    const { proc } = createMockProcess()
    ;(proc as any).kill = () => { throw new Error('ESRCH: no such process') }

    const transport = createMcpTransport(makeConfig('stdio'), () => proc)
    await expect(transport.close()).resolves.toBeUndefined()
  })
})

// --- TEA P0: Source Introspection ---

describe('TEA P0: mcp-transport.ts source', () => {
  const fs = require('fs')
  const path = require('path')
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../engine/mcp/mcp-transport.ts'),
    'utf-8',
  )

  test('McpTransport interface is exported', () => {
    expect(src).toContain('export interface McpTransport')
  })

  test('SpawnFn type is exported', () => {
    expect(src).toContain('export type SpawnFn')
  })

  test('createMcpTransport factory is exported', () => {
    expect(src).toContain('export function createMcpTransport')
  })

  test('sse and http throw TOOL_MCP_TRANSPORT_UNSUPPORTED', () => {
    expect(src).toContain('TOOL_MCP_TRANSPORT_UNSUPPORTED')
    expect(src).toContain("'sse'")
    expect(src).toContain("'http'")
  })
})

describe('TEA P0: stdio.ts source', () => {
  const fs = require('fs')
  const path = require('path')
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../engine/mcp/transports/stdio.ts'),
    'utf-8',
  )

  test('StdioTransport implements McpTransport', () => {
    expect(src).toContain('class StdioTransport implements McpTransport')
  })

  test('uses readline createInterface for stdout parsing', () => {
    expect(src).toContain('createInterface')
  })

  test('sends notifications/initialized after initialize (3-way handshake)', () => {
    expect(src).toContain("'initialize'")
    expect(src).toContain("'notifications/initialized'")
  })

  test('sessionId uses crypto.randomUUID()', () => {
    expect(src).toContain('crypto.randomUUID()')
  })

  test('SpawnFn injected via constructor — no hardcoded spawn call', () => {
    expect(src).not.toContain("require('child_process')")
    expect(src).not.toContain("import { spawn }")
    expect(src).not.toContain('spawn(')  // no direct child_process.spawn usage
  })
})
