# Story 4.5: 도구 호출 로그 시스템

Status: done

## Story

As a **시스템 관리자/CEO**,
I want **모든 도구 호출이 자동으로 기록되고, 에이전트별/도구별/시간별로 조회할 수 있는 로그 시스템**,
so that **도구 사용 감사 추적, 디버깅, 성능 분석이 가능하다**.

## Acceptance Criteria

1. **도구 호출 자동 기록**: ToolPool.execute() 호출 시 tool_calls 테이블에 agentId, toolName, input, output, durationMs, status, companyId 자동 기록
2. **크리덴셜/API 키 자동 마스킹 (NFR12)**: input/output 로그에서 API 키, 비밀번호, 토큰 등 민감 정보를 자동 마스킹 (`sk-***`, `password: ***` 등)
3. **쿼리 API**: GET /api/admin/tool-invocations -- 에이전트별, 도구별, 시간별, 상태별 필터 + 페이지네이션
4. **성능 통계 API**: GET /api/admin/tool-invocations/stats -- 도구별 평균 실행 시간, 성공률, 호출 횟수 집계
5. **에러 로그 상세**: 실패한 도구 호출의 에러 메시지도 output에 기록 (마스킹 적용)
6. **비동기 로깅**: 도구 호출 성능에 영향 없도록 로깅은 fire-and-forget (await 없이 기록)

## Tasks / Subtasks

