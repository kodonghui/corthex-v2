# 11. 사내 메신저 — Design Spec for Claude Coding

> Route: `/messenger` — CEO App
> Files: `packages/app/src/pages/messenger.tsx`, `packages/app/src/components/messenger/*`

---

## Page Overview

회사 내 인간 직원과 AI 에이전트가 함께 소통하는 실시간 메신저. 두 가지 시스템이 공존한다:
1. **채널 기반 메신저** (messenger.tsx) — 채널 생성, 멤버 관리, @멘션으로 AI 호출, 스레드, 리액션, 파일 첨부
2. **대화 기반 메신저** (conversations-view.tsx) — 1:1 / 그룹 대화, 보고서 공유, 간단한 메시징

두 시스템은 탭 또는 모드로 구분되어 같은 페이지 내에서 제공된다.

---

## Design System Tokens

```
Surface: bg-slate-900 (primary), bg-slate-800 (elevated)
Text: text-slate-50 (primary), text-slate-400 (secondary), text-slate-300 (body)
Border: border-slate-700
Accent: blue-500 (action), cyan-400 (accent), red-500 (destructive), emerald-500 (success)
Card: bg-slate-800/50 border border-slate-700 rounded-xl
Modal: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl
```

---

## Page Layout — Channel Mode

```
┌─────────────────────────────────────────────────────────────────┐
│ Full height: h-full flex flex-col                               │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ HEADER: px-6 py-3 border-b border-slate-700                 ││
│ │ "메신저" text-xl font-semibold + [모드 탭: 채널 | 대화]       ││
│ └──────────────────────────────────────────────────────────────┘│
│ ┌────────────────┬─────────────────────────────────────────────┐│
│ │ SIDEBAR        │ MESSAGE AREA                                ││
│ │ w-72 border-r  │ flex-1                                      ││
│ │ border-slate-700│                                             ││
│ │                │ ┌─────────────────────────────────────────┐ ││
│ │ [🔍 검색]      │ │ Channel Header                          │ ││
│ │ [+ 채널 생성]  │ │ channel name + member count + settings  │ ││
│ │                │ └─────────────────────────────────────────┘ ││
│ │ ┌────────────┐ │ ┌─────────────────────────────────────────┐ ││
│ │ │ Channel 1  │ │ │ Messages (flex-1 overflow-y-auto)       │ ││
│ │ │ last msg   │ │ │                                         │ ││
│ │ │ unread: 3  │ │ │ [sender] message content     [time]     │ ││
│ │ ├────────────┤ │ │ [reactions: 👍3 ❤️2]                    │ ││
│ │ │ Channel 2  │ │ │ [📎 attachments]                        │ ││
│ │ │ ...        │ │ │ [replies: 답글 N개]                      │ ││
│ │ └────────────┘ │ │                                         │ ││
│ │                │ │ typing indicator...                      │ ││
│ │                │ └─────────────────────────────────────────┘ ││
│ │                │ ┌─────────────────────────────────────────┐ ││
│ │                │ │ INPUT: textarea + [📎] + [전송]          │ ││
│ │                │ │ @mention popup overlay                   │ ││
│ │                │ └─────────────────────────────────────────┘ ││
│ └────────────────┴─────────────────────────────────────────────┘│
│                                                                 │
│ THREAD PANEL (slides in from right when open):                  │
│ w-80 border-l border-slate-700, overlays or pushes content      │
└─────────────────────────────────────────────────────────────────┘
```

### Sidebar — Channel List

**Search Input:**
```
px-3 py-2
bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg
text-sm placeholder="채널 검색..."
```

**Create Channel Button:**
```
w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium
"+ 새 채널"
```

**Channel Item:**
```
w-full text-left px-3 py-2.5 border-b border-slate-800 transition-colors
Selected: bg-blue-600/10 border-l-2 border-blue-500
Hover: hover:bg-slate-800

┌──────────────────────────────────────┐
│ Channel Name          [unread: 3]   │
│ text-sm font-medium   red-500 badge │
│ (bold if unread > 0)                │
│                                      │
│ last message preview   [time]       │
│ text-xs text-slate-500 text-[10px]  │
│ truncate               text-slate-500│
└──────────────────────────────────────┘

Unread badge: min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full
```

### Message Area

**Channel Header:**
```
px-4 py-2.5 border-b border-slate-700 flex items-center justify-between
shrink-0

Left: channel name (font-medium text-sm text-slate-100) + member count (text-xs text-slate-500)
  Mobile back button: md:hidden text-slate-400 "←"
Right: settings gear icon (text-slate-400 hover:text-slate-200)
```

