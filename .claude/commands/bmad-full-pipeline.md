---
name: 'full-pipeline'
description: 'BMAD full pipeline. planning(brief->PRD->arch->UX->epics, step-by-step party mode) or story dev(create->dev->TEA->QA->CR). Usage: /bmad-full-pipeline [planning|story-ID]'
---

# BMAD Full Pipeline

planning mode or story dev mode.

## Mode

- `planning` or no args: planning pipeline (brief -> PRD -> architecture -> UX -> epics)
- story ID (e.g. `19-1`): story dev pipeline (create-story -> dev -> TEA -> QA -> CR)

---

## Mode A: Planning Pipeline (planning)

### Orchestrator Role
- Team leader. Directs only, does NOT execute.
- TeamCreate -> TaskCreate -> Agent(team member) delegates everything
- Receives completion reports, verifies checklist, commits+pushes

### Step 0: Team Setup
1. `TeamCreate` team name: `bmad-planning`
2. `TaskCreate` register planning task

### Step 1: Delegate Full Planning Pipeline to Team Member
`Agent` tool to create team member. Pass the prompt below **exactly**:

```
You are a BMAD planning pipeline executor.
Execute ALL steps below **in order, without skipping any**.
YOLO mode on all steps -- auto-proceed on every confirmation prompt, never wait for user input.

## Required Input Documents (READ FIRST)
_bmad-output/planning-artifacts/v1-feature-spec.md -- v1 feature spec with all actually-working features.
Every step and every party-mode must verify: nothing from v1 is missing, no stubs, real working features only.

## Core Rule: Step-by-Step Party Mode (MANDATORY)
After EACH internal step of each planning stage, run party mode (Skill: skill="bmad-party-mode") MINIMUM 3 TIMES.
- Party mode runs in YOLO mode (auto-proceed, no menus, no waiting)
- Each party mode must verify:
  1. Does this step's output cover all relevant v1 features from v1-feature-spec.md?
  2. Is it real working functionality, not CRUD shells or stubs?
  3. Is there a concrete implementation plan, not mock/placeholder?
- If party mode finds issues -> fix immediately -> continue to next party mode
- All 3 party modes must pass before moving to next step

## Core Rule: Party Mode Evidence (MANDATORY -- no log = violation)
Each party mode round MUST produce a log file:
- Path: `_bmad-output/party-logs/{stage}-step{N}-round{M}.md`
- Example: `_bmad-output/party-logs/prd-step09-round2.md`
- Log MUST contain:
  1. Timestamp
  2. Step name + document section being reviewed
  3. **Actual quotes from the document** (minimum 3 lines)
  4. Each agent's specific feedback (name + what they said)
  5. v1-feature-spec.md items checked in this round
  6. Changes made (before/after diff, or "none needed" with reason)
  7. Consensus result (pass/fail)
- Without this log file, the party mode is treated as NOT executed.

## Core Rule: Always Recreate Documents (MANDATORY)
- ALL planning documents MUST be created fresh. NEVER skip because "file already exists".
- Existing files are OVERWRITTEN. The purpose of this pipeline is to redo everything.
- "Skip if already exists" only applies to story files in Mode B, NEVER to planning docs.

## Core Rule: Incremental Commits (MANDATORY)
- After each planning STAGE completes (with all its party mode logs), commit immediately.
- Do NOT wait until the end to commit everything at once.
- Commit format: `docs(planning): {stage} complete -- {N} party modes`
- This creates verifiable git timestamp evidence of real execution.

## Execution Order

### 1. Product Brief
Skill: skill="bmad-bmm-create-product-brief"
IMPORTANT: Create fresh even if file exists. Overwrite previous version.
Internal steps (each followed by 3x party mode + log file each):
- step-02-vision -> party mode x3 -> logs: brief-step02-round{1,2,3}.md
- step-03-users -> party mode x3 -> logs: brief-step03-round{1,2,3}.md
- step-04-metrics -> party mode x3 -> logs: brief-step04-round{1,2,3}.md
- step-05-scope -> party mode x3 -> logs: brief-step05-round{1,2,3}.md
Total: 12 party modes minimum, 12 log files
After completion: git commit (Brief + 12 log files)

### 2. PRD
Skill: skill="bmad-bmm-create-prd"
IMPORTANT: Create fresh even if file exists. Overwrite previous version.
Internal steps (each followed by 3x party mode + log file each):
- step-02-discovery -> party mode x3 -> logs: prd-step02-round{1,2,3}.md
- step-02b-vision -> party mode x3 -> logs: prd-step02b-round{1,2,3}.md
- step-02c-executive-summary -> party mode x3 -> logs: prd-step02c-round{1,2,3}.md
- step-03-success -> party mode x3 -> logs: prd-step03-round{1,2,3}.md
- step-04-journeys -> party mode x3 -> logs: prd-step04-round{1,2,3}.md
- step-05-domain -> party mode x3 -> logs: prd-step05-round{1,2,3}.md
- step-06-innovation -> party mode x3 -> logs: prd-step06-round{1,2,3}.md
- step-07-project-type -> party mode x3 -> logs: prd-step07-round{1,2,3}.md
- step-08-scoping -> party mode x3 -> logs: prd-step08-round{1,2,3}.md
- step-09-functional -> party mode x3 -> logs: prd-step09-round{1,2,3}.md
- step-10-nonfunctional -> party mode x3 -> logs: prd-step10-round{1,2,3}.md
Total: 33 party modes minimum, 33 log files
Verify: ALL v1 features are in functional requirements
After completion: git commit (PRD + 33 log files)

### 3. Architecture
Skill: skill="bmad-bmm-create-architecture"
IMPORTANT: Create fresh even if file exists. Overwrite previous version.
Internal steps (each followed by 3x party mode + log file each):
- step-02-context -> party mode x3 -> logs: arch-step02-round{1,2,3}.md
- step-03-starter -> party mode x3 -> logs: arch-step03-round{1,2,3}.md
- step-04-decisions -> party mode x3 -> logs: arch-step04-round{1,2,3}.md
- step-05-patterns -> party mode x3 -> logs: arch-step05-round{1,2,3}.md
- step-06-structure -> party mode x3 -> logs: arch-step06-round{1,2,3}.md
- step-07-validation -> party mode x3 -> logs: arch-step07-round{1,2,3}.md
Total: 18 party modes minimum, 18 log files
Verify: orchestration, tool system, LLM router, memory architecture present
After completion: git commit (Architecture + 18 log files)

### 4. UX Design
Skill: skill="bmad-bmm-create-ux-design"
IMPORTANT: Create fresh even if file exists. Overwrite previous version. NEVER skip this step.
Internal steps (each followed by 3x party mode + log file each):
- step-02-discovery -> party mode x3 -> logs: ux-step02-round{1,2,3}.md
- step-03-core-experience -> party mode x3 -> logs: ux-step03-round{1,2,3}.md
- step-04-emotional-response -> party mode x3 -> logs: ux-step04-round{1,2,3}.md
- step-05-inspiration -> party mode x3 -> logs: ux-step05-round{1,2,3}.md
- step-06-design-system -> party mode x3 -> logs: ux-step06-round{1,2,3}.md
- step-07-defining-experience -> party mode x3 -> logs: ux-step07-round{1,2,3}.md
- step-08-visual-foundation -> party mode x3 -> logs: ux-step08-round{1,2,3}.md
- step-09-design-directions -> party mode x3 -> logs: ux-step09-round{1,2,3}.md
- step-10-user-journeys -> party mode x3 -> logs: ux-step10-round{1,2,3}.md
- step-11-component-strategy -> party mode x3 -> logs: ux-step11-round{1,2,3}.md
- step-12-ux-patterns -> party mode x3 -> logs: ux-step12-round{1,2,3}.md
- step-13-responsive-accessibility -> party mode x3 -> logs: ux-step13-round{1,2,3}.md
Total: 36 party modes minimum, 36 log files
After completion: git commit (UX + 36 log files)

### 5. Epics & Stories
Skill: skill="bmad-bmm-create-epics-and-stories"
IMPORTANT: Create fresh even if file exists. Overwrite previous version.
Internal steps (each followed by 3x party mode + log file each):
- step-02-design-epics -> party mode x3 -> logs: epics-step02-round{1,2,3}.md
- step-03-create-stories -> party mode x3 -> logs: epics-step03-round{1,2,3}.md
- step-04-final-validation -> party mode x3 -> logs: epics-step04-round{1,2,3}.md
Total: 9 party modes minimum, 9 log files
Verify: epics organized by core features, not CRUD lists
After completion: git commit (Epics + 9 log files)

### 6. Implementation Readiness Check
Skill: skill="bmad-bmm-check-implementation-readiness"
IMPORTANT: Create fresh even if file exists. Overwrite previous version.
Internal steps (each followed by 3x party mode + log file each):
- step-01-document-discovery -> party mode x3 -> logs: readiness-step01-round{1,2,3}.md
- step-02-prd-analysis -> party mode x3 -> logs: readiness-step02-round{1,2,3}.md
- step-03-epic-coverage-validation -> party mode x3 -> logs: readiness-step03-round{1,2,3}.md
- step-04-ux-alignment -> party mode x3 -> logs: readiness-step04-round{1,2,3}.md
- step-05-epic-quality-review -> party mode x3 -> logs: readiness-step05-round{1,2,3}.md
- step-06-final-assessment -> party mode x3 -> logs: readiness-step06-round{1,2,3}.md
Total: 18 party modes minimum, 18 log files
After completion: git commit (Readiness + 18 log files)

### 7. Sprint Planning
Skill: skill="bmad-bmm-sprint-planning"
-> sprint-status.yaml generated
After completion: git commit (sprint-status.yaml)

### Completion Report
SendMessage to orchestrator:

[Planning Pipeline Complete]
[x] 1. Product Brief done + party mode per step (12+) + committed
[x] 2. PRD done + party mode per step (33+) + committed
[x] 3. Architecture done + party mode per step (18+) + committed
[x] 4. UX Design done + party mode per step (36+) + committed
[x] 5. Epics & Stories done + party mode per step (9+) + committed
[x] 6. Readiness Check done + party mode per step (18+) + committed
[x] 7. Sprint Planning done + committed

v1 feature coverage: (N/N items from v1 checklist covered)
Epic count: N
Story count: N
Total party modes executed: ~126+
Party log files created: ~126 files in _bmad-output/party-logs/
Commits created: 7 (one per stage)
Key findings from party modes: (1-3 line summary)
```

