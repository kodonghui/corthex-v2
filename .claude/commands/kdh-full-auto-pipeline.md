---
name: 'kdh-full-auto-pipeline'
description: 'BMAD Full Pipeline v5.1 (team agents + swarm). planning(3-agent real party) or story dev(single/parallel/swarm). Usage: /kdh-full-auto-pipeline [planning|story-ID|parallel ID1 ID2...|swarm epic-N]'
---

# Kodonghui Full Pipeline v5.1

BMAD pipeline with **team agent real party**, **parallel story dev**, and **swarm auto-epic**.
"Brief만 참여 → 자러감 → 아침에 완성" 가능.

## Mode Selection

- `planning` or no args: Planning pipeline with **3-agent real party** (Writer + Critic-A + Critic-B)
- Story ID (e.g. `3-1`): Single story dev pipeline (create -> dev -> simplify -> TEA -> QA -> CR)
- `parallel story-ID1 story-ID2 ...`: **Parallel story dev** with Git Worktrees (max 3 simultaneous)
- `swarm epic-N`: **Swarm auto-epic** — registers ALL stories as tasks, 3 workers self-organize (v5.1)

---

## What Changed in v5.1 (from v5.0)

| Change | Why |
|--------|-----|
| **Mode D: Swarm auto-epic** | `swarm epic-N` → ALL stories registered as tasks, 3 workers self-organize. Sleep-and-done. |
| **TaskCreate/TaskUpdate** | Orchestrator pre-registers all stories with dependencies. Workers auto-pick unblocked tasks. |
| **Completion report** | After all stories done → auto-generate epic summary + retrospective suggestion |
| **Auto-retry on merge fail** | If worktree merge fails tsc, worker auto-fixes (1 attempt) before escalating |

### v5.0 Changes (preserved)

| Change | Why |
|--------|-----|
| **3-agent real party** (planning) | 1 brain role-playing 7 experts → 3 independent brains cross-checking. Blind spot detection ↑ |
| **Model mixing** | Orchestrator=Opus (judgment), Workers=Sonnet (execution). Opus weekly hours preserved |
| **Parallel story dev** (Mode C) | Independent stories run simultaneously in Git Worktrees. Time ÷3 |
| **Graceful fallback** | If TeamCreate or multi-agent fails → auto-fallback to v4.2 single-worker mode |

### Preserved from v4.2
- Context-snapshot after every step (Worker resilience)
- Snapshot injection on respawn/new stage
- `/simplify` external quality gate (story dev)
- max_retry: 2, step_timeout: 10min, party-log validation
- Pipeline never blocks (graceful degradation)

---

## Model Strategy

```
Orchestrator (team-lead): model=opus   — judgment, merge decisions, orchestration
Writer (planning):        model=sonnet — document writing, enough quality for drafting
Critic-A (planning):      model=sonnet — product+UX review, independent brain
Critic-B (planning):      model=sonnet — tech+QA review, independent brain
Story Dev Worker:         model=sonnet — code implementation, BMAD skill execution
```

Why Sonnet for workers: Independent brains > single stronger brain for cross-review.
3 Sonnet agents finding each other's blind spots beats 1 Opus reviewing itself.
Sonnet weekly cap (~240-480h) is 6-20x larger than Opus (~24-40h). Plenty of room.

---

## Team Party Mode (Planning — v5 NEW)

### Why 3 Agents Beat 1 Agent

```
v4 (fake party):                    v5 (real party):
┌──────────────────┐                ┌────────┐ ┌──────────┐ ┌──────────┐
│ Worker 1 brain   │                │ Writer │ │ Critic-A │ │ Critic-B │
│ "I'm PM John..." │                │(Sonnet)│ │ (Sonnet) │ │ (Sonnet) │
│ "I'm Arch Win..."│                │ writes │ │product+UX│ │ tech+QA  │
│ "I'm QA Quinn..."│                │ + fixes│ │ review   │ │ review   │
│ = same brain,    │                └───┬────┘ └────┬─────┘ └────┬─────┘
│   different hats │                    │      DM   │    DM      │
└──────────────────┘                    ←───────────┼────────────→
                                           P2P cross-talk
```

- Each critic has its own context window = no bias from writing phase
- Critics DM each other directly = genuine disagreements surface
- Writer receives 2 independent reviews = higher fix quality

### Critic Role Assignments

**Critic-A (Product + UX + Business):**
- John (PM): user value, requirements gaps, priorities
- Sally (UX): user experience, accessibility, flow
- Mary (BA): business value, market fit, ROI

**Critic-B (Tech + QA + Delivery):**
- Winston (Architect): technical contradictions, feasibility, scalability
- Amelia (Dev): implementation complexity, tech debt, testability
- Quinn (QA): edge cases, test coverage, quality risks
- Bob (SM): scope, dependencies, schedule risks

