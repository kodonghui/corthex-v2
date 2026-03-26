# Cycle 31 — Batch 2: Employees & Departments E2E Results

**Date**: 2026-03-26
**Tester**: QA Agent (Claude Sonnet 4.6)
**Session**: QA-C31-batch2
**Pages**: /admin/employees, /admin/departments
**Test Prefix**: QA-C31-

---

## Login

- Navigated to http://localhost:5173/admin/login
- Logged in as admin/admin1234, clicked "세션 시작"
- Redirected to /admin — SUCCESS

---

## /admin/employees — TC-EMP-*

**Page Load**: 10 employees shown on load. Stats: Total Workforce 10, Active 0, Unassigned 10.

| TC-ID | Description | Result | Notes |
|-------|-------------|--------|-------|
| TC-EMP-001 | Click "Add Employee" → form opens | PASS | Form: 아이디, 이름, 이메일, 부서 배정 (checkbox multi-select). No "role" field visible — spec lists role (admin/user) but UI omits it. |
| TC-EMP-002 | Fill valid form → submit | PASS | POST succeeded. Toast "직원이 초대되었습니다". Employee QA-C31-employees (@qa-c31-emp) appears in table. Count → 11. |
| TC-EMP-003 | Empty username → submit | PASS | Form stays open, username field focused (HTML5 native validation). No error text displayed via a11y tree. |
| TC-EMP-004 | Duplicate username (qa-c31-emp) → submit | PASS | API 409 → error toast "이미 존재하는 아이디입니다". |
| TC-EMP-005 | Invalid email (not-an-email) → submit | PARTIAL | Form stays open, email field focused (HTML5 native browser validation). No custom error message text shown. Submission blocked correctly. |
| TC-EMP-006 | Search "QA-C31" | PASS | Table filtered to 1 result instantly. |
| TC-EMP-007 | Filter by department "App E2E Dept" | PASS | 0 employees shown (all unassigned). |
| TC-EMP-008 | Filter by status "Active" | PASS | Shows only QA-C31-employees (1 active). |
| TC-EMP-009 | Click Edit on employee | PASS | Edit panel opens with current data. Username field disabled (non-editable). Name, email, department checkboxes editable. |
| TC-EMP-010 | Update name → save | PASS | PATCH request. Toast "직원 정보가 수정되었습니다". Row updated to QA-C31-employees-EDITED. |
| TC-EMP-011 | Click toggle status button → deactivate | PASS | Confirmation dialog "QA-C31-employees-EDITED 비활성화" shown. On confirm: status → Inactive, toast "직원이 비활성화되었습니다". Active count → 0. |
| TC-EMP-012 | Click Reset Password button | FAIL | **No reset password button exists.** Only 2 action buttons per row: Edit (pencil) and toggle status (activate/deactivate toggle). Reset password is not exposed in the UI. Initial password shown on creation only (modal). |
| TC-EMP-013 | Copy password to clipboard | PASS | "복사" button in initial password modal. Toast "비밀번호가 복사되었습니다". |
| TC-EMP-014 | Pagination controls | N/A | All 11 employees fit on 1 page ("Showing 1 to 11 of 11 entries"). No pagination needed. |
| TC-EMP-015 | Sort by column header | INCONCLUSIVE | Name column header is clickable but no sort indicator visible in a11y tree. Row order unchanged. Sort may not be implemented. |
| TC-EMP-016 | First employee role = admin (onboarding) | SKIP | Cannot verify without creating new company. |

### EMP Summary
- PASS: 10/16
- PARTIAL: 1/16 (TC-EMP-005 — validation works but no custom error text)
- FAIL: 1/16 (TC-EMP-012 — Reset Password button missing)
- INCONCLUSIVE: 1/16 (TC-EMP-015 — sort)
- N/A: 1/16 (TC-EMP-014)
- SKIP: 1/16 (TC-EMP-016)

### EMP Findings

**BUG-C31-EMP-001** (MEDIUM): Reset Password feature missing from UI
- TC: TC-EMP-012
- Expected: Each employee row has a "Reset Password" button → POST /admin/employees/{id}/reset-password → new password shown in modal
- Actual: Only 2 action buttons exist (edit + toggle status). No reset password button. The only way to reset is through initial invite.
- Impact: Admin cannot reset employee passwords after initial creation.

