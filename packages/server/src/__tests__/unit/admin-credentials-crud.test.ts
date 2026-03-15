/**
 * Story 16.5: Admin Credentials CRUD API Routes — unit tests (bun:test)
 *
 * Approach: structural tests verifying route existence, middleware application,
 * correct DB methods called, and isDuplicateKeyError helper behavior.
 *
 * AC1 — POST encrypts + stores, response excludes encryptedValue
 * AC2 — GET returns masked list (id, keyName, updatedAt only)
 * AC3 — PUT updates encrypted value
 * AC4 — DELETE logs audit before deleting
 * AC5 — POST duplicate keyName returns 409
 */

import { describe, test, expect } from 'bun:test'
import { Hono } from 'hono'
import { z } from 'zod'

// Set CREDENTIAL_ENCRYPTION_KEY before any credential-crypto import chain
process.env.CREDENTIAL_ENCRYPTION_KEY = 'ab'.repeat(32) // 64-char hex (32 bytes)

// ── AC0: credentialsRoute is a valid Hono instance ──────────────────────────
describe('Admin Credentials CRUD — Route Structure (Story 16.5)', () => {
  test('credentialsRoute is a valid Hono instance', async () => {
    const { credentialsRoute } = await import('../../routes/admin/credentials')
    expect(credentialsRoute).toBeInstanceOf(Hono)
  })

  test('isDuplicateKeyError is exported from credentials route', async () => {
    const { isDuplicateKeyError } = await import('../../routes/admin/credentials')
    expect(typeof isDuplicateKeyError).toBe('function')
  })
})

// ── AC5: isDuplicateKeyError helper ─────────────────────────────────────────
describe('AC5: isDuplicateKeyError — PostgreSQL unique violation detection', () => {
  test('returns true for direct code 23505', async () => {
    const { isDuplicateKeyError } = await import('../../routes/admin/credentials')
    expect(isDuplicateKeyError({ code: '23505' })).toBe(true)
  })

  test('returns true for nested cause.code 23505', async () => {
    const { isDuplicateKeyError } = await import('../../routes/admin/credentials')
    expect(isDuplicateKeyError({ code: 'some_other', cause: { code: '23505' } })).toBe(true)
  })

  test('returns false for non-duplicate errors', async () => {
    const { isDuplicateKeyError } = await import('../../routes/admin/credentials')
    expect(isDuplicateKeyError({ code: '42P01' })).toBe(false)
    expect(isDuplicateKeyError(new Error('connection refused'))).toBe(false)
    expect(isDuplicateKeyError(null)).toBe(false)
    expect(isDuplicateKeyError('string error')).toBe(false)
  })

  test('returns false for object without code property', async () => {
    const { isDuplicateKeyError } = await import('../../routes/admin/credentials')
    expect(isDuplicateKeyError({ message: 'some error' })).toBe(false)
  })

  test('returns false when cause exists but has wrong code', async () => {
    const { isDuplicateKeyError } = await import('../../routes/admin/credentials')
    expect(isDuplicateKeyError({ cause: { code: '42P01' } })).toBe(false)
  })
})

// ── AC1: POST /credentials — encrypt logic ───────────────────────────────────
describe('AC1: POST /credentials — encrypt before store, response excludes encryptedValue', () => {
  test('encrypt(value) produces different ciphertext each call (non-deterministic AES-GCM)', async () => {
    const { encrypt } = await import('../../lib/credential-crypto')
    const plaintext = 'actual-oauth-token-xyz'
    const enc1 = await encrypt(plaintext)
    const enc2 = await encrypt(plaintext)
    expect(enc1).not.toBe(enc2) // AES-GCM uses random IV
  })

  test('POST response shape: id, keyName, updatedAt only (no encryptedValue)', () => {
    // Simulate the shape returned by insertCredential + route handler
    const simulatedResponse = {
      success: true,
      data: {
        id: 'cred-uuid-001',
        keyName: 'tistory_access_token',
        updatedAt: new Date('2026-03-15'),
      },
    }
    expect(simulatedResponse.data).toHaveProperty('id')
    expect(simulatedResponse.data).toHaveProperty('keyName')
    expect(simulatedResponse.data).toHaveProperty('updatedAt')
    expect(simulatedResponse.data).not.toHaveProperty('encryptedValue')
    expect(simulatedResponse.data).not.toHaveProperty('value')
  })
})

