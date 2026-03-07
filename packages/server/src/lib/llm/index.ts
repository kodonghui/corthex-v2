import type { LLMProviderName } from '@corthex/shared'
import type { LLMProvider } from './types'
import { AnthropicAdapter } from './anthropic'
import { OpenAIAdapter } from './openai'
import { GoogleAdapter } from './google'

export function createProvider(name: LLMProviderName, apiKey: string): LLMProvider {
  switch (name) {
    case 'anthropic':
      return new AnthropicAdapter(apiKey)
    case 'openai':
      return new OpenAIAdapter(apiKey)
    case 'google':
      return new GoogleAdapter(apiKey)
    default:
      throw new Error(`Unknown LLM provider: ${name}`)
  }
}

export { AnthropicAdapter } from './anthropic'
export { OpenAIAdapter } from './openai'
export { GoogleAdapter } from './google'
export type { LLMProvider } from './types'
export type { ModelsConfig, ModelConfig } from './types'
