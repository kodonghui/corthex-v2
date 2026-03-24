/**
 * Story 26.4: API Failure Fallback & Error Handling
 * References: FR-MKT7, MKT-2, MKT-5
 *
 * n8n Error Workflow: timeout 30s → retry 2x → fallback engine auto-switch.
 * Handles API failures gracefully so content creation doesn't stop.
 */

import { eventBus } from '../lib/event-bus'
import { MARKETING_ENGINE_PROVIDERS, type EngineCategory } from './marketing-settings'

// === Types ===

export type ErrorCategory = 'timeout' | 'rate_limit' | 'auth' | 'server_error' | 'network' | 'unknown'

export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  timeoutMs: number
}

export interface FallbackChain {
  category: EngineCategory
  primary: { provider: string; model: string }
  fallbacks: Array<{ provider: string; model: string }>
}

export interface EngineCallResult<T = unknown> {
  success: boolean
  data?: T
  provider: string
  model: string
  attempts: number
  usedFallback: boolean
  fallbackProvider?: string
  totalDurationMs: number
  error?: string
  errorCategory?: ErrorCategory
}

// === Constants ===

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,          // retry 2x per MKT-2
  baseDelayMs: 1000,      // 1s base delay
  timeoutMs: 30_000,      // 30s timeout per MKT-2
} as const

// Circuit breaker state per provider
const circuitState = new Map<string, {
  failures: number
  lastFailure: number
  isOpen: boolean
}>()

const CIRCUIT_FAILURE_THRESHOLD = 3
const CIRCUIT_RESET_MS = 60_000 // 1 minute

// === Error categorization ===

export function categorizeError(error: unknown): ErrorCategory {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('timeout') || msg.includes('aborted')) return 'timeout'
    if (msg.includes('429') || msg.includes('rate limit') || msg.includes('too many')) return 'rate_limit'
    if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('forbidden')) return 'auth'
    if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('504')) return 'server_error'
    if (msg.includes('fetch') || msg.includes('econnrefused') || msg.includes('network')) return 'network'
  }
  return 'unknown'
}

/**
 * Check if an error is retryable.
 * Auth errors are NOT retryable (bad API key won't fix itself).
 */
export function isRetryable(category: ErrorCategory): boolean {
  return category !== 'auth'
}

// === Circuit breaker ===

export function checkCircuit(provider: string): boolean {
  const state = circuitState.get(provider)
  if (!state) return true // no state = closed (healthy)

  if (state.isOpen) {
    // Check if reset period has passed
    if (Date.now() - state.lastFailure > CIRCUIT_RESET_MS) {
      state.isOpen = false
      state.failures = 0
      return true // half-open: allow one attempt
    }
    return false // still open
  }
  return true
}

export function recordFailure(provider: string): void {
  const state = circuitState.get(provider) ?? { failures: 0, lastFailure: 0, isOpen: false }
  state.failures++
  state.lastFailure = Date.now()
  if (state.failures >= CIRCUIT_FAILURE_THRESHOLD) {
    state.isOpen = true
  }
  circuitState.set(provider, state)
}

export function recordSuccess(provider: string): void {
  circuitState.delete(provider) // reset on success
}

/** Get current circuit state for monitoring */
export function getCircuitStates(): Record<string, { failures: number; isOpen: boolean }> {
  const result: Record<string, { failures: number; isOpen: boolean }> = {}
  for (const [provider, state] of circuitState) {
    result[provider] = { failures: state.failures, isOpen: state.isOpen }
  }
  return result
}

// === Fallback chain builder ===

/**
 * Build fallback chain for a given engine category.
 * Uses the selected primary engine and generates fallbacks from other providers.
 */
export function buildFallbackChain(
  category: EngineCategory,
  primaryProvider: string,
  primaryModel: string,
): FallbackChain {
  const providers = MARKETING_ENGINE_PROVIDERS[category]
  const fallbacks: Array<{ provider: string; model: string }> = []

  for (const provider of providers) {
    if (provider.id !== primaryProvider) {
      fallbacks.push({ provider: provider.id, model: provider.models[0] })
    }
  }

  return { category, primary: { provider: primaryProvider, model: primaryModel }, fallbacks }
}

// === Retry with fallback ===

/**
 * Execute an engine call with retry + fallback (FR-MKT7, MKT-2).
 * Flow: attempt primary → retry 2x → try fallback engines.
 */
