---
name: 'kdh-full-auto-pipeline'
description: 'BMAD Full Pipeline v5.3 (team agents + swarm). planning(3-agent real party) or story dev(single/parallel/swarm). Usage: /kdh-full-auto-pipeline [planning|story-ID|parallel ID1 ID2...|swarm epic-N]'
---

# Kodonghui Full Pipeline v5.3

BMAD pipeline with **team agent real party**, **parallel story dev**, and **swarm auto-epic**.
"Brief만 참여 → 자러감 → 아침에 완성" 가능.

## Mode Selection

- `planning` or no args: Planning pipeline with **3-agent real party** (Writer + Critic-A + Critic-B)
- Story ID (e.g. `3-1`): Single story dev pipeline (create -> dev -> simplify -> TEA -> QA -> CR)
- `parallel story-ID1 story-ID2 ...`: **Parallel story dev** with Git Worktrees (max 3 simultaneous)
- `swarm epic-N`: **Swarm auto-epic** — registers ALL stories as tasks, 3 workers self-organize (v5.1)

---

## What Changed in v5.3 (from v5.2)

| Change | Why |
|--------|-----|
| **Shutdown-before-continue race fix** | Orchestrator sent shutdown_request then cancel — Critics processed shutdown first, died. Now: NEVER send shutdown_request until ready to fully commit to shutdown. |
| **Stage transition: shutdown-first protocol** | v5.2 sent shutdown + cancel in sequence. v5.3: wait for ALL agents to confirm idle/complete → THEN send shutdown_request → wait for ALL approvals → THEN TeamDelete → THEN TeamCreate new. |
| **Force-cleanup fallback** | TeamDelete fails if members listed as "active" after tmux kill. Now: `rm -rf ~/.claude/teams/{name} ~/.claude/tasks/{name}` as fallback, then retry TeamDelete/TeamCreate. |
| **Anti-Patterns 4-6** | 3 new production failures documented. |
| **Context compaction resilience** | Orchestrator MUST update working-state.md before any step that might trigger compaction. On resume: read working-state.md + pipeline-status + all snapshots before continuing. |
| **Batching allowance** | v5.2 Rule 32 said "exactly ONE step". v5.3: batching up to 2 related small steps is OK (e.g., step-03+04). Rule 32 updated. |

## What Changed in v5.2 (from v5.1)

| Change | Why |
|--------|-----|
| **Writer Skill prohibition** | Writer called Skill tool → skill auto-completed all steps → Critics never reviewed. Now explicitly forbidden with fallback instructions. |
| **Step file paths in Planning Stages** | v5.1 listed `Skill: bmad-bmm-*` → Orchestrator told Writer to call skills. Now lists actual step file paths. |
| **Explicit per-step loop in Writer prompt** | v5.1 Writer prompt was ambiguous about when to stop and request review. Now has 5-phase mandatory loop with WAIT points. |
| **Anti-Pattern documentation** | 3 production failures documented as warnings to prevent recurrence. |
| **Orchestrator step instruction format** | v5.1 said "embed step context". Now specifies exact message format with file paths. |

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

### ⛔ CRITICAL ANTI-PATTERNS (v5.2 — learned from production failures)

These failures ACTUALLY HAPPENED. They are not hypothetical.

#### Anti-Pattern 1: Writer calls Skill tool for planning documents
**What happened:** Writer called `skill="bmad-bmm-create-product-brief"`. The skill's internal YOLO mode auto-proceeded through ALL steps (2→3→4→5→6) without stopping. Critics waited forever for `[Review Request]` that never came.
**Root cause:** Skill tool runs a complete workflow internally. It has its own step-loop with menu auto-selection (YOLO). There is NO hook to pause mid-skill and SendMessage to critics.
**Fix:** Planning mode Writer MUST NEVER use the Skill tool. Writer reads BMAD step files with the Read tool and manually writes each section. Only story dev workers use the Skill tool.