### Step 2: Wait and Verify
- Wait for team member completion
- Receive final report
- Verify checklist 7/7
- Verify v1 feature coverage
- **Verify party log files exist**: `ls _bmad-output/party-logs/ | wc -l` should be ~126
- **Verify separate commits**: `git log --oneline` should show 7 planning commits

### Step 4: Dev Guidance
- "Planning complete! Start dev with `/bmad-full-pipeline [first story ID]`"

---

## Mode B: Story Dev Pipeline (story ID)

### Step 0: Team Setup
1. `TeamCreate` team name: `bmad-pipeline`
2. `TaskCreate` register story task

### Step 1: Delegate 5-Step Pipeline to Team Member
`Agent` tool to create team member. Pass the prompt below **exactly**:

```
You are a BMAD pipeline executor. Execute ALL 5 steps below **in order, without skipping any**.
YOLO mode on all steps -- auto-proceed on every confirmation prompt, never wait for user input.

IMPORTANT: This story must produce REAL WORKING functionality, not CRUD pages or stubs.
Reference v1 feature spec (_bmad-output/planning-artifacts/v1-feature-spec.md) to verify
how the feature worked in v1, and implement at the same level in v2.

Target story: [story ID]

### Step 1: create-story
Skill: skill="bmad-bmm-create-story", args="[story ID]"
- Skip if story file already exists

### Step 2: dev-story
Skill: skill="bmad-bmm-dev-story", args="[story file path]"
- Complete implementation
- NO stubs/mocks -- real working code only

### Step 3: TEA (Test Architect)
Skill: skill="bmad-tea-automate"
- Risk-based test generation for changed/added code

### Step 4: QA
Skill: skill="bmad-agent-bmm-qa"
- NO menu display -- execute immediately
- Feature verification + edge case check
- Verify "actually works" (stub APIs = fail)

### Step 5: code-review
Skill: skill="bmad-bmm-code-review"
- Auto-fix any issues found
- One round of auto-fix is sufficient

### Completion Report
SendMessage to orchestrator:

[BMAD Checklist -- Story [story ID]]
[x] 1. create-story done
[x] 2. dev-story done
[x] 3. TEA done
[x] 4. QA done
[x] 5. code-review done

Summary: (what was implemented, 1-2 lines)
Tests: (number of tests generated)
Issues: (issues found/fixed in code-review)
Real functionality: (confirm not stub)
```

### Step 2: Wait and Verify
- Wait for team member completion
- Receive checklist report
- Verify 5/5 checked + real functionality confirmed

### Step 3: Commit + Push
- Message: `feat: Story [ID] [title] -- [summary] + TEA [N] tests`
- Update sprint-status.yaml
- Output deploy report table

### Step 4: Next Story
- If more stories in same epic -> notify user
- If last story in epic -> "Epic complete! Run `/bmad-bmm-retrospective`?"
