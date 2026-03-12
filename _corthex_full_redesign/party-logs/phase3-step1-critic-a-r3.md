# Phase 3-1: Design Tokens — CRITIC-A Review (Round 3 — Final)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-3-design-system/design-tokens.md`
**Round**: 3 — Final Scoring

---

## R2 Fix Verification — All 4 Confirmed ✅

| Fix | Status | Verification |
|-----|--------|-------------|
| **RV-1** `animation: none !important` restored | ✅ | §8.1: `animation: none !important` with inline comment "!important required — primary pattern uses inline style={{ animation: '...' }}" + Framer Motion `useReducedMotion()` note. |
| **RV-3 / Minor-1** `transition-[width]` only on container | ✅ | §5.3 code shows `transition-[width] duration-[250ms]` on container; inner content div handles `transition-opacity duration-[200ms]` separately. Dead `opacity` property removed. |
| **RV-2** `text-faint` merged into `text-muted` | ✅ | §1.6: struck-through row with "MERGED INTO `text-muted`" — no semantic duplicate. Clean. |
| **Minor-2** `placeholder:text-zinc-500` documented | ✅ | §9.3: WCAG 1.4.3 exemption note inline — tradeoff documented, not silently shipped. |

---

## One Cosmetic Observation (Not a Blocker)

**§5.3 prose vs. code mismatch** — §5.3 collapse description prose (line 505) still reads:
> "1. Content fade + width collapse **simultaneously**: `transition-[width,opacity] duration-[250ms]`..."

But the code block below (line 512) correctly shows `transition-[width]` only. The prose was not updated when the code was fixed in R2. The **code is authoritative** — a dev implementing from the code block will do the right thing. The prose is a leftover artifact from before the fix. Cosmetic, zero implementation risk.

---

## Final Score

**Score: 49 / 50**

| Criterion | Score | Notes |
|-----------|-------|-------|
| WCAG compliance | 10/10 | All text passes. Placeholder tradeoff documented with spec citation. |
| Token system completeness | 10/10 | All categories. OKLCH throughout. `text-faint` duplicate resolved. |
| Brand alignment | 10/10 | `CircleUser` not `Bot`. border-zinc-700 consistently applied. No slate. No auto-collapse. |
| Tailwind v4 correctness | 10/10 | `--font-sans`, `duration-[250ms]`, `--animate-*` in @theme, `!important` for inline-style override all correct. |
| Phase 0–2 consistency | 9/10 | All Phase 2 confirmed rules absorbed. §5.3 prose/code mismatch cosmetically inconsistent (-1). |

**Recommendation**: ✅ **APPROVED** — Phase 3-1 Design Tokens is production-ready for developer handoff.

The cosmetic prose mismatch in §5.3 can be fixed in a future editorial pass or during implementation sprint — it does not block approval.

---

## Phase 3-1 Final Summary (CRITIC-A)

**3 Rounds. 8 issues total resolved (6 CRITIC-A + 2 CRITIC-B shared) before approval.**

Key decisions locked by this document:
1. **border-zinc-700** everywhere on dark surfaces — invisible border rule enforced
2. **text-zinc-400 minimum** for all body text under 18px (zinc-500 forbidden for small text)
3. **CircleUser** (not Bot) for AI agents — brand compliance
4. **duration-[250ms]** arbitrary syntax — Tailwind v4 confirmed
5. **3-variant focus rings** — ring-offset matches local background
6. **Parallel TrackerPanel collapse** — 250ms budget maintained
7. **--font-sans** (not --font-family-sans) — Tailwind v4 ship-blocker fixed
8. **`animation: none !important`** in motion-reduce block — inline style override requires !important

**CRITIC-A signs off on Phase 3-1. ✅**
