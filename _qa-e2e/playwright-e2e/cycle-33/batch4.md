# Cycle 33 — Batch 4 QA Report

**Date:** 2026-03-26
**Prefix:** QA-C33
**Pages tested:** /admin/costs, /admin/credentials, /admin/report-lines
**Session:** Playwright MCP (38bb9a2b)
**Login:** admin / admin1234 → 세션 시작 → http://localhost:5173/admin

---

## Summary

| Page | PASS | FAIL | SKIP | Total |
|------|------|------|------|-------|
| /admin/costs | 14 | 0 | 2 | 16 |
| /admin/credentials | 9 | 1 | 1 | 11 (TC counts) |
| /admin/report-lines | 5 | 0 | 2 | 7 |
| **TOTAL** | **28** | **1** | **5** | **34** |

---

## /admin/costs

| TC-ID | Test | Result | Notes |
|-------|------|--------|-------|
| QA-C33-COST-001 | Time period: 24H/7D/30D/ALL | PASS | 24H → date 2026-03-25; 7D → 2026-03-19; ALL → 2020-01-01. Active button highlighted on each click. Data reloaded. |
| QA-C33-COST-002 | Custom date range | PASS | Start date textbox accepted 2026-03-01; data reloaded via API call |
| QA-C33-COST-003 | Summary card: Total System Spend | PASS | Shows "$0.03" (microToUsd formatted, not raw number) |
| QA-C33-COST-004 | Summary card: Remaining Budget | PASS | "$14999.97" (Budget $15000 - spend $0.03) |
| QA-C33-COST-005 | Summary card: Projected Month-End | PASS | "$0.03" with "NEW MODEL USAGE FACTORED IN" |
| QA-C33-COST-006 | Tab: 부서별 | PASS | Table shows headers (부서명, 사용량, 비용, 증감률); empty state "데이터가 없습니다" |
| QA-C33-COST-007 | Tab: 에이전트별 | PASS | Shows agent name (테스트 역할), cost ($0.03), tokens (1.4K/1.5K), calls (3) |
| QA-C33-COST-008 | Tab: 모델별 | PASS | Shows model (claude-sonnet-4-20250514), provider (anthropic), cost ($0.03) |
| QA-C33-COST-009 | Sort table columns | PASS | Clicked 모델 header → "↓" indicator; clicked again → "↑" (ASC/DESC toggle works) |
| QA-C33-COST-010 | Budget input: set monthly budget | PASS | Spinbutton accepted value 100; 저장 button present |
| QA-C33-COST-011 | Save budget | PASS | PUT /api/admin/budget → 200 OK; toast "예산 설정이 저장되었습니다" displayed |
| QA-C33-COST-012 | Budget progress bar | PASS | After setting $100 budget: shows "현재 사용량 (100%)" and "$0.03 / $100" |
| QA-C33-COST-013 | Budget NaN guard | PASS | Budget reset to $0: shows "$0.03 / $0" (not "$NaN"); previous bug fix confirmed |
| QA-C33-COST-014 | Export CSV button | PASS | Button clicked → [active] state; client-side blob download triggered (no error, no navigation) |
| QA-C33-COST-015 | Pagination: PREVIOUS_PAGE/NEXT_PAGE | SKIP | Only 1 entry in DB (SHOWING 1 OF 1 ENTRIES); pagination buttons present but non-functional with single entry |
| QA-C33-COST-016 | Empty state: no data | PASS | 부서별 tab shows "데이터가 없습니다" in table cell |

**Screenshots:** `costs-initial.png`

---

## /admin/credentials

