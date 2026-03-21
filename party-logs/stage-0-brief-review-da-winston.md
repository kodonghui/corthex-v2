# Stage 0 Brief Review — Devil's Advocate (Cycle 2)

> Document: `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (post-Cycle 1 fixes)
> Date: 2026-03-21
> Reviewer: Winston (Architect) — Designated Devil's Advocate
> Cycle 1 avg: 8.35/10 PASS
> Mandate: Find ≥3 ADDITIONAL issues not caught in Cycle 1. Think adversarially.

---

## Devil's Advocate Methodology

I cross-referenced every technical claim in the Brief against the actual source code. Cycle 1 caught surface issues (stale refs, missing sections). The DA review targets **structural contradictions** — places where the Brief's internal logic fails when tested against reality.

---

## DA Issues Found: 4

### DA-1. [CRITICAL — Zero Regression Contradiction] pgvector Dimension is 768 (Gemini), NOT 1536 — Brief Has Wrong Baseline

**Brief line 157**: "기존 `vector(1536)` → `vector(1024)` 마이그레이션 여부 Architecture에서 확정"

**Actual code** (`packages/server/src/db/schema.ts`):
```
Line 1556: embedding: vector('embedding', { dimensions: 768 }),  // pgvector: Gemini Embedding 768-dim
Line 1888: queryEmbedding: vector('query_embedding', { dimensions: 768 }).notNull(),
```

The existing vector dimension is **768, not 1536**. The Brief is planning a migration from a dimension that doesn't exist.

Worse: the comment explicitly says "**Gemini Embedding** 768-dim". The EXISTING embeddings were created by the BANNED provider (Gemini). The switch to Voyage AI `voyage-3` (1024d) means:
- Actual migration: 768d → 1024d (not 1536 → 1024)
- ALL existing embeddings (768d Gemini) are **semantically incompatible** with new 1024d Voyage embeddings
- You cannot mix 768d and 1024d vectors in the same column for cosine similarity search
- ALL existing knowledge_docs embeddings must be **re-embedded** with Voyage AI or the semantic search breaks

**Why nobody caught this**: The Brief says "Architecture에서 확정" which sounds like a reasonable deferral. But the WRONG baseline dimension (1536 vs actual 768) means the Architecture stage will start with false assumptions. And the Gemini origin of existing embeddings makes this a key-constraint violation, not just a migration.

**Impact**: Affects 2 tables — `knowledge_docs` (line 1556) and `semantic_cache` (line 1888). Both have live Gemini 768d embeddings. Zero Regression claim "기존 v2 메모리 데이터 단절 없음" is technically impossible if you need to re-embed everything.

**Fix**: Correct "vector(1536)" to "vector(768, Gemini origin)". Explicitly flag that ALL existing 768d embeddings need re-embedding with Voyage AI. Add this as a Risk (R11) and flag it as a potential Sprint 3 scope expansion.

---

### DA-2. [CRITICAL — Hidden Scope] `agent_memories` Has NO Vector Column — Semantic Search Requires New Column

**Brief line 164**: "agent_memories(reflection 타입) + pgvector 시맨틱 검색으로 실행 계획 수립"

**Actual code** (`packages/server/src/db/schema.ts:1589-1608`):
```typescript
export const agentMemories = pgTable('agent_memories', {
  id, companyId, agentId, memoryType, key, content, context,
  source, confidence, usageCount, lastUsedAt, isActive,
  createdAt, updatedAt
})
```

**There is NO `embedding` or `vector` column in `agent_memories`.** The table stores text-only memories with integer confidence scores. pgvector semantic search on this table is IMPOSSIBLE without adding a new vector column.

The Brief repeatedly says "기존 `agent_memories` 테이블 확장" (Option B), implying only `memoryTypeEnum` changes. But adding a `vector(1024)` column is a **schema change to an existing table** — not just an enum extension. This is more scope than the Brief acknowledges.

Furthermore: existing v2 memories (text-only, no embeddings) will NOT be semantically searchable until they're embedded. "기존 v2 메모리 데이터 단절 없음" (line 158) is true for text data, but the new semantic search capability won't apply to old data without a backfill job.

**Fix**: Explicitly add "`agent_memories` 테이블에 `embedding vector(1024)` 컬럼 추가" to Layer 4 scope. Add a backfill job to embed existing memories with Voyage AI. This is NOT a trivial change — it's API calls to Voyage for every existing memory row.

---

### DA-3. [IMPORTANT — Logic Contradiction] v1 Feature Parity Go/No-Go #10 Contradicts Gemini/GPT Ban

**Go/No-Go #10 (line 461)**: "v1-feature-spec.md 체크리스트 전수 검증 — 슬래시 명령어 8종, CEO 프리셋, 위임 체인 추적, AGORA 토론 등 기능 수준 동작 확인"

**v1-feature-spec.md section 4** (lines 116-118):
```
### 4.1 지원 모델 (10종)
- **OpenAI**: GPT-5, GPT-5-mini, GPT-5.2
- **Google**: Gemini 3.1 Pro, Gemini 2.5 Flash
```

**v1-feature-spec.md checklist** (line 388):
```
- [ ] LLM 멀티 프로바이더 (Claude/GPT/Gemini + Batch API)
```

**Key constraint** (`project-context.yaml` line 64): "Claude OAuth CLI only — NO Gemini API anywhere"

Go/No-Go #10 requires "전수 검증" (full verification) against v1-feature-spec.md. But v1 supported 10 LLM models across 3 providers (Anthropic/OpenAI/Google), while v3 bans Gemini entirely and the Settings page already removed GPT models (commit e294213, planning brief line 160: "Settings LLM 모델 → Sonnet 4.6 + Opus 4.6만").

**This Go/No-Go gate WILL fail as written** because v1 parity for multi-provider LLM support is architecturally impossible under the current key constraints. The gate needs explicit exclusions: "v1 기능 중 다음은 의도적 제외: GPT/Gemini 멀티 프로바이더 (Claude only 정책), Batch API (v3 범위 외)."

Without exclusions, this gate becomes a perpetual blocker that can never be satisfied.

**Fix**: Add an explicit exclusion list to Go/No-Go #10 for features intentionally removed due to key constraint changes (Gemini/GPT providers, Batch API).

---

### DA-4. [IMPORTANT — Philosophical Contradiction] Workflow API Orphaning vs Zero Regression

**Brief line 84**: "기존 버그 많은 자체 워크플로우 대체"
**Brief line 439**: "기존 485 API 변경 — Zero Regression 절대 규칙" (Out of Scope)
**Brief line 452**: Go/No-Go #1: "기존 485 API 전부 smoke-test 200 OK"

**Actual code** (`packages/server/src/routes/workspace/workflows.ts`):
The existing workflow system has **10+ API endpoints**:
- POST `/workflows` (create)
- GET `/workflows` (list)
- GET `/workflows/:id` (detail)
- PUT `/workflows/:id` (update)
- DELETE `/workflows/:id` (delete)
- POST `/workflows/:id/execute` (execute)
- POST `/workflows/suggestions/:id/accept`
- POST `/workflows/suggestions/:id/reject`
- POST `/workflows/analyze`
- GET `/workflows/:id/executions` (history)

When n8n replaces the workflow system, these 10+ endpoints become **functionally dead**. They'll still return 200 OK (the routes exist), but they serve a deprecated feature.

This creates a philosophical contradiction:
- Zero Regression says "485 API 전부 smoke-test 200 OK" ✅ (they'll still respond)
- But n8n "대체" means users shouldn't USE these endpoints anymore
- No deprecation strategy is defined — do we return 200 with a deprecation warning? Remove them? Keep them silently?
- The old workflow tables in the DB will accumulate stale data

The Brief treats "replace workflow with n8n" as a clean swap, but it's actually a **parallel-run + deprecation** scenario that needs explicit lifecycle management.

**Fix**: Add a deprecation strategy for existing workflow API endpoints: Phase 1 (Sprint 2): both systems active, old endpoints return `{ deprecated: true, alternative: '/admin/n8n/...' }`. Phase 2 (post-v3): remove old endpoints. Update the 485 API count accordingly. Add this to Risks table.

---

## Impact Summary

| Issue | Severity | What breaks if unfixed |
|-------|----------|----------------------|
| DA-1: Wrong vector dimension | CRITICAL | Architecture starts with false assumptions. Re-embedding scope vastly underestimated. |
| DA-2: No vector column in agent_memories | CRITICAL | Layer 4 semantic search is impossible without schema change not in scope. Sprint 3 scope explosion. |
| DA-3: v1 parity vs Gemini ban | IMPORTANT | Go/No-Go #10 is a permanent blocker. Gate can never pass as written. |
| DA-4: Workflow API orphaning | IMPORTANT | Zero Regression becomes meaningless if deprecated APIs count as "working". Clean-up debt accumulates. |

---

## Adversarial Meta-Observation

All 4 DA issues share a common root cause: **the Brief was written against ASSUMED code state, not VERIFIED code state**. The pgvector dimension was assumed to be 1536 (it's 768). The agent_memories table was assumed to have vectors (it doesn't). The v1 feature list was assumed to be fully compatible with v3 constraints (it isn't). The workflow replacement was assumed to be clean (it creates orphans).

Cycle 1 caught errors that were visible from reading the document (stale refs, missing sections). The DA review caught errors that are only visible when you **read the code** against the document's claims. This is a pattern the PRD and Architecture stages should avoid — every technical claim should be code-verified, not assumed.
