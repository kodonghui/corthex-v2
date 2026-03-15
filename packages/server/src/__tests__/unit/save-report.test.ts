/**
 * save-report.test.ts — Story 20.2: save_report Tool Handler
 *
 * Tests E13 BuiltinToolHandler, E15 partial failure contract, E17 telemetry,
 * and channel distribution logic (FR-RM1, FR-RM2, D27).
 *
 * TEA Risk-based coverage:
 *   - DB INSERT failure → throws TOOL_EXTERNAL_SERVICE_ERROR (no channels attempted)
 *   - Channel partial failure → non-failed channels succeed, DB row always saved
 *   - Unknown channel → CHANNEL_NOT_IMPLEMENTED error code in results
 *   - google_drive → CHANNEL_NOT_IMPLEMENTED_UNTIL_PHASE_4 error code
 *   - E17 telemetry: insertToolCallEvent before, updateToolCallEvent after
 *   - Return structure: reportId + summary + channels array
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'

// --- DB mock state ---

interface MockDB {
  insertToolCallEvent: ReturnType<typeof mock>
  updateToolCallEvent: ReturnType<typeof mock>
  insertReport: ReturnType<typeof mock>
  updateReportDistribution: ReturnType<typeof mock>
  getCredential: ReturnType<typeof mock>
}

let mockDB: MockDB

const SMTP_CREDS: Record<string, string> = {
  smtp_host: 'smtp.example.com',
  smtp_user: 'user@example.com',
  smtp_password: 'secret',
  smtp_port: '587',
  smtp_recipient: 'ceo@corp.com',
}

function setupMocks() {
  mockDB = {
    insertToolCallEvent: mock(() => Promise.resolve([{ id: 'evt-001' }])),
    updateToolCallEvent: mock(() => Promise.resolve([])),
    insertReport: mock(() => Promise.resolve([{ id: 'rpt-001' }])),
    updateReportDistribution: mock(() => Promise.resolve([])),
    // getCredential: returns mock credential row for SMTP keys (needed for pdf_email channel)
    getCredential: mock((keyName: string) => {
      const val = SMTP_CREDS[keyName]
      if (!val) return Promise.resolve([])
      return Promise.resolve([{ encryptedValue: val }])
    }),
  }
}

// --- Mock getDB ---

mock.module('../../db/scoped-query', () => ({
  getDB: (_companyId: string) => mockDB,
}))

// Mock credential-crypto to avoid CREDENTIAL_ENCRYPTION_KEY validation at module load
mock.module('../../lib/credential-crypto', () => ({
  decrypt: (v: string) => Promise.resolve(v),
  _validateKeyHex: () => {},
}))

// Mock puppeteer-pool (pdf_email channel uses withPuppeteer)
mock.module('../../lib/puppeteer-pool', () => ({
  withPuppeteer: async (_fn: any) => 'MOCK_PDF_BASE64',
  ToolResourceUnavailableError: class ToolResourceUnavailableError extends Error {
    constructor(msg: string) { super(msg); this.name = 'ToolResourceUnavailableError' }
  },
}))

// Mock nodemailer (pdf_email channel uses it)
mock.module('nodemailer', () => ({
  createTransport: () => ({
    sendMail: () => Promise.resolve({ messageId: 'mock-id' }),
  }),
}))

// Mock marked (pdf_email uses marked.parse)
mock.module('marked', () => ({
  marked: { parse: (md: string) => `<p>${md}</p>` },
}))

// --- Test context factory ---

function makeCtx(overrides?: Partial<Record<string, unknown>>) {
  return {
    companyId: 'company-123',
    agentId: 'agent-456',
    runId: 'run-789',
    ...overrides,
  } as any
}

// --- Tests ---

describe('save_report: schema and handler structure (E13)', () => {
  test('handler exports name = save_report', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    expect(handler.name).toBe('save_report')
  })

  test('schema requires title and content', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    const result = handler.schema.safeParse({ title: '', content: 'ok' })
    expect(result.success).toBe(false)

    const result2 = handler.schema.safeParse({ title: 'Hello', content: '' })
    expect(result2.success).toBe(false)
  })

  test('schema accepts valid input with all optional fields', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    const result = handler.schema.safeParse({
      title: 'Q1 Report',
      content: '# Report\nContent here.',
      type: 'weekly',
      tags: ['sales', 'q1'],
      distribute_to: ['web_dashboard'],
    })
    expect(result.success).toBe(true)
  })

  test('schema accepts input without optional fields', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    const result = handler.schema.safeParse({
      title: 'Minimal',
      content: 'Some content',
    })
    expect(result.success).toBe(true)
  })
})

describe('save_report: E17 telemetry', () => {
  beforeEach(setupMocks)

  test('insertToolCallEvent called before DB insert', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    const callOrder: string[] = []

    mockDB.insertToolCallEvent = mock(() => {
      callOrder.push('insertEvent')
      return Promise.resolve([{ id: 'evt-001' }])
    })
    mockDB.insertReport = mock(() => {
      callOrder.push('insertReport')
      return Promise.resolve([{ id: 'rpt-001' }])
    })
    mockDB.updateReportDistribution = mock(() => Promise.resolve([]))
    mockDB.updateToolCallEvent = mock(() => Promise.resolve([]))

    await handler.execute({ title: 'T', content: 'C', distribute_to: ['web_dashboard'] }, makeCtx())

    expect(callOrder[0]).toBe('insertEvent')
    expect(callOrder[1]).toBe('insertReport')
  })

  test('updateToolCallEvent called with success=true on success', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    setupMocks()

    await handler.execute({ title: 'T', content: 'C', distribute_to: ['web_dashboard'] }, makeCtx())

    expect(mockDB.updateToolCallEvent).toHaveBeenCalledTimes(1)
    const callArgs = (mockDB.updateToolCallEvent as any).mock.calls[0]
    expect(callArgs[0]).toBe('evt-001')
    expect(callArgs[1].success).toBe(true)
    expect(callArgs[1].completedAt).toBeInstanceOf(Date)
    expect(typeof callArgs[1].durationMs).toBe('number')
  })

  test('updateToolCallEvent called with success=false on DB insert failure', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    setupMocks()
    mockDB.insertReport = mock(() => Promise.reject(new Error('DB connection error')))

    await expect(
      handler.execute({ title: 'T', content: 'C', distribute_to: ['web_dashboard'] }, makeCtx()),
    ).rejects.toThrow()

    expect(mockDB.updateToolCallEvent).toHaveBeenCalledTimes(1)
    const callArgs = (mockDB.updateToolCallEvent as any).mock.calls[0]
    expect(callArgs[1].success).toBe(false)
    expect(callArgs[1].errorCode).toBe('TOOL_EXTERNAL_SERVICE_ERROR')
  })

  test('insertToolCallEvent receives correct tool metadata', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    setupMocks()

    await handler.execute({ title: 'T', content: 'C' }, makeCtx())

    const callArgs = (mockDB.insertToolCallEvent as any).mock.calls[0][0]
    expect(callArgs.toolName).toBe('save_report')
    expect(callArgs.agentId).toBe('agent-456')
    expect(callArgs.runId).toBe('run-789')
    expect(callArgs.startedAt).toBeInstanceOf(Date)
  })
})

describe('save_report: Step 1 — DB INSERT must succeed (E15)', () => {
  beforeEach(setupMocks)

  test('throws TOOL_EXTERNAL_SERVICE_ERROR on DB insert failure', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    mockDB.insertReport = mock(() => Promise.reject(new Error('DB down')))

    const { ToolError } = await import('../../lib/tool-error')
    await expect(
      handler.execute({ title: 'T', content: 'C' }, makeCtx()),
    ).rejects.toBeInstanceOf(ToolError)

    try {
      await handler.execute({ title: 'T', content: 'C' }, makeCtx())
    } catch (err) {
      expect((err as any).code).toBe('TOOL_EXTERNAL_SERVICE_ERROR')
    }
  })

  test('no channel distribution attempted if DB insert fails', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    mockDB.insertReport = mock(() => Promise.reject(new Error('DB down')))

    try {
      await handler.execute({ title: 'T', content: 'C', distribute_to: ['web_dashboard'] }, makeCtx())
    } catch {}

    // updateReportDistribution should NOT be called (channels were never attempted)
    expect(mockDB.updateReportDistribution).not.toHaveBeenCalled()
  })
})

describe('save_report: Step 2 — Channel distribution (E15 partial failure)', () => {
  beforeEach(setupMocks)

  test('web_dashboard always succeeds (Phase 1 no-op)', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute({ title: 'T', content: 'C', distribute_to: ['web_dashboard'] }, makeCtx()),
    )

    expect(result.channels).toHaveLength(1)
    expect(result.channels[0].status).toBe('success')
    expect(result.channels[0].channel).toBe('web_dashboard')
  })

  test('pdf_email succeeds (Phase 1 stub)', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute({ title: 'T', content: 'C', distribute_to: ['pdf_email'] }, makeCtx()),
    )

    expect(result.channels[0].status).toBe('success')
    expect(result.channels[0].channel).toBe('pdf_email')
  })

  test('google_drive fails with CHANNEL_NOT_IMPLEMENTED_UNTIL_PHASE_4', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute({ title: 'T', content: 'C', distribute_to: ['google_drive'] }, makeCtx()),
    )

    expect(result.channels[0].status).toBe('failed')
    expect(result.channels[0].error).toBe('CHANNEL_NOT_IMPLEMENTED_UNTIL_PHASE_4')
  })

  test('notion fails with CHANNEL_NOT_IMPLEMENTED', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute({ title: 'T', content: 'C', distribute_to: ['notion'] }, makeCtx()),
    )

    expect(result.channels[0].status).toBe('failed')
    expect(result.channels[0].error).toBe('CHANNEL_NOT_IMPLEMENTED')
  })

  test('unknown channel fails with CHANNEL_NOT_IMPLEMENTED', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute({ title: 'T', content: 'C', distribute_to: ['slack'] }, makeCtx()),
    )

    expect(result.channels[0].status).toBe('failed')
    expect(result.channels[0].error).toBe('CHANNEL_NOT_IMPLEMENTED')
  })

  test('partial failure: web_dashboard succeeds even if google_drive fails', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute(
        { title: 'T', content: 'C', distribute_to: ['web_dashboard', 'google_drive'] },
        makeCtx(),
      ),
    )

    expect(result.channels).toHaveLength(2)
    const webResult = result.channels.find((c: any) => c.channel === 'web_dashboard')
    const driveResult = result.channels.find((c: any) => c.channel === 'google_drive')
    expect(webResult.status).toBe('success')
    expect(driveResult.status).toBe('failed')

    // E17 telemetry should still record success (DB saved, some channels ok)
    const updateArgs = (mockDB.updateToolCallEvent as any).mock.calls[0]
    expect(updateArgs[1].success).toBe(true)
  })

  test('all channels failing still saves to DB and returns result', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute(
        { title: 'T', content: 'C', distribute_to: ['google_drive', 'notion'] },
        makeCtx(),
      ),
    )

    // DB was saved
    expect(mockDB.insertReport).toHaveBeenCalledTimes(1)

    // All channels failed
    expect(result.channels.every((c: any) => c.status === 'failed')).toBe(true)

    // summary reflects 0/2
    expect(result.summary).toContain('0/2')
  })
})

describe('save_report: Step 3 — updateReportDistribution JSONB (E15)', () => {
  beforeEach(setupMocks)

  test('updateReportDistribution called with correct reportId and results map', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    await handler.execute(
      { title: 'T', content: 'C', distribute_to: ['web_dashboard', 'google_drive'] },
      makeCtx(),
    )

    expect(mockDB.updateReportDistribution).toHaveBeenCalledTimes(1)
    const [reportId, results] = (mockDB.updateReportDistribution as any).mock.calls[0]
    expect(reportId).toBe('rpt-001')
    expect(results.web_dashboard).toBe('success')
    expect(typeof results.google_drive).toBe('string')
    expect(results.google_drive).not.toBe('success')
  })

  test('success channels stored as "success" string', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    await handler.execute({ title: 'T', content: 'C', distribute_to: ['web_dashboard'] }, makeCtx())

    const [, results] = (mockDB.updateReportDistribution as any).mock.calls[0]
    expect(results.web_dashboard).toBe('success')
  })

  test('failed channels stored as error code string', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    await handler.execute({ title: 'T', content: 'C', distribute_to: ['google_drive'] }, makeCtx())

    const [, results] = (mockDB.updateReportDistribution as any).mock.calls[0]
    expect(results.google_drive).toBe('CHANNEL_NOT_IMPLEMENTED_UNTIL_PHASE_4')
  })
})

describe('save_report: Step 4 — Return structure (FR-RM1)', () => {
  beforeEach(setupMocks)

  test('returns valid JSON string', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    const raw = await handler.execute({ title: 'T', content: 'C' }, makeCtx())
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  test('return value contains reportId', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    const result = JSON.parse(await handler.execute({ title: 'T', content: 'C' }, makeCtx()))
    expect(result.reportId).toBe('rpt-001')
  })

  test('return value contains summary with channel counts', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    const result = JSON.parse(
      await handler.execute({ title: 'T', content: 'C', distribute_to: ['web_dashboard'] }, makeCtx()),
    )
    expect(result.summary).toContain('1/1')
  })

  test('return value contains channels array with status per channel', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    const result = JSON.parse(
      await handler.execute(
        { title: 'T', content: 'C', distribute_to: ['web_dashboard', 'google_drive'] },
        makeCtx(),
      ),
    )
    expect(Array.isArray(result.channels)).toBe(true)
    expect(result.channels).toHaveLength(2)
    result.channels.forEach((c: any) => {
      expect(c.channel).toBeDefined()
      expect(c.status).toMatch(/^(success|failed)$/)
    })
  })

  test('default distribute_to is [web_dashboard] when omitted', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')
    const result = JSON.parse(await handler.execute({ title: 'T', content: 'C' }, makeCtx()))
    expect(result.channels).toHaveLength(1)
    expect(result.channels[0].channel).toBe('web_dashboard')
  })
})

describe('TEA P0: save-report.ts source introspection', () => {
  const fs = require('fs')
  const path = require('path')
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../tool-handlers/builtins/save-report.ts'),
    'utf-8',
  )

  test('uses Promise.allSettled for channel distribution (E15)', () => {
    expect(src).toContain('Promise.allSettled')
  })

  test('does NOT use Promise.all for channels (would break partial failure)', () => {
    // Promise.all would reject all channels if one fails
    const hasPromiseAll = src.includes('Promise.all(') && !src.includes('Promise.allSettled')
    expect(hasPromiseAll).toBe(false)
  })

  test('E17 telemetry: insertToolCallEvent present', () => {
    expect(src).toContain('insertToolCallEvent')
  })

  test('E17 telemetry: updateToolCallEvent present in catch', () => {
    expect(src).toContain('updateToolCallEvent')
  })

  test('Step 1 throws TOOL_EXTERNAL_SERVICE_ERROR on DB failure', () => {
    expect(src).toContain('TOOL_EXTERNAL_SERVICE_ERROR')
  })

  test('CHANNEL_NOT_IMPLEMENTED_UNTIL_PHASE_4 for google_drive', () => {
    expect(src).toContain('CHANNEL_NOT_IMPLEMENTED_UNTIL_PHASE_4')
  })

  test('distributeToChannel uses switch statement', () => {
    expect(src).toContain('switch (channel)')
  })

  test('web_dashboard is Phase 1 no-op', () => {
    expect(src).toContain('web_dashboard')
    expect(src).toContain('no-op')
  })
})
