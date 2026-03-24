import { getModelConfig, getTierDefaultModel, getFallbackModels } from '../config/models'
import { createProvider } from '../lib/llm/index'
import { getCredentials } from './credential-vault'
import { recordCost, microToUsd } from '../lib/cost-tracker'
import { createAuditLog, AUDIT_ACTIONS } from './audit-log'
import { CircuitBreaker } from '../lib/llm/circuit-breaker'
import { checkBudget } from './budget-guard'
import type { LLMProvider } from '../lib/llm/types'
import type { LLMRequest, LLMResponse, LLMStreamChunk, LLMProviderName, LLMError } from '@corthex/shared'
import type { CircuitBreakerStatus } from '../lib/llm/circuit-breaker'

// === Types ===

export type LLMRouterContext = {
  companyId: string
  agentId?: string
  agentName?: string
  sessionId?: string
  source: 'chat' | 'delegation' | 'job' | 'sns'
}

type AgentModelInfo = {
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string | null
}

type ModelResolution = {
  model: string
  reason: 'tier-default' | 'manual-override'
}

type FallbackAttemptError = {
  provider: LLMProviderName
  model: string
  error: string
  code: LLMError['code']
}

// === Constants ===

const FALLBACK_BUDGET_MS = 5_000
const RETRYABLE_CODES: Set<LLMError['code']> = new Set([
  'server_error',
  'timeout',
  'rate_limit',
])

// === Model Resolution ===

const SCHEMA_DEFAULT_MODEL = 'claude-haiku-4-5'

/**
 * Resolve which model an agent should use.
 * - If agent has a manually set modelName (different from schema default), use it
 * - Otherwise use tier default from models.yaml
 */
export function resolveModel(agent: AgentModelInfo): ModelResolution {
  if (agent.modelName && agent.modelName !== SCHEMA_DEFAULT_MODEL) {
    return { model: agent.modelName, reason: 'manual-override' }
  }
  const tierModel = getTierDefaultModel(agent.tier)
  return { model: tierModel, reason: 'tier-default' }
}

// === Provider Resolution ===

/**
 * Map model ID -> provider name using models.yaml config.
 * Throws if model not found.
 */
export function resolveProvider(modelId: string): LLMProviderName {
  const config = getModelConfig(modelId)
  if (!config) {
    throw createLLMError('anthropic', 'invalid_request', `Unknown model: ${modelId}`)
  }
  return config.provider
}

/**
 * Map provider name to credential vault provider key.
 * CredentialVault uses 'google_ai' while models.yaml uses 'google'.
 */
function toCredentialProvider(provider: LLMProviderName): string {
  // dead code after 22.2 — kept for backward compat (historical cost records may have provider='google')
  if (provider === 'google') return 'google_ai'
  return provider
}

// === Error Helpers ===

function createLLMError(
  provider: LLMProviderName,
  code: LLMError['code'],
  message: string,
  retryable = false,
): LLMError & Error {
  const err = new Error(message) as LLMError & Error
  err.provider = provider
  err.code = code
  err.retryable = retryable
  return err
}

function normalizeLLMError(err: unknown, provider: LLMProviderName): LLMError & Error {
  if (err && typeof err === 'object' && 'code' in err && 'provider' in err) {
    return err as LLMError & Error
  }
  const message = err instanceof Error ? err.message : String(err)
  const safeMessage = message
    .replace(/sk-[a-zA-Z0-9_-]+/g, 'sk-***')
    .replace(/AIza[a-zA-Z0-9_-]+/g, 'AIza***')
  return createLLMError(provider, 'unknown', safeMessage, false)
}

function isRetryableError(err: LLMError & Error): boolean {
  return RETRYABLE_CODES.has(err.code)
}

