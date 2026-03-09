# Round 2 Review: 18-activity-log
## Lens: Adversarial
## Issues Found:
1. **No error/retry state for failed API calls**: The spec documents Loading (SkeletonTable) and Empty states but has no guidance for network error or API failure states. The source code also lacks explicit error handling UI — if `activeQuery.isError` is true, the page would show the empty state instead of an error message. The spec should prescribe an error state with a retry button, e.g., "로그를 불러올 수 없습니다. 다시 시도해주세요."
2. **Security alert banner lacks ShieldAlertIcon import/specification**: The spec references `<ShieldAlertIcon>` in the collapsed banner HTML but doesn't note which icon library it comes from or provide a fallback. The source code omits the icon entirely and just uses text. The spec should clarify the icon source (lucide-react) or remove it to avoid confusion.
3. **Hallucination panel "showAll" toggle missing from spec**: The source code has a "전체 보기 / 일부만 보기" toggle for claims with >5 items. The spec shows the claims list but doesn't document this pagination/toggle behavior, which is important for UX when there are many claims.
4. **Dark theme contrast: date inputs on dark background**: The spec uses `bg-slate-800 text-slate-300` for date inputs, but native HTML date inputs have browser-default calendar icons that don't adapt to dark backgrounds. On Chrome/Firefox dark mode, the calendar picker dropdown may render in light theme, creating a jarring contrast. No mitigation documented.

## Resolution:
1. **Fix required**: Add an Error state section to the spec with retry guidance.
2. **Accepted as-is**: Minor icon detail. The spec names lucide icons consistently across pages. No change needed.
3. **Fix required**: Add "showAll" toggle documentation to the Hallucination Report Panel section.
4. **Accepted as-is**: Browser date input dark mode is a known platform limitation. Noting as a future enhancement (custom date picker component).

## Score: 7/10
## Verdict: PASS
