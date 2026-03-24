# Spec Review — Story 22.5: CI Dependency Scanning & Quality Baselines

**Reviewer**: Winston (Critic-A, Architecture + API)
**Date**: 2026-03-24
**Phase**: A (Spec Review)
**Scope**: 5 ACs, 5 Tasks, CI workflows + documentation artifacts

---

## Round 1: 7.45/10 PASS (2 fixes required)

### Issues Found (Round 1)
1. **[HIGH] CI permanently red** — no allowlist for transitive fast-xml-parser vulns
2. **[MEDIUM] Task 1.3 `--level high` flag** — silently ignored by bun 1.3.10
3. **[LOW] Redundant `continue-on-error: false`**

### Verification Method (Round 1)
- Ran `bun audit` — confirmed 4 critical/high matches (1 critical, 3 high)
- Tested `bun audit --level high` — confirmed flag silently ignored
- Tested grep pattern `^\s*(critical|high):` — verified correct
- Checked both CI workflow files exist and confirmed step placement

---

## Round 2: 8.90/10 PASS ✅

### Fixes Verified

| Issue | Status | Verification |
|-------|--------|--------------|
| CI permanently red (no allowlist) | ✅ Fixed | `.github/audit-allowlist.txt` with `grep -vFf` filtering. Tested: allowlist removes all 5 fast-xml-parser advisory lines. After filtering, only hono high remains (fixed by Task 1.5). |
| `--level high` flag | ✅ Fixed | Removed from Task 1.3. Replaced with allowlist file creation. |
| API endpoints missing | ✅ Fixed (John) | All 10 quality baseline prompts now have specific API endpoints. |
| Concurrent scenario missing | ✅ Fixed (John) | Routing scenario #10 is "concurrent". Korean/English merged into "Bilingual" (#7). |
| Hono remediation path | ✅ Added | Task 1.5: `bun update hono` to >=4.12.4 as pre-implementation step. |

### Allowlist Approach — Architecture Verification

Tested the exact script from Task 1.4 against real `bun audit` output:

```
# With allowlist (5 fast-xml-parser GHSA IDs):
Remaining critical/high: 1 (hono serveStatic — GHSA-q5qw-h33p-qvwr)
# After hono update (Task 1.5):
Remaining critical/high: 0 → CI PASSES ✅
```

The `grep -vFf` approach works because:
- Advisory URLs appear on the same line as severity labels in bun audit output
- `-F` (fixed string) prevents regex interpretation of GHSA IDs
- `-v` inverts match, removing entire lines containing allowlisted URLs
- Subsequent `grep -E '^\s*(critical|high):'` only sees non-allowlisted advisories

Governance: quarterly review header in allowlist file. Clear criteria: only transitive deps with no direct fix.

### Concurrent Routing — Architecture Validation

Confirmed `llm-router.ts` uses per-request `LLMRouterContext` — no module-level mutable state. `CircuitBreaker` is the only shared component, designed for concurrent access. Concurrent scenario (#10) is architecturally valid: tests that parallel requests to different departments route independently.

### What's Correct

| Check | Status |
|-------|--------|
| CI step placement: after install, before build | ✅ Verified against ci.yml (line 19→22) and deploy.yml (line 43→46) |
| grep pattern `^\s*(critical|high):` | ✅ Tested — no false positives on summary line |
| Allowlist `grep -vFf` approach | ✅ Tested against real bun audit output |
| ANSI code handling in `$(...)` capture | ✅ Non-TTY strips ANSI codes |
| Dependabot config (npm, weekly Monday, labels) | ✅ Standard config |
| Quality baseline: 10 prompts with API endpoints | ✅ Comprehensive domain coverage |
| Routing scenarios: 10 cases including concurrent | ✅ Good diversity, NFR-O5 aligned |
| Scoring rubric: 1pt/0pt/0.5pt, 8/10+ pass | ✅ Clear and measurable |
| Hono remediation as Task 1.5 | ✅ Pre-implementation step, not separate story |
| `llm-router.ts` concurrent safety | ✅ Per-request context, no shared mutable state |

---

## Score (Round 2)

| Dimension | Weight | Score | Reasoning |
|-----------|--------|-------|-----------|
| D1 Specificity | 15% | 9/10 | Clear tasks, specific advisory URLs in allowlist, API endpoints on all prompts |
| D2 Completeness | 15% | 9/10 | Allowlist mechanism, hono remediation, concurrent scenario, API endpoints — all gaps filled |
| D3 Accuracy | 25% | 9/10 | `--level high` removed, grep pattern verified, allowlist approach tested against real output |
| D4 Implementability | 20% | 9/10 | Clear script pattern, allowlist file defined, hono update as pre-step |
| D5 Consistency | 15% | 9/10 | Follows project patterns, correct file references |
| D6 Risk | 10% | 8/10 | Quarterly allowlist review. Minor: allowlist could be forgotten, but header comment mitigates |

**Weighted**: (9×0.15)+(9×0.15)+(9×0.25)+(9×0.20)+(9×0.15)+(8×0.10) = 1.35+1.35+2.25+1.80+1.35+0.80 = **8.90/10**

---

## Verdict: ✅ PASS — 8.90/10

All Round 1 issues resolved. Allowlist approach verified against real audit output. Concurrent routing scenario architecturally valid. Ready for implementation.
