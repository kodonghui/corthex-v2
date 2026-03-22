# ECC (Everything Claude Code) — Full System Audit

**Date:** 2026-03-22
**Auditor:** Claude Opus 4.6
**Scope:** All ECC hooks, lib modules, commands, instinct system, skill evolution system

---

## Part 1: Hook System (자동 실행)

All hooks registered in `.claude/hooks.json`. ECC hooks live under `.claude/hooks/ecc/`, non-ECC hooks under `.claude/hooks/`.

### 1.1 SessionStart Hooks

| # | Hook | File | Event | Status |
|---|------|------|-------|--------|
| 1 | **Cleanup** | `.claude/hooks/cleanup.sh` | SessionStart (startup) | ✅ Exists, registered |
| 2 | **Cleanup (resume)** | `.claude/hooks/cleanup.sh` | SessionStart (resume) | ✅ Same file, dual registration |
| 3 | **ECC Session Start** | `ecc/hooks/session-start.js` | SessionStart (all) | ✅ Exists, registered |

**cleanup.sh** — Kills stale tmux sessions, removes orphaned git worktrees and team directories. Fires on every session start and resume. Timeout: 30s.

**session-start.js** — Loads the most recent session summary (last 7 days) from `~/.claude/sessions/` and injects it into Claude's context via stdout. Also reports: learned skills count, session aliases (up to 5), detected package manager (npm/pnpm/yarn/bun), and project type/frameworks (languages, frameworks via `project-detect.js`). Reads: session files, learned skills dir, session-aliases.json, package.json, lock files. Writes: nothing. Timeout: 15s.

### 1.2 PreToolUse Hooks

| # | Hook | Matcher | File | Status |
|---|------|---------|------|--------|
| 4 | **Pre-commit TSC** | Bash | `.claude/hooks/pre-commit-tsc.sh` | ✅ Exists |
| 5 | **Party Log Verify** | Bash | `.claude/hooks/party-log-verify.sh` | ✅ Exists |
| 6 | **Party Mode Compliance** | Bash | `.claude/hooks/party-mode-compliance.js` | ✅ Exists |
| 7 | **Doc File Warning** | Write | `ecc/hooks/doc-file-warning.js` | ✅ Exists |
| 8 | **Suggest Compact** | Edit\|Write | `ecc/hooks/suggest-compact.js` | ✅ Exists |
| 9 | **Governance Capture (Pre)** | Bash\|Write\|Edit | `ecc/hooks/governance-capture.js` | ✅ Exists |

**pre-commit-tsc.sh** — Runs `tsc --noEmit` before git commit commands to block commits with type errors. Timeout: 120s.

**party-log-verify.sh** — Validates party-log markdown structure before Bash commands in pipeline mode. Timeout: 30s.

