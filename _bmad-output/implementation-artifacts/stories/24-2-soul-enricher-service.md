# Story 24.2: Soul Enricher Service & renderSoul Integration

Status: implemented

## Story

As an admin,
I want personality to automatically influence how agents communicate,
So that setting slider values actually changes agent behavior.

## Acceptance Criteria

1. **AC-1: soul-enricher.ts created**
   **Given** personality_traits exists in DB (Story 24.1)
   **When** `services/soul-enricher.ts` is created
   **Then** exports `enrich(agentId, companyId): Promise<EnrichResult>`
   **And** `EnrichResult = { personalityVars: Record<string,string>, memoryVars: Record<string,string> }`
   **And** located in `services/` (not `engine/` — E8 boundary, AR27)

2. **AC-2: personalityVars populated**
   **Given** an agent has personality_traits `{ openness: 75, ... }`
   **When** `enrich()` is called
   **Then** returns `personalityVars: { personality_openness: "75", personality_conscientiousness: "60", ... }` (5 keys, string values)
   **And** `memoryVars: {}` (Sprint 1 placeholder, Sprint 3 will populate)

3. **AC-3: NULL personality → empty result**
   **Given** an agent has personality_traits = NULL
   **When** `enrich()` is called
   **Then** returns `{ personalityVars: {}, memoryVars: {} }` (AR31, Zero Regression)

4. **AC-4: DB error → graceful fallback**
   **Given** DB query fails
   **When** `enrich()` is called
   **Then** returns `{ personalityVars: {}, memoryVars: {} }` + `log.warn` (AR31, session not interrupted)

5. **AC-5: All renderSoul callers updated**
   **Given** 9 files with 12 renderSoul call sites exist
   **When** each is updated to call `enrich()` first
   **Then** extraVars include `{ ...knowledgeVars, ...enriched.personalityVars, ...enriched.memoryVars }`
   **And** existing knowledge_context vars preserved (hub.ts, call-agent.ts)

6. **AC-6: agent-loop.ts untouched**
   **Given** E8 boundary rule (AR32)
   **When** checking engine/ imports
   **Then** agent-loop.ts does NOT import soul-enricher — callers pass pre-rendered soul

7. **AC-7: EnrichResult interface frozen**
   **Given** interface is defined
   **When** Sprint 1 completes
   **Then** EnrichResult field names/types are frozen — Sprint 3 extends via additive-only (new keys in memoryVars)

8. **AC-8: previewSoul excluded**
   **Given** organization.ts:previewSoul is for admin preview
   **When** checking soul-enricher integration
   **Then** previewSoul does NOT call enrich() (preview shows template vars, not runtime personality)

## Tasks / Subtasks