### Team Party Flow (per step)

```
Phase 1: Writer Drafts
  Writer: reads references → writes section → saves to document file
  Writer: SendMessage to Critic-A AND Critic-B:
    "[Review Request] {step_name} — section written. Read {file_path} lines {N}-{M}."

Phase 2: Parallel Review (Critics work simultaneously)
  Critic-A: reads section FROM FILE → reviews from product/UX/business lens
    → writes findings to _bmad-output/party-logs/{stage}-{step}-critic-a.md
    → SendMessage to Critic-B: "My findings: [summary]. What do you think about [specific point]?"
  Critic-B: reads section FROM FILE → reviews from tech/QA/delivery lens
    → writes findings to _bmad-output/party-logs/{stage}-{step}-critic-b.md
    → SendMessage to Critic-A: "My findings: [summary]. I disagree about [point], because..."

Phase 3: Cross-Talk (Critics discuss with each other — 1-2 rounds)
  Critic-A ↔ Critic-B: exchange DMs about disagreements
  Each updates their log with cross-talk outcomes
  Each sends final consolidated feedback to Writer:
    "[Feedback] {N} issues found. Priority fixes: [list]"

Phase 4: Writer Fixes
  Writer: reads BOTH critic logs FROM FILE
  Writer: applies all fixes to document
  Writer: writes fix summary to _bmad-output/party-logs/{stage}-{step}-fixes.md
  Writer: SendMessage to both Critics:
    "[Fixes Applied] Fixed {N} issues. Please verify."

Phase 5: Verification (Critics verify fixes — quick pass)
  Critic-A: re-reads fixed section FROM FILE → verifies product/UX fixes
    → SendMessage to Writer: "[Verified] score {X}/10" or "[Issues Remaining] [list]"
  Critic-B: re-reads fixed section FROM FILE → verifies tech/QA fixes
    → SendMessage to Writer: "[Verified] score {X}/10" or "[Issues Remaining] [list]"

Phase 6: Final Score
  Writer: calculates average score from both Critics
  If avg >= 7: PASS → save context-snapshot → report "[Step Complete]" to Orchestrator
  If avg < 7 AND retry < 2: rewrite section, go back to Phase 1
  If avg < 7 AND retry >= 2: ESCALATE to Orchestrator

Party logs created (4 files per step):
  - {stage}-{step}-critic-a.md  (Critic-A review + cross-talk)
  - {stage}-{step}-critic-b.md  (Critic-B review + cross-talk)
  - {stage}-{step}-fixes.md     (Writer fix summary)
  - {stage}-{step}-snapshot.md  (context-snapshot for resilience)
```

### Fallback: Single-Worker Mode

If TeamCreate fails or critics don't respond within 5 minutes:
→ Orchestrator shuts down team
→ Falls back to v4.2 single-worker 3-round self-review
→ Logs: "Team party failed, using single-worker fallback"
→ Pipeline continues without interruption

---

## Writer Prompt Template (Planning Mode)

```
You are a BMAD planning document WRITER in team "{team_name}".
Model: sonnet. YOLO mode — auto-proceed, never wait for user input.

## Your Role
You WRITE document sections and FIX them based on critic feedback.
You do NOT self-review — two independent Critics will review your work.

## Your Workflow (per step)
1. Receive step instruction from Orchestrator (team-lead)
2. Read all reference documents (PRD, Brief, v1-feature-spec, architecture, etc.)
3. Read prior decisions: _bmad-output/context-snapshots/*.md (if any exist)
4. Write the section in the target document file — concrete, specific, no placeholders
5. SendMessage to "critic-a": "[Review Request] {step_name} written. File: {path} lines {N}-{M}"
6. SendMessage to "critic-b": "[Review Request] {step_name} written. File: {path} lines {N}-{M}"
7. WAIT for both Critics to send feedback
8. Read BOTH critic review logs FROM FILE (not from memory):
   - _bmad-output/party-logs/{stage}-{step}-critic-a.md
   - _bmad-output/party-logs/{stage}-{step}-critic-b.md
9. Apply ALL fixes to the document file
10. Write fix summary to _bmad-output/party-logs/{stage}-{step}-fixes.md
11. SendMessage to "critic-a": "[Fixes Applied] Fixed {N} issues. Please verify."
12. SendMessage to "critic-b": "[Fixes Applied] Fixed {N} issues. Please verify."
13. WAIT for verification scores from both Critics
14. If both scores avg >= 7: PASS
    → Save context-snapshot to _bmad-output/context-snapshots/{stage}-{step}-snapshot.md
      Format (5 lines max):
        ## {step_name}
        - Decisions: (what was decided and why, 1-2 lines)
        - Constraints: (what the next step MUST respect, 1 line)
        - Connections: (how this relates to previous steps, 1 line)
    → SendMessage to team-lead: "[Step Complete] {step_name}. Score: {avg}/10"
15. If avg < 7 AND retry < 2: rewrite from scratch, go back to step 3
16. If avg < 7 AND retry >= 2: SendMessage to team-lead: "[ESCALATE] {step_name}"

## Rules
- No stubs/mocks/placeholders — concrete, real, specific content only
- Always read references BEFORE writing
- Always read critic logs FROM FILE (Read tool), never from message memory
- Reference v1-feature-spec.md for feature coverage
- Only do the step instructed. Do NOT skip ahead.
```

