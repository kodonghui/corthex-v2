# 25. ARGOS (정보 수집) — Claude Design Spec

## 복사할 프롬프트:

### What This Page Is For

ARGOS is the CEO's automated intelligence gathering system — user-defined "triggers" that monitor real-world conditions (stock prices, news keywords, market hours, custom schedules) and automatically execute AI agent instructions when conditions are met.

Think of it as: **"If [condition], then [tell AI agent to do this]."** The CEO sets up monitoring rules, and ARGOS watches 24/7, firing off agent tasks when thresholds are crossed.

---

### Design System Tokens

```
Page bg: bg-zinc-950 (dark mode default)
Card bg: bg-zinc-900 border border-zinc-800 rounded-lg
Elevated: bg-zinc-900 border border-zinc-800
Text primary: text-zinc-100
Text secondary: text-zinc-400
Text muted: text-zinc-500
Border: border-zinc-800
Action: indigo-600/indigo-700
Accent: indigo-400
Destructive: red-500
Success: green-400/emerald-400
Warning: amber-500/orange-400

Note: Component uses dark:* variant pattern (zinc-based dark theme).
Light mode fallbacks use zinc-50/zinc-100/zinc-200 etc.
```

---

### Layout Structure

```
┌──────────────────────────────────────────────────────┐
│ Header: "ARGOS" + subtitle + [+ 트리거 추가] button  │
├──────────────────────────────────────────────────────┤
│ Status Bar: 4 cards in grid                           │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │
│ │ 📡   │ │ 🤖   │ │ 🎯   │ │ 💵   │                │
│ │ Data │ │ AI   │ │ Act. │ │ Cost │                │
│ │ OK   │ │ OK   │ │  3   │ │$2.40 │                │
│ └──────┘ └──────┘ └──────┘ └──────┘                │
│                              마지막 확인: 14:30:22   │
├──────────────────────────────────────────────────────┤
│ Trigger Cards (vertical list, space-y-3)              │
│ ┌──────────────────────────────────────────────────┐ │
│ │ ● 삼성전자 감시  [가격 감시]  Agent: 비서실장     │ │
│ │ 삼성전자 70000 이상 · 쿨다운 30분               │ │
│ │ 마지막: 2시간 전 · 이벤트 12건                   │ │
│ │                        [편집] [중지] [삭제]      │ │
│ └──────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ (more trigger cards...)                           │ │
│ └──────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────┤
│ Event Log Section                                     │
│ [전체] [오류]  Status: [▼ 전체 상태]                  │
│ ┌──────────────────────────────────────────────────┐ │
│ │ ✅ 완료 · 가격 감시 · 14:30 · 2.3초              │ │
│ │ ❌ 실패 · 뉴스 감시 · 13:15 · 0.5초              │ │
│ │ (expandable rows with detail)                     │ │
│ └──────────────────────────────────────────────────┘ │
│ [← 이전] 1 / 3 [다음 →]                              │
└──────────────────────────────────────────────────────┘
```

**Container**: `p-6 sm:p-8 max-w-5xl`
**Note**: Page is rendered inside app shell; no min-h-screen or mx-auto needed.

---

### Component Specifications

#### 1. Page Header

```
Container: flex items-center justify-between mb-2
Title: text-2xl font-bold text-slate-50, content "ARGOS"
Subtitle: text-sm text-slate-400 mt-1, content "조건 기반 정보 자동 수집 — 놓치지 않겠습니다"
Button: bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors
  Content: "+ 트리거 추가"
```

#### 2. Status Bar (4 Cards)

```
Container: grid grid-cols-2 sm:grid-cols-4 gap-3
```

**Status Card (OK/NG type — Data, AI)**:
```
OK state:
  Container: bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3
  Icon: text-lg (📡 or 🤖)
  Label: text-xs text-slate-400 font-medium
  Value: text-lg font-bold text-emerald-400, content "OK"

NG state:
  Container: bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-pulse
  Value: text-lg font-bold text-red-400, content "NG"
```

