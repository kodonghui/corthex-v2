# KDH Playwright E2E Full-Auto 24/7 — TMUX Version (Team Agents)

Loop-based automated E2E testing + instant bug fix + deploy. Uses **TeamCreate** for parallel 4-agent testing. Runs on Oracle VPS inside tmux + Claude CLI.

## When to Use

- `/loop 30m /kdh-playwright-e2e-full-auto-24-7-tmux` — 30분마다 자동 사이클
- `/kdh-playwright-e2e-full-auto-24-7-tmux` — 단발 실행
- Oracle VPS tmux 세션에서 Claude CLI로 실행
- VS 버전보다 3-4배 빠름 (4개 팀 에이전트 병렬)

## Prerequisites

- Oracle VPS tmux session with Claude CLI
- Playwright MCP with headless chromium in `.mcp.json`
- Live site: https://corthex-hq.com
- Admin: admin / admin1234

---

## CRITICAL: Tool Loading (매 사이클 첫 단계)

팀 에이전트를 쓰려면 deferred tools를 먼저 로드해야 한다. **사이클 시작 전 반드시 실행:**

```
ToolSearch("select:TeamCreate,TeamDelete,TaskCreate,TaskList,TaskUpdate,TaskGet,SendMessage")
```

이걸 안 하면 TeamCreate를 못 쓰고, 습관적으로 Agent(run_in_background)로 빠진다. **절대 Agent 단독 사용 금지. 반드시 TeamCreate 먼저.**

---

## ABSOLUTE: Phase 건너뛰기 금지

**매 사이클은 반드시 Phase 0→1→2→3→4→5→6→7→8 순서대로 전부 실행한다.**

### Phase 2 (Playwright 4-Agent 테스트)는 이 스킬의 존재 이유다.

- "이전 사이클에서 이미 테스트했으니까 건너뛴다" → **절대 금지**
- "버그 목록이 이미 있으니까 바로 수정한다" → **절대 금지**
- "시간이 부족하니까 Phase 2를 줄인다" → **에이전트 수를 줄여도 되지만 0으로 건너뛰기는 금지**
- 매 사이클은 **독립적**이다. 이전 사이클 결과는 **참고만** 하고, **대체하지 않는다.**

### Phase 게이트: Phase 4 진입 전 필수 검증

Phase 4(Bug Fix)를 시작하기 전에 오케스트레이터가 반드시 확인:

```
GATE CHECK (하나라도 실패 → Phase 2로 돌아가서 재실행):
  1. cycle-{N}/agent-A.md 존재 + 10줄 이상
  2. cycle-{N}/agent-B.md 존재 + 10줄 이상
  3. cycle-{N}/agent-C.md 존재 + 10줄 이상
  4. cycle-{N}/agent-D.md 존재 + 10줄 이상
  5. cycle-{N}/screenshots/ 안에 파일 1개 이상
```

**예외: Playwright MCP 다운 시**
- 브라우저 접속 자체가 불가능한 경우에 한해
- `cycle-{N}/BROWSER_DOWN.md`에 사유 + 에러 메시지 기록
- API-only fallback 모드로 전환 (curl 테스트만)
- 이 경우에도 agent-A~D.md는 API/소스코드 분석 결과로 작성해야 함

### 이전 사이클 참고 원칙: 참고 O, 대체 X

- Agent D가 이전 `merged-bugs.md` 읽고 회귀 테스트 → OK
- Fixer가 이전 사이클 미수정 버그를 이번에 수정 → OK
- "이전 사이클에서 테스트했으니 Phase 2 건너뜀" → **절대 금지**

---

## Cycle Structure (30min target)

### Phase 0: Pre-flight (15s)

```
1. curl GET https://corthex-hq.com → site alive?
   - DOWN → log "SITE DOWN" → skip cycle
2. POST /api/auth/admin/login → get JWT token
   - FAIL → log "LOGIN FAILED" → skip cycle
3. gh run list -L 1 → last deploy status
   - FAILED → log warning, continue
4. Read _qa-e2e/playwright-e2e/cycle-report.md → previous cycle results
   - Unresolved bugs from last cycle = priority targets
5. Determine cycle number: ls cycle-* dirs → N = max + 1
6. mkdir -p _qa-e2e/playwright-e2e/cycle-{N}/screenshots
7. 오래된 사이클 삭제: cycle-(N-3) 이하 폴더 전부 rm -rf
   - 최근 3사이클만 유지 (용량 관리)
   - cycle-report.md는 삭제하지 않음 (누적 로그)
```

