# Story 4.1: ToolPool Registry + Zod Framework

Status: done

## Story

As a **system architect**,
I want **a ToolPool registry that manages tool registration, Zod parameter validation, execution, and result handling with auto-summarization**,
so that **all agent tool calls go through a single validated pipeline, enabling consistent execution, permission checks, and logging across the entire system**.

## Acceptance Criteria

1. **ToolDefinition interface**: `name`, `description`, `category` (finance/legal/marketing/tech/common), `parameters` (ZodSchema), `execute(params, context)` returns `Promise<ToolResult>`
2. **ToolPool.register(tool)**: Registers a tool by name. Duplicate registration throws error.
3. **ToolPool.execute(name, params, context)**: Zod validates params -> executes tool -> returns `ToolResult`. Invalid params return structured validation error.
4. **Result > 4000 chars auto-truncation**: Results exceeding 4000 characters are truncated with a summary suffix indicating truncation.
5. **ToolPool.getDefinitions(allowedTools)**: Returns `LLMToolDefinition[]` from registered tools, filtered by allowedTools list. Integrates with AgentRunner's `setToolDefinitionProvider`.
6. **ToolPool.createExecutor(agent)**: Returns a `ToolExecutor` function compatible with AgentRunner. Checks `agent.allowedTools` before execution (server-side enforcement).
7. **ToolContext**: Contains `companyId`, `agentId`, `agentName` for tenant isolation and audit trail.
8. **Error handling**: Tool execution errors are caught and returned as `{ error: string }`, never thrown to caller.

## Tasks / Subtasks

