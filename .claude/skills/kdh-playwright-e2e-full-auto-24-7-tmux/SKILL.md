# KDH Playwright E2E Full-Auto 24/7 — TMUX Version v2.1 (Team Agents + BMAD Personas)

Loop-based automated E2E testing + instant bug fix + deploy. Uses **TeamCreate** for parallel 4-agent testing with **BMAD agent personas**. Runs on Oracle VPS inside tmux + Claude CLI. Tests both **admin** and **CEO app** pages.

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
- CEO: ceo / ceo1234

---

## CRITICAL: Tool Loading (매 사이클 첫 단계)

팀 에이전트를 쓰려면 deferred tools를 먼저 로드해야 한다. **사이클 시작 전 반드시 실행:**

```
ToolSearch("select:TeamCreate,TeamDelete,TaskCreate,TaskList,TaskUpdate,TaskGet,SendMessage")
```

이걸 안 하면 TeamCreate를 못 쓰고, 습관적으로 Agent(run_in_background)로 빠진다. **절대 Agent 단독 사용 금지. 반드시 TeamCreate 먼저.**

---

## CRITICAL: Browser Contention Prevention (TMUX-specific)

4개 에이전트가 동시에 headless Chromium을 쓰면 lock 충돌이 발생한다. 반드시 스태거드 스폰:

```
Staggered spawn order:
  quinn:   즉시 (0s)
  winston: +30s
  bob:     +60s
  sally:   +90s  (스크린샷 많으므로 마지막)
```

**각 에이전트 브라우저 규칙:**
- Lock failure 시 15초 대기 후 재시도 (max 3회)
- 페이지 그룹 전환 시 `browser_close()` 호출 후 새로 열기
- Future: staggering으로 부족하면 multi-MCP 인스턴스 전환

---

## ABSOLUTE: Phase 건너뛰기 금지

**매 사이클은 반드시 Phase 0->1->2->3->4->5->6->7->8 순서대로 전부 실행한다.**

### Phase 2 (Playwright 4-Agent 테스트)는 이 스킬의 존재 이유다.

- "이전 사이클에서 이미 테스트했으니까 건너뛴다" -> **절대 금지**
- "버그 목록이 이미 있으니까 바로 수정한다" -> **절대 금지**
- "시간이 부족하니까 Phase 2를 줄인다" -> **에이전트 수를 줄여도 되지만 0으로 건너뛰기는 금지**
- 매 사이클은 **독립적**이다. 이전 사이클 결과는 **참고만** 하고, **대체하지 않는다.**

### Phase 게이트: Phase 4 진입 전 필수 검증

Phase 4(Bug Fix)를 시작하기 전에 오케스트레이터가 반드시 확인:

```
GATE CHECK (하나라도 실패 -> Phase 2로 돌아가서 재실행):
  1. cycle-{N}/quinn.md 존재 + 10줄 이상
  2. cycle-{N}/sally.md 존재 + 10줄 이상
  3. cycle-{N}/winston.md 존재 + 10줄 이상
  4. cycle-{N}/bob.md 존재 + 10줄 이상
  5. cycle-{N}/screenshots/ 안에 파일 1개 이상
```

**예외: Playwright MCP 다운 시**
- 브라우저 접속 자체가 불가능한 경우에 한해
- `cycle-{N}/BROWSER_DOWN.md`에 사유 + 에러 메시지 기록
- API-only fallback 모드로 전환 (curl 테스트만)
- 이 경우에도 quinn~bob.md는 API/소스코드 분석 결과로 작성해야 함

### 이전 사이클 참고 원칙: 참고 O, 대체 X

- bob이 이전 `merged-bugs.md` 읽고 회귀 테스트 -> OK
- Fixer가 이전 사이클 미수정 버그를 이번에 수정 -> OK
- "이전 사이클에서 테스트했으니 Phase 2 건너뜀" -> **절대 금지**

---

## BMAD Agent Personas

Each agent MUST embody their BMAD persona. First action on spawn = read persona file.

| Agent Name | Role | BMAD Persona | Bug ID Prefix |
|------------|------|-------------|---------------|
| quinn | Functional CRUD | `_bmad/bmm/agents/qa.md` | BUG-Q |
| sally | Visual Design | `_bmad/bmm/agents/ux-designer.md` | BUG-S |
| winston | Edge Security | `_bmad/bmm/agents/architect.md` | BUG-W |
| bob | Regression Navigation | `_bmad/bmm/agents/sm.md` | BUG-B |

