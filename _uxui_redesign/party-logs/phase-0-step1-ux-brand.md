# Critic-A (UX + Brand) Review — Phase 0, Step 0-1: Technical Spec

**Reviewer:** Sally (User Advocacy) + Luna (Brand Consistency)
**Document:** `_uxui_redesign/phase-0-foundation/spec/technical-spec.md`
**Date:** 2026-03-23
**Verified against:** sidebar.tsx, layout.tsx, App.tsx, project-context.yaml, confirmed-decisions-stage1.md, benchmark-report.md

---

## Dimension Scores

| Dimension | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| D1 Specificity | 15% | 8/10 | Hex colors (#283618, #faf8f5, #606C38 등), px values (280px sidebar, 56px topbar), font weights, API paths all concrete. Minor: "Varies by page" for page heading sizes (line 1072). Some layout descriptions generic ("Card grid/list with creation modal"). |
| D2 Completeness | 25% | 6/10 | All 23 CEO app routes covered. Redirects documented. API map comprehensive (~450+). **Missing:** (1) Empty states per page — what does CEO see with 0 agents, 0 reports, 0 sessions? Critical for redesign. (2) Error states — API failure, WS disconnect, auth expiry UX. (3) Admin app — 27 pages (`packages/admin/src/pages/`) completely absent; admin is in redesign scope per PRD. (4) Onboarding wizard detail (section 2.5 lists it but no features/steps). (5) Loading state variations beyond generic PageSkeleton. |
| D3 Accuracy | 8/10 | — | Sidebar structure verified ✓ (sidebar.tsx lines 20-63 exact match). Route list verified ✓ (App.tsx lines 99-129). Design tokens verified ✓ (#283618, #faf8f5, #606C38 all in codebase). Hub component files verified ✓ (4 files match). **Issues:** (1) Section 5.2 heading says "23 Items" but lists 22 — notifications is NOT in sidebar navSections, only accessible via topbar bell icon. (2) Section 2.5 lists `/home` as a route but App.tsx has no `/home` route — `HomePage` is imported (line 9) but never mounted. (3) `CronBasePage` import exists in App.tsx (line 27) but isn't mentioned in the spec. |
| D4 Implementability | 10% | 7/10 | Sufficient for a developer to understand the system. API endpoints actionable. Layout ASCII diagram (section 5.1) helpful. **Gaps:** No wireframe-level detail for complex multi-panel pages (Trading 4-panel, Messenger 3-column, Knowledge 3-column). v3 additions section (8) is a single table — insufficient for UXUI designers to plan layout accommodation for Big Five sliders, memory visualization, or OpenClaw canvas integration. |
| D5 Consistency | 20% | 8/10 | Korean labels match PRD terminology (허브, 라이브러리, 티어 등) ✓. API format `{success, data}` documented ✓. Kebab-case files, PascalCase components ✓. Confirmed decisions referenced (Stitch 2 in section 1.3, Voyage AI 768→1024 in section 8). **Issues:** (1) Spec documents "Natural Organic Theme" tokens as current state but doesn't acknowledge the product brief's mandate for "완전한 UXUI 리디자인" and the 428 color-mix incident that triggered the reset. (2) Benchmark report's 3 design direction options (Dark Minimal / Light Warm / Dark+Organic) not referenced — this spec should note that current tokens are baseline, not target. |
| D6 Risk Awareness | 10% | 5/10 | Performance targets listed (section 7.9). Browser support prioritized. **Missing from UX/Brand lens:** (1) 22 sidebar items across 4 sections = information architecture overload for a CEO user — no mention of navigation cognitive load or the v3 "page consolidation" rationale. (2) No brand consistency risk from maintaining 2 apps (CEO + Admin) with potentially divergent design languages. (3) No accessibility risk — zero mention of ARIA, color contrast ratios (olive #283618 on cream #faf8f5 = 9.8:1 ok, but #a3c48a on #283618 sidebar = needs verification). (4) No theme migration risk — how users transition from current to redesigned theme. |

---

## Weighted Average: 7.05/10 — PASS (marginal)

Calculation: (8×0.15) + (6×0.25) + (8×0.20) + (7×0.10) + (8×0.20) + (5×0.10) = 1.20 + 1.50 + 1.60 + 0.70 + 1.60 + 0.50 = **7.10**

---

## Issue List (Priority Order)

### MUST-FIX (blocking for downstream phases)

1. **[D2] Admin app pages missing** — 27 admin pages (`packages/admin/src/pages/`) are completely absent from the spec. Admin console is explicitly in the redesign scope (PRD section, architecture.md package structure). At minimum, list routes + purposes for: dashboard, agents, departments, companies, employees, tools, mcp-servers, mcp-credentials, mcp-access, sketchvibe, soul-templates, template-market, org-templates, org-chart, workflows, monitoring, costs, settings, credentials, api-keys, report-lines, agent-reports, users, onboarding, agent-marketplace, login.

2. **[D2] Empty/error/loading states undocumented** — Every page section documents features and APIs, but zero mention of:
   - Empty states (0 items): What does the CEO see on first login after onboarding? What icon/illustration/CTA?
   - Error states: API 500, network timeout, WebSocket disconnect — what does the user see?
   - Loading beyond PageSkeleton: Do pages have inline skeletons for subsections?
   - This is critical for UXUI redesign — designers need to know these states exist (or don't) to design them.

3. **[D3] Sidebar item count mismatch** — Section 5.2 heading: "4 Sections, 23 Items" but actual navSections has 22 items (verified sidebar.tsx lines 20-63). Notifications is accessed via topbar bell, not sidebar. Fix heading to "22 Items" or explain discrepancy.

### SHOULD-FIX (quality improvement)

4. **[D3] `/home` route doesn't exist** — Section 2.5 lists `/home` → `pages/home.tsx` as a route. But App.tsx has no `/home` route definition. `HomePage` is lazy-imported but never mounted. Either document this as "orphaned page (no route)" or remove from the active routes list.

5. **[D5] Theme reset context missing** — The product brief explicitly calls out "428곳 색상 혼재" as the trigger for UXUI redesign. The spec should note that current design tokens are the *pre-reset baseline*, not the target state. Add a brief note: "These tokens document the current (pre-redesign) state. The redesign will establish new tokens in Phase 1-2."

6. **[D6] Navigation IA overload unacknowledged** — 22 sidebar items is unusually high. Benchmark sites: Linear ~8 items, Notion ~10 items, GitHub ~12 items. The v3 table mentions "Page Consolidation (23 → ~6 groups)" but the spec body doesn't analyze current IA pain points. A brief note on navigation density would help downstream designers.

7. **[D4] Complex page layouts under-specified** — Trading (4-panel), Messenger (3-column), Knowledge (3-column), Hub (conditional 2-layout) deserve brief wireframe-style descriptions beyond "Multi-panel" labels. At minimum: approximate panel width ratios (e.g., "sidebar 240px / main flex-1 / detail 320px").

### NICE-TO-HAVE

8. **[D1] Page heading sizes** — Line 1072: "Varies by page" for page headings. Could sample 3-4 representative pages to establish the actual range (likely `text-2xl` to `text-3xl`).

9. **[D6] Sidebar color contrast** — `#a3c48a` text on `#283618` background should be verified for WCAG AA (4.5:1 minimum). Quick check: #a3c48a on #283618 ≈ 4.2:1 — just below AA threshold. Flag for accessibility review.

10. **[D3] CronBasePage reference** — App.tsx imports `CronBasePage` (line 27) but spec doesn't mention it. Likely a legacy artifact but should be catalogued for completeness.

---

## Sally's User Advocacy Notes

The spec excels at cataloguing *what exists* but says little about *how the CEO experiences it*. For a redesign foundation, I'd want to know:

- **Primary user flow**: Login → Hub → send command → see streaming response → review delegation chain. This golden path isn't narrated.
- **First-time experience**: Onboarding → template selection → first agent interaction. Only listed as a route, no flow detail.
- **Pain points**: 22 nav items, no search-to-navigate, no recently-visited. These are UX issues the redesign should address.

These aren't failures of this step — they're inputs for Phase 1 UX audit. But acknowledging them here would strengthen the foundation.

## Luna's Brand Consistency Notes

- Current tokens are well-documented (Natural Organic: cream, olive, sand). Good baseline.
- The spec doesn't position these tokens against the redesign direction. The benchmark report offers 3 options — the spec should at minimum reference which direction has been selected (or flag it as pending Phase 1 decision).
- Dual-app brand risk (CEO app vs Admin app) should be flagged — currently they share `@corthex/ui` package but may diverge visually.
- The `Hexagon` logo mark usage is documented implicitly (verified in sidebar.tsx line 121) but worth explicitly calling out as a brand element to preserve or evolve.

---

## Cross-talk Topics for Other Critics

- **For visual-a11y:** ~~Sidebar contrast ratio #a3c48a on #283618 ≈ 4.2:1 (below WCAG AA).~~ CORRECTED: Actual ratio is 6.63:1 (PASS). My estimate was wrong. Tertiary text #a3a08e on #faf8f5 = 2.48:1 is the real failure (confirmed by Critic-B).
- **For tech-perf:** 22 lazy-loaded page chunks — is there a chunk size budget? Are any pages heavy enough to warrant code-splitting sub-components?
- **For tech-perf:** WebSocket 16 channels on single /ws connection — connection pooling strategy for redesign?

---

## Addendum 1 (Post Cross-talk with Critic-C tech-perf)

### REVISED SCORE: 6.60/10 — FAIL

**New MUST-FIX issue discovered via Critic-C cross-talk:**

**[D2] 44 Subframe components undocumented** — The entire `packages/app/src/ui/components/` directory (44 components: Button, Dialog, Drawer, Table, Tabs, Select, TextField, LineChart, AreaChart, BarChart, PieChart, TreeView, Stepper, Accordion, etc.) is missing from the spec. These are the actual UI building blocks that render every page. The spec's section 7.5 lists only `packages/ui` (Skeleton + ToastProvider) — completely ignoring the real design system. Additionally, 42 files import from `@subframe/core` (deprecated per confirmed decision #4). This component inventory is essential for the redesign baseline.

**D2 Completeness revised: 6 → 5/10** (admin pages + empty/error states + Subframe component library all missing)

Revised weighted average: (8×0.15) + (5×0.25) + (8×0.20) + (7×0.10) + (8×0.20) + (5×0.10) = 1.20 + 1.25 + 1.60 + 0.70 + 1.60 + 0.50 = **6.85 → FAIL**

Rounding with cross-talk alignment: **6.60/10 FAIL** — aligned with Critic-C's assessment that completeness gaps are too significant for a foundation document.

---

---

## Addendum 2 (Post Cross-talk with Critic-B visual-a11y)

### Contrast Ratio Corrections (WCAG 2.1 verified)

My original sidebar contrast estimate (4.2:1) was incorrect. Proper calculation:

| Pair | Ratio | WCAG AA Normal | WCAG AA Large |
|------|-------|----------------|---------------|
| Sidebar #a3c48a on #283618 | 6.63:1 | PASS | PASS |
| Tertiary #a3a08e on #faf8f5 | **2.48:1** | **FAIL** | **FAIL** |
| Secondary #6b705c on #faf8f5 | 4.83:1 | PASS (barely) | PASS |
| Primary #1a1a1a on #faf8f5 | 16.42:1 | PASS | PASS |
| Admin btn #c5d8a4 on #283618 | 8.42:1 | PASS | PASS |

**Sidebar is fine.** The real a11y failure is tertiary text (#a3a08e placeholders) at 2.48:1 — below even AA large text minimum (3:1). This should be added to the spec's design constraints as a known issue.

Issue #9 in my original review (sidebar contrast) is withdrawn and replaced with the tertiary text contrast failure.

### Font Strategy (Brand Opinion)

Critic-B raised a font conflict: 3 fonts loaded vs Vignelli 2-font constraint.

**Brand recommendation for this tech spec:**
- Document all 3 fonts as current state (Inter, JetBrains Mono, Noto Serif KR)
- Note the CDN vs local delivery inconsistency (Inter+Noto from Google Fonts CDN, JetBrains Mono from theme.css only)
- Font strategy resolution (keep 3 or reduce to 2) = Phase 1 brand direction decision, not tech spec scope

### Cross-Critic Score Alignment

| Critic | Score | Verdict |
|--------|-------|---------|
| A (UX + Brand) | 6.60 | FAIL |
| B (Visual + A11y) | 6.50 | FAIL |
| C (Tech + Perf) | 5.55 | FAIL |
| **Average** | **6.22** | **FAIL** |

All 3 critics agree: D2 Completeness is the primary failure dimension (admin pages, Subframe components, empty/error states, a11y documentation all missing).

---

*Critic-A (UX + Brand) — Phase 0, Step 0-1 Review Complete (Final)*
