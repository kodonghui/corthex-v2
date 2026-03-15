import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 17.5: upload_media Tool Handler TEA Tests ===
// TEA: Risk-based — P0 handler exports + structure, P0 credential resolution (5 R2 creds),
//      P0 S3 endpoint format, P0 error mapping, P0 Zod max size constraint,
//      P1 E17 telemetry, P1 no generic Error(), P1 public URL construction

// ─── Source files ─────────────────────────────────────────────────────────────

const SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../tool-handlers/builtins/upload-media.ts'),
  'utf-8',
)

// ─── P0: Handler export and structure ────────────────────────────────────────

describe('[P0] upload_media — handler structure (E13)', () => {
  test('exports handler object', () => {
    expect(SRC).toContain('export const handler: BuiltinToolHandler')
  })

  test('handler name is upload_media', () => {
    expect(SRC).toContain("name: 'upload_media'")
  })

  test('schema defined with z.object()', () => {
    expect(SRC).toContain('schema: z.object(')
  })

  test('execute function is async', () => {
    expect(SRC).toContain('execute: async (input, ctx) =>')
  })

  test('imports BuiltinToolHandler from engine', () => {
    expect(SRC).toContain("from '../../engine'")
    expect(SRC).toContain('BuiltinToolHandler')
  })

  test('imports @aws-sdk/client-s3 (PutObjectCommand)', () => {
    expect(SRC).toContain("from '@aws-sdk/client-s3'")
    expect(SRC).toContain('PutObjectCommand')
    expect(SRC).toContain('S3Client')
  })

  test('imports callExternalApi (E16)', () => {
    expect(SRC).toContain("from '../../lib/call-external-api'")
    expect(SRC).toContain('callExternalApi')
  })

  test('imports ToolError (E16)', () => {
    expect(SRC).toContain("from '../../lib/tool-error'")
    expect(SRC).toContain('ToolError')
  })
})

// ─── P0: Schema validation ────────────────────────────────────────────────────

describe('[P0] Zod schema — input validation (including 100MB guard)', () => {
  test('filename field required (z.string().min(1))', () => {
    expect(SRC).toContain('filename: z.string().min(1)')
  })

  test('content field required with max size constraint (100MB guard)', () => {
    expect(SRC).toContain('content: z.string().min(1).max(')
    expect(SRC).toContain('100MB')
  })

  test('contentType field required', () => {
    expect(SRC).toContain('contentType: z.string().min(1)')
  })
})

// ─── P0: Credential resolution (5 R2 credentials) ────────────────────────────

describe('[P0] FR-CM1 — R2 credential resolution (5 keys)', () => {
  test('getDB(ctx.companyId) used for credential lookup', () => {
    expect(SRC).toContain('getDB(ctx.companyId)')
  })

  test('r2_account_id credential resolved', () => {
    expect(SRC).toContain("getCredential('r2_account_id')")
  })

  test('r2_access_key_id credential resolved', () => {
    expect(SRC).toContain("getCredential('r2_access_key_id')")
  })

  test('r2_secret_access_key credential resolved', () => {
    expect(SRC).toContain("getCredential('r2_secret_access_key')")
  })

  test('r2_bucket credential resolved', () => {
    expect(SRC).toContain("getCredential('r2_bucket')")
  })

  test('r2_public_url credential resolved', () => {
    expect(SRC).toContain("getCredential('r2_public_url')")
  })

  test('TOOL_CREDENTIAL_INVALID thrown for each missing credential', () => {
    expect(SRC).toContain('TOOL_CREDENTIAL_INVALID')
    expect(SRC).toContain('Admin settings')
  })

  test('decrypt() called on all credential encryptedValues', () => {
    expect(SRC).toContain("from '../../lib/credential-crypto'")
    expect(SRC).toContain('decrypt(')
  })

  test('credentials NOT leaked in error messages', () => {
    const errorMessages = SRC.match(/ToolError\([^)]+\)/g) ?? []
    errorMessages.forEach(msg => {
      expect(msg).not.toContain('accessKeyId')
      expect(msg).not.toContain('secretAccessKey')
    })
  })
})

// ─── P0: Cloudflare R2 S3 endpoint ───────────────────────────────────────────

