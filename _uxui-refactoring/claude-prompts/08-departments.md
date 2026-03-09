# 08. Departments (부서 관리) — Design Spec (Claude Coding Prompt)

## Page Overview
**Route**: `/departments` (Admin App — `packages/admin/src/pages/departments.tsx`)
**Purpose**: Create, edit, and delete departments with cascade impact analysis wizard.
**Source**: 471 lines single-file component

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER                                                               │
│ ┌──────────────────────────────────┐  ┌────────────────────────────┐ │
│ │ h1: 부서 관리                    │  │ [+ 새 부서 만들기]        │ │
│ │ p: 5개 부서                      │  │                            │ │
│ └──────────────────────────────────┘  └────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ CREATE FORM (conditional, collapsible card)                          │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ h3: 새 부서                                                      │ │
│ │ ┌──────────────┬──────────────┐                                  │ │
│ │ │ 부서명 *     │ 설명         │                                  │ │
│ │ └──────────────┴──────────────┘                                  │ │
│ │                          [취소] [생성]                            │ │
│ └──────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ DEPARTMENT TABLE (card with rounded-xl border)                       │
│ ┌──────────┬──────────┬────────┬──────┬──────┐                      │
│ │ 부서명   │ 설명     │에이전트│ 상태 │ 작업 │                      │
│ ├──────────┼──────────┼────────┼──────┼──────┤                      │
│ │ 마케팅부 │ SNS...   │  3     │ 활성 │수정 ×│                      │
│ │ [편집중] │ [편집중] │        │      │저장 ×│  ← inline edit mode  │
│ │ 투자전략 │ -        │  2     │ 활성 │수정 ×│                      │
│ └──────────┴──────────┴────────┴──────┴──────┘                      │
└──────────────────────────────────────────────────────────────────────┘

┌──── CASCADE DELETION WIZARD (center modal, max-w-lg) ───────────────┐
│ HEADER — "부서 삭제 - {부서명}" + [X] close                         │
│ ─────────────────────────────────────────                            │
│ IMPACT SUMMARY (2x2 grid)                                           │
│ ┌────────────┬────────────┐                                         │
│ │ 소속 에이전트│ 진행 중 작업│                                         │
│ │    3명      │    2건      │                                         │
│ ├────────────┼────────────┤                                         │
│ │ 학습 기록   │ 누적 비용   │                                         │
│ │   15건      │  $12.50     │                                         │
│ └────────────┴────────────┘                                         │
│                                                                      │
│ AGENT BREAKDOWN (scrollable list, max-h-32)                         │
│ ┌──────────────────────────────────────────┐                        │
│ │ 마케팅 매니저  Manager         작업 2건  │                        │
│ │ SNS 작업자     Worker                    │                        │
│ │ 데이터 분석    Specialist  [시스템]       │                        │
│ └──────────────────────────────────────────┘                        │
│                                                                      │
│ DELETION MODE (radio selection)                                      │
│ ○ 완료 대기 (권장) — 작업 끝난 후 삭제                              │
│ ● 강제 종료 — 즉시 중단                                             │
│                                                                      │
│ PRESERVATION NOTICE                                                  │
│ * 학습 기록 아카이브 / * 비용 영구 보존 / * 에이전트 미배속         │
│ ─────────────────────────────────────────                            │
│                                   [취소] [삭제 실행]                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Page Header
```
Container: flex items-center justify-between
```

| Element | Tailwind Classes |
|---------|-----------------|
| Title | `text-3xl font-bold tracking-tight text-slate-50` |
| Subtitle | `text-sm text-slate-400 mt-1` — "{N}개 부서" |
| Create button | `px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors` |

### 2. Create Form (Conditional Card)
```
Container: bg-slate-800/50 border border-slate-700 rounded-xl p-5
Title: text-xl font-semibold text-slate-50 mb-4
Form grid: grid grid-cols-1 md:grid-cols-2 gap-4
```

| Field | Type | Details |
|-------|------|---------|
| 부서명 * | input | required, max 100 chars, placeholder "예: 마케팅부" |
| 설명 | input | optional, placeholder "부서의 역할과 목적" |

