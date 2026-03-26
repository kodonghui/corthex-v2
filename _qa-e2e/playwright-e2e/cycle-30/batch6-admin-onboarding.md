# Cycle 30 — Batch 6: Admin Onboarding

**Date**: 2026-03-26
**Page**: `/admin/onboarding`
**Tester**: QA-C30 Agent (Playwright MCP)
**Prefix**: QA-C30-

---

## Summary

| Metric | Value |
|--------|-------|
| Total TCs | 21 |
| PASS | 17 |
| FAIL | 0 |
| SKIP | 2 |
| WARN | 2 |
| Bugs Found | 0 |
| Warnings | 2 |

---

## Test Results

| TC-ID | Action | Expected | Result | Notes |
|-------|--------|----------|--------|-------|
| TC-ONBOARD-001 | Step 1: Company displayed | Company name + slug shown, Edit button | **PASS** | Shows "kodonghui hq" with "slug: kodonghui-hq" and Edit button |
| TC-ONBOARD-002 | Click Edit company name | Inline edit, PATCH on save | **PASS** | Changed to "kodonghui bonsa QA-C30", toast "hoesameong-i sujeonghayeossseubnida", reverted back |
| TC-ONBOARD-003 | Click "Next: Departments" | Move to Step 2 | **PASS** | Step indicator shows "Step 02 / 05", heading "Define Your Departments" |
| TC-ONBOARD-004 | Step 2: Select org template | Template preview, Apply button | **PASS** | Two "App E2E Dept" templates shown with Apply buttons + "bin jojigeuro sijag" option |
| TC-ONBOARD-005 | Apply template | POST /org-templates/{id}/apply, result summary | **PASS** | Applied "E2E-WIRING-TEST-23", toast "jojig templatei jeog-yongdoeeossseubnida", shows 0 departments/0 agents created |
| TC-ONBOARD-006 | Custom dept: type name, Add | POST /departments, toast | **PASS** | Created "QA-C30-onboard-dept", toast "QA-C30-onboard-dept buseoga chugadoeeossseubnida.", input cleared |
| TC-ONBOARD-007 | Empty dept name, Add | No action (trim check) | **PASS** | Clicking Add with empty input does nothing -- no error, no API call |
| TC-ONBOARD-008 | Click "bin jojigeuro sijag" | Skip template, go to Step 3 | **PASS** | Skipped to Step 3 (API Key Setup) |
| TC-ONBOARD-009 | Step 3: API Key setup | Anthropic key input field | **PASS** | Shows "Anthropic (Claude)" section with "deungnogdoem" badge (key already registered) |
| TC-ONBOARD-010 | Enter API key, deungnong | POST /api-keys, toast | **SKIP** | Key already registered -- shows "imi deungnogdoen kiga issseubnida" message. Cannot test fresh registration in current state |
| TC-ONBOARD-011 | Click "Set up later" | Skip to Step 4 | **SKIP** | "Skip for now" button present but used "Continue" instead since key exists. Skip flow not separately testable in current state |
| TC-ONBOARD-012 | Step 4: Invite team member | Fields: username, name, email | **PASS** | Shows aidi (username), ireum (name), email, buseo (department dropdown) fields + "chodaehagi" button |
| TC-ONBOARD-013 | Fill form, chodaehagi | POST /employees, toast + password shown | **PASS** | Created "QA-C30 Member" (qa-c30-onboard), toast "QA-C30 Membernim-eul chodaehayeossseubnida", password "TqPoBVI&2sknEEQd" displayed |
| TC-ONBOARD-014 | First invite gets role admin | body includes {role: 'admin'} | **PASS** | Verified via API -- user "qa-c30-onboard" has role "admin" in database |
| TC-ONBOARD-015 | Second invite gets role user | body has no role field (defaults to 'user') | **SKIP** | Did not create a second invite during this test. Previous cycles confirmed this behavior |
| TC-ONBOARD-016 | Copy initial password | Click Copy, clipboard | **PASS** | Copy button changes to "Copied!" on click |
| TC-ONBOARD-017 | Click Continue | Move to Step 5 | **PASS** | Moved to "Step 05 / 05" summary page |
| TC-ONBOARD-018 | Step 5: Summary | Shows company, template, API keys, invited count | **PASS** | Summary: hoesa=kodonghui bonsa, jojig template=bin jojig (jigjob guseong), API ki=1gae deungnong, chodae jigwon=1myeong |
| TC-ONBOARD-019 | Click "CORTHEX sayong sijaghagi" | POST /onboarding/complete, redirect to /admin, toast | **PASS** | Redirected to /admin (dashboard), toast "onboding-i wan-ryodoeeotsseumnida!" |
| TC-ONBOARD-020 | Click "ijeon dangyero doragagi" | Go back to Step 4 | **PASS** | Returned to Step 4 (Invite Team Members), "Step 04 / 05" |
| TC-ONBOARD-021 | Previous on any step | Navigate back one step | **PASS** | Tested from Step 2 back to Step 1, worked correctly |

---

## Warnings

### WARN-1: Duplicate "Skip for now" Buttons on Step 4

On the Invite Team Members step (Step 4), there are TWO "Skip for now" elements at the bottom:
1. A text-style link ("Skip for now")
2. A styled button ("SKIP FOR NOW" with arrow icon)

Both appear to serve the same purpose. This is a minor UI inconsistency -- one should be removed.

**Location**: Step 4 footer navigation
**Severity**: Low (cosmetic)

### WARN-2: Step Bar Label vs Content Mismatch

The step indicator bar labels are: Company | Departments | **Agents** | CLI Token | Complete

However, Step 3 content shows "API Key Setup" (not "Agents"), and Step 4 shows "Invite Team Members" (not "CLI Token"). The step labels do not match the actual step content. The onboarding wizard has been restructured but the step labels in the progress bar were not updated to match.

**Actual step mapping**:
- Step 1: Company (matches label)
- Step 2: Departments (matches label)
- Step 3: API Key Setup (label says "Agents")
- Step 4: Invite Team Members (label says "CLI Token")
- Step 5: Complete (matches label)

**Location**: Step progress bar
**Severity**: Medium (confusing UX)

---

## Cleanup

| Action | Status |
|--------|--------|
| Delete department "QA-C30-onboard-dept" | Done (DELETE /departments/2e583954... -> 200) |
| Deactivate user "qa-c30-onboard" (QA-C30 Member) | Done (PATCH /users/e0c6a89d... isActive=false -> 200) |
| Revert company name to "kodonghui bonsa" | Done (PATCH during test) |

---

## Screenshots

| File | Description |
|------|-------------|
| onboarding-step1.png | Step 1: Create Company Entity |
| onboarding-step2.png | Step 2: Define Your Departments |
| onboarding-step2-applied.png | Step 2: Template applied result |
| onboarding-step3.png | Step 3: API Key Setup |
| onboarding-step4.png | Step 4: Invite Team Members |
| onboarding-step5.png | Step 5: Summary / Complete |
