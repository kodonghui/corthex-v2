# Story 24.5: Big Five Slider UI & Accessibility

Status: implemented

## Story

As an admin,
I want intuitive personality sliders with helpful tooltips,
So that I can understand what each setting does and adjust precisely.

## Acceptance Criteria

1. **AC-1: 5 sliders displayed (FR-PERS1)**
   **Given** the agent edit form
   **When** BigFiveSliderGroup is rendered
   **Then** 5 sliders (0-100 integer) with labels: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism

2. **AC-2: Accessibility (FR-PERS9, NFR-A5)**
   **Given** each slider
   **When** rendered
   **Then** has `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`, `aria-label`

3. **AC-3: Keyboard operable (FR-PERS9, UXR47)**
   **Given** slider has focus
   **When** left/right arrows pressed
   **Then** value changes by 1
   **And** Shift+Arrow changes by 10

4. **AC-4: Behavioral tooltips (FR-PERS8, PER-6)**
   **Given** each trait dimension
   **When** tooltip shown
   **Then** 3-tier tooltip (low/mid/high) describes behavioral impact

5. **AC-5: Mobile vertical stacked (UXR11)**
   **Given** mobile viewport
   **When** BigFiveSliderGroup renders
   **Then** sliders stacked vertically full-width

6. **AC-6: Preset selector (FR-PERS6)**
   **Given** preset buttons above sliders
   **When** preset selected
   **Then** all 5 sliders instantly fill with preset values
   **And** manual adjustment still works afterward

7. **AC-7: Next session effect (FR-PERS4, FR-PERS5)**
   **Given** personality changes saved via API
   **When** next agent session starts
   **Then** new personality values used (via soul-enricher → renderSoul)
   **And** zero code branching — purely prompt injection

## Dev Notes

### Component: `BigFiveSliderGroup`
- Location: `packages/app/src/components/agents/big-five-slider-group.tsx`
- Uses native `<input type="range">` for full accessibility control
- Color per trait dimension: openness=green, conscientiousness=blue, extraversion=amber, agreeableness=purple, neuroticism=red
- Enable/disable toggle for NULL personality (backward compat)

### Integration
- `AgentForm` in `pages/agents.tsx` includes `BigFiveSliderGroup`
- `AgentFormData.personalityTraits` added
- Edit modal passes existing `personalityTraits` to form

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- BigFiveSliderGroup component with 5 trait sliders, preset selector, tooltips
- Full aria-* accessibility attributes on every slider
- Keyboard: arrows ±1, Shift+arrows ±10
- Integrated into AgentForm with enable/disable toggle
- 14 tests covering all ACs

### File List

- `packages/app/src/components/agents/big-five-slider-group.tsx` — BigFiveSliderGroup component (NEW)
- `packages/app/src/pages/agents.tsx` — AgentForm integration, types updated
- `packages/app/src/__tests__/big-five-slider-group.test.tsx` — 14 tests (NEW)
- `_bmad-output/implementation-artifacts/stories/24-5-big-five-slider-ui.md` — spec (NEW)
