# Context Snapshot — Stage 1, Step 04 Architectural Patterns
Date: 2026-03-20
Pipeline: /kdh-full-auto-pipeline planning (v9.0)
Project: CORTHEX v3 "OpenClaw"

---

## Step 04 Outcome

**Status**: ✅ PASS (avg 9.07/10 — D4 실행가능성 최초 만점)

| Critic | Initial | Verified | Note |
|--------|---------|----------|------|
| Winston | 8.75 ✅ | 9.20 ✅ | 9 items (2 Major + 4 Minor + 3 cross-talk). NULL opt-in→automatic, DEFAULT_PERSONALITY, IF NOT EXISTS, HNSW memory, token bucket, migration DEFAULT |
| John | 8.65 ✅ | 9.00 ✅ | 5 items (2 High + 1 Medium + 2 Low). HNSW future→Sprint 3, OfficeStateStore ephemeral, n8n race condition, Go/No-Go #8 blocker, personality automatic |
| Quinn | 8.85 ✅ | 9.00 ✅ | 5 items (0 High + 3 Medium + 2 Low). Drizzle count() type, MCP→builtin terminology, 200KB→300KB/TBD, IF NOT EXISTS, DEFAULT_PERSONALITY |

## Key Deliverables

- 6 sections (4.1-4.6) covering all 4 layers + Layer 0 + cross-layer architecture
- 4.1 PixiJS: OfficeStateStore (in-memory Map), orthogonal top-down, token bucket rate limiting 10msg/s per userId, ephemeral restart behavior
- 4.2 n8n: Tag-based multi-tenant isolation (atomic create-with-tags), 6-layer security model, builtin agent tools via n8n-client.ts
- 4.3 Big Five: 0-100 integer confirmed, Option A spread reversal, Go/No-Go #2 key-aware fallback, DEFAULT_PERSONALITY constant (10 keys), automatic injection (Brief §4), Layer C regex keep `[^}]+`
- 4.4 Memory: 3-phase pipeline (runtime + cron), Haiku default reflections, cron backpressure (MAX_BATCH=50, MAX_UNPROCESSED_ALERT=500), 90-day TTL, observations vs agent_memories split
- 4.5 UXUI: Subframe workflow, design tokens
- 4.6 Cross-layer: Migrations 0061-0064, 6 new service files, Go/No-Go gate summary (8 gates)

## Architecture Decisions Made

1. **OfficeStateStore**: In-memory Map, ephemeral by design. Transient (x,y) = Map, Persistent (desk) = DB.
2. **n8n isolation**: Tag-based, atomic create-with-tags. 6-layer security.
3. **Personality injection**: Automatic (not opt-in). Migration 0063 backfills defaults. Brief §4 aligned.
4. **DEFAULT_PERSONALITY**: O=60, C=75, E=50, A=70, N=25 + 5 descriptors.
5. **Migration 0064**: agent_memories HNSW — Sprint 3 prerequisite. Fallback: keyword/recency.
6. **Rate limiting**: Token bucket, 10 tokens/s per userId, O(1).
7. **PixiJS bundle**: 300KB gzipped target, Sprint 0 benchmark confirms.
8. **Migration 0061**: `IF NOT EXISTS` for idempotency.

## Fixes Applied

Total ~17 issues across 2 rounds + cross-talk:
- Drizzle count() return type: destructure + Number() cast
- n8n "MCP tools" → "builtin agent tools" terminology
- agent_memories HNSW: "future" → Sprint 3 migration 0064
- OfficeStateStore: ephemeral + transient vs persistent distinction
- n8n tag race condition: atomic create-with-tags
- Go/No-Go #8: Sprint Blocker section strengthened
- Personality opt-in → automatic (Brief §4)
- Migration 0063: DEFAULT NULL → DEFAULT jsonb with defaults
- DEFAULT_PERSONALITY constant: 10 keys defined
- Migration 0061: IF NOT EXISTS added
- HNSW memory impact: 2.5-3GB quantified
- Rate limiting: per-userId token bucket specified
- PixiJS bundle: 200KB → 300KB + Sprint 0 benchmark
- Migration 0064 added to 4.6.1 ordering

## Carry-Forward to Step 5 (1 item)

1. HNSW memory attribution: pgvector runs on Neon compute node (not VPS). VPS 15.5GB headroom unchanged. Reframe as Neon Pro compute tier limitation.

## Output File

`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`
Step 4 section: Architectural Patterns (6 sub-sections, ~350 lines)
