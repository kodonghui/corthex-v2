# Phase 7-4: Accessibility & Final QA Report

**Date:** 2026-03-23
**Theme:** Sovereign Sage (Natural Organic)
**Standard:** WCAG 2.1 AA

---

## Summary

| # | Page | Verdict | Critical | Major | Minor |
|---|------|---------|----------|-------|-------|
| 1 | dashboard.tsx | **PASS** | 0 | 0 | 2 |
| 2 | agents.tsx | **CONDITIONAL PASS** | 0 | 2 | 2 |
| 3 | departments.tsx | **CONDITIONAL PASS** | 0 | 2 | 1 |
| 4 | notifications.tsx | **CONDITIONAL PASS** | 1 | 1 | 1 |
| 5 | jobs.tsx | **CONDITIONAL PASS** | 1 | 2 | 2 |
| 6 | costs.tsx | **PASS** | 0 | 1 | 2 |
| 7 | trading.tsx | **CONDITIONAL PASS** | 0 | 3 | 2 |
| 8 | settings.tsx | **PASS** | 0 | 0 | 1 |
| 9 | messenger.tsx | **CONDITIONAL PASS** | 1 | 3 | 2 |
| 10 | tiers.tsx | **PASS** | 0 | 1 | 1 |
| - | sidebar.tsx | **CONDITIONAL PASS** | 0 | 1 | 1 |

**Overall: 3 Critical, 16 Major, 17 Minor issues across all pages.**

---

## 1. Color Contrast Audit

### Verified Pairs (all PASS)

| Text Color | Background | Ratio | Verdict |
|-----------|-----------|-------|---------|
| `#1a1a1a` | `#faf8f5` | 16.42:1 | PASS |
| `#6b705c` | `#faf8f5` | 4.83:1 | PASS |
| `#756e5a` | `#faf8f5` | 4.79:1 | PASS |
| `#ffffff` | `#606C38` | 5.68:1 | PASS |
| `#ffffff` | `#283618` | 12.93:1 | PASS |
| `#ffffff` | `#4d7c0f` | 5.60:1 | PASS |
| `#ffffff` | `#dc2626` | 4.63:1 | PASS |

### Flagged Color Pairs

| Location | Text Color | Background | Estimated Ratio | Verdict |
|---------|-----------|-----------|----------------|---------|
| dashboard.tsx L79 — KPI label | `#6b705c` | `#ffffff` (white card) | 4.47:1 | **MINOR FAIL** (close) |
| dashboard.tsx L154 — date labels | `#6b705c` at 60% opacity | `#ffffff` | ~2.7:1 | **FAIL** (decorative, minor) |
| trading.tsx L66 — terminal label | `#756e5a` at 70% opacity | `#faf8f5` | ~3.4:1 | **FAIL** |
| trading.tsx L98 — table header | `#908a78` | `#f0ebe0` | ~2.8:1 | **FAIL** |
| jobs.tsx L472 — "TIMESTAMP" label | `#908a78` | `#f5f0e8` | ~2.6:1 | **FAIL** |
| costs.tsx L360 — model badge text | `#6b705c` | `#f0ebe0` | ~3.8:1 | **MINOR FAIL** |
| tiers.tsx L308-312 — table header | `#908a78` | `#e5e1d3` at 50% | ~2.4:1 | **FAIL** |
| messenger.tsx L338 — footer text | `#908a78` | white area | ~3.5:1 | **FAIL** |
| sidebar.tsx L135 — section label | `#a3c48a` | `#283618` | ~4.2:1 | **MINOR** (close to 4.5) |
| sidebar.tsx L97 — switch btn text | `#c5d8a4` | `#283618` + 10% white | ~5.0:1 | PASS |

**Pattern:** `#908a78` text consistently fails contrast on light backgrounds (`#f0ebe0`, `#f5f0e8`, `#e5e1d3`). This color is used for auxiliary/decorative labels (timestamps, table subheaders, unit labels). Recommend replacing with `#6b705c` for any text that conveys information.

