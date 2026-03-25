# Critic-B (QA + Security) Implementation Review — Story 24.8

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 All 8 gates pass (38/38) | ✅ | 38 tests, 153 assertions, 0 failures. Static verification approach. |
| AC-2 No DB required | ✅ | All tests use `fs.readFileSync` + string/regex matching on source files. One runtime import (`@corthex/shared`) for preset validation. |
| AC-3 Gate coverage for 24.1-24.7 | ⚠️ PARTIAL | Gate 1 (renderSoul), Gate 3 (PER-1), Gate 7 (AR73/AR74), Gate 8 (CodeMirror) are thorough. Gate 2 (call sites) and Gate 4 (null compat) have verification gaps. Summary gate missing 24.1/24.2 story file checks. |

## Gate-by-Gate Analysis

### Gate 1: renderSoul extraVars (4 tests) ✅
- Checks extraVars parameter signature, spread injection, unknown→empty fallback, test suite existence
- Thorough for static verification

### Gate 2: Call site enrich()→extraVars (4 tests) ⚠️
- **Claims**: "9 files, 10+ call sites use enrich()→extraVars pattern"
- **Actually checks**: Files exist + import `renderSoul`
- **Gap**: Does NOT verify that each file imports or calls `enrich()`. Confirmed: `organization.ts` does NOT import `enrich` from soul-enricher — it builds extraVars inline for preview. Gate 2 test passes for organization.ts by checking renderSoul import only, giving false confidence about the enrich() pattern.
- **Impact**: Low — organization.ts intentionally bypasses enrich() for preview (uses Zod-validated override). But the gate's stated purpose doesn't match what it verifies.

### Gate 3: PER-1 4-layer sanitization (6 tests) ✅✅
- Layer 1 (PERSONALITY_KEYS): verified in soul-enricher with all 5 trait names
- Layer 2 (Zod .strict()): verified in BOTH admin/agents.ts AND workspace/agents.ts
- Layer 3 (control char strip): `\x00-\x1f` verified in soul-enricher
- Layer 4 (template regex): `|| ''` verified in soul-renderer
- Adversarial test suite 30+ count verified
- **This is the strongest gate — full PER-1 security coverage.**

### Gate 4: NULL backward compat (4 tests) ⚠️
- personalityVars in soul-enricher: ✅
- extraVars optional: ✅
- PERSONALITY_PRESETS runtime import: ✅ (good — actual runtime validation)
- **Weak test** (line 151-155): "PersonalityTraits type allows null in DB schema" just checks `readdirSync` returns files containing "schema" — doesn't actually verify `personality_traits` column allows NULL. Should check `schema.ts` for `jsonb('personality_traits')` without `.notNull()`.

### Gate 5: Presets & slider integration (3 tests) ✅
- Runtime import + validation of 3+ presets with 0-100 integer values: excellent
- BigFiveSliderGroup file existence: ✅
- Preset API endpoint: ✅

### Gate 6: Soul templates (2 tests) ✅
- All 5 personality placeholders verified in soul-templates.ts
- 10+ occurrences (5 per template × 2): ✅

### Gate 7: AR73/AR74 infrastructure (7 tests) ✅
- CallAgentResponse fields: all 5 checked (status variants, summary, delegatedTo)
- parseChildResponse export: regex match ✅
- REFLECTION_MODEL + haiku: ✅
- selectModelWithCostPreference export: ✅
- CostPreference type with 3 values: ✅
- Test suite counts (AR73 10+, AR74 11+): ✅

### Gate 8: CodeMirror soul extensions (5 tests) ✅
- SOUL_VARIABLES 13+ entries by `name:` count: ✅
- soulVariableHighlight + MatchDecorator: ✅
- soulAutocomplete + autocompletion: ✅
- 5 personality variables: ✅
- CodeMirrorEditor soulMode integration: ✅

### Summary gate (3 tests) ⚠️
- Story files 24.3-24.7 with "Status: implemented": ✅
- **Missing**: Stories 24.1 (`24-1-personality-traits-db-schema.md`) and 24.2 (`24-2-soul-enricher-service.md`) both exist with "Status: implemented" but are NOT checked in the summary gate.
- Dedicated test suite files: ✅
- Total test coverage 59+: ✅

## Security Assessment

