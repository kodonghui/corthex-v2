---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests', 'step-04-validate-and-summarize']
lastStep: 'step-04-validate-and-summarize'
lastSaved: '2026-03-08'
story: '9-6-admin-ceo-app-switching'
---

# TEA Summary: Story 9-6 Admin ↔ CEO App Switching

## Stack & Mode
- Stack: fullstack TypeScript (Turborepo monorepo)
- Test framework: bun:test
- Mode: BMad-Integrated
- Execution: Auto (YOLO)

## Risk Analysis

| Risk Area | Severity | Tests Added |
|-----------|----------|-------------|
| Shared type contracts | Medium | 4 |
| Email-based cross-table matching | High | 4 |
| Role mapping correctness | High | 4 |
| JWT token structure | High | 4 |
| Security guardrails | Critical | 6 |
| Button visibility logic | Medium | 7 |
| localStorage key isolation | High | 3 |
| Error code consistency | Low | 2 |
| Navigation flow | Medium | 4 |
| Zod schema validation | Medium | 3 |

## Coverage Summary

| Test File | Tests | Status |
|-----------|-------|--------|
| app-switching.test.ts (dev) | 52 | PASS |
| app-switching-tea.test.ts (TEA) | 40 | PASS |
| **Total** | **92** | **ALL PASS** |

## Key Findings
- Email matching logic between admin_users and users tables is correctly implemented with null-safe checks
- JWT token structure differs correctly between admin and CEO tokens (type: 'admin' present only in admin JWT)
- localStorage keys are properly isolated — no cross-contamination between apps
- All 4 SWITCH_XXX error codes are sequential and consistent
- Security: authMiddleware required on both endpoints, DB validation over JWT-only trust

## Files
- `packages/server/src/__tests__/unit/app-switching-tea.test.ts` (new — 40 tests)
