# Phase 5-3 Critic C — Cycle 3 Re-Review
**Critic:** C (Edge Cases / Accessibility / Security)
**Files reviewed:** layout.tsx, sidebar.tsx, index.css, themes.css
**Date:** 2026-03-25

---

## Fixes Verified from Cycle 2

### ✅ 1. Focus Trap (layout.tsx:95–117)
Implemented correctly. On open, first focusable element receives focus. Escape closes sidebar. Tab/Shift+Tab trapped within `sidebarDialogRef`. Event listener cleaned up on unmount/close. `role="dialog" aria-modal="true" aria-label="메인 네비게이션"` on overlay div — all semantics correct.

### ✅ 2. rem Units (sidebar.tsx:139)
`text-[0.625rem]` — was `10px`, now properly in rem. User font scaling preserved. Also confirmed: notification badge (line 177) and build number (line 222) already use `text-[0.625rem]`. Consistent.

### ✅ 3. Collapse 44px (sidebar.tsx:191)
`h-11 min-h-[44px]` — 44px guaranteed. WCAG 2.5.5 touch target met. (`h-11` = 44px in Tailwind — `min-h-[44px]` is redundant but harmless as a safety net.)

### ✅ 4. Corporate accent-hover Darkened (themes.css:132)
`#4F8FE6` — comment states "~3.2:1 large text". Improved from `#60A5FA` (2.54:1). Meets WCAG AA 3:1 for large text (≥18px or ≥14px bold). Borderline for normal-sized text (requires 4.5:1) — acknowledged as a design trade-off.

---

## Remaining Issues

### 🔴 Moderate — Focus Restoration on Dialog Close
**File:** layout.tsx
**What's missing:** When the mobile sidebar closes (via Escape, backdrop click, or nav), focus does not return to the element that opened it (the hamburger `<button>` at line 150–155). WCAG 2.4.3 Focus Order requires focus to return to the trigger.

**Fix needed:** Store a `triggerRef` pointing to the hamburger button, and call `triggerRef.current?.focus()` inside `closeSidebar()`.

### 🟡 Minor — Focus Trap Selector Inconsistency
**File:** layout.tsx:100 vs 107
- Initial focus query: `'a, button, [tabindex]'` — includes `tabindex="-1"` elements (programmatically focusable but not keyboard-reachable)
- Tab-trap query: `'a, button, input, [tabindex]:not([tabindex="-1"])'` — correctly excludes them

The first focus could land on a `tabindex="-1"` element if one exists in the sidebar. Low risk given the current sidebar DOM, but semantically incorrect.

**Fix:** Align to `'a, button, input, [tabindex]:not([tabindex="-1"])'` for initial focus too.

### 🟡 Minor — Studio Theme accent-hover Not Addressed
**File:** themes.css:78
`--color-corthex-accent-hover: #06B6D4` (cyan-400) on Studio's `#F9FAFB` bg. Estimated contrast ~2.8:1 — below WCAG AA even for large text (3:1). Pre-existing from Cycle 1/2, not introduced in Cycle 3.

---

## Scoring

| Category | Score | Notes |
|---|---|---|
| Focus Trap Implementation | 8/10 | Trap works; missing focus restore on close |
| ARIA & Semantics | 10/10 | role, aria-modal, aria-label all correct |
| Touch Targets | 10/10 | nav items 44px, collapse 44px |
| rem / Units | 10/10 | 0.625rem consistent throughout |
| Color Contrast | 8/10 | Corporate improved (3.2:1 large text); Studio hover pre-existing issue |
| Reduced Motion | 10/10 | prefers-reduced-motion complete |
| Keyboard Navigation | 9/10 | focus-visible ring on NavLinks; selector inconsistency minor |

**Total: 65/70 → 87/100**
**Grade: B+**

---

## Summary

Cycle 3 fixes are solid. The four targeted items (focus trap, rem units, collapse 44px, Corporate accent-hover) are all verified and implemented correctly. The only meaningful blocker from an accessibility standpoint is **missing focus restoration** when the mobile dialog closes — this is a standard WCAG requirement that should be addressed before Phase 6. The selector inconsistency is low risk but worth aligning. Studio hover contrast is a pre-existing technical debt.

No security or edge-case regressions detected. Focus trap does not leak events to the underlying page during sidebar-open state.
