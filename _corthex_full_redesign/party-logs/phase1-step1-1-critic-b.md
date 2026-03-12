# Phase 1-1 Web Dashboard Layout Research — CRITIC-B Review
**Date**: 2026-03-12
**Reviewer**: CRITIC-B (Amelia / Quinn / Bob)
**File reviewed**: `_corthex_full_redesign/phase-1-research/web-dashboard/web-layout-research.md` (lines 1–720)
**Round**: 1

---

## Amelia (Frontend Dev) — Implementation Feasibility

**Overall**: The Tailwind CSS code blocks are specific and largely correct — `flex h-screen bg-zinc-950 overflow-hidden`, `transition-[width] duration-250 ease-in-out`, explicit `shrink-0` on fixed-width columns. The width math is verified correct at both 1440px and 1280px. The `cn()` pattern and `useEffect` for SSE-driven TrackerPanel are realistic implementations.

**Issue 1 — Fabricated URL path (critical)**:
Line 711: `https://ui.shadcn.com/docs/components/radix/sidebar` — the `/radix/` path segment does not exist in the shadcn/ui documentation tree. The actual sidebar component docs live at `https://ui.shadcn.com/docs/components/sidebar`. This appears to be a hallucinated URL. All code references to `SidebarProvider` should be verified against the real shadcn/ui sidebar API before any implementation.

**Issue 2 — Option C SessionPanel width mismatch**:
Line 609: Option C uses `SessionPanel className="w-72 shrink-0"` (288px) and labels it `w-72=288px` in the width math. However, the technical spec mandates `w-64` (256px) for SessionPanel to match the current `SessionSidebar` width, and Option A/B correctly use `w-64`. This is an internal inconsistency within the TOP 3 options. Option C width math based on `w-72` gives an incorrect baseline for comparison.

**Issue 3 — TrackerPanel `transition-[width]` vs. GPU compositing**:
Width transitions trigger layout reflow on every frame. At 1280px minimum viewport where the panel jumps from `w-12` (48px) to `w-80` (320px), the CSS engine must recalculate the entire flex row. For a panel receiving SSE `handoff` events at 3–5 per chain, this is a measurable performance risk. The tech spec itself says "Use `transition-[transform,opacity]` (NOT `transition-all`) for Tracker rows" precisely to avoid repaints — the same rationale applies to the container, which should note whether `transform: translateX()` is viable as an alternative to `width` transitions.

---

## Quinn (QA + A11y) — WCAG AA Compliance

**Issue 4 — No `prefers-reduced-motion` in any animation spec (critical for WCAG 2.1 AA)**:
Options A, B, and C all specify TrackerPanel animations (`transition-[width] duration-250 ease-in-out`), SSE step slide-ins (`translateY(20px)→0`, `duration-300`), and status dot changes (`200ms ease-in-out`) without any `prefers-reduced-motion` consideration. Per WCAG 2.1 Success Criterion 2.3.3 (Animation from Interactions, AA), motion-triggered animations must respect the OS preference. The research should specify: `@media (prefers-reduced-motion: reduce) { .tracker-panel { transition: none; } }` or Tailwind's `motion-reduce:transition-none` class. This is absent across all three options.

**Issue 5 — No ARIA landmark roles for 3-column layout**:
The research presents three layout options with multi-panel shells but never specifies `role` or `aria-label` for the panels. The TrackerPanel is a live-updating region (SSE events) and should be `role="complementary" aria-label="Agent Delegation Tracker"` with `aria-live="polite"` for SSE step insertions. The ChatArea should be `role="main"`. The SessionPanel should be `role="navigation" aria-label="Session history"`. Without these landmarks, keyboard users and screen reader users lose structural orientation in a 4-panel layout. The research references competitor products (W&B, shadcn/ui) without noting whether they solved this — W&B in particular is known to have a11y gaps.

**Issue 6 — Color-only status indicators without text backup**:
Line 401 ASCII art shows `●비서실장 (D1)` and `○ idle` — colored dots as status signals. The research correctly references green/amber/red dots but never specifies text-based fallbacks or `aria-label` values for the dots. For WCAG 1.4.1 (Use of Color, A), status must not be conveyed by color alone. The research should mandate `<span class="sr-only">online</span>` alongside each status dot.

---

## Bob (Performance) — Load Time, Animation, Assets

**Issue 7 — Option B auto-collapse 3-second timer is arbitrary and user-hostile**:
Line 519–522: `if (sseEvent?.type === 'complete') { setTimeout(() => setIsTrackerExpanded(false), 3000); }` — The 3-second window after task completion is presented without any UX research basis. A CEO reviewing a 12-page investment report's delegation chain may need 15–30 seconds to review costs and agent attribution. Auto-collapsing at 3s destroys the "Commander's View" principle from Phase 0. This needs either user-test validation data or removal — the option con says "may feel abrupt" but does not flag that 3000ms was chosen arbitrarily.

