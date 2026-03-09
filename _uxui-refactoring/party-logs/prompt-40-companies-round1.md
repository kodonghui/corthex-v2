# Party Mode Round 1: Collaborative Review — prompt-40-companies

**File reviewed:** `_uxui-refactoring/claude-prompts/40-companies.md`
**Source verified against:** `packages/admin/src/pages/companies.tsx`
**Lens:** Collaborative (constructive improvement)

## Expert Panel Comments

1. **UI/Color System Expert**: The spec uses `slate-*` colors throughout, but the actual source code uses `zinc-*` palette with light/dark mode support. This is a systemic mismatch — every single color reference is wrong. The spec also only describes dark-mode classes, completely ignoring light mode (`bg-white`, `text-zinc-900`, etc.).

2. **Component Architecture Expert**: The spec describes the deactivation dialog as a generic "modal overlay with centered dialog" and the loading skeleton as raw `div` elements with `animate-pulse`. The source code actually uses shared `ConfirmDialog` and `SkeletonCard` components from `@corthex/ui`. A wireframe prompt should reference these shared components so the designer knows to reuse them.

3. **Accessibility Expert**: The spec omits `<label>` elements for the create form inputs. The source code includes proper labels (`block text-sm text-zinc-600 dark:text-zinc-400 mb-1`). Labels are essential for screen readers and form usability.

4. **Brand/Design System Expert**: The accent color in the spec is `blue-*` (e.g., `bg-blue-600`), but the source uses `indigo-*` (`bg-indigo-600 hover:bg-indigo-700`). This extends to all interactive elements: buttons, focus rings, edit/save links.

5. **CSS Detail Expert**: The status badges in the spec use `border` properties (`border border-emerald-500/20`), but the source code uses background-only styling with no border. Also the active badge uses `green-*` not `emerald-*`.

6. **Interaction Design Expert**: The spec says cancel button styling is `text-slate-400 hover:text-slate-200`, but the source uses a simpler `text-zinc-600` without hover state. Minor but should be accurate.

7. **Documentation Expert**: The spec lacks a note about the overall page layout container (`space-y-6`) and the company list container (`space-y-4` not a grid). The loading state uses a grid but the actual company list is a vertical stack. This distinction matters for layout fidelity.

## Issues Summary

| # | Severity | Issue | Action |
|---|----------|-------|--------|
| 1 | Critical | Entire color system wrong: `slate-*` should be `zinc-*` with light/dark mode support | Fixed all color references |
| 2 | Critical | No light/dark mode mentioned; spec is dark-only | Added theming note and dual-mode classes |
| 3 | Major | Accent color `blue-*` should be `indigo-*` throughout | Fixed all accent color references |
| 4 | Major | Status badge uses `emerald-*` with border; should be `green-*` without border | Fixed badge classes |
| 5 | Major | Shared components (`ConfirmDialog`, `SkeletonCard`) not mentioned | Added component references |
| 6 | Minor | Missing `<label>` elements in form spec | Added label specs |
| 7 | Minor | Error text `text-red-500` should be `text-red-600` | Fixed |

## Actions Taken

All 7 issues fixed in the spec file. Complete rewrite of all CSS class references to match actual source code.

## Score: 4/10 (FAIL)

The original spec had fundamental mismatches with the source code across nearly every CSS class reference. The color system, accent colors, theming approach, shared component usage, and several styling details were all incorrect. Fixed all issues and proceeding to Round 2.
