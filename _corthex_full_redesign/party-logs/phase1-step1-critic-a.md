# Phase 1 Step 1-1 — Critic A Review (Sally / Marcus / Luna)

**Date**: 2026-03-12
**Document reviewed**: `_corthex_full_redesign/phase-1-research/web-dashboard/web-layout-research.md`
**Round**: 1

---

## Sally (UX Designer) — User Journey & Cognitive Load

The document does an excellent job cataloguing reference products and deriving layout patterns, but it almost entirely **ignores how a non-developer first encounters the 3-column layout**. CORTHEX's primary persona (비개발자 조직 관리자, 김대표) has no mental model for a 3-pane monitoring dashboard — they're used to chat interfaces. The TrackerPanel is described as "the product's emotional centerpiece" in the Vision doc, but the research doesn't surface a single finding about *first-run disclosure* or *progressive reveal*. There is no citation from any of the 10 reference products about onboarding the 3-column layout to new users. W&B and Anthropic Console are developer tools with developers as users — the cognitive load transfer to a CEO audience is unaddressed.

**Issue 1 (Critical)**: Option C violates the established Phase 0 3-column Hub spec, yet is presented as a co-equal TOP 3 option alongside two valid options. The document itself admits: "Violates Phase 0 3-column Hub spec: Technical spec explicitly defines TrackerPanel as a right sidebar column, not a bottom section." Option C also "regresses to current state." Presenting a spec-violating regression as a "TOP 3" option creates false equivalence and muddies the recommendation. Option C should be demoted to "Alternative Considered — Not Recommended" with a clear reason, and replaced in TOP 3 with a genuinely different valid alternative (e.g., a resizable-panels variant using `react-resizable-panels`). Including a bad option inflates the decision space for party mode without adding value.

**Issue 2 (Moderate)**: The Hub-first focus means **NEXUS canvas layout** — P1 priority per Vision doc Section 6.2 — gets only brief notes across all three options. There is no standalone NEXUS layout analysis despite NEXUS being the most architecturally distinct page (React Flow full-bleed + slide-in config panel). The research treats NEXUS as an afterthought when it deserves its own ASCII diagram and constraint table. At minimum, the 3 options should have explicit NEXUS-state ASCII art the same way they have Hub-state ASCII art.

---

## Marcus (Visual Designer) — Visual Hierarchy & Aesthetic Quality

The layout descriptions are genuinely strong: ASCII diagrams, Tailwind class blocks, pixel math, z-layer specs. The quality here is well above the minimum bar. Specific praise: the TrackerPanel collapse animation spec (opacity fade → width transition) and the `transition-[width]` vs `transition-all` distinction is exactly the kind of specificity that prevents implementation mistakes.

**Issue 3 (Moderate)**: The **shadcn/ui sidebar URL is incorrect**. The document cites `https://ui.shadcn.com/docs/components/radix/sidebar` — the `/radix/` path segment does not exist in shadcn's docs structure. The correct URL is `https://ui.shadcn.com/docs/components/sidebar`. This is a fabricated or corrupted URL. Minor but a credibility issue: if references are being cited inaccurately, the research conclusions built on those references become suspect.

**Issue 4 (Minor)**: Option A's "Cons" section correctly flags 464px ChatArea at 1280px as "tight but workable" — but stops there. **464px is legitimately problematic for markdown rendering**: a 12-page investment report with tables, headers, and code blocks will feel claustrophobic at 464px. This should be a stronger con: "At 1280px, ChatArea = 464px. For reference, GitHub renders markdown prose at ~740px. CORTHEX reports (investment analysis, structured briefings) will wrap aggressively. Consider enforcing a 1440px soft-minimum or documenting acceptable degradation explicitly." The current treatment undersells this real UX pain point.

---

## Luna (Brand Strategist) — CORTHEX Brand Fit & AI Org Identity

The brand alignment is largely strong. Correctly identifying W&B 3-pane as the closest reference for the "Commander's View" principle is the right call — it maps the "always watching, always running" ethos from the Vision doc onto a real precedent. The rejection of Anthropic Console's warm cream palette in favor of cool zinc dark is correct per Phase 0 brand principles.

**Issue 5 (Moderate — Research Accuracy)**: The document elevates W&B's "LEET terminal UI" as the "STRONGEST reference for CORTHEX Hub's 3-column design" and cites a Beamer changelog URL (`app.getbeamer.com/wandb/en/meet-wb-leet-a-new-terminal-ui-for-weights-biases-JXSFhyt2`). This URL cannot be verified and the **W&B LEET interface is a terminal/TUI (text user interface) tool** — not a web dashboard. The main W&B web dashboard (`wandb.ai`) is primarily 2-column sidebar + main area with metric charts, **not** a persistent 3-pane layout. The 3-pane layout described may be specific to the CLI/TUI mode, not the browser UI that CORTHEX users would recognize as precedent. If the W&B 3-pane claim is based on a terminal tool rather than a web dashboard, it weakens the "strongest precedent" assertion. The document should verify whether the 3-pane behavior is in the W&B *web* UI or only in the terminal tool, and clarify accordingly.

**Issue 6 (Minor)**: The research only validates dark-first for developer/monitoring tools (W&B, Neon, Supabase) — all of which have developer-heavy user bases. CORTHEX's primary user is a **non-developer CEO**. There is zero citation from business management tools (e.g., Notion, Monday.com, ClickUp, Asana) about dark mode adoption in that segment. The Vision doc's Principle 7 justifies dark-first on "command centers, trading terminals, developer tools" — but 비개발자 조직 관리자 may be less familiar with dark interfaces than the references assume. This doesn't change the recommendation, but a credible research doc would acknowledge this counterargument and explain why the professional/authority signal outweighs the familiarity gap.

---

## Summary of Issues

| # | Severity | Category | Issue |
|---|----------|----------|-------|
| 1 | **Critical** | Structure | Option C is spec-violating regression, presented as equal TOP 3 option — should be demoted to "Not Recommended" |
| 2 | **Moderate** | Coverage | NEXUS canvas layout has no dedicated analysis or ASCII art — P1 feature treated as afterthought |
| 3 | **Moderate** | Reference Accuracy | shadcn/ui sidebar URL is fabricated/wrong (`/radix/sidebar` path does not exist) |
| 4 | **Minor** | Specificity | 464px ChatArea con is understated — needs markdown rendering implications called out explicitly |
| 5 | **Moderate** | Research Accuracy | W&B 3-pane claim may be for terminal/TUI mode, not web dashboard — requires verification/clarification |
| 6 | **Minor** | Coverage | Dark-first validation only from developer tools — non-developer CEO counterargument unaddressed |

---

## Round 1 Score: **6.5 / 10**

**Strengths**: Specific Tailwind classes, pixel math, width calculations, honest Option C cons, good reference breadth.
**Weaknesses**: Option C structural problem, W&B reference accuracy concern, shadcn URL error, NEXUS coverage gap, 464px severity undersold.

**Priority fixes for Round 2**:
1. Demote Option C to "Alternative Considered / Not Recommended" section; promote react-resizable-panels or another valid variant as Option C
2. Add NEXUS-state ASCII art to Options A and B (at minimum)
3. Fix shadcn sidebar URL to `https://ui.shadcn.com/docs/components/sidebar`
4. Strengthen 464px ChatArea con with markdown rendering context
5. Clarify W&B 3-pane source: web dashboard vs. terminal TUI — or replace with web-only reference

---
*Critic A review complete. Sending to Critic B for cross-talk.*
