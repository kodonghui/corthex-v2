---
name: 'kdh-full-auto-pipeline'
description: 'Universal Full Pipeline v8.0 — works on ANY project. Auto-detects structure, BMAD optional, UI E2E verification. Usage: /kdh-full-auto-pipeline [planning|story-ID|parallel ID1 ID2...|swarm epic-N|uxui-redesign]'
---

# Universal Full Pipeline v8.0

## Mode Selection

- `planning` or no args: Planning pipeline — 4-agent real party (Writer + 3 Critics)
- Story ID (e.g. `3-1`): Single story dev — create → dev → simplify → TEA → QA → CR
- `parallel story-ID1 story-ID2 ...`: Parallel story dev — Git Worktrees, max 3 simultaneous
- `swarm epic-N`: Swarm auto-epic — all stories as tasks, 3 self-organizing workers

---

## Step 0 (ALL Modes): Project Auto-Scan

Run this BEFORE any other step. Results are cached in `project-context.yaml` at project root.

```
1. Read package.json → detect:
   - Package manager: check for bun.lockb (bun), pnpm-lock.yaml (pnpm), yarn.lock (yarn), else npm
   - Project name, version, scripts (dev, build, test, lint)

2. Find ALL tsconfig.json files:
   - glob("**/tsconfig.json", ignore node_modules)
   - If monorepo: find the root tsconfig AND each package tsconfig
   - Build tsc command list: ["npx tsc --noEmit -p {path}" for each tsconfig]
   - If zero found: tsc_enabled = false

3. Detect monorepo structure:
   - turbo.json → Turborepo
   - pnpm-workspace.yaml → pnpm workspace
   - lerna.json → Lerna
   - workspaces in package.json → npm/yarn workspaces
   - None found → single-package project

4. Find test runner config:
   - vitest.config.* → "npx vitest run"
   - jest.config.* or jest in package.json → "npx jest"
   - "bun:test" in files → "bun test"
   - playwright.config.* → playwright_enabled = true
   - cypress.config.* → cypress_enabled = true
   - None found → test_enabled = false

5. Detect BMAD:
   - Check if _bmad/ directory exists → bmad_enabled = true/false
   - If true: locate workflow dirs, skill files, templates
   - If false: use simplified workflow (see "Non-BMAD Workflow" section)

6. Detect UI framework:
   - Check for: React (react-dom), Vue, Svelte, Angular, Next.js, Nuxt, Remix, Astro
   - Find dev server command from package.json scripts
   - Check for Playwright config → vrt_enabled = true/false
   - Check for Tailwind/CSS framework config

7. Detect architecture docs (any of these):
   - _bmad-output/planning-artifacts/architecture.md
   - docs/architecture.md, docs/ARCHITECTURE.md
   - ARCHITECTURE.md at root
   - Any file matching **/architecture*.md
   - Store path or null

8. Detect existing feature spec (any of these):
   - _bmad-output/planning-artifacts/*feature-spec*
   - docs/*feature-spec*, docs/*features*
   - Any file matching **/*feature-spec*.md
   - Store path or null (used as reference, not required)

9. Detect existing PRD (any of these):
   - _bmad-output/planning-artifacts/prd.md
   - docs/prd.md, docs/PRD.md
   - Any file matching **/prd*.md
   - Store path or null

10. Save results to project-context.yaml:
    package_manager: bun|npm|pnpm|yarn
    monorepo: {type: turborepo|pnpm|lerna|npm|yarn|none, packages: [...]}
    tsc: {enabled: true|false, commands: [...]}
    test: {enabled: true|false, command: "...", runner: vitest|jest|bun}
    playwright: {enabled: true|false, config_path: "..."}
    bmad: {enabled: true|false, path: "..."}
    ui: {framework: react|vue|..., dev_command: "...", css: tailwind|...}
    docs: {architecture: "path"|null, feature_spec: "path"|null, prd: "path"|null}
```

If `project-context.yaml` already exists and is < 1 hour old, skip re-scan (use cached).

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
| Architecture (Decisions, Patterns) | sonnet | **all opus** | Architecture decisions = project direction |
| Epics (Design) | sonnet | **Critic-A=opus** | Epic scope/dependencies = architecture judgment |
| Security Audit stories | **opus** | N/A | Subtle vulnerability detection |
| All others | sonnet | sonnet | Sonnet sufficient |

---

## Anti-Patterns (top 3 — production failures)

