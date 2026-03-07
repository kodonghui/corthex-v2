# Story 2.8: Org Template UI + Agent Department Move

Status: done

## Story

As a 관리자,
I want 관리자 콘솔에서 조직 템플릿을 카드 형태로 조회/미리보기/적용하고, 조직도에서 에이전트를 드롭다운으로 다른 부서로 이동할 수 있기를,
so that 표준 조직 구조를 빠르게 구축하고 에이전트를 유연하게 재배치할 수 있다.

## Acceptance Criteria

1. **Given** 조직 템플릿 화면 진입 **When** 페이지 로드 **Then** 3종 템플릿 카드 그리드 표시 (투자분석/마케팅/올인원) + 각 카드에 이름, 설명, 포함 에이전트 수
2. **Given** 템플릿 카드 클릭 **When** 미리보기 모달 열림 **Then** 포함 부서 목록 + 각 부서 소속 에이전트 목록(이름, 계급, 모델) 표시
3. **Given** 미리보기에서 "적용" 버튼 클릭 **When** 적용 완료 **Then** 적용 결과 표시 (생성/스킵된 부서+에이전트 수) + 성공 토스트
4. **Given** 적용 중 기존 부서/에이전트와 이름 중복 **When** 병합 처리 **Then** 기존 것은 스킵 + 새것만 생성 (서버 merge 전략 활용)
5. **Given** 조직도에서 에이전트 클릭 **When** 상세 패널에서 "부서 이동" 드롭다운 선택 **Then** 에이전트 부서 즉시 변경 + 조직도 갱신 + 성공 토스트
6. **Given** 빈 조직 상태 **When** 조직도/템플릿 화면 진입 **Then** "템플릿으로 시작하세요" CTA 표시 + 템플릿 페이지로 이동 링크

## Tasks / Subtasks

