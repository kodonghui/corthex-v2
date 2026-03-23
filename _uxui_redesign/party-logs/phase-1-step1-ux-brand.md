# Critic-A (UX + Brand) Review — Phase 1, Step 1-1: Web Dashboard Layout Research

**Reviewer:** Critic-A (UX + Brand — Vision alignment, User convenience, Benchmark comparison)
**Document:** `_uxui_redesign/phase-1-research/web-dashboard/web-layout-research.md` (~1005 lines, 6 sections)
**Date:** 2026-03-23
**Verified:** Vision alignment (vision-identity.md §2-9), Benchmark consistency (benchmark-report.md), Page route completeness (project-context.yaml), Breakpoint specs (Vision §13.1)

---

## Dimension Scores

| Dimension | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| D1 Specificity | 15% | 9/10 | All 3 options include full ASCII layouts, implementable CSS grid code with token references, responsive breakpoints, and navigation groupings. Option C specifies 7 distinct content layout types with CSS. Command palette covers structure + keyboard shortcuts + fuzzy search scope. Zone B height calculation is precise (`4 items × 40px + padding ≈ 192px`). Minor: No specific `prefers-reduced-motion` handling for sidebar collapse animation (Vision §7.1 mandates this). |
| D2 Completeness | 25% | 8/10 | Competitive analysis covers 12 live products (7 AI agent platforms + 5 premium SaaS). All 23 routes accounted for. Page group mapping is complete. Command palette scope well-defined. **Gaps:** (1) No discussion of sidebar scroll behavior preferences (`overflow-y: auto` vs custom scrollbar styling on dark olive background — browser default scrollbar will visually clash). (2) No loading/skeleton states for sidebar badges. (3) No empty state for command palette ("No results for '...'" UX). (4) SketchVibe referenced in content layouts (line 869, 912) but absent from sidebar nav — needs clarification if it's a sub-route of Knowledge or a standalone page. |
| D3 Accuracy | 20% | 7/10 | **3 factual issues found.** See Issue List below. Key: Zone B contents mismatch between overview ASCII and detailed sidebar. Dual scoring system (Premium Score vs Weighted Total) produces contradictory rankings. Mobile breakpoint diverges from Vision §13.1. |
| D4 Implementability | 10% | 9/10 | CSS grid code is copy-paste ready with proper token references. `cmdk` library recommendation is correct (shadcn/ui compatible, Radix-based). Zustand persistence for sidebar state is appropriate. `grid-template-columns` transition browser support claim is accurate. 7 content layout types map cleanly to React components. |
| D5 Consistency | 20% | 7/10 | **Multiple cross-document inconsistencies.** (1) Breakpoint mismatch with Vision §13.1. (2) Classified page group assignment differs from writer's own page group table. (3) Option A uses "ORGANIZE" (line 106) while Options B/C use "ORGANIZATION" — inconsistent group label. (4) Zone B contents differ between two ASCII diagrams within the same option. |
| D6 Risk Awareness | 10% | 8/10 | Triple-scroll risk acknowledged (Zone A + Zone B + content). Zone B rigidity flagged. Command palette dev cost estimated at 2-3 story points. Sidebar scroll conflict mentioned for Option A. **Gap:** No discussion of keyboard trap risk in command palette (Vision §11.2 rule 4 — focus trap required). No mention of `aria-live` for badge count updates (Vision §11.2 rule 6). |

---

## Weighted Average: 7.90/10 — PASS (conditional on MUST-FIX)

Calculation: (9×0.15) + (8×0.25) + (7×0.20) + (9×0.10) + (7×0.20) + (8×0.10) = 1.35 + 2.00 + 1.40 + 0.90 + 1.40 + 0.80 = **7.85**

Adjusted to 7.90 for strong competitive analysis depth (12 products is well above typical 5-8).

---

## Issue List

### MUST-FIX

1. **[D3/D5] Zone B ASCII mismatch — two different item sets in the same document**

   Overview ASCII (lines 513-516) shows Zone B as:
   ```
   💬 Msg  │  🔔 Not  │  📈 Perf  │  💰 Cost
   ```
   Detailed sidebar ASCII (lines 811-816) shows Zone B as:
   ```
   💬 Messenger  │  📱 SNS  │  🏛 Agora  │  🔔 Notifications
   ```
   Rationale (line 954) says: "Zone B's 4 pinned items (Messenger, SNS, Agora, Notifications) match the SOCIAL page group exactly."

   **The detailed sidebar + rationale are consistent with each other. The overview ASCII is wrong.** Fix the overview ASCII to match: Messenger, SNS, Agora, Notifications.

