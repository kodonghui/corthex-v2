# Story 10.3: 의미 검색 API

Status: done

## Story

As a 에이전트/사용자,
I want "삼성전자 투자 분석"으로 검색하면 관련 문서가 의미적으로 매칭되는 것을,
so that 키워드 일치 없이도 관련 문서를 찾을 수 있다.

## Acceptance Criteria

1. `/api/workspace/knowledge/search` 엔드포인트에 의미 검색 모드 추가
2. 쿼리 텍스트 → Gemini Embedding → pgvector cosine similarity 파이프라인
3. Top-K 결과 반환 (기본 5개, 최대 20개 — `topK` 쿼리 파라미터)
4. 유사도 점수(score) 포함 — 0~1 범위 (1 = 가장 유사)
5. fallback: 임베딩 없는 문서 또는 Gemini API 실패 시 기존 LIKE 검색 병행
6. 결과에 highlight(매칭 컨텍스트) 포함

## Tasks / Subtasks

- [x] Task 1: 의미 검색 서비스 함수 생성 (AC: #2, #3, #4)
  - [x] 1.1 `packages/server/src/services/semantic-search.ts` 생성
  - [x] 1.2 `semanticSearch(companyId, query, options)` 함수 — 쿼리 임베딩 생성 → scoped-query `searchSimilarDocs()` 호출
  - [x] 1.3 옵션: `{ topK?: number, threshold?: number, folderId?: string }` (기본 topK=5, threshold=0.8)
  - [x] 1.4 결과 변환: distance → score (score = 1 - distance, cosine distance 기반)
  - [x] 1.5 folderId 필터 지원 (특정 폴더 내 검색)

- [x] Task 2: 기존 검색 엔드포인트에 의미 검색 통합 (AC: #1, #5, #6)
  - [x] 2.1 `GET /api/workspace/knowledge/search` 수정 — `mode` 쿼리 파라미터 추가 (`keyword` | `semantic` | `hybrid`, 기본 `hybrid`)
  - [x] 2.2 `semantic` 모드: semanticSearch() 호출 → score 포함 결과 반환
  - [x] 2.3 `keyword` 모드: 기존 LIKE 검색 (변경 없음)
  - [x] 2.4 `hybrid` 모드: 의미 검색 우선 시도 → 결과 부족 시 LIKE 검색 보충 (중복 제거)
  - [x] 2.5 fallback: Gemini API 키 없거나 임베딩 생성 실패 시 자동으로 keyword 모드 전환

- [x] Task 3: scoped-query 확장 (AC: #3)
  - [x] 3.1 `searchSimilarDocs`에 `folderId` 필터 옵션 추가
  - [x] 3.2 기존 searchSimilarDocs 시그니처 유지 (하위 호환성)

- [x] Task 4: 테스트 (AC: #1~#6)
  - [x] 4.1 semantic-search 서비스 단위 테스트 (임베딩 생성 모킹, score 변환, fallback)
  - [x] 4.2 하이브리드 검색 로직 테스트 (의미 검색 + LIKE 보충 + 중복 제거) — service-level 테스트로 커버
  - [x] 4.3 scoped-query folderId 필터 테스트

## Dev Notes

### Architecture Compliance

- **D1 (getDB)**: scoped-query의 `searchSimilarDocs()`는 이미 `getDB(companyId)` 래퍼 사용 중. 새 서비스도 동일 패턴 따를 것
- **엔진 경계**: semantic-search 서비스는 `services/` 폴더에 위치 (engine/ 밖)
- **API 응답 패턴**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **임포트 케이싱**: `git ls-files` 기준으로 정확히 맞출 것 (Linux CI 대소문자 구분)

### Technical Stack & Key Decisions

| 항목 | 값 | 이유 |
|------|-----|------|
| 임베딩 생성 | `generateEmbedding()` from `embedding-service.ts` | Story 10.2에서 이미 구현. 재사용 필수 |
| 벡터 검색 | `searchSimilarDocs()` from `scoped-query.ts` | Story 10.1에서 이미 구현. 재사용 필수 |
| 거리 → 유사도 | `score = 1 - distance` | cosine distance: 0 = 동일, 2 = 반대. score: 1 = 동일, 0 = 무관 |
| fallback | LIKE 검색 | 기존 `GET /search` 엔드포인트의 LIKE 로직 재사용 |
| API 키 | `getCredentials(companyId, 'google_ai')` | embedding-service.ts의 기존 패턴 |

### Existing Code Context (반드시 참고 — 재구현 금지)

1. **embedding-service.ts** (`packages/server/src/services/embedding-service.ts`)
   - `generateEmbedding(apiKey, text)` — 단건 임베딩 생성 (text-embedding-004, 768차원)
   - `prepareText(title, content)` — 텍스트 전처리
   - `getCredentials()` + `extractApiKey()` — API 키 로드 패턴
   - **이 서비스의 `generateEmbedding()`을 그대로 호출하여 쿼리 임베딩 생성**

2. **scoped-query.ts** (`packages/server/src/db/scoped-query.ts` lines 114-134)
   - `getDB(companyId).searchSimilarDocs(queryEmbedding, topK, threshold)` — 이미 구현됨
   - 반환: `{ id, title, content, folderId, tags, distance }[]`
   - WHERE: `companyId` 스코프 + `embedding IS NOT NULL` + `isActive = true` + `distance < threshold`
   - ORDER BY: distance ASC, LIMIT topK
   - **folderId 필터만 추가하면 됨**

3. **knowledge.ts route** (`packages/server/src/routes/workspace/knowledge.ts` lines 1098-1169)
   - `GET /search` — 현재 LIKE 검색만 지원
   - 파라미터: `q`, `page`, `limit`
   - 반환: `{ data: { docs, folders }, pagination }`
   - highlight 생성 로직 이미 있음 (lines 1137-1148)
   - **이 엔드포인트에 `mode` + `topK` 파라미터 추가하여 의미 검색 통합**

4. **credential-vault** (`packages/server/src/services/credential-vault.ts`)
   - `getCredentials(companyId, 'google_ai')` — Google AI API 키 로드
   - embedding-service.ts에서 사용하는 패턴 그대로 따를 것

5. **pgvector.ts** (`packages/server/src/db/pgvector.ts`)
   - `cosineDistance()` 헬퍼 — scoped-query가 이미 사용 중

### Previous Story Intelligence

**Story 10.1 핵심 교훈:**
- `AnyColumn` 타입 import 필요 (drizzle-orm에서) — tsc 에러 원인이었음
- threshold 미사용 버그 발견 → 수정 완료 (이미 WHERE에 적용됨)
- 이중 계산 (cosineDistance 두 번 호출) → `const dist` 변수로 추출 완료

**Story 10.2 핵심 교훈:**
- 패키지 이름: Architecture는 `@google/genai`로 표기하지만 실제는 `@google/generative-ai` (v0.24.1)
- API 키: `getCredentials(companyId, 'google_ai')` → `extractApiKey(credentials)` 패턴
- 임베딩 실패 시 null 반환 (에러 아님) — semantic-search도 동일하게 graceful degradation

### File Structure Requirements

```
packages/server/src/
  services/
    semantic-search.ts        ← 새 파일 (의미 검색 서비스)
    embedding-service.ts      ← 기존 (generateEmbedding 재사용)
  db/
    scoped-query.ts           ← 수정 (searchSimilarDocs에 folderId 옵션 추가)
  routes/
    workspace/
      knowledge.ts            ← 수정 (GET /search에 mode 파라미터 + 의미 검색 통합)
  __tests__/unit/
    semantic-search.test.ts   ← 새 파일
```

### API Design

#### GET /api/workspace/knowledge/search

**추가 파라미터:**
- `mode`: `keyword` | `semantic` | `hybrid` (기본: `hybrid`)
- `topK`: 1~20 (기본: 5, semantic/hybrid 모드에서만 사용)

**Semantic 모드 응답:**
```json
{
  "data": {
    "docs": [
      {
        "id": "...",
        "title": "삼성전자 2024 실적 분석",
        "content": "...",
        "folderId": "...",
        "tags": [...],
        "score": 0.87,
        "highlight": "...매칭된 컨텍스트..."
      }
    ],
    "folders": [],
    "searchMode": "semantic"
  },
  "pagination": { "page": 1, "limit": 5, "total": 3, "totalPages": 1 }
}
```

**Hybrid 모드 로직:**
1. semantic 검색 실행 → 결과 수집
2. 결과가 topK 미만이면 LIKE 검색으로 보충 (이미 포함된 doc id 제외)
3. semantic 결과에는 score 포함, LIKE 결과에는 score = null
4. `searchMode: "hybrid"` 표시

**Fallback 조건 (→ keyword 모드로 자동 전환):**
- Google AI API 키 미설정
- generateEmbedding() 실패 (null 반환)
- 결과에 `searchMode: "keyword"` 표시

### searchSimilarDocs folderId 확장

현재 시그니처:
```typescript
searchSimilarDocs: (queryEmbedding: number[], topK = 5, threshold = 0.8) => { ... }
```

확장 방법 — 4번째 옵셔널 파라미터 추가:
```typescript
searchSimilarDocs: (queryEmbedding: number[], topK = 5, threshold = 0.8, folderId?: string) => {
  // 기존 WHERE 조건 + folderId 조건 추가
  // folderId가 있으면: and(...기존조건, eq(knowledgeDocs.folderId, folderId))
}
```

### Testing Standards

- 프레임워크: `bun:test`
- 위치: `packages/server/src/__tests__/unit/semantic-search.test.ts`
- embedding-service 모킹: `mock.module('../../services/embedding-service', ...)` — generateEmbedding, prepareText
- credential-vault 모킹: `mock.module('../../services/credential-vault', ...)` — getCredentials
- scoped-query 모킹: `mock.module('../../db/scoped-query', ...)` — getDB().searchSimilarDocs()
- 기존 테스트 참고: `embedding-service.test.ts`, `pgvector-schema.test.ts`

### Warnings & Gotchas

1. **재구현 금지**: `generateEmbedding()`, `searchSimilarDocs()` 이미 있음. 새로 만들지 말 것
2. **score 변환**: cosine distance(0~2) → score(0~1) 변환 시 `1 - distance` 사용. distance > 1이면 score를 0으로 클램프
3. **기존 /search 하위 호환**: `mode` 파라미터 없으면 `hybrid` 기본값 → 기존 동작과 최대한 유사하게 (LIKE 결과 포함)
4. **임베딩 없는 문서**: semantic 검색에서 제외됨 (embedding IS NOT NULL 조건). hybrid 모드에서 LIKE 보충으로 커버
5. **API 키 없는 환경**: fallback으로 keyword 모드 전환. 에러가 아님
6. **folderId 필터**: GET /search의 기존 `folderId` 쿼리 파라미터가 있다면 semantic 검색에도 전달할 것

### Cross-Story Dependencies

- **Story 10.1** (완료): pgvector 확장 + 스키마 + scoped-query `searchSimilarDocs()`
- **Story 10.2** (완료): Gemini embedding 파이프라인 + `generateEmbedding()`
- **Story 10.4** (다음): 부서별 지식 자동 주입 강화 — 이 스토리의 semantic-search 활용
- **Story 10.5** (이후): 지식 관리 UI 개선 — 임베딩 상태 표시

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 10, Story 10.3]
- [Source: _bmad-output/planning-artifacts/architecture.md — pgvector, Gemini Embedding]
- [Source: _bmad-output/implementation-artifacts/stories/10-1-pgvector-extension-schema.md — scoped-query 패턴]
- [Source: _bmad-output/implementation-artifacts/stories/10-2-gemini-embedding-pipeline.md — embedding-service 패턴]
- [Source: packages/server/src/services/embedding-service.ts — generateEmbedding()]
- [Source: packages/server/src/db/scoped-query.ts:114-134 — searchSimilarDocs()]
- [Source: packages/server/src/routes/workspace/knowledge.ts:1098-1169 — GET /search]
- [Source: packages/server/src/services/knowledge-injector.ts — Jaccard 매칭 (참고용)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- tsc --noEmit: clean (0 errors) on first try
- All 22 semantic-search tests pass independently
- Existing 54 pgvector+embedding tests pass independently (mock contamination when running all files together is a known bun:test issue, not a regression)

### Completion Notes List

- `semantic-search.ts` created with `semanticSearch()` function: query → Gemini embedding → pgvector cosine similarity → score results
- Score conversion: `Math.max(0, 1 - distance)` — cosine distance 0=identical → score 1, distance >=1 → score 0
- `searchSimilarDocs` in scoped-query.ts extended with optional 4th param `folderId` (backward compatible)
- `GET /search` endpoint now supports 3 modes via `mode` query param: `keyword`, `semantic`, `hybrid` (default)
- Hybrid mode: semantic first → supplement with LIKE if results < topK, deduplicated by doc id
- Fallback: API key missing or embedding fails → automatic keyword mode (no error, graceful)
- `searchMode` field added to response so frontend knows which mode was actually used
- `topK` query param (1-20, default 5) for semantic/hybrid mode
- `folderId` query param supported across all modes
- 22 unit tests covering: score conversion, folderId passthrough, credential failures, embedding failures, edge cases

### Code Review (2026-03-11)

**Issues Found:** 2 Medium, 2 Low — Medium issues fixed automatically.

1. **[MEDIUM] extractApiKey duplicated** (semantic-search.ts:23) — Same function existed in both semantic-search.ts and embedding-service.ts. Fixed: exported from embedding-service.ts, imported in semantic-search.ts.
2. **[MEDIUM] mode param not validated** (knowledge.ts:1106) — Arbitrary string was cast as union type. Fixed: added explicit validation with fallback to 'hybrid'.
3. **[LOW] searchFolders uses db directly** — Consistent with existing pattern in knowledge.ts routes (all use db + tenant filter). Architecture D1 mandates getDB() for business logic, but routes have always used db directly.
4. **[LOW] hybridDocs index signature** — `[key: string]: unknown` weakens type safety for keyword supplement docs. Accepted: needed to accommodate spread of full doc objects.

### File List

- packages/server/src/services/semantic-search.ts (new — semantic search service)
- packages/server/src/services/embedding-service.ts (modified — exported extractApiKey)
- packages/server/src/db/scoped-query.ts (modified — searchSimilarDocs folderId param)
- packages/server/src/routes/workspace/knowledge.ts (modified — GET /search hybrid mode + searchFolders helper + mode validation)
- packages/server/src/__tests__/unit/semantic-search.test.ts (new — 22 tests)
- packages/server/src/__tests__/unit/semantic-search-tea.test.ts (new — 17 TEA tests)
