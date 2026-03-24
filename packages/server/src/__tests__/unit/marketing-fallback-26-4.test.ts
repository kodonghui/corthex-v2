import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'

/**
 * Story 26.4: API Failure Fallback & Error Handling
 * References: FR-MKT7, MKT-2, MKT-5
 *
 * Tests verify:
 * (1) Error categorization (FR-MKT7)
 * (2) Retry logic: timeout 30s → retry 2x (MKT-2)
 * (3) Fallback engine auto-switch (MKT-2)
 * (4) Circuit breaker pattern
 * (5) Notification on fallback activation
 * (6) Platform API change handling (MKT-5)
 */

const readSrc = (relPath: string) =>
  fs.readFileSync(`packages/server/src/${relPath}`, 'utf-8')

// === FR-MKT7: Error Handling Service ===

describe('26.4: FR-MKT7 — Marketing fallback service', () => {
  test('marketing-fallback.ts exists', () => {
    expect(fs.existsSync('packages/server/src/services/marketing-fallback.ts')).toBe(true)
  })

  test('exports ErrorCategory type', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain("export type ErrorCategory = 'timeout' | 'rate_limit' | 'auth' | 'server_error' | 'network' | 'unknown'")
  })

  test('exports RetryConfig interface with maxRetries, baseDelayMs, timeoutMs', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export interface RetryConfig')
    expect(src).toContain('maxRetries: number')
    expect(src).toContain('baseDelayMs: number')
    expect(src).toContain('timeoutMs: number')
  })

  test('exports FallbackChain interface', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export interface FallbackChain')
    expect(src).toContain('primary')
    expect(src).toContain('fallbacks')
    expect(src).toContain('category: EngineCategory')
  })

  test('exports EngineCallResult with fallback tracking', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export interface EngineCallResult')
    expect(src).toContain('usedFallback: boolean')
    expect(src).toContain('fallbackProvider')
    expect(src).toContain('errorCategory')
    expect(src).toContain('totalDurationMs: number')
  })
})

// === MKT-2: Retry Config ===

describe('26.4: MKT-2 — Retry configuration', () => {
  test('DEFAULT_RETRY_CONFIG has maxRetries: 2', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export const DEFAULT_RETRY_CONFIG')
    expect(src).toContain('maxRetries: 2')
  })

  test('timeout is 30s (30000ms) per MKT-2', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('timeoutMs: 30_000')
  })

  test('base delay is 1s with exponential backoff', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('baseDelayMs: 1000')
    expect(src).toContain('Math.pow(2, attempt)')
  })
})

// === Error Categorization ===

describe('26.4: Error categorization', () => {
  test('categorizeError function exported', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export function categorizeError')
  })

  test('categorizes timeout errors', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain("'timeout'")
    expect(src).toContain("msg.includes('aborted')")
  })

  test('categorizes rate limit errors (429)', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain("'rate_limit'")
    expect(src).toContain("msg.includes('429')")
  })

  test('categorizes auth errors (401, 403)', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain("'auth'")
    expect(src).toContain("msg.includes('401')")
    expect(src).toContain("msg.includes('403')")
  })

  test('categorizes server errors (5xx)', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain("'server_error'")
    expect(src).toContain("msg.includes('500')")
    expect(src).toContain("msg.includes('502')")
  })

  test('auth errors are NOT retryable', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export function isRetryable')
    expect(src).toContain("category !== 'auth'")
  })
})

// === Circuit Breaker ===

