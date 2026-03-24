# Critic-C Review — Story 22.3 Phase B: Implementation

**Reviewer:** John (Product Manager)
**Date:** 2026-03-24
**Files reviewed:**
- `packages/server/src/db/migrations/0061_voyage_vector_1024.sql`
- `packages/server/src/db/schema.ts` (lines 1556, 1888)
- `packages/server/src/scripts/migrate-embeddings-1024.ts`
- `packages/server/src/__tests__/unit/vector-migration-1024.test.ts`

---

## AC 검증 체크리스트

| AC | 상태 | 검증 |
|----|------|------|
| AC-1: Column dimension change | ✅ | 0061 SQL: NULL→ALTER on knowledge_docs (Steps 1-3) + TRUNCATE→ALTER on semantic_cache (Steps 5-7). schema.ts:1556 = 1024, schema.ts:1888 = 1024. |
| AC-2: HNSW index rebuild | ✅ | Correct index names (`knowledge_docs_embedding_idx`, `semantic_cache_embedding_idx`). Both `vector_cosine_ops`. Sequential order enforced. `SET LOCAL work_mem = '512MB'`. |
| AC-3: Batch re-embedding | ✅ | Script uses `getEmbeddingBatch()` from voyage-embedding.ts. Groups by companyId. prepareText(title, content). updateDocEmbedding per success. |
| AC-4: Go/No-Go #10 | ✅ | `verifyGoNoGo10()` — 3 queries with `vector_dims()`. Exit(1) on failure. No `array_length` anywhere. |
| AC-5: Semantic search | ✅ | No changes needed (cosineDistance dimension-agnostic). semantic-search tests 35/35 pass. |
| AC-6: Schema updated | ✅ | Both lines updated with `dimensions: 1024`. Comments reference "Voyage AI voyage-3 1024-dim". |
| AC-7: Backup + staging | ⚠️ | pg_dump mentioned in SQL header comment as PRE-REQUISITE. Not enforced by code — acceptable for manual operational step. |

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | Migration SQL은 spec의 패턴과 1:1 일치. Script 함수 시그니처, 상수, import 전부 정확. 31개 테스트 각각 구체적 assertion. |
| D2 완전성 | 8/10 | 7개 AC 전부 구현. 31 tests + 기존 76 tests(voyage+semantic) PASS. 한 가지 빠짐: 페이지네이션 루프 무한반복 가능성 (아래 이슈 #1). |
| D3 정확성 | 9/10 | 인덱스명 0049/0051 일치 확인. vector_dims() 사용. schema.ts 라인 번호 정확. SQL 문법 올바름. |
| D4 실행가능성 | 9/10 | 코드 깔끔, 타입 안전, 함수 분리 적절. advisory lock → paginate → embed → verify 파이프라인 명확. |
| D5 일관성 | 9/10 | voyage-embedding.ts API(getEmbeddingBatch, prepareText, updateDocEmbedding, EMBEDDING_MODEL) 정확히 활용. BATCH_DELAY_MS 패턴 동일. |
| D6 리스크 | 7/10 | Advisory lock ✅. 하지만 pagination 무한루프 리스크 미처리 (이슈 #1). 운영 스크립트로서 Ctrl+C 가능하지만, API 비용 낭비 가능. |

## 가중 평균: 8.40/10 ✅ PASS

> D1(9×0.20) + D2(8×0.20) + D3(9×0.15) + D4(9×0.15) + D5(9×0.10) + D6(7×0.20) = 1.80 + 1.60 + 1.35 + 1.35 + 0.90 + 1.40 = **8.40**

---

## 이슈 목록

### MEDIUM

1. **[D6 리스크] 페이지네이션 루프 무한반복 가능성**
   - **위치**: `migrate-embeddings-1024.ts:173` — `while (true)` loop
   - **문제**: `fetchNullEmbeddingDocs()`는 OFFSET 없이 `WHERE embedding IS NULL` + `LIMIT 500`으로 조회. 성공하면 embedding이 채워져 다음 조회에서 제외됨 (커서 패턴). **하지만** 지속적으로 실패하는 문서(예: 회사에 Voyage AI 키 없음)는 계속 NULL → 무한 재시도 → API 비용 낭비.
   - **영향**: Voyage AI API 크레딧 소비, 스크립트 무한 실행
   - **수정 제안**: `MAX_PAGES` 상한 (예: 100) 또는 페이지당 진행률 체크 — `succeeded === 0 && failed > 0`이면 break + 경고 로그
   - **심각도**: MEDIUM — 운영자가 Ctrl+C로 중단 가능하지만, 무인 실행 시 위험

### LOW (관찰)

2. **[D2 완전성] embeddingModel 컬럼 기존 값 정리 미포함**
   - `schema.ts:1557` — `embeddingModel` 컬럼에 `'gemini-embedding-001'` 등 기존 값 남아있을 수 있음. `updateDocEmbedding`이 `'voyage-3'`로 업데이트하므로 re-embed 시 자동 수정됨. 다만 NULL embedding + non-null embeddingModel 상태가 일시적으로 존재. 실질적 영향 없음.

3. **[D1 구체성] turbo build 실패 — pre-existing 확인**
   - Dev가 `git stash`로 22.3 변경 롤백 후에도 동일 실패 확인. voyageai SDK의 @huggingface/transformers 의존성 문제 (Story 22.2 기원). 22.3 범위 밖이지만, 22.4 이전에 해결 필요할 수 있음.

---

## Cross-talk 요약

- 이슈 #1(무한루프)은 Quinn이 idempotency 관점에서 유사하게 지적할 수 있음. 공유 예정.
- Winston은 migration SQL이 spec과 1:1 일치 확인할 것으로 예상.

---

## 판정

**✅ PASS (8.40/10)** — 모든 AC 구현 완료. 코드 품질 우수. MEDIUM 이슈 1건(무한루프 안전장치)은 개선 권고이나 블로커 아님.
