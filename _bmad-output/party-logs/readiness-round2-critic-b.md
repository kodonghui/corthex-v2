# CRITIC-B Review: Stage 5 Readiness (보강판) — Epic 15
**Round:** 2 | **Reviewer:** CRITIC-B | **Date:** 2026-03-12

---

## 이전 Issue 1 철회 (NFR 25개 → 정확함)

이전 검토에서 "P4~P7, O6는 허구 코드"로 지적했으나, PRD addendum Section 2(`epic-15-prd-addendum.md` lines 160~215)를 직접 확인한 결과:
- P1~P7 (7개): 전부 실제 존재 ✅
- O1~O6 (6개): 전부 실제 존재 ✅
- **총 25개 NFR은 정확함** — 이전 지적 오류 인정. 보강판 25/25 커버리지 주장은 타당.

---

## 주요 확인 통과

- D17~D21 Section 5 Architecture Consistency — Task 레벨 추적 완전 ✅
- Section 6.2 pgvector 준비 상태: `generateEmbedding(apiKey, text)` 경로 `services/embedding-service.ts:45` 정확히 명시 ✅
- Section 6.3 SDK 버전 `0.2.72` exact pin 확인 ✅
- Section 6.1 Epic 14: git `ff5880f` 기준 코드 완료 확인 ✅
- R-1 (SDK PoC), R-4 (도구명), R-5 (VECTOR 768), R-6 (경로 B Hook 단절) — 심각도·완화 방안 적절 ✅
- Section 8 Epic 15 완료 기준 7개: 구체적이고 측정 가능 ✅

---

## Issue 1 — Story 15.3 파일 미수정 (R-2 경고만으로 불충분) [HIGH]
**[Amelia — Dev 관점] — Section 8 구현 전 필수 조치**

보고서 R-2가 `getEmbedding()` 오기를 정확히 식별했지만, "구현 전 필수 조치 #1"로만 남겨둔 채 **Story 15.3 파일 자체를 수정하지 않음**.

현재 Story 15.3 Dev Notes (실측):
```
Gemini embedding 재사용: Epic 10.2의 `getEmbedding()` 함수 위치 확인
(`packages/server/src/lib/embedding.ts` 또는 유사 경로) — text-embedding-004, 768차원
```
→ `lib/embedding.ts` 파일 존재하지 않음. 실제 경로: `services/embedding-service.ts:45`

**개발자는 스토리 파일을 기준으로 구현**. 리드니스 보고서는 참고 문서 — 스토리 Dev Notes 오기가 존재하면 개발자가 존재하지 않는 파일을 찾다 시행착오 발생.

**수정 요청**: Story 15.3 파일 Dev Notes를 직접 수정:
```
수정 전:
Gemini embedding 재사용: Epic 10.2의 `getEmbedding()` 함수 위치 확인
(`packages/server/src/lib/embedding.ts` 또는 유사 경로) — text-embedding-004, 768차원

수정 후:
**Embedding 함수**: `services/embedding-service.ts`의 `generateEmbedding(apiKey: string, text: string): Promise<number[] | null>`
**Google API key 획득 패턴** (services/semantic-search.ts lines 34~49 동일 패턴):
  import { getCredentials } from '../services/credential-vault'
  import { extractApiKey, generateEmbedding } from '../services/embedding-service'

  const credentials = await getCredentials(companyId, 'google_ai')
  const apiKey = extractApiKey(credentials)
  if (!apiKey) {
    log.warn({ event:'semantic_cache_error', op:'embedding', reason:'no_google_api_key' })
    return null  // graceful fallback
  }
  const embedding = await generateEmbedding(apiKey, text)
  if (!embedding) return null  // generateEmbedding null 처리
```
리드니스 보고서 "구현 전 필수 조치 #1"도 위 패턴으로 갱신 필요.

---

## Issue 2 — R-2 credential 패턴 여전히 오류 [MEDIUM]
**[Amelia — Dev 관점] — Section 7 R-2 완화 방안**

R-2 완화 방안:
```
`ctx.getCredentials('google')` 또는 `services/semantic-search.ts` 참조 패턴 명시
```

`ctx.getCredentials('google')` 는 여전히 남아있음:
1. `ctx` (SessionContext)에 `getCredentials()` 메서드 없음
2. credential 키 `'google'` → 실제는 `'google_ai'`

