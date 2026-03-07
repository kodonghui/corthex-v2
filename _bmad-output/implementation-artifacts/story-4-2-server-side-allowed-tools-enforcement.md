# Story 4.2: Server-Side Allowed Tools Enforcement

Status: done

## Story

As a **system administrator**,
I want the server to enforce agent tool permissions before execution (not relying on agent self-restraint),
so that even prompt-injected or malfunctioning agents cannot use tools outside their allowed_tools list (NFR14 compliance).

## Acceptance Criteria

1. **AC1: AgentRunner pre-execution permission check** — When an agent's LLM response requests a tool call, AgentRunner checks `agent.allowedTools` BEFORE passing to ToolExecutor. Unauthorized tools are blocked immediately.
2. **AC2: Blocked tool returns error message** — When a tool is blocked, the agent receives a clear "TOOL_NOT_PERMITTED: {toolName} is not in your allowed tools" error message (not a generic error), preventing retry loops.
3. **AC3: Blocked tool calls are logged** — Every blocked tool call is recorded in `ToolCallRecord[]` with `error: "TOOL_NOT_PERMITTED"`, the tool name, and agent ID, for audit trail.
4. **AC4: LLM schema filtering (preventive layer)** — Only tools in `agent.allowedTools` are sent to the LLM as tool definitions. The LLM cannot even "see" unauthorized tools. This is the existing behavior via `getToolDefinitions(agent.allowedTools)` — verify it works correctly.
5. **AC5: Empty allowedTools means no tools** — If `agent.allowedTools` is empty or undefined, no tool definitions are sent to LLM and any tool call attempts are blocked.
6. **AC6: Wildcard support** — If `agent.allowedTools` contains `"*"`, all registered tools are permitted (for system agents like Chief of Staff).
7. **AC7: Streaming enforcement** — The `executeStream()` method applies identical permission checks as `execute()`.

## Tasks / Subtasks

