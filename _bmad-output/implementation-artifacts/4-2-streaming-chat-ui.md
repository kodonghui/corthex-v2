# Story 4.2: Streaming Chat UI

Status: done

## Story

As a 일반 직원(유저),
I want AI 에이전트의 응답이 실시간으로 한 글자씩 표시되고, 도구 사용 상태를 시각적으로 확인할 수 있다,
so that 응답을 기다리는 동안 진행 상황을 알 수 있고, 필요 시 응답을 중단할 수 있다.

## Acceptance Criteria

1. **Given** 메시지 전송 **When** AI가 응답 생성 중 **Then** 텍스트가 한 글자씩 실시간으로 표시되며 커서(▌) 깜빡임
2. **Given** 스트리밍 중 **When** 전송 버튼 영역 **Then** `■ 중지` 버튼으로 변경, 입력 비활성화
3. **Given** 스트리밍 중 **When** `■ 중지` 클릭 **Then** 스트리밍 즉시 중단, 현재까지 수신된 텍스트 유지
4. **Given** AI가 도구 사용 시작 **When** `tool-start` 이벤트 수신 **Then** 도구 카드 표시: `⏳ {tool_name} 실행 중...` (pulse 애니메이션)
5. **Given** 도구 사용 완료 **When** `tool-end` 이벤트 수신 **Then** 카드 업데이트: `✅ {tool_name}` (접힌 상태, 클릭 시 상세 표시)
6. **Given** 응답 완료 **When** `done` 이벤트 수신 **Then** 커서 사라짐, 메시지 확정, 세션 제목 서버 요약으로 업데이트
7. **Given** 응답 중 오류 **When** `error` 이벤트 수신 **Then** 에이전트 버블로 `❌ 응답 중 오류가 발생했습니다` + `[다시 시도]` 버튼, 이전 스트리밍 내용 유지
8. **Given** WebSocket 연결 끊김 **When** 채팅 중 **Then** 상단 배너: `⚠️ 연결이 끊겼습니다. 재연결 중...`
9. **Given** WebSocket 재연결 성공 **When** 복구 **Then** `⚡ 연결 복구됨` 배너 2초 후 자동 사라짐

## Tasks / Subtasks

