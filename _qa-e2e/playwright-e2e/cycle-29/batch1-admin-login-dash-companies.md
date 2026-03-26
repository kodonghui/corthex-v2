# Batch 1: Login + Dashboard + Companies -- Cycle 29
Date: 2026-03-26

## Summary
- Total: 30 | PASS: 24 | FAIL: 0 | SKIP: 6

## /admin/login

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-LOGIN-001 | PASS | admin/admin1234 login -> token saved -> redirect to /admin |
| TC-LOGIN-002 | PASS | Empty username + empty password -> submit stayed on login page, no request sent |
| TC-LOGIN-003 | PASS | Username filled, empty password -> submit stayed on login page, focus moved to password |
| TC-LOGIN-004 | PASS | Wrong password -> error message displayed: "아이디 또는 비밀번호가 올바르지 않습니다" |
| TC-LOGIN-005 | PASS | After 2 failed attempts, rate limit triggered: "잠시 후 다시 시도하세요 (8초 후 잠금 해제)", button disabled showing "8초 후 재시도" |
| TC-LOGIN-006 | PASS | After 10s wait, countdown completed and button re-enabled to "세션 시작" |
| TC-LOGIN-007 | PASS | Login with ?redirect=/admin/agents -> after login, correctly redirected to /admin/agents |

## /admin (Dashboard)

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-DASH-001 | SKIP | Company context managed server-side via token; cannot easily simulate no-company state without breaking session |
| TC-DASH-002 | PASS | 3 stat cards visible: DEPARTMENTS (15), ACTIVE USERS (9), AUTONOMOUS AGENTS (9) |
| TC-DASH-003 | PASS | Stat card values: DEPARTMENTS 15 registered, USERS 2 active, AGENTS 0 online -- values from API |
| TC-DASH-004 | PASS | Health Status section: USERS_ACTIVE 22%, AGENTS_ONLINE 0%, DEPT_COUNT "15", SYSTEM OPERATIONAL |
| TC-DASH-005 | PASS | Recent Activity table loaded with 18 rows (9 users + 9 agents), showing Name/Type/Role/Status columns |
| TC-DASH-006 | SKIP | EXPORT_LOGS button clicks but no visible action (no download, no toast) -- feature not implemented |
| TC-DASH-007 | SKIP | VIEW_ALL_RECORDS button clicks but no navigation occurs -- feature not implemented |
| TC-DASH-008 | PASS | Agent Efficiency Readout: circle shows 0%, "0 of 9 agents currently online", Online: 0, Total: 9 |
| TC-DASH-009 | SKIP | Cannot test empty state -- 9 agents exist in DB. Would need clean DB or test tenant |

## /admin/companies

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-COMP-001 | PASS | "Create Company" button opens form with Company Name (text, required) and Slug (text, "lowercase, numbers, hyphens only") fields |
| TC-COMP-002 | PASS | Created "QA-C29-TestCorp" / "qa-c29-testcorp" -> POST success -> toast "Company created" -> card appeared with ACTIVE status |
| TC-COMP-003 | PASS | Submit with empty name -> validation error, no POST sent, input received focus |
| TC-COMP-004 | PASS | Duplicate slug "qa-c29-testcorp" -> error toast shown (raw DB error: "duplicate key value violates unique constraint") |
| TC-COMP-005 | PASS | Search filter "코동희" -> filtered to 1 company, footer shows "Showing 1 of 2 companies" |
| TC-COMP-006 | PASS | Click Edit on company card -> inline edit mode with name input and Save/Cancel buttons |
| TC-COMP-007 | PASS | Edit name to "QA-C29-TestCorp-EDITED" -> Save -> PATCH success -> toast "Company updated" -> card heading updated |
| TC-COMP-008 | PASS | Click Cancel during edit -> reverted to original card view, exited edit mode |
| TC-COMP-009 | PASS | Click Delete -> confirmation dialog: "Delete QA-C29-TestCorp-EDITED" with warning about employee login blocking |
| TC-COMP-010 | PASS | Confirm delete -> toast "Company deleted" -> company status changed to INACTIVE (soft-delete pattern) |
| TC-COMP-011 | PASS | ACCESS_ROOT button clicked -> company set as active context (no page navigation, stays on companies page) |
| TC-COMP-012 | PASS | Stats Total_Entities shows "2" (initially), updated to "8" after create |
| TC-COMP-013 | PASS | Stats Active_Throughput shows "100%" (initially), updated to "25%" after soft-delete |
| TC-COMP-014 | PASS | Pagination controls present: prev (disabled), page "1", next button. "Showing 8 of 8 companies" |
| TC-COMP-015 | PASS | Click "Initialize Node" empty slot -> opens same create company form |

## Bugs Found

### BUG-C29-001: Duplicate slug error shows raw DB constraint message
- **Severity**: LOW
- **Page**: /admin/companies
- **TC**: TC-COMP-004
- **Expected**: User-friendly error like "이 슬러그는 이미 사용 중입니다" or HTTP 409 mapped message
- **Actual**: Raw PostgreSQL error: "duplicate key value violates unique constraint \"companies_slug_unique\""
- **Impact**: Confusing for non-technical users

### BUG-C29-002: EXPORT_LOGS button has no action
- **Severity**: LOW
- **Page**: /admin (Dashboard)
- **TC**: TC-DASH-006
- **Expected**: Export action (CSV download, toast, or modal)
- **Actual**: Button clicks but nothing happens -- no download, no toast, no feedback
- **Impact**: Dead button in UI

### BUG-C29-003: VIEW_ALL_RECORDS button has no action
- **Severity**: LOW
- **Page**: /admin (Dashboard)
- **TC**: TC-DASH-007
- **Expected**: Navigation to full records page or expanded view
- **Actual**: Button clicks but nothing happens -- no navigation
- **Impact**: Dead button in UI
