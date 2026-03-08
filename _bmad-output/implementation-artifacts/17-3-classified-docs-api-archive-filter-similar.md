# Story 17.3: 기밀문서 API (아카이브/필터/유사 문서)

Status: done

## Story

As a CEO/Human 직원,
I want 완료된 보고서를 기밀문서로 아카이브하고, 부서별·등급별로 필터링하며, 유사 문서를 검색할 수 있기를,
so that 중요 보고서를 체계적으로 보관·분류하고, 과거 유사 분석을 빠르게 찾아 의사결정 품질을 높일 수 있다.

## Acceptance Criteria

1. **아카이브 생성 API**: `POST /workspace/archive`
   - 완료된 명령(commands.status='completed')의 결과를 기밀문서로 아카이브
   - 필수 필드: commandId, title, classification (public/internal/confidential/secret)
   - 선택 필드: summary, tags[], folderId
   - 이미 아카이브된 commandId는 409 Conflict 반환
   - 아카이브 시 commands 테이블의 result, metadata, 품질 리뷰 점수를 자동 복사

2. **아카이브 목록 API**: `GET /workspace/archive`
   - 페이지네이션 (page/limit, 기본 20개)
   - 필터: classification, departmentId, agentId, startDate, endDate, tags, folderId, search(제목+요약 텍스트 검색)
   - 정렬: date(기본), classification, qualityScore
   - 각 항목: id, title, classification, summary(truncate 200자), agentName, departmentName, qualityScore, tags, createdAt
   - 응답: `{ success: true, data: { items, page, limit, total } }`

3. **아카이브 상세 API**: `GET /workspace/archive/:id`
   - 전체 내용: title, classification, content(마크다운), summary, tags, agentName, departmentName, qualityScore, qualityReview 상세, costRecords, delegationChain, 원본 commandId, createdAt
   - 하단에 "유사 문서" 목록 포함 (최대 5개)

4. **아카이브 수정 API**: `PATCH /workspace/archive/:id`
   - 수정 가능: title, classification, summary, tags[], folderId
   - content(원본 결과)는 수정 불가 (감사 추적)

5. **아카이브 삭제 API**: `DELETE /workspace/archive/:id`
   - soft delete (deletedAt 타임스탬프)
   - 삭제된 문서는 목록에서 제외 (필터로 복원 가능하도록 includeDeleted 파라미터 지원)

6. **유사 문서 검색 API**: `GET /workspace/archive/:id/similar`
   - 현재 문서와 유사한 문서 5개 반환
   - 유사도 계산: 동일 에이전트 + 동일 부서 + 태그 겹침 + 명령 유형 일치 기반 점수화
   - 각 항목에 similarityScore(0~100) 포함
   - 텍스트 기반 유사도: commands.text의 키워드 매칭 (pg_trgm 없이 간단한 LIKE 기반)

7. **폴더 관리 API**:
   - `GET /workspace/archive/folders` — 폴더 목록 (트리 구조)
   - `POST /workspace/archive/folders` — 폴더 생성 { name, parentId? }
   - `PATCH /workspace/archive/folders/:id` — 폴더 이름 변경
   - `DELETE /workspace/archive/folders/:id` — 빈 폴더만 삭제 (하위 문서 있으면 409)

8. **통계 API**: `GET /workspace/archive/stats`
   - 총 문서 수, 등급별 분포, 부서별 분포, 최근 7일 아카이브 수

## Tasks / Subtasks