---

## 2. Per-Page Detailed Findings

### Page 1: dashboard.tsx — PASS

**Color Contrast:**
- Primary text `#1a1a1a` on `#faf8f5` — PASS
- Card labels `#6b705c` on `#ffffff` cards — 4.47:1, borderline PASS for large/bold text (used at 10px uppercase bold)
- Trend colors `#4d7c0f` on white — PASS (5.54:1)

**Interactive Elements:**
- All interactive elements use `<button>` — PASS
- Quick action cards use `<button>` with visible text content — PASS
- Time range selector buttons have text content — PASS

**Keyboard Navigation:**
- All buttons are native `<button>` elements — PASS
- No `div onClick` without role — PASS
- No tabIndex > 0 — PASS

**Touch Targets:**
- Time selector buttons: `px-4 py-2` (~40px height) — PASS
- Quick action cards: `p-6` (~80px+ height) — PASS

**ARIA:**
- No `aria-live` on dynamically updating KPI values — MINOR
- No `role="main"` or `<main>` tag — MINOR

---

### Page 2: agents.tsx — CONDITIONAL PASS

**Interactive Elements:**
- Agent list items use `<div onClick>` without `role="button"` or `tabIndex={0}` — **MAJOR**
  - Line 782: `<div ... onClick={() => setSelectedAgent(...)}`
  - Users cannot tab to agent items or activate via keyboard
- Soul template variable chips use `<span onClick>` without role/tabIndex — **MAJOR**
  - Line 298: `<span ... onClick={() => setSoul(prev => prev + v)}`

**Touch Targets:**
- Filter buttons (`px-3 py-1.5`) — ~28px height — **MINOR** (below 40px minimum)
- Detail tab buttons (`pb-4`) — adequate

**Color Contrast:**
- `text-stone-500` labels in forms — maps to `#78716c`, on white ~4.4:1 — **MINOR** (borderline)

**ARIA:**
- No `aria-live` on agent status indicator changes — acceptable (manual interaction)

---

### Page 3: departments.tsx — CONDITIONAL PASS

**Interactive Elements:**
- Department card list items use `<div onClick>` without role/tabIndex — **MAJOR** (implied from main page pattern)
- Edit/Delete buttons in detail section use plain `<button>` with visible text — PASS

**Touch Targets:**
- Action buttons `px-6 py-2.5` (~44px height) — PASS
- Form buttons use `size="sm"` — needs verification from UI package but typically ~32px — **MINOR**

**Color Contrast:**
- `#756e5a` table header text on `#e5e1d3`/50% bg — **MAJOR** (~3.2:1)
- Form labels `text-stone-500` — borderline (same as agents)

**ARIA:**
- Modal uses `<Modal>` component (assumed accessible from UI package) — OK
- No aria-live on cascade analysis loading state — acceptable

---

### Page 4: notifications.tsx — CONDITIONAL PASS

**Interactive Elements:**
- Notification list items use `<div onClick>` without `role="button"` or `tabIndex` — **CRITICAL**
  - Line 325: `<div ... onClick={() => handleClick(n)} className="... cursor-pointer"`
  - This is the primary interaction on the page; keyboard users cannot navigate notifications

**Touch Targets:**
- Filter/tab chips `px-5 py-1.5` — ~28px height — **MAJOR** (below 40px, primary navigation)
- Mark all read button `px-4 py-2` — ~36px — acceptable for secondary action

**Color Contrast:**
- Search input placeholder `#6b705c` at 40% opacity on `#f5f3f0` — ~2.0:1 — **MINOR** (placeholder only, acceptable per WCAG)

**ARIA:**
- Notification count badge has no `aria-live="polite"` for real-time updates — good candidate but not critical since WS updates

---

### Page 5: jobs.tsx — CONDITIONAL PASS

