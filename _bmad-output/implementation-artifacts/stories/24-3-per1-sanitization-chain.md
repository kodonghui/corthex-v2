# Story 24.3: PER-1 4-Layer Sanitization Chain

Status: implemented

## Story

As a security engineer,
I want personality values sanitized at every layer,
So that prompt injection via personality fields is impossible.

## Acceptance Criteria

1. **AC-1: Layer 1 — Key Boundary (soul-enricher.ts)**
   **Given** personality_traits may contain arbitrary keys
   **When** `enrich()` processes traits
   **Then** only 5 OCEAN keys pass through (`openness`, `conscientiousness`, `extraversion`, `agreeableness`, `neuroticism`)
   **And** extra keys are silently ignored (no error)
   **Status**: Already implemented in Story 24.2

2. **AC-2: Layer 2 — API Zod (routes/admin/agents.ts)**
   **Given** API input includes personality_traits
   **When** Zod validation runs
   **Then** `.strict()` rejects extra keys, `.int().min(0).max(100)` validates range
   **Status**: Already implemented in Story 24.1

3. **AC-3: Layer 3 — extraVars strip (soul-enricher.ts)**
   **Given** personality values converted to strings
   **When** control characters exist in stringified values
   **Then** `[\n\r\t\x00-\x1f]` characters are stripped before passing to renderSoul
   **And** only `personality_*` prefixed keys are output

4. **AC-4: Layer 4 — Template regex (soul-renderer.ts)**
   **Given** soul template contains `{{variable}}` placeholders
   **When** renderSoul processes template
   **Then** known vars are replaced, unknown vars become empty string
   **And** no user input is directly injected without going through var map
   **Status**: Already implemented in engine/soul-renderer.ts

5. **AC-5: AR60 Independence**
   **Given** PER-1 sanitization chain
   **When** checking imports
   **Then** soul-enricher.ts does NOT import MEM-6 or TOOLSANITIZE modules
   **And** sanitization chain is self-contained

6. **AC-6: NFR-S8 — 100% adversarial test pass**
   **Given** adversarial test suite for personality sanitization
   **When** all injection vectors tested
   **Then** 100% pass rate — zero injection reaches Anthropic API

7. **AC-7: Go/No-Go #2 — extraVars injection verified**
   **Given** renderSoul() receives extraVars
   **When** unknown/malicious template vars are tested
   **Then** empty string returned (not the injection payload)

## Tasks / Subtasks

- [x] Task 1: Layer 3 — Add control character strip to soul-enricher.ts (AC: #3)
  - [x] 1.1 `String(val)` → `String(val).replace(/[\n\r\t\x00-\x1f]/g, '')`
  - [x] 1.2 Verify only `personality_*` prefixed keys output

- [x] Task 2: Verify existing layers (AC: #1, #2, #4)
  - [x] 2.1 Layer 1: Key Boundary — confirmed in soul-enricher.ts (PERSONALITY_KEYS whitelist)
  - [x] 2.2 Layer 2: API Zod — confirmed in agents.ts (personalityTraitsSchema.strict())
  - [x] 2.3 Layer 4: Template regex — confirmed in soul-renderer.ts line 45

- [x] Task 3: Verify AR60 independence (AC: #5)
  - [x] 3.1 grep soul-enricher.ts for MEM-6 / TOOLSANITIZE imports → none found

- [x] Task 4: Write adversarial test suite (AC: #6, #7)
  - [x] 4.1 Layer 1 tests: extra keys, prototype pollution, __proto__
  - [x] 4.2 Layer 2 tests: non-integer, out-of-range, extra fields
  - [x] 4.3 Layer 3 tests: control chars, newlines, null bytes
  - [x] 4.4 Layer 4 tests: template injection, unknown vars → empty
  - [x] 4.5 End-to-end: full chain from malicious input to safe output

## Dev Notes

### Architecture References

- **E12**: PER-1 4-Layer Sanitization Chain
- **AR29**: Personality sanitization rules
- **AR60**: Sanitization chain is independent — never imports MEM-6 or TOOLSANITIZE
- **NFR-S8**: 100% pass rate on personality sanitization test suite
- **PER-1**: Personality security design pattern

### 4-Layer Chain

| Layer | Location | Purpose | Status |
|-------|----------|---------|--------|
| 1 | soul-enricher.ts | Key Boundary — 5 OCEAN keys only | Story 24.2 |
| 2 | agents.ts | API Zod — .strict() + int 0-100 | Story 24.1 |
| 3 | soul-enricher.ts | extraVars strip — control char removal | **This story** |
| 4 | soul-renderer.ts | Template regex — {{var}} → value or empty | Existing |

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — E12, PER-1]
- [Source: _bmad-output/planning-artifacts/epics-and-stories.md — Story 24.3 lines 2005-2023]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- Layer 3 added: `String(val).replace(/[\n\r\t\x00-\x1f]/g, '')` in soul-enricher.ts
- Layers 1, 2, 4 already implemented in Stories 24.1/24.2 and existing soul-renderer.ts
- AR60 verified: zero MEM-6 or TOOLSANITIZE imports in soul-enricher.ts
- NFR-S8: 32 adversarial tests, 100% pass rate
- Go/No-Go #2: unknown template vars → empty string verified

### File List

- `packages/server/src/services/soul-enricher.ts` — Layer 3 control char strip added
- `packages/server/src/__tests__/unit/per1-sanitization-chain.test.ts` — 32 adversarial tests (NEW)
- `_bmad-output/implementation-artifacts/stories/24-3-per1-sanitization-chain.md` — Story spec (NEW)
