# Story 19.3: 1:1 + 그룹 메시지 UI

Status: done

## Story

As a Human Employee (CEO/Employee),
I want a conversation-based messenger UI with 1:1 and group chat support,
so that I can create conversations, send/receive messages in real-time, and manage my chat rooms.

## Acceptance Criteria

1. **대화 목록 패널**: 좌측 패널에 참여 중인 대화방 목록 표시 — lastMessage 미리보기, unread count 뱃지, updatedAt 기준 정렬
2. **1:1 대화 시작**: "새 대화" 버튼 → 회사 내 사용자 검색 → 선택 시 1:1 대화방 생성 (POST /conversations)
3. **그룹 대화 생성**: "그룹 만들기" → 복수 사용자 선택 + 그룹명 입력 → 그룹 대화방 생성 (type: 'group')
4. **메시지 영역**: 우측에 선택된 대화방의 메시지 표시 — 시간순 (오래된 것 위), 커서 페이지네이션으로 이전 메시지 로드
5. **메시지 전송**: 하단 입력창에서 메시지 작성 + Enter로 전송 (POST /conversations/:id/messages), 즉시 UI 반영
6. **실시간 수신**: WebSocket `conversation::${id}` 채널 구독 → new-message 이벤트로 실시간 메시지 수신
7. **타이핑 표시**: 상대방이 타이핑 중이면 "입력 중..." 표시 (typing 이벤트)
8. **읽음 처리**: 대화방 진입 시 자동 읽음 처리 (POST /conversations/:id/read), unread count 갱신
9. **메시지 삭제**: 본인 메시지 우클릭/롱프레스 → "삭제" → soft delete (DELETE /conversations/:id/messages/:msgId)
10. **시스템 메시지**: 참여자 추가/나가기 시스템 메시지를 별도 스타일로 표시
11. **그룹 나가기**: 그룹 대화방에서 "나가기" 옵션 제공 (DELETE /conversations/:id/participants/me)
12. **라우팅**: `/messenger` 경로에서 기존 채널 메신저와 대화 메신저를 탭으로 구분 (채널 | 대화)

## Tasks / Subtasks