1. **Writer calls Skill tool** — Skill auto-completes all steps internally, bypasses critic review. FIX: Planning Writer MUST NEVER use Skill tool. Read step files with Read tool, write manually.
2. **Writer batches all steps** — Writes steps 2-6 then sends one review. FIX: Write ONE step → SendMessage → WAIT for ALL 3 critics → fix → verify → THEN next step.
3. **Shutdown-then-cancel race** — shutdown_request is irreversible once processed. FIX: NEVER send shutdown_request unless 100% committed. Use regular message for questions.

Additional safeguards:
- TeamDelete fails after tmux kill → `rm -rf ~/.claude/teams/{name} ~/.claude/tasks/{name}`, retry
- Shutdown stall → 30s timeout → `tmux kill-pane` → force cleanup
- Context compaction → PostCompact hook auto-saves working-state.md + git commit
- Swarm workers skip skills → Orchestrator verifies story file + skill report before accepting
- Stale resources → auto-clean stale worktrees + cleanup.sh handles tmux/sessions

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
- Focus: boundary violations, architecture consistency, API contracts, scalability

**Critic-B (QA + Security):**
- Quinn (QA): "What happens when X is null/empty/concurrent?" — Coverage-first. Dana (Security): "That credential is in plaintext." — Paranoid.
- Focus: Test coverage, edge cases, security patterns, secret exposure

**Critic-C (Product + Delivery):**
- John (PM): "WHY should the user care?" — Relentless detective. Bob (SM): "This scope is unrealistic." — Checklist-driven.
- Focus: User value, scope creep, delivery risk, existing feature parity

---

## Writer Prompt Template (Planning Mode)

```
You are a planning document WRITER in team "{team_name}".
Model: sonnet. YOLO mode — auto-proceed, never wait for user input.

## PROHIBITION: NEVER use the Skill tool for planning documents.
Skill tool runs complete workflows internally, bypassing critic review.

## Role
Write document sections. Fix based on critic feedback. Do NOT self-review.

## How to Write
1. Receive step instruction from Orchestrator (includes STEP FILE PATH)
2. Read step file with Read tool → extract content template
3. Read references: project-context.yaml + any docs listed there (architecture, feature spec, PRD, context-snapshots)
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
- No stubs/mocks. Output Quality: specific file paths, exact values. "Vague" = FAIL.
```

## Critic Prompt Template (all 3 share this structure)

```
You are CRITIC-{X} in team "{team_name}". Model: sonnet. YOLO mode.
Personas: {persona_1} + {persona_2} (see Critic Personas section).
Focus: {focus_areas}

## Workflow
1. WAIT for Writer's [Review Request]
2. Read section FROM FILE (path in message) — never from message text
3. Cross-check against architecture docs / PRD / feature spec (paths from project-context.yaml)
4. Review in character (2-3 sentences each persona, minimum)
5. Find minimum 2 issues (zero findings = re-analyze)
6. Write review to party-logs/{stage}-{step}-critic-{x}.md
7. SendMessage to other 2 critics with findings summary (1 round cross-talk)
8. SendMessage to Writer: "[Feedback] {N} issues. Priority: [top 3]"
9. WAIT for [Fixes Applied] → re-read FROM FILE → verify
10. SendMessage to Writer: "[Verified] score {X}/10" or "[Issues Remaining] [list]"

## Rules
- ALWAYS read FROM FILE. Zero findings = re-analyze. "Vague" = re-analyze.
- All issues must cite specific paths or exact values.
```

---

## Mode A: Planning Pipeline

### Orchestrator Flow

```
Step 0: Project Auto-Scan (see above) → load project-context.yaml
Step 1: TeamCreate (pipeline-planning) + create context-snapshots/ dir
Step 2: Spawn Writer + 3 Critics (mode=bypassPermissions)
  - Writer: include stage context + refs from project-context.yaml + prior snapshots + FIRST step instruction
  - Critics: "WAIT for Writer's [Review Request]"
Step 3: Step Loop — for each step in stage:
  - Send "[Step Instruction] {step}. Step file: {path}. Output: {doc}. References: {refs}"
  - Party mode runs (Writer↔Critics)
  - On [Step Complete]: validate 4 party-log files exist → ACCEPT or REJECT
  - Timeout: 20min + 2min grace → respawn with snapshots. 3 stalls → SKIP.
Step 4: git commit: "docs(planning): {stage} complete -- {N} steps, team-party"
Step 5: Shutdown ALL → TeamDelete → TeamCreate fresh team with all snapshots → next stage
Step 6: Final report
```

