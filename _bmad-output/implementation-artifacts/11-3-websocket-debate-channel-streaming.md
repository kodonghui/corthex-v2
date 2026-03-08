# Story 11.3: WebSocket Debate 채널 스트리밍

Status: review

## Story

As a CEO/Human 직원,
I want AGORA 토론이 진행될 때 전용 'debate' WebSocket 채널로 실시간 이벤트(라운드 시작, 발언 전달, 반론, 합의 체크, 완료)를 스트리밍 받고, 특정 토론 ID로 구독/해제할 수 있으며, 토론 타임라인을 재생용으로 조회할 수 있도록,
so that AGORA UI(E11-S4)에서 토론 과정을 실시간으로 보여줄 수 있고, 토론 완료 후에도 타임라인 기반 리플레이가 가능하다.

## Acceptance Criteria

1. **debate 채널 구독**: 클라이언트가 `{ type: 'subscribe', channel: 'debate', params: { id: debateId } }` 전송 시 해당 토론의 실시간 이벤트를 수신할 수 있다. debateId는 UUID 형식이며, 같은 companyId의 토론만 구독 가능하다 (tenant 격리).
2. **debate 채널 구독 해제**: `{ type: 'unsubscribe', channel: 'debate', params: { id: debateId } }` 전송 시 해당 토론 이벤트 수신을 중단한다.
3. **round-started 이벤트**: 각 라운드 시작 시 `{ type: 'data', channel: 'debate', data: { event: 'round-started', debateId, roundNum, totalRounds, timestamp } }` 이벤트가 구독자에게 전송된다.
4. **speech-delivered 이벤트**: 각 에이전트 발언 완료 시 `{ type: 'data', channel: 'debate', data: { event: 'speech-delivered', debateId, roundNum, speech: { agentId, agentName, content, position }, timestamp } }` 이벤트가 전송된다.
5. **round-ended 이벤트**: 라운드의 모든 발언이 끝나면 `{ event: 'round-ended', debateId, roundNum, speechCount, timestamp }` 이벤트 전송.
6. **debate-completed 이벤트**: 합의 판정 완료 시 `{ event: 'debate-completed', debateId, result: { consensus, summary, majorityPosition, minorityPosition, keyArguments, roundCount }, timestamp }` 이벤트 전송.
7. **debate-failed 이벤트**: 토론 실패 시 `{ event: 'debate-failed', debateId, error, timestamp }` 이벤트 전송.
8. **타임라인 API**: `GET /api/workspace/debates/:id/timeline` 엔드포인트가 해당 토론의 모든 이벤트를 시간순으로 반환한다. 각 이벤트는 `{ event, debateId, data, timestamp }` 형태이다.
9. **이벤트 영속화**: 모든 debate 이벤트가 debates 테이블의 `timeline` JSON 필드에 순서대로 저장된다 (재생용).
10. **기존 eventBus debate 이벤트 통합**: AGORA 엔진의 기존 `emitDebateEvent`가 새 debate 채널로 올바르게 라우팅된다.
11. **tenant 격리**: 다른 companyId의 토론은 구독 불가 (403 FORBIDDEN).
12. **테스트 커버리지**: debate 채널 구독/해제, 각 이벤트 타입 발행, 타임라인 API, tenant 격리에 대한 테스트 90%+.

## Tasks / Subtasks

