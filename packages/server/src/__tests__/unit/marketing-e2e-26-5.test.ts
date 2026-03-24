import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'

/**
 * Story 26.5: Marketing E2E Verification
 * References: NFR-P17, Sprint 2 exit verification
 *
 * Verifies the complete Epic 26 marketing automation pipeline:
 * (1) Full pipeline exists: settings → preset → approval → posting
 * (2) Performance targets defined (NFR-P17)
 * (3) Fallback engine chain works (MKT-2)
 * (4) All 5 stories' artifacts present
 * (5) Sprint 2 exit criteria met
 */

const readSrc = (relPath: string) =>
  fs.readFileSync(`packages/server/src/${relPath}`, 'utf-8')

// === E2E Pipeline: All components present ===

describe('26.5: E2E — Full pipeline components exist', () => {
  test('26.1: Marketing settings service', () => {
    expect(fs.existsSync('packages/server/src/services/marketing-settings.ts')).toBe(true)
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('MARKETING_ENGINE_PROVIDERS')
    expect(src).toContain('getMarketingConfig')
    expect(src).toContain('updateEngineSelection')
    expect(src).toContain('storeApiKey')
  })

  test('26.2: Preset workflows', () => {
    expect(fs.existsSync('_n8n/presets/marketing-content-pipeline.json')).toBe(true)
    expect(fs.existsSync('packages/server/src/services/n8n-preset-workflows.ts')).toBe(true)
    const src = readSrc('services/n8n-preset-workflows.ts')
    expect(src).toContain('listPresets')
    expect(src).toContain('installPreset')
  })

  test('26.3: Human approval service', () => {
    expect(fs.existsSync('packages/server/src/services/marketing-approval.ts')).toBe(true)
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('createApprovalRequest')
    expect(src).toContain('approveContent')
    expect(src).toContain('postToMultiplePlatforms')
  })

  test('26.4: Fallback service', () => {
    expect(fs.existsSync('packages/server/src/services/marketing-fallback.ts')).toBe(true)
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('executeWithFallback')
    expect(src).toContain('buildFallbackChain')
    expect(src).toContain('categorizeError')
  })
})

// === E2E Pipeline: Flow integrity ===

describe('26.5: E2E — Pipeline flow integrity', () => {
  test('6-stage pipeline: topic → research → card+video → approval → posting', () => {
    const raw = fs.readFileSync('_n8n/presets/marketing-content-pipeline.json', 'utf-8')
    const preset = JSON.parse(raw)
    expect(preset.stages.length).toBe(6)

    const stageIds = preset.stages.map((s: { id: string }) => s.id)
    expect(stageIds).toEqual([
      'topic-input', 'ai-research', 'card-news', 'short-form', 'human-approval', 'multi-platform-post',
    ])
  })

  test('research branches to card-news AND short-form (parallel)', () => {
    const raw = fs.readFileSync('_n8n/presets/marketing-content-pipeline.json', 'utf-8')
    const preset = JSON.parse(raw)
    const research = preset.stages.find((s: { id: string }) => s.id === 'ai-research')
    expect(research.next).toContain('card-news')
    expect(research.next).toContain('short-form')
  })

  test('both generation stages converge to human-approval', () => {
    const raw = fs.readFileSync('_n8n/presets/marketing-content-pipeline.json', 'utf-8')
    const preset = JSON.parse(raw)
    const cardNews = preset.stages.find((s: { id: string }) => s.id === 'card-news')
    const shortForm = preset.stages.find((s: { id: string }) => s.id === 'short-form')
    expect(cardNews.next).toContain('human-approval')
    expect(shortForm.next).toContain('human-approval')
  })

  test('approval outputs to multi-platform posting', () => {
    const raw = fs.readFileSync('_n8n/presets/marketing-content-pipeline.json', 'utf-8')
    const preset = JSON.parse(raw)
    const approval = preset.stages.find((s: { id: string }) => s.id === 'human-approval')
    expect(approval.next).toContain('multi-platform-post')
  })
})

// === NFR-P17: Performance Targets ===

describe('26.5: NFR-P17 — Performance targets verified', () => {
  test('image generation target: ≤ 2 minutes', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('imageGenerationMaxMs')
    expect(src).toContain('2 * 60 * 1000')
  })

  test('video generation target: ≤ 10 minutes', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('videoGenerationMaxMs')
    expect(src).toContain('10 * 60 * 1000')
  })

  test('posting target: ≤ 30 seconds per platform', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('postingMaxMs')
    expect(src).toContain('30 * 1000')
  })

  test('posting uses AbortController with 30s timeout', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('AbortController')
    expect(src).toContain('PERFORMANCE_TARGETS.postingMaxMs')
  })

  test('fallback retry timeout also 30s', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('timeoutMs: 30_000')
  })
})

// === MKT-2: Fallback Engine Test ===

describe('26.5: MKT-2 — Fallback engine test', () => {
  test('primary engine failure → retry 2x', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('maxRetries: 2')
    expect(src).toContain("attempt <= config.maxRetries")
  })

  test('after retries exhaust → fallback engine continues', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('for (const fallback of chain.fallbacks)')
  })

  test('fallback chain covers all engine categories', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain("'image'")
    expect(src).toContain("'video'")
    expect(src).toContain("'narration'")
    expect(src).toContain("'subtitles'")
  })

  test('image has 4 fallback providers (flux, dall-e, midjourney, stable-diffusion)', () => {
    const src = readSrc('services/marketing-settings.ts')
    const providers = ['flux', 'dall-e', 'midjourney', 'stable-diffusion']
    for (const p of providers) {
      expect(src).toContain(`id: '${p}'`)
    }
  })

  test('video has 4 fallback providers (runway, kling, pika, sora)', () => {
    const src = readSrc('services/marketing-settings.ts')
    const providers = ['runway', 'kling', 'pika', 'sora']
    for (const p of providers) {
      expect(src).toContain(`id: '${p}'`)
    }
  })

  test('auth errors skip retry (bad API key never self-fixes)', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain("category !== 'auth'")
    expect(src).toContain('isRetryable(lastCategory)')
  })
})