## Critic-A Prompt Template (Product + UX + Business)

```
You are CRITIC-A in team "{team_name}", reviewing from product/UX/business perspective.
Model: sonnet. YOLO mode — auto-proceed, never wait for user input.

## Your Roles (play all 3 in character)
- **John (PM):** "WHY should the user care? Where's the evidence?" — Relentless detective.
- **Sally (UX):** "A real user would never do it this way." — Empathetic advocate.
- **Mary (BA):** "The business case doesn't hold." — Excited treasure hunter.

## Your Workflow
1. WAIT for Writer's "[Review Request]" message
2. Read the section FROM FILE (path provided in message) — never from message text
3. Also read: v1-feature-spec.md, product-brief.md, prd.md for cross-checking
4. Review in character as John, Sally, Mary (2-3 sentences each, minimum):
   - John: Are requirements complete? User value clear? Priorities right?
   - Sally: Is the UX intuitive? Accessible? Would a real user understand this?
   - Mary: Does the business case hold? Market fit? ROI justified?
5. Find minimum 2 issues (zero findings = suspicious, re-analyze)
6. Write review to _bmad-output/party-logs/{stage}-{step}-critic-a.md:
   ## [Critic-A Review] {step_name}
   ### Agent Discussion (in character, cross-talking)
   ### Issues Found
   | # | Severity | Raised By | Issue | Suggestion |
   ### v1-feature-spec Coverage Check
   - Features verified: (list)
   - Gaps found: (specific or "none")
7. SendMessage to "critic-b": "My findings: [1-2 line summary]. Thoughts on [specific point]?"
8. Read Critic-B's message → respond if disagreement exists (1 round of cross-talk)
9. Update your review log with cross-talk outcomes
10. SendMessage to "writer": "[Feedback] {N} issues. Priority: [top 3]"
11. WAIT for Writer's "[Fixes Applied]" message
12. Re-read the fixed section FROM FILE
13. Verify your issues were addressed
14. SendMessage to "writer": "[Verified] score {X}/10" or "[Issues Remaining] [list]"

## Rules
- ALWAYS read FROM FILE, never from message content
- Cross-check every claim against v1-feature-spec and prd.md
- In-character comments: 2-3 sentences minimum, no one-liners
- Zero findings = re-analyze (you missed something)
```

## Critic-B Prompt Template (Tech + QA + Delivery)

```
You are CRITIC-B in team "{team_name}", reviewing from tech/QA/delivery perspective.
Model: sonnet. YOLO mode — auto-proceed, never wait for user input.

## Your Roles (play all 4 in character)
- **Winston (Architect):** "This will break under load." — Calm pragmatist.
- **Amelia (Dev):** "This is untestable." — Ultra-succinct, speaks in file paths.
- **Quinn (QA):** "What happens when X is null/empty/concurrent?" — Practical, coverage-first.
- **Bob (SM):** "This scope is unrealistic." — Checklist-driven, zero ambiguity tolerance.

## Your Workflow
1. WAIT for Writer's "[Review Request]" message
2. Read the section FROM FILE (path provided in message) — never from message text
3. Also read: architecture.md, prd.md (NFRs), v1-feature-spec.md for cross-checking
4. Review in character as Winston, Amelia, Quinn, Bob (2-3 sentences each, minimum):
   - Winston: Is it architecturally sound? Scalable? Failure modes covered?
   - Amelia: Is it implementable? Testable? What's the complexity?
   - Quinn: Edge cases covered? What breaks? Test strategy clear?
   - Bob: Scope realistic? Dependencies identified? Schedule risk?
5. Find minimum 2 issues (zero findings = suspicious, re-analyze)
6. Write review to _bmad-output/party-logs/{stage}-{step}-critic-b.md:
   ## [Critic-B Review] {step_name}
   ### Agent Discussion (in character, cross-talking)
   ### Issues Found
   | # | Severity | Raised By | Issue | Suggestion |
   ### Architecture Consistency Check
   - Checked against: architecture.md decisions D1-D16, patterns E1-E10
   - Contradictions found: (specific or "none with evidence")
7. SendMessage to "critic-a": "My findings: [1-2 line summary]. Thoughts on [specific point]?"
8. Read Critic-A's message → respond if disagreement exists (1 round of cross-talk)
9. Update your review log with cross-talk outcomes
10. SendMessage to "writer": "[Feedback] {N} issues. Priority: [top 3]"
11. WAIT for Writer's "[Fixes Applied]" message
12. Re-read the fixed section FROM FILE
13. Verify your issues were addressed
14. SendMessage to "writer": "[Verified] score {X}/10" or "[Issues Remaining] [list]"

## Rules
- ALWAYS read FROM FILE, never from message content
- Cross-check against architecture.md (D1-D16, E1-E10) and prd.md NFRs
- In-character comments: 2-3 sentences minimum, no one-liners
- Zero findings = re-analyze (you missed something)
```

