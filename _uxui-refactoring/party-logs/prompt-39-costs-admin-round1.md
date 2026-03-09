# Party Mode Review: Prompt 39 — Costs Admin (Round 1: Collaborative)

## Expert Panel

1. **UI/UX Designer**: The spec uses `slate-*` color palette throughout, but the actual implementation uses `zinc-*` with proper light/dark mode support. This is a systemic mismatch that would produce incorrect wireframes.
2. **Frontend Developer**: The code uses shared UI components (`Card`, `CardContent`, `Skeleton`, `Tabs`, `Toggle`, `Input`, `Button`, `ProgressBar` from `@corthex/ui`), but the spec describes raw HTML/CSS. This misrepresents the component architecture.
3. **Design System Lead**: The progress bar section has a contradiction -- it hardcodes thresholds at 80%/100% in the data section, then says "not hardcoded at 80%" in UX considerations. The code uses a `<ProgressBar>` component.
4. **Accessibility Expert**: The chart bar color is specified as `bg-cyan-400` but code uses `bg-indigo-500 dark:bg-indigo-400`. Wrong color entirely.
5. **Data Architect**: The tooltip uses `bg-slate-900` in spec but `bg-zinc-800` in code. Minor but inconsistent.
6. **QA Engineer**: Chart period button styling uses `bg-blue-600/20 text-blue-400` in spec but `bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300` in code.
7. **Product Manager**: Missing documentation of toast notifications for budget save success/error, and shared dependencies (stores, API, React Query).

## Issues Summary

| # | Severity | Description |
|---|----------|-------------|
| 1 | Critical | Color system: spec uses `slate-*` (dark-only), code uses `zinc-*` with light/dark mode |
| 2 | Major | Component architecture: spec describes raw HTML/CSS, code uses `@corthex/ui` shared components |
| 3 | Major | Chart bar color: spec says `bg-cyan-400`, code uses `bg-indigo-500 dark:bg-indigo-400` |
| 4 | Major | Chart period buttons: wrong color classes (blue vs indigo) |
| 5 | Major | Progress bar: contradictory threshold description + missing `<ProgressBar>` component reference |
| 6 | Minor | Tooltip background: `bg-slate-900` vs `bg-zinc-800` |
| 7 | Minor | Missing toast notifications documentation |
| 8 | Minor | Missing shared dependencies section |

## Actions Taken

- Replaced all `slate-*` references with correct `zinc-*` + `dark:` mode equivalents
- Updated all card/input/button references to use `@corthex/ui` components
- Fixed chart bar color from `bg-cyan-400` to `bg-indigo-500 dark:bg-indigo-400`
- Fixed period button styling from blue to indigo palette
- Replaced hardcoded progress bar description with `<ProgressBar>` component
- Fixed tooltip background color
- Added toast notification documentation
- Added "Shared Dependencies" section

## Score: 5/10 (FAIL)

Major systemic issues: wrong color system, wrong component architecture, wrong accent colors. Required substantial rewrite of all styling references.
