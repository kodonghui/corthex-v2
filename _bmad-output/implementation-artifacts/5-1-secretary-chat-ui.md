# Story 5.1: Secretary Chat UI — 비서 실시간 위임 체인 UI

Status: review

## Story

As a 일반 직원(유저),
I want 비서 에이전트와 대화할 때 위임 진행 상황이 실시간으로 표시된다,
so that 비서가 어떤 부서에 업무를 맡기고 있는지 즉시 파악하고, 결과를 기다리는 동안 진행 상황을 확인할 수 있다.

## Acceptance Criteria

1. **Given** 비서에게 메시지 전송 **When** 비서가 부서 에이전트에 위임 시작 **Then** 채팅 헤더에 "금융분석팀장에게 위임 중..." 실시간 표시
2. **Given** 비서 위임 진행 중 **When** 위임이 완료/실패 **Then** 헤더가 원래 비서 단독 표시로 복귀
3. **Given** 비서 응답 완료 **When** 위임 내역 패널 클릭 **Then** 각 위임의 상태(완료/실패/처리중), 지시사항, 응답이 실시간 갱신됨
4. **Given** 비서 위임 진행 중 **When** 스트리밍 대기 UI **Then** "부서 위임 중..." + 현재 위임 대상 에이전트 이름 표시
5. **Given** 위임 실패 **When** 에러 발생 **Then** 헤더에 에러 표시 + 위임 내역에 실패 상태 반영

## Tasks / Subtasks

