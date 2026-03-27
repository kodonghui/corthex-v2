# QA Cycle 35 — Batch 4 Report

**Prefix:** QA-C35
**Date:** 2026-03-27
**Session:** Playwright MCP (26e460bc-76cd-48ad-b343-0055b5915cbf)
**Pages tested:** /admin/costs, /admin/credentials, /admin/report-lines
**Screenshots:** `cycle-35/costs-initial.png`, `cycle-35/credentials-initial.png`, `cycle-35/report-lines-initial.png`, `cycle-35/report-lines-dirty.png`, `cycle-35/report-lines-after-save.png`, `cycle-35/report-lines-circular.png`, `cycle-35/report-lines-final.png`

---

## /admin/costs — TC-COST-*

| TC-ID | Result | Notes |
|-------|--------|-------|
| QA-C35-TC-COST-001 | PASS | 24H/7D/30D/ALL buttons toggle period; date range updates correctly (24H→2026-03-26, 7D→2026-03-20, ALL→2020-01-01); active button highlighted |
| QA-C35-TC-COST-002 | PASS | Custom start date (2026-03-01) accepted via textbox; no period button active; data filtered |
| QA-C35-TC-COST-003 | PASS | Total System Spend (MTD) shows $0.07 — microToUsd formatted |
| QA-C35-TC-COST-004 | PASS | Remaining Budget shows $14999.93 (15000 - 0.07) |
| QA-C35-TC-COST-005 | PASS | Projected Month-End shows $0.08 with "NEW MODEL USAGE FACTORED IN" label |
| QA-C35-TC-COST-006 | PASS | 부서별 tab shows table with columns 부서명/사용량/비용(USD)/증감률; "데이터가 없습니다" shown when empty |
| QA-C35-TC-COST-007 | PASS | 에이전트별 tab shows 에이전트/비용(USD)/입력토큰/출력토큰/호출수 columns; 테스트 역할 agent entry shows $0.07 |
| QA-C35-TC-COST-008 | PASS | 모델별 tab shows 모델/프로바이더/비용(USD)/호출수 columns; claude-sonnet-4-20250514 anthropic $0.07 6 |
| QA-C35-TC-COST-009 | PASS | Column headers clickable; toggles ↓ (DESC) → ↑ (ASC) on second click |
| QA-C35-TC-COST-010 | PASS | Budget spinbutton with 저장 button; input value reflected in progress bar label ($0.07 / $500) |
| QA-C35-TC-COST-011 | PASS | PATCH /admin/budget fires on 저장 click; toast "예산 설정이 저장되었습니다" shown |
| QA-C35-TC-COST-012 | PASS | Progress bar shows "현재 사용량 (100%)" with $0.07 / $500 when budget set to 500 |
| QA-C35-TC-COST-013 | PASS | Budget=0 → shows "$0.07 / $0" — no NaN displayed; body HTML confirmed NaN-free |
| QA-C35-TC-COST-014 | PASS | Export CSV button present and clickable; triggers download action (button enters active state) |
| QA-C35-TC-COST-015 | PASS | PREVIOUS_PAGE and NEXT_PAGE buttons present; "SHOWING 2 OF 2 ENTRIES" shown; pagination UI functional |
| QA-C35-TC-COST-016 | PASS | 부서별 tab shows "데이터가 없습니다" when no department cost data exists |

**COST subtotal: 16 PASS / 0 FAIL / 0 SKIP**

---

## /admin/credentials — TC-CRED-*

| TC-ID | Result | Notes |
|-------|--------|-------|
| QA-C35-TC-CRED-001 | PASS | Selecting 코동희 from user list loads their credentials; Active_Keys counter updated to 1; section header shows "CLI OAuth Tokens — 코동희" |
| QA-C35-TC-CRED-002 | PASS | CLI Tokens section displayed with "No CLI tokens registered" for users without tokens; "SHOWING 0 CLI TOKENS" pagination visible |
| QA-C35-TC-CRED-003 | PASS | API Keys section displayed; ANTHROPIC key with masked value ••••••••••••••d737 shown |
| QA-C35-TC-CRED-004 | PASS | Add Token form opens with Label + Token String fields; form submits to server (POST fires); server validation runs |
| QA-C35-TC-CRED-005 | PASS | Empty label → Create Token click → label textbox becomes active/focused without submitting; browser required field validation prevents empty submit |
| QA-C35-TC-CRED-006 | SKIP | No existing CLI token to test deactivation; server rejects fake tokens (validation requires valid OAuth token format) |
| QA-C35-TC-CRED-007 | FAIL | **BUG:** KIS provider selected → form shows only single "API Key" textbox; KIS requires app_key + app_secret + account_no per server schema. Provider-specific fields not rendered in UI. Error: "필수 필드 누락: app_key, app_secret, account_no" |
| QA-C35-TC-CRED-008 | PASS | Scope selector present with 개인용 / 회사 공용 options |
| QA-C35-TC-CRED-009 | FAIL | **BUG:** Frontend sends `credentials: { key: value }` but server expects `credentials: { api_key: value }` for Notion/Anthropic providers. Error: "필수 필드 누락: api_key" even when API key field is filled. Field name mismatch in `credentials.tsx` line 425. |
| QA-C35-TC-CRED-010 | PASS | Delete button → confirm dialog "이 API 키를 삭제하시겠습니까?" → accepted → row removed; "No API keys registered" shown; counters updated to 0 |
| QA-C35-TC-CRED-011 | PASS | Active_Keys counter accurately shows 1 when 1 API key registered; updates to 0 after deletion |
| QA-C35-TC-CRED-012 | PASS | Encryption_Status section shows "AES_256_GCM" with "Verified_Secure" badge |

