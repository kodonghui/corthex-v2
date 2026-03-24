# Story 22.3 Phase A — Fixes Applied (Retry 1)

**Date:** 2026-03-24
**Author:** dev (Writer)

---

## Issues Fixed

### From Quinn (Critic-B) — 6.45/10

| # | Severity | Issue | Fix Applied |
|---|----------|-------|-------------|
| 1 | CRITICAL | `semantic_cache.query_embedding VECTOR(768)` missing | Added to migration SQL (Steps 5-8), schema.ts:1888 in Task 2.3-2.4, Go/No-Go scope expanded |
| 2 | CRITICAL | Index name mismatch (`knowledge_docs_embedding_hnsw_idx` vs actual `knowledge_docs_embedding_idx`) | Fixed to actual names: `knowledge_docs_embedding_idx` (0049), `semantic_cache_embedding_idx` (0051) |
| 3 | HIGH | Re-embedding script not idempotent | Task 3.2 changed to `WHERE embedding IS NULL AND is_active = true` |
| 4 | HIGH | `array_length()` invalid for pgvector | All occurrences changed to `vector_dims()` (AC-4, Task 4.1, E18 reference) |
| 5 | HIGH | No advisory lock for concurrent execution | Added Task 3.9: `pg_advisory_lock(hashtext('migrate-embeddings-1024'))` |

### From Winston (Critic-A) — 6.60/10

| # | Severity | Issue | Fix Applied |
|---|----------|-------|-------------|
| 1 | CRITICAL | `semantic_cache` migration missing | Same fix as Quinn #1 — already applied |
| 2 | CRITICAL | Wrong index name | Same fix as Quinn #2 — already applied |
| 3 | HIGH | `array_length()` invalid | Same fix as Quinn #4 — already applied |
| 4 | MEDIUM | No `work_mem` in SQL | Added `SET LOCAL work_mem = '512MB'` before CREATE INDEX in SQL pattern. Scoped to transaction, auto-resets. |

### From John (Critic-C) — 6.10/10

| # | Severity | Issue | Fix Applied |
|---|----------|-------|-------------|
| 1 | BLOCKER | `semantic_cache` missing | Same fix as Quinn #1 — already applied |
| 2 | HIGH | Wrong index name | Same fix as Quinn #2 — already applied |
| 3 | HIGH | `array_length()` invalid | Same fix as Quinn #4 — already applied |
| 4 | MEDIUM | Rollback/backup plan missing | Added: AC-7 now includes `pg_dump` before migration. Task 4.3 added backup step. Dev Notes "IRREVERSIBILITY Warning" → "IRREVERSIBILITY Warning & Rollback Plan" with full rollback path. |
| 5 | MEDIUM | HNSW build parameters unspecified | Added explicit note in Dev Notes: default `m=16, ef_construction=64` appropriate for <10K docs. SQL comment documents this decision. |
| 6 | MEDIUM | Unbounded SELECT in re-embedding | Task 3.2 changed to paginated: `LIMIT 500 OFFSET ?` following `BATCH_MAX_DOCS = 500` pattern from `embedAllDocuments`. Script loops until no NULL embedding docs remain. |

### Additional (cross-critic synthesis)

| Issue | Fix Applied |
|-------|-------------|
| `agent_memories.embedding` scope question (Quinn) | Added Dev Notes section: "agent_memories.embedding — NOT in scope" — column doesn't exist yet (Sprint 3 future work). Verified via schema grep. |
| Quinn's test additions | Added Task 5.5 (idempotency test) and Task 5.6 (advisory lock test) |
| semantic_cache HNSW memory concern (Quinn→John cross-talk) | Added note: semantic_cache HNSW rebuild is lightweight (ephemeral 24h TTL, small table). Sequential after knowledge_docs is safe. |

---

## Summary

- **Total unique issues**: 10 (across 3 critics, with significant overlap)
- **All 10 fixed**: 5 CRITICAL/BLOCKER, 2 HIGH, 3 MEDIUM
- **Key structural changes**: Migration scope expanded from 1 table → 2 tables, rollback plan added, pagination added, HNSW parameters documented