**Counter Card (Active Triggers, Today Cost)**:
```
Container: bg-slate-800/50 border border-slate-700 rounded-xl p-3
Icon: text-lg (🎯 or 💵)
Label: text-xs text-slate-400 font-medium
Value: text-lg font-bold text-slate-50
  Active: show count (e.g., "3")
  Cost: show USD formatted (e.g., "$2.40")
```

**Last Check Timestamp**:
```
Container: flex justify-end mt-1
Text: text-[10px] text-slate-500 font-mono
Content: "마지막 확인: {HH:mm:ss}"
```

#### 3. Trigger Cards

**Card Container (per trigger)**:
```
Default active:
  bg-slate-800/50 border border-slate-700 rounded-xl p-4 cursor-pointer
  hover:border-slate-600 hover:bg-slate-800/70 transition-all

Selected:
  bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20

Highlighted (just fired, 3s):
  border-cyan-400/50 ring-2 ring-cyan-400/30 bg-cyan-400/5

Inactive:
  opacity-50

Loading skeleton:
  bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 animate-pulse h-28
```

**Card Inner Layout**:
```
Row 1 (flex items-center justify-between):
  Left (flex items-center gap-2):
    StatusDot:
      Active: w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]
      Inactive: w-2.5 h-2.5 rounded-full bg-slate-500
    Name: text-sm font-semibold text-slate-50 truncate max-w-[200px]
    TypeBadge: text-[10px] font-medium px-2 py-0.5 rounded-full
      price/price-above/price-below: bg-amber-500/15 text-amber-400
      news: bg-blue-500/15 text-blue-400
      schedule: bg-purple-500/15 text-purple-400
      market-open/market-close: bg-emerald-500/15 text-emerald-400
      custom: bg-slate-500/15 text-slate-400
  Right (flex items-center gap-1):
    Agent: text-xs text-slate-400, show agent name
    Secretary badge (if applicable): text-[10px] text-cyan-400 ml-1 "(비서)"

Row 2 (mt-2):
  Condition: text-xs text-slate-300
    Korean formatted (e.g., "삼성전자 70,000 이상", "키워드: AI, 반도체 (하나 이상)")

Row 3 (mt-1):
  Instruction: text-xs text-slate-500 truncate max-w-full

Row 4 (flex items-center justify-between mt-3):
  Left (flex items-center gap-3):
    Cooldown: text-[10px] text-slate-500 font-mono, "쿨다운 {N}분"
    LastTriggered: text-[10px] text-slate-500, "마지막: {relativeTime}"
    EventCount: text-[10px] text-slate-500, "이벤트 {N}건"
  Right (flex items-center gap-1):
    EditBtn: text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-700/50 transition-colors, "편집"
    ToggleBtn: text-xs px-2 py-1 rounded transition-colors
      Active: text-amber-400 hover:bg-amber-500/10, "중지"
      Inactive: text-emerald-400 hover:bg-emerald-500/10, "시작"
    DeleteBtn: text-xs text-red-400 hover:bg-red-500/10 px-2 py-1 rounded transition-colors, "삭제"
```

**Empty State (no triggers)**:
```
Container: bg-slate-800/30 border border-dashed border-slate-700 rounded-xl p-12 text-center
Icon: text-4xl mb-3, "🔭"
Title: text-sm font-medium text-slate-300, "설정된 감시 트리거가 없습니다"
Subtitle: text-xs text-slate-500 mt-1, "트리거를 추가하면 조건 충족 시 자동으로 에이전트가 작업합니다"
Button: bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-4 py-2 mt-4 transition-colors, "트리거 추가"
```

#### 4. Event Log Section

**Section Header**:
```
Container: flex items-center justify-between
Left (flex items-center gap-2):
  Title: text-sm font-semibold text-slate-50, "이벤트 로그"
  SelectedTrigger (if any): text-xs text-blue-400, "— {triggerName}"
  Count: text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded, "{N}건"
Right (flex items-center gap-2):
  Tab group:
    Container: flex bg-slate-800 rounded-lg p-0.5
    Tab: text-xs px-3 py-1.5 rounded-md transition-colors
      Active: bg-slate-700 text-slate-50
      Inactive: text-slate-400 hover:text-slate-300
    Tabs: "전체", "오류"
  Status filter (only in 전체 tab):
    select: bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5
    Options: "전체 상태", "감지됨", "실행중", "완료", "실패"
```

