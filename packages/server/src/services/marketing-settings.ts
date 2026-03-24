/**
 * Story 26.1: Marketing Settings & AI Engine Configuration
 * References: FR-MKT1, FR-MKT4, FR-MKT6, AR39, AR41, MKT-1, MKT-3
 *
 * Stores marketing AI engine configuration in company.settings JSONB.
 * API keys encrypted with AES-256-GCM (AR39, MKT-1).
 * Atomic jsonb_set() + WHERE conditional for concurrent updates (AR41).
 */

import { db } from '../db'
import { companies } from '../db/schema'
import { eq, sql } from 'drizzle-orm'
import { encrypt, decrypt } from '../lib/crypto'

// === Engine provider definitions (FR-MKT1) ===

export const MARKETING_ENGINE_PROVIDERS = {
  image: [
    { id: 'flux', name: 'Flux', models: ['flux-1.1-pro', 'flux-dev', 'flux-schnell'] },
    { id: 'dall-e', name: 'DALL-E', models: ['dall-e-3', 'dall-e-2'] },
    { id: 'midjourney', name: 'Midjourney', models: ['v6.1', 'v6', 'v5.2'] },
    { id: 'stable-diffusion', name: 'Stable Diffusion', models: ['sdxl-1.0', 'sd-3.5'] },
  ],
  video: [
    { id: 'runway', name: 'Runway', models: ['gen-3-alpha', 'gen-2'] },
    { id: 'kling', name: 'Kling AI', models: ['kling-v1.5', 'kling-v1'] },
    { id: 'pika', name: 'Pika', models: ['pika-1.5', 'pika-1.0'] },
    { id: 'sora', name: 'Sora', models: ['sora-1.0'] },
  ],
  narration: [
    { id: 'elevenlabs', name: 'ElevenLabs', models: ['eleven_multilingual_v2', 'eleven_turbo_v2'] },
    { id: 'playht', name: 'PlayHT', models: ['playht-2.0', 'playht-1.0'] },
  ],
  subtitles: [
    { id: 'whisper', name: 'Whisper', models: ['whisper-1', 'whisper-large-v3'] },
    { id: 'assemblyai', name: 'AssemblyAI', models: ['best', 'nano'] },
    { id: 'deepgram', name: 'Deepgram', models: ['nova-2', 'nova'] },
  ],
} as const

export type EngineCategory = keyof typeof MARKETING_ENGINE_PROVIDERS

export const ENGINE_CATEGORIES: EngineCategory[] = ['image', 'video', 'narration', 'subtitles']

// === Types ===

export interface EngineSelection {
  provider: string
  model: string
}

export interface MarketingConfig {
  engines: Record<EngineCategory, EngineSelection>
  apiKeys: Record<string, boolean> // provider → hasKey (never expose actual keys)
  watermark: boolean
  updatedAt: string
}

// Internal storage format (with encrypted keys)
interface MarketingConfigInternal {
  engines: Record<string, EngineSelection>
  encryptedApiKeys: Record<string, string> // provider → AES-256 encrypted key
  watermark: boolean
  updatedAt: string
}

// === Default config ===

function getDefaultConfig(): MarketingConfig {
  return {
    engines: {
      image: { provider: 'flux', model: 'flux-1.1-pro' },
      video: { provider: 'runway', model: 'gen-3-alpha' },
      narration: { provider: 'elevenlabs', model: 'eleven_multilingual_v2' },
      subtitles: { provider: 'whisper', model: 'whisper-1' },
    },
    apiKeys: {},
    watermark: true,
    updatedAt: new Date().toISOString(),
  }
}

// === Validation ===

export function validateEngineSelection(category: EngineCategory, provider: string, model: string): boolean {
  const providers = MARKETING_ENGINE_PROVIDERS[category]
  const found = providers.find((p) => p.id === provider)
  if (!found) return false
  return (found.models as readonly string[]).includes(model)
}

// === Service functions ===

/**
 * Get marketing configuration for a company.
 * Returns sanitized config (API keys as boolean flags, never raw values).
 */
export async function getMarketingConfig(companyId: string): Promise<MarketingConfig> {
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company?.settings) return getDefaultConfig()

  const settings = company.settings as Record<string, unknown>
  const marketing = settings.marketing as MarketingConfigInternal | undefined

  if (!marketing) return getDefaultConfig()

  // Convert encrypted keys to boolean flags (never expose actual keys)
  const apiKeyFlags: Record<string, boolean> = {}
  if (marketing.encryptedApiKeys) {
    for (const provider of Object.keys(marketing.encryptedApiKeys)) {
      apiKeyFlags[provider] = true
    }
  }

  return {
    engines: marketing.engines as Record<EngineCategory, EngineSelection>,
    apiKeys: apiKeyFlags,
    watermark: marketing.watermark ?? true,
    updatedAt: marketing.updatedAt ?? new Date().toISOString(),
  }
}