### Phase 1: API Smoke Test (1min)

```
Using curl with admin token + companyId query param, hit ALL endpoints:

TOKEN = (Phase 0에서 획득)
COMPANYID = "5a0bfe64-7f99-42a8-858a-68d7d23105f7"
BASE = "https://corthex-hq.com/api/admin"

Admin endpoints (~25):
  companies, users?companyId, employees?companyId, departments?companyId,
  agents?companyId, tools?companyId, costs/summary?companyId,
  costs/by-agent?companyId, costs/by-model?companyId, costs/daily?companyId,
  budget?companyId, credentials?companyId, api-keys?companyId,
  report-lines?companyId, org-chart?companyId, org-templates?companyId,
  soul-templates?companyId, monitoring?companyId, audit-logs?companyId,
  tool-invocations?companyId, mcp-servers?companyId

For each:
  - 200/201 → OK
  - 500 → CRITICAL bug (record error message)
  - 404 → HIGH bug (route not mounted)
  - 401/403 → Check if auth issue
```

---

### Phase 2: Parallel E2E Sweep — 4 Team Agents (5min)

**이 Phase가 TMUX 버전의 핵심. 반드시 TeamCreate → TaskCreate → Agent(team_name) 순서.**

#### Step 2.0: 팀 생성

```
도구 호출: TeamCreate(team_name: "e2e-cycle-{N}")
```

#### Step 2.1: 공유 파일 생성

```
Write → _qa-e2e/playwright-e2e/cycle-{N}/blockers.md  (빈 파일)
Write → _qa-e2e/playwright-e2e/cycle-{N}/bugs.md      (Phase 1 결과 포함)
```

#### Step 2.2: 태스크 4개 생성

```
도구 호출 (4개 병렬):
  TaskCreate(subject: "Agent A: Functional CRUD", description: "...")
  TaskCreate(subject: "Agent B: Visual Design", description: "...")
  TaskCreate(subject: "Agent C: Edge Security", description: "...")
  TaskCreate(subject: "Agent D: Regression Navigation", description: "...")
```

#### Step 2.3: 팀 에이전트 4개 스폰 (5초 간격)

**중요: 모든 Agent 호출에 team_name 필수. 빠뜨리면 서브에이전트가 되어 팀 통신 불가.**

```
도구 호출 (4개 — 5초 간격으로 순차 또는 병렬):

Agent(
  name: "agent-A",
  team_name: "e2e-cycle-{N}",
  description: "Functional CRUD testing",
  mode: "bypassPermissions",
  prompt: "[Agent A 프롬프트 — 아래 참조]"
)

Agent(
  name: "agent-B",
  team_name: "e2e-cycle-{N}",
  description: "Visual design testing",
  mode: "bypassPermissions",
  prompt: "[Agent B 프롬프트 — 아래 참조]"
)

Agent(
  name: "agent-C",
  team_name: "e2e-cycle-{N}",
  description: "Edge security testing",
  mode: "bypassPermissions",
  prompt: "[Agent C 프롬프트 — 아래 참조]"
)

Agent(
  name: "agent-D",
  team_name: "e2e-cycle-{N}",
  description: "Regression navigation testing",
  mode: "bypassPermissions",
  prompt: "[Agent D 프롬프트 — 아래 참조]"
)
```

#### Agent A — Functional (CRUD + Buttons)

```
Assigned pages: companies, employees, departments, agents, tools,
                credentials, api-keys, onboarding, settings, users,
                report-lines, workflows

Tasks:
  - Login via Playwright MCP → admin / admin1234
  - Click EVERY button on assigned pages
  - Dead button (no response) = BUG
  - Try CRUD: create → read → update → delete on each page
  - Form validation: empty submit, Korean test data ("테스트팀", "김테스트")
  - Clean up test data after CRUD
  - Check blockers.md before each page (skip if blocked)
  - Record all bugs to cycle-{N}/agent-A.md
  - TaskUpdate(status: "completed") when done
```

#### Agent B — Visual + Design

```
Assigned pages: ALL 21 admin pages (screenshot sweep)

Tasks:
  - Login via Playwright MCP
  - Navigate each page → browser_take_screenshot
  - Check design tokens (Natural Organic):
    - bg: cream #faf8f5, sidebar: olive dark #283618
    - bg-blue-* anywhere = BUG (should be olive/cream)
    - Material Symbols text ("check_circle", "more_vert") = BUG (should be Lucide)
    - Font not Inter = BUG
  - Check responsive: browser_resize(390, 844) → screenshot
  - Empty state: correct message displayed?
  - Record to cycle-{N}/agent-B.md
  - TaskUpdate(status: "completed") when done
```

