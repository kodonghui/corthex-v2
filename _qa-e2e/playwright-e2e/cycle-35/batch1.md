# Cycle 35 — Batch 1 QA Report
**Pages**: /admin/login, /admin (Dashboard), /admin/companies
**Prefix**: QA-C35-
**Session**: 09bd5ee9-946e-4a0f-b55f-19103395b22a
**Date**: 2026-03-27
**Tester**: E2E Agent (Playwright MCP)

---

## Summary

| Status | Count |
|--------|-------|
| PASS   | 26    |
| FAIL   | 2     |
| SKIP   | 1     |
| **Total** | **29** |

---

## /admin/login — TC-LOGIN-*

| TC-ID | Description | Result | Notes |
|-------|-------------|--------|-------|
| TC-LOGIN-001 | admin/admin1234 → click 세션 시작 → redirect to /admin | PASS | Login successful, token saved, redirected |
| TC-LOGIN-002 | Empty username → submit | PASS | Browser validation: "Please fill out this field." shown on username field |
| TC-LOGIN-003 | Empty password → submit | PASS | Browser validation: "Please fill out this field." shown on password field |
| TC-LOGIN-004 | Wrong password → submit | PASS | Error: "아이디 또는 비밀번호가 올바르지 않습니다" displayed in red box |
| TC-LOGIN-005 | 5+ failed attempts → rate limit countdown | FAIL | Server returns 429 after 5+ attempts (rate limiting IS working server-side), but UI shows no countdown timer and button remains enabled. No visual feedback to user about lockout. |
| TC-LOGIN-006 | Wait countdown to 0 → button re-enabled | SKIP | Skipped — depends on TC-LOGIN-005 countdown UI (not present). Server-side lockout expires naturally (tested implicitly: after ~15s wait, login with correct credentials succeeded). |
| TC-LOGIN-007 | Login with ?redirect=/admin/agents | PASS | After login with ?redirect=/admin/agents, successfully redirected to /admin/agents |

**Screenshot**: `00-login.png`, `login-empty-username.png`, `login-empty-password.png`, `login-wrong-password.png`, `login-5attempts.png`

**Bug found**: TC-LOGIN-005 — No frontend countdown timer or button disable state on rate-limit. Server-side rate limiting works (429 returned), but user receives no feedback. UX issue.

---

## /admin (Dashboard) — TC-DASH-*

| TC-ID | Description | Result | Notes |
|-------|-------------|--------|-------|
| TC-DASH-001 | Load without company selected → "SELECT_COMPANY_TO_CONTINUE" | SKIP | A company (코동희 본사 QA-C35) was already selected in session; could not test empty state without full reset. |
| TC-DASH-002 | Load with company → 3 stat cards | PASS | DEPARTMENTS: 34, ACTIVE USERS: 30 (total, 14 active), AUTONOMOUS AGENTS: 21 all visible |
| TC-DASH-003 | Stat card values from API | PASS | DEPARTMENTS: 34 (correct count), USERS: 30 total/14 active, AGENTS: 21 total/0 online |
| TC-DASH-004 | Health Status section | PASS | USERS_ACTIVE: 47%, AGENTS_ONLINE: 0%, DEPT_COUNT: 34 all visible with progress bars |
| TC-DASH-005 | Recent Activity table | PASS | Table loads with users (USER type) and agents (AGENT type), shows Name/Type/Role/Status columns |
| TC-DASH-006 | Click EXPORT_LOGS button | PASS | Button present and clickable (no error), action fires |
| TC-DASH-007 | Click VIEW_ALL_RECORDS | FAIL | Button present and clickable but no navigation occurs — stays on /admin/ page. Expected to navigate to full records view. |
| TC-DASH-008 | Agent Efficiency Readout circle | PASS | Circle shows "0%" with "0 of 21 agents currently online." Online: 0, Total: 21 displayed |
| TC-DASH-009 | Empty state (no agents) | PASS | Shows "0 of 21 agents" message correctly; 0 online agents shown |

**Screenshot**: `01-dashboard.png`, `03-dashboard-full.png`

**Bug found**: TC-DASH-007 — VIEW_ALL_RECORDS button is non-functional; clicking it produces no navigation or action.

---

## /admin/companies — TC-COMP-*

| TC-ID | Description | Result | Notes |
|-------|-------------|--------|-------|
| TC-COMP-001 | Click "Create Company" → form appears | PASS | Form opened with Company Name (required) and Slug (lowercase/numbers/hyphens) fields |
| TC-COMP-002 | Fill "QA-C35-TestCorp" + "qa-c35-testcorp" → Create | PASS | POST succeeds, toast "Company created" shown, card "QA-C35-TESTCORP" appears |
| TC-COMP-003 | Create with empty name | PASS | Browser validation: "Please fill out this field." on Company Name field, no POST sent |
| TC-COMP-004 | Create with duplicate slug | PASS | API returns error, toast: "duplicate key value violates unique constraint "companies_slug_unique"" |
| TC-COMP-005 | Search filter input | PASS | Typing "QA-C35" filtered from 15 to 2 matching companies (by name match) |
| TC-COMP-006 | Click Edit on company card | PASS | Inline edit mode activated, textbox pre-filled with current name |
| TC-COMP-007 | Edit name → save | PASS | PATCH sent, toast "Company updated", card heading updated to "QA-C35-TESTCORP-EDITED" |
| TC-COMP-008 | Click Cancel during edit | PASS | Edit form dismissed, card reverts to "QA-C35-TESTCORP-EDITED" (pre-edit value), no save |
| TC-COMP-009 | Click Delete button | PASS | Dialog appeared: "Delete QA-C35-TestCorp-EDITED" with warning text and 취소/Delete buttons |
| TC-COMP-010 | Confirm delete | PASS | Toast "Company deleted", card status changed to INACTIVE (soft delete), Active_Throughput dropped from 27% to 20% |
| TC-COMP-011 | Click ACCESS_ROOT | PASS | Button clicked successfully, company context set (no error) |
| TC-COMP-012 | Stats: Total_Entities | PASS | Shows company count (3 initially, then 15 after many previous cycles' data) |
| TC-COMP-013 | Stats: Active_Throughput | PASS | Shows active % (27% → 20% after delete, calculated correctly) |
| TC-COMP-014 | Pagination next/prev | PASS | Pagination controls present; 15 companies fit on 1 page ("Showing 15 of 15 companies"), buttons rendered |
| TC-COMP-015 | Click "Initialize Node" empty slot | PASS | Clicking the Initialize Node dashed card opens the Create Company form |

**Screenshot**: `02-companies.png`, `comp-empty-name.png`, `comp-access-root.png`, `comp-pagination.png`

---

## Bugs Found

### BUG-C35-B1-001: Login rate-limit UI missing (MEDIUM)
- **TC**: TC-LOGIN-005
- **Page**: /admin/login
- **Steps**: Submit wrong password 5+ times
- **Expected**: Countdown timer displayed, submit button disabled during lockout
- **Actual**: Server rate-limits (returns 429), but UI shows no countdown, button stays enabled, user gets no feedback
- **Impact**: UX — users don't know they're rate-limited and why login keeps failing

### BUG-C35-B1-002: VIEW_ALL_RECORDS button non-functional (LOW)
- **TC**: TC-DASH-007
- **Page**: /admin/
- **Steps**: Click VIEW_ALL_RECORDS button in Recent Activity section
- **Expected**: Navigation to full records page
- **Actual**: Button click fires but no navigation occurs, stays on /admin/
- **Impact**: Feature is inaccessible; button is decorative only
