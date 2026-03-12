# Phase 3-1: Design Tokens — CRITIC-A Review (Round 2)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-3-design-system/design-tokens.md`
**Round**: 2 — Fix Verification

---

## R1 Issue Verification — All 6 Confirmed Fixed ✅

| R1 Issue | Status | Verification |
|---------|--------|-------------|
| **S1** WCAG: text-zinc-500 timestamps | ✅ FIXED | §1.6 `text-faint` now `text-zinc-400` with explicit WCAG note. §2.5 empty state heading → zinc-400. §1.3 zinc-500 row updated with warning. |
| **M1** Radius table/config conflict | ✅ FIXED | §8.2 `borderRadius` override fully deleted, replaced with comment: "Tailwind built-ins already match §4.1 table intent." |
| **L1** Bot icon brand violation | ✅ FIXED | §6.5: `CircleUser` for AI Agent. `User` for human employee. `⚠️ NEVER Bot` warning inline. |
| **S2** Focus ring offset context | ✅ FIXED | §9.4 now has 3 context variants (zinc-950/900/800). §9.1/9.2 buttons default to `ring-offset-zinc-900` with explicit "match local bg" note. |
| **M2** `--animate-speech-enter` missing | ✅ FIXED | §8.1 @theme now includes `--animate-speech-enter: speech-enter 0.4s ease-out forwards` + `--animate-fade-in` + `--animate-scale-in`. |
| **M3** Collapse 350ms over budget | ✅ FIXED | §5.3 parallel `transition-[width,opacity] duration-[250ms]`, "Total budget: 250ms" label. Code example provided. |

---

## R2 New Findings

### Minor-1: `transition-[width,opacity]` container — opacity never changes on parent (code quality)

**Location**: §5.3 TrackerPanel Collapse Sequence

**The code**:
```tsx
// Parent container:
"transition-[width,opacity] duration-[250ms] ease-in-out motion-reduce:transition-none",
isTrackerExpanded ? "w-80 opacity-100" : "w-12 opacity-100"  // ← BOTH states = opacity-100
```

Both expanded and collapsed states set `opacity-100` on the container. The opacity never transitions at the parent level — the content fade is handled by the inner div (`transition-opacity duration-[200ms]`). Having `opacity` in `transition-[width,opacity]` when opacity never changes means the browser unnecessarily tracks `opacity` for compositing on every width transition. It creates no visible bug, but it's wasted property tracking.

**Recommended fix**: Remove `opacity` from parent transition property → `transition-[width]`. Keep the inner content div's `transition-opacity` as-is. This is minor: no visual impact, no WCAG impact, no functional issue.

---

### Minor-2: `placeholder:text-zinc-500` in Input spec — WCAG note missing

**Location**: §9.3 Input / Textarea — Default state

**The spec**: `placeholder:text-zinc-500`

`text-zinc-500` (#71717A) on `bg-zinc-900` (#18181B) = **3.4:1** — same ratio flagged in S1. WCAG 2.1 SC 1.4.3 applies to placeholder text as "text" (implementation auditors typically test it). The document correctly bans `text-zinc-500` for body text in §1.3 and §1.6, but the input placeholder silently uses it without a warning.

The design rationale for low-contrast placeholders is reasonable (indicating inactive/hint state vs. input value). WCAG 2.2 added APCA which gives more nuance, but under WCAG 2.1 AA this is technically a failure.

**Recommended note** (not necessarily a value change): Add inline comment: `/* placeholder:text-zinc-500 = 3.4:1 — below WCAG AA. Intentional: placeholder is hint text, not primary content. Upgrade to text-zinc-400 if WCAG strict compliance is required. */`

This documents the tradeoff rather than silently shipping a potential audit flag.

---

## Summary of R2 Findings

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| Minor-1 | Minor | `transition-[width,opacity]` parent — opacity never changes | Performance nit, no functional/WCAG impact |
| Minor-2 | Minor | `placeholder:text-zinc-500` — WCAG note missing | Audit risk if WCAG strict mode required |

**No blockers.** No new CRITICAL or MAJOR issues found.

---

## CRITIC-A Round 2 Score

**Score: 47 / 50**

| Criterion | Score | Notes |
|-----------|-------|-------|
| WCAG compliance | 9/10 | All text fixed. placeholder:zinc-500 undocumented (-1) |
| Token system completeness | 10/10 | All categories covered. OKLCH throughout. Single-source principle maintained. |
| Brand alignment | 10/10 | Bot→CircleUser, border-zinc-700 rule, no auto-collapse, no slate. |
| Tailwind v4 correctness | 9/10 | duration-[250ms], --font-sans, @theme structure all correct. Minor-1 nit (-1). |
| Phase 0–2 consistency | 9/10 | All Phase 2 confirmed rules absorbed. Minor-2 undocumented (-1). |

**Recommendation**: ✅ **APPROVE** for Phase 3-1. The two minor findings do not block implementation and can be addressed during implementation sprint. Document is ready for Phase 3-2 Component Strategy.

---

## What Improved from R1 → R2

- §1.3 zinc palette now has an actionable WCAG warning on the zinc-500 row — devs will see the constraint before using the class
- `font-light` REMOVED from font stack with clear rationale (15–20KB savings) — clean decision
- TrackerPanel collapse parallel animation is cleaner and matches Vision §12.1 budget exactly
- `--animate-speech-enter` in @theme means `animate-speech-enter` Tailwind class is now usable without inline style hacks (stagger still requires `animationDelay` on each element — correctly noted in §5.3)
- 3-variant focus ring with "match local bg" rule is a significant UX improvement — keyboard users inside cards will no longer see the black offset halo

**Phase 3-1 APPROVED by CRITIC-A. Round 2.**
