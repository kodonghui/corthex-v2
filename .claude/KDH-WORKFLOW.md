# KDH Universal Workflow Guide

Full-cycle AI-powered development workflow. Works on any project with Claude Code.

**Components**: BMAD planning pipeline + ECC learning system + KDH automation + Libre UI tools

---

## Quick Start

```bash
# 1. First time: auto-scan the project
/kdh-full-auto-pipeline planning    # Starts from Stage 0 (auto-scan)

# 2. Continue development
/kdh-full-auto-pipeline 3-1         # Develop story 3-1
/kdh-full-auto-pipeline parallel 3-1 3-2 3-3   # 3 stories in parallel
/kdh-full-auto-pipeline swarm epic-3            # Auto-organize entire epic
```

---
---

## 0. Global Installation (One-Time Setup)

All hooks, commands, and skills can be installed globally so they work on every project.

### Option A: Copy from existing project
```bash
# From a project that already has the full setup
cp -r .claude/hooks/ecc/ ~/.claude/hooks/ecc/
cp -r .claude/hooks/instincts/ ~/.claude/hooks/instincts/
cp .claude/commands/*.md ~/.claude/commands/
cp -r .claude/skills/ ~/.claude/skills/
cp -r .claude/agents/ ~/.claude/agents/
# hooks.json is auto-created (see below)
```

### Option B: Fresh install
Copy the following directories to `~/.claude/`:
- `hooks/ecc/` — ECC Node.js hook infrastructure
- `hooks/instincts/` — Instinct learning system (Python 3 required)
- `commands/` — All slash commands
- `skills/` — Domain knowledge skills
- `agents/` — Specialized subagents

### What's Global vs Project-Local
| Component | Global (~/.claude/) | Project (.claude/) |
|-----------|--------------------|--------------------|
| ECC hooks (session, cost, security) | Global | - |
| Slash commands (/learn, /evolve, etc.) | Global | - |
| Skills (design, prototyping, etc.) | Global | - |
| Agents (Socrates reviewers) | Global | - |
| hooks.json (universal hooks) | Global | Project adds project-specific hooks |
| BMAD workflow files (_bmad/) | - | Project (required for planning pipeline) |
| cleanup.sh, pre-commit-tsc.sh | - | Project-specific |
| cross-check.sh, smoke-test.sh | - | Project-specific |

### After Global Install
All `/kdh-*`, `/bmad-*`, `/learn`, `/evolve`, `/save-session` etc. commands work in any project directory.
---

## 1. Pipeline Overview

### Full Lifecycle (4 commands, sequential)

```
/kdh-full-auto-pipeline planning     (Stage 0-8: Brief → Architecture → Sprint Plan)
        ↓
/kdh-uxui-redesign-full-auto-pipeline  (Phase 0-7: Design Research → React/JSX)
        ↓
/kdh-full-auto-pipeline story dev    (Phase A-F per story: Create → Code → Test → QA → Review)
        ↓
/kdh-code-review-full-auto           (8-phase: Static → Visual → Risk → Critic → Fix)
```

### Planning Pipeline — 9 Stages

| Stage | Name | Writer | Team Size | GATE? | Key Output |
|-------|------|--------|-----------|-------|------------|
| 0 | Product Brief | analyst | 5 | 4 gates | product-brief.md |
| 1 | Technical Research | dev | 4 | none | technical-research.md |
| 2 | PRD Create | john (PM) | 5 | 8 gates | prd.md |
| 3 | PRD Validate | analyst | 4 | none | prd-validation-report.md |
| 4 | Architecture | winston | 5 | 1 gate | architecture.md |
| 5 | UX Design | sally | 5 | 2 gates | ux-design-specification.md |
| 6 | Epics & Stories | bob (SM) | 5 | 1 gate | epics-and-stories.md |
| 7 | Readiness Check | tech-writer | 5 | none | readiness-report.md |
| 8 | Sprint Planning | auto | - | none | sprint-status.yaml |

### Story Dev Pipeline — 6 Phases per Story

| Phase | Writer | Team | What |
|-------|--------|------|------|
| A Create | dev | 4 | Write story spec from epic requirements |
| B Develop | dev | 4 | Implement real working code (no stubs!) |
| C Simplify | - | - | /simplify — auto code cleanup |
| D Test (TEA) | quinn (QA) | 3 | Risk-based test strategy + implementation |
| E QA | quinn | 3 | Acceptance criteria verification |
| F Code Review | winston | 4 | Architecture + security + quality review |

