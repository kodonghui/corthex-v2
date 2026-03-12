# Phase 1-2 App SPA Layout Research — CRITIC-B Review
**Date**: 2026-03-12
**Reviewer**: CRITIC-B (Amelia / Quinn / Bob)
**File reviewed**: `_corthex_full_redesign/phase-1-research/app/app-layout-research.md` (lines 1–980)
**Round**: 1

---

## Amelia (Frontend Dev) — Implementation Feasibility

**Overall**: Significantly improved over Phase 1-1 draft. Width math is correct, Tailwind classes are specific and accurate throughout all three options. Section label and collapsible section patterns are realistic. Hub override is addressed in all three options.

**Issue 1 — Hub Override: ASCII art only, no JSX code block (Option A & B)**:
Option A shows Hub override as a small ASCII art diagram (lines 567-577) with a one-line comment `// Hub page renders its own 3-column layout as a full-screen override`. No Tailwind/JSX code block is provided showing the actual `<nav>/<main>/<aside>` structure with ARIA landmarks and `motion-reduce:transition-none`. Option B references "Same as Option A" without its own code. This is inconsistent with Phase 1-1's Options A/B which had full code blocks. The Hub layout is P0 — it needs a complete code block here too.

**Issue 2 — `useLocalStorage` hook: library unspecified**:
Option B (line 684) uses `useLocalStorage('nav-section-${label}', defaultOpen)` as if it's a standard React hook. It is not — this requires either `usehooks-ts`, `react-use`, or a custom implementation. Option A also uses it briefly. The codebase currently uses Zustand + TanStack Query (per Technical Spec). The research should specify which library provides `useLocalStorage` or recommend a pattern (e.g., `useState` + `useEffect` with `localStorage.setItem/getItem`). Without this, the implementation detail is incomplete.

**Issue 3 — Option C Hub/Context Panel interaction: vague specification**:
Line 913: "Hub renders 3-column layout. Context panel closes (or hidden behind Hub layout)" — the parenthetical "or hidden behind" is ambiguous. These are architecturally different behaviors: (a) navigating to Hub programmatically closes the context panel (calls `setActiveSection(null)`) vs (b) the Hub layout visually covers the context panel without closing state. Behavior (a) is clean; behavior (b) causes stale open-state. The recommendation table flags "⚠️ Context panel conflict" but never resolves it. This needs a definitive spec.