- [x] Task 1: 서버 — Anthropic Streaming API + WebSocket 브로드캐스트 (AC: #1, #4, #5, #6, #7)
  - [x] ai.ts에 `generateAgentResponseStream(ctx, onEvent)` 함수 추가 — `client.messages.stream()` 사용
  - [x] 스트리밍 이벤트 발생 시 `broadcastToChannel('chat-stream::sessionId', event)` 호출
  - [x] 이벤트 타입: `{ type: 'token', content: string }`, `{ type: 'tool-start', toolName: string, toolId: string }`, `{ type: 'tool-end', toolName: string, toolId: string, result: string }`, `{ type: 'done', sessionId: string }`, `{ type: 'error', code: string, message: string }`
  - [x] 도구 루프: tool_use 블록 수신 시 tool-start → executeTool → tool-end → 다음 라운드 계속
  - [x] 세션 제목 요약: done 이벤트 시 첫 응답이면 서버에서 키워드 추출(20자 이내) 후 세션 title 업데이트
- [x] Task 2: 서버 — POST /messages 엔드포인트 비동기화 (AC: #1)
  - [x] 유저 메시지 저장 후 즉시 `{ data: { userMessage } }` 반환 (에이전트 응답 기다리지 않음)
  - [x] 백그라운드에서 `generateAgentResponseStream` 실행, 완료 시 에이전트 메시지 DB 저장
  - [x] 에러 시 error 이벤트 브로드캐스트 + DB에 에러 메시지 저장
- [x] Task 3: 프론트엔드 — ws-store 스트리밍 이벤트 핸들러 (AC: #1, #8, #9)
  - [x] ws-store.ts의 onmessage에 chat-stream 채널 이벤트 디스패치 추가
  - [x] useChatStream 커스텀 훅: 세션 구독/해제, 스트리밍 상태 관리(streamingText, isStreaming, toolCalls)
  - [x] 연결 상태 배너: isConnected false → "연결이 끊겼습니다" 배너, 재연결 성공 → "연결 복구됨" 2초 자동 사라짐
- [x] Task 4: 프론트엔드 — ChatArea 스트리밍 UI (AC: #1, #2, #3, #6, #7)
  - [x] 스트리밍 메시지 버블: 실시간 텍스트 + 커서(▌) 깜빡임
  - [x] 전송 버튼 → `■ 중지` 버튼 전환 (스트리밍 중), 입력 비활성화
  - [x] 중지 클릭 시 서버에 stop 이벤트 전송 + 로컬 스트리밍 중단 + 현재 텍스트 유지
  - [x] done 이벤트 수신 → 메시지 확정 + react-query invalidate (세션 목록 + 메시지)
  - [x] error 이벤트 수신 → 에러 버블 + "다시 시도" 버튼
- [x] Task 5: 프론트엔드 — ToolCallCard 컴포넌트 (AC: #4, #5)
  - [x] tool-start: `⏳ {toolName} 실행 중...` + pulse 애니메이션 카드
  - [x] tool-end: `✅ {toolName}` + 접기/펼치기 토글 (▸/▾), 펼치면 도구 결과 표시
  - [x] 카드 스타일: `border rounded-lg p-3`, 에이전트 버블 안에 인라인 표시
- [x] Task 6: 빌드 + 기존 테스트 통과 확인
  - [x] `turbo build` 3/3 성공
  - [x] `bun test src/__tests__/unit/` 전체 통과

## Dev Notes

### 핵심: REST 기반 동기 응답 → WebSocket 스트리밍으로 전환

현재 POST /sessions/:id/messages는 AI 응답 완료까지 블로킹 후 전체 텍스트를 한번에 반환. 이를 비동기 스트리밍으로 전환해야 함.

### 현재 흐름 (변경 전)

```
유저 → POST /messages (content) → 서버: generateAgentResponse() 블로킹(수초~수십초)
→ { userMessage, agentMessage } 반환 → 프론트: 전체 메시지 표시
```

### 변경 후 흐름

```
유저 → POST /messages (content) → 서버: 유저 메시지 저장 → 즉시 { userMessage } 반환
→ 서버 백그라운드: generateAgentResponseStream() 시작
  → WS: { type: 'token', content: '안' }
  → WS: { type: 'token', content: '녕' }
  → WS: { type: 'tool-start', toolName: 'search_web', toolId: 'xxx' }
  → WS: { type: 'tool-end', toolName: 'search_web', toolId: 'xxx', result: '15건' }
  → WS: { type: 'token', content: '검' }
  → ...
  → WS: { type: 'done', sessionId: 'xxx' }
→ 서버: 전체 에이전트 메시지 DB 저장
→ 프론트: react-query invalidate → 확정된 메시지로 교체
```

### Anthropic Streaming API

```typescript
const stream = client.messages.stream({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 2048,
  system: systemPrompt,
  messages,
  tools: claudeTools,
})

// 이벤트 핸들러
stream.on('text', (text) => {
  broadcastToChannel(`chat-stream::${sessionId}`, { type: 'token', content: text })
})

stream.on('contentBlock', (block) => {
  if (block.type === 'tool_use') {
    broadcastToChannel(`chat-stream::${sessionId}`, { type: 'tool-start', toolName: block.name, toolId: block.id })
  }
})

const finalMessage = await stream.finalMessage()
```

### 도구 루프 + 스트리밍 병행

```
라운드 1: messages.stream() → token 이벤트들... → tool_use 감지
  → tool-start 브로드캐스트
  → executeTool() 실행
  → tool-end 브로드캐스트
  → tool_result를 messages에 추가
라운드 2: messages.stream() → token 이벤트들... → stop_reason='end_turn'
  → done 브로드캐스트
```

### useChatStream 커스텀 훅 설계

```typescript
function useChatStream(sessionId: string | null) {
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    // WS 구독: chat-stream 채널
    wsStore.subscribe('chat-stream', { id: sessionId })

    // 이벤트 리스너 등록
    const handler = (event: StreamEvent) => {
      switch (event.type) {
        case 'token': setStreamingText(prev => prev + event.content); break
        case 'tool-start': setToolCalls(prev => [...prev, { ...event, status: 'running' }]); break
        case 'tool-end': setToolCalls(prev => prev.map(t => t.toolId === event.toolId ? { ...t, status: 'done', result: event.result } : t)); break
        case 'done': setIsStreaming(false); /* invalidate queries */; break
        case 'error': setError(event.message); setIsStreaming(false); break
      }
    }

    return () => { /* unsubscribe */ }
  }, [sessionId])

  return { streamingText, isStreaming, toolCalls, error, startStream, stopStream }
}
```

### ws-store 이벤트 디스패치 패턴

현재 ws-store.ts의 onmessage는 server-restart만 처리. chat-stream 데이터를 구독 컴포넌트에 전달하려면 이벤트 리스너 패턴 추가 필요:

```typescript
// ws-store.ts에 추가
type WsEventListener = (data: unknown) => void
const listeners = new Map<string, Set<WsEventListener>>()

addListener: (channelKey: string, fn: WsEventListener) => { ... }
removeListener: (channelKey: string, fn: WsEventListener) => { ... }

// onmessage에서:
if (msg.type === 'data' && msg.channel) {
  const channelListeners = listeners.get(msg.channel) || new Set()
  channelListeners.forEach(fn => fn(msg.data))
}
```

### 세션 제목 서버 요약

done 이벤트 시 세션 메시지가 2개(첫 유저+첫 에이전트)이면:
```typescript
// 간단한 키워드 추출 (Claude API 추가 호출 없이)
const keywords = agentResponse.match(/[가-힣a-zA-Z0-9]+/g)?.slice(0, 3).join(' ')
const title = keywords ? keywords.slice(0, 20) : '새 대화'
await db.update(chatSessions).set({ title }).where(eq(chatSessions.id, sessionId))
```

### ToolCallCard 컴포넌트 디자인

```
// 실행 중
┌─────────────────────────────┐
│ ⏳ search_web 실행 중...     │  ← pulse 애니메이션
└─────────────────────────────┘

// 완료 (접힌 상태)
┌─────────────────────────────┐
│ ✅ search_web          ▸    │
└─────────────────────────────┘

// 완료 (펼친 상태)
┌─────────────────────────────┐
│ ✅ search_web          ▾    │
│ ─────────────────────────── │
│ 결과: 15건 검색됨...         │
└─────────────────────────────┘
```

### 기존 코드 변경 주의사항

- **generateAgentResponse()는 유지**: 기존 함수는 비서 오케스트레이터 등에서 여전히 사용. 새 함수 `generateAgentResponseStream()` 추가
- **POST /messages 응답 구조 변경**: 기존 `{ userMessage, agentMessage }` → `{ userMessage }` (agentMessage는 WS로 전달). 프론트엔드 mutation 수정 필요
- **ws-store addListener/removeListener**: 기존 connect/disconnect/subscribe/send에 리스너 관리 추가
- **chat-area.tsx 기존 로직 보존**: 위임 패널, 메시지 목록 기본 구조 유지. 스트리밍 메시지만 추가

### 주요 라이브러리 버전

- `@anthropic-ai/sdk`: `messages.stream()` 메서드 사용 (SDK v0.30+ 지원)
- Bun WebSocket: `createBunWebSocket()` 기존 구현 활용

### Project Structure Notes

```
packages/server/src/
├── lib/ai.ts                    ← generateAgentResponseStream() 추가
├── routes/workspace/chat.ts     ← POST /messages 비동기화
├── ws/channels.ts               ← broadcastToChannel 기존 활용
packages/app/src/
├── stores/ws-store.ts           ← addListener/removeListener 추가
├── hooks/use-chat-stream.ts     ← NEW: 스트리밍 상태 관리 훅
├── components/chat/
│   ├── chat-area.tsx            ← 스트리밍 UI 통합
│   ├── tool-call-card.tsx       ← NEW: 도구 호출 카드
│   └── types.ts                 ← StreamEvent, ToolCall 타입 추가
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Section 10.4] — 채팅 페이지 WebSocket 이벤트 매핑
- [Source: packages/server/src/lib/ai.ts] — 현재 generateAgentResponse (동기 버전)
- [Source: packages/server/src/ws/server.ts] — WebSocket 서버 + clientMap
- [Source: packages/server/src/ws/channels.ts] — broadcastToChannel 함수
- [Source: packages/app/src/stores/ws-store.ts] — 프론트엔드 WS 스토어
- [Source: packages/app/src/components/chat/chat-area.tsx] — 현재 채팅 영역 (Story 4-1 완료)
- [Source: _bmad-output/implementation-artifacts/4-1-agent-list-select.md] — 이전 스토리 참조

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

### File List
