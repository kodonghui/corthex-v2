# Phase 3-2: Component Strategy — Round 2 Score
**Reviewer**: CRITIC-B (Amelia / Quinn / Bob)
**Date**: 2026-03-12
**File Reviewed**: `_corthex_full_redesign/phase-3-design-system/component-strategy.md`

---

## Fix Verification (CRITIC-B R1 Issues)

| Issue | Status | Evidence |
|-------|--------|----------|
| A-1: TierBadgeProps + CostBadgeProps extend HTMLAttributes | ✅ FIXED | Lines 144-148: `extends React.HTMLAttributes<HTMLSpanElement>` on both |
| A-2: NEXUS counts + §7 protection corrected | ✅ FIXED | §0 table: "24 NEXUS (13 app + 11 admin)"; §2.3: 11 components; §7: two separate protected entries |
| A-3: TierBadge string CVA keys | ✅ FIXED | `manager|specialist|worker` keys + API mapping note + `defaultVariants: { tier: 'worker' }` |
| Q-1: Drawer `inert={!open}` + `aria-hidden` | ✅ FIXED | Lines 206-222: full `inert` + `aria-hidden` spec with WCAG 2.4.3 explanation |
| Q-2: DataTable ARIA sort/select spec | ✅ FIXED | Lines 257-283: `role="grid"`, `aria-sort`, `aria-selected`, keyboard interactions |
| Q-3: InputBar submit `aria-label="메시지 전송"` | ✅ FIXED | Line 303: `aria-label="메시지 전송"` with "icon-only" note |
| B-1: SpeechCard single setState | ✅ FIXED | §4.3 rewritten — N-setTimeout shown as `❌ WRONG`; single `setSpeechCards()` as `✅ CORRECT` |
| B-2: DataTable 100-row page limit | ✅ FIXED | Lines 188, 281-282: "max 100 rows — pagination required above 100" |

---

## New Issues Found in R2

### RV-1 [MEDIUM / AMELIA]: `open:translate-x-0` in Drawer comment is invalid Tailwind syntax

**Line 217 in Drawer spec comment:**
```
//     className="fixed right-0 top-0 h-full bg-zinc-900 border-l border-zinc-700 z-50
//                translate-x-full open:translate-x-0
```

`open:` is NOT a standard Tailwind CSS utility prefix for React prop-driven state. In Tailwind, the `open:` variant only applies when an HTML element has the native `open` boolean attribute (e.g., `<details open>` — it's a CSS `:is([open])` selector). It does NOT respond to a React `open` prop.

A developer copying this comment verbatim would get non-functional CSS. The class `open:translate-x-0` generates `[open].translate-x-0` — it will never match unless the `<div>` itself has an `open` HTML attribute set to `""`.

**Fix**: Replace with the correct JSX conditional pattern:
```tsx
className={cn(
  "fixed right-0 top-0 h-full bg-zinc-900 border-l border-zinc-700 z-50",
  "transition-[transform] duration-[250ms] ease-out motion-reduce:transition-none",
  open ? "translate-x-0" : "translate-x-full"
)}
```

---

### RV-2 [LOW / AMELIA]: BudgetBar spec uses raw CSS syntax, not Tailwind

**Line 330 BudgetBar entry:**
> `transition-[width] 500ms ease-out`

`500ms` and `ease-out` are not standalone Tailwind classes — they're raw CSS property values. Correct Tailwind v4 form:
```
transition-[width] duration-500 ease-out motion-reduce:transition-none
```

`duration-500` is a built-in Tailwind utility (no brackets needed). The current `500ms ease-out` string would cause a Tailwind class parse error. Also missing the mandatory `motion-reduce:transition-none`.

**Fix**: Update to `transition-[width] duration-500 ease-out motion-reduce:transition-none`

---

### RV-3 [LOW / QUINN]: Drawer backdrop missing `opacity-0` for closed state — dark overlay persists visually

**Line 211-212 Drawer backdrop:**
```
// backdrop: fixed inset-0 bg-black/40 z-40
//           pointer-events-none when !open
```

`pointer-events-none` disables click interaction but does NOT hide the backdrop visually. A `bg-black/40` element that is always-mounted and always-visible will render a 40%-opacity black overlay on the page even when the drawer is closed.

Standard always-mounted backdrop pattern needs opacity control:
```tsx
// Backdrop — always mounted, opacity transitions
<div
  className={cn(
    "fixed inset-0 bg-black/40 z-40 transition-opacity duration-[250ms]",
    open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
  )}
  onClick={onClose}
/>
```

Or simply `hidden` when closed (`open ? "block" : "hidden"` — no animation needed on backdrop, only panel slides).

---

## R2 Scores

| Dimension | R1 Score | R2 Score | Change |
|-----------|----------|----------|--------|
| Tech/TypeScript correctness | 7/10 | 9/10 | +2 (HTMLAttributes, NEXUS, string keys all fixed) |
| A11y / WCAG | 6.5/10 | 9/10 | +2.5 (Drawer inert, DataTable ARIA, InputBar label all fixed) |
| Performance | 8/10 | 9.5/10 | +1.5 (N-render anti-pattern eliminated, row limit added) |
| Completeness | 8.5/10 | 9/10 | +0.5 (AgentBadge spec added, DebateTimeline updated) |
| Phase 3-1 consistency | 9/10 | 9/10 | No change — already strong |

**Overall R2: 9.1/10**

Three remaining issues — all low/medium, no criticals:
1. **RV-1 (medium)**: `open:translate-x-0` Tailwind syntax invalid → fix to `cn()` conditional
2. **RV-2 (low)**: BudgetBar `500ms ease-out` raw CSS → `duration-500 ease-out motion-reduce:transition-none`
3. **RV-3 (low)**: Drawer backdrop missing `opacity-0` when closed — dark overlay persists

**Recommendation**: Fix RV-1 and RV-3 (both affect working implementations). RV-2 is documentation only. Document is near-ready for sign-off after these small corrections.
