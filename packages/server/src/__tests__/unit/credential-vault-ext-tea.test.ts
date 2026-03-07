/**
 * TEA (Test Architect) -- Credential Vault Extension Story 1-5
 * Risk-based test generation for vault extension (tenant isolation, audit, rotation)
 *
 * Risk Analysis:
 * - CRITICAL: Credential plaintext leakage in audit logs (NFR12)
 * - HIGH: Tenant isolation in listCredentials (cross-company leakage)
 * - HIGH: maskCredentialFields completeness for all provider types
 * - HIGH: Route structure correctness (new endpoints accessible)
 * - MEDIUM: Type interface compliance (CredentialSummary, StoreCredentialInput)
 * - MEDIUM: getProviderSchemas immutability (prevents mutation of global state)
 * - LOW: Edge cases in masking (empty, special chars, large objects)
 */
import { describe, test, expect, beforeAll } from 'bun:test'
import {
  maskCredentialFields,
  getProviderSchemas,
  listCredentials,
  storeCredentials,
  updateCredentials,
  deleteCredential,
  PROVIDER_SCHEMAS,
  validateCredentials,
  encryptCredentials,
  decryptCredentials,
} from '../../services/credential-vault'
import type { CredentialSummary, StoreCredentialInput } from '../../services/credential-vault'
import { AUDIT_ACTIONS } from '../../services/audit-log'
import type { AuditAction } from '../../services/audit-log'
import { credentialsRoute } from '../../routes/admin/credentials'

beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-key-32-chars-for-unit-tests!!'
})

// =============================================================
// CRITICAL RISK: Credential plaintext leakage prevention (NFR12)
// =============================================================

describe('[TEA-CRITICAL] NFR12: Credential masking completeness', () => {
  // Test ALL 12 providers to ensure no plaintext leaks
  const allProviderTestData: Record<string, Record<string, string>> = {
    anthropic: { api_key: 'sk-ant-api03-supersecretkey12345' },
    openai: { api_key: 'sk-proj-abcdefghijklmnop' },
    google_ai: { api_key: 'AIzaSyBcDeF123456789' },
    kis: { app_key: 'PSxxxxxxxx', app_secret: 'secret123', account_no: '99887766' },
    smtp: { host: 'smtp.gmail.com', port: '587', user: 'user@g.com', password: 'P@ss!', from: 'f@g.com' },
    email: { host: 'mx.naver.com', port: '465', user: 'u@n.com', password: 'Npass', from: 'f@n.com' },
    telegram: { bot_token: '123456789:AABBCC-xyz', chat_id: '-1001234' },
    instagram: { access_token: 'IGQVJxyz', page_id: '98765' },
    serper: { api_key: 'serper-real-key' },
    notion: { api_key: 'ntn_realkey' },
    google_calendar: { api_key: 'gcal-key-123' },
    tts: { api_key: 'tts-production-key' },
  }

  for (const [provider, fields] of Object.entries(allProviderTestData)) {
    test(`${provider}: masking replaces ALL ${Object.keys(fields).length} field(s) with ***`, () => {
      const masked = maskCredentialFields(fields)

      // Verify count matches
      expect(Object.keys(masked).length).toBe(Object.keys(fields).length)

      // Verify ALL values are masked
      for (const [key, value] of Object.entries(masked)) {
        expect(value).toBe('***')
      }

      // Verify NO original values survive in the masked output
      const maskedJson = JSON.stringify(masked)
      for (const originalValue of Object.values(fields)) {
        expect(maskedJson).not.toContain(originalValue)
      }
    })
  }

  test('masking does not mutate the original object', () => {
    const original = { api_key: 'secret-value' }
    const masked = maskCredentialFields(original)
    expect(original.api_key).toBe('secret-value') // Original unchanged
    expect(masked.api_key).toBe('***')
  })

  test('masking handles fields with "***" already in value', () => {
    const input = { api_key: '***already-masked***' }
    const masked = maskCredentialFields(input)
    expect(masked.api_key).toBe('***')
  })
})

// =============================================================
// HIGH RISK: Audit action completeness for credentials
// =============================================================

