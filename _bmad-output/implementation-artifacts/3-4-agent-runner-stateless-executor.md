# Story 3.4: AgentRunner 무상태 실행기

Status: done

## Story

As a **system (Orchestration Engine)**,
I want **a stateless AgentRunner that assembles system prompts from an agent's Soul markdown + allowed tool definitions, calls the LLM via the router, detects tool call responses, and returns structured execution results (content, toolsUsed, tokenCount, cost) -- all without exposing credentials in prompts**,
so that **any agent can be executed on-demand with full context, enabling the orchestration engine to delegate tasks to agents and receive structured results for synthesis and quality gating**.

## Acceptance Criteria

1. **buildSystemPrompt(agent)**: Assembles system prompt from agent's `soul` markdown + `allowedTools` definitions (tool name + description + parameter schema). Credential plaintext NEVER appears in the prompt (NFR11, FR47)
2. **execute(agent, task)**: Calls LLM via `llmRouter.call()` with the assembled system prompt, agent's resolved model, task messages, and tool definitions. Returns `TaskResponse` with `{content, toolCalls, toolResults, tokenCount, cost, model, provider}`
3. **Tool call loop**: When LLM response has `finishReason: 'tool_use'`, extract tool calls, execute them via a tool executor callback (ToolPool not yet built -- use injectable callback), feed results back to LLM, repeat until `finishReason: 'stop'` or max iterations (5)
4. **Max tool iterations**: Limit tool call rounds to 5 to prevent infinite loops. After 5 rounds, return whatever content is available with a warning
5. **Credential protection (NFR11)**: System prompt building must not include any API keys, secrets, or credential values. Tool execution handles credentials server-side
6. **Cost tracking**: Each LLM call within an execute() records cost via the router's built-in cost tracking. The final TaskResponse aggregates total tokens and cost across all iterations
7. **Stateless execution**: AgentRunner holds no state between calls. Each execute() is independent -- agent config is read from the passed agent object, not cached
8. **Error handling**: LLM errors propagate with full context (provider, model, error code). Tool execution errors are caught and fed back to LLM as error results (agent can retry or report)
9. **Streaming support**: `executeStream(agent, task)` yields chunks in real-time via `llmRouter.stream()`. Tool calls during streaming are handled by buffering the full response, executing tools, then continuing with a new streaming call
10. **Context assembly**: System prompt follows format: `[Soul Section]\n\n[Available Tools Section]\n\n[Additional Context]` where additional context can be injected via task.context

## Tasks / Subtasks

