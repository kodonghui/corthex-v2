# Story 9.2: NEXUS 노드 시각화

Status: review

## Story

As a 관리자,
I want 부서, 에이전트, 인간 직원이 구분되는 노드로 표시되는 것을,
so that 한눈에 조직 구성을 파악할 수 있다.

## Acceptance Criteria

1. **노드 타입 시각 구분** — 부서(직사각형, 파란), AI 에이전트(둥근 모서리, 초록), 인간 직원(사각형, 보라), 비서(팔각형, 금색)
2. **에이전트 노드 강화** — 이름, tier 레벨 뱃지(Manager/Specialist/Worker + tierLevel 숫자), 상태 아이콘(online/working/error/offline), 소속 부서 연결 수
3. **부서 노드 강화** — 이름, 소속 에이전트 수, 소속 인간 직원 수, 매니저 에이전트 이름 표시
4. **엣지 시각화** — 부서→에이전트 소속 관계(실선), 매니저→부하 위임 관계(점선 화살표), 인간→소유 AI 에이전트(dash-dot)
5. **인간 직원 노드 (NEW)** — 이름, 역할(CEO/Human), CLI 토큰 상태(등록: 초록 점, 미등록: 회색 점), 소유 AI 에이전트 수
6. **비서 에이전트 노드 형태 변경** — 기존 agent-node에서 팔각형(clip-path octagon) 스타일로 시각 구분, 금색(amber) 테두리 유지
7. **org-chart API 확장** — 인간 직원 목록(users + employeeDepartments + cliCredentials 상태) + 에이전트 reportTo 관계 데이터를 API 응답에 포함

## Tasks / Subtasks

