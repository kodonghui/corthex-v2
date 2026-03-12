# Story 15.3: Semantic Caching — 2026-03-12

## What Changed
- **DB Migration** (0051_semantic-cache.sql): Created `semantic_cache` table with VECTOR(768) column + HNSW index; added `enable_semantic_cache` column to agents table
- **DB Schema** (schema.ts): Added `semanticCache` table definition + `enableSemanticCache` field to agents table
- **lib/credential-patterns.ts** (NEW): Extracted CREDENTIAL_PATTERNS from credential-scrubber for shared use (D20 NFR-CACHE-S3 compliance)
- **engine/hooks/credential-scrubber.ts**: Updated to use shared `scrubCredentials()` from lib/credential-patterns.ts
- **db/scoped-query.ts**: Added `findSemanticCache()` + `insertSemanticCache()` with strict `company_id` isolation (D20)
- **engine/semantic-cache.ts** (NEW): `checkSemanticCache()` + `saveToSemanticCache()` with callee-side credential scrubbing (D19/D20)
- **engine/agent-loop.ts**: Layer 1 semantic cache check before LLM call + save after response; collects fullResponseParts
- **shared/types.ts**: Added `enableSemanticCache: boolean` to Agent type
- **services/organization.ts**: Added `enableSemanticCache` to AgentUpdateInput interface
- **routes/admin/agents.ts**: Added `enableSemanticCache` to updateAgentSchema; GET /agents/:id returns `semanticCacheRecommendation`
- **admin/pages/agents.tsx**: Added enableSemanticCache toggle + confirmation modal + cache recommendation display
- **app/hooks/use-sse-state-machine.ts**: 300ms setTimeout before `accepted` state transition (spinner delay for cache hits)
- **.github/scripts/engine-boundary-check.sh**: Added E8 semantic-cache boundary check (D19)
- **lib/semantic-cache-cleanup.ts** (NEW): Daily cleanup worker (deletes expired rows based on ttl_hours)
- **index.ts**: Registered startSemanticCacheCleanup / stopSemanticCacheCleanup

## Why
Story 15.3 — Semantic Caching. Repeated/similar queries return cached responses ≤100ms at $0 LLM cost, with per-agent on/off control.

## Test Results
- 28 unit tests pass (packages/server/src/__tests__/unit/semantic-cache.test.ts)
- tsc --noEmit: 0 errors
- engine-boundary-check.sh: OK
