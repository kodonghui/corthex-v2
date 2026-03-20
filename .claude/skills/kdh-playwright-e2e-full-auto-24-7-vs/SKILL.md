# KDH Playwright E2E Full-Auto 24/7 — VS Version v2.0

Loop-based automated E2E testing + instant bug fix + deploy. Designed to run via `/loop 15m` in VSCode Claude Code.

## When to Use

- `/loop 15m /kdh-playwright-e2e-full-auto-24-7` — 15분마다 자동 사이클
- `/kdh-playwright-e2e-full-auto-24-7` — 단발 실행
- "E2E 돌려", "전수검사", "밤새 돌려", "버그 싹 잡아"

## Prerequisites

- Playwright MCP configured in `.mcp.json` (headless)
- Live site accessible (default: https://corthex-hq.com)
- Admin credentials: admin / admin1234

## Args

- No args: full cycle (all phases)
- `admin`: admin pages only
- `ceo`: CEO app pages only
- `api-only`: Phase 1 only (API smoke test)
- `quick`: Phase 0+1 only (pre-flight + API)

---

## Cycle Structure (15min target)

Each cycle is fully autonomous: detect → test → fix → deploy → cleanup → report.

### Phase 0: Pre-flight (30s)

```
1. curl GET {BASE_URL}/health → site alive?
   - DOWN → log "SITE DOWN" → skip cycle → wait for next

2. POST {BASE_URL}/api/auth/admin/login → get token
   - FAIL → log "LOGIN FAILED" → skip cycle

3. gh run list -L 1 → last deploy status
   - FAILED → log warning, continue anyway (might be the bug we need to fix)

4. Read _qa-e2e/playwright-e2e/cycle-report.md → previous cycle results
   - Unresolved bugs from last cycle = priority targets this cycle

5. Read _qa-e2e/playwright-e2e/known-behaviors.md → load KB entries
   - Used in Phase 2 to suppress known false positives

6. Read _qa-e2e/playwright-e2e/ESCALATED.md → load escalated bugs
   - Count report frequency per bug ID for warning threshold

7. Read _qa-e2e/playwright-e2e/stability-state.md → load stability state
   - Check current mode (ACTIVE or WATCH)
   - Read last_commit_hash, compare with `git rev-parse HEAD`
   - If new commit detected → reset consecutive_clean_cycles to 0, set mode ACTIVE
   - If mode=WATCH → run Auto-Stabilization Protocol (see below)

8. Clean up stale test companies from previous cycles:
   GET /api/admin/companies → find any with name starting "E2E-TEMP"
   For each found: DELETE /api/admin/companies/{id}
   Log: "Cleaned N stale E2E-TEMP companies"

9. Create test company for CRUD isolation:
   POST /api/admin/companies { name: "E2E-TEMP-{N}" }
   Store E2E_COMPANY_ID from response
   - FAIL → log warning, continue (CRUD tests will use existing data read-only)
```

### Phase 1: API Smoke Test (1min)

```
Using curl with admin token, hit ALL endpoints:

Admin endpoints (~25):
  /admin/companies, /admin/users, /admin/employees, /admin/departments,
  /admin/agents, /admin/tools/catalog, /admin/costs/summary,
  /admin/costs/by-agent, /admin/costs/by-model, /admin/costs/daily,
  /admin/budget, /admin/credentials, /admin/api-keys,
  /admin/report-lines, /admin/org-chart, /admin/org-templates,
  /admin/soul-templates, /admin/monitoring/status, /admin/audit-logs,
  /admin/tool-invocations, /admin/nexus/layout, /admin/quality-rules,
  /admin/company-settings/handoff-depth, /admin/mcp-servers

Workspace endpoints (~10):
  /workspace/workflows, /workspace/hub, /workspace/conversations,
  /workspace/notifications, /workspace/files, /workspace/knowledge

For each:
  - 200/201 → OK
  - 500 → CRITICAL bug (record error message)
  - 404 → HIGH bug (route not mounted)
  - 401/403 → Check if auth issue
```

### Phase 2: Playwright Page Sweep + Interaction (5min)

```
Using Playwright MCP tools:

Step 2.0: Pre-check
  Load known-behaviors.md entries (from Phase 0)
  Load ESCALATED.md entries (from Phase 0)
  For any bug candidate in Steps 2.1-2.5:
    - Match against KB entries → if match AND "When it IS a bug" NOT met → SKIP
    - Match against ESCALATED entries → if already reported >= 3 cycles → do NOT re-report,
      just note "still present" in report

Step 2.1: Login
  browser_navigate → /admin/login
  browser_fill_form → admin / admin1234
  browser_click → 로그인

Step 2.2: Admin Page Sweep (24 pages)
  For each page in admin routes (from App.tsx):
    1. browser_navigate(url)
    2. browser_snapshot() → collect page structure
    3. browser_console_messages(level: "error") → collect errors
    4. If errors or empty main content → browser_take_screenshot()
    5. Record: { page, status, errors, elements }

Step 2.3: Interaction Testing (on each page)
  From snapshot, collect all interactive elements:
    - button[ref], a[ref], [role=button], select[ref]
    - Exclude: logout button, external links

  For each clickable element:
    1. browser_click(ref) → what happens?
    2. browser_snapshot() → check result:
       - Modal opened? → OK, close it and continue
       - Navigation? → OK, go back
       - Console error? → BUG
       - Nothing happened? → BUG ("dead button")
       - Page crashed/blank? → CRITICAL BUG
    3. browser_console_messages(level: "error") → new errors?

  For each form found:
    1. Try submit empty → check validation
    2. Fill with Korean test data using E2E_COMPANY_ID scope:
       - 회사명: "테스트 주식회사"
       - 이름: "김테스트"
       - 이메일: "test@test.com"
       - 비밀번호: "Test1234!"
    3. Submit → check success/error
    4. If created something → DELETE it immediately (cleanup within E2E_COMPANY_ID)

  For each dropdown/select:
    1. browser_select_option → try each option
    2. Check if page updates correctly

  For each tab/filter:
    1. browser_click each tab
    2. Verify content changes

Step 2.4: Socrates Method
  Before each page test, declare expected state:
    "Dashboard should show: 4 stat cards, recent activity table"
    "Companies should show: company list or empty state with Add button"
  After test, compare actual vs expected.
  Mismatch = BUG (unless matched by known-behaviors.md).

Step 2.5: Console Error Sweep
  After all pages visited:
    browser_console_messages(level: "error")
    Any uncaught error = at minimum MINOR bug
    ChunkLoadError, TypeError, 500 response = MAJOR bug
```

### Phase 3: React Code Analysis + Cross-Check (30s)

```
Static analysis (no browser needed):

1. Route-API Mismatch Detection:
   - Parse App.tsx → extract all <Route path="...">
   - For each page file: grep api.get/post/put/delete calls
   - Cross-reference with server routes (index.ts app.route lines)
   - Mismatch = BUG

2. Cross-Check (from cross-check.sh logic):
   - Grep for remaining bg-blue- in admin pages → should be olive
   - Grep for Material Symbols → should be Lucide
   - Check tenantMiddleware presence in admin routes
   - Check migration IF NOT EXISTS
```

### Phase 4: Bug Fix (5min)

```
Collect all bugs from Phase 1-3, sort by severity:

Priority order:
  P0: CRITICAL — 500 errors, page crashes, site down
  P1: HIGH — 404 routes, dead buttons, broken CRUD
  P2: MEDIUM — console errors, empty pages that should have content
  P3: LOW — design inconsistency, missing validation, UX issues

For each bug (P0 first):
  1. Read the relevant file(s)
  2. Identify root cause
  3. Apply minimal fix (don't refactor surrounding code)
  4. Run: bunx tsc --noEmit -p packages/server/tsconfig.json
  5. Run: bunx tsc --noEmit -p packages/admin/tsconfig.json
  6. If type error → fix it
  7. If 2 attempts fail → mark as ESCALATED:
     a. Append to _qa-e2e/playwright-e2e/ESCALATED.md under ## Active:
        "### ESC-{id}: {title}\n- Page: {url}\n- Error: {msg}\n- Cycles reported: 1\n- First seen: {date}"
     b. If bug already in ESCALATED.md → increment "Cycles reported" count
     c. If "Cycles reported" >= 3 → add "⚠ WARNING: re-reported 3+ cycles" to cycle report

Smart file limits per cycle:
  - Logic files (*.ts server routes, engine, lib): max 3
  - Style files (*.css, tailwind classes in *.tsx): max 10
  - Text/i18n files (labels, messages, constants): max 15
  - Mixed changes: max 5 files total

Safety rules:
  - No deleting files
  - No changing package.json dependencies
  - No modifying migrations
  - No touching auth.ts or middleware (too risky for auto-fix)
```

### Phase 5: Simplify (1min)

```
If any files were modified in Phase 4:
  Run /simplify logic on changed files only:
  - Code reuse: existing utils that could replace new code?
  - Code quality: redundant state, copy-paste, leaky abstractions?
  - Efficiency: unnecessary work, missed concurrency?
  Fix any issues found.
```

### Phase 6: Deploy + Post-Deploy Verification (2min)

```
If any files were modified:
  1. git add {specific changed files only}
  2. git commit -m "fix(e2e-cycle-N): {bug summary}

     Bugs fixed: {count}
     - P{X}: {description}
     ...

     Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
  3. git push origin main
  4. gh run list -L 1 → verify deploy started
  5. Wait for deploy to complete (poll gh run list every 15s, max 90s)
  6. Run: bash .claude/hooks/smoke-test.sh
     - Record result: PASS (all endpoints 200) or FAIL (list failing endpoints)
     - If FAIL → note in cycle report, these become P0 targets next cycle

If no files modified:
  Skip deploy.
```

### Phase 7: Working State Update (30s)

```
Update .claude/memory/working-state.md:
  - Last cycle: #{N} at {time}
  - Bugs fixed this cycle: {count}
  - Bugs remaining: {list}
  - Total cycles run: {N}
  - Total bugs fixed: {N}
  - Next cycle priority: {what to focus on}

Update _qa-e2e/playwright-e2e/stability-state.md:
  - If 0 bugs found this cycle → increment consecutive_clean_cycles
  - If bugs found → reset consecutive_clean_cycles to 0
  - Update last_commit_hash to current HEAD
  - If consecutive_clean_cycles >= 3 → set mode: WATCH, record entered_watch_at
```

### Phase 8: Report + Cleanup (15s)

```
1. Delete test company:
   DELETE /api/admin/companies/{E2E_COMPANY_ID}
   - FAIL → retry once after 2s
   - Still FAIL → log warning (Phase 0 of next cycle will clean it up)

2. Append to _qa-e2e/playwright-e2e/cycle-report.md:

## Cycle #{N} — {timestamp}
- Mode: {ACTIVE|WATCH}
- API: {passed}/{total} OK
- Pages loaded: {N}/{total}
- Console errors: {N}
- Dead buttons: {N}
- Bugs found: {N} (P0:{n} P1:{n} P2:{n} P3:{n})
- Bugs fixed: {N}
- Bugs remaining: {N}
- Bugs escalated: {N}
- Known-behavior matches skipped: {N}
- Files modified: {list}
- Deploy: {success|failed|skipped}
- Post-deploy smoke: {PASS|FAIL|skipped}
- Clean cycles streak: {N}
```

---

## Auto-Stabilization Protocol

When `stability-state.md` shows `mode: WATCH`:

```
Trigger: consecutive_clean_cycles >= 3 (no bugs found for 3 straight cycles)

VS WATCH Mode behavior:
  - Phase 0: normal (including commit hash check)
  - Phase 1: normal API smoke test
  - Phase 2: REDUCED — API smoke + sidebar navigation only
    - Navigate each sidebar link, verify page loads without crash
    - Skip: interaction testing, form fills, click sweeps
  - Phase 3: normal cross-check
  - Phase 4: SKIPPED entirely (no fixes in watch mode)
  - Phase 5: SKIPPED
  - Phase 6: SKIPPED (nothing to deploy)
  - Phase 7: normal (update stability state)
  - Phase 8: normal report
  - Interval: 2 hours (not 15min)

Exit WATCH mode when ANY of:
  - New bug detected in Phase 1 or 2 → immediate exit, run full ACTIVE cycle
  - New commit detected (git rev-parse HEAD != last_commit_hash) → exit, full cycle
  - Manual request ("E2E 돌려", "전수검사") → exit, full cycle

On exit: set mode=ACTIVE, reset consecutive_clean_cycles=0 in stability-state.md
```

---

## Timeouts

| Phase | Timeout | On timeout |
|-------|---------|------------|
| Pre-flight | 30s | Skip cycle |
| API smoke test | 2min | Report partial, continue |
| Per page navigation | 10s | Mark TIMEOUT, continue |
| Per interaction | 5s | Mark FAIL, continue |
| Bug fix per bug | 3min | Skip bug, mark ESCALATED |
| Post-deploy smoke | 2min | Mark FAIL, continue |
| Total cycle | 14min | Force report with partial results |

## Rules

1. **Never stop on single failure** — record and continue
2. **Screenshot on bugs** — visual evidence is mandatory
3. **Console errors are bugs** — no exceptions (unless in known-behaviors.md)
4. **Dead buttons are bugs** — clickable element that does nothing = BUG
5. **Clean up test data** — delete E2E-TEMP company in Phase 8; delete anything created during CRUD
6. **Type-check before commit** — tsc must pass or no deploy
7. **Smart file limits** — Logic 3, Style 10, Text/i18n 15, Mixed 5
8. **Don't touch auth/middleware** — too risky for auto-fix
9. **Olive theme only** — any blue (#3b82f6, bg-blue-*) = immediate fix
10. **Report every cycle** — even if 0 bugs found
11. **Check known-behaviors.md** — before reporting any bug, verify it's not a known behavior
12. **Update ESCALATED.md** — failed fixes go to ESCALATED; warn at 3+ re-reports
13. **Respect stabilization mode** — WATCH mode = reduced testing, 2h interval

## Output

```
_qa-e2e/playwright-e2e/
  cycle-report.md          ← cumulative report (appended each cycle)
  known-behaviors.md       ← intentional behaviors, not bugs (read in Phase 0)
  ESCALATED.md             ← bugs requiring manual intervention (updated in Phase 4)
  stability-state.md       ← ACTIVE/WATCH mode + clean cycle count
  screenshots/
    cycle-{N}/
      {page}-{bug-id}.png  ← bug evidence
```
