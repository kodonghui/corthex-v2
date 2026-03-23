# Critic-B Review — Step 2-2: App (Mobile/Tablet) Layout Deep Analysis

**Reviewer:** Visual Hierarchy + Accessibility (Grade A Rigor)
**Document:** `_uxui_redesign/phase-2-analysis/app-analysis.md` (~1099 lines)
**Date:** 2026-03-23

---

## 1. Scoring Methodology Verification

The 6-category framework is correctly reused from Step 2-1, with **mobile-specific evaluation focus** added per category (thumb zone, safe areas, touch targets, content density). This adaptation is appropriate — mobile design principles share foundations with desktop but have unique constraints.

**Approved.** No methodology concerns.

---

## 2. Score Verification — Category by Category

### 2.1 Option A "Hub-First" — 36/60 (60.0%)

| Category | Writer Score | My Assessment | Delta | Notes |
|----------|-------------|---------------|-------|-------|
| Gestalt | 6/10 | **6/10** | 0 | "More" full-screen breaks continuity; weak card figure/ground without sidebar |
| Visual Hierarchy | 6/10 | **6/10** | 0 | Chrome (104px) outweighs content in blur test; header/content heading scale competition |
| Golden Ratio | 6/10 | **6/10** | 0 | Safe area penalty (84→72%); Korean label truncation risk at 75px |
| Contrast | 6/10 | **6/10** | 0 | Active tab #606C38 vs #6b705c at 1.12:1 is devastating — correctly penalized |
| White Space + Unity | 6/10 | **6/10** | 0 | Olive sidebar absent on mobile = broken brand unity — key weakness |
| UX Deep Dive | 6/10 | **6/10** | 0 | 18-item More menu → Hick's 4.25; bottom→top Fitts's violation |
| **TOTAL** | **36/60** | **36/60** | **0** | Agreed |

**Note on uniform 6s (σ=0.00):** Unlike the web analysis's old Option B uniform-7s which I flagged, here each 6 is independently justified with distinct evidence. The uniform score reflects that this is a consistently mediocre mobile adaptation — no standout failure, no standout strength. Accepted.

---

### 2.2 Option B "Search-Centric" — 39/60 (65.0%)

| Category | Writer Score | My Assessment | Delta | Notes |
|----------|-------------|---------------|-------|-------|
| Gestalt | 7/10 | **7/10** | 0 | Spotlight grouping strong; "Me" dual-purpose similarity break noted |
| Visual Hierarchy | 6/10 | **6/10** | 0 | Same chrome-over-content; Spotlight input hierarchy correct on Search tab |
| Golden Ratio | 6/10 | **6/10** | 0 | "Me" tab proportion mismatch (92% nav, 8% profile) well-identified |
| Contrast | 6/10 | **6/10** | 0 | Same active tab problem; search utility not visually differentiated |
| White Space + Unity | 7/10 | **7/10** | 0 | Spotlight↔Cmd+K cross-device unity bridge — genuine advantage |
| UX Deep Dive | 7/10 | **7/10** | 0 | Spotlight 39% Hick's improvement via typing; "Me" tab still 18-item dump |
| **TOTAL** | **39/60** | **39/60** | **0** | Agreed |

**Option B: PASS** — scores show appropriate variance (σ=0.52), strengths in Gestalt/Unity/UX from Spotlight feature correctly elevated.

---

### 2.3 Option C "Adaptive Commander" — Detailed Scrutiny

| Category | Writer Score | My Assessment | Delta | Notes |
|----------|-------------|---------------|-------|-------|
| Gestalt | 8/10 | **8/10** | 0 | Olive drawer cross-device similarity is genuinely architectural; bottom sheet proximity chain excellent |
| Visual Hierarchy | 8/10 | **7/10** | **-1** | See analysis below |
| Golden Ratio | 7/10 | **7/10** | 0 | Sheet snap points practical; drawer 75:25 clean; Korean label risk acknowledged |
| Contrast | 8/10 | **8/10** | 0 | Olive drawer restores brand contrast; FAB passes AA; active tab fix prescribed and applies to all options equally |
| White Space + Unity | 8/10 | **8/10** | 0 | Desktop-mobile brand unity table is compelling and unique to this option |
| UX Deep Dive | 9/10 | **8/10** | **-1** | See analysis below |
| **TOTAL** | **48/60** | **46/60** | **-2** | |

#### Visual Hierarchy 8→7: Resting State Still Fails Blur Test

The writer acknowledges (line 586-587):
> "Primary: Same bottom nav issue as Options A and B — chrome contrast dominates"

This is the resting state — the majority of the CEO's mobile interaction time (no drawer open, no sheet open). The layered states (drawer/sheet) solve hierarchy WHEN ACTIVE, but the resting state is the default experience.

