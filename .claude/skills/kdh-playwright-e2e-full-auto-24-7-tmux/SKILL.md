# KDH Playwright E2E Full-Auto 24/7 — TMUX Version (Team Agents)

Loop-based automated E2E testing + instant bug fix + deploy. Uses TeamCreate for parallel 4-agent testing. Runs on Oracle VPS inside tmux + Claude CLI.

## When to Use

- `/loop 15m /kdh-playwright-e2e-full-auto-24-7-tmux` — 15분마다 자동 사이클
- Oracle VPS tmux 세션에서 Claude CLI로 실행
- VS 버전보다 3-4배 빠름 (4개 팀 에이전트 병렬)

## Prerequisites

- Oracle VPS tmux session with Claude CLI
- Playwright MCP with Linux chromium path in `.mcp.json`
- Live site: https://corthex-hq.com
- Admin: admin / admin1234

---

## Cycle Structure (15min target)

Same 8-phase structure as VS version, but Phase 2 and Phase 4 use TeamCreate for parallelism.

### Phase 0: Pre-flight (15s)
Same as VS version.

### Phase 1: API Smoke Test (1min)
Same as VS version.

### Phase 2: Parallel E2E Sweep — 4 Team Agents (5min)

```
Step 2.0: TeamCreate("e2e-cycle-{N}")

Step 2.1: Create shared files
  _qa-e2e/playwright-e2e/cycle-{N}/blockers.md  (empty)
  _qa-e2e/playwright-e2e/cycle-{N}/bugs.md      (empty)

Step 2.2: Spawn 4 Agents (staggered 5s apart)

  Agent A — Functional (CRUD + Buttons)
    Assigned pages: companies, employees, departments, agents, tools,
                    credentials, api-keys, onboarding, settings, users,
                    report-lines, workflows
    Tasks:
      - Click EVERY button on assigned pages
      - Dead button (no response) = BUG
      - Try CRUD: create → read → update → delete on each page
      - Form validation: empty submit, Korean test data
      - Record all bugs to cycle-{N}/agent-A.md
      - Check blockers.md before each page (skip if blocked)

  Agent B — Visual + Design
    Assigned pages: ALL admin pages (screenshot sweep)
    Tasks:
      - Navigate each page → take screenshot
      - Check design tokens:
        - bg-blue-* anywhere = BUG (should be olive)
        - Material Symbols icon = BUG (should be Lucide)
        - Font not loading = BUG
      - Check responsive: resize to 390x844 → screenshot
      - Empty state: correct message displayed?
      - Record to cycle-{N}/agent-B.md

  Agent C — Edge + Security
    Assigned pages: ALL admin pages + unauthenticated access
    Tasks:
      - Visit each page WITHOUT token → should redirect to /login
      - Console errors on every page → collect ALL
      - Try XSS: <script>alert(1)</script> in text fields
      - Empty required fields → submit → should show validation
      - Rapid click: double-click delete button → should not double-delete
      - Record to cycle-{N}/agent-C.md
      - CRITICAL bugs → immediately write to blockers.md

  Agent D — Regression + Navigation
    Assigned pages: sidebar full sweep + previous cycle's fixed pages
    Tasks:
      - Click EVERY sidebar link → page loads correctly?
      - Previous cycle bugs → re-test each one (regression check)
      - Theme consistency: 5+ pages, verify olive palette
      - Shared components: sidebar, layout, toast, modal
      - Session persistence: navigate 10 pages → still logged in?
      - Record to cycle-{N}/agent-D.md

Step 2.3: Wait for all 4 agents (timeout: 5min each)
  If agent times out → collect partial results

Step 2.4: Aggregation
  Orchestrator reads all 4 agent reports:
    - Merge bugs from agent-A/B/C/D.md
    - De-duplicate: same page + same symptom = 1 bug
    - Assign severity: Critical / Major / Minor
    - Check blockers.md for site-wide issues
    - Write merged: cycle-{N}/merged-bugs.md
```

### Phase 3: Cross-Check (30s)
Same as VS version.

### Phase 4: Parallel Bug Fix — 3 Fixer Agents (5min)

```
Only if bugs found in Phase 2+3.

Step 4.0: TeamCreate("e2e-fixers-{N}")

Step 4.1: Assign bugs to fixers by domain

  Fixer A — Server Bugs
    Scope: packages/server/src/**
    - 500 errors → fix route/service code
    - 404 errors → mount missing routes
    - Auth issues → check middleware
    - Max 3 files per fixer

  Fixer B — Frontend Bugs (Admin)
    Scope: packages/admin/src/**
    - Console errors → fix component code
    - Dead buttons → connect onClick handlers
    - Empty pages → fix API calls or queries
    - Max 3 files per fixer

  Fixer C — Design/UX Bugs
    Scope: packages/admin/src/pages/** (CSS/styling only)
    - Blue → olive color fixes
    - Layout/spacing issues
    - Icon replacements
    - Max 3 files per fixer

Step 4.2: Each fixer works independently
  - Read file → apply fix → tsc check
  - If tsc fails → revert → try different approach (max 2 attempts)
  - If 2 attempts fail → mark ESCALATED

Step 4.3: Merge fixer results
  - All fixers on different files (no conflicts)
  - Orchestrator runs final tsc --noEmit for all packages
  - If type error → identify which fixer broke it → revert that fixer's changes
```

### Phase 5: Simplify (1min)
Same as VS version — run on all modified files.

### Phase 6: Deploy + Verify (2min)
Same as VS version.

### Phase 7: Working State Update (30s)
Same as VS version — update .claude/memory/working-state.md

### Phase 8: Report (15s)
Same as VS version — append to cycle-report.md

---

## Team Agent Communication Protocol

```
Orchestrator → Agents (via SendMessage):
  "[START] Cycle #{N}. Your assignment: {pages}. Read blockers.md first."

Agents → Orchestrator (via file):
  Write results to cycle-{N}/agent-{A|B|C|D}.md

Agents → Agents (via shared file):
  blockers.md: "LOGIN FAILED — skip all pages requiring auth"
  bugs.md: append discovered bugs for cross-reference

Orchestrator → Fixers (via SendMessage):
  "[FIX] Bug #{id}: {description}. File: {path}:{line}. Fix: {suggestion}"

Fixers → Orchestrator (via file):
  Write results to cycle-{N}/fix-results.md
```

## Safety Limits (same as VS)

- Max 5 files modified per cycle (total across all fixers)
- No deleting files
- No changing package.json
- No modifying migrations or auth middleware
- tsc must pass before commit
- If deploy fails → next cycle detects and warns

## Output

```
_qa-e2e/playwright-e2e/
  cycle-report.md
  cycle-{N}/
    agent-A.md
    agent-B.md
    agent-C.md
    agent-D.md
    blockers.md
    merged-bugs.md
    fix-results.md
    screenshots/
      {page}-{bug-id}.png
```

## Fallback

If TeamCreate fails (connection issue, resource limit):
  → Auto-fallback to VS version (sequential single-agent mode)
  → Log: "TeamCreate failed, running in single-agent mode"
  → Continue cycle without interruption
