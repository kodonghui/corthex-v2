# 사내 메신저 UX/UI 설명서

> 페이지: #11 사내 메신저
> 패키지: app
> 경로: /messenger
> 작성일: 2026-03-09

---

## 1. 페이지 목적

같은 회사의 인간 직원끼리 실시간으로 소통하는 **사내 메신저**. 채널 기반 그룹 메시징과 1:1/그룹 대화(Conversations)를 지원하며, WebSocket을 통한 실시간 메시지 수신, @멘션 알림, 스레드 답글, 이모지 리액션, 파일 첨부, 메시지 검색까지 포함하는 풀 기능 메신저다.

**핵심 사용자 시나리오:**
- 채널을 만들어 팀/부서별 그룹 대화
- 1:1 또는 소규모 그룹 대화 (Conversations)
- @멘션으로 특정 에이전트/유저 호출
- 스레드로 특정 메시지에 대한 토론
- 파일(이미지/문서) 첨부 공유
- 메시지 검색으로 과거 대화 찾기
- 온라인 상태 확인

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────┐
│  Header: "메신저"    [채널|대화] (세그먼트 토글)       │
├─────────────────────────────────────────────────────┤
│  "채널 기반 메신저"                       [+ 채널]    │
├────────────┬────────────────────────┬───────────────┤
│            │                        │               │
│  채널 목록  │    메시지 영역           │  스레드 패널   │
│  (w-64)    │                        │  (w-80)       │
│            │  ┌────────────────────┐│  (열려있을 때  │
│  [🔍 검색]  │  │ 유저명              ││   만 표시)    │
│            │  │ 메시지 텍스트       ││               │
│  #일반     │  │ [👍❤️😂] [💬 답글]   ││               │
│  #개발     │  │ 📎 파일첨부          ││               │
│  #마케팅   │  └────────────────────┘│               │
│            │  (반복...)             │               │
│  (미읽음   │                        │               │
│   뱃지)    │  ── 타이핑 인디케이터 ──│               │
│            ├────────────────────────│               │
│            │  [📎] [메시지 입력]     │               │
│            │       @멘션팝업  [전송] │               │
│            │  [첨부 파일 프리뷰]     │               │
└────────────┴────────────────────────┴───────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ "메신저" [채널|대화]  │
├─────────────────────┤
│ [+ 채널]             │
├─────────────────────┤
│  채널 목록            │   ← showChat=false일 때
│  [🔍 검색]           │
│  #일반 (3)           │
│  #개발               │
│  (미읽음 뱃지)        │
├─────────────────────┤
│    또는              │   ← showChat=true일 때
├─────────────────────┤
│ [← 뒤로] #일반 [⚙]   │
│                     │
│ 메시지 목록           │
│                     │
│ [📎][입력]    [전송]  │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **채널/대화 전환 UX**: 세그먼트 토글이 작고 채널과 대화의 차이가 직관적이지 않음
2. **스레드 패널 위치**: 데스크톱에서 우측에 80px 폭으로 열리지만 모바일에서는 fixed 오버레이로 전체 화면을 가림
3. **온라인 상태 표시**: 채널 목록에서는 온라인 상태가 보이지 않고, 설정 모달 멤버 목록에서만 확인 가능
4. **이모지 리액션 접근성**: 메시지 호버 시에만 이모지 선택이 나타나 모바일에서 접근 불가
5. **멘션 팝업 디자인**: 에이전트 이름만 나열되고 역할/부서 정보가 부족
6. **파일 첨부 UX**: 드래그앤드롭 영역이 시각적으로 명확하지 않음 (dragOver 시 테두리만 변경)
7. **검색 결과 UI**: 검색 결과가 드롭다운으로 나오지만 맥락(전후 메시지)이 없어 찾으려는 내용인지 판단 어려움
8. **미읽음 카운트**: 숫자만 표시되고 시각적 강조가 약함
9. **채널 설정 모달**: 멤버 관리(추가/제거)가 모달 안에서 이루어지는데 모달이 긴 경우 스크롤이 불편
10. **빈 상태**: "대화를 선택하세요"가 시각적으로 밋밋함 (일러스트 없음)

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 v0.dev가 결정** -- 특정 테마 강제하지 않음
- 온라인/오프라인 상태는 녹색/회색 인디케이터로 명확히 구분
- 미읽음 메시지는 강한 색상 뱃지로 시각적 우선순위 확보

