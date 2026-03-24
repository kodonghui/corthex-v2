# Spec Review — Story 22.6: Neon Pro Upgrade & VPS Resource Verification

**Reviewer**: Winston (Critic-A, Architecture + API)
**Date**: 2026-03-24
**Phase**: A (Spec Review)
**Scope**: 6 ACs, 5 Tasks — verification + documentation story (final Epic 22 story)

---

## Verification Method

- Read full story spec
- Verified VPS resources via `os` module: 4 CPUs, arm64, 23.4GB RAM, 168GB disk
- Verified Docker: version 28.2.2, corthex-v2 container healthy
- Checked `knowledge_docs` table name in schema.ts (line 1547)
- Checked Voyage model: `voyage-3` in `voyage-embedding.ts:8` (not `voyage-3-large`)
- Verified `voyageai@0.2.1` in server package.json
- Checked current RAM: 23GB total, 18GB available, 4GB used

---

## Findings

### Issue 1: Wrong table name in Task 2.2 [MEDIUM]

Task 2.2 says: "Verify vector dimensions in **knowledge_chunks** table = 1024"

Actual table name: **`knowledge_docs`** (schema.ts line 1547: `export const knowledgeDocs = pgTable('knowledge_docs', {...})`)

There is no `knowledge_chunks` table in the codebase. This would cause the verification query to fail or reference a non-existent table.

**Fix**: Replace `knowledge_chunks` with `knowledge_docs`.

### Issue 2: Wrong Voyage model name in Task 4.1 [MEDIUM]

Task 4.1 says: "**voyage-3-large**: $0.06/1M tokens (input)"

Actual model: **`voyage-3`** (voyage-embedding.ts line 8: `export const EMBEDDING_MODEL = 'voyage-3'`)

`voyage-3` and `voyage-3-large` are different models. The price $0.06/1M happens to be correct for `voyage-3`, but the model name is wrong. Using the wrong name could confuse cost calculations or model capability assumptions.

**Fix**: Replace `voyage-3-large` with `voyage-3`.

### Issue 3: Missing semantic_cache dimension verification [MEDIUM]

Task 2.2 only checks `knowledge_docs` vector dimensions, but Story 22.3 migrated BOTH tables:
- `knowledge_docs.embedding` → 1024 (schema.ts:1556)
- `semantic_cache.query_embedding` → 1024 (schema.ts:1888)

The verification should check both tables' dimensions to confirm the full migration scope.

**Fix**: Add `semantic_cache.query_embedding` dimension check to Task 2.2.

*(Credit: Quinn flagged this gap)*

### Issue 4: Neon tier detection method vague [LOW]

Task 2.4 says: "Query Neon-specific metadata **if available**"

There's no standard SQL query to determine Neon's billing tier (Free vs Pro). `SHOW max_connections` gives connection limits but isn't a reliable tier indicator (varies by configuration). The Neon Console API (`/api/v2/projects/<id>`) could provide this but requires an API key not available in the test environment.

**Suggestion**: Document the tier detection as best-effort: use `max_connections` as a heuristic (Free tier defaults to ~100, Pro allows custom), and note that definitive tier confirmation requires Neon Console/dashboard verification. Make the test assertion soft (document result, don't hard-fail on tier detection).

---

## What's Correct

| Check | Status | Evidence |
|-------|--------|----------|
| VPS CPU: 4 cores, arm64 | ✅ | `os.cpus().length === 4`, `os.arch() === 'arm64'` — verified |
| VPS RAM: ≥23GB | ✅ | `os.totalmem()` = 23.4GB — verified |
| VPS Disk: ≥100GB available | ✅ | `df -h /` = 168GB — verified |
| Docker running | ✅ | Docker 28.2.2, corthex-v2 Up 3h (healthy) |
| voyageai@0.2.1 | ✅ | Confirmed in packages/server/package.json:40 |
| Vector dimensions = 1024 | ✅ | schema.ts:1556 `vector('embedding', { dimensions: 1024 })` |
| DB tests skip in CI (no DATABASE_URL) | ✅ | Dev Notes describe graceful skip |
| Cost estimate structure | ✅ | VPS $0, Cloudflare $0, GitHub Actions $0, Domain ~$1/mo |
| Go/No-Go checklist (Task 5) | ✅ | Comprehensive — covers all Phase 0 prereqs |
| Test file location | ✅ | `packages/server/src/__tests__/unit/` — follows convention |
| AC-4 references Stories 22.1-22.3 | ✅ | All completed per Dependencies section |
| Task 4.2 NFR compliance (COST1/2/3) | ✅ | All three NFR references included |

### Architecture Notes

- **RAM headroom** (Task 1.3): Current available is 18GB, well above the 12GB threshold. The peak budget breakdown (Bun ~2GB + PG ~3GB + CI ~4GB + n8n ~2GB + OS ~1GB = ~12GB) leaves ~11.4GB headroom from 23.4GB total. The test checks current available RAM which is a conservative proxy for projected headroom.

- **Docker `--memory=2g`** (AC-3): Docker 28.2.2 supports cgroup memory limits. This is a good forward check for Sprint 2 n8n container.

- **Go/No-Go document** (Task 5): The checklist covers all Phase 0 stories (22.1-22.5) plus infrastructure prerequisites. This is the correct gate for Sprint 1 readiness.

---

## Score

| Dimension | Weight | Score | Reasoning |
|-----------|--------|-------|-----------|
| D1 Specificity | 15% | 8/10 | Good VPS thresholds, clear cost breakdown. Table/model name errors deduct. |
| D2 Completeness | 15% | 9/10 | All verification areas covered. Go/No-Go checklist comprehensive. |
| D3 Accuracy | 25% | 7/10 | Wrong table name (knowledge_chunks→knowledge_docs), wrong model name (voyage-3-large→voyage-3). |
| D4 Implementability | 20% | 8/10 | Straightforward verification. Neon tier detection needs clarification. |
| D5 Consistency | 15% | 8/10 | Good project pattern adherence. Table name inconsistent with codebase. |
| D6 Risk | 10% | 9/10 | Verification/docs story — low risk. No runtime changes. |

**Weighted**: (8×0.15)+(9×0.15)+(7×0.25)+(8×0.20)+(8×0.15)+(9×0.10) = 1.20+1.35+1.75+1.60+1.20+0.90 = **8.00/10**

---

## Verdict: ✅ PASS — 8.00/10 (2 fixes recommended)

Solid verification/documentation story. The two factual errors (table name, model name) are simple fixes. Neon tier detection is a nice-to-have clarification. The overall structure, thresholds, and Go/No-Go checklist are well-designed for the final Phase 0 gate.
