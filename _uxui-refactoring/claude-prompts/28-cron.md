# 28. Cron (크론기지) — Claude Design Spec

## 복사할 프롬프트:

### What This Page Is For

The Cron page is the CEO's **scheduled task manager** — recurring AI agent jobs that run automatically at set times. The CEO defines what task an agent should perform, picks a schedule (preset or custom cron expression), and the system executes it automatically with full history tracking.

Think of it as: **A smart alarm clock for AI agents** — "Every weekday at 9 AM, have this agent do this task."

Unlike ARGOS (event-driven triggers), Cron is purely **time-driven** — tasks fire on a fixed schedule regardless of external conditions.

---

### Design System Tokens

```
Page bg: bg-slate-900
Card bg: bg-slate-800/50 border border-slate-700 rounded-xl
Text primary: text-slate-50
Text secondary: text-slate-400
Border: border-slate-700
Action: blue-500/blue-600
Success: emerald-500
Warning: amber-500
Destructive: red-500
Running: blue-500 (pulse)
```

---

### Layout Structure

```
┌──────────────────────────────────────────────────────┐
│ Header: "크론기지" ⏰ + [+ 크론 추가]                  │
├──────────────────────────────────────────────────────┤
│                                                        │
│ Schedule Cards (vertical list, space-y-3)              │
│                                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ ● 일일 시장 브리핑         Agent: 비서실장        │ │
│ │ 주요 시장 동향을 분석하고 보고서를 작성하세요      │ │
│ │ 매일 09:00 · 다음: 내일 09:00 · 마지막: 오늘 09:00│ │
│ │                         [편집] [중지] [삭제]  ▼  │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ Run History (expanded)                            │ │
│ │ ┌────────────────────────────────────────────┐   │ │
│ │ │ ✅ 성공 · 09:00 · 12.3초 · 450토큰 · $0.01│   │ │
│ │ │ ✅ 성공 · 어제 09:00 · 8.1초 · 320토큰    │   │ │
│ │ │ ❌ 실패 · 2일 전 · 에러: timeout            │   │ │
│ │ └────────────────────────────────────────────┘   │ │
│ │ [← 이전] 1/3 [다음 →]                            │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ (more schedule cards...)                          │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
└──────────────────────────────────────────────────────┘
```

**Container**: `min-h-screen bg-slate-900 text-slate-50`
**Inner**: `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6`

---

### Component Specifications

#### 1. Page Header

```
Container: flex items-center justify-between mb-2
Left:
  Title: text-2xl font-bold text-slate-50, "크론기지"
  Icon: ml-2, "⏰"
Right:
  Button: bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors
    Content: "+ 크론 추가"
```

#### 2. Schedule Card (per schedule)

```
Container: bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden transition-all

CardBody (px-4 py-4):

Row 1 (flex items-center justify-between):
  Left (flex items-center gap-2):
    StatusDot:
      Active: w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]
      Inactive: w-2.5 h-2.5 rounded-full bg-slate-500
    Name: text-sm font-semibold text-slate-50 truncate max-w-[250px]
  Right (flex items-center gap-2):
    Agent: text-xs text-slate-400, "Agent: {agentName}"
    Secretary badge (if applicable): text-[10px] text-cyan-400, "(비서)"

Row 2 (mt-2):
  Instruction: text-xs text-slate-400 line-clamp-2

Row 3 (flex items-center justify-between mt-3):
  Left (flex items-center gap-3):
    CronDesc: text-xs font-medium text-cyan-400
      Content: describeCronExpression result (e.g., "매일 09:00", "평일 09:00", "5분마다")
    NextRun: text-[10px] text-slate-500
      Content: "다음: {formatRelativeTime(nextRunAt)}"
      Null/inactive: "다음: —"
    LastRun: text-[10px] text-slate-500
      Content: "마지막: {formatShortDate(lastRunAt)}"
      Never: "마지막: —"

  Right (flex items-center gap-1):
    EditBtn: text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-700/50 transition-colors, "편집"
    ToggleBtn: text-xs px-2 py-1 rounded transition-colors
      Active: text-amber-400 hover:bg-amber-500/10, "중지"
      Inactive: text-emerald-400 hover:bg-emerald-500/10, "시작"
    DeleteBtn: text-xs text-red-400 hover:bg-red-500/10 px-2 py-1 rounded transition-colors, "삭제"
    ExpandBtn: text-xs text-slate-500 hover:text-slate-300 px-2 py-1, "▼" (collapsed) / "▲" (expanded)
```

