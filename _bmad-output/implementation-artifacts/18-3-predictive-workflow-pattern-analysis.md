# Story 18.3: 예측 워크플로우 패턴 분석

Status: done

## Story

As an intelligent AI assistant,
I want to analyze users' historical tool usage and repetitive task patterns,
so that I can proactively suggest automated workflows they can adopt with one click.

## Acceptance Criteria

1. **PatternAnalyzer 모듈**: tool_calls 테이블에서 반복 패턴(동일 도구 시퀀스가 N회 이상 반복)을 감지하는 서비스 구현
2. **패턴 → 워크플로우 변환**: 감지된 패턴을 WorkflowStep[] 형태의 suggestedSteps로 변환하여 workflow_suggestions 테이블에 저장
3. **추천 API**: GET /api/workspace/workflows/suggestions -- 사용자별 pending 제안 목록 조회 (companyId + userId 격리)
4. **수락/거절 API**: POST /api/workspace/workflows/suggestions/:id/accept (→ workflows 테이블에 실제 워크플로우 생성) / POST .../reject
5. **테넌트 격리**: 모든 쿼리에 companyId WHERE 절 강제
6. **분석 트리거**: `PatternAnalyzer.analyze(companyId, userId)` 메서드로 온디맨드 실행 가능 (크론 연동은 기존 Epic 14 인프라 활용)

## Tasks / Subtasks

- [x] Task 1: PatternAnalyzer 서비스 구현 (AC: #1, #2)
  - [x] tool_calls에서 최근 N일간 도구 호출 시퀀스 조회
  - [x] 시간순 정렬 후 연속 도구 시퀀스 패턴 탐지 (빈도 기반 heuristic)
  - [x] 감지된 패턴 → WorkflowStep[] 변환
  - [x] workflow_suggestions 테이블에 저장

- [x] Task 2: WorkflowSuggestionService CRUD (AC: #3, #4, #5)
  - [x] list(companyId, userId) -- pending 제안 목록 (페이지네이션)
  - [x] accept(id, companyId, userId) -- 제안 수락 → workflows 테이블에 생성
  - [x] reject(id, companyId, userId) -- 제안 거절 (status='rejected')

- [x] Task 3: API 엔드포인트 추가 (AC: #3, #4)
  - [x] GET /workflows/suggestions -- 제안 목록
  - [x] POST /workflows/suggestions/:id/accept -- 수락
  - [x] POST /workflows/suggestions/:id/reject -- 거절

## Dev Notes

### 아키텍처 결정

1. **DB 스키마**: workflow_suggestions 테이블은 이미 마이그레이션 완료 (schema.ts L1694-1711). 수정 불필요.
   ```
   workflow_suggestions: id, companyId, userId, reason, suggestedSteps(JSONB), status, createdAt, updatedAt
   인덱스: company_user_idx, status_idx
   ```

2. **패턴 탐지 알고리즘**: 빈도 기반 Heuristic (LLM 호출 없이)
   - tool_calls에서 최근 30일 데이터를 시간순 조회
   - 연속 도구 호출을 세션 단위로 그룹핑 (30분 이내 연속 = 같은 세션)
   - 동일 도구 시퀀스가 3회 이상 반복되면 패턴으로 판정
   - 이미 제안한 패턴은 중복 생성하지 않음

3. **수락 플로우**: accept 시 WorkflowService.create() 호출하여 실제 워크플로우 생성

4. **소스 데이터**:
   - `tool_calls` 테이블: toolName, input, companyId, createdAt (schema.ts L347-363)
   - companyId + createdAt 복합 인덱스 존재 → 조회 성능 OK

### Project Structure Notes

```
packages/server/src/
├── services/workflow/
│   ├── engine.ts          # [18-1] CRUD + validateDag (건드리지 않음)
│   ├── execution.ts       # [18-2] 실행 서비스 (건드리지 않음)
│   ├── pattern-analyzer.ts # [NEW] 패턴 분석기
│   └── suggestion.ts      # [NEW] 제안 CRUD 서비스
├── routes/workspace/
│   └── workflows.ts       # [MODIFY] 제안 엔드포인트 추가
└── __tests__/unit/
    └── workflow-pattern.test.ts # [NEW] 패턴 분석 + 제안 테스트
```

### References

- [Source: packages/server/src/db/schema.ts#L1694-1711] -- workflowSuggestions 스키마
- [Source: packages/server/src/db/schema.ts#L347-363] -- toolCalls 스키마
- [Source: packages/server/src/services/workflow/engine.ts] -- WorkflowService.create() 활용
- [Source: packages/server/src/routes/workspace/workflows.ts] -- 기존 라우트에 엔드포인트 추가

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List

- Task 1 (PatternAnalyzer): 빈도 기반 heuristic 패턴 탐지. 세션 그룹핑(30분 갭) + 서브시퀀스 빈도 카운트. 서브시퀀스 중복 제거(2-pass: 수집 → 필터). workflow_suggestions 테이블에 자동 저장.
- Task 2 (WorkflowSuggestionService): list/accept/reject CRUD. accept 시 WorkflowService.create() 호출하여 실제 워크플로우 생성. pending 상태만 조회, 이미 처리된 제안은 400 에러.
- Task 3 (API): GET /workflows/suggestions, POST .../accept, POST .../reject, POST /workflows/analyze. 테넌트 격리 (companyId + userId). 17 unit tests pass, 0 fail. TypeScript 컴파일 이슈 없음.

### File List

- packages/server/src/services/workflow/pattern-analyzer.ts [NEW]
- packages/server/src/services/workflow/suggestion.ts [NEW]
- packages/server/src/routes/workspace/workflows.ts [MODIFIED]
- packages/server/src/__tests__/unit/workflow-pattern.test.ts [NEW]
- packages/server/src/__tests__/unit/workflow-pattern-tea.test.ts [NEW]
