import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'

/**
 * Story 26.1: Marketing Settings & AI Engine Configuration
 * References: FR-MKT1, FR-MKT4, FR-MKT6, AR39, AR41, MKT-1, MKT-3
 *
 * Tests verify:
 * (1) Engine provider definitions for all 4 categories (FR-MKT1)
 * (2) AES-256 encrypted API key storage (AR39, MKT-1)
 * (3) Atomic jsonb_set updates (AR41)
 * (4) Copyright watermark toggle (FR-MKT6)
 * (5) Admin routes + UI integration
 */

const readSrc = (relPath: string) =>
  fs.readFileSync(`packages/server/src/${relPath}`, 'utf-8')

// === FR-MKT1: AI Engine Selection by Category ===

describe('26.1: FR-MKT1 — Engine providers by category', () => {
  test('marketing-settings service exists', () => {
    expect(fs.existsSync('packages/server/src/services/marketing-settings.ts')).toBe(true)
  })

  test('defines image providers (3+ types)', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain("image:")
    expect(src).toContain("'flux'")
    expect(src).toContain("'dall-e'")
    expect(src).toContain("'midjourney'")
  })

  test('defines video providers (4+ types)', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain("video:")
    expect(src).toContain("'runway'")
    expect(src).toContain("'kling'")
    expect(src).toContain("'pika'")
    expect(src).toContain("'sora'")
  })

  test('defines narration providers (2+ types)', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain("narration:")
    expect(src).toContain("'elevenlabs'")
    expect(src).toContain("'playht'")
  })

  test('defines subtitles providers (3+ types)', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain("subtitles:")
    expect(src).toContain("'whisper'")
    expect(src).toContain("'assemblyai'")
    expect(src).toContain("'deepgram'")
  })

  test('exports ENGINE_CATEGORIES array', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain("export const ENGINE_CATEGORIES")
    expect(src).toContain("'image'")
    expect(src).toContain("'video'")
    expect(src).toContain("'narration'")
    expect(src).toContain("'subtitles'")
  })

  test('each provider has models array', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('models:')
    // Check specific models exist
    expect(src).toContain('flux-1.1-pro')
    expect(src).toContain('dall-e-3')
    expect(src).toContain('gen-3-alpha')
    expect(src).toContain('eleven_multilingual_v2')
    expect(src).toContain('whisper-1')
  })

  test('validateEngineSelection function exists', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('export function validateEngineSelection')
  })
})

// === AR39, MKT-1: AES-256 Encrypted API Keys ===

describe('26.1: AR39/MKT-1 — AES-256 encrypted API key storage', () => {
  test('imports encrypt/decrypt from lib/crypto', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain("import { encrypt, decrypt } from '../lib/crypto'")
  })

  test('storeApiKey encrypts before saving', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('export async function storeApiKey')
    expect(src).toContain('await encrypt(apiKey)')
    expect(src).toContain('encryptedApiKeys')
  })

  test('getDecryptedApiKey decrypts on retrieval', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('export async function getDecryptedApiKey')
    expect(src).toContain('await decrypt(')
  })

  test('getMarketingConfig never exposes raw keys', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('export async function getMarketingConfig')
    // Returns boolean flags, not actual key values
    expect(src).toContain('apiKeyFlags[provider] = true')
  })

  test('deleteApiKey function exists', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('export async function deleteApiKey')
  })

  test('deleteApiKey validates provider (Winston MEDIUM fix)', () => {
    const src = readSrc('services/marketing-settings.ts')
    const deleteSection = src.substring(src.indexOf('export async function deleteApiKey'))
    expect(deleteSection).toContain('Unknown marketing provider')
    expect(deleteSection).toContain('MARKETING_ENGINE_PROVIDERS')
  })
})

// === AR41: Atomic jsonb_set Updates ===

describe('26.1: AR41 — Atomic jsonb_set for concurrent updates', () => {
  test('updateEngineSelection uses jsonb_set', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('export async function updateEngineSelection')
    expect(src).toContain('jsonb_set')
  })

  test('storeApiKey uses jsonb_set', () => {
    const src = readSrc('services/marketing-settings.ts')
    // Both functions use atomic jsonb_set
    const storeSection = src.substring(src.indexOf('export async function storeApiKey'))
    expect(storeSection).toContain('jsonb_set')
  })

  test('COALESCE handles null settings gracefully', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain("COALESCE(settings, '{}'::jsonb)")
  })

  test('updateWatermark uses jsonb_set', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('export async function updateWatermark')
    const watermarkSection = src.substring(src.indexOf('export async function updateWatermark'))
    expect(watermarkSection).toContain('jsonb_set')
  })
})

// === FR-MKT6: Copyright Watermark Toggle ===

describe('26.1: FR-MKT6 — Copyright watermark ON/OFF toggle', () => {
  test('watermark field in config', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('watermark: boolean')
  })

  test('default watermark is ON', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('watermark: true')
  })

  test('default config uses per-request timestamp (John LOW fix)', () => {
    const src = readSrc('services/marketing-settings.ts')
    // Must be a function, not a static const (avoids stale server-start timestamp)
    expect(src).toContain('function getDefaultConfig()')
    expect(src).not.toContain('const DEFAULT_CONFIG')
  })

  test('updateWatermark accepts boolean', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('updateWatermark')
    expect(src).toContain('enabled: boolean')
  })

  test('watermark route exists', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain("'/company-settings/marketing/watermark'")
  })
})

