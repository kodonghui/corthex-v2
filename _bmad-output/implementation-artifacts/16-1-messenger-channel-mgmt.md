# Story 16.1: Messenger Channel Management (메신저 채널 관리)

Status: done

## Story

As a workspace user (직원),
I want to edit, delete, and leave messenger channels, and manage channel members through a settings modal,
so that I can organize and control my messaging environment effectively.

## Acceptance Criteria

1. **Given** 채널 목록 **When** 채널 헤더에서 설정 아이콘 클릭 **Then** 채널 설정 모달이 열린다 (이름, 설명, 멤버 관리, 나가기, 삭제)
2. **Given** 채널 설정 모달 **When** 채널 이름/설명 수정 후 저장 **Then** `PUT /messenger/channels/:id` 호출 → 채널 정보 업데이트 반영
3. **Given** 채널 설정 모달 **When** 채널 생성자가 삭제 버튼 클릭 + 확인 **Then** `DELETE /messenger/channels/:id` → 채널 + 메시지 히스토리 모두 삭제
4. **Given** 채널 삭제 **When** 비생성자가 시도 **Then** 403 에러 반환 ("채널 생성자만 삭제할 수 있습니다")
5. **Given** 채널 설정 모달 **When** "나가기" 버튼 클릭 **Then** `DELETE /messenger/channels/:id/members/me` → 채널에서 탈퇴 + 채널 목록 갱신
6. **Given** 채널 설정 **When** 멤버 관리 섹션 **Then** 같은 회사 유저 검색 + 체크박스로 추가/제거 가능
7. **Given** 채널 목록 **When** 채널 아이템 UI **Then** 마지막 메시지 미리보기 + 시간 표시 (기존 description 대신)
8. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 success

## Tasks / Subtasks

