# Cycle 32 — Batch 1 Results
Prefix: QA-C32-
Date: 2026-03-26
Pages tested: /admin/login, /admin (Dashboard), /admin/companies
Session: 03a56867-978a-4795-99c8-52f4b3e1f805 (closed)

---

## /admin/login — TC-LOGIN-*

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-LOGIN-001 | PASS | admin/admin1234 → POST /auth/admin/login → token saved → redirect to /admin. Dashboard loaded with stat cards. |
| TC-LOGIN-002 | PASS | Empty username → browser native validation focuses username field, no API request sent, page stays at /admin/login. |
| TC-LOGIN-003 | PASS | Empty password (username filled) → browser native validation focuses password field, no API request sent. |
| TC-LOGIN-004 | PASS | Wrong password → error message "잠시 후 다시 시도하세요 (28초 후 잠금 해제)" shown, countdown timer button "28초 후 재시도" [disabled] rendered. |
| TC-LOGIN-005 | PASS | Rate limit already active from TC-LOGIN-004 failures. Countdown timer shown, button disabled. Confirmed behavior. |
| TC-LOGIN-006 | PASS | Waited 15s for countdown to expire. Button returned to enabled state "세션 시작". |
| TC-LOGIN-007 | PASS | Navigate to /admin/login?redirect=/admin/agents → login → redirected to /admin/agents. Agents page fully loaded. |

**LOGIN summary: 7/7 PASS**

---

## /admin (Dashboard) — TC-DASH-*

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-DASH-001 | SKIP | Could not test without company selected state in this session (admin already has company context). Known behavior from prior cycles. |
| TC-DASH-002 | PASS | With company selected: 3 stat cards loaded — DEPARTMENTS (23), ACTIVE USERS (19), AUTONOMOUS AGENTS (14). |
| TC-DASH-003 | PASS | DEPARTMENTS: 23 registered. ACTIVE USERS: 7 active (of 19). AGENTS: 0 online (of 14). Values from API. |
| TC-DASH-004 | PASS | Health Status section: USERS_ACTIVE 37%, AGENTS_ONLINE 0%, DEPT_COUNT "23". All present. |
| TC-DASH-005 | PASS | Recent Activity table loaded: users and agents mixed, Name/Type/Role/Status columns, multiple rows visible. |
| TC-DASH-006 | FAIL | EXPORT_LOGS button clickable (gets [active] state) but no export action, no toast, no download triggered. Button is decorative/unimplemented. |
| TC-DASH-007 | FAIL | VIEW_ALL_RECORDS button clickable (gets [active] state) but no navigation occurs. Stays on /admin/. No action implemented. |
| TC-DASH-008 | PASS | Agent Efficiency Readout circle shows 0% with "0 of 14 agents currently online." Online: 0, Total: 14 stats visible. |
| TC-DASH-009 | PASS | Agent Efficiency section shows "0 of 14 agents currently online" — reflects accurate 0/14 state. |

**DASH summary: 6/9 PASS, 2 FAIL, 1 SKIP**

### Bugs found (Dashboard):
- **BUG-C32-001**: EXPORT_LOGS button on Dashboard has no action (no download, no toast, no navigation). Button appears non-functional.
- **BUG-C32-002**: VIEW_ALL_RECORDS button on Dashboard has no action. Expected to navigate to full records list but does nothing.

---

