---
name: 'kdh-full-auto-pipeline'
description: 'BMAD Full Pipeline (portable). planning(brief->PRD->arch->UX->epics, single-worker party mode) or story dev(create->dev->TEA->QA->CR). Usage: /kdh-full-auto-pipeline [planning|story-ID]'
---

# Kodonghui Full Pipeline v3

Portable BMAD planning + dev pipeline with single-worker party mode.
Works with any BMAD project. Copy to `.claude/commands/` to use.

## Mode Selection

- `planning` or no args: Planning pipeline (brief -> PRD -> architecture -> UX -> epics -> readiness -> sprint)
- Story ID (e.g. `3-1`): Story dev pipeline (create-story -> dev -> TEA -> QA -> CR)

---

## Single-Worker Party Mode (Core Mechanism)

### v3: Why Single Worker?

Previous v2 used Writer + Reviewer (2 teammates) who ping-ponged via SendMessage.
This caused intermittent deadlocks because SendMessage handoffs are unreliable:
- Teammates sometimes go idle without sending feedback
- Log file writes succeed but SendMessage gets skipped
- 8 handoffs per step = 8 potential failure points

**v3 uses 1 Worker** who does everything: write, self-review (3 rounds), fix, report.
- Only 2 handoffs per step: Orchestrator -> Worker, Worker -> Orchestrator
- Worker runs in tmux -- user watches everything in real time
- Same review quality (same Claude model, same prompts, same 7-expert roleplay)

### Flow

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
  5. SendMessage to Orchestrator: "[Step Complete]" report

[Step Complete]
Orchestrator receives report -> sends next step instruction
After all steps in stage -> Orchestrator commits
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

## Report Format (to team-lead after all 3 rounds pass)
[Step Complete] {stage_name} - {step_name}
Content summary: (1-2 lines)
Party mode: 3 rounds passed (issues fixed: N)
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

Step 1: Stage Loop (for each stage)
  1a. Spawn fresh Worker for this stage
      -> mode=bypassPermissions
      -> Include in prompt: stage context, agent manifest, reference file paths
      -> CRITICAL: Embed FIRST step instruction directly in spawn prompt
      -> Never tell Worker to "wait" -- always give immediate work
  1b. Worker writes step -> self-reviews 3 rounds -> reports to Orchestrator
  1c. Orchestrator receives "[Step Complete]" -> sends next step via SendMessage
  1d. If Worker goes idle without report: send reminder via SendMessage
  1e. Repeat 1b-1d for all steps in stage
  1f. After all steps complete:
      -> git commit: docs(planning): {stage} complete -- {N} party rounds
      -> Shutdown Worker (shutdown_request)
  1g. Go to 1a for next stage (spawn fresh Worker)

Step 2: Final Verification
  -> Count total party rounds from party-logs
  -> Verify individual commits: git log --oneline

Step 3: Done
  -> "Planning complete! /kdh-full-auto-pipeline [first-story-ID]"
```

### What the Orchestrator Actually Does

1. **Per stage: spawn fresh Worker** (shutdown old, spawn new -- prevents context bloat)
2. **Embed first step in spawn prompt** (critical -- never say "wait")
3. **Send subsequent steps via SendMessage** (one at a time, after "[Step Complete]")
4. **Monitor for stalls** -- if idle without report, send reminder
5. **Commit after each stage** (all steps in stage passed)
6. **Shutdown + respawn between stages**

The Orchestrator does NOT:
- Write or edit documents (Worker does it)
- Run party mode (Worker self-reviews)
- Decide PASS/FAIL (Worker's self-review decides)

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

#### Stage 1: Product Brief
Skill: `bmad-bmm-create-product-brief`
| Step | Party Rounds |
|------|-------------|
| step-02-vision | 3 |
| step-03-users | 3 |
| step-04-metrics | 3 |
| step-05-scope | 3 |
Commit: `docs(planning): Brief complete -- {N} party rounds`

#### Stage 2: PRD
Skill: `bmad-bmm-create-prd`
| Step | Party Rounds |
|------|-------------|
| step-02-discovery | 3 |
| step-02b-vision | 3 |
| step-02c-executive-summary | 3 |
| step-03-success | 3 |
| step-04-journeys | 3 |
| step-05-domain | 3 |
| step-06-innovation | 3 |
| step-07-project-type | 3 |
| step-08-scoping | 3 |
| step-09-functional | 3 |
| step-10-nonfunctional | 3 |
Commit: `docs(planning): PRD complete -- {N} party rounds`

#### Stage 3: Architecture
Skill: `bmad-bmm-create-architecture`
| Step | Party Rounds |
|------|-------------|
| step-02-context | 3 |
| step-03-starter | 3 |
| step-04-decisions | 3 |
| step-05-patterns | 3 |
| step-06-structure | 3 |
| step-07-validation | 3 |
Commit: `docs(planning): Architecture complete -- {N} party rounds`

#### Stage 4: UX Design
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

#### Stage 5: Epics & Stories
Skill: `bmad-bmm-create-epics-and-stories`
| Step | Party Rounds |
|------|-------------|
| step-02-design-epics | 3 |
| step-03-create-stories | 3 |
| step-04-final-validation | 3 |
Commit: `docs(planning): Epics complete -- {N} party rounds`

#### Stage 6: Implementation Readiness
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

#### Stage 7: Sprint Planning
Skill: `bmad-bmm-sprint-planning`
No party mode (just generates sprint-status.yaml).
Commit: `docs(planning): Sprint planning complete`

**Total: ~42 steps x 3 rounds = ~126 party rounds**

---

## Mode B: Story Dev Pipeline (Story ID)

### Target Selection
- If arg given: that story ID (e.g. `3-1`)
- If no arg: first `backlog` story from sprint-status.yaml

### Orchestrator Execution Flow

```
Step 0: Team Setup
  -> TeamCreate (team: bmad-pipeline)