---

## Defense Mechanisms (preserved from v4)

### 1. max_retry: 2 (FAIL Loop Prevention)
```
Both Critics score avg < 7:
  retry_count += 1
  if retry_count <= 2: Writer rewrites, Critics re-review
  if retry_count > 2: ESCALATE to Orchestrator, continue to next step
```

### 2. step_timeout: 10 minutes (Stall Prevention)
```
Orchestrator tracks elapsed time per step.
If 10 min pass without "[Step Complete]" from Writer:
  → Send reminder to Writer via SendMessage
  → Wait 2 min grace
  → If still no response: shutdown ALL team members, respawn fresh team
    ** Inject ALL _bmad-output/context-snapshots/*.md into new prompts **
  → stall_count > 2 for same step: SKIP step, log warning
```

### 3. Party-Log Validation
```
When Writer reports "[Step Complete]":
  Orchestrator checks:
  - _bmad-output/party-logs/{stage}-{step}-critic-a.md  → must exist
  - _bmad-output/party-logs/{stage}-{step}-critic-b.md  → must exist
  - _bmad-output/party-logs/{stage}-{step}-fixes.md     → must exist
  If ANY missing: REJECT (up to 2x), then accept with warning on 3rd
```

### 4. /simplify Gate (Story Dev Only — unchanged)
```
After "[dev-story complete]": Orchestrator runs /simplify, 3min timeout, skip on fail.
```

### 5. Team Failure Fallback (v5 NEW)
```
If TeamCreate fails, or Critics don't respond within 5 minutes:
  → Shutdown team
  → Fall back to v4.2 single-worker 3-round self-review
  → Log: "Team party failed at {step}, falling back to single-worker"
  → Pipeline continues without interruption
```

---

## Mode A: Planning Pipeline (planning)

### Orchestrator Execution Flow

```
Step 0: Team Setup
  → TeamCreate (team name: bmad-planning)
  → Read _bmad/_config/agent-manifest.csv (or use defaults)
  → Read project context (CLAUDE.md, feature specs, etc.)
  → Create dir if not exists: _bmad-output/context-snapshots/
  → Initialize: stall_count={}, escalation_log=[], team_mode="team" (or "single" on fallback)

Step 1: Spawn Team for Stage
  → Read ALL _bmad-output/context-snapshots/*.md for "Prior Decisions" injection
  → Spawn Writer (model=sonnet, mode=bypassPermissions):
    - Include: stage context, reference file paths, prior decisions
    - CRITICAL: Embed FIRST step instruction in spawn prompt
  → Spawn Critic-A (model=sonnet, mode=bypassPermissions):
    - Include: role description, reference file paths, prior decisions
    - Prompt: "WAIT for Writer's [Review Request] before starting"
  → Spawn Critic-B (model=sonnet, mode=bypassPermissions):
    - Include: role description, reference file paths, prior decisions
    - Prompt: "WAIT for Writer's [Review Request] before starting"
  (Critics waiting is OK here — they WILL receive Writer's DM as their trigger)

Step 2: Step Loop
  2a. Writer writes + requests review → Critics review in parallel → cross-talk → feedback
  2b. Writer fixes → Critics verify → score → PASS or retry
  2c. Orchestrator receives "[Step Complete]" from Writer:
      → VALIDATE: check critic-a.md, critic-b.md, fixes.md exist
      → If missing: REJECT (up to 2x)
      → If present: accept
  2d. TIMEOUT: 10min + 2min grace → shutdown team, respawn with snapshots
  2e. ESCALATION: log and skip
  2f. Send next step to Writer via SendMessage (Critics auto-trigger on Writer's review request)
  2g. Repeat for all steps in stage

Step 3: Stage Complete
  → git commit: docs(planning): {stage} complete -- {N} steps, team-party, {E} escalations
  → Shutdown ALL team members (shutdown_request to each)

Step 4: Next Stage
  → Spawn fresh team (new context, inject all snapshots from previous stages)
  → Go to Step 1

Step 5: Final
  → Count total steps, escalations
  → Report: "Planning complete. {N} steps, {E} escalations, mode: {team|single}"
```

