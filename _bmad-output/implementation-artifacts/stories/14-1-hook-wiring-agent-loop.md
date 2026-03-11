# Story 14.1: Hook 5개 agent-loop.ts 연결
Status: backlog

## Story
As a platform operator,
I want all 5 engine hooks to be invoked during agent execution,
so that tool permissions are enforced, credentials are scrubbed, PII is redacted, handoffs are tracked, and costs are recorded.

## Context (from code audit 2026-03-11)
- `engine/agent-loop.ts` is the single entry point (D6) but calls ZERO hooks
- 5 hook files exist in `engine/hooks/` with correct signatures, but are never invoked
- This means: tool permission bypass, credential leaks, PII exposure, no cost tracking on new engine path

## Hook Files & Signatures

### Pre-tool hooks (before SDK processes a tool call):
1. `engine/hooks/tool-permission-guard.ts`
   - `toolPermissionGuard(ctx: SessionContext, toolName: string, toolInput: unknown): Promise<PreToolHookResult>`
   - Returns `{ allow: true }` or `{ allow: false, reason: ERROR_CODES.TOOL_PERMISSION_DENIED }`
   - Must be called BEFORE each tool execution

### Post-tool hooks (after tool output, in order):
2. `engine/hooks/credential-scrubber.ts`
   - `credentialScrubber(ctx: SessionContext, toolName: string, toolOutput: string): string`
   - Scrubs API keys, tokens from tool output
3. `engine/hooks/output-redactor.ts`
   - `outputRedactor(ctx: SessionContext, toolName: string, toolOutput: string): string`
   - Redacts Korean PII (email, phone, ID numbers)
4. `engine/hooks/delegation-tracker.ts`
   - `delegationTracker(ctx: SessionContext, toolName: string, toolOutput: string, toolInput?: unknown): string`
   - Emits HANDOFF event to EventBus when `call_agent` tool used

### Post-execution hook (after agent finishes):
5. `engine/hooks/cost-tracker.ts`
   - `costTracker(ctx: SessionContext, usage: UsageInfo): Promise<void>`
   - Inserts cost record to DB

## Acceptance Criteria
1. **Given** an agent executes a tool call, **When** `runAgent()` processes it, **Then** `toolPermissionGuard` is called before execution and blocks unauthorized tools
2. **Given** a tool returns output, **When** processed by post-tool hooks, **Then** credential-scrubber runs first, then output-redactor, then delegation-tracker (in that order)
3. **Given** `call_agent` tool is used, **When** delegation-tracker processes it, **Then** a HANDOFF SSE event is yielded AND an EventBus event is emitted
4. **Given** agent execution completes, **When** `runAgent()` finishes, **Then** `costTracker` is called with correct usage (inputTokens, outputTokens, model)
5. **Given** `toolPermissionGuard` returns `{ allow: false }`, **When** the tool is blocked, **Then** an error SSE event is yielded with the permission denied code
6. **Given** all hooks are wired, **When** `npx tsc --noEmit` runs, **Then** no type errors

## Tasks / Subtasks
- [ ] Task 1: Wire pre-tool hook into SDK tool execution flow (AC: #1, #5)
  - [ ] Import toolPermissionGuard in agent-loop.ts
  - [ ] Find SDK hook point for pre-tool validation (check @anthropic-ai/claude-agent-sdk API)
  - [ ] If SDK supports tool hooks: use SDK hook API
  - [ ] If SDK doesn't: wrap tool execution with guard check
  - [ ] Yield error SSE event on permission denied
- [ ] Task 2: Wire post-tool hooks in correct order (AC: #2, #3)
  - [ ] Import credentialScrubber, outputRedactor, delegationTracker
  - [ ] Apply post-tool chain: scrubber → redactor → tracker
  - [ ] For delegation-tracker: yield SSE `handoff` event when call_agent detected
- [ ] Task 3: Wire cost-tracker on completion (AC: #4)
  - [ ] Import costTracker and UsageInfo
  - [ ] Extract usage from SDK result (already partially done at lines 63-65)
  - [ ] Call costTracker in finally block
- [ ] Task 4: Type check + tests (AC: #6)
  - [ ] Run npx tsc --noEmit -p packages/server/tsconfig.json
  - [ ] Write unit tests for hook wiring

## Dev Notes
- agent-loop.ts is only 92 lines — keep it lean
- SDK is `@anthropic-ai/claude-agent-sdk` — check if it exposes tool hook callbacks
- Hook order matters: scrubber → redactor → tracker (delegation-tracker expects already-scrubbed data)
- costTracker is async — can fire-and-forget in finally block
- Do NOT modify hook implementation files — only wire them into agent-loop.ts