| Fixer Name | Role | BMAD Persona |
|------------|------|-------------|
| dev | Server bugs | `_bmad/bmm/agents/dev.md` |
| quinn | Frontend bugs | `_bmad/bmm/agents/qa.md` |
| sally | Design bugs | `_bmad/bmm/agents/ux-designer.md` |

---

## Cycle Structure (30min target)

### Phase 0: Pre-flight (30s)

```
1. curl GET https://corthex-hq.com -> site alive?
   - DOWN -> log "SITE DOWN" -> skip cycle
2. POST /api/auth/admin/login -> get JWT token (admin/admin1234)
   - FAIL -> log "LOGIN FAILED" -> skip cycle
3. gh run list -L 1 -> last deploy status
   - FAILED -> log warning, continue
4. Read _qa-e2e/playwright-e2e/cycle-report.md -> previous cycle results
   - Unresolved bugs from last cycle = priority targets
5. Determine cycle number: ls cycle-* dirs -> N = max + 1
6. mkdir -p _qa-e2e/playwright-e2e/cycle-{N}/screenshots
7. 오래된 사이클 삭제: cycle-(N-3) 이하 폴더 전부 rm -rf
   - 최근 3사이클만 유지 (용량 관리)
   - cycle-report.md는 삭제하지 않음 (누적 로그)
8. Test Data Setup:
   - POST /api/admin/companies with body {"name": "E2E-TEMP-{N}"}
   - Store response companyId as E2E_COMPANY_ID
   - All CRUD tests in this cycle use E2E_COMPANY_ID exclusively
9. Read reference files:
   - Read _qa-e2e/playwright-e2e/known-behaviors.md -> KB-{NNN} list
   - Read _qa-e2e/playwright-e2e/ESCALATED.md -> ESC-{NNN} list
   - Read _qa-e2e/playwright-e2e/stability-state.md -> clean_cycles count, last_bug_cycle
   - Check git log --oneline -5 -> any new commits since last cycle?
10. Login credentials check:
    - Admin: POST /api/auth/admin/login with admin/admin1234 -> store ADMIN_TOKEN
    - CEO: POST /api/auth/login with ceo/ceo1234 -> store CEO_TOKEN
    - If CEO login fails -> log warning, skip CEO pages (admin-only mode)
11. Theme detection (run once per cycle):
    - Read packages/app/src/styles/themes.css -> extract [data-theme] blocks
    - Read packages/app/src/index.css -> extract @theme defaults
    - Identify current active theme from layout.tsx data-theme attribute
    - Store in cycle context: ACTIVE_THEME, THEME_TOKENS (bg, surface, accent, text colors)
    - Write theme snapshot to cycle-{N}/theme-tokens.md
```

### Phase 1: API Smoke Test (1min)

```
Using curl with admin token + E2E_COMPANY_ID query param, hit ALL endpoints:

TOKEN = (Phase 0에서 획득)
COMPANYID = E2E_COMPANY_ID (Phase 0 step 8에서 생성)
BASE = "https://corthex-hq.com/api/admin"

Admin endpoints (~25):
  companies, users?companyId, employees?companyId, departments?companyId,
  agents?companyId, tools?companyId, costs/summary?companyId,
  costs/by-agent?companyId, costs/by-model?companyId, costs/daily?companyId,
  budget?companyId, credentials?companyId, api-keys?companyId,
  report-lines?companyId, org-chart?companyId, org-templates?companyId,
  soul-templates?companyId, monitoring?companyId, audit-logs?companyId,
  tool-invocations?companyId, mcp-servers?companyId

CEO app endpoints (using CEO_TOKEN, skip if admin-only mode):
  /api/hub, /api/chat, /api/agents, /api/departments, /api/jobs, /api/settings

For each:
  - 200/201 -> OK
  - 500 -> CRITICAL bug (record error message)
  - 404 -> HIGH bug (route not mounted)
  - 401/403 -> Check if auth issue
```

---

### Phase 2: Parallel E2E Sweep — 4 Team Agents (5min)

**이 Phase가 TMUX 버전의 핵심. 반드시 TeamCreate -> TaskCreate -> Agent(team_name) 순서.**

#### Step 2.0: 팀 생성

```
도구 호출: TeamCreate(team_name: "e2e-cycle-{N}")
```

#### Step 2.1: 공유 파일 생성

