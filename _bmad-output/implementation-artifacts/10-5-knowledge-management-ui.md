# Story 10.5: 지식 관리 UI 개선

Status: done

## Story

As a 관리자,
I want 지식 문서를 부서별로 관리하고 임베딩 상태를 확인하며 의미 검색을 UI에서 사용하는 것을,
so that 효과적으로 지식 베이스를 운영할 수 있다.

## Acceptance Criteria

1. **Given** 문서 목록 **When** 각 문서 행 표시 **Then** 임베딩 상태 배지 표시 — 완료(녹색 체크), 진행 중(노란 스피너), 실패/없음(회색 대시)
2. **Given** 검색 바 **When** 검색 모드 토글 클릭 **Then** keyword / semantic / hybrid 3가지 모드 전환 가능, 기본값 hybrid
3. **Given** semantic/hybrid 검색 결과 **When** 결과 표시 **Then** 유사도 점수(%) 배지와 하이라이트 표시
4. **Given** 문서 상세 보기 **When** 부서 할당 섹션 **Then** 해당 문서의 폴더가 연결된 부서를 표시하고 폴더 변경 가능
5. **Given** 문서 상세 보기 **When** 유사 문서 추천 섹션 **Then** 임베딩 기반 Top-3 유사 문서 목록 표시 (제목 + 유사도 %)
6. **Given** 드래그&드롭 업로드 완료 후 **When** 문서 목록 갱신 **Then** 새 문서의 임베딩 상태가 "진행 중"으로 표시되다가 완료 시 갱신
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 서버 — 문서 목록 API에 임베딩 상태 필드 추가 (AC: #1, #6)
  - [x] `GET /docs` 응답에 `embeddingStatus` 필드 추가: `'done' | 'none'`
  - [x] `GET /docs/:id` 응답에 `embeddedAt`, `embeddingModel`, `embeddingStatus` 필드 추가
  - [x] embedding 벡터 데이터 응답에서 제외 (bandwidth 절약)

- [x] Task 2: 서버 — 유사 문서 추천 API (AC: #5)
  - [x] `GET /docs/:id/similar` — 문서 자체 임베딩으로 유사 문서 Top-3 검색
  - [x] `getDB(companyId).searchSimilarDocs()` 활용, 자기 자신 제외
  - [x] 임베딩 없는 문서는 빈 배열 반환

- [x] Task 3: 프론트엔드 — 문서 목록에 임베딩 상태 배지 (AC: #1, #6)
  - [x] `KnowledgeDoc` 타입에 `embeddingStatus`, `embeddedAt`, `embeddingModel` 추가
  - [x] 문서 테이블에 "임베딩" 열 추가 (done=Badge 녹색, pending=노란, none=대시)

- [x] Task 4: 프론트엔드 — 검색 모드 토글 + 결과 표시 (AC: #2, #3)
  - [x] 3-button 토글 그룹: 혼합 | 의미 | 키워드
  - [x] 검색 시 `/search?q=&mode=` 엔드포인트 호출
  - [x] 유사도 점수 Badge 표시 + 검색 모드 라벨 + 하이라이트

- [x] Task 5: 프론트엔드 — 유사 문서 추천 (AC: #5)
  - [x] DocDetailView 하단에 "유사 문서" 섹션 추가
  - [x] `GET /docs/:id/similar` 호출 (useQuery, staleTime 60초)
  - [x] 카드 형태: 제목 + 유사도 % + 클릭 네비게이션

- [x] Task 6: 프론트엔드 — 부서별 지식 할당 표시 (AC: #4)
  - [x] DocDetailView에 "부서 연결" 정보 표시 (폴더→부서명)
  - [x] 임베딩 상태 상세 표시 (모델명, 임베딩 시각)

- [x] Task 7: 빌드 확인 (AC: #7)
  - [x] `npx tsc --noEmit -p packages/server/tsconfig.json` 성공
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 핵심 설계: 기존 인프라 100% 활용

Story 10.1-10.4에서 구축한 인프라를 프론트엔드에 노출하는 UI 스토리. 새로운 서버 로직은 최소화.

**이미 존재하는 것 (재사용):**
- 드래그&드롭 업로드: `knowledge.tsx:260-292` (handleUploadFiles, handleDrop 등 완성됨)
- 폴더 트리 + 부서 연결: `FolderTree` 컴포넌트 + `departmentId/departmentName` 필드
- 검색 API: `GET /workspace/knowledge/search?q=&mode=&topK=` (3-mode 통합 검색)
- 임베딩 fire-and-forget: `triggerEmbedding()` — 문서 생성/수정 시 자동 호출
- DB 컬럼: `embedding vector(768)`, `embeddingModel varchar(50)`, `embeddedAt timestamp`
- `Badge` 컴포넌트: `@corthex/ui` 패키지

**새로 만들 것:**
- 서버: `GET /docs` 응답에 `embeddingStatus` 파생 필드 추가 (SQL 레벨)
- 서버: `GET /docs/:id/similar` — 문서 자체 벡터로 유사도 검색
- 프론트: 검색 모드 토글 UI
- 프론트: 임베딩 배지 열
- 프론트: 유사 문서 패널
- 프론트: 검색 결과에 점수/하이라이트/모드 표시

### DB 스키마 (이미 존재, 변경 없음)

```sql
-- knowledge_docs 테이블 (10.1에서 추가됨)
embedding vector(768),        -- pgvector, NULL = 미임베딩
embedding_model varchar(50),  -- 'text-embedding-004'
embedded_at timestamp          -- 임베딩 완료 시각
```

### 서버 변경 상세

**`GET /docs` 수정 (packages/server/src/routes/workspace/knowledge.ts:387-399):**

현재 `db.select()`는 모든 컬럼 반환 (embedding 포함). 프론트엔드로 768차원 벡터를 보내는 것은 낭비.
→ 특정 컬럼만 select하거나 응답에서 embedding 제외 + embeddingStatus 파생 필드 추가.

```typescript
// 방법: select 결과에 embeddingStatus 파생
const docs = rawDocs.map(doc => ({
  ...doc,
  embedding: undefined, // 벡터 데이터 제외 (bandwidth 절약)
  embeddingStatus: doc.embeddedAt ? 'done' : 'none',
}))
```

**`GET /docs/:id/similar` 신규:**

```typescript
// 문서 자체 임베딩을 가져와서 searchSimilarDocs 호출
const [doc] = await db.select({ embedding: knowledgeDocs.embedding })
  .from(knowledgeDocs).where(...)
if (!doc?.embedding) return c.json({ data: [] })

const results = await getDB(companyId).searchSimilarDocs(doc.embedding, 3, 0.8)
// 자기 자신 제외
return c.json({ data: results.filter(r => r.id !== docId) })
```

### 프론트엔드 변경 상세

**파일:** `packages/app/src/pages/knowledge.tsx` (67KB, 단일 파일 — 기존 패턴 유지)

**KnowledgeDoc 타입 확장 (line 23-36):**
```typescript
type KnowledgeDoc = {
  // ... 기존 필드
  embeddingStatus?: 'done' | 'pending' | 'none' // 추가
  embeddedAt?: string | null                      // 추가
  embeddingModel?: string | null                   // 추가
}
```

**검색 모드 토글 (line 335 영역):**
- 상태: `const [searchMode, setSearchMode] = useState<'keyword' | 'semantic' | 'hybrid'>('hybrid')`
- 검색 시: `searchMode !== 'hybrid'` 또는 `searchInput`이 있으면 `/search?q=&mode=` 호출
- 검색 결과 타입: `{ docs: Array<{...doc, score, highlight}>, folders, searchMode }`

**유사 문서 패널 (DocDetailView 내부):**
```typescript
const similarQuery = useQuery({
  queryKey: ['knowledge-similar', doc.id],
  queryFn: () => api.get<{ data: Array<{ id: string; title: string; score: number }> }>(
    `/workspace/knowledge/docs/${doc.id}/similar`
  ),
  staleTime: 60_000,
  enabled: !!doc.id,
})
```

### 이전 스토리 학습사항 (10.1~10.4)

- **10.1**: UUID params에 zValidator 필수, pgvector customType은 `packages/server/src/db/pgvector.ts`
- **10.2**: fire-and-forget 임베딩은 `triggerEmbedding(docId, companyId)` — 응답 지연 없음
- **10.3**: 검색 API는 `/workspace/knowledge/search`, `mode` 파라미터로 3모드 지원
- **10.4**: knowledge-injector 서비스에서 semantic search 활용, `clearKnowledgeCache` 호출 패턴
- toast import: `@corthex/ui`에서 가져옴 (sonner 직접 import 금지)
- ConfirmDialog: `isOpen/onConfirm/onCancel/variant="danger"` 패턴

### 파일 구조

```
수정 파일:
  packages/server/src/routes/workspace/knowledge.ts (GET /docs 응답 확장 + /docs/:id/similar 추가)
  packages/app/src/pages/knowledge.tsx (임베딩 배지 + 검색 모드 토글 + 유사 문서 + 부서 표시)

신규 파일:
  없음 (기존 파일 확장만)
```

### 이 스토리에서 하지 않는 것

- 임베딩 재생성 UI (관리자 batch embed는 admin API `/api/admin/knowledge/embed-all`로 이미 존재)
- 임베딩 모델 변경 UI
- 실시간 임베딩 진행률 (WebSocket) — fire-and-forget이므로 새로고침으로 확인
- 폴더-부서 매핑 CRUD (이미 폴더 생성/편집 시 departmentId 설정 가능)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 10.5] — AC 원본
- [Source: packages/server/src/routes/workspace/knowledge.ts:1102-1249] — 검색 API 3모드
- [Source: packages/server/src/services/embedding-service.ts] — triggerEmbedding, embedDocument
- [Source: packages/server/src/services/semantic-search.ts] — semanticSearch()
- [Source: packages/server/src/db/scoped-query.ts] — searchSimilarDocs()
- [Source: packages/server/src/db/pgvector.ts] — cosineDistance operator
- [Source: packages/app/src/pages/knowledge.tsx:260-292] — 기존 드래그&드롭 업로드
- [Source: packages/server/src/db/schema.ts:1545-1567] — knowledge_docs 스키마

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- GET /docs 응답에 embeddingStatus 파생 필드 추가 + embedding 벡터 제거
- GET /docs/:id/similar 신규 엔드포인트: 문서 자체 벡터로 유사 문서 Top-3 검색
- 검색 모드 토글 UI (혼합/의미/키워드) + /search API 연동
- 검색 결과에 유사도 점수(%), 하이라이트, 검색 모드 라벨 표시
- DocDetailView에 유사 문서 패널 + 부서 연결 정보 + 임베딩 상태 상세 추가
- 문서 목록 테이블에 임베딩 상태 배지 열 추가
- getDB import 추가 (scoped-query)
- Badge variant="info" 활용 (기존 UI 라이브러리)
- 23개 단위 테스트 작성 + 전체 통과
- tsc --noEmit 성공, turbo build 3/3 성공

### File List

- packages/server/src/routes/workspace/knowledge.ts (수정: GET /docs embeddingStatus + embedding 제거, GET /docs/:id embeddingStatus, GET /docs/:id/similar 신규)
- packages/app/src/pages/knowledge.tsx (수정: KnowledgeDoc 타입 확장, 임베딩 배지 열, 검색 모드 토글, 유사 문서 패널, 부서 정보)
- packages/server/src/__tests__/unit/knowledge-ui-enhancements.test.ts (신규: 23개 테스트)
