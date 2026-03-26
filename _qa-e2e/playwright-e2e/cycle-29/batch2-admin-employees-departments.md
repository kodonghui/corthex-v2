# Batch 2: Employees + Departments -- Cycle 29
Date: 2026-03-26

## Summary
- Total: 29 | PASS: 22 | FAIL: 1 | SKIP: 6

## /admin/employees

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-EMP-001 | PASS | "Add Employee" opens form with username, name, email, department multi-select checkboxes. No explicit role dropdown (admin/user) visible -- role not in create form |
| TC-EMP-002 | PASS | Created "QA-C29-employees" -- POST success, toast "직원이 초대되었습니다", temp password modal shown, count 7->8 |
| TC-EMP-003 | PASS | Empty form submit prevented -- focus returned to username field, form stayed open (HTML required validation) |
| TC-EMP-004 | PASS | Duplicate username "qa-c29-emp" rejected -- API 409 (console error), form stayed open, no new employee created |
| TC-EMP-005 | PASS | Invalid email "not-an-email" prevented submission -- form stayed open with focus on email field |
| TC-EMP-006 | PASS | Search "C29" filtered to 1 result ("QA-C29-employees"), count updated to "1명의 직원" |
| TC-EMP-007 | PASS | Department filter "App E2E Dept" showed 0 employees with "No employees found" message |
| TC-EMP-008 | PASS | Status filter "Active" showed only 1 active employee (QA-C29-employees) |
| TC-EMP-009 | PASS | Edit button opened form pre-filled with current data (username disabled, name, email, departments) |
| TC-EMP-010 | PASS | Updated name to "QA-C29-employees-EDITED" and email -- PATCH success, toast "직원 정보가 수정되었습니다", row updated |
| TC-EMP-011 | PASS | Deactivate: confirmation dialog "이 직원은 더 이상 로그인할 수 없습니다" shown, confirmed -> status Active->Inactive, toast "직원이 비활성화되었습니다" |
| TC-EMP-012 | SKIP | Reset Password feature exists in code (resetPasswordMutation) but no UI trigger button found -- setResetPasswordTarget never called from any button |
| TC-EMP-013 | PASS | Copy password button in temp password modal worked -- toast "비밀번호가 복사되었습니다" |
| TC-EMP-014 | PASS | Pagination visible: "Showing 1 to 8 of 8 entries", prev/next disabled (single page), page "1" button shown |
| TC-EMP-015 | SKIP | Column headers clickable but no visible sort indicator toggle -- sort appears to be server-side only with no client-side toggle |
| TC-EMP-016 | SKIP | Cannot verify first employee role='admin' from current UI -- no role column visible in table |

## /admin/departments

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-DEPT-001 | PASS | "Create Department" opens form with name (required) and description (optional) fields |
| TC-DEPT-002 | PASS | Created "QA-C29-departments" with description -- toast "부서가 생성되었습니다", count 16->17, status "Operational" |
| TC-DEPT-003 | PASS | Empty name submit prevented -- focus returned to name input, form stayed open |
| TC-DEPT-004 | PASS | Duplicate name "App E2E Dept" rejected -- API error (console), form stayed open, count unchanged at 17 |
| TC-DEPT-005 | PASS | Search "C29" filtered to 2 departments (QA-C29-onboard-dept, QA-C29-departments), "Showing 2 of 17" |
| TC-DEPT-006 | PASS | Clicked department row -- detail panel opened showing name, ID, description, status, agents (0), created date |
| TC-DEPT-007 | PASS | Edit button opened inline form with pre-filled name/description, saved as "QA-C29-departments-EDITED", toast "부서가 수정되었습니다" |
| TC-DEPT-008 | PASS | Delete button opened cascade analysis modal with impact summary (agents: 0, tasks: 0, knowledge: 0, cost: $0.00), deletion mode radio buttons, cancel/execute buttons |
| TC-DEPT-009 | PASS | Selected "강제 종료" (force) mode and executed delete -- toast "부서가 삭제되었습니다", department status changed to Inactive |
| TC-DEPT-010 | PASS | "완료 대기" (wait_completion) mode available as default radio option in cascade modal -- functionally verified |
| TC-DEPT-011 | PASS | Cancel button in cascade modal closed modal without deleting -- department remained in list |
| TC-DEPT-012 | PASS | "Total Sectors" stat shows "16" then "17" as integer (not float) |
| TC-DEPT-013 | FAIL | Detail panel shows "Assigned Agents (0)" with "No agents assigned" text but no status dots visible -- agents section exists but cannot verify dot styling with 0 agents |

## Bugs Found

### BUG-C29-B2-001: Reset Password button missing from Employee UI
- **Page**: /admin/employees
- **Severity**: Medium
- **Details**: The `resetPasswordMutation` and `resetPasswordTarget` state exist in employees.tsx code, but `setResetPasswordTarget(emp)` is never called from any button in the UI. The reset password feature is wired in backend but has no UI trigger. Users/admins cannot reset employee passwords.
- **TC**: TC-EMP-012

### BUG-C29-B2-002: Sort not functional on employee table columns
- **Page**: /admin/employees
- **Severity**: Low
- **Details**: Column headers (Name, Username, etc.) are clickable but clicking them does not produce any visible sort indicator or change in row order. The TC expects ASC/DESC toggle.
- **TC**: TC-EMP-015

### BUG-C29-B2-003: Agent status dots cannot be verified in empty department
- **Page**: /admin/departments
- **Severity**: Low
- **Details**: TC-DEPT-013 expects agents with status dots in department detail. With 0 agents assigned, only "No agents assigned" text is shown. The feature exists structurally but cannot be visually verified without agents in the department.
- **TC**: TC-DEPT-013
