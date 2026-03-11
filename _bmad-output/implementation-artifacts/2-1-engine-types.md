# Story 2.1: engine/types.ts — SessionContext & SSE 타입 정의

Status: done

## Story

As a 엔진 개발자,
I want SessionContext, SSEEvent, PreToolHookResult 등 핵심 타입이 정의되는 것을,
so that 모든 엔진 모듈이 일관된 타입을 사용한다.

## Acceptance Criteria

1. [ ] `packages/server/src/engine/types.ts` 생성
2. [ ] SessionContext 인터페이스 — 9 readonly 필드 (E1): cliToken, userId, companyId, depth, sessionId, startedAt, maxDepth, visitedAgents
3. [ ] `readonly string[]` for visitedAgents (병렬 핸드오프 시 독립 복사)
4. [ ] SSEEvent 유니언 타입 — 6종: accepted, processing, handoff, message, error, done (E5)
5. [ ] PreToolHookResult: `{ allow: boolean; reason?: string }`
6. [ ] RunAgentOptions: `{ ctx: SessionContext; soul: string; message: string; tools?: Tool[] }`
7. [ ] **server 내부 전용** — shared re-export 금지 (P1, S1)
8. [ ] `ctx.depth = 1` → 컴파일 에러 확인 (readonly)

## Tasks / Subtasks

- [ ] Task 1: engine/types.ts 생성 (AC: #1~#6)
  - [ ] 1.1 `packages/server/src/engine/` 디렉토리 생성
  - [ ] 1.2 SessionContext interface — 9 readonly 필드 (E1 정의 그대로)
  - [ ] 1.3 SSEEvent 유니언 타입 — 6종 (E5 정의 그대로)
  - [ ] 1.4 PreToolHookResult — `{ allow: boolean; reason?: string }`
  - [ ] 1.5 RunAgentOptions — `{ ctx: SessionContext; soul: string; message: string; tools?: Tool[] }`
  - [ ] 1.6 Tool 타입 정의 (SDK Tool 타입 참조 또는 자체 정의)

- [ ] Task 2: 단위 테스트 (AC: #2, #3, #7, #8)
  - [ ] 2.1 `packages/server/src/__tests__/unit/engine-types.test.ts` 생성
  - [ ] 2.2 테스트 1: SessionContext에 9개 필드 존재 확인
  - [ ] 2.3 테스트 2: SSEEvent 6종 타입 확인
  - [ ] 2.4 테스트 3: shared re-export 없음 확인
  - [ ] 2.5 테스트 4: readonly 컴파일 에러 — 소스에 readonly 키워드 확인

- [ ] Task 3: 빌드 검증
  - [ ] 3.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [ ] 3.2 `bun test packages/server/src/__tests__/unit/engine-types.test.ts` — PASS

## Dev Notes

### Architecture Decisions

- **D5 (SessionContext):** 모든 에이전트 실행의 컨텍스트. readonly 불변.
- **D6 (단일 진입점):** agent-loop.ts가 유일한 실행 경로. RunAgentOptions로 호출.
- **E1:** SessionContext 전파 규칙 — readonly + spread 복사
  - [Source: architecture.md → lines 572-592]
- **E5:** SSE 이벤트 6종 — accepted, processing, handoff, message, error, done
  - [Source: architecture.md → lines 649-661]
- **E8:** engine/ 공개 API = agent-loop.ts + types.ts만
  - [Source: architecture.md → lines 681-687]

### SessionContext (E1, lines 574-585)

```typescript
export interface SessionContext {
  readonly cliToken: string;
  readonly userId: string;
  readonly companyId: string;
  readonly depth: number;
  readonly sessionId: string;
  readonly startedAt: number;
  readonly maxDepth: number;
  readonly visitedAgents: readonly string[];
}
```

### SSEEvent (E5, lines 652-658)

```typescript
type SSEEvent =
  | { type: 'accepted'; sessionId: string }
  | { type: 'processing'; agentName: string }
  | { type: 'handoff'; from: string; to: string; depth: number }
  | { type: 'message'; content: string }
  | { type: 'error'; code: string; message: string; agentName?: string }
  | { type: 'done'; costUsd: number; tokensUsed: number };
```

### Hook 타입 (E2, lines 596-604)

```typescript
PreToolHookResult: { allow: boolean; reason?: string }
// PreToolUse: (ctx, toolName, toolInput) => PreToolHookResult
// PostToolUse: (ctx, toolName, toolOutput) => string
// StopHook: (ctx, usage) => void
```

### Anti-Pattern

- engine/types.ts를 shared re-export → 프론트에 cliToken 타입 노출 (보안 위반)

### References

- [Source: architecture.md → E1 (lines 572-592), E2 (lines 594-610), E5 (lines 649-661), E8 (lines 681-687)]
- [Source: epics.md → Story 2.1 (lines 203-223)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **engine/types.ts:** 42 lines. 4 exported types: SessionContext (8 readonly fields), SSEEvent (6-variant discriminated union), PreToolHookResult, RunAgentOptions. Plus Tool interface.
- **Readonly:** All SessionContext fields use `readonly`. visitedAgents uses `readonly string[]`.
- **No barrel:** No index.ts in engine/ — only types.ts and agent-loop.ts (Story 2.2) are public API.
- **Tests:** 8 tests — 5 dev + 3 TEA (discriminated fields, no barrel, server-internal comment).

### Change Log

- 2026-03-11: Story 2.1 implementation complete — engine types with 4 interfaces/types, 8 unit tests

### File List

- `packages/server/src/engine/types.ts` — NEW: Engine core types (42 lines)
- `packages/server/src/__tests__/unit/engine-types.test.ts` — NEW: 8 unit tests
- `_bmad-output/test-artifacts/tea-2-1-engine-types.md` — TEA artifact