```
Write -> _qa-e2e/playwright-e2e/cycle-{N}/blockers.md  (빈 파일)
Write -> _qa-e2e/playwright-e2e/cycle-{N}/bugs.md      (Phase 1 결과 포함)

bugs.md 표준 형식:
| Bug ID | Agent | Page | Severity | Description | Screenshot |
|--------|-------|------|----------|-------------|------------|
| BUG-Q001 | quinn | /companies | Major | Create button 500 error | companies-Q001.png |

- Bug ID 규칙: BUG-{FIRST_LETTER}{NNN} (예: BUG-Q001, BUG-S003, BUG-W002, BUG-B005)
  - Q = quinn, S = sally, W = winston, B = bob
- 에이전트는 bugs.md에 쓰기 전 기존 항목 확인 -> 중복이면 skip
```

#### Step 2.2: 태스크 4개 생성

```
도구 호출 (4개 병렬):
  TaskCreate(subject: "quinn: Functional CRUD", description: "...")
  TaskCreate(subject: "sally: Visual Design", description: "...")
  TaskCreate(subject: "winston: Edge Security", description: "...")
  TaskCreate(subject: "bob: Regression Navigation", description: "...")
```

#### Step 2.3: 팀 에이전트 4개 스폰 (스태거드)

**중요: 모든 Agent 호출에 team_name 필수. 빠뜨리면 서브에이전트가 되어 팀 통신 불가.**
**중요: 브라우저 경합 방지를 위해 스태거드 스폰 (quinn->winston->bob->sally, 30초 간격).**

```
도구 호출 (4개 — 30초 간격으로 순차):

[즉시] Agent(
  name: "quinn",
  team_name: "e2e-cycle-{N}",
  description: "Functional CRUD testing",
  mode: "bypassPermissions",
  prompt: "[quinn 프롬프트 — 아래 참조]"
)

[+30s] Agent(
  name: "winston",
  team_name: "e2e-cycle-{N}",
  description: "Edge security testing",
  mode: "bypassPermissions",
  prompt: "[winston 프롬프트 — 아래 참조]"
)

[+60s] Agent(
  name: "bob",
  team_name: "e2e-cycle-{N}",
  description: "Regression navigation testing",
  mode: "bypassPermissions",
  prompt: "[bob 프롬프트 — 아래 참조]"
)

[+90s] Agent(
  name: "sally",
  team_name: "e2e-cycle-{N}",
  description: "Visual design testing",
  mode: "bypassPermissions",
  prompt: "[sally 프롬프트 — 아래 참조]"
)
```

#### quinn — Functional (CRUD + Buttons)

```
FIRST ACTION: Read and embody: _bmad/bmm/agents/qa.md as your persona.

Assigned pages (Admin): companies, employees, departments, agents, tools,
                credentials, api-keys, onboarding, settings, users,
                report-lines, workflows
Assigned pages (CEO app): /hub, /chat, /agents, /departments, /jobs, /settings
  (Login to CEO app via: POST /api/auth/login with ceo/ceo1234 using CEO_TOKEN)
  (If CEO_TOKEN unavailable -> skip CEO pages)

Pre-check:
  - Read _qa-e2e/playwright-e2e/known-behaviors.md -> skip KB-{NNN} items
  - Read _qa-e2e/playwright-e2e/ESCALATED.md -> skip ESC-{NNN} items
  - Read cycle-{N}/bugs.md -> don't re-report existing BUG IDs

Browser rules:
  - Lock failure -> wait 15s, retry (max 3)
  - browser_close() between page groups

Tasks:
  - Login via Playwright MCP -> admin / admin1234 (admin pages)
  - Click EVERY button on assigned admin pages
  - Dead button (no response) = BUG
  - Try CRUD: create -> read -> update -> delete on each page
  - ALL CRUD operations use E2E_COMPANY_ID only (not default company)
  - Form validation: empty submit, Korean test data ("테스트팀", "김테스트")
  - DO NOT manually delete test data (Phase 8 cleans up entire E2E company)
  - Login via CEO_TOKEN -> navigate CEO app pages -> verify load + basic interaction
  - Check blockers.md before each page (skip if blocked)
  - Record all bugs to cycle-{N}/bugs.md using BUG-Q{NNN} format
  - Write summary to cycle-{N}/quinn.md
  - TaskUpdate(status: "completed") when done
```

#### sally — Visual + Design