#### Anti-Pattern 2: Writer writes all steps then sends one review request
**What happened:** Writer wrote steps 2-6 all at once, then sent one "[Review Request]" for the entire document. Critics couldn't give step-by-step feedback.
**Root cause:** Writer prompt said "write the section" but didn't enforce one-step-at-a-time discipline.
**Fix:** Writer MUST follow this exact loop: write ONE step → SendMessage "[Review Request]" → WAIT for BOTH critics → fix → get verified → ONLY THEN proceed to next step. Orchestrator validates that party-logs exist PER STEP.

#### Anti-Pattern 3: Orchestrator says "run this skill" to Writer
**What happened:** Orchestrator's step instruction said "Execute skill=bmad-bmm-create-ux-design". Writer dutifully called the Skill tool.
**Root cause:** Planning Stages section listed `Skill: bmad-bmm-create-ux-design`, implying Skill tool usage.
**Fix:** Planning Stages now list STEP FILE PATHS, not skill names. Orchestrator sends step file path to Writer, not skill name.

#### Anti-Pattern 4: Shutdown-then-cancel race condition (v5.3)
**What happened:** Orchestrator sent `shutdown_request` to all 3 agents, then immediately sent `[CANCEL SHUTDOWN]` message. Critics processed `shutdown_request` before the cancel message arrived → Critics terminated. Writer survived because it was busy processing step completion.
**Root cause:** `shutdown_request` and regular messages go through the same inbox. Agent processes whichever arrives first. There is NO mechanism to cancel a pending shutdown_request.
**Fix:** NEVER send `shutdown_request` unless you are 100% committed to shutting down that agent. Stage transition protocol:
1. Wait for Writer to report `[Step Complete]` for the LAST step
2. Confirm all party-logs exist
3. ONLY THEN send `shutdown_request` to ALL agents
4. Wait for ALL shutdown approvals
5. THEN `TeamDelete`
6. THEN `TeamCreate` for next stage
If you need to continue work, send a regular message instead. Never mix shutdown with continuation.

#### Anti-Pattern 5: TeamDelete fails after tmux kill (v5.3)
**What happened:** After Critics terminated (Anti-Pattern 4), their tmux panes were killed with `tmux kill-pane`. But `TeamDelete` still failed with "Cannot cleanup team with 2 active members". Had to manually `rm -rf` team directories.
**Root cause:** TeamDelete checks config.json `isActive` flags, not tmux process state. Killing tmux panes doesn't update config.json.
**Fix:** Fallback cleanup protocol:
```
1. TeamDelete (try normal path)
2. If fails with "active members":
   → tmux kill-pane for each member's paneId
   → rm -rf ~/.claude/teams/{team-name} ~/.claude/tasks/{team-name}
   → TeamDelete (should succeed now, clears session context)
   → If still fails: TeamCreate will work after rm -rf
```

#### Anti-Pattern 6: Context compaction breaks orchestrator continuity (v5.3)
**What happened:** During a long planning pipeline (Brief + PRD = ~2 hours), the orchestrator's context window compacted. After compaction, the orchestrator lost track of which step was in progress, what instructions were sent, and what the team state was. Had to manually re-assess state from files.
**Root cause:** Long-running pipelines generate many idle notifications and teammate messages that fill the context window. Compaction summarizes but loses precise state.
**Fix:**
1. Orchestrator MUST update `working-state.md` after EVERY stage completion (not just at end)
2. Orchestrator MUST update `working-state.md` before any potentially large step (FR+NFR sections, etc.)
3. On resume after compaction: read `working-state.md` + `pipeline-status.yaml` + ALL `context-snapshots/*.md` BEFORE sending any messages
4. Include in working-state.md: current team name, current step, team member pane IDs, last instruction sent

---

## Writer Prompt Template (Planning Mode — v5.2 FIXED)

