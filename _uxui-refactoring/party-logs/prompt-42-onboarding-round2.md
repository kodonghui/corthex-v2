# Party Mode Review Log: Prompt 42 — Onboarding Wizard
## Round 2: Adversarial Review

### Expert Panel

1. **Security Auditor**: The spec doesn't mention the dynamic provider schema API call. The credential fields are NOT hardcoded -- they come from `/admin/api-keys/providers`. If a wireframe tool interprets the spec literally, it might hardcode "api_key" instead of handling dynamic fields.
2. **Interaction Designer**: The blank org card and template cards have DIFFERENT click behaviors. Blank card jumps directly to next step, template cards open a preview. This critical UX difference was not documented.
3. **QA Adversary**: Step 2 footer in selection view has redundant buttons -- both "건너뛰기" skip and "건너뛰기" next button do the same thing. The spec mentions this but doesn't explain WHY (it's because the next action IS skipping when no template is selected).
4. **DevOps Engineer**: Toast notifications are used for every mutation (5 total mutation hooks) but the spec never mentions any feedback mechanism for success/error states.
5. **Information Architect**: The spec lists button states (disabled, pending text) inconsistently. Step 1 save shows "저장 중..." but Step 4 invite shows "초대 중..." -- good. But Step 2 apply and Step 5 complete pending states were documented, while Step 3 register "등록 중..." was not.
6. **Performance Expert**: No issues found with the post-fix spec. The query patterns and mutation patterns are correctly implied.
7. **Accessibility Expert (revisit)**: The `disabled:cursor-not-allowed` class appears in code FooterNav but was missing from the spec's footer description.

### Issues Summary

| # | Severity | Issue | Action |
|---|----------|-------|--------|
| 1 | Major | Dynamic provider schema API not documented | Fixed: added note about `/admin/api-keys/providers` endpoint |
| 2 | Major | Blank org card vs template card click behavior difference undocumented | Fixed: added explicit note about direct-skip vs preview behavior |
| 3 | Minor | Toast notification system not mentioned | Fixed: added UX consideration about toast notifications |
| 4 | Minor | `disabled:cursor-not-allowed` missing from footer nav spec | Fixed: added to footer nav button classes |
| 5 | Minor | Step 2 redundant skip buttons not explained | Fixed: clarified that both perform same action |

### Actions Taken
- Added note explaining dynamic credential field names from provider schema API
- Added explicit note that blank org card skips preview while template cards open preview
- Added "Toast notifications" bullet to UX Considerations section
- Added `disabled:cursor-not-allowed` to footer nav button spec
- Clarified Step 2 footer skip/next redundancy

### Score: 8/10 (PASS)