- [x] Task 1: Create ToolPermissionGuard utility (AC: #1, #2, #3, #5, #6)
  - [x] 1.1: Create `packages/server/src/services/tool-permission-guard.ts`
  - [x] 1.2: Implement `checkPermission(agentAllowedTools: string[], toolName: string): {allowed: boolean, reason?: string}`
  - [x] 1.3: Handle wildcard `"*"` — returns allowed for any tool
  - [x] 1.4: Handle empty/undefined allowedTools — returns denied
  - [x] 1.5: Return structured error with `TOOL_NOT_PERMITTED` code

- [x] Task 2: Integrate guard into AgentRunner.executeToolCalls() (AC: #1, #2, #3, #7)
  - [x] 2.1: Add `agentAllowedTools` parameter to `executeToolCalls()` private method
  - [x] 2.2: Before each `toolExecutor(tc.name, tc.arguments)`, call `checkPermission()`
  - [x] 2.3: If denied → skip execution, record in `allToolRecords` with error, push error message to results
  - [x] 2.4: Pass `agent.allowedTools` from both `execute()` and `executeStream()` methods

- [x] Task 3: Verify LLM schema filtering (preventive layer) (AC: #4, #5)
  - [x] 3.1: Confirm `getToolDefinitions(agent.allowedTools)` already filters correctly
  - [x] 3.2: Add explicit test for empty allowedTools returning empty array
  - [x] 3.3: Confirm wildcard `"*"` case works with ToolDefinitionProvider

- [x] Task 4: Update ToolDefinitionProvider for wildcard support (AC: #6)
  - [x] 4.1: Modify `getToolDefinitions()` to handle `["*"]` — should return ALL registered tools
  - [x] 4.2: Add `getAllToolNames()` export to support wildcard resolution

- [x] Task 5: Unit tests (AC: all)
  - [x] 5.1: ToolPermissionGuard unit tests (permit, deny, wildcard, empty)
  - [x] 5.2: AgentRunner integration — tool blocked mid-loop
  - [x] 5.3: AgentRunner integration — mixed allowed/denied in same iteration
  - [x] 5.4: AgentRunner streaming — permission check in stream path
  - [x] 5.5: Edge cases — undefined allowedTools, null, tool not in registry

## Dev Notes

### Architecture Constraints

- **NFR14 (CRITICAL):** "allowed_tools 권한 검증은 서버 사이드에서 강제. 에이전트 응답이 아닌 서버에서 도구 호출 전 검증. 프롬프트 인젝션으로 에이전트가 조작되어도 권한 외 도구 차단"
- Architecture Decision #4: ToolPool invoke flow — step 1 is "권한 검증: agent.allowedTools에 toolName 포함? (서버 강제, NFR14)"
- **Dual permission layers** (match v1 pattern):
  1. **Preventive:** Filter tool schemas sent to LLM (already done by `getToolDefinitions`)
  2. **Defensive:** Check permission again at execution time (this story)

### v1 Reference Implementation

v1 implemented dual permission layers:
- **LLM layer** (`/home/ubuntu/CORTHEX_HQ/web/ai_handler.py:224-285`): `_build_tool_schemas()` filters by `allowed_tools` — only allowed tools sent to LLM
- **Execution layer** (`/home/ubuntu/CORTHEX_HQ/src/core/agent.py:235-241`): `use_tool()` checks `self.config.allowed_tools` before `tool_pool.invoke()`
- **Error** (`/home/ubuntu/CORTHEX_HQ/src/core/errors.py:24-32`): `ToolPermissionError(agent_id, tool_id)` with Korean message

### Existing Code to Modify

1. **`packages/server/src/services/agent-runner.ts`** — Main modification target
   - `executeToolCalls()` (line 306-334): Add permission check before each `toolExecutor()` call
   - `execute()` (line 113-213): Pass `agent.allowedTools` to `executeToolCalls()`
   - `executeStream()` (line 215-304): Pass `agent.allowedTools` to `executeToolCalls()`
   - `getToolDefinitions()` (line 105-108): Add wildcard support
   - `ToolDefinitionProvider` type (line 33): May need `getAllNames()` for wildcard

2. **NEW: `packages/server/src/services/tool-permission-guard.ts`** — Pure utility, no side effects

### Key Types (from @corthex/shared)

```typescript
type ToolExecutor = (toolName: string, args: Record<string, unknown>) => Promise<{ result: string } | { error: string }>
type ToolCallRecord = { name: string; arguments: Record<string, unknown>; result?: string; error?: string; durationMs: number }
type AgentConfig = { id: string; companyId: string; allowedTools: string[]; ... }
```

### Testing Standards

- Framework: `bun:test` (describe/it/expect/mock/spyOn)
- Existing test pattern: `packages/server/src/__tests__/unit/agent-runner.test.ts`
- Mock pattern: `mock.module('../../services/llm-router', ...)` for LLM
- Helper: `makeAgent()`, `makeContext()`, `makeResponse()` already exist
- Test file location: `packages/server/src/__tests__/unit/tool-permission-guard.test.ts` (new)
- Add integration tests to existing `agent-runner.test.ts`

### Anti-Patterns to AVOID

- Do NOT move permission check into ToolPool (ToolPool is Story 4-1, not yet implemented)
- Do NOT modify the `ToolExecutor` type signature — it's in shared package
- Do NOT add database calls — this is pure in-memory permission check
- Do NOT add HTTP middleware — permission check is inside AgentRunner
- Do NOT rely on LLM schema filtering alone — defensive layer is required (NFR14)
- Do NOT throw exceptions on permission denial — return error result like other tool errors

### Project Structure Notes

- File naming: kebab-case (`tool-permission-guard.ts`)
- No new npm dependencies needed
- Existing `AgentConfig.allowedTools: string[]` already defined
- `agents.allowedTools` in DB schema: `jsonb('allowed_tools').default([])`
- Import from `@corthex/shared` for types, not local re-definitions

### Dependencies

- **Story 4-1 (ToolPool):** NOT required for this story. Current code uses `ToolExecutor` callback pattern — permission guard wraps the executor call, not ToolPool.
- **Story 2-2 (Agent CRUD):** Done. `agents.allowedTools` field exists in schema and API.
- **Story 3-4 (AgentRunner):** Done. AgentRunner exists with `execute()` and `executeStream()`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — E4-S2 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Decision #4 Tool System]
- [Source: _bmad-output/planning-artifacts/prd.md — FR27, NFR14]
- [Source: packages/server/src/services/agent-runner.ts — current implementation]
- [Source: /home/ubuntu/CORTHEX_HQ/src/core/agent.py — v1 permission check]
- [Source: /home/ubuntu/CORTHEX_HQ/web/ai_handler.py — v1 schema filtering]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- All 113 agent-runner related tests pass (5 test files)
- 28 new tests added (15 guard + 13 integration)
- Pre-existing 451 failures unrelated (Story 4-1 schema WIP)

### Completion Notes List

- Created `tool-permission-guard.ts` — pure utility with `checkToolPermission()` and `hasWildcard()`
- Modified `agent-runner.ts` — integrated permission check in `executeToolCalls()`, added wildcard support in `getToolDefinitions()`, added `setToolNameProvider()` and `getAllToolNames()` exports
- Dual permission layers match v1 pattern: preventive (schema filtering) + defensive (execution-time check)
- NFR14 compliance: server-side enforcement before every tool execution, even if LLM is prompt-injected
- Blocked tools return `TOOL_NOT_PERMITTED` error with tool name (prevents retry loops)
- Blocked tools recorded in ToolCallRecord with durationMs=0 for audit trail
- Wildcard `"*"` support via `setToolNameProvider()` — ToolPool (Story 4-1) will register this

### File List

- `packages/server/src/services/tool-permission-guard.ts` (NEW)
- `packages/server/src/services/agent-runner.ts` (MODIFIED)
- `packages/server/src/__tests__/unit/tool-permission-guard.test.ts` (NEW)
- `packages/server/src/__tests__/unit/agent-runner-permission.test.ts` (NEW)