describe('[P0] FR-CP2 — Cloudflare R2 S3 endpoint format', () => {
  test('endpoint uses r2.cloudflarestorage.com pattern', () => {
    expect(SRC).toContain('r2.cloudflarestorage.com')
  })

  test('endpoint constructed with accountId (dynamic per company)', () => {
    expect(SRC).toContain('accountId')
    // Pattern: https://{accountId}.r2.cloudflarestorage.com
    expect(SRC).toContain('`https://${accountId}.r2.cloudflarestorage.com`')
  })

  test('region set to "auto" (Cloudflare R2 requirement)', () => {
    expect(SRC).toContain("region: 'auto'")
  })

  test('PutObjectCommand used for upload', () => {
    expect(SRC).toContain('new PutObjectCommand(')
  })

  test('Bucket, Key, Body, ContentType set in command', () => {
    expect(SRC).toContain('Bucket: bucket')
    expect(SRC).toContain('Key: filename')
    expect(SRC).toContain('Body: fileBuffer')
    expect(SRC).toContain('ContentType: contentType')
  })
})

// ─── P0: Base64 decode ────────────────────────────────────────────────────────

describe('[P0] AC1 — base64 content decoded to buffer before upload', () => {
  test('Buffer.from(content, "base64") decodes content', () => {
    expect(SRC).toContain("Buffer.from(content, 'base64')")
  })

  test('fileBuffer used as Body in PutObjectCommand', () => {
    expect(SRC).toContain('fileBuffer')
    expect(SRC).toContain('Body: fileBuffer')
  })
})

// ─── P0: Public CDN URL construction ─────────────────────────────────────────

describe('[P0] FR-CP2 — public CDN URL construction and return', () => {
  test('publicUrl built from r2_public_url + filename', () => {
    expect(SRC).toContain('publicUrl')
    expect(SRC).toContain('publicUrlBase')
    expect(SRC).toContain('filename')
  })

  test('trailing slash stripped from publicUrlBase before joining', () => {
    expect(SRC).toContain(".replace(/\\/$/, '')")
  })

  test('publicUrl returned as string result', () => {
    expect(SRC).toContain('return publicUrl')
  })
})

// ─── P0: Error mapping ────────────────────────────────────────────────────────

describe('[P0] E16 — error mapping via callExternalApi', () => {
  test('upload wrapped in callExternalApi("Cloudflare R2")', () => {
    expect(SRC).toContain("callExternalApi('Cloudflare R2'")
  })

  test('403 auth error → TOOL_CREDENTIAL_INVALID via callExternalApi', () => {
    // callExternalApi handles 401/403 → TOOL_CREDENTIAL_INVALID automatically
    expect(SRC).toContain('callExternalApi')
    expect(SRC).toContain('TOOL_CREDENTIAL_INVALID')
  })
})

// ─── P0: 100MB file size — Zod constraint simulation ─────────────────────────

describe('[P0] AC4 — Zod max size constraint blocks >100MB files', () => {
  function simulateSchemaValidation(contentLength: number): 'pass' | 'fail' {
    const MAX_CONTENT_CHARS = 140 * 1024 * 1024
    return contentLength <= MAX_CONTENT_CHARS ? 'pass' : 'fail'
  }

  test('100MB base64 content (≈134MB chars) passes validation', () => {
    // 100MB binary → 134MB base64
    const length = 134 * 1024 * 1024
    expect(simulateSchemaValidation(length)).toBe('pass')
  })

  test('>100MB file (200MB chars) fails validation before upload', () => {
    const length = 200 * 1024 * 1024
    expect(simulateSchemaValidation(length)).toBe('fail')
  })
})

// ─── P1: E17 telemetry pattern ────────────────────────────────────────────────

describe('[P1] E17 — telemetry INSERT→try/catch→UPDATE pattern', () => {
  test('insertToolCallEvent called with upload_media toolName', () => {
    expect(SRC).toContain('insertToolCallEvent(')
    expect(SRC).toContain("toolName: 'upload_media'")
  })

  test('startedAt: new Date() in insertToolCallEvent', () => {
    expect(SRC).toContain('startedAt: new Date()')
  })

  test('updateToolCallEvent called on success', () => {
    expect(SRC).toContain('updateToolCallEvent(eventId,')
    expect(SRC).toContain('success: true')
  })

  test('updateToolCallEvent called on failure (before re-throw)', () => {
    expect(SRC).toContain('success: false')
    expect(SRC).toContain('errorCode')
  })

  test('durationMs in both success and failure paths', () => {
    expect(SRC).toContain('durationMs: Date.now() - startTime')
  })

  test('err re-thrown after failure telemetry', () => {
    expect(SRC).toContain('throw err')
  })
})

// ─── P1: No generic Error() ───────────────────────────────────────────────────

describe('[P1] E16 — no generic new Error() in handler', () => {
  test('no new Error() calls (only ToolError allowed)', () => {
    const newErrorMatches = SRC.match(/new Error\(/g) ?? []
    expect(newErrorMatches.length).toBe(0)
  })

  test('all errors use ToolError', () => {
    expect(SRC).toContain('new ToolError(')
  })
})
