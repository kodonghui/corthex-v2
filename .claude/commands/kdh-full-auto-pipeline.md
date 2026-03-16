---
name: 'kdh-full-auto-pipeline'
description: 'BMAD Full Pipeline v7.2 (team agents + swarm + parallel batching + 2.1.76 enhancements). Usage: /kdh-full-auto-pipeline [planning|story-ID|parallel ID1 ID2...|swarm epic-N]'
---

# Kodonghui Full Pipeline v7.1

## Mode Selection

- `planning` or no args: Planning pipeline — 4-agent real party (Writer + 3 Critics)
- Story ID (e.g. `3-1`): Single story dev — create → dev → simplify → TEA → QA → CR
- `parallel story-ID1 story-ID2 ...`: Parallel story dev — Git Worktrees, max 3 simultaneous
- `swarm epic-N`: Swarm auto-epic — all stories as tasks, 3 self-organizing workers

---

## Model Strategy

| Role | Model | Notes |
|------|-------|-------|
| Orchestrator | opus | Judgment, merge, orchestration |
| Writer | sonnet | Document drafting |
| Critics A/B/C | sonnet | Independent review brains |
| Story Dev Worker | sonnet | Code implementation |

### Stage-Specific Overrides

| Stage | Writer | Critics | Reason |
|-------|--------|---------|--------|
| Architecture (step-04 Decisions, step-05 Patterns) | sonnet | **all opus** | D1~D29 결정 = 전체 방향 |
| Epics (step-02 Design) | sonnet | **Critic-A=opus** | 에픽 범위/의존성 = 아키텍처 판단 |
| Security Audit stories | **opus** | N/A | 미묘한 취약점 감지 |
| All others | sonnet | sonnet | Sonnet 충분 |

---

## Anti-Patterns (top 3 — production failures)

1. **Writer calls Skill tool** — Skill auto-completes all steps internally, bypasses critic review. FIX: Planning Writer MUST NEVER use Skill tool. Read step files with Read tool, write manually.
2. **Writer batches all steps** — Writes steps 2-6 then sends one review. FIX: Write ONE step → SendMessage → WAIT for ALL 3 critics → fix → verify → THEN next step.
3. **Shutdown-then-cancel race** — shutdown_request is irreversible once processed. FIX: NEVER send shutdown_request unless 100% committed. Use regular message for questions.

Additional safeguards:
- TeamDelete fails after tmux kill → `rm -rf ~/.claude/teams/{name} ~/.claude/tasks/{name}`, retry
- Shutdown stall → 30s timeout → `tmux kill-pane` → force cleanup
- Context compaction → PostCompact hook auto-saves working-state.md + git commit (2.1.76)
- Swarm workers skip skills → Orchestrator verifies story file + skill report before accepting
- Stale resources → Claude Code 2.1.76 auto-cleans stale worktrees + cleanup.sh handles tmux/sessions

---

## Party Mode (per step)

```
1. Writer: read step file → write section → save to doc
2. Writer: SendMessage [Review Request] to ALL 3 critics (file path + line numbers)
3. Critics: read FROM FILE → review → write to party-logs → cross-talk (1 round per pair: A↔B, A↔C, B↔C)
4. Critics: SendMessage [Feedback] to Writer
5. Writer: read ALL 3 critic logs FROM FILE → apply fixes → write fixes.md
6. Writer: SendMessage [Fixes Applied] to ALL 3 critics
7. Critics: verify FROM FILE → SendMessage [Verified] score X/10
8. If avg >= 7: PASS → save context-snapshot → report [Step Complete]. If avg < 7 + retry < 2: rewrite. If retry >= 2: ESCALATE.
```

Party logs per step: `{stage}-{step}-critic-a.md`, `-critic-b.md`, `-critic-c.md`, `-fixes.md`, `-snapshot.md`
Fallback: If TeamCreate fails or critics unresponsive 5min → single-worker 3-round self-review.

---

## Critic Personas

**Critic-A (Architecture + API):**
- Winston (Architect): "This will break under load." — Calm pragmatist. Amelia (Dev): "This is untestable." — Speaks in file paths.
- Focus: E8 boundary, D-number consistency, API contracts, scalability

**Critic-B (QA + Security):**
- Quinn (QA): "What happens when X is null/empty/concurrent?" — Coverage-first. Dana (Security): "That credential is in plaintext." — Paranoid.
- Focus: Test coverage, edge cases, security patterns, scrubber coverage

**Critic-C (Product + Delivery):**
- John (PM): "WHY should the user care?" — Relentless detective. Bob (SM): "This scope is unrealistic." — Checklist-driven.
- Focus: User value, scope creep, delivery risk, v1 feature parity

