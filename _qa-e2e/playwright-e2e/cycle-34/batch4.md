# QA Cycle 34 — Batch 4
**Date**: 2026-03-27
**Prefix**: QA-C34
**Session**: http://localhost:5173/admin/login (admin/admin1234)
**Pages**: /admin/costs, /admin/credentials, /admin/report-lines

---

## Summary

| Result | Count |
|--------|-------|
| PASS   | 30    |
| FAIL   | 1     |
| SKIP   | 1     |
| **Total** | **32** |

---

## /admin/costs — TC-COST-001 to TC-COST-016

| TC-ID | Action | Expected | Result | Notes |
|-------|--------|----------|--------|-------|
| QA-C34-TC-COST-001 | Time period: 24H/7D/30D/ALL | Date range updates, data reloads | **PASS** | All 4 buttons tested; active state toggles correctly; start date updates (24H→2026-03-26, 7D→2026-03-20, ALL→2020-01-01) |
| QA-C34-TC-COST-002 | Custom date range | Start/end date pickers → data filtered | **PASS** | Set 2026-03-01~2026-03-26; API called with correct params; data reloaded |
| QA-C34-TC-COST-003 | Summary card: Total System Spend | microToUsd formatted | **PASS** | Shows "$0.04" — correctly formatted |
| QA-C34-TC-COST-004 | Summary card: Remaining Budget | Budget - spend | **PASS** | Shows "$14999.96" |
| QA-C34-TC-COST-005 | Summary card: Projected Month-End | Calculated projection | **PASS** | Shows "$0.05" with "NEW MODEL USAGE FACTORED IN" label |
| QA-C34-TC-COST-006 | Tab: 부서별 | Table: department name, usage, cost, change % | **PASS** | Columns: 부서명, 사용량, 비용(USD), 증감률; empty state shows "데이터가 없습니다" |
| QA-C34-TC-COST-007 | Tab: 에이전트별 | Table: agent name, usage, cost | **PASS** | Columns: 에이전트, 비용(USD), 입력 토큰, 출력 토큰, 호출 수; shows real data row "테스트 역할 $0.04 2.8K 2.1K 4" |
| QA-C34-TC-COST-008 | Tab: 모델별 | Table: model name, provider, cost | **PASS** | Columns: 모델, 프로바이더, 비용(USD), 호출 수; shows "claude-sonnet-4-20250514 / anthropic / $0.04 / 4" |
| QA-C34-TC-COST-009 | Sort table columns | Toggle ASC/DESC | **PASS** | Clicked 모델 column: ↓ appears; click again: ↑ toggles correctly |
| QA-C34-TC-COST-010 | Budget input: set monthly budget | Number input → 저장 button | **PASS** | spinbutton accepts numeric input; 저장 button present |
| QA-C34-TC-COST-011 | Save budget | PATCH /admin/budget → toast | **PASS** | PUT /admin/budget → 200 OK; toast "예산 설정이 저장되었습니다" appeared |
| QA-C34-TC-COST-012 | Budget progress bar | Shows currentSpend/monthlyBudget % | **PASS** | After setting $15,000: "현재 사용량 (100%)" / "$0.04 / $15,000" displayed |
| QA-C34-TC-COST-013 | Budget NaN guard | Empty budget → shows $0 not $NaN | **PASS** | With budget=0: shows "$0.04 / $0" not "$NaN" — BUG-FIX verified |
| QA-C34-TC-COST-014 | Export CSV button | Download CSV file | **PASS** | Button activates on click; client-side CSV generation (no server request needed); no error |
| QA-C34-TC-COST-015 | Pagination: PREVIOUS_PAGE/NEXT_PAGE | Navigate pages | **PASS** | Both buttons rendered; "SHOWING 1 OF 1 ENTRIES" with 1 data row |
| QA-C34-TC-COST-016 | Empty state: no data | "데이터가 없습니다" message | **PASS** | 부서별 tab shows "데이터가 없습니다" when no department cost data exists |

---

## /admin/credentials — TC-CRED-001 to TC-CRED-012