- [x] Task 1: 조직 템플릿 페이지 생성 (AC: #1, #2, #3, #4)
  - [x] 새 페이지 `packages/admin/src/pages/org-templates.tsx` 생성
  - [x] GET /admin/org-templates API 호출 -> 카드 그리드 렌더링
  - [x] 카드에 템플릿명, 설명, 에이전트 수 표시
  - [x] 카드 클릭 시 미리보기 모달 (templateData의 부서+에이전트 목록)
  - [x] "적용" 버튼 -> POST /admin/org-templates/:id/apply 호출
  - [x] 적용 결과 표시 (생성/스킵 건수)
  - [x] 적용 중 로딩 상태 표시
  - [x] 빈 상태 ("등록된 템플릿이 없습니다")

- [x] Task 2: 라우팅 + 사이드바 연결 (AC: #1)
  - [x] App.tsx에 /org-templates 라우트 추가
  - [x] sidebar.tsx에 "조직 템플릿" 메뉴 추가

- [x] Task 3: 조직도 에이전트 부서 이동 (AC: #5)
  - [x] OrgChartPage의 AgentDetailPanel에 "부서 이동" 드롭다운 추가
  - [x] PATCH /admin/agents/:id { departmentId } 호출
  - [x] 성공 시 org-chart 쿼리 invalidate + 성공 토스트
  - [x] 미배속 에이전트도 부서 이동 가능

- [x] Task 4: 빈 조직 상태 CTA (AC: #6)
  - [x] OrgChartPage 빈 상태에 "템플릿으로 시작하세요" 버튼 추가 -> /org-templates로 이동

## Dev Notes

### 현재 코드베이스 상태

**서버 API -- 이미 완전히 구현됨 (변경 불필요):**
- `packages/server/src/routes/admin/org-templates.ts`:
  - GET /admin/org-templates -- 목록 (builtin + company-specific)
  - GET /admin/org-templates/:id -- 상세 (templateData 포함)
  - POST /admin/org-templates/:id/apply -- 적용 (merge 전략: 이름 중복 시 스킵)
- `packages/server/src/routes/admin/agents.ts`:
  - PATCH /admin/agents/:id -- departmentId 변경 지원 (에이전트 부서 이동)

**서버 API 응답 형태:**
```typescript
// GET /admin/org-templates
{ data: OrgTemplate[] }

// OrgTemplate 구조
{
  id: string
  companyId: string | null  // null = 플랫폼 내장
  name: string              // "투자분석 조직", "마케팅 조직", "올인원 조직"
  description: string | null
  templateData: {           // jsonb
    departments: Array<{
      name: string
      description?: string
      agents: Array<{
        name: string
        nameEn?: string
        role: string
        tier: 'manager' | 'specialist' | 'worker'
        modelName: string
        soul: string
        allowedTools: string[]
      }>
    }>
  }
  isBuiltin: boolean
  isActive: boolean
  createdBy: string | null
  createdAt: string
}

// POST /admin/org-templates/:id/apply 응답
{
  data: {
    templateId: string
    templateName: string
    departmentsCreated: number
    departmentsSkipped: number
    agentsCreated: number
    agentsSkipped: number
    details: Array<{
      departmentName: string
      action: 'created' | 'skipped'
      departmentId: string
      agentsCreated: string[]
      agentsSkipped: string[]
    }>
  }
}
```

**UI 코드 -- 수정 대상:**
- `packages/admin/src/pages/org-chart.tsx` -- AgentDetailPanel에 부서 이동 드롭다운 추가 + 빈 상태 CTA
- `packages/admin/src/App.tsx` -- /org-templates 라우트 추가
- `packages/admin/src/components/sidebar.tsx` -- "조직 템플릿" 메뉴 추가

**신규 생성:**
- `packages/admin/src/pages/org-templates.tsx` -- 템플릿 카드 그리드 + 미리보기 모달 + 적용

### UI 패턴 참고 (이전 스토리에서 배운 점)

- admin-store의 `selectedCompanyId`를 반드시 사용
- 토스트: `useToastStore((s) => s.addToast)` -> `addToast({ type: 'success'|'error', message })`
- react-query: `useQuery`, `useMutation`, `useQueryClient` -> `invalidateQueries`
- Tailwind CSS 클래스 기반 스타일링 (dark mode 지원)
- API: `import { api } from '../lib/api'` -> `api.get/post/patch/delete`
- 회사 미선택 시 "회사를 선택하세요" 메시지 표시
- 모달: `fixed inset-0 z-50 flex items-center justify-center bg-black/50` 패턴
- 카드: `@corthex/ui`의 `Card, CardContent` import 가능
- 기존 agents.tsx와 departments.tsx 코드 스타일 따를 것

### OrgChart AgentDetailPanel 수정 포인트

현재 AgentDetailPanel (`org-chart.tsx:58-133`)은 읽기 전용 상세 패널.
여기에 추가할 것:
1. 부서 이동 드롭다운 (부서 목록 필요 -> GET /admin/departments API 호출)
2. 이동 버튼 클릭 -> PATCH /admin/agents/:id { departmentId: newDeptId }
3. 성공 시 org-chart 쿼리 invalidate
4. `useMutation` + `useQueryClient` 필요 -> 컴포넌트에 추가 props 또는 컴포넌트 레벨에서 hooks 사용

주의: AgentDetailPanel은 현재 별도 컴포넌트. `useMutation`/`useQueryClient`를 사용하려면 내부에서 직접 hooks 호출 가능 (이미 React 컴포넌트이므로).

### 접근성 (UX 디자인 참조)

- 에이전트 드래그 앤 드롭은 접근성 대안으로 Select(드롭다운) 방식 사용 (UX 문서 line 4641, 5385)
- "에이전트 선택 (Space) -> 부서 이동 드롭다운 (Select) -> 확인"
- 드래그 앤 드롭 구현은 이 스토리에서는 생략 -- Select 기반 부서 이동만 구현
- 이유: dnd-kit 의존성 추가 없이 동일한 기능 달성 가능. 드래그 앤 드롭은 향후 UX 향상 스토리에서 추가 가능

### 파일 변경 범위

```
신규 생성:
  packages/admin/src/pages/org-templates.tsx  -- 조직 템플릿 페이지

수정:
  packages/admin/src/App.tsx                 -- 라우트 추가
  packages/admin/src/components/sidebar.tsx  -- 메뉴 추가
  packages/admin/src/pages/org-chart.tsx     -- 부서 이동 드롭다운 + 빈 상태 CTA
```

서버 코드 변경 없음.

### Project Structure Notes

- `packages/admin/` -- React + Vite + Tailwind CSS + @tanstack/react-query
- 라우팅: react-router-dom v6 (BrowserRouter, basename="/admin")
- 공유 UI: `@corthex/ui` -- Card, CardContent, Skeleton
- Admin 상태: zustand (admin-store, auth-store, toast-store)
- lazy import 패턴 사용 (`App.tsx` 참고)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E2-S8] -- 스토리 요구사항 (line 821, 882-888)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Admin-A7] -- UX 조직 템플릿 (line 211)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#에이전트-드래그] -- 드래그/부서 이동 (line 571)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#온보딩-템플릿] -- 템플릿 카드 (line 586-589)
- [Source: packages/server/src/routes/admin/org-templates.ts] -- 템플릿 API
- [Source: packages/server/src/services/organization.ts#applyTemplate] -- 적용 로직 (line 744)
- [Source: packages/server/src/db/schema.ts#orgTemplates] -- DB 스키마 (line 791)
- [Source: packages/admin/src/pages/org-chart.tsx] -- 조직도 페이지 (수정 대상)
- [Source: packages/admin/src/pages/agents.tsx] -- agents 페이지 (UI 패턴 참고)
- [Source: packages/admin/src/App.tsx] -- 라우팅 (수정 대상)
- [Source: packages/admin/src/components/sidebar.tsx] -- 사이드바 (수정 대상)
- [Source: _bmad-output/implementation-artifacts/2-7-agent-management-soul-editor-ui-admin.md] -- 이전 스토리

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Created `org-templates.tsx` with TemplateCard grid, PreviewModal (dept+agent listing), ApplyResultModal (created/skipped counts), loading/error/empty states. Uses react-query + admin-store + toast-store patterns.
- Task 2: Added lazy import for OrgTemplatesPage in App.tsx, /org-templates route, and sidebar menu item.
- Task 3: Enhanced AgentDetailPanel in org-chart.tsx with department move dropdown + "이동" button. Uses useMutation to PATCH /admin/agents/:id with new departmentId. Invalidates org-chart and agents queries on success. Departments passed from parent via props (from existing org-chart data, no extra API call needed).
- Task 4: Replaced empty state text in OrgChartPage with "템플릿으로 시작하세요" button using useNavigate to /org-templates.
- Build verified: 136 modules, 0 TypeScript errors. org-chart tests: 102 pass, 0 fail.

### Change Log

- 2026-03-07: Story 2-8 implemented -- org template UI (card grid, preview modal, apply result) + agent department move via dropdown in org-chart detail panel + empty state CTA
- 2026-03-07: Code review fixes -- added key prop to AgentDetailPanel, Escape key handlers + aria attrs on modals, null guard on templateData.departments

### File List

- packages/admin/src/pages/org-templates.tsx (new)
- packages/admin/src/App.tsx (modified)
- packages/admin/src/components/sidebar.tsx (modified)
- packages/admin/src/pages/org-chart.tsx (modified)
