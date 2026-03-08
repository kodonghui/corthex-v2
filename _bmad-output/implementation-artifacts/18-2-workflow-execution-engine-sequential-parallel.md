# Story 18.2: Workflow Execution Engine (Sequential & Parallel)

Status: done

## Story

As a CEO or Manager agent,
I want the system to actually execute the defined workflows, resolving dependencies between steps so that tasks can run sequentially or in parallel, automatically passing context between steps,
so that multi-step automation pipelines produce real results.

## Acceptance Criteria

1. **워크플로우 실행 요청**: POST /api/workspace/workflows/:id/execute → `workflowExecutions` 레코드 생성, 비동기 실행 시작
2. **스텝별 실행 추적**: 각 스텝의 실행 결과(success/failed/skipped), 출력 데이터, 소요 시간을 stepSummaries JSONB에 기록
3. **DAG 기반 순서 실행**: `dependsOn` 필드를 해석하여 위상 정렬(Topological Sort) 후, 같은 레이어의 독립 스텝은 `Promise.all`로 병렬 실행
4. **에러 핸들링**: 스텝 실행 중 에러 발생 시 전체 워크플로우를 'failed'로 기록하고 중단 (fail-fast 전략)
5. **컨텍스트 전달**: 이전 스텝 출력을 `{{stepId.property}}` 템플릿으로 다음 스텝 params에 자동 주입
6. **실행 상태 조회**: GET /api/workspace/workflows/:workflowId/executions → 실행 이력 조회 (페이지네이션)
7. **condition 분기**: condition 타입 스텝은 결과에 따라 trueBranch/falseBranch 중 하나만 실행
8. **타임아웃/재시도**: 스텝별 timeout(기본 30초), retryCount(기본 0, 최대 3) 지원

## Tasks / Subtasks