**Message Bubble:**
```
Own messages (right-aligned):
  bg-blue-600 text-white rounded-lg rounded-br-sm px-3 py-2 text-sm max-w-[75%]

Others' messages (left-aligned):
  bg-slate-800 text-slate-100 rounded-lg rounded-bl-sm px-3 py-2 text-sm max-w-[75%]

Sender name (others only): text-xs font-medium text-slate-400 mb-0.5
Timestamp: text-[10px] text-slate-500 mt-0.5

System messages:
  text-center py-1
  bg-slate-800 text-slate-500 text-xs px-3 py-1 rounded-full inline
```

**Reactions Row:**
```
flex gap-1 mt-1
Each reaction: bg-slate-700/50 border border-slate-600 rounded-full px-2 py-0.5 text-xs
  hover:bg-slate-700
  emoji + count
  Own reaction: border-blue-500/50 bg-blue-500/10
```

**Reply Count:**
```
text-xs text-blue-400 hover:underline cursor-pointer mt-1
"답글 N개"
```

**Attachments:**
```
mt-1.5 space-y-1.5

Images: max-w-64 rounded-lg hover:opacity-90 cursor-pointer
Files: flex items-center gap-3 border border-slate-700 rounded-lg p-3 max-w-64
  hover:bg-slate-800
  Icon (typed): text-xl
  Filename: text-sm truncate
  Size: text-xs text-slate-500
  Download arrow: text-slate-400
```

**Typing Indicator:**
```
px-4 py-1 text-xs text-slate-500
"[name] 입력 중..."
```

### Message Input

```
px-4 py-3 border-t border-slate-700 shrink-0

flex items-end gap-2

Textarea:
  flex-1 bg-slate-800 border border-slate-600 focus:border-blue-500
  rounded-lg px-3 py-2 text-sm
  resize-none max-h-32 overflow-y-auto
  placeholder="메시지를 입력하세요..."

File attach button:
  p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700
  icon: 📎

Send button:
  bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium
  disabled:opacity-50
```

**@Mention Popup:**
```
absolute bottom-full left-0 mb-1
bg-slate-800 border border-slate-700 rounded-xl shadow-2xl
max-h-48 overflow-y-auto w-64

Each option:
  px-3 py-2 text-sm hover:bg-slate-700 cursor-pointer
  ┌──────────────────────────────────┐
  │ ● Agent Name    role             │
  │ green dot       text-xs slate-500│
  └──────────────────────────────────┘
  Online dot: bg-emerald-400 w-2 h-2 rounded-full
  Offline dot: bg-slate-600
```

### Thread Panel (slides from right)

```
w-80 border-l border-slate-700 bg-slate-900 flex flex-col

Header:
  px-4 py-2.5 border-b border-slate-700
  "스레드" font-medium text-sm + close button

Original message:
  px-4 py-3 border-b border-slate-700/50 bg-slate-800/30
  sender + content + time

Replies: flex-1 overflow-y-auto px-4 py-2 space-y-2
  Same bubble style as main messages

Reply input: same as main input area
```

### Channel Settings Modal

```
Modal: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl
max-w-md max-h-[80vh] overflow-y-auto

Sections:
1. Channel info edit:
   Name input + Description input
   Save button: bg-blue-600

2. Members list:
   Each member: flex items-center justify-between py-2
     Avatar/name + online dot + role badge
     Remove button (if not self): text-xs text-red-400

   Add member search:
     Input: bg-slate-800 border border-slate-600 text-sm
     Filtered user list dropdown

3. Danger zone:
   채널 나가기: border border-amber-500/50 text-amber-400 w-full py-2 rounded-lg
   채널 삭제 (creator only): bg-red-600 hover:bg-red-500 text-white w-full py-2 rounded-lg
```

### Channel Create Modal

```
Modal: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md p-6

Fields:
  채널 이름: required, bg-slate-800 border border-slate-600 rounded-lg
  설명: optional
  초기 멤버: multi-select from company users

Buttons: 취소 + 생성 (bg-blue-600)
```

---

## Page Layout — Conversation Mode

```
Same overall structure but using ConversationsView component

┌────────────────┬──────────────────────────────────────────────┐
│ CONVERSATIONS  │ CHAT AREA                                    │
│ w-72 border-r  │ flex-1                                       │
│                │                                              │
│ [+ 새 대화]    │ Header: name + count + leave                 │
│                │                                              │
│ Conv 1 (group) │ Messages:                                    │
│   last msg     │   own: bg-blue-600 text-white                │
│   unread: 2    │   other: bg-slate-800 text-slate-100         │
│                │   system: center, bg-slate-800 text-slate-500│
│ Conv 2 (1:1)   │   ai_report: card with preview               │
│   ...          │                                              │
│                │ Typing indicator                              │
│                │                                              │
│                │ Input: textarea + send button                 │
└────────────────┴──────────────────────────────────────────────┘
```