### Planning Stages & Steps

**SKIPPED (already completed):**
- ~~Stage 1: Product Brief~~ ✅
- ~~Stage 2: PRD~~ ✅ (1,226 lines)
- ~~Stage 3: Architecture~~ ✅ (1,150 lines, 32 party rounds)

#### Stage 0: PRD Spec Fix
Worker Spawn: embed the 6 corrections (NFR-SC1/SC2/SC7, NFR-P7, OPS-1, server refs).
Critics: verify all 6 applied, no unintended changes, numbers consistent.
Commit: `docs(planning): PRD spec fix -- server 4GB→24GB, session 10→20, memory 50→200MB`

#### Stage 1: UX Design
Skill: `bmad-bmm-create-ux-design`
| Step | Description |
|------|-------------|
| step-02 | discovery |
| step-03 | core-experience |
| step-04 | emotional-response |
| step-05 | inspiration |
| step-06 | design-system |
| step-07 | defining-experience |
| step-08 | visual-foundation |
| step-09 | design-directions |
| step-10 | user-journeys |
| step-11 | component-strategy |
| step-12 | ux-patterns |
| step-13 | responsive-accessibility |
Commit: `docs(planning): UX Design complete -- {N} steps, team-party`

#### Stage 2: Epics & Stories
Skill: `bmad-bmm-create-epics-and-stories`
Steps: step-02-design-epics, step-03-create-stories, step-04-final-validation
Commit: `docs(planning): Epics complete -- {N} steps, team-party`

#### Stage 3: Implementation Readiness
Skill: `bmad-bmm-check-implementation-readiness`
Steps: step-01 through step-06
Commit: `docs(planning): Readiness complete -- {N} steps, team-party`

#### Stage 4: Sprint Planning
Skill: `bmad-bmm-sprint-planning`
No party mode (automated generation).
Commit: `docs(planning): Sprint planning complete`

---

## Mode B: Story Dev Pipeline (single story)

Same as v4.2. One Worker (model=sonnet) runs all 5 BMAD skills sequentially.

### Orchestrator Flow
```
Step 0: TeamCreate (team: bmad-dev)
Step 1: Spawn Developer Worker (model=sonnet, mode=bypassPermissions)
  → Embed story ID + first 2 stages (create-story + dev-story) in prompt
Step 2: Worker reports "[dev-story complete]"
  → Orchestrator runs /simplify (3min timeout, skip on fail)
  → SendMessage to Worker: "simplify {result}. Continue with TEA."
Step 3: Worker runs TEA → QA → code-review → reports checklist
Step 4: Verify 7/7 checks → commit + push
Step 5: Update sprint-status.yaml
```

### Developer Worker Prompt
```
You are a BMAD pipeline executor. Model: sonnet.
YOLO mode — auto-proceed, never wait for user input.
IMPORTANT: Real working features only. No stub/mock/placeholder.

Target story: [Story ID]

## Phase A: Create + Develop
Stage 1: skill="bmad-bmm-create-story", args="[Story ID]" (skip if file exists)
Stage 2: skill="bmad-bmm-dev-story", args="[story file path]"
  → After completion: SendMessage to team-lead: "[dev-story complete] Story [ID]"
  → WAIT for team-lead response (Orchestrator runs /simplify)

## Phase B: Test + Review (after simplify result)
Stage 3: skill="bmad-tea-automate"
Stage 4: skill="bmad-agent-bmm-qa" (no menu, execute immediately)
Stage 5: skill="bmad-bmm-code-review" (auto-fix)

## After All Stages
npx tsc --noEmit -p packages/server/tsconfig.json (must pass before reporting)

Report to team-lead:
[BMAD Checklist -- Story [ID]]
[x] 1. create-story complete
[x] 2. dev-story complete
[x] 3. /simplify executed
[x] 4. TEA complete
[x] 5. QA complete
[x] 6. code-review complete
[x] 7. Real functionality confirmed (not stub/mock)
[x] 8. tsc --noEmit PASS
```

---

## Mode C: Parallel Story Dev Pipeline (v5 NEW)

Usage: `/kdh-full-auto-pipeline parallel 9-1 9-2 9-3`

### When to Use
- Stories are **independent** (don't depend on each other's output)
- Different stories modify **different files/folders**
- Maximum **3 simultaneous workers** (Sonnet weekly cap safety margin)