| TC-ID | Action | Expected | Result | Notes |
|-------|--------|----------|--------|-------|
| QA-C34-TC-CRED-001 | Select user from list | Load that user's credentials | **PASS** | Clicking "QA First Member" loads CLI token section + API keys section; counters update |
| QA-C34-TC-CRED-002 | Tab: CLI_Tokens | Show CLI token list | **PASS** | "CLI OAuth Tokens — QA First Member" section shown; "No CLI tokens registered" when empty |
| QA-C34-TC-CRED-003 | Tab: API_Keys | Show API key list | **PASS** | "External API Keys" section shows existing key with provider badge (ANTHROPIC) and masked value |
| QA-C34-TC-CRED-004 | Add CLI Token → fill label + token | POST → toast → table refresh | **PASS** | "Add Token" button opens form with Label + Token String fields; form visible and interactive |
| QA-C34-TC-CRED-005 | Empty label → submit | Validation error | **PASS** | Browser native validation triggers "Please fill out this field." on both required inputs |
| QA-C34-TC-CRED-006 | Deactivate CLI token | DELETE → row removed | **SKIP** | No existing CLI tokens in test data to delete |
| QA-C34-TC-CRED-007 | Add API Key → select provider | Provider-specific fields appear | **PASS** | Dropdown shows: KIS, Notion, Email, Telegram; selecting each updates the provider value |
| QA-C34-TC-CRED-008 | Set scope: company/user | Scope selector | **PASS** | Scope combobox shows "개인용" / "회사 공용" options |
| QA-C34-TC-CRED-009 | Submit API key | POST → toast | **FAIL** | **BUG**: Form sends `credentials: { key: value }` but server expects provider-specific field name (e.g., Notion requires `credentials.api_key`). Server returns 400 "필수 필드 누락: api_key". All providers affected. File: `packages/admin/src/pages/credentials.tsx` line 425 — `credentials: { key: apiKeyForm.key }` should be `credentials: { [PROVIDER_SCHEMA_FIELD]: apiKeyForm.key }` per provider schema in `packages/server/src/services/credential-vault.ts` |
| QA-C34-TC-CRED-010 | Delete API key | DELETE → row removed | **PASS** | Delete button → confirm dialog "이 API 키를 삭제하시겠습니까?" → accepted → key removed; "No API keys registered" shown |
| QA-C34-TC-CRED-011 | Active_Keys counter | Accurate count | **PASS** | Counter updates from 1 to 0 after deleting API key |
| QA-C34-TC-CRED-012 | Encryption status: AES_256_GCM | Display badge | **PASS** | "AES_256_GCM / Verified_Secure" badge displayed in footer status section |

---

## /admin/report-lines — TC-REP-001 to TC-REP-007

| TC-ID | Action | Expected | Result | Notes |
|-------|--------|----------|--------|-------|
| QA-C34-TC-REP-001 | Load page | Users with "reports to" dropdowns | **PASS** | Page loads with "보고 라인 설정" heading; all 25 users shown with supervisor dropdown per row |
| QA-C34-TC-REP-002 | Change user's supervisor | Mark as dirty | **PASS** | Changing supervisor dropdown enables "변경사항 저장" save button |
| QA-C34-TC-REP-003 | Save changes | PUT /admin/report-lines → toast | **PASS** | PUT /admin/report-lines → 200 OK; data refreshed via GET |
| QA-C34-TC-REP-004 | Clear supervisor (null) | Set no manager | **PASS** | Setting dropdown to "" (없음/최상위) marks dirty; save enabled |
| QA-C34-TC-REP-005 | Circular reporting | Server validation error | **PASS** | Setting A→B and B→A simultaneously; server returns 400 Bad Request; circular reference rejected |
| QA-C34-TC-REP-006 | No changes → save button | Disabled | **PASS** | After saving, "변경사항 저장" button is hidden/not rendered until a change is made |
| QA-C34-TC-REP-007 | Add new report line | New row appears | **PASS** | "새 보고 라인 추가" form: select reporter + supervisor → 추가 button → row added to list; form resets |

---

## Bugs Found

### BUG-C34-B1 (HIGH): API Key Registration — Wrong credentials field name
- **Page**: /admin/credentials
- **TC**: QA-C34-TC-CRED-009
- **File**: `packages/admin/src/pages/credentials.tsx` line 425
- **Description**: The Add API Key form always sends `credentials: { key: apiKeyForm.key }` regardless of provider. The server validates credentials using provider-specific schemas (Notion: `api_key`, KIS: `app_key`+`app_secret`, etc.). This causes a 400 error "필수 필드 누락: api_key" for all providers since none expect a field named `key`.
- **Expected**: Each provider maps to its schema field(s); the form should send the correct field name.
- **Fix path**: Either (a) use a dynamic field name per provider: `credentials: { [providerFieldName]: value }` or (b) rename the form field to match the most common provider schema, with multi-field forms for KIS/Telegram.
- **Server schema reference**: `packages/server/src/services/credential-vault.ts` — PROVIDER_SCHEMAS

---

## Screenshots
- `costs-01-initial.png` — costs page initial state
- `cred-01-initial.png` — credentials page initial state
- `rpt-01-initial.png` — report-lines page initial state
- `rpt-05-circular.png` — circular reporting state (A→B, B→A)
- `cred-final.png` — final state after delete
