# [Writer Fix Summary] step-03: Target Users + Personas

**Date:** 2026-03-11
**File:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` lines 145-230
**Total fixes applied:** 8 (1 CRITICAL, 4 HIGH, 3 MEDIUM)

---

## Fixes Applied

| # | Severity | Source | Issue | Fix Applied |
|---|----------|--------|-------|-------------|
| 1 | **CRITICAL** | Both critics | 이주임 여정 주가 예시 → step-02 정책 위반 (enableSemanticCache=false인 kr_stock 에이전트를 Semantic Cache 예시로 사용) + TTL 수학 오류 (10:00 저장 1h TTL → 14:00 히트 불가) | 이주임 "현재 고통" + "Epic 15 이후 경험" + User Journey 표 전체를 FAQ 쿼리로 교체: "출장비 처리 규정이 어떻게 돼?" → 저장 / "출장비 신청 방법 알려줘" → 히트 (TTL 24시간). TTL 수학 수정: 9:00 저장 → 9:45 히트 |
| 2 | **HIGH** | Both critics | Line 204 "90% 절감" → step-02 확정 수치(85%)와 불일치 | "비용 85% 절감"으로 수정 |
| 3 | **HIGH** | Both critics | Persona 3 stale-on-error fallback — architecture.md에 없는 미설계 기능 | "장애 시 fallback은 설계 범위 외 — 미설계 기능"으로 명시적 수정 |
| 4 | **HIGH** | Both critics | ⚡ 배지 결정 미확정 — "배지 없어도 체감으로 충분" 근거 불충분 (FAQ TTL 24h는 구버전 데이터 위험) | "Hub UI 캐시 표시 방식은 UX 설계 단계에서 별도 결정 예정 (MVP에서는 미구현)"으로 수정 |
| 5 | **HIGH** | Critic-A | `cache_read_cost` admin 필드 — admin UI에 미노출 상태인데 김운영 성공 여정에서 "admin 로그 확인"으로 기술 | `cost_tracker` Hook 서버 로그에서 확인 (admin UI 미노출 — 서버 로그 직접 조회 또는 Anthropic 대시보드)로 수정 |
| 6 | **MEDIUM** | Critic-B | Persona 4 enableSemanticCache 구현 가이드 누락 | `agents` 테이블 `enable_semantic_cache BOOLEAN DEFAULT FALSE` 컬럼, Admin 콘솔 토글, 기본값 false (opt-in 방식) 요구사항 추가 |
| 7 | **MEDIUM** | Critic-B | Tool Cache 히트율 로깅 scope 미명시 — 김운영 성공 기준이 측정 불가능 | `log.info({ event: 'tool_cache_hit', toolName, companyId })` Story 15.2 scope 포함 명시 |
| 8 | **MEDIUM** | Critic-B | 개발자 여정 Story 15.1만 커버 | Story 15.2 (withCache 래퍼 + 로깅), 15.3 (DB 마이그레이션 + semantic-cache.ts + enableSemanticCache 토글 + E8 검증) 여정 추가 |

---

## 수정 후 파일 상태

- **Lines:** 145-230 (기존 145-224에서 6줄 증가)
- **주요 교체:** 이주임 여정 전체 — 주가(kr_stock) 예시 → 출장비 처리 규정 FAQ 예시
- **개발자 여정:** 3행 → 8행 (15.1~15.3 전부 커버)
- **step-02 정책 일관성:** enableSemanticCache=false 에이전트(실시간 데이터)가 Semantic Cache 예시에서 완전 제거