### Planning Stages — BMAD Mode (bmad_enabled = true)

**Stage 0: PRD Spec Fix** — Worker embeds corrections, Critics verify.

**Stage 1: UX Design**
Dir: `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/`
Output: planning output directory (auto-detected or `_bmad-output/planning-artifacts/ux-design.md`)
Steps: Auto-discover from `steps/` directory, sorted by filename.

**Stage 2: Epics & Stories**
Dir: `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/`
Template: auto-discover from `templates/` directory
Output: planning output directory
Steps: Auto-discover from `steps/` directory, sorted by filename.

**Stage 3: Implementation Readiness**
Dir: `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/`
Template: auto-discover from `templates/` directory
Output: planning output directory
Steps: Auto-discover from `steps/` directory, sorted by filename.

**Stage 4: Sprint Planning** — No party mode (automated). Commit: `docs(planning): Sprint planning complete`

### Planning Stages — Non-BMAD Mode (bmad_enabled = false)

**Stage 0: Project Analysis**
- Read all existing docs (architecture, PRD, feature spec from project-context.yaml)
- Analyze codebase structure, key modules, dependencies
- Output: `docs/project-analysis.md`

**Stage 1: Requirements & Design**
- Define user journeys, functional requirements, non-functional requirements
- Output: `docs/requirements.md`

**Stage 2: Architecture Review/Creation**
- If architecture doc exists: review and update
- If not: create architecture document
- Output: `docs/architecture.md`

**Stage 3: Epic & Story Breakdown**
- Break work into epics and stories with acceptance criteria
- Output: `docs/epics-and-stories.md`

**Stage 4: Implementation Plan**
- Dependency order, sprint allocation, risk assessment
- Output: `docs/implementation-plan.md`

All non-BMAD stages still use Party Mode (Writer + 3 Critics).

---

## Mode B: Story Dev Pipeline

### Orchestrator Flow
```
Step 0: Project Auto-Scan → load project-context.yaml
Step 1: TeamCreate (pipeline-dev)
Step 2: Spawn Developer Worker (sonnet, bypassPermissions) — embed story ID + first task + project-context.yaml
Step 3: Worker reports "[dev-story complete]" → Orchestrator runs /simplify (3min, skip on fail)
Step 4: SendMessage "simplify {result}. Continue with TEA." → Worker runs TEA → QA → CR
Step 5: Verify completion checklist → tsc (if enabled) → commit + push → update status
```

### Developer Worker Prompt — BMAD Mode
```
You are a pipeline executor. Model: sonnet. YOLO mode.
IMPORTANT: Real working features only. No stub/mock/placeholder.
Target story: [Story ID]
Project context: [embed project-context.yaml]

Phase A: Create + Develop
  1. skill="bmad-bmm-create-story", args="[ID]" (skip if file exists)
  2. skill="bmad-bmm-dev-story", args="[story file path]"
  → SendMessage to team-lead: "[dev-story complete] Story [ID]" → WAIT

Phase B: Test + Review (after simplify result)
  3a. (UI VERIFICATION — only if UI files changed, see UI Verification section below)
  3b. skill="bmad-tea-automate"
  4. skill="bmad-agent-bmm-qa" (no menu, execute immediately)
  5. skill="bmad-bmm-code-review" (auto-fix)

After all: Run tsc commands from project-context.yaml (all must pass)
Report checklist (see Story Dev Completion Checklist)
```

### Developer Worker Prompt — Non-BMAD Mode
```
You are a pipeline executor. Model: sonnet. YOLO mode.
IMPORTANT: Real working features only. No stub/mock/placeholder.
Target story: [Story ID or description]
Project context: [embed project-context.yaml]

Phase A: Plan + Develop
  1. Create implementation plan:
     - Read the story/task description
     - Identify affected files, new files needed
     - List acceptance criteria
     - Save plan to docs/story-plans/{story-id}-plan.md
  2. Implement code:
     - Write real, working code (no stubs)
     - Follow existing code patterns in the project
     - Ensure all imports resolve
  → SendMessage to team-lead: "[dev-story complete] Story [ID]" → WAIT

Phase B: Test + Review (after simplify result)
  3a. (UI VERIFICATION — only if UI files changed, see UI Verification section below)
  3b. Generate and run tests:
     - Unit tests for new functions/modules
     - Integration tests for API endpoints
     - Use test runner from project-context.yaml
  4. Self-QA with critic personas:
     - Quinn (QA): edge cases, error handling, null checks
     - Dana (Security): secrets, injection, auth bypass
     - Winston (Architecture): boundary violations, coupling
     - Fix all issues found
  5. Self-code-review:
     - Check naming conventions, code duplication
     - Verify error messages are user-friendly
     - Check for TODO/FIXME/HACK comments
     - Auto-fix issues

After all: Run tsc commands from project-context.yaml (if tsc enabled, all must pass)
Report checklist (see Story Dev Completion Checklist)
```