**Issue 8 — No bundle size comparison for panel libraries**:
Line 714 references `react-resizable-panels` but Option A/B use pure CSS `flex` with no resize capability. The research never mentions bundle size for `react-resizable-panels` (~12KB gzipped). For the Oracle 4-core ARM64 server with self-hosted runner, Docker build size matters. The research should at minimum note that Options A/B use zero-library CSS flex while Option C's horizontal TrackerPanel could leverage `react-resizable-panels` for user-controlled height — and flag the tradeoff.

---

## Summary of Issues (Priority Order)

| # | Issue | Severity | Affects |
|---|-------|----------|---------|
| 1 | Fabricated URL: `shadcn/docs/components/radix/sidebar` | High — bad reference | All options using shadcn SidebarProvider |
| 4 | No `prefers-reduced-motion` in any option's animation spec | High — WCAG 2.1 AA | All options |
| 5 | No ARIA landmark roles for multi-panel layout | High — WCAG structural | All options |
| 2 | Option C SessionPanel `w-72` instead of spec `w-64` | Medium — spec drift | Option C |
| 6 | Color-only status dots, no text fallback | Medium — WCAG 1.4.1 | TrackerPanel (all options) |
| 7 | Option B 3s auto-collapse is arbitrary | Medium — UX validity | Option B |
| 3 | `transition-[width]` layout reflow vs. GPU compositing | Low-Medium — perf | All options (container) |
| 8 | No bundle size note for `react-resizable-panels` | Low — completeness | Option C reference |

---

## Scores (pre-fix)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Real URLs | 8/10 | 1 fabricated path (shadcn radix sidebar) |
| Specificity (Tailwind/ASCII/px) | 9/10 | Strong — width math correct, code blocks precise |
| TOP 3 fit to CORTHEX constraints | 8/10 | Option C SessionPanel width error; Option B timer issue |
| Honest cons/tradeoffs | 8/10 | Good on width math; weak on Option B timer validity |
| No vague/abstract descriptions | 9/10 | Very concrete throughout |
| A11y coverage | 4/10 | Missing prefers-reduced-motion, ARIA landmarks, color-only |
| Performance coverage | 6/10 | Good on transition-[width] vs transition-all; silent on GPU compositing |

**Overall Score: 7.2 / 10**

**Minimum required fixes before Round 2 approval**:
1. Fix or remove `docs/components/radix/sidebar` URL
2. Add `prefers-reduced-motion` spec to all three options
3. Add ARIA landmark roles to at least Option A's Tailwind code block
4. Fix Option C SessionPanel to `w-64` (256px)
5. Add text/sr-only backup for status dots

---

*CRITIC-B sign-off: Amelia / Quinn / Bob — Round 1*

---

## Round 2 Verification

| Fix | Status | Notes |
|-----|--------|-------|
| P1: shadcn URL (`/radix/sidebar`) | ✅ Fixed | Line 853: `https://ui.shadcn.com/docs/components/sidebar` |
| P2: Option C demoted, new option added | ✅ Fixed | New Option C = "Resizable Commander Panels" (`react-resizable-panels`). Old Status Rail → "Alternative Considered / Not Recommended" section with rationale + salvageable element note |
| P3: `prefers-reduced-motion` / `motion-reduce:transition-none` | ✅ Fixed | All transition classes in Options A/B/C now include `motion-reduce:transition-none` |
| P4: W&B LEET clarified (terminal vs web) | ✅ Fixed | Line 119-123: clearly states LEET is a TUI (not web dashboard). Grafana added as web 3-pane reference. Sources table updated |
| P5: NEXUS standalone ASCII diagrams | ✅ Fixed | Dedicated NEXUS Canvas State diagrams with width math added to all 3 options |
| P6: ARIA landmark roles in code blocks | ✅ Fixed | All 3-column code blocks have `<nav aria-label="Sessions">`, `<main>`, `<aside role="complementary" aria-label="Handoff Tracker" aria-live="polite" aria-atomic="false">` |
| P7: 464px ChatArea con strengthened | ✅ Fixed | Now references GitHub ~740px norm, CORTHEX ~600px minimum, recommends 1440px soft-minimum for Hub route |
| P8: Option C SessionPanel `w-72` → `w-64` | ✅ N/A (Option C replaced entirely) | New Option C uses percentage-based sizing; not applicable |
| P9: Option B 3s auto-collapse flagged as assumption | ✅ Fixed | Lines 590-594: `// ⚠️ ASSUMPTION — requires user testing validation` comment added |

**One minor remaining note**: W&B section header still reads "Layout Pattern (3-pane dashboard)" (line 104) while the body text now correctly explains the web dashboard is 2-column. Section header is slightly misleading. Minor — does not affect implementation decisions.

**Round 2 Score: 9.0 / 10**
- All 9 mandatory fixes applied correctly
- New Option C (Resizable Panels) is genuinely superior to the replaced Status Rail: addresses 464px ChatArea problem via user control, adds localStorage persistence, has real-world VS Code/Grafana precedent
- Recommendation table updated with WCAG and ARIA rows
- W&B section header minor inconsistency (-0.5)
- Option B 3s assumption now clearly flagged but not removed (-0.5)

**CRITIC-B sign-off: Amelia / Quinn / Bob — Round 2 APPROVED (9.0/10)**
