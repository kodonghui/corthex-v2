---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests', 'step-04-validate-and-summarize']
lastStep: 'step-04-validate-and-summarize'
lastSaved: '2026-03-08'
story: '14-6-status-bar-data-ai-ok-ng-cost'
---

# TEA Summary — Story 14-6: Status Bar Data AI OK/NG Cost

## Stack & Framework
- Stack: fullstack (bun:test)
- Mode: BMad-Integrated
- Test Framework: bun:test (packages/server)

## Coverage Plan

| AC | Test Level | Priority | Tests |
|----|-----------|----------|-------|
| AC1: dataOk 실제 헬스체크 | Unit | P0 | 8 base + 6 TEA |
| AC2: aiOk 강화 | Unit | P0 | 6 base + 5 TEA |
| AC3: todayCost 확장 | Unit | P1 | 5 base + 3 TEA |
| AC4: lastCheckAt 정확도 | Unit | P1 | 5 base + 2 TEA |
| AC5: 응답 확장 | Unit | P1 | 4 base + 4 TEA |
| AC6: 유닛 테스트 | Meta | - | Covered above |

## Test Files

| File | Tests | Priority | Status |
|------|-------|----------|--------|
| `argos-status.test.ts` | 31 | P0-P1 | ✅ PASS |
| `argos-status-tea.test.ts` | 20 | P0-P2 | ✅ PASS |
| **Total** | **51** | | **All pass** |

## Risk Coverage

### P0 (Critical)
- dataOk/aiOk interaction: both false when ratio ≥50% but count < 3
- Exact threshold boundaries (2 vs 3 failures, 49% vs 50%)
- Single event/failure edge case

### P1 (Important)
- Cost precision and breakdown consistency
- LastCheckAt equal timestamps
- Reason string formatting quality

### P2 (Edge)
- High volume (10K events, 100 triggers)
- Zero triggers with residual events

## Regression Impact
- Modified: `argos-service.test.ts` (added costRecords mock) — 44 tests still pass
- Modified: `argos-tea.test.ts` (added costRecords mock) — 49 tests still pass
- No regressions in LLM, deep-work, knowledge-base tests