/**
 * Update engine selection for a category.
 * Uses atomic jsonb_set() + WHERE conditional (AR41).
 * Changes take effect from next workflow execution (FR-MKT4).
 */
export async function updateEngineSelection(
  companyId: string,
  category: EngineCategory,
  provider: string,
  model: string,
): Promise<void> {
  if (!validateEngineSelection(category, provider, model)) {
    throw new Error(`Invalid engine selection: ${category}/${provider}/${model}`)
  }

  const engineValue = JSON.stringify({ provider, model })
  const now = new Date().toISOString()

  // Atomic jsonb_set with default initialization (AR41)
  // If marketing doesn't exist yet, initialize it first
  await db.execute(sql`
    UPDATE companies
    SET settings = jsonb_set(
      jsonb_set(
        COALESCE(settings, '{}'::jsonb) ||
        jsonb_build_object(
          'marketing',
          COALESCE(settings->'marketing', '{}'::jsonb) ||
          jsonb_build_object('updatedAt', ${now}::text)
        ),
        '{marketing,engines}',
        COALESCE(settings->'marketing'->'engines', '{}'::jsonb)
      ),
      ${`{marketing,engines,${category}}`}::text[],
      ${engineValue}::jsonb
    ),
    updated_at = NOW()
    WHERE id = ${companyId}
  `)
}

/**
 * Store an API key for a marketing provider (AES-256 encrypted, AR39, MKT-1).
 */
export async function storeApiKey(
  companyId: string,
  provider: string,
  apiKey: string,
): Promise<void> {
  // Validate provider exists in any category
  const allProviders = Object.values(MARKETING_ENGINE_PROVIDERS).flat()
  if (!allProviders.find((p) => p.id === provider)) {
    throw new Error(`Unknown marketing provider: ${provider}`)
  }

  const encryptedKey = await encrypt(apiKey)
  const now = new Date().toISOString()

  // Atomic jsonb_set for encrypted key (AR39, AR41)
  await db.execute(sql`
    UPDATE companies
    SET settings = jsonb_set(
      jsonb_set(
        COALESCE(settings, '{}'::jsonb) ||
        jsonb_build_object(
          'marketing',
          COALESCE(settings->'marketing', '{}'::jsonb) ||
          jsonb_build_object('updatedAt', ${now}::text)
        ),
        '{marketing,encryptedApiKeys}',
        COALESCE(settings->'marketing'->'encryptedApiKeys', '{}'::jsonb)
      ),
      ${`{marketing,encryptedApiKeys,${provider}}`}::text[],
      to_jsonb(${encryptedKey}::text)
    ),
    updated_at = NOW()
    WHERE id = ${companyId}
  `)
}

/**
 * Delete an API key for a marketing provider.
 */
export async function deleteApiKey(
  companyId: string,
  provider: string,
): Promise<void> {
  // Validate provider exists (consistent with storeApiKey)
  const allProviders = Object.values(MARKETING_ENGINE_PROVIDERS).flat()
  if (!allProviders.find((p) => p.id === provider)) {
    throw new Error(`Unknown marketing provider: ${provider}`)
  }

  await db.execute(sql`
    UPDATE companies
    SET settings = settings #- ${`{marketing,encryptedApiKeys,${provider}}`}::text[],
    updated_at = NOW()
    WHERE id = ${companyId}
    AND settings->'marketing'->'encryptedApiKeys' ? ${provider}
  `)
}

/**
 * Get decrypted API key for a provider (used by engine at execution time, MKT-3).
 */
export async function getDecryptedApiKey(
  companyId: string,
  provider: string,
): Promise<string | null> {
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company?.settings) return null

  const settings = company.settings as Record<string, unknown>
  const marketing = settings.marketing as MarketingConfigInternal | undefined
  if (!marketing?.encryptedApiKeys?.[provider]) return null

  try {
    return await decrypt(marketing.encryptedApiKeys[provider])
  } catch {
    return null
  }
}

/**
 * Update copyright watermark toggle (FR-MKT6).
 */
export async function updateWatermark(
  companyId: string,
  enabled: boolean,
): Promise<void> {
  const now = new Date().toISOString()

  await db.execute(sql`
    UPDATE companies
    SET settings = jsonb_set(
      jsonb_set(
        COALESCE(settings, '{}'::jsonb) ||
        jsonb_build_object(
          'marketing',
          COALESCE(settings->'marketing', '{}'::jsonb) ||
          jsonb_build_object('updatedAt', ${now}::text)
        ),
        '{marketing,watermark}',
        ${enabled}::jsonb
      ),
      '{marketing,updatedAt}',
      to_jsonb(${now}::text)
    ),
    updated_at = NOW()
    WHERE id = ${companyId}
  `)
}
