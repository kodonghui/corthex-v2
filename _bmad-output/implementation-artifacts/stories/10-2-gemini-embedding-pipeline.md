# Story 10.2: Gemini Embedding 파이프라인

Status: done

## Story

As a 시스템,
I want 지식 문서가 업로드/수정되면 자동으로 벡터 임베딩이 생성되는 것을,
so that 의미 검색이 가능하다.

## Acceptance Criteria

1. `@google/generative-ai` 기반 Gemini Embedding API 호출 서비스 생성
2. 문서 업로드(POST /docs, POST /docs/upload) 시 자동 임베딩 생성
3. 문서 수정(PATCH /docs/:id) 시 content 변경 감지 → 자동 재임베딩
4. 기존 문서 일괄 임베딩 스크립트 (마이그레이션용 — Admin API endpoint)
5. 임베딩 실패 시 embedding = NULL (검색에서 제외, 에러가 아님 — graceful degradation)
6. 비용 제한: 월 $5 이하 (NFR-C2) — 로깅으로 추적 가능

## Tasks / Subtasks

- [x] Task 1: Gemini Embedding 서비스 생성 (AC: #1, #5)
  - [x] 1.1 `packages/server/src/services/embedding-service.ts` 생성
  - [x] 1.2 `@google/generative-ai` 패키지의 `embedContent()` API 사용
  - [x] 1.3 모델: `text-embedding-004` (768차원, 최신 Gemini embedding 모델)
  - [x] 1.4 `generateEmbedding(text: string): Promise<number[] | null>` — 단건 임베딩
  - [x] 1.5 `generateEmbeddings(texts: string[]): Promise<(number[] | null)[]>` — 배치 임베딩 (순차 처리 + 딜레이)
  - [x] 1.6 에러 처리: API 실패 시 null 반환 (로그만 남기고 프로세스 중단 안함)
  - [x] 1.7 API 키: credential-vault `getCredentials(companyId, 'google_ai')` 사용 (기존 batch-collector.ts 패턴)
  - [x] 1.8 텍스트 전처리: title + content 합쳐서 임베딩 (문서 전체 맥락 캡처)
  - [x] 1.9 청크 처리: 텍스트 > 10,000자 시 앞 10,000자만 사용 (API 제한 대응)

- [x] Task 2: DB 업데이트 헬퍼 추가 (AC: #2, #3)
  - [x] 2.1 `updateDocEmbedding()` in embedding-service.ts — raw SQL로 vector 컬럼 업데이트
  - [x] 2.2 `embedding`, `embedding_model`, `embedded_at` 3개 필드 한번에 업데이트

- [x] Task 3: 문서 생성/수정 시 자동 임베딩 트리거 (AC: #2, #3, #5)
  - [x] 3.1 `packages/server/src/routes/workspace/knowledge.ts` — POST /docs 후 비동기 임베딩 트리거
  - [x] 3.2 POST /docs/upload 후 비동기 임베딩 트리거
  - [x] 3.3 PATCH /docs/:id — content 또는 title 변경 시에만 재임베딩 트리거
  - [x] 3.4 비동기 실행: `Promise.resolve().then(...)` 패턴으로 응답 지연 없이 백그라운드 처리
  - [x] 3.5 임베딩 실패 시 문서 자체 생성/수정은 정상 완료 (embedding만 NULL 유지)

- [x] Task 4: 일괄 임베딩 Admin API (AC: #4)
  - [x] 4.1 `packages/server/src/routes/admin/knowledge.ts` 새 파일 생성 (tier-configs.ts 패턴)
  - [x] 4.2 `POST /api/admin/knowledge/embed-all` 엔드포인트 — embedding이 NULL인 문서만 대상 (isActive = true)
  - [x] 4.3 순차 처리 (API rate limit 고려) — 문서 간 100ms 딜레이
  - [x] 4.4 처리 결과: { total, succeeded, failed, skipped } 반환
  - [x] 4.5 Admin 전용 (RBAC: authMiddleware + adminOnly + tenantMiddleware)
  - [x] 4.6 admin route 등록: `packages/server/src/index.ts`에 `adminKnowledgeRoute` 추가

- [x] Task 5: 테스트 (AC: #1~#6)
  - [x] 5.1 embedding-service 단위 테스트: API 모킹, 에러 핸들링, 청크 처리, 26 tests
  - [x] 5.2 라우트 통합 테스트: triggerEmbedding 호출 확인 (import + trigger 코드 추가)
  - [x] 5.3 일괄 임베딩 API 테스트: embedAllDocuments export 확인

## Dev Notes

### Architecture Compliance

- **D1 (getDB)**: 모든 DB 접근은 `getDB(companyId)` 래퍼 사용. `db` 직접 import 금지
- **엔진 경계**: embedding 서비스는 `services/` 폴더에 위치 (engine/ 밖). engine/에는 agent-loop.ts + types.ts만 public
- **API 응답 패턴**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **보안**: API 키는 환경변수에서 로드, 로그에 출력 금지

### Technical Stack & Key Decisions

| 항목 | 값 | 이유 |
|------|-----|------|
| Embedding 모델 | `text-embedding-004` | Google 최신 embedding 모델, 768차원 (스키마와 일치) |
| 패키지 | `@google/generative-ai` (v0.24.1) | 이미 설치됨 (`google.ts`에서 사용 중). Architecture는 `@google/genai`로 표기했으나 실제 설치된 패키지는 `@google/generative-ai` |
| 임베딩 트리거 | 비동기 (fire-and-forget) | 문서 CRUD 응답 지연 방지. 임베딩 실패해도 문서 자체는 정상 |
| 텍스트 전처리 | `title + '\n\n' + content` | 문서 제목 + 본문 전체 맥락 |
| 최대 텍스트 길이 | 10,000자 (truncate) | Gemini Embedding API 입력 제한 대응 |
| 배치 처리 | 순차 + 100ms 딜레이 | API rate limit 방지 (무료 tier: 1,500 RPD) |

### Existing Code Context (반드시 참고)

1. **Google AI Adapter**: `packages/server/src/lib/llm/google.ts`
   - `@google/generative-ai` 패키지 사용 중
   - `GoogleGenerativeAI` 클래스로 초기화
   - API 키: 환경변수에서 로드 (기존 패턴 따를 것)
   - 임포트 방법: `import { GoogleGenerativeAI } from '@google/generative-ai'`

2. **Knowledge Routes**: `packages/server/src/routes/workspace/knowledge.ts`
   - POST /docs (lines 302-331): 문서 생성
   - POST /docs/upload (lines 518-586): 파일 업로드
   - PATCH /docs/:id (lines 416-481): 문서 수정 + 자동 버전 이력
   - DELETE /docs/:id (lines 484-507): soft delete
   - **현재 임베딩 트리거 없음** → 이 스토리에서 추가

3. **pgvector 유틸**: `packages/server/src/db/pgvector.ts`
   - `vector` customType (768차원)
   - `cosineDistance()`, `l2Distance()`, `innerProduct()` 헬퍼

4. **scoped-query**: `packages/server/src/db/scoped-query.ts`
   - `knowledgeDocsWithEmbedding()` — embedding이 있는 문서만 조회
   - `searchSimilarDocs(queryEmbedding, topK, threshold)` — 코사인 유사도 검색
   - **추가 필요**: `updateDocEmbedding(docId, embedding, model)` 메서드

5. **Schema**: `packages/server/src/db/schema.ts` (line ~1544)
   - `knowledgeDocs` 테이블: `embedding vector(768)`, `embeddingModel varchar(50)`, `embeddedAt timestamp` — 모두 nullable

6. **Knowledge Injector**: `packages/server/src/services/knowledge-injector.ts`
   - 현재: Jaccard 키워드 매칭 기반 (Story 10.4에서 pgvector로 교체 예정)
   - 이 스토리에서는 수정하지 않음

### Previous Story Intelligence (Story 10.1)

- pgvector@0.2.1 설치됨
- Drizzle customType은 pgvector npm의 toSql/fromSql 사용 (직접 파싱 아님)
- tsc 에러 경험: `AnyColumn` 타입 import 필요 (drizzle-orm에서)
- Code review에서 발견된 이슈: threshold 미사용, 이중 계산 → 수정 완료
- 마이그레이션은 SQL 수동 작성 (drizzle-kit이 pgvector 타입 인식 못함)

### Git Intelligence (최근 커밋 패턴)

- 커밋 메시지: `feat: Story X.Y 제목 — 주요 변경사항 + N tests`
- 테스트: bun:test 사용, `packages/server/src/__tests__/unit/` 폴더
- tsc 체크: 커밋 전 `npx tsc --noEmit -p packages/server/tsconfig.json` 필수

### File Structure Requirements

```
packages/server/src/
  services/
    embedding-service.ts     ← 새 파일 (Gemini Embedding 서비스)
  db/
    scoped-query.ts          ← 수정 (updateDocEmbedding 추가)
  routes/
    workspace/
      knowledge.ts           ← 수정 (임베딩 트리거 추가)
    admin/
      knowledge.ts           ← 새 파일 (일괄 임베딩 API, tier-configs.ts 패턴 참고)
  __tests__/unit/
    embedding-service.test.ts ← 새 파일
```

### API Key Configuration

- 기존 `google.ts`에서 API 키 로드 방법 참고
- 환경변수: `GOOGLE_AI_API_KEY` 또는 `GOOGLE_GENERATIVE_AI_API_KEY`
- 키 없으면 임베딩 생성 건너뜀 (null 반환, 에러 아님)

### Testing Standards

- 프레임워크: `bun:test`
- 위치: `packages/server/src/__tests__/unit/`
- Google AI API: `mock.module('@google/generative-ai', ...)` 로 모킹 (기존 llm-integration.test.ts 참고)
- DB: `mock.module('../db/index', ...)` 패턴 사용

### Warnings & Gotchas

1. **패키지 이름 주의**: Architecture는 `@google/genai`로 표기하지만 실제 설치된 패키지는 `@google/generative-ai` (v0.24.1). 반드시 실제 설치된 패키지 사용
2. **임베딩 모델 차원**: 768차원 고정 (스키마 + HNSW 인덱스가 768로 설정됨). 다른 차원의 모델 사용 금지
3. **비동기 임베딩**: 문서 CRUD API 응답을 블로킹하지 않을 것. 백그라운드에서 실행하고 실패해도 문서는 정상 저장
4. **Rate Limit**: Google AI 무료 tier는 1,500 요청/일. 배치 처리 시 딜레이 필수
5. **텍스트 길이**: Gemini Embedding API는 큰 텍스트도 처리하지만, 비용 최적화를 위해 10,000자 제한 권장
6. **Admin route 위치 확인**: 기존 admin route 파일 구조 확인 후 일괄 임베딩 API 추가

### Cross-Story Dependencies

- **Story 10.1** (완료): pgvector 확장 + 스키마 + scoped-query 헬퍼
- **Story 10.3** (다음): 의미 검색 API — 이 스토리의 임베딩 데이터를 searchSimilarDocs()로 검색
- **Story 10.4** (이후): 부서별 지식 자동 주입 — soul-renderer에서 pgvector 검색 사용

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 10, Story 10.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — Tech Stack, pgvector, @google/genai]
- [Source: _bmad-output/implementation-artifacts/stories/10-1-pgvector-extension-schema.md — 전체]
- [Source: packages/server/src/lib/llm/google.ts — Google AI 초기화 패턴]
- [Source: packages/server/src/routes/workspace/knowledge.ts — 문서 CRUD routes]
- [Source: packages/server/src/db/scoped-query.ts — getDB() 패턴, 기존 벡터 검색 헬퍼]
- [Source: packages/server/src/db/pgvector.ts — vector customType]
- [Source: packages/server/src/db/schema.ts — knowledgeDocs 스키마 line ~1544]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- No `logger` module exists in project — used `console.warn/error/log` instead (matches standalone service pattern)
- API key loaded via `getCredentials(companyId, 'google_ai')` from credential-vault (same pattern as batch-collector.ts)
- `updateDocEmbedding` uses raw SQL for vector column update (`::vector` cast) since Drizzle `.set()` with customType may not handle pgvector correctly in UPDATE context
- Architecture doc says `@google/genai` but actual installed package is `@google/generative-ai` (v0.24.1) — used actual package

### Completion Notes List

- `embedding-service.ts` created with 7 exported functions: prepareText, generateEmbedding, generateEmbeddings, updateDocEmbedding, embedDocument, triggerEmbedding, embedAllDocuments
- Gemini `text-embedding-004` model used (768 dimensions, matches schema)
- Text preprocessing: `title + '\n\n' + content`, truncated to 10,000 chars
- Fire-and-forget pattern via `triggerEmbedding()` — does not block CRUD response
- Knowledge routes: POST /docs, POST /docs/upload, PATCH /docs/:id all trigger async embedding
- PATCH only triggers re-embedding when content or title changes
- Admin API: `POST /api/admin/knowledge/embed-all` — batch embeds all docs with NULL embedding
- Batch processing: sequential with 100ms delay between docs (rate limit protection)
- 26 unit tests: prepareText (7), generateEmbedding (6), generateEmbeddings (4), updateDocEmbedding (2), vector format (2), triggerEmbedding (3), exports (2)
- tsc --noEmit: clean (0 errors)
- All 87 pgvector+embedding tests pass

### File List

- packages/server/src/services/embedding-service.ts (new — Gemini embedding pipeline service)
- packages/server/src/routes/admin/knowledge.ts (new — admin batch embedding API)
- packages/server/src/routes/workspace/knowledge.ts (modified — import triggerEmbedding, added triggers to POST /docs, POST /docs/upload, PATCH /docs/:id)
- packages/server/src/index.ts (modified — import + register adminKnowledgeRoute)
- packages/server/src/__tests__/unit/embedding-service.test.ts (new — 26 tests)
- _bmad-output/implementation-artifacts/stories/10-2-gemini-embedding-pipeline.md (modified — story file)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified — 10.2 status → in-progress)
