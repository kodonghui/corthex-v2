---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests']
lastStep: 'step-03-generate-tests'
lastSaved: '2026-03-07'
story: '3-5-cost-recording-system-models-yaml'
---

# TEA Summary: Story 3-5 Cost Recording System

## Stack Detection
- Type: fullstack (monorepo)
- Test framework: bun:test
- Mode: BMad-Integrated

## Coverage Plan

### Risk Analysis
| Risk Area | Priority | Level | Tests |
|-----------|----------|-------|-------|
| Floating point precision (fractional pricing) | P0 | Unit | 6 |
| Batch discount accuracy (all models) | P0 | Unit | 9 |
| Cross-model pricing consistency | P0 | Unit | 6 |
| recordCost edge cases | P1 | Unit | 7 |
| microToUsd precision | P1 | Unit | 3 |
| models.yaml structure validation | P1 | Unit | 4 |
| Cost formula verification | P2 | Unit | 2 |

### Test Files Generated
- `packages/server/src/__tests__/unit/cost-recording-tea.test.ts` -- 37 tests

### Coverage Summary
- **Total TEA tests:** 37
- **Combined with dev tests:** 85 (40 dev + 37 TEA + 8 existing)
- **Regressions:** 0
- **All tests pass:** Yes

### Key Risks Covered
1. **Floating point precision** -- gemini-2.5-flash has 0.075 pricing which risks float errors
2. **Batch discount** -- 50% discount must be exact across all 6 models
3. **Cross-model ordering** -- expensive models must cost more than cheap ones
4. **Concurrent writes** -- 10 parallel recordCost calls must not interfere
5. **Unknown model fallback** -- defaults to anthropic provider + sonnet pricing
6. **Schema contract** -- all required DB fields present in insert