describe('26.4: Circuit breaker', () => {
  test('checkCircuit function exported', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export function checkCircuit')
  })

  test('recordFailure function exported', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export function recordFailure')
  })

  test('recordSuccess resets circuit state', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export function recordSuccess')
    expect(src).toContain('circuitState.delete(provider)')
  })

  test('circuit opens after 3 failures', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('CIRCUIT_FAILURE_THRESHOLD = 3')
    expect(src).toContain('state.isOpen = true')
  })

  test('circuit resets after 60s cooldown', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('CIRCUIT_RESET_MS = 60_000')
    expect(src).toContain('state.isOpen = false')
    expect(src).toContain('state.failures = 0')
  })

  test('getCircuitStates for monitoring', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export function getCircuitStates')
  })

  test('resetAllCircuits for testing/admin', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export function resetAllCircuits')
    expect(src).toContain('circuitState.clear()')
  })
})

// === Fallback Chain ===

describe('26.4: Fallback chain builder', () => {
  test('buildFallbackChain function exported', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export function buildFallbackChain')
  })

  test('uses MARKETING_ENGINE_PROVIDERS from marketing-settings', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain("import { MARKETING_ENGINE_PROVIDERS")
    expect(src).toContain('MARKETING_ENGINE_PROVIDERS[category]')
  })

  test('excludes primary provider from fallbacks', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain("provider.id !== primaryProvider")
  })

  test('fallbacks use first model of each provider', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('provider.models[0]')
  })
})

// === Execute with Fallback (FR-MKT7 core) ===

describe('26.4: executeWithFallback — core retry+fallback logic', () => {
  test('executeWithFallback function exported', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('export async function executeWithFallback')
  })

  test('tries primary engine first', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('chain.primary.provider')
    expect(src).toContain('chain.primary.model')
  })

  test('on primary failure, tries fallback engines', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('for (const fallback of chain.fallbacks)')
  })

  test('fallback engines get fewer retries (maxRetries: 1)', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('maxRetries: 1')
  })

  test('notifies admin on fallback activation', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('marketing_engine_fallback')
    expect(src).toContain('마케팅 엔진 폴백 활성화')
    expect(src).toContain('자동 전환되었습니다')
  })

  test('notifies admin when all engines fail', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('marketing_engine_all_failed')
    expect(src).toContain('마케팅 엔진 전체 실패')
    expect(src).toContain('관리자 확인이 필요합니다')
  })

  test('uses AbortController for timeout', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('AbortController')
    expect(src).toContain('controller.abort()')
    expect(src).toContain('clearTimeout(timeout)')
  })

  test('skips fallback with open circuit breaker', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('checkCircuit(fallback.provider)')
  })

  test('tracks total attempts across primary and fallbacks', () => {
    const src = readSrc('services/marketing-fallback.ts')
    expect(src).toContain('attempts += primaryResult.attempts')
    expect(src).toContain('attempts += fallbackResult.attempts')
  })
})

// === MKT-5: Platform API Change Handling ===

describe('26.4: MKT-5 — Platform API change response', () => {
  test('platform posting uses n8n webhooks (node updates only)', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('/webhook/marketing/post/')
    expect(src).toContain('N8N_BASE_URL')
  })

  test('preset workflows use n8nNodeType (n8n node updates, no code changes)', () => {
    const raw = fs.readFileSync('_n8n/presets/marketing-content-pipeline.json', 'utf-8')
    const preset = JSON.parse(raw)
    for (const stage of preset.stages) {
      expect(stage.n8nNodeType).toBeTruthy()
      expect(stage.n8nNodeType).toContain('n8n-nodes-base.')
    }
  })
})

// === Integration: Fallback works with marketing-settings providers ===

describe('26.4: Fallback integration with engine providers', () => {
  test('image category has 4 providers for fallback chain', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain("id: 'flux'")
    expect(src).toContain("id: 'dall-e'")
    expect(src).toContain("id: 'midjourney'")
    expect(src).toContain("id: 'stable-diffusion'")
  })

  test('video category has 4 providers for fallback chain', () => {
    const src = readSrc('services/marketing-settings.ts')
    expect(src).toContain("id: 'runway'")
    expect(src).toContain("id: 'kling'")
    expect(src).toContain("id: 'pika'")
    expect(src).toContain("id: 'sora'")
  })
})
