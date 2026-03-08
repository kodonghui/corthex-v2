# Story 18.4: 워크플로우 빌더 UI

Status: done

## Story

As an Admin user,
I want a visual workflow builder interface to create and manage multi-step automation workflows,
so that I can define tool/LLM/condition pipelines without writing code.

## Acceptance Criteria

1. **워크플로우 목록 페이지**: Admin 앱에 `/workflows` 페이지 추가. 기존 워크플로우 목록 조회 (이름, 생성일, 스텝 수, 활성 상태)
2. **워크플로우 생성 폼**: "새 워크플로우" 버튼 → 모달/페이지에서 이름, 설명, 스텝 추가 가능
3. **스텝 빌더**: 스텝 타입 선택 (tool/llm/condition), 각 타입별 파라미터 입력 폼, 의존성(dependsOn) 설정
4. **DAG 시각화**: 스텝 간 의존 관계를 시각적으로 표시 (간단한 리스트+화살표 또는 플로우차트)
5. **워크플로우 수정/삭제**: 기존 워크플로우 편집 및 소프트 삭제
6. **제안 목록**: 패턴 분석 제안(workflow_suggestions) 목록 표시 + 수락/거절 버튼
7. **Admin 사이드바**: 워크플로우 메뉴 항목 추가

## Tasks / Subtasks

