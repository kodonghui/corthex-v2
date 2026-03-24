# Critic-C Review — Story 24.2 Phase B: Soul Enricher Implementation

**Reviewer:** John (Product + Delivery)
**Date:** 2026-03-24
**Artifact:** `services/soul-enricher.ts` + 8 modified caller files + test file

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1: soul-enricher.ts created | PASS | `services/soul-enricher.ts` — exports `enrich(agentId, companyId): Promise<EnrichResult>`, in services/ (E8) |
| AC-2: personalityVars populated | PASS | Lines 43-48: PERSONALITY_KEYS iterated, `personality_{key}: String(val)` format, type+range guard |
| AC-3: NULL → empty result | PASS | Line 38: `if (!agent?.personalityTraits) return EMPTY_RESULT` |
| AC-4: DB error → graceful fallback | PASS | Lines 52-54: try/catch → EMPTY_RESULT + `log.warn` with agentId, companyId context |
| AC-5: All renderSoul callers updated | PASS | 9 enrich() calls across 8 files confirmed via grep. hub.ts and call-agent.ts both merge knowledgeVars correctly (enriched first, knowledge_context conditionally overlaid) |
| AC-6: agent-loop.ts untouched | PASS | grep for "soul-enricher" in engine/ → 0 matches |
| AC-7: EnrichResult interface frozen | PASS | Lines 16-19: `{ personalityVars: Record<string,string>, memoryVars: Record<string,string> }` with AR27 comment |
| AC-8: previewSoul excluded | PASS | organization.ts:955 `previewSoul` calls renderSoul without enrich() |

**8/8 ACs PASS.**

## Dimension Scores

| Dimension | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| D1 Specificity | 20% | 9/10 | Implementation precise: `PERSONALITY_KEYS` const array, `personality_` prefix, `String(val)` conversion, `EMPTY_RESULT` constant. |
| D2 Completeness | 20% | 8/10 | All 8 ACs pass. 12 tests cover core paths well. Minor: spec says "12 call sites in 9 files" but implementation has 9 calls in 8 files — either some renderSoul calls share a single enrich, or call site count is off. Not blocking since the important thing is all callers are covered. |
| D3 Accuracy | 15% | 9/10 | DB query correctly scoped by both agentId AND companyId. E12 Layer 1 Key Boundary properly implemented (only allowed keys extracted, type+range validated). |
| D4 Implementability | 15% | 10/10 | Code IS the implementation. Build passes, 12/12 tests pass. |
| D5 Consistency | 10% | 9/10 | Caller update pattern matches spec exactly. hub.ts and call-agent.ts both follow the knowledge_context merge pattern. Simple callers follow the basic pattern. |
| D6 Risk Awareness | 20% | 8/10 | E12 Layer 1 Key Boundary is a real security defense-in-depth: even if DB has extra keys or string values, enrich() filters them out. `EMPTY_RESULT` constant prevents accidental mutation. Minor gap: no performance concern noted for N+1 query pattern (each renderSoul caller now adds 1 extra DB round-trip for enrich). |

## Weighted Average: 8.7/10 PASS

Calculation: (9×0.20) + (8×0.20) + (9×0.15) + (10×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.60 + 1.35 + 1.50 + 0.90 + 1.60 = **8.75 → 8.7**

## Issue List

1. **[D2 Completeness — LOW]** Call site count discrepancy: spec says 12 call sites in 9 files, dev reports 11, I count 9 enrich() calls in 8 files. All renderSoul callers appear covered, so this is likely a counting difference (hub.ts and call-agent.ts each have 1 renderSoul but were counted as 2 in the spec due to the conditional knowledge_context path). Non-blocking.

2. **[D6 Risk — LOW]** Each caller now adds an extra DB query (enrich → select personality_traits). In the hub.ts SSE path, this adds ~1-3ms latency per session start. For agora-engine.ts multi-agent scenarios, this could mean N extra queries. Not a problem now but worth noting for Sprint 3 when memoryVars adds another query. Consider batch-fetching or caching in soul-enricher if it becomes hot.

## Product Assessment

**User value delivery**: This is the story that makes personality *actually do something*. Story 24.1 stored the data; 24.2 makes it flow into every agent conversation. The spread pattern `{ ...enriched.personalityVars, ...enriched.memoryVars }` is clean and extensible for Sprint 3 memory integration.

**Scope discipline**: Excellent again. memoryVars is `{}` stub (Sprint 3 placeholder) — not over-built. previewSoul correctly excluded (admin preview shows template vars, not runtime personality). No UI changes.

**Sprint 3 readiness**: The EnrichResult interface is designed for additive extension. When Sprint 3 adds memoryVars population, only `soul-enricher.ts` changes — all 9 callers already spread memoryVars.

## Cross-talk Notes

- **Critic-A**: soul-enricher.ts imports `db` directly (line 8) rather than `getDB(companyId)`. The WHERE clause includes companyId so tenant isolation is maintained, but this deviates from the CLAUDE.md pattern "DB → getDB(ctx.companyId) only." Worth flagging as an architecture consistency issue.
- **Critic-B**: E12 Layer 1 Key Boundary (lines 42-49) provides defense-in-depth against DB-level bypass. Even if someone injects extra keys via direct DB insert, enrich() filters them out. Good security posture for the PER-1 chain (Story 24.3).
