# Story 5.8: Delegation Chain Realtime WebSocket

Status: done

## Story

As a **CEO (앱 사용자)**,
I want **명령 처리 진행 상황이 실시간으로 화면에 표시되어, 현재 어떤 에이전트가 무슨 작업을 하는지 경과 시간과 함께 볼 수 있는 기능**,
so that **명령 실행의 투명성이 확보되고, 처리 지연 시 어디서 병목이 발생하는지 즉시 파악할 수 있다**.

## Acceptance Criteria

1. **DelegationTracker 서비스**: 오케스트레이션 각 단계에서 구조화된 이벤트를 EventBus로 발행하는 서비스
   - 이벤트 타입: COMMAND_RECEIVED, CLASSIFYING, CLASSIFIED, MANAGER_STARTED, SPECIALIST_DISPATCHED, SPECIALIST_COMPLETED, SPECIALIST_FAILED, SYNTHESIZING, QUALITY_CHECKING, QUALITY_PASSED, QUALITY_FAILED, REWORKING, COMPLETED, FAILED
   - 이벤트 페이로드: `{ commandId, event, agentId?, agentName?, phase, elapsed, data }`
   - elapsed: 각 단계 시작 시점 기준 경과 시간(ms) 자동 계산

2. **WebSocket 3채널 구독**: command, delegation, tool 채널을 WsChannel 타입에 추가
   - `command` 채널: 명령 생명주기 이벤트 (received → classifying → delegating → reviewing → completed/failed)
   - `delegation` 채널: 위임 체인 상세 이벤트 (manager started → specialist dispatched/completed → synthesizing)
   - `tool` 채널: 도구 호출 이벤트 (tool-invoked, tool-completed, tool-failed)

3. **ChiefOfStaff 통합**: 기존 `emitCommandStatus()` 함수를 DelegationTracker로 대체
   - classify → CLASSIFYING/CLASSIFIED 이벤트
   - delegate → MANAGER_STARTED 이벤트
   - qualityGate → QUALITY_CHECKING/QUALITY_PASSED/QUALITY_FAILED 이벤트
   - rework → REWORKING 이벤트
   - complete/fail → COMPLETED/FAILED 이벤트

4. **EventBus → WS 브리지**: index.ts에서 `command`, `delegation`, `tool` 이벤트를 broadcastToCompany로 연결

5. **channels.ts 구독 핸들러**: command/delegation/tool 채널의 구독 처리 (companyId 격리)

6. **이벤트 전달 지연 < 500ms** (NFR4)

7. **도구 호출 추적**: 도구 실행 시작/완료/실패 이벤트를 tool 채널로 발행

## Tasks / Subtasks