- [x] Task 1: 서버 API — 채널 수정/삭제 엔드포인트 (AC: #2, #3, #4)
  - [x] `PUT /messenger/channels/:id` — 채널 이름/설명 수정 (멤버만 가능)
    - body: `{ name?: string, description?: string }`
    - 응답: `{ data: channel }`
  - [x] `DELETE /messenger/channels/:id` — 채널 삭제 (생성자만)
    - 메시지 → 멤버 → 채널 순서로 cascade 삭제
    - 비생성자 시도 시 403
  - [x] 파일: `packages/server/src/routes/workspace/messenger.ts` 수정

- [x] Task 2: 서버 API — 채널 나가기 엔드포인트 (AC: #5)
  - [x] `DELETE /messenger/channels/:id/members/me` — 자기 자신 채널 탈퇴
    - 기존 `DELETE /messenger/channels/:id/members/:uid` 엔드포인트와 별도
    - 멤버 삭제 후 응답: `{ data: { left: true } }`
  - [x] 파일: `packages/server/src/routes/workspace/messenger.ts` 수정

- [x] Task 3: 서버 API — 채널 상세 + 멤버 목록 조회 (AC: #6)
  - [x] `GET /messenger/channels/:id` — 채널 상세 (이름, 설명, createdBy, 멤버 수)
  - [x] `GET /messenger/channels/:id/members` — 채널 멤버 목록 (id, name, role, joinedAt)
  - [x] 파일: `packages/server/src/routes/workspace/messenger.ts` 수정

- [x] Task 4: 서버 API — 채널 목록 개선 (AC: #7)
  - [x] `GET /messenger/channels` 응답에 lastMessage 포함
    - `{ id, name, description, createdBy, createdAt, lastMessage: { content, userName, createdAt } | null }`
    - 서브쿼리 또는 lateral join으로 마지막 메시지 가져오기
  - [x] 파일: `packages/server/src/routes/workspace/messenger.ts` 수정

- [x] Task 5: 프론트엔드 — 채널 설정 모달 (AC: #1, #2, #3, #4, #5, #6)
  - [x] 채널 헤더에 설정 아이콘 추가
  - [x] 채널 설정 모달 컴포넌트 (channel-settings-modal)
    - 이름/설명 수정 폼
    - 멤버 관리 (현재 멤버 목록 + 추가/제거)
    - "나가기" destructive 버튼
    - 삭제 버튼 (생성자만 표시) + ConfirmDialog
  - [x] 파일: `packages/app/src/pages/messenger.tsx` 수정

- [x] Task 6: 프론트엔드 — 채널 목록 UI 개선 (AC: #7)
  - [x] 채널 아이템에 마지막 메시지 미리보기 표시
  - [x] 시간 표시 (오늘이면 시:분, 아니면 월/일)
  - [x] 파일: `packages/app/src/pages/messenger.tsx` 수정

- [x] Task 7: 빌드 검증 (AC: #8)
  - [x] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### Existing Infrastructure (DO NOT re-implement)

1. **Messenger Route** (`packages/server/src/routes/workspace/messenger.ts`)
   - 이미 존재하는 엔드포인트:
     - `GET /channels` — 내가 참여한 채널 목록
     - `POST /channels` — 채널 생성
     - `GET /channels/:id/messages` — 메시지 조회 (페이지네이션)
     - `POST /channels/:id/messages` — 메시지 전송
     - `POST /channels/:id/members` — 멤버 추가
     - `DELETE /channels/:id/members/:uid` — 멤버 제거
     - `GET /users` — 같은 회사 유저 목록
   - `assertMember()` 헬퍼 — 채널 멤버 확인 (재사용)
   - authMiddleware 이미 적용됨

2. **DB Schema** (`packages/server/src/db/schema.ts`)
   - `messengerChannels` — id, companyId, name, description, createdBy, createdAt
   - `messengerMembers` — id, companyId, channelId, userId, joinedAt
   - `messengerMessages` — id, companyId, channelId, userId, content, createdAt
   - 관계: messengerChannelsRelations (company, creator, members, messages)

3. **Shared Types** (`packages/shared/src/types.ts`)
   - `MessengerChannel` — `{ id, companyId, name, description, createdBy, createdAt }`

4. **Frontend Messenger Page** (`packages/app/src/pages/messenger.tsx`)
   - React Query 사용: `useQuery`, `useMutation`, `useQueryClient`
   - `api.get<T>(url)`, `api.post<T>(url, data)` 패턴
   - Channel/Message/CompanyUser 타입 정의됨
   - 이미 채널 목록 + 메시지 + 채널 생성 + 메시지 전송 UI 구현됨
   - 메시지 5초 폴링 (refetchInterval: 5000)
   - 메시지 송수신 + 스크롤 동작 완비

5. **WebSocket** (`packages/server/src/ws/channels.ts`)
   - `messenger` 채널 구독 처리 + 멤버 권한 검증 이미 구현
   - `broadcastToChannel(channelKey, data)` 사용 가능
   - 메시지 수신 시 WebSocket 브로드캐스트는 Story 16-2에서 구현 (이번 스토리 범위 아님)

6. **App Router** (`packages/app/src/App.tsx`)
   - `/messenger` 라우트 이미 등록됨
   - MessengerPage lazy import 완료

7. **Activity Logger** (`packages/server/src/lib/activity-logger.ts`)
   - `logActivity({ companyId, type, phase, actorType, actorId, action })` 패턴

### API 구현 주의사항

- **채널 삭제 순서**: messengerMessages → messengerMembers → messengerChannels (FK 참조 순서)
- **나가기 vs 제거**: `/members/me`는 자기 자신 전용, `/members/:uid`는 다른 멤버 제거 (기존)
- **채널 목록 lastMessage**: 서브쿼리로 각 채널의 최신 메시지 1건 가져오기
  ```ts
  // 예시: lateral join 또는 서브쿼리
  // 기존 채널 목록 쿼리에 lastMessage 필드 추가
  ```
- **수정 스키마**: `updateChannelSchema = z.object({ name: z.string().min(1).max(100).optional(), description: z.string().optional() })`
- Drizzle ORM 패턴: `db.update(table).set({}).where(and(...)).returning()`
- Drizzle delete 패턴: `db.delete(table).where(and(...))`

### 프론트엔드 구현 주의사항

- **모달 패턴**: 프로젝트 내 기존 모달은 state + portal 없이 absolute/fixed position으로 구현
- **ConfirmDialog**: 삭제 확인 시 `window.confirm()` 사용 가능 (기존 패턴)
- **API 호출**: `api.put<T>(url, data)`, `api.delete<T>(url)` 패턴 확인 필요
- **React Query**: mutation 성공 시 `queryClient.invalidateQueries` 호출로 목록 갱신
- **채널 설정 모달 위치**: 채널 헤더 ⚙️ 아이콘 클릭 → 오버레이 모달
- **멤버 관리**: 기존 `GET /messenger/users`로 회사 유저 목록 가져오기 + 체크박스 toggle

### UX 결정사항 (ux-design-specification.md)

- 채널 나가기: 채널 설정 모달 하단 destructive 버튼
- 채널 삭제: 생성자만 가능. ConfirmDialog. 삭제 시 메시지 히스토리 모두 삭제
- 멤버 초대: ⚙️ → "멤버 관리" 모달. 같은 회사 유저 검색 + 체크박스로 추가/제거
- 채널 멤버 0명(마지막 멤버 퇴장): 채널 유지(히스토리 보존). 메시지 전송 불가

### 보안 고려사항

- 채널 수정: 멤버만 가능 (assertMember 재사용)
- 채널 삭제: 생성자만 (createdBy === tenant.userId 확인)
- 나가기: 자기 자신만 (tenant.userId 사용)
- companyId 테넌트 격리 모든 쿼리에 적용

### Project Structure Notes

- `packages/server/src/routes/workspace/messenger.ts` (수정 — 채널 수정/삭제/나가기/상세/멤버 API 추가)
- `packages/app/src/pages/messenger.tsx` (수정 — 설정 모달 + 채널 목록 개선)
- 신규 파일 없음 — 기존 파일 확장

### References

- [Source: packages/server/src/routes/workspace/messenger.ts] — 기존 메신저 CRUD API
- [Source: packages/server/src/db/schema.ts#messengerChannels] — 메신저 DB 테이블
- [Source: packages/server/src/ws/channels.ts#messenger] — WebSocket 구독 처리
- [Source: packages/app/src/pages/messenger.tsx] — 기존 메신저 UI 페이지
- [Source: packages/shared/src/types.ts#MessengerChannel] — 공유 타입
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.8] — 메신저 UX 결정사항
- [Source: _bmad-output/implementation-artifacts/15-5-org-tree-viewer.md] — 이전 스토리 패턴

### Previous Story Intelligence (15-5)

- admin route 패턴: `new Hono<AppEnv>()` + `.use('*', authMiddleware, adminOnly)` — workspace는 authMiddleware만
- React Query 패턴: `useQuery + useMutation + invalidateQueries`
- 빌드: 8/8 success
- TEA 46건, Code Review 1 이슈 자동 수정
- 커밋 패턴: `feat: Story X-Y 제목 — 변경 요약 + TEA N건`

### Git Intelligence

Recent commits:
- `a55e762` docs: Epic 15 회고 완료 — 운영 도구 5/5 스토리 100% + 테스트 255건
- `8940977` feat: Story 15-5 조직도 뷰어 — 3단계 트리 UI + API + TEA 46건
- `70e3741` feat: Story 15-4 시스템 모니터링 — 서버 상태 + 메모리 + DB + 에러 카운터 + TEA 67건

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Added PUT /channels/:id (update name/desc, member-only) and DELETE /channels/:id (creator-only, cascade delete messages→members→channel) to messenger route.
- Task 2: Added DELETE /channels/:id/members/me for self-leave. Placed before generic /:uid route to avoid route conflict.
- Task 3: Added GET /channels/:id (channel detail with memberCount) and GET /channels/:id/members (member list with user info).
- Task 4: Enhanced GET /channels to include lastMessage (latest message content, userName, createdAt) per channel.
- Task 5: Created ChannelSettingsModal with: name/desc edit form, member list with remove, user search for add, leave button, delete button (creator-only). Settings accessible via ⚙️ icon in channel header.
- Task 6: Updated channel list UI from w-56→w-64, shows lastMessage preview (userName: content) + time, fallback to description if no messages. formatTime: today→HH:MM, other→M/D.
- Task 7: Build 8/8 success. 36 unit tests pass.
- TEA: 79 tests total (expanded from 36 during TEA phase)
- Code Review: 0 HIGH, 2 MEDIUM (deferred — N+1 acceptable for small scale, unused param is pre-existing), 2 LOW.

### File List

- packages/server/src/routes/workspace/messenger.ts (modified — added PUT/DELETE channels, GET detail/members, leave, lastMessage)
- packages/app/src/pages/messenger.tsx (modified — ChannelSettingsModal, improved channel list, settings icon)
- packages/server/src/__tests__/unit/messenger-channel-mgmt.test.ts (new — 36 tests)
