# Story 9.3: 드래그&드롭 편집

Status: done

## Story

As a 관리자,
I want 에이전트를 드래그하여 다른 부서로 이동하는 것을,
so that UI에서 직관적으로 조직을 재편할 수 있다.

## Acceptance Criteria

1. **에이전트 드래그&드롭 부서 이동** — 에이전트 노드를 드래그하여 부서 노드 위에 드롭 → API 호출로 `departmentId` 변경. 미배속 영역에 드롭하면 `departmentId=null`로 변경.
2. **드롭 가능 영역 하이라이트** — 에이전트 노드 드래그 중 부서 노드와 미배속 그룹에 시각적 드롭 대상 하이라이트 표시 (파란 글로우/점선 테두리)
3. **실시간 레이아웃 재배치** — 부서 이동 성공 후 org-chart 데이터 리패치 → ELK.js 자동 재배치
4. **Undo/Redo 기능** — Ctrl+Z로 마지막 이동 실행 취소 (API 호출로 원래 부서 복원). Ctrl+Shift+Z 또는 Ctrl+Y로 Redo. 히스토리 스택 최대 20개.
5. **비서 이동 불가** — `isSecretary=true` 에이전트는 드래그 시 이동 불가 표시 (커서 not-allowed + 토스트 경고). CEO 직속 고정.
6. **멀티 선택 일괄 이동** — Ctrl+클릭으로 여러 에이전트 선택 → 부서 노드에 드롭 시 일괄 이동. 선택 카운터 표시.
7. **에이전트 부서 이동 Admin API** — `PATCH /admin/nexus/agent/:id/department` 엔드포인트 (workspace nexus.ts의 기존 패턴 참고하여 admin 전용 생성)

## Tasks / Subtasks

