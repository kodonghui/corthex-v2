# Phase 2-2 App Analysis — Tech-Perf (Critic-C) Review

**Reviewer:** tech-perf (Critic-C)
**Date:** 2026-03-23
**Document:** `_uxui_redesign/phase-2-analysis/app-analysis.md`
**Focus:** Framework implementation specs, component counts, CSS patterns, mobile-specific technical accuracy

---

## Overall Grade: A (Pass)

The app analysis is 1,100 lines covering 3 mobile layout options with 6-category scoring, mobile-specific CSS specs (safe areas, touch targets, bottom sheets), and a defensible Option C recommendation. Technical quality matches the web analysis.

---

## 1. Component Count Verification

### Page Count Consistency: ACCURATE
- Inherits the 23-page count from Step 2-1 — confirmed in web analysis R2
- Bottom nav configurations: Option A (5 tabs), Option B (4 tabs), Option C (5 tabs) — all correctly account for remaining pages via More/Me/Drawer menus
- Option A: 4 direct + 18 via More = 22 (Settings counted in More) ✅
- Option B: 2 direct + 20 via Me/Search = 22 ✅
- Option C: 4 direct + 18 via Drawer = 22 ✅

### Tap Count Math: VERIFIED
| Option | Calculation | Claimed | Actual |
|--------|------------|---------|--------|
| A | (4×1 + 18×2) / 22 | 1.82 | **1.82** ✅ |
| B | (2×1 + 20×2) / 22 | 1.91 | **1.91** ✅ |
| C | (4×1 + 18×2) / 22 | 1.82 | **1.82** ✅ |

### Hick's Law Math: VERIFIED
- Option A More menu: log₂(19) = 4.248 → claimed ≈4.25 ✅
- Option B Spotlight: log₂(6) = 2.585 → claimed ≈2.58 ✅
- 39% improvement: (4.25 - 2.58) / 4.25 = 39.3% → claimed 39% ✅

### Mobile Layout Types: 7 — MATCHES WEB ANALYSIS
| Mobile Type | Desktop Equivalent | Pages Covered | Correct? |
|------------|-------------------|---------------|----------|
| chat | master-detail (adapted) | Hub, Chat, Messenger | ✅ |
| dashboard | dashboard | Dashboard, Performance | ✅ |
| master-detail (toggle) | master-detail | Reports, Knowledge | ✅ |
| canvas | canvas | NEXUS | ✅ |
| panels (tab switcher) | panels | Trading | ✅ |
| tabbed (accordion) | tabbed | Settings, Jobs | ✅ |
| feed (card list) | feed | SNS, Agora, Activity Log, Ops Log, Agents, Departments, Tiers, etc. | ✅ |

All 23 pages mappable. The mobile types mirror desktop types with appropriate adaptations.

---

## 2. CSS Pattern Verification

### Safe Area Handling: CORRECT
```css
pt-[env(safe-area-inset-top)]           /* app-shell-mobile */
pb-[env(safe-area-inset-bottom)]        /* bottom-nav */
pb-[calc(16px+env(safe-area-inset-bottom))]  /* sheet-content */
```
- `env(safe-area-inset-*)` is the correct CSS env() function for iOS notch/home indicator
- Applied in the right locations: top inset on app shell, bottom inset on bottom nav and sheet
- **FAB positioning also accounts for safe area:** `bottom-[calc(56px+env(safe-area-inset-bottom)+16px)]` — correct: 56px nav + safe area + 16px margin

### Touch Target Compliance: VERIFIED
- Bottom nav items: `min-h-[44px]` — meets WCAG 2.5.8 and Apple HIG ✅
- Header buttons: `min-w-[44px] min-h-[44px]` — 44×44px minimum ✅
- Drawer items: `min-h-12` (48px) — exceeds 44px minimum ✅
- FAB: `w-14 h-14` (56px) — exceeds minimum ✅
- Sheet drag handle: 48px × 4px visual element, but drag target is full-width — acceptable (gesture target, not tap target)