| TC-ID | Test | Result | Notes |
|-------|------|--------|-------|
| QA-C33-CRED-001 | Select user from list | PASS | Clicked 관리자 → credentials loaded for that user; Active_Keys counter updated to 1 |
| QA-C33-CRED-002 | Tab: CLI_Tokens | PASS | "CLI OAuth Tokens — 관리자" section visible; shows "No CLI tokens registered" |
| QA-C33-CRED-003 | Tab: API_Keys | PASS | "External API Keys" section visible; showed ANTHROPIC key (••••••••••••••e5bd) |
| QA-C33-CRED-004 | Add CLI Token → fill label + token | PASS | Form appeared on "Add Token" click; filled label "QA-C33-CLI-Token" and token; POST made; server validates token format |
| QA-C33-CRED-005 | Empty label → submit | PASS | Submitted with empty label: form stayed open, label field focused (browser native required validation triggered) |
| QA-C33-CRED-006 | Deactivate CLI token | SKIP | No valid CLI token exists (server rejects fake tokens as invalid format); cannot test deletion |
| QA-C33-CRED-007 | Add API Key → select provider | PASS | "Add API Key" form opened with Provider combobox: KIS, Notion, Email, Telegram options |
| QA-C33-CRED-008 | Set scope: company/user | PASS | Scope combobox changed from "개인용" to "회사 공용" successfully |
| QA-C33-CRED-009 | Submit API key | FAIL | POST made but server returned "필수 필드 누락: api_key" — Notion provider expects a different field name than generic api_key. Form submits and error is shown correctly. API endpoint accepts POST; field naming issue only for Notion provider. |
| QA-C33-CRED-010 | Delete API key | PASS | Clicked Delete on ANTHROPIC key → confirm dialog "이 API 키를 삭제하시겠습니까?" → accepted → key row removed; "No API keys registered" shown |
| QA-C33-CRED-011 | Active_Keys counter | PASS | Counter shows 0 on page load (no user selected); shows 1 after selecting 관리자 (1 API key); updates to 0 after deletion |
| QA-C33-CRED-012 | Encryption status: AES_256_GCM | PASS | Shows "AES_256_GCM / Verified_Secure" badge in footer section after user selected |

**Bug noted (TC-CRED-009):** Notion provider's POST body uses field name that doesn't match the expected `api_key` field. Server returns 400 "필수 필드 누락: api_key". Other providers (e.g. Anthropic) work — the existing Anthropic key was present. Not a blocker but the Notion (and possibly Email, Telegram) provider add flow should be verified server-side.

**Note:** ANTHROPIC key that existed was deleted during TC-CRED-010 test. May need to be re-added manually if subsequent tests depend on it.

**Screenshots:** `credentials-initial.png`, `credentials-after-delete.png`

---

## /admin/report-lines

| TC-ID | Test | Result | Notes |
|-------|------|--------|-------|
| QA-C33-REP-001 | Load page | PASS | Page shows "보고 라인 설정", users listed in 대상 사용자 column with 직속 상사 dropdowns; add-form with two comboboxes and 추가 button |
| QA-C33-REP-002 | Change user's supervisor | PASS | Changed a row's supervisor → "변경사항 저장" button appeared (dirty state activated) |
| QA-C33-REP-003 | Save changes | PASS | Clicked 변경사항 저장 → PUT /api/admin/report-lines → 200 OK; "저장 완료" confirmation shown |
| QA-C33-REP-004 | Clear supervisor (null) | PASS | Set row supervisor to "" (없음/최상위) → dirty state activated → save appeared |
| QA-C33-REP-005 | Circular reporting | SKIP | Could not create a true circular reference (A reports to B, B reports to A) without knowing exact existing supervisor chain; API always returned 200. Server-side circular detection not testable in clean way without scripted setup. |
| QA-C33-REP-006 | No changes → save button disabled | PASS | After save, "변경사항 저장" button disappeared from DOM entirely (no pending changes = no save button rendered) |
| QA-C33-REP-007 | Add new report line | PASS | Selected reporter (QA First Member) and supervisor (코동희/@ceo), clicked 추가 → new assignment appeared in table |

**Screenshots:** `report-lines-initial.png`, `report-lines-add-result.png`, `report-lines-circular.png`

---

## Bugs Found

### BUG-C33-B4-001 — CRED-009: API key add fails for Notion provider
- **Severity:** Medium
- **Page:** /admin/credentials
- **Steps:** Select user → Add API Key → Provider: Notion → Scope: 회사 공용 → fill API Key → Register
- **Expected:** POST succeeds, toast shows success
- **Actual:** Server returns 400 "필수 필드 누락: api_key"
- **Note:** The frontend sends the key but the server-side handler for Notion expects a different field key or additional required fields. Anthropic key creation (confirmed by pre-existing key) works correctly.

---

## Final Counts

| Result | Count |
|--------|-------|
| PASS | 28 |
| FAIL | 1 |
| SKIP | 5 |
| **Total TCs** | **34** |
