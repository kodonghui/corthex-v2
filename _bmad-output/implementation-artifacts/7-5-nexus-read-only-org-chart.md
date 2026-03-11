# Story 7.5: NEXUS 읽기 전용 조직도

Status: done

## Story

As a 관리자/CEO,
I want 현재 조직 구조를 시각적 그래프로 확인하는 것을,
so that 부서/에이전트 관계를 한눈에 파악할 수 있다.

## Acceptance Criteria

1. **React Flow 기반 읽기 전용 조직도**: `@xyflow/react` 사용한 캔버스 기반 노드 그래프. 편집 불가(읽기 전용).
2. **ELK.js 계층 레이아웃**: `elkjs` 패키지로 자동 계층 배치 (위→아래 방향). 회사→부서→에이전트 3단 계층.
3. **노드 색상 구분**: 부서 노드(파란 `bg-blue-600`), 에이전트 노드(초록 `bg-emerald-600`), 비서 노드(금색 `bg-amber-500`) 시각 구분.
4. **에이전트 노드 정보**: 이름, tier 뱃지(Manager/Specialist/Worker), 상태 표시(online=초록 점, working=파란 점+펄스, error=빨간 점, offline=회색 점).
5. **드래그 이동 + 줌**: 캔버스 팬/줌 인아웃. 노드 드래그 이동(위치 변경만, DB 변경 없음).
6. **번들 최적화**: 에이전트 50+ 시 React.lazy()로 NEXUS 컴포넌트 동적 로드 (이미 App.tsx에서 lazy 적용됨 — 확인만).

## Tasks / Subtasks

