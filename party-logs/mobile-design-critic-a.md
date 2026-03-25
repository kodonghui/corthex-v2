# CRITIC-A: UX Practicality Review — CORTHEX Mobile Design System

> **Reviewer**: CRITIC-A (UX Practicality)
> **Date**: 2026-03-25
> **Files Reviewed**:
> - `_uxui_redesign/phase-2-design-system/mobile/DESIGN.md`
> - `_uxui_redesign/phase-1-mobile/benchmark-analysis.md`
> - `design-system/corthex-mobile-command/MASTER.md`

---

## Overall Score: 8 / 10

Strong mobile-first foundation. The document correctly adopts the most important patterns from the benchmark analysis: bottom navigation, FAB placement, bottom sheets over modals, 16px input fonts, safe-area respect, and touch-friendly sizing. The color system, typography scale, and component specs are production-ready. Gaps are in second-order UX details — "More" tab definition, gesture discoverability, and top-of-screen reachability for frequent actions.

---

## 1. Thumb Zone Reachability — 8/10

### Strengths
- **Bottom Navigation Bar** (56px + safe-area) is correctly positioned in the natural thumb zone. The 5-tab structure (Hub, Dashboard, Chat, Agents, More) places all primary navigation within easy one-handed reach.
- **FAB** positioned bottom-right, 16px from edge, 16px above bottom nav — textbook thumb-zone placement. The 56x56px size is generous and easily tappable.
- **Form primary buttons** specified as "sticky bottom" (Pattern 5), keeping the most important action in the thumb zone even during scroll.
- **Bottom sheets** replace desktop modals — action buttons inside sheets naturally land near the bottom of the screen.

