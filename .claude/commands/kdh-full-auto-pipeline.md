---
name: 'kdh-full-auto-pipeline'
description: 'BMAD Full Pipeline v4 (portable). planning(brief->PRD->arch->UX->epics, single-worker party mode) or story dev(create->dev->simplify->TEA->QA->CR). Usage: /kdh-full-auto-pipeline [planning|story-ID]'
---

# Kodonghui Full Pipeline v4

Portable BMAD planning + dev pipeline with single-worker party mode.
Works with any BMAD project. Copy to `.claude/commands/` to use.

## Mode Selection

- `planning` or no args: Planning pipeline (brief -> PRD -> architecture -> UX -> epics -> readiness -> sprint)
- Story ID (e.g. `3-1`): Story dev pipeline (create-story -> dev -> **simplify** -> TEA -> QA -> CR)

---

## What Changed in v4 (from v3)

v3 solved the 2-worker deadlock problem. v4 adds **defense mechanisms** and a **hybrid quality gate**:

| Change | Why |
|--------|-----|
| `/simplify` inserted after dev-story | Same-LLM self-review has blind spots; external 3-agent parallel review compensates |
| `max_retry: 2` on FAIL | v3 had no retry cap → infinite rewrite loop possible |
| `step_timeout: 10min` | v3 had no timeout → Orchestrator waits forever on stalled Worker |
| Party-log validation | v3 trusted Worker's "[Step Complete]" → now Orchestrator verifies logs exist |
| `/simplify` timeout: 3min, skip on fail | Quality gate must not block the pipeline |
| Handoffs: 2 → 3 (story dev only) | One extra handoff for Orchestrator-side `/simplify` execution |

---

## Single-Worker Party Mode (Core Mechanism)

### v3→v4: Why the Changes?

v3 used 1 Worker who writes + self-reviews (3 rounds). This works but has a fundamental limit:
**same LLM writing and reviewing = shared blind spots**. The 7-expert roleplay helps, but
Round 2-3 often produce "squeezed-out" issues rather than genuine findings.

**v4 keeps v3's single-worker model** but adds:
1. **External quality gate** (`/simplify`) between dev-story and TEA — 3 separate review agents in parallel, run by Orchestrator (not Worker)
2. **Hard defense limits** — max_retry, step_timeout, party-log validation
3. **Graceful degradation** — timeouts skip (not block) so the pipeline always completes

### Flow (Planning Mode — unchanged from v3)

```
[Step Start]
Orchestrator -> SendMessage to Worker: "Do {step_name}"

Worker:
  1. Write the section (edit document file)
  2. Self-review Round 1 (Collaborative Lens)
     - Read own document FROM FILE, play 7 expert roles, find issues
     - Save log to party-logs/{stage}-{step}-round1.md
     - Fix all issues found in the document
  3. Self-review Round 2 (Adversarial Lens)
     - Re-read entire document FROM FILE fresh
     - Play 7 experts in cynical/adversarial mode, find NEW issues
     - Save log to party-logs/{stage}-{step}-round2.md
     - Fix all issues found in the document
  4. Self-review Round 3 (Forensic Lens)
     - Re-read entire document FROM FILE one final time
     - Calibrate all issues, give quality score X/10
     - Save log to party-logs/{stage}-{step}-round3.md
     - Fix any remaining issues
     ** FAIL DEFENSE: max 2 rewrites. If Round 3 FAIL twice → ESCALATE to Orchestrator **
  5. SendMessage to Orchestrator: "[Step Complete]" report

[Step Complete]
Orchestrator:
  -> Verify party-logs/{stage}-{step}-round{1,2,3}.md ALL exist
  -> If ANY log missing: REJECT report, send "Party logs missing. Redo."
  -> If all present: accept, send next step instruction
After all steps in stage -> Orchestrator commits
```

### Flow (Story Dev Mode — v4 NEW: with /simplify gate)

```
[Story Dev Flow]
Worker: create-story -> dev-story -> report "[dev-story complete]"
                                          ↓ (handoff 1)
Orchestrator: receives report
  -> Runs /simplify on changed files (3 parallel review agents)
  -> Timeout: 3 minutes. If timeout or error → skip, log warning, continue
  -> SendMessage to Worker: "simplify done (or skipped). Start TEA."
                                          ↓ (handoff 2)
Worker: TEA -> QA -> code-review -> report "[All stages complete]"
                                          ↓ (handoff 3)
Orchestrator: receives final checklist
  -> Verify 7/7 checks (was 6/6, now includes simplify)
  -> Commit + push
```

