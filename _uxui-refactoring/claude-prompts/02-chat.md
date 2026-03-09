# 02. Chat — Design Specification

## 1. Page Overview

- **Purpose**: Direct 1:1 conversation with individual AI agents. Persistent sessions with streaming responses, file attachments, tool call visibility, and secretary delegation chains.
- **Key User Goals**: Start chat sessions with specific agents, send messages with attachments, read streaming AI responses, view tool usage, track delegations (secretary).
- **Route**: `/chat`
- **Data Dependencies**:
  - `GET /workspace/agents` → agent list
  - `GET /workspace/chat/sessions` → user's sessions
  - `POST /workspace/chat/sessions` → create session `{ agentId, title? }`
  - `GET /workspace/chat/sessions/:id/messages?before={cursor}` → paginated messages
  - `POST /workspace/chat/sessions/:id/messages` → send `{ content, attachmentIds? }`
  - `PATCH /workspace/chat/sessions/:id` → rename session
  - `DELETE /workspace/chat/sessions/:id` → delete session (cascade)
  - `GET /workspace/chat/sessions/:id/delegations` → secretary delegations
  - `GET /workspace/chat/sessions/:id/tool-calls` → tool call history
  - `POST /workspace/files` → file upload
  - WebSocket channel: `chat-stream::{sessionId}`
- **Current State**: Functional 840-line page. Needs dark-mode token consistency, refined bubble layout, and polished streaming UX.

## 2. Page Layout Structure

```
Desktop (≥ md):
┌──────────────┬──────────────────────────────────────────────┐
│ SessionPanel │ ChatArea                                      │
│ (w-72)       │                                              │
│              │ ┌──────────────────────────────────────────┐ │
│ [New Chat]   │ │ Header (agent name, status, delegations) │ │
│ ───────────  │ ├──────────────────────────────────────────┤ │
│ 오늘         │ │ Messages (scrollable, infinite up)       │ │
│  Session 1 ← │ │                                          │ │
│  Session 2   │ │ [user msg]      [tool-call card]         │ │
│ 어제         │ │           [agent msg]                     │ │
│  Session 3   │ │ [user msg + attachments]                  │ │
│  ...         │ │           [streaming agent msg...]        │ │
│              │ ├──────────────────────────────────────────┤ │
│              │ │ Input (attachments + textarea + send)     │ │
│              │ └──────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────┘

Mobile (< md):
┌────────────────────┐          ┌────────────────────┐
│ [← Back] Agent     │    OR    │ SessionPanel       │
│ Messages           │          │ (full screen)      │
│ ...                │          │                    │
│ Input              │          │                    │
└────────────────────┘          └────────────────────┘
```

- **Page container**: `flex h-full bg-slate-900`
- **Session panel**: `w-72 flex flex-col border-r border-slate-700 bg-slate-900 shrink-0 hidden md:flex`
- **Chat area**: `flex-1 flex flex-col min-w-0`
- **Mobile**: Session panel becomes full screen; chat area becomes full screen with back button

## 3. Component Breakdown

### 3.1 SessionPanel

- **Container**: `w-72 flex flex-col border-r border-slate-700 bg-slate-900 shrink-0`

**Header**: `px-3 py-3 border-b border-slate-700 shrink-0`
- New chat button: `<button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"><Plus className="w-4 h-4" /> 새 대화</button>`

**Session list**: `flex-1 overflow-y-auto`

**Date group**:
- Header: `<button className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500 hover:bg-slate-800/50 transition-colors">`
  - Label: `<span>{groupLabel}</span>` (오늘, 어제, 이번 주, 이전)
  - Chevron: `<ChevronDown className="w-3 h-3 transition-transform {collapsed && 'rotate-180'}" />`

**Session item**: `<button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-800 transition-colors group {selected && 'bg-slate-800'}">`
- Avatar: `<span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">{agentInitial}</span>`
- Content: `<div className="flex-1 min-w-0">`
  - Title: `<p className="text-sm text-slate-200 truncate">{title}</p>`
  - Time: `<p className="text-xs text-slate-500">{lastMessageTime}</p>`
- Context menu (on hover/right-click): `<div className="absolute right-0 top-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1 w-36">`
  - Rename: `<button className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700"><Pencil className="w-3.5 h-3.5" /> 이름 변경</button>`
  - Delete: `<button className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-slate-700"><Trash2 className="w-3.5 h-3.5" /> 삭제</button>`

**Inline rename**: replaces title with `<input className="w-full bg-slate-700 border border-blue-500 rounded px-2 py-0.5 text-sm text-white outline-none" />`

