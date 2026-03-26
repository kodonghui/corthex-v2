# Batch 4: Costs + Credentials + Report Lines — Cycle 29
Date: 2026-03-26

## Summary
- Total: 35 | PASS: 25 | FAIL: 4 | SKIP: 6

## /admin/costs
| TC-ID | Result | Details |
|-------|--------|---------|
| TC-COST-001 | PASS | 24H/7D/30D/ALL buttons all work; date range updates on each click (24H=Mar25, 7D=Mar19, 30D=Feb24, ALL=2020-01-01) |
| TC-COST-002 | PASS | Custom date pickers accept manual date entry; set to 2026-03-01 ~ 2026-03-15 successfully |
| TC-COST-003 | PASS | "Total System Spend (MTD)" card shows "$0.00" — properly formatted with microToUsd |
| TC-COST-004 | PASS | "Remaining Budget" card shows "$15000.00" with VS LAST WEEK indicator |
| TC-COST-005 | PASS | "Projected Month-End" card shows "$0.00" with "NEW MODEL USAGE / FACTORED IN" |
| TC-COST-006 | PASS | 부서별 tab: table columns — 부서명, 사용량, 비용 (USD), 증감률 |
| TC-COST-007 | PASS | 에이전트별 tab: table columns — 에이전트, 비용 (USD), 입력 토큰, 출력 토큰, 호출 수 |
| TC-COST-008 | PASS | 모델별 tab: table columns — 모델, 프로바이더, 비용 (USD), 호출 수 |
| TC-COST-009 | PASS | Column sort toggles between ↓ (DESC) and ↑ (ASC) on click |
| TC-COST-010 | PASS | Budget spinbutton accepts numeric input (filled "5000") |
| TC-COST-011 | PASS | Save budget → PATCH succeeds → toast "예산 설정이 저장되었습니다" → progress bar updates |
| TC-COST-012 | PASS | Progress bar shows "현재 사용량 (0%)" and "$0.00 / $5,000" after saving budget 5000 |
| TC-COST-013 | PASS | Empty budget → shows "$0.00 / $0" — no NaN. BUG-FIX verified |
| TC-COST-014 | PASS | Export CSV button clickable without error (no data to export) |
| TC-COST-015 | PASS | PREVIOUS_PAGE and NEXT_PAGE buttons present and clickable; shows "SHOWING 0 OF 0 ENTRIES" |
| TC-COST-016 | PASS | Empty state: "데이터가 없습니다" shown in both usage table and Top Consumption Records |

## /admin/credentials
| TC-ID | Result | Details |
|-------|--------|---------|
| TC-CRED-001 | PASS | Selected 코동희 user → CLI OAuth Tokens and External API Keys sections loaded |
| TC-CRED-002 | PASS | CLI_Tokens section visible with "CLI OAuth Tokens — 코동희" heading, Add Token button, pagination |
| TC-CRED-003 | PASS | API_Keys section visible with "External API Keys" heading, Add API Key button |
| TC-CRED-004 | PASS | Add CLI Token form opens with Label + Token String fields; POST submits with server-side token validation ("CLI 토큰이 유효하지 않습니다") |
| TC-CRED-005 | FAIL | Empty label → submit: no client-side "label required" validation. Server returns token validation error instead of label-specific error |
| TC-CRED-006 | SKIP | No existing CLI tokens to deactivate (requires real OAuth token to create one first) |
| TC-CRED-007 | PASS | Provider dropdown shows KIS/Notion/Email/Telegram; provider-specific fields validated on submit (KIS needs app_key/app_secret/account_no, Telegram needs bot_token/chat_id) |
| TC-CRED-008 | PASS | Scope dropdown toggles between "개인용" (user) and "회사 공용" (company) |
| TC-CRED-009 | PASS | Register button submits API key form; server validates provider-specific required fields |
| TC-CRED-010 | SKIP | No existing API keys to delete (requires valid credentials to create one first) |
| TC-CRED-011 | PASS | Active_Keys: 0, CLI_Tokens: 0, API_Keys: 0 — counters display correctly |
| TC-CRED-012 | PASS | Encryption_Status: "AES_256_GCM" badge with "Verified_Secure" status shown |

