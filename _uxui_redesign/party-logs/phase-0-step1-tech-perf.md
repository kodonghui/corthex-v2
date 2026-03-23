# Critic-C (Tech + Performance) Review — Step 0-1 Technical Spec

**Reviewer:** Amelia (implementation feasibility) + Bob (performance analysis)
**Document:** `_uxui_redesign/phase-0-foundation/spec/technical-spec.md`
**Date:** 2026-03-23
**Lines Reviewed:** 1,170

---

## Dimensional Scores

| Dimension | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| D1 Specificity | 20% | 7/10 | API paths fully specified with methods; design tokens include exact hex values verified against `sidebar.tsx:116` and `layout.tsx:146`; file paths accurate. Deducted: version numbers stated as exact (React 19.2.4, Vite 6.4.1, Tailwind 4.2.1, Hono 4.12.3) but `package.json` uses caret ranges (`^19`, `^6`, `^4`, `^4`); performance targets vague ("±10% of baseline" — what baseline?); page layout descriptions are 1-line each ("Grid of metric cards + charts") insufficient for CSS implementation. |
| D2 Completeness | 4/10 | 4/10 | **CRITICAL GAP: 44 Subframe UI components** in `packages/app/src/ui/components/` (Button, Dialog, Drawer, Table, Tabs, LineChart, PieChart, BarChart, etc.) completely undocumented — spec claims `packages/ui` has only "Skeleton + ToastProvider". Missing pages: `sketchvibe.tsx`, `cron-base.tsx`, `argos.tsx` (exist as files, not just redirects). Only 2 of 6 Zustand stores documented (missing: activity-store, command-store, notification-store, theme-store). Only 3 of 11 custom hooks mentioned. **Zero Libre framework analysis** (no gestalt, no archetypal coherence, no design mastery assessment). No bundle size analysis. No component tree depth analysis. |
| D3 Accuracy | 7/10 | 7/10 | Design tokens verified against code: `bg-[#283618]` in `sidebar.tsx:116`, `h-14` in `layout.tsx:114,146`, `w-[280px]` in `sidebar.tsx:116`. All 5 global listeners confirmed in `layout.tsx:8-12,102-103,200-201`. WebSocket hooks `useWsStore`, `useDashboardWs`, `useActivityWs` confirmed across 26 files. Lazy loading pattern verified: 30 pages use `React.lazy` in `App.tsx:8-38`. Deducted: Component library claim is factually wrong (says Skeleton+ToastProvider, actual is 44 Subframe components). Version precision unverifiable without lockfile. `knowledge_docs.embedding` is `vector(768)` per `schema.ts:1556` — spec says 768 which matches current code but doesn't highlight pending 1024d migration (confirmed decision #1). |
| D4 Implementability | 6/10 | 6/10 | API integration is actionable — endpoints have methods, paths, and data shapes. Auth flows are implementation-ready. But: page layout specs are too brief for CSS implementation (e.g., Dashboard = "Grid of metric cards + charts" — what grid? `grid-cols-2`? `grid-cols-3`? responsive behavior?). No component composition patterns specified. No responsive behavior per page (only global breakpoint `< 1024px` mentioned). State management per page undefined (which store, which queries, which hooks). Missing Zustand store interfaces. |
| D5 Consistency | 8/10 | 8/10 | Naming follows conventions: kebab-case files, PascalCase components. API format `{ success, data }` correctly referenced. Sidebar sections match `sidebar.tsx` code. v3 additions align with confirmed decisions (Voyage AI, n8n, OpenClaw, Big Five). Deducted: Doesn't flag inconsistency between confirmed decision #4 (Subframe deprecated → Stitch 2) and 44 Subframe components still in codebase. Doesn't flag confirmed decision #1 (Gemini banned) vs `@google/generative-ai` still imported in 4 server files. |
| D6 Risk Awareness | 3/10 | 3/10 | **Near auto-fail territory.** Missing critical risks: **(1)** 44 Subframe components (`@subframe/core` in 42 files) need complete migration since Subframe is deprecated (confirmed decision #4) — this is the single largest UXUI risk and it's completely unmentioned. **(2)** `@google/generative-ai` still active in `embedding-service.ts`, `llm/google.ts` and 2 test files despite Gemini ban (confirmed decision #1). **(3)** No bundle size analysis — current `packages/app/dist/` is 2.5MB, Subframe adds dead weight. **(4)** No Web Vitals estimates (LCP, FID, CLS). **(5)** No animation performance analysis beyond NEXUS 60fps — Dashboard has pulse animations, Hub has SSE streaming renders, Messenger has real-time message rendering. **(6)** No responsive design gap analysis per page. **(7)** `packages/office/` for OpenClaw PixiJS doesn't exist yet — no code isolation strategy detailed. **(8)** WebSocket 50 connections/company limit (confirmed decision #10) not mentioned in performance targets. |

---

## Weighted Average: 5.15/10 — FAIL

Calculation: (7×0.20) + (4×0.20) + (7×0.15) + (6×0.15) + (8×0.10) + (3×0.20) = 1.40 + 0.80 + 1.05 + 0.90 + 0.80 + 0.60 = **5.55/10**

### Auto-Fail Check
- D6 Risk Awareness at 3/10 = **threshold** (auto-fail is < 3, this is exactly 3)
- No hallucination detected
- No security holes introduced
- No build-breaking proposals

---

## CRITICAL: Libre Framework Not Applied

**Team lead mandate: "No gestalt analysis → score 0"**

The technical spec contains **zero** Libre skill framework analysis:
- No **Gestalt principles** assessment (proximity, similarity, continuity, closure, figure-ground) for current UI
- No **Archetypal Coherence** analysis (what psychological archetype does CORTHEX embody?)
- No **Design Mastery** evaluation (grid system, typography hierarchy ratio, 60-30-10 color rule, whitespace analysis)
- No **Visual Hierarchy** mapping (eye flow patterns across pages)
- No **60-30-10 Color Application** analysis (what % is cream, what % is olive, what % is accent?)

Per the libre-ui-review framework, a Phase 0 technical spec should include at minimum:
1. **Current archetype detected** — what story does the UI tell?
2. **Gestalt compliance** — are proximity/similarity/continuity honored in current layouts?
3. **Typography scale analysis** — current ratio assessment (is it Major Third? Golden Ratio?)
4. **Color application audit** — 60-30-10 distribution measurement
5. **Performance baseline** — measured Core Web Vitals, not aspirational targets

---

## Issue List (Priority Order)

### CRITICAL (Blocks Progress)

1. **[D2/D6] 44 Subframe Components Undocumented**
   - Location: `packages/app/src/ui/components/` — 44 files
   - Components: Button, Dialog, Drawer, Table, Tabs, Select, TextField, TextArea, LineChart, PieChart, BarChart, AreaChart, Calendar, Accordion, Alert, Badge, Breadcrumbs, Checkbox, ContextMenu, DropdownMenu, FullscreenDialog, IconButton, Loader, Progress, RadioGroup, Slider, Switch, Toast, ToggleGroup, TreeView, VerticalStepper, SidebarWithSections, TopbarWithRightNav, etc.
   - Risk: These are the actual UI building blocks. A UXUI redesign that doesn't know about them will produce designs that can't be implemented efficiently or will require a complete component rewrite.
   - Fix: Add a complete "Component Inventory" section with each component's props, usage count, and Subframe migration status.

2. **[D2] Zero Libre Framework Analysis**
   - Per team lead instruction, this is a mandatory requirement
   - Fix: Add sections for gestalt analysis, archetypal coherence, typography scale ratio, color distribution, and performance baseline

3. **[D6] Subframe Deprecation Migration Risk Not Identified**
   - `@subframe/core` is in `package.json`, 42 app files import from it
   - Confirmed decision #4 says Subframe deprecated → Stitch 2
   - No migration strategy, no component mapping, no effort estimate
   - Fix: Add Subframe→Stitch/shadcn migration risk analysis with component-by-component mapping

### HIGH (Must Fix Before Phase 1)

4. **[D1/D4] Page Layout Specifications Insufficient for CSS**
   - Every page gets 1 line: "Grid of metric cards", "List/card view", "Multi-panel"
   - Need: CSS grid/flex specs, column counts, responsive behaviors, min-widths, overflow strategies
   - Example fix for Dashboard: "CSS Grid `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` for summary cards. Chart section `grid-cols-1 lg:grid-cols-2`. Budget bar full-width. Quick actions `flex flex-wrap gap-2`."

5. **[D6] No Bundle Size / Performance Baseline**
   - Current `packages/app/dist/` = 2.5MB — is this acceptable?
   - No code splitting analysis beyond React.lazy
   - No tree-shaking audit (Subframe components may import entire library)
   - No vendor chunk analysis (react, @xyflow/react, lightweight-charts, codemirror — all heavy)
   - Fix: Add measured bundle analysis with chunk breakdown and optimization targets

6. **[D2] Missing State Management Details**
   - 6 Zustand stores exist: auth-store, ws-store, activity-store, command-store, notification-store, theme-store
   - 11 custom hooks exist: use-activity-ws, use-agora-ws, use-auto-save, use-budget-alerts, use-chat-stream, use-command-center, use-dashboard-ws, use-hub-stream, use-presets, use-queries, use-sse-state-machine
   - Spec documents only 2 stores and 3 hooks
   - Fix: Complete store and hook inventory with per-page mapping

7. **[D3/D5] Legacy Dependencies Inconsistency**
   - `@google/generative-ai@^0.24.1` in server `package.json` — 4 files still import it
   - Files: `embedding-service.ts`, `llm/google.ts`, 2 test files
   - Contradicts confirmed decision #1 (Gemini API banned → Voyage AI)
   - Fix: Flag as tech debt requiring migration before v3

### MEDIUM (Improve Quality)

8. **[D1] Version Number Precision**
   - Spec states React 19.2.4, Vite 6.4.1, Tailwind 4.2.1, Hono 4.12.3
   - `package.json` uses `^19`, `^6`, `^4`, `^4` — actual resolved versions may differ
   - Fix: Either verify against lockfile or use the caret notation from `package.json`

9. **[D2] Missing Pages**
   - `sketchvibe.tsx` — exists in `pages/`, App.tsx comment says "moved to Admin app" but file still present
   - `cron-base.tsx` — lazy loaded in App.tsx but not in spec
   - `argos.tsx` — lazy loaded in App.tsx, has separate route, not just a redirect
   - Fix: Document all page files including deprecated/moved ones with status

10. **[D4] No Component Composition Patterns**
    - How are forms built? (CodeMirror for markdown? `<TextArea>` from Subframe?)
    - How are modals structured? (Subframe `<Dialog>` vs custom?)
    - How are tables rendered? (Subframe `<Table>` vs manual `<table>`?)
    - Fix: Add a "Component Usage Patterns" section

11. **[D6] WebSocket Connection Limits Not in Performance Section**
    - Confirmed decision #10: 50 connections/company, 500/server, 10 msg/s rate limit
    - These are critical performance constraints for the UXUI design (affects real-time features)
    - Fix: Include WebSocket limits in performance targets

---

## Cross-talk Questions for Other Critics

### For Critic-A (Architecture + API) — ux-brand:
1. How should the 44 Subframe components be handled in the redesign? Migrate to shadcn/ui? Rebuild from Stitch 2 output? Hybrid?
2. Should the component inventory be separate from the technical spec or integrated?

### For Critic-B (QA + Security) — visual-a11y:
1. The spec mentions `@subframe/core` components handle their own ARIA attributes. Has this been audited? If we migrate away from Subframe, we need to ensure accessibility parity.
2. The Gemini API references in server code — are there security implications of keeping deprecated API integrations?

---

## What's Working Well

- **API endpoint documentation is thorough** — ~450+ endpoints with methods, paths, and groupings
- **Data model is comprehensive** — 50+ tables with column details and relationship tree
- **Authentication flows are well-specified** — 6 flows with token types, storage locations
- **WebSocket channel map is accurate** — 16 channels verified against codebase
- **Design tokens verified** — all hex values match `sidebar.tsx` and `layout.tsx`
- **Lazy loading pattern correctly documented** — 30 pages confirmed in `App.tsx`
- **Global listeners accurate** — all 5 verified in `layout.tsx:8-12,102-103,200-201`
- **v3 additions section is forward-looking** — properly separates current vs upcoming

---

## Verdict

**5.55/10 — FAIL (requires rewrite)**

The spec excels at backend documentation (APIs, data model, auth) but **critically underserves the UXUI redesign purpose**:
1. The actual component library (44 Subframe components) is invisible
2. No Libre framework analysis means downstream phases have no design foundation to build on
3. Performance risks are unidentified — a 2.5MB bundle with deprecated dependencies needs attention
4. Page-level CSS specifications are too thin for implementers

**Recommended actions for R2:**
1. Add complete Subframe component inventory with usage count and migration status
2. Apply Libre framework: gestalt audit, archetypal analysis, typography scale, color 60-30-10
3. Add bundle size breakdown and performance baseline measurements
4. Expand page layout specs to include CSS grid/flex patterns and responsive behaviors
5. Complete store/hook inventory with per-page mapping
6. Flag all legacy dependency risks (Gemini, Subframe)

---

*Critic-C (Tech + Performance) — Amelia + Bob*
*R1 Review completed: 2026-03-23*

---

# R2 Re-Review — Critic-C (Tech + Performance)

**Document:** `_uxui_redesign/phase-0-foundation/spec/technical-spec.md` (1,170 → 1,651 lines)
**Date:** 2026-03-23
**Delta:** +481 lines (new sections 5.4.1-5.4.4, 7.5b, 7.6, 7.10, 7.12/7.11.x, 8.2)

---

## R2 Dimensional Scores

| Dimension | Weight | R1 | R2 | Delta | Rationale |
|-----------|--------|-----|-----|-------|-----------|
| D1 Specificity | 20% | 7 | 8 | +1 | Subframe inventory has file names + key props per component. Gestalt cites specific values (24px gap, `border-[#e5e1d3]`, ΔE < 3). Typography ratios quantified. Color distribution measured (50/25/25%). A11y contrast ratios calculated. Still: perf targets remain vague ("±10% of baseline"), page CSS layouts unchanged. |
| D2 Completeness | 20% | 4 | 7 | +3 | Major improvement. All 6 stores, 11 hooks, 5 libs documented. Subframe inventory (42 of 44 — see issues). Gestalt 5 principles + typography scale + color 60-30-10 + design masters. A11y baseline. Bundle size. Known violations. Still missing: archetypal coherence (Libre dimension #1), 2 components (Calendar.tsx, ToggleGroup.tsx), JetBrains Mono CDN bug, WebSocket implementation details. |
| D3 Accuracy | 15% | 7 | 7 | 0 | Verified: `prefers-reduced-motion` = 0 occurrences ✓. But: `aria-live` count wrong (spec says 8, actual is 5 across 4 files). Section 8.2 references "Confirmed Decisions Stage 1 #5" for Gemini ban — should be #1 (Embedding Provider); #5 is Observation TTL. DefaultPageLayout listed under `ui/components/` but actually in `ui/layouts/`. Section numbering: parent 7.12 contains children 7.11.x. |
| D4 Implementability | 15% | 6 | 7 | +1 | Store/hook dependencies now clear — developers know which hooks drive which pages. Subframe migration strategy with priority order (Form→Dialog→Data Display). Typography recommendation with target scale. A11y fixes are specific and actionable. Page CSS layouts still brief. |
| D5 Consistency | 10% | 8 | 7 | -1 | New inconsistencies introduced: section numbering (7.12 parent → 7.11.x children), decision reference error (#5→#1). Minor: component category counts (10+7+5+5+5+3+3+4+1 = 43 listed, 44 claimed, 2 missing). |
| D6 Risk Awareness | 20% | 3 | 7 | +4 | Major improvement. Subframe deprecation with migration strategy ✓. Gemini API flagged ✓. 428 color inconsistencies ✓. A11y risks quantified (contrast, reduced-motion, keyboard) ✓. Bundle size optimization targets ✓. Still missing: WebSocket risks (no max retry, no jitter, thundering herd, per-tab connections), JetBrains Mono CDN bug (71 files, 189 uses, font never loaded), Core Web Vitals estimates. |

---

## R2 Weighted Average: 7.20/10 — PASS

Calculation: (8×0.20) + (7×0.20) + (7×0.15) + (7×0.15) + (7×0.10) + (7×0.20) = 1.60 + 1.40 + 1.05 + 1.05 + 0.70 + 1.40 = **7.20/10**

### Auto-Fail Check
- No dimension below 3 ✓
- No hallucination ✓
- No security holes ✓
- No build-breaking proposals ✓

---

## R1 CRITICAL Issues — Resolution Status

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | 44 Subframe components undocumented | **RESOLVED** | Section 7.5b: 9-category inventory with file names, @subframe/core status, key props. Migration strategy included. |
| 2 | Zero Libre framework analysis | **MOSTLY RESOLVED** | Gestalt 5 principles ✓, typography scale ✓, color 60-30-10 ✓, design masters ✓. Missing: archetypal coherence (Libre dimension #1 — what Jungian archetype does CORTHEX embody?). |
| 3 | Subframe deprecation risk unflagged | **RESOLVED** | Section 8.2 Known Violations table + migration strategy in 7.5b. |

## R1 HIGH Issues — Resolution Status

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 4 | Page CSS layouts too thin | **UNRESOLVED** | Still 1-line descriptions per page. |
| 5 | No bundle size baseline | **RESOLVED** | Section 7.10: app 2.5MB, admin 2.4MB, server 15MB with contributors and optimization targets. |
| 6 | Incomplete store/hook inventory | **RESOLVED** | Sections 5.4.1-5.4.4: all 6 stores, 11 hooks, 5 lib modules with file paths, dependencies, key state. |
| 7 | Gemini legacy deps unflagged | **RESOLVED** | Section 8.2: 2 files identified, decision referenced, action stated. (Note: wrong decision # — see issues below.) |

---

## Remaining Issues (Non-Blocking)

### SHOULD-FIX (Before Phase 1 Start)

1. **[D3] Confirmed decision reference error** — Section 8.2 says "Confirmed Decisions Stage 1 #5" for Gemini ban. Actual: #1 is Embedding Provider (Gemini → Voyage AI), #5 is Observation TTL. Source is also `feedback_no_gemini.md`, not just confirmed decisions.

2. **[D3] `aria-live` count wrong** — Section 7.6.2 claims 8 occurrences. Actual: 5 occurrences across 4 files (`secretary-hub-layout.tsx:1`, `message-thread.tsx:1`, `pipeline-visualization.tsx:2`, `chat-area.tsx:1`).

3. **[D2] 2 components missing from inventory** — `Calendar.tsx` and `ToggleGroup.tsx` exist in `packages/app/src/ui/components/` but not in Section 7.5b. Component count should be 44 in directory, 42 in inventory.

4. **[D3] DefaultPageLayout mislocated** — Listed under `ui/components/` in Section 7.5b but actually at `ui/layouts/DefaultPageLayout.tsx`.

5. **[D5] Section numbering** — Section 7.12 "Design System Analysis" has subsections numbered 7.11.1-7.11.4 (should be 7.12.1-7.12.4).

### NICE-TO-HAVE (Phase 1 Can Address)

6. **[D2] Archetypal coherence** — Libre framework dimension #1 not present. What archetype does CORTHEX embody? (Commander? Sage? Ruler?) This informs color/typography/layout decisions in Phase 1.

7. **[D6] JetBrains Mono CDN bug** — `index.html` loads only Inter + Noto Serif KR. JetBrains Mono defined in `index.css:36` as CSS variable but never fetched via CDN/import. 71 files, 189 `font-mono` uses → all fall back to OS default monospace. (Discovered by Critic-B, confirmed by Critic-C.)

8. **[D6] WebSocket implementation risks** — `ws-store.ts` has: no max retry limit (retries forever at 30s), no jitter (thundering herd if 50 clients reconnect simultaneously), JWT in URL query param (visible in server logs), per-tab connections (no SharedWorker). Spec says "Automatic with backoff" — accurate but omits these risks.

9. **[D6] No Core Web Vitals estimates** — LCP, FID, CLS not estimated for current state. "±10% of baseline" without stating the baseline is unmeasurable.

---

## Cross-talk Findings (Incorporated from R1)

| Source | Finding | Incorporated in R2? |
|--------|---------|-------------------|
| Critic-A | 22 lazy-loaded page chunk size budget needed | Partially — bundle total added, per-chunk breakdown missing |
| Critic-A | Admin app (25 routes) absent from spec | Not addressed — scope decision TBD |
| Critic-A | PixiJS ≤200KB gzip from product brief | ✅ Added to Section 7.10 |
| Critic-B | JetBrains Mono CDN gap | Not addressed — SHOULD-FIX |
| Critic-B | ARIA live regions for 16 WebSocket channels | Partially — a11y section added but WebSocket-specific ARIA not detailed |
| Critic-B | Color contrast measurements | ✅ Added to Section 7.6.1 |

---

## Verdict

**7.20/10 — PASS (conditional)**

The R2 revision is a substantial improvement (+4.0 delta from D6 alone). The three CRITICAL issues from R1 are resolved or mostly resolved. The spec is now usable as a Phase 0 foundation document.

**Conditions for clean pass:**
- Fix the 5 SHOULD-FIX items (all are quick edits: number corrections, 2 missing components, section renumbering)
- Archetypal coherence can be deferred to Phase 1 design system planning

**What improved most:** D6 Risk Awareness (+4) — Subframe deprecation, Gemini violation, a11y gaps, bundle size now documented.
**What still needs attention:** Page CSS layouts remain thin for implementers, but this can reasonably be a Phase 1 deliverable rather than Phase 0.

---

*Critic-C (Tech + Performance) — Amelia + Bob*
*R2 Re-review completed: 2026-03-23*
