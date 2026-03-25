# Phase 5-3 Accessibility CRITIC-B: Keyboard Nav + Semantic HTML
**Date:** 2026-03-25
**Reviewer:** CRITIC-B (Accessibility — Keyboard Nav + Semantic HTML)
**Files Reviewed:** login.tsx, dashboard.tsx, hub/index.tsx, agents.tsx, layout.tsx, sidebar.tsx

---

## Score: 4 / 10

**Rationale:** Two critical failures (non-keyboard interactive elements, unfocused modal), four high-severity issues (no landmark in page content, progress bars not ARIA-compliant, SVG charts inaccessible, error messages not announced). These failures affect fundamental keyboard and screen-reader usability across every page.

---

## Issues Found (10 total)

### [CRITICAL-1] Interactive `<span>` elements not keyboard-reachable
**File:** `login.tsx:132,134`
**Severity:** CRITICAL
```tsx
<span className="... cursor-pointer ...">아이디 찾기</span>
<span className="... cursor-pointer ...">비밀번호 찾기</span>
```
Both "아이디 찾기" and "비밀번호 찾기" are `<span>` elements with click handlers implied by `cursor-pointer`. They have **no tabIndex, no role="button", no onClick**. Keyboard users cannot reach or activate them. Must be `<button>` or `<a>` elements.

---

### [CRITICAL-2] Mobile sidebar modal — no focus trap, no focus move
**File:** `layout.tsx:204-215`
**Severity:** CRITICAL
```tsx
<div role="dialog" aria-modal="true">
  <div ... onClick={closeSidebar} />
  <div ...>
    <Sidebar onNavClick={closeSidebar} />
  </div>
</div>
```
`role="dialog"` + `aria-modal="true"` declared, but:
1. Focus is **not moved** to the dialog when it opens — screen reader users stay on background content
2. **No focus trap** — Tab key escapes the modal into background content
3. `aria-modal="true"` alone does not trap focus in DOM (only works in some screen readers with virtual cursor, not keyboard Tab)
4. Missing `aria-label` or `aria-labelledby` — dialog has no accessible name

---

### [HIGH-1] Error messages not announced to screen readers
**File:** `login.tsx:104-108`
**Severity:** HIGH
```tsx
{error && (
  <div className="... text-corthex-error">
    <p>{error}</p>
  </div>
)}
```
Error container has no `role="alert"` or `aria-live="assertive"`. When a login error or rate-limit countdown appears, screen readers receive **no notification**. Users may enter wrong credentials repeatedly without knowing why.

---

### [HIGH-2] Page content missing `<main>` landmark + heading structure
**File:** `hub/index.tsx`, `dashboard.tsx`
**Severity:** HIGH
Hub (`hub/index.tsx:243`) returns:
```tsx
<div data-testid="hub-page" className="overflow-y-auto h-full">
```
Dashboard (`dashboard.tsx:478`) returns:
```tsx
<div data-testid="dashboard-page" className="bg-corthex-bg min-h-screen ...">
```
Neither uses `<main>`. Layout (`layout.tsx:199`) wraps in `<main className="flex-1 overflow-auto">` — **so `<main>` exists globally** — but page-level heading structure is broken: hub uses `<h2>` as its first heading ("Welcome, Commander") with no `<h1>`. Dashboard has no heading at all at page level. Screen reader users navigating by headings cannot orient themselves.

---

### [HIGH-3] Progress bars not ARIA-compliant
**File:** `hub/index.tsx:519-530`
**Severity:** HIGH
```tsx
<div className="w-full h-1.5 rounded-full overflow-hidden" ...>
  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
</div>
```
These are visual progress bars for agent utilization (0% or 100%). No `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, or `aria-label`. Screen readers see a meaningless decorative `<div>`.

---

### [HIGH-4] SVG data charts completely inaccessible
**File:** `dashboard.tsx` — `CostTrendChart`, `TaskStatusDonut`, `DeptLoadChart`
**Severity:** HIGH
```tsx
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="...">
  {/* paths, circles — no title, no desc, no role */}