Same argument as web R1: if the resting-state blur test fails, it's fundamental, not "minor gaps." The writer correctly scored web Option C Hierarchy at 7 for this exact reason. **Mobile should follow the same standard.**

Option C still deserves higher than A/B (6) because:
- FAB provides a persistent contrast element (56px sage circle)
- Drawer/sheet states have excellent hierarchy
- The drawer and sheet states represent more interaction time on mobile than desktop

But 8 ("Strong — minor gaps") is not justified when the primary resting state has the same chrome-over-content issue as the options scored 6. **7/10.**

#### UX Deep Dive 9→8: Bottom Sheet & FAB Are Portable

Following the same principle from web R1 (Cmd+K portability):

- **Bottom sheet (Vaul):** Can be added to any option. Option A or B could use Vaul bottom sheets for detail views.
- **FAB:** Can be added to any option. Page-specific FAB configs are route-dependent, not option-dependent.
- **7 mobile layout types:** Could be defined for any option. The comprehensive strategy is an analysis-depth advantage, not an architectural one.

What IS architecturally unique to Option C:
- **Olive drawer = desktop sidebar port** → spatial memory transfer (cannot be ported to A/B without changing their identity)
- **Dual drawer entry** (hamburger + More tab) → solves Fitts's for drawer access

The olive drawer spatial memory IS a genuine 9-level insight. But the bottom sheet, FAB, and 7 layout types are portable features that inflate the score. Without them, the drawer alone warrants strong but not exceptional.

**8/10** — consistent with web analysis approach.

**Adjusted total: 46/60 (76.7%)**. Still wins by 7 points over Option B.

---

## 3. Accessibility Gaps

### 3.1 Active Tab Contrast — CORRECTLY IDENTIFIED

The analysis catches #606C38 vs #6b705c at **1.12:1** — near invisible. Prescribed triple fix (dark color + filled icon + indicator bar). This is the single most important mobile a11y finding. Well done.

### 3.2 Card Border Outdoor Visibility — CORRECTLY IDENTIFIED

