# Story 24.5: Big Five Slider UI & Accessibility — Phase A+B (dev)

## Summary

Created BigFiveSliderGroup component with 5 OCEAN personality sliders, preset selector, behavioral tooltips, full accessibility (aria-*, keyboard), and integrated into the agent edit form.

## What Changed

### New Component: `big-five-slider-group.tsx`

- 5 native `<input type="range">` sliders (0-100) with per-trait color coding
- **Preset selector**: 3 buttons (balanced/creative/analytical) with instant fill, auto-detect active preset
- **Enable/disable toggle**: NULL personality (backward compat) vs active personality
- **Tooltips**: 3-tier (low/mid/high) behavioral descriptions per trait in Korean
- **Accessibility**: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext` (includes trait name + score + description), `aria-label`
- **Keyboard**: left/right arrows ±1, Shift+Arrow ±10 (UXR47), Up/Down also work
- **Mobile**: sliders stack vertically, full-width by default (UXR11)
- Per-trait colors: openness=#4d7c0f, conscientiousness=#2563eb, extraversion=#d97706, agreeableness=#7c3aed, neuroticism=#dc2626

### Agent Form Integration

- `AgentFormData.personalityTraits` added (nullable)
- `Agent` type includes `personalityTraits`
- Edit modal passes existing personality to form
- Slider group placed between toggle and action buttons, separated by border

### Tests (14 pass)

- FR-PERS1: 5 OCEAN keys
- FR-PERS6: Preset fill validation
- FR-PERS4: NULL default, all-50 fallback
- FR-PERS8/PER-6: Tooltip 3-tier logic
- UXR47: Shift+Arrow ±10 with clamping
- NFR-A5: Component importable, aria-valuetext format
- Preset matching: exact match and custom no-match

## Files

- `packages/app/src/components/agents/big-five-slider-group.tsx` — NEW
- `packages/app/src/pages/agents.tsx` — types + form integration
- `packages/app/src/__tests__/big-five-slider-group.test.tsx` — 14 tests NEW
- `_bmad-output/implementation-artifacts/stories/24-5-big-five-slider-ui.md` — spec NEW

## Test Results

```
14 tests pass, 0 fail
Type-check: clean (app + shared + server)
```