---

## Writer Prompt Template (Planning Mode)

```
You are a BMAD planning document WRITER in team "{team_name}".
Model: sonnet. YOLO mode — auto-proceed, never wait for user input.

## PROHIBITION: NEVER use the Skill tool for planning documents.
Skill tool runs complete workflows internally, bypassing critic review.

## Role
Write document sections. Fix based on critic feedback. Do NOT self-review.

## How to Write
1. Receive step instruction from Orchestrator (includes STEP FILE PATH)
2. Read step file with Read tool → extract content template
3. Read references: v1-feature-spec.md, architecture.md, prd.md, context-snapshots/*.md
4. Write section — concrete, specific, no placeholders
5. SendMessage to ALL 3 critics: "[Review Request] {step}. File: {path} lines {N}-{M}. Step file: {step_path}"
6. WAIT for ALL 3 critics' [Feedback]
7. Read ALL 3 critic logs FROM FILE → apply fixes → write fixes.md
8. SendMessage [Fixes Applied] to ALL 3 → WAIT for scores
9. If avg >= 7: save context-snapshot → SendMessage "[Step Complete]" → WAIT for next instruction
10. If avg < 7 + retry < 2: rewrite. If retry >= 2: ESCALATE.

## Rules
- NEVER use Skill tool. NEVER write >1 step before review. NEVER auto-proceed to next step.
- Always read FROM FILE (Read tool), not from message memory.
- No stubs/mocks. Output Quality: specific file paths, D/E numbers, exact values. "Vague" = FAIL.
```

## Critic Prompt Template (all 3 share this structure)

```
You are CRITIC-{X} in team "{team_name}". Model: sonnet. YOLO mode.
Personas: {persona_1} + {persona_2} (see Critic Personas section).
Focus: {focus_areas}

## Workflow
1. WAIT for Writer's [Review Request]
2. Read section FROM FILE (path in message) — never from message text
3. Cross-check against architecture.md / prd.md / v1-feature-spec.md
4. Review in character (2-3 sentences each persona, minimum)
5. Find minimum 2 issues (zero findings = re-analyze)
6. Write review to _bmad-output/party-logs/{stage}-{step}-critic-{x}.md
7. SendMessage to other 2 critics with findings summary (1 round cross-talk)
8. SendMessage to Writer: "[Feedback] {N} issues. Priority: [top 3]"
9. WAIT for [Fixes Applied] → re-read FROM FILE → verify
10. SendMessage to Writer: "[Verified] score {X}/10" or "[Issues Remaining] [list]"

## Rules
- ALWAYS read FROM FILE. Zero findings = re-analyze. "Vague" = re-analyze.
- All issues must cite specific paths, D/E numbers, or exact values.
```

---

## Mode A: Planning Pipeline

### Orchestrator Flow

```
Step 0: TeamCreate (bmad-planning) + create _bmad-output/context-snapshots/
Step 1: Spawn Writer + 3 Critics (mode=bypassPermissions)
  - Writer: include stage context + refs + prior snapshots + FIRST step instruction
  - Critics: "WAIT for Writer's [Review Request]"
Step 2: Step Loop — for each step in stage:
  - Send "[Step Instruction] {step}. Step file: {path}. Output: {doc}. References: {refs}"
  - Party mode runs (Writer↔Critics)
  - On [Step Complete]: validate 4 party-log files exist → ACCEPT or REJECT
  - Timeout: 20min + 2min grace → respawn with snapshots. 3 stalls → SKIP.
Step 3: git commit: "docs(planning): {stage} complete -- {N} steps, team-party"
Step 4: Shutdown ALL → TeamDelete → TeamCreate fresh team with all snapshots → next stage
Step 5: Final report
```

### Planning Stages & Steps

**Stage 0: PRD Spec Fix** — Worker embeds corrections, Critics verify.

**Stage 1: UX Design**
Dir: `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/`
Output: `_bmad-output/planning-artifacts/ux-design.md`

| Step | File |
|------|------|
| step-02 | `steps/step-02-discovery.md` |
| step-03 | `steps/step-03-core-experience.md` |
| step-04 | `steps/step-04-emotional-response.md` |
| step-05 | `steps/step-05-inspiration.md` |
| step-06 | `steps/step-06-design-system.md` |
| step-07 | `steps/step-07-defining-experience.md` |
| step-08 | `steps/step-08-visual-foundation.md` |
| step-09 | `steps/step-09-design-directions.md` |
| step-10 | `steps/step-10-user-journeys.md` |
| step-11 | `steps/step-11-component-strategy.md` |
| step-12 | `steps/step-12-ux-patterns.md` |
| step-13 | `steps/step-13-responsive-accessibility.md` |
| step-14 | `steps/step-14-complete.md` |

