# Context Snapshot — Stage 1, Step 03 Integration Patterns
Date: 2026-03-20
Pipeline: /kdh-full-auto-pipeline planning (v9.0)
Project: CORTHEX v3 "OpenClaw"

---

## Step 03 Outcome

**Status**: ✅ PASS (avg 8.98/10 — Stage 1 highest)

| Critic | Initial | Verified | Note |
|--------|---------|----------|------|
| Winston | 8.50 ✅ | 9.20 ✅ | cosineDistance fix, trait range, healthcheck, embedding retry |
| John | 7.90 ✅ | 9.00 ✅ | Trait scale decision (0-100 integer), observation lifecycle |
| Quinn | 8.00 ✅ | 8.75 ✅ | Range conflict, cosineDistance import, importance unification |

## Key Deliverables

- 8 sections covering all 6 domain integration patterns + cross-domain + carry-forward
- PixiJS: @pixi/react v8 `<Application>` + `extend()` + `useTick`, /ws/office WS channel protocol
- n8n: Docker compose (healthcheck, resource limits, API-only), Hono `proxy()` helper, webhook sync mode
- Big Five: personality-injector.ts in services/, 4-layer sanitization integration, 0-100 integer scale
- Memory: 3-phase flow (Observation→Reflection→Planning), Park et al. retrieval formula (recency+importance+relevance), pgvector HNSW via custom `db/pgvector.ts`
- Cross-domain: EventBus extension map, shared type additions, 3 additive migrations, API route structure
- Carry-forward: 9 items for Step 4

## Architecture Decisions Made

1. **Big Five scale: 0-100 integer** — BIG5-CHAT/Big5-Scaler aligned. Brief §4 "0.0~1.0" overridden with rationale (research papers, LLM comprehension, integer precision, zero conversion layers).
2. **cosineDistance**: Custom helper at `db/pgvector.ts:33` — NOT drizzle-orm built-in. Proven in Epic 10 (288 tests).
3. **Observation importance: 1-10** (Park et al. standard). Reflection threshold: sum > 150.
4. **Importance scoring**: Haiku LLM call per observation.
5. **Embedding failure**: INSERT with NULL, backfill cron retries.

## Fixes Applied

Total ~14 issues across 2 rounds:
- Big Five trait range: 0.0-1.0 → 0-100 integer (cross-talk PM+Architect decision)
- cosineDistance import: `drizzle-orm/pg-core` → `../db/pgvector` (custom helper)
- Observation importance: 0-100 default 50 → 1-10 default 5 (Park et al.)
- n8n Docker healthcheck added
- Observation embedding retry mechanism
- Importance auto-scoring algorithm defined (Haiku call)
- Step 4 outline "3-layer" → "4-layer"
- Observation lifecycle 3 sub-risks (Neon Pro, cron failure, 90-day TTL)
- Brief §4 annotation carry-forward added

## Carry-Forward to Step 4 (9 items)

1. Layer C regex `[^}]+` → `\w+` — soul template DB audit
2. Go/No-Go #2 key-aware fallback — personality vars warning + default
3. /ws/office message rate limiting
4. n8n workflow isolation by company — enforcement mechanism
5. Reflection LLM model selection — Haiku vs Sonnet cost ceiling
6. Observation lifecycle — Neon Pro, cron failure backlog + ARGOS alerting, 90-day TTL
7. Embedding backfill cron — cadence + max retries
8. Brief §4 trait scale annotation — "0.0~1.0" → "0-100 integer" update

## Output File

`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`
Step 3 section: Integration Patterns (8 sub-sections, ~500 lines)
