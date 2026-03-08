# Story 18.1: 워크플로우 CRUD API + 다단계 스텝 정의

Status: done

## Story

As a CEO/Admin,
I want to create, read, update, and delete automation workflows with multi-step definitions (sequential/parallel steps with agent assignment, tool assignment, and conditional branching),
so that I can automate repetitive multi-step AI tasks as reusable pipelines.

## Acceptance Criteria

1. **워크플로우 생성 API**: POST /api/workflows -- name, description, steps[], triggerConfig 포함
2. **워크플로우 목록 조회**: GET /api/workflows -- companyId 격리, isActive=true만 기본 반환, 페이지네이션
3. **워크플로우 단건 조회**: GET /api/workflows/:id -- 스텝 상세 + 최근 실행 이력 포함
4. **워크플로우 수정 API**: PUT /api/workflows/:id -- 스텝 추가/삭제/순서 변경, 비활성 워크플로우 수정 차단
5. **워크플로우 삭제 API**: DELETE /api/workflows/:id -- soft delete (isActive=false)
6. **다단계 스텝 정의**: 순차(dependsOn 체인), 병렬(같은 레이어 독립 스텝), 조건부 분기(condition 타입)
7. **스텝별 에이전트 할당**: 각 스텝에 agentId 지정 가능 (optional, 미지정 시 비서실장 라우팅)
8. **스텝별 도구 할당**: tool 타입 스텝에 action=도구명 + params 지정
9. **DAG 유효성 검증**: 순환 의존성 탐지, 존재하지 않는 stepId 참조 차단
10. **테넌트 격리**: companyId 기반 WHERE 자동 주입 (기존 미들웨어 활용)
11. **RBAC**: CEO/Admin만 CUD 가능, 일반 직원은 조회만
12. **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }`

## Tasks / Subtasks

- [x] Task 1: 워크플로우 서비스 레이어 (AC: 1,2,3,4,5,9)
  - [x] 1.1 WorkflowService 클래스 -- create, list, getById, update, softDelete
  - [x] 1.2 DAG 유효성 검증 함수 (순환 탐지 + stepId 참조 검증)
  - [x] 1.3 스텝 정규화 함수 (id 자동 생성, dependsOn 빈 배열 처리)
- [x] Task 2: 라우트 레이어 (AC: 1,2,3,4,5,10,11,12)
  - [x] 2.1 Zod 스키마 정의 (CreateWorkflowSchema, UpdateWorkflowSchema, StepSchema)
  - [x] 2.2 5개 CRUD 엔드포인트 구현
  - [x] 2.3 RBAC 미들웨어 적용 (CEO/Admin 체크)
- [x] Task 3: 스텝 타입 시스템 (AC: 6,7,8)
  - [x] 3.1 tool 타입: action=도구명, params={}, agentId (optional)
  - [x] 3.2 llm 타입: action=프롬프트, systemPrompt, agentId (optional)
  - [x] 3.3 condition 타입: expression (이전 스텝 결과 기반), trueBranch, falseBranch
- [x] Task 4: 단위 테스트 (AC: 전체)
  - [x] 4.1 서비스 레이어 테스트 (CRUD + DAG 검증)
  - [x] 4.2 Zod 스키마 검증 테스트
  - [x] 4.3 엣지케이스 테스트 (순환 참조, 20스텝 초과, 권한 없는 접근 등)

## Dev Notes

### 기존 코드 분석 (Gemini 작성 -- 덮어쓰기 대상)

기존 파일들이 존재하지만 품질이 낮아 처음부터 재작성해야 함:

1. **DB 스키마** (`packages/server/src/db/schema.ts` 1650~1712행):
   - `workflows` 테이블: id, companyId, name, description, steps(JSONB), isActive, createdBy, createdAt, updatedAt
   - `workflowExecutions` 테이블: id, companyId, workflowId, status, totalDurationMs, stepSummaries, triggeredBy, createdAt
   - `workflowSuggestions` 테이블: id, companyId, userId, reason, suggestedSteps, status, createdAt, updatedAt
   - **DB 스키마는 유지** -- 이미 마이그레이션 적용됨. 코드만 재작성

2. **기존 엔진** (`packages/server/src/services/workflow/engine.ts` 213행):
   - DAG 실행 + topologicalSort 있으나 LLM/condition 미구현
   - **이 파일을 재작성**: 서비스 + 엔진 분리

3. **기존 라우트** (`packages/server/src/routes/workspace/workflows.ts` 197행):
   - 기본 CRUD 있으나 DAG 검증 없음, 에러 핸들링 불완전
   - **이 파일을 재작성**: Zod 스키마 강화 + RBAC

4. **기존 테스트** (`packages/server/src/__tests__/unit/workflow-edit-exec*.test.ts`):
   - 3개 파일 존재 -- **전부 삭제 후 재작성**

### v1 참조 (핵심 패턴)

v1 소스: `/home/ubuntu/CORTHEX_HQ/src/core/workflow.py`

v1 워크플로우 패턴:
- `WorkflowStep(name, command)` + `WorkflowDefinition(id, name, description, steps[])`
- 순차 실행: 각 스텝 결과를 `{prev_result}` 플레이스홀더로 다음 스텝에 주입
- WebSocket `workflow_progress` 브로드캐스트
- 실행 결과: `{workflow_id, name, success, steps_completed, results[]}`

v2에서 확장할 점:
- v1은 순차만 지원 → v2는 DAG (병렬 + 조건부 분기) 추가
- v1은 `{prev_result}` 단순 치환 → v2는 `{{stepId.fieldName}}` mustache 문법
- v1은 CRUD 없음 (하드코딩) → v2는 DB CRUD + 스키마 검증

### 기존 서비스 패턴 참조

**크론 서비스** (`packages/server/src/services/cron-execution-engine.ts`):
- 폴링 기반, graceful shutdown, WebSocket 이벤트 발행
- `cronRuns` 테이블에 실행 기록 -- 워크플로우도 `workflowExecutions`에 동일 패턴

**오케스트레이터** (`packages/server/src/lib/orchestrator.ts`):
- 비서실장 패턴: 분류 → 위임 → 병렬 실행 → 종합
- `Promise.allSettled()` 병렬 실행 -- 워크플로우 병렬 스텝도 동일 패턴
- 위임 테이블 기록 -- 워크플로우도 실행 기록 동일 패턴

### Project Structure Notes

**수정 대상 파일:**
- `packages/server/src/services/workflow/engine.ts` -- 재작성 (서비스 레이어)
- `packages/server/src/routes/workspace/workflows.ts` -- 재작성 (라우트)
- `packages/server/src/__tests__/unit/workflow-edit-exec.test.ts` -- 재작성
- `packages/server/src/__tests__/unit/workflow-edit-exec-tea.test.ts` -- 삭제
- `packages/server/src/__tests__/unit/workflow-edit-exec-qa.test.ts` -- 삭제

**참조 파일 (수정하지 않음):**
- `packages/server/src/db/schema.ts` -- workflows/workflowExecutions/workflowSuggestions 테이블
- `packages/server/src/lib/orchestrator.ts` -- 병렬 실행 패턴 참조
- `packages/server/src/services/cron-execution-engine.ts` -- 실행 엔진 패턴 참조
- `packages/server/src/index.ts` -- 라우트 등록 확인

**Zod StepSchema (확장판):**
```typescript
const StepSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.enum(['tool', 'llm', 'condition']),
  action: z.string().min(1), // tool name, LLM prompt, or condition expression
  params: z.record(z.any()).optional(),
  agentId: z.string().uuid().optional(), // 스텝별 에이전트 할당
  dependsOn: z.array(z.string().uuid()).optional(), // DAG 의존성
  // condition 타입 전용
  trueBranch: z.string().uuid().optional(), // 조건 참일 때 다음 스텝
  falseBranch: z.string().uuid().optional(), // 조건 거짓일 때 다음 스텝
  // LLM 타입 전용
  systemPrompt: z.string().optional(),
  // 공통
  timeout: z.number().int().min(1000).max(300000).optional(), // ms, 기본 30초
  retryCount: z.number().int().min(0).max(3).optional(), // 기본 0
});