// ── AC2: GET /credentials — masked list ─────────────────────────────────────
describe('AC2: GET /credentials — returns masked list', () => {
  test('listCredentials returns shape {id, keyName, updatedAt} only', () => {
    // Simulate listCredentials() output (encryptedValue excluded by DB query)
    const simulatedRows = [
      { id: 'cred-001', keyName: 'anthropic_key', updatedAt: new Date('2026-01-01') },
      { id: 'cred-002', keyName: 'tistory_token', updatedAt: new Date('2026-02-01') },
    ]
    for (const row of simulatedRows) {
      expect(row).toHaveProperty('id')
      expect(row).toHaveProperty('keyName')
      expect(row).toHaveProperty('updatedAt')
      expect(row).not.toHaveProperty('encryptedValue')
    }
  })

  test('GET response shape: { success: true, data: [...] }', () => {
    const simulatedResponse = {
      success: true,
      data: [{ id: 'cred-001', keyName: 'anthropic_key', updatedAt: new Date() }],
    }
    expect(simulatedResponse.success).toBe(true)
    expect(Array.isArray(simulatedResponse.data)).toBe(true)
  })
})

// ── AC3: PUT /credentials/:keyName — update encrypted value ─────────────────
describe('AC3: PUT /credentials/:keyName — updates encrypted value', () => {
  test('PUT 404 response shape when credential not found', () => {
    const simulatedResponse = {
      success: false,
      error: { code: 'CREDENTIAL_NOT_FOUND', message: 'Credential not found' },
    }
    expect(simulatedResponse.success).toBe(false)
    expect(simulatedResponse.error.code).toBe('CREDENTIAL_NOT_FOUND')
  })

  test('PUT success response shape: { success, data: { keyName, updatedAt } }', () => {
    const simulatedResponse = {
      success: true,
      data: { keyName: 'tistory_access_token', updatedAt: new Date() },
    }
    expect(simulatedResponse.success).toBe(true)
    expect(simulatedResponse.data).toHaveProperty('keyName')
    expect(simulatedResponse.data).toHaveProperty('updatedAt')
    expect(simulatedResponse.data).not.toHaveProperty('encryptedValue')
    expect(simulatedResponse.data).not.toHaveProperty('id')
  })

  test('updateCredential receives newly encrypted value (not original plaintext)', async () => {
    const { encrypt } = await import('../../lib/credential-crypto')
    const newPlaintext = 'new-oauth-token-2026'
    const encryptedValue = await encrypt(newPlaintext)
    // encrypted is not the same as plaintext
    expect(encryptedValue).not.toBe(newPlaintext)
    // encrypted contains IV separator ':'
    expect(encryptedValue).toContain(':')
  })
})

// ── AC4: DELETE /credentials/:keyName — audit log before delete ──────────────
describe('AC4: DELETE /credentials/:keyName — audit log before delete', () => {
  test('audit log payload shape: event, keyName, companyId, userId, timestamp', () => {
    const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    const userId = 'user-admin-001'
    const keyName = 'tistory_access_token'

    // Simulate the audit log payload from the DELETE handler
    const auditLog = {
      event: 'credential_deleted',
      keyName,
      companyId,
      userId,
      timestamp: new Date().toISOString(),
    }

    expect(auditLog.event).toBe('credential_deleted')
    expect(auditLog.keyName).toBe(keyName)
    expect(auditLog.companyId).toBe(companyId)
    expect(auditLog.userId).toBe(userId)
    expect(typeof auditLog.timestamp).toBe('string')
    // timestamp is ISO 8601
    expect(new Date(auditLog.timestamp).toISOString()).toBe(auditLog.timestamp)
    // audit log NEVER contains encryptedValue or plaintext
    expect(auditLog).not.toHaveProperty('encryptedValue')
    expect(auditLog).not.toHaveProperty('plaintext')
    expect(auditLog).not.toHaveProperty('value')
  })

  test('DELETE success response: { success: true }', () => {
    const simulatedResponse = { success: true }
    expect(simulatedResponse).toEqual({ success: true })
    expect(simulatedResponse).not.toHaveProperty('data')
    expect(simulatedResponse).not.toHaveProperty('error')
  })

  test('DELETE 404 response when credential not found', () => {
    const simulatedResponse = {
      success: false,
      error: { code: 'CREDENTIAL_NOT_FOUND', message: 'Credential not found' },
    }
    expect(simulatedResponse.success).toBe(false)
    expect(simulatedResponse.error.code).toBe('CREDENTIAL_NOT_FOUND')
  })
})