**Inactive card**: `opacity-50`

#### 3. Run History (Expanded Section)

```
Container: border-t border-slate-700 bg-slate-900/30

RunRow (each):
  Container: px-4 py-2.5 border-b border-slate-700/30 flex items-center justify-between

  Left (flex items-center gap-2):
    StatusBadge: text-[10px] font-medium px-2 py-0.5 rounded-full
      running: bg-blue-500/15 text-blue-400 animate-pulse, "실행중"
      success: bg-emerald-500/15 text-emerald-400, "성공"
      failed: bg-red-500/15 text-red-400, "실패"

    StartTime: text-[10px] text-slate-400 font-mono
      Content: formatShortDate(startedAt)

  Right (flex items-center gap-3):
    Duration: text-[10px] text-slate-500 font-mono
      Content: "{durationMs/1000}초" or "—" if running
    Tokens: text-[10px] text-slate-500 font-mono
      Content: "{tokensUsed}토큰" (hidden if null)
    Cost: text-[10px] text-slate-500 font-mono
      Content: "${(costMicro/1000000).toFixed(3)}" (hidden if null)

  ErrorRow (if failed, mt-1):
    text-[10px] text-red-400 truncate max-w-full
    Content: error message (first 60 chars)

  ResultPreview (if success, mt-1):
    text-[10px] text-slate-500 truncate max-w-full
    Content: result text (first 60 chars)

  RunningProgress (if running):
    Container: w-full h-1 bg-slate-700 rounded-full mt-2
    Fill: h-full bg-blue-500 rounded-full animate-pulse w-1/3

Pagination:
  Container: px-4 py-2 flex items-center justify-center gap-3
  PrevBtn: text-[10px] text-slate-400 hover:text-slate-200 disabled:opacity-30, "← 이전"
  PageInfo: text-[10px] text-slate-500, "{page} / {totalPages}"
  NextBtn: text-[10px] text-slate-400 hover:text-slate-200 disabled:opacity-30, "다음 →"

Empty (no runs):
  text-xs text-slate-500 text-center py-6, "실행 기록이 없습니다"
```

#### 4. Schedule Create/Edit Modal

**Overlay**: `fixed inset-0 z-50 flex items-center justify-center`
**Backdrop**: `absolute inset-0 bg-black/60 backdrop-blur-sm`
**Modal**: `relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto shadow-2xl`

**Modal Header**:
```
Container: flex items-center justify-between px-5 py-4 border-b border-slate-700
Title: text-lg font-semibold text-slate-50
  Create: "크론 추가"
  Edit: "크론 수정"
CloseBtn: text-slate-400 hover:text-slate-200, "✕"
```

**Modal Body**: `px-5 py-4 space-y-4`

**Form Fields**:
```
Each field:
  Label: text-xs font-medium text-slate-300 mb-1.5 block
  Input: w-full bg-slate-900/50 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm text-slate-50 rounded-lg px-3 py-2 outline-none transition-colors placeholder:text-slate-600
  Select: same + appearance-none
  Textarea: same + resize-none rows-3

Fields:
  1. "스케줄 이름": text input, placeholder "예: 일일 시장 브리핑"
  2. "에이전트": select dropdown, show "{name} ({role})", secretary agents show "(비서실장)"
  3. "작업 지시": textarea, placeholder "에이전트에게 시킬 작업을 입력하세요"
  4. "실행 주기": Frequency Selector (see below)
```

