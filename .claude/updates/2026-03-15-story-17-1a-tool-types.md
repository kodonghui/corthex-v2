# Story 17.1a: Tool Types, Engine Enforcement & callExternalApi Utility

**Date:** 2026-03-15
**Worker:** swarm-worker-2

## What Changed

### New Files
- `packages/server/src/lib/tool-error.ts` — ToolError class (E13, D3)
  - `code: string`, `message: string`, `details?: Record<string, unknown>`
  - All built-in tool handlers must throw ToolError, never generic Error
- `packages/server/src/lib/call-external-api.ts` — E16 External API Typed Error Pattern
  - `callExternalApi<T>(serviceName, fn)` adapter
  - 401/403 → TOOL_CREDENTIAL_INVALID, 429 → TOOL_QUOTA_EXHAUSTED, 5xx → TOOL_EXTERNAL_SERVICE_ERROR
- `packages/server/src/__tests__/unit/call-external-api.test.ts` — 20 tests for E16

### Modified Files
- `engine/types.ts` — Added `runId: string` to SessionContext (E17), added `ToolCallContext`, `BuiltinToolHandler` interfaces
- `engine/index.ts` — Exported new types ToolCallContext, BuiltinToolHandler
- `engine/hooks/tool-permission-guard.ts` — FR-TA3: null/empty allowedTools = TOOL_NOT_ALLOWED (not allow-all)
- `engine/agent-loop.ts` — generateRunId() at session start; TOOL_NOT_ALLOWED format for blocked tools
- All SessionContext creation sites — Added `runId: crypto.randomUUID()` (~8 files)
- All test files — Updated to include `runId` in SessionContext objects

## Why
FR-TA3 engine-level TOOL_NOT_ALLOWED enforcement. E13 BuiltinToolHandler interface.
E16 callExternalApi typed error pattern foundation.
All 17.2+ tool handler stories depend on this story.

## Key Decisions
- `runId: string` added as REQUIRED field in SessionContext (not optional) for type safety
- tool-permission-guard behavior changed: null/empty allowedTools = TOOL_NOT_ALLOWED (breaking existing behavior but correct per FR-TA3)
- Pre-existing hook-pipeline test failure NOT caused by our changes (delegation tracker event issue)

## Test Results
- 66 tests pass across story-specific test files
- tsc: 0 errors
