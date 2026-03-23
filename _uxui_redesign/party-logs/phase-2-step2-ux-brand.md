# Phase 2, Step 2-2 — Critic-A (UX & Brand) Review

**Reviewer:** ux-brand (Critic-A)
**Document:** `_uxui_redesign/phase-2-analysis/app-analysis.md`
**Date:** 2026-03-23
**Grade Step:** A (rigorous)

---

## Overall Assessment

**Verdict: CONDITIONAL PASS — 4 issues must be addressed (2 Major, 2 Minor)**

The app analysis is strong. The olive drawer as desktop sidebar port is the correct architectural decision — it's the only option that maintains brand identity on mobile. The bottom sheet analysis (3 snap points, Fitts's Law compliance, gesture vocabulary) is thorough and production-ready. The 7 mobile layout types with per-page strategies demonstrate genuine mobile UX thinking, not generic "stack everything" responsiveness.

Option C "Adaptive Commander" recommendation at 48/60 (80%) with 9-point lead is well-supported. However, two issues from the web analysis R1 recur, and the cross-document consistency has gaps.

---

## MAJOR Issues (Must Fix)

### M1. Option A Zero-Variance Scoring — Same Pattern as Web Analysis R1

**Location:** §1.8, §4 Comparison Matrix

Option A scores **exactly 6/10 in all 6 categories** (σ=0.00). This is the identical pattern flagged in Web Analysis R1 (M1), where Option B had zero variance. The writer corrected it in the web analysis revision but repeats the error here.

**Evidence of non-independent scoring:**
- §1.1 Gestalt: The 5-tab bottom nav is a universally proven pattern (Airbnb, Notion, Slack). Equal spacing with consistent tab treatment is correct Gestalt application. The "weak card figure/ground" (§1.1) is the same issue on all mobile options (no olive sidebar on any option by default). Penalizing Option A specifically for a problem shared by A and B is inconsistent. Gestalt should be 6 or 7 — not automatically 6.
- §1.6 UX: The 18-item "More" menu + bottom-to-top Fitts's violation is a genuine UX failure. This should score lower than 6 — perhaps 5, matching the web analysis's treatment of Option A's flat sidebar (also 5/10).

**Fix:** Re-evaluate Option A categories independently. Expected realistic scores: Gestalt 7 (proven 5-tab pattern), Hierarchy 6, Proportion 6, Contrast 5 (active tab near-invisible is critical), White Space 6, UX 5 (18-item More + Fitts violation). Total 35 (σ=0.75). The direction is similar but variance is honest.

### M2. Drawer Section Labels Still English — Contradicts Web Analysis R2 Fix

**Location:** §3.7 Component Tree, lines 821-840

The web analysis R2 fixed Korean section labels for desktop sidebar (명령, 조직, 도구, 분석, 소통). But the app analysis drawer component tree shows:

```tsx
<DrawerSection label="COMMAND">
<DrawerSection label="ORGANIZATION">
<DrawerSection label="SOCIAL">
```

This directly contradicts the web analysis fix and breaks the core brand unity argument. The writer's strongest claim for Option C is: *"The drawer layout is identical to the desktop sidebar"* (§3.6). If the drawer uses English labels while the sidebar uses Korean labels, they are NOT identical. The spatial memory transfer argument collapses.

**Fix:** Update drawer labels to match desktop sidebar: 명령, 조직, 도구, 분석, 소통. This is a simple find-replace that restores cross-document consistency.

---

## MINOR Issues (Should Fix)

### m1. Active Tab Contrast Scored as Fixed Before Implementation

**Location:** §3.4 Contrast — Score: 8/10

The document says: *"If the active tab fix from Section 1.4 is applied, Option C gets full marks here."* Then scores Contrast at 8/10. But the fix is conditional — it's a recommendation, not an implemented feature. The scoring framework should evaluate what the option *specifies*, not what it *could* become.

