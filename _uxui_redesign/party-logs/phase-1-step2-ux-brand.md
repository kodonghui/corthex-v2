# Critic-A (UX + Brand) Review — Phase 1, Step 1-2: App (Mobile/Tablet) Layout Research

**Reviewer:** Critic-A (UX + Brand — Vision alignment, User convenience, Benchmark comparison)
**Document:** `_uxui_redesign/phase-1-research/app/app-layout-research.md` (~1259 lines, 6 sections)
**Date:** 2026-03-23
**Verified:** Vision alignment (vision-identity.md §4.2, §5, §6, §7, §13), Desktop layout consistency (Step 1-1), Breakpoint specs (Vision §13.1), Touch target compliance (WCAG 2.5.8)

---

## Dimension Scores

| Dimension | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| D1 Specificity | 15% | 9/10 | All 3 options have ASCII layouts (mobile + tablet), implementable CSS, and specific library recommendations (Vaul ~8kB, cmdk, Radix Accordion). Page-specific mobile strategies table (line 1079-1103) maps all 23 pages to mobile layout + interaction pattern — excellent detail. Safe area tokens (`env(safe-area-inset-*)`) are precise. PWA standalone mode detection included. Touch targets explicitly 44×44px throughout. Minor gap: FAB (Floating Action Button) mentioned in prose (lines 1085-1086, 1162) but no CSS specification provided. |
| D2 Completeness | 25% | 9/10 | PWA vs Native decision table is well-justified. Competitive analysis covers 7 mobile products including Slack's 5→3 tab reduction insight. 7 mobile layout types mirror desktop's 7 types — cross-device consistency. iOS zoom prevention (16px font), `overscroll-behavior-y`, `100dvh`, `-webkit-overflow-scrolling` all covered. Single scoring system (lesson from Step 1-1). **Gaps:** (1) No install prompt / add-to-homescreen UX flow. (2) No offline fallback page design. (3) No tablet landscape-specific layout (only portrait widths addressed). |
| D3 Accuracy | 20% | 8/10 | Breakpoints correctly match Vision §13.1 (< 640px, 640-1023px, ≥ 1024px). Page adaptations match Vision §13.2 (Trading→tabs, Messenger→toggle, NEXUS→pinch-zoom). **2 inaccuracies:** (1) Bottom nav label `font-size: 11px` (lines 253, 753) — Vision §4.2 defines `--text-xs: 12px` as the minimum type token. 11px violates the type scale. (2) Drawer overlay uses `rgba(0,0,0,0.5)` (line 832) — Vision §13.2 specifies "backdrop blur" for mobile sidebar overlay, which requires `backdrop-filter: blur()`. |
| D4 Implementability | 10% | 9/10 | CSS is production-ready with correct token references. Vaul library choice is specific (emilkowalski, shadcn/ui Drawer compatible). React Flow read-only config is precise (`nodesDraggable={false}`, `nodesConnectable={false}`). Radix Dialog for drawer a11y is correct. Settings→Accordion adaptation is practical. iOS zoom fix (16px font) is a known gotcha handled correctly. |
| D5 Consistency | 20% | 8/10 | Drawer uses same olive dark (`#283618`) + sidebar groups as desktop — excellent brand continuity. Same 5 groups (COMMAND/ORGANIZATION/TOOLS/INTELLIGENCE/SOCIAL) + bottom-fixed Classified/Settings. Badge styling consistent. **Issues:** (1) 11px label violates Vision type scale. (2) No backdrop blur on drawer overlay vs Vision spec. (3) Hamburger (☰ in header) and More tab (⋯ in bottom nav) — document doesn't explicitly state they open the same drawer. Two triggers for one action needs clarification. |
| D6 Risk Awareness | 10% | 8/10 | Pull-down search discoverability risk is acknowledged in Cons (line 1166) — good self-awareness. Bottom sheet Vaul dependency and size noted. NEXUS read-only on mobile is pragmatic (not trying to force canvas editing on touch). Customizable tabs deferred to v3.1 (line 1225). **Gap:** Pull-down gesture has no mitigation plan — the document admits it's "hidden" but doesn't propose a solution (onboarding tooltip? visual hint on first visit?). For a non-developer CEO, an undiscoverable gesture is a dead feature. |

---

## Weighted Average: 8.50/10 — PASS

