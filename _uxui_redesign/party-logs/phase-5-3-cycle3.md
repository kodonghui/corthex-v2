# Phase 5-3 — Cycle 3 Re-Review Party Log
**Date:** 2026-03-25
**Files reviewed:** `packages/app/src/components/layout.tsx`, `sidebar.tsx`, `styles/themes.css`
**Cycle 3 fix set:** focus trap · rem units · sr-only dot · 44px collapse · corporate accent-hover · dialog aria-label

---

## CRITIC-A — Color Contrast + Visual

### Fix Verification

#### ✅ FIXED — Corporate accent-hover: #60A5FA → #4F8FE6
`themes.css:132`
```css
--color-corthex-accent-hover: #4F8FE6; /* was #60A5FA (2.54:1) → #4F8FE6 (~3.2:1 large text) */
```
Calculated:
```
L(#4F8FE6) = R:0.267 G:0.440 B:0.755 → linear: 0.0589 / 0.161 / 0.533
= 0.2126×0.0589 + 0.7152×0.161 + 0.0722×0.533 = 0.01253 + 0.11515 + 0.03848 = 0.16616
Contrast on #FFFFFF (L=1.0): 1.05 / 0.21616 = 4.86:1 ✅ PASS AA normal text
```
The comment says "~3.2:1 large text" but the actual value is 4.86:1 — the fix exceeds what was necessary. R3 **resolved**.

#### ✅ FIXED — Notification dot sr-only text
`layout.tsx:167, 209`
```tsx
<span className="sr-only">새 알림 있음</span>
```
Both mobile and desktop bell notification dots now include sr-only text. R6 (color-only indicator) **resolved** for the dot.

Caveat: The sidebar NavLink for `/notifications` still reads "알림" without appending the count to its accessible name. `sidebar.tsx:176-179` adds a visible red badge but the NavLink `className` function does not set `aria-label={unreadCount > 0 ? \`알림 ${unreadCount}개 미읽음\` : undefined}`. Screen reader hears "알림 link" with no count. **Partial only** — dot sr-only added, count context still missing.

---

### Still Open

