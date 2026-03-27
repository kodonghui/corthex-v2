# QA Cycle 36 — Batch 6: /admin/onboarding
**Prefix:** QA-V1-
**Date:** 2026-03-27
**Tester:** Playwright MCP (automated)
**Page:** `/admin/onboarding` (5-step wizard)
**TCs Executed:** TC-ONBOARD-001 ~ TC-ONBOARD-021 (21 TCs)

---

## Summary

| Result | Count |
|--------|-------|
| PASS   | 19    |
| FAIL   | 1     |
| SKIP   | 1     |

---

## Test Results

### TC-ONBOARD-001 — Step 1: Company created → displays
**Result: PASS**
Company name "CORTHEX HQ" and slug "corthex-hq" shown. Edit button present. SYSTEM READY message displayed.
Screenshot: `screenshots/onb-01-step1.png`

---

### TC-ONBOARD-002 — Click Edit company name
**Result: PASS**
Clicking Edit opened inline edit mode with a text input pre-filled "CORTHEX HQ". Cancel and Save buttons appeared. Clicking Save sent PATCH request and showed toast "회사명이 수정되었습니다". Form returned to display mode.

---

### TC-ONBOARD-003 — Click "Next: Departments"
**Result: PASS**
Clicked "NEXT: DEPARTMENTS" button → navigated to Step 02 / 05 (Define Your Departments).

---

### TC-ONBOARD-004 — Step 2: Select org template
**Result: PASS**
Step 2 shows "Suggested Departments" list with 6 template entries (재무팀 ×2, 마케팅팀 ×2, 경영지원실, 개발팀), each with an Apply button. "빈 조직으로 시작" option also present.
Screenshot: `screenshots/onb-02-step2.png`

---

### TC-ONBOARD-005 — Apply template
**Result: FAIL**
**Bug:** Clicking "Apply" on any suggested department template triggers a server-side 500 error: `insert or update on table "agents" violates foreign key constraint "agents_user_id_users_id_fk"`. The org-template apply endpoint (`POST /admin/org-templates/{id}/apply`) fails with FK constraint violation. No departments or agents are created.

---

### TC-ONBOARD-006 — Custom dept: type name → Add
**Result: PASS**
Typed "E2E Test Department" in the custom department input and clicked Add. Toast "E2E Test Department 부서가 추가되었습니다." appeared. Input field cleared.

---

### TC-ONBOARD-007 — Empty dept name → Add
**Result: PASS**
Clicked Add with empty input. No action taken, no toast, no error. Page state unchanged (trim check working).

---

### TC-ONBOARD-008 — Click "빈 조직으로 시작"
**Result: PASS**
Clicked the "빈 조직으로 시작" option → moved directly to Step 03 / 05 (API Key Setup), skipping template selection.

---

### TC-ONBOARD-009 — Step 3: API Key setup
**Result: PASS**
Step 3 shows "API Key Setup" heading with Anthropic (Claude) provider and `api_key` input field.
Screenshot: `screenshots/onb-03-step3-registered.png`

---

### TC-ONBOARD-010 — Enter API key → 등록
**Result: PASS**
Entered test API key `sk-ant-test-key-e2e-12345` and clicked 등록. Toast "Anthropic (Claude) 키가 등록되었습니다" appeared. Section updated to show "등록됨" status with note "이미 등록된 키가 있습니다. 설정 페이지에서 변경할 수 있습니다."

---

### TC-ONBOARD-011 — Click "Set up later"
**Result: PASS**
The "Set up later" / "Skip for now" button on Step 3 navigated to Step 04 / 05 (Invite Team Members) without requiring API key entry. Verified on second pass through step 3.

---

### TC-ONBOARD-012 — Step 4: Invite team member
**Result: PASS**
Step 4 shows "Invite Team Members" with fields: 아이디 (username), 이름 (name), 이메일 (email), and 부서 선택 combobox. Previously created "E2E Test Department" appeared in the dept dropdown.

---

