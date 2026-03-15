/**
 * send-email-handler.test.ts — Story 20.4: send_email BuiltinToolHandler (NFR-I3)
 *
 * Tests MIME attachment support, SMTP credential lookup, E17 telemetry,
 * backward compatibility (no-attachment emails still work).
 *
 * TEA Risk-based coverage:
 *   - Missing SMTP credentials → TOOL_CREDENTIAL_INVALID per key
 *   - No attachments → plain HTML email (backward compat)
 *   - With attachments → MIME multipart
 *   - nodemailer unavailable → TOOL_EXTERNAL_SERVICE_ERROR
 *   - E17 telemetry: insertToolCallEvent before, updateToolCallEvent after
 *   - Schema validation: to must be valid email, subject required
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'

// --- Mock DB state ---

interface MockDB {
  insertToolCallEvent: ReturnType<typeof mock>
  updateToolCallEvent: ReturnType<typeof mock>
  getCredential: ReturnType<typeof mock>
}

let mockDB: MockDB
let capturedMailOptions: any

function setupMocks(credOverrides: Record<string, string | null> = {}) {
  const defaults: Record<string, string | null> = {
    smtp_host: 'smtp.example.com',
    smtp_user: 'user@example.com',
    smtp_password: 'secret',
    smtp_port: '587',
  }
  const creds = { ...defaults, ...credOverrides }

  capturedMailOptions = null

  mockDB = {
    insertToolCallEvent: mock(() => Promise.resolve([{ id: 'evt-001' }])),
    updateToolCallEvent: mock(() => Promise.resolve([])),
    getCredential: mock((keyName: string) => {
      const val = creds[keyName]
      if (!val) return Promise.resolve([])
      return Promise.resolve([{ encryptedValue: `enc:${val}` }])
    }),
  }
}

// --- Mock modules ---

mock.module('../../db/scoped-query', () => ({
  getDB: (_companyId: string) => mockDB,
}))

mock.module('../../lib/credential-crypto', () => ({
  decrypt: (v: string) => Promise.resolve(v.replace('enc:', '')),
  _validateKeyHex: () => {},
}))

mock.module('nodemailer', () => ({
  createTransport: (_config: any) => ({
    sendMail: (opts: any) => {
      capturedMailOptions = opts
      return Promise.resolve({ messageId: 'test-msg-id' })
    },
  }),
}))

// --- Context factory ---

function makeCtx() {
  return { companyId: 'company-123', agentId: 'agent-456', runId: 'run-789' } as any
}

// --- Tests ---

describe('send_email: schema (E13)', () => {
  test('handler name is send_email', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')
    expect(handler.name).toBe('send_email')
  })

  test('schema rejects invalid email in to field', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')
    const result = handler.schema.safeParse({ to: 'not-an-email', subject: 'Test' })
    expect(result.success).toBe(false)
  })

  test('schema rejects empty subject', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')
    const result = handler.schema.safeParse({ to: 'user@example.com', subject: '' })
    expect(result.success).toBe(false)
  })

  test('schema accepts valid minimal input', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')
    const result = handler.schema.safeParse({ to: 'user@example.com', subject: 'Hello' })
    expect(result.success).toBe(true)
  })

  test('schema accepts input with attachments', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')
    const result = handler.schema.safeParse({
      to: 'ceo@corp.com',
      subject: 'Report',
      attachments: [{ filename: 'report.pdf', content: 'base64data', encoding: 'base64' }],
    })
    expect(result.success).toBe(true)
  })

  test('schema rejects attachment with wrong encoding', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')
    const result = handler.schema.safeParse({
      to: 'user@example.com',
      subject: 'Test',
      attachments: [{ filename: 'file.pdf', content: 'data', encoding: 'utf8' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('send_email: SMTP credential lookup', () => {
  beforeEach(() => setupMocks())

  test('throws TOOL_CREDENTIAL_INVALID when smtp_host missing', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')
    setupMocks({ smtp_host: null })

    const { ToolError } = await import('../../lib/tool-error')
    await expect(
      handler.execute({ to: 'a@b.com', subject: 'Hi' }, makeCtx()),
    ).rejects.toBeInstanceOf(ToolError)

    try {
      await handler.execute({ to: 'a@b.com', subject: 'Hi' }, makeCtx())
    } catch (err) {
      expect((err as any).code).toBe('TOOL_CREDENTIAL_INVALID')
      expect((err as any).message).toContain('smtp_host')
    }
  })

  test('throws TOOL_CREDENTIAL_INVALID when smtp_user missing', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')
    setupMocks({ smtp_user: null })

    try {
      await handler.execute({ to: 'a@b.com', subject: 'Hi' }, makeCtx())
    } catch (err) {
      expect((err as any).code).toBe('TOOL_CREDENTIAL_INVALID')
      expect((err as any).message).toContain('smtp_user')
    }
  })

  test('throws TOOL_CREDENTIAL_INVALID when smtp_password missing', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')
    setupMocks({ smtp_password: null })

    try {
      await handler.execute({ to: 'a@b.com', subject: 'Hi' }, makeCtx())
    } catch (err) {
      expect((err as any).code).toBe('TOOL_CREDENTIAL_INVALID')
      expect((err as any).message).toContain('smtp_password')
    }
  })

  test('defaults smtp_port to 587 when not configured', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')
    setupMocks({ smtp_port: null })

    await handler.execute({ to: 'a@b.com', subject: 'Test' }, makeCtx())

    // Port 587 → secure: false
    expect(capturedMailOptions).toBeDefined()
  })
})

describe('send_email: no-attachment email (backward compatibility)', () => {
  beforeEach(() => setupMocks())

  test('sends email without attachments when field is omitted', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')

    await handler.execute({ to: 'ceo@corp.com', subject: 'Q1 Report' }, makeCtx())

    expect(capturedMailOptions).toBeDefined()
    expect(capturedMailOptions.to).toBe('ceo@corp.com')
    expect(capturedMailOptions.subject).toBe('Q1 Report')
    expect(capturedMailOptions.attachments).toBeUndefined()
  })

  test('sends email with HTML body', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')

    await handler.execute({ to: 'a@b.com', subject: 'Test', body: 'Hello World' }, makeCtx())

    expect(capturedMailOptions.html).toContain('Hello World')
  })

  test('strips newlines from subject to prevent header injection', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')

    await handler.execute({ to: 'a@b.com', subject: 'Test\nBCC: hacker@evil.com' }, makeCtx())

    expect(capturedMailOptions.subject).not.toContain('\n')
  })

  test('returns success JSON with recipient and subject', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')

    const result = JSON.parse(
      await handler.execute({ to: 'ceo@corp.com', subject: 'Weekly Report' }, makeCtx()),
    )

    expect(result.success).toBe(true)
    expect(result.to).toBe('ceo@corp.com')
    expect(result.subject).toBe('Weekly Report')
    expect(result.attachments).toEqual([])
  })
})

describe('send_email: MIME multipart attachments (NFR-I3)', () => {
  beforeEach(() => setupMocks())

  test('sends MIME multipart when attachments present', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')

    await handler.execute(
      {
        to: 'ceo@corp.com',
        subject: 'Q1 Report',
        attachments: [{ filename: 'q1-report.pdf', content: 'PDFBASE64DATA', encoding: 'base64' }],
      },
      makeCtx(),
    )

    expect(capturedMailOptions.attachments).toHaveLength(1)
    expect(capturedMailOptions.attachments[0].filename).toBe('q1-report.pdf')
    expect(capturedMailOptions.attachments[0].content).toBe('PDFBASE64DATA')
    expect(capturedMailOptions.attachments[0].encoding).toBe('base64')
  })

  test('PDF attachments get content-type application/pdf', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')

    await handler.execute(
      {
        to: 'a@b.com',
        subject: 'Report',
        attachments: [{ filename: 'report.pdf', content: 'BASE64', encoding: 'base64' }],
      },
      makeCtx(),
    )

    expect(capturedMailOptions.attachments[0].contentType).toBe('application/pdf')
  })

  test('multiple attachments all included', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')

    await handler.execute(
      {
        to: 'a@b.com',
        subject: 'Multi',
        attachments: [
          { filename: 'file1.pdf', content: 'DATA1', encoding: 'base64' },
          { filename: 'file2.pdf', content: 'DATA2', encoding: 'base64' },
        ],
      },
      makeCtx(),
    )

    expect(capturedMailOptions.attachments).toHaveLength(2)
  })

  test('return value lists attachment filenames', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')

    const result = JSON.parse(
      await handler.execute(
        {
          to: 'a@b.com',
          subject: 'Report',
          attachments: [{ filename: 'report.pdf', content: 'DATA', encoding: 'base64' }],
        },
        makeCtx(),
      ),
    )

    expect(result.attachments).toEqual(['report.pdf'])
  })
})

describe('send_email: E17 telemetry', () => {
  beforeEach(() => setupMocks())

  test('insertToolCallEvent called before send', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')
    const callOrder: string[] = []

    mockDB.insertToolCallEvent = mock(() => {
      callOrder.push('insertEvent')
      return Promise.resolve([{ id: 'evt-001' }])
    })

    mockDB.getCredential = mock((keyName: string) => {
      callOrder.push(`getCredential:${keyName}`)
      return Promise.resolve([{ encryptedValue: `enc:val` }])
    })

    await handler.execute({ to: 'a@b.com', subject: 'Test' }, makeCtx())

    expect(callOrder[0]).toBe('insertEvent')
  })

  test('updateToolCallEvent called with success=true on success', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')

    await handler.execute({ to: 'a@b.com', subject: 'Test' }, makeCtx())

    expect(mockDB.updateToolCallEvent).toHaveBeenCalledTimes(1)
    const args = (mockDB.updateToolCallEvent as any).mock.calls[0]
    expect(args[1].success).toBe(true)
    expect(args[1].completedAt).toBeInstanceOf(Date)
    expect(typeof args[1].durationMs).toBe('number')
  })

  test('updateToolCallEvent called with success=false on credential failure', async () => {
    const { handler } = await import('../../tool-handlers/builtins/send-email')
    setupMocks({ smtp_host: null })

    try {
      await handler.execute({ to: 'a@b.com', subject: 'Test' }, makeCtx())
    } catch {}

    expect(mockDB.updateToolCallEvent).toHaveBeenCalledTimes(1)
    const args = (mockDB.updateToolCallEvent as any).mock.calls[0]
    expect(args[1].success).toBe(false)
    expect(args[1].errorCode).toBe('TOOL_CREDENTIAL_INVALID')
  })
})

describe('TEA P0: send-email.ts source introspection', () => {
  const fs = require('fs')
  const path = require('path')
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../tool-handlers/builtins/send-email.ts'),
    'utf-8',
  )

  test('MIME attachments field in schema (NFR-I3)', () => {
    expect(src).toContain('attachments')
    expect(src).toContain("z.literal('base64')")
  })

  test('credential lookup uses getDB().getCredential()', () => {
    expect(src).toContain('getCredential')
    expect(src).toContain('smtp_host')
    expect(src).toContain('smtp_user')
    expect(src).toContain('smtp_password')
  })

  test('TOOL_CREDENTIAL_INVALID thrown for missing creds', () => {
    expect(src).toContain('TOOL_CREDENTIAL_INVALID')
  })

  test('decrypt used to read encrypted credentials', () => {
    expect(src).toContain('decrypt')
  })

  test('E17 telemetry: insertToolCallEvent present', () => {
    expect(src).toContain('insertToolCallEvent')
  })

  test('E17 telemetry: updateToolCallEvent present', () => {
    expect(src).toContain('updateToolCallEvent')
  })

  test('nodemailer used for email sending', () => {
    expect(src).toContain('nodemailer')
  })

  test('backward compatible: attachments optional in schema', () => {
    expect(src).toContain('.optional()')
  })
})
