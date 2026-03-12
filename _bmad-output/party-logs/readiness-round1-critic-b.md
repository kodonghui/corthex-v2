# CRITIC-B Review: Stage 5 Implementation Readiness — Epic 15
**Round:** 1 | **Reviewer:** CRITIC-B (Winston/Amelia/Quinn/Bob) | **Date:** 2026-03-12

---

## 주요 확인 통과

- FR 26/26 스토리 AC 1:1 매핑 — 실제 PRD addendum FR 목록과 대조 완료 ✅
- 코드베이스 인프라 체크리스트 (agent-loop.ts, embedding-service.ts, credential-scrubber.ts, semantic-search.ts 등) 파일 존재 확인 ✅
- UX ↔ PRD ↔ Architecture 정합성 확인 ✅
- WARN-1 (경로 B Hook 단절), WARN-3 (tool 등록명 확인), WARN-6 (JSON 스크러빙 불필요) — 심각도·내용 모두 적절 ✅
- 권고 구현 순서 (Phase A 병렬 → Phase B 15.3): 의존성 기반 논리적 ✅

---

## Issue 1 — NFR 개수 및 커버리지 매트릭스 허구 코드 [MEDIUM]
**[Winston — Architect 관점] — Step 2 + Step 3**

**Step 2** 선언:
```
성능 (7개): NFR-CACHE-P1~P7
운영 (6개): NFR-CACHE-O1~O6
합계: 25개
```

**실제** (epic-15-epics-and-stories.md NFR 테이블 대조):
- 성능: P1~P3 (3개) — P4~P7 존재하지 않음
- 운영: O1~O5 (5개) — O6 존재하지 않음
- 합계: 20개 (보고서 최종 주장과 동일하지만 산식이 틀림)

**Step 3 커버리지 매트릭스** 오류:
```
NFR-CACHE-P2, P6~7, R2, S2, S3, O2, O5, O6 | 15.3
```
`P6`, `P7`, `O6`은 PRD에 존재하지 않는 허구 코드. "NFR 20/20 (100%)" 커버 주장은 우연히 맞지만(실 NFR 20개 전부 커버됨), 허구 코드 참조로 신뢰성 훼손.

**수정 요청:**
```
Step 2: 성능 (3개): NFR-CACHE-P1~P3, 운영 (5개): NFR-CACHE-O1~O5, 합계 20개
Step 3 매트릭스 15.3 행: NFR-CACHE-P2, R2, S2, S3, O2, O5 (P6~7, O6 삭제)
```

---

## Issue 2 — WARN-4 자격증명 획득 패턴 오류 [HIGH]
**[Amelia — Dev 관점] — Step 7 WARN-4, Dev Notes 수정 권고**

보고서가 제시한 패턴:
```
ctx.getCredentials('google')
```

실제 코드베이스 패턴 (`services/semantic-search.ts` 실측):
```typescript
const credentials = await getCredentials(companyId, 'google_ai')  // credential-vault
const apiKey = extractApiKey(credentials)                           // embedding-service
if (!apiKey) {
  // graceful fallback
}
const embedding = await generateEmbedding(apiKey, text)
```

2가지 오류:
1. `ctx.getCredentials()` — SessionContext에 이런 메서드 없음. 실제는 `getCredentials(companyId, credential_key)`
2. `'google'` — 실제 크리덴셜 키는 `'google_ai'` (embedding-service.ts line 118, 173 실측)

`null` 처리도 WARN-4에서 언급됐지만 패턴 자체가 잘못되어 구현자가 그대로 따르면 크리덴셜 조회 실패.