**Event Row**:
```
Container: bg-slate-800/30 border-b border-slate-700/50 px-3 py-2.5 cursor-pointer
  hover:bg-slate-800/50 transition-colors

Layout (flex items-center justify-between):
  Left (flex items-center gap-2):
    StatusBadge: text-[10px] font-medium px-2 py-0.5 rounded-full
      detected: bg-slate-500/15 text-slate-400, "감지됨"
      executing: bg-blue-500/15 text-blue-400 animate-pulse, "실행중"
      completed: bg-emerald-500/15 text-emerald-400, "완료"
      failed: bg-red-500/15 text-red-400, "실패"
    EventType: text-xs text-slate-300
    Timestamp: text-[10px] text-slate-500 font-mono
  Right (flex items-center gap-2):
    Duration: text-[10px] text-slate-500 font-mono (e.g., "2.3초")
    ExpandIcon: text-slate-500 text-xs, "▼" or "▲"
```

**Expanded Event Detail**:
```
Container: bg-slate-800/60 border-b border-slate-700/50 px-4 py-3 space-y-2

Section (each):
  Label: text-[10px] text-slate-500 font-medium uppercase tracking-wider
  Value: text-xs text-slate-300 font-mono bg-slate-900/50 rounded p-2 mt-0.5 break-all

Sections:
  - "이벤트 데이터": JSON.stringify(eventData, null, 2) — show raw condition match
  - "실행 결과" (if completed): result text
  - "오류 메시지" (if failed): text-red-400
  - "처리 시각": processedAt formatted
  - "연결 명령": commandId (monospace)
```

**Pagination**:
```
Container: flex items-center justify-center gap-3 mt-3
Button: text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1
PageInfo: text-xs text-slate-500, "{page} / {totalPages}"
```

**Empty states**:
```
No trigger selected:
  text-xs text-slate-500 text-center py-8, "위의 트리거 카드를 클릭하면 이벤트 기록이 표시됩니다"

No events:
  text-xs text-slate-500 text-center py-8, "이벤트 기록이 없습니다"
```

#### 5. Trigger Create/Edit Modal

**Overlay**: `fixed inset-0 z-50 flex items-center justify-center`
**Backdrop**: `absolute inset-0 bg-black/60 backdrop-blur-sm`
**Modal**: `relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto shadow-2xl`

**Modal Header**:
```
Container: flex items-center justify-between px-5 py-4 border-b border-slate-700
Title: text-lg font-semibold text-slate-50
  Create: "ARGOS 트리거 추가"
  Edit: "트리거 수정"
CloseBtn: text-slate-400 hover:text-slate-200 transition-colors, "✕"
```

**Modal Body**: `px-5 py-4 space-y-4`

**Form Fields** (each):
```
Label: text-xs font-medium text-slate-300 mb-1.5 block
Input: w-full bg-slate-900/50 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm text-slate-50 rounded-lg px-3 py-2 outline-none transition-colors placeholder:text-slate-600
Select: same as input + appearance-none + custom arrow
Textarea: same as input + resize-none rows-3
```

**Trigger Type Selector**:
```
Container: grid grid-cols-4 gap-2
TypeButton: text-[11px] font-medium px-2 py-2 rounded-lg border transition-all text-center
  Selected: bg-blue-500/15 border-blue-500/40 text-blue-400
  Unselected: bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600
Types: 가격 감시, 가격 상한, 가격 하한, 뉴스 감시, 정기 수집, 장 시작, 장 마감, 커스텀
```