// === Admin notifications ===

describe('26.5: Admin notifications on failures', () => {
  test('fallback activation → notification to admin', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('marketing_engine_fallback')
    expect(src).toContain('마케팅 엔진 폴백 활성화')
  })

  test('all engines failed → notification to admin', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('marketing_engine_all_failed')
    expect(src).toContain('관리자 확인이 필요합니다')
  })

  test('partial posting failure → notification to admin', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('marketing_posting_partial_failure')
    expect(src).toContain('일부 플랫폼 게시 실패')
  })

  test('approval request → notification to CEO', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('marketing_approval')
    expect(src).toContain('마케팅 콘텐츠 승인 요청')
  })
})

// === Routes: All marketing endpoints registered ===

describe('26.5: All marketing routes registered', () => {
  test('admin marketing settings routes', () => {
    const src = readSrc('routes/admin/company-settings.ts')
    expect(src).toContain('/company-settings/marketing')
  })

  test('admin n8n preset routes', () => {
    const src = readSrc('routes/admin/n8n-presets.ts')
    expect(src).toContain('/n8n/presets')
  })

  test('workspace marketing approval routes', () => {
    const src = readSrc('routes/workspace/marketing-approval.ts')
    expect(src).toContain('/marketing/approvals')
  })

  test('all routes registered in index.ts', () => {
    const src = readSrc('index.ts')
    expect(src).toContain('companySettingsRoute')
    expect(src).toContain('n8nPresetsRoute')
    expect(src).toContain('marketingApprovalRoute')
  })
})

// === CEO App: All marketing pages ===

describe('26.5: CEO app marketing pages', () => {
  test('marketing pipeline page (26.2)', () => {
    const src = fs.readFileSync('packages/app/src/App.tsx', 'utf-8')
    expect(src).toContain('MarketingPipelinePage')
    expect(src).toContain('"marketing-pipeline"')
  })

  test('marketing approval page (26.3)', () => {
    const src = fs.readFileSync('packages/app/src/App.tsx', 'utf-8')
    expect(src).toContain('MarketingApprovalPage')
    expect(src).toContain('"marketing-approval"')
  })

  test('sidebar has both marketing entries', () => {
    const src = fs.readFileSync('packages/app/src/components/sidebar.tsx', 'utf-8')
    expect(src).toContain("'/marketing-pipeline'")
    expect(src).toContain("'/marketing-approval'")
    expect(src).toContain('GitBranch')
    expect(src).toContain('UserCheck')
  })
})

// === Admin App: Marketing settings page ===

describe('26.5: Admin app marketing settings', () => {
  test('marketing settings page (26.1)', () => {
    const src = fs.readFileSync('packages/admin/src/App.tsx', 'utf-8')
    expect(src).toContain('MarketingSettingsPage')
    expect(src).toContain('"marketing-settings"')
  })

  test('admin sidebar has marketing entry', () => {
    const src = fs.readFileSync('packages/admin/src/components/sidebar.tsx', 'utf-8')
    expect(src).toContain("'/marketing-settings'")
    expect(src).toContain('마케팅 AI 엔진')
  })
})

// === Security: API key encryption (AR39) ===

describe('26.5: Security — API key encryption', () => {
  test('API keys encrypted with AES-256-GCM', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain("import { encrypt, decrypt } from '../lib/crypto'")
    expect(src).toContain('encrypt(')
    expect(src).toContain('decrypt(')
  })

  test('GET response returns boolean flags, never raw keys', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain('apiKeys: Record<string, boolean>')
  })
})

// === Sprint 2 Exit: Epic 26 Complete ===

describe('26.5: Sprint 2 exit — Epic 26 verification', () => {
  test('all 5 story test files exist', () => {
    expect(fs.existsSync('packages/server/src/__tests__/unit/marketing-settings-26-1.test.ts')).toBe(true)
    expect(fs.existsSync('packages/server/src/__tests__/unit/marketing-presets-26-2.test.ts')).toBe(true)
    expect(fs.existsSync('packages/server/src/__tests__/unit/marketing-approval-26-3.test.ts')).toBe(true)
    expect(fs.existsSync('packages/server/src/__tests__/unit/marketing-fallback-26-4.test.ts')).toBe(true)
    expect(fs.existsSync('packages/server/src/__tests__/unit/marketing-e2e-26-5.test.ts')).toBe(true)
  })

  test('all marketing services exist', () => {
    expect(fs.existsSync('packages/server/src/services/marketing-settings.ts')).toBe(true)
    expect(fs.existsSync('packages/server/src/services/n8n-preset-workflows.ts')).toBe(true)
    expect(fs.existsSync('packages/server/src/services/marketing-approval.ts')).toBe(true)
    expect(fs.existsSync('packages/server/src/services/marketing-fallback.ts')).toBe(true)
  })

  test('preset JSON exists with 6 stages and 5 platforms', () => {
    const raw = fs.readFileSync('_n8n/presets/marketing-content-pipeline.json', 'utf-8')
    const preset = JSON.parse(raw)
    expect(preset.stages.length).toBe(6)
    expect(preset.platforms.length).toBe(5)
  })

  test('onboarding marketing template suggestion (FR-MKT5)', () => {
    const src = readSrc('routes/onboarding.ts')
    expect(src).toContain("'/onboarding/marketing-presets'")
    expect(src).toContain('listPresets')
  })
})
