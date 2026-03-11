# Story 12.1: SDK 모킹 표준 + 헬퍼

Status: done

## Story

As a 개발자,
I want SDK query()를 손쉽게 모킹하여 테스트하는 것을,
so that CI에서 비용 $0으로 엔진 전체를 테스트할 수 있다.

## Acceptance Criteria

1. `packages/server/src/__tests__/helpers/sdk-mock.ts` 생성
2. `mock.module('@anthropic-ai/claude-agent-sdk', ...)` 표준 패턴 구현 (Architecture E9)
3. Agent SDK `query()` 모킹: AsyncGenerator 반환하는 헬퍼
4. 커스텀 응답 설정: `mockAgent({ responses: ['response1', 'response2'] })`
5. call_agent 도구 호출 시뮬레이션: `mockAgent({ toolCalls: [{ name: 'call_agent', input: {...} }] })`
6. agent-loop.ts의 `runAgent()` 함수는 실제 실행됨 (Hook, SessionContext 전파 테스트 가능)
7. DB 쿼리 모킹 헬퍼: getDB(companyId) + Drizzle ORM 패턴
8. 도구 실행 모킹 헬퍼
9. 기존 test-utils.ts와 공존 (기존 API 테스트 헬퍼 훼손 금지)

## Tasks / Subtasks

