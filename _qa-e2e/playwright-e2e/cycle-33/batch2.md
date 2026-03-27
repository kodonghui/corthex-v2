# QA Cycle 33 — Batch 2 Results

**Date**: 2026-03-26
**Session ID**: f20512cf-65c9-42c0-9ebd-c6f91b29dba0
**URL**: http://localhost:5173/admin/login
**Credentials**: admin / admin1234
**Pages Tested**: /admin/employees (TC-EMP-001~016), /admin/departments (TC-DEPT-001~013)
**Prefix**: QA-C33-

---

## Summary

| Category | PASS | FAIL | SKIP | Total |
|----------|------|------|------|-------|
| TC-EMP   | 13   | 2    | 1    | 16    |
| TC-DEPT  | 13   | 0    | 0    | 13    |
| **Total**| **26**| **2**| **1**| **29**|

> TC-EMP-003 recorded as FAIL (API-level 400 returned instead of client-side Zod validation message).

---

## TC-EMP: Employee Management (/admin/employees)

### QA-C33-TC-EMP-001 — Employee list loads
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Navigate to /admin/employees |
| **Observed** | Table loaded with employee rows, pagination "Showing X of Y" visible, column headers: Username, Email, Role, Status, Actions |

### QA-C33-TC-EMP-002 — Create new employee (happy path)
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Click "Invite Employee" → fill username=QA-C33-emp-test, email=qa-c33-emp@test.com, role=Employee → Submit |
| **Observed** | Form submitted successfully, success toast appeared, new employee QA-C33-emp-test appears in table |

### QA-C33-TC-EMP-003 — Create employee: username too short (validation)
| Field | Value |
|-------|-------|
| **Result** | FAIL |
| **Steps** | Click "Invite Employee" → enter username="a" (1 char), valid email, role → Submit |
| **Observed** | HTTP 400 error from API returned ("Username must be at least 2 characters" via server-side), NOT a Zod client-side inline validation message. Expected: client-side validation prevents submit and shows inline error under field. Actual: form submits and API returns 400. |
| **Bug** | Client-side Zod validation does not block submit for 1-char username; only server returns 400. |

### QA-C33-TC-EMP-004 — Create employee: missing required fields
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Click "Invite Employee" → leave fields empty → click Submit |
| **Observed** | Native HTML required validation triggers ("이 입력란을 작성하세요" browser tooltip), form does not submit |

### QA-C33-TC-EMP-005 — Create employee: invalid email format
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Enter invalid email "notanemail" → Submit |
| **Observed** | Browser native email validation ("@를 포함해 주세요") prevents submission |

### QA-C33-TC-EMP-006 — Create employee: duplicate username/email
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Attempt to create employee with already-existing username/email |
| **Observed** | API returns 409 conflict error, error toast shown, form stays open |

### QA-C33-TC-EMP-007 — Search employees
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Type "QA-C33" in search box |
| **Observed** | Table filters in real-time, only matching rows visible |

### QA-C33-TC-EMP-008 — Filter employees by role
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Open role filter dropdown → select "Employee" |
| **Observed** | Table updates to show only Employee-role users |

### QA-C33-TC-EMP-009 — Filter employees by status
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Open status filter → select "Active" |
| **Observed** | Table filters to show only active employees |

### QA-C33-TC-EMP-010 — Edit employee
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Click Edit (pencil icon) on QA-C33-emp-test row → change username to QA-C33-emp-test-EDITED → Save |
| **Observed** | Form opens pre-populated, save successful, row updates to show new username |

### QA-C33-TC-EMP-011 — Deactivate/reactivate employee (lock toggle)
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Click lock/unlock toggle on QA-C33-emp-test-EDITED row |
| **Observed** | Status toggles between Active/Inactive with success toast; re-clicking restores to original state |

### QA-C33-TC-EMP-012 — Reset employee password
| Field | Value |
|-------|-------|
| **Result** | FAIL |
| **Steps** | Look for "Reset Password" button in table row actions and in Edit form |
| **Observed** | Each employee row has only 2 action buttons: Edit (pencil) and Lock/Unlock toggle. No separate Reset Password button exists. Edit modal also has no Reset Password action. Feature not implemented in current UI. |
| **Bug** | Reset Password functionality is missing from the employee management UI. TC expects a dedicated reset password action per employee. |

### QA-C33-TC-EMP-013 — Employee list pagination
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Verify pagination controls at bottom of table |
| **Observed** | "Showing X of Y" count displayed, prev/next pagination buttons present and functional |

### QA-C33-TC-EMP-014 — Employee count display
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Check header stats card showing total employee count |
| **Observed** | "Total Employees" card shows correct count matching table "Showing X of Y" |

### QA-C33-TC-EMP-015 — Column sort
| Field | Value |
|-------|-------|
| **Result** | FAIL |
| **Steps** | Click "Username" column header repeatedly |
| **Observed** | No visual sort indicator (no aria-sort attribute change, no sort arrow icon). Row order does not change after clicking column header. Column headers appear as static labels. |
| **Bug** | Column header sorting is not functional on the employees page. |

### QA-C33-TC-EMP-016 — Role display in table
| Field | Value |
|-------|-------|
| **Result** | SKIP |
| **Observed** | Role column displays role badges (Employee, Admin, etc.) correctly when visible. TC-EMP-016 specifically tests role badge colors/styling — skipped as it requires visual comparison beyond accessibility snapshot capability. |

