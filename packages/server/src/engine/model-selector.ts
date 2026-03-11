/**
 * E6: Tier → Model 매핑 — engine 내부 전용 (E8)
 *
 * Phase 1~4: Claude 전용. llm-router.ts 동결 (라우팅 로직 추가 금지).
 * Story 8.1: tier_configs DB 조회 경로 추가 + 기존 string 하위 호환.
 */

import { getDB } from '../db/scoped-query'

const DEFAULT_MODEL = 'claude-haiku-4-5'

/** Hardcoded fallback for legacy string tier values */
const TIER_MODEL_MAP: Record<string, string> = {
  manager: 'claude-sonnet-4-6',
  specialist: 'claude-sonnet-4-6',
  worker: 'claude-haiku-4-5',
}

/** Hardcoded fallback for integer tier levels */
const TIER_LEVEL_MODEL_MAP: Record<number, string> = {
  1: 'claude-sonnet-4-6',    // Manager
  2: 'claude-sonnet-4-6',    // Specialist
  3: 'claude-haiku-4-5',     // Worker
}

/**
 * Synchronous model selection — uses hardcoded maps (backward compatible).
 * Accepts both string tier ('manager') and integer tierLevel (1).
 */
export function selectModel(tier: string | number): string {
  if (typeof tier === 'number') {
    return TIER_LEVEL_MODEL_MAP[tier] || DEFAULT_MODEL
  }
  return TIER_MODEL_MAP[tier] || DEFAULT_MODEL
}

/**
 * Async model selection — queries tier_configs DB for company-specific mapping.
 * Falls back to hardcoded map if no tier_configs found.
 */
export async function selectModelFromDB(tierLevel: number, companyId: string): Promise<string> {
  try {
    const rows = await getDB(companyId).tierConfigByLevel(tierLevel)
    if (rows.length > 0 && rows[0].modelPreference) {
      return rows[0].modelPreference
    }
  } catch {
    // DB unavailable — fall through to hardcoded
  }
  return TIER_LEVEL_MODEL_MAP[tierLevel] || DEFAULT_MODEL
}