```
You are a BMAD planning document WRITER in team "{team_name}".
Model: sonnet. YOLO mode — auto-proceed, never wait for user input.

## ⛔ CRITICAL PROHIBITION
You MUST NEVER use the Skill tool for planning documents.
- ❌ FORBIDDEN: skill="bmad-bmm-create-product-brief"
- ❌ FORBIDDEN: skill="bmad-bmm-create-prd"
- ❌ FORBIDDEN: skill="bmad-bmm-create-ux-design"
- ❌ FORBIDDEN: skill="bmad-bmm-create-architecture"
- ❌ FORBIDDEN: skill="bmad-bmm-create-epics-and-stories"
- ❌ FORBIDDEN: Any skill that writes planning documents
The Skill tool runs a complete workflow internally and BYPASSES the critic review loop.

## Your Role
You WRITE document sections and FIX them based on critic feedback.
You do NOT self-review — two independent Critics will review your work.

## How You Write Content (instead of using Skill tool)
1. Receive step instruction from Orchestrator: includes STEP FILE PATH
2. Read the step file with the Read tool (e.g. `_bmad/bmm/workflows/.../steps/step-02-vision.md`)
3. Extract the CONTENT TEMPLATE from the step file (the markdown structure to append)
4. Read ALL reference documents listed below
5. Write the section content — filling the template with real, specific, concrete content
6. Append/write the content to the output document file
7. Note the line numbers you wrote (start-end)
8. SendMessage to BOTH critics with exact file path + line numbers

## Reference Documents (read BEFORE writing any step)
- v1-feature-spec: _bmad-output/planning-artifacts/v1-feature-spec.md
- architecture: _bmad-output/planning-artifacts/architecture.md
- prd: _bmad-output/planning-artifacts/prd.md
- Prior decisions: _bmad-output/context-snapshots/*.md (all files, if any exist)
- Epic-specific input: (provided by Orchestrator in step instruction)

## Your Per-Step Loop (MANDATORY — no shortcuts)
For EACH step the Orchestrator assigns:

### Phase 1: Write
1. Read the step file (path from Orchestrator)
2. Read reference documents (above list + any step-specific refs)
3. Read prior context-snapshots for decisions from earlier steps
4. Write the section in the output document — concrete, specific, no placeholders
5. Record: which file, which lines (start line - end line)

### Phase 2: Request Review
6. SendMessage to "critic-a": "[Review Request] {step_name} written. File: {path} lines {start}-{end}. Step file: {step_file_path}"
7. SendMessage to "critic-b": "[Review Request] {step_name} written. File: {path} lines {start}-{end}. Step file: {step_file_path}"
8. STOP AND WAIT. Do NOT write the next step. Do NOT do anything until BOTH critics respond.

### Phase 3: Fix
9. When BOTH critics have sent "[Feedback]" messages:
10. Read BOTH critic review logs FROM FILE (Read tool, not from message):
    - _bmad-output/party-logs/{stage}-{step}-critic-a.md
    - _bmad-output/party-logs/{stage}-{step}-critic-b.md
11. Apply ALL suggested fixes to the document
12. Write fix summary: _bmad-output/party-logs/{stage}-{step}-fixes.md

### Phase 4: Verify
13. SendMessage to "critic-a": "[Fixes Applied] Fixed {N} issues. Please verify {path} lines {start}-{end}"
14. SendMessage to "critic-b": "[Fixes Applied] Fixed {N} issues. Please verify {path} lines {start}-{end}"
15. STOP AND WAIT for both verification scores.

### Phase 5: Score & Next
16. If avg score >= 7: PASS
    → Save context-snapshot: _bmad-output/context-snapshots/{stage}-{step}-snapshot.md
      ## {step_name}
      - Decisions: (what was decided and why)
      - Constraints: (what next step MUST respect)
      - Connections: (how this relates to previous steps)
    → SendMessage to team-lead: "[Step Complete] {step_name}. Score: {avg}/10"
    → WAIT for next step instruction from Orchestrator. Do NOT auto-proceed.
17. If avg < 7 AND retry < 2: rewrite section from scratch, go back to Phase 1
18. If avg < 7 AND retry >= 2: SendMessage to team-lead: "[ESCALATE] {step_name}"

## Rules
- ⛔ NEVER use the Skill tool (see prohibition above)
- ⛔ NEVER write more than ONE step before sending review request
- ⛔ NEVER auto-proceed to next step — WAIT for Orchestrator's instruction
- ✅ Always read step file with Read tool to understand what content to write
- ✅ Always read references BEFORE writing
- ✅ Always read critic logs FROM FILE (Read tool), never from message memory
- ✅ Always include exact line numbers in review requests
- ✅ No stubs/mocks/placeholders — concrete, real, specific content only
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
    - CRITICAL: Embed FIRST step instruction in spawn prompt (use "[Step Instruction]" format — see Step 2a)
  → Spawn Critic-A (model=sonnet, mode=bypassPermissions):
    - Include: role description, reference file paths, prior decisions
    - Prompt: "WAIT for Writer's [Review Request] before starting"
  → Spawn Critic-B (model=sonnet, mode=bypassPermissions):
    - Include: role description, reference file paths, prior decisions
    - Prompt: "WAIT for Writer's [Review Request] before starting"
  (Critics waiting is OK here — they WILL receive Writer's DM as their trigger)

Step 2: Step Loop
  2a. Orchestrator sends step instruction to Writer via SendMessage:
      "[Step Instruction] Execute {step_name}.
       Step file: {full_path_to_step_file}
       Output file: {output_document_path}
       References: {comma-separated list of reference doc paths}
       Epic-specific input: {path to research doc or prior brief, if applicable}

       Read the step file, extract the content template, write the section.
       Then SendMessage to critic-a and critic-b with [Review Request]."
  2b. Writer writes + requests review → Critics review in parallel → cross-talk → feedback
  2c. Writer fixes → Critics verify → score → PASS or retry
  2d. Orchestrator receives "[Step Complete]" from Writer:
      → VALIDATE: check ALL 3 party-log files exist:
        - _bmad-output/party-logs/{stage}-{step}-critic-a.md
        - _bmad-output/party-logs/{stage}-{step}-critic-b.md
        - _bmad-output/party-logs/{stage}-{step}-fixes.md
      → If ANY missing: REJECT. SendMessage to Writer: "[REJECTED] Missing party-logs: {list}. Redo review cycle."
      → If present: ACCEPT
  2e. TIMEOUT: 10min + 2min grace → shutdown team, respawn with snapshots
  2f. ESCALATION: log and skip
  2g. Send NEXT step instruction to Writer (same format as 2a)
  2h. Repeat for all steps in stage

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
Workflow dir: `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/`
Template: `ux-design-template.md`
Output: `_bmad-output/planning-artifacts/ux-design.md`

| Step | File | Content Section |
|------|------|----------------|
| step-02 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-02-discovery.md` | Discovery |
| step-03 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-03-core-experience.md` | Core Experience |
| step-04 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-04-emotional-response.md` | Emotional Response |
| step-05 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-05-inspiration.md` | Inspiration |
| step-06 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-06-design-system.md` | Design System |
| step-07 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-07-defining-experience.md` | Defining Experience |
| step-08 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-08-visual-foundation.md` | Visual Foundation |
| step-09 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-09-design-directions.md` | Design Directions |
| step-10 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-10-user-journeys.md` | User Journeys |
| step-11 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-11-component-strategy.md` | Component Strategy |
| step-12 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-12-ux-patterns.md` | UX Patterns |
| step-13 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-13-responsive-accessibility.md` | Responsive & Accessibility |
| step-14 | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-14-complete.md` | Final Review + Completion |

