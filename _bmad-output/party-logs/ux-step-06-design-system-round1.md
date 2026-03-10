# Party Mode Round 1: Collaborative Review — Design System

**Step:** step-06-design-system
**Round:** 1 (Collaborative)
**Date:** 2026-03-11

## Expert Panel

- **Sally (UX)**: Design system completeness
- **Amelia (Dev)**: Implementation feasibility
- **Winston (Architect)**: Architecture alignment
- **Quinn (QA)**: Visual regression testability

## Review Discussion

**Sally (UX):** This is an excellent design system specification — color tokens, typography scale, spacing, component tokens all with exact Tailwind classes. The dual layout for hub (비서 있음/없음) is clearly diagrammed. However, I notice the color system doesn't define **focus ring** styles for accessibility. All interactive elements need visible focus indicators for keyboard navigation. Also, the button table shows 5 variants but doesn't include a **loading** state — buttons that trigger async operations (like 저장, 생성) need a loading spinner state.

**Amelia (Dev):** The typography stack uses Pretendard — excellent choice for Korean/English mixed content. JetBrains Mono for code is also good. Implementation question: the CSS custom properties (--bg-base, etc.) are defined but we're using Tailwind. Are these CSS variables meant to be in addition to Tailwind, or replacing them? In practice, we'd use Tailwind classes directly (bg-slate-950) rather than CSS vars. The CSS vars are useful for theming (Phase 3 light mode), so we should clarify they're for future theming and Tailwind classes are the primary implementation.

**Quinn (QA):** The shadow/elevation table has 5 levels — good for visual regression testing. The animation specs have exact durations which I can verify with Playwright. One gap: the reduced motion media query is CSS but our components use Tailwind. Should use Tailwind's `motion-reduce:` variant instead of raw CSS for consistency.

## Issues Found

1. **[ISSUE-R1-1] Missing Focus Ring Accessibility Styles** — No focus indicator defined for interactive elements. WCAG 2.1 requires visible focus for keyboard navigation.

2. **[ISSUE-R1-2] Button Loading State Missing** — Async buttons need loading spinner variant (disable + spinner + "처리 중..." text).

## Fixes Applied

- **ISSUE-R1-1**: Added focus ring style to 5.4: `focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none`
- **ISSUE-R1-2**: Added Loading button variant to button table