Calculation: (9×0.15) + (9×0.25) + (8×0.20) + (9×0.10) + (8×0.20) + (8×0.10) = 1.35 + 2.25 + 1.60 + 0.90 + 1.60 + 0.80 = **8.50**

---

## Issue List

### MUST-FIX

1. **[D3/D5] Bottom nav label `font-size: 11px` violates Vision type scale minimum**

   Lines 253 and 753 both set `.bottom-nav-item { font-size: 11px }`. Vision §4.2 defines `--text-xs: 12px` as the smallest token in the type scale. 11px is below the design system floor.

   **Fix:** Change to `font-size: 12px` (or reference `var(--text-xs)`). This also improves readability — 11px Korean text labels (허브, 대시보드) are particularly hard to read on high-DPI mobile screens.

### SHOULD-FIX

2. **[D6] Pull-down search gesture lacks visual affordance**

   The document proposes a Slack-inspired "pull down = search trigger" (line 584) but admits it's "hidden — no visual affordance until user discovers gesture" (line 1166). For a non-developer CEO (CLAUDE.md user profile), an undiscoverable gesture is effectively nonexistent.

   **Options:**
   - (a) Add a subtle visual hint: a thin search bar placeholder that appears on scroll-to-top (like Slack's compressed search bar)
   - (b) Show a "Pull down to search" tooltip on first 3 visits, stored in `localStorage`
   - (c) Drop the pull-to-search entirely and rely on header 🔍 icon + drawer — simpler, more discoverable

   Recommendation: Option (c) is simplest. The header search icon is already visible, and the desktop ⌘K is mapped to a visible search bar in the drawer. Pull-to-search adds complexity without proportional value for this user profile.

3. **[D5] Hamburger + More tab — clarify same trigger**

   Header hamburger [☰] (line 580) and bottom "More" tab (line 606) presumably both open the olive drawer. Line 1165 hints at this: "mitigated by bottom 'More' tab also opening drawer." But this relationship is never explicitly stated in the CSS or layout spec.

   **Fix:** Add a one-liner in the layout section: "Both the ☰ hamburger button (header) and ⋯ More tab (bottom nav) open the same drawer overlay. This provides two discovery paths for the full navigation."

4. **[D5] Drawer overlay missing `backdrop-filter: blur()`**

   Vision §13.2 specifies "Hamburger → overlay slide-in (backdrop blur)." The drawer overlay CSS (line 832) uses only `background: rgba(0, 0, 0, 0.5)` without backdrop blur.

   **Fix:** Add `backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);` to `.more-drawer-overlay`. This also visually differentiates the drawer overlay from the bottom sheet overlay (which can remain non-blurred).

5. **[D1] FAB (Floating Action Button) referenced but not specified**

   FAB is mentioned as a key interaction in Agents (+ New Agent), Departments (+ New Dept), Files (+ Upload) — lines 1085, 1086, 1162. But no CSS is provided for FAB positioning, size, z-index, or safe-area avoidance. It needs to sit above the bottom nav but below the bottom sheet.

   **Fix:** Add a `.fab` CSS block with: `position: fixed; bottom: calc(var(--bottom-nav-height) + var(--safe-bottom) + 16px); right: 16px; width: 56px; height: 56px; border-radius: 9999px; background: var(--accent-primary); z-index: 25;` (below bottom-nav z-index 30).

### NICE-TO-HAVE

6. **[D5] SketchVibe in drawer but not in project-context.yaml**

   Drawer (line 1131) includes SketchVibe under TOOLS. project-context.yaml has no `/sketchvibe` route. Same question as Step 1-1 — is SketchVibe a standalone page or a sub-feature of Knowledge? Clarify.

7. **[UX] Tab order rationale: why Dashboard #2?**

   Option A orders: Hub → Chat → Agents → Dash → More.
   Option C orders: Hub → Dash → Agents → Chat → More.

   Option C puts Dashboard at position #2 (thumb-zone sweet spot on right-handed use). This implies the CEO checks status more than they chat. This is likely correct for the Ruler archetype (monitoring > communicating), but a brief rationale would strengthen the choice.

8. **[UX] Tablet landscape layout opportunity**

   Document covers tablet portrait (640-1023px) but doesn't address landscape orientation on 10"+ tablets. In landscape at 1024px+, the desktop sidebar would appear — this may be the correct behavior, but worth an explicit note: "Tablet landscape ≥ 1024px triggers desktop layout with full sidebar."

---

## UX Advocacy Verdict

**Well-structured mobile research with a strong recommendation.** Option C correctly combines bottom tabs (speed) + drawer (completeness) + bottom sheet (native feel). The page-specific strategies table is the most valuable section — mapping all 23 pages to mobile layout + interaction ensures nothing is overlooked in Phase 2.

**Four strengths worth highlighting:**

1. **PWA decision is correct and well-justified.** The comparison table (lines 13-23) covers all relevant factors. CORTHEX needs no native APIs (camera, Bluetooth, NFC). Single React codebase with PWA standalone mode is the right architecture choice. The insight that "AI agent platforms have NO mobile optimization" (line 84) makes CORTHEX mobile a genuine competitive differentiator.

2. **Drawer = portable sidebar is brand-brilliant.** Using the same olive dark (`#283618`) sidebar styling on mobile maintains the "Controlled Nature" brand identity across devices. When the CEO opens the drawer on mobile, it feels like the same command center — not a different app. This is the strongest brand-consistency decision in the document.

3. **Bottom sheet replacing modals is UX-correct.** Bottom sheets (Vaul, 3 snap points) are the established mobile pattern for contextual detail views. Agent cards → bottom sheet detail, NEXUS nodes → bottom sheet info, filter panels → bottom sheet options. This avoids the "modal on mobile = unusable" problem. The 25%/50%/100% snap points give users control over how much detail they want.

4. **NEXUS read-only is pragmatic.** Rather than forcing React Flow canvas editing on touch (which would be terrible UX), the document correctly makes NEXUS view-only on mobile with pinch-zoom and a "Edit on desktop" banner. This is the right constraint acknowledgment.

**Two concerns:**

1. **Pull-to-search is a ghost feature.** Without a visual affordance, the non-developer CEO will never discover it. Slack gets away with pull-to-search because (a) Slack is a daily-use app with high feature discovery over time, and (b) Slack shows a compressed search bar at the scroll top that hints at the gesture. CORTHEX mobile doesn't have either advantage yet. My recommendation: drop pull-to-search for v3 launch and revisit when usage data shows whether the header 🔍 is sufficient. Simpler > clever.

2. **Two navigation triggers (hamburger + More) are correct but unexplained.** The fact that both ☰ and ⋯ open the same drawer is actually good UX — it gives users two discovery paths. But the document should state this explicitly so implementers don't accidentally create two different navigation systems.

---

## Brand Consistency Verdict

**Desktop ↔ Mobile brand continuity is excellent.** The olive dark drawer directly mirrors the desktop sidebar — same color, same groups, same icons, same badges. The bottom nav uses `--accent-primary` (#606C38) for active state, matching the desktop sidebar active indicator. The cream background (`#faf8f5`) is consistent. The header uses the same border treatment (`--border-primary`).

**One type scale deviation:** 11px bottom nav labels break the Vision type scale (12px minimum). Korean labels at 11px on mobile screens will be particularly strained. This is the only brand-breaking issue.

**Tab selection aligns with Ruler archetype:**
| Tab | Ruler Trait | Daily Action |
|-----|------------|-------------|
| Hub | Command | Issue orders to agents |
| Dashboard | Monitor | Check organizational health |
| Agents | Manage | Review team performance |
| Chat | Communicate | Direct agent dialogue |
| More | Access all | Full organizational view |

This is a command-first, monitor-second ordering that correctly expresses the Ruler's priority hierarchy.

---

## Benchmark Comparison Verdict

The mobile competitive analysis correctly extends the desktop benchmark with mobile-specific products. Key alignments:

| Benchmark Pattern | Option C Adoption | Correct? |
|-------------------|-------------------|----------|
| Airbnb 5-tab bottom nav | Yes — 5 tabs, proven engagement | ✓ |
| Slack pull-down search | Yes — but hidden (see concern) | ⚠ (needs affordance) |
| Notion bottom sheet for details | Yes — Vaul 3 snap points | ✓ |
| Discord swipe layers | No — simpler tab navigation chosen | ✓ (appropriate constraint) |
| Linear customizable tabs | Deferred to v3.1 (line 1225) | ✓ (pragmatic) |
| TradingView chart stacking | Yes — Trading panels → tab switcher | ✓ |

**Key insight adopted:** "AI agent platforms have NO mobile optimization" (Dify, CrewAI, Langflow) — CORTHEX's mobile experience is a genuine differentiator. This is a valuable competitive intelligence finding.

---

## Final Score: 8.50/10 — PASS

1 MUST-FIX (11px→12px label size), 4 SHOULD-FIX (pull-to-search affordance, hamburger+More clarification, backdrop blur, FAB CSS). After fixes, expected score: **9.0+/10**.

---

## R2 Re-Score (Post-Fix Verification)

**Date:** 2026-03-23
**Trigger:** Writer applied 1 MUST-FIX + 4 SHOULD-FIX

### Fix Verification

| # | Issue | Status | Verification |
|---|-------|--------|-------------|
| 1 | 11px → 12px type scale | ✅ FIXED | 0 occurrences of `11px` remain. 4 occurrences of `12px` with `/* --text-xs (Vision §4.2 type scale floor) */` comment at lines 252, 275, 753, 781. |
| 2 | Pull-down search dropped | ✅ FIXED | Removed from ASCII diagram and interaction spec. Replaced with "Header 🔍 icon provides universal search access (pull-down gesture deferred to v3.1 pending usage data)" at lines 1191, 1254. Slack reference retained in Sources (line 1269) — correct, it's a benchmark citation not a feature claim. |
| 3 | Hamburger + More = same drawer | ✅ FIXED | Explicit statement at line 1193: "[☰] hamburger and [⋯ More] tab both open the same olive drawer — two entry points, one destination, no confusion." Also reinforced in Cons (line 1201). |
| 4 | Drawer backdrop blur | ✅ FIXED | Lines 866-867: `backdrop-filter: blur(8px)` + `-webkit-backdrop-filter: blur(8px)` on `.more-drawer-overlay`. Vision §13.2 satisfied. |
| 5 | FAB CSS added | ✅ FIXED | Lines 829-858: Full `.fab` specification — `position: fixed`, `bottom: calc(bottom-nav + safe-bottom + 16px)`, `z-index: 30`, 56×56px, `border-radius: 9999px`, `--accent-primary` background, `:active` scale(0.95), `:focus-visible` white outline. Icon size 24×24px. |

### Updated Dimension Scores

| Dimension | Weight | R1 Score | R2 Score | Change | Rationale |
|-----------|--------|----------|----------|--------|-----------|
| D1 Specificity | 15% | 9/10 | 9/10 | — | FAB CSS now specified (fix 5). Already at 9 — no gap remaining. |
| D2 Completeness | 25% | 9/10 | 9/10 | — | Pull-to-search cleanly deferred with rationale (fix 2). FAB adds interaction completeness (fix 5). Minor remaining gaps (install prompt, offline fallback) are not score-impacting for research phase. |
| D3 Accuracy | 20% | 8/10 | 9/10 | +1 | Type scale violation fixed (fix 1). Backdrop blur aligned with Vision §13.2 (fix 4). No remaining inaccuracies. |
| D4 Implementability | 10% | 9/10 | 9/10 | — | FAB CSS is production-ready. Backdrop blur has webkit prefix for Safari. Already strong. |
| D5 Consistency | 20% | 8/10 | 9/10 | +1 | Type scale now consistent with Vision §4.2. Backdrop blur matches Vision §13.2. Hamburger+More relationship explicitly documented (fix 3). No remaining cross-document conflicts. |
| D6 Risk Awareness | 10% | 8/10 | 9/10 | +1 | Pull-to-search risk eliminated by deferral (fix 2) — simplest mitigation. Deferred to v3.1 with "pending usage data" qualifier shows data-driven approach. |

### R2 Weighted Average: 9.00/10 — STRONG PASS

Calculation: (9×0.15) + (9×0.25) + (9×0.20) + (9×0.10) + (9×0.20) + (9×0.10) = 1.35 + 2.25 + 1.80 + 0.90 + 1.80 + 0.90 = **9.00**

### Remaining NICE-TO-HAVE (not blocking)

Items 6-8 from original review remain as Phase 2 refinement suggestions:
- SketchVibe route clarification
- Tab order rationale documentation
- Tablet landscape explicit note

### Verdict

**All blocking issues resolved. Document is ready for Phase 2 implementation spec.** Clean fixes — the pull-to-search deferral is the right call (simpler launch, revisit with data). The FAB specification and backdrop blur bring the CSS to production-ready quality.

---

*End of Critic-A Review — Phase 1, Step 1-2 (R2)*
