# Story 6.6: 작전일지 P2 보강 — 페이지네이션 + 검색 + 통계 개선

Status: review

## Story

As a 사용자,
I want 작전일지에서 100건 이상의 로그를 무한스크롤로 보고, 검색하고, 통계를 시각적으로 확인한다,
so that 과거 활동을 효율적으로 추적하고 패턴을 파악할 수 있다.

## Acceptance Criteria

1. **Given** 작전일지 100건 이상 **When** 스크롤 하단 도달 **Then** 추가 로그 자동 로드 (cursor 페이지네이션)
2. **Given** 검색 입력 **When** 300ms 디바운스 후 **Then** action/detail 필드에서 검색 결과 표시
3. **Given** GET /activity-log **When** search 파라미터 전달 **Then** ILIKE 검색 결과 반환
4. **Given** 요약 통계 섹션 **When** 표시 **Then** 오늘/이번주 타입별 카운트를 시각적 바 차트로 표시
5. **Given** 타임라인 아이템 **When** 클릭 **Then** 상세 정보 확장 (metadata JSON 표시)
6. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: API cursor 페이지네이션 (AC: #1, #3)
  - [x] cursor(createdAt) + search(ILIKE) + nextCursor 반환

- [x] Task 2: 무한스크롤 + 검색 UI (AC: #1, #2)
  - [x] useInfiniteQuery + IntersectionObserver 센티널
  - [x] 검색 입력 (300ms 디바운스)

- [x] Task 3: 통계 시각화 (AC: #4)
  - [x] SummaryChart 컴포넌트 — CSS 바 차트

- [x] Task 4: 아이템 상세 확장 (AC: #5)
  - [x] 클릭 토글 확장 — detail 전문 + metadata JSON

- [x] Task 5: 빌드 검증 (AC: #6) — 3/3 성공

## Dev Notes

### 기존 코드
- `packages/server/src/routes/workspace/activity-log.ts` — 현재 offset 기반, limit max 100
- `packages/app/src/pages/ops-log.tsx` — 현재 useQuery 단일 호출, 100건 고정
- Epic 4 채팅 히스토리(4-4)에서 cursor 페이지네이션 패턴 구현 경험 있음

### cursor 페이지네이션 패턴
```typescript
// API: GET /activity-log?cursor={createdAt}&limit=50&search=검색어
// Response: { data: [...], nextCursor: string | null }
```

### 검색 SQL
```sql
WHERE (action ILIKE '%검색어%' OR detail ILIKE '%검색어%')
```

### References
- [Source: packages/server/src/routes/workspace/activity-log.ts] — 기존 API
- [Source: packages/app/src/pages/ops-log.tsx] — 기존 UI
- [Source: ux-design-specification.md#1407-1486] — 작전일지 스펙

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- API: offset→cursor 페이지네이션, search ILIKE, nextCursor 반환
- UI: useInfiniteQuery + IntersectionObserver 무한스크롤
- 검색: 300ms 디바운스, action/detail 검색
- 통계: SummaryChart CSS 바 차트 (라이브러리 없음)
- 확장: 클릭 토글로 detail 전문 + metadata JSON 표시

### File List
- packages/server/src/routes/workspace/activity-log.ts (MODIFIED)
- packages/app/src/pages/ops-log.tsx (MODIFIED)
