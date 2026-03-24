# Critic-C Review — Story 24.3 Phase B: PER-1 4-Layer Sanitization Chain

**Reviewer:** John (Product + Delivery)
**Date:** 2026-03-24
**Artifact:** soul-enricher.ts Layer 3 addition + 32 adversarial tests

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1: Layer 1 Key Boundary | PASS | soul-enricher.ts:44 — PERSONALITY_KEYS whitelist, only 5 OCEAN keys extracted |
| AC-2: Layer 2 API Zod | PASS | agents.ts:23-29 — `.strict()` + `.int().min(0).max(100)` (Story 24.1) |
| AC-3: Layer 3 extraVars strip | PASS | soul-enricher.ts:48 — `String(val).replace(/[\n\r\t\x00-\x1f]/g, '')`, `personality_*` prefix enforced |
| AC-4: Layer 4 Template regex | PASS | soul-renderer.ts:45 — `{{var}}` known→value, unknown→empty string. Test regex matches actual source exactly. |
| AC-5: AR60 Independence | PASS | Test at line 419 reads source file, verifies zero MEM-6/TOOLSANITIZE references |
| AC-6: NFR-S8 100% pass | PASS | 32/32 adversarial tests pass, covering injection vectors across all 4 layers |
| AC-7: Go/No-Go #2 | PASS | Test at line 311: unknown template vars → empty string confirmed |

**7/7 ACs PASS.**

## Dimension Scores

| Dimension | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| D1 Specificity | 20% | 9/10 | Regex exact: `[\n\r\t\x00-\x1f]`. Layer mapping precise with file locations and line numbers. Story spec 4-layer table is clear. |
| D2 Completeness | 20% | 8/10 | All 7 ACs pass. 32 tests cover all 4 layers plus E2E chain. One gap: PER-1 (epics-and-stories.md line 759) specifies "200-char cap" in Layer B, missing from implementation. See Issue #1. |
| D3 Accuracy | 15% | 9/10 | Layer 3 regex matches E12 (architecture.md:2039) exactly. Layer 4 test regex matches actual soul-renderer.ts:45 exactly (verified). AR60 independence confirmed via source read. |
| D4 Implementability | 15% | 10/10 | Code IS the implementation. Minimal change (1 line added to existing function). 87 total tests pass, 0 fail. |
| D5 Consistency | 10% | 9/10 | Layers 1,2,4 correctly attributed to Stories 24.1/24.2 and existing code. No re-implementation of already-done layers. Story status "implemented" matches reality. |
| D6 Risk Awareness | 20% | 9/10 | Prototype pollution (__proto__, constructor) tested. NaN/Infinity edge cases covered. SQL and prompt injection payloads tested at Layer 2. Template injection recursion tested at Layer 4 (line 319 — value containing `{{system_prompt}}` is treated as literal). AR60 independence test prevents future accidental coupling. |

## Weighted Average: 8.9/10 PASS

Calculation: (9×0.20) + (8×0.20) + (9×0.15) + (10×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.60 + 1.35 + 1.50 + 0.90 + 1.80 = **8.95 → 8.9**

## Issue List

1. **[D2 Completeness — LOW]** PER-1 in epics-and-stories.md (line 759) specifies "Layer B extraVars newline/delimiter strip + **200-char cap**". Implementation has the strip but no 200-char cap. E12 in architecture.md (line 2039) does NOT mention the cap — only the regex. For personality values (integers 0-100 → max 3 chars), this is zero practical risk. However, when Sprint 3 extends memoryVars with potentially longer strings, the cap decision should be revisited. **Recommendation:** Flag for Story 24.8 Go/No-Go #2 as a known delta between PER-1 spec and implementation.

2. **[D1 Specificity — TRIVIAL]** PER-1 Layer 0 mentions "spread order reversal, 6 built-in key conflict rejection" but the story doesn't explicitly test namespace collision between `personality_*` vars and the 7 built-in vars (agent_list, etc.). In practice, the `personality_` prefix prevents any collision, so this is a non-issue. Just noting for completeness.

## Product Assessment

**Security posture**: This is textbook defense-in-depth. Each layer independently prevents injection even if other layers fail:
- Layer 1: Only 5 keys → no arbitrary key injection
- Layer 2: Only integers 0-100 → no string payloads
- Layer 3: Control chars stripped → no newline/delimiter manipulation
- Layer 4: Unknown vars → empty string → no template injection

The E2E tests (lines 358-412) prove the full chain works. The AR60 test (line 419) is a clever static analysis guard — it reads the actual source file to verify no forbidden imports, preventing accidental coupling in future.

**NFR-S8 compliance**: 32 adversarial tests with 100% pass rate satisfies the "100% pass rate on personality sanitization test suite" requirement. The test vectors cover OWASP-style injection payloads (SQL injection, prompt injection, prototype pollution).

**Delivery**: Minimal code change (1 regex `.replace()` added to an existing line), maximum test coverage. This is the right ratio for a security story — small surface area, thorough verification.

## Cross-talk Notes

- **Critic-A**: The Layer 3 regex matches E12 exactly but PER-1 mentions a 200-char cap. Please verify whether E12 or PER-1 is authoritative for this layer's spec.
- **Critic-B**: 32 adversarial tests look solid. One suggestion for NFR-S8 expansion: consider adding Unicode homoglyph payloads (e.g., fullwidth digits ０-９) — the current integer type guard catches these, but explicit test vectors would strengthen the suite for Go/No-Go #2.