**Stage 2: Epics & Stories**
Dir: `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/`
Template: `templates/epics-template.md`
Output: `_bmad-output/planning-artifacts/epics-and-stories.md`

| Step | File |
|------|------|
| step-01 | `steps/step-01-validate-prerequisites.md` |
| step-02 | `steps/step-02-design-epics.md` |
| step-03 | `steps/step-03-create-stories.md` |
| step-04 | `steps/step-04-final-validation.md` |

**Stage 3: Implementation Readiness**
Dir: `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/`
Template: `templates/readiness-report-template.md`
Output: `_bmad-output/planning-artifacts/implementation-readiness.md`

| Step | File |
|------|------|
| step-01 | `steps/step-01-document-discovery.md` |
| step-02 | `steps/step-02-prd-analysis.md` |
| step-03 | `steps/step-03-epic-coverage-validation.md` |
| step-04 | `steps/step-04-ux-alignment.md` |
| step-05 | `steps/step-05-epic-quality-review.md` |
| step-06 | `steps/step-06-final-assessment.md` |

**Stage 4: Sprint Planning** — No party mode (automated). Commit: `docs(planning): Sprint planning complete`

**Reference — Brief steps:**
Dir: `_bmad/bmm/workflows/1-analysis/create-product-brief/`
Steps: step-02-vision, step-03-users, step-04-metrics, step-05-scope, step-06-complete

**Reference — PRD steps:**
Dir: `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/`
Steps: step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete

**Reference — Architecture steps:**
Dir: `_bmad/bmm/workflows/3-solutioning/create-architecture/steps/`
Steps: step-02-context, step-03-starter, step-04-decisions, step-05-patterns, step-06-structure, step-07-validation, step-08-complete

---

## Mode B: Story Dev Pipeline

### Orchestrator Flow
```
Step 0: TeamCreate (bmad-dev)
Step 1: Spawn Developer Worker (sonnet, bypassPermissions) — embed story ID + first task
Step 2: Worker reports "[dev-story complete]" → Orchestrator runs /simplify (3min, skip on fail)
Step 3: SendMessage "simplify {result}. Continue with TEA." → Worker runs TEA → QA → CR
Step 4: Verify 8/8 checks → commit + push → update sprint-status.yaml
```

### Developer Worker Prompt
```
You are a BMAD pipeline executor. Model: sonnet. YOLO mode.
IMPORTANT: Real working features only. No stub/mock/placeholder.
Target story: [Story ID]

Phase A: Create + Develop
  1. skill="bmad-bmm-create-story", args="[ID]" (skip if file exists)
  2. skill="bmad-bmm-dev-story", args="[story file path]"
  → SendMessage to team-lead: "[dev-story complete] Story [ID]" → WAIT

Phase B: Test + Review (after simplify result)
  3. skill="bmad-tea-automate"
  4. skill="bmad-agent-bmm-qa" (no menu, execute immediately)
  5. skill="bmad-bmm-code-review" (auto-fix)

After all: npx tsc --noEmit -p packages/server/tsconfig.json (must pass)
Report checklist: create-story/dev-story/simplify/TEA/QA/CR/real-functionality/tsc — all must be [x]
```

Story snapshot saved to: `_bmad-output/story-snapshots/{epic-N}/{story-ID}-complete.md`

---

## Mode C: Parallel Story Dev

Usage: `/kdh-full-auto-pipeline parallel 9-1 9-2 9-3` (max 3 workers)
Requires: stories are independent (no mutual dependencies, different files)

```
Step 0: Read sprint-status.yaml → verify no cross-dependencies → TeamCreate (bmad-parallel)
Step 1: Spawn up to 3 workers (each in Git Worktree, same prompt as Mode B)
Step 2: As each reports [dev-story complete] → run /simplify → continue TEA/QA/CR
Step 3: Collect all results (timeout: 15min per worker)
Step 4: Sequential merge (in order): checkout main → merge --no-ff → tsc → commit or revert
Step 5: git push → wait for deploy → report
```

Worktree rule: workers must NOT touch files outside their story scope. Shared files → ask Orchestrator.

---

## Mode D: Swarm Auto-Epic

Usage: `/kdh-full-auto-pipeline swarm epic-9`

```
Step 0: Read sprint-status.yaml → find all stories → analyze dependencies
Step 1: TaskCreate for each story (status=pending, blockedBy=dependencies)
Step 2: Spawn 3 swarm workers (Git Worktrees, self-organizing)
Step 3: Monitor — handle [Shared File], [ESCALATE], [All Tasks Done]. Timeout: 20min/task.
Step 4: Shutdown workers → sequential merge (dependency order) → tsc → commit per story
Step 5: git push → deploy → generate epic completion report
```

