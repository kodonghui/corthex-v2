# Story 17.4: NEXUS 템플릿 공유

Status: done

## Story

As a 로그인한 일반 유저,
I want 내 워크플로우를 템플릿으로 공유하고, 다른 사람의 템플릿을 복제해서 내 워크플로우로 사용,
so that 회사 내에서 우수한 워크플로우를 공유하고 재활용할 수 있다.

## Acceptance Criteria

1. **Given** 워크플로우 편집 화면 **When** `[템플릿으로 공유]` 버튼 클릭 **Then** `PUT /workspace/nexus/workflows/:id` 호출 (isTemplate: true) + Toast "템플릿으로 공유되었습니다"
2. **Given** 이미 템플릿인 워크플로우 **When** 편집 화면 진입 **Then** `[공유 해제]` 버튼 표시, 클릭 시 isTemplate: false 설정
3. **Given** 워크플로우 목록 **When** 탭 필터 "내 워크플로우" / "템플릿" 2개 탭 표시 **Then** "내 워크플로우" 기본 선택 (기존 동작), "템플릿" 탭은 isTemplate=true인 워크플로우 표시
4. **Given** `GET /workspace/nexus/workflows?filter=templates` 호출 **When** 필터 파라미터 있음 **Then** companyId 내 isTemplate=true인 워크플로우만 반환 (다른 유저가 공유한 것도 포함)
5. **Given** 템플릿 목록 **When** 워크플로우 카드에 `[복제]` 버튼 클릭 **Then** `POST /workspace/nexus/workflows/:id/clone` 호출 → 새 워크플로우 생성 (이름: "원본이름 (복사)", isTemplate=false, createdBy=현재유저, nodes/edges 복사)
6. **Given** 복제된 워크플로우 **When** 생성 완료 **Then** 자동으로 편집 화면 진입 + Toast "워크플로우를 복제했습니다"
7. **Given** 워크플로우 카드 **When** 템플릿인 경우 **Then** "템플릿" 뱃지 표시 (isTemplate=true)
8. **Given** 내 워크플로우 목록 **When** 내 워크플로우 카드에도 `[복제]` 버튼 **Then** 자기 워크플로우도 복제 가능
9. **Given** `turbo build type-check` **When** 전체 빌드 **Then** 8/8 success, 타입 에러 0건

## Tasks / Subtasks