#### Agent C — Edge + Security

```
Assigned pages: ALL admin pages + unauthenticated access

Tasks:
  - Visit each page WITHOUT token → should redirect to /admin/login
  - Login, then collect console errors on every page
  - Try XSS: <script>alert(1)</script> in text fields
  - Empty required fields → submit → should show validation
  - Rapid click: double-click delete button → should not double-delete
  - CRITICAL bugs → immediately write to blockers.md
  - Record to cycle-{N}/agent-C.md
  - TaskUpdate(status: "completed") when done
```

#### Agent D — Regression + Navigation

```
Assigned pages: sidebar full sweep + previous cycle's fixed pages

Tasks:
  - Login via Playwright MCP
  - Click EVERY sidebar link → page loads correctly?
  - Previous cycle bugs → re-test each one (regression check)
  - Theme consistency: 5+ pages, verify olive palette
  - Shared components: sidebar, layout, toast, modal
  - Session persistence: navigate 10 pages → still logged in?
  - Record to cycle-{N}/agent-D.md
  - TaskUpdate(status: "completed") when done
```

#### Step 2.4: 대기 + 수집

```
대기 방법: TaskList 주기적 확인 또는 SendMessage 자동 수신
  - 각 에이전트 timeout: 5분
  - 타임아웃 시 → SendMessage(to: "agent-X", message: "TIMEOUT — wrap up now")
  - 30초 추가 대기 → 부분 결과 수집
```

#### Step 2.5: 집계

```
오케스트레이터가 직접:
  - Read cycle-{N}/agent-A.md, agent-B.md, agent-C.md, agent-D.md
  - Read cycle-{N}/blockers.md
  - 중복 제거: 같은 페이지 + 같은 증상 = 1 bug
  - 심각도 분류: Critical / Major / Minor
  - Write → cycle-{N}/merged-bugs.md
```

---

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
   - Grep for Material Symbols text → should be Lucide
   - Check tenantMiddleware presence in admin routes
   - Check migration IF NOT EXISTS
```

---

### Phase 4: Parallel Bug Fix — 3 Fixer Agents (5min)

**Only if bugs found in Phase 2+3. 버그 없으면 Phase 6으로 건너뜀.**

#### Step 4.0: 픽서 팀 생성

```
도구 호출: TeamCreate(team_name: "e2e-fixers-{N}")
도구 호출 (3개):
  TaskCreate(subject: "Fixer A: Server bugs", description: "...")
  TaskCreate(subject: "Fixer B: Frontend bugs", description: "...")
  TaskCreate(subject: "Fixer C: Design/UX bugs", description: "...")
