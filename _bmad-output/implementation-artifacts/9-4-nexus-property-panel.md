# Story 9.4: 속성 패널

Status: review

## Story

As a 관리자,
I want 노드를 선택하면 우측 패널에서 상세 정보를 편집하는 것을,
so that 캔버스에서 벗어나지 않고 에이전트 설정을 변경할 수 있다.

## Acceptance Criteria

1. **노드 클릭 → 우측 속성 패널 표시** — 에이전트/부서/인간직원/회사 노드 선택 시 캔버스 우측에 슬라이드인 패널 표시. 캔버스 빈 공간 클릭 시 패널 닫힘.
2. **에이전트 속성** — 이름(인라인 편집), tier(드롭다운: Manager/Specialist/Worker), 모델명(읽기전용), allowed_tools(체크리스트), Soul 편집 링크(에이전트 관리 페이지로 이동), 상태/비서/시스템 뱃지 표시
3. **부서 속성** — 이름(인라인 편집), 설명(텍스트영역 편집), 매니저 지정(해당 부서 에이전트 드롭다운), 소속 에이전트 수/직원 수 표시
4. **인간 직원 속성** — 이름, 역할, CLI 토큰 상태, 소유 에이전트 목록 (읽기전용 — 편집은 직원 관리 페이지)
5. **회사 노드 속성** — 회사명, 부서 수, 에이전트 수, 직원 수 (읽기전용)
6. **인라인 저장** — 변경 시 debounce 500ms 후 자동 저장. 낙관적 업데이트 + 실패 시 롤백. 저장 중/성공/에러 상태 표시.
7. **패널 반응형** — 패널 폭 w-80(320px). 캔버스와 나란히 배치. 패널 열릴 때 ReactFlow fitView 재호출하여 캔버스 영역 조정.

## Tasks / Subtasks

