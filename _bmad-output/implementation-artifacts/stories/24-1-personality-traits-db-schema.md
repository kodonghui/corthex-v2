# Story 24.1: Personality Traits Database Schema & Migration

Status: implemented

## Story

As an admin,
I want personality data stored reliably in the database,
So that agent personality settings persist and validate correctly.

## Acceptance Criteria

1. **AC-1: Migration file created**
   **Given** the agents table has no personality column
   **When** migration `0062_add_personality_traits.sql` is applied
   **Then** `agents.personality_traits` JSONB column is added with NULL default (backward compat)

2. **AC-2: CHECK constraint**
   **Given** a row has non-NULL personality_traits
   **When** validating the JSONB value
   **Then** exactly 5 keys exist: `openness`, `conscientiousness`, `extraversion`, `agreeableness`, `neuroticism` (lowercase, no abbreviations)
   **And** each value is integer 0-100
   **And** no extra keys allowed (exactly 5 — enforced via `jsonb_object_keys` count = 5)

3. **AC-3: Zod validation schema**
   **Given** API receives personality_traits in create/update payload
   **When** Zod validates the input
   **Then** schema is `z.object({ openness: z.number().int().min(0).max(100), conscientiousness: z.number().int().min(0).max(100), extraversion: z.number().int().min(0).max(100), agreeableness: z.number().int().min(0).max(100), neuroticism: z.number().int().min(0).max(100) }).strict()`
   **And** string-type values are rejected (prompt injection prevention, FR-PERS2)

4. **AC-4: NULL personality returns empty object**
   **Given** an agent has `personality_traits = NULL`
   **When** API returns the agent
   **Then** `personality_traits` field is `{}` (empty object, not null — AR31)

5. **AC-5: CRUD endpoints updated**
   **Given** admin calls POST/PATCH `/api/admin/agents`
   **When** payload includes `personality_traits`
   **Then** value is validated, stored, and returned in responses
   **And** personality_traits is optional (not required for create/update)

6. **AC-6: Existing agents unaffected**
   **Given** agents exist before migration
   **When** migration is applied
   **Then** existing agents have `personality_traits = NULL` (no data loss)
   **And** all existing CRUD operations continue working

7. **AC-7: schema.ts updated**
   **Given** the migration adds the column
   **When** Drizzle schema is checked
   **Then** `agents` table in `schema.ts` includes `personalityTraits: jsonb('personality_traits')` column

8. **AC-8: Type safety**
   **Given** personality_traits column exists
   **When** TypeScript compiles
   **Then** types flow correctly through schema → service → route → response

## Tasks / Subtasks

