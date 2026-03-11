# Story 15.2: Tool Result Caching (인메모리 Map)
Status: backlog

## Story
As a platform operator,
I want tool execution results to be cached in memory with configurable TTL per tool,
so that repeated identical tool calls (e.g. stock price, web search) don't hit external APIs unnecessarily.

## Context (from _research/tool-reports/05-caching-strategy.md)
- Tools like kr_stock, search_web, dart_api return same results within short windows
- In-memory Map is simplest for Phase 1~3 (single server, 24GB RAM)
- Redis upgrade planned for Phase 4+ (multi-server)

## Tool TTL Configuration
| Tool | TTL | Reason |
|------|-----|--------|
| search_web | 30min | Search results don't change frequently |
| search_news | 15min | News updates moderately |
| kr_stock | 1min | Near-realtime during market hours |
| get_current_time | 0 (no cache) | Always needs current value |
| law_search | 24h | Legal data rarely changes |
| generate_image | 0 (no cache) | Each call should produce unique result |
| dart_api | 1h | Financial disclosures update slowly |

## Acceptance Criteria
1. **Given** a `withCache()` wrapper exists, **When** a tool is called with the same params within TTL, **Then** the cached result is returned without calling the actual tool function
2. **Given** a cached tool result, **When** the TTL expires, **Then** the next call executes the real function and refreshes the cache
3. **Given** different companyIds, **When** caching tool results, **Then** caches are isolated per company (cache key includes companyId)
4. **Given** a tool with TTL=0, **When** called, **Then** the cache is bypassed entirely
5. **Given** 10,000+ cached entries, **When** checking memory, **Then** stale entries are cleaned up (no memory leak)
6. **Given** all changes, **When** `npx tsc --noEmit` runs, **Then** no type errors

## Tasks / Subtasks
- [ ] Task 1: Create lib/tool-cache.ts (AC: #1, #2, #3, #4)
  - [ ] Implement `withCache(toolName, ttlMs, fn)` higher-order function
  - [ ] Cache key format: `${companyId}:${toolName}:${JSON.stringify(params)}`
  - [ ] Return cached data if not expired
  - [ ] Bypass cache if ttlMs === 0
- [ ] Task 2: Add stale entry cleanup (AC: #5)
  - [ ] Periodic cleanup: every 5 minutes, remove entries where expiresAt < Date.now()
  - [ ] Or lazy cleanup: check on each get, delete if stale
  - [ ] Max cache size guard: if entries > 10,000, evict oldest
- [ ] Task 3: Apply withCache to existing tool handlers (AC: #1)
  - [ ] Find all tool handler files in tool-handlers/
  - [ ] Wrap applicable tools with withCache() using TTLs from table above
  - [ ] Skip tools with TTL=0
- [ ] Task 4: Add cache stats endpoint (optional but nice)
  - [ ] GET /api/admin/cache-stats → { totalEntries, hitRate, topTools }
- [ ] Task 5: Verify (AC: #6)
  - [ ] npx tsc --noEmit
  - [ ] Write unit tests for withCache (hit, miss, expiry, cleanup, companyId isolation)

## Dev Notes
- Use simple Map<string, { data: string; expiresAt: number }> — no external dependencies
- companyId comes from ToolExecContext or SessionContext
- Check how tool handlers are currently structured before wrapping
- DO NOT use Redis — that's Phase 4+