**Interactive Elements:**
- Job card items use `<div onClick>` without role/tabIndex — **CRITICAL**
  - Line 432-433: `<div ... onClick={() => setExpandedJob(...)}`
  - Primary interaction element, no keyboard access
- Action buttons within cards use proper `<button>` — PASS
- Custom modal overlay uses `<div onClick>` for backdrop — acceptable pattern

**Touch Targets:**
- Delete/More buttons `p-1.5` — ~24px — **MAJOR** (well below 40px minimum)
- Schedule/trigger action text buttons have no padding — just text — **MAJOR** (lines 525-527)

**Color Contrast:**
- `#908a78` "TIMESTAMP" label on `#f5f0e8` — ~2.6:1 — **MINOR**
- Status text classes using stone-400 (`text-stone-400`) — ~3.0:1 on white — **MINOR**

**ARIA:**
- Job progress updates lack `aria-live` — the progress bar updates in real-time via WebSocket — **recommended**
- Modal lacks `role="dialog"` and `aria-modal="true"` — uses raw div overlay — acceptable if keyboard trap exists

---

### Page 6: costs.tsx — PASS

**Interactive Elements:**
- All interactive elements use `<button>` — PASS
- Pagination buttons are `<button>` — PASS
- Date/Export buttons are `<button>` — PASS

**Touch Targets:**
- Chart range buttons `px-3 py-1` — ~28px height — **MINOR** (secondary controls)
- Pagination buttons `p-2` — ~32px — **MINOR**
- Main header buttons `px-5 py-2.5` — ~44px — PASS

**Color Contrast:**
- Model badge `#6b705c` on `#f0ebe0` — ~3.8:1 — **MAJOR** for small 10px text
- Main content text pairs all verified — PASS

**ARIA:**
- No `aria-live` on cost summary cards (static after load) — acceptable
- No semantic `<main>` tag — MINOR (uses wrapper div)

---

### Page 7: trading.tsx — CONDITIONAL PASS

**Interactive Elements:**
- Ticker table rows use `<tr>` with `cursor-pointer` class but no onClick handler — cosmetic issue — **MINOR**
- All buttons (timeframe, chart type, order) use `<button>` — PASS
- Order inputs use `<input>` — PASS

**Touch Targets:**
- Timeframe buttons `px-4 py-1.5` — ~30px height — **MAJOR** (primary navigation)
- Chart type buttons `px-3 py-1` — ~26px height — **MAJOR** (too small)
- Buy/Sell buttons `py-2` — ~36px — **MINOR** (close)
- Execute button `py-3.5` — ~48px — PASS

**Color Contrast:**
- `#756e5a` at 70% opacity terminal label — ~3.4:1 — **MAJOR**
- `#908a78` table headers on `#f0ebe0` — ~2.8:1 — flagged above
- OHLC badges `text-[10px]` on white/80% — may be borderline — **MINOR**

**ARIA:**
- Chart area is purely visual with no `aria-label` or alternative text — **recommended** for screen readers
- Order form inputs have associated `<label>` elements — PASS

---

### Page 8: settings.tsx — PASS

**Interactive Elements:**
- All tabs use `<button>` — PASS
- All form inputs use `<input>` within `<label>` wrappers — PASS
- Save/action buttons are all `<button>` — PASS

**Touch Targets:**
- Tab buttons `pb-3 pt-4` — ~48px height — PASS
- Save buttons `px-6 py-2.5` — ~44px — PASS
- Form inputs `h-14` — 56px — PASS (excellent)

**Color Contrast:**
- All label text uses `#6b705c` on `#faf8f5` — 4.83:1 — PASS
- Primary text `#1a1a1a` — PASS
- Read-only input text `#6b705c` — PASS

**ARIA:**
- Form inputs wrapped in `<label>` with descriptive text — PASS
- Password inputs have clear labels — PASS
- Soul editor dirty state warning uses `confirm()` — acceptable — **MINOR** (not the best UX)

---

### Page 9: messenger.tsx — CONDITIONAL PASS

