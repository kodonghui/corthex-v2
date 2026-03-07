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

// Reset cache (for testing)
export function resetModelsCache(): void {
  cachedConfig = null
}
