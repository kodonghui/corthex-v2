# Round 3 Review: 17-costs
## Lens: Forensic
## Issues Found:
1. **Tailwind color system mismatch (slate vs zinc).** The spec uses `bg-slate-900`, `bg-slate-800/50`, `text-slate-50`, `text-slate-400`, `text-slate-500`, `border-slate-700`, `border-slate-600`, `bg-slate-700` throughout. The source code and the rest of the app use `zinc-*` variants: `bg-zinc-100 dark:bg-zinc-800`, `text-zinc-900 dark:text-zinc-100`, `border-zinc-200 dark:border-zinc-800`, etc. **Every slate-* class in the spec needs to be converted to zinc-* with proper light/dark mode variants.**
2. **Accent color mismatch (blue vs indigo).** The spec uses `bg-blue-600/20 text-blue-400` (active pill), `bg-blue-500` (chart bars), `text-blue-400` (links). The source uses `bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300` (active pill), `bg-indigo-500 dark:bg-indigo-400` (chart bars), `text-indigo-600 dark:text-indigo-400` (links). All blue-* references should become indigo-*.
3. **API endpoint paths verified -- all 4 match the backend.** `/workspace/dashboard/costs?days=N` matches `dashboardRoute.get('/dashboard/costs')` with `days` query param. `/workspace/dashboard/budget` matches. `/workspace/dashboard/costs/daily?startDate=&endDate=` matches with zod-validated query schema. `/workspace/dashboard/costs/by-agent?startDate=&endDate=` matches. All confirmed correct.
4. **DashboardBudget type fields verified.** The spec references `usagePercent`, `currentMonthSpendUsd`, `monthlyBudgetUsd` which all exist in the shared type. The spec also references `projectedMonthEndUsd` and `isDefaultBudget` in the type but does not use them in the UI -- the source also doesn't display them. Consistent.
5. **Spec lacks light/dark mode dual classes.** All spec HTML snippets are dark-only (e.g., `text-slate-50`, `bg-slate-800`). The source code uses Tailwind's `dark:` prefix pattern throughout (e.g., `text-zinc-900 dark:text-zinc-100`). The spec should include both light and dark variants.
6. **Budget card color logic mismatch.** Spec says `text-emerald-400` for <80%, `text-amber-400` for >=80%, `text-red-500` for >=100%. Source uses `text-emerald-500`, `text-yellow-500`, `text-red-500`. The hue and shade differ.
## Resolution:
Issues 1, 2, 5, and 6 are critical spec-source mismatches that must be fixed. Issue 3 confirms API endpoints are correct (no fix needed). Issue 4 confirms type coverage is adequate. Applying fixes to the spec now.
## Score: 5/10
## Verdict: FAIL
