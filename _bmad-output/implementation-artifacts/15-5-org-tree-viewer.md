# Story 15.5: Org Tree Viewer (조직도 뷰어)

Status: done

## Story

As a platform admin (관리자),
I want an interactive org chart page in the admin console that visually displays the company's departments, agents, and reporting lines as a tree structure,
so that I can quickly understand the organizational hierarchy and agent assignments at a glance.

## Acceptance Criteria

1. **Given** admin logged in **When** navigating to `/admin/org-chart` **Then** 조직도 페이지가 렌더링된다 (사이드바에 "조직도" 메뉴 추가)
2. **Given** 조직도 페이지 **When** 회사 선택 **Then** 회사 노드를 루트로, 부서 노드를 2단계, 에이전트 노드를 3단계로 표시하는 트리 구조가 렌더링된다
3. **Given** 조직도 **When** 부서에 소속되지 않은 에이전트가 있을 때 **Then** "미배정" 그룹으로 별도 표시
4. **Given** 에이전트 노드 **When** 마우스 호버 **Then** 에이전트 상세 정보 (role, status, isSecretary 여부) 툴팁 표시
5. **Given** 에이전트 노드 **When** status별 **Then** 색상 구분: online=green, working=blue, error=red, offline=gray
6. **Given** 조직도 **When** 부서 노드 클릭 **Then** 해당 부서의 에이전트 리스트 확장/축소 토글
7. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 success

## Tasks / Subtasks