```
FIRST ACTION: Read and embody: _bmad/bmm/agents/ux-designer.md as your persona.

Assigned pages: ALL 21 admin pages + ALL CEO app pages (screenshot sweep)
  (CEO app: /hub, /chat, /agents, /departments, /jobs, /settings)
  (Login to CEO app via: POST /api/auth/login with ceo/ceo1234 using CEO_TOKEN)
  (If CEO_TOKEN unavailable -> admin pages only)

Pre-check:
  - Read _qa-e2e/playwright-e2e/known-behaviors.md -> skip KB-{NNN} items
  - Read _qa-e2e/playwright-e2e/ESCALATED.md -> skip ESC-{NNN} items
  - Read cycle-{N}/bugs.md -> don't re-report existing BUG IDs
  - Read cycle-{N}/theme-tokens.md -> load ACTIVE_THEME + THEME_TOKENS

Browser rules:
  - Lock failure -> wait 15s, retry (max 3)
  - browser_close() between page groups (every 5 pages)

Tasks:
  - Login via Playwright MCP
  - Navigate each page -> browser_take_screenshot
  - Check design tokens (dynamic — from THEME_TOKENS):
    - bg: verify matches THEME_TOKENS.bg
    - sidebar: verify matches THEME_TOKENS.sidebar-bg
    - Grep for Tailwind color defaults NOT in THEME_TOKENS = BUG
    - Material Symbols text ("check_circle", "more_vert") = BUG (should be Lucide)
    - Font: verify matches THEME_TOKENS.font-family
  - Check responsive (admin pages): browser_resize(390, 844) -> screenshot
  - Check responsive (CEO pages): desktop (1440, 900) + mobile (390, 844) -> screenshot both
  - Empty state: correct message displayed?
  - Record all bugs to cycle-{N}/bugs.md using BUG-S{NNN} format
  - Write summary to cycle-{N}/sally.md
  - TaskUpdate(status: "completed") when done
```

#### winston — Edge + Security

```
FIRST ACTION: Read and embody: _bmad/bmm/agents/architect.md as your persona.

Assigned pages: ALL admin pages + unauthenticated access

Pre-check:
  - Read _qa-e2e/playwright-e2e/known-behaviors.md -> skip KB-{NNN} items
  - Read _qa-e2e/playwright-e2e/ESCALATED.md -> skip ESC-{NNN} items
  - Read cycle-{N}/bugs.md -> don't re-report existing BUG IDs

Browser rules:
  - Lock failure -> wait 15s, retry (max 3)
  - browser_close() between page groups

Tasks:
  - Visit each page WITHOUT token -> should redirect to /admin/login
  - Login, then collect console errors on every page
  - Try XSS: <script>alert(1)</script> in text fields
  - Empty required fields -> submit -> should show validation
  - Rapid click: double-click delete button -> should not double-delete
  - CRITICAL bugs -> immediately write to blockers.md
  - Record all bugs to cycle-{N}/bugs.md using BUG-W{NNN} format
  - Write summary to cycle-{N}/winston.md
  - TaskUpdate(status: "completed") when done
```

#### bob — Regression + Navigation

```
FIRST ACTION: Read and embody: _bmad/bmm/agents/sm.md as your persona.

Assigned pages: sidebar full sweep (admin + CEO app) + previous cycle's fixed pages
  (CEO app sidebar: /hub, /chat, /agents, /departments, /jobs, /settings)
  (Login to CEO app via: POST /api/auth/login with ceo/ceo1234 using CEO_TOKEN)
  (If CEO_TOKEN unavailable -> admin sidebar only)

Pre-check:
  - Read _qa-e2e/playwright-e2e/known-behaviors.md -> skip KB-{NNN} items
  - Read _qa-e2e/playwright-e2e/ESCALATED.md -> skip ESC-{NNN} items
  - Read cycle-{N}/bugs.md -> don't re-report existing BUG IDs
  - Read cycle-{N}/theme-tokens.md -> load ACTIVE_THEME + THEME_TOKENS

Browser rules:
  - Lock failure -> wait 15s, retry (max 3)
  - browser_close() between page groups

Tasks:
  - Login via Playwright MCP
  - Click EVERY admin sidebar link -> page loads correctly?
  - Click EVERY CEO app sidebar link -> page loads correctly?
  - Previous cycle bugs -> re-test each one (regression check)
  - Theme consistency: 5+ pages, verify colors match THEME_TOKENS
  - Shared components: sidebar, layout, toast, modal
  - Session persistence: navigate 10 pages -> still logged in?
  - Record all bugs to cycle-{N}/bugs.md using BUG-B{NNN} format
  - Write summary to cycle-{N}/bob.md
  - TaskUpdate(status: "completed") when done
```

