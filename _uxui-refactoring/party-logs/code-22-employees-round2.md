# Round 2: Adversarial Review — 22-employees

## Expert Panel (Adversarial)
1. **Regression Hunter** — All features verified: search debounce, status filter, department filter, pagination, invite with password display, edit with departments, deactivate/reactivate toggle, password reset. Score: 10/10.
2. **API Contract Checker** — GET `/admin/employees?params`, GET `/admin/departments?companyId=`, POST `/admin/employees`, PUT `/admin/employees/{id}`, DELETE `/admin/employees/{id}`, POST `/admin/employees/{id}/reactivate`, POST `/admin/employees/{id}/reset-password`. All preserved. Score: 10/10.
3. **Password Security** — Clipboard API used for copy. Password shown in `<code>` with `select-all`. Warning about one-time visibility. `resetNameRef` pattern for tracking name across async mutation. Score: 10/10.
4. **Pagination Logic** — Ellipsis logic preserved identically from original. Page resets on filter/search changes. Correct range calculation. Score: 10/10.
5. **Filter Interaction** — `activeFilter` resets page. `departmentFilter` resets page. `debouncedSearch` resets page after 300ms. All via `setPage(1)`. Score: 10/10.
6. **Empty State Logic** — Checks `departmentFilter || debouncedSearch` for filtered vs unfiltered empty. Invite button only in unfiltered empty. Score: 10/10.
7. **Memory Cleanup** — `searchTimerRef` cleared on new input. No memory leaks from debounce. Score: 10/10.

## Crosstalk
- Password Security → Regression: "The `resetNameRef.current = resetPasswordTarget.name` pattern — same as original. Ensures name is captured before async call clears state."
- Pagination → Filter: "Confirmed all filter changes call `setPage(1)` before triggering refetch."

## Issues: None
## Verdict: **PASS** (10/10)
