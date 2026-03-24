# Story 24.6: Soul Editor Variable Autocomplete

Status: implemented

## Story

As an admin,
I want a smart soul editor with variable autocomplete and A/B personality preview,
So that I can write soul templates efficiently and compare how personality affects rendering.

## Acceptance Criteria

1. **AC-1: CodeMirror with {{variable}} highlighting (UXR118)**
   **Given** the soul editor (admin or settings)
   **When** {{variable}} pattern is typed
   **Then** it is highlighted with olive green styling via MatchDecorator

2. **AC-2: Autocomplete dropdown on {{ (AR15)**
   **Given** the soul editor in soulMode
   **When** user types {{
   **Then** dropdown appears with all 13 variables (7 builtin + 5 personality + 1 memory)
   **And** each entry shows label + description + category icon

3. **AC-3: Variable chip insertion**
   **Given** the variable chip list below editor
   **When** user clicks a variable chip
   **Then** {{variable_name}} is appended to the soul text

4. **AC-4: A/B personality preview (UXR136)**
   **Given** A/B mode checkbox enabled
   **When** two different personality presets selected and preview clicked
   **Then** two side-by-side preview panes show the soul rendered with different personality values

5. **AC-5: Soul preview with personality override**
   **Given** the soul-preview API endpoint
   **When** called with optional personalityTraits body param
   **Then** personality values are used as extraVars in renderSoul

## Dev Notes

### CodeMirror Extensions: `lib/codemirror-soul-extensions.ts`
- `SOUL_VARIABLES`: 13 variables (7 builtin + 5 personality + 1 memory)
- `soulVariableHighlight`: ViewPlugin with MatchDecorator for `{{var}}` patterns
- `soulAutocomplete`: autocompletion extension, triggers on `{{`
- `SOUL_VARIABLE_CSS`: olive-themed highlighting styles

### CodeMirrorEditor: `soulMode` prop
- When `soulMode={true}`, adds soulVariableHighlight + soulAutocomplete extensions
- CSS injected via `<style>` element (deduped by ID)

### Admin SoulEditor upgrade
- Replaced `<textarea>` with lazy-loaded `<CodeMirrorEditor soulMode />`
- Variable chip list updated to all 13 variables with color-coded categories
- A/B mode: checkbox toggle, two preset selectors, parallel API calls

### Server: soul-preview personality override
- `soulPreviewSchema` extended with optional `personalityTraits`
- `previewSoul()` accepts personality override → builds extraVars → passes to renderSoul
- Personality vars included in preview variable map

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- CodeMirror soulMode with {{variable}} MatchDecorator highlighting
- Autocomplete dropdown triggered on {{ with all 13 variables
- Variable chips color-coded by category (builtin/personality/memory)
- A/B personality preview with preset selectors (UXR136)
- Server soul-preview extended with personalityTraits override
- Settings SoulEditor also gets soulMode
- 24 tests (17 client + 7 server)

### File List

- `packages/app/src/lib/codemirror-soul-extensions.ts` — Soul variable definitions, highlighting, autocomplete (NEW)
- `packages/app/src/components/codemirror-editor.tsx` — soulMode prop, CSS injection
- `packages/app/src/pages/agents.tsx` — SoulEditor rewrite: CodeMirror, 13 vars, A/B preview
- `packages/app/src/components/settings/soul-editor.tsx` — soulMode enabled
- `packages/server/src/routes/admin/agents.ts` — soulPreviewSchema + personalityTraits override
- `packages/server/src/services/organization.ts` — previewSoul with personality extraVars
- `packages/app/src/__tests__/codemirror-soul-extensions.test.ts` — 17 tests (NEW)
- `packages/server/src/__tests__/unit/soul-preview-personality.test.ts` — 7 tests (NEW)
- `_bmad-output/implementation-artifacts/stories/24-6-soul-editor-autocomplete.md` — spec (NEW)