## /admin/companies — TC-COMP-*

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-COMP-001 | PASS | "Create Company" button opens inline form with: Company Name (text, required), Slug (text, required, placeholder "lowercase, numbers, hyphens only"), Cancel + Create buttons. |
| TC-COMP-002 | PASS | Filled "QA-C32 Test Corp" + "qa-c32-test-corp" → Create → company card "QA-C32 TEST CORP" appears with ACTIVE badge, toast "Company created". Total_Entities updated. |
| TC-COMP-003 | PASS | Empty name → click Create → browser native validation focuses Company Name field. No POST sent. Form stays open. |
| TC-COMP-004 | PASS | Duplicate slug "qa-c32-test-corp" → API 409 → error toast "duplicate key value violates unique constraint 'companies_slug_unique'" + inline paragraph error. NOTE: raw DB error message shown (not user-friendly). |
| TC-COMP-005 | PASS | Search "QA-C32" → filters to show only "QA-C32 TEST CORP" (Showing 1 of 12). Real-time client-side filter. |
| TC-COMP-006 | PASS | Click Edit on company card → inline edit mode opens with textbox pre-filled with current name "QA-C32 Test Corp", Save + Cancel buttons. |
| TC-COMP-007 | PASS | Changed name to "QA-C32-TESTCORP-EDITED" → Save → PATCH sent → card heading updated → toast "Company updated". |
| TC-COMP-008 | PASS | During edit mode: click Cancel → reverts to original name, exits edit mode. No change saved. |
| TC-COMP-009 | PASS | Click Delete → confirmation dialog appears: "Delete QA-C32-TESTCORP-EDITED" with warning "이 회사를 삭제하면 소속 직원의 로그인이 차단됩니다. 이 작업은 되돌릴 수 없습니다." + 취소 + Delete buttons. |
| TC-COMP-010 | PARTIAL | Confirm Delete → toast "Company deleted" shown. Card status changed to INACTIVE (soft delete). Card remains in list as INACTIVE rather than being removed from UI. Expected behavior may be soft-delete; card not removed. |
| TC-COMP-011 | PARTIAL | ACCESS_ROOT button on 코동희 본사 clicked (button gets [active] state). No visible feedback (no toast, no UI change indicating company context switched). May work silently via cookie/session. |
| TC-COMP-012 | PASS | Total_Entities stat shows "12" (total count of all companies including inactive). |
| TC-COMP-013 | PASS | Active_Throughput shows "25%" (3 active out of 12 total, after QA-C32 soft-deleted). |
| TC-COMP-014 | PARTIAL | Pagination controls present. "Showing 12 of 12 companies" on page 1. Only 1 page (12 items fit). Could not test multi-page navigation — not enough data. Prev button [disabled], next button visible but clicking it with all 12 on page 1 would be redundant. |
| TC-COMP-015 | PASS | Click "Initialize Node" empty slot → opens same INITIALIZE_NEW_NODE create form as "Create Company" button. |

**COMP summary: 11/15 PASS, 3 PARTIAL, 0 FAIL, 0 SKIP**

### Bugs found (Companies):
- **BUG-C32-003**: Duplicate slug error shows raw PostgreSQL constraint name ("duplicate key value violates unique constraint 'companies_slug_unique'") instead of a user-friendly message like "이미 사용 중인 슬러그입니다".
- **BUG-C32-004**: After DELETE company, card remains visible in list with INACTIVE status instead of being removed from view. TC-COMP-010 expected card removal.
- **BUG-C32-005**: ACCESS_ROOT button provides no visible feedback (no toast, no highlighted selected company, no UI change). User cannot confirm which company is active context.

---

## Overall Batch 1 Summary

| Page | PASS | PARTIAL | FAIL | SKIP | Total |
|------|------|---------|------|------|-------|
| /admin/login | 7 | 0 | 0 | 0 | 7 |
| /admin (Dashboard) | 6 | 0 | 2 | 1 | 9 |
| /admin/companies | 11 | 3 | 0 | 0 | 15 |
| **Total** | **24** | **3** | **2** | **1** | **31** |

**Pass rate: 24/30 executed = 80%**

---

## Bugs Summary

| Bug ID | Page | Severity | Description |
|--------|------|----------|-------------|
| BUG-C32-001 | /admin | MEDIUM | EXPORT_LOGS button non-functional (no action) |
| BUG-C32-002 | /admin | MEDIUM | VIEW_ALL_RECORDS button non-functional (no navigation) |
| BUG-C32-003 | /admin/companies | LOW | Duplicate slug error shows raw DB constraint message |
| BUG-C32-004 | /admin/companies | LOW | Deleted company card stays visible as INACTIVE instead of being removed |
| BUG-C32-005 | /admin/companies | LOW | ACCESS_ROOT button shows no visible feedback/confirmation |

---

## Artifacts
- Screenshot: `cycle-32/companies.png`
- Session ID: 03a56867-978a-4795-99c8-52f4b3e1f805 (closed)