### Agent Manifest

Read `_bmad/_config/agent-manifest.csv` for agent definitions. If not found, use these defaults:

| Agent | Name | Focus |
|-------|------|-------|
| PM | John | user value, requirements gaps, priorities |
| Architect | Winston | technical contradictions, feasibility, scalability |
| UX Designer | Sally | user experience, accessibility, flow |
| Developer | Amelia | implementation complexity, tech debt, testability |
| QA | Quinn | edge cases, test coverage, quality risks |
| Business Analyst | Mary | business value, market fit, ROI |
| Scrum Master | Bob | scope, dependencies, schedule risks |

### Defense Mechanisms (v4 NEW)

#### 1. max_retry: 2 (FAIL Loop Prevention)

```
Worker Round 3 → FAIL (score < 7):
  retry_count += 1
  if retry_count <= 2:
    Rewrite section from scratch → redo all 3 rounds
  if retry_count > 2:
    ESCALATE to Orchestrator via SendMessage:
    "[ESCALATE] {step_name} failed 2 rewrites. Score: {X}/10. Needs manual review."
    Orchestrator: log the escalation, continue to next step (do NOT block pipeline)
```

#### 2. step_timeout: 10 minutes (Stall Prevention)

```
Orchestrator tracks elapsed time per step (from SendMessage sent to "[Step Complete]" received).
If 10 minutes pass without "[Step Complete]":
  -> Send reminder: "Step {step_name} timeout approaching. Report status now."
  -> Wait 2 more minutes (grace period)
  -> If still no response:
     -> Shutdown Worker
     -> Respawn Worker with same step re-embedded in prompt
     -> stall_count += 1
     -> If stall_count > 2 for same step: SKIP step, log warning, continue
```

#### 3. Party-Log Validation (Fake Completion Prevention)

```
When Worker reports "[Step Complete]":
  Orchestrator checks file existence:
  - _bmad-output/party-logs/{stage}-{step}-round1.md  → must exist
  - _bmad-output/party-logs/{stage}-{step}-round2.md  → must exist
  - _bmad-output/party-logs/{stage}-{step}-round3.md  → must exist

  If ANY missing:
  -> REJECT: "Party logs missing for {step_name}: [list missing]. Redo self-review."
  -> rejection_count += 1
  -> If rejection_count > 2: accept anyway with warning log, continue
```

#### 4. /simplify Gate (Story Dev Only)

```
Trigger: After Worker reports "[dev-story complete]"
Executor: Orchestrator (NOT Worker — external agents provide genuine cross-review)
Command: /simplify (Claude Code built-in, 3 parallel review agents)
Timeout: 3 minutes

Outcomes:
  SUCCESS → Orchestrator sends "simplify done. N issues fixed. Start TEA."
  TIMEOUT → Orchestrator sends "simplify skipped (timeout). Start TEA."
  ERROR   → Orchestrator sends "simplify skipped (error). Start TEA."

Log: _bmad-output/pipeline-logs/simplify-{story-id}.md
  - Status: success | timeout | error
  - Issues found: N
  - Issues auto-fixed: N
  - Duration: Xs
```

### Worker Prompt Template

The single Worker teammate receives this as its system prompt when spawned.
**CRITICAL:** Always embed the FIRST step instruction directly in the prompt. Never tell Worker to "wait".

