# Agent A: Functional Flow Verifier
> Tested: 2026-03-17
> Pages: 9/9 tested, 8 bugs found
> Test method: Playwright MCP (headless Chromium)
> Login: admin / admin1234 on https://corthex-hq.com/admin

---

## BLOCKING ISSUE: Phantom Route Navigation

Throughout testing, the SPA exhibited **spontaneous route changes** — navigating between pages without user interaction. For example:
- Navigated to `/admin/credentials` → URL changed to `/admin/monitoring` within seconds
- Navigated to `/admin/onboarding` → redirected to `/admin/departments` or `/admin/costs`

This made interactive CRUD testing (clicking buttons, filling forms) extremely difficult, as element refs become stale before interaction. Root cause appears to be cascading React Query error handlers from the many 500 API errors (budget, costs/summary, agents, soul-templates) triggering re-renders that destabilize the React Router state.

**Workaround used**: `browser_navigate` + `wait_for(text)` to wait for page content, and `browser_evaluate` for page content extraction.

---

## /admin/onboarding
### Scenario 1: Navigate to onboarding page
```
시나리오: Navigate directly to /admin/onboarding
기댓값: Onboarding wizard renders with Step 1 (Company) visible
실제: Page renders empty <main> tag, then redirects to random admin route. data-testid="onboarding-page" NOT FOUND in DOM.
판정: BUG-A001
```

### Scenario 2: Onboarding step indicator visible
```
시나리오: View 5-step indicator on onboarding page
기댓값: Steps 1-5 (Company, Departments, Agents, CLI Token, Complete) visible
실제: Cannot test — page never renders onboarding content
판정: BLOCKED by BUG-A001
```

---

## /admin/credentials (CHANGED)
### Scenario 1: Page loads with user list
```
시나리오: Navigate to /admin/credentials
기댓값: Page shows "CLI 인증 관리" header and user selection list
실제: Page loads correctly. Title: "CLI 인증 관리". 3 users: 관리자 @admin, 고동희 대표 @ceo, 테스트 직원 @testuser. Security info banner visible.
판정: OK
```

### Scenario 2: Select user shows CLI tokens and API keys
```
시나리오: Click "관리자 @admin" user
기댓값: Shows CLI OAuth tokens and external API keys for admin user
실제: Successfully shows: CLI OAuth 토큰 — 관리자 (0 tokens), 외부 API 키 (1 anthropic key registered 2026.3.17). Buttons: "+ 토큰 등록", "+ API 키 등록", "삭제"
판정: OK
```

### Scenario 3: Add CLI token form
```
시나리오: Click "+ 토큰 등록" to open form
기댓값: Form appears with label and token fields
실제: BLOCKED — phantom navigation redirected page before interaction could complete
판정: BLOCKED (phantom nav)
```

---

## /admin/agents
### Scenario 1: Page loads
```
시나리오: Navigate to /admin/agents
기댓값: Agent list with existing agents, "New Agent Template" button
실제: Page loads with title "Agent Management", search box present, "New Agent Template" button present. But shows "등록된 에이전트가 없습니다" (no agents). API /api/admin/agents returns 500.
판정: BUG-A002
```

### Scenario 2: Create agent form exists
```
시나리오: Check for agent creation UI
기댓값: "New Agent Template" button opens modal with name, role, tier, model, department, soul fields
실제: Button exists in DOM but CRUD testing blocked by phantom navigation
판정: BLOCKED (phantom nav)
```

---

## /admin/departments
### Scenario 1: Page loads with departments
```
시나리오: Navigate to /admin/departments
기댓값: Department list with CRUD buttons
실제: Page loads correctly. Title: "부서 관리". 4 departments: 경영지원실 (CEO 직속 부서), 개발팀 (AI 에이전트 개발), 마케팅팀 (마케팅 전략 및 분석), 재무팀 (재무 관리 및 투자 분석). All show "0 Members", "Active". Edit and Delete buttons present per department. "새 부서 생성" button and add card present.
판정: OK
```

---

## /admin/companies
### Scenario 1: Page loads with companies
```
시나리오: Navigate to /admin/companies
기댓값: Company list with CRUD buttons
실제: Page loads correctly. Title: "Company Management". 3 companies: CORTHEX HQ (Active, 1 users, 4 agents), Select Star (Inactive, 0/0), QA Test Corp (Inactive, 0/0). Each has Edit and Delete buttons. "Add Company" button present.
판정: OK (with minor issues noted below)
```

### Scenario 2: Data consistency check
```
시나리오: Verify agent count matches between pages
기댓값: Agent count consistent across companies page and agents page
실제: Companies page shows "4 agents" for CORTHEX HQ, but Agents page shows 0 agents (due to 500 error on /api/admin/agents)
판정: BUG-A003
```

### Scenario 3: Check slug data
```
시나리오: Verify company slug correctness
기댓값: Slugs are valid kebab-case versions of company names
실제: "Select Star" has slug "slect-star" (missing 'e' — typo)
판정: BUG-A004
```