```

#### Step 4.1: 픽서 에이전트 3개 스폰

```
Agent(name: "fixer-A", team_name: "e2e-fixers-{N}", description: "Fix server bugs", mode: "bypassPermissions", prompt: "...")
Agent(name: "fixer-B", team_name: "e2e-fixers-{N}", description: "Fix frontend bugs", mode: "bypassPermissions", prompt: "...")
Agent(name: "fixer-C", team_name: "e2e-fixers-{N}", description: "Fix design bugs", mode: "bypassPermissions", prompt: "...")
```

**Fixer 역할 분담:**

| Fixer | Scope | 담당 |
|-------|-------|------|
| A — Server | `packages/server/src/**` | 500 errors, 404 routes, auth issues |
| B — Frontend | `packages/admin/src/**` (logic) | Console errors, dead buttons, empty pages |
| C — Design | `packages/admin/src/**` (CSS only) | Blue→olive, layout, icon replacements |

**각 Fixer 규칙:**
- Max 3 files per fixer
- Read file → apply fix → tsc check
- tsc fail → revert → 다른 방법 (max 2 attempts)
- 2회 실패 → mark ESCALATED
- TaskUpdate(status: "completed") when done

#### Step 4.2: 머지 + 검증

```
모든 Fixer 완료 후 오케스트레이터가:
  1. 각 Fixer 결과 확인 (cycle-{N}/fix-results.md)
  2. bunx tsc --noEmit -p packages/server/tsconfig.json
  3. bunx tsc --noEmit -p packages/admin/tsconfig.json
  4. Type error 발생 시 → 해당 Fixer 변경분 revert
```

#### Step 4.3: 픽서 팀 정리

```
각 Fixer에게: SendMessage(to: "fixer-X", message: {type: "shutdown_request"})
도구 호출: TeamDelete  (e2e-fixers-{N} 정리)
```

---

### Phase 5: Simplify (1min)

```
If any files were modified in Phase 4:
  Run /simplify logic on changed files only:
  - Code reuse: existing utils that could replace new code?
  - Code quality: redundant state, copy-paste?
  - Efficiency: unnecessary work?
  Fix any issues found.
```

### Phase 6: Deploy + Verify (2min)

```
If any files were modified:
  1. git add {specific changed files only}
  2. git commit -m "fix(e2e-cycle-{N}): {bug summary}

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

### Phase 8: Report + Cleanup (15s)

```
1. Append to _qa-e2e/playwright-e2e/cycle-report.md:

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

2. E2E 에이전트 팀 정리:
   각 에이전트에게: SendMessage(to: "agent-X", message: {type: "shutdown_request"})
   도구 호출: TeamDelete  (e2e-cycle-{N} 정리)
```

---

## Safety Limits

- Max 5 files modified per cycle (total across all fixers)
- No deleting files
- No changing package.json
- No modifying migrations or auth middleware
- tsc must pass before commit
- If deploy fails → next cycle detects and warns

## Timeouts

| Phase | Timeout | On timeout |
|-------|---------|------------|
| Pre-flight | 30s | Skip cycle |
| API smoke test | 2min | Report partial, continue |
| Per agent (Phase 2) | 5min | SendMessage "TIMEOUT" → 30s → collect partial |
| Per fixer (Phase 4) | 3min | Skip bug, mark ESCALATED |
| Total cycle | 25min | Force report with partial results |

## Output

```
_qa-e2e/playwright-e2e/
  cycle-report.md          ← cumulative report (appended each cycle)
  cycle-{N}/
    agent-A.md             ← Functional CRUD results
    agent-B.md             ← Visual design results
    agent-C.md             ← Edge security results
    agent-D.md             ← Regression navigation results
    blockers.md            ← Site-wide blockers (shared between agents)
    bugs.md                ← Shared bug list (cross-reference)
    merged-bugs.md         ← Aggregated + de-duplicated bugs
    fix-results.md         ← Fixer agent results
    screenshots/
      {page}-{bug-id}.png  ← Bug evidence
```

## Fallback

If TeamCreate fails (connection issue, resource limit):
  → Auto-fallback to VS version (sequential single-agent mode)
  → Log: "TeamCreate failed, running in single-agent mode"
  → Continue cycle without interruption

## Rules

1. **TeamCreate 필수** — Agent 단독 사용 금지. 반드시 TeamCreate → Agent(team_name) 순서
2. **ToolSearch 선행** — 사이클 시작 시 TeamCreate, TaskCreate, SendMessage 등 deferred tools 먼저 로드
3. **team_name 파라미터** — Agent 스폰 시 team_name 빠뜨리면 서브에이전트가 됨. 팀 통신 불가
4. **Never stop on single failure** — record and continue
5. **Screenshot on bugs** — visual evidence is mandatory
6. **Console errors are bugs** — no exceptions
7. **Dead buttons are bugs** — clickable element that does nothing = BUG
8. **Clean up test data** — delete anything created during CRUD testing
9. **Type-check before commit** — tsc must pass or no deploy
10. **Max 5 files per cycle** — prevent runaway changes
11. **Don't touch auth/middleware** — too risky for auto-fix
12. **Olive theme only** — any blue (#3b82f6, bg-blue-*) = immediate fix
13. **Report every cycle** — even if 0 bugs found
14. **TeamDelete after each phase** — Fixer 팀은 Phase 4 끝나면 정리, E2E 팀은 Phase 8에서 정리
15. **Phase 건너뛰기 절대 금지** — Phase 0→1→2→3→4→5→6→7→8 전부 순서대로. "이전 사이클 결과로 대체" 금지
16. **Phase 게이트** — Phase 4 시작 전 agent-A~D.md 4개 + screenshots/ 1개 이상 검증. 미충족 시 Phase 2 재실행
17. **참고 O 대체 X** — 이전 사이클 결과는 참고만 (Agent D 회귀테스트 등). 현재 사이클 Playwright 테스트를 대체할 수 없음
18. **오래된 사이클 자동 삭제** — Phase 0에서 최근 3사이클만 유지, 나머지 rm -rf (cycle-report.md는 유지)
