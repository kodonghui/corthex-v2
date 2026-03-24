# Story 22.5 — Phase E QA Verification (Quinn, Critic-B)

**Story**: 22.5 — CI Dependency Scanning & Quality Baselines
**Phase**: E (QA Verification)
**Reviewer**: Quinn (QA + Security)
**Date**: 2026-03-24

---

## Acceptance Criteria Verification

### AC-1: `bun audit` in CI pipeline — ⚠️ CONDITIONAL (2 bugs pending fix)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Audit step in ci.yml | ✅ | ci.yml lines 21-30, named "Security audit (NFR-S14)" |
| Audit step in deploy.yml | ✅ | deploy.yml lines 46-56, with path filter guard |
| Critical/High fail CI | ❌ | **Blank line in allowlist = total bypass** (see Phase B Finding 1) |
| Moderate/Low logged but pass | ✅ | grep only checks `^\s*(critical\|high):` |
| Allowlist for unfixable transitive | ❌ | **File exists but has blank line making it ineffective** |
| After install, before build | ✅ | ci.yml: after "Install dependencies", before "Build all packages" |
| ::error:: annotations | ✅ | `echo "::error::$line"` in while loop |

**Blocking bugs**:
1. `.github/audit-allowlist.txt` line 6 is blank → `grep -vFf` removes ALL output → audit is no-op
2. hono still at 4.12.3 in bun.lock (not updated) → serveStatic HIGH vulnerability in production

### AC-2: Dependabot configuration — ✅ PASS

| Requirement | Status | Evidence |
|-------------|--------|----------|
| `.github/dependabot.yml` exists | ✅ | File present |
| npm ecosystem | ✅ | `package-ecosystem: "npm"` |
| Weekly Monday schedule | ✅ | `interval: "weekly"`, `day: "monday"` |
| Auto-create PRs | ✅ | Inherent to Dependabot |
| Labels: dependencies, security | ✅ | Both labels configured |
| open-pull-requests-limit: 10 | ✅ | Configured |
| Directory: / | ✅ | `directory: "/"` |

### AC-3: Quality baseline document (NFR-O4) — ✅ PASS

| Requirement | Status | Evidence |
|-------------|--------|----------|
| File exists | ✅ | `_bmad-output/test-artifacts/quality-baseline.md` |
| 10 prompts | ✅ | Prompts 1-10 covering all domains |
| Each has Input, API, Expected, Success criteria | ✅ | Verified per section |
| API endpoints included | ✅ | Each prompt lists specific endpoint(s) |
| A/B blind comparison methodology | ✅ | Header section with relevance/accuracy/format scoring |
| Covers key domains | ✅ | Chat, knowledge, routing, dept, SNS, notification, dashboard, file, job, settings |

### AC-4: Routing scenarios document (NFR-O5) — ✅ PASS

| Requirement | Status | Evidence |
|-------------|--------|----------|
| File exists | ✅ | `_bmad-output/test-artifacts/routing-scenarios.md` |
| 10 scenarios | ✅ | Scenarios 1-10 |
| All NFR-O5 categories | ✅ | Direct, ambiguous, cross-dept, out-of-scope, follow-up, multi-step, bilingual, abbreviation, typo, concurrent |
| Each has Input, Expected routing, Rationale | ✅ | Verified per section |
| Pass threshold 8/10+ | ✅ | Documented in header |
| Concrete Korean inputs | ✅ | All scenarios have specific Korean text (including concurrent #10) |
| Scoring rubric with partial credit | ✅ | 1.0/0.5/0.0 scoring documented |

### AC-5: Baseline files committed — ✅ PASS

Both `quality-baseline.md` and `routing-scenarios.md` exist in the repository.

---

## QA Summary

| AC | Status |
|----|--------|
| AC-1 | ⚠️ CONDITIONAL — 2 bugs blocking |
| AC-2 | ✅ PASS |
| AC-3 | ✅ PASS |
| AC-4 | ✅ PASS |
| AC-5 | ✅ PASS |

**Overall: 4/5 ACs pass. AC-1 blocked by allowlist blank line bug + hono lockfile not updated.**

After dev fixes the two Phase B findings:
1. Remove blank line from `.github/audit-allowlist.txt` (or pre-filter in CI script)
2. Run `bun update hono` to resolve lockfile to >=4.12.4

All 5 ACs will pass.

---

*Quinn — Critic-B (QA + Security) — corthex-epic-22*
