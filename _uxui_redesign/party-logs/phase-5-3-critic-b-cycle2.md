# Phase 5-3 Accessibility CRITIC-B: Cycle 2 Re-Review
**Date:** 2026-03-25
**Reviewer:** CRITIC-B (Keyboard Nav + Semantic HTML)
**Files Re-read:** sidebar.tsx, layout.tsx, index.css
**Previous Score:** 4/10

---

## Cycle 2 Score: 5 / 10 (+1 from Cycle 1)

---

## What Was Fixed ✅

### FIX-1: Global `:focus-visible` rule (index.css:95-98)
```css
:focus-visible {
  outline: 2px solid var(--color-corthex-accent);
  outline-offset: 2px;
}
```
**Impact: HIGH.** Every keyboard-focusable element in the app now shows a visible 2px accent-colored outline on focus. This single rule closes the most universal keyboard navigation gap. Well done.

### FIX-2: Touch targets — Menu button (layout.tsx:135)
```tsx
className="p-2.5 -ml-2.5 rounded-lg min-w-[44px] min-h-[44px] ..."
```
Menu button now explicitly enforces 44×44px minimum. ✅

### FIX-3: Touch targets — Bell buttons (layout.tsx:145, 187)
```tsx
className="relative w-11 h-11 ..."  // 44×44px
```
Both mobile and desktop bell buttons upgraded from `w-8 h-8` (32px) to `w-11 h-11` (44px). ✅

### FIX-4: Touch targets — Sidebar NavLinks (sidebar.tsx:165)
```tsx
`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-corthex-accent ...`
```
`min-h-[44px]` added + `focus-visible:ring-2` reinforces the global rule with a ring style on nav links. ✅

### FIX-5: `prefers-reduced-motion` (index.css:84-92) — Bonus
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; ... }
}
```
Not in original scope but a genuine WCAG 2.3.3 (Animation from Interactions) improvement. ✅

---

## Still Open ❌

### [CRITICAL-2] Mobile modal: no focus trap, no focus move, no accessible name
**File:** `layout.tsx:204-215` — **UNCHANGED**
```tsx
<div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
  {/* backdrop */}
  <div ...>
    <Sidebar onNavClick={closeSidebar} />
  </div>
</div>
```
Three separate problems still present:
1. **No `aria-labelledby` or `aria-label`** — dialog has no accessible name. Screen reader announces "dialog" with no context.
2. **Focus does not move into the dialog on open** — `openSidebar()` calls `setSidebarOpen(true)` only. No `useEffect` to move focus to the sidebar's first element after mounting.
3. **No focus trap** — Tab continues to cycle through background content. `aria-modal="true"` only suppresses virtual cursor in some AT; it does NOT trap DOM focus for keyboard users. A real focus trap (intercepting Tab/Shift-Tab at boundaries) is required.

Fix: Add a `useRef` to the first focusable element, call `.focus()` in a `useEffect` when `sidebarOpen` becomes true, and implement Tab/Shift-Tab boundary handling.

---

### [MEDIUM-1] Collapsed sidebar NavLinks: `title` still used instead of `aria-label`
**File:** `sidebar.tsx:163` — **UNCHANGED**
```tsx
title={collapsed ? item.label : undefined}
```
`focus-visible:ring-2` was added (visual fix ✅) but the accessible name problem was not addressed. When collapsed, the link renders an icon only. The `title` attribute is **not reliably announced** by NVDA, JAWS, or VoiceOver on keyboard focus. Needs:
```tsx
aria-label={collapsed ? item.label : undefined}
```

---

### [MEDIUM-3] Notification badge no screen-reader text
**File:** `sidebar.tsx:177-179`, `layout.tsx:150` — **UNCHANGED**
```tsx
<span className="ml-auto ... bg-red-500">{unreadCount > 99 ? '99+' : unreadCount}</span>
<span className="absolute ... w-2 h-2 rounded-full bg-corthex-accent" />
```
- Sidebar badge: visible count exists, but the parent NavLink's accessible name is still just "알림" — screen reader reads "알림" link without the count context. Needs `aria-label={unreadCount > 0 ? \`알림 ${unreadCount}개 미읽음\` : '알림'}` on the NavLink.
- Mobile header dot: purely decorative, no sr-only text, no update to Bell button `aria-label` when hasUnread is true.

---

### [LOW-1] Breadcrumb "CORTHEX" not keyboard accessible
**File:** `layout.tsx:166` — **UNCHANGED**
```tsx
<span ... onClick={() => navigate('/dashboard')}>CORTHEX</span>
```
Still a `<span>` with click handler — not reachable by Tab, no `role`, no keyboard event. Should be `<a href="/dashboard">` or `<button>`.

---

### [LOW-2] Sidebar collapse toggle: `h-8` (32px) below 44px minimum
**File:** `sidebar.tsx:191` — **NEW OBSERVATION**
```tsx
className="hidden lg:flex items-center justify-center h-8 mx-2 mb-2 ..."
```
The collapse toggle is desktop-only (`hidden lg:flex`), so WCAG 2.5.8 (44px) applies less strictly than mobile. However, it is still a keyboard-reachable button at 32px height. Recommend `h-10` or `min-h-[44px]` for consistency with the other fixes applied this cycle.

---

### Previously Identified Issues Outside These Files (Unchanged)
| Issue | File | Status |
|-------|------|--------|
| CRITICAL-1: `<span>` interactive links (아이디/비밀번호 찾기) | login.tsx | ❌ Not fixed |
| HIGH-1: Login error no `role="alert"` | login.tsx | ❌ Not fixed |
| HIGH-2: Hub/Dashboard missing `<h1>` | hub/index.tsx, dashboard.tsx | ❌ Not fixed |
| HIGH-3: Progress bars no ARIA role | hub/index.tsx | ❌ Not fixed |
| HIGH-4: SVG charts no accessible label | dashboard.tsx | ❌ Not fixed |
| MEDIUM-2: Agent tabs no `role="tablist/tab"` | agents.tsx | ❌ Not fixed |

---

## Delta Summary

| Category | Cycle 1 | Cycle 2 | Change |
|----------|---------|---------|--------|
| Focus visibility | ❌ No global rule | ✅ `:focus-visible` global | Fixed |
| Touch targets (Menu) | ❌ ~36px | ✅ 44px | Fixed |
| Touch targets (Bell) | ❌ 32px | ✅ 44px | Fixed |
| Touch targets (NavLinks) | ❌ unset | ✅ min-h-[44px] | Fixed |
| Reduced motion | ❌ absent | ✅ WCAG 2.3.3 | Fixed (bonus) |
| Modal focus trap | ❌ missing | ❌ still missing | **Open** |
| Collapsed nav aria-label | ❌ title only | ❌ title only | **Open** |
| Notification badge SR | ❌ missing | ❌ missing | **Open** |
| Breadcrumb keyboard | ❌ span | ❌ span | **Open** |

**Score: 5/10** — Real progress on focus visibility and touch targets. The global `:focus-visible` rule alone is meaningful and benefits every page. Remaining blockers are the modal focus trap (functional WCAG 2.1.2 failure) and the collapsed sidebar name gap.