2. **[D3/D5] Dual scoring system creates contradictory impressions**

   Each option gets two scores that don't align:
   | Option | Premium Score | Weighted Total | Gap |
   |--------|-------------|---------------|-----|
   | A | 8.5/10 | 7.55/10 | -0.95 |
   | B | 8.8/10 | 7.75/10 | -1.05 |
   | C | 9.2/10 | 8.75/10 | -0.45 |

   The Premium Scores use informal deductions ("‑0.5 sidebar density") without weighted criteria. The Comparison Matrix uses explicit 9-criterion weighted scoring. These produce different rankings (Option B beats A by +0.3 in Premium but only +0.20 in Weighted).

   **Fix:** Remove the per-option "Premium Score" and keep only the Comparison Matrix weighted totals. One scoring system, one source of truth. If the per-option evaluations are useful, convert them to prose pros/cons (already provided) without a numerical score.

3. **[D5] Mobile breakpoint diverges from Vision §13.1**

   Vision document defines:
   - `< 640px` = Mobile (sm) — single column, hamburger
   - `640–1023px` = Tablet (md) — single column, hamburger
   - `≥ 1024px` = Desktop (lg) — sidebar visible

   Option C uses:
   - `< 768px` = Mobile — overlay sidebar
   - `768–1023px` = Tablet — collapsed sidebar (icon-only)
   - `≥ 1024px` = Desktop — full sidebar

   This introduces a 768px breakpoint that Vision never defines, and changes tablet behavior from "hamburger nav" (Vision) to "collapsed sidebar" (Option C). The 768–1023px collapsed sidebar is arguably better UX for tablets, but it **must be flagged as a deviation from Vision spec** and either: (a) update Vision to add the 768px intermediate breakpoint, or (b) align with Vision's 1024px single cutoff.

### SHOULD-FIX

4. **[D5] Classified page in wrong sidebar group**

   Writer's own page groups (line 41) put Classified under SETTINGS. But Option C's sidebar (line 808) puts Classified under INTELLIGENCE. This is inconsistent within the same document. Classified content (encrypted archives) is more INTELLIGENCE than SETTINGS semantically — if the writer prefers INTELLIGENCE, update the page groups table at the top to match.

5. **[D2] Sidebar scrollbar visual clash**

   Dark olive sidebar (`#283618`) with default browser scrollbar (light gray on most OSes) will create a visual inconsistency. Should specify:
   ```css
   .sidebar-zone-a::-webkit-scrollbar { width: 4px; }
   .sidebar-zone-a::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
   ```
   Or note "custom scrollbar styling deferred to Phase 2 implementation."

6. **[D6] Command palette accessibility — focus trap + ARIA**

   Vision §11.2 rule 4 requires modal focus trap. Vision §11.2 rule 6 requires `aria-live` for dynamic content. The command palette spec has neither:
   - Add: `role="dialog"`, `aria-modal="true"`, `aria-label="명령 팔레트"` on `.command-palette`
   - Add: focus trap (Escape closes, Tab cycles within)
   - Note: `cmdk` library handles most of this natively — just mention it.

