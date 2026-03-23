# Phase 3-2 Visual A11y Review: Component Strategy

**Reviewer:** Critic-B (visual-a11y)
**Document:** `_uxui_redesign/phase-3-design-system/component-strategy.md`
**Date:** 2026-03-23
**Target Grade:** B (>= 7.0)

---

## Overall Assessment

Strong strategy document. The choice of shadcn/ui + Radix primitives is itself the single biggest a11y win — Radix provides AA-level keyboard navigation, focus management, and ARIA patterns out of the box. The migration checklist (§4.3) includes focus ring, keyboard, and screen reader items. Token usage is mostly correct. Grade B is achievable with 2 targeted fixes.

---

## MAJOR Issues (2)

### M1. TreeView — "Recursive Accordion" Misses Tree A11y Semantics

§7.1 line 615: `tree-view.tsx # Custom (recursive Radix Accordion)`

I verified the current Subframe TreeView does wrap Accordion (confirmed in codebase). But **Accordion and Tree are different ARIA patterns**:

| Pattern | ARIA Roles | Keyboard |
|---------|-----------|----------|
| Accordion | `region` + `heading` (or none) | Enter/Space to toggle |
| Tree | `role="tree"` → `role="treeitem"` + `aria-expanded` | Arrow keys (up/down navigate, left/right expand/collapse), Home/End, typeahead |

A TreeView built on Accordion will:
- Lack `role="tree"` and `role="treeitem"` (screen readers won't announce it as a tree)
- Lack arrow-key navigation (accordions use Enter/Space, not arrows)
- Lack Home/End jump-to-first/last behavior
- Lack typeahead focus-by-letter

**Fix:** Note that the TreeView migration MUST add `role="tree"` / `role="treeitem"` semantics and arrow-key keyboard navigation — it cannot simply reuse Accordion primitive. Reference React Aria's `useTreeView` or build custom keyboard handler on top of Radix Accordion visual structure.

### M2. Migration Checklist (§4.3) Missing 3 A11y Test Items

The 12-step checklist covers focus ring, keyboard, and screen reader — but misses:

| Missing Item | WCAG Reference | Why It Matters |
|-------------|---------------|----------------|
| `prefers-reduced-motion` test | 2.3.3 | Step 3-1 mandates 0.01ms override on ALL animations. Each migrated component with transitions needs verification. |
| `forced-colors` test | 1.4.11 / Windows HC | Step 3-1 specifies border fallbacks. Components with custom styling (badges, status dots) may lose visibility in HC mode. |
| Touch target size verification | 2.5.5 (AAA) | Step 3-1 mandates 44px minimum on mobile. Migration could shrink interactive areas. |

**Fix:** Add these 3 items to the per-component checklist:
```
□ 13. Test prefers-reduced-motion (all transitions disabled)
□ 14. Test forced-colors: active (borders visible, no transparent-only indicators)
□ 15. Verify touch targets >= 44px on mobile viewport
```

---

## MINOR Issues (5)

### m1. Button Example — Hardcoded `hover:bg-red-700` Violates API Rule #1

§3.2 line 279: `destructive: 'bg-corthex-error text-white hover:bg-red-700'`

API rule #1 (§3.2 line 303) says "All color classes use `corthex-*` tokens (never hardcoded hex, never `indigo-*` / `zinc-*`)." The destructive hover uses Tailwind's built-in `red-700` instead of a design token.

**Fix:** Define `--color-corthex-error-hover` in Step 3-1 tokens (e.g., `#b91c1c` red-700) or use `hover:bg-corthex-error/90` (opacity modifier).

### m2. Link Variant Missing Hover Color per Step 3-1 §1.8

§3.2 line 280: `link: 'text-corthex-accent-secondary underline-offset-4 hover:underline'`

Step 3-1 §1.8 specifies: "All text links use `text-corthex-accent-secondary` + `underline` + `hover:text-corthex-accent`." The link variant adds underline on hover but doesn't change color.

**Fix:** Add `hover:text-corthex-accent` to link variant.

### m3. No Dark-Background Component Variant Pattern

Several components can appear on the olive chrome sidebar (buttons in sidebar footer, badges on nav items, focus rings). §3.2 API rule #4 mentions `ring-corthex-focus-chrome` for dark bg, but there's no systematic pattern for how a component switches between light-bg and dark-bg tokens.

**Recommendation:** Add a brief note on the pattern — either a `dark` prop/variant, a CSS parent selector (`.chrome` context), or Tailwind dark variant scoping. This doesn't need to be fully spec'd but should be acknowledged as a migration consideration.

### m4. Calendar/DatePicker — No A11y Mention

§6.7 says "Add react-day-picker." Calendar is one of the most complex a11y widgets (ARIA grid pattern, arrow-key date navigation, month navigation, screen reader announcements). The doc gives no a11y guidance.

**Recommendation:** One line noting that react-day-picker v9 provides built-in ARIA grid, keyboard navigation, and locale support. Implementers should verify `aria-label` on date cells and arrow-key behavior.

### m5. Chart Pattern Fill Carry-Forward Missing

§6.1 says "Chart components must consume `--color-corthex-chart-*` tokens" but doesn't carry forward Step 3-1's requirement: "Charts with >3 series must support pattern fills."

**Recommendation:** Add one line to §6.1: "Charts with >3 series must support pattern fills (dashed, dotted, hatched) per Step 3-1 CVD safety requirement."

---

## Positive Findings

| Item | Assessment |
|------|-----------|
| **Radix selection** | Excellent a11y choice — AAA keyboard nav, focus trap, ARIA built-in |
| **Migration checklist §4.3** | Items 6-9 cover focus ring, WCAG 1.4.11 borders, keyboard, screen reader |
| **Focus ring tokens** | Correctly uses `ring-corthex-focus` (light) and `ring-corthex-focus-chrome` (dark) |
| **Input border token** | `border-corthex-border-input` correctly enforced in outline variant |
| **Coexistence strategy §8.2** | Clean — no mixing Subframe + @corthex/ui in same component |
| **Subframe audit accuracy** | Verified: 44 components ✓, @subframe/core v1.154.0 ✓, bg-indigo-600 in button ✓ |

---

## Scores

| Criterion | Score | Notes |
|-----------|-------|-------|
| Component a11y framework | 8/10 | Radix provides the foundation. Focus ring + border tokens correct. |
| Migration a11y checklist | 6.5/10 | Good core items but missing 3 key tests (reduced-motion, forced-colors, touch targets) |
| Token consistency in examples | 7/10 | One hardcoded color, link variant incomplete |
| Complex widget a11y guidance | 6/10 | TreeView semantics wrong, Calendar no guidance |
| Strategy-level a11y coverage | 8/10 | Choosing Radix + explicit a11y checklist items is strong for a strategy doc |

**Weighted Average: 7.3/10 — PASS Grade B**

The 2 major issues are straightforward fixes (add 3 checklist items + note TreeView requires tree ARIA roles). Minors are nice-to-have at strategy level.

---

## Required Fixes for Confident Grade B

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| M1 | TreeView ARIA semantics | MAJOR | Add note: TreeView needs `role="tree"`/`role="treeitem"` + arrow-key nav, not just Accordion |
| M2 | Missing a11y checklist items | MAJOR | Add items 13-15: reduced-motion, forced-colors, touch targets |