#### Step 2.4: 대기 + 수집

```
대기 방법: TaskList 주기적 확인 또는 SendMessage 자동 수신
  - 각 에이전트 timeout: 5분
  - 타임아웃 시 -> SendMessage(to: "{agent-name}", message: "TIMEOUT — wrap up now")
  - 30초 추가 대기 -> 부분 결과 수집
```

#### Step 2.5: 집계

```
오케스트레이터가 직접:
  - Read cycle-{N}/bugs.md (이미 표준 형식 + BUG ID로 관리됨)
  - Read cycle-{N}/blockers.md
  - 중복 최종 확인: 같은 페이지 + 같은 증상 = merge (BUG ID 중 나중 것 제거)
  - 심각도 분류: Critical / Major / Minor
  - Write -> cycle-{N}/merged-bugs.md
```

#### Step 2.6: Cross-talk Round (1min)

After all 4 agents complete:

```
1. Orchestrator sends merged-bugs.md to ALL agents via SendMessage:
   SendMessage(to: "quinn", message: "Cross-talk: review merged-bugs.md")
   SendMessage(to: "sally", message: "Cross-talk: review merged-bugs.md")
   SendMessage(to: "winston", message: "Cross-talk: review merged-bugs.md")
   SendMessage(to: "bob", message: "Cross-talk: review merged-bugs.md")

2. Each agent reviews bugs found by others in their domain:
   - quinn reviews sally's visual bugs: "Is this a real UX issue?"
   - sally reviews winston's security findings: "Does the fix break the design?"
   - winston reviews bob's regression bugs: "Is this an architecture issue?"
   - bob reviews quinn's CRUD bugs: "Did this work in the previous cycle?"

3. Each agent writes cross-talk section to their report file:
   - Append "## Cross-talk Review" to cycle-{N}/{name}.md
   - Include: agree/disagree with other agents' findings + reasoning

4. Orchestrator collects updated reports:
   - Read all 4 report files
   - If any bug is disputed by 2+ agents -> mark as DISPUTED in merged-bugs.md
   - Disputed bugs are NOT auto-fixed (deferred to human review)
```

---

### Phase 3: React Code Analysis + Cross-Check (30s)

```
Static analysis (no browser needed):

1. Route-API Mismatch Detection:
   - Parse App.tsx -> extract all <Route path="...">
   - For each page file: grep api.get/post/put/delete calls
   - Cross-reference with server routes (index.ts app.route lines)
   - Mismatch = BUG

2. Cross-Check (from cross-check.sh logic):
   - Read cycle-{N}/theme-tokens.md -> load THEME_TOKENS
   - Grep for Tailwind color classes NOT in THEME_TOKENS -> should match active theme
   - Grep for Material Symbols text -> should be Lucide
   - Check tenantMiddleware presence in admin routes
   - Check migration IF NOT EXISTS
```

---

### Phase 4: Parallel Bug Fix — 3 Fixer Agents (5min)

**Only if bugs found in Phase 2+3. 버그 없으면 Phase 6으로 건너뜀.**

#### Step 4.0: ESCALATED 업데이트

```
이전 사이클에서 ESCALATED 마킹된 버그 확인:
  - Read _qa-e2e/playwright-e2e/ESCALATED.md
  - merged-bugs.md에서 2회 실패한 버그 -> ESCALATED.md에 추가:
    | ESC-{NNN} | {date} | {description} | {page} | cycles_re_reported: 0 |
  - cycles_re_reported >= 3인 항목 -> cycle-report에 WARNING 추가
```

#### Step 4.1: 픽서 팀 생성

```
도구 호출: TeamCreate(team_name: "e2e-fixers-{N}")
도구 호출 (3개):
  TaskCreate(subject: "dev: Server bugs", description: "...")
  TaskCreate(subject: "quinn: Frontend bugs", description: "...")
  TaskCreate(subject: "sally: Design/UX bugs", description: "...")
```

#### Step 4.2: 픽서 에이전트 3개 스폰

```
Agent(name: "dev", team_name: "e2e-fixers-{N}", description: "Fix server bugs", mode: "bypassPermissions", prompt: "Read and embody: _bmad/bmm/agents/dev.md as your FIRST action. ...")
Agent(name: "quinn", team_name: "e2e-fixers-{N}", description: "Fix frontend bugs", mode: "bypassPermissions", prompt: "Read and embody: _bmad/bmm/agents/qa.md as your FIRST action. ...")
Agent(name: "sally", team_name: "e2e-fixers-{N}", description: "Fix design bugs", mode: "bypassPermissions", prompt: "Read and embody: _bmad/bmm/agents/ux-designer.md as your FIRST action. ...")
```