export async function executeWithFallback<T>(
  chain: FallbackChain,
  callFn: (provider: string, model: string, signal: AbortSignal) => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  companyId?: string,
): Promise<EngineCallResult<T>> {
  const startTime = Date.now()
  let attempts = 0

  // Try primary engine with retries
  const primaryResult = await attemptWithRetry(
    chain.primary.provider,
    chain.primary.model,
    callFn,
    config,
  )
  attempts += primaryResult.attempts

  if (primaryResult.success) {
    recordSuccess(chain.primary.provider)
    return {
      success: true,
      data: primaryResult.data,
      provider: chain.primary.provider,
      model: chain.primary.model,
      attempts,
      usedFallback: false,
      totalDurationMs: Date.now() - startTime,
    }
  }

  // Primary failed — try fallback engines
  for (const fallback of chain.fallbacks) {
    // Skip if circuit is open for this provider
    if (!checkCircuit(fallback.provider)) continue

    const fallbackResult = await attemptWithRetry(
      fallback.provider,
      fallback.model,
      callFn,
      { ...config, maxRetries: 1 }, // fewer retries for fallbacks
    )
    attempts += fallbackResult.attempts

    if (fallbackResult.success) {
      recordSuccess(fallback.provider)

      // Notify admin of fallback activation
      if (companyId) {
        eventBus.emit('notification', {
          userId: companyId,
          payload: {
            type: 'marketing_engine_fallback',
            title: '마케팅 엔진 폴백 활성화',
            message: `${chain.primary.provider} 실패 → ${fallback.provider}로 자동 전환되었습니다. (${chain.category})`,
            category: chain.category,
            primary: chain.primary.provider,
            fallback: fallback.provider,
          },
        })
      }

      return {
        success: true,
        data: fallbackResult.data,
        provider: fallback.provider,
        model: fallback.model,
        attempts,
        usedFallback: true,
        fallbackProvider: fallback.provider,
        totalDurationMs: Date.now() - startTime,
      }
    }
    // Note: recordFailure already called inside attemptWithRetry on final failure
  }

  // All engines failed
  const errorCategory = primaryResult.errorCategory ?? 'unknown'

  if (companyId) {
    eventBus.emit('notification', {
      userId: companyId,
      payload: {
        type: 'marketing_engine_all_failed',
        title: '마케팅 엔진 전체 실패',
        message: `${chain.category} 카테고리의 모든 엔진이 실패했습니다. 관리자 확인이 필요합니다.`,
        category: chain.category,
        errorCategory,
        attempts,
      },
    })
  }

  return {
    success: false,
    provider: chain.primary.provider,
    model: chain.primary.model,
    attempts,
    usedFallback: false,
    totalDurationMs: Date.now() - startTime,
    error: primaryResult.error,
    errorCategory,
  }
}

// === Internal retry logic ===

interface AttemptResult<T> {
  success: boolean
  data?: T
  attempts: number
  error?: string
  errorCategory?: ErrorCategory
}

async function attemptWithRetry<T>(
  provider: string,
  model: string,
  callFn: (provider: string, model: string, signal: AbortSignal) => Promise<T>,
  config: RetryConfig,
): Promise<AttemptResult<T>> {
  let lastError: string | undefined
  let lastCategory: ErrorCategory | undefined

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    // Circuit breaker check
    if (!checkCircuit(provider)) {
      return {
        success: false,
        attempts: attempt,
        error: `Circuit breaker open for ${provider}`,
        errorCategory: 'server_error',
      }
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs)

    try {
      const data = await callFn(provider, model, controller.signal)
      clearTimeout(timeout)
      return { success: true, data, attempts: attempt + 1 }
    } catch (err) {
      clearTimeout(timeout)
      lastCategory = categorizeError(err)
      lastError = err instanceof Error ? err.message : String(err)

      // Don't retry auth errors
      if (!isRetryable(lastCategory)) {
        recordFailure(provider)
        return {
          success: false,
          attempts: attempt + 1,
          error: lastError,
          errorCategory: lastCategory,
        }
      }

      // Exponential backoff before retry (skip delay on last attempt)
      if (attempt < config.maxRetries) {
        const delay = config.baseDelayMs * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  recordFailure(provider)
  return {
    success: false,
    attempts: config.maxRetries + 1,
    error: lastError,
    errorCategory: lastCategory,
  }
}

// === Reset circuit breakers (for testing/admin) ===

export function resetAllCircuits(): void {
  circuitState.clear()
}