**Delete confirmation dialog**:
- Overlay: `fixed inset-0 z-50 bg-black/60 flex items-center justify-center`
- Box: `bg-slate-800 border border-slate-700 rounded-xl p-5 max-w-sm mx-4`
- Title: `<h4 className="text-sm font-semibold text-slate-100 mb-2">대화 삭제</h4>`
- Desc: `<p className="text-xs text-slate-400 mb-4">이 대화를 삭제하면 모든 메시지, 도구 호출, 위임이 함께 삭제됩니다.</p>`
- Buttons: `<div className="flex justify-end gap-2">`
  - Cancel: `<button className="px-3 py-1.5 text-sm rounded-lg text-slate-400 hover:bg-slate-700 transition-colors">취소</button>`
  - Delete: `<button className="px-3 py-1.5 text-sm rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors">삭제</button>`

- **data-testid**: `session-panel`

### 3.2 AgentListModal

- **Purpose**: Select agent to start new chat session
- **Overlay**: `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm`
- **Modal**: `bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col`
- **Header**: `flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0`
  - Title: `<h3 className="text-lg font-semibold text-slate-50">에이전트 선택</h3>`
  - Close: `<button className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-700 transition-colors"><X className="w-5 h-5" /></button>`
- **Search**: `<input className="w-full bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none mx-5 my-3 max-w-[calc(100%-40px)]" placeholder="이름 또는 역할 검색..." />`
- **Agent list**: `flex-1 overflow-y-auto`
  - Agent item: `<button className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-700/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">`
    - Avatar: `<span className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300 shrink-0 relative">{initials}`
      - Status dot (absolute bottom-right):
        - online: `<span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-800" />`
        - working: `<span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-slate-800 animate-pulse" />`
        - error: `<span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-slate-800" />`
        - offline: `<span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-slate-600 border-2 border-slate-800" />`
    - Content:
      - Name: `<span className="text-sm font-medium text-slate-200">{name}</span>`
      - Role: `<span className="text-xs text-slate-400">{role}</span>`
    - Secretary badge: `<span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">⭐ 비서</span>`
  - Disabled: offline agents (grayed out, not clickable)
  - Sort: secretary first, then by status (online > working > error > offline)

- **data-testid**: `agent-list-modal`

### 3.3 ChatArea

- **Container**: `flex-1 flex flex-col min-w-0`

**Header**: `flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0`
- Left: `<div className="flex items-center gap-3">`
  - Mobile back: `<button className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 mr-1"><ArrowLeft className="w-5 h-5" /></button>`
  - Agent avatar (status-colored)
  - Agent name: `<span className="text-sm font-semibold text-slate-100">{agentName}</span>`
  - Status: `<span className="text-xs text-slate-500">{statusLabel}</span>` (온라인/작업중/오류/오프라인)
- Right (secretary only):
  - Delegation toggle: `<button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium {active ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-500 hover:bg-slate-700'} transition-colors"><GitBranch className="w-3.5 h-3.5" /> 위임 내역</button>`

**Connection banners** (conditionally shown):
- Disconnected: `<div className="flex items-center gap-2 px-4 py-2 bg-amber-950/50 border-b border-amber-900/50 text-amber-300 text-xs"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> 연결이 끊어졌습니다. 재연결 중...</div>`
- Reconnected: `<div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/50 border-b border-emerald-900/50 text-emerald-300 text-xs"><Check className="w-3.5 h-3.5 shrink-0" /> 다시 연결되었습니다</div>`

**Message list**: `flex-1 overflow-y-auto px-4 py-3 space-y-4`

**Load more** (infinite scroll up): `<button className="flex items-center justify-center w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">이전 메시지 더 보기</button>`

**User message bubble**:
- Container: `flex justify-end`
- Bubble: `max-w-[75%] bg-blue-600 rounded-2xl rounded-br-md px-4 py-2.5`
  - Text: `<p className="text-sm text-white">{content}</p>`
  - Attachments (if any): `<div className="flex flex-wrap gap-1.5 mt-2">`
    - File chip: `<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/30 text-xs text-blue-100"><Paperclip className="w-3 h-3" />{filename} · {size}</span>`
  - Time: `<p className="text-xs text-blue-200/70 mt-1 text-right">{time}</p>`

**Agent message bubble**:
- Container: `flex items-start gap-2.5`
- Avatar: `w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0`
- Bubble: `max-w-[75%] bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-2.5`
  - Agent name: `<p className="text-xs font-medium text-slate-400 mb-1">{agentName}</p>`
  - Content: `<div className="text-sm text-slate-200 prose prose-sm prose-invert max-w-none">{markdownContent}</div>`
  - Tool call cards (inline): see ToolCallCard below
  - Time: `<p className="text-xs text-slate-500 mt-1">{time}</p>`

