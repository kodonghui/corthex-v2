# KDH Playwright E2E Full-Auto 24/7 — VS Version

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

Each cycle is fully autonomous: detect → test → fix → deploy → report.

### Phase 0: Pre-flight (15s)

```
1. curl GET {BASE_URL}/health → site alive?
   - DOWN → log "SITE DOWN" → skip cycle → wait for next
2. POST {BASE_URL}/api/auth/admin/login → get token
   - FAIL → log "LOGIN FAILED" → skip cycle
3. gh run list -L 1 → last deploy status
   - FAILED → log warning, continue anyway (might be the bug we need to fix)
4. Read _qa-e2e/playwright-e2e/cycle-report.md → previous cycle results
   - Unresolved bugs from last cycle = priority targets this cycle
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
    2. Fill with Korean test data:
       - 회사명: "테스트 주식회사"
       - 이름: "김테스트"
       - 이메일: "test@test.com"
       - 비밀번호: "Test1234!"
    3. Submit → check success/error
    4. If created something → DELETE it (cleanup)

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
  Mismatch = BUG.

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
  7. If 2 attempts fail → skip, mark as ESCALATED

Safety limits:
  - Max 5 files modified per cycle
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

### Phase 6: Deploy + Verify (2min)

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
```

### Phase 8: Report (15s)

```
Append to _qa-e2e/playwright-e2e/cycle-report.md:

## Cycle #{N} — {timestamp}
- API: {passed}/{total} OK
- Pages loaded: {N}/{total}
- Console errors: {N}
- Dead buttons: {N}
- Bugs found: {N} (P0:{n} P1:{n} P2:{n} P3:{n})
- Bugs fixed: {N}
- Bugs remaining: {N}
- Bugs escalated: {N}
- Files modified: {list}
- Deploy: {success|failed|skipped}
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
| Total cycle | 14min | Force report with partial results |

## Rules

1. **Never stop on single failure** — record and continue
2. **Screenshot on bugs** — visual evidence is mandatory
3. **Console errors are bugs** — no exceptions
4. **Dead buttons are bugs** — clickable element that does nothing = BUG
5. **Clean up test data** — delete anything created during CRUD testing
6. **Type-check before commit** — tsc must pass or no deploy
7. **Max 5 files per cycle** — prevent runaway changes
8. **Don't touch auth/middleware** — too risky for auto-fix
9. **Olive theme only** — any blue (#3b82f6, bg-blue-*) = immediate fix
10. **Report every cycle** — even if 0 bugs found

## Output

```
_qa-e2e/playwright-e2e/
  cycle-report.md          ← cumulative report (appended each cycle)
  screenshots/
    cycle-{N}/
      {page}-{bug-id}.png  ← bug evidence
```
