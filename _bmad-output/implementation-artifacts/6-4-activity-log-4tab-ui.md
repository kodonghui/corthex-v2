# Story 6.4: 통신로그 4탭 UI (Activity Log 4-Tab UI)

Status: done

## Story

As a **CEO (김대표)**,
I want **통신로그 화면에서 4개 탭(활동/통신/QA/도구)으로 에이전트 활동, 위임 기록, 품질 검수 결과, 도구 호출 기록을 테이블로 조회하고 필터/검색/페이지네이션을 사용**,
so that **AI 조직의 모든 내부 통신과 활동을 체계적으로 모니터링하고, 비용/품질/성능을 투명하게 파악할 수 있다**.

## Acceptance Criteria

1. **Given** 통신로그 페이지 진입 **When** 화면 로드 **Then** 4개 탭(활동 | 통신 | QA | 도구)이 표시되고, URL search param `?tab=agents`(기본값)으로 탭 상태 관리
2. **Given** 활동 탭 선택 **When** 데이터 로드 **Then** 에이전트 활동 테이블 표시: 시간, 에이전트명, 명령(action), 상태(badge: completed=green, failed=red, in-progress=blue), 소요시간, 토큰 사용량
3. **Given** 통신 탭 선택 **When** 데이터 로드 **Then** 위임 기록 테이블 표시: 시간, 발신(from agent), 수신(to agent) with 화살표(→), 명령 요약, 비용, 토큰
4. **Given** QA 탭 선택 **When** 데이터 로드 **Then** 품질 검수 테이블 표시: 시간, 명령, 총점(/25), 판정(PASS=green, FAIL=red badge), 재작업 횟수. 행 클릭 시 5항목 세부 점수 확장
5. **Given** 도구 탭 선택 **When** 데이터 로드 **Then** 도구 호출 테이블 표시: 시간, 도구명, 에이전트명, 소요시간, 상태(badge), input 요약. 도구명 필터 제공
6. **Given** 모든 탭 **When** 공통 기능 **Then** 날짜 범위 필터(시작/종료), 검색 입력, 페이지네이션(페이지 번호 + 이전/다음), 로딩 스켈레톤, 빈 상태 표시
7. **Given** 모바일/태블릿 뷰 **When** 화면 축소 **Then** 테이블 가로 스크롤, 탭 스냅 스크롤 동작
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 통신로그 페이지 생성 + 라우팅 (AC: #1, #7, #8)
  - [x] 1.1 `packages/app/src/pages/activity-log.tsx` 생성 — 4탭 컨테이너
  - [x] 1.2 App.tsx에 `/activity-log` 라우트 추가 (lazy import)
  - [x] 1.3 sidebar.tsx에 "통신로그" 메뉴 추가 (icon: 📞, path: /activity-log)
  - [x] 1.4 URL search param으로 탭 상태 관리 (`useSearchParams`)

- [x] Task 2: 활동 탭 (AC: #2, #6)
  - [x] 2.1 GET /workspace/activity/agents API 연결 (useQuery)
  - [x] 2.2 테이블: 시간 | 에이전트 | 명령 | 상태(Badge) | 소요시간 | 토큰
  - [x] 2.3 상태 Badge: completed=success, failed=error, working=info variant

- [x] Task 3: 통신 탭 (AC: #3, #6)
  - [x] 3.1 GET /workspace/activity/delegations API 연결
  - [x] 3.2 테이블: 시간 | 발신→수신 | 명령 요약 | 비용 | 토큰

- [x] Task 4: QA 탭 (AC: #4, #6)
  - [x] 4.1 GET /workspace/activity/quality API 연결
  - [x] 4.2 테이블: 시간 | 명령 | 총점(/25) | 판정(Badge) | 재작업
  - [x] 4.3 행 클릭 시 5항목 세부 점수 확장 (expandable row)

- [x] Task 5: 도구 탭 (AC: #5, #6)
  - [x] 5.1 GET /workspace/activity/tools API 연결
  - [x] 5.2 테이블: 시간 | 도구명 | 에이전트 | 소요시간 | 상태 | input 요약
  - [x] 5.3 도구명 필터 (자유 텍스트 Input)

- [x] Task 6: 공통 기능 (AC: #6, #7)
  - [x] 6.1 날짜 범위 필터 (input type="date" for startDate/endDate)
  - [x] 6.2 검색 입력 (debounced 300ms)
  - [x] 6.3 페이지네이션 컴포넌트 (이전/다음 + 페이지 번호 표시)
  - [x] 6.4 로딩 스켈레톤 (SkeletonTable from @corthex/ui)
  - [x] 6.5 빈 상태 (EmptyState from @corthex/ui)

## Dev Notes

### API 엔드포인트 (Story 6-3 완료)

```
GET /api/workspace/activity/agents
  ?page=1&limit=20&agentId=&departmentId=&status=&startDate=&endDate=&search=

GET /api/workspace/activity/delegations
  ?page=1&limit=20&departmentId=&startDate=&endDate=&search=

GET /api/workspace/activity/quality
  ?page=1&limit=20&conclusion=pass|fail&reviewerAgentId=&startDate=&endDate=&search=

GET /api/workspace/activity/tools
  ?page=1&limit=20&toolName=&agentId=&status=&startDate=&endDate=&search=
```

**공통 응답 형식:**
```typescript
{
  success: true,
  data: {
    items: T[],
    page: number,   // 현재 페이지 (1부터)
    limit: number,  // 페이지 크기 (기본 20)
    total: number   // 전체 건수
  }
}
```

### API 연결 패턴 (기존 코드 재사용 필수)

```typescript
// packages/app/src/lib/api.ts 사용
import { api } from '../lib/api'
import { useQuery } from '@tanstack/react-query'

// 응답 타입 예시
type PaginatedResponse<T> = {
  data: { items: T[]; page: number; limit: number; total: number }
}

// useQuery 패턴 (dashboard.tsx 참조)
const { data, isLoading } = useQuery({
  queryKey: ['activity-agents', page, search, startDate, endDate],
  queryFn: () => {
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return api.get<PaginatedResponse<AgentActivity>>(`/workspace/activity/agents?${params}`)
  },
})
```

### 공유 컴포넌트 (재발명 금지)

- **`Tabs`** from `@corthex/ui`: `<Tabs items={[...]} value={tab} onChange={setTab} />` — 이미 snap 스크롤, 반응형 지원
- **`Badge`** from `@corthex/ui`: variants: success, error, info, warning, default
- **`Skeleton`, `SkeletonTable`** from `@corthex/ui`: 로딩 표시
- **`EmptyState`** from `@corthex/ui`: 빈 상태 표시 (icon + title + description)
- **`Input`** from `@corthex/ui`: 검색, 날짜 입력
- **`api.get<T>`** from `../lib/api`: API 호출

### 탭 정의

```typescript
const TAB_ITEMS: TabItem[] = [
  { value: 'agents', label: '활동', shortLabel: '활동' },
  { value: 'delegations', label: '통신', shortLabel: '통신' },
  { value: 'quality', label: 'QA', shortLabel: 'QA' },
  { value: 'tools', label: '도구', shortLabel: '도구' },
]
```

### URL 탭 상태 관리 패턴 (ops-log.tsx 참조)

```typescript
import { useSearchParams } from 'react-router-dom'

const [searchParams, setSearchParams] = useSearchParams()
const tab = searchParams.get('tab') || 'agents'
const setTab = (t: string) => setSearchParams({ tab: t }, { replace: true })
```

### 데이터 타입 (서버 응답 기반)

```typescript
type AgentActivity = {
  id: string
  agentId: string | null
  agentName: string | null
  type: string
  action: string
  detail: string | null
  phase: string      // start | end | error
  metadata: unknown
  createdAt: string
}

type Delegation = {
  id: string
  commandId: string | null
  agentId: string | null
  agentName: string | null
  parentTaskId: string | null
  type: string        // classify | delegate | execute | synthesize | review
  input: string | null
  output: string | null
  status: string
  durationMs: number | null
  metadata: unknown   // may contain tokenUsage, cost
  createdAt: string
}

type QualityReview = {
  id: string
  commandId: string | null
  taskId: string | null
  reviewerAgentId: string | null
  reviewerAgentName: string | null
  conclusion: 'pass' | 'fail'
  scores: {
    conclusionQuality: number
    evidenceSources: number
    riskAssessment: number
    formatCompliance: number
    logicalCoherence: number
  } | null
  feedback: string | null
  attemptNumber: number
  commandText: string | null
  createdAt: string
}

type ToolInvocation = {
  id: string
  agentId: string | null
  agentName: string | null
  toolName: string
  input: string | null   // 200자 요약
  output: string | null  // 200자 요약
  status: string
  durationMs: number | null
  createdAt: string
}
```

### 페이지네이션 컴포넌트 (인라인 구현)

페이지네이션은 이 페이지에서만 사용하므로 인라인 구현:
```tsx
// 이전 | 페이지 1/10 | 다음
<div className="flex items-center justify-between mt-4">
  <span className="text-xs text-zinc-500">{total}건</span>
  <div className="flex items-center gap-2">
    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>이전</button>
    <span className="text-xs">{page} / {totalPages}</span>
    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>다음</button>
  </div>
</div>
```

### 날짜 필터 (input type="date")

```tsx
<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
<input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
```

### 상태 Badge 매핑

```typescript
const STATUS_BADGE: Record<string, { label: string; variant: string }> = {
  completed: { label: '완료', variant: 'success' },
  done: { label: '완료', variant: 'success' },
  end: { label: '완료', variant: 'success' },
  success: { label: '성공', variant: 'success' },
  failed: { label: '실패', variant: 'error' },
  error: { label: '오류', variant: 'error' },
  working: { label: '진행중', variant: 'info' },
  start: { label: '진행중', variant: 'info' },
  running: { label: '진행중', variant: 'info' },
  pass: { label: 'PASS', variant: 'success' },
  fail: { label: 'FAIL', variant: 'error' },
}
```

### QA 탭 확장 행 (5항목 점수)

```typescript
// quality_reviews.scores JSON 구조
const SCORE_LABELS: Record<string, string> = {
  conclusionQuality: '결론 품질',
  evidenceSources: '근거 출처',
  riskAssessment: '리스크 평가',
  formatCompliance: '형식 준수',
  logicalCoherence: '논리 일관성',
}
// 각 항목 /5점, 총점 /25점
```

### 파일 구조

- `packages/app/src/pages/activity-log.tsx` — **새 파일** (메인 페이지, 4탭 + 공통 필터/페이지네이션)
- `packages/app/src/App.tsx` — 수정 (ActivityLogPage lazy import + route 추가)
- `packages/app/src/components/sidebar.tsx` — 수정 (통신로그 메뉴 추가)

**단일 파일 구현 권장**: dashboard.tsx(195줄), ops-log.tsx(447줄) 패턴처럼 한 파일에 페이지 + 인라인 서브컴포넌트. 컴포넌트 분리 불필요.

### 기존 ops-log.tsx와의 관계

- `ops-log.tsx`는 기존 작전일지(Activity Log) — cursor 기반 무한스크롤 타임라인 UI
- `activity-log.tsx`는 새 통신로그 — 4탭 테이블 + offset 페이지네이션
- 두 페이지는 **별개**: 데이터 소스, UI 패턴, 용도가 모두 다름

### 기존 라우팅 패턴 (App.tsx)

```typescript
// lazy import
const ActivityLogPage = lazy(() => import('./pages/activity-log').then((m) => ({ default: m.ActivityLogPage })))

// Route (Layout 하위)
<Route path="activity-log" element={<Suspense fallback={<PageSkeleton />}><ActivityLogPage /></Suspense>} />
```

### 사이드바 메뉴 추가 (sidebar.tsx)

운영 섹션에 추가:
```typescript
{ to: '/activity-log', label: '통신로그', icon: '📞' },
```

### Previous Story Intelligence (6-3)

- 서비스: `packages/server/src/services/activity-log-service.ts` (parsePaginationParams, 4개 쿼리 함수)
- 라우트: `packages/server/src/routes/workspace/activity-tabs.ts` (4개 GET 엔드포인트)
- 마운트: `packages/server/src/index.ts` — `app.route('/api/workspace', activityTabsRoute)`
- 테스트: 15개 통과
- Code review 소견: `any` 타입, 미검증 필터값 → UI에서 유효값만 보내면 문제 없음

### Project Structure Notes

- App.tsx lazy import 패턴: `lazy(() => import('./pages/xxx').then((m) => ({ default: m.XxxPage })))`
- Route는 `<Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>` 내부에 추가
- sidebar.tsx navSections 배열에 메뉴 추가
- API 호출: `api.get<T>('/workspace/...')` — 슬래시 앞에 /api 자동 추가됨

### References

- [Source: _bmad-output/planning-artifacts/epics.md#1132-1160] — Epic 6 + E6-S4 수용 기준
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#275] — CEO #10 통신로그 UI 패턴
- [Source: _bmad-output/implementation-artifacts/6-3-activity-log-4tab-api.md] — API 구현 상세
- [Source: packages/server/src/routes/workspace/activity-tabs.ts] — 4개 API 엔드포인트
- [Source: packages/server/src/services/activity-log-service.ts] — 서비스 레이어 (타입/필터 참조)
- [Source: packages/app/src/pages/dashboard.tsx] — useQuery + api.get 패턴
- [Source: packages/app/src/pages/ops-log.tsx] — useSearchParams + 필터 패턴
- [Source: packages/app/src/App.tsx] — lazy import + Route 패턴
- [Source: packages/app/src/components/sidebar.tsx] — navSections 메뉴 구조
- [Source: packages/ui/src/tabs.tsx] — Tabs 컴포넌트 API
- [Source: packages/ui/src/badge.tsx] — Badge variants
- [Source: packages/ui/src/skeleton.tsx] — SkeletonTable
- [Source: packages/ui/src/empty-state.tsx] — EmptyState

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List
- activity-log.tsx: 4탭 페이지 구현 (활동/통신/QA/도구) with Tabs component
- 각 탭별 테이블: AgentsTable, DelegationsTable, QualityTable, ToolsTable 인라인 컴포넌트
- 공통 기능: 날짜 범위 필터(date input), 검색(debounced 300ms), 페이지네이션(이전/다음)
- QA 탭: 행 클릭 시 5항목 세부 점수 확장 (conclusionQuality/evidenceSources/riskAssessment/formatCompliance/logicalCoherence)
- 도구 탭: 도구명 텍스트 필터 추가
- 상태 Badge: 11종 상태 매핑 (completed/done/end/success=green, failed/error=red, working/start/running=blue, pass/fail)
- URL search param 탭 상태 관리 (?tab=agents|delegations|quality|tools)
- 사이드바 "통신로그" 메뉴 추가 (운영 섹션, 📞 아이콘)
- App.tsx lazy import + route 추가
- 36개 단위 테스트 (탭 정의, 상태 Badge, Score Labels, Format Helpers, Pagination, API Endpoints, Query Params, QA Score, Route Config, Delegation Display, File Structure)
- turbo build 3/3 성공
- 전체 앱 테스트 121건 통과, 0 regression

### Code Review (Adversarial)

**Verdict: PASS** — All 8 ACs satisfied. No blocking issues.

**Findings (LOW/informational):**

1. **useDebounce reimplemented** — Same hook exists in ops-log.tsx. Acceptable per single-file pattern convention.
2. **metadata.durationMs cast** — `as number` could receive unexpected string from API. Functionally safe since formatDuration handles null.
3. **QA colSpan=5 pattern** — Semantically unusual but correct for expandable rows.
4. **sidebar label rename** — "대시보드" to "작전현황" included from story 6-2 scope, not 6-4. Correct per UX spec.

**AC Validation:**
- [x] AC1: 4 tabs with URL ?tab= param
- [x] AC2: Agent activity table (시간/에이전트/명령/상태Badge/소요시간/토큰)
- [x] AC3: Delegation table (시간/발신→수신/명령 요약/비용/토큰)
- [x] AC4: QA table (시간/명령/총점/25/판정Badge/재작업) + expandable 5-criteria
- [x] AC5: Tool table (시간/도구명/에이전트/소요시간/상태/input) + toolName filter
- [x] AC6: Common features (date range, search, pagination, skeleton, empty state)
- [x] AC7: Mobile responsive (overflow-x-auto, Tabs snap scroll)
- [x] AC8: turbo build 3/3

### File List
- packages/app/src/pages/activity-log.tsx (new)
- packages/app/src/__tests__/activity-log.test.ts (new)
- packages/app/src/__tests__/activity-log-tea.test.ts (new)
- packages/app/src/App.tsx (modified - ActivityLogPage lazy import + route)
- packages/app/src/components/sidebar.tsx (modified - 통신로그 menu item)
