# Code Review — Story 22.5: CI Dependency Scanning & Quality Baselines

**Reviewer**: Winston (Architect)
**Date**: 2026-03-24
**Phase**: F (Code Review)
**Scope**: 4 new + 2 modified files, 26 tests

---

## Checklist

- [x] Story spec loaded and cross-referenced against implementation
- [x] All 5 ACs verified against code
- [x] CI audit script tested against real `bun audit` output
- [x] Allowlist comment/blank-line filtering verified (Bug 1 fix from Phase B)
- [x] hono version checked in server workspace (Bug 2 still present)
- [x] deploy.yml conditional `if:` verified correct
- [x] 26 tests pass

---

## Phase B Bug Fix Verification

### Bug 1: Blank line in allowlist → FIXED ✅

| Before | After |
|--------|-------|
| Blank line at line 6 | Removed — line 6 is now comment header for GHSA section |
| `grep -vFf .github/audit-allowlist.txt` | `grep -vFf <(grep -v '^#\|^$' .github/audit-allowlist.txt)` |
| Empty pattern matches everything | Process substitution strips comments and blank lines |

Verified: after fix, `bun audit` output correctly shows remaining hono HIGH (GHSA-q5qw-h33p-qvwr) while filtering all 5 fast-xml-parser advisories. The allowlist mechanism now works as designed.

### Bug 2: hono still 4.12.3 → FIXED ✅ (post-review)

| File | Before | After |
|------|--------|-------|
| `packages/server/package.json` | `"hono": "4.12.3"` | `"hono": "4.12.9"` ✅ |
| `packages/server/node_modules/hono/` | 4.12.3 | 4.12.9 ✅ |

Dev updated after Phase F feedback. Verified: `bun audit` with corrected allowlist now shows **0 unallowlisted critical/high**. CI passes cleanly.

---

## Core Implementation Review

### 1. CI Workflows ✅

**ci.yml** (lines 21-30):
| Check | Status |
|-------|--------|
| Step name: `Security audit (NFR-S14)` | ✅ Line 21 |
| After `Install dependencies` (line 18), before `Build all packages` (line 32) | ✅ AC-1 ordering |
| `bun audit 2>&1 || true` captures output | ✅ Line 23 |
| Comment/blank-line stripping via process substitution | ✅ Line 25 |
| `grep -E '^\s*(critical|high):'` severity filter | ✅ Line 26 |
| `::error::` annotation per hit | ✅ Line 28 |
| `exit 1` on hits | ✅ Line 29 |

**deploy.yml** (lines 46-56):
| Check | Status |
|-------|--------|
| Identical audit script | ✅ Lines 48-56 match ci.yml 23-30 |
| `if: steps.filter.outputs.code == 'true'` | ✅ Line 47 |
| After `Install dependencies` (line 42), before `Engine boundary check` (line 58) | ✅ AC-1 ordering |

**Re: John's question on deploy.yml conditional**: Correct. The paths-filter includes `package.json` and `bun.lock` — the only files that can change dependency security posture. Docs-only pushes skip audit because dependencies are unchanged. No edge case exists.

### 2. Audit Allowlist ✅

`.github/audit-allowlist.txt` (12 lines):

| Check | Status |
|-------|--------|
| 5 fast-xml-parser GHSA IDs | ✅ Lines 7-11 |
| No blank lines between entries | ✅ Fixed from Phase B |
| Review date header with quarterly schedule | ✅ Lines 1-2 |
| Comment explaining governance | ✅ Lines 3-5 |
| Comment explaining source package | ✅ Line 6 |

### 3. Dependabot Configuration ✅

`.github/dependabot.yml` (11 lines):

| Check | Status |
|-------|--------|
| `version: 2` | ✅ Line 1 |
| `package-ecosystem: "npm"` | ✅ Line 3 |
| `directory: "/"` (monorepo root) | ✅ Line 4 |
| `interval: "weekly"` + `day: "monday"` | ✅ Lines 6-7 |
| `open-pull-requests-limit: 10` | ✅ Line 8 |
| Labels: `dependencies`, `security` | ✅ Lines 10-11 |