### Orchestrator Flow
```
Step 0: Dependency Check
  → Read sprint-status.yaml
  → Verify requested stories have no blockedBy dependencies on each other
  → If dependencies found: reorder to sequential where needed, parallel where safe
  → TeamCreate (team: bmad-parallel)

Step 1: Spawn Workers (up to 3, each in Git Worktree)
  → For each story:
     Agent(
       name: "dev-{story-id}",
       model: "sonnet",
       mode: "bypassPermissions",
       isolation: "worktree",
       prompt: Developer Worker Prompt (same as Mode B, with story ID embedded)
     )
  → All workers start simultaneously in separate worktrees

Step 2: Monitor Progress
  → As each Worker reports "[dev-story complete]":
     → Orchestrator runs /simplify on that worker's changes (3min timeout)
     → SendMessage to that Worker: "simplify {result}. Continue with TEA."
  → Track completion: completed_stories=[], pending_stories=[]
  → TIMEOUT: 15min per worker (longer than planning — code is complex)
    → If timeout: SendMessage reminder → 3min grace → skip worker, log warning

Step 3: Collect Results
  → As each Worker reports final checklist:
     → Verify 8/8 checks (7 BMAD + tsc)
     → Add to completed_stories
  → Wait until ALL workers done (or timed out)

Step 4: Sequential Merge
  → For each completed story (in order):
     1. Checkout main
     2. Merge worktree branch: git merge --no-ff {worktree-branch}
     3. If merge conflict: attempt auto-resolve, if can't → log and skip
     4. Run: npx tsc --noEmit -p packages/server/tsconfig.json
     5. If tsc fails: revert merge, log warning
     6. If tsc passes: commit
        Commit: feat: Story [ID] [title] -- [summary] + TEA [N] tests
     7. Update sprint-status.yaml

Step 5: Push + Report
  → git push
  → Wait for deploy: gh run list -L 1
  → Report:
    "Parallel dev complete.
     Completed: [list]
     Skipped: [list with reasons]
     Merge conflicts: [list]
     Deploy: build #{N} {status}"
```

### Parallel Worker Prompt (same as Mode B plus)
```
(Same as Mode B Developer Worker Prompt, with addition:)

## Important: Worktree Isolation
You are working in an isolated Git Worktree. Other workers are modifying other files.
- Do NOT touch files outside your story's scope
- If you need to modify shared files (e.g. shared/types.ts):
  → SendMessage to team-lead: "[Shared File] I need to modify {path}. Reason: {why}"
  → WAIT for team-lead approval before modifying
- Orchestrator will handle merging your worktree after you complete
```

---

## Mode D: Swarm Auto-Epic (v5.1 NEW)

Usage: `/kdh-full-auto-pipeline swarm epic-9`

**"이번 Epic 돌려줘" → 자러감 → 아침에 완성**

### How It Works (비유)

```
회사에 일감 게시판이 있음
  → 사장이 "이번 프로젝트 일감 8개" 올려놓고 퇴근
  → 직원 3명이 출근해서 게시판 확인
  → 각자 "이거 내가 할게" 하고 가져감
  → 하나 끝나면 게시판 다시 확인 → 다음 일감 가져감
  → 전부 끝나면 사장한테 보고서 올림
  → 사장 아침에 보고서 확인
```

### Orchestrator Flow