**Fixer 역할 분담:**

| Fixer | Scope | 담당 |
|-------|-------|------|
| dev — Server | `packages/server/src/**` | 500 errors, 404 routes, auth issues |
| quinn — Frontend | `packages/admin/src/**` + `packages/app/src/**` (logic) | Console errors, dead buttons, empty pages |
| sally — Design | `packages/admin/src/**` + `packages/app/src/**` (CSS only) | Theme token violations, layout, icon replacements |

**각 Fixer 규칙:**
- **Change Type 선언 필수** — 수정 시작 전 타입 선언:
  - Logic (서버/프론트 로직): max 3 files
  - Style (CSS/테마): max 10 files
  - Text/i18n (텍스트/번역): max 15 files
  - Mixed (여러 타입): max 5 files
- Read file -> apply fix -> tsc check
- tsc fail -> revert -> 다른 방법 (max 2 attempts)
- 2회 실패 -> mark ESCALATED
- TaskUpdate(status: "completed") when done

#### Step 4.3: 머지 + 검증

```
모든 Fixer 완료 후 오케스트레이터가:
  1. 각 Fixer 결과 확인 (cycle-{N}/fix-results.md)
  2. bunx tsc --noEmit -p packages/server/tsconfig.json
  3. bunx tsc --noEmit -p packages/admin/tsconfig.json
  4. bunx tsc --noEmit -p packages/app/tsconfig.json
  5. Type error 발생 시 -> 해당 Fixer 변경분 revert
```

#### Step 4.4: 픽서 팀 정리

```
각 Fixer에게: SendMessage(to: "{fixer-name}", message: {type: "shutdown_request"})
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

### Phase 6: Deploy + Post-Deploy Verification (3min)

```
If any files were modified:
  1. git add {specific changed files only}
  2. git commit -m "fix(e2e-cycle-{N}): {bug summary}

     Bugs fixed: {count}
     - P{X}: {description}
     ...

     Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
  3. git push origin main
  4. Wait for deploy:
     - Poll: gh run list -L 1 (20초 intervals, max 6 checks = 2분)
     - SUCCESS -> continue to verification
     - FAILED -> record in cycle report, skip verification
     - TIMEOUT (6 checks) -> record "deploy timeout" in cycle report
  5. Post-deploy verification:
     - Run: bash .claude/hooks/smoke-test.sh
     - All endpoints 200 OK -> record PASS in cycle report
     - Any failure -> record FAIL + failing endpoints in cycle report
  6. Record deploy result: {success|failed|skipped|timeout} + smoke-test {pass|fail}

If no files modified:
  Skip deploy.
```

### Phase 7: Working State Update + Context Snapshot (30s)

```
Update .claude/memory/working-state.md:
  - Last cycle: #{N} at {time}
  - Bugs fixed this cycle: {count}
  - Bugs remaining: {list}
  - Total cycles run: {N}
  - Total bugs fixed: {N}
  - Next cycle priority: {what to focus on}

Save context snapshot:
  Write to _qa-e2e/playwright-e2e/context-snapshots/cycle-{N}.md:
  - Cycle number + timestamp
  - Bugs found / fixed / remaining (with BUG IDs)
  - Page health scores (from Page Health Score System)
  - ESCALATED changes (new additions, removals, warnings)
  - Files modified (full paths)
  - Deploy result (success/failed/skipped/timeout + smoke-test result)
  - Theme: ACTIVE_THEME used this cycle
```

### Phase 8: Report + Cleanup (30s)

```
0. Test Data Cleanup:
   - DELETE /api/admin/companies/{E2E_COMPANY_ID}
   - Verify 200 response (all associated data cascade-deleted)
   - If delete fails -> log warning, continue

1. Calculate Page Health Scores (see Page Health Score System below)

2. Append to _qa-e2e/playwright-e2e/cycle-report.md:

## Cycle #{N} — {timestamp}
- API: {passed}/{total} OK
- Pages loaded: {N}/{total} (admin: {n}, CEO app: {n})
- Console errors: {N}
- Dead buttons: {N}
- Bugs found: {N} (P0:{n} P1:{n} P2:{n} P3:{n})
- Bugs fixed: {N}
- Bugs remaining: {N}
- Bugs escalated: {N}
- Bugs disputed (cross-talk): {N}
- ESCALATED warnings: {list of ESC items with cycles_re_reported >= 3}
- Files modified: {list}
- Deploy: {success|failed|skipped|timeout}
- Smoke test: {pass|fail|skipped}
- Test company: E2E-TEMP-{N} cleanup: {success|failed}
- Theme: {ACTIVE_THEME}
- Page health: {pages_degrading} degrading, {pages_escalated} auto-escalated

3. Update stability-state.md:
   - If 0 bugs found -> increment clean_cycles
   - If bugs found -> reset clean_cycles to 0, set last_bug_cycle = N
   - Record last_cycle = N, last_timestamp = {now}

4. E2E 에이전트 팀 정리:
   각 에이전트에게: SendMessage(to: "{agent-name}", message: {type: "shutdown_request"})
   도구 호출: TeamDelete  (e2e-cycle-{N} 정리)
```

---

## Page Health Score System

Each page gets a health score (0-10) calculated per cycle:

```
Base score: 10

Deductions:
  - Console error: -1 per error (max -4)
  - Dead button: -2 per button (max -6)
  - 500 API response: -10 (instant 0)
  - Missing content (empty page): -5
  - Design token violation: -1 per violation (max -3)
  - Failed form submission: -2

Minimum score: 0
```

Tracked in: `_qa-e2e/playwright-e2e/page-health.md`

Format:
```
| Page | Cycle N-2 | Cycle N-1 | Cycle N | Trend |
|------|-----------|-----------|---------|-------|
| /companies | 8 | 9 | 10 | ^ |
| /agents | 5 | 7 | 7 | -> |
| /hub (CEO) | - | 9 | 8 | v |
```

Trend indicators:
- `^` = improving (score went up)
- `->` = stable (score unchanged)
- `v` = degrading (score went down)
- `-` = no data (page not tested in that cycle)

**Auto-escalation rule:** Pages with score < 5 for 3 consecutive cycles are auto-added to `ESCALATED.md` with reason "PAGE_HEALTH_CRITICAL".

---

## Auto-Stabilization Protocol

After Phase 8, check stabilization conditions:

```
Read _qa-e2e/playwright-e2e/stability-state.md:
  - clean_cycles: number of consecutive 0-bug cycles
  - last_bug_cycle: last cycle that found bugs
  - mode: "ACTIVE" | "STABLE_WATCH"

ENTER STABLE_WATCH when ALL true:
  - clean_cycles >= 3
  - No new git commits since last cycle
  - No manual request for full cycle

STABLE_WATCH mode:
  - bob only (regression + navigation sweep)
  - 2h interval instead of 30m
  - No fixer agents spawned
  - Reduced scope: sidebar sweep + previous bug re-check only
  - Update stability-state.md: mode = "STABLE_WATCH"

EXIT STABLE_WATCH (return to ACTIVE) when ANY true:
  - bob finds a new bug
  - New git commit detected (git log check in Phase 0)
  - Manual request from user
  - Update stability-state.md: mode = "ACTIVE", clean_cycles = 0
```

---

## Safety Limits

- **Smart file limits per fixer (by change type):**
  - Logic (server/frontend logic): max 3 files
  - Style (CSS/theme): max 10 files
  - Text/i18n (text/translation): max 15 files
  - Mixed (multiple types): max 5 files
  - Fixer MUST declare change type before starting
- No deleting files
- No changing package.json
- No modifying migrations or auth middleware
- tsc must pass before commit
- If deploy fails -> next cycle detects and warns

## Timeouts

| Phase | Timeout | On timeout |
|-------|---------|------------|
| Pre-flight | 30s | Skip cycle |
| API smoke test | 2min | Report partial, continue |
| Per agent (Phase 2) | 5min | SendMessage "TIMEOUT" -> 30s -> collect partial |
| Cross-talk (Step 2.6) | 1min | Collect available reviews, continue |
| Per fixer (Phase 4) | 3min | Skip bug, mark ESCALATED |
| Deploy wait (Phase 6) | 2min | Record timeout, skip smoke test |
| Total cycle | 25min | Force report with partial results |

## Output

```
_qa-e2e/playwright-e2e/
  cycle-report.md          <- cumulative report (appended each cycle)
  ESCALATED.md             <- persistent list of bugs that failed 2+ fix attempts
  known-behaviors.md       <- KB-{NNN} items: known non-bugs (not to be re-reported)
  stability-state.md       <- clean_cycles, last_bug_cycle, mode (ACTIVE/STABLE_WATCH)
  page-health.md           <- page health scores tracked across cycles
  context-snapshots/
    cycle-{N}.md           <- full context snapshot per cycle
  cycle-{N}/
    quinn.md               <- Functional CRUD results (BMAD: qa)
    sally.md               <- Visual design results (BMAD: ux-designer)
    winston.md             <- Edge security results (BMAD: architect)
    bob.md                 <- Regression navigation results (BMAD: sm)
    theme-tokens.md        <- Active theme + token values for this cycle
    blockers.md            <- Site-wide blockers (shared between agents)
    bugs.md                <- Shared bug list with BUG-{Q|S|W|B}{NNN} IDs (standardized table)
    merged-bugs.md         <- Aggregated + final de-duplicated bugs
    fix-results.md         <- Fixer agent results
    screenshots/
      {page}-{bug-id}.png  <- Bug evidence
