import { getDB } from '../../db/scoped-query'
import type { SessionContext } from '../types'

// USD per 1M tokens (Phase 1 hardcoded, Phase 3+ from tier_configs DB)
const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 0.8, output: 4 },
  'claude-opus-4-6': { input: 15, output: 75 },
}

const DEFAULT_PRICE = { input: 3, output: 15 }

export interface UsageInfo {
  inputTokens: number
  outputTokens: number
  model: string
}

export async function costTracker(
  ctx: SessionContext,
  usage: UsageInfo,
): Promise<void> {
  const prices = MODEL_PRICES[usage.model] || DEFAULT_PRICE
  const costUsdMicro = Math.round(
    (usage.inputTokens * prices.input + usage.outputTokens * prices.output) / 1_000_000 * 1_000_000,
  )

  const agentId = ctx.visitedAgents[ctx.visitedAgents.length - 1] || undefined

  await getDB(ctx.companyId).insertCostRecord({
    agentId,
    sessionId: ctx.sessionId,
    model: usage.model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    costUsdMicro,
    source: 'delegation',
  })
}
