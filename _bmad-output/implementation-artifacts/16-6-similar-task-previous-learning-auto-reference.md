# Story 16.6: Similar Task Previous Learning Auto Reference (유사 작업 이전 학습 자동 참고)

Status: done

## Story

As an AI Agent,
I want the system to automatically find and inject relevant past learning memories when I receive a task similar to one I've handled before,
so that I can produce higher-quality results by building on proven experience instead of starting from scratch every time.

## Acceptance Criteria

1. **AC1: Task Keyword Extraction** -- Create a `extractTaskKeywords(taskDescription: string): string[]` utility in `memory-extractor.ts`. Extracts 5-10 meaningful keywords from the task description by: (1) removing Korean particles/stopwords (은/는/이/가/을/를/에/의/로/와/과/도/만/에서/까지/부터), (2) removing common English stopwords (the/is/a/an/to/for/of/in/on/at/by/with), (3) splitting on whitespace/punctuation, (4) filtering tokens < 2 chars, (5) deduplicating. Returns array of lowercase keywords. No LLM call needed -- pure string processing.

2. **AC2: Context Field Population** -- Modify `extractAndSaveMemories()` in `memory-extractor.ts` to populate the `context` field of each saved memory. Set `context = extractTaskKeywords(taskDescription).join('\n')`. This stores the task context that produced the memory, enabling future similarity matching. Existing memories with NULL context remain valid (treated as no-context).

3. **AC3: Similarity Scoring Function** -- Create `calculateSimilarity(taskKeywords: string[], memoryContext: string | null): number` in `knowledge-injector.ts`. Returns a score between 0.0 and 1.0. Algorithm: (1) if memoryContext is null/empty, return 0, (2) split memoryContext by newlines to get memory keywords, (3) compute Jaccard similarity = |intersection| / |union| of the two keyword sets, (4) boost score by 0.1 if any keyword is an exact substring match in the other set (capped at 1.0). This is O(n*m) where n,m are keyword counts (typically < 15 each).

4. **AC4: Similarity-Based Memory Collection** -- Create `collectSimilarMemories(companyId: string, agentId: string, taskDescription: string, charBudget: number): Promise<string>` in `knowledge-injector.ts`. Flow: (1) extract keywords from taskDescription, (2) fetch ALL active memories for the agent from DB (same query as existing `collectAgentMemories`), (3) score each memory using `calculateSimilarity()`, (4) filter memories with score >= 0.2 (20% threshold), (5) sort by similarity score DESC (tie-break by usageCount DESC), (6) format matching memories as `\n### 관련 학습 기억 (유사도 기반)\n\n` + each memory as `- **[key]** (유사도: {score}%): {content}\n`, (7) truncate to charBudget, (8) increment `usageCount` and update `lastUsedAt` for all matched memories (fire-and-forget). If no memories match threshold, return empty string.

5. **AC5: Integration into Knowledge Injector** -- Modify `collectAgentMemoryContext()` in `knowledge-injector.ts` to accept optional `taskDescription?: string` parameter. When taskDescription is provided AND non-empty: call `collectSimilarMemories()` instead of `collectAgentMemories()`. When taskDescription is not provided: fall back to existing behavior (all memories sorted by usageCount). This is backward-compatible -- no existing callers break.

6. **AC6: Integration into AgentRunner** -- Modify `execute()` and `executeStream()` in `agent-runner.ts` to pass the task description when calling `collectAgentMemoryContext()`. Extract from `task.messages[0]?.content` (the user message). If messages array is empty or first message has no string content, pass undefined (falls back to existing behavior). This enables similarity-based memory injection for every agent execution.

7. **AC7: Usage Tracking Update** -- When a memory is matched by similarity and injected into the prompt, update its `usageCount += 1` and `lastUsedAt = now()` in the database. Use fire-and-forget pattern (`.catch(() => {})`) to avoid blocking agent execution. Batch update all matched memory IDs in a single SQL UPDATE statement.

8. **AC8: Cache Integration** -- The existing knowledge injection cache (keyed by companyId+agentId) must be extended to include the task keywords hash. Different tasks should get different memory results. Modify the cache key to include a hash of the first 100 chars of taskDescription. Use existing `clearKnowledgeCache()` for invalidation.

9. **AC9: Zero Regression** -- All existing tests pass unchanged. The similarity system is additive -- it only adds relevant memories when a task context is available. No existing behavior changes when no taskDescription is provided. Memory extraction fire-and-forget pattern preserved.

10. **AC10: Tests** -- Minimum 40 test cases covering: keyword extraction (Korean stopwords, English stopwords, mixed language, edge cases), similarity scoring (exact match, partial match, no match, null context, empty keywords), memory collection with similarity (filtering, sorting, threshold, charBudget truncation, usage tracking), AgentRunner integration (passes task description, undefined fallback), cache key differentiation.

## Tasks / Subtasks

