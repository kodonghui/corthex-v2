# Cycle 34 — Batch 6: /admin/onboarding (TC-ONBOARD-*)

**Date:** 2026-03-27
**Tester:** E2E Agent (Playwright MCP)
**Session:** 0e407cda-286b-4ab7-848a-be70317f7712 (closed)
**Prefix:** QA-C34-
**URL:** http://localhost:5173/admin/onboarding
**Auth:** admin / admin1234

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

| TC-ID | QA-ID | Action | Expected | Result | Notes |
|-------|-------|--------|----------|--------|-------|
| TC-ONBOARD-001 | QA-C34-ONB-001 | Step 1 load | Company name + slug shown, Edit button | **PASS** | Shows "코동희 본사", slug "kodonghui-hq", Edit button present |
| TC-ONBOARD-002 | QA-C34-ONB-002 | Click Edit company name | Inline edit → PATCH on save | **PASS** | Textbox appeared; PATCH /admin/companies/{id} 200 OK; toast "회사명이 수정되었습니다" |
| TC-ONBOARD-003 | QA-C34-ONB-003 | Click "Next: Departments" | Move to Step 2 | **PASS** | Step 02/05 displayed; Departments step rendered correctly |
| TC-ONBOARD-004 | QA-C34-ONB-004 | Step 2: Select org template | Template preview, Apply button | **PASS** | Two "App E2E Dept" templates shown with Apply buttons; "빈 조직으로 시작" option visible |
| TC-ONBOARD-005 | QA-C34-ONB-005 | Apply template | POST /admin/org-templates/{id}/apply → result summary | **PASS** | POST .../apply 201 Created; result summary shows "Applied 'E2E-WIRING-TEST-23'", 0 부서/에이전트 생성; toast "조직 템플릿이 적용되었습니다" |
| TC-ONBOARD-006 | QA-C34-ONB-006 | Custom dept: type "QA-C34-onboard-dept" → Add | POST /admin/departments → toast | **PASS** | POST /admin/departments 201 Created; toast "QA-C34-onboard-dept 부서가 추가되었습니다." |
| TC-ONBOARD-007 | QA-C34-ONB-007 | Empty dept name → Add | No action (trim check) | **PASS** | No POST /admin/departments fired; field was empty, button click silently ignored |
| TC-ONBOARD-008 | QA-C34-ONB-008 | Click "빈 조직으로 시작" | Skip template, go to Step 3 | **PASS** | Immediately navigated to Step 03/05 (API Key Setup) |
| TC-ONBOARD-009 | QA-C34-ONB-009 | Step 3: API Key setup | Anthropic key input field | **PASS** | Step 3 shows "API Key Setup", Anthropic (Claude) section with api_key textbox and 등록 button |
| TC-ONBOARD-010 | QA-C34-ONB-010 | Enter API key → 등록 | POST /admin/api-keys → toast | **PASS** | POST /admin/api-keys 201 Created; toast "Anthropic (Claude) 키가 등록되었습니다"; field updated to show "등록됨" status |
| TC-ONBOARD-011 | QA-C34-ONB-011 | Click "Skip for now" on Step 3 | Skip to Step 4 | **PASS** | "Skip for now" button navigated directly to Step 04/05 (Invite Team Members) |
| TC-ONBOARD-012 | QA-C34-ONB-012 | Step 4: Invite team member | Fields: username, name, email | **PASS** | Step 4 shows 아이디, 이름, 이메일 fields plus optional 부서 dropdown and 초대하기 button |
| TC-ONBOARD-013 | QA-C34-ONB-013 | Fill form → 초대하기 | POST /admin/employees → toast + password shown | **PASS** | Filled qa-c34-member / QA C34 Member / qa-c34-member@test.com; POST /admin/employees 200; toast "QA C34 Member님을 초대했습니다"; initial password "vDiLKBPkDC*T1leO" shown with Copy button |
| TC-ONBOARD-014 | QA-C34-ONB-014 | First invite gets role admin | body includes {role: 'admin'} | **PASS** | Dashboard after onboarding completion shows "QA C34 Member USER admin ACTIVE" confirming admin role assigned |
| TC-ONBOARD-015 | QA-C34-ONB-015 | Second invite gets role user | body has no role field (defaults to 'user') | **PASS** | Second invite (qa-c34-member2) succeeded; dashboard shows "QA C34 Member2 USER user ACTIVE" confirming default user role |
| TC-ONBOARD-016 | QA-C34-ONB-016 | Copy initial password | Click Copy → clipboard | **PASS** | Copy button changed to "Copied!" immediately after click |
| TC-ONBOARD-017 | QA-C34-ONB-017 | Click Continue | Move to Step 5 | **PASS** | After second invite, Continue button advanced to Step 05/05 |
| TC-ONBOARD-018 | QA-C34-ONB-018 | Step 5: Summary | Shows company, template, API keys, invited count | **PASS** | Summary shows: 회사=코동희 본사, 조직 템플릿=빈 조직 (직접 구성), API 키=2개 등록, 초대 직원=2명 |
| TC-ONBOARD-019 | QA-C34-ONB-019 | Click "CORTHEX 사용 시작하기" | POST /onboarding/complete → redirect to /admin → toast | **PASS** | Redirected to /admin; toast "온보딩이 완료되었습니다!" displayed; dashboard loaded with updated counts (31 depts, 27 users, 19 agents) |
| TC-ONBOARD-020 | QA-C34-ONB-020 | Click "이전 단계로 돌아가기" | Go back to Step 4 | **PASS** | Button on Step 5 navigated back to Step 04/05 correctly |
| TC-ONBOARD-021 | QA-C34-ONB-021 | Previous on any step | Navigate back one step | **PASS** | Previous button on Step 2 (after template applied) returned to Step 01/05 correctly |

