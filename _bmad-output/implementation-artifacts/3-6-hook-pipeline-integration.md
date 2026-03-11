# Story 3.6: Hook 파이프라인 통합 테스트

Status: review

## Story

As a 보안 검증자,
I want Hook 실행 순서가 보장되고 에러 시 파이프라인이 중단되는 것을,
so that 보안 파이프라인의 무결성이 검증된다.

## Acceptance Criteria

1. `packages/server/src/__tests__/integration/hook-pipeline.test.ts` 생성
2. 순서 검증: PreToolUse(permission) → PostToolUse(scrubber→redactor→delegation) → Stop(cost) (D4)
3. permission deny 시 PostToolUse 실행 안 됨 확인
4. scrubber가 delegation-tracker보다 먼저 실행 → delegation은 scrubbed 데이터만 받음
5. 전체 파이프라인 happy path: 허용 → 스크럽 → PII 제거 → delegation emit → 비용 기록

## Tasks / Subtasks

- [x] Task 1: `runHookPipeline` 테스트 헬퍼 작성 (AC: #2)
  - [x] 1.1 D4 순서대로 5개 Hook 호출하는 헬퍼 함수 작성
  - [x] 1.2 PreToolUse → PostToolUse chain → Stop 분리 실행
  - [x] 1.3 Mock 설정: getDB (tool-permission-guard, cost-tracker), eventBus (delegation-tracker)

- [x] Task 2: Full pipeline happy path 테스트 (AC: #5)
  - [x] 2.1 permission allow → scrubber 실행 → redactor 실행 → delegation emit → cost 기록 순서 검증
  - [x] 2.2 출력 데이터가 각 단계를 거치며 순차 변환됨 확인

- [x] Task 3: Permission deny stops pipeline 테스트 (AC: #3)
  - [x] 3.1 toolPermissionGuard returns {allow:false} 시 PostToolUse hooks NOT called
  - [x] 3.2 costTracker도 호출되지 않음 확인

- [x] Task 4: Scrubber runs before delegation 테스트 (AC: #4)
  - [x] 4.1 출력에 API 키 포함 → scrubber가 제거 → delegation event에 키 미포함 확인

- [x] Task 5: Pipeline order verification 테스트 (AC: #2)
  - [x] 5.1 spy/mock으로 5개 Hook 호출 순서 기록
  - [x] 5.2 순서: permission → scrubber → redactor → delegation → cost 확인

- [x] Task 6: 빌드 검증
  - [x] 6.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [x] 6.2 `bun test` on test file — all pass

## Dev Notes

### Hook Pipeline Order (D4)

```
1. PreToolUse:   toolPermissionGuard(ctx, toolName, toolInput) → Promise<PreToolHookResult>
2. PostToolUse:  credentialScrubber(ctx, toolName, toolOutput) → string
3. PostToolUse:  outputRedactor(ctx, toolName, toolOutput) → string
4. PostToolUse:  delegationTracker(ctx, toolName, toolOutput, toolInput?) → string
5. Stop:         costTracker(ctx, usage: UsageInfo) → Promise<void>
```

### File Locations

- `packages/server/src/engine/hooks/tool-permission-guard.ts` — PreToolUse hook (async, uses getDB for agentById)
- `packages/server/src/engine/hooks/credential-scrubber.ts` — PostToolUse #1 (pure fn, regex + @zapier/secret-scrubber)
- `packages/server/src/engine/hooks/output-redactor.ts` — PostToolUse #2 (pure fn, Korean PII regex)
- `packages/server/src/engine/hooks/delegation-tracker.ts` — PostToolUse #3 (emits to eventBus, only on `call_agent`)
- `packages/server/src/engine/hooks/cost-tracker.ts` — Stop hook (async, uses getDB for insertCostRecord)

### Mocking Strategy (E9)

- **Mock** `../../db/scoped-query` — `getDB` returns `{ agentById, insertCostRecord }`:
  - `agentById(id)` → returns `[{ allowedTools: [...] }]` (for tool-permission-guard)
  - `insertCostRecord(record)` → resolves (for cost-tracker)
- **Mock** `../../lib/event-bus` — `eventBus.emit` spy (for delegation-tracker)
- **Real** credential-scrubber — pure function, uses regex + @zapier/secret-scrubber
- **Real** output-redactor — pure function, uses Korean PII regex patterns
- **Create** `runHookPipeline` helper that calls hooks in D4 order

### Key Implementation Details

#### tool-permission-guard.ts
- `call_agent` always returns `{ allow: true }` (bypass)
- Empty `allowedTools` array means all tools allowed
- Returns `{ allow: false, reason: ERROR_CODES.TOOL_PERMISSION_DENIED }` on deny

#### credential-scrubber.ts
- Patterns: `sk-ant-*` (Anthropic), `PS*` (Stripe-like), Telegram bot tokens
- Also uses `@zapier/secret-scrubber` for JSON deep scan
- Returns `***REDACTED***` replacements

#### output-redactor.ts
- Patterns: email, Korean phone (010-XXXX-XXXX), 주민번호 (XXXXXX-XXXXXXX), 사업자등록번호
- Returns `[REDACTED]` replacements

#### delegation-tracker.ts
- Only triggers on `toolName === 'call_agent'`
- Emits `eventBus.emit('delegation', { type: 'handoff', from, to, depth, timestamp, sessionId, companyId })`
- Returns toolOutput unchanged

#### cost-tracker.ts
- MODEL_PRICES: sonnet $3/$15, haiku $0.80/$4, opus $15/$75 per 1M tokens
- Calculates `costUsdMicro` (integer, 1 = $0.000001)
- Calls `getDB(companyId).insertCostRecord({...})`

### Key Types

```typescript
// packages/server/src/engine/types.ts
interface SessionContext {
  readonly cliToken: string
  readonly userId: string
  readonly companyId: string
  readonly depth: number
  readonly sessionId: string
  readonly startedAt: number
  readonly maxDepth: number
  readonly visitedAgents: readonly string[]
}

interface PreToolHookResult {
  allow: boolean
  reason?: string
}

// packages/server/src/engine/hooks/cost-tracker.ts
interface UsageInfo {
  inputTokens: number
  outputTokens: number
  model: string
}
```

### Test Data

- API key for scrubber test: `sk-ant-FAKE1234567890ABCDEF1234`
- Email for redactor test: `test@example.com`
- Phone for redactor test: `010-1234-5678`
- `call_agent` tool for delegation test (only emits on `call_agent`)

### Previous Story Patterns (from 3.1~3.5)

- Use `mock.module()` for dependency mocking (bun:test)
- `makeCtx()` helper for SessionContext creation
- `beforeEach(() => { mockFn.mockClear() })` pattern
- Dynamic import after mock: `const { fn } = await import('...')`

### Project Structure Notes

- Integration tests: `packages/server/src/__tests__/integration/` (directory exists)
- Unit tests reference: `packages/server/src/__tests__/unit/cost-tracker.test.ts`
- Test framework: bun:test (`import { describe, test, expect, mock, beforeEach } from 'bun:test'`)

### References

- [Source: epics.md → Story 3.6 (lines 464-478)]
- [Source: architecture.md → D4 (Hook 순서), E9 (SDK 모킹)]
- [Source: engine/hooks/tool-permission-guard.ts → PreToolUse, 20 lines]
- [Source: engine/hooks/credential-scrubber.ts → PostToolUse #1, 32 lines]
- [Source: engine/hooks/output-redactor.ts → PostToolUse #2, 25 lines]
- [Source: engine/hooks/delegation-tracker.ts → PostToolUse #3, 32 lines]
- [Source: engine/hooks/cost-tracker.ts → Stop, 39 lines]
- [Source: engine/types.ts → SessionContext, PreToolHookResult]
- [Source: lib/event-bus.ts → eventBus singleton]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Integration test verifies full D4 hook pipeline order with real hook code + mocked DB
- 8 integration tests: full happy path, permission deny, scrubber-before-delegation, wrong order leak, hook error, stop independence, call_agent bypass, multi-data-type pipeline
- 4 TEA P0 introspection tests: importability, error code, return types
- runPostToolUsePipeline helper encapsulates D4 PostToolUse order
- tsc: 0 errors, bun test: 12 pass, 0 fail

### File List

- `packages/server/src/__tests__/integration/hook-pipeline.test.ts` — NEW (192 lines, 12 tests)
