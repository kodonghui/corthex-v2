# Story 2.6: call-agent.ts — N단계 핸드오프 도구

Status: done

## Story

As a 비서/매니저 에이전트,
I want call_agent 도구로 하위 에이전트에게 작업을 위임할 수 있는 것을,
so that 자동 분류→부서 배분→병렬 위임→종합이 동작한다.

## Acceptance Criteria

1. [ ] `packages/server/src/tool-handlers/builtins/call-agent.ts` (~40줄) 생성
2. [ ] MCP 도구 스키마: `{ targetAgentId: string, message: string, priority?: string }`
3. [ ] SessionContext spread 복사: `{ ...ctx, depth: ctx.depth + 1, visitedAgents: [...ctx.visitedAgents, targetId] }` (E1)
4. [ ] 깊이 제한: `ctx.depth >= ctx.maxDepth` → HANDOFF_DEPTH_EXCEEDED 에러
5. [ ] 순환 감지: `ctx.visitedAgents.includes(targetId)` → HANDOFF_CIRCULAR 에러 (FR9)
6. [ ] 대상 에이전트 조회: `getDB(ctx.companyId).agentById(targetAgentId)` (E3)
7. [ ] 대상 미존재 → HANDOFF_TARGET_NOT_FOUND 에러
8. [ ] 대상 에이전트 Soul 렌더링: `renderSoul(agent.soul, targetAgentId, ctx.companyId)`
9. [ ] SSE "handoff" 이벤트 발행: `{ type: 'handoff', from: currentAgentName, to: targetAgentName, depth: childCtx.depth }`
10. [ ] 재귀 `runAgent()` 호출 (agent-loop.ts) + 모든 이벤트 forward
11. [ ] Phase 1: 순차 실행만 (for..of). Promise.all은 Phase 2+ (E7)
12. [ ] 에러 시 SSE error 이벤트 yield (throw 아님)
13. [ ] 단위 테스트: 성공 핸드오프, 깊이 초과, 순환 감지, 대상 미존재

## Tasks / Subtasks

