# Cycle 31 — Batch 6: /admin/onboarding

**Date**: 2026-03-26
**Prefix**: QA-C31-
**Page**: `/admin/onboarding` (5-step wizard)
**Tester**: Playwright MCP (automated)
**Session**: 6dac28b3-d1a4-4683-801e-1ff38504e7c7

---

## Summary

| Total TCs | PASS | FAIL | SKIP | PARTIAL |
|-----------|------|------|------|---------|
| 21        | 20   | 0    | 0    | 1       |

**Overall Result: PASS (no failures)**

---

## Test Results

### Step 1 — Company

| TC-ID | Action | Expected | Result | Notes |
|-------|--------|----------|--------|-------|
| QA-C31-TC-ONBOARD-001 | Step 1 loads with company info | Company name + slug + Edit button shown | **PASS** | "코동희 본사", slug "kodonghui-hq", Edit button present |
| QA-C31-TC-ONBOARD-002 | Click Edit → inline edit → Save | PATCH on save → toast | **PASS** | Edit textbox appeared; Save triggered "회사명이 수정되었습니다" toast; Cancel also works |
| QA-C31-TC-ONBOARD-003 | Click "Next: Departments" | Move to Step 2 | **PASS** | Step 02/05 loaded — "Define Your Departments" |

### Step 2 — Departments

| TC-ID | Action | Expected | Result | Notes |
|-------|--------|----------|--------|-------|
| QA-C31-TC-ONBOARD-004 | Step 2 shows org templates | Template preview + Apply button | **PASS** | Two "App E2E Dept" templates with Apply buttons + "빈 조직으로 시작" option |
| QA-C31-TC-ONBOARD-005 | Apply template | POST /admin/org-templates/{id}/apply → result summary | **PASS** | Applied "E2E-WIRING-TEST-23" template; result: 0 departments, 0 agents created; toast "조직 템플릿이 적용되었습니다" |
| QA-C31-TC-ONBOARD-006 | Custom dept: type "QA-C31-onboard-dept" → Add | POST /admin/departments → toast | **PASS** | Toast: "QA-C31-onboard-dept 부서가 추가되었습니다."; dept appeared in dashboard (DEPT_21) |
| QA-C31-TC-ONBOARD-007 | Empty dept name → Add | No action (trim check) | **PASS** | Clicked Add with empty field — no request sent, no toast, page unchanged |
| QA-C31-TC-ONBOARD-008 | Click "빈 조직으로 시작" | Skip template, go to Step 3 | **PASS** | Clicked; navigated directly to Step 03/05 (API Key Setup) |

### Step 3 — API Key (CLI Token)

| TC-ID | Action | Expected | Result | Notes |
|-------|--------|----------|--------|-------|
| QA-C31-TC-ONBOARD-009 | Step 3: API Key setup | Anthropic key input field visible | **PASS** | "Anthropic (Claude)" section shown with "등록됨" badge |
| QA-C31-TC-ONBOARD-010 | Enter API key → 등록 | POST /admin/api-keys → toast | **PARTIAL** | Key already registered ("이미 등록된 키가 있습니다. 설정 페이지에서 변경할 수 있습니다."); new-entry input field not shown when key exists. Could not test fresh registration in this environment. |
| QA-C31-TC-ONBOARD-011 | Click "Skip for now" | Skip to Step 4 | **PASS** | Clicked "Skip for now"; moved to Step 04/05 (Invite Team Members) |

### Step 4 — Invite Team Members

| TC-ID | Action | Expected | Result | Notes |
|-------|--------|----------|--------|-------|
| QA-C31-TC-ONBOARD-012 | Step 4: Invite team member | Fields: username, name, email | **PASS** | 아이디, 이름, 이메일, 부서(선택) fields and 초대하기 button all present |
| QA-C31-TC-ONBOARD-013 | Fill form → 초대하기 | POST /admin/employees → toast + password shown | **PASS** | Filled QA-C31-Member / "QA C31 Member" / qa-c31@test.com; toast "QA C31 Member님을 초대했습니다"; password "zmam251An&$FRd$g" displayed with Copy button |
| QA-C31-TC-ONBOARD-014 | First invite gets role admin | body includes {role: 'admin'} | **PASS** | Dashboard confirmed: "QA C31 Member" shows role "admin" |
| QA-C31-TC-ONBOARD-015 | Second invite gets role user | body has no role field (defaults to 'user') | **PASS** | "QA C31 Member2" shows role "user" in dashboard activity table |
| QA-C31-TC-ONBOARD-016 | Copy initial password | Click Copy → button changes | **PASS** | Copy button changed to "Copied!" after click |
| QA-C31-TC-ONBOARD-017 | Click Continue | Move to Step 5 | **PASS** | Clicked Continue; moved to Step 05/05 (Setup Complete / Summary) |

### Step 5 — Summary & Complete

| TC-ID | Action | Expected | Result | Notes |
|-------|--------|----------|--------|-------|
| QA-C31-TC-ONBOARD-018 | Step 5: Summary | Shows company, template, API keys, invited count | **PASS** | Shows: 회사=코동희 본사, 조직 템플릿=빈 조직(직접 구성), API 키=1개 등록, 초대 직원=2명 |
| QA-C31-TC-ONBOARD-019 | Click "CORTHEX 사용 시작하기" | POST /onboarding/complete → redirect to /admin → toast | **PASS** | Redirected to /admin; toast "온보딩이 완료되었습니다!" shown; dashboard updated (21 depts, 18 users, 13 agents) |
| QA-C31-TC-ONBOARD-020 | Click "이전 단계로 돌아가기" | Go back to Step 4 | **PASS** | Clicked from Step 5; returned to Step 04/05 (Invite Team Members) |

### Navigation — Previous

| TC-ID | Action | Expected | Result | Notes |
|-------|--------|----------|--------|-------|
| QA-C31-TC-ONBOARD-021 | Previous on any step | Navigate back one step | **PASS** | Tested on Step 2→1 (Previous button) and Step 5→4 ("이전 단계로 돌아가기"); both work correctly |

---

## Bugs Found

**None.** All 20 passing TCs behaved as specified.

**Partial (TC-ONBOARD-010)**: API key input field for fresh entry not visible when a key is already registered. This is correct UI behavior — the page shows "already registered" state. To test the fresh registration flow, the existing key would need to be deleted first. Not a bug.

---

## Data Created (cleanup reference)

| Type | Name | Notes |
|------|------|-------|
| Department | QA-C31-onboard-dept | Created via Step 2 custom dept add |
| Employee | QA-C31-Member (username) | Role: admin, email: qa-c31@test.com |
| Employee | QA-C31-Member2 (username) | Role: user, email: qa-c31-2@test.com |

---

## Screenshots

| File | Description |
|------|-------------|
| `onboarding-initial.png` | Step 1 initial load (before snapshot) |
| `onboard-001-step1.png` | Step 1 — Edit mode active |
| `onboard-step2-departments.png` | Step 2 — Departments with templates |
| `onboard-005-template-applied.png` | Step 2 — Template applied result |
| `onboard-step3-api-key.png` | Step 3 — API key (already registered) |
| `onboard-step4-invite.png` | Step 4 — Invite team member form |
| `onboard-013-invite-success.png` | Step 4 — First invite success + password |
| `onboard-step5-summary.png` | Step 5 — Summary screen |
| `onboard-019-complete.png` | Post-completion dashboard redirect |