| ID | Theme | Issue | Ratio | Status |
|----|-------|-------|-------|--------|
| R1 | STUDIO | Login button text (#FFFFFF on #0891B2) | 3.68:1 | ❌ Unresolved (3 cycles) |
| R2 | STUDIO | Login button hover (#FFFFFF on #06B6D4) | 2.43:1 | ❌ Unresolved |
| R4 | COMMAND | Error text (#EF4444 on muted bg) | ~3.99:1 | ❌ Unresolved |
| R5 | COMMAND | Hardcoded `text-red-600` on #1C1917 | 3.65:1 | ❌ Unresolved |
| R7 | STUDIO | Focus ring on sidebar: #0891B2 on #0E7490 | 1.45:1 | ❌ Unresolved |
| R8 | CORPORATE | Focus ring on sidebar: #2563EB on #1E293B | 2.82:1 | ❌ Unresolved |

R7 and R8 were flagged as new in Cycle 2. Cycle 3 did not add `--color-corthex-focus-ring` tokens to Studio or Corporate. The global `:focus-visible` rule still uses `var(--color-corthex-accent)` for all themes, producing near-invisible focus on Studio and Corporate sidebars.

`--color-corthex-focus-ring: #FFFFFF` exists in Corporate but is not used by the global rule (rule reads `var(--color-corthex-accent)`). Token is present but wired to nothing.

### Per-Theme Scores (CRITIC-A)

| Theme | Cycle 2 | Cycle 3 | Delta | Notes |
|-------|---------|---------|-------|-------|
| COMMAND | 7/10 | **7/10** | 0 | sr-only minor gain; error text/red-600 still open |
| STUDIO | 5/10 | **5/10** | 0 | P0 login button unresolved; sidebar focus 1.45:1 |
| CORPORATE | 6/10 | **7/10** | +1 | accent-hover 4.86:1 is a genuine improvement |
| **Overall** | **6/10** | **6/10** | 0 | Studio P0 prevents advancement |

---

## CRITIC-B — Keyboard Navigation + Semantic HTML

### Fix Verification

#### ✅ FIXED — Focus trap in mobile sidebar dialog (layout.tsx:93-117)
```tsx
const sidebarDialogRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (!sidebarOpen) return
  const dialog = sidebarDialogRef.current
  if (dialog) {
    const firstFocusable = dialog.querySelector<HTMLElement>('a, button, [tabindex]')
    firstFocusable?.focus()
  }
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeSidebar()
    if (e.key === 'Tab' && dialog) {
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a, button, input, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [sidebarOpen, closeSidebar])
```
Three problems from Cycle 2 are now resolved:
- ✅ Focus moves to first focusable element on open (`firstFocusable?.focus()`)
- ✅ Tab + Shift-Tab trapped within dialog boundaries
- ✅ Escape closes dialog

Implementation uses a `querySelectorAll` with a proper selector that includes `[tabindex]:not([tabindex="-1"])`. The forward/backward boundary wrapping is correct. **CRITICAL-2 fully resolved.**

#### ✅ FIXED — Dialog aria-label (layout.tsx:223)
```tsx
<div ref={sidebarDialogRef} ... role="dialog" aria-modal="true" aria-label="메인 네비게이션">
```
Screen readers now announce "메인 네비게이션 dialog". `aria-modal="true"` prevents virtual cursor from leaving the dialog in supporting AT. **CRITICAL-2 aria-label sub-issue resolved.**

#### ✅ FIXED — Collapse toggle touch target (sidebar.tsx:191)
```tsx
className="hidden lg:flex items-center justify-center h-11 min-h-[44px] mx-2 mb-2 ..."
```
`h-8` (32px) → `h-11 min-h-[44px]` (44px). LOW-2 **resolved**.

#### ✅ PARTIALLY FIXED — Notification dot sr-only
Dot has `<span className="sr-only">새 알림 있음</span>` ✅.
Sidebar NavLink accessible name still does not include count ("알림" only). See R6 above. Partial.

---

### Still Open

| ID | File | Issue | Status |
|----|------|-------|--------|
| MEDIUM-1 | sidebar.tsx:163 | Collapsed nav uses `title` not `aria-label` | ❌ Unresolved |
| LOW-1 | layout.tsx:183 | Breadcrumb `<span onClick>` — not keyboard reachable | ❌ Unresolved |
| CRITICAL-1 | login.tsx | Interactive `<span>` links (아이디/비밀번호 찾기) | ❌ Out of scope |
| HIGH-1 | login.tsx | Login error no `role="alert"` | ❌ Out of scope |

MEDIUM-1: `title={collapsed ? item.label : undefined}` — `title` is not reliably announced by NVDA/JAWS/VoiceOver on keyboard focus. Should be `aria-label={collapsed ? item.label : undefined}`. This is a one-character change with meaningful impact for collapsed sidebar keyboard users.

LOW-1: `layout.tsx:183` — `<span className="... cursor-pointer" onClick={() => navigate('/dashboard')}>CORTHEX</span>` is still a `<span>`. Not reachable by Tab, no `role="button"`, no keyboard handler. Should be `<button>` or `<a href="/dashboard">`.

### Per-Theme Scores (CRITIC-B — keyboard/structure is theme-agnostic)

| Category | Cycle 2 | Cycle 3 | Delta |
|----------|---------|---------|-------|
| Focus trap | ❌ | ✅ | **+CRITICAL resolved** |
| Dialog aria-label | ❌ | ✅ | Fixed |
| Collapse toggle 44px | ❌ | ✅ | Fixed |
| sr-only dot | ❌ | ⚠️ Partial | Partial |
| title→aria-label (collapsed) | ❌ | ❌ | Still open |
| Breadcrumb keyboard | ❌ | ❌ | Still open |

**Score: 5/10 → 8/10** (+3). The focus trap was the most significant WCAG 2.1.2 failure, and it is now correctly implemented. Dialog name fixed. Collapse toggle fixed. Remaining issues are medium/low severity.

---

## CRITIC-C — Motion + Responsive + Performance

### Fix Verification

#### ✅ FIXED — Hardcoded px font sizes → rem (sidebar.tsx)

| Line | Before | After |
|------|--------|-------|
| 139 | `text-[10px]` | `text-[0.625rem]` |
| 150 | `text-[0.6875rem]` | `text-[0.6875rem]` ✅ |
| 177 | `text-[0.625rem]` | `text-[0.625rem]` ✅ |
| 222 | `text-[0.625rem]` | `text-[0.625rem]` ✅ |

All four locations now use rem units. At 200% browser zoom, these scale correctly with the user's base font size. WCAG 1.4.4 compliance improved. Issue 2 **resolved**.

#### ✅ FIXED — Focus trap (same as CRITIC-B)
`useEffect` on `sidebarOpen` correctly adds/removes the `keydown` listener. No memory leak risk since cleanup returns `removeEventListener`. **Resolved.**

#### ✅ FIXED — Collapse toggle h-11 min-h-[44px]
Issue 4 from Cycle 2 **resolved**.

---

### Still Open

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| Issue 3 | All 7 font families load simultaneously (index.html) | HIGH | ❌ Deferred to Phase 4 |
| Issue 5 | No intermediate tablet breakpoint (md: 768–1023px) | LOW | ❌ Deferred |

Issue 3 (7 fonts): `index.html` still loads Inter, JetBrains Mono, DM Sans, Outfit, Work Sans, Lexend, Source Sans 3 regardless of active theme. In production this is ~200–400KB of font data loaded for fonts that may never be displayed. Mitigation requires dynamic font loading keyed to `data-theme`, or eliminating unused themes' fonts via a CSS-only approach. Still deferred.

### Summary: Cycle 2 → Cycle 3

| Issue | Cycle 2 | Cycle 3 |
|-------|---------|---------|
| prefers-reduced-motion | ✅ FIXED | ✅ Maintained |
| Touch targets <44px | ✅ FIXED | ✅ Maintained |
| Hardcoded px font sizes | ❌ MEDIUM | ✅ FIXED |
| Focus trap in dialog | ❌ HIGH | ✅ FIXED |
| Collapse toggle h-8 | ⚠️ NEW (LOW) | ✅ FIXED |
| All 7 fonts load upfront | ⚠️ HIGH | ⚠️ UNCHANGED |
| No tablet breakpoints | ⚠️ LOW | ⚠️ UNCHANGED |

**Score: 6/10 → 8/10** (+2). Both remaining non-deferred issues resolved this cycle.

---

## Overall Cycle 3 Summary

### Fixes Applied This Cycle

| Fix | File | Impact | Result |
|-----|------|--------|--------|
| Focus trap (Tab wrap + Escape + auto-focus) | layout.tsx | CRITICAL | ✅ Resolved |
| Dialog aria-label "메인 네비게이션" | layout.tsx | HIGH | ✅ Resolved |
| px → rem (4 locations) | sidebar.tsx | MEDIUM | ✅ Resolved |
| Collapse toggle h-11 min-h-[44px] | sidebar.tsx | LOW | ✅ Resolved |
| sr-only notification dot | layout.tsx | MEDIUM | ✅ Partial |
| Corporate accent-hover #4F8FE6 (4.86:1) | themes.css | MEDIUM | ✅ Resolved |

### Per-Theme Scores

| Theme | CRITIC-A | CRITIC-B | CRITIC-C | Avg | Grade |
|-------|---------|---------|---------|-----|-------|
| COMMAND | 7/10 | 8/10 | 8/10 | **7.7** | B+ |
| STUDIO | 5/10 | 8/10 | 8/10 | **7.0** | C+ |
| CORPORATE | 7/10 | 8/10 | 8/10 | **7.7** | B+ |

### Overall Score: **6/10 → 7/10** (Grade B−)

Delta: +1 from Cycle 2.

The critical WCAG 2.1.2 failure (focus trap) is resolved. px→rem and 44px fixes close two medium issues. The Studio theme continues to drag down scores: P0 login button contrast (3.68:1, unresolved across all 3 cycles) and sidebar focus ring (1.45:1) remain open. Corporate and Command are in good shape structurally; their remaining issues are contrast edge cases in error/muted states.

---

## Required Cycle 4 Fixes

### P0 — Block-level

**C4-1: Studio login button text contrast**
`themes.css` — `--color-corthex-text-on-accent: #FFFFFF` is insufficient on `#0891B2` (3.68:1).
- Fix: change `--color-corthex-accent` used for buttons to `accent-deep: #0E7490` in Studio, giving white text 5.36:1 ✅
- Or in login.tsx: use `bg-corthex-accent-deep` instead of `bg-corthex-accent` for the Studio login button

**C4-2: Studio sidebar focus ring (1.45:1)**
Add `--color-corthex-focus-ring: #FFFFFF` to Studio theme and update global rule to:
```css
:focus-visible {
  outline: 2px solid var(--color-corthex-focus-ring, var(--color-corthex-accent));
  outline-offset: 2px;
}
```
Studio sidebar focus ring: white on #0E7490 = 5.36:1 ✅

### P1 — High priority

**C4-3: Corporate sidebar focus ring (2.82:1)**
`--color-corthex-focus-ring: #FFFFFF` is already defined but not used by `:focus-visible`. Apply same fix as C4-2. Corporate: white on #1E293B = 14.5:1 ✅

**C4-4: Collapsed sidebar `title` → `aria-label`**
`sidebar.tsx:163`
```tsx
// Before
title={collapsed ? item.label : undefined}
// After
aria-label={collapsed ? item.label : undefined}
title={collapsed ? item.label : undefined}
```
One-line addition. High SR impact for collapsed keyboard users.

**C4-5: Breadcrumb keyboard accessibility**
`layout.tsx:183` — replace `<span onClick>` with `<button>` or `<a href="/dashboard">`.