Story snapshot saved to: `context-snapshots/stories/{story-ID}-complete.md`

---

## UI Verification (Step 3a — triggered when UI files changed)

### Detection
UI files changed = any modified/added file matching:
- `**/*.tsx`, `**/*.jsx`, `**/*.vue`, `**/*.svelte`
- `**/*.css`, `**/*.scss`, `**/*.less`
- `**/*.html` (in src/ or app/ directories)
- Route/page config files

### Full Interaction E2E

```
Step 3a.1: Start dev server
  - Use dev_command from project-context.yaml
  - Wait for server ready (poll health endpoint or stdout "ready"/"listening")
  - Timeout: 60s → WARN but continue

Step 3a.2: Identify changed pages
  - git diff --name-only → filter UI files → map to routes
  - If route mapping unclear, check router config files

Step 3a.3: Playwright screenshot of ALL changed pages
  - Navigate to each changed page route
  - Full-page screenshot → save to _qa-e2e/screenshots/{story-id}/{page-name}.png
  - Compare with baseline if exists (visual regression)

Step 3a.4: Full interaction E2E on each changed page
  For each page:
    a. Every button:
       - Find all <button>, [role="button"], clickable elements
       - Click each → verify: no crash, expected response (toast/modal/navigation/state change)
       - Record: button text, action result, any errors

    b. Every input field:
       - Find all <input>, <textarea>, <select>, [contenteditable]
       - Type test data → verify: value appears, validation triggers if applicable
       - Test empty submission → verify: error message appears (if required field)

    c. Every form:
       - Find all <form> elements
       - Fill all fields with valid test data → submit
       - Verify: success response (toast/redirect/data appears)
       - Fill with invalid data → submit → verify: validation errors shown

    d. Every dropdown/select:
       - Find all <select>, dropdown menus, comboboxes
       - Open each → verify options render
       - Select an option → verify: selection reflected in UI

    e. Every CRUD operation (if applicable):
       - Create: fill form → submit → verify item appears in list
       - Read: verify item data displays correctly
       - Update: edit item → save → verify changes persist
       - Delete: delete item → confirm → verify item removed

    f. Console error collection:
       - Capture ALL browser console errors/warnings during interaction
       - Filter: ignore known benign warnings (React dev mode, HMR)
       - Any unexpected error → FAIL with error details

Step 3a.5: Theme consistency check
  - Compare page theme (background colors, text colors, accent colors, fonts) with app shell
  - Check: does the page use the same design tokens as layout/sidebar/header?
  - Mismatch → WARN with specific mismatched properties

Step 3a.6: Router import check
  - Verify all route imports resolve (no lazy-load failures)
  - Check: dynamic imports have error boundaries
  - Unresolved import → FAIL

Step 3a.7: Stop dev server
  - Kill the dev server process
  - Clean up any temp files
```

### E2E Results Format
```
UI Verification Report — Story {ID}
  Pages tested: {N}
  Screenshots: {paths}
  Interactions:
    Buttons: {tested}/{total} — {pass/fail}
    Inputs: {tested}/{total} — {pass/fail}
    Forms: {tested}/{total} — {pass/fail}
    Dropdowns: {tested}/{total} — {pass/fail}
    CRUD cycles: {tested}/{total} — {pass/fail}
  Console errors: {count} ({list if any})
  Theme consistency: PASS/WARN ({details})
  Router imports: PASS/FAIL ({details})
  Overall: PASS/FAIL
```

If Playwright is NOT configured (playwright_enabled = false):
- Skip automated E2E
- Still run: router import check, console error check (via dev server logs)
- WARN: "Playwright not configured — manual UI verification recommended"

---

## Story Dev Completion Checklist

