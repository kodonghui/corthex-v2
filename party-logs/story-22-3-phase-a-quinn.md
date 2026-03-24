# Critic-B (Quinn, QA+Security) Review — Story 22.3: Vector Migration 768→1024

## Round 1 점수: 6.45/10 ❌ FAIL (아래 이슈 목록 참조)

---

## Round 2 (Post-Fix): 8.65/10 ✅ PASS

---

## Round 3 (Final — All Critic Fixes) 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 10/10 | `SET LOCAL work_mem = '512MB'` 구체화. HNSW params `m=16, ef_construction=64` + 스케일링 가이드. pg_dump 명령어 전문 포함. 모든 값 구체적. |
| D2 완전성 | 25% | 9/10 | 양 테이블 커버, Go/No-Go 양쪽 검증, pagination(LIMIT 500), 롤백 플랜, agent_memories 스코프 명시, 테스트 6항목(idempotency+lock 포함). |
| D3 정확성 | 15% | 9/10 | 인덱스명, `vector_dims()`, SQL syntax, HNSW defaults 전부 정확. |
| D4 실행가능성 | 10% | 9/10 | SQL 8-step copy-paste, SET LOCAL scoped, pg_dump 명령어, pagination 패턴, rollback path 구체적. |
| D5 일관성 | 15% | 9/10 | E18 완전 충족. embedAllDocuments의 BATCH_MAX_DOCS=500 패턴 재사용. naming convention 일관. |
| D6 리스크 | 25% | 9/10 | pg_dump 롤백, advisory lock, idempotent rerun, sequential HNSW, work_mem scoped(auto-reset), TRUNCATE ephemeral, staging-first. 거의 모든 리스크 경로 커버. |

## 가중 평균: 9.10/10 ✅ PASS (FINAL)

계산: (10×0.10) + (9×0.25) + (9×0.15) + (9×0.10) + (9×0.15) + (9×0.25) = 1.0 + 2.25 + 1.35 + 0.9 + 1.35 + 2.25 = 9.10

## 이슈 목록

### 🔴 CRITICAL (블로커)

**1. [D2 완전성] `semantic_cache.query_embedding` VECTOR(768) 미처리 — 배포 즉시 장애**

- `engine/semantic-cache.ts:13` imports `getEmbedding` from `voyage-embedding.ts`
- Story 22.2 이후 `getEmbedding()` returns 1024d vectors
- `semantic_cache.query_embedding` column is `VECTOR(768)` (migration 0051, schema.ts:1888)
- `saveToSemanticCache()` → `getEmbedding()` → 1024d → `insertSemanticCache()` → `INSERT INTO semantic_cache ... query_embedding = ${vectorStr}::vector` → **PG ERROR: expected 768 dimensions, got 1024**
- `findSemanticCache()` 도 동일: 쿼리 embedding 1024d를 768d 컬럼과 cosine distance 비교 → 실패
- **수정 필요:** 0061 migration에 `semantic_cache.query_embedding` 도 `VECTOR(768)→VECTOR(1024)` ALTER + HNSW index rebuild 추가. schema.ts:1888도 `dimensions: 1024`로 변경.

**2. [D3 정확성] 기존 HNSW 인덱스명 불일치**

- 0049 migration에서 생성한 인덱스명: `knowledge_docs_embedding_idx` (NOT `knowledge_docs_embedding_hnsw_idx`)
- Story의 SQL 패턴 (line 143): `DROP INDEX IF EXISTS knowledge_docs_embedding_hnsw_idx` — 이 인덱스 없음
- `DROP INDEX IF EXISTS`라 에러는 안 나지만 **기존 인덱스가 삭제되지 않고 남음** → 1024d 컬럼에 768d HNSW 인덱스 잔존 → 쿼리 성능 문제 또는 에러
- **수정:** `DROP INDEX IF EXISTS knowledge_docs_embedding_idx` (실제 인덱스명 사용)

### 🟡 HIGH

**3. [D2 완전성] `agent_memories.embedding` 컬럼 확인 필요**

- architecture.md Sprint 3에 `agent_memories` 확장 (`memoryType='reflection' + embedding VECTOR(1024)`)이 언급됨
- 아직 해당 테이블이 없을 수 있지만, 이미 존재한다면 별도 migration 대상인지 확인 필요

**4. [D6 리스크] Re-embedding 부분 실패 시 recovery 미정의**

- 500개 docs 중 300개 성공 후 API quota 소진 또는 서버 crash 시:
  - 300개는 1024d embedding, 200개는 NULL
  - 스크립트 재실행하면 `WHERE embedding IS NULL AND is_active = true` 로 나머지만 처리 가능한가? → `embedAllDocuments`는 그렇지만, 새 스크립트(Task 3)는 `WHERE is_active = true` (ALL docs, not just NULL)로 쿼리 — 이미 성공한 300개를 재embed하게 됨
  - **수정:** re-embedding 스크립트를 `WHERE embedding IS NULL AND is_active = true`로 변경하여 idempotent하게 만들어야 함

**5. [D6 리스크] 동시 migration 실행 방지 없음**

- re-embedding 스크립트가 여러 인스턴스에서 동시 실행되면 중복 API 호출 + race condition
- `pg_try_advisory_lock(hashtext('migrate-embeddings-1024'))` 같은 lock 필요

### 🟢 LOW

**6. [D1 구체성] HNSW work_mem 구체 값 미지정**

- "temporary increase may help" → 실제 `SET work_mem = '256MB'` 같은 구체적 값과 RESET 타이밍 필요

**7. [D6 리스크] AC-4 Go/No-Go #10 verification SQL 정확성**

- `array_length(embedding, 1) != 1024` — pgvector의 `vector` 타입에서 `array_length()`가 작동하는지 검증 필요
- pgvector vector는 PostgreSQL 배열이 아님 — `vector_dims(embedding) != 1024`가 올바른 함수
- **수정:** `SELECT count(*) FROM knowledge_docs WHERE vector_dims(embedding) != 1024`

## Cross-talk 요약

- **Winston (Critic-A):** semantic_cache는 **지금 바로 깨져있는 live bug** (Story 22.2 이후 getEmbedding()이 1024d 반환 → saveToSemanticCache catch로 silent fail → 모든 쿼리 LLM 직접 히트 → 비용 폭증). `array_length()` false-pass 확인 — NULL != 1024 → NULL → count에서 제외 → 거짓 통과.
- **John (Critic-C):** HNSW dual-table rebuild 메모리 우려 (knowledge_docs ~2GB + semantic_cache). 평가: semantic_cache는 ephemeral 소량 데이터(24h TTL)로 인덱스 빌드 ~수MB — sequential 실행이면 4GB 내 안전. 단, migration SQL에 순서 보장 코멘트 필요. 롤백 플랜 부재도 지적 — pre-migration DB snapshot/backup 필수 문서화 필요.

## 테스트 관점 추가 요구사항

1. **Migration SQL 테스트**: `semantic_cache` 컬럼 변경 포함해야 함
2. **Idempotency 테스트**: 스크립트를 2번 실행해도 안전한지 검증
3. **Partial failure 테스트**: 50% 성공 후 중단 → 재실행 시 나머지만 처리되는지
4. **Concurrent execution 테스트**: advisory lock이 중복 실행 방지하는지
5. **semantic_cache 연동 테스트**: migration 후 `saveToSemanticCache()` + `checkSemanticCache()` 정상 작동 확인
