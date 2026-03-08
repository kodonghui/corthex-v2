# Story 17.1: 작전일지 API (검색/필터/북마크)

Status: review

## Story

As a CEO/Human 직원,
I want 작전일지에서 과거 명령 이력을 검색하고 북마크할 수 있기를,
so that 중요한 작전 이력을 빠르게 찾아보고 나중에 다시 참조할 수 있다.

## Acceptance Criteria

1. **작전일지 목록 API**: 모든 명령(commands)을 페이지네이션으로 조회할 수 있다
   - 커서 기반 페이지네이션 지원 (기존 activity-log와 동일 패턴)
   - 오프셋 기반 페이지네이션도 함께 지원 (page/limit)
   - 응답에 명령 텍스트, 상태, 유형, 대상 에이전트명, 결과 요약, 비용 합산, 품질 점수 포함

2. **전문 검색**: 명령 텍스트, 결과 텍스트에서 키워드 검색 (ilike)
   - 한글/영문 모두 동작
   - 검색어 SQL 인젝션 방지 (기존 escaped 패턴 사용)

3. **다축 필터링**:
   - 날짜 범위 (startDate, endDate)
   - 에이전트 ID (targetAgentId)
   - 부서 ID (departmentId) — 에이전트 조인 필요
   - 명령 유형 (type: direct, mention, slash, preset, batch, all, sequential, deepwork)
   - 상태 (status: pending, processing, completed, failed, cancelled)
   - 품질 점수 범위 (minScore, maxScore) — qualityReviews 조인 필요

4. **정렬 옵션**:
   - date (기본값, 최신순)
   - qualityScore (품질 점수순)
   - cost (비용순)
   - duration (소요 시간순)

5. **북마크 CRUD**:
   - 북마크 추가: POST /bookmarks (commandId, note)
   - 북마크 삭제: DELETE /bookmarks/:id
   - 북마크 목록: GET /bookmarks (페이지네이션)
   - 북마크 노트 수정: PATCH /bookmarks/:id
   - 이미 북마크된 명령 재등록 시 409 Conflict
   - companyId + userId 격리 필수

6. **CSV 내보내기**: GET /operation-log/export
   - 현재 필터 조건 적용된 데이터를 CSV 형식 JSON으로 반환
   - 최대 1000건 제한

7. **테넌트 격리**: 모든 쿼리에 companyId 조건 자동 적용
8. **직원 부서 범위**: departmentScopeMiddleware 적용으로 직원은 소속 부서 데이터만 조회

## Tasks / Subtasks