**party-mode-compliance.js** — Enforces BMAD party mode rules (orchestrator can't run party mode, etc.). Timeout: 30s.

**doc-file-warning.js** — Warns (never blocks) when Write targets non-standard doc file paths. Allowlisted: README.md, CLAUDE.md, docs/, .claude/commands/, `_bmad-output/`, etc. Reads: stdin JSON (tool_input.file_path). Writes: nothing. Timeout: 10s.

**suggest-compact.js** — Tracks tool call count in a temp file (`/tmp/claude-tool-count-{sessionId}`). Suggests `/compact` at configurable threshold (default 100 tool calls), then every 25 calls after. Reads/writes: counter temp file. Timeout: 10s.

**governance-capture.js** — Detects governance-relevant events: hardcoded secrets (AWS keys, JWTs, GitHub tokens, Anthropic keys, Neon DSNs), dangerous commands (`git push --force`, `rm -rf`, `DROP TABLE`), sensitive file access (.env, .pem, credentials). **Gated by `ECC_GOVERNANCE_CAPTURE=1` env var** — currently **DISABLED by default**. Writes events to stderr as JSON-lines. Timeout: 10s.

### 1.3 PreCompact Hook

| # | Hook | File | Status |
|---|------|------|--------|
| 10 | **ECC Pre-Compact** | `ecc/hooks/pre-compact.js` | ✅ Exists |

**pre-compact.js** — Logs compaction timestamp to `~/.claude/sessions/compaction-log.txt`. Appends a "compaction occurred" marker to the active session file. Timeout: 15s.

### 1.4 PostCompact Hook

| # | Hook | File | Status |
|---|------|------|--------|
| 11 | **Post-Compact Save** | `.claude/hooks/post-compact-save.sh` | ✅ Exists |

**post-compact-save.sh** — Auto-saves working-state.md and uncommitted changes after context compression. Timeout: 30s.

### 1.5 PostToolUse Hooks

| # | Hook | Matcher | File | Status |
|---|------|---------|------|--------|
| 12 | **Post-Edit Console Warn** | Edit | `ecc/hooks/post-edit-console-warn.js` | ✅ Exists |
| 13 | **Governance Capture (Post)** | Bash\|Write\|Edit | `ecc/hooks/governance-capture.js` | ✅ Same file as #9 |

**post-edit-console-warn.js** — After editing JS/TS files, scans the file for `console.log` statements and warns with line numbers. Never blocks. Reads: the edited file. Writes: nothing (stderr only). Timeout: 10s.

### 1.6 Stop Hooks (Session End)

| # | Hook | File | Status |
|---|------|------|--------|
| 14 | **Session End Reminder** | `.claude/hooks/session-end-reminder.sh` | ✅ Exists |
| 15 | **ECC Session End** | `ecc/hooks/session-end.js` | ✅ Exists |
| 16 | **Cost Tracker** | `ecc/hooks/cost-tracker.js` | ✅ Exists |
| 17 | **Evaluate Session** | `ecc/hooks/evaluate-session.js` | ✅ Exists |

**session-end-reminder.sh** — Warns if no update log has been written today. Timeout: 15s.

**session-end.js** — Parses the session transcript (from stdin JSON `transcript_path`). Extracts: last 10 user messages (truncated 200 chars), tools used (up to 20), files modified (up to 30 Edit/Write). Creates or updates `~/.claude/sessions/YYYY-MM-DD-<shortId>-session.tmp` with a structured summary. Uses idempotent summary markers (`<!-- ECC:SUMMARY:START/END -->`) so repeated Stop events don't duplicate content. Timeout: 15s.

**cost-tracker.js** — Appends a cost metric row to `~/.claude/metrics/costs.jsonl`. Estimates USD cost based on model (Haiku $0.8/$4, Sonnet $3/$15, Opus $15/$75 per 1M tokens). Reads: stdin JSON (usage.input_tokens, output_tokens, model). Timeout: 10s.

**evaluate-session.js** — Checks if the session had enough user messages (configurable, default 10). If so, signals via stderr that the session should be evaluated for extractable patterns. Does NOT actually extract patterns — just flags the opportunity. Reads: transcript JSONL, config from `skills/continuous-learning/config.json`. Timeout: 10s.

### 1.7 Hooks NOT in hooks.json (exist but unregistered)

| File | Purpose | Registered? |
|------|---------|-------------|
| `ecc/hooks/mcp-health-check.js` | MCP server health checks with probing, reconnect, backoff | ❌ NOT registered |
| `ecc/hooks/quality-gate.js` | Format checking (Biome/Prettier/gofmt/ruff) after edits | ❌ NOT registered |
| `ecc/hooks/run-with-flags.js` | Feature-flag gated hook runner | ❌ NOT registered (it's a wrapper, not directly registered) |
| `ecc/hooks/session-end-marker.js` | Passes stdin to stdout unchanged | ❌ NOT registered |
| `ecc/hooks/check-hook-enabled.js` | CLI utility to check if a hook is enabled | ❌ NOT registered (utility) |

---

## Part 2: Skill Commands (수동 실행)

### 2.1 ECC-Related Commands

| Command | File | Description | Dependencies |
|---------|------|-------------|-------------|
| `/learn` | `commands/learn.md` | Extract reusable patterns from current session | Saves to `~/.claude/skills/learned/` |
| `/learn-eval` | `commands/learn-eval.md` | Learn with quality gate: checklist-based holistic verdict (Save/Improve/Absorb/Drop) | Extends /learn, checks for overlap with existing skills and MEMORY.md |
| `/evolve` | `commands/evolve.md` | Cluster instincts into skills/commands/agents | Runs `instinct-cli.py evolve` |
| `/promote` | `commands/promote.md` | Promote project instincts to global scope | Runs `instinct-cli.py promote` |
| `/instinct-status` | `commands/instinct-status.md` | Show learned instincts with confidence bars | Runs `instinct-cli.py status` |
| `/instinct-import` | `commands/instinct-import.md` | Import instincts from file/URL | Runs `instinct-cli.py import` |
| `/instinct-export` | `commands/instinct-export.md` | Export instincts to shareable YAML file | Runs `instinct-cli.py export` |
| `/projects` | `commands/projects.md` | List known projects and instinct counts | Runs `instinct-cli.py projects` |
| `/checkpoint` | `commands/checkpoint.md` | Create/verify workflow checkpoints | Uses git, `.claude/checkpoints.log` |
| `/save-session` | `commands/save-session.md` | Save session state to `~/.claude/sessions/` | Uses session-manager patterns |
| `/resume-session` | `commands/resume-session.md` | Load last saved session and display structured briefing | Reads from `~/.claude/sessions/` |
| `/verify` | `commands/verify.md` | Run comprehensive verification (build, types, lint, tests, console.log audit) | Project build tools |
| `/skill-health` | `commands/skill-health.md` | Show skill health dashboard with sparklines | Runs `ecc/skills-health.js --dashboard` |
| `/context-budget` | `commands/context-budget.md` | Analyze context window usage and optimization | References `skills/context-budget/SKILL.md` |
| `/discuss-mode` | `commands/discuss-mode.md` | Switch to thinking-partner mode (no code, Korean, opinionated) | Read-only tools only |

---

## Part 3: Library Modules

### 3.1 `lib/utils.js` — Core Utilities
**Exports:** 37 functions/constants

| Function | Description | Used By |
|----------|-------------|---------|
| `getHomeDir()` | Cross-platform `os.homedir()` | All hooks |
| `getClaudeDir()` | `~/.claude` path | session-start, session-end, cost-tracker |
| `getSessionsDir()` | `~/.claude/sessions` | session-start, session-end, pre-compact |
| `getLearnedSkillsDir()` | `~/.claude/skills/learned` | session-start, evaluate-session |
| `getTempDir()` | `os.tmpdir()` | suggest-compact |
| `ensureDir(path)` | mkdir -p equivalent | Many hooks |
| `getDateString()` | YYYY-MM-DD | session-end |
| `getTimeString()` | HH:MM | session-end, pre-compact |
| `getDateTimeString()` | YYYY-MM-DD HH:MM:SS | pre-compact |
| `getSessionIdShort()` | Last 8 chars of CLAUDE_SESSION_ID | session-end |
| `getProjectName()` | git repo name or cwd basename | session-end |
| `findFiles(dir, pattern, opts)` | Glob-like file search with age filter | session-start, pre-compact |
| `readFile(path)` | Safe fs.readFileSync | Many |
| `writeFile(path, content)` | Write with auto-mkdir | session-end |
| `appendFile(path, content)` | Append with auto-mkdir | pre-compact, cost-tracker, tracker |
| `readStdinJson(opts)` | Parse stdin JSON with timeout | Available but not heavily used |
| `log(msg)` | stderr output (visible to user) | All hooks |
| `output(data)` | stdout output (returned to Claude) | session-start |
| `runCommand(cmd)` | Shell exec with allowlist (git/node/npx/which/where only) + metachar blocking | session-end, utils internal |
| `commandExists(cmd)` | Check PATH via `which`/`where` | package-manager |
| `isGitRepo()` | `git rev-parse --git-dir` | utils internal |
| `getGitModifiedFiles(patterns)` | `git diff --name-only HEAD` | Available |
| `replaceInFile()` | Search-replace in file | Available |
| `countInFile()` | Count pattern matches | evaluate-session |
| `grepFile()` | Search file with line numbers | Available |
| `stripAnsi()` | Remove ANSI escape codes | session-start, session-end |
| `isWindows/isMacOS/isLinux` | Platform detection constants | Available |

### 3.2 `lib/hook-flags.js` — Hook Enable/Disable Controls
**Exports:** `isHookEnabled`, `getHookProfile`, `getDisabledHookIds`, `parseProfiles`, `VALID_PROFILES`

Controls which hooks run based on:
- `ECC_HOOK_PROFILE` env: `minimal` | `standard` (default) | `strict`
- `ECC_DISABLED_HOOKS` env: comma-separated hook IDs to disable

**Used by:** `run-with-flags.js`, `check-hook-enabled.js`

### 3.3 `lib/package-manager.js` — Package Manager Detection
**Exports:** `getPackageManager`, `setPreferredPackageManager`, `getRunCommand`, `getExecCommand`, `getSelectionPrompt`, `getCommandPattern`, etc.

Detection priority: env var → project config → package.json field → lock file → global config → npm default. Supports npm, pnpm, yarn, bun. Never spawns child processes on the hot path (avoids Bun spawn limit on Windows).

**Used by:** `session-start.js`, `resolve-formatter.js`

### 3.4 `lib/project-detect.js` — Project Type/Framework Detection
**Exports:** `detectProjectType`, `LANGUAGE_RULES`, `FRAMEWORK_RULES`, various dep-reader functions

Detects 12 languages (Python, TypeScript, JavaScript, Go, Rust, Ruby, Java, C#, Swift, Kotlin, Elixir, PHP) and 22 frameworks (Django, FastAPI, Next.js, React, Vue, Angular, Express, NestJS, Rails, Spring, Laravel, etc.) from marker files and dependency lists.

**Used by:** `session-start.js`

### 3.5 `lib/resolve-formatter.js` — Formatter Resolution
**Exports:** `findProjectRoot`, `detectFormatter`, `resolveFormatterBin`, `clearCaches`

Walks up directory tree to find project root. Detects Biome or Prettier from config files. Resolves formatter binary (local node_modules/.bin preferred over npx). Per-process caching.

**Used by:** `quality-gate.js`

### 3.6 `lib/session-aliases.js` — Session Alias Management
**Exports:** `loadAliases`, `saveAliases`, `resolveAlias`, `setAlias`, `listAliases`, `deleteAlias`, `renameAlias`, `cleanupAliases`, etc.

Full CRUD for session aliases stored in `~/.claude/session-aliases.json`. Atomic writes with backup/restore. Alias names: alphanumeric + dash + underscore, max 128 chars. Reserved names blocked.

**Used by:** `session-start.js`

### 3.7 `lib/session-manager.js` — Session CRUD
**Exports:** `parseSessionFilename`, `getAllSessions`, `getSessionById`, `parseSessionMetadata`, `getSessionStats`, `writeSessionContent`, `deleteSession`, etc.

Manages `~/.claude/sessions/*.tmp` files. Parses structured markdown with sections (Completed, In Progress, Notes, Context to Load). Supports pagination and filtering.

**Used by:** Available for commands, used by session-end.js implicitly

### 3.8 `lib/shell-split.js` — Shell Command Splitting
**Exports:** `splitShellSegments`

Splits shell commands by operators (`&&`, `||`, `;`, `&`) while respecting quotes and escapes. Handles redirections (`&>`, `>&`, `2>&1`).

**Used by:** Available for hooks that need to analyze Bash commands

### 3.9 Skill Evolution System (`lib/skill-evolution/`)

#### `lib/skill-evolution/index.js`
Re-exports all submodules: provenance, versioning, tracker, health, dashboard.

#### `lib/skill-evolution/tracker.js` — Execution Recording
**Exports:** `recordSkillExecution`, `readSkillExecutionRecords`, `normalizeExecutionRecord`

Records skill execution outcomes to `~/.claude/state/skill-runs.jsonl`. Each record: skill_id, skill_version, task_description, outcome (success/failure/partial), user_feedback (accepted/corrected/rejected), tokens_used, duration_ms.

#### `lib/skill-evolution/versioning.js` — Skill Version Management
**Exports:** `createVersion`, `rollbackTo`, `listVersions`, `getCurrentVersion`, `getEvolutionLog`, `appendEvolutionRecord`

Each skill directory has `.versions/` (v1.md, v2.md snapshots) and `.evolution/` (observations.jsonl, inspections.jsonl, amendments.jsonl). Supports snapshot creation, rollback to any version, and evolution log append.

#### `lib/skill-evolution/provenance.js` — Skill Origin Tracking
**Exports:** `getSkillRoots`, `classifySkillPath`, `readProvenance`, `writeProvenance`, `SKILL_TYPES`

Skill types: curated (in repo `skills/`), learned (`~/.claude/skills/learned/`), imported (`~/.claude/skills/imported/`). Provenance metadata (`.provenance.json`) required for learned/imported skills: source, created_at, confidence (0-1), author.

#### `lib/skill-evolution/health.js` — Skill Health Analysis
**Exports:** `collectSkillHealth`, `formatHealthReport`, `discoverSkills`, `calculateSuccessRate`, `summarizeHealthReport`

Discovers all skills across curated/learned/imported roots. Calculates per-skill: success rate (7d and 30d), failure trend (worsening/stable/improving), pending amendments count, last run timestamp. Configurable warn threshold (default 10% decline).

#### `lib/skill-evolution/dashboard.js` — Visual Dashboard
**Exports:** `renderDashboard`, `sparkline`, `horizontalBar`, `panelBox`, 4 panel renderers

Four panels:
1. **Success Rate (30d)** — sparkline charts per skill with 7d rate and trend arrow
2. **Failure Patterns** — clusters failure reasons with horizontal bar charts
3. **Pending Amendments** — lists pending/proposed skill amendments
4. **Version History** — version timeline per skill with reasons

Unicode box drawing, block elements (▁▂▃▄▅▆▇█░).

### 3.10 Skill Improvement System (`lib/skill-improvement/`)

#### `lib/skill-improvement/observations.js`
**Exports:** `createSkillObservation`, `appendSkillObservation`, `readSkillObservations`

Creates structured observation records (schema v1) with task, skill ID, outcome (success/error/feedback), variant tracking (baseline vs amended), and session/amendment IDs. Stored in `.claude/ecc/skills/observations.jsonl`.

#### `lib/skill-improvement/health.js`
**Exports:** `buildSkillHealthReport`

Builds per-skill health reports: total runs, success/failure counts, recurring errors/tasks/feedback (ranked by count), variant breakdowns (baseline vs amended), status derivation (healthy/watch/failing).

#### `lib/skill-improvement/evaluate.js`
**Exports:** `buildSkillEvaluationScaffold`

A/B evaluation: compares baseline vs amended skill variants. Requires minimum runs per variant (default 2). Recommendations: promote-amendment, keep-baseline, or insufficient-data.

#### `lib.skill-improvement/amendify.js`
**Exports:** `proposeSkillAmendment`

Generates amendment proposals from failure analysis. Includes: evidence (total runs, failures, recurring errors/tasks/feedback), rationale, and a markdown-fragment patch preview with suggested guardrails and verification checklists.

### 3.11 `skills-health.js` — CLI Entry Point
Standalone CLI for skill health. Modes: `--dashboard` (full/single panel), `--json`, plain report. Parses CLI args and delegates to health/dashboard modules.

---

## Part 4: Instinct System (`instinct-cli.py`)

### 4.1 Architecture

**Base directory:** `~/.claude/homunculus/`
- `projects.json` — project registry (auto-updated)
- `instincts/personal/` — global personal instincts
- `instincts/inherited/` — global inherited (imported) instincts
- `evolved/{skills,commands,agents}/` — evolved structures
- `observations.jsonl` — global observation log
- `projects/<project-id>/` — per-project directories
  - `instincts/personal/` — project personal instincts
  - `instincts/inherited/` — project inherited instincts
  - `evolved/{skills,commands,agents}/` — project evolved structures
  - `observations.jsonl` — project observations

**Project detection:** CLAUDE_PROJECT_DIR env → git repo root → global fallback. Project ID = SHA-256(remote URL or path)[:12].

### 4.2 Subcommands

#### `status`
Shows all instincts grouped by scope (project vs global) and domain. Each instinct displays: confidence bar (█░ visualization, 0-100%), trigger, action summary. Also shows observation event count.

#### `import <source> [flags]`
Imports from local file or HTTP(S) URL. Parses YAML-like frontmatter format. Deduplicates: skips existing with equal/higher confidence, updates with higher confidence. Flags: `--dry-run`, `--force`, `--min-confidence`, `--scope project|global`.

#### `export [flags]`
Exports instincts to YAML file or stdout. Filters: `--domain`, `--min-confidence`, `--scope project|global|all`.

#### `evolve [--generate]`
Clusters instincts by trigger similarity (normalized keyword matching). Identifies:
- **Skill candidates**: 2+ instincts with similar triggers
- **Command candidates**: high-confidence (>=70%) workflow-domain instincts
- **Agent candidates**: 3+ instinct clusters with avg confidence >=75%
Also shows promotion candidates (project → global).

`--generate` writes files to `evolved/{skills,commands,agents}/`.

#### `promote [instinct-id] [--force] [--dry-run]`
Two modes:
1. **Specific**: promote one instinct by ID from current project to global
2. **Auto**: find instincts appearing in 2+ projects with avg confidence >=80%, promote to global

Auto-promotion thresholds:
- `PROMOTE_CONFIDENCE_THRESHOLD = 0.8`
- `PROMOTE_MIN_PROJECTS = 2`

#### `projects`
Lists all registered projects with: name, root, remote, personal/inherited instinct counts, observation counts, last seen timestamp.

### 4.3 File Format

```yaml
---
id: grep-before-edit
trigger: "when modifying code"
confidence: 0.7
domain: workflow
source: personal
scope: project
---

## Action

Always grep for existing usage before editing a function...
```

Allowed extensions: `.yaml`, `.yml`, `.md`

### 4.4 Security

- Path traversal protection: blocks system directories (/etc, /usr, /bin, /proc, /sys, etc.)
- Instinct ID validation: alphanumeric + `.` + `-` + `_`, no path separators, no `..`, max 128 chars
- Atomic file writes for registry (tmp file + os.replace)

---

## Part 5: Skill Evolution System — How It All Connects

### 5.1 Lifecycle

```
Session Work → /learn or /learn-eval → Skill Created
    ↓
evaluate-session.js flags long sessions
    ↓
Skill Execution → tracker.js records outcome
    ↓
/skill-health → health.js + dashboard.js → Visual Report
    ↓
amendify.js proposes amendments from failures
    ↓
evaluate.js A/B tests baseline vs amended
    ↓
versioning.js snapshots + rollback
    ↓
provenance.js tracks origin (curated/learned/imported)
```

### 5.2 What Triggers Evolution

1. **Manual**: User runs `/learn` or `/learn-eval` to extract patterns
2. **Automated signal**: `evaluate-session.js` flags sessions with 10+ user messages
3. **Health monitoring**: `/skill-health` shows declining skills → suggests `/evolve`
4. **Amendment proposals**: `amendify.js` generates patches from failure patterns
5. **A/B evaluation**: `evaluate.js` compares baseline vs amended variants

### 5.3 How Health Is Measured

- **Success rate**: 7-day and 30-day windows from skill-runs.jsonl
- **Failure trend**: `worsening` if 7d rate drops >10% below 30d rate
- **Pending amendments**: count of proposals with status pending/proposed/queued/open
- **Run count**: execution frequency as engagement metric

---

## Part 6: Recommendations

### 6.1 What Should Run in `/loop 3h` (Automated Periodic Tasks)

| Task | Priority | Rationale |
|------|----------|-----------|
| `/skill-health` | ★★★ | Periodic health check catches declining skills early |
| `/instinct-status` | ★★ | Monitor instinct growth and identify promotion candidates |
| `/verify quick` | ★★ | Catch type errors before they accumulate |
| `/projects` | ★ | Track project registry (lightweight) |

### 6.2 What the User (Non-Developer) Can Use

| Command | Difficulty | Value | Notes |
|---------|-----------|-------|-------|
| `/save-session` | Easy | ★★★ | End-of-session ritual, ensures continuity |
| `/resume-session` | Easy | ★★★ | Start-of-session ritual, full context reload |
| `/discuss-mode` | Easy | ★★★ | "논의" triggers thinking-partner mode |
| `/learn` | Easy | ★★ | After solving something interesting |
| `/skill-health` | Easy | ★★ | Visual dashboard of skill portfolio |
| `/instinct-status` | Easy | ★★ | See what patterns Claude has learned |
| `/checkpoint` | Medium | ★★ | Track progress milestones |
| `/verify` | Medium | ★★ | Pre-PR quality check |
| `/evolve` | Medium | ★ | Cluster instincts into higher-level structures |

### 6.3 What Needs Fixing / Isn't Working

| Issue | Severity | Details |
|-------|----------|---------|
| **MCP Health Check not registered** | Medium | `mcp-health-check.js` is a full 589-line implementation with probing, backoff, and reconnect — but is NOT in hooks.json. It would need to be registered as a PreToolUse hook on MCP tool matchers. |
| **Quality Gate not registered** | Low | `quality-gate.js` supports Biome/Prettier/gofmt/ruff but is not in hooks.json. Biome/Prettier integration only works if the project has these configured. |
| **Governance Capture disabled by default** | Low | Requires `ECC_GOVERNANCE_CAPTURE=1` env var. Good security feature but inactive. |
| **Instinct system has no instincts** | Medium | The entire instinct system (cli.py, 6 subcommands) exists but there are likely 0 instincts saved — the system is fully operational but unused. No `~/.claude/homunculus/` content was created via normal workflow. |
| **Evaluate-session only signals** | Low | It flags sessions for extraction but doesn't actually create skills. It relies on Claude interpreting the stderr message — which doesn't happen because the message is just a log line. |
| **Skill Evolution has no execution data** | Medium | `skill-runs.jsonl` likely doesn't exist or is empty. The tracker, health, and dashboard systems are fully implemented but have no data flowing through them. |
| **cost-tracker.js opus-4-6 rate may be stale** | Low | Hardcoded $15/$75 per 1M tokens for Opus 4.6. Should be verified against current pricing. |

### 6.4 What's Most Valuable But Unused

| Feature | Value | Why Unused |
|---------|-------|------------|
| **Session Save/Resume** (`/save-session` + `/resume-session`) | ★★★★★ | These are the killer features for cross-session continuity. The auto session-end hook creates basic summaries, but the manual `/save-session` creates much richer context. Should be used at end of every session. |
| **MCP Health Check** | ★★★★ | Would prevent wasted Claude context on dead MCP servers by probing before use and auto-reconnecting. Just needs registration in hooks.json. |
| **Instinct System** | ★★★★ | A complete learn-from-experience framework. `/learn-eval`'s quality gate is particularly well-designed (checklist + holistic verdict). But zero instincts exist because nobody has run `/learn` or `/learn-eval`. |
| **Cost Tracking** | ★★★ | `costs.jsonl` is being written every session end. But nobody is reading it — there's no dashboard or report command for cost data. |
| **Skill Health Dashboard** | ★★★ | Beautiful Unicode sparkline charts, failure clustering, version timelines. All implemented. Zero data because no skills have execution records. |
| **Quality Gate** | ★★ | Auto-formatting after edits (Biome/Prettier/gofmt/ruff). Would be useful but needs registration + the project doesn't use Biome/Prettier currently. |

---

## Appendix: File Inventory

### ECC Hooks (14 files)
```
.claude/hooks/ecc/hooks/
├── check-hook-enabled.js    (13 lines) — CLI utility
├── cost-tracker.js          (81 lines) — Stop hook, cost metrics
├── doc-file-warning.js      (87 lines) — PreToolUse Write, doc warnings
├── evaluate-session.js      (101 lines) — Stop hook, session evaluation signal
├── governance-capture.js    (285 lines) — Pre/PostToolUse, security events
├── mcp-health-check.js      (589 lines) — UNREGISTERED, MCP health probe
├── post-edit-console-warn.js (55 lines) — PostToolUse Edit, console.log warnings
├── pre-compact.js           (49 lines) — PreCompact, state preservation
├── quality-gate.js          (169 lines) — UNREGISTERED, auto-formatting
├── run-with-flags.js        (121 lines) — Feature-flag hook runner
├── session-end-marker.js    (30 lines) — UNREGISTERED, passthrough
├── session-end.js           (302 lines) — Stop hook, session persistence
├── session-start.js         (99 lines) — SessionStart, context loading
└── suggest-compact.js       (81 lines) — PreToolUse, compaction suggestion
```

### ECC Lib (18 files)
```
.claude/hooks/ecc/lib/
├── hook-flags.js            (75 lines) — Hook profile system
├── package-manager.js       (432 lines) — PM detection & commands
├── project-detect.js        (429 lines) — Language/framework detection
├── resolve-formatter.js     (186 lines) — Formatter resolution with caching
├── session-aliases.js       (482 lines) — Session alias CRUD
├── session-manager.js       (465 lines) — Session file CRUD
├── shell-split.js           (87 lines) — Shell command segmentation
├── utils.js                 (565 lines) — Core utilities (37 exports)
├── skill-evolution/
│   ├── index.js             (21 lines) — Re-exports all submodules
│   ├── dashboard.js         (402 lines) — Unicode visual dashboard
│   ├── health.js            (264 lines) — Skill health analysis
│   ├── provenance.js        (188 lines) — Skill origin tracking
│   ├── tracker.js           (147 lines) — Execution recording
│   └── versioning.js        (238 lines) — Version snapshots & rollback
└── skill-improvement/
    ├── amendify.js          (90 lines) — Amendment proposal generation
    ├── evaluate.js          (60 lines) — A/B evaluation scaffold
    ├── health.js            (119 lines) — Health report builder
    └── observations.js      (109 lines) — Observation recording
```

### Instinct CLI (1 file)
```
.claude/hooks/instincts/
└── instinct-cli.py          (1149 lines) — Full instinct management
```

### ECC Commands (15 files)
```
.claude/commands/
├── learn.md                 — Extract patterns
├── learn-eval.md            — Extract with quality gate
├── evolve.md                — Cluster instincts
├── promote.md               — Project → global promotion
├── instinct-status.md       — Show instincts
├── instinct-import.md       — Import instincts
├── instinct-export.md       — Export instincts
├── projects.md              — List projects
├── checkpoint.md            — Workflow checkpoints
├── save-session.md          — Save session state
├── resume-session.md        — Resume session state
├── verify.md                — Codebase verification
├── skill-health.md          — Skill health dashboard
├── context-budget.md        — Context window analysis
└── discuss-mode.md          — Thinking partner mode
```

### Non-ECC Hooks (6 files)
```
.claude/hooks/
├── cleanup.sh               — Stale resource cleanup
├── pre-commit-tsc.sh        — TypeScript check before commit
├── party-log-verify.sh      — Party log validation
├── party-mode-compliance.js — BMAD party mode rules
├── post-compact-save.sh     — Auto-save on compact
└── session-end-reminder.sh  — Update log reminder
```

**Total: 54 files, ~7,500+ lines of code**