```

## Fallback

If TeamCreate fails (connection issue, resource limit):
  -> Auto-fallback to VS version (sequential single-agent mode)
  -> Log: "TeamCreate failed, running in single-agent mode"
  -> Continue cycle without interruption

## Rules

1. **TeamCreate 필수** — Agent 단독 사용 금지. 반드시 TeamCreate -> Agent(team_name) 순서
2. **ToolSearch 선행** — 사이클 시작 시 TeamCreate, TaskCreate, SendMessage 등 deferred tools 먼저 로드
3. **team_name 파라미터** — Agent 스폰 시 team_name 빠뜨리면 서브에이전트가 됨. 팀 통신 불가
4. **Never stop on single failure** — record and continue
5. **Screenshot on bugs** — visual evidence is mandatory
6. **Console errors are bugs** — no exceptions
7. **Dead buttons are bugs** — clickable element that does nothing = BUG
8. **Test data isolation** — all CRUD in E2E_COMPANY_ID only. Phase 8 deletes the company
9. **Type-check before commit** — tsc must pass or no deploy
10. **Smart file limits** — Fixer declares change type, limit applied per type (Logic:3, Style:10, Text:15, Mixed:5)
11. **Don't touch auth/middleware** — too risky for auto-fix
12. **Theme compliance** — grep for colors not in THEME_TOKENS = immediate fix. Theme read from project-context.yaml + themes.css at Phase 0 step 11
13. **Report every cycle** — even if 0 bugs found
14. **TeamDelete after each phase** — Fixer 팀은 Phase 4 끝나면 정리, E2E 팀은 Phase 8에서 정리
15. **Phase 건너뛰기 절대 금지** — Phase 0->1->2->3->4->5->6->7->8 전부 순서대로. "이전 사이클 결과로 대체" 금지
16. **Phase 게이트** — Phase 4 시작 전 quinn~bob.md 4개 + screenshots/ 1개 이상 검증. 미충족 시 Phase 2 재실행
17. **참고 O 대체 X** — 이전 사이클 결과는 참고만 (bob 회귀테스트 등). 현재 사이클 Playwright 테스트를 대체할 수 없음
18. **오래된 사이클 자동 삭제** — Phase 0에서 최근 3사이클만 유지, 나머지 rm -rf (cycle-report.md는 유지)
19. **Known Behaviors 확인** — 모든 에이전트는 known-behaviors.md의 KB-{NNN} 항목을 버그로 리포트하지 않음
20. **ESCALATED 추적** — 2회 fix 실패 -> ESCALATED.md 등록. cycles_re_reported >= 3 -> cycle-report에 WARNING. 에이전트는 ESC 항목 재리포트 금지
21. **Auto-Stabilization** — 3연속 clean cycle + 새 커밋 없음 -> STABLE_WATCH 모드 (bob only, 2h interval). 새 버그/커밋/수동 요청 시 ACTIVE 복귀
22. **BMAD Persona 필수** — 모든 에이전트는 스폰 직후 BMAD persona 파일을 읽고 체화. persona 없이 작동 금지
23. **Cross-talk 필수** — Phase 2 완료 후 Step 2.6 cross-talk round 실행. 에이전트 간 버그 교차 검증
24. **Page Health 추적** — 매 사이클 page-health.md 업데이트. score < 5 연속 3회 -> auto-escalate
25. **CEO App 테스트** — CEO_TOKEN 확보 시 CEO app 페이지도 테스트 범위에 포함. 실패 시 admin-only 모드로 graceful degradation