**수정 요청:** WARN-4 권고 조치 및 Dev Notes 권고 수정:
```
Story 15.3 Task 3의 Google API key 획득 패턴:
  import { getCredentials } from '../../services/credential-vault'
  import { extractApiKey, generateEmbedding } from '../../services/embedding-service'

  const credentials = await getCredentials(companyId, 'google_ai')
  const apiKey = extractApiKey(credentials)
  if (!apiKey) {
    log.warn({ event:'semantic_cache_error', op:'embedding', reason:'no_google_api_key' })
    return null  // graceful fallback
  }
  const embedding = await generateEmbedding(apiKey, query)
  if (!embedding) return null  // generateEmbedding null 처리

참조: services/semantic-search.ts lines 34~50 (동일 패턴)
```

---

## Issue 3 — WARN-5 "실제 export명" 오진 [MEDIUM]
**[Winston — Architect 관점] — Step 7 WARN-5**

보고서: "`credential-scrubber.ts`의 실제 상수명 `PATTERNS`(실제 export명)"

실제 코드 (`engine/hooks/credential-scrubber.ts` line 6):
```typescript
const PATTERNS: RegExp[] = [  // ← "export" 없음. private 상수.
  /sk-ant-[a-zA-Z0-9_-]{20,}/g,
  ...
]
```

`PATTERNS`는 **export되지 않은 private 상수**. "실제 export명"이라는 표현이 틀림 — 현재 외부에서 import 불가능한 상태. WARN-5 자체 방향(lib/credential-patterns.ts 추출)은 올바르지만, 왜 추출이 필요한지 이유 설명이 부정확.

**수정 요청:**
```
WARN-5 내용: `credential-scrubber.ts`의 PATTERNS 상수는 현재 export 없이 private으로 정의됨.
lib/credential-patterns.ts로 이동 시 export const CREDENTIAL_PATTERNS = [...]로 선언.
credential-scrubber.ts는 이후 lib/credential-patterns.ts에서 import.
```

---

## Issue 4 — PRD Appendix B SQL이 similarity 미반환 [LOW]
**[Amelia — Dev 관점] — Step 6 코드베이스 사전 조건 검증**

보고서 Step 6에서 `db/scoped-query.ts` 확장을 언급하지만, PRD Appendix B SQL 원본:
```sql
SELECT response
FROM semantic_cache
WHERE company_id = $1 ...
```
`similarity`(= `1-(query_embedding <=> $2)`) 미선택. Story 15.3 Task 2에서 `findSemanticCache` 반환 타입이 `{ response, similarity }` (Issue 2 수정 완료)이므로 구현자가 PRD Appendix B SQL을 그대로 복사하면 `similarity` 누락.

**수정 요청:** Step 7 Dev Notes 권고 또는 WARN-4 항목 끝에 추가:
```
주의: PRD Appendix B SQL은 SELECT response만 포함. Story 15.3 Task 2 반환 타입
{ response, similarity }에 맞게 SELECT에 1-(query_embedding <=> $2) AS similarity 추가 필요.
```

---

## 종합 평가

| 이슈 | 섹션 | 심각도 |
|------|------|--------|
| Issue 1: NFR 개수 오류 + 허구 코드 (P6~7, O6) | Step 2, Step 3 | **MEDIUM** |
| Issue 2: WARN-4 credential 패턴 오류 (ctx.getCredentials / 'google') | Step 7 WARN-4 | **HIGH** |
| Issue 3: WARN-5 "export명" 오진 (private 상수임) | Step 7 WARN-5 | **MEDIUM** |
| Issue 4: PRD Appendix B SQL similarity 미반환 미언급 | Step 7 권고 | **LOW** |

**READY 판정**: 번복 불필요. Issue 2(HIGH)가 구현 오류 유발 위험이 있지만, 개발자가 "semantic-search.ts 참조" 지시를 따르면 실제 코드에서 올바른 패턴을 발견할 수 있음. CRITICAL 블로커 없음.

**단, Issue 2 수정 후 보고서 갱신 필요** — 개발자가 WARN-4 텍스트를 직접 참조할 경우 잘못된 크리덴셜 키('google' vs 'google_ai')로 구현 가능성 있음.
