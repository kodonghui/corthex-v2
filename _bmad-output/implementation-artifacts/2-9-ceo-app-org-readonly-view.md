# Story 2.9: CEO App Org Readonly View

Status: done

## Story

As a CEO(사용자),
I want CEO 앱에서 현재 조직 구조(부서, 에이전트, 상태)를 읽기 전용 트리 뷰로 확인할 수 있기를,
so that 관리자 콘솔에 접속하지 않고도 조직 현황을 빠르게 파악할 수 있다.

## Acceptance Criteria

1. **Given** CEO 앱 사이드바 **When** "조직도" 메뉴 클릭 **Then** 조직도 읽기 전용 페이지로 이동
2. **Given** 조직도 페이지 로드 **When** 데이터 로드 완료 **Then** 회사 루트 노드 + 부서별 에이전트 트리 뷰 표시 (Admin 조직도와 동일 데이터, 편집 불가)
3. **Given** 에이전트 표시 **When** 상태 변경 **Then** 에이전트 상태 뱃지(유휴/작업중/에러/오프라인) 실시간 반영
4. **Given** 에이전트 클릭 **When** 상세 패널 열림 **Then** 에이전트 상세 정보 표시 (이름, 계급, 모델, 역할, 상태, Soul 요약, 허용 도구) -- 편집 버튼 없음
5. **Given** 상세 패널 열림 **When** Escape 키 또는 백드롭 클릭 **Then** 패널 닫힘
6. **Given** 조직이 비어있음 (부서/에이전트 없음) **When** 페이지 로드 **Then** "아직 조직이 구성되지 않았습니다" 빈 상태 표시
7. **Given** 미배속 에이전트 존재 **When** 페이지 로드 **Then** "미배속" 섹션에 별도 표시

## Tasks / Subtasks

