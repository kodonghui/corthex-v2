# Story 24.4: Personality Presets & Default Values — Phase A+B (dev)

## Summary

Implemented 3 personality presets (balanced/creative/analytical) as shared constants, added API endpoint, and updated Soul templates with Big Five personality variable placeholders.

## What Changed

### 1. Shared types & constants (`@corthex/shared`)

**`packages/shared/src/types.ts`** — New types:
- `PersonalityTraits`: `{ openness, conscientiousness, extraversion, agreeableness, neuroticism }` (all `number`)
- `PersonalityPreset`: `{ id, name, nameKo, description, traits: PersonalityTraits }`

**`packages/shared/src/constants.ts`** — New constant:
- `PERSONALITY_PRESETS`: readonly array of 3 presets
  - `balanced`: 50/50/50/50/50 — neutral, adaptable
  - `creative`: 80/30/70/60/40 — open, spontaneous, sociable
  - `analytical`: 40/90/20/40/30 — methodical, focused, reserved

### 2. API endpoint

**`packages/server/src/routes/admin/agents.ts`**:
- `GET /api/admin/agents/personality-presets` — returns `{ success: true, data: PERSONALITY_PRESETS }`
- Placed BEFORE `/agents/:id` route to prevent `:id` param from capturing "personality-presets"

### 3. Soul template personality placeholders (FR24)

**`packages/server/src/lib/soul-templates.ts`**:
- Both `MANAGER_SOUL_TEMPLATE` and `SECRETARY_SOUL_TEMPLATE` now include:
  - "성격 특성 (Big Five)" section with all 5 `{{personality_*}}` variables
  - Communication style guidance mapped to each trait dimension
  - Korean descriptions of how each trait affects agent behavior

### 4. Existing test fix

**`packages/server/src/__tests__/unit/soul-templates.test.ts`**:
- Updated `validVars` whitelist to include 5 `{{personality_*}}` variables

## Files

- `packages/shared/src/types.ts` — PersonalityTraits + PersonalityPreset types
- `packages/shared/src/constants.ts` — PERSONALITY_PRESETS constant
- `packages/server/src/routes/admin/agents.ts` — GET personality-presets endpoint
- `packages/server/src/lib/soul-templates.ts` — personality placeholder section in 2 templates
- `packages/server/src/__tests__/unit/soul-templates.test.ts` — validVars whitelist updated
- `packages/server/src/__tests__/unit/personality-presets.test.ts` — 15 tests (NEW)
- `_bmad-output/implementation-artifacts/stories/24-4-personality-presets.md` — spec (NEW)

## Test Results

```
157 tests pass (15 new + existing), 0 fail
Type-check: clean (shared + server)
```

## Decision Log

- Presets as shared constants (not DB table) — they're static, immutable, platform-wide. No per-company customization needed.
- `nameKo` field added for Korean UI display alongside English name
- Presets endpoint placed before `:id` route in agents router to avoid param collision
- Personality section placed before "주의사항" in both templates for logical reading order
