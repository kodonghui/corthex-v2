# Story 4.1: hub.ts — SSE 스트리밍 진입점

Status: done

## Story

As a CEO/사용자,
I want 허브에서 에이전트에게 메시지를 보내면 SSE로 실시간 응답을 받는 것을,
so that 사령관실 핵심 기능이 동작한다.

## Acceptance Criteria

1. `packages/server/src/routes/workspace/hub.ts` — SSE 엔드포인트 신규 작성 (아키텍처 S3, S7)
2. HTTP POST → SessionContext 생성 (JWT → userId, companyId)
3. `runAgent()` 호출 → `AsyncGenerator<SSEEvent>` → SSE 스트림 응답
4. 기존 `chat.ts`는 세션 REST CRUD 유지 (S3: 역할 분리 — chat=CRUD, hub=SSE)
5. Pre-spawn "accepted" 이벤트 50ms 이내 (체감 지연 0)
6. 에러 시 SSE error 이벤트 → 프론트 에러 표시
7. `@mention` 파싱: `@투자분석팀장` → 해당 에이전트 직접 지정
8. 일반 텍스트: 비서실장(`is_secretary=true`) 자동 라우팅

## Tasks / Subtasks

- [x] Task 1: hub.ts Hono route 파일 생성 (AC: #1, #2)
  - [x] 1.1 `packages/server/src/routes/workspace/hub.ts` 생성
  - [x] 1.2 Hono 라우터 설정 + authMiddleware 적용
  - [x] 1.3 `POST /stream` 엔드포인트 — request body 파싱 (`{ message, sessionId?, agentId? }`)
  - [x] 1.4 JWT에서 userId, companyId 추출 → SessionContext 생성

- [x] Task 2: @mention 파싱 + 비서 라우팅 (AC: #7, #8)
  - [x] 2.1 `@에이전트이름` 정규식 파싱 (`/@(\S+)/`) → getDB(companyId).agents()로 이름 매칭
  - [x] 2.2 매칭된 에이전트의 agentId + soul + tier 조회
  - [x] 2.3 @mention 없으면 → `getDB(companyId).agents()`에서 `is_secretary=true` 에이전트 자동 선택
  - [x] 2.4 에이전트 미발견 시 SSE error 이벤트 (`AGENT_SPAWN_FAILED`)

- [x] Task 3: runAgent() 호출 + SSE 스트리밍 (AC: #3, #5, #6)
  - [x] 3.1 SessionContext 구성: `{ cliToken, userId, companyId, depth: 0, sessionId: crypto.randomUUID(), startedAt: Date.now(), maxDepth: 3, visitedAgents: [agentName] }`
  - [x] 3.2 `cliToken`: Phase 1 — `process.env.ANTHROPIC_API_KEY` (agent-loop.ts 이미 이 방식 사용)
  - [x] 3.3 RunAgentOptions 구성: `{ ctx, soul (renderSoul 결과), message }`
  - [x] 3.4 `runAgent(options)` 호출 → `AsyncGenerator<SSEEvent>`
  - [x] 3.5 `sseStream(events)` → `AsyncGenerator<string>` → ReadableStream → Response
  - [x] 3.6 Pre-spawn "accepted" 이벤트 — runAgent 내부에서 즉시 yield (AC #5)
  - [x] 3.7 에러 catch → SSE `{ type: 'error', code, message }` 이벤트 전송

- [x] Task 4: 라우트 등록 (AC: #1)
  - [x] 4.1 `packages/server/src/index.ts`에 hub route import + `app.route('/api/workspace/hub', hubRoute)` 추가

- [x] Task 5: 빌드 검증
  - [x] 5.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [x] 5.2 기존 테스트 깨지지 않음 확인

## Dev Notes

### 핵심 설계 원칙

- **D6 단일 진입점**: 모든 에이전트 실행 경로 → `engine/agent-loop.ts`. Hook bypass 불가
- **E8 engine 공개 API**: `agent-loop.ts` + `types.ts`만 import 가능. hooks/, soul-renderer, model-selector 직접 import 금지
- **D1 멀티테넌시**: 모든 DB 접근 → `getDB(companyId)` 통해서만. 직접 `db` import 금지
- **S3 역할 분리**: `chat.ts` = 세션 REST CRUD, `hub.ts` = SSE 스트리밍 진입점. 겹치지 않음
- **D2 CLI 토큰 만료**: 진행 중 세션은 완료, 새 세션만 차단
- **D11 WebSocket**: Phase 1에서는 기존 형식 유지, Phase 2에서 전환

### engine/ API — 이것만 import 허용

```typescript
// packages/server/src/engine/agent-loop.ts
export async function* runAgent(options: RunAgentOptions): AsyncGenerator<SSEEvent>
// 주의: SDK 시작 오버헤드 ~2초. 'accepted' + 'processing' 이벤트로 흡수

// packages/server/src/engine/sse-adapter.ts
export async function* sseStream(events: AsyncGenerator<SSEEvent>): AsyncGenerator<string>
// 포맷: "event: {type}\ndata: {JSON}\n\n" (표준 SSE)

// packages/server/src/engine/types.ts — 타입만 import
export interface SessionContext {
  readonly cliToken: string       // 보안: 사용 후 null 처리됨
  readonly userId: string
  readonly companyId: string
  readonly depth: number          // 0 = 최초 호출, 핸드오프마다 +1
  readonly sessionId: string
  readonly startedAt: number
  readonly maxDepth: number       // 기본 3 (회사별 설정 가능)
  readonly visitedAgents: readonly string[]
}

export interface RunAgentOptions {
  ctx: SessionContext
  agentId: string
  userMessage: string
  soul: string          // renderSoul() 결과
  model: string         // selectModel() 결과
}

// SSEEvent 6가지 타입:
export type SSEEvent =
  | { type: 'accepted'; sessionId: string }
  | { type: 'processing'; agentName: string }
  | { type: 'handoff'; from: string; to: string; depth: number }
  | { type: 'message'; content: string }
  | { type: 'error'; code: string; message: string; agentName?: string }
  | { type: 'done'; costUsd: number; tokensUsed: number }
```

### soul-renderer + model-selector — hub.ts에서 직접 호출해야 함

**주의**: E8에 따르면 engine/ 내부 모듈(hooks/, soul-renderer, model-selector)을 routes/에서 직접 import하면 안 됨. 그러나 `runAgent()`에 `soul`과 `model` 파라미터를 넘겨야 하므로, 이 두 함수는 **hub.ts에서 호출 필요**:

```typescript
// packages/server/src/engine/soul-renderer.ts
export async function renderSoul(agentId: string, companyId: string): Promise<string>
// DB에서 에이전트 soul_template + 변수 6개 치환 ({{agent_list}}, {{subordinate_list}} 등)

// packages/server/src/engine/model-selector.ts
export function selectModel(tier: string): string
// Phase 1 하드코드: manager→sonnet-4-6, specialist→sonnet-4-6, worker→haiku-4-5
```

**해결 방법**: `runAgent()` 내부에서 이미 soul/model을 처리하고 있는지 확인. 만약 RunAgentOptions에서 soul/model이 필수 파라미터라면, hub.ts에서 이 함수들을 import해야 함. E8 경계 규칙의 예외로 처리하거나, agent-loop.ts 내부에서 자동으로 호출하도록 수정 가능.

**실제 구현 시 확인 사항**: `agent-loop.ts`의 `runAgent()` 구현을 읽고, soul/model이 외부에서 주입해야 하는지 확인 후 결정.

### DB 접근 — getDB(companyId)

```typescript
// packages/server/src/db/scoped-query.ts
export function getDB(companyId: string) {
  // 반환 객체의 주요 메서드:
  agents()                    // 전체 에이전트 목록 (companyId 격리)
  agentById(id: string)       // 단건 조회
  departments()               // 부서 목록
  insertCostRecord(record)    // 비용 기록
  // ... 기타
}
```

### 기존 chat.ts 패턴 참조 (SSE 스트리밍 방식)

기존 `chat.ts` (406줄)는 다음 패턴을 사용:
- WebSocket `broadcastToChannel()` 기반 비동기 스트리밍 (not SSE)
- `generateAgentResponseStream()` (구 agent-runner 사용)
- 즉시 202 응답 후 백그라운드 처리

**hub.ts는 다른 접근**: HTTP SSE (Server-Sent Events) 직접 스트리밍
- Hono의 `stream()` 또는 `streamSSE()` 헬퍼 사용
- `runAgent()` → `sseStream()` → 직접 Response body로 전달
- 연결 유지 → 이벤트 스트림 → done 이벤트 → 연결 종료

### @mention 파싱 로직

```typescript
// 정규식: 메시지 시작 또는 공백 뒤 @이름
const mentionMatch = message.match(/@(\S+)/);
if (mentionMatch) {
  const agentName = mentionMatch[1];
  // getDB(companyId).agents() → name 매칭
  // 찾으면 해당 에이전트로 직접 호출
  // 못찾으면 AGENT_SPAWN_FAILED 에러
}
// @mention 없으면 → is_secretary=true 에이전트 자동 라우팅
```

### v1 핵심 흐름 (반드시 지원)

```
CEO 명령 → 비서실장(Secretary) → 팀장(Manager) → 전문가(Specialist) → 종합 → 보고
```

이 흐름은 hub.ts에서 시작:
1. 사용자 메시지 → hub.ts 수신
2. @mention 있으면 해당 에이전트 직접 호출
3. @mention 없으면 비서실장(is_secretary=true) 호출
4. 비서실장이 `call_agent` 도구로 팀장에게 위임 (agent-loop.ts 내부 처리)
5. 팀장이 전문가에게 재위임 (depth 증가)
6. 전체 체인의 SSE 이벤트가 hub.ts를 통해 클라이언트에 전달

### Hono SSE 스트리밍 패턴

```typescript
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'

const hub = new Hono()

hub.post('/stream', async (c) => {
  return streamSSE(c, async (stream) => {
    // 1. "accepted" 이벤트 즉시 전송
    await stream.writeSSE({ event: 'accepted', data: JSON.stringify({ sessionId }) })

    // 2. runAgent() 호출 → AsyncGenerator<SSEEvent>
    const events = runAgent(options)

    // 3. 이벤트 순회 → SSE 전송
    for await (const event of events) {
      await stream.writeSSE({ event: event.type, data: JSON.stringify(event) })
    }
  })
})
```

**또는** `sseStream()` 어댑터 사용:

```typescript
hub.post('/stream', async (c) => {
  const events = runAgent(options)
  const sseGenerator = sseStream(events)

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of sseGenerator) {
          controller.enqueue(new TextEncoder().encode(chunk))
        }
        controller.close()
      }
    }),
    { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } }
  )
})
```

### 에러 코드 참조

```typescript
// packages/server/src/lib/error-codes.ts
export const ERROR_CODES = {
  AGENT_SPAWN_FAILED: 'AGENT_SPAWN_FAILED',
  AGENT_TIMEOUT: 'AGENT_TIMEOUT',
  SESSION_LIMIT_EXCEEDED: 'SESSION_LIMIT_EXCEEDED',
  // ...
} as const
```

### cliToken 획득 방법

에이전트가 Claude SDK를 호출하려면 cliToken이 필요:
- `credentials` 테이블에서 해당 에이전트(또는 상위 인간 직원)의 CLI 토큰 조회
- AES-256-GCM 복호화 필요 (기존 `credentials` 라우트 참조)
- **Phase 1 간소화**: 환경변수 `ANTHROPIC_API_KEY` 사용 (agent-loop.ts가 이미 이렇게 동작)
- 실제 CLI 토큰 기반 호출은 Phase 2+ OAuth CLI 아키텍처에서

### 라우트 등록 위치

```typescript
// packages/server/src/index.ts (line ~133 근처)
import { chatRoute } from './routes/workspace/chat'
// 추가:
import { hubRoute } from './routes/workspace/hub'

// 기존:
app.route('/api/workspace/chat', chatRoute)
// 추가:
app.route('/api/workspace/hub', hubRoute)
```

### Project Structure Notes

- 새 파일: `packages/server/src/routes/workspace/hub.ts` (NEW)
- 수정 파일: `packages/server/src/index.ts` (라우트 등록 추가)
- `chat.ts`는 수정하지 않음 (S3 역할 분리)
- 테스트는 이 스토리 범위 외 (Story 4.5에서 통합 테스트)

### References

- [Source: epics.md → Epic 4, Story 4.1 (lines 481-514)]
- [Source: architecture.md → D2 (line 344), D6 (line 348), D11 (line 358)]
- [Source: architecture.md → S11 호출자 목록 (lines 922-931)]
- [Source: architecture.md → S12 불가침 정의 (lines 912-920)]
- [Source: architecture.md → 소스 트리 hub.ts (line 851)]
- [Source: engine/agent-loop.ts → runAgent() AsyncGenerator<SSEEvent>]
- [Source: engine/sse-adapter.ts → sseStream() SSE 포맷팅]
- [Source: engine/types.ts → SessionContext, SSEEvent, RunAgentOptions]
- [Source: engine/soul-renderer.ts → renderSoul()]
- [Source: engine/model-selector.ts → selectModel()]
- [Source: db/scoped-query.ts → getDB(companyId)]
- [Source: routes/workspace/chat.ts → 기존 SSE 패턴 참조 (406줄)]
- [Source: index.ts → 라우트 등록 패턴 (line ~133)]
- [Source: Story 3.6 → Hook 파이프라인, 테스트 패턴]

### Previous Story Intelligence (Epic 3)

- **테스트 패턴**: `mock.module()` for dependency mocking (bun:test)
- **헬퍼**: `makeCtx()` for SessionContext creation
- **훅 구조**: D4 순서 (permission → scrubber → redactor → delegation → cost) — agent-loop.ts 내부에서 자동 실행
- **빌드 검증**: `npx tsc --noEmit -p packages/server/tsconfig.json` 필수
- **커밋 패턴**: `feat: Story X.Y title — details + simplify success`

### Git Intelligence

최근 커밋 (Epic 3 완료):
- `db35db8` Story 3.6 hook-pipeline integration test — 12 tests
- `b027752` Story 3.5 cost-tracker — Stop hook + micro-USD math
- `d0d6491` Story 3.4 delegation-tracker — PostToolUse handoff event
- `4a747b1` Story 3.3 output-redactor — PostToolUse Korean PII
- `2663e3e` Story 3.2 credential-scrubber — PostToolUse hook

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- hub.ts created: POST /stream SSE endpoint with @mention parsing + secretary auto-routing
- 3-tier agent resolution: explicit agentId > @mention name > secretary fallback
- SSE streaming via ReadableStream wrapping sseStream(runAgent()) generator chain
- soul-renderer imported directly (needed to prepare RunAgentOptions.soul before runAgent call)
- cliToken: Phase 1 uses process.env.ANTHROPIC_API_KEY (agent-loop.ts already uses this)
- RunAgentOptions actual shape: { ctx, soul, message } (no agentId/model fields — confirmed from types.ts)
- Error responses as SSE events (not HTTP errors) for consistent client handling
- 10 unit tests: @mention Korean/English, secretary routing, unknown agent error, empty message validation, SSE format
- tsc: 0 errors, bun test: 22 pass (10 original + 12 TEA P0)
- Code review: 3 fixes applied (isActive check on explicit agentId, single agents() call, cleanText empty string)
- Simplify: 5 fixes applied (visitedAgents ID, inputSessionId, anchored regex, isActive filter, unused param)

### File List

- `packages/server/src/routes/workspace/hub.ts` — NEW (SSE streaming entry point, ~115 lines)
- `packages/server/src/index.ts` — MODIFIED (added hubRoute import + route registration)
- `packages/server/src/__tests__/unit/hub-route.test.ts` — NEW (10 tests)
