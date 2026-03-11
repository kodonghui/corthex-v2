# Story 2.2: agent-loop.ts — SDK query() 래퍼 + 단일 진입점

Status: done

## Story

As a 시스템,
I want 모든 에이전트 실행이 agent-loop.ts를 통과하는 것을,
so that Hook 파이프라인이 우회 불가하고 보안이 보장된다.

## Acceptance Criteria

1. [ ] `packages/server/src/engine/agent-loop.ts` (~50줄) 생성
2. [ ] `runAgent(options: RunAgentOptions)` 단일 export (D6)
3. [ ] SessionContext 생성 (최초 호출 시) 또는 전파 (핸드오프 시)
4. [ ] Pre-spawn "accepted" SSE 이벤트 발행 (SDK spawn ~2초 흡수)
5. [ ] SDK `query()` 호출: `env: { ANTHROPIC_API_KEY: ctx.cliToken }`
6. [ ] query() 호출 후 cliToken 변수 즉시 null (NFR-S2)
7. [ ] Hook 파이프라인 연결 준비: PreToolUse → PostToolUse → Stop (D4) — Phase 1은 placeholder
8. [ ] 세션 레지스트리: Map<sessionId, SessionContext> — graceful shutdown용 (NFR-O1)
9. [ ] 세션 완료 시 레지스트리 제거 + SSE "done" 이벤트
10. [ ] SDK query() 실패 시 AGENT_SPAWN_FAILED 에러 + SSE error 이벤트 + 세션 레지스트리 정리
11. [ ] AsyncGenerator<SSEEvent> 반환 (sse-adapter 연동용)

## Tasks / Subtasks

- [ ] Task 1: agent-loop.ts 구현 (AC: #1~#11)
  - [ ] 1.1 `packages/server/src/engine/agent-loop.ts` 파일 생성
  - [ ] 1.2 `runAgent()` async generator 함수 — `AsyncGenerator<SSEEvent>` 반환
  - [ ] 1.3 세션 레지스트리 Map 생성 + acquire/release
  - [ ] 1.4 "accepted" SSE 이벤트 yield (pre-spawn)
  - [ ] 1.5 SDK `query()` 호출 with env injection
  - [ ] 1.6 cliToken null 처리 (NFR-S2)
  - [ ] 1.7 SDK 메시지 → SSEEvent 변환 (assistant→message, result→done)
  - [ ] 1.8 에러 핸들링 (AGENT_SPAWN_FAILED)
  - [ ] 1.9 finally: 세션 레지스트리 정리

- [ ] Task 2: 단위 테스트 (SDK 모킹)
  - [ ] 2.1 `packages/server/src/__tests__/unit/agent-loop.test.ts` 생성
  - [ ] 2.2 SDK mock (E9): bun:test mock.module
  - [ ] 2.3 테스트 1: runAgent가 AsyncGenerator 반환
  - [ ] 2.4 테스트 2: accepted 이벤트 첫 번째로 yield
  - [ ] 2.5 테스트 3: 세션 레지스트리 등록/해제
  - [ ] 2.6 테스트 4: 에러 시 AGENT_SPAWN_FAILED SSE error 이벤트

- [ ] Task 3: 빌드 검증
  - [ ] 3.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [ ] 3.2 `bun test packages/server/src/__tests__/unit/agent-loop.test.ts` — PASS

## Dev Notes

### Architecture Decisions

- **D6 (단일 진입점):** 허브/텔레그램/ARGOS/AGORA 등 모든 에이전트 실행이 runAgent() 통과
- **E1 (SessionContext):** readonly 불변. spread 복사로 핸드오프 전파
- **NFR-S2:** query() 호출 후 cliToken 변수 즉시 null
- **SEC-6:** Soul에 cliToken 절대 주입 안 함
- **E7:** Phase 1은 순차 핸드오프만
- **E9:** SDK 모킹 — bun:test mock.module

### SDK query() 패턴 (PoC Test 1, 2, 4)

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk'

for await (const msg of query({
  prompt: message,
  options: {
    maxTurns: 10,
    permissionMode: 'bypassPermissions',
    env: { ANTHROPIC_API_KEY: cliToken, CLAUDECODE: '' },
  },
})) {
  // msg.type: 'system', 'assistant', 'result', 'rate_limit_event'
}
```

### SDK 메시지 → SSEEvent 매핑

- `system:init` → (내부 처리, SSE 미발행)
- `assistant` → `{ type: 'message', content }` (텍스트 블록 추출)
- `result:success` → `{ type: 'done', costUsd, tokensUsed }`
- `result:error` → `{ type: 'error', code, message }`

### Hook 연결 (Phase 1)

- Phase 1: Hook 파이프라인은 Story 2.5에서 구현. agent-loop.ts에서는 hooks 옵션 자리만 준비
- Story 2.5가 hooks/ 구현 후 agent-loop.ts에 연결

### References

- [Source: architecture.md → D6, E1, E5, E7, E8, E9, NFR-S2, SEC-6]
- [Source: epics.md → Story 2.2 (lines 226-251)]
- [Source: _poc/agent-engine-v3/tests/01-basic-query.ts, 02-cli-token-auth.ts, 04-hooks.ts]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **agent-loop.ts:** ~85 lines. `runAgent()` async generator — accepted→processing→message(s)→done SSE flow.
- **SDK integration:** `query()` with `systemPrompt` (soul), `env` (cliToken injection), `permissionMode: 'bypassPermissions'`.
- **Security:** cliToken nulled after env extraction (NFR-S2). Never injected into soul (SEC-6).
- **Session registry:** Map<sessionId, SessionContext> with auto-cleanup in finally block.
- **Simplify fixes:** (1) `errMessage` instead of shadowed `message`, (2) added 'processing' SSE event.
- **Deferred:** (msg as any) casts, maxTurns config, error differentiation, token in env, session TTL, tools wiring.
- **Tests:** 8 tests — 5 dev + 3 TEA (token null, error code, shadowing fix). SDK mocked via mock.module (E9).

### Change Log

- 2026-03-11: Story 2.2 implementation complete — agent-loop.ts SDK wrapper, 8 unit tests
- 2026-03-11: Simplify fixes applied — variable shadowing + processing event

### File List

- `packages/server/src/engine/agent-loop.ts` — NEW: SDK query() wrapper (85 lines)
- `packages/server/src/__tests__/unit/agent-loop.test.ts` — NEW: 8 unit tests (SDK mocked)
