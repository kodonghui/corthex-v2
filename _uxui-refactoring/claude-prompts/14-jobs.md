# 14. 야간 작업 (Jobs) — Design Spec for Claude Coding

> Route: `/jobs` — CEO App
> File: `packages/app/src/pages/jobs.tsx` (single file, ~940 lines)

---

## Page Overview

AI 에이전트에게 지시하는 비동기 작업(야간 작업)을 관리하는 페이지. 3개 탭으로 구분:
1. **일회성 작업** — 단건 작업 + 체인 작업(2~5단계 순차 실행), 실시간 진행률 표시
2. **반복 스케줄** — cron 기반 반복 실행, 활성/비활성 토글
3. **이벤트 트리거** — 가격 변동, 시장 개장/폐장 등 조건 기반 자동 실행

"시켜놓고 퇴근 — AI가 밤새 처리합니다" 컨셉. WebSocket으로 실시간 진행률 수신.

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

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: px-6 py-6                                               │
│ ┌──────────────────────────────────┬───────────────────────────┐│
│ │ "야간 작업" text-2xl font-bold   │      [+ 작업 등록]        ││
│ │ "시켜놓고 퇴근 — AI가 밤새..."   │                           ││
│ │ text-sm text-slate-400 mt-1      │                           ││
│ └──────────────────────────────────┴───────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│ TABS: px-6 border-b border-slate-700                            │
│ [일회성 (12)] [반복 스케줄 (3)] [트리거 (2)]                    │
├─────────────────────────────────────────────────────────────────┤
│ CONTENT: px-6 py-4 max-w-2xl space-y-3                         │
│ (Tab content renders here)                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Header

```
px-6 py-6 flex items-center justify-between

Left:
  "야간 작업" text-2xl font-bold text-slate-50
  "시켜놓고 퇴근 — AI가 밤새 처리합니다" text-sm text-slate-400 mt-1

Right:
  bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium
  "+ 작업 등록"
  (opens modal with type based on active tab)
```

### Tab Bar

```
flex gap-1 px-6 border-b border-slate-700

Each tab:
  px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
  Active: border-blue-500 text-blue-400
  Inactive: border-transparent text-slate-400 hover:text-slate-200

Count badge:
  ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full
  bg-slate-700 text-slate-400
```

---

## Tab 1: 일회성 (One-Time Jobs)

### Chain Group

```
border border-blue-500/30 rounded-xl p-3 space-y-2 mb-3

Header: flex items-center justify-between mb-1
  "체인 (2/3 완료)" text-xs font-medium text-blue-400
  Cancel button (if has active): text-xs text-red-400 hover:text-red-300 "체인 취소"

Jobs inside chain:
  First job: no indent
  Subsequent: ml-6 border-l-2 border-slate-700 pl-3
```

### Job Card

```
bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden
transition-all

Processing state: border-blue-500 border-l-4
Unread completed/failed: border-blue-500/50
Normal: border-slate-700

┌─────────────────────────────────────────────────────────────────┐
│ SUMMARY ROW (clickable, toggles expand): px-4 py-3             │
│ hover:bg-slate-800 cursor-pointer                               │
│                                                                 │
│ ┌──────────────────────────────────────────────┬──────────────┐ │
│ │ [대기] badge   에이전트이름  ●(unread dot)   │ [취소] [▼]   │ │
│ │ text-xs                                      │              │ │
│ │                                              │              │ │
│ │ 작업 지시 내용 — truncate                    │              │ │
│ │ text-sm font-medium text-slate-100           │              │ │
│ │                                              │              │ │
│ │ 3/9 오후 10:00 — 처리중...                   │              │ │
│ │ text-[10px] text-slate-500                   │              │ │
│ └──────────────────────────────────────────────┴──────────────┘ │
│                                                                 │
│ PROGRESS BAR (processing only): px-4 pb-2                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ProgressBar value={60}                                      │ │
│ │ bg-slate-700 rounded-full h-1.5                             │ │
│ │ Fill: bg-blue-500 rounded-full h-1.5                        │ │
│ │                                                             │ │
│ │ "분석 데이터 수집 중..." text-[10px] text-slate-500         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ (or pulse animation if no progress data)                        │
│ bg-blue-500/20 h-1 rounded-full, inner bg-blue-500 w-1/3       │
│ animate-pulse                                                   │
│                                                                 │
│ EXPANDED SECTION: px-4 py-3 border-t border-slate-800          │
│ bg-slate-900/50                                                 │
│                                                                 │
│ Result (completed):                                             │
│   "결과" text-[10px] font-medium text-emerald-400 mb-1         │
│   bg-slate-800 rounded-lg p-3 max-h-60 overflow-y-auto         │
│   text-xs text-slate-300 whitespace-pre-wrap                    │
│                                                                 │
│ Links (if resultData):                                          │
│   [결과 보기] [보고서 보기]                                      │
│   text-xs text-blue-400 hover:text-blue-300 font-medium         │
│                                                                 │
│ Error (failed):                                                 │
│   "오류" text-[10px] font-medium text-red-400 mb-1              │
│   bg-red-500/10 rounded-lg p-3                                  │
│   text-xs text-red-400                                          │
│                                                                 │
│ Retry count:                                                    │
│   "재시도: 1/3" text-[10px] text-slate-500                      │
└─────────────────────────────────────────────────────────────────┘
```

