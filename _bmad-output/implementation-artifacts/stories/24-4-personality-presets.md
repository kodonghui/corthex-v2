# Story 24.4: Personality Presets & Default Values

Status: in-progress

## Story

As an admin,
I want preset personality templates to choose from,
So that I can quickly configure agents without manually tuning 5 sliders.

## Acceptance Criteria

1. **AC-1: 3 default presets**
   **Given** soul-enricher and personality_traits are functional (Stories 24.1-24.2)
   **When** presets are implemented
   **Then** at least 3 presets: balanced (50/50/50/50/50), creative (80/30/70/60/40), analytical (40/90/20/40/30)
   **And** defined as shared constants (AR30)

2. **AC-2: Preset API endpoint**
   **Given** presets are defined
   **When** GET /api/admin/agents/personality-presets is called
   **Then** returns array of { id, name, description, traits } objects

3. **AC-3: Backward compatibility**
   **Given** new agent creation
   **When** no personality_traits specified
   **Then** defaults to NULL (existing behavior preserved)

4. **AC-4: Soul template personality placeholders (FR24)**
   **Given** default Soul templates (secretary, manager)
   **When** templates are rendered with personality extraVars
   **Then** templates include {{personality_*}} variable section
   **And** personality values influence agent communication style

## Tasks / Subtasks

- [ ] Task 1: Define personality presets in @corthex/shared (AC: #1)
  - [ ] 1.1 Add PersonalityPreset type + PERSONALITY_PRESETS constant
  - [ ] 1.2 Export from shared index

- [ ] Task 2: Add API endpoint (AC: #2)
  - [ ] 2.1 GET /api/admin/agents/personality-presets returns preset list

- [ ] Task 3: Update Soul templates with personality placeholders (AC: #4)
  - [ ] 3.1 Add personality section to MANAGER_SOUL_TEMPLATE
  - [ ] 3.2 Add personality section to SECRETARY_SOUL_TEMPLATE

- [ ] Task 4: Write tests (AC: all)
  - [ ] 4.1 Preset constants: 3 presets, all values 0-100
  - [ ] 4.2 API endpoint returns presets
  - [ ] 4.3 Soul templates contain {{personality_*}} vars
  - [ ] 4.4 Backward compat: NULL default preserved

## Dev Notes

### Architecture References

- **AR30**: Personality presets — hardcoded values
- **FR-PERS6**: Selecting preset auto-fills sliders (UI-side, Story 24.5)
- **FR-PERS7**: Preset does not prevent manual adjustment (UI-side, Story 24.5)
- **FR24**: Default Soul templates include personality variable placeholders

### Preset Values

| Preset | O | C | E | A | N | Description |
|--------|---|---|---|---|---|-------------|
| balanced | 50 | 50 | 50 | 50 | 50 | Neutral, adaptable |
| creative | 80 | 30 | 70 | 60 | 40 | Open, spontaneous, sociable |
| analytical | 40 | 90 | 20 | 40 | 30 | Methodical, focused, reserved |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

### File List
