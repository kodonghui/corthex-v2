# CRITIC-A Review: Epics & Stories (Epic 15 — 3-Layer Caching)

**Reviewer:** CRITIC-A (John/PM, Sally/UX, Mary/BA)
**Files reviewed:**
- `_bmad-output/planning-artifacts/epic-15-epics-and-stories.md`
- `_bmad-output/implementation-artifacts/stories/15-1-prompt-caching.md`
- `_bmad-output/implementation-artifacts/stories/15-2-tool-result-caching.md`
- `_bmad-output/implementation-artifacts/stories/15-3-semantic-caching.md`
**Date:** 2026-03-12

---

## Issue 1 (Mary/BA — HIGH): FR-CACHE-3.10 미반영 — `semantic_cache_miss` 로그에 `similarity:bestSimilarity` 누락

**파일:** `15-3-semantic-caching.md`

**문제:** FR-CACHE-3.10:
> "미스 시 `log.info({ event:'semantic_cache_miss', companyId, agentId, similarity:bestSimilarity })`를 기록하여 KPI-4 히트율(`hit/(hit+miss)`) 측정을 가능하게 한다"

그런데 Task 4 코드 스니펫 (line 129):
```typescript
log.info({ event:'semantic_cache_miss', companyId, agentId })
// ↑ similarity:bestSimilarity 누락
```

`similarity:bestSimilarity` 없이는 KPI-4 히트율 측정은 가능하지만, 0.95 임계값 튜닝이 불가 (예: 미스가 similarity 0.93이면 임계값을 낮춰야 하는지 알 수 없음).

**근본 원인:** Task 2의 `findSemanticCache()` 반환 타입이 `Promise<string | null>` — 히트 시 캐시 텍스트만 반환, best similarity 값은 소실.

**수정 방향:**
1. Task 2 `findSemanticCache()` 반환 타입 변경:
   ```typescript
   findSemanticCache(embedding, threshold): Promise<{ response: string; similarity: number } | null>
   ```
   또는 미스 시 best similarity만 반환하는 별도 반환 구조:
   ```typescript
   // 히트: { response, similarity }, 미스: null (DB 쿼리에서 best similarity도 함께 반환)
   ```
2. Task 3 `checkSemanticCache()` 반환 타입도 동일하게 업데이트:
   ```typescript
   checkSemanticCache(companyId, query): Promise<{ response: string; similarity: number } | null>
   ```
3. Task 4 miss log 수정:
   ```typescript
   log.info({ event:'semantic_cache_miss', companyId, agentId, similarity: result?.similarity ?? 0 })
   ```

---

## Issue 2 (John/PM — HIGH): Story 15.1 경로 B (`messages.create()`) 선택 시 Hook 파이프라인 단절 위험

**파일:** `15-1-prompt-caching.md`

**문제:** Task 3B (line 81):
> "기존 SDK query() 응답 형식 유지 — messages.create() 응답을 Hook 파이프라인 입력 형식으로 변환"

현재 Hook 파이프라인(D4)은 SDK `query()`가 자동으로 PreToolUse/PostToolUse/Stop Hook을 발화한다. `anthropic.messages.create()` 직접 호출로 전환하면:
- `tool-permission-guard` (PreToolUse) 미발화 → 비허용 도구 차단 불가 (보안 구멍)
- `credential-scrubber` (PostToolUse) 미발화 → 도구 출력 마스킹 없음
- `cost-tracker` (Stop Hook) 미발화 → 토큰 비용 추적 불가

"Hook 파이프라인 입력 형식으로 변환"이라는 설명만으로는 구현자가 이 문제를 해결할 방법을 알 수 없다. 경로 B를 선택하면 SDK agent loop 전체를 수동 구현해야 할 수 있어 Story 15.1 스코프를 크게 초과한다.

**수정 방향:** Task 3B Dev Notes 또는 Task에 다음 명시 필요:
> "경로 B 선택 시, SDK `query()`를 완전히 대체하는 것이 아닌 내부 API 호출만 `messages.create()`로 전환하는 shim 구조가 필요하다 — SDK의 Hook 발화 메커니즘을 유지하면서 system 파라미터만 ContentBlock[]으로 교체 가능한지 확인. 불가능하면 경로 B는 실현 불가 (Epic 15 범위 초과) → PoC에서 반드시 경로 A 검증 성공이 필요."

또는 Task 1 PoC 성공 조건을 강화:
> "PoC 실패 + 경로 B 불가 → 팀 리드와 스코프 재협의 (messages.create() 전환은 Hook 파이프라인 재구현을 수반함)"

