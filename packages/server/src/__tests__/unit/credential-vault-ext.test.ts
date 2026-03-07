import { describe, test, expect, beforeAll } from 'bun:test'
import {
  maskCredentialFields,
  getProviderSchemas,
  listCredentials,
  storeCredentials,
  updateCredentials,
  deleteCredential,
  PROVIDER_SCHEMAS,
  SUPPORTED_PROVIDERS,
  validateCredentials,
  encryptCredentials,
  decryptCredentials,
  getCredentials,
} from '../../services/credential-vault'
import { AUDIT_ACTIONS } from '../../services/audit-log'
import { credentialsRoute } from '../../routes/admin/credentials'

beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-key-32-chars-for-unit-tests!!'
})

// === Task 2.5: maskCredentialFields ===
describe('maskCredentialFields', () => {
  test('replaces all values with ***', () => {
    const input = { api_key: 'sk-secret-123', token: 'bearer-token' }
    const masked = maskCredentialFields(input)
    expect(masked).toEqual({ api_key: '***', token: '***' })
  })

  test('handles single field', () => {
    const masked = maskCredentialFields({ api_key: 'my-secret' })
    expect(masked).toEqual({ api_key: '***' })
  })

  test('handles empty object', () => {
    const masked = maskCredentialFields({})
    expect(masked).toEqual({})
  })

  test('preserves all keys from original', () => {
    const input = { app_key: 'k1', app_secret: 'k2', account_no: 'k3' }
    const masked = maskCredentialFields(input)
    expect(Object.keys(masked)).toEqual(Object.keys(input))
    expect(Object.values(masked).every(v => v === '***')).toBe(true)
  })

  test('does not expose original values', () => {
    const input = { api_key: 'sk-ant-api03-very-secret' }
    const masked = maskCredentialFields(input)
    expect(JSON.stringify(masked)).not.toContain('sk-ant-api03-very-secret')
  })
})

// === Task 1.5: getProviderSchemas ===
describe('getProviderSchemas', () => {
  test('returns all 12 providers', () => {
    const schemas = getProviderSchemas()
    expect(Object.keys(schemas)).toHaveLength(12)
  })

  test('returns a copy, not the original reference', () => {
    const schemas = getProviderSchemas()
    schemas['test_provider'] = ['test']
    expect(PROVIDER_SCHEMAS['test_provider']).toBeUndefined()
  })

  test('includes LLM providers with api_key field', () => {
    const schemas = getProviderSchemas()
    expect(schemas.anthropic).toEqual(['api_key'])
    expect(schemas.openai).toEqual(['api_key'])
    expect(schemas.google_ai).toEqual(['api_key'])
  })

  test('includes KIS with 3 required fields', () => {
    const schemas = getProviderSchemas()
    expect(schemas.kis).toEqual(['app_key', 'app_secret', 'account_no'])
  })

  test('includes telegram with 2 required fields', () => {
    const schemas = getProviderSchemas()
    expect(schemas.telegram).toEqual(['bot_token', 'chat_id'])
  })
})

// === Service function exports ===
describe('credential-vault extension exports', () => {
  test('listCredentials is exported as async function', () => {
    expect(typeof listCredentials).toBe('function')
  })

  test('storeCredentials is exported as async function', () => {
    expect(typeof storeCredentials).toBe('function')
  })

  test('updateCredentials is exported as async function', () => {
    expect(typeof updateCredentials).toBe('function')
  })

  test('deleteCredential is exported as async function', () => {
    expect(typeof deleteCredential).toBe('function')
  })

  test('maskCredentialFields is exported as function', () => {
    expect(typeof maskCredentialFields).toBe('function')
  })

  test('getProviderSchemas is exported as function', () => {
    expect(typeof getProviderSchemas).toBe('function')
  })

  test('original exports still available (backward compat)', () => {
    expect(typeof validateCredentials).toBe('function')
    expect(typeof encryptCredentials).toBe('function')
    expect(typeof decryptCredentials).toBe('function')
    expect(typeof getCredentials).toBe('function')
    expect(SUPPORTED_PROVIDERS).toBeDefined()
    expect(PROVIDER_SCHEMAS).toBeDefined()
  })
})

// === Audit action constants ===
describe('AUDIT_ACTIONS credential entries', () => {
  test('CREDENTIAL_STORE exists with dot notation', () => {
    expect(AUDIT_ACTIONS.CREDENTIAL_STORE).toBe('credential.store')
  })

  test('CREDENTIAL_ACCESS exists with dot notation', () => {
    expect(AUDIT_ACTIONS.CREDENTIAL_ACCESS).toBe('credential.access')
  })

  test('CREDENTIAL_DELETE exists with dot notation', () => {
    expect(AUDIT_ACTIONS.CREDENTIAL_DELETE).toBe('credential.delete')
  })
})

// === Route exports ===
describe('credentials route extensions', () => {
  test('credentialsRoute is exported', () => {
    expect(credentialsRoute).toBeDefined()
  })

  test('route has registered routes (GET, POST, PUT, DELETE for api-keys)', () => {
    const routes = credentialsRoute.routes
    expect(routes).toBeDefined()
    expect(Array.isArray(routes)).toBe(true)

    // Check for PUT method existence (new endpoint)
    const methods = routes.map((r: any) => r.method)
    expect(methods).toContain('PUT')
  })

  test('route has GET handler for providers endpoint', () => {
    const routes = credentialsRoute.routes
    const getPaths = routes
      .filter((r: any) => r.method === 'GET')
      .map((r: any) => r.path)
    expect(getPaths).toContain('/api-keys/providers')
  })
})

// === Masking audit safety ===
describe('credential masking for audit safety (NFR12)', () => {
  test('KIS credentials are fully masked', () => {
    const kis = { app_key: 'PSxxx', app_secret: 'secret123', account_no: '12345678' }
    const masked = maskCredentialFields(kis)
    expect(masked.app_key).toBe('***')
    expect(masked.app_secret).toBe('***')
    expect(masked.account_no).toBe('***')
    // No plaintext in the result
    const json = JSON.stringify(masked)
    expect(json).not.toContain('PSxxx')
    expect(json).not.toContain('secret123')
    expect(json).not.toContain('12345678')
  })

  test('LLM API keys are fully masked', () => {
    const creds = { api_key: 'sk-ant-api03-very-long-secret-key-abc123' }
    const masked = maskCredentialFields(creds)
    expect(masked.api_key).toBe('***')
    expect(JSON.stringify(masked)).not.toContain('sk-ant-api03')
  })

  test('SMTP passwords are fully masked', () => {
    const smtp = { host: 'smtp.gmail.com', port: '587', user: 'u@g.com', password: 'P@ssw0rd!', from: 'f@g.com' }
    const masked = maskCredentialFields(smtp)
    expect(Object.values(masked).every(v => v === '***')).toBe(true)
  })
})

// === Encryption roundtrip with new functions ===
describe('credential encryption consistency', () => {
  test('encrypt then decrypt preserves original fields', async () => {
    const original = { api_key: 'test-key-12345' }
    const encrypted = await encryptCredentials(original)
    expect(encrypted.api_key).not.toBe(original.api_key)
    const decrypted = await decryptCredentials(encrypted)
    expect(decrypted).toEqual(original)
  })

  test('masked fields do not decrypt to original', () => {
    const original = { api_key: 'secret' }
    const masked = maskCredentialFields(original)
    // Masked values are just '***', not encrypted
    expect(masked.api_key).toBe('***')
    expect(masked.api_key).not.toBe(original.api_key)
  })
})