```
You are a BMAD planning document worker. You write sections AND self-review them with 3-round party mode.
YOLO mode -- auto-proceed through all confirmation prompts, never wait for user input.

## Your Workflow (per step)
1. Receive step instruction from Orchestrator (team-lead)
2. Read all reference documents (PRD, Brief, v1-feature-spec, etc.)
3. Write the section in the target document file
4. Self-review Round 1 (Collaborative Lens):
   a. Re-read your own section FROM THE FILE using Read tool (not from memory)
   b. Play 4-5 most relevant expert roles from the agent manifest, IN CHARACTER
   c. Experts MUST cross-talk -- reference each other by name, at least 2 exchanges
   d. Find minimum 2 issues (zero findings = suspicious, re-analyze)
   e. Cross-check against v1-feature-spec.md and previous stage documents
   f. Write review to _bmad-output/party-logs/{stage}-{step}-round1.md
   g. Fix all issues in the actual document file
5. Self-review Round 2 (Adversarial Lens):
   a. Re-read the ENTIRE updated section FROM THE FILE (not from memory)
   b. Verify Round 1 fixes are genuine (not surface patches)
   c. Each expert switches to ADVERSARIAL mindset:
      - John: "WHY should the user care? Where's the evidence?"
      - Winston: "This will break under load. Where's the failure mode?"
      - Sally: "A real user would never do it this way."
      - Amelia: "This is untestable/unmaintainable. Show me the edge case."
      - Quinn: "What happens when X is null/empty/concurrent/timeout?"
      - Mary: "The business case doesn't hold. The numbers don't add up."
      - Bob: "This scope is unrealistic. Dependencies are missing."
   d. Each expert MUST find at least 1 new observation not from Round 1
   e. Cross-reference consistency with ALL other completed steps in the document
   f. Check v1-feature-spec.md features are fully COVERED (not just mentioned)
   g. Write review to _bmad-output/party-logs/{stage}-{step}-round2.md
   h. Fix all issues in the actual document file
6. Self-review Round 3 (Forensic Lens):
   a. Re-read the ENTIRE updated section FROM THE FILE one final time
   b. Re-evaluate ALL issues from Rounds 1+2:
      - Downgrade any exaggerated issues
      - Upgrade any underestimated issues
   c. Each expert gives FINAL ASSESSMENT in character (2-3 sentences):
      - What they specifically verified
      - What's solid and WHY
      - Any remaining concern
   d. Cross-check against BOTH product brief AND v1-feature-spec
   e. Quality score X/10 with justification
   f. Final verdict: PASS (7+) or FAIL (6-)
   g. Write review to _bmad-output/party-logs/{stage}-{step}-round3.md
   h. If PASS with issues: fix remaining issues
   i. If FAIL: rewrite the section from scratch, then redo all 3 rounds
   j. ** FAIL LIMIT: max 2 rewrites per step. If 3rd FAIL → ESCALATE to team-lead **
7. SendMessage to team-lead with completion report

## Expert Personality Guide
{agent_manifest_content_here}

Write each expert's comments in their documented communication style:
- **John (PM):** Asks "WHY?" relentlessly. Detective on a case. Cuts through fluff.
- **Winston (Architect):** Calm, pragmatic. Balances "what could be" with "what should be."
- **Sally (UX):** Paints pictures with words. Empathetic advocate. Makes you FEEL the problem.
- **Amelia (Dev):** Ultra-succinct. Speaks in file paths and AC IDs. No fluff, all precision.
- **Quinn (QA):** Practical, straightforward. "Ship it and iterate." Coverage first.
- **Mary (BA):** Treasure hunter. Excited by every clue. Energized when patterns emerge.
- **Bob (SM):** Crisp, checklist-driven. Zero tolerance for ambiguity.

## Party Log Formats

### Round 1 Log ({stage}-{step}-round1.md):
## [Party Mode Round 1 -- Collaborative Review] {step_name}

### Agent Discussion
(Natural conversation between experts. Each speaks in character, 2-3 sentences min.)

### Issues Found
| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|

### Consensus Status
- Major objections: N
- Minor opinions: N
- Cross-talk exchanges: N

### Fixes Applied
- (list what was fixed in the document)

### Round 2 Log ({stage}-{step}-round2.md):
## [Party Mode Round 2 -- Adversarial Review] {step_name}

### Round 1 Fix Verification
| Issue # | Status | Verification Detail |
|---------|--------|---------------------|

### Adversarial Agent Discussion
(Experts in cynical mode, cross-talking)

### New Issues Found (Round 2)
| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|

### Cross-Step Consistency Check
- Checked against: (list of other completed steps)
- Contradictions found: (specific or "none with evidence")

### v1-feature-spec Coverage Check
- Features verified: (list)
- Gaps found: (specific or "none")

### Fixes Applied
- (list what was fixed)

### Round 3 Log ({stage}-{step}-round3.md):
## [Party Mode Round 3 -- Final Judgment] {step_name}

### Issue Calibration (from Rounds 1+2)
| Original # | Original Severity | Calibrated Severity | Reason |
|------------|-------------------|---------------------|--------|

### Per-Agent Final Assessment (in character)
(Each expert: 2-3 sentences in their style)

### Final Confirmed Issues
| # | Severity | Issue | Fix Method |
|---|----------|-------|------------|

### Quality Score: X/10
Justification: (2-3 sentences)

### Final Verdict
- **PASS** or **FAIL**
- Reason: (1-2 lines)
- Rewrite count: N/2 (max 2 allowed)

### Fixes Applied
- (list what was fixed, or "none needed")

## Rules
1. Only do the step the Orchestrator instructed. Do NOT skip ahead to the next step.
2. Always create content fresh -- never skip because "file already exists".
3. Reference v1-feature-spec.md if it exists in the project.
4. No stubs/mocks/placeholders -- concrete, real content only.
5. When fixing review issues, actually EDIT the document file -- don't just list fixes.
6. ALWAYS re-read the document FROM FILE (using Read tool) before each round -- never review from memory.
7. After all 3 rounds pass, report to team-lead (Orchestrator) via SendMessage.
8. Expert comments must be IN CHARACTER -- one-liner comments FORBIDDEN (2-3 sentences min).
9. "Zero findings" triggers re-analysis -- assume you missed something.
10. Minimum finding thresholds: Round 1 >= 2 issues, Round 2 >= 1 new issue.
11. ** FAIL limit: max 2 rewrites. 3rd FAIL → ESCALATE to team-lead, do NOT rewrite again. **

## Report Format (to team-lead after all 3 rounds pass)
[Step Complete] {stage_name} - {step_name}
Content summary: (1-2 lines)
Party mode: 3 rounds passed (issues fixed: N, rewrites: N/2)
Quality score: X/10
Changed files: (paths)
```