```
Story Dev completion checklist:
  [ ] create-story (or implementation plan if non-BMAD) ✅
  [ ] dev-story (real code, no stubs) ✅
  [ ] simplify ✅
  [ ] TEA (or test generation if non-BMAD) ✅
  [ ] QA (or self-QA if non-BMAD) ✅
  [ ] CR (or self-code-review if non-BMAD) ✅
  [ ] tsc passes (if tsc_enabled) ✅
  [ ] If UI story: full interaction E2E passes ✅
  [ ] If UI story: theme consistency verified ✅
  [ ] If UI story: no unexpected console errors ✅
  [ ] All router imports resolve ✅
  [ ] Real functionality (no stub/mock/placeholder) ✅
```

ALL checked items must be [x] before story is accepted.
If any UI check fails → fix → re-run UI verification → must pass before proceeding.

---

## Mode C: Parallel Story Dev

Usage: `/kdh-full-auto-pipeline parallel 9-1 9-2 9-3` (max 3 workers)
Requires: stories are independent (no mutual dependencies, different files)

```
Step 0: Project Auto-Scan → load project-context.yaml
Step 1: Read status/dependency info → verify no cross-dependencies → TeamCreate (pipeline-parallel)
Step 2: Spawn up to 3 workers (each in Git Worktree, same prompt as Mode B)
Step 3: As each reports [dev-story complete] → run /simplify → continue TEA/QA/CR + UI verification
Step 4: Collect all results (timeout: 15min per worker)
Step 5: Sequential merge (in order): checkout main → merge --no-ff → tsc (if enabled) → commit or revert
Step 6: git push → wait for deploy → report
```

Worktree rule: workers must NOT touch files outside their story scope. Shared files → ask Orchestrator.

---

## Mode D: Swarm Auto-Epic

Usage: `/kdh-full-auto-pipeline swarm epic-9`

```
Step 0: Project Auto-Scan → load project-context.yaml
Step 1: Read status → find all stories → analyze dependencies
Step 2: TaskCreate for each story (status=pending, blockedBy=dependencies)
Step 3: Spawn 3 swarm workers (Git Worktrees, self-organizing)
Step 4: Monitor — handle [Shared File], [ESCALATE], [All Tasks Done]. Timeout: 20min/task.
Step 5: Shutdown workers → sequential merge (dependency order) → tsc (if enabled) → commit per story
Step 6: git push → deploy → generate epic completion report
```

Swarm vs Parallel: Parallel = you pick specific stories. Swarm = entire epic, workers self-organize from task board.

### Swarm Worker Prompt — BMAD Mode
```
You are a SWARM WORKER in team "{team_name}". Model: sonnet. YOLO mode. Self-organizing.
Project context: [embed project-context.yaml]

Loop until no tasks remain:
1. TaskList → find first task: status=pending, owner=null, blockedBy all completed
   - No task + others in_progress → wait 30s → retry. No tasks at all → "[All Tasks Done]"
2. TaskUpdate: status=in_progress, owner="{my_name}"
3. Execute ALL 5 BMAD skills (ALL MANDATORY — skipping ANY = REJECTED):
   a. skill="bmad-bmm-create-story" → must produce story file
   b. skill="bmad-bmm-dev-story" → real code, no stubs
   c. skill="bmad-tea-automate" → risk-based tests
   d. skill="bmad-agent-bmm-qa" → verify acceptance criteria
   e. skill="bmad-bmm-code-review" → auto-fix
4. If UI files changed → run UI Verification (Step 3a from Mode B)
5. Run tsc commands from project-context.yaml (fix once if fails, then ESCALATE)
6. TaskUpdate: status=completed → report:
   "[Task Complete] Story {id}
    Skills: create-story ✅ | dev-story ✅ | TEA ✅ | QA ✅ | CR ✅
    UI E2E: {PASS/SKIP} | tsc: {PASS/SKIP} | Files: {list}"
7. Go to step 1

Rules: no files outside story scope. Shared files → ask team-lead. If Skill fails → read .md manually.
```