- [x] Task 1: `elkjs` 패키지 설치 (AC: #2)
  - [x] 1.1 `packages/admin/` 에 `elkjs@0.11.1` 추가
  - [x] 1.2 `packages/admin/` 에 `@xyflow/react@12.10.1` 추가

- [x] Task 2: NEXUS org chart 서버 API 확인 (AC: #1)
  - [x] 2.1 기존 `GET /admin/org-chart?companyId=xxx` 응답 데이터 확인 — 충분함 (company, departments, unassignedAgents + isSecretary 필드)
  - [x] 2.2 secretary 에이전트 구분 필드(`isSecretary`) 이미 반환됨 확인 완료

- [x] Task 3: ELK.js 레이아웃 유틸리티 작성 (AC: #2)
  - [x] 3.1 `packages/admin/src/lib/elk-layout.ts` — ELK.js로 노드 위치 계산하는 `computeElkLayout()` 함수
  - [x] 3.2 입력: OrgChartData, 출력: React Flow Node[] + Edge[]
  - [x] 3.3 레이아웃 방향: 'DOWN' (위→아래 계층), algorithm: 'layered'
  - [x] 3.4 노드 크기: company 280x70, department 240x60, agent 200x80, unassigned-group 240x60

- [x] Task 4: 커스텀 React Flow 노드 컴포넌트 (AC: #3, #4)
  - [x] 4.1 `packages/admin/src/components/nexus/company-node.tsx` — 회사명 + 이니셜 아이콘 + 부서/에이전트 수 통계
  - [x] 4.2 `packages/admin/src/components/nexus/department-node.tsx` — 파란 배경(bg-blue-950 border-blue-600), 부서명, 에이전트 수 뱃지
  - [x] 4.3 `packages/admin/src/components/nexus/agent-node.tsx` — 초록(bg-emerald-950)/금색(bg-amber-950) 배경, 이름, tier 뱃지, 상태 도트
  - [x] 4.4 각 노드에 Handle (source/target) 연결점 설정 완료

- [x] Task 5: NEXUS 페이지 구현 (AC: #1, #5)
  - [x] 5.1 `packages/admin/src/pages/nexus.tsx` — 별도 NEXUS 페이지 생성 (기존 org-chart.tsx 유지)
  - [x] 5.2 ReactFlow 캔버스 + Controls + MiniMap + Background (Dots)
  - [x] 5.3 org-chart API → computeElkLayout() → React Flow 노드/엣지 렌더링
  - [x] 5.4 nodesDraggable=true, nodesConnectable=false, elementsSelectable=true
  - [x] 5.5 fitView + padding 0.2 옵션으로 초기 전체 보기

- [x] Task 6: 라우트 + 사이드바 등록 (AC: #1)
  - [x] 6.1 `packages/admin/src/App.tsx` — `/nexus` 라우트 추가 (React.lazy 동적 import)
  - [x] 6.2 `packages/admin/src/components/sidebar.tsx` — NEXUS 조직도 메뉴 항목 추가

- [x] Task 7: 미배속 에이전트 그룹 노드 (AC: #3)
  - [x] 7.1 `packages/admin/src/components/nexus/unassigned-group-node.tsx` — 미배속 에이전트 그룹 노드 컴포넌트
  - [x] 7.2 미배속 그룹 노드: 주황색 점선 테두리 (border-dashed border-orange-500 bg-orange-950/30)

- [x] Task 8: 테스트 (AC: 전체)
  - [x] 8.1 ELK 레이아웃 변환 로직 단위 테스트: 11개 테스트 (빈 조직, 부서, 에이전트, 미배속, 혼합, 대규모)
  - [x] 8.2 노드/엣지 ID 유일성, 데이터 보존, secretary 플래그 테스트

## Dev Notes

### 기존 코드 현황 (매우 중요 — 중복 작성 금지!)

**이미 동작하는 기능:**
1. **org-chart API** — `packages/server/src/routes/admin/org-chart.ts` 라인 14-68: `GET /admin/org-chart?companyId=xxx` → `{ data: { company, departments: [{id, name, description, agents: [...]}], unassignedAgents: [...] } }`
2. **org-chart 리스트 페이지** — `packages/admin/src/pages/org-chart.tsx`: 트리 리스트 형태의 기존 조직도 (React Flow 아님). **이 페이지는 유지** — NEXUS는 별도 페이지로 추가.
3. **App.tsx lazy import** — 이미 `React.lazy()` 패턴 사용 중 (라인 20): `const OrgChartPage = lazy(() => import('./pages/org-chart')...)`
4. **sidebar.tsx** — 이미 '조직도' 메뉴 있음 (라인 26): `{ to: '/org-chart', label: '조직도', icon: '🏗️' }`
5. **@xyflow/react** — `packages/app/package.json`에 `"@xyflow/react": "^12.10.1"` 이미 설치됨 (단, admin에는 없음)

**주의: 기존 org-chart.tsx 페이지와 NEXUS 페이지의 관계**
- 기존 `org-chart.tsx`는 트리 리스트 뷰 (텍스트 기반, 클릭하면 상세 패널)
- NEXUS는 React Flow 캔버스 뷰 (그래프 시각화)
- 둘 다 같은 API(`/admin/org-chart`)를 사용하되, 렌더링만 다름
- 기존 페이지를 삭제하지 말 것. NEXUS가 완성되면 향후 기존 페이지에 "NEXUS 보기" 링크를 추가할 수 있음

### 아키텍처 준수 사항

1. **React Flow + ELK.js** (아키텍처 결정 D15~D18): NEXUS=React Flow, 스케치바이브=Cytoscape. 완전 분리.
2. **ELK 레이아웃**: `elkjs` 패키지 사용. `layered` 알고리즘, 방향 `DOWN`.
3. **번들 최적화**: React.lazy() 동적 import로 NEXUS 청크 분리 (이미 App.tsx 패턴 있음).
4. **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
5. **파일명**: kebab-case lowercase. 컴포넌트: PascalCase.
6. **테스트**: bun:test, `packages/server/src/__tests__/unit/` 경로 (서버 테스트). 프론트엔드 유틸은 admin 쪽에서 테스트.
7. **Import 케이싱**: `git ls-files` 정확히 매칭 (Linux CI case-sensitive).
8. **NEXUS NFR**: 60fps Canvas 렌더링 (React Flow 기본 Canvas 사용하면 자동 달성).

### 기술 요구사항

**@xyflow/react v12 API (admin에 설치 필요):**
```tsx
import { ReactFlow, Controls, MiniMap, Background, Handle, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// Custom node 등록
const nodeTypes = { company: CompanyNode, department: DepartmentNode, agent: AgentNode }

<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  nodesDraggable={true}
  nodesConnectable={false}
  fitView
>
  <Controls />
  <MiniMap />
  <Background />
</ReactFlow>
```

**elkjs 레이아웃 패턴:**
```typescript
import ELK from 'elkjs/lib/elk.bundled.js'

const elk = new ELK()

async function getLayoutedElements(nodes, edges) {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '80',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    },
    children: nodes.map(n => ({
      id: n.id,
      width: n.data.width || 200,
      height: n.data.height || 80,
    })),
    edges: edges.map(e => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  }

  const layoutedGraph = await elk.layout(graph)
  // Apply positions back to nodes
  const layoutedNodes = nodes.map(n => {
    const elkNode = layoutedGraph.children?.find(c => c.id === n.id)
    return { ...n, position: { x: elkNode?.x || 0, y: elkNode?.y || 0 } }
  })
  return { nodes: layoutedNodes, edges }
}
```

**커스텀 노드 색상 스펙:**
- 회사 노드: `bg-slate-100 text-slate-900 border-2 border-slate-300` (밝은 배경, 루트 강조)
- 부서 노드: `bg-blue-950 border-2 border-blue-600 text-blue-100` (파란 계열)
- 에이전트 노드(일반): `bg-emerald-950 border-2 border-emerald-600 text-emerald-100` (초록 계열)
- 비서 노드: `bg-amber-950 border-2 border-amber-500 text-amber-100` (금색 계열)
- 미배속 그룹: `border-2 border-dashed border-orange-500 bg-orange-950/30`

**상태 도트 스펙:**
- online: `bg-emerald-500` (초록)
- working: `bg-blue-500 animate-pulse` (파란+펄스)
- error: `bg-red-500` (빨간)
- offline: `bg-slate-500` (회색)

**Tier 뱃지 스펙:**
- Manager: `bg-blue-900 text-blue-300`
- Specialist: `bg-cyan-900 text-cyan-300`
- Worker: `bg-slate-700 text-slate-400`

### 이전 스토리에서 배운 것 (Story 7.4 Intelligence)

- 백엔드는 이미 구현됨 — 서버 코드 수정 불필요
- Admin UI 패턴: TanStack Query + useQuery(['org-chart', companyId])
- `useAdminStore((s) => s.selectedCompanyId)` 로 회사 ID 접근
- `useToastStore` 에러 알림
- App.tsx lazy import 패턴: `const XPage = lazy(() => import('./pages/x').then((m) => ({ default: m.XPage })))`
- sidebar.tsx 메뉴 추가: `{ to: '/path', label: '라벨', icon: '아이콘' }`
- `Skeleton` 컴포넌트: `@corthex/ui`에서 import

### Git Intelligence (최근 커밋 패턴)

```
dc174e9 fix(engine): move soul-renderer import behind service boundary (E10)
d1e25a5 feat: Story 7.4 Cascade 규칙 + 삭제 방지 — session check + force deactivate + ApiError + 34 tests
2841249 feat: Story 11.3 SketchVibe AI 실시간 편집
85fb31d feat: Story 7.2 에이전트 CRUD + Soul 편집
```
- 커밋 메시지: `feat: Story X.Y 제목 — 변경 요약 + N tests`
- 프론트엔드 파일: `packages/admin/src/pages/`, `packages/admin/src/components/`
- 신규 의존성: `packages/admin/package.json`에 추가

### Project Structure Notes

- `packages/admin/src/pages/nexus.tsx` — NEW: NEXUS React Flow 페이지
- `packages/admin/src/lib/elk-layout.ts` — NEW: ELK.js 레이아웃 유틸리티
- `packages/admin/src/components/nexus/company-node.tsx` — NEW: 회사 노드 컴포넌트
- `packages/admin/src/components/nexus/department-node.tsx` — NEW: 부서 노드 컴포넌트
- `packages/admin/src/components/nexus/agent-node.tsx` — NEW: 에이전트 노드 컴포넌트
- `packages/admin/src/App.tsx` — MODIFY: `/nexus` 라우트 추가
- `packages/admin/src/components/sidebar.tsx` — MODIFY: NEXUS 메뉴 추가
- `packages/admin/package.json` — MODIFY: `@xyflow/react`, `elkjs` 추가

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 7, Story 7.5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Library Decisions — NEXUS React Flow + ELK.js]
- [Source: _bmad-output/planning-artifacts/architecture.md#번들 최적화 — React.lazy() 동적 import]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UC1 — NEXUS 조직 설계]
- [Source: packages/server/src/routes/admin/org-chart.ts — GET /admin/org-chart API]
- [Source: packages/admin/src/pages/org-chart.tsx — 기존 트리 리스트 조직도]
- [Source: packages/admin/src/App.tsx — lazy import + 라우트 패턴]
- [Source: packages/admin/src/components/sidebar.tsx — 메뉴 등록 패턴]
- [Source: _bmad-output/implementation-artifacts/7-4-cascade-rules-delete-protection.md — 이전 스토리]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: @xyflow/react@12.10.1 + elkjs@0.11.1 installed in packages/admin
- Task 2: Existing org-chart API confirmed sufficient (company/departments/agents + isSecretary)
- Task 3: ELK layout utility with layered DOWN algorithm, NODE_SIZES config, async computeElkLayout()
- Task 4: 4 custom React Flow nodes — CompanyNode, DepartmentNode, AgentNode, UnassignedGroupNode
- Task 5: Full NEXUS page with ReactFlow canvas, Controls, MiniMap, Background, dark theme styling
- Task 6: /nexus route + sidebar menu registered with React.lazy dynamic import
- Task 7: UnassignedGroupNode with orange dashed border, integrated in ELK layout
- Task 8: 11 unit tests covering node/edge transformation logic (all pass)
- tsc --noEmit passes for both server and admin packages

### Change Log

- 2026-03-11: Story 7.5 구현 완료
  - Dependencies: @xyflow/react@12.10.1 + elkjs@0.11.1 added to packages/admin
  - ELK Layout: packages/admin/src/lib/elk-layout.ts — computeElkLayout() with layered DOWN algorithm
  - Custom Nodes: 4 components in packages/admin/src/components/nexus/ (company, department, agent, unassigned-group)
  - NEXUS Page: packages/admin/src/pages/nexus.tsx — ReactFlow canvas with Controls, MiniMap, Background
  - Routing: /nexus route in App.tsx + sidebar menu item
  - Tests: 11 unit tests — node/edge transformation, ID uniqueness, data preservation, large org

### File List

- `packages/admin/package.json` — MODIFIED: added @xyflow/react, elkjs dependencies
- `packages/admin/src/lib/elk-layout.ts` — NEW: ELK.js layout utility (computeElkLayout)
- `packages/admin/src/components/nexus/company-node.tsx` — NEW: Company root node component
- `packages/admin/src/components/nexus/department-node.tsx` — NEW: Department node component (blue)
- `packages/admin/src/components/nexus/agent-node.tsx` — NEW: Agent node component (green/gold)
- `packages/admin/src/components/nexus/unassigned-group-node.tsx` — NEW: Unassigned group node (orange dashed)
- `packages/admin/src/pages/nexus.tsx` — NEW: NEXUS React Flow org chart page
- `packages/admin/src/App.tsx` — MODIFIED: /nexus route + NexusPage lazy import
- `packages/admin/src/components/sidebar.tsx` — MODIFIED: NEXUS 조직도 menu item
- `packages/server/src/__tests__/unit/story-7-5-nexus-org-chart.test.ts` — NEW: 11 unit tests