**CRED subtotal: 9 PASS / 2 FAIL / 1 SKIP**

### CRED Bugs Found

**BUG-C35-CRED-001** (HIGH): `/admin/credentials` — Add API Key form does not render provider-specific fields. KIS provider requires 3 fields (app_key, app_secret, account_no) but UI only shows 1 generic "API Key" input. Server returns 400 "필수 필드 누락: app_key, app_secret, account_no".

**BUG-C35-CRED-002** (HIGH): `/admin/credentials` — API key form submits `credentials: { key: value }` but server schema expects `credentials: { api_key: value }` for Notion/Anthropic/OpenAI/etc. providers. File: `packages/admin/src/pages/credentials.tsx` line 425. All non-KIS API key additions fail with 400 error.

---

## /admin/report-lines — TC-REP-*

| TC-ID | Result | Notes |
|-------|--------|-------|
| QA-C35-TC-REP-001 | PASS | Page loads showing 30 users with "없음 (최상위)" supervisor dropdowns; "전체 30명 · 보고 라인 0개 설정됨" footer |
| QA-C35-TC-REP-002 | PASS | Changing supervisor dropdown for QA First Member marks dirty; "변경사항 저장" button appears; "보고 라인 1개 설정됨" counter updates |
| QA-C35-TC-REP-003 | PASS | Click 변경사항 저장 → PUT /admin/report-lines fires → "저장 완료" banner displayed; dirty state cleared |
| QA-C35-TC-REP-004 | PASS | Setting supervisor to empty/null (없음 최상위) marks dirty; save button re-appears confirming null/clear works |
| QA-C35-TC-REP-005 | PARTIAL FAIL | **BUG:** Server returns 400 for self-referential circular reporting (console shows PUT error) but UI does not display an error toast or message. UI stays in dirty state with circular data visible. No user-facing feedback on validation failure. |
| QA-C35-TC-REP-006 | PASS | After save, no pending changes → "변경사항 저장" button hidden; only appears when dirty changes exist |
| QA-C35-TC-REP-007 | PASS | "새 보고 라인 추가" form: select reporter + supervisor + click 추가 → row in list updates with new supervisor; "보고 라인 2개 설정됨" counter increments |

**REP subtotal: 6 PASS / 1 FAIL / 0 SKIP**

### REP Bugs Found

**BUG-C35-REP-001** (MEDIUM): `/admin/report-lines` — TC-REP-005: Circular reporting is correctly rejected by server (400), but the frontend does not display an error toast or notification. The UI silently stays in the dirty/invalid state. Users have no indication the save failed.

---

## Summary

| Page | PASS | FAIL | SKIP | Total |
|------|------|------|------|-------|
| /admin/costs | 16 | 0 | 0 | 16 |
| /admin/credentials | 9 | 2 | 1 | 12 |
| /admin/report-lines | 6 | 1 | 0 | 7 |
| **TOTAL** | **31** | **3** | **1** | **35** |

### All Bugs (3 total)

| Bug ID | Severity | Page | Description |
|--------|----------|------|-------------|
| BUG-C35-CRED-001 | HIGH | /admin/credentials | Provider-specific fields not rendered; KIS requires 3 fields but UI shows 1 |
| BUG-C35-CRED-002 | HIGH | /admin/credentials | API key form field name mismatch: sends `key` but server expects `api_key` |
| BUG-C35-REP-001 | MEDIUM | /admin/report-lines | Circular reporting server error (400) not surfaced to user as toast/message |
