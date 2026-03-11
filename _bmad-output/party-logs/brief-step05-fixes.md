# [Writer Fix Summary] step-05: MVP Scope + Future Vision

**Date:** 2026-03-11
**File:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` lines 308-400
**Total fixes applied:** 10 (1 CRITICAL→fixed, 3 HIGH, 3 MEDIUM, 3 LOW)

---

## Fixes Applied

| # | Severity | Source | Issue | Fix Applied |
|---|----------|--------|-------|-------------|
| 1 | **CRITICAL** | Both critics | `VECTOR(1536)` — Gemini text-embedding-004 실제 차원은 768 (`schema.ts:1555`). 1536은 OpenAI ada-002 차원값. pgvector 타입 오류로 Story 15.3 즉시 실패. | `query_embedding VECTOR(768)` 수정. 주석 추가: "Gemini text-embedding-004 실제 차원, `schema.ts:1555` 확인" |
| 2 | **HIGH** | Both critics | 7개 외 100+ 도구 캐시 기본 정책 미명시 — "미적용 = 캐시 없음"인지 불명확. 신규 도구 추가 시마다 반복 질문 예상. | Story 15.2에 도구 캐시 기본 정책 추가: "withCache() 미래퍼 = 캐시 없음 (기존 동작 유지). 신규 도구는 `lib/tool-cache-config.ts` TTL 등록 테이블에 수동 명시 필요." |
| 3 | **HIGH** | Both critics | Out of Scope #9 "에이전트 간 공유 (별도 설계 필요)" — 미래 기능처럼 기술됐으나 현재 구현이 이미 companyId 내 공유 상태. agent_id 컬럼 없음. | Out of Scope 항목을 "현재 구현: 동일 companyId 에이전트 간 공유됨 (agent_id 없음, 의도적 설계). 에이전트별 격리는 Phase X에서 agent_id 컬럼 추가." 로 명시적 수정 |
| 4 | **HIGH** | Both critics | MVP Done 기준에 KPI-2 (Soul 비용 절감율 ≥ 60%) 누락. Epic 핵심 비즈니스 목표 달성 검증 없음. | MVP Success Criteria 표에 KPI-2 행 추가: "cost_tracker 로그 1주 집계 ∣ 실효 절감율 ≥ 60%" |
| 5 | **MEDIUM** | Critic-B | `getDB()` 프록시에 vector search 메서드 없음 (E3에 `findSemanticCache`, `insertSemanticCache` 미정의). `engine/semantic-cache.ts`가 호출할 메서드가 없음. | Story 15.3에 "`db/scoped-query.ts` 확장: `findSemanticCache()` + `insertSemanticCache()` 추가 (E3 패턴 준수)" 명시 |
| 6 | **MEDIUM** | Critic-B | Story 15.3 영향 패키지 미명시 (packages/admin) + DB migration 2개 원자성 미명시. | DB 마이그레이션 "단일 파일, 2개 변경 원자적 적용" 명시. **영향 패키지** 항목 추가: `packages/server` + `packages/admin` (enableSemanticCache toggle UI). |
| 7 | **MEDIUM** | Critic-B | 캐시 레이어 예외 vs 외부 API 장애 구분 없음. semantic-cache.ts 예외 전파 시 에이전트 세션 전체 중단 위험. Out of Scope "stale-on-error" 설명 부실. | Story 15.3에 캐시 레이어 try/catch graceful fallback 필수 명시. Out of Scope stale-on-error를 "(A) 외부 API 장애→에러 전파 / (B) 캐시 레이어 예외→try/catch fallback 필수"로 분리. |
| 8 | **LOW** | Critic-B | `checkSemanticCache` TTL WHERE 절 미명시 → 만료 항목이 히트될 위험. cleanup 정책 미명시. | Story 15.3에 "cosine similarity ≥ 0.95 AND created_at > NOW() - ttl_hours * INTERVAL '1 hour'" 조건 명시. |
| 9 | **LOW** | Both critics | Phase 6 "LLM 모델 교체 시 무효화" — LLM 교체(Claude Sonnet→Opus)는 임베딩 공간에 영향 없음. 임베딩 모델 교체와 혼용. | "임베딩 모델(현재: Gemini text-embedding-004) 교체 시 자동 무효화"로 수정. LLM 교체와 구분 명시. |
| 10 | **LOW** | Both critics | Phase 4 Redis 트리거 "에이전트 50명+" — 단일 서버에서는 에이전트 50명+에서도 인메모리 Map 유지 가능. 트리거 조건이 에이전트 수가 아닌 다중 서버 배포임. | Phase 4 트리거를 "다중 서버 배포 시 (에이전트 수 무관)"으로 수정. "단일 서버에서는 100MB 한도 내 인메모리 Map 유지" 명시. |

---

## 수정 후 파일 상태

- **Lines:** 308-400 (기존 308-392에서 8줄 증가)
- **VECTOR 차원:** 1536 → 768 (Gemini text-embedding-004 실제값)
- **의도적 설계 명시:** companyId 내 에이전트 간 Semantic Cache 공유 = 의도적 설계
- **KPI 완성:** MVP Done 기준에 KPI-1, KPI-2, KPI-3 전부 포함
- **캐시 예외 처리:** try/catch graceful fallback 필수 명시 (서비스 중단 방지)