- [x] Task 1: 디렉토리 생성 + call-agent.ts 구현 (AC: #1~#11)
  - [x] 1.1 `packages/server/src/tool-handlers/builtins/` 디렉토리 생성
  - [x] 1.2 `call-agent.ts` 파일 생성 (~40줄)
  - [x] 1.3 깊이 검증: `ctx.depth >= ctx.maxDepth` → yield error SSEEvent
  - [x] 1.4 순환 검증: `ctx.visitedAgents.includes(targetAgentId)` → yield error SSEEvent
  - [x] 1.5 대상 조회: `getDB(ctx.companyId).agentById(targetAgentId)` → yield error if not found
  - [x] 1.6 자식 컨텍스트 생성: `{ ...ctx, depth: ctx.depth + 1, visitedAgents: [...ctx.visitedAgents, targetAgentId] }`
  - [x] 1.7 Soul 렌더링: `renderSoul(agent.soul, targetAgentId, ctx.companyId)`
  - [x] 1.8 SSE handoff 이벤트 yield
  - [x] 1.9 재귀 `runAgent({ ctx: childCtx, soul: renderedSoul, message })` + for-await forward

- [x] Task 2: 단위 테스트 (AC: #12, #13)
  - [x] 2.1 `packages/server/src/__tests__/unit/call-agent.test.ts` 생성
  - [x] 2.2 테스트: 성공 핸드오프 — handoff 이벤트 + runAgent 이벤트 forward
  - [x] 2.3 테스트: 깊이 초과 → error 이벤트 (HANDOFF_DEPTH_EXCEEDED)
  - [x] 2.4 테스트: 순환 감지 → error 이벤트 (HANDOFF_CIRCULAR)
  - [x] 2.5 테스트: 대상 미존재 → error 이벤트 (HANDOFF_TARGET_NOT_FOUND)

- [x] Task 3: 빌드 검증
  - [x] 3.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [x] 3.2 `bun test packages/server/src/__tests__/unit/call-agent.test.ts` — 8 PASS

## Dev Notes

### Architecture Decisions

- **E1 (SessionContext 전파):** readonly 타입. `{ ...ctx, depth: ctx.depth+1 }` spread 복사만 허용. 직접 변경(`ctx.depth += 1`) 금지 — 병렬 핸드오프 시 공유 상태 오염.
- **E7 (순차 핸드오프):** Phase 1에서 `for..of` 순차만. `Promise.all` 병렬은 Phase 2+ branchId 기반 SSE 분리와 함께.
- **E3 (DB 격리):** `getDB(ctx.companyId).agentById()` 통해서만 접근. `db.select()` 직접 쿼리 금지.
- **E8 (engine 경계):** call-agent.ts는 `tool-handlers/builtins/`에 위치하므로 engine 외부. engine의 public API(`runAgent`, `renderSoul`, `types`)만 import 가능.
- **D4 (SSE 어댑터):** call-agent은 SSEEvent를 yield. 실제 SSE text 변환은 sse-adapter.ts가 담당.

### Existing Code to Import

```typescript
import { runAgent } from '../../engine/agent-loop'        // D6: 단일 진입점 재귀 호출
import { renderSoul } from '../../engine/soul-renderer'    // E4: Soul 템플릿 렌더링
import { getDB } from '../../db/scoped-query'              // D1: 멀티테넌시 DB 접근
import { ERROR_CODES } from '../../lib/error-codes'        // D3: 에러 코드
import type { SessionContext, SSEEvent } from '../../engine/types' // E1, E5
```

### Function Signature

```typescript
export async function* callAgent(
  ctx: SessionContext,
  input: { targetAgentId: string; message: string; priority?: string }
): AsyncGenerator<SSEEvent>
```

### Error Handling Pattern

에러 시 throw가 아닌 yield로 SSE error 이벤트 반환:
```typescript
yield { type: 'error', code: ERROR_CODES.HANDOFF_DEPTH_EXCEEDED, message: '...' }
return  // 즉시 종료
```

### agentById 반환 형태

`getDB(companyId).agentById(id)` → `Agent[]` 배열 반환 (Drizzle select). 첫 번째 요소 확인:
```typescript
const [agent] = await getDB(ctx.companyId).agentById(input.targetAgentId)
if (!agent) { yield error; return }
```

Agent 객체에서 사용할 필드:
- `agent.name` — 에이전트 이름 (handoff 이벤트의 to)
- `agent.soul` — Soul 템플릿 문자열 (renderSoul 입력)

### 현재 에이전트 이름 얻기

`ctx.visitedAgents` 배열의 마지막 요소가 현재 에이전트:
```typescript
const currentAgentName = ctx.visitedAgents[ctx.visitedAgents.length - 1] || 'unknown'
```
(agent-loop.ts 16줄과 동일 패턴)

### 자식 이벤트 Forward 패턴

```typescript
// for-await로 자식 runAgent의 모든 이벤트를 그대로 forward
for await (const event of runAgent({ ctx: childCtx, soul: renderedSoul, message: input.message })) {
  yield event
}
```
또는 간단히 `yield*` 사용 가능 (AsyncGenerator 위임).

### Mock 전략 (테스트)

```typescript
// bun:test에서 모듈 mock
import { mock } from 'bun:test'
mock.module('../../engine/agent-loop', () => ({ runAgent: mockRunAgent }))
mock.module('../../engine/soul-renderer', () => ({ renderSoul: mockRenderSoul }))
mock.module('../../db/scoped-query', () => ({ getDB: mockGetDB }))
```

### visitedAgents에는 ID가 아닌 이름일 수도 있음

현재 agent-loop.ts에서 `ctx.visitedAgents`의 마지막 요소를 agentName으로 사용 중 (16줄). 하지만 Story 2.6의 epics.md AC에서는 `ctx.visitedAgents.includes(targetId)` 로 **ID** 비교. 구현 시 visitedAgents에 **agentId**를 넣어야 순환 감지가 정확함. 자식 컨텍스트: `visitedAgents: [...ctx.visitedAgents, targetAgentId]`.

### Previous Story Intelligence (Story 2.5)

- **패턴:** AsyncGenerator<SSEEvent> 반환하는 함수. call-agent도 동일.
- **테스트:** formatSSE + sseStream 분리 테스트. call-agent도 개별 케이스 분리.
- **파일 크기:** sse-adapter.ts 26줄. call-agent도 ~40줄 목표.
- **빌드:** tsc 0 errors 필수. bun test 전부 PASS 필수.

### Project Structure Notes

- `packages/server/src/tool-handlers/builtins/` 디렉토리가 아직 없음 → 생성 필요
- 테스트: `packages/server/src/__tests__/unit/call-agent.test.ts`
- engine 외부이므로 engine 내부 모듈(hooks 등) 직접 import 금지

### References

- [Source: epics.md → Story 2.6 (lines 317-340)]
- [Source: architecture.md → E1 (lines 572-586), E7 (lines 667-679), E8 (lines 681-687)]
- [Source: engine/types.ts → SessionContext, SSEEvent]
- [Source: engine/agent-loop.ts → runAgent signature, line 14-16]
- [Source: engine/soul-renderer.ts → renderSoul signature, line 11-15]
- [Source: db/scoped-query.ts → getDB().agentById(), line 29-30]
- [Source: lib/error-codes.ts → HANDOFF_* codes, lines 13-15]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **call-agent.ts:** 40 lines. AsyncGenerator<SSEEvent> function with 3 validation gates (depth, circular, not-found) + DB lookup + soul render + recursive runAgent.
- **Pattern:** yield error + return (no throw). for-await forward of child events. E1 spread copy for child context.
- **Tests:** 8 tests — success handoff (4 events), depth exceeded, circular detection, target not found, child context depth, empty soul, null soul, empty visitedAgents.
- **tsc:** 0 errors. All 8 tests pass.

### File List

- `packages/server/src/tool-handlers/builtins/call-agent.ts` — NEW: N-step handoff tool (40 lines)
- `packages/server/src/__tests__/unit/call-agent.test.ts` — NEW: 8 unit tests
