# Phase 3-1: Design Tokens — Round 2 Score
**Reviewer**: CRITIC-B (Amelia / Quinn / Bob)
**Date**: 2026-03-12
**File Reviewed**: `_corthex_full_redesign/phase-3-design-system/design-tokens.md`

---

## Fix Verification (CRITIC-B R1 Issues)

| Issue | Status | Verification |
|-------|--------|-------------|
| A-2: `--font-family-sans` → `--font-sans` | ✅ FIXED | §8.1 line: `--font-sans: 'Work Sans'...` with explanatory note |
| A-3: `duration-400` → `duration-[400ms]` | ✅ FIXED | §5.1: `duration-[400ms]` with note "arbitrary syntax required (not a Tailwind built-in)" |
| Q-1: Empty state heading zinc-500 → zinc-400 | ✅ FIXED | §2.5: `text-base font-medium text-zinc-400` with explicit WCAG failure note |
| Q-2: Modal footer border-zinc-800 → border-zinc-700 | ✅ FIXED | §10.2: `border-t border-zinc-700` with inline comment |
| A-1: borderRadius override deleted | ✅ FIXED | §8.2: Comment explains Tailwind built-ins already match §4.1 |
| B-1: Preconnect hints added | ✅ FIXED | §2.1: Both preconnect links present, above stylesheet link |
| B-2: Loader2 motion-reduce:animate-none | ✅ FIXED | §6.5 and §9.1 Loading state both have `motion-reduce:animate-none` |
| B-3: font-light (300) removed | ✅ FIXED | §2.3 marked REMOVED, Google Fonts request is now `wght@400;500;600;700` |
| Q-3: Focus ring context variants | ✅ FIXED (Critic-A also raised) | §9.4: 3 context variants documented (zinc-950/zinc-900/zinc-800) |

---

## New Issues Found in R2

### RV-1 [CRITICAL REGRESSION]: `prefers-reduced-motion` CSS block lost `!important` — inline style override broken

**R1 original (correct):**
```css
.speech-card {
  animation: none !important;
  opacity: 1;
  transform: none;
}
```

**R2 current (broken):**
```css
.speech-card {
  animation: none;  ← missing !important
  opacity: 1;
  transform: none;
}
```

§5.3 still instructs using `style={{ animation: `speech-enter 400ms ease-out forwards` ... }}` as inline style (listed first, before Framer Motion as an "OR" alternative). CSS specificity rules: **inline styles beat all selectors including `@media` blocks**, UNLESS the override uses `!important`.

Without `!important`, users with `prefers-reduced-motion: reduce` enabled will still see the `speech-enter` animation on AGORA speech cards. The `@media` block is silently ignored against inline styles.

This was present and correct in R1, then removed in R2. The `!important` must be restored.

**Fix**: `animation: none !important;` — one character addition.

**Alternative fix**: Mandate Framer Motion approach in §5.3, which handles motion preferences via `useReducedMotion()` hook natively, making the CSS fallback unnecessary. Either choice is acceptable — but the current hybrid (inline style + CSS without `!important`) is broken.

---

### RV-2 [LOW]: `text-muted` and `text-faint` are now both `text-zinc-400` — semantic tokens are identical

**§1.6 Text Colors (R2):**
```
text-muted → text-zinc-400 | A1A1AA | Secondary text, disabled, section headers
text-faint → text-zinc-400 | A1A1AA | Timestamps, placeholders, empty state sub-text
```

The fix for S1 (Critic-A) and Q-1 correctly moved `text-faint` from zinc-500 to zinc-400. However, this makes `text-muted` and `text-faint` identical — same Tailwind class, same hex, same OKLCH. They are now duplicate tokens with different names.

This creates potential dev confusion: "when do I use `text-muted` vs `text-faint`?" Since the answer is now "doesn't matter, they're the same," one should be removed or the distinction should be re-established.

**Recommendation**: Either remove `text-faint` token (its uses shift to `text-muted`), OR establish a meaningful distinction — e.g., `text-faint` = `text-zinc-500` only for ≥18px/large-text-only contexts, with explicit usage restriction.

---

### RV-3 [LOW]: `transition-[width,opacity]` on TrackerPanel container has dead opacity transition

**§5.3 TrackerPanel Collapse:**
```tsx
className={cn(
  "transition-[width,opacity] duration-[250ms] ease-in-out motion-reduce:transition-none",
  isTrackerExpanded ? "w-80 opacity-100" : "w-12 opacity-100"
)}
```

Both `isTrackerExpanded ? "w-80 opacity-100"` and `"w-12 opacity-100"` apply `opacity-100`. The `opacity` property in `transition-[width,opacity]` never transitions because the value never changes. The spec note correctly redirects opacity fade to the inner content `<div>` — but the outer wrapper's `transition-[width,opacity]` still lists `opacity` unnecessarily.

This is harmless but adds a confusing signal to future developers reading the code — why is `opacity` in the transition property if it doesn't change?

**Fix**: `transition-[width]` on the outer container, `transition-opacity` on the inner content div (already the implied intent per the comment). Or leave as-is with an explanatory comment.

---

## R2 Scores

| Dimension | R1 Score | R2 Score | Change |
|-----------|----------|----------|--------|
| Tech/Compile correctness | 6/10 | 9/10 | +3 (font var bug + borderRadius both fixed) |
| A11y / WCAG | 7/10 | 9/10 | +2 (empty state, modal footer, focus ring all fixed) |
| Performance | 8/10 | 9.5/10 | +1.5 (preconnect + motion-reduce fixed; weight 300 removed) |
| Completeness | 9/10 | 9.5/10 | +0.5 (animations, icon, focus ring coverage expanded) |
| Phase 2 consistency | 9/10 | 9.5/10 | +0.5 |

**Overall R2: 9.3/10**

One critical regression (RV-1: `!important` removed from `.speech-card` `@media` block) must be fixed. RV-2 and RV-3 are low-priority cleanup items — acceptable to leave with a note, or fix before final sign-off.

**Recommendation: Fix RV-1 → Sign off. Document is implementation-ready after that single character restoration.**
