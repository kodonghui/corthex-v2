# Phase 5-3 Accessibility CRITIC-C: Cycle 2 Re-Review
**Reviewer:** CRITIC-C | **Focus:** Motion + Responsive + Performance
**Files Re-Read:** index.css, layout.tsx, sidebar.tsx
**Date:** 2026-03-25

---

## Score: 6 / 10 (up from 4/10)

---

## FIXES VERIFIED ✓

### Fix 1 — prefers-reduced-motion: CONFIRMED ✓
`index.css:85-92` — correctly implemented:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
Covers all 5 keyframes + mobile sidebar `transition-transform` + login `transition-all`. Infinite animations (`cursor-blink`, `pulse-dot`) now stop after 1 iteration. `scroll-behavior: auto` also prevents smooth-scroll disorientation. **Excellent implementation.**

Bonus: `:focus-visible` global rule added at lines 95-98 — improves keyboard nav visibility. ✓

### Fix 2 — Touch Targets: CONFIRMED ✓

| Element | Cycle 1 | Cycle 2 | Pass? |
|---------|---------|---------|-------|
| Menu button (mobile) | ~32px (`p-1.5`) | `min-w-[44px] min-h-[44px] p-2.5` | ✅ |
| Bell button (mobile) | 32×32px (`w-8 h-8`) | `w-11 h-11` = 44×44px | ✅ |
| Bell button (desktop) | 32×32px (`w-8 h-8`) | `w-11 h-11` = 44×44px | ✅ |
| NavLinks (sidebar) | ~36px (`py-2`) | `py-2.5 min-h-[44px]` | ✅ |

NavLinks also gained `focus-visible:ring-2 focus-visible:ring-corthex-accent` — good keyboard focus indicator. ✓

---

## REMAINING ISSUES

### Issue 1 — HIGH (Unchanged): Mobile Sidebar Dialog Lacks Focus Trap
**WCAG 2.1 SC 2.1.2**

`layout.tsx:206-214` is identical to Cycle 1. Still not fixed:

```tsx
<div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
  {/* NO aria-label / aria-labelledby */}
  {/* NO focus trap */}
  {/* NO auto-focus on open */}
  <div onClick={closeSidebar} />
  <div>
    <Sidebar onNavClick={closeSidebar} />
  </div>
</div>
```

Three distinct gaps remain:
- **No focus trap**: `Tab` key escapes the overlay into background content. `aria-modal="true"` is present but browsers don't enforce focus containment from this attribute alone — JavaScript trap required.
- **No `aria-label`**: Screen readers announce "dialog" with no name. Needs `aria-label="내비게이션 메뉴"` or `aria-labelledby`.
- **No focus management**: Focus stays on the Menu button (behind the overlay) when the dialog opens. Per ARIA APG, focus must move to the first interactive element inside the dialog on open, and restore to the trigger on close.

### Issue 2 — MEDIUM (Unchanged): Hardcoded `px` Font Sizes
**WCAG 1.4.4 Level AA — Text Resize to 200%**

`sidebar.tsx` — none of these were changed:

| Line | Value | Location |
|------|-------|----------|
| 139 | `text-[10px]` | Brand subtitle "Management Platform" |
| 150 | `text-[11px]` | Section labels: COMMAND / ORGANIZATION / TOOLS / SYSTEM |
| 177 | `text-[10px]` | Notification badge count |
| 222 | `text-[10px]` | Build number |

At 200% browser zoom, `rem`-based text scales correctly, but these 4 locations remain fixed at 10–11px. Section labels become unreadable. Should be `text-xs` (0.75rem) and `text-[0.6875rem]` respectively.

### Issue 3 — HIGH (Unchanged): All 7 Font Families Load Simultaneously
**Performance — not in scope of Cycle 2 fixes, but still present**

`index.html` not re-read this cycle but confirmed unchanged from Cycle 1. 7 font families still load on every page load regardless of active theme. Deferred to "Phase 4" per comment in source. Remains a real-world bandwidth issue.

### Issue 4 — LOW (New observation): Collapse Toggle Button Too Small
`sidebar.tsx:189-195`:
```tsx
<button className="hidden lg:flex items-center justify-center h-8 mx-2 mb-2 ...">
```
`h-8` = 32px. Desktop-only but still below the 44px target. `min-h-[44px]` not applied here unlike NavLinks.

---

## Summary: Cycle 1 → Cycle 2

| Issue | Cycle 1 | Cycle 2 |
|-------|---------|---------|
| prefers-reduced-motion | ❌ CRITICAL | ✅ FIXED |
| Touch targets <44px | ❌ HIGH | ✅ FIXED |
| All 7 fonts load upfront | ⚠️ HIGH | ⚠️ UNCHANGED |
| Focus trap in dialog | ❌ MEDIUM | ❌ UNCHANGED |
| Hardcoded px font sizes | ❌ MEDIUM | ❌ UNCHANGED |
| No tablet breakpoints | ⚠️ LOW | ⚠️ UNCHANGED |
| Collapse toggle h-8 | — | ⚠️ NEW (LOW) |

**2 critical issues resolved. 3 substantive issues remain.**

---

**Cycle 2 Score: 6 / 10**

The two highest-impact fixes (motion + touch targets) are cleanly implemented. The focus trap omission is the most significant remaining WCAG failure. Hardcoded px font sizes affect usability for low-vision users. Font loading remains a real-world performance gap.