- [x] Task 1: 서버 — GET /nexus/workflows 필터 파라미터 추가 (AC: #3, #4)
  - [x] `filter=templates` 쿼리 파라미터 추가: isTemplate=true 필터링
  - [x] `filter=mine` (기본): createdBy=현재유저 필터
  - [x] 필터 없으면 기존 동작 유지 (전체 반환)

- [x] Task 2: 서버 — POST /nexus/workflows/:id/clone 복제 API (AC: #5)
  - [x] 원본 워크플로우 존재 + companyId 확인
  - [x] 새 워크플로우 생성: name=`${원본.name} (복사)`, description=원본.description, nodes=원본.nodes, edges=원본.edges, isTemplate=false, createdBy=현재유저
  - [x] 응답: 201 + 새 워크플로우 데이터
  - [x] logActivity: "NEXUS: 워크플로우 복제 — 원본이름"

- [x] Task 3: 프론트엔드 — WorkflowListPanel 템플릿 탭 + 복제 버튼 (AC: #3, #7, #8)
  - [x] 상단 "내 워크플로우" / "템플릿" 탭 추가
  - [x] 탭에 따라 filter 쿼리 파라미터 변경
  - [x] 카드에 isTemplate 뱃지 표시
  - [x] 카드에 `[복제]` 버튼 추가 (stopPropagation으로 카드 클릭과 분리)
  - [x] 복제 성공 시 onSelect(새 워크플로우 id)로 편집 화면 진입

- [x] Task 4: 프론트엔드 — WorkflowEditor 템플릿 공유/해제 버튼 (AC: #1, #2)
  - [x] 툴바에 `[템플릿으로 공유]` / `[공유 해제]` 토글 버튼 추가
  - [x] PUT /nexus/workflows/:id { isTemplate: true/false } mutation
  - [x] Toast 알림

- [x] Task 5: 빌드 검증 (AC: #9)
  - [x] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### 현재 상태 분석 (Story 17-3 완료 후)

1. **DB 스키마 (17-1에서 완료)**
   - `nexusWorkflows.isTemplate` (boolean, default false) — **이미 존재, API/UI에서만 미사용**
   - `nexusWorkflows.createdBy` (uuid FK→users) — 소유자 필터에 사용
   - 새 마이그레이션/스키마 변경 **불필요**

2. **기존 서버 API** (`packages/server/src/routes/workspace/nexus.ts`)
   - `GET /nexus/workflows` — 현재 companyId 전체 반환, filter 없음 → **filter 쿼리 추가**
   - `POST /nexus/workflows` — 생성 시 isTemplate 미설정 (default false) → 그대로 유지
   - `PUT /nexus/workflows/:id` — updateWorkflowSchema에 이미 `isActive` optional 있지만 `isTemplate` 없음 → **isTemplate 추가**
   - 워크플로우 복제 API **없음** → **신규 추가**

3. **기존 프론트엔드**
   - `WorkflowListPanel.tsx`: 목록 + 생성 모달만 → **탭 + 복제 버튼 추가**
   - `WorkflowEditor.tsx`: 편집/실행/삭제 툴바 → **템플릿 공유/해제 버튼 추가**

### 서버 API 변경 설계

```ts
// 1. GET /nexus/workflows — filter 쿼리 파라미터 추가
// ?filter=mine → createdBy = 현재유저 (기본)
// ?filter=templates → isTemplate = true (전체 회사)
// 필터 없으면 기존 동작 유지 (전체)
GET /workspace/nexus/workflows?filter=mine
GET /workspace/nexus/workflows?filter=templates

// 2. PUT /nexus/workflows/:id — updateWorkflowSchema에 isTemplate 추가
updateWorkflowSchema = z.object({
  ...기존,
  isTemplate: z.boolean().optional(),
})

// 3. POST /nexus/workflows/:id/clone — 복제 API (신규)
POST /workspace/nexus/workflows/:id/clone
→ { data: NexusWorkflow } (201)
```

### 프론트엔드 변경 설계

```
WorkflowListPanel.tsx:
├─ 상단: "내 워크플로우" / "템플릿" 탭 (state: listFilter = 'mine' | 'templates')
├─ queryKey: ['nexus-workflows', listFilter]
├─ queryFn: GET /workspace/nexus/workflows?filter=${listFilter}
├─ 카드 변경:
│  ├─ isTemplate 뱃지 추가 (보라색 "템플릿" 뱃지)
│  └─ [복제] 버튼 추가 (onClick: stopPropagation + clone API)
└─ 복제 성공: onSelect(clonedWorkflow.id)

WorkflowEditor.tsx:
├─ 툴바 변경:
│  └─ 삭제 버튼 앞에 [템플릿으로 공유] / [공유 해제] 토글
│     workflow.isTemplate ? "[공유 해제]" : "[템플릿으로 공유]"
└─ templateMutation: PUT /nexus/workflows/:id { isTemplate: !workflow.isTemplate }
```

### 기존 패턴 재사용

1. **CRUD API 패턴** → 기존 nexus.ts 워크플로우 CRUD와 동일 패턴
2. **filter 쿼리 패턴** → Zod: `z.object({ filter: z.enum(['mine', 'templates']).optional() })`
3. **뱃지 패턴** → Badge 컴포넌트 이미 사용 중 (isActive 뱃지와 동일)
4. **탭 패턴** → nexus.tsx의 조직도/워크플로우 탭 패턴 재사용
5. **Toast 패턴** → 기존 toast 유틸 사용
6. **useMutation 패턴** → TanStack Query 5
7. **stopPropagation 패턴** → 카드 클릭 내 버튼 이벤트 분리

### DB import — 변경 불필요
nexus.ts에서 이미 `nexusWorkflows, nexusExecutions` import됨

### updateWorkflowSchema 변경
```ts
// 기존:
const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
})

// 변경: isTemplate 추가
const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
  isTemplate: z.boolean().optional(),  // 신규
})
```

### Project Structure Notes

```
packages/server/
  src/
    routes/workspace/nexus.ts     <- filter 쿼리 + clone API + updateSchema isTemplate 추가

packages/app/
  src/
    components/nexus/
      WorkflowListPanel.tsx       <- 탭 필터 + 복제 버튼 + 템플릿 뱃지
      WorkflowEditor.tsx          <- 템플릿 공유/해제 토글 버튼
```

### References

- [Source: packages/server/src/db/schema.ts:640-652] — nexusWorkflows 스키마 (isTemplate 필드)
- [Source: packages/server/src/routes/workspace/nexus.ts:300-503] — 워크플로우 CRUD + 실행 API
- [Source: packages/app/src/components/nexus/WorkflowListPanel.tsx] — 워크플로우 목록 컴포넌트
- [Source: packages/app/src/components/nexus/WorkflowEditor.tsx] — 워크플로우 편집 캔버스
- [Source: packages/shared/src/types.ts:242-254] — NexusWorkflow 타입 (isTemplate 이미 포함)
- [Source: _bmad-output/implementation-artifacts/17-3-workflow-edit-exec.md] — 이전 스토리 완료 내역

### Previous Story Intelligence (17-3)

- CRUD API 6개 완료: GET list, POST create, PUT update, DELETE, POST execute, GET executions
- WorkflowListPanel: 카드 그리드, 생성 모달, 빈 상태 — 탭 구조만 추가하면 됨
- WorkflowEditor: React Flow 편집 캔버스, 노드 추가/연결/삭제, 저장/실행/삭제 — 툴바에 버튼 추가
- ExecutionHistoryPanel: 실행 기록 테이블 — 변경 없음
- Badge, ConfirmDialog, toast 이미 import/사용 중
- turbo build 8/8 success, 2161 unit tests

### Git Intelligence

Recent commits:
- `b2a8eca` feat: Story 17-3 워크플로우 편집 + 실행 — CRUD API + 에디터 UI + TEA 110건
- `f917a50` feat: Story 17-2 NEXUS 캔버스 베이스 — 통합 그래프 API + TEA 106건
- `ea58da7` feat: Story 17-1 P4 DB 스키마 — nexusWorkflows + nexusExecutions + TEA 121건

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: GET /nexus/workflows에 filter 쿼리 파라미터 추가 (mine/templates/전체)
- Task 2: POST /nexus/workflows/:id/clone 복제 API — 이름 "(복사)" 접미사, isTemplate=false, createdBy=현재유저
- Task 3: WorkflowListPanel — "내 워크플로우"/"템플릿" 탭 + 카드 복제 버튼 + 템플릿 뱃지(purple)
- Task 4: WorkflowEditor — 툴바에 "템플릿으로 공유"/"공유 해제" 토글 버튼 추가
- Task 5: turbo build type-check 8/8 success, 10 new unit tests pass

### File List

- packages/server/src/routes/workspace/nexus.ts (수정 — filter 쿼리 + clone API + updateSchema isTemplate)
- packages/app/src/components/nexus/WorkflowListPanel.tsx (수정 — 탭 필터 + 복제 버튼 + 템플릿 뱃지)
- packages/app/src/components/nexus/WorkflowEditor.tsx (수정 — 템플릿 공유/해제 토글 버튼)
- packages/server/src/__tests__/unit/nexus-template-share.test.ts (신규 — 10 tests)