- [x] Task 1: SDK 모킹 헬퍼 생성 (AC: #1, #2, #3, #4, #5)
  - [x] 1.1 `packages/server/src/__tests__/helpers/sdk-mock.ts` 파일 생성
  - [x] 1.2 `mockSDK()` — `mock.module('@anthropic-ai/claude-agent-sdk', ...)` 래퍼
  - [x] 1.3 `mockAgent({ responses, toolCalls })` — 커스텀 응답/도구호출 설정
  - [x] 1.4 AsyncGenerator 반환: `assistant` 메시지 + `result` 메시지 시뮬레이션
  - [x] 1.5 call_agent 도구 호출 이벤트 시뮬레이션
  - [x] 1.6 에러 시나리오 모킹: SDK 타임아웃, 네트워크 에러, 비정상 종료

- [x] Task 2: DB 모킹 헬퍼 생성 (AC: #7)
  - [x] 2.1 `packages/server/src/__tests__/helpers/db-mock.ts` 파일 생성
  - [x] 2.2 `mockGetDB(companyId, overrides)` — getDB() 반환값 모킹
  - [x] 2.3 Drizzle ORM select/insert/update/delete 체이닝 모킹
  - [x] 2.4 테넌트 격리 검증 헬퍼: 다른 companyId 접근 시 빈 결과 반환

- [x] Task 3: 도구 실행 모킹 헬퍼 생성 (AC: #8)
  - [x] 3.1 `packages/server/src/__tests__/helpers/tool-mock.ts` 파일 생성
  - [x] 3.2 `mockToolExecution({ name, result })` — 도구 실행 결과 모킹
  - [x] 3.3 도구 권한 검증 모킹 (PreToolHookResult)

- [x] Task 4: 통합 내보내기 + 기존 헬퍼 공존 확인 (AC: #9)
  - [x] 4.1 `packages/server/src/__tests__/helpers/index.ts` — 배럴 내보내기 (기존 test-utils.ts 포함)
  - [x] 4.2 기존 테스트 깨짐 없음 확인

- [x] Task 5: 사용 예시 테스트 작성 (AC: #6)
  - [x] 5.1 `packages/server/src/__tests__/unit/sdk-mock-demo.test.ts` — 헬퍼 사용법 데모 테스트
  - [x] 5.2 runAgent() 실제 실행 + SDK만 모킹 패턴 검증
  - [x] 5.3 다중 응답 + 도구 호출 시나리오 테스트

## Dev Notes

### Architecture Compliance (E9, D10)

**E9 SDK 모킹 표준 (Architecture 문서 689~706줄):**
```typescript
import { mock } from 'bun:test';

mock.module('@anthropic-ai/claude-agent-sdk', () => ({
  Agent: class {
    query = mock(() => ({
      async *[Symbol.asyncIterator]() {
        yield { type: 'text', content: 'mocked response' };
      }
    }));
  }
}));
// agent-loop.ts 함수 자체는 실제 실행 → call_agent, Hook, SessionContext 전파 전부 테스트됨
```

**핵심 원칙:**
- SDK `query()` 만 모킹, CORTHEX 코드(agent-loop, call_agent, Hook, SessionContext, soul-renderer)는 전부 **실제 실행**
- `@zapier/secret-scrubber`는 순수 함수 → 모킹 불필요, 실제 실행

### agent-loop.ts 구조 (반드시 이해 필요)

파일: `packages/server/src/engine/agent-loop.ts`

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk'
// ...
export async function* runAgent(options: RunAgentOptions): AsyncGenerator<SSEEvent> {
  // ...
  for await (const msg of query({ prompt, options: { systemPrompt, maxTurns, permissionMode, env } })) {
    // msg.type === 'assistant' → yield { type: 'message', content }
    // msg.type === 'result' → yield { type: 'done', costUsd, tokensUsed }
  }
}
```

**query() 반환 형식** (모킹 시 이 형식 따라야 함):
- `{ type: 'assistant', message: { content: [{ type: 'text', text: '...' }] } }`
- `{ type: 'result', subtype: 'success', total_cost_usd: 0, usage: { input_tokens, output_tokens } }`
- `{ type: 'result', subtype: 'error', error: '...' }` (에러 시)

### SSE 이벤트 타입 (engine/types.ts)

```typescript
export type SSEEvent =
  | { type: 'accepted'; sessionId: string }
  | { type: 'processing'; agentName: string }
  | { type: 'handoff'; from: string; to: string; depth: number }
  | { type: 'message'; content: string }
  | { type: 'error'; code: string; message: string; agentName?: string }
  | { type: 'done'; costUsd: number; tokensUsed: number }
```

### SessionContext (engine/types.ts)

```typescript
export interface SessionContext {
  readonly cliToken: string
  readonly userId: string
  readonly companyId: string
  readonly depth: number
  readonly sessionId: string
  readonly startedAt: number
  readonly maxDepth: number
  readonly visitedAgents: readonly string[]
}
```

### RunAgentOptions (engine/types.ts)

```typescript
export interface RunAgentOptions {
  ctx: SessionContext
  soul: string
  message: string
  tools?: Tool[]
}
```

### DB 모킹 패턴 — getDB(companyId)

파일: `packages/server/src/db/scoped-query.ts`

```typescript
export function getDB(companyId: string) {
  return {
    agents: () => db.select().from(agents).where(...),
    agentById: (id: string) => db.select().from(agents).where(...),
    departmentById: (id: string) => ...,
    // ... 기타 쿼리 메서드
  }
}
```

모킹 시 getDB 반환 객체의 각 메서드가 Promise 배열 반환하도록 구성.

### 기존 테스트 패턴 참고

파일: `packages/server/src/__tests__/helpers/test-utils.ts`
- `makeToken()` — JWT 토큰 생성
- `api()` — fetch + 인증 헬퍼
- `createTestTokens()` — 4종 RBAC 토큰
- 이 파일은 **수정 금지** — 기존 API 테스트가 의존

기존 mock.module 사용 예시 (`__tests__/unit/knowledge-base.test.ts`):
```typescript
import { mock } from 'bun:test'
mock.module('../../db', () => ({ ... }))
mock.module('../../services/knowledge-injector', () => ({ ... }))
```

### 테스트 프레임워크

- **bun:test** (vitest 아님) — `import { describe, test, expect, mock, beforeEach } from 'bun:test'`
- `mock.module()` — 모듈 단위 모킹
- `mock()` — 함수 모킹
- 테스트 실행: `bun test packages/server/src/__tests__/unit/`

### Project Structure Notes

- 새 파일 위치: `packages/server/src/__tests__/helpers/` (기존 `test-utils.ts` 옆)
- 파일명: kebab-case (sdk-mock.ts, db-mock.ts, tool-mock.ts)
- 배럴 내보내기: `index.ts`에서 모든 헬퍼 re-export

### Anti-Patterns (하지 말 것)

- SDK 전체를 모킹하지 말 것 — `query()` 함수만 모킹
- agent-loop.ts 내부 함수를 모킹하지 말 것 — 실제 실행되어야 Hook/Context 테스트 가능
- `@zapier/secret-scrubber` 모킹하지 말 것 — 순수 함수이므로 실제 실행
- Drizzle ORM의 내부 구현을 모킹하지 말 것 — getDB() 레벨에서 모킹
- 기존 test-utils.ts 수정하지 말 것 — 80+ 기존 테스트 깨짐 위험

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#E9] — SDK 모킹 표준 코드 패턴
- [Source: _bmad-output/planning-artifacts/architecture.md#D10] — 테스트 전략 (단위+모킹통합 CI, 실제SDK 주1회)
- [Source: _bmad-output/planning-artifacts/epics.md#Epic12] — Epic 12 전체 목표
- [Source: packages/server/src/engine/agent-loop.ts] — 실제 query() 사용 코드
- [Source: packages/server/src/engine/types.ts] — SessionContext, SSEEvent, RunAgentOptions 타입
- [Source: packages/server/src/db/scoped-query.ts] — getDB() 멀티테넌시 래퍼
- [Source: packages/server/src/__tests__/helpers/test-utils.ts] — 기존 테스트 헬퍼 (수정 금지)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- 21 tests pass, 0 fail, 56 expect() calls (sdk-mock-demo.test.ts)
- tsc --noEmit: 0 errors
- Existing tests (error-codes, rate-limit, crypto): 14 pass, 0 fail — no regressions

### Completion Notes List

- Created SDK mock helper with `mockSDK()` and `mockSDKSequential()` following Architecture E9
- `query()` function only is mocked — agent-loop.ts runs for real
- Supports: text responses, tool calls (call_agent etc), cost/token reporting, error/exception scenarios
- Created DB mock helper with `mockGetDB()` — tenant isolation enforcement, error simulation
- Created tool mock helpers: `mockToolPermission()`, `mockToolPermissionMap()`, `createMockToolResult()`, `createMockTool()`
- Barrel export via index.ts — existing test-utils.ts untouched and re-exported
- 21 comprehensive demo tests covering all mock scenarios
- TEA: 19 additional risk-based tests (edge cases, DB writes, permission maps)
- Code Review: Fixed mockSDKSequential error path token reporting (was hardcoded 0)
- Code Review: Added random suffix to sessionId to prevent collisions

### File List

- `packages/server/src/__tests__/helpers/sdk-mock.ts` (NEW) — SDK query() 모킹 헬퍼
- `packages/server/src/__tests__/helpers/db-mock.ts` (NEW) — getDB() 모킹 헬퍼
- `packages/server/src/__tests__/helpers/tool-mock.ts` (NEW) — 도구 실행/권한 모킹 헬퍼
- `packages/server/src/__tests__/helpers/index.ts` (NEW) — 배럴 내보내기
- `packages/server/src/__tests__/unit/sdk-mock-demo.test.ts` (NEW) — 데모 테스트 21개
- `packages/server/src/__tests__/unit/sdk-mock-tea.test.ts` (NEW) — TEA 리스크 테스트 19개

### File List

- `packages/server/src/__tests__/helpers/sdk-mock.ts` (NEW) — SDK query() 모킹 헬퍼
- `packages/server/src/__tests__/helpers/db-mock.ts` (NEW) — getDB() 모킹 헬퍼
- `packages/server/src/__tests__/helpers/tool-mock.ts` (NEW) — 도구 실행/권한 모킹 헬퍼
- `packages/server/src/__tests__/helpers/index.ts` (NEW) — 배럴 내보내기
- `packages/server/src/__tests__/unit/sdk-mock-demo.test.ts` (NEW) — 데모 테스트 21개
