# Story 17.2: NEXUS 캔버스 베이스

Status: done

## Story

As a 전 직원(로그인 유저),
I want 조직도를 React Flow 캔버스로 읽기 전용으로 볼 수 있고, 에이전트 노드 클릭 시 정보 패널에서 바로 채팅으로 이동,
so that 조직 구조와 에이전트 현황을 시각적으로 파악하고 빠르게 소통할 수 있다.

## Acceptance Criteria

1. **Given** 로그인한 일반 유저 **When** `/nexus` 접속 **Then** React Flow 캔버스에 조직도(부서+에이전트) 가 읽기 전용으로 표시됨 (편집 불가, 드래그로 뷰 이동만 가능)
2. **Given** 캔버스 로드 **When** 데이터 로드 완료 **Then** `fitView({ padding: 0.2 })` 자동 호출, BackgroundVariant.Dots + Controls + MiniMap 표시
3. **Given** 에이전트 노드 클릭 **When** NexusInfoPanel 슬라이드오버 표시 **Then** 에이전트 이름/역할/소울 한 줄 + 온라인 상태 + `[채팅하기]` 버튼 (`/chat?agentId=`) 표시. 닫기: X 버튼 + 외부 클릭 + Esc
4. **Given** 부서 노드 클릭 **When** 해당 부서 선택 **Then** 소속 에이전트 노드+엣지 하이라이트 (나머지 `opacity-30`)
5. **Given** `nexus-updated` WebSocket 이벤트 수신 **When** 관리자가 조직도 저장 **Then** 자동으로 데이터 재호출 + `fitView()` 재실행
6. **Given** 데이터 로딩 중 **When** 캔버스 표시 **Then** 전체 화면 중앙 Spinner + "조직도를 불러오는 중..."
7. **Given** 에이전트/부서 데이터 없음 **When** 빈 상태 **Then** "아직 조직도가 구성되지 않았습니다." 표시 (버튼 없음)
8. **Given** `GET /workspace/nexus/graph` API **When** 호출 **Then** nodes/edges + 좌표 + updatedAt 통합 응답 반환 (기존 org-data + layout 합친 새 엔드포인트)
9. **Given** 모바일 터치 **When** 캔버스 조작 **Then** 팬/줌 터치 지원, 노드 탭 → 슬라이드오버
10. **Given** `turbo build type-check` **When** 전체 빌드 **Then** 8/8 success, 타입 에러 0건

## Tasks / Subtasks