- [x] Task 1: debates 테이블에 timeline 컬럼 추가 (AC: #9)
  - [x] 1.1 `packages/server/src/db/schema.ts`에 debates 테이블 `timeline` jsonb 컬럼 추가 (기본값 `[]`)
  - [x] 1.2 마이그레이션 SQL 생성: `packages/server/src/db/migrations/0040_debate-timeline.sql`

- [x] Task 2: debate WebSocket 채널 구독 처리 (AC: #1, #2, #11)
  - [x] 2.1 `packages/server/src/ws/channels.ts` 수정: `case 'debate'` 핸들러 추가
  - [x] 2.2 구독 시 DB에서 debate.companyId 확인 → 클라이언트 companyId와 일치하는지 검증
  - [x] 2.3 구독키: `debate::${debateId}` 형태로 client.subscriptions에 추가
  - [x] 2.4 debate가 존재하지 않으면 FORBIDDEN 반환 (채널 패턴 통일)

- [x] Task 3: EventBus → WS debate 채널 브릿지 (AC: #3, #4, #5, #6, #7, #10)
  - [x] 3.1 `packages/server/src/index.ts`에 `eventBus.on('debate', ...)` 리스너 추가
  - [x] 3.2 debate 이벤트를 `broadcastToChannel('debate::${debateId}', payload)` 로 라우팅
  - [x] 3.3 debateId는 payload에서 추출 (emitDebateEvent에서 이미 포함)

- [x] Task 4: AGORA 엔진 emitDebateEvent 확장 (AC: #3, #4, #5, #6, #7, #9)
  - [x] 4.1 `packages/server/src/services/agora-engine.ts`의 `emitDebateEvent` 수정: debateId를 첫 인자로, payload에 자동 포함
  - [x] 4.2 각 이벤트에 timestamp 필드 추가
  - [x] 4.3 이벤트 발행 시 동시에 debates.timeline에 append (DB 업데이트)
  - [x] 4.4 기존 이벤트 타입 매핑:
    - `debate-started` → `debate-started` (이벤트에 totalRounds 추가)
    - `round-started` → `round-started` (totalRounds 추가)
    - `agent-spoke` → `speech-delivered` (이름 통일)
    - `round-ended` → `round-ended` (speechCount 추가)
    - `debate-done` → `debate-completed` (이름 통일)
  - [x] 4.5 새 이벤트 추가: `debate-failed` (handleDebateError에서 발행)

- [x] Task 5: 타임라인 API 엔드포인트 (AC: #8)
  - [x] 5.1 `packages/server/src/routes/workspace/debates.ts`에 `GET /:id/timeline` 추가
  - [x] 5.2 debates.timeline JSON 컬럼에서 이벤트 배열 반환
  - [x] 5.3 tenant 격리: companyId 필터 적용

- [x] Task 6: Shared 타입 확장 (AC: #3~#7)
  - [x] 6.1 `packages/shared/src/types.ts`에 DebateWsEvent union 타입 추가
  - [x] 6.2 각 이벤트 타입 정의: DebateStartedEvent, DebateRoundStartedEvent, DebateSpeechDeliveredEvent, DebateRoundEndedEvent, DebateCompletedEvent, DebateFailedEvent + DebateTimelineEntry

- [x] Task 7: 테스트 (AC: #12)
  - [x] 7.1 `packages/server/src/__tests__/unit/debate-ws-streaming.test.ts` 생성
  - [x] 7.2 debate 채널 구독/해제 테스트
  - [x] 7.3 각 이벤트 타입 발행 + 구독자 수신 테스트
  - [x] 7.4 타임라인 이벤트 순서 + 시간순 검증 테스트
  - [x] 7.5 tenant 격리 테스트 (다른 companyId 구독 불가)
  - [x] 7.6 debate 미존재 시 에러 테스트
  - [x] 7.7 emitDebateEvent → broadcastToChannel 통합 패턴 테스트

## Dev Notes

### Architecture Compliance

- **기존 패턴 준수**: EventBus → WS 브릿지 패턴은 `command`, `delegation`, `tool`, `cost` 채널과 동일. index.ts의 `eventBus.on(...)` → `broadcastToChannel()` 패턴을 그대로 따른다.
- **WsChannel 'debate' 이미 정의됨**: `packages/shared/src/types.ts`의 WsChannel union에 `'debate'`가 이미 포함되어 있으나, `packages/server/src/ws/channels.ts`의 switch문에 case가 없다. 이를 추가해야 한다.
- **기존 eventBus 'debate' 이벤트 확인**: AGORA 엔진(`agora-engine.ts`)의 `emitDebateEvent`가 이미 `eventBus.emit('debate', { companyId, payload })` 형태로 이벤트를 발행하고 있다. 이 이벤트를 WS로 라우팅하는 리스너만 추가하면 된다.
- **debate 채널은 debateId 기반 구독**: 다른 채널(command, delegation 등)은 companyId 기반 구독이지만, debate 채널은 특정 debateId를 구독하는 방식. chat-stream, messenger 채널과 유사한 패턴.

### 핵심 참조 파일

| 파일 | 역할 | 수정 여부 |
|------|------|----------|
| `packages/server/src/ws/channels.ts` | WS 채널 구독 핸들러 | **수정** (debate case 추가) |
| `packages/server/src/ws/server.ts` | WS 서버 + 클라이언트 관리 | 읽기 전용 |
| `packages/server/src/index.ts` | EventBus → WS 브릿지 | **수정** (debate 리스너 추가) |
| `packages/server/src/services/agora-engine.ts` | AGORA 엔진 + emitDebateEvent | **수정** (이벤트 확장 + 타임라인 저장) |
| `packages/server/src/routes/workspace/debates.ts` | 토론 API 라우트 | **수정** (timeline 엔드포인트 추가) |
| `packages/server/src/services/delegation-tracker.ts` | 위임 추적 이벤트 | 읽기 전용 (이미 debate 이벤트 있음) |
| `packages/server/src/lib/event-bus.ts` | EventBus 싱글턴 | 읽기 전용 |
| `packages/shared/src/types.ts` | 공유 타입 | **수정** (DebateWsEvent 타입 추가) |
| `packages/server/src/db/schema.ts` | DB 스키마 | **수정** (timeline 컬럼) |

### 기존 debate 이벤트 구조 (agora-engine.ts)

```typescript
// 현재 emitDebateEvent 구현:
function emitDebateEvent(companyId: string, eventType: string, payload: unknown): void {
  eventBus.emit('debate', { companyId, payload: { type: eventType, ...payload } })
}

// 발행 지점:
// 1. startDebate() → 'debate-started' { debateId, topic }
// 2. executeDebateRounds() → 'round-started' { debateId, roundNum }
// 3. executeDebateRounds() → 'agent-spoke' { debateId, roundNum, speech }
// 4. executeDebateRounds() → 'round-ended' { debateId, roundNum }
// 5. executeDebateRounds() → 'debate-done' { debateId, result }
```

### WS 채널 구독 패턴 (channels.ts 참조)

```typescript
// debate 채널은 chat-stream과 유사한 패턴 (ID 기반 구독 + 소유권 확인):
case 'debate': {
  if (!id) { ws.send(error('MISSING_PARAM')); return }
  // DB에서 debate 존재 + companyId 확인
  const debate = await db.select(...).from(debates).where(...)
  if (!debate || debate.companyId !== client.companyId) { ws.send(error('FORBIDDEN')); return }
  client.subscriptions.add(`debate::${id}`)
  break
}
```

### EventBus → WS 브릿지 패턴 (index.ts 참조)

```typescript
// 기존 패턴과 동일하지만, debate는 debateId 기반:
eventBus.on('debate', (data: { companyId: string; payload: unknown }) => {
  const payload = data.payload as { debateId?: string; type?: string }
  if (payload?.debateId) {
    broadcastToChannel(`debate::${payload.debateId}`, data.payload)
  }
})
```

### 타임라인 영속화 패턴

```typescript
// emitDebateEvent 수정: 이벤트 발행 시 동시에 timeline에 append
async function emitDebateEvent(debateId: string, companyId: string, eventType: string, payload: unknown): Promise<void> {
  const event = { event: eventType, debateId, ...payload, timestamp: new Date().toISOString() }
  eventBus.emit('debate', { companyId, payload: event })
  // timeline에 append (SQL jsonb_set 또는 read-modify-write)
  // 성능 고려: || '[]' fallback
}
```

### Project Structure Notes

- 파일명: kebab-case (예: `debate-ws-streaming.test.ts`)
- API 응답: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- 테스트: bun:test (`packages/server/src/__tests__/unit/`)
- import: `@corthex/shared` 패키지에서 공유 타입 import

### Previous Story Intelligence (11-1, 11-2)

- **11-1**: AGORA 엔진 코어 구현 완료. `createDebate`, `startDebate`, `executeDebateRounds`, `detectConsensus`, `emitDebateEvent` 모두 동작.
- **11-2**: 토론 명령 통합 완료. `debate-command-handler.ts`에서 `processDebateCommand`, `selectDebateParticipants`, `formatDebateReport` 구현. DelegationTracker에 토론 이벤트(debateStarted, debateRoundProgress, debateCompleted) 추가됨.
- **핵심 학습**: AGORA 엔진은 이미 `eventBus.emit('debate', ...)` 패턴으로 이벤트를 발행하지만, WS 채널로의 라우팅이 빠져있다. 이 스토리가 그 갭을 메운다.

### References

- [Source: packages/server/src/ws/channels.ts] - WS 채널 구독 핸들러 (debate case 미구현)
- [Source: packages/server/src/ws/server.ts] - WS 서버 구조 (clientMap, upgradeWebSocket)
- [Source: packages/server/src/index.ts:149-173] - EventBus → WS 브릿지 (debate 미등록)
- [Source: packages/server/src/services/agora-engine.ts:51-53] - emitDebateEvent 현재 구현
- [Source: packages/server/src/services/delegation-tracker.ts:159-172] - 토론 이벤트 (command 채널 사용)
- [Source: packages/shared/src/types.ts:445] - WsChannel에 'debate' 이미 포함
- [Source: _bmad-output/planning-artifacts/epics.md:1255] - E11-S3 정의 (2 SP)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- All 28 new tests pass (debate-ws-streaming.test.ts)
- All 49 AGORA engine tests pass (no regression)
- All 38 debate-command-handler tests pass (no regression)
- All 74 TEA tests pass (agora-engine-tea + debate-command-handler-tea)
- Shared package TypeScript compilation clean

### Completion Notes List

- emitDebateEvent 시그니처 변경: (companyId, type, payload) → (debateId, companyId, type, payload)
- 이벤트 이름 통일: agent-spoke → speech-delivered, debate-done → debate-completed
- handleDebateError에 companyId 파라미터 추가 (debate-failed 이벤트 발행용)
- debate 채널 구독은 chat-stream/messenger와 동일한 ID 기반 구독 패턴 사용
- EventBus → WS 브릿지에서 debateId 기반 broadcastToChannel 라우팅 (companyId 기반 broadcastToCompany 아님)
- 타임라인 영속화: emitDebateEvent 호출 시 debates.timeline jsonb에 자동 append

### File List

- `packages/server/src/db/schema.ts` (수정: debates 테이블에 timeline jsonb 컬럼 추가)
- `packages/server/src/db/migrations/0040_debate-timeline.sql` (신규: 마이그레이션)
- `packages/server/src/ws/channels.ts` (수정: debate case 추가, debates import 추가)
- `packages/server/src/index.ts` (수정: eventBus.on('debate') 리스너 + broadcastToChannel import)
- `packages/server/src/services/agora-engine.ts` (수정: emitDebateEvent 확장, 이벤트 이름 통일, 타임라인 영속화, handleDebateError 확장)
- `packages/server/src/routes/workspace/debates.ts` (수정: GET /:id/timeline 엔드포인트 추가)
- `packages/shared/src/types.ts` (수정: DebateWsEvent 타입 6종 + DebateTimelineEntry 추가)
- `packages/server/src/__tests__/unit/debate-ws-streaming.test.ts` (신규: 28 tests)
