# Story 10.1: pgvector 확장 설치 + 스키마

Status: done

## Story

As a 시스템,
I want PostgreSQL에 pgvector 확장이 설치되고 벡터 컬럼이 추가되는 것을,
so that 의미 기반 유사도 검색이 가능하다.

## Acceptance Criteria

1. `CREATE EXTENSION IF NOT EXISTS vector` 마이그레이션에서 실행
2. `knowledge_docs` 테이블에 `embedding vector(768)` 컬럼 추가 (Gemini Embedding 768차원)
3. NULL 허용 — 기존 문서는 점진적으로 임베딩 (임베딩 없는 문서 = 기존 LIKE 검색으로 fallback)
4. Drizzle ORM 마이그레이션 파일 생성 (SQL 수동 작성 — pgvector 커스텀 타입)
5. `pgvector` npm 패키지 설치 + Drizzle ORM customType 연동 확인
6. IVFFlat 또는 HNSW 인덱스 생성 (cosine similarity 용)
7. 단위 테스트: 벡터 컬럼 스키마 정의 + 커스텀 타입 직렬화/역직렬화

## Tasks / Subtasks

- [x] Task 1: pgvector npm 패키지 설치 (AC: #5)
  - [x] 1.1 `bun add pgvector` in packages/server — pgvector@0.2.1 installed
  - [x] 1.2 패키지 import 확인 (toSql, fromSql 유틸)

- [x] Task 2: Drizzle ORM customType 정의 (AC: #5, #7)
  - [x] 2.1 `packages/server/src/db/pgvector.ts` 생성 — Drizzle `customType` for `vector(768)`
  - [x] 2.2 toDriver (number[] → SQL string `[0.1,0.2,...]`) 변환
  - [x] 2.3 fromDriver (SQL string → number[]) 변환
  - [x] 2.4 단위 테스트: 직렬화/역직렬화 왕복 검증

- [x] Task 3: knowledge_docs 스키마에 embedding 컬럼 추가 (AC: #2, #3)
  - [x] 3.1 `packages/server/src/db/schema.ts` — knowledgeDocs 테이블에 `embedding` 필드 추가
  - [x] 3.2 NULL 허용 (no .notNull() — nullable by default)
  - [x] 3.3 `embeddingModel` varchar(50) 컬럼 추가 (어떤 모델로 임베딩했는지 추적)
  - [x] 3.4 `embeddedAt` timestamp 컬럼 추가 (마지막 임베딩 시각)

- [x] Task 4: SQL 마이그레이션 파일 수동 작성 (AC: #1, #4, #6)
  - [x] 4.1 `packages/server/src/db/migrations/0049_pgvector-extension.sql` 생성
  - [x] 4.2 `CREATE EXTENSION IF NOT EXISTS vector;`
  - [x] 4.3 `ALTER TABLE knowledge_docs ADD COLUMN embedding vector(768);`
  - [x] 4.4 `ALTER TABLE knowledge_docs ADD COLUMN embedding_model varchar(50);`
  - [x] 4.5 `ALTER TABLE knowledge_docs ADD COLUMN embedded_at timestamp;`
  - [x] 4.6 HNSW 인덱스: `CREATE INDEX knowledge_docs_embedding_idx ON knowledge_docs USING hnsw (embedding vector_cosine_ops);`
  - [x] 4.7 마이그레이션 메타 파일 (`_journal.json`) 업데이트

- [x] Task 5: scoped-query 확장 (AC: #2)
  - [x] 5.1 `getDB(companyId).knowledgeDocsWithEmbedding()` 메서드 추가 (embedding 포함 쿼리)
  - [x] 5.2 유사도 검색 헬퍼: `searchSimilarDocs(embedding, topK, threshold)` 추가

- [x] Task 6: 테스트 (AC: #7)
  - [x] 6.1 customType 직렬화/역직렬화 단위 테스트
  - [x] 6.2 스키마 정의 유효성 테스트 (embedding 컬럼 존재, NULL 허용 확인)
  - [x] 6.3 pgvector 유틸 함수 테스트 (toSql, fromSql, cosine distance SQL 생성)

## Dev Notes

### Architecture Compliance

- **D1 (getDB)**: 모든 비즈니스 로직은 `getDB(companyId)` 통해서만 DB 접근. `db` 직접 import는 마이그레이션/시드/시스템 쿼리에서만 허용
- **DB**: PostgreSQL + pgvector (동일 서버). Architecture에서 이미 pgvector 확장 사용 확인됨
- **Drizzle ORM**: `drizzle-orm/pg-core` 사용 중. pgvector는 네이티브 지원 없으므로 `customType` 사용
- **마이그레이션**: SQL 수동 작성 (drizzle-kit generate가 pgvector 타입 인식 못함). `packages/server/src/db/migrations/` 폴더에 순번 파일 추가
- **NFR-D4**: 벡터 NULL 허용 — 기존 문서는 점진적 임베딩 (무중단 마이그레이션)

### Technical Stack

| 항목 | 값 |
|------|-----|
| PostgreSQL | 동일 서버 (Oracle VPS ARM64) |
| pgvector 확장 | `CREATE EXTENSION vector` (서버에 이미 설치되어 있어야 함) |
| npm 패키지 | `pgvector` (벡터 직렬화/역직렬화 유틸) |
| Drizzle ORM | customType으로 vector(768) 정의 |
| 임베딩 차원 | 768 (Gemini Embedding) |
| 인덱스 | HNSW (cosine similarity) — IVFFlat보다 검색 성능 우수, 빌드 약간 느림 |

### Existing Code Context

1. **스키마**: `packages/server/src/db/schema.ts` — `knowledgeDocs` 테이블 (line ~1543)
   - 현재 컬럼: id, companyId, folderId, title, content, contentType, fileUrl, tags, createdBy, updatedBy, isActive, createdAt, updatedAt
   - 인덱스: company_idx, folder_idx, created_by_idx

2. **scoped-query**: `packages/server/src/db/scoped-query.ts` — `getDB(companyId).knowledgeDocs()` 이미 존재

3. **knowledge-injector**: `packages/server/src/services/knowledge-injector.ts` — 현재 Jaccard 키워드 매칭 기반. Story 10.4에서 pgvector로 교체 예정

4. **knowledge route**: `packages/server/src/routes/workspace/knowledge.ts` — CRUD 엔드포인트

5. **DB 연결**: `packages/server/src/db/index.ts` — `postgres` 패키지 + `drizzle-orm/postgres-js`

6. **마이그레이션**: 최신 = `0048_tier-configs-table.sql`. 다음 번호 = `0049`

### HNSW vs IVFFlat 결정

- **HNSW** 선택 이유:
  - 검색 시 더 높은 정확도 (recall)
  - 동적 데이터에 적합 (문서 추가/삭제 빈번)
  - 빌드 시간이 조금 더 걸리지만, 문서 수가 수천~수만 수준이라 무시 가능
  - IVFFlat은 클러스터 기반이라 데이터가 적을 때 효과 떨어짐

### pgvector Drizzle customType 패턴

```typescript
// packages/server/src/db/pgvector.ts
import { customType } from 'drizzle-orm/pg-core'

export const vector = customType<{
  data: number[]
  driverData: string
  config: { dimensions: number }
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 768})`
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`
  },
  fromDriver(value: string): number[] {
    return value
      .replace('[', '')
      .replace(']', '')
      .split(',')
      .map(Number)
  },
})
```

### Migration SQL Pattern

```sql
-- 0049_pgvector-extension.sql
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE knowledge_docs ADD COLUMN embedding vector(768);
ALTER TABLE knowledge_docs ADD COLUMN embedding_model varchar(50);
ALTER TABLE knowledge_docs ADD COLUMN embedded_at timestamp;

CREATE INDEX knowledge_docs_embedding_idx
  ON knowledge_docs USING hnsw (embedding vector_cosine_ops);
```

### Project Structure Notes

- 새 파일: `packages/server/src/db/pgvector.ts` (customType 정의)
- 수정 파일: `packages/server/src/db/schema.ts` (embedding 컬럼 추가)
- 수정 파일: `packages/server/src/db/scoped-query.ts` (유사도 검색 헬퍼)
- 새 파일: `packages/server/src/db/migrations/0049_pgvector-extension.sql`
- 새 파일: `packages/server/src/__tests__/unit/pgvector-schema.test.ts`
- 패키지 추가: `pgvector` in packages/server/package.json

### Warnings & Gotchas

1. **pgvector 확장이 서버에 설치되어 있어야 함**: `apt install postgresql-16-pgvector` 또는 이미 설치 확인 필요. Neon PostgreSQL을 사용하는 경우 pgvector가 기본 제공됨.
2. **drizzle-kit generate 사용 불가**: pgvector customType은 drizzle-kit이 인식 못함 → SQL 마이그레이션 수동 작성
3. **마이그레이션 journal 파일 업데이트 필수**: `packages/server/src/db/migrations/meta/_journal.json`에 새 엔트리 추가
4. **postgres-js 드라이버 호환**: `postgres` 패키지는 pgvector 타입을 문자열로 반환 → customType의 fromDriver가 파싱 담당
5. **ARM64 호환**: Oracle VPS ARM64에서 pgvector 확장 빌드 가능 확인 (대부분 패키지 매니저에서 사전 빌드 제공)
6. **인덱스 크기**: 768차원 × 문서 수 × 4바이트 = 문서 1만개 기준 ~30MB (메모리 영향 미미)

### Cross-Story Dependencies

- **Story 10.2** (Gemini Embedding 파이프라인): 이 스토리의 embedding 컬럼에 실제 벡터 데이터 삽입
- **Story 10.3** (의미 검색 API): scoped-query의 searchSimilar 헬퍼 활용
- **Story 10.4** (부서별 지식 자동 주입): soul-renderer에서 pgvector 검색 사용

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 10, Story 10.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — D1 getDB, Tech Stack pgvector]
- [Source: packages/server/src/db/schema.ts — knowledgeDocs table line ~1543]
- [Source: packages/server/src/db/scoped-query.ts — getDB().knowledgeDocs()]
- [Source: packages/server/src/db/index.ts — DB connection + migration runner]
- [Source: packages/server/src/db/migrations/ — existing migration files, next = 0049]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Initial tsc error: cosineDistance param type was `ReturnType<typeof vector>` (builder) instead of `AnyColumn` (column). Fixed by importing AnyColumn from drizzle-orm.

### Completion Notes List

- pgvector@0.2.1 installed — uses toSql/fromSql from pgvector/utils
- Drizzle customType in pgvector.ts wraps pgvector npm utils (no custom parsing logic)
- 3 SQL distance helpers: cosineDistance (<=>), l2Distance (<->), innerProduct (<#>)
- Schema: 3 new columns on knowledge_docs — embedding vector(768), embedding_model varchar(50), embedded_at timestamp — all nullable
- Migration 0049: CREATE EXTENSION vector + ALTER TABLE + HNSW index (vector_cosine_ops)
- scoped-query: knowledgeDocsWithEmbedding() + searchSimilarDocs(queryEmbedding, topK, threshold)
- 28 tests: toSql/fromSql roundtrip, 768-dim vector, null handling, schema column existence, nullable checks, migration file content, journal entry
- tsc --noEmit: clean (0 errors)

### Code Review (2026-03-11)

**Issues Found:** 2 Medium, 1 Low — All fixed automatically.

1. **[MEDIUM] searchSimilarDocs threshold param unused** (scoped-query.ts:115) — `threshold` was accepted but not applied as WHERE filter. Fixed: added `sql\`${dist} < ${threshold}\`` to WHERE clause.
2. **[MEDIUM] Double cosineDistance computation** (scoped-query.ts:122,130) — cosineDistance called twice (SELECT + ORDER BY), generating vector string redundantly. Fixed: extracted to `const dist` variable, reused in SELECT, WHERE, and ORDER BY.
3. **[LOW] fromSql null cast** (pgvector.ts:25) — pgvectorFromSql can return null but `as number[]` cast hides it. Accepted risk: Drizzle's fromDriver is only called for non-null DB values, so null case won't occur in practice.

### File List

- packages/server/package.json (modified — pgvector@0.2.1 dependency added)
- packages/server/src/db/pgvector.ts (new — Drizzle customType + distance helpers)
- packages/server/src/db/schema.ts (modified — import vector, 3 embedding columns on knowledgeDocs)
- packages/server/src/db/scoped-query.ts (modified — knowledgeDocsWithEmbedding + searchSimilarDocs)
- packages/server/src/db/migrations/0049_pgvector-extension.sql (new — CREATE EXTENSION + ALTER TABLE + HNSW index)
- packages/server/src/db/migrations/meta/_journal.json (modified — idx 49 entry)
- packages/server/src/__tests__/unit/pgvector-schema.test.ts (new — 28 tests)
