# Story 6.5: WebSocket 핸드오프 채널 전환

Status: done

## Story

As a **프론트엔드**,
I want **WebSocket 이벤트가 Hook 기반 delegation-tracker에서 발행되는 것을**,
so that **기존 7채널 멀티플렉싱과 통합된다**.

## Acceptance Criteria

1. **Given** engine Hook delegation-tracker가 `eventBus.emit('delegation', ...)` 발행 **When** call_agent 핸드오프 발생 **Then** WebSocket `delegation` 채널 구독자에게 handoff 이벤트 전달
2. **Given** Phase 1 기존 형식 → Phase 2 Hook 기반 전환 (D11) **When** 엔진 Hook과 기존 services/delegation-tracker.ts가 공존 **Then** WebSocket `delegation` 채널에 양쪽 이벤트가 모두 도달
3. **Given** delegation-tracker Hook이 handoff 이벤트 emit **When** 프론트 `delegation` 채널 구독 중 **Then** TanStack Query 캐시 자동 무효화 (handoff 상태 변경)
4. **Given** 기존 WebSocket 구독자(command-center, dashboard, activity-log) **When** Hook 기반 delegation 이벤트 수신 **Then** 기존 UI 동작(delegation step 추가, 트래커 업데이트) 호환

## Tasks / Subtasks

