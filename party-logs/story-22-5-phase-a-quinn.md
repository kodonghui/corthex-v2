# Story 22.5 — Phase A Spec Review (Quinn, Critic-B)

**Story**: 22.5 — CI Dependency Scanning & Quality Baselines
**Phase**: A (Spec Review — Round 1)
**Reviewer**: Quinn (QA + Security)
**Date**: 2026-03-24

---

## Findings

### Finding 1 — CRITICAL: CI will be permanently red (no allowlist mechanism)

**Severity**: CRITICAL
**Affected**: Task 1.3, AC-1

I verified the grep pattern against actual `bun audit` output on this repo:

```
  critical: fast-xml-parser has an entity encoding bypass via regex injection...
  high: fast-xml-parser affected by DoS through entity expansion...
  high: fast-xml-parser affected by numeric entity expansion bypassing...
  high: Hono vulnerable to arbitrary file access via serveStatic...
```

The grep `'^\s*(critical|high):'` is **syntactically correct** — it matches these lines. Which means **CI will fail immediately** on every PR and every push.

- `fast-xml-parser` critical+high is transitive via `@aws-sdk/client-s3` → **cannot be fixed** (AWS SDK pins it)
- Even after updating hono (removes 1 high), fast-xml-parser critical+2high remain
- No allowlist, ignore-list, or exemption mechanism exists in the spec

**Impact**: Adding this CI step as-is blocks ALL development. Every PR fails, every deploy fails.

**Required fix**: Add an allowlist mechanism. Options:
1. `.audit-ignore` file listing CVE IDs to skip (grep `-v` against it before severity check)
2. Package-level ignore: grep out `fast-xml-parser` lines before severity check (fragile)
3. Use `bun audit --ignore-advisory <ID>` if available (needs verification)
4. At minimum: `continue-on-error: true` with `::warning::` annotation (weakest option)

Recommended approach — **option 1** with `.audit-allowlist`:
```bash
AUDIT_OUTPUT=$(bun audit 2>&1 || true)
echo "$AUDIT_OUTPUT"
# Filter out allowlisted advisories
if [ -f .audit-allowlist ]; then
  FILTERED=$(echo "$AUDIT_OUTPUT" | grep -vFf .audit-allowlist)
else
  FILTERED="$AUDIT_OUTPUT"
fi
if echo "$FILTERED" | grep -qE '^\s*(critical|high):'; then
  echo "::error::Critical/High vulnerabilities found (not in allowlist)"
  exit 1
fi
```

The `.audit-allowlist` file would contain advisory URLs or CVE IDs for accepted risks, reviewed quarterly.

### Finding 2 — HIGH: hono update not included as task

**Severity**: HIGH
**Affected**: Dev Notes, overall scope

The spec identifies hono >=4.12.4 as **actionable** and lists 4 vulnerabilities including:
- **HIGH: arbitrary file access via serveStatic** (GHSA-q5qw-h33p-qvwr) — actual exploit path
- **HIGH (effective)**: setCookie injection, SSE injection, parseBody prototype pollution

hono is a **runtime dependency** (not dev-only like esbuild). These are exploitable attack vectors in production. The spec says "needs update" but doesn't include it as a task.

**Required fix**: Add Task 1.5: `bun update hono` and verify no breaking changes. This removes 1 high + 3 moderate, taking total from 11→7 vulnerabilities. Reduces CI noise significantly.

### Finding 3 — MEDIUM: No structured CI failure annotation

**Severity**: MEDIUM
**Affected**: Task 1.3

When CI fails, the dev sees the full `bun audit` dump and has to visually scan for critical/high lines. The script should extract and annotate the specific findings:

```bash
# After determining failure, annotate specific lines
echo "$FILTERED" | grep -E '^\s*(critical|high):' | while read -r line; do
  echo "::error::$line"
done
```

This produces per-finding GitHub Actions annotations visible in the PR checks UI.

### Finding 4 — LOW: Routing scenario #10 underspecified

**Severity**: LOW
**Affected**: Task 4.2 scenario 10

All other routing scenarios have concrete user input. Scenario 10 says:
> "개발팀에 버그 리포트 보내줘" **(with typo variation)**

But doesn't specify the actual typo. Should be concrete, e.g.:
- "개발팀에 벅그 리포트 보내줘" (벅그 instead of 버그)
- or "갸발팀에 버그 리포트 보내줘" (갸발 instead of 개발)

