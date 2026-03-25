# Phase 5-3 Accessibility CRITIC-C: Motion + Responsive + Performance
**Reviewer:** CRITIC-C | **Focus:** prefers-reduced-motion, responsive, text scaling, touch targets, sidebar mobile, font loading
**Files Reviewed:** index.css, themes.css, layout.tsx, sidebar.tsx, login.tsx, index.html
**Date:** 2026-03-25

---

## Score: 4 / 10

---

## ISSUE 1 — CRITICAL: Zero `prefers-reduced-motion` Support
**WCAG 2.3.3 (AAA) / WCAG 2.1 SC 2.3.1 — Vestibular disorder risk**

`index.css` defines 5 keyframe animations with **no `@media (prefers-reduced-motion: reduce)` block anywhere**:

```css
/* ALL fire unconditionally — no reduced-motion guard */
@keyframes slide-in { from { transform: translateX(-100%); } }
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } }
@keyframes slide-up { from { transform: translateY(100%); } }
@keyframes cursor-blink { 50% { opacity: 0; } }       /* infinite */
@keyframes pulse-dot { 50% { opacity: 0.5; transform: scale(1.5); } }  /* infinite */
```

`cursor-blink` and `pulse-dot` are **infinite** animations — the most dangerous category for users with vestibular disorders (nausea, vertigo). `layout.tsx:211` applies `animate-slide-in` to the mobile overlay with no conditional:

```tsx
// layout.tsx:211 — no reduced-motion check
className={`... transition-transform duration-200 ease-out ${closing ? '-translate-x-full' : 'translate-x-0 animate-slide-in'}`}
```

`login.tsx:113` also fires `transition-all duration-300 transform active:scale-[0.98]` unconditionally.

**Fix required:** Add global reduced-motion block to `index.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ISSUE 2 — HIGH: Multiple Touch Targets Below 44px Minimum
**WCAG 2.5.5 Level AA — 44×44px minimum interactive target size**

Mobile topbar (`layout.tsx`):

| Element | Actual Size | Required |
|---------|------------|----------|
| Menu button (`p-1.5` + `w-5 h-5`) | ~32×32px | 44×44px ❌ |
| Bell button (`w-8 h-8`) | 32×32px | 44×44px ❌ |
| Avatar initials circle (`w-7 h-7`) | 28×28px | 44×44px ❌ |

Sidebar navlinks (`sidebar.tsx:165`): `px-3 py-2 text-sm` → ~36px height ❌
Logout button (`sidebar.tsx:214`): `text-xs` with no height class — tiny text button, no padding ❌

Only **login submit button** passes (`py-3` ≈ 48px ✓).

---

## ISSUE 3 — HIGH: All 7 Font Families Load Simultaneously
**Performance / FOIT risk at low bandwidth**

`index.html:18` loads a single `<link>` tag fetching 7 font families across all themes in parallel:

```
DM Sans (Command) + Inter (shared) + JetBrains Mono (shared)
+ Outfit + Work Sans (Studio) + Lexend + Source Sans 3 (Corporate)
```

All 7 families × multiple weights = 20+ HTTP requests on page load, regardless of active theme.
A comment in `index.html:16-17` acknowledges this and defers per-theme lazy loading to "Phase 4".

`display=swap` is correctly set ✓ — FOIT is avoided, but FOUT occurs across all 7 families even when only Command theme fonts are needed. On slow connections (3G), users see unstyled text for multiple font swaps.

---

## ISSUE 4 — MEDIUM: Mobile Sidebar Dialog Lacks Focus Trap
**WCAG 2.1 SC 2.1.2 — No Keyboard Trap (focus must be trapped inside modal dialogs)**

`layout.tsx:206-214`:
```tsx
<div role="dialog" aria-modal="true">
  <div onClick={closeSidebar} />  {/* backdrop */}
  <div>
    <Sidebar onNavClick={closeSidebar} />  {/* NO focus trap */}
  </div>
</div>
```

Positives: `role="dialog" aria-modal="true"` ✓, Escape key closes ✓, backdrop click closes ✓
Missing:
- **No focus trap** — `Tab` key escapes the dialog into background content
- **No `aria-label` or `aria-labelledby`** on the dialog element
- **No auto-focus management** — focus stays on the triggering Menu button, not moved inside dialog
- **No `aria-hidden="true"` on background content** when dialog is open

ARIA Authoring Practices Guide (APG) dialog pattern requires all three: focus on open, trap on Tab, restore on close.

---

## ISSUE 5 — MEDIUM: Hardcoded `px` Font Sizes Block Text Scaling
**WCAG 1.4.4 Level AA — Text Resize to 200%**

`sidebar.tsx` uses absolute px sizes that don't scale with browser zoom or OS font size:

```tsx
text-[10px]  // brand subtitle "Management Platform" (line 139)
text-[10px]  // notification badge (line 177)
text-[10px]  // build number (line 222)
text-[11px]  // section labels: COMMAND, ORGANIZATION, TOOLS, SYSTEM (line 150)
```

At 200% browser zoom, `rem`-based text scales correctly but these remain fixed at 10-11px — rendering section labels and build info unreadably small. Should use `text-xs` (0.75rem) and `text-[0.6875rem]` respectively.

---

## ISSUE 6 — LOW: Binary lg: Breakpoint Only — No Tablet Layout
**UX quality / responsive design gap**

`layout.tsx` uses only `lg:hidden` / `hidden lg:block` — a single 1024px switch:
- Below 1024px: mobile overlay sidebar, compact topbar
- Above 1024px: full desktop sidebar

Tablets at 768–1023px (iPad, Android tablets) receive the full mobile overlay experience. No `md:` breakpoint for an intermediate collapsed sidebar or mini-rail layout. Not a WCAG failure, but creates suboptimal UX for a large device category.

---

## Summary Matrix

| Issue | Severity | WCAG | Status |
|-------|----------|------|--------|
| No prefers-reduced-motion | CRITICAL | 2.3.3 | ❌ FAIL |
| Touch targets <44px | HIGH | 2.5.5 | ❌ FAIL |
| All 7 fonts load upfront | HIGH | Performance | ⚠️ RISK |
| No focus trap in dialog | MEDIUM | 2.1.2 | ❌ FAIL |
| Hardcoded px font sizes | MEDIUM | 1.4.4 | ❌ FAIL |
| No tablet breakpoints | LOW | — | ⚠️ MINOR |

## Positives
- `display=swap` correctly used ✓
- `preconnect` + `dns-prefetch` for Google Fonts ✓
- `viewport-fit=cover` + safe-area-inset-top handled ✓
- Escape key closes mobile sidebar ✓
- `role="dialog" aria-modal="true"` present (incomplete but started) ✓
- `rem`-based typography scale in `@theme` ✓
- `aria-label` on Menu/Bell/Logout buttons ✓

---

**Final Score: 4 / 10**
Critical gap: `prefers-reduced-motion` completely absent. Three WCAG AA failures (2.5.5, 2.1.2, 1.4.4). Font loading a real-world performance issue for users on constrained connections.
