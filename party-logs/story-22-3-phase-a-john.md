# Critic-C Review — Story 22.3: Vector Migration 768→1024

**Reviewer:** John (Product Manager)
**Date:** 2026-03-24
**Spec:** `_bmad-output/implementation-artifacts/stories/22-3-vector-migration-768-to-1024.md`

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 파일 경로, 라인 번호(schema.ts:1556), SQL 패턴, 함수 시그니처 전부 명시. "적절한" 표현 거의 없음. 다만 HNSW 빌드 파라미터(m, ef_construction) 미지정. |
| D2 완전성 | 5/10 | **semantic_cache 테이블 누락** — `query_embedding VECTOR(768)` (schema.ts:1888, migration 0051) 미포함. E18 "All vectors must be 1024d" 위반. 22.2 이후 getEmbedding()이 1024d를 반환하므로 semantic cache INSERT 시 dimension mismatch 에러 발생. Go/No-Go #10 "768d→1024d complete" 불충족. |
| D3 정확성 | 5/10 | **인덱스명 오류**: 스펙이 `knowledge_docs_embedding_hnsw_idx`를 DROP하지만, 실제 인덱스는 `knowledge_docs_embedding_idx` (migration 0049:10). **array_length 오류**: pgvector vector 타입은 `array_length()` 미지원 — `vector_dims()` 함수 사용 필요. Go/No-Go #10 검증 쿼리 2건(AC-4, Task 4.1) 전부 해당. |
| D4 실행가능성 | 7/10 | 코드 패턴, SQL 스니펫, 함수 호출 체인 명확. 하지만 인덱스명·SQL 함수 오류로 인해 그대로 실행 시 런타임 에러 발생. 수정 후엔 바로 구현 가능. |
| D5 일관성 | 7/10 | 22.1→22.2→22.3 의존성 체인 명확. 네이밍 컨벤션(kebab-case 파일, 0061 시퀀스) 준수. voyage-embedding.ts API 참조 정확. |
| D6 리스크 | 5/10 | IRREVERSIBLE 경고 있으나 **롤백 계획 없음** — pg_dump 또는 별도 백업 컬럼 등 최소한의 안전장치 필요. semantic_cache 장애 리스크 미식별. HNSW 2GB 메모리 경고는 있으나 `work_mem` 구체값 미제시. |

## 가중 평균: 6.10/10 ❌ FAIL

> D1(8×0.20) + D2(5×0.20) + D3(5×0.15) + D4(7×0.15) + D5(7×0.10) + D6(5×0.20) = 1.60 + 1.00 + 0.75 + 1.05 + 0.70 + 1.00 = **6.10**

---

## 이슈 목록

### BLOCKER

1. **[D2 완전성] semantic_cache 테이블 VECTOR(768) 누락**
   - **위치**: `packages/server/src/db/schema.ts:1888` — `queryEmbedding: vector('query_embedding', { dimensions: 768 })`
   - **위치**: `packages/server/src/db/migrations/0051_semantic-cache.sql:8` — `query_embedding VECTOR(768)`
   - **문제**: Story 22.2 완료 후 `getEmbedding()`이 1024d 벡터를 반환. `semantic_cache`에 INSERT 시 `ERROR: expected 768 dimensions, not 1024` 발생.
   - **수정**: migration 0061에 semantic_cache도 포함:
     - `TRUNCATE semantic_cache` (캐시 데이터 — 날려도 무방)
     - `ALTER TABLE semantic_cache ALTER COLUMN query_embedding TYPE vector(1024)`
     - `DROP INDEX semantic_cache_embedding_idx` + HNSW 재생성
     - schema.ts:1888 `dimensions: 768` → `dimensions: 1024`
   - **근거**: Architecture E18 "All vectors must be 1024d", Go/No-Go #10 "768d→1024d **complete**"

### HIGH

2. **[D3 정확성] 인덱스명 오류 — DROP INDEX 실패**
   - **위치**: Spec Migration SQL Step 3, Task 1.2
   - **문제**: `DROP INDEX IF EXISTS knowledge_docs_embedding_hnsw_idx` — 실제 인덱스명은 `knowledge_docs_embedding_idx` (migration 0049:10 확인)
   - **수정**: `DROP INDEX IF EXISTS knowledge_docs_embedding_idx`

3. **[D3 정확성] Go/No-Go #10 검증 쿼리 — array_length() 사용 불가**
   - **위치**: AC-4, Task 4.1, Dev Notes E18 참조
   - **문제**: pgvector `vector` 타입은 PostgreSQL native array가 아님. `array_length(embedding, 1)` → SQL 에러. 올바른 함수: `vector_dims(embedding)`
   - **수정**: `SELECT count(*) FROM knowledge_docs WHERE vector_dims(embedding) != 1024`
   - **참고**: VECTOR(1024) 타입 제약으로 다른 차원 삽입 자체가 불가하므로, NULL 체크만으로도 사실상 충분. 그래도 검증 쿼리는 정확해야 함.

### MEDIUM