### 4.2 레이아웃 개선
- **온라인 상태 표시**: 채널 목록 옆에 온라인 멤버 수 미니 인디케이터
- **이모지 리액션**: 모바일에서도 롱프레스로 접근 가능하도록 대체 UX 고려
- **검색 결과**: 결과에 전후 맥락 1줄씩 표시
- **빈 상태**: 일러스트 + "채널을 만들거나 대화를 시작하세요" 안내

### 4.3 인터랙션 개선
- 스레드 패널: 데스크톱에서 슬라이드 인 애니메이션
- 파일 첨부: 드래그 시 명확한 드롭 영역 오버레이
- 멘션 팝업: 에이전트 역할/부서 태그 추가

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | MessengerPage | 탭 전환(채널/대화) 스타일 개선 | pages/messenger.tsx |
| 2 | ChannelsView | 채널 목록, 메시지 영역, 검색, 멘션 전체 래퍼 | pages/messenger.tsx (내부) |
| 3 | ConversationsView | 대화 목록 + 채팅 영역 래퍼 | components/messenger/conversations-view.tsx |
| 4 | ConversationsPanel | 대화방 목록 | components/messenger/conversations-panel.tsx |
| 5 | ConversationChat | 대화방 채팅 UI | components/messenger/conversation-chat.tsx |
| 6 | NewConversationModal | 새 대화 생성 모달 | components/messenger/new-conversation-modal.tsx |
| 7 | ShareToConversationModal | 보고서 공유 모달 | components/messenger/share-to-conversation-modal.tsx |
| 8 | ChannelSettingsModal | 채널 설정/멤버 관리 모달 | pages/messenger.tsx (내부) |
| 9 | ThreadPanel | 스레드 답글 패널 | pages/messenger.tsx (내부) |
| 10 | AttachmentRenderer | 파일/이미지 첨부 렌더러 | pages/messenger.tsx (내부) |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| channels | useQuery → GET /workspace/messenger/channels | 채널 목록 |
| messages | useQuery → GET /workspace/messenger/channels/:id/messages | 채널 메시지 |
| channelDetail | useQuery → GET /workspace/messenger/channels/:id | 채널 정보 |
| channelMembers | useQuery → GET /workspace/messenger/channels/:id/members | 멤버 목록 |
| threadReplies | useQuery → GET /.../messages/:id/thread | 스레드 답글 |
| searchResults | useQuery → GET /workspace/messenger/search?q= | 메시지 검색 |
| unreadCounts | useQuery → GET /workspace/messenger/channels/unread | 미읽음 카운트 |
| onlineStatus | useQuery → GET /workspace/messenger/online-status | 온라인 유저 ID |
| agents | useQuery → GET /workspace/agents | 멘션 자동완성 |
| conversations | useQuery → GET /workspace/conversations | 대화방 목록 |
| conversationDetail | useQuery → GET /workspace/conversations/:id | 대화방 상세 |
| conversationMessages | useQuery → GET /workspace/conversations/:id/messages | 대화 메시지 |

**API 엔드포인트 (변경 없음):**
- 채널 CRUD: `/workspace/messenger/channels`
- 메시지: `/workspace/messenger/channels/:id/messages`
- 멤버: `/workspace/messenger/channels/:id/members`
- 리액션: `/workspace/messenger/channels/:id/messages/:mid/reactions`
- 스레드: `/workspace/messenger/channels/:id/messages/:mid/thread`
- 검색: `/workspace/messenger/search`
- 읽음: `/workspace/messenger/channels/:id/read`
- 온라인: `/workspace/messenger/online-status`
- 대화방: CRUD `/workspace/conversations`
- 파일: `/workspace/files` (업로드), `/workspace/files/:id/download`
- WebSocket 채널: `messenger::{channelId}`, `conversation::{convId}`, `notifications::{userId}`

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| 내 메시지 배경 | 인디고 | bg-indigo-600 text-white |
| 상대 메시지 배경 | 라이트 그레이 | bg-zinc-100 dark:bg-zinc-800 |
| 온라인 인디케이터 | 에메랄드 | text-emerald-500 |
| 오프라인 인디케이터 | 그레이 | text-zinc-400 |
| 미읽음 뱃지 | 인디고 | bg-indigo-600 text-white |
| 선택된 채널 | 라이트 인디고 | bg-indigo-50 dark:bg-zinc-800 |
| 멘션 알림 토스트 | 인디고 보더 | border-indigo-500 |
| 파일 드래그 오버 | 인디고 보더 | border-indigo-400 bg-indigo-50/50 |
| CTA 버튼 | 인디고 | bg-indigo-600 text-white |
| 위험 버튼 (삭제/나가기) | 레드 | bg-red-600 / border-red-300 text-red-600 |
| 타이핑 인디케이터 | 그레이 | text-zinc-400 italic |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 3컬럼 (채널 w-64 + 메시지 flex-1 + 스레드 w-80), 넓은 패딩 |
| **768px~1439px** (Tablet) | 2컬럼 (채널 w-64 + 메시지 flex-1), 스레드 오버레이 |
| **~375px** (Mobile) | 1컬럼 전환 (채널 목록 OR 채팅), 스레드 풀스크린 오버레이 |

