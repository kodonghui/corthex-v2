# QA Cycle 36 — Batch 2: Employees & Departments
**Run Date**: 2026-03-27
**Prefix**: QA-V1-
**Pages**: `/admin/employees` (TC-EMP-001~016), `/admin/departments` (TC-DEPT-001~013)
**Session**: Playwright MCP (headless Chromium)

---

## Setup Notes
- Login: admin/admin1234 → redirected to onboarding (fresh DB)
- Onboarding completed (skip-through steps 2-4, company "CORTHEX HQ" pre-populated)
- Post-onboarding: 4 departments seeded, 5 agents, 2 employees pre-existing

---

## /admin/employees — TC-EMP

| TC-ID | Action | Result | Status |
|-------|--------|--------|--------|
| TC-EMP-001 | Click "Add Employee" | Form opens: 아이디 (min 2), 이름 (min 1), 이메일 (valid email), 부서 배정 (multi-select checkboxes). **No role field visible in form.** | PASS |
| TC-EMP-002 | Fill qa-emp-01 / QA Test Employee / qa-emp-01@test.com / 개발팀 → submit | POST /admin/employees → toast "직원이 초대되었습니다" → employee row appears + initial password modal shown | PASS |
| TC-EMP-003 | Empty username → submit | Browser HTML5 `required` validation focuses username field; no POST sent | PASS |
| TC-EMP-004 | Duplicate username (qa-emp-01) → submit | API 409 → error toast "이미 존재하는 아이디입니다" | PASS |
| TC-EMP-005 | Invalid email (notanemail) → submit | Browser HTML5 `type="email"` validation focuses email field; no POST sent. **No Zod error message displayed** (only browser-native) | PASS |
| TC-EMP-006 | Search "QA Test" | Table filtered to 1 result (QA Test Employee); count updates to "1명의 직원" | PASS |
| TC-EMP-007 | Filter by department "개발팀" | Shows only employees in 개발팀 (1 result) | PASS |
| TC-EMP-008 | Filter by status "Inactive" | Shows only inactive employees (1 result: E2E Inactive User) | PASS |
| TC-EMP-009 | Click Edit on employee | Edit form opens pre-filled: name, email editable; username disabled (read-only); departments checkboxes show current assignment | PASS |
| TC-EMP-010 | Update name → "QA Employee Updated", email → qa-updated@test.com → save | PATCH request → toast "직원 정보가 수정되었습니다" → row updates with new name and email | PASS |
| TC-EMP-011 | Click deactivate icon (lock) on active employee | Confirmation dialog "비활성화" appears; on confirm → employee status changes to Inactive → toast "직원이 비활성화되었습니다" | PASS |
| TC-EMP-012 | Click 비밀번호 초기화 | Confirmation dialog first ("새 임시 비밀번호가 생성됩니다"); on 초기화 → POST /reset-password → new password shown in modal → toast "비밀번호가 초기화되었습니다" | PASS |
| TC-EMP-013 | Click 복사 in password modal | Toast "비밀번호가 복사되었습니다" shown; button stays active | PASS |
| TC-EMP-014 | Pagination controls | Shows "Showing 1 to N of N entries"; prev/next buttons present and disabled at boundaries | PASS |
| TC-EMP-015 | Sort by column header (Name) | **Column headers have `cursor: auto`, no onclick handlers — sorting does not change order** | FAIL |
| TC-EMP-016 | First employee (CEO from onboarding) gets role 'admin' | API check: `@ceo` (대표님, created during onboarding) has `role: "user"` — expected `role: "admin"` | FAIL |

### TC-EMP Notes
- **TC-EMP-015 BUG**: Column header sorting not implemented. `<th>` elements have no click handlers and `cursor: auto`. Table order does not change on click.
- **TC-EMP-016 REGRESSION**: The onboarding-created first employee (대표님, @ceo) has `role: "user"` instead of `role: "admin"`. The TC spec states this should be an admin role as a BUG-FIX. The fix appears to have regressed.
- **Observation**: The "role" field is absent from the add/edit employee form UI — admin cannot set employee role from UI at all.

---

## /admin/departments — TC-DEPT