4. **[D6 리스크] 롤백 계획 부재**
   - **문제**: IRREVERSIBLE 경고만 있고 실제 롤백/백업 전략 없음
   - **수정**: 최소한 다음 추가:
     - 마이그레이션 전 `pg_dump --table=knowledge_docs --column-inserts` (768d 백업)
     - 또는 `embedding_backup vector(768)` 임시 컬럼에 복사 후 마이그레이션 완료 시 DROP
   - **판단**: 실제로 Gemini 768d 임베딩은 다시 쓸 일 없음(Gemini 금지). 하지만 마이그레이션 자체가 실패할 경우의 복구 경로는 필요.

5. **[D1 구체성] HNSW 빌드 파라미터 미지정**
   - **문제**: `CREATE INDEX ... USING hnsw` 시 `m`(기본 16), `ef_construction`(기본 64) 값이 기본값 의존. 1024d에서 기본값이 충분한지 명시적 판단 필요.
   - **수정**: 현 데이터 규모에선 기본값 적절하다는 판단을 Dev Notes에 명시하거나, 명시적 파라미터 지정.

6. **[D4 실행가능성] 대량 문서 시 메모리 이슈**
   - **위치**: Task 3.2 — `SELECT ... FROM knowledge_docs WHERE is_active = true` (LIMIT 없음)
   - **문제**: 문서 수가 수만 건이면 전부 메모리에 로드. pagination/cursor 패턴 필요.
   - **수정**: LIMIT + OFFSET 또는 cursor-based pagination 추가. 기존 `embedAllDocuments()`의 `BATCH_MAX_DOCS = 500` 패턴 참조.

---

## Cross-talk 요약

- Winston(Critic-A)에게: 인덱스명 오류와 semantic_cache 누락을 아키텍처 관점에서 검증 요청.
- Quinn(Critic-B)에게: `array_length` vs `vector_dims` 정확성, HNSW 메모리 2GB 제약 하에서 두 테이블(knowledge_docs + semantic_cache) 순차 빌드 가능 여부 검증 요청.

---

## 판정

**❌ FAIL (6.10/10)** — BLOCKER 1건(semantic_cache 누락) + HIGH 2건(인덱스명, SQL 함수 오류). 수정 후 재검토.

---

## [Fixes Applied] 재검토 — 2026-03-24

Dev가 8개 이슈 전부 수정 완료. 항목별 검증:

| # | 이슈 | 상태 | 검증 |
|---|------|------|------|
| 1 | semantic_cache VECTOR(768) 누락 | ✅ | AC-1, AC-2, AC-4, AC-6, Task 1.4-1.6, Task 2.3-2.4, Migration SQL Steps 5-8 모두 포함. TRUNCATE 사용 (ephemeral 24h TTL — 적절). |
| 2 | 인덱스명 오류 | ✅ | Task 1.2 `knowledge_docs_embedding_idx`, Task 1.5 `semantic_cache_embedding_idx` — 0049/0051 실제 이름과 일치. |
| 3 | array_length → vector_dims | ✅ | AC-4, Task 4.1 전부 `vector_dims()` 사용. Dev Notes E18에 "pgvector vector type is NOT a PG array" 명시. |
| 4 | 롤백 계획 부재 | ✅ | AC-7 `pg_dump` 추가. Task 4.3 구체적 커맨드 명시. Migration SQL 헤더에 PRE-REQUISITE 코멘트. |
| 5 | HNSW 빌드 파라미터 | ✅ | Dev Notes: "default m=16, ef_construction=64 appropriate for <10K docs". `SET LOCAL work_mem = '512MB'` 추가. |
| 6 | 무제한 SELECT | ✅ | Task 3.2: `LIMIT 500 OFFSET ?` 페이지네이션 + `BATCH_MAX_DOCS` 패턴 참조. |
| 7 | 비멱등성 (Quinn) | ✅ | Task 3.2: `WHERE embedding IS NULL AND is_active = true` — 재실행 시 이미 임베딩된 문서 건너뜀. |
| 8 | Advisory lock 없음 (Quinn) | ✅ | Task 3.9: `pg_advisory_lock(hashtext('migrate-embeddings-1024'))` 추가. |

### 재채점

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 파일 경로, 라인 번호, SQL 전문, 함수 시그니처, HNSW 파라미터, work_mem 값 전부 명시. |
| D2 완전성 | 9/10 | 양 테이블 커버, 백업, 어드바이저리 락, 멱등 재실행, 페이지네이션, 에지 케이스 테스트. |
| D3 정확성 | 9/10 | 인덱스명 0049/0051 확인 완료. vector_dims() 정확. 스키마 라인 번호 일치. |
| D4 실행가능성 | 9/10 | SQL 복붙 수준. 코드 패턴 + 함수 체인 명확. |
| D5 일관성 | 9/10 | 22.1→22.2→22.3 의존성 유지. BATCH_MAX_DOCS 패턴 재사용. |
| D6 리스크 | 8/10 | pg_dump 백업, staging-first, advisory lock, sequential HNSW. 유지보수 윈도우/다운타임 추정치만 미비. |

### 가중 평균: 8.80/10 ✅ PASS

> D1(9×0.20) + D2(9×0.20) + D3(9×0.15) + D4(9×0.15) + D5(9×0.10) + D6(8×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.60 = **8.80**

### Cross-talk 정합성
- Quinn: 8.65/10 PASS ✅ (차이 0.15 — 정상 범위)
- Winston: 대기 중
