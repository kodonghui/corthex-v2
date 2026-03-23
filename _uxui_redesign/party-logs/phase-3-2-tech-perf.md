# Phase 3-2 Tech-Perf Review: Component Strategy

**Reviewer:** tech-perf (Critic-C)
**Date:** 2026-03-23
**Document:** `_uxui_redesign/phase-3-design-system/component-strategy.md`
**Focus:** Library selection validity, bundle impact, migration feasibility, version accuracy
**Target Grade:** B (avg >= 7.0)

---

## Verdict: CONDITIONAL PASS

Strong document overall — correct identification of the 3-layer problem, sound shadcn/ui recommendation, practical migration strategy. However, **2 Major** and **4 Minor** issues need resolution.

---

## MAJOR Issues

### M1: Evaluation matrix weighted averages are miscalculated — all 5 scores wrong

**Verification:** Using the document's own weights (3,3,3,3,2,2,2 = total 18) and scores:

| Candidate | Document Claims | Actual Computed | Delta |
|-----------|----------------|-----------------|-------|
| shadcn/Radix | **9.56** | **9.61** | +0.05 |
| Base UI | **7.17** | **7.50** | +0.33 |
| Ark UI | **7.22** | **7.44** | +0.22 |
| React Aria | **7.39** | **7.50** | +0.11 |
| Headless UI | **7.06** | **7.44** | +0.38 |

The ranking doesn't change (shadcn wins clearly), but **the margins are wrong.** The document implies a 2.4-point lead for shadcn over the field; actual lead is 2.1 points. More importantly, Base UI and React Aria tie at 7.50 (not 7.17 vs 7.39), which changes the "watch list" priority.

**Fix:** Recalculate all weighted averages. Formula: `sum(score × weight) / sum(weights)`.

---

### M2: Button code example contradicts Step 3-1 specifications — 2 conflicts

**Conflict 1 — Touch target size:**
Section 3.2 code example defines `default: 'h-10 px-4 py-2'` (h-10 = 40px). But Step 3-1 §3.5 specifies: "Buttons: **44px height, `h-11` minimum** — AAA."

40px < 44px = WCAG AAA touch target violation in the spec's own reference code.

**Conflict 2 — Transition property:**
Section 3.2 code example uses `transition-all duration-200`. But Step 3-1 §5.1 Rule 3 states: "Only `transform` and `opacity` properties animated — never layout-triggering properties."

`transition-all` animates width, height, padding, margin, and every other property — directly violating the performance rule. Should be `transition-colors` (for bg/text color changes on hover) or a scoped `transition-[background-color,color,box-shadow]`.

**Fix:** Update the Button example:
- `default: 'h-11 px-4 py-2'` (44px — matches Step 3-1)
- Replace `transition-all` with `transition-colors` (or explicit property list)

---

## MINOR Issues

### m1: Command palette (cmdk) missing from component inventory

Step 3-1 §4.3 defines `--z-command-palette: 100` as the supreme z-index layer. The Phase 2 analyses reference Cmd+K command palette as a key interaction pattern. But the component inventory (§3.3) has no entry for a command palette component.

**Note:** cmdk is not currently in the codebase (grep confirms no existing implementation). This is a new feature for v3. It should be listed in the inventory with a dependency recommendation (likely `cmdk` package which shadcn/ui supports natively).

**Fix:** Add to §3.3 inventory: `CommandPalette | No (cmdk) | (new) | P1` with a note about the cmdk package.

### m2: recharts is bundled via @subframe/core — affects savings estimate

The document states @subframe/core removal saves "~54KB CSS + JS runtime." But @subframe/core's `package.json` declares `recharts@^2.15.1` as a direct dependency. The 4 chart Subframe components (AreaChart, BarChart, LineChart, PieChart) are listed as "not migrated" — but they'll lose their recharts dependency when @subframe/core is removed.

Section 6.1 says "Migrate to direct recharts/nivo usage" but doesn't list `recharts` in the new dependencies (§7.2). After removing @subframe/core, recharts must be added as a direct dependency in `packages/app/package.json`.

**Fix:** Either add `recharts` to §3.4 New Dependencies table, or clarify in §6.1 that recharts must become a direct dependency.