---

## 2. Party Mode (Quality System)

Every step uses "party mode" — a structured review process:

```
1. Writer writes one section
2. 3-4 Critics review independently (parallel)
3. Critics cross-talk (discuss each other's findings)
4. Feedback sent to Writer
5. Writer applies fixes
6. Critics re-score (0-10 scale, 6 dimensions)
7. Average >= 7/10 → PASS, else retry (max 2-3x by grade)
```

### Scoring Rubric (6 dimensions)
Each dimension scored 0-10, any dimension < 3 = auto-fail:
1. Completeness
2. Accuracy
3. Clarity
4. Actionability
5. Consistency
6. Innovation/Quality

### Step Grades
| Grade | Max Retries | When |
|-------|-------------|------|
| A (critical) | 3 | Architecture decisions, FR/NFR, core patterns |
| B (important) | 2 | Most content steps |
| C (setup) | 1 | init, complete — runs solo without party mode |

### GATE Steps
Some steps pause for user (stakeholder) input. The system presents options (A/B/C) with pros/cons and waits for your decision. Never auto-proceeds on GATE steps.

---

## 3. BMAD Agent Roster

All agents are spawned with real names and full persona files:

| Name | Role | Expertise |
|------|------|-----------|
| `winston` | Architect | Distributed systems, API design, scalable patterns |
| `quinn` | QA | Test automation, E2E, coverage analysis |
| `john` | PM | PRD, requirements, stakeholder alignment |
| `sally` | UX Designer | User research, interaction design, UI patterns |
| `bob` | Scrum Master | Sprint planning, delivery risk |
| `dev` | Developer | Implementation, code quality, debugging |
| `analyst` | Analyst | Research synthesis, analysis |
| `tech-writer` | Tech Writer | Documentation, technical writing |

---

## 4. Available Slash Commands

### Core Pipelines
| Command | Description |
|---------|-------------|
| `/kdh-full-auto-pipeline planning` | Full planning cycle (9 stages) |
| `/kdh-full-auto-pipeline <story-id>` | Single story development |
| `/kdh-full-auto-pipeline parallel <id1> <id2>` | Parallel story dev (max 3) |
| `/kdh-full-auto-pipeline swarm epic-<N>` | Auto-organize entire epic |
| `/kdh-uxui-redesign-full-auto-pipeline` | UXUI redesign (8 phases, Stitch 2) |
| `/kdh-code-review-full-auto` | 8-phase auto code review |

### Discussion & Analysis
| Command | Description |
|---------|-------------|
| `/discuss-mode` | Active thinking partner — no code, opinions + options + recommendation |
| `/bmad-brainstorming` | Multi-agent brainstorming session |
| `/bmad-party-mode` | Ad-hoc group discussion between BMAD agents |

### Session Management (ECC)
| Command | Description |
|---------|-------------|
| `/save-session` | Save session state (9 sections: what worked, what failed, next step) |
| `/resume-session` | Load previous session, structured briefing |
| `/checkpoint create <name>` | Create named workflow milestone |
| `/checkpoint verify <name>` | Compare state against checkpoint |

### Learning & Evolution (ECC)
| Command | Description |
|---------|-------------|
| `/learn` | Extract reusable patterns from current session |
| `/learn-eval` | /learn with quality gate (checklist + Save/Drop verdict) |
| `/instinct-status` | Show learned instincts with confidence scores |
| `/evolve` | Cluster instincts into skills/commands/agents |
| `/instinct-export` | Export instincts to shareable file |
| `/instinct-import <file>` | Import instincts from file |
| `/promote` | Promote project instincts to global (2+ projects, conf >= 0.8) |

### Quality & Verification (ECC)
| Command | Description |
|---------|-------------|
| `/verify [quick\|full\|pre-commit\|pre-pr]` | Codebase state check (build, types, lint, tests) |
| `/skill-health` | Skill portfolio dashboard (success rates, failure patterns) |
| `/context-budget` | Audit token consumption across agents/skills/MCP |

