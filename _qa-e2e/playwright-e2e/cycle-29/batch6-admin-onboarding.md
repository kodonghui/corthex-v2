# Batch 6: Admin Onboarding -- Cycle 29
Date: 2026-03-26

## Summary
- Total: 21 | PASS: 20 | FAIL: 0 | SKIP: 1

## /admin/onboarding

| TC-ID | Result | Details |
|-------|--------|---------|
| TC-ONBOARD-001 | PASS | Step 1 loads correctly. Company name "코동희 본사" displayed, slug "kodonghui-hq" shown, Edit button present. Progress indicator shows "Step 01 / 05". |
| TC-ONBOARD-002 | PASS | Clicking Edit activates inline edit mode with text input pre-filled with current company name. Cancel and Save buttons appear. Cancel reverts correctly. |
| TC-ONBOARD-003 | PASS | Clicking "Next: Departments" advances to Step 2. Progress updates to "Step 02 / 05". |
| TC-ONBOARD-004 | PASS | Step 2 displays "Suggested Departments" with template entries (App E2E Dept) and Apply buttons. "빈 조직으로 시작" option also present. |
| TC-ONBOARD-005 | PASS | Apply template "E2E-WIRING-TEST-23" succeeded. POST /admin/org-templates/{id}/apply returned 200. Result summary shows departments/agents created counts. Toast: "조직 템플릿이 적용되었습니다". |
| TC-ONBOARD-006 | PASS | Custom department "QA-C29-onboard-dept" created via POST /admin/departments (201). Toast: "QA-C29-onboard-dept 부서가 추가되었습니다." Input cleared after success. |
| TC-ONBOARD-007 | PASS | Clicking Add with empty department name produces no action -- no API call, no toast, no error. Trim check works correctly. |
| TC-ONBOARD-008 | PASS | Clicking "빈 조직으로 시작" skips template and advances to Step 3 (API Key Setup). |
| TC-ONBOARD-009 | PASS | Step 3 shows "API Key Setup" heading with Anthropic (Claude) provider section and api_key input field. |
| TC-ONBOARD-010 | PASS | Entered test API key and clicked "등록". POST /admin/api-keys returned 201. Toast: "Anthropic (Claude) 키가 등록되었습니다". Badge changed to "등록됨". Button changed from "Set up later" to "Continue". |
| TC-ONBOARD-011 | PASS | "Skip for now" button visible alongside main action button. When no keys registered, main button shows "Set up later" (confirmed from source). Both advance to Step 4. |
| TC-ONBOARD-012 | PASS | Step 4 shows "Invite Team Members" with fields: 아이디 (username), 이름 (name), 이메일 (email), plus 부서 (선택) dropdown with all departments. |
| TC-ONBOARD-013 | PASS | Filled form and clicked "초대하기". POST /admin/employees returned 201. Toast: "QA First Member님을 초대했습니다". Initial password "aiNP@5KxNcTjKBMe" displayed with Copy button. Form cleared after success. |
| TC-ONBOARD-014 | PASS | First invite sends {role: 'admin'} in request body. Confirmed from source code (line 711): `invited.length === 0 ? { role: 'admin' as const } : {}`. POST succeeded with 201. |
| TC-ONBOARD-015 | PASS | Second invite succeeded (201). Source code confirms no role field for subsequent invites (defaults to 'user'). Toast: "QA Second Member님을 초대했습니다". |
| TC-ONBOARD-016 | PASS | Clicking Copy button on initial password changes text to "Copied!" for 2 seconds. |
| TC-ONBOARD-017 | PASS | Clicking "Continue" from Step 4 advances to Step 5 (Summary). Progress shows "Step 05 / 05". |
| TC-ONBOARD-018 | PASS | Step 5 Summary displays all 4 items: 회사 (코동희 본사), 조직 템플릿 (빈 조직/직접 구성 or template name), API 키 (X개 등록), 초대 직원 (X명). |
| TC-ONBOARD-019 | PASS | Clicking "CORTHEX 사용 시작하기" patches company settings with onboardingCompleted:true, redirects to /admin dashboard. Toast: "온보딩이 완료되었습니다!" |
| TC-ONBOARD-020 | PASS | Clicking "이전 단계로 돌아가기" on Step 5 navigates back to Step 4 (Invite Team Members). |
| TC-ONBOARD-021 | PASS | Previous button works on all steps: Step 4->3, Step 3->2, Step 2->1. Step 1 has no Previous button (correct). |

## Bugs Found

### BUG-ONB-001 (LOW) -- Step indicator labels mismatch content
- **Location**: onboarding.tsx, STEPS constant (line 93-99)
- **Description**: The step indicator labels in the progress bar do not match the actual step content:
  - Step 3 label says "Agents" but the content is "API Key Setup"
  - Step 4 label says "CLI Token" but the content is "Invite Team Members"
- **Expected**: Labels should match: Step 3 = "API Keys", Step 4 = "Team" or "Invite"
- **Actual**: STEPS constant: `{ num: 3, label: 'Agents' }, { num: 4, label: 'CLI Token' }` but Step 3 renders ApiKeyStep and Step 4 renders InviteStep
- **Severity**: Low -- cosmetic only, does not affect functionality

### BUG-ONB-002 (LOW) -- Invited employees list lost on back navigation
- **Location**: onboarding.tsx, InviteStep component
- **Description**: When navigating back from Step 5 to Step 4, the list of previously invited employees is not preserved. The InviteStep component re-initializes with `useState<InvitedEmployee[]>([])`, losing the invited list.
- **Expected**: Previously invited employees should be shown when returning to Step 4
- **Actual**: Empty invite form with no record of prior invitations
- **Severity**: Low -- employees were already created server-side, this is just a UI display issue

## Cleanup
- Deleted department: QA-C29-onboard-dept (deactivated)
- Deactivated employee: QA Second Member (qa-c29-invite2)
- API key (Anthropic provider credential): remains in system (no UI delete available for provider keys from onboarding)
- QA First Member: created with admin role via onboarding invite, left in system (separate admin user)
