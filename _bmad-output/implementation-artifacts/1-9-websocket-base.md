# Story 1.9: WebSocket 서버 기반 구축

Status: done

## Story

As a 개발자,
I want WebSocket 서버가 단일 연결 + 5채널 멀티플렉싱으로 동작하기를,
so that 채팅 스트리밍/에이전트 상태/알림/메신저/작전일지가 모두 하나의 연결로 처리된다.

## Acceptance Criteria

1. **Given** 유저가 앱에 로그인 / **When** WebSocket 연결 수립 (`/ws?token=JWT`) / **Then** 5개 채널 구독 가능: `chat-stream`, `agent-status`, `notifications`, `messenger`, `activity-log`
2. **Given** 채널 구독 메시지 수신 / **When** 권한 검증 / **Then** 채널별 접근 제어:
   - `chat-stream` — 해당 채팅 세션 소유자만
   - `agent-status` — 같은 `company_id` 유저만
   - `notifications` — 본인만
   - `messenger` — 해당 채널 멤버만
   - `activity-log` — 같은 `company_id` 유저만
3. **Given** 동일 유저가 4번째 WS 연결 시도 / **When** 연결 수립 / **Then** 가장 오래된 연결 자동 종료 (최대 3개 연결 허용)
4. **Given** WS 연결 끊김 / **When** 클라이언트 감지 / **Then** 3초 간격 자동 재연결 시도 (`ws-store.ts`)
5. **Given** 서버 재시작 / **When** SIGTERM 수신 / **Then** 연결된 모든 클라이언트에 `{ type: 'server-restart' }` 이벤트 발송 후 연결 종료
6. **Given** EventBus.emit('activity', data) 호출 / **When** WS 서버 수신 / **Then** 해당 `company_id` 구독자에게 실시간 브로드캐스트

## Tasks / Subtasks