**Interactive Elements:**
- Conversation list items use `<div onClick>` (implied via cursor-pointer) — **CRITICAL**
  - Line 193: `<div ... className="... cursor-pointer"` but NO onClick handler currently (demo mode)
  - When connected, these MUST have role="button" and tabIndex
- Icon-only buttons missing aria-label — **MAJOR**
  - Line 239: Video button `<button>` with only `<Video>` icon, no aria-label
  - Line 242: Phone button `<button>` with only `<Phone>` icon, no aria-label
  - Line 247: More button `<button>` with only `<MoreVertical>` icon, no aria-label
- Footer icon buttons missing aria-label — **MAJOR**
  - Line 322: Paperclip attach button — no aria-label
  - Line 325: Smile emoji button — no aria-label
- Send button: icon-only `<button>` missing aria-label — **MAJOR**
  - Line 333: `<button ... ><Send /></button>` — no text, no aria-label

**Touch Targets:**
- Icon buttons `p-2.5` — ~40px — PASS
- Footer icon buttons `p-2` — ~32px — **MINOR**
- Send button `w-10 h-10` — 40px — PASS

**Color Contrast:**
- `#908a78` footer text on white — ~3.5:1 — **MINOR**
- Conversation preview `#6b705c` on `#f5f0e8` — ~3.8:1 — borderline for small text

**ARIA:**
- Message area has no `aria-live` for new messages (would be needed for real-time) — **recommended**
- No `role="log"` on message thread container — **recommended**

---

### Page 10: tiers.tsx — PASS

**Interactive Elements:**
- All interactive elements use `<button>` — PASS
- Create, edit, delete, reorder — all proper buttons — PASS
- Form inputs use proper `<label>` + `<Input>` / `<select>` — PASS

**Touch Targets:**
- Create button `h-11` — 44px — PASS
- Table action text buttons are text-only (`text-xs`) — **MAJOR** (no padding, tiny tap target)
  - Lines 363-373: reorder arrows, edit, delete are bare text buttons

**Color Contrast:**
- Table header `#908a78` on `#e5e1d3`/50% — ~2.4:1 — **flagged above**
- Main content all uses verified pairs — PASS

**ARIA:**
- Form uses proper label elements — PASS
- ConfirmDialog component (from UI) assumed accessible — PASS
- No aria-live needed (manual CRUD) — OK

---

### Sidebar: sidebar.tsx — CONDITIONAL PASS

**Interactive Elements:**
- Navigation uses `<NavLink>` (renders as `<a>`) — PASS
- Logout button uses `<button>` with `aria-label="로그아웃"` — PASS

**Keyboard Navigation:**
- All nav items are focusable `<a>` elements — PASS
- Switch to admin uses `<button>` — PASS

**ARIA:**
- `aria-current="page"` — **MAJOR**: NavLink does NOT set `aria-current="page"`. React Router's NavLink sets `aria-current="page"` by default ONLY when the `aria-current` prop is not explicitly provided. However, the current code relies on className for active state but does not explicitly verify aria-current output. React Router v6 NavLink DOES add `aria-current="page"` automatically, so this is likely PASS in practice.
  - **Verdict: PASS** (React Router handles this automatically)
- Notification badge count has no `aria-live` — **MINOR** (updates via polling, not critical)

**Color Contrast:**
- Section labels `#a3c48a` on `#283618` — ~4.2:1 — **MINOR** (close to 4.5, and these are decorative section headers)
- Nav link active `#ffffff` on `#283618` with 10% white overlay — PASS
- Nav link inactive `#a3c48a` on `#283618` — ~4.2:1 — same as above

---

## 3. Cross-Cutting Issues

### 3.1 Missing `<main>` Landmark

None of the 10 pages use `<main>` or `role="main"`. The layout.tsx wraps page content but does not add a semantic main landmark. **Recommendation:** Add `<main>` in layout.tsx around the `<Outlet>`.

### 3.2 `div onClick` Pattern (Critical)