</svg>
```
Three chart SVGs have no `role="img"`, no `<title>` element, no `aria-label`, no `aria-describedby`. The Cost Trend chart, Departmental Load bars, and Task Status donut are **entirely invisible to screen reader users**. Key business data is conveyed only visually.

---

### [MEDIUM-1] Collapsed sidebar nav links lose accessible name
**File:** `sidebar.tsx:158-175`
**Severity:** MEDIUM
```tsx
<NavLink
  title={collapsed ? item.label : undefined}
  ...
>
  <item.icon className="w-5 h-5 shrink-0" />
  {!collapsed && <span>{item.label}</span>}
</NavLink>
```
When collapsed, nav links show only an icon. The `title` attribute is used for tooltip — but `title` is not consistently announced by screen readers and is NOT read by most AT on keyboard focus. Links need `aria-label={collapsed ? item.label : undefined}` to be accessible when collapsed.

---

### [MEDIUM-2] Agent detail tabs missing ARIA tab pattern
**File:** `agents.tsx:533-550`
**Severity:** MEDIUM
```tsx
<div className="flex gap-8">
  {detailTabItems.map((tab) => (
    <button key={tab.value} onClick={() => setDetailTab(tab.value)} ...>
      {tab.label}
    </button>
  ))}
</div>
```
Tab buttons exist but have no `role="tablist"` on container, no `role="tab"` on buttons, no `aria-selected`, no `aria-controls`. The associated panel has no `role="tabpanel"` or `aria-labelledby`. Screen readers cannot identify this as a tab widget — they read a list of plain buttons.

---

### [MEDIUM-3] Notification badge no screen-reader text
**File:** `sidebar.tsx:176-179`, `layout.tsx:149-151`
**Severity:** MEDIUM
```tsx
<span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
  {unreadCount > 99 ? '99+' : unreadCount}
</span>
```
```tsx
<span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-corthex-accent ..." />
```
The sidebar badge reads the count (visible text) but has no `aria-label` on the parent NavLink to contextualize "알림 3개 미읽음". The mobile header red dot is purely decorative with no text — screen reader users cannot tell there are unread notifications.

---

### [LOW-1] Breadcrumb "CORTHEX" not keyboard accessible
**File:** `layout.tsx:166`
**Severity:** LOW
```tsx
<span ... onClick={() => navigate('/dashboard')}>CORTHEX</span>
```
`<span>` with onClick for navigation — not reachable by Tab, not announced as interactive. Should be `<a>` or `<button>`.

---

## Positive Findings

| Item | File | Assessment |
|------|------|------------|
| Sidebar `<aside>` with `aria-label` | sidebar.tsx:127 | Correct landmark usage |
| `<nav role="navigation">` | sidebar.tsx:146 | Present (role redundant on `<nav>` but harmless) |
| Mobile sidebar Escape key handler | layout.tsx:95-99 | Correctly implemented |
| Form labels with `htmlFor` | login.tsx:75,90 | Proper label/input association |
| Login uses `<main>`, `<header>`, `<footer>` | login.tsx:60-148 | Semantic structure is correct |
| Collapse toggle `aria-label` | sidebar.tsx:192 | Properly labeled |
| Bell button `aria-label="알림"` | layout.tsx:137,187 | Correct |
| Logout button `aria-label="로그아웃"` | sidebar.tsx:213 | Correct |
| `autoComplete` on login inputs | login.tsx:84,99 | Good UX + AT support |

---

## Fix Priority

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | Focus trap + focus move on mobile modal | CRITICAL | Medium |
| 2 | `<span>` links → `<button>` in login | CRITICAL | Low |
| 3 | `role="alert"` on error div | HIGH | Low |
| 4 | Page `<h1>` headings in hub/dashboard | HIGH | Low |
| 5 | SVG charts: add `role="img"` + `<title>` | HIGH | Low |
| 6 | Progress bars: add `role="progressbar"` + ARIA values | HIGH | Low |
| 7 | Collapsed nav: `aria-label` instead of `title` | MEDIUM | Low |
| 8 | Tab widget: `role="tablist/tab"` + `aria-selected` | MEDIUM | Medium |
| 9 | Notification badge: SR-only count text | MEDIUM | Low |
| 10 | Breadcrumb span → `<a>` | LOW | Low |