**Input Classes:**
```
w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none
```

**Labels:** `block text-sm text-slate-400 mb-1`

**Buttons:**
- Cancel: `px-4 py-2 text-sm text-slate-400 hover:text-slate-200`
- Submit: `px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors`
- Loading text: "생성 중..."

### 3. Department Table
```
Container: bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden
```

**Table Header:**
```
Row: border-b border-slate-700
Cell: text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3
Columns: 부서명(left), 설명(left), 에이전트(center), 상태(center), 작업(right)
```

**Table Row (Normal):**
```
Row: hover:bg-slate-800/50 transition-colors
Divider: divide-y divide-slate-800
```

| Column | Element | Classes |
|--------|---------|---------|
| 부서명 | Text | `text-sm font-medium text-slate-50` |
| 설명 | Text | `text-sm text-slate-400` (or "-" if null) |
| 에이전트 | Badge | `inline-flex items-center justify-center min-w-[24px] text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400` |
| 상태 | Pill | Active: `bg-emerald-900/30 text-emerald-300`, Inactive: `bg-slate-800 text-slate-500` |
| 작업 | Links | "수정" (`text-xs text-blue-500 hover:text-blue-400 font-medium mr-3`), "삭제" (`text-xs text-red-500 hover:text-red-400 font-medium`) |

**Table Row (Inline Edit Mode):**
```
Row: bg-blue-900/10
Input: w-full px-2 py-1 border border-blue-600 rounded bg-slate-800 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none
Actions: "저장" (text-xs text-blue-500) + "취소" (text-xs text-slate-400)
```

**Empty State:**
```
Container: bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center
Text: text-slate-400 mb-4 — "등록된 부서가 없습니다"
Button: same as create button
```

**Loading State:** `text-center text-slate-400 py-8` — "로딩 중..."

### 4. Cascade Deletion Wizard (Modal)
```
Overlay: fixed inset-0 z-50 flex items-center justify-center bg-black/50
Modal: bg-slate-900 rounded-xl border border-slate-700 shadow-xl w-full max-w-lg mx-4
```

#### 4a. Modal Header
```
Container: flex items-center justify-between px-6 py-4 border-b border-slate-700
Title: text-lg font-semibold text-slate-50 — "부서 삭제 - {name}"
Close: text-slate-400 hover:text-slate-300, SVG X icon w-5 h-5
```

#### 4b. Loading State
```
text-center text-slate-400 py-8 — "영향 분석 중..."
```

#### 4c. Impact Summary (2x2 grid)
```
Container: grid grid-cols-2 gap-3
Card: bg-slate-800 rounded-lg p-3
Label: text-xs text-slate-400
Value: text-lg font-semibold text-slate-50
```

| Metric | Label | Format |
|--------|-------|--------|
| Agent count | 소속 에이전트 | `{N}명` |
| Active tasks | 진행 중 작업 | `{N}건` |
| Knowledge records | 학습 기록 | `{N}건` |
| Total cost | 누적 비용 | `${(usdMicro/1000000).toFixed(2)}` |

#### 4d. Agent Breakdown (scrollable list)
```
Title: text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 — "영향 받는 에이전트"
Container: space-y-1 max-h-32 overflow-y-auto
```

| Element | Classes |
|---------|---------|
| Row | `flex items-center justify-between text-sm py-1` |
| Agent name | `text-slate-50` |
| Tier label | `text-xs text-slate-400` |
| System badge | `text-xs px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-300` |
| Active task count | `text-xs text-blue-400` — "작업 {N}건" |

#### 4e. Deletion Mode Selector
```
Title: text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 — "삭제 방식 선택"
Container: space-y-2
```

| Mode | Selected Border | Selected BG | Description |
|------|----------------|-------------|-------------|
| wait_completion | `border-blue-600` | `bg-blue-900/10` | "완료 대기 (권장)" — "진행 중 작업이 끝난 후 삭제합니다" |
| force | `border-red-600` | `bg-red-900/10` | "강제 종료" — "진행 중 작업을 즉시 중단하고 삭제합니다" |

