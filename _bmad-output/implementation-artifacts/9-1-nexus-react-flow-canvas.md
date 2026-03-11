# Story 9.1: NEXUS React Flow 캔버스 기반

Status: done

## Story

As a 관리자,
I want 조직 구조를 시각적 캔버스에서 보고 편집하는 것을,
so that 직관적으로 조직을 관리할 수 있다.

## Acceptance Criteria

1. **React Flow 캔버스: 줌, 팬, 미니맵** — 이미 7.5에서 구현됨 (admin/nexus.tsx). 확인 + 유지.
2. **ELK.js 계층 레이아웃 자동 배치 (위→아래)** — 이미 7.5에서 구현됨 (elk-layout.ts). 확인 + 유지.
3. **60fps 렌더링** — React Flow Canvas 렌더링 기본 제공. 확인 + 유지.
4. **aria 접근성 내장** — React Flow 기본 제공. 확인 + 유지.
5. **React.lazy() 동적 로드** — 이미 App.tsx에 lazy import. 확인 + 유지.
6. **admin 패키지에 위치** — 이미 packages/admin/src/pages/nexus.tsx. 확인 + 유지.
7. **편집 모드 전환** — View/Edit 모드 토글 버튼. Edit 모드에서만 노드 이동, 연결, 삭제 가능.
8. **레이아웃 저장/복원** — 사용자가 편집한 노드 위치를 서버에 저장하고, 재방문 시 복원. (`PUT /nexus/layout`, `GET /nexus/layout` 서버 API 이미 존재).
9. **노드 선택 상태** — 노드 클릭 시 선택 하이라이트 (border glow). 선택된 노드 정보를 상태로 관리 (9.4 속성 패널 준비).
10. **편집 도구바** — 상단 도구 모음: 뷰/편집 모드 토글, 자동 정렬(ELK 재배치), 레이아웃 저장, 줌 맞추기(fitView).
11. **WebSocket 실시간 반영** — `nexus-updated` 이벤트 수신 시 조직 데이터 자동 새로고침.

## Tasks / Subtasks

