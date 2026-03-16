---
name: 'kdh-code-review-full-auto'
description: 'Full-auto code review + auto-fix pipeline v2.0. 8 phases: Static Gate → Visual/E2E → Risk → 3-Critic Party → Verdict → Auto-Fix → Re-Review → Final. Usage: /kdh-code-review-full-auto [PR-url|commit-range|changed-files]'
---

# KDH Code Review Full-Auto Pipeline v2.0

8-phase automated code review + auto-fix: Static Gate → Visual/E2E Gate → Risk Classification → AI 3-Critic Party → Resolution → Auto-Fix → Re-Review → Final Verdict.
Integrates Playwright visual regression, axe-core accessibility, Lighthouse performance, BMAD party mode, and automated remediation loop.

## Mode Selection

- No args: Review uncommitted changes (`git diff HEAD`)
- PR URL: Review PR diff (`gh pr diff {number}`)
- Commit range: Review specific commits (`git diff {base}..{head}`)
- `full`: Full codebase audit (slow, use sparingly)

## Model Strategy

| Role | Model | Notes |
|------|-------|-------|
| Orchestrator | opus | Risk classification, final verdict, fix orchestration |
| Critic-Security | **opus** | OWASP, injection, auth bypass — 보안은 타협 없음 |
| Critic-Architecture | **opus** | E8 boundary, patterns, DRY — 아키텍처 판단은 정확도 필수 |
| Critic-UX-Perf | **opus** | Playwright VRT, a11y, bundle size — 미묘한 UI 버그 감지 |
| Fixer-Agent(s) | **opus** | Worktree 격리, 이슈별 수정 — 정확한 수정이 핵심 |
| Re-Reviewer | **opus** | Delta-only 검증 — 수정이 새 문제를 만들지 않았는지 확인 |

**전원 Opus 이유**: 코드 리뷰는 미묘한 버그/보안 취약점을 잡아야 하므로 정확도 > 속도. Sonnet은 false negative 위험.

---

## Anti-Patterns

1. **Reviewing all files equally** — FIX: Risk-classify first, focus effort on HIGH risk
2. **Vague comments** — FIX: Conventional Comments format mandatory (label: message)
3. **Nitpicking style issues** — FIX: ESLint/Prettier handle style. Critics focus on logic/security/architecture
4. **Skipping tests** — FIX: Phase 2 gates are mandatory. No skip.
5. **Approving without evidence** — FIX: Each critic must cite file:line and explain WHY

---

## Phase 1: Static Gate (parallel, ~1min)

Run ALL in parallel. Any FAIL = block review.

```
Orchestrator runs simultaneously:
├── tsc --noEmit -p packages/server/tsconfig.json
├── tsc --noEmit -p packages/app/tsconfig.json
├── bunx eslint {changed-files} --no-warn-ignored
├── bun test {affected-test-files}
└── Bundle size check: du -sh packages/app/dist/assets/ (compare to baseline)
```

**Gate criteria:**
- tsc errors: 0
- ESLint errors: 0 (warnings OK)
- Tests: all pass
- Bundle size: no increase > 10KB gzip vs main

**Output:** `review-report/phase-1-static.md`

---

## Phase 2: Visual & E2E Gate (parallel, ~3min)

Run if Phase 1 passes AND changed files include `packages/app/` or `packages/ui/`.

```
Orchestrator runs simultaneously:
├── Playwright E2E: critical user flows
│   ├── Login → Hub → Chat (send message) → verify response
│   ├── Agents CRUD: create → edit → delete
│   ├── NEXUS: open canvas → verify nodes render
│   └── Settings: change setting → verify saved
├── Playwright Visual Regression (VRT):
│   ├── Screenshot each changed page (desktop 1280x800 + mobile 390x844)
│   ├── Compare against baseline screenshots
│   └── Generate diff images for any pixel changes > 0.1%
├── axe-core Accessibility:
│   ├── Run @axe-core/playwright on each changed page
│   └── Report: critical (block), serious (warn), moderate/minor (info)
└── Lighthouse CI (if dashboard/landing changed):
    ├── Performance score (budget: 90+)
    ├── Accessibility score (budget: 95+)
    └── Best practices score (budget: 90+)
```

