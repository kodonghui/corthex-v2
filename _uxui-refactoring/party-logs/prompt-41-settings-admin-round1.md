# Party Mode Round 1: Collaborative Review
## Prompt 41 — Settings Admin (회사 설정)

### Expert Panel

1. **UI Designer**: Color system is completely wrong. Spec uses `slate-*` palette but source code uses `zinc-*` with full light/dark mode support. This is a critical mismatch that would produce a visually different wireframe.

2. **Frontend Engineer**: Button accent color is `indigo-600` in source, spec says `blue-600`. Status badges use `green-*` not `emerald-*`. These are systematically wrong across all 3 sections.

3. **Accessibility Expert**: The spec doesn't mention light mode at all. Source code supports `bg-white dark:bg-zinc-900` pattern throughout. A wireframe tool following this spec would only generate dark mode, missing half the design.

4. **UX Researcher**: Missing field labels. Source code has `<label>` elements for every field ("회사명", "Slug", "생성일", "상태" etc.) but spec doesn't describe these label elements or their styling.

5. **Data Architect**: LLM model dropdown only shows display names ("Claude Sonnet 4") but source uses specific model IDs as values (`claude-sonnet-4-20250514`). Without these values, the wireframe would miss the data contract.

6. **QA Engineer**: Loading state for API keys section is missing — source uses `Skeleton` components while keys load, but spec doesn't mention this. Also, the "(라벨 없음)" fallback text is missing from spec.

7. **Product Manager**: The add form submit button has pending states ("등록 중...") and disable logic (disabled when no provider selected). Spec misses these interaction states.

### Issues Summary

| # | Severity | Issue | Action |
|---|----------|-------|--------|
| 1 | Critical | Entire color palette wrong: `slate-*` should be `zinc-*` with light/dark mode | Replaced all color classes across all sections |
| 2 | Critical | Missing light mode support: spec only describes dark mode | Added `bg-white dark:bg-zinc-900` pattern throughout |
| 3 | Major | Button accent: `blue-600` should be `indigo-600` | Fixed all button classes |
| 4 | Major | Status badge: `emerald-*` should be `green-*` with light/dark variants | Fixed to match source |
| 5 | Major | Missing field labels styling (`block text-sm text-zinc-600 dark:text-zinc-400 mb-1`) | Added label descriptions |
| 6 | Major | LLM model values missing (only display names, no model IDs) | Added value mapping |
| 7 | Major | Rotate form colors: `yellow-*` should be `amber-*` | Fixed throughout |
| 8 | Minor | Missing "(라벨 없음)" fallback for keys without labels | Added |
| 9 | Minor | Missing "등록 중..." / disabled states on submit buttons | Added |
| 10 | Minor | Missing Skeleton loading state for API key list | Added |
| 11 | Minor | API key row background mismatch (`slate-800/80` vs `zinc-50 dark:bg-zinc-800/50`) | Fixed |

### Actions Taken
- Replaced all `slate-*` colors with `zinc-*` equivalents with light/dark mode support
- Fixed button colors from `blue-*` to `indigo-*`
- Fixed status badge colors from `emerald-*` to `green-*`
- Fixed rotate form colors from `yellow-*` to `amber-*`
- Added field label styling descriptions
- Added LLM model ID values
- Added loading/pending states and fallback text
- Added Skeleton loading for API key list

### Score: 5/10 (FAIL)
The original spec had a fundamentally wrong color system and was missing light mode entirely. 11 issues found, 4 critical/major. All fixed.
