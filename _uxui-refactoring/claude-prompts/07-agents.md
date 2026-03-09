# 07. Agents (AI 직원 관리) — Design Spec (Claude Coding Prompt)

## Page Overview
**Route**: `/agents` (Admin App — `packages/admin/src/pages/agents.tsx`)
**Purpose**: Create, view, edit, and deactivate AI employees with tier/model/soul/department management.
**Source**: 746 lines single-file component

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER                                                               │
│ ┌──────────────────────────────────┐  ┌────────────────────────────┐ │
│ │ h1: 에이전트 관리                │  │ [+ 새 AI 직원 추가]       │ │
│ │ p: 12개 에이전트 (5개 표시)      │  │                            │ │
│ └──────────────────────────────────┘  └────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ FILTERS (flex flex-wrap gap-3)                                       │
│ [검색 input w-48] [부서 select] [계급 select] [상태 select]         │
├──────────────────────────────────────────────────────────────────────┤
│ CREATE FORM (conditional, collapsible card)                          │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ h3: 새 AI 직원                                                   │ │
│ │ ┌──────────────┬──────────────┐                                  │ │
│ │ │ 이름 *       │ 역할         │                                  │ │
│ │ ├──────────────┼──────────────┤                                  │ │
│ │ │ 계급 select  │ LLM 모델     │                                  │ │
│ │ ├──────────────┼──────────────┘                                  │ │
│ │ │ 소속 부서    │                                                  │ │
│ │ ├──────────────────────────────┤                                  │ │
│ │ │ Soul 템플릿 select           │                                  │ │
│ │ │ Soul textarea                │                                  │ │
│ │ └──────────────────────────────┘                                  │ │
│ │                          [취소] [만들기]                          │ │
│ └──────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ AGENT TABLE (card with rounded-xl border)                            │
│ ┌──────┬──────┬──────┬──────┬──────┬──────┐                         │
│ │ 이름 │ 계급 │ 모델 │ 부서 │ 상태 │ 작업 │                         │
│ ├──────┼──────┼──────┼──────┼──────┼──────┤                         │
│ │🔒 비서│Mgr  │Sonnet│마케팅│ 유휴 │편집  │                         │
│ │  마케팅│Spec │Haiku │투자  │작업중│편집 ×│                         │
│ └──────┴──────┴──────┴──────┴──────┴──────┘                         │
└──────────────────────────────────────────────────────────────────────┘

┌──── DETAIL PANEL (right slide-in, full height, max-w-2xl) ──────────┐
│ HEADER — agent name + system badge + [X] close                       │
│ [system warning banner if isSystem]                                  │
│ TABS: [기본 정보] [Soul 편집] [도구 권한]                            │
│ ─────────────────────────────────────────                            │
│ TAB CONTENT (px-6 py-5)                                              │
│                                                                      │
│ [Info Tab]     — name, role, tier+model (grid 2-col), department     │
│                  [저장] button                                       │
│                                                                      │
│ [Soul Tab]     — template selector                                   │
│                  grid 2-col: editor (textarea) | preview (rendered)  │
│                  min-height 400px                                     │
│                  [Soul 저장] button                                  │
│                                                                      │
│ [Tools Tab]    — placeholder message + allowed tools as tags         │
│                                                                      │
│ FOOTER — [이 에이전트 비활성화] (if active && !system)               │
└──────────────────────────────────────────────────────────────────────┘

┌──── DEACTIVATE MODAL (center, max-w-md) ────────────────────────────┐
│ h2: 에이전트 비활성화                                                │
│ "에이전트명" 에이전트를 비활성화하시겠습니까?                        │
│ * 미배속 전환 / * 메모리 아카이브 / * 비용 영구 보존                │
│                                   [취소] [비활성화]                  │
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
| Title | `text-2xl font-bold text-slate-50` → replace to `text-3xl font-bold tracking-tight text-slate-50` |
| Subtitle | `text-sm text-slate-400 mt-1` |
| Create button | `px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors` |

### 2. Filters
```
Container: flex flex-wrap gap-3
```

| Element | Tailwind Classes |
|---------|-----------------|
| Search input | `px-3 py-1.5 border border-slate-600 rounded-lg bg-slate-800 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none w-48` placeholder="에이전트 검색..." |
| Department select | Same base classes as search, dynamic options from departments API |
| Tier select | Options: "모든 계급", Manager, Specialist, Worker |
| Status select | Options: "모든 상태", 유휴, 작업중, 에러, 오프라인 |

### 3. Create Form (Conditional Card)
```
Container: bg-slate-800/50 border border-slate-700 rounded-xl p-5
Title: text-xl font-semibold text-slate-50 mb-4
```