| Item | Status | Evidence |
|------|--------|----------|
| PER-1 complete verification | ✅ STRONG | Gate 3 verifies all 4 layers with specific patterns. Best gate in the suite. |
| Workspace route coverage | ✅ | Gate 3 test 3 (line 104-108) verifies .strict() in workspace route — not just admin. |
| Static analysis reliability | ⚠️ | String contains checks can false-positive if patterns appear in comments or dead code. Low risk given patterns are specific (e.g., `\x00-\x1f`). |
| No injection via test inputs | ✅ SAFE | All assertions are on file content (string matching). No user input. No eval/exec. |

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 8/10 | 8 named gates with clear descriptions. Test names descriptive. Pattern matching specific. Some tests too shallow (Gate 4 null check). |
| D2 완전성 | 25% | 7/10 | 38 tests covering 8 gates. But Gate 2 doesn't verify enrich() usage, Gate 4 null test weak, Summary misses 24.1/24.2. Sprint coverage 5/7 stories explicitly checked. |
| D3 정확성 | 15% | 8/10 | PER-1 gate accurate. AR73/AR74 gate accurate. Gate 2 claim "enrich()→extraVars pattern" not fully verified (organization.ts doesn't use enrich). |
| D4 실행가능성 | 10% | 9/10 | 38/38 pass. No DB dependency. Static approach runs anywhere. Story 24-4 status fix included. |
| D5 일관성 | 15% | 9/10 | Consistent verification pattern (readSrc + expect). Story spec well-formatted. Gate numbering matches story order. |
| D6 리스크 | 25% | 8/10 | PER-1 security layers verified across all relevant files including workspace route. Gate 2 gap could give false confidence about enrich() adoption. No false positives in critical security checks. |

### 가중 평균: 0.10(8) + 0.25(7) + 0.15(8) + 0.10(9) + 0.15(9) + 0.25(8) = 7.90/10 ✅ PASS

---

## Issues (3: 1 medium, 2 low)

### 1. **[D2/D3] Gate 2 doesn't verify enrich() at call sites** (MEDIUM)

Gate 2 title: "Call site enrich()→extraVars pattern" — but test only checks `renderSoul` import. `organization.ts` is listed as a call site file but does NOT import `enrich()`. It builds extraVars inline for preview.

```typescript
// Gate 2, line 67-70 — only checks renderSoul, not enrich
test('each call site file imports renderSoul', () => {
  for (const file of CALL_SITE_FILES) {
    const src = readSrc(file)
    expect(src).toContain('renderSoul')  // ← should also check 'enrich' for non-preview files
  }
})
```

**Recommendation**: Split verification — 8 files should contain `enrich` import, 1 (organization.ts) intentionally uses inline extraVars. Or separate the file lists.

### 2. **[D2] Summary gate missing stories 24.1 and 24.2** (LOW)

```typescript
// Line 299-305 — only checks 24.3-24.7
const storyFiles = [
  '24-3-per1-sanitization-chain.md',
  '24-4-personality-presets.md',
  // ... 24.5, 24.6, 24.7
  // MISSING: '24-1-personality-traits-db-schema.md'
  // MISSING: '24-2-soul-enricher-service.md'
]
```

Both exist with "Status: implemented" (confirmed via grep). Should be included for complete Sprint 1 verification.

### 3. **[D1] Gate 4 null test doesn't verify null allowance** (LOW)

```typescript
// Line 151-155 — checks readdirSync, not actual null allowance
test('PersonalityTraits type allows null in DB schema', () => {
  const schemaDir = fs.readdirSync('packages/server/src/db').filter(f => f.includes('schema'))
  expect(schemaDir.length).toBeGreaterThan(0)  // ← proves schema dir has files, NOT that null is allowed
})
```

Should check `schema.ts` content for `jsonb('personality_traits')` without `.notNull()`, or verify migration allows NULL.

---

## Verdict

**✅ PASS (7.90/10)**

Solid Go/No-Go verification suite with strong PER-1 security gate (best gate — all 4 layers verified including workspace route). AR73/AR74 and CodeMirror gates thorough. Three gaps reduce confidence slightly: Gate 2 claim exceeds verification, Summary gate misses 2 foundational stories, Gate 4 null test is a no-op. None are blockers — the underlying functionality is correct (verified in dedicated test suites). Sprint 1 sign-off recommended with these gaps noted for completeness.