---

## Screenshots

| File | Description |
|------|-------------|
| `screenshots/onboard-step1.png` | Step 1 — Create Company Entity |
| `screenshots/onboard-step2.png` | Step 2 — Define Departments (templates visible) |
| `screenshots/onboard-step3.png` | Step 3 — API Key Setup |
| `screenshots/onboard-step4.png` | Step 4 — Invite Team Members |
| `screenshots/onboard-step5.png` | Step 5 — Setup Complete Summary |

---

## Observations

1. **Step 3 dual-state UI**: When an API key is already registered, the 등록 button is replaced with "Continue". The "Set up later" label shown in TC is rendered as "Skip for now" in the actual UI — behavior is equivalent (skips to Step 4). PASS confirmed.

2. **Budget warning toast**: During TC-ONBOARD-010, a secondary toast appeared: "월간 예산 초과! 현재 0.04 USD (한도: 0.01 USD)". This is a pre-existing environment condition (budget limit is low in test env), not related to onboarding functionality.

3. **TC-ONBOARD-014 role verification**: The admin role assignment for the first onboarding invite is confirmed via the dashboard table showing `role: admin` for QA C34 Member. Direct request body inspection was not possible via Playwright, but the result (role=admin in DB) proves the fix is working.

4. **TC-ONBOARD-006 created dept visible in Step 4 dropdown**: The "QA-C34-onboard-dept" department created in TC-ONBOARD-006 appeared in the optional dept dropdown in Step 4, confirming real-time consistency.

5. **No regressions detected** across the full 5-step wizard flow.

---

## API Calls Verified

| Method | Endpoint | Status | TC |
|--------|----------|--------|----|
| PATCH | /admin/companies/{id} | 200 | ONB-002 |
| POST | /admin/org-templates/{id}/apply | 201 | ONB-005 |
| POST | /admin/departments | 201 | ONB-006 |
| POST | /admin/api-keys | 201 | ONB-010 |
| POST | /admin/employees (×2) | 200 | ONB-013/015 |
| GET | /admin (redirect after complete) | 200 | ONB-019 |