7. **[D1] Missing `prefers-reduced-motion` for sidebar transitions**

   Option C CSS (line 548) has `transition: grid-template-columns var(--transition-speed) ease` on the app shell. Vision §7.1 mandates all animations respect `prefers-reduced-motion`. Add:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .app-shell { transition: none; }
     .sidebar { transition: none; }
   }
   ```

### NICE-TO-HAVE

8. **[UX] Zone B item selection rationale — is SOCIAL the right group to pin?**

   SNS (social feed) and Agora (debate platform) are not real-time-critical in the same way as Messenger and Notifications. A CEO might check Dashboard or Costs more frequently than Agora. The current rationale ("Zone B = SOCIAL group") is clean categorically but not necessarily optimal for user task frequency.

   Consider: Could Zone B be "real-time items" (Messenger, Notifications + 2 configurable user-pinned pages) instead of a hard-coded group? Even a brief note acknowledging this trade-off would strengthen the recommendation.

9. **[UX] Breadcrumbs absent from Option C topbar**

   Option B explicitly includes breadcrumbs (line 389-404) for wayfinding on deep pages (Hub > Session #12 > Handoff). Option C's topbar only shows page title. For a 23-page app with nested views, breadcrumbs provide valuable spatial orientation. Recommend adding breadcrumb support in the topbar specification for Option C, at minimum for Hub and Messenger which have sub-views.

10. **[Brand] Group names as brand vocabulary**

    The 5 section headers (COMMAND, ORGANIZATION, TOOLS, INTELLIGENCE, SOCIAL) will be visible to the CEO daily. "INTELLIGENCE" overlaps with the Sage archetype vocabulary but could be confused with "AI intelligence." Consider whether these headers should use the brand terminology from Vision §1.4 more explicitly — e.g., does "COMMAND" feel right alongside the Hub/NEXUS naming convention? This is minor — the current names are functional and clear.

---

## UX Advocacy Verdict

**Strong research with solid recommendation.** Option C is the right choice for CORTHEX's 23-page app. The dual-zone sidebar solves the 23-page density problem without hiding pages behind "More" menus. The command palette is correctly identified as necessary, not luxury. The 7 content layout types show genuine understanding that Dashboard ≠ NEXUS ≠ Messenger in layout needs.

**Three strengths worth highlighting:**

1. **Competitive analysis is exceptional.** 12 live products analyzed (7 direct AI competitors + 5 premium SaaS benchmarks) — this exceeds typical research depth. The insight that "all AI agent platforms use left sidebar — no exceptions" provides strong validation. The observation that CORTHEX's Natural Organic palette is unique among competitors is brand-critical.

2. **Archetype mapping works.** The Ruler archetype → dual-zone sidebar → "CEO sees organization hierarchy + stays connected to real-time comms" is not decorative theory — it's a functional design rationale that will guide trade-off decisions during implementation. The "Controlled Nature" color mapping (dark olive = authority, cream = openness) correctly extends the Vision document's design philosophy.

3. **7 content layout types** is the most valuable contribution. Most layout research proposes one generic content grid. This document recognizes that a 23-page app needs dashboard grids, master-detail, full canvas, CRUD lists, tabbed views, multi-panel, and feed layouts. This saves significant Phase 2 time.

**Two concerns:**

1. **Triple-scroll UX risk** is acknowledged but under-explored. Zone A scrolling + content scrolling is unavoidable. But on a 13" laptop at 1080p, will Zone A actually need to scroll? 18 items × 40px + 5 section headers × 24px = 840px. Brand (56px) + search (48px) + Zone B (192px) + Settings/Profile (80px) = 376px. Total sidebar: 1216px. On 1080px viewport: **136px overflow — Zone A will scroll.** This means trackpad users will frequently hit scroll-target ambiguity between sidebar and content. The document should propose a scroll indicator (subtle fade gradient at Zone A bottom) or alternative (collapsible section groups within Zone A).

2. **The Zone B selection feels categorical rather than user-task-driven.** Pinning all 4 SOCIAL items is clean taxonomically, but a user-centric analysis might pin Messenger + Notifications (high real-time value) and let users configure the other 2 slots. This is a NICE-TO-HAVE, not a blocker.

---

## Brand Consistency Verdict

**"Controlled Nature" is correctly applied.** The dark olive sidebar as authority zone and cream content as working space directly extends the Vision §2.3 design philosophy. The sidebar → content visual hierarchy maps to the Ruler archetype's top-down command structure. The 8px grid compliance is maintained throughout all three options.

**One brand concern:** The document doesn't address how the CORTHEX brand mark (text logo "CORTHEX v3" at top of sidebar) transitions when sidebar collapses. Vision §4.3 rule 4 upgraded brand to 18px/600 weight. In collapsed (56px icon-only) mode, the brand text disappears entirely. Should a compact icon/mark appear? This was flagged in Phase 0 review (brand mark direction) and remains unresolved.

---

## Benchmark Comparison Verdict

The competitive landscape correctly extends the Phase 0.5 benchmark (15 sites) with 7 new AI-specific platforms. Key benchmark alignments:

| Benchmark Pattern | Option C Adoption | Correct? |
|-------------------|-------------------|----------|
| Linear sidebar-driven dashboard | Yes — sidebar + content grid | ✓ |
| Linear `[` keyboard shortcut | Yes — collapse toggle | ✓ |
| Linear Cmd+K command palette | Yes — cmdk library | ✓ |
| Notion 280px sidebar width | Yes — Korean text friendly | ✓ |
| shadcn/ui component philosophy | Yes — Radix + Tailwind, zero-runtime | ✓ |
| Vercel's landing structure | Not addressed (landing is separate) | ✓ (correctly scoped) |

**No benchmark conflicts found.** Option C synthesizes Linear (keyboard-first), Notion (sidebar structure), and CrewAI (command center metaphor) without copying any single product.

---

## Final Score: 7.90/10 — PASS

Conditional on 3 MUST-FIX items. After fixes, expected score: **8.5+/10**.

---

## R2 Re-Score (Post-Fix Verification)

**Date:** 2026-03-23
**Trigger:** Writer applied all 3 MUST-FIX + 4 SHOULD-FIX + 1 bonus (Zone A overflow mitigation)

### Fix Verification

| # | Issue | Status | Verification |
|---|-------|--------|-------------|
| 1 | Zone B ASCII mismatch | ✅ FIXED | Lines 512-515: Msnr/SNS/Agra/Noti — now matches detailed sidebar (lines 836-839) and rationale (line 979) |
| 2 | Dual scoring removed | ✅ FIXED | Line 950: "See Section 4 Comparison Matrix for weighted scoring" — single source of truth |
| 3 | Breakpoint aligned | ✅ FIXED | Line 756-779: Single `< 1024px` overlay breakpoint with comment "aligned with Vision §13.1" — intermediate 768px removed |
| 4 | Classified grouping | ✅ FIXED | Line 42: Separate CLASSIFIED row in page groups table. Line 842: Classified in bottom-fixed area next to Settings. Consistent throughout. |
| 5 | Scrollbar styling | ✅ FIXED | Lines 579-593: WebKit (4px, white/15, transparent track) + Firefox `scrollbar-width: thin` + `scrollbar-color`. Both engines covered. |
| 6 | Command palette a11y | ✅ FIXED | Lines 711-714: ARIA comment block — `role="combobox"`, `role="listbox"`, `role="option"`, `aria-activedescendant`, focus trap via Radix Dialog, ESC close. Vision §11.2 satisfied. |
| 7 | `prefers-reduced-motion` | ✅ FIXED | Lines 781-795: Full `@media (prefers-reduced-motion: reduce)` block — app-shell, sidebar, nav-item, command-palette-overlay all set to `transition: none` / `animation: none`. Vision §7.1 satisfied. |
| Bonus | Zone A overflow | ✅ ADDED | Line 946: Collapsible section groups + gradient fade scroll indicator specified as mitigation for 1080p viewport overflow. |

### Updated Dimension Scores

| Dimension | Weight | R1 Score | R2 Score | Change | Rationale |
|-----------|--------|----------|----------|--------|-----------|
| D1 Specificity | 15% | 9/10 | 9/10 | — | `prefers-reduced-motion` block added (fix 7). Previous gap closed. Score already at 9. |
| D2 Completeness | 25% | 8/10 | 9/10 | +1 | Scrollbar styling (fix 5), a11y patterns (fix 6), overflow mitigation (bonus) all added. Remaining minor gaps: SketchVibe sidebar clarification, badge loading states — not score-impacting. |
| D3 Accuracy | 20% | 7/10 | 9/10 | +2 | All 3 factual issues resolved. Zone B ASCII consistent. Single scoring system. Breakpoint aligned with Vision. No remaining inaccuracies found. |
| D4 Implementability | 10% | 9/10 | 9/10 | — | Already strong. Scrollbar CSS adds cross-browser coverage. |
| D5 Consistency | 20% | 7/10 | 9/10 | +2 | Breakpoint aligned with Vision §13.1. Classified group consistent with page groups table. Zone B ASCIIs now match. Minor residual: "ORGANIZE" (Option A, line 107) vs "ORGANIZATION" (Options B/C) — within non-recommended option, not score-impacting. |
| D6 Risk Awareness | 10% | 8/10 | 9/10 | +1 | Focus trap + ARIA noted for command palette (fix 6). Reduced-motion compliance added (fix 7). Overflow mitigation with concrete proposals (bonus). |

### R2 Weighted Average: 8.85/10 — STRONG PASS

Calculation: (9×0.15) + (9×0.25) + (9×0.20) + (9×0.10) + (9×0.20) + (9×0.10) = 1.35 + 2.25 + 1.80 + 0.90 + 1.80 + 0.90 = **9.00**

Adjusted to 8.85 for two remaining minor gaps: (1) SketchVibe sidebar presence unresolved, (2) "ORGANIZE" label inconsistency in Option A.

### Remaining NICE-TO-HAVE (not blocking)

Items 8-10 from original review remain as suggestions for Phase 2 refinement:
- Zone B configurable pinning (vs hard-coded SOCIAL group)
- Breadcrumbs in Option C topbar for deep navigation
- Group names as brand vocabulary alignment

### Verdict

**All blocking issues resolved. Document is ready for Phase 2 implementation spec.** The writer addressed every issue thoroughly — particularly the Zone A overflow mitigation (collapsible sections + gradient fade) which goes beyond the original request and strengthens the UX.

---

*End of Critic-A Review — Phase 1, Step 1-1 (R2)*