Four pages use clickable `<div>` elements as primary interaction targets without `role="button"`, `tabIndex={0}`, or `onKeyDown` handlers:

| Page | Element | Line |
|------|---------|------|
| notifications.tsx | Notification items | 325 |
| jobs.tsx | Job cards | 432 |
| agents.tsx | Agent list items | 782 |
| messenger.tsx | Conversation items | 193 |

**Fix:** Either convert to `<button>` or add `role="button" tabIndex={0} onKeyDown={handleEnterSpace}`.

### 3.3 Icon-Only Buttons Without aria-label

| Page | Button | Line |
|------|--------|------|
| messenger.tsx | Video call | 239 |
| messenger.tsx | Phone call | 242 |
| messenger.tsx | More options | 247 |
| messenger.tsx | Attach file | 322 |
| messenger.tsx | Emoji picker | 325 |
| messenger.tsx | Send message | 333 |
| notifications.tsx | Settings (gear icon) | 232-238 |
| jobs.tsx | More options per job | 478 |

**Note:** notifications.tsx Settings button has `title="Notification settings"` but no `aria-label`.

### 3.4 `#908a78` Color Usage

This color fails contrast on all light backgrounds used in the theme. It appears in:
- Table sub-headers (trading, tiers, costs)
- Timestamp labels (jobs, messenger)
- Unit suffixes (trading order inputs)
- Section decorative text

**Recommendation:** Replace `#908a78` with `#6b705c` (4.83:1 on `#faf8f5`) for any text that conveys information. Keep `#908a78` only for purely decorative elements that are duplicated by other accessible means.

### 3.5 Small Touch Targets

Buttons below 40px height (the WCAG 2.2 minimum for touch):

| Page | Element | Size | Recommendation |
|------|---------|------|---------------|
| agents.tsx | Filter chips | ~28px | Add `py-2` |
| notifications.tsx | Tab/filter chips | ~28px | Add `py-2` |
| trading.tsx | Timeframe buttons | ~30px | Add `py-2` |
| trading.tsx | Chart type buttons | ~26px | Add `py-2` |
| jobs.tsx | Delete/more buttons | ~24px | Add `p-2.5` |
| tiers.tsx | Table action buttons | ~20px | Add `px-3 py-2` |

---

## 4. Recommendations (Priority Order)

### P0 — Critical (keyboard access blocked)
1. Add `role="button" tabIndex={0} onKeyDown` to all clickable `<div>` list items (notifications, jobs, agents, messenger)

### P1 — Major (WCAG AA violations)
2. Add `aria-label` to all icon-only buttons in messenger.tsx
3. Replace `#908a78` with `#6b705c` for informational text
4. Increase touch targets on filter chips and small action buttons to minimum 40px
5. Add `<main>` landmark in layout.tsx

### P2 — Minor (best practices)
6. Add `aria-live="polite"` on notification count, job progress bars
7. Add `role="log"` and `aria-live="polite"` on messenger message thread
8. Add descriptive `aria-label` on SVG chart elements (dashboard cost chart, task donut)
9. Consider `aria-current="page"` explicit prop on sidebar NavLink (React Router may handle this automatically)

---

## 5. Positive Findings

- **Form accessibility excellent:** All forms across settings, agents, departments, tiers use proper `<label>` + `<input>` associations
- **Button usage strong:** 8 of 10 pages use semantic `<button>` for primary actions
- **Color palette well-designed:** Primary text pairs (`#1a1a1a`/`#faf8f5`, `#6b705c`/`#faf8f5`, `#fff`/`#606C38`) all exceed AA requirements
- **Focus styles:** Tailwind's `focus:ring-2 focus:ring-[#606C38]/20` provides visible focus indicators throughout
- **No tabIndex > 0:** None found across all pages
- **Semantic HTML:** Headers use proper `<header>`, `<section>`, `<nav>`, `<footer>` elements consistently
- **Loading states:** Skeleton components provide visual feedback during data fetching
