# Story 18-2: Workflow Execution Engine (Sequential/Parallel)

## 1. Story Foundation
**Epic:** Epic 18 (Workflow Automation)
**Story ID:** 18-2
**Title:** Workflow Execution Engine (Sequential & Parallel Processing)
**Status:** ready-for-dev

### User Story
As a CEO or Manager agent, I want the system to actually execute the defined workflows, resolving dependencies between steps so that tasks can run sequentially or in parallel, automatically passing context between steps.

### Acceptance Criteria
- [ ] 워크플로우 실행 요청 시 `workflowExecutions` 레코드 생성 (상태: pending -> running -> completed/failed).
- [ ] 각 스텝별 실행 결과를 저장하고 추적할 수 있는 스키마 구조 혹은 로직 구현.
- [ ] `dependsOn` 필드를 해석하여 순서대로 실행 (DAG 형태)하고, 의존성이 없는 스텝은 동시(병렬) 실행.
- [ ] 실행 도중 에러 발생 시 전체 워크플로우를 중단하거나 에러 핸들링 (에러 상태 기록).
- [ ] 이전 스텝의 출력(Output) 데이터를 다음 스텝의 매개변수나 컨텍스트(Input)로 자동 주입.
- [ ] 실행 진행률(상태)을 실시간 혹은 DB로 조회할 수 있는 엔드포인트 제공.

### Business Context
This is the "brain" of the Workflow Epic. Without the Execution Engine, workflows are just passive data. This component interacts closely with the existing `AgentRunner` and `ToolPool` to actually do the work. DAG implementation allows complex, multi-agent cooperative workflows to run significantly faster.

## 2. Developer Context & Guardrails

### Technical Requirements
- **DAG (Directed Acyclic Graph) Scheduler:** `dependsOn`을 분석해 Topological Sort(위상 정렬)를 수행하여 스텝들의 실행 순서를 결정. 순환 참조(Cycle) 감지 로직 필수.
- **Execution Service:** `WorkflowEngine` 클래스를 생성하여 단일 워크플로우 실행을 캡슐화. `execute(workflowId, context)` 메서드 구현.
- 기존의 `Epic 3` (AgentRunner)와 `Epic 4` (ToolPool)을 내부적으로 호출.
- 장기 실행(Long-running) 작업이 될 가능성이 높으므로, Hono 백그라운드 태스크나 `Promise.all` 기반 비동기 실행 체계 확립.

### Database Schema (Target)
`workflow_executions` DB 테이블:
- `id` (uuid, PK)
- `workflowId` (uuid, FK)
- `companyId` (uuid, FK) -> 테넌트 격리 필수
- `status` (enum: 'pending', 'running', 'completed', 'failed')
- `currentStepId` (varchar)
- `state` (jsonb) -> 실행 중 누적된 변수/결과값들
- `error` (text)
- `startedAt` / `completedAt`

### Architecture Compliance
- 실행 기록은 반드시 `cost_records`와 `tool_invocations` (기존 에픽)에도 연계되어야 함. (AgentRunner 사용 시 자동 연계됨)
- 폴링 봇, 예약 워커 등 비동기 실행을 고려해 `WorkflowEngine`은 독립적 서비스 모듈(`/packages/server/src/services/workflow/engine.ts`)에 구현.

### Testing Requirements
1. 순환 참조 의존성이 있는 워크플로우 실행 시 실행 거부 에러 반환.
2. 병렬 실행 가능한 스텝(A, B가 의존성 없음, C가 A,B 모두 의존)일 때 동시 실행되는지 성능(Timing) 확인.
3. 중간 스텝에서 고의로 에러를 발생시켰을 때 상태가 'failed'로 기록되는지 검증.
