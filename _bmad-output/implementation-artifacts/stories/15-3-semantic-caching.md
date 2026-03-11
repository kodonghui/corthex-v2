# Story 15.3: Semantic Caching (pgvector 기반)
Status: backlog

## Story
As a platform operator,
I want similar user questions to return cached LLM responses without making a new API call,
so that repeated/similar queries save ~73% on LLM costs and respond in milliseconds.

## Context (from _research/tool-reports/05-caching-strategy.md)
- pgvector already installed (Epic 10.1) with Gemini text-embedding-004
- Cosine similarity > 0.95 threshold for cache hits
- Suitable for: FAQ, company policy questions, general knowledge
- NOT suitable for: personalized analysis, realtime data, creative content

## Acceptance Criteria
1. **Given** a `semantic_cache` table exists, **When** a query embedding matches an existing entry with cosine similarity > 0.95, **Then** the cached response is returned without LLM call
2. **Given** a cache miss, **When** the LLM generates a response, **Then** the query+response is saved to semantic_cache for future matches
3. **Given** cached entries, **When** they are older than TTL (1 hour default), **Then** they are not returned as cache hits
4. **Given** different companyIds, **When** checking semantic cache, **Then** results are isolated per company
5. **Given** an agent with `enableSemanticCache: false`, **When** processing a message, **Then** semantic cache is completely bypassed
6. **Given** a cache hit, **When** returning the response, **Then** costUsd is reported as 0 and a `cached: true` flag is included
7. **Given** all changes, **When** `npx tsc --noEmit` runs, **Then** no type errors

## Tasks / Subtasks
- [ ] Task 1: Create semantic_cache table (AC: #1, #3, #4)
  - [ ] Schema: id, companyId, queryText, queryEmbedding VECTOR(768), response TEXT, createdAt, ttl
  - [ ] Index: HNSW on queryEmbedding for fast similarity search
  - [ ] Drizzle schema definition + migration SQL
- [ ] Task 2: Create engine/semantic-cache.ts (AC: #1, #2, #3, #4)
  - [ ] `checkSemanticCache(companyId, query, threshold?)` → string | null
  - [ ] `saveToSemanticCache(companyId, query, response)` → void
  - [ ] Uses existing Gemini embedding pipeline from Epic 10.2
  - [ ] Uses getDB(companyId) for DB access (D1 compliance)
  - [ ] TTL filtering: WHERE createdAt > NOW() - ttl
- [ ] Task 3: Integrate into agent-loop.ts (AC: #5, #6)
  - [ ] Before LLM call: check semantic cache (if agent.enableSemanticCache)
  - [ ] On cache hit: yield SSE events (accepted, processing, message with cached content, done with costUsd=0)
  - [ ] On cache miss: proceed normally, save response after completion
  - [ ] Add `enableSemanticCache` to agent config / agents table
- [ ] Task 4: Add enableSemanticCache to agent config (AC: #5)
  - [ ] Add column to agents table (default: false)
  - [ ] Add to admin UI agent edit form
  - [ ] Add to agent types in shared/types.ts
- [ ] Task 5: Stale cache cleanup (AC: #3)
  - [ ] ARGOS job or periodic cleanup: DELETE FROM semantic_cache WHERE createdAt + ttl < NOW()
  - [ ] Or lazy: filter in query (WHERE createdAt > NOW() - interval '1 hour')
- [ ] Task 6: Verify (AC: #7)
  - [ ] npx tsc --noEmit
  - [ ] Unit tests: cache hit, cache miss, TTL expiry, companyId isolation, bypass when disabled

## Dev Notes
- pgvector + Gemini embedding already working from Epic 10 — reuse `getEmbedding()` helper
- vector dimension is 768 (text-embedding-004), NOT 1536
- Threshold 0.95 is strict — may need tuning later
- blocked_by: 15.1 (prompt caching should be in place first since semantic cache skips LLM entirely)
- This is the most complex of the 3 caching stories
- Consider: should cached responses include a disclaimer? (e.g., "이전 유사 질문의 답변입니다")