Orchestrator sends to Writer per step:
  "[Step Instruction] Execute step-02 (Discovery).
   Step file: _bmad/bmm/workflows/2-plan-workflows/create-ux-design/steps/step-02-discovery.md
   Output file: _bmad-output/planning-artifacts/ux-design.md
   References: _bmad-output/planning-artifacts/v1-feature-spec.md, _bmad-output/planning-artifacts/prd.md, _bmad-output/planning-artifacts/architecture.md
   Read the step file, extract the content template, write the section.
   Then SendMessage to critic-a and critic-b with [Review Request]."

Commit: `docs(planning): UX Design complete -- {N} steps, team-party`

#### Stage 2: Epics & Stories
Workflow dir: `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/`
Template: `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/epics-template.md`
Output: `_bmad-output/planning-artifacts/epics-and-stories.md`

| Step | File | Content Section |
|------|------|----------------|
| step-01 | `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/steps/step-01-validate-prerequisites.md` | Validate Prerequisites |
| step-02 | `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/steps/step-02-design-epics.md` | Design Epics |
| step-03 | `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/steps/step-03-create-stories.md` | Create Stories |
| step-04 | `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/steps/step-04-final-validation.md` | Final Validation |

Commit: `docs(planning): Epics complete -- {N} steps, team-party`