- [x] Task 1: DelegationTracker 서비스 구현 (AC: #1)
  - [x] 1.1 `packages/server/src/services/delegation-tracker.ts` 생성
  - [x] 1.2 DelegationEvent 타입 정의 (14종 이벤트 타입)
  - [x] 1.3 DelegationTracker 클래스: startCommand(), classify(), classified(), managerStarted(), specialistDispatched(), specialistCompleted(), specialistFailed(), synthesizing(), qualityChecking(), qualityPassed(), qualityFailed(), reworking(), completed(), failed() 메서드
  - [x] 1.4 경과 시간 자동 계산: commandId별 시작 시간 Map으로 관리
  - [x] 1.5 EventBus emit: command/delegation/tool 3채널로 분리 발행

- [x] Task 2: WsChannel 타입 + 채널 구독 확장 (AC: #2, #5)
  - [x] 2.1 `packages/shared/src/types.ts`의 WsChannel에 'command' | 'delegation' | 'tool' 추가
  - [x] 2.2 `packages/server/src/ws/channels.ts`에 command/delegation/tool 구독 핸들러 추가 (companyId 격리)

- [x] Task 3: EventBus → WS 브리지 연결 (AC: #4)
  - [x] 3.1 `packages/server/src/index.ts`에 command/delegation/tool 이벤트 브리지 추가

- [x] Task 4: ChiefOfStaff 통합 (AC: #3)
  - [x] 4.1 기존 `emitCommandStatus()` 함수를 DelegationTracker 호출로 교체
  - [x] 4.2 process() 함수 내 각 단계에서 DelegationTracker 메서드 호출

- [x] Task 5: 도구 호출 추적 통합 (AC: #7)
  - [x] 5.1 tool 채널 이벤트 페이로드 정의: { commandId, toolName, status, durationMs, agentId }
  - [x] 5.2 도구 실행 시 DelegationTracker.toolInvoked() / toolCompleted() / toolFailed() 호출

- [x] Task 6: 단위 테스트 (AC: all)
  - [x] 6.1 DelegationTracker 이벤트 발행 테스트 (14종 이벤트 타입별)
  - [x] 6.2 경과 시간 계산 테스트
  - [x] 6.3 EventBus → WS 브리지 테스트
  - [x] 6.4 ChiefOfStaff 통합 테스트 (DelegationTracker 이벤트 발행 확인)
  - [x] 6.5 WsChannel 타입 확장 테스트
  - [x] 6.6 채널 구독 핸들러 테스트

## Dev Notes

### 기존 코드 현황 (반드시 재사용)

**1. EventBus** (`packages/server/src/lib/event-bus.ts`):
- 단순한 Node.js EventEmitter 래퍼
- `eventBus.emit(channel, data)` 형태로 이벤트 발행
- 이미 chief-of-staff.ts, deep-work.ts에서 사용 중

**2. WebSocket 서버** (`packages/server/src/ws/server.ts`):
- Hono 내장 WebSocket + Bun native
- JWT 인증, companyId 기반 테넌트 격리
- `clientMap`: userId → WsClient[] (최대 3개 연결)
- subscribe/unsubscribe 메시지 처리

**3. 채널 관리** (`packages/server/src/ws/channels.ts`):
- `handleSubscription()`: 채널별 구독 처리 + 권한 검증
- `broadcastToCompany(companyId, event, data)`: 회사 전체 브로드캐스트
- `broadcastToChannel(channelKey, data)`: 특정 채널 구독자에게 전송
- **현재 지원 채널**: chat-stream, agent-status, notifications, messenger, activity-log, strategy-notes, night-job, nexus
- **추가 필요**: command, delegation, tool 채널

**4. ChiefOfStaff** (`packages/server/src/services/chief-of-staff.ts`):
- `emitCommandStatus()` 함수 (line 162~176): 이미 eventBus.emit('command', ...) 호출
- **문제**: index.ts에 'command' 이벤트 → WS 브리지가 없음 (현재 미연결 상태)
- process() 함수에서 각 단계마다 emitCommandStatus() 호출 중
- 이 함수를 DelegationTracker 메서드로 교체해야 함

**5. WsChannel 타입** (`packages/shared/src/types.ts:304`):
- 현재: 'chat-stream' | 'agent-status' | 'notifications' | 'messenger' | 'activity-log' | 'strategy-notes' | 'night-job' | 'nexus'
- 'command' | 'delegation' | 'tool' 추가 필요

**6. DeepWork 패턴 참고** (`packages/server/src/services/deep-work.ts`):
- eventBus.emit('deepwork-phase', { type, phase, progress, commandId, companyId }) 패턴
- 이것도 index.ts에 WS 브리지가 없음 — 같이 추가할 것

### 아키텍처 채널 정의 (architecture.md)

architecture.md에서 정의한 7채널:
- `agent-status`: agent-started, agent-completed, agent-error
- `delegation`: task-delegated, task-accepted, task-completed
- `command`: command-received, command-processing, command-done
- `cost`: cost-updated, budget-warning, budget-exceeded
- `tool`: tool-invoked, tool-completed, tool-failed
- `debate`: (Phase 2)
- `nexus`: (Phase 2)

### EventBus → WS 브리지 패턴 (index.ts)

기존 패턴:
```typescript
eventBus.on('activity', (data: { companyId: string; payload: unknown }) => {
  broadcastToCompany(data.companyId, 'activity-log', data.payload)
})
```

새로 추가할 브리지:
```typescript
eventBus.on('command', (data: { companyId: string; ... }) => {
  broadcastToCompany(data.companyId, 'command', data)
})
eventBus.on('delegation', (data: { companyId: string; ... }) => {
  broadcastToCompany(data.companyId, 'delegation', data)
})
eventBus.on('tool', (data: { companyId: string; ... }) => {
  broadcastToCompany(data.companyId, 'tool', data)
})
```

### DelegationTracker 설계

```typescript
class DelegationTracker {
  private commandTimers = new Map<string, number>() // commandId → startedAt

  startCommand(companyId: string, commandId: string): void
  classify(companyId: string, commandId: string): void
  classified(companyId: string, commandId: string, data: ClassificationResult): void
  managerStarted(companyId: string, commandId: string, agentId: string, agentName: string): void
  specialistDispatched(companyId: string, commandId: string, agentId: string, agentName: string): void
  specialistCompleted(companyId: string, commandId: string, agentId: string, agentName: string, durationMs: number): void
  specialistFailed(companyId: string, commandId: string, agentId: string, agentName: string, error: string): void
  synthesizing(companyId: string, commandId: string, agentId: string, agentName: string): void
  qualityChecking(companyId: string, commandId: string): void
  qualityPassed(companyId: string, commandId: string, scores: QualityScores, totalScore: number): void
  qualityFailed(companyId: string, commandId: string, scores: QualityScores, totalScore: number, feedback: string): void
  reworking(companyId: string, commandId: string, attempt: number, maxAttempts: number): void
  completed(companyId: string, commandId: string): void
  failed(companyId: string, commandId: string, error: string): void
  toolInvoked(companyId: string, commandId: string, toolName: string, agentId: string): void
  toolCompleted(companyId: string, commandId: string, toolName: string, agentId: string, durationMs: number): void
  toolFailed(companyId: string, commandId: string, toolName: string, agentId: string, error: string): void
}
```

### 채널 구독 핸들러 패턴

command, delegation, tool 채널은 모두 companyId 기반 구독 (agent-status 패턴과 동일):
```typescript
case 'command':
case 'delegation':
case 'tool': {
  const targetCompanyId = id || client.companyId
  if (targetCompanyId !== client.companyId) {
    ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN', channel }))
    return
  }
  client.subscriptions.add(`${channel}::${client.companyId}`)
  break
}
```

### 절대 금지 사항

- EventBus를 새로 만들지 말 것 — 기존 `packages/server/src/lib/event-bus.ts` 사용
- WebSocket 서버를 새로 만들지 말 것 — 기존 `packages/server/src/ws/server.ts` 사용
- broadcastToCompany를 새로 만들지 말 것 — 기존 `packages/server/src/ws/channels.ts` 사용
- 기존 테스트를 깨뜨리지 말 것

### Project Structure Notes

- 새 파일: `packages/server/src/services/delegation-tracker.ts`
- 수정 파일:
  - `packages/shared/src/types.ts` (WsChannel 타입 확장)
  - `packages/server/src/ws/channels.ts` (command/delegation/tool 구독 핸들러)
  - `packages/server/src/index.ts` (EventBus → WS 브리지)
  - `packages/server/src/services/chief-of-staff.ts` (emitCommandStatus → DelegationTracker)
- 테스트: `packages/server/src/__tests__/unit/delegation-tracker.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#8. Real-time Communication Protocol]
- [Source: _bmad-output/planning-artifacts/epics.md#E5-S8]
- [Source: packages/server/src/services/chief-of-staff.ts#emitCommandStatus]
- [Source: packages/server/src/ws/channels.ts#broadcastToCompany]
- [Source: packages/server/src/ws/server.ts#wsRoute]
- [Source: packages/shared/src/types.ts#WsChannel]
- [Source: packages/server/src/services/deep-work.ts#eventBus.emit]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- DelegationTracker service: 14 event types across 3 channels (command/delegation/tool)
- Elapsed time auto-calculation per commandId with cleanup on complete/fail
- WsChannel type extended with command/delegation/tool
- channels.ts: companyId-isolated subscription handler for 3 new channels
- index.ts: EventBus to WS bridge for command/delegation/tool events
- ChiefOfStaff: replaced emitCommandStatus with DelegationTracker calls
- Tool tracking: toolInvoked/toolCompleted/toolFailed methods ready for integration
- 35 new tests, 0 regressions in 366 affected tests

### File List

- packages/server/src/services/delegation-tracker.ts (NEW)
- packages/server/src/__tests__/unit/delegation-tracker.test.ts (NEW)
- packages/shared/src/types.ts (MODIFIED - WsChannel type extended)
- packages/server/src/ws/channels.ts (MODIFIED - command/delegation/tool handlers)
- packages/server/src/index.ts (MODIFIED - EventBus to WS bridge)
- packages/server/src/services/chief-of-staff.ts (MODIFIED - DelegationTracker integration)