**Conversation List Item:**
```
w-full text-left px-3 py-2.5 border-b border-slate-800
Selected: bg-blue-600/10

Avatar: text-lg (👥 for group, 💬 for direct)
Name: font-medium text-sm (bold if unread)
Last message: text-xs text-slate-500 truncate
Unread badge: bg-red-500 text-white text-[10px] rounded-full
Time: text-[10px] text-slate-500
```

**AI Report Card (in chat):**
```
border border-blue-500/30 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg

Header: bg-blue-600/10 px-3 py-2 border-b border-blue-500/20
  📄 "AI 보고서" text-xs font-medium text-blue-400

Body: bg-slate-900 px-3 py-2
  Title: text-sm font-medium text-slate-100 truncate
  Summary: text-xs text-slate-500 line-clamp-2
  "전체 보기 →" text-[10px] text-blue-400

Timestamp: text-[10px] text-slate-500
```

---

## Responsive Behavior

- **Mobile (<md):** Sidebar and chat area are mutually exclusive (show one at a time)
  - Sidebar: `${showChat ? 'hidden md:flex' : ''}`
  - Chat: `${showChat ? '' : 'hidden md:flex'}`
  - Back button: `md:hidden` in chat header
- **Desktop (>=md):** Side-by-side layout

---

## Backend API Routes

```
# Channels
GET    /workspace/messenger/channels           → 채널 목록
POST   /workspace/messenger/channels           → 채널 생성
GET    /workspace/messenger/channels/:id        → 채널 상세
PUT    /workspace/messenger/channels/:id        → 채널 수정
DELETE /workspace/messenger/channels/:id        → 채널 삭제
GET    /workspace/messenger/channels/:id/messages → 메시지 목록
POST   /workspace/messenger/channels/:id/messages → 메시지 전송
GET    /workspace/messenger/channels/:id/members  → 멤버 목록
POST   /workspace/messenger/channels/:id/members  → 멤버 추가
DELETE /workspace/messenger/channels/:id/members/:uid → 멤버 제거
DELETE /workspace/messenger/channels/:id/members/me → 채널 나가기
POST   /workspace/messenger/channels/:id/messages/:mid/reactions → 리액션 추가
DELETE /workspace/messenger/channels/:id/messages/:mid/reactions/:emoji → 리액션 제거
GET    /workspace/messenger/channels/:id/messages/:mid/thread → 스레드 조회
PUT    /workspace/messenger/channels/:id/read → 읽음 처리
GET    /workspace/messenger/search → 메시지 검색
GET    /workspace/messenger/online → 온라인 유저
GET    /workspace/messenger/users → 회사 유저 목록
GET    /workspace/messenger/agents → AI 에이전트 목록

# Conversations
GET    /workspace/conversations           → 대화 목록
POST   /workspace/conversations           → 대화 생성
GET    /workspace/conversations/:id       → 대화 상세
GET    /workspace/conversations/:id/messages → 메시지 (cursor-based)
POST   /workspace/conversations/:id/messages → 메시지 전송
DELETE /workspace/conversations/:id/messages/:mid → 메시지 삭제
POST   /workspace/conversations/:id/read → 읽음 처리
POST   /workspace/conversations/:id/typing → 타이핑 이벤트
DELETE /workspace/conversations/:id/participants/me → 나가기
```

---

## WebSocket Events

```
Channel: messenger
Events: new-message, typing, reaction-added, reaction-removed

Channel: conversation::{conversationId}
Events: new-message, message-deleted, typing, participant-added, participant-left
```

---

## Current Code Issues to Fix

1. **Two separate messenger systems** — channel-based (messenger.tsx 800+ lines) and conversation-based. Need to unify UI/UX
2. **messenger.tsx is a monolith** — 800+ lines, needs extraction into components
3. **Light mode remnants** — `bg-white`, `dark:bg-zinc-900`, etc.
4. **No skeleton loading** — messages show no loading state
5. **Emoji picker** — hardcoded 6 emojis, could use a proper picker
6. **File upload UX** — basic, needs drag-and-drop and progress indicator
7. **Search results** — basic list, could show context highlighting

## Component Structure (target)

```
pages/messenger.tsx               → Main page, mode toggle
components/messenger/
  channel-sidebar.tsx             → Channel list sidebar
  channel-chat.tsx                → Channel message area
  channel-settings-modal.tsx      → Channel settings
  channel-create-modal.tsx        → New channel
  message-bubble.tsx              → Shared message rendering
  thread-panel.tsx                → Thread replies
  mention-popup.tsx               → @mention autocomplete
  conversations-view.tsx          → Conversation mode
  conversations-panel.tsx         → Conversation list
  conversation-chat.tsx           → Conversation messages
  new-conversation-modal.tsx      → New conversation
  share-to-conversation-modal.tsx → Report sharing
```
