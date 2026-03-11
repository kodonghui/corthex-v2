# Story 6.3: SSE 상태 머신 + 에러 투명성

Status: done

## Story

As a 사용자,
I want 에이전트 작업 상태가 실시간으로 표시되고 에러가 명확히 보이는 것을,
so that 블랙박스 에러 0건을 달성한다.

## Acceptance Criteria

1. SSE 6개 이벤트 → UI 상태 매핑 (E5):
   - `accepted` → "명령 접수됨" + 로딩 스피너
   - `processing` → "{에이전트 이름} 분석 중..." + 에이전트 이름 표시
   - `handoff` → 핸드오프 트래커 업데이트 (from → to, depth 표시)
   - `message` → 스트리밍 텍스트 실시간 표시
   - `error` → 에러 배너 (코드 + 한국어 메시지)
   - `done` → 비용 표시 + 스피너 종료

2. 에러 메시지 한국어 변환: `error-messages.ts` 파일 생성 (S10)
   - 서버 error-codes.ts의 모든 코드에 대한 한국어 매핑
   - 미등록 코드 fallback: "오류가 발생했습니다 (코드: {code})" (P11)

3. 핸드오프 실패 시 사용자에게 명시적 표시
   - 어떤 에이전트에서 실패했는지 표시
   - 에러 코드 + 사용자 친화적 메시지 동시 표시

4. SSE 상태 머신 구현 (React hook + Zustand store):
   - 상태: `idle` → `connecting` → `accepted` → `processing` → `streaming` → `done` / `error`
   - 상태 전이 규칙 명확, 잘못된 전이 방지
   - 연결 타임아웃 (30초), 네트워크 에러 감지
   - 재시도 로직 (최대 2회, 지수 백오프)

## Tasks / Subtasks

