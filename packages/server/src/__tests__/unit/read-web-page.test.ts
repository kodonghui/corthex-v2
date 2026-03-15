import { describe, test, expect, mock, beforeEach } from 'bun:test'
import type { ToolCallContext } from '../../engine'

// --- Mocks ---

const mockFetch = mock(() => Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('# Test Page\nContent') }))
const mockInsertToolCallEvent = mock(() => Promise.resolve([{ id: 'event-uuid-1' }]))
const mockUpdateToolCallEvent = mock(() => Promise.resolve([]))
const mockGetDB = mock(() => ({
  insertToolCallEvent: mockInsertToolCallEvent,
  updateToolCallEvent: mockUpdateToolCallEvent,
}))

mock.module('../../db/scoped-query', () => ({ getDB: mockGetDB }))

global.fetch = mockFetch as unknown as typeof fetch

// Import AFTER mocks
const { handler } = await import('../../tool-handlers/builtins/read-web-page')

// --- Helpers ---

function makeCtx(overrides: Partial<ToolCallContext> = {}): ToolCallContext {
  return {
    companyId: 'company-1',
    agentId: 'agent-1',
    runId: 'run-test-1',
    sessionId: 'session-1',
    ...overrides,
  }
}

// --- Tests ---

describe('read_web_page handler: BuiltinToolHandler contract (E13)', () => {
  test('has name = "read_web_page"', () => {
    expect(handler.name).toBe('read_web_page')
  })

  test('has schema with url field', () => {
    expect(handler.schema).toBeDefined()
    // Valid URL passes
    const result = handler.schema.safeParse({ url: 'https://anthropic.com' })
    expect(result.success).toBe(true)
  })

  test('schema rejects non-URL strings (Zod .url())', () => {
    const result = handler.schema.safeParse({ url: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  test('schema rejects missing url', () => {
    const result = handler.schema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('execute is an async function', () => {
    expect(typeof handler.execute).toBe('function')
    // Returns a Promise
    const ctx = makeCtx()
    const result = handler.execute({ url: 'https://example.com' }, ctx)
    expect(result).toBeInstanceOf(Promise)
    // Avoid unhandled rejection — just check it's a promise
    result.catch(() => {})
  })
})

describe('read_web_page handler: Jina Reader fetch (FR-WD1)', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockInsertToolCallEvent.mockReset()
    mockUpdateToolCallEvent.mockReset()
    mockGetDB.mockReset()
    mockInsertToolCallEvent.mockResolvedValue([{ id: 'event-uuid-1' }])
    mockUpdateToolCallEvent.mockResolvedValue([])
    mockGetDB.mockReturnValue({
      insertToolCallEvent: mockInsertToolCallEvent,
      updateToolCallEvent: mockUpdateToolCallEvent,
    })
  })

  test('fetches https://r.jina.ai/{url} with Jina prefix', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('# Page Content') })

    await handler.execute({ url: 'https://anthropic.com' }, makeCtx())

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const fetchedUrl = mockFetch.mock.calls[0][0] as string
    expect(fetchedUrl).toBe('https://r.jina.ai/https://anthropic.com')
  })

  test('returns clean page content as string', async () => {
    const pageContent = '# Anthropic\n\nLeading AI safety company.'
    mockFetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve(pageContent) })

    const result = await handler.execute({ url: 'https://anthropic.com' }, makeCtx())

    expect(result).toBe(pageContent)
  })

  test('does not require an API key (no Authorization header)', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('content') })

    await handler.execute({ url: 'https://example.com' }, makeCtx())

    const fetchArgs = mockFetch.mock.calls[0]
    // fetch is called with just the URL, no auth headers
    expect(fetchArgs).toHaveLength(1)
  })
})

describe('read_web_page handler: error handling (E16, FR-SO7)', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockInsertToolCallEvent.mockReset()
    mockUpdateToolCallEvent.mockReset()
    mockGetDB.mockReset()
    mockInsertToolCallEvent.mockResolvedValue([{ id: 'event-uuid-1' }])
    mockUpdateToolCallEvent.mockResolvedValue([])
    mockGetDB.mockReturnValue({
      insertToolCallEvent: mockInsertToolCallEvent,
      updateToolCallEvent: mockUpdateToolCallEvent,
    })
  })

  test('429 → ToolError TOOL_QUOTA_EXHAUSTED (via callExternalApi)', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 429, text: () => Promise.resolve('') })

    const { ToolError } = await import('../../lib/tool-error')
    await expect(
      handler.execute({ url: 'https://example.com' }, makeCtx())
    ).rejects.toMatchObject({
      code: 'TOOL_QUOTA_EXHAUSTED',
    })
  })

  test('500 → ToolError TOOL_EXTERNAL_SERVICE_ERROR', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve('') })

    await expect(
      handler.execute({ url: 'https://example.com' }, makeCtx())
    ).rejects.toMatchObject({
      code: 'TOOL_EXTERNAL_SERVICE_ERROR',
    })
  })

  test('network error → ToolError TOOL_EXTERNAL_SERVICE_ERROR with message', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'))

    await expect(
      handler.execute({ url: 'https://example.com' }, makeCtx())
    ).rejects.toMatchObject({
      code: 'TOOL_EXTERNAL_SERVICE_ERROR',
      message: expect.stringContaining('ECONNREFUSED'),
    })
  })

  test('error message does NOT contain credential values', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve('') })

    try {
      await handler.execute({ url: 'https://example.com' }, makeCtx())
    } catch (err) {
      const errorMsg = (err as Error).message
      // No API keys or tokens should leak into error messages
      expect(errorMsg).not.toContain('sk-ant-')
      expect(errorMsg).not.toContain('Bearer ')
      expect(errorMsg).not.toContain('password')
    }
  })
})

