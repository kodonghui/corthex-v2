# Party Mode Round 3: Forensic Review
## Prompt 41 — Settings Admin (회사 설정)

### Expert Panel

1. **API Documentation Specialist**: The spec doesn't list the API endpoints used. Source code calls 7 distinct endpoints. Added an "API Endpoints Used" section for completeness.

2. **UX Copywriter**: Toast messages are mentioned generically ("success/error feedback via toast") but the exact messages are not documented. Source has specific Korean messages like "API 키가 등록되었습니다". Added specific toast messages.

3. **State Management Reviewer**: Scope is always hardcoded to `'company'` in the add mutation (line 208). The spec shows a scope badge on existing keys but doesn't clarify that new keys always get company scope from this page. This could confuse a designer into adding a scope selector. Clarified.

4. **Visual QA**: Verified all color classes line-by-line against source:
   - Card backgrounds: PASS (bg-white dark:bg-zinc-900)
   - Buttons: PASS (indigo-600)
   - Status badges: PASS (green-100/900, red-100/900)
   - Rotate form: PASS (amber-50/900)
   - Key rows: PASS (zinc-50 dark:bg-zinc-800/50)
   - All text colors: PASS

5. **Completeness Auditor**: Cross-referenced every UI element in source with spec:
   - Header (h1 + p): PASS
   - CompanyInfoSection fields (4): PASS
   - ApiKeySection (add form, rotate form, key list, delete dialog): PASS
   - DefaultSettingsSection (timezone, LLM model): PASS
   - Loading/empty/error states (3): PASS
   - No missing UI elements found.

6. **Interaction Designer**: All user actions are documented. Cancel behaviors, dirty tracking, form resets are all covered after Round 2 fixes.

7. **Accessibility Expert**: Form inputs have labels, disabled states are documented, focus styles (ring-2 ring-indigo-500) are specified. Adequate for wireframe purposes.

### Issues Summary

| # | Severity | Issue | Action |
|---|----------|-------|--------|
| 1 | Minor | No API endpoints section | Added 7 endpoints |
| 2 | Minor | Toast messages not specific | Added exact Korean messages |
| 3 | Minor | Hardcoded scope='company' not documented | Added note in UX Considerations |

### Actions Taken
- Added "API Endpoints Used" section with all 7 endpoints
- Added specific toast message strings to UX Considerations
- Added note about hardcoded company scope and form reset behavior

### Final Score: 9/10 (PASS)
After 3 rounds of review and fixes, the spec is comprehensive and accurately reflects the source code. All color classes match, all UI elements are documented, interaction states are specified, and edge cases (loading, empty, error) are covered. The remaining 0.5-point gap is for minor stylistic preferences (some class orderings differ from source but are functionally equivalent).

### Summary of All Changes Across 3 Rounds
| Round | Issues Found | Critical | Major | Minor | Score |
|-------|-------------|----------|-------|-------|-------|
| R1 Collaborative | 11 | 2 | 5 | 4 | 5/10 FAIL |
| R2 Adversarial | 4 | 0 | 1 | 3 | 8/10 PASS |
| R3 Forensic | 3 | 0 | 0 | 3 | 9/10 PASS |
| **Total** | **18** | **2** | **6** | **10** | **PASS** |