**Status Badges:**
| Status | Style |
|--------|-------|
| queued (대기) | bg-blue-500/20 text-blue-400 |
| processing (처리중) | bg-amber-500/20 text-amber-400 |
| completed (완료) | bg-emerald-500/20 text-emerald-400 |
| failed (실패) | bg-red-500/20 text-red-400 |
| blocked (대기-체인) | bg-slate-700 text-slate-400 |

**Unread Dot:** `w-2 h-2 rounded-full bg-blue-500`

**Expand Arrow:** `text-slate-500 text-xs` "▲" / "▼"

### Empty State

```
text-center py-16
"🌙" text-4xl mb-3
"등록된 일회성 작업이 없습니다" text-sm text-slate-400
```

---

## Tab 2: 반복 스케줄 (Schedules)

### Schedule Card

```
bg-slate-800/50 border border-slate-700 rounded-xl p-4

┌─────────────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────┬───────────────────┐  │
│ │ ● 매일 22:00  에이전트이름             │ [편집] [중지] [삭제]│ │
│ │ StatusDot      text-sm text-slate-400   │ text-xs buttons    │ │
│ │                                        │                    │ │
│ │ 지시 내용 — truncate                   │                    │ │
│ │ text-sm font-medium text-slate-100     │                    │ │
│ │                                        │                    │ │
│ │ 다음: 3/10 22:00                       │                    │ │
│ │ text-[10px] font-mono text-slate-500   │                    │ │
│ └────────────────────────────────────────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

StatusDot:
  Active (isActive): bg-emerald-400 w-2 h-2 rounded-full
  Inactive: bg-slate-600 w-2 h-2 rounded-full

Buttons:
  편집: text-xs text-slate-400 hover:text-slate-200
  중지/시작: text-xs
    Active → 중지: text-amber-400 hover:text-amber-300
    Inactive → 시작: text-emerald-400 hover:text-emerald-300
  삭제: text-xs text-red-400 hover:text-red-300
```

---

## Tab 3: 트리거 (Triggers)

### Trigger Card

```
bg-slate-800/50 border border-slate-700 rounded-xl p-4

Same layout as Schedule card, with:

Trigger type labels:
  price-above: "가격 상회"
  price-below: "가격 하회"
  market-open: "장 시작"
  market-close: "장 마감"

Condition display (price triggers):
  "종목코드 ≥/≤ 72,000원" text-sm text-slate-400

Extra info:
  "● 감시 중" text-[10px] text-emerald-400 (if active)
  "마지막 발동: 3/8 22:00" text-[10px] font-mono text-slate-500
```

---

## Create/Edit Modal

```
Fixed inset-0 z-50 bg-black/50

Modal: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl
max-w-lg w-full mx-4 p-6 space-y-4

Title: text-lg font-bold text-slate-50
  New: "작업 등록"
  Edit schedule: "스케줄 수정"
  Edit trigger: "트리거 수정"
```

### Type Selector (new only)

```
flex gap-3 flex-wrap

Each radio:
  flex items-center gap-2 cursor-pointer
  <input type="radio"> accent-blue-500
  <span> text-sm text-slate-300

Options: 일회성, 반복 스케줄, 이벤트 트리거
```

### Common Fields

```
Agent select:
  label: "담당 에이전트" text-xs font-medium text-slate-500 mb-1
  Select component: bg-slate-800 border border-slate-600 rounded-lg

Instruction textarea:
  label: "작업 지시" text-xs font-medium text-slate-500 mb-1
  bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg
  rows=3
  placeholder="예: 이번 달 마케팅 채널별 성과를 분석해서 보고서로 정리해줘"
```

### One-Time Fields

```
Scheduled time (optional):
  label: "실행 시간 (비워두면 즉시)" text-xs text-slate-500
  <input type="datetime-local">
  bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm

Chain steps (expandable):
  Button: "+ 체인 단계 추가 (순차 실행)" text-xs text-blue-400 hover:text-blue-300

  Each step:
    pl-4 border-l-2 border-blue-500/50 space-y-2
    "단계 N" text-[10px] text-slate-500 + [삭제] text-red-400
    Agent select + Instruction textarea (rows=2)

  Max 4 chain steps (total 5 including first)
```

