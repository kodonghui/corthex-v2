# CRITIC-B Review: Stage 4 Epics & Stories — Epic 15
**Round:** 1 | **Reviewer:** CRITIC-B (Winston/Amelia/Quinn/Bob) | **Date:** 2026-03-12

---

## 주요 확인 통과

- D17 PoC 결정 트리: 15.1 AC#1~#3 완전 반영 ✅
- D18 E8 경계 (lib/ 위치): 15.2 Context + Dev Notes ✅
- D19 E8 경계 (engine/ 내부): 15.3 Task 7 CI 검증 패턴 ✅
- D20 companyId 격리: 15.2 키 포맷 + 15.3 SQL `WHERE company_id=$1` ✅
- D21 CacheStore 인터페이스 분리: 15.2 Task 1 ✅
- NFR-CACHE-R1~R4 fallback AC 전부 명시 ✅
- 15.3 Task 순서: DB 마이그레이션(1) → scoped-query(2) → semantic-cache(3) → agent-loop(4) → Admin UI(5) → Hub(6) → CI(7) → ARGOS(8) → 검증(9) 논리적 ✅
- UX 결정 반영: 모달 텍스트 "저장 시점부터 24시간" / 300ms 스피너 / Switch 스펙 ✅
- D20 callee-side CREDENTIAL_PATTERNS: 15.3 Task 3 + Context + AC#2 ✅
- 의존성: 15.1→15.3 블로킹 근거 명확, 15.2 독립 ✅
- FR/NFR 커버리지 매핑 테이블: 전체 커버 ✅

---

## Issue 1 — CREDENTIAL_PATTERNS "복사" 허용 표현 [HIGH]
**[Winston — Architect 관점] — 15.3 Task 3**

Task 3 line:
```
CREDENTIAL_PATTERNS: credential-scrubber Hook과 동일 패턴 소스 (import 또는 복사) 확인 필요
```

"복사(copy)" 선택지를 허용하면: `credential-scrubber.ts`가 향후 패턴을 업데이트할 때 `semantic-cache.ts`의 복사본은 동기화되지 않아 semantic_cache 테이블에 credential이 저장되는 보안 취약점 발생. NFR-CACHE-S3 핵심 요건 위반.

Dev Notes(line 203)은 올바른 방향을 제시("import 또는 lib/ 레이어로 이동")하지만, Task 3 본문에서 "복사"가 허용된 것처럼 읽힌다. 개발자는 Task를 먼저 본다.

**요구사항:** Task 3을 다음으로 수정:
```
CREDENTIAL_PATTERNS: `credential-scrubber.ts`의 상수를 직접 import하거나
`lib/credential-patterns.ts`로 이동 후 양쪽에서 import — **복사(copy) 금지**.
패턴 불일치 시 semantic_cache 테이블에 credential 저장 보안 취약점 발생.
```

---

## Issue 2 — `checkSemanticCache` 반환 타입이 `string | null`이어서 similarity 로깅 불가 [MEDIUM]
**[Amelia — Dev 관점] — 15.3 Task 3, Task 4, AC#1**

Task 3 정의:
```typescript
checkSemanticCache(companyId: string, query: string): Promise<string | null>
```

Task 4 코드:
```typescript
log.info({ event:'semantic_cache_hit', companyId, agentId, similarity })
```

`checkSemanticCache`가 `string | null`만 반환하면 `similarity` 값을 알 수 없다. FR-CACHE-3.10 및 AC#1은 `similarity` 로깅을 명시적으로 요구한다:
> `log.info({ event:'semantic_cache_hit', companyId, agentId, similarity })`

구현자가 이 코드를 그대로 작성하면 `similarity`가 `undefined`로 기록되어 KPI-4 측정 불가.

**요구사항:**
1. Task 3 `checkSemanticCache` 반환 타입 변경:
   `Promise<{ response: string; similarity: number } | null>`
2. Task 2 `findSemanticCache` 반환 타입도 동일하게:
   `Promise<{ response: string; similarity: number } | null>`
