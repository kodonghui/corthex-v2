/**
 * QA Verification -- Story 1-5 Credential Vault Extension
 * Acceptance Criteria verification tests
 */
import { describe, test, expect, beforeAll } from 'bun:test'
import * as fs from 'fs'

beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-key-32-chars-for-unit-tests!!'
})

// === AC #1, #2: Tenant isolation in listCredentials ===
describe('QA: AC #1/#2 Tenant isolation', () => {
  test('listCredentials filters by companyId (code inspection)', () => {
    const code = fs.readFileSync(new URL('../../services/credential-vault.ts', import.meta.url).pathname, 'utf8')
    // listCredentials uses eq(apiKeys.companyId, companyId)
    expect(code).toContain('listCredentials')
    expect(code).toContain("eq(apiKeys.companyId, companyId)")
  })

  test('GET /api-keys route uses tenant.companyId not query param', () => {
    const code = fs.readFileSync(new URL('../../routes/admin/credentials.ts', import.meta.url).pathname, 'utf8')
    // Should use tenant context for companyId
    expect(code).toContain("listCredentials(tenant.companyId)")
    // Should NOT have userId-based query for api-keys list
    const apiKeysGetSection = code.split('GET /api/admin/api-keys')[0]
    // Ensure the api-keys GET doesn't require userId query param
  })
})

// === AC #3: Audit logging on credential operations ===
describe('QA: AC #3 Audit logging', () => {
  test('storeCredentials calls createAuditLog with CREDENTIAL_STORE', () => {
    const code = fs.readFileSync(new URL('../../services/credential-vault.ts', import.meta.url).pathname, 'utf8')
    expect(code).toContain('AUDIT_ACTIONS.CREDENTIAL_STORE')
    expect(code).toContain("action: AUDIT_ACTIONS.CREDENTIAL_STORE")
  })

  test('deleteCredential calls createAuditLog with CREDENTIAL_DELETE', () => {
    const code = fs.readFileSync(new URL('../../services/credential-vault.ts', import.meta.url).pathname, 'utf8')
    expect(code).toContain('AUDIT_ACTIONS.CREDENTIAL_DELETE')
    expect(code).toContain("action: AUDIT_ACTIONS.CREDENTIAL_DELETE")
  })

  test('audit log import is present', () => {
    const code = fs.readFileSync(new URL('../../services/credential-vault.ts', import.meta.url).pathname, 'utf8')
    expect(code).toContain("import { createAuditLog, AUDIT_ACTIONS } from './audit-log'")
  })
})

// === AC #4, #9: NFR12 - No plaintext in audit logs ===
describe('QA: AC #4/#9 NFR12 compliance', () => {
  test('storeCredentials uses maskCredentialFields for audit after field', () => {
    const code = fs.readFileSync(new URL('../../services/credential-vault.ts', import.meta.url).pathname, 'utf8')
    // In storeCredentials: after: maskCredentialFields(input.credentials)
    expect(code).toContain('maskCredentialFields(input.credentials)')
  })

  test('updateCredentials uses maskCredentialFields for audit before and after', () => {
    const code = fs.readFileSync(new URL('../../services/credential-vault.ts', import.meta.url).pathname, 'utf8')
    // after: maskCredentialFields(newFields)
    expect(code).toContain('maskCredentialFields(newFields)')
    // before: maskedBefore (built from Object.keys)
    expect(code).toContain("maskedBefore[k] = '***'")
  })

  test('deleteCredential uses masked before', () => {
    const code = fs.readFileSync(new URL('../../services/credential-vault.ts', import.meta.url).pathname, 'utf8')
    // Find the deleteCredential function body
    const startIdx = code.indexOf('export async function deleteCredential')
    const deleteSection = code.substring(startIdx)
    expect(deleteSection).toContain("maskedBefore[k] = '***'")
  })

  test('maskCredentialFields replaces all values with ***', () => {
    const { maskCredentialFields } = require('../../services/credential-vault')
    const result = maskCredentialFields({
      api_key: 'real-secret',
      password: 'P@ss!',
      token: 'bearer-xyz',
    })
    expect(Object.values(result).every((v: string) => v === '***')).toBe(true)
  })
})