Step 1: Spawn Developer
  -> Agent tool with Developer prompt (see below)
  -> CRITICAL: Embed story ID and all 5 stages in spawn prompt
  -> Developer runs 5 stages autonomously

Step 2: Wait & Verify
  -> Receive checklist report via SendMessage
  -> Verify 6/6 checks

Step 3: Commit + Push
  -> Commit message: feat: Story [ID] [title] -- [summary] + TEA [N] tests
  -> Update sprint-status.yaml to done

Step 4: Next Story
  -> More stories in epic? -> notify user
  -> Last story? -> suggest retrospective
```

### Developer Agent Prompt

```
You are a BMAD pipeline executor. Run these 5 stages IN ORDER using the Skill tool.
YOLO mode -- auto-proceed through all prompts, never wait for user input.

IMPORTANT: Real working features only. No stub/mock/placeholder.

Target story: [Story ID]

### Stage 1: create-story
Skill: skill="bmad-bmm-create-story", args="[Story ID]"
- Skip if story file already exists

### Stage 2: dev-story
Skill: skill="bmad-bmm-dev-story", args="[story file path]"
- No stubs/mocks -- real working code only

### Stage 3: TEA
Skill: skill="bmad-tea-automate"
- Risk-based tests for changed/added code

### Stage 4: QA
Skill: skill="bmad-agent-bmm-qa"
- No menu -- execute immediately
- Verify functionality + edge cases

### Stage 5: code-review
Skill: skill="bmad-bmm-code-review"
- Auto-fix issues found (one pass)

### After Completion
Report to Orchestrator via SendMessage:

[BMAD Checklist -- Story [Story ID]]
[x] 1. create-story complete
[x] 2. dev-story complete
[x] 3. TEA complete
[x] 4. QA complete
[x] 5. code-review complete
[x] 6. Real functionality confirmed (not stub/mock)

Summary: (what was implemented)
Tests: (number generated)
Issues: (found/fixed in code-review)
```

### Hard Checklist (Before Every Commit)

ALL 6 must be checked. No exceptions. No rationalizations.

```
[BMAD Checklist -- Story X-Y]
[ ] 1. create-story complete
[ ] 2. dev-story complete
[ ] 3. TEA complete
[ ] 4. QA complete
[ ] 5. code-review complete
[ ] 6. Real functionality confirmed (not stub/mock)
```

---

## Troubleshooting

### Worker goes idle without completing a step
**Cause:** Worker finished a tool call but didn't continue to the next action.
**Fix:** Send a reminder via SendMessage: "Continue working on {step_name}. Complete the 3-round self-review and report back."
If still stuck after 2 reminders, shutdown Worker and respawn with the task re-embedded in the spawn prompt.

### Worker skips self-review rounds
**Cause:** Worker reports "[Step Complete]" without creating party-logs.
**Fix:** Reject the report: "Party logs missing for {step_name}. Redo the 3-round self-review and save logs to _bmad-output/party-logs/."

### Worker context gets too long (quality degrades)
**Cause:** Document is very large (3000+ lines) or many steps in one stage.
**Fix:** Tell Worker to focus on specific line ranges. Shutdown and respawn between stages (not steps).

### Orchestrator runs out of context
**Cause:** Too many stages in one conversation.
**Fix:** Each stage has its own lifecycle (spawn -> work -> commit -> shutdown). Start a new conversation if context gets compressed too much. Check git log to see what's already committed.

### Worker reports FAIL on self-review Round 3
**Cause:** Fundamental quality issue in the section.
**Fix:** Worker should automatically rewrite and redo all 3 rounds. If it fails twice, Orchestrator should review the section manually.

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
