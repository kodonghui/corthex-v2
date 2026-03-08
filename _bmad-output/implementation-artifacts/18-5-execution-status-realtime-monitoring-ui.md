# Story 18.5: 실행 상태 실시간 모니터링 UI

Status: done

## Story

As an Admin user,
I want to see real-time execution status and history of workflows,
so that I can monitor running workflows and review past execution results.

## Acceptance Criteria

1. **실행 트리거**: 워크플로우 목록에서 "실행" 버튼으로 워크플로우 실행 가능
2. **실행 이력 조회**: 워크플로우 상세에서 과거 실행 이력 조회 (날짜, 상태, 소요시간)
3. **스텝별 결과 표시**: 실행 결과에서 각 스텝의 상태 (success/failed), 소요시간, 에러 표시
4. **실행 상태 표시**: 실행 중인 워크플로우의 진행 상태 시각적 표시
5. **자동 새로고침**: 실행 중 상태 자동 폴링 (실행 후 완료까지)

## Tasks / Subtasks

- [x] Task 1: 워크플로우 실행 버튼 + 실행 이력 조회 (AC: #1, #2)
  - [x] WorkflowsPage에 "실행" 버튼 추가
  - [x] POST /workspace/workflows/:id/execute 호출 (executeMut)
  - [x] 워크플로우 카드에 "이력" 버튼 추가 → ExecutionHistory 패널
  - [x] GET /workspace/workflows/:workflowId/executions 호출하여 이력 렌더링

- [x] Task 2: 스텝별 실행 결과 표시 (AC: #3)
  - [x] ExecutionDetail 컴포넌트: stepSummaries 배열 → 스텝별 카드
  - [x] 각 스텝: 이름, 상태(completed/failed 색상), durationMs, error 메시지
  - [x] 전체 요약: status, totalDurationMs, 실행 시각
  - [x] 스텝 출력(output) 표시 (string or JSON)

- [x] Task 3: 실행 상태 시각적 표시 (AC: #4, #5)
  - [x] 실행 버튼 클릭 시 "실행 중..." disabled 상태 표시
  - [x] 완료 시 토스트 알림 (성공/실패 + 소요시간)
  - [x] 완료 후 이력 자동 새로고침 (queryClient.invalidateQueries)
  - [x] 실행 이력에서 스텝별 미니 상태바 (색상 바)

## Dev Notes

### 아키텍처 결정

1. **앱 위치**: Admin 앱 (`packages/admin/`) — 기존 워크플로우 페이지에 추가
2. **API 경로**: 기존 서버 엔드포인트 활용 (서버 수정 불필요)
3. **실시간 방식**: WebSocket 대신 간단한 폴링 (react-query refetchInterval) — 워크플로우 실행은 짧은 작업
4. **UI 패턴**: 기존 workflows.tsx에 실행/이력 기능 추가

### 기존 API 엔드포인트 (서버 수정 불필요)

```
POST   /api/workspace/workflows/:id/execute              -- 워크플로우 실행
GET    /api/workspace/workflows/:workflowId/executions   -- 실행 이력 조회
```

### API 응답 구조

**POST /workflows/:id/execute 응답:**
```typescript
{
  success: true,
  data: {
    executionId: string,       // UUID
    status: 'success' | 'failed',
    totalDurationMs: number,
    stepSummaries: Array<{
      stepId: string,
      stepName: string,
      status: string,          // 'completed' | 'failed' | 'skipped'
      output: any | null,
      durationMs: number,
      error: string | null,
    }>
  }
}
```

**GET /workflows/:workflowId/executions 응답:**
```typescript
{
  success: true,
  data: Array<{
    id: string,
    companyId: string,
    workflowId: string,
    status: 'success' | 'failed',
    totalDurationMs: number,
    stepSummaries: Array<StepSummary>,
    triggeredBy: string | null,
    createdAt: string,
  }>,
  meta: { page: number, total: number }
}
```

### DB 스키마 (참고)

```sql
workflow_executions: id, company_id, workflow_id, status, total_duration_ms, step_summaries(jsonb), triggered_by, created_at
```

### Admin 앱 패턴 참조

- **API 호출**: `api.get<T>(path)`, `api.post<T>(path, body)`
- **상태관리**: `useAdminStore` (selectedCompanyId), `useToastStore` (addToast({ type, message }))
- **데이터 페칭**: `@tanstack/react-query` (useQuery, useMutation)
- **스타일**: Tailwind CSS, dark mode 지원 (`dark:` prefix)

### 기존 코드 수정 포인트

```
packages/admin/src/pages/workflows.tsx  # [MODIFY] 실행 버튼, 이력 패널, 실행 상태 표시 추가
```

### References

- [Source: packages/server/src/routes/workspace/workflows.ts] -- POST execute, GET executions
- [Source: packages/server/src/services/workflow/execution.ts] -- WorkflowExecutionService
- [Source: packages/server/src/db/schema.ts:1674-1692] -- workflowExecutions 테이블
- [Source: packages/admin/src/pages/workflows.tsx] -- 기존 워크플로우 빌더 UI
- [Source: packages/admin/src/stores/toast-store.ts] -- addToast({ type, message }) 패턴

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- All 3 tasks implemented by extending existing workflows.tsx
- ExecutionHistory component: list of past executions with status badges + step mini-bar
- ExecutionDetail component: per-step result cards with status, duration, error, output
- Execute button on workflow list cards + execution history panel
- TypeScript compilation passes clean
- No server changes needed (existing APIs used)

### File List
- `packages/admin/src/pages/workflows.tsx` -- [MODIFIED] Added execution types, execute mutation, ExecutionHistory, ExecutionDetail components