### m3: `react-day-picker` listed as new dependency but already bundled

@subframe/core's `package.json` has `react-day-picker@^9.0.4` as a direct dependency. The document lists `react-day-picker@^9.x` in §3.4 as a "New dependency." It's technically new as a *direct* dependency of @corthex/ui (post-migration), but calling it "new" is misleading since it's already in the bundle via @subframe/core.

**Fix:** Add a note: "Already bundled transitively via @subframe/core. Becomes a direct dependency after @subframe/core removal."

### m4: `radix-ui` unified package — verify version availability

The document specifies `radix-ui@^1.4.3` (unified package). The current codebase uses individual `@radix-ui/react-*` packages (via @subframe/core peerDeps). The unified `radix-ui` package consolidates these into a single import. This is the correct recommendation, but the specific version `1.4.3` should be verified against the actual npm registry at implementation time.

**Fix:** Add a note: "Version to be verified at implementation — pin to exact version per CLAUDE.md convention."

---

## Positive Findings (What Works Well)

| Aspect | Assessment |
|--------|-----------|
| **3-layer problem identification** | Excellent — clearly audits all 44 Subframe + 20 @corthex/ui + 42 Stitch components with their respective token systems |
| **Subframe component count** | Verified: `ls` confirms exactly 44 files in `packages/app/src/ui/components/` ✅ |
| **Subframe → Radix mapping** | Verified: @subframe/core peerDeps confirm it wraps @radix-ui/react-dialog, @radix-ui/react-select, etc. Lateral move claim is accurate. ✅ |
| **CVA pattern continuity** | @corthex/ui already uses CVA + cn() (verified in packages/ui/). Migrating Subframe components to the same pattern is zero-friction. ✅ |
| **Library evaluation** | All 5 candidates are legitimate choices. Rejection rationales for Ark UI, React Aria, Headless UI are sound. Base UI watch-list status is fair. |
| **Migration phases** | P0→P1→P2 ordering is logical. Component-by-component with coexistence rules prevents big-bang risk. |
| **Variant mapping table** | Subframe's 7 Button variants → @corthex/ui's 6 variants with clear token substitutions. Practical and complete. |
| **Risk assessment** | Realistic — correctly identifies a11y regression as HIGH risk while Subframe→Radix API mismatch is LOW. |
| **Stitch file path** | Verified: `_corthex_full_redesign/phase-7-stitch/1_natural_organic/` exists with 42 TSX files (26 app + 16 admin) ✅ |
| **Dependency graph** | Accurate. @subframe/core wrapping Radix, @corthex/ui using CVA, specialized libs (xyflow, dnd-kit, codemirror, lightweight-charts) correctly identified as keep-in-place. |

---

## Scoring

| Criterion | Score | Notes |
|-----------|-------|-------|
| Library selection validity | 8/10 | shadcn/ui choice is well-justified. Evaluation matrix scores need math fix. |
| Bundle impact analysis | 7/10 | @subframe/core removal savings documented. But recharts transitive dep and react-day-picker already-bundled status missed. |
| Migration feasibility | 8/10 | Component-by-component strategy is realistic. Per-component checklist is thorough. Coexistence rules are clear. |
| Version accuracy | 7/10 | radix-ui unified package is correct direction. Specific versions plausible but should be verified at implementation. |
| Step 3-1 consistency | 6/10 | Button example has 2 direct contradictions with touch targets and animation rules. cmdk component missing. |
| **Average** | **7.2/10** | |

**Grade: B — CONDITIONAL PASS. Fix M1-M2 to secure Grade B cleanly.**

---

## Required Fixes

| # | Type | Fix | Impact |
|---|------|-----|--------|
| M1 | MAJOR | Recalculate all 5 weighted averages | Correctness |
| M2 | MAJOR | Button example: h-10→h-11, transition-all→transition-colors | Step 3-1 consistency |
| m1 | MINOR | Add cmdk CommandPalette to component inventory | Completeness |
| m2 | MINOR | Add recharts to new/retained dependencies | Bundle accuracy |
| m3 | MINOR | Note react-day-picker is already transitively bundled | Accuracy |
| m4 | MINOR | Add version verification note for radix-ui | Implementation guidance |

---

*End of tech-perf review — Phase 3-2*