**Dynamic Condition Fields** (by type):
```
Price types:
  - Ticker: text input, placeholder "종목코드 (예: 삼성전자)"
  - Market: select [KR, US]
  - Operator: select [이상, 이하, % 변동(상승), % 변동(하락)]
  - Value: number input

News:
  - Keywords: text input, placeholder "키워드1, 키워드2, ..."
  - MatchMode: radio group
    Container: flex gap-3
    Radio: flex items-center gap-1.5 text-xs text-slate-300
    Options: "하나 이상 매치", "모두 포함"

Schedule:
  - Interval: number input (분), min=1
  - Active hours (optional): two time inputs (start, end)
  - Active days (optional): 7-button grid (월~일)
    Button: w-8 h-8 text-xs rounded-lg border transition-all
      Selected: bg-blue-500/20 border-blue-500/40 text-blue-400
      Unselected: border-slate-700 text-slate-500

Market open/close:
  - Market: select [KR, US]

Custom:
  - Field: text input
  - Operator: select [이상, 이하, 같음, 포함, 제외]
  - Value: text input
  - DataSource (optional): text input
```

**Agent Selector**:
```
Select dropdown showing: "{agentName} ({role})"
Secretary agents show: "{agentName} (비서실장) · {role}"
```

**Cooldown Input**:
```
Container: flex items-center gap-2
Input: number, min=1 max=1440, default=30, w-20
Suffix: text-xs text-slate-400, "분"
Help: text-[10px] text-slate-500 mt-1, "트리거 발동 후 재발동까지 대기 시간"
```

**Modal Footer**:
```
Container: flex justify-end gap-2 px-5 py-4 border-t border-slate-700
CancelBtn: text-sm text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-700/50 transition-colors, "취소"
SubmitBtn: bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors
  Create: "등록"
  Edit: "수정"
```

#### 6. Delete Confirmation Dialog

```
Overlay: fixed inset-0 z-50 flex items-center justify-center
Backdrop: absolute inset-0 bg-black/60
Dialog: bg-slate-800 border border-slate-700 rounded-xl p-5 max-w-sm mx-4 shadow-2xl
Title: text-sm font-semibold text-slate-50, "트리거 삭제"
Message: text-xs text-slate-400 mt-2, "이 트리거와 관련된 이벤트 기록이 모두 삭제됩니다. 계속하시겠습니까?"
Actions (flex justify-end gap-2 mt-4):
  CancelBtn: text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg, "취소"
  DeleteBtn: bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg, "삭제"
```

---

### Real-Time Behavior

**WebSocket Channel**: `argos` with key `argos::{companyId}`

**Events**:
- `argos-trigger-fired`: Highlight trigger card with `ring-2 ring-cyan-400/30` for 3 seconds, show toast "🎯 {triggerName} 트리거 발동", invalidate events + status
- `argos-execution-completed`: Show toast "✅ {triggerName} 완료 ({duration}초)", invalidate all queries
- `argos-execution-failed`: Show toast "❌ {triggerName} 실패", invalidate all queries

**Polling**: Status bar refetch every 30 seconds

---

### State Management

**React Query Keys**:
- `['agents']` — Agent list for dropdown
- `['argos-status']` — Status bar (30s refetch)
- `['argos-triggers']` — Trigger list (manual invalidation)
- `['argos-events', triggerId, statusFilter, page]` — Event pagination

**Local State**:
- `showModal: boolean` — Modal visibility
- `editingTrigger: ArgosTrigger | null` — null = create mode
- `deleteTarget: string | null` — Trigger ID for delete confirm
- `selectedTriggerId: string | null` — Selected for event view
- `eventTab: 'all' | 'error'`
- `eventStatusFilter: string`
- `eventPage: number`
- `expandedEventId: string | null`
- `highlightedTrigger: string | null` — Auto-clears after 3s

---

### Toast Notifications

```
Success: bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
Error: bg-red-500/10 border border-red-500/20 text-red-400
Info: bg-blue-500/10 border border-blue-500/20 text-blue-400
Position: top-right, auto-dismiss 4s
```

---

### What NOT to Include

- No stock charts or portfolio management (that's Strategy Room)
- No cron scheduling (that's Cron page)
- No agent configuration (that's Admin)
- No manual command execution (that's Command Center)
- No notification preferences (that's Settings)
