# Story 24.6: Soul Editor Variable Autocomplete — Phase A+B (dev)

## Summary

Upgraded Soul editor with CodeMirror {{variable}} syntax highlighting, autocomplete dropdown for all 13 variables, and A/B personality preview for comparing different personality presets side by side.

## What Changed

### New: `codemirror-soul-extensions.ts`

- `SOUL_VARIABLES` array: 13 variables (7 builtin + 5 personality_* + 1 relevant_memories)
- `soulVariableHighlight` ViewPlugin: MatchDecorator for `{{var}}` patterns → olive green decoration
- `soulAutocomplete`: autocompletion triggered on `{{`, shows label/description/category icon
- `SOUL_VARIABLE_CSS`: `.cm-soul-variable` styling (olive #5a7247, bg rgba, font-weight 600)

### Modified: `codemirror-editor.tsx`

- New `soulMode?: boolean` prop
- When true: adds soulVariableHighlight + soulAutocomplete extensions
- CSS injected via `<style id="cm-soul-variable-css">` (deduped)

### Modified: Admin SoulEditor (agents.tsx)

- **Replaced textarea with CodeMirror**: lazy-loaded `<CodeMirrorEditor soulMode />`
- **Variable chips updated**: 13 variables, color-coded by category (green=builtin, blue=personality, purple=memory)
- **A/B personality preview (UXR136)**: checkbox toggle, two preset dropdowns (A: current/balanced/creative/analytical, B: same), parallel API calls, side-by-side preview panes
- Imports: added `lazy`, `Suspense`, `PERSONALITY_PRESETS`, `SOUL_VARIABLES`, `CodeMirrorEditor`

### Modified: Settings SoulEditor

- `soulMode` prop passed to CodeMirrorEditor

### Server: Soul Preview Extension

- `soulPreviewSchema` extended with optional `personalityTraits` (via personalityTraitsSchema)
- `previewSoul()` accepts personality override → builds `personality_*` extraVars → passes to renderSoul
- Personality vars merged into preview variable map output

### Tests (24 pass)

**Client (17)**:
- AR15: 13 vars (7 builtin + 5 personality + 1 memory), all fields, no duplicates
- UXR118: CSS class, olive color, background
- Autocomplete regex: matches `{{`, rejects `{`
- Extension exports: soulVariableHighlight, soulAutocomplete, CSS

**Server (7)**:
- ExtraVars built correctly from personality override
- No extraVars when override undefined
- Template rendering with personality vars
- A/B comparison: different values for same template
- Missing vars → empty string
- Mixed builtin + personality substitution

## Files

- `packages/app/src/lib/codemirror-soul-extensions.ts` — NEW
- `packages/app/src/components/codemirror-editor.tsx` — modified
- `packages/app/src/pages/agents.tsx` — modified (SoulEditor rewrite)
- `packages/app/src/components/settings/soul-editor.tsx` — modified
- `packages/server/src/routes/admin/agents.ts` — modified
- `packages/server/src/services/organization.ts` — modified
- `packages/app/src/__tests__/codemirror-soul-extensions.test.ts` — NEW
- `packages/server/src/__tests__/unit/soul-preview-personality.test.ts` — NEW
- `_bmad-output/implementation-artifacts/stories/24-6-soul-editor-autocomplete.md` — NEW

## Test Results

```
Client: 17 tests pass, 0 fail
Server: 7 tests pass, 0 fail
Type-check: clean (app + server)
```