// === Routes ===

describe('26.1: Admin routes for marketing settings', () => {
  test('GET /company-settings/marketing endpoint', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain("companySettingsRoute.get('/company-settings/marketing'")
  })

  test('GET /company-settings/marketing/providers endpoint', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain("companySettingsRoute.get('/company-settings/marketing/providers'")
  })

  test('PUT /company-settings/marketing/engine endpoint', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain("companySettingsRoute.put")
    expect(src).toContain("'/company-settings/marketing/engine'")
  })

  test('PUT /company-settings/marketing/api-key endpoint', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain("'/company-settings/marketing/api-key'")
  })

  test('DELETE /company-settings/marketing/api-key/:provider endpoint', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain("companySettingsRoute.delete('/company-settings/marketing/api-key/:provider'")
  })

  test('Zod validation on engine schema', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain("z.enum(['image', 'video', 'narration', 'subtitles'])")
    expect(src).toContain("zValidator('json', engineSchema)")
  })

  test('Zod validation on API key schema', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain("zValidator('json', apiKeySchema)")
    expect(src).toContain("apiKey: z.string()")
  })

  test('routes use auth + admin + tenant middleware', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain('authMiddleware, adminOnly, tenantMiddleware')
  })

  test('imports marketing-settings service functions', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain('getMarketingConfig')
    expect(src).toContain('updateEngineSelection')
    expect(src).toContain('storeApiKey')
    expect(src).toContain('deleteApiKey')
    expect(src).toContain('updateWatermark')
  })
})

// === FR-MKT4: Engine changes take effect next execution ===

describe('26.1: FR-MKT4 — Engine changes take effect next execution', () => {
  test('config stored in company.settings JSONB (not cached)', () => {
    const src = readSrc('services/marketing-settings.ts')
    // getMarketingConfig reads fresh from DB every time
    expect(src).toContain('db')
    expect(src).toContain('companies')
    expect(src).toContain("eq(companies.id, companyId)")
  })

  test('updatedAt timestamp tracks changes', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('updatedAt')
    expect(src).toContain('new Date().toISOString()')
  })
})

// === MKT-3: Cost Attribution via Company Keys ===

describe('26.1: MKT-3 — Cost attribution via company API keys', () => {
  test('getDecryptedApiKey uses companyId for tenant isolation', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('getDecryptedApiKey')
    expect(src).toContain('companyId: string')
    // Each company stores their own API keys
    expect(src).toContain("eq(companies.id, companyId)")
  })
})

// === Admin UI ===

describe('26.1: Admin UI — marketing-settings page', () => {
  test('marketing-settings page exists', () => {
    expect(fs.existsSync('packages/admin/src/pages/marketing-settings.tsx')).toBe(true)
  })

  test('page exports MarketingSettingsPage component', () => {
    const src = fs.readFileSync('packages/admin/src/pages/marketing-settings.tsx', 'utf-8')
    expect(src).toContain('export function MarketingSettingsPage')
  })

  test('fetches marketing config via API', () => {
    const src = fs.readFileSync('packages/admin/src/pages/marketing-settings.tsx', 'utf-8')
    expect(src).toContain("'/admin/company-settings/marketing'")
  })

  test('fetches available providers', () => {
    const src = fs.readFileSync('packages/admin/src/pages/marketing-settings.tsx', 'utf-8')
    expect(src).toContain("'/admin/company-settings/marketing/providers'")
  })

  test('has engine selection by category UI', () => {
    const src = fs.readFileSync('packages/admin/src/pages/marketing-settings.tsx', 'utf-8')
    expect(src).toContain("'image'")
    expect(src).toContain("'video'")
    expect(src).toContain("'narration'")
    expect(src).toContain("'subtitles'")
  })

  test('has API key management UI', () => {
    const src = fs.readFileSync('packages/admin/src/pages/marketing-settings.tsx', 'utf-8')
    expect(src).toContain('apiKey')
    expect(src).toContain('password')
    // Show/hide toggle for keys
    expect(src).toContain('Eye')
    expect(src).toContain('EyeOff')
  })

  test('has watermark toggle UI', () => {
    const src = fs.readFileSync('packages/admin/src/pages/marketing-settings.tsx', 'utf-8')
    expect(src).toContain('watermark')
    expect(src).toContain('updateWatermark')
  })

  test('route registered in admin App.tsx', () => {
    const src = fs.readFileSync('packages/admin/src/App.tsx', 'utf-8')
    expect(src).toContain('MarketingSettingsPage')
    expect(src).toContain('"marketing-settings"')
  })

  test('sidebar entry exists', () => {
    const src = fs.readFileSync('packages/admin/src/components/sidebar.tsx', 'utf-8')
    expect(src).toContain("'/marketing-settings'")
    expect(src).toContain('마케팅 AI 엔진')
    expect(src).toContain('Megaphone')
  })
})

// === Existing handoff-depth not broken ===

describe('26.1: Existing handoff-depth settings preserved', () => {
  test('handoff-depth GET route still exists', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain("'/company-settings/handoff-depth'")
  })

  test('handoff-depth PUT route still exists', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain("companySettingsRoute.put")
    expect(src).toContain("handoffDepthSchema")
  })
})
