/**
 * Tool Cache TTL 설정 (Story 15.2)
 *
 * FR-CACHE-2.5: 도구별 TTL 정의
 * getCacheRecommendation(): Story 15.3 Admin UX enableSemanticCache 토글 연동 예정
 */

// 도구별 TTL (ms) — 0 = 캐싱 없음
export const TOOL_TTL_MS: Record<string, number> = {
  kr_stock: 60_000,         // 1분
  search_news: 900_000,     // 15분
  search_web: 1_800_000,    // 30분
  dart_api: 3_600_000,      // 1시간
  law_search: 86_400_000,   // 24시간
  get_current_time: 0,      // 캐싱 없음
  generate_image: 0,        // 캐싱 없음
}

/**
 * 도구 이름으로 TTL 조회
 * 미등록 도구 기본값: 0 (캐싱 없음)
 */
export function getToolTtl(toolName: string): number {
  return TOOL_TTL_MS[toolName] ?? 0
}

/**
 * Admin UX 연동 (Story 15.3): enableSemanticCache 토글의 추천 표시에 활용
 * - 'none': TTL=0 (캐싱 없음)
 * - 'warning': TTL <= 15분 (짧은 TTL, 주의 필요)
 * - 'ok': TTL > 15분 (안전한 캐싱)
 */
export function getCacheRecommendation(toolName: string): 'none' | 'warning' | 'ok' {
  const ttl = getToolTtl(toolName)
  if (ttl === 0) return 'none'
  if (ttl <= 900_000) return 'warning'
  return 'ok'
}