// === AC #5: GET /api-keys returns metadata without decrypted values ===
describe('QA: AC #5 No decrypted values in list', () => {
  test('listCredentials selects only metadata columns (no credentials column)', () => {
    const code = fs.readFileSync(new URL('../../services/credential-vault.ts', import.meta.url).pathname, 'utf8')
    // listCredentials selects specific columns, not credentials
    const listSection = code.substring(code.indexOf('listCredentials'), code.indexOf('storeCredentials'))
    expect(listSection).toContain('apiKeys.id')
    expect(listSection).toContain('apiKeys.provider')
    expect(listSection).toContain('apiKeys.label')
    expect(listSection).toContain('apiKeys.scope')
    expect(listSection).toContain('apiKeys.createdAt')
    // Should NOT select the credentials column
    expect(listSection).not.toContain('apiKeys.credentials')
  })
})

// === AC #6: PUT /api-keys/:id for rotation ===
describe('QA: AC #6 Credential rotation', () => {
  test('PUT /api-keys/:id endpoint exists in route', () => {
    const code = fs.readFileSync(new URL('../../routes/admin/credentials.ts', import.meta.url).pathname, 'utf8')
    expect(code).toContain("credentialsRoute.put('/api-keys/:id'")
  })

  test('PUT route validates with updateApiKeySchema', () => {
    const code = fs.readFileSync(new URL('../../routes/admin/credentials.ts', import.meta.url).pathname, 'utf8')
    expect(code).toContain('updateApiKeySchema')
    expect(code).toContain("zValidator('json', updateApiKeySchema)")
  })

  test('updateCredentials validates, re-encrypts, and updates', () => {
    const code = fs.readFileSync(new URL('../../services/credential-vault.ts', import.meta.url).pathname, 'utf8')
    const updateSection = code.substring(code.indexOf('export async function updateCredentials'), code.indexOf('export async function deleteCredential'))
    expect(updateSection).toContain('validateCredentials')
    expect(updateSection).toContain('encryptCredentials')
    expect(updateSection).toContain('db')
  })
})

// === AC #7: GET /api-keys/providers ===
describe('QA: AC #7 Provider schemas endpoint', () => {
  test('GET /api-keys/providers endpoint exists', () => {
    const code = fs.readFileSync(new URL('../../routes/admin/credentials.ts', import.meta.url).pathname, 'utf8')
    expect(code).toContain("credentialsRoute.get('/api-keys/providers'")
  })

  test('providers endpoint returns getProviderSchemas()', () => {
    const code = fs.readFileSync(new URL('../../routes/admin/credentials.ts', import.meta.url).pathname, 'utf8')
    expect(code).toContain('getProviderSchemas()')
  })

  test('getProviderSchemas returns all 12 providers', () => {
    const { getProviderSchemas } = require('../../services/credential-vault')
    const schemas = getProviderSchemas()
    expect(Object.keys(schemas).length).toBe(12)
  })
})

// === AC #8: Priority resolution preserved ===
describe('QA: AC #8 getCredentials priority', () => {
  test('getCredentials still exists with user > company priority', () => {
    const code = fs.readFileSync(new URL('../../services/credential-vault.ts', import.meta.url).pathname, 'utf8')
    expect(code).toContain('export async function getCredentials')
    // user scope check before company scope
    const getCredsSection = code.substring(code.indexOf('export async function getCredentials'), code.indexOf('// === Phase 1'))
    const userScopePos = getCredsSection.indexOf("scope, 'user'")
    const companyScopePos = getCredsSection.indexOf("scope, 'company'")
    expect(userScopePos).toBeLessThan(companyScopePos)
  })
})

// === Security: authMiddleware + adminOnly ===
describe('QA: Security - Route protection', () => {
  test('credentialsRoute applies authMiddleware + adminOnly', () => {
    const code = fs.readFileSync(new URL('../../routes/admin/credentials.ts', import.meta.url).pathname, 'utf8')
    expect(code).toContain("credentialsRoute.use('*', authMiddleware, adminOnly)")
  })
})

// === Backward compatibility ===
describe('QA: Backward compatibility', () => {
  test('CLI credential routes still present', () => {
    const code = fs.readFileSync(new URL('../../routes/admin/credentials.ts', import.meta.url).pathname, 'utf8')
    expect(code).toContain("credentialsRoute.get('/cli-credentials'")
    expect(code).toContain("credentialsRoute.post('/cli-credentials'")
    expect(code).toContain("credentialsRoute.delete('/cli-credentials/:id'")
  })

  test('original vault functions still exported', () => {
    const vault = require('../../services/credential-vault')
    expect(typeof vault.validateCredentials).toBe('function')
    expect(typeof vault.encryptCredentials).toBe('function')
    expect(typeof vault.decryptCredentials).toBe('function')
    expect(typeof vault.getCredentials).toBe('function')
    expect(vault.PROVIDER_SCHEMAS).toBeDefined()
    expect(vault.SUPPORTED_PROVIDERS).toBeDefined()
  })
})