### Finding 5 — INFO: Dependabot `/` directory is correct

The monorepo uses a single `bun.lock` at root. Dependabot with `directory: /` and `package-ecosystem: npm` is the correct configuration. No issue here.

### Finding 6 — INFO: Test approach (Task 5)

Testing CI YAML files by reading them in unit tests is unconventional but acceptable for config integrity verification. Just note these tests will break if YAML structure changes — keep them simple (check for key presence, not exact content).

---

## Dimension Scores

| Dimension | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| D1 Specificity | 10% | 8 | Grep pattern verified correct. Baseline prompts concrete. Scenario 10 slightly vague. |
| D2 Completeness | 25% | 5 | No allowlist = CI DOA. hono update missing. No CI-red contingency. |
| D3 Accuracy | 15% | 8 | Grep pattern matches actual output. Dev notes accurate. |
| D4 Implementability | 10% | 5 | CI step will immediately fail — needs allowlist first. |
| D5 Consistency | 15% | 8 | Follows existing CI patterns, self-hosted runner, path filter. |
| D6 Risk Awareness | 25% | 5 | Documents vulns but doesn't solve CI-red. hono HIGH not fixed. |

### Weighted Total

| D | W | S | W×S |
|---|---|---|-----|
| D1 | 10% | 8 | 0.80 |
| D2 | 25% | 5 | 1.25 |
| D3 | 15% | 8 | 1.20 |
| D4 | 10% | 5 | 0.50 |
| D5 | 15% | 8 | 1.20 |
| D6 | 25% | 5 | 1.25 |
| **Total** | | | **6.20** |

---

## Verdict: **6.20/10 — FAIL ✗**

The story spec is well-structured for baseline documentation (Tasks 3-4) but the CI integration (Tasks 1-2) has a fundamental flaw: it will **immediately and permanently break CI** because of known, unfixable transitive vulnerabilities. No allowlist or exemption mechanism is provided.

### Required fixes (to pass):
1. **Add allowlist mechanism** for known transitive vulns (Finding 1) — CRITICAL
2. **Add hono update task** (Finding 2) — HIGH
3. **Add CI failure annotations** (Finding 3) — MEDIUM
4. **Concrete typo in scenario 10** (Finding 4) — LOW

Expected score after fixes: 8.0+

---

---

## Round 2 Re-Review (updated spec)

**Date**: 2026-03-24

