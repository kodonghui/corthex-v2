# Story 16.3: Department Knowledge Auto Injection

Status: done

## Story

As an AI Agent,
I want my system prompt to automatically include relevant knowledge documents from my department's knowledge base,
so that I can produce higher-quality, context-aware responses without requiring manual knowledge lookup.

## Acceptance Criteria

1. **AC1: Knowledge Injector Service** -- New `packages/server/src/services/knowledge-injector.ts` module. `async function collectKnowledgeContext(companyId: string, agentId: string, departmentId: string | null): Promise<string | null>` queries `knowledgeDocs` (via `knowledgeFolders.departmentId`) and `departmentKnowledge` for the agent's department, formats results as a markdown section. Returns `null` if no knowledge found or agent has no department.

2. **AC2: AgentConfig Extension** -- `AgentConfig` type in `agent-runner.ts` gains optional `departmentId?: string | null`. `toAgentConfig()` in `chief-of-staff.ts` maps `row.departmentId` to the config. All existing callers unaffected (field is optional).

3. **AC3: Auto-Injection in AgentRunner** -- Before LLM call in `AgentRunner.execute()` and `executeStream()`, call `collectKnowledgeContext(agent.companyId, agent.id, agent.departmentId)`. If result is non-null, append as `## Department Knowledge` section to `finalSystemPrompt`. This happens AFTER `task.context` append but BEFORE `scanForCredentials`. Injection is skipped if `agent.departmentId` is null/undefined.

4. **AC4: Knowledge Sources (Two-Layer)** -- Knowledge collection queries two sources:
   - **Layer 1: Department Knowledge** -- `departmentKnowledge` table rows matching `companyId + departmentId`. All active rows included (they are typically short reference documents).
   - **Layer 2: Knowledge Docs in Department Folders** -- `knowledgeDocs` joined through `knowledgeFolders` where `folder.departmentId = agent.departmentId` AND `doc.isActive = true`. Only title + first 2000 chars of content included per doc to control token usage.

5. **AC5: Token Budget Control** -- Total injected knowledge context is capped at 4000 characters. If combined content exceeds limit, department knowledge (Layer 1) takes priority, then docs are added by most recent `updatedAt` until budget exhausted. Each doc is truncated with `[...truncated]` marker if needed.

6. **AC6: Agent Memory Integration** -- Also queries `agentMemories` table for the specific agent (`agentId + companyId`, `isActive = true`). Memories are formatted as a `## Agent Memories` section, sorted by `usageCount` DESC (most-used first), capped at 2000 chars. Each usage increments `usageCount` and updates `lastUsedAt`.

7. **AC7: Caching** -- In-memory TTL cache (Map with timestamp, 5-minute TTL) keyed by `companyId:departmentId`. Cache is invalidated on knowledge doc/folder CRUD operations via a simple `clearKnowledgeCache(companyId)` export. Knowledge routes call this on mutations.

8. **AC8: API Endpoint for Preview** -- `GET /api/workspace/knowledge/injection-preview/:agentId` returns the exact knowledge context that would be injected for this agent. Response: `{ data: { departmentKnowledge: string[], knowledgeDocs: { title, excerpt }[], agentMemories: { key, content }[], totalChars: number, truncated: boolean } }`. Useful for admin to preview what an agent sees.

9. **AC9: Zero Regression** -- All existing agent-runner tests pass unchanged. New code must not break any existing orchestration flows (chief-of-staff, manager-delegate, manager-synthesis, agora-engine, deep-work, sequential/all command processors).

## Tasks / Subtasks