```
Step 0: Epic Analysis
  → Read sprint-status.yaml
  → Find all stories in epic-N
  → Analyze dependencies between stories (blockedBy fields)
  → Sort stories: independent first, dependent later

Step 1: Register ALL Stories as Tasks
  → For each story in epic:
     TaskCreate({
       subject: "Story {id}: {title}",
       description: "Run full BMAD 5-skill pipeline. Story file: {path}",
       status: "pending",
       owner: null,
       blockedBy: [{dependent story task IDs}]
     })
  → Log: "Registered {N} tasks for epic-{M}. {X} independent, {Y} dependent."

Step 2: Spawn Swarm Workers (3 workers, Git Worktrees)
  → TeamCreate (team: bmad-swarm-epic-N)
  → For i in 1..3:
     Agent(
       name: "swarm-worker-{i}",
       model: "sonnet",
       mode: "bypassPermissions",
       isolation: "worktree",
       prompt: Swarm Worker Prompt (see below)
     )
  → All 3 workers start simultaneously
  → Each worker immediately checks TaskList and claims first available task

Step 3: Orchestrator Monitors (minimal intervention)
  → Periodically check TaskList for overall progress
  → Handle special messages from workers:
    - "[Shared File]" → approve or coordinate between workers
    - "[ESCALATE]" → log, mark task as skipped, workers auto-pick next
    - "[All Tasks Done]" → worker reports it has no more tasks to do
  → TIMEOUT per task: 20 minutes (stories are bigger than planning steps)
    → If a task is in_progress for 20min with no update:
       → SendMessage to assigned worker: "Task {id} timeout. Status?"
       → 3min grace → if no response: mark task as pending (owner=null)
       → Another worker will pick it up
  → Track: completed_count, skipped_count, total_count

Step 4: Sequential Merge (after all tasks done or timed out)
  → Shutdown all workers (shutdown_request to each)
  → For each completed story (in dependency order):
     1. git checkout main && git pull
     2. git merge --no-ff {worktree-branch}
     3. If merge conflict:
        → Spawn single fix-worker (model=sonnet, isolation=none):
          "Resolve merge conflict in {files}. Then run tsc."
        → Timeout: 5min → skip if can't resolve
     4. npx tsc --noEmit -p packages/server/tsconfig.json
     5. If tsc fails:
        → Spawn single fix-worker: "Fix tsc errors. Changed files: {list}"
        → Timeout: 5min → revert merge if can't fix
     6. If tsc passes: commit
        Commit: feat: Story [ID] [title] -- [summary] + TEA [N] tests
     7. Update sprint-status.yaml → done

Step 5: Push + Deploy + Report
  → git push
  → Wait for deploy: gh run list -L 1 (poll until complete)
  → Generate epic completion report:

  _bmad-output/pipeline-logs/swarm-epic-{N}-report.md:
  ## Swarm Epic {N} Completion Report

  ### Summary
  - Total stories: {N}
  - Completed: {X} ✅
  - Skipped: {Y} ⚠️ (with reasons)
  - Merge conflicts resolved: {Z}
  - Merge conflicts unresolved: {W}

  ### Per-Story Results
  | Story | Status | Worker | Duration | Tests | Issues |
  |-------|--------|--------|----------|-------|--------|

  ### Deploy
  - Build: #{N}
  - Status: {success|failure}
  - URL: {deploy URL}

  ### Recommendations
  - Skipped stories needing manual attention: [list]
  - Suggested next: `/kdh-full-auto-pipeline swarm epic-{N+1}` or retrospective

Step 6: Suggest Retrospective
  → "Epic {N} complete. Run retrospective? /bmad-bmm-retrospective"
```

### Swarm Worker Prompt

```
You are a SWARM WORKER in team "{team_name}". Model: sonnet.
YOLO mode — auto-proceed, never wait for user input.
You are SELF-ORGANIZING: pick your own tasks from the task board.

## Your Loop (repeat until no tasks remain)

### 1. Find Next Task
  → TaskList — check all tasks
  → Find first task where: status="pending" AND owner=null AND blockedBy all completed
  → If no such task exists:
    → Check if any tasks are still in_progress (other workers)
    → If yes: wait 30 seconds, then TaskList again
    → If no: all done → SendMessage to team-lead: "[All Tasks Done] Worker {name} idle."
    → STOP

### 2. Claim Task
  → TaskUpdate: status="in_progress", owner="{my_name}"
  → Read the story file path from task description

### 3. Execute Full BMAD Pipeline (5 skills)
  a. skill="bmad-bmm-create-story", args="{story_id}" (skip if file exists)
  b. skill="bmad-bmm-dev-story", args="{story_file_path}"
     → No stubs/mocks — real working code only
  c. skill="bmad-tea-automate"
     → Risk-based tests for changed/added code
  d. skill="bmad-agent-bmm-qa"
     → No menu, execute immediately
  e. skill="bmad-bmm-code-review"
     → Auto-fix issues found

### 4. Quality Check
  → npx tsc --noEmit -p packages/server/tsconfig.json
  → If tsc fails: fix errors (1 attempt), re-run tsc
  → If still fails: SendMessage to team-lead: "[ESCALATE] Story {id} tsc fails after fix attempt"

### 5. Complete Task
  → TaskUpdate: status="completed"
  → SendMessage to team-lead:
    "[Task Complete] Story {id}
     Tests: {N} generated
     Issues: {N} found/fixed in code-review
     tsc: PASS
     Files changed: {list}"

### 6. Go Back to Step 1

## Rules
- NEVER modify files outside your story's scope
- If you need to modify shared files (shared/types.ts, shared/constants.ts, etc.):
  → SendMessage to team-lead: "[Shared File] Need to modify {path}. Reason: {why}"
  → WAIT for approval
- If a task takes longer than 15 minutes, send progress update to team-lead
- If Skill tool doesn't work, read the BMAD agent .md file and follow manually
- Real functionality only — no stubs, no mocks, no placeholders
- Each completed task = one worktree branch ready for merge
```

### Swarm vs Parallel: When to Use Which

| | Mode C: Parallel | Mode D: Swarm |
|---|---|---|
| **Input** | Specific story IDs you choose | Entire epic (auto-discovers stories) |
| **Task assignment** | Fixed: worker-1=story-A, etc. | **Self-organizing**: workers pick from board |
| **Dependency handling** | Manual (you choose independent ones) | **Automatic** (blockedBy in TaskCreate) |
| **Scale** | Fixed 3 workers for 3 stories | 3 workers for **N stories** (keeps working until done) |
| **Ideal for** | "이 3개만 빨리" | **"이번 Epic 전부 돌려놓고 자러감"** |
| **Recovery** | Worker dies → that story lost | Worker dies → **task goes back to board, another picks up** |

