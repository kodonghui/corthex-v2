# Phase 3, Step 3-2 — Critic-A (UX & Brand) Review

**Reviewer:** ux-brand (Critic-A)
**Document:** `_uxui_redesign/phase-3-design-system/component-strategy.md`
**Date:** 2026-03-23
**Grade Step:** B (avg >= 7.5)
**Focus:** Brand consistency, 60-30-10 rule, typography pairing, emotional tone

---

## Overall Assessment

**Score: 7.5/10 — PASS (at threshold, 2 major + 4 minor issues)**

This is a technically strong component strategy. The codebase audit is thorough (three overlapping systems clearly diagnosed), the library evaluation is rigorous (5 candidates, weighted matrix, shadcn/Radix wins at 9.56), and the migration phasing (P0→P1→P2 with coexistence rules) is production-viable. The document's core purpose — resolving brand inconsistency through system unification — is itself a brand consistency achievement.

However, the document has two major issues from a brand perspective: the Button example violates its own token rule, and there's no guidance for components rendering on dark chrome surfaces. Several minor gaps in typography pairing and emotional tone keep this at threshold.

---

## MAJOR Issues (Must Fix)

### M1. Button Destructive Hover — Hardcoded `red-700` Violates Rule #1

**Location:** §3.2 Component API Standard, Button CVA example

```tsx
destructive: 'bg-corthex-error text-white hover:bg-red-700',
```

§3.2 API rule #1 states: *"All color classes use corthex-* tokens (never hardcoded hex, never indigo-* / zinc-*)"*. The `hover:bg-red-700` is a hardcoded Tailwind color, not a `corthex-*` token. This is the FIRST code example in the FIRST component — it sets the precedent for every subsequent component. If the canonical example violates the canonical rule, developers will normalize rule-breaking.

**Fix:** Either:
1. Add a `--color-corthex-error-hover` token to the design tokens and use `hover:bg-corthex-error-hover`
2. Or use Tailwind v4's color modifier: `hover:bg-corthex-error/90` (90% opacity creates darkening effect)

Option 2 is simpler and requires no token addition. But option 1 is more consistent with the accent pattern (accent has accent-hover).

### M2. No Inverse/Chrome Variant Defined in CVA Example

**Location:** §3.2 + §4.5

§4.5 variant mapping introduces `variant="inverse"` with the note "new — for dark chrome surfaces." But the Button CVA in §3.2 doesn't include this variant. Any component rendered inside the sidebar, mobile drawer, or other dark chrome surfaces (30% zone) has no defined styling.

