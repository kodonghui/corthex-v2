import { getModelConfig, getTierDefaultModel } from '../config/models'
import { createProvider } from '../lib/llm/index'
import { getCredentials } from './credential-vault'
import { recordCost } from '../lib/cost-tracker'
import type { LLMProvider } from '../lib/llm/types'
import type { LLMRequest, LLMResponse, LLMStreamChunk, LLMProviderName, LLMError } from '@corthex/shared'

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

// === Model Resolution ===

const SCHEMA_DEFAULT_MODEL = 'claude-haiku-4-5'

/**
 * Resolve which model an agent should use.
 * - If agent has a manually set modelName (different from schema default), use it
 * - Otherwise use tier default from models.yaml
 */
export function resolveModel(agent: AgentModelInfo): ModelResolution {
  // Manual override: agent has a non-default model explicitly set
  if (agent.modelName && agent.modelName !== SCHEMA_DEFAULT_MODEL) {
    return { model: agent.modelName, reason: 'manual-override' }
  }

  // Tier-based default from models.yaml
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
  // Never expose API keys in error messages
  const safeMessage = message
    .replace(/sk-[a-zA-Z0-9_-]+/g, 'sk-***')
    .replace(/AIza[a-zA-Z0-9_-]+/g, 'AIza***')
  return createLLMError(provider, 'unknown', safeMessage, false)
}

// === LLM Router ===

export class LLMRouter {
  /**
   * Route an LLM request to the correct provider adapter.
   * 1. Resolve provider from model ID
   * 2. Get API key from CredentialVault
   * 3. Create adapter and call
   * 4. Record cost (fire-and-forget)
   */
  async call(request: LLMRequest, context: LLMRouterContext): Promise<LLMResponse> {
    const provider = resolveProvider(request.model)

    try {
      const adapter = await this.getAdapter(provider, context.companyId)
      const response = await adapter.call(request)

      // Fire-and-forget cost recording
      recordCost({
        companyId: context.companyId,
        agentId: context.agentId,
        sessionId: context.sessionId,
        provider,
        model: request.model,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        source: context.source,
      }).catch(() => { /* cost recording is non-critical */ })

      this.logRouting(request.model, provider, context)
      return response
    } catch (err) {
      throw normalizeLLMError(err, provider)
    }
  }

  /**
   * Route a streaming LLM request to the correct provider adapter.
   */
  async *stream(request: LLMRequest, context: LLMRouterContext): AsyncGenerator<LLMStreamChunk> {
    const provider = resolveProvider(request.model)

    try {
      const adapter = await this.getAdapter(provider, context.companyId)
      let totalInput = 0
      let totalOutput = 0

      for await (const chunk of adapter.stream(request)) {
        if (chunk.usage) {
          totalInput = chunk.usage.inputTokens
          totalOutput = chunk.usage.outputTokens
        }
        yield chunk
      }

      // Record cost after stream completes
      if (totalInput > 0 || totalOutput > 0) {
        recordCost({
          companyId: context.companyId,
          agentId: context.agentId,
          sessionId: context.sessionId,
          provider,
          model: request.model,
          inputTokens: totalInput,
          outputTokens: totalOutput,
          source: context.source,
        }).catch(() => { /* cost recording is non-critical */ })
      }

      this.logRouting(request.model, provider, context)
    } catch (err) {
      throw normalizeLLMError(err, provider)
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
}

// Singleton instance
export const llmRouter = new LLMRouter()