- [x] Task 1: `lib/event-bus.ts` 생성 (AC: #6)
  - [x] `packages/server/src/lib/event-bus.ts` 신규 생성
  - [x] Bun 내장 `EventEmitter` 기반, 싱글톤 패턴

- [x] Task 2: `ws/server.ts` WebSocket 서버 구현 (AC: #1~#3, #5)
  - [x] `createBunWebSocket` + `upgradeWebSocket` 사용
  - [x] JWT 검증 → 4001 Unauthorized / 연결 성공 `{ type: 'connected' }`
  - [x] 최대 3개 연결 제한 (4002 Connection limit exceeded)
  - [x] onMessage/onClose 핸들러, broadcastServerRestart

- [x] Task 3: `ws/channels.ts` 채널 권한 검증 (AC: #2)
  - [x] 5개 채널 권한 검증 (chat-stream, agent-status, notifications, messenger, activity-log)
  - [x] FORBIDDEN 에러 응답, broadcastToChannel, broadcastToCompany

- [x] Task 4: `index.ts` WebSocket 라우트 등록 (AC: #1)
  - [x] `/ws` 라우트 등록 + `websocket` export + EventBus 브리지
  - [x] SIGTERM → broadcastServerRestart

- [x] Task 5: `shared/types.ts` WS 메시지 타입 추가 (AC: #1~#2)
  - [x] WsChannel, WsInboundMessage, WsOutboundMessage 타입 추가:
    ```typescript
    export type WsChannel =
      | 'chat-stream'
      | 'agent-status'
      | 'notifications'
      | 'messenger'
      | 'activity-log'

    export type WsInboundMessage = {
      type: 'subscribe' | 'unsubscribe'
      channel: WsChannel
      params?: Record<string, string>  // sessionId, channelId 등
    }

    export type WsOutboundMessage = {
      type: 'connected' | 'subscribed' | 'data' | 'error' | 'server-restart'
      channel?: WsChannel
      data?: unknown
      code?: string
    }
    ```

- [x] Task 6: `app/src/stores/ws-store.ts` 클라이언트 WS 상태 관리 (AC: #4)
  - [x] 자동 재연결 (3초 간격, 비정상 종료 시)
  - [x] server-restart 수신 시 3초 후 재연결
  - [x] subscribe(channel, params) 메서드 추가

## Dev Notes

### ⚠️ 현재 코드베이스 상태

**이미 구성된 항목:**

| 항목 | 파일 | 상태 | 비고 |
|------|------|------|------|
| `ws/` 디렉토리 | `packages/server/src/ws/` | ✅ 존재 (비어있음) | 파일 추가만 필요 |
| Hono 앱 타입 | `server/src/types.ts` | ✅ 완성 | `AppEnv` — tenant Variable |
| JWT 검증 | `middleware/auth.ts` | ✅ 완성 | `verify()` 함수 재사용 가능 |
| TenantContext 타입 | `shared/src/types.ts` | ✅ 완성 | `{ companyId, userId, role }` |

**신규 생성 필요:**

| 파일 | 용도 |
|------|------|
| `packages/server/src/lib/event-bus.ts` | Bun EventEmitter 싱글톤 |
| `packages/server/src/ws/server.ts` | WS 서버 + 연결 관리 |
| `packages/server/src/ws/channels.ts` | 채널 권한 검증 + 브로드캐스트 |

**수정 필요:**

| 파일 | 현재 상태 | 수정 내용 |
|------|----------|----------|
| `packages/server/src/index.ts` | WS 라우트 없음 | `/ws` 등록 + `websocket` export |
| `packages/shared/src/types.ts` | WS 타입 없음 | `WsChannel`, `WsInboundMessage`, `WsOutboundMessage` 추가 |
| `packages/app/src/stores/ws-store.ts` | 미생성 (Story 1.4 예정) | 실제 WS 서버 연결 + 재연결 로직 통합 확인 |

### 구현 패턴

**event-bus.ts:**

```typescript
// packages/server/src/lib/event-bus.ts
import { EventEmitter } from 'events'

class EventBus extends EventEmitter {}
export const eventBus = new EventBus()
```

**ws/server.ts 핵심 패턴:**

```typescript
// packages/server/src/ws/server.ts
import { createBunWebSocket } from 'hono/bun'
import { verify } from 'hono/jwt'
import type { ServerWebSocket } from 'bun'

const JWT_SECRET = process.env.JWT_SECRET || 'corthex-v2-dev-secret-change-in-production'

export type WsClient = {
  ws: ServerWebSocket<unknown>
  userId: string
  companyId: string
  role: 'admin' | 'user'
  subscriptions: Set<string>   // 'chat-stream::sessionId' 형태
  connectedAt: Date
}

// userId → WsClient 배열 (최대 3개)
const clientMap = new Map<string, WsClient[]>()

export const { upgradeWebSocket, websocket } = createBunWebSocket()

export const wsRoute = upgradeWebSocket(async (c) => {
  const token = c.req.query('token')
  let tenant: { sub: string; companyId: string; role: 'admin' | 'user' } | null = null

  try {
    tenant = await verify(token ?? '', JWT_SECRET, 'HS256') as any
  } catch {
    // JWT 검증 실패 — onOpen에서 처리
  }

  return {
    onOpen(event, ws) {
      if (!tenant) {
        ws.close(4001, 'Unauthorized')
        return
      }

      const client: WsClient = {
        ws: ws.raw as ServerWebSocket<unknown>,
        userId: tenant.sub,
        companyId: tenant.companyId,
        role: tenant.role,
        subscriptions: new Set(),
        connectedAt: new Date(),
      }

      // 최대 3개 연결 제한
      const existing = clientMap.get(tenant.sub) ?? []
      if (existing.length >= 3) {
        const oldest = existing.shift()! // 가장 오래된 연결 제거
        oldest.ws.close(4002, 'Connection limit exceeded')
      }
      existing.push(client)
      clientMap.set(tenant.sub, existing)

      ws.send(JSON.stringify({ type: 'connected', userId: tenant.sub, companyId: tenant.companyId }))
    },

    onMessage(event, ws) {
      // channels.ts에서 처리
    },

    onClose(event, ws) {
      // 클라이언트 맵에서 제거
      if (!tenant) return
      const clients = clientMap.get(tenant.sub) ?? []
      const updated = clients.filter((c) => c.ws !== ws.raw)
      if (updated.length === 0) clientMap.delete(tenant.sub)
      else clientMap.set(tenant.sub, updated)
    },
  }
})

// 서버 재시작 브로드캐스트
export function broadcastServerRestart() {
  for (const clients of clientMap.values()) {
    for (const client of clients) {
      client.ws.send(JSON.stringify({ type: 'server-restart' }))
      client.ws.close(1001, 'Server restarting')
    }
  }
  clientMap.clear()
}

export { clientMap }
```

**index.ts 수정 핵심 (WebSocket 등록):**

```typescript
// packages/server/src/index.ts 수정
import { wsRoute, websocket, broadcastServerRestart } from './ws/server'
import { eventBus } from './lib/event-bus'
import { broadcastToCompany } from './ws/channels'

// WS 라우트 등록 (기존 app.route들 다음에 추가)
app.get('/ws', wsRoute)

// EventBus → WS 브리지
eventBus.on('activity', (data: { companyId: string; payload: unknown }) => {
  broadcastToCompany(data.companyId, 'activity-log', data.payload)
})

// SIGTERM에서 WS 클라이언트 알림
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM 수신 — 클라이언트 연결 종료 중...')
  broadcastServerRestart()
  setTimeout(() => process.exit(0), 10_000)
})

// ⚠️ Bun WS 사용 시 export 형태 변경 필수
export default {
  port,
  fetch: app.fetch,
  websocket,  // Bun WebSocket 핸들러 추가
}
```

**클라이언트 ws-store.ts 재연결 패턴:**

```typescript
// packages/app/src/stores/ws-store.ts — connect() 핵심 패턴
connect: (token: string) => {
  const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws?token=${token}`
  const ws = new WebSocket(url)

  ws.onopen = () => set({ isConnected: true })

  ws.onclose = (event) => {
    set({ isConnected: false, socket: null })
    if (event.code === 1001 || !event.wasClean) {
      // server-restart 또는 비정상 종료 → 3초 후 재연결
      setTimeout(() => get().connect(token), 3000)
    }
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.type === 'server-restart') {
      // 서버 재시작 알림 → 즉시 재연결 예약
      setTimeout(() => get().connect(token), 3000)
    }
  }

  set({ socket: ws })
}
```

### Bun WebSocket 주의사항

Bun에서 `createBunWebSocket`을 사용할 때 `export default`에 `websocket` 핸들러를 반드시 포함해야 함:

```typescript
// 이렇게 해야 Bun이 WS 요청을 처리함
export default {
  port,
  fetch: app.fetch,
  websocket,  // ← 이 필드 없으면 WS 연결 불가
}
```

현재 `index.ts`는 `export default { port, fetch: app.fetch }`만 있어서 WS 추가 시 반드시 `websocket` 필드 추가 필요.

### EventBus 브로드캐스트 흐름

```
채팅 라우트 / 도구 실행 / 에이전트 서비스
  ↓ eventBus.emit('activity', { companyId, payload })
event-bus.ts (Bun EventEmitter 싱글톤)
  ↓ index.ts의 eventBus.on('activity', ...) 수신
ws/channels.ts broadcastToCompany()
  ↓ clientMap 순회
연결된 클라이언트 WebSocket.send()
```

### Project Structure Notes

```
packages/server/src/
├── lib/
│   ├── event-bus.ts          ← 신규 생성 (Bun EventEmitter 싱글톤)
│   └── crypto.ts             ✅ 기존
├── ws/
│   ├── server.ts             ← 신규 생성 (WS 연결 관리 + createBunWebSocket)
│   └── channels.ts           ← 신규 생성 (채널 권한 검증 + 브로드캐스트)
└── index.ts                  ← 수정: /ws 라우트 + websocket export + EventBus 연결

packages/app/src/stores/
└── ws-store.ts               ← Story 1.4 예정 (자동 재연결 로직 통합 확인)

packages/shared/src/
└── types.ts                  ← 수정: WsChannel, WsInboundMessage, WsOutboundMessage 추가
```

### 파일명 컨벤션

- `event-bus.ts` (kebab-case)
- `ws/server.ts`, `ws/channels.ts` (kebab-case)
- 클라이언트: `ws-store.ts` (kebab-case, Story 1.4와 동일)

### References

- [Source: epics.md#Story 1.9] — AC 및 story
- [Source: architecture.md#Decision 1] — WS 단일 연결 멀티플렉싱, 채널 5개, 메시지 형식
- [Source: architecture.md#Decision 2] — EventBus 패턴, Bun EventEmitter
- [Source: architecture.md#Decision 16] — 채널별 권한 검증 + 최대 3개 연결
- [Source: packages/server/src/middleware/auth.ts] — JWT `verify()` 재사용 (WS 연결 시 토큰 검증)
- [Source: packages/server/src/index.ts] — 현재 export default 구조 (`websocket` 추가 필요)
- [Source: packages/shared/src/types.ts] — WS 타입 추가 위치

## Dev Agent Record

### Agent Model Used

claude-opus-4-6

### Debug Log References

### Completion Notes List

- ✅ Task 1: event-bus.ts — Bun EventEmitter 싱글톤
- ✅ Task 2: ws/server.ts — createBunWebSocket, JWT 검증, 최대 3개 연결, SIGTERM 브로드캐스트
- ✅ Task 3: ws/channels.ts — 5채널 권한 검증 (chat-stream/agent-status/notifications/messenger/activity-log)
- ✅ Task 4: index.ts — /ws 라우트 + websocket export + EventBus→WS 브리지
- ✅ Task 5: shared/types.ts — WsChannel, WsInboundMessage, WsOutboundMessage
- ✅ Task 6: ws-store.ts — 자동 재연결 + subscribe + server-restart 처리
- ✅ 빌드 성공, 74 tests pass, 0 fail

### Change Log

- 2026-03-05: Story 1.9 구현 완료 — WebSocket 서버 + EventBus + 채널 권한 + 클라이언트 재연결

### File List

- packages/server/src/lib/event-bus.ts (신규 — EventBus 싱글톤)
- packages/server/src/ws/server.ts (신규 — WS 서버 + 연결 관리)
- packages/server/src/ws/channels.ts (신규 — 채널 권한 검증 + 브로드캐스트)
- packages/server/src/index.ts (수정 — /ws 라우트 + websocket export + EventBus 브리지)
- packages/shared/src/types.ts (수정 — WS 메시지 타입 3종)
- packages/app/src/stores/ws-store.ts (수정 — 자동 재연결 + subscribe)
