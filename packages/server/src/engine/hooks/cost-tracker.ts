import { getDB } from '../../db/scoped-query'
import { createSessionLogger } from '../../db/logger'
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
  cacheReadInputTokens?: number
  cacheCreationInputTokens?: number
}

// Cache pricing: read $0.30/MTok (0.1× base), creation $3.75/MTok (1.25× base)
const CACHE_READ_PRICE_PER_MTOK = 0.30
const CACHE_CREATION_PRICE_PER_MTOK = 3.75

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

  // Log cache usage if present (AC#6: prompt_cache_usage event)
  const cacheRead = usage.cacheReadInputTokens ?? 0
  const cacheCreation = usage.cacheCreationInputTokens ?? 0
  if (cacheRead > 0 || cacheCreation > 0) {
    const cacheReadCostUsd = (cacheRead * CACHE_READ_PRICE_PER_MTOK) / 1_000_000
    const cacheCreationCostUsd = (cacheCreation * CACHE_CREATION_PRICE_PER_MTOK) / 1_000_000
    const log = createSessionLogger({
      sessionId: ctx.sessionId,
      companyId: ctx.companyId,
      agentId: agentId || 'unknown',
    })
    log.info({
      event: 'prompt_cache_usage',
      agentId,
      companyId: ctx.companyId,
      cacheReadInputTokens: cacheRead,
      cacheCreationInputTokens: cacheCreation,
      cacheReadCostUsd,
      cacheCreationCostUsd,
    })
  }
}
