# Story 22.6 — Phase A Spec Review (Quinn, Critic-B)

**Story**: 22.6 — Neon Pro Upgrade & VPS Resource Verification
**Phase**: A (Spec Review — Round 1)
**Reviewer**: Quinn (QA + Security)
**Date**: 2026-03-24

---

## Findings

### Finding 1 — HIGH: Wrong table name in Task 2.2

**Affected**: Task 2.2

Spec says: "Verify vector dimensions in **knowledge_chunks** table = 1024"

Actual table is `knowledge_docs` (schema.ts line 1547):
```typescript
export const knowledgeDocs = pgTable('knowledge_docs', {
```

This would cause the test to query a non-existent table and fail.

Additionally, Task 2.2 should also verify `semantic_cache.query_embedding` dimensions = 1024. Story 22.3 migrated BOTH tables (knowledge_docs + semantic_cache). Go/No-Go #10 should verify both.

**Fix**:
- `knowledge_chunks` → `knowledge_docs`
- Add: verify `semantic_cache.query_embedding` dimension = 1024

### Finding 2 — MEDIUM: Wrong Voyage model name in cost estimate

**Affected**: Task 4.1

Spec says: "**voyage-3-large**: $0.06/1M tokens (input)"

Actual model configured (voyage-embedding.ts line 8):
```typescript
export const EMBEDDING_MODEL = 'voyage-3'
```

`voyage-3` and `voyage-3-large` are different models with different pricing. The cost estimate should reference the correct model.

**Fix**: `voyage-3-large` → `voyage-3`, verify pricing matches `voyage-3` tier.

### Finding 3 — MEDIUM: AC-3 ↔ Task 1.2 gap (ARM64 image test)

**Affected**: AC-3, Task 1.2

AC-3 requires: "Docker can pull and run ARM64 images"

Task 1.2 only checks:
- Docker daemon responsive: `docker info` exits 0
- Running containers include `corthex-v2`
- Docker supports `--memory` flag

Missing: explicit ARM64 image pull/run verification. The `corthex-v2` container being healthy proves ARM64 works implicitly, but AC-3 states it as a separate requirement.

**Fix**: Either:
- Add Task 1.2 check: verify `docker info` output contains `Architecture: aarch64`
- Or weaken AC-3 to "Docker is running with an ARM64 container operational"

### Finding 4 — LOW: Neon tier detection method unspecified

**Affected**: Task 2.4

Task 2.4 says: "Query Neon-specific metadata if available" — but Neon doesn't expose tier info via standard SQL. The tier is a billing concept visible only in the Neon console or API.

**Fix**: Either:
- Use Neon Management API (`GET /projects/{project_id}` returns tier info) — requires API key
- Or detect indirectly: Free tier has `max_connections ≤ 100` and `compute_size = 0.25 CU`. Pro tier has higher limits.
- Or document tier manually based on console check (acceptable for a verification story)

### Finding 5 — LOW: Disk space check method unspecified

**Affected**: Task 1.1

Task 1.1 says "Disk: verify root partition has ≥100GB available" but doesn't specify how. Options:
- `execSync('df -BG / | tail -1')` and parse available column
- `fs.statfsSync('/')` (Node.js 18.15+/Bun) — returns `bavail * bsize`

Recommend specifying the method for consistency.

### Finding 6 — INFO: DATABASE_URL credential safety

Tests that connect to Neon may log connection errors containing DATABASE_URL. Ensure test output doesn't leak credentials:
- Don't `console.log(process.env.DATABASE_URL)`
- Mask connection string in error messages
- `describe.skipIf(!process.env.DATABASE_URL)` for graceful CI skip — good pattern

### Finding 7 — INFO: Go/No-Go implications for Free tier

Task 2.4 says "If Free tier: document that Pro upgrade is pending (AR6 blocker)". But what happens to the overall Go/No-Go in Task 5? If Neon is Free tier, does Go/No-Go #10 PASS or FAIL? The checklist item `AR6: Neon Pro upgrade status` should have a clear pass/fail criteria.

---

## Dimension Scores