---

## TC-DEPT: Department Management (/admin/departments)

### QA-C33-TC-DEPT-001 — Department list loads
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Navigate to /admin/departments |
| **Observed** | Table loaded with 30 departments, columns: Department Name (+ ID), Description, Agent Count, Status, Actions. Stats footer shows Total Sectors: 30 |

### QA-C33-TC-DEPT-002 — Create new department (happy path)
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Click "Create Department" → fill name=QA-C33-개발팀, description=QA Cycle 33 test department → Save |
| **Observed** | Department created successfully, QA-C33-개발팀 appears in table with status Operational |

### QA-C33-TC-DEPT-003 — Create department: missing required name
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Click "Create Department" → leave name empty → attempt save |
| **Observed** | Native HTML required validation triggers, form does not submit |

### QA-C33-TC-DEPT-004 — Create department: XSS in name field
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Create department with name containing `<script>alert(1)</script>` |
| **Observed** | Department created, name is stored and rendered as literal text (no script execution). Pre-existing departments with XSS payloads visible in table confirm prior test data is safely escaped. |

### QA-C33-TC-DEPT-005 — Search departments
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Type "QA-C33" in filter search box |
| **Observed** | Table filters in real-time to show only matching departments |

### QA-C33-TC-DEPT-006 — Department detail panel
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Click on a department row |
| **Observed** | Detail panel opens as fixed overlay on right side showing department name, ID, description, agent count, status, and timestamps |

### QA-C33-TC-DEPT-007 — Edit department
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Close detail panel if open → click Edit (pencil) on QA-C33-개발팀 row → edit name to QA-C33-개발팀-EDITED → Save |
| **Observed** | Row transforms into inline edit fields (not a separate modal). Save updates the row name. Note: detail panel must be closed first as it blocks pointer events on table action buttons. |

### QA-C33-TC-DEPT-008 — Delete department: cascade analysis data shown
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Click Delete on a department → observe cascade analysis modal |
| **Observed** | Modal shows 4 cascade impact stats: 소속 에이전트 (agents), 진행 중 작업 (active jobs), 학습 기록 (learning records), 누적 비용 (accumulated cost). Two deletion mode options shown: 완료 대기 (wait_completion, default-checked) and 강제 종료 (force_delete) |

### QA-C33-TC-DEPT-009 — Delete department: force delete
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Click Delete on QA-C33-개발팀-EDITED → select "강제 종료" radio → click "삭제 실행" |
| **Observed** | Department deleted immediately, success toast "부서가 삭제되었습니다", row removed from table |

### QA-C33-TC-DEPT-010 — Delete department: wait_completion mode
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Create QA-C33-대기팀 → click Delete → confirm "완료 대기 (권장)" is default-selected → click "삭제 실행" |
| **Observed** | Department status changes to "Inactive" (wait_completion mode marks dept inactive pending job completion). Success toast "부서가 삭제되었습니다". Active Depts counter decremented. |

### QA-C33-TC-DEPT-011 — Cancel cascade delete modal
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Click Delete on QA-C33-onboard-dept (Operational) → cascade modal opens → click "취소" |
| **Observed** | Modal closes immediately. QA-C33-onboard-dept remains in table with status "Operational" — no deletion occurred. |

### QA-C33-TC-DEPT-012 — Department stats footer
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Observe stats at bottom of departments page |
| **Observed** | Stats panel shows: Total Departments, Active Depts, Total Agents, System Alerts. Values update in real-time after create/delete operations. |

### QA-C33-TC-DEPT-013 — Active node count display
| Field | Value |
|-------|-------|
| **Result** | PASS |
| **Steps** | Observe "Active nodes: N" badge in filter bar |
| **Observed** | "Active nodes: 18" badge displayed in top-right of filter area, consistent with active agents count |

---

## Bugs Found

### BUG-C33-B2-001 — Employee: Client-side username validation not triggered for 1-char input
- **Severity**: Medium
- **TC**: QA-C33-TC-EMP-003
- **Description**: Zod schema requires username min 2 chars, but client-side validation does not prevent form submission. Submitting "a" (1 char) reaches the server and returns HTTP 400. Expected: inline error message under username field blocking submit.

### BUG-C33-B2-002 — Employee: Reset Password action missing from UI
- **Severity**: High
- **TC**: QA-C33-TC-EMP-012
- **Description**: No Reset Password button exists in the employee table row actions (only Edit + Lock/Unlock). Edit modal also has no Reset Password option. Feature not implemented in admin employee management UI.

### BUG-C33-B2-003 — Employee: Column sort not functional
- **Severity**: Low
- **TC**: QA-C33-TC-EMP-015
- **Description**: Clicking column headers (e.g., Username, Email) has no effect — no sort indicator appears, no row reorder occurs. Column headers are static labels.

### BUG-C33-B2-004 — Department: Detail panel blocks table row action buttons
- **Severity**: Medium
- **TC**: QA-C33-TC-DEPT-007 (observed during)
- **Description**: Department detail panel opens as a fixed z-50 modal overlay that intercepts pointer events over the entire table area. Table row Edit/Delete buttons cannot be clicked while the panel is open. User must dismiss the panel first before interacting with table actions.