`border-primary` (#e5e1d3) on cream at 1.15:1 — invisible in sunlight. Fix prescribed (shadow-sm or darken to #f0ebe0). Good.

### 3.3 Touch Targets — CORRECTLY SPECIFIED

Line 998: "all interactive elements ≥ 44×44px" in the accessibility spec. Header buttons use `min-w-[44px] min-h-[44px]` (line 873). Drawer items use `min-h-12` (48px, line 897). Good.

### 3.4 MISSING: prefers-reduced-motion

The app analysis does NOT include `prefers-reduced-motion` handling for:
- Drawer slide transition (`duration-200 ease`, line 895)
- Bottom sheet snap animations (Vaul default spring physics)
- FAB scale animation (if any)
- Backdrop blur transition

The web analysis R2 added this. The app analysis should match.

**Severity: MEDIUM** — vestibular-sensitive users may experience discomfort from sheet/drawer slide animations.

**Fix:** Add `@media (prefers-reduced-motion: reduce)` to drawer, sheet, and FAB — same pattern as web analysis.

### 3.5 MISSING: Text Scaling / Dynamic Type

No mention of how the layout responds to user-configured text size (iOS Dynamic Type, Android font-size). At 200% text scaling:
- Bottom nav labels (12px → 24px): will overflow 75px tab width
- Bottom sheet drag handle label: may overlap
- FAB icon label: may clip

**Severity: MEDIUM** — WCAG 1.4.4 (Resize Text) requires content to be functional at 200% zoom.

**Fix:** Bottom nav labels should use `text-xs` with `max-w` and `truncate`, or switch to icon-only mode when `font-size-adjust` exceeds threshold. Consider `rem`-based sizing with a cap.

### 3.6 MISSING: Landscape Orientation

No mention of landscape mode behavior for any option. On iPhone landscape (375×667 → 667×375):
- Bottom nav height (56px) + header (48px) = 104px of 375px total height = **27.7%** — nearly a third of the viewport is chrome
- Content area: 271px — extremely cramped

**Severity: LOW** (CEO app is portrait-primary) — but should be documented.

**Fix:** Consider hiding bottom nav labels in landscape (icon-only mode) to reduce nav height from 56px to 44px. Or note in spec that landscape is unsupported/portrait-locked.

### 3.7 MISSING: Vaul ARIA Verification

Line 989: "Vaul handles ARIA" — but the writer should verify:
- Does Vaul actually set `aria-valuenow` for snap points? (Claim at line 991)
- Does Vaul provide `role="dialog"` and `aria-modal="true"`?
- Does Vaul support focus trap out of the box?

These claims should be verified against Vaul's documentation, not assumed.

**Severity: LOW** — Vaul is a well-maintained library (Emil Kowalski / Radix ecosystem) and likely handles these, but "likely" is not "verified."

### 3.8 Bottom Nav Badge Overlap

Line 162: "On the 24px nav icon, the 18px badge partially overlaps the icon, creating visual clutter at small scale." The analysis identifies this but doesn't prescribe a fix or score impact.

**Fix:** Position badge at top-right of icon with `translate-x-1/2 -translate-y-1/2` and ensure minimum 4px clearance from icon edge. Badge min-size should be 16px (not 18px) to reduce overlap. Alternatively, use the iOS convention of badge above the icon, not overlapping.

---

## 4. Scoring Gap Analysis

### Revised Final Comparison

| Category | Option A | Option B | Option C (revised) |
|----------|----------|----------|---------------------|
| Gestalt | 6 | 7 | **8** |
| Visual Hierarchy | 6 | 6 | **7** (↓1) |
| Golden Ratio | 6 | 6 | **7** |
| Contrast | 6 | 6 | **8** |
| White Space + Unity | 6 | 7 | **8** |
| UX Deep Dive | 6 | 7 | **8** (↓1) |
| **TOTAL** | **36** | **39** | **46** (↓2) |
| **Percentage** | 60.0% | 65.0% | **76.7%** |

Option C still leads by 7 points — recommendation is unchanged.

---

## 5. Cross-Reference: Web ↔ App Consistency

| Dimension | Web Option C | App Option C | Consistent? |
|-----------|-------------|-------------|-------------|
| Gestalt | 8/10 | 8/10 | ✓ |
| Visual Hierarchy | 7/10 | 7/10 (revised) | ✓ |
| Golden Ratio | 8/10 | 7/10 | ✓ (mobile has more constraints: safe areas, tab labels) |
| Contrast | 8/10 | 8/10 | ✓ (drawer = sidebar) |
| White Space + Unity | 8/10 | 8/10 | ✓ |
| UX Deep Dive | 8/10 | 8/10 (revised) | ✓ |
| Total | 47/60 | 46/60 (revised) | ✓ (1pt difference from mobile Golden Ratio — expected) |

Web and App analyses are consistent after adjustments. The 1-point difference is appropriate (mobile has more proportional constraints than desktop).

---

## 6. What's Excellent

- **Active tab contrast discovery** — #606C38 vs #6b705c at 1.12:1 is the most impactful mobile a11y finding. Triple-fix prescription is thorough.
- **Olive drawer as sidebar port** — strongest cross-device brand unity argument. The desktop↔mobile element mapping table is compelling.
- **Bottom sheet as modal replacement** — replacing 3 patterns (modal, drawer, popover) with 1 pattern reduces cognitive load. Well-argued.
- **7 mobile layout types** — per-page optimization (NEXUS read-only, Trading tab-switcher, Settings accordion) shows depth beyond "just stack it."
- **Fitts's Law thumb zone analysis** — bottom sheet handle in easy zone, dual drawer entry, FAB placement. Quantitative and actionable.
- **Korean label truncation risk** — identifying "에이전트" (5 syllables) at 75px width and prescribing 2-syllable alternatives. Critical for internationalized mobile UX.
- **Safe area analysis** — notch penalty reducing content from 84.4% to 72.3%. Often overlooked in mobile design analysis.

---

## 7. Mandatory Fixes Before Implementation

1. **[A11Y-CRITICAL] Active tab contrast** — #1a1a1a active + filled icon + 2px indicator bar (applies to ALL options)
2. **[A11Y-HIGH] prefers-reduced-motion** — drawer, sheet, FAB animations need instant-state overrides
3. **[A11Y-MEDIUM] Text scaling** — bottom nav labels must handle 200% zoom (truncate or icon-only fallback)
4. **[A11Y-LOW] Landscape chrome** — document behavior or specify portrait lock
5. **[A11Y-LOW] Vaul ARIA verification** — confirm role="dialog", aria-modal, snap point announcements
6. **[DESIGN] Badge position** — reduce overlap on 24px icons with proper offset positioning

---

## 8. Final Grade

| Criterion | Assessment |
|-----------|-----------|
| Design Principles Coverage | **A** — all 6 categories + mobile-specific Fitts/Hick/Miller thoroughly applied |
| Scoring Accuracy | **B+** — 2 scores need adjustment (C Hierarchy 8→7, C UX 9→8) |
| Accessibility Depth | **B** — active tab + card border + touch targets excellent; missing motion, text scaling, landscape, Vaul verification |
| Implementation Readiness | **A** — component trees + CSS + TypeScript + per-page FAB configs for all 3 options |
| Cross-Device Consistency | **A** — web↔app scores align after adjustments; drawer=sidebar concept thoroughly validated |
| **Overall** | **B+** → proceed with a11y fixes |

**Status: PASS WITH REVISIONS (2 score adjustments + 6 a11y items)**

---

*Critic-B (Visual & Accessibility) — Phase 2, Step 2-2 Review Complete*
