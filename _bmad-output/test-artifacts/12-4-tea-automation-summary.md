---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests']
lastStep: 'step-03-generate-tests'
lastSaved: '2026-03-11'
story: '12.4'
title: 'A/B 품질 테스트 프레임워크'
---

# TEA Automation Summary — Story 12.4

## Preflight

- **Stack:** fullstack (bun:test)
- **Mode:** BMad-Integrated (Story 12.4 artifacts)
- **Framework:** bun:test (verified)
- **Playwright/Pact/Browser:** all disabled

## Risk Analysis

| Risk Area | Probability | Impact | Priority | Coverage |
|-----------|------------|--------|----------|----------|
| Delta calculation overflow/NaN | Medium | High | P0 | TEA test |
| Empty/malformed JSON snapshot | Medium | High | P0 | TEA test |
| Prompt-snapshot ID mismatch | Low | High | P1 | TEA test |
| Dry run data integrity | Medium | Medium | P1 | TEA test |
| Report file I/O errors | Low | Medium | P2 | TEA test |
| Category constants correctness | Low | Low | P2 | TEA test |

## Test Coverage

### Existing Tests (Story 12.4 dev)
- **File:** `packages/server/src/__tests__/unit/story-12-4-ab-quality-test.test.ts`
- **Tests:** 23 passing (59ms)
- **Coverage:** Prompt validation, comparison logic, snapshot format, dry-run pipeline

### TEA Risk Tests (new)
- **File:** `packages/server/src/__tests__/unit/story-12-4-ab-quality-tea.test.ts`
- **Tests:** 14 passing (98ms)
- **Coverage:**
  - Malformed snapshot handling (invalid path, negative values, large strings)
  - Prompt-snapshot alignment (no match, partial overlap, empty v2)
  - Summary edge cases (single result, rounding)
  - Report file I/O (directory creation)
  - Dry run data integrity (empty input, single input)
  - Category constants correctness

## Total: 37 tests, all passing