- [x] Task 1: Engine Hook delegation-tracker 이벤트 형식 통합 (AC: #1, #2)
  - [x] 1.1 `packages/server/src/engine/hooks/delegation-tracker.ts` 수정 — 기존 services/delegation-tracker.ts의 DelegationEvent 형식과 호환되는 payload 구조로 emit
  - [x] 1.2 engine Hook emit payload에 `commandId` 필드 추가 (SessionContext에서 sessionId를 commandId로 매핑)
  - [x] 1.3 engine Hook emit payload를 `{ companyId, payload }` 구조로 감싸기 (index.ts EventBus→WS 브리지와 호환)

- [x] Task 2: Hub SSE → WebSocket handoff 이벤트 브리지 (AC: #1, #3)
  - [x] 2.1 hub.ts 변경 불필요 — runAgent() → agent-loop.ts → Hook pipeline → delegation-tracker Hook → eventBus.emit('delegation') → index.ts bridge → WebSocket broadcast. SSE와 WebSocket이 독립 경로로 동시 발행됨.
  - [x] 2.2 SSE `handoff` 이벤트는 SSE stream으로 직접 전달, WebSocket `delegation` 채널 이벤트는 eventBus 브리지로 전달. 두 경로가 이미 병렬 동작.

- [x] Task 3: 프론트엔드 WebSocket delegation 리스너 — Hook 기반 이벤트 호환 (AC: #3, #4)
  - [x] 3.1 use-command-center.ts 변경 불필요 — 기존 handleDelegation 리스너가 { commandId, event, agentName?, phase, elapsed, timestamp, data? } 형태를 기대하며, 새 payload가 정확히 이 형태를 따름
  - [x] 3.2 TanStack Query 무효화 — 기존 delegation 리스너가 addDelegationStep() 호출하여 UI 자동 업데이트. 별도 invalidation 불필요 (delegation 이벤트는 쿼리 캐시가 아닌 Zustand store에서 관리)

- [x] Task 4: 테스트 (AC: #1~#4)
  - [x] 4.1 `packages/server/src/__tests__/unit/ws-handoff-channel.test.ts` — Hook delegation-tracker의 emit payload 형식 검증 (6 tests)
  - [x] 4.2 기존 delegation-tracker.test.ts 업데이트 — 새 { companyId, payload } 형식 검증 (14 tests). delegation-tracker-tea.test.ts 회귀 통과 (24 tests). delegation-security/chain-display/status 회귀 통과 (60 tests).

## Dev Notes

### 핵심 아키텍처 이해

**현재 상태 (2가지 delegation-tracker 공존):**

1. **Engine Hook** (`packages/server/src/engine/hooks/delegation-tracker.ts`):
   - PostToolUse Hook (3rd in D4 order)
   - `call_agent` 도구 사용 시 `eventBus.emit('delegation', { companyId, payload })` 발행
   - **수정 완료**: payload를 `{ companyId, payload }` 구조로 래핑하여 index.ts 브리지와 호환

2. **Services delegation-tracker** (`packages/server/src/services/delegation-tracker.ts`):
   - DelegationTracker 클래스 (싱글톤)
   - 24개 이벤트 타입 (COMMAND_RECEIVED ~ VECTOR_EXECUTION_COMPLETED)
   - `eventBus.emit('delegation', { companyId, payload })` 구조로 emit → index.ts 브리지 호환

**EventBus → WebSocket 브리지** (`packages/server/src/index.ts` line 208~210):
```typescript
eventBus.on('delegation', (data: { companyId: string; payload: unknown }) => {
  broadcastToCompany(data.companyId, 'delegation', data.payload)
})
```
→ `broadcastToCompany(companyId, 'delegation', payload)` → `delegation::${companyId}` 채널에 브로드캐스트

**프론트엔드 수신** (`packages/app/src/hooks/use-command-center.ts` line 208~230):
- `delegation` 채널 리스너 → `addDelegationStep()` 호출
- 기대 payload: `{ commandId, event, agentId?, agentName?, phase, elapsed, timestamp, data? }`

### 기존 코드 건드리지 않은 파일 (검증 완료)

- `packages/server/src/services/delegation-tracker.ts` — 불가침 (기존 오케스트레이션 시스템)
- `packages/server/src/index.ts` EventBus 브리지 — 이미 delegation 채널 브리지 존재. 수정 불필요.
- `packages/server/src/ws/channels.ts` — delegation 채널 이미 구독 핸들러 존재. 수정 불필요.
- `packages/shared/src/types.ts` — WsChannel에 `'delegation'` 이미 존재. 수정 불필요.
- `packages/app/src/hooks/use-command-center.ts` — 기존 handleDelegation 리스너가 새 payload 형식과 완전 호환. 수정 불필요.

### Project Structure Notes

- Engine Hook은 `engine/` 내부 전용 (E8). 외부 import 금지.
- Engine Hook delegation-tracker는 `eventBus`만 import — 인프라 의존 최소.
- WebSocket 채널 시스템: `ws/server.ts` (WS 연결 관리) + `ws/channels.ts` (구독 핸들러 + broadcastToChannel/broadcastToCompany)

### References

- [Source: architecture.md — D4 Hook 실행 순서]
- [Source: architecture.md — D11 WebSocket Phase 2 전환]
- [Source: architecture.md — E2 Hook 구현 표준]
- [Source: packages/server/src/engine/hooks/delegation-tracker.ts — Engine Hook]
- [Source: packages/server/src/services/delegation-tracker.ts — Services DelegationTracker]
- [Source: packages/server/src/index.ts line 208~210 — EventBus→WS 브리지]
- [Source: packages/server/src/ws/channels.ts line 196~208 — delegation 채널 구독]
- [Source: packages/app/src/hooks/use-command-center.ts line 208~230 — delegation 리스너]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- delegation-tracker.test.ts: 14/14 pass
- ws-handoff-channel.test.ts: 6/6 pass
- delegation-tracker-tea.test.ts: 24/24 pass (regression)
- delegation-security/chain-display/status: 60/60 pass (regression)
- tsc --noEmit: 0 errors

### Completion Notes List

- Engine Hook delegation-tracker emit format changed from flat `{ type, from, to, ... }` to wrapped `{ companyId, payload: { commandId, event, agentName, phase, elapsed, timestamp, companyId, data } }` structure
- This makes it compatible with the existing index.ts EventBus→WebSocket bridge (`broadcastToCompany(data.companyId, 'delegation', data.payload)`)
- SessionContext.sessionId maps to payload.commandId for frontend compatibility
- Elapsed time calculated from `ctx.startedAt` for accurate timing
- Hub SSE and WebSocket delegation channels already operate independently through the engine Hook pipeline — no hub.ts changes needed
- Frontend use-command-center.ts delegation listener already compatible with new payload shape — no frontend changes needed
- All 104 delegation-related tests pass (14 + 6 + 24 + 60)

### File List

- `packages/server/src/engine/hooks/delegation-tracker.ts` — **Modified** (emit payload wrapped in { companyId, payload } format)
- `packages/server/src/__tests__/unit/delegation-tracker.test.ts` — **Modified** (updated tests for new payload format, added 3 new tests, agentId field verification)
- `packages/server/src/__tests__/unit/ws-handoff-channel.test.ts` — **New** (6 tests for WebSocket handoff channel integration)
- `packages/server/src/__tests__/unit/ws-handoff-channel-tea.test.ts` — **New** (23 TEA risk-based tests: P0 bridge format + tenant isolation + source introspection, P1 concurrent sessions + data integrity, P2 edge cases)
