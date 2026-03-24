/**
 * Memory Settings — companies.settings.memory 설정 관리
 * 회사별 메모리 시스템 설정 조회/변경 (Story 28.9)
 */

import { db } from '../db'
import { companies } from '../db/schema'
import { eq } from 'drizzle-orm'

export interface MemorySettings {
  reflectedTtlDays: number
  unreflectedTtlDays: number
  minObservationsForReflection: number
  minAvgConfidence: number
  maxDailyCostUsd: number
  memoryDecayDays: number
  enabled: boolean
}

const DEFAULTS: MemorySettings = {
  reflectedTtlDays: 30,
  unreflectedTtlDays: 90,
  minObservationsForReflection: 20,
  minAvgConfidence: 0.7,
  maxDailyCostUsd: 0.10,
  memoryDecayDays: 60,
  enabled: true,
}

export function getDefaultMemorySettings(): MemorySettings {
  return { ...DEFAULTS }
}

export async function getMemorySettings(companyId: string): Promise<MemorySettings> {
  try {
    const [company] = await db
      .select({ settings: companies.settings })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1)

    if (!company?.settings) return { ...DEFAULTS }

    const settings = company.settings as Record<string, unknown>
    const mem = settings.memory as Partial<MemorySettings> | undefined

    if (!mem || typeof mem !== 'object') return { ...DEFAULTS }

    return {
      reflectedTtlDays: typeof mem.reflectedTtlDays === 'number' ? mem.reflectedTtlDays : DEFAULTS.reflectedTtlDays,
      unreflectedTtlDays: typeof mem.unreflectedTtlDays === 'number' ? mem.unreflectedTtlDays : DEFAULTS.unreflectedTtlDays,
      minObservationsForReflection: typeof mem.minObservationsForReflection === 'number' ? mem.minObservationsForReflection : DEFAULTS.minObservationsForReflection,
      minAvgConfidence: typeof mem.minAvgConfidence === 'number' ? mem.minAvgConfidence : DEFAULTS.minAvgConfidence,
      maxDailyCostUsd: typeof mem.maxDailyCostUsd === 'number' ? mem.maxDailyCostUsd : DEFAULTS.maxDailyCostUsd,
      memoryDecayDays: typeof mem.memoryDecayDays === 'number' ? mem.memoryDecayDays : DEFAULTS.memoryDecayDays,
      enabled: typeof mem.enabled === 'boolean' ? mem.enabled : DEFAULTS.enabled,
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export async function saveMemorySettings(companyId: string, update: Partial<MemorySettings>): Promise<MemorySettings> {
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company) {
    throw new Error('Company not found')
  }

  const existingSettings = (company.settings ?? {}) as Record<string, unknown>
  const current = await getMemorySettings(companyId)
  const merged: MemorySettings = { ...current, ...update }

  await db
    .update(companies)
    .set({
      settings: { ...existingSettings, memory: merged },
    })
    .where(eq(companies.id, companyId))

  return merged
}