- [x] Task 1: 속성 패널 컨테이너 컴포넌트 (AC: #1, #7)
  - [x]1.1 `packages/admin/src/components/nexus/property-panel.tsx` — NEW
    - Props: `{ selectedNodeId: string | null, orgData: OrgChartData, onClose: () => void }`
    - 노드 ID 파싱하여 타입 판별: `agent-{id}` → AgentPanel, `dept-{id}` → DepartmentPanel, `human-{id}` → HumanPanel, `company-{id}` → CompanyPanel
    - 슬라이드인 애니메이션: `translate-x-full` → `translate-x-0` (transition-transform duration-200)
    - 외부: `w-80 bg-slate-900 border-l border-slate-700 h-full overflow-y-auto`
    - 닫기 버튼(X) 우상단 + Esc 키 바인딩
  - [x]1.2 `nexus.tsx` 레이아웃 수정
    - ReactFlow 컨테이너와 패널을 flex row로 배치
    - `selectedNodeId` 있을 때: 캔버스 `flex-1` + 패널 `w-80`
    - `selectedNodeId` 없을 때: 캔버스 `w-full`
    - 패널 열림/닫힘 시 `fitView({ padding: 0.2 })` 재호출 (useEffect로 selectedNodeId 변화 감지)

- [x] Task 2: 에이전트 속성 패널 (AC: #2, #6)
  - [x]2.1 `packages/admin/src/components/nexus/panels/agent-panel.tsx` — NEW
    - 입력 Props: `{ agent: OrgAgent, companyId: string }`
    - 표시 섹션:
      1. 헤더: 상태 점 + 이름 + 비서/시스템 뱃지
      2. 이름 편집: `<Input>` 컴포넌트, 기존값 표시, blur/Enter 시 저장
      3. Tier 선택: `<Select>` — Manager(1)/Specialist(2)/Worker(3), tierLevel 숫자 표시
      4. 모델명: 읽기전용 `<Badge>` 표시
      5. 소속 부서: 읽기전용 (현재 부서명)
      6. Soul 편집 링크: `<a>` → `/agents` 페이지 (새 탭, `target="_blank"`)
      7. 허용 도구: 체크리스트 UI (토글 스위치 또는 체크박스)
  - [x]2.2 TanStack Query mutation 설정
    - `useMutation` → `PATCH /api/admin/agents/:id`
    - Body: `{ name?, tierLevel?, allowedTools? }` (변경된 필드만)
    - `onMutate`: 낙관적 업데이트 — queryClient.setQueryData(['org-chart', companyId], 업데이트된 데이터)
    - `onError`: 롤백 — queryClient.setQueryData 이전 값 복원
    - `onSettled`: `queryClient.invalidateQueries(['org-chart', companyId])`
  - [x]2.3 Debounce 저장 로직
    - `useRef(setTimeout)` 방식으로 500ms debounce
    - 이름 입력 중일 때: keyDown마다 debounce reset
    - 저장 상태 표시: 헤더 옆 작은 텍스트 ("저장 중...", "✓ 저장됨", "저장 실패")

- [x] Task 3: 부서 속성 패널 (AC: #3, #6)
  - [x]3.1 `packages/admin/src/components/nexus/panels/department-panel.tsx` — NEW
    - 입력 Props: `{ department: OrgDepartment, allAgents: OrgAgent[], companyId: string }`
    - 표시 섹션:
      1. 헤더: 부서명 + 에이전트 수 뱃지 + 직원 수 뱃지
      2. 이름 편집: `<Input>` blur/Enter 시 저장
      3. 설명 편집: `<Textarea>` blur 시 저장 (rows=3)
      4. 매니저 지정: `<Select>` — 해당 부서 소속 에이전트 목록 + "없음" 옵션
         - 매니저 변경 시: 선택한 에이전트의 tier를 'manager'로 PATCH + 이전 매니저 tier 해제
         - 실제로는 에이전트의 `role` 또는 `tier` 필드를 업데이트 (기존 agents PATCH API 사용)
      5. 소속 에이전트 목록: 이름 나열 (클릭 시 해당 에이전트 노드 선택)
      6. 소속 직원 목록: 이름 나열 (읽기전용)
  - [x]3.2 TanStack Query mutation
    - 부서 업데이트: `PATCH /api/admin/departments/:id` — `{ name?, description? }`
    - 매니저 지정: `PATCH /api/admin/agents/:id` — `{ tier: 'manager' }`
    - 동일 낙관적 업데이트/롤백 패턴

- [x] Task 4: 인간 직원 속성 패널 (AC: #4)
  - [x]4.1 `packages/admin/src/components/nexus/panels/human-panel.tsx` — NEW
    - 입력 Props: `{ employee: OrgEmployee, ownedAgents: OrgAgent[] }`
    - 전부 읽기전용:
      1. 헤더: 이름 + 역할 뱃지
      2. CLI 토큰 상태: "등록됨 🟢" / "미등록 ⚪"
      3. 소유 에이전트 목록: 이름 나열 (클릭 시 해당 에이전트 노드 선택)
      4. 하단: "직원 관리에서 편집" 링크 → `/employees` 또는 해당 관리 페이지

- [x] Task 5: 회사 노드 속성 패널 (AC: #5)
  - [x]5.1 `packages/admin/src/components/nexus/panels/company-panel.tsx` — NEW
    - 입력 Props: `{ company: OrgCompany, stats: { deptCount, agentCount, employeeCount } }`
    - 전부 읽기전용:
      1. 회사명 + 로고/이니셜
      2. 통계: 부서 N개, 에이전트 N명, 직원 N명
      3. 하단: "회사 설정" 링크 → `/settings`

- [x] Task 6: 테스트 (AC: 전체)
  - [x]6.1 `packages/server/src/__tests__/unit/story-9-4-property-panel.test.ts` — NEW
    - 노드 ID 파싱 테스트: 타입 판별 정확성 (agent-xxx → agent, dept-xxx → department, human-xxx → human, company-xxx → company)
    - 에이전트 PATCH API 바디 정확성 (name, tierLevel, allowedTools)
    - 부서 PATCH API 바디 정확성 (name, description)
    - OrgChartData에서 선택된 노드 데이터 추출 로직 테스트
    - 매니저 지정 로직 테스트 (이전 매니저 해제 + 새 매니저 설정)
    - 인간 직원 소유 에이전트 필터링 테스트 (ownerUserId 매칭)
    - 낙관적 업데이트 데이터 구조 테스트
    - 엣지 케이스: selectedNodeId null, 존재하지 않는 노드 ID, 빈 데이터

## Dev Notes

### 기존 코드 현황 (중복 작성 금지!)

**Story 9.1 + 9.2에서 이미 구현된 것 (건드리지 마!):**
1. **React Flow 캔버스** — `packages/admin/src/pages/nexus.tsx`: edit/view 모드, 노드 선택(selectedNodeId), 레이아웃 저장/복원, 30초 폴링
2. **ELK.js 레이아웃** — `packages/admin/src/lib/elk-layout.ts`: computeElkLayout()
3. **5개 커스텀 노드** — `packages/admin/src/components/nexus/`:
   - `company-node.tsx`, `department-node.tsx`, `agent-node.tsx`, `human-node.tsx`, `unassigned-group-node.tsx`
4. **노드 선택 상태** — nexus.tsx: `selectedNodeId` state + `handleNodeClick` + `handlePaneClick` 이미 구현됨!
5. **org-chart API** — `packages/server/src/routes/admin/org-chart.ts`: 모든 데이터(에이전트 상세, 인간직원, 부서) 이미 제공
6. **도구바** — nexus-toolbar.tsx
7. **내보내기** — nexus-export.ts (PNG/SVG/JSON/print)

**이미 존재하는 API (새로 만들지 마!):**
- `PATCH /api/admin/agents/:id` — 에이전트 업데이트 (agents.ts)
- `PATCH /api/admin/departments/:id` — 부서 업데이트 (departments.ts)
- `GET /admin/org-chart?companyId=xxx` — 조직도 데이터 (org-chart.ts)

**이미 존재하는 UI 컴포넌트 (새로 만들지 마!):**
- `@corthex/ui`: Input, Textarea, Select, Button, Badge, Card, Toggle, Spinner
- `useToastStore`: 토스트 알림
- `useAdminStore`: selectedCompanyId

### 노드 ID 파싱 패턴 (핵심!)

```typescript
// nexus.tsx에서 노드 ID 형식:
// agent-{uuid}    → 에이전트
// dept-{uuid}     → 부서
// human-{uuid}    → 인간 직원
// company-{uuid}  → 회사
// unassigned-group → 미배속 그룹 (패널 안 열음)

function parseNodeId(nodeId: string): { type: 'agent' | 'department' | 'human' | 'company' | null, id: string } {
  if (nodeId.startsWith('agent-')) return { type: 'agent', id: nodeId.slice(6) }
  if (nodeId.startsWith('dept-')) return { type: 'department', id: nodeId.slice(5) }
  if (nodeId.startsWith('human-')) return { type: 'human', id: nodeId.slice(6) }
  if (nodeId.startsWith('company-')) return { type: 'company', id: nodeId.slice(8) }
  return { type: null, id: '' }
}
```

### orgData에서 선택 노드 데이터 추출 (핵심!)

```typescript
// OrgChartData 구조에서 id로 찾기
function findAgent(org: OrgChartData, agentId: string): OrgAgent | undefined {
  for (const d of org.departments) {
    const found = d.agents.find(a => a.id === agentId)
    if (found) return found
  }
  return org.unassignedAgents.find(a => a.id === agentId)
}

function findDepartment(org: OrgChartData, deptId: string) {
  return org.departments.find(d => d.id === deptId)
}

function findEmployee(org: OrgChartData, userId: string): OrgEmployee | undefined {
  for (const d of org.departments) {
    const found = d.employees?.find(e => e.id === userId)
    if (found) return found
  }
  return org.unassignedEmployees?.find(e => e.id === userId)
}
```

### 레이아웃 수정 패턴 (nexus.tsx 변경)

```tsx
// BEFORE: 캔버스만
<div ref={reactFlowRef} className="relative bg-slate-900 ..." style={{ height: 'calc(100vh - 140px)' }}>
  <NexusToolbar ... />
  <ReactFlow ... />
</div>

// AFTER: 캔버스 + 속성 패널 flex row
<div className="flex" style={{ height: 'calc(100vh - 140px)' }}>
  <div ref={reactFlowRef} className="flex-1 relative bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
    <NexusToolbar ... />
    <ReactFlow ... />
  </div>
  {selectedNodeId && (
    <PropertyPanel
      selectedNodeId={selectedNodeId}
      orgData={data.data}
      onClose={() => setSelectedNodeId(null)}
      onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
    />
  )}
</div>
```

### 낙관적 업데이트 패턴

```typescript
const queryClient = useQueryClient()

const agentMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: Partial<Agent> }) =>
    api.patch(`/admin/agents/${id}`, data),
  onMutate: async ({ id, data: update }) => {
    await queryClient.cancelQueries({ queryKey: ['org-chart', companyId] })
    const prev = queryClient.getQueryData(['org-chart', companyId])
    // 낙관적 업데이트: org-chart 캐시 내 에이전트 데이터 교체
    queryClient.setQueryData(['org-chart', companyId], (old: any) => {
      if (!old?.data) return old
      // departments 내 agents 배열에서 해당 에이전트 찾아 업데이트
      return { ...old, data: updateAgentInOrgData(old.data, id, update) }
    })
    return { prev }
  },
  onError: (_, __, ctx) => {
    if (ctx?.prev) queryClient.setQueryData(['org-chart', companyId], ctx.prev)
    addToast({ type: 'error', message: '저장에 실패했습니다' })
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['org-chart', companyId] }),
  onSuccess: () => addToast({ type: 'success', message: '저장되었습니다' }),
})
```

### Debounce 패턴

```typescript
const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

function debounceSave(field: string, value: unknown) {
  if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
  setSaveStatus('saving')
  saveTimerRef.current = setTimeout(() => {
    agentMutation.mutate(
      { id: agent.id, data: { [field]: value } },
      {
        onSuccess: () => setSaveStatus('saved'),
        onError: () => setSaveStatus('error'),
      }
    )
  }, 500)
}
```

### 스타일 가이드 (NEXUS 다크 테마 일관성)

```
패널 배경:     bg-slate-900
패널 테두리:   border-l border-slate-700
섹션 구분선:   border-b border-slate-800
레이블:        text-xs text-slate-500 uppercase tracking-wide
값 텍스트:     text-sm text-slate-200
입력 필드:     bg-slate-800 border-slate-700 text-slate-100 (기존 @corthex/ui Input 스타일)
닫기 버튼:     text-slate-500 hover:text-slate-300
패널 제목:     text-sm font-semibold text-slate-100
섹션 제목:     text-xs font-medium text-slate-400
```

### 허용 도구(allowedTools) 체크리스트

org-chart API에서 에이전트의 `allowedTools: string[]`이 이미 제공됨. 전체 도구 목록은 별도 API `GET /api/admin/tools?companyId=xxx`에서 조회 가능.

```typescript
// 도구 목록 쿼리
const { data: toolsData } = useQuery({
  queryKey: ['tools', companyId],
  queryFn: () => api.get<{ data: Tool[] }>(`/admin/tools?companyId=${companyId}`),
  enabled: !!companyId,
})

// 체크박스 UI: 전체 도구 목록 중 allowedTools에 포함된 것은 체크
// 토글 시: allowedTools 배열 업데이트 → debounceSave('allowedTools', newArray)
```

### DB 스키마 참고

```
agents: id, name, role(manager/specialist/worker), tier, tierLevel(integer),
        modelName, departmentId, status, isSecretary, isSystem,
        soul(text), allowedTools(jsonb string[]),
        reportTo(uuid FK→agents), ownerUserId(uuid FK→users),
        companyId, isActive, createdAt, updatedAt

departments: id, name, description, companyId, isActive, createdAt, updatedAt

users: id, name, username, email, role(ceo/admin/user), companyId, isActive
```

### 아키텍처 준수 사항

1. **React Flow + ELK.js** — NEXUS 전용. Cytoscape는 SketchVibe 전용.
2. **API 호출**: 기존 `PATCH /api/admin/agents/:id`, `PATCH /api/admin/departments/:id` 사용. 새 API 만들지 않음.
3. **DB 접근**: admin API는 기존처럼 `db` 직접 사용 패턴. getDB() 아님.
4. **파일명**: kebab-case. 컴포넌트: PascalCase.
5. **테스트**: bun:test, `packages/server/src/__tests__/unit/` 경로.
6. **번들**: 새 패널 컴포넌트는 nexus.tsx에서 import (같은 라우트 청크, 별도 lazy 불필요).
7. **서버 코드 변경 없음** — 이 스토리는 순수 프론트엔드. API/서버는 이미 충분.

### 이전 스토리 인텔리전스

**9.1에서 배운 것:**
- admin에 WebSocket 인프라 없음 → TanStack Query polling 30초 사용
- `useAdminStore((s) => s.selectedCompanyId)`로 회사 ID 접근
- `useToastStore`로 알림
- 노드 컴포넌트에 `selected` prop → `data` 객체로 전달 (React Flow 패턴)

**9.2에서 배운 것:**
- org-chart API 응답: `{ data: { company, departments, unassignedAgents, unassignedEmployees } }`
- 에이전트 데이터: id, name, role, tier, tierLevel, modelName, departmentId, status, isSecretary, isSystem, soul, allowedTools, reportTo, ownerUserId
- 인간 직원 데이터: id, name, username, role, hasCliToken, agentCount
- 부서 데이터: id, name, description, agents[], employees[], agentCount, employeeCount, managerName
- tsc --noEmit passes for both server and admin packages

### Project Structure Notes

**신규 파일:**
- `packages/admin/src/components/nexus/property-panel.tsx` — NEW: 패널 컨테이너 (노드 타입 라우팅)
- `packages/admin/src/components/nexus/panels/agent-panel.tsx` — NEW: 에이전트 속성 편집
- `packages/admin/src/components/nexus/panels/department-panel.tsx` — NEW: 부서 속성 편집
- `packages/admin/src/components/nexus/panels/human-panel.tsx` — NEW: 인간 직원 읽기전용
- `packages/admin/src/components/nexus/panels/company-panel.tsx` — NEW: 회사 읽기전용
- `packages/server/src/__tests__/unit/story-9-4-property-panel.test.ts` — NEW: 테스트

**수정 파일:**
- `packages/admin/src/pages/nexus.tsx` — MODIFY: flex 레이아웃 + PropertyPanel 삽입

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 9, Story 9.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#NEXUS 조직도: React Flow + ELK.js]
- [Source: _bmad-output/implementation-artifacts/9-2-nexus-node-visualization.md — 이전 스토리]
- [Source: _bmad-output/implementation-artifacts/9-1-nexus-react-flow-canvas.md — 이전 스토리]
- [Source: packages/admin/src/pages/nexus.tsx — 현재 NEXUS 캔버스 (selectedNodeId 이미 존재)]
- [Source: packages/admin/src/components/nexus/ — 5개 커스텀 노드]
- [Source: packages/server/src/routes/admin/agents.ts — PATCH agents API]
- [Source: packages/server/src/routes/admin/departments.ts — PATCH departments API]
- [Source: packages/server/src/routes/admin/org-chart.ts — org-chart API]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: PropertyPanel container — parseNodeId() routing to 4 panel types, flex layout in nexus.tsx, Esc key close, fitView on panel toggle
- Task 2: AgentPanel — inline name edit, tier select (Manager/Specialist/Worker), model read-only, allowedTools checklist, Soul edit link, debounce 500ms save, optimistic updates with rollback
- Task 3: DepartmentPanel — name/description inline edit, manager display, agent/employee list with cross-navigation (click → select node)
- Task 4: HumanPanel — read-only: name, role badge, CLI token status, owned agents list with click-to-select
- Task 5: CompanyPanel — read-only: company name/slug, stats grid (departments/agents/employees), department list, settings link
- Task 6: 47 unit tests covering: parseNodeId (6 tests), findAgent (4), findEmployee (3), getAllAgents (2), PATCH body validation (8), owned agents filtering (3), manager detection (2), optimistic updates (2), edge cases (8), tool toggle (3), counting (3), stats (3)
- Fixed concurrent Story 9.3 type errors: removed NodeDragHandler import, replaced 'warning' toast type
- tsc --noEmit passes for both server and admin packages

### Change Log

- 2026-03-11: Story 9.4 implementation complete — 6 new files, 1 modified file, 47 tests

### File List

- `packages/admin/src/components/nexus/property-panel.tsx` — NEW: panel container with node type routing + helper functions
- `packages/admin/src/components/nexus/panels/agent-panel.tsx` — NEW: agent property editing (name, tier, tools, debounced save)
- `packages/admin/src/components/nexus/panels/department-panel.tsx` — NEW: department property editing (name, description, agent/employee lists)
- `packages/admin/src/components/nexus/panels/human-panel.tsx` — NEW: read-only human employee panel
- `packages/admin/src/components/nexus/panels/company-panel.tsx` — NEW: read-only company overview panel
- `packages/admin/src/pages/nexus.tsx` — MODIFIED: flex layout + PropertyPanel integration + fitView on panel toggle + fixed 9.3 type errors
- `packages/server/src/__tests__/unit/story-9-4-property-panel.test.ts` — NEW: 47 tests
