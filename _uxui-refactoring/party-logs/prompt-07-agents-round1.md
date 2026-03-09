# Party Mode Round 1 (Collaborative) — 07-agents

## Experts: Mary (Analyst), Sally (UX), John (PM), Quinn (QA), Winston (Architect)

### Discussion

- **Mary** (📊): "Data model thoroughly covered. Tier-model coupling well described. However, `isSecretary` field not mentioned — should secretary agents be flagged? Also `nameEn` exists but not in prompt."
- **Sally** (🎨): "Soul editor split view detail is excellent UX. Agree on `isSecretary`. `autoLearn` toggle exists in schema but not in current page code — shouldn't invent features."
- **John** (📋): "`reportTo` field exists but current page doesn't expose it. Should explicitly exclude. *Agrees with Sally* — only describe what exists in v2 code."
- **Quinn** (🧪): "Edge case: what if no company selected? Code has 'select company' fallback. Prompt should mention this prerequisite."
- **Sally** (🎨): "Good catch Quinn — 'company not selected' state should be in UX considerations."

### Issues Found (2)
1. **Missing "company not selected" state** — prerequisite not in UX considerations
2. **`isSecretary` field not mentioned** — should clarify presence or exclusion

### Fixes Applied
1. Added `isSecretary` as informational field in Data Displayed section
2. Added "Company selection prerequisite" to UX Considerations

### Verdict: PASS (fixes applied, moving to Round 2)
