# Story 19.2: 실시간 채팅 API + WebSocket 채널

Status: done

## Story

As a Human Employee (CEO/Employee),
I want real-time chat REST APIs and WebSocket message streaming for 1:1 and group conversations,
so that I can send and receive messages instantly without page refresh.

## Acceptance Criteria

1. **메시지 CRUD API**: POST /conversations/:id/messages (메시지 전송), GET /conversations/:id/messages (커서 페이지네이션), DELETE /conversations/:id/messages/:msgId (soft delete)
2. **대화방 API**: POST /conversations (생성 — ConversationService.create 활용), GET /conversations (목록 — ConversationService.list 활용), GET /conversations/:id (상세 + 참여자 — ConversationService.getById 활용)
3. **참여자 API**: POST /conversations/:id/participants (그룹 대화방 참여자 추가), DELETE /conversations/:id/participants/me (그룹 대화방 나가기)
4. **읽음 처리 API**: POST /conversations/:id/read (markAsRead 활용), GET /conversations/unread (각 대화방별 unread count)
5. **WebSocket 채널**: `conversation` 채널 구독 (params: {id: conversationId}) → 실시간 new-message, typing, read-receipt 이벤트 수신
6. **WebSocket 권한**: 구독 시 conversationParticipants에서 userId+companyId 검증 — 비참여자 차단
7. **타이핑 표시**: WebSocket으로 typing 이벤트 브로드캐스트 (대화방 참여자만)
8. **시스템 메시지**: 참여자 추가/나가기 시 type='system' 메시지 자동 생성

## Tasks / Subtasks