### BMAD Individual Workflows
| Command | Description |
|---------|-------------|
| `/bmad-bmm-create-product-brief` | Create product brief (solo) |
| `/bmad-bmm-create-prd` | Create PRD (solo) |
| `/bmad-bmm-validate-prd` | Validate PRD (solo) |
| `/bmad-bmm-create-architecture` | Create architecture (solo) |
| `/bmad-bmm-create-ux-design` | Create UX design spec (solo) |
| `/bmad-bmm-create-epics-and-stories` | Create epics & stories (solo) |
| `/bmad-bmm-create-story` | Create single story file |
| `/bmad-bmm-dev-story` | Implement story (solo) |
| `/bmad-bmm-code-review` | Adversarial code review (solo) |
| `/bmad-bmm-sprint-planning` | Generate sprint plan |
| `/bmad-bmm-sprint-status` | Check sprint status |
| `/bmad-bmm-correct-course` | Manage sprint changes |
| `/bmad-bmm-retrospective` | Post-epic retrospective |

### Research
| Command | Description |
|---------|-------------|
| `/bmad-bmm-technical-research` | Technical research on specific topics |
| `/bmad-bmm-domain-research` | Domain/industry research |
| `/bmad-bmm-market-research` | Market research (competition, customers) |

### Review & Quality
| Command | Description |
|---------|-------------|
| `/bmad-review-adversarial-general` | Cynical review — find everything wrong |
| `/bmad-review-edge-case-hunter` | Find unhandled edge cases |
| `/bmad-editorial-review-structure` | Structural editing (cuts, reorganization) |
| `/bmad-editorial-review-prose` | Prose review (clarity, communication) |
| `/bmad-tea-automate` | TEA risk-based test generation |

### UI/UX (Libre)
| Command | Description |
|---------|-------------|
| `/libre-ui-synth` | Full UI/UX synthesis (all plugins) |
| `/libre-ui-review` | UI analysis framework |
| `/libre-ui-critique` | Design feedback & improvements |
| `/libre-ui-responsive` | Check/fix responsive design |
| `/libre-ui-modern` | Generate modern UI component |
| `/libre-a11y-audit` | Accessibility audit |

### Utility
| Command | Description |
|---------|-------------|
| `/bmad-help` | Analyze state and suggest next steps |
| `/bmad-bmm-quick-spec` | Quick tech spec for small changes |
| `/bmad-bmm-quick-dev` | Implement a quick spec |
| `/bmad-bmm-document-project` | Document brownfield project for AI context |
| `/bmad-bmm-generate-project-context` | Create project-context.md |
| `/simplify` | Review changed code for reuse and quality |

---

## 5. Hook System (Auto-enforced)

Hooks run automatically — no manual intervention needed.

### Session Lifecycle
| Event | Hook | What it does |
|-------|------|-------------|
| SessionStart | `cleanup.sh` | Clean stale tmux/worktrees/team dirs |
| SessionStart | `session-start.js` | Load previous session context |
| Stop | `session-end.js` | Auto-summarize session (JSONL transcript parsing) |
| Stop | `cost-tracker.js` | Track token usage to `~/.claude/metrics/costs.jsonl` |
| Stop | `evaluate-session.js` | Flag sessions with 10+ messages for pattern extraction |

### Code Quality
| Event | Hook | What it does |
|-------|------|-------------|
| PreToolUse(Bash) | `pre-commit-tsc.sh` | TypeScript type-check before git commit |
| PostToolUse(Edit) | `post-edit-console-warn.js` | Warn about console.log in edited files |
| PostToolUse(Edit\|Write) | `quality-gate.js` | Auto-format/lint (Biome/Prettier) |

### Security
| Event | Hook | What it does |
|-------|------|-------------|
| Pre/PostToolUse | `governance-capture.js` | Detect hardcoded secrets, dangerous commands, sensitive files |
| PreToolUse(MCP) | `mcp-health-check.js` | MCP server health with TTL cache, exponential backoff |

### Context Management
| Event | Hook | What it does |
|-------|------|-------------|
| PreToolUse(Edit\|Write) | `suggest-compact.js` | Suggest /compact at 100 tool calls |
| PreCompact | `pre-compact.js` | Log compaction event |
| PostCompact | `post-compact-save.sh` | Auto-commit uncommitted changes |
| PreToolUse(Write) | `doc-file-warning.js` | Warn about non-standard doc files |

### Instinct Learning
| Event | Hook | What it does |
|-------|------|-------------|
| PreToolUse(*) | `observe.sh` | Record all tool usage to observations.jsonl |
| PostToolUse(*) | `observe.sh` | Record tool outcomes |