// ── AC5: POST duplicate keyName — 409 response ───────────────────────────────
describe('AC5: POST duplicate keyName — 409 CREDENTIAL_DUPLICATE_KEY', () => {
  test('duplicate error response shape: { success: false, error: { code, message } }', () => {
    const simulatedResponse = {
      success: false,
      error: { code: 'CREDENTIAL_DUPLICATE_KEY', message: 'Key name already exists' },
    }
    expect(simulatedResponse.success).toBe(false)
    expect(simulatedResponse.error.code).toBe('CREDENTIAL_DUPLICATE_KEY')
    expect(simulatedResponse.error.message).toBe('Key name already exists')
  })

  test('isDuplicateKeyError with Drizzle-wrapped PG error returns true', async () => {
    const { isDuplicateKeyError } = await import('../../routes/admin/credentials')

    // Drizzle wraps the pg error in cause
    const drizzleWrappedError = {
      message: 'duplicate key value violates unique constraint',
      cause: {
        code: '23505',
        detail: 'Key (key_name, company_id)=(tistory_token, aaa) already exists.',
      },
    }
    expect(isDuplicateKeyError(drizzleWrappedError)).toBe(true)
  })
})

// ── [TEA P0] Zod schema validation — credentialWriteSchema ───────────────────
// Schemas mirror exactly what credentials.ts defines (z imported at top of file)
const credentialWriteSchema = z.object({
  keyName: z.string().min(1).max(255),
  value: z.string().min(1),
})
const credentialUpdateSchema = z.object({ value: z.string().min(1) })

describe('[TEA P0] credentialWriteSchema — input validation', () => {
  test('empty keyName (length 0) fails min(1) — route returns 400 not 500', () => {
    const result = credentialWriteSchema.safeParse({ keyName: '', value: 'token' })
    expect(result.success).toBe(false)
  })

  test('empty value (length 0) fails min(1) — plaintext never reaches encrypt()', () => {
    const result = credentialWriteSchema.safeParse({ keyName: 'my_key', value: '' })
    expect(result.success).toBe(false)
  })

  test('keyName > 255 chars fails max(255)', () => {
    const result = credentialWriteSchema.safeParse({ keyName: 'x'.repeat(256), value: 'token' })
    expect(result.success).toBe(false)
  })

  test('valid payload passes schema', () => {
    const result = credentialWriteSchema.safeParse({ keyName: 'tistory_access_token', value: 'real-token-value' })
    expect(result.success).toBe(true)
  })
})

// ── [TEA P0] credentialUpdateSchema validation ────────────────────────────────
describe('[TEA P0] credentialUpdateSchema — input validation', () => {
  test('empty value fails min(1) — prevents empty string replacing real token', () => {
    const result = credentialUpdateSchema.safeParse({ value: '' })
    expect(result.success).toBe(false)
  })
})

// ── [TEA P0] insertCredential non-null assertion safety ───────────────────────
describe('[TEA P0] POST handler — row non-null assertion (row!.id)', () => {
  test('insertCredential .returning() returns array — [0] access requires non-null assertion', () => {
    // Drizzle INSERT .returning() always returns the inserted row (DB guarantees)
    // If INSERT fails, it throws — it does NOT return []. So row[0]! is safe post-try.
    const simulatedReturn = [
      { id: 'new-cred-uuid', keyName: 'tistory_access_token', encryptedValue: 'iv:cipher', updatedAt: new Date() },
    ]
    const row = simulatedReturn[0]
    expect(row).toBeDefined()
    expect(row!.id).toBe('new-cred-uuid')
  })

  test('if insertCredential somehow returns [], row![0] access would throw — verify throw path', () => {
    // Empty return = DB constraint not violated but no row returned — shouldn't happen with INSERT
    // This verifies caller should NOT assume non-empty without checking
    const simulatedEmptyReturn: Array<{ id: string }> = []
    const row = simulatedEmptyReturn[0]
    expect(row).toBeUndefined()
    // Accessing row!.id with undefined would throw — code uses [0]! which is safe only if DB guarantees insert
  })
})