/**
 * Race a promise against a timeout. Returns the promise result or throws a timeout error.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, provider: LLMProviderName): Promise<T> {
  if (ms <= 0) {
    return Promise.reject(createLLMError(provider, 'timeout', `Fallback budget exhausted for ${provider}`, true))
  }
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(createLLMError(provider, 'timeout', `Fallback budget timeout (${ms}ms) for ${provider}`, true)), ms),
    ),
  ])
}

// === LLM Router ===

export class LLMRouter {
  private circuitBreaker: CircuitBreaker

  constructor(circuitBreaker?: CircuitBreaker) {
    this.circuitBreaker = circuitBreaker ?? new CircuitBreaker()
  }

  /**
   * Route an LLM request with automatic provider fallback.
   * Tries the primary provider first, then falls back through equivalent-tier models.
   */
  async call(request: LLMRequest, context: LLMRouterContext): Promise<LLMResponse> {
    // Budget check — before any LLM call
    await this.enforceBudget(context)

    const startTime = Date.now()
    const primaryProvider = resolveProvider(request.model)
    const errors: FallbackAttemptError[] = []

    // Build attempt chain: primary model + fallback models
    const modelsToTry = [request.model, ...getFallbackModels(request.model)]

    for (let idx = 0; idx < modelsToTry.length; idx++) {
      const modelId = modelsToTry[idx]
      const provider = resolveProvider(modelId)
      const remaining = FALLBACK_BUDGET_MS - (Date.now() - startTime)
      if (remaining <= 0) break
      const isFallback = idx > 0

      if (!this.circuitBreaker.isAvailable(provider)) {
        errors.push({ provider, model: modelId, error: 'Circuit breaker open', code: 'server_error' })
        continue
      }

      try {
        const adapter = await this.getAdapter(provider, context.companyId)

        // Enforce per-attempt timeout from remaining budget
        const callPromise = adapter.call({ ...request, model: modelId })
        const response = await withTimeout(callPromise, remaining, provider)

        this.circuitBreaker.recordSuccess(provider)

        // Record cost with actual provider/model used
        recordCost({
          companyId: context.companyId,
          agentId: context.agentId,
          sessionId: context.sessionId,
          provider,
          model: modelId,
          inputTokens: response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
          source: context.source,
        }).catch(() => {})

        // Log fallback if not primary
        if (isFallback) {
          this.logFallback(request.model, primaryProvider, modelId, provider, errors, Date.now() - startTime, context)
        }

        this.logRouting(modelId, provider, context)
        return response
      } catch (err) {
        const llmErr = normalizeLLMError(err, provider)
        this.circuitBreaker.recordFailure(provider)
        errors.push({ provider, model: modelId, error: llmErr.message, code: llmErr.code })

        // Non-retryable errors on primary provider: don't fallback
        // But on fallback providers: always continue to next (credential issues, etc.)
        if (!isFallback && !isRetryableError(llmErr)) {
          throw llmErr
        }
      }
    }

    // All providers failed
    throw createLLMError(
      primaryProvider,
      'server_error',
      `All providers failed for model ${request.model}: ${errors.map(e => `${e.provider}(${e.code}): ${e.error}`).join('; ')}`,
      false,
    )
  }

  /**
   * Route a streaming LLM request with automatic provider fallback.
   * If stream fails before any chunks, falls back to next provider's stream.
   * If stream fails mid-stream, falls back to non-streaming call on next provider.
   */
  async *stream(request: LLMRequest, context: LLMRouterContext): AsyncGenerator<LLMStreamChunk> {
    // Budget check — before any LLM call
    await this.enforceBudget(context)

    const startTime = Date.now()
    const primaryProvider = resolveProvider(request.model)
    const errors: FallbackAttemptError[] = []
    const modelsToTry = [request.model, ...getFallbackModels(request.model)]

    for (let i = 0; i < modelsToTry.length; i++) {
      const modelId = modelsToTry[i]
      const provider = resolveProvider(modelId)
      const remaining = FALLBACK_BUDGET_MS - (Date.now() - startTime)
      if (remaining <= 0) break
      const isFallback = i > 0

      if (!this.circuitBreaker.isAvailable(provider)) {
        errors.push({ provider, model: modelId, error: 'Circuit breaker open', code: 'server_error' })
        continue
      }

      try {
        const adapter = await this.getAdapter(provider, context.companyId)
        let totalInput = 0
        let totalOutput = 0
        let chunksYielded = 0

        try {
          for await (const chunk of adapter.stream({ ...request, model: modelId })) {
            if (chunk.usage) {
              totalInput = chunk.usage.inputTokens
              totalOutput = chunk.usage.outputTokens
            }
            yield chunk
            chunksYielded++
          }
        } catch (streamErr) {
          const llmErr = normalizeLLMError(streamErr, provider)
          this.circuitBreaker.recordFailure(provider)
          errors.push({ provider, model: modelId, error: llmErr.message, code: llmErr.code })

          if (!isFallback && !isRetryableError(llmErr)) throw llmErr

          if (chunksYielded > 0) {
            // Mid-stream failure: fall back to non-streaming call on next provider
            const remainingModels = modelsToTry.slice(i + 1)
            for (const fallbackModelId of remainingModels) {
              const fbProvider = resolveProvider(fallbackModelId)
              const fbRemaining = FALLBACK_BUDGET_MS - (Date.now() - startTime)
              if (fbRemaining <= 0) break
              if (!this.circuitBreaker.isAvailable(fbProvider)) continue

              try {
                const fbAdapter = await this.getAdapter(fbProvider, context.companyId)
                const response = await fbAdapter.call({ ...request, model: fallbackModelId })
                this.circuitBreaker.recordSuccess(fbProvider)

                yield { type: 'text', content: response.content }
                yield { type: 'done', usage: response.usage }

                recordCost({
                  companyId: context.companyId,
                  agentId: context.agentId,
                  sessionId: context.sessionId,
                  provider: fbProvider,
                  model: fallbackModelId,
                  inputTokens: response.usage.inputTokens,
                  outputTokens: response.usage.outputTokens,
                  source: context.source,
                }).catch(() => {})

                this.logFallback(request.model, primaryProvider, fallbackModelId, fbProvider, errors, Date.now() - startTime, context)
                return
              } catch (fbErr) {
                const fbLlmErr = normalizeLLMError(fbErr, fbProvider)
                this.circuitBreaker.recordFailure(fbProvider)
                errors.push({ provider: fbProvider, model: fallbackModelId, error: fbLlmErr.message, code: fbLlmErr.code })
                // Always continue to next fallback provider (don't throw on non-retryable)
              }
            }
            throw createLLMError(
              primaryProvider,
              'server_error',
              `All providers failed (mid-stream fallback) for model ${request.model}: ${errors.map(e => `${e.provider}(${e.code}): ${e.error}`).join('; ')}`,
              false,
            )
          }
          // No chunks yielded -- continue to next provider's stream
          continue
        }

        this.circuitBreaker.recordSuccess(provider)

        if (totalInput > 0 || totalOutput > 0) {
          recordCost({
            companyId: context.companyId,
            agentId: context.agentId,
            sessionId: context.sessionId,
            provider,
            model: modelId,
            inputTokens: totalInput,
            outputTokens: totalOutput,
            source: context.source,
          }).catch(() => {})
        }

        if (isFallback) {
          this.logFallback(request.model, primaryProvider, modelId, provider, errors, Date.now() - startTime, context)
        }

        this.logRouting(modelId, provider, context)
        return
      } catch (err) {
        // getAdapter failure
        const llmErr = normalizeLLMError(err, provider)
        this.circuitBreaker.recordFailure(provider)
        errors.push({ provider, model: modelId, error: llmErr.message, code: llmErr.code })
        // Non-retryable on primary only; fallback providers always continue
        if (!isFallback && !isRetryableError(llmErr)) throw llmErr
      }
    }

    throw createLLMError(
      primaryProvider,
      'server_error',
      `All providers failed (stream) for model ${request.model}: ${errors.map(e => `${e.provider}(${e.code}): ${e.error}`).join('; ')}`,
      false,
    )
  }

  /**
   * Get circuit breaker status for all providers.
   */
  getCircuitBreakerStatus(): Record<LLMProviderName, CircuitBreakerStatus> {
    return this.circuitBreaker.getStatus()
  }

  /**
   * Check budget before LLM call. Throws BUDGET_EXCEEDED if blocked.
   * Swallows guard failures to avoid breaking LLM calls.
   */
  private async enforceBudget(context: LLMRouterContext): Promise<void> {
    try {
      const result = await checkBudget(context.companyId)
      if (!result.allowed) {
        const resetDate = result.resetDate
        const level = result.reason === 'daily_exceeded' ? '일일' : '월간'
        const budgetMicro = result.reason === 'daily_exceeded' ? result.dailyBudgetMicro : result.monthlyBudgetMicro
        const spendMicro = result.reason === 'daily_exceeded' ? result.currentDaySpendMicro : result.currentMonthSpendMicro

        const err = new Error(`${level} 예산 한도를 초과했습니다`) as Error & {
          code: string
          provider: string
          retryable: boolean
          currentSpend: number
          budget: number
          resetDate: string
        }
        err.code = 'BUDGET_EXCEEDED'
        err.provider = 'system'
        err.retryable = false
        err.currentSpend = microToUsd(spendMicro)
        err.budget = microToUsd(budgetMicro)
        err.resetDate = resetDate
        throw err
      }
    } catch (err) {
      // Re-throw budget exceeded errors, swallow everything else
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'BUDGET_EXCEEDED') {
        throw err
      }
      console.error('[LLMRouter] Budget check failed, proceeding:', err)
    }
  }

  /**
   * Get an adapter instance for a given provider.
   * Creates a new adapter per-request (API keys may rotate).
   */
  private async getAdapter(provider: LLMProviderName, companyId: string): Promise<LLMProvider> {
    const credentialProvider = toCredentialProvider(provider)
    const credentials = await getCredentials(companyId, credentialProvider)
    const apiKey = credentials.api_key || credentials.apiKey || Object.values(credentials)[0]

    if (!apiKey) {
      throw createLLMError(provider, 'auth_error', `No API key found for provider: ${provider}`)
    }

    return createProvider(provider, apiKey)
  }

  private logRouting(model: string, provider: LLMProviderName, context: LLMRouterContext): void {
    console.log(
      `[LLMRouter] model=${model} provider=${provider} agent=${context.agentName ?? 'unknown'} company=${context.companyId.slice(0, 8)}`,
    )
  }

  private logFallback(
    originalModel: string,
    originalProvider: LLMProviderName,
    fallbackModel: string,
    fallbackProvider: LLMProviderName,
    errors: FallbackAttemptError[],
    latencyMs: number,
    context: LLMRouterContext,
  ): void {
    console.log(
      `[LLMRouter:Fallback] ${originalProvider}/${originalModel} -> ${fallbackProvider}/${fallbackModel} latency=${latencyMs}ms`,
    )

    // Fire-and-forget audit log
    createAuditLog({
      companyId: context.companyId,
      actorType: 'system',
      actorId: 'llm-router',
      action: AUDIT_ACTIONS.LLM_FALLBACK,
      targetType: 'llm_provider',
      targetId: originalProvider,
      metadata: {
        originalProvider,
        originalModel,
        fallbackProvider,
        fallbackModel,
        reason: errors.map(e => `${e.provider}(${e.code}): ${e.error}`).join('; '),
        latencyMs,
        agentId: context.agentId,
        agentName: context.agentName,
      },
    }).catch(() => {})
  }
}

// Singleton instance
export const llmRouter = new LLMRouter()