| Dimension | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| D1 Specificity | 10% | 8 | VPS checks specific with exact values. DB queries given. Some methods unspecified (disk, tier). |
| D2 Completeness | 25% | 7 | All ACs covered. Gaps: ARM64 image test, semantic_cache dims, wrong table name. |
| D3 Accuracy | 15% | 6 | Wrong table name (knowledge_chunks→knowledge_docs). Wrong model name (voyage-3-large→voyage-3). |
| D4 Implementability | 10% | 8 | Mostly implementable. Neon tier detection unclear. |
| D5 Consistency | 15% | 9 | Follows existing patterns, consistent artifact locations. |
| D6 Risk Awareness | 25% | 7 | Good CI skip strategy. Go/No-Go gate. Missing: Free tier implication, credential leakage. |

### Weighted Total

| D | W | S | W×S |
|---|---|---|-----|
| D1 | 10% | 8 | 0.80 |
| D2 | 25% | 7 | 1.75 |
| D3 | 15% | 6 | 0.90 |
| D4 | 10% | 8 | 0.80 |
| D5 | 15% | 9 | 1.35 |
| D6 | 25% | 7 | 1.75 |
| **Total** | | | **7.35** |

---

## Verdict: **7.35/10 — PASS ✓**

Passes the 7.0 threshold. The spec structure is sound for a verification/documentation story. Required fixes are all straightforward factual corrections:

### Required fixes:
1. **HIGH**: `knowledge_chunks` → `knowledge_docs` + add `semantic_cache` verification
2. **MEDIUM**: `voyage-3-large` → `voyage-3` + correct pricing
3. **MEDIUM**: Add ARM64 architecture check to Task 1.2
4. **LOW**: Specify Neon tier detection method
5. **LOW**: Specify disk space check method

Expected score after fixes: 8.5+

---

---

## Round 2 Re-Review (all fixes applied)

**Date**: 2026-03-24

### All 5 findings resolved:

| # | Severity | Finding | Fix | Verified |
|---|----------|---------|-----|----------|
| 1 | HIGH | Wrong table `knowledge_chunks` | → `knowledge_docs.embedding` + `semantic_cache.query_embedding` added | ✅ Lines 100-101 |
| 2 | MEDIUM | Wrong model `voyage-3-large` | → `voyage-3` + "verify via WebSearch" | ✅ Line 137 |
| 3 | MEDIUM | ARM64 image test gap | Added `docker info` Architecture check | ✅ Line 81 |
| 4 | LOW | Neon tier detection vague | Indirect detection via max_connections + pg_settings | ✅ Lines 108-112 |
| 5 | LOW | Disk check unspecified | `child_process` + `df -B1 /` | ✅ Line 77 |

### Updated Scores (Round 2)

| Dimension | Weight | R1 | R2 | Rationale |
|-----------|--------|----|----|-----------|
| D1 Specificity | 10% | 8 | 9 | All methods now concrete (disk, tier, ARM64) |
| D2 Completeness | 25% | 7 | 9 | Both tables verified. ARM64 added. All ACs covered. |
| D3 Accuracy | 15% | 6 | 9 | Table name, model name both corrected |
| D4 Implementability | 10% | 8 | 9 | All methods concrete and implementable |
| D5 Consistency | 15% | 9 | 9 | Unchanged |
| D6 Risk Awareness | 25% | 7 | 8 | Better tier detection transparency. Free tier documented. |

### Weighted Total (Round 2)

| D | W | S | W×S |
|---|---|---|-----|
| D1 | 10% | 9 | 0.90 |
| D2 | 25% | 9 | 2.25 |
| D3 | 15% | 9 | 1.35 |
| D4 | 10% | 9 | 0.90 |
| D5 | 15% | 9 | 1.35 |
| D6 | 25% | 8 | 2.00 |
| **Total** | | | **8.75** |

## Verdict (Round 2): **8.75/10 — PASS ✓**

All factual errors corrected. Spec is now accurate and implementable. Ready for Phase B — the final story of Epic 22.

---

*Quinn — Critic-B (QA + Security) — corthex-epic-22*