---

## 6. Instinct Learning System

The system automatically learns from your sessions:

```
Session Activity (every tool call)
    ↓ observe.sh hooks (100% capture)
observations.jsonl (per project, isolated by git remote hash)
    ↓ Pattern detection (20+ observations)
Instinct files (atomic behaviors, confidence 0.3-0.9)
    ↓ /evolve (clustering)
Commands / Skills / Agents (auto-generated)
    ↓ /promote (2+ projects, confidence >= 0.8)
Global instincts (shared across projects)
```

### Confidence Levels
| Score | Meaning | Behavior |
|-------|---------|----------|
| 0.3 | Tentative | Suggested but not enforced |
| 0.5 | Moderate | Applied when relevant |
| 0.7 | Strong | Auto-approved for application |
| 0.9 | Near-certain | Core behavior |

### Confidence Changes
- +0.05 per confirming observation
- -0.10 per user correction
- -0.02 per week without observation (decay)

### Project Isolation
Each project gets its own instinct space based on git remote URL hash. Instincts from React projects won't contaminate Python projects. Universal patterns (security, workflow) promote to global scope.

---

## 7. Skill Health Dashboard

Track how well your skills/pipelines perform:

```
/skill-health
```

Shows:
- Success Rate (30d) with sparkline charts per skill
- Failure Pattern clustering (what breaks most)
- Pending Amendments (auto-generated fix proposals)
- Version History (skill snapshots with rollback)

When skills fail repeatedly, the system auto-generates amendment proposals.

---

## 8. Session Persistence

### Automatic (hooks)
- Every Stop event: `session-end.js` parses JSONL transcript → `~/.claude/sessions/{date}-{id}-session.tmp`
- Session start: `session-start.js` loads most recent session (7-day window)
- Compaction: `pre-compact.js` logs event, `post-compact-save.sh` auto-commits

### Manual
- `/save-session` — Rich 9-section format:
  1. What We Are Building
  2. What WORKED (with evidence)
  3. **What Did NOT Work** (most important — prevents retrying failures)
  4. What Has NOT Been Tried Yet
  5. Current State of Files
  6. Decisions Made
  7. Blockers & Open Questions
  8. Exact Next Step
  9. Environment & Setup Notes

- `/resume-session` — Loads session file, structured briefing, waits for user direction

---

## 9. Cost Tracking

Every session records token usage to `~/.claude/metrics/costs.jsonl`:

```json
{
  "timestamp": "2026-03-21T14:30:00Z",
  "session_id": "abc123",
  "model": "opus",
  "input_tokens": 50000,
  "output_tokens": 12000,
  "estimated_cost_usd": 1.65
}
```

Useful for tracking pipeline efficiency (how many tokens does Stage 2 with 5 agents consume?).

---

## 10. Directory Structure

```
.claude/
  hooks.json                    # Hook configuration (auto-enforced)
  hooks/
    cleanup.sh                  # Stale resource cleanup
    pre-commit-tsc.sh           # TypeScript pre-commit gate
    post-compact-save.sh        # Auto-commit on compaction
    ecc/                        # ECC Node.js infrastructure
      lib/                      # Shared utilities
        utils.js
        hook-flags.js
        skill-evolution/        # Skill health tracking
        skill-improvement/      # Amendment proposals
      hooks/                    # Hook scripts
        session-end.js
        session-start.js
        cost-tracker.js
        suggest-compact.js
        governance-capture.js
        mcp-health-check.js
        post-edit-console-warn.js
        ...
    instincts/                  # Continuous learning
      observe.sh
      instinct-cli.py
      config.json
  commands/                     # Slash commands (65+)
  agents/                       # Specialized subagents
  skills/                       # Domain knowledge
  memory/                       # Cross-session persistence
  logs/                         # Decision logs, session logs

~/.claude/
  sessions/                     # Session state files
  metrics/                      # Cost tracking JSONL
  state/                        # Skill execution records
  skills/learned/               # Extracted patterns
  homunculus/                   # Instinct storage
    projects/{hash}/            # Per-project instincts
    instincts/personal/         # Global instincts
```

---

## 11. Setting Up for a New Project

### If Using Global Setup (Recommended)

If you've completed the global installation (Section 0), all commands and hooks are already available. You only need:

#### Step 1: Set up BMAD workflow files (if using planning pipeline)
The planning pipeline requires BMAD workflow directories in the project:
```
_bmad/bmm/
  agents/          # Agent persona files
  workflows/       # Stage workflow step files
```
Copy these from an existing project or the BMAD template repository.

#### Step 2: Add project-specific hooks (optional)
Create `.claude/hooks.json` in your project for project-specific hooks only:
```bash
# Examples of project-specific hooks:
# - pre-commit-tsc.sh (TypeScript projects)
# - cleanup.sh (tmux/worktree cleanup)
# - cross-check.sh (domain-specific checks)
# - smoke-test.sh (post-deploy verification)
```
Project hooks.json merges with the global hooks.json automatically.

#### Step 3: Create CLAUDE.md for the new project
Add project-specific rules (deploy instructions, coding conventions, etc.).

#### Step 4: First run
```bash
/kdh-full-auto-pipeline planning   # Auto-scans project, starts planning
```

### If NOT Using Global Setup (Manual Per-Project)

#### Step 1: Copy core infrastructure
```bash
# From an existing project with the workflow
cp -r .claude/hooks/ecc/ <new-project>/.claude/hooks/ecc/
cp -r .claude/hooks/instincts/ <new-project>/.claude/hooks/instincts/
cp .claude/hooks.json <new-project>/.claude/hooks.json
```

#### Step 2: Copy commands you want
```bash
# Core pipelines (always)
cp .claude/commands/kdh-full-auto-pipeline.md <new-project>/.claude/commands/
cp .claude/commands/kdh-code-review-full-auto.md <new-project>/.claude/commands/
cp .claude/commands/discuss-mode.md <new-project>/.claude/commands/

# ECC commands (always)
for cmd in save-session resume-session learn learn-eval instinct-status evolve \
  skill-health verify checkpoint context-budget; do
  cp .claude/commands/${cmd}.md <new-project>/.claude/commands/
done

# BMAD commands (if using BMAD workflow)
cp .claude/commands/bmad-*.md <new-project>/.claude/commands/

# UI commands (if frontend project)
cp .claude/commands/libre-*.md <new-project>/.claude/commands/
cp .claude/commands/kdh-uxui-redesign-full-auto-pipeline.md <new-project>/.claude/commands/
```

#### Step 3: Ensure BMAD is set up (if using planning pipeline)
The planning pipeline requires BMAD workflow directories:
```
_bmad/bmm/
  agents/          # Agent persona files
  workflows/       # Stage workflow step files
```

#### Step 4: Create CLAUDE.md for the new project
Add project-specific rules. The hooks and commands are self-contained.

#### Step 5: First run
```bash
/kdh-full-auto-pipeline planning   # Auto-scans project, starts planning
```

---

## 12. Tips & Best Practices

### For Planning
- Let the pipeline run without interruption (except GATE steps)
- GATE steps always wait for your input — take your time
- Say `계속` or `gg` to continue after GATE decisions
- Stage 3 (PRD Validate) is parallelized — runs 4x faster
- Stage 4 (Architecture) is the most critical — all opus, all Grade A

### For Development
- One story at a time unless stories are truly independent
- `/kdh-full-auto-pipeline parallel` requires non-overlapping files
- `/kdh-full-auto-pipeline swarm` auto-organizes but needs monitoring
- Every story goes through 6 phases — no shortcuts

### For Learning
- Run `/learn` after solving non-trivial problems
- Run `/instinct-status` periodically to see what patterns emerged
- Run `/evolve` when you have 10+ instincts to cluster them
- Run `/promote` when using multiple projects to share universal patterns

### For Sessions
- `/save-session` before closing Claude Code (or it auto-saves on Stop)
- `/resume-session` when starting a new session on the same work
- The "What Did NOT Work" section is the most important — prevents retrying failures

### For Quality
- `/verify quick` before commits (build + types)
- `/verify full` before PRs (all checks)
- `/skill-health` weekly to monitor pipeline health
- `/context-budget` when context feels sluggish

---

## Credits

- **BMAD**: Business-Minded AI Development framework (agent personas, party mode, workflow discovery)
- **ECC**: Everything Claude Code (session persistence, instinct learning, cost tracking, governance hooks)
- **KDH**: Full-auto pipeline orchestration (v9.1), code review (v3.0), UXUI redesign (v5.1)
- **Libre**: UI/UX design plugins (accessibility, responsive, modern components)