- [x] Task 1: DAGSolver 클래스 구현 (AC: #3)
  - [x] `resolveTiers(steps)` -- Kahn's 알고리즘으로 병렬 실행 레이어 분류
  - [x] 순환 참조 탐지 시 'Circular dependency' 에러 throw
  - [x] 참고: 18-1의 `validateDag()`와 동일 로직이지만 독립 모듈로 분리

- [x] Task 2: ExecutionContext 클래스 구현 (AC: #5)
  - [x] `setStepOutput(stepId, output)` -- 스텝 결과 저장
  - [x] `resolveParams(params)` -- `{{stepId.property.nested}}` 템플릿 치환
  - [x] Strict Templating: 존재하지 않는 경로 참조 시 'Strict Templating Error' throw

- [x] Task 3: WorkflowEngine 클래스 구현 (AC: #1, #2, #3, #4, #7, #8)
  - [x] `constructor(workflow)` -- Workflow 객체 주입
  - [x] `run()` -- DAG 레이어 순회, 각 레이어 Promise.all 병렬 실행
  - [x] tool 스텝: stub executor (실제 ToolPool 연동은 통합 시 교체)
  - [x] llm 스텝: stub executor (실제 AgentRunner 연동은 통합 시 교체)
  - [x] condition 스텝: trueBranch/falseBranch 분기 처리
  - [x] 스텝별 timeout + retry (exponential backoff: 2^attempt초)
  - [x] 실행 결과: `{ success, results: StepResult[] }`

- [x] Task 4: 실행 API 엔드포인트 추가 (AC: #1, #6)
  - [x] POST /workflows/:id/execute -- 워크플로우 실행 + DB 기록
  - [x] GET /workflows/:workflowId/executions -- 실행 이력 조회
  - [x] 권한: 인증된 사용자 (실행은 CEO/Admin 제한 없음)

## Dev Notes

### 아키텍처 결정

1. **모듈 분리**: 기존 Gemini 코드의 `engine.test.ts`가 기대하는 구조를 따름
   - `packages/server/src/lib/workflow/dag-solver.ts` -- DAGSolver 클래스
   - `packages/server/src/lib/workflow/execution-context.ts` -- ExecutionContext 클래스
   - `packages/server/src/lib/workflow/engine.ts` -- WorkflowEngine 클래스

2. **기존 코드와의 관계**:
   - `services/workflow/engine.ts` (18-1) -- CRUD + validateDag (건드리지 않음)
   - `lib/workflow/` (18-2) -- 실행 엔진 (새로 생성)
   - 18-1의 `validateDag()`와 DAGSolver의 로직이 유사하지만, validateDag은 검증+에러 리포팅용이고, DAGSolver는 실행 레이어 분류용으로 목적이 다름

3. **v1 패턴 반영**:
   - v1 `workflow.py`: 순차 실행 + `{prev_result}` 치환 → v2: DAG 기반 + `{{stepId.property}}` 치환
   - v1 `agent.py` ManagerAgent: `asyncio.gather()` 병렬 → v2: `Promise.all()` 병렬
   - v1 retry: 지수 백오프 (2^attempt초) → v2 동일
   - v1 fail-fast: 첫 실패 시 중단 → v2 동일

4. **DB 스키마 활용** (이미 마이그레이션 완료, 수정 불필요):
   - `workflow_executions` 테이블: status='success'|'failed', stepSummaries(JSONB), totalDurationMs
   - stepSummaries 구조: `[{ stepId, stepName, status, output, durationMs, error? }]`

5. **Stub Executors**: tool/llm 스텝의 실제 실행은 stub으로 구현
   - tool: `{ status: 'success', output: { requestedParams } }` 반환
   - llm: `{ status: 'success', output: { completion: 'LLM result...' } }` 반환
   - 이유: ToolPool(Epic 4), AgentRunner(Epic 3)가 이미 존재하지만, 실행 엔진의 순수 로직을 먼저 검증. 통합은 18-4/18-5 또는 별도 통합 작업에서 수행

### 기존 테스트 파일 호환

**주의**: `packages/server/src/__tests__/unit/engine.test.ts`가 이미 존재함 (Gemini가 작성)
- `DAGSolver.resolveTiers(steps)` -- static 메서드로 구현 필요
- `ExecutionContext` -- `setStepOutput()`, `resolveParams()` 메서드
- `WorkflowEngine(workflow).run()` -- `{ success, results }` 반환
- `import type { Workflow } from '@corthex/shared'` -- shared types의 Workflow 타입 사용

### shared 타입 참고

```typescript
// packages/shared/src/types.ts
export type WorkflowStep = {
  id: string
  type: WorkflowStepType  // 'tool' | 'llm' | 'condition'
  action: string
  params?: Record<string, unknown>
  dependsOn?: string[]
}

export type Workflow = {
  id: string
  companyId: string
  name: string
  description: string | null
  steps: WorkflowStep[]
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}
```

**주의**: shared의 WorkflowStep에는 `name`, `agentId`, `trueBranch`, `falseBranch`, `systemPrompt`, `timeout`, `retryCount` 필드가 없음. engine.ts(18-1)의 확장 인터페이스를 사용하거나, shared 타입을 확장해야 함.

### Project Structure Notes

```
packages/server/src/
├── lib/workflow/           # [NEW] 18-2 실행 엔진
│   ├── dag-solver.ts       # DAGSolver.resolveTiers()
│   ├── execution-context.ts # ExecutionContext 클래스
│   └── engine.ts           # WorkflowEngine 클래스
├── services/workflow/
│   └── engine.ts           # [18-1] CRUD + validateDag (건드리지 않음)
├── routes/workspace/
│   └── workflows.ts        # [MODIFY] 실행/이력 엔드포인트 추가
├── db/schema.ts            # [NO CHANGE] workflowExecutions 테이블 (이미 존재)
└── __tests__/unit/
    ├── engine.test.ts       # [EXISTS] Gemini가 작성한 기존 테스트 (호환 필수)
    ├── workflow-crud.test.ts      # [18-1]
    └── workflow-crud-tea.test.ts  # [18-1]
```

### References

- [Source: packages/server/src/services/workflow/engine.ts] -- 18-1 CRUD + DAG 검증
- [Source: packages/server/src/routes/workspace/workflows.ts] -- 18-1 라우트
- [Source: packages/server/src/db/schema.ts#L1674-1687] -- workflowExecutions 스키마
- [Source: packages/shared/src/types.ts#L1001-1031] -- Workflow/WorkflowStep 타입
- [Source: packages/server/src/__tests__/unit/engine.test.ts] -- 기존 Gemini 테스트 (호환 대상)
- [Source: packages/server/src/services/agent-runner.ts] -- AgentRunner (향후 통합 대상)
- [Source: packages/server/src/lib/tool-executor.ts] -- ToolPool (향후 통합 대상)
- [Source: v1 CORTHEX_HQ/src/core/workflow.py] -- v1 순차 실행 + {prev_result} 패턴
- [Source: v1 CORTHEX_HQ/src/core/agent.py] -- v1 asyncio.gather 병렬 + 지수 백오프 retry

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List

- Task 1 (DAGSolver): Kahn's 알고리즘 기반 병렬 실행 레이어 분류. 순환 참조 시 'Circular dependency detected' throw. 기존 engine.test.ts 호환 확인 완료.
- Task 2 (ExecutionContext): {{stepId.property.nested}} 템플릿 치환. 전체 템플릿일 때 원래 타입 보존 (number, array 등). Strict Templating Error로 참조 검증.
- Task 3 (WorkflowEngine): DAG tier 순회 + Promise.all 병렬 실행. condition 스텝 우선 처리 후 분기 결정. timeout(Promise race), retry(지수 백오프). stub executor 패턴으로 테스트 독립성 확보.
- Task 4 (API): POST /workflows/:id/execute + GET /workflows/:workflowId/executions. WorkflowExecutionService로 DB 기록 분리. 91 tests pass, 0 fail.
- TypeScript 컴파일 이슈 없음 (기존 engine.test.ts의 Workflow 타입 import는 shared에서 가져오지만, WorkflowEngine은 WorkflowLike 타입으로 유연하게 수용)

### File List

- packages/server/src/lib/workflow/dag-solver.ts [NEW]
- packages/server/src/lib/workflow/execution-context.ts [NEW]
- packages/server/src/lib/workflow/engine.ts [NEW]
- packages/server/src/services/workflow/execution.ts [NEW]
- packages/server/src/routes/workspace/workflows.ts [MODIFIED]
- packages/server/src/__tests__/unit/workflow-execution.test.ts [NEW]