- [x] Task 1: Define types in `packages/shared/src/types.ts` (AC: #1, #7)
  - [x] 1.1 Add `ToolCategory` type: `'finance' | 'legal' | 'marketing' | 'tech' | 'common'`
  - [x] 1.2 Add `ToolContext` type: `{ companyId: string; agentId: string; agentName: string }`
  - [x] 1.3 Add `ToolResult` type: `{ success: true; result: string } | { success: false; error: string }`
  - [x] 1.4 Add `ToolRegistration` type: exported from `tool-pool.ts` (depends on Zod which is server-only)
  - [x] 1.5 Export all new types

- [x] Task 2: Create `packages/server/src/services/tool-pool.ts` (AC: #2, #3, #4, #5, #6, #8)
  - [x] 2.1 `ToolPool` class with `tools: Map<string, ToolRegistration>`
  - [x] 2.2 `register(tool: ToolRegistration)`: Add to map, throw on duplicate name
  - [x] 2.3 `execute(name, params, context)`: Lookup tool -> Zod parse params -> call tool.execute() -> truncate if > 4000 chars -> return ToolResult
  - [x] 2.4 `getDefinitions(allowedTools: string[])`: Convert Zod schemas to JSON Schema via `zodToJsonSchema`, return `LLMToolDefinition[]` filtered by allowedTools
  - [x] 2.5 `createExecutor(agent: { allowedTools: string[]; id: string; companyId: string; name: string })`: Return `ToolExecutor` that checks allowedTools before calling execute()
  - [x] 2.6 `has(name)`, `list()`, `listByCategory(category)` utility methods
  - [x] 2.7 `truncateResult(result: string, maxLength: number)`: Truncate with `...[truncated, original: N chars]` suffix

- [x] Task 3: Integrate with AgentRunner (AC: #5, #6)
  - [x] 3.1 Call `setToolDefinitionProvider()` with ToolPool's `getDefinitions` method
  - [x] 3.2 Create initialization function that wires ToolPool into AgentRunner on server startup

- [x] Task 4: Unit tests (AC: all)
  - [x] 4.1 Register tool and verify retrieval
  - [x] 4.2 Duplicate registration throws error
  - [x] 4.3 Execute with valid params returns result
  - [x] 4.4 Execute with invalid params returns Zod validation error
  - [x] 4.5 Execute unknown tool returns error
  - [x] 4.6 Result > 4000 chars is truncated
  - [x] 4.7 getDefinitions filters by allowedTools
  - [x] 4.8 createExecutor blocks tools not in allowedTools
  - [x] 4.9 createExecutor passes through to execute for allowed tools
  - [x] 4.10 Tool execution error caught and returned as ToolResult error
  - [x] 4.11 ToolContext correctly passed to tool execute function

## Dev Notes

### Architecture Compliance

- **File location**: `packages/server/src/services/tool-pool.ts` (per architecture decision #4)
- **Types location**: `packages/shared/src/types.ts` (extend existing file)
- **Test location**: `packages/server/src/__tests__/unit/tool-pool.test.ts`
- **Singleton pattern**: Export `toolPool` singleton instance (same pattern as `agentRunner`, `llmRouter`)
- **Naming**: kebab-case files, PascalCase classes, camelCase methods

### Integration Points

**AgentRunner (packages/server/src/services/agent-runner.ts)**:
- Line 93-103: Existing `toolDefinitionProvider` stub marked "Will be replaced by ToolPool (Epic 4)"
- Line 101: `setToolDefinitionProvider(provider)` -- call this with `toolPool.getDefinitions.bind(toolPool)`
- Line 117: `toolExecutor?: ToolExecutor` param -- `createExecutor()` produces this
- `ToolExecutor` type (shared/types.ts:230): `(toolName, args) => Promise<{result} | {error}>`

**Shared Types (packages/shared/src/types.ts)**:
- Line 171-175: `LLMToolDefinition` = `{ name, description, parameters: Record<string, unknown> }` -- getDefinitions must return this format
- Line 213-219: `ToolCallRecord` -- used by AgentRunner internally, no changes needed
- Line 230-233: `ToolExecutor` -- createExecutor must return this signature

### Zod to JSON Schema Conversion

- Use `zod-to-json-schema` npm package (well-maintained, 3M+ weekly downloads)
- Convert Zod schemas to JSON Schema format for `LLMToolDefinition.parameters`
- Import: `import { zodToJsonSchema } from 'zod-to-json-schema'`
- Usage: `zodToJsonSchema(tool.parameters, { target: 'openApi3' })` for broadest LLM compatibility

### Result Truncation Strategy

- Max result length: 4000 characters (architecture spec)
- Truncation format: `result.slice(0, 3900) + '\n\n...[truncated, original: ${result.length} chars]'`
- Leave ~100 chars for the truncation suffix
- This is NOT LLM summarization -- it's simple character truncation (summarization would require an LLM call, which is a separate concern for later)

### v1 Tool System Reference

- v1 source: `/home/ubuntu/CORTHEX_HQ/src/tools/` -- Python-based tools
- v1 config: `/home/ubuntu/CORTHEX_HQ/config/tools.yaml` -- YAML-based tool definitions with parameters
- v1 had 129 tools across 6 departments (CIO, CMO, CSO, CLO, ChiefOfStaff, Content)
- v1 4-category system: server-realtime (ARGOS), server-spawn, AI-direct, removed
- v2 simplifies to: ToolPool registry with category tags, server-side permission enforcement
- Key difference: v2 uses Zod for validation instead of YAML parameter schemas

### Existing Code Patterns to Follow

- **Service pattern**: See `llm-router.ts`, `agent-runner.ts` -- class with singleton export
- **Error handling**: Return structured errors, never throw to caller (see `ToolExecutor` type)
- **Test pattern**: See `packages/server/src/__tests__/unit/` -- bun:test with describe/it blocks
- **DB schema**: `agents.allowedTools` is `jsonb('allowed_tools').default([])` storing `string[]`

### Dependencies

- **npm**: `zod` (already in project), `zod-to-json-schema` (needs install)
- **Internal**: `@corthex/shared` types, `agent-runner.ts` integration
- **Prerequisite**: Epic 3 complete (AgentRunner exists) -- DONE

### What This Story Does NOT Include

- Individual tool implementations (Stories 4-3, 4-4)
- tool_invocations DB table / logging (Story 4-5)
- Admin UI for tool management (Story 4-6)
- Permission enforcement middleware in API routes (Story 4-2)

### Project Structure Notes

- Follows monorepo structure: shared types in `packages/shared`, service in `packages/server`
- No new API routes needed -- this is an internal service
- No new DB tables -- uses existing `agents.allowedTools` column

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#4. Tool System] -- ToolPool class design
- [Source: _bmad-output/planning-artifacts/epics.md#E4-S1] -- Story requirements
- [Source: packages/server/src/services/agent-runner.ts:93-103] -- Integration point
- [Source: packages/shared/src/types.ts:171-233] -- Existing LLM/Tool types
- [Source: packages/server/src/db/schema.ts:131] -- agents.allowedTools column

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None -- clean implementation, all 25 tests pass on first run.

### Completion Notes List

- ToolPool class: register, execute, getDefinitions, createExecutor, has, list, listByCategory
- Zod validation: safeParse for parameter validation, zodToJsonSchema for LLM definitions
- Result truncation: 4000 char max, 100 char suffix reserve
- Server-side permission: createExecutor checks agent.allowedTools before execution
- AgentRunner integration: initToolPool() wires getDefinitions via setToolDefinitionProvider
- 25 unit tests covering all ACs, 0 regressions in agent-runner tests (63 total pass)
- ToolRegistration type kept in server package (Zod dependency), ToolCategory/ToolContext/ToolResult in shared

### File List

- packages/shared/src/types.ts (modified -- added ToolCategory, ToolContext, ToolResult types)
- packages/server/src/services/tool-pool.ts (new -- ToolPool class + ToolRegistration type + singleton)
- packages/server/src/services/tool-pool-init.ts (new -- AgentRunner integration init)
- packages/server/src/index.ts (modified -- import + call initToolPool())
- packages/server/src/__tests__/unit/tool-pool.test.ts (new -- 25 tests)
- packages/server/package.json (modified -- added zod-to-json-schema dependency)