- [x] Task 1: org-chart API 확장 (AC: #7)
  - [x] 1.1 `packages/server/src/routes/admin/org-chart.ts` — 인간 직원 데이터 추가 쿼리
    - `users` 테이블에서 companyId 필터 + isActive=true 조회
    - `employeeDepartments` 테이블 조인하여 부서 매핑
    - `cliCredentials` 테이블에서 userId별 활성 토큰 존재 여부 (boolean hasCliToken)
  - [x] 1.2 에이전트 쿼리에 `reportTo`, `ownerUserId`, `tierLevel` 필드 추가
  - [x] 1.3 응답 타입 확장:
    ```typescript
    // 기존 OrgChartData에 추가
    type OrgChartData = {
      company: { id, name, slug }
      departments: {
        id, name, description,
        agents: OrgAgent[],
        employees: OrgEmployee[]  // NEW
      }[]
      unassignedAgents: OrgAgent[]
      unassignedEmployees: OrgEmployee[]  // NEW
    }

    type OrgAgent = {
      // 기존 필드 유지
      id, name, role, tier, modelName, departmentId, status,
      isSecretary, isSystem, soul, allowedTools,
      // NEW 필드
      reportTo: string | null,      // 상위 에이전트 UUID
      ownerUserId: string | null,   // 소유 인간직원 UUID
      tierLevel: number | null,     // 동적 tier 레벨 (1=Manager, 2=Specialist, 3=Worker)
    }

    type OrgEmployee = {
      id: string
      name: string
      username: string
      role: 'ceo' | 'admin' | 'user'
      hasCliToken: boolean          // cliCredentials에 활성 토큰 존재 여부
      agentCount: number            // 소유 AI 에이전트 수 (ownerUserId로 카운트)
    }
    ```

- [x] Task 2: ELK 레이아웃 확장 (AC: #1, #4)
  - [x] 2.1 `packages/admin/src/lib/elk-layout.ts` — 인간 직원 노드 + 새 엣지 타입 추가
    - `human` 노드 타입 추가 (크기: 200x70)
    - `membership` 엣지 (부서→에이전트, 실선)
    - `delegation` 엣지 (매니저→부하, reportTo 기반 점선 화살표)
    - `ownership` 엣지 (인간→소유 에이전트, ownerUserId 기반 dash-dot)
    - `employment` 엣지 (부서→인간직원, 실선)
  - [x] 2.2 `computeElkLayout()` 함수에 employees 파라미터 추가

- [x] Task 3: 인간 직원 노드 컴포넌트 (AC: #5)
  - [x] 3.1 `packages/admin/src/components/nexus/human-node.tsx` — NEW
    - 데이터: `{ name, username, role, hasCliToken, agentCount }`
    - 스타일: `bg-purple-950 border-purple-500 text-purple-100` (보라)
    - 역할 뱃지: CEO=`bg-yellow-800 text-yellow-200`, Admin=`bg-purple-800`, User=`bg-slate-700`
    - CLI 토큰 상태: `hasCliToken ? '🟢' : '⚪'` (우상단 작은 점)
    - 소유 에이전트 수: `agentCount > 0 ? "AI ${agentCount}명" : ""` (하단 작은 텍스트)
    - 크기: min-width 200px
    - Handles: Top (target) + Bottom (source)
    - selected prop: `ring-2 ring-blue-400/50` (기존 패턴)

- [x] Task 4: 에이전트 노드 강화 (AC: #2, #6)
  - [x] 4.1 `packages/admin/src/components/nexus/agent-node.tsx` — 기존 수정
    - tierLevel 숫자 표시 추가: tier 뱃지에 `T${tierLevel}` 추가 (예: "Manager T1")
    - 연결 수 표시: 하단에 reportTo 하위 에이전트 수 미니 카운터 (data로 전달)
  - [x] 4.2 비서 에이전트 팔각형 스타일 — `isSecretary` true일 때:
    - clip-path: `polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)`
    - 기존 amber 색상 유지, 크기 약간 확대: min-width 220px
    - 나머지 정보(이름, tier, status)는 동일하게 표시

- [x] Task 5: 부서 노드 강화 (AC: #3)
  - [x] 5.1 `packages/admin/src/components/nexus/department-node.tsx` — 기존 수정
    - 인간 직원 수 뱃지 추가: `employeeCount` (기존 agentCount 옆에 보라색 뱃지)
    - 매니저 이름 표시: 해당 부서의 tier=manager인 에이전트 이름 (1줄, 작은 텍스트)
    - 데이터 타입 확장: `{ name, description, agentCount, employeeCount, managerName }`

- [x] Task 6: 엣지 스타일 분화 (AC: #4)
  - [x] 6.1 `packages/admin/src/pages/nexus.tsx` — 엣지 타입별 스타일 설정
    - `membership` (부서→에이전트): `strokeDasharray: none` (실선, 기존)
    - `delegation` (매니저→부하): `strokeDasharray: '5 5'`, `markerEnd: ArrowClosed`, `stroke: '#f59e0b'` (amber 점선 화살표)
    - `ownership` (인간→에이전트): `strokeDasharray: '8 4 2 4'` (dash-dot), `stroke: '#a855f7'` (purple)
    - `employment` (부서→인간): `strokeDasharray: none`, `stroke: '#a855f7'` (보라 실선)
  - [x] 6.2 미니맵 색상 매핑에 human 노드 보라색 추가

- [x] Task 7: nexus.tsx 데이터 플로우 연결 (AC: 전체)
  - [x] 7.1 org-chart API 응답의 employees 데이터를 ELK 레이아웃에 전달
  - [x] 7.2 reportTo 기반 delegation 엣지 생성 로직
  - [x] 7.3 ownerUserId 기반 ownership 엣지 생성 로직
  - [x] 7.4 ReactFlow `nodeTypes`에 `human: HumanNode` 등록
  - [x] 7.5 미니맵 `nodeColor` 함수에 human 노드 보라색 추가

- [x] Task 8: 테스트 (AC: 전체)
  - [x] 8.1 `packages/server/src/__tests__/unit/story-9-2-nexus-visualization.test.ts` — NEW
  - [x] 8.2 org-chart API 확장 테스트: employees 포함, hasCliToken, agentCount 정확성
  - [x] 8.3 reportTo/ownerUserId/tierLevel 필드 응답 확인
  - [x] 8.4 엣지 타입별 생성 로직 테스트 (membership, delegation, ownership, employment)
  - [x] 8.5 인간 직원 노드 데이터 매핑 테스트
  - [x] 8.6 비서 노드 clip-path 적용 조건 테스트
  - [x] 8.7 부서 매니저 이름 추출 로직 테스트
  - [x] 8.8 빈 데이터 엣지 케이스: 인간 직원 0명, reportTo null, ownerUserId null

## Dev Notes

### 기존 코드 현황 (중복 작성 금지!)

**Story 9.1에서 이미 구현된 것 (건드리지 마!):**
1. **React Flow 캔버스** — `packages/admin/src/pages/nexus.tsx`: edit/view 모드, 레이아웃 저장/복원, 노드 선택, 도구바, 30초 폴링
2. **ELK.js 레이아웃** — `packages/admin/src/lib/elk-layout.ts`: `computeElkLayout()` layered DOWN
3. **4개 커스텀 노드** — `packages/admin/src/components/nexus/`:
   - `company-node.tsx`: 회사 루트 (slate, 280x70)
   - `department-node.tsx`: 부서 (blue, 240x60) — 이름+설명+agentCount
   - `agent-node.tsx`: 에이전트 (green/amber, 200x80) — 상태 점+tier 뱃지+비서/시스템 뱃지
   - `unassigned-group-node.tsx`: 미배속 (orange dashed, 240x60)
4. **도구바** — `packages/admin/src/components/nexus/nexus-toolbar.tsx`
5. **Admin 레이아웃 API** — `packages/server/src/routes/admin/nexus-layout.ts`
6. **org-chart API** — `packages/server/src/routes/admin/org-chart.ts` (이번 스토리에서 확장)

**에이전트 노드 현재 상태 (이미 구현된 기능):**
- 상태 점 (online=emerald, working=blue+pulse, error=red, offline=slate) ✅ 이미 있음
- Tier 뱃지 (Manager=blue, Specialist=cyan, Worker=slate) ✅ 이미 있음
- 비서 뱃지 ("비서" amber) ✅ 이미 있음
- 시스템 뱃지 ("시스템" slate) ✅ 이미 있음
- 선택 하이라이트 (ring-2 ring-blue-400/50) ✅ 이미 있음
- **없는 것**: tierLevel 숫자, 연결 수, 비서 팔각형 shape

**부서 노드 현재 상태:**
- 이름 + agentCount 뱃지 ✅ 이미 있음
- 선택 하이라이트 ✅ 이미 있음
- **없는 것**: employeeCount, managerName

### DB 스키마 참고 (이미 존재하는 테이블)

```
users: id, companyId, username, name, email, role(ceo/admin/user), isActive
employeeDepartments: userId, departmentId, companyId (직원-부서 매핑)
cliCredentials: userId, companyId, isActive (CLI 토큰 존재 여부)
agents.reportTo: uuid (자기참조, 상위 에이전트)
agents.ownerUserId: uuid (소유 인간직원 FK → users.id)
agents.tierLevel: integer (1=Manager, 2=Specialist, 3=Worker, 동적 N-tier)
```

### 아키텍처 준수 사항

1. **React Flow + ELK.js** — NEXUS 전용. Cytoscape는 SketchVibe 전용. 혼동 금지.
2. **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }` (org-chart는 현재 `{ data }` 형식으로 success 래핑 없음 — 기존 패턴 유지)
3. **DB 접근**: org-chart.ts는 기존처럼 `db` 직접 사용 (admin API 패턴). getDB() 아님.
4. **파일명**: kebab-case. 컴포넌트: PascalCase.
5. **테스트**: bun:test, `packages/server/src/__tests__/unit/` 경로.
6. **번들**: 이미 React.lazy() 적용됨. 새 노드 컴포넌트는 nexus.tsx 내에서 import (별도 lazy 불필요 — 같은 라우트 청크).

### 엣지 생성 로직 (nexus.tsx 또는 elk-layout.ts)

```typescript
// 기존: 부서→에이전트 (membership)
edges = departments.flatMap(d => d.agents.map(a => ({
  id: `dept-${d.id}-agent-${a.id}`,
  source: `dept-${d.id}`,
  target: `agent-${a.id}`,
  type: 'membership',
})))

// NEW: 부서→인간직원 (employment)
edges.push(...departments.flatMap(d => (d.employees || []).map(e => ({
  id: `dept-${d.id}-human-${e.id}`,
  source: `dept-${d.id}`,
  target: `human-${e.id}`,
  type: 'employment',
}))))

// NEW: 매니저→부하 (delegation) — reportTo 기반
const allAgents = departments.flatMap(d => d.agents).concat(unassignedAgents)
edges.push(...allAgents
  .filter(a => a.reportTo)
  .map(a => ({
    id: `delegate-${a.reportTo}-${a.id}`,
    source: `agent-${a.reportTo}`,
    target: `agent-${a.id}`,
    type: 'delegation',
  })))

// NEW: 인간→소유에이전트 (ownership) — ownerUserId 기반
edges.push(...allAgents
  .filter(a => a.ownerUserId)
  .map(a => ({
    id: `owner-${a.ownerUserId}-${a.id}`,
    source: `human-${a.ownerUserId}`,
    target: `agent-${a.id}`,
    type: 'ownership',
  })))
```

### 비서 팔각형 CSS clip-path

```css
/* clip-path octagon — 비서 에이전트 전용 */
.nexus-secretary-node {
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
}
```

주의: clip-path 사용 시 border가 잘릴 수 있음. wrapper div에 clip-path 적용하고, 내부 div에 padding으로 여백 확보하거나, box-shadow 대신 background gradient로 테두리 효과 구현.

대안: clip-path 대신 SVG 기반 octagon shape 사용 가능. React Flow 커스텀 노드에서 SVG foreignObject로 구현하면 border/shadow 이슈 없음.

### 이전 스토리 인텔리전스 (9.1에서 배운 것)

- admin에 WebSocket 인프라 없음 → TanStack Query polling 30초 사용
- `useAdminStore((s) => s.selectedCompanyId)`로 회사 ID 접근
- `useToastStore`로 알림
- 노드 컴포넌트에 `selected` prop → `data` 객체로 전달 (React Flow 패턴)
- ELK NODE_SIZES 상수 정의 패턴 → `human` 추가 필요
- org-chart API는 `{ data: { company, departments, unassignedAgents } }` 형식 (success 래핑 없음)
- nexus-layout API는 admin 전용 라우트 (`/admin/nexus/layout`)
- 테스트: admin 프론트 로직은 서버 테스트에서 API + 데이터 변환 로직 검증

### Project Structure Notes

**수정 파일:**
- `packages/server/src/routes/admin/org-chart.ts` — MODIFY: employees + reportTo + ownerUserId + tierLevel 추가
- `packages/admin/src/lib/elk-layout.ts` — MODIFY: human 노드 + 새 엣지 타입 추가
- `packages/admin/src/pages/nexus.tsx` — MODIFY: human 노드 등록 + 엣지 스타일 + 데이터 플로우
- `packages/admin/src/components/nexus/agent-node.tsx` — MODIFY: tierLevel 숫자 + 비서 팔각형
- `packages/admin/src/components/nexus/department-node.tsx` — MODIFY: employeeCount + managerName

**신규 파일:**
- `packages/admin/src/components/nexus/human-node.tsx` — NEW: 인간 직원 노드 컴포넌트
- `packages/server/src/__tests__/unit/story-9-2-nexus-visualization.test.ts` — NEW: 테스트

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 9, Story 9.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#NEXUS 조직도: React Flow + ELK.js]
- [Source: _bmad-output/implementation-artifacts/9-1-nexus-react-flow-canvas.md — 이전 스토리]
- [Source: packages/admin/src/pages/nexus.tsx — 현재 NEXUS 캔버스]
- [Source: packages/admin/src/components/nexus/ — 4개 커스텀 노드]
- [Source: packages/admin/src/lib/elk-layout.ts — ELK 레이아웃 유틸]
- [Source: packages/server/src/routes/admin/org-chart.ts — org-chart API]
- [Source: packages/server/src/db/schema.ts — users, employeeDepartments, cliCredentials, agents 테이블]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: org-chart API extended — users, employeeDepartments, cliCredentials queries added; agents query now includes reportTo, ownerUserId, tierLevel; response includes employees per dept + unassignedEmployees
- Task 2: ELK layout extended — human node type (200x70), 4 edge types with EDGE_STYLES constant, delegation/ownership edges with node existence checks, subordinateCount calculation
- Task 3: HumanNode component — purple theme, CLI token status dot, role badge (CEO/Admin/Staff), agentCount display, selected highlight
- Task 4: AgentNode enhanced — tierLevel display (T1/T2/T3), subordinateCount mini-counter (↓N), secretary octagonal clip-path with outer-border wrapper
- Task 5: DepartmentNode enhanced — employeeCount badge (purple), managerName display
- Task 6: Edge styles differentiated — membership (solid green), employment (solid purple), delegation (dashed amber arrow), ownership (dash-dot purple)
- Task 7: nexus.tsx updated — HumanNode registered in nodeTypes, minimap purple for human, totalEmployees in header
- Task 8: 45 unit tests covering API response shape, CLI token logic, owner counts, employee-dept mapping, edge types, subordinate counts, node data, minimap colors, node sizes, edge cases, secretary octagon
- tsc --noEmit passes for both server and admin packages

### Change Log

- 2026-03-11: Story 9.2 implementation complete — 7 files changed, 1 new component, 45 tests

### File List

- `packages/server/src/routes/admin/org-chart.ts` — MODIFIED: employees + reportTo + ownerUserId + tierLevel
- `packages/admin/src/lib/elk-layout.ts` — MODIFIED: OrgEmployee type, human node, 4 edge types, delegation/ownership edges
- `packages/admin/src/pages/nexus.tsx` — MODIFIED: HumanNode import + nodeTypes + minimap color + employee count header
- `packages/admin/src/components/nexus/agent-node.tsx` — MODIFIED: tierLevel display + subordinateCount + secretary octagon clip-path
- `packages/admin/src/components/nexus/department-node.tsx` — MODIFIED: employeeCount badge + managerName
- `packages/admin/src/components/nexus/human-node.tsx` — NEW: human staff node component
- `packages/server/src/__tests__/unit/story-9-2-nexus-visualization.test.ts` — NEW: 45 tests
