# Story 17.3: NEXUS 워크플로우 편집 + 실행

Status: done

## Story

As a 로그인한 일반 유저,
I want NEXUS 페이지에서 워크플로우를 생성/편집/실행하고 실행 결과를 확인,
so that 에이전트 간 업무 흐름을 시각적으로 설계하고 자동화할 수 있다.

## Acceptance Criteria

1. **Given** 로그인한 유저 **When** `GET /workspace/nexus/workflows` 호출 **Then** 본인 회사의 워크플로우 목록 반환 (id, name, description, isTemplate, isActive, createdBy, createdAt, updatedAt)
2. **Given** 로그인한 유저 **When** `POST /workspace/nexus/workflows` 호출 (name, description, nodes, edges) **Then** 새 워크플로우 생성 + 201 응답
3. **Given** 워크플로우 소유자 **When** `PUT /workspace/nexus/workflows/:id` 호출 **Then** name/description/nodes/edges/isActive 수정 가능
4. **Given** 워크플로우 소유자 **When** `DELETE /workspace/nexus/workflows/:id` 호출 **Then** 워크플로우 삭제 (실행 기록도 cascade 삭제)
5. **Given** 워크플로우 id **When** `POST /workspace/nexus/workflows/:id/execute` 호출 **Then** nexusExecutions에 status='running' 레코드 생성 + 실행 stub 실행 후 status='completed', result={message:'실행 완료(stub)'} 업데이트 + 응답 반환
6. **Given** 워크플로우 id **When** `GET /workspace/nexus/workflows/:id/executions` 호출 **Then** 해당 워크플로우의 실행 기록 목록 반환 (최신순, limit 20)
7. **Given** NEXUS 페이지 **When** 상단 탭에 "조직도" / "워크플로우" 2개 탭 표시 **Then** 기본 탭=조직도, 워크플로우 탭 클릭 시 워크플로우 목록 표시
8. **Given** 워크플로우 탭 **When** `[+ 새 워크플로우]` 클릭 **Then** 이름 입력 모달 → 확인 시 POST 호출 + 새 워크플로우 편집 화면 진입
9. **Given** 워크플로우 편집 화면 **When** React Flow 캔버스에서 노드 추가/연결/삭제 + `[저장]` 클릭 **Then** PUT 호출로 nodes/edges 저장
10. **Given** 워크플로우 편집 화면 **When** `[실행]` 버튼 클릭 **Then** POST execute 호출 → 실행 결과 Toast 표시
11. **Given** 워크플로우 목록 **When** 워크플로우 카드 클릭 **Then** 편집 화면 진입 (노드/엣지 로드)
12. **Given** 워크플로우 편집 **When** `[실행 기록]` 클릭 **Then** 하단 패널에 실행 기록 목록 표시 (상태/시작시간/결과)
13. **Given** `turbo build type-check` **When** 전체 빌드 **Then** 8/8 success, 타입 에러 0건

## Tasks / Subtasks