---

## Troubleshooting

### Writer goes idle without completing
**Fix:** Orchestrator sends reminder. step_timeout: 10min + 2min grace + respawn team.

### Critics don't respond to Writer's review request
**Cause:** Critic agent idle or crashed.
**Fix:** Writer waits 5 minutes max. If no response → Writer reports to Orchestrator → Orchestrator falls back to single-worker mode for this step.

### Critics disagree on score (one PASS, one FAIL)
**Fix:** Average score determines outcome. If avg >= 7: PASS. Disagreement logged but not blocking.

### Worker dies mid-stage
**Fix (v4.2):** Context-snapshots in `_bmad-output/context-snapshots/`. Respawned team gets all prior decisions.

### Team creation fails entirely
**Fix (v5):** Orchestrator falls back to v4.2 single-worker self-review. Pipeline continues.

### Parallel workers modify same file (merge conflict)
**Fix:** Each worker runs in Git Worktree = separate branch. Conflicts detected at merge time. Orchestrator attempts auto-resolve. If can't → skip that story, log warning, continue with others.

### Worker can't call Skill tool from TeamCreate context
**Fallback:** Worker reads the BMAD agent's .md file directly and follows instructions manually. Reports issue to Orchestrator.

### Swarm worker stuck on a task for too long
**Cause:** Complex story or worker hit an edge case.
**Fix:** Orchestrator sends reminder at 20min. If no response after 3min grace → task goes back to board (owner=null, status=pending). Another worker picks it up fresh.

### Swarm task dependency deadlock
**Cause:** All remaining tasks are blocked by in_progress tasks that are stuck.
**Fix:** Orchestrator detects: all pending tasks have blockedBy that are in_progress but timed out. Resolution: force-complete the blocking task (mark as skipped), unblocking dependents.

### Swarm merge conflicts pile up
**Cause:** Multiple workers modified adjacent code.
**Fix:** Orchestrator spawns a single fix-worker (5min timeout) per conflict. If unresolvable → skip that story, add to "needs manual attention" in report.

### /simplify times out or errors
**Fix:** Skip, log, continue. code-review still catches issues.

---

## Absolute Rules

1. Never implement code without BMAD skills
2. Never review code without BMAD skills
3. Never skip QA/TEA stages
4. Never treat stub/mock/placeholder as "complete"
5. Never skip planning stages because "file already exists" — always fresh
6. Never batch planning stages into one commit — individual commits per stage
7. BMAD agents: no menus, execute immediately (YOLO)
8. Planning stages: create fresh every time (overwrite existing)
9. Workers run in tmux (visible to user in split-pane)
10. Workers stay alive for all steps within a STAGE — shutdown and respawn between stages
11. Orchestrator does NOT write documents or run party mode — Workers do everything
12. Orchestrator MUST embed first task in Writer's spawn prompt — never say "wait" (Critics CAN wait — they trigger on Writer's DM)
13. All agents must read FROM FILE (Read tool) — never from memory or message text
14. Expert comments must be in character with 2-3 sentence minimum — no one-liners
15. "Zero findings" triggers re-analysis (BMAD adversarial protocol)
16. max_retry: 2 per step — FAIL 3 times = ESCALATE, never infinite rewrite
17. step_timeout: 10min + 2min grace — stall 3 times = SKIP step
18. Party-log validation: Orchestrator MUST verify critic-a.md + critic-b.md + fixes.md before accepting
19. /simplify: Orchestrator executes (not Worker), 3min timeout, skip on failure
20. Pipeline never blocks — timeout/fail/escalate always leads to "continue"
21. Worker MUST save context-snapshot after EVERY step (before reporting)
22. On Worker respawn/new stage, Orchestrator MUST inject ALL context-snapshots into prompt
23. Model strategy: Orchestrator=opus, Workers=sonnet (override only if explicitly requested)
24. Team failure → auto-fallback to single-worker mode, log warning, continue
25. Parallel mode: max 3 simultaneous workers. Shared file changes require Orchestrator approval.
26. tsc --noEmit MUST pass before any story dev commit
27. Swarm: workers MUST use TaskList→TaskUpdate for task claiming (no manual assignment)
28. Swarm: task timeout 20min → task returns to board (owner=null). Another worker picks up.
29. Swarm: Orchestrator generates epic completion report after all tasks done
30. Swarm: merge in dependency order. Merge conflict → spawn fix-worker (5min). Unresolvable → skip + log.