const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  steps: z.array(StepSchema).min(1).max(20),
  triggerConfig: z.object({
    type: z.enum(['manual', 'cron', 'event']).default('manual'),
    cronExpression: z.string().optional(), // cron 타입일 때만
    eventName: z.string().optional(), // event 타입일 때만
  }).optional(),
});
```

**DAG 유효성 검증 알고리즘:**
```
1. 모든 stepId 수집 → Set
2. 각 스텝의 dependsOn 내 stepId가 Set에 존재하는지 확인
3. Kahn's algorithm으로 topological sort 수행
4. 정렬 결과 길이 ≠ 스텝 수 → 순환 의존성 에러
5. condition 타입의 trueBranch/falseBranch가 유효한 stepId인지 확인
```

**API 응답 예시:**
```json
// POST /api/workflows
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "일일 시장 분석",
    "description": "매일 아침 시장 데이터 수집 → 분석 → 보고서 생성",
    "steps": [...],
    "isActive": true,
    "createdBy": "userId",
    "createdAt": "2026-03-08T..."
  }
}
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 18] E18-S1 정의
- [Source: _bmad-output/planning-artifacts/prd.md#FR74] 워크플로우 파이프라인 요구사항
- [Source: _bmad-output/planning-artifacts/architecture.md] Hono+Drizzle+Bun 스택
- [Source: /home/ubuntu/CORTHEX_HQ/src/core/workflow.py] v1 워크플로우 엔진
- [Source: packages/server/src/db/schema.ts#L1650-1712] 기존 DB 스키마
- [Source: packages/server/src/services/workflow/engine.ts] 기존 엔진 (재작성 대상)
- [Source: packages/server/src/routes/workspace/workflows.ts] 기존 라우트 (재작성 대상)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- WorkflowService: 5개 메서드 (create, list, getById, update, softDelete) 구현
- validateDag: Kahn's algorithm 기반 순환 참조 탐지, stepId 참조 검증, condition 분기 검증
- 3가지 스텝 타입 (tool, llm, condition) Zod 스키마 + 타입 정의
- 스텝별 agentId/timeout/retryCount 옵션 지원
- 라우트 5개: POST/GET(list)/GET(single)/PUT/DELETE with RBAC + Zod validation
- 단건 조회 시 최근 실행 이력 5건 포함 (workflowExecutions 조인)
- 목록 조회 시 페이지네이션 (page/limit query params)
- DAG 유효성 검증 시 구체적 한국어 에러 메시지 반환
- 38개 단위 테스트 작성, 0 fail
- 기존 Gemini 테스트 3개 삭제, 새 테스트 1개로 교체
- DB 스키마 변경 없음 (기존 마이그레이션 유지)

### Debug Log References

- TypeScript compilation: clean (0 errors)
- Test results: 38 pass, 0 fail (workflow-crud.test.ts)
- Regression: 160+ existing tests pass (batch verified)

### File List

- packages/server/src/services/workflow/engine.ts (재작성 -- WorkflowService + validateDag)
- packages/server/src/routes/workspace/workflows.ts (재작성 -- 5개 CRUD 엔드포인트)
- packages/server/src/__tests__/unit/workflow-crud.test.ts (신규 -- 38개 테스트)
- packages/server/src/__tests__/unit/workflow-edit-exec.test.ts (삭제)
- packages/server/src/__tests__/unit/workflow-edit-exec-tea.test.ts (삭제)
- packages/server/src/__tests__/unit/workflow-edit-exec-qa.test.ts (삭제)
