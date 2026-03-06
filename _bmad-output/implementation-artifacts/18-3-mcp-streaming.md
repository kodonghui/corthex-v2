# Story 18.3: MCP 스트리밍

Status: done

## Story

As a 워크스페이스 일반 유저,
I want MCP 서버의 도구 실행 결과가 SSE 스트리밍으로 실시간 전달되도록,
so that 장시간 걸리는 MCP 도구 호출 시에도 진행 상황을 실시간으로 확인하고 타임아웃 없이 결과를 받을 수 있다.

## Acceptance Criteria

1. **Given** MCP 서버가 SSE 스트리밍으로 응답 **When** `mcpCallTool` 호출 **Then** `Content-Type: text/event-stream` 응답을 감지하고 SSE 이벤트를 파싱하여 최종 JSON-RPC 결과를 조립. 기존 JSON 응답도 여전히 정상 동작 (호환성 유지)
2. **Given** MCP 스트리밍 응답 진행 중 **When** 에이전트 채팅 스트리밍 UI **Then** `tool-start` 이벤트 후 `tool-progress` 이벤트로 중간 결과(partial text)를 실시간 전달. 채팅 UI에서 도구 실행 중간 결과가 점진적으로 표시
3. **Given** MCP 서버가 30초 이상 걸리는 도구 응답 **When** 스트리밍 모드 **Then** SSE 스트리밍 타임아웃은 60초로 확장 (기존 5초 JSON 타임아웃과 별도). SSE keep-alive 이벤트로 연결 유지
4. **Given** MCP 스트리밍 중 연결 끊김 **When** 네트워크 오류 발생 **Then** 에러 이벤트로 `tool-end` error=true 전달. 부분 결과가 있으면 부분 결과라도 반환
5. **Given** `POST /settings/mcp/execute` 호출 **When** 스트리밍 응답 가능한 MCP 서버 **Then** 최종 결과만 JSON으로 반환 (REST API는 스트리밍하지 않음, 채팅 스트리밍만 해당)
6. **Given** 채팅 스트리밍 UI **When** MCP 도구 스트리밍 진행 중 **Then** 도구 카드에 중간 결과 텍스트가 점진적으로 표시. 완료 시 최종 결과로 교체
7. **Given** `turbo build type-check` **When** 전체 빌드 **Then** 8/8 success, 타입 에러 0건

## Tasks / Subtasks

