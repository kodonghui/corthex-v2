# Agent C: Edge Case & Security Verifier
> Tested: 2026-03-17
> Pages: 19/19 admin routes tested, 7 bugs found
> Security tests: 10 admin routes tested without auth — ALL FAILED (no redirect to login)

## Security Audit

### Unauthorized Access Results

Every admin route was accessible without authentication. The SPA loads the full admin layout (sidebar, navigation, user info "superadmin") without checking for a JWT token. The dashboard even displays real data (4 companies, 3 active users).

| Admin Route | Expected | Actual | Verdict |
|------------|----------|--------|---------|
| /admin | Redirect to /admin/login | Full dashboard loaded with real data (4 companies, 3 users) | **BUG-C001** |
| /admin/companies | Redirect to /admin/login | Full admin layout loaded, sidebar visible | **BUG-C001** |
| /admin/employees | Redirect to /admin/login | Full admin layout loaded, sidebar visible | **BUG-C001** |
| /admin/departments | Redirect to /admin/login | Full admin layout loaded, sidebar visible | **BUG-C001** |
| /admin/agents | Redirect to /admin/login | Full admin layout loaded, sidebar visible | **BUG-C001** |
| /admin/credentials | Redirect to /admin/login | Full admin layout loaded, sidebar visible | **BUG-C001** |
| /admin/settings | Redirect to /admin/login | Full admin layout loaded, sidebar visible | **BUG-C001** |
| /admin/api-keys | Redirect to /admin/login | Full admin layout loaded, sidebar visible | **BUG-C001** |
| /admin/tools | Redirect to /admin/login | Full admin layout loaded, sidebar visible | **BUG-C001** |
| /admin/costs | Redirect to /admin/login | Full admin layout loaded, sidebar visible | **BUG-C001** |

**Mitigating factor**: API endpoints DO enforce auth (returns `AUTH_001: "인증 토큰이 필요합니다"`), so actual data is not leaked via API calls. However the SPA shell itself leaks:
- Route structure (all 19 admin routes exposed in sidebar)
- Company names in dropdown ("CORTHEX HQ", "Select Star", "QA Test Corp")
- User info ("관리자", "superadmin")
- Build info ("#567 · 58278fb")

### Credential Exposure

| Page | Check | Result |
|------|-------|--------|
| /admin/credentials | sk- prefix keys in DOM | None found - OK |
| /admin/credentials | JWT tokens in DOM | None found - OK |
| /admin/credentials | Hex key strings (32+ chars) | None found - OK |
| /admin/api-keys | Key exposure check | Page auto-navigated before full load (see BUG-C003) |

**Note**: The credentials page mentions "AES-256" encryption for CLI tokens and shows user entries (@admin, @ceo, @testuser) without exposing actual key values. This is correct behavior.

## Console Error Report

### Global Errors (appear on EVERY page)

These 500 errors fire on every single admin page navigation:

```
[ERROR] Failed to load resource: the server responded with a status of 500 ()
  @ /api/admin/budget?companyId=6ee92cb0-5065-4e48-8149-38f30ad8913e

[ERROR] Failed to load resource: the server responded with a status of 500 ()
  @ /api/admin/costs/summary?startDate=2026-03-01&endDate=2026-03-17&companyId=6ee92cb0-5065-4e48-8149-38f30ad8913e
```

**Note**: These errors fire TWICE per page load (duplicate fetch calls).

### Page-Specific Errors

| Page | Additional 500 Errors |
|------|----------------------|
| /admin (dashboard) | `/api/admin/agents` (500) |
| /admin/agents | `/api/admin/agents` (500), `/api/admin/soul-templates` (500) |
| /admin/companies | `/api/admin/soul-templates` (500) |
| /admin/api-keys | `/api/admin/api-keys` (500) |
| /admin/nexus | `/api/admin/org-chart` (500) |
| /admin/employees | `/api/admin/employees?...&page=1&limit=100` (500), `/api/admin/credentials` (500) |
| /admin/tools | No errors (0) |
| /admin/monitoring | No errors (0) |

### Unique 500 API Endpoints (6 total)

1. `/api/admin/budget` -- every page
2. `/api/admin/costs/summary` -- every page
3. `/api/admin/agents` -- dashboard, agents page
4. `/api/admin/soul-templates` -- agents, companies pages
5. `/api/admin/api-keys` -- api-keys page
6. `/api/admin/org-chart` -- nexus page

## Edge Cases

### SPA Router Auto-Navigation Bug

```
시나리오: Navigate to /admin/employees and wait for content
기댓값: Page stays on /admin/employees and renders employee list
실제: Page auto-navigates through multiple routes (/admin/employees -> /admin/nexus -> /admin/onboarding -> /admin/settings -> /admin/workflows) in rapid succession
판정: BUG-C003
```

The SPA appears to have an unstable routing mechanism that cycles through admin routes automatically. This was observed consistently:
- Navigate to /admin/credentials -> within seconds, URL changes to /admin/departments
- Navigate to /admin/employees -> URL changes to /admin/nexus
- Navigate to /admin/api-keys -> URL changes to /admin (dashboard)
- The main content sometimes renders content from a different route than the URL indicates

### Route Content Mismatch