**모바일 특별 처리:**
- 채널 목록 ↔ 채팅 영역: `showChat` 상태로 토글 (← 뒤로 버튼)
- 스레드: fixed inset-0으로 풀스크린
- 채널 설정 모달: 풀스크린 (h-full)
- 멘션 팝업: bottom-sheet 스타일
- 파일 첨부: 드래그앤드롭 비활성, 버튼만 사용
- 이모지 리액션: 호버 대신 터치 기반 접근 필요

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 23번 항목(v2 추가 기능)에 따라 사내 메신저는 v2에서 신규 추가된 기능이다. 아래가 **반드시** 동작해야 함:

- [x] 채널 CRUD (생성, 수정, 삭제)
- [x] 채널별 실시간 메시징 (WebSocket)
- [x] 1:1 / 그룹 대화 (Conversations)
- [x] @멘션 (에이전트 이름 자동완성)
- [x] 스레드 답글
- [x] 이모지 리액션 (6종: 👍❤️😂😮👏🔥)
- [x] 파일 첨부 (이미지 + 문서, 최대 50MB, 5개까지)
- [x] 메시지 검색
- [x] 미읽음 카운트 + 읽음 처리
- [x] 온라인 상태 표시 (30초 폴링)
- [x] 멘션 알림 (WebSocket 실시간 토스트)
- [x] 채널 멤버 관리 (추가/제거)
- [x] 채널 나가기 / 삭제 (생성자만)
- [x] 드래그앤드롭 파일 업로드

**UI 변경 시 절대 건드리면 안 되는 것:**
- WebSocket 구독/리스너 로직 (`subscribe`, `addListener`, `removeListener`)
- `useWsStore` 스토어 구조
- `useAuthStore` 스토어 구조
- `api.post/get/put/delete/upload` 호출 경로 및 페이로드
- `useMutation` / `useQuery` 훅의 queryKey 구조
- 파일 업로드 FormData 구조

---

## 10. v0.dev 디자인+코딩 지시사항

> v0.dev가 디자인과 코딩을 동시에 수행합니다. 아래 내용을 v0 프롬프트에 포함하세요. 레이아웃은 v0에게 자유도를 부여합니다.

### v0 프롬프트 (디자인+코딩 통합)
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. This specific page is an internal team messenger — like Slack or Microsoft Teams — where human employees of the same company can communicate in real-time.

This page: A full-featured internal messenger with channel-based group messaging and direct conversations.

