# Round 2 Review: 19-workflows
## Lens: Adversarial
## Issues Found:

1. **No error state for failed API fetches**: The spec defines Loading, Empty (3 variants), and Company Not Selected states, but has NO error state for when API calls fail (network error, 403 forbidden, server error). The source code relies on toast notifications for mutation errors, but an inline error state is needed for the initial list data fetch failure -- otherwise users see an empty list with no indication of failure.

2. **Execute button race condition on list view**: The source code uses a single shared `executeMut` mutation, so `executeMut.isPending` disables ALL execute buttons when any single workflow is being executed. The spec shows individual "실행" buttons per card but doesn't address this UX limitation. This should be noted for implementers.

3. **Missing "pending/skipped" step status in execution mini-bar**: The spec's execution card shows green (completed) and red (failed) step bars, but there's no explicit definition for pending, running, or skipped steps. The source code has a fallback gray bar (`bg-zinc-300 dark:bg-zinc-600`) for unknown statuses, but the spec should define this third state explicitly.

4. **Dark theme contrast on suggestion card actions**: The "거절" button uses `text-slate-400` on `bg-slate-800/50` card background. At 4.2:1 contrast ratio this barely passes WCAG AA for normal text but fails for small text (text-xs = ~10px effective). Consider using `text-slate-300` for better readability.

## Resolution:
- Issue 1: Critical -- added Error State section to the spec.
- Issue 2: Minor UX note -- documented but not a spec defect.
- Issue 3: Added "pending/skipped" step status color definition to the spec.
- Issue 4: Updated suggestion reject button from `text-slate-400` to `text-slate-300`.

## Score: 7/10
## Verdict: PASS