- [ ] Task 1: Write migration `0062_add_personality_traits.sql` (AC: #1, #2, #6)
  - [ ] 1.1 Add `personality_traits JSONB` column with NULL default
  - [ ] 1.2 Add CHECK constraint: NULL allowed OR (exactly 5 keys + each 0-100 integer)
  - [ ] 1.3 CHECK uses `?&` for key presence + `jsonb_object_keys` count = 5 for strictness
  - [ ] 1.4 Each value validated as integer 0-100 via `(personality_traits->>'openness')::int BETWEEN 0 AND 100` pattern

- [ ] Task 2: Update `schema.ts` (AC: #7)
  - [ ] 2.1 Add `personalityTraits: jsonb('personality_traits')` to agents table definition

- [ ] Task 3: Add Zod schema + update route validators (AC: #3, #5)
  - [ ] 3.1 Define `personalityTraitsSchema` in `routes/admin/agents.ts`
  - [ ] 3.2 Add `.optional().nullable()` to `createAgentSchema` and `updateAgentSchema`
  - [ ] 3.3 Use `.strict()` on the personality object (reject extra keys at API level)

- [ ] Task 4: Update service layer types (AC: #4, #8)
  - [ ] 4.1 Add `personalityTraits` to `AgentInput` and `AgentUpdateInput` interfaces
  - [ ] 4.2 Add null→`{}` coercion in GET endpoints (AR31)

- [ ] Task 5: Write tests (AC: all)
  - [ ] 5.1 Unit tests: Zod schema accepts valid Big Five, rejects strings/extra keys/out-of-range
  - [ ] 5.2 Integration tests: CRUD with personality_traits (create, read, update, null handling)
  - [ ] 5.3 Migration test: existing agents unaffected after migration

- [ ] Task 6: Build + type-check verification (AC: #8)
  - [ ] 6.1 `turbo build` passes
  - [ ] 6.2 `bun test` passes (zero regression)

## Dev Notes

### Architecture References

- **D33** (architecture.md): Big Five validation — DB CHECK + Zod + 4-layer sanitization (PER-1)
- **E12** (architecture.md): Personality traits 검증 체인 — Layer 1 (Key Boundary) + Layer 2 (API Zod) are in scope for this story
- **FR-PERS** area: 9 FRs total in Sprint 1, this story covers FR-PERS1 (slider storage) + FR-PERS2 (injection prevention via Zod)
- **AR31**: NULL personality → empty object `{}`
- Story 24.2 will build soul-enricher.ts on top of this schema
- Story 24.3 will implement full PER-1 4-layer sanitization

### Key Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `packages/server/src/db/migrations/0062_add_personality_traits.sql` | CREATE | SQL migration |
| `packages/server/src/db/schema.ts` | MODIFY | Add personalityTraits to agents table (line ~168) |
| `packages/server/src/routes/admin/agents.ts` | MODIFY | Add Zod schema + update create/update validators |
| `packages/server/src/services/organization.ts` | MODIFY | Add personalityTraits to AgentInput/AgentUpdateInput |
| `packages/server/src/__tests__/unit/personality-traits.test.ts` | CREATE | Tests |

### Existing Patterns to Follow

- Migration naming: `0062_add_personality_traits.sql` (sequential after `0061_voyage_vector_1024.sql`)
- Zod validation inline in route file (see existing `createAgentSchema`/`updateAgentSchema` at agents.ts:22-52)
- Service types: `AgentInput`/`AgentUpdateInput` interfaces in organization.ts
- JSONB column: same pattern as `allowedTools: jsonb('allowed_tools')` in schema.ts
- NULL→empty coercion: done in route GET handler, not in DB

### CHECK Constraint SQL Pattern

```sql
ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality_traits JSONB
  CHECK (personality_traits IS NULL OR (
    personality_traits ?& ARRAY['openness','conscientiousness','extraversion','agreeableness','neuroticism']
    AND (SELECT count(*) FROM jsonb_object_keys(personality_traits)) = 5
    AND (personality_traits->>'openness')::int BETWEEN 0 AND 100
    AND (personality_traits->>'conscientiousness')::int BETWEEN 0 AND 100
    AND (personality_traits->>'extraversion')::int BETWEEN 0 AND 100
    AND (personality_traits->>'agreeableness')::int BETWEEN 0 AND 100
    AND (personality_traits->>'neuroticism')::int BETWEEN 0 AND 100
  ));
```

### Zod Schema Pattern

```typescript
const personalityTraitsSchema = z.object({
  openness: z.number().int().min(0).max(100),
  conscientiousness: z.number().int().min(0).max(100),
  extraversion: z.number().int().min(0).max(100),
  agreeableness: z.number().int().min(0).max(100),
  neuroticism: z.number().int().min(0).max(100),
}).strict()
```

### Anti-Patterns to Avoid

- Do NOT add default values in migration (NULL = no personality, backward compat)
- Do NOT use `jsonb_typeof` for value checks — cast to int and use BETWEEN
- Do NOT add personality to engine/ files — E8 boundary (Story 24.2 handles soul-enricher)
- Do NOT create shared/ types for personality yet — keep in server until Story 24.5 (UI)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — D33, E12, FR-PERS area]
- [Source: _bmad-output/planning-artifacts/epics-and-stories.md — Story 24.1 lines 1960-1979]
- [Source: _bmad-output/planning-artifacts/prd.md — FR-PERS1, FR-PERS2, AR31]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

### File List
