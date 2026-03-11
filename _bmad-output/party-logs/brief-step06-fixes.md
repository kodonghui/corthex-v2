# [Writer Fix Summary] step-06: Final Review + Completion

**Date:** 2026-03-11
**File:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` (전체)
**Total fixes applied:** 8 (2 HIGH, 3 MEDIUM, 3 LOW)

---

## Fixes Applied

| # | Severity | Source | Issue | Fix Applied |
|---|----------|--------|-------|-------------|
| 1 | **HIGH** | Critic-A | `engine-boundary-check.sh` 미정의 — MVP Done 기준 측정 불가. 스크립트 존재/내용/생성 책임 없음. | MVP Done 표에서 `engine-boundary-check.sh` 제거 → grep 명령어 직접 실행으로 대체. Implementation Notes에 grep 스크립트 명시. |
| 2 | **HIGH** | Critic-A | `packages/admin` TypeScript 검증 누락 — Story 15.3이 admin UI 수정하는데 MVP Done 빌드 기준은 server만 커버. | MVP Done 표에 "Story 15.3 Admin 빌드 통과 ∣ npx tsc --noEmit -p packages/admin/tsconfig.json ∣ 에러 0건" 행 추가. 공통 주의사항에 packages/admin 검증 필수 명시. |
| 3 | **MEDIUM** | Critic-A | Executive Summary `$5~8/월`만 제시 — 3레이어 복합 목표 `$2~4/월` 누락. 의사결정권자가 15.1만으로 충분하다고 오해 가능. | Line 34: "Prompt Cache(15.1) 단독: $5~8/월 / 3레이어 완전 적용 안정기: $2~4/월" 분리 표기. |
| 4 | **MEDIUM** | Critic-B | Story 15.1 PoC 코드가 `await query()` 직접 사용 — 실제 SDK는 AsyncIterator. `result.usage` 접근 불가로 런타임 오류. | PoC 스니펫을 `for await (const event of query(...))` 패턴으로 교체. `event.usage.cacheReadInputTokens` 수집 방법 명시. |
| 5 | **MEDIUM** | Critic-B | `ivfflat` 인덱스 → Epic 10 실제 구현은 `hnsw (vector_cosine_ops)` (`0049_pgvector-extension.sql:10-11`). ivfflat + 기본 operator class로는 cosine 쿼리 인덱스 미활용. | Story 15.3: `ivfflat` → `hnsw (vector_cosine_ops)` 수정. Implementation Notes에 인덱스 생성 SQL 스니펫 추가. |
| 6 | **LOW** | Critic-A | Story 15.1 "agent-loop.ts 단 1곳 수정" → 실제 engine/types.ts도 수정 필요 (Stop Hook E2 타입 확장). | "수정 파일 2개: engine/agent-loop.ts + engine/types.ts" 로 변경. |
| 7 | **LOW** | Critic-B | withCache 스니펫에 cache.set() 저장 코드 누락 — 캐시 miss 후 결과를 저장하는 핵심 코드 없음. | `const result = await fn(params, ctx)` + `cache.set(key, { data: result, ... })` + `return result` 추가. Phase 4 Redis 전환 대비 cacheStore 어댑터 패턴 주석 추가. |
| 8 | **LOW** | Critic-A | Phase 4 "withCache API 유지, 구현체만 교체" 약속 vs 현재 Map 직접 사용 코드 — 추상 어댑터 없음. | withCache 스니펫에 `cacheStore = { get, set, delete }` 분리 권장 주석 추가. (Fix #7과 통합) |

---

## 수정 후 파일 상태

- 수치 일관성: 85%/768/70%/60→80% 전 섹션 일치 유지
- MVP Done 기준: 12개 (engine-boundary-check.sh → grep 명령어 대체 + admin tsconfig 추가)
- Executive Summary: 단독($5~8/월) vs 3레이어 복합($2~4/월) 분리 명시
- PoC 코드: for await AsyncIterator 패턴 (실제 SDK 동작 방식)
- 인덱스: hnsw (vector_cosine_ops) — Epic 10 패턴 일치