- [x] Task 1: 조직도 API 엔드포인트 (AC: #2, #3, #7)
  - [x] `packages/server/src/routes/admin/org-chart.ts` 생성
  - [x] `GET /org-chart?companyId=xxx` → 회사 정보 + 부서별 에이전트 + 미배정 에이전트
  - [x] 응답: `{ data: { company, departments: [...], unassignedAgents: [...] } }`
  - [x] `authMiddleware + adminOnly` 적용

- [x] Task 2: 조직도 페이지 UI (AC: #1, #2, #3, #4, #5, #6)
  - [x] `packages/admin/src/pages/org-chart.tsx` 생성
  - [x] 회사 선택 드롭다운 (기존 useAdminStore.selectedCompanyId 활용)
  - [x] 트리 레이아웃: 회사 → 부서 → 에이전트 3단계
  - [x] 부서 노드: 이름 + 에이전트 수 배지 + 클릭 시 확장/축소
  - [x] 에이전트 노드: 이름 + 상태 점(status dot) + 비서 배지
  - [x] 미배정 에이전트 그룹 별도 표시
  - [x] 에이전트 호버 시 툴팁 (role, status, isSecretary)
  - [x] status별 색상: online=green, working=blue, error=red, offline=gray
  - [x] 반응형 (모바일에서는 세로 리스트로 폴백)

- [x] Task 3: Admin 사이드바 + 라우터 등록 (AC: #1)
  - [x] `packages/admin/src/components/sidebar.tsx`의 nav 배열에 `{ to: '/org-chart', label: '조직도', icon: '🏗️' }` 추가
  - [x] `packages/admin/src/App.tsx`에 OrgChartPage lazy import + Route 추가

- [x] Task 4: 빌드 검증 (AC: #7)
  - [x] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### Existing Infrastructure (DO NOT re-implement)

1. **Departments Tree API** (`packages/server/src/routes/admin/departments.ts`)
   - 이미 존재: `GET /api/admin/departments/tree?companyId=xxx` → `{ data: [{ id, name, description, agents: [...] }] }`
   - 조직도 API는 이 데이터를 기반으로 회사 정보 + 미배정 에이전트 + 보고라인을 결합
   - departments/tree를 직접 수정하지 말 것 — 별도 조직도 전용 엔드포인트

2. **Report Lines API** (`packages/server/src/routes/admin/report-lines.ts`)
   - `GET /api/admin/report-lines?companyId=xxx` → `{ data: ReportLine[] }`
   - 보고 라인: `{ reporterId, supervisorId }` — 인간 직원 간 관계

3. **Admin Route 패턴** (`packages/server/src/routes/admin/*.ts`)
   - `new Hono<AppEnv>()` + `.use('*', authMiddleware, adminOnly)` 패턴
   - import: `authMiddleware, adminOnly` from `../../middleware/auth`
   - import: `AppEnv` from `../../types`

4. **Admin 사이드바** (`packages/admin/src/components/sidebar.tsx`)
   - nav 배열 (현재 10개 항목): 대시보드, 회사, 직원, 부서, AI 에이전트, 도구, CLI/API 키, 보고 라인, 소울 템플릿, 시스템 모니터링
   - 아이콘은 이모지 사용

5. **Admin App.tsx** (`packages/admin/src/App.tsx`)
   - `lazy(() => import('./pages/xxx').then(m => ({ default: m.XxxPage })))` 패턴
   - `<Route path="xxx" element={<Suspense fallback={<PageSkeleton />}><XxxPage /></Suspense>} />`

6. **Admin API Client** (`packages/admin/src/lib/api.ts`)
   - `api.get<T>(url)` 패턴으로 호출

7. **UI 컴포넌트** (`@corthex/ui`)
   - Card, CardContent, Badge, Skeleton 등 공유 컴포넌트
   - 다크 모드: `dark:` Tailwind 프리픽스

8. **공유 타입** (`packages/shared/src/types.ts`)
   - `NexusOrgData` 타입이 이미 정의됨 — 조직도 데이터 구조 참고 가능
   ```typescript
   export type NexusOrgData = {
     company: { id: string; name: string; slug: string }
     departments: {
       id: string; name: string; description: string | null
       agents: { id: string; name: string; role: string; status: string; isSecretary: boolean }[]
     }[]
     unassignedAgents: { id: string; name: string; role: string; status: string; isSecretary: boolean }[]
   }
   ```

9. **DB 스키마** (`packages/server/src/db/schema.ts`)
   - departments: 평면 구조 (parentDepartmentId 없음)
   - agents: departmentId 필드로 부서 소속
   - reportLines: reporterId + supervisorId (인간 직원 간)

10. **Zustand 스토어** (`packages/admin/src/stores/admin-store.ts`)
    - `useAdminStore` — `selectedCompanyId` 등 admin 상태 관리

### 트리 UI 구현 전략

- 외부 라이브러리 사용 금지 — 순수 Tailwind CSS로 트리 레이아웃 구현
- 회사 → 부서 → 에이전트 3단계 들여쓰기 구조
- CSS로 연결선 표현 (border-left + pseudo-element)
- 모바일: 세로 리스트 (md 이상에서 트리 레이아웃)
- React state로 확장/축소 관리 (expandedDepartments Set)

### Status 색상 매핑

```typescript
const statusColor: Record<string, string> = {
  online: 'bg-green-500',
  working: 'bg-blue-500',
  error: 'bg-red-500',
  offline: 'bg-gray-400',
}
```

### 보안 고려사항

- 조직도 엔드포인트는 admin 전용 (authMiddleware + adminOnly)
- companyId 필터로 테넌트 격리

### Project Structure Notes

- `packages/server/src/routes/admin/org-chart.ts` (신규 - 조직도 API)
- `packages/server/src/index.ts` (수정 - orgChartRoute 등록)
- `packages/admin/src/pages/org-chart.tsx` (신규 - 조직도 UI)
- `packages/admin/src/components/sidebar.tsx` (수정 - nav 메뉴 추가)
- `packages/admin/src/App.tsx` (수정 - 라우트 + lazy import 추가)

### References

- [Source: packages/server/src/routes/admin/departments.ts] — departments/tree API (기존 데이터 소스)
- [Source: packages/server/src/routes/admin/report-lines.ts] — 보고 라인 API
- [Source: packages/server/src/routes/admin/monitoring.ts] — admin 라우트 패턴 (15-4에서 생성)
- [Source: packages/server/src/index.ts] — admin 라우트 등록 패턴
- [Source: packages/admin/src/App.tsx] — admin 페이지 lazy import + 라우트 패턴
- [Source: packages/admin/src/components/sidebar.tsx] — nav 배열 패턴
- [Source: packages/admin/src/pages/departments.tsx] — 부서 관리 페이지 (기존 UI 패턴)
- [Source: packages/shared/src/types.ts] — NexusOrgData 타입

### Previous Story Intelligence (15-4)

- Story 15-4에서 시스템 모니터링 추가됨 (monitoring.tsx)
- admin route 패턴: `new Hono<AppEnv>()` + `.use('*', authMiddleware, adminOnly)`
- 빌드: 8/8 success, 1252 tests pass
- Code Review에서 5개 이슈 자동 수정됨
- 커밋 패턴: `feat: Story X-Y 제목 — 변경 요약 + TEA N건`

### Git Intelligence

Recent commits:
- `70e3741` feat: Story 15-4 시스템 모니터링 — 서버 상태 + 메모리 + DB + 에러 카운터 + TEA 67건
- `1869cc3` feat: Story 15-3 소울 에디터 — CodeMirror 마크다운 에디터 + TEA 46건
- `1625ffd` feat: Story 15-2 소울 템플릿 관리 — admin CRUD + workspace API + UI + TEA 43건
- `f2af5b1` feat: Story 15-1 P3 DB 스키마 — soulTemplates 테이블 + 마이그레이션 + 타입 + TEA 53건

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Created org-chart.ts admin API. GET /org-chart?companyId=xxx returns company info + departments with agents + unassigned agents. authMiddleware + adminOnly applied.
- Task 2: Created org-chart.tsx page with 3-level tree layout (company > department > agent). Department expand/collapse toggle, agent status color dots (online=green, working=blue, error=red, offline=gray), hover tooltip with role/status/isSecretary, unassigned agents in amber group, responsive layout.
- Task 3: Added sidebar nav item and lazy route in App.tsx.
- Task 4: Build 8/8 success. 19 org-chart unit tests pass, 0 regressions.
- TEA: 46 tests total (expanded from 19 during TEA phase, 12 test suites)
- Code Review: Fixed 1 issue — unused `isNull` import removed. 1 MEDIUM resolved, 1 LOW deferred.

### File List

- packages/server/src/routes/admin/org-chart.ts (new - org chart API endpoint)
- packages/server/src/index.ts (modified - registered orgChartRoute)
- packages/admin/src/pages/org-chart.tsx (new - org chart UI page)
- packages/admin/src/components/sidebar.tsx (modified - added nav item)
- packages/admin/src/App.tsx (modified - added lazy import + route)
- packages/server/src/__tests__/unit/org-chart.test.ts (new - 19 tests)