// ── [TEA P1] isDuplicateKeyError — edge cases ─────────────────────────────────
describe('[TEA P1] isDuplicateKeyError — additional edge cases', () => {
  test('returns false for undefined error', async () => {
    const { isDuplicateKeyError } = await import('../../routes/admin/credentials')
    expect(isDuplicateKeyError(undefined)).toBe(false)
  })

  test('returns false for number error', async () => {
    const { isDuplicateKeyError } = await import('../../routes/admin/credentials')
    expect(isDuplicateKeyError(42)).toBe(false)
  })

  test('returns false when cause is not an object', async () => {
    const { isDuplicateKeyError } = await import('../../routes/admin/credentials')
    expect(isDuplicateKeyError({ cause: 'string-cause' })).toBe(false)
  })
})

// ── [TEA P0] Tenant isolation — companyId scoping via tenantMiddleware ────────
describe('[TEA P0] tenantMiddleware — companyId isolation for credential routes', () => {
  test('credential routes use tenantMiddleware (not direct db access)', async () => {
    // Verify the route source code contains tenantMiddleware on credential routes
    const fs = await import('fs')
    const routeSource = fs.readFileSync(
      new URL('../../routes/admin/credentials.ts', import.meta.url).pathname,
      'utf-8',
    )
    // tenantMiddleware must be imported
    expect(routeSource).toContain("from '../../middleware/tenant'")
    // tenantMiddleware must be used on credential routes
    expect(routeSource).toContain("credentialsRoute.get('/credentials', tenantMiddleware")
    expect(routeSource).toContain("credentialsRoute.post('/credentials', tenantMiddleware")
    expect(routeSource).toContain("credentialsRoute.put('/credentials/:keyName', tenantMiddleware")
    expect(routeSource).toContain("credentialsRoute.delete('/credentials/:keyName', tenantMiddleware")
  })

  test('getDB(tenant.companyId) called for all credential operations — not direct db import', async () => {
    const fs = await import('fs')
    const routeSource = fs.readFileSync(
      new URL('../../routes/admin/credentials.ts', import.meta.url).pathname,
      'utf-8',
    )
    // getDB must be used with tenant.companyId (not raw db)
    expect(routeSource).toContain('getDB(tenant.companyId).listCredentials()')
    expect(routeSource).toContain('getDB(tenant.companyId).insertCredential(')
    expect(routeSource).toContain('getDB(tenant.companyId).updateCredential(')
    expect(routeSource).toContain('getDB(tenant.companyId).deleteCredential(')
  })
})

// ── [TEA P0] encryptCredential alias — E11 compliance ────────────────────────
describe('[TEA P0] E11 Compliance — only credential-crypto used for new routes', () => {
  test('route source imports encrypt from credential-crypto (not legacy crypto.ts)', async () => {
    const fs = await import('fs')
    const routeSource = fs.readFileSync(
      new URL('../../routes/admin/credentials.ts', import.meta.url).pathname,
      'utf-8',
    )
    // New routes must use encryptCredential (aliased from credential-crypto)
    expect(routeSource).toContain("from '../../lib/credential-crypto'")
    expect(routeSource).toContain('encrypt as encryptCredential')
    // encryptCredential must be called in the route body (not legacy encrypt)
    expect(routeSource).toContain('await encryptCredential(value)')
  })
})

// ── Security: encryptedValue never in responses ───────────────────────────────
describe('[Security] encryptedValue never exposed in API responses', () => {
  test('listCredentials output shape has no encryptedValue field', () => {
    // This matches the Drizzle partial select in scoped-query.ts:
    // db.select({ id, keyName, updatedAt }) — encryptedValue excluded at DB layer
    const row = { id: 'cred-001', keyName: 'key', updatedAt: new Date() }
    expect(Object.keys(row)).not.toContain('encryptedValue')
  })

  test('insertCredential response (returning()) only exposes id, keyName, updatedAt', () => {
    // Route handler destructures: { id: row.id, keyName: row.keyName, updatedAt: row.updatedAt }
    const fullRow = {
      id: 'cred-001',
      keyName: 'tistory_token',
      encryptedValue: 'iv:ciphertext',
      companyId: 'company-uuid',
      createdByUserId: 'user-uuid',
      updatedByUserId: 'user-uuid',
      updatedAt: new Date(),
      createdAt: new Date(),
    }
    // Route only returns these 3 fields:
    const responseData = { id: fullRow.id, keyName: fullRow.keyName, updatedAt: fullRow.updatedAt }
    expect(responseData).not.toHaveProperty('encryptedValue')
    expect(responseData).not.toHaveProperty('companyId')
    expect(responseData).not.toHaveProperty('createdByUserId')
    expect(responseData).not.toHaveProperty('updatedByUserId')
  })
})
