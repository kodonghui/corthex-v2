# Browser QA Report — Cycle #24

**Date**: 2026-03-26 13:03-13:15 UTC
**Type**: Full CRUD + Security + Mobile viewport
**Agent**: E2E Browser QA (Playwright MCP)
**Build**: #829 / c602945

---

## Summary

| Metric | Value |
|--------|-------|
| Pages tested | 20/20 |
| Pages loaded OK | 19/20 |
| Pages 404 | 1 (audit-logs) |
| Console errors (real) | 0 |
| CRUD cycles completed | 5 (departments, employees, agents, tools, companies) |
| Empty form validation | 5/5 PASS |
| XSS injection safe | 5/5 PASS |
| Double-click protection | 1/1 PASS |
| Mobile responsive | 1/1 PASS |
| Bugs found | 2 |

---

## Bug List

| # | Page | Severity | Description | Screenshot |
|---|------|----------|-------------|------------|
| B24-001 | /admin/costs | MEDIUM | Budget widget shows `$0.00 / $NaN` — budget denominator is NaN. Also "83%" usage shown when actual usage is $0.00 (should be 0%). Likely budget amount not parsed as number. | costs-nan-bug.png |
| B24-002 | /admin/audit-logs | HIGH | Page returns 404 "페이지를 찾을 수 없습니다". Route not registered in admin router. | audit-logs.png |

---

## Page-by-Page Results

### Read-Only Pages

| # | Page | Status | Console Errors | Notes |
|---|------|--------|----------------|-------|
| 1 | /admin (dashboard) | OK | 0 | Stats correct: 6 depts, 3 users, 3 agents |
| 11 | /admin/costs | OK* | 0 | *$NaN bug in budget widget (B24-001) |
| 12 | /admin/nexus | OK | 0 | Org chart renders with connections |
| 17 | /admin/monitoring | OK | 0 | Server online, 11h+ uptime, 71ms DB latency |
| 18 | /admin/audit-logs | 404 | 0 | Route missing (B24-002) |
| 19 | /admin/n8n-editor | OK | 0 | Shows unreachable (KB-004 expected) |

### CRUD Pages (Full Test)

| # | Page | Create | Read | Update | Delete | Empty Validate | XSS Safe |
|---|------|--------|------|--------|--------|----------------|----------|
| 2 | /admin/departments | PASS | PASS | PASS | PASS (soft) | PASS | PASS |
| 3 | /admin/employees | PASS | PASS | PASS | PASS (soft) | PASS | N/A |
| 4 | /admin/agents | PASS | PASS | PASS | PASS (soft) | PASS | N/A |
| 5 | /admin/tools | PASS | PASS | PASS | N/A (edit only) | PASS | N/A |
| 8 | /admin/companies | PASS | PASS | N/A | PASS (soft) | PASS | PASS |

### Navigation-Only Pages (Screenshot Verified)

| # | Page | Loaded | Screenshot |
|---|------|--------|------------|
| 6 | /admin/credentials | OK | credentials.png |
| 7 | /admin/api-keys | OK | api-keys.png |
| 9 | /admin/users | OK | users.png |
| 10 | /admin/settings | OK | settings.png |
| 13 | /admin/org-templates | OK | org-templates.png |
| 14 | /admin/soul-templates | OK | soul-templates.png |
| 15 | /admin/report-lines | OK | report-lines.png |
| 20 | /admin/onboarding | OK | onboarding.png |

---

## Test Details

### a) Empty Form Submit
All 5 tested CRUD forms blocked empty submissions client-side. No POST requests were made to the server.

### b) XSS Injection
- Departments: `<img src=x onerror=alert(1)>` and `<script>alert(1)</script>` both render as text
- Companies: `<script>alert(1)</script>` company name renders as text in ALL_CAPS theme
- Dashboard: XSS payloads in Recent Activity table displayed safely as text
- Nexus org chart: XSS agent names displayed as text nodes

### c) CRUD Happy Path
- Departments: Create -> Edit name -> Delete (soft: status=Inactive). Toast messages shown.
- Employees: Create -> Temp password dialog -> Edit name -> Deactivate. All successful.
- Agents: Create -> Edit soul -> Deactivate via Config tab. All successful.
- Tools: Create -> Edit available (no delete button). Tool appears in permission matrix.
- Companies: Create -> Delete (soft: status=INACTIVE). Card remains with INACTIVE badge.

### d) Double-Click Protection
- Departments: Clicked Create button twice rapidly -> only 1 record created. PASS.

### e) Special Characters
- Korean chars: "테스트부서" renders correctly (KB-002 tofu in headless is font issue only)
- Emoji: "테스트부서 🚀팀" renders correctly
- Prior SQL injection test data (`'; DROP TABLE--`) visible in data, no damage

### f) Mobile Viewport (390x844)
- Departments page: Responsive layout activated, table columns collapsed to Name+Status
- Sidebar collapsed to hamburger menu
- All content readable, no overflow

### g) Console Errors
- 0 real errors across all pages
- 1 warning: `The specified value "undefined"` on costs/onboarding pages (input receiving undefined)
- HTTP 409 on duplicate department name creation (expected behavior)

---

## Server-Side Observations

From monitoring Sys-Log:
- `column "personality_traits" does not exist` — repeated 4 times (4:01 AM)
- `org_templates FK constraint violation` — 1 time (12:14 PM, from cycle 23 test data)
- These are server-side DB errors, not UI bugs, but worth investigating

---

## Known Behaviors (NOT bugs)
- KB-001: ALL_CAPS text is theme styling
- KB-002: Korean tofu in headless = font issue
- KB-003: PWA manifest warning (not seen this cycle)
- KB-004: n8n unreachable = expected
- KB-005: Demo/test data from prior cycles present
- KB-008: Memory 140.4% = cosmetic

---

## Cleanup Status
- QA-24-departments-EDITED: soft-deleted (Inactive)
- QA-24-dblclick-test: soft-deleted (Inactive)
- QA-24-employees-EDITED: deactivated (Inactive)
- QA-24-agents: deactivated [OFF]
- qa-24-tool: remains (no delete option)
- QA-24-company: soft-deleted (INACTIVE)
