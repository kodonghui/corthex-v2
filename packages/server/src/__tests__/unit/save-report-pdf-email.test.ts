/**
 * save-report-pdf-email.test.ts — Story 20.4: pdf_email channel integration
 *
 * Tests the pdf_email distributor chain:
 *   md_to_pdf(corporate) → send_email(attachment: PDF)
 *
 * TEA Risk-based coverage:
 *   - Missing SMTP credentials → TOOL_CREDENTIAL_INVALID (E15: partial failure)
 *   - Puppeteer failure → TOOL_RESOURCE_UNAVAILABLE (E15: partial failure)
 *   - Happy path: PDF generated + email sent with MIME attachment
 *   - smtp_recipient fallback: use smtp_user when smtp_recipient not configured
 *   - Other channels unaffected when pdf_email fails (E15 contract)
 *   - distribution_results.pdf_email = 'success' on success
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'

// --- Mutable state controlled by tests ---

let smtpCredentials: Record<string, string | null> = {}
let capturedMailOptions: any = null
let puppeteerShouldFail = false

function defaultSmtpCreds(overrides: Record<string, string | null> = {}) {
  smtpCredentials = {
    smtp_host: 'smtp.example.com',
    smtp_user: 'bot@corp.com',
    smtp_password: 'pass123',
    smtp_port: '587',
    smtp_recipient: 'ceo@corp.com',
    ...overrides,
  }
}

// ToolResourceUnavailableError class (shared by mock + assertions)
class MockToolResourceUnavailableError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'ToolResourceUnavailableError'
  }
}

// --- Mock modules (stable, use mutable state) ---

mock.module('../../db/scoped-query', () => ({
  getDB: (_companyId: string) => ({
    insertToolCallEvent: () => Promise.resolve([{ id: 'evt-001' }]),
    updateToolCallEvent: () => Promise.resolve([]),
    insertReport: () => Promise.resolve([{ id: 'rpt-001' }]),
    updateReportDistribution: () => Promise.resolve([]),
    getCredential: (keyName: string) => {
      const val = smtpCredentials[keyName]
      if (!val) return Promise.resolve([])
      return Promise.resolve([{ encryptedValue: val }])
    },
  }),
}))

mock.module('../../lib/credential-crypto', () => ({
  decrypt: (v: string) => Promise.resolve(v),
  _validateKeyHex: () => {},
}))

mock.module('../../lib/puppeteer-pool', () => ({
  withPuppeteer: async (fn: (browser: any) => Promise<string>) => {
    if (puppeteerShouldFail) {
      throw new MockToolResourceUnavailableError('puppeteer_pool_timeout')
    }
    const fakeBrowser = {
      newPage: () =>
        Promise.resolve({
          setContent: () => Promise.resolve(),
          pdf: () => Promise.resolve(Buffer.from('PDF_BYTES')),
          close: () => Promise.resolve(),
        }),
    }
    return fn(fakeBrowser)
  },
  ToolResourceUnavailableError: MockToolResourceUnavailableError,
}))

mock.module('nodemailer', () => ({
  createTransport: (_config: any) => ({
    sendMail: (opts: any) => {
      capturedMailOptions = opts
      return Promise.resolve({ messageId: 'msg-id' })
    },
  }),
}))

mock.module('marked', () => ({
  marked: { parse: (md: string) => `<p>${md}</p>` },
}))

// --- Reset before each test ---

function reset(credOverrides: Record<string, string | null> = {}) {
  capturedMailOptions = null
  puppeteerShouldFail = false
  defaultSmtpCreds(credOverrides)
}

// --- Context factory ---

function makeCtx() {
  return { companyId: 'company-123', agentId: 'agent-456', runId: 'run-789' } as any
}

// --- Tests ---

describe('pdf_email channel: SMTP credential failures → TOOL_CREDENTIAL_INVALID (E15)', () => {
  beforeEach(() => reset())

  test('missing smtp_host → pdf_email fails with TOOL_CREDENTIAL_INVALID in partial failure', async () => {
    reset({ smtp_host: null })
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute(
        { title: 'T', content: 'C', distribute_to: ['web_dashboard', 'pdf_email'] },
        makeCtx(),
      ),
    )

    const webResult = result.channels.find((c: any) => c.channel === 'web_dashboard')
    const pdfResult = result.channels.find((c: any) => c.channel === 'pdf_email')
    expect(webResult.status).toBe('success')
    expect(pdfResult.status).toBe('failed')
    expect(pdfResult.error).toBe('TOOL_CREDENTIAL_INVALID')
  })

  test('missing smtp_user → pdf_email fails gracefully', async () => {
    reset({ smtp_user: null })
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute(
        { title: 'T', content: 'C', distribute_to: ['pdf_email'] },
        makeCtx(),
      ),
    )

    expect(result.channels[0].status).toBe('failed')
    expect(result.channels[0].error).toBe('TOOL_CREDENTIAL_INVALID')
  })

  test('missing smtp_password → pdf_email fails gracefully', async () => {
    reset({ smtp_password: null })
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute(
        { title: 'T', content: 'C', distribute_to: ['pdf_email'] },
        makeCtx(),
      ),
    )

    expect(result.channels[0].status).toBe('failed')
    expect(result.channels[0].error).toBe('TOOL_CREDENTIAL_INVALID')
  })

  test('credential failure does NOT affect web_dashboard (E15 partial failure)', async () => {
    reset({ smtp_host: null })
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute(
        { title: 'T', content: 'C', distribute_to: ['web_dashboard', 'pdf_email'] },
        makeCtx(),
      ),
    )

    expect(result.reportId).toBeDefined()
    const web = result.channels.find((c: any) => c.channel === 'web_dashboard')
    expect(web.status).toBe('success')
  })
})

describe('pdf_email channel: Puppeteer failure → TOOL_RESOURCE_UNAVAILABLE (E15)', () => {
  beforeEach(() => reset())

  test('Puppeteer pool timeout → pdf_email fails with TOOL_RESOURCE_UNAVAILABLE', async () => {
    puppeteerShouldFail = true
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute(
        { title: 'T', content: 'C', distribute_to: ['web_dashboard', 'pdf_email'] },
        makeCtx(),
      ),
    )

    const pdfResult = result.channels.find((c: any) => c.channel === 'pdf_email')
    expect(pdfResult.status).toBe('failed')
    expect(pdfResult.error).toBe('TOOL_RESOURCE_UNAVAILABLE')

    const webResult = result.channels.find((c: any) => c.channel === 'web_dashboard')
    expect(webResult.status).toBe('success')
  })
})

describe('pdf_email channel: happy path', () => {
  beforeEach(() => reset())

  test('pdf_email sends email to smtp_recipient', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    const result = JSON.parse(
      await handler.execute(
        { title: 'Q1 Report', content: '## Sales\n10M revenue', distribute_to: ['pdf_email'] },
        makeCtx(),
      ),
    )

    expect(result.channels[0].status).toBe('success')
    expect(result.channels[0].channel).toBe('pdf_email')
    expect(capturedMailOptions).not.toBeNull()
    expect(capturedMailOptions.subject).toBe('Q1 Report')
    expect(capturedMailOptions.to).toBe('ceo@corp.com')
  })

  test('pdf_email sends attachment with PDF content-type', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    await handler.execute(
      { title: 'Report', content: 'Content', distribute_to: ['pdf_email'] },
      makeCtx(),
    )

    expect(capturedMailOptions.attachments).toHaveLength(1)
    expect(capturedMailOptions.attachments[0].contentType).toBe('application/pdf')
    expect(capturedMailOptions.attachments[0].encoding).toBe('base64')
  })

  test('pdf_email attachment filename contains report title', async () => {
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    await handler.execute(
      { title: 'Q1 Sales Analysis', content: 'Content', distribute_to: ['pdf_email'] },
      makeCtx(),
    )

    expect(capturedMailOptions.attachments[0].filename).toContain('Q1 Sales Analysis')
  })
})

describe('pdf_email channel: smtp_recipient fallback', () => {
  beforeEach(() => reset())

  test('falls back to smtp_user when smtp_recipient not configured', async () => {
    reset({ smtp_recipient: null })
    const { handler } = await import('../../tool-handlers/builtins/save-report')

    await handler.execute(
      { title: 'T', content: 'C', distribute_to: ['pdf_email'] },
      makeCtx(),
    )

    expect(capturedMailOptions.to).toBe('bot@corp.com')
  })
})

describe('TEA P0: save-report.ts pdf_email source introspection', () => {
  const fs = require('fs')
  const path = require('path')
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../tool-handlers/builtins/save-report.ts'),
    'utf-8',
  )

  test('pdf_email case uses getCredential for SMTP config', () => {
    expect(src).toContain("getCredential('smtp_host')")
    expect(src).toContain("getCredential('smtp_user')")
    expect(src).toContain("getCredential('smtp_password')")
  })

  test('TOOL_CREDENTIAL_INVALID thrown on missing SMTP credentials', () => {
    expect(src).toContain('TOOL_CREDENTIAL_INVALID')
  })

  test('TOOL_RESOURCE_UNAVAILABLE thrown on Puppeteer failure', () => {
    expect(src).toContain('TOOL_RESOURCE_UNAVAILABLE')
    expect(src).toContain('ToolResourceUnavailableError')
  })

  test('pdf_email uses withPuppeteer for PDF generation', () => {
    expect(src).toContain('withPuppeteer')
  })

  test('pdf_email uses marked.parse for markdown conversion', () => {
    expect(src).toContain('marked.parse')
  })

  test('pdf_email sends MIME attachment', () => {
    expect(src).toContain('attachments')
    expect(src).toContain('contentType')
    expect(src).toContain('application/pdf')
  })

  test('smtp_recipient fallback to smtp_user', () => {
    expect(src).toContain('smtp_recipient')
    expect(src).toContain('smtpUser')
  })

  test('still uses Promise.allSettled (E15 preserved)', () => {
    expect(src).toContain('Promise.allSettled')
  })
})
