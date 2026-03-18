# Known Behaviors — NOT Bugs

These are intentional behaviors. Do NOT report them as bugs.
Agents: check this list BEFORE reporting. If behavior matches a KB entry, skip it.
Only report if the "When it IS a bug" condition is met.

---

## KB-001: Empty Dashboard (Fresh Company)
- **Page**: /admin/dashboard
- **Behavior**: All stat cards show 0, activity table is empty
- **Reason**: No agents/departments created yet. Correct empty state.
- **When it IS a bug**: Stat cards are missing entirely (not just showing 0), or page crashes

## KB-002: localStorage Contains JSON Blobs
- **Page**: Any (browser DevTools > Application > localStorage)
- **Behavior**: Keys like `zustand-admin-store` contain JSON with tokens, settings
- **Reason**: Zustand persist middleware stores state in localStorage. Standard behavior.
- **When it IS a bug**: Raw password or API secret key appears in localStorage values

## KB-003: org-chart Returns 404 When No Layout Saved
- **Page**: /admin/nexus
- **API**: /api/admin/org-chart → 404
- **Reason**: No NEXUS layout document exists yet. Frontend handles gracefully with empty canvas.
- **When it IS a bug**: 500 error, or frontend shows error/crash instead of empty canvas

## KB-004: React Flow Console Warning
- **Page**: Various (especially NEXUS pages with React Flow)
- **Behavior**: Yellow console warning "React does not recognize the X prop"
- **Reason**: React Flow passes custom props that trigger this harmless warning.
- **When it IS a bug**: Red ERROR (not yellow WARNING)

## KB-005: Monitoring Shows "No Data"
- **Page**: /admin/monitoring
- **Behavior**: Status cards show no active agents
- **Reason**: No engine tasks currently running. Correct idle state.
- **When it IS a bug**: Page crashes or shows spinner indefinitely (>10s)

## KB-006: Costs Show $0.00 Across All Cards
- **Page**: /admin/costs
- **Behavior**: All cost metrics are $0.00
- **Reason**: No AI operations have been run. Correct zero state.
- **When it IS a bug**: Shows "$$0" (double dollar sign), NaN, or undefined

## KB-007: Company Selector Shows Single Company
- **Page**: Sidebar company dropdown
- **Behavior**: Only one company in the list
- **Reason**: Only one company has been created. Dropdown is still functional.
- **When it IS a bug**: Dropdown doesn't open at all, or shows empty list when companies exist

## KB-008: Onboarding Page Shows After Login
- **Page**: /admin/onboarding
- **Behavior**: Redirects to onboarding if company has no departments/agents
- **Reason**: Intentional first-run experience for new companies.
- **When it IS a bug**: Completing onboarding → redirected BACK to onboarding (infinite loop)

---

_Last reviewed: 2026-03-18. Review and update when major features ship._
