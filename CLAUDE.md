# CLAUDE.md -- CORTHEX v2

## User
- Non-developer. No jargon. Explain simply
- Always use 존댓말 (formal Korean)
- Talk to user in Korean, but code/commits/docs output can be in English
- Auto commit + push on completion (don't ask)

## Deploy
- main push -> GitHub Actions -> Cloudflare cache purge
- **Before commit+push**: `npx tsc --noEmit -p packages/server/tsconfig.json` (deploy fails on type errors)
- Common type errors: wrong union values (check shared/types.ts), wrong c.set() keys (check server/types.ts), case-sensitive imports (use `git ls-files`)
- Team agents must also run tsc before reporting completion
- **After push**: wait for deploy to finish (`gh run list -L 1`), then report to user: build #N + changes + where to check (table format). Do NOT move to next task until deploy is confirmed

## v1 Feature Spec (top priority reference)
- Path: `_bmad-output/planning-artifacts/v1-feature-spec.md`
- Rule: "if it worked in v1, it must work in v2"
- No stub/mock/CRUD — real working features only

## v2 Direction
- Not 29 fixed agents — admin can freely create/edit/delete departments, human staff, AI agents
- Dynamic org management is the core difference

## BMAD Workflow (absolute rules)

### Planning Pipeline
- Run via `/bmad-full-pipeline planning`. All steps require party mode
- Always create fresh (overwrite existing docs, never skip)
- Commit per stage: `docs(planning): {stage} complete -- {N} party rounds`

### Party Mode: Single Worker Self-Review
- 1 Worker writes + self-reviews 3 rounds (not 2-person ping-pong)
- Round lenses: Collaborative → Adversarial → Forensic
- Worker re-reads file each round (no memory-based review)
- YOLO mode: auto-proceed, no menus, no waiting
- Check: real features? concrete plan? covers v1 spec?
- PASS/FAIL by Worker. Pass = 0 major objections

### Story Development (5 mandatory BMAD skills per story)
1. `bmad-bmm-create-story` → story file
2. `bmad-bmm-dev-story` → implementation (**no stubs**)
3. `bmad-tea-automate` → risk-based tests
4. `bmad-agent-bmm-qa` → QA verification (auto-run, no menu)
5. `bmad-bmm-code-review` → code review + auto-fix
- Epic completion: run `bmad-bmm-retrospective`

### Orchestrator Protocol
- Main conversation = orchestrator. Real work = TeamCreate worker in tmux
- Worker spawn must include first task (never "wait")
- Orchestrator only: assign steps + commit. Worker does everything else
- Commit only when 6-point checklist passes (create/dev/TEA/QA/CR/real functionality)

### Prohibited
- Implementing or reviewing code without BMAD skills
- Skipping QA/TEA steps
- Treating stub/mock as "done"
- Orchestrator running party mode directly
- Showing BMAD agent menus to user

## Output Quality (absolute rule)
All outputs must be **specific and detailed**. No vague/abstract expressions.
Bad: "professional colors" → Good: `bg-slate-900 (#0f172a)`
Bad: "add sidebar" → Good: `w-64 fixed left-0 h-screen bg-slate-900 border-r border-slate-700`
Workers/team agents follow the same standard. "Vague" = instant FAIL in party mode.

## Coding Conventions
- Filenames: kebab-case lowercase
- Imports: must match `git ls-files` casing exactly (Linux CI is case-sensitive)
- Components: PascalCase
- API response: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- Tests: bun:test (server)

## Context Memory (compaction survival)
- Auto-save to `.claude/memory/working-state.md` on key decisions and natural breakpoints
- Record: (1) current work (2) key decisions (3) next steps (4) warnings
- Session end: save summary to `.claude/memory/YYYY-MM-DD-topic.md`
- New session: read working-state.md + recent session logs first

## Update Log (absolute rule)
- **Every session must log changes** to `.claude/updates/YYYY-MM-DD-topic.md`
- Log must include: (1) what was changed (2) why (3) files affected (4) result/outcome
- Format: markdown, specific file paths and line numbers where relevant
- One log file per topic per day (append if same topic, new file if different topic)
- Examples of what to log:
  - New feature added: what it does, which files, API endpoints
  - Bug fix: what was broken, root cause, what was changed
  - Refactoring: what was restructured, why, before/after
  - Config change: what setting, old value → new value
  - Deployment: build number, what was deployed, any issues
  - Design decision: what was decided, alternatives considered, rationale
- This is NOT optional. Every meaningful change gets logged. "I forgot" is not acceptable.
- Logs accumulate over time and become valuable project history/context for future sessions.
