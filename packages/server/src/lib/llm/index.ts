import type { LLMProviderName } from '@corthex/shared'
import type { LLMProvider } from './types'
import { AnthropicAdapter } from './anthropic'
import { OpenAIAdapter } from './openai'

export function createProvider(name: LLMProviderName, apiKey: string): LLMProvider {
  switch (name) {
    case 'anthropic':
      return new AnthropicAdapter(apiKey)
    case 'openai':
      return new OpenAIAdapter(apiKey)
    case 'google':
      throw new Error('Google/Gemini provider removed (확정 결정 #1) — use Anthropic or OpenAI')
    default:
      throw new Error(`Unknown LLM provider: ${name}`)
  }
}

export { AnthropicAdapter } from './anthropic'
export { OpenAIAdapter } from './openai'
export type { LLMProvider } from './types'
export type { ModelsConfig, ModelConfig } from './types'