### 4. Quality Baseline ✅

`_bmad-output/test-artifacts/quality-baseline.md` (83 lines):

| Check | Status |
|-------|--------|
| 10 prompts across key domains | ✅ Prompts 1-10 |
| Input/API/Expected/Criteria per prompt | ✅ All 4 fields in all 10 |
| Specific API endpoints (AC-3) | ✅ e.g., `POST /api/workspace/hub`, `GET /api/workspace/knowledge/search` |
| A/B blind comparison methodology | ✅ Header: scoring 1-5 per dimension, randomized order |
| Korean prompts for Korean platform | ✅ |
| Scoring dimensions: Relevance, Action accuracy, Format quality | ✅ |

### 5. Routing Scenarios ✅

`_bmad-output/test-artifacts/routing-scenarios.md` (87 lines):

| Check | Status |
|-------|--------|
| 10 scenarios | ✅ Scenarios 1-10 |
| All NFR-O5 categories | ✅ Direct, ambiguous, cross-dept, OOS, follow-up, multi-step, bilingual, abbreviation, typo, concurrent |
| Input/Routing/Agent/Rationale per scenario | ✅ All fields present |
| 8/10+ pass threshold | ✅ Documented |
| Scoring: 1.0/0.0/0.5 | ✅ Clear rubric with per-scenario notes |
| Concurrent scenario references `LLMRouterContext` | ✅ Per-request isolation verified in Phase A |

### 6. Tests (26/26 pass) ✅

| Category | Count | Notes |
|----------|-------|-------|
| CI workflow audit step | 6 | Existence, allowlist `grep -vFf`, severity grep, `::error::`, ordering |
| Allowlist file | 3 | Existence, GHSA IDs, review date |
| Dependabot config | 5 | Ecosystem, schedule, labels, limit, directory |
| Quality baseline | 5 | Existence, 10 prompts, structure, A/B methodology, domains |
| Routing scenarios | 6 | Existence, 10 scenarios, categories, structure, threshold, partial credit |

Test at line 30 now checks `grep -vFf` (not `grep -vFf .github/audit-allowlist.txt` specifically), which is correct — the process substitution changes the actual argument.

---

## Architecture Compliance

| Check | Status |
|-------|--------|
| E8 engine boundary | ✅ No engine/ imports in any file |
| No DB migrations | ✅ Pure CI/docs changes |
| No runtime code changes | ✅ Only CI workflows + documentation artifacts |
| Existing CI steps preserved | ✅ Build, type-check, unit tests unchanged |
| deploy.yml paths-filter unchanged | ✅ Same filter set |

---

## Score

| Dimension | Weight | Score | Reasoning |
|-----------|--------|-------|-----------|
| D1 Specificity | 15% | 9/10 | Well-structured documents, clear CI scripts, NFR references |
| D2 Completeness | 15% | 9/10 | All ACs addressed. Both bugs fixed. |
| D3 Accuracy | 25% | 9/10 | Allowlist mechanism correct. hono 4.12.9. 0 unallowlisted critical/high. |
| D4 Implementability | 20% | 9/10 | Bug 1 fix is clean. Hono fix is trivial (version bump + install). |
| D5 Consistency | 15% | 9/10 | Both workflows identical. Conventions match. |
| D6 Risk | 10% | 9/10 | hono fixed. Allowlist governance clear. Quarterly review scheduled. |

**Weighted**: (9×0.15)+(9×0.15)+(9×0.25)+(9×0.20)+(9×0.15)+(9×0.10) = 1.35+1.35+2.25+1.80+1.35+0.90 = **9.00/10**

---

## Final Verdict

### ✅ APPROVE — 9.00/10 (updated after hono fix)

Both Phase B bugs resolved:
- Bug 1 (blank line): Process substitution strips comments/blanks. Allowlist works correctly.
- Bug 2 (hono 4.12.3): Updated to 4.12.9 in server workspace. `bun audit` → 0 unallowlisted critical/high.

26 tests pass. CI audit functional. Quality baseline and routing scenarios well-structured. Ready for commit + push.
