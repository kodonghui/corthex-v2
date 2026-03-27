# Cycle 35 — Batch 6: /admin/onboarding

**Date:** 2026-03-27
**Tester:** Playwright MCP (automated)
**Session:** 0353a777-f510-4a4a-b801-aaba0dba7cbe
**URL:** http://localhost:5173/admin/login → /admin/onboarding
**Credentials:** admin / admin1234
**Prefix:** QA-C35-

---

## Summary

| Result | Count |
|--------|-------|
| PASS   | 21    |
| FAIL   | 0     |
| SKIP   | 0     |
| **Total** | **21** |

---

## Test Results

| TC-ID | Prefix | Action | Expected | Result | Notes |
|-------|--------|--------|----------|--------|-------|
| TC-ONBOARD-001 | QA-C35-ONB-001 | Step 1 loads | Company name + slug shown, Edit button | PASS | "코동희 본사" + slug "kodonghui-hq" + Edit button visible |
| TC-ONBOARD-002 | QA-C35-ONB-002 | Click Edit company name | Inline edit → PATCH on save | PASS | Inline textbox appears; save shows toast "회사명이 수정되었습니다"; updated to "코동희 본사 QA-C35" |
| TC-ONBOARD-003 | QA-C35-ONB-003 | Click "Next: Departments" | Move to Step 2 | PASS | Step 02/05 rendered with "Define Your Departments" |
| TC-ONBOARD-004 | QA-C35-ONB-004 | Step 2: Select org template | Template preview, Apply button | PASS | Two templates with "Apply" buttons + "빈 조직으로 시작" option displayed |
| TC-ONBOARD-005 | QA-C35-ONB-005 | Apply template | POST /admin/org-templates/{id}/apply → result summary | PASS | Applied "E2E-WIRING-TEST-23"; shows Applied header, dept/agent counts, toast "조직 템플릿이 적용되었습니다" |
| TC-ONBOARD-006 | QA-C35-ONB-006 | Custom dept: type name → Add | POST /admin/departments → toast | PASS | Typed "QA-C35-onboard-dept"; toast "QA-C35-onboard-dept 부서가 추가되었습니다." |
| TC-ONBOARD-007 | QA-C35-ONB-007 | Empty dept name → Add | No action (trim check) | PASS | Clicking Add with empty field: no request sent, no toast, no navigation |
| TC-ONBOARD-008 | QA-C35-ONB-008 | Click "빈 조직으로 시작" | Skip template, go to Step 3 | PASS | Clicked; immediately moved to Step 03/05 "API Key Setup" |
| TC-ONBOARD-009 | QA-C35-ONB-009 | Step 3: API Key setup | Anthropic key input field | PASS | "Anthropic (Claude)" section with api_key textbox shown |
| TC-ONBOARD-010 | QA-C35-ONB-010 | Enter API key → 등록 | POST /admin/api-keys → toast | PASS | Entered test key; toast "Anthropic (Claude) 키가 등록되었습니다"; section shows "등록됨" badge |
| TC-ONBOARD-011 | QA-C35-ONB-011 | Click "Set up later" | Skip to Step 4 | PASS | "Skip for now" button on Step 3 → moved to Step 04/05 "Invite Team Members" |
| TC-ONBOARD-012 | QA-C35-ONB-012 | Step 4: Invite team member | Fields: username, name, email | PASS | 아이디, 이름, 이메일, 부서(선택) fields + 초대하기 button displayed |
| TC-ONBOARD-013 | QA-C35-ONB-013 | Fill form → 초대하기 | POST /admin/employees → toast + password shown | PASS | Invited "QA C35 Member"; toast "QA C35 Member님을 초대했습니다"; initial password shown in code block |
| TC-ONBOARD-014 | QA-C35-ONB-014 | First invite gets role admin | body includes {role: 'admin'} | PASS | Source code (onboarding.tsx:711): `...(invited.length === 0 ? { role: 'admin' } : {})`. Dashboard confirms "QA C35 Member" has role=admin |
| TC-ONBOARD-015 | QA-C35-ONB-015 | Second invite gets role user | body has no role field (defaults to 'user') | PASS | Second invite "QA C35 Member2" has no role field in POST body; dashboard confirms role=user |
| TC-ONBOARD-016 | QA-C35-ONB-016 | Copy initial password | Click Copy → clipboard | PASS | Copy button changes to "Copied!" after click |
| TC-ONBOARD-017 | QA-C35-ONB-017 | Click Continue | Move to Step 5 | PASS | Step 05/05 "CORTHEX 준비 완료" loaded |
| TC-ONBOARD-018 | QA-C35-ONB-018 | Step 5: Summary | Shows company, template, API keys, invited count | PASS | Shows: 회사=코동희 본사 QA-C35, 조직 템플릿=빈 조직, API 키=1개 등록, 초대 직원=2명 |
| TC-ONBOARD-019 | QA-C35-ONB-019 | Click "CORTHEX 사용 시작하기" | POST /onboarding/complete → redirect to /admin → toast | PASS | URL changed to /admin; toast "온보딩이 완료되었습니다!" displayed |
| TC-ONBOARD-020 | QA-C35-ONB-020 | Click "이전 단계로 돌아가기" | Go back to Step 4 | PASS | From Step 5, click button → returned to Step 04/05 "Invite Team Members" |
| TC-ONBOARD-021 | QA-C35-ONB-021 | Previous on any step | Navigate back one step | PASS | From Step 2 → Previous → Step 1; from Step 4 → Previous → Step 3; all back-nav works |

---

## Screenshots

- `onboarding-initial.png` — Step 1 (Company) on page load
- `onboarding-complete.png` — /admin dashboard after onboarding completion

---

## Observations

- Step indicator shows "Step 0X / 05" with correct progress across all steps.
- Inline company name edit works correctly with PATCH + toast.
- Template apply shows result summary (dept count, agent count).
- Empty dept name trim guard works (no API call, no side effects).
- Custom dept added via POST with success toast — QA-C35-onboard-dept now visible in dept list on dashboard (DEPT_34).
- "빈 조직으로 시작" skips template step directly to Step 3.
- API key registration shows "등록됨" badge and disables re-entry; "Set up later" navigates correctly.
- First invite role=admin enforced by source code conditional (onboarding.tsx:711).
- Password copy button correctly toggles to "Copied!" state.
- Step 5 summary accurately reflects all setup choices.
- "CORTHEX 사용 시작하기" correctly POSTs completion and redirects with toast.
- All Previous navigation works correctly across all steps.
- No JavaScript errors observed during the test run.
- Budget warning toast appeared (월간 예산 경고: 467%) — not a functional bug.
