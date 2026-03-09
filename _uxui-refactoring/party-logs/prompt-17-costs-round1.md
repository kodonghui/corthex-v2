# Round 1 Review: 17-costs
## Lens: Collaborative
## Issues Found:
1. **Spec uses slate-* color palette but source code uses zinc-* palette.** The design spec consistently references `bg-slate-900`, `bg-slate-800`, `text-slate-50`, `text-slate-400`, `border-slate-700`, etc., but the actual source code (`costs.tsx`) uses `zinc-*` variants throughout (e.g., `text-zinc-900 dark:text-zinc-100`, `border-zinc-200 dark:border-zinc-800`, `bg-zinc-100 dark:bg-zinc-800`). The spec and source code are misaligned. The spec should either match the source or the source should be updated. Since other pages likely use zinc-*, the spec should be updated to use zinc-* for consistency.
2. **Spec uses blue-500 for bar charts; source uses indigo-500/indigo-400.** The spec defines `bg-blue-500` for agent cost bars and daily chart bars, but the actual implementation uses `bg-indigo-500 dark:bg-indigo-400` for agent bars and `bg-indigo-500 dark:bg-indigo-400` for daily chart bars. The active period pill also uses indigo in the source (`bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300`) but blue in the spec (`bg-blue-600/20 text-blue-400`).
3. **Spec donut center uses `bg-slate-800` but source uses `bg-white dark:bg-zinc-900`.** The donut chart's inner circle in the spec is `bg-slate-800` (hardcoded dark), while the source supports both light/dark modes with `bg-white dark:bg-zinc-900`.
4. **Spec lacks error state for API failure.** The source code has a distinct error state (`데이터를 불러올 수 없습니다`) when costData is null after loading completes, but the spec only covers loading skeleton and empty state -- no API error state is documented.
5. **Spec budget banner colors differ from source.** Spec uses `bg-amber-500/10 text-amber-400 border-amber-500/30` (amber for warning) and `bg-red-500/10 text-red-400 border-red-500/30` (red for exceeded). Source uses light/dark responsive classes: `bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800` (yellow, not amber).
## Resolution:
All 5 issues are valid discrepancies between the spec and source code. The spec should be updated to match the actual zinc-based, indigo-accented, light/dark responsive design system used in the source. Issues will be fixed after Round 3.
## Score: 6/10
## Verdict: FAIL