### Viewport Height Calculations: VERIFIED
Option C chat layout:
```css
h-[calc(100dvh-48px-56px-env(safe-area-inset-top)-env(safe-area-inset-bottom))]
```
- 100dvh = full dynamic viewport
- -48px = header height (h-12 = 48px) ✅
- -56px = bottom nav height (h-14 = 56px) ✅
- -env(safe-area-inset-top/bottom) = notch + home indicator ✅
- `100dvh` (not `100vh`) — correct: `dvh` adjusts for mobile browser chrome (address bar hide/show)

### Color Token Consistency: VERIFIED
Cross-checked against web analysis and tech spec:

| Token | App Analysis | Web Analysis | Match? |
|-------|-------------|-------------|--------|
| Background | `#faf8f5` | `#faf8f5` | ✅ |
| Drawer bg | `#283618` | `#283618` (sidebar) | ✅ |
| Drawer text | `#a3c48a` | `#a3c48a` | ✅ |
| Border | `#e5e1d3` | `#e5e1d3` | ✅ |
| Active tab | `#606C38` | `#606C38` | ✅ |
| Inactive tab | `#6b705c` | `#6b705c` | ✅ |
| FAB bg | `#606C38` | N/A (desktop has no FAB) | N/A |
| Badge | `#dc2626` red | same | ✅ |

No phantom colors. All tokens traceable to the design system.

### Tailwind v4 Syntax: CORRECT
- `data-[open=true]:translate-x-0` — correct Tailwind v4 data attribute selector
- `touch-action-[pan-x_pan-y_pinch-zoom]` — correct arbitrary value for canvas touch handling
- `overscroll-contain` — correct for preventing sheet scroll propagation to content behind it
- `backdrop-blur-sm` — correct Tailwind backdrop-filter utility

### Z-Index Hierarchy: CONSISTENT
```
content (0) < bottom nav (z-30) < FAB (z-30) < drawer overlay (z-40) < drawer (z-50) < sheet overlay (z-40) < sheet (z-50)
```
- Bottom nav and FAB share z-30 — no conflict (FAB is positioned to not overlap nav)
- Drawer and sheet both use z-40/z-50 — no conflict (they never open simultaneously)
- **Potential edge case:** If both drawer overlay (z-40) and sheet overlay (z-40) are open simultaneously, they would overlap. The analysis correctly implies mutual exclusivity but doesn't enforce it in CSS. Should add a note: "drawer and sheet are mutually exclusive states — enforce via state machine"
- **Severity:** Low — this is a state management concern, not a CSS bug

---

## 3. Framework Implementation Spec Review

### Component Tree: COMPLETE
Option C tree: `MobileAppShell > {MobileHeader, MobileContent, FAB, BottomNav, NavigationDrawer, BottomSheet}`

**Nesting depth:** Maximum 3 levels (MobileAppShell → NavigationDrawer → DrawerSection → DrawerItem). Clean.

**Portal rendering:** BottomSheet is noted as "portal-rendered" — correct for z-index stacking context isolation. The drawer should also be portal-rendered (uses `fixed` positioning, needs to escape any `overflow: hidden` ancestors).

### TypeScript Interfaces: COMPLETE
All components have matching interfaces:
- `BottomNavItemProps` (Option A) — ✅ (to, icon, label, badge, onClick, isActive)
- `MobileHeaderProps` — ✅ (title, showBack, onBack)
- `MoreMenuProps` — ✅ (open, onClose, children)
- `SpotlightItemProps` (Option B) — ✅ (icon, label, time, onSelect)
- `ProfileCardProps` — ✅ (user object)
- `BottomSheetProps` (Option C) — ✅ (open, onClose, snapPoints, defaultSnap, children)
- `NavigationDrawerProps` — ✅ (open, onClose, children)
- `DrawerItemProps` — ✅ (to, icon, label, badge, isActive)
- `FloatingActionButtonProps` — ✅ (icon, label, onClick)
- `MobileLayoutType` — ✅ (7 literal union members)

**FAB config pattern:** `fabConfigs: Partial<Record<string, FloatingActionButtonProps>>` — smart pattern. Only pages with creation workflows show the FAB. Currently maps: `/agents`, `/files`, `/departments`, `/knowledge`. This matches the CRUD page list.