**Frequency Selector**:
```
TabGroup:
  Container: flex bg-slate-900/50 rounded-lg p-0.5 mb-3
  Tab: text-xs px-3 py-1.5 rounded-md transition-colors flex-1 text-center
    Active: bg-slate-700 text-slate-50
    Inactive: text-slate-400 hover:text-slate-300
  Tabs: "프리셋", "커스텀", "시간 지정"

Preset Mode:
  Container: grid grid-cols-3 gap-2
  PresetButton: text-xs px-3 py-2.5 rounded-lg border text-center transition-all
    Selected: bg-blue-500/15 border-blue-500/40 text-blue-400
    Unselected: bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600
  Presets:
    ☀️ "매일 오전 9시" (0 9 * * *)
    🌆 "매일 오후 6시" (0 18 * * *)
    🌙 "매일 밤 10시" (0 22 * * *)
    💼 "평일 오전 9시" (0 9 * * 1-5)
    ⏰ "매시 정각" (0 * * * *)
    📅 "주 1회 (월 09:00)" (0 9 * * 1)

Custom Mode:
  Input: text input for cron expression
    Placeholder: "분 시 일 월 요일 (예: 0 9 * * 1-5)"
  Validation preview (mt-2):
    Valid: bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2
      text-xs text-emerald-400, "✓ {description}"
      text-[10px] text-slate-500, "다음 실행: {nextRunFormatted}"
    Invalid: bg-red-500/10 border border-red-500/20 rounded-lg p-2
      text-xs text-red-400, "✗ {errorMessage}"

Legacy (Time) Mode:
  FrequencySelect: "매일" / "평일" / "커스텀"
  TimeInput: type="time"
  DayPicker (if custom frequency):
    Container: flex gap-2
    DayButton: w-8 h-8 text-xs rounded-lg border transition-all
      Selected: bg-blue-500/20 border-blue-500/40 text-blue-400
      Unselected: border-slate-700 text-slate-500
    Days: 월, 화, 수, 목, 금, 토, 일
```

**Description Preview** (shown when valid expression):
```
Container: bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 mt-2
Text: text-xs text-amber-400
  Content: "📋 {describeCronExpression result}"
```

**Modal Footer**:
```
Container: flex justify-end gap-2 px-5 py-4 border-t border-slate-700
CancelBtn: text-sm text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-700/50 transition-colors, "취소"
SubmitBtn: bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors
  Create: "등록"
  Edit: "수정"
```

#### 5. Delete Confirmation

```
Same pattern as ARGOS delete dialog:
Title: "크론 삭제"
Message: "이 스케줄과 실행 기록이 모두 삭제됩니다. 계속하시겠습니까?"
Actions: "취소" + "삭제" (red)
```

---

### Loading & Empty States

**Loading**:
```
Container: space-y-3
Skeleton: bg-slate-800/30 border border-slate-700/50 rounded-xl animate-pulse h-28
Repeat 3 times
```

**Empty (no schedules)**:
```
Container: bg-slate-800/30 border border-dashed border-slate-700 rounded-xl p-12 text-center
Icon: text-4xl mb-3, "⏰"
Title: text-sm font-medium text-slate-300, "설정된 크론 작업이 없습니다"
Subtitle: text-xs text-slate-500 mt-1, "정기적으로 에이전트가 수행할 작업을 추가해보세요"
Button: bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-4 py-2 mt-4, "크론 추가"
```

---

### Real-Time Behavior

**WebSocket Channel**: `night-job::{companyId}`

**Events**:
- `cron-run-started`: Show toast "🔄 {scheduleName} 실행 시작", update running indicator
- `cron-run-completed`: Show toast "✅ {scheduleName} 완료 ({duration}초)", invalidate schedule list
- `cron-run-failed`: Show toast "❌ {scheduleName} 실패", invalidate schedule list + show error details

**Polling**: Schedule list refetch every 30 seconds (to update nextRunAt countdown)

---

### State Management

**React Query Keys**:
- `['agents']` — Agent list
- `['night-schedules']` — Schedule list (30s refetch)
- `['cron-runs', scheduleId, page]` — Run history pagination

**Local State**:
- `showModal: boolean`
- `editingSchedule: Schedule | null`
- `deleteTarget: string | null`
- `expandedScheduleId: string | null`
- `frequencyMode: 'preset' | 'custom' | 'legacy'`
- `selectedPreset: string | null`
- `cronExpression: string`

---

### What NOT to Include

- No ARGOS event-driven triggers (that's ARGOS page)
- No manual command execution (that's Command Center)
- No agent management (that's Admin)
- No one-time scheduled tasks (this is for recurring only)
- No workflow automation (that's Workflows page)