- [x] Task 1: Task Keyword Extraction (AC: #1)
  - [x] 1.1 Add `extractTaskKeywords(taskDescription: string): string[]` to `memory-extractor.ts`
  - [x] 1.2 Korean stopword list (은/는/이/가/을/를/에/의/로/와/과/도/만/에서/까지/부터/하다/있다/되다/것/수/등)
  - [x] 1.3 English stopword list (common 30+ words)
  - [x] 1.4 Split on whitespace + punctuation, filter < 2 chars, deduplicate, lowercase
  - [x] 1.5 Return max 10 keywords (sorted by length DESC to prioritize specific terms)

- [x] Task 2: Context Field Population (AC: #2)
  - [x] 2.1 Modify `extractAndSaveMemories()` to call `extractTaskKeywords(taskDescription)`
  - [x] 2.2 Pass `context: keywords.join('\n')` when saving each memory
  - [x] 2.3 Existing memories with NULL context remain valid (backward compatible)

- [x] Task 3: Similarity Scoring (AC: #3)
  - [x] 3.1 Create `calculateSimilarity(taskKeywords: string[], memoryContext: string | null): number` in `knowledge-injector.ts`
  - [x] 3.2 Jaccard similarity: |intersection| / |union| of keyword sets
  - [x] 3.3 Substring boost: +0.1 if any keyword is substring of another (capped at 1.0)
  - [x] 3.4 Return 0 for null/empty memoryContext

- [x] Task 4: Similarity-Based Memory Collection (AC: #4, #7)
  - [x] 4.1 Create `collectSimilarMemories()` in `knowledge-injector.ts`
  - [x] 4.2 Fetch all active memories for agent (reuse existing query pattern)
  - [x] 4.3 Score each memory, filter >= 0.2 threshold, sort by score DESC
  - [x] 4.4 Format as Korean-labeled section: `### 관련 학습 기억 (유사도 기반)`
  - [x] 4.5 Truncate to charBudget
  - [x] 4.6 Fire-and-forget: batch update usageCount + lastUsedAt for matched memories

- [x] Task 5: Knowledge Injector Integration (AC: #5, #8)
  - [x] 5.1 Add `taskDescription?: string` parameter to `collectAgentMemoryContext()`
  - [x] 5.2 Route to `collectSimilarMemories()` when taskDescription provided
  - [x] 5.3 Fall back to existing `collectAgentMemories()` when no taskDescription
  - [x] 5.4 Extend cache key to include hash of first 100 chars of taskDescription

- [x] Task 6: AgentRunner Integration (AC: #6)
  - [x] 6.1 In `execute()` (~line 164): extract `task.messages[0]?.content` and pass to `collectAgentMemoryContext()`
  - [x] 6.2 In `executeStream()` (~line 314): same extraction and passing
  - [x] 6.3 Handle edge cases: empty messages, non-string content → pass undefined

- [x] Task 7: Tests (AC: #9, #10)
  - [x] 7.1 Unit tests for `extractTaskKeywords()`: Korean text, English text, mixed, empty, special chars
  - [x] 7.2 Unit tests for `calculateSimilarity()`: exact match → 1.0, no overlap → 0.0, partial overlap, null context, substring boost
  - [x] 7.3 Unit tests for `collectSimilarMemories()`: threshold filtering, sorting by score, charBudget, usage tracking
  - [x] 7.4 Unit tests for `collectAgentMemoryContext()`: with/without taskDescription routing
  - [x] 7.5 Unit tests for AgentRunner: passes task description correctly
  - [x] 7.6 Verify all existing tests still pass

## Dev Notes

### Existing Infrastructure (CRITICAL -- reuse, don't reinvent)

**Story 16-4 already implemented (build on, don't duplicate):**
- `packages/server/src/services/memory-extractor.ts` -- `extractAndSaveMemories()` with LLM extraction, duplicate detection, credential scrubbing, rate limiting
- `agentMemories` table has `context` text field (currently NOT populated -- this story populates it)
- Memory consolidation API already groups by similar keys (substring match)

**Story 16-3 already implemented (the injection pipeline):**
- `packages/server/src/services/knowledge-injector.ts` -- `collectAgentMemories()` + `collectAgentMemoryContext()`
- Current query: `WHERE agentId = ? AND isActive = true ORDER BY usageCount DESC`
- Cache: in-memory Map keyed by `${companyId}:${agentId}` with 5-minute TTL
- `clearKnowledgeCache(companyId)` export for invalidation

**Agent execution system (modify existing flow):**
- `packages/server/src/services/agent-runner.ts`
  - `buildSystemPrompt()` (lines 59-85): soul + tool awareness
  - `execute()` (lines 136-271): calls `collectAgentMemoryContext()` at ~line 164
  - `executeStream()` (lines 273-376): calls `collectAgentMemoryContext()` at ~line 314
  - Both methods already append memory context to system prompt

**DB schema (NO migration needed):**
- `agentMemories.context` field already exists as `text('context')` -- just not populated
- `agentMemories.usageCount` and `agentMemories.lastUsedAt` already exist for tracking

### Architecture Compliance

- **No new dependencies** -- pure string processing for keyword extraction, no ML/embedding libraries
- **No new tables or migrations** -- uses existing `context` field in `agentMemories`
- **No new API endpoints** -- this is internal service-layer logic only
- **Fire-and-forget pattern** -- usage tracking must not block agent execution
- **Backward compatible** -- null context treated as 0 similarity, existing callers unaffected
- **File naming**: kebab-case
- **Testing**: bun:test
- **Import paths**: must match git ls-files casing exactly

### Similarity Algorithm Choice: Keyword-Based Jaccard

Why keyword-based (not embedding/vector):
- No ML dependencies needed (architecture principle: avoid unnecessary complexity)
- O(n*k) computation, < 50ms for 100 memories with 10 keywords each
- Agent typically has < 100 active memories
- Can be upgraded to semantic similarity later without API changes
- Matches existing consolidation pattern (substring-based grouping in memory-extractor.ts)

### Anti-Patterns to Avoid

- Do NOT add vector DB / embedding dependencies -- keyword matching is sufficient
- Do NOT create new API endpoints -- this is internal service logic
- Do NOT block agent execution for similarity computation -- keep async/fire-and-forget
- Do NOT break existing memory injection flow -- additive changes only
- Do NOT create new database migrations -- `context` field already exists
- Do NOT use LLM for similarity scoring -- pure string computation
- Do NOT change memory extraction prompt -- only modify where extracted data is saved

### Integration Flow Diagram

```
Task arrives → AgentRunner.execute()
  → extract task.messages[0].content as taskDescription
  → collectAgentMemoryContext(companyId, agentId, charBudget, taskDescription)
    → extractTaskKeywords(taskDescription) → ["투자", "포트폴리오", "리밸런싱"]
    → fetch ALL active memories for agent
    → calculateSimilarity(taskKeywords, memory.context) for each memory
    → filter score >= 0.2, sort by score DESC
    → format as "### 관련 학습 기억 (유사도 기반)" section
    → fire-and-forget: update usageCount + lastUsedAt
  → append to system prompt
  → LLM call with enriched context
```

```
Task completes → memory-extractor.extractAndSaveMemories()
  → extractTaskKeywords(taskDescription) → keywords
  → LLM extracts learning points
  → save each with context = keywords.join('\n')  ← NEW (AC2)
  → future tasks can match against this context
```

### v1 Reference

**v1 Knowledge Manager (`/home/ubuntu/CORTHEX_HQ/src/core/knowledge.py`):**
- v1 had basic keyword-based knowledge injection
- v1 used file-based approach, no similarity scoring
- v2 improves with explicit similarity scoring + context tracking

### Project Structure Notes

**Files to modify:**
- `packages/server/src/services/memory-extractor.ts` -- add keyword extraction, populate context field
- `packages/server/src/services/knowledge-injector.ts` -- add similarity scoring, similarity-based collection, update collectAgentMemoryContext signature
- `packages/server/src/services/agent-runner.ts` -- pass task description to memory context collection

**Files to create:**
- `packages/server/src/__tests__/unit/similar-task-memory.test.ts` -- comprehensive tests

**Files that must NOT break:**
- All existing tests in `packages/server/src/__tests__/unit/`
- `packages/server/src/services/chief-of-staff.ts` (calls extractAndSaveMemories)
- `packages/server/src/routes/workspace/knowledge.ts` (memory CRUD endpoints)

### References

- [Source: _bmad-output/planning-artifacts/epics.md -- Epic 16, E16-S6]
- [Source: _bmad-output/planning-artifacts/epics.md -- FR70 에이전트 자동 학습 메모리]
- [Source: _bmad-output/planning-artifacts/architecture.md -- agent_memories table, agent-runner.ts]
- [Source: _bmad-output/implementation-artifacts/16-4-agent-memory-auto-learning-extraction.md -- predecessor story]
- [Source: _bmad-output/implementation-artifacts/16-5-knowledge-ui-drag-drop-upload.md -- sibling story]
- [Source: packages/server/src/services/memory-extractor.ts -- existing extraction service]
- [Source: packages/server/src/services/knowledge-injector.ts -- existing injection pipeline]
- [Source: packages/server/src/services/agent-runner.ts -- agent execution system]
- [Source: packages/server/src/db/schema.ts -- agentMemories table with context field]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 7 tasks complete, all 10 ACs satisfied
- Keyword-based Jaccard similarity with substring boost (no ML dependencies)
- 44 new tests, all passing. 0 regressions in related test suites (knowledge, agent-runner, llm-integration, deep-work)
- Backward compatible: existing memories with NULL context work via fallback path
- Fire-and-forget pattern preserved for usage tracking
- No new DB migrations needed -- `context` field already existed

### File List

- `packages/server/src/services/memory-extractor.ts` (modified: added extractTaskKeywords, context population)
- `packages/server/src/services/knowledge-injector.ts` (modified: added calculateSimilarity, collectSimilarMemories, updated collectAgentMemoryContext)
- `packages/server/src/services/agent-runner.ts` (modified: passes task description to collectAgentMemoryContext)
- `packages/server/src/__tests__/unit/similar-task-memory.test.ts` (new: 44 tests)
