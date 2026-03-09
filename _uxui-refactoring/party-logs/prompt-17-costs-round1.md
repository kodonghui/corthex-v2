# Party Mode Round 1 (Collaborative) — 17-costs

## Experts: Mary (Analyst), Sally (UX), John (PM), Quinn (QA), Winston (Architect)

### Discussion

- **Mary** (📊): "Data coverage is thorough. The prompt covers dashboard/costs (summary with byModel, byAgent, bySource), dashboard/budget (monthly budget + projections + by department), dashboard/costs/by-agent (detailed with date range), and dashboard/costs/daily (time series). All four workspace endpoints are represented."
- **Sally** (🎨): "Budget warning states and projected spending callouts are excellent UX considerations. The CEO-focused framing ('quick answers') is spot on. One concern: 'visual emphasis — not just numbers' for budget warnings is borderline prescriptive. Should soften to 'communicate urgency clearly.'"
- **John** (📋): "8 user actions — appropriate scope. The period selector (7/14/30 days) matches the backend `days` parameter. The custom date range for detailed agent costs matches the `startDate/endDate` params on `/dashboard/costs/by-agent`."
- **Quinn** (🧪): "Edge case: Employee department scoping. The backend has `departmentScopeMiddleware` that filters costs to employee's departments. Prompt correctly notes this behavior. Also, when `departmentIds` is empty array, backend returns zero data — prompt says 'hide data that's not available.' Good."
- **Winston** (🏗️): "Checking for visual prescriptions: 'sorting by cost descending by default' is behavioral, not visual — acceptable. 'Summary cards should stack vertically' — this is a layout instruction! Should remove."

### Issues Found (2)
1. **'Summary cards should stack vertically' on mobile** — prescriptive layout instruction
2. **'Visual emphasis' for budget warnings** — borderline prescriptive

### Fixes Applied
1. Changed mobile layout to "Summary and breakdowns should remain readable on narrow screens"
2. Changed budget warning to "communicate urgency clearly"

### Verdict: PASS (8/10, fixes applied, moving to Round 2)