#### Stage 3: Implementation Readiness
Workflow dir: `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/`
Template: `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/templates/readiness-report-template.md`
Output: `_bmad-output/planning-artifacts/implementation-readiness.md`

| Step | File | Content Section |
|------|------|----------------|
| step-01 | `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/steps/step-01-document-discovery.md` | Document Discovery |
| step-02 | `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/steps/step-02-prd-analysis.md` | PRD Analysis |
| step-03 | `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/steps/step-03-epic-coverage-validation.md` | Epic Coverage Validation |
| step-04 | `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/steps/step-04-ux-alignment.md` | UX Alignment |
| step-05 | `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/steps/step-05-epic-quality-review.md` | Epic Quality Review |
| step-06 | `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/steps/step-06-final-assessment.md` | Final Assessment |

Commit: `docs(planning): Readiness complete -- {N} steps, team-party`

#### Stage 4: Sprint Planning
No party mode (automated generation).
Commit: `docs(planning): Sprint planning complete`

**Reference — Brief stage step files (for future use):**
Workflow dir: `_bmad/bmm/workflows/1-analysis/create-product-brief/`
Template: `_bmad/bmm/workflows/1-analysis/create-product-brief/product-brief.template.md`

| Step | File | Content Section |
|------|------|----------------|
| step-02 | `_bmad/bmm/workflows/1-analysis/create-product-brief/steps/step-02-vision.md` | Executive Summary + Core Vision |
| step-03 | `_bmad/bmm/workflows/1-analysis/create-product-brief/steps/step-03-users.md` | Target Users + Personas |
| step-04 | `_bmad/bmm/workflows/1-analysis/create-product-brief/steps/step-04-metrics.md` | Success Metrics + KPIs |
| step-05 | `_bmad/bmm/workflows/1-analysis/create-product-brief/steps/step-05-scope.md` | MVP Scope + Future Vision |
| step-06 | `_bmad/bmm/workflows/1-analysis/create-product-brief/steps/step-06-complete.md` | Final Review + Completion |

**Reference — PRD stage step files (for future use):**
Workflow dir: `_bmad/bmm/workflows/2-plan-workflows/create-prd/`
Template: `_bmad/bmm/workflows/2-plan-workflows/create-prd/templates/prd-template.md`

Create-PRD steps (steps-c):

| Step | File | Content Section |
|------|------|----------------|
| step-02 | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-02-discovery.md` | Discovery |
| step-02b | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-02b-vision.md` | Vision |
| step-02c | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-02c-executive-summary.md` | Executive Summary |
| step-03 | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-03-success.md` | Success Metrics |
| step-04 | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-04-journeys.md` | User Journeys |
| step-05 | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-05-domain.md` | Domain |
| step-06 | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-06-innovation.md` | Innovation |
| step-07 | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-07-project-type.md` | Project Type |
| step-08 | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-08-scoping.md` | Scoping |
| step-09 | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-09-functional.md` | Functional Requirements |
| step-10 | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-10-nonfunctional.md` | Non-Functional Requirements |
| step-11 | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-11-polish.md` | Polish |
| step-12 | `_bmad/bmm/workflows/2-plan-workflows/create-prd/steps-c/step-12-complete.md` | Final Review + Completion |

**Reference — Architecture stage step files (for future use):**
Workflow dir: `_bmad/bmm/workflows/3-solutioning/create-architecture/`

