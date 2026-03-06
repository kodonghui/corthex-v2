# Story 16.2: 실시간 메시지 + AI 에이전트 호출

Status: done

## Story

As a workspace user (직원),
I want real-time message delivery via WebSocket and the ability to invoke AI agents in messenger channels,
so that I can communicate instantly without polling and get AI assistance directly in team conversations.

## Acceptance Criteria

1. **Given** 메시지 전송 **When** `POST /channels/:id/messages` 성공 **Then** WebSocket `messenger::channelId`로 실시간 브로드캐스트 (기존 5초 폴링 대체)
2. **Given** 프론트엔드 메신저 **When** WebSocket 연결됨 **Then** 채널 선택 시 `messenger` 채널 구독 → 실시간 메시지 수신 → UI 자동 업데이트
3. **Given** 메시지 입력 **When** `@에이전트이름` 멘션 포함 메시지 전송 **Then** 해당 에이전트의 AI 응답이 채널에 자동 게시 (시스템 메시지로)
4. **Given** AI 에이전트 응답 **When** 응답 생성 중 **Then** "에이전트가 입력 중..." 인디케이터 표시 → 완료 후 메시지로 표시
5. **Given** 채널 멤버 목록 **When** 온라인 상태 **Then** WebSocket 연결 기반 `●`(온라인) / `○`(오프라인) 표시
6. **Given** 메시지 전송 **When** 에이전트 멘션 **Then** `@` 입력 시 에이전트 자동완성 드롭다운 표시
7. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 success

## Tasks / Subtasks

