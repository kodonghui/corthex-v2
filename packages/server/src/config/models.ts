import { readFileSync } from 'fs'
import { join } from 'path'
import type { ModelsConfig, ModelConfig } from '../lib/llm/types'
import type { LLMProviderName } from '@corthex/shared'

let cachedConfig: ModelsConfig | null = null

function parseYaml(content: string): ModelsConfig {
  // Simple YAML parser for our known structure (avoids adding yaml dependency)
  const models: ModelConfig[] = []
  const fallbackOrder: LLMProviderName[] = []
  const tierDefaults: Record<string, string> = {}

  const lines = content.split('\n')
  let currentModel: Partial<ModelConfig> | null = null
  let section = '' // 'models', 'fallbackOrder', 'tierDefaults'

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    // Section detection
    if (trimmed === 'models:') { section = 'models'; continue }
    if (trimmed.startsWith('fallbackOrder:')) {
      section = 'fallbackOrder'
      const inline = trimmed.replace('fallbackOrder:', '').trim()
      if (inline.startsWith('[')) {
        const items = inline.slice(1, -1).split(',').map(s => s.trim())
        fallbackOrder.push(...items as LLMProviderName[])
      }
      continue
    }
    if (trimmed === 'tierDefaults:') { section = 'tierDefaults'; continue }

    if (section === 'models') {
      if (trimmed.startsWith('- id:')) {
        if (currentModel?.id) models.push(currentModel as ModelConfig)
        currentModel = { id: trimmed.replace('- id:', '').trim() }
      } else if (currentModel) {
        const match = trimmed.match(/^(\w+):\s*(.+)$/)
        if (match) {
          const [, key, rawVal] = match
          const val = rawVal.trim()
          if (key === 'provider') currentModel.provider = val as LLMProviderName
          else if (key === 'displayName') currentModel.displayName = val
          else if (key === 'inputPricePer1M') currentModel.inputPricePer1M = Number(val)
          else if (key === 'outputPricePer1M') currentModel.outputPricePer1M = Number(val)
          else if (key === 'maxTokens') currentModel.maxTokens = Number(val)
          else if (key === 'supportsBatch') currentModel.supportsBatch = val === 'true'
          else if (key === 'tierDefault') {
            currentModel.tierDefault = val.slice(1, -1).split(',').map(s => s.trim())
          }
        }
      }
    }

    if (section === 'tierDefaults') {
      const match = trimmed.match(/^(\w+):\s*(.+)$/)
      if (match) tierDefaults[match[1]] = match[2].trim()
    }
  }

  if (currentModel?.id) models.push(currentModel as ModelConfig)

  return { models, fallbackOrder, tierDefaults }
}

export function loadModelsConfig(): ModelsConfig {
  if (cachedConfig) return cachedConfig

  const yamlPath = join(import.meta.dir, 'models.yaml')
  const content = readFileSync(yamlPath, 'utf-8')
  cachedConfig = parseYaml(content)
  return cachedConfig
}

export function getModelConfig(modelId: string): ModelConfig | undefined {
  const config = loadModelsConfig()
  return config.models.find(m => m.id === modelId)
}

export function getModelsByProvider(provider: LLMProviderName): ModelConfig[] {
  const config = loadModelsConfig()
  return config.models.filter(m => m.provider === provider)
}

export function getTierDefaultModel(tier: string): string {
  const config = loadModelsConfig()
  return config.tierDefaults[tier] || 'claude-haiku-4-5'
}

export function getFallbackOrder(): LLMProviderName[] {
  const config = loadModelsConfig()
  return config.fallbackOrder
}

/**
 * Get equivalent-tier fallback models from other providers, in fallbackOrder sequence.
 * Groups models by pricing tier: manager-tier (high) vs specialist/worker-tier (low).
 * Returns models from other providers only (excludes same-provider models).
 */
export function getFallbackModels(originalModelId: string): string[] {
  const config = loadModelsConfig()
  const originalModel = config.models.find(m => m.id === originalModelId)
  if (!originalModel) return []

  // Determine tier group: manager-tier if input price >= $1/1M, else worker-tier
  const isManagerTier = originalModel.inputPricePer1M >= 1

  // Get fallback order, skip the original model's provider
  const fallbackProviders = config.fallbackOrder.filter(
    p => p !== originalModel.provider,
  )

  const result: string[] = []
  for (const provider of fallbackProviders) {
    const providerModels = config.models.filter(m => m.provider === provider)
    // Pick the model matching the same tier
    const match = isManagerTier
      ? providerModels.find(m => m.inputPricePer1M >= 1)
      : providerModels.find(m => m.inputPricePer1M < 1)
    if (match) result.push(match.id)
  }

  return result
}

// Reset cache (for testing)
export function resetModelsCache(): void {
  cachedConfig = null
}
