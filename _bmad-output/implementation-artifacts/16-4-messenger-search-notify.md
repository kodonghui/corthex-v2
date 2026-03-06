# Story 16.4: 메신저 검색 + 알림

Status: done

## Story

As a workspace user (직원),
I want to search messages across channels and receive notifications for new messages and mentions,
so that I can quickly find past conversations and stay informed about important messages even when I'm not actively viewing the channel.

## Acceptance Criteria

1. **Given** 메신저 화면 상단 검색바 **When** 키워드 입력 후 검색 **Then** `GET /messenger/search?q=keyword` → 해당 키워드를 포함하는 메시지 목록 반환 (채널명, 발신자, 내용, 시간). 내가 멤버인 채널의 메시지만 검색됨
2. **Given** 검색 결과 목록 **When** 결과 항목 클릭 **Then** 해당 채널로 이동 + 해당 메시지 위치로 스크롤 (또는 하이라이트)
3. **Given** 검색바 **When** 빈 쿼리 또는 2자 미만 입력 **Then** 검색 실행하지 않음 (최소 2자 이상)
4. **Given** 새 메시지 수신 (WebSocket `new-message`) **When** 내가 해당 채널을 보고 있지 않을 때 **Then** 채널 목록에 안 읽은 메시지 카운트 배지 표시
5. **Given** 메시지에서 `@내이름` 멘션 수신 **When** 내가 해당 채널을 보고 있지 않을 때 **Then** 기존 notifications 테이블에 알림 생성 + WebSocket `notifications` 채널로 실시간 푸시
6. **Given** 채널 목록에서 안 읽은 배지가 있는 채널 **When** 해당 채널 클릭하여 진입 **Then** 해당 채널의 unread 카운트 초기화
7. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 success

## Tasks / Subtasks