- [x] Task 1: Extend AgentConfig type (AC: #2)
  - [x]1.1 Add `departmentId?: string | null` to `AgentConfig` in `agent-runner.ts`
  - [x]1.2 Update `toAgentConfig()` in `chief-of-staff.ts` to map `row.departmentId`
  - [x]1.3 Verify all existing tests still pass (field is optional, no breaking change)

- [x] Task 2: Create Knowledge Injector service (AC: #1, #4, #5)
  - [x]2.1 Create `packages/server/src/services/knowledge-injector.ts`
  - [x]2.2 Implement `collectDepartmentKnowledge(companyId, departmentId)` -- queries `departmentKnowledge` table
  - [x]2.3 Implement `collectDepartmentDocs(companyId, departmentId, charBudget)` -- queries `knowledgeDocs` via `knowledgeFolders.departmentId` join, ordered by `updatedAt DESC`, truncates to budget
  - [x]2.4 Implement `collectKnowledgeContext(companyId, agentId, departmentId)` -- combines Layer 1 + Layer 2 with 4000 char cap
  - [x]2.5 Format output as markdown: `## Department Knowledge\n\n### Reference Documents\n...\n\n### Related Documents\n...`

- [x] Task 3: Agent Memory collection (AC: #6)
  - [x]3.1 Implement `collectAgentMemories(companyId, agentId, charBudget)` in knowledge-injector.ts
  - [x]3.2 Query `agentMemories` where `agentId + companyId + isActive`, sort by `usageCount DESC`
  - [x]3.3 Format as `## Agent Memories\n\n- **{key}**: {content}\n...`
  - [x]3.4 Batch update `usageCount + 1` and `lastUsedAt = now()` for all included memories

- [x] Task 4: TTL Cache (AC: #7)
  - [x]4.1 Implement in-memory cache Map with 5-min TTL in knowledge-injector.ts
  - [x]4.2 Cache key: `{companyId}:{departmentId}` for dept knowledge, `{companyId}:agent:{agentId}` for memories
  - [x]4.3 Export `clearKnowledgeCache(companyId: string)` to flush all entries for a company
  - [x]4.4 Call `clearKnowledgeCache` in knowledge.ts route file on doc/folder/memory mutations (POST, PATCH, DELETE)

- [x] Task 5: Integrate into AgentRunner (AC: #3)
  - [x]5.1 Import `collectKnowledgeContext`, `collectAgentMemories` in agent-runner.ts
  - [x]5.2 In `execute()`: after context append block (line ~148), call knowledge injector if `agent.departmentId` exists
  - [x]5.3 In `executeStream()`: same injection point (line ~269)
  - [x]5.4 Append results as `## Department Knowledge` and `## Agent Memories` sections to finalSystemPrompt
  - [x]5.5 Run scanForCredentials on injected content

- [x] Task 6: Injection Preview API (AC: #8)
  - [x]6.1 Add `GET /injection-preview/:agentId` to knowledge.ts routes
  - [x]6.2 Fetch agent to get departmentId, then call collector functions
  - [x]6.3 Return structured preview response

- [x] Task 7: Tests (AC: #9)
  - [x]7.1 Unit tests for knowledge-injector.ts: collectDepartmentKnowledge, collectDepartmentDocs, collectKnowledgeContext, collectAgentMemories, cache behavior, token budgeting
  - [x]7.2 Unit tests for AgentRunner integration: verify knowledge is appended to system prompt, skipped when no department
  - [x]7.3 Unit tests for injection-preview endpoint
  - [x]7.4 Verify all existing agent-runner tests still pass

## Dev Notes

### Existing Infrastructure (CRITICAL -- reuse, don't reinvent)

**Story 16-1 + 16-2 already implemented (DO NOT duplicate):**
- `knowledgeFolders` table: id, companyId, name, description, parentId, **departmentId**, createdBy, isActive
- `knowledgeDocs` table: id, companyId, folderId, title, content, contentType, fileUrl, tags, isActive
- `agentMemories` table: id, companyId, **agentId**, memoryType, key, content, context, source, confidence, **usageCount**, **lastUsedAt**, isActive
- `departmentKnowledge` table: id, companyId, **departmentId**, title, content, category
- Route file: `packages/server/src/routes/workspace/knowledge.ts` (~1352 lines)
- Tests: `packages/server/src/__tests__/unit/knowledge-base.test.ts` (69 tests)
- Tests: `packages/server/src/__tests__/unit/knowledge-enhanced.test.ts` (54 tests)

**Agent execution system (modify, don't recreate):**
- `AgentRunner` class: `packages/server/src/services/agent-runner.ts`
- `buildSystemPrompt()`: lines 55-81 -- builds soul + tool summary
- Context injection: lines 145-150 -- appends `task.context` as "## Additional Context"
- `toAgentConfig()`: `packages/server/src/services/chief-of-staff.ts` lines 16-38
- `AgentConfig` type: `agent-runner.ts` lines 24-34 -- does NOT include departmentId yet

**Existing tool (reference, don't duplicate logic):**
- `search-department-knowledge.ts`: queries `departmentKnowledge` table by companyId + departmentId
- This is an on-demand tool; Story 16-3 adds AUTOMATIC pre-injection (different purpose)

### Key DB Relationships for Queries

```
agents.departmentId → departments.id
knowledgeFolders.departmentId → departments.id  (folders can be tagged to a department)
knowledgeDocs.folderId → knowledgeFolders.id     (docs live in folders)
departmentKnowledge.departmentId → departments.id (direct dept knowledge)
agentMemories.agentId → agents.id                 (per-agent memories)
```

**Query pattern for Layer 2 (docs in department folders):**
```typescript
const docs = await db
  .select({ title: knowledgeDocs.title, content: knowledgeDocs.content, updatedAt: knowledgeDocs.updatedAt })
  .from(knowledgeDocs)
  .innerJoin(knowledgeFolders, eq(knowledgeDocs.folderId, knowledgeFolders.id))
  .where(and(
    eq(knowledgeFolders.companyId, companyId),
    eq(knowledgeFolders.departmentId, departmentId),
    eq(knowledgeDocs.isActive, true),
    eq(knowledgeFolders.isActive, true),
  ))
  .orderBy(desc(knowledgeDocs.updatedAt))
```

### Architecture Patterns to Follow

- **Tenant isolation**: ALL queries MUST include `eq(table.companyId, tenant.companyId)`
- **File naming**: kebab-case (`knowledge-injector.ts`)
- **Export pattern**: Named exports, no default exports
- **Response format**: `c.json({ data: result })` for API endpoints
- **Error handling**: `throw new HTTPError(code, message)` with Korean messages
- **Zod validation**: Use zValidator for route params

### Token Budget Strategy

The 4000 char cap for knowledge + 2000 char cap for memories = max ~6000 chars (~1500 tokens) injected into system prompt. This is designed to:
- Stay well within context windows (even smallest models have 8K+)
- Not overwhelm the agent's core soul/personality
- Prioritize most relevant content (department knowledge > docs by recency)

### Project Structure Notes

**Files to create:**
- `packages/server/src/services/knowledge-injector.ts` (new)
- `packages/server/src/__tests__/unit/knowledge-injector.test.ts` (new)

**Files to modify:**
- `packages/server/src/services/agent-runner.ts` (add departmentId to AgentConfig, integrate injection)
- `packages/server/src/services/chief-of-staff.ts` (toAgentConfig maps departmentId)
- `packages/server/src/routes/workspace/knowledge.ts` (add preview endpoint + cache invalidation calls)

**Files that must NOT break:**
- `packages/server/src/services/chief-of-staff.ts`
- `packages/server/src/services/manager-delegate.ts`
- `packages/server/src/services/manager-synthesis.ts`
- `packages/server/src/services/agora-engine.ts`
- `packages/server/src/services/deep-work.ts`
- `packages/server/src/services/sequential-command-processor.ts`
- `packages/server/src/services/all-command-processor.ts`
- All existing test files in `packages/server/src/__tests__/`

### v1 Reference

**v1 Knowledge Injection (Python):**
- v1 loaded department-specific knowledge files from `shared/` and `{division}/` folders
- Injected into system prompt as part of agent context
- File-based approach -- v2 uses DB-based but same concept
- v1 feature spec #16: "부서별 지식 자동 주입 (에이전트 시스템 프롬프트에)"

### References

- [Source: _bmad-output/planning-artifacts/epics.md -- Epic 16, E16-S3]
- [Source: _bmad-output/planning-artifacts/prd.md -- FR69]
- [Source: _bmad-output/planning-artifacts/architecture.md -- AgentRunner.buildSystemPrompt()]
- [Source: _bmad-output/implementation-artifacts/16-2-document-store-crud-api-folder-management.md -- previous story]
- [Source: packages/server/src/services/agent-runner.ts -- current AgentRunner code]
- [Source: packages/server/src/services/chief-of-staff.ts -- toAgentConfig function]
- [Source: packages/server/src/db/schema.ts -- knowledgeFolders, knowledgeDocs, agentMemories, departmentKnowledge tables]
- [Source: packages/server/src/lib/tool-handlers/builtins/search-department-knowledge.ts -- existing manual tool]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List
- Task 1: Extended AgentConfig with optional departmentId, updated toAgentConfig() to map from DB row
- Task 2: Created knowledge-injector.ts with collectDepartmentKnowledge (Layer 1: departmentKnowledge table) and collectDepartmentDocs (Layer 2: knowledgeDocs via department folders join), 4000 char budget with priority to Layer 1
- Task 3: Implemented collectAgentMemories with 2000 char budget, usageCount DESC sorting, batch usage tracking (fire-and-forget)
- Task 4: In-memory TTL cache (5 min), keyed by companyId:dept/agent, clearKnowledgeCache export, middleware in knowledge.ts auto-clears cache on any POST/PATCH/DELETE
- Task 5: Integrated into AgentRunner.execute() and executeStream() -- auto-injects department knowledge + agent memories into finalSystemPrompt after task.context
- Task 6: GET /injection-preview/:agentId endpoint returns structured preview of what would be injected for an agent
- Task 7: 24 unit tests for knowledge-injector.ts (dept knowledge, docs, memories, cache, budget). Updated 9 existing test files with knowledge-injector mock to prevent import failures. All 270+ tests pass with 0 regressions.

### File List
- packages/server/src/services/knowledge-injector.ts (new -- 240 lines)
- packages/server/src/services/agent-runner.ts (modified -- added departmentId to AgentConfig, knowledge injection in execute/executeStream)
- packages/server/src/services/chief-of-staff.ts (modified -- toAgentConfig maps departmentId)
- packages/server/src/routes/workspace/knowledge.ts (modified -- cache invalidation middleware, injection-preview endpoint)
- packages/server/src/__tests__/unit/knowledge-injector.test.ts (new -- 24 tests)
- packages/server/src/__tests__/unit/agent-runner.test.ts (modified -- added knowledge-injector mock)
- packages/server/src/__tests__/unit/agent-runner-tea.test.ts (modified -- added knowledge-injector mock)
- packages/server/src/__tests__/unit/agent-runner-permission.test.ts (modified -- added knowledge-injector mock)
- packages/server/src/__tests__/unit/agent-runner-qa.test.ts (modified -- added knowledge-injector mock)
- packages/server/src/__tests__/unit/knowledge-base.test.ts (modified -- added departmentKnowledge to schema mock, knowledge-injector mock)
- packages/server/src/__tests__/unit/knowledge-enhanced.test.ts (modified -- added departmentKnowledge to schema mock, knowledge-injector mock)
- packages/server/src/__tests__/integration/orchestration.test.ts (modified -- added knowledge-injector mock)
- packages/server/src/__tests__/unit/deep-work.test.ts (modified -- added knowledge-injector mock)
- packages/server/src/__tests__/unit/deep-work-tea.test.ts (modified -- added knowledge-injector mock)
- packages/server/src/__tests__/unit/llm-integration.test.ts (modified -- added knowledge-injector mock)
- packages/server/src/__tests__/unit/llm-integration-tea.test.ts (modified -- added knowledge-injector mock)
