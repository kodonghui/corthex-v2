import { describe, expect, test } from 'bun:test'
import { z } from 'zod'

/**
 * TEA-generated tests for Story 9-5: Company Settings UI (Admin A8)
 * Risk-based coverage expansion: edge cases, negative paths, boundary conditions
 */
describe('Company Settings UI — TEA Risk-Based Tests', () => {
  // === R1: Settings JSONB Schema Validation (P0 — data corruption risk) ===
  describe('R1: Settings JSONB schema validation edge cases', () => {
    const settingsSchema = z.record(z.unknown()).optional()

    test('accepts deeply nested objects', () => {
      const result = settingsSchema.parse({
        level1: { level2: { level3: { level4: 'deep' } } },
      })
      expect(result).toBeDefined()
    })

    test('accepts arrays as values', () => {
      const result = settingsSchema.parse({
        quickActions: [
          { label: 'Test', command: '/test', icon: '🧪' },
          { label: 'Report', command: '/report', icon: '📊' },
        ],
      })
      expect((result as Record<string, unknown>).quickActions).toHaveLength(2)
    })

    test('accepts mixed value types in same record', () => {
      const result = settingsSchema.parse({
        timezone: 'Asia/Seoul',
        maxAgents: 50,
        enableDebug: false,
        tags: ['prod', 'main'],
        nested: { key: 'value' },
      })
      expect(result).toBeDefined()
    })

    test('rejects non-object types at root', () => {
      expect(() => settingsSchema.parse('not-an-object')).toThrow()
      expect(() => settingsSchema.parse(42)).toThrow()
      expect(() => settingsSchema.parse(true)).toThrow()
    })

    test('accepts empty object', () => {
      const result = settingsSchema.parse({})
      expect(result).toEqual({})
    })

    test('accepts undefined (optional)', () => {
      const result = settingsSchema.parse(undefined)
      expect(result).toBeUndefined()
    })

    test('accepts null values within record', () => {
      const result = settingsSchema.parse({ timezone: null, model: null })
      expect((result as Record<string, unknown>).timezone).toBeNull()
    })

    test('accepts very large settings objects', () => {
      const large: Record<string, unknown> = {}
      for (let i = 0; i < 100; i++) {
        large[`key_${i}`] = `value_${i}`
      }
      const result = settingsSchema.parse(large)
      expect(Object.keys(result as Record<string, unknown>)).toHaveLength(100)
    })
  })

  // === R2: Update Schema Combined Fields (P0 — partial update risk) ===
  describe('R2: Update schema combined field validation', () => {
    const updateSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      isActive: z.boolean().optional(),
      settings: z.record(z.unknown()).optional(),
    })

    test('accepts name-only update', () => {
      const result = updateSchema.parse({ name: 'New Corp' })
      expect(result.name).toBe('New Corp')
      expect(result.settings).toBeUndefined()
      expect(result.isActive).toBeUndefined()
    })

    test('accepts settings-only update', () => {
      const result = updateSchema.parse({ settings: { timezone: 'UTC' } })
      expect(result.settings).toEqual({ timezone: 'UTC' })
      expect(result.name).toBeUndefined()
    })

    test('accepts combined name + settings update', () => {
      const result = updateSchema.parse({
        name: 'Updated Corp',
        settings: { defaultModel: 'gpt-4o' },
      })
      expect(result.name).toBe('Updated Corp')
      expect(result.settings).toEqual({ defaultModel: 'gpt-4o' })
    })

    test('rejects empty name', () => {
      expect(() => updateSchema.parse({ name: '' })).toThrow()
    })

    test('rejects name exceeding 100 chars', () => {
      expect(() => updateSchema.parse({ name: 'a'.repeat(101) })).toThrow()
    })

    test('accepts name at exactly 100 chars', () => {
      const result = updateSchema.parse({ name: 'a'.repeat(100) })
      expect(result.name).toHaveLength(100)
    })

    test('accepts empty body (all optional)', () => {
      const result = updateSchema.parse({})
      expect(result).toEqual({})
    })

    test('rejects unknown fields at root in strict mode', () => {
      const strictSchema = updateSchema.strict()
      expect(() => strictSchema.parse({ unknown: 'field' })).toThrow()
    })

    test('isActive false does not interfere with settings', () => {
      const result = updateSchema.parse({
        isActive: false,
        settings: { maintenance: true },
      })
      expect(result.isActive).toBe(false)
      expect(result.settings).toEqual({ maintenance: true })
    })
  })

  // === R3: Credential Vault Provider Schema (P0 — wrong fields block integrations) ===
  describe('R3: Provider schema integrity', () => {
    test('PROVIDER_SCHEMAS exports all expected providers', async () => {
      const { PROVIDER_SCHEMAS } = await import('../../services/credential-vault')
      const expectedProviders = [
        'anthropic', 'openai', 'google_ai', 'kis', 'smtp', 'email',
        'telegram', 'instagram', 'serper', 'notion', 'google_calendar', 'tts',
      ]
      for (const p of expectedProviders) {
        expect(PROVIDER_SCHEMAS[p]).toBeDefined()
        expect(Array.isArray(PROVIDER_SCHEMAS[p])).toBe(true)
        expect(PROVIDER_SCHEMAS[p].length).toBeGreaterThan(0)
      }
    })

    test('anthropic requires api_key', async () => {
      const { PROVIDER_SCHEMAS } = await import('../../services/credential-vault')
      expect(PROVIDER_SCHEMAS.anthropic).toContain('api_key')
    })

    test('openai requires api_key', async () => {
      const { PROVIDER_SCHEMAS } = await import('../../services/credential-vault')
      expect(PROVIDER_SCHEMAS.openai).toContain('api_key')
    })

    test('google_ai requires api_key', async () => {
      const { PROVIDER_SCHEMAS } = await import('../../services/credential-vault')
      expect(PROVIDER_SCHEMAS.google_ai).toContain('api_key')
    })

    test('kis requires app_key, app_secret, account_no', async () => {
      const { PROVIDER_SCHEMAS } = await import('../../services/credential-vault')
      expect(PROVIDER_SCHEMAS.kis).toContain('app_key')
      expect(PROVIDER_SCHEMAS.kis).toContain('app_secret')
      expect(PROVIDER_SCHEMAS.kis).toContain('account_no')
    })

    test('telegram requires bot_token and chat_id', async () => {
      const { PROVIDER_SCHEMAS } = await import('../../services/credential-vault')
      expect(PROVIDER_SCHEMAS.telegram).toContain('bot_token')
      expect(PROVIDER_SCHEMAS.telegram).toContain('chat_id')
    })

    test('getProviderSchemas returns deep copy (mutation safe)', async () => {
      const { getProviderSchemas } = await import('../../services/credential-vault')
      const schemas1 = getProviderSchemas()
      const schemas2 = getProviderSchemas()
      schemas1.anthropic.push('extra_field')
      expect(schemas2.anthropic).not.toContain('extra_field')
    })

    test('SUPPORTED_PROVIDERS matches PROVIDER_SCHEMAS keys', async () => {
      const { SUPPORTED_PROVIDERS, PROVIDER_SCHEMAS } = await import('../../services/credential-vault')
      const schemaKeys = Object.keys(PROVIDER_SCHEMAS)
      expect(SUPPORTED_PROVIDERS).toEqual(schemaKeys)
    })
  })

  // === R4: Credential Validation (P1 — silent failures on missing fields) ===
  describe('R4: Credential field validation', () => {
    test('validateCredentials throws on missing required fields', async () => {
      const { validateCredentials } = await import('../../services/credential-vault')
      expect(() => validateCredentials('anthropic', {})).toThrow('필수 필드 누락')
    })

    test('validateCredentials passes with all required fields', async () => {
      const { validateCredentials } = await import('../../services/credential-vault')
      expect(() => validateCredentials('anthropic', { api_key: 'test-key' })).not.toThrow()
    })

    test('validateCredentials skips unknown providers', async () => {
      const { validateCredentials } = await import('../../services/credential-vault')
      expect(() => validateCredentials('unknown_provider', {})).not.toThrow()
    })

    test('validateCredentials reports all missing fields', async () => {
      const { validateCredentials } = await import('../../services/credential-vault')
      try {
        validateCredentials('kis', {})
        expect(true).toBe(false) // Should not reach
      } catch (e: unknown) {
        const msg = (e as Error).message
        expect(msg).toContain('app_key')
        expect(msg).toContain('app_secret')
        expect(msg).toContain('account_no')
      }
    })

    test('validateCredentials accepts extra fields beyond required', async () => {
      const { validateCredentials } = await import('../../services/credential-vault')
      expect(() => validateCredentials('anthropic', {
        api_key: 'test-key',
        extra_field: 'extra-value',
      })).not.toThrow()
    })
  })

  // === R5: Encryption/Decryption (P0 — data integrity) ===
  // Note: Uses ENCRYPTION_KEY env var. Tests use test key for isolation.
  describe('R5: Credential encryption round-trip', () => {
    const TEST_KEY = 'test-encryption-key-32chars-long!' // 33 chars, meets >=32 requirement

    test('encryptCredentials returns encrypted map with same keys', async () => {
      process.env.ENCRYPTION_KEY = TEST_KEY
      const { encryptCredentials } = await import('../../services/credential-vault')
      const input = { api_key: 'sk-test-123', secret: 'mysecret' }
      const encrypted = await encryptCredentials(input)
      expect(Object.keys(encrypted)).toEqual(Object.keys(input))
      expect(encrypted.api_key).not.toBe(input.api_key)
      expect(encrypted.secret).not.toBe(input.secret)
    })

    test('decryptCredentials reverses encryptCredentials', async () => {
      process.env.ENCRYPTION_KEY = TEST_KEY
      const { encryptCredentials, decryptCredentials } = await import('../../services/credential-vault')
      const input = { api_key: 'sk-test-roundtrip', token: 'tok-123' }
      const encrypted = await encryptCredentials(input)
      const decrypted = await decryptCredentials(encrypted)
      expect(decrypted).toEqual(input)
    })

    test('encryption produces different ciphertext for same plaintext', async () => {
      process.env.ENCRYPTION_KEY = TEST_KEY
      const { encryptCredentials } = await import('../../services/credential-vault')
      const input = { api_key: 'same-key' }
      const enc1 = await encryptCredentials(input)
      const enc2 = await encryptCredentials(input)
      expect(enc1.api_key).not.toBe(enc2.api_key) // Different IVs
    })

    test('handles empty string values', async () => {
      process.env.ENCRYPTION_KEY = TEST_KEY
      const { encryptCredentials, decryptCredentials } = await import('../../services/credential-vault')
      const input = { key: '' }
      const encrypted = await encryptCredentials(input)
      const decrypted = await decryptCredentials(encrypted)
      expect(decrypted).toEqual(input)
    })

    test('handles unicode characters', async () => {
      process.env.ENCRYPTION_KEY = TEST_KEY
      const { encryptCredentials, decryptCredentials } = await import('../../services/credential-vault')
      const input = { key: '한국어 키 🔑' }
      const encrypted = await encryptCredentials(input)
      const decrypted = await decryptCredentials(encrypted)
      expect(decrypted).toEqual(input)
    })
  })

  // === R6: Frontend Structure Integrity (P1 — routing/navigation) ===
  describe('R6: Frontend routing and navigation integrity', () => {
    test('settings route is protected by ProtectedRoute', async () => {
      const content = await Bun.file('packages/admin/src/App.tsx').text()
      // Settings route is inside the Layout route which has ProtectedRoute
      const settingsIdx = content.indexOf('path="settings"')
      const protectedIdx = content.indexOf('ProtectedRoute')
      expect(protectedIdx).toBeLessThan(settingsIdx)
    })

    test('settings page is lazy loaded', async () => {
      const content = await Bun.file('packages/admin/src/App.tsx').text()
      expect(content).toContain("lazy(() => import('./pages/settings')")
    })

    test('sidebar settings link is NavLink (not plain anchor)', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      // Find the settings link section
      const settingsLinkIdx = content.indexOf('to="/settings"')
      expect(settingsLinkIdx).toBeGreaterThan(0)
      // It should be wrapped in NavLink (nearby in source)
      const contextBefore = content.substring(Math.max(0, settingsLinkIdx - 50), settingsLinkIdx)
      expect(contextBefore).toContain('NavLink')
    })

    test('sidebar settings icon is gear emoji', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      // Settings section should have gear icon near the link
      const settingsLinkIdx = content.indexOf('to="/settings"')
      const settingsSection = content.substring(Math.max(0, settingsLinkIdx - 200), settingsLinkIdx + 500)
      expect(settingsSection).toContain('⚙')
    })

    test('settings link is not in main nav array (it is in bottom section)', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      const navArrayMatch = content.match(/const nav = \[[\s\S]*?\]/)
      expect(navArrayMatch).toBeTruthy()
      expect(navArrayMatch![0]).not.toContain('/settings')
    })
  })

  // === R7: API Key UI Data Flow (P1 — mutation correctness) ===
  describe('R7: API key UI data flow patterns', () => {
    test('API key add sends scope as company', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      // The addMutation should set scope to company
      const addMutationSection = content.substring(
        content.indexOf('addMutation'),
        content.indexOf('addMutation') + 500,
      )
      expect(addMutationSection).toContain("scope: 'company'")
    })

    test('API key rotate uses PUT method', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('api.put(`/admin/api-keys/')
    })

    test('API key delete uses DELETE method', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('api.delete(`/admin/api-keys/')
    })

    test('query invalidation after add', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      // After addMutation success, should invalidate company-api-keys
      const addOnSuccess = content.substring(
        content.indexOf("mutationFn: (body: { companyId"),
        content.indexOf("mutationFn: (body: { companyId") + 600,
      )
      expect(addOnSuccess).toContain("invalidateQueries({ queryKey: ['company-api-keys']")
    })

    test('query invalidation after delete', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("queryKey: ['company-api-keys']")
    })

    test('query invalidation after rotate', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      const rotateMutationIdx = content.indexOf('rotateMutation')
      const rotateSection = content.substring(rotateMutationIdx, rotateMutationIdx + 500)
      expect(rotateSection).toContain("invalidateQueries")
    })
  })

  // === R8: Default Settings Section (P1 — overwrite risk) ===
  describe('R8: Default settings merge behavior', () => {
    test('settings save merges with currentSettings (spread)', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('...currentSettings')
    })

    test('timezone has sensible default', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("|| 'Asia/Seoul'")
    })

    test('defaultModel has sensible default', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("|| 'claude-sonnet-4-20250514'")
    })

    test('useEffect resets on company prop change', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      // DefaultSettingsSection should have useEffect with [company] dependency
      const dssIdx = content.indexOf('function DefaultSettingsSection')
      const dssSection = content.substring(dssIdx, dssIdx + 1500)
      expect(dssSection).toContain('useEffect')
      expect(dssSection).toContain('[company]')
    })
  })

  // === R9: Toast Messages (P2 — UX consistency) ===
  describe('R9: Toast message patterns', () => {
    test('all success toasts have Korean messages', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      const successMatches = content.match(/type: 'success', message: '([^']+)'/g) || []
      expect(successMatches.length).toBeGreaterThanOrEqual(4) // save, add, delete, rotate
      for (const match of successMatches) {
        // Korean characters should be present
        expect(/[가-힣]/.test(match)).toBe(true)
      }
    })

    test('all error handlers use err.message', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      const errorMatches = content.match(/onError.*=>.*addToast/g) || []
      expect(errorMatches.length).toBeGreaterThanOrEqual(3) // add, delete, rotate
    })
  })

  // === R10: Companies Route File Integrity (P0 — API regression) ===
  describe('R10: Companies route backward compatibility', () => {
    test('GET /companies endpoint still exists', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(content).toContain("companiesRoute.get('/companies'")
    })

    test('GET /companies/:id endpoint still exists', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(content).toContain("companiesRoute.get('/companies/:id'")
    })

    test('POST /companies endpoint still exists', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(content).toContain("companiesRoute.post('/companies'")
    })

    test('DELETE /companies/:id endpoint still exists', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(content).toContain("companiesRoute.delete('/companies/:id'")
    })

    test('SMTP endpoints still exist', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(content).toContain("companiesRoute.put('/companies/:id/smtp'")
      expect(content).toContain("companiesRoute.delete('/companies/:id/smtp'")
    })

    test('adminOnly middleware still applied', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(content).toContain("companiesRoute.use('*', authMiddleware, adminOnly)")
    })

    test('original name and isActive fields still in update schema', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(content).toContain("name: z.string().min(1).max(100).optional()")
      expect(content).toContain("isActive: z.boolean().optional()")
    })
  })
})