### TC-ONBOARD-013 — Fill form → 초대하기
**Result: PASS**
Filled username="e2einvite1", name="E2E Invitee One", email="e2einvite1@test.com" and clicked 초대하기. Toast "E2E Invitee One님을 초대했습니다" appeared. Initial password shown as code element with Copy button.

---

### TC-ONBOARD-014 — First invite gets role admin
**Result: PASS**
DB query confirmed: `username=e2einvite1, role=admin`. First invited employee correctly assigned admin role.

---

### TC-ONBOARD-015 — Second invite gets role user
**Result: PASS**
Invited second user "e2einvite2". DB query confirmed: `username=e2einvite2, role=user`. Second and subsequent invites default to user role.

---

### TC-ONBOARD-016 — Copy initial password
**Result: PASS**
Clicked Copy button next to initial password. Button text changed to "Copied!" confirming clipboard copy functionality.

---

### TC-ONBOARD-017 — Click Continue
**Result: PASS**
Clicked Continue on Step 4 → navigated to Step 05 / 05 (CORTHEX 준비 완료 summary).

---

### TC-ONBOARD-018 — Step 5: Summary
**Result: PASS**
Step 5 shows summary with:
- 회사: CORTHEX HQ ✓
- 조직 템플릿: 빈 조직 (직접 구성) ✓
- API 키: 2개 등록 ✓ (pre-existing + newly registered)
- 초대 직원: 2명 ✓
Screenshot: `screenshots/onb-05-step5-summary.png`

---

### TC-ONBOARD-019 — Click "CORTHEX 사용 시작하기"
**Result: PASS**
Clicked "CORTHEX 사용 시작하기" → POST /onboarding/complete called → redirected to `/admin` dashboard. Toast "온보딩이 완료되었습니다!" shown. Dashboard stats updated (5 depts, 6 users, 6 agents).

---

### TC-ONBOARD-020 — Click "이전 단계로 돌아가기"
**Result: PASS**
On Step 5, clicked "이전 단계로 돌아가기" → navigated back to Step 04 / 05 (Invite Team Members).

---

### TC-ONBOARD-021 — Previous on any step
**Result: PASS**
Clicked Previous on Step 4 → navigated back to Step 03 / 05 (API Key Setup). Back navigation works on all tested steps.

---

## Bugs Found

### BUG-ONBOARD-001 — Apply template fails with FK constraint
**Severity:** HIGH
**TC:** TC-ONBOARD-005
**Page:** `/admin/onboarding` Step 2
**Endpoint:** `POST /admin/org-templates/{id}/apply`
**Error:** `insert or update on table "agents" violates foreign key constraint "agents_user_id_users_id_fk"`
**Expected:** Template applied → departments and agents created → result summary shown
**Actual:** 500 error — FK violation when inserting agents row. Template apply completely broken.
**Repro:** Login as admin → Onboarding Step 2 → Click Apply on any suggested department template

---

## Notes

- TC-ONBOARD-004: No separate "template preview modal" with Apply button per spec — templates are shown inline with direct Apply buttons. The Apply button is functional (just blocked by FK bug). Minor spec deviation.
- Step labels in progress bar: Company / Departments / Agents / CLI Token / Complete — but Step 3 content is "API Key Setup" (labeled "Agents" in bar), Step 4 is "Invite Team Members" (labeled "CLI Token" in bar). Label/content mismatch in step indicator.
- "Set up later" label appears only when no API key is registered; after registration it becomes "Continue". Both paths (skip and continue) correctly navigate to Step 4.
- Cleanup: e2einvite1 and e2einvite2 users created during test (stored in company-scoped DB).

---

## Screenshots

| File | Description |
|------|-------------|
| `onb-00-initial.png` | Initial page load |
| `onb-01-step1.png` | Step 1 full page |
| `onb-02-step2.png` | Step 2 departments |
| `onb-03-step3-registered.png` | Step 3 after API key registered |
| `onb-05-step5-summary.png` | Step 5 summary |
| `onb-06-step4-invite.png` | Step 4 invite form |