### Swarm Worker Prompt — Non-BMAD Mode
```
You are a SWARM WORKER in team "{team_name}". Model: sonnet. YOLO mode. Self-organizing.
Project context: [embed project-context.yaml]

Loop until no tasks remain:
1. TaskList → find first task: status=pending, owner=null, blockedBy all completed
   - No task + others in_progress → wait 30s → retry. No tasks at all → "[All Tasks Done]"
2. TaskUpdate: status=in_progress, owner="{my_name}"
3. Execute simplified workflow (ALL MANDATORY):
   a. Create implementation plan → save to docs/story-plans/
   b. Implement code → real code, no stubs
   c. Generate and run tests
   d. Self-QA with critic personas (Quinn/Dana/Winston)
   e. Self-code-review → auto-fix
4. If UI files changed → run UI Verification (Step 3a from Mode B)
5. Run tsc commands from project-context.yaml (fix once if fails, then ESCALATE)
6. TaskUpdate: status=completed → report:
   "[Task Complete] Story {id}
    Steps: plan ✅ | implement ✅ | test ✅ | QA ✅ | CR ✅
    UI E2E: {PASS/SKIP} | tsc: {PASS/SKIP} | Files: {list}"
7. Go to step 1

Rules: no files outside story scope. Shared files → ask team-lead.
```

---

## Pipeline Interconnection: UXUI Redesign → Code Review

When the UXUI redesign pipeline (`/kdh-uxui-redesign-full-auto-pipeline`) completes, it MUST auto-trigger a full code review:

```
After UXUI redesign pipeline completes:
  → Auto-trigger /kdh-code-review-full-auto with context:

  Review context:
    type: "uxui-redesign"
    risk_level: HIGH (forced — redesign = bulk change)

  Required checks:
    1. Theme consistency across ALL pages:
       - Every page uses same design tokens (colors, fonts, spacing)
       - App shell (layout, sidebar, header) matches page content themes
       - No orphaned old-theme styles

    2. Full interaction E2E on ALL pages (not just changed):
       - Run UI Verification (Step 3a) on EVERY route in the app
       - Compare screenshots before/after redesign
       - Report any pages that look broken or unstyled

    3. Router integrity:
       - All page imports resolve
       - All lazy-loaded routes have error boundaries
       - No 404s on any defined route

    4. Accessibility baseline:
       - Color contrast ratios (WCAG AA minimum)
       - Keyboard navigation works on all interactive elements
       - Screen reader labels on all buttons/inputs

    5. Performance sanity:
       - No new bundle size regressions > 10%
       - No render-blocking imports added
       - Lighthouse score delta (if available)

  Output: _qa-e2e/uxui-redesign-review-{date}.md
```

This interconnection is AUTOMATIC — the UXUI pipeline must invoke it, not the user.

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
| ui_dev_server | 60s startup | WARN + continue without E2E if server won't start |
| ui_e2e_per_page | 2min per page | Skip page with WARN after timeout |
| context_window | 1M tokens (Opus 4.6) | No early compaction. Full epic processing. |

Party-log validation: Orchestrator MUST verify critic-a.md + critic-b.md + critic-c.md + fixes.md exist before accepting [Step Complete]. Missing → REJECT (up to 2x, then accept with warning).

---

## Core Rules

1. Planning Writer MUST NEVER call Skill tool. Read step files manually.
2. If BMAD enabled: ALL 5 BMAD skills mandatory per story. If non-BMAD: all 5 simplified steps mandatory. No stubs.
3. All agents read FROM FILE (Read tool) — never from message memory.
4. Output Quality: specific paths, exact values. "Vague" = instant FAIL.
5. Orchestrator embeds first task in Worker spawn. Never spawn with "wait".
6. Stage transition: verify all steps → commit → shutdown ALL → TeamDelete → TeamCreate fresh.
7. Pipeline never blocks — timeout/fail/escalate always leads to "continue".
8. tsc --noEmit MUST pass before any story dev commit (if tsc_enabled in project-context.yaml).
9. Update working-state.md (or equivalent state file) after every stage + before large steps. On resume: read it first.
10. Pipeline startup: clean stale worktrees/panes/dirs. Shutdown: clean all resources.
11. **`계속` = run to completion.** Do NOT stop at intermediate milestones. Pipeline ends when ALL stories complete + checks pass + code committed+pushed.
12. **Batch parallelism for repetitive work**: When multiple independent files need similar changes (e.g., styling, test generation), split into 4-5 batches and launch background agents simultaneously.
13. **Context snapshots**: Save decisions/state after every major step to `context-snapshots/`. On resume, read ALL snapshots before proceeding.
14. **Project Auto-Scan first**: ALWAYS run Step 0 before any mode. Never assume project structure.
15. **UI verification gate**: If a story touches UI files AND UI verification fails, the story is NOT complete. Fix → re-verify → pass required.
16. **No hardcoded paths**: All file paths come from project-context.yaml or dynamic discovery. Never assume a specific project layout.
