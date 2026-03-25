# Phase 5-3 Critic B — Cycle 3 Re-Review
**Role**: Critic B (Accessibility — WCAG / Screen Reader / Keyboard)
**Date**: 2026-03-25
**Scope**: layout.tsx focus trap + sidebar.tsx collapse/sr-only/rem review

---

## Files Read
- `packages/app/src/components/layout.tsx` (239 lines)
- `packages/app/src/components/sidebar.tsx` (229 lines)

---

## Focus Trap — Detailed Analysis

### ✅ PASS: Dialog ARIA attributes (layout.tsx:223)
```tsx
<div ref={sidebarDialogRef} role="dialog" aria-modal="true" aria-label="메인 네비게이션">
```
All three required attributes present. `aria-label` provides the accessible name. `aria-modal="true"` signals to AT that background content is inert.

### ✅ PASS: Focus-on-open (layout.tsx:98–102)
```tsx
const firstFocusable = dialog.querySelector<HTMLElement>('a, button, [tabindex]')
firstFocusable?.focus()
```
Focus moves into the dialog immediately on open. Screen reader users land inside the modal. Correct behavior.

### ✅ PASS: Tab cycling implemented (layout.tsx:106–113)
```tsx
const focusable = dialog.querySelectorAll<HTMLElement>('a, button, input, [tabindex]:not([tabindex="-1"])')
if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
```
- Forward Tab wraps from last → first ✅
- Shift+Tab wraps from first → last ✅
- `e.preventDefault()` prevents browser default ✅
- Selector correctly excludes `[tabindex="-1"]` ✅

### ✅ PASS: Escape key handler (layout.tsx:104)
```tsx
if (e.key === 'Escape') closeSidebar()
```
Standard dialog close behavior. ✅

### ✅ PASS: Event listener cleanup (layout.tsx:115–116)
```tsx
document.addEventListener('keydown', handleKeyDown)
return () => document.removeEventListener('keydown', handleKeyDown)
```
Cleanup on `sidebarOpen` state change. No listener leak. ✅

---

## Issues Found

### ❌ FAIL: Focus return on close — WCAG 2.1 SC 2.4.3 gap
**Severity: Moderate**

When the sidebar closes, focus is NOT returned to the element that triggered opening (the hamburger `<button aria-label="메뉴 열기">`). There is no `triggerRef`, no saved reference to the opener.

**Impact**: Screen reader users lose their position in the page after dismissing the navigation. They land at `<body>` or wherever browser default places focus — likely far from the hamburger button. Keyboard-only users experience the same disorientation.

**Fix required**:
```tsx
const menuButtonRef = useRef<HTMLButtonElement>(null)
// attach to hamburger button: ref={menuButtonRef}

// in closeSidebar or useEffect on !sidebarOpen:
menuButtonRef.current?.focus()
```

### ⚠️ MINOR: Initial focus selector inconsistency
`querySelector('a, button, [tabindex]')` (open) vs `querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])')` (trap).

The open-focus selector includes `[tabindex="-1"]` elements (not keyboard reachable). In current sidebar content (only `<a>` and `<button>`), no impact — but semantically incorrect. Should use `:not([tabindex="-1"])` consistently.

### ⚠️ MINOR: 200ms closing window without trap
`sidebarOpen || closing` renders the dialog, but the trap `useEffect` removes its listener as soon as `sidebarOpen` becomes `false`. During the 200ms slide-out animation (`closing=true`), Tab is not trapped. Very low severity — 200ms is below human reaction time for intentional Tab navigation.

---

## Other Cycle 3 Fixes

### ✅ PASS: 44px collapse button (sidebar.tsx:191)
```tsx
className="hidden lg:flex items-center justify-center h-11 min-h-[44px] ..."
```
`h-11` = 44px + `min-h-[44px]` enforces minimum. Meets WCAG SC 2.5.8 target size. ✅

### ✅ PASS: Notification badge sr-only (layout.tsx:167, 209)
```tsx
<span className="sr-only">새 알림 있음</span>
```
Present in both mobile and desktop notification buttons. Screen readers announce the unread state. ✅

### ✅ PASS: rem units throughout
All text classes use rem-based Tailwind tokens:
- `text-sm` (0.875rem), `text-xs` (0.75rem) — NavLink items, user info
- `text-[0.625rem]` — build number, section labels
- `text-[0.6875rem]` — nav section headers
- `text-lg`, `text-base` — page titles

No px-based font-size found. Respects user browser font size preferences. ✅

---

## Scoring

| Item | Cycle 2 | Cycle 3 | Delta |
|------|---------|---------|-------|
| Focus trap (Tab cycling) | ❌ missing | ✅ implemented | +15 |
| Dialog ARIA attributes | ❌ missing | ✅ complete | +10 |
| Focus-on-open | ❌ missing | ✅ present | +5 |
| Escape key | ✅ | ✅ | — |
| 44px touch target | ❌ partial | ✅ confirmed | +3 |
| sr-only notification | ❌ missing | ✅ present | +5 |
| rem units | ⚠️ partial | ✅ complete | +3 |
| Focus return on close | ❌ | ❌ still missing | 0 |

**Cycle 3 Score: 85/100**

Deduction breakdown:
- `-10` Focus return on close (WCAG SC 2.4.3 — screen reader UX regression)
- `-3` Initial focus selector inconsistency (cosmetic/robustness)
- `-2` 200ms trap gap on close animation

---

## Verdict
**CONDITIONAL PASS**. Focus trap core functionality is correctly implemented — Tab cycling works in both directions, ARIA attributes are complete, Escape dismisses. The remaining gap (focus return) is a real WCAG issue but lower severity than the missing trap was in Cycle 2. Recommend one more targeted fix for focus return before final sign-off.
