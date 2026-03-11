---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests']
lastStep: 'step-03-generate-tests'
lastSaved: '2026-03-11'
inputDocuments:
  - _bmad-output/implementation-artifacts/4-6-epic-regression-test.md
  - packages/server/src/engine/types.ts
  - packages/server/src/engine/sse-adapter.ts
  - packages/server/src/engine/agent-loop.ts
  - packages/server/src/engine/soul-renderer.ts
  - packages/server/src/engine/model-selector.ts
  - packages/server/src/lib/event-bus.ts
---

# TEA: Story 4.6 — Epic 1~20 Regression Test Coverage

## Preflight

- **Stack**: fullstack (React + Bun/Hono)
- **Mode**: BMad-Integrated
- **Framework**: bun:test
- **Execution**: sequential

## Risk Coverage Matrix

| # | Risk Area | P | Impact | Prob | Tests | File | Status |
|---|-----------|---|--------|------|-------|------|--------|
| 1 | SSE format breaking frontend parsing | P0 | 5 | 3 | 9 | sse-format-regression.test.ts | COVERED |
| 2 | Engine types interface change | P0 | 5 | 2 | 4 | sse-format-regression.test.ts | COVERED |
| 3 | sseStream() generator regression | P0 | 4 | 3 | 2 | sse-format-regression.test.ts (TEA) | COVERED |
| 4 | Engine module public API surface | P0 | 5 | 2 | 5 | sse-format-regression.test.ts (TEA) | COVERED |
| 5 | EventBus channel integrity | P1 | 3 | 2 | 3 | sse-format-regression.test.ts | COVERED |
| 6 | AGORA API compatibility | P1 | 3 | 2 | 2 | sse-format-regression.test.ts | COVERED |
| 7 | Tool type definitions | P1 | 3 | 1 | 1 | sse-format-regression.test.ts | COVERED |
| 8 | model-selector tier mapping | P1 | 3 | 2 | 3 | sse-format-regression.test.ts (TEA) | COVERED |
| 9 | soul-renderer export | P1 | 3 | 1 | 1 | sse-format-regression.test.ts (TEA) | COVERED |

## Test Generation Summary

- **Existing tests**: 19 (from dev-story)
- **TEA additions**: 11 tests covering gaps:
  - sseStream() async generator integration (2)
  - Engine module exports: agent-loop (2), sse-adapter (1), soul-renderer (1), model-selector (1)
  - model-selector tier mapping (3)
  - graceful shutdown getActiveSessions export (1)
- **Total**: 30 regression tests

## Coverage Assessment

- **P0 risks**: 100% covered (SSE format, engine types, sseStream, module exports)
- **P1 risks**: 100% covered (EventBus, AGORA, tools, model-selector, soul-renderer)
- **No untested P0/P1 paths remain**

## Generated Test File

Added to: `packages/server/src/__tests__/integration/sse-format-regression.test.ts`