- [x] Task 1: MCP 클라이언트 SSE 스트리밍 지원 (AC: #1, #3, #4)
  - [x] `packages/server/src/lib/mcp-client.ts` 수정
  - [x] `mcpCallToolStream(url, toolName, args, onProgress?)` 함수 추가 — SSE 응답 파싱
  - [x] Content-Type 감지: `text/event-stream` → SSE 파싱, `application/json` → 기존 JSON 파싱 (자동 분기)
  - [x] SSE 파싱: `data:` 라인에서 JSON-RPC 메시지 추출. 중간 `notifications/progress` 이벤트 → `onProgress` 콜백
  - [x] 최종 `tools/call` 결과 → `content[0].text` 추출하여 반환 (기존과 동일 인터페이스)
  - [x] SSE 타임아웃 60초 (MCP_STREAM_TIMEOUT_MS), 기존 JSON 타임아웃 5초 유지
  - [x] SSE keep-alive (`:` 주석 라인) 수신 시 타임아웃 리셋
  - [x] 연결 끊김 시 부분 결과 반환 + 에러 throw

- [x] Task 2: 스트리밍 이벤트 타입 확장 (AC: #2, #6)
  - [x] `packages/server/src/lib/ai.ts` StreamEvent 타입에 `tool-progress` 추가
  - [x] `tool-progress` 이벤트: `{ type: 'tool-progress', toolId: string, toolName: string, content: string }`
  - [x] `generateAgentResponseStream`에서 MCP 도구 호출 시 `mcpCallToolStream` 사용
  - [x] `onProgress` 콜백 → `tool-progress` 이벤트로 WebSocket 전달

- [x] Task 3: 프론트엔드 — 도구 진행 상태 UI (AC: #2, #6)
  - [x] `packages/app/src/hooks/use-chat-stream.ts` — `tool-progress` 이벤트 핸들링 추가
  - [x] `ToolCall` 타입에 `progressText?: string` 필드 추가
  - [x] `tool-progress` 이벤트 수신 시 해당 toolId의 progressText 업데이트
  - [x] 채팅 도구 카드 UI에서 `status === 'running' && progressText` 시 중간 결과 표시

- [x] Task 4: 기존 mcpCallTool 호환성 유지 (AC: #1, #5)
  - [x] 기존 `mcpCallTool` 함수는 그대로 유지 (REST API용, 비스트리밍)
  - [x] `generateAgentResponse` (비스트리밍 sync)에서는 기존 `mcpCallTool` 계속 사용
  - [x] `POST /settings/mcp/execute` REST 엔드포인트도 기존 `mcpCallTool` 유지

- [x] Task 5: 빌드 검증 (AC: #7)
  - [x] `bunx turbo build type-check` 8/8 success

## Dev Notes

### MCP Streamable HTTP — SSE 응답 형식

MCP 프로토콜의 Streamable HTTP 전송은 두 가지 응답 형식 지원:
1. **JSON 응답** (`Content-Type: application/json`) — 현재 구현. 단일 JSON-RPC 응답
2. **SSE 스트리밍** (`Content-Type: text/event-stream`) — 이번 스토리. 여러 이벤트를 스트리밍

SSE 응답 형식:
```
event: message
data: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"abc","progress":50,"total":100}}

event: message
data: {"jsonrpc":"2.0","id":2,"result":{"content":[{"type":"text","text":"최종 결과"}]}}

```

핵심 포인트:
- 서버가 `text/event-stream`으로 응답하면 SSE 모드
- 중간에 `notifications/progress` 메서드로 진행 상황 전달 가능
- 마지막에 `id` 필드가 있는 JSON-RPC 응답이 최종 결과
- SSE keep-alive: `:` 로 시작하는 주석 라인 (연결 유지용)

### 구현 전략 — Content-Type 자동 분기

`mcpCallToolStream`은 응답의 Content-Type을 확인:
- `application/json` → 기존과 동일하게 `res.json()` 파싱
- `text/event-stream` → SSE 파싱 (ReadableStream 소비)

이 방식으로 MCP 서버가 스트리밍을 지원하든 안 하든 하나의 함수로 처리.

### SSE 파싱 로직 (Bun 환경)

```typescript
// ReadableStream으로 SSE 파싱
const reader = res.body!.getReader()
const decoder = new TextDecoder()
let buffer = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split('\n')
  buffer = lines.pop() || '' // 마지막 불완전 라인은 버퍼에 유지

  for (const line of lines) {
    if (line.startsWith(':')) continue // keep-alive 주석
    if (line.startsWith('data: ')) {
      const json = JSON.parse(line.slice(6))
      // notifications/progress → onProgress 콜백
      // id 있는 응답 → 최종 결과
    }
  }
}
```

### 기존 스트리밍 아키텍처 (변경 최소화)

현재 도구 실행 흐름 (스트리밍):
1. `ai.ts:generateAgentResponseStream` → Claude API 스트리밍
2. Claude가 `tool_use` 블록 반환 → `tool-start` 이벤트 → 도구 실행 → `tool-end` 이벤트
3. 도구 결과 → 다음 라운드 Claude API 호출

**MCP 스트리밍 추가 전략**:
- MCP 도구 실행 시 `mcpCallTool` → `mcpCallToolStream`으로 교체 (스트리밍 함수만)
- `onProgress` 콜백에서 `tool-progress` 이벤트를 WebSocket으로 전달
- 프론트엔드에서 `tool-progress` 이벤트 수신 → 도구 카드에 중간 결과 표시
- **기존 tool-start / tool-end 흐름 유지** — progress는 선택적 추가

### 프론트엔드 도구 카드 중간 결과 표시

`use-chat-stream.ts`의 `ToolCall` 타입에 `progressText` 추가:
```typescript
export type ToolCall = {
  toolId: string
  toolName: string
  status: 'running' | 'done'
  input?: string
  result?: string
  progressText?: string  // 신규: 스트리밍 중간 결과
  durationMs?: number
  error?: boolean
}
```

도구 카드 렌더링:
- `status === 'running' && progressText` → progressText를 `text-xs text-zinc-400 whitespace-pre-wrap`로 표시
- `status === 'done'` → result 표시 (기존과 동일)

### 타임아웃 전략

| 구분 | 타임아웃 | 용도 |
|------|----------|------|
| 기존 JSON 응답 | 5초 (MCP_TIMEOUT_MS) | 짧은 도구 호출 |
| SSE 스트리밍 | 60초 (MCP_STREAM_TIMEOUT_MS) | 장시간 도구 (분석, 생성 등) |
| SSE keep-alive | 수신 시 타임아웃 리셋 | 서버가 살아있으면 무한 대기 |

### Project Structure Notes

```
packages/server/src/
  lib/mcp-client.ts                        <- 수정: mcpCallToolStream + SSE 파싱
  lib/ai.ts                                <- 수정: StreamEvent에 tool-progress 추가 + 스트리밍 함수에서 mcpCallToolStream 사용

packages/app/src/
  hooks/use-chat-stream.ts                 <- 수정: tool-progress 이벤트 핸들링 + progressText
```

### References

- [Source: packages/server/src/lib/mcp-client.ts] — 현재 MCP JSON-RPC 클라이언트 (5초 타임아웃)
- [Source: packages/server/src/lib/ai.ts:297-302] — StreamEvent 타입 정의
- [Source: packages/server/src/lib/ai.ts:394-478] — generateAgentResponseStream 도구 루프
- [Source: packages/app/src/hooks/use-chat-stream.ts:5-13] — ToolCall 타입
- [Source: packages/app/src/hooks/use-chat-stream.ts:66-142] — 스트리밍 이벤트 핸들러
- [Source: packages/server/src/routes/workspace/settings-mcp.ts:148-168] — POST /mcp/execute (변경 없음)

### Previous Story Intelligence (18-2)

- mcp-client.ts에 `mcpRequest`, `mcpListTools`, `mcpCallTool` 구현 완료
- ai.ts에서 sync/stream 양쪽 모두 MCP 도구 통합 완료
- MCP 도구는 `[MCP]` 태그로 구분
- mcpToolRecords에 serverUrl, serverId 포함
- 이름 충돌 방지: 내장 도구 우선, 동명 MCP 도구 건너뛰기
- turbo build 8/8, TEA 83건 테스트 통과

### Git Intelligence

Recent commits:
- `4a89408` feat: Story 18-2 MCP 도구 실행 — JSON-RPC 2.0 클라이언트 + AI 채팅 통합 + TEA 83건
- `092cf1a` feat: Story 18-1 MCP 서버 관리 — CRUD API + 설정 UI + 연결 테스트 + SSRF 방지 + TEA 169건

커밋 메시지 패턴: `feat: Story X-Y 한글 제목 — 핵심 변경 요약 + TEA N건`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: mcp-client.ts — mcpCallToolStream 함수 추가. Content-Type 자동 분기 (JSON/SSE). SSE 파싱 (ReadableStream), notifications/progress → onProgress 콜백, 60초 타임아웃 + keep-alive 리셋, 부분 결과 반환, extractTextFromResult 헬퍼 추출
- Task 2: ai.ts — StreamEvent에 tool-progress 타입 추가. generateAgentResponseStream에서 MCP 도구 호출 시 mcpCallToolStream 사용 + onProgress 콜백으로 tool-progress 이벤트 WebSocket 전달
- Task 3: use-chat-stream.ts — tool-progress 이벤트 핸들러 추가, ToolCall에 progressText 필드 추가, tool-end 시 progressText 초기화. tool-call-card.tsx — 실행 중 progressText 표시 UI 추가
- Task 4: 기존 mcpCallTool 함수 그대로 유지. generateAgentResponse(sync)와 POST /mcp/execute는 변경 없음
- Task 5: turbo build type-check 8/8 success, 14 new streaming tests pass, 22 existing MCP tests pass

### File List

- packages/server/src/lib/mcp-client.ts (수정 — mcpCallToolStream + extractTextFromResult + MCP_STREAM_TIMEOUT_MS)
- packages/server/src/lib/ai.ts (수정 — tool-progress StreamEvent + mcpCallToolStream 사용)
- packages/app/src/hooks/use-chat-stream.ts (수정 — tool-progress 이벤트 핸들링 + progressText)
- packages/app/src/components/chat/tool-call-card.tsx (수정 — 실행 중 progressText 표시)
- packages/server/src/__tests__/unit/mcp-streaming.test.ts (신규 — 14 tests)