**NOTE-C31-EMP-001**: Role field missing from Add Employee form
- TC: TC-EMP-001
- Spec states: "role (admin/user)" field in form
- Actual: Form has 아이디, 이름, 이메일, 부서 배정 only — no role selector
- May be by design (all employees default to "user" role)

---

## /admin/departments — TC-DEPT-*

**Page Load**: 21 departments shown. Stats: Total Departments 21, Active Depts 2, Total Agents 13, System Alerts 19.

| TC-ID | Description | Result | Notes |
|-------|-------------|--------|-------|
| TC-DEPT-001 | Click "Create Department" → form opens | PASS | Form: 부서명 * (required), 설명 (optional). |
| TC-DEPT-002 | Fill "QA-C31-departments" → create | PASS | POST succeeded. Toast "부서가 생성되었습니다". Department appears in table with status Operational. Count → 22. |
| TC-DEPT-003 | Empty name → submit | PASS | Form stays open, name field focused (HTML5 native required validation). |
| TC-DEPT-004 | Duplicate name | PASS | Error toast "같은 이름의 부서가 이미 있습니다". |
| TC-DEPT-005 | Search "QA-C31" | PASS | Filtered to 2 matching results (QA-C31-onboard-dept + QA-C31-departments). |
| TC-DEPT-006 | Click department row | PASS | Modal detail overlay opens with: name, ID, description, status, Assigned Agents (0) "No agents assigned", Created timestamp. |
| TC-DEPT-007 | Click Edit button | PASS | Inline edit row appears pre-filled with current name and description. PATCH on save. Toast "부서가 수정되었습니다". Name updated to QA-C31-departments-EDITED. |
| TC-DEPT-008 | Click Delete → cascade modal | PASS | Modal shows: 소속 에이전트 0명, 진행 중 작업 0건, 학습 기록 0건, 누적 비용 $0.00. Two mode options shown. |
| TC-DEPT-009 | Cascade modal: select force mode | PASS | "강제 종료" radio selects successfully. |
| TC-DEPT-010 | Cascade modal: wait_completion → confirm delete | PASS | DELETE with wait_completion mode. Toast "부서가 삭제되었습니다". Row status → Inactive. Active Depts 3 → 2. |
| TC-DEPT-011 | Cascade modal: cancel | PASS | Closes modal without deleting. Department remains. |
| TC-DEPT-012 | Stats: Total Sectors count (integer, not float) | PASS | Shows "21" (integer). No float formatting issue. |
| TC-DEPT-013 | Agent list in detail panel | PASS | Detail panel shows "Assigned Agents (0)" with "No agents assigned" message. Departments with 0 agents display correctly. |

### DEPT Summary
- PASS: 13/13
- All TC-DEPT-* test cases passed.

### DEPT Findings

**NOTE-C31-DEPT-001**: Detail panel is a modal overlay (not sidebar)
- TC: TC-DEPT-006
- The department detail view opens as a centered modal with dark overlay, not a side panel
- This blocks interaction with the underlying table — must close modal before editing
- No agents with status dots visible (all departments have 0 agents assigned in test data)

---

## Cleanup

- Created QA-C31-employees (@qa-c31-emp) — deactivated (Inactive status)
- Created QA-C31-departments → renamed to QA-C31-departments-EDITED → deleted (Inactive/soft-deleted)

---

## Overall Batch 2 Summary

| Page | Total TCs | PASS | FAIL | PARTIAL | INCONCLUSIVE | N/A/SKIP |
|------|-----------|------|------|---------|--------------|----------|
| /admin/employees | 16 | 10 | 1 | 1 | 1 | 3 |
| /admin/departments | 13 | 13 | 0 | 0 | 0 | 0 |
| **Total** | **29** | **23** | **1** | **1** | **1** | **3** |

**Pass rate (excluding N/A/SKIP)**: 23/26 = 88.5%

### Bugs Found

| ID | Severity | Page | Description |
|----|----------|------|-------------|
| BUG-C31-EMP-001 | MEDIUM | /admin/employees | Reset Password button missing from employee actions |

### Screenshots
- `emp-01-page-load.png` — Employees page initial load
- `emp-01-add-dialog.png` — Add Employee form
- `emp-02-created.png` — Initial password modal after creation
- `emp-final.png` — Final employees page state
- `dept-01-page-load.png` — Departments page initial load
- `dept-07-edit-blocked.png` — Department detail modal (blocking edit button)
- `dept-08-cascade-modal.png` — Delete cascade analysis modal
- `dept-final.png` — Final departments page state
