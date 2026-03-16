---
name: 'kdh-code-review-full-auto'
description: 'Full-auto code review pipeline with Playwright VRT, 3 AI critics, risk classification, and Conventional Comments. Usage: /kdh-code-review-full-auto [PR-url|commit-range|changed-files]'
---

# KDH Code Review Full-Auto Pipeline v1.0

5-phase automated code review: Static Gate → Visual/E2E Gate → Risk Classification → AI 3-Critic Party → Resolution.
Integrates Playwright visual regression, axe-core accessibility, Lighthouse performance, and BMAD party mode.

## Mode Selection

- No args: Review uncommitted changes (`git diff HEAD`)
- PR URL: Review PR diff (`gh pr diff {number}`)
- Commit range: Review specific commits (`git diff {base}..{head}`)
- `full`: Full codebase audit (slow, use sparingly)

## Model Strategy

| Role | Model | Notes |
|------|-------|-------|
| Orchestrator | opus | Risk classification, final verdict |
| Critic-Security | **opus** | OWASP, injection, auth bypass — 보안은 타협 없음 |
| Critic-Architecture | **opus** | E8 boundary, patterns, DRY — 아키텍처 판단은 정확도 필수 |
| Critic-UX-Perf | **opus** | Playwright VRT, a11y, bundle size — 미묘한 UI 버그 감지 |

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

## Orchestrator Flow

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

Step 5: Phase 5 — Verdict
  Calculate weighted score → determine verdict
  Generate review-report/verdict.md
  If APPROVE: report success
  If CHANGES_REQUESTED: list fixes needed
  If BLOCK: escalate

Step 6: Cleanup
  If PR URL given: post verdict as PR comment (gh pr comment)
  git commit review-report/ (if worth keeping)
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
| Max retries | 2 | After 2 CHANGES_REQUESTED → BLOCK |
| Total pipeline timeout | 15min | Force verdict with available data |

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

ARGUMENTS: $ARGUMENTS
