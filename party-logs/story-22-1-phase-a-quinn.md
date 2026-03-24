# Critic-B Review — Story 22.1: Dependency Verification & Version Pinning

**Reviewer:** Quinn (QA + Security)
**Date:** 2026-03-24
**Rubric weights:** D1=10%, D2=25%, D3=15%, D4=10%, D5=15%, D6=25%

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Exact versions, file paths, line numbers all provided. Two placeholders: `@hono/zod-validator` and `pino` listed as "resolved exact version" instead of actual numbers. |
| D2 완전성 | 5/10 | **Critical gap**: `@google/generative-ai` removal contradicts "Do NOT modify source code" — 4 files still import it (see Issue #1). Multiple server `^` deps unclassified (see Issue #2). `@types/bun: latest` fix mentioned only in Dev Notes, not in any Task/AC. |
| D3 정확성 | 8/10 | All package versions verified against actual `package.json` files. Dockerfile `bun.lock` reference ✅. CI workflow versions ✅. Zod AC wording slightly imprecise — says "no v4 beta" but real problem is two v3 versions (3.23.8 + 3.25.76). |
| D4 실행가능성 | 6/10 | Good task breakdown, but dev would be blocked by @google/generative-ai contradiction immediately. No guidance on which "resolved exact version" to use for 2 packages. No test snippet for new assertions. |
| D5 일관성 | 5/10 | Architecture says "0.x = exact pin" but Task 2.3 keeps `lucide-react: ^0.577.0` (0.x) as caret without justification. `hono-rate-limiter: ^0.5.3` (0.x) entirely omitted from pin list. App vs admin lucide-react inconsistency not addressed. |
| D6 리스크 | 5/10 | Three risks identified (Zod dual, @types/bun, @google removal), but the biggest risk — guaranteed build breakage from removing @google/generative-ai — is acknowledged without resolution. Multiple 0.x packages left on caret without risk assessment. CI `|| true` on tests means "zero regression" is unverifiable in CI. |

### 가중 평균: 5.60/10 ❌ FAIL

---

## 🚨 Auto-Fail Condition Triggered

**빌드 깨짐 (Build Breakage):**

Task 2.4 says remove `@google/generative-ai` from `packages/server/package.json`. But 4 files still import it:

1. `packages/server/src/services/embedding-service.ts:1` — `import { GoogleGenerativeAI } from '@google/generative-ai'`
2. `packages/server/src/lib/llm/google.ts:1` — `import { GoogleGenerativeAI, ... } from '@google/generative-ai'`
3. `packages/server/src/__tests__/unit/embedding-tea.test.ts:30` — `mock.module('@google/generative-ai', ...)`
4. `packages/server/src/__tests__/unit/embedding-service.test.ts:12` — `mock.module('@google/generative-ai', ...)`

The story's own "What NOT to Change" section says: *"Do NOT modify any source code beyond package.json and test files"*

**Result:** Removing the dep from package.json without removing these imports = `turbo build` fails = AC-4 impossible. This is a guaranteed build failure — auto-fail per rubric rule #3.

---

## 이슈 목록

### Issue #1 — [BLOCKER] [D2/D6] @google/generative-ai removal will break the build

**Problem:** Task 2.4 removes `@google/generative-ai` from package.json, but `embedding-service.ts` and `google.ts` have runtime imports. Build will fail.

**Fix options (pick one):**
- **Option A (Recommended):** Defer removal to Story 22.2 (Voyage AI migration), where the source code is also replaced. In this story, just leave it and add a deprecation note.
- **Option B:** Expand scope to also remove/stub `embedding-service.ts`, `google.ts`, and their 2 test files. But this contradicts "Do NOT modify source code" and bleeds into 22.2 scope.

### Issue #2 — [D2] 7+ server `^` dependencies unclassified

The story classifies some packages as "pin" and some as "keep caret", but these server dependencies are in neither list:

| Package | Version | 0.x? | Classification needed |
|---------|---------|------|----------------------|
| `openai` | `^6.27.0` | No | Server LLM provider — pin or caret? |
| `hono-rate-limiter` | `^0.5.3` | **YES** | 0.x = MUST exact-pin per architecture rule |
| `@zapier/secret-scrubber` | `^1.1.6` | No | Security package — should classify |
| `croner` | `^10.0.1` | No | Server cron — should classify |
| `js-yaml` | `^4.1.1` | No | Should classify |
| `web-push` | `^3.6.7` | No | Should classify |
| `bun-types` | `^1.3.10` | No | DevDep — should classify |
| `@types/js-yaml` | `^4.0.9` | No | DevDep |
| `@types/web-push` | `^3.6.4` | No | DevDep |
| `zod-to-json-schema` | `^3.25.1` | No | DevDep |

**Especially critical:** `hono-rate-limiter: ^0.5.3` is a 0.x package and MUST be exact-pinned per the architecture's own "0.x = exact pin" rule.

### Issue #3 — [D5] lucide-react 0.x inconsistency

- Architecture rule: "0.x = exact pin"
- `packages/admin/package.json`: `"lucide-react": "0.577.0"` (exact ✅)
- `packages/app/package.json`: `"lucide-react": "^0.577.0"` (caret ❌)
- Task 2.3 explicitly keeps app's caret with no justification

**Fix:** Either pin app's lucide-react to match admin (consistent + follows 0.x rule), or add explicit justification for the exception.

### Issue #4 — [D1] Two "resolved exact version" placeholders

Task 2.1:
- `@hono/zod-validator: ^0.5 → resolved exact version` — what version?
- `pino: ^10.3.1 → resolved exact version` — what version?

Dev must run `bun pm ls` to discover these. Provide the actual resolved version numbers.

### Issue #5 — [D6] `@types/bun: latest` not in any Task

Dev Notes line 140 says "@types/bun: latest — should pin to exact version for determinism" but there's no Task subtask to actually do this. Add it to Task 2.2 (devDependencies).

### Issue #6 — [D3] AC-6 Zod phrasing imprecise

AC-6 says: "only one Zod version exists in node_modules (no v4 beta alongside v3)"

But Dev Notes line 138 says: "Two Zod versions detected in node_modules (3.23.8 and 3.25.76)". The real risk is two v3 versions coexisting, not a v4 beta. Rephrase AC-6 to: "only one Zod version exists in `node_modules` (verify dedup of 3.23.8 + 3.25.76)"

### Issue #7 — [D6] CI test `|| true` undermines AC-5

`deploy.yml` lines 60-62 run tests with `|| true`, swallowing failures silently. The story claims AC-5 "zero regression" but CI can't enforce this. Add a note or sub-task to address this pre-existing gap (at minimum, flag it as a known limitation).

### Issue #8 — [D6] CI uses `bun install` without `--frozen-lockfile` (from Winston cross-talk)

`deploy.yml:44` runs plain `bun install`, not `bun install --frozen-lockfile`. This means CI could resolve different versions than the developer's pinned lockfile — a supply chain risk. Task 8 should add a subtask to either switch CI to `--frozen-lockfile` or explicitly justify why not.

### Issue #9 — [D2] AC-5 test count hardcoded at 10,154 is fragile (from John cross-talk)

AC-5 says "all 10,154 existing tests pass." If tests are added/removed by other work, this number becomes stale. Better: "all existing tests pass with zero failures" (`test exit code 0`). Drop the specific count or use "matches or exceeds baseline."

### Issue #10 — [D6] Zod dual-version has schema validation security implications

If `drizzle-zod` resolves to 3.23.8 while `@hono/zod-validator` uses 3.25.76, schema validation could behave differently at DB vs API layers. A malformed input that passes Hono validation (3.25.76) might cause unexpected behavior at Drizzle (3.23.8). Task 6 should add: `bun pm ls zod` tree view to verify which packages pull in which Zod version.

---

## Cross-talk Notes (Updated)

### Winston (Critic-A) — 6.6/10 FAIL
- **Aligned**: BUILD BREAKER (@google/generative-ai), hono-rate-limiter 0.x, @types/bun: latest
- **New from Winston**: CI `--frozen-lockfile` missing (supply chain risk) → added as Issue #8
- **My response**: Zod dual-version has schema validation security implications (DB vs API layer divergence). Dead @google imports are a build safety net — deferring removal is correct, but 22.2 must explicitly require file deletion.

### John (Critic-C) — 8.80/10 PASS
- **Aligned**: Zod dual-version well-identified, test count fragile
- **New from John**: CI cache invalidation gap, test count hardcoding → added as Issue #9
- **My response**: Task 6.4 only greps for zod, NOT for @google/generative-ai — the removal verification is only a Risk note, not a task. Deferring to 22.2 is strongly preferred from QA perspective.

### Consensus
- All 3 critics agree @google/generative-ai removal is problematic (2 FAIL, 1 flagged)
- All 3 agree on Zod dual-version risk being well-identified
- Quinn + Winston aligned on hono-rate-limiter 0.x gap
- Quinn + John aligned on fragile test count

---

## Summary

The story is well-structured with good specificity and accurate version data, but has a **critical blocker**: removing `@google/generative-ai` from package.json will break the build because source code still imports it. Additionally, 7+ server dependencies are unclassified, the 0.x pinning rule is inconsistently applied (hono-rate-limiter, lucide-react in app), CI lacks `--frozen-lockfile` (supply chain risk), and test count is fragile. 10 issues total — must be resolved before dev can proceed.

**Verdict: FAIL (5.60/10) + Auto-Fail (Build Breakage)**

---

## Re-Verification (Post-Fixes)

**Date:** 2026-03-24

### Issue Resolution

| # | Issue | Status | Verification |
|---|-------|--------|-------------|
| 1 | BLOCKER: @google/generative-ai build breakage | ✅ FIXED | Task 2.5 "Do NOT remove." Task 2.1 pins to `0.24.1`. "What NOT to Change" updated. |
| 2 | 7+ unclassified deps | ✅ FIXED | Task 2.4 classifies all remaining caret deps. `hono-rate-limiter` exact-pinned in 2.1. `@types/bun`+`bun-types` in 2.2. |
| 3 | lucide-react 0.x inconsistency | ✅ FIXED | Task 2.3 pins app `^0.577.0 → 0.577.0`. Matches admin. |
| 4 | Placeholder versions | ✅ FIXED | `@hono/zod-validator: 0.5.0`, `pino: 10.3.1`. |
| 5 | @types/bun not in Task | ✅ FIXED | Task 2.2: `@types/bun: latest → 1.3.10`, `bun-types: ^1.3.10 → 1.3.10`. |
| 6 | AC-6 Zod phrasing | ✅ FIXED | "no dual v3 versions — 3.23.8 + 3.25.76 detected; must resolve to single version." |
| 7 | CI `\|\| true` | ✅ FIXED | Risks section: "AC-5 verified locally. CI enforcement = separate story." |
| 8 | CI `--frozen-lockfile` (Winston) | ✅ FIXED | Task 8.1: `bun install → bun install --frozen-lockfile`. |
| 9 | AC-5 hardcoded count (John) | ⚠️ MINOR | Count kept but Task 5.4 says "matches or exceeds" — floor baseline, not exact. Acceptable. |
| 10 | Zod tree analysis (cross-talk) | ⚠️ MINOR | Task 6.1 "must be single version" covers dedup. No explicit tree subtask but functionally covered. |

### Auto-Fail Conditions — CLEAR
- [x] No hallucinations (all file paths, versions verified against codebase)
- [x] No security holes
- [x] Build will succeed (@google dep kept, all imports intact)
- [x] No data loss risk
- [x] No architecture violations (E8 boundary untouched)

### Re-Scored 차원별 점수

| 차원 | Before | After | 근거 |
|------|--------|-------|------|
| D1 구체성 | 8 | **9** | All versions concrete. No placeholders. Only AC-5 count is minor. |
| D2 완전성 | 5 | **9** | Every package classified (pin/caret). @google deferred cleanly. CI --frozen-lockfile. 2 minor items. |
| D3 정확성 | 8 | **9** | AC-6 wording fixed. All versions verified accurate against actual package.json files. |
| D4 실행가능성 | 6 | **9** | No ambiguity — dev knows exactly what to pin, what to keep, what NOT to touch. |
| D5 일관성 | 5 | **9** | 0.x rule now consistently applied (lucide-react, hono-rate-limiter). Architecture alignment. |
| D6 리스크 | 5 | **8** | Rollback plan added. @google deferral. CI || true flagged. Zod tree not explicit subtask (minor). |

### 가중 평균: 8.75/10 ✅ PASS

(D1×10% + D2×25% + D3×15% + D4×10% + D5×15% + D6×25% = 0.90+2.25+1.35+0.90+1.35+2.00 = **8.75**)

### Minor Recommendations (Non-Blocking)
1. Consider removing the hardcoded `10,154` from AC-5 in favor of "all existing tests pass with zero failures" — avoids staleness as test count evolves.
2. Consider adding `bun pm ls zod` to Task 6.1 as an explicit command for Zod tree verification.

**Final Verdict: [Verified] 8.75/10 ✅ PASS**