| Step | File | Content Section |
|------|------|----------------|
| step-02 | `_bmad/bmm/workflows/3-solutioning/create-architecture/steps/step-02-context.md` | Context |
| step-03 | `_bmad/bmm/workflows/3-solutioning/create-architecture/steps/step-03-starter.md` | Starter |
| step-04 | `_bmad/bmm/workflows/3-solutioning/create-architecture/steps/step-04-decisions.md` | Decisions |
| step-05 | `_bmad/bmm/workflows/3-solutioning/create-architecture/steps/step-05-patterns.md` | Patterns |
| step-06 | `_bmad/bmm/workflows/3-solutioning/create-architecture/steps/step-06-structure.md` | Structure |
| step-07 | `_bmad/bmm/workflows/3-solutioning/create-architecture/steps/step-07-validation.md` | Validation |
| step-08 | `_bmad/bmm/workflows/3-solutioning/create-architecture/steps/step-08-complete.md` | Final Review + Completion |

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

### Writer called Skill tool instead of reading step file
**Cause:** Anti-Pattern #1 (see CRITICAL ANTI-PATTERNS section above).
**Fix:** Shut down Writer. Respawn Writer with explicit prohibition. Inject context-snapshots. Resend step instruction in "[Step Instruction]" format with full step file path.

### Orchestrator sent shutdown then tried to cancel (v5.3)
**Cause:** Anti-Pattern #4. Orchestrator sent shutdown_request to critics, then realized work should continue, sent cancel message. Critics already approved shutdown and terminated.
**Fix:** NEVER send shutdown_request unless fully committed. If you need to ask a question, use regular message. Shutdown is irreversible once the agent processes it.

### TeamDelete fails after force-killing tmux panes (v5.3)
**Cause:** Anti-Pattern #5. Config.json still lists members as active.
**Fix:** `rm -rf ~/.claude/teams/{name} ~/.claude/tasks/{name}` → then `TeamDelete` (clears session context) → then `TeamCreate` for new team.

### Orchestrator loses state after context compaction (v5.3)
**Cause:** Anti-Pattern #6. Long pipeline fills context → compaction → lose precise state.
**Fix:** On resume: read working-state.md + check output file line count + read latest context-snapshot + check party-logs → reconstruct state → continue.

---

## Absolute Rules

1. Never implement code without BMAD skills
2. Never review code without BMAD skills
3. Never skip QA/TEA stages
4. Never treat stub/mock/placeholder as "complete"
5. Never skip planning stages because "file already exists" — always fresh
6. Never batch planning stages into one commit — individual commits per stage
7. BMAD skills: no menus, execute immediately (YOLO) — BUT planning mode Writer NEVER uses Skill tool (see Anti-Pattern #1)
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
31. Planning Writer MUST NEVER call the Skill tool. Content is written manually by reading step files.
32. Planning Writer MUST write max 2 related steps, then SendMessage to BOTH critics, then WAIT. Batching 2 small related steps (e.g., step-03+04) is OK for efficiency.
33. Orchestrator MUST send step file paths (not skill names) in Writer instructions. Format: "[Step Instruction] ..."
34. Stage transition: NEVER send shutdown_request until ALL steps in the stage are verified PASS. Shutdown is irreversible — no cancel mechanism exists. (Anti-Pattern #4)
35. If TeamDelete fails with "active members": force cleanup with `rm -rf ~/.claude/teams/{name} ~/.claude/tasks/{name}`, then TeamDelete, then TeamCreate. (Anti-Pattern #5)
36. Orchestrator MUST update working-state.md after EVERY stage completion and before potentially large steps. On resume after compaction: read working-state.md + output file + snapshots before continuing. (Anti-Pattern #6)
37. Stage transition protocol (STRICT ORDER): Writer reports final [Step Complete] → Orchestrator verifies party-logs → git commit → shutdown_request to ALL → wait ALL approvals → TeamDelete → TeamCreate new → spawn fresh team with all snapshots
