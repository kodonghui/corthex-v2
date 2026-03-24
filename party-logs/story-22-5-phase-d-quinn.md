# Story 22.5 — Phase D Test Verification (Quinn, Critic-B)

**Story**: 22.5 — CI Dependency Scanning & Quality Baselines
**Phase**: D (Test Verification)
**Reviewer**: Quinn (QA + Security)
**Date**: 2026-03-24

---

## Test Results

- **File**: `packages/server/src/__tests__/unit/ci-dependency-scanning.test.ts`
- **Result**: 26/26 pass, 143 expect() calls, 75ms
- **Runner**: bun:test v1.3.10

## AC → Test Coverage Matrix

| AC | Test Coverage | Verdict |
|----|--------------|---------|
| AC-1: bun audit in CI | 6 tests: ci.yml audit step, deploy.yml audit step, allowlist filtering, critical/high grep, ::error:: annotations, placement order | ✅ Covered |
| AC-2: Dependabot | 5 tests: exists, npm ecosystem, weekly Monday, labels, limit, root directory | ✅ Covered |
| AC-3: Quality baseline | 5 tests: exists, 10 prompts, Input/API/Expected/Success per prompt, A/B methodology, domain coverage | ✅ Covered |
| AC-4: Routing scenarios | 5 tests: exists, 10 scenarios, all NFR-O5 categories, Input/Expected/Rationale per scenario, pass threshold, partial credit | ✅ Covered |
| AC-5: Files committed | Covered by existence checks in AC-3/AC-4 tests | ✅ Covered |

## Test Quality Assessment

**Strengths**:
- Structural validation tests (not just existence) — verify each prompt/scenario has required fields
- Domain coverage test ensures all 10 key domains represented
- NFR-O5 category test ensures all 10 routing types covered
- CI step ordering test (install < audit < build) catches misplacement

**Gap identified**:

**No test verifies allowlist file safety for `grep -Ff`.** The allowlist file has a blank line (line 6) that makes `grep -vFf` match everything — a total audit bypass. A test like this would have caught it:

```typescript
test('allowlist has no blank lines (grep -F safety)', () => {
  const allowlist = readFileSync(join(GITHUB_DIR, 'audit-allowlist.txt'), 'utf-8')
  const lines = allowlist.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#'))
  // No blank lines among non-comment lines
  expect(lines.every(l => l.length > 0)).toBe(true)
  // Also verify no blank lines exist anywhere (grep -F treats them as match-all)
  expect(allowlist).not.toContain('\n\n')
})
```

This is a **recommended addition** — testing the security property of the allowlist format itself.

---

*Quinn — Critic-B (QA + Security) — corthex-epic-22*