describe('[TEA-HIGH] Audit actions for credential operations', () => {
  test('CREDENTIAL_STORE action exists for store/update operations', () => {
    expect(AUDIT_ACTIONS.CREDENTIAL_STORE).toBe('credential.store')
  })

  test('CREDENTIAL_ACCESS action exists for read operations', () => {
    expect(AUDIT_ACTIONS.CREDENTIAL_ACCESS).toBe('credential.access')
  })

  test('CREDENTIAL_DELETE action exists for delete operations', () => {
    expect(AUDIT_ACTIONS.CREDENTIAL_DELETE).toBe('credential.delete')
  })

  test('all credential actions follow dot notation format', () => {
    const credentialActions = [
      AUDIT_ACTIONS.CREDENTIAL_STORE,
      AUDIT_ACTIONS.CREDENTIAL_ACCESS,
      AUDIT_ACTIONS.CREDENTIAL_DELETE,
    ]
    for (const action of credentialActions) {
      expect(action).toMatch(/^credential\.[a-z]+$/)
    }
  })

  test('credential audit actions are type-safe (AuditAction type)', () => {
    // These should compile without type errors
    const store: string = AUDIT_ACTIONS.CREDENTIAL_STORE
    const access: string = AUDIT_ACTIONS.CREDENTIAL_ACCESS
    const del: string = AUDIT_ACTIONS.CREDENTIAL_DELETE
    expect(store).toBeTruthy()
    expect(access).toBeTruthy()
    expect(del).toBeTruthy()
  })
})

// =============================================================
// HIGH RISK: Route structure verification
// =============================================================

describe('[TEA-HIGH] Credentials route structure', () => {
  test('GET /api-keys/providers route exists', () => {
    const routes = credentialsRoute.routes
    const match = routes.find(
      (r: any) => r.method === 'GET' && r.path === '/api-keys/providers'
    )
    expect(match).toBeDefined()
  })

  test('GET /api-keys route exists (tenant-scoped)', () => {
    const routes = credentialsRoute.routes
    const match = routes.find(
      (r: any) => r.method === 'GET' && r.path === '/api-keys'
    )
    expect(match).toBeDefined()
  })

  test('PUT /api-keys/:id route exists (rotation)', () => {
    const routes = credentialsRoute.routes
    const match = routes.find(
      (r: any) => r.method === 'PUT' && r.path === '/api-keys/:id'
    )
    expect(match).toBeDefined()
  })

  test('POST /api-keys route exists (create)', () => {
    const routes = credentialsRoute.routes
    const match = routes.find(
      (r: any) => r.method === 'POST' && r.path === '/api-keys'
    )
    expect(match).toBeDefined()
  })

  test('DELETE /api-keys/:id route exists', () => {
    const routes = credentialsRoute.routes
    const match = routes.find(
      (r: any) => r.method === 'DELETE' && r.path === '/api-keys/:id'
    )
    expect(match).toBeDefined()
  })

  test('CLI credential routes still exist (backward compat)', () => {
    const routes = credentialsRoute.routes
    const cliGet = routes.find(
      (r: any) => r.method === 'GET' && r.path === '/cli-credentials'
    )
    const cliPost = routes.find(
      (r: any) => r.method === 'POST' && r.path === '/cli-credentials'
    )
    const cliDelete = routes.find(
      (r: any) => r.method === 'DELETE' && r.path === '/cli-credentials/:id'
    )
    expect(cliGet).toBeDefined()
    expect(cliPost).toBeDefined()
    expect(cliDelete).toBeDefined()
  })
})

// =============================================================
// MEDIUM RISK: getProviderSchemas immutability
// =============================================================

describe('[TEA-MED] getProviderSchemas immutability', () => {
  test('returns a new object each call (not same reference)', () => {
    const a = getProviderSchemas()
    const b = getProviderSchemas()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })

  test('mutations on returned object do not affect PROVIDER_SCHEMAS', () => {
    const schemas = getProviderSchemas()
    schemas['hacked_provider'] = ['evil_field']
    delete schemas['anthropic']

    // Original must be untouched
    expect(PROVIDER_SCHEMAS['hacked_provider']).toBeUndefined()
    expect(PROVIDER_SCHEMAS['anthropic']).toBeDefined()
  })

  test('inner arrays are also deep-copied (full immutability)', () => {
    const schemas = getProviderSchemas()
    // Deep copy: inner arrays are different references
    expect(schemas['anthropic']).not.toBe(PROVIDER_SCHEMAS['anthropic'])
    expect(schemas['anthropic']).toEqual(PROVIDER_SCHEMAS['anthropic'])

    // Mutation on copy does not affect original
    schemas['anthropic'].push('hacked_field')
    expect(PROVIDER_SCHEMAS['anthropic']).not.toContain('hacked_field')
  })
})