- [x] Task 1: 대화 목록 + 라우팅 통합 (AC: #1, #12)
  - [x] 1.1 `packages/app/src/pages/messenger.tsx` 수정 — 상단에 "채널"/"대화" 탭 추가
  - [x] 1.2 `packages/app/src/components/messenger/conversations-panel.tsx` 생성 — 대화 목록 컴포넌트
  - [x] 1.3 React Query로 `GET /api/workspace/conversations` + `GET /api/workspace/conversations/unread` 호출
  - [x] 1.4 대화방 목록 렌더링: 아바타, 이름 (1:1=상대방 이름, 그룹=그룹명), lastMessage 미리보기, unread 뱃지
  - [x] 1.5 대화방 클릭 시 우측 채팅 영역 전환 (URL searchParam: `?tab=conversations&conv=<id>`)

- [x] Task 2: 새 대화 생성 모달 (AC: #2, #3)
  - [x] 2.1 `packages/app/src/components/messenger/new-conversation-modal.tsx` 생성
  - [x] 2.2 사용자 검색: `GET /api/workspace/employees` (기존 API) → 검색 + 선택
  - [x] 2.3 1:1 모드: 사용자 1명 선택 → `POST /api/workspace/conversations` (type: 'direct')
  - [x] 2.4 그룹 모드: 복수 선택 + 그룹명 입력 → `POST /api/workspace/conversations` (type: 'group')
  - [x] 2.5 생성 후 자동으로 해당 대화방 선택 + 목록 갱신

- [x] Task 3: 채팅 영역 — 메시지 목록 + 전송 (AC: #4, #5, #9, #10)
  - [x] 3.1 `packages/app/src/components/messenger/conversation-chat.tsx` 생성
  - [x] 3.2 `GET /api/workspace/conversations/:id/messages` — React Query infinite query (커서 페이지네이션)
  - [x] 3.3 메시지 렌더링: 본인(우측 파랑) / 상대방(좌측 회색) / 시스템(가운데 연한 배경)
  - [x] 3.4 스크롤: 최하단 자동 스크롤, 위로 스크롤 시 이전 메시지 로드
  - [x] 3.5 메시지 입력창: Enter 전송, Shift+Enter 줄바꿈
  - [x] 3.6 본인 메시지 삭제: 메시지 hover → 삭제 아이콘 → 확인 후 DELETE 호출
  - [x] 3.7 시스템 메시지 별도 스타일 (가운데 정렬, 회색 텍스트)

- [x] Task 4: WebSocket 실시간 연동 (AC: #6, #7, #8)
  - [x] 4.1 대화방 선택 시 `subscribe('conversation', { id: conversationId })` 호출
  - [x] 4.2 `addListener('conversation::${id}', handler)` — new-message 이벤트 → React Query 캐시 업데이트
  - [x] 4.3 typing 이벤트 수신 → "입력 중..." 표시 (3초 타임아웃 자동 해제)
  - [x] 4.4 read-receipt 이벤트 수신 → 읽음 상태 표시
  - [x] 4.5 대화방 진입 시 `POST /api/workspace/conversations/:id/read` 자동 호출
  - [x] 4.6 입력 중 타이핑 이벤트 전송: `POST /api/workspace/conversations/:id/typing` (debounce 2초)
  - [x] 4.7 대화방 전환 시 이전 채널 unsubscribe → 새 채널 subscribe

- [x] Task 5: 그룹 관리 + 나가기 (AC: #11)
  - [x] 5.1 그룹 대화방 헤더에 참여자 수 + "나가기" 버튼
  - [x] 5.2 나가기 확인 모달 → `DELETE /api/workspace/conversations/:id/participants/me`
  - [x] 5.3 나가기 후 대화 목록에서 해당 대화방 제거 + 목록 갱신

- [x] Task 6: 단위 테스트 (AC: 전체)
  - [x] 6.1 대화 목록 정렬 로직 (updatedAt desc) 테스트
  - [x] 6.2 unread count 표시 로직 테스트
  - [x] 6.3 메시지 분류 로직 (본인/상대방/시스템) 테스트
  - [x] 6.4 타이핑 debounce 로직 테스트
  - [x] 6.5 대화방 이름 표시 로직 (1:1=상대방 이름, 그룹=그룹명) 테스트

## Dev Notes

### 기존 인프라 분석

**CEO App 라우팅 (App.tsx):**
- React Router v7, lazy loading: `const MessengerPage = lazy(() => import('./pages/messenger'))`
- `/messenger` 경로에 이미 `<MessengerPage />` 매핑
- 사이드바 `sidebar.tsx`에 `{ to: '/messenger', label: '메신저', icon: '💭' }` 있음

**기존 메신저 페이지 (messenger.tsx):**
- 채널(Slack 스타일) 기반 메신저 — messengerChannels/messengerMembers/messengerMessages 테이블
- 1000줄+ 대형 파일 — **이 파일 수정 최소화**, 탭 분리 방식으로 공존
- 채널 목록(좌측) + 메시지(우측) 2-column 레이아웃
- searchParams으로 channelId 관리

**상태 관리:**
- React Query (`@tanstack/react-query`): 서버 데이터 캐싱
- Zustand: 클라이언트 상태 (auth-store, ws-store)
- WebSocket: `useWsStore`의 `subscribe()`, `addListener()`, `removeListener()`

**API 클라이언트 (lib/api.ts):**
- `api.get<T>(path)`, `api.post<T>(path, body)`, `api.delete<T>(path)`
- JWT 자동 첨부, 401 자동 리다이렉트

**WebSocket 구독 패턴 (ws-store.ts):**
```typescript
const { subscribe, addListener, removeListener } = useWsStore()
// 구독
subscribe('conversation', { id: conversationId })
// 리스너 등록
addListener(`conversation::${conversationId}`, handler)
// 정리
removeListener(`conversation::${conversationId}`, handler)
```
- `subscribe(channel, params)` → 서버에 `{ type: 'subscribe', channel, params }` 전송
- `addListener(channelKey, fn)` → 해당 channelKey로 들어오는 데이터 수신
- 서버에서 `broadcastToChannel('conversation::${id}', data)` → 클라이언트 `msg.channelKey` 매칭

**UI 컴포넌트 (@corthex/ui):**
- Input, Button, Card, Modal, Skeleton, toast 등 사용 가능
- Tailwind CSS v4

### 19-2에서 만든 API (이번 스토리의 기반)

**REST 엔드포인트:**
- `POST /api/workspace/conversations` — 대화방 생성
- `GET /api/workspace/conversations` — 대화방 목록 (lastMessage, unreadCount 포함)
- `GET /api/workspace/conversations/unread` — unread count
- `GET /api/workspace/conversations/:id` — 대화방 상세 + 참여자
- `POST /api/workspace/conversations/:id/messages` — 메시지 전송
- `GET /api/workspace/conversations/:id/messages?cursor=&limit=` — 메시지 목록 (커서 페이지네이션)
- `DELETE /api/workspace/conversations/:id/messages/:msgId` — 메시지 soft delete
- `POST /api/workspace/conversations/:id/participants` — 참여자 추가
- `DELETE /api/workspace/conversations/:id/participants/me` — 나가기
- `POST /api/workspace/conversations/:id/read` — 읽음 처리
- `POST /api/workspace/conversations/:id/typing` — 타이핑 이벤트

**WebSocket 채널:**
- `conversation` 채널: `subscribe('conversation', { id })` → `conversation::${id}` 구독
- 이벤트: `new-message`, `typing`, `read-receipt`, `message-deleted`, `participant-added`, `participant-left`

**Shared 타입:**
- Conversation, ConversationParticipant, Message, ConversationListItem
- CreateConversationRequest, SendMessageRequest, ConversationMessagesResponse, ConversationUnreadItem
- ConversationType = 'direct' | 'group', MessageType = 'text' | 'system' | 'ai_report'

### 구현 전략

**탭 분리 방식:**
- `messenger.tsx`를 최소 수정 — 상단에 "채널"/"대화" 탭 2개 추가
- "채널" 탭 = 기존 messenger.tsx 내용 그대로
- "대화" 탭 = 새 ConversationsView 컴포넌트 (별도 파일)
- URL: `/messenger?tab=channels` (기본) / `/messenger?tab=conversations&conv=<id>`

**컴포넌트 구조:**
```
messenger.tsx (탭 분리 추가)
├── (기존 채널 UI) — tab=channels
└── ConversationsView — tab=conversations
    ├── ConversationsPanel (좌측 대화 목록)
    │   └── NewConversationModal
    └── ConversationChat (우측 채팅 영역)
```

### Project Structure Notes

**신규 파일:**
- `packages/app/src/components/messenger/conversations-panel.tsx` — 대화 목록
- `packages/app/src/components/messenger/conversation-chat.tsx` — 채팅 영역
- `packages/app/src/components/messenger/new-conversation-modal.tsx` — 새 대화 모달
- `packages/app/src/components/messenger/conversations-view.tsx` — 대화 탭 래퍼

**수정 파일:**
- `packages/app/src/pages/messenger.tsx` — 상단 탭 추가 (최소 수정)

### References

- [Source: packages/app/src/pages/messenger.tsx] — 기존 채널 메신저 UI 패턴
- [Source: packages/app/src/stores/ws-store.ts] — WebSocket subscribe/addListener 패턴
- [Source: packages/app/src/lib/api.ts] — API 클라이언트
- [Source: packages/app/src/App.tsx] — 라우팅 (이미 /messenger 등록됨)
- [Source: packages/app/src/components/sidebar.tsx] — 사이드바 (이미 메신저 링크 있음)
- [Source: packages/shared/src/types.ts#L1034-1104] — Conversation/Message 타입
- [Source: packages/server/src/routes/workspace/conversations.ts] — 19-2 REST API
- [Source: _bmad-output/planning-artifacts/epics.md#L1353] — E19-S3 정의

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: messenger.tsx에 채널/대화 탭 추가 (MessengerPage → ChannelsView 리팩토링). URL searchParam 기반 탭 전환
- Task 2: new-conversation-modal.tsx 생성 — 1:1/그룹 모드 선택, 사용자 검색+선택, POST /conversations 호출
- Task 3: conversation-chat.tsx 생성 — infinite query 커서 페이지네이션, 메시지 전송, soft delete, 시스템 메시지 스타일링
- Task 4: conversations-view.tsx 생성 — WebSocket subscription 관리, 이벤트 핸들링 (new-message, typing, read-receipt)
- Task 5: conversations-panel.tsx 생성 — 대화 목록 렌더링, unread 뱃지, formatTime
- Task 6: 20개 단위 테스트 (display name 4 + avatar 2 + message classification 4 + typing debounce 3 + unread count 4 + formatTime 2 + sorting 1)
- TypeScript 빌드 정상 (app build clean)
- 기존 채널 메신저와 탭으로 공존 (채널 | 대화)

### File List
- packages/app/src/components/messenger/conversations-view.tsx -- [NEW] 대화 탭 래퍼 + WebSocket 관리
- packages/app/src/components/messenger/conversations-panel.tsx -- [NEW] 대화 목록 컴포넌트
- packages/app/src/components/messenger/conversation-chat.tsx -- [NEW] 채팅 영역 (무한 스크롤, 전송, 삭제)
- packages/app/src/components/messenger/new-conversation-modal.tsx -- [NEW] 새 대화 생성 모달
- packages/app/src/pages/messenger.tsx -- [MODIFIED] 채널/대화 탭 추가 (MessengerPage 리팩토링)
- packages/app/src/__tests__/conversation-ui.test.ts -- [NEW] 20개 단위 테스트