**Streaming message bubble** (agent, while typing):
- Same as agent bubble but with cursor animation
- Text appears progressively
- Cursor: `<span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-0.5" />`
- Typing indicator (before text): `<div className="flex items-center gap-1 py-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" /><span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:150ms]" /><span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:300ms]" /></div>`

**Delegation status** (secretary sessions, inline):
- Single: `<div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> → {agentName}에게 위임 중...</div>`
- Multi: `<div className="...">→ {n}개 부서 위임 중 ({completed}/{total} 완료)</div>`
- Chain: `<div className="...">🔀 {agent1} → {agent2} → {agent3}</div>` (expandable)

**Error state**: `<div className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border border-red-900/30 rounded-lg mx-4"><AlertCircle className="w-4 h-4 text-red-400 shrink-0" /><span className="text-sm text-red-300">{error}</span><button className="text-xs text-red-400 hover:text-red-300 ml-auto">다시 시도</button></div>`

**Empty state** (new session):
- Container: `flex flex-col items-center justify-center h-full px-6 text-center`
- Icon: `<MessageSquare className="w-12 h-12 text-slate-700 mb-3" />`
- Title: `<p className="text-sm font-medium text-slate-400">{agentName}과(와) 대화를 시작하세요</p>`
- Hint: `<p className="text-xs text-slate-500 mt-1">무엇이든 질문해보세요</p>`

- **data-testid**: `chat-area`

### 3.4 ToolCallCard

- **Purpose**: Show tool execution inline with agent messages
- **Container**: `bg-slate-900/50 border border-slate-700/50 rounded-lg p-2.5 mt-2`
- **Header**: `flex items-center gap-2`
  - Status icon:
    - running: `<span className="text-xs">⏳</span>`
    - success: `<span className="text-xs">✅</span>`
    - error: `<span className="text-xs">❌</span>`
    - timeout: `<span className="text-xs">⏱</span>`
  - Tool name: `<span className="text-xs font-mono text-slate-300">{toolName}</span>`
  - Status label: `<span className="text-xs text-slate-500">{statusLabel}</span>`
  - Duration: `<span className="text-xs text-slate-600 ml-auto">{duration}</span>`
- **Expand toggle**: `<button className="text-xs text-slate-500 hover:text-slate-300 mt-1 transition-colors">{expanded ? '접기' : '상세 보기'}</button>`
- **Expanded content**: `<div className="mt-2 space-y-2">`
  - Input: `<pre className="text-xs text-slate-500 bg-slate-900 rounded p-2 max-h-20 overflow-y-auto font-mono">{JSON.stringify(input, null, 2)}</pre>`
  - Output: `<pre className="text-xs text-slate-400 bg-slate-900 rounded p-2 max-h-20 overflow-y-auto font-mono">{output}</pre>`
- Error border: `border-red-900/50` instead of `border-slate-700/50`
- Running state: progress text `<p className="text-xs text-slate-500 mt-1 line-clamp-2 font-mono">{progressText}</p>`

- **data-testid**: `tool-call-{id}`

### 3.5 MessageInput

- **Container**: `shrink-0 border-t border-slate-700 bg-slate-900 px-4 py-3`

**Pending attachments**: `<div className="flex flex-wrap gap-2 mb-2">`
- Chip: `<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">`
  - `<Paperclip className="w-3 h-3" />`
  - `<span>{filename} · {formatSize}</span>`
  - Remove: `<button className="text-slate-500 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>`

**Input row**: `<div className="flex items-end gap-2">`
- Attach button: `<button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors shrink-0"><Paperclip className="w-4 h-4" /></button>`
- Textarea: `<textarea className="flex-1 bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none resize-none min-h-[44px] max-h-[120px] transition-colors" placeholder="메시지를 입력하세요..." />`
- Send button: `<button className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0" disabled={empty || streaming}><Send className="w-4 h-4" /></button>`

- **data-testid**: `chat-input`

### 3.6 DelegationPanel (secretary sessions)

- **Purpose**: Show all delegations made by secretary during session
- **Container**: replaces message list when active, `flex-1 overflow-y-auto px-4 py-3 space-y-3`
- **Delegation item**: `bg-slate-800/50 border border-slate-700 rounded-xl p-4`
  - Header: `<div className="flex items-center justify-between mb-2">`
    - Agent: `<span className="text-sm font-medium text-slate-200">{targetAgentName}</span>`
    - Status badge:
      - completed: `<span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">완료</span>`
      - processing: `<span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">처리중</span>`
      - pending: `<span className="text-xs px-1.5 py-0.5 rounded bg-slate-600 text-slate-400">대기</span>`
      - failed: `<span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">실패</span>`
  - Prompt: `<p className="text-xs text-slate-400 mb-2 line-clamp-2">{delegationPrompt}</p>`
  - Response (if completed): `<p className="text-xs text-slate-300 line-clamp-3">{agentResponse}</p>`
  - Timestamps: `<div className="flex items-center gap-3 mt-2 text-xs text-slate-600"><span>생성: {created}</span><span>완료: {completed}</span></div>`

