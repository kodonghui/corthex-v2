# Cycle 30 — Batch 2: Admin Employees + Departments

**Date**: 2026-03-26
**Tester**: QA-C30 Agent (Playwright MCP)
**Pages**: /admin/employees (TC-EMP-*), /admin/departments (TC-DEPT-*)
**Prefix**: QA-C30-

---

## Summary

| Page | Total TCs | PASS | FAIL | SKIP | Bug |
|------|-----------|------|------|------|-----|
| /admin/employees | 16 | 11 | 1 | 4 | 1 |
| /admin/departments | 13 | 12 | 1 | 0 | 1 |
| **TOTAL** | **29** | **23** | **2** | **4** | **2** |

---

## /admin/employees — TC-EMP-* Results

| TC-ID | Action | Result | Notes |
|-------|--------|--------|-------|
| TC-EMP-001 | Click "Add Employee" | **PASS** | Form opens with: username, name, email fields + department multi-select checkboxes. Note: no "role" dropdown (TC mentions role admin/user but UI has no role field) |
| TC-EMP-002 | Fill form -> submit | **PASS** | POST succeeded, toast "직원이 초대되었습니다", temporary password modal shown with copy button, count updated 9->10 |
| TC-EMP-003 | Empty username -> submit | **PASS** | HTML5 required-field validation blocked submission, focus moved to username field |
| TC-EMP-004 | Duplicate username | **FAIL** | API returned 409 (console error), but NO user-facing error toast. Form stays open silently. **BUG** |
| TC-EMP-005 | Invalid email format | **PASS** | HTML5 email validation blocked submission, focus on email field |
| TC-EMP-006 | Search by name/username | **PASS** | Search "C30" filtered to 1 result (QA-C30-employees), count updated to "1명의 직원" |
| TC-EMP-007 | Filter by department | **PASS** | Selecting "App E2E Dept" showed 0 employees with "No employees found" message |
| TC-EMP-008 | Filter by status | **PASS** | "Active" filter showed only 1 active employee |
| TC-EMP-009 | Click Edit | **PASS** | Edit form opened with title "직원 수정 — QA-C30-employees", pre-filled data, username disabled |
| TC-EMP-010 | Update name + email -> save | **PASS** | PATCH succeeded, table row updated to "QA-C30-employees-EDITED" / "qa-c30-edited@test.com" |
| TC-EMP-011 | Click Lock (deactivate) | **PASS** | Confirmation dialog "QA-C30-employees-EDITED 비활성화" shown, confirmed -> status changed Active->Inactive, toast "직원이 비활성화되었습니다" |
| TC-EMP-012 | Reset Password button | **SKIP** | No "Reset Password" button visible in UI. Only Edit and Deactivate icons in Actions column |
| TC-EMP-013 | Copy password to clipboard | **PASS** | Clicked "복사" on temp password modal -> toast "비밀번호가 복사되었습니다" |
| TC-EMP-014 | Pagination controls | **PASS** | "Showing 1 to 10 of 10 entries" displayed, page "1" button, prev/next disabled (single page) |
| TC-EMP-015 | Sort by column header | **SKIP** | Column headers not clickable for sorting; no sort indicators or behavior observed |
| TC-EMP-016 | First employee role=admin | **SKIP** | No role column visible in employees table; cannot verify from UI |

### Additional Observations (Employees)
- Stats cards show: Total Workforce, Active, Unassigned -- all update correctly in real-time
- Avatar initials generated from name correctly
- Department checkboxes in add/edit forms work as expected
- XSS-test department names (`<script>alert(1)</script>`) rendered safely as text in dropdown options

---

## /admin/departments — TC-DEPT-* Results

| TC-ID | Action | Result | Notes |
|-------|--------|--------|-------|
| TC-DEPT-001 | Click "Create Department" | **PASS** | Form appears with: name (required), description (optional), Cancel/Create buttons |
| TC-DEPT-002 | Fill name -> 생성 | **PASS** | POST succeeded, toast "부서가 생성되었습니다", count updated 19->20, Active Depts 2->3 |
| TC-DEPT-003 | Empty name -> submit | **PASS** | HTML5 required-field validation blocked submission |
| TC-DEPT-004 | Duplicate name | **FAIL** | API returned 409 (console error), but NO user-facing error toast. Form stays open silently. **BUG** |
| TC-DEPT-005 | Search departments | **PASS** | Search "C30" filtered to 2 results, "Showing 2 of 20 Registered Departments" |
| TC-DEPT-006 | Click department card | **PASS** | Detail panel opened with: Name, ID, Description, Status, Assigned Agents (0), Created date |
| TC-DEPT-007 | Click Edit -> PATCH | **PASS** | Inline edit form opened with pre-filled name/description, saved -> name updated to "QA-C30-departments-EDITED" |
| TC-DEPT-008 | Click Delete -> cascade analysis | **PASS** | Cascade modal shows impact: agents (0), active tasks (0), knowledge docs (0), costs ($0.00). Two deletion modes offered |
| TC-DEPT-009 | Select force mode | **PASS** | "강제 종료" radio selectable, changes mode correctly |
| TC-DEPT-010 | Select wait_completion | **PASS** | "완료 대기 (권장)" is default selected, maps to wait_completion mode |
| TC-DEPT-011 | Cancel cascade modal | **PASS** | Modal closed, department still exists |
| TC-DEPT-012 | Stats: Total Sectors (integer) | **PASS** | Shows "19" (integer, not float). Stats cards: Total Departments, Active Depts, Total Agents, System Alerts -- all integers |
| TC-DEPT-013 | Agent list in detail | **PASS** | Shows "Assigned Agents (0)" with "No agents assigned" message |

### Additional Observations (Departments)
- Delete sets status to "Inactive" rather than removing the row (soft delete)
- Toast "부서가 삭제되었습니다" on successful delete
- Active Depts counter updates correctly on create/delete
- XSS-test department names rendered safely in the table
- Cascade analysis modal provides comprehensive impact details including cost preservation note
- Pagination shows "Showing 20 of 20 Registered Departments" with page navigation

---

## Bugs Found

### BUG-C30-001: No error toast for duplicate employee username (TC-EMP-004)
- **Severity**: Medium
- **Steps**: Add Employee -> fill duplicate username "qa-c30-emp" -> submit
- **Expected**: Error toast "이미 존재하는 아이디입니다"
- **Actual**: API returns 409, but form stays open with no user-facing error message. No toast, no inline error.
- **Impact**: User has no feedback that the username is taken

### BUG-C30-002: No error toast for duplicate department name (TC-DEPT-004)
- **Severity**: Medium
- **Steps**: Create Department -> fill existing name "App E2E Dept" -> submit
- **Expected**: Error toast for duplicate name
- **Actual**: API returns 409, but form stays open with no user-facing error message
- **Impact**: User has no feedback that the department name already exists

---

## Test Data Created
- Employee: `qa-c30-emp` / `QA-C30-employees-EDITED` (deactivated)
- Department: `QA-C30-departments-EDITED` (deleted/inactive)