### Accessibility Spec: THOROUGH
- `aria-current="page"` on active bottom nav item ✅
- `role="status" aria-live="polite"` for badge counts ✅ — screen reader announces unread count changes
- Drawer as `<dialog>` element — excellent: free focus trap, ESC close, `aria-modal` ✅
- Bottom sheet: Vaul handles ARIA — claimed. Vaul (emilkowalski) does provide `role="dialog"` and `aria-modal` ✅
- All icons `aria-hidden="true"` ✅
- FAB has `aria-label` ✅
- Touch targets ≥ 44×44px — verified above ✅
- Focus-visible: `2px solid #606C38, outline-offset -2px` — **same WCAG 1.4.11 concern from web analysis** (#606C38 at 2.27:1 on #283618 fails in drawer context). The analysis specifies this for cream background where it passes (4.14:1), but doesn't address the drawer context.

---

## 4. Scoring Analysis

### Score Distribution: DEFENSIBLE
| Option | Total | Std Dev | Pattern |
|--------|-------|---------|---------|
| A | 36/60 (60.0%) | 0.00 | Flat 6s — consistent mediocrity |
| B | 39/60 (65.0%) | 0.52 | Spotlight lifts 3 categories |
| C | 48/60 (80.0%) | 0.63 | High floor (7+), UX peak (9) |

- 9-point gap between B and C — decisive, not close
- Option A's zero variance (all 6s) is notable — the analysis correctly identifies this as "minimum viable mobile"
- Option C's UX score (9/10) is the highest in the document — justified by bottom sheet Fitts's compliance, dual drawer entry, spatial memory transfer, and 7 mobile-specific layout strategies

### Cross-Document Scoring Consistency
| Option | Web Score | App Score | Delta | Consistent? |
|--------|-----------|-----------|-------|-------------|
| A | 37/60 | 36/60 | -1 | ✅ (mobile is slightly harder) |
| B | 42/60 | 39/60 | -3 | ✅ ("Me" tab weaker than "More" menu with hover) |
| C | 50/60 | 48/60 | -2 | ✅ (mobile inherently constrained vs desktop) |

All three options score slightly lower on mobile than desktop — expected and internally consistent. The relative ranking (C > B > A) is preserved across both analyses.

---

## 5. Issues Found

### Critical: None

### Minor Issues (3):

1. **Drawer/sheet z-index mutual exclusivity** — Both use z-40/50. The analysis implies they never open simultaneously but doesn't specify enforcement. Add note: "Drawer and BottomSheet are mutually exclusive — manage via single `overlayState` enum."

2. **Focus-visible ring in drawer context** — The accessibility spec specifies `#606C38` focus ring, which fails WCAG 1.4.11 on the olive drawer background (#283618). Web analysis identified this for the sidebar; the same fix (`#a3c48a` in drawer context) should be noted here.

3. **Bottom nav label "Dash" truncation** — Option C's component tree (line 810) uses `label="Dash"` instead of "Dashboard" — smart truncation. But the analysis body (§1.3) discusses Korean labels "대시보드" without noting this English truncation. Should be consistent: if English uses "Dash", Korean should use "대시" (confirmed as suggestion in §1.3).

### Suggestions (2):

1. **Vaul version pin** — Bottom sheet library Vaul (emilkowalski) is named but no version. Per CLAUDE.md "SDK pin version (no ^)" rule, specify exact version. Same applies to cmdk mentioned in web analysis.

2. **Breakpoint definition** — The document targets "mobile < 640px, tablet 640-1023px" but the CSS spec doesn't use `@media` queries or Tailwind responsive prefixes (`sm:`, `md:`). Should add a breakpoint table showing which components render at which breakpoints and the switch point from MobileAppShell to desktop AppShell.

---

## 6. Final Verdict

**Grade: A — PASS**

The app analysis is technically rigorous with correct safe area handling, accurate viewport calculations, verified touch target compliance, and consistent cross-device design token usage. The 7 mobile layout types are well-defined with appropriate CSS for each. The recommendation (Option C: Adaptive Commander) is strongly justified by its desktop-mobile brand unity and superior Fitts's Law compliance.

3 minor issues (z-index mutual exclusivity, focus ring in drawer, label consistency) — none blocking.

---

*Reviewed by tech-perf (Critic-C) — Phase 2, Step 2-2*