**Issue 4 — `사령관실` counted as ungrouped item 3: questionable**:
Line 30-31 in constraints recap: `💭 사령관실 (old name, maps to Hub)` is listed as the third ungrouped sidebar item making the total 27. If it "maps to Hub" (i.e., it's a redirect or alias), it arguably should not appear as a separate sidebar item in the redesign — it creates nav confusion when both `🔗 허브` and `💭 사령관실` appear as separate entries pointing to the same page. The research accepts this as-is without questioning removal. This affects the sidebar item count (27 vs 26) and all of Option A's viewport height math (`27 × 36px ≈ 1100px`).

---

## Quinn (QA + A11y) — WCAG AA Compliance

**Good news**: All three options include `motion-reduce:transition-none` throughout (lessons learned from 1-1), and `aria-label` attributes are present on all `<nav>` elements. `aria-expanded` is used on the Option B collapsible button. This is a significant improvement.

**Issue 5 — `aria-current="page"` missing on NavItem active state**:
Option A's `NavItem` component (lines 549-563) uses an `active` prop to apply visual styles but does NOT include `aria-current={active ? "page" : undefined}`. Per WCAG 2.1 Success Criterion 1.3.1 (Info and Relationships), the current page in navigation must be programmatically determinable. Screen readers announce `aria-current="page"` as "current" when reading navigation landmarks. Without it, blind users navigating the sidebar cannot identify which page is active. Required fix:
```tsx
<a
  href={href}
  aria-current={active ? "page" : undefined}
  className={cn(...)}
>
```

**Issue 6 — Option B NavSection missing `aria-controls`**:
Option B's collapsible NavSection button (lines 690-708) has `aria-expanded={isOpen}` but is missing `aria-controls="section-업무-items"` (or equivalent `id`). Per ARIA authoring practices for disclosure widgets, `aria-expanded` alone without `aria-controls` does not tell screen readers which content is controlled. The collapsible content `<div>` needs `id="nav-section-업무"` and the button needs `aria-controls="nav-section-업무"`. Without this pairing, screen readers cannot skip directly to the expanded content.

---

## Bob (Performance) — Load Time, Animation, Assets

**Issue 7 — `document.startViewTransition()` browser support not documented**:
Line 605: `document.startViewTransition()` is listed as Option A's page transition feature with an MDN URL. The View Transition API has been available in Chromium-based browsers since Chrome 111 (2023) but Firefox support landed in version 130 (September 2024) and Safari support is in 18.2 (December 2024). For CORTHEX's professional user base (likely using modern Chrome), this is acceptable. However, the research does not mention: (1) the browser support table, (2) that it requires a `!document.startViewTransition` guard for fallback, (3) that the `prefers-reduced-motion` guard mentioned (line 605) must specifically check `prefers-reduced-motion: reduce` before calling the API. The MDN source is real and cited, but the implementation guidance is incomplete.

**Issue 8 — `ai-toolbox.co` URL is non-authoritative**:
Line 962: `https://www.ai-toolbox.co/chatgpt-management-and-productivity/chatgpt-sidebar-redesign-guide` is a third-party blog, not an official OpenAI/ChatGPT source. ChatGPT's sidebar is publicly observable at `chatgpt.com` — no secondary source citation needed. The official ChatGPT help center or OpenAI blog would be the appropriate citation if needed. This weakens the research bibliography's authority.

**Issue 9 — `microsoft.design` URL cited but no corresponding analysis section**:
Line 972: `https://microsoft.design/articles/the-new-ui-for-enterprise-ai/` is listed in Sources as "Microsoft Enterprise AI UI" but there is NO corresponding analysis section in Part 1 (8 products analyzed: ChatGPT, Claude.ai, Notion, Linear, Slack, GitLab, n8n, Perplexity). This citation appears to be a loose end — either remove it from sources or add a brief analysis of how Microsoft's enterprise AI UI patterns inform CORTHEX's design.

---

## Summary of Issues (Priority Order)

| # | Issue | Severity | Affects |
|---|-------|----------|---------|
| 1 | Hub Override: no JSX code block (ASCII only for Options A/B) | Medium — implementation gap | Options A, B |
| 2 | `useLocalStorage` library not specified | Medium — implementation ambiguity | Options A, B |
| 3 | Option C Hub context panel "closes OR hidden" — vague | Medium — interaction design incomplete | Option C |
| 4 | `사령관실` counted as item #3 without questioning removal | Medium — sidebar count accuracy | All options (count = 27 vs 26) |
| 5 | `aria-current="page"` missing on active NavItem | Medium — WCAG 1.3.1 | All options |
| 6 | NavSection missing `aria-controls` | Low-Medium — ARIA disclosure widget | Option B |
| 7 | `startViewTransition()` browser support/fallback not documented | Low — implementation detail | Option A |
| 8 | `ai-toolbox.co` non-authoritative citation | Low — bibliography quality | Sources |
| 9 | `microsoft.design` URL in sources but no analysis | Low — loose end | Sources |

---

## Score (Round 1)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Real URLs | 8/10 | `ai-toolbox.co` is non-official; `microsoft.design` is unused. Other URLs look real |
| Specificity (Tailwind/ASCII/px) | 9/10 | Width math correct, code blocks detailed, sidebar height math included |
| TOP 3 address 27-item challenge | 9/10 | All three options directly tackle the density problem with specific strategies |
| Hub 3-column properly handled | 7/10 | ASCII art present but no code block for Hub in Options A/B; Option C vague |
| ARIA + motion-reduce coverage | 7/10 | motion-reduce ✓ everywhere; aria-current missing; aria-controls missing |
| No vague descriptions | 8/10 | Option C Hub panel behavior is the main vague point |

**Overall Score: 8.0 / 10**

**Minimum required fixes for Round 2 approval:**
1. Add Hub JSX code block to Option A (with ARIA landmarks) — Option B can reference it
2. Specify `useLocalStorage` library (or replace with inline `useState` + `useEffect` pattern)
3. Resolve Option C Hub: state explicitly that navigating to Hub calls `setActiveSection(null)`
4. Add `aria-current={active ? "page" : undefined}` to NavItem
5. Add `aria-controls` to Option B NavSection button

---

*CRITIC-B sign-off: Amelia / Quinn / Bob — Round 1*
