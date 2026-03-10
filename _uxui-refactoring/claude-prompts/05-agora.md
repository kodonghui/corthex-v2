# 05. AGORA (토론장) — Design Specification

## 1. Page Overview

- **Purpose**: Multi-agent debate arena where AI agents discuss topics in structured rounds. Users create debates, select participating agents, watch real-time round-by-round discussions via WebSocket, and review consensus results with diff views.
- **Key User Goals**: Create new debates (choose topic + agents), watch debates unfold live with speech bubbles, review completed debate results (consensus/dissent/partial), compare positions across rounds via diff view, navigate from chat when @agora triggers a debate.
- **Route**: `/agora`
- **Data Dependencies**:
  - `GET /workspace/debates?limit=50` → debate list
  - `GET /workspace/debates/:id` → single debate detail (5s poll during in-progress)
  - `GET /workspace/debates/:id/timeline` → timeline entries (completed debates)
  - `POST /workspace/debates` → create debate `{ topic, debateType, participantAgentIds }`
  - `POST /workspace/debates/:id/start` → start debate (auto-called after create)
  - `GET /workspace/agents?limit=100` → agent list for participant selection
  - WebSocket: AGORA channel for live debate events (round-started, speech-delivered, round-ended, debate-completed, debate-failed)
- **Current State**: Functional 3-panel layout with zinc palette. Needs slate design tokens, improved speech cards, better visual hierarchy for round separators and consensus results.

## 2. Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
├──────────────┬──────────────────────────────────────┬───────────────────────┤
│ DebateList   │ DebateTimeline (center)               │ DebateInfoPanel      │
│ (w-72)       │ (flex-1)                              │ (w-72, lg only)      │
│              │                                        │                      │
│ AGORA 토론   │ ── Round 1 / 3 ──                     │ Tab: [정보] [Diff]   │
│ [+ 새 토론]  │                                        │                      │
│              │ [Avatar] AgentName R1 [position]       │ 토론 정보             │
│ Filter pills │ "Speech content here..."               │ 유형: 심층토론        │
│ [전체|진행|  │                                        │ 상태: 완료            │
│  완료|실패]  │ [Avatar] AgentName R1 [position]       │ 최대 라운드: 3        │
│              │ "Speech content here..."               │ ...                   │
│ [Debate 1] ● │                                       │                      │
│ [Debate 2] ✓ │ ── Round 1 완료 — 3명 발언 ──         │ 참여자 (N)            │
│ [Debate 3] ✗ │                                       │ [○ Agent1 - role]    │
│              │ ── Round 2 / 3 ──                     │ [○ Agent2 - role]    │
│              │ ...                                    │                      │
│              │                                        │                      │
│              │ [ConsensusCard: ✅ 합의 도달]          │                      │
│              │                                        │                      │
│              │ [← 사령관실로 돌아가기] (if from chat) │                      │
├──────────────┴──────────────────────────────────────┴───────────────────────┤