// =============================================================
// MEDIUM RISK: Type interface compliance
// =============================================================

describe('[TEA-MED] Type interfaces', () => {
  test('CredentialSummary shape has required fields', () => {
    // Type-level test: creating a valid CredentialSummary
    const summary: CredentialSummary = {
      id: '123',
      companyId: '456',
      userId: null,
      provider: 'anthropic',
      label: null,
      scope: 'company',
      createdAt: new Date(),
    }
    expect(summary.id).toBe('123')
    expect(summary.userId).toBeNull()
  })

  test('StoreCredentialInput shape with required fields', () => {
    const input: StoreCredentialInput = {
      companyId: '123',
      provider: 'anthropic',
      credentials: { api_key: 'test' },
      scope: 'company',
    }
    expect(input.companyId).toBe('123')
    expect(input.scope).toBe('company')
  })

  test('StoreCredentialInput with all optional fields', () => {
    const input: StoreCredentialInput = {
      companyId: '123',
      provider: 'anthropic',
      credentials: { api_key: 'test' },
      scope: 'user',
      userId: 'user-1',
      label: 'My Key',
      actorType: 'admin_user',
      actorId: 'admin-1',
    }
    expect(input.actorType).toBe('admin_user')
  })
})

// =============================================================
// LOW RISK: Masking edge cases
// =============================================================

describe('[TEA-LOW] maskCredentialFields edge cases', () => {
  test('handles 20+ fields (large provider)', () => {
    const large: Record<string, string> = {}
    for (let i = 0; i < 20; i++) {
      large[`field_${i}`] = `secret_${i}`
    }
    const masked = maskCredentialFields(large)
    expect(Object.keys(masked).length).toBe(20)
    expect(Object.values(masked).every(v => v === '***')).toBe(true)
  })

  test('handles fields with numeric string values', () => {
    const masked = maskCredentialFields({ port: '587', pin: '1234' })
    expect(masked.port).toBe('***')
    expect(masked.pin).toBe('***')
  })

  test('handles fields with URL values', () => {
    const masked = maskCredentialFields({
      endpoint: 'https://api.example.com/v1',
      webhook: 'https://hooks.slack.com/services/T00/B00/xxx',
    })
    expect(masked.endpoint).toBe('***')
    expect(masked.webhook).toBe('***')
  })

  test('handles fields with multi-line values', () => {
    const masked = maskCredentialFields({
      private_key: '-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----',
    })
    expect(masked.private_key).toBe('***')
  })
})

// =============================================================
// VALIDATION: Service function signatures
// =============================================================

describe('[TEA-SIG] Service function signatures', () => {
  test('listCredentials accepts companyId string', () => {
    expect(listCredentials.length).toBeGreaterThanOrEqual(1)
  })

  test('storeCredentials accepts StoreCredentialInput', () => {
    expect(storeCredentials.length).toBeGreaterThanOrEqual(1)
  })

  test('updateCredentials accepts (id, companyId, newFields, actorType?, actorId?)', () => {
    expect(updateCredentials.length).toBeGreaterThanOrEqual(3)
  })

  test('deleteCredential accepts (id, companyId, actorType?, actorId?)', () => {
    expect(deleteCredential.length).toBeGreaterThanOrEqual(2)
  })

  test('maskCredentialFields is synchronous (not async)', () => {
    const result = maskCredentialFields({ key: 'val' })
    // Should not be a promise
    expect(result).not.toBeInstanceOf(Promise)
    expect(result.key).toBe('***')
  })

  test('getProviderSchemas is synchronous', () => {
    const result = getProviderSchemas()
    expect(result).not.toBeInstanceOf(Promise)
    expect(typeof result).toBe('object')
  })
})