- [x] Task 1: Admin 에이전트 부서 이동 API (AC: #7)
  - [x]1.1 `packages/server/src/routes/admin/nexus-layout.ts` — PATCH 엔드포인트 추가
    - Path: `/nexus/agent/:id/department`
    - Body schema: `{ departmentId: z.string().uuid().nullable() }`
    - Validation: 에이전트 존재 + companyId 일치 확인
    - **비서 이동 차단**: `isSecretary=true` → 403 에러 반환 (`NEXUS_001: 비서 에이전트는 이동할 수 없습니다`)
    - departmentId가 null이 아닌 경우: 부서 존재 + 같은 companyId 확인
    - 성공: agents 테이블 `departmentId` 업데이트 + `updatedAt` 갱신
    - `logActivity()` 호출 (기존 workspace nexus.ts 패턴 참고)
    - 응답: `{ data: updatedAgent }`
  - [x]1.2 **일괄 이동 API**: `PATCH /nexus/agents/department` (복수)
    - Body: `{ agentIds: z.array(z.string().uuid()).min(1).max(50), departmentId: z.string().uuid().nullable() }`
    - 비서 필터링: 비서 에이전트는 건너뛰고 나머지만 이동
    - 응답: `{ data: { moved: number, skipped: number, skippedReasons: string[] } }`

- [x] Task 2: 드래그&드롭 핵심 로직 (AC: #1, #2)
  - [x]2.1 `packages/admin/src/pages/nexus.tsx` — 드롭 이벤트 처리
    - **DragContext 상태**: `draggingAgentId: string | null`, `dropTargetId: string | null`
    - 에이전트 노드 드래그 시작 시: `isEditMode=true`일 때만 활성화
    - 부서 노드 근접 감지: React Flow `onNodeDragStop` + 위치 기반 히트테스트
    - 히트테스트 로직: 드래그 중인 에이전트의 중심점이 부서 노드 영역(rect) 안에 들어오면 드롭 대상으로 인식
    - 드롭 성공: `api.patch('/admin/nexus/agent/:id/department', { departmentId })` 호출
    - 드롭 후: `queryClient.invalidateQueries(['org-chart'])` → 자동 리패치 → ELK 재배치
  - [x]2.2 **히트테스트 유틸**: `packages/admin/src/lib/nexus-hit-test.ts` (NEW)
    - `findDropTarget(dragNodeId, dragPos, allNodes): { targetId: string, type: 'department' | 'unassigned-group' } | null`
    - 부서 노드와 미배속 그룹 노드의 영역(position + NODE_SIZES)과 비교
    - 이미 같은 부서면 null 반환 (불필요한 API 호출 방지)

- [x] Task 3: 드롭 영역 하이라이트 (AC: #2)
  - [x]3.1 `packages/admin/src/components/nexus/department-node.tsx` — MODIFY
    - `isDropTarget` prop 추가: `data.isDropTarget === true` 일 때
    - 하이라이트 스타일: `ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 border-blue-400 border-dashed scale-105 transition-transform`
  - [x]3.2 `packages/admin/src/components/nexus/unassigned-group-node.tsx` — MODIFY
    - 동일한 `isDropTarget` 하이라이트 적용
  - [x]3.3 `packages/admin/src/pages/nexus.tsx` — 드래그 중 노드 데이터에 `isDropTarget` 주입
    - `onNodeDrag` 이벤트에서 히트테스트 실행 → 대상 노드의 data에 `isDropTarget=true` 설정
    - 드래그 종료 시 모든 `isDropTarget` 초기화

- [x] Task 4: Undo/Redo 시스템 (AC: #4)
  - [x]4.1 `packages/admin/src/hooks/use-nexus-undo.ts` — NEW
    - `UndoAction` 타입: `{ type: 'move-agent', agentId: string, fromDeptId: string | null, toDeptId: string | null }`
    - `undoStack: UndoAction[]`, `redoStack: UndoAction[]` (최대 20개)
    - `pushAction(action)`: undoStack에 추가, redoStack 초기화
    - `undo()`: undoStack에서 pop → API 호출로 원래 부서 복원 → redoStack에 push
    - `redo()`: redoStack에서 pop → API 호출로 이동 재실행 → undoStack에 push
    - `canUndo`, `canRedo` boolean getters
  - [x]4.2 키보드 바인딩: `Ctrl+Z` → undo(), `Ctrl+Shift+Z` / `Ctrl+Y` → redo()
  - [x]4.3 NexusToolbar에 Undo/Redo 버튼 추가 (편집 모드에서만 표시)
    - Undo 버튼: `canUndo ? 'bg-slate-700' : 'bg-slate-700/50 cursor-not-allowed'`
    - Redo 버튼: 동일 패턴
    - 툴팁에 마지막 액션 설명 표시

- [x] Task 5: 비서 이동 차단 (AC: #5)
  - [x]5.1 `packages/admin/src/pages/nexus.tsx` — 드래그 시작 시 비서 체크
    - `onNodeDragStart`: 에이전트 노드이고 `data.isSecretary=true`이면 드래그 취소
    - 토스트 경고: `'비서 에이전트는 이동할 수 없습니다. CEO 직속으로 고정됩니다.'`
  - [x]5.2 에이전트 노드 데이터에 `isSecretary` 이미 포함되어 있음 (9.2에서 구현됨)

- [x] Task 6: 멀티 선택 일괄 이동 (AC: #6)
  - [x]6.1 `packages/admin/src/pages/nexus.tsx` — 멀티 선택 상태 관리
    - `selectedAgentIds: Set<string>` 상태
    - Ctrl+클릭: 에이전트 노드 선택 토글 (비서 제외)
    - 선택된 에이전트 노드: 추가 하이라이트 (`ring-2 ring-amber-400/50`)
    - 선택 카운터: 도구바 옆에 `"N개 선택됨"` 뱃지
    - Escape 키: 선택 전체 해제
  - [x]6.2 일괄 드롭: 선택된 에이전트 중 하나를 드래그 → 부서에 드롭 → 전체 선택 에이전트 일괄 이동
    - `api.patch('/admin/nexus/agents/department', { agentIds: [...], departmentId })`
    - 성공 토스트: `"N개 에이전트가 [부서명]으로 이동되었습니다"`
    - Undo: 일괄 이동도 단일 undo 액션으로 처리 (각 에이전트의 원래 부서 기록)

- [x] Task 7: 테스트 (AC: 전체)
  - [x]7.1 `packages/server/src/__tests__/unit/story-9-3-drag-drop.test.ts` — NEW
  - [x]7.2 단일 에이전트 이동 API 테스트: 정상 이동, 비서 이동 차단, 존재하지 않는 에이전트, 잘못된 부서 ID
  - [x]7.3 일괄 이동 API 테스트: 복수 이동, 비서 스킵, 빈 배열, 최대 50개 제한
  - [x]7.4 히트테스트 로직 테스트: 영역 내 드롭, 영역 외, 같은 부서 무시, 미배속 그룹 드롭
  - [x]7.5 Undo/Redo 스택 테스트: push/undo/redo, 최대 20개 제한, 비서 undo 불가
  - [x]7.6 멀티 선택 데이터 테스트: 선택/해제/전체 해제, 비서 선택 차단

## Dev Notes

### 기존 코드 현황 (중복 작성 금지!)

**Story 9.1에서 이미 구현된 것 (건드리지 마!):**
1. **React Flow 캔버스** — `packages/admin/src/pages/nexus.tsx`: edit/view 모드, 레이아웃 저장/복원, 노드 선택, 도구바, 30초 폴링
2. **ELK.js 레이아웃** — `packages/admin/src/lib/elk-layout.ts`: `computeElkLayout()` layered DOWN
3. **5개 커스텀 노드** — `packages/admin/src/components/nexus/`:
   - `company-node.tsx`: 회사 루트 (slate, 280x70)
   - `department-node.tsx`: 부서 (blue, 240x60) — 이름+설명+agentCount+employeeCount+managerName
   - `agent-node.tsx`: 에이전트 (green/amber, 200x80) — 상태 점+tier 뱃지+비서 팔각형+subordinateCount
   - `human-node.tsx`: 인간 직원 (purple, 200x70) — CLI 토큰+역할 뱃지
   - `unassigned-group-node.tsx`: 미배속 (orange dashed, 240x60)
4. **도구바** — `packages/admin/src/components/nexus/nexus-toolbar.tsx` — 편집/보기+저장+자동정렬+전체보기+내보내기
5. **Admin 레이아웃 API** — `packages/server/src/routes/admin/nexus-layout.ts` — GET/PUT 레이아웃
6. **org-chart API** — `packages/server/src/routes/admin/org-chart.ts` — employees + reportTo + tierLevel 포함
7. **내보내기** — `packages/admin/src/lib/nexus-export.ts` — PNG/SVG/JSON/인쇄

**Story 9.2에서 추가된 것:**
- 인간 직원 노드 (HumanNode 컴포넌트)
- 4 엣지 타입 (membership, employment, delegation, ownership)
- tier 레벨 숫자 (T1/T2/T3)
- 비서 팔각형 clip-path
- subordinateCount 미니 카운터

### 기존 workspace nexus API 참고 (Admin 버전 필요)

```typescript
// workspace/nexus.ts line 255-299 — 에이전트 부서 이동 API
// 이 패턴을 admin 전용으로 복제:
const reassignSchema = z.object({
  departmentId: z.string().uuid().nullable(),
})

// PATCH /api/workspace/nexus/agent/:id/department
// - tenant.companyId로 에이전트 소유 확인
// - agents.departmentId 업데이트
// - logActivity() 호출
```

**Admin 전용 차이점:**
- 미들웨어: `authMiddleware, adminOnly` (tenant 방식이 아니라 companyId 쿼리 파라미터 → 기존 org-chart.ts 패턴 참고)
- 비서 이동 차단 로직 추가 (workspace 버전에는 없음)
- 일괄 이동 API 추가

### 드래그&드롭 기술 설계

**React Flow 드래그 이벤트 흐름:**
```
1. onNodeDragStart(event, node)
   → isEditMode + node.type === 'agent' + !isSecretary 확인
   → draggingAgentId 설정

2. onNodeDrag(event, node)
   → 히트테스트: findDropTarget(node.id, node.position, allNodes)
   → 부서 노드에 isDropTarget=true 데이터 주입
   → setNodes()로 업데이트 (React Flow의 노드 데이터 갱신)

3. onNodeDragStop(event, node)
   → 최종 히트테스트
   → 드롭 대상 있으면: API 호출 → org-chart 리패치
   → 드롭 대상 없으면: 원래 위치로 복원
   → 모든 isDropTarget 초기화
```

**히트테스트 알고리즘:**
```typescript
function findDropTarget(
  dragNodeId: string,
  dragCenter: { x: number; y: number },
  nodes: Node[],
  nodeOriginalDeptId: string | null  // 현재 소속 부서
): DropTarget | null {
  const dragCenterX = dragCenter.x + NODE_SIZES.agent.width / 2
  const dragCenterY = dragCenter.y + NODE_SIZES.agent.height / 2

  for (const node of nodes) {
    if (node.type !== 'department' && node.type !== 'unassigned-group') continue
    const key = node.type as keyof typeof NODE_SIZES
    const { width, height } = NODE_SIZES[key]

    if (
      dragCenterX >= node.position.x &&
      dragCenterX <= node.position.x + width &&
      dragCenterY >= node.position.y &&
      dragCenterY <= node.position.y + height
    ) {
      // 부서 노드: dept-{id}에서 id 추출
      const targetDeptId = node.type === 'department'
        ? node.id.replace('dept-', '')
        : null

      // 같은 부서면 무시
      if (targetDeptId === nodeOriginalDeptId) return null

      return { targetNodeId: node.id, departmentId: targetDeptId, deptName: node.data?.name }
    }
  }
  return null
}
```

### Undo/Redo 설계

```typescript
type UndoAction =
  | { type: 'move-agent'; agentId: string; fromDeptId: string | null; toDeptId: string | null }
  | { type: 'batch-move'; agents: Array<{ agentId: string; fromDeptId: string | null }>; toDeptId: string | null }

// useNexusUndo hook returns:
// { pushAction, undo, redo, canUndo, canRedo, undoLabel, redoLabel }

// Undo는 API 호출이므로 비동기:
// undo() → api.patch('/admin/nexus/agent/:id/department', { departmentId: fromDeptId })
// redo() → api.patch('/admin/nexus/agent/:id/department', { departmentId: toDeptId })
```

### 멀티 선택 UX

- React Flow 기본: `elementsSelectable={true}` + Ctrl+클릭으로 다중 선택
- 커스텀: 에이전트 노드만 선택 가능 (부서/회사/미배속 그룹 노드 선택 시 선택 목록에서 제외)
- 비서 노드: 선택은 가능하지만 이동 대상에서 제외 (스킵)
- 선택된 에이전트 중 하나를 드래그하면 모든 선택 에이전트가 함께 이동

### 아키텍처 준수 사항

1. **React Flow + ELK.js** — NEXUS 전용. Cytoscape는 SketchVibe 전용. 혼동 금지.
2. **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }` (org-chart는 기존 `{ data }` 형식 유지)
3. **DB 접근**: admin API는 `db` 직접 사용 (admin API 패턴). getDB() 아님.
4. **파일명**: kebab-case. 컴포넌트: PascalCase.
5. **테스트**: bun:test, `packages/server/src/__tests__/unit/` 경로.
6. **Admin 미들웨어**: `authMiddleware, adminOnly` (org-chart.ts 패턴)
7. **nexus-layout.ts에 추가**: 새 라우트 파일 만들지 말고 기존 `nexus-layout.ts`에 PATCH 엔드포인트 추가

### DB 스키마 참고

```
agents: id, companyId, departmentId(nullable FK→departments), name, isSecretary, isActive, ...
departments: id, companyId, name, description, isActive, ...
```

### 에이전트 노드 데이터 구조 (elk-layout.ts에서 생성)

```typescript
// 에이전트 노드 data에 이미 포함된 필드:
data: {
  name: string
  tier: string
  tierLevel: number | null
  status: string
  isSecretary: boolean
  isSystem: boolean
  subordinateCount: number
}
// 이 스토리에서 추가할 필드:
data: {
  ...기존,
  agentId: string,        // 실제 DB agent.id (API 호출용)
  departmentId: string | null,  // 현재 소속 부서 ID (히트테스트 비교용)
  isDropTarget?: boolean, // 드래그 중 드롭 대상 표시
}
```

**중요**: 현재 elk-layout.ts의 에이전트 노드에는 `agentId`와 `departmentId`가 data에 포함되지 않음. 이 스토리에서 추가 필요.

### 이전 스토리 인텔리전스

**9.1에서 배운 것:**
- `useAdminStore((s) => s.selectedCompanyId)`로 회사 ID 접근
- `useToastStore`로 알림
- `useQuery`, `useMutation`, `useQueryClient` 패턴
- `onNodesChange` 콜백에서 position 변경 감지 (edit mode only)
- Ctrl+S 키보드 바인딩 패턴

**9.2에서 배운 것:**
- 노드 데이터에 새 필드 추가는 elk-layout.ts에서
- org-chart API 확장은 org-chart.ts에서
- 엣지 타입별 스타일은 EDGE_STYLES 상수로 관리

### Project Structure Notes

**수정 파일:**
- `packages/server/src/routes/admin/nexus-layout.ts` — MODIFY: PATCH agent department + batch endpoint
- `packages/admin/src/pages/nexus.tsx` — MODIFY: drag-drop handlers + multi-select + undo keyboard
- `packages/admin/src/lib/elk-layout.ts` — MODIFY: agentId + departmentId를 노드 data에 추가
- `packages/admin/src/components/nexus/department-node.tsx` — MODIFY: isDropTarget 하이라이트
- `packages/admin/src/components/nexus/unassigned-group-node.tsx` — MODIFY: isDropTarget 하이라이트
- `packages/admin/src/components/nexus/nexus-toolbar.tsx` — MODIFY: Undo/Redo 버튼 + 선택 카운터

**신규 파일:**
- `packages/admin/src/lib/nexus-hit-test.ts` — NEW: 드롭 대상 히트테스트 유틸
- `packages/admin/src/hooks/use-nexus-undo.ts` — NEW: Undo/Redo 히스토리 훅
- `packages/server/src/__tests__/unit/story-9-3-drag-drop.test.ts` — NEW: 테스트

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 9, Story 9.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#NEXUS 조직도: React Flow + ELK.js]
- [Source: _bmad-output/implementation-artifacts/9-1-nexus-react-flow-canvas.md — 이전 스토리]
- [Source: _bmad-output/implementation-artifacts/9-2-nexus-node-visualization.md — 이전 스토리]
- [Source: packages/admin/src/pages/nexus.tsx — 현재 NEXUS 캔버스 (384줄)]
- [Source: packages/admin/src/lib/elk-layout.ts — ELK 레이아웃 유틸 (310줄)]
- [Source: packages/admin/src/components/nexus/ — 5개 커스텀 노드]
- [Source: packages/server/src/routes/admin/nexus-layout.ts — admin 레이아웃 API]
- [Source: packages/server/src/routes/admin/org-chart.ts — org-chart API]
- [Source: packages/server/src/routes/workspace/nexus.ts — workspace 에이전트 이동 API (참고용, line 255-299)]
- [Source: packages/server/src/db/schema.ts — agents, departments 테이블]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Admin API — PATCH /nexus/agent/:id/department (single) + PATCH /nexus/agents/department (batch). Secretary move blocked with NEXUS_001 error. Department validation, logActivity.
- Task 2: Drag-drop core — onNodeDragStart/Drag/DragStop handlers in nexus.tsx. Hit-test utility (nexus-hit-test.ts) with center-point overlap detection.
- Task 3: Drop target highlight — isDropTarget prop on department-node + unassigned-group-node. Blue ring + dashed border + scale-105 transition.
- Task 4: Undo/Redo — useNexusUndo hook with 20-action max history. Single + batch move support. Ctrl+Z/Ctrl+Shift+Z/Ctrl+Y keyboard bindings. Toolbar buttons.
- Task 5: Secretary block — onNodeDragStart checks isSecretary, shows warning toast, blocks drag. Server-side 403 validation.
- Task 6: Multi-select — Ctrl+click agent toggle. selectedAgentIds Set state. Batch move on drag-drop of selected agent. Selection counter in toolbar. Escape clears.
- Task 7: 47 unit tests covering API schema, secretary prevention, hit-test, undo/redo stack, multi-select, node data extension, drop target highlight, edge cases, toolbar state.
- tsc --noEmit passes for both server and admin packages
- elk-layout.ts updated: agentId + departmentId now included in agent node data

### Change Log

- 2026-03-11: Story 9.3 implementation complete — 10 files changed/created, 47 tests

### File List

- `packages/server/src/routes/admin/nexus-layout.ts` — MODIFIED: added PATCH single + batch agent reassignment endpoints
- `packages/admin/src/pages/nexus.tsx` — MODIFIED: drag-drop handlers, multi-select, undo/redo, keyboard shortcuts
- `packages/admin/src/lib/elk-layout.ts` — MODIFIED: added agentId + departmentId to agent node data
- `packages/admin/src/lib/nexus-hit-test.ts` — NEW: drop target hit-test utility
- `packages/admin/src/hooks/use-nexus-undo.ts` — NEW: undo/redo history hook
- `packages/admin/src/components/nexus/department-node.tsx` — MODIFIED: isDropTarget highlight
- `packages/admin/src/components/nexus/unassigned-group-node.tsx` — MODIFIED: isDropTarget highlight
- `packages/admin/src/components/nexus/nexus-toolbar.tsx` — MODIFIED: undo/redo buttons + selection counter
- `packages/server/src/__tests__/unit/story-9-3-drag-drop.test.ts` — NEW: 47 tests
