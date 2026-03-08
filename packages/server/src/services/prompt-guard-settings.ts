/**
 * Prompt Guard Settings -- companies.settings.promptGuard 설정 관리
 * 회사별 프롬프트 가드 설정 조회/변경
 */

import { db } from '../db'
import { companies } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { SensitivityLevel } from './prompt-guard'

export interface PromptGuardSettings {
  enabled: boolean
  sensitivityLevel: SensitivityLevel
  customWhitelist: string[]
}

const DEFAULT_SETTINGS: PromptGuardSettings = {
  enabled: true,
  sensitivityLevel: 'moderate',
  customWhitelist: [],
}

/**
 * Get prompt guard settings for a company.
 * Falls back to defaults if not configured.
 */
export async function getPromptGuardSettings(companyId: string): Promise<PromptGuardSettings> {
  try {
    const [company] = await db
      .select({ settings: companies.settings })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1)

    if (!company?.settings) return { ...DEFAULT_SETTINGS }

    const settings = company.settings as Record<string, unknown>
    const pg = settings.promptGuard as Partial<PromptGuardSettings> | undefined

    if (!pg) return { ...DEFAULT_SETTINGS }

    return {
      enabled: typeof pg.enabled === 'boolean' ? pg.enabled : DEFAULT_SETTINGS.enabled,
      sensitivityLevel: isValidSensitivity(pg.sensitivityLevel)
        ? pg.sensitivityLevel
        : DEFAULT_SETTINGS.sensitivityLevel,
      customWhitelist: Array.isArray(pg.customWhitelist)
        ? pg.customWhitelist.filter((s): s is string => typeof s === 'string')
        : DEFAULT_SETTINGS.customWhitelist,
    }
  } catch {
    // On DB error, use defaults (don't block requests)
    return { ...DEFAULT_SETTINGS }
  }
}

/**
 * Save prompt guard settings for a company.
 * Merges into existing settings JSONB.
 */
export async function savePromptGuardSettings(
  companyId: string,
  update: Partial<PromptGuardSettings>,
): Promise<PromptGuardSettings> {
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company) {
    throw new Error('Company not found')
  }

  const existingSettings = (company.settings ?? {}) as Record<string, unknown>
  const currentPg = (existingSettings.promptGuard ?? {}) as Partial<PromptGuardSettings>

  const merged: PromptGuardSettings = {
    enabled: typeof update.enabled === 'boolean' ? update.enabled : (currentPg.enabled ?? DEFAULT_SETTINGS.enabled),
    sensitivityLevel: update.sensitivityLevel && isValidSensitivity(update.sensitivityLevel)
      ? update.sensitivityLevel
      : (currentPg.sensitivityLevel && isValidSensitivity(currentPg.sensitivityLevel)
        ? currentPg.sensitivityLevel
        : DEFAULT_SETTINGS.sensitivityLevel),
    customWhitelist: Array.isArray(update.customWhitelist)
      ? update.customWhitelist.filter((s): s is string => typeof s === 'string')
      : (Array.isArray(currentPg.customWhitelist)
        ? currentPg.customWhitelist.filter((s): s is string => typeof s === 'string')
        : DEFAULT_SETTINGS.customWhitelist),
  }

  await db
    .update(companies)
    .set({
      settings: { ...existingSettings, promptGuard: merged },
    })
    .where(eq(companies.id, companyId))

  return merged
}

function isValidSensitivity(val: unknown): val is SensitivityLevel {
  return val === 'strict' || val === 'moderate' || val === 'permissive'
}