**Gate criteria:**
- E2E: all critical flows pass
- VRT: no unexpected visual changes (or diff images reviewed)
- axe-core: 0 critical violations
- Lighthouse: above budget scores

**Output:** `review-report/phase-2-visual.md` + `review-report/screenshots/`

---

## Phase 3: Risk Classification (auto, ~10sec)

Orchestrator classifies each changed file:

```
HIGH RISK (mandatory deep review):
  - packages/server/src/engine/**        # Core engine
  - packages/server/src/middleware/**     # Auth, rate-limit
  - packages/server/src/lib/credential-* # Encryption
  - packages/server/src/db/schema.ts     # DB migrations
  - packages/shared/types.ts             # Shared contracts
  - **/auth*, **/login*, **/token*       # Authentication
  - Dockerfile, .github/workflows/**     # Infrastructure

MEDIUM RISK (standard review):
  - packages/server/src/routes/**        # API endpoints
  - packages/server/src/services/**      # Business logic
  - packages/app/src/hooks/**            # State management
  - packages/app/src/lib/api.ts          # API client
  - packages/app/src/components/**       # Stateful components

LOW RISK (quick scan):
  - packages/app/src/pages/**            # UI pages (mostly presentational)
  - packages/app/src/ui/**               # UI components
  - *.test.ts, *.test.tsx                # Test files
  - *.md, *.yaml, *.json                 # Config/docs
  - _corthex_full_redesign/**            # Design artifacts
  - _bmad-output/**                      # Planning artifacts
```

**Risk score**: HIGH=10, MEDIUM=5, LOW=1. Sum all files. Score > 30 = "Ask" (full review). Score 10-30 = "Show" (async review). Score < 10 = "Ship" (auto-approve if Phase 1+2 pass).

**Output:** `review-report/phase-3-risk.md` with file classification table

---

## Phase 4: AI 3-Critic Party Review (parallel critics, ~3min)

Launch 3 critic agents simultaneously. Each reads changed files FROM DISK.

### Critic-Security Prompt
```
You are CRITIC-SECURITY reviewing CORTHEX v2 code changes.
Personas: Quinn (QA, coverage-first) + Dana (Security, paranoid)

BEFORE REVIEWING — Read:
- packages/server/src/engine/types.ts (E8 boundary)
- packages/shared/types.ts (shared contracts)

FOR EACH changed file (HIGH risk first):
1. Read file FROM DISK (full file, not just diff)
2. Check OWASP Top 10: injection, XSS, broken auth, sensitive data exposure
3. Check credential handling: no plaintext tokens, proper encryption
4. Check input validation: user inputs sanitized at boundary
5. Check authorization: proper companyId isolation, role checks

OUTPUT FORMAT (Conventional Comments):
- issue: [SECURITY] SQL injection risk in {file}:{line} — {explanation}
- suggestion: [SECURITY] Consider parameterized query instead
- praise: [SECURITY] Good use of credential-scrubber hook

Write to: review-report/critic-security.md
Minimum 2 findings per HIGH risk file. Zero findings = re-analyze.
Score: X/10 (10=perfect, 0=critical vulnerabilities)
```

### Critic-Architecture Prompt
```
You are CRITIC-ARCHITECTURE reviewing CORTHEX v2 code changes.
Personas: Winston (Architect, pragmatist) + Amelia (Dev, speaks in file paths)

BEFORE REVIEWING — Read:
- _bmad-output/planning-artifacts/architecture.md (D1-D29 decisions)
- packages/server/src/engine/agent-loop.ts (E8 boundary)

FOR EACH changed file:
1. Read file FROM DISK
2. Check E8 boundary: engine/ only exports agent-loop.ts + types.ts
3. Check D-number consistency: changes align with architecture decisions
4. Check DRY: no duplicated logic (especially across server/app/shared)
5. Check patterns: proper hook usage, middleware ordering, error handling
6. Check imports: match git ls-files casing, no circular deps

OUTPUT FORMAT (Conventional Comments):
- issue: [ARCH] E8 boundary violation — {file} imports from engine internals
- suggestion: [ARCH] Extract to shared utility to avoid duplication
- thought: [ARCH] Consider D15 caching decision for this query

Write to: review-report/critic-architecture.md
Score: X/10
```