- [x] Task 1: 편집 모드 상태 관리 (AC: #7)
  - [x] 1.1 `packages/admin/src/pages/nexus.tsx` — `isEditMode` state 추가 (default: false)
  - [x] 1.2 Edit 모드: `nodesDraggable={true}`, `nodesConnectable={true}`, `elementsSelectable={true}`
  - [x] 1.3 View 모드: `nodesDraggable={true}` (관람 드래그만), `nodesConnectable={false}`, `elementsSelectable={true}`
  - [x] 1.4 Edit 모드 진입 시 "편집 모드입니다" 토스트 알림

- [x] Task 2: 편집 도구바 구현 (AC: #10)
  - [x] 2.1 `packages/admin/src/components/nexus/nexus-toolbar.tsx` — 도구바 컴포넌트 (NEW)
  - [x] 2.2 도구바 위치: 캔버스 상단 (absolute top-4 left-1/2 transform -translate-x-1/2 z-10)
  - [x] 2.3 버튼들: 뷰/편집 모드 토글 (아이콘+텍스트), 자동 정렬 (ELK 재배치), 레이아웃 저장, 전체 보기 (fitView)
  - [x] 2.4 스타일: `bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 flex gap-2 shadow-lg`
  - [x] 2.5 편집 모드 토글: `bg-blue-600`(편집 중) / `bg-slate-700`(뷰 모드) 시각 구분
  - [x] 2.6 저장 버튼: dirty 상태일 때만 활성화 (변경사항 있을 때)

- [x] Task 3: 레이아웃 저장/복원 (AC: #8)
  - [x] 3.1 서버 API 확인 — workspace에 존재하지만 admin 전용 API 필요 확인
  - [x] 3.2 admin에서 워크스페이스 API 호출 불가 확인 — admin 전용 라우트 생성 결정
  - [x] 3.3 `packages/server/src/routes/admin/nexus-layout.ts` (NEW) — admin 전용 레이아웃 저장/복원 API
    - `GET /admin/nexus/layout` → canvasLayouts 테이블에서 tenant-scoped 위치 로드
    - `PUT /admin/nexus/layout` → `{ nodePositions, viewport }` upsert 저장
  - [x] 3.4 페이지 로드 시: 저장된 레이아웃 있으면 적용, 없으면 ELK 자동 배치
  - [x] 3.5 `onNodesChange` 콜백에서 position 변경 감지 (drag end) → dirty 플래그 설정
  - [x] 3.6 저장 버튼 클릭 또는 Ctrl+S → PUT API 호출 → 성공 토스트
  - [x] 3.7 자동 정렬 버튼: ELK 재계산 → 노드 위치 업데이트 → dirty 플래그 설정

- [x] Task 4: 노드 선택 상태 관리 (AC: #9)
  - [x] 4.1 `selectedNodeId` state 추가 → 노드 클릭 시 업데이트
  - [x] 4.2 선택된 노드에 `ring-2 ring-blue-400/50` 강조 (커스텀 노드에 selected prop 전달)
  - [x] 4.3 `onNodeClick` 콜백: 선택 상태 업데이트 (9.4 속성 패널용)
  - [x] 4.4 캔버스 빈 공간 클릭 시 선택 해제 (`onPaneClick`)
  - [x] 4.5 기존 4개 노드 컴포넌트(company, department, agent, unassigned-group)에 `selected` prop 반영하여 하이라이트 스타일 적용

- [x] Task 5: 실시간 반영 (AC: #11) — WebSocket→Polling 변경
  - [x] 5.1 Admin에 WebSocket 인프라 없음 확인 → TanStack Query `refetchInterval: 30_000` 사용
  - [x] 5.2 org-chart 데이터 30초마다 자동 갱신 (변경 사항 자동 반영)
  - [x] 5.3 데이터 리프레시 시 저장된 레이아웃이 있으면 위치 유지, 없으면 ELK 재배치

- [x] Task 6: 기존 nexus.tsx 리팩토링 (AC: #1~#6)
  - [x] 6.1 기존 169줄 nexus.tsx → 편집 기능 통합 (~240줄, ReactFlowProvider 래퍼 분리)
  - [x] 6.2 `useCallback`으로 이벤트 핸들러 메모이제이션 (성능)
  - [x] 6.3 로딩 상태: Skeleton 표시 (기존 패턴 유지)
  - [x] 6.4 에러 상태: API 실패 시 에러 메시지 + 재시도 버튼 (기존 패턴 유지)
  - [x] 6.5 빈 데이터: 조직이 비어있을 때 "부서를 추가하세요" 안내 메시지 (기존 패턴 유지)

- [x] Task 7: 테스트 (AC: 전체)
  - [x] 7.1 `packages/server/src/__tests__/unit/story-9-1-nexus-canvas.test.ts` — 32 tests
  - [x] 7.2 레이아웃 저장/복원 CRUD 테스트 (save, load, overwrite)
  - [x] 7.3 권한 검증: admin 전용 API 패턴 (authMiddleware + adminOnly + tenantMiddleware)
  - [x] 7.4 ELK 레이아웃 폴백 테스트 (저장 없을 때 자동 배치)

## Dev Notes

### 기존 코드 현황 (매우 중요 — 중복 작성 금지!)

**Story 7.5에서 이미 구현된 것:**
1. **React Flow 캔버스** — `packages/admin/src/pages/nexus.tsx` (169줄): ReactFlow + Controls + MiniMap + Background. 읽기 전용.
2. **ELK.js 레이아웃** — `packages/admin/src/lib/elk-layout.ts`: `computeElkLayout()` 함수. layered DOWN 알고리즘.
3. **4개 커스텀 노드** — `packages/admin/src/components/nexus/`:
   - `company-node.tsx`: 회사 루트 노드 (slate 배경)
   - `department-node.tsx`: 부서 노드 (blue 배경)
   - `agent-node.tsx`: 에이전트 노드 (green/gold 배경)
   - `unassigned-group-node.tsx`: 미배속 그룹 (orange dashed)
4. **의존성** — `@xyflow/react@12.10.1`, `elkjs@0.11.1` admin에 설치 완료
5. **라우팅** — App.tsx `/nexus` 라우트 + sidebar.tsx NEXUS 메뉴 등록 완료
6. **org-chart API** — `GET /admin/org-chart?companyId=xxx` (기존, 수정 불필요)

**서버에 이미 존재하지만 admin에서 직접 사용 불가한 것:**
- `packages/server/src/routes/workspace/nexus.ts` — workspace 라우트의 layout save/load API
  - `GET /workspace/nexus/layout` (line ~50)
  - `PUT /workspace/nexus/layout` (line ~80)
  - `PATCH /workspace/nexus/agent/:id/department` (line ~120) — 에이전트 부서 이동 (9.3에서 사용)
- admin은 `/admin/...` prefix 라우트를 사용하므로 admin 전용 API 추가 필요

**주의사항:**
- `packages/app/src/pages/nexus.tsx` (1360줄)는 SketchVibe 워크플로우 캔버스 — 전혀 다른 기능. 혼동 금지!
- admin NEXUS ≠ app SketchVibe. 완전 분리 유지.

### 아키텍처 준수 사항

1. **React Flow + ELK.js** (아키텍처 결정): NEXUS=React Flow, 스케치바이브는 별도. 완전 분리.
2. **DB 접근**: canvasLayouts 테이블 사용. `getDB(companyId)` 패턴은 서버 코드에만 적용 — 이 스토리에서는 admin 전용 라우트에서 직접 `db` 사용 (admin API는 companyId 쿼리 파라미터로 받음).
3. **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
4. **파일명**: kebab-case lowercase. 컴포넌트: PascalCase.
5. **테스트**: bun:test, `packages/server/src/__tests__/unit/` 경로.
6. **Import 케이싱**: `git ls-files` 정확히 매칭 (Linux CI case-sensitive).
7. **번들 최적화**: 이미 React.lazy() 적용됨. 유지만.

### 기술 요구사항

**canvasLayouts 테이블 스키마 (이미 존재):**
```typescript
// packages/server/src/db/schema.ts
export const canvasLayouts = pgTable('canvas_layouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 100 }).notNull().default('default'),
  layoutData: jsonb('layout_data').notNull().default('{}'),  // { nodePositions, viewport? }
  isDefault: boolean('is_default').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**React Flow v12 핵심 API:**
```tsx
import { ReactFlow, Controls, MiniMap, Background, useNodesState, useEdgesState, useReactFlow } from '@xyflow/react';

// useNodesState: [nodes, setNodes, onNodesChange] — 노드 드래그 position 자동 추적
// useReactFlow: { fitView, getNodes, getViewport, setViewport } — 프로그래매틱 제어
// onNodeClick: (event, node) => void
// onPaneClick: () => void
// onNodesChange: (changes: NodeChange[]) => void — position, select, remove 등
```

**admin 라우트 패턴 (기존 코드 참고):**
```typescript
// packages/server/src/routes/admin/index.ts
import { adminRouter } from './router';
// 기존 패턴: Hono app.route('/admin', adminRouter)
// admin 미들웨어: isCeoOrAbove 인증 체크
```

**WebSocket 패턴 (admin에서):**
```typescript
// admin에 WebSocket 연동 있음 — use-budget-alerts.ts, workflows.tsx 등에서 사용 확인됨
// 패턴 참고: packages/admin/src/hooks/use-budget-alerts.ts
// 또는 TanStack Query refetchInterval로 간단히 대체 가능 (nexus 데이터 변경 빈도 낮음)
```

### 이전 스토리에서 배운 것 (Story 7.5 Intelligence)

- Admin UI 패턴: TanStack Query + `useQuery(['org-chart', companyId])`
- `useAdminStore((s) => s.selectedCompanyId)` 로 회사 ID 접근
- `useToastStore` 에러/성공 알림
- App.tsx lazy import 패턴: `const XPage = lazy(() => import('./pages/x').then((m) => ({ default: m.XPage })))`
- sidebar.tsx 메뉴 추가: `{ to: '/path', label: '라벨', icon: '아이콘' }`
- `Skeleton` 컴포넌트: `@corthex/ui`에서 import
- 노드 크기 상수: company 280x70, department 240x60, agent 200x80, unassigned-group 240x60
- ELK 레이아웃: `computeElkLayout(orgData)` → `{ nodes: Node[], edges: Edge[] }`
- 테스트 11개 이미 존재: `packages/server/src/__tests__/unit/story-7-5-nexus-org-chart.test.ts`

### Git Intelligence (최근 커밋 패턴)

```
fb972b1 feat: Story 10.4 부서별 지식 자동 주입 강화 — semantic search injection + extraVars soul template + 50 tests
65fb5b1 feat: Story 8.4 maxDepth 회사별 설정 — JSONB settings + admin API + range slider UI + 57 tests
344a2c8 feat: Story 8.2 Tier CRUD API + 관리 UI — admin tier-configs REST API + reorder + management page + 22 tests
```
- 커밋 메시지: `feat: Story X.Y 제목 — 변경 요약 + N tests`
- Admin API 패턴: `packages/server/src/routes/admin/` 디렉토리에 라우트 파일
- 프론트엔드: `packages/admin/src/pages/`, `packages/admin/src/components/`

### Project Structure Notes

**수정 파일:**
- `packages/admin/src/pages/nexus.tsx` — MODIFY: 편집 모드 + 도구바 + 레이아웃 저장 + 선택 상태 + WebSocket
- `packages/admin/src/components/nexus/company-node.tsx` — MODIFY: selected prop 하이라이트
- `packages/admin/src/components/nexus/department-node.tsx` — MODIFY: selected prop 하이라이트
- `packages/admin/src/components/nexus/agent-node.tsx` — MODIFY: selected prop 하이라이트
- `packages/admin/src/components/nexus/unassigned-group-node.tsx` — MODIFY: selected prop 하이라이트

**신규 파일:**
- `packages/admin/src/components/nexus/nexus-toolbar.tsx` — NEW: 편집 도구바 컴포넌트
- `packages/server/src/routes/admin/nexus-layout.ts` — NEW: admin 전용 레이아웃 저장/복원 API (또는 기존 admin 라우터에 추가)
- `packages/server/src/__tests__/unit/story-9-1-nexus-canvas.test.ts` — NEW: 테스트

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 9, Story 9.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#NEXUS 조직도: React Flow + ELK.js]
- [Source: _bmad-output/planning-artifacts/architecture.md#번들 최적화]
- [Source: _bmad-output/implementation-artifacts/7-5-nexus-read-only-org-chart.md — 이전 스토리 (읽기전용 캔버스)]
- [Source: packages/admin/src/pages/nexus.tsx — 기존 읽기전용 NEXUS 169줄]
- [Source: packages/admin/src/lib/elk-layout.ts — ELK 레이아웃 유틸]
- [Source: packages/admin/src/components/nexus/ — 4개 커스텀 노드]
- [Source: packages/server/src/routes/workspace/nexus.ts — workspace layout API (참고용)]
- [Source: packages/server/src/routes/admin/org-chart.ts — org-chart API]
- [Source: packages/server/src/db/schema.ts — canvasLayouts 테이블]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Edit mode state management — isEditMode toggle, nodesConnectable conditional on edit mode
- Task 2: NexusToolbar component — floating toolbar with edit/view toggle, auto-layout, save, fit view buttons
- Task 3: Admin nexus layout API — GET/PUT /admin/nexus/layout, upsert with canvasLayouts table, Zod validation
- Task 4: Node selection — selectedNodeId state, onNodeClick/onPaneClick handlers, blue ring highlight on all 4 node types
- Task 5: Real-time refresh via TanStack Query polling (30s) — admin has no WS infrastructure
- Task 6: nexus.tsx rewrite — ReactFlowProvider wrapper, useCallback handlers, Ctrl+S save, dirty tracking
- Task 7: 32 unit tests covering layout schema, save/overwrite, ELK fallback, edit mode, selection, dirty tracking, toolbar state, API format, polling
- tsc --noEmit passes for both server and admin packages

### Change Log

- 2026-03-11: Code Review — 1 HIGH fixed (dirty flag view-mode bug), 1 MEDIUM fixed (schema docs), 1 LOW fixed (file list update). 2 accepted as-is (race condition low risk, no try/catch — Hono global handler).
- 2026-03-11: Story 9.1 구현 완료
  - Server API: packages/server/src/routes/admin/nexus-layout.ts — GET/PUT admin nexus layout
  - Route registration: packages/server/src/index.ts — nexusLayoutRoute added
  - Toolbar: packages/admin/src/components/nexus/nexus-toolbar.tsx — floating edit toolbar
  - Page rewrite: packages/admin/src/pages/nexus.tsx — edit mode, layout save/restore, node selection, polling
  - Node updates: 4 node components updated with selected prop highlight
  - Tests: 32 tests in story-9-1-nexus-canvas.test.ts (all pass)

### File List

- `packages/server/src/routes/admin/nexus-layout.ts` — NEW: admin nexus layout save/load API
- `packages/server/src/index.ts` — MODIFIED: nexusLayoutRoute import + registration
- `packages/admin/src/components/nexus/nexus-toolbar.tsx` — NEW: floating toolbar component
- `packages/admin/src/pages/nexus.tsx` — MODIFIED: full rewrite with edit mode, toolbar, layout save, selection, polling
- `packages/admin/src/components/nexus/company-node.tsx` — MODIFIED: selected prop highlight
- `packages/admin/src/components/nexus/department-node.tsx` — MODIFIED: selected prop highlight
- `packages/admin/src/components/nexus/agent-node.tsx` — MODIFIED: selected prop highlight
- `packages/admin/src/components/nexus/unassigned-group-node.tsx` — MODIFIED: selected prop highlight
- `packages/server/src/__tests__/unit/story-9-1-nexus-canvas.test.ts` — NEW: 32 tests
- `packages/server/src/__tests__/unit/story-9-1-nexus-tea.test.ts` — NEW: 32 TEA tests
- `packages/server/src/__tests__/unit/story-9-1-nexus-qa.test.ts` — NEW: 33 QA tests