- [x] Task 1: DB 스키마 확장 (AC: #1, #5, #7)
  - [x] 1.1 `archive_items` 테이블 생성: id, companyId, commandId(unique), userId, title, classification, content, summary, tags(jsonb), folderId, qualityScore, agentId, departmentId, metadata(jsonb), createdAt, updatedAt, deletedAt
  - [x] 1.2 `archive_folders` 테이블 생성: id, companyId, name, parentId(self-ref), createdAt, updatedAt
  - [x] 1.3 Drizzle 마이그레이션 생성 (`0044_archive-items-folders.sql`)
  - [x] 1.4 relations 정의 (archive_items ↔ commands, agents, departments, folders)

- [x] Task 2: archive-service.ts 구현 (AC: #1~#6, #8)
  - [x] 2.1 `createArchiveItem()` — commands 조인으로 result/metadata/quality 자동 복사, 중복 체크
  - [x] 2.2 `getArchiveItems()` — 필터/정렬/페이지네이션 (operation-log-service 패턴 재사용)
  - [x] 2.3 `getArchiveDetail()` — 상세 + qualityReview + delegationChain + similar docs
  - [x] 2.4 `updateArchiveItem()` — title, classification, summary, tags, folderId만 수정
  - [x] 2.5 `softDeleteArchiveItem()` — deletedAt 설정
  - [x] 2.6 `findSimilarDocuments()` — 동일 agent/dept/tags/type 기반 유사도 점수 계산
  - [x] 2.7 `getArchiveStats()` — 통계 집계 쿼리

- [x] Task 3: archive-folder-service.ts 구현 (AC: #7)
  - [x] 3.1 `listFolders()` — 트리 구조 반환 (메모리 트리 빌드)
  - [x] 3.2 `createFolder()` — parentId 유효성 검증
  - [x] 3.3 `renameFolder()` — 이름 변경
  - [x] 3.4 `deleteFolder()` — 하위 문서/폴더 있으면 409

- [x] Task 4: 라우트 등록 (AC: #1~#8)
  - [x] 4.1 `packages/server/src/routes/workspace/archive.ts` — 11개 엔드포인트
  - [x] 4.2 `packages/server/src/index.ts`에 라우트 등록
  - [x] 4.3 authMiddleware + departmentScopeMiddleware 적용

- [x] Task 5: 공유 타입 정의 (AC: 전체)
  - [x] 5.1 `packages/shared/src/types.ts`에 ArchiveItem, ArchiveFolder, ArchiveStats, Classification 타입 추가

## Dev Notes

### 핵심 패턴 참조 (기존 코드)

**operation-log-service.ts 패턴 재사용** (`packages/server/src/services/operation-log-service.ts`):
- 동일한 commands + agents + departments + qualityReviews 조인 패턴
- buildQualitySubquery() 함수 — 품질 점수 계산 로직 그대로 활용
- buildCostSubquery() 함수 — 비용 집계 로직
- 필터/정렬/페이지네이션 패턴 (parsePaginationParams, parseDateFilter)
- getOperationDetail()의 delegationChain 조회 패턴

**bookmark-service.ts CRUD 패턴** (`packages/server/src/services/bookmark-service.ts`):
- 간단한 CRUD + companyId 격리 패턴
- unique constraint 처리 (409 Conflict)

**operation-log 라우트 패턴** (`packages/server/src/routes/workspace/operation-log.ts`):
- authMiddleware + departmentScopeMiddleware 적용 방식
- tenant.companyId, tenant.userId, tenant.departmentIds 활용
- 쿼리 파라미터 파싱 패턴

**knowledge 라우트 패턴** (`packages/server/src/routes/workspace/knowledge.ts`):
- 폴더 관리 CRUD 패턴 (16-1, 16-2에서 구현)
- 트리 구조 반환 패턴

### DB 스키마 설계

```typescript
// archive_folders 테이블
export const archiveFolders = pgTable('archive_folders', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 200 }).notNull(),
  parentId: uuid('parent_id'), // self-ref (null = root)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  companyIdx: index('archive_folders_company_idx').on(table.companyId),
}))

// archive_items 테이블
export const archiveItems = pgTable('archive_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  commandId: uuid('command_id').notNull().references(() => commands.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 500 }).notNull(),
  classification: varchar('classification', { length: 50 }).notNull().default('internal'),
    // public | internal | confidential | secret
  content: text('content'), // 원본 result 마크다운
  summary: text('summary'), // 사용자가 작성하는 요약
  tags: jsonb('tags').$type<string[]>().default([]),
  folderId: uuid('folder_id').references(() => archiveFolders.id),
  qualityScore: real('quality_score'), // 아카이브 시점의 품질 점수 (스냅샷)
  agentId: uuid('agent_id').references(() => agents.id),
  departmentId: uuid('department_id').references(() => departments.id),
  commandType: varchar('command_type', { length: 50 }), // direct, mention, slash, etc.
  commandText: text('command_text'), // 원본 명령 텍스트 (유사 문서 검색용)
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // soft delete
}, (table) => ({
  companyIdx: index('archive_items_company_idx').on(table.companyId),
  commandIdx: uniqueIndex('archive_items_command_unique').on(table.companyId, table.commandId),
  classificationIdx: index('archive_items_classification_idx').on(table.companyId, table.classification),
  folderIdx: index('archive_items_folder_idx').on(table.companyId, table.folderId),
}))
```

### 유사 문서 검색 알고리즘

pg_trgm 없이 간단한 점수 기반 유사도:

```typescript
function calculateSimilarity(source: ArchiveItem, candidate: ArchiveItem): number {
  let score = 0
  // 동일 에이전트: +30
  if (source.agentId && source.agentId === candidate.agentId) score += 30
  // 동일 부서: +25
  if (source.departmentId && source.departmentId === candidate.departmentId) score += 25
  // 동일 명령 유형: +15
  if (source.commandType === candidate.commandType) score += 15
  // 태그 겹침: 겹치는 태그 수 * 10 (최대 30)
  const commonTags = source.tags.filter(t => candidate.tags.includes(t))
  score += Math.min(commonTags.length * 10, 30)
  return Math.min(score, 100)
}
```

대부분의 필터링은 SQL WHERE로 처리하고 (동일 companyId, deletedAt IS NULL, 자기 자신 제외), 유사도 점수 계산은 애플리케이션 레벨에서 수행. 후보 제한(최근 100건 중 같은 부서/에이전트)으로 성능 확보.

### API 응답 타입

```typescript
type Classification = 'public' | 'internal' | 'confidential' | 'secret'

type ArchiveItem = {
  id: string
  title: string
  classification: Classification
  summary: string | null
  content: string | null // 목록에서는 null, 상세에서만 포함
  tags: string[]
  folderId: string | null
  folderName: string | null
  agentName: string | null
  departmentName: string | null
  qualityScore: number | null
  commandType: string
  createdAt: string
}

type ArchiveDetail = ArchiveItem & {
  content: string | null
  commandId: string
  commandText: string
  delegationChain: DelegationStep[]
  qualityReview: QualityReviewDetail | null
  costRecords: CostRecord[]
  similarDocuments: SimilarDocument[]
}

type SimilarDocument = {
  id: string
  title: string
  classification: Classification
  summary: string | null
  agentName: string | null
  qualityScore: number | null
  similarityScore: number // 0~100
  createdAt: string
}

type ArchiveFolder = {
  id: string
  name: string
  parentId: string | null
  children: ArchiveFolder[]
  documentCount: number
}

type ArchiveStats = {
  totalDocuments: number
  byClassification: Record<Classification, number>
  byDepartment: { departmentId: string; departmentName: string; count: number }[]
  recentWeekCount: number
}
```

### Project Structure Notes

**신규 파일:**
- `packages/server/src/services/archive-service.ts` — 아카이브 비즈니스 로직
- `packages/server/src/services/archive-folder-service.ts` — 폴더 관리
- `packages/server/src/routes/workspace/archive.ts` — 라우트 (11개 엔드포인트)
- `packages/server/src/db/migrations/0044_archive-items-folders.sql` — 마이그레이션

**수정 파일:**
- `packages/server/src/db/schema.ts` — archiveItems, archiveFolders 테이블 + relations 추가
- `packages/server/src/index.ts` — archiveRoute 등록
- `packages/shared/src/types.ts` — ArchiveItem, ArchiveFolder, Classification 타입 추가

**참조 파일 (패턴 복사):**
- `packages/server/src/services/operation-log-service.ts` — 필터/정렬/페이지네이션 + 품질/비용 서브쿼리
- `packages/server/src/services/bookmark-service.ts` — CRUD 패턴
- `packages/server/src/routes/workspace/operation-log.ts` — 라우트 구조
- `packages/server/src/routes/workspace/knowledge.ts` — 폴더 관리 라우트 패턴

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic17] E17-S3 기밀문서 API (아카이브/필터/유사 문서), 2 SP, FR72
- [Source: _bmad-output/planning-artifacts/prd.md#FR72] CEO/Human 직원은 기밀문서에 보고서를 아카이브하고 유사 문서를 검색할 수 있다
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#12] 기밀문서: 보고서 저장소, 부서별/등급별 필터, 유사 문서 찾기
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Screen12] 기밀문서: 폴더 트리 + 문서 뷰어 + 등급 뱃지 + 유사 문서 추천 사이드바
- [Source: packages/server/src/services/operation-log-service.ts] 작전일지 서비스 — 필터/조인/페이지네이션 패턴
- [Source: packages/server/src/routes/workspace/operation-log.ts] 작전일지 라우트 구조
- [Source: packages/server/src/db/schema.ts] commands, qualityReviews, orchestrationTasks 테이블
- [Source: _bmad-output/implementation-artifacts/17-2-operation-log-ui-ab-compare-replay.md] 이전 스토리 학습

### 이전 스토리 학습 (17-1, 17-2)

- operation-log-service.ts의 다중 조인 패턴 (commands + agents + departments + qualityReviews)
- buildQualitySubquery() / buildCostSubquery() 서브쿼리 빌더 재사용 가능
- parsePaginationParams(), parseDateFilter() 유틸 재사용
- 8가지 필터 + 4가지 정렬 구현 완료 — 동일 패턴으로 archive 필터 구현
- authMiddleware + departmentScopeMiddleware로 tenant 격리 + 부서 범위 제한
- soft delete 패턴은 기존 agents 테이블의 isActive 방식보다 deletedAt 타임스탬프가 적합
- 66개 유닛 테스트 + 72개 UI 테스트 통과 (regression 없음 확인)

### v1 코드 참고

v1(`/home/ubuntu/CORTHEX_HQ/`)의 기밀문서 기능을 반드시 참고할 것:
- 보고서 저장소 구현 방식
- 부서별/등급별 필터 로직
- 유사 문서 correlation 알고리즘
- v1에서 동작했던 기능은 v2에서도 반드시 동작해야 함

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- archive_items 테이블: commandId unique index, classification enum (4등급), soft delete (deletedAt), quality score 스냅샷
- archive_folders 테이블: self-referencing parentId로 중첩 폴더 구조
- archive-service.ts: createArchiveItem (중복체크 + completed만 허용 + quality/agent/dept 자동 복사), getArchiveItems (8가지 필터 + 3가지 정렬 + 페이지네이션), getArchiveDetail (delegationChain + qualityReview + similar docs), updateArchiveItem (title/classification/summary/tags/folderId만), softDeleteArchiveItem, findSimilarDocuments (agent+dept+type+tags 기반 점수화, 최대 5개), getArchiveStats (총 문서 수, 등급별, 부서별, 7일간)
- archive-folder-service.ts: listFolders (트리 빌드 + documentCount), createFolder (parentId 검증), renameFolder, deleteFolder (하위 항목 있으면 409)
- archive.ts route: 11개 엔드포인트 (GET/POST/PATCH/DELETE archive + folders + stats + similar)
- shared types: Classification, ArchiveItem, ArchiveDetail, SimilarDocument, ArchiveFolder, ArchiveStats
- 55개 유닛 테스트 통과, 기존 66개 operation-log 테스트 regression 없음

### File List

- packages/server/src/db/schema.ts (수정 — archiveItems, archiveFolders, classificationEnum, relations 추가)
- packages/server/src/db/migrations/0044_archive-items-folders.sql (신규)
- packages/server/src/services/archive-service.ts (신규)
- packages/server/src/services/archive-folder-service.ts (신규)
- packages/server/src/routes/workspace/archive.ts (신규)
- packages/server/src/index.ts (수정 — archiveRoute import + 등록)
- packages/shared/src/types.ts (수정 — Archive 타입 추가)
- packages/server/src/__tests__/unit/archive-service.test.ts (신규 — 55 tests)
- packages/server/src/__tests__/unit/archive-tea.test.ts (신규 — 62 TEA tests)
- packages/server/src/__tests__/unit/archive-qa.test.ts (신규 — 29 QA tests)
