import { db } from '../db'
import { costRecords } from '../db/schema'

// Claude 모델별 가격 ($ per 1M tokens)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4 },
  'claude-opus-4-20250515': { input: 15, output: 75 },
}

const DEFAULT_PRICING = { input: 3, output: 15 }

/**
 * 토큰 수를 microdollars로 변환 (1 microdollar = $0.000001)
 */
export function calculateCostMicro(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] || DEFAULT_PRICING
  const inputCost = (inputTokens / 1_000_000) * pricing.input * 1_000_000
  const outputCost = (outputTokens / 1_000_000) * pricing.output * 1_000_000
  return Math.round(inputCost + outputCost)
}

type RecordParams = {
  companyId: string
  agentId?: string
  sessionId?: string
  model: string
  inputTokens: number
  outputTokens: number
  source: 'chat' | 'delegation' | 'job' | 'sns'
}

/**
 * AI 비용 기록 (fire-and-forget)
 */
export async function recordCost(params: RecordParams): Promise<void> {
  try {
    const costMicro = calculateCostMicro(params.model, params.inputTokens, params.outputTokens)

    await db.insert(costRecords).values({
      companyId: params.companyId,
      agentId: params.agentId,
      sessionId: params.sessionId,
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
 * microdollars → USD 변환 (표시용)
 */
export function microToUsd(micro: number): number {
  return micro / 1_000_000
}