Mobile (< md):
┌─────────────────────────┐
│ List view (full width)  │  ← or →  Detail view (full width)
│ or                      │          with back button
│ Detail view             │
└─────────────────────────┘
```

- **Page container**: `flex h-full bg-slate-900`
- **Left panel (debate list)**: `w-72 shrink-0 border-r border-slate-700`
  - Mobile: hidden when viewing detail (`hidden md:block` when `mobileView === 'detail'`)
- **Center panel (timeline)**: `flex-1 flex flex-col min-w-0`
  - Mobile: hidden when viewing list (`hidden md:flex` when `mobileView === 'list'`)
- **Right panel (info)**: `hidden lg:block w-72 shrink-0 border-l border-slate-700`
  - Only visible on `lg` breakpoint and when a debate is selected

## 3. Component Breakdown

### 3.1 DebateListPanel

- **Purpose**: Searchable, filterable list of all debates
- **Container**: `flex flex-col h-full`

#### Header
- `shrink-0 px-4 py-3 border-b border-slate-700`
- Title row: `flex items-center justify-between mb-2`
  - Title: `text-sm font-bold text-slate-100` → "AGORA 토론"
  - Create button: `Button size="sm"` → "+ 새 토론"
- Filter pills: `flex gap-1`
  - Options: 전체, 진행중, 완료, 실패
  - Active: `text-[10px] px-2 py-1 rounded-full bg-blue-900/50 text-blue-300`
  - Inactive: `text-[10px] px-2 py-1 rounded-full text-slate-400 hover:text-slate-300`

#### Debate List
- `flex-1 overflow-y-auto`
- Loading: centered `Spinner`
- Empty: `EmptyState` with "진행된 토론이 없습니다" + action button
- Each debate item: `w-full text-left px-4 py-3 border-b border-slate-800 transition-colors`
  - Selected: `bg-blue-950/50`
  - Default: `hover:bg-slate-800/50`
  - Topic: `text-sm font-medium text-slate-100 line-clamp-1`
  - Status badge: `Badge` with appropriate variant
    - 대기: `variant="default"`
    - 진행중: `variant="warning"`
    - 완료: `variant="success"`
    - 실패: `variant="error"`
  - Meta row: `text-[10px] text-slate-400`
    - Type (심층토론/토론) · participant count · date

- **data-testid**: `debate-list-panel`, `debate-create-btn`, `debate-filter-all`, `debate-filter-in-progress`, `debate-filter-completed`, `debate-filter-failed`, `debate-item-{id}`

### 3.2 DebateTimeline

- **Purpose**: Real-time timeline of debate rounds, speeches, and results
- **Container**: `flex-1 overflow-y-auto p-4 space-y-4` with auto-scroll to bottom

#### Topic Header (when debate selected)
- `shrink-0 px-4 py-3 border-b border-slate-700`
- Title: `text-sm font-bold text-slate-100 truncate`
- In-progress indicator: `flex items-center gap-1 text-[10px] text-emerald-500`
  - Dot: `w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse`
  - Label: "진행중"
- Meta: `text-[10px] text-slate-400 mt-0.5`
  - `{type} · {participants}명 · Round {current}/{max}`

#### Mobile Back Button
- `md:hidden shrink-0 px-4 py-2 border-b border-slate-700`
- Button: `text-xs text-blue-500 hover:text-blue-400` → "← 목록으로"

#### Timeline Entries

**Round Header:**
- `flex items-center gap-3 py-2`
- Left/right lines: `h-px flex-1 bg-slate-700`
- Label: `text-xs font-semibold text-slate-400` → "Round N / M"

**SpeechCard:**
- `flex gap-3 group`
- Avatar circle: `shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mt-0.5`
  - 8 color variants: blue, red, purple, emerald, amber, cyan, pink, orange (each `bg-{color}-500/20 text-{color}-400`)
  - Hash-based color assignment per agentId
- Content: `flex-1 min-w-0`
  - Name row: `flex items-center gap-2 mb-1`
    - Agent name: `text-xs font-bold text-slate-100`
    - Round: `text-[10px] text-slate-500 font-mono` → "R1"
    - Position badge: `text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400`
    - Live indicator: `text-[10px] text-emerald-500` with pulse dot → "발언 중"
  - Content text: `text-sm text-slate-300 whitespace-pre-wrap leading-relaxed`
  - Expand/collapse: collapsible at 200 chars
    - Toggle: `text-xs text-blue-500 hover:text-blue-400 transition-colors` → "더 보기" / "접기"

**Round End:**
- `text-center py-1`
- Label: `text-[10px] text-slate-500` → "Round N 완료 — M명 발언"

**ConsensusCard (debate result):**
- `rounded-xl border p-4 space-y-3`
- 3 variants based on consensus result:
  - `consensus`: `bg-emerald-500/10 border-emerald-500/30` → ✅ 합의 도달
  - `dissent`: `bg-red-500/10 border-red-500/30` → ❌ 합의 실패 (이견)
  - `partial`: `bg-amber-500/10 border-amber-500/30` → ⚠️ 부분 합의
- Header: icon + title + round count
- Summary: `text-sm text-slate-300 leading-relaxed`
- Positions grid: `grid grid-cols-2 gap-3`
  - 다수 의견 / 소수 의견 sections
- Key arguments: bulleted list `text-xs text-slate-400`

**Error:**
- `rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500`
- "토론 오류: {error}"

#### Empty States
- No debate selected: centered with 🗣️ emoji + "토론을 선택하거나 새 토론을 시작하세요"
- Pending debate: centered `Spinner` + "토론 시작 대기 중..."
- Live with no entries: centered `Spinner` + "토론 진행 중..."

#### Back to Chat Button
- Visible when `fromChat && debate.status === 'completed'`
- `shrink-0 px-4 py-3 border-t border-slate-700`
- `w-full py-2 text-xs font-medium text-blue-500 hover:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors`
- "← 사령관실로 돌아가기"

- **data-testid**: `debate-timeline`, `debate-topic-header`, `debate-back-to-list-btn`, `round-header-{n}`, `speech-card-{index}`, `consensus-card`, `back-to-chat-btn`

### 3.3 DebateInfoPanel

- **Purpose**: Debate metadata + diff view (right sidebar, desktop only)
- **Container**: `h-full flex flex-col overflow-hidden`

#### Tabs
- `Tabs` component with items: [정보, Diff]
- Diff tab disabled when debate not completed

#### Info Tab
- Header: `px-4 py-3 border-b border-slate-700`
  - Section title: `text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2` → "토론 정보"
  - Topic: `text-sm font-medium text-slate-100`
- Meta rows: `px-4 py-3 space-y-4`
  - Each row: `flex items-center justify-between`
    - Label: `text-[10px] text-slate-400`
    - Value: `text-xs text-slate-300`
  - Fields: 유형, 상태, 최대 라운드, 진행 라운드, 시작, 완료
- Participants: `space-y-1.5`
  - Title: `text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2` → "참여자 (N)"
  - Each participant: `flex items-center gap-2`
    - Color avatar: `w-6 h-6 rounded-full` with hash-based color
    - Name: `text-xs text-slate-100`
    - Role: `text-[10px] text-slate-400`
- Error section (if debate.error): `rounded-lg border border-red-500/30 bg-red-500/10 p-2`

#### Diff Tab
- `DiffView` component showing position changes across rounds
- `px-4 py-3`

- **data-testid**: `debate-info-panel`, `debate-info-tab`, `debate-diff-tab`, `debate-participant-{id}`

### 3.4 CreateDebateModal

- **Purpose**: Create and auto-start a new debate
- **Container**: `Modal isOpen={open}` with title "새 토론 시작"

#### Form Fields
1. **Topic input**: `Input` with placeholder "예: 신규 사업 진출 전략에 대한 논의"
2. **Debate type**: `flex gap-2` with two toggle buttons
   - 토론 (2라운드) / 심층토론 (3라운드)
   - Selected: `border-blue-500 bg-blue-950 text-blue-300`
   - Default: `border-slate-700 text-slate-500 hover:border-slate-600`
3. **Agent selection**: scrollable list with checkboxes
   - Container: `max-h-48 overflow-y-auto border border-slate-700 rounded-lg divide-y divide-slate-800`
   - Each agent: `w-full flex items-center gap-2 px-3 py-2 text-left transition-colors`
     - Selected: `bg-blue-950/50`
     - Checkbox: custom styled `w-4 h-4 rounded border`
       - Checked: `bg-blue-600 border-blue-600 text-white` with ✓
     - Name + role + department
   - Count: `text-[10px] text-slate-400 mt-1` → "N명 선택됨"
   - Minimum 2 agents required

#### Actions
- Cancel: `Button variant="outline"`
- Submit: `Button` → "토론 시작" (disabled if topic empty or < 2 agents)
- Error: `text-xs text-red-500`

- **data-testid**: `create-debate-modal`, `debate-topic-input`, `debate-type-debate`, `debate-type-deep`, `debate-agent-{id}`, `debate-submit-btn`, `debate-cancel-btn`

## 4. Interactions & State

| Action | Trigger | Effect |
|--------|---------|--------|
| Select debate | Click debate in list | Load detail + timeline, mobile switches to detail view |
| Filter debates | Click filter pill | Filter list by status |
| Create debate | Click + 새 토론 → fill form → submit | `POST /debates` + `POST /:id/start` + auto-select |
| Watch live | WebSocket events | Speech cards appear in real-time with auto-scroll |
| Expand speech | Click "더 보기" | Show full content |
| Back to list (mobile) | Click ← 목록으로 | Switch to list view |
| Back to chat | Click ← 사령관실 | `navigate('/chat')` |
| View diff | Click Diff tab | Show round-over-round position diff |
| Auto-select | Navigate from chat with debateId | Auto-load and select that debate |

## 5. Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| `< md` | Single panel: list OR detail with back navigation |
| `>= md` | 2-panel: list (w-72) + timeline (flex-1) |
| `>= lg` | 3-panel: list (w-72) + timeline (flex-1) + info panel (w-72) |

## 6. Real-Time Updates

- **WebSocket AGORA channel**: debate-specific events
  - `round-started` → add round header
  - `speech-delivered` → add speech card with live indicator
  - `round-ended` → add round end separator
  - `debate-completed` → add consensus card
  - `debate-failed` → add error card
- **Polling**: 5s refetch on debate detail when status is `in-progress`
- **Auto-scroll**: scroll to bottom on new entries (disabled when user scrolls up)

## 7. Loading / Empty / Error States

| State | Display |
|-------|---------|
| List loading | Centered `Spinner` |
| No debates | `EmptyState`: "진행된 토론이 없습니다" + "토론 시작" button |
| No debate selected | Center: 🗣️ + "토론을 선택하거나 새 토론을 시작하세요" |
| Debate pending | Centered `Spinner` + "토론 시작 대기 중..." |
| Debate live, no entries yet | Centered `Spinner` + "토론 진행 중..." |
| Create error | Red text below form |
| Debate error | Red error card in timeline |

## 8. Animations & Transitions

- Filter pill: `transition-colors`
- Debate list item hover: `transition-colors`
- Speech expand/collapse: text truncation toggle
- In-progress pulse: `animate-pulse` on emerald dot
- Modal open/close: standard `Modal` animation
- Agent selection: `transition-colors` on hover/select

## 9. Accessibility

- Debate list items: semantic `<button>` elements
- Filter pills: button role with clear active state
- Create modal: focus trap, labeled inputs
- Speech cards: readable with semantic structure (avatar, name, content)
- Back navigation: clearly labeled with arrow
- Minimum contrast: all text meets WCAG AA against slate-900 background

## 10. data-testid Map

```
debate-list-panel, debate-create-btn
debate-filter-all, debate-filter-in-progress, debate-filter-completed, debate-filter-failed
debate-item-{id}
debate-timeline, debate-topic-header
debate-back-to-list-btn
round-header-{n}, speech-card-{index}
consensus-card, back-to-chat-btn
debate-info-panel, debate-info-tab, debate-diff-tab
debate-participant-{id}
create-debate-modal, debate-topic-input
debate-type-debate, debate-type-deep
debate-agent-{id}, debate-submit-btn, debate-cancel-btn
```
