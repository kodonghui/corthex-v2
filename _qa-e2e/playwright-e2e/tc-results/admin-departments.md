# /admin/departments -- TC Results

**Date**: 2026-03-26
**Tester**: Playwright MCP (automated)
**URL**: https://corthex-hq.com/admin/departments

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-DEPT-001 | PASS | Clicked "Create Department" -> form appeared with "부서명 *" (text, required) and "설명" (text, optional), plus Cancel/Create buttons |
| TC-DEPT-002 | PASS | Filled name "QA-개발팀" + description "TC test" -> POST /api/admin/departments returned 201 -> toast "부서가 생성되었습니다" -> row appeared with status "Operational" |
| TC-DEPT-003 | PASS | Left name empty and clicked Create -> form stayed open, focus moved to name field, no POST request sent (client-side validation blocked submission) |
| TC-DEPT-004 | PASS | Created duplicate "QA-개발팀" -> POST returned 409 -> error toast "같은 이름의 부서가 이미 있습니다" -> form stayed open, no new row created |
| TC-DEPT-005 | PASS | Typed "QA" in filter input -> table filtered from 12 to 7 matching departments (real-time filtering works) |
| TC-DEPT-006 | FAIL | Clicked on "QA-개발팀" row -> nothing happened. No detail panel, no navigation, no agent list. Row click has no handler. Screenshot: TC-DEPT-006-FAIL.png |
| TC-DEPT-007 | PASS | Clicked edit (pencil icon) on "QA-개발팀" -> inline edit mode with name/description fields -> changed description to "TC test EDITED" -> Save -> PATCH returned 200 -> toast "부서가 수정되었습니다" -> description updated in table |
| TC-DEPT-008 | PASS | Clicked delete (trash icon) on "QA-개발팀" -> cascade analysis dialog appeared showing: 소속 에이전트 0명, 진행 중 작업 0건, 학습 기록 0건, 누적 비용 $0.00. Two delete modes: "완료 대기 (권장)" (default) and "강제 종료". Buttons: "취소" and "삭제 실행" |
| TC-DEPT-009 | PASS | Selected "강제 종료" radio -> clicked "삭제 실행" -> DELETE /api/admin/departments/{id}?mode=force returned 200 -> toast "부서가 삭제되었습니다" -> status changed Operational->Inactive (soft delete) |
| TC-DEPT-010 | PASS | Created "QA-대기팀" (POST 201) -> clicked delete -> "완료 대기" was default selected -> clicked "삭제 실행" -> DELETE ?mode=wait_completion returned 200 -> toast "부서가 삭제되었습니다" -> status changed to Inactive |
| TC-DEPT-011 | PASS | Created "QA-취소팀" -> clicked delete -> cascade modal appeared -> clicked "취소" -> modal closed -> department still exists with "Operational" status, no DELETE request sent |
| TC-DEPT-012 | FAIL | "Total Sectors" stat in header shows "14.00" (decimal with 2 decimal places) instead of integer "14". This is a display formatting bug. The value should use Math.round() or parseInt(). Screenshot: TC-DEPT-012-FAIL-fullpage.png |
| TC-DEPT-013 | FAIL | Clicked on "App E2E Dept" row (and previously on "QA-개발팀") -> no detail panel opened. No departments have agents assigned (all show 0), and row click does not trigger any action. There is no department detail view with agent list implemented. |

## Summary
- Total: 13
- PASS: 10
- FAIL: 3
- SKIP: 0

## Bugs Found

### BUG-1: "Total Sectors" displays decimal instead of integer (TC-DEPT-012)
- **Severity**: Low (cosmetic)
- **Location**: Header stat badge next to "DEPARTMENTS" title
- **Expected**: Integer display (e.g., "14")
- **Actual**: Decimal display (e.g., "14.00")
- **Likely cause**: The count value is being formatted with `.toFixed(2)` or similar, or the API returns a float/decimal and the frontend does not round it
- **Screenshot**: `TC-DEPT-012-FAIL-fullpage.png`

### BUG-2: Row click does not open department detail panel (TC-DEPT-006, TC-DEPT-013)
- **Severity**: Medium (missing feature)
- **Location**: Department table rows
- **Expected**: Clicking a department row should open a detail panel showing agent list, stats, and other department information
- **Actual**: Nothing happens on row click. No detail view, no navigation, no panel.
- **Note**: The edit and delete buttons in the Actions column work correctly. Only the row-level click interaction is missing.
- **Screenshot**: `TC-DEPT-006-FAIL.png`

### BUG-3 (Observation): No departments have agents assigned
- **Severity**: Info
- **Note**: All 14 departments show "0" in the Agent Count column, yet the bottom stat card shows "Total Agents: 7". This means 7 agents exist but none are assigned to departments. TC-DEPT-013 could not fully verify the agent list display because no department had agents.

## Network Verification
- POST /api/admin/departments -> 201 (create)
- POST /api/admin/departments (duplicate) -> 409 (conflict)
- PATCH /api/admin/departments/{id} -> 200 (edit)
- GET /api/admin/departments/{id}/cascade-analysis -> 200 (pre-delete analysis)
- DELETE /api/admin/departments/{id}?mode=force -> 200 (force delete)
- DELETE /api/admin/departments/{id}?mode=wait_completion -> 200 (wait completion delete)

## Cleanup
All QA-* test departments (QA-개발팀, QA-대기팀, QA-취소팀) were soft-deleted (status set to Inactive) via the cascade delete flow.