### Critic-UX-Perf Prompt
```
You are CRITIC-UX-PERF reviewing CORTHEX v2 code changes.
Personas: Sally (UX advocate) + Bob (Performance realist)

BEFORE REVIEWING — Read Phase 2 results:
- review-report/phase-2-visual.md (VRT diffs, a11y results, Lighthouse)

FOR EACH changed UI file:
1. Read file FROM DISK
2. Check responsive: mobile (390px) + desktop (1280px) breakpoints
3. Check accessibility: ARIA labels, keyboard nav, focus management
4. Check performance: lazy loading, memo where needed, no layout thrash
5. Check design system: Sovereign Sage tokens (slate-950, cyan-400, Inter)
6. Check Playwright VRT diffs: are visual changes intentional?

OUTPUT FORMAT (Conventional Comments):
- issue: [UX] Missing aria-label on interactive element {file}:{line}
- suggestion: [PERF] This 200KB component should be lazy-loaded
- nitpick: [UX] Icon size inconsistent with design system (20px → 24px)

Write to: review-report/critic-ux-perf.md
Score: X/10
```

### Cross-Talk Round
After all 3 critics finish:
- Each critic reads the other 2 reports FROM FILE
- Each sends 1 summary message to the other 2 (cross-pollinate findings)
- Update own report with any new insights

---

## Phase 5: Resolution & Verdict

### Score Calculation
```
Final Score = (Security × 3 + Architecture × 2 + UX-Perf × 1) / 6
```
Security weighted 3x because vulnerabilities are hardest to catch later.

### Verdict
| Score | Verdict | Action |
|-------|---------|--------|
| 8.0+ | APPROVE | Auto-merge eligible (if Ship/Show risk) |
| 6.0-7.9 | CHANGES REQUESTED | Fix issues, re-run Phase 4 (max 2 retries) |
| < 6.0 | BLOCK | Escalate to human review, do NOT merge |

### Output
Generate final report: `review-report/verdict.md`

```markdown
# Code Review Verdict: {APPROVE|CHANGES_REQUESTED|BLOCK}

## Score: {X.X}/10
- Security: {X}/10 (weight 3x)
- Architecture: {X}/10 (weight 2x)
- UX & Performance: {X}/10 (weight 1x)

## Risk Classification: {Ship|Show|Ask} (score: {N})

## Phase 1 (Static): {PASS|FAIL}
- tsc: {0} errors
- ESLint: {0} errors
- Tests: {N}/{N} pass
- Bundle: {+/-N}KB

## Phase 2 (Visual): {PASS|FAIL|SKIPPED}
- E2E: {N}/{N} pass
- VRT: {N} diffs ({N} expected, {N} unexpected)
- axe-core: {N} critical, {N} serious
- Lighthouse: perf {N}, a11y {N}, bp {N}

## Critical Issues ({N}):
{list of issue: comments from all critics}

## Suggestions ({N}):
{list of suggestion: comments}

## Praise ({N}):
{list of praise: comments}
```

---

## Phase 6: Auto-Fix (fixer agents, ~5min)

**Trigger**: Phase 5 verdict = CHANGES_REQUESTED (score 6.0-7.9). Skip if APPROVE or BLOCK.

### Step 6.1: Parse & Prioritize Issues

Orchestrator reads `review-report/verdict.md` and extracts all `issue:` findings.

**Priority order** (fix in this sequence to avoid cascading breaks):
```
1. SHARED types/contracts  — shared/types.ts 등 (다른 파일의 import 기반)
2. SERVER security/auth     — 보안 이슈는 먼저 (OWASP)
3. SERVER architecture      — API 포맷, 패턴 일관성
4. CLIENT state/hooks       — 쿼리 훅, 상태 관리
5. CLIENT components        — UI 컴포넌트, 접근성
6. CLIENT pages             — 페이지 레벨 수정
```

**Batching strategy**:
```
같은 파일의 이슈 → 한 batch로 묶기
서로 의존하는 파일 → sequential (shared → server → app 순서)
독립적인 파일 → parallel (worktree 격리)
```

### Step 6.2: Generate Fix Spec

For each issue, Orchestrator creates a structured fix instruction:

```markdown
## Fix #{N}: {issue title}
- **Source**: {critic-security|critic-architecture|critic-ux-perf}
- **Priority**: P{0-7}
- **File**: {file_path}:{line_number}
- **Issue**: {exact issue: comment from critic}
- **Fix**: {specific instruction — WHAT to change, not just "fix it"}
- **Verify**: {command to verify — e.g., tsc --noEmit, specific test}
- **Risk**: {LOW|MEDIUM|HIGH — chance this fix breaks something else}
```

Write to: `review-report/phase-6-fix-spec.md`

### Step 6.3: Execute Fixes

**Strategy selection based on fix count and risk**:

| Fixes | Risk | Strategy |
|-------|------|----------|
| 1-3 | Any | Sequential in main — simplest, no merge needed |
| 4-8 | LOW-MED | Batch by file — group same-file fixes, sequential across files |
| 9+ | Any | Parallel worktrees — independent files in parallel, dependent files sequential |
| Any | HIGH | One-at-a-time with tsc gate after each — safest for risky changes |

**Fixer Agent Prompt Template**:
```
You are FIXER-AGENT. Your ONLY job is to fix specific code issues.

RULES:
1. Read the FULL file before editing (not just the line)
2. Fix ONLY the specific issue — do NOT refactor surrounding code
3. Do NOT add comments explaining the fix
4. Do NOT change formatting/style of untouched lines
5. After each edit, run the verify command
6. If verify fails, try a different approach (max 2 attempts)
7. If 2 attempts fail, write "ESCALATE: {reason}" to fix-results and move on

FIX SPEC:
{fix spec from Step 6.2}

CONTEXT FILES (read these first for understanding):
{list of related files the fixer should read for context}

After fixing, append result to: review-report/phase-6-fix-results.md
Format:
- [FIXED] Fix #{N}: {description} — verified by {command}
- [FAILED] Fix #{N}: {description} — reason: {why}
- [ESCALATE] Fix #{N}: {description} — needs human: {reason}
```

**Execution flow**:
```
For each batch (sequential across batches, parallel within batch):
  ├── Launch fixer agent(s) with fix spec
  ├── Each fixer: Read file → Apply fix → Run verify command
  │   ├── Verify pass → [FIXED] → next fix
  │   ├── Verify fail → Attempt 2 → [FIXED] or [FAILED]
  │   └── Can't understand → [ESCALATE]
  ├── After batch complete: run tsc --noEmit (full project)
  │   ├── tsc pass → proceed to next batch
  │   └── tsc fail → fixer agent fixes tsc errors (max 2 attempts)
  └── If tsc still fails after 2 attempts → rollback batch (git checkout)
```

### Step 6.4: Post-Fix Validation

After ALL fixes applied:
```
Orchestrator runs simultaneously:
├── tsc --noEmit -p packages/server/tsconfig.json
├── tsc --noEmit -p packages/app/tsconfig.json
├── bun test {affected-test-files}
└── git diff --stat (confirm only intended files changed)
```

**Gate criteria**:
- tsc: 0 errors (both packages)
- Tests: no NEW failures (pre-existing failures OK)
- No unintended file changes

**If gate fails**: rollback all fixes (`git stash`), mark as ESCALATE, skip to Phase 8.

**Output**: `review-report/phase-6-fix-results.md`

```markdown
# Phase 6: Auto-Fix Results

## Summary
- Total issues: {N}
- Fixed: {N} ✅
- Failed: {N} ❌
- Escalated: {N} ⚠️

## Fix Log
- [FIXED] Fix #1: P0 — workflows.tsx 쿼리 중복 제거 — verified by tsc
- [FIXED] Fix #2: P1 — workflows.tsx 모달 focus trap — verified by manual
- [FAILED] Fix #5: P4 — cancel 에러 알림 — reason: toast import path not found
- [ESCALATE] Fix #7: P6 — WorkflowStep 타입 통합 — needs human: shared/types.ts has 15+ consumers

## Post-Fix Validation
- tsc (app): 0 errors
- tsc (server): 0 errors
- Tests: 18,632 pass (no new failures)
- Files changed: {list}
```

---

## Phase 7: Re-Review (delta-only, ~2min)

**Trigger**: Phase 6 fixed at least 1 issue. Skip if all ESCALATED/FAILED.

### Scope: Impact-Based Delta