- [x] Task 1: DB 스키마 - bookmarks 테이블 (AC: #5)
  - [x] 1.1 schema.ts에 bookmarks 테이블 추가
  - [x] 1.2 마이그레이션 파일 0037_bookmarks-table.sql 생성
  - [x] 1.3 relations 설정

- [x] Task 2: 작전일지 서비스 레이어 (AC: #1, #2, #3, #4)
  - [x] 2.1 operation-log-service.ts 생성
  - [x] 2.2 getOperationLogs() — 다중 테이블 조인 (commands + agents + qualityReviews + costRecords)
  - [x] 2.3 검색 구현 (ilike 텍스트 검색)
  - [x] 2.4 필터 구현 (날짜, 에이전트, 부서, 유형, 상태, 품질 점수)
  - [x] 2.5 정렬 구현 (date, qualityScore, cost, duration)
  - [x] 2.6 페이지네이션 (커서 + 오프셋 지원)

- [x] Task 3: 북마크 서비스 레이어 (AC: #5)
  - [x] 3.1 bookmark-service.ts 생성
  - [x] 3.2 addBookmark() — 중복 검사 포함
  - [x] 3.3 removeBookmark() — 소유권 확인
  - [x] 3.4 listBookmarks() — 페이지네이션
  - [x] 3.5 updateBookmarkNote()

- [x] Task 4: 라우트 레이어 (AC: #1~#8)
  - [x] 4.1 operation-log.ts 라우트 파일 생성 (workspace/operation-log)
  - [x] 4.2 GET /operation-log — 작전일지 목록
  - [x] 4.3 GET /operation-log/export — CSV 내보내기
  - [x] 4.4 POST /operation-log/bookmarks — 북마크 추가
  - [x] 4.5 GET /operation-log/bookmarks — 북마크 목록
  - [x] 4.6 PATCH /operation-log/bookmarks/:id — 노트 수정
  - [x] 4.7 DELETE /operation-log/bookmarks/:id — 북마크 삭제

- [x] Task 5: index.ts 라우터 등록 (AC: 모두)
  - [x] 5.1 operationLogRoute import + 라우트 등록

## Dev Notes

### 핵심 아키텍처 패턴 (기존 코드 참조)

**API 응답 패턴**: `{ success: true, data }` / `{ success: false, error: { code, message } }`

**서비스 레이어 패턴**: `packages/server/src/services/activity-log-service.ts` 참조
- PaginationParams 타입과 parsePaginationParams() 재사용
- parseDateFilter() 재사용
- PaginatedResult<T> 타입 재사용
- SQL 인젝션 방지: `search.replace(/[%_\\]/g, '\\$&')`

**라우트 패턴**: `packages/server/src/routes/workspace/activity-log.ts` 참조
- authMiddleware + departmentScopeMiddleware 사용
- tenant 객체에서 companyId, userId, departmentIds 가져옴
- departmentIds가 빈 배열이면 빈 결과 반환 (직원 범위 제한)

**DB 스키마 패턴**: `packages/server/src/db/schema.ts`
- 모든 테이블에 companyId 필수
- uuid 타입 PK, defaultRandom()
- timestamp defaultNow()
- 인덱스 명명: `{table}_company_idx`, `{table}_company_{col}_idx`

### 데이터 모델: bookmarks 테이블

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  command_id UUID NOT NULL REFERENCES commands(id),
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX bookmarks_company_user_idx ON bookmarks(company_id, user_id);
CREATE UNIQUE INDEX bookmarks_company_user_command_idx ON bookmarks(company_id, user_id, command_id);
```

### 다중 조인 쿼리 전략

작전일지 목록은 여러 테이블을 조인해야 함:
- `commands` (기본)
- `agents` (에이전트 이름, 부서 ID — targetAgentId로 조인)
- `qualityReviews` (품질 점수 — commandId로 조인, 가장 최신 1건)
- `costRecords` (비용 합산 — 서브쿼리로 sum)
- `orchestrationTasks` (소요 시간 합산 — 서브쿼리로 sum durationMs)

**성능 고려**: qualityReviews와 costRecords는 서브쿼리(subquery)로 처리. 전체 JOIN은 데이터 뻥튀기 위험.

### 정렬 구현

```typescript
// 정렬 매핑
const sortOptions = {
  date: desc(commands.createdAt),       // 기본
  qualityScore: desc(avgScoreSubquery), // 품질 점수 서브쿼리
  cost: desc(costSumSubquery),          // 비용 합산 서브쿼리
  duration: desc(durationSumSubquery),  // 소요 시간 서브쿼리
}
```

### CSV 내보내기

- JSON 배열로 반환 (프론트에서 CSV 변환)
- 필드: id, text, type, status, agentName, departmentName, qualityScore, cost, duration, createdAt, completedAt
- 최대 1000건

### Project Structure Notes

- 서비스 파일: `packages/server/src/services/operation-log-service.ts`
- 북마크 서비스: `packages/server/src/services/bookmark-service.ts`
- 라우트 파일: `packages/server/src/routes/workspace/operation-log.ts`
- 마이그레이션: `packages/server/src/db/migrations/0037_bookmarks-table.sql`
- 스키마: `packages/server/src/db/schema.ts` (bookmarks 테이블 추가)
- 엔트리: `packages/server/src/index.ts` (라우트 등록)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic17] E17-S1 작전일지 API
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#11] 작전일지 기능 스펙
- [Source: _bmad-output/planning-artifacts/prd.md#FR71] 작전일지 FR
- [Source: packages/server/src/services/activity-log-service.ts] 서비스 레이어 패턴
- [Source: packages/server/src/routes/workspace/activity-log.ts] 라우트 패턴
- [Source: packages/server/src/db/schema.ts#commands] 명령 테이블 스키마
- [Source: packages/server/src/db/schema.ts#costRecords] 비용 기록 테이블
- [Source: packages/server/src/db/schema.ts#qualityReviews] 품질 리뷰 테이블

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- bookmarks 테이블 스키마 + 마이그레이션 (unique constraint 포함)
- operation-log-service: 다중 조인 쿼리 (commands + agents + departments + qualityReviews + orchestrationTasks + bookmarks)
- bookmark-service: CRUD 4개 (add/remove/update/list) + 중복 방지 + 소유권 확인
- 7개 API 엔드포인트: list, export, detail, bookmark CRUD
- 8가지 필터 + 4가지 정렬 + 페이지네이션
- 66 unit tests 전체 통과

### File List

- packages/server/src/db/schema.ts (수정 - bookmarks table + relations)
- packages/server/src/db/migrations/0037_bookmarks-table.sql (신규)
- packages/server/src/services/operation-log-service.ts (신규)
- packages/server/src/services/bookmark-service.ts (신규)
- packages/server/src/routes/workspace/operation-log.ts (신규)
- packages/server/src/index.ts (수정 - route 등록)
- packages/server/src/__tests__/unit/operation-log.test.ts (신규 - 66 tests)