---

## Issue 3 (John/PM — HIGH): Story 15.3 Task 4 `yieldCachedResponse()` 미정의

**파일:** `15-3-semantic-caching.md`

**문제:** Task 4 코드 스니펫 (line 127):
```typescript
return yieldCachedResponse(cached)
```

이 함수가 Story 어디에도 정의되지 않음. 캐시 히트 시 agent-loop.ts에서 SSE 이벤트를 어떻게 방출하는지 불명확:
- `accepted` → `processing` → `message`(cached) → `done`(costUsd: 0) 순서는 Task 4 주석에 있으나
- 실제로 이 SSE 이벤트들을 어떻게 방출하는지 (현재 agent-loop.ts의 SSE 방출 패턴 재사용인지, 별도 함수인지)
- `done` 이벤트의 costUsd: 0이 기존 cost-tracker Hook과 어떻게 연동되는지

구현자가 이 함수를 처음부터 설계해야 하므로 예상치 못한 시간 소요 발생 가능.

**수정 방향:** Task 4에 `yieldCachedResponse()` 구현 가이드 추가:
```
[ ] yieldCachedResponse(response: string): void 구현
  - 현재 agent-loop.ts의 SSE 방출 패턴 참조 (sendSSEEvent() 또는 동등 함수)
  - 방출 순서: emit('accepted') → emit('processing', '캐시 응답 준비 중') → emit('message', response) → emit('done', { costUsd: 0, cacheHit: true })
  - cost-tracker Stop Hook에 costUsd: 0 전달 (캐시 히트 = LLM 미호출)
  - 기존 agent-loop.ts의 SSE 방출 코드 위치 확인 (git ls-files로 경로 확인)
```

---

## Issue 4 (Mary/BA — MEDIUM): Story 15.3 → Story 15.2 소프트 의존성 의존성 다이어그램 미반영

**파일:** `epic-15-epics-and-stories.md`, `15-3-semantic-caching.md`

**문제:** Epic 개요 의존성 다이어그램:
```
15.1 → 15.3 (블로킹)
15.2 — 독립
```

그런데 Story 15.3 Task 5 (Admin UI, line 156):
> "Story 15.2의 `getCacheRecommendation()` 활용"

Admin UI의 캐시 적합성 추천 표시가 Story 15.2의 `lib/tool-cache-config.ts`에서 export하는 `getCacheRecommendation()` 함수에 의존. 15.2 미완료 시 Task 5를 구현할 수 없음.

**수정 방향:** 의존성 다이어그램 업데이트:
```
15.1 → 15.3 (블로킹 — 전체)
15.2 → 15.3 Task 5 (소프트 의존성 — Admin UI 추천 표시)
15.2 — 15.1과 독립 (병렬 개발 가능)
```
Story 15.3 Dev Notes에도 추가: "Task 5는 15.2의 `getCacheRecommendation()` 함수가 존재해야 함. 15.2 미완료 시 Task 5에서 함수 스텁 또는 하드코딩 임시 처리 후 15.2 완료 후 연동."

---

## Issue 5 (Sally/UX — MEDIUM): Story 15.3 ON→OFF 확인 모달 제목 UX 스펙 불일치

**파일:** `15-3-semantic-caching.md`

**문제:** Task 5 (line 153):
> `제목: "Semantic Cache 비활성화"`

그런데 UX 스펙 (`epic-15-ux-design.md` line 137):
> `응답 캐싱을 비활성화하시겠습니까?`

"Semantic Cache"라는 기술 용어를 Admin(김운영) 페르소나에 노출하는 것은 UX 결정에서 일반 사용자 친화적 언어("응답 캐싱")를 사용하기로 한 결정과 불일치.

**수정 방향:** 모달 제목 수정:
```
제목: "응답 캐싱을 비활성화하시겠습니까?"
```

---

## Issue 6 (Mary/BA — MEDIUM): CREDENTIAL_PATTERNS 공유 방법 미결정

**파일:** `15-3-semantic-caching.md`

**문제:** Task 3 Dev Notes (line 203):
> "`CREDENTIAL_PATTERNS`: credential-scrubber Hook과 동일 패턴 소스 (import 또는 복사) 확인 필요"
> "engine/semantic-cache.ts에서 import 또는 lib/ 레이어로 이동 후 공유"