Only re-review files that were:
1. **Directly modified** in Phase 6
2. **Import** the modified files (1-level deep)
3. **Imported by** the modified files (reverse deps, 1-level deep)

```
Orchestrator:
  git diff --name-only HEAD~1..HEAD → modified files
  For each modified file: find importers via grep
  Union = re-review scope
```

### Re-Review Strategy

**NOT a full 3-critic re-run.** Instead, a single focused re-reviewer agent:

```
You are RE-REVIEWER. You are verifying that fixes from Phase 6 are correct
and did not introduce new problems.

FOR EACH fixed file:
1. Read the FULL file from disk
2. Read the original critic finding (from critic-*.md)
3. Verify the fix actually addresses the issue (not just suppresses it)
4. Check for NEW issues introduced by the fix:
   - Type safety: any `as any`, `@ts-ignore` added?
   - Logic: did the fix change behavior beyond the issue?
   - Imports: any new circular dependencies?
   - Style: does the fix match surrounding code patterns?

FOR EACH imported/importing file (impact zone):
1. Quick scan for breakage (type errors, missing props, changed APIs)

OUTPUT FORMAT:
- [VERIFIED] Fix #{N}: correctly addresses {issue}, no side effects
- [REGRESSION] Fix #{N}: introduced new issue — {description}
- [INCOMPLETE] Fix #{N}: partially addresses {issue}, still needs {what}

Score: X/10 (10 = all fixes clean, 0 = fixes made things worse)

Write to: review-report/phase-7-re-review.md
```

### Regression Handling

If re-review finds regressions:
```
REGRESSION found → Orchestrator decides:
  ├── Minor (typo, missing import): auto-fix inline (1 attempt)
  ├── Medium (logic error): revert that specific fix + ESCALATE
  └── Major (multiple files broken): revert ALL Phase 6 + BLOCK
```

**Max re-review loops: 1.** If Phase 7 finds issues, fix them once. Do NOT re-review the re-review fixes. That way lies infinite loops.

**Output**: `review-report/phase-7-re-review.md`

---

## Phase 8: Final Verdict & Commit

### Score Recalculation

```
Original scores from Phase 4: Security={S}, Architecture={A}, UX-Perf={U}

Fix bonus per issue:
  [FIXED]     → +0.3 to relevant critic score (capped at 10)
  [VERIFIED]  → no additional change (already counted in FIXED)
  [REGRESSION]→ -0.5 from relevant critic score
  [FAILED]    → no change (original deduction stays)
  [ESCALATE]  → no change (original deduction stays)
  [INCOMPLETE]→ +0.1 to relevant critic score

Recalculated: Security={S'}, Architecture={A'}, UX-Perf={U'}
Final Score = (S' × 3 + A' × 2 + U' × 1) / 6
```

### Final Verdict

| Score | Verdict | Action |
|-------|---------|--------|
| 8.0+ | **APPROVE** | Auto-commit + push |
| 6.0-7.9 + all P0 fixed | **CONDITIONAL APPROVE** | Commit with TODO comments for remaining |
| 6.0-7.9 + P0 unfixed | **BLOCK** | P0 unfixed = cannot ship |
| < 6.0 | **BLOCK** | Escalate to human review |

### Commit Strategy

**On APPROVE or CONDITIONAL APPROVE**:
```
git add {all fixed files}
git commit -m "fix(review): resolve {N} issues from code review

Phase 6 auto-fix: {N} fixed, {N} failed, {N} escalated
Phase 7 re-review: {N} verified, {N} regressions
Final score: {X.X}/10 ({original} → {final})

Issues fixed:
- {P0}: {description}
- {P1}: {description}
...

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"

git push origin {branch}
```

**On BLOCK**:
- Do NOT commit
- Write `review-report/escalation.md` with:
  - What was tried
  - What failed and why
  - Recommended manual fix approach
  - Estimated effort (S/M/L)

### Output: Final Report

Generate: `review-report/final-verdict.md`