---

## /admin/employees
### Scenario 1: Page loads
```
시나리오: Navigate to /admin/employees
기댓값: Employee list with assignment board
실제: Page loads correctly. Title: "Employee Assignment". 2 employees total. 고동희 대표 (@ceo) in "Unassigned Users", 테스트 직원 in 개발팀. Department columns: 경영지원실 (0), 개발팀 (1), 마케팅팀 (0), 재무팀 (0). "Invite Employee" button present. Search box and filter buttons (전체/활성/비활성) present.
판정: OK
```

---

## /admin/tools
### Scenario 1: Page loads
```
시나리오: Navigate to /admin/tools
기댓값: Tool list with categories
실제: Page loads correctly. Title: "Admin Tools / 도구 정의 관리". Categories: Common, Finance, Legal, Marketing, Tech. "새 도구 추가" button present. Empty state: "등록된 도구가 없습니다 / tool_definitions 테이블에 도구를 등록하세요"
판정: OK
```

---

## /admin/costs
### Scenario 1: Page loads
```
시나리오: Navigate to /admin/costs
기댓값: Cost dashboard with budget info, department breakdown, recent costs table
실제: Page loads. Title: "비용 및 예산 관리". Budget display shows "$$0" (double dollar sign). Usage bar says "83%" but values are $0.00/$0. Department table and recent costs both show "데이터가 없습니다". 500 errors on /api/admin/costs/summary and /api/admin/budget.
판정: BUG-A005
```

---

## /admin/workflows
### Scenario 1: Page loads
```
시나리오: Navigate to /admin/workflows
기댓값: Workflow list with create button
실제: Page loads correctly. Title: "Admin Workflows". Empty state: "No workflows yet / Create your first workflow to get started". "+ Create Workflow" button present. Navigation tabs: All Workflows, Suggestions. 500 errors on workflows and suggestions APIs.
판정: BUG-A006 (API failures)
```

---

## /admin/monitoring (bonus — observed during testing)
### Scenario 1: System errors observed
```
시나리오: Check monitoring page for system health
기댓값: Healthy system with minimal errors
실제: Server Status: Healthy, Uptime: 1h 28m, Runtime: Bun 1.3.10. Memory: RSS 162 MB, Heap 31/30.7 MB (101% — over limit). Database: Healthy, 70ms response. BUT: Errors (24h): 100 events — ALL showing "invalid input syntax for type uuid: \"system\"".
판정: BUG-A007
```

---

## Bug Summary

### BUG-A001: Onboarding page renders blank / never loads
- **Severity**: Critical
- **Page**: /admin/onboarding
- **Expected**: Onboarding 5-step wizard renders inside Layout's Outlet
- **Actual**: `<main>` content area is completely empty. `data-testid="onboarding-page"` not found. Page redirects to random admin route within seconds.
- **Screenshot**: screenshots/agent-A/onboarding-empty.png
- **Console errors**: Standard 500s on budget/costs
- **Root cause hypothesis**: The OnboardingWizardPage has its own full-screen layout (`min-h-screen`) with its own header, but it's rendered inside the Layout's `<Outlet>` which wraps content in `<div class="p-6">`. The page might be rendering but invisible, or a race condition between React Query refetch and component mount is causing immediate unmount. The Layout's useEffect checking `onboardingCompleted` is NOT the cause (CORTHEX HQ has this set to true).
- **Fix suggestion**:
  1. Move the onboarding route OUTSIDE the Layout route (make it a sibling, not a child)
  2. Add `isOnboardingPage` check using `location.pathname.includes('/onboarding')` instead of exact match
  3. Investigate phantom navigation root cause

### BUG-A002: Agents API returns 500 — agent list always empty
- **Severity**: Critical
- **Page**: /admin/agents
- **Expected**: Agent list shows registered agents
- **Actual**: "등록된 에이전트가 없습니다" despite companies page showing 4 agents for CORTHEX HQ. `/api/admin/agents?companyId=...` returns 500.
- **Console errors**: `500 /api/admin/agents?companyId=6ee92cb0-5065-4e48-8149-38f30ad8913e`
- **Fix suggestion**: Check server route `/admin/agents` for the UUID parsing error. Likely related to BUG-A007's "invalid input syntax for type uuid: system" — the route might be using JWT's companyId ("system") instead of query param.

### BUG-A003: Agent count inconsistency between companies and agents pages
- **Severity**: Major
- **Page**: /admin/companies vs /admin/agents
- **Expected**: CORTHEX HQ agent count matches on both pages
- **Actual**: Companies page shows "4 agents", Agents page shows 0 (due to 500 error)
- **Fix suggestion**: Fix BUG-A002 first; this is likely a downstream effect