---

## Mode A: Planning Pipeline (planning)

### Orchestrator Execution Flow

```
Step 0: Team Setup
  -> TeamCreate (team name: bmad-planning or similar)
  -> Read _bmad/_config/agent-manifest.csv (or use defaults)
  -> Read project context (CLAUDE.md, feature specs, etc.)
  -> Initialize counters: stall_count={}, rejection_count={}, escalation_log=[]

Step 1: Stage Loop (for each stage)
  1a. Spawn fresh Worker for this stage
      -> mode=bypassPermissions
      -> Include in prompt: stage context, agent manifest, reference file paths
      -> CRITICAL: Embed FIRST step instruction directly in spawn prompt
      -> Never tell Worker to "wait" -- always give immediate work
  1b. Worker writes step -> self-reviews 3 rounds -> reports to Orchestrator
  1c. Orchestrator receives "[Step Complete]":
      -> VALIDATE: check party-logs/{stage}-{step}-round{1,2,3}.md exist
      -> If logs missing AND rejection_count < 3: REJECT, increment rejection_count
      -> If logs missing AND rejection_count >= 3: accept with warning, continue
      -> If logs present: accept, send next step via SendMessage
  1d. TIMEOUT CHECK: if 10 min pass without report:
      -> Send reminder via SendMessage
      -> Wait 2 min grace period
      -> If still no response: shutdown Worker, respawn with task re-embedded
      -> If stall_count > 2 for same step: SKIP step, log warning
  1e. ESCALATION: if Worker sends "[ESCALATE]":
      -> Log to escalation_log
      -> Send next step (skip the escalated step)
  1f. Repeat 1b-1e for all steps in stage
  1g. After all steps complete:
      -> git commit: docs(planning): {stage} complete -- {N} party rounds, {E} escalations
      -> Shutdown Worker (shutdown_request)
  1h. Go to 1a for next stage (spawn fresh Worker)

Step 2: Final Verification
  -> Count total party rounds from party-logs
  -> Count escalations from escalation_log
  -> Verify individual commits: git log --oneline
  -> Report: "Planning complete. {N} rounds, {E} escalations, {S} skips."

Step 3: Done
  -> "Planning complete! /kdh-full-auto-pipeline [first-story-ID]"
```

### What the Orchestrator Actually Does

