# Party Mode Round 2: Adversarial Review — prompt-40-companies

**File reviewed:** `_uxui-refactoring/claude-prompts/40-companies.md` (post-Round-1 fixes)
**Source verified against:** `packages/admin/src/pages/companies.tsx`
**Lens:** Adversarial (aggressive attack on remaining weaknesses)

## Expert Panel Comments

1. **Data Contract Expert**: The spec doesn't mention the TypeScript types used. The source defines `Company = { id, name, slug, isActive, createdAt }` and `CompanyStats = Record<string, { userCount, agentCount }>`. While a wireframe prompt may not need types, knowing the data shape helps designers understand what fields are available. -- Minor, acceptable for a wireframe prompt.

2. **State Management Expert**: The spec mentions `editForm` has `name` field, but the source actually stores `{ name, slug }` in `editForm` even though only `name` is sent in the update mutation. This is an implementation detail, not a spec concern. -- No action needed.

3. **Edge Case Expert**: The spec says "max 100 chars" for company name and "max 50 chars" for slug, but the source code has NO `maxLength` attribute on either input. The spec includes constraints not present in the source. This could mislead a designer into adding validation that doesn't exist. -- **NEW ISSUE found.**

4. **API Expert**: The spec doesn't mention the actual API endpoints used. The source calls `/admin/companies` (GET, POST), `/admin/companies/:id` (PATCH), `/admin/companies/:id` (DELETE), and `/admin/companies/stats` (GET). For a wireframe this is borderline, but API awareness helps. -- Minor, no action.

5. **Layout Expert**: The `transition-colors` class on buttons is present in the source but was partially captured. Checking the fixed spec... it's now included on the header button and create button. Good.

6. **Focus/Ring Expert**: The search input and form inputs use `focus:outline-none` in the source. The original spec had `focus:border-blue-500` which doesn't exist in the source. Checking fixed spec... correctly updated. Good.

7. **Empty State Expert**: What happens when there are zero companies? Or when search returns no results? The source code renders an empty `space-y-4` div with no "no results" message. The spec doesn't mention this either. This is a UX gap in BOTH the source and spec, but the spec should at least document the current behavior. -- **NEW ISSUE found.**

## Issues Summary

| # | Severity | Issue | Action |
|---|----------|-------|--------|
| 1 | Minor | Spec claims "max 100 chars" / "max 50 chars" for inputs, but source has no maxLength | Removed false constraints from spec |
| 2 | Minor | No mention of empty state behavior (no companies / no search results) | Added note in UX Considerations |

## Actions Taken

1. Removed "max 100 chars" and "max 50 chars" from form input descriptions since the source code doesn't enforce these limits.
2. Added empty state documentation to UX Considerations.

## Score: 8/10 (PASS)

After Round 1 fixes, the spec is now substantially accurate. The two new issues found are both Minor severity. The spec correctly reflects colors, theming, component usage, and interaction patterns from the source code.