- [x] Task 1: 서버 — 오케스트레이터에 WebSocket 이벤트 추가 (AC: #1, #2, #5)
  - [x] `orchestrateSecretary()` 에 `onEvent` 콜백 추가 (delegation-start, delegation-end 이벤트)
  - [x] 각 위임 시작 시 `broadcastToChannel(channelKey, { type: 'delegation-start', targetAgentName, targetAgentId })` 발송
  - [x] 각 위임 완료/실패 시 `broadcastToChannel(channelKey, { type: 'delegation-end', targetAgentName, status, durationMs })` 발송
  - [x] chat.ts `streamTask` 에서 오케스트레이터 onEvent 콜백 연결
- [x] Task 2: 서버 — 비서 응답도 스트리밍 지원 (AC: #4)
  - [x] `compileReport()` 를 스트리밍 방식으로 변경 — 최종 보고서 생성 시 토큰 단위 브로드캐스트
  - [x] 비서 직접 응답(directResponse)도 스트리밍으로 전환하지 않음 (짧은 응답이므로 한번에 전송 유지)
- [x] Task 3: 프론트엔드 — use-chat-stream 훅 위임 이벤트 처리 (AC: #1, #2)
  - [x] `use-chat-stream.ts` 에 `delegationStatus` 상태 추가: `{ targetAgentName: string; status: 'delegating' | 'done' } | null`
  - [x] WS 이벤트 `delegation-start` → delegationStatus 업데이트
  - [x] WS 이벤트 `delegation-end` → delegationStatus 초기화 또는 완료 표시
- [x] Task 4: 프론트엔드 — 채팅 헤더 위임 체인 표시 (AC: #1, #2)
  - [x] `chat-area.tsx` 헤더에 delegationStatus 표시: "→ {targetAgentName}에게 위임 중..."
  - [x] 위임 완료 시 자연스럽게 사라짐
- [x] Task 5: 프론트엔드 — 위임 내역 패널 실시간 갱신 (AC: #3)
  - [x] 위임 이벤트 수신 시 delegations 쿼리 invalidate → 실시간 갱신
  - [x] 위임 카드에 duration 표시 추가
- [x] Task 6: 빌드 + 기존 테스트 통과 확인
  - [x] `turbo build` 3/3 성공
  - [x] `bun test src/__tests__/unit/` 139 pass, 0 fail

## Dev Notes

### 핵심: 오케스트레이터에 실시간 이벤트 추가

현재 `orchestrateSecretary()`는 완전 동기식 — 모든 위임이 끝나야 한 번에 응답을 반환합니다. 이 스토리에서는 **위임 진행 중 WebSocket 이벤트**를 추가하여 사용자에게 실시간 피드백을 제공합니다.

### 현재 코드베이스 상태

**이미 존재하는 것:**
- `packages/server/src/lib/orchestrator.ts` — `orchestrateSecretary()` (269줄, 동기 방식)
- `packages/server/src/routes/workspace/chat.ts:186-199` — 비서 분기 (broadcastToChannel 사용)
- `packages/server/src/ws/channels.ts` — `broadcastToChannel(channelKey, data)` 유틸
- `packages/app/src/hooks/use-chat-stream.ts` — WS 이벤트 처리 훅 (token, tool-start, tool-end, done, error)
- `packages/app/src/components/chat/chat-area.tsx` — 위임 내역 패널 (delegationsData 쿼리)
- `packages/app/src/components/chat/types.ts` — Agent, Delegation 타입 정의

**기존 WS 이벤트 타입 (StreamEvent in ai.ts:195-200):**
```typescript
export type StreamEvent =
  | { type: 'token'; content: string }
  | { type: 'tool-start'; toolName: string; toolId: string; input?: string }
  | { type: 'tool-end'; toolName: string; toolId: string; result: string; durationMs?: number; error?: boolean }
  | { type: 'done'; sessionId: string }
  | { type: 'error'; code: string; message: string }
```

### Task 1: 오케스트레이터 이벤트 콜백

**변경: `packages/server/src/lib/orchestrator.ts`**

`orchestrateSecretary()` 시그니처에 `onEvent` 콜백 추가:

```typescript
type OrchestrateEvent =
  | { type: 'delegation-start'; targetAgentName: string; targetAgentId: string }
  | { type: 'delegation-end'; targetAgentName: string; targetAgentId: string; status: 'completed' | 'failed'; durationMs: number }

export async function orchestrateSecretary(
  ctx: OrchestrateContext,
  onEvent?: (event: OrchestrateEvent) => void,
): Promise<string> {
```

각 위임 직전/직후에 이벤트 발송:
```typescript
// 위임 시작 시
onEvent?.({ type: 'delegation-start', targetAgentName: targetInfo.agentName, targetAgentId: targetInfo.agentId })

// 위임 완료/실패 시
onEvent?.({ type: 'delegation-end', targetAgentName: targetInfo.agentName, targetAgentId: targetInfo.agentId, status: 'completed', durationMs })
```

**변경: `packages/server/src/routes/workspace/chat.ts`**

`streamTask` 에서 onEvent 콜백 연결:
```typescript
if (agent?.isSecretary) {
  aiContent = await orchestrateSecretary(
    { secretaryAgentId: session.agentId, ...chatCtx },
    (event) => broadcastToChannel(channelKey, event),
  )
  broadcastToChannel(channelKey, { type: 'token', content: aiContent })
  broadcastToChannel(channelKey, { type: 'done', sessionId })
}
```

### Task 2: 비서 최종 보고서 스트리밍

`compileReport()` 를 스트리밍 버전으로 변경:

```typescript
async function compileReportStream(
  client: Anthropic,
  userMessage: string,
  results: { departmentName: string; agentName: string; response: string }[],
  onToken: (text: string) => void,
): Promise<string> {
  // client.messages.stream() 사용
  const stream = client.messages.stream({ ... })
  let fullText = ''
  stream.on('text', (text) => { fullText += text; onToken(text) })
  await stream.finalMessage()
  return fullText
}
```

`orchestrateSecretary` 에서 호출:
```typescript
// onToken 콜백 추가
export async function orchestrateSecretary(
  ctx: OrchestrateContext,
  onEvent?: (event: OrchestrateEvent | StreamEvent) => void,
): Promise<string> {
```

단일 위임 결과도 토큰 단위로 방송하지 않고 한 번에 전송 (이미 `broadcastToChannel(channelKey, { type: 'token', content: aiContent })` 패턴 사용 중).

### Task 3: use-chat-stream 훅 확장

**변경: `packages/app/src/hooks/use-chat-stream.ts`**

```typescript
// 새 상태 추가
const [delegationStatus, setDelegationStatus] = useState<{
  targetAgentName: string
  status: 'delegating' | 'done'
} | null>(null)

// WS 이벤트 핸들러에 추가
case 'delegation-start':
  setDelegationStatus({ targetAgentName: payload.targetAgentName, status: 'delegating' })
  break
case 'delegation-end':
  setDelegationStatus(null)
  break
```

반환값에 `delegationStatus` 추가.

### Task 4: 채팅 헤더 위임 표시

**변경: `packages/app/src/components/chat/chat-area.tsx`**

헤더 영역 (라인 233-243 근처):
```tsx
<p className="text-xs text-zinc-400">
  {delegationStatus?.status === 'delegating' ? (
    <span className="text-indigo-500 dark:text-indigo-400 animate-pulse">
      → {delegationStatus.targetAgentName}에게 위임 중...
    </span>
  ) : (
    agent.role
  )}
</p>
```

### Task 5: 위임 내역 실시간 갱신

위임 이벤트 수신 시 delegations 쿼리 invalidate:
```typescript
// use-chat-stream.ts 에서
case 'delegation-end':
  queryClient.invalidateQueries({ queryKey: ['delegations', sessionId] })
  break
```

또는 chat-area.tsx 에서 `delegationStatus` 변경 시 effect로 invalidate.

### 기존 코드 위치

| 파일 | 라인 | 내용 |
|------|------|------|
| `packages/server/src/lib/orchestrator.ts` | 143-268 | orchestrateSecretary 메인 함수 |
| `packages/server/src/routes/workspace/chat.ts` | 186-199 | 비서/일반 분기 |
| `packages/server/src/ws/channels.ts` | 105-118 | broadcastToChannel |
| `packages/app/src/hooks/use-chat-stream.ts` | 전체 | WS 스트림 훅 |
| `packages/app/src/components/chat/chat-area.tsx` | 222-253 | 헤더 + 위임 패널 토글 |
| `packages/app/src/components/chat/chat-area.tsx` | 256-297 | 위임 내역 패널 |
| `packages/app/src/components/chat/types.ts` | 전체 | Agent, Delegation 타입 |
| `packages/server/src/lib/ai.ts` | 195-200 | StreamEvent 타입 정의 |

### Project Structure Notes

```
packages/server/src/
├── lib/
│   ├── orchestrator.ts      ← onEvent 콜백 추가
│   └── ai.ts                ← StreamEvent 타입에 delegation 이벤트 추가
├── routes/workspace/
│   └── chat.ts              ← streamTask에서 onEvent 연결
└── ws/channels.ts           ← 변경 없음 (기존 broadcastToChannel 활용)

packages/app/src/
├── hooks/
│   └── use-chat-stream.ts   ← delegationStatus 상태 + 이벤트 처리
└── components/chat/
    ├── chat-area.tsx         ← 헤더 위임 체인 표시 + 패널 실시간 갱신
    └── types.ts              ← DelegationEvent 타입 추가 (필요시)
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:793-832] — 위임 체인 헤더 + WebSocket 이벤트 매핑
- [Source: packages/server/src/lib/orchestrator.ts:143-268] — orchestrateSecretary 전체
- [Source: packages/server/src/routes/workspace/chat.ts:186-199] — 비서 분기
- [Source: packages/app/src/components/chat/chat-area.tsx:222-297] — 헤더 + 위임 패널
- [Source: packages/app/src/hooks/use-chat-stream.ts] — WS 스트림 훅

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- orchestrateSecretary()에 onEvent 콜백 추가: delegation-start/end 이벤트 실시간 발송
- compileReport()를 스트리밍 방식으로 변경 (client.messages.stream)
- chat.ts streamTask에서 onEvent 콜백으로 broadcastToChannel 연결
- 복수 위임 시 토큰 스트리밍 중복 방송 방지 (hasStreamedTokens 플래그)
- use-chat-stream.ts에 delegationStatus 상태 + delegation-start/end 이벤트 처리 추가
- done/error 이벤트 시 delegationStatus 초기화
- delegation-end 시 delegations 쿼리 invalidate로 실시간 갱신
- 채팅 헤더에 위임 중인 에이전트 이름 실시간 표시 (animate-pulse)
- 스트리밍 대기 UI에 현재 위임 대상 이름 표시
- 위임 카드에 소요 시간(초) 표시 추가
- turbo build 3/3 성공, bun test 139 pass / 0 fail

### File List

- packages/server/src/lib/orchestrator.ts — OrchestrateEvent 타입 + onEvent 콜백 + compileReport 스트리밍
- packages/server/src/routes/workspace/chat.ts — 비서 streamTask onEvent 연결 + 중복 방송 방지
- packages/app/src/hooks/use-chat-stream.ts — DelegationStatus 타입 + delegation 이벤트 처리
- packages/app/src/components/chat/chat-area.tsx — 헤더 위임 표시 + 대기 UI + 위임 카드 duration
