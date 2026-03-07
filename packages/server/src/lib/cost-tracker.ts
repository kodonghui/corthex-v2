import { db } from '../db'
import { costRecords } from '../db/schema'
import { getModelConfig } from '../config/models'
import type { LLMProviderName } from '@corthex/shared'

// Fallback pricing for unknown models (Claude Sonnet level)
const DEFAULT_PRICING = { input: 3, output: 15 }

/**
 * Get pricing from models.yaml, fallback to hardcoded defaults
 */
function getModelPricing(model: string): { input: number; output: number } {
  const config = getModelConfig(model)
  if (config) {
    return { input: config.inputPricePer1M, output: config.outputPricePer1M }
  }
  return DEFAULT_PRICING
}

/**
 * Calculate cost in microdollars (1 microdollar = $0.000001)
 */
export function calculateCostMicro(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = getModelPricing(model)
  const inputCost = (inputTokens / 1_000_000) * pricing.input * 1_000_000
  const outputCost = (outputTokens / 1_000_000) * pricing.output * 1_000_000
  return Math.round(inputCost + outputCost)
}

type RecordParams = {
  companyId: string
  agentId?: string
  sessionId?: string
  provider?: LLMProviderName
  model: string
  inputTokens: number
  outputTokens: number
  source: 'chat' | 'delegation' | 'job' | 'sns'
}

/**
 * Record AI cost (fire-and-forget)
 */
export async function recordCost(params: RecordParams): Promise<void> {
  try {
    const costMicro = calculateCostMicro(params.model, params.inputTokens, params.outputTokens)

    // Resolve provider from model config if not provided
    const provider = params.provider ?? getModelConfig(params.model)?.provider ?? 'anthropic'

    await db.insert(costRecords).values({
      companyId: params.companyId,
      agentId: params.agentId,
      sessionId: params.sessionId,
      provider,
      model: params.model,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      costUsdMicro: costMicro,
      source: params.source,
    })
  } catch (err) {
    console.error('[CostTracker] 비용 기록 실패:', err)
  }
}

/**
 * microdollars to USD (display)
 */
export function microToUsd(micro: number): number {
  return micro / 1_000_000
}