- **data-testid**: `delegation-panel`

## 4. Interaction Specifications

| Action | Trigger | Result |
|--------|---------|--------|
| New chat | Click "새 대화" | Open AgentListModal |
| Select agent | Click agent in modal | Create session, close modal, switch to chat |
| Send message | Enter or Send button | POST message, show user bubble, start stream |
| New line | Shift+Enter | Insert line break |
| Attach file | Click paperclip | File picker, upload to /workspace/files |
| Remove attachment | Click X on chip | Remove from pending list |
| Switch session | Click session in panel | Update URL param, load messages |
| Rename session | Right-click → 이름 변경 | Inline edit, PATCH on Enter |
| Delete session | Right-click → 삭제 | Confirm dialog, DELETE on confirm |
| Load older | Scroll to top or click button | Fetch next page (cursor pagination) |
| Toggle delegations | Click 위임 내역 button | Switch between messages and delegation list |
| Expand tool call | Click 상세 보기 | Show input/output details |
| Retry on error | Click 다시 시도 | Resend last user message |
| Launch debate | Type `/토론 [topic]` | Create debate, navigate to /agora |
| Mobile back | Click ← Back | Return to session list |

**WebSocket stream events**:
- `token` → append to streaming message text
- `tool-start` → add ToolCallCard (running)
- `tool-progress` → update progress text
- `tool-end` → finalize tool call (success/error)
- `delegation-start/end` → show delegation status
- `delegation-chain` → show chain indicator
- `done` → finalize agent message, refetch
- `error` → show error with retry

## 5. Responsive Design

### Desktop (≥ 1024px)
- SessionPanel (w-72) + ChatArea (flex-1) side by side
- Messages max-width 75%

### Tablet (768px - 1023px)
- Same layout, session panel narrows to w-60
- Message bubbles max-width 80%

### Mobile (< 768px)
- **Two views**: Session list (full screen) OR Chat (full screen with back button)
- Session panel: full width, no border
- Chat area: full width, agent name in header with back arrow
- Message bubbles: max-width 85%
- Input: compact, attachment button smaller

## 6. Animation & Transitions

- Message bubble appear: `animate-in fade-in slide-in-from-bottom-2 duration-300`
- Streaming cursor: `animate-pulse` on cursor span
- Typing dots: `animate-bounce` with staggered delays
- Session hover: `transition-colors duration-150`
- Delegation status pulse: `animate-pulse` on blue dot
- Connection banner: `animate-in fade-in slide-in-from-top-2 duration-300`
- Tool call expand: `transition-all duration-200`
- Context menu: `animate-in fade-in duration-150`

## 7. Accessibility

- **ARIA**: `role="log" aria-live="polite"` on message list, `role="dialog"` on modals
- **Labels**: textarea `aria-label="메시지 입력"`, send `aria-label="메시지 전송"`, attach `aria-label="파일 첨부"`
- **Focus**: Modal traps focus, session list is keyboard-navigable
- **Screen reader**: Agent status announced, tool call status announced
- **Contrast**: White text on blue-600 bubble (4.6:1), slate-200 on slate-800 (11.5:1)

## 8. data-testid Map

| Element | data-testid |
|---------|-------------|
| Chat page | `chat-page` |
| Session panel | `session-panel` |
| New chat button | `new-chat-btn` |
| Session item | `session-{id}` |
| Session context menu | `session-menu-{id}` |
| Agent list modal | `agent-list-modal` |
| Agent item | `agent-item-{id}` |
| Chat area | `chat-area` |
| Chat header | `chat-header` |
| Delegation toggle | `delegation-toggle` |
| Connection banner | `connection-banner` |
| Message list | `message-list` |
| User message | `msg-user-{id}` |
| Agent message | `msg-agent-{id}` |
| Streaming message | `msg-streaming` |
| Tool call card | `tool-call-{id}` |
| Delegation status | `delegation-status` |
| Delegation panel | `delegation-panel` |
| Chat input | `chat-input` |
| Send button | `chat-send-btn` |
| Attach button | `attach-btn` |
| Pending attachment | `attachment-{id}` |
| Load more button | `load-more-btn` |
| Empty state | `chat-empty` |
| Delete dialog | `delete-dialog` |
| Mobile back button | `mobile-back-btn` |