### Changes evaluated:
1. **Concurrent scenario added** (#10) — John's finding. ✅ Resolved.
2. **Bilingual merged** (#7 Korean+English) — John's finding. ✅ Resolved.
3. **API endpoints added** to all 10 quality baseline prompts — John's finding. ✅ Resolved.
4. **Hono remediation path documented** (line 135) — "pre-implementation step in Phase B". ✅ My Finding 2 resolved.
5. **Concrete typo** in scenario 9: "벅그→버그". ✅ My Finding 4 resolved.
6. **CI allowlist acknowledged** (lines 140-143) — 3 options listed, `.github/audit-allowlist.txt` mentioned. ⚠️ My Finding 1 **partially** resolved.

### Remaining gap:

**Task 1.3 script is unchanged.** The Dev Notes say "The grep filter in Task 1.3 must account for known transitive vulnerabilities" and list 3 options. But the actual Task 1.3 (line 52) and the script example (lines 121-129) still have no allowlist integration. This is a spec self-contradiction — guidance says "must" but the task doesn't implement it.

**Required**: Either:
- Update Task 1.3 script to include allowlist filtering (pick option 3), OR
- Add Task 1.5: Create `.github/audit-allowlist.txt` with fast-xml-parser CVEs, integrate into audit script

This is minor enough to resolve in implementation — the dev has clear direction from the Dev Notes.

### Updated Scores

| Dimension | Weight | R1 | R2 | Delta | Rationale |
|-----------|--------|----|----|-------|-----------|
| D1 Specificity | 10% | 8 | 9 | +1 | API endpoints, concrete typo, concurrent scenario |
| D2 Completeness | 25% | 5 | 6 | +1 | Allowlist acknowledged but not in task. hono planned. |
| D3 Accuracy | 15% | 8 | 8 | 0 | Unchanged — grep pattern and Dev Notes accurate |
| D4 Implementability | 10% | 5 | 6 | +1 | hono Phase B pre-step practical. Allowlist direction clear. |
| D5 Consistency | 15% | 8 | 8 | 0 | Unchanged |
| D6 Risk Awareness | 25% | 5 | 7 | +2 | Risk now documented with remediation path + options |

### Weighted Total (Round 2)

| D | W | S | W×S |
|---|---|---|-----|
| D1 | 10% | 9 | 0.90 |
| D2 | 25% | 6 | 1.50 |
| D3 | 15% | 8 | 1.20 |
| D4 | 10% | 6 | 0.60 |
| D5 | 15% | 8 | 1.20 |
| D6 | 25% | 7 | 1.75 |
| **Total** | | | **7.15** |

## Verdict (Round 2): **7.15/10 — CONDITIONAL PASS ✓**

Passes the 7.0 threshold. The allowlist gap is acknowledged in Dev Notes with clear direction — dev can resolve it during implementation. Condition: Task 1.3 script must include allowlist filtering in Phase B implementation, and `.github/audit-allowlist.txt` must be created with fast-xml-parser advisory URLs.

---

---

## Round 3 Re-Review (all fixes applied)

**Date**: 2026-03-24

### All 4 findings resolved:

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | CRITICAL | CI permanently red — no allowlist | ✅ Task 1.3 `.github/audit-allowlist.txt` + Task 1.4 `grep -vFf` filtering |
| 2 | HIGH | hono update missing | ✅ Task 1.5 `bun update hono` >=4.12.4 pre-step |
| 3 | MEDIUM | No CI failure annotations | ✅ `::error::` per matching line in Task 1.4 script |
| 4 | LOW | Typo scenario vague | ✅ "벅그→버그" concrete (fixed in R2) |

### Verification details:

**Allowlist mechanism** (Task 1.3 + 1.4): Script flow is correct:
1. `bun audit 2>&1 || true` — capture all output, don't exit on vuln
2. `grep -vFf .github/audit-allowlist.txt || true` — remove allowlisted advisory lines
3. `grep -E '^\s*(critical|high):' || true` — check remaining for critical/high
4. `echo "::error::$line"` — annotate each hit
5. `exit 1` if any hits remain

Advisory URLs in allowlist (GHSA-*) are on the same lines as severity in `bun audit` output, so `grep -vFf` correctly removes the entire vulnerability entry.

**Minor note**: `grep -F` treats `#` comment lines as literal patterns. Practically safe (audit output won't contain the comment string), but technically `grep -vFf` could filter unexpected lines if comment text appears in output. Informational only — not blocking.

**Governance**: Quarterly review cycle documented with dates. Adding to allowlist requires justification (transitive, no direct fix). Good.

### Updated Scores (Round 3)

| Dimension | Weight | R1 | R2 | R3 | Rationale |
|-----------|--------|----|----|-----|-----------|
| D1 Specificity | 10% | 8 | 9 | 9 | Concrete tasks, GHSA IDs listed, script with code |
| D2 Completeness | 25% | 5 | 6 | 9 | All findings addressed. Allowlist + hono + annotations. |
| D3 Accuracy | 15% | 8 | 8 | 9 | Script logic verified against actual bun audit output |
| D4 Implementability | 10% | 5 | 6 | 9 | Clear tasks, concrete script, no blockers |
| D5 Consistency | 15% | 8 | 8 | 9 | AC, tasks, script, Dev Notes all aligned |
| D6 Risk Awareness | 25% | 5 | 7 | 9 | Allowlist governance, quarterly review, hono pre-step |

### Weighted Total (Round 3)

| D | W | S | W×S |
|---|---|---|-----|
| D1 | 10% | 9 | 0.90 |
| D2 | 25% | 9 | 2.25 |
| D3 | 15% | 9 | 1.35 |
| D4 | 10% | 9 | 0.90 |
| D5 | 15% | 9 | 1.35 |
| D6 | 25% | 9 | 2.25 |
| **Total** | | | **9.00** |

## Verdict (Round 3): **9.00/10 — PASS ✓**

Excellent turnaround from 6.20 → 7.15 → 9.00. All security concerns resolved. CI will work correctly with allowlist filtering. Spec is internally coherent.

---

*Quinn — Critic-B (QA + Security) — corthex-epic-22*
