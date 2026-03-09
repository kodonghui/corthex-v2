# Round 2 Review: 17-costs
## Lens: Adversarial
## Issues Found:
1. **Missing dark mode root background.** The spec's root container uses `bg-slate-900` (dark only, no light mode), but the source code uses `<div className="h-full overflow-y-auto">` with no explicit background -- it inherits from the parent layout. The spec should not hardcode a dark-only background if the app supports light/dark modes.
2. **Spec back button uses ArrowLeftIcon component, source uses HTML entity.** The spec prescribes `<ArrowLeftIcon className="w-5 h-5" />` but the source uses a simple `&larr;` text character. The spec should reflect what's actually used or note the icon as a recommendation.
3. **Budget banner missing `role="alert"` in HTML snippets.** The spec's Accessibility section says `role="alert"` for the budget warning banner, but the actual HTML code blocks (lines 72, 79) do not include this attribute. The source code also omits it. The HTML snippets should include it if accessibility requires it.
4. **No keyboard focus support for bar chart tooltips.** The spec says "Bar chart tooltips accessible via keyboard focus" but neither the spec HTML nor the source code implements `tabIndex` or keyboard handlers on chart bars. Tooltips use CSS `group-hover:block` which is mouse-only.
5. **Custom date range approximation for `/costs?days=N` endpoint undocumented.** The source converts custom date ranges to `effectiveDays` for the costs overview endpoint (which only accepts `?days=N`). If a user picks March 1-15, the endpoint returns the last 15 days from *today*, not the selected range. This mismatch is not documented.
## Resolution:
Issues 1-3 are spec-level fixes to apply. Issue 4 is an accessibility gap in both spec and source (spec should either add `tabIndex={0}` to bar elements or soften the claim). Issue 5 should be added as a known limitation note in the spec.
## Score: 6/10
## Verdict: FAIL