- [x] Task 1: Admin 앱 워크플로우 목록 페이지 (AC: #1, #7)
  - [x] `packages/admin/src/pages/workflows.tsx` 생성
  - [x] GET /api/workspace/workflows 호출하여 목록 렌더링
  - [x] App.tsx에 라우트 추가 + sidebar.tsx에 메뉴 추가

- [x] Task 2: 워크플로우 생성/편집 폼 (AC: #2, #3, #5)
  - [x] 워크플로우 이름, 설명 입력
  - [x] 스텝 추가/삭제/재정렬 UI (동적 폼)
  - [x] 스텝 타입별 파라미터 폼 (tool: action+params, llm: action+systemPrompt+agentId, condition: action+trueBranch+falseBranch)
  - [x] dependsOn 선택 (이전 스텝 중 선택)
  - [x] POST /api/workspace/workflows로 생성, PUT /api/workspace/workflows/:id로 수정
  - [x] DELETE /api/workspace/workflows/:id로 삭제

- [x] Task 3: DAG 시각화 (AC: #4)
  - [x] 스텝 간 의존 관계를 세로형 리스트로 표시 (Kahn's algorithm topological sort)
  - [x] 의존 화살표 또는 인덴트로 순서 시각화
  - [x] 독립 스텝(병렬) vs 순차 스텝 구분 표시 + 순환 의존성 감지

- [x] Task 4: 제안 목록 UI (AC: #6)
  - [x] GET /api/workspace/workflows/suggestions 호출
  - [x] 제안 카드 (패턴 이름, 반복 횟수, 스텝 목록)
  - [x] 수락 버튼 → POST .../accept, 거절 버튼 → POST .../reject
  - [x] 수락 후 워크플로우 목록 자동 새로고침

## Dev Notes

### 아키텍처 결정

1. **앱 위치**: Admin 앱 (`packages/admin/`) — 워크플로우 관리는 관리자 기능
2. **API 경로**: `/api/workspace/workflows/*` — 기존 서버 라우트 활용 (인증은 workspace JWT)
3. **UI 패턴**: 기존 Admin 앱 패턴 따름 (react-query, zustand, api.ts helper, Tailwind CSS)
4. **DAG 시각화**: 외부 라이브러리 없이 CSS 기반 리스트 레이아웃 (Epic 20-S4에서 노코드 비주얼 빌더 구현 예정)

### 기존 API 엔드포인트 (서버 수정 불필요)

```
GET    /api/workspace/workflows                    -- 목록
POST   /api/workspace/workflows                    -- 생성
GET    /api/workspace/workflows/:id                -- 단건 조회
PUT    /api/workspace/workflows/:id                -- 수정
DELETE /api/workspace/workflows/:id                -- 삭제
GET    /api/workspace/workflows/suggestions        -- 제안 목록
POST   /api/workspace/workflows/suggestions/:id/accept  -- 수락
POST   /api/workspace/workflows/suggestions/:id/reject  -- 거절
POST   /api/workspace/workflows/analyze            -- 분석 트리거
```

### Admin 앱 패턴 참조

- **API 호출**: `api.get<T>(path)`, `api.post<T>(path, body)`, `api.put<T>(path, body)`, `api.delete<T>(path)`
- **상태관리**: `useAdminStore` (selectedCompanyId), `useToastStore` (알림)
- **데이터 페칭**: `@tanstack/react-query` (useQuery, useMutation)
- **라우팅**: React Router v6, lazy import, App.tsx에 Route 추가
- **스타일**: Tailwind CSS, dark mode 지원 (`dark:` prefix)
- **컴포넌트**: `@corthex/ui` 패키지 (Skeleton 등)

### StepSchema (Zod) — 서버 측 검증 스키마

```typescript
{
  id: string (UUID),
  name: string (1~100),
  type: 'tool' | 'llm' | 'condition',
  action: string,
  params?: Record<string, any>,
  agentId?: string (UUID),
  dependsOn?: string[] (UUID[]),
  trueBranch?: string (UUID),
  falseBranch?: string (UUID),
  systemPrompt?: string,
  timeout?: number (1000~300000),
  retryCount?: number (0~3),
}
```

### API 인증 주의사항

Admin 앱은 `/api/admin/*` 엔드포인트 사용하나, 워크플로우 API는 `/api/workspace/*` 마운트.
Admin JWT 토큰이 workspace 인증도 통과하는지 확인 필요.
- 서버 `authMiddleware`는 `Authorization: Bearer {token}` 헤더 검사
- Admin 토큰: `localStorage.getItem('corthex_admin_token')`
- 만약 admin 토큰이 workspace API에서 안 먹히면, `/api/admin/workflows` 프록시 라우트 필요

### Project Structure Notes

```
packages/admin/src/
├── pages/
│   └── workflows.tsx        # [NEW] 워크플로우 빌더 페이지
├── components/
│   └── layout.tsx           # [MODIFY] 사이드바에 워크플로우 메뉴 추가
├── App.tsx                  # [MODIFY] 라우트 추가
└── lib/
    └── api.ts               # [NO CHANGE] 기존 API helper 활용
```

### References

- [Source: packages/server/src/routes/workspace/workflows.ts] -- 전체 API 엔드포인트
- [Source: packages/server/src/services/workflow/engine.ts] -- WorkflowStep 타입
- [Source: packages/admin/src/pages/tools.tsx] -- Admin 페이지 패턴 참조
- [Source: packages/admin/src/App.tsx] -- 라우트 등록 패턴
- [Source: packages/admin/src/lib/api.ts] -- API 호출 패턴
- [Source: packages/admin/src/components/layout.tsx] -- 사이드바 네비게이션

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- All 4 tasks implemented in single-page component (workflows.tsx, ~735 lines)
- WorkflowsPage: list/suggestions tabs, CRUD, pattern analysis trigger
- WorkflowEditor: create/edit form with step builder, save/cancel
- StepForm: per-step config (name, type, action, type-specific fields, dependsOn toggles, timeout, retryCount)
- DagPreview: client-side topological sort (Kahn's algorithm) with layer visualization, parallel detection, cycle detection
- Fixed addToast API to match toast-store signature (object arg, not positional)
- TypeScript compilation passes clean
- Sidebar and route already registered (from previous context)
- CR fix: Added isActive status display in workflow list (AC#1 completeness)
- CR fix: Suggestions query now fetches regardless of active tab (accurate badge count)
- Extracted buildDagLayers as exported pure function for testability

### File List
- `packages/admin/src/pages/workflows.tsx` -- [NEW] Workflow builder page (~735 lines)
- `packages/admin/src/App.tsx` -- [MODIFIED] Added lazy import + route for WorkflowsPage
- `packages/admin/src/components/sidebar.tsx` -- [MODIFIED] Added workflow nav item