"또는 semantic-search.ts 참조"라는 출구가 있지만, 개발자가 `ctx.getCredentials('google')`를 먼저 시도할 수 있음.

**수정 요청**: R-2 완화 방안에서 `ctx.getCredentials('google')` 삭제:
```
수정 전:
`ctx.getCredentials('google')` 또는 `services/semantic-search.ts` 참조 패턴 명시

수정 후:
`services/semantic-search.ts` lines 34~49 패턴 참조:
  getCredentials(companyId, 'google_ai') → extractApiKey(credentials) → generateEmbedding(apiKey, text)
```

---

## Issue 3 — Epic 14 Story 파일 status 처리 방침 [LOW]
**[Bob — SM 관점] — Section 6.1**

현재 보고서: "문서 gap이지만 구현 블로커 아님" → **READY 판정 영향 없음.** 이 판단은 정확함. ✅

추가 권고: Section 8 "구현 전 필수 조치"에 포함하거나 WARN 항목으로 추가:
```
Epic 14 Story 파일(14.1~14.3) status가 'backlog' — 실제 코드는 완료됨(git ff5880f).
Sprint Planning 착수 전 Story 파일 status 'completed'로 업데이트 권고 (문서 일관성 유지).
```
READY 판정 자체에는 영향 없음.

---

## Issue 4 — NFR-P7 DB 성능 테스트가 Story Task 9에 누락 [LOW]
**[Quinn — QA 관점] — Section 2 NFR, Section 3 Story 15.3 Task 역추적**

PRD NFR-P7 (line 175):
```
hnsw 인덱스 적용 후 10,000 레코드 기준 cosine similarity 조회 ≤ 50ms
bun:test 통합 테스트 — 실제 Neon DB 연결 환경, CI에서 단위 테스트와 분리 실행
```

Story 15.3 Task 9 검증 항목에 NFR-P7 실제 DB 성능 테스트 없음.

히트율 목표 NFR(P4~P6)은 로깅 인프라로 측정 가능하지만, P7(≤50ms)은 실제 pgvector DB 연결 테스트 없이 검증 불가.

**수정 요청**: Story 15.3 Task 9에 추가:
```
- [ ] NFR-P7 성능 검증 (bun:test — 실제 Neon DB): 10,000 레코드 기준 cosine similarity 조회 ≤ 50ms
  (CI 단위 테스트와 분리, INTEGRATION_TEST=true 환경변수로 구분 실행)
```
단, 이 테스트는 실제 DB 환경이 필요하므로 구현 단계에서 CI 설정 먼저 확인 후 결정.

---

## 핵심 질문 답변

**Q1. Story 15.3 파일 자체 수정 vs 보고서 경고만으로 충분한지?**
→ **Story 파일 직접 수정 필수.** 보고서는 참고 문서. 개발자가 스토리 Dev Notes의 존재하지 않는 `lib/embedding.ts` 경로를 따르면 즉시 시행착오. Issue 1 참조.

**Q2. Epic 14 Story 파일 status "backlog" — READY 판정 영향 여부?**
→ **READY 판정 영향 없음.** 구현 완료 기준은 코드베이스 (git ff5880f). Story 파일은 문서 gap. Sprint Planning 전 업데이트 권고.

**Q3. 누락된 체크 항목?**
→ NFR-P7 DB 성능 테스트가 Story Task 9에 누락 (Issue 4). 나머지 체크리스트 완전함.

---

## 종합 평가

| 이슈 | 심각도 | 판단 |
|------|--------|------|
| Issue 1: Story 15.3 Dev Notes `getEmbedding()` 미수정 | HIGH | 파일 직접 수정 필요 |
| Issue 2: R-2 `ctx.getCredentials('google')` 오류 잔존 | MEDIUM | R-2 완화 방안 수정 |
| Issue 3: Epic 14 Story 파일 status 처리 | LOW | READY 영향 없음, Sprint 전 권고 |
| Issue 4: NFR-P7 DB 성능 테스트 미포함 | LOW | Task 9 추가 권고 |
| 이전 Issue 1 (NFR 25개 오류) | **철회** | PRD addendum 직접 확인으로 25개 실제 존재 확인 |

**READY 판정: 유지.** Issue 1(HIGH) 스토리 파일 수정 후 최종 확인 필요.