```
시나리오: Navigate to /admin/employees and check rendered content
기댓값: Employee management page content
실제: Settings page content rendered (data-testid="settings-page") while URL shows /admin/employees
판정: BUG-C004
```

### XSS / Long Input / Emoji Testing

```
시나리오: Test form input edge cases on /admin/employees
기댓값: Able to open add employee form and test boundary inputs
실제: BLOCKED by BUG-C003 — page auto-navigates away before forms can be interacted with
판정: BLOCKED
```

### Delete Confirmation Testing

```
시나리오: Find delete button on CRUD pages and verify confirmation dialog
기댓값: Confirmation dialog appears before deletion
실제: BLOCKED by BUG-C003 — page auto-navigates away before interaction possible
판정: BLOCKED
```

## Bug Summary

### BUG-C001: No Client-Side Auth Guard on Admin Routes
- **Severity**: Critical / Security
- **Category**: Security
- **Description**: All 19 admin routes are accessible without authentication. The SPA renders the full admin layout including sidebar navigation, company dropdown, and user info without checking for a JWT token. While API endpoints enforce auth (returning AUTH_001), the UI shell exposes sensitive structural information.
- **Impact**: Route structure, company names, user info, and build numbers leaked to unauthenticated users
- **Fix**: Add auth guard in React Router that checks for JWT token before rendering admin layout. Redirect to /admin/login if no token found.
- **Screenshot**: `screenshots/agent-C/sec-01-admin-no-auth.png`

### BUG-C002: Six API Endpoints Return 500 on Every Page Load
- **Severity**: Major
- **Category**: Console Error / Server
- **Description**: `/api/admin/budget` and `/api/admin/costs/summary` return HTTP 500 on every admin page. Additionally, `/api/admin/agents`, `/api/admin/soul-templates`, `/api/admin/api-keys`, and `/api/admin/org-chart` return 500 on their respective pages. Each error fires twice (duplicate fetches).
- **Impact**: Dashboard shows broken data, cost management non-functional, agent list fails to load
- **Root Cause**: Likely server-side error in budget/costs route handlers (possibly missing table or query error)

### BUG-C003: SPA Router Auto-Navigates Between Routes
- **Severity**: Critical
- **Category**: Edge Case / Router
- **Description**: After navigating to any admin route, the SPA automatically redirects to different routes within seconds. The navigation pattern appears to cycle through multiple routes rapidly. This makes the entire admin panel effectively unusable for testing and likely for end users.
- **Impact**: Users cannot stay on any page long enough to use it. Completely blocks normal admin operations.
- **Root Cause**: Possibly a useEffect loop in a layout component, or a prefetch/redirect mechanism firing incorrectly. The budget/costs 500 errors may be triggering error-handling redirects.

### BUG-C004: Route Content Mismatch (Wrong Page Rendered)
- **Severity**: Major
- **Category**: Edge Case / Router
- **Description**: The main content area sometimes renders content from a different route than what the URL indicates. Observed: URL shows /admin/employees but DOM contains Settings page content (data-testid="settings-page").
- **Impact**: Users see wrong content for the page they navigated to
- **Related to**: BUG-C003 (both are router issues)

### BUG-C005: Duplicate API Calls on Every Page
- **Severity**: Minor
- **Category**: Performance
- **Description**: Every API call (budget, costs/summary, agents, etc.) fires exactly twice per page load. This doubles the server load for no benefit.
- **Impact**: 2x server load, 2x error count in logs
- **Root Cause**: Likely React StrictMode double-rendering in production, or duplicate useEffect without cleanup

### BUG-C006: Company Names Leaked to Unauthenticated Users
- **Severity**: Major / Security
- **Category**: Security / Information Disclosure
- **Description**: When accessing /admin without auth, the company dropdown shows actual company names: "CORTHEX HQ", "Select Star", "QA Test Corp". This is customer data leaking to unauthorized visitors.
- **Impact**: Customer company names exposed publicly

### BUG-C007: Build Info Exposed in Sidebar
- **Severity**: Minor / Security
- **Category**: Security / Information Disclosure
- **Description**: The sidebar footer shows "#567 · 58278fb" (build number and git commit hash) to all users including unauthenticated visitors.
- **Impact**: Attackers can identify exact code version and target known vulnerabilities

## Severity Summary

| Severity | Count |
|----------|-------|
| Critical | 2 (BUG-C001, BUG-C003) |
| Major | 3 (BUG-C002, BUG-C004, BUG-C006) |
| Minor | 2 (BUG-C005, BUG-C007) |
| BLOCKED | 2 tests blocked by BUG-C003 |

## Recommendations (Priority Order)

1. **IMMEDIATE**: Add client-side auth guard (BUG-C001) — check JWT before rendering admin layout
2. **IMMEDIATE**: Fix SPA router auto-navigation (BUG-C003) — this blocks all other testing and makes admin unusable
3. **HIGH**: Fix 500 errors on budget/costs/agents/soul-templates/api-keys/org-chart endpoints (BUG-C002)
4. **MEDIUM**: Fix route content mismatch (BUG-C004)
5. **LOW**: Remove duplicate API calls (BUG-C005), hide build info from production (BUG-C007)
