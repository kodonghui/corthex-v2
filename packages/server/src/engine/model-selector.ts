/**
 * E6: Tier → Model 매핑 — engine 내부 전용 (E8)
 *
 * Phase 1~4: Claude 전용. llm-router.ts 동결 (라우팅 로직 추가 금지).
 * Phase 3+ tier_configs 테이블 생성 후 DB 조회로 전환 예정 (Story 8.1).
 */

const DEFAULT_MODEL = 'claude-haiku-4-5'

const TIER_MODEL_MAP: Record<string, string> = {
  manager: 'claude-sonnet-4-6',
  specialist: 'claude-sonnet-4-6',
  worker: 'claude-haiku-4-5',
}

export function selectModel(tier: string): string {
  return TIER_MODEL_MAP[tier] || DEFAULT_MODEL
}