- [ ] Task 1: Create `services/soul-enricher.ts` (AC: #1, #2, #3, #4)
  - [ ] 1.1 Define EnrichResult interface
  - [ ] 1.2 Implement enrich(agentId, companyId) — fetch personality_traits from DB
  - [ ] 1.3 Convert integer values to `personality_{key}: String(value)` extraVars
  - [ ] 1.4 NULL personality → empty personalityVars
  - [ ] 1.5 try/catch → empty result + pino log.warn on DB error

- [ ] Task 2: Update renderSoul callers — simple pattern (AC: #5, #6)
  - [ ] 2.1 `routes/commands.ts:55` — add enrich() + pass extraVars
  - [ ] 2.2 `routes/workspace/presets.ts:45` — add enrich() + pass extraVars
  - [ ] 2.3 `routes/public-api/v1.ts:46` — add enrich() + pass extraVars
  - [ ] 2.4 `services/telegram-bot.ts:96` — add enrich() + pass extraVars
  - [ ] 2.5 `services/argos-evaluator.ts:379` — add enrich() + pass extraVars
  - [ ] 2.6 `services/agora-engine.ts:170` (getCachedSoul) — add enrich() + pass extraVars
  - [ ] 2.7 `services/agora-engine.ts:301` (synthesize) — add enrich() + pass extraVars

- [ ] Task 3: Update renderSoul callers — knowledge_context pattern (AC: #5)
  - [ ] 3.1 `routes/workspace/hub.ts:95-107` — merge knowledgeVars + enriched vars
  - [ ] 3.2 `tool-handlers/builtins/call-agent.ts:59-68` — merge knowledgeVars + enriched vars

- [ ] Task 4: Verify excluded callers (AC: #6, #8)
  - [ ] 4.1 organization.ts:previewSoul — confirm NO enrich() (preview only)
  - [ ] 4.2 agent-loop.ts — confirm NO soul-enricher import

- [ ] Task 5: Write tests (AC: all)
  - [ ] 5.1 Unit: enrich() with valid traits → correct personalityVars
  - [ ] 5.2 Unit: enrich() with NULL traits → empty result
  - [ ] 5.3 Unit: enrich() with DB error → empty result + log.warn
  - [ ] 5.4 Unit: verify extraVars keys are `personality_` prefixed strings

- [ ] Task 6: Build + type-check (AC: all)
  - [ ] 6.1 `turbo build` passes
  - [ ] 6.2 `bun test` passes (zero regression)

## Dev Notes

### Architecture References

- **D23**: soul-enricher integration pattern — services/ placement, 9 callers, extraVars merge
- **E11**: Soul Enricher integration rules — EnrichResult interface, caller update pattern
- **E8**: Engine boundary — agent-loop.ts must NOT import soul-enricher
- **AR27**: EnrichResult interface frozen after Sprint 1
- **AR28**: All callers must use enrich() → extraVars pattern
- **AR31**: NULL/error → empty result (no session interruption)
- **AR32**: agent-loop.ts receives pre-rendered soul from callers

### 12 Call Sites (9 files)

| File | Line | Pattern | Has knowledge_context? |
|------|------|---------|----------------------|
| hub.ts | 105-106 | conditional extraVars | YES |
| call-agent.ts | 67-68 | conditional extraVars | YES |
| commands.ts | 55 | simple | NO |
| presets.ts | 45 | simple | NO |
| public-api/v1.ts | 46 | simple | NO |
| telegram-bot.ts | 96 | simple | NO |
| agora-engine.ts | 170 | getCachedSoul | NO |
| agora-engine.ts | 301 | synthesize fallback | NO |
| argos-evaluator.ts | 379 | simple | NO |
| organization.ts | 960 | previewSoul — EXCLUDED | N/A |

### Caller Update Pattern

```typescript
// BEFORE (simple callers):
const soul = agentRow.soul ? await renderSoul(agentRow.soul, agentRow.id, companyId) : ''

// AFTER:
import { enrich } from '../services/soul-enricher'  // or appropriate relative path
const enriched = await enrich(agentRow.id, companyId)
const extraVars = { ...enriched.personalityVars, ...enriched.memoryVars }
const soul = agentRow.soul ? await renderSoul(agentRow.soul, agentRow.id, companyId, extraVars) : ''

// BEFORE (hub.ts / call-agent.ts with knowledge_context):
const extraVars: Record<string, string> = {}
if (soulText.includes('{{knowledge_context}}') && ...) { extraVars.knowledge_context = knowledgeCtx }
const soul = renderSoul(soulText, agentId, companyId, extraVars)

// AFTER:
const enriched = await enrich(targetAgent.id, companyId)
const extraVars: Record<string, string> = { ...enriched.personalityVars, ...enriched.memoryVars }
if (soulText.includes('{{knowledge_context}}') && ...) { extraVars.knowledge_context = knowledgeCtx }
const soul = renderSoul(soulText, agentId, companyId, extraVars)
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — D23, E11, E12]
- [Source: _bmad-output/planning-artifacts/epics-and-stories.md — Story 24.2 lines 1983-2001]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

### File List
