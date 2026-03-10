# Party Mode Round 1: Collaborative Review — Component Strategy

**Step:** step-11-component-strategy
**Round:** 1 (Collaborative)
**Date:** 2026-03-11

## Expert Panel

- **Amelia (Dev)**: Component architecture
- **Sally (UX)**: Design consistency
- **Winston (Architect)**: Monorepo alignment
- **Quinn (QA)**: Component testability

## Review Discussion

**Amelia (Dev):** The atomic design hierarchy is well-structured. The package split (ui=shared atoms/molecules, app=user organisms, admin=admin organisms) matches the existing monorepo structure perfectly. The file naming uses kebab-case which matches CLAUDE.md conventions. One concern: the `CommandInput` organism is one of the most complex components (Textarea + SlashMenu + MentionMenu + SendButton) but the slash menu behavior isn't detailed. How does `/분석` autocomplete? Dropdown above input? Inline completion?

**Winston (Architect):** The shared `packages/ui/` approach is correct per the monorepo structure. However, I see `CostDisplay` as a molecule but it has business logic dependencies (formatting costUsd, calculating token display). Pure UI components in packages/ui shouldn't have business logic. Consider making CostDisplay accept pre-formatted strings, or move it to app-specific components.

**Quinn (QA):** The component table Props columns are useful for test planning. Each component has clear inputs. For Storybook/visual regression testing, the Atoms and Molecules in `packages/ui/` are ideal candidates. Organisms are harder to test in isolation due to data dependencies. Suggest marking which components are "Storybook-friendly" vs "integration-test-only."

## Issues Found

1. **[ISSUE-R1-1] SlashMenu/MentionMenu Behavior Undefined** — CommandInput organism lists sub-components but doesn't describe the autocomplete UX (dropdown position, filtering, keyboard navigation).

2. **[ISSUE-R1-2] CostDisplay Business Logic in UI Package** — CostDisplay formats business data (USD, tokens). Should accept formatted strings in packages/ui or move to app components.

## Fixes Applied

- **ISSUE-R1-1**: Added CommandInput behavior spec: slash menu appears above input on `/` keystroke, filters as user types, ↑↓ navigation, Enter selects. Mention menu on `@` with same behavior.
- **ISSUE-R1-2**: CostDisplay in packages/ui accepts `label: string` (pre-formatted). Business logic (formatting `$0.0234`, `12,340 토큰`) lives in app-level hook `useCostFormat()`
