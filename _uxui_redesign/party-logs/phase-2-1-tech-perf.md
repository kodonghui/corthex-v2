# Phase 2-1 Web Analysis — Tech-Perf (Critic-C) Review

**Reviewer:** tech-perf (Critic-C)
**Date:** 2026-03-23
**Document:** `_uxui_redesign/phase-2-analysis/web-analysis.md`
**Focus:** Framework implementation specs, component counts, CSS patterns

---

## Overall Grade: A (Pass)

The web analysis is exceptionally thorough — 1,232 lines covering 3 layout options with 6-category scoring, framework implementation specs, TypeScript interfaces, CSS class inventories, and a defensible recommendation. This is production-grade design analysis.

---

## 1. Component Count Verification

### Page Count: ACCURATE
- Analysis claims **23 pages**. Verified against `packages/app/src/App.tsx`:
  - 23 active routes inside `<Layout>`: hub, dashboard, nexus, chat, agents, departments, jobs, tiers, reports, workflows, sns, trading, messenger, knowledge, agora, files, costs, performance, activity-log, ops-log, classified, settings, notifications
  - 4 redirect routes (command-center→hub, org→nexus, cron→jobs, argos→jobs) — correctly excluded
  - 2 outside Layout (login, onboarding) — correctly excluded from nav count
  - **Verdict: 23 confirmed. Accurate.**

### Nav Item Count: MINOR DISCREPANCY
- Analysis Option A claims **22 nav items across 6 sections** (COMMAND 4, ORGANIZATION 5, TOOLS 4, INTELLIGENCE 5, SOCIAL 4)
- Current codebase sidebar (`packages/app/src/components/sidebar.tsx`) has **22 items across 4 sections** (COMMAND 4, ORGANIZATION 5, TOOLS 7, SYSTEM 6)
- The analysis's 6-section grouping is a **proposed** regrouping, not current state — this is correct behavior for a redesign analysis, but should be explicitly labeled as "proposed IA" vs "current IA"

### SketchVibe Inclusion: FLAG
- Option C's component tree includes `<NavItem to="/sketchvibe" icon={Palette} label="SketchVibe" />` under TOOLS
- However, `App.tsx:111` has `{/* SketchVibe moved to Admin app */}` — no active route exists
- **Impact:** If SketchVibe stays in admin, the nav count drops from 22→21 in Zone A (18→17). The analysis should note this conditional inclusion.
- **Severity:** Low — doesn't affect scoring or recommendation

### Notifications in Sidebar: FLAG
- Current sidebar.tsx does NOT include a Notifications nav item (route exists at `/notifications`)
- Analysis Option C puts Notifications in Zone B — this is a **new addition** to the sidebar, not a reorganization
- Should be called out as a new sidebar entry, not just a regrouping

---

## 2. CSS Pattern Verification

### Tailwind v4 Compliance: ACCURATE
- All CSS classes use Tailwind v4 syntax (CSS-first config, arbitrary values with `[]`)
- `h-dvh` (dynamic viewport height) — correct modern replacement for `h-screen`
- `grid grid-cols-[280px_1fr]` — correct arbitrary grid template syntax
- `scrollbar-thin scrollbar-thumb-white/15` — Tailwind scrollbar plugin syntax, correct
- `overflow-hidden` on AppShell prevents double scrollbar — correct pattern

### Color Token Accuracy: VERIFIED
Cross-referenced against Tech Spec §1.4:

| Token | Analysis Value | Tech Spec Value | Match? |
|-------|---------------|-----------------|--------|
| Background (cream) | `#faf8f5` | `#faf8f5` | ✅ |
| Sidebar bg (olive dark) | `#283618` | `#283618` | ✅ |
| Sidebar text | `#a3c48a` | `#a3c48a` | ✅ |
| Surface | `#f5f0e8` | `#f5f0e8` (hover) | ✅ |
| Border | `#e5e1d3` | `#e5e1d3` | ✅ |
| Text primary | `#1a1a1a` | `#1a1a1a` | ✅ |
| Text secondary | `#6b705c` | `#6b705c` | ✅ |
| Focus ring | `#606C38` | `#606C38` | ✅ |

All 8 tokens match. No phantom colors introduced.

### WCAG Contrast Ratios: SPOT-CHECKED
- Sidebar text `#a3c48a` on `#283618` = claimed 6.63:1 — **plausible** (light green on dark olive)
- Primary text `#1a1a1a` on `#faf8f5` = claimed 16.5:1 — **plausible** (near-black on near-white)
- Focus ring `#606C38` on sidebar `#283618` = claimed 2.27:1 FAIL — **correctly identified as WCAG violation**
- The focus ring fix recommendation (`#a3c48a` at 6.63:1) is the right call

### Grid System: ACCURATE
- 8px base grid from Vision §5.1 → spacing values (4, 8, 12, 16, 24, 32, 48, 64) all multiples of 4 or 8 — consistent
- `p-6` = 24px, `gap-6` = 24px, `py-2` = 8px, `px-3` = 12px — all on the 4px subgrid

### Layout Type CSS: VERIFIED
Option C defines 7 layout types with CSS classes. Cross-checked against actual page requirements:

| Layout | CSS Class | Mapped Pages | Correct? |
|--------|-----------|-------------|----------|
| dashboard | `grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6` | Dashboard, Performance | ✅ |
| master-detail | `grid grid-cols-[280px_1fr]` | Hub, Chat, Messenger | ✅ |
| canvas | `relative w-full h-[calc(100dvh-56px)] overflow-hidden p-0` | NEXUS | ✅ |
| crud | `flex flex-col gap-6` | Agents, Departments, Jobs, Tiers, Reports, Knowledge, Files | ✅ |
| tabbed | `flex flex-col` | Settings (10 tabs) | ✅ |
| panels | `grid grid-cols-2 grid-rows-2 gap-4` | Trading | ✅ |
| feed | `max-w-[720px] mx-auto` | SNS, Agora, Activity Log, Ops Log | ✅ |

All 23 pages can be mapped to one of the 7 layouts. No page is left without a layout type. The `calc(100dvh-56px)` correctly subtracts the 56px topbar height.

---

## 3. Framework Implementation Spec Review

### Component Tree Hierarchy: SOUND
- Option C's tree: `AppShell > {Sidebar, Topbar, ContentArea, CommandPalette}`
- Sidebar subdivides: `SidebarBrand > SidebarSearch > SidebarZoneA > SidebarZoneB > SidebarFooter`
- This is a clean 2-level hierarchy — no excessive nesting, no prop drilling beyond 2 levels
- `<Outlet />` correctly placed inside `ContentInner` — matches React Router v6/v7 layout pattern

### TypeScript Interfaces: COMPLETE
Verified all component trees have matching interfaces:
- `AppShellProps` — ✅ (sidebarState, onSidebarToggle)
- `NavItemProps` — ✅ (to, icon, label, badge, isActive)
- `NavSectionProps` — ✅ (label, icon, children, defaultCollapsed)
- `CommandPaletteProps` — ✅ (open, onClose, items)
- `CommandItem` — ✅ (id, type, label, icon, shortcut, description, onSelect, group)
- `ContentLayoutType` — ✅ (7 literal union members matching CSS classes)
- `TopbarAction` (Option B) — ✅ (type union, variant, options)

**No missing interfaces.** Every component in the tree has a props definition.

### Accessibility Spec: THOROUGH
Option C includes a full ARIA spec:
- `role="navigation"` on sidebar ✅
- `role="dialog" aria-modal="true"` on command palette ✅
- `role="combobox"` + `aria-activedescendant` on palette input ✅
- `role="listbox"` + `role="option"` on palette items ✅
- Skip-to-content link ✅
- Focus trap for mobile sidebar ✅
- Focus return on palette close ✅

**One gap:** No `aria-label` specified for Zone A vs Zone B `<nav>` elements in the semantic HTML comment. The comment shows `<nav aria-label="Command">` per section but Zone B has `<nav aria-label="Communication">` — this is correct but Zone A sections should each have unique labels. Already done in the spec. **No issue.**

---

## 4. Scoring Analysis

### Score Distribution: DEFENSIBLE
| Option | Total | Std Dev | Pattern |
|--------|-------|---------|---------|
| A | 37/60 (61.7%) | 0.75 | Low ceiling, UX weakness (5/10) |
| B | 42/60 (70.0%) | 0.00 | Perfectly balanced 7s — no standout |
| C | 50/60 (83.3%) | 0.52 | High floor (8+), peaks at 9 |

- The 8-point gap between B and C is significant — not a close call
- Option B's zero variance (all 7s) is notable and correctly flagged as "no standout strength"
- Option A's UX score (5/10) is the document's lowest — justified by 22 flat items + no progressive disclosure + no Cmd+K
- Option C's Gestalt (9) and UX (9) are the highest — justified by dual-zone + Cmd+K

### Potential Bias Check
- The analysis is written by the same author who will implement the chosen option. There's inherent bias toward the most architecturally interesting option (C).
- However, the scoring methodology is explicit (6 categories, 10 points each), every score has written justification, and the deficiencies of Option C are noted (sidebar still heavy in blur test, focus ring WCAG failure).
- **Verdict:** Bias risk exists but is mitigated by transparent methodology.

---

## 5. Issues Found

### Critical: None

### Minor Issues (3):

1. **SketchVibe inclusion ambiguity** — Listed in Option C's nav but moved to admin app in codebase. Should note "conditional: include if SketchVibe returns to CEO app in v3"
2. **Text tertiary color discrepancy** — Analysis §1.4 uses `#756e5a` as tertiary text, but Tech Spec §1.4 lists `#a3a08e` as text tertiary. The `#756e5a` value doesn't appear in the tech spec. Needs clarification on which is authoritative.
3. **Option A/B/C section groupings differ from current code** — Current sidebar has 4 sections; analysis proposes 5-6 sections. Fine for a redesign, but should add a "Current vs Proposed IA" comparison table for clarity.

### Suggestions (2):

1. **Add responsive breakpoint spec** — The analysis mentions 1440px and 1080p viewports but doesn't define the full breakpoint system (sm/md/lg/xl/2xl). Option C's mobile transition "below 1024px" is mentioned in §5 but not in the CSS spec section.
2. **Command palette library recommendation** — `cmdk` (pacocoursey) is named in §5 but no version pin. Given CLAUDE.md's "SDK pin version (no ^)" rule, should specify exact version.

---

## 6. Final Verdict

**Grade: A — PASS**

The web analysis is comprehensive, technically accurate, and well-structured. All 3 options have complete framework implementation specs with component trees, CSS classes, TypeScript interfaces, and (for Option C) an accessibility spec. The scoring methodology is transparent and the recommendation is defensible.

The 3 minor issues do not affect the recommendation (Option C: Command Center). The document is ready for the next phase.

---

*Reviewed by tech-perf (Critic-C) — Phase 2, Step 2-1*
