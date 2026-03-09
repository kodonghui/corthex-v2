# Party Mode Review Log: Prompt 42 — Onboarding Wizard
## Round 1: Collaborative Review

### Expert Panel

1. **UI Engineer**: The entire color scheme uses `slate` and `emerald`/`blue` but the actual code uses `zinc`, `green`, and `indigo`. This is a systematic mismatch that would produce wrong colors in the wireframe.
2. **Accessibility Expert**: The spec only describes dark-mode classes. The actual code supports both light and dark mode with `dark:` prefix variants. Missing light mode classes means the wireframe won't look right in default (light) mode.
3. **Design Systems Lead**: Tier badge colors are completely wrong. Spec says Manager=blue, Specialist=cyan, Worker=slate. Code says Manager=indigo, Specialist=blue, Worker=gray. These are distinct color families.
4. **Frontend Developer**: The template card styling in the spec uses `bg-slate-800/50 border border-slate-700` but code uses `bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700`. The light-mode background is white, not transparent dark.
5. **QA Analyst**: The Step 2 footer description says "← 이전 + 건너뛰기" but code has both a skip button AND a next button labeled "건너뛰기", which is a distinct pattern.
6. **UX Writer**: The "수정" button color is listed as `text-blue-400` but code uses `text-indigo-600 dark:text-indigo-400`.
7. **Product Manager**: The step indicator uses `bg-emerald-500` for completed steps but code uses `bg-green-500`. These render differently in Tailwind.

### Issues Summary

| # | Severity | Issue | Action |
|---|----------|-------|--------|
| 1 | Critical | Color palette mismatch: spec uses slate/emerald/blue, code uses zinc/green/indigo throughout | Fixed: replaced all color classes to match source |
| 2 | Major | Dark-mode only classes: spec omits light-mode variants | Fixed: added light+dark mode pairs for all components |
| 3 | Major | Tier badge colors wrong (blue/cyan/slate vs indigo/blue/gray) | Fixed: matched to actual TIER_LABELS constant |
| 4 | Minor | Template card bg wrong (dark transparent vs white/dark) | Fixed: matched to actual component styling |
| 5 | Minor | Step 2 footer behavior incompletely described | Fixed: clarified skip+next behavior |
| 6 | Minor | "수정" button color wrong (blue vs indigo) | Fixed as part of color palette fix |
| 7 | Minor | Apply result stat colors (emerald vs green) | Fixed: matched to actual dark/light mode classes |

### Actions Taken
- Replaced entire color palette: `slate` -> `zinc`, `emerald` -> `green`, `blue` -> `indigo` (where primary action color)
- Added `dark:` variant classes alongside light-mode classes for all elements
- Fixed tier badge colors to match `TIER_LABELS` constant in source
- Updated template card, provider card, invited list, form backgrounds for light/dark mode
- Corrected step indicator classes to match `StepIndicator` component exactly

### Score: 6/10 (FAIL -> fixed -> re-scored as 8/10 PASS after fixes)
