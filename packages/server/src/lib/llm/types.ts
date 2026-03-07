import type { LLMRequest, LLMResponse, LLMStreamChunk, LLMProviderName } from '@corthex/shared'

export interface LLMProvider {
  readonly name: LLMProviderName
  readonly supportsBatch: boolean
  call(request: LLMRequest): Promise<LLMResponse>
  stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk>
  estimateCost(inputTokens: number, outputTokens: number, model: string): number
}

export type LLMCallOptions = {
  timeoutMs?: number
  signal?: AbortSignal
}

export type ModelConfig = {
  id: string
  provider: LLMProviderName
  displayName: string
  inputPricePer1M: number
  outputPricePer1M: number
  maxTokens: number
  supportsBatch: boolean
  tierDefault?: string[]
}

export type ModelsConfig = {
  models: ModelConfig[]
  fallbackOrder: LLMProviderName[]
  tierDefaults: Record<string, string>
}
