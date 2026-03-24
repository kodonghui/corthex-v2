# Critic-A Review — Story 24.3: PER-1 4-Layer Sanitization Chain

**Reviewer:** Winston (Architect)
**Date:** 2026-03-24
**Artifact:** Implementation code + 32 adversarial tests

---

## 4-Layer Chain Verification

| Layer | File | Line | Verified | Notes |
|-------|------|------|----------|-------|
| 1 Key Boundary | soul-enricher.ts | 44-49 | ✅ | PERSONALITY_KEYS whitelist, typeof+isInteger+range guard |
| 2 API Zod | agents.ts | 23-29 | ✅ | .strict() + .int().min(0).max(100) |
| 3 extraVars strip | soul-enricher.ts | 48 | ✅ | `String(val).replace(/[\n\r\t\x00-\x1f]/g, '')` |
| 4 Template regex | soul-renderer.ts | 45 | ✅ | `{{var}}` → value or empty string |

### Execution Order (defense-in-depth)
1. Layer 2 (API Zod) — at write time (admin API)
2. DB CHECK — at storage time (PostgreSQL)
3. Layer 1 (Key Boundary) — at read time (enrich())
4. Layer 3 (extraVars strip) — at read time (enrich())
5. Layer 4 (Template regex) — at render time (renderSoul())

Even if Layer 2 is bypassed (direct DB write), Layers 1→3→4 still protect at runtime.

### Layer 4 Regex Match Confirmed
- soul-renderer.ts:45: `/\{\{([^}]+)\}\}/g` + `vars[key.trim()] || ''`
- Test line 300-301: identical regex — contract test for behavior

## Architecture Compliance

| Check | Result |
|-------|--------|
| E8 boundary | ✅ soul-enricher in services/, zero engine/ imports |
| E12 PER-1 | ✅ All 4 layers implemented and tested |
| AR60 independence | ✅ No MEM-6/TOOLSANITIZE references (test verifies via source read) |
| NFR-S8 | ✅ 32/32 adversarial tests pass |
| Go/No-Go #2 | ✅ Unknown template vars → empty string (test line 311-317) |

## Test Coverage (32 tests)

| Section | Count | Notable |
|---------|-------|---------|
| Layer 1 Key Boundary | 6 | Prototype pollution, __proto__, constructor, non-integer/out-of-range |
| Layer 2 API Zod | 9 | SQL injection, prompt injection, float, string, missing key |
| Layer 3 extraVars strip | 5 | Control char regex, boundary 0/100, memoryVars empty |
| Layer 4 Template regex | 6 | Template injection neutralized, nested braces, unknown→empty |
| E2E Full Chain | 5 | Malicious+valid mix, type-safe output, NULL/not-found→empty |
| AR60 Independence | 1 | Source file read verification |

## Issues: NONE

Layer 3 regex is technically a no-op for valid integers (String(0-100) never contains control chars) — but this is correct defense-in-depth by design.

## Verdict: ✅ PASS