```
Radio label: flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
Unselected: border-slate-700 hover:bg-slate-800/50
Mode title: text-sm font-medium text-slate-50
Mode desc: text-xs text-slate-400 mt-0.5
```

#### 4f. Preservation Notice
```
Container: bg-slate-800 rounded-lg p-3 text-xs text-slate-400 space-y-1
```
- "* 학습 기록은 아카이브에 보존됩니다"
- "* 비용 기록은 영구 보존됩니다 (회계 추적)"
- "* 에이전트는 미배속으로 전환됩니다"

#### 4g. Modal Footer
```
Container: flex justify-end gap-3 px-6 py-4 border-t border-slate-700
Cancel: px-4 py-2 text-sm text-slate-400 hover:text-slate-200
Delete: px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors
Loading text: "삭제 중..."
```

---

## Interactions

| Action | Trigger | Behavior |
|--------|---------|----------|
| Create department | Submit form | POST /admin/departments, toast success |
| Inline edit | Click "수정" | Row transforms to editable inputs |
| Save edit | Click "저장" in edit row | PATCH /admin/departments/:id |
| Cancel edit | Click "취소" in edit row | Reverts to normal row |
| Delete department | Click "삭제" | Opens cascade wizard modal |
| Cascade analysis | Modal opens | GET /admin/departments/:id/cascade-analysis (shows loading) |
| Select deletion mode | Radio buttons | Toggles between wait_completion and force |
| Confirm delete | Click "삭제 실행" | DELETE /admin/departments/:id?mode={mode} |
| Cancel delete | Click "취소" or backdrop or X | Closes modal |
| Close modal | Click backdrop | Backdrop click handler |

---

## Responsive Behavior

| Breakpoint | Changes |
|-----------|---------|
| < md (mobile) | Create form stacks to 1 column, table horizontally scrollable, modal responsive (mx-4) |
| md+ (desktop) | 2-column create form grid, full table |

---

## Animations

| Element | Animation |
|---------|-----------|
| All buttons | `transition-colors` |
| Table row hover | `hover:bg-slate-800/50 transition-colors` |
| Modal | Appears centered with backdrop |
| Radio selection | `transition-colors` on border/bg change |

---

## Accessibility

| Feature | Implementation |
|---------|---------------|
| Form labels | `<label>` on all form fields |
| Required | `required` on department name |
| Radio group | `name="cascadeMode"` groups radio buttons |
| Keyboard | Click X or backdrop to close modal |
| Loading feedback | "영향 분석 중...", "생성 중...", "삭제 중..." |

---

## data-testid Map

| Element | data-testid |
|---------|-------------|
| Page container | `departments-page` |
| Page title | `departments-title` |
| Create button (header) | `departments-create-btn` |
| Create form | `departments-create-form` |
| Create name input | `departments-create-name` |
| Create description input | `departments-create-desc` |
| Create submit | `departments-create-submit` |
| Create cancel | `departments-create-cancel` |
| Department table | `departments-table` |
| Department row | `departments-row-{id}` |
| Department name cell | `departments-name-{id}` |
| Agent count badge | `departments-agent-count-{id}` |
| Status pill | `departments-status-{id}` |
| Edit button | `departments-edit-{id}` |
| Delete button | `departments-delete-{id}` |
| Edit name input | `departments-edit-name-{id}` |
| Edit desc input | `departments-edit-desc-{id}` |
| Edit save button | `departments-edit-save-{id}` |
| Edit cancel button | `departments-edit-cancel-{id}` |
| Cascade modal | `departments-cascade-modal` |
| Cascade close button | `departments-cascade-close` |
| Impact summary grid | `departments-impact-summary` |
| Agent breakdown list | `departments-agent-breakdown` |
| Mode wait_completion radio | `departments-mode-wait` |
| Mode force radio | `departments-mode-force` |
| Preservation notice | `departments-preservation-notice` |
| Cascade cancel button | `departments-cascade-cancel` |
| Cascade confirm button | `departments-cascade-confirm` |
| Empty state | `departments-empty-state` |
| Loading state | `departments-loading` |