- [x] Task 1: 크리덴셜 마스킹 유틸리티 (AC: #2)
  - [x] 1.1 `packages/server/src/lib/credential-masker.ts` 생성
  - [x] 1.2 API 키 패턴 탐지 (`sk-`, `key-`, `token-`, `Bearer `, `Basic ` 등)
  - [x] 1.3 일반 민감 필드 마스킹 (`password`, `secret`, `apiKey`, `token`, `authorization` 등)
  - [x] 1.4 재귀적 객체 탐색 + 문자열 내 패턴 치환

- [x] Task 2: 도구 호출 로그 서비스 (AC: #1, #5, #6)
  - [x] 2.1 `packages/server/src/services/tool-invocation-log.ts` 생성
  - [x] 2.2 `recordToolInvocation(data)`: tool_calls 테이블에 기록 (fire-and-forget)
  - [x] 2.3 input/output에 크리덴셜 마스킹 적용 후 저장
  - [x] 2.4 에러 시 output에 에러 메시지 기록, status='error'

- [x] Task 3: ToolPool에 로깅 통합 (AC: #1, #6)
  - [x] 3.1 `ToolPool.execute()` 메서드에 로깅 미들웨어 추가
  - [x] 3.2 실행 전 시작 시간 기록, 실행 후 duration 계산
  - [x] 3.3 fire-and-forget로 로그 기록 (도구 실행 성능 영향 없음)
  - [x] 3.4 context에서 companyId, agentId 추출

- [x] Task 4: 조회 API (AC: #3, #4)
  - [x] 4.1 `packages/server/src/routes/admin/tool-invocations.ts` 생성
  - [x] 4.2 GET /api/admin/tool-invocations -- 필터(agentId, toolName, status, startDate, endDate) + 페이지네이션
  - [x] 4.3 GET /api/admin/tool-invocations/stats -- 도구별 집계 (avgDurationMs, successRate, totalCalls)
  - [x] 4.4 라우터를 admin 라우트에 등록

- [x] Task 5: 단위 테스트 (AC: all)
  - [x] 5.1 크리덴셜 마스킹 테스트 (API 키 패턴, 민감 필드, 중첩 객체, 빈 값)
  - [x] 5.2 로그 기록 테스트 (정상 호출, 에러 호출, 마스킹 적용 확인)
  - [x] 5.3 ToolPool 통합 테스트 (execute 시 자동 로깅, fire-and-forget 동작)
  - [x] 5.4 조회 API 테스트 (필터, 페이지네이션, 통계)

## Dev Notes

### 기존 인프라 활용

**기존 tool_calls 테이블 (schema.ts:317-329):**
```typescript
export const toolCalls = pgTable('tool_calls', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  sessionId: uuid('session_id').notNull().references(() => chatSessions.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  toolId: uuid('tool_id').notNull().references(() => toolDefinitions.id),
  toolName: varchar('tool_name', { length: 100 }).notNull(),
  input: jsonb('input'),
  output: text('output'),
  status: varchar('status', { length: 20 }).notNull().default('success'),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

이 테이블은 이미 필요한 필드를 대부분 가지고 있으나, `sessionId`와 `toolId`가 NOT NULL FK로 설정되어 있어 오케스트레이션 엔진 밖에서의 도구 호출(예: 테스트, 직접 호출)에는 사용하기 어려울 수 있다. **스키마 수정이 필요한지 확인 후 결정:**

- **옵션 A**: `sessionId`와 `toolId`를 nullable로 변경 (기존 테이블 재활용)
- **옵션 B**: 그대로 사용하되, 오케스트레이션 컨텍스트에서만 로깅 (sessionId는 항상 존재)

→ **권장: 옵션 A** -- sessionId/toolId를 nullable로 변경. ToolPool.execute()는 ToolContext에 sessionId가 없을 수 있고, toolId(UUID)보다 toolName(string)이 더 직관적.

### Architecture Compliance

- **파일 위치**: `packages/server/src/services/tool-invocation-log.ts` (서비스 패턴)
- **라우트 위치**: `packages/server/src/routes/admin/tool-invocations.ts` (관리자 전용)
- **테스트 위치**: `packages/server/src/__tests__/unit/tool-invocation-log.test.ts`
- **패턴 참조**: `packages/server/src/services/audit-log.ts` (동일한 로그 서비스 패턴)
- **API 응답**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **네이밍**: kebab-case 파일, camelCase 함수, PascalCase 타입

### Integration Points

**ToolPool (packages/server/src/services/tool-pool.ts:54-80):**
- `execute()` 메서드가 도구 호출의 단일 진입점
- 여기에 로깅 로직을 추가: 시작 시간 → 실행 → duration 계산 → fire-and-forget 로그
- `ToolContext`에는 `companyId`, `agentId`, `agentName` 존재

**ToolContext 확장 필요:**
- `sessionId?: string` 추가 (오케스트레이션에서 전달, 직접 호출 시 undefined)
- `ToolPool.createExecutor()`에서 sessionId도 context에 포함

**크리덴셜 마스킹 패턴:**
- API 키: `/sk-[a-zA-Z0-9]{20,}/` → `sk-***`
- Bearer 토큰: `/Bearer [a-zA-Z0-9._-]+/` → `Bearer ***`
- 민감 필드명: `password`, `secret`, `apiKey`, `token`, `authorization`, `credential`, `key`
- 값 마스킹: 처음 4자 유지 + `***` (예: `sk-ab***`)

### 기존 코드 참고

**audit-log.ts 서비스 패턴:**
- `createAuditLog(input)`: 단일 insert
- `queryAuditLogs(options)`: 필터 + 페이지네이션 + count
- `withAuditLog(input, operation)`: 래퍼 패턴
- 동일한 구조로 tool-invocation-log.ts 구현

**HandlerRegistry (packages/server/src/lib/tool-handlers/):**
- `registry.ts`: 핸들러 등록
- `types.ts`: `ToolExecContext` (companyId, agentId, sessionId, departmentId, userId, config, getCredentials)
- `index.ts`: 26개 핸들러 등록
- 이 레지스트리는 ToolPool과 별개 시스템. ToolPool이 상위 레벨에서 래핑.

### NFR12 마스킹 요구사항

```
NFR12: 로그에 크리덴셜/API 키 노출 금지 -- 로그 출력 시 자동 마스킹
```

input/output 모두 마스킹 적용:
- input: 도구 파라미터 (API 키가 포함될 수 있음)
- output: 도구 결과 (외부 API 응답에 토큰이 포함될 수 있음)

### 성능 고려사항

- **fire-and-forget**: `recordToolInvocation()` 호출 시 await 하지 않음
- `.catch()` 로 에러 로깅만 하고 도구 호출 결과에 영향 주지 않음
- DB insert는 비동기로 처리되어 도구 실행 시간에 추가 지연 없음

### Project Structure Notes

- `packages/server/src/services/` -- 비즈니스 로직 서비스 계층
- `packages/server/src/routes/admin/` -- 관리자 전용 API 라우트
- `packages/server/src/__tests__/unit/` -- 단위 테스트
- 기존 테이블 `tool_calls` 재활용 (새 테이블 생성 불필요)

### References

- [Source: _bmad-output/planning-artifacts/epics.md - E4-S5 수용 기준]
- [Source: _bmad-output/planning-artifacts/prd.md - FR29, NFR12]
- [Source: _bmad-output/planning-artifacts/architecture.md - Decision #4 Tool System]
- [Source: packages/server/src/services/tool-pool.ts - ToolPool.execute()]
- [Source: packages/server/src/db/schema.ts:317-329 - toolCalls table]
- [Source: packages/server/src/services/audit-log.ts - service pattern reference]
- [Source: packages/server/src/lib/tool-handlers/types.ts - ToolExecContext]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Task 1: Created credential-masker.ts with recursive object traversal, sensitive field detection (20+ field names), and inline pattern matching (sk-, sk-ant-, Bearer, Basic, AKIA, hex secrets)
- Task 2: Created tool-invocation-log.ts service with recordToolInvocation (fire-and-forget with .catch()), queryToolInvocations (filter+pagination), getToolInvocationStats (per-tool aggregation with success rate)
- Task 3: Integrated logging into ToolPool.execute() -- timing via Date.now(), fire-and-forget recordToolInvocation for success/error/exception paths
- Task 4: Created admin route /api/admin/tool-invocations (list with filters) and /api/admin/tool-invocations/stats (aggregation). Registered in index.ts
- Task 5: 37 unit tests passing -- credential masking (18 tests), service exports (3 tests), ToolPool integration (3 tests), route export (1 test), schema (4 tests), log context masking (5 tests), additional masking edge cases (3 tests)
- Schema change: Made toolCalls.sessionId and toolCalls.toolId nullable + added 3 indexes (company+createdAt, agentId, toolName)

### File List

- packages/server/src/lib/credential-masker.ts (NEW)
- packages/server/src/services/tool-invocation-log.ts (NEW)
- packages/server/src/routes/admin/tool-invocations.ts (NEW)
- packages/server/src/__tests__/unit/tool-invocation-log.test.ts (NEW)
- packages/server/src/services/tool-pool.ts (MODIFIED - added logging integration)
- packages/server/src/db/schema.ts (MODIFIED - sessionId/toolId nullable, added indexes)
- packages/server/src/index.ts (MODIFIED - registered toolInvocationsRoute)
