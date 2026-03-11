# Story 3.4: delegation-tracker — PostToolUse Hook

Status: done

## Story

As a 사용자,
I want 핸드오프 과정이 실시간으로 화면에 표시되는 것을,
so that "비서실장 → CMO → 콘텐츠 전문가" 체인을 볼 수 있다.

## Acceptance Criteria

1. [ ] `packages/server/src/engine/hooks/delegation-tracker.ts` (~30줄) 생성
2. [ ] PostToolUse 시그니처: call_agent 도구 실행 후 트리거
3. [ ] WebSocket 이벤트 발행: `{ type: 'handoff', from, to, depth, timestamp }`
4. [ ] **마스킹된 안전한 데이터만** 발행 (scrubber + redactor 이후) (D4)
5. [ ] EventEmitter 기반 (eventBus) — 단일 서버, Phase 5+ Redis 교체 대비 인터페이스
6. [ ] PostToolUse 순서: **3번째** — scrubber, redactor 이후 (D4)
7. [ ] 기존 프론트 WebSocket 채널 호환 (D11)
8. [ ] 단위 테스트: handoff 이벤트 발행, call_agent 외 도구 무시

## Tasks / Subtasks

- [x] Task 1: delegation-tracker.ts 구현 (AC: #1~#7)
  - [x] 1.1 `delegation-tracker.ts` 파일 생성 in `engine/hooks/`
  - [x] 1.2 PostToolUse 시그니처: `(ctx, toolName, toolOutput, toolInput?) => string`
  - [x] 1.3 call_agent 도구만 처리, 나머지는 toolOutput 그대로 반환
  - [x] 1.4 toolInput에서 targetAgentId 추출 (call_agent 입력)
  - [x] 1.5 eventBus.emit('delegation', { type: 'handoff', from, to, depth, timestamp, sessionId, companyId }) 발행
  - [x] 1.6 toolOutput 그대로 반환 (수정 없음)

- [x] Task 2: 단위 테스트 (AC: #8)
  - [x] 2.1 `packages/server/src/__tests__/unit/delegation-tracker.test.ts` 교체
  - [x] 2.2 테스트: call_agent 시 handoff 이벤트 발행 (구조 검증)
  - [x] 2.3 테스트: call_agent 외 도구 → 이벤트 미발행
  - [x] 2.4 테스트: toolOutput 수정 없이 반환 (both call_agent and non-call_agent)
  - [x] 2.5 테스트: missing toolInput → to='unknown' (defensive)
  - [x] 2.6 테스트: visitedAgents chain → from=last agent

- [x] Task 3: 빌드 검증
  - [x] 3.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [x] 3.2 `bun test` — 10 PASS (6 functional + 4 TEA P0)

## Dev Notes

### Architecture Decisions

- **D4 (Hook 순서):** PostToolUse에서 delegation-tracker가 **3번째**. scrubber(1st) → redactor(2nd) 이후. 마스킹된 안전한 데이터만 발행.
- **D11 (WebSocket 호환):** Phase 1에서 기존 프론트 형식 유지. eventBus 이벤트명 'delegation'.
- **E2 (Hook 표준):** PostToolUse 시그니처로 구현. 도구 출력을 수정하지 않고 그대로 반환 (side-effect: eventBus emit).

### Function Signature

```typescript
export function delegationTracker(
  ctx: SessionContext,
  toolName: string,
  toolOutput: string,
): string
```

### Imports

```typescript
import { eventBus } from '../../lib/event-bus'
import type { SessionContext } from '../types'
```

### 구현 로직

```typescript
// call_agent 도구만 처리
if (toolName !== 'call_agent') return toolOutput

// ctx에서 handoff 정보 추출
const from = ctx.visitedAgents[ctx.visitedAgents.length - 1] || 'unknown'

// toolOutput에서 handoff 대상 정보 파싱 시도
// call_agent의 출력은 하위 에이전트의 응답이므로,
// handoff 정보는 ctx에서 추출해야 함

eventBus.emit('delegation', {
  type: 'handoff',
  from,
  to: /* parse from context */,
  depth: ctx.depth,
  timestamp: new Date().toISOString(),
  sessionId: ctx.sessionId,
  companyId: ctx.companyId,
})

return toolOutput  // 수정 없이 반환
```

### EventBus Reference

```typescript
// packages/server/src/lib/event-bus.ts
import { EventEmitter } from 'events'
class EventBus extends EventEmitter {}
export const eventBus = new EventBus()
```

v1에서 eventBus.emit('delegation', event) 패턴 사용 중. v2에서도 동일 이벤트명 유지.

### v1 delegation-tracker 참고

- 위치: `packages/server/src/services/delegation-tracker.ts`
- 이벤트 타입: DelegationEventType (COMMAND_RECEIVED, CLASSIFIED, MANAGER_STARTED 등)
- v2에서는 Hook 파이프라인으로 간소화: handoff 이벤트만 발행

### PostToolUse Hook에서 '대상 에이전트' 정보

PostToolUse는 도구 **실행 후** 호출됨. call_agent의 toolOutput은 하위 에이전트의 전체 응답.
handoff 대상 정보를 얻으려면 toolInput(call_agent의 입력)이 필요하지만, PostToolUse 시그니처에는 toolInput이 없음.

**해결책:** PostToolUse 시그니처를 `(ctx, toolName, toolOutput, toolInput?) => string`으로 확장하거나,
toolOutput 파싱으로 handoff 정보를 추출. 또는 ctx.visitedAgents에서 depth 기반 추론.

실제로 PostToolUse에서는 toolInput도 전달받아야 call_agent의 targetAgentId를 알 수 있음.
→ 시그니처 확장: 4번째 인자로 toolInput 추가 (optional).

### Previous Story Intelligence

- **Story 3.1-3.3:** engine/hooks/ 패턴 확립. 동일 구조 따름.
- **Story 2.6 call-agent.ts:** callAgent의 input: `{ targetAgentId, message, priority? }`
- **eventBus:** `packages/server/src/lib/event-bus.ts` — singleton EventEmitter

### References

- [Source: epics.md → Story 3.4 (lines 420-440)]
- [Source: architecture.md → D4 (Hook 순서), D11 (WebSocket 호환)]
- [Source: lib/event-bus.ts → eventBus singleton]
- [Source: services/delegation-tracker.ts → v1 DelegationEvent 타입]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **delegation-tracker.ts:** 33 lines. Synchronous PostToolUse hook (3rd in D4 order). Emits eventBus 'delegation' event with handoff info only for call_agent tool. Uses ctx.visitedAgents for 'from' and toolInput.targetAgentId for 'to'.
- **Design decision:** Added optional 4th param `toolInput` to PostToolUse signature to extract targetAgentId from call_agent input. Non-breaking — other hooks ignore it.
- **Tests:** 10 tests — 6 functional (handoff emit, non-call_agent skip, output unchanged x2, missing input defensive, visitedAgents chain) + 4 TEA P0 source introspection.
- **tsc:** 0 errors. All 10 tests pass.

### File List

- `packages/server/src/engine/hooks/delegation-tracker.ts` — NEW: PostToolUse delegation tracker (33 lines)
- `packages/server/src/__tests__/unit/delegation-tracker.test.ts` — MODIFIED: Replaced v1 tests with 10 engine-based tests