### BUG-A004: Company slug typo — "slect-star"
- **Severity**: Minor (data issue)
- **Page**: /admin/companies
- **Expected**: "Select Star" slug should be "select-star"
- **Actual**: Slug is "slect-star" (missing 'e')
- **Fix suggestion**: Update slug in database or add slug auto-generation from company name

### BUG-A005: Costs page — double dollar sign and contradictory usage percentage
- **Severity**: Major
- **Page**: /admin/costs
- **Expected**: Budget display shows proper formatting like "$500.00" and accurate usage %
- **Actual**: Budget displays "$$0" (double dollar sign). Usage bar shows "83%" while actual values are $0.00/$0.00 (should show 0% or N/A when budget is not set). API `/api/admin/budget` returns 500.
- **Console errors**: `500 /api/admin/costs/summary`, `500 /api/admin/budget`
- **Fix suggestion**:
  1. Fix the budget API 500 error
  2. Fix double dollar sign in budget display template
  3. Show 0% or "No budget set" when budget is $0 or undefined

### BUG-A006: Workflows and Suggestions APIs return 500
- **Severity**: Major
- **Page**: /admin/workflows
- **Expected**: API returns workflow list (even if empty)
- **Actual**: Both `/api/admin/workflows` and `/api/admin/workflow-suggestions` return 500
- **Console errors**: `500 /api/admin/...workflows...`, `500 /api/admin/workflow-suggestions`
- **Fix suggestion**: Check server route handlers for companyId UUID issue

### BUG-A007: 100 UUID parsing errors per 24h — "invalid input syntax for type uuid: system"
- **Severity**: Critical (root cause of multiple other bugs)
- **Page**: /admin/monitoring (Errors section)
- **Expected**: No recurring system errors
- **Actual**: 100 events in 24h, ALL showing `invalid input syntax for type uuid: "system"`. This suggests admin API routes are using the JWT's companyId value (which is "system" for superadmin) instead of the query/body companyId parameter.
- **Fix suggestion**: This is likely the ROOT CAUSE of BUG-A002, BUG-A005, BUG-A006. The recent commit `58278fb fix: auto-inject companyId into all admin API calls` was intended to fix this, but it appears the server-side routes are still falling back to JWT companyId="system" in some code paths. Audit ALL admin routes in `packages/server/src/routes/admin/` to ensure they use `req.query.companyId || req.body.companyId` instead of `c.get('companyId')` from JWT.

### BUG-A008: Phantom SPA route navigation (testing blocker)
- **Severity**: Critical
- **Page**: All admin routes
- **Expected**: SPA stays on current route until user navigates
- **Actual**: Pages spontaneously redirect to random admin routes every few seconds. Pattern: navigate to page A -> content loads -> within 2-5 seconds, URL changes to page B, C, D...
- **Console errors**: Cascading 500 errors on budget, costs/summary, agents, soul-templates APIs
- **Root cause hypothesis**: React Query's automatic refetch on these failing APIs causes component re-renders. Combined with React Router v6 and lazy-loaded components, failed queries may trigger ErrorBoundary or Suspense fallback/retry cycles that destabilize the router state. The 500 errors cascade: dashboard queries (budget, costs) fire on every page because they're in a parent component or cached query that refetches.
- **Fix suggestion**:
  1. Fix the root API 500 errors (BUG-A007)
  2. Add `retry: false` to queries that are likely to fail persistently
  3. Ensure dashboard-specific queries only run when on the dashboard route

---

## Pages Load Summary

| Page | Loads? | Content? | CRUD Tested? | Bugs |
|------|--------|----------|--------------|------|
| /admin/onboarding | NO | Blank | NO | BUG-A001 |
| /admin/credentials | YES | Full | Partial (user select OK, form blocked) | - |
| /admin/agents | YES | Partial | NO (phantom nav) | BUG-A002 |
| /admin/departments | YES | Full | NO (phantom nav) | - |
| /admin/companies | YES | Full | NO (phantom nav) | BUG-A003, BUG-A004 |
| /admin/employees | YES | Full | NO (phantom nav) | - |
| /admin/tools | YES | Full | NO (phantom nav) | - |
| /admin/costs | YES | Partial | NO | BUG-A005 |
| /admin/workflows | YES | Full | NO (phantom nav) | BUG-A006 |

## Console Error Summary (across all pages)

| API Endpoint | Status | Frequency |
|-------------|--------|-----------|
| /api/admin/budget | 500 | Every page load |
| /api/admin/costs/summary | 500 | Every page load |
| /api/admin/agents | 500 | On agents page |
| /api/admin/soul-templates | 500 | On agents page |
| /api/admin/workflows | 500 | On workflows page |
| /api/admin/workflow-suggestions | 500 | On workflows page |
| /api/admin/org-chart | 500 | On org-chart page |
| /api/admin/costs/catalog | 500 | On costs page |

**Root cause**: All these 500s trace back to `invalid input syntax for type uuid: "system"` — the admin JWT's companyId is "system" (not a UUID), and some server routes pass this directly to database queries expecting a UUID.