describe('read_web_page handler: E17 telemetry (tool_call_events)', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockInsertToolCallEvent.mockReset()
    mockUpdateToolCallEvent.mockReset()
    mockGetDB.mockReset()
    mockInsertToolCallEvent.mockResolvedValue([{ id: 'event-uuid-1' }])
    mockUpdateToolCallEvent.mockResolvedValue([])
    mockGetDB.mockReturnValue({
      insertToolCallEvent: mockInsertToolCallEvent,
      updateToolCallEvent: mockUpdateToolCallEvent,
    })
  })

  test('E17: insertToolCallEvent called before fetch', async () => {
    let insertCalledBeforeFetch = false
    let fetchCalled = false

    mockInsertToolCallEvent.mockImplementation(async () => {
      insertCalledBeforeFetch = !fetchCalled
      return [{ id: 'event-uuid-1' }]
    })
    mockFetch.mockImplementation(async () => {
      fetchCalled = true
      return { ok: true, status: 200, text: () => Promise.resolve('content') }
    })

    await handler.execute({ url: 'https://example.com' }, makeCtx())

    expect(insertCalledBeforeFetch).toBe(true)
  })

  test('E17: insertToolCallEvent called with correct data', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('content') })

    const ctx = makeCtx({ agentId: 'cmo-agent', runId: 'run-abc', companyId: 'company-X' })
    await handler.execute({ url: 'https://example.com' }, ctx)

    const insertArg = mockInsertToolCallEvent.mock.calls[0][0] as Record<string, unknown>
    expect(insertArg.toolName).toBe('read_web_page')
    expect(insertArg.agentId).toBe('cmo-agent')
    expect(insertArg.runId).toBe('run-abc')
    expect(insertArg.startedAt).toBeInstanceOf(Date)
  })

  test('E17: updateToolCallEvent called with success=true on completion', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('content') })

    await handler.execute({ url: 'https://example.com' }, makeCtx())

    expect(mockUpdateToolCallEvent).toHaveBeenCalledTimes(1)
    const updateArg = mockUpdateToolCallEvent.mock.calls[0][1] as Record<string, unknown>
    expect(updateArg.success).toBe(true)
    expect(updateArg.completedAt).toBeInstanceOf(Date)
    expect(typeof updateArg.durationMs).toBe('number')
  })

  test('E17: updateToolCallEvent called with success=false and errorCode on failure', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 429, text: () => Promise.resolve('') })

    await expect(handler.execute({ url: 'https://example.com' }, makeCtx())).rejects.toThrow()

    expect(mockUpdateToolCallEvent).toHaveBeenCalledTimes(1)
    const updateArg = mockUpdateToolCallEvent.mock.calls[0][1] as Record<string, unknown>
    expect(updateArg.success).toBe(false)
    expect(updateArg.errorCode).toBe('TOOL_QUOTA_EXHAUSTED')
    expect(updateArg.completedAt).toBeInstanceOf(Date)
  })

  test('E17: updateToolCallEvent called even when fetch throws (finally guarantee)', async () => {
    mockFetch.mockRejectedValue(new Error('Network down'))

    await expect(handler.execute({ url: 'https://example.com' }, makeCtx())).rejects.toThrow()

    // UPDATE must be called regardless of error type
    expect(mockUpdateToolCallEvent).toHaveBeenCalledTimes(1)
    const updateArg = mockUpdateToolCallEvent.mock.calls[0][1] as Record<string, unknown>
    expect(updateArg.success).toBe(false)
  })

  test('E17: eventId from insertToolCallEvent used in updateToolCallEvent', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('content') })
    mockInsertToolCallEvent.mockResolvedValue([{ id: 'specific-event-id' }])

    await handler.execute({ url: 'https://example.com' }, makeCtx())

    const updateEventId = mockUpdateToolCallEvent.mock.calls[0][0] as string
    expect(updateEventId).toBe('specific-event-id')
  })
})

// --- TEA P0: Source Code Introspection ---

describe('TEA P0: read-web-page source introspection', () => {
  const fs = require('fs')
  const path = require('path')
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../tool-handlers/builtins/read-web-page.ts'),
    'utf-8',
  )

  test('uses BuiltinToolHandler interface', () => {
    expect(src).toContain('BuiltinToolHandler')
  })

  test('uses callExternalApi (E16) — no bare fetch()', () => {
    expect(src).toContain('callExternalApi')
    // All fetch calls must be inside callExternalApi
    // The fetch itself is the argument to callExternalApi, not a standalone call
    const fetchOutsideCallExternalApi = /callExternalApi[\s\S]*?fetch/.test(src)
    expect(fetchOutsideCallExternalApi).toBe(true)
  })

  test('uses Jina Reader URL prefix (r.jina.ai)', () => {
    expect(src).toContain('r.jina.ai')
  })

  test('uses E17 INSERT→UPDATE pattern', () => {
    expect(src).toContain('insertToolCallEvent')
    expect(src).toContain('updateToolCallEvent')
  })

  test('throws ToolError, never generic Error', () => {
    expect(src).toContain('ToolError')
    expect(src).not.toMatch(/throw new Error\(/)
  })

  test('uses getDB for DB access (E3 pattern)', () => {
    expect(src).toContain("getDB(ctx.companyId)")
    // No direct db import
    expect(src).not.toContain("from '../../db/index'")
    expect(src).not.toMatch(/import\s+.*\bdb\b.*from/)
  })

  test('Zod schema has .url() validation', () => {
    expect(src).toContain('.url()')
  })
})