## /admin/report-lines
| TC-ID | Result | Details |
|-------|--------|---------|
| TC-REP-001 | PASS | Page loads 12 users with supervisor comboboxes; each excludes self from options; shows "전체 12명 · 보고 라인 0개 설정됨" |
| TC-REP-002 | PASS | Changed QA-C29-employees supervisor to 코동희 via table dropdown → row updated to show "코동희 @ceo", count updated to "보고 라인 1개 설정됨", "변경사항 저장" button appeared |
| TC-REP-003 | FAIL | Save changes → PUT /admin/report-lines returns HTTP 400. Root cause: frontend sends all users including null reportsToUserId for users with no supervisor, but Zod schema requires `reportsToUserId: z.string().uuid()` (no null allowed) |
| TC-REP-004 | FAIL | Clear supervisor (null) blocked by same bug as TC-REP-003 — server schema rejects null reportsToUserId values |
| TC-REP-005 | SKIP | Circular reporting validation — blocked by save bug (TC-REP-003). Server code has cycle detection logic but can't test end-to-end |
| TC-REP-006 | PASS | On fresh load with no changes, "변경사항 저장" button is not rendered; "추가" button is disabled |
| TC-REP-007 | FAIL | "새 보고 라인 추가" form: select dropdowns have no onChange handlers → don't set hasChanges → "추가" button stays permanently disabled even after selecting both Reporter and Supervisor |

## Bugs Found

### BUG-C29-B4-001: Report Lines save fails with HTTP 400 (CRITICAL)
- **Page**: /admin/report-lines
- **TCs**: TC-REP-003, TC-REP-004
- **Steps**: Change any user's supervisor → click "변경사항 저장"
- **Expected**: PUT /admin/report-lines succeeds, toast "보고 라인이 저장되었습니다"
- **Actual**: HTTP 400 Bad Request
- **Root cause**: Frontend `handleSave()` at `report-lines.tsx:70-76` maps ALL users including those with `reportsToUserId: null`. Server Zod schema at `report-lines.ts:16-22` requires `reportsToUserId: z.string().uuid()` — does not accept null. Frontend should filter out users with no supervisor before sending, OR server schema should accept `z.string().uuid().nullable()`.
- **Fix location**: `packages/admin/src/pages/report-lines.tsx` line 72-75 (filter `null` values) AND/OR `packages/server/src/routes/admin/report-lines.ts` line 20 (allow nullable)

### BUG-C29-B4-002: "새 보고 라인 추가" form non-functional (HIGH)
- **Page**: /admin/report-lines
- **TC**: TC-REP-007
- **Steps**: Select Reporter → Select Supervisor in the "새 보고 라인 추가" section → click "추가"
- **Expected**: Button becomes enabled after selections, new report line added
- **Actual**: Button stays permanently disabled (`disabled={!hasChanges}` but form selects don't trigger `setHasChanges(true)`)
- **Root cause**: The `<select>` elements at lines 106-111 and 120-125 are uncontrolled — no `onChange` handler connected, no state management for the add form's values
- **Fix location**: `packages/admin/src/pages/report-lines.tsx` — add controlled state + onChange for add-form selects, separate "add" logic from "bulk save" logic

### BUG-C29-B4-003: No client-side label validation for CLI Token (LOW)
- **Page**: /admin/credentials
- **TC**: TC-CRED-005
- **Steps**: Open Add Token form → leave Label empty → click Create Token
- **Expected**: Client-side validation error "Label is required"
- **Actual**: Request sent to server, error returned is about token format, not about missing label
- **Impact**: Low — server still blocks invalid submissions, but UX could be improved
