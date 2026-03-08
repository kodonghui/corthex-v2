---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests']
lastStep: 'step-03-generate-tests'
lastSaved: '2026-03-08'
story: '9-4-employee-management-ui-admin-a4'
---

# TEA Summary: Story 9-4 Employee Management UI

## Stack & Framework
- Stack: fullstack (bun:test)
- Mode: BMad-Integrated
- Playwright: disabled, Pact: disabled

## Coverage Plan

| Target | Level | Priority | Tests |
|--------|-------|----------|-------|
| Query param building | Unit | P0 | 6 |
| Dept multi-select toggle | Unit | P0 | 7 |
| Pagination logic | Unit | P0 | 10 |
| Form validation | Unit | P1 | 8 |
| Edit form pre-fill | Unit | P1 | 5 |
| API error mapping | Unit | P1 | 3 |
| Filter combinatorics | Unit | P1 | 6 |
| State transitions | Unit | P2 | 3 |
| Password modal lifecycle | Unit | P2 | 4 |
| URL safety / XSS | Unit | P1 | 4 |
| Query key patterns | Unit | P2 | 4 |

## Test Files Generated
- `packages/admin/src/__tests__/employees.test.ts` — 39 tests (dev-story)
- `packages/admin/src/__tests__/employees-tea.test.ts` — 52 tests (TEA expansion)

## Results
- **Total**: 91 tests, 0 failures
- **All admin tests**: 157 pass, 0 fail
- **Risk coverage**: P0 100%, P1 100%, P2 100%