| Field | Type | Details |
|-------|------|---------|
| 이름 * | input | required, max 100 chars, placeholder "예: 마케팅 매니저" |
| 역할 | input | optional, max 200 chars, placeholder "예: SNS 콘텐츠 제작" |
| 계급 | select | Manager/Specialist/Worker — auto-updates model |
| LLM 모델 | select | 6 options: Claude Sonnet 4.6, Claude Haiku 4.5, GPT-4.1, GPT-4.1 Mini, Gemini 2.5 Pro, Gemini 2.5 Flash |
| 소속 부서 | select | "미배정" default + department list |
| Soul 템플릿 | select | Loads from `/admin/soul-templates`, optional |
| Soul textarea | textarea | 3 rows, placeholder "에이전트의 성격과 행동 방식을 정의합니다..." |

**Tier-Model defaults:**
| Tier | Default Model |
|------|---------------|
| Manager | claude-sonnet-4-6 |
| Specialist | claude-haiku-4-5 |
| Worker | gemini-2.5-flash |

**Form Input Classes:**
```
w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none
```

**Buttons:**
- Cancel: `px-4 py-2 text-sm text-slate-400 hover:text-slate-200`
- Submit: `px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors`
- Loading text: "생성 중..."

### 4. Agent Table
```
Container: bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden
```

**Table Header:**
```
Row: border-b border-slate-700
Cell: text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3
```

**Columns:**
| Column | Align | Content |
|--------|-------|---------|
| 이름 | left | Name (font-medium text-slate-50) + role below (text-xs text-slate-400) + system badge + inactive badge |
| 계급 | center | Manager/Specialist/Worker (text-xs font-medium text-slate-300) |
| 모델 | center | Model name (text-xs text-slate-400) |
| 부서 | center | Department name or "미배정" (text-xs text-slate-400) |
| 상태 | center | Status pill (rounded-full) |
| 작업 | right | "편집" link + "비활성화" link |

**Status Pills:**
| Status | Korean | Classes |
|--------|--------|---------|
| online | 유휴 | `bg-emerald-900/30 text-emerald-300` |
| working | 작업중 | `bg-blue-900/30 text-blue-300` |
| error | 에러 | `bg-red-900/30 text-red-300` |
| offline | 오프라인 | `bg-slate-800 text-slate-400` |

**Badges:**
| Badge | Classes |
|-------|---------|
| 시스템 | `text-xs px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-300` |
| 비활성 | `text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-500` |
| System lock icon | `w-4 h-4 text-amber-500` (SVG lock) |

**Row hover:** `hover:bg-slate-800/50 transition-colors cursor-pointer`
**Row divider:** `divide-y divide-slate-800`

**Empty States:**
- No agents: "등록된 에이전트가 없습니다" + create button
- No filter match: "필터 조건에 맞는 에이전트가 없습니다"
- Loading: "로딩 중..."

### 5. Detail Panel (Right Slide-In)
```
Overlay: fixed inset-0 z-50 flex items-start justify-end bg-black/50
Panel: bg-slate-900 border-l border-slate-700 shadow-xl h-full w-full max-w-2xl overflow-y-auto
```

**Panel Header:**
```
Container: flex items-center justify-between px-6 py-4 border-b border-slate-700 sticky top-0 bg-slate-900 z-10
Title: text-lg font-semibold text-slate-50
Close: text-slate-400 hover:text-slate-300, SVG X icon w-5 h-5
```

**System Warning Banner (conditional):**
```
Container: mx-6 mt-4 px-4 py-3 bg-amber-900/10 border border-amber-800 rounded-lg
Text: text-sm text-amber-300
```

**Tabs:**
```
Container: flex border-b border-slate-700 px-6 mt-2
Active tab: border-b-2 border-blue-600 text-blue-500 px-4 py-3 text-sm font-medium
Inactive tab: border-transparent text-slate-400 hover:text-slate-300 px-4 py-3 text-sm font-medium
```

**Info Tab Content:**
- Same form fields as create (name, role, tier+model grid 2-col, department)
- Save button at bottom with border-t separator

**Soul Tab Content:**
- Template selector dropdown (text-xs)
- Grid 2-col, min-height 400px:
  - Left: "에디터" label + textarea (font-mono, resize-none)
  - Right: "미리보기" label + rendered HTML div (`prose-sm`)
- "Soul 저장" button

**Soul Preview rendering:**
- Headings: h1 (`text-lg font-bold`), h2 (`text-base font-semibold`), h3 (`text-sm font-semibold`)
- Code blocks: `bg-slate-800 rounded p-2 text-xs overflow-x-auto`
- Inline code: `bg-slate-800 px-1 rounded text-xs`
- Lists: `ml-4 list-disc text-sm`
- Bold/italic: standard HTML

**Tools Tab Content:**
- Placeholder: `bg-slate-800/50 border border-slate-700 rounded-lg p-4` "도구 관리 기능은 준비 중입니다. (Epic 4에서 구현 예정)"
- If tools exist: flex-wrap tags `text-xs px-2 py-1 rounded bg-slate-800 text-slate-400`