### Issues
- **Form header dual-CTA conflict** (Pattern 5): `Cancel | Create Agent | Save` in the sticky top header places both Cancel and Save in the dead zone (top 48px on a 6.5"+ phone). Worse, the form ALSO has a bottom-anchored "Create Agent" primary button — creating a **duplicate submit path**. Which one submits? This is both a reachability AND a cognitive load problem.
- **Top nav action icons** (overflow `⋮` and notification `🔔`) are in the top-right corner — the single hardest spot to reach one-handed on modern phones. These are relatively low-frequency actions, but notifications in a real-time AI office app could be high-frequency.
- **Filter chips** (Pattern 2) sit near the top of content, just below the search bar. After the 48px nav bar pushes them down ~100px from top, they land in the "stretch zone." For filters toggled frequently (All/Active/Pending/Idle), this adds cumulative friction.

### Recommendation
- Remove `Save` from the top header. Keep only `← Cancel` (top-left, convention-safe) + single bottom-anchored primary CTA. Eliminates confusion + moves the only confirm action to thumb zone.
- Consider pull-down or bottom-sheet filter access as supplement to top-positioned filter chips.

---

## 2. One-Hand Use — 7/10

### Strengths
- Bottom nav handles all primary navigation — no hamburger reach needed.
- Swipeable list items (left = delete, right = archive) enable one-handed content management.
- Chat input bar is bottom-anchored with safe-area padding — typing is thumb-friendly.
- Page transitions use slide gestures (push/pop), implying swipe-back support.

### Issues
- **Detail view tab bar** (Pattern 2: Overview / Tasks / History) positioned mid-screen inside detail page. On a tall phone, switching between tabs requires lifting the thumb upward into the stretch zone.
- **Search bar** always at top of list views. For a frequent action, having to reach the top every time is a one-hand penalty. Toss (primary benchmark reference) solves this with pull-down-to-search — this specific pattern wasn't adopted despite being highlighted in the benchmark.
- **Long forms** (Pattern 5): "Save" in top-right sticky header is unreachable one-handed. The bottom "Create Agent" button partially fixes this, but the dual-CTA creates confusion about which one actually submits.
- **Horizontal scroll stat cards** (Pattern 1) require deliberate horizontal swipe while holding one-handed — doable but slightly awkward vs. vertical scroll.

### Recommendation
- Adopt **pull-down-to-search** (Toss pattern) as supplementary search invocation.
- Remove "Save" from form headers — single bottom CTA is sufficient.
- Make detail view tab bar sticky below the nav bar so it doesn't float in the mid-screen.

---

## 3. Cognitive Load — 8/10

### Strengths
- **Clear information hierarchy**: page-title (24px/700) → section (18px/600) → card-title (16px/600) → body (14px/400) → caption (12px/400). Five distinct levels with consistent size and weight differentiation.
- **Overline section labels** (10px UPPERCASE, tracking-wide, `#A8A29E`) create clear visual groupings in Settings and list views — reduces scanning effort.
- **Semantic color usage** well-defined: green=online/success, yellow=warning, red=error/destructive, blue=info. No color overloading.
- **Tables → Cards transformation** eliminates cognitive burden of parsing tabular data on small screens.
- **Filter chips** (All / Active / Pending / Idle) use familiar pattern showing state at a glance.
- **5-tab bottom nav** within cognitive limit (7±2, Miller's Law). Labels + icons reduce ambiguity.

### Issues
- **"More" tab is a junk drawer.** Putting overflow into "More" creates a hidden navigation layer. Users must guess what's behind it. What pages live there? Settings? Jobs? Departments? Knowledge? Trading? SNS? Notifications? **The design system doesn't specify.** This is a significant cognitive load concern — the unknown creates decision anxiety.
- **Horizontal scroll stat cards** (Pattern 1) hide information off-screen. Users don't know how many cards exist or what they're missing. Benchmark recommends "peek next card (show 20px)" and "dot indicators" — DESIGN.md only says "← swipe for more stats →" as a conceptual note, not a concrete UI specification.
- **Detail view with tab bar** (Pattern 2) adds navigation depth: bottom nav → list → detail → tabs = 3 levels, each with its own mental model. Acceptable but borderline for a "Fast. Focused." mission control app.

### Recommendation
- Explicitly define "More" contents and consider whether any items deserve primary bottom nav promotion.
- Add concrete specs for horizontal scroll signposting: partial next-card visibility (show 20-30px) + dot indicators or "1/N" counter.

---

## 4. Fitts's Law Compliance — 9/10

### Strengths
- **Touch targets well-specified**: minimum 44x44px (WCAG 2.5.8), recommended 48x48px for primary actions. Explicitly stated in both the design system and generation rules.
- **FAB at 56x56px** — largest target on screen, proportional to its importance as primary action. Correct Fitts's Law application.
- **Buttons at 48px height, full-width on mobile** — maximum target width, minimal movement required.
- **Form inputs at 48px height, 16px font** — generous touch targets that also prevent iOS zoom.
- **List items at 52px minimum height** — adequate for tap targeting with full-width row.
- **Card tap animation** (scale 0.97) provides immediate feedback that the correct target was hit.

### Issues
- **Top nav action icons** (⋮, 🔔) specified as icons only with no explicit hit area size. At 24px visible icon size, the actual touch target must be padded to 44px+ — but this isn't stated. Undersized targets in the hardest-to-reach zone = double penalty.
- **Bottom tab labels at 10px** are tiny. While the tap target is the full tab area (not just the label), small label size reduces visual salience for less-used tabs.
- **Swipe gesture activation threshold** not specified. How far must a user swipe for delete/archive? What's the snap point? Without this, implementations will be inconsistent.
- **Danger button same size as primary** (48px, full-width) — destructive actions should be visually smaller or require extra confirmation. No spec for reduced-size danger button or confirmation step.

### Recommendation
- Specify minimum 44x44px tap target padding for all top nav icons.
- Define swipe activation threshold (e.g., 30% of item width) and snap-back behavior.
- Add danger-action confirmation spec (either smaller button or 2-step confirmation).

---

## 5. Navigation Depth — 7/10

### Navigation Map (tap count from launch)

| Destination | Taps | Path |
|-------------|------|------|
| Hub | 1 | Bottom nav → Hub |
| Dashboard | 1 | Bottom nav → Dashboard |
| Chat room list | 1 | Bottom nav → Chat |
| Specific chat | 2 | Chat → tap room |
| Agents list | 1 | Bottom nav → Agents |
| Agent detail | 2 | Agents → tap agent |
| Agent tasks tab | 3 | Agents → agent → Tasks tab |
| Create new agent | 1 | FAB (on Agents page) |
| Settings | 2+ | More → Settings (assumed) |
| Jobs list | 2+ | More → Jobs (assumed) |
| Departments | 2+ | More → Departments (assumed) |
| Knowledge/Library | 2+ | More → Library (assumed) |
| Trading | 2+ | More → Trading (assumed) |
| SNS | 2+ | More → SNS (assumed) |
| Notifications | 1 | Top nav bell (dead zone) |

### Strengths
- Core screens (Hub, Dashboard, Chat, Agents) are 1 tap away.
- FAB provides 1-tap creation from context-relevant pages.
- 2-tap maximum for primary list→detail workflows.

### Issues
- **"More" tab hides 5+ pages** behind an extra tap. Jobs, Departments, Knowledge, Trading, SNS — all require More → item = 2 taps minimum, 3+ for any detail. For an "AI Virtual Office Management" app, **Departments and Jobs are arguably core workflows** that shouldn't be buried.
- **No global search specified.** If a user wants to find a specific agent while on Dashboard: tap Agents → wait → tap search → type = 3 steps for a conceptually 1-step action.
- **No deep linking or quick actions.** Can a user long-press the Agents tab to jump to "Create Agent"? Can they 3D-touch a notification? These shortcuts reduce effective navigation depth for power users.
- **Settings location unspecified.** Pattern 4 exists but where it lives in nav hierarchy is never stated.

### Recommendation
- Add **global search** accessible from every page (pull-down gesture or persistent icon in top nav).
- "More" should open a **bottom-sheet grid** (like iOS Control Center) rather than a full page push — reduces perceived depth.
- Consider promoting Jobs or Departments to primary bottom nav (possibly replacing Dashboard if Hub already shows dashboard-style stats).
- Define **long-press shortcuts** on bottom nav items for power users.

---

## 6. Input Handling — 9/10

**This is the strongest section of the document.**

### Strengths
- **`Font-size: 16px (CRITICAL: prevents iOS auto-zoom)`** — explicitly called out and correct. ✓
- **Bottom sheets replace dropdowns** — clearly specified. Select inputs "open bottom sheet" (Pattern 5). ✓
- **48px input height** — generous tap targets. ✓
- **Input states well-defined**: default (border), focus (border-strong), helper text, error text. ✓
- **Background color differentiation** (elevated `#292524` for inputs vs surface `#1C1917` for cards). ✓
- **Form uses full-screen push**, not modal overlay. ✓
- **Safe-area-inset-bottom** padding on form screens. ✓

### Issues
- **Keyboard avoidance not specified.** When software keyboard appears, viewport shrinks ~40%. How does the sticky-bottom button behave? Does it sit above keyboard or scroll with content? This is a common implementation pitfall that should be in the spec.
- **No input type/inputmode attributes specified.** For Stitch 2 generation: `inputmode="numeric"` for cost fields, `type="email"` for email fields would improve keyboard experience.
- **Textarea auto-grow behavior unspecified.** Pattern 5 shows 120px textarea but doesn't address auto-grow, character limits, or overflow behavior.

### Recommendation
- Add keyboard avoidance spec: sticky-bottom button should float above keyboard.
- Add inputmode mapping table for Stitch generation.

---

## 7. Scroll & Gesture Patterns — 7/10

### Strengths
- **Pull-to-refresh** listed with "rubber-band physics" animation. ✓
- **Swipe-to-delete** (left) and **swipe-to-archive** (right) on list items — well-specified with "translateX with snap." ✓
- **Page transitions** use directional slides (push left / pop right) — standard and intuitive. ✓
- **Bottom sheet** has drag handle (40x4px) and drag-to-dismiss. ✓
- **Single scroll direction rule** explicitly stated in Generation Rule #9. ✓
- **`prefers-reduced-motion`** respected — accessibility checkbox ticked. ✓

### Issues
- **Horizontal scroll signposting underspecified.** Benchmark analysis explicitly recommends "Peek next card (show 20px)" and "Dot indicators or scroll snap" — DESIGN.md doesn't translate these into concrete specs. Without peek/indicators, Stitch 2 may generate horizontal scrolls that look like static single cards. **Users will miss hidden content.**
- **Swipe action discoverability not addressed.** How does a new user learn list items are swipeable? No mention of onboarding hints, subtle peek animations on first visit, or visual affordances. Swipe actions are invisible by default — this is a well-documented discoverability problem.
- **iOS back-swipe gesture conflict.** List items support right-swipe-to-archive. On iOS, right-swipe from left screen edge = system back navigation. If a list item starts near the left edge (avatar at 12-16px), there's a gesture conflict zone. No mitigation specified.
- **Scroll direction lock missing.** In Pattern 1 (horizontal cards inside vertical scroll), no spec for preventing diagonal drift. `overscroll-behavior-x: contain` or equivalent is needed.
- **No pagination strategy.** What happens at the bottom of a list? Loading spinner? "Load More" button? Infinite scroll? "End of list" indicator? Not specified.
- **No scroll-to-top behavior.** Tapping active bottom nav tab or status bar to scroll to top is standard expectation — not specified.

### Recommendation
- Add concrete specs: horizontal scroll must show ≥20px of next card + dot indicators or "1/N" counter + `scroll-snap-type: x mandatory`.
- Add first-use swipe hint animation (item peeks 40px left on first render, then snaps back, once per session).
- Specify iOS gesture conflict mitigation: right-swipe-archive activates only when swipe origin ≥44px from left screen edge.
- Add pagination strategy spec and scroll-to-top behavior.
- Add `overscroll-behavior-x: contain` for horizontal scroll containers.

---

## Score Summary

| Criterion | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Thumb Zone Reachability | 8/10 | 15% | 1.20 |
| One-Hand Use | 7/10 | 15% | 1.05 |
| Cognitive Load | 8/10 | 15% | 1.20 |
| Fitts's Law | 9/10 | 10% | 0.90 |
| Navigation Depth | 7/10 | 20% | 1.40 |
| Input Handling | 9/10 | 10% | 0.90 |
| Scroll/Gesture Patterns | 7/10 | 15% | 1.05 |
| **TOTAL** | | **100%** | **7.70 → 8/10** |

---

## Top 3 Improvements Required

### 1. Define "More" Tab Contents & Restructure Navigation (Impact: HIGH)

**Problem:** The "More" tab is a black box. 5+ important pages (Jobs, Departments, Knowledge, Trading, SNS) are hidden behind an unspecified overflow. For a "mission control" app branded as "Fast. Focused.", burying core workflows violates the product's own personality.

**Fix:**
- Explicitly list all pages under "More" in the design system.
- "More" should open a **bottom-sheet grid** (icon + label tiles, grouped by section headers) — not a full page push. This reduces perceived depth.
- Add **global search** (pull-down gesture or persistent top-nav icon) so users can bypass navigation entirely for any entity.
- Evaluate promoting Jobs or Departments to primary bottom nav — these are arguably higher-frequency than a separate Dashboard tab (given Hub already shows stats).

### 2. Add Gesture Discovery & Horizontal Scroll Signposting (Impact: MEDIUM-HIGH)

**Problem:** Horizontal scrolls and swipe actions are specified functionally but not visually. Without peek indicators, dot navigators, and first-use hints, users will miss hidden content and swipe actions. The benchmark analysis flagged these patterns explicitly — they were not carried forward into specs.

**Fix:**
- Horizontal scroll: add `peek: show 20-30px of next card` + dot indicators below. Specify `scroll-snap-type: x mandatory` and `scroll-snap-align: start`.
- Swipe actions: add first-render peek hint (40px left-translate at 300ms on mount, auto-revert, once per session).
- iOS gesture conflict: specify that right-swipe-archive activates only when swipe origin ≥44px from left edge.
- Specify pagination strategy (infinite scroll with bottom spinner recommended for list views).
- Add scroll direction lock (`overscroll-behavior-x: contain`) for horizontal containers within vertical scroll.

### 3. Resolve Form Header Dual-CTA & Top-Zone Reachability (Impact: MEDIUM)

**Problem:** Pattern 5 places Cancel + Save in the top header AND a primary CTA at the bottom — creating duplicate submit paths, UX confusion, and reachability issues. More broadly, search, filter chips, and notification icons all sit in the top 20% of the screen — the hardest zone for one-handed use.

**Fix:**
- Remove `Save` from form top header. Keep only `← Cancel` (top-left, convention-safe). Single bottom-anchored primary CTA is the sole submit action.
- Add pull-down-to-search as supplementary access method.
- Filter chips: consider a bottom-sheet filter icon as supplement to inline chips.
- Ensure all top nav icons have explicit 44x44px minimum tap area documented.

---

## Minor Issues (Non-blocking, for completeness)

1. `overline` at 10px may fail readability on low-DPI Android — consider 11px minimum
2. Keyboard avoidance for sticky-bottom button not specified (implementation trap)
3. Danger button should be either reduced width or require 2-step confirmation
4. Bottom nav tab spacing not specified (risk of mis-taps between adjacent tabs)
5. Detail view tab bar positioned above content midpoint — consider sticky below nav bar
6. No scroll-to-top behavior specified (tap active tab / status bar)
7. No inputmode mapping for different field types

---

## Verdict: PASS with revisions

The design system is production-quality for the fundamentals. Address the Top 3 before screen generation to avoid baking in navigation and discoverability problems that are expensive to fix post-implementation.