| TC-ID | Action | Result | Status |
|-------|--------|--------|--------|
| TC-DEPT-001 | Click "Create Department" | Form opens: 부서명 (required text), 설명 (optional text) | PASS |
| TC-DEPT-002 | Fill "QA-Test-Department" + description → create | POST /admin/departments → toast "부서가 생성되었습니다" → row appears in table with ID | PASS |
| TC-DEPT-003 | Empty name → submit | Browser HTML5 `required` validation focuses name field; no POST sent | PASS |
| TC-DEPT-004 | Duplicate name "개발팀" → submit | API error toast "같은 이름의 부서가 이미 있습니다" | PASS |
| TC-DEPT-005 | Search "QA" | Filter to 1 result (QA-Test-Department); "Showing 1 of 5" | PASS |
| TC-DEPT-006 | Click department row | Detail side panel opens: description, status, Assigned Agents (count + names), Created date | PASS |
| TC-DEPT-007 | Click Edit → update name → Save | Inline edit form pre-filled; PATCH on save → row updates → toast "부서가 수정되었습니다"; Cancel reverts changes | PASS |
| TC-DEPT-008 | Click Delete | cascade-analysis API called → modal shows: 소속 에이전트 count, 진행 중 작업 count, 학습 기록 count, 누적 비용 | PASS |
| TC-DEPT-009 | Cascade modal: select "강제 종료" → 삭제 실행 | DELETE with force mode → row status changes to "Inactive" + toast "부서가 삭제되었습니다". **Soft-delete only (row remains as Inactive, not removed from table)** | PASS |
| TC-DEPT-010 | Cascade modal: select "완료 대기" (default) → 삭제 실행 | DELETE with wait_completion mode → row status changes to "Inactive" + toast "부서가 삭제되었습니다" | PASS |
| TC-DEPT-011 | Cascade modal: click 취소 | Modal closes; department remains unchanged (Operational) | PASS |
| TC-DEPT-012 | Stats: Total Sectors | Header shows integer "5" (no decimal/float); bottom stats: Total Departments / Active Depts / Total Agents / System Alerts all integers | PASS |
| TC-DEPT-013 | Agent list in detail panel | Shows agents with name and role; detail panel shows "Assigned Agents (1)" with agent name and role text | PASS |

### TC-DEPT Notes
- **TC-DEPT-009/010 Observation**: Delete operation is soft-delete only. Both force and wait_completion modes set status to "Inactive" — the row stays in the table. This is expected behavior per the design (safe deletion with status tracking).
- **TC-DEPT-007 Cancel**: Properly reverts to previously saved name, not draft text.
- **TC-DEPT-013 Agent dots**: Agent status dots not visible in the snapshot accessibility tree — only name and role text confirmed. Visual dots not verified via snapshot.

---

## Summary

| Page | Total | PASS | FAIL | Notes |
|------|-------|------|------|-------|
| /admin/employees | 16 | 14 | 2 | TC-EMP-015 (sort not implemented), TC-EMP-016 (CEO role regression) |
| /admin/departments | 13 | 13 | 0 | All pass |
| **TOTAL** | **29** | **27** | **2** | |

---

## Bugs Found

### BUG-EMP-015: Column sorting not implemented on Employees table
- **Severity**: Low
- **Steps**: Navigate to /admin/employees → click any column header (Name, Username, Department, Status)
- **Expected**: Table rows reorder ASC/DESC
- **Actual**: No change; `<th>` elements have `cursor: auto` and no click handlers

### BUG-EMP-016: Onboarding CEO employee created with role "user" instead of "admin"
- **Severity**: High (regression from previously verified fix)
- **Steps**: Complete onboarding creating first employee → check `/api/admin/employees` response
- **Expected**: First employee (CEO) has `role: "admin"`
- **Actual**: Employee has `role: "user"` — cannot access admin-level features
- **API Verification**: `GET /api/admin/employees` → `{username: "ceo", role: "user", ...}`

---

*Screenshots: `_qa-e2e/playwright-e2e/cycle-36/screenshots/`*
*emp-01-loaded.png, emp-02-create-success.png, dept-01-loaded.png, dept-final.png*