- [x]Task 1: SSE 상태 머신 hook 생성 (AC: #4)
  - [x]1.1: `packages/app/src/hooks/use-sse-state-machine.ts` — 상태 머신 핵심 로직
  - [x]1.2: SSE 상태 타입 정의 (`SSEConnectionState`)
  - [x]1.3: `EventSource` 기반 SSE 연결 관리 (connect/disconnect/reconnect)
  - [x]1.4: 상태 전이 규칙 정의 (idle→connecting→accepted→processing→streaming→done/error)
  - [x]1.5: 타임아웃 처리 (30초 연결 타임아웃, 120초 세션 타임아웃)
  - [x]1.6: 네트워크 에러 감지 + 자동 재시도 (최대 2회, 지수 백오프)

- [x]Task 2: 에러 메시지 한국어 변환 파일 생성 (AC: #2)
  - [x]2.1: `packages/app/src/lib/error-messages.ts` — 에러 코드 → 한국어 매핑
  - [x]2.2: 서버 `error-codes.ts`의 모든 코드에 대한 한국어 메시지 작성
  - [x]2.3: 미등록 코드 fallback 함수 `getErrorMessage(code: string): string`
  - [x]2.4: 기존 `api.ts`의 `errorMessages` 맵을 `error-messages.ts`로 이전/통합

- [x]Task 3: SSE 이벤트 → UI 상태 매핑 (AC: #1)
  - [x]3.1: `use-sse-state-machine.ts`에서 6개 SSE 이벤트 파싱 로직
  - [x]3.2: `accepted` 이벤트 → `accepted` 상태 + sessionId 저장
  - [x]3.3: `processing` 이벤트 → `processing` 상태 + agentName 저장
  - [x]3.4: `handoff` 이벤트 → 핸드오프 목록에 { from, to, depth } 추가
  - [x]3.5: `message` 이벤트 → `streaming` 상태 + 텍스트 누적
  - [x]3.6: `error` 이벤트 → `error` 상태 + 에러 메시지 한국어 변환
  - [x]3.7: `done` 이벤트 → `done` 상태 + { costUsd, tokensUsed } 저장

- [x]Task 4: 핸드오프 실패 에러 투명성 (AC: #3)
  - [x]4.1: 에러 이벤트에서 `agentName` 필드 활용 — 어떤 에이전트에서 실패했는지 표시
  - [x]4.2: 핸드오프 관련 에러 코드 특별 처리:
    - `HANDOFF_DEPTH_EXCEEDED`: "위임 깊이 제한({depth}단계)을 초과했습니다"
    - `HANDOFF_CIRCULAR`: "순환 위임이 감지되었습니다 ({agentName})"
    - `HANDOFF_TARGET_NOT_FOUND`: "위임 대상 에이전트를 찾을 수 없습니다"
  - [x]4.3: 에러 배너 UI — 코드, 에이전트 이름, 한국어 메시지 표시

- [x]Task 5: 기존 `use-chat-stream.ts`와 통합 (AC: #1, #4)
  - [x]5.1: 새 SSE 상태 머신을 기존 WebSocket 기반 `use-chat-stream.ts`와 병행 지원
  - [x]5.2: Hub 페이지에서 SSE 모드 우선, 기존 채팅에서 WebSocket 유지
  - [x]5.3: 공통 인터페이스 추출 (streamingText, isStreaming, error, toolCalls 등)

- [x]Task 6: `api.ts` errorMessages 통합 (AC: #2)
  - [x]6.1: 기존 `api.ts`의 `errorMessages` → `error-messages.ts`로 이전
  - [x]6.2: `api.ts`에서 `error-messages.ts` import 사용으로 전환
  - [x]6.3: 중복 제거, 단일 소스 유지

## Dev Notes

### Architecture Compliance

- **E5 (SSE 이벤트)**: 서버에서 정의한 6개 이벤트 타입만 처리. `engine/types.ts`의 `SSEEvent` 타입 참조.
- **E8 (engine 경계)**: 프론트엔드는 `engine/types.ts`를 직접 import 불가. SSE 이벤트 타입을 프론트에서 별도 정의.
- **D3 (에러 코드)**: `error-codes.ts`의 코드를 프론트 `error-messages.ts`에서 1:1 매핑.
- **S10**: `error-messages.ts`는 `packages/app/src/lib/` 에 위치 (Phase 2, app 패키지).

### SSE 이벤트 형식 (서버 → 프론트)

서버의 `sse-adapter.ts`가 생성하는 SSE 스트림 형식:
```
event: accepted
data: {"sessionId":"uuid"}

event: processing
data: {"agentName":"비서실장"}

event: handoff
data: {"from":"비서실장","to":"전략 매니저","depth":1}

event: message
data: {"content":"분석 결과입니다..."}

event: error
data: {"code":"HANDOFF_DEPTH_EXCEEDED","message":"Max depth exceeded","agentName":"비서실장"}

event: done
data: {"costUsd":0.05,"tokensUsed":1500}
```

### 서버 Hub 엔드포인트

- `POST /api/workspace/hub/stream` — SSE 스트리밍 진입점
- 요청: `{ message: string, sessionId?: string, agentId?: string }`
- 응답: `text/event-stream` (Content-Type)
- 현재 구현: `packages/server/src/routes/workspace/hub.ts`
- **프론트에서는 `fetch()` + ReadableStream으로 SSE 소비** (EventSource는 POST 미지원)

### 기존 코드 참고

1. **`use-chat-stream.ts`** — 현재 WebSocket 기반 스트리밍 hook. SSE 상태 머신은 이를 대체하지 않고 병행.
   - WebSocket: 기존 채팅 (token/tool-start/tool-end/delegation 등)
   - SSE: Hub 스트리밍 (accepted/processing/handoff/message/error/done)

2. **`command-store.ts`** — 커맨드 센터 상태 관리. 메시지, 위임 단계 추적.

3. **`ws-store.ts`** — WebSocket 연결 관리 + 채널 리스너. SSE는 별도 연결이므로 독립.

4. **`api.ts`** — 기존 `errorMessages` 맵 (AUTH_001, AUTH_002, RATE_001 등). 이를 `error-messages.ts`로 통합.

5. **서버 `error-codes.ts`** — 에러 코드 레지스트리:
   ```
   AUTH_001, AUTH_002, AUTH_003, AGENT_001, RATE_001,
   AGENT_SPAWN_FAILED, AGENT_TIMEOUT, SESSION_LIMIT_EXCEEDED,
   HANDOFF_DEPTH_EXCEEDED, HANDOFF_CIRCULAR, HANDOFF_TARGET_NOT_FOUND,
   TOOL_PERMISSION_DENIED, HOOK_PIPELINE_ERROR, SERVER_SHUTTING_DOWN,
   ORG_SECRETARY_DELETE_DENIED
   ```

### SSE 상태 머신 설계

```
                    ┌──────────────┐
                    │    idle      │
                    └──────┬───────┘
                           │ connect()
                    ┌──────▼───────┐
                    │  connecting  │──── timeout(30s) ──→ error
                    └──────┬───────┘
                           │ event: accepted
                    ┌──────▼───────┐
                    │   accepted   │
                    └──────┬───────┘
                           │ event: processing
                    ┌──────▼───────┐
                    │  processing  │──── event: handoff ──→ (update tracker, stay)
                    └──────┬───────┘
                           │ event: message (first)
                    ┌──────▼───────┐
          ┌────────│  streaming   │
          │        └──────┬───────┘
          │               │ event: message ──→ (append text, stay)
          │               │
          │        event: done
          │        ┌──────▼───────┐
          │        │    done      │
          │        └──────────────┘
          │
          │  event: error (from any active state)
          │        ┌──────────────┐
          └───────→│    error     │──── retry(max 2) ──→ connecting
                   └──────────────┘
```

### 중요 기술 결정

1. **SSE 소비 방식**: `fetch()` + `ReadableStream` (POST 지원). `EventSource`는 GET 전용이므로 사용 불가.
2. **상태 관리**: Zustand store가 아닌 React hook (`useState`) 기반. SSE 연결은 컴포넌트 생명주기에 종속.
3. **에러 메시지 통합**: `error-messages.ts`가 단일 소스. `api.ts`와 SSE hook 모두에서 사용.
4. **타임아웃**: 연결 30초 + 세션 120초 (NFR-P8 참조).
5. **재시도**: 네트워크 에러 시 최대 2회, 지수 백오프 (3초 → 6초).

### Project Structure Notes

- `packages/app/src/hooks/use-sse-state-machine.ts` — NEW: SSE 상태 머신 hook
- `packages/app/src/lib/error-messages.ts` — NEW: 에러 코드 → 한국어 매핑
- `packages/app/src/lib/api.ts` — MODIFY: errorMessages 이전
- `packages/app/src/hooks/use-chat-stream.ts` — REFERENCE ONLY (수정 없음)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#E5-SSE-이벤트-발행-규칙]
- [Source: _bmad-output/planning-artifacts/architecture.md#D3-에러-코드-체계]
- [Source: _bmad-output/planning-artifacts/architecture.md#S10-error-messages.ts]
- [Source: _bmad-output/planning-artifacts/architecture.md#Pre-spawn-이벤트-시퀀스]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.3]
- [Source: packages/server/src/engine/types.ts — SSEEvent type]
- [Source: packages/server/src/engine/sse-adapter.ts — SSE format]
- [Source: packages/server/src/routes/workspace/hub.ts — Hub endpoint]
- [Source: packages/server/src/lib/error-codes.ts — Error codes registry]
- [Source: packages/app/src/hooks/use-chat-stream.ts — Existing WS streaming]
- [Source: packages/app/src/lib/api.ts — Existing errorMessages map]
- [Source: packages/app/src/stores/command-store.ts — Command state]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

### Completion Notes List

- Story created with comprehensive developer context from architecture, epics, and existing codebase analysis
- SSE state machine is FRONTEND only (React hook), not server-side
- Server SSE streaming already implemented in Story 4.1 (hub.ts)
- Must use fetch() + ReadableStream, not EventSource (POST endpoint)
- Error messages centralization: move api.ts errorMessages → error-messages.ts

### File List