- [x] Task 1: 서버 API -- workspace org-chart 엔드포인트 (AC: #2, #3, #6, #7)
  - [x] `packages/server/src/routes/workspace/org-chart.ts` 생성
  - [x] GET /workspace/org-chart -- tenant.companyId 기반 조직도 조회 (Admin과 동일 데이터, adminOnly 미사용)
  - [x] authMiddleware만 적용 (CEO/일반 직원 모두 접근 가능)
  - [x] index.ts에 라우트 등록

- [x] Task 2: CEO 앱 조직도 페이지 (AC: #2, #3, #4, #5, #6, #7)
  - [x] `packages/app/src/pages/org.tsx` 생성
  - [x] Admin org-chart.tsx의 컴포넌트 구조 재사용 (AgentDetailPanel, AgentNode, DepartmentSection, OrgChartSkeleton)
  - [x] 편집 기능 제거 -- 부서 이동 드롭다운 없음, CRUD 버튼 없음
  - [x] 빈 상태: "아직 조직이 구성되지 않았습니다" (Admin과 달리 템플릿 CTA 없음)
  - [x] Escape 키로 상세 패널 닫기

- [x] Task 3: 라우팅 + 사이드바 (AC: #1)
  - [x] App.tsx에 /org 라우트 추가 (lazy import)
  - [x] sidebar.tsx "운영" 섹션에 "조직도" 메뉴 추가 (icon: '🏢')

## Dev Notes

### 현재 코드베이스 상태

**서버 -- 참고할 기존 코드:**
- `packages/server/src/routes/admin/org-chart.ts` -- Admin 전용 org-chart API (adminOnly middleware)
  - companyId를 query param으로 받음 (Admin은 여러 회사 관리 가능)
  - 부서 + 에이전트 조회 + tier 정렬 + 미배속 분리
- `packages/server/src/routes/workspace/nexus.ts:17-50` -- workspace용 org-data (간소화 버전, tier/model/soul/tools 없음)
  - tenant.companyId 사용 (query param 불필요)

**서버 API -- 새 엔드포인트 설계:**
```typescript
// GET /api/workspace/org-chart
// Auth: authMiddleware (adminOnly 아님)
// companyId: tenant.companyId에서 자동 추출 (query param 불필요)

// 응답 형태 (Admin org-chart와 동일):
{
  data: {
    company: { id: string; name: string; slug: string }
    departments: Array<{
      id: string
      name: string
      description: string | null
      agents: Array<{  // tier 정렬됨
        id: string
        name: string
        role: string | null
        tier: 'manager' | 'specialist' | 'worker'
        modelName: string
        departmentId: string | null
        status: string  // 'online' | 'working' | 'error' | 'offline'
        isSecretary: boolean
        isSystem: boolean
        soul: string | null
        allowedTools: string[] | null
      }>
    }>
    unassignedAgents: OrgAgent[]
  }
}
```

**왜 nexus/org-data를 재사용하지 않는가:**
- nexus/org-data는 tier, modelName, soul, allowedTools 필드가 없음
- AC #4에서 상세 패널에 Soul 요약과 허용 도구가 필요
- Admin org-chart.ts의 쿼리를 그대로 가져오되 companyId 소스만 변경 (query param -> tenant)

**CEO 앱 -- 참고할 기존 코드:**
- `packages/admin/src/pages/org-chart.tsx` -- **전체 파일을 참고 모델로 사용**
  - AgentDetailPanel (line 58-133): 상세 정보 슬라이드 패널 -> 그대로 복사 (편집 기능 없으므로 수정 불필요)
  - AgentNode (line 138-157): 에이전트 행 -> 그대로 복사
  - DepartmentSection (line 162-192): 접을 수 있는 부서 섹션 -> 그대로 복사
  - OrgChartSkeleton (line 197-218): 로딩 스켈레톤 -> 그대로 복사
  - OrgChartPage (line 223-337): 메인 페이지 -> 복사 후 수정:
    - `useAdminStore` -> 제거 (selectedCompanyId 불필요, user의 companyId 자동 사용)
    - API 경로: `/admin/org-chart?companyId=...` -> `/workspace/org-chart`
    - "회사를 선택해주세요" 분기 제거
    - 빈 상태에서 "템플릿으로 시작하세요" 제거
- `packages/app/src/lib/api.ts` -- api.get 사용 패턴 동일
- `packages/app/src/App.tsx` -- lazy import 패턴 참고

**CEO 앱 sidebar.tsx 수정:**
- 현재 "운영" 섹션: SNS, 메신저, 대시보드, 작전일지, NEXUS
- "조직도" 추가 위치: "운영" 섹션 맨 위 (대시보드 위)
- 아이콘: '🏢'

**CEO 앱 App.tsx 수정:**
```typescript
// 추가할 lazy import
const OrgPage = lazy(() => import('./pages/org').then((m) => ({ default: m.OrgPage })))

// 추가할 Route (Layout 자식)
<Route path="org" element={<Suspense fallback={<PageSkeleton />}><OrgPage /></Suspense>} />
```

### Admin 코드와의 차이점 (중요!)

| 항목 | Admin org-chart.tsx | CEO 앱 org.tsx |
|------|---------------------|----------------|
| 회사 선택 | selectedCompanyId (multi-company) | 불필요 (user.companyId 자동) |
| API 경로 | `/admin/org-chart?companyId=...` | `/workspace/org-chart` |
| 편집 기능 | 부서 이동 드롭다운 (2-8 스토리) | 없음 (읽기 전용) |
| 빈 상태 CTA | "템플릿으로 시작하세요" | 없음 |
| UI 컴포넌트 | 동일 | 동일 |
| Store 의존 | useAdminStore | 없음 |
| 인증 미들웨어 | adminOnly | authMiddleware (일반 사용자 OK) |

### 파일 변경 범위

```
신규 생성:
  packages/server/src/routes/workspace/org-chart.ts  -- workspace org-chart API
  packages/app/src/pages/org.tsx                     -- CEO 앱 조직도 페이지

수정:
  packages/server/src/index.ts                       -- workspace org-chart 라우트 등록
  packages/app/src/App.tsx                           -- /org 라우트 추가
  packages/app/src/components/sidebar.tsx            -- 조직도 메뉴 추가
```

### UI 패턴 참고

- @tanstack/react-query: `useQuery` (queryKey 패턴)
- Tailwind CSS + dark mode (기존 패턴 따를 것)
- @corthex/ui: `Card`, `CardContent`, `Skeleton`
- STATUS_CONFIG / TIER_CONFIG 상수: Admin org-chart.tsx에서 그대로 복사
- 상세 패널 애니메이션: `animate-slide-left` (Admin 패턴 재사용)

### 코드 재사용 전략

Admin org-chart.tsx (337줄)의 컴포넌트를 **복사-수정** 방식으로 재사용한다. 공통 컴포넌트 추출(packages/ui)은 이 스토리 범위 밖이다. 이유:
1. Admin과 CEO 앱은 별도 빌드 (import 경로가 다름)
2. Admin에는 편집 기능이 추가됨 (2-8 스토리에서 부서 이동 드롭다운 등)
3. 코드량이 적어 (300줄 미만) 중복 비용이 낮음

### Project Structure Notes

- `packages/app/` -- React + Vite + Tailwind CSS + @tanstack/react-query
- 라우팅: react-router-dom v6 (BrowserRouter)
- 인증: zustand auth-store (`useAuthStore`)
- API: `packages/app/src/lib/api.ts` -> `api.get<T>(path)`
- 공유 UI: `@corthex/ui` -- Card, CardContent, Skeleton

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E2-S9] -- 스토리 요구사항 (line 890-895)
- [Source: _bmad-output/planning-artifacts/epics.md#Epic2] -- Epic 2 개요 (line 55-67)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Screen-Inventory] -- CEO 앱 14개 화면, Admin A1 조직도 (line 182-211)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#DP1] -- 조직 은유 일관성 원칙 (line 93)
- [Source: packages/admin/src/pages/org-chart.tsx] -- Admin 조직도 UI (참고 모델)
- [Source: packages/server/src/routes/admin/org-chart.ts] -- Admin org-chart API (참고)
- [Source: packages/server/src/routes/workspace/nexus.ts:17-50] -- workspace org-data (간소화 버전, 참고)
- [Source: packages/app/src/App.tsx] -- CEO 앱 라우팅 (수정 대상)
- [Source: packages/app/src/components/sidebar.tsx] -- CEO 앱 사이드바 (수정 대상)
- [Source: packages/app/src/lib/api.ts] -- CEO 앱 API 유틸 (패턴 참고)
- [Source: packages/app/src/stores/auth-store.ts] -- 인증 스토어 (user.companyId 참고)
- [Source: packages/server/src/index.ts:92-111] -- 서버 라우트 등록 패턴

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Created workspace org-chart API endpoint at `packages/server/src/routes/workspace/org-chart.ts`. Uses `authMiddleware` (not `adminOnly`), automatically uses `tenant.companyId` instead of query param. Same data shape as admin org-chart (departments + agents with tier sorting + unassigned agents).
- Task 2: Created CEO app org page at `packages/app/src/pages/org.tsx`. Readonly version of admin org-chart -- no edit buttons, no department move dropdown, no template CTA. Includes AgentDetailPanel, AgentNode, DepartmentSection, OrgChartSkeleton components. Empty state shows "관리자에게 조직 설정을 요청해 주세요" instead of template link.
- Task 3: Added `/org` route to App.tsx with lazy import. Added "조직도" menu item to sidebar "운영" section at top position with '🏢' icon.
- Tests: 38 tests passing in workspace-org-chart.test.ts covering API logic, UI behavior, soul summary, empty state, agent counts, readonly constraints, detail panel fields, sidebar navigation, route config.

### Change Log

- 2026-03-07: Story 2-9 implemented -- workspace org-chart API + CEO app readonly org page + routing/sidebar

### File List

- packages/server/src/routes/workspace/org-chart.ts (new)
- packages/server/src/index.ts (modified -- import + route registration)
- packages/app/src/pages/org.tsx (new)
- packages/app/src/App.tsx (modified -- lazy import + route)
- packages/app/src/components/sidebar.tsx (modified -- 조직도 menu item)
- packages/server/src/__tests__/unit/workspace-org-chart.test.ts (new)