- [x] Task 1: 서버 — 메시지 검색 API (AC: #1, #3)
  - [x] `GET /messenger/search?q=keyword&limit=30` 엔드포인트 추가
  - [x] 쿼리 파라미터: `q` (min 2자), `limit` (기본 30, 최대 100)
  - [x] SQL `ILIKE '%keyword%'` 또는 `to_tsvector/to_tsquery` (간단하게 ILIKE 사용)
  - [x] 내가 멤버인 채널의 메시지만 검색 (messengerMembers JOIN)
  - [x] 반환: `{ id, channelId, channelName, userId, userName, content, createdAt }`
  - [x] companyId 테넌트 격리 적용
  - [x] 파일: `packages/server/src/routes/workspace/messenger.ts`

- [x] Task 2: 서버 — @멘션 알림 생성 (AC: #5)
  - [x] 메시지 전송 시 `@userName` 멘션 파싱 → 해당 유저에게 notifications 테이블에 insert
  - [x] 알림 type: `messenger_mention`, title: `"#{채널명}에서 @멘션"`, body: 메시지 내용 일부, actionUrl: `/messenger?channelId=xxx`
  - [x] WebSocket `notifications` 채널로 실시간 푸시 (기존 broadcastToChannel 활용)
  - [x] @에이전트 멘션은 기존 AI 응답 로직 유지, 일반 유저 멘션만 알림
  - [x] 파일: `packages/server/src/routes/workspace/messenger.ts`

- [x] Task 3: 서버 — 채널별 미읽음 카운트 API (AC: #4, #6)
  - [x] `GET /messenger/channels/unread` — 채널별 unread 메시지 수 반환
  - [x] 로직: messengerMembers에 `lastReadAt` (timestamp) 컬럼 추가. 해당 시간 이후의 메시지 수를 집계
  - [x] `POST /messenger/channels/:id/read` — lastReadAt을 현재 시각으로 업데이트 (채널 진입 시 호출)
  - [x] DB 마이그레이션: messengerMembers에 lastReadAt 컬럼 추가
  - [x] 파일: `packages/server/src/db/schema.ts`, `packages/server/src/routes/workspace/messenger.ts`

- [x] Task 4: 프론트엔드 — 검색 UI (AC: #1, #2, #3)
  - [x] 채널 목록 상단에 검색 입력 필드 (돋보기 아이콘 + input)
  - [x] 디바운스 300ms, 최소 2자 이상일 때 API 호출
  - [x] 검색 결과 드롭다운/오버레이: 채널명, 발신자, 메시지 미리보기, 시간
  - [x] 키워드 하이라이트 (검색어 부분 bold)
  - [x] 결과 클릭 → 해당 채널 선택 (setSelectedChannel)
  - [x] ESC 또는 외부 클릭으로 결과 닫기
  - [x] 파일: `packages/app/src/pages/messenger.tsx`

- [x] Task 5: 프론트엔드 — 미읽음 배지 + 채널 진입 시 초기화 (AC: #4, #6)
  - [x] 채널 목록에서 각 채널 이름 옆에 unread 카운트 배지 (숫자, 빨간 원)
  - [x] `GET /messenger/channels/unread` 폴링 또는 WebSocket 이벤트 기반 업데이트
  - [x] 채널 선택(진입) 시 `POST /messenger/channels/:id/read` 호출 → 해당 배지 즉시 0으로
  - [x] WebSocket `new-message` 이벤트 수신 시, 현재 보고 있는 채널이 아니면 unread 카운트 +1 (로컬 상태)
  - [x] 파일: `packages/app/src/pages/messenger.tsx`

- [x] Task 6: 프론트엔드 — 멘션 알림 실시간 표시 (AC: #5)
  - [x] 기존 notifications WebSocket 채널에서 `messenger_mention` 타입 수신 시 토스트 표시
  - [x] 토스트 클릭 → actionUrl(`/messenger?channelId=xxx`)로 이동
  - [x] 기존 알림 시스템 (notifications 페이지)에서도 메신저 멘션 알림 확인 가능
  - [x] 파일: `packages/app/src/pages/messenger.tsx` (또는 기존 알림 토스트 컴포넌트)

- [x] Task 7: 빌드 검증 (AC: #7)
  - [x] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### Existing Infrastructure (DO NOT re-implement)

1. **알림 시스템** (`packages/server/src/routes/workspace/notifications.ts`)
   - notifications 테이블: id, userId, companyId, type, title, body, actionUrl, isRead, createdAt
   - 기존 type: `chat_complete`, `delegation_complete`, `tool_error`, `job_complete`, `job_error`, `system`
   - 새 type 추가: `messenger_mention`
   - 기존 알림 API: GET 목록, GET count, PATCH read, POST read-all — 그대로 사용

2. **WebSocket 인프라** (`packages/server/src/ws/`)
   - `broadcastToChannel(channelKey, data)` — 채널 구독자에게 브로드캐스트 (재사용!)
   - `notifications` 채널: 이미 구독 핸들러 존재 — 유저별 `notifications::userId`로 push
   - `messenger` 채널: `messenger::channelId`로 메시지/리액션 브로드캐스트 (16-2, 16-3에서 완성)

3. **프론트엔드 WebSocket** (`packages/app/src/stores/ws-store.ts`)
   - `subscribe('messenger', { id: channelId })` + `addListener(channelKey, handler)` 패턴
   - handler에서 `event.type` 분기: `new-message`, `typing`, `reaction-update` — 여기에 unread 로직 추가

4. **기존 메신저 API** (`packages/server/src/routes/workspace/messenger.ts`)
   - 전체 764줄. 채널 CRUD, 메시지 CRUD, 리액션, 스레드 모두 구현됨
   - `assertMember()` — 채널 멤버 확인 헬퍼 (재사용)
   - `sendMessageSchema` — `z.object({ content: z.string(), parentMessageId: z.string().uuid().optional() })`
   - `GET /channels/:id/messages` — parentMessageId IS NULL인 메인 메시지 + replyCount + reactions 반환
   - `POST /channels/:id/messages` — 메시지 전송 + WebSocket broadcast + @에이전트 멘션 핸들링

5. **프론트엔드 메신저** (`packages/app/src/pages/messenger.tsx`)
   - ChannelSettingsModal, ThreadPanel, 메시지 호버 액션, 이모지 피커, 리액션 배지 등 구현됨
   - React Query: `useQuery`, `useMutation`, `queryClient.setQueryData/invalidateQueries`
   - 상태: `selectedChannel`, `threadMessageId` — `searchQuery` 등 검색 상태 추가 필요

6. **DB 스키마** (`packages/server/src/db/schema.ts`)
   - messengerMembers: id, companyId, channelId, userId, joinedAt — `lastReadAt` 컬럼 추가 필요
   - messengerMessages: id, companyId, channelId, userId, content, parentMessageId, createdAt
   - Drizzle ORM + `bunx drizzle-kit generate` → `bunx drizzle-kit push`

### API 구현 주의사항

- **검색 API**: ILIKE `%keyword%`로 간단하게 구현. 대용량 시 full-text search 고려하나 현재는 ILIKE로 충분
- **멤버 채널만 검색**: messengerMembers와 JOIN하여 내가 멤버인 채널의 메시지만 검색 가능
- **반환 형식**: `{ id, channelId, channelName, userId, userName, content, createdAt }` — 채널명/유저명은 JOIN으로
- **@멘션 파싱**: 기존 에이전트 멘션 `content.match(/@(\S+)/)` 로직 이후, 일반 유저 멘션도 처리. 유저 이름으로 users 테이블 조회
- **unread 카운트**: `lastReadAt`이 null이면 채널 가입 시점(joinedAt) 이후 모든 메시지가 unread
- **알림 생성**: `db.insert(notifications).values({ userId, companyId, type: 'messenger_mention', ... })` + `broadcastToChannel(`notifications::${userId}`, { type: 'new-notification', ... })`
- **companyId 테넌트 격리**: 검색, unread, 알림 모든 쿼리에 companyId 필터 필수

### 프론트엔드 구현 주의사항

- **검색 UI**: 채널 목록 상단에 검색바. 결과는 절대 위치 드롭다운. `useMemo` 또는 `useQuery` + debounce 조합
- **디바운스**: `setTimeout`/`clearTimeout` 패턴으로 300ms 디바운스. 외부 라이브러리 불필요
- **unread 배지**: 채널 목록 아이템에 `if (unreadCount > 0) <span className="badge">{count}</span>` — 빨간 원 + 흰색 숫자
- **로컬 unread 카운트**: WebSocket `new-message` 수신 시 현재 채널이 아닌 메시지면 `setUnreadCounts(prev => ({...prev, [channelId]: (prev[channelId] || 0) + 1}))` — 서버 상태와 별도 로컬 관리
- **채널 진입 시 초기화**: `setSelectedChannel` 호출 시 `POST /channels/:id/read` + 로컬 unread 0으로
- **알림 토스트**: 기존 알림 시스템에 토스트가 있으면 재사용, 없으면 간단 토스트 추가

### 보안 고려사항

- 검색: 내가 멤버인 채널의 메시지만 검색 (assertMember 또는 messengerMembers JOIN)
- unread: 본인의 unread만 조회/업데이트 (userId === tenant.userId)
- 알림: 본인에게만 알림 생성 (다른 유저의 알림 생성 금지)
- companyId 테넌트 격리 모든 쿼리에 적용

### Project Structure Notes

- `packages/server/src/db/schema.ts` (수정 — messengerMembers에 lastReadAt 추가)
- `packages/server/src/routes/workspace/messenger.ts` (수정 — 검색 API, unread API, 멘션 알림 로직)
- `packages/app/src/pages/messenger.tsx` (수정 — 검색 UI, unread 배지, 멘션 알림 토스트)
- DB 마이그레이션 파일 (신규 — drizzle-kit generate로 자동 생성)

### References

- [Source: packages/server/src/routes/workspace/messenger.ts] — 기존 메신저 API 전체 (764줄, 검색/unread 추가 대상)
- [Source: packages/server/src/routes/workspace/notifications.ts] — 기존 알림 시스템 (재사용)
- [Source: packages/server/src/db/schema.ts#messengerMembers] — lastReadAt 컬럼 추가 대상
- [Source: packages/server/src/db/schema.ts#notifications] — 알림 테이블 (type: messenger_mention 추가)
- [Source: packages/app/src/pages/messenger.tsx] — 기존 메신저 UI (검색/unread UI 추가 대상)
- [Source: packages/server/src/ws/channels.ts#broadcastToChannel] — WebSocket 브로드캐스트 (재사용)
- [Source: _bmad-output/implementation-artifacts/16-3-message-reaction-thread.md] — 이전 스토리 (리액션/스레드 패턴)

### Previous Story Intelligence (16-3)

- 리액션/스레드 구현 완료: messengerReactions 테이블, parentMessageId, 호버 액션 바, 스레드 패널
- WebSocket 이벤트 타입: `new-message`, `typing`, `reaction-update` — 이번에 unread 관련 클라이언트 로직 추가
- Code Review 1 HIGH (FK 삭제 순서), 3 MEDIUM — 모두 수정됨. 안정적 코드베이스
- getReactionsMap 공통 헬퍼 패턴 — 검색 결과에도 적용 가능하나 검색에서는 불필요 (간단 결과만)
- messenger.tsx 인라인 컴포넌트 패턴 유지 — 검색 컴포넌트도 같은 파일 내에 추가
- TEA 75건 통과

### Git Intelligence

Recent commits:
- `6405dd4` feat: Story 16-3 리액션 + 스레드 — 이모지 리액션 CRUD + 스레드 패널 + TEA 75건
- `5c0d5c3` feat: Story 16-2 실시간 메시지 + AI 에이전트 — WS 브로드캐스트 + @멘션 호출 + TEA 84건
- `109c225` feat: Story 16-1 메신저 채널 관리 — 수정/삭제/나가기 + 설정 모달 + TEA 79건

패턴: `feat: Story X-Y 한글제목 — 핵심내용 + TEA N건` 형식의 커밋 메시지

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Added `GET /messenger/search?q=keyword` — ILIKE search across member channels, returns channelName/userName/content/createdAt. Min 2 chars, limit 30/100.
- Task 2: Extended @mention parsing to support multiple mentions via `matchAll`. User mentions create `messenger_mention` notification via `createNotification()` + WebSocket push. Self-mentions excluded. Agent mentions retain existing AI response logic.
- Task 3: Added `lastReadAt` column to messengerMembers. `GET /messenger/channels/unread` returns per-channel unread counts. `POST /messenger/channels/:id/read` updates lastReadAt. Migration 0026 created.
- Task 4: Search UI with debounced input (300ms), dropdown results with channel/user/time, click to navigate. ESC/outside click to close.
- Task 5: Unread badge (red circle + count, 99+ cap) on channel list. WS-driven local increment for other channels. Server sync via unread API. `handleSelectChannel` marks read + resets badge.
- Task 6: Notification WS listener for `messenger_mention` type. Toast auto-dismisses after 5s. Click extracts channelId and navigates.
- Task 7: Build 8/8 success. 48 unit tests pass.

### File List

- packages/server/src/db/schema.ts (modified — messengerMembers.lastReadAt added)
- packages/server/src/lib/notifier.ts (modified — messenger_mention type added to NotifyParams)
- packages/server/src/routes/workspace/messenger.ts (modified — search API, unread API, read API, multi-mention parsing + user notification)
- packages/server/src/db/migrations/0026_messenger-search-unread.sql (new — migration)
- packages/server/src/db/migrations/meta/_journal.json (modified — journal entry)
- packages/app/src/pages/messenger.tsx (modified — search UI, unread badges, mention toast, handleSelectChannel, URL params)
- packages/server/src/__tests__/unit/messenger-search-notify.test.ts (new — 48 tests)
- packages/server/src/__tests__/unit/messenger-search-notify-tea.test.ts (new — 38 TEA tests)
- packages/server/src/__tests__/unit/messenger-search-notify-qa.test.ts (new — 25 QA tests)

## Code Review Findings

### Issues Found & Fixed

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | HIGH | ILIKE search `q` passed directly without escaping `%` and `_` wildcards — SQL injection risk | Added `escapedQ = q.replace(/%/g, '\\%').replace(/_/g, '\\_')` before ILIKE |
| 2 | LOW | `api.post()` missing body argument — TS build error | Added `{}` as second argument |
| 3 | MEDIUM | `POST /channels/:id/read` missing membership verification — any user could mark any channel as read | Added `await assertMember(channelId, tenant.userId, tenant.companyId)` |

### Post-Review Build
- `bunx turbo build type-check` → 8/8 success
- 111 tests pass (48 dev + 38 TEA + 25 QA), 168 assertions