```markdown
# Final Code Review Report

## Pipeline: v2.0
## Date: {date}
## Commit Range: {base}..{head}

## Final Verdict: {APPROVE|CONDITIONAL_APPROVE|BLOCK}
## Final Score: {X.X}/10 (was {Y.Y} before auto-fix)

### Score Progression
| Critic | Phase 4 | Phase 6 Bonus | Phase 7 Adj | Final |
|--------|---------|---------------|-------------|-------|
| Security (×3) | {X} | +{N} | {adj} | {X'} |
| Architecture (×2) | {X} | +{N} | {adj} | {X'} |
| UX-Perf (×1) | {X} | +{N} | {adj} | {X'} |

### Phase Summary
| Phase | Status | Duration |
|-------|--------|----------|
| 1. Static Gate | {PASS/FAIL} | {Ns} |
| 2. Visual Gate | {PASS/FAIL/SKIP} | {Ns} |
| 3. Risk Classification | {Ship/Show/Ask} (score:{N}) | {Ns} |
| 4. 3-Critic Party | {scores} | {Ns} |
| 5. Initial Verdict | {verdict} ({score}) | — |
| 6. Auto-Fix | {N} fixed / {N} total | {Ns} |
| 7. Re-Review | {N} verified / {N} regressions | {Ns} |
| 8. Final Verdict | **{verdict}** (**{score}**) | — |

### Issues Resolved
{table of all issues with status: FIXED/FAILED/ESCALATED}

### Remaining Issues (if CONDITIONAL_APPROVE)
{list of unfixed non-P0 issues as TODO}

### Escalation Items (if any)
{items needing human attention with recommended approach}
```

---

## Orchestrator Flow (Updated v2.0)

```
Step 0: Setup
  mkdir -p review-report/screenshots
  Identify changed files: git diff --name-only {base}
  If no changes: "Nothing to review" → EXIT

Step 1: Phase 1 — Static Gate (parallel)
  Run tsc + eslint + tests + bundle check simultaneously
  Any FAIL → report + EXIT (don't waste time on deeper review)

Step 2: Phase 2 — Visual Gate (parallel, if UI changed)
  Run Playwright E2E + VRT + axe-core + Lighthouse
  Critical E2E fail → report + EXIT

Step 3: Phase 3 — Risk Classification
  Classify all changed files → compute risk score
  If score < 10 AND Phase 1+2 pass → AUTO-APPROVE (Ship)

Step 4: Phase 4 — AI 3-Critic Party (parallel)
  Launch 3 background agents (Security, Architecture, UX-Perf)
  Wait for all 3 → cross-talk round → collect scores

Step 5: Phase 5 — Initial Verdict
  Calculate weighted score → determine verdict
  Generate review-report/verdict.md
  If APPROVE (≥8.0): → Step 9 (skip fix)
  If BLOCK (<6.0): → Step 9 (escalate, no auto-fix)
  If CHANGES_REQUESTED (6.0-7.9): → Step 6

Step 6: Phase 6 — Auto-Fix
  Parse verdict.md → extract issues → prioritize (P0 first)
  Batch by file → select strategy (sequential/parallel/worktree)
  Launch fixer agent(s) → each fix: read → edit → verify
  Post-fix validation: tsc + tests
  Generate review-report/phase-6-fix-results.md
  If 0 fixes succeeded: → Step 9 (BLOCK)

Step 7: Phase 7 — Re-Review (delta-only)
  Identify impact zone (modified + importers + imported-by)
  Launch re-reviewer agent on delta scope only
  Check: fixes correct? new issues? regressions?
  If regressions: minor=inline fix, medium=revert+escalate, major=revert all+BLOCK
  Generate review-report/phase-7-re-review.md

Step 8: Phase 8 — Final Verdict
  Recalculate scores with fix bonuses
  Determine final verdict (APPROVE / CONDITIONAL_APPROVE / BLOCK)
  If APPROVE/CONDITIONAL: auto-commit + push
  If BLOCK: write escalation.md
  Generate review-report/final-verdict.md

Step 9: Cleanup
  If PR URL given: post final verdict as PR comment (gh pr comment)
  Remove stale worktrees if any
  Report to user: score progression, what was fixed, what remains
```

---

## Playwright Configuration

### E2E Test Structure
```
tests/
├── e2e/
│   ├── critical-flows/
│   │   ├── login.spec.ts
│   │   ├── hub-chat.spec.ts
│   │   ├── agents-crud.spec.ts
│   │   └── nexus-canvas.spec.ts
│   ├── visual-regression/
│   │   ├── pages.spec.ts          # Screenshot each page
│   │   └── components.spec.ts     # Screenshot key components
│   └── accessibility/
│       └── a11y-audit.spec.ts     # axe-core per page
```