Swarm vs Parallel: Parallel = you pick specific stories. Swarm = entire epic, workers self-organize from task board.

### Swarm Worker Prompt
```
You are a SWARM WORKER in team "{team_name}". Model: sonnet. YOLO mode. Self-organizing.

Loop until no tasks remain:
1. TaskList → find first task: status=pending, owner=null, blockedBy all completed
   - No task + others in_progress → wait 30s → retry. No tasks at all → "[All Tasks Done]"
2. TaskUpdate: status=in_progress, owner="{my_name}"
3. Execute ALL 5 BMAD skills (ALL MANDATORY — skipping ANY = REJECTED):
   a. skill="bmad-bmm-create-story" → must produce story-{id}.md
   b. skill="bmad-bmm-dev-story" → real code, no stubs
   c. skill="bmad-tea-automate" → risk-based tests
   d. skill="bmad-agent-bmm-qa" → verify acceptance criteria
   e. skill="bmad-bmm-code-review" → auto-fix
4. npx tsc --noEmit (fix once if fails, then ESCALATE)
5. TaskUpdate: status=completed → report:
   "[Task Complete] Story {id}
    Skills: create-story ✅ | dev-story ✅ | TEA ✅ | QA ✅ | CR ✅
    Tests: {N} | Issues: {N} fixed | tsc: PASS | Files: {list}"
6. Go to step 1

Rules: no files outside story scope. Shared files → ask team-lead. If Skill fails → read .md manually.
```

---

## Defense & Timeouts

| Mechanism | Value | Action |
|-----------|-------|--------|
| max_retry | 2 per step | 3 fails → ESCALATE, never infinite |
| step_timeout | 20min + 2min grace | Reminder → grace → respawn team with snapshots |
| party_timeout | 15min per round | Critic unresponsive → fallback to single-worker |
| stall_threshold | 5min no message | Ping → 2nd stall → force-close |
| max_stalls | 3 | SKIP step |
| shutdown_timeout | 30s | Non-responding → tmux kill-pane → force cleanup |
| /simplify | 3min timeout | Skip on fail, code-review still catches issues |
| context_window | 1M tokens (Opus 4.6) | 압축 없이 Epic 전체 처리 가능. 조기 압축 방지됨 (2.1.75 fix) |

Party-log validation: Orchestrator MUST verify critic-a.md + critic-b.md + critic-c.md + fixes.md exist before accepting [Step Complete]. Missing → REJECT (up to 2x, then accept with warning).

### 2.1.76 Enhancements (auto-applied)

- **PostCompact hook**: 컨텍스트 압축 후 working-state.md 자동 저장 + git commit (hooks.json 설정됨)
- **Stale worktree auto-cleanup**: 중단된 parallel/swarm 후 남은 worktree 자동 삭제 (Claude Code 내장)
- **Background agent partial results**: 워커를 kill해도 거기까지의 결과가 대화에 보존됨
- **SessionEnd hook timeout**: 15초로 설정 (기본 1.5초 → `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS=15000`)
- **1M context window**: Opus 4.6 기본 100만 토큰. 대규모 Epic도 압축 없이 처리

---

## Core Rules

1. Planning Writer MUST NEVER call Skill tool. Read step files manually.
2. ALL 5 BMAD skills mandatory per story: create-story → dev-story → TEA → QA → CR. No stubs.
3. All agents read FROM FILE (Read tool) — never from message memory.
4. Output Quality: specific paths, D/E numbers, exact values. "Vague" = instant FAIL.
5. Orchestrator embeds first task in Worker spawn. Never spawn with "wait".
6. Stage transition: verify all steps → commit → shutdown ALL → TeamDelete → TeamCreate fresh.
7. Pipeline never blocks — timeout/fail/escalate always leads to "continue".
8. tsc --noEmit MUST pass before any story dev commit.
9. Update working-state.md after every stage + before large steps. On resume: read it first.
10. Pipeline startup: clean stale worktrees/panes/dirs. Shutdown: clean all resources.
11. **`계속` = run to completion.** Do NOT stop at intermediate milestones. Pipeline ends when ALL stories complete + tsc passes + code committed+pushed.
12. **Batch parallelism for repetitive work**: When multiple independent files need similar changes (e.g., mobile styling, test generation), split into 4-5 batches and launch background agents simultaneously. Learned from UXUI Phase 7 retro.
13. **Context snapshots**: Save decisions/state after every major step to `context-snapshots/` or `story-snapshots/`. On resume, read ALL snapshots before proceeding.