User workflow:
1. User sees a list of channels (like Slack channels: #general, #marketing, #dev) on the left.
2. Clicking a channel shows the message thread in the center — messages from team members with timestamps, avatars, and names.
3. User can type messages, attach files (images, documents up to 50MB), and @mention AI agents.
4. Any message can start a thread — clicking "Reply" opens a thread panel on the right side.
5. Users can react to messages with emoji reactions (thumbs up, heart, etc.).
6. A search bar in the channel list lets users search across all messages.
7. Unread message counts show as badges on channels.
8. Online/offline status indicators (green/gray dots) show who's currently active.
9. There's a tab to switch between "Channels" (group messaging) and "Conversations" (direct messages / small group chats).

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Channel list panel (left) — list of channels with names, last message preview, unread badge, online member count. Search bar at top.
2. Message area (center) — chat messages with: sender name, timestamp, message text, file attachments (image preview / document download link), emoji reactions below messages, reply count indicator. Typing indicator at bottom.
3. Thread panel (right, optional) — opens when user clicks "Reply" on a message. Shows the original message and threaded replies below it.
4. Message input area (bottom of center) — text input with file attachment button, @mention popup, send button. Shows pending file previews.
5. Channel/Conversation tab toggle — at the top, to switch between channel mode and direct message mode.
6. "New Channel" button — to create a new channel.
7. Channel settings — accessible via a settings icon, shows channel info, member list with online status, and member management.
8. Empty state — when no channel is selected, show a helpful prompt.

Design tone — YOU DECIDE:
- This is a professional internal messenger. Think Slack, but cleaner and more focused.
- Messages should be easy to scan — clear visual hierarchy between sender, content, and metadata.
- Unread indicators should pop visually.
- Online status should be subtle but noticeable.
- The input area should feel inviting and ready for typing.
- Clean, professional, fast-feeling. This is a tool people use constantly throughout the day.

Design priorities (in order):
1. Message readability — this is a chat app, messages must be easy to read and scan.
2. Channel navigation — switching between channels should feel instant.
3. Unread awareness — users must immediately see which channels have new messages.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 참고사항
```
Mobile version (375x812) of the same page described above.

Same product context: an internal team messenger with channels and direct conversations, real-time messaging via WebSocket.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile touch):
1. Channel list view — full-screen list of channels with unread badges and last message preview. Search bar at top. "New Channel" button.
2. Chat view — full-screen message thread (replaces channel list). Back button to return to channel list. Channel name in header. Settings icon.
3. Message input — bottom-positioned with attachment button and send button. Above the app's bottom tab bar.
4. Thread view — full-screen overlay showing original message + threaded replies.
5. Channel/Conversation toggle — compact tabs at the top.
6. @mention popup — bottom-sheet style.
7. Emoji reactions — accessible via long-press or tap (no hover on mobile).
8. Loading / empty / error states.

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. One-handed messaging — input must be reachable at the bottom.
2. Channel switching — back button + channel list must be one tap away.
3. Unread badges must be visible at a glance in the channel list.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `messenger-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `messenger-tab-channels` | 채널 탭 | 채널 모드 전환 |
| `messenger-tab-conversations` | 대화 탭 | 대화 모드 전환 |
| `messenger-channel-list` | 채널 목록 컨테이너 | 채널 표시 영역 |
| `messenger-channel-item` | 개별 채널 항목 | 채널 선택 |
| `messenger-channel-unread` | 미읽음 뱃지 | 미읽음 수 표시 |
| `messenger-channel-search` | 메시지 검색 입력 | 검색 기능 |
| `messenger-search-results` | 검색 결과 드롭다운 | 검색 결과 표시 |
| `messenger-create-channel-btn` | + 채널 버튼 | 채널 생성 진입 |
| `messenger-create-channel-form` | 채널 생성 폼 | 이름/설명 입력 |
| `messenger-create-channel-submit` | 채널 생성 확인 버튼 | 채널 생성 실행 |
| `messenger-message-area` | 메시지 영역 컨테이너 | 메시지 표시 |
| `messenger-message-item` | 개별 메시지 | 메시지 확인 |
| `messenger-message-input` | 메시지 입력 필드 | 텍스트 입력 |
| `messenger-send-btn` | 전송 버튼 | 메시지 전송 |
| `messenger-attach-btn` | 파일 첨부 버튼 | 파일 선택 |
| `messenger-pending-files` | 첨부 파일 프리뷰 | 업로드 대기 파일 |
| `messenger-mention-popup` | 멘션 팝업 | @멘션 자동완성 |
| `messenger-mention-item` | 멘션 에이전트 항목 | 에이전트 선택 |
| `messenger-typing-indicator` | 타이핑 인디케이터 | 상대방 입력 중 표시 |
| `messenger-emoji-picker` | 이모지 피커 | 리액션 선택 |
| `messenger-reaction-badge` | 리액션 뱃지 | 리액션 표시/토글 |
| `messenger-thread-btn` | 답글 버튼 | 스레드 열기 |
| `messenger-thread-panel` | 스레드 패널 | 스레드 표시 영역 |
| `messenger-thread-reply-input` | 스레드 답글 입력 | 답글 입력 |
| `messenger-thread-send-btn` | 스레드 전송 버튼 | 답글 전송 |
| `messenger-thread-close` | 스레드 닫기 버튼 | 스레드 패널 닫기 |
| `messenger-settings-btn` | 채널 설정 버튼 | 설정 모달 열기 |
| `messenger-settings-modal` | 채널 설정 모달 | 설정 표시 확인 |
| `messenger-settings-name` | 채널 이름 수정 입력 | 이름 변경 |
| `messenger-settings-save` | 설정 저장 버튼 | 설정 저장 |
| `messenger-member-list` | 멤버 목록 | 멤버 표시 |
| `messenger-member-add` | 멤버 추가 검색 | 멤버 추가 |
| `messenger-member-remove` | 멤버 제거 버튼 | 멤버 제거 |
| `messenger-leave-btn` | 채널 나가기 버튼 | 채널 나가기 |
| `messenger-delete-btn` | 채널 삭제 버튼 | 채널 삭제 |
| `messenger-back-btn` | 뒤로 가기 버튼 (모바일) | 채널 목록 복귀 |
| `messenger-empty-state` | 빈 상태 | 채널 미선택 시 |
| `messenger-online-indicator` | 온라인 상태 점 | 온라인 여부 |
| `messenger-conv-list` | 대화방 목록 | 대화 모드 목록 |
| `messenger-conv-item` | 개별 대화방 | 대화방 선택 |
| `messenger-conv-new-btn` | + 새 대화 버튼 | 대화방 생성 |
| `messenger-conv-new-modal` | 새 대화 모달 | 대화 생성 모달 |
| `messenger-file-attachment` | 파일 첨부물 | 첨부된 파일 |
| `messenger-image-attachment` | 이미지 첨부물 | 첨부된 이미지 |
| `messenger-dragover` | 드래그 오버 영역 | 파일 드롭 영역 |
| `messenger-conv-empty` | 대화 빈 상태 | 대화방 없을 때 |
| `messenger-loading` | 로딩 스켈레톤 | 로딩 중 표시 |
| `messenger-error-state` | 에러 상태 | API 에러 시 표시 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /messenger 접속 | `messenger-page` 존재, 채널 탭 활성 |
| 2 | 빈 상태 표시 | 채널 미선택 시 | `messenger-empty-state` 표시 |
| 3 | 채널 생성 | + 채널 → 이름 입력 → 생성 | 채널 목록에 새 항목 추가 |
| 4 | 채널 선택 | 채널 항목 클릭 | 메시지 영역에 해당 채널 메시지 표시 |
| 5 | 메시지 전송 | 텍스트 입력 후 전송 클릭 | 메시지 목록에 내 메시지 추가 |
| 6 | Enter 전송 | 텍스트 입력 후 Enter | 메시지 전송됨 |
| 7 | 빈 전송 방지 | 빈 텍스트로 전송 시도 | 전송 버튼 비활성화 |
| 8 | 멘션 팝업 | @ 입력 | `messenger-mention-popup` 표시, 에이전트 목록 |
| 9 | 멘션 선택 | 팝업에서 에이전트 클릭 | 입력란에 @에이전트명 삽입 |
| 10 | 이모지 리액션 | 메시지 호버 → 이모지 클릭 | `messenger-reaction-badge` 표시 |
| 11 | 스레드 열기 | 답글 버튼 클릭 | `messenger-thread-panel` 표시 |
| 12 | 스레드 답글 | 스레드에서 텍스트 입력 → 전송 | 스레드 목록에 답글 추가 |
| 13 | 스레드 닫기 | 스레드 닫기 버튼 클릭 | 스레드 패널 사라짐 |
| 14 | 메시지 검색 | 검색창에 키워드 입력 | `messenger-search-results` 표시 |
| 15 | 탭 전환 - 대화 | 대화 탭 클릭 | 대화방 목록 표시 |
| 16 | 새 대화 생성 | + 새 대화 → 참여자 선택 → 생성 | 대화방 목록에 새 항목 |
| 17 | 채널 설정 열기 | 설정 버튼 클릭 | `messenger-settings-modal` 표시 |
| 18 | 채널 이름 변경 | 설정에서 이름 수정 → 저장 | 채널 이름 업데이트 |
| 19 | 파일 첨부 | 첨부 버튼 → 파일 선택 | `messenger-pending-files` 표시 |
| 20 | 반응형 레이아웃 | 375px 뷰포트 | 채널 목록만 표시 (채팅 숨김) |
| 21 | 모바일 채널 진입 | 모바일에서 채널 클릭 | 채팅 영역 전체화면, 뒤로 버튼 표시 |
| 22 | 모바일 뒤로가기 | 뒤로 버튼 클릭 | 채널 목록으로 복귀 |
| 23 | 로딩 상태 | 데이터 로딩 중 | `messenger-loading` 스켈레톤 표시 |
| 24 | 에러 상태 | API 에러 발생 | `messenger-error-state` 에러 메시지 + 재시도 |
| 25 | 대화 빈 상태 | 대화 모드에서 방 없을 때 | `messenger-conv-empty` 표시 |