### Viewport Config
```typescript
const viewports = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },  // iPhone 14 Pro
}
```

### VRT Threshold
```typescript
expect(page).toHaveScreenshot({
  maxDiffPixelRatio: 0.001,  // 0.1% pixel difference allowed
  animations: 'disabled',
  mask: [page.locator('.dynamic-timestamp')],  // Mask dynamic content
})
```

---

## Defense & Timeouts

| Mechanism | Value | Action |
|-----------|-------|--------|
| Phase 1 timeout | 2min | FAIL phase, report what passed |
| Phase 2 timeout | 5min | Skip remaining, report partial |
| Phase 4 critic timeout | 5min each | Accept partial review |
| Cross-talk timeout | 2min | Skip cross-talk, use individual scores |
| Phase 6 fixer timeout | 3min per fix | Mark as FAILED, move to next |
| Phase 6 total timeout | 10min | Stop fixing, proceed with partial results |
| Phase 6 tsc gate | 2 attempts | Rollback batch on 2nd failure |
| Phase 7 re-review timeout | 3min | Accept partial re-review |
| Phase 7 regression loop | 1 max | NO re-reviewing the re-review. Ever. |
| Max fix rounds | 1 | Phase 6→7 runs once. No Phase 6→7→6→7 loop |
| Total pipeline timeout | 25min | Force final verdict with available data |

---

## Conventional Comments Reference

| Label | Meaning | Blocking? |
|-------|---------|-----------|
| `issue:` | Must fix before merge | YES |
| `suggestion:` | Would improve code, author decides | NO |
| `nitpick:` | Trivial preference, ignore freely | NO |
| `question:` | Need clarification | MAYBE |
| `thought:` | Sharing an idea | NO |
| `praise:` | Excellent work | NO |

---

## Core Rules

### Review Rules (Phase 1-5)
1. **Risk-first**: Classify files before reviewing. HIGH risk gets 3x attention.
2. **Conventional Comments**: ALL feedback uses label: format. No unlabeled comments.
3. **Evidence-based**: Every issue: cites file:line and explains WHY it's a problem.
4. **Security × 3**: Security score weighted 3x in final calculation.
5. **No style nitpicks**: ESLint handles formatting. Critics focus on logic/security/architecture.
6. **Phase gates are mandatory**: Do NOT skip Phase 1. Phase 2 skippable only if no UI changes.
7. **Critics read FROM FILE**: Never from message memory. Always Read tool.
8. **Zero findings = re-analyze**: If a critic finds nothing, they must look harder.
9. **Cross-talk is mandatory**: Critics must read each other's reports before final score.
10. **Ship / Show / Ask**: Low-risk changes with passing gates can auto-approve.

### Fix Rules (Phase 6-8)
11. **Reviewer ≠ Fixer**: The critic agents NEVER fix code. Separate fixer agents do the fixing. Same entity reviewing and fixing = blind spots.
12. **Fix only what's reported**: Fixer agents fix ONLY the issues from verdict.md. No "while I'm here" refactoring. No bonus improvements.
13. **tsc after every batch**: Each batch of fixes must pass tsc before proceeding to the next batch. Cascading type errors = immediate stop.
14. **Max 2 attempts per fix**: If a fix fails twice, mark ESCALATE and move on. Do not brute-force.
15. **No infinite loops**: Phase 6→7 runs exactly ONCE. No 6→7→6→7 cycles. One fix round, one re-review, done.
16. **Rollback on failure**: If post-fix validation fails after 2 tsc attempts, `git stash` ALL fixes and BLOCK. Broken fixes are worse than no fixes.
17. **Delta-only re-review**: Phase 7 reviews ONLY modified files + 1-level import graph. Not the whole codebase again.
18. **P0 must fix**: If P0 issues remain unfixed after Phase 6, verdict = BLOCK regardless of score. P0 = ship-blocker.
19. **Commit message traces pipeline**: Fix commits must reference the review (Phase 4 scores, which issues fixed).
20. **Human escalation is OK**: ESCALATE is a valid outcome. Not every issue can be auto-fixed. Flag it clearly and move on.

ARGUMENTS: $ARGUMENTS