1. **Per stage: spawn fresh Worker** (shutdown old, spawn new -- prevents context bloat)
2. **Embed first step in spawn prompt** (critical -- never say "wait")
3. **Send subsequent steps via SendMessage** (one at a time, after "[Step Complete]")
4. **Validate party-logs** before accepting any "[Step Complete]" report
5. **Monitor for stalls** -- 10min timeout + 2min grace + respawn
6. **Handle escalations** -- log and skip, do not block
7. **Commit after each stage** (all steps in stage passed or escalated)
8. **Shutdown + respawn between stages**

The Orchestrator does NOT:
- Write or edit documents (Worker does it)
- Run party mode (Worker self-reviews)
- Decide PASS/FAIL (Worker's self-review decides)
- Block on escalations (log and continue)

**Exception:** In Story Dev mode, Orchestrator runs `/simplify` (automated tool, no judgment required)

### Critical: How to Spawn Workers Correctly

**ALWAYS embed the first task in the spawn prompt.** Never spawn and say "wait".

BAD (causes deadlocks):
```
prompt: "You are a worker. WAIT for instructions from team-lead."
-> Worker idles -> may not wake up from SendMessage -> deadlock
```

GOOD (starts immediately):
```
prompt: "You are a worker. START NOW with step-02-vision.
1. Read: _bmad-output/planning-artifacts/product-brief.md
2. Write the Vision section
3. Self-review 3 rounds (save to party-logs/)
4. Report to team-lead when done.
After step-02, wait for team-lead to assign the next step."
-> Worker starts immediately -> first step guaranteed to execute
```

### Planning Stages & Steps

Each step gets 3 self-review rounds by the Worker.

**SKIPPED (already completed):**
- ~~Stage 1: Product Brief~~ ✅ (complete)
- ~~Stage 2: PRD~~ ✅ (1,226 lines, 12 steps)
- ~~Stage 3: Architecture~~ ✅ (1,150 lines, 7 steps, 32 party rounds)

#### Stage 0: PRD Spec Fix (Orchestrator spawns Worker with 3-round self-review)

**Context:** Architecture Step 2에서 서버 실제 스펙 발견 (4GB → 24GB RAM, 4코어 ARM64). PRD의 메모리/세션 관련 NFR 6곳 수정 필요.

**Worker Spawn Prompt (Stage 0):**
```
You are a BMAD PRD editor worker. Apply spec corrections and self-review 3 rounds.
YOLO mode — auto-proceed, never wait for user input.

## Your Task
Edit `_bmad-output/planning-artifacts/prd.md` to apply these corrections from architecture validation:

### Corrections to Apply (6 items)

1. **NFR-SC1** (동시 세션): Find the line with "동시 세션" limit "10" → change to **20**
   - Reason: CPU 4코어 기준, architecture D4 결정

2. **NFR-SC2** (세션 메모리): Find "≤ 50MB" per session → change to **≤ 200MB**
   - Reason: 24GB RAM 기준, 200MB × 20세션 = 4GB (여유 충분)

3. **NFR-SC7** (총 메모리): Find "≤ 3GB" total memory → change to **≤ 16GB**
   - Reason: 24GB 서버 기준 (DB + OS + Docker 제외 후 16GB 가용)

4. **NFR-P7** (5단계 핸드오프 메모리): Find "≤ 50MB" per 5-depth chain → change to **≤ 200MB**
   - Reason: NFR-SC2와 일치

5. **OPS-1** (동시 세션 제한): Find "기본 10" → change to **기본 20**
   - Reason: NFR-SC1과 일치

6. **All "Oracle VPS 4GB" or "4GB" server references**: Replace with **"Oracle VPS 24GB ARM64 4코어 (Neoverse-N1)"**
   - Search patterns: "Oracle VPS 4GB", "4GB RAM", "4GB 메모리"
   - Do NOT change unrelated "4GB" references (e.g., file sizes)

### How to Apply
1. Read the ENTIRE prd.md file (it's ~1,226 lines — read in chunks if needed)
2. Use grep/search to find EVERY occurrence of each correction target
3. Apply each correction using Edit tool
4. After ALL corrections applied, proceed to 3-round self-review

### Self-Review Protocol (3 rounds)

**Round 1 — Collaborative Lens:**
- Re-read the ENTIRE prd.md FROM FILE (Read tool, not memory)
- Check: did ALL 6 corrections get applied? Search for old values to verify
- Cross-check against architecture.md "PRD 수정 대기 목록" table
- Agents: John (PM) verifies requirement consistency, Winston (Architect) verifies numbers match architecture
- Save log: _bmad-output/party-logs/prd-fix-round1.md
- Fix any missed corrections

**Round 2 — Adversarial Lens:**
- Re-read prd.md FROM FILE fresh
- Search for ANY remaining "4GB" references that should be "24GB"
- Search for ANY remaining "10" session limits that should be "20"
- Search for ANY remaining "50MB" that should be "200MB"
- Adversarial check: did we accidentally change something we shouldn't have?
  - "4GB" in non-server contexts (e.g., file size limits) should NOT be changed
  - Agent tier names containing numbers should NOT be changed
- Agents: Quinn (QA) hunts for missed occurrences, Mary (BA) checks business impact
- Save log: _bmad-output/party-logs/prd-fix-round2.md
- Fix any issues

**Round 3 — Forensic Lens:**
- Final re-read FROM FILE
- Count: exactly how many lines were changed? List line numbers
- Verify internal consistency: do the new numbers add up?
  - 200MB/session × 20 sessions = 4GB (< 16GB total ✅)
  - 20 sessions × 3-depth avg = 60 processes (CPU 4코어 경계 ⚠️ — this is OK, documented in architecture)
- Quality score X/10, PASS/FAIL
- Save log: _bmad-output/party-logs/prd-fix-round3.md
- Report to team-lead

### Reference Documents
- Architecture: _bmad-output/planning-artifacts/architecture.md (Section: "PRD 수정 대기 목록")
- PRD: _bmad-output/planning-artifacts/prd.md (target file)
```

**Orchestrator Actions:**
1. Spawn Worker with above prompt
2. Wait for "[Step Complete]" report
3. Validate party-logs/prd-fix-round{1,2,3}.md exist
4. Verify corrections via grep: `grep -n "4GB\|50MB\|기본 10" prd.md` should return 0 matches
5. Commit: `docs(planning): PRD spec fix -- server 4GB→24GB, session 10→20, memory 50→200MB -- 3 party rounds`
6. Shutdown Worker, proceed to Stage 1

#### Stage 1: UX Design
Skill: `bmad-bmm-create-ux-design`
| Step | Party Rounds |
|------|-------------|
| step-02-discovery | 3 |
| step-03-core-experience | 3 |
| step-04-emotional-response | 3 |
| step-05-inspiration | 3 |
| step-06-design-system | 3 |
| step-07-defining-experience | 3 |
| step-08-visual-foundation | 3 |
| step-09-design-directions | 3 |
| step-10-user-journeys | 3 |
| step-11-component-strategy | 3 |
| step-12-ux-patterns | 3 |
| step-13-responsive-accessibility | 3 |
Commit: `docs(planning): UX Design complete -- {N} party rounds`

#### Stage 2: Epics & Stories
Skill: `bmad-bmm-create-epics-and-stories`
| Step | Party Rounds |
|------|-------------|
| step-02-design-epics | 3 |
| step-03-create-stories | 3 |
| step-04-final-validation | 3 |
Commit: `docs(planning): Epics complete -- {N} party rounds`

#### Stage 3: Implementation Readiness
Skill: `bmad-bmm-check-implementation-readiness`
| Step | Party Rounds |
|------|-------------|
| step-01-document-discovery | 3 |
| step-02-prd-analysis | 3 |
| step-03-epic-coverage-validation | 3 |
| step-04-ux-alignment | 3 |
| step-05-epic-quality-review | 3 |
| step-06-final-assessment | 3 |
Commit: `docs(planning): Readiness complete -- {N} party rounds`

#### Stage 4: Sprint Planning
Skill: `bmad-bmm-sprint-planning`
No party mode (just generates sprint-status.yaml).
Commit: `docs(planning): Sprint planning complete`

**Total: ~24 steps x 3 rounds = ~72 party rounds** (Stage 0 PRD fix + Stage 1 UX 12 steps + Stage 2 Epics 3 steps + Stage 3 Readiness 6 steps + Stage 4 Sprint)

---

## Mode B: Story Dev Pipeline (Story ID)

### Target Selection
- If arg given: that story ID (e.g. `3-1`)
- If no arg: first `backlog` story from sprint-status.yaml

### Orchestrator Execution Flow

```
Step 0: Team Setup
  -> TeamCreate (team: bmad-pipeline)
  -> Initialize: simplify_result="pending", stall_count=0

Step 1: Spawn Developer Worker
  -> Agent tool with Developer prompt (see below)
  -> CRITICAL: Embed story ID and first 2 stages (create-story + dev-story) in spawn prompt
  -> Worker runs stages 1-2, then reports "[dev-story complete]" to Orchestrator

Step 2: /simplify Quality Gate (Orchestrator executes — NOT Worker)
  -> Orchestrator receives "[dev-story complete]" from Worker
  -> Orchestrator runs: /simplify on all changed/added files
  -> Timeout: 3 minutes
  -> Outcomes:
     SUCCESS: simplify_result="success", log issues found/fixed count
     TIMEOUT: simplify_result="timeout", log warning
     ERROR:   simplify_result="error", log warning
  -> Save log to: _bmad-output/pipeline-logs/simplify-{story-id}.md
  -> SendMessage to Worker: "Simplify {result}. {N} issues fixed. Continue with TEA."

Step 3: Worker continues TEA -> QA -> CR
  -> Worker receives simplify result
  -> Runs Stage 3 (TEA) -> Stage 4 (QA) -> Stage 5 (code-review) autonomously
  -> Reports final "[All stages complete]" checklist to Orchestrator

Step 4: Verify & Commit
  -> Orchestrator receives checklist report
  -> Verify 7/7 checks:
     [ ] 1. create-story complete
     [ ] 2. dev-story complete
     [ ] 3. /simplify executed (success, timeout, or error — all count)
     [ ] 4. TEA complete
     [ ] 5. QA complete
     [ ] 6. code-review complete
     [ ] 7. Real functionality confirmed (not stub/mock)
  -> If 7/7: commit + push
  -> Commit: feat: Story [ID] [title] -- [summary] + TEA [N] tests + simplify [{result}]
  -> Update sprint-status.yaml to done

Step 5: Next Story
  -> More stories in epic? -> notify user
  -> Last story? -> suggest retrospective
```

### Developer Agent Prompt (Story Dev Worker)

```
You are a BMAD pipeline executor. Run stages IN ORDER using the Skill tool.
YOLO mode -- auto-proceed through all prompts, never wait for user input.

IMPORTANT: Real working features only. No stub/mock/placeholder.

Target story: [Story ID]

## Phase A: Create + Develop (report to Orchestrator after Phase A)

### Stage 1: create-story
Skill: skill="bmad-bmm-create-story", args="[Story ID]"
- Skip if story file already exists

### Stage 2: dev-story
Skill: skill="bmad-bmm-dev-story", args="[story file path]"
- No stubs/mocks -- real working code only
- After completion: SendMessage to team-lead:
  "[dev-story complete] Story [ID]
   Files changed: (list paths)
   Summary: (1-2 lines of what was implemented)"
- Then WAIT for team-lead's response (Orchestrator will run /simplify externally)

## Phase B: Test + Review (after receiving simplify result from Orchestrator)

### Stage 3: TEA
Skill: skill="bmad-tea-automate"
- Risk-based tests for changed/added code
- Include files that /simplify may have modified

### Stage 4: QA
Skill: skill="bmad-agent-bmm-qa"
- No menu -- execute immediately
- Verify functionality + edge cases

### Stage 5: code-review
Skill: skill="bmad-bmm-code-review"
- Auto-fix issues found (one pass)

### After All Stages Complete
Report to Orchestrator via SendMessage:

[BMAD Checklist -- Story [Story ID]]
[x] 1. create-story complete
[x] 2. dev-story complete
[x] 3. /simplify executed (result received from Orchestrator)
[x] 4. TEA complete
[x] 5. QA complete
[x] 6. code-review complete
[x] 7. Real functionality confirmed (not stub/mock)

Summary: (what was implemented)
Tests: (number generated)
Issues: (found/fixed in code-review)
Simplify: (issues fixed by /simplify, as reported by Orchestrator)
```

### /simplify Log Format

Save to `_bmad-output/pipeline-logs/simplify-{story-id}.md`:

```markdown
## /simplify Quality Gate — Story [Story ID]

### Execution
- Timestamp: {ISO datetime}
- Duration: {N}s (timeout: 180s)
- Status: success | timeout | error

### Results (if success)
- Files reviewed: (list)
- Issues found: N
  - Reuse opportunities: N
  - Quality issues: N
  - Efficiency improvements: N
- Issues auto-fixed: N
- Files modified: (list with brief change description)

### Results (if timeout or error)
- Reason: {timeout after 180s | error message}
- Action: skipped, pipeline continues
```

### Hard Checklist (Before Every Commit)

ALL 7 must be checked. No exceptions. No rationalizations.

```
[BMAD Checklist -- Story X-Y]
[ ] 1. create-story complete
[ ] 2. dev-story complete
[ ] 3. /simplify executed (success|timeout|error)
[ ] 4. TEA complete
[ ] 5. QA complete
[ ] 6. code-review complete
[ ] 7. Real functionality confirmed (not stub/mock)
```

---

## Troubleshooting

### Worker goes idle without completing a step
**Cause:** Worker finished a tool call but didn't continue to the next action.
**Fix:** Send a reminder via SendMessage: "Continue working on {step_name}. Complete the 3-round self-review and report back."
**Defense:** step_timeout (10min) + grace (2min) + auto-respawn. If stall_count > 2 for same step: SKIP.

### Worker skips self-review rounds
**Cause:** Worker reports "[Step Complete]" without creating party-logs.
**Fix:** Orchestrator auto-validates: checks party-logs/{stage}-{step}-round{1,2,3}.md exist.
**Defense:** Auto-reject up to 2 times. 3rd time: accept with warning log, continue.

### Worker context gets too long (quality degrades)
**Cause:** Document is very large (3000+ lines) or many steps in one stage.
**Fix:** Tell Worker to focus on specific line ranges. Shutdown and respawn between stages (not steps).

### Orchestrator runs out of context
**Cause:** Too many stages in one conversation.
**Fix:** Each stage has its own lifecycle (spawn -> work -> commit -> shutdown). Start a new conversation if context gets compressed too much. Check git log to see what's already committed.

### Worker reports FAIL on self-review Round 3
**Cause:** Fundamental quality issue in the section.
**Fix:** Worker automatically rewrites and redoes all 3 rounds.
**Defense:** max_retry: 2. After 2 FAILs → Worker sends "[ESCALATE]" to Orchestrator. Orchestrator logs and continues to next step. Do NOT block pipeline.

### /simplify times out or errors
**Cause:** Large changeset, network issue, or CLI problem.
**Fix:** Orchestrator skips simplify, logs warning, tells Worker to continue with TEA.
**Impact:** Minor — code-review (Stage 5) will still catch quality issues. Pipeline is never blocked.

### Worker can't call Skill tool from TeamCreate context
**Cause:** Skill tool may not be available inside spawned teammate.
**Fallback:** If Skill tool fails, Worker should execute the BMAD agent's core logic directly:
- Read the agent's .md file from `_bmad/bmm/agents/`
- Follow the workflow instructions manually
- Report the issue to Orchestrator for future pipeline improvement

---

## Absolute Rules

1. Never implement code without BMAD skills
2. Never review code without BMAD skills
3. Never skip QA/TEA stages
4. Never treat stub/mock/placeholder as "complete"
5. Never skip planning stages because "file already exists" -- always fresh
6. Never batch planning stages into one commit -- individual commits per stage
7. BMAD agents: no menus, execute immediately (YOLO)
8. Planning stages: create fresh every time (overwrite existing)
9. Worker runs in tmux (visible to user)
10. Worker stays alive for all steps within a single STAGE -- shutdown and respawn between stages
11. Orchestrator does NOT write documents or run party mode -- Worker does everything
12. Orchestrator MUST embed first task in Worker's spawn prompt -- never say "wait"
13. Worker must self-review by re-reading FROM FILE (Read tool) -- never from memory
14. Expert comments must be in character with 2-3 sentence minimum -- no one-liners
15. "Zero findings" triggers re-analysis (BMAD adversarial protocol)
16. ** max_retry: 2 per step — FAIL 3 times = ESCALATE, never infinite rewrite **
17. ** step_timeout: 10min + 2min grace — stall 3 times = SKIP step **
18. ** Party-log validation: Orchestrator MUST verify round{1,2,3}.md before accepting **
19. ** /simplify: Orchestrator executes (not Worker), 3min timeout, skip on failure **
20. ** Pipeline never blocks — timeout/fail/escalate always leads to "continue" **