**Impact:** A developer building a sidebar action button (e.g., "New Agent" button in sidebar Zone A) will either:
- Use `variant="default"` → olive accent on olive chrome = invisible (2.27:1)
- Use `variant="ghost"` → `text-corthex-text-primary` (#1a1a1a) on olive chrome = unreadable
- Guess → brand inconsistency

**Fix:** Add inverse variant to the Button CVA example:
```tsx
inverse: 'bg-white/15 text-corthex-text-chrome hover:bg-white/25 focus-visible:ring-corthex-focus-chrome',
```

And add a general rule: *"Components rendered on --bg-chrome surfaces must use `variant="inverse"` or equivalent. Inverse variants use `--text-chrome`, `--bg-chrome-hover`, and `--focus-ring-chrome` tokens."*

---

## MINOR Issues (Should Fix)

### m1. Link Variant Underline Timing Inconsistency

**Location:** §3.2 Button CVA

```tsx
link: 'text-corthex-accent-secondary underline-offset-4 hover:underline',
```

Step 3-1 §1.8 link style rule: *"All text links use text-corthex-accent-secondary + **underline** + hover:text-corthex-accent."*

The Button link variant shows underline on **hover only**. Step 3-1 specifies underline by **default**.

**Distinction:** Button `variant="link"` is a button that looks like a link. Inline `<a>` tags are actual text links. The behavior CAN differ — buttons communicate clickability through position/context, while inline links need underline for identification.

**Fix:** Either:
1. Align: `link: 'text-corthex-accent-secondary underline underline-offset-4 hover:text-corthex-accent'`
2. Or explicitly document the distinction: *"Button link variant uses hover-underline. Inline text links (`<a>`) use always-underline per Step 3-1 §1.8."*

Option 2 is preferable — the distinction is valid but must be documented to prevent confusion.

### m2. No Monospace Variant for Data-Displaying Components

**Location:** §3.3 Component Inventory (absent)

Step 3-1 §2.3: *"Agent IDs, cost values ($0.0042), API endpoints, code blocks, build numbers — always JetBrains Mono."*

Which components display monospace data? The component strategy doesn't specify:

| Component | Mono Use Case | Needed Feature |
|-----------|--------------|----------------|
| **Badge** | Agent ID, build number | `font="mono"` prop or `variant="code"` |
| **Table** | Cost columns, API endpoints | Column-level `font-mono` class guidance |
| **Input** | API key entry, code input | `font="mono"` prop |
| **Card** | Cost summary values | Developer guidance in usage docs |

**Fix:** Add a "Typography in Components" subsection to §3.2 API rules:
> *"Components displaying machine-readable data (agent IDs, costs, API endpoints, build numbers) must use `font-mono` class (JetBrains Mono). Badge, Input, and Table support a `mono` prop or className override for this purpose."*

### m3. Dialog Overlay Color Not Specified

**Location:** §3.3 (Dialog row), absent

Dialog is a P0 component. When it opens, an overlay covers the content area. The overlay color affects the emotional tone:
- Cold: `rgba(0,0,0,0.5)` — feels clinical, blocks the warm cream
- Warm: `rgba(40,54,24,0.3)` (olive-tinted) — maintains the Natural Organic warmth even during modals

Neither Step 3-1 nor the component strategy specifies the overlay token. Radix Dialog defaults to user-provided styles.

**Fix:** Add to §3.2 API rules or §6 Specialized Decisions:
> *"Dialog/Drawer overlay uses `bg-corthex-chrome/40` (olive-tinted translucent). This maintains the Natural Organic warmth during modal interactions. Never use pure black overlay."*

### m4. No "Controlled Nature" Framing

**Location:** §1 (absent)

Unlike the design tokens doc (which threads "Controlled Nature" through every section), the component strategy has zero brand narrative. The document IS a brand act — unifying three chaotic systems into one ordered hierarchy is the Ruler archetype's core impulse — but this connection isn't made explicit.

**Fix:** Add a brief (3-4 line) opening paragraph to §1:
> *"CORTHEX's component architecture embodies the Ruler archetype's drive for order. The current three-system chaos (Subframe + @corthex/ui + Stitch) mirrors an organization without a clear chain of command. The migration unifies these into a single system of components that speak the same visual language — one token system, one component API, one source of truth."*

This takes 3 seconds to read and anchors the entire document in brand purpose.

---

## Positive Findings

### P1. Codebase Audit — Excellent Brand Diagnosis
§1.1's discovery that "three layers use three different color systems" is the most important finding in this document. The specific comparison — *"Subframe Button uses bg-brand-600, @corthex/ui Button uses bg-indigo-600, Stitch hardcodes #5a7247"* — makes the brand inconsistency viscerally clear. This is not abstract architecture analysis; it's a concrete brand failure with a concrete fix.

### P2. Token Enforcement Rules
§3.2's six API rules are the right framework for brand protection:
1. All corthex-* tokens ✓
2. VariantProps export ✓
3. Unified radix-ui ✓
4. Focus ring tokens ✓
5. Input border tokens ✓
6. tw-animate-css ✓

These rules, if followed, make brand violations structurally difficult.

### P3. Variant Mapping Table — Preserves Brand Semantics
§4.5 correctly maps Subframe's arbitrary variant names (brand-primary, brand-secondary, neutral-primary) to meaningful CORTHEX names (default, secondary, outline, ghost). The token swaps (bg-brand-600 → bg-corthex-accent) ensure the brand identity survives migration.

### P4. Step 3-1 Carry-Forward Resolution
Appendix A addresses all three items from my Step 3-1 R2 review:
1. Handoff purple → deferred to build time (acceptable)
2. Z-index 30 → stacking order documented (bottom-nav → FAB → backdrop)
3. `--bg-input` → defined as `bg-corthex-bg` (cream) — correct for Natural Organic warmth

The input background decision (cream, not white) is significant. White inputs on cream pages would create jarring contrast breaks. Cream inputs maintain the warm continuous surface.

### P5. Migration Checklist — A11y Gate Embedded
§4.3's 12-step per-component checklist embeds accessibility at steps 6-9 (focus ring, keyboard nav, screen reader, ARIA). This makes a11y a gate, not an afterthought. Combined with the risk assessment identifying a11y regression as HIGH severity, this shows the strategy takes accessibility seriously.

### P6. Specialized Component Decisions — Pragmatic
§6's "keep what works" decisions (lightweight-charts, @xyflow/react, @dnd-kit, @codemirror, sonner) show pragmatism. Not everything needs migration — only the 44 Subframe components that conflict with the brand system. The "token integrate" approach for existing libraries (apply corthex-chart-* to charts, corthex-* theme to CodeMirror) is efficient.

### P7. Library Evaluation Rigor
§2.2's five-candidate evaluation with weighted scoring matrix is thorough. The shadcn/Radix recommendation (9.56 weighted) is well-supported. Key insight: *"Subframe → shadcn is a lateral move, not a rewrite"* correctly identifies that both wrap Radix primitives — minimizing migration risk.

---

## Score Breakdown

| Focus Area | Score | Reasoning |
|-----------|-------|-----------|
| **Brand Consistency** | 8/10 | Token enforcement rules are strong (+2). Codebase audit diagnoses the problem clearly (+1). Variant mapping preserves brand (+1). Deductions: destructive red-700 hardcode (-1), inverse variant undefined (-1). |
| **60-30-10 Rule** | 7.5/10 | Variant design implicitly distributes zones correctly (+1). Strategy ensures corthex-* propagation (+1). Deductions: no chrome-zone component guidance (-1.5), dialog overlay unspecified (-0.5). This criterion is less directly applicable to architecture docs. |
| **Typography Pairing** | 7.5/10 | Button sizes map to type scale correctly (+1). Deductions: no mono variant/prop for data components (-1.5), no explicit type-scale-to-component mapping (-1). |
| **Emotional Tone** | 7/10 | "Three-to-one unification" framing is implicitly Ruler archetype (+1). Pragmatic decisions show confidence (+0.5). Deductions: no "Controlled Nature" narrative (-2), no component interaction feel guidance (-0.5). Partially offset by document type — this IS a technical strategy doc. |
| **WEIGHTED AVERAGE** | **7.5/10** | |

---

## Verdict

**PASS — 7.5/10 (Grade B threshold met)**

The component strategy is architecturally sound and correctly positions CORTHEX for brand-consistent migration from three chaotic systems to one unified system. The library evaluation and migration phasing are production-ready.

| Priority | ID | Issue | Effort |
|----------|------|-------|--------|
| **MAJOR** | M1 | Destructive hover: `red-700` → `corthex-error/90` | 1 line |
| **MAJOR** | M2 | Add inverse variant for chrome surfaces | 3 lines in CVA + 2-line rule |
| Minor | m1 | Link variant underline: document Button vs inline distinction | 2-line note |
| Minor | m2 | Mono variant guidance for Badge/Table/Input | 3-line rule in §3.2 |
| Minor | m3 | Dialog overlay: `bg-corthex-chrome/40` | 2-line rule |
| Minor | m4 | "Controlled Nature" opening paragraph | 4 lines |

**After M1+M2 fixes, expected score: 8.0-8.5/10.**

---

*Critic-A (ux-brand) — Phase 3, Step 3-2 Review Complete*