- [x] Task 1: 서버 — 메시지 전송 시 WebSocket 브로드캐스트 (AC: #1)
  - [x] `POST /channels/:id/messages` 핸들러에서 메시지 저장 후 `broadcastToChannel(`messenger::${channelId}`, message)` 호출
  - [x] 브로드캐스트 데이터: `{ type: 'new-message', message: { id, userId, userName, content, createdAt } }`
  - [x] `broadcastToChannel` import 추가 (from `../../ws/channels`)
  - [x] 파일: `packages/server/src/routes/workspace/messenger.ts` 수정

- [x] Task 2: 프론트엔드 — WebSocket 실시간 메시지 수신 (AC: #2)
  - [x] `useWsStore`의 `subscribe('messenger', { id: channelId })` 호출 (채널 선택 시)
  - [x] `addListener(`messenger::${channelId}`, handler)` — 새 메시지 수신 시 React Query 캐시에 optimistic append
  - [x] 채널 변경 시 이전 채널 리스너 cleanup + 새 채널 구독
  - [x] `refetchInterval: 5000` 제거 (WebSocket으로 대체)
  - [x] WebSocket 미연결 시 fallback: 30초 폴링 유지
  - [x] 파일: `packages/app/src/pages/messenger.tsx` 수정

- [x] Task 3: 서버 — AI 에이전트 호출 API (AC: #3, #4)
  - [x] `POST /channels/:id/messages` 에서 `@에이전트이름` 멘션 파싱
  - [x] 멘션된 에이전트를 DB에서 조회 (같은 회사, agents 테이블)
  - [x] 에이전트 발견 시: 유저 메시지 저장 → 비동기로 AI 응답 생성 (fire-and-forget)
  - [x] AI 응답 생성 흐름:
    - `getClientForUser(userId, companyId)` → Anthropic 클라이언트 생성
    - 에이전트 soul + 최근 채널 메시지 컨텍스트로 프롬프트 구성
    - 응답을 messengerMessages에 userId=에이전트.userId로 저장
    - WebSocket 브로드캐스트 (type: 'new-message')
  - [x] 에이전트 응답 중 typing 인디케이터: `broadcastToChannel(`messenger::${channelId}`, { type: 'typing', agentName })`
  - [x] 파일: `packages/server/src/routes/workspace/messenger.ts` 수정, `packages/server/src/lib/ai.ts` 참조

- [x] Task 4: 프론트엔드 — 에이전트 멘션 자동완성 (AC: #6)
  - [x] 메시지 입력에서 `@` 감지 → 에이전트 목록 드롭다운
  - [x] 에이전트 목록: `GET /workspace/agents` (기존 API 재사용)
  - [x] 선택 시 `@에이전트이름 ` 텍스트 삽입
  - [x] 에이전트 멘션 하이라이트 (파란색 텍스트 in 드롭다운)
  - [x] 파일: `packages/app/src/pages/messenger.tsx` 수정

- [x] Task 5: 프론트엔드 — 에이전트 typing 인디케이터 (AC: #4)
  - [x] WebSocket `typing` 이벤트 수신 → 메시지 영역 하단에 "🤖 {agentName}이(가) 입력 중..." 표시
  - [x] typing 이벤트 3초 후 자동 제거 (타임아웃)
  - [x] 파일: `packages/app/src/pages/messenger.tsx` 수정

- [x] Task 6: 서버 — 온라인 상태 API (AC: #5)
  - [x] `GET /messenger/online-status` — 같은 회사 유저 중 WebSocket 연결된 유저 ID 목록 반환
  - [x] `clientMap`에서 companyId 매칭으로 필터
  - [x] 파일: `packages/server/src/routes/workspace/messenger.ts` 수정, `packages/server/src/ws/server.ts`에서 clientMap import

- [x] Task 7: 프론트엔드 — 온라인 상태 표시 (AC: #5)
  - [x] 채널 멤버 목록에서 온라인/오프라인 아이콘 (`●` emerald / `○` zinc)
  - [x] 30초마다 폴링으로 갱신
  - [x] 파일: `packages/app/src/pages/messenger.tsx` 수정

- [x] Task 8: 빌드 검증 (AC: #7)
  - [x] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### Existing Infrastructure (DO NOT re-implement)

1. **WebSocket 인프라** (`packages/server/src/ws/`)
   - `channels.ts`: `messenger` 채널 구독 핸들러 이미 구현 (멤버 권한 검증 포함)
   - `broadcastToChannel(channelKey, data)` — 구독자에게 브로드캐스트 (재사용!)
   - `broadcastToCompany(companyId, event, data)` — 회사 전체 브로드캐스트
   - `server.ts`: `clientMap` (userId → WsClient[]) — 온라인 상태 확인에 사용
   - `WsClient` 타입: `{ ws, userId, companyId, role, subscriptions, connectedAt }`

2. **프론트엔드 WebSocket** (`packages/app/src/stores/ws-store.ts`)
   - `useWsStore`: `subscribe(channel, params)`, `addListener(channelKey, fn)`, `removeListener(channelKey, fn)`
   - 기존 사용 패턴: `useChatStream.ts` 참고 — `subscribe('chat-stream', { id: sessionId })` + `addListener(`chat-stream::${sessionId}`, handler)`
   - 동일 패턴으로 `subscribe('messenger', { id: channelId })` + `addListener(`messenger::${channelId}`, handler)` 적용

3. **AI 에이전트 응답 생성** (`packages/server/src/lib/ai.ts`)
   - `getClientForUser(userId, companyId)` — 유저 CLI 토큰으로 Anthropic 클라이언트 생성
   - `generateAgentResponse(context)` — 논스트리밍 응답 생성 (메신저에서 사용)
   - 에이전트 soul/persona는 `agents.soul` 컬럼에 마크다운으로 저장됨

4. **에이전트 목록 API** (`packages/server/src/routes/workspace/chat.ts`)
   - `GET /workspace/chat/agents` — 내 에이전트 목록 (재사용 for 멘션 자동완성)

5. **기존 메신저 API** (`packages/server/src/routes/workspace/messenger.ts`)
   - `POST /channels/:id/messages` — 여기에 broadcastToChannel + 에이전트 멘션 로직 추가
   - `assertMember()` — 채널 멤버 확인 헬퍼
   - `sendMessageSchema` — `z.object({ content: z.string().min(1) })`

6. **프론트엔드 메신저** (`packages/app/src/pages/messenger.tsx`)
   - 현재 5초 폴링: `refetchInterval: 5000` — 제거 대상
   - `useAuthStore((s) => s.user)` — 현재 유저 정보
   - React Query: `useQuery`, `useMutation`, `useQueryClient`
   - `api.get/post/put/delete` 패턴

### API 구현 주의사항

- **브로드캐스트 데이터 형식**: `{ type: 'new-message', message: { id, userId, userName, content, createdAt } }` — userName 포함 필수 (프론트가 join 없이 표시)
- **에이전트 응답 userName**: 에이전트 이름 사용 (`agents.name`)
- **에이전트 멘션 파싱**: `/@(\S+)/` 정규식으로 첫 멘션 추출 → `agents` 테이블에서 name 매칭 (같은 companyId)
- **AI 호출 fire-and-forget**: 유저 메시지 응답(201)은 바로 반환. 에이전트 응답은 백그라운드에서 생성 후 WebSocket으로 전송
- **typing 이벤트**: AI 생성 시작 전 typing broadcast → 생성 완료 후 new-message broadcast
- **온라인 상태**: `clientMap` 순회 시 O(n) — 현재 규모에서 문제 없음. `clientMap`은 `server.ts`에서 export됨

### 프론트엔드 구현 주의사항

- **WebSocket 실시간 메시지 수신 패턴** (useChatStream.ts 참고):
  ```ts
  // messenger.tsx에서:
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()

  useEffect(() => {
    if (!selectedChannel || !isConnected) return
    subscribe('messenger', { id: selectedChannel })
    const handler = (data: unknown) => {
      const event = data as { type: string; message?: Message; agentName?: string }
      if (event.type === 'new-message' && event.message) {
        // React Query 캐시에 optimistic append
        queryClient.setQueryData(['messenger-messages', selectedChannel], (old: any) => ({
          data: [...(old?.data || []), event.message]
        }))
        // 채널 목록 lastMessage 갱신
        queryClient.invalidateQueries({ queryKey: ['messenger-channels'] })
      }
      if (event.type === 'typing') {
        setTypingAgent(event.agentName || null)
      }
    }
    const channelKey = `messenger::${selectedChannel}`
    addListener(channelKey, handler)
    return () => removeListener(channelKey, handler)
  }, [selectedChannel, isConnected])
  ```
- **멘션 자동완성**: `@` 키 감지 → 드롭다운. 기존 에이전트 목록 API 재사용. 간단한 prefix match
- **typing 인디케이터**: 메시지 목록 하단(messagesEndRef 위)에 표시. 3초 타임아웃으로 자동 숨김
- **폴링 fallback**: `refetchInterval: isConnected ? false : 30000` — WebSocket 끊기면 30초 폴링

### 보안 고려사항

- 에이전트 호출: 채널 멤버만 가능 (assertMember 재사용)
- 에이전트 응답: 해당 유저의 CLI 토큰 사용 (비용 격리)
- companyId 테넌트 격리 모든 쿼리에 적용
- `clientMap` 접근: 같은 companyId 필터링 (다른 회사 온라인 상태 노출 방지)

### UX 결정사항 (ux-design-specification.md #10.8)

- 온라인 상태: `●`(emerald) 온라인 / `○`(오프라인). WebSocket 연결 기반
- 에이전트 메시지: 좌측 정렬. 에이전트 이름 + 아이콘. 일반 메시지와 동일 버블
- typing 인디케이터: 메시지 영역 하단 `🤖 {agentName}이(가) 입력 중...` 텍스트

### Project Structure Notes

- `packages/server/src/routes/workspace/messenger.ts` (수정 — WebSocket broadcast + 에이전트 멘션 파싱/호출)
- `packages/server/src/ws/server.ts` (참조 — clientMap export 확인)
- `packages/app/src/pages/messenger.tsx` (수정 — WebSocket 실시간 수신 + 멘션 자동완성 + typing 인디케이터 + 온라인 상태)
- 신규 파일 없음 — 기존 파일 확장

### References

- [Source: packages/server/src/ws/channels.ts#messenger] — WebSocket messenger 구독 핸들러
- [Source: packages/server/src/ws/channels.ts#broadcastToChannel] — 채널 브로드캐스트 함수
- [Source: packages/server/src/ws/server.ts#clientMap] — 온라인 유저 추적 맵
- [Source: packages/app/src/stores/ws-store.ts] — 프론트엔드 WebSocket 스토어
- [Source: packages/app/src/hooks/use-chat-stream.ts] — WebSocket 리스너 패턴 참조
- [Source: packages/server/src/lib/ai.ts#getClientForUser] — AI 클라이언트 생성
- [Source: packages/server/src/routes/workspace/messenger.ts] — 기존 메신저 API
- [Source: packages/app/src/pages/messenger.tsx] — 기존 메신저 UI
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.8] — 메신저 UX 스펙
- [Source: _bmad-output/implementation-artifacts/16-1-messenger-channel-mgmt.md] — 이전 스토리

### Previous Story Intelligence (16-1)

- messenger.ts 수정 패턴: 기존 라우트 파일에 엔드포인트 추가. Hono + zValidator + Drizzle ORM
- assertMember() 헬퍼 재사용
- React Query: mutation 성공 시 invalidateQueries 패턴
- 프론트엔드 모달/UI: 인라인 컴포넌트 (별도 파일 분리 없음)
- messenger 채널 WebSocket 구독 + broadcastToChannel은 16-1에서 의도적으로 미구현 → 이번 스토리에서 구현
- TEA 79건, Code Review 0 HIGH 이슈
- api.put/api.delete 사용 확인됨

### Git Intelligence

Recent commits:
- `109c225` feat: Story 16-1 메신저 채널 관리 — 수정/삭제/나가기 + 설정 모달 + TEA 79건
- `a55e762` docs: Epic 15 회고 완료 — 운영 도구 5/5 스토리 100% + 테스트 255건
- `8940977` feat: Story 15-5 조직도 뷰어 — 3단계 트리 UI + API + TEA 46건

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Added broadcastToChannel call after message insert in POST /channels/:id/messages. Broadcasts { type: 'new-message', message } with userName from users table.
- Task 2: Replaced 5s polling with WebSocket real-time. subscribe('messenger', { id }) + addListener for optimistic append to React Query cache. Fallback: 30s poll when WS disconnected.
- Task 3: Added handleAgentMention() — parses @mention via regex, looks up agent by name+companyId, fire-and-forget AI response using getClientForUser + claude-sonnet-4-5. Broadcasts typing indicator before, new-message after. Error handling broadcasts fallback message.
- Task 4: Added mention autocomplete: @ detection in input, GET /workspace/agents query, dropdown with @agentName display, selection inserts text.
- Task 5: Added typing indicator display: WebSocket 'typing' event → animated "🤖 {name}이(가) 입력 중..." with 3s auto-dismiss timeout.
- Task 6: Added GET /messenger/online-status — iterates clientMap, filters by companyId, returns online user IDs.
- Task 7: Added online status display: 30s polling, ●/○ indicators in channel settings member list.
- Task 8: Build 8/8 success. 44 unit tests pass (all new tests pass, 14 pre-existing failures from Story 15-1 migration tests unrelated).
- TEA: 84 tests total (expanded from 44 during TEA phase). Added: channel key construction, typing timeout, agent autocomplete filter, broadcast serialization, multi-company isolation, message order, mention stress tests, concurrent dedup simulation, agent soul context, WS event discrimination.

### File List

- packages/server/src/routes/workspace/messenger.ts (modified — WebSocket broadcast, agent mention parsing, handleAgentMention, online status API)
- packages/app/src/pages/messenger.tsx (modified — WebSocket real-time messages, mention autocomplete, typing indicator, online status)
- packages/server/src/__tests__/unit/messenger-realtime-agent.test.ts (new — 84 tests)