- [x] Task 1: 대화방 + 메시지 REST API 라우트 (AC: #1, #2, #3, #4)
  - [x]1.1 `packages/server/src/routes/workspace/conversations.ts` 라우트 파일 생성
  - [x]1.2 POST /conversations — ConversationService.create 호출, Zod 검증
  - [x]1.3 GET /conversations — ConversationService.list 호출
  - [x]1.4 GET /conversations/:id — ConversationService.getById 호출
  - [x]1.5 POST /conversations/:id/messages — 메시지 전송 (messages 테이블 INSERT + WebSocket broadcast)
  - [x]1.6 GET /conversations/:id/messages — 커서 페이지네이션 (createdAt 기준, limit 기본 50)
  - [x]1.7 DELETE /conversations/:id/messages/:msgId — soft delete (isDeleted=true, 본인 메시지만)
  - [x]1.8 POST /conversations/:id/participants — ConversationService.addParticipant + system 메시지
  - [x]1.9 DELETE /conversations/:id/participants/me — 그룹 나가기 + system 메시지
  - [x]1.10 POST /conversations/:id/read — ConversationService.markAsRead 호출
  - [x]1.11 GET /conversations/unread — 각 대화방별 unread count 조회
  - [x]1.12 라우트 등록: index.ts에 `app.route('/api/workspace/conversations', conversationsRoute)` 추가

- [x] Task 2: WebSocket 채널 구독 + 이벤트 (AC: #5, #6, #7)
  - [x]2.1 `packages/server/src/ws/channels.ts`에 `conversation` 채널 핸들러 추가
  - [x]2.2 구독 시 conversationParticipants 테이블에서 참여자 검증 (userId + companyId)
  - [x]2.3 구독 키: `conversation::${conversationId}`
  - [x]2.4 메시지 전송 시 broadcastToChannel로 `{ type: 'new-message', message }` 브로드캐스트
  - [x]2.5 타이핑 이벤트: POST /conversations/:id/typing → broadcastToChannel `{ type: 'typing', userId }`
  - [x]2.6 읽음 처리 시 broadcastToChannel `{ type: 'read-receipt', userId, lastReadAt }`

- [x] Task 3: 시스템 메시지 + Shared 타입 보강 (AC: #8)
  - [x]3.1 참여자 추가 시 `type='system'` 메시지 자동 INSERT: "{{userName}} 님이 참여했습니다"
  - [x]3.2 참여자 나가기 시 `type='system'` 메시지 자동 INSERT: "{{userName}} 님이 나갔습니다"
  - [x]3.3 Shared 타입 보강: SendMessageRequest, ConversationMessagesResponse 등 API 응답 타입 추가

- [x] Task 4: 단위 테스트 (AC: 전체)
  - [x]4.1 메시지 전송 Zod 스키마 검증 테스트
  - [x]4.2 커서 페이지네이션 로직 테스트
  - [x]4.3 soft delete 권한 검증 로직 테스트
  - [x]4.4 WebSocket 구독 권한 검증 로직 테스트
  - [x]4.5 시스템 메시지 생성 로직 테스트

## Dev Notes

### 기존 인프라 분석

**WebSocket 서버 (ws/server.ts):**
- `createBunWebSocket()` 사용 (Hono), JWT 쿼리 파라미터 인증
- `WsClient` = { ws, userId, companyId, role, subscriptions: Set<string> }
- `clientMap: Map<userId, WsClient[]>` — 유저당 최대 3개 연결
- 이벤트: `onOpen`, `onMessage`, `onClose`

**채널 구독 (ws/channels.ts):**
- `handleSubscription(client, message)` — subscribe/unsubscribe 처리
- 기존 `messenger` 채널은 messengerChannels 기반 (Slack 스타일) — **건드리지 않을 것**
- **새로운 `conversation` 채널 추가** — conversations 테이블 기반 (1:1/그룹)
- `broadcastToChannel(channelKey, data)` — 해당 채널 구독자 전원에게 전송
- `broadcastToCompany(companyId, event, data)` — 회사 전원에게 전송

**기존 messenger 라우트 (routes/workspace/messenger.ts):**
- messengerChannels/messengerMembers/messengerMessages 테이블 사용 — 채널 기반
- 우리는 conversations/conversationParticipants/messages 테이블 사용 — 대화방 기반
- **별도 라우트 파일**: `conversations.ts` 신규 생성 (messenger.ts 건드리지 않음)

**기존 messenger 라우트 참고 패턴:**
- `assertMember()` 함수: channelId + userId + companyId로 권한 검증
- 커서 페이지네이션: `WHERE createdAt < cursor ORDER BY createdAt DESC LIMIT limit`
- 메시지 전송 후 `broadcastToChannel(\`messenger::${channelId}\`, { type: 'new-message', message })`
- unread count: `WHERE createdAt > lastReadAt`

### 19-1에서 만든 것 (이번 스토리의 기반)

**ConversationService** (`services/messenger/conversation.ts`):
- `create(companyId, type, participantIds, name?)` — 1:1 중복 방지 포함
- `list(companyId, userId)` — 대화방 목록 + lastMessage + unreadCount
- `getById(id, companyId)` — 대화방 상세 + 참여자 목록
- `addParticipant(conversationId, userId, companyId)` — 그룹만
- `markAsRead(conversationId, userId, companyId)` — lastReadAt 갱신

**DB 스키마:**
- conversations: id, companyId, type, name, isActive, createdAt, updatedAt
- conversationParticipants: conversationId+userId PK, companyId, joinedAt, lastReadAt
- messages: id, conversationId, senderId, companyId, content, type, isDeleted, createdAt, updatedAt

**Shared 타입:**
- Conversation, ConversationParticipant, Message, ConversationListItem, CreateConversationRequest

### WsChannel 타입

`packages/shared/src/types.ts`에 `WsChannel` union이 이미 존재:
```typescript
export type WsChannel = 'chat-stream' | 'agent-status' | 'notifications' | 'messenger' | ...
```
- `'messenger'`는 기존 채널 기반 — 유지
- **`'conversation'` 추가 필요** — 대화방 기반 새 채널

### 라우트 등록 패턴

`packages/server/src/index.ts`:
```typescript
import { messengerRoute } from './routes/workspace/messenger'
app.route('/api/workspace/messenger', messengerRoute)
```
- 동일 패턴으로 `/api/workspace/conversations` 추가

### 인증 패턴

```typescript
import { authMiddleware } from '../../middleware/auth'
const app = new Hono().use('*', authMiddleware)
// c.get('tenant') -> { companyId, userId, role }
```

### API 응답 패턴

```typescript
return c.json({ success: true, data: result })
return c.json({ success: false, error: { code: 'NOT_FOUND', message: '...' } }, 404)
```

### v1 참고

v1에는 사내 메신저 기능 없음 (Phase 3 신규 기능). 기존 messenger.ts의 패턴을 따르되, conversations 테이블 기반으로 구현.

### Project Structure Notes

**신규 파일:**
- `packages/server/src/routes/workspace/conversations.ts` — REST API 라우트

**수정 파일:**
- `packages/server/src/ws/channels.ts` — conversation 채널 핸들러 추가
- `packages/shared/src/types.ts` — WsChannel에 'conversation' 추가, API 타입 추가
- `packages/server/src/index.ts` — 라우트 등록
- `packages/server/src/services/messenger/conversation.ts` — 필요 시 메서드 추가 (sendMessage 등)

**참조 파일 (수정하지 않음):**
- `packages/server/src/routes/workspace/messenger.ts` — 기존 채널 기반 메신저 (패턴 참조)
- `packages/server/src/ws/server.ts` — WebSocket 서버 (clientMap 참조)
- `packages/server/src/middleware/auth.ts` — authMiddleware 패턴

### References

- [Source: packages/server/src/ws/channels.ts] — 기존 채널 구독 + broadcastToChannel
- [Source: packages/server/src/ws/server.ts] — WebSocket 서버, clientMap
- [Source: packages/server/src/routes/workspace/messenger.ts] — 기존 messenger 라우트 패턴
- [Source: packages/server/src/index.ts#L138] — 라우트 등록 패턴
- [Source: packages/server/src/services/messenger/conversation.ts] — 19-1 ConversationService
- [Source: packages/shared/src/types.ts#L456-473] — WsChannel 타입
- [Source: packages/server/src/db/schema.ts#L628-669] — conversations/messages 스키마
- [Source: _bmad-output/planning-artifacts/epics.md#L1352] — E19-S2 정의
- [Source: _bmad-output/planning-artifacts/prd.md#L909] — FR76 사내 메신저

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: conversations.ts 라우트 파일 생성 — 12개 REST 엔드포인트 (POST/GET/DELETE conversations, messages, participants, read, typing, unread)
- Task 2: ws/channels.ts에 'conversation' 채널 핸들러 추가 — conversationParticipants 테이블 기반 권한 검증, conversation::${id} 구독 키
- Task 3: shared types에 SendMessageRequest, ConversationMessagesResponse, ConversationUnreadItem 타입 추가. 시스템 메시지 자동 생성 (참여/나가기)
- Task 4: 29개 단위 테스트 (Zod 스키마 11 + 커서 페이지네이션 4 + soft delete 2 + WebSocket 3 + 시스템 메시지 6 + 자동 참여자 포함 3). DB 연동 없이 순수 로직 검증
- TypeScript 컴파일 이슈 없음 (server, shared 모두 clean)
- 기존 테스트 회귀 없음 (185 tests pass across batches)
- Code Review: assertParticipant 필드명 visitorId → participantUserId 수정 (가독성)
- Code Review: participant delete에 companyId 필터 누락 → 추가 완료 (테넌트 격리 보안 이슈)
- WsChannel 타입에 'conversation' 추가
- index.ts에 conversationsRoute 등록 (/api/workspace/conversations)

### File List
- packages/server/src/routes/workspace/conversations.ts -- [NEW] REST API 12개 엔드포인트
- packages/server/src/ws/channels.ts -- [MODIFIED] conversation 채널 핸들러 + conversationParticipants import 추가
- packages/shared/src/types.ts -- [MODIFIED] WsChannel에 'conversation' 추가, SendMessageRequest/ConversationMessagesResponse/ConversationUnreadItem 타입 추가
- packages/server/src/index.ts -- [MODIFIED] conversationsRoute import + 라우트 등록
- packages/server/src/__tests__/unit/conversation-api.test.ts -- [NEW] 29개 단위 테스트
