# Story 2.5: sse-adapter.ts — SDK→기존 SSE 변환

Status: in-progress

## Story

As a 프론트엔드,
I want SDK 메시지가 기존 SSE 이벤트 형식으로 변환되는 것을,
so that Phase 1에서 프론트엔드 수정 0으로 엔진을 교체할 수 있다.

## Acceptance Criteria

1. [ ] `packages/server/src/engine/sse-adapter.ts` (~30줄) 생성
2. [ ] `sseStream()` — AsyncGenerator<SSEEvent> → AsyncGenerator<string> 변환
3. [ ] `formatSSE()` — SSEEvent → `event: {type}\ndata: {JSON}\n\n` 형식 변환
4. [ ] 6개 SSEEvent 타입 전부 처리: accepted, processing, handoff, message, error, done
5. [ ] 기존 프론트엔드 SSE 파싱 호환 (EventSource로 type별 분기)
6. [ ] engine 내부 전용 (E8: 외부 import 금지)
7. [ ] 단위 테스트: `sse-adapter.test.ts` — 6개 이벤트 타입 formatSSE 검증 + sseStream 연속 변환

## Tasks / Subtasks

- [x] Task 1: sse-adapter.ts 구현 (AC: #1, #2, #3, #4, #6)
  - [x] 1.1 `packages/server/src/engine/sse-adapter.ts` 파일 생성
  - [x] 1.2 `formatSSE(event: SSEEvent): string` — type → event name, 나머지 → JSON data
  - [x] 1.3 `sseStream(events: AsyncGenerator<SSEEvent>): AsyncGenerator<string>` — for await 변환
  - [x] 1.4 SSE 표준 형식 준수: `event: {type}\ndata: {JSON}\n\n`

- [x] Task 2: 단위 테스트 (AC: #5, #7)
  - [x] 2.1 `packages/server/src/__tests__/unit/sse-adapter.test.ts` 생성
  - [x] 2.2 테스트: accepted 이벤트 → `event: accepted\ndata: {"sessionId":"..."}\n\n`
  - [x] 2.3 테스트: processing 이벤트 → `event: processing\ndata: {"agentName":"..."}\n\n`
  - [x] 2.4 테스트: handoff 이벤트 → `event: handoff\ndata: {"from":"...","to":"...","depth":2}\n\n`
  - [x] 2.5 테스트: message 이벤트 → `event: message\ndata: {"content":"..."}\n\n`
  - [x] 2.6 테스트: error 이벤트 → `event: error\ndata: {"code":"...","message":"..."}\n\n`
  - [x] 2.7 테스트: done 이벤트 → `event: done\ndata: {"costUsd":0.01,"tokensUsed":150}\n\n`
  - [x] 2.8 테스트: sseStream — 다중 이벤트 연속 변환 + 빈 제너레이터

- [x] Task 3: 빌드 검증
  - [x] 3.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [x] 3.2 `bun test packages/server/src/__tests__/unit/sse-adapter.test.ts` — 8 PASS

## Dev Notes

### Architecture Decisions

- **E5 (SSE 이벤트):** 6개 타입만 허용. 추가 시 프론트 동시 수정 필수.
- **D4 (SSE 어댑터):** agent-loop.ts는 SDK에만 집중, SSE 어댑터는 프론트 호환에만 집중.
- **E8 (engine 경계):** sse-adapter.ts는 engine 내부 전용. hub.ts(Story 4.1)에서 사용.

### SSEEvent Type (engine/types.ts)

```typescript
type SSEEvent =
  | { type: 'accepted'; sessionId: string }
  | { type: 'processing'; agentName: string }
  | { type: 'handoff'; from: string; to: string; depth: number }
  | { type: 'message'; content: string }
  | { type: 'error'; code: string; message: string; agentName?: string }
  | { type: 'done'; costUsd: number; tokensUsed: number }
```

### SSE Text Format

```
event: message
data: {"content":"Hello world"}

event: done
data: {"costUsd":0.01,"tokensUsed":150}

```

### Function Signatures

```typescript
export function formatSSE(event: SSEEvent): string
export function streamSSE(events: AsyncGenerator<SSEEvent>): ReadableStream<Uint8Array>
```

### Implementation

```typescript
import type { SSEEvent } from './types'

export function formatSSE(event: SSEEvent): string {
  const { type, ...data } = event
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`
}

export function streamSSE(events: AsyncGenerator<SSEEvent>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await events.next()
      if (done) {
        controller.close()
        return
      }
      controller.enqueue(encoder.encode(formatSSE(value)))
    },
  })
}
```

### References

- [Source: architecture.md → D4 (lines 176-181), E5 (lines 649-661), E8 (lines 681-687)]
- [Source: epics.md → Story 2.5 (lines 296-314)]
- [Source: engine/types.ts → SSEEvent type]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **sse-adapter.ts:** 26 lines. Two pure functions: `formatSSE` (SSEEvent→string) + `streamSSE` (AsyncGenerator→ReadableStream). No DB, no imports beyond types.
- **Design choice:** Used `ReadableStream` with pull-based strategy (not AsyncGenerator<string>) — better fit for Hono Response streaming in hub.ts (Story 4.1).
- **Tests:** 8 tests — 6 formatSSE (one per SSEEvent type) + 2 streamSSE (multi-event stream + empty generator). No mocking needed (pure functions).
- **tsc:** 0 errors. All 8 tests pass.

### File List

- `packages/server/src/engine/sse-adapter.ts` — NEW: SSE adapter (26 lines)
- `packages/server/src/__tests__/unit/sse-adapter.test.ts` — NEW: 8 unit tests