All three options share the same active tab contrast failure (#606C38 vs #6b705c = 1.12:1). Option C should score Contrast at 7/10 (same base problem, but olive drawer contrast is excellent → net improvement over A/B's 6). The +1 is for the drawer, not for a hypothetical tab fix.

**Impact:** Total drops from 48→47 if adjusted. Still 8-point lead over Option B.

### m2. Bottom Nav Korean Labels Unresolved

**Location:** §3.7 Component Tree, line 810-813

The bottom nav shows:
```tsx
<BottomNavItem to="/hub" icon={Home} label="Hub" />
<BottomNavItem to="/dashboard" icon={BarChart3} label="Dash" />
<BottomNavItem to="/agents" icon={Bot} label="Agents" />
<BottomNavItem to="/chat" icon={MessageSquare} label="Chat" />
<BottomNavItem icon={Menu} label="More" onClick={openDrawer} />
```

All labels are English. Vision §12.1 mandates Korean-first UI. §1.3 already identifies the Korean label truncation risk ("에이전트" = 5 syllables in 75px). The component tree should show Korean labels with the truncation solutions applied:

| Tab | Korean | Short Korean | Width at 12px |
|-----|--------|-------------|---------------|
| Hub | 허브 | 허브 | ~28px ✓ |
| Dashboard | 대시보드 | 대시 | ~28px ✓ |
| Agents | 에이전트 | 에이전트 | ~56px ⚠ (tight at 75px, test needed) |
| Chat | 채팅 | 채팅 | ~28px ✓ |
| More | 더보기 | 더보기 | ~42px ✓ |

The writer should take a position: Korean labels with truncation testing, or English labels with explicit justification (brand terms like "Hub" may stay English per Vision §12.1's hybrid approach).

---

## Positive Findings (What Works Well)

### P1. Olive Drawer = Brand Unity Winner
The comparison table in §3.5 (desktop vs mobile element mapping) is the strongest argument in the entire document. It systematically shows how Option C maps every desktop element to a mobile equivalent while maintaining brand identity. Options A and B have nothing equivalent.

### P2. Bottom Sheet as Modal Replacement
Replacing desktop Radix Dialog modals with Vaul bottom sheets on mobile is architecturally correct. The 3-snap-point system (25% peek, 50% detail, 100% full) provides progressive disclosure that modals cannot. The gesture vocabulary (swipe up/down) is already learned from iOS Maps and Google Sheets — zero learning curve.

### P3. FAB Per-Route Configuration
The `fabConfigs` partial record (§3.7) only shows FAB on pages with creation workflows. This context-sensitivity prevents UI clutter on analytics/monitoring pages. The `aria-label` on FAB is correct accessibility practice.

### P4. 7 Mobile Layout Types
The per-page mobile strategies (§3.6) are specifically reasoned:
- NEXUS read-only + pinch-zoom (not trying to edit a React Flow canvas on phone — pragmatic)
- Trading → 4 tabs (not 4 cramped panels on a 375px screen)
- Settings → accordion (not 10 horizontal tabs on mobile)

### P5. Dual Drawer Entry Points
Hamburger (top-left, stretch zone) + "More" tab (bottom-right, easy zone) ensures the drawer is always reachable regardless of thumb position. The Fitts's Law comparison (a + 3.84b vs a + 1.87b) quantifies the advantage.

---

## Score Verification

Writer's scores for Option C: Gestalt 8, Hierarchy 8, Golden 7, Contrast 8, White Space 8, UX 9 = **48/60**

My adjusted scores (pending m1 fix):

| Category | Writer | ux-brand | Delta | Rationale |
|----------|--------|----------|-------|-----------|
| Gestalt | 8 | 8 | 0 | Agree — drawer similarity + sheet proximity are strong |
| Hierarchy | 8 | 8 | 0 | Agree — layered states each have clear focal point |
| Golden Ratio | 7 | 7 | 0 | Agree — drawer 75:25 clean, snap points practical |
| Contrast | 8 | **7** | -1 | Active tab fix is conditional, not implemented |
| White Space | 8 | 8 | 0 | Agree — highest cross-device unity |
| UX | 9 | 9 | 0 | Agree — bottom sheet Fitts's + spatial memory |
| **TOTAL** | **48** | **47** | **-1** | Still clear winner (8-point lead) |

---

## Verdict

**CONDITIONAL PASS.** The analysis is strong and Option C recommendation is correct. Address M1-M2 before promoting to Phase 3.

| Priority | Issue | Impact |
|----------|-------|--------|
| **M1** | Option A zero-variance scoring (σ=0.00) | Methodology credibility (same error as Web R1) |
| **M2** | Drawer labels English vs desktop Korean | Cross-document consistency + brand unity argument |
| m1 | Contrast scored as if tab fix applied | Score integrity |
| m2 | Bottom nav labels language unresolved | Korean-first compliance |

---

*Critic-A (ux-brand) — Phase 2, Step 2-2 Review Complete*
