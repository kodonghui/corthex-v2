# CLAUDE.md -- CORTHEX v2

## User Info
- Non-developer. No dev jargon. Explain simply and in detail.
- Always use formal Korean (jondenmal)

## Deploy Rules
- Auto commit + push on completion (never ask)
- main push -> GitHub Actions auto deploy -> Cloudflare cache purge
- Post-commit deploy report: build number(#N) + changes + where to verify, in table format

## v1 Feature Spec (Top Priority Reference)
- Path: `_bmad-output/planning-artifacts/v1-feature-spec.md`
- Contains ALL features that **actually worked** in v1
- **Reference this document at every planning/design/implementation stage**
- Core principle: "If it worked in v1, it MUST work in v2"
- Build REAL working features, not CRUD pages or stubs

## BMAD Workflow Rules (Absolute Rules -- violation = entire work deleted)

### Planning Pipeline (brief -> PRD -> architecture -> UX -> epics)
Run with `/bmad-full-pipeline planning`. Party mode required at every internal step.

### Party Mode Rule: Step-by-Step (MANDATORY)
- Each planning stage has internal steps (e.g., Brief has vision, users, metrics, scope)
- **After EACH internal step**: run party mode **minimum 3 times**
- Party mode runs in YOLO mode (auto-proceed, no menus, no waiting)
- Party mode MUST verify:
  1. Does this step cover relevant v1 features from v1-feature-spec.md?
  2. Is it real working functionality, not CRUD shells or stubs?
  3. Is there a concrete implementation plan, not mock/placeholder?
- If any answer is "no" -> fix document -> party mode continues
- Expected total: ~126 party modes across full planning pipeline

### Party Mode Evidence Rules (MANDATORY -- no evidence = not done)
Party mode execution MUST leave verifiable evidence. Without evidence, it is treated as NOT executed.

**1. Log files per party mode round:**
- Path: `_bmad-output/party-logs/{stage}-step{N}-round{M}.md`
- Example: `_bmad-output/party-logs/brief-step02-round1.md`
- Required content in each log:
  - Timestamp
  - Step name and document section being reviewed
  - **Actual quotes from the document** (minimum 3 lines quoted)
  - Each agent's specific feedback (what they said, not "approved")
  - v1-feature-spec.md checklist items verified
  - Changes made (before/after diff, or "no changes needed" with justification)
  - Consensus result (pass/fail + remaining objections)

**2. Incremental commits (timestamp evidence):**
- After completing each planning STAGE (not step): commit document + party logs
- Commit message format: `docs(planning): {stage} complete -- {N} party modes, {summary}`
- Example: `docs(planning): Brief complete -- 12 party modes, v1 coverage 16/16`
- This creates git timestamp gaps that prove real execution time
- **FORBIDDEN**: committing all stages in a single commit

**3. Document-embedded summary:**
- At the end of each major section in the planning document, append:
  ```
  <!-- Party Mode: {N} rounds, consensus reached, key feedback: {1-line summary} -->
  ```

### Planning Pipeline: Always Recreate (MANDATORY)
- Planning pipeline MUST create ALL documents fresh, even if files already exist
- Existing planning artifacts are OVERWRITTEN, never reused or skipped
- "File already exists" is NOT a reason to skip -- the whole point is to redo them
- This prevents reusing stale documents from previous pipelines

### Story Dev Required Order (ALL steps via BMAD skills, no exceptions)
Every story must execute these 5 steps **via BMAD skills only**. No direct implementation/review/testing.

1. **create-story**: `bmad-bmm-create-story` skill -> story file
2. **dev-story**: `bmad-bmm-dev-story` skill -> implementation (**no stubs, real working code**)
3. **TEA automate**: `bmad-tea-automate` skill -> risk-based test generation
4. **QA verification**: `bmad-agent-bmm-qa` agent -> feature + edge case verification
5. **code-review**: `bmad-bmm-code-review` skill -> code review (auto-fix issues)

### On Epic Completion
- Run `bmad-bmm-retrospective` skill (mandatory)

### BMAD Agent Auto-Execution Rules
- BMAD agents (QA etc.): **NO menu display, execute immediately**
- QA agent -> skip menu, run [QA] Automate directly
- Never wait for user input in agents -- auto-proceed
- All confirmation/selection prompts in BMAD workflow: auto-proceed (YOLO mode)

### Orchestrator Protocol (TeamCreate Delegation)
Main conversation = **orchestrator (team leader)**. Actual work = **team members via TeamCreate**.
Team members run in tmux split panes so user can observe in real-time.

**Execution:**
1. `TeamCreate` to create team
2. `TaskCreate` to register story tasks
3. `Agent`(team_name) to create member -> instruct full BMAD 5-step pipeline
4. Member executes serially: create-story -> dev -> TEA -> QA -> CR (visible in tmux)
5. Orchestrator waits -- on completion report, verify checklist -> commit+push
6. Next story

**Team member prompt MUST include:**
- BMAD 5-step skill names + args + execution order
- YOLO mode (auto-proceed all prompts)
- QA agent: no menu, execute immediately
- code-review: auto-fix on issues
- **v1-feature-spec.md reference** (check how feature worked in v1)
- **No stubs -- real working code only**
- On completion: SendMessage report to orchestrator

**Epic-level operation:**
- Process stories sequentially within epic (dependencies)
- Delegate retrospective to team member after epic completion
- Start new conversation if context gets long

### Pre-Commit Hard Checklist
Before EVERY story commit, print these 6 items. ALL must be checked to commit:
```
[BMAD Checklist -- Story X-Y]
[ ] 1. create-story done (team agent or skill)
[ ] 2. dev-story done (team agent or skill)
[ ] 3. TEA done (team agent or skill)
[ ] 4. QA done (team agent or skill)
[ ] 5. code-review done (team agent or skill)
[ ] 6. Real functionality confirmed (not stub/mock)
```
- Any unchecked = no commit. Run missing step first.
- No rationalizing: "good enough", "TEA caught bugs so skip QA", etc.

### Absolutely Forbidden
- Implementing code without BMAD skills
- Code reviewing without BMAD skills
- Skipping QA/TEA steps
- Skipping this order under ANY circumstance (YOLO, context compression, "hurry", "going to sleep")
- Deciding "I already know the content so I don't need the skill"
- Showing BMAD agent menus and asking user to choose
- **Treating stub/mock as "implementation complete"** -- only real working code counts
- **Skipping planning stages because "file already exists"** -- always recreate
- **Committing all planning stages in a single commit** -- one commit per stage minimum
- **Claiming party mode was done without log files in `_bmad-output/party-logs/`**

### General Rules
- For new features/projects: follow `_bmad-output/BMAD-WORKFLOW.md` stages

### Party Mode Execution Rules (Critical)
- ALL planning steps require party mode (per-step, minimum 3 times each)
- Party mode repeats **until consensus**:
  - Agents raise concerns -> fix document -> next party mode
  - Continue until all agents agree to proceed or no major objections remain
  - Consensus = 0 major objections, remaining items classified as "minor"
- Attempting to skip party mode -> warning + run party mode first
- **v1-feature-spec.md checklist verification mandatory in every party mode**
- **No log file in `_bmad-output/party-logs/` = party mode not executed = violation**

## Work Efficiency
- BMAD pipeline MUST be delegated to **TeamCreate team members** (visible in tmux)
- Independent research/exploration can use Agent tool (subagents), but dev work = team members first
- Orchestrator sleeps while waiting for team member, wakes on completion report

## Coding Conventions
- Filenames: kebab-case lowercase
- Import paths must match actual casing from `git ls-files` (Linux CI is case-sensitive)