3. Task 4 agent-loop.ts 코드:
   ```typescript
   const result = await checkSemanticCache(companyId, userMessage)
   if (result) {
     log.info({ event:'semantic_cache_hit', companyId, agentId, similarity: result.similarity })
     return yieldCachedResponse(result.response)
   }
   ```

---

## Issue 3 — Admin UI에서 `getCacheRecommendation()` 직접 import 불가 [MEDIUM]
**[Winston — Architect 관점] — 15.3 Task 5, 15.2 Task 2**

15.2 Task 2: `getCacheRecommendation()` 함수를 `packages/server/src/lib/tool-cache-config.ts`에 정의.
15.3 Task 5: "Story 15.2의 `getCacheRecommendation()` 활용" — Admin UI(`packages/admin`)에서 사용.

`packages/admin`(프론트엔드 React)은 `packages/server/src/lib/`(서버 Node.js)를 직접 import할 수 없다. Cross-package boundary 위반 + Vite 빌드에서 Node.js 모듈 해석 실패 가능.

**요구사항:** 15.3 Task 5에 구현 방식 명시 (다음 중 택1):
- A) Admin API 응답에 추천 값 포함: `GET /api/admin/agents/:id` 또는 `GET /api/admin/agents/:id/tools` 응답에 `semanticCacheRecommendation: 'safe' | 'warning' | 'none'` 필드 추가 (서버에서 계산 후 전달)
- B) Admin 프론트엔드에서 TTL 임계값 독자 계산: 에이전트 도구 목록 + 하드코딩 임계값(TTL=0 → ✗, TTL≤900,000ms → ⚠) 기준으로 프론트엔드 내에서 판단 (단, 임계값 변경 시 server/admin 양쪽 갱신 필요)

---

## Issue 4 — 경로 B (messages.create()) Hook 파이프라인 변환 명세 부재 [LOW]
**[Amelia — Dev 관점] — 15.1 Task 3B**

Task 3B: "기존 SDK `query()` 응답 형식 유지 — messages.create() 응답을 Hook 파이프라인 입력 형식으로 변환"

현재 Hook 파이프라인(E2 패턴)은 `query()` 응답 형식을 기대한다. `messages.create()`는 Anthropic 원시 API 응답을 반환하므로 응답 구조가 다를 수 있다. 변환이 필요한 필드(toolCallResults, usage, stopReason 등)가 명시되지 않아 구현자가 시행착오를 겪을 위험.

**요구사항:** Task 3B 또는 Dev Notes에 추가:
```
messages.create() 응답 → Hook pipeline 변환 필요 필드:
- usage: { inputTokens, outputTokens, cacheReadInputTokens?, cacheCreationInputTokens? }
- stopReason: MessageStopReason → E2 Stop Hook 입력 형식
- toolUse: ContentBlock[] → PreToolUse/PostToolUse Hook 입력 형식
현재 agent-loop.ts의 query() 응답 처리 코드를 먼저 파악 후 변환 래퍼 설계 필요.
```

---

## Issue 5 — "meomory" 오타 [LOW]
**[Bob — SM 관점] — 15.2 Dev Notes**

line 104: `**meomory 계산**` → `**memory 계산**`

---

## 종합 평가

| 이슈 | 파일 | 심각도 |
|------|------|--------|
| Issue 1: CREDENTIAL_PATTERNS 복사 허용 | 15.3 Task 3 | **HIGH** |
| Issue 2: checkSemanticCache similarity 반환 누락 | 15.3 Task 3/4, AC#1 | **MEDIUM** |
| Issue 3: getCacheRecommendation cross-package | 15.3 Task 5 | **MEDIUM** |
| Issue 4: 경로 B Hook 변환 명세 부재 | 15.1 Task 3B | **LOW** |
| Issue 5: meomory 오타 | 15.2 Dev Notes | **LOW** |

**전체 판정:** 4개 파일 전반에 걸쳐 아키텍처 결정 D17~D21 완전 반영, NFR/FR 커버리지 정확, Task 순서 논리적. Issue 1(보안)과 Issue 2(구현 정확성)가 핵심 수정 대상.