### Schedule Fields

```
Time input:
  label: "실행 시간"
  <input type="time"> bg-slate-800 border border-slate-600 rounded-lg

Frequency radios:
  label: "주기" text-xs font-medium text-slate-500
  Options: 매일, 평일, 특정 요일
  Radio style: accent-blue-500

Custom days (when "특정 요일"):
  flex gap-2
  Each day button:
    w-9 h-9 rounded-full text-xs font-medium transition-colors
    Selected: bg-blue-600 text-white
    Unselected: bg-slate-700 text-slate-400 hover:bg-slate-600
  Labels: 일, 월, 화, 수, 목, 금, 토

  Validation: text-xs text-red-400 mt-1
  "실행할 요일을 1개 이상 선택하세요"
```

### Trigger Fields

```
Trigger type select:
  label: "트리거 유형"
  <select> bg-slate-800 border border-slate-600 rounded-lg text-sm
  Options:
    가격 상회 (현재가 ≥ 목표가)
    가격 하회 (현재가 ≤ 목표가)
    장 시작 (09:00)
    장 마감 (15:30)

Price condition fields (price-above/price-below):
  grid grid-cols-2 gap-3
  종목 코드: placeholder="005930"
  목표가 (원): type=number, placeholder="72000"
  bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm
```

### Modal Buttons

```
flex gap-3 pt-2

Cancel:
  flex-1 py-2.5 text-sm font-medium text-slate-400
  border border-slate-600 rounded-lg hover:bg-slate-700
  "취소"

Submit:
  flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium
  disabled:opacity-50
  Label: "등록" (new) / "수정" (edit) / "처리 중..." (pending)
```

---

## Delete Confirm Dialog

```
ConfirmDialog component:
  Chain: title "체인 취소", desc "이 체인의 대기 중인 작업을 모두 취소하시겠습니까?"
  Job: title "작업 취소"
  Schedule: title "스케줄 삭제"
  Trigger: title "트리거 삭제"
```

---

## Backend API Routes

```
# One-time jobs
GET    /workspace/jobs                   → 작업 목록 (최신 50건)
POST   /workspace/jobs                   → 작업 등록
DELETE /workspace/jobs/:id               → 작업 취소
PUT    /workspace/jobs/:id/read          → 읽음 처리

# Chain jobs
POST   /workspace/jobs/chain             → 체인 등록 (steps 배열)
DELETE /workspace/jobs/chain/:chainId    → 체인 전체 취소

# Schedules
GET    /workspace/jobs/schedules          → 스케줄 목록
POST   /workspace/jobs/schedules          → 스케줄 생성
PATCH  /workspace/jobs/schedules/:id      → 스케줄 수정
PATCH  /workspace/jobs/schedules/:id/toggle → 활성/비활성 토글
DELETE /workspace/jobs/schedules/:id      → 스케줄 삭제

# Triggers
GET    /workspace/jobs/triggers           → 트리거 목록
POST   /workspace/jobs/triggers           → 트리거 생성
PATCH  /workspace/jobs/triggers/:id       → 트리거 수정
PATCH  /workspace/jobs/triggers/:id/toggle → 활성/비활성 토글
DELETE /workspace/jobs/triggers/:id       → 트리거 삭제
```

---

## WebSocket Events

```
Channel: night-job
Events:
  job-progress: { jobId, progress (0-100), statusMessage }
  job-completed: { jobId }
  job-failed: { jobId }
  job-retrying: { jobId }
  job-queued: { jobId }
  chain-failed: { chainId }
```

---

## Current Code Issues to Fix

1. **Massive monolith** (940 lines) — needs component extraction
2. **Light mode classes** — `bg-white`, `dark:bg-zinc-900`, `text-zinc-600` etc.
3. **Custom EmptyState** shadows shared component — local `EmptyState` defined inline
4. **Modal uses raw div** — should use shared Modal component
5. **Complex form state** — 15+ useState hooks for modal, could use useReducer or form state object
6. **No skeleton loading** — jobs list shows no loading indicator
7. **Day selector** — circular buttons work but need dark theme update

## Component Structure (target)

```
pages/jobs.tsx                    → Main page with tabs
components/jobs/
  job-card.tsx                    → Expandable job card with progress
  chain-group.tsx                 → Chain job grouping
  schedule-card.tsx               → Schedule item with toggle
  trigger-card.tsx                → Trigger item with condition display
  job-create-modal.tsx            → Create/edit modal with type tabs
  chain-step-editor.tsx           → Chain step add/remove UI
```