- [x] Task 1: Define TaskRequest/TaskResponse types (AC: #2, #6)
  - [x] 1.1 Add `TaskRequest` type to `@corthex/shared`: `{messages: LLMMessage[], context?: string, maxToolIterations?: number}`
  - [x] 1.2 Add `TaskResponse` type to `@corthex/shared`: `{content: string, toolCalls: ToolCallRecord[], usage: {inputTokens: number, outputTokens: number}, cost: {model: string, provider: LLMProviderName, estimatedCostMicro: number}, finishReason: string, iterations: number}`
  - [x] 1.3 Add `ToolCallRecord` type: `{name: string, arguments: Record<string, unknown>, result?: string, error?: string, durationMs: number}`
  - [x] 1.4 Add `ToolExecutor` callback type: `(toolName: string, args: Record<string, unknown>) => Promise<{result: string} | {error: string}>`

- [x] Task 2: Implement buildSystemPrompt (AC: #1, #5, #10)
  - [x] 2.1 Create `packages/server/src/services/agent-runner.ts`
  - [x] 2.2 `buildSystemPrompt(agent, toolDefs?)`: Concatenate agent.soul + formatted tool definitions section
  - [x] 2.3 Tool definitions format: markdown list with name + description for agent awareness
  - [x] 2.4 Credential scrubbing: scan assembled prompt for common patterns (sk-*, AIza*, Bearer *, API_KEY=*, SECRET=*, PRIVATE KEY) and throw if found
  - [x] 2.5 Handle null/empty soul gracefully (use a default minimal prompt)

- [x] Task 3: Implement execute() with tool call loop (AC: #2, #3, #4, #6, #8)
  - [x] 3.1 `execute(agent, task, context, toolExecutor?)`: Main execution method
  - [x] 3.2 Resolve model via `resolveModel({tier: agent.tier, modelName: agent.modelName})`
  - [x] 3.3 Build LLMRequest: `{model, systemPrompt, messages: task.messages, tools: toolDefs}`
  - [x] 3.4 Call `llmRouter.call(request, routerContext)` with proper LLMRouterContext
  - [x] 3.5 Tool call loop: if `response.finishReason === 'tool_use'`, execute each tool call via toolExecutor callback
  - [x] 3.6 Feed tool results back as assistant message (tool_use) + tool message (tool_result) and re-call LLM
  - [x] 3.7 Aggregate tokens/cost across all iterations
  - [x] 3.8 Max iteration guard: after 5 rounds, return partial result with warning in content
  - [x] 3.9 Tool execution errors: catch per-tool, return error string to LLM (let it handle gracefully)

- [x] Task 4: Implement executeStream() (AC: #9)
  - [x] 4.1 `executeStream(agent, task, context, toolExecutor?)`: Streaming execution
  - [x] 4.2 First call: stream via `llmRouter.stream()`, yield text chunks
  - [x] 4.3 If stream yields tool_call chunks: buffer them, execute tools after stream ends
  - [x] 4.4 After tool execution: start new stream with tool results appended to messages
  - [x] 4.5 Repeat until no more tool calls or max iterations reached
  - [x] 4.6 Yield a final 'done' chunk with aggregated usage

- [x] Task 5: Implement getToolDefinitions helper (AC: #1)
  - [x] 5.1 `getToolDefinitions(allowedTools: string[]): LLMToolDefinition[]` -- returns tool schemas for LLM
  - [x] 5.2 For now (ToolPool not yet built), return a stub that maps tool names to minimal definitions
  - [x] 5.3 Design for easy replacement when ToolPool (Epic 4) is implemented
  - [x] 5.4 Export as injectable function so ToolPool can register real definitions later via `setToolDefinitionProvider()`

- [x] Task 6: Unit tests (AC: all)
  - [x] 6.1 buildSystemPrompt: soul + tools assembled correctly
  - [x] 6.2 buildSystemPrompt: credential patterns detected and thrown (6 patterns tested)
  - [x] 6.3 buildSystemPrompt: null/empty/whitespace soul uses default
  - [x] 6.4 execute: simple call (no tools) returns TaskResponse
  - [x] 6.5 execute: tool call loop -- LLM requests tool -> executor runs -> result fed back -> LLM responds
  - [x] 6.6 execute: multi-round tool calls (2 rounds)
  - [x] 6.7 execute: max iterations (5) enforced, partial result returned
  - [x] 6.8 execute: tool execution error caught, fed back to LLM
  - [x] 6.9 execute: LLM error propagated correctly
  - [x] 6.10 execute: tokens/cost aggregated across iterations
  - [x] 6.11 execute: model resolved from agent tier
  - [x] 6.12 execute: model resolved from agent manual override
  - [x] 6.13 executeStream: text chunks yielded in real-time
  - [x] 6.14 executeStream: tool calls during stream handled correctly
  - [x] 6.15 credential scrubbing: various patterns detected
  - [x] 6.16 stateless: no state persisted between calls

## Dev Notes

### CRITICAL: Existing Code to Reuse (DO NOT recreate)

**Story 3-1 built these (LLM adapters):**
- `packages/server/src/lib/llm/types.ts` -- LLMProvider interface, ModelConfig, ModelsConfig
- `packages/server/src/lib/llm/index.ts` -- `createProvider(name, apiKey)` factory
- `packages/server/src/lib/llm/anthropic.ts` -- AnthropicAdapter
- `packages/server/src/lib/llm/openai.ts` -- OpenAIAdapter
- `packages/server/src/lib/llm/google.ts` -- GoogleAdapter
- `packages/server/src/config/models.yaml` -- model catalog with fallbackOrder + tierDefaults
- `packages/server/src/config/models.ts` -- `getModelConfig()`, `getTierDefaultModel()`, `getFallbackOrder()`, `getModelsByProvider()`

**Story 3-2 built these (LLM Router):**
- `packages/server/src/services/llm-router.ts` -- LLMRouter class with call(), stream(), fallback chain
- `resolveModel(agent)` -- resolves agent tier/modelName to actual model ID
- `resolveProvider(modelId)` -- maps model -> provider name
- `LLMRouterContext` type -- `{companyId, agentId?, agentName?, sessionId?, source}`

**Story 3-3 built these (Fallback):**
- `packages/server/src/lib/llm/circuit-breaker.ts` -- CircuitBreaker class
- `packages/server/src/config/models.ts` -- `getFallbackModels()`

**Cost tracking (already exists):**
- `packages/server/src/lib/cost-tracker.ts` -- `recordCost()`, `calculateCostMicro()`
- Cost recording is already done inside `llmRouter.call()` -- no need to duplicate

**Audit log system:**
- `packages/server/src/services/audit-log.ts` -- `createAuditLog()`, `AUDIT_ACTIONS`

**DB Schema (agents table):**
- `packages/server/src/db/schema.ts` line 115-137 -- agents table with:
  - `soul: text` -- markdown personality/expertise definition
  - `allowedTools: jsonb` -- string[] of allowed tool names
  - `tier: agentTierEnum` -- 'manager' | 'specialist' | 'worker'
  - `modelName: varchar` -- default 'claude-haiku-4-5', can be manually overridden
  - `isActive: boolean`, `isSystem: boolean`

**Shared types:**
- `packages/shared/src/types.ts`:
  - `LLMRequest = {model, messages, systemPrompt?, tools?, maxTokens?, temperature?}`
  - `LLMResponse = {content, toolCalls, usage, model, provider, finishReason}`
  - `LLMStreamChunk = {type, content?, toolCall?, usage?}`
  - `LLMToolDefinition = {name, description, parameters}`
  - `LLMToolCall = {id, name, arguments}`
  - `LLMMessage = {role, content, toolCalls?}`
  - `Agent = {id, companyId, userId, name, tier, modelName, soul, ...}`

### Architecture Compliance

**File locations (from architecture.md):**
- AgentRunner: `packages/server/src/services/agent-runner.ts` (services/ -- business logic service)
- Tests: `packages/server/src/__tests__/unit/agent-runner.test.ts`
- Shared types additions: `packages/shared/src/types.ts` (append TaskRequest/TaskResponse)

**Architecture Decision #2 (Agent Execution Model):**
```typescript
class AgentRunner {
  async execute(agent: Agent, task: TaskRequest): Promise<TaskResponse> {
    const systemPrompt = buildSystemPrompt(agent);  // soul + knowledge + tools
    const llmResponse = await llmRouter.call({
      model: agent.modelName,
      system: systemPrompt,
      messages: task.messages,
      tools: getToolDefinitions(agent.allowedTools),
    });
    // Tool call handling + cost recording + result return
  }
}
```

**Component boundaries:**
- `AgentRunner` depends on: `LLMRouter`, `ToolPool` (future -- use callback for now)
- `AgentRunner` is used by: `OrchestratorService` (Epic 5), `ChiefOfStaff` (Epic 5)

**Stateless pattern (Architecture #005 -- memory prohibition):**
- AgentRunner holds NO state between calls
- Agent configuration comes from the passed agent object (read from DB by caller)
- No caching of prompts, no session memory within the runner itself

### Tool Call Loop Design

```
execute(agent, task):
  systemPrompt = buildSystemPrompt(agent)
  model = resolveModel(agent)
  messages = [...task.messages]
  totalTokens = {input: 0, output: 0}
  toolRecords = []

  for iteration in 1..MAX_ITERATIONS:
    response = llmRouter.call({model, systemPrompt, messages, tools})
    totalTokens += response.usage

    if response.finishReason !== 'tool_use':
      return TaskResponse(response.content, toolRecords, totalTokens)

    for toolCall in response.toolCalls:
      result = await toolExecutor(toolCall.name, toolCall.arguments)
      toolRecords.push({...toolCall, result, durationMs})

    messages.push(assistantMessage with toolCalls)
    messages.push(userMessage with toolResults)

  return TaskResponse(partial content, toolRecords, totalTokens, warning: max iterations)
```

### Credential Protection Strategy (NFR11, FR47)

1. **System prompt**: Soul markdown is user-authored content -- scan for common credential patterns before including
2. **Tool definitions**: Only include tool name, description, parameter schema -- NEVER API keys
3. **Tool execution**: Credentials are injected server-side by ToolPool (future) -- AgentRunner never sees them
4. **Scanning patterns**: `sk-[a-zA-Z0-9]`, `AIza[a-zA-Z0-9]`, `Bearer [a-zA-Z0-9]`, explicit `API_KEY=`, `SECRET=`

### LLM Tool Call Message Format

When feeding tool results back to LLM, follow the standard format:
```typescript
// After receiving tool_use response:
messages.push({
  role: 'assistant',
  content: response.content,
  toolCalls: response.toolCalls,
})
messages.push({
  role: 'user',
  content: JSON.stringify(toolResults.map(r => ({
    tool_use_id: r.id,
    content: r.result ?? r.error,
  }))),
})
```

### Testing Strategy

- **Framework:** bun:test (NOT vitest, NOT jest)
- **Test file:** `packages/server/src/__tests__/unit/agent-runner.test.ts`
- **Mock pattern:** mock.module() for llm-router (mock llmRouter.call/stream), cost-tracker
- **Tool executor:** Use simple mock callback functions
- **Key scenarios:**
  - Simple text response (no tools)
  - Single-round tool call
  - Multi-round tool calls (2-3 rounds)
  - Max iterations enforcement
  - Tool execution failure handling
  - LLM error propagation
  - Credential scrubbing
  - Streaming with tool calls

### Anti-Pattern Prevention

1. **DO NOT** build a full ToolPool -- use injectable `ToolExecutor` callback (ToolPool is Epic 4)
2. **DO NOT** cache agent configurations or prompts between calls -- stateless
3. **DO NOT** include credentials in system prompts or tool definitions
4. **DO NOT** retry on tool execution failure -- feed error back to LLM and let it decide
5. **DO NOT** use vitest or jest -- use bun:test
6. **DO NOT** create new LLM types -- use @corthex/shared types
7. **DO NOT** duplicate cost recording -- llmRouter.call() already handles it
8. **DO NOT** make AgentRunner a singleton with state -- export as stateless class
9. **DO NOT** block on audit logging -- fire-and-forget pattern
10. **DO NOT** import from v1 code -- build fresh following v2 architecture

### Project Structure Notes

- `agent-runner.ts` goes in `services/` (business logic, not utility)
- Uses dependency injection for tool executor (callback parameter)
- Follows existing service patterns (llm-router.ts is the closest reference)
- New shared types appended to `packages/shared/src/types.ts`
- Test file in `__tests__/unit/` (not co-located)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#2. Agent Execution Model -- AgentRunner design]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Boundaries -- AgentRunner depends on LLMRouter, ToolPool]
- [Source: _bmad-output/planning-artifacts/epics.md#E3-S4 -- acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md#FR26 -- agent tool calls]
- [Source: _bmad-output/planning-artifacts/prd.md#FR47 -- credential prompt exposure prohibition]
- [Source: _bmad-output/planning-artifacts/prd.md#NFR11 -- credential plaintext in prompt prohibition]
- [Source: packages/server/src/services/llm-router.ts -- LLMRouter with call/stream/fallback]
- [Source: packages/server/src/lib/llm/types.ts -- LLMProvider interface]
- [Source: packages/shared/src/types.ts -- LLM types, Agent type]
- [Source: packages/server/src/db/schema.ts#115 -- agents table with soul, allowedTools, tier]
- [Source: packages/server/src/config/models.yaml -- model catalog]
- [Source: packages/server/src/lib/cost-tracker.ts -- calculateCostMicro]
- [Source: _bmad-output/implementation-artifacts/3-3-provider-fallback-strategy.md -- previous story learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- TaskRequest, TaskResponse, ToolCallRecord, ToolExecutor types added to @corthex/shared
- AgentRunner class: stateless executor with execute() and executeStream() methods
- buildSystemPrompt(): assembles soul markdown + tool awareness section, credential scrubbing (6 patterns)
- Tool call loop: iterates up to 5 rounds (configurable), feeds tool results back to LLM as tool messages
- Tool execution errors caught per-tool, fed back to LLM as error strings (agent decides how to handle)
- executeStream(): streams text chunks in real-time, buffers tool calls, executes tools between stream rounds
- getToolDefinitions(): stub provider with setToolDefinitionProvider() injectable for Epic 4 ToolPool
- Credential protection (NFR11): scans for sk-*, AIza*, Bearer, API_KEY=, SECRET=, PRIVATE KEY patterns
- Cost tracking: leverages llmRouter's built-in cost recording, aggregates calculateCostMicro for TaskResponse
- 38 unit tests passing, 79 related tests (llm-router, provider-fallback, cost-tracker) passing, 0 regressions
- Code review: fixed iterations count bug (was using tool records length instead of actual loop count)
- TEA: 26 risk-based tests added (P0: multi-tool, duration; P1: edge cases, credential scrubbing; P2: boundaries, streaming, concurrency)
- QA: 21 acceptance-criteria verification tests added (all 10 ACs covered)
- Total: 85 tests across 3 files

### File List

- packages/shared/src/types.ts (MODIFIED -- added TaskRequest, TaskResponse, ToolCallRecord, ToolExecutor types)
- packages/server/src/services/agent-runner.ts (NEW -- AgentRunner class, buildSystemPrompt, getToolDefinitions)
- packages/server/src/__tests__/unit/agent-runner.test.ts (NEW -- 38 dev tests)
- packages/server/src/__tests__/unit/agent-runner-tea.test.ts (NEW -- 26 TEA risk-based tests)
- packages/server/src/__tests__/unit/agent-runner-qa.test.ts (NEW -- 21 QA AC verification tests)