**Panel Footer (conditional — active, non-system):**
```
Container: px-6 py-4 border-t border-slate-700
Link: text-xs text-red-500 hover:text-red-400 font-medium
Text: "이 에이전트 비활성화"
```

### 6. Deactivate Confirmation Modal
```
Overlay: fixed inset-0 z-[60] flex items-center justify-center bg-black/50
Modal: bg-slate-900 rounded-xl border border-slate-700 shadow-xl w-full max-w-md mx-4
Header: px-6 py-4 border-b border-slate-700
Body: px-6 py-5 space-y-3
Footer: flex justify-end gap-3 px-6 py-4 border-t border-slate-700
```

| Element | Classes |
|---------|---------|
| Title | `text-lg font-semibold text-slate-50` |
| Agent name | `<strong>` in text |
| Warning box | `bg-slate-800 rounded-lg p-3 text-xs text-slate-400 space-y-1` |
| Cancel button | `px-4 py-2 text-sm text-slate-400 hover:text-slate-200` |
| Confirm button | `px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors` |
| Loading text | "처리 중..." |

---

## Interactions

| Action | Trigger | Behavior |
|--------|---------|----------|
| Search | Type in search input | Filters agents by name (case-insensitive) |
| Filter by dept/tier/status | Select dropdown | Filters agent list |
| Open create form | "+ 새 AI 직원 추가" button | Shows inline create card |
| Tier change (create) | Select tier | Auto-updates model to tier default |
| Load soul template | Select template | Populates soul textarea |
| Create agent | Submit form | POST /admin/agents, toast on success |
| Open detail panel | Click agent row | Slide-in panel from right |
| Close panel | Click backdrop or X | Dismisses panel |
| Save info | "저장" in info tab | PATCH /admin/agents/:id |
| Save soul | "Soul 저장" in soul tab | PATCH /admin/agents/:id with soul field |
| Deactivate | Click "비활성화" link | Opens confirmation modal |
| Confirm deactivate | Click "비활성화" in modal | DELETE /admin/agents/:id (soft delete) |
| Cancel deactivate | Click "취소" or backdrop | Dismisses modal |

---

## Responsive Behavior

| Breakpoint | Changes |
|-----------|---------|
| < md (mobile) | Create form stacks to 1 column, detail panel takes full width, table horizontally scrollable |
| md+ (desktop) | 2-column grid in create form, detail panel max-w-2xl with backdrop |
| Soul editor | 2-col grid on desktop, should stack on mobile |

---

## Animations

| Element | Animation |
|---------|-----------|
| All buttons | `transition-colors` |
| Table row hover | `hover:bg-slate-800/50 transition-colors` |
| Detail panel | Appears instantly (could add slide-in transition) |
| Modal | Appears centered with backdrop fade |

---

## Accessibility

| Feature | Implementation |
|---------|---------------|
| Form labels | All inputs have `<label>` elements |
| Required fields | `required` attribute on name input |
| Keyboard | Click backdrop or X to close panel |
| System agent protection | Deactivate button hidden for system agents |
| Focus management | Form inputs focusable, tab order maintained |

---

## data-testid Map

| Element | data-testid |
|---------|-------------|
| Page container | `agents-page` |
| Page title | `agents-title` |
| Create button (header) | `agents-create-btn` |
| Search input | `agents-search-input` |
| Department filter | `agents-filter-dept` |
| Tier filter | `agents-filter-tier` |
| Status filter | `agents-filter-status` |
| Create form | `agents-create-form` |
| Create form name input | `agents-create-name` |
| Create form role input | `agents-create-role` |
| Create form tier select | `agents-create-tier` |
| Create form model select | `agents-create-model` |
| Create form dept select | `agents-create-dept` |
| Create form soul textarea | `agents-create-soul` |
| Create form submit | `agents-create-submit` |
| Create form cancel | `agents-create-cancel` |
| Agent table | `agents-table` |
| Agent row | `agents-row-{id}` |
| Agent name cell | `agents-name-{id}` |
| Agent edit link | `agents-edit-{id}` |
| Agent deactivate link | `agents-deactivate-{id}` |
| System badge | `agents-system-badge-{id}` |
| Inactive badge | `agents-inactive-badge-{id}` |
| Status pill | `agents-status-{id}` |
| Detail panel | `agents-detail-panel` |
| Detail close button | `agents-detail-close` |
| Detail tab (info) | `agents-tab-info` |
| Detail tab (soul) | `agents-tab-soul` |
| Detail tab (tools) | `agents-tab-tools` |
| Detail save info | `agents-save-info` |
| Detail save soul | `agents-save-soul` |
| Soul template select | `agents-soul-template` |
| Soul editor textarea | `agents-soul-editor` |
| Soul preview div | `agents-soul-preview` |
| Deactivate modal | `agents-deactivate-modal` |
| Deactivate confirm | `agents-deactivate-confirm` |
| Deactivate cancel | `agents-deactivate-cancel` |
| Empty state | `agents-empty-state` |
| Loading state | `agents-loading` |
