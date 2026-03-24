# Story 24.3: PER-1 4-Layer Sanitization Chain — Phase A+B (dev)

## Summary

Implemented Layer 3 (control character strip) and wrote 32 adversarial tests verifying all 4 layers of the PER-1 sanitization chain. Layers 1, 2, 4 were already implemented in Stories 24.1/24.2.

## What Changed

### Layer 3 Added: `soul-enricher.ts`

```diff
- personalityVars[`personality_${key}`] = String(val)
+ personalityVars[`personality_${key}`] = String(val).replace(/[\n\r\t\x00-\x1f]/g, '')
```

Control characters stripped before values reach renderSoul. Defense-in-depth: integer values won't normally contain control chars, but Layer 3 guards against any bypass of Layer 2 (e.g., direct DB manipulation).

### 4-Layer Chain Status

| Layer | Location | Purpose | Status |
|-------|----------|---------|--------|
| 1 | soul-enricher.ts | Key Boundary — 5 OCEAN keys only | Story 24.2 |
| 2 | agents.ts | API Zod — .strict() + int 0-100 | Story 24.1 |
| 3 | soul-enricher.ts | extraVars strip — control char removal | **This story** |
| 4 | soul-renderer.ts | Template regex — {{var}} → value or empty | Existing |

### 32 Adversarial Tests (NFR-S8: 100% pass)

- **Layer 1** (6): extra keys, __proto__, prototype pollution, constructor, non-integer, out-of-range
- **Layer 2** (9): Zod .strict(), float, string, negative, >100, missing key, SQL injection, prompt injection
- **Layer 3** (5): personality_ prefix, string type, no control chars, boundary 0/100, memoryVars empty
- **Layer 4** (6): known var replacement, unknown→empty, template injection neutralized, nested braces, multi-var, whitespace trim
- **E2E** (5): full chain, malicious keys filtered, type safety, NULL→empty, agent-not-found
- **AR60** (1): source file has zero MEM-6/TOOLSANITIZE imports

### AR60 Independence Verified

`grep` confirmed: soul-enricher.ts imports only `db`, `db/schema`, `drizzle-orm`, `db/logger`. No MEM-6 or TOOLSANITIZE references.

### Go/No-Go #2 Prep

Layer 4 test confirms: unknown template vars → empty string (not injection payload). `{{unknown_injected_var}}` → `""`.

## Files

- `packages/server/src/services/soul-enricher.ts` — Layer 3 control char strip added
- `packages/server/src/__tests__/unit/per1-sanitization-chain.test.ts` — 32 adversarial tests (NEW)
- `_bmad-output/implementation-artifacts/stories/24-3-per1-sanitization-chain.md` — story spec (NEW)

## Test Results

```
87 tests pass (32 new + 12 soul-enricher + 43 personality-traits), 0 fail
```

## Decision Log

- Layer 3 regex `[\n\r\t\x00-\x1f]` chosen to match E12 architecture spec exactly
- Layer 4 tests use isolated `templateReplace` function (same regex as soul-renderer.ts line 45) — avoids DB dependency in template tests
- AR60 verified via runtime source file read in test, not just grep
