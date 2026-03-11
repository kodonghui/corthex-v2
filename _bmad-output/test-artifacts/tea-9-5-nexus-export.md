---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests', 'step-04-validate-and-summarize']
lastStep: 'step-04-validate-and-summarize'
lastSaved: '2026-03-11'
story: '9.5'
storyTitle: 'NEXUS 내보내기 + 인쇄'
---

# TEA Automation Summary: Story 9.5 — NEXUS 내보내기 + 인쇄

## Preflight
- Stack: fullstack (bun:test)
- Mode: BMad-Integrated (story file provided)
- Framework: bun:test (existing)
- Playwright/Pact: disabled

## Coverage Plan

| Risk Area | Level | Priority | Tests |
|-----------|-------|----------|-------|
| Filename sanitization boundaries | Unit | P0 | 9 |
| Export filter robustness (SVG className) | Unit | P0 | 10 |
| JSON export edge cases (large org, special chars) | Unit | P1 | 4 |
| Download trigger safety | Unit | P1 | 4 |
| Print CSS isolation rules | Unit | P1 | 4 |
| Toolbar dropdown edge cases | Unit | P1 | 5 |
| Export configuration options | Unit | P2 | 6 |
| Date consistency in filenames | Unit | P2 | 3 |
| **Total** | | | **51** |

## Files Created
- `packages/server/src/__tests__/unit/story-9-5-nexus-export-tea.test.ts` — 51 TEA tests (8 risk groups)

## Key Risk Coverage
- **R1 (P0)**: Path traversal, XSS, unicode, newlines in company names — prevents filename injection
- **R2 (P0)**: SVGAnimatedString className handling — prevents SVG elements being incorrectly filtered
- **R3 (P1)**: 150-agent org, special chars, null preservation — validates data integrity at scale
- **R4 (P1)**: Blob lifecycle, large payload handling — validates download mechanism
- **R5 (P1)**: Print CSS selector validation — ensures correct elements hidden/shown in print
- **R6 (P1)**: Rapid toggle, concurrent export state — prevents UI race conditions
- **R7 (P2)**: Export config validation (pixelRatio, background, filter) — config correctness
- **R8 (P2)**: Date format, cross-format consistency — filename predictability

## Test Results
- 51 tests, 0 failures, 79 assertions
- Combined with dev tests: **95 total tests** (44 dev + 51 TEA)

## Risks & Assumptions
- html-to-image toPng/toSvg error handling relies on try/catch in nexus.tsx handlers (tested via state management)
- Print CSS rules validated structurally (not via browser rendering)
- Large org JSON test validates serialization fidelity up to 150 agents