구현자가 "import" vs "lib/ 이동" 중 어느 것을 선택할지 결정해야 함. E8 경계 내에서 engine/semantic-cache.ts가 engine/hooks/credential-scrubber.ts를 import할 수 있는지가 결정되지 않은 상태.

**E8 규칙 관련 맥락**: CLAUDE.md: "engine/ public API: agent-loop.ts + types.ts only. No imports from hooks/, soul-renderer, etc." — 이 규칙이 외부 코드의 engine/ 접근 규제인지, engine/ 내부 모듈 간 접근도 규제하는지 불명확.

**수정 방향:** Dev Notes에 명확한 결정 추가:
> "`CREDENTIAL_PATTERNS` 공유: `engine/hooks/credential-scrubber.ts`의 상수를 `packages/server/src/lib/credential-patterns.ts`로 추출하여 공유. credential-scrubber.ts와 engine/semantic-cache.ts 양쪽에서 lib/credential-patterns.ts를 import. engine/ 내부 모듈 간 직접 import 불필요 — E8 경계 명확성 유지."

---

## Issue 7 (Sally/UX — LOW): Story 15.2 Dev Notes 오타

**파일:** `15-2-tool-result-caching.md`, Dev Notes line 104

`meomory 계산` → `memory 계산` 오타

---

## 긍정 검증 항목

| 항목 | 파일 | 결과 |
|------|------|------|
| D17 PoC 결정 트리 전체 반영 (성공/실패 경로) | 15-1 Context | ✅ |
| D18 E8 외부 `lib/` 배치 + Phase 4 Redis CacheStore 인터페이스 | 15-2 Context | ✅ |
| D19 E8 내부 + agent-loop.ts 전용 | 15-3 Context | ✅ |
| D20 Tool Cache key `Object.entries().sort()` | 15-2 Task 1 | ✅ |
| D20 callee-side CREDENTIAL_PATTERNS 마스킹 명시 | 15-3 Task 3 | ✅ |
| D21 Redis 전환 Phase 4 Deferred | 15-2 Dev Notes | ✅ |
| NFR-CACHE-R1/R2/R3/R4 graceful fallback AC 전부 포함 | 15-1 AC#7, 15-2 AC#5, 15-3 AC#5 | ✅ |
| FR/NFR 커버리지 매핑 테이블 완전성 | Epic 개요 | ✅ |
| 에이전트 간 캐시 공유 (agent_id 컬럼 없음, FR-CACHE-3.11 의도적 설계) | 15-3 Context+DevNotes | ✅ |
| 의존성 다이어그램 (15.1→15.3, 15.2 독립) 기본 구조 | Epic 개요 | ✅ (Issue 4로 보완 필요) |
| DB 마이그레이션 Task 1 선행 순서 | 15-3 Tasks | ✅ |
| 300ms 스피너 base spec 오버라이드 명시 | 15-3 Context+Task 6 | ✅ |
| CI engine-boundary-check.sh 업데이트 Task | 15-3 Task 7 | ✅ |
| ARGOS 만료 정리 크론 Task | 15-3 Task 8 | ✅ |
| tsc --noEmit 검증 Task 포함 (전 스토리) | 15-1/2/3 | ✅ |

---

## 요약

| # | 파일 | 심각도 | 이슈 |
|---|------|--------|------|
| 1 | 15-3 Task 2/3/4 | HIGH | FR-CACHE-3.10 미반영 — miss 로그 `similarity:bestSimilarity` 누락, findSemanticCache() 반환 타입 수정 필요 |
| 2 | 15-1 Task 3B | HIGH | 경로 B 선택 시 Hook 파이프라인 단절 — messages.create() 전환의 Hook 동작 방법 미명시 |
| 3 | 15-3 Task 4 | HIGH | `yieldCachedResponse()` 미정의 — 캐시 히트 SSE 방출 방식 불명확 |
| 4 | Epic 개요, 15-3 | MEDIUM | 15.3→15.2 소프트 의존성 (`getCacheRecommendation()`) 다이어그램 미반영 |
| 5 | 15-3 Task 5 | MEDIUM | ON→OFF 모달 제목 "Semantic Cache 비활성화" — UX 스펙 "응답 캐싱을 비활성화하시겠습니까?" 불일치 |
| 6 | 15-3 Dev Notes | MEDIUM | CREDENTIAL_PATTERNS 공유 방법 미결정 ("import 또는 lib/ 이동" 열린 상태) |
| 7 | 15-2 Dev Notes | LOW | "meomory" 오타 |