- [x] Task 1: 서버 — 워크플로우 CRUD API 추가 (AC: #1, #2, #3, #4)
  - [x] `packages/server/src/routes/workspace/nexus.ts`에 워크플로우 엔드포인트 추가
  - [x] `GET /nexus/workflows` — companyId 기반 목록 조회
  - [x] `POST /nexus/workflows` — name(필수), description, nodes(jsonb []), edges(jsonb []) + createdBy=현재유저
  - [x] `PUT /nexus/workflows/:id` — companyId + id 일치 확인, name/description/nodes/edges/isActive 수정
  - [x] `DELETE /nexus/workflows/:id` — companyId + id 일치, 실행 기록 먼저 삭제 후 워크플로우 삭제
  - [x] Zod 스키마: createWorkflowSchema (name varchar200 필수, description optional, nodes/edges array), updateWorkflowSchema (name/description/nodes/edges/isActive partial)

- [x] Task 2: 서버 — 워크플로우 실행 API 추가 (AC: #5, #6)
  - [x] `POST /nexus/workflows/:id/execute` — 워크플로우 존재/활성 확인 → nexusExecutions INSERT (status='running') → stub 실행 (즉시 completed) → 응답
  - [x] `GET /nexus/workflows/:id/executions` — workflowId + companyId 기반 실행 기록 목록 (최신순, limit 20)
  - [x] stub 실행 로직: 즉시 status='completed', result={ message: '워크플로우 실행 완료 (stub)', nodeCount, edgeCount, executedAt }

- [x] Task 3: shared 타입 — 워크플로우 관련 타입 추가 (AC: #1~#6)
  - [x] `packages/shared/src/types.ts`에 `NexusWorkflow`, `NexusExecution` 타입 추가
  - [x] NexusWorkflow: { id, companyId, name, description, nodes, edges, isTemplate, isActive, createdBy, createdAt, updatedAt }
  - [x] NexusExecution: { id, companyId, workflowId, status, result, startedAt, completedAt }

- [x] Task 4: 프론트엔드 — NEXUS 페이지 탭 구조 추가 (AC: #7)
  - [x] nexus.tsx에 "조직도" / "워크플로우" 탭 헤더 추가
  - [x] 기본 탭 = 조직도 (기존 캔버스)
  - [x] 워크플로우 탭 = WorkflowListPanel 컴포넌트
  - [x] URL 쿼리 연동: `/nexus?tab=workflows`

- [x] Task 5: 프론트엔드 — 워크플로우 목록 패널 (AC: #8, #11)
  - [x] `packages/app/src/components/nexus/WorkflowListPanel.tsx` 신규 (PascalCase)
  - [x] useQuery로 GET /workspace/nexus/workflows 조회
  - [x] 카드 리스트: 이름, 설명(truncate), 생성일, 활성 상태 뱃지
  - [x] `[+ 새 워크플로우]` 버튼 → 이름 입력 모달 (Dialog + Input)
  - [x] 카드 클릭 → 워크플로우 편집 화면 (state 변경)
  - [x] 빈 상태: "아직 워크플로우가 없습니다. 새로 만들어보세요."

- [x] Task 6: 프론트엔드 — 워크플로우 편집 캔버스 (AC: #9, #10, #12)
  - [x] `packages/app/src/components/nexus/WorkflowEditor.tsx` 신규 (PascalCase)
  - [x] React Flow 캔버스 (편집 모드): nodesDraggable=true, nodesConnectable=true
  - [x] 노드 타입: 기본 `default` 노드 (label 표시) — 향후 커스텀 노드 확장 가능
  - [x] 상단 툴바: `[+ 노드]`, `[저장]`, `[실행]`, `[실행 기록]`, `[← 목록]`
  - [x] `[+ 노드]` — addNodes로 새 default 노드 추가 (label 입력 prompt)
  - [x] `[저장]` — PUT 호출 (nodes 좌표+data, edges 포함)
  - [x] `[실행]` — POST execute → Toast (성공: "워크플로우 실행 완료", 실패: 에러 메시지)
  - [x] `[실행 기록]` — 하단 ExecutionHistoryPanel 토글
  - [x] `[← 목록]` — 워크플로우 목록으로 복귀
  - [x] Delete/Backspace 키로 선택 노드/엣지 삭제
  - [x] 워크플로우 삭제: 편집 화면 우상단 `[삭제]` → ConfirmDialog → DELETE 호출

- [x] Task 7: 프론트엔드 — 실행 기록 패널 (AC: #12)
  - [x] `packages/app/src/components/nexus/ExecutionHistoryPanel.tsx` 신규 (PascalCase)
  - [x] useQuery로 GET /workspace/nexus/workflows/:id/executions 조회
  - [x] 테이블: 상태(running/completed/failed 뱃지), 시작시간, 완료시간, 결과 요약
  - [x] 빈 상태: "아직 실행 기록이 없습니다."

- [x] Task 8: 빌드 검증 (AC: #13)
  - [x] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### 현재 상태 분석 (Story 17-2 완료 후)

1. **DB 테이블 (17-1에서 완료, 사용 준비 됨)**
   - `nexusWorkflows` (schema.ts:640-652): id, companyId, name, description, nodes(jsonb), edges(jsonb), isTemplate, isActive, createdBy, createdAt, updatedAt
   - `nexusExecutions` (schema.ts:655-663): id, companyId, workflowId, status(varchar 20, default 'running'), result(jsonb), startedAt, completedAt
   - relations 완료: nexusWorkflowsRelations (company, createdByUser, executions), nexusExecutionsRelations (company, workflow)

2. **기존 nexus.ts 라우트** (packages/server/src/routes/workspace/nexus.ts)
   - GET /nexus/org-data, GET /nexus/layout, PUT /nexus/layout, GET /nexus/graph, PATCH /nexus/agent/:id/department
   - 이 스토리에서 **워크플로우 CRUD + 실행 엔드포인트 추가**

3. **기존 nexus.tsx 페이지** (packages/app/src/pages/nexus.tsx)
   - 읽기 전용 조직도 캔버스 (17-2에서 완료)
   - 이 스토리에서 **탭 구조 추가** (조직도 + 워크플로우)

4. **기존 Nexus 컴포넌트** (packages/app/src/components/nexus/)
   - CompanyNode.tsx, DepartmentNode.tsx, AgentNode.tsx, NexusInfoPanel.tsx, NodeDetailPanel.tsx
   - 이 스토리에서 **3개 신규 추가**: WorkflowListPanel.tsx, WorkflowEditor.tsx, ExecutionHistoryPanel.tsx

### 서버 API 설계

```ts
// 1. 워크플로우 목록
GET /workspace/nexus/workflows
→ { data: NexusWorkflow[] }

// 2. 워크플로우 생성
POST /workspace/nexus/workflows
body: { name: string, description?: string, nodes?: any[], edges?: any[] }
→ { data: NexusWorkflow } (201)

// 3. 워크플로우 수정
PUT /workspace/nexus/workflows/:id
body: { name?, description?, nodes?, edges?, isActive? }
→ { data: NexusWorkflow }

// 4. 워크플로우 삭제
DELETE /workspace/nexus/workflows/:id
→ { data: { deleted: true } }

// 5. 워크플로우 실행
POST /workspace/nexus/workflows/:id/execute
→ { data: NexusExecution }

// 6. 실행 기록 조회
GET /workspace/nexus/workflows/:id/executions
→ { data: NexusExecution[] }
```

### Zod 스키마

```ts
const createWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  nodes: z.array(z.any()).default([]),
  edges: z.array(z.any()).default([]),
})

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
})
```

### 워크플로우 실행 (Stub)

```ts
// POST /nexus/workflows/:id/execute
// 1. 워크플로우 존재 확인 (companyId + id)
// 2. isActive 확인 (비활성이면 400)
// 3. nexusExecutions INSERT: { companyId, workflowId, status: 'running' }
// 4. Stub: 즉시 완료 처리
//    UPDATE status='completed', result={ message, nodeCount, edgeCount, executedAt }, completedAt=now()
// 5. 응답 반환
```

### 프론트엔드 탭 구조

```
nexus.tsx
├─ 탭 헤더: [조직도] [워크플로우]
├─ tab === 'org' → 기존 React Flow 조직도 캔버스 (코드 그대로)
└─ tab === 'workflows'
   ├─ selectedWorkflowId === null → <WorkflowListPanel />
   └─ selectedWorkflowId !== null → <WorkflowEditor workflowId={id} onBack={...} />
       └─ showHistory === true → <ExecutionHistoryPanel workflowId={id} />
```

### 프론트엔드 컴포넌트 상세

**WorkflowListPanel.tsx:**
- GET /workspace/nexus/workflows useQuery
- 카드 레이아웃: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- 카드: `bg-zinc-800 border border-zinc-700 rounded-lg p-4 cursor-pointer hover:border-zinc-500`
- 이름 `font-semibold`, 설명 `text-sm text-zinc-400 line-clamp-2`
- 하단: 생성일 `text-xs text-zinc-500` + isActive 뱃지
- `[+ 새 워크플로우]` → Dialog (이름 input + 확인/취소)

**WorkflowEditor.tsx:**
- GET /workspace/nexus/workflows/:id useQuery (단건 없으므로 목록에서 찾기 또는 별도 fetch)
- React Flow: `nodesDraggable={true}`, `nodesConnectable={true}`, `Background.Dots`, Controls
- 노드 추가: addNodes({ id: nanoid(), type: 'default', position: viewport 중앙, data: { label } })
- 연결: onConnect → addEdges
- 저장: nodes+edges 직렬화 → PUT (position, data 포함)
- 삭제: onNodesDelete, onEdgesDelete + Delete 키 핸들러
- dirty state 추적 (저장 안 된 변경 시 `[← 목록]` 클릭 시 확인 Dialog)

**ExecutionHistoryPanel.tsx:**
- 하단 펼침 패널 (h-48 max-h-64 overflow-auto)
- 테이블: 상태, 시작시간 (relative), 완료시간, 결과
- status 뱃지: running=`bg-blue-500/20 text-blue-400`, completed=`bg-emerald-500/20 text-emerald-400`, failed=`bg-red-500/20 text-red-400`

### 기존 패턴 재사용

1. **CRUD API 패턴** → jobs.ts, messenger-channels.ts와 동일 (companyId 격리, Zod 검증, returning())
2. **React Flow 설정** → nexus.tsx 기존 패턴 (nodeTypes, Background, Controls, MiniMap)
3. **모달/Dialog 패턴** → 기존 Dialog 컴포넌트 재사용 (packages/ui 또는 packages/app 내부)
4. **Toast 패턴** → 기존 toast 유틸 사용 (성공/실패)
5. **useQuery/useMutation** → TanStack Query 5 패턴

### DB import 추가 필요

nexus.ts 라우트 파일에서:
```ts
import { companies, departments, agents, canvasLayouts, nexusWorkflows, nexusExecutions } from '../../db/schema'
```

### Project Structure Notes

```
packages/shared/
  src/types.ts                    <- NexusWorkflow, NexusExecution 타입 추가

packages/server/
  src/
    routes/workspace/nexus.ts     <- 워크플로우 CRUD + 실행 엔드포인트 추가 (6개)

packages/app/
  src/
    pages/nexus.tsx               <- 탭 구조 추가 (조직도/워크플로우)
    components/nexus/
      WorkflowListPanel.tsx       <- 신규: 워크플로우 목록
      WorkflowEditor.tsx          <- 신규: 워크플로우 편집 캔버스
      ExecutionHistoryPanel.tsx   <- 신규: 실행 기록 패널
```

### References

- [Source: packages/server/src/db/schema.ts:640-663] — nexusWorkflows, nexusExecutions 테이블 스키마
- [Source: packages/server/src/db/schema.ts:896-905] — nexusWorkflowsRelations, nexusExecutionsRelations
- [Source: packages/server/src/routes/workspace/nexus.ts] — 기존 nexus API 라우트 (org-data, layout, graph)
- [Source: packages/app/src/pages/nexus.tsx] — 현재 NEXUS 읽기 전용 캔버스
- [Source: packages/app/src/components/nexus/] — 기존 Nexus 컴포넌트 5개
- [Source: packages/shared/src/types.ts] — NexusGraphNode, NexusGraphEdge, NexusGraphData 타입
- [Source: _bmad-output/implementation-artifacts/17-2-nexus-canvas-base.md] — 이전 스토리 완료 내역
- [Source: _bmad-output/implementation-artifacts/17-1-p4-db-schema-ws.md] — DB 스키마 + WS 완료 내역

### Previous Story Intelligence (17-2)

- nexus.tsx: 읽기 전용 리팩터링 완료, React Flow + WS 구독 + 부서 하이라이트
- NexusInfoPanel: 에이전트 정보 슬라이드오버 완료
- GET /nexus/graph: 통합 API 완료 (nodes/edges/updatedAt)
- 파일명 컨벤션: 페이지=kebab-case, Nexus 컴포넌트=PascalCase
- turbo build 8/8, 2050 unit tests
- `@xyflow/react` + `@dagrejs/dagre` 이미 설치됨
- Toast 패턴: 기존 프로젝트 내 toast 유틸 사용

### Git Intelligence

Recent commits:
- `f917a50` feat: Story 17-2 NEXUS 캔버스 베이스 — TEA 106건
- `ea58da7` feat: Story 17-1 P4 DB 스키마 — TEA 121건
- `82df90c` docs: Epic 16 회고 완료

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: 워크플로우 CRUD API 6개 엔드포인트 추가 (GET list, POST create, PUT update, DELETE, POST execute, GET executions)
- Task 2: 워크플로우 실행 stub — 즉시 completed 처리, result에 nodeCount/edgeCount/executedAt 포함
- Task 3: NexusWorkflow, NexusExecution 타입 shared에 추가
- Task 4: nexus.tsx 탭 구조 추가 — 조직도/워크플로우 탭, URL 쿼리 연동 (/nexus?tab=workflows)
- Task 5: WorkflowListPanel — 카드 그리드, 생성 모달, 빈 상태
- Task 6: WorkflowEditor — React Flow 편집 캔버스, 노드 추가/연결/삭제, 저장/실행/삭제, dirty state 추적
- Task 7: ExecutionHistoryPanel — 실행 기록 테이블, status 뱃지(running/completed/failed)
- Task 8: turbo build type-check 8/8 success, 2161 unit tests pass (28 new)

### File List

- packages/shared/src/types.ts (수정 — NexusWorkflow, NexusExecution 타입 추가)
- packages/server/src/routes/workspace/nexus.ts (수정 — 워크플로우 CRUD + 실행 API 6개 엔드포인트)
- packages/app/src/pages/nexus.tsx (수정 — 탭 구조 추가, 워크플로우 탭 연동)
- packages/app/src/components/nexus/WorkflowListPanel.tsx (신규 — 워크플로우 목록 패널)
- packages/app/src/components/nexus/WorkflowEditor.tsx (신규 — 워크플로우 편집 캔버스)
- packages/app/src/components/nexus/ExecutionHistoryPanel.tsx (신규 — 실행 기록 패널)
- packages/server/src/__tests__/unit/workflow-edit-exec.test.ts (신규 — 28 tests)