- [x] Task 1: 서버 — `GET /nexus/graph` 통합 API 추가 (AC: #8)
  - [x]`packages/server/src/routes/workspace/nexus.ts`에 `GET /nexus/graph` 엔드포인트 추가
  - [x]org-data + layout 데이터를 하나로 합침: `{ nodes: [...], edges: [...], updatedAt }`
  - [x]노드 구조: `{ id, type ('company'|'department'|'agent'), label, x, y, color?, agentId?, role?, status?, isSecretary?, description?, agentCount? }`
  - [x]엣지 구조: `{ id, source, target, type ('smoothstep'|'bezier'), animated?, style? }`
  - [x]모든 로그인 유저 접근 가능 (admin 제한 없음)

- [x] Task 2: shared 타입 — NexusGraphData 타입 추가 (AC: #8)
  - [x]`packages/shared/src/types.ts`에 `NexusGraphNode`, `NexusGraphEdge`, `NexusGraphData` 타입 추가
  - [x]기존 `NexusOrgData`, `NexusLayoutData` 유지 (기존 코드 호환)

- [x] Task 3: NexusInfoPanel 컴포넌트 생성 (AC: #3)
  - [x]`packages/app/src/components/nexus/NexusInfoPanel.tsx` 신규 생성 (PascalCase)
  - [x]에이전트 이름, 역할, 소울(persona) 한 줄, 온라인 상태 dot
  - [x]`[채팅하기]` 버튼 → `navigate('/chat?agentId=' + agentId)`
  - [x]닫기: X 버튼 + 외부 클릭 + Esc 키
  - [x]우측 슬라이드오버 스타일 (w-72, border-l, transition)

- [x] Task 4: nexus.tsx 페이지 리팩터링 — 읽기 전용 (AC: #1, #2, #6, #7)
  - [x]admin 전용 체크 제거 → 모든 로그인 유저 접근 허용
  - [x]`GET /nexus/graph` 새 API 사용 (기존 org-data + layout 대체)
  - [x]툴바에서 편집 버튼(자동 정렬, 레이아웃 저장) 제거
  - [x]`BackgroundVariant.Dots gap=16 size=1 color='#3f3f46'` 적용
  - [x]`fitView({ padding: 0.2 })` 초기 로드 시 자동 호출
  - [x]노드 `draggable: false` 설정 (읽기 전용)
  - [x]로딩 상태: 전체 화면 중앙 Spinner + "조직도를 불러오는 중..."
  - [x]빈 상태: "아직 조직도가 구성되지 않았습니다."
  - [x]MiniMap: `width=150 height=100`

- [x] Task 5: 부서 노드 클릭 하이라이트 (AC: #4)
  - [x]부서 노드 클릭 시 소속 에이전트 노드+엣지만 정상 표시
  - [x]나머지 노드/엣지 `opacity-30` 처리
  - [x]캔버스 빈 공간 클릭 시 하이라이트 해제

- [x] Task 6: NexusInfoPanel을 NodeDetailPanel 대체 (AC: #3)
  - [x]nexus.tsx에서 기존 `NodeDetailPanel` import를 `NexusInfoPanel`로 교체
  - [x]에이전트 노드 클릭 시 NexusInfoPanel 표시
  - [x]부서/회사 노드 클릭 시 하이라이트만 (InfoPanel 미표시)

- [x] Task 7: WebSocket nexus-updated 구독 (AC: #5)
  - [x]nexus.tsx에서 `nexus` WS 채널 구독
  - [x]`nexus-updated` 이벤트 수신 시 queryClient.invalidateQueries → 데이터 재호출
  - [x]재호출 후 `fitView()` 재실행

- [x] Task 8: 모바일 터치 지원 (AC: #9)
  - [x]ReactFlow `panOnScroll`, `zoomOnPinch` 설정
  - [x]노드 탭 → NexusInfoPanel 표시

- [x] Task 9: 빌드 검증 (AC: #10)
  - [x]`bunx turbo build type-check` → 8/8 success

## Dev Notes

### 현재 상태 분석 (Story 17-1 완료 후)

1. **nexus.tsx (현재 — 관리자 전용)**
   - `packages/app/src/pages/nexus.tsx` — admin role 체크, 편집 기능(자동 정렬, 레이아웃 저장) 포함
   - org-data + layout 2개 API 분리 호출
   - `NodeDetailPanel` — 관리자용 부서 이동 기능 포함
   - 이 스토리에서 **읽기 전용으로 전환** 필요

2. **기존 컴포넌트 (유지/수정)**
   - `CompanyNode.tsx` — 유지 (Handle source만)
   - `DepartmentNode.tsx` — 유지, 컬러바 추가 필요 (UX: 상단 h-2 컬러바)
   - `AgentNode.tsx` — 유지, 160×80px 사이즈 확인
   - `NodeDetailPanel.tsx` — **NexusInfoPanel로 대체** (admin용 부서이동 → 읽기용 정보+채팅)
   - `dagre-layout.ts` — 유지 (서버에서 좌표 내려줄 수 있으므로 fallback용)

3. **DB 테이블 (17-1에서 완료)**
   - `nexusWorkflows`, `nexusExecutions`, `mcpServers` — 이 스토리에서는 미사용 (17-3에서 사용)
   - `canvasLayouts` — 기존 레이아웃 저장. `GET /nexus/graph`에서 이 데이터 활용
   - WsChannel에 'nexus' 이미 추가됨

4. **기존 API 라우트** (`packages/server/src/routes/workspace/nexus.ts`)
   - `GET /nexus/org-data` — 조직 트리 (유지)
   - `GET /nexus/layout` — 저장된 레이아웃 (유지)
   - `PUT /nexus/layout` — 레이아웃 저장 (유지, Admin 에디터용)
   - `PATCH /nexus/agent/:id/department` — 에이전트 부서 이동 (유지, Admin용)
   - **새로 추가**: `GET /nexus/graph` — org-data + layout 통합 응답

### 새 API: GET /nexus/graph 설계

```ts
// 응답 구조
{
  data: {
    nodes: NexusGraphNode[]   // company + department + agent 모든 노드
    edges: NexusGraphEdge[]   // 소속(실선) + 위임(점선)
    updatedAt: string | null  // canvasLayouts.updatedAt
  }
}

// 서버 로직: 기존 org-data + layout 합쳐서 반환
// 1. companies, departments, agents 조회 (기존 org-data 로직)
// 2. canvasLayouts에서 저장된 좌표 로드
// 3. 저장 좌표 없으면 dagre 자동 레이아웃 (서버사이드 또는 클라이언트)
// 4. 통합 nodes/edges 배열로 반환
```

### NexusInfoPanel 설계 (UX 스펙 10.11)

```
┌── NexusInfoPanel (w-72, 우측 슬라이드오버) ──┐
│ [×]                                          │
│ 🟢 에이전트이름                               │
│ 역할: 금융분석팀장                             │
│ "당신은 데이터 분석 전문가..."                   │
│                                               │
│ [채팅하기]                                     │
└───────────────────────────────────────────────┘
```

- 소울(persona): agents 테이블의 `soul` 컬럼에서 첫 줄 추출
- 온라인 dot: agent-status WS 또는 데이터의 status 필드
- `navigate('/chat?agentId=' + agentId)` 클릭 시 이동

### 부서 하이라이트 구현

```ts
// 부서 클릭 시:
const highlightedNodeIds = new Set<string>()
highlightedNodeIds.add(deptNodeId) // 부서 자체
// 소속 에이전트 추가
edges.filter(e => e.source === deptNodeId).forEach(e => highlightedNodeIds.add(e.target))

// 노드/엣지에 className 동적 적용:
// 하이라이트 아닌 노드: opacity-30 transition-opacity
// 하이라이트된 노드: opacity-100
```

### WebSocket nexus-updated 구독

```ts
// 기존 WS 인프라 활용 (useWsSubscription 또는 직접 구독)
// 패턴: messenger 페이지의 WS 구독과 동일
import { useWs } from '../lib/ws'

const ws = useWs()
useEffect(() => {
  ws.subscribe('nexus')
  const handler = (msg: any) => {
    if (msg.type === 'nexus-updated') {
      queryClient.invalidateQueries({ queryKey: ['nexus-graph'] })
    }
  }
  ws.on('nexus', handler)
  return () => { ws.unsubscribe('nexus'); ws.off('nexus', handler) }
}, [])
```

### 파일명 컨벤션 (CLAUDE.md)

- 페이지/유틸: kebab-case (`nexus.tsx`, `dagre-layout.ts`)
- Nexus 컴포넌트: **PascalCase** (예외 규칙) — `AgentNode.tsx`, `DepartmentNode.tsx`, `CompanyNode.tsx`, `NexusInfoPanel.tsx`
- NodeDetailPanel.tsx는 **삭제하지 않음** — Admin 에디터(17-4?)에서 재활용 가능

### DepartmentNode 컬러바 추가

UX 스펙: "상단 컬러바 + 부서명 (Admin 설정 색상 그대로 표시)"
- 현재 DepartmentNode에 color prop 없음
- graph API에서 부서 color 내려줘야 함
- 색상 없으면 기본값 `zinc-500` 사용
- departments 테이블에 color 컬럼이 없으면 → 이 스토리에서는 기본 색상 사용, Admin 편집(후속 스토리)에서 색상 설정 기능 추가

### Project Structure Notes

```
packages/shared/
  src/types.ts                    <- NexusGraphNode, NexusGraphEdge, NexusGraphData 타입 추가

packages/server/
  src/
    routes/workspace/nexus.ts     <- GET /nexus/graph 엔드포인트 추가

packages/app/
  src/
    pages/nexus.tsx               <- 읽기 전용 리팩터링 + WS 구독 + 하이라이트
    components/nexus/
      NexusInfoPanel.tsx          <- 신규: 읽기 전용 에이전트 정보 슬라이드오버
      AgentNode.tsx               <- 기존 유지 (160×80px 확인)
      DepartmentNode.tsx          <- 컬러바 prop 추가
      CompanyNode.tsx             <- 기존 유지
      NodeDetailPanel.tsx         <- 기존 유지 (Admin용, 이 스토리에서 미사용)
    lib/
      dagre-layout.ts             <- 기존 유지 (fallback 레이아웃)
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:1531-1579] — NEXUS 읽기 전용 캔버스 UX 상세
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:537-593] — Admin NEXUS 편집 UX (참고용)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:958-968] — nexus-updated WebSocket 이벤트 페이로드
- [Source: packages/app/src/pages/nexus.tsx] — 현재 NEXUS 페이지 (admin 전용)
- [Source: packages/server/src/routes/workspace/nexus.ts] — 현재 nexus API 라우트
- [Source: packages/shared/src/types.ts:175-207] — 기존 NEXUS 타입 (NexusNodePosition, NexusLayoutData, NexusOrgData)
- [Source: packages/app/src/components/nexus/] — 기존 노드 컴포넌트 4개
- [Source: packages/app/src/lib/dagre-layout.ts] — Dagre 자동 레이아웃
- [Source: packages/server/src/ws/channels.ts] — WebSocket nexus 채널 (17-1에서 추가)
- [Source: _bmad-output/implementation-artifacts/17-1-p4-db-schema-ws.md] — 이전 스토리 완료 내역

### Previous Story Intelligence (17-1)

- Drizzle 스키마: nexusWorkflows, nexusExecutions, mcpServers + relations 완료
- WsChannel에 'nexus' 추가 완료 (8개 채널)
- nexus WS 구독 패턴: `nexus::${companyId}`, agent-status와 동일
- turbo build 8/8 success, 1943 unit tests pass
- 마이그레이션 최신: 0019 (nexus 관련), 0028 (messenger-file-attach 최신)

### Git Intelligence

Recent commits:
- `ea58da7` feat: Story 17-1 P4 DB 스키마 — TEA 121건
- `82df90c` docs: Epic 16 회고 완료
- `3d1ee02` feat: Story 16-6 메신저 파일 첨부 — TEA 87건

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: GET /nexus/graph 통합 API 추가 — org-data + layout 합쳐서 nodes/edges/updatedAt 반환, soul 첫줄 100자 포함
- Task 2: NexusGraphNode, NexusGraphEdge, NexusGraphData 타입 shared에 추가 (기존 타입 유지)
- Task 3: NexusInfoPanel 신규 — 에이전트 이름/역할/소울/상태 + 채팅하기 버튼 + Esc/X 닫기
- Task 4: nexus.tsx 읽기 전용 리팩터링 — admin 체크 제거, GET /nexus/graph 사용, draggable false, BackgroundVariant.Dots, fitView, 로딩/빈 상태
- Task 5: 부서 클릭 하이라이트 — 소속 에이전트+엣지 opacity 1, 나머지 0.3, 토글 지원
- Task 6: NodeDetailPanel → NexusInfoPanel 교체, 에이전트 클릭만 패널 표시
- Task 7: WS nexus 채널 구독 + nexus-updated 시 queryClient.invalidateQueries
- Task 8: panOnScroll + zoomOnPinch 모바일 터치 지원
- Task 9: turbo build type-check 8/8 success, 2050 unit tests pass (23 new)

### File List

- packages/shared/src/types.ts (수정 — NexusGraphNode, NexusGraphEdge, NexusGraphData 타입 추가)
- packages/server/src/routes/workspace/nexus.ts (수정 — GET /nexus/graph 엔드포인트 추가)
- packages/app/src/pages/nexus.tsx (수정 — 읽기 전용 리팩터링 + WS + 하이라이트)
- packages/app/src/components/nexus/NexusInfoPanel.tsx (신규 — 에이전트 정보 슬라이드오버)
- packages/server/src/__tests__/unit/nexus-canvas-base.test.ts (신규 — 23 tests)
- _bmad-output/implementation-artifacts/sprint-status.yaml (수정 — 스토리 상태 업데이트)
